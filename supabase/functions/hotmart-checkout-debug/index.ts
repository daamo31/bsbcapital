import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== INICIO DE FUNCIÓN HOTMART CHECKOUT DEBUG ===')
    
    // 1. Verificar datos de entrada
    const requestBody = await req.json()
    console.log('Request body recibido:', requestBody)
    
    const { productId, userEmail, userId, returnUrl, userName } = requestBody
    console.log('Datos extraídos:', { productId, userEmail, userId, returnUrl, userName })

    if (!productId || !userEmail || !userId) {
      console.log('Error: Faltan campos requeridos')
      return new Response(
        JSON.stringify({ error: 'Missing required fields', received: { productId, userEmail, userId } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Configuración de Hotmart
    const HOTMART_CLIENT_ID = '3b43af6e-d09d-4d7f-ac17-b6dba4354c2f'
    const HOTMART_CLIENT_SECRET = '4074e45b-3375-47b9-9ee1-2797a1611698'
    const HOTMART_BASIC_AUTH = 'Basic M2I0M2FmNmUtZDA5ZC00ZDdmLWFjMTctYjZkYmE0MzU0YzJmOjQwNzRlNDViLTMzNzUtNDdiOS05ZWUxLTI3OTdhMTYxMTY5OA=='

    console.log('Credenciales Hotmart configuradas:', {
      clientId: HOTMART_CLIENT_ID,
      hasSecret: !!HOTMART_CLIENT_SECRET,
      hasAuth: !!HOTMART_BASIC_AUTH
    })

    // 3. Obtener token de acceso
    console.log('Obteniendo token de Hotmart...')
    
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: HOTMART_CLIENT_ID,
      client_secret: HOTMART_CLIENT_SECRET
    })

    const tokenResponse = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': HOTMART_BASIC_AUTH,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    })

    console.log('Token response status:', tokenResponse.status)

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('Error obteniendo token:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Hotmart', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    console.log('Token obtenido exitosamente:', { hasToken: !!tokenData.access_token })

    // 4. Crear checkout REAL usando la API de Hotmart (misma estructura que funciona)
    console.log('Creando checkout REAL en Hotmart...')
    
    const checkoutData = {
      productId: productId,
      buyerInformation: {
        email: userEmail,
        name: userName || userEmail.split('@')[0], // Usar userName si está disponible
      },
      paymentMode: 'TRANSPARENT_CHECKOUT',
      urlReturn: returnUrl || 'https://bsbcapital.io/compra-exitosa'
    }

    console.log('Datos para checkout:', checkoutData)

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
      console.error('Error creando checkout:', errorText)
      return new Response(
        JSON.stringify({ error: 'Failed to create Hotmart checkout', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const checkoutResult = await checkoutResponse.json()
    console.log('Checkout REAL creado exitosamente:', checkoutResult)
    
    const realCheckoutUrl = checkoutResult.checkoutUrl || checkoutResult.url || checkoutResult.checkout_url
    
    // 5. Intentar guardar en Supabase (opcional)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (supabaseUrl && supabaseServiceKey) {
        console.log('Guardando en Supabase...')
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { error: dbError } = await supabase
          .from('hotmart_checkouts')
          .insert({
            user_id: userId,
            email: userEmail,
            name: userEmail.split('@')[0],
            product_id: productId,
            checkout_url: realCheckoutUrl,
            status: 'pending',
            hotmart_data: checkoutResult
          })

        if (dbError) {
          console.log('Error DB (no crítico):', dbError)
        } else {
          console.log('Guardado en DB exitoso')
        }
      }
    } catch (dbError) {
      console.log('Error DB capturado (no crítico):', dbError)
    }

    console.log('=== FUNCIÓN COMPLETADA EXITOSAMENTE ===')
    
    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: realCheckoutUrl,
        transactionId: checkoutResult.transactionId || checkoutResult.id || `real-${Date.now()}`,
        debug: false,
        message: 'Real Hotmart checkout URL generated successfully'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== ERROR CRÍTICO EN FUNCIÓN ===')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message,
        type: error.constructor.name
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})