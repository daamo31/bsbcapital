-- Migration: Ensure consultations table exists and has correct structure
-- Created: 2024-10-17

-- Create table if not exists (compatible approach)
CREATE TABLE IF NOT EXISTS consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES auth.users(id), -- NULL for consultations with main team
  
  -- Consultation information
  title VARCHAR NOT NULL DEFAULT 'Consulta general',
  description TEXT,
  consultation_type VARCHAR NOT NULL DEFAULT 'general' CHECK (consultation_type IN ('investment', 'portfolio', 'strategy', 'technical', 'general')),
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Date and time
  scheduled_at TIMESTAMP NOT NULL,
  timezone VARCHAR DEFAULT 'Europe/Madrid',
  
  -- Consultation status
  status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'pending_payment')),
  
  -- Payment information
  stripe_payment_id VARCHAR,
  stripe_session_id VARCHAR,
  amount_paid DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'EUR',
  
  -- Client data collected post-payment
  client_name VARCHAR,
  client_email VARCHAR,
  client_phone VARCHAR,
  company_name VARCHAR,
  investment_experience VARCHAR,
  portfolio_size VARCHAR,
  consultation_goals TEXT,
  additional_notes TEXT,
  
  -- Meeting URL
  meeting_url TEXT,
  meeting_password VARCHAR,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP
);

-- Add columns if they don't exist (safe approach)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'title') THEN
        ALTER TABLE consultations ADD COLUMN title VARCHAR NOT NULL DEFAULT 'Consulta general';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'consultation_type') THEN
        ALTER TABLE consultations ADD COLUMN consultation_type VARCHAR NOT NULL DEFAULT 'general' CHECK (consultation_type IN ('investment', 'portfolio', 'strategy', 'technical', 'general'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'duration_minutes') THEN
        ALTER TABLE consultations ADD COLUMN duration_minutes INTEGER NOT NULL DEFAULT 30;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'scheduled_at') THEN
        ALTER TABLE consultations ADD COLUMN scheduled_at TIMESTAMP NOT NULL DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'status') THEN
        ALTER TABLE consultations ADD COLUMN status VARCHAR DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show', 'pending_payment'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'client_name') THEN
        ALTER TABLE consultations ADD COLUMN client_name VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'client_email') THEN
        ALTER TABLE consultations ADD COLUMN client_email VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'stripe_session_id') THEN
        ALTER TABLE consultations ADD COLUMN stripe_session_id VARCHAR;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'description') THEN
        ALTER TABLE consultations ADD COLUMN description TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'consultations' AND column_name = 'consultant_id') THEN
        ALTER TABLE consultations ADD COLUMN consultant_id UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_consultations_scheduled_at ON consultations(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_consultant_id ON consultations(consultant_id);
CREATE INDEX IF NOT EXISTS idx_consultations_status ON consultations(status);
CREATE INDEX IF NOT EXISTS idx_consultations_date_range ON consultations(scheduled_at, status);

-- Enable RLS
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consultations' AND policyname = 'Users can view their own consultations') THEN
        CREATE POLICY "Users can view their own consultations" ON consultations
        FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consultations' AND policyname = 'Users can insert their own consultations') THEN
        CREATE POLICY "Users can insert their own consultations" ON consultations
        FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consultations' AND policyname = 'Service role can manage all consultations') THEN
        CREATE POLICY "Service role can manage all consultations" ON consultations
        FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'consultations' AND policyname = 'Public can insert consultations') THEN
        CREATE POLICY "Public can insert consultations" ON consultations
        FOR INSERT WITH CHECK (true);
    END IF;
END $$;