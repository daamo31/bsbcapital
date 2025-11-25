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

  // Método para construir templates HTML consistentes
  buildEmailTemplate(content, title = '') {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'BSB Capital'}</title>
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
      <td style="padding:20px 30px 40px;">
        <div style="font-size:16px; color:#37493f; line-height:1.6;">
          ${content}
        </div>
      </td>
    </tr>

    <tr>
      <td style="padding-top:20px; border-bottom:1px solid #e6ece8;"></td>
    </tr>

    <tr>
      <td align="center" style="padding:25px 20px 35px 20px; font-size:12px; color:#6a756f; line-height:1.6;">
        <p style="margin:0;">© BSB Capital · <a href="mailto:info@bsbcapital.io" style="color:#C5A019; text-decoration:none;">info@bsbcapital.io</a></p>
        <p style="margin:5px 0 0 0;">Este es un correo automático de confirmación.</p>
        <p style="margin:0;">No respondas a este mensaje.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;
  }

  // Plantillas de correos personalizados actualizados
  getTemplates() {
    return {
      // 1.1. Consultoría Optimización de Cartera
      consultation_portfolio_optimization: {
        subject: "Tu consultoría de Optimización de cartera en BSB Capital está confirmada 🗓",
        html: this.buildEmailTemplate(`
          <p>Tu consultoría personalizada ha sido confirmada con éxito.</p>
          <p>En esta sesión trabajaremos contigo para analizar tu situación financiera y diseñar una estrategia clara, realista y adaptada a tus objetivos.</p>
          
          <p><strong>Durante la reunión:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Revisaremos tu situación actual y tus prioridades.</li>
            <li>Estableceremos una hoja de ruta personalizada.</li>
            <li>Recibirás un resumen detallado con las conclusiones y próximos pasos.</li>
          </ul>
          
          <p>📅 El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital y permitirnos acompañarte en tu crecimiento financiero.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        `)
      },

      // 1.2. Consultoría Crypto & Web3
      consultation_crypto_web3: {
        subject: "Tu consultoría de Crypto & Web3 ha sido confirmada 🗓",
        html: this.buildEmailTemplate(`
          <p>Tu consultoría estratégica de Crypto & Web3 con BSB Capital está confirmada.</p>
          
          <p>Durante la sesión, trabajaremos contigo para analizar tu exposición actual al ecosistema crypto, revisar tus estrategias y definir un plan de acción claro y alineado con tus objetivos.</p>
          
          <p>Ya sea para optimizar tu cartera, integrar activos digitales o entender nuevas oportunidades de inversión, recibirás una visión técnica y profesional.</p>
          
          <p>El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por apostar por el futuro de la inversión.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        `)
      },

      // 1.3. Consultoría Onboarding Crypto
      consultation_crypto_onboarding: {
        subject: "Tu consultoría de Crypto & Web3 ha sido confirmada 🗓",
        html: this.buildEmailTemplate(`
          <p>Tu consultoría de Onboarding Crypto está confirmada.</p>
          
          <p>Esta sesión está diseñada para ayudarte a dar tus primeros pasos en el ecosistema cripto de forma clara y segura. Te explicaremos lo esencial, resolveremos tus dudas y te guiaremos para que puedas comenzar con una estrategia básica pero bien estructurada.</p>
          
          <p>No necesitas experiencia previa: estaremos contigo para que empieces con confianza, claridad y una base bien estructurada.</p>
          
          <p>El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io.</p>
          
          <p>Gracias por confiar en BSB Capital para iniciar tu camino en el mundo crypto.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        `)
      },

      // 1.4. Consultoría Gestión de Tesorería Crypto para Empresas
      consultation_treasury_crypto: {
        subject: "Tu consultoría de Gestión de Tesorería Crypto para empresas ha sido confirmada 🗓",
        html: this.buildEmailTemplate(`
          <p>Tu consultoría en Gestión de Tesorería Crypto para empresas ha sido confirmada.</p>
          
          <p>Esta consultoría está diseñada para ayudarte a comprender cómo integrar, ordenar o estructurar la exposición a activos digitales dentro de la tesorería corporativa. Nuestro objetivo es que puedas tomar decisiones con una visión profesional y alineada con la estrategia de la compañía.</p>
          
          <p><strong>Durante la sesión:</strong></p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Obtendrás una visión general del marco estratégico para gestionar activos digitales en una empresa.</li>
            <li>Te guiaremos en cómo establecer una estructura de tesorería coherente con vuestro perfil de riesgo, liquidez y necesidades operativas.</li>
            <li>Resolveremos dudas y marcaremos los primeros pasos para avanzar con seguridad y criterio.</li>
          </ul>
          
          <p>El mismo día de la consulta recibirás el enlace de acceso a la reunión a través de Google Meet.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        `)
      },

      // 2.1. Academia BSB
      academia_bsb: {
        subject: "Tu acceso a la BSB Academy está activo 🎓",
        html: this.buildEmailTemplate(`
          <p>¡Bienvenido a la Academia de BSB Capital!</p>
          
          <p>Tu inscripción se ha completado con éxito.</p>
          
          <p>A partir de ahora tendrás acceso a:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Píldoras formativas para dominar los fundamentos.</li>
            <li>Masterclass exclusivas con estrategias y análisis avanzados.</li>
            <li>Recursos descargables y materiales de apoyo.</li>
            <li>Actualizaciones constantes que te permiten estar al día.</li>
          </ul>
          
          <p>En los próximos días recibirás un correo con tus credenciales y una guía para sacar el máximo partido a tu formación.</p>
          
          <p>Gracias por apostar por tu educación financiera.</p>
          <p><strong>El equipo de BSB Capital</strong></p>
        `)
      },

      // 3.1. Paquete Onboarding Crypto
      package_crypto_onboarding: {
        subject: "Tu paquete Onboarding Crypto con BSB Capital está confirmado 🚀",
        html: this.buildEmailTemplate(`
          <p><strong>Enhorabuena,</strong></p>
          
          <p>Has tomado una decisión que marca la diferencia: en lugar de improvisar con tu dinero has elegido empezar por el principio, con orden, criterio y acompañamiento profesional.</p>
          
          <p>Mientras la mayoría entra en el mundo crypto atraído por las rentabilidades rápidas y la inmediatez de la inversión, tú has elegido invertir en construir una base sólida para que esas rentabilidades lleguen con conocimiento y seguridad.</p>
          
          <p>Y sí: eso te coloca un paso por delante del mercado.</p>
          
          <p>Tu onboarding crypto con BSB Capital está confirmado y, a partir de hoy, empezamos a trabajar contigo para que:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Tengas una visión clara y estructurada del ecosistema crypto.</li>
            <li>Evites errores habituales de quien entra sin marco ni estrategia.</li>
            <li>Puedas tomar decisiones alineadas con tus objetivos.</li>
          </ul>
          
          <p>En breves recibirás instrucciones detalladas sobre cómo acceder a cada uno de los servicios incluidos en tu paquete.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO BSB Capital</p>
        `)
      },

      // 3.2. Paquete Gestión Tesorería Crypto para Empresas
      package_treasury_crypto: {
        subject: "Tu paquete Gestión de Tesorería Crypto para empresas está confirmado 🚀",
        html: this.buildEmailTemplate(`
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Te confirmamos la contratación del paquete Gestión de Tesorería Crypto para empresas.</p>
          
          <p>La incorporación de activos digitales a la tesorería corporativa sigue siendo poco habitual en la mayoría de compañías. Dar este paso, o decidir ordenar una exposición que ya existe, supone avanzar hacia una gestión más profesional, estructurada y alineada con la realidad del mercado.</p>
          
          <p>A partir de ahora, nuestro trabajo se centrará en:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Obtener una visión clara y consolidada de vuestra posición en activos digitales.</li>
            <li>Definir una estructura de tesorería cripto coherente con vuestro perfil de riesgo, necesidades de liquidez y estrategia corporativa.</li>
            <li>Establecer un marco de seguimiento y control que facilite la toma de decisiones y la comunicación con dirección, socios, asesores y departamento financiero.</li>
          </ul>
          
          <p>En breves recibirás instrucciones detalladas sobre cómo acceder a cada uno de los servicios incluidos en tu paquete.</p>
          
          <p>Si tienes cualquier duda relacionada con el servicio o los próximos pasos, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        `)
      },

      // 3.3. Paquete Investor Premium
      package_investor_premium: {
        subject: "Tu paquete Inversor Premium de BSB Capital está confirmado 🚀",
        html: this.buildEmailTemplate(`
          <p>Gracias por confiar en BSB Capital y enhorabuena por la decisión que acabas de tomar.</p>
          
          <p>Tu acceso a Inversor Premium está oficialmente confirmado. Con este paso, te conviertes en una absoluta prioridad dentro de BSB capital y abres una nueva etapa en la forma de gestionar tu patrimonio.</p>
          
          <p>Te acompañaré personalmente, combinando mi experiencia de más de 8 años en mercados y activos digitales con un enfoque estratégico y personalizado. Cada recomendación y decisión estará diseñada para maximizar oportunidades y minimizar riesgos, con la discreción y profesionalidad que tu patrimonio merece.</p>
          
          <p>Con Inversor Premium, nuestro trabajo contigo se centrará en:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>Comprender tu punto de partida, tu perfil y tus objetivos.</li>
            <li>Acompañarte en la definición de una estrategia de inversión estructurada y alineada con tu situación real.</li>
            <li>Poner a tu disposición nuestra experiencia y marco de análisis para ayudarte a tomar decisiones mejor informadas.</li>
          </ul>
          
          <p>En breves recibirás instrucciones detalladas sobre cómo acceder a cada uno de los servicios incluidos en tu paquete.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias de nuevo por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        `)
      },

      // 4.1. Membresía Anual BSB Capital
      membership_annual: {
        subject: "Tu Membresía Anual BSB Capital ya está activa ✅",
        html: this.buildEmailTemplate(`
          <p>Gracias por unirte a la Membresía Anual de BSB Capital. Tu acceso está activado.</p>
          
          <p>Con esta decisión, te conviertes en parte del grupo pionero que está construyendo BSB Capital desde el inicio. No es solo una suscripción: te conviertes en una de las piezas clave sobre las que queremos seguir desarrollando nuestro proyecto de formación e inversión en crypto y activos digitales.</p>
          
          <p>A partir de ahora tendrás acceso a:</p>
          <ul style="margin: 16px 0; padding-left: 20px;">
            <li>BSB Academy, nuestro entorno formativo especializado en el nuevo sistema financiero.</li>
            <li>20% de descuento en BSB Consulting, para nuestros servicios de análisis, planificación y acompañamiento financiero.</li>
            <li>Acceso prioritario a BSB maker, nuestra herramienta de IA que cambiará las reglas del juego de la inversión.</li>
            <li>Información prioritaria sobre eventos y encuentros exclusivos.</li>
          </ul>
          
          <p>En breve recibirás más información con los próximos pasos para empezar a aprovechar tu membresía al máximo.</p>
          
          <p>Si tienes cualquier duda, puedes contactar con nosotros en info@bsbcapital.io</p>
          
          <p>Gracias por confiar en BSB Capital.</p>
          
          <p>Un saludo,</p>
          <p><strong>Juan Salgado</strong><br>CEO de BSB Capital</p>
        `)
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
   * Envía confirmación de consultoría optimización de cartera
   */
  async sendConsultationPortfolioOptimization(data) {
    return this.sendCustomEmail('consultation_portfolio_optimization', data.email, data);
  }

  /**
   * Envía confirmación de consultoría crypto & web3
   */
  async sendConsultationCryptoWeb3(data) {
    return this.sendCustomEmail('consultation_crypto_web3', data.email, data);
  }

  /**
   * Envía confirmación de consultoría onboarding crypto
   */
  async sendConsultationCryptoOnboarding(data) {
    return this.sendCustomEmail('consultation_crypto_onboarding', data.email, data);
  }

  /**
   * Envía confirmación de consultoría gestión de tesorería crypto
   */
  async sendConsultationTreasuryCrypto(data) {
    return this.sendCustomEmail('consultation_treasury_crypto', data.email, data);
  }

  /**
   * Envía confirmación de academia BSB
   */
  async sendAcademiaBSB(data) {
    return this.sendCustomEmail('academia_bsb', data.email, data);
  }

  /**
   * Envía confirmación de paquete onboarding crypto
   */
  async sendPackageCryptoOnboarding(data) {
    return this.sendCustomEmail('package_crypto_onboarding', data.email, data);
  }

  /**
   * Envía confirmación de paquete gestión tesorería crypto
   */
  async sendPackageTreasuryCrypto(data) {
    return this.sendCustomEmail('package_treasury_crypto', data.email, data);
  }

  /**
   * Envía confirmación de paquete investor premium
   */
  async sendPackageInvestorPremium(data) {
    return this.sendCustomEmail('package_investor_premium', data.email, data);
  }

  /**
   * Envía confirmación de membresía anual
   */
  async sendMembershipAnnual(data) {
    return this.sendCustomEmail('membership_annual', data.email, data);
  }

  /**
   * Envía notificación a administradores sobre nueva consultoría
   */
  async sendAdminConsultationNotification(consultationData) {
    try {
      // 🎯 Determinar el tipo de template específico según el tipo de consultoría
      const consultationType = consultationData.consultationType || consultationData.type;
      let emailType = 'admin_consultation_notification'; // fallback genérico
      
      // Mapear tipos de consultoría a templates específicos
      const consultationTypeMap = {
        'financial_planning': 'admin_consultation_financial_planning',
        'onboarding_crypto': 'admin_consultation_onboarding_crypto', 
        'crypto_advanced': 'admin_consultation_crypto_advanced',
        'Optimización de cartera': 'admin_consultation_financial_planning',
        'Onboarding cripto': 'admin_consultation_onboarding_crypto',
        'Gestión de tesorería cripto para empresas': 'admin_consultation_crypto_advanced'
      };
      
      if (consultationTypeMap[consultationType]) {
        emailType = consultationTypeMap[consultationType];
        console.log(`📧 Usando template específico: ${emailType} para tipo: ${consultationType}`);
      } else {
        console.log(`📧 Usando template genérico para tipo desconocido: ${consultationType}`);
      }

      const { data, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type: emailType, // Usar el tipo específico determinado
          to: 'info@bsbcapital.io', // Email de administradores
          data: {
            clientName: consultationData.clientName || consultationData.name,
            clientEmail: consultationData.clientEmail || consultationData.email,
            phone: consultationData.phone || consultationData.clientPhone,
            consultationType: consultationData.consultationType || consultationData.type,
            preferredDate: consultationData.preferredDate || consultationData.scheduledDate,
            preferredTime: consultationData.preferredTime || consultationData.scheduledTime,
            duration: consultationData.duration,
            price: consultationData.price,
            paymentId: consultationData.paymentId,
            consultationId: consultationData.consultationId,
            consultationGoals: consultationData.consultationGoals || consultationData.goals,
            additionalInfo: consultationData.additionalInfo || consultationData.message,
            // 🔧 CAMPOS ADICIONALES específicos por tipo
            investmentExperience: consultationData.investmentExperience,
            portfolioSize: consultationData.portfolioSize,
            currentInvestments: consultationData.currentInvestments,
            specificQuestions: consultationData.specificQuestions,
            preferredCommunication: consultationData.preferredCommunication,
            riskTolerance: consultationData.riskTolerance,
            // 📋 Datos completos del formulario
            clientResponses: consultationData.clientResponses,
            formDataJson: consultationData.formDataJson,
            timestamp: consultationData.timestamp || new Date().toISOString()
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
  sendConsultationPortfolioOptimization,
  sendConsultationCryptoWeb3,
  sendConsultationCryptoOnboarding,
  sendConsultationTreasuryCrypto,
  sendAcademiaBSB,
  sendPackageCryptoOnboarding,
  sendPackageTreasuryCrypto,
  sendPackageInvestorPremium,
  sendMembershipAnnual,
  sendAdminConsultationNotification,
  sendCustomEmail,
  healthCheck
} = emailService;