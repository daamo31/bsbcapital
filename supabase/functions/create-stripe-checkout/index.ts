import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, mode, email, metadata } = await req.json()

    // Inicializar Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2023-10-16',
    })

    // Inicializar Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Crear la consulta en la base de datos con la estructura alineada
    const consultationData = {
      consultation_type: metadata.consultation_type || metadata.service,
      scheduled_at: metadata.scheduled_at || metadata.booking_date,
      duration_minutes: parseInt(metadata.duration_minutes) || (metadata.duration === '30min' ? 30 : 60),
      description: metadata.description || metadata.notes,
      status: 'pending_payment',
      client_name: metadata.client_name,
      client_email: metadata.client_email,
      // Agregar consultant_id por defecto (asumiendo que hay un consultor principal)
      consultant_id: '00000000-0000-0000-0000-000000000000' // UUID por defecto, actualizar según sea necesario
    }

    const { data: consultation, error: consultationError } = await supabase
      .from('consultations')
      .insert(consultationData)
      .select()
      .single()

    if (consultationError) {
      console.error('Error creating consultation:', consultationError)
      throw new Error('Failed to create consultation record')
    }

    // Crear sesión de Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode || 'payment',
      customer_email: email,
      success_url: `${req.headers.get('origin') || 'https://localhost:5173'}/consultation-post-payment?session_id={CHECKOUT_SESSION_ID}&consultation_id=${consultation.id}`,
      cancel_url: `${req.headers.get('origin') || 'https://localhost:5173'}/consultoria`,
      metadata: {
        ...metadata,
        consultation_id: consultation.id,
      },
    })

    // Actualizar la consulta con el session_id de Stripe
    await supabase
      .from('consultations')
      .update({ stripe_session_id: session.id })
      .eq('id', consultation.id)

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})