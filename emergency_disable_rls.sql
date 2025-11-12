-- SOLUCIÓN DE EMERGENCIA: Deshabilitar completamente RLS
-- Si la función RPC no funciona, esto garantiza que el admin vea todo
-- Ejecutar en Supabase SQL Editor

-- 1. Deshabilitar RLS en consultations
ALTER TABLE consultations DISABLE ROW LEVEL SECURITY;

-- 2. Verificar que se deshabilitó
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '❌ Aún habilitado'
        ELSE '✅ RLS deshabilitado - admin puede ver todo'
    END as resultado
FROM pg_tables 
WHERE tablename = 'consultations';

-- 3. Test inmediato
SELECT 
    COUNT(*) as total_consultations,
    'RLS deshabilitado, admin debería ver todo' as status
FROM consultations;

-- 4. Ver las últimas consultations
SELECT 
    id,
    client_name,
    client_email,
    service,
    status,
    created_at
FROM consultations 
ORDER BY created_at DESC 
LIMIT 5;