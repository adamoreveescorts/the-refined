
-- Fix infinite recursion in RLS policies by dropping problematic policies
-- and creating a security definer function to safely check user roles

-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Agencies can create escort profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agencies can update their escorts profiles" ON public.profiles;
DROP POLICY IF EXISTS "Agencies can view their escorts profiles" ON public.profiles;

-- Create a security definer function to safely check if current user is an agency
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

-- Create safe RLS policies using the security definer function
CREATE POLICY "Agencies can create escort profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    public.is_agency() 
    AND role = 'escort' 
    AND agency_id = auth.uid()
  );

CREATE POLICY "Agencies can update their escorts profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (
    agency_id = auth.uid() 
    AND public.is_agency()
  );

CREATE POLICY "Agencies can view their escorts profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    agency_id = auth.uid() 
    AND public.is_agency()
  );

-- Update the trigger function to only update when relevant changes occur
CREATE OR REPLACE FUNCTION public.update_agency_used_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if this involves escort profiles with agency_id
  IF (TG_OP = 'DELETE' AND OLD.role = 'escort' AND OLD.agency_id IS NOT NULL) OR
     (TG_OP = 'INSERT' AND NEW.role = 'escort' AND NEW.agency_id IS NOT NULL) OR
     (TG_OP = 'UPDATE' AND (
       (NEW.role = 'escort' AND NEW.agency_id IS NOT NULL) OR 
       (OLD.role = 'escort' AND OLD.agency_id IS NOT NULL) OR
       (NEW.status != OLD.status AND NEW.role = 'escort')
     )) THEN
    
    -- Update used_seats count for the affected agency
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
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
