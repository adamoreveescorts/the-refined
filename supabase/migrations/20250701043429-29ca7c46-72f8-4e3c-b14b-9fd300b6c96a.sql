
-- Create contact_requests table to store requests from non-authenticated users
CREATE TABLE public.contact_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escort_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  requester_name TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'responded', 'ignored')),
  escort_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on contact_requests table
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Create policy for escorts to view their own contact requests
CREATE POLICY "Escorts can view their own contact requests" 
  ON public.contact_requests 
  FOR SELECT 
  USING (
    escort_id IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'escort'
    )
  );

-- Create policy for escorts to update their own contact requests
CREATE POLICY "Escorts can update their own contact requests" 
  ON public.contact_requests 
  FOR UPDATE 
  USING (
    escort_id IN (
      SELECT id FROM public.profiles 
      WHERE id = auth.uid() AND role = 'escort'
    )
  );

-- Create policy to allow anonymous users to insert contact requests
CREATE POLICY "Anyone can create contact requests" 
  ON public.contact_requests 
  FOR INSERT 
  WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_contact_requests_escort_id ON public.contact_requests(escort_id);
CREATE INDEX idx_contact_requests_status ON public.contact_requests(status);
