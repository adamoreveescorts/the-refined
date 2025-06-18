
-- Create escort_invitations table for managing invitations from agencies to escorts
CREATE TABLE public.escort_invitations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agency_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  invitation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(agency_id, email)
);

-- Enable RLS on escort_invitations
ALTER TABLE public.escort_invitations ENABLE ROW LEVEL SECURITY;

-- RLS policies for escort_invitations
CREATE POLICY "Agencies can view their invitations" 
  ON public.escort_invitations 
  FOR SELECT 
  USING (agency_id = auth.uid());

CREATE POLICY "Agencies can create invitations" 
  ON public.escort_invitations 
  FOR INSERT 
  WITH CHECK (agency_id = auth.uid());

CREATE POLICY "Agencies can update their invitations" 
  ON public.escort_invitations 
  FOR UPDATE 
  USING (agency_id = auth.uid());

CREATE POLICY "Admins can manage all invitations" 
  ON public.escort_invitations 
  FOR ALL 
  USING (public.is_admin(auth.uid()));

-- Create index for performance
CREATE INDEX idx_escort_invitations_agency_id ON public.escort_invitations(agency_id);
CREATE INDEX idx_escort_invitations_token ON public.escort_invitations(invitation_token);
CREATE INDEX idx_escort_invitations_email ON public.escort_invitations(email);
