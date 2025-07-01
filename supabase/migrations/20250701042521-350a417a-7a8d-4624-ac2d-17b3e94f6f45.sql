
-- Create the profile-pictures storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-pictures', 'profile-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can upload to their own folder" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view profile pictures" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all profile pictures" ON storage.objects;

-- Create RLS policies for the profile-pictures bucket
-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to their own folder" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Allow users to view all files in the bucket (since it's public)
CREATE POLICY "Anyone can view profile pictures" ON storage.objects
FOR SELECT USING (bucket_id = 'profile-pictures');

-- Allow users to update their own files
CREATE POLICY "Users can update their own files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (string_to_array(name, '/'))[1]
);

-- Allow admins to upload, update, and delete any files in the bucket
CREATE POLICY "Admins can manage all profile pictures" ON storage.objects
FOR ALL USING (
  bucket_id = 'profile-pictures' AND 
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);
