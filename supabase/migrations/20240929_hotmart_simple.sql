-- Simple migration - Only new tables for Hotmart integration

-- Tabla para almacenar información de checkouts de Hotmart
CREATE TABLE IF NOT EXISTS hotmart_checkouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  checkout_id TEXT NOT NULL,
  checkout_url TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(checkout_id)
);

-- Tabla para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  webhook_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para rate limiting
CREATE TABLE IF NOT EXISTS rate_limit_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para las nuevas tablas
CREATE INDEX IF NOT EXISTS idx_hotmart_checkouts_user_id ON hotmart_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_checkouts_status ON hotmart_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_attempts_ip_action ON rate_limit_attempts(ip_address, action);
CREATE INDEX IF NOT EXISTS idx_rate_limit_attempts_created_at ON rate_limit_attempts(created_at);

-- RLS (Row Level Security) policies
ALTER TABLE hotmart_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para hotmart_checkouts - usuarios solo pueden ver sus propios checkouts
DROP POLICY IF EXISTS "Users can view own checkouts" ON hotmart_checkouts;
CREATE POLICY "Users can view own checkouts" ON hotmart_checkouts
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own checkouts" ON hotmart_checkouts;
CREATE POLICY "Users can insert own checkouts" ON hotmart_checkouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para webhook_logs - solo service role puede acceder
DROP POLICY IF EXISTS "Service role can manage webhook_logs" ON webhook_logs;
CREATE POLICY "Service role can manage webhook_logs" ON webhook_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');