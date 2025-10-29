import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import Stripe from "https://esm.sh/stripe@12.11.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-06-30.basil",
});
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature!, endpointSecret);
    } catch (err) {
      console.error("⚠️ Invalid Stripe signature:", err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      console.log("✅ Checkout completed:", session.id);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // Ensure the user is logged in before processing
      if (!session.metadata?.supabase_user_id) {
        console.error("Unauthorized access: No user ID found in session metadata.");
        return new Response(JSON.stringify({ error: "User must be logged in to complete this action." }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Handle consultation updates or payments
      if (session.metadata?.consultation_id) {
        console.log(`Updating consultation with ID: ${session.metadata.consultation_id}`);
        await fetch(`${supabaseUrl}/rest/v1/consultations?id=eq.${session.metadata.consultation_id}`, {
          method: "PATCH",
          headers: {
            apikey: supabaseServiceKey,
            Authorization: `Bearer ${supabaseServiceKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            status: "confirmed",
            stripe_session_id: session.id,
            amount: session.amount_total / 100,
            currency: session.currency,
            payment_status: session.payment_status,
          }),
        });
      } else {
        console.warn("No consultation_id found in session metadata.");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});