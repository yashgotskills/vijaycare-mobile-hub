-- =========================================================
-- 1. Drop overly permissive policies
-- =========================================================
DROP POLICY IF EXISTS "Allow all order operations" ON public.orders;
DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;

DROP POLICY IF EXISTS "Allow all repair request operations" ON public.repair_requests;
DROP POLICY IF EXISTS "Anyone can insert repair requests" ON public.repair_requests;
DROP POLICY IF EXISTS "Admins can update repair requests" ON public.repair_requests;

DROP POLICY IF EXISTS "Allow all push subscription operations" ON public.push_subscriptions;

DROP POLICY IF EXISTS "Allow all profile operations" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can create addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.addresses;

DROP POLICY IF EXISTS "Active coupons are viewable" ON public.coupons;

DROP POLICY IF EXISTS "Users can update their own reviews" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can create reviews" ON public.reviews;

DROP POLICY IF EXISTS "Users can delete their recently viewed" ON public.recently_viewed;
DROP POLICY IF EXISTS "Users can add to recently viewed" ON public.recently_viewed;

-- Make sure RLS stays on everywhere
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recently_viewed ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- 2. Validated (non-permissive) write policies where direct writes are still needed
-- =========================================================
CREATE POLICY "Reviews can be created with valid data"
ON public.reviews FOR INSERT TO anon, authenticated
WITH CHECK (
  user_phone ~ '^[0-9]{10}$'
  AND rating BETWEEN 1 AND 5
  AND (comment IS NULL OR char_length(comment) <= 2000)
  AND (title IS NULL OR char_length(title) <= 120)
  AND (user_name IS NULL OR char_length(user_name) <= 60)
  AND is_verified = false
);

CREATE POLICY "Recently viewed can be added with valid phone"
ON public.recently_viewed FOR INSERT TO anon, authenticated
WITH CHECK (user_phone ~ '^[0-9]{10}$');

-- =========================================================
-- 3. Helper: phone validation
-- =========================================================
CREATE OR REPLACE FUNCTION public.is_valid_phone(_phone text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  SELECT _phone IS NOT NULL AND _phone ~ '^[0-9]{10}$'
$$;

-- =========================================================
-- 4. Orders
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_order(
  _user_phone text,
  _items jsonb,
  _total_amount numeric,
  _delivery_address jsonb,
  _payment_method text
)
RETURNS public.orders
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _row public.orders;
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF _items IS NULL OR jsonb_typeof(_items) <> 'array' OR jsonb_array_length(_items) = 0 THEN
    RAISE EXCEPTION 'Order must contain items';
  END IF;
  IF _total_amount IS NULL OR _total_amount < 0 OR _total_amount > 10000000 THEN
    RAISE EXCEPTION 'Invalid order amount';
  END IF;
  IF _payment_method IS NULL OR char_length(_payment_method) > 40 THEN
    RAISE EXCEPTION 'Invalid payment method';
  END IF;

  INSERT INTO public.orders (order_number, user_phone, items, total_amount, status, delivery_address, payment_method)
  VALUES ('', _user_phone, _items, _total_amount, 'Processing', _delivery_address, _payment_method)
  RETURNING * INTO _row;

  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_orders_by_phone(_user_phone text)
RETURNS SETOF public.orders
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  RETURN QUERY
    SELECT * FROM public.orders
    WHERE user_phone = _user_phone
    ORDER BY created_at DESC;
END;
$$;

-- Public order tracking: only non-sensitive fields, no phone/address
CREATE OR REPLACE FUNCTION public.get_order_tracking(_order_number text)
RETURNS TABLE (
  id uuid,
  order_number text,
  status text,
  total_amount numeric,
  items jsonb,
  payment_method text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _order_number IS NULL OR char_length(_order_number) < 6 OR char_length(_order_number) > 40 THEN
    RAISE EXCEPTION 'Invalid order number';
  END IF;
  RETURN QUERY
    SELECT o.id, o.order_number, o.status, o.total_amount, o.items,
           o.payment_method, o.created_at, o.updated_at
    FROM public.orders o
    WHERE o.order_number = _order_number;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_orders(_admin_phone text)
RETURNS SETOF public.orders
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.orders ORDER BY created_at DESC;
END;
$$;

-- =========================================================
-- 5. Repair requests
-- =========================================================
CREATE OR REPLACE FUNCTION public.create_repair_request(
  _user_phone text,
  _customer_name text,
  _device_type text,
  _brand text,
  _model text,
  _repair_type text,
  _issue_description text,
  _address text,
  _preferred_date text,
  _preferred_time text
)
RETURNS public.repair_requests
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _row public.repair_requests;
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF _customer_name IS NULL OR char_length(trim(_customer_name)) = 0 OR char_length(_customer_name) > 120 THEN
    RAISE EXCEPTION 'Invalid customer name';
  END IF;
  IF _address IS NULL OR char_length(_address) > 500 THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;
  IF _issue_description IS NOT NULL AND char_length(_issue_description) > 2000 THEN
    RAISE EXCEPTION 'Issue description too long';
  END IF;

  INSERT INTO public.repair_requests (
    request_number, user_phone, customer_name, device_type, brand, model,
    repair_type, issue_description, address, preferred_date, preferred_time, status
  ) VALUES (
    '', _user_phone, _customer_name, _device_type, _brand, _model,
    _repair_type, _issue_description, _address, _preferred_date, _preferred_time, 'Pending'
  ) RETURNING * INTO _row;

  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_repair_requests_by_phone(_user_phone text)
RETURNS SETOF public.repair_requests
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  RETURN QUERY
    SELECT * FROM public.repair_requests
    WHERE user_phone = _user_phone
    ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_list_repair_requests(_admin_phone text)
RETURNS SETOF public.repair_requests
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.repair_requests ORDER BY created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_dashboard_stats(_admin_phone text)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _orders jsonb;
  _repairs jsonb;
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT coalesce(jsonb_agg(jsonb_build_object('status', status, 'total_amount', total_amount)), '[]'::jsonb)
    INTO _orders FROM public.orders;
  SELECT coalesce(jsonb_agg(jsonb_build_object('status', status)), '[]'::jsonb)
    INTO _repairs FROM public.repair_requests;
  RETURN jsonb_build_object('orders', _orders, 'repairs', _repairs);
END;
$$;

-- =========================================================
-- 6. Push subscriptions
-- =========================================================
CREATE OR REPLACE FUNCTION public.save_push_subscription(
  _user_phone text,
  _endpoint text,
  _p256dh text,
  _auth text
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF _endpoint IS NULL OR _endpoint !~ '^https://' OR char_length(_endpoint) > 1000 THEN
    RAISE EXCEPTION 'Invalid endpoint';
  END IF;
  IF _p256dh IS NULL OR _auth IS NULL OR char_length(_p256dh) > 500 OR char_length(_auth) > 500 THEN
    RAISE EXCEPTION 'Invalid subscription keys';
  END IF;

  INSERT INTO public.push_subscriptions (user_phone, endpoint, p256dh, auth)
  VALUES (_user_phone, _endpoint, _p256dh, _auth)
  ON CONFLICT (endpoint) DO UPDATE
    SET user_phone = EXCLUDED.user_phone,
        p256dh = EXCLUDED.p256dh,
        auth = EXCLUDED.auth;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_push_subscription(_endpoint text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _endpoint IS NULL OR char_length(_endpoint) > 1000 THEN
    RAISE EXCEPTION 'Invalid endpoint';
  END IF;
  DELETE FROM public.push_subscriptions WHERE endpoint = _endpoint;
END;
$$;

-- =========================================================
-- 7. Addresses
-- =========================================================
CREATE OR REPLACE FUNCTION public.get_addresses(_user_phone text)
RETURNS SETOF public.addresses
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  RETURN QUERY
    SELECT * FROM public.addresses
    WHERE user_phone = _user_phone
    ORDER BY is_default DESC, created_at DESC;
END;
$$;

CREATE OR REPLACE FUNCTION public.save_address(
  _user_phone text,
  _address_id uuid,
  _label text,
  _full_name text,
  _phone text,
  _address_line1 text,
  _address_line2 text,
  _city text,
  _state text,
  _pincode text,
  _is_default boolean
)
RETURNS public.addresses
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _row public.addresses;
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  IF _full_name IS NULL OR char_length(trim(_full_name)) = 0 OR char_length(_full_name) > 120 THEN
    RAISE EXCEPTION 'Invalid name';
  END IF;
  IF _address_line1 IS NULL OR char_length(_address_line1) > 300 THEN
    RAISE EXCEPTION 'Invalid address';
  END IF;
  IF _pincode IS NULL OR _pincode !~ '^[0-9]{6}$' THEN
    RAISE EXCEPTION 'Invalid pincode';
  END IF;

  IF coalesce(_is_default, false) THEN
    UPDATE public.addresses SET is_default = false WHERE user_phone = _user_phone;
  END IF;

  IF _address_id IS NULL THEN
    INSERT INTO public.addresses (user_phone, label, full_name, phone, address_line1, address_line2, city, state, pincode, is_default)
    VALUES (_user_phone, _label, _full_name, _phone, _address_line1, _address_line2, _city, _state, _pincode, coalesce(_is_default, false))
    RETURNING * INTO _row;
  ELSE
    UPDATE public.addresses SET
      label = _label,
      full_name = _full_name,
      phone = _phone,
      address_line1 = _address_line1,
      address_line2 = _address_line2,
      city = _city,
      state = _state,
      pincode = _pincode,
      is_default = coalesce(_is_default, false)
    WHERE id = _address_id AND user_phone = _user_phone
    RETURNING * INTO _row;

    IF _row.id IS NULL THEN
      RAISE EXCEPTION 'Address not found';
    END IF;
  END IF;

  RETURN _row;
END;
$$;

CREATE OR REPLACE FUNCTION public.delete_address(_user_phone text, _address_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  DELETE FROM public.addresses WHERE id = _address_id AND user_phone = _user_phone;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_default_address(_user_phone text, _address_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_valid_phone(_user_phone) THEN
    RAISE EXCEPTION 'Invalid phone number';
  END IF;
  UPDATE public.addresses SET is_default = false WHERE user_phone = _user_phone;
  UPDATE public.addresses SET is_default = true WHERE id = _address_id AND user_phone = _user_phone;
END;
$$;

-- =========================================================
-- 8. Coupons
-- =========================================================
CREATE OR REPLACE FUNCTION public.validate_coupon(_code text, _subtotal numeric)
RETURNS jsonb
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _c public.coupons;
BEGIN
  IF _code IS NULL OR char_length(_code) > 40 THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid coupon code');
  END IF;

  SELECT * INTO _c FROM public.coupons
  WHERE code = upper(trim(_code)) AND is_active = true
  LIMIT 1;

  IF _c.id IS NULL THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Invalid coupon code');
  END IF;
  IF _c.expires_at IS NOT NULL AND _c.expires_at < now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon has expired');
  END IF;
  IF _c.starts_at IS NOT NULL AND _c.starts_at > now() THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon is not yet active');
  END IF;
  IF _c.max_uses IS NOT NULL AND coalesce(_c.used_count, 0) >= _c.max_uses THEN
    RETURN jsonb_build_object('valid', false, 'error', 'This coupon is no longer available');
  END IF;
  IF _c.min_order_amount IS NOT NULL AND coalesce(_subtotal, 0) < _c.min_order_amount THEN
    RETURN jsonb_build_object('valid', false, 'error',
      'Minimum order amount is Rs.' || _c.min_order_amount::text);
  END IF;

  RETURN jsonb_build_object(
    'valid', true,
    'code', _c.code,
    'description', _c.description,
    'discount_type', _c.discount_type,
    'discount_value', _c.discount_value,
    'min_order_amount', _c.min_order_amount,
    'max_discount_amount', _c.max_discount_amount
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.increment_coupon_usage(_code text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _code IS NULL OR char_length(_code) > 40 THEN
    RETURN;
  END IF;
  UPDATE public.coupons
  SET used_count = coalesce(used_count, 0) + 1
  WHERE code = upper(trim(_code)) AND is_active = true;
END;
$$;

-- =========================================================
-- 9. Execute grants
-- =========================================================
GRANT EXECUTE ON FUNCTION public.is_valid_phone(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order(text, jsonb, numeric, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_orders_by_phone(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_order_tracking(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_orders(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_repair_request(text, text, text, text, text, text, text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_repair_requests_by_phone(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_repair_requests(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_dashboard_stats(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_push_subscription(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_push_subscription(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_addresses(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_address(text, uuid, text, text, text, text, text, text, text, text, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.delete_address(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_default_address(text, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon(text, numeric) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_coupon_usage(text) TO anon, authenticated;