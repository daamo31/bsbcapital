import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HotmartCheckoutRequest {
  productId: string
  userEmail: string
  userId: string
  returnUrl?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { productId, userEmail, userId, returnUrl }: HotmartCheckoutRequest = await req.json()

    if (!productId || !userEmail || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Configuración de Hotmart (hardcodeada para pruebas)
    const HOTMART_CLIENT_ID = '3b43af6e-d09d-4d7f-ac17-b6dba4354c2f'
    const HOTMART_CLIENT_SECRET = '4074e45b-3375-47b9-9ee1-2797a1611698'
    const HOTMART_BASIC_AUTH = 'Basic M2I0M2FmNmUtZDA5ZC00ZDdmLWFjMTctYjZkYmE0MzU0YzJmOjQwNzRlNDViLTMzNzUtNDdiOS05ZWUxLTI3OTdhMTYxMTY5OA=='

    console.log('Hotmart config:', { 
      clientId: HOTMART_CLIENT_ID,
      hasSecret: !!HOTMART_CLIENT_SECRET,
      hasAuth: !!HOTMART_BASIC_AUTH 
    })

    // 1. Obtener token de acceso de Hotmart
    const tokenResponse = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': HOTMART_BASIC_AUTH,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: HOTMART_CLIENT_ID,
        client_secret: HOTMART_CLIENT_SECRET
      })
    })

    console.log('Token response status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Token error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to get Hotmart token', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    console.log('Token obtained successfully')

    // 2. Crear checkout
    const checkoutData = {
      productId: productId,
      buyerInformation: {
        email: userEmail,
        name: userEmail.split('@')[0], // Usar parte del email como nombre por defecto
      },
      paymentMode: 'TRANSPARENT_CHECKOUT',
      urlReturn: returnUrl || 'https://bsbcapital.io/compra-exitosa'
    }

    console.log('Creating checkout with data:', checkoutData)

    const checkoutResponse = await fetch('https://developers.hotmart.com/payments/api/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutData)
    })

    console.log('Checkout response status:', checkoutResponse.status)

    if (!checkoutResponse.ok) {
      const errorText = await checkoutResponse.text()
      console.error('Checkout error:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to create Hotmart checkout', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const checkoutResult = await checkoutResponse.json()
    console.log('Checkout created successfully')

    // 3. Guardar en base de datos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase
      .from('hotmart_checkouts')
      .insert({
        user_id: userId,
        email: userEmail,
        name: userEmail.split('@')[0],
        product_id: productId,
        checkout_url: checkoutResult.checkoutUrl || checkoutResult.url,
        status: 'pending',
        hotmart_data: checkoutResult
      })

    if (dbError) {
      console.error('Database error:', dbError)
      // No fallar si hay error en DB, devolver el checkout
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutResult.checkoutUrl || checkoutResult.url,
        checkout_id: checkoutResult.checkoutId || checkoutResult.id
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})