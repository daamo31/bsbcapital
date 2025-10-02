-- Script para configurar datos de prueba del sistema de membresías
-- Ejecutar estos comandos en el SQL Editor de Supabase

-- 1. Insertar contenidos de ejemplo (si no existen)
INSERT INTO content_items (id, title, type, description, content_url, tags, created_at) 
VALUES 
  ('module_1', 'Fundamentos de gestión del riesgo', 'module', 'Domina las bases para proteger tu capital', '/modules/risk-management', '["finanzas","riesgo","basico"]', NOW()),
  ('module_2', 'Fiscalidad y cumplimiento (crypto)', 'module', 'Entiende tus obligaciones fiscales con criptoactivos', '/modules/crypto-taxes', '["crypto","fiscalidad","legal"]', NOW()),
  ('module_3', 'Operativa con derivados', 'module', 'Visión institucional de futuros y opciones', '/modules/derivatives', '["derivados","avanzado","institucional"]', NOW()),
  ('video_1', 'Introducción al Risk Management', 'video', 'Video introductorio sobre gestión de riesgo', '/videos/intro-risk.mp4', '["video","introduccion"]', NOW()),
  ('video_2', 'Análisis de mercados avanzado', 'video', 'Técnicas avanzadas de análisis', '/videos/advanced-analysis.mp4', '["video","avanzado"]', NOW()),
  ('academia', 'Academia BSB Capital', 'course', 'Acceso completo a la academia', '/academia', '["curso","completo"]', NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Configurar restricciones de acceso por plan
INSERT INTO subscription_plan_content (plan_id, content_id, access_level, created_at)
VALUES 
  -- Plan Basic (id: 1) - Solo módulo básico
  (1, 'module_1', 'full', NOW()),
  (1, 'video_1', 'full', NOW()),
  
  -- Plan Standard (id: 2) - Módulos básicos + fiscalidad
  (2, 'module_1', 'full', NOW()),
  (2, 'module_2', 'full', NOW()),
  (2, 'video_1', 'full', NOW()),
  (2, 'video_2', 'preview', NOW()),
  
  -- Plan Premium (id: 3) - Todo el contenido
  (3, 'module_1', 'full', NOW()),
  (3, 'module_2', 'full', NOW()),
  (3, 'module_3', 'full', NOW()),
  (3, 'video_1', 'full', NOW()),
  (3, 'video_2', 'full', NOW()),
  (3, 'academia', 'full', NOW())
ON CONFLICT (plan_id, content_id) DO NOTHING;

-- 3. Crear un usuario de prueba con suscripción activa (reemplaza el email por uno real)
-- NOTA: Primero necesitas un usuario autenticado en tu sistema
-- Puedes ejecutar esto después de crear un usuario de prueba:

/*
-- Ejemplo para asignar suscripción a un usuario específico:
INSERT INTO user_subscriptions (
  user_id, 
  plan_id, 
  status, 
  starts_at, 
  expires_at,
  stripe_subscription_id
) VALUES (
  '00000000-0000-0000-0000-000000000000', -- Reemplazar con UUID real del usuario
  3, -- Plan Premium
  'active',
  NOW(),
  NOW() + INTERVAL '1 month',
  'sub_test_12345'
);
*/

-- 4. Verificar que las funciones RPC están creadas
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'check_user_content_access',
  'get_user_accessible_content', 
  'create_user_subscription',
  'update_user_progress'
);

-- 5. Ejemplo de uso de las funciones:
-- SELECT check_user_content_access('user-uuid-here', 'module_1');
-- SELECT * FROM get_user_accessible_content('user-uuid-here');