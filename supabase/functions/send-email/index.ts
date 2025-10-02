import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { type, to, data } = await req.json()
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Email templates
    const templates = {
      welcome: {
        subject: '¡Bienvenido a BSB Capital Academy!',
        html: generateWelcomeEmail(data)
      },
      preregistration_confirmation: {
        subject: '✅ Preregistro confirmado - BSB Maker',
        html: generatePreregistrationEmail(data)
      },
      purchase_confirmation: {
        subject: '🎉 ¡Compra confirmada! - BSB Capital',
        html: generatePurchaseConfirmationEmail(data)
      },
      subscription_activated: {
        subject: '🚀 Tu membresía está activa - BSB Capital',
        html: generateSubscriptionActivatedEmail(data)
      },
      contact_form: {
        subject: '📨 Nuevo mensaje de contacto - BSB Capital',
        html: generateContactFormEmail(data)
      },
      service_inquiry: {
        subject: '🔔 Nueva consulta de servicio - BSB Capital',
        html: generateServiceInquiryEmail(data)
      }
    }

    const template = templates[type]
    if (!template) {
      throw new Error(`Unknown email type: ${type}`)
    }

    // Send email using Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BSB Capital <noreply@bsbcapital.io>',
        to: Array.isArray(to) ? to : [to],
        subject: template.subject,
        html: template.html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Resend API error: ${error}`)
    }

    const result = await response.json()

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})

// Email template functions
function generateWelcomeEmail(data) {
  const { name, email } = data
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Bienvenido a BSB Capital!</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #1e40af 0%, #7c3aed 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
        .highlight { background-color: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1e40af; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>¡Bienvenido a BSB Capital Academy!</h1>
          <p>Tu viaje hacia la excelencia financiera comienza aquí</p>
        </div>
        
        <div class="content">
          <h2>Hola ${name || 'Inversor'},</h2>
          
          <p>¡Es fantástico tenerte con nosotros! Tu cuenta en BSB Capital Academy ha sido creada exitosamente.</p>
          
          <div class="highlight">
            <h3>🎯 ¿Qué puedes hacer ahora?</h3>
            <ul>
              <li><strong>Explorar el catálogo</strong> de cursos disponibles</li>
              <li><strong>Revisar los planes</strong> de membresía premium</li>
              <li><strong>Acceder a contenido gratuito</strong> para empezar</li>
              <li><strong>Configurar tu perfil</strong> personalizado</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://bsbcapital.io/academia" class="button">Acceder a la Academia</a>
          </div>
          
          <h3>📚 Contenido destacado para empezar:</h3>
          <ul>
            <li><strong>Guía de Inversión:</strong> Conceptos básicos descargable</li>
            <li><strong>Videos introductorios:</strong> Fundamentos del trading</li>
            <li><strong>Comunidad:</strong> Conecta con otros inversores</li>
          </ul>
          
          <p>Si tienes alguna pregunta, no dudes en contactarnos respondiendo a este email o escribiendo a <strong>info@bsbcapital.io</strong></p>
          
          <p>¡Bienvenido a bordo!</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
        
        <div class="footer">
          <p>BSB Capital - Inteligencia Financiera Potenciada por IA</p>
          <p>Oficina en Dubái • Asesores financieros acreditados en España</p>
          <p><a href="https://bsbcapital.io">bsbcapital.io</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generatePreregistrationEmail(data) {
  const { name, email } = data
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Preregistro confirmado - BSB Maker</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #059669 0%, #0d9488 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .highlight { background-color: #ecfdf5; padding: 20px; border-radius: 8px; border-left: 4px solid #059669; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ ¡Preregistro Confirmado!</h1>
          <p>BSB Maker - Tu Copiloto de Trading con IA</p>
        </div>
        
        <div class="content">
          <h2>Hola ${name},</h2>
          
          <p>¡Gracias por tu interés en BSB Maker! Tu preregistro ha sido confirmado exitosamente.</p>
          
          <div class="highlight">
            <h3>🚀 ¿Qué sigue ahora?</h3>
            <ul>
              <li>Serás uno de los <strong>primeros en acceder</strong> cuando lancemos la beta</li>
              <li>Recibirás <strong>actualizaciones exclusivas</strong> sobre el desarrollo</li>
              <li>Tendrás <strong>descuentos especiales</strong> como early adopter</li>
              <li>Podrás <strong>influir en las características</strong> finales del producto</li>
            </ul>
          </div>
          
          <h3>🤖 Sobre BSB Maker:</h3>
          <p>BSB Maker es nuestro revolucionario copiloto de trading potenciado por inteligencia artificial. Diseñado para ayudarte a:</p>
          <ul>
            <li><strong>Analizar mercados</strong> en tiempo real</li>
            <li><strong>Identificar oportunidades</strong> de inversión</li>
            <li><strong>Gestionar riesgos</strong> automáticamente</li>
            <li><strong>Optimizar estrategias</strong> basadas en datos</li>
          </ul>
          
          <p>Mantente atento a tu bandeja de entrada para recibir noticias emocionantes sobre el lanzamiento.</p>
          
          <p>¡Gracias por formar parte de esta revolución financiera!</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
        
        <div class="footer">
          <p>BSB Capital - Inteligencia Financiera Potenciada por IA</p>
          <p><a href="https://bsbcapital.io">bsbcapital.io</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generatePurchaseConfirmationEmail(data) {
  const { name, email, planName, amount, transactionId } = data
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Compra confirmada! - BSB Capital</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .purchase-details { background-color: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #dc2626; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 ¡Compra Confirmada!</h1>
          <p>Bienvenido a BSB Capital Academy</p>
        </div>
        
        <div class="content">
          <h2>¡Felicidades ${name || 'Inversor'}!</h2>
          
          <p>Tu compra ha sido procesada exitosamente. Ya puedes acceder a todo el contenido premium de BSB Capital Academy.</p>
          
          <div class="purchase-details">
            <h3>📋 Detalles de la compra:</h3>
            <ul>
              <li><strong>Plan:</strong> ${planName || 'Membresía Premium'}</li>
              <li><strong>Monto:</strong> ${amount || 'N/A'}</li>
              <li><strong>ID de transacción:</strong> ${transactionId || 'N/A'}</li>
              <li><strong>Estado:</strong> ✅ Confirmada</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://bsbcapital.io/academia/contenido" class="button">Acceder al Contenido Premium</a>
          </div>
          
          <h3>🎯 Tu acceso incluye:</h3>
          <ul>
            <li><strong>Cursos completos</strong> de inversión y trading</li>
            <li><strong>Videos premium</strong> con estrategias avanzadas</li>
            <li><strong>Materiales descargables</strong> (PDFs, hojas de cálculo)</li>
            <li><strong>Actualizaciones continuas</strong> de contenido</li>
            <li><strong>Acceso a la comunidad</strong> exclusiva</li>
          </ul>
          
          <p>Si tienes alguna pregunta sobre tu membresía, no dudes en contactarnos en <strong>info@bsbcapital.io</strong></p>
          
          <p>¡Disfruta de tu formación!</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
        
        <div class="footer">
          <p>BSB Capital - Inteligencia Financiera Potenciada por IA</p>
          <p><a href="https://bsbcapital.io">bsbcapital.io</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateSubscriptionActivatedEmail(data) {
  const { name, email, planName } = data
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Tu membresía está activa! - BSB Capital</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .highlight { background-color: #faf5ff; padding: 20px; border-radius: 8px; border-left: 4px solid #7c3aed; margin: 20px 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
        .footer { background-color: #f1f5f9; padding: 30px; text-align: center; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 ¡Tu Membresía Está Activa!</h1>
          <p>BSB Capital Academy</p>
        </div>
        
        <div class="content">
          <h2>¡Excelente ${name || 'Inversor'}!</h2>
          
          <p>Tu membresía <strong>${planName || 'Premium'}</strong> ha sido activada exitosamente. Ya tienes acceso completo a toda la academia.</p>
          
          <div class="highlight">
            <h3>🎯 Empieza tu aprendizaje:</h3>
            <ul>
              <li><strong>Módulo 1:</strong> Fundamentos de inversión</li>
              <li><strong>Módulo 2:</strong> Análisis técnico avanzado</li>
              <li><strong>Módulo 3:</strong> Gestión de riesgos</li>
              <li><strong>Módulo 4:</strong> Estrategias algorítmicas</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://bsbcapital.io/academia" class="button">Comenzar Ahora</a>
          </div>
          
          <h3>💡 Consejos para aprovechar al máximo:</h3>
          <ul>
            <li><strong>Establece un horario</strong> de estudio regular</li>
            <li><strong>Practica</strong> con las herramientas proporcionadas</li>
            <li><strong>Participa</strong> en la comunidad</li>
            <li><strong>Aplica</strong> lo aprendido gradualmente</li>
          </ul>
          
          <p>¿Preguntas sobre el contenido? Escríbenos a <strong>info@bsbcapital.io</strong></p>
          
          <p>¡Bienvenido a la comunidad premium!</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        </div>
        
        <div class="footer">
          <p>BSB Capital - Inteligencia Financiera Potenciada por IA</p>
          <p><a href="https://bsbcapital.io">bsbcapital.io</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateContactFormEmail(data) {
  const { name, email, subject, message } = data
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuevo mensaje de contacto</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .message-content { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📨 Nuevo mensaje de contacto</h1>
          <p>Recibido desde el formulario web de BSB Capital</p>
        </div>
        
        <div>
          <h3>Información del contacto:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${name || 'No proporcionado'}</li>
            <li><strong>Email:</strong> ${email || 'No proporcionado'}</li>
            <li><strong>Asunto:</strong> ${subject || 'Sin asunto'}</li>
          </ul>
        </div>
        
        <div class="message-content">
          <h3>Mensaje:</h3>
          <p>${message || 'Sin mensaje'}</p>
        </div>
        
        <div>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Responder a:</strong> <a href="mailto:${email}">${email}</a></p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateServiceInquiryEmail(data) {
  const { fullName, email, phone, message } = data
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nueva consulta de servicio</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; }
        .header { border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
        .inquiry-content { background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .priority { background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 Nueva consulta de servicio</h1>
          <p>Solicitud de asesoría personalizada</p>
        </div>
        
        <div class="priority">
          <strong>⚠️ Requiere seguimiento personalizado</strong>
        </div>
        
        <div>
          <h3>Información del cliente:</h3>
          <ul>
            <li><strong>Nombre completo:</strong> ${fullName || 'No proporcionado'}</li>
            <li><strong>Email:</strong> ${email || 'No proporcionado'}</li>
            <li><strong>Teléfono:</strong> ${phone || 'No proporcionado'}</li>
          </ul>
        </div>
        
        <div class="inquiry-content">
          <h3>Consulta:</h3>
          <p>${message || 'Sin mensaje'}</p>
        </div>
        
        <div>
          <h3>Acciones recomendadas:</h3>
          <ul>
            <li>Responder en un plazo máximo de 24 horas</li>
            <li>Evaluar el tipo de servicio más adecuado</li>
            <li>Programar llamada de seguimiento si es necesario</li>
          </ul>
        </div>
        
        <div>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p><strong>Responder a:</strong> <a href="mailto:${email}">${email}</a></p>
          ${phone ? `<p><strong>Llamar a:</strong> <a href="tel:${phone}">${phone}</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `
}