-- Script para crear políticas RLS correctas para la tabla consultations
-- Ejecutar en el SQL Editor de Supabase

-- 1. Habilitar RLS en la tabla (si no está habilitado)
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- 2. Crear política para SELECT (lectura) - usuarios pueden ver sus propias consultas
CREATE POLICY "Users can view own consultations" ON consultations
    FOR SELECT USING (auth.uid() = user_id);

-- 3. Crear política para UPDATE (actualización) - usuarios pueden actualizar sus propias consultas
CREATE POLICY "Users can update own consultations" ON consultations
    FOR UPDATE USING (auth.uid() = user_id);

-- 4. Crear política para INSERT (inserción) - usuarios pueden crear consultas para sí mismos
CREATE POLICY "Users can insert own consultations" ON consultations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Política adicional para administradores (opcional)
-- CREATE POLICY "Admins can manage all consultations" ON consultations
--     FOR ALL USING (
--         EXISTS (
--             SELECT 1 FROM profiles 
--             WHERE profiles.id = auth.uid() 
--             AND profiles.role = 'admin'
--         )
--     );

-- 6. Verificar que las políticas se crearon correctamente
SELECT 
    policyname,
    cmd,
    permissive,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'consultations'
ORDER BY cmd;

-- 7. Verificar permisos de la tabla
\dp consultations;