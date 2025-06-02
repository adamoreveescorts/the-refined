
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

// Define subscription tiers
const SUBSCRIPTION_TIERS = {
  basic: { name: "Basic Plan", price: 0, duration: "Forever", durationDays: 0 },
  platinum_weekly: { name: "Platinum Weekly", price: 1500, duration: "1 Week", durationDays: 7 },
  platinum_monthly: { name: "Platinum Monthly", price: 7900, duration: "1 Month", durationDays: 30 },
  platinum_quarterly: { name: "Platinum Quarterly", price: 18900, duration: "3 Months", durationDays: 90 },
  platinum_yearly: { name: "Platinum Yearly", price: 39900, duration: "1 Year", durationDays: 365 }
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

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    
    logStep("User authenticated", { userId: user.id, email: user.email });

    const { role, tier } = await req.json();
    
    if (!role || !['escort', 'agency'].includes(role)) {
      throw new Error("Invalid role specified");
    }
    
    if (!tier || !SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS]) {
      throw new Error("Invalid subscription tier specified");
    }

    const selectedTier = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    logStep("Tier selected", { tier, selectedTier });

    // Handle free Basic tier
    if (tier === 'basic') {
      // Update user to Basic tier directly
      await supabaseClient.from("subscribers").upsert({
        email: user.email,
        user_id: user.id,
        stripe_customer_id: null,
        subscribed: false,
        subscription_tier: 'Basic',
        subscription_type: 'free',
        plan_duration: selectedTier.duration,
        plan_price: 0,
        expires_at: null,
        is_featured: false,
        photo_verified: false,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'email' });

      logStep("Basic tier assigned", { userId: user.id });
      return new Response(JSON.stringify({ 
        success: true, 
        message: "Basic tier activated",
        tier: 'Basic'
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Handle paid Platinum tiers
    const stripe = new Stripe(Deno.env.get("Stripe Secret") || "", { 
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

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { 
              name: `Eternal Security ${selectedTier.name}` 
            },
            unit_amount: selectedTier.price,
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment for platinum tiers
      success_url: `${req.headers.get("origin")}/auth?payment=success&tier=${tier}`,
      cancel_url: `${req.headers.get("origin")}/auth?payment=cancelled`,
      metadata: {
        user_id: user.id,
        role: role,
        tier: tier,
        duration_days: selectedTier.durationDays.toString()
      }
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    logStep("ERROR", { message: error.message });
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
