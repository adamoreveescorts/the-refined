
-- Fix the trigger function to properly handle INSERT, UPDATE, and DELETE operations
CREATE OR REPLACE FUNCTION public.update_agency_used_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT operations (NEW record only)
  IF TG_OP = 'INSERT' THEN
    -- Only process if this is an escort profile with agency_id
    IF NEW.role = 'escort' AND NEW.agency_id IS NOT NULL THEN
      -- Update used_seats count for the agency
      UPDATE public.agency_subscriptions 
      SET used_seats = (
        SELECT COUNT(*) 
        FROM public.profiles 
        WHERE agency_id = NEW.agency_id 
        AND role = 'escort'
        AND status = 'approved'
      ),
      updated_at = now()
      WHERE agency_id = NEW.agency_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle DELETE operations (OLD record only)
  IF TG_OP = 'DELETE' THEN
    -- Only process if this was an escort profile with agency_id
    IF OLD.role = 'escort' AND OLD.agency_id IS NOT NULL THEN
      -- Update used_seats count for the agency
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
    RETURN OLD;
  END IF;

  -- Handle UPDATE operations (both NEW and OLD records available)
  IF TG_OP = 'UPDATE' THEN
    -- Check if this affects escort profiles or status changes
    IF (NEW.role = 'escort' AND NEW.agency_id IS NOT NULL) OR 
       (OLD.role = 'escort' AND OLD.agency_id IS NOT NULL) OR
       (NEW.role = 'escort' AND NEW.status != OLD.status) THEN
      
      -- Update used_seats count for the affected agency(ies)
      -- Handle case where agency_id might have changed
      IF NEW.agency_id IS NOT NULL THEN
        UPDATE public.agency_subscriptions 
        SET used_seats = (
          SELECT COUNT(*) 
          FROM public.profiles 
          WHERE agency_id = NEW.agency_id 
          AND role = 'escort'
          AND status = 'approved'
        ),
        updated_at = now()
        WHERE agency_id = NEW.agency_id;
      END IF;
      
      -- If agency_id changed, also update the old agency
      IF OLD.agency_id IS NOT NULL AND OLD.agency_id != NEW.agency_id THEN
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
    RETURN NEW;
  END IF;
  
  -- Fallback (should not reach here)
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
