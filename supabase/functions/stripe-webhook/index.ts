import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.11.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-function-secret",
};

// 🔐 Cargar variables de entorno
const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecretKey || !endpointSecret || !supabaseUrl || !serviceRoleKey) {
  console.error("❌ Faltan variables de entorno necesarias para Stripe o Supabase.");
}

const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: "2025-06-30.basil",
});

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing Stripe signature" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret!);
    } catch (err) {
      console.error("⚠️ Error verificando firma de Stripe:", (err as Error).message);
      return new Response(JSON.stringify({ error: "Invalid Stripe signature" }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 🎯 Solo manejamos checkout completado
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      console.log("✅ Pago completado en Stripe:", session.id);

      const userId = session.metadata?.supabase_user_id;
      const consultationId = session.metadata?.consultation_id;
      const clientEmail = session.metadata?.client_email;

      if (!userId || !consultationId) {
        console.warn("⚠️ Sesión sin metadatos requeridos.");
        return new Response(JSON.stringify({ error: "Missing metadata" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      // 🧾 Actualizar la reserva en Supabase
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/consultations?id=eq.${consultationId}`, {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey!, // 👈 CORREGIDO: todo en minúsculas
          Authorization: `Bearer ${serviceRoleKey!}`,
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

      if (!updateRes.ok) {
        console.error("❌ Error actualizando consulta en Supabase:", await updateRes.text());
      } else {
        console.log("✅ Consulta actualizada correctamente en Supabase.");
      }

      // 📨 Enviar correos
      if (clientEmail) {
        console.log("📧 Enviando correos vía resend-email-secure...");

        // Cliente
        const clientRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey!}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: session.metadata?.consultation_type || "consultation_confirmation",
            to: clientEmail,
            data: {
              clientName: session.metadata?.client_name,
              consultationType: session.metadata?.consultation_type,
              consultationDate: session.metadata?.scheduled_at,
              amount: session.amount_total / 100,
              currency: session.currency,
            },
          }),
        });

        if (!clientRes.ok) {
          console.error("❌ Error enviando correo al cliente:", await clientRes.text());
        } else {
          console.log("✅ Correo al cliente enviado correctamente.");
        }

        // Administradores
        const adminRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${serviceRoleKey!}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "admin_consultation_notification",
            to: "info@bsbcapital.io",
            data: {
              clientName: session.metadata?.client_name,
              clientEmail,
              consultationType: session.metadata?.consultation_type,
              consultationDate: session.metadata?.scheduled_at,
              amount: session.amount_total / 100,
              currency: session.currency,
            },
          }),
        });

        if (!adminRes.ok) {
          console.error("❌ Error enviando correo a admin:", await adminRes.text());
        } else {
          console.log("✅ Correo a admin enviado correctamente.");
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ Error en Stripe Webhook:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
