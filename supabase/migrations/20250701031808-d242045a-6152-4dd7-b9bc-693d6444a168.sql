
-- Add country_code column to profiles table if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country_code text;

-- Update the handle_new_user function to properly save mobile number and country code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role,
    username,
    payment_status,
    is_active,
    status,
    phone,
    country_code
  )
  VALUES (
    NEW.id, 
    NEW.email,
    (CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'escort' THEN 'escort'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'agency' THEN 'agency'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'client' THEN 'client'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      ELSE 'client'::user_role 
    END),
    NEW.raw_user_meta_data->>'username',
    (CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('escort', 'agency') THEN 'pending'
      ELSE 'completed'
    END),
    TRUE,
    'approved',
    NEW.raw_user_meta_data->>'mobile_number',
    NEW.raw_user_meta_data->>'country_code'
  );
  RETURN NEW;
END;
$$;
