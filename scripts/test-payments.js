/**
 * 🧪 SCRIPT DE TESTING AUTOMATIZADO - PAGOS Y EMAILS
 * BSB Capital - Testing de flujos de pago y confirmaciones
 */

const testPaymentFlows = async () => {
  console.log('\n🎯 TESTING DE PAGOS - BSB CAPITAL');
  console.log('='.repeat(60));
  console.log('📅 Fecha:', new Date().toLocaleString('es-ES'));
  console.log('='.repeat(60));

  // Test 1: Consultoría
  console.log('\n\n📋 TEST 1: PAGO DE CONSULTORÍA');
  console.log('-'.repeat(60));
  console.log('✅ URL de testing: http://localhost:3000/consultoria');
  console.log('\n📝 Pasos a seguir:');
  console.log('1. Ve a http://localhost:3000/consultoria');
  console.log('2. Scroll hasta "Reserva tu consultoría"');
  console.log('3. Click en "Reservar ahora"');
  console.log('4. Completa el formulario:');
  console.log('   - Tipo: Estrategia de Inversión');
  console.log('   - Duración: **Prueba** (IMPORTANTE para testing)');
  console.log('   - Fecha: Cualquier fecha futura');
  console.log('   - Hora: Cualquier hora disponible');
  console.log('   - Nombre: Test User');
  console.log('   - Email: test@bsbcapital.io');
  console.log('5. Click "Proceder al pago"');
  console.log('\n💳 En Stripe Checkout:');
  console.log('   - Tarjeta: 4242 4242 4242 4242');
  console.log('   - Fecha: 12/25');
  console.log('   - CVC: 123');
  console.log('   - ZIP: 12345');
  console.log('   - Nombre: Test User');
  console.log('\n🔍 Verificaciones esperadas:');
  console.log('   ✓ Redirección a /consultation-post-payment?session_id=...');
  console.log('   ✓ Formulario post-pago aparece con datos pre-cargados');
  console.log('   ✓ Email al cliente (test@bsbcapital.io)');
  console.log('   ✓ Email al admin (info@bsbcapital.io)');
  console.log('   ✓ Webhook logs: checkout.session.completed');
  console.log('\n💾 Verificación en BD (Supabase):');
  console.log(`   SELECT * FROM consultations 
   WHERE client_email = 'test@bsbcapital.io'
   ORDER BY created_at DESC LIMIT 1;`);

  // Test 2: Membresía Mensual
  console.log('\n\n📋 TEST 2: SUSCRIPCIÓN MENSUAL');
  console.log('-'.repeat(60));
  console.log('✅ URL de testing: http://localhost:3000/membresias');
  console.log('\n📝 Pasos a seguir:');
  console.log('1. Ve a http://localhost:3000/membresias');
  console.log('2. Scroll hasta "Membresía BSB Capital"');
  console.log('3. Click en "Contratar Mensual" (€40/mes)');
  console.log('4. Login si no estás autenticado');
  console.log('5. Completa Stripe Checkout con tarjeta de prueba');
  console.log('\n💳 Datos de tarjeta:');
  console.log('   - Tarjeta: 4242 4242 4242 4242');
  console.log('   - Fecha: 12/25');
  console.log('   - CVC: 123');
  console.log('\n🔍 Verificaciones esperadas:');
  console.log('   ✓ Modo "subscription" (NO "payment")');
  console.log('   ✓ Pago exitoso de €40');
  console.log('   ✓ Webhook: customer.subscription.created');
  console.log('   ✓ Email de confirmación de membresía');
  console.log('   ✓ Registro en user_subscriptions con status=active');
  console.log('   ✓ stripe_customer_id asignado al usuario');
  console.log('\n💾 Verificación en BD:');
  console.log(`   SELECT us.*, u.email 
   FROM user_subscriptions us
   JOIN auth.users u ON u.id = us.user_id
   WHERE u.email = 'test@bsbcapital.io';`);

  // Test 3: Membresía Anual
  console.log('\n\n📋 TEST 3: PAGO ANUAL');
  console.log('-'.repeat(60));
  console.log('✅ URL de testing: http://localhost:3000/membresias');
  console.log('\n📝 Pasos a seguir:');
  console.log('1. Ve a http://localhost:3000/membresias');
  console.log('2. Click en "Contratar Anual" (€400/año)');
  console.log('3. Login si es necesario');
  console.log('4. Completa Stripe Checkout');
  console.log('\n🔍 Verificaciones esperadas:');
  console.log('   ✓ Modo "payment" (pago único, NO subscription)');
  console.log('   ✓ Pago de €400');
  console.log('   ✓ Webhook: checkout.session.completed');
  console.log('   ✓ Email de confirmación');
  console.log('   ✓ subscription_status = "active" en perfil');
  console.log('   ✓ Acceso a contenido premium');

  // Test 4: Paquete BSB
  console.log('\n\n📋 TEST 4: PAQUETE BSB (Onboarding Cripto)');
  console.log('-'.repeat(60));
  console.log('✅ URL de testing: http://localhost:3000/membresias');
  console.log('\n📝 Pasos a seguir:');
  console.log('1. Scroll hasta "Paquete BSB"');
  console.log('2. Click "Contratar ahora" (€390)');
  console.log('3. Completa checkout de Stripe');
  console.log('\n🔍 Verificaciones esperadas:');
  console.log('   ✓ Pago único de €390');
  console.log('   ✓ Email con detalles del paquete');
  console.log('   ✓ Acceso inmediato al contenido');

  // Comandos útiles
  console.log('\n\n🛠️ COMANDOS ÚTILES PARA DEBUGGING');
  console.log('='.repeat(60));
  console.log('\n📊 Ver logs de webhooks:');
  console.log('   supabase functions logs stripe-webhook --tail');
  console.log('\n📧 Ver logs de emails:');
  console.log('   supabase functions logs resend-email-secure --tail');
  console.log('\n🔍 Ver eventos en Stripe:');
  console.log('   https://dashboard.stripe.com/test/events');
  console.log('\n💾 Consultas útiles en Supabase:');
  console.log(`
   -- Ver usuarios recientes
   SELECT id, email, created_at, raw_user_meta_data 
   FROM auth.users 
   ORDER BY created_at DESC LIMIT 5;

   -- Ver suscripciones activas
   SELECT u.email, s.product_name, s.status, s.price, s.interval
   FROM user_subscriptions s
   JOIN auth.users u ON u.id = s.user_id
   WHERE s.status = 'active';

   -- Ver consultas recientes
   SELECT client_name, client_email, consultation_type, status, created_at
   FROM consultations
   ORDER BY created_at DESC LIMIT 10;

   -- Ver pagos recientes en Stripe
   SELECT stripe_session_id, amount, status, created_at
   FROM payments
   ORDER BY created_at DESC LIMIT 10;
  `);

  // Checklist de verificación
  console.log('\n\n✅ CHECKLIST DE VERIFICACIÓN');
  console.log('='.repeat(60));
  console.log(`
   PAGOS:
   [ ] Consultoría (modo test) - Checkout funciona
   [ ] Suscripción mensual - Checkout funciona
   [ ] Pago anual - Checkout funciona
   [ ] Paquete BSB - Checkout funciona
   [ ] Redirecciones post-pago correctas
   [ ] Stripe recibe todos los pagos

   WEBHOOKS:
   [ ] checkout.session.completed recibido
   [ ] customer.subscription.created recibido
   [ ] Datos guardados en user_subscriptions
   [ ] stripe_customer_id asignado correctamente
   [ ] Estados actualizados en BD

   EMAILS:
   [ ] Email cliente - Confirmación consultoría
   [ ] Email admin - Notificación consultoría
   [ ] Email cliente - Confirmación membresía
   [ ] Email admin - Notificación membresía
   [ ] Emails llegan a info@bsbcapital.io

   FORMULARIOS:
   [ ] Formulario post-pago se muestra
   [ ] Datos pre-cargados correctamente
   [ ] Envío de formulario funciona
   [ ] Datos guardados en BD

   BASE DE DATOS:
   [ ] Consultas registradas en "consultations"
   [ ] Suscripciones en "user_subscriptions"
   [ ] Perfiles actualizados
   [ ] RLS policies funcionan
  `);

  console.log('\n\n🎉 INICIO DE TESTING');
  console.log('='.repeat(60));
  console.log('Abre el navegador y sigue los pasos indicados.');
  console.log('Mantén esta ventana abierta para referencia.\n');
};

// Ejecutar tests
testPaymentFlows().catch(console.error);
