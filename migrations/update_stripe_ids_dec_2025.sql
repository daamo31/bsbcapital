-- Actualización de IDs de Stripe - 4 de diciembre de 2025
-- Academia BSB Capital y Membresía Exclusiva
-- Este script ACTUALIZA los registros existentes en subscription_plans
-- La tabla user_subscriptions se crea automáticamente cuando un usuario compra

-- ============================================
-- 1. VERIFICAR ESTRUCTURA DE TABLAS
-- ============================================

-- Ver estructura actual de subscription_plans
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'subscription_plans'
ORDER BY ordinal_position;

-- Ver estructura de user_subscriptions (tabla que vincula usuarios con planes)
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- ============================================
-- 2. ACTUALIZAR ACADEMIA BSB CAPITAL
-- ============================================

-- Actualizar plan mensual de Academia (20€/mes)
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SaXVjJmSk3VG9oix0Pu2N9J',
  stripe_product_id = 'prod_T9dymUXkbPpeir',
  price = 20.00,
  name = 'Academia BSB - Plan Mensual',
  description = 'Acceso completo a toda la plataforma de formación crypto',
  updated_at = NOW()
WHERE (
  name ILIKE '%academia%' 
  OR description ILIKE '%academia%'
  OR stripe_product_id = 'prod_T9dymUXkbPpeir'
) 
AND billing_interval = 'month';

-- Actualizar plan anual de Academia (200€/año)
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SDKgoJmSk3VG9oiamJj88De',
  stripe_product_id = 'prod_T9dymUXkbPpeir',
  price = 200.00,
  name = 'Academia BSB - Plan Anual',
  description = 'Ahorra 2 meses con el plan anual - Acceso completo a formación crypto',
  updated_at = NOW()
WHERE (
  name ILIKE '%academia%' 
  OR description ILIKE '%academia%'
  OR stripe_product_id = 'prod_T9dymUXkbPpeir'
)
AND billing_interval = 'year';

-- ============================================
-- 3. ACTUALIZAR MEMBRESÍA EXCLUSIVA
-- ============================================

-- Actualizar Membresía Exclusiva Mensual
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SaXofJmSk3VG9oigjDZtcF6',
  stripe_product_id = 'prod_TXd41kG8ddpyDP',
  name = 'Membresía Exclusiva - Mensual',
  description = 'Acceso completo a consultoría, formación y herramientas BSB Capital',
  updated_at = NOW()
WHERE id = '4f27f890-55ea-4f61-b6f9-3b02b3a358fa'; -- UUID del plan mensual

-- Actualizar Membresía Exclusiva Anual
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SaXpNJmSk3VG9oifsW4ajZ2',
  stripe_product_id = 'prod_TXd5JJfHRg8ZTx',
  name = 'Membresía Exclusiva - Anual',
  description = 'Acceso anual completo con descuento - Consultoría, formación y herramientas BSB Capital',
  updated_at = NOW()
WHERE id = '9e38bc9e-7f4f-424c-87fe-6b4e453301d7'; -- UUID del plan anual

-- ============================================
-- 4. VERIFICACIÓN DE CAMBIOS
-- ============================================

-- Ver todos los planes actualizados
SELECT 
  id,
  name,
  description,
  price,
  billing_interval,
  stripe_product_id as "Producto Stripe",
  stripe_price_id as "Precio Stripe",
  is_active,
  updated_at
FROM subscription_plans
WHERE stripe_product_id IN (
  'prod_T9dymUXkbPpeir',  -- Academia
  'prod_TXd41kG8ddpyDP',  -- Membresía Exclusiva mensual
  'prod_TXd5JJfHRg8ZTx'   -- Membresía Exclusiva anual
)
OR id IN (
  '4f27f890-55ea-4f61-b6f9-3b02b3a358fa',
  '9e38bc9e-7f4f-424c-87fe-6b4e453301d7'
)
ORDER BY name, billing_interval;

-- ============================================
-- 5. VER SUSCRIPCIONES ACTIVAS DE USUARIOS
-- ============================================

-- Ver usuarios con suscripciones activas y sus datos
SELECT 
  us.id as "ID Suscripción",
  us.user_id as "ID Usuario",
  au.email as "Email Usuario",
  au.raw_user_meta_data->>'full_name' as "Nombre Usuario",
  sp.name as "Plan",
  sp.price as "Precio",
  sp.billing_interval as "Intervalo",
  us.status as "Estado",
  us.current_period_end as "Fin Período",
  us.stripe_subscription_id as "Stripe Sub ID",
  us.created_at as "Fecha Creación"
FROM user_subscriptions us
INNER JOIN auth.users au ON us.user_id = au.id
INNER JOIN subscription_plans sp ON us.plan_id = sp.id
WHERE us.status IN ('active', 'trialing')
ORDER BY us.created_at DESC;

-- ============================================
-- 6. ACTUALIZAR SUSCRIPCIONES EXISTENTES CON NUEVOS IDs
-- ============================================

-- IMPORTANTE: Este paso actualiza las suscripciones activas para usar los nuevos price_ids
-- Solo ejecutar si hay suscripciones que necesitan migración

-- Actualizar user_subscriptions que usan los IDs antiguos de Academia
UPDATE user_subscriptions
SET 
  stripe_price_id = CASE 
    WHEN sp.billing_interval = 'month' THEN 'price_1SaXVjJmSk3VG9oix0Pu2N9J'
    WHEN sp.billing_interval = 'year' THEN 'price_1SDKgoJmSk3VG9oiamJj88De'
  END,
  updated_at = NOW()
FROM subscription_plans sp
WHERE user_subscriptions.plan_id = sp.id
  AND sp.stripe_product_id = 'prod_T9dymUXkbPpeir'
  AND user_subscriptions.status = 'active';

-- Actualizar user_subscriptions que usan los IDs antiguos de Membresía
UPDATE user_subscriptions
SET 
  stripe_price_id = CASE 
    WHEN plan_id = '4f27f890-55ea-4f61-b6f9-3b02b3a358fa' THEN 'price_1SaXofJmSk3VG9oigjDZtcF6'
    WHEN plan_id = '9e38bc9e-7f4f-424c-87fe-6b4e453301d7' THEN 'price_1SaXpNJmSk3VG9oifsW4ajZ2'
  END,
  updated_at = NOW()
WHERE plan_id IN (
  '4f27f890-55ea-4f61-b6f9-3b02b3a358fa',
  '9e38bc9e-7f4f-424c-87fe-6b4e453301d7'
)
AND status = 'active';

-- ============================================
-- 7. RESUMEN FINAL
-- ============================================

-- Mostrar resumen de todos los planes y cuántos usuarios los tienen
SELECT 
  sp.name as "Plan",
  sp.billing_interval as "Intervalo",
  sp.price as "Precio (€)",
  sp.stripe_product_id as "Producto Stripe",
  sp.stripe_price_id as "Precio Stripe",
  COUNT(DISTINCT us.user_id) as "Usuarios Activos",
  sp.is_active as "Plan Activo",
  CASE 
    WHEN sp.updated_at > NOW() - INTERVAL '1 hour' THEN '✅ ACTUALIZADO HOY'
    WHEN sp.updated_at > NOW() - INTERVAL '1 day' THEN '📅 Actualizado recientemente'
    ELSE '⏳ Sin cambios recientes'
  END as "Estado"
FROM subscription_plans sp
LEFT JOIN user_subscriptions us ON sp.id = us.plan_id AND us.status = 'active'
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.billing_interval, sp.price, sp.stripe_product_id, sp.stripe_price_id, sp.is_active, sp.updated_at
ORDER BY 
  CASE 
    WHEN sp.name ILIKE '%academia%' THEN 1
    WHEN sp.name ILIKE '%membresía%' OR sp.name ILIKE '%membership%' THEN 2
    ELSE 3
  END,
  sp.billing_interval DESC;

-- Mostrar detalles de cambios en user_subscriptions
SELECT 
  'Total suscripciones activas' as "Métrica",
  COUNT(*) as "Cantidad"
FROM user_subscriptions
WHERE status = 'active'
UNION ALL
SELECT 
  'Actualizadas en última hora',
  COUNT(*)
FROM user_subscriptions
WHERE updated_at > NOW() - INTERVAL '1 hour'
  AND status = 'active';

