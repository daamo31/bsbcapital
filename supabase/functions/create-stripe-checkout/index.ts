import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_API = "https://api.stripe.com/v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { priceId, mode = "subscription", userId, email } = await req.json();

    if (!priceId || !userId || !email) {
      return new Response(
        JSON.stringify({ error: "priceId, userId, and email are required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Buscar o crear cliente Stripe
    const searchParams = new URLSearchParams({ email, limit: "1" });
    const customersRes = await fetch(`https://api.stripe.com/v1/customers?${searchParams}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const customers = await customersRes.json();

    let customerId: string;
    if (customers.data?.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const createRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email,
          [`metadata[supabase_user_id]`]: userId,
        }),
      });
      const customer = await createRes.json();
      customerId = customer.id;
    }

    const siteUrl = new URL(SUPABASE_URL).origin;

    // Crear sesión de checkout
    const params = new URLSearchParams({
      mode,
      customer: customerId,
      success_url: `${siteUrl}/academia/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/academia`,
      [`line_items[0][price]`]: priceId,
      [`line_items[0][quantity]`]: "1",
      [`metadata[supabase_user_id]`]: userId,
      [`metadata[access_type]`]: mode === "subscription" ? "membership" : "one_time",
    });

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await sessionRes.json();

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
