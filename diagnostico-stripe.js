/* 
🔧 SCRIPT DE DIAGNÓSTICO STRIPE - BSB Capital
Ejecuta este código en la consola del navegador (F12) en tu sitio de producción
*/

async function diagnosticoStripe() {
  console.log('🔍 Iniciando diagnóstico de Stripe...');
  
  try {
    // 1. Verificar configuración del entorno
    console.log('📊 Verificando variables de entorno...');
    const diagnosticsResponse = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/stripe-diagnostics', {
      method: 'GET',
      headers: {
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxOTE3NDIsImV4cCI6MjA0Mjc2Nzc0Mn0.VeCKp0E5CgSKUdl-fGYmOwjEkN2CvmnWKLQbQeYjZ5M',
      }
    });
    
    const diagnostics = await diagnosticsResponse.json();
    console.log('📋 Diagnóstico de variables de entorno:', diagnostics);
    
    // 2. Verificar si STRIPE_SECRET_KEY está configurada
    if (!diagnostics.environment_variables.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY NO CONFIGURADA');
      console.log('🔧 Solución:');
      console.log('1. Ve a https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/settings/edge-functions');
      console.log('2. Agrega variable: STRIPE_SECRET_KEY = sk_live_... o sk_test_...');
      console.log('3. Guarda los cambios');
      return;
    } else {
      console.log('✅ STRIPE_SECRET_KEY configurada correctamente');
      console.log('🔑 Prefijo:', diagnostics.environment_variables.STRIPE_SECRET_KEY_prefix);
    }
    
    // 3. Test de creación de checkout (simulado)
    console.log('🧪 Probando creación de checkout...');
    const checkoutData = {
      priceId: 'price_test_123', // Price ID de prueba
      mode: 'payment',
      email: 'test@example.com',
      metadata: {
        client_name: 'Test User',
        client_email: 'test@example.com',
        consultation_type: 'general',
        scheduled_at: new Date().toISOString(),
        duration_minutes: '30',
        description: 'Test consultation'
      }
    };
    
    const checkoutResponse = await fetch('https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/create-stripe-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlldGt0YWx2enl5a3luaGRrcWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcxOTE3NDIsImV4cCI6MjA0Mjc2Nzc0Mn0.VeCKp0E5CgSKUdl-fGYmOwjEkN2CvmnWKLQbQeYjZ5M',
      },
      body: JSON.stringify(checkoutData)
    });
    
    const checkoutResult = await checkoutResponse.json();
    
    if (checkoutResponse.ok) {
      console.log('✅ Función de checkout funcionando correctamente');
      console.log('📝 Respuesta:', checkoutResult);
    } else {
      console.error('❌ Error en función de checkout:', checkoutResult);
      
      if (checkoutResult.error?.includes('STRIPE_SECRET_KEY not configured')) {
        console.log('🔧 La variable de entorno no está disponible aún');
        console.log('⏱️ Espera unos minutos y prueba de nuevo');
      } else if (checkoutResult.error?.includes('Invalid API key')) {
        console.log('🔧 La API key de Stripe no es válida');
        console.log('🔑 Verifica que sea sk_live_... o sk_test_...');
      } else if (checkoutResult.error?.includes('No such price')) {
        console.log('✅ Stripe está funcionando (el price ID de prueba no existe, pero la conexión es correcta)');
      }
    }
    
    console.log('🎯 Diagnóstico completado');
    
  } catch (error) {
    console.error('💥 Error durante el diagnóstico:', error);
  }
}

// Ejecutar diagnóstico
diagnosticoStripe();

console.log(`
📋 INSTRUCCIONES:
1. Si ves "STRIPE_SECRET_KEY NO CONFIGURADA", sigue las instrucciones mostradas
2. Si ves otros errores, copia el mensaje completo
3. Una vez configurado, espera 2-3 minutos y ejecuta diagnosticoStripe() de nuevo

🔗 Links útiles:
- Supabase Functions: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/functions
- Stripe Dashboard: https://dashboard.stripe.com/apikeys
`);