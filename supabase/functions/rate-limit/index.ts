import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMinutes: 15 },
  verify: { maxAttempts: 10, windowMinutes: 5 },
  checkout: { maxAttempts: 3, windowMinutes: 10 },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { action, ip } = await req.json();

    if (!action || !ip) {
      return new Response(
        JSON.stringify({ error: "Missing action or IP" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const limit = RATE_LIMITS[action as keyof typeof RATE_LIMITS];
    if (!limit) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check current attempts in the time window
    const windowStart = new Date(Date.now() - limit.windowMinutes * 60 * 1000);

    const { data: attempts, error } = await supabase
      .from("rate_limit_attempts")
      .select("*")
      .eq("ip_address", ip)
      .eq("action", action)
      .gte("created_at", windowStart.toISOString());

    if (error) {
      console.error("Error checking rate limit:", error);
      return new Response(
        JSON.stringify({ allowed: true, remaining: limit.maxAttempts }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const currentAttempts = attempts?.length || 0;

    if (currentAttempts >= limit.maxAttempts) {
      return new Response(
        JSON.stringify({
          allowed: false,
          remaining: 0,
          resetTime: new Date(
            Date.now() + limit.windowMinutes * 60 * 1000
          ).toISOString(),
          message: `Too many attempts. Try again in ${limit.windowMinutes} minutes.`,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Record this attempt
    await supabase
      .from("rate_limit_attempts")
      .insert({
        ip_address: ip,
        action: action,
        created_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({
        allowed: true,
        remaining: limit.maxAttempts - currentAttempts - 1,
        resetTime: new Date(
          Date.now() + limit.windowMinutes * 60 * 1000
        ).toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in rate-limit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", allowed: true }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});