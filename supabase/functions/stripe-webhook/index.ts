import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  try {
    const [timestampPart, v1Part] = sigHeader.split(",").map((s) => s.trim());
    const timestamp = timestampPart.split("=")[1];
    const signature = v1Part.split("=")[1];
    const signedPayload = `${timestamp}.${payload}`;

    const key = new TextEncoder().encode(secret);
    const data = new TextEncoder().encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, data);
    const expected = Array.from(new Uint8Array(sigBuffer))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    return expected === signature;
  } catch (err) {
    console.error("Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
    const body = await req.text();

    if (!signature) throw new Error("No Stripe signature found");

    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) throw new Error("Invalid Stripe signature");

    const event = JSON.parse(body);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;

        if (session.metadata?.consultation_id) {
          const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
          const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
          const consultationId = session.metadata.consultation_id;

          const response = await fetch(`${supabaseUrl}/rest/v1/consultations?id=eq.${consultationId}`, {
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
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("Supabase REST API error:", errorText);
            throw new Error("Database update failed");
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
