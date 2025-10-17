import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar todas las variables de entorno necesarias
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment_variables: {
        STRIPE_SECRET_KEY: !!Deno.env.get('STRIPE_SECRET_KEY'),
        STRIPE_SECRET_KEY_length: Deno.env.get('STRIPE_SECRET_KEY')?.length || 0,
        STRIPE_SECRET_KEY_prefix: Deno.env.get('STRIPE_SECRET_KEY')?.substring(0, 7) || 'NOT_SET',
        SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
        SUPABASE_SERVICE_ROLE_KEY: !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
        STRIPE_WEBHOOK_SECRET: !!Deno.env.get('STRIPE_WEBHOOK_SECRET'),
      },
      request_info: {
        method: req.method,
        origin: req.headers.get('origin'),
        user_agent: req.headers.get('user-agent'),
        content_type: req.headers.get('content-type'),
      }
    }

    // Si hay body, intentar parsearlo
    if (req.method === 'POST') {
      try {
        const body = await req.json()
        diagnostics.request_body = {
          has_priceId: !!body.priceId,
          has_email: !!body.email,
          has_metadata: !!body.metadata,
          metadata_keys: body.metadata ? Object.keys(body.metadata) : [],
        }
      } catch (e) {
        diagnostics.request_body_error = e.message
      }
    }

    return new Response(
      JSON.stringify(diagnostics, null, 2),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})