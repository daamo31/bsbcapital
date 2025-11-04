-- Corrección rápida: Actualizar Wealth Membership de 2400€ a 2007€
UPDATE subscription_plans 
SET price_annual = 2007.00,
    price = NULL
WHERE name = 'Wealth Membership';

-- Verificar el cambio
SELECT name, price, price_annual, currency 
FROM subscription_plans 
WHERE name = 'Wealth Membership';