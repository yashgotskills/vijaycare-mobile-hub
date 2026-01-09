-- Create function to set session config for RLS
CREATE OR REPLACE FUNCTION public.set_user_context(user_phone text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM set_config('app.current_user_phone', user_phone, false);
END;
$$;

-- Allow admins to manage categories
CREATE POLICY "Admins can insert categories" 
ON public.categories 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_phone = current_setting('app.current_user_phone', true)
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can update categories" 
ON public.categories 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_phone = current_setting('app.current_user_phone', true)
    AND user_roles.role = 'admin'
  )
);

CREATE POLICY "Admins can delete categories" 
ON public.categories 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_phone = current_setting('app.current_user_phone', true)
    AND user_roles.role = 'admin'
  )
);