
-- Admin function to list ALL banners (including inactive)
CREATE OR REPLACE FUNCTION public.admin_list_banners(_admin_phone text)
RETURNS SETOF public.banners
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  RETURN QUERY SELECT * FROM public.banners ORDER BY display_order ASC;
END;
$$;

-- Admin function to update repair request status
CREATE OR REPLACE FUNCTION public.admin_update_repair_status(_admin_phone text, _repair_id uuid, _new_status text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  UPDATE public.repair_requests SET status = _new_status, updated_at = now() WHERE id = _repair_id;
  RETURN jsonb_build_object('success', true);
END;
$$;
