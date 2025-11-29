import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    const webhookData = await req.json();
    console.log('🎣 Webhook de Hotmart recibido:', JSON.stringify(webhookData, null, 2));

    // Verificar que es un evento válido de Hotmart
    if (!webhookData.event || !webhookData.data) {
      return new Response(JSON.stringify({
        error: 'Invalid webhook data'
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Procesar diferentes tipos de eventos
    switch (webhookData.event) {
      case 'PURCHASE_APPROVED':
      case 'PURCHASE_COMPLETE':
        await handlePurchaseApproved(webhookData.data, supabase);
        break;
      case 'PURCHASE_REFUNDED':
      case 'PURCHASE_CANCELED':
        await handlePurchaseCanceled(webhookData.data, supabase);
        break;
      case 'SUBSCRIPTION_CANCELED':
        await handleSubscriptionCanceled(webhookData.data, supabase);
        break;
      default:
        console.log(`ℹ️ Evento no manejado: ${webhookData.event}`);
    }

    // Guardar el webhook completo para auditoría
    const { error: logError } = await supabase
      .from('webhook_logs')
      .insert({
        event_type: webhookData.event,
        webhook_data: webhookData,
        processed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('⚠️ Error guardando webhook log:', logError);
    }

    return new Response(JSON.stringify({
      success: true,
      event: webhookData.event
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});

async function handlePurchaseApproved(data: any, supabase: any) {
  const buyerEmail = data.buyer?.email;
  const productId = data.product?.id || data.product?.ucode;
  const transactionId = data.transaction;
  const subscriberCode = data.subscriber_code;

  if (!buyerEmail || !productId) {
    console.error('❌ Datos incompletos en purchase approved:', data);
    return;
  }

  console.log(`🔍 Buscando usuario con email: ${buyerEmail}`);

  // Buscar el usuario por email en auth.users (más confiable)
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  
  const user = users?.find((u: any) => u.email === buyerEmail);

  if (!user) {
    console.error('❌ Usuario no encontrado para email:', buyerEmail);
    // Intentar crear o buscar en profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', buyerEmail)
      .single();

    if (profileError || !profileData) {
      console.error('❌ No se pudo encontrar perfil para:', buyerEmail);
      return;
    }
  }

  const userId = user?.id;

  // 1. Crear/actualizar en user_access (tabla actual del webhook)
  const { error: accessError } = await supabase
    .from('user_access')
    .upsert({
      user_id: userId,
      product_id: productId,
      has_access: true,
      purchase_date: new Date().toISOString(),
      transaction_id: transactionId,
      subscriber_code: subscriberCode,
      last_verified: new Date().toISOString()
    }, {
      onConflict: 'user_id,product_id'
    });

  if (accessError) {
    console.error('⚠️ Error actualizando user_access:', accessError);
  } else {
    console.log(`✅ user_access actualizado para ${buyerEmail}`);
  }

  // 2. NUEVO: Crear/actualizar en user_subscriptions (para compatibilidad con useUserAccess)
  const { error: subError } = await supabase
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      subscription_type: 'hotmart',
      status: 'active',
      hotmart_subscriber_code: subscriberCode,
      hotmart_product_id: productId,
      hotmart_transaction_id: transactionId,
      start_date: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,hotmart_subscriber_code'
    });

  if (subError) {
    console.error('⚠️ Error actualizando user_subscriptions:', subError);
  } else {
    console.log(`✅ user_subscriptions actualizado para ${buyerEmail}`);
  }

  // 3. NUEVO: Crear registro en user_academy_access (para Academia)
  const { error: academyError } = await supabase
    .from('user_academy_access')
    .upsert({
      user_id: userId,
      product_id: productId,
      status: 'active',
      purchase_date: new Date().toISOString(),
      transaction_id: transactionId,
      created_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,product_id'
    });

  if (academyError) {
    console.error('⚠️ Error actualizando user_academy_access:', academyError);
  } else {
    console.log(`✅ user_academy_access actualizado para ${buyerEmail}`);
  }

  console.log(`🎉 Acceso completo otorgado a ${buyerEmail} para producto ${productId}`);
}

async function handlePurchaseCanceled(data: any, supabase: any) {
  const buyerEmail = data.buyer?.email;
  const productId = data.product?.id || data.product?.ucode;

  if (!buyerEmail || !productId) {
    console.error('❌ Datos incompletos en purchase canceled:', data);
    return;
  }

  // Buscar el usuario por email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  const user = users?.find((u: any) => u.email === buyerEmail);

  if (!user) {
    console.error('❌ Usuario no encontrado para email:', buyerEmail);
    return;
  }

  const userId = user.id;

  // Revocar acceso en todas las tablas
  await Promise.all([
    // user_access
    supabase
      .from('user_access')
      .update({
        has_access: false,
        canceled_at: new Date().toISOString(),
        last_verified: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId),
    
    // user_subscriptions
    supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('hotmart_product_id', productId),
    
    // user_academy_access
    supabase
      .from('user_academy_access')
      .update({
        status: 'cancelled',
        canceled_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId)
  ]);

  console.log(`🚫 Acceso revocado para ${buyerEmail} del producto ${productId}`);
}

async function handleSubscriptionCanceled(data: any, supabase: any) {
  const subscriberEmail = data.subscriber?.email;
  const productId = data.product?.id || data.product?.ucode;

  if (!subscriberEmail || !productId) {
    console.error('❌ Datos incompletos en subscription canceled:', data);
    return;
  }

  // Buscar el usuario por email
  const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
  const user = users?.find((u: any) => u.email === subscriberEmail);

  if (!user) {
    console.error('❌ Usuario no encontrado para email:', subscriberEmail);
    return;
  }

  const userId = user.id;

  // Revocar acceso en todas las tablas
  await Promise.all([
    // user_access
    supabase
      .from('user_access')
      .update({
        has_access: false,
        subscription_canceled_at: new Date().toISOString(),
        last_verified: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId),
    
    // user_subscriptions
    supabase
      .from('user_subscriptions')
      .update({
        status: 'cancelled',
        end_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('hotmart_product_id', productId),
    
    // user_academy_access
    supabase
      .from('user_academy_access')
      .update({
        status: 'cancelled',
        subscription_canceled_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('product_id', productId)
  ]);

  console.log(`🚫 Suscripción cancelada para ${subscriberEmail} del producto ${productId}`);
}
