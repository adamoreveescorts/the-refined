
-- Update agency_subscriptions table to support new package structure
ALTER TABLE public.agency_subscriptions 
ADD COLUMN IF NOT EXISTS package_type integer,
ADD COLUMN IF NOT EXISTS max_profiles integer,
ADD COLUMN IF NOT EXISTS package_name text;

-- Update existing records to have default values
UPDATE public.agency_subscriptions 
SET 
  package_type = 2,
  max_profiles = 12,
  package_name = 'Package 2'
WHERE package_type IS NULL;

-- Make the new columns not nullable after setting defaults
ALTER TABLE public.agency_subscriptions 
ALTER COLUMN package_type SET NOT NULL,
ALTER COLUMN max_profiles SET NOT NULL,
ALTER COLUMN package_name SET NOT NULL;

-- Add check constraint for valid package types
ALTER TABLE public.agency_subscriptions 
ADD CONSTRAINT valid_package_type CHECK (package_type >= 1 AND package_type <= 4);

-- Update the update_agency_used_seats function to work with profile limits instead of seats
CREATE OR REPLACE FUNCTION public.update_agency_used_profiles()
RETURNS TRIGGER AS $$
BEGIN
  -- Update used_seats count (rename to used_profiles conceptually) for the agency
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

-- Update the trigger to use the new function
DROP TRIGGER IF EXISTS update_agency_seats_trigger ON public.profiles;
CREATE TRIGGER update_agency_profiles_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agency_used_profiles();
