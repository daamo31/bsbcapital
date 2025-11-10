-- Script para verificar políticas RLS en la tabla consultations
-- Ejecutar en el SQL Editor de Supabase

-- 1. Verificar el usuario actual autenticado
SELECT 
    auth.uid() as current_user_id,
    auth.role() as current_role,
    auth.email() as current_email;

-- 2. Verificar si RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'consultations';

-- 3. Ver todas las políticas de la tabla consultations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'consultations';

-- 4. VERIFICACIÓN CRÍTICA: Consulta específica que está fallando
-- Reemplaza '52' con el ID de la consulta que falla
SELECT 
    id,
    user_id,
    client_name,
    client_email,
    status,
    created_at,
    updated_at,
    -- Verificación de coincidencia
    CASE 
        WHEN user_id = auth.uid() THEN '✅ COINCIDE'
        ELSE '❌ NO COINCIDE'
    END as user_match,
    -- Mostrar ambos IDs para comparar
    user_id as consultation_user_id,
    auth.uid() as current_auth_user_id
FROM consultations 
WHERE id = 52; -- Reemplaza con el ID problemático

-- 5. Verificar todas las consultas del usuario actual
SELECT 
    id,
    user_id,
    client_name,
    status,
    created_at
FROM consultations 
WHERE user_id = auth.uid()
ORDER BY created_at DESC
LIMIT 10;

-- 6. Test de actualización directa (para probar permisos)
-- DESCOMENTAR PARA PROBAR:
-- UPDATE consultations 
-- SET updated_at = NOW() 
-- WHERE id = 52 AND user_id = auth.uid();