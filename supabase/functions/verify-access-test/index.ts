import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Verify access test called')
    
    const { userId, productId, userEmail }: VerifyAccessRequest = await req.json();

    console.log('Request data:', { userId, productId, userEmail })

    if (!userId || !productId || !userEmail) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields', has_access: false }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Para testing, simular que el usuario de prueba tiene acceso
    if (userEmail === 'test@bsbcapital.com' && productId === '6308462') {
      console.log('Test user access granted')
      return new Response(
        JSON.stringify({
          has_access: true,
          access_type: 'course',
          product_id: productId,
          user_id: userId,
          message: 'Access granted for test user'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Para otros usuarios, verificar en la base de datos
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Checking database for access')

    // Verificar en user_access
    const { data: accessData, error: accessError } = await supabase
      .from('user_access')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('status', 'active')
      .single();

    if (accessError) {
      console.log('No access found in user_access table:', accessError.message);
    }

    if (accessData) {
      console.log('Access found in user_access table')
      return new Response(
        JSON.stringify({
          has_access: true,
          access_type: accessData.access_type,
          product_id: productId,
          user_id: userId,
          expires_at: accessData.expires_at,
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Verificar en hotmart_checkouts
    const { data: checkoutData, error: checkoutError } = await supabase
      .from('hotmart_checkouts')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('status', 'approved')
      .single()

    if (checkoutError) {
      console.log('No checkout found:', checkoutError.message)
    }

    if (checkoutData) {
      console.log('Access found via checkout')
      return new Response(
        JSON.stringify({
          has_access: true,
          access_type: 'course',
          product_id: productId,
          user_id: userId,
          source: 'checkout'
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('No access found')
    return new Response(
      JSON.stringify({
        has_access: false,
        product_id: productId,
        user_id: userId,
        message: 'No active access found'
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error: unknown) {
    console.error('Unexpected error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: errorMessage,
        has_access: false 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})