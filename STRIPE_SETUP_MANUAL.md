# ================================================================
# CONFIGURACIÓN MANUAL DE STRIPE SECRETS EN SUPABASE
# ================================================================

## 🔧 **Configura estos secrets en tu Dashboard de Supabase:**

1. Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/settings/edge-functions

2. En la sección "Environment variables", agrega:

### **STRIPE_SECRET_KEY**
```
sk_live_d214e386e19bf8a3a83f29004da4405f368bac4cc38afa9ca5e0dd86a7dc5eb7
```

### **STRIPE_WEBHOOK_SECRET** 
```
whsec_5d3c41499b56b97ef2783b90990b4f75ca7f878f276a6297c657e107c485a99c
```

### **STRIPE_PUBLISHABLE_KEY**
```
pk_live_51Rne6CJmSk3VG9oipr5fPA32tndC3TFLYHWrENknJ8fcNvIq8A3Nq0KfLdvwkMAyFvgLOWECBpIuzE2THTX4Mb1s00zqHyg0op
```

## 📋 **Pasos para completar la configuración:**

### **1. Obtener clave pública de Stripe:**
- Ve a: https://dashboard.stripe.com/test/apikeys
- Copia la "Publishable key" (pk_test_...)
- Agrégala como variable de entorno en Supabase

### **2. Actualizar .env.local:**
- Reemplaza `pk_test_51SDJJHJmSk3VG9oiWXKQ8X8...` por tu clave real
- El archivo ya tiene configuradas las claves secretas

### **3. Verificar webhooks (opcional):**
- En Stripe Dashboard → Webhooks
- Endpoint: `https://ietktalvzyykynhdkqhv.supabase.co/functions/v1/stripe-webhook`
- Eventos: `payment_intent.succeeded`, `customer.subscription.created`

## ✅ **Para probar que funciona:**

1. Ejecuta: `npm run dev`
2. Ve a: `http://localhost:5173/membresias`
3. Intenta seleccionar un plan
4. Debería abrir Stripe Checkout

## 🚨 **Si algo no funciona:**

- Verifica que las variables estén en Supabase Edge Functions
- Revisa la consola del navegador para errores
- Chequea los logs de Edge Functions en Supabase

## 🔗 **Enlaces útiles:**
- Dashboard Supabase: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv
- Stripe Dashboard: https://dashboard.stripe.com
- Edge Functions: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/functions