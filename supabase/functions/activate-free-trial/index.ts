
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ACTIVATE-FREE-TRIAL] ${step}${detailsStr}`);
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

    const { role } = requestBody;
    
    if (!role || role !== 'escort') {
      logStep("ERROR: Invalid role", { role });
      return new Response(JSON.stringify({ error: "Free trial only available for escorts" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Check if user has already used trial
    const { data: existingSubscriber } = await supabaseClient
      .from('subscribers')
      .select('trial_start_date, is_trial_active')
      .eq('email', user.email)
      .single();

    if (existingSubscriber?.trial_start_date) {
      logStep("ERROR: User has already used trial", { email: user.email });
      return new Response(JSON.stringify({ error: "Free trial has already been used" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    logStep("Activating free trial");

    const now = new Date();
    const trialEnd = new Date(now.getTime() + (7 * 24 * 60 * 60 * 1000)); // 7 days from now

    // Create or update subscriber record with trial
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

    logStep("Free trial activated successfully", { 
      userId: user.id, 
      email: user.email,
      trialEnd: trialEnd.toISOString()
    });

    return new Response(JSON.stringify({ 
      success: true,
      trial_end: trialEnd.toISOString(),
      message: "Free trial activated successfully"
    }), {
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
