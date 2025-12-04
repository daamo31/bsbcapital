-- ===========================================
-- Actualizar IDs de Stripe para planes existentes
-- 4 de diciembre de 2025
-- ===========================================

-- El problema: Hay planes en la base de datos que no tienen 
-- configurados los stripe_price_id necesarios para el checkout.

-- IMPORTANTE: Primero verifica qué planes existen sin Stripe IDs
SELECT 
  id,
  name,
  price,
  price_annual,
  stripe_price_id,
  stripe_price_id_annual,
  stripe_product_id
FROM subscription_plans
WHERE is_active = true
  AND (stripe_price_id IS NULL OR stripe_price_id_annual IS NULL)
ORDER BY name;

-- ===========================================
-- OPCIÓN A: Actualizar el plan existente 440eea76-8ab1-42cc-b8ad-ffdd670427ec
-- ===========================================

-- Actualizar Membresía Exclusiva BSB - Mensual con los IDs de Stripe
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SaXofJmSk3VG9oigjDZtcF6',  -- Precio mensual 40€
  stripe_price_id_annual = 'price_1SaXpNJmSk3VG9oifsW4ajZ2',  -- Precio anual 400€
  stripe_product_id = 'prod_TXd41kG8ddpyDP',
  updated_at = NOW()
WHERE id = '440eea76-8ab1-42cc-b8ad-ffdd670427ec'
  AND name ILIKE '%Membresía Exclusiva%Mensual%';

-- ===========================================
-- OPCIÓN B: Actualizar TODOS los planes de membresía sin IDs
-- ===========================================

-- Si hay varios planes de membresía sin Stripe IDs, actualizar por nombre
UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SaXofJmSk3VG9oigjDZtcF6',
  stripe_product_id = 'prod_TXd41kG8ddpyDP',
  updated_at = NOW()
WHERE name = 'Membresía Exclusiva BSB - Mensual'
  AND stripe_price_id IS NULL;

UPDATE subscription_plans
SET 
  stripe_price_id = 'price_1SaXpNJmSk3VG9oifsW4ajZ2',
  stripe_product_id = 'prod_TXd5JJfHRg8ZTx',
  updated_at = NOW()
WHERE name = 'Membresía Exclusiva BSB - Anual'
  AND stripe_price_id IS NULL;

-- ===========================================
-- VERIFICACIÓN FINAL
-- ===========================================

SELECT 
  id,
  name,
  price as "Precio Mensual",
  price_annual as "Precio Anual",
  stripe_price_id as "Stripe Price ID (Mensual)",
  stripe_price_id_annual as "Stripe Price ID (Anual)",
  stripe_product_id as "Stripe Product ID",
  CASE 
    WHEN stripe_price_id IS NOT NULL THEN '✅'
    ELSE '❌'
  END as "Tiene Stripe ID"
FROM subscription_plans
WHERE is_active = true
ORDER BY name;
