
-- Add trial tracking fields to the subscribers table
ALTER TABLE public.subscribers 
ADD COLUMN trial_start_date timestamp with time zone,
ADD COLUMN trial_end_date timestamp with time zone,
ADD COLUMN is_trial_active boolean DEFAULT false;

-- Update subscription_tier to include trial option
-- Note: We'll handle this in the application logic since we already have a subscription_tier text field
