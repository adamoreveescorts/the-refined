
-- Create a table for photo verifications
CREATE TABLE public.photo_verifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_photo_url TEXT NOT NULL,
  profile_photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_verifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own verifications
CREATE POLICY "Users can view their own verifications" 
  ON public.photo_verifications 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Users can create their own verifications
CREATE POLICY "Users can create their own verifications" 
  ON public.photo_verifications 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Admins can view all verifications
CREATE POLICY "Admins can view all verifications" 
  ON public.photo_verifications 
  FOR SELECT 
  USING (is_admin(auth.uid()));

-- Admins can update verifications (for approval/rejection)
CREATE POLICY "Admins can update verifications" 
  ON public.photo_verifications 
  FOR UPDATE 
  USING (is_admin(auth.uid()));

-- Create storage bucket for verification photos (private)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-photos', 'verification-photos', false);

-- Storage policies for verification photos
CREATE POLICY "Users can upload their own verification photos" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'verification-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can view their own verification photos" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'verification-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Admins can view all verification photos
CREATE POLICY "Admins can view all verification photos" 
  ON storage.objects 
  FOR SELECT 
  USING (
    bucket_id = 'verification-photos' 
    AND is_admin(auth.uid())
  );

-- Create function to update verification status and sync with profiles
CREATE OR REPLACE FUNCTION public.update_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If verification is approved, update both profiles and subscribers tables
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    -- Update profiles table
    UPDATE public.profiles 
    SET verified = true, updated_at = now()
    WHERE id = NEW.user_id;
    
    -- Update subscribers table
    UPDATE public.subscribers 
    SET photo_verified = true, updated_at = now()
    WHERE user_id = NEW.user_id;
  
  -- If verification is rejected, ensure verified status is false
  ELSIF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
    UPDATE public.profiles 
    SET verified = false, updated_at = now()
    WHERE id = NEW.user_id;
    
    UPDATE public.subscribers 
    SET photo_verified = false, updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for verification status updates
CREATE TRIGGER update_verification_status_trigger
  AFTER UPDATE ON public.photo_verifications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_verification_status();
