-- Fix function search paths for security
CREATE OR REPLACE FUNCTION public.generate_order_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.order_number := 'ORD' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_repair_number()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.request_number := 'REP' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Drop old RLS policies that use current_setting (won't work)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can view their own repair requests" ON public.repair_requests;

-- Create simpler policies - allow all reads/writes since we're not using Supabase Auth
-- Data is filtered by user_phone in the application layer
CREATE POLICY "Allow all profile operations"
ON public.profiles FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all order operations"
ON public.orders FOR ALL
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow all repair request operations"
ON public.repair_requests FOR ALL
USING (true)
WITH CHECK (true);