
-- Step 1: Drop all existing triggers and functions with CASCADE to clean up dependencies
DROP TRIGGER IF EXISTS update_agency_seats_trigger ON public.agency_escorts CASCADE;
DROP TRIGGER IF EXISTS update_agency_seats_on_profile_trigger ON public.profiles CASCADE;
DROP FUNCTION IF EXISTS public.update_agency_used_seats() CASCADE;

-- Step 2: Create a new, simplified trigger function that properly handles all operations
CREATE OR REPLACE FUNCTION public.update_agency_seats_trigger()
RETURNS TRIGGER AS $$
DECLARE
  target_agency_id uuid;
BEGIN
  -- Determine which agency_id to update based on the operation
  IF TG_OP = 'DELETE' THEN
    target_agency_id := OLD.agency_id;
  ELSE
    target_agency_id := NEW.agency_id;
  END IF;

  -- Only process if we have an agency_id and this involves escort profiles
  IF target_agency_id IS NOT NULL THEN
    -- Check if this is an escort-related change
    IF (TG_OP = 'DELETE' AND OLD.role = 'escort') OR
       (TG_OP = 'INSERT' AND NEW.role = 'escort') OR
       (TG_OP = 'UPDATE' AND (NEW.role = 'escort' OR OLD.role = 'escort')) THEN
      
      -- Update the seat count for the affected agency
      UPDATE public.agency_subscriptions 
      SET used_seats = (
        SELECT COUNT(*) 
        FROM public.profiles 
        WHERE agency_id = target_agency_id 
        AND role = 'escort'
        AND status = 'approved'
      ),
      updated_at = now()
      WHERE agency_id = target_agency_id;
      
      -- If this is an UPDATE and agency_id changed, also update the old agency
      IF TG_OP = 'UPDATE' AND OLD.agency_id IS NOT NULL AND OLD.agency_id != NEW.agency_id THEN
        UPDATE public.agency_subscriptions 
        SET used_seats = (
          SELECT COUNT(*) 
          FROM public.profiles 
          WHERE agency_id = OLD.agency_id 
          AND role = 'escort'
          AND status = 'approved'
        ),
        updated_at = now()
        WHERE agency_id = OLD.agency_id;
      END IF;
    END IF;
  END IF;
  
  -- Return the appropriate record
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Create the new trigger on profiles table
CREATE TRIGGER update_agency_seats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agency_seats_trigger();

-- Step 4: Verify the is_agency function exists and works correctly
CREATE OR REPLACE FUNCTION public.is_agency(user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'agency'
  );
$$;
