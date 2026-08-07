-- 1. Product lifetime warranty flag
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS has_lifetime_warranty boolean NOT NULL DEFAULT false;

UPDATE public.products p
SET has_lifetime_warranty = true
FROM public.categories c
WHERE p.category_id = c.id
  AND c.slug IN ('chargers', 'earphones', 'accessories');

-- 2. Warranty claims table
CREATE TABLE public.warranty_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_number text NOT NULL,
  user_phone text NOT NULL,
  customer_name text NOT NULL,
  product_name text NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  purchase_source text NOT NULL DEFAULT 'online',
  order_number text,
  bill_number text,
  store_name text,
  purchase_date date,
  issue_description text NOT NULL,
  photos jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'Pending',
  admin_notes text,
  resolution text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX warranty_claims_claim_number_key ON public.warranty_claims(claim_number);
CREATE INDEX warranty_claims_user_phone_idx ON public.warranty_claims(user_phone);

GRANT ALL ON public.warranty_claims TO service_role;

ALTER TABLE public.warranty_claims ENABLE ROW LEVEL SECURITY;
-- No client-facing policies: all access goes through SECURITY DEFINER functions below.

-- 3. Claim number generator
CREATE OR REPLACE FUNCTION public.generate_warranty_number()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.claim_number IS NULL OR NEW.claim_number = '' THEN
    NEW.claim_number := 'WAR' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_warranty_number
BEFORE INSERT ON public.warranty_claims
FOR EACH ROW EXECUTE FUNCTION public.generate_warranty_number();

CREATE TRIGGER update_warranty_claims_updated_at
BEFORE UPDATE ON public.warranty_claims
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Create a claim
CREATE OR REPLACE FUNCTION public.create_warranty_claim(
  _user_phone text,
  _customer_name text,
  _product_name text,
  _issue_description text,
  _purchase_source text DEFAULT 'online',
  _product_id uuid DEFAULT NULL,
  _order_number text DEFAULT NULL,
  _bill_number text DEFAULT NULL,
  _store_name text DEFAULT NULL,
  _purchase_date date DEFAULT NULL,
  _photos jsonb DEFAULT '[]'::jsonb
)
RETURNS public.warranty_claims
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.warranty_claims;
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF _customer_name IS NULL OR char_length(trim(_customer_name)) = 0 OR char_length(_customer_name) > 120 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF _product_name IS NULL OR char_length(trim(_product_name)) = 0 OR char_length(_product_name) > 200 THEN
    RAISE EXCEPTION 'Invalid product name';
  END IF;
  IF _issue_description IS NULL OR char_length(trim(_issue_description)) < 5 OR char_length(_issue_description) > 2000 THEN
    RAISE EXCEPTION 'Please describe the issue (5-2000 characters)';
  END IF;
  IF _purchase_source NOT IN ('online', 'offline') THEN
    RAISE EXCEPTION 'Invalid purchase source';
  END IF;
  IF _purchase_source = 'online' AND (_order_number IS NULL OR char_length(trim(_order_number)) = 0) THEN
    RAISE EXCEPTION 'Order number is required for online purchases';
  END IF;
  IF _purchase_source = 'offline' AND (_bill_number IS NULL OR char_length(trim(_bill_number)) = 0 OR _purchase_date IS NULL) THEN
    RAISE EXCEPTION 'Bill number and purchase date are required for store purchases';
  END IF;
  IF _purchase_date IS NOT NULL AND _purchase_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Purchase date cannot be in the future';
  END IF;
  IF jsonb_typeof(_photos) <> 'array' OR jsonb_array_length(_photos) > 5 THEN
    RAISE EXCEPTION 'Up to 5 photos allowed';
  END IF;

  INSERT INTO public.warranty_claims (
    claim_number, user_phone, customer_name, product_name, product_id,
    purchase_source, order_number, bill_number, store_name, purchase_date,
    issue_description, photos, status
  ) VALUES (
    '', _user_phone, trim(_customer_name), trim(_product_name), _product_id,
    _purchase_source, NULLIF(trim(coalesce(_order_number,'')),''), NULLIF(trim(coalesce(_bill_number,'')),''),
    NULLIF(trim(coalesce(_store_name,'')),''), _purchase_date,
    _issue_description, _photos, 'Pending'
  ) RETURNING * INTO _row;

  RETURN _row;
END;
$$;

-- 5. Customer lookup by phone
CREATE OR REPLACE FUNCTION public.get_warranty_claims_by_phone(_user_phone text)
RETURNS SETOF public.warranty_claims
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  RETURN QUERY
    SELECT * FROM public.warranty_claims
    WHERE user_phone = _user_phone
    ORDER BY created_at DESC;
END;
$$;

-- 6. Admin list
CREATE OR REPLACE FUNCTION public.admin_list_warranty_claims(_admin_phone text)
RETURNS SETOF public.warranty_claims
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.warranty_claims ORDER BY created_at DESC;
END;
$$;

-- 7. Admin update
CREATE OR REPLACE FUNCTION public.admin_update_warranty_claim(
  _admin_phone text,
  _id uuid,
  _status text,
  _admin_notes text DEFAULT NULL,
  _resolution text DEFAULT NULL
)
RETURNS public.warranty_claims
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row public.warranty_claims;
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF _status NOT IN ('Pending', 'Under Review', 'Approved', 'Rejected', 'Replaced') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.warranty_claims
  SET status = _status,
      admin_notes = COALESCE(_admin_notes, admin_notes),
      resolution = COALESCE(_resolution, resolution)
  WHERE id = _id
  RETURNING * INTO _row;

  IF _row.id IS NULL THEN
    RAISE EXCEPTION 'Claim not found';
  END IF;

  RETURN _row;
END;
$$;