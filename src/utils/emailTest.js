// Test directo de la nueva función de emails
import { supabase } from '@/lib/customSupabaseClient';

const testNewEmailFunction = async () => {
  try {
    console.log('🧪 Testing nueva función resend-emails...');

    const { data, error } = await supabase.functions.invoke('resend-emails', {
      body: {
        type: 'welcome',
        to: 'danieldelamo31@gmail.com',
        data: {
          name: 'Daniel',
          email: 'danieldelamo31@gmail.com',
        },
      },
    });

    if (error) {
      console.error('❌ Error:', error);
      return { success: false, error };
    }

    console.log('✅ Email enviado exitosamente:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { success: false, error: error.message };
  }
};

// Test de consultoría
const testConsultationEmail = async () => {
  try {
    console.log('🧪 Testing email de consultoría...');

    const { data, error } = await supabase.functions.invoke('resend-emails', {
      body: {
        type: 'consultation_confirmation',
        to: 'danieldelamo31@gmail.com',
        data: {
          name: 'Daniel',
          email: 'danieldelamo31@gmail.com',
          consultationType: 'Estrategia de Inversión',
          scheduledDate: '25 de octubre de 2024',
          scheduledTime: '15:00',
          duration: '60 minutos',
          consultationGoals: 'Optimizar mi cartera de inversiones',
        },
      },
    });

    if (error) {
      console.error('❌ Error:', error);
      return { success: false, error };
    }

    console.log('✅ Email de consultoría enviado:', data);
    return { success: true, data };
  } catch (error) {
    console.error('❌ Error en test:', error);
    return { success: false, error: error.message };
  }
};

// Ejecutar tests
window.testEmailBSB = testNewEmailFunction;
window.testConsultationBSB = testConsultationEmail;

if (import.meta.env.DEV) {
  console.log(`
🎯 Funciones de test disponibles:
- window.testEmailBSB() - Test email de bienvenida
- window.testConsultationBSB() - Test email de consultoría

Ejemplos:
testEmailBSB()
testConsultationBSB()
`);
}

export { testNewEmailFunction, testConsultationEmail };
