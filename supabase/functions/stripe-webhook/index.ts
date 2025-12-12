import { serve } from 'https://deno.land/std@0.210.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.11.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-function-secret',
};

// 🔐 Cargar variables de entorno
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!stripeSecretKey || !endpointSecret || !supabaseUrl || !serviceRoleKey) {
  console.error('❌ Faltan variables de entorno necesarias para Stripe o Supabase.');
}

const stripe = new Stripe(stripeSecretKey!, {
  apiVersion: '2025-06-30.basil',
});

// 🔧 Configurar cliente de Supabase con service role
const supabase = createClient(supabaseUrl!, serviceRoleKey!);

serve(async (req: Request) => {
  // Manejar CORS para todas las requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Log detallado para debugging
    console.log('📨 Webhook request received:', {
      method: req.method,
      url: req.url,
      hasAuthHeader: req.headers.has('authorization'),
      hasStripeSignature: req.headers.has('stripe-signature'),
      userAgent: req.headers.get('user-agent'),
      contentType: req.headers.get('content-type'),
    });

    const signature = req.headers.get('stripe-signature');
    const body = await req.text();

    console.log('📋 Request details:', {
      hasSignature: !!signature,
      bodyLength: body.length,
      signature: signature ? signature.substring(0, 50) + '...' : 'none',
    });

    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing Stripe signature' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, endpointSecret!);
    } catch (err) {
      console.error('⚠️ Error verificando firma de Stripe:', (err as Error).message);
      return new Response(JSON.stringify({ error: 'Invalid Stripe signature' }), {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 🎯 Manejar eventos de Stripe
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      console.log('✅ Pago completado en Stripe:', session.id);
      console.log('Estado del pago:', session.payment_status);
      console.log('Modo de sesión:', session.mode);
      console.log('Metadatos de la sesión:', session.metadata);

      if (session.payment_status !== 'paid') {
        console.warn(
          '⚠️ Sesión completada pero el pago no está realizado. Estado:',
          session.payment_status
        );
        return new Response(JSON.stringify({ error: 'Payment not completed' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      const userId = session.metadata?.supabase_user_id;
      const consultationId = session.metadata?.consultation_id;
      const clientEmail = session.metadata?.client_email;
      const mode = session.mode;
      const accessType = session.metadata?.access_type;
      const purchaseType = session.metadata?.purchase_type; // 'package', 'subscription', 'consultation'

      // Validación básica de metadatos
      if (!userId) {
        console.warn('⚠️ Sesión sin supabase_user_id en los metadatos.');
        return new Response(JSON.stringify({ error: 'Missing supabase_user_id in metadata' }), {
          status: 400,
          headers: corsHeaders,
        });
      }

      console.log('🎯 Tipo de compra detectado:', {
        mode,
        accessType,
        purchaseType,
        hasConsultationId: !!consultationId,
      });

      // 🎯 PRIORIDAD 1: MANEJAR CONSULTAS (payment + consultation_id)
      if (consultationId || purchaseType === 'consultation') {
        console.log('🔄 Procesando pago único (consulta)...');

        // Actualizar la consulta en Supabase solo si tenemos consultationId
        if (consultationId) {
          const { data, error } = await supabase
            .from('consultations')
            .update({
              status: 'confirmed',
              stripe_session_id: session.id,
              amount: session.amount_total / 100,
              currency: session.currency,
              payment_status: session.payment_status,
            })
            .eq('id', consultationId)
            .select();

          if (error) {
            console.error('❌ Error actualizando consulta en Supabase:', error);
          } else {
            console.log('✅ Consulta actualizada correctamente en Supabase:', data);
          }
        } else {
          console.warn(
            '⚠️ Pago único sin consultation_id, pero procesando de todas formas para compatibilidad.'
          );
        }

        // 📨 Enviar correos para consultas
        if (clientEmail) {
          console.log('📧 Enviando correos para consulta...');

          // Cliente
          const clientRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${serviceRoleKey!}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: session.metadata?.consultation_type || 'consultation_confirmation',
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
            console.error('❌ Error enviando correo al cliente:', await clientRes.text());
          } else {
            console.log('✅ Correo al cliente enviado correctamente.');
          }

          // Administradores
          const adminRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${serviceRoleKey!}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              type: 'admin_consultation_notification',
              to: 'info@bsbcapital.io',
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
            console.error('❌ Error enviando correo a admin:', await adminRes.text());
          } else {
            console.log('✅ Correo a admin enviado correctamente.');
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 🎯 PRIORIDAD 2: MANEJAR MEMBRESÍAS ANUALES (payment sin consultation_id, access_type=membership)
      if (
        purchaseType === 'membership_annual' ||
        (mode === 'payment' && !consultationId && accessType === 'membership')
      ) {
        console.log('📅 Procesando membresía anual (pago único)...');

        // Mapeo entre priceId/productId de Stripe y plan_id en la tabla subscription_plans
        const priceToPlanMap: Record<string, string> = {
          // Membresía Exclusiva Anual
          price_1SaXpNJmSk3VG9oifsW4ajZ2: '9e38bc9e-7f4f-424c-87fe-6b4e453301d7',
          // Academia BSB Anual
          price_1SDKgoJmSk3VG9oiamJj88De: 'b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c',
        };

        // Obtener priceId de los line_items
        let priceId = null;
        try {
          const sessionDetails = await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${session.id}?expand[]=line_items`,
            {
              headers: { Authorization: `Bearer ${stripeSecretKey}` },
            }
          );
          const sessionData = await sessionDetails.json();
          priceId = sessionData.line_items?.data?.[0]?.price?.id;
          console.log('💰 Price ID de membresía anual:', priceId);
        } catch (err) {
          console.error('❌ Error obteniendo detalles de sesión:', err);
        }

        const planId = priceId ? priceToPlanMap[priceId] : null;

        if (!planId) {
          console.warn('⚠️ No se pudo mapear priceId a plan_id para membresía anual:', priceId);
        }

        // Crear registro en user_subscriptions
        const membershipPayload = {
          user_id: userId,
          plan_id: planId || null,
          stripe_customer_id: session.customer,
          status: 'active',
          started_at: new Date().toISOString(),
          current_period_start: new Date().toISOString(),
          // Para membresías anuales, el período termina en 1 año
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          auto_renew: false, // Membresías anuales no se renuevan automáticamente (requieren renovación manual)
          cancel_at_period_end: false,
          metadata: {
            client_name: session.metadata?.client_name,
            client_email: session.metadata?.client_email || session.customer_details?.email,
            plan_name: session.metadata?.plan_name,
            billing_cycle: 'annual',
            stripe_price_id: priceId,
            stripe_product_id: session.metadata?.stripe_product_id,
            purchase_type: 'membership_annual',
            access_type: 'membership',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('📋 Creando registro de membresía anual:', membershipPayload);

        const { data: createdMembership, error: membershipError } = await supabase
          .from('user_subscriptions')
          .insert(membershipPayload)
          .select();

        if (membershipError) {
          console.error(
            '❌ Error creando registro de membresía anual en Supabase:',
            membershipError
          );
        } else {
          console.log(
            '✅ Registro de membresía anual creado correctamente en Supabase:',
            createdMembership
          );

          // ✉️ ENVIAR EMAIL DE CONFIRMACIÓN DE MEMBRESÍA ANUAL
          if (clientEmail) {
            console.log('📧 Enviando email de confirmación de membresía anual a:', clientEmail);

            // Determinar el tipo de email según el plan
            const planName = session.metadata?.plan_name || 'Membresía Anual';
            const isAcademia =
              planName.toLowerCase().includes('academia') ||
              planName.toLowerCase().includes('academy');
            const emailType = isAcademia ? 'academia_bsb' : 'membership_annual';
            const adminEmailType = isAcademia
              ? 'admin_subscription_notification'
              : 'admin_membership_notification';

            console.log('📧 Plan detectado:', planName, '- Email type:', emailType);

            const emailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${serviceRoleKey!}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: emailType,
                to: clientEmail,
                data: {
                  name: session.metadata?.client_name || 'Usuario',
                  email: clientEmail,
                  planName: planName,
                  amount: session.amount_total / 100,
                  currency: session.currency,
                  sessionId: session.id,
                },
              }),
            });

            if (!emailRes.ok) {
              console.error('❌ Error enviando email de confirmación:', await emailRes.text());
            } else {
              console.log('✅ Email de confirmación enviado correctamente.');
            }

            // 📧 ENVIAR EMAIL AL ADMIN
            console.log('📧 Enviando notificación al admin...');
            const adminEmailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${serviceRoleKey!}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: adminEmailType,
                to: 'info@bsbcapital.io',
                data: {
                  clientName: session.metadata?.client_name || 'Usuario',
                  clientEmail,
                  planName: planName,
                  purchaseType: isAcademia ? 'academia' : 'membership_annual',
                  billingCycle: 'annual',
                  amount: session.amount_total / 100,
                  currency: session.currency,
                  sessionId: session.id,
                  stripeCustomerId: session.customer,
                },
              }),
            });

            if (!adminEmailRes.ok) {
              console.error('❌ Error enviando email al admin:', await adminEmailRes.text());
            } else {
              console.log('✅ Email al admin enviado correctamente.');
            }
          }

          // Actualizar perfil del usuario
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ Error actualizando perfil:', profileError);
          } else {
            console.log('✅ Perfil actualizado correctamente.');
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 🎯 PRIORIDAD 3: MANEJAR PAQUETES (payment sin consultation_id, access_type=package)
      if (
        purchaseType === 'package' ||
        (mode === 'payment' && !consultationId && accessType === 'package')
      ) {
        console.log('📦 Procesando compra de paquete (pago único)...');

        // Mapeo entre priceId/productId de Stripe y plan_id en la tabla subscription_plans
        const priceToPlanMap: Record<string, string> = {
          // Paquetes crypto
          price_1SSshWJmSk3VG9oiU1cBNWgf: '98e48de0-7d37-4e0f-afb8-da0e041d2ae2', // Onboarding Crypto
          price_1SSsfoJmSk3VG9oi70AskCZv: '235cb6d6-e532-4a0f-a657-863a68972851', // Gestión Tesorería Crypto
          price_1SDKb2JmSk3VG9oiJr1unLZZ: 'd7435ab7-d543-4bdc-9cc4-6874d286aa48', // Inversor Premium
        };

        // Obtener priceId de los line_items
        let priceId = null;
        try {
          const sessionDetails = await fetch(
            `https://api.stripe.com/v1/checkout/sessions/${session.id}?expand[]=line_items`,
            {
              headers: { Authorization: `Bearer ${stripeSecretKey}` },
            }
          );
          const sessionData = await sessionDetails.json();
          priceId = sessionData.line_items?.data?.[0]?.price?.id;
          console.log('💰 Price ID del paquete:', priceId);
        } catch (err) {
          console.error('❌ Error obteniendo detalles de sesión:', err);
        }

        const planId = priceId ? priceToPlanMap[priceId] : null;

        if (!planId) {
          console.warn('⚠️ No se pudo mapear priceId a plan_id para paquete:', priceId);
          // Continuar de todas formas, crear registro genérico
        }

        // Crear registro en user_subscriptions (aunque sea pago único, para mantener historial)
        const packagePayload = {
          user_id: userId,
          plan_id: planId || null,
          stripe_customer_id: session.customer,
          status: 'active',
          started_at: new Date().toISOString(),
          current_period_start: new Date().toISOString(),
          // Para paquetes anuales, el período termina en 1 año
          current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          auto_renew: false, // Paquetes no se renuevan automáticamente
          cancel_at_period_end: false,
          metadata: {
            client_name: session.metadata?.client_name,
            client_email: session.metadata?.client_email || session.customer_details?.email,
            plan_name: session.metadata?.plan_name,
            billing_cycle: session.metadata?.billing_cycle || 'annual',
            stripe_price_id: priceId,
            stripe_product_id: session.metadata?.stripe_product_id,
            purchase_type: 'package',
            access_type: 'package',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        console.log('📋 Creando registro de paquete:', packagePayload);

        const { data: createdPackage, error: packageError } = await supabase
          .from('user_subscriptions')
          .insert(packagePayload)
          .select();

        if (packageError) {
          console.error('❌ Error creando registro de paquete en Supabase:', packageError);
        } else {
          console.log('✅ Registro de paquete creado correctamente en Supabase:', createdPackage);

          // ✉️ ENVIAR EMAIL DE CONFIRMACIÓN DE PAQUETE
          if (clientEmail) {
            console.log('📧 Enviando email de confirmación de paquete a:', clientEmail);

            // Determinar el tipo de template según el plan_name (para soportar precios de prueba)
            const planName = session.metadata?.plan_name || '';
            let emailType = 'package_crypto_onboarding'; // Fallback

            if (planName.toLowerCase().includes('onboarding')) {
              emailType = 'package_crypto_onboarding';
            } else if (
              planName.toLowerCase().includes('tesorería') ||
              planName.toLowerCase().includes('treasury')
            ) {
              emailType = 'package_treasury_crypto';
            } else if (
              planName.toLowerCase().includes('inversor premium') ||
              planName.toLowerCase().includes('investor premium')
            ) {
              emailType = 'package_investor_premium';
            }

            console.log('📧 Plan detectado:', planName, '- Email type:', emailType);

            const emailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${serviceRoleKey!}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: emailType,
                to: clientEmail,
                data: {
                  name: session.metadata?.client_name || 'Usuario',
                  email: clientEmail,
                  packageName: session.metadata?.plan_name || 'Paquete BSB Capital',
                  amount: session.amount_total / 100,
                  currency: session.currency,
                  sessionId: session.id,
                },
              }),
            });

            if (!emailRes.ok) {
              console.error(
                '❌ Error enviando email de confirmación de paquete:',
                await emailRes.text()
              );
            } else {
              console.log('✅ Email de confirmación de paquete enviado correctamente.');
            }

            // 📧 ENVIAR EMAIL AL ADMIN
            console.log('📧 Enviando notificación al admin...');
            const adminEmailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${serviceRoleKey!}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                type: 'admin_package_notification',
                to: 'info@bsbcapital.io',
                data: {
                  clientName: session.metadata?.client_name || 'Usuario',
                  clientEmail,
                  packageName: session.metadata?.plan_name || 'Paquete BSB Capital',
                  purchaseType: 'package',
                  amount: session.amount_total / 100,
                  currency: session.currency,
                  sessionId: session.id,
                  stripeCustomerId: session.customer,
                },
              }),
            });

            if (!adminEmailRes.ok) {
              console.error('❌ Error enviando email al admin:', await adminEmailRes.text());
            } else {
              console.log('✅ Email al admin enviado correctamente.');
            }
          }

          // Actualizar perfil del usuario
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ Error actualizando perfil:', profileError);
          } else {
            console.log('✅ Perfil actualizado correctamente.');
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 🎯 PRIORIDAD 4: MANEJAR SUSCRIPCIONES MENSUALES (MEMBRESÍAS RECURRENTES)
      if (
        mode === 'subscription' ||
        purchaseType === 'membership_monthly' ||
        (accessType === 'membership' && !purchaseType?.includes('annual'))
      ) {
        console.log('🔄 Procesando nueva suscripción mensual/membresía recurrente...');

        // Mapeo entre priceId de Stripe y plan_id en la tabla subscription_plans
        const priceToPlanMap: Record<string, string> = {
          // Membresía Exclusiva (actualizado 4/12/2025)
          price_1SaXofJmSk3VG9oigjDZtcF6: '4f27f890-55ea-4f61-b6f9-3b02b3a358fa', // Membresía Exclusiva mensual
          price_1SaXpNJmSk3VG9oifsW4ajZ2: '9e38bc9e-7f4f-424c-87fe-6b4e453301d7', // Membresía Exclusiva anual

          // Academia BSB (actualizado 4/12/2025 - UUID fijo)
          price_1SaXVjJmSk3VG9oix0Pu2N9J: 'b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c', // Academia mensual 20€
          price_1SDKgoJmSk3VG9oiamJj88De: 'b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c', // Academia anual 200€ (mismo plan)

          // Planes legacy (mantener por compatibilidad)
          price_1SDKVXJmSk3VG9oiLEm9JOoD: 'a9097647-e0bc-424c-bacb-7ccbae7a0853', // Premium Investor anual
          price_1SDKb2JmSk3VG9oiJr1unLZZ: 'd7435ab7-d543-4bdc-9cc4-6874d286aa48', // Inversor Premium (pago único anual)

          // Paquetes crypto
          price_1SSshWJmSk3VG9oiU1cBNWgf: '98e48de0-7d37-4e0f-afb8-da0e041d2ae2', // Onboarding Crypto
          price_1SSsfoJmSk3VG9oi70AskCZv: '235cb6d6-e532-4a0f-a657-863a68972851', // Gestión de Tesorería
        };

        // Para suscripciones, el subscription ID puede ser null inicialmente
        const subscriptionId = session.subscription;
        console.log('Stripe subscription ID:', subscriptionId);

        if (!subscriptionId) {
          console.warn(
            '⚠️ No se encontró subscription_id en la sesión - puede ser normal para suscripciones nuevas'
          );
          console.log('📋 Intentando obtener suscripción del customer...');

          // Intentar obtener la suscripción más reciente del customer
          const subscriptionsRes = await fetch(
            `https://api.stripe.com/v1/subscriptions?customer=${session.customer}&limit=1`,
            {
              headers: { Authorization: `Bearer ${stripeSecretKey}` },
            }
          );
          const subscriptionsData = await subscriptionsRes.json();

          if (subscriptionsData.data && subscriptionsData.data.length > 0) {
            const latestSubscription = subscriptionsData.data[0];
            console.log('✅ Suscripción encontrada:', latestSubscription.id);

            // Obtener el priceId de la suscripción para mapear al plan correcto
            const priceId = latestSubscription.items?.data?.[0]?.price?.id;
            const planId = priceToPlanMap[priceId];

            if (!planId) {
              console.error('❌ No se pudo mapear priceId a plan_id:', priceId);
              return new Response(JSON.stringify({ error: 'Invalid priceId mapping' }), {
                status: 400,
                headers: corsHeaders,
              });
            }

            console.log('✅ Plan mapeado:', { priceId, planId });

            // CREAR el registro en user_subscriptions (no actualizar)
            const subscriptionPayload = {
              user_id: userId,
              plan_id: planId,
              stripe_subscription_id: latestSubscription.id,
              stripe_customer_id: session.customer,
              status: latestSubscription.status,
              started_at: new Date(latestSubscription.created * 1000).toISOString(),
              current_period_start: new Date(
                latestSubscription.current_period_start * 1000
              ).toISOString(),
              current_period_end: new Date(
                latestSubscription.current_period_end * 1000
              ).toISOString(),
              auto_renew: !latestSubscription.cancel_at_period_end,
              cancel_at_period_end: latestSubscription.cancel_at_period_end || false,
              trial_start: latestSubscription.trial_start
                ? new Date(latestSubscription.trial_start * 1000).toISOString()
                : null,
              trial_end: latestSubscription.trial_end
                ? new Date(latestSubscription.trial_end * 1000).toISOString()
                : null,
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

            console.log('📋 Creando registro de suscripción:', subscriptionPayload);

            const { data: createdSubscription, error: subscriptionError } = await supabase
              .from('user_subscriptions')
              .insert(subscriptionPayload)
              .select();

            if (subscriptionError) {
              console.error('❌ Error creando suscripción en Supabase:', subscriptionError);
            } else {
              console.log('✅ Suscripción creada correctamente en Supabase:', createdSubscription);

              // ✉️ ENVIAR EMAIL DE CONFIRMACIÓN DE MEMBRESÍA
              if (createdSubscription && createdSubscription.length > 0) {
                const clientEmail =
                  session.metadata?.client_email || session.customer_details?.email;
                const clientName = session.metadata?.client_name || 'Usuario';
                const planName = session.metadata?.plan_name || 'Membresía';
                const billingCycle = session.metadata?.billing_cycle || 'monthly';

                console.log('📧 Enviando email de confirmación de membresía a:', clientEmail);

                // Determinar el tipo de email según el plan y ciclo de facturación
                let emailType = 'membership_monthly'; // por defecto
                let adminEmailType = 'admin_subscription_notification'; // por defecto para mensuales

                if (
                  planName.toLowerCase().includes('academia') ||
                  planName.toLowerCase().includes('academy')
                ) {
                  // Academia BSB - mismo template para mensual y anual
                  emailType = 'academia_bsb';
                  // Academia anual usa admin_membership_notification, mensual usa admin_subscription_notification
                  adminEmailType =
                    billingCycle === 'annual' || billingCycle === 'year'
                      ? 'admin_membership_notification'
                      : 'admin_subscription_notification';
                } else if (
                  planName.toLowerCase().includes('exclusiva') ||
                  planName.toLowerCase().includes('membresía bsb')
                ) {
                  // Membresía Exclusiva
                  emailType =
                    billingCycle === 'annual' || billingCycle === 'year'
                      ? 'membership_annual'
                      : 'membership_exclusive_monthly';
                  adminEmailType =
                    billingCycle === 'annual' || billingCycle === 'year'
                      ? 'admin_membership_notification'
                      : 'admin_subscription_notification';
                }

                console.log('📧 Tipo de email a enviar:', emailType);

                const emailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
                  method: 'POST',
                  headers: {
                    Authorization: `Bearer ${serviceRoleKey!}`,
                    'Content-Type': 'application/json',
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
                  console.error(
                    '❌ Error enviando email de confirmación de membresía:',
                    await emailRes.text()
                  );
                } else {
                  console.log('✅ Email de confirmación de membresía enviado correctamente.');
                }

                // 📧 ENVIAR EMAIL AL ADMIN
                console.log('📧 Enviando notificación al admin...');
                const adminEmailRes = await fetch(
                  `${supabaseUrl}/functions/v1/resend-email-secure`,
                  {
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${serviceRoleKey!}`,
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                      type: adminEmailType,
                      to: 'info@bsbcapital.io',
                      data: {
                        clientName,
                        clientEmail,
                        planName,
                        purchaseType: planName.toLowerCase().includes('academia')
                          ? 'academia'
                          : 'membership_monthly',
                        billingCycle,
                        amount: session.amount_total / 100,
                        currency: session.currency,
                        sessionId: latestSubscription.id,
                        subscriptionId: latestSubscription.id,
                        stripeCustomerId: session.customer,
                      },
                    }),
                  }
                );

                if (!adminEmailRes.ok) {
                  console.error('❌ Error enviando email al admin:', await adminEmailRes.text());
                } else {
                  console.log('✅ Email al admin enviado correctamente.');
                }
              }
            }
          } else {
            console.warn(
              '⚠️ No se encontraron suscripciones para el customer. Esto puede ser normal si el pago aún se está procesando.'
            );
            // Actualizar solo el estado sin subscription_id
            const { error: updateError } = await supabase
              .from('user_subscriptions')
              .update({
                status: 'pending', // Estado temporal hasta que se confirme
                updated_at: new Date().toISOString(),
              })
              .eq('stripe_customer_id', session.customer)
              .eq('user_id', userId);

            if (updateError) {
              console.error('❌ Error actualizando estado temporal:', updateError);
            }
          }

          // Actualizar perfil del usuario
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);
          if (profileError) {
            console.error('❌ Error actualizando perfil:', profileError);
          } else {
            console.log('✅ Perfil actualizado correctamente.');
          }

          return new Response(JSON.stringify({ received: true }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Si SÍ hay subscription ID, procesar normalmente
        // Obtener detalles de la suscripción de Stripe
        const subscriptionRes = await fetch(
          `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
          {
            headers: { Authorization: `Bearer ${stripeSecretKey}` },
          }
        );
        const subscriptionData = await subscriptionRes.json();

        if (!subscriptionRes.ok) {
          console.error('❌ Error obteniendo suscripción de Stripe:', subscriptionData);
          return new Response(JSON.stringify({ error: 'Failed to fetch subscription data' }), {
            status: 400,
            headers: corsHeaders,
          });
        }

        console.log('Datos de suscripción obtenidos:', {
          id: subscriptionData.id,
          current_period_start: subscriptionData.current_period_start,
          current_period_end: subscriptionData.current_period_end,
          status: subscriptionData.status,
        });

        // Calcular fechas de periodo
        const now = new Date();
        const periodStart = subscriptionData.current_period_start
          ? new Date(subscriptionData.current_period_start * 1000).toISOString()
          : now.toISOString();
        const periodEnd = subscriptionData.current_period_end
          ? new Date(subscriptionData.current_period_end * 1000).toISOString()
          : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 días por defecto

        // Actualizar el registro en user_subscriptions con el stripe_subscription_id
        const { data: updatedSubscription, error: updateError } = await supabase
          .from('user_subscriptions')
          .update({
            stripe_subscription_id: subscriptionId,
            status: 'active',
            started_at: now.toISOString(),
            current_period_start: periodStart,
            current_period_end: periodEnd,
            updated_at: now.toISOString(),
          })
          .eq('stripe_customer_id', session.customer)
          .eq('user_id', userId)
          .select();

        if (updateError) {
          console.error('❌ Error actualizando suscripción en Supabase:', updateError);
        } else {
          console.log('✅ Suscripción actualizada correctamente en Supabase:', updatedSubscription);

          // ✉️ ENVIAR EMAIL DE CONFIRMACIÓN DE MEMBRESÍA
          const clientEmail = session.metadata?.client_email || session.customer_details?.email;
          const clientName = session.metadata?.client_name || 'Usuario';
          const planName = session.metadata?.plan_name || 'Membresía';
          const billingCycle = session.metadata?.billing_cycle || 'monthly';

          console.log('📧 Enviando email de confirmación de membresía a:', clientEmail);

          // Determinar el tipo de email según el plan y ciclo de facturación
          let emailType = 'academia_bsb'; // por defecto para academia
          if (
            planName.toLowerCase().includes('exclusiva') ||
            planName.toLowerCase().includes('membresía bsb')
          ) {
            // Membresía Exclusiva
            emailType =
              billingCycle === 'annual' || billingCycle === 'year'
                ? 'membership_annual'
                : 'membership_exclusive_monthly';
          } else if (planName.toLowerCase().includes('academia')) {
            emailType = 'academia_bsb';
          }

          const emailRes = await fetch(`${supabaseUrl}/functions/v1/resend-email-secure`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${serviceRoleKey!}`,
              'Content-Type': 'application/json',
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
            console.error(
              '❌ Error enviando email de confirmación de membresía:',
              await emailRes.text()
            );
          } else {
            console.log('✅ Email de confirmación de membresía enviado correctamente.');
          }

          // También actualizar el perfil del usuario
          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              membership_tier: 'premium', // Ajustar según el plan
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ Error actualizando perfil:', profileError);
          } else {
            console.log('✅ Perfil actualizado correctamente.');
          }
        }

        return new Response(JSON.stringify({ received: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // 🎯 CASO FALLBACK: Si no coincide con ninguno de los casos anteriores
      console.warn(
        '⚠️ Sesión no procesada - no coincide con los criterios de consulta, membresía anual, paquete o suscripción mensual',
        {
          mode,
          accessType,
          purchaseType,
          hasConsultationId: !!consultationId,
          sessionId: session.id,
          metadata: session.metadata,
        }
      );
    } else if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as any;
      console.log('✅ Pago de suscripción exitoso:', invoice.id);

      const subscriptionId = invoice.subscription;

      // 🧾 Renovar la suscripción en Supabase
      const { data: renewedSubscription, error: renewError } = await supabase
        .from('user_subscriptions')
        .update({
          current_period_end: new Date(invoice.period_end * 1000).toISOString(),
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId)
        .select();

      if (renewError) {
        console.error('❌ Error renovando suscripción en Supabase:', renewError);
      } else {
        console.log('✅ Suscripción renovada correctamente en Supabase:', renewedSubscription);

        // También actualizar el perfil del usuario para mantener consistencia
        if (renewedSubscription && renewedSubscription.length > 0) {
          const userId = renewedSubscription[0].user_id;

          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'active',
              subscription_expires_at: new Date(invoice.period_end * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ Error actualizando perfil en renovación:', profileError);
          } else {
            console.log('✅ Perfil actualizado en renovación.');
          }
        }
      }
    } else if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;
      console.log('🔄 Suscripción actualizada:', subscription.id);

      // Actualizar la suscripción en Supabase
      const updateData: any = {
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      };

      // Si se ha marcado para cancelar al final del período
      if (subscription.cancel_at_period_end) {
        console.log('⚠️ Suscripción marcada para cancelar al final del período');
      }

      const { data: updatedSubscription, error: updateError } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('stripe_subscription_id', subscription.id)
        .select();

      if (updateError) {
        console.error('❌ Error actualizando suscripción en Supabase:', updateError);
      } else {
        console.log('✅ Suscripción actualizada correctamente en Supabase:', updatedSubscription);
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as any;
      console.log('❌ Suscripción cancelada:', subscription.id);

      // 🧾 Cancelar la suscripción en Supabase
      const { data: cancelledSubscription, error: cancelError } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscription.id)
        .select();

      if (cancelError) {
        console.error('❌ Error cancelando suscripción en Supabase:', cancelError);
      } else {
        console.log('✅ Suscripción cancelada correctamente en Supabase:', cancelledSubscription);

        // También actualizar el perfil del usuario
        if (cancelledSubscription && cancelledSubscription.length > 0) {
          const userId = cancelledSubscription[0].user_id;

          const { error: profileError } = await supabase
            .from('profiles')
            .update({
              subscription_status: 'cancelled',
              updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

          if (profileError) {
            console.error('❌ Error actualizando perfil en cancelación:', profileError);
          } else {
            console.log('✅ Perfil actualizado en cancelación.');
          }
        }
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Error en Stripe Webhook:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
