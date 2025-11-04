-- Migración para agregar la columna payment_status a la tabla user_subscriptions

ALTER TABLE user_subscriptions
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'unpaid';