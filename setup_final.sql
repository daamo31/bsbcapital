-- Configuración del sistema de contenido usando TUS tablas existentes
-- Solo agregamos las columnas necesarias sin crear nuevas tablas

-- 1. Agregar columnas a course_content para Hotmart
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS content_id TEXT;
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS hotmart_product_id VARCHAR(100);
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS hotmart_video_id VARCHAR(100);
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS hotmart_file_url TEXT;
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS direct_url TEXT;
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS required_access_level VARCHAR(50) DEFAULT 'basic';
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
ALTER TABLE course_content ADD COLUMN IF NOT EXISTS module_id VARCHAR(100);

-- 2. Crear índice único para content_id
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_course_content_content_id'
    ) THEN
        CREATE UNIQUE INDEX idx_course_content_content_id ON course_content(content_id);
    END IF;
END $$;

-- 3. Agregar columnas a user_progress para tracking de videos
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS content_id_ref TEXT;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS time_watched_seconds INTEGER DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER DEFAULT 0;

-- 4. Agregar columnas a user_access para contenido específico
ALTER TABLE user_access ADD COLUMN IF NOT EXISTS content_id_ref TEXT;
ALTER TABLE user_access ADD COLUMN IF NOT EXISTS module_id VARCHAR(100);

-- 5. Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_course_content_module_id ON course_content(module_id);
CREATE INDEX IF NOT EXISTS idx_course_content_access_level ON course_content(required_access_level);
CREATE INDEX IF NOT EXISTS idx_user_progress_content_ref ON user_progress(content_id_ref) WHERE content_id_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_access_content_ref ON user_access(content_id_ref) WHERE content_id_ref IS NOT NULL;