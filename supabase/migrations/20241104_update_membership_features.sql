-- Actualización de features de membresías - 4 noviembre 2024
-- Nuevos textos para Trader Plan Pro, Premium Investor y Wealth Membership

BEGIN;

-- 1. TRADER PLAN PRO - Nuevos features
UPDATE public.subscription_plans 
SET features = '[
  "Newsletter incluida",
  "Acceso anticipado a BSB Maker (IA copiloto para traders)",
  "Acceso completo a la formación (cursos temáticos + masterclass)",
  "20% de descuento en consultorías",
  "1 consultoría de 30 min incluida en el plan anual"
]'::jsonb
WHERE name = 'Trader Plan Pro';

-- 2. PREMIUM INVESTOR - Nuevos features  
UPDATE public.subscription_plans 
SET features = '[
  "Newsletter incluida",
  "Acceso a la Comunidad privada",
  "Acceso completo a la formación (cursos temáticos + masterclass)",
  "20% de descuento en consultorías",
  "1 consultoría de 30 min incluida en el plan anual"
]'::jsonb
WHERE name = 'Premium Investor';

-- 3. WEALTH MEMBERSHIP - Nuevos features (Co-Gestión Patrimonial)
UPDATE public.subscription_plans 
SET 
  description = 'Co-Gestión Patrimonial',
  features = '[
    "6 consultorías de 1h/año (valor: 1.800€)",
    "Revisión completa de cartera semestral",
    "Plan estratégico anual con propuestas de optimización",
    "Canal privado prioritario + comunidad élite (networking + análisis exclusivos)",
    "Diseñada para clientes con patrimonio elevado que buscan claridad y continuidad sin ceder la gestión"
  ]'::jsonb
WHERE name = 'Wealth Membership';

-- Verificar los cambios
DO $$
BEGIN
    RAISE NOTICE '✅ Features actualizados para todas las membresías:';
    RAISE NOTICE '- Trader Plan Pro: Newsletter, BSB Maker, formación completa, descuentos y consultoría incluida';
    RAISE NOTICE '- Premium Investor: Newsletter, comunidad privada, formación completa, descuentos y consultoría incluida';
    RAISE NOTICE '- Wealth Membership: Co-Gestión Patrimonial con 6 consultorías anuales y servicios premium';
END $$;

COMMIT;