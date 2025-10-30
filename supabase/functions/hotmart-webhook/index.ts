import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const webhookData = await req.json();

    console.log(
      "Webhook de Hotmart recibido:",
      JSON.stringify(webhookData, null, 2)
    );

    // Verificar que es un evento válido de Hotmart
    if (!webhookData.event || !webhookData.data) {
      return new Response(
        JSON.stringify({ error: "Invalid webhook data" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Procesar diferentes tipos de eventos
    switch (webhookData.event) {
      case "PURCHASE_APPROVED":
      case "PURCHASE_COMPLETE":
        await handlePurchaseApproved(webhookData.data, supabase);
        break;

      case "PURCHASE_REFUNDED":
      case "PURCHASE_CANCELED":
        await handlePurchaseCanceled(webhookData.data, supabase);
        break;

      case "SUBSCRIPTION_CANCELED":
        await handleSubscriptionCanceled(webhookData.data, supabase);
        break;

      default:
        console.log(`Evento no manejado: ${webhookData.event}`);
    }

    // Guardar el webhook completo para auditoría
    const { error: logError } = await supabase
      .from("webhook_logs")
      .insert({
        event_type: webhookData.event,
        webhook_data: webhookData,
        processed_at: new Date().toISOString(),
      });

    if (logError) {
      console.error("Error guardando webhook log:", logError);
    }

    return new Response(
      JSON.stringify({ success: true, event: webhookData.event }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error procesando webhook:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function handlePurchaseApproved(data: any, supabase: any) {
  const buyerEmail = data.buyer?.email;
  const productId = data.product?.id;
  const transactionId = data.transaction;

  if (!buyerEmail || !productId) {
    console.error("Datos incompletos en purchase approved:", data);
    return;
  }

  // Buscar el usuario por email
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", buyerEmail)
    .single();

  if (userError || !userData) {
    console.error("Usuario no encontrado para email:", buyerEmail);
    return;
  }

  // Actualizar o crear acceso del usuario
  const { error: accessError } = await supabase
    .from("user_access")
    .upsert(
      {
        user_id: userData.id,
        product_id: productId,
        has_access: true,
        purchase_date: new Date().toISOString(),
        transaction_id: transactionId,
        last_verified: new Date().toISOString(),
      },
      {
        onConflict: "user_id,product_id",
      }
    );

  if (accessError) {
    console.error("Error actualizando acceso del usuario:", accessError);
  } else {
    console.log(`Acceso otorgado a ${buyerEmail} para producto ${productId}`);
  }
}

async function handlePurchaseCanceled(data: any, supabase: any) {
  const buyerEmail = data.buyer?.email;
  const productId = data.product?.id;

  if (!buyerEmail || !productId) {
    console.error("Datos incompletos en purchase canceled:", data);
    return;
  }

  // Buscar el usuario por email
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", buyerEmail)
    .single();

  if (userError || !userData) {
    console.error("Usuario no encontrado para email:", buyerEmail);
    return;
  }

  // Revocar acceso del usuario
  const { error: accessError } = await supabase
    .from("user_access")
    .update({
      has_access: false,
      canceled_at: new Date().toISOString(),
      last_verified: new Date().toISOString(),
    })
    .eq("user_id", userData.id)
    .eq("product_id", productId);

  if (accessError) {
    console.error("Error revocando acceso del usuario:", accessError);
  } else {
    console.log(`Acceso revocado para ${buyerEmail} del producto ${productId}`);
  }
}

async function handleSubscriptionCanceled(data: any, supabase: any) {
  const subscriberEmail = data.subscriber?.email;
  const productId = data.product?.id;

  if (!subscriberEmail || !productId) {
    console.error("Datos incompletos en subscription canceled:", data);
    return;
  }

  // Buscar el usuario por email
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", subscriberEmail)
    .single();

  if (userError || !userData) {
    console.error("Usuario no encontrado para email:", subscriberEmail);
    return;
  }

  // Revocar acceso del usuario
  const { error: accessError } = await supabase
    .from("user_access")
    .update({
      has_access: false,
      subscription_canceled_at: new Date().toISOString(),
      last_verified: new Date().toISOString(),
    })
    .eq("user_id", userData.id)
    .eq("product_id", productId);

  if (accessError) {
    console.error(
      "Error revocando acceso por cancelación de suscripción:",
      accessError
    );
  } else {
    console.log(
      `Suscripción cancelada para ${subscriberEmail} del producto ${productId}`
    );
  }
}