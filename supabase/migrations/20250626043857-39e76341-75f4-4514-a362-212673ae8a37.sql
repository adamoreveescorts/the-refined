
-- Update agency_subscriptions table to support recurring billing
ALTER TABLE public.agency_subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Update billing_cycle to support proper recurring options
ALTER TABLE public.agency_subscriptions 
DROP CONSTRAINT IF EXISTS agency_subscriptions_billing_cycle_check;

ALTER TABLE public.agency_subscriptions 
ADD CONSTRAINT agency_subscriptions_billing_cycle_check 
CHECK (billing_cycle IN ('monthly', 'yearly'));

-- Update subscribers table to support recurring billing for escorts
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'active',
ADD COLUMN IF NOT EXISTS next_billing_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT FALSE;

-- Update subscription_type constraint to include recurring options
ALTER TABLE public.subscribers 
DROP CONSTRAINT IF EXISTS subscribers_subscription_type_check;

ALTER TABLE public.subscribers 
ADD CONSTRAINT subscribers_subscription_type_check 
CHECK (subscription_type IN ('free', 'monthly', 'yearly'));

-- Create index for better performance on subscription queries
CREATE INDEX IF NOT EXISTS idx_agency_subscriptions_stripe_subscription_id 
ON public.agency_subscriptions(stripe_subscription_id);

CREATE INDEX IF NOT EXISTS idx_subscribers_stripe_customer_id 
ON public.subscribers(stripe_customer_id);
