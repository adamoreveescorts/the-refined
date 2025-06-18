
-- Add agency_id to profiles table to link escorts to agencies
ALTER TABLE public.profiles 
ADD COLUMN agency_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create agency_escorts table for managing relationships
CREATE TABLE public.agency_escorts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  escort_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id, escort_id)
);

-- Create agency_subscriptions table for per-seat billing
CREATE TABLE public.agency_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_seats INTEGER NOT NULL DEFAULT 1,
  used_seats INTEGER NOT NULL DEFAULT 0,
  price_per_seat INTEGER NOT NULL, -- in cents
  subscription_tier TEXT NOT NULL DEFAULT 'platinum',
  billing_cycle TEXT NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'cancelled')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id)
);

-- Enable RLS on new tables
ALTER TABLE public.agency_escorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS policies for agency_escorts
CREATE POLICY "Agencies can view their escorts" 
  ON public.agency_escorts 
  FOR SELECT 
  USING (
    agency_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'agency')
    OR escort_id = auth.uid()
  );

CREATE POLICY "Agencies can manage their escorts" 
  ON public.agency_escorts 
  FOR ALL 
  USING (
    agency_id IN (SELECT id FROM public.profiles WHERE id = auth.uid() AND role = 'agency')
  );

CREATE POLICY "Admins can view all agency escorts" 
  ON public.agency_escorts 
  FOR SELECT 
  USING (is_admin(auth.uid()));

-- RLS policies for agency_subscriptions
CREATE POLICY "Agencies can view their subscriptions" 
  ON public.agency_subscriptions 
  FOR SELECT 
  USING (agency_id = auth.uid());

CREATE POLICY "Agencies can update their subscriptions" 
  ON public.agency_subscriptions 
  FOR UPDATE 
  USING (agency_id = auth.uid());

CREATE POLICY "Admins can view all agency subscriptions" 
  ON public.agency_subscriptions 
  FOR ALL 
  USING (is_admin(auth.uid()));

-- Create function to update used_seats count
CREATE OR REPLACE FUNCTION public.update_agency_used_seats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update used_seats count for the agency
  UPDATE public.agency_subscriptions 
  SET used_seats = (
    SELECT COUNT(*) 
    FROM public.agency_escorts 
    WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id) 
    AND status = 'active'
  ),
  updated_at = now()
  WHERE agency_id = COALESCE(NEW.agency_id, OLD.agency_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update seat counts
CREATE TRIGGER update_agency_seats_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.agency_escorts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agency_used_seats();

-- Add index for performance
CREATE INDEX idx_agency_escorts_agency_id ON public.agency_escorts(agency_id);
CREATE INDEX idx_agency_escorts_escort_id ON public.agency_escorts(escort_id);
CREATE INDEX idx_profiles_agency_id ON public.profiles(agency_id);
