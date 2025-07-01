
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

// Define subscription tiers including free trial
const SUBSCRIPTION_TIERS = {
  free_trial: {
    name: "7 Day Free Trial",
    price: 0, // $0 for trial
    duration: "Trial", 
    durationDays: 7,
    subscriptionTier: "Basic",
    interval: "week" as const,
    isTrial: true
  },
  package_1_weekly: { 
    name: "Limited Time Package 1", 
    price: 1500, // $15 in cents
    duration: "Weekly", 
    durationDays: 7,
    subscriptionTier: "Package1",
    interval: "week" as const
  },
  package_2_monthly: { 
    name: "4 Weeks Package 2", 
    price: 7900, // $79 in cents
    duration: "Monthly", 
    durationDays: 30,
    subscriptionTier: "Package2",
    interval: "month" as const
  },
  package_3_quarterly: { 
    name: "12 Weeks Package 3", 
    price: 18900, // $189 in cents
    duration: "Quarterly", 
    durationDays: 84,
    subscriptionTier: "Package3",
    interval: "month" as const,
    intervalCount: 3
  },
  package_4_yearly: { 
    name: "52 Weeks Package 4", 
    price: 39900, // $399 in cents
    duration: "Yearly", 
    durationDays: 365,
    subscriptionTier: "Package4",
    interval: "year" as const
  }
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

    const stripeSecret = Deno.env.get("Stripe Secret");
    if (!stripeSecret) {
      logStep("ERROR: Stripe Secret not found");
      return new Response(JSON.stringify({ error: "Stripe configuration missing" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      });
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      logStep("ERROR: No authorization header");
      return new Response(JSON.stringify({ error: "Authorization required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      logStep("ERROR: User not authenticated");
      return new Response(JSON.stringify({ error: "User not authenticated or email not available" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 401,
      });
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      logStep("ERROR: Invalid JSON in request body", { error: error.message });
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const { role, tier } = requestBody;
    
    if (!role || !['escort', 'agency'].includes(role)) {
      logStep("ERROR: Invalid role", { role });
      return new Response(JSON.stringify({ error: "Invalid role specified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }
    
    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      logStep("ERROR: Invalid tier", { tier });
      return new Response(JSON.stringify({ error: "Invalid subscription tier specified" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    const selectedTier = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    logStep("Tier selected", { tier, selectedTier });

    const stripe = new Stripe(stripeSecret, { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer already exists or create one
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
          role: role
        }
      });
      customerId = newCustomer.id;
      logStep("Created new customer", { customerId });
    }

    // Handle free trial - create a subscription with trial period
    if (selectedTier.isTrial) {
      logStep("Processing free trial subscription");
      
      // Create a product and price for the trial
      const product = await stripe.products.create({
        name: selectedTier.name,
        description: `${selectedTier.duration} trial for ${role} profile`
      });

      const price = await stripe.prices.create({
        currency: 'aud',
        product: product.id,
        unit_amount: 1500, // Will charge $15 after trial if not cancelled
        recurring: {
          interval: 'week'
        }
      });

      // Create subscription with 7-day trial that auto-cancels
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: price.id }],
        trial_period_days: 7,
        cancel_at_period_end: true, // Auto-cancel after trial
        metadata: {
          user_id: user.id,
          role: role,
          tier: tier,
          subscription_tier: selectedTier.subscriptionTier,
          is_trial: 'true'
        }
      });

      logStep("Free trial subscription created", { subscriptionId: subscription.id });

      // Update Supabase directly for trial
      const now = new Date();
      const trialEnd = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000));

      const { error: upsertError } = await supabaseClient
        .from('subscribers')
        .upsert({
          email: user.email,
          user_id: user.id,
          subscribed: true,
          subscription_tier: 'Basic',
          subscription_type: 'free',
          trial_start_date: now.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          expires_at: trialEnd.toISOString(),
          subscription_end: trialEnd.toISOString(),
          is_trial_active: true,
          is_featured: false,
          photo_verified: false,
          stripe_customer_id: customerId,
          updated_at: now.toISOString(),
        }, { onConflict: 'email' });

      if (upsertError) {
        logStep("ERROR: Failed to update subscriber", { error: upsertError });
        throw upsertError;
      }

      // Update profile to be active
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ 
          is_active: true,
          payment_status: 'completed'
        })
        .eq('id', user.id);

      if (profileError) {
        logStep("ERROR: Failed to update profile", { error: profileError });
        throw profileError;
      }

      return new Response(JSON.stringify({ 
        success: true,
        trial_activated: true,
        trial_end: trialEnd.toISOString(),
        message: "Free trial activated successfully"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle paid subscriptions (existing logic)
    logStep("Processing paid subscription");
    
    const lineItems = [{
      price_data: {
        currency: 'aud',
        product_data: {
          name: selectedTier.name,
          description: `${selectedTier.duration} subscription for ${role} profile`
        },
        unit_amount: selectedTier.price,
        recurring: {
          interval: selectedTier.interval,
          interval_count: selectedTier.intervalCount || 1
        }
      },
      quantity: 1,
    }];
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: lineItems,
      mode: "subscription",
      success_url: `https://adamoreveescorts.com/auth?payment=success&tier=${tier}`,
      cancel_url: `https://adamoreveescorts.com/user-profile`,
      metadata: {
        user_id: user.id,
        role: role,
        tier: tier,
        billing_cycle: selectedTier.duration.toLowerCase(),
        subscription_tier: selectedTier.subscriptionTier
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR: Unexpected error", { message: error.message, stack: error.stack });
    return new Response(JSON.stringify({ 
      error: "An unexpected error occurred", 
      details: error.message 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
