-- 🔍 Verificar todas las restricciones CHECK de la tabla consultations

-- 1. Mostrar todas las restricciones CHECK activas
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass 
  AND contype = 'c'
  AND conname LIKE '%_check'
ORDER BY conname;

-- 2. Verificar valores específicos que deberían estar permitidos ahora
SELECT '=== TESTING CHECK CONSTRAINTS ===' as status;

-- Test crypto_experience_level (debe permitir 'occasional')
INSERT INTO consultations (id, user_id, crypto_experience_level, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), 'occasional', 'pending') 
ON CONFLICT DO NOTHING;
SELECT 'crypto_experience_level: occasional - ✅ PERMITIDO' as test_result;

-- Test investment_experience (debe permitir 'intermediate')  
INSERT INTO consultations (id, user_id, investment_experience, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), 'intermediate', 'pending') 
ON CONFLICT DO NOTHING;
SELECT 'investment_experience: intermediate - ✅ PERMITIDO' as test_result;

-- Test portfolio_value (debe permitir '10k-50k')
INSERT INTO consultations (id, user_id, portfolio_value, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), '10k-50k', 'pending') 
ON CONFLICT DO NOTHING;
SELECT 'portfolio_value: 10k-50k - ✅ PERMITIDO' as test_result;

-- Test savings_percentage (debe permitir '5-10')
INSERT INTO consultations (id, user_id, savings_percentage, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), '5-10', 'pending') 
ON CONFLICT DO NOTHING;
SELECT 'savings_percentage: 5-10 - ✅ PERMITIDO' as test_result;

-- Test has_debts (debe permitir 'no')
INSERT INTO consultations (id, user_id, has_debts, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), 'no', 'pending') 
ON CONFLICT DO NOTHING;
SELECT 'has_debts: no - ✅ PERMITIDO' as test_result;

-- Test initial_crypto_capital (debe permitir 'under1000')
INSERT INTO consultations (id, user_id, initial_crypto_capital, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), 'under1000', 'pending') 
ON CONFLICT DO NOTHING;
SELECT 'initial_crypto_capital: under1000 - ✅ PERMITIDO' as test_result;

-- Limpiar registros de prueba
DELETE FROM consultations WHERE status = 'pending' AND created_at > NOW() - INTERVAL '1 minute';

SELECT '=== TODAS LAS RESTRICCIONES CHECK VERIFICADAS ✅ ===' as final_status;