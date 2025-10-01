-- ================================================================
-- MIGRACIÓN DE ARREGLO: Agregar columnas faltantes
-- Fecha: 01/10/2024
-- Descripción: Agrega columnas que faltan en las tablas existentes
-- ================================================================

-- Agregar columnas faltantes a course_content
ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS video_url TEXT;

ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS pdf_url TEXT;

ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS content_url TEXT;

ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS section_id UUID;

ALTER TABLE public.course_content 
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Agregar columnas faltantes a subscription_plans
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);

ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS max_users INTEGER;

-- Agregar columnas faltantes a user_subscriptions
ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.user_subscriptions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Agregar columnas faltantes a content_access
ALTER TABLE public.content_access 
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.content_access 
ADD COLUMN IF NOT EXISTS access_count INTEGER DEFAULT 0;

ALTER TABLE public.content_access 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE public.content_access 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Agregar columnas faltantes a user_progress
ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS time_watched_seconds INTEGER DEFAULT 0;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS quiz_score INTEGER;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS bookmarks JSONB DEFAULT '[]'::jsonb;

ALTER TABLE public.user_progress 
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Agregar columnas faltantes a payments
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(255);

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS refund_amount DECIMAL(10,2);

-- Crear índices faltantes
CREATE INDEX IF NOT EXISTS idx_course_content_free ON public.course_content(is_free) WHERE is_free = true;
CREATE INDEX IF NOT EXISTS idx_course_content_tags ON public.course_content USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_content_access_active ON public.content_access(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_progress_percentage ON public.user_progress(user_id, progress_percentage);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON public.payments(external_transaction_id);

-- Actualizar tipos de datos si es necesario
ALTER TABLE public.user_progress 
ALTER COLUMN time_watched_minutes TYPE INTEGER USING time_watched_minutes::INTEGER;

-- Migrar datos de time_watched_minutes a time_watched_seconds
UPDATE public.user_progress 
SET time_watched_seconds = COALESCE(time_watched_minutes * 60, 0)
WHERE time_watched_seconds = 0 AND time_watched_minutes IS NOT NULL;

-- Notification
DO $$
BEGIN
    RAISE NOTICE 'MIGRACIÓN DE ARREGLO COMPLETADA';
    RAISE NOTICE '- Columnas agregadas a course_content, subscription_plans, user_subscriptions, content_access, user_progress';
    RAISE NOTICE '- Índices creados';
    RAISE NOTICE '- Datos migrados';
END $$;