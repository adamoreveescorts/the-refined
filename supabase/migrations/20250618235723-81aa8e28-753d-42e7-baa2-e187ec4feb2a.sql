
-- Update RLS policies to allow agencies to create and manage escort profiles

-- Add policy for agencies to create escort profiles
CREATE POLICY "Agencies can create escort profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'agency')) 
    AND (role = 'escort') 
    AND (agency_id = auth.uid())
  );

-- Add policy for agencies to update their escorts' profiles
CREATE POLICY "Agencies can update their escorts profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    (agency_id = auth.uid()) 
    AND (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'agency'))
  );

-- Add policy for agencies to view their escorts' profiles
CREATE POLICY "Agencies can view their escorts profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    (agency_id = auth.uid()) 
    AND (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'agency'))
  );

-- Update the agency_escorts trigger function to work with direct profile creation
CREATE OR REPLACE FUNCTION public.update_agency_used_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update used_seats count for the agency based on active escort profiles
  UPDATE public.agency_subscriptions 
  SET used_seats = (
    SELECT COUNT(*) 
    FROM public.profiles 
    WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id) 
    AND role = 'escort'
    AND status = 'approved'
  ),
  updated_at = now()
  WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update seat counts when escort profiles are created/updated/deleted
-- Fix: Remove WHEN clause and handle logic inside the function
DROP TRIGGER IF EXISTS update_agency_seats_on_profile_trigger ON public.profiles;
CREATE TRIGGER update_agency_seats_on_profile_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agency_used_seats();
