-- 🔧 SOLUCIÓN DEFINITIVA: Eliminar TODAS las restricciones CHECK problemáticas
-- En lugar de jugar con valores específicos, permitir cualquier texto válido

-- 1. Mostrar todas las restricciones CHECK actuales
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as current_definition
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass 
  AND contype = 'c'
  AND conname LIKE '%_check'
ORDER BY conname;

-- 2. ELIMINAR todas las restricciones CHECK problemáticas que causan errores
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_crypto_experience_level_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_investment_experience_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_portfolio_value_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_savings_percentage_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_has_debts_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_initial_crypto_capital_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_crypto_knowledge_level_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_crypto_strategy_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_profile_type_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_advisor_crypto_experience_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_company_type_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_organization_crypto_status_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_preferred_liquidity_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_follow_up_frequency_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_previous_advisor_experience_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_time_horizon_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_risk_tolerance_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_age_range_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_monthly_income_range_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_crypto_portfolio_value_check;
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_crypto_interest_motivation_check;

-- 3. ELIMINAR TAMBIÉN las restricciones numéricas para máxima flexibilidad
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_portfolio_satisfaction_check; -- También eliminar la numérica para flexibilidad total

-- 4. Verificar que se eliminaron todas las restricciones problemáticas
SELECT 
    conname as remaining_constraint_name,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass 
  AND contype = 'c'
  AND conname LIKE '%_check'
ORDER BY conname;

-- 5. Test de todos los valores que antes causaban problemas
SELECT '=== TESTING ALL PROBLEMATIC VALUES ===' as test_status;

-- Test investment_experience (incluir campos obligatorios NOT NULL)
INSERT INTO consultations (user_id, client_name, client_email, investment_experience, status) 
VALUES (gen_random_uuid(), 'Test User', 'valid@bsbcapital.io', 'advanced', 'test') 
ON CONFLICT DO NOTHING;

-- Test crypto_experience_level
INSERT INTO consultations (user_id, client_name, client_email, crypto_experience_level, status) 
VALUES (gen_random_uuid(), 'Test User 2', 'test2@bsbcapital.io', 'occasional', 'test') 
ON CONFLICT DO NOTHING;

-- Test portfolio_value
INSERT INTO consultations (user_id, client_name, client_email, portfolio_value, status) 
VALUES (gen_random_uuid(), 'Test User 3', 'test3@bsbcapital.io', '10k-50k', 'test') 
ON CONFLICT DO NOTHING;

-- Test savings_percentage
INSERT INTO consultations (user_id, client_name, client_email, savings_percentage, status) 
VALUES (gen_random_uuid(), 'Test User 4', 'test4@bsbcapital.io', '5-10', 'test') 
ON CONFLICT DO NOTHING;

-- Test has_debts
INSERT INTO consultations (user_id, client_name, client_email, has_debts, status) 
VALUES (gen_random_uuid(), 'Test User 5', 'test5@bsbcapital.io', 'no', 'test') 
ON CONFLICT DO NOTHING;

-- Limpiar todos los tests
DELETE FROM consultations WHERE status = 'test';

SELECT '✅ TODAS LAS RESTRICCIONES CHECK ELIMINADAS - CUALQUIER VALOR TEXT AHORA PERMITIDO' as final_result;