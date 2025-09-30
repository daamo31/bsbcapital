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

    // Configuración de Hotmart
    const HOTMART_CLIENT_ID = Deno.env.get('HOTMART_CLIENT_ID') || Deno.env.get('VITE_HOTMART_CLIENT_ID')
    const HOTMART_CLIENT_SECRET = Deno.env.get('HOTMART_CLIENT_SECRET') || Deno.env.get('VITE_HOTMART_CLIENT_SECRET')
    const HOTMART_BASIC_AUTH = Deno.env.get('HOTMART_BASIC_AUTH') || Deno.env.get('VITE_HOTMART_BASIC_AUTH')
    const HOTMART_PRODUCT_ID = Deno.env.get('HOTMART_PRODUCT_ID') || Deno.env.get('VITE_HOTMART_PRODUCT_ID')

    if (!HOTMART_CLIENT_ID || !HOTMART_CLIENT_SECRET || !HOTMART_BASIC_AUTH) {
      return new Response(
        JSON.stringify({ error: 'Hotmart credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text()
      console.error('Error obteniendo token de Hotmart:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Hotmart' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Crear checkout link usando Hotmart API
    const checkoutResponse = await fetch('https://api-sec-vlc.hotmart.com/payments/api/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: {
          id: productId
        },
        buyer: {
          email: userEmail
        },
        settings: {
          return_url: returnUrl || 'https://bsbcapital.io/academia/dashboard',
          max_installments: 12,
          currency_code: 'EUR'
        }
      })
    })

    if (!checkoutResponse.ok) {
      const error = await checkoutResponse.text()
      console.error('Error creando checkout en Hotmart:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to create checkout' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const checkoutData = await checkoutResponse.json()

    // 3. Guardar información del checkout en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { error: dbError } = await supabase
      .from('hotmart_checkouts')
      .insert({
        user_id: userId,
        product_id: productId,
        checkout_id: checkoutData.checkout_id,
        checkout_url: checkoutData.checkout_url,
        status: 'pending',
        created_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Error guardando checkout en DB:', dbError)
      // Continuamos aunque falle la DB, el checkout sigue siendo válido
    }

    return new Response(
      JSON.stringify({
        success: true,
        checkout_url: checkoutData.checkout_url,
        checkout_id: checkoutData.checkout_id
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en hotmart-checkout:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})