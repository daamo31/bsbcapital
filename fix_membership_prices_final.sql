-- Corrección para que la BD coincida con los textos reales de las membresías

-- 1. Trader Plan Pro: mantener como está (29.99€/mes, 299€/año)
UPDATE subscription_plans 
SET 
    price = 29.90,
    price_annual = 299.00,
    description = 'o 299 €/año',
    features = '[
        "Newsletter incluida",
        "Acceso anticipado a BSB Maker (IA copiloto para traders)",
        "Acceso completo a la formación (cursos temáticos + masterclass)",
        "20% de descuento en consultorías",
        "1 consultoría de 30 min incluida en el plan anual"
    ]'::jsonb
WHERE name = 'Trader Plan Pro';

-- 2. Premium Investor: corregir a 29.90€/mes como dice en la descripción
UPDATE subscription_plans 
SET 
    price = 29.90,
    price_annual = 299.00,
    description = 'o 299 €/año',
    features = '[
        "Newsletter incluida",
        "Acceso a la Comunidad privada",
        "Acceso completo a la formación (cursos temáticos + masterclass)",
        "20% de descuento en consultorías",
        "1 consultoría de 30 min incluida en el plan anual"
    ]'::jsonb
WHERE name = 'Premium Investor';

-- 3. Wealth Membership: mover precio de mensual a anual (2400€/año, pago único)
UPDATE subscription_plans 
SET 
    price = NULL,
    price_annual = 2400.00,
    description = 'Co-Gestión Patrimonial - pago único',
    features = '[
        "6 consultorías de 1h/año (valor: 1.800€)",
        "Revisión completa de cartera semestral",
        "Plan estratégico anual con propuestas de optimización",
        "Canal privado prioritario + comunidad élite (networking + análisis exclusivos)",
        "Diseñada para clientes con patrimonio elevado que buscan claridad y continuidad sin ceder la gestión"
    ]'::jsonb,
    duration_months = 12
WHERE name = 'Wealth Membership';

-- Verificar los cambios
SELECT name, price, price_annual, description, features 
FROM subscription_plans 
WHERE name IN ('Trader Plan Pro', 'Premium Investor', 'Wealth Membership')
ORDER BY price;