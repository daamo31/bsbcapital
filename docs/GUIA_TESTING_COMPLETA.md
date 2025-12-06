# 🧪 Guía Completa de Testing - BSB Capital

**Fecha:** 5 de diciembre de 2024
**Versión:** 2.0

Esta guía te permite probar **todo el sistema** end-to-end: pagos, emails, formularios, base de datos y área de cliente.

---

## 📋 Pre-requisitos

### 1. Iniciar Aplicación

```bash
npm run dev
# App corriendo en http://localhost:3000
```

### 2. Verificar Servicios Externos

- ✅ **Supabase:** Edge Functions desplegadas
- ✅ **Stripe:** Webhook configurado
- ✅ **Resend:** API Key configurada

### 3. Usuario de Prueba

- Email: `test@bsbcapital.io` (o crea uno nuevo en `/signup`)
- Contraseña: cualquiera para testing

---

## 🎯 Plan de Testing

### Test 1: Sistema de Autenticación 🔐

#### 1.1 Registro de Usuario

1. Ve a `/signup`
2. Registra nuevo usuario
3. **Verificar:**
   - ✅ Redirección automática tras registro
   - ✅ Usuario aparece en tabla `auth.users` (Supabase)
   - ✅ No tiene suscripciones inicialmente

```sql
-- Verificar en Supabase SQL Editor
SELECT id, email, created_at FROM auth.users
WHERE email = 'test@bsbcapital.io';
```

#### 1.2 Login

1. Ve a `/login`
2. Inicia sesión con credenciales
3. **Verificar:**
   - ✅ Redirección a home o área cliente
   - ✅ Botón "Mi Cuenta" visible en navbar
   - ✅ Token de sesión en localStorage

---

### Test 2: Área de Cliente 👤

#### 2.1 Navegación del Dashboard

1. Click en "Mi Cuenta" en navbar
2. Deberías ver `/area-cliente`
3. **Verificar 4 tabs:**
   - ✅ Mis Servicios
   - ✅ Suscripciones
   - ✅ Mi Perfil
   - ✅ Soporte

#### 2.2 Editar Perfil

1. Ve a tab "Mi Perfil"
2. Cambia tu nombre
3. Click "Guardar cambios"
4. **Verificar:**
   - ✅ Toast de confirmación
   - ✅ Nombre actualizado en header
   - ✅ Cambio reflejado en BD

```sql
-- Verificar cambio
SELECT id, raw_user_meta_data->>'full_name' as name
FROM auth.users
WHERE email = 'test@bsbcapital.io';
```

#### 2.3 Restablecer Contraseña

1. En tab "Mi Perfil"
2. Click "Restablecer contraseña"
3. **Verificar:**
   - ✅ Toast "Email enviado"
   - ✅ Email recibido con enlace de reset
   - ✅ Enlace funciona correctamente

#### 2.4 Contacto de Soporte

1. Ve a tab "Soporte"
2. **Verificar información:**
   - ✅ Email: `info@bsbcapital.io`
   - ✅ Horario: 9:00 - 21:00
   - ✅ FAQs visibles

---

### Test 3: Pagos con Stripe 💳

#### 3.1 Pago de Consultoría

**Objetivo:** Probar flujo completo de pago único

1. Ve a `/consultoria`
2. Click "Reserva tu consultoría"
3. Selecciona:
   - Tipo: Estrategia de Inversión
   - Duración: **Prueba** (para testing)
   - Fecha y hora futuras
4. Completa formulario:
   - Nombre: "Test User"
   - Email: tu email de prueba
5. Click "Proceder al pago"
6. En Stripe Checkout:
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: cualquier futura (ej: 12/25)
   - CVC: cualquier 3 dígitos (ej: 123)
   - ZIP: cualquiera (ej: 12345)

**Verificar:**

- ✅ Redirección a `/consultation-post-payment?session_id=...`
- ✅ Formulario completo aparece
- ✅ Datos pre-cargados (nombre, email)
- ✅ Webhook recibe evento `checkout.session.completed`
- ✅ **Email al cliente** con confirmación
- ✅ **Email al admin** (`info@bsbcapital.io`)

```bash
# Ver logs del webhook
supabase functions logs stripe-webhook --tail
```

```sql
-- Verificar pago en BD
SELECT * FROM consultations
WHERE client_email = 'test@bsbcapital.io'
ORDER BY created_at DESC LIMIT 1;
```

#### 3.2 Suscripción Mensual (Membresía)

**Objetivo:** Probar suscripción recurrente

1. Ve a `/membresias`
2. Scroll hasta "Membresía BSB Capital"
3. Click "Contratar Mensual" (40€/mes)
4. En Stripe Checkout:
   - Tarjeta: `4242 4242 4242 4242`
   - Completa datos

**Verificar:**

- ✅ Modo "subscription" (no "payment")
- ✅ Pago exitoso
- ✅ Webhook recibe `customer.subscription.created`
- ✅ Registro en `user_subscriptions` con `status = 'active'`
- ✅ Usuario tiene `stripe_customer_id`

```sql
-- Verificar suscripción
SELECT * FROM user_subscriptions
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'test@bsbcapital.io'
);
```

#### 3.3 Pago Anual (Pago único)

**Objetivo:** Probar pago único de plan anual

1. Ve a `/membresias`
2. Click "Contratar Anual" (400€)
3. Paga con tarjeta de prueba

**Verificar:**

- ✅ Modo "payment" (no "subscription")
- ✅ Pago único de 400€
- ✅ Email de confirmación
- ✅ `subscription_status = 'active'` en perfil

---

### Test 4: Gestión de Suscripciones ⚙️

#### 4.1 Ver Suscripciones Activas

1. Login con usuario que tiene suscripción mensual
2. Ve a `/area-cliente?tab=subscriptions`
3. **Verificar:**
   - ✅ Muestra suscripción activa
   - ✅ Precio correcto (€29/mes o €40/mes)
   - ✅ Próximo cobro visible
   - ✅ Badge "Activa"

#### 4.2 Cancelar Suscripción

1. En tab "Suscripciones"
2. Click "Abrir Portal de Gestión"
3. **Verificar:**
   - ✅ Redirección al portal de Stripe
   - ✅ Usuario puede cancelar
4. Cancela la suscripción en Stripe
5. Vuelve a `/area-cliente?tab=subscriptions`
6. **Verificar:**
   - ✅ Webhook recibe `customer.subscription.updated`
   - ✅ `cancel_at_period_end = true` en BD
   - ✅ Alerta "Se cancelará el [fecha]" visible

```bash
# Ver evento en logs
supabase functions logs stripe-webhook | grep subscription.updated
```

#### 4.3 Suscripción Cancelada Definitivamente

1. Después del período de pago (o simular con Stripe CLI)
2. **Verificar:**
   - ✅ Webhook recibe `customer.subscription.deleted`
   - ✅ `status = 'cancelled'` en BD
   - ✅ No aparece en tab "Suscripciones"
   - ✅ Muestra "No tienes suscripciones activas"

```sql
-- Verificar estado
SELECT status, cancel_at_period_end, current_period_end
FROM user_subscriptions
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@bsbcapital.io');
```

---

### Test 5: Formularios Post-Pago 📝

#### 5.1 Formulario de Consultoría

1. Completa pago de consultoría
2. En `/consultation-post-payment`:
   - Completa todos los campos obligatorios
   - Sube archivos si es necesario
3. Click "Enviar Información"

**Verificar:**

- ✅ Datos guardados en tabla `consultations`
- ✅ Estado cambia a "información_enviada"
- ✅ Email al admin con datos completos
- ✅ Redirección a página de confirmación

```sql
-- Ver consulta completada
SELECT status, client_name, created_at, updated_at
FROM consultations
WHERE stripe_session_id = 'cs_test_...' -- tu session ID
```

#### 5.2 Demo de Formularios

1. Ve a `/demo-formularios` (página de testing)
2. Selecciona cada tipo de formulario
3. Completa y envía
4. **Verificar:**
   - ✅ Preview correcto
   - ✅ Emails enviados (cliente + admin)
   - ✅ Tracking panel actualizado

---

### Test 6: Emails 📧

#### 6.1 Health Check de Servicio de Emails

```javascript
// En consola del navegador (F12)
const { data, error } = await supabase.functions.invoke('send-email', {
  body: { type: 'health' },
});
console.log('Email service:', data);
```

**Verificar:**

- ✅ `{ healthy: true, service: 'Resend Email Service' }`

#### 6.2 Email de Bienvenida (Test)

```javascript
const { data, error } = await supabase.functions.invoke('send-email', {
  body: {
    type: 'welcome',
    to: 'test@bsbcapital.io',
    data: { name: 'Test User' },
  },
});
console.log(data, error);
```

**Verificar:**

- ✅ Email recibido en bandeja
- ✅ Formato correcto
- ✅ Enlaces funcionan

#### 6.3 Email de Consultoría

Automático tras completar pago + formulario

**Verificar:**

- ✅ Email al cliente con detalles
- ✅ Email al admin con info completa
- ✅ Adjuntos incluidos si aplica

---

### Test 7: Conexión con Supabase 🗄️

#### 7.1 Lectura de Datos

```javascript
// En consola
const { data, error } = await supabase.from('user_subscriptions').select('*').limit(5);
console.log('Subscriptions:', data);
```

#### 7.2 Inserción de Datos

```javascript
const { data, error } = await supabase
  .from('support_test')
  .insert([{ message: 'Test message', user_id: 'your-user-id' }]);
console.log(data, error);
```

#### 7.3 Políticas RLS (Row Level Security)

```javascript
// Intentar leer suscripciones de otro usuario (debería fallar)
const { data, error } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', 'otro-user-id'); // ID diferente al tuyo
console.log('Should be empty or error:', data, error);
```

**Verificar:**

- ✅ Solo puedes ver tus propios datos
- ✅ RLS policies funcionando

---

## 🐛 Debugging

### Ver Logs de Edge Functions

```bash
# Webhook de Stripe
supabase functions logs stripe-webhook --tail

# Portal de suscripciones
supabase functions logs create-portal-session --tail

# Emails
supabase functions logs send-email --tail
```

### Ver Eventos en Stripe

1. Ve a: https://dashboard.stripe.com/test/events
2. Busca los últimos eventos
3. Click para ver detalles y webhook delivery

### Consultar Base de Datos

```sql
-- Usuarios recientes
SELECT id, email, created_at FROM auth.users
ORDER BY created_at DESC LIMIT 5;

-- Suscripciones activas
SELECT u.email, s.product_name, s.status, s.price
FROM user_subscriptions s
JOIN auth.users u ON u.id = s.user_id
WHERE s.status = 'active';

-- Consultas recientes
SELECT client_name, consultation_type, status, created_at
FROM consultations
ORDER BY created_at DESC LIMIT 10;
```

---

## ✅ Checklist Completo de Testing

### Autenticación

- [ ] Registro nuevo usuario
- [ ] Login con credenciales
- [ ] Logout
- [ ] Reset de contraseña

### Área de Cliente

- [ ] Navegar por 4 tabs
- [ ] Editar perfil (nombre)
- [ ] Restablecer contraseña por email
- [ ] Ver servicios disponibles
- [ ] Ver información de contacto

### Pagos

- [ ] Pago único (consultoría)
- [ ] Suscripción mensual
- [ ] Pago anual
- [ ] Redirección post-pago correcta
- [ ] Webhook recibe eventos

### Suscripciones

- [ ] Ver suscripciones activas
- [ ] Abrir portal de Stripe
- [ ] Cancelar suscripción
- [ ] Ver alerta de cancelación pendiente
- [ ] Confirmación de cancelación definitiva

### Formularios

- [ ] Formulario post-pago consultoría
- [ ] Demo de formularios
- [ ] Validación de campos
- [ ] Envío exitoso

### Emails

- [ ] Email de bienvenida
- [ ] Email de confirmación consultoría
- [ ] Email a admin
- [ ] Email de membresía

### Base de Datos

- [ ] Lectura de datos propios
- [ ] RLS policies funcionan
- [ ] Datos se guardan correctamente
- [ ] Estados actualizan correctamente

---

## 🎉 Resultado Esperado

Después de completar todos los tests, deberías tener:

✅ Sistema de pagos funcionando con Stripe
✅ Emails enviándose automáticamente
✅ Formularios guardando datos en Supabase
✅ Área de cliente completa y funcional
✅ Gestión de suscripciones operativa
✅ Webhooks actualizando base de datos
✅ RLS policies protegiendo datos

---

**Última actualización:** 5 de diciembre de 2024
**Mantenedor:** BSB Capital Dev Team
