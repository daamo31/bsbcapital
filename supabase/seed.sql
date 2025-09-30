-- Seed data: Planes de membresía iniciales
-- Created: 2024-09-30

-- Limpiar datos existentes (solo para desarrollo)
DELETE FROM content_access;
DELETE FROM user_progress;
DELETE FROM payments;
DELETE FROM user_subscriptions;
DELETE FROM course_content;
DELETE FROM subscription_plans;

-- Insertar 3 planes de membresía
INSERT INTO subscription_plans (id, name, description, price, currency, duration_months, features, is_active) VALUES
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
  true
),
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
  true
),
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
  true
);

-- Insertar contenido de ejemplo (cursos y videos)
WITH plan_ids AS (
  SELECT 
    (SELECT id FROM subscription_plans WHERE name = 'Plan Básico') as basic_id,
    (SELECT id FROM subscription_plans WHERE name = 'Plan Premium') as premium_id,
    (SELECT id FROM subscription_plans WHERE name = 'Plan VIP Lifetime') as vip_id
)
INSERT INTO course_content (id, title, description, content_type, duration_minutes, required_plans, course_id, order_index) 
SELECT 
  gen_random_uuid(),
  title,
  description,
  content_type,
  duration_minutes,
  required_plans,
  course_id,
  order_index
FROM (
  SELECT 
    'Introducción al Trading' as title,
    'Conceptos básicos del trading financiero' as description,
    'video' as content_type,
    45 as duration_minutes,
    ARRAY[plan_ids.basic_id, plan_ids.premium_id, plan_ids.vip_id] as required_plans,
    gen_random_uuid() as course_id,
    1 as order_index
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Análisis Técnico Básico',
    'Fundamentos del análisis técnico y lectura de gráficos',
    'video',
    60,
    ARRAY[plan_ids.basic_id, plan_ids.premium_id, plan_ids.vip_id],
    gen_random_uuid(),
    2
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Gestión de Riesgo',
    'Estrategias para proteger tu capital',
    'video',
    40,
    ARRAY[plan_ids.basic_id, plan_ids.premium_id, plan_ids.vip_id],
    gen_random_uuid(),
    3
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Trading Algorítmico Avanzado',
    'Desarrollo de algoritmos de trading automatizado',
    'video',
    90,
    ARRAY[plan_ids.premium_id, plan_ids.vip_id],
    gen_random_uuid(),
    4
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Estrategias de Arbitraje',
    'Técnicas avanzadas de arbitraje en múltiples mercados',
    'video',
    75,
    ARRAY[plan_ids.premium_id, plan_ids.vip_id],
    gen_random_uuid(),
    5
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Análisis Fundamental Profesional',
    'Evaluación profunda de empresas y mercados',
    'video',
    120,
    ARRAY[plan_ids.premium_id, plan_ids.vip_id],
    gen_random_uuid(),
    6
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Masterclass VIP: Estrategias Exclusivas',
    'Estrategias de trading reservadas para miembros VIP',
    'live',
    180,
    ARRAY[plan_ids.vip_id],
    gen_random_uuid(),
    7
  FROM plan_ids
  
  UNION ALL
  
  SELECT 
    'Sesión de Mentoring Personal',
    'Sesión personalizada de análisis de portfolio',
    'live',
    60,
    ARRAY[plan_ids.vip_id],
    gen_random_uuid(),
    8
  FROM plan_ids
) as content_data;

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
    COALESCE(ca.user_id IS NOT NULL, false) as has_access,
    COALESCE(up.progress_percentage, 0) as progress_percentage
  FROM course_content cc
  LEFT JOIN content_access ca ON cc.id = ca.content_id AND ca.user_id = user_uuid
  LEFT JOIN user_subscriptions us ON ca.subscription_id = us.id AND us.status = 'active'
  LEFT JOIN user_progress up ON cc.id = up.content_id AND up.user_id = user_uuid
  WHERE cc.is_active = true
  ORDER BY cc.order_index ASC;
$$;