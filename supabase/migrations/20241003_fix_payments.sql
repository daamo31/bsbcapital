-- Solo agregar las columnas específicas que faltan en payments
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS external_transaction_id VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON public.payments(external_transaction_id);