-- ================================================================
-- SEED DATA: Sistema de Membresías BSB Capital
-- Fecha: 01/10/2024
-- Descripción: Datos iniciales para el sistema de membresías
--              Compatible con esquema existente y nuevo
-- ================================================================

-- Limpiar datos del nuevo sistema (solo para desarrollo)
DELETE FROM public.content_access;
DELETE FROM public.user_progress;
DELETE FROM public.payments;
DELETE FROM public.user_subscriptions;
DELETE FROM public.course_content;
DELETE FROM public.subscription_plans;

-- ================================================================
-- 1. INSERTAR PLANES DE MEMBRESÍA
-- ================================================================
INSERT INTO public.subscription_plans (id, name, description, price, currency, duration_months, features, stripe_price_id, stripe_product_id, is_active) VALUES

-- Plan Básico (PLAN TRADER PRO)
(
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
),

-- Plan Premium (PREMIUM INVESTOR ANUAL)
(
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
),

-- Plan VIP (WEALTH MEMBERSHIP)
(
  gen_random_uuid(),
  'Plan VIP Lifetime',
  'Acceso de por vida a todo el contenido actual y futuro, incluyendo mentorías personalizadas',
  999.99,
  'USD',
  NULL, -- NULL = lifetime
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

-- ================================================================
-- 2. INSERTAR CONTENIDO DE CURSOS
-- ================================================================

-- Obtener IDs de planes para asignar contenido
WITH plan_ids AS (
  SELECT 
    (SELECT id FROM public.subscription_plans WHERE name = 'Plan Básico') as basic_id,
    (SELECT id FROM public.subscription_plans WHERE name = 'Plan Premium') as premium_id,
    (SELECT id FROM public.subscription_plans WHERE name = 'Plan VIP Lifetime') as vip_id
),
-- Generar UUIDs para cursos
course_ids AS (
  SELECT 
    gen_random_uuid() as curso_basico_id,
    gen_random_uuid() as curso_avanzado_id,
    gen_random_uuid() as curso_vip_id
)
INSERT INTO public.course_content (id, title, description, content_type, duration_minutes, required_plans, course_id, order_index, is_free) 
  VALUES

-- Contenido GRATUITO (accesible sin suscripción)
(
  gen_random_uuid(),
  'Bienvenida a BSB Capital',
  'Video de introducción y bienvenida al mundo del trading',
  'video',
  15,
  '{}',  -- Sin planes requeridos = contenido gratuito
  (SELECT curso_basico_id FROM course_ids),
  0,
  true  -- is_free = true
),

-- Contenido BÁSICO (Plan Básico y superiores)
(
  gen_random_uuid(),
  'Introducción al Trading',
  'Conceptos básicos del trading financiero',
  'video',
  45,
  ARRAY[(SELECT basic_id FROM plan_ids), (SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)],
  (SELECT curso_basico_id FROM course_ids),
  1,
  false
),
(
  gen_random_uuid(),
  'Análisis Técnico Básico',
  'Fundamentos del análisis técnico y lectura de gráficos',
  'video',
  60,
  ARRAY[(SELECT basic_id FROM plan_ids), (SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)],
  (SELECT curso_basico_id FROM course_ids),
  2,
  false
),
(
  gen_random_uuid(),
  'Gestión de Riesgo',
  'Estrategias para proteger tu capital',
  'video',
  40,
  ARRAY[(SELECT basic_id FROM plan_ids), (SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)],
  (SELECT curso_basico_id FROM course_ids),
  3,
  false
),

-- Contenido PREMIUM (Plan Premium y VIP)
(
  gen_random_uuid(),
  'Trading Algorítmico Avanzado',
  'Desarrollo de algoritmos de trading automatizado',
  'video',
  90,
  ARRAY[(SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)],
  (SELECT curso_avanzado_id FROM course_ids),
  4,
  false
),
(
  gen_random_uuid(),
  'Estrategias de Arbitraje',
  'Técnicas avanzadas de arbitraje en múltiples mercados',
  'video',
  75,
  ARRAY[(SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)],
  (SELECT curso_avanzado_id FROM course_ids),
  5,
  false
),
(
  gen_random_uuid(),
  'Análisis Fundamental Profesional',
  'Evaluación profunda de empresas y mercados',
  'video',
  120,
  ARRAY[(SELECT premium_id FROM plan_ids), (SELECT vip_id FROM plan_ids)],
  (SELECT curso_avanzado_id FROM course_ids),
  6,
  false
),

-- Contenido EXCLUSIVO VIP
(
  gen_random_uuid(),
  'Masterclass VIP: Estrategias Exclusivas',
  'Estrategias de trading reservadas para miembros VIP',
  'live',
  180,
  ARRAY[(SELECT vip_id FROM plan_ids)],
  (SELECT curso_vip_id FROM course_ids),
  7,
  false
),
(
  gen_random_uuid(),
  'Sesión de Mentoring Personal',
  'Sesión personalizada de análisis de portfolio',
  'live',
  60,
  ARRAY[(SELECT vip_id FROM plan_ids)],
  (SELECT curso_vip_id FROM course_ids),
  8,
  false
);

-- ================================================================
-- 3. FUNCIONES AUXILIARES MEJORADAS
-- ================================================================

-- Función para obtener planes disponibles con conteo de contenido
CREATE OR REPLACE FUNCTION get_available_plans_with_content()
RETURNS TABLE(
  id UUID,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  currency VARCHAR,
  duration_months INTEGER,
  features JSONB,
  content_count BIGINT,
  stripe_price_id VARCHAR
) 
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT 
    sp.id,
    sp.name,
    sp.description,
    sp.price,
    sp.currency,
    sp.duration_months,
    sp.features,
    COUNT(cc.id) as content_count,
    sp.stripe_price_id
  FROM public.subscription_plans sp
  LEFT JOIN public.course_content cc ON sp.id = ANY(cc.required_plans)
  WHERE sp.is_active = true
  GROUP BY sp.id, sp.name, sp.description, sp.price, sp.currency, 
           sp.duration_months, sp.features, sp.stripe_price_id
  ORDER BY sp.price ASC;
$$;

-- Función mejorada para contenido accesible
CREATE OR REPLACE FUNCTION get_user_content_access(user_uuid UUID)
RETURNS TABLE(
  content_id UUID,
  title VARCHAR,
  description TEXT,
  content_type VARCHAR,
  duration_minutes INTEGER,
  has_access BOOLEAN,
  progress_percentage INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_free BOOLEAN
)
LANGUAGE SQL
SECURITY DEFINER
AS $$

-- Crear función para obtener planes disponibles
CREATE OR REPLACE FUNCTION get_available_plans()
RETURNS TABLE(
  id UUID,
  name VARCHAR,
  description TEXT,
  price DECIMAL,
  currency VARCHAR,
  duration_months INTEGER,
  features JSONB,
  content_count BIGINT
) 
LANGUAGE SQL
AS $$
  SELECT 
    sp.id,
    sp.name,
    sp.description,
    sp.price,
    sp.currency,
    sp.duration_months,
    sp.features,
    COUNT(cc.id) as content_count
  FROM subscription_plans sp
  LEFT JOIN course_content cc ON sp.id = ANY(cc.required_plans)
  WHERE sp.is_active = true
  GROUP BY sp.id, sp.name, sp.description, sp.price, sp.currency, sp.duration_months, sp.features
  ORDER BY sp.price ASC;
$$;

-- Función para verificar qué puede acceder un usuario
CREATE OR REPLACE FUNCTION get_user_accessible_content(user_uuid UUID)
RETURNS TABLE(
  content_id UUID,
  title VARCHAR,
  description TEXT,
  content_type VARCHAR,
  duration_minutes INTEGER,
  has_access BOOLEAN,
  progress_percentage INTEGER
)
LANGUAGE SQL
AS $$
  SELECT 
    cc.id as content_id,
    cc.title,
    cc.description,
    cc.content_type,
    cc.duration_minutes,
    COALESCE(ca.user_id IS NOT NULL, cc.is_free) as has_access,
    COALESCE(up.progress_percentage, 0) as progress_percentage,
    up.completed_at,
    cc.is_free
  FROM public.course_content cc
  LEFT JOIN public.content_access ca ON cc.id = ca.content_id 
      AND ca.user_id = user_uuid 
      AND ca.is_active = true
      AND (ca.expires_at IS NULL OR ca.expires_at > now())
  LEFT JOIN public.user_progress up ON cc.id = up.content_id AND up.user_id = user_uuid
  WHERE cc.is_active = true 
  AND (ca.user_id IS NOT NULL OR cc.is_free = true)
  ORDER BY cc.order_index ASC;
$$;

-- ================================================================
-- 4. DATOS DE EJEMPLO PARA TESTING
-- ================================================================

-- Insertar usuario de ejemplo (solo si no existe)
DO $$
DECLARE
    test_user_id UUID;
    basic_plan_id UUID;
BEGIN
    -- Crear usuario de prueba si no existe
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        role
    )
    VALUES (
        gen_random_uuid(),
        'test@bsbcapital.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Usuario Test"}',
        false,
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING
    RETURNING id INTO test_user_id;

    -- Si el usuario ya existía, obtener su ID
    IF test_user_id IS NULL THEN
        SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@bsbcapital.com';
    END IF;

    -- Obtener ID del plan básico
    SELECT id INTO basic_plan_id FROM public.subscription_plans WHERE name = 'Plan Básico';

    -- Crear suscripción de ejemplo
    INSERT INTO public.user_subscriptions (
        user_id,
        plan_id,
        status,
        started_at,
        ends_at
    )
    VALUES (
        test_user_id,
        basic_plan_id,
        'active',
        now(),
        now() + interval '3 months'
    )
    ON CONFLICT DO NOTHING;

    -- Crear acceso al contenido automáticamente
    INSERT INTO public.content_access (
        user_id,
        content_id,
        access_type,
        granted_at
    )
    SELECT 
        test_user_id,
        cc.id,
        'subscription',
        now()
    FROM public.course_content cc
    WHERE basic_plan_id = ANY(cc.required_plans) OR cc.is_free = true
    ON CONFLICT (user_id, content_id) DO NOTHING;

END $$;

-- ================================================================
-- 5. VERIFICACIONES FINALES
-- ================================================================

-- Mostrar resumen de datos insertados
DO $$
DECLARE
    plan_count INTEGER;
    content_count INTEGER;
    free_content_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO plan_count FROM public.subscription_plans WHERE is_active = true;
    SELECT COUNT(*) INTO content_count FROM public.course_content WHERE is_active = true;
    SELECT COUNT(*) INTO free_content_count FROM public.course_content WHERE is_free = true;
    
    RAISE NOTICE 'SEED DATA COMPLETADO EXITOSAMENTE:';
    RAISE NOTICE '- Planes activos: %', plan_count;
    RAISE NOTICE '- Contenido total: %', content_count;
    RAISE NOTICE '- Contenido gratuito: %', free_content_count;
    RAISE NOTICE '- Funciones creadas: get_available_plans_with_content(), get_user_content_access()';
END $$;

-- ================================================================
-- FIN DEL SEED DATA
-- ================================================================
  FROM course_content cc
  LEFT JOIN content_access ca ON cc.id = ca.content_id AND ca.user_id = user_uuid
  LEFT JOIN user_subscriptions us ON ca.subscription_id = us.id AND us.status = 'active'
  LEFT JOIN user_progress up ON cc.id = up.content_id AND up.user_id = user_uuid
  WHERE cc.is_active = true
  ORDER BY cc.order_index ASC;
$$;