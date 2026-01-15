-- Add policy for admins to view all banners (including inactive ones)
CREATE POLICY "Admins can view all banners" 
ON public.banners 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_phone = current_setting('app.current_user_phone', true) 
  AND user_roles.role = 'admin'
));