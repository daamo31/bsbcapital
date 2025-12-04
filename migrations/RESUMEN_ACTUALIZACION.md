# 📋 Resumen de Actualización de Membresías - 4 de diciembre de 2025

## ✅ Cambios Realizados

### 1. **Script SQL de Migración** (`insert_new_stripe_memberships_dec_2025.sql`)

**Membresías añadidas:**

#### 🎓 Academia BSB Capital
- **UUID fijo**: `b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c`
- **Producto Stripe**: `prod_T9dymUXkbPpeir`
- **Precio Mensual**: 20€/mes → `price_1SaXVjJmSk3VG9oix0Pu2N9J`
- **Precio Anual**: 200€/año → `price_1SDKgoJmSk3VG9oiamJj88De`
- **Duración**: 1 mes (con opción mensual/anual)
- **Características**: Ambos precios (mensual y anual) apuntan al mismo plan

#### 💎 Membresía Exclusiva BSB - Mensual
- **UUID fijo**: `4f27f890-55ea-4f61-b6f9-3b02b3a358fa`
- **Producto Stripe**: `prod_TXd41kG8ddpyDP`
- **Precio**: 29.99€/mes → `price_1SaXofJmSk3VG9oigjDZtcF6`
- **Duración**: 1 mes

#### 💎 Membresía Exclusiva BSB - Anual
- **UUID fijo**: `9e38bc9e-7f4f-424c-87fe-6b4e453301d7`
- **Producto Stripe**: `prod_TXd5JJfHRg8ZTx`
- **Precio**: 299€/año → `price_1SaXpNJmSk3VG9oifsW4ajZ2`
- **Duración**: 12 meses
- **Ahorro**: 2 meses gratis vs plan mensual

---

### 2. **Webhook de Stripe** (`stripe-webhook/index.ts`)

**Mapeo actualizado de Price ID → Plan ID:**

```typescript
const priceToPlanMap: Record<string, string> = {
  // Membresía Exclusiva
  "price_1SaXofJmSk3VG9oigjDZtcF6": "4f27f890-55ea-4f61-b6f9-3b02b3a358fa", // Mensual
  "price_1SaXpNJmSk3VG9oifsW4ajZ2": "9e38bc9e-7f4f-424c-87fe-6b4e453301d7", // Anual
  
  // Academia BSB (ambos precios apuntan al mismo plan)
  "price_1SaXVjJmSk3VG9oix0Pu2N9J": "b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c", // Mensual 20€
  "price_1SDKgoJmSk3VG9oiamJj88De": "b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c", // Anual 200€
};
```

---

### 3. **Componentes Frontend** (ya actualizados previamente)

#### CheckoutModal.jsx (Academia)
```javascript
const ACADEMY_STRIPE_PRODUCT_ID = "prod_T9dymUXkbPpeir";
const ACADEMY_PRICES = {
  monthly: "price_1SaXVjJmSk3VG9oix0Pu2N9J",
  annual: "price_1SDKgoJmSk3VG9oiamJj88De",
};
```

#### CheckoutPage.jsx (Membresía Exclusiva)
```javascript
const MEMBERSHIP_PRICES = {
  monthly: {
    priceId: "price_1SaXofJmSk3VG9oigjDZtcF6",
    productId: "prod_TXd41kG8ddpyDP",
  },
  annual: {
    priceId: "price_1SaXpNJmSk3VG9oifsW4ajZ2",
    productId: "prod_TXd5JJfHRg8ZTx",
  },
};
```

---

## 🔄 Flujo de Compra

### Academia BSB Capital:
1. Usuario selecciona plan mensual (20€) o anual (200€)
2. `CheckoutModal.jsx` envía el `priceId` correspondiente
3. `create-stripe-checkout` crea sesión con el precio seleccionado
4. Stripe procesa el pago
5. Webhook recibe evento `checkout.session.completed`
6. Webhook mapea `priceId` → `b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c` (mismo plan para ambos)
7. Se crea registro en `user_subscriptions` con el `plan_id`

### Membresía Exclusiva:
1. Usuario selecciona plan mensual (29.99€) o anual (299€)
2. `CheckoutPage.jsx` envía el `priceId` y `productId` correspondientes
3. `create-stripe-checkout` crea sesión con el precio seleccionado
4. Stripe procesa el pago
5. Webhook recibe evento `checkout.session.completed`
6. Webhook mapea:
   - Mensual: `price_1SaXofJmSk3VG9oigjDZtcF6` → `4f27f890-55ea-4f61-b6f9-3b02b3a358fa`
   - Anual: `price_1SaXpNJmSk3VG9oifsW4ajZ2` → `9e38bc9e-7f4f-424c-87fe-6b4e453301d7`
7. Se crea registro en `user_subscriptions` con el `plan_id` correspondiente

---

## 📝 Próximos Pasos

### 1. Ejecutar el Script SQL
```sql
-- En Supabase SQL Editor, ejecutar:
-- /migrations/insert_new_stripe_memberships_dec_2025.sql
```

Este script:
- ✅ Usa `INSERT ... WHERE NOT EXISTS` para evitar duplicados
- ✅ Usa UUIDs fijos para consistencia con el webhook
- ✅ Incluye consultas de verificación al final

### 2. Verificar Registros Creados
Después de ejecutar el script, verificar en Supabase:
```sql
SELECT id, name, price, price_annual, stripe_product_id, stripe_price_id, stripe_price_id_annual
FROM subscription_plans
WHERE id IN (
  'b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c',
  '4f27f890-55ea-4f61-b6f9-3b02b3a358fa',
  '9e38bc9e-7f4f-424c-87fe-6b4e453301d7'
);
```

### 3. Desplegar Función de Webhook
```bash
cd supabase/functions/stripe-webhook
supabase functions deploy stripe-webhook
```

### 4. Probar Flujo Completo

#### Test de Academia:
1. Ir a `/academia` en el frontend
2. Click en "Comprar plan mensual" o "Comprar plan anual"
3. Completar checkout en Stripe (usar tarjeta de test: `4242 4242 4242 4242`)
4. Verificar que se crea registro en `user_subscriptions` con `plan_id = b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c`

#### Test de Membresía Exclusiva:
1. Ir a `/membresias` en el frontend
2. Click en "Comprar mensual" o "Comprar anual"
3. Completar checkout en Stripe
4. Verificar que se crea registro en `user_subscriptions` con el `plan_id` correcto

---

## 🚨 Notas Importantes

1. **UUIDs Fijos**: Se usan UUIDs fijos para que el webhook pueda mapear correctamente los pagos a los planes.

2. **Academia - Un solo plan**: Tanto el precio mensual como anual de Academia apuntan al mismo `plan_id` (`b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c`). Esto es intencional para simplificar la gestión.

3. **Membresía Exclusiva - Planes separados**: Los planes mensual y anual tienen UUIDs diferentes porque son productos Stripe diferentes.

4. **Precios Corregidos**:
   - Academia mensual: 20€ ✅
   - Academia anual: 200€ ✅
   - Membresía mensual: 29.99€ ✅
   - Membresía anual: 299€ ✅

5. **Función `create-stripe-checkout`**: No requiere cambios, ya valida automáticamente los precios contra Stripe y funciona con cualquier `priceId` válido.

---

## ✅ Checklist Final

- [x] Script SQL creado con UUIDs fijos
- [x] Webhook actualizado con mapeo correcto
- [x] Componentes frontend actualizados (CheckoutModal, CheckoutPage)
- [x] Precios corregidos (29.99€ y 299€)
- [ ] Ejecutar script SQL en Supabase
- [ ] Desplegar función webhook actualizada
- [ ] Probar flujo completo de compra Academia
- [ ] Probar flujo completo de compra Membresía Exclusiva
- [ ] Verificar emails de confirmación
- [ ] Verificar registros en `user_subscriptions`

---

## 🔗 Archivos Modificados

1. `/migrations/insert_new_stripe_memberships_dec_2025.sql` - Script de migración SQL
2. `/supabase/functions/stripe-webhook/index.ts` - Webhook con mapeo actualizado
3. `/src/components/consultations/CheckoutModal.jsx` - Ya actualizado anteriormente
4. `/src/pages/payments/CheckoutPage.jsx` - Ya actualizado anteriormente

---

**Fecha de actualización**: 4 de diciembre de 2025  
**Estado**: ✅ Listo para ejecutar en producción
