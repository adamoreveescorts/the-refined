
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
  package_1: {
    name: "Package 1",
    price: 7900, // $79 
    maxProfiles: 12,
    periodWeeks: 1,
    stripePriceId: "price_package_1_weekly_aud",
    billingCycle: "weekly"
  },
  package_2: {
    name: "Package 2", 
    price: 9900, // $99
    maxProfiles: 18,
    periodWeeks: 1,
    stripePriceId: "price_package_2_weekly_aud",
    billingCycle: "weekly"
  },
  package_3: {
    name: "Package 3",
    price: 24900, // $249
    maxProfiles: 24,
    periodWeeks: 4,
    stripePriceId: "price_package_3_monthly_aud",
    billingCycle: "monthly"
  },
  package_4: {
    name: "Package 4",
    price: 49900, // $499
    maxProfiles: 24,
    periodWeeks: 12,
    stripePriceId: "price_package_4_quarterly_aud",
    billingCycle: "quarterly"
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

    const { agencyId, packageId, packageType } = await req.json();
    logStep("Request data", { agencyId, packageId, packageType });

    if (!AGENCY_PACKAGES[packageId as keyof typeof AGENCY_PACKAGES]) {
      throw new Error("Invalid package selected");
    }

    const selectedPackage = AGENCY_PACKAGES[packageId as keyof typeof AGENCY_PACKAGES];

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
        price: selectedPackage.stripePriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/agency/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/agency/dashboard?cancelled=true`,
      metadata: {
        agency_id: agencyId,
        package_id: packageId,
        package_type: packageType.toString(),
        type: 'agency_subscription'
      },
    });

    // Create or update agency subscription record
    const subscriptionData = {
      agency_id: agencyId,
      package_type: packageType,
      max_profiles: selectedPackage.maxProfiles,
      package_name: selectedPackage.name,
      total_seats: selectedPackage.maxProfiles,
      price_per_seat: Math.floor(selectedPackage.price / selectedPackage.maxProfiles),
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
