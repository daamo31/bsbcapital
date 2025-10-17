-- Agregar el plan "Trader Plan Pro" a la tabla subscription_plans
-- Ejecutar este script en el SQL Editor de Supabase

INSERT INTO subscription_plans (
  name,
  description,
  price,
  currency,
  duration_months,
  features,
  stripe_price_id,
  stripe_product_id,
  is_active,
  max_users
) VALUES (
  'Trader Plan Pro',
  'o 299 €/año',
  29.90,
  'EUR',
  1, -- 1 mes (plan mensual)
  '[
    "Newsletter incluida",
    "Acceso anticipado a BSB Maker (IA copiloto para traders)",
    "Acceso completo a la formación (cursos temáticos + masterclass)",
    "20% de descuento en consultorías",
    "1 consultoría de 30 min incluida en el plan anual"
  ]'::jsonb,
  'price_1SDKO8JmSk3VG9oiCLuGoE4s', -- Plan mensual de Stripe
  'prod_T9dfdXY3748Dlv', -- Product ID de Stripe
  true, -- Activo
  NULL -- Sin límite de usuarios
);

-- Opcional: También crear la versión anual si quieres tener ambas en la DB
INSERT INTO subscription_plans (
  name,
  description,
  price,
  currency,
  duration_months,
  features,
  stripe_price_id,
  stripe_product_id,
  is_active,
  max_users
) VALUES (
  'Trader Plan Pro (Anual)',
  'Pago anual con descuento',
  299.00,
  'EUR',
  12, -- 12 meses (plan anual)
  '[
    "Newsletter incluida",
    "Acceso anticipado a BSB Maker (IA copiloto para traders)",
    "Acceso completo a la formación (cursos temáticos + masterclass)",
    "20% de descuento en consultorías",
    "1 consultoría de 30 min incluida en el plan anual"
  ]'::jsonb,
  'price_1SDKQZJmSk3VG9oiGudek18k', -- Plan anual de Stripe
  'prod_T9dhXgPONVRAwl', -- Product ID del plan anual
  true, -- Activo
  NULL -- Sin límite de usuarios
);

-- Verificar que se insertaron correctamente
SELECT 
  name, 
  price, 
  currency, 
  duration_months, 
  stripe_price_id,
  stripe_product_id
FROM subscription_plans 
WHERE name LIKE 'Trader Plan Pro%'
ORDER BY duration_months;