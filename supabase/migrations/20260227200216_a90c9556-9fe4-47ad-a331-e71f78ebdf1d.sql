
-- Admin CRUD for categories
CREATE OR REPLACE FUNCTION public.admin_insert_category(_admin_phone text, _category_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _result RECORD;
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  INSERT INTO public.categories (name, slug, description, icon, image, parent_id)
  VALUES (
    _category_data->>'name',
    _category_data->>'slug',
    NULLIF(_category_data->>'description', ''),
    NULLIF(_category_data->>'icon', ''),
    NULLIF(_category_data->>'image', ''),
    NULLIF(_category_data->>'parent_id', '')::uuid
  ) RETURNING id INTO _result;
  RETURN jsonb_build_object('success', true, 'id', _result.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_category(_admin_phone text, _category_id uuid, _category_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  UPDATE public.categories SET
    name = _category_data->>'name',
    slug = _category_data->>'slug',
    description = NULLIF(_category_data->>'description', ''),
    icon = NULLIF(_category_data->>'icon', ''),
    image = NULLIF(_category_data->>'image', ''),
    parent_id = NULLIF(_category_data->>'parent_id', '')::uuid,
    updated_at = now()
  WHERE id = _category_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_category(_admin_phone text, _category_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  DELETE FROM public.categories WHERE id = _category_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Admin CRUD for banners
CREATE OR REPLACE FUNCTION public.admin_insert_banner(_admin_phone text, _banner_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE _result RECORD;
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  INSERT INTO public.banners (title, image_url, link, is_active, display_order)
  VALUES (
    _banner_data->>'title',
    _banner_data->>'image_url',
    NULLIF(_banner_data->>'link', ''),
    COALESCE((_banner_data->>'is_active')::boolean, true),
    COALESCE((_banner_data->>'display_order')::int, 0)
  ) RETURNING id INTO _result;
  RETURN jsonb_build_object('success', true, 'id', _result.id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_banner(_admin_phone text, _banner_id uuid, _banner_data jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  UPDATE public.banners SET
    title = _banner_data->>'title',
    image_url = _banner_data->>'image_url',
    link = NULLIF(_banner_data->>'link', ''),
    is_active = COALESCE((_banner_data->>'is_active')::boolean, true),
    display_order = COALESCE((_banner_data->>'display_order')::int, 0),
    updated_at = now()
  WHERE id = _banner_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_banner(_admin_phone text, _banner_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  DELETE FROM public.banners WHERE id = _banner_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- Admin update order status
CREATE OR REPLACE FUNCTION public.admin_update_order_status(_admin_phone text, _order_id uuid, _new_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  UPDATE public.orders SET status = _new_status, updated_at = now() WHERE id = _order_id;
  RETURN jsonb_build_object('success', true);
END;
$$;
