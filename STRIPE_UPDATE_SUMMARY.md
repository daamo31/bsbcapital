# Actualización de IDs de Stripe - Resumen de Cambios

## Fecha: 13 de Noviembre de 2025

### Productos Actualizados:

#### 1. **Onboarding Crypto**
- **Product ID**: `prod_TPi7iCVtydt3Cw`
- **Price ID**: `price_1SSshWJmSk3VG9oiU1cBNWgf`
- **UUID**: `98e48de0-7d37-4e0f-afb8-da0e041d2ae2`
- **Precio**: €390 (anual)
- **Ubicación en código**: 
  - `/src/pages/payments/MembresiasDB.jsx` - ✅ Actualizado
  - `/supabase/migrations/20251113_update_stripe_product_ids.sql` - ✅ Nuevo archivo creado

#### 2. **Gestión de Tesorería para Empresas**
- **Product ID**: `prod_TPi5l6SK9nwBKF`  
- **Price ID**: `price_1SSsfoJmSk3VG9oi70AskCZv`
- **UUID**: `235cb6d6-e532-4a0f-a657-863a68972851`
- **Precio**: €1200 (anual)
- **Ubicación en código**:
  - `/src/pages/payments/MembresiasDB.jsx` - ✅ Actualizado
  - `/supabase/migrations/20251113_update_stripe_product_ids.sql` - ✅ Nuevo archivo creado

#### 3. **Inversor Premium (mismo que Wealth Membership)**
- **Product ID**: `prod_T9dspdTkGGM7Sy`
- **Price ID**: `price_1SDKb2JmSk3VG9oiJr1unLZZ`
- **UUID**: `8dd4df50-6acb-4c98-ab89-a7c6736142ef`
- **Precio**: €2400 (anual)
- **Ubicación en código**:
  - `/src/pages/payments/MembresiasDB.jsx` - ✅ Actualizado
  - `/supabase/migrations/20251113_update_stripe_product_ids.sql` - ✅ Agregado

#### 4. **Servicio Trader Premium (Wealth Membership)**
- **Product ID**: `prod_T9dspdTkGGM7Sy`
- **Price ID**: `price_1SDKb2JmSk3VG9oiJr1unLZZ`
- **Precio**: €2007 (anual)
- **Estado**: ✅ Ya estaba correctamente configurado en el código

### Archivos Modificados:

1. **`/src/pages/payments/MembresiasDB.jsx`**
   - Actualizado `stripe_price_id_annual` y `stripe_product_id` para Onboarding Crypto
   - Actualizado `stripe_price_id_annual` y `stripe_product_id` para Gestión de Tesorería
   - Actualizado `stripe_price_id_annual` y `stripe_product_id` para Inversor Premium (mismo que Wealth Membership)

2. **`/supabase/functions/stripe-webhook/index.ts`**
   - Agregado mapeo para nuevos price IDs con UUIDs específicos:
     - `price_1SSshWJmSk3VG9oiU1cBNWgf` → `98e48de0-7d37-4e0f-afb8-da0e041d2ae2`
     - `price_1SSsfoJmSk3VG9oi70AskCZv` → `235cb6d6-e532-4a0f-a657-863a68972851`
   - Nota: Inversor Premium usa el mismo price_id que Wealth Membership

### Archivos Creados:

1. **`/supabase/migrations/20251113_update_stripe_product_ids.sql`**
   - Migración para insertar/actualizar los productos con UUIDs específicos
   - Configuración completa con features, precios y metadatos
   - Incluye los 3 productos: Onboarding Crypto, Gestión de Tesorería e Inversor Premium

2. **`/supabase/migrations/get_new_plan_uuids.sql`**
   - Script para verificar que los UUIDs están correctamente asignados
   - Incluye verificación de duplicados de stripe_price_id

### Pasos Pendientes:

1. **Ejecutar la migración**:
   ```bash
   supabase db push
   ```

2. **Verificar los planes en la base de datos**:
   ```sql
   \i supabase/migrations/get_new_plan_uuids.sql
   ```

3. **Verificar en Stripe Dashboard** que los productos están activos

4. **Probar checkout** con los nuevos IDs

### Notas Importantes:

- **Inversor Premium** e **Inversor Premium** comparten el mismo `stripe_product_id` y `stripe_price_id` pero tienen UUIDs diferentes en la base de datos
- Todos los productos están configurados como anuales únicamente
- Los mappings de precios en el webhook están actualizados con los UUIDs específicos
- La migración usa UPSERT para evitar duplicados

### Verificación:

Para verificar que todo funciona correctamente, prueba:
1. Proceso de checkout con los nuevos productos
2. Webhook de Stripe recibiendo eventos correctamente
3. Creación de suscripciones en la base de datos