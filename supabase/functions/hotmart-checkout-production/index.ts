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
  userName?: string
  returnUrl?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== HOTMART CHECKOUT PRODUCTION ===')
    
    const { productId, userEmail, userId, userName, returnUrl }: HotmartCheckoutRequest = await req.json()
    console.log('Request data:', { productId, userEmail, userId, userName, returnUrl })

    if (!productId || !userEmail || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Configuración de Hotmart
    const HOTMART_CLIENT_ID = '3b43af6e-d09d-4d7f-ac17-b6dba4354c2f'
    const HOTMART_CLIENT_SECRET = '4074e45b-3375-47b9-9ee1-2797a1611698'
    const HOTMART_BASIC_AUTH = 'Basic M2I0M2FmNmUtZDA5ZC00ZDdmLWFjMTctYjZkYmE0MzU0YzJmOjQwNzRlNDViLTMzNzUtNDdiOS05ZWUxLTI3OTdhMTYxMTY5OA=='

    // 1. Intentar autenticación con Hotmart
    console.log('Intentando autenticación con Hotmart...')
    
    const tokenParams = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: HOTMART_CLIENT_ID,
      client_secret: HOTMART_CLIENT_SECRET
    })

    let accessToken = null
    let useRealAPI = false

    try {
      const tokenResponse = await fetch('https://api-sec-vlc.hotmart.com/security/oauth/token', {
        method: 'POST',
        headers: {
          'Authorization': HOTMART_BASIC_AUTH,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenParams.toString()
      })

      if (tokenResponse.ok) {
        const tokenData = await tokenResponse.json()
        accessToken = tokenData.access_token
        useRealAPI = true
        console.log('✅ Autenticación exitosa con Hotmart')
      } else {
        console.log('❌ Falló autenticación, usando fallback')
      }
    } catch (authError) {
      console.log('❌ Error de autenticación, usando fallback:', authError.message)
    }

    let checkoutUrl = null
    let transactionId = null

    if (useRealAPI && accessToken) {
      // 2. Intentar crear checkout real
      console.log('Intentando crear checkout real...')
      
      try {
        const checkoutData = {
          productId: productId,
          buyerInformation: {
            email: userEmail,
            name: userName || userEmail.split('@')[0],
          },
          paymentMode: 'TRANSPARENT_CHECKOUT',
          urlReturn: returnUrl || 'https://bsbcapital.io/compra-exitosa'
        }

        const checkoutResponse = await fetch('https://developers.hotmart.com/payments/api/v1/checkouts', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkoutData)
        })

        if (checkoutResponse.ok) {
          const checkoutResult = await checkoutResponse.json()
          checkoutUrl = checkoutResult.checkoutUrl || checkoutResult.url
          transactionId = checkoutResult.transactionId || checkoutResult.id
          console.log('✅ Checkout real creado exitosamente')
        } else {
          console.log('❌ Error creando checkout real, usando fallback')
        }
      } catch (checkoutError) {
        console.log('❌ Error en checkout real, usando fallback:', checkoutError.message)
      }
    }

    // 3. Si no funcionó la API real, usar URL de checkout local
    if (!checkoutUrl) {
      console.log('Generando checkout local...')
      
      // Generar una URL que redirija a nuestra página de checkout local
      const checkoutParams = new URLSearchParams({
        product: productId,
        email: userEmail,
        name: userName || userEmail.split('@')[0],
        return_url: returnUrl || 'https://bsbcapital.io/compra-exitosa'
      })
      
      // Esta URL apunta a tu página local de checkout con Stripe
      checkoutUrl = `http://localhost:3000/checkout?${checkoutParams.toString()}`
      transactionId = `local-${Date.now()}`
      
      console.log('✅ Checkout local generado')
    }

    // 4. Guardar en base de datos
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { error: dbError } = await supabase
          .from('hotmart_checkouts')
          .insert({
            user_id: userId,
            email: userEmail,
            name: userName || userEmail.split('@')[0],
            product_id: productId,
            checkout_url: checkoutUrl,
            status: 'pending',
            hotmart_data: { 
              useRealAPI,
              transactionId,
              timestamp: new Date().toISOString()
            }
          })

        if (dbError) {
          console.log('Warning: Error guardando en DB:', dbError)
        } else {
          console.log('✅ Guardado en DB exitoso')
        }
      }
    } catch (dbError) {
      console.log('Warning: Error DB:', dbError)
    }

    console.log('=== CHECKOUT COMPLETADO ===')
    
    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: checkoutUrl,
        transactionId: transactionId,
        useRealAPI: useRealAPI,
        message: useRealAPI ? 'Real Hotmart checkout created' : 'Fallback checkout created'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error crítico:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})