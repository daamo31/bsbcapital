import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface VerifyAccessRequest {
  userId: string
  productId: string
  userEmail: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, productId, userEmail }: VerifyAccessRequest = await req.json()

    if (!userId || !productId || !userEmail) {
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
        JSON.stringify({ error: 'Hotmart credentials not configured', hasAccess: false }),
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
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with Hotmart', hasAccess: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // 2. Verificar si el usuario tiene acceso al producto
    const subscriptionResponse = await fetch(
      `https://api-sec-vlc.hotmart.com/club/api/v1/subscriptions?subscriber_email=${encodeURIComponent(userEmail)}&product_id=${productId}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    )

    if (!subscriptionResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to verify subscription', hasAccess: false }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const subscriptionData = await subscriptionResponse.json()
    
    // Verificar si hay al menos una suscripción activa
    const hasActiveSubscription = subscriptionData.items && 
      subscriptionData.items.some(sub => 
        sub.status === 'ACTIVE' || sub.status === 'OVERDUE'
      )

    // 3. Actualizar el estado en Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Actualizar o crear registro de acceso del usuario
    const { error: dbError } = await supabase
      .from('user_access')
      .upsert({
        user_id: userId,
        product_id: productId,
        has_access: hasActiveSubscription,
        last_verified: new Date().toISOString(),
        subscription_data: subscriptionData
      }, {
        onConflict: 'user_id,product_id'
      })

    if (dbError) {
      console.error('Error actualizando acceso en DB:', dbError)
    }

    return new Response(
      JSON.stringify({
        hasAccess: hasActiveSubscription,
        subscriptions: subscriptionData.items || [],
        verified_at: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en verify-access:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', hasAccess: false }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})