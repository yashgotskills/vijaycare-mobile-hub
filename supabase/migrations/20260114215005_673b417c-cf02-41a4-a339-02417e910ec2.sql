-- Create banners table
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners
CREATE POLICY "Banners are viewable by everyone" 
ON public.banners 
FOR SELECT 
USING (is_active = true);

-- Admins can manage banners
CREATE POLICY "Admins can insert banners" 
ON public.banners 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_phone = current_setting('app.current_user_phone', true) 
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can update banners" 
ON public.banners 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_phone = current_setting('app.current_user_phone', true) 
  AND user_roles.role = 'admin'
));

CREATE POLICY "Admins can delete banners" 
ON public.banners 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_roles.user_phone = current_setting('app.current_user_phone', true) 
  AND user_roles.role = 'admin'
));

-- Create update trigger
CREATE TRIGGER update_banners_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();