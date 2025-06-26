
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-AGENCY-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Agency package configurations with recurring billing
const AGENCY_PACKAGES = {
  monthly: {
    name: "Monthly Agency Plan",
    basePrice: 7900, // $79 per escort per month
    stripePriceId: "price_agency_monthly_aud", // Replace with actual Stripe Price ID
    billingCycle: "monthly"
  },
  yearly: {
    name: "Yearly Agency Plan", 
    basePrice: 79900, // $799 per escort per year (save $150)
    stripePriceId: "price_agency_yearly_aud", // Replace with actual Stripe Price ID
    billingCycle: "yearly"
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

    const stripeKey = Deno.env.get("Stripe Secret");
    if (!stripeKey) throw new Error("Stripe Secret is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    const { agencyId, billingCycle, seats } = await req.json();
    logStep("Request data", { agencyId, billingCycle, seats });

    if (!AGENCY_PACKAGES[billingCycle as keyof typeof AGENCY_PACKAGES]) {
      throw new Error("Invalid billing cycle");
    }

    const selectedPackage = AGENCY_PACKAGES[billingCycle as keyof typeof AGENCY_PACKAGES];
    const seatsCount = seats || 1;

    // Verify the user owns this agency
    const { data: agency, error: agencyError } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("id", agencyId)
      .eq("role", "agency")
      .single();

    if (agencyError || !agency || agency.id !== user.id) {
      throw new Error("Unauthorized: Agency not found or access denied");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    // Find or create Stripe customer
    let customerId: string;
    const existingCustomers = await stripe.customers.list({ email: user.email, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customerId = existingCustomers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: user.email,
        name: agency.display_name || agency.username,
        metadata: {
          agency_id: agencyId,
          user_id: user.id,
          type: 'agency'
        },
      });
      customerId = customer.id;
    }

    // Create recurring subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: selectedPackage.stripePriceId, // Use predefined Stripe Price ID
        quantity: seatsCount, // Number of escort seats
      }],
      mode: 'subscription', // Changed to subscription for recurring billing
      success_url: `${req.headers.get('origin')}/agency/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/agency/dashboard?cancelled=true`,
      metadata: {
        agency_id: agencyId,
        billing_cycle: billingCycle,
        seats: seatsCount.toString(),
        type: 'agency_subscription'
      },
    });

    // Create or update agency subscription record
    const subscriptionData = {
      agency_id: agencyId,
      total_seats: seatsCount,
      price_per_seat: selectedPackage.basePrice,
      used_seats: 0,
      subscription_tier: 'platinum',
      billing_cycle: selectedPackage.billingCycle,
      status: 'pending',
      stripe_price_id: selectedPackage.stripePriceId,
      subscription_status: 'pending',
      updated_at: new Date().toISOString(),
    };

    await supabaseClient.from("agency_subscriptions").upsert(subscriptionData, { 
      onConflict: 'agency_id' 
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-agency-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
