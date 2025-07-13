// @ts-expect-error - Deno std imports
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-expect-error - ESM imports
import Stripe from "https://esm.sh/stripe@14.21.0";
// @ts-expect-error - ESM imports
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const logStep = (step: string, details?: unknown) => {
  const timestamp = new Date().toISOString();
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[${timestamp}] [CUSTOMER-PORTAL] ${step}${detailsStr}`);
};

const validateEnvironmentVariables = () => {
  const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'STRIPE_SECRET_KEY'];
  // @ts-expect-error - Deno global
  const missing = requiredVars.filter(varName => !Deno.env.get(varName));
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 405,
    });
  }

  try {
    logStep("Function started");

    // Validate environment variables
    validateEnvironmentVariables();
    logStep("Environment variables validated");

    const supabaseClient = createClient(
      // @ts-expect-error - Deno global
      Deno.env.get("SUPABASE_URL")!,
      // @ts-expect-error - Deno global
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { 
        auth: { 
          persistSession: false,
          autoRefreshToken: false,
        }
      }
    );

    // Validate authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No valid authorization header provided");
    }
    logStep("Authorization header validated");

    const token = authHeader.replace("Bearer ", "");
    
    // Get user from token
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) {
      logStep("Authentication error", { error: userError.message });
      throw new Error(`Authentication failed: ${userError.message}`);
    }
    
    const user = userData.user;
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }
    logStep("User authenticated", { userId: user.id, email: user.email });

    // Initialize Stripe
    // @ts-expect-error - Deno global
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
      apiVersion: "2023-10-16",
    });

    // Find existing Stripe customer
    const customers = await stripe.customers.list({ 
      email: user.email, 
      limit: 1 
    });
    
    if (customers.data.length === 0) {
      logStep("No Stripe customer found", { email: user.email });
      throw new Error("No Stripe customer found for this user. Please subscribe to a plan first.");
    }
    
    const customerId = customers.data[0].id;
    logStep("Found Stripe customer", { customerId });

    // Get origin for return URL
    const origin = req.headers.get("origin") || req.headers.get("referer") || "http://localhost:3000";
    const returnUrl = `${origin}/dashboard`;
    
    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    logStep("Customer portal session created", { 
      sessionId: portalSession.id, 
      url: portalSession.url,
      returnUrl 
    });

    return new Response(JSON.stringify({ 
      url: portalSession.url,
      success: true 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in customer-portal", { 
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined 
    });
    
    // Return appropriate error status codes
    const isAuthError = errorMessage.includes("Authentication") || errorMessage.includes("authorization");
    const isNotFound = errorMessage.includes("No Stripe customer found");
    
    const statusCode = isAuthError ? 401 : isNotFound ? 404 : 500;
    
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: statusCode,
    });
  }
});