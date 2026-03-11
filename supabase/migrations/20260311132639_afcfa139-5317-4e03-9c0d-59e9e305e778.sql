
-- Create device_models table
CREATE TABLE public.device_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  brand_id uuid REFERENCES public.brands(id) ON DELETE SET NULL,
  image text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Device models viewable by everyone" ON public.device_models
  FOR SELECT TO public USING (true);

-- Create product_models junction table
CREATE TABLE public.product_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  model_id uuid NOT NULL REFERENCES public.device_models(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, model_id)
);

ALTER TABLE public.product_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product models viewable by everyone" ON public.product_models
  FOR SELECT TO public USING (true);

-- Trigger for updated_at on device_models
CREATE TRIGGER update_device_models_updated_at
  BEFORE UPDATE ON public.device_models
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RPC: admin_insert_model
CREATE OR REPLACE FUNCTION public.admin_insert_model(_admin_phone text, _model_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _result RECORD;
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  INSERT INTO public.device_models (name, slug, brand_id, image)
  VALUES (
    _model_data->>'name',
    _model_data->>'slug',
    NULLIF(_model_data->>'brand_id', '')::uuid,
    NULLIF(_model_data->>'image', '')
  ) RETURNING id INTO _result;
  RETURN jsonb_build_object('success', true, 'id', _result.id);
END;
$$;

-- RPC: admin_update_model
CREATE OR REPLACE FUNCTION public.admin_update_model(_admin_phone text, _model_id uuid, _model_data jsonb)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  UPDATE public.device_models SET
    name = _model_data->>'name',
    slug = _model_data->>'slug',
    brand_id = NULLIF(_model_data->>'brand_id', '')::uuid,
    image = NULLIF(_model_data->>'image', ''),
    updated_at = now()
  WHERE id = _model_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: admin_delete_model
CREATE OR REPLACE FUNCTION public.admin_delete_model(_admin_phone text, _model_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  DELETE FROM public.device_models WHERE id = _model_id;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: admin_assign_product_to_model
CREATE OR REPLACE FUNCTION public.admin_assign_product_to_model(_admin_phone text, _product_id uuid, _model_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  INSERT INTO public.product_models (product_id, model_id)
  VALUES (_product_id, _model_id)
  ON CONFLICT (product_id, model_id) DO NOTHING;
  RETURN jsonb_build_object('success', true);
END;
$$;

-- RPC: admin_unassign_product_from_model
CREATE OR REPLACE FUNCTION public.admin_unassign_product_from_model(_admin_phone text, _product_id uuid, _model_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(_admin_phone, 'admin') THEN
    RETURN jsonb_build_object('success', false, 'error', 'Not authorized');
  END IF;
  DELETE FROM public.product_models WHERE product_id = _product_id AND model_id = _model_id;
  RETURN jsonb_build_object('success', true);
END;
$$;
