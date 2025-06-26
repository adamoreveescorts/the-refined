
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

// Define new independent escort packages with Stripe Price IDs for recurring billing
const SUBSCRIPTION_TIERS = {
  basic: { 
    name: "Basic Package", 
    price: 0, 
    duration: "Forever", 
    durationDays: 0, 
    stripePriceId: null,
    subscriptionTier: "Basic"
  },
  package_1_weekly: { 
    name: "Limited Time Package 1", 
    price: 1500, // $15 in cents
    duration: "Weekly", 
    durationDays: 7,
    stripePriceId: "price_package_1_weekly_aud",
    subscriptionTier: "Package1"
  },
  package_2_monthly: { 
    name: "4 Weeks Package 2", 
    price: 7900, // $79 in cents
    duration: "Monthly", 
    durationDays: 30,
    stripePriceId: "price_package_2_monthly_aud",
    subscriptionTier: "Package2"
  },
  package_3_quarterly: { 
    name: "12 Weeks Package 3", 
    price: 18900, // $189 in cents
    duration: "Quarterly", 
    durationDays: 84,
    stripePriceId: "price_package_3_quarterly_aud",
    subscriptionTier: "Package3"
  },
  package_4_yearly: { 
    name: "52 Weeks Package 4", 
    price: 39900, // $399 in cents
    duration: "Yearly", 
    durationDays: 365,
    stripePriceId: "price_package_4_yearly_aud",
    subscriptionTier: "Package4"
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

    // Handle free basic package
    if (tier === 'basic') {
      const { error: updateError } = await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: selectedTier.subscriptionTier,
        subscription_type: 'free',
        plan_duration: selectedTier.duration,
        plan_price: 0,
        expires_at: null,
        is_featured: false,
        photo_verified: false,
        is_trial_active: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      if (updateError) {
        logStep("ERROR: Failed to update subscriber record", { error: updateError });
        return new Response(JSON.stringify({ error: "Failed to update subscription" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500,
        });
      }

      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ 
          payment_status: 'completed',
          is_active: true 
        })
        .eq('id', user.id);

      if (profileError) {
        logStep("ERROR: Failed to update profile", { error: profileError });
      }

      logStep("Basic package assigned", { userId: user.id });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Basic package activated",
        tier: selectedTier.subscriptionTier
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle paid recurring subscriptions
    const stripe = new Stripe(stripeSecret, { 
      apiVersion: "2023-10-16" 
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    }
    
    // Create recurring subscription checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: selectedTier.stripePriceId, // Use predefined Stripe Price ID
          quantity: 1,
        },
      ],
      mode: "subscription", // Recurring billing
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
    logStep("ERROR", { message: error.message, stack: error.stack });
    return new Response(JSON.stringify({ error: error.message || "An unexpected error occurred" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
