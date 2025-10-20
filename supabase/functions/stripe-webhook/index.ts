import { serve } from "https://deno.land/std@0.224.0/http/server.ts" // Recomiendo actualizar la versión de Deno std
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Definición de CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

// ----------------------------------------------------
// ⭐ FUNCIÓN DE VERIFICACIÓN ASÍNCRONA (FUERA DEL HANDLER)
// ----------------------------------------------------
/**
 * Verifica la firma del webhook de Stripe de forma asíncrona (necesario para Deno/crypto.subtle).
 */
async function verifyStripeSignature(payload: string, sigHeader: string, secret: string): Promise<boolean> {
  if (!sigHeader) return false;

  try {
    const [timestampPart, v1Part] = sigHeader.split(',').map(s => s.trim());
    const timestamp = timestampPart.split('=')[1];
    const signature = v1Part.split('=')[1]; // Firma enviada por Stripe
    const signedPayload = `${timestamp}.${payload}`;
    
    // Preparar datos
    const key = new TextEncoder().encode(secret);
    const data = new TextEncoder().encode(signedPayload);

    // 1. Importar la clave (ASÍNCRONO)
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // 2. Generar la firma esperada (ASÍNCRONO)
    const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, data);
    
    // 3. Convertir a formato Hex (la forma en que Stripe la envía)
    const expected = Array.from(new Uint8Array(sigBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
      
    return expected === signature;
  } catch (e) {
    console.error("Error during signature verification:", e);
    return false;
  }
}

// ----------------------------------------------------
// MANEJADOR PRINCIPAL DEL WEBHOOK
// ----------------------------------------------------
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    const body = await req.text() // El cuerpo se consume aquí

    if (!signature) {
      throw new Error('No Stripe signature found')
    }

    // ⭐ Esperamos el resultado de la verificación antes de continuar
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    
    if (!isValid) {
      throw new Error('Invalid Stripe signature')
    }

    // Parsear el evento manualmente
    const event = JSON.parse(body)

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        // Actualizar la consulta cuando se complete el pago
        if (session.metadata?.consultation_id) {
          // Mejorar la robustez con manejo de errores de Supabase
          const { error } = await supabase
            .from('consultations')
            .update({
              status: 'confirmed', 
              stripe_session_id: session.id,
            })
            .eq('id', session.metadata.consultation_id)

          if (error) {
            console.error('Supabase update error:', error)
            // Lanza un error 400 para que Stripe reintente
            throw new Error('Database update failed');
          }
        }
        break
      }
      case 'payment_intent.succeeded':
        console.log('Payment succeeded:', event.data.object.id)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, // Usar 400 para errores de validación o 500 para errores internos (Stripe reintenta)
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})