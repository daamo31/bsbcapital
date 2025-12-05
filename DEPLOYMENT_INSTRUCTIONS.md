# 🚀 Instrucciones de Despliegue - Sistema de Cancelación de Suscripciones

## 📋 Resumen de Cambios

Se ha configurado un sistema completo de gestión de suscripciones donde:

1. El usuario hace clic en "Abrir Portal de Gestión"
2. Se crea una sesión segura del portal de Stripe
3. El usuario cancela su suscripción en Stripe
4. El webhook actualiza automáticamente Supabase
5. La UI refleja el cambio automáticamente

---

## 🔧 Paso 1: Configurar Variables de Entorno en Supabase

Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/settings/edge-functions

Asegúrate de tener estas variables configuradas:

```bash
STRIPE_SECRET_KEY=sk_live_... (o sk_test_...)
STRIPE_WEBHOOK_SECRET=whsec_... (lo obtendrás del webhook en Stripe)
```

---

## 🚀 Paso 2: Desplegar Edge Functions

```bash
cd supabase

# Desplegar función de portal de Stripe
supabase functions deploy create-portal-session --no-verify-jwt

# Desplegar función de webhook (actualizada)
supabase functions deploy stripe-webhook
```

---

## 🎯 Paso 3: Verificar Webhook en Stripe

1. Ve a: https://dashboard.stripe.com/webhooks
2. Busca tu webhook "elegaant brillance"
3. Verifica que escucha estos eventos:
   - ✅ `checkout.session.completed`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated` ← IMPORTANTE
   - ✅ `customer.subscription.deleted` ← IMPORTANTE
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`

4. Si falta `customer.subscription.created`, agrégalo

---

## 🔐 Paso 4: Copiar Webhook Secret

1. En el webhook de Stripe, ve a la sección **"Signing secret"**
2. Click en "Reveal" o "Click to reveal"
3. Copia el valor que empieza con `whsec_...`
4. Ve a Supabase Edge Functions settings
5. Agrega/actualiza la variable:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

---

## 📊 Paso 5: Verificar Estructura de Base de Datos

Asegúrate de que la tabla `user_subscriptions` tenga estas columnas:

```sql
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  product_name TEXT,
  description TEXT,
  price NUMERIC,
  interval TEXT, -- 'month' o 'year'
  status TEXT, -- 'active', 'cancelled', 'past_due', 'trialing'
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

Si no existe, créala ejecutando esto en SQL Editor de Supabase.

---

## 🧪 Paso 6: Probar el Flujo Completo

### Prueba 1: Crear Portal Session

```javascript
// En consola del navegador (F12)
const { data, error } = await supabase.functions.invoke('create-portal-session', {
  body: {
    customerId: 'cus_XXXXXXXX', // Un customer ID real
    returnUrl: window.location.origin + '/area-cliente?tab=subscriptions',
  },
});
console.log('Portal URL:', data, error);
```

### Prueba 2: Verificar Usuario tiene stripe_customer_id

```sql
-- En SQL Editor de Supabase
SELECT id, email, stripe_customer_id
FROM auth.users
WHERE email = 'tu-email@ejemplo.com';
```

Si no tiene `stripe_customer_id`, necesitas actualizarlo cuando creen una suscripción.

### Prueba 3: Probar Webhook

1. En Stripe Dashboard → Webhooks → Tu webhook
2. Click en "Send test webhook"
3. Selecciona `customer.subscription.deleted`
4. Envía el evento
5. Verifica en logs de Supabase Edge Functions que se recibió

---

## ✅ Flujo Completo Funcionando

### Cuando el usuario cancela:

1. **Usuario hace clic** en "Abrir Portal de Gestión"

   ```
   → Llama a create-portal-session Edge Function
   → Recibe URL del portal de Stripe
   → Se redirige al portal
   ```

2. **Usuario cancela en Stripe**

   ```
   → Stripe marca cancel_at_period_end = true
   → Envía evento customer.subscription.updated
   → Webhook actualiza user_subscriptions
   ```

3. **Al final del período**

   ```
   → Stripe cancela definitivamente
   → Envía evento customer.subscription.deleted
   → Webhook actualiza status = 'cancelled'
   ```

4. **Usuario vuelve a /area-cliente**
   ```
   → No ve suscripciones (solo muestra status = 'active')
   → Ve mensaje "No tienes suscripciones activas"
   ```

---

## 🐛 Debugging

### Ver logs de Edge Functions

```bash
supabase functions logs create-portal-session
supabase functions logs stripe-webhook
```

### Ver eventos recibidos en Stripe

Dashboard → Webhooks → Tu webhook → Events tab

### Consultar suscripciones en BD

```sql
SELECT * FROM user_subscriptions
WHERE user_id = 'user-id-aqui'
ORDER BY created_at DESC;
```

---

## 📝 Checklist Final

- [ ] Variables de entorno configuradas en Supabase
- [ ] `create-portal-session` desplegada
- [ ] `stripe-webhook` desplegada (actualizada)
- [ ] Webhook en Stripe escucha `customer.subscription.updated`
- [ ] Webhook en Stripe escucha `customer.subscription.deleted`
- [ ] `STRIPE_WEBHOOK_SECRET` configurado en Supabase
- [ ] Tabla `user_subscriptions` existe con columnas correctas
- [ ] Usuarios tienen `stripe_customer_id` en su perfil
- [ ] Probado flujo completo de cancelación

---

## 🎉 Una vez completado

El sistema funcionará automáticamente:

- ✅ Usuarios pueden cancelar desde su área de cliente
- ✅ Cambios se reflejan automáticamente en Supabase
- ✅ UI se actualiza sin intervención manual
- ✅ No necesitas gestionar cancelaciones manualmente

---

**Última actualización:** 5 de diciembre de 2024
**Versión:** 1.0
