import { corsHeaders } from '../shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
const STRIPE_API = 'https://api.stripe.com/v1';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
const SITE_URL = Deno.env.get('SITE_URL');
const PRICE_CATALOG: Record<string, { mode: string; purchaseType: string; accessType: string }> = {
  price_1RtYGsJmSk3VG9oicAWmQ4sN: {
    mode: 'payment',
    purchaseType: 'consultation',
    accessType: 'one_time',
  },
  price_1RtYFkJmSk3VG9oi8wUdMK5k: {
    mode: 'payment',
    purchaseType: 'consultation',
    accessType: 'one_time',
  },
  price_1SHoSzJmSk3VG9oiEF2xRHNp: {
    mode: 'payment',
    purchaseType: 'consultation',
    accessType: 'one_time',
  },
  price_1SHoU8JmSk3VG9oiiMmypJRJ: {
    mode: 'payment',
    purchaseType: 'consultation',
    accessType: 'one_time',
  },
  price_1SSshWJmSk3VG9oiU1cBNWgf: {
    mode: 'payment',
    purchaseType: 'package',
    accessType: 'package',
  },
  price_1SDKb2JmSk3VG9oiJr1unLZZ: {
    mode: 'payment',
    purchaseType: 'package',
    accessType: 'package',
  },
  price_1SSsfoJmSk3VG9oi70AskCZv: {
    mode: 'payment',
    purchaseType: 'package',
    accessType: 'package',
  },
  price_1SaXofJmSk3VG9oigjDZtcF6: {
    mode: 'subscription',
    purchaseType: 'membership_monthly',
    accessType: 'membership',
  },
  price_1SaXpNJmSk3VG9oifsW4ajZ2: {
    mode: 'payment',
    purchaseType: 'membership_annual',
    accessType: 'membership',
  },
  price_1SaXVjJmSk3VG9oix0Pu2N9J: {
    mode: 'subscription',
    purchaseType: 'membership_monthly',
    accessType: 'membership',
  },
  price_1SDKgoJmSk3VG9oiamJj88De: {
    mode: 'payment',
    purchaseType: 'membership_annual',
    accessType: 'membership',
  },
};

Deno.serve({ port: 8000 }, async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      });
    }

    console.log('🚀 === INICIO CREATE-STRIPE-CHECKOUT ===');
    console.log('🔍 Método:', req.method);
    console.log('🔍 URL:', req.url);

    // Inicializar Supabase client para obtener usuario autenticado
    console.log('📡 Inicializando cliente Supabase...');
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ') || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const authClient = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user: authenticatedUser },
      error: authError,
    } = await authClient.auth.getUser();
    if (authError || !authenticatedUser?.id || !authenticatedUser.email) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Stripe checkout is missing required server configuration');
      return new Response(JSON.stringify({ error: 'Server misconfiguration' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse body safely once (supports JSON, double-encoded JSON, and form-encoded)
    console.log('📝 Parseando cuerpo de la request...');
    const rawBody = await req.text();

    const contentType = req.headers.get('content-type') || '';
    console.log('📝 Content-Type:', contentType);

    let requestBody: any = {};
    if (rawBody) {
      console.log('📝 Procesando body...');
      if (contentType.includes('application/x-www-form-urlencoded')) {
        console.log('📝 Parsing como form-urlencoded...');
        const form = new URLSearchParams(rawBody);
        requestBody = Object.fromEntries(form.entries());
        // Try to parse known nested objects
        if (typeof requestBody.metadata === 'string') {
          try {
            requestBody.metadata = JSON.parse(requestBody.metadata);
          } catch (_) {
            /* ignore */
          }
        }
      } else {
        console.log('📝 Parsing como JSON...');
        try {
          requestBody = JSON.parse(rawBody);
          if (typeof requestBody === 'string') {
            requestBody = JSON.parse(requestBody);
          }
          console.log('✅ JSON parseado correctamente');
        } catch (parseError) {
          console.log('❌ Error parseando JSON:', parseError);
          requestBody = {};
        }
      }
    } else {
      console.log('⚠️ Body vacío');
    }

    // Normalize/alias common field names coming from different callers
    const metadata = (requestBody?.metadata as Record<string, unknown> | undefined) ?? {};
    const priceId = (requestBody?.priceId || requestBody?.price_id || requestBody?.price) as
      | string
      | undefined;
    const requestedMode = (requestBody?.mode as string | undefined) ?? 'subscription';
    const userId = (requestBody?.userId || requestBody?.user_id) as string | undefined;

    console.log('🔍 Field extraction debug:', {
      'requestBody.priceId': requestBody?.priceId,
      'requestBody.price_id': requestBody?.price_id,
      'requestBody.price': requestBody?.price,
      'resolved priceId': priceId,
      'requestBody keys': Object.keys(requestBody || {}),
    });

    if (
      (userId && userId !== authenticatedUser.id) ||
      ((metadata as any).user_id && (metadata as any).user_id !== authenticatedUser.id) ||
      ((metadata as any).supabase_user_id &&
        (metadata as any).supabase_user_id !== authenticatedUser.id)
    ) {
      return new Response(JSON.stringify({ error: 'User identity mismatch' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const resolvedUserId = authenticatedUser.id;
    const resolvedEmail = authenticatedUser.email;
    const clientEmail = authenticatedUser.email;

    console.log('🔍 Valores resueltos:', {
      authenticatedUserId: authenticatedUser.id,
      originalUserId: userId,
      resolvedUserId,
    });

    console.log('create-stripe-checkout request received', {
      priceId,
      mode: requestedMode,
      contentType,
      rawLength: rawBody?.length || 0,
    });
    // Validar parámetros obligatorios y registrar valores
    if (!priceId) {
      console.error('❌ Missing priceId in request payload.', { priceId });
      return new Response(JSON.stringify({ error: 'priceId is required.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const priceConfiguration = PRICE_CATALOG[priceId];
    if (!priceConfiguration) {
      return new Response(JSON.stringify({ error: 'Price is not available for checkout' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (requestedMode !== priceConfiguration.mode) {
      return new Response(JSON.stringify({ error: 'Invalid checkout mode' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    const mode = priceConfiguration.mode;

    // Crear pre-reserva de consulta si es un checkout de consultoría (mode === 'payment' Y no es un plan)
    let consultationId: string | undefined;

    // 🎯 Usar purchase_type del metadata para determinar el tipo de compra
    const purchaseType = priceConfiguration.purchaseType;
    const accessType = priceConfiguration.accessType;

    console.log('🔍 TIPO DE COMPRA:', { purchaseType, accessType, mode });

    // Clasificar el tipo de compra basándose en purchase_type
    const isConsultationPurchase = purchaseType === 'consultation';

    const isPackagePurchase = purchaseType === 'package';

    const isMembershipAnnualPurchase = purchaseType === 'membership_annual';

    const isMembershipMonthlyPurchase = Boolean(purchaseType === 'membership_monthly');

    console.log('🔍 CLASIFICACIÓN DE COMPRA:', {
      isConsultationPurchase,
      isPackagePurchase,
      isMembershipAnnualPurchase,
      isMembershipMonthlyPurchase,
    });

    // Solo crear consulta si es pago único Y es consultoría
    if (isConsultationPurchase) {
      const allowedConsultationTypes = new Set([
        'investment',
        'portfolio',
        'strategy',
        'technical',
        'general',
        'financial_planning',
        'onboarding_crypto',
      ]);
      const incomingType = (metadata as any).consultation_type as string | undefined;

      // Mapear los valores del frontend a los valores de la base de datos
      const typeMapping: Record<string, string> = {
        'Optimización de cartera': 'financial_planning',
        'Onboarding cripto': 'onboarding_crypto',
        'Estrategias Crypto & Web3': 'portfolio',
        'Gestión de tesorería cripto para empresas': 'crypto_advanced',
      };

      const normalizedType =
        incomingType && typeMapping[incomingType]
          ? typeMapping[incomingType]
          : incomingType && allowedConsultationTypes.has(incomingType)
            ? incomingType
            : 'general';

      console.log(`📋 Tipo de consulta: "${incomingType}" → "${normalizedType}"`);

      const consultationPayload = {
        user_id: resolvedUserId,
        service: normalizedType, // Asegurar que el valor del desplegable se guarde correctamente
        duration:
          Number((metadata as any).duration || (metadata as any).consultation_duration) || 30,
        status: 'scheduled',
        client_name: (metadata as any).client_name || null,
        client_email: resolvedEmail,
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
        .from('consultations')
        .insert(consultationPayload)
        .select('id')
        .single();

      if (consultationError) {
        console.error('Failed to create consultation pre-booking:', {
          error: consultationError,
          payload: consultationPayload,
        });
        return new Response(JSON.stringify({ error: 'Failed to create consultation' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      consultationId = consultationRow?.id;
      console.log('Generated consultationId:', consultationId); // Log para verificar el ID generado
    }

    console.log('🔍 Validando configuración del precio en Stripe...');

    // Obtener información del precio de Stripe para validación
    const priceResponse = await fetch(`https://api.stripe.com/v1/prices/${priceId}`, {
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      },
    });

    const priceInfo = await priceResponse.json();
    console.log('📋 Información del precio de Stripe:', priceInfo);

    if (priceInfo.error) {
      throw new Error(`Precio no válido en Stripe: ${priceInfo.error.message}`);
    }

    // ✅ VALIDACIÓN CRÍTICA: Para suscripciones, el precio DEBE ser recurring
    if (mode === 'subscription' && priceInfo.type !== 'recurring') {
      throw new Error(`❌ PRECIO INCORRECTO: Para modo 'subscription', el precio debe ser de tipo 'recurring', pero es '${priceInfo.type}'. 
        PriceId: ${priceId}. 
        Debes crear un precio recurrente en Stripe Dashboard.`);
    }

    // Para pagos únicos, el precio debe ser one_time
    if (mode === 'payment' && priceInfo.type !== 'one_time') {
      return new Response(JSON.stringify({ error: 'Price must be one-time for payment mode' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(
      `✅ Precio validado: ${priceInfo.type} - ${priceInfo.unit_amount / 100} ${priceInfo.currency}`
    );

    // Buscar o crear cliente Stripe
    const searchParams = new URLSearchParams({
      query: `metadata['supabase_user_id']:'${resolvedUserId}'`,
      limit: '1',
    });
    const customersRes = await fetch(`https://api.stripe.com/v1/customers?${searchParams}`, {
      headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    });
    const customers = await customersRes.json();

    let customerId: string;
    if (customers.data?.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const createRes = await fetch('https://api.stripe.com/v1/customers', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: resolvedEmail,
          'metadata[supabase_user_id]': resolvedUserId,
        }),
      });
      const customer = await createRes.json();
      customerId = customer.id;
    }

    // ✅ IMPORTANTE: Usar siempre la URL de producción para Stripe
    // Stripe no puede redirigir a localhost
    const siteUrl = SITE_URL || 'https://bsbcapital.io';

    console.log('🌐 URLs de entorno:', {
      SITE_URL_env: SITE_URL,
      SUPABASE_URL: SUPABASE_URL,
      siteUrl_resolved: siteUrl,
      note: 'Usando URL fija de producción para evitar problemas con localhost',
    });

    // Crear sesión de checkout
    const params = new URLSearchParams();

    // Configuración base común
    params.set('mode', mode);
    params.set('customer', customerId);

    // 🎯 URLs dinámicas según el tipo de compra
    if (isConsultationPurchase && consultationId) {
      // Para consultorias: redirigir al formulario post-pago
      params.set(
        'success_url',
        `${siteUrl}/consultation-post-payment?session_id={CHECKOUT_SESSION_ID}&consultation_id=${consultationId}`
      );
      params.set('cancel_url', `${siteUrl}/consultoria`);
    } else if (isPackagePurchase) {
      // Para paquetes crypto (pagos únicos): redirigir a confirmación de paquete
      params.set(
        'success_url',
        `${siteUrl}/academia/paquete-confirmado?session_id={CHECKOUT_SESSION_ID}`
      );
      params.set('cancel_url', `${siteUrl}/academia/membresias-db`);
    } else if (isMembershipAnnualPurchase) {
      // Para membresías anuales (pago único): redirigir a confirmación de membresía
      params.set(
        'success_url',
        `${siteUrl}/academia/membresia-confirmada?session_id={CHECKOUT_SESSION_ID}`
      );
      params.set('cancel_url', `${siteUrl}/academia/membresias-db`);
    } else if (isMembershipMonthlyPurchase) {
      // Para membresías recurrentes mensuales: redirigir a confirmación de membresía
      params.set(
        'success_url',
        `${siteUrl}/academia/membresia-confirmada?session_id={CHECKOUT_SESSION_ID}`
      );
      params.set('cancel_url', `${siteUrl}/academia/membresias-db`);
    } else {
      // Fallback genérico
      params.set('success_url', `${siteUrl}/academia/gracias?session_id={CHECKOUT_SESSION_ID}`);
      params.set('cancel_url', `${siteUrl}/`);
    }

    // Debug URLs configuradas
    console.log('🔗 URLs configuradas para Stripe:', {
      success_url: params.get('success_url'),
      cancel_url: params.get('cancel_url'),
      isConsultationPurchase,
      isPackagePurchase,
      isMembershipAnnualPurchase,
      isMembershipMonthlyPurchase,
      hasConsultationId: !!consultationId,
      mode,
    });

    // Agregar metadatos esenciales para el webhook
    if (resolvedUserId) {
      params.set('metadata[supabase_user_id]', resolvedUserId);
    }

    if (clientEmail) {
      params.set('metadata[client_email]', clientEmail);
    }

    // ✅ USAR purchase_type y access_type del metadata si vienen del frontend
    params.set('metadata[purchase_type]', purchaseType);
    params.set('metadata[access_type]', accessType);

    // Pasar metadatos importantes del plan
    if ((metadata as any)?.plan_id) {
      params.set('metadata[plan_id]', (metadata as any).plan_id);
    }
    if ((metadata as any)?.plan_name) {
      params.set('metadata[plan_name]', (metadata as any).plan_name);
    }
    if ((metadata as any)?.stripe_product_id) {
      params.set('metadata[stripe_product_id]', (metadata as any).stripe_product_id);
    }
    if ((metadata as any)?.billing_cycle) {
      params.set('metadata[billing_cycle]', (metadata as any).billing_cycle);
    }
    if ((metadata as any)?.client_name) {
      params.set('metadata[client_name]', (metadata as any).client_name);
    }

    // ✅ CONFIGURACIÓN ESPECÍFICA PARA SUSCRIPCIONES
    if (mode === 'subscription') {
      console.log('🔧 Configurando sesión para suscripción recurrente...');

      // Para suscripciones, SOLO necesitamos line_items con precio recurrente
      params.set('line_items[0][price]', priceId);
      params.set('line_items[0][quantity]', '1');

      // Configuración específica de suscripción
      params.set('payment_method_collection', 'always');
      params.set('billing_address_collection', 'auto');

      console.log('✅ Suscripción configurada con priceId recurrente:', priceId);
    } else {
      // ✅ CONFIGURACIÓN PARA PAGOS ÚNICOS (CONSULTAS)
      console.log('🔧 Configurando sesión para pago único...');

      params.set('line_items[0][price]', priceId);
      params.set('line_items[0][quantity]', '1');

      // Adjuntar consultation_id solo si el modo es "payment"
      if (consultationId) {
        params.set('metadata[consultation_id]', consultationId);
        console.log('Consultation ID added to Stripe metadata:', consultationId);
      }
    }

    // Log adicional para verificar los parámetros enviados a Stripe
    console.log('Iniciando creación de sesión de Stripe...');
    const stripeStart = Date.now();
    const sessionRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    console.log('Respuesta de Stripe recibida en:', Date.now() - stripeStart, 'ms');

    const session = await sessionRes.json();

    // Log adicional para verificar la respuesta de Stripe
    if (session?.error || !session?.id) {
      console.error('Stripe API returned error when creating checkout session', {
        status: sessionRes.status,
        body: session,
      });
      return new Response(JSON.stringify(session), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log('Sesión de Stripe creada exitosamente:', session.id);

    // Actualizar la consulta con el stripe_session_id
    if (consultationId) {
      const { error: updateError } = await supabase
        .from('consultations')
        .update({ stripe_session_id: session.id })
        .eq('id', consultationId);

      if (updateError) {
        console.error('Failed to update consultation with stripe_session_id:', updateError);
        return new Response(JSON.stringify({ error: 'Failed to update consultation' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
    }

    // ✅ Sesión creada exitosamente - LOG PARA DEBUGGING
    console.log('Sesión de Stripe creada exitosamente:', session.id);

    // ✅ IMPORTANTE: NO crear registros de suscripción aquí
    // El webhook manejará la creación de registros después del pago exitoso

    // ✅ Retornar URL de la sesión para redirección a Stripe
    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    // Type guard para asegurar que error es un Error
    const errorObj = error instanceof Error ? error : new Error(String(error));

    console.error('❌ DETAILED ERROR in create-stripe-checkout:', {
      message: errorObj.message,
      stack: errorObj.stack,
      name: errorObj.name,
      cause: errorObj.cause,
    });

    console.error('❌ Error processing request:', error);

    // Provide more detailed error response for debugging
    const errorResponse = {
      error: 'Internal server error.',
      details: errorObj.message || 'Unknown error occurred',
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(errorResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
