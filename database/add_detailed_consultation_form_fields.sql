-- Migración para formulario detallado post-pago consultoría
-- Fecha: 2025-10-13

-- Expandir tabla consultations con todos los campos del formulario
ALTER TABLE consultations 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS age_range TEXT CHECK (age_range IN ('18-25', '26-35', '36-45', '46-60', '+60')),

-- Situación actual (Planificación Financiera)
ADD COLUMN IF NOT EXISTS monthly_income_range TEXT CHECK (monthly_income_range IN ('<1500', '1500-3000', '3000-5000', '5000+')),
ADD COLUMN IF NOT EXISTS savings_percentage TEXT CHECK (savings_percentage IN ('<5%', '5-10%', '10-20%', '>20%')),
ADD COLUMN IF NOT EXISTS has_debts TEXT CHECK (has_debts IN ('none', 'consumer', 'mortgage', 'mixed')),

-- Objetivos financieros
ADD COLUMN IF NOT EXISTS consultation_main_goal TEXT,
ADD COLUMN IF NOT EXISTS time_horizon TEXT CHECK (time_horizon IN ('short', 'medium', 'long')),
ADD COLUMN IF NOT EXISTS risk_tolerance TEXT CHECK (risk_tolerance IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS priorities TEXT[], -- Array para múltiples selecciones

-- Cartera actual (Optimización de Carteras)
ADD COLUMN IF NOT EXISTS portfolio_value TEXT CHECK (portfolio_value IN ('<5000', '5000-20000', '20000-100000', '100000-500000', '500000+')),
ADD COLUMN IF NOT EXISTS current_distribution TEXT[], -- Array para múltiples activos
ADD COLUMN IF NOT EXISTS main_broker TEXT,
ADD COLUMN IF NOT EXISTS investment_experience TEXT CHECK (investment_experience IN ('<1year', '1-3years', '3+years')),
ADD COLUMN IF NOT EXISTS portfolio_satisfaction INTEGER CHECK (portfolio_satisfaction BETWEEN 0 AND 10),
ADD COLUMN IF NOT EXISTS average_returns TEXT,

-- Crypto específico
ADD COLUMN IF NOT EXISTS crypto_experience_level TEXT CHECK (crypto_experience_level IN ('none', 'punctual', 'learning', 'basic', 'medium')),
ADD COLUMN IF NOT EXISTS crypto_knowledge_level TEXT CHECK (crypto_knowledge_level IN ('very_low', 'basic', 'medium')),
ADD COLUMN IF NOT EXISTS initial_crypto_capital TEXT CHECK (initial_crypto_capital IN ('<1000', '1000-5000', '5000-20000', '20000+')),
ADD COLUMN IF NOT EXISTS crypto_portfolio_value TEXT CHECK (crypto_portfolio_value IN ('<5000', '5000-20000', '20000-100000', '100000+')),
ADD COLUMN IF NOT EXISTS crypto_strategy TEXT CHECK (crypto_strategy IN ('hold', 'trading', 'yield', 'airdrops')),

-- Crypto avanzado / perfil profesional
ADD COLUMN IF NOT EXISTS profile_type TEXT CHECK (profile_type IN ('advisor', 'individual', 'company')),
ADD COLUMN IF NOT EXISTS advisor_crypto_experience TEXT CHECK (advisor_crypto_experience IN ('none', 'basic', 'advanced')),
ADD COLUMN IF NOT EXISTS company_type TEXT CHECK (company_type IN ('traditional', 'startup', 'fund')),
ADD COLUMN IF NOT EXISTS organization_crypto_status TEXT CHECK (organization_crypto_status IN ('exploring', 'partial', 'operating')),

-- Expectativas y comentarios
ADD COLUMN IF NOT EXISTS crypto_interest_motivation TEXT,
ADD COLUMN IF NOT EXISTS consultation_expectations TEXT,
ADD COLUMN IF NOT EXISTS specific_challenges TEXT,
ADD COLUMN IF NOT EXISTS preferred_liquidity TEXT CHECK (preferred_liquidity IN ('high', 'medium', 'low')),
ADD COLUMN IF NOT EXISTS investment_restrictions TEXT,
ADD COLUMN IF NOT EXISTS wants_follow_up BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_up_frequency TEXT CHECK (follow_up_frequency IN ('monthly', 'quarterly', 'none')),

-- Campos generales adicionales
ADD COLUMN IF NOT EXISTS pre_consultation_comments TEXT,
ADD COLUMN IF NOT EXISTS previous_advisor_experience TEXT CHECK (previous_advisor_experience IN ('none', 'unclear_results', 'active')),
ADD COLUMN IF NOT EXISTS form_completed_at TIMESTAMP WITH TIME ZONE;

-- Crear índices para consultas más rápidas
CREATE INDEX IF NOT EXISTS idx_consultations_profile_type ON consultations(profile_type);
CREATE INDEX IF NOT EXISTS idx_consultations_form_completed ON consultations(form_completed_at);

-- Comentarios para documentación
COMMENT ON COLUMN consultations.priorities IS 'Array de prioridades: emergency_fund, periodic_investment, insurance, tax_optimization, diversification';
COMMENT ON COLUMN consultations.current_distribution IS 'Array de tipos de activos en cartera actual';
COMMENT ON COLUMN consultations.form_completed_at IS 'Timestamp cuando se completó el formulario post-pago';