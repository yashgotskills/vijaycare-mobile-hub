-- Add RLS policies for admin product management
CREATE POLICY "Admins can insert products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_phone = current_setting('app.current_user_phone', true)
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_phone = current_setting('app.current_user_phone', true)
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_phone = current_setting('app.current_user_phone', true)
    AND role = 'admin'
  )
);

-- Add RLS policy for admin to update repair requests
CREATE POLICY "Admins can update repair requests"
ON public.repair_requests
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_phone = current_setting('app.current_user_phone', true)
    AND role = 'admin'
  )
);