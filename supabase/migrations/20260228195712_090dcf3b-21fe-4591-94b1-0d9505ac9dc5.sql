
-- Update admin_insert_product to include brand_id
CREATE OR REPLACE FUNCTION public.admin_insert_product(_admin_phone text, _product_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _result RECORD;
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  INSERT INTO public.products (
    name, slug, description, short_description, price, original_price,
    discount_percentage, category_id, brand_id, sku, stock_quantity,
    is_featured, is_new, is_bestseller, images
  ) VALUES (
    _product_data->>'name',
    _product_data->>'slug',
    _product_data->>'description',
    _product_data->>'short_description',
    (_product_data->>'price')::numeric,
    NULLIF(_product_data->>'original_price', 'null')::numeric,
    COALESCE((_product_data->>'discount_percentage')::int, 0),
    NULLIF(_product_data->>'category_id', 'null')::uuid,
    NULLIF(_product_data->>'brand_id', 'null')::uuid,
    _product_data->>'sku',
    COALESCE((_product_data->>'stock_quantity')::int, 0),
    COALESCE((_product_data->>'is_featured')::boolean, false),
    COALESCE((_product_data->>'is_new')::boolean, false),
    COALESCE((_product_data->>'is_bestseller')::boolean, false),
    COALESCE(_product_data->'images', '[]'::jsonb)
  )
  RETURNING id INTO _result;

  RETURN jsonb_build_object('success', true, 'id', _result.id);
END;
$function$;

-- Update admin_update_product to include brand_id
CREATE OR REPLACE FUNCTION public.admin_update_product(_admin_phone text, _product_id uuid, _product_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;

  UPDATE public.products SET
    name = _product_data->>'name',
    slug = _product_data->>'slug',
    description = _product_data->>'description',
    short_description = _product_data->>'short_description',
    price = (_product_data->>'price')::numeric,
    original_price = NULLIF(_product_data->>'original_price', 'null')::numeric,
    discount_percentage = COALESCE((_product_data->>'discount_percentage')::int, 0),
    category_id = NULLIF(_product_data->>'category_id', 'null')::uuid,
    brand_id = NULLIF(_product_data->>'brand_id', 'null')::uuid,
    sku = _product_data->>'sku',
    stock_quantity = COALESCE((_product_data->>'stock_quantity')::int, 0),
    is_featured = COALESCE((_product_data->>'is_featured')::boolean, false),
    is_new = COALESCE((_product_data->>'is_new')::boolean, false),
    is_bestseller = COALESCE((_product_data->>'is_bestseller')::boolean, false),
    images = COALESCE(_product_data->'images', '[]'::jsonb),
    updated_at = now()
  WHERE id = _product_id;

  RETURN jsonb_build_object('success', true);
END;
$function$;
