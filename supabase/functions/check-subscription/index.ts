
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

    // Check actual photo verification status
    const { data: photoVerification } = await supabaseClient
      .from("photo_verifications")
      .select("status")
      .eq("user_id", user.id)
      .eq("status", "approved")
      .single();

    const isActuallyPhotoVerified = photoVerification?.status === "approved";
    logStep("Photo verification check", { isActuallyPhotoVerified });

    // Check if subscription or trial has expired
    const now = new Date();
    let isExpired = false;
    let isTrialExpired = false;
    
    if (currentSub?.expires_at) {
      const expiresAt = new Date(currentSub.expires_at);
      isExpired = now > expiresAt;
      logStep("Expiration check", { expiresAt, now, isExpired });
    }

    if (currentSub?.trial_end_date && currentSub.is_trial_active) {
      const trialEnd = new Date(currentSub.trial_end_date);
      isTrialExpired = now > trialEnd;
      logStep("Trial expiration check", { trialEnd, now, isTrialExpired });
    }

    // If trial expired, deactivate profile and require paid plan
    if (isTrialExpired && currentSub?.is_trial_active) {
      logStep("Trial expired, profile now invisible");
      await supabaseClient.from("subscribers").update({
        subscription_tier: null,
        subscribed: false,
        subscription_type: 'expired',
        is_trial_active: false,
        is_featured: false,
        photo_verified: isActuallyPhotoVerified,
        expires_at: null,
        subscription_end: null,
        updated_at: new Date().toISOString(),
      }).eq('email', user.email);

      // Make profile inactive/invisible
      await supabaseClient
        .from('profiles')
        .update({ 
          is_active: false,
          payment_status: 'pending'
        })
        .eq('id', user.id);

      return new Response(JSON.stringify({
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        expires_at: null,
        is_featured: false,
        photo_verified: isActuallyPhotoVerified,
        subscription_type: 'expired',
        is_trial_active: false,
        trial_expired: true,
        profile_visible: false,
        has_used_trial: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If current subscription is trial and still active, return trial info
    if (currentSub?.is_trial_active && !isTrialExpired) {
      logStep("Active trial found");
      return new Response(JSON.stringify({
        subscribed: true,
        subscription_tier: 'Trial',
        subscription_end: currentSub.trial_end_date,
        expires_at: currentSub.trial_end_date,
        is_featured: false,
        photo_verified: isActuallyPhotoVerified,
        subscription_type: 'trial',
        is_trial_active: true,
        profile_visible: true,
        trial_days_remaining: Math.ceil((new Date(currentSub.trial_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
        has_used_trial: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // If expired or no subscription, check Stripe for any payments
    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    let subscriptionData = {
      email: user.email,
      user_id: user.id,
      stripe_customer_id: null,
      subscribed: false,
      subscription_tier: null,
      subscription_type: 'none',
      plan_duration: null,
      plan_price: 0,
      subscription_end: null,
      expires_at: null,
      is_featured: false,
      photo_verified: isActuallyPhotoVerified,
      is_trial_active: false,
      updated_at: new Date().toISOString(),
    };

    let profileVisible = false;

    if (customers.data.length > 0) {
      const customerId = customers.data[0].id;
      logStep("Found Stripe customer", { customerId });
      subscriptionData.stripe_customer_id = customerId;

      // Check for active recurring subscriptions
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
          photo_verified: isActuallyPhotoVerified,
        };
        profileVisible = true;
      } else {
        // Check for recent successful one-time payments
        const paymentIntents = await stripe.paymentIntents.list({
          customer: customerId,
          limit: 100,
        });

        const successfulPayments = paymentIntents.data.filter(pi => 
          pi.status === 'succeeded' && 
          pi.metadata?.tier && 
          pi.metadata?.duration_days
        );

        if (successfulPayments.length > 0) {
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

          if (now <= expiresAt) {
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
              photo_verified: isActuallyPhotoVerified,
            };
            profileVisible = true;
            logStep("One-time payment still valid", subscriptionData);
          } else {
            logStep("One-time payment has expired", { expiresAt, now });
          }
        }
      }
    } else {
      logStep("No Stripe customer found");
    }

    // Update profile visibility based on subscription status
    await supabaseClient
      .from('profiles')
      .update({ 
        is_active: profileVisible,
        payment_status: profileVisible ? 'completed' : 'pending'
      })
      .eq('id', user.id);

    await supabaseClient.from("subscribers").upsert(subscriptionData, { onConflict: 'email' });

    logStep("Updated database with subscription info", { 
      subscribed: subscriptionData.subscribed, 
      subscriptionTier: subscriptionData.subscription_tier,
      expiresAt: subscriptionData.expires_at,
      profileVisible 
    });

    return new Response(JSON.stringify({
      subscribed: subscriptionData.subscribed,
      subscription_tier: subscriptionData.subscription_tier,
      subscription_end: subscriptionData.subscription_end,
      expires_at: subscriptionData.expires_at,
      is_featured: subscriptionData.is_featured,
      photo_verified: subscriptionData.photo_verified,
      subscription_type: subscriptionData.subscription_type,
      is_trial_active: subscriptionData.is_trial_active,
      profile_visible: profileVisible,
      has_used_trial: currentSub?.trial_start_date ? true : false
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
