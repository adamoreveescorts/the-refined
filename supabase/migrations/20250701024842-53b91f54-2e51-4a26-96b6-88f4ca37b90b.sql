
-- Add gallery_videos column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN gallery_videos text[] DEFAULT NULL;
