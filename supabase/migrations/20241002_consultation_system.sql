-- Migration: Sistema de consultas con calendario
-- Created: 2024-10-02

-- Tabla para gestionar las consultas/citas
CREATE TABLE consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES auth.users(id), -- NULL para consultas con el equipo principal
  
  -- Información de la consulta
  title VARCHAR NOT NULL,
  description TEXT,
  consultation_type VARCHAR NOT NULL CHECK (consultation_type IN ('investment', 'portfolio', 'strategy', 'technical', 'general')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Fecha y hora
  scheduled_at TIMESTAMP NOT NULL,
  timezone VARCHAR DEFAULT 'Europe/Madrid',
  
  -- Estado de la consulta
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  
  -- Información de pago
  stripe_payment_id VARCHAR,
  stripe_session_id VARCHAR,
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Datos del cliente recopilados post-pago
  client_name VARCHAR,
  client_email VARCHAR,
  client_phone VARCHAR,
  company_name VARCHAR,
  investment_experience VARCHAR,
  portfolio_size VARCHAR,
  consultation_goals TEXT,
  additional_notes TEXT,
  
  -- URL de reunión
  meeting_url TEXT,
  meeting_password VARCHAR,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX idx_consultations_scheduled_at ON consultations(scheduled_at);
CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_consultant_id ON consultations(consultant_id);
CREATE INDEX idx_consultations_status ON consultations(status);
CREATE INDEX idx_consultations_date_range ON consultations(scheduled_at, status);

-- Tabla para gestionar disponibilidad de consultores
CREATE TABLE consultant_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Disponibilidad recurrente
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR DEFAULT 'Europe/Madrid',
  
  -- Duración mínima de slots
  slot_duration_minutes INTEGER DEFAULT 30,
  
  -- Estado
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para excepciones de disponibilidad (días no disponibles)
CREATE TABLE consultant_unavailability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  consultant_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Fecha específica no disponible
  unavailable_date DATE NOT NULL,
  start_time TIME, -- NULL para todo el día
  end_time TIME,   -- NULL para todo el día
  
  reason VARCHAR,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla para límites de consultas por membresía
CREATE TABLE membership_consultation_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES subscription_plans(id) ON DELETE CASCADE,
  
  -- Límites por período
  monthly_limit INTEGER DEFAULT 0, -- 0 = sin límite
  quarterly_limit INTEGER DEFAULT 0,
  yearly_limit INTEGER DEFAULT 0,
  
  -- Tipos de consulta permitidos
  allowed_consultation_types VARCHAR[] DEFAULT '{}',
  
  -- Duración máxima por consulta
  max_duration_minutes INTEGER DEFAULT 60,
  
  -- Prioridad en reservas (mayor número = mayor prioridad)
  booking_priority INTEGER DEFAULT 1,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultant_unavailability ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_consultation_limits ENABLE ROW LEVEL SECURITY;

-- Políticas para consultations
CREATE POLICY "Users can view their own consultations" ON consultations
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own consultations" ON consultations
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own consultations" ON consultations
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Consultants can view their assigned consultations" ON consultations
  FOR SELECT USING (consultant_id = auth.uid());

CREATE POLICY "Consultants can update their assigned consultations" ON consultations
  FOR UPDATE USING (consultant_id = auth.uid());

-- Políticas para availability (solo admins y consultores)
CREATE POLICY "Consultants can manage their availability" ON consultant_availability
  FOR ALL USING (consultant_id = auth.uid());

CREATE POLICY "Everyone can view consultant availability" ON consultant_availability
  FOR SELECT USING (is_active = true);

CREATE POLICY "Consultants can manage their unavailability" ON consultant_unavailability
  FOR ALL USING (consultant_id = auth.uid());

-- Políticas para membership limits (solo lectura para usuarios)
CREATE POLICY "Everyone can view membership limits" ON membership_consultation_limits
  FOR SELECT USING (true);

-- Función para verificar disponibilidad de slot
CREATE OR REPLACE FUNCTION check_consultation_availability(
  consultation_date TIMESTAMP,
  duration_minutes INTEGER DEFAULT 30,
  consultant_id_param UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  slot_end TIMESTAMP;
  conflicts INTEGER;
BEGIN
  -- Calcular hora de fin del slot
  slot_end := consultation_date + (duration_minutes || ' minutes')::INTERVAL;
  
  -- Verificar conflictos con consultas existentes
  SELECT COUNT(*) INTO conflicts
  FROM consultations
  WHERE 
    status IN ('scheduled', 'confirmed') AND
    (consultant_id_param IS NULL OR consultant_id = consultant_id_param) AND
    (
      -- La nueva consulta comienza durante una existente
      (consultation_date >= scheduled_at AND consultation_date < scheduled_at + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- La nueva consulta termina durante una existente
      (slot_end > scheduled_at AND slot_end <= scheduled_at + (duration_minutes || ' minutes')::INTERVAL)
      OR
      -- La nueva consulta envuelve completamente una existente
      (consultation_date <= scheduled_at AND slot_end >= scheduled_at + (duration_minutes || ' minutes')::INTERVAL)
    );
  
  RETURN conflicts = 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener slots disponibles en un día
CREATE OR REPLACE FUNCTION get_available_slots(
  target_date DATE,
  duration_minutes INTEGER DEFAULT 30,
  consultant_id_param UUID DEFAULT NULL
)
RETURNS TABLE(
  slot_time TIMESTAMP,
  is_available BOOLEAN
) AS $$
DECLARE
  slot_start TIME;
  slot_datetime TIMESTAMP;
  day_of_week_num INTEGER;
BEGIN
  -- Obtener día de la semana (0=Domingo, 1=Lunes, etc.)
  day_of_week_num := EXTRACT(DOW FROM target_date);
  
  -- Generar slots cada 30 minutos desde las 9:00 hasta las 18:00
  FOR slot_start IN SELECT generate_series('09:00'::TIME, '17:30'::TIME, '30 minutes'::INTERVAL) LOOP
    slot_datetime := target_date + slot_start;
    
    -- Solo incluir slots en el futuro
    IF slot_datetime > NOW() THEN
      slot_time := slot_datetime;
      is_available := check_consultation_availability(slot_datetime, duration_minutes, consultant_id_param);
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar límites de consultas por membresía
CREATE OR REPLACE FUNCTION check_user_consultation_limits(
  user_id_param UUID,
  consultation_type_param VARCHAR DEFAULT 'general'
)
RETURNS TABLE(
  can_book BOOLEAN,
  monthly_used INTEGER,
  monthly_limit INTEGER,
  reason TEXT
) AS $$
DECLARE
  user_plan_id UUID;
  plan_limits RECORD;
  current_month_start DATE;
  used_this_month INTEGER;
BEGIN
  -- Obtener el plan activo del usuario
  SELECT plan_id INTO user_plan_id
  FROM user_subscriptions
  WHERE user_id = user_id_param
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > NOW())
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Si no tiene membresía activa, no puede reservar
  IF user_plan_id IS NULL THEN
    can_book := FALSE;
    monthly_used := 0;
    monthly_limit := 0;
    reason := 'No active membership found';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Obtener límites del plan
  SELECT * INTO plan_limits
  FROM membership_consultation_limits
  WHERE plan_id = user_plan_id;
  
  -- Si no hay límites configurados, permitir reservas ilimitadas
  IF plan_limits IS NULL THEN
    can_book := TRUE;
    monthly_used := 0;
    monthly_limit := 999;
    reason := 'No limits configured - unlimited access';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Verificar si el tipo de consulta está permitido
  IF consultation_type_param != ALL(plan_limits.allowed_consultation_types) 
     AND array_length(plan_limits.allowed_consultation_types, 1) > 0 THEN
    can_book := FALSE;
    monthly_used := 0;
    monthly_limit := plan_limits.monthly_limit;
    reason := 'Consultation type not allowed for this membership';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Calcular uso del mes actual
  current_month_start := date_trunc('month', CURRENT_DATE)::DATE;
  
  SELECT COUNT(*) INTO used_this_month
  FROM consultations
  WHERE user_id = user_id_param
    AND scheduled_at >= current_month_start
    AND status IN ('scheduled', 'confirmed', 'completed');
  
  -- Verificar límite mensual
  IF plan_limits.monthly_limit > 0 AND used_this_month >= plan_limits.monthly_limit THEN
    can_book := FALSE;
    monthly_used := used_this_month;
    monthly_limit := plan_limits.monthly_limit;
    reason := 'Monthly consultation limit reached';
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- Puede reservar
  can_book := TRUE;
  monthly_used := used_this_month;
  monthly_limit := plan_limits.monthly_limit;
  reason := 'Can book consultation';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_consultations_updated_at 
  BEFORE UPDATE ON consultations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_consultant_availability_updated_at 
  BEFORE UPDATE ON consultant_availability
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_membership_consultation_limits_updated_at 
  BEFORE UPDATE ON membership_consultation_limits
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();