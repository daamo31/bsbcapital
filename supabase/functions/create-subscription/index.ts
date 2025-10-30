import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from "https://unpkg.com/@supabase/supabase-js@2.39.3/dist/index.js";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      planId, 
      userId, 
      stripePaymentIntentId,
      amount,
      currency,
      customerEmail,
      customerName 
    } = await req.json()

    console.log('Processing Stripe payment to subscription:', {
      planId,
      userId,
      stripePaymentIntentId,
      amount,
      currency
    })

    // 1. Crear el registro de pago
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        stripe_payment_intent_id: stripePaymentIntentId,
        amount: amount,
        currency: currency,
        status: 'succeeded',
        payment_method: 'stripe',
        metadata: {
          customer_email: customerEmail,
          customer_name: customerName,
          plan_id: planId
        }
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error creating payment record:', paymentError)
      throw paymentError
    }

    // 2. Obtener información del plan
    const { data: plan, error: planError } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('id', planId)
      .single()

    if (planError) {
      console.error('Error fetching plan:', planError)
      throw planError
    }

    // 3. Calcular fecha de expiración
    let expiresAt = null
    if (plan.duration_months) {
      const expiryDate = new Date()
      expiryDate.setMonth(expiryDate.getMonth() + plan.duration_months)
      expiresAt = expiryDate.toISOString()
    }

    // 4. Crear la suscripción
    const { data: subscription, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'active',
        stripe_customer_id: null, // Se puede actualizar si usas Stripe Customer
        started_at: new Date().toISOString(),
        expires_at: expiresAt,
        auto_renew: false // Por defecto no auto-renovar para pagos únicos
      })
      .select()
      .single()

    if (subscriptionError) {
      console.error('Error creating subscription:', subscriptionError)
      throw subscriptionError
    }

    // 5. Actualizar el pago con la referencia de suscripción
    await supabase
      .from('payments')
      .update({ subscription_id: subscription.id })
      .eq('id', payment.id)

    // 6. Simular webhook de Hotmart (para compatibilidad con sistema existente)
    const mockHotmartWebhook = {
      event: 'PURCHASE_COMPLETE',
      data: {
        product: { 
          id: planId,
          name: plan.name
        },
        buyer: { 
          email: customerEmail,
          name: customerName
        },
        purchase: {
          payment: { status: 'APPROVED' },
          order_date: new Date().toISOString(),
          price: { 
            value: amount,
            currency_value: currency 
          },
          transaction: stripePaymentIntentId,
          subscription_id: subscription.id
        }
      }
    }

    // 7. Procesar el webhook simulado (si tienes una función de webhook existente)
    try {
      const { data: webhookResult, error: webhookError } = await supabase.functions.invoke(
        'hotmart-webhook',
        { 
          body: mockHotmartWebhook,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (webhookError) {
        console.error('Warning: Webhook simulation failed:', webhookError)
        // No lanzar error aquí porque el pago ya se procesó correctamente
      } else {
        console.log('Webhook simulation successful:', webhookResult)
      }
    } catch (webhookError) {
      console.error('Warning: Could not simulate webhook:', webhookError)
      // Continuar, ya que el pago principal ya está procesado
    }

    // 8. Respuesta exitosa
    return new Response(
      JSON.stringify({
        success: true,
        subscription,
        payment,
        plan,
        message: 'Suscripción creada exitosamente'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error: unknown) {
    console.error('Error processing subscription:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        details: 'Error al procesar la suscripción'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})