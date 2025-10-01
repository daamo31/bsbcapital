## 🎯 Crear Planes de Membresía en Supabase

### Pasos a Seguir:

1. **Ir al Dashboard de Supabase**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto BSB Capital

2. **Abrir SQL Editor**
   - En el menú lateral, click en "SQL Editor"
   - Click en "New query"

3. **Copiar y Ejecutar este SQL:**

```sql
-- Insertar plan básico de prueba
INSERT INTO subscription_plans (
  name,
  description,
  price,
  currency,
  duration_months,
  features,
  is_active,
  stripe_price_id,
  stripe_product_id
) VALUES (
  'Plan Básico BSB Capital',
  'Acceso básico a la formación de trading e inversión',
  99.99,
  'USD',
  1,
  ARRAY['Módulos básicos', 'Soporte email', 'Webinars'],
  true,
  'price_temp_basic_123',
  'prod_temp_basic_123'
);

-- Verificar inserción
SELECT * FROM subscription_plans;
```

4. **Ejecutar la Query**
   - Click en "Run" o presiona Ctrl+Enter

5. **Verificar Resultados**
   - Deberías ver el plan insertado en los resultados

### ⚠️ Importante:
- Los `stripe_price_id` son temporales para testing
- Una vez que funcione el flujo, crearemos los productos reales en Stripe
- El sistema está listo para funcionar con estos datos temporales