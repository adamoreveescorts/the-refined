
-- Add basic RLS policies to allow public viewing of approved profiles
-- These are essential for the directory and profile pages to work

-- Allow everyone to view approved and active profiles (for directory)
CREATE POLICY "Public can view approved profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    status = 'approved' 
    AND is_active = true
  );

-- Allow users to view their own profiles
CREATE POLICY "Users can view own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profiles
CREATE POLICY "Users can update own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
