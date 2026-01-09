-- Enable realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- Ensure admin can delete products (in case the policy doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' 
    AND policyname = 'Admins can delete products'
  ) THEN
    CREATE POLICY "Admins can delete products" 
    ON public.products 
    FOR DELETE 
    USING (
      EXISTS (
        SELECT 1 FROM user_roles
        WHERE user_roles.user_phone = current_setting('app.current_user_phone', true)
        AND user_roles.role = 'admin'
      )
    );
  END IF;
END $$;