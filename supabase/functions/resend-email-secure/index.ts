import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-function-secret',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )
  }

  try {
    // Security: Check function secret (si está configurado)
    const expectedSecret = Deno.env.get('EXPECTED_FUNCTION_SECRET')
    if (expectedSecret) {
      const providedSecret = req.headers.get('x-function-secret')
      if (providedSecret !== expectedSecret) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid function secret' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401 
          }
        )
      }
    }

    const { type, to, data, subject, html } = await req.json()
    
    // Obtener configuración de variables de entorno
    let resendApiKey = Deno.env.get('RESEND_API_KEY')
    const defaultFrom = Deno.env.get('DEFAULT_FROM') || 'BSB Capital <onboarding@resend.dev>'
    
    // Fallback para desarrollo (como antes)
    if (!resendApiKey) {
      console.log('⚠️ Usando API key de desarrollo - NO usar en producción')
      resendApiKey = 're_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M'
    } else {
      console.log('✅ Usando API key de variable de entorno (seguro para producción)')
    }
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Validación de entrada
    if (!to || !type) {
      throw new Error('Missing required fields: to, type')
    }

    // Rate limiting básico por IP (opcional)
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    console.log(`📧 Email request from IP: ${clientIP}, type: ${type}, to: ${to}`)

    // Función para generar email de bienvenida
    const generateWelcomeEmail = (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a BSB Capital</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BSB Capital Academy</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">Tu puerta de entrada al mundo de las inversiones</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px;">¡Bienvenido, ${data.name}! 🎉</h2>
              <p style="color: #64748b; margin: 0; font-size: 18px;">Tu cuenta ha sido creada exitosamente</p>
            </div>
            
            <div style="background-color: #f1f5f9; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="color: #1e293b; margin: 0 0 20px 0; font-size: 20px;">🚀 ¿Qué puedes hacer ahora?</h3>
              <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 16px;">
                <li style="margin-bottom: 10px;">🎓 Explorar nuestra Academia con contenido exclusivo</li>
                <li style="margin-bottom: 10px;">💼 Reservar consultas personalizadas con nuestros expertos</li>
                <li style="margin-bottom: 10px;">📊 Acceder a herramientas avanzadas de análisis</li>
                <li style="margin-bottom: 0;">🔔 Recibir alertas y recomendaciones personalizadas</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: transform 0.2s;">
                Comenzar Ahora →
              </a>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin: 30px 0;">
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                <strong>💡 Consejo:</strong> Completa tu perfil para recibir recomendaciones personalizadas
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
              ¿Necesitas ayuda? Contáctanos en 
              <a href="mailto:soporte@bsbcapital.com" style="color: #3b82f6; text-decoration: none;">soporte@bsbcapital.com</a>
            </p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              © 2024 BSB Capital. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Función para generar email de confirmación de consulta
    const generateConsultationEmail = (data) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consultoría Confirmada</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">BSB Capital</h1>
            <p style="color: #d1fae5; margin: 10px 0 0 0; font-size: 16px;">Consultoría Personalizada</p>
          </div>
          
          <!-- Main Content -->
          <div style="padding: 40px 30px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin: 0 0 15px 0; font-size: 24px;">¡Consultoría Confirmada! ✅</h2>
              <p style="color: #64748b; margin: 0; font-size: 18px;">Hola ${data.name}, tu cita está programada</p>
            </div>
            
            <div style="background-color: #f0fdf4; border: 2px solid #bbf7d0; padding: 30px; border-radius: 12px; margin-bottom: 30px;">
              <h3 style="color: #166534; margin: 0 0 20px 0; font-size: 20px;">📅 Detalles de tu Consultoría</h3>
              <div style="color: #374151; font-size: 16px;">
                <p style="margin: 0 0 12px 0;"><strong>Tipo:</strong> ${data.consultationType || 'Consultoría General'}</p>
                <p style="margin: 0 0 12px 0;"><strong>Fecha:</strong> ${data.scheduledDate || 'Por confirmar'}</p>
                <p style="margin: 0 0 12px 0;"><strong>Hora:</strong> ${data.scheduledTime || 'Por confirmar'}</p>
                <p style="margin: 0 0 12px 0;"><strong>Duración:</strong> ${data.duration || '60 minutos'}</p>
                ${data.consultationGoals ? `<p style="margin: 0;"><strong>Objetivos:</strong> ${data.consultationGoals}</p>` : ''}
              </div>
            </div>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 25px; border-radius: 6px; margin: 30px 0;">
              <h4 style="margin: 0 0 15px 0; color: #92400e; font-size: 16px;">📋 Preparación para la Consulta</h4>
              <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px;">
                <li style="margin-bottom: 8px;">Prepara tus preguntas específicas</li>
                <li style="margin-bottom: 8px;">Ten a mano información sobre tus inversiones actuales</li>
                <li style="margin-bottom: 8px;">Define claramente tus objetivos financieros</li>
                <li style="margin-bottom: 0;">Asegúrate de tener buena conexión a internet</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="#" style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                Ver en Mi Panel →
              </a>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 15px 0; color: #64748b; font-size: 14px;">
              ¿Necesitas reagendar? Contáctanos en 
              <a href="mailto:consultas@bsbcapital.com" style="color: #10b981; text-decoration: none;">consultas@bsbcapital.com</a>
            </p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              © 2024 BSB Capital. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Templates de emails disponibles
    const templates = {
      welcome: {
        subject: '¡Bienvenido a BSB Capital Academy! 🎉',
        html: generateWelcomeEmail(data)
      },
      consultation_confirmation: {
        subject: '📅 Consultoría Confirmada - BSB Capital',
        html: generateConsultationEmail(data)
      },
      test: {
        subject: '🧪 Test Email - BSB Capital',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1e40af;">🧪 Email de Prueba - BSB Capital</h1>
            <p>Este es un email de prueba desde BSB Capital.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Enviado a:</strong> ${to}</p>
              <p><strong>Tipo:</strong> ${type}</p>
              <p><strong>Hora:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Función:</strong> resend-email-secure</p>
            </div>
            <p style="color: #059669;"><strong>✅ El sistema de emails está funcionando correctamente!</strong></p>
          </div>
        `
      },
      custom: {
        subject: subject || 'Mensaje desde BSB Capital',
        html: html || '<p>Email personalizado</p>'
      }
    }

    const template = templates[type] || templates.test

    // Preparar datos del email
    const emailData = {
      from: defaultFrom,
      to: to,
      subject: template.subject,
      html: template.html
    }

    // Enviar email usando Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(`Resend API error: ${result.message || 'Unknown error'}`)
    }

    // Log exitoso
    console.log(`✅ Email enviado exitosamente: ${result.id} to ${to}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        id: result.id,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Error sending email:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})