
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

// Package configurations
const PACKAGES = {
  1: {
    name: "Package 1",
    price: 7900, // $79.00 in cents
    duration: "1 week",
    maxProfiles: 1,
    stripePriceId: null // One-time payment
  },
  2: {
    name: "Package 2", 
    price: 9900, // $99.00 in cents
    duration: "1 week",
    maxProfiles: 12,
    stripePriceId: null // One-time payment
  },
  3: {
    name: "Package 3",
    price: 24900, // $249.00 in cents
    duration: "4 weeks",
    maxProfiles: 18,
    stripePriceId: null // One-time payment
  },
  4: {
    name: "Package 4",
    price: 49900, // $499.00 in cents
    duration: "12 weeks",
    maxProfiles: 24,
    stripePriceId: null // One-time payment
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

    const { agencyId, packageType } = await req.json();
    logStep("Request data", { agencyId, packageType });

    if (!PACKAGES[packageType as keyof typeof PACKAGES]) {
      throw new Error("Invalid package type");
    }

    const selectedPackage = PACKAGES[packageType as keyof typeof PACKAGES];

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

    // Create checkout session for one-time payment
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: selectedPackage.name,
            description: `${selectedPackage.duration} access for up to ${selectedPackage.maxProfiles} profiles with top page ad positioning`,
          },
          unit_amount: selectedPackage.price,
        },
        quantity: 1,
      }],
      mode: 'payment', // One-time payment instead of subscription
      success_url: `${req.headers.get('origin')}/agency/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/agency/dashboard?cancelled=true`,
      metadata: {
        agency_id: agencyId,
        package_type: packageType.toString(),
        package_name: selectedPackage.name,
        max_profiles: selectedPackage.maxProfiles.toString(),
        duration: selectedPackage.duration,
        type: 'agency_package'
      },
    });

    // Calculate end date based on package duration
    const startDate = new Date();
    let endDate = new Date();
    
    if (selectedPackage.duration === "1 week") {
      endDate.setDate(startDate.getDate() + 7);
    } else if (selectedPackage.duration === "4 weeks") {
      endDate.setDate(startDate.getDate() + 28);
    } else if (selectedPackage.duration === "12 weeks") {
      endDate.setDate(startDate.getDate() + 84);
    }

    // Create or update agency subscription record
    const subscriptionData = {
      agency_id: agencyId,
      package_type: packageType,
      package_name: selectedPackage.name,
      max_profiles: selectedPackage.maxProfiles,
      price_per_seat: selectedPackage.price, // Keep for compatibility
      total_seats: selectedPackage.maxProfiles, // Keep for compatibility
      used_seats: 0,
      subscription_tier: 'platinum',
      billing_cycle: selectedPackage.duration,
      status: 'pending',
      current_period_start: startDate.toISOString(),
      current_period_end: endDate.toISOString(),
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
