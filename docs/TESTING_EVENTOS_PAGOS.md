# 🧪 Guía de Testing de Eventos y Pagos

Esta guía explica cómo probar todos los flujos de compra y verificar que los correos se envían correctamente.

---

## 📋 Pre-requisitos

1. **Iniciar la app en local**: `npm run dev`
2. **Tener un usuario de prueba logueado**
3. **Abrir la consola del navegador** (F12) para ver logs
4. **Abrir Stripe Dashboard** en otra pestaña: https://dashboard.stripe.com

---

## 🧪 Test 1: Consultoría (flujo de test)

**Ruta**: `/consultoria`

### Pasos:

1. Ve a `/consultoria`
2. Click "Reserva tu consultoría crypto ahora"
3. Selecciona cualquier tema
4. **Selecciona "Prueba" como duración** (esto usa el Price ID de test)
5. Selecciona fecha y hora
6. Completa nombre y email
7. Click "Proceder al pago"
8. En Stripe Checkout usa: `4242 4242 4242 4242`

### Verificar:

- [ ] Redirección a Stripe Checkout ✓
- [ ] Pago exitoso con tarjeta de prueba
- [ ] Redirección a página de gracias
- [ ] Email al cliente (confirmación consultoría)
- [ ] Email al admin (info@bsbcapital.io)

### Ver logs:

```bash
# En Supabase
supabase functions logs stripe-webhook
```

---

## 🧪 Test 2: Paquete BSB (Onboarding Cripto)

**Ruta**: `/membresias`

### Pasos:

1. Ve a `/membresias`
2. Scroll hasta los paquetes BSB
3. Click "Elegir paquete" en Onboarding Cripto (390€)
4. En Stripe Checkout usa: `4242 4242 4242 4242`

### Verificar:

- [ ] Redirección a Stripe Checkout ✓
- [ ] Modo "payment" (pago único)
- [ ] Pago exitoso
- [ ] Email de confirmación de paquete
- [ ] Registro en `user_subscriptions`

---

## 🧪 Test 3: Membresía Exclusiva Anual

**Ruta**: `/membresias` o `/checkout?plan=annual`

### Pasos:

1. Ve a `/membresias`
2. Scroll hasta "Membresía BSB Capital"
3. Click "Contratar Anual" (400€)
4. En Stripe Checkout usa: `4242 4242 4242 4242`

### Verificar:

- [ ] Modo "payment" (pago único anual)
- [ ] Pago exitoso
- [ ] Email `membership_annual`
- [ ] Perfil actualizado con `subscription_status: active`

---

## 🧪 Test 4: Membresía Exclusiva Mensual

**Ruta**: `/checkout?plan=monthly`

### Pasos:

1. Ve a `/membresias`
2. Click "Contratar Mensual" (40€/mes)
3. En Stripe Checkout usa: `4242 4242 4242 4242`

### Verificar:

- [ ] Modo "subscription" (recurrente)
- [ ] Suscripción creada en Stripe
- [ ] Email de confirmación
- [ ] Registro en `user_subscriptions` con `stripe_subscription_id`

---

## 🧪 Test 5: Academia BSB

**Ruta**: `/academia/catalogo`

### Pasos:

1. Ve a `/academia/catalogo`
2. Click "Suscribirme" (29€/mes o 290€/año)
3. En Stripe Checkout usa: `4242 4242 4242 4242`

### Verificar:

- [ ] Email tipo `academia_bsb`
- [ ] Acceso a la academia activado

---

## 📧 Tipos de Email que se Envían

| Evento             | Tipo de Email                     | Destinatario       |
| ------------------ | --------------------------------- | ------------------ |
| Consultoría        | `consultation_confirmation`       | Cliente            |
| Consultoría        | `admin_consultation_notification` | info@bsbcapital.io |
| Paquete Onboarding | `package_crypto_onboarding`       | Cliente            |
| Paquete Premium    | `package_investor_premium`        | Cliente            |
| Paquete Tesorería  | `package_treasury_crypto`         | Cliente            |
| Membresía Anual    | `membership_annual`               | Cliente            |
| Academia           | `academia_bsb`                    | Cliente            |

---

## 🔍 Dónde Ver los Logs

### 1. Consola del navegador

```javascript
// Busca estos logs en la consola
🔍 DEBUGGING CONSULTORIA CHECKOUT
📤 Sending to create-stripe-checkout
📥 Response from create-stripe-checkout
```

### 2. Supabase Edge Functions

```bash
# Ver logs del webhook
supabase functions logs stripe-webhook

# Ver logs del email
supabase functions logs resend-email-secure
```

### 3. Stripe Dashboard

- **Webhooks**: https://dashboard.stripe.com/webhooks
- **Eventos recientes**: Ver "Events" en cada webhook
- **Logs de intentos**: Click en un evento para ver request/response

---

## 🃏 Tarjetas de Prueba de Stripe

| Número                | Resultado               |
| --------------------- | ----------------------- |
| `4242 4242 4242 4242` | ✅ Pago exitoso         |
| `4000 0000 0000 0002` | ❌ Tarjeta rechazada    |
| `4000 0000 0000 9995` | ❌ Fondos insuficientes |
| `4000 0000 0000 3220` | 🔐 Requiere 3D Secure   |

> **Tip**: CVC cualquier número de 3 dígitos, fecha cualquier fecha futura.

---

## ✅ Checklist de Verificación Completa

### Base de datos (Supabase)

- [ ] `user_subscriptions` - Nuevo registro creado
- [ ] `profiles` - `subscription_status` actualizado
- [ ] `consultations` - Consultoría confirmada (si aplica)
- [ ] `webhook_logs` - Evento registrado

### Emails (Resend Dashboard)

- [ ] Email enviado al cliente
- [ ] Email enviado al admin (si aplica)
- [ ] Sin errores en el envío

### Stripe Dashboard

- [ ] Pago completado
- [ ] Webhook ejecutado correctamente (status 200)
- [ ] Customer creado
- [ ] Suscripción activa (si es recurrente)

---

## ⚠️ Solución de Problemas

### El email no llega

1. Verificar logs de `resend-email-secure`
2. Verificar que Resend API key está configurada
3. Revisar spam del email

### El webhook falla

1. Verificar `STRIPE_WEBHOOK_SECRET` en Supabase
2. Verificar que el endpoint está configurado en Stripe
3. Revisar logs del webhook en Stripe Dashboard

### El pago no se procesa

1. Verificar que el Price ID existe en Stripe
2. Verificar que está usando el modo correcto (test vs live)
3. Revisar consola del navegador para errores

---

## 📝 Comandos Útiles

```bash
# Ver estado del proyecto
npm run dev

# Ejecutar tests unitarios
npm test -- --run src/lib/

# Ver logs de Supabase
supabase functions logs stripe-webhook
supabase functions logs resend-email-secure

# Desplegar funciones (si haces cambios)
supabase functions deploy stripe-webhook
supabase functions deploy resend-email-secure
```
