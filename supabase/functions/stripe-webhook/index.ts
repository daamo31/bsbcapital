import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../shared/cors.ts";
import Stripe from "https://esm.sh/stripe@12.11.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2025-06-30.basil",
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req: Request): Promise<Response> => {
  // ✅ Permitir preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    let event: Stripe.Event;

    try {
      // ⚙️ Validamos firma del webhook
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature!,
        endpointSecret
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Invalid Stripe signature";
      console.error("⚠️ Invalid Stripe signature:", message);

      return new Response(JSON.stringify({ error: message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ Procesar evento “checkout.session.completed”
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      console.log("✅ Checkout completed:", session.id);

      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

      // 🚫 Validar que haya usuario
      if (!session.metadata?.supabase_user_id) {
        console.error(
          "Unauthorized access: No user ID found in session metadata."
        );
        return new Response(
          JSON.stringify({
            error: "User must be logged in to complete this action.",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // 🧩 Actualizar reservas o registrar pagos
      if (session.metadata?.consultation_id) {
        console.log(
          `🔄 Updating consultation with ID: ${session.metadata.consultation_id}`
        );

        await fetch(
          `${supabaseUrl}/rest/v1/consultations?id=eq.${session.metadata.consultation_id}`,
          {
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
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency,
              payment_status: session.payment_status,
            }),
          }
        );

        // ✉️ Enviar email de confirmación si existe correo
        if (session.metadata?.client_email) {
          const emailServiceUrl = `${supabaseUrl}/functions/v1/resend-email-secure`;
          const emailPayload = {
            type: "consultation_confirmation",
            to: session.metadata.client_email,
            data: {
              clientName: session.metadata.client_name,
              consultationType: session.metadata.consultation_type,
              consultationDate: session.metadata.scheduled_at,
              amount: (session.amount_total ?? 0) / 100,
              currency: session.currency,
            },
          };

          try {
            const emailResponse = await fetch(emailServiceUrl, {
              method: "POST",
              headers: {
                apikey: supabaseServiceKey,
                Authorization: `Bearer ${supabaseServiceKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify(emailPayload),
            });

            if (!emailResponse.ok) {
              console.error(
                "❌ Failed to send confirmation email:",
                await emailResponse.text()
              );
            } else {
              console.log("✅ Confirmation email sent successfully.");
            }
          } catch (emailError) {
            const emailMessage =
              emailError instanceof Error
                ? emailError.message
                : "Unknown email error";
            console.error("Error sending confirmation email:", emailMessage);
          }
        }
      } else {
        console.warn("⚠️ No consultation_id found in session metadata.");
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown webhook error";
    console.error("Webhook error:", message);

    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
