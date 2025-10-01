-- ================================================================
-- MIGRACIÓN SIMPLIFICADA: Solo funciones esenciales
-- Fecha: 01/10/2024  
-- Descripción: Funciones mínimas para el sistema de membresías
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

-- Función para verificar acceso a contenido
CREATE OR REPLACE FUNCTION check_user_content_access(user_uuid UUID, content_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.content_access ca
        WHERE ca.user_id = user_uuid 
        AND ca.content_id = content_uuid 
        AND (ca.expires_at IS NULL OR ca.expires_at > now())
    ) OR EXISTS (
        SELECT 1 FROM public.course_content cc
        WHERE cc.id = content_uuid AND cc.is_free = true
    );
$$;

-- Función para obtener contenido accesible del usuario
CREATE OR REPLACE FUNCTION get_user_accessible_content(user_uuid UUID)
RETURNS TABLE(
    content_id UUID,
    title VARCHAR,
    description TEXT,
    content_type VARCHAR,
    duration_minutes INTEGER,
    video_url TEXT,
    thumbnail_url TEXT,
    has_access BOOLEAN,
    progress_percentage INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    SELECT 
        cc.id as content_id,
        cc.title,
        cc.description,
        cc.content_type,
        cc.duration_minutes,
        cc.video_url,
        cc.thumbnail_url,
        COALESCE(ca.user_id IS NOT NULL, cc.is_free) as has_access,
        COALESCE(up.progress_percentage, 0) as progress_percentage,
        up.completed_at
    FROM public.course_content cc
    LEFT JOIN public.content_access ca ON cc.id = ca.content_id 
        AND ca.user_id = user_uuid 
        AND (ca.expires_at IS NULL OR ca.expires_at > now())
    LEFT JOIN public.user_progress up ON cc.id = up.content_id AND up.user_id = user_uuid
    WHERE (ca.user_id IS NOT NULL OR cc.is_free = true)
    ORDER BY cc.order_index ASC;
$$;

-- Comentarios
COMMENT ON FUNCTION get_available_plans_with_content() IS 'Obtiene planes disponibles con conteo de contenido';
COMMENT ON FUNCTION check_user_content_access(UUID, UUID) IS 'Verifica si un usuario tiene acceso a contenido específico';
COMMENT ON FUNCTION get_user_accessible_content(UUID) IS 'Obtiene todo el contenido accesible para un usuario';

-- Notificación
DO $$
BEGIN
    RAISE NOTICE 'FUNCIONES ESENCIALES CREADAS EXITOSAMENTE';
    RAISE NOTICE '- get_available_plans_with_content()';
    RAISE NOTICE '- check_user_content_access()';
    RAISE NOTICE '- get_user_accessible_content()';
END $$;