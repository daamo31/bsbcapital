-- Migración: Agregar columnas de período a user_subscriptions
-- Fecha: 2025-11-03

-- Agregar columnas de período de suscripción para mejor sincronización con Stripe
ALTER TABLE user_subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP,
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP;

-- Renombrar expires_at a expired_at para consistencia
ALTER TABLE user_subscriptions 
RENAME COLUMN expires_at TO expired_at;

-- Actualizar registros existentes para que usen current_period_end en lugar de expired_at
UPDATE user_subscriptions 
SET current_period_end = expired_at 
WHERE current_period_end IS NULL AND expired_at IS NOT NULL;

-- Comentario sobre las nuevas columnas:
-- current_period_start: Inicio del período actual de facturación
-- current_period_end: Final del período actual de facturación  
-- cancel_at_period_end: Si la suscripción se cancelará al final del período
-- trial_start: Inicio del período de prueba (si aplica)
-- trial_end: Final del período de prueba (si aplica)
-- expired_at: Fecha de expiración real de la suscripción