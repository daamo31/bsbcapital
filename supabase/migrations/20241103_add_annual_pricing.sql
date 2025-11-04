-- ================================================================
-- MIGRACIÓN: Soporte completo para precios anuales y actualización de Stripe IDs
-- Fecha: 03/11/2025
-- Descripción: Agrega columnas para precios anuales y actualiza todos los IDs de Stripe
-- ================================================================

-- Agregar soporte para precios anuales
ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS price_annual DECIMAL(10,2);

ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_price_id_annual VARCHAR(255);

ALTER TABLE public.subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id VARCHAR(255);

-- Actualizar/insertar planes con datos completos de Stripe
-- Usar DO blocks para UPSERT manual sin ON CONFLICT

-- 1. PLAN TRADER PRO (Mensual)
DO $$
BEGIN
    -- Intentar actualizar primero
    UPDATE public.subscription_plans 
    SET 
        price = 29.99,
        price_annual = 299.99,
        stripe_price_id = 'price_1SDKO8JmSk3VG9oiCLuGoE4s',
        stripe_price_id_annual = 'price_1SDKQZJmSk3VG9oiGudek18k',
        stripe_product_id = 'prod_T9dfdXY3748Dlv',
        features = '["Formación completa", "Comunidad privada", "Señales básicas", "Soporte por email"]'::jsonb,
        is_active = true
    WHERE name = 'Trader Plan Pro';
    
    -- Si no se actualizó ninguna fila, insertar
    IF NOT FOUND THEN
        INSERT INTO public.subscription_plans (
            name, description, price, price_annual, currency, duration_months,
            stripe_price_id, stripe_price_id_annual, stripe_product_id, features, is_active
        ) VALUES (
            'Trader Plan Pro', 'Plan básico para traders', 29.99, 299.99, 'EUR', 1,
            'price_1SDKO8JmSk3VG9oiCLuGoE4s', 'price_1SDKQZJmSk3VG9oiGudek18k', 'prod_T9dfdXY3748Dlv',
            '["Formación completa", "Comunidad privada", "Señales básicas", "Soporte por email"]'::jsonb, true
        );
    END IF;
END $$;

-- 2. PREMIUM INVESTOR (Mensual)
DO $$
BEGIN
    UPDATE public.subscription_plans 
    SET 
        price = 97.00,
        price_annual = 999.99,
        stripe_price_id = 'price_1SDKTKJmSk3VG9oiBTv0HaYK',
        stripe_price_id_annual = 'price_1SDKVXJmSk3VG9oiLEm9JOoD',
        stripe_product_id = 'prod_T9dkKyjk6tatez',
        features = '["Todo lo anterior", "Análisis de mercado diarios", "Señales premium", "Webinars exclusivos", "Soporte prioritario"]'::jsonb,
        is_active = true
    WHERE name = 'Premium Investor';
    
    IF NOT FOUND THEN
        INSERT INTO public.subscription_plans (
            name, description, price, price_annual, currency, duration_months,
            stripe_price_id, stripe_price_id_annual, stripe_product_id, features, is_active
        ) VALUES (
            'Premium Investor', 'Plan premium para inversores avanzados', 97.00, 999.99, 'EUR', 1,
            'price_1SDKTKJmSk3VG9oiBTv0HaYK', 'price_1SDKVXJmSk3VG9oiLEm9JOoD', 'prod_T9dkKyjk6tatez',
            '["Todo lo anterior", "Análisis de mercado diarios", "Señales premium", "Webinars exclusivos", "Soporte prioritario"]'::jsonb, true
        );
    END IF;
END $$;

-- 3. WEALTH MEMBERSHIP (Solo anual)
DO $$
BEGIN
    UPDATE public.subscription_plans 
    SET 
        price = NULL,
        price_annual = 2007.00,
        stripe_price_id = NULL,
        stripe_price_id_annual = 'price_1SDKb2JmSk3VG9oiJr1unLZZ',
        stripe_product_id = 'prod_T9dspdTkGGM7Sy',
        features = '["Todo lo anterior", "Consultoría 1-1 personalizada", "Portfolio management", "Soporte 24/7", "Acceso anticipado a nuevos productos"]'::jsonb,
        is_active = true
    WHERE name = 'Wealth Membership';
    
    IF NOT FOUND THEN
        INSERT INTO public.subscription_plans (
            name, description, price, price_annual, currency, duration_months,
            stripe_price_id, stripe_price_id_annual, stripe_product_id, features, is_active
        ) VALUES (
            'Wealth Membership', 'Plan completo VIP (solo anual)', NULL, 2007.00, 'EUR', 12,
            NULL, 'price_1SDKb2JmSk3VG9oiJr1unLZZ', 'prod_T9dspdTkGGM7Sy',
            '["Todo lo anterior", "Consultoría 1-1 personalizada", "Portfolio management", "Soporte 24/7", "Acceso anticipado a nuevos productos"]'::jsonb, true
        );
    END IF;
END $$;

-- 4. ACADEMIA (Acceso a cursos)
DO $$
BEGIN
    UPDATE public.subscription_plans 
    SET 
        stripe_price_id = 'price_1SDKgoJmSk3VG9oiamJj88De',
        stripe_product_id = 'prod_T9dymUXkbPpeir',
        features = '["Acceso completo a cursos", "Certificaciones", "Material descargable", "Actualizaciones continuas"]'::jsonb,
        is_active = true
    WHERE name = 'Academia BSB';
    
    IF NOT FOUND THEN
        INSERT INTO public.subscription_plans (
            name, description, price, price_annual, currency, duration_months,
            stripe_price_id, stripe_price_id_annual, stripe_product_id, features, is_active
        ) VALUES (
            'Academia BSB', 'Acceso completo a la academia de formación', NULL, NULL, 'EUR', 1,
            'price_1SDKgoJmSk3VG9oiamJj88De', NULL, 'prod_T9dymUXkbPpeir',
            '["Acceso completo a cursos", "Certificaciones", "Material descargable", "Actualizaciones continuas"]'::jsonb, true
        );
    END IF;
END $$;

-- 5. Plan gratuito
DO $$
BEGIN
    UPDATE public.subscription_plans 
    SET 
        price = 0.00,
        price_annual = 0.00,
        features = '["Newsletter gratuita", "Acceso limitado al contenido", "Comunidad básica"]'::jsonb,
        is_active = true
    WHERE name = 'Free Access';
    
    IF NOT FOUND THEN
        INSERT INTO public.subscription_plans (
            name, description, price, price_annual, currency, duration_months,
            stripe_price_id, stripe_price_id_annual, stripe_product_id, features, is_active
        ) VALUES (
            'Free Access', 'Acceso gratuito básico', 0.00, 0.00, 'EUR', NULL,
            NULL, NULL, NULL,
            '["Newsletter gratuita", "Acceso limitado al contenido", "Comunidad básica"]'::jsonb, true
        );
    END IF;
END $$;

-- Actualizar planes existentes por stripe_price_id si los hay
UPDATE public.subscription_plans 
SET 
  stripe_product_id = CASE 
    WHEN stripe_price_id = 'price_1SDKO8JmSk3VG9oiCLuGoE4s' THEN 'prod_T9dfdXY3748Dlv'  -- Trader Pro
    WHEN stripe_price_id = 'price_1SDKTKJmSk3VG9oiBTv0HaYK' THEN 'prod_T9dkKyjk6tatez'  -- Premium Investor
    WHEN stripe_price_id = 'price_1SDKb2JmSk3VG9oiJr1unLZZ' THEN 'prod_T9dspdTkGGM7Sy'  -- Wealth Membership
    WHEN stripe_price_id = 'price_1SDKgoJmSk3VG9oiamJj88De' THEN 'prod_T9dymUXkbPpeir'  -- Academia
    ELSE stripe_product_id
  END
WHERE stripe_price_id IN (
  'price_1SDKO8JmSk3VG9oiCLuGoE4s',
  'price_1SDKTKJmSk3VG9oiBTv0HaYK', 
  'price_1SDKb2JmSk3VG9oiJr1unLZZ',
  'price_1SDKgoJmSk3VG9oiamJj88De'
);

-- Agregar comentarios para claridad
COMMENT ON COLUMN public.subscription_plans.price_annual IS 'Precio anual del plan (con descuento respecto al mensual)';
COMMENT ON COLUMN public.subscription_plans.stripe_price_id_annual IS 'ID del precio anual en Stripe';
COMMENT ON COLUMN public.subscription_plans.stripe_product_id IS 'ID del producto en Stripe (compartido entre mensual y anual)';

-- Log de migración
DO $$ 
BEGIN 
    RAISE NOTICE 'Migración completada: Precios anuales y IDs de Stripe actualizados';
    RAISE NOTICE 'Planes configurados:';
    RAISE NOTICE '- Trader Plan Pro: Mensual (29.99€) y Anual (299.99€)';
    RAISE NOTICE '- Premium Investor: Mensual (97€) y Anual (999.99€)';
    RAISE NOTICE '- Wealth Membership: Solo Anual (2007€)';
    RAISE NOTICE '- Academia BSB: Por configurar precios';
    RAISE NOTICE '- Free Access: Gratuito';
END $$;