-- ================================================================
-- APLICAR DATOS SEED MANUALMENTE
-- Fecha: 01/10/2024
-- Descripción: Script simplificado para insertar datos esenciales
-- ================================================================

-- Insertar planes si no existen
INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE stripe_price_id = 'price_1SDKO8JmSk3VG9oiCLuGoE4s');

INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE stripe_price_id = 'price_1SDKVXJmSk3VG9oiLEm9JOoD');

INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active) 
SELECT 
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
WHERE NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE stripe_price_id = 'price_1SDKb2JmSk3VG9oiJr1unLZZ');

-- Insertar contenido de ejemplo
WITH plan_ids AS (
  SELECT 
    (SELECT id FROM public.subscription_plans WHERE name = 'Plan Básico') as basic_id,
    (SELECT id FROM public.subscription_plans WHERE name = 'Plan Premium') as premium_id,
    (SELECT id FROM public.subscription_plans WHERE name = 'Plan VIP Lifetime') as vip_id
),
course_ids AS (
  SELECT 
    gen_random_uuid() as curso_basico_id,
    gen_random_uuid() as curso_avanzado_id,
    gen_random_uuid() as curso_vip_id
)
INSERT INTO public.course_content (id, title, description, content_type, duration_minutes, required_plans, course_id, order_index, is_free) 
SELECT * FROM (
  VALUES 
    (gen_random_uuid(), 'Bienvenida a BSB Capital', 'Video de introducción y bienvenida al mundo del trading', 'video', 15, '{}', (SELECT curso_basico_id FROM course_ids), 0, true),
    (gen_random_uuid(), 'Introducción al Trading', 'Conceptos básicos del trading financiero', 'video', 45, ARRAY[(SELECT basic_id FROM plan_ids), (SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)], (SELECT curso_basico_id FROM course_ids), 1, false),
    (gen_random_uuid(), 'Análisis Técnico Básico', 'Fundamentos del análisis técnico y lectura de gráficos', 'video', 60, ARRAY[(SELECT basic_id FROM plan_ids), (SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)], (SELECT curso_basico_id FROM course_ids), 2, false),
    (gen_random_uuid(), 'Trading Algorítmico Avanzado', 'Desarrollo de algoritmos de trading automatizado', 'video', 90, ARRAY[(SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)], (SELECT curso_avanzado_id FROM course_ids), 4, false),
    (gen_random_uuid(), 'Masterclass VIP: Estrategias Exclusivas', 'Estrategias de trading reservadas para miembros VIP', 'live', 180, ARRAY[(SELECT vip_id FROM plan_ids)], (SELECT curso_vip_id FROM course_ids), 7, false)
) AS t(id, title, description, content_type, duration_minutes, required_plans, course_id, order_index, is_free)
WHERE NOT EXISTS (SELECT 1 FROM public.course_content WHERE title = t.title);

-- Mostrar resumen
DO $$
DECLARE
    plan_count INTEGER;
    content_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM public.subscription_plans WHERE is_active = true;
    SELECT COUNT(*) INTO content_count FROM public.course_content;
    
    RAISE NOTICE 'DATOS SEED APLICADOS EXITOSAMENTE:';
    RAISE NOTICE '- Planes de membresía: %', plan_count;
    RAISE NOTICE '- Contenido agregado: %', content_count;
    RAISE NOTICE '- Sistema listo para usar';
END $$;