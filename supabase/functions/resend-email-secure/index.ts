import { serve } from "https://deno.land/std@0.210.0/http/server.ts";
import "https://deno.land/std@0.210.0/dotenv/load.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-function-secret",
};

interface EmailRequest {
  type: string;
  to?: string;
  data: Record<string, any>;
  subject?: string;
  html?: string;
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
      }
    );
  }

  try {
    const { type, to, data, subject, html } = (await req.json()) as EmailRequest;

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const defaultFrom = Deno.env.get("DEFAULT_FROM") || "BSB Capital <info@bsbcapital.com>";
    const adminEmail = Deno.env.get("ADMIN_EMAIL");

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }

    if (!to && type !== "admin_consultation_notification") {
      throw new Error("Missing required field: to");
    }

    if (type === "admin_consultation_notification" && !adminEmail) {
      throw new Error("ADMIN_EMAIL environment variable not configured for admin notifications");
    }

    const templates: Record<string, { subject: string; html: string }> = {
      consultation_confirmation: {
        subject: "Tu consultoría en BSB Capital está confirmada 🗓️",
        html: `<p>Hola ${data.clientName}, tu consulta está confirmada para el ${data.consultationDate}.</p>`
      },
      admin_consultation_notification: {
        subject: "Nueva Consultoría Reservada - BSB Capital",
        html: `<p>Se ha reservado una nueva consultoría para ${data.clientName} (${data.clientEmail}).</p>`
      },
    };

    const template = templates[type] || { subject: subject || "Mensaje desde BSB Capital", html: html || "<p>Email personalizado</p>" };

    const emailData = {
      from: defaultFrom,
      to: type === "admin_consultation_notification" ? adminEmail : to,
      subject: template.subject,
      html: template.html,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Resend API error: ${result.message || "Unknown error"}`);
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id, recipient: emailData.to }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});