-- Corrección de precios Premium Investor - 4 noviembre 2024
-- Premium Investor debería costar 29.99€/mes y 299€/año (igual que Trader Plan Pro)

BEGIN;

-- Actualizar Premium Investor con los precios correctos
UPDATE public.subscription_plans 
SET 
  price = 29.99,
  price_annual = 299.99
WHERE name = 'Premium Investor';

-- Verificar los cambios
DO $$
BEGIN
    RAISE NOTICE '✅ Precios corregidos:';
    RAISE NOTICE '- Premium Investor: 29.99€/mes, 299€/año (ahora igual que Trader Plan Pro)';
END $$;

COMMIT;