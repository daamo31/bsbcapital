import { corsHeaders } from "../shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_API = "https://api.stripe.com/v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = Deno.env.get("SITE_URL");

Deno.serve({ port: 8000 }, async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Inicializar Supabase client para obtener usuario autenticado
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    
    // Obtener token de autenticación del header
    const authHeader = req.headers.get("Authorization");
    let authenticatedUser = null;
    
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          authenticatedUser = user;
          console.log("✅ Usuario autenticado obtenido:", { id: user.id, email: user.email });
        }
      } catch (error) {
        console.log("⚠️ Error obteniendo usuario del token:", error);
      }
    }

    // Parse body safely once (supports JSON, double-encoded JSON, and form-encoded)
    const rawBody = await req.text();
    const contentType = req.headers.get("content-type") || "";
    let requestBody: any = {};
    if (rawBody) {
      if (contentType.includes("application/x-www-form-urlencoded")) {
        const form = new URLSearchParams(rawBody);
        requestBody = Object.fromEntries(form.entries());
        // Try to parse known nested objects
        if (typeof requestBody.metadata === "string") {
          try { requestBody.metadata = JSON.parse(requestBody.metadata); } catch (_) { /* ignore */ }
        }
      } else {
        try {
          requestBody = JSON.parse(rawBody);
          if (typeof requestBody === "string") {
            requestBody = JSON.parse(requestBody);
          }
        } catch (_) {
          requestBody = {};
        }
      }
    }

    // Also accept query params as a last resort
    const url = new URL(req.url);
    const queryParams = Object.fromEntries(url.searchParams.entries());
    if (Object.keys(queryParams).length > 0) {
      requestBody = { ...queryParams, ...requestBody };
      if (typeof requestBody.metadata === "string") {
        try { requestBody.metadata = JSON.parse(requestBody.metadata); } catch (_) { /* ignore */ }
      }
    }

    // Normalize/alias common field names coming from different callers
    const metadata = (requestBody?.metadata as Record<string, unknown> | undefined) ?? {};
    const priceId = (requestBody?.priceId || requestBody?.price_id || requestBody?.price) as string | undefined;
    const mode = (requestBody?.mode as string | undefined) ?? "subscription";
    const userId = (requestBody?.userId || requestBody?.user_id) as string | undefined;
    const email = (requestBody?.email || (metadata as any)?.email || (metadata as any)?.client_email) as string | undefined;
    
    console.log("🔍 Field extraction debug:", {
      'requestBody.priceId': requestBody?.priceId,
      'requestBody.price_id': requestBody?.price_id,
      'requestBody.price': requestBody?.price,
      'resolved priceId': priceId,
      'requestBody keys': Object.keys(requestBody || {}),
    });

    // ✅ RESOLVER AUTOMÁTICAMENTE DESDE USUARIO AUTENTICADO
    const resolvedUserId = userId || (metadata as any).user_id || (metadata as any).supabase_user_id || authenticatedUser?.id;
    const resolvedEmail = email || (metadata as any).client_email || authenticatedUser?.email;

    console.log("🔍 Valores resueltos:", {
      authenticatedUser: authenticatedUser ? { id: authenticatedUser.id, email: authenticatedUser.email } : null,
      originalUserId: userId,
      resolvedUserId,
      originalEmail: email,
      resolvedEmail,
      metadata,
      requestHeaders: Object.fromEntries(req.headers.entries()),
      requestBody: JSON.stringify(requestBody)
    });

    console.log("create-stripe-checkout request received", { priceId, mode, userId, email, contentType, rawLength: rawBody?.length || 0 });
    console.log("Payload recibido en create-stripe-checkout:", requestBody);

    // ✅ VALIDAR PRICEID PARA SUSCRIPCIONES
    if (mode === "subscription") {
      console.log("🔍 Validando priceId para suscripción:", priceId);
      
      // Verificar que el priceId existe en Stripe y es recurrente
      const priceRes = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
        headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
      });
      const priceData = await priceRes.json();
      
      if (!priceRes.ok) {
        console.error("❌ Error obteniendo precio de Stripe:", priceData);
        return new Response(
          JSON.stringify({ error: "Invalid priceId" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }
      
      console.log("💰 Datos del precio:", {
        id: priceData.id,
        type: priceData.type,
        recurring: priceData.recurring,
        unit_amount: priceData.unit_amount,
        currency: priceData.currency
      });
      
      if (priceData.type !== "recurring") {
        console.error("❌ El priceId no es recurrente:", priceData.type);
        return new Response(
          JSON.stringify({ error: "PriceId must be recurring for subscriptions" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }
    }

    // Registrar información adicional para depuración
    console.log("Método HTTP:", req.method);
    console.log("Encabezados de la solicitud:", Object.fromEntries(req.headers));
    console.log("Cuerpo completo recibido:", requestBody);

    // Registrar valores desestructurados
    console.log("Valores desestructurados:", { priceId, mode, userId, email });

    // SITE_URL es opcional (tenemos fallback)
    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing one of required env vars:', { STRIPE_SECRET_KEY: !!STRIPE_SECRET_KEY, SUPABASE_URL: !!SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: !!SUPABASE_SERVICE_ROLE_KEY, SITE_URL: !!SITE_URL });
      return new Response(
        JSON.stringify({ error: 'Server misconfiguration: missing environment variables.' }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
      );
    }

    // Validar parámetros obligatorios y registrar valores
    console.log("🧪 Validating parameters:", { priceId, resolvedUserId, resolvedEmail });
    
    if (!priceId) {
      console.error("❌ Missing priceId in request payload.", { priceId });
      return new Response(
        JSON.stringify({ error: "priceId is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    if (!resolvedUserId) {
      console.error("❌ Missing userId in request payload or metadata.", { userId, metadata, authenticatedUser: authenticatedUser?.id });
      return new Response(
        JSON.stringify({ error: "userId is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    if (!resolvedEmail) {
      console.error("❌ Missing email in request payload or metadata.", { email, metadata, authenticatedUser: authenticatedUser?.email });
      return new Response(
        JSON.stringify({ error: "email is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    // Crear pre-reserva de consulta si es un checkout de consultoría (mode === 'payment')
    let consultationId: string | undefined;
    if (mode === "payment") {
      const allowedConsultationTypes = new Set(["investment", "portfolio", "strategy", "technical", "general", "financial_planning", "onboarding_crypto"]);
      const incomingType = (metadata as any).consultation_type as string | undefined;
      const normalizedType = incomingType && allowedConsultationTypes.has(incomingType) ? incomingType : "general";

      const consultationPayload = {
        user_id: resolvedUserId,
        service: normalizedType // Asegurar que el valor del desplegable se guarde correctamente
        ,
        duration: Number((metadata as any).duration || (metadata as any).consultation_duration) || 30,
        status: "scheduled",
        client_name: (metadata as any).client_name || null,
        client_email: (metadata as any).client_email || resolvedEmail || null,
        notes: (metadata as any).description || (metadata as any).notes || null,
        title: `Consulta: ${normalizedType}`, // Reflejar el tipo de consulta en el título
        stripe_session_id: null,
        booking_date: (metadata as any).scheduled_at || new Date().toISOString(),
      } as Record<string, unknown>;

      // Remover campos undefined para evitar errores de PostgREST
      Object.keys(consultationPayload).forEach((k) => {
        if (consultationPayload[k] === undefined) delete consultationPayload[k];
      });

      const { data: consultationRow, error: consultationError } = await supabase
        .from("consultations")
        .insert(consultationPayload)
        .select("id")
        .single();

      if (consultationError) {
        console.error("Failed to create consultation pre-booking:", {
          error: consultationError,
          payload: consultationPayload
        });
        return new Response(
          JSON.stringify({ error: "Failed to create consultation" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }
      consultationId = consultationRow?.id;
      console.log("Generated consultationId:", consultationId); // Log para verificar el ID generado
    }

    console.log("🔍 Validando configuración del precio en Stripe...");
    
    // Obtener información del precio de Stripe para validación
    const priceResponse = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });
    
    const priceInfo = await priceResponse.json();
    console.log("📋 Información del precio de Stripe:", priceInfo);
    
    if (priceInfo.error) {
      throw new Error(`Precio no válido en Stripe: ${priceInfo.error.message}`);
    }
    
    // ✅ VALIDACIÓN CRÍTICA: Para suscripciones, el precio DEBE ser recurring
    if (mode === "subscription" && priceInfo.type !== "recurring") {
      throw new Error(`❌ PRECIO INCORRECTO: Para modo 'subscription', el precio debe ser de tipo 'recurring', pero es '${priceInfo.type}'. 
        PriceId: ${priceId}. 
        Debes crear un precio recurrente en Stripe Dashboard.`);
    }
    
    // Para pagos únicos, el precio debe ser one_time
    if (mode === "payment" && priceInfo.type !== "one_time") {
      console.warn(`⚠️ ADVERTENCIA: Para modo 'payment', se recomienda usar precio 'one_time', pero es '${priceInfo.type}'`);
    }
    
    console.log(`✅ Precio validado: ${priceInfo.type} - ${priceInfo.unit_amount / 100} ${priceInfo.currency}`);

    // Buscar o crear cliente Stripe
    const searchParams = new URLSearchParams({ email: resolvedEmail, limit: "1" });
    const customersRes = await fetch(`https://api.stripe.com/v1/customers?${searchParams}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const customers = await customersRes.json();

    let customerId: string;
    if (customers.data?.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const createRes = await fetch("https://api.stripe.com/v1/customers", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          email: resolvedEmail,
          ...(resolvedUserId ? { ["metadata[supabase_user_id]"]: resolvedUserId } : {} as any),
        }),
      });
      const customer = await createRes.json();
      customerId = customer.id;
    }

    const siteUrl = SITE_URL || new URL(SUPABASE_URL!).origin;

    // Crear sesión de checkout
    const params = new URLSearchParams();
    
    // Configuración base común
    params.set("mode", mode);
    params.set("customer", customerId);
    
    // 🎯 URL de éxito diferente para consultorias vs membresías
    if (mode === "payment" && consultationId) {
      // Para consultorias: redirigir al formulario post-pago
      params.set("success_url", `${siteUrl}/consultation-post-payment?session_id={CHECKOUT_SESSION_ID}&consultation_id=${consultationId}`);
    } else {
      // Para membresías: redirigir a página de gracias estándar
      params.set("success_url", `${siteUrl}/academia/gracias?session_id={CHECKOUT_SESSION_ID}`);
    }
    
    params.set("cancel_url", `${siteUrl}/academia`);
    params.set("metadata[access_type]", mode === "subscription" ? "membership" : "one_time");
    
    if (resolvedUserId) {
      params.set("metadata[supabase_user_id]", resolvedUserId);
    }

    // ✅ CONFIGURACIÓN ESPECÍFICA PARA SUSCRIPCIONES
    if (mode === "subscription") {
      console.log("🔧 Configurando sesión para suscripción recurrente...");
      
      // Para suscripciones, SOLO necesitamos line_items con precio recurrente
      params.set("line_items[0][price]", priceId);
      params.set("line_items[0][quantity]", "1");
      
      // Configuración específica de suscripción
      params.set("payment_method_collection", "always");
      params.set("billing_address_collection", "auto");
      
      console.log("✅ Suscripción configurada con priceId recurrente:", priceId);
    } else {
      // ✅ CONFIGURACIÓN PARA PAGOS ÚNICOS (CONSULTAS)
      console.log("🔧 Configurando sesión para pago único...");
      
      params.set("line_items[0][price]", priceId);
      params.set("line_items[0][quantity]", "1");
      
      // Adjuntar consultation_id solo si el modo es "payment"
      if (consultationId) {
        params.set("metadata[consultation_id]", consultationId);
        console.log("Consultation ID added to Stripe metadata:", consultationId);
      }
    }

    // Log adicional para verificar los parámetros enviados a Stripe
    console.log("Enviando parámetros a Stripe para crear la sesión:", Object.fromEntries(params));

    console.log("Iniciando creación de sesión de Stripe...");
    const stripeStart = Date.now();
    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    console.log("Respuesta de Stripe recibida en:", Date.now() - stripeStart, "ms");

    const session = await sessionRes.json();

    // Log adicional para verificar la respuesta de Stripe
    console.log("Respuesta de Stripe al crear la sesión:", session);

    if (session?.error || !session?.id) {
      console.error('Stripe API returned error when creating checkout session', { status: sessionRes.status, body: session });
      return new Response(JSON.stringify(session), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    console.log("Sesión de Stripe creada exitosamente:", session.id);

    // Actualizar la consulta con el stripe_session_id
    if (consultationId) {
      const { error: updateError } = await supabase
        .from("consultations")
        .update({ stripe_session_id: session.id })
        .eq("id", consultationId);

      if (updateError) {
        console.error("Failed to update consultation with stripe_session_id:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update consultation" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }
    }

    // ✅ Sesión creada exitosamente - LOG PARA DEBUGGING
    console.log("Sesión de Stripe creada exitosamente:", session.id);

    // ✅ IMPORTANTE: NO crear registros de suscripción aquí
    // El webhook manejará la creación de registros después del pago exitoso
    
    // ✅ Retornar URL de la sesión para redirección a Stripe
    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error." }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
