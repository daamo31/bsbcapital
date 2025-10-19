import { serve } from "https://deno.land/std@0.210.0/http/server.ts" // Versión estable actualizada

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-function-secret',
}

// ⚠️ Esta función de Deno requiere los permisos: --allow-net --allow-env

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
    const { type, to, data, subject, html } = await req.json()
    
    // Obtener configuración de variables de entorno
    let resendApiKey = Deno.env.get('RESEND_API_KEY')
    const defaultFrom = Deno.env.get('DEFAULT_FROM') || 'BSB Capital <onboarding@resend.dev>'
    const adminEmail = Deno.env.get('ADMIN_EMAIL') // Nuevo: Email del administrador para notificaciones
    
    // Fallback para desarrollo (mantener si es necesario, pero es mejor usar .env local)
    if (!resendApiKey) {
      console.log('⚠️ Usando API key de desarrollo')
      resendApiKey = 're_Te7ktzMc_Mc8vbmFez55QdgjnGhNMzW7M'
    }
    
    // Eliminado: console.log de la API Key por seguridad

    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    // Validación de entrada
    if (!to && type !== 'admin_consultation_notification') { // Si no es notificación de admin, 'to' es obligatorio
        if (!to) throw new Error('Missing required field: to')
    }
    
    // Validación específica para admin_consultation_notification
    if (type === 'admin_consultation_notification' && !adminEmail) {
        throw new Error('ADMIN_EMAIL environment variable not configured for admin notifications')
    }

    // Log para debugging
    console.log(`📧 Email request - type: ${type}, to: ${to || 'Admin notification'}`)

    // Función para generar email base con estilo BSB Capital
    const generateEmailTemplate = (title, content, emoji = "💼") => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - BSB Capital</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; line-height: 1.7;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">${emoji} BSB Capital</h1>
            <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">${title}</p>
          </div>
          
          <div style="padding: 40px 30px;">
            ${content}
          </div>
          
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              © 2024 BSB Capital. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    // Email de bienvenida general
    const generateWelcomeEmail = (data) => generateEmailTemplate(
      "Tu acceso gratuito a BSB Capital ya está activo",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
          Gracias por unirte a la comunidad de BSB Capital.<br/>
          Tu plan Free Access ya está activo y a partir de hoy recibirás nuestra newsletter exclusiva, con análisis, reflexiones financieras y contenido para ayudarte a tomar decisiones más inteligentes con tu dinero.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Aprovecha esta oportunidad para conocer nuestra forma de entender las finanzas: profesional, transparente y centrada en el crecimiento real.
        </p>
        
        <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin-bottom: 10px;">
          Bienvenido a la nueva forma de invertir.
        </p>
        <p style="color: #475569; font-size: 16px;">
          El equipo de BSB Capital
        </p>
      `,
      "💼"
    )

    // Email de consultoría financiera
    const generateConsultationFinancialEmail = (data) => generateEmailTemplate(
      "Tu consultoría en BSB Capital está confirmada",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
          Gracias por confiar en BSB Capital.<br/>
          Tu consultoría personalizada ha sido confirmada con éxito.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          En esta sesión trabajaremos contigo para analizar tu situación financiera y diseñar una estrategia clara, realista y adaptada a tus objetivos.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">Durante la reunión:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">● Revisaremos tu situación actual y tus prioridades.</li>
            <li style="margin-bottom: 8px;">● Estableceremos una hoja de ruta personalizada.</li>
            <li style="margin-bottom: 0;">● Recibirás un resumen detallado con las conclusiones y próximos pasos.</li>
          </ul>
        </div>
        
        <p style="color: #059669; font-size: 16px; margin-bottom: 25px; font-weight: 600;">
          📅 En breve recibirás un correo con los detalles de la cita y el enlace de acceso.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          Gracias por permitirnos acompañarte en tu crecimiento financiero.
        </p>
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `,
      "🗓️"
    )

    // Email de consultoría crypto avanzada
    const generateConsultationCryptoAdvancedEmail = (data) => generateEmailTemplate(
      "Tu consultoría avanzada de Crypto & Web3 ha sido confirmada",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Tu consultoría estratégica de Crypto & Web3 con BSB Capital está confirmada.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Durante la sesión, trabajaremos contigo para analizar tu exposición actual al ecosistema cripto, revisar tus estrategias y definir un plan de acción claro y alineado con tus objetivos.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Ya sea para optimizar tu cartera, integrar activos digitales o entender nuevas oportunidades de inversión, recibirás una visión técnica, práctica y profesional.
        </p>
        
        <p style="color: #059669; font-size: 16px; margin-bottom: 25px; font-weight: 600;">
          🚀 Pronto te enviaremos los detalles de tu cita y un breve formulario previo para personalizar la sesión.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          Gracias por apostar por el futuro de la inversión.
        </p>
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `,
      "🚀"
    )

    // Email de onboarding crypto
    const generateConsultationCryptoOnboardingEmail = (data) => generateEmailTemplate(
      "Bienvenido al mundo cripto con BSB Capital",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Tu consultoría de Onboarding Crypto & Web3 está confirmada.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          En esta sesión te guiaremos paso a paso para entender cómo funciona el ecosistema cripto, invertir con seguridad y comenzar con una estrategia sólida y sencilla.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Verás que no hace falta experiencia previa: te acompañaremos en todo momento para que empieces con confianza y claridad.
        </p>
        
        <p style="color: #059669; font-size: 16px; margin-bottom: 25px; font-weight: 600;">
          📅 En breve recibirás los detalles de tu cita y el acceso al formulario previo.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          Bienvenido a una nueva forma de entender las finanzas.
        </p>
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `,
      "🌍"
    )

    // Email de academia BSB
    const generateAcademyEmail = (data) => generateEmailTemplate(
      "Tu acceso a la Academia BSB está activo",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
          ¡Bienvenido a la Academia BSB!<br/>
          Tu inscripción se ha completado con éxito.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">A partir de ahora tendrás acceso a:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">● Píldoras formativas para dominar los fundamentos.</li>
            <li style="margin-bottom: 8px;">● Masterclass exclusivas con estrategias y análisis avanzados.</li>
            <li style="margin-bottom: 0;">● Recursos descargables y materiales de apoyo.</li>
          </ul>
        </div>
        
        <p style="color: #059669; font-size: 16px; margin-bottom: 25px; font-weight: 600;">
          📚 En los próximos días recibirás un correo con tus credenciales y una guía para sacar el máximo partido a tu formación.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          Gracias por apostar por tu educación financiera.
        </p>
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `,
      "🎓"
    )

    // Email de Trader Plan Pro
    const generateTraderPlanProEmail = (data) => generateEmailTemplate(
      "Tu suscripción a Trader Plan Pro está activa",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
          Bienvenido a Trader Plan Pro.<br/>
          Tu membresía ya está activa y con ella desbloqueas acceso a las herramientas y conocimientos que te ayudarán a llevar tu trading al siguiente nivel.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">A partir de ahora podrás disfrutar de:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">● Acceso anticipado a BSB Maker, tu copiloto de trading con IA.</li>
            <li style="margin-bottom: 8px;">● Acceso completo a la formación (píldoras + masterclass).</li>
            <li style="margin-bottom: 8px;">● 20% de descuento en consultorías personalizadas.</li>
            <li style="margin-bottom: 0;">● 1 consultoría de 30 minutos incluida en tu plan anual.</li>
          </ul>
        </div>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Prepárate para optimizar tus operaciones y entender los mercados con otra perspectiva.
        </p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          Gracias por confiar en BSB Capital.
        </p>
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `,
      "🚀"
    )
    
    // Email de Premium Investor
    const generatePremiumInvestorEmail = (data) => generateEmailTemplate(
      "Tu membresía Premium Investor está activa",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
          Tu suscripción a Premium Investor está confirmada.<br/>
          A partir de hoy formas parte de una comunidad exclusiva de inversores que buscan claridad, estrategia y crecimiento sostenible.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">Con tu membresía tienes acceso a:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">● Comunidad privada de inversores BSB.</li>
            <li style="margin-bottom: 8px;">● Acceso completo a la formación avanzada (cursos temáticos + masterclass).</li>
            <li style="margin-bottom: 8px;">● 20% de descuento en consultorías.</li>
            <li style="margin-bottom: 0;">● 1 consultoría personalizada de 30 minutos incluida en tu plan anual.</li>
          </ul>
        </div>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          Explora, aprende y crece junto a nosotros.<br/>
          El equipo de BSB Capital está contigo en cada paso.
        </p>
      `,
      "💎"
    )

    // Email de Wealth Membership
    const generateWealthMembershipEmail = (data) => generateEmailTemplate(
      "Bienvenido a Wealth Membership — Tu gestión patrimonial personalizada ya está activa",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Hola ${data.name},</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 20px;">
          Gracias por confiar en BSB Capital para acompañarte en la gestión de tu patrimonio.<br/>
          Tu membresía Wealth Membership ha sido activada con éxito.
        </p>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin: 0 0 15px 0; font-size: 18px;">A partir de ahora contarás con un acompañamiento exclusivo y continuo que incluye:</h3>
          <ul style="color: #475569; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">● 6 consultorías personalizadas de 1h/año (valoradas en 1.800 €).</li>
            <li style="margin-bottom: 8px;">● Revisión completa de cartera semestral.</li>
            <li style="margin-bottom: 8px;">● Plan estratégico anual con propuestas de optimización.</li>
            <li style="margin-bottom: 0;">● Acceso a un canal privado prioritario y comunidad élite con análisis exclusivos y oportunidades de networking.</li>
          </ul>
        </div>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Este plan está diseñado para ofrecerte claridad, continuidad y control sobre tu estrategia patrimonial, sin ceder la gestión.
        </p>
        
        <p style="color: #059669; font-size: 16px; margin-bottom: 25px; font-weight: 600;">
          Tu consultor asignado se pondrá en contacto contigo en las próximas 24 h para programar la primera sesión.
        </p>
        
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `, // <<< CORREGIDO: Cierre del template literal
      "🏛️"
    )

    // Email de notificación para administradores cuando se reserva una consultoría
    const generateAdminConsultationNotification = (data) => generateEmailTemplate(
      "Nueva Consultoría Reservada - BSB Capital",
      `
        <p style="color: #1e293b; font-size: 18px; margin-bottom: 25px;">Equipo BSB Capital,</p>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 25px;">
          Se ha reservado una nueva consultoría en la plataforma.<br/>
          A continuación encontrarás todos los detalles:
        </p>
        
        <div style="background-color: #f0f9ff; padding: 25px; border-radius: 12px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
          <h3 style="color: #0c4a6e; margin: 0 0 20px 0; font-size: 18px;">📋 Detalles de la Consultoría</h3>
          <div style="color: #0f172a; font-size: 16px; line-height: 1.8;">
            <p style="margin: 0 0 12px 0;"><strong>👤 Cliente:</strong> ${data.clientName}</p>
            <p style="margin: 0 0 12px 0;"><strong>📧 Email:</strong> ${data.clientEmail}</p>
            <p style="margin: 0 0 12px 0;"><strong>📞 Teléfono:</strong> ${data.clientPhone || 'No proporcionado'}</p>
            <p style="margin: 0 0 12px 0;"><strong>📝 Tipo:</strong> ${data.consultationType}</p>
            <p style="margin: 0 0 12px 0;"><strong>📅 Fecha solicitada:</strong> ${data.preferredDate || 'Por definir'}</p>
            <p style="margin: 0 0 12px 0;"><strong>⏰ Hora solicitada:</strong> ${data.preferredTime || 'Por definir'}</p>
            <p style="margin: 0 0 12px 0;"><strong>💰 Precio:</strong> ${data.price || 'Por definir'}</p>
            <p style="margin: 0;"><strong>📝 Estado:</strong> <span style="color: #d97706; font-weight: 600;">PENDIENTE DE CONFIRMACIÓN</span></p>
          </div>
        </div>
        
        ${data.consultationGoals ? `
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h4 style="color: #1e293b; margin: 0 0 15px 0; font-size: 16px;">🎯 Objetivos de la consultoría:</h4>
            <p style="color: #475569; margin: 0; font-size: 16px;">${data.consultationGoals}</p>
          </div>
        ` : ''}
        
        ${data.additionalInfo ? `
          <div style="background-color: #fef7cd; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
            <h4 style="color: #92400e; margin: 0 0 15px 0; font-size: 16px;">💬 Información adicional:</h4>
            <p style="color: #78350f; margin: 0; font-size: 16px;">${data.additionalInfo}</p>
          </div>
        ` : ''}
        
        <div style="background-color: #ecfdf5; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #10b981;">
          <h4 style="color: #065f46; margin: 0 0 15px 0; font-size: 16px;">🚀 Próximos pasos:</h4>
          <ul style="color: #047857; margin: 0; padding-left: 20px; font-size: 16px;">
            <li style="margin-bottom: 8px;">Revisar la solicitud en el panel de administración</li>
            <li style="margin-bottom: 8px;">Confirmar fecha y hora con el cliente</li>
            <li style="margin-bottom: 8px;">Enviar enlace de reunión si es virtual</li>
            <li style="margin-bottom: 0;">Actualizar el estado en el sistema</li>
          </ul>
        </div>
        
        <p style="color: #475569; font-size: 16px; margin-bottom: 10px;">
          <strong>Fecha de solicitud:</strong> ${new Date().toLocaleString('es-ES')}
        </p>
        
        <p style="color: #1e293b; font-size: 16px; font-weight: 600;">
          El equipo de BSB Capital
        </p>
      `,
      "📧"
    )
    
    const templates = {
      // Free Access - Confirmación de suscripción gratuita
      welcome: {
        subject: 'Tu acceso gratuito a BSB Capital ya está activo 💼',
        html: generateWelcomeEmail(data)
      },
      
      // Consultorías
      consultation_financial: {
        subject: 'Tu consultoría en BSB Capital está confirmada 🗓️',
        html: generateConsultationFinancialEmail(data)
      },
      consultation_crypto_advanced: {
        subject: 'Tu consultoría avanzada de Crypto & Web3 ha sido confirmada 🚀',
        html: generateConsultationCryptoAdvancedEmail(data)
      },
      consultation_crypto_onboarding: {
        subject: 'Bienvenido al mundo cripto con BSB Capital 🌍',
        html: generateConsultationCryptoOnboardingEmail(data)
      },
      
      // Academia y Membresías
      academia_bsb: {
        subject: 'Tu acceso a la Academia BSB está activo 🎓',
        html: generateAcademyEmail(data)
      },
      trader_plan_pro: {
        subject: 'Tu suscripción a Trader Plan Pro está activa 🚀',
        html: generateTraderPlanProEmail(data)
      },
      premium_investor: {
        subject: 'Tu membresía Premium Investor está activa 💎',
        html: generatePremiumInvestorEmail(data)
      },
      wealth_membership: {
        subject: 'Bienvenido a Wealth Membership — Tu gestión patrimonial personalizada ya está activa 🏛️',
        html: generateWealthMembershipEmail(data)
      },
      
      // Notificaciones para administradores
      admin_consultation_notification: {
        subject: '📧 Nueva Consultoría Reservada - BSB Capital',
        html: generateAdminConsultationNotification(data)
      },
      
      // Backwards compatibility - mantener nombres anteriores
      consultation_confirmation: {
        subject: 'Tu consultoría en BSB Capital está confirmada 🗓️',
        html: generateConsultationFinancialEmail(data)
      },
      
      // Test y custom
      test: {
        subject: '🧪 Test Email - BSB Capital',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1e40af;">🧪 Email de Prueba - BSB Capital</h1>
            <p>Este es un email de prueba desde BSB Capital.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Enviado a:</strong> ${to || 'N/A'}</p>
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
    
    let recipientTo = to // Destinatario por defecto es el del payload

    // Ajustar el destinatario si es una notificación de administrador
    if (type === 'admin_consultation_notification') {
        // Enviar al email de administrador configurado
        recipientTo = adminEmail
        console.log(`📧 Enviando notificación de administrador a: ${recipientTo}`);
    } else {
        // Enviar al destinatario real
        console.log(`📧 Enviando email tipo '${type}' - Destino real: ${recipientTo}`);
    }

    console.log(`👤 Remitente configurado: ${defaultFrom}`);

    // Preparar datos del email
    const emailData = {
      from: defaultFrom,
      to: recipientTo, // Usar el destinatario ajustado
      subject: template.subject,
      html: template.html
    }

    console.log('📧 Datos del email (sin HTML completo):', JSON.stringify({ ...emailData, html: '...HTML Content...' }, null, 2))

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
    
    console.log('📨 Respuesta de Resend:', JSON.stringify(result, null, 2))
    console.log('🌐 Status de respuesta:', response.status)

    if (!response.ok) {
      console.error('❌ Error de Resend:', {
        status: response.status,
        message: result.message,
        from: defaultFrom
      })
      throw new Error(`Resend API error: ${result.message || 'Unknown error'} | Status: ${response.status}`)
    }

    // Log exitoso
    console.log(`✅ Email enviado exitosamente: ${result.id} | Destino: ${recipientTo} | Desde: ${defaultFrom}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Email sent successfully',
        id: result.id,
        recipient: recipientTo,
        sender: defaultFrom,
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