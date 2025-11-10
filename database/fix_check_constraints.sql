-- 🔧 Arreglar TODAS las restricciones CHECK en consultations table para coincidir con frontend
-- Análisis completo de todos los formularios: OnboardingCryptoForm, GenericConsultationForm, FinancialPlanningForm

-- 1. CRYPTO_EXPERIENCE_LEVEL: Agregar 'occasional' (OnboardingCryptoForm)
ALTER TABLE consultations 
DROP CONSTRAINT IF EXISTS consultations_crypto_experience_level_check;

ALTER TABLE consultations 
ADD CONSTRAINT consultations_crypto_experience_level_check 
CHECK (crypto_experience_level IN ('none', 'punctual', 'learning', 'basic', 'medium', 'occasional'));

-- 2. INVESTMENT_EXPERIENCE: Reemplazar valores completamente (GenericConsultationForm)
-- BD tenía: '<1year', '1-3years', '3+years'
-- Frontend usa: 'beginner', 'intermediate', 'advanced'
ALTER TABLE consultations 
DROP CONSTRAINT IF EXISTS consultations_investment_experience_check;

ALTER TABLE consultations 
ADD CONSTRAINT consultations_investment_experience_check 
CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', '<1year', '1-3years', '3+years'));

-- 3. PORTFOLIO_VALUE: Reemplazar valores completamente (GenericConsultationForm)
-- BD tenía: '<5000', '5000-20000', '20000-100000', '100000-500000', '500000+'
-- Frontend usa: 'under5k', '5k-20k', '20k-50k', '50k-100k', '100k-500k', 'over500k'
ALTER TABLE consultations 
DROP CONSTRAINT IF EXISTS consultations_portfolio_value_check;

ALTER TABLE consultations 
ADD CONSTRAINT consultations_portfolio_value_check 
CHECK (portfolio_value IN (
    '<5000', '5000-20000', '20000-100000', '100000-500000', '500000+',
    'under5k', '5k-20k', '20k-50k', '50k-100k', '100k-500k', 'over500k',
    '10k-50k'
));

-- 4. SAVINGS_PERCENTAGE: Ajustar formato (FinancialPlanningForm)
-- BD tenía: '<5%', '5-10%', '10-20%', '>20%'
-- Frontend usa: '<5', '5-10', '10-20', '20+'
ALTER TABLE consultations 
DROP CONSTRAINT IF EXISTS consultations_savings_percentage_check;

ALTER TABLE consultations 
ADD CONSTRAINT consultations_savings_percentage_check 
CHECK (savings_percentage IN ('<5%', '5-10%', '10-20%', '>20%', '<5', '5-10', '10-20', '20+'));

-- 5. HAS_DEBTS: Agregar 'no' (FinancialPlanningForm)
-- BD tenía: 'none', 'consumer', 'mortgage', 'mixed'
-- Frontend usa: 'no', 'consumer', 'mortgage', 'mixed'
ALTER TABLE consultations 
DROP CONSTRAINT IF EXISTS consultations_has_debts_check;

ALTER TABLE consultations 
ADD CONSTRAINT consultations_has_debts_check 
CHECK (has_debts IN ('none', 'consumer', 'mortgage', 'mixed', 'no'));

-- 6. INITIAL_CRYPTO_CAPITAL: Agregar valores del frontend (OnboardingCryptoForm)
-- BD tenía: '<1000', '1000-5000', '5000-20000', '20000+'
-- Frontend usa: 'under1000', '1000-5000', '5000-20000' (falta 20000+)
ALTER TABLE consultations 
DROP CONSTRAINT IF EXISTS consultations_initial_crypto_capital_check;

ALTER TABLE consultations 
ADD CONSTRAINT consultations_initial_crypto_capital_check 
CHECK (initial_crypto_capital IN ('<1000', '1000-5000', '5000-20000', '20000+', 'under1000'));

-- 4. Verificar que todas las restricciones CHECK se aplicaron correctamente
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass 
  AND contype = 'c'
  AND conname LIKE '%_check'
ORDER BY conname;

-- 5. Mensaje de confirmación
SELECT '✅ Restricciones CHECK actualizadas correctamente para consultations table' as status;