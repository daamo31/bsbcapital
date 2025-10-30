import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import "https://deno.land/std@0.210.0/dotenv/load.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-function-secret",
};

interface EmailRequest {
  type: string;
  to: string;
  subject?: string;
  html?: string;
  data?: Record<string, any>;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed. Use POST." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      },
    );
  }

  try {
    const { type, to, subject, html, data } = (await req.json()) as EmailRequest;

    // 🔐 Variables de entorno
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const defaultFrom =
      Deno.env.get("DEFAULT_FROM") || "BSB Capital <info@bsbcapital.io>";
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "info@bsbcapital.io";

    if (!resendApiKey) {
      throw new Error("Missing RESEND_API_KEY in environment");
    }

    if (!to) {
      throw new Error("Missing 'to' field in email request");
    }

    // 📨 Lógica especial: notificación a administradores
    const recipient =
      type === "admin_consultation_notification" ? adminEmail : to;

    // Si no hay HTML recibido, usa un fallback muy básico
    const htmlContent =
      html ||
      `<p>Hola ${data?.name || "usuario"},</p><p>Tu correo de tipo <b>${type}</b> ha sido procesado.</p>`;

    // 📦 Construcción del cuerpo de email
    const emailPayload = {
      from: defaultFrom,
      to: recipient,
      subject: subject || `Mensaje de BSB Capital (${type})`,
      html: htmlContent,
    };

    console.log("📨 Enviando correo con Resend...");
    console.log("→ Tipo:", type);
    console.log("→ Destinatario:", recipient);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    const result = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("❌ Resend API error:", result);
      throw new Error(result.message || "Unknown Resend API error");
    }

    console.log("✅ Correo enviado correctamente:", result.id);

    return new Response(
      JSON.stringify({
        success: true,
        id: result.id,
        recipient,
        type,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown internal error";

    console.error("❌ Error al enviar correo:", message);

    return new Response(
      JSON.stringify({ success: false, error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});
