-- Remove general rate columns from profiles table
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS hourly_rate,
DROP COLUMN IF EXISTS two_hour_rate,
DROP COLUMN IF EXISTS dinner_rate,
DROP COLUMN IF EXISTS overnight_rate,
DROP COLUMN IF EXISTS rates;