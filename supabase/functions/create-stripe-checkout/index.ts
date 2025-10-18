import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno';

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
    
    console.log('Request data:', { priceId, mode, email, metadata })

    // Verificar variables de entorno
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!stripeSecretKey) {
      throw new Error('STRIPE_SECRET_KEY not configured. Please set this environment variable in Supabase Dashboard > Settings > Edge Functions > Environment Variables')
    }
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL not configured')
    }
    if (!supabaseServiceKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY not configured')
    }

    // Inicializar Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    // Inicializar Supabase
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Solo crear consulta si es un pago único (no suscripción)
    let consultation = null;
    
    if (mode !== 'subscription') {
      // Verificar que metadata existe y tiene los campos necesarios
      if (!metadata || !metadata.client_name) {
        console.error('Missing metadata or client_name for consultation:', { metadata, mode })
        return Response.json(
          { error: 'Missing required consultation data (client_name)' }, 
          { status: 400 }
        )
      }

      const consultationData = {
        client_name: metadata.client_name,
        client_email: metadata.client_email || email,
        service: metadata.consultation_type || metadata.service || 'general',
        booking_date: metadata.scheduled_at || metadata.booking_date,
        notes: metadata.description || metadata.notes,
        status: 'pending_payment',
        title: `Consulta ${metadata.consultation_type || 'general'}`,
      }

      console.log('Creating consultation with data:', consultationData)

      const { data: consultationResult, error: consultationError } = await supabase
        .from('consultations')
        .insert(consultationData)
        .select()
        .single()

      if (consultationError) {
        console.error('❌ Error creating consultation:', {
          error: consultationError,
          dataSent: consultationData,
          supabaseUrl,
          table: 'consultations',
        })
        return Response.json(
          { error: `Failed to create consultation record: ${consultationError.message}` },
          { status: 500 }
        )
      }

      consultation = consultationResult;
      console.log('Consultation created successfully:', consultation.id)
    }    // Crear sesión de Stripe
    console.log('Creating Stripe session for mode:', mode, consultation ? `consultation: ${consultation.id}` : 'subscription')
    console.log('Stripe session data:', { priceId, mode, email, origin: req.headers.get('origin') })
    
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
      success_url: mode === 'subscription' 
        ? `${req.headers.get('origin') || 'https://localhost:5173'}/compra-exitosa?session_id={CHECKOUT_SESSION_ID}`
        : `${req.headers.get('origin') || 'https://localhost:5173'}/consultation-post-payment?session_id={CHECKOUT_SESSION_ID}&consultation_id=${consultation?.id}`,
      cancel_url: mode === 'subscription'
        ? `${req.headers.get('origin') || 'https://localhost:5173'}/membresias`
        : `${req.headers.get('origin') || 'https://localhost:5173'}/consultoria`,
      metadata: {
        ...metadata,
        ...(consultation && { consultation_id: consultation.id }),
      },
    })
    
    console.log('Stripe session created successfully:', session.id)

    // Actualizar la consulta con el session_id de Stripe (solo si existe)
    if (consultation) {
      await supabase
        .from('consultations')
        .update({ stripe_session_id: session.id })
        .eq('id', consultation.id)
    }

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