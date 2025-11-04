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
    console.log("📨 Webhook request received:", {
      method: req.method,
      headers: Object.fromEntries(req.headers),
      url: req.url
    });
    
    const signature = req.headers.get("stripe-signature");
    const body = await req.text();

    console.log("📋 Request details:", {
      hasSignature: !!signature,
      bodyLength: body.length,
      signature: signature ? signature.substring(0, 50) + "..." : "none"
    });

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

    // 🎯 Manejar eventos de Stripe
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;

      console.log("✅ Pago completado en Stripe:", session.id);
      console.log("Estado del pago:", session.payment_status);
      console.log("Modo de sesión:", session.mode);
      console.log("Metadatos de la sesión:", session.metadata);

      if (session.payment_status !== "paid") {
        console.warn("⚠️ Sesión completada pero el pago no está realizado. Estado:", session.payment_status);
        return new Response(JSON.stringify({ error: "Payment not completed" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const userId = session.metadata?.supabase_user_id;
      const consultationId = session.metadata?.consultation_id;
      const clientEmail = session.metadata?.client_email;
      const mode = session.mode;
      const accessType = session.metadata?.access_type;

      // Validación básica de metadatos
      if (!userId) {
        console.warn("⚠️ Sesión sin supabase_user_id en los metadatos.");
        return new Response(JSON.stringify({ error: "Missing supabase_user_id in metadata" }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      // 🎯 PRIORIDAD 1: MANEJAR PAGOS ÚNICOS (CONSULTAS) - Para mantener compatibilidad
      if (mode === "payment" || consultationId) {
        console.log("🔄 Procesando pago único (consulta)...");

        // Actualizar la consulta en Supabase solo si tenemos consultationId
        if (consultationId) {
          const updateRes = await fetch(`${supabaseUrl}/rest/v1/consultations?id=eq.${consultationId}`, {
            method: "PATCH",
            headers: {
              apikey: serviceRoleKey!,
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
        } else {
          console.warn("⚠️ Pago único sin consultation_id, pero procesando de todas formas para compatibilidad.");
        }

        // 📨 Enviar correos para consultas
        if (clientEmail) {
          console.log("📧 Enviando correos para consulta...");

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

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 🎯 PRIORIDAD 2: MANEJAR SUSCRIPCIONES (MEMBRESÍAS) - Solo si no es consulta
      if (mode === "subscription" || accessType === "membership") {
        console.log("🔄 Procesando nueva suscripción/membresía...");
        
        // Mapeo entre priceId de Stripe y plan_id en la tabla subscription_plans
        const priceToPlanMap: Record<string, string> = {
          "price_1SDKO8JmSk3VG9oiCLuGoE4s": "4f27f890-55ea-4f61-b6f9-3b02b3a358fa", // Plan Trader Pro mensual
          "price_1SDKQZJmSk3VG9oiGudek18k": "9e38bc9e-7f4f-424c-87fe-6b4e453301d7", // Plan Trader Pro anual
          "price_1SDKVXJmSk3VG9oiLEm9JOoD": "a9097647-e0bc-424c-bacb-7ccbae7a0853", // Otro plan
          "price_1SDKb2JmSk3VG9oiJr1unLZZ": "d7435ab7-d543-4bdc-9cc4-6874d286aa48", // Otro plan
        };
        
        // Para suscripciones, el subscription ID puede ser null inicialmente
        const subscriptionId = session.subscription;
        console.log("Stripe subscription ID:", subscriptionId);

        if (!subscriptionId) {
          console.warn("⚠️ No se encontró subscription_id en la sesión - puede ser normal para suscripciones nuevas");
          console.log("📋 Intentando obtener suscripción del customer...");
          
          // Intentar obtener la suscripción más reciente del customer
          const subscriptionsRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${session.customer}&limit=1`, {
            headers: { Authorization: `Bearer ${stripeSecretKey}` },
          });
          const subscriptionsData = await subscriptionsRes.json();
          
          if (subscriptionsData.data && subscriptionsData.data.length > 0) {
            const latestSubscription = subscriptionsData.data[0];
            console.log("✅ Suscripción encontrada:", latestSubscription.id);
            
            // Obtener el priceId de la suscripción para mapear al plan correcto
            const priceId = latestSubscription.items?.data?.[0]?.price?.id;
            const planId = priceToPlanMap[priceId];
            
            if (!planId) {
              console.error("❌ No se pudo mapear priceId a plan_id:", priceId);
              return new Response(JSON.stringify({ error: "Invalid priceId mapping" }), {
                status: 400,
                headers: corsHeaders,
              });
            }
            
            console.log("✅ Plan mapeado:", { priceId, planId });
            
            // CREAR el registro en user_subscriptions (no actualizar)
            const subscriptionPayload = {
              user_id: userId,
              plan_id: planId,
              stripe_subscription_id: latestSubscription.id,
              stripe_customer_id: session.customer,
              status: latestSubscription.status,
              started_at: new Date(latestSubscription.created * 1000).toISOString(),
              current_period_start: new Date(latestSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(latestSubscription.current_period_end * 1000).toISOString(),
              auto_renew: !latestSubscription.cancel_at_period_end,
              cancel_at_period_end: latestSubscription.cancel_at_period_end || false,
              trial_start: latestSubscription.trial_start ? new Date(latestSubscription.trial_start * 1000).toISOString() : null,
              trial_end: latestSubscription.trial_end ? new Date(latestSubscription.trial_end * 1000).toISOString() : null,
              metadata: {
                client_name: session.metadata?.client_name,
                client_email: session.metadata?.client_email || session.customer_details?.email,
                plan_type: session.metadata?.plan_type,
                plan_name: session.metadata?.plan_name,
                billing_cycle: session.metadata?.billing_cycle,
                phone: session.metadata?.phone,
                country: session.metadata?.country,
                stripe_price_id: priceId,
              },
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };

            console.log("📋 Creando registro de suscripción:", subscriptionPayload);

            const createSubscriptionRes = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions`, {
              method: "POST",
              headers: {
                apikey: serviceRoleKey!,
                Authorization: `Bearer ${serviceRoleKey!}`,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify(subscriptionPayload),
            });

            if (!createSubscriptionRes.ok) {
              const errorText = await createSubscriptionRes.text();
              console.error("❌ Error creando suscripción en Supabase:", errorText);
            } else {
              const createdSubscription = await createSubscriptionRes.json();
              console.log("✅ Suscripción creada correctamente en Supabase:", createdSubscription);
            }
          } else {
            console.warn("⚠️ No se encontraron suscripciones para el customer. Esto puede ser normal si el pago aún se está procesando.");
            // Actualizar solo el estado sin subscription_id
            const updateSubscriptionRes = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?stripe_customer_id=eq.${session.customer}&user_id=eq.${userId}`, {
              method: "PATCH",
              headers: {
                apikey: serviceRoleKey!,
                Authorization: `Bearer ${serviceRoleKey!}`,
                "Content-Type": "application/json",
                Prefer: "return=representation",
              },
              body: JSON.stringify({
                status: "pending", // Estado temporal hasta que se confirme
                updated_at: new Date().toISOString(),
              }),
            });

            if (!updateSubscriptionRes.ok) {
              console.error("❌ Error actualizando estado temporal:", await updateSubscriptionRes.text());
            }
          }
          
          // Actualizar perfil del usuario
          const updateProfileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              apikey: serviceRoleKey!,
              Authorization: `Bearer ${serviceRoleKey!}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription_status: "active",
              membership_tier: "premium", // Ajustar según el plan
              updated_at: new Date().toISOString(),
            }),
          });

          if (!updateProfileRes.ok) {
            console.error("❌ Error actualizando perfil:", await updateProfileRes.text());
          } else {
            console.log("✅ Perfil actualizado correctamente.");
          }
          
          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        // Si SÍ hay subscription ID, procesar normalmente
        // Obtener detalles de la suscripción de Stripe
        const subscriptionRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscriptionId}`, {
          headers: { Authorization: `Bearer ${stripeSecretKey}` },
        });
        const subscriptionData = await subscriptionRes.json();

        if (!subscriptionRes.ok) {
          console.error("❌ Error obteniendo suscripción de Stripe:", subscriptionData);
          return new Response(JSON.stringify({ error: "Failed to fetch subscription data" }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        console.log("Datos de suscripción obtenidos:", {
          id: subscriptionData.id,
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          status: subscriptionData.status
        });

        // Actualizar el registro en user_subscriptions con el stripe_subscription_id
        const updateSubscriptionRes = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?stripe_customer_id=eq.${session.customer}&user_id=eq.${userId}`, {
          method: "PATCH",
          headers: {
            apikey: serviceRoleKey!,
            Authorization: `Bearer ${serviceRoleKey!}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({
            stripe_subscription_id: subscriptionId,
            status: "active",
            started_at: new Date().toISOString(),
            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          }),
        });

        if (!updateSubscriptionRes.ok) {
          const errorText = await updateSubscriptionRes.text();
          console.error("❌ Error actualizando suscripción en Supabase:", errorText);
        } else {
          console.log("✅ Suscripción actualizada correctamente en Supabase.");
          
          // También actualizar el perfil del usuario
          const updateProfileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              apikey: serviceRoleKey!,
              Authorization: `Bearer ${serviceRoleKey!}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription_status: "active",
              membership_tier: "premium", // Ajustar según el plan
              updated_at: new Date().toISOString(),
            }),
          });

          if (!updateProfileRes.ok) {
            console.error("❌ Error actualizando perfil:", await updateProfileRes.text());
          } else {
            console.log("✅ Perfil actualizado correctamente.");
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // 🎯 CASO FALLBACK: Si no coincide con ninguno de los casos anteriores
      console.warn("⚠️ Sesión no procesada - no coincide con los criterios de consulta o suscripción", {
        mode,
        accessType,
        hasConsultationId: !!consultationId
      });
    } else if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as any;
      console.log("✅ Pago de suscripción exitoso:", invoice.id);

      const subscriptionId = invoice.subscription;

      // 🧾 Renovar la suscripción en Supabase
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?stripe_subscription_id=eq.${subscriptionId}`, {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey!,
          Authorization: `Bearer ${serviceRoleKey!}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          current_period_end: new Date(invoice.period_end * 1000).toISOString(),
          status: "active",
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateRes.ok) {
        console.error("❌ Error renovando suscripción en Supabase:", await updateRes.text());
      } else {
        console.log("✅ Suscripción renovada correctamente en Supabase.");
        
        // También actualizar el perfil del usuario para mantener consistencia
        const subscriptionData = await updateRes.json();
        if (subscriptionData && subscriptionData.length > 0) {
          const userId = subscriptionData[0].user_id;
          
          const updateProfileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              apikey: serviceRoleKey!,
              Authorization: `Bearer ${serviceRoleKey!}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription_status: "active",
              subscription_expires_at: new Date(invoice.period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            }),
          });

          if (!updateProfileRes.ok) {
            console.error("❌ Error actualizando perfil en renovación:", await updateProfileRes.text());
          } else {
            console.log("✅ Perfil actualizado en renovación.");
          }
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as any;
      console.log("❌ Suscripción cancelada:", subscription.id);

      // 🧾 Cancelar la suscripción en Supabase
      const updateRes = await fetch(`${supabaseUrl}/rest/v1/user_subscriptions?stripe_subscription_id=eq.${subscription.id}`, {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey!,
          Authorization: `Bearer ${serviceRoleKey!}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        }),
      });

      if (!updateRes.ok) {
        console.error("❌ Error cancelando suscripción en Supabase:", await updateRes.text());
      } else {
        console.log("✅ Suscripción cancelada correctamente en Supabase.");
        
        // También actualizar el perfil del usuario
        const subscriptionData = await updateRes.json();
        if (subscriptionData && subscriptionData.length > 0) {
          const userId = subscriptionData[0].user_id;
          
          const updateProfileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
            method: "PATCH",
            headers: {
              apikey: serviceRoleKey!,
              Authorization: `Bearer ${serviceRoleKey!}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              subscription_status: "cancelled",
              updated_at: new Date().toISOString(),
            }),
          });

          if (!updateProfileRes.ok) {
            console.error("❌ Error actualizando perfil en cancelación:", await updateProfileRes.text());
          } else {
            console.log("✅ Perfil actualizado en cancelación.");
          }
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
