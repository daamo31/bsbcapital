-- ================================================================
-- EJECUTAR ESTOS COMANDOS EN TU SUPABASE SQL EDITOR
-- ================================================================
-- Ve a: https://supabase.com/dashboard/project/ietktalvzyykynhdkqhv/sql/new
-- Copia y pega estos comandos uno por uno:

-- 1. INSERTAR PLAN BÁSICO
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
)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- 2. INSERTAR PLAN PREMIUM  
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
)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- 3. INSERTAR PLAN VIP
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
)
ON CONFLICT (stripe_price_id) DO NOTHING;

-- 4. VERIFICAR QUE SE INSERTARON
SELECT 
  name,
  price,
  currency,
  stripe_price_id,
  is_active
FROM public.subscription_plans 
WHERE is_active = true
ORDER BY price ASC;

-- 5. INSERTAR CONTENIDO DE EJEMPLO
INSERT INTO public.course_content (id, title, description, content_type, duration_minutes, required_plans, course_id, order_index, is_free)
VALUES 
(gen_random_uuid(), 'Bienvenida a BSB Capital', 'Video de introducción y bienvenida al mundo del trading', 'video', 15, '{}', gen_random_uuid(), 0, true),
(gen_random_uuid(), 'Introducción al Trading', 'Conceptos básicos del trading financiero', 'video', 45, (SELECT ARRAY[id] FROM public.subscription_plans WHERE name = 'Plan Básico'), gen_random_uuid(), 1, false),
(gen_random_uuid(), 'Análisis Técnico Básico', 'Fundamentos del análisis técnico y lectura de gráficos', 'video', 60, (SELECT ARRAY[id] FROM public.subscription_plans WHERE name = 'Plan Básico'), gen_random_uuid(), 2, false)
ON CONFLICT DO NOTHING;

-- 6. VERIFICAR CONTENIDO
SELECT 
  title,
  content_type,
  duration_minutes,
  is_free
FROM public.course_content
ORDER BY order_index ASC;