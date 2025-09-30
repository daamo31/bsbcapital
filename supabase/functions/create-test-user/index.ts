import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Cliente con permisos de admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Crear usuario de prueba
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: 'test@bsbcapital.com',
      password: 'TestUser123!',
      email_confirm: true,
      user_metadata: {
        full_name: 'Usuario Prueba BSB'
      }
    })

    if (userError) {
      console.error('Error creando usuario:', userError)
      return new Response(
        JSON.stringify({ error: 'Error creando usuario', details: userError }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Usuario creado:', user)

    // Crear checkout de prueba
    const { error: checkoutError } = await supabaseAdmin
      .from('hotmart_checkouts')
      .insert({
        user_id: user.user.id,
        email: 'test@bsbcapital.com',
        name: 'Usuario Prueba BSB',
        product_id: '6308462',
        checkout_url: 'https://checkout.hotmart.com/test-checkout-url',
        status: 'approved'
      })

    if (checkoutError) {
      console.error('Error creando checkout:', checkoutError)
    }

    // Crear acceso de prueba
    const { error: accessError } = await supabaseAdmin
      .from('user_access')
      .insert({
        user_id: user.user.id,
        product_id: '6308462',
        access_type: 'course',
        status: 'active',
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 año
      })

    if (accessError) {
      console.error('Error creando acceso:', accessError)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: user.user,
        message: 'Usuario de prueba creado exitosamente',
        credentials: {
          email: 'test@bsbcapital.com',
          password: 'TestUser123!'
        }
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error general:', error)
    return new Response(
      JSON.stringify({ error: 'Error interno del servidor', details: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})