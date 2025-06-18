
-- Add RLS policies for agency_subscriptions table
-- Allow agencies to select their own subscription
CREATE POLICY "agencies_can_select_own_subscription" ON public.agency_subscriptions
FOR SELECT
USING (agency_id = auth.uid());

-- Allow agencies to insert their own subscription
CREATE POLICY "agencies_can_insert_own_subscription" ON public.agency_subscriptions
FOR INSERT
WITH CHECK (agency_id = auth.uid());

-- Allow agencies to update their own subscription
CREATE POLICY "agencies_can_update_own_subscription" ON public.agency_subscriptions
FOR UPDATE
USING (agency_id = auth.uid());

-- Allow admins to manage all subscriptions
CREATE POLICY "admins_can_manage_all_subscriptions" ON public.agency_subscriptions
FOR ALL
USING (public.is_admin(auth.uid()));
