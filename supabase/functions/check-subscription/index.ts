
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-SUBSCRIPTION] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const stripeKey = Deno.env.get("Stripe Secret");
    if (!stripeKey) throw new Error("Stripe Secret is not set");
    logStep("Stripe key verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check current subscription record
    const { data: currentSub } = await supabaseClient
      .from("subscribers")
      .select("*")
      .eq("email", user.email)
      .single();

    logStep("Current subscription record", currentSub);

    // Check if subscription has expired
    const now = new Date();
    let isExpired = false;
    
    if (currentSub?.expires_at) {
      const expiresAt = new Date(currentSub.expires_at);
      isExpired = now > expiresAt;
      logStep("Expiration check", { expiresAt, now, isExpired });
    }

    // If expired or no subscription, check Stripe for any payments
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let subscriptionData = {
      email: user.email,
      user_id: user.id,
      stripe_customer_id: null,
      subscribed: false,
      subscription_tier: 'Basic',
      subscription_type: 'free',
      plan_duration: 'Forever',
      plan_price: 0,
      subscription_end: null,
      expires_at: null,
      is_featured: false,
      photo_verified: false,
      updated_at: new Date().toISOString(),
    };

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });
      subscriptionData.stripe_customer_id = customerId;

      // Check for active recurring subscriptions (legacy)
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: "active",
        limit: 10,
      });

      if (subscriptions.data.length > 0 && !isExpired) {
        const subscription = subscriptions.data[0];
        const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
        logStep("Active recurring subscription found", { subscriptionId: subscription.id, endDate: subscriptionEnd });
        
        subscriptionData = {
          ...subscriptionData,
          subscribed: true,
          subscription_tier: 'Platinum',
          subscription_type: 'recurring',
          subscription_end: subscriptionEnd,
          is_featured: true,
          photo_verified: true,
        };
      } else {
        // Check for recent successful one-time payments
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customerId,
          limit: 100,
        });

        // Find the most recent successful payment
        const successfulPayments = paymentIntents.data.filter(pi => 
          pi.status === 'succeeded' && 
          pi.metadata?.tier && 
          pi.metadata?.duration_days
        );

        if (successfulPayments.length > 0) {
          // Sort by created date to get the most recent
          successfulPayments.sort((a, b) => b.created - a.created);
          const latestPayment = successfulPayments[0];
          
          const paymentDate = new Date(latestPayment.created * 1000);
          const durationDays = parseInt(latestPayment.metadata.duration_days || '0');
          const expiresAt = new Date(paymentDate.getTime() + (durationDays * 24 * 60 * 60 * 1000));
          
          logStep("Found successful payment", { 
            paymentId: latestPayment.id, 
            tier: latestPayment.metadata.tier,
            durationDays,
            expiresAt 
          });

          // Check if this payment is still valid
          if (now <= expiresAt) {
            const tierName = latestPayment.metadata.tier;
            subscriptionData = {
              ...subscriptionData,
              subscribed: true,
              subscription_tier: 'Platinum',
              subscription_type: 'one_time',
              plan_duration: `${durationDays} days`,
              plan_price: latestPayment.amount,
              expires_at: expiresAt.toISOString(),
              subscription_end: expiresAt.toISOString(),
              is_featured: true,
              photo_verified: true,
            };
            logStep("One-time payment still valid", subscriptionData);
          } else {
            logStep("One-time payment has expired", { expiresAt, now });
          }
        }
      }
    } else {
      logStep("No Stripe customer found");
    }

    // If subscription expired, revert to Basic
    if (isExpired && currentSub?.subscription_tier === 'Platinum') {
      logStep("Subscription expired, reverting to Basic");
      subscriptionData.subscription_tier = 'Basic';
      subscriptionData.subscribed = false;
      subscriptionData.subscription_type = 'free';
      subscriptionData.is_featured = false;
      subscriptionData.photo_verified = false;
      subscriptionData.expires_at = null;
      subscriptionData.subscription_end = null;
    }

    await supabaseClient.from("subscribers").upsert(subscriptionData, { onConflict: 'email' });

    logStep("Updated database with subscription info", { 
      subscribed: subscriptionData.subscribed, 
      subscriptionTier: subscriptionData.subscription_tier,
      expiresAt: subscriptionData.expires_at 
    });

    return new Response(JSON.stringify({
      subscribed: subscriptionData.subscribed,
      subscription_tier: subscriptionData.subscription_tier,
      subscription_end: subscriptionData.subscription_end,
      expires_at: subscriptionData.expires_at,
      is_featured: subscriptionData.is_featured,
      photo_verified: subscriptionData.photo_verified,
      subscription_type: subscriptionData.subscription_type
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
