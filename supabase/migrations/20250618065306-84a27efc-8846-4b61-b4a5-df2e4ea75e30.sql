
-- Add new rate columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS hourly_rate text,
ADD COLUMN IF NOT EXISTS two_hour_rate text,
ADD COLUMN IF NOT EXISTS dinner_rate text,
ADD COLUMN IF NOT EXISTS overnight_rate text;
