-- Datos de ejemplo para el sistema completo de membresías y consultas
-- Ejecutar después de las migraciones principales

-- Insertar planes de suscripción con límites de consulta
INSERT INTO membership_consultation_limits (plan_id, monthly_limit, quarterly_limit, yearly_limit, allowed_consultation_types, max_duration_minutes, booking_priority) VALUES
-- Plan Basic (limitado)
((SELECT id FROM subscription_plans WHERE name = 'Basic' LIMIT 1), 1, 3, 10, ARRAY['General Consultation'], 30, 1),
-- Plan Premium (más consultas)
((SELECT id FROM subscription_plans WHERE name = 'Premium' LIMIT 1), 3, 10, 36, ARRAY['Investment Strategy', 'Portfolio Review', 'General Consultation'], 60, 2),
-- Plan Elite (acceso completo)
((SELECT id FROM subscription_plans WHERE name = 'Elite' LIMIT 1), 0, 0, 0, ARRAY['Investment Strategy', 'Portfolio Review', 'Risk Management', 'Technical Analysis', 'Algorithmic Trading', 'General Consultation'], 60, 3);

-- Insertar disponibilidad de consultores (horario estándar)
INSERT INTO consultant_availability (consultant_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active) VALUES
-- Horario principal (usuario admin o consultor principal)
((SELECT id FROM auth.users WHERE email = 'admin@bsbcapital.io' LIMIT 1), 1, '09:00', '17:00', 30, true), -- Lunes
((SELECT id FROM auth.users WHERE email = 'admin@bsbcapital.io' LIMIT 1), 2, '09:00', '17:00', 30, true), -- Martes
((SELECT id FROM auth.users WHERE email = 'admin@bsbcapital.io' LIMIT 1), 3, '09:00', '17:00', 30, true), -- Miércoles
((SELECT id FROM auth.users WHERE email = 'admin@bsbcapital.io' LIMIT 1), 4, '09:00', '17:00', 30, true), -- Jueves
((SELECT id FROM auth.users WHERE email = 'admin@bsbcapital.io' LIMIT 1), 5, '09:00', '17:00', 30, true); -- Viernes

-- Datos de ejemplo para contenido de academia
INSERT INTO course_content (title, description, content_type, thumbnail_url, duration_minutes, order_index, required_plans, course_id, is_active) VALUES
-- Curso básico (accesible para todos los planes)
('Introducción a las Inversiones', 'Conceptos fundamentales del mundo de las inversiones', 'video', 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3', 45, 1, '{}', 'curso-basico', true),
('Diversificación de Carteras', 'Aprende a diversificar tu cartera de inversiones', 'video', 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44', 38, 2, '{}', 'curso-basico', true),
('Gestión de Riesgo Básica', 'Principios fundamentales de gestión de riesgo', 'document', null, 25, 3, '{}', 'curso-basico', true),

-- Curso avanzado (solo para Premium y Elite)
('Análisis Técnico Avanzado', 'Técnicas avanzadas de análisis de mercados', 'video', 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f', 65, 1, ARRAY[(SELECT id FROM subscription_plans WHERE name = 'Premium'), (SELECT id FROM subscription_plans WHERE name = 'Elite')], 'curso-avanzado', true),
('Trading Algorítmico', 'Desarrollo de algoritmos de trading automatizado', 'video', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71', 75, 2, ARRAY[(SELECT id FROM subscription_plans WHERE name = 'Premium'), (SELECT id FROM subscription_plans WHERE name = 'Elite')], 'curso-avanzado', true),

-- Curso élite (solo para Elite)
('Gestión de Fondos Institucionales', 'Estrategias de gestión para grandes carteras', 'video', 'https://images.unsplash.com/photo-1554224155-6726b3ff858f', 90, 1, ARRAY[(SELECT id FROM subscription_plans WHERE name = 'Elite')], 'curso-elite', true),
('Derivados y Estrategias Complejas', 'Uso avanzado de derivados financieros', 'live', null, 120, 2, ARRAY[(SELECT id FROM subscription_plans WHERE name = 'Elite')], 'curso-elite', true);

-- Datos de ejemplo para BSB Maker preregistrations
INSERT INTO bsb_maker_preregistrations (name, email, experience_level, created_at) VALUES
('Ana García', 'ana.garcia@email.com', 'intermediate', NOW() - INTERVAL '5 days'),
('Carlos López', 'carlos.lopez@email.com', 'beginner', NOW() - INTERVAL '3 days'),
('María Rodríguez', 'maria.rodriguez@email.com', 'advanced', NOW() - INTERVAL '1 day'),
('Pedro Martín', 'pedro.martin@email.com', 'intermediate', NOW() - INTERVAL '2 hours'),
('Laura Sánchez', 'laura.sanchez@email.com', 'beginner', NOW() - INTERVAL '30 minutes');

-- Ejemplo de consulta programada para demostrar el sistema
INSERT INTO consultations (
  user_id, 
  title, 
  description, 
  consultation_type, 
  duration_minutes, 
  scheduled_at, 
  status, 
  client_name, 
  client_email, 
  consultation_goals
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Consultoría: Estrategia de Inversión',
  'Revisión de cartera y estrategia de inversión personalizada',
  'investment',
  60,
  NOW() + INTERVAL '3 days' + INTERVAL '10 hours', -- 3 días a las 10:00
  'confirmed',
  'Cliente Ejemplo',
  'cliente@ejemplo.com',
  'Optimizar mi cartera actual y desarrollar una estrategia a largo plazo'
);

-- Comentarios para el desarrollo
COMMENT ON TABLE consultations IS 'Tabla principal para gestión de consultas con calendario inteligente';
COMMENT ON TABLE consultant_availability IS 'Define la disponibilidad recurrente de los consultores';
COMMENT ON TABLE consultant_unavailability IS 'Excepciones específicas de disponibilidad (vacaciones, etc.)';
COMMENT ON TABLE membership_consultation_limits IS 'Límites de consultas por tipo de membresía';

-- Verificaciones de datos insertados
SELECT 'Límites de consulta configurados:' as info;
SELECT 
  sp.name as plan_name,
  mcl.monthly_limit,
  mcl.allowed_consultation_types,
  mcl.max_duration_minutes
FROM membership_consultation_limits mcl
JOIN subscription_plans sp ON mcl.plan_id = sp.id;

SELECT 'Contenido de academia disponible:' as info;
SELECT 
  title,
  content_type,
  duration_minutes,
  CASE 
    WHEN array_length(required_plans, 1) IS NULL THEN 'Público'
    ELSE 'Requiere membresía premium'
  END as access_level
FROM course_content
WHERE is_active = true
ORDER BY course_id, order_index;

SELECT 'Preregistros BSB Maker recientes:' as info;
SELECT 
  name,
  email,
  experience_level,
  created_at
FROM bsb_maker_preregistrations
ORDER BY created_at DESC
LIMIT 5;