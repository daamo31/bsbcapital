-- 🔧 ARREGLO URGENTE: Restricciones CHECK no aplicadas correctamente
-- ERROR: investment_experience 'advanced' no está permitido

-- 1. Ver el estado actual de las restricciones
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as current_definition
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass 
  AND contype = 'c'
  AND conname = 'consultations_investment_experience_check';

-- 2. ELIMINAR y RECREAR la restricción problemática
ALTER TABLE consultations DROP CONSTRAINT IF EXISTS consultations_investment_experience_check;

-- 3. CREAR la nueva restricción con TODOS los valores necesarios
ALTER TABLE consultations 
ADD CONSTRAINT consultations_investment_experience_check 
CHECK (investment_experience IN ('beginner', 'intermediate', 'advanced', '<1year', '1-3years', '3+years'));

-- 4. Verificar que se aplicó correctamente
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as new_definition
FROM pg_constraint 
WHERE conrelid = 'consultations'::regclass 
  AND contype = 'c'
  AND conname = 'consultations_investment_experience_check';

-- 5. Test rápido del valor problemático
SELECT 'Testing advanced value...' as status;
-- Este INSERT debería funcionar ahora
INSERT INTO consultations (id, user_id, investment_experience, status) 
VALUES (gen_random_uuid(), gen_random_uuid(), 'advanced', 'test') 
ON CONFLICT DO NOTHING;

-- Limpiar el test
DELETE FROM consultations WHERE status = 'test';

SELECT '✅ investment_experience: advanced - AHORA PERMITIDO' as result;