
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

// Define subscription tiers with consistent naming (removed trial)
const SUBSCRIPTION_TIERS = {
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

    // All tiers are now paid recurring subscriptions
    logStep("Processing paid subscription");
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

    // Create line items for recurring subscription checkout
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
    
    // Create recurring subscription checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: lineItems,
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
