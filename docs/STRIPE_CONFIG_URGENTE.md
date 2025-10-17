# 🔐 Configuración de Stripe para Producción

## ⚠️ ERROR ACTUAL
```javascript
POST https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/create-stripe-checkout 500 (Internal Server Error)
Error: STRIPE_SECRET_KEY not configured
```

## 🚀 SOLUCIÓN INMEDIATA

### Paso 1: Obtener las API Keys de Stripe
1. Ve a https://dashboard.stripe.com/apikeys
2. Copia las siguientes keys:
   - **Publishable key** (pk_live_... o pk_test_...)
   - **Secret key** (sk_live_... o sk_test_...)

### Paso 2: Configurar Variables de Entorno en Supabase
1. Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/settings/edge-functions
2. En "Environment Variables", agrega:

```
Variable Name: STRIPE_SECRET_KEY
Value: sk_live_XXXXXXXXXX (o sk_test_XXXXXXXXXX para testing)
```

```
Variable Name: STRIPE_WEBHOOK_SECRET  
Value: whsec_XXXXXXXXXX (si tienes webhooks configurados)
```

### Paso 3: Verificar Configuración Frontend
Confirma que en tu proyecto React tienes:
```javascript
// En .env o directamente en el código
const STRIPE_PUBLISHABLE_KEY = 'pk_live_XXXXXXXXXX'
```

### Paso 4: Redeploy de la Función (Opcional)
Si ya configuraste las variables, puedes redeplegar:
```bash
npx supabase functions deploy create-stripe-checkout
```

## 🧪 TESTING

### Test Rápido
1. Configura las variables de entorno
2. Intenta agendar una consultoría
3. El error 500 debería desaparecer

### Si sigue fallando
Revisa los logs en:
https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/functions

## 🔒 SEGURIDAD

### ✅ Buenas Prácticas
- Usa `sk_test_` para development/testing
- Usa `sk_live_` solo para producción
- Nunca pongas secret keys en el código frontend
- Las secret keys solo van en variables de entorno del servidor

### ❌ No hacer
- No pongas `sk_live_` o `sk_test_` en el código React
- No subas secret keys a GitHub
- No compartas secret keys por chat/email

## 📋 CHECKLIST RÁPIDO

- [ ] Obtener Stripe Secret Key de dashboard.stripe.com
- [ ] Configurar `STRIPE_SECRET_KEY` en Supabase Edge Functions
- [ ] Verificar que frontend tiene la Publishable Key correcta
- [ ] Probar flujo de pago en consultoría
- [ ] Confirmar que no hay más errores 500

## 🆘 SI NECESITAS AYUDA URGENTE

1. **Testing rápido**: Usa las test keys de Stripe temporalmente
2. **Logs detallados**: Revisa Supabase Functions logs para ver el error exacto
3. **Rollback**: Si hay problemas, puedes usar un hardcoded key temporalmente (SOLO para debug)

---

**⚡ Solución en 2 minutos:**
1. Stripe Dashboard → API Keys → Copia Secret Key
2. Supabase Dashboard → Settings → Edge Functions → Add `STRIPE_SECRET_KEY`
3. Prueba el flujo de pago