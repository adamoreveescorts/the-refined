
-- Update the handle_new_user function to extract phone number from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    role,
    username,
    phone,
    payment_status,
    is_active,
    status
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
    NEW.raw_user_meta_data->>'mobile_number',
    (CASE
      WHEN NEW.raw_user_meta_data->>'role' IN ('escort', 'agency') THEN 'pending'
      ELSE 'completed'
    END),
    TRUE, -- Make all profiles active immediately
    'approved' -- Make all profiles approved immediately
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
