-- ================================================================
-- FUNCIONES PARA CONTROL DE ACCESO POR MEMBRESÍA
-- ================================================================
-- Ejecutar en Supabase SQL Editor

-- 1. FUNCIÓN: Verificar si usuario tiene acceso a contenido específico
CREATE OR REPLACE FUNCTION check_user_content_access(
  user_id_param UUID,
  content_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  has_access BOOLEAN := FALSE;
  required_plan_ids UUID[];
  user_plan_id UUID;
BEGIN
  -- Obtener los planes requeridos para este contenido
  SELECT required_plans INTO required_plan_ids
  FROM course_content 
  WHERE id = content_id_param AND is_active = true;
  
  -- Si no hay planes requeridos específicos, permitir acceso
  IF required_plan_ids IS NULL OR array_length(required_plan_ids, 1) = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Obtener el plan activo del usuario
  SELECT plan_id INTO user_plan_id
  FROM user_subscriptions 
  WHERE user_id = user_id_param 
    AND status = 'active' 
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Verificar si el plan del usuario está en los planes requeridos
  IF user_plan_id = ANY(required_plan_ids) THEN
    has_access := TRUE;
  END IF;
  
  RETURN has_access;
END;
$$;

-- 2. FUNCIÓN: Obtener contenido accesible para un usuario
CREATE OR REPLACE FUNCTION get_user_accessible_content(user_id_param UUID)
RETURNS TABLE (
  content_id UUID,
  title VARCHAR,
  description TEXT,
  content_type VARCHAR,
  duration_minutes INTEGER,
  thumbnail_url TEXT,
  course_id UUID,
  progress_percentage INTEGER,
  has_access BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cc.id as content_id,
    cc.title,
    cc.description,
    cc.content_type,
    cc.duration_minutes,
    cc.thumbnail_url,
    cc.course_id,
    COALESCE(up.progress_percentage, 0) as progress_percentage,
    check_user_content_access(user_id_param, cc.id) as has_access
  FROM course_content cc
  LEFT JOIN user_progress up ON up.user_id = user_id_param AND up.content_id = cc.id
  WHERE cc.is_active = true
  ORDER BY cc.course_id, cc.order_index;
END;
$$;

-- 3. FUNCIÓN: Crear suscripción después de pago exitoso
CREATE OR REPLACE FUNCTION create_user_subscription(
  user_id_param UUID,
  plan_id_param UUID,
  stripe_subscription_id_param VARCHAR DEFAULT NULL,
  stripe_customer_id_param VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  subscription_id UUID;
  plan_duration INTEGER;
  expires_date TIMESTAMP;
BEGIN
  -- Obtener duración del plan
  SELECT duration_months INTO plan_duration
  FROM subscription_plans 
  WHERE id = plan_id_param;
  
  -- Calcular fecha de expiración
  IF plan_duration IS NOT NULL THEN
    expires_date := NOW() + (plan_duration || ' months')::INTERVAL;
  ELSE
    expires_date := NULL; -- Lifetime
  END IF;
  
  -- Cancelar suscripciones activas anteriores
  UPDATE user_subscriptions 
  SET status = 'cancelled', updated_at = NOW()
  WHERE user_id = user_id_param AND status = 'active';
  
  -- Crear nueva suscripción
  INSERT INTO user_subscriptions (
    user_id,
    plan_id,
    status,
    stripe_subscription_id,
    stripe_customer_id,
    expires_at
  ) VALUES (
    user_id_param,
    plan_id_param,
    'active',
    stripe_subscription_id_param,
    stripe_customer_id_param,
    expires_date
  ) RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$;

-- 4. FUNCIÓN: Registrar progreso del usuario
CREATE OR REPLACE FUNCTION update_user_progress(
  user_id_param UUID,
  content_id_param UUID,
  progress_percentage_param INTEGER,
  time_watched_param INTEGER DEFAULT 0
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar acceso
  IF NOT check_user_content_access(user_id_param, content_id_param) THEN
    RAISE EXCEPTION 'Usuario no tiene acceso a este contenido';
  END IF;
  
  -- Actualizar o insertar progreso
  INSERT INTO user_progress (
    user_id,
    content_id,
    progress_percentage,
    time_watched_minutes,
    completed_at,
    last_accessed_at
  ) VALUES (
    user_id_param,
    content_id_param,
    progress_percentage_param,
    time_watched_param,
    CASE WHEN progress_percentage_param >= 100 THEN NOW() ELSE NULL END,
    NOW()
  )
  ON CONFLICT (user_id, content_id) 
  DO UPDATE SET
    progress_percentage = GREATEST(user_progress.progress_percentage, progress_percentage_param),
    time_watched_minutes = user_progress.time_watched_minutes + time_watched_param,
    completed_at = CASE 
      WHEN progress_percentage_param >= 100 AND user_progress.completed_at IS NULL 
      THEN NOW() 
      ELSE user_progress.completed_at 
    END,
    last_accessed_at = NOW(),
    updated_at = NOW();
END;
$$;

-- 5. PERMISOS para las funciones
GRANT EXECUTE ON FUNCTION check_user_content_access(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_accessible_content(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_subscription(UUID, UUID, VARCHAR, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_progress(UUID, UUID, INTEGER, INTEGER) TO authenticated;