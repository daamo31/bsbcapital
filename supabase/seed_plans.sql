-- ================================================================
-- EJECUTAR ESTOS COMANDOS EN TU SUPABASE SQL EDITOR
-- ================================================================
-- Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/sql/new

-- 1. PRIMERO: Crear constraint único para stripe_price_id
ALTER TABLE public.subscription_plans 
ADD CONSTRAINT subscription_plans_stripe_price_id_unique 
UNIQUE (stripe_price_id);

-- 2. LIMPIAR DATOS EXISTENTES (opcional, solo si hay datos basura)
DELETE FROM public.subscription_plans WHERE stripe_price_id LIKE 'price_temp_%' OR stripe_price_id IN ('price_basic', 'price_premium', 'price_elite');

-- 3. INSERTAR PLAN BÁSICO
INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active) 
VALUES (
  gen_random_uuid(),
  'Plan Básico',
  'Acceso a cursos fundamentales de trading y análisis técnico básico',
  99.99,
  'USD',
  3,
  '[
    "Acceso a 5 cursos básicos",
    "Videos de análisis técnico", 
    "Soporte por email",
    "Acceso por 3 meses",
    "Certificado de finalización"
  ]'::jsonb,
  'price_1SDKO8JmSk3VG9oiCLuGoE4s',
  'prod_T9dfdXY3748Dlv',
  true
);

-- 4. INSERTAR PLAN PREMIUM  
INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active)
VALUES (
  gen_random_uuid(),
  'Plan Premium',
  'Acceso completo a todos los cursos avanzados y herramientas profesionales',
  299.99,
  'USD', 
  12,
  '[
    "Acceso a TODOS los cursos",
    "Videos premium y análisis avanzado",
    "Webinars en vivo mensuales",
    "Soporte prioritario 24/7",
    "Herramientas de trading",
    "Comunidad exclusiva",
    "Acceso por 12 meses",
    "Certificación profesional"
  ]'::jsonb,
  'price_1SDKVXJmSk3VG9oiLEm9JOoD',
  'prod_T9dnmdsdbj1ETL',
  true
);

-- 5. INSERTAR PLAN VIP
INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active)
VALUES (
  gen_random_uuid(),
  'Plan VIP Lifetime',
  'Acceso de por vida a todo el contenido actual y futuro, incluyendo mentorías personalizadas',
  999.99,
  'USD',
  NULL,
  '[
    "Acceso ILIMITADO de por vida",
    "TODO el contenido actual y futuro", 
    "Mentorías personalizadas 1:1",
    "Sesiones de trading en vivo",
    "Acceso a estrategias exclusivas",
    "Soporte VIP prioritario",
    "Comunidad VIP exclusiva",
    "Revisión de portfolio personal",
    "Señales de trading premium",
    "Sin fecha de expiración"
  ]'::jsonb,
  'price_1SDKb2JmSk3VG9oiJr1unLZZ',
  'prod_T9dspdTkGGM7Sy',
  true
);

-- 6. VERIFICAR QUE SE INSERTARON
SELECT 
  name,
  price,
  currency,
  stripe_price_id,
  is_active
FROM public.subscription_plans 
WHERE is_active = true
ORDER BY price ASC;

-- 7. VERIFICAR FUNCIÓN RPC
SELECT * FROM get_available_plans_with_content();