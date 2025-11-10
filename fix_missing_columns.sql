-- Agregar columnas faltantes a la tabla consultations
-- Ejecutar en el SQL Editor de Supabase

-- 1. Agregar columna updated_at si no existe
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Agregar otras columnas que pueden estar faltando (según el formulario)
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS form_completed_at TIMESTAMPTZ;

-- 3. Actualizar todos los registros existentes con updated_at
UPDATE consultations 
SET updated_at = COALESCE(updated_at, created_at, NOW())
WHERE updated_at IS NULL;

-- 4. Verificar que las columnas se crearon correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'consultations' 
  AND column_name IN ('updated_at', 'form_completed_at', 'created_at')
ORDER BY column_name;

-- 5. Verificar contenido de una consulta específica
SELECT 
    id,
    user_id,
    client_name,
    client_email,
    status,
    created_at,
    updated_at,
    form_completed_at
FROM consultations 
WHERE id = 53; -- Reemplaza con el ID problemático