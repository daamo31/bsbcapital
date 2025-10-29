import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");
const STRIPE_API = "https://api.stripe.com/v1";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SITE_URL = Deno.env.get("SITE_URL");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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

    // Resolver fallbacks desde metadata
    const resolvedUserId = userId || (metadata as any).user_id || (metadata as any).supabase_user_id;
    const resolvedEmail = email || (metadata as any).client_email;

    console.log("create-stripe-checkout request received", { priceId, mode, userId, email, contentType, rawLength: rawBody?.length || 0 });
    console.log("Payload recibido en create-stripe-checkout:", requestBody);

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
    if (!priceId) {
      console.error("Missing priceId in request payload.", { priceId });
      return new Response(
        JSON.stringify({ error: "priceId is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    if (!resolvedUserId) {
      console.error("Missing userId in request payload or metadata.", { userId, metadata });
      return new Response(
        JSON.stringify({ error: "userId is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    if (!resolvedEmail) {
      console.error("Missing email in request payload or metadata.", { email, metadata });
      return new Response(
        JSON.stringify({ error: "email is required." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
      );
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Crear pre-reserva de consulta si es un checkout de consultoría (mode === 'payment')
    let consultationId: string | undefined;
    if (mode === "payment") {
      const allowedConsultationTypes = new Set(["investment", "portfolio", "strategy", "technical", "general"]);
      const incomingType = (metadata as any).consultation_type as string | undefined;
      const normalizedType = incomingType && allowedConsultationTypes.has(incomingType) ? incomingType : "general";

      const consultationPayload = {
        user_id: resolvedUserId,
        scheduled_at: (metadata as any).scheduled_at || (metadata as any).booking_date,
        duration_minutes: Number((metadata as any).duration_minutes || (metadata as any).consultation_duration) || 30,
        status: "scheduled",
        client_name: (metadata as any).client_name || null,
        client_email: (metadata as any).client_email || resolvedEmail || null,
        consultation_type: normalizedType,
        description: (metadata as any).description || (metadata as any).notes || null,
        title: "Consulta general",
        stripe_session_id: null, // Inicialmente nulo, se actualizará después
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
        console.error("Failed to create consultation pre-booking:", consultationError);
        return new Response(
          JSON.stringify({ error: "Failed to create consultation" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 },
        );
      }
      consultationId = consultationRow?.id;
    }

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
    const params = new URLSearchParams({
      mode,
      customer: customerId,
      success_url: `${siteUrl}/academia/gracias?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/academia`,
      [`line_items[0][price]`]: priceId,
      [`line_items[0][quantity]`]: "1",
      [`metadata[access_type]`]: mode === "subscription" ? "membership" : "one_time",
    });

    if (resolvedUserId) {
      params.set("metadata[supabase_user_id]", resolvedUserId);
    }

    // Adjuntar consultation_id si existe
    if (consultationId) {
      params.set("metadata[consultation_id]", consultationId);
    } else {
      console.warn("Consultation ID is missing, Stripe metadata may be incomplete.");
    }

    // Log final Stripe payload
    console.log("Stripe checkout session payload:", Object.fromEntries(params));

    const sessionRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const session = await sessionRes.json();

    // Si Stripe devolvió un error, loguearlo para diagnosticar desde el Dashboard
    if (session?.error || !session?.id) {
      console.error('Stripe API returned error when creating checkout session', { status: sessionRes.status, body: session });
      return new Response(JSON.stringify(session), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Actualizar la consulta con el stripe_session_id
    if (consultationId) {
      const { error: updateError } = await supabase
        .from("consultations")
        .update({ stripe_session_id: session.id })
        .eq("id", consultationId);

      if (updateError) {
        console.error("Failed to update consultation with stripe_session_id:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to update consultation with Stripe session ID" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
        );
      }
    }

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 },
    );
  } catch (error) {
    console.error("Stripe session creation failed:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 },
    );
  }
});
