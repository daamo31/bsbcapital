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

-- Tabla para control de acceso de usuarios a productos
CREATE TABLE IF NOT EXISTS user_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL,
  has_access BOOLEAN DEFAULT FALSE,
  purchase_date TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  subscription_canceled_at TIMESTAMP WITH TIME ZONE,
  transaction_id TEXT,
  last_verified TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Tabla para logs de webhooks
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  webhook_data JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_user_access_user_id ON user_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_access_product_id ON user_access(product_id);
CREATE INDEX IF NOT EXISTS idx_user_access_has_access ON user_access(has_access);
CREATE INDEX IF NOT EXISTS idx_hotmart_checkouts_user_id ON hotmart_checkouts(user_id);
CREATE INDEX IF NOT EXISTS idx_hotmart_checkouts_status ON hotmart_checkouts(status);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para user_access
CREATE TRIGGER update_user_access_updated_at BEFORE UPDATE ON user_access 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) policies
ALTER TABLE hotmart_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

-- Política para hotmart_checkouts - usuarios solo pueden ver sus propios checkouts
CREATE POLICY "Users can view own checkouts" ON hotmart_checkouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own checkouts" ON hotmart_checkouts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para user_access - usuarios solo pueden ver su propio acceso
CREATE POLICY "Users can view own access" ON user_access
    FOR SELECT USING (auth.uid() = user_id);

-- Política para webhook_logs - solo service role puede acceder
CREATE POLICY "Service role can manage webhook_logs" ON webhook_logs
    FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Insertar datos de ejemplo para desarrollo (opcional)
-- Uncomment if you want sample data
/*
INSERT INTO user_access (user_id, product_id, has_access, purchase_date)
VALUES 
  ((SELECT id FROM auth.users LIMIT 1), 'D102065526G', true, NOW())
ON CONFLICT (user_id, product_id) DO NOTHING;
*/