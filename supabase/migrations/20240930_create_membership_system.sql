-- Migration: Create comprehensive membership system
-- Created: 2024-09-30

-- Planes de suscripción
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  duration_months INTEGER, -- NULL para lifetime
  features JSONB NOT NULL DEFAULT '[]',
  stripe_price_id VARCHAR,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Suscripciones de usuarios
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  status VARCHAR DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  stripe_subscription_id VARCHAR,
  stripe_customer_id VARCHAR,
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Contenido de cursos
CREATE TABLE course_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  content_type VARCHAR NOT NULL CHECK (content_type IN ('video', 'document', 'live', 'quiz', 'course')),
  hotmart_content_id VARCHAR, -- ID del contenido en Hotmart
  hotmart_url TEXT, -- URL directa del contenido
  thumbnail_url TEXT,
  duration_minutes INTEGER,
  order_index INTEGER DEFAULT 0,
  required_plans UUID[] DEFAULT '{}', -- Array de plan_ids que dan acceso
  course_id UUID, -- Para agrupar contenido por curso
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Control de accesos a contenido
CREATE TABLE content_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES course_content(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  granted_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  access_type VARCHAR DEFAULT 'subscription' CHECK (access_type IN ('subscription', 'purchase', 'gift', 'trial')),
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_id)
);

-- Progreso del usuario
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES course_content(id) ON DELETE CASCADE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  time_watched_minutes INTEGER DEFAULT 0,
  completed_at TIMESTAMP,
  last_accessed_at TIMESTAMP DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, content_id)
);

-- Historial de pagos
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES user_subscriptions(id),
  stripe_payment_intent_id VARCHAR UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')),
  payment_method VARCHAR, -- 'stripe', 'paypal', etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX idx_content_access_user_id ON content_access(user_id);
CREATE INDEX idx_content_access_content_id ON content_access(content_id);
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_course_content_course_id ON course_content(course_id);

-- Funciones para actualizar timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para auto-actualizar updated_at
CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON user_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_course_content_updated_at BEFORE UPDATE ON course_content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar acceso a contenido
CREATE OR REPLACE FUNCTION check_user_content_access(user_uuid UUID, content_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    has_access BOOLEAN := FALSE;
BEGIN
    -- Verificar si el usuario tiene acceso válido al contenido
    SELECT EXISTS(
        SELECT 1 
        FROM content_access ca
        JOIN user_subscriptions us ON ca.subscription_id = us.id
        WHERE ca.user_id = user_uuid 
        AND ca.content_id = content_uuid
        AND us.status = 'active'
        AND (ca.expires_at IS NULL OR ca.expires_at > NOW())
        AND (us.expires_at IS NULL OR us.expires_at > NOW())
    ) INTO has_access;
    
    RETURN has_access;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para otorgar acceso automáticamente al crear suscripción
CREATE OR REPLACE FUNCTION grant_subscription_access()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo procesar suscripciones activas nuevas
    IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
        -- Otorgar acceso a todo el contenido incluido en el plan
        INSERT INTO content_access (user_id, content_id, subscription_id, granted_at)
        SELECT 
            NEW.user_id,
            cc.id,
            NEW.id,
            NOW()
        FROM course_content cc
        WHERE NEW.plan_id = ANY(cc.required_plans)
        ON CONFLICT (user_id, content_id) DO UPDATE SET
            subscription_id = NEW.id,
            granted_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para otorgar acceso automáticamente
CREATE TRIGGER auto_grant_subscription_access 
AFTER INSERT OR UPDATE ON user_subscriptions 
FOR EACH ROW EXECUTE FUNCTION grant_subscription_access();

-- Políticas RLS (Row Level Security)
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Política: usuarios solo pueden ver sus propias suscripciones
CREATE POLICY "Users can view own subscriptions" ON user_subscriptions
FOR SELECT USING (auth.uid() = user_id);

-- Política: usuarios solo pueden ver su propio acceso a contenido
CREATE POLICY "Users can view own content access" ON content_access
FOR SELECT USING (auth.uid() = user_id);

-- Política: usuarios solo pueden ver su propio progreso
CREATE POLICY "Users can view own progress" ON user_progress
FOR ALL USING (auth.uid() = user_id);

-- Política: usuarios solo pueden ver sus propios pagos
CREATE POLICY "Users can view own payments" ON payments
FOR SELECT USING (auth.uid() = user_id);

-- Políticas públicas para contenido y planes (solo lectura)
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Plans are publicly readable" ON subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Content is publicly readable" ON course_content
FOR SELECT USING (is_active = true);