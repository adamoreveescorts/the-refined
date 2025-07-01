
-- First, let's see what subscription_tier values currently exist
-- This will help us understand what needs to be cleaned up
SELECT DISTINCT subscription_tier, COUNT(*) 
FROM public.subscribers 
GROUP BY subscription_tier;

-- Also check what subscription_type values exist
SELECT DISTINCT subscription_type, COUNT(*) 
FROM public.subscribers 
GROUP BY subscription_type;
