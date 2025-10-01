-- ====================================================================
-- 📋 SCRIPT DE INSERCIÓN DE PLANES DE MEMBRESÍA BSB CAPITAL
-- ====================================================================
-- 
-- INSTRUCCIONES:
-- 1. Primero crear los productos en Stripe Dashboard siguiendo STRIPE_PRODUCTS_SETUP.md
-- 2. Reemplazar los PLACEHOLDER_PRICE_ID con los price_id reales de Stripe
-- 3. Ejecutar este script en la consola SQL de Supabase
--
-- ====================================================================

-- 🗑️ Limpiar datos existentes (opcional)
-- DELETE FROM subscription_plans WHERE name LIKE '%BSB Capital%';

-- 📦 Insertar los 3 planes de membresía
INSERT INTO subscription_plans (
  name,
  description,
  price,
  currency,
  duration_months,
  features,
  is_active,
  stripe_price_id,
  stripe_product_id,
  created_at,
  updated_at
) VALUES 

-- 🟢 PLAN BÁSICO
(
  'Plan Básico BSB Capital',
  'Acceso básico a la formación de trading e inversión con contenido fundamental y soporte por email.',
  99.99,
  'USD',
  1, -- Mensual
  ARRAY[
    'Acceso a módulos básicos de trading',
    'Estrategias fundamentales de inversión',
    'Análisis técnico básico',
    'Soporte por email',
    'Acceso a webinars mensuales',
    'Plantillas básicas descargables'
  ],
  true,
  'PLACEHOLDER_BASIC_PRICE_ID', -- 🔄 REEMPLAZAR con price_id de Stripe
  'PLACEHOLDER_BASIC_PRODUCT_ID', -- 🔄 REEMPLAZAR con product_id de Stripe
  now(),
  now()
),

-- 🔵 PLAN PREMIUM  
(
  'Plan Premium BSB Capital',
  'Acceso premium con contenido avanzado, análisis de mercado y soporte prioritario para traders intermedios.',
  299.99,
  'USD',
  1, -- Mensual
  ARRAY[
    'Todo lo del Plan Básico',
    'Módulos avanzados de trading',
    'Análisis de mercado semanal',
    'Estrategias de riesgo avanzadas',
    'Acceso a crypto y forex',
    'Soporte prioritario',
    'Sesiones grupales mensuales',
    'Alertas de trading en tiempo real',
    'Plantillas premium',
    'Acceso a backtest de estrategias'
  ],
  true,
  'PLACEHOLDER_PREMIUM_PRICE_ID', -- 🔄 REEMPLAZAR con price_id de Stripe
  'PLACEHOLDER_PREMIUM_PRODUCT_ID', -- 🔄 REEMPLAZAR con product_id de Stripe
  now(),
  now()
),

-- 🟣 PLAN VIP
(
  'Plan VIP BSB Capital',
  'Acceso VIP completo con todo el contenido, sesiones 1:1, acceso de por vida y beneficios exclusivos.',
  999.99,
  'USD',
  1, -- Mensual
  ARRAY[
    'Todo lo del Plan Premium',
    'Acceso de por vida garantizado',
    'Sesiones 1:1 mensuales con expertos',
    'Análisis personalizado de portfolio',
    'Acceso anticipado a nuevos contenidos',
    'Canal VIP de Telegram/Discord',
    'Revisión de estrategias personales',
    'Acceso a todos los cursos futuros',
    'Soporte 24/7 prioritario',
    'Invitaciones a eventos exclusivos',
    'Copytradng de estrategias top',
    'Herramientas avanzadas de análisis'
  ],
  true,
  'PLACEHOLDER_VIP_PRICE_ID', -- 🔄 REEMPLAZAR con price_id de Stripe
  'PLACEHOLDER_VIP_PRODUCT_ID', -- 🔄 REEMPLAZAR con product_id de Stripe
  now(),
  now()
);

-- ✅ Verificar que se insertaron correctamente
SELECT 
  id,
  name,
  price,
  currency,
  duration_months,
  array_length(features, 1) as feature_count,
  stripe_price_id,
  is_active
FROM subscription_plans 
WHERE name LIKE '%BSB Capital%'
ORDER BY price ASC;

-- 📊 Ver estadísticas
SELECT 
  COUNT(*) as total_plans,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_plans,
  MIN(price) as min_price,
  MAX(price) as max_price,
  AVG(price) as avg_price
FROM subscription_plans;

-- ====================================================================
-- 🚨 SIGUIENTE PASO: 
-- 1. Crear productos en Stripe Dashboard
-- 2. Reemplazar los PLACEHOLDER con los price_id reales
-- 3. Ejecutar este script actualizado
-- ====================================================================