-- AÑADIR Nuevas Membresías con IDs de Stripe - 4 de diciembre de 2025
-- Academia BSB Capital y Membresía Exclusiva

-- ============================================
-- 1. ACADEMIA BSB CAPITAL
-- ============================================

-- Insertar Academia BSB Capital (plan único con precios mensual y anual)
-- Usamos UUID fijo para que el webhook pueda mapear correctamente
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price,
  price_annual,
  currency,
  duration_months,
  features,
  stripe_price_id,
  stripe_price_id_annual,
  stripe_product_id,
  is_active,
  max_users,
  created_at,
  updated_at
) 
SELECT
  'b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c'::uuid, -- UUID fijo para Academia
  'Academia BSB Capital',
  'Acceso completo a toda la plataforma de formación crypto. Aprende a invertir con autonomía y criterio mediante píldoras rápidas, masterclasses especializadas y contenido actualizado.',
  20.00,
  200.00,
  'EUR',
  1, -- Mensual (duration_months = 1 para plan con opción mensual/anual)
  jsonb_build_object(
    'mensual', jsonb_build_array(
      'Todos los módulos de formación crypto',
      'Plantillas y checklists descargables',
      'Soporte por email',
      'Actualizaciones continuas incluidas',
      'Acceso a foro de la Academia',
      'Garantía de devolución'
    ),
    'anual', jsonb_build_array(
      'Todos los módulos de formación crypto',
      'Plantillas y checklists descargables',
      'Soporte por email',
      'Actualizaciones continuas incluidas',
      'Acceso a foro de la Academia',
      'Garantía de devolución',
      '2 meses gratis incluidos'
    )
  ),
  'price_1SaXVjJmSk3VG9oix0Pu2N9J', -- Precio mensual
  'price_1SDKgoJmSk3VG9oiamJj88De', -- Precio anual
  'prod_T9dymUXkbPpeir', -- Producto Stripe
  true,
  NULL, -- Sin límite de usuarios
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans 
  WHERE id = 'b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c'::uuid
);

-- ============================================
-- 2. MEMBRESÍA EXCLUSIVA MENSUAL
-- ============================================

-- Insertar Membresía Exclusiva Mensual (29.99€/mes)
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price,
  currency,
  duration_months,
  features,
  stripe_price_id,
  stripe_product_id,
  is_active,
  max_users,
  created_at,
  updated_at
) 
SELECT
  '4f27f890-55ea-4f61-b6f9-3b02b3a358fa'::uuid,
  'Membresía Exclusiva BSB - Mensual',
  'Acceso completo al ecosistema BSB Capital: consultoría con descuentos, acceso anticipado a BSB Maker, acceso anual a BSB Academy y eventos exclusivos con expertos en crypto.',
  40.00,
  'EUR',
  1,
  jsonb_build_array(
    'Descuentos especiales en consultoría',
    'Acceso anticipado al BSB Maker',
    'Acceso anual a BSB Academy',
    'Eventos y reuniones con expertos en crypto',
    'Comunidad exclusiva de miembros',
    'Análisis avanzado de cartera',
    'Soporte prioritario'
  ),
  'price_1SaXofJmSk3VG9oigjDZtcF6',
  'prod_TXd41kG8ddpyDP',
  true,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans 
  WHERE id = '4f27f890-55ea-4f61-b6f9-3b02b3a358fa'::uuid
);

-- ============================================
-- 3. MEMBRESÍA EXCLUSIVA ANUAL
-- ============================================

-- Insertar Membresía Exclusiva Anual (299€/año, ahorro de 2 meses)
INSERT INTO subscription_plans (
  id,
  name,
  description,
  price,
  currency,
  duration_months,
  features,
  stripe_price_id,
  stripe_product_id,
  is_active,
  max_users,
  created_at,
  updated_at
) 
SELECT
  '9e38bc9e-7f4f-424c-87fe-6b4e453301d7'::uuid,
  'Membresía Exclusiva BSB - Anual',
  'Acceso completo al ecosistema BSB Capital con ahorro anual: consultoría con descuentos, acceso anticipado a BSB Maker, acceso anual a BSB Academy y eventos exclusivos con expertos en crypto.',
  400.00,
  'EUR',
  12,
  jsonb_build_array(
    'Descuentos especiales en consultoría',
    'Acceso anticipado al BSB Maker',
    'Acceso anual a BSB Academy',
    'Eventos y reuniones con expertos en crypto',
    'Comunidad exclusiva de miembros',
    'Análisis avanzado de cartera',
    'Soporte prioritario',
    '2 meses gratis respecto al plan mensual'
  ),
  'price_1SaXpNJmSk3VG9oifsW4ajZ2',
  'prod_TXd5JJfHRg8ZTx',
  true,
  NULL,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM subscription_plans 
  WHERE id = '9e38bc9e-7f4f-424c-87fe-6b4e453301d7'::uuid
);

-- ============================================
-- 4. VERIFICACIÓN
-- ============================================

-- Consultar las membresías añadidas/actualizadas
SELECT 
  id,
  name,
  price,
  price_annual,
  currency,
  duration_months,
  stripe_product_id,
  stripe_price_id,
  stripe_price_id_annual,
  is_active,
  created_at,
  updated_at
FROM subscription_plans
WHERE stripe_product_id IN (
  'prod_T9dymUXkbPpeir',  -- Academia
  'prod_TXd41kG8ddpyDP',  -- Membresía Exclusiva mensual
  'prod_TXd5JJfHRg8ZTx'   -- Membresía Exclusiva anual
)
ORDER BY name, duration_months;

-- ============================================
-- 5. RESUMEN DE TODOS LOS PLANES ACTIVOS
-- ============================================

SELECT 
  name as "Plan",
  CONCAT(price, ' ', currency, CASE WHEN duration_months = 1 THEN '/mes' ELSE '/año' END) as "Precio",
  CASE 
    WHEN price_annual IS NOT NULL THEN CONCAT(price_annual, ' ', currency, '/año')
    ELSE '-'
  END as "Precio Anual",
  stripe_product_id as "Producto Stripe",
  stripe_price_id as "ID Precio Mensual/Único",
  stripe_price_id_annual as "ID Precio Anual",
  CASE 
    WHEN updated_at > NOW() - INTERVAL '5 minutes' THEN '✅ RECIÉN AÑADIDO'
    WHEN updated_at > NOW() - INTERVAL '1 hour' THEN '✅ ACTUALIZADO'
    ELSE '📋 Existente'
  END as "Estado"
FROM subscription_plans
WHERE is_active = true
ORDER BY 
  CASE 
    WHEN name ILIKE '%academia%' THEN 1
    WHEN name ILIKE '%membresía%' OR name ILIKE '%membership%' THEN 2
    ELSE 3
  END,
  duration_months;

-- ============================================
-- 6. NOTAS IMPORTANTES
-- ============================================

/*
RESUMEN DE PLANES AÑADIDOS:

1. ACADEMIA BSB CAPITAL
   - UUID: b8f3c5e1-4a2d-4e9f-8c7b-1d5e6f7a8b9c (fijo)
   - Producto: prod_T9dymUXkbPpeir
   - Mensual: 20€/mes (price_1SaXVjJmSk3VG9oix0Pu2N9J)
   - Anual: 200€/año (price_1SDKgoJmSk3VG9oiamJj88De)
   
2. MEMBRESÍA EXCLUSIVA MENSUAL
   - UUID: 4f27f890-55ea-4f61-b6f9-3b02b3a358fa
   - Producto: prod_TXd41kG8ddpyDP
   - Precio: 29.99€/mes (price_1SaXofJmSk3VG9oigjDZtcF6)
   
3. MEMBRESÍA EXCLUSIVA ANUAL
   - UUID: 9e38bc9e-7f4f-424c-87fe-6b4e453301d7
   - Producto: prod_TXd5JJfHRg8ZTx
   - Precio: 299€/año (price_1SaXpNJmSk3VG9oifsW4ajZ2)

NOTA: Este script usa INSERT ... WHERE NOT EXISTS para añadir nuevos registros
solo si no existen ya (verificando por id/uuid fijo).
Los UUIDs son fijos para que el webhook de Stripe pueda mapearlos correctamente.
*/
