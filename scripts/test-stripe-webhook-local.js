/**
 * 🧪 Test de Webhook de Stripe - Simulación Local
 *
 * Este script simula un evento de webhook de Stripe para verificar que:
 * 1. La función resend-email-secure responde correctamente
 * 2. Los datos se envían en el formato esperado
 *
 * Ejecutar con: node test-stripe-webhook-local.js
 */

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://ietktalvzyykynhdkqhv.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

// Simular diferentes tipos de eventos
const testCases = [
  {
    name: 'Consultoría Crypto Web3',
    payload: {
      type: 'consultation_crypto_web3',
      to: 'test@ejemplo.com', // Cambiar por un email real para prueba
      data: {
        name: 'Usuario de Prueba',
        email: 'test@ejemplo.com',
        consultationType: 'Crypto & Web3',
        date: '2024-12-10',
        time: '10:00',
        duration: 60,
        amount: 300,
        currency: 'eur',
      },
    },
  },
  {
    name: 'Paquete Onboarding Crypto',
    payload: {
      type: 'package_crypto_onboarding',
      to: 'test@ejemplo.com',
      data: {
        name: 'Usuario de Prueba',
        email: 'test@ejemplo.com',
        packageName: 'Onboarding Cripto',
        amount: 390,
        currency: 'eur',
      },
    },
  },
  {
    name: 'Membresía Anual',
    payload: {
      type: 'membership_annual',
      to: 'test@ejemplo.com',
      data: {
        name: 'Usuario de Prueba',
        email: 'test@ejemplo.com',
        planName: 'Membresía Anual BSB Capital',
        amount: 400,
        currency: 'eur',
      },
    },
  },
  {
    name: 'Notificación Admin',
    payload: {
      type: 'admin_consultation_notification',
      to: 'info@bsbcapital.io',
      data: {
        clientName: 'Cliente de Prueba',
        clientEmail: 'cliente@ejemplo.com',
        consultationType: 'Optimización de cartera',
        date: '2024-12-10',
        time: '10:00',
        amount: 300,
      },
    },
  },
];

async function testEmailEndpoint(testCase) {
  console.log(`\n🧪 Probando: ${testCase.name}`);
  console.log('-'.repeat(50));
  console.log('📤 Enviando payload:');
  console.log(JSON.stringify(testCase.payload, null, 2));

  try {
    const response = await fetch(`${SUPABASE_URL}/functions/v1/resend-email-secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(testCase.payload),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }

    if (response.ok) {
      console.log('✅ Respuesta exitosa:');
      console.log(JSON.stringify(responseData, null, 2));
      return { success: true, name: testCase.name, response: responseData };
    } else {
      console.log('❌ Error en la respuesta:');
      console.log(`   Status: ${response.status}`);
      console.log(`   Response: ${JSON.stringify(responseData, null, 2)}`);
      return { success: false, name: testCase.name, error: responseData };
    }
  } catch (error) {
    console.log('❌ Error de conexión:');
    console.log(`   ${error.message}`);
    return { success: false, name: testCase.name, error: error.message };
  }
}

async function runAllTests() {
  console.log('🚀 PRUEBAS DE INTEGRACIÓN - EMAILS BSB CAPITAL');
  console.log('='.repeat(60));
  console.log(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log('='.repeat(60));

  if (!SUPABASE_ANON_KEY) {
    console.log('\n⚠️  ATENCIÓN: No se encontró SUPABASE_ANON_KEY');
    console.log('   Ejecuta el script con:');
    console.log('   SUPABASE_ANON_KEY=tu_clave node test-stripe-webhook-local.js');
    console.log('\n   O configura la variable de entorno primero.');
    return;
  }

  const results = [];

  // Solo probar el health check primero
  console.log('\n📋 Probando conexión con health check...');

  try {
    const healthResponse = await fetch(`${SUPABASE_URL}/functions/v1/resend-email-secure`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ type: 'health_check' }),
    });

    if (healthResponse.ok) {
      console.log('✅ Conexión exitosa con resend-email-secure');
    } else {
      console.log('⚠️  Health check devolvió error (puede ser normal si no existe el tipo)');
    }
  } catch (error) {
    console.log('❌ No se pudo conectar:', error.message);
    return;
  }

  // Ejecutar todas las pruebas
  for (const testCase of testCases) {
    const result = await testEmailEndpoint(testCase);
    results.push(result);
  }

  // Resumen
  console.log('\n');
  console.log('='.repeat(60));
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log('='.repeat(60));

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  results.forEach((result) => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.name}`);
  });

  console.log('-'.repeat(60));
  console.log(`Total: ${passed} pasaron, ${failed} fallaron de ${results.length} pruebas`);

  if (failed === 0) {
    console.log('\n🎉 ¡Todas las pruebas pasaron! El endpoint de email funciona correctamente.');
  } else {
    console.log('\n⚠️  Algunas pruebas fallaron. Revisa los errores arriba.');
  }
}

// Ejecutar
runAllTests().catch(console.error);
