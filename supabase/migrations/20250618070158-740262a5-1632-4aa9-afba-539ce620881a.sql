
-- Create the verification-photos storage bucket (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('verification-photos', 'verification-photos', false)
ON CONFLICT (id) DO NOTHING;

-- Update storage policies for verification photos
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload their own verification photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own verification photos" ON storage.objects;
DROP POLICY IF EXISTS "Admins can view all verification photos" ON storage.objects;

-- Create comprehensive storage policies
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

-- Allow admins to delete verification photos if needed
CREATE POLICY "Admins can delete verification photos" 
  ON storage.objects 
  FOR DELETE 
  USING (
    bucket_id = 'verification-photos' 
    AND is_admin(auth.uid())
  );
