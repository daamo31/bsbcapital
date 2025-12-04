import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.11.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

// 🔧 Configurar cliente de Supabase con service role
const supabase = createClient(supabaseUrl!, serviceRoleKey!);

serve(async (req: Request) => {
  // Manejar CORS para todas las requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Log detallado para debugging
    console.log("📨 Webhook request received:", {
      method: req.method,
      url: req.url,
      hasAuthHeader: req.headers.has("authorization"),
      hasStripeSignature: req.headers.has("stripe-signature"),
      userAgent: req.headers.get("user-agent"),
      contentType: req.headers.get("content-type")
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
          const { data, error } = await supabase
            .from("consultations")
            .update({
              status: "confirmed",
              stripe_session_id: session.id,
              amount: session.amount_total / 100,
              currency: session.currency,
              payment_status: session.payment_status,
            })
            .eq("id", consultationId)
            .select();

          if (error) {
            console.error("❌ Error actualizando consulta en Supabase:", error);
          } else {
            console.log("✅ Consulta actualizada correctamente en Supabase:", data);
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
          // Membresía Exclusiva (actualizado 4/12/2025)
          "price_1SaXofJmSk3VG9oigjDZtcF6": "4f27f890-55ea-4f61-b6f9-3b02b3a358fa", // Membresía Exclusiva mensual
          "price_1SaXpNJmSk3VG9oifsW4ajZ2": "9e38bc9e-7f4f-424c-87fe-6b4e453301d7", // Membresía Exclusiva anual
          
          // Academia BSB (actualizado 4/12/2025 - UUID fijo)
          "price_1SaXVjJmSk3VG9oix0Pu2N9J": "b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c", // Academia mensual 20€
          "price_1SDKgoJmSk3VG9oiamJj88De": "b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c", // Academia anual 200€ (mismo plan)
          
          // Planes legacy (mantener por compatibilidad)
          "price_1SDKVXJmSk3VG9oiLEm9JOoD": "a9097647-e0bc-424c-bacb-7ccbae7a0853", // Premium Investor anual
          "price_1SDKb2JmSk3VG9oiJr1unLZZ": "d7435ab7-d543-4bdc-9cc4-6874d286aa48", // Wealth Membership (Trader Premium)
          
          // Paquetes crypto
          "price_1SSshWJmSk3VG9oiU1cBNWgf": "98e48de0-7d37-4e0f-afb8-da0e041d2ae2", // Onboarding Crypto
          "price_1SSsfoJmSk3VG9oi70AskCZv": "235cb6d6-e532-4a0f-a657-863a68972851", // Gestión de Tesorería
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

            const { data: createdSubscription, error: subscriptionError } = await supabase
              .from("user_subscriptions")
              .insert(subscriptionPayload)
              .select();

            if (subscriptionError) {
              console.error("❌ Error creando suscripción en Supabase:", subscriptionError);
            } else {
              console.log("✅ Suscripción creada correctamente en Supabase:", createdSubscription);
              
              // ✉️ ENVIAR EMAIL DE CONFIRMACIÓN DE MEMBRESÍA
              if (createdSubscription && createdSubscription.length > 0) {
                const subscription = createdSubscription[0];
                const clientEmail = session.metadata?.client_email || session.customer_details?.email;
                const clientName = session.metadata?.client_name || "Usuario";
                const planName = session.metadata?.plan_name || "Membresía";
                const billingCycle = session.metadata?.billing_cycle || "monthly";
                
                console.log("📧 Enviando email de confirmación de membresía a:", clientEmail);
                
                // Determinar el tipo de email según el plan
                let emailType = "academia_bsb"; // por defecto
                if (planName.toLowerCase().includes("trader") || planName.toLowerCase().includes("pro")) {
                  emailType = "trader_plan_pro";
                } else if (planName.toLowerCase().includes("premium") || planName.toLowerCase().includes("investor")) {
                  emailType = "premium_investor";
                } else if (planName.toLowerCase().includes("wealth")) {
                  emailType = "wealth_membership";
                }
                
                const emailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${serviceRoleKey!}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    type: emailType,
                    to: clientEmail,
                    data: {
                      name: clientName,
                      email: clientEmail,
                      planName: planName,
                      billingCycle: billingCycle,
                      amount: session.amount_total / 100,
                      currency: session.currency,
                      subscriptionId: latestSubscription.id,
                    },
                  }),
                });

                if (!emailRes.ok) {
                  console.error("❌ Error enviando email de confirmación de membresía:", await emailRes.text());
                } else {
                  console.log("✅ Email de confirmación de membresía enviado correctamente.");
                }
              }
            }
          } else {
            console.warn("⚠️ No se encontraron suscripciones para el customer. Esto puede ser normal si el pago aún se está procesando.");
            // Actualizar solo el estado sin subscription_id
            const { error: updateError } = await supabase
              .from("user_subscriptions")
              .update({
                status: "pending", // Estado temporal hasta que se confirme
                updated_at: new Date().toISOString(),
              })
              .eq("stripe_customer_id", session.customer)
              .eq("user_id", userId);

            if (updateError) {
              console.error("❌ Error actualizando estado temporal:", updateError);
            }
          }
          
          // Actualizar perfil del usuario
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              membership_tier: "premium", // Ajustar según el plan
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ Error actualizando perfil:", profileError);
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
        const { data: updatedSubscription, error: updateError } = await supabase
          .from("user_subscriptions")
          .update({
            stripe_subscription_id: subscriptionId,
            status: "active",
            started_at: new Date().toISOString(),
            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_customer_id", session.customer)
          .eq("user_id", userId)
          .select();

        if (updateError) {
          console.error("❌ Error actualizando suscripción en Supabase:", updateError);
        } else {
          console.log("✅ Suscripción actualizada correctamente en Supabase:", updatedSubscription);
          
          // ✉️ ENVIAR EMAIL DE CONFIRMACIÓN DE MEMBRESÍA
          const clientEmail = session.metadata?.client_email || session.customer_details?.email;
          const clientName = session.metadata?.client_name || "Usuario";
          const planName = session.metadata?.plan_name || "Membresía";
          const billingCycle = session.metadata?.billing_cycle || "monthly";
          
          console.log("📧 Enviando email de confirmación de membresía a:", clientEmail);
          
          // Determinar el tipo de email según el plan
          let emailType = "academia_bsb"; // por defecto
          if (planName.toLowerCase().includes("trader") || planName.toLowerCase().includes("pro")) {
            emailType = "trader_plan_pro";
          } else if (planName.toLowerCase().includes("premium") || planName.toLowerCase().includes("investor")) {
            emailType = "premium_investor";
          } else if (planName.toLowerCase().includes("wealth")) {
            emailType = "wealth_membership";
          }
          
          const emailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${serviceRoleKey!}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: emailType,
              to: clientEmail,
              data: {
                name: clientName,
                email: clientEmail,
                planName: planName,
                billingCycle: billingCycle,
                amount: session.amount_total / 100,
                currency: session.currency,
                subscriptionId: subscriptionId,
              },
            }),
          });

          if (!emailRes.ok) {
            console.error("❌ Error enviando email de confirmación de membresía:", await emailRes.text());
          } else {
            console.log("✅ Email de confirmación de membresía enviado correctamente.");
          }
          
          // También actualizar el perfil del usuario
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              membership_tier: "premium", // Ajustar según el plan
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ Error actualizando perfil:", profileError);
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
      const { data: renewedSubscription, error: renewError } = await supabase
        .from("user_subscriptions")
        .update({
          current_period_end: new Date(invoice.period_end * 1000).toISOString(),
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscriptionId)
        .select();

      if (renewError) {
        console.error("❌ Error renovando suscripción en Supabase:", renewError);
      } else {
        console.log("✅ Suscripción renovada correctamente en Supabase:", renewedSubscription);
        
        // También actualizar el perfil del usuario para mantener consistencia
        if (renewedSubscription && renewedSubscription.length > 0) {
          const userId = renewedSubscription[0].user_id;
          
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              subscription_status: "active",
              subscription_expires_at: new Date(invoice.period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ Error actualizando perfil en renovación:", profileError);
          } else {
            console.log("✅ Perfil actualizado en renovación.");
          }
        }
      }
    } else if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as any;
      console.log("❌ Suscripción cancelada:", subscription.id);

      // 🧾 Cancelar la suscripción en Supabase
      const { data: cancelledSubscription, error: cancelError } = await supabase
        .from("user_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("stripe_subscription_id", subscription.id)
        .select();

      if (cancelError) {
        console.error("❌ Error cancelando suscripción en Supabase:", cancelError);
      } else {
        console.log("✅ Suscripción cancelada correctamente en Supabase:", cancelledSubscription);
        
        // También actualizar el perfil del usuario
        if (cancelledSubscription && cancelledSubscription.length > 0) {
          const userId = cancelledSubscription[0].user_id;
          
          const { error: profileError } = await supabase
            .from("profiles")
            .update({
              subscription_status: "cancelled",
              updated_at: new Date().toISOString(),
            })
            .eq("id", userId);

          if (profileError) {
            console.error("❌ Error actualizando perfil en cancelación:", profileError);
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
