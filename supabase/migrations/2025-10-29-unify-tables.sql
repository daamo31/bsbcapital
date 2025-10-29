-- Step 1: Add payment-related fields to the consultations table
ALTER TABLE consultations
ADD COLUMN amount NUMERIC(10, 2),
ADD COLUMN currency VARCHAR(10),
ADD COLUMN payment_status VARCHAR(50);

-- Step 2: Migrate data from user_payments to consultations
INSERT INTO consultations (user_id, stripe_session_id, amount, currency, payment_status)
SELECT user_id, stripe_session_id, amount, currency, status
FROM user_payments;

-- Step 3: Verify the data migration
-- Ensure all rows from user_payments are now in consultations
SELECT * FROM consultations WHERE amount IS NOT NULL;

-- Step 4: (Optional) Drop the user_payments table if no longer needed
-- DROP TABLE user_payments;