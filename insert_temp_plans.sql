-- ====================================================================
-- 🚀 INSERCIÓN RÁPIDA DE PLANES TEMPORALES PARA TESTING
-- ====================================================================
-- 
-- Ejecuta este SQL en el SQL Editor del Dashboard de Supabase
-- Dashboard → SQL Editor → New query → Pegar y ejecutar
--
-- ====================================================================

-- 🗑️ Limpiar datos existentes (si los hay)
DELETE FROM subscription_plans WHERE stripe_price_id LIKE 'price_temp_%';

-- 📦 Insertar los 3 planes temporales para testing
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
) VALUES 

-- 🟢 PLAN BÁSICO TEMPORAL
(
  'Plan Básico BSB Capital',
  'Acceso básico a la formación de trading e inversión con contenido fundamental y soporte por email.',
  99.99,
  'USD',
  1,
  ARRAY[
    'Acceso a módulos básicos de trading',
    'Estrategias fundamentales de inversión',
    'Análisis técnico básico',
    'Soporte por email',
    'Acceso a webinars mensuales',
    'Plantillas básicas descargables'
  ],
  true,
  'price_temp_basic_123',
  'prod_temp_basic_123'
),

-- 🔵 PLAN PREMIUM TEMPORAL
(
  'Plan Premium BSB Capital',
  'Acceso premium con contenido avanzado, análisis de mercado y soporte prioritario para traders intermedios.',
  299.99,
  'USD',
  1,
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
  'price_temp_premium_456',
  'prod_temp_premium_456'
),

-- 🟣 PLAN VIP TEMPORAL
(
  'Plan VIP BSB Capital',
  'Acceso VIP completo con todo el contenido, sesiones 1:1, acceso de por vida y beneficios exclusivos.',
  999.99,
  'USD',
  1,
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
    'Copytrading de estrategias top',
    'Herramientas avanzadas de análisis'
  ],
  true,
  'price_temp_vip_789',
  'prod_temp_vip_789'
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
  is_active,
  created_at
FROM subscription_plans 
ORDER BY price ASC;

-- 📊 Ver estadísticas finales
SELECT 
  COUNT(*) as total_plans,
  SUM(CASE WHEN is_active THEN 1 ELSE 0 END) as active_plans,
  MIN(price) as min_price,
  MAX(price) as max_price,
  ROUND(AVG(price), 2) as avg_price
FROM subscription_plans;

-- ====================================================================
-- ✅ RESULTADO ESPERADO:
-- - 3 planes insertados (Básico, Premium, VIP)
-- - Precios: $99.99, $299.99, $999.99
-- - Todos con stripe_price_id temporales para testing
-- 
-- 🚀 SIGUIENTE PASO: 
-- - Ir a Dashboard de Supabase
-- - SQL Editor → New query
-- - Pegar este código y ejecutar
-- ====================================================================