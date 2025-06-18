
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

    const { agencyId, seats, billingCycle, pricePerSeat } = await req.json();
    logStep("Request data", { agencyId, seats, billingCycle, pricePerSeat });

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

    // Calculate total amount
    const totalAmount = pricePerSeat * seats;

    // Create checkout session for agency subscription
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'aud',
          product_data: {
            name: `Agency Subscription - ${seats} Escort${seats > 1 ? 's' : ''}`,
            description: `${billingCycle} billing for ${seats} escort seat${seats > 1 ? 's' : ''}`,
          },
          unit_amount: totalAmount,
          recurring: {
            interval: billingCycle === 'yearly' ? 'year' : 
                     billingCycle === 'quarterly' ? 'month' :
                     billingCycle === 'weekly' ? 'week' : 'month',
            interval_count: billingCycle === 'quarterly' ? 3 : 1,
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.get('origin')}/agency/dashboard?success=true`,
      cancel_url: `${req.headers.get('origin')}/agency/dashboard?cancelled=true`,
      metadata: {
        agency_id: agencyId,
        seats: seats.toString(),
        billing_cycle: billingCycle,
        price_per_seat: pricePerSeat.toString(),
        type: 'agency_subscription'
      },
    });

    // Create or update agency subscription record
    const subscriptionData = {
      agency_id: agencyId,
      total_seats: seats,
      used_seats: 0, // Will be updated by trigger
      price_per_seat: pricePerSeat,
      subscription_tier: 'platinum',
      billing_cycle: billingCycle,
      status: 'pending',
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
