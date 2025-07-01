
-- First, let's check and fix the subscribers table constraints
-- Remove any conflicting check constraints on subscription_type
ALTER TABLE public.subscribers DROP CONSTRAINT IF EXISTS subscribers_subscription_type_check;

-- Add a single, consistent constraint that allows the values we actually use
ALTER TABLE public.subscribers ADD CONSTRAINT subscribers_subscription_type_check 
CHECK (subscription_type IN ('free', 'recurring', 'one_time'));

-- Update any existing records that might have invalid subscription_type values
UPDATE public.subscribers 
SET subscription_type = 'free' 
WHERE subscription_type NOT IN ('free', 'recurring', 'one_time');
