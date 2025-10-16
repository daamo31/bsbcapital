// Servicio para envío de emails usando Supabase Edge Functions + Resend
import { supabase } from './customSupabaseClient';

class EmailService {
  constructor() {
    this.functionName = 'resend-email-secure'; // Solo usar la función segura
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
      const { data: result, error } = await supabase.functions.invoke(this.functionName, {
        body: JSON.stringify({
          type,
          to,
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
    return this.sendCustomEmail('consultation_crypto_onboarding', data.email, data);
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