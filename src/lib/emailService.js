// Servicio para envío de emails usando Supabase Edge Functions + Resend
import { supabase } from './customSupabaseClient.js';

class EmailService {
  constructor() {
    this.functionName = 'resend-email-secure'; // Solo usar la función segura
    
    // Configuración de URLs para logos
    this.BASE_URL = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://horizons-ten.vercel.app';
    
    this.LOGO_URLS = {
      gold: `${this.BASE_URL}/public/images/gold_logo.jpeg`,
      black: `${this.BASE_URL}/public/images/black_logo.jpeg`,
      white: `${this.BASE_URL}/public/images/white_logo.jpeg`,
      default: `${this.BASE_URL}/public/images/gold_logo.jpeg`
    };
  }

  // Plantillas de correos personalizados
  getTemplates() {
    return {
      consultation_financial: {
        subject: "Tu consultoría en BSB Capital está confirmada 🗓️",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Consultoría</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">Tu consultoría está confirmada</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Gracias por confiar en BSB Capital. Tu consultoría personalizada ha sido confirmada con éxito.<br><br>
          En esta sesión trabajaremos contigo para analizar tu situación financiera y diseñar una estrategia clara, realista y adaptada a tus objetivos.<br><br>
          Durante la reunión:<br>
          ● Revisaremos tu situación actual y tus prioridades.<br>
          ● Estableceremos una hoja de ruta personalizada.<br>
          ● Recibirás un resumen detallado con las conclusiones y próximos pasos.<br>
          📅 En breve recibirás un correo con los detalles de la cita y el enlace de acceso.<br><br>
          Gracias por permitirnos acompañarte en tu crecimiento financiero.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación de consultoría.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
      },
      consultation_crypto_advanced: {
        subject: "Tu consultoría avanzada de Crypto & Web3 ha sido confirmada 🚀",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Consultoría Avanzada</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">Tu consultoría avanzada está confirmada</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu consultoría estratégica de Crypto & Web3 con BSB Capital está confirmada.<br><br>
          Durante la sesión, trabajaremos contigo para analizar tu exposición actual al ecosistema cripto, revisar tus estrategias y definir un plan de acción claro y alineado con tus objetivos.<br><br>
          Ya sea para optimizar tu cartera, integrar activos digitales o entender nuevas oportunidades de inversión, recibirás una visión técnica, práctica y profesional.<br><br>
          📅 Pronto te enviaremos los detalles de tu cita y un breve formulario previo para personalizar la sesión.<br><br>
          Gracias por confiar en BSB Capital para tu crecimiento financiero.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación de consultoría avanzada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
      },
      consultation_confirmation: {
        subject: "Confirmación de tu consulta en BSB Capital",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de tu consulta</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">Confirmación de tu consulta</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Gracias por confiar en BSB Capital. Tu consulta ha sido confirmada con éxito.<br><br>
          Detalles de la consulta:<br>
          ● Fecha: [Fecha]<br>
          ● Tipo: [Tipo]<br>
          ● Monto: [Monto] [Moneda]<br><br>
          Nos vemos pronto.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación de consulta.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
      },
      consultation_reminder: {
        subject: "Recordatorio: Consulta programada en BSB Capital",
        html: `Hola [Nombre],<br><br>
        Este es un recordatorio de tu consulta programada con BSB Capital.<br><br>
        Detalles de la consulta:<br>
        ● Fecha: [Fecha]<br>
        ● Tipo: [Tipo]<br>
        ● Monto: [Monto] [Moneda]<br><br>
        Gracias por confiar en nosotros.<br>
        El equipo de BSB Capital`
      },
      consultation_completed: {
        subject: "Seguimiento: Consulta completada en BSB Capital",
        html: `Hola [Nombre],<br><br>
        Gracias por asistir a tu consulta con BSB Capital.<br><br>
        Esperamos que la sesión haya sido útil y te invitamos a contactarnos si tienes más preguntas o necesitas apoyo adicional.<br><br>
        El equipo de BSB Capital`
      },
      onboarding_crypto: {
        subject: "Bienvenido al mundo cripto con BSB Capital 🌍",
        html: `Hola [Nombre],<br><br>
        Tu consultoría de Onboarding cripto está confirmada.<br><br>
        En esta sesión te guiaremos paso a paso para entender cómo funciona el ecosistema cripto, invertir con seguridad y comenzar con una estrategia sólida y sencilla.<br><br>
        Verás que no hace falta experiencia previa: te acompañaremos en todo momento para que empieces con confianza y claridad.<br><br>
        📅 En breve recibirás los detalles de tu cita y el acceso al formulario previo.<br><br>
        Bienvenido a una nueva forma de entender las finanzas.<br>
        El equipo de BSB Capital`
      },
      academia_bsb: {
        subject: "Tu acceso a la Academia BSB está activo 🎓",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Academia BSB Activada</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Bienvenido a la Academia BSB! 🎓</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu acceso a la Academia BSB Capital está activo.<br>
          Ya puedes comenzar tu formación en inversión, fiscalidad y crypto con nuestro método práctico y directo.<br><br>
          Con tu acceso obtienes:<br><br>
          ● Acceso completo al contenido de la academia<br>
          ● 4 módulos completos de formación<br>
          ● Plantillas y checklists descargables<br>
          ● Soporte prioritario por email<br>
          ● Actualizaciones gratuitas<br>
          ● Comunidad privada de alumnos<br><br>
          ✅ <a href="https://bsbcapital.io/academia" style="color:#C5A019; text-decoration:none;">Acceder a la Academia ahora</a><br><br>
          Gracias por invertir en tu formación financiera.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Tu acceso a la Academia BSB está confirmado.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
      },
      trader_plan_pro: {
        subject: "Tu membresía Trader Plan Pro está activa 📈",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trader Plan Pro Activo</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Tu membresía Trader Plan Pro está activa! 📈</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Bienvenido a Trader Plan Pro.<br>
          Tu membresía ya está activa y con ella desbloqueas acceso a las herramientas y conocimientos que te ayudarán a llevar tu trading al siguiente nivel.<br><br>
          A partir de ahora podrás disfrutar de:<br><br>
          ● Acceso anticipado a BSB Maker, tu copiloto de trading con IA<br>
          ● Acceso completo a la formación (píldoras + masterclass)<br>
          ● 20% de descuento en consultorías personalizadas<br>
          ● 1 consultoría de 30 minutos incluida en tu plan anual<br><br>
          ✅ <a href="https://bsbcapital.io/bsb-maker" style="color:#C5A019; text-decoration:none;">Explorar BSB Maker</a><br>
          ✅ <a href="https://bsbcapital.io/academia" style="color:#C5A019; text-decoration:none;">Acceder a la formación</a><br><br>
          Prepárate para optimizar tus operaciones y entender los mercados con otra perspectiva.<br><br>
          Gracias por confiar en BSB Capital.<br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Tu membresía Trader Plan Pro está confirmada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
      },
      premium_investor: {
        subject: "Tu membresía Premium Investor está activa 💎",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Premium Investor Activo</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Tu membresía Premium Investor está activa! 💎</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Tu suscripción a Premium Investor está confirmada.<br>
          A partir de hoy formas parte de una comunidad exclusiva de inversores que buscan claridad, estrategia y crecimiento sostenible.<br><br>
          Con tu membresía tienes acceso a:<br><br>
          ● Comunidad privada de inversores BSB<br>
          ● Acceso completo a la formación avanzada (cursos temáticos + masterclass)<br>
          ● 20% de descuento en consultorías<br>
          ● 1 consultoría personalizada de 30 minutos incluida en tu plan anual<br><br>
          ✅ <a href="https://bsbcapital.io/comunidad" style="color:#C5A019; text-decoration:none;">Acceder a la comunidad</a><br>
          ✅ <a href="https://bsbcapital.io/consultoria" style="color:#C5A019; text-decoration:none;">Reservar consultoría</a><br><br>
          Explora, aprende y crece junto a nosotros.<br>
          El equipo de BSB Capital está contigo en cada paso.
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Tu membresía Premium Investor está confirmada.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`
      },
      wealth_membership: {
        subject: "Bienvenido a Wealth Membership — Tu gestión patrimonial personalizada ya está activa 🏛️",
        html: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wealth Membership Activo</title>
</head>
<body style="margin:0; padding:0; font-family:Arial, Helvetica, sans-serif; background-color:#f5f5f5;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px; background-color:#ffffff;">
    <tr>
      <td align="center" style="padding:40px 20px 20px;">
        <img
          src="${this.LOGO_URLS.default}"
          alt="BSB Capital"
          width="110"
          style="display:block; margin:auto;"
        />
      </td>
    </tr>

    <tr>
      <td align="center" style="padding:10px 30px;">
        <h2 style="color:#0b1f14; font-weight:600; margin:0;">¡Bienvenido a Wealth Membership! 🏛️</h2>
        <p style="font-size:16px; color:#37493f; line-height:1.6; margin-top:18px; margin-bottom:28px;">
          Hola [Nombre],<br><br>
          Gracias por confiar en BSB Capital para acompañarte en la gestión de tu patrimonio.<br>
          Tu membresía Wealth Membership ha sido activada con éxito.<br><br>
          A partir de ahora contarás con un acompañamiento exclusivo y continuo que incluye:<br><br>
          ● 6 consultorías personalizadas de 1h/año (valoradas en 1.800 €)<br>
          ● Revisión completa de cartera semestral<br>
          ● Plan estratégico anual con propuestas de optimización<br>
          ● Acceso a un canal privado prioritario y comunidad élite con análisis exclusivos y oportunidades de networking<br><br>
          Este plan está diseñado para ofrecerte claridad, continuidad y control sobre tu estrategia patrimonial, sin ceder la gestión.<br><br>
          ✅ <a href="https://bsbcapital.io/consultoria" style="color:#C5A019; text-decoration:none;">Reservar primera consultoría</a><br><br>
          Tu consultor asignado se pondrá en contacto contigo en las próximas 24 h para programar la primera sesión.<br><br>
          El equipo de BSB Capital
        </p>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      </td>
    </tr>
  </table>
</body>
</html>`
      }
    };
  }

  /**
   * Envía un email de bienvenida cuando un usuario se registra
   */
  async sendWelcomeEmail(userData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'welcome',
          to: userData.email,
          data: {
            name: userData.name || userData.full_name,
            email: userData.email
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía confirmación de preregistro para BSB Maker
   */
  async sendPreregistrationConfirmation(userData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'preregistration_confirmation',
          to: userData.email,
          data: {
            name: userData.name,
            email: userData.email
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending preregistration confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía confirmación de compra
   */
  async sendPurchaseConfirmation(purchaseData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'purchase_confirmation',
          to: purchaseData.email,
          data: {
            name: purchaseData.name,
            email: purchaseData.email,
            planName: purchaseData.planName,
            amount: purchaseData.amount,
            transactionId: purchaseData.transactionId
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending purchase confirmation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía notificación de suscripción activada
   */
  async sendSubscriptionActivated(subscriptionData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'subscription_activated',
          to: subscriptionData.email,
          data: {
            name: subscriptionData.name,
            email: subscriptionData.email,
            planName: subscriptionData.planName
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending subscription activation email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía email de formulario de contacto (a BSB Capital)
   */
  async sendContactForm(formData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'contact_form',
          to: 'info@bsbcapital.io', // Email interno de BSB Capital
          data: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending contact form email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía consulta de servicio (a BSB Capital)
   */
  async sendServiceInquiry(inquiryData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'service_inquiry',
          to: 'info@bsbcapital.io', // Email interno de BSB Capital
          data: {
            fullName: inquiryData.fullName,
            email: inquiryData.email,
            phone: inquiryData.phone,
            message: inquiryData.message
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending service inquiry email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía email personalizado
   */
  async sendCustomEmail(type, to, data) {
    try {
      const templates = this.getTemplates();
      const template = templates[type];

      if (!template) {
        throw new Error(`No se encontró una plantilla para el tipo: ${type}`);
      }

      const { data: result, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type,
          to,
          subject: template.subject,
          html: template.html.replace('[Nombre]', data.name),
          data
        })
      });

      if (error) throw error;
      return { success: true, data: result };
    } catch (error) {
      console.error(`Error sending ${type} email:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía confirmación de consulta
   */
  async sendConsultationConfirmation(data) {
    return this.sendCustomEmail('consultation_confirmation', data.email, data);
  }

  /**
   * Envía confirmación de consultoría financiera
   */
  async sendConsultationFinancial(data) {
    return this.sendCustomEmail('consultation_financial', data.email, data);
  }

  /**
   * Envía confirmación de consultoría crypto avanzada
   */
  async sendConsultationCryptoAdvanced(data) {
    return this.sendCustomEmail('consultation_crypto_advanced', data.email, data);
  }

  /**
   * Envía confirmación de onboarding crypto
   */
  async sendConsultationCryptoOnboarding(data) {
    return this.sendCustomEmail('onboarding_crypto', data.email, data);
  }

  /**
   * Envía confirmación de academia BSB
   */
  async sendAcademiaBSB(data) {
    return this.sendCustomEmail('academia_bsb', data.email, data);
  }

  /**
   * Envía confirmación de Trader Plan Pro
   */
  async sendTraderPlanPro(data) {
    return this.sendCustomEmail('trader_plan_pro', data.email, data);
  }

  /**
   * Envía confirmación de Premium Investor
   */
  async sendPremiumInvestor(data) {
    return this.sendCustomEmail('premium_investor', data.email, data);
  }

  /**
   * Envía confirmación de Wealth Membership
   */
  async sendWealthMembership(data) {
    return this.sendCustomEmail('wealth_membership', data.email, data);
  }

  /**
   * Envía notificación a administradores sobre nueva consultoría
   */
  async sendAdminConsultationNotification(consultationData) {
    try {
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'admin_consultation_notification',
          to: 'info@bsbcapital.io', // Email de administradores
          data: {
            clientName: consultationData.clientName || consultationData.name,
            clientEmail: consultationData.clientEmail || consultationData.email,
            clientPhone: consultationData.clientPhone || consultationData.phone,
            consultationType: consultationData.consultationType || consultationData.type,
            preferredDate: consultationData.preferredDate || consultationData.scheduledDate,
            preferredTime: consultationData.preferredTime || consultationData.scheduledTime,
            price: consultationData.price,
            consultationGoals: consultationData.consultationGoals || consultationData.goals,
            additionalInfo: consultationData.additionalInfo || consultationData.message,
            // 🔧 CAMPOS ADICIONALES que estaban faltando
            investmentExperience: consultationData.investmentExperience,
            portfolioSize: consultationData.portfolioSize,
            currentInvestments: consultationData.currentInvestments,
            specificQuestions: consultationData.specificQuestions,
            preferredCommunication: consultationData.preferredCommunication,
            // 📋 Datos completos del formulario
            clientResponses: consultationData.clientResponses,
            formDataJson: consultationData.formDataJson,
            timestamp: new Date().toISOString()
          }
        })
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error sending admin consultation notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Envía recordatorio de consulta
   */
  async sendConsultationReminder(data) {
    return this.sendCustomEmail('consultation_reminder', data.email, data);
  }

  /**
   * Envía seguimiento post-consulta
   */
  async sendConsultationCompleted(data) {
    return this.sendCustomEmail('consultation_completed', data.email, data);
  }

  /**
   * Verifica si el servicio de email está disponible
   */
  async healthCheck() {
    try {
      // Intenta enviar un email de prueba que no hará nada
      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: 'health_check',
          to: 'test@example.com',
          data: {}
        })
      });

      return { success: !error, available: !error };
    } catch (error) {
      console.error('Email service health check failed:', error);
      return { success: false, available: false, error: error.message };
    }
  }
}

// Instancia singleton
const emailService = new EmailService();

export default emailService;
export { emailService }; // También como named export para compatibilidad

// Exportar funciones individuales para uso directo
export const {
  sendWelcomeEmail,
  sendPreregistrationConfirmation,
  sendPurchaseConfirmation,
  sendSubscriptionActivated,
  sendContactForm,
  sendServiceInquiry,
  sendConsultationConfirmation,
  sendConsultationFinancial,
  sendConsultationCryptoAdvanced,
  sendConsultationCryptoOnboarding,
  sendAcademiaBSB,
  sendTraderPlanPro,
  sendPremiumInvestor,
  sendWealthMembership,
  sendAdminConsultationNotification,
  sendConsultationReminder,
  sendConsultationCompleted,
  sendCustomEmail,
  healthCheck
} = emailService;