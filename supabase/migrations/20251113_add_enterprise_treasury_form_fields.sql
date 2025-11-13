-- Migración para formulario de gestión de tesorería empresarial
-- Fecha: 2025-11-13

-- Agregar campos específicos para formulario empresarial a la tabla consultations
ALTER TABLE consultations 

-- 🏢 Datos de la empresa (4 campos)
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS company_country TEXT,
ADD COLUMN IF NOT EXISTS company_website TEXT,
ADD COLUMN IF NOT EXISTS contact_person TEXT,

-- 💰 Situación actual con criptomonedas (4 campos)
ADD COLUMN IF NOT EXISTS crypto_usage TEXT CHECK (crypto_usage IN ('none', 'treasury', 'payments', 'investment', 'multiple')),
ADD COLUMN IF NOT EXISTS monthly_crypto_volume TEXT CHECK (monthly_crypto_volume IN ('none', 'under10k', '10k-50k', '50k-200k', '200k-1M', 'over1M')),
ADD COLUMN IF NOT EXISTS crypto_assets_held TEXT, -- Texto libre para detallar activos
ADD COLUMN IF NOT EXISTS crypto_storage_location TEXT CHECK (crypto_storage_location IN ('no_assets', 'exchange_only', 'cold_wallet', 'mixed', 'custody', 'unsure')),

-- 🎯 Objetivos empresariales (3 campos)
ADD COLUMN IF NOT EXISTS main_treasury_goal TEXT CHECK (main_treasury_goal IN ('diversification', 'payment_efficiency', 'hedge_inflation', 'yield_generation', 'market_expansion', 'regulatory_compliance')),
ADD COLUMN IF NOT EXISTS risk_profile TEXT CHECK (risk_profile IN ('conservative', 'balanced', 'aggressive', 'exploring')),
ADD COLUMN IF NOT EXISTS twelve_month_vision TEXT, -- Texto libre para visión a 12 meses

-- ⚖️ Cumplimiento y controles (4 campos)
ADD COLUMN IF NOT EXISTS current_controls TEXT CHECK (current_controls IN ('none', 'basic', 'intermediate', 'advanced', 'institutional')),
ADD COLUMN IF NOT EXISTS legal_advice TEXT CHECK (legal_advice IN ('none', 'general', 'specialized', 'multijurisdiction')),
ADD COLUMN IF NOT EXISTS accounting_records TEXT CHECK (accounting_records IN ('none', 'manual', 'erp_basic', 'specialized', 'full_integration')),

-- 📄 Campo JSON para almacenar todos los datos estructurados (si no existe ya)
ADD COLUMN IF NOT EXISTS form_data_json JSONB;

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_consultations_company_name ON consultations(company_name);
CREATE INDEX IF NOT EXISTS idx_consultations_crypto_usage ON consultations(crypto_usage);
CREATE INDEX IF NOT EXISTS idx_consultations_main_treasury_goal ON consultations(main_treasury_goal);
CREATE INDEX IF NOT EXISTS idx_consultations_form_data_json ON consultations USING GIN (form_data_json);

-- Comentarios para documentación
COMMENT ON COLUMN consultations.company_name IS 'Nombre de la empresa cliente';
COMMENT ON COLUMN consultations.crypto_usage IS 'Forma actual de uso de criptomonedas por la empresa';
COMMENT ON COLUMN consultations.monthly_crypto_volume IS 'Volumen mensual aproximado en operaciones crypto';
COMMENT ON COLUMN consultations.crypto_assets_held IS 'Descripción libre de los activos crypto que mantiene';
COMMENT ON COLUMN consultations.crypto_storage_location IS 'Método de almacenamiento de activos crypto';
COMMENT ON COLUMN consultations.main_treasury_goal IS 'Objetivo principal para la gestión de tesorería cripto';
COMMENT ON COLUMN consultations.risk_profile IS 'Perfil de riesgo empresarial';
COMMENT ON COLUMN consultations.twelve_month_vision IS 'Visión estratégica a 12 meses';
COMMENT ON COLUMN consultations.current_controls IS 'Nivel de controles internos actuales';
COMMENT ON COLUMN consultations.legal_advice IS 'Nivel de asesoramiento legal especializado';
COMMENT ON COLUMN consultations.accounting_records IS 'Sistema de registro contable para activos crypto';
COMMENT ON COLUMN consultations.form_data_json IS 'Datos completos del formulario en formato JSON estructurado';