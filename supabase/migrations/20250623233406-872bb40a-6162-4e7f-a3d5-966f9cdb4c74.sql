
-- Add profile completion tracking fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS profile_completion_percentage integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS setup_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_step_completed jsonb DEFAULT '{}';

-- Create a function to calculate profile completion percentage
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(profile_id uuid)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  completion_score integer := 0;
  profile_record record;
BEGIN
  SELECT * INTO profile_record FROM public.profiles WHERE id = profile_id;
  
  IF profile_record IS NULL THEN
    RETURN 0;
  END IF;
  
  -- Basic info (40 points total)
  IF profile_record.display_name IS NOT NULL AND profile_record.display_name != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.bio IS NOT NULL AND profile_record.bio != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.location IS NOT NULL AND profile_record.location != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  IF profile_record.age IS NOT NULL AND profile_record.age != '' THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Photos (30 points total)
  IF profile_record.profile_picture IS NOT NULL AND profile_record.profile_picture != '' THEN
    completion_score := completion_score + 20;
  END IF;
  
  IF profile_record.gallery_images IS NOT NULL AND array_length(profile_record.gallery_images, 1) > 0 THEN
    completion_score := completion_score + 10;
  END IF;
  
  -- Verification (20 points)
  IF profile_record.verified = true THEN
    completion_score := completion_score + 20;
  END IF;
  
  -- Services & Rates (10 points)
  IF profile_record.services IS NOT NULL AND profile_record.services != '' THEN
    completion_score := completion_score + 5;
  END IF;
  
  IF profile_record.hourly_rate IS NOT NULL AND profile_record.hourly_rate != '' THEN
    completion_score := completion_score + 5;
  END IF;
  
  RETURN completion_score;
END;
$$;

-- Create trigger to automatically update completion percentage
CREATE OR REPLACE FUNCTION public.update_profile_completion()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  new_completion integer;
BEGIN
  new_completion := public.calculate_profile_completion(NEW.id);
  
  NEW.profile_completion_percentage := new_completion;
  NEW.setup_completed := (new_completion >= 70);
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_profile_completion ON public.profiles;
CREATE TRIGGER trigger_update_profile_completion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_completion();
