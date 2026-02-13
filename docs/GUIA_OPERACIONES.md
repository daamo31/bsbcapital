# 🚀 Guía de Operaciones y Testing - BSB Capital

Este documento detalla los procedimientos necesarios para desplegar, configurar y verificar la integridad del sistema BSB Capital en entornos de producción y staging.

---

## 🌍 1. Despliegue y CI/CD

El flujo de despliegue automático se activa mediante el push a las ramas protegidas (`main` o `develop`).

### 📦 1.1 Variables de Entorno Críticas

Asegúrate de que estas variables estén en el panel de control de tu proveedor de hosting:

- `VITE_SUPABASE_URL`: Endpoint de tu proyecto Supabase.
- `VITE_SUPABASE_ANON_KEY`: Clave pública para el cliente web.
- `VITE_STRIPE_PUBLISHABLE_KEY`: Clave de Stripe para el frontend.
- `VITE_HOTMART_PRODUCT_ID`: ID del curso principal en Hotmart (e.g., `6308462`).

---

## 🔐 2. Gestión de "Secrets" y Terceros

### 💳 2.1 Stripe Deep-Dive

Para que los pagos dinámicos funcionen, el servidor de Supabase (Edge Functions) debe conocer tus claves privadas:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

**Flujo de Webhooks**:
Cuando Stripe cobra con éxito, envía un POST a la función `stripe-webhook`. Esta función:

1.  Busca al usuario por su `client_reference_id` (que es el `user.id` de Supabase).
2.  Actualiza la tabla `user_subscriptions` a `active`.
3.  Dispara un email de confirmación mediante `resend-email-secure`.

---

## 🔧 3. Recetas Operativas (Mantenimiento)

Aquí tienes soluciones rápidas para situaciones comunes:

### ✉️ Receta: Reenviar un Email Fallido

Si un cliente no recibió su confirmación de compra:

1.  Abre la consola de Supabase > SQL Editor.
2.  Ejecuta (sustituyendo los datos):

```sql
select net.http_post(
  url := 'https://[TU_ID].supabase.co/functions/v1/resend-email-secure',
  headers := jsonb_build_object('Content-Type', 'application/json', 'Authorization', 'Bearer [TU_FUNCTIONS_SECRET]'),
  body := jsonb_build_object('type', 'welcome', 'to', 'cliente@email.com', 'data', jsonb_build_object('name', 'Nombre Cliente'))
);
```

### 🎓 Receta: Dar Acceso Manual a la Academia

Si necesitas dar acceso VIP sin pasar por Stripe:

1.  Tabla: `user_academy_access`.
2.  Añade una fila con el `user_id` del usuario y `status: 'active'`.
3.  El hook `useUserAccess` le dará acceso instantáneo en el siguiente refresco de página.

---

## 🐛 4. Guía Avanzada de Troubleshooting

### Escenario: Un usuario dice que tiene acceso pero los videos no cargan

**Diagnóstico**:

1.  Verifica si el `user.id` existe en la tabla `user_subscriptions` con estado `active`.
2.  Abre la consola del navegador del usuario (o pide captura) y busca errores de `HotmartService`.
3.  **Solución**: Si el error es `403 Forbidden` desde Hotmart, es probable que el email del usuario en Supabase no coincida exactamente con el email usado en la compra de Hotmart.

### Escenario: El formulario post-pago no se guarda

**Diagnóstico**:

1.  Verifica los logs de la consola: `supabase functions logs resend-email-secure`.
2.  Busca el evento `admin_consultation_notification`. Si falla el envío de email, a veces la transacción de la DB se revierte.
3.  **Comando de verificación**:

```bash
# Ver logs en tiempo real para detectar errores de sintaxis en el JSON enviado
supabase functions logs resend-email-secure --follow
```

---

## 🧪 5. Plan de Testing (Manual & Auto)

- **Test de Salud**: Ejecuta `hotmartService.getDiagnosticInfo()` en la consola del navegador para verificar credenciales y modo de acceso.
- **Test de Emails**: Usa `/test/email` para enviar ráfagas de prueba de todos los templates disponibles.
- **Checklist de Checkout**:
  - [ ] ¿Redirige a Stripe?
  - [ ] ¿El formulario post-pago es obligatorio?
  - [ ] ¿Se crea la fila en `consultations` con el JSON completo?
