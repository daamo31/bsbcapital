-- ================================================================
-- SCRIPT DE MIGRACIÓN DE DATOS EXISTENTES
-- Fecha: 01/10/2024
-- Descripción: Migra datos de user_access y profiles al nuevo sistema
--              Ejecutar DESPUÉS de aplicar las migraciones principales
-- ================================================================

-- ================================================================
-- 1. FUNCIÓN PRINCIPAL DE MIGRACIÓN
-- ================================================================
CREATE OR REPLACE FUNCTION migrate_legacy_data_to_new_system()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result JSONB := '{}';
    migrated_users INTEGER := 0;
    migrated_access INTEGER := 0;
    migrated_subscriptions INTEGER := 0;
    access_record RECORD;
    user_uuid UUID;
    plan_uuid UUID;
    subscription_uuid UUID;
    existing_count INTEGER;
BEGIN
    
    RAISE NOTICE 'INICIANDO MIGRACIÓN DE DATOS LEGACY...';
    
    -- ================================================================
    -- PASO 1: Migrar usuarios de user_access que no están en auth.users
    -- ================================================================
    RAISE NOTICE 'Paso 1: Verificando usuarios en user_access...';
    
    FOR access_record IN 
        SELECT DISTINCT ua.email 
        FROM public.user_access ua 
        WHERE ua.source = 'stripe_membership' 
        AND ua.status = 'active'
        AND NOT EXISTS (
            SELECT 1 FROM auth.users u WHERE u.email = ua.email
        )
    LOOP
        -- Crear entrada en users_unified para usuarios que no están en auth.users
        INSERT INTO public.users_unified (email)
        VALUES (access_record.email)
        ON CONFLICT (email) DO NOTHING;
        
        migrated_users := migrated_users + 1;
    END LOOP;
    
    -- ================================================================
    -- PASO 2: Migrar subscripciones activas de user_access
    -- ================================================================
    RAISE NOTICE 'Paso 2: Migrando suscripciones activas...';
    
    FOR access_record IN 
        SELECT ua.*, u.id as user_uuid
        FROM public.user_access ua 
        JOIN auth.users u ON u.email = ua.email
        WHERE ua.source = 'stripe_membership' 
        AND ua.status = 'active'
    LOOP
        
        -- Buscar plan correspondiente por product_id
        SELECT sp.id INTO plan_uuid
        FROM public.subscription_plans sp
        WHERE sp.stripe_product_id = access_record.product_id;
        
        -- Si no se encuentra plan específico, asignar por precio/tipo
        IF plan_uuid IS NULL THEN
            -- Mapeo inteligente basado en product_id conocidos
            CASE access_record.product_id
                WHEN 'prod_T9dfdXY3748Dlv' THEN  -- PLAN TRADER PRO
                    SELECT id INTO plan_uuid FROM public.subscription_plans WHERE name = 'Plan Básico';
                WHEN 'prod_T9dnmdsdbj1ETL' THEN  -- PREMIUM INVESTOR ANUAL
                    SELECT id INTO plan_uuid FROM public.subscription_plans WHERE name = 'Plan Premium';
                WHEN 'prod_T9dspdTkGGM7Sy' THEN  -- WEALTH MEMBERSHIP
                    SELECT id INTO plan_uuid FROM public.subscription_plans WHERE name = 'Plan VIP Lifetime';
                ELSE
                    -- Plan por defecto
                    SELECT id INTO plan_uuid FROM public.subscription_plans WHERE name = 'Plan Básico' LIMIT 1;
            END CASE;
        END IF;
        
        -- Verificar si ya existe suscripción
        SELECT COUNT(*) INTO existing_count
        FROM public.user_subscriptions us
        WHERE us.user_id = access_record.user_uuid
        AND us.stripe_subscription_id = access_record.external_id;
        
        -- Crear suscripción si no existe
        IF existing_count = 0 THEN
            INSERT INTO public.user_subscriptions (
                user_id,
                plan_id,
                status,
                stripe_subscription_id,
                started_at,
                ends_at,
                metadata
            )
            VALUES (
                access_record.user_uuid,
                plan_uuid,
                CASE access_record.status
                    WHEN 'active' THEN 'active'
                    WHEN 'canceled' THEN 'canceled'
                    WHEN 'expired' THEN 'expired'
                    ELSE 'active'
                END,
                access_record.external_id,
                access_record.started_at,
                access_record.expires_at,
                COALESCE(access_record.meta, '{}')
            )
            RETURNING id INTO subscription_uuid;
            
            migrated_subscriptions := migrated_subscriptions + 1;
            
            -- ================================================================
            -- PASO 3: Crear acceso al contenido automáticamente
            -- ================================================================
            INSERT INTO public.content_access (
                user_id,
                content_id,
                subscription_id,
                access_type,
                granted_at
            )
            SELECT 
                access_record.user_uuid,
                cc.id,
                subscription_uuid,
                'subscription',
                access_record.started_at
            FROM public.course_content cc
            WHERE plan_uuid = ANY(cc.required_plans) OR cc.is_free = true
            ON CONFLICT (user_id, content_id) DO NOTHING;
            
            migrated_access := migrated_access + 1;
        END IF;
        
    END LOOP;
    
    -- ================================================================
    -- PASO 4: Sincronizar profiles existentes
    -- ================================================================
    RAISE NOTICE 'Paso 4: Sincronizando profiles...';
    
    UPDATE public.profiles p
    SET 
        plan = CASE 
            WHEN sp.name ILIKE '%vip%' OR sp.name ILIKE '%lifetime%' THEN 'vip'
            WHEN sp.name ILIKE '%premium%' THEN 'premium'
            WHEN sp.name ILIKE '%basic%' OR sp.name ILIKE '%trader%' THEN 'basic'
            ELSE COALESCE(p.plan, 'free')
        END,
        subscription_status = COALESCE(us.status, p.subscription_status, 'free'),
        updated_at = now()
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON sp.id = us.plan_id
    WHERE p.id = us.user_id
    AND us.status = 'active';
    
    -- ================================================================
    -- PASO 5: Generar reporte final
    -- ================================================================
    result := jsonb_build_object(
        'migration_completed', true,
        'timestamp', now(),
        'migrated_users', migrated_users,
        'migrated_subscriptions', migrated_subscriptions,
        'migrated_access_grants', migrated_access,
        'summary', jsonb_build_object(
            'total_plans', (SELECT COUNT(*) FROM public.subscription_plans WHERE is_active = true),
            'total_subscriptions', (SELECT COUNT(*) FROM public.user_subscriptions WHERE status = 'active'),
            'total_content', (SELECT COUNT(*) FROM public.course_content WHERE is_active = true),
            'total_access_grants', (SELECT COUNT(*) FROM public.content_access WHERE is_active = true)
        )
    );
    
    RAISE NOTICE 'MIGRACIÓN COMPLETADA EXITOSAMENTE:';
    RAISE NOTICE '- Usuarios migrados: %', migrated_users;
    RAISE NOTICE '- Suscripciones migradas: %', migrated_subscriptions;
    RAISE NOTICE '- Accesos otorgados: %', migrated_access;
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR EN MIGRACIÓN: %', SQLERRM;
        RETURN jsonb_build_object(
            'migration_completed', false,
            'error', SQLERRM,
            'timestamp', now()
        );
END;
$$;

-- ================================================================
-- 2. FUNCIÓN PARA VERIFICAR INTEGRIDAD POST-MIGRACIÓN
-- ================================================================
CREATE OR REPLACE FUNCTION verify_migration_integrity()
RETURNS TABLE(
    check_name TEXT,
    status TEXT,
    count_expected BIGINT,
    count_actual BIGINT,
    details TEXT
)
LANGUAGE SQL
SECURITY DEFINER
AS $$
    -- Verificar que todos los planes tienen Stripe IDs
    SELECT 
        'Plans with Stripe IDs' as check_name,
        CASE WHEN COUNT(*) = (SELECT COUNT(*) FROM public.subscription_plans WHERE is_active = true)
             THEN 'PASS' ELSE 'FAIL' END as status,
        (SELECT COUNT(*) FROM public.subscription_plans WHERE is_active = true) as count_expected,
        COUNT(*) as count_actual,
        'All active plans should have stripe_price_id' as details
    FROM public.subscription_plans 
    WHERE is_active = true AND stripe_price_id IS NOT NULL
    
    UNION ALL
    
    -- Verificar suscripciones activas
    SELECT 
        'Active Subscriptions',
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARN' END,
        (SELECT COUNT(*) FROM public.user_access WHERE status = 'active'),
        COUNT(*),
        'Migrated active subscriptions from user_access'
    FROM public.user_subscriptions 
    WHERE status = 'active'
    
    UNION ALL
    
    -- Verificar acceso al contenido
    SELECT 
        'Content Access Grants',
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'WARN' END,
        0,
        COUNT(*),
        'Content access automatically granted'
    FROM public.content_access 
    WHERE is_active = true
    
    UNION ALL
    
    -- Verificar contenido gratuito
    SELECT 
        'Free Content Available',
        CASE WHEN COUNT(*) > 0 THEN 'PASS' ELSE 'FAIL' END,
        1,
        COUNT(*),
        'At least one piece of free content should exist'
    FROM public.course_content 
    WHERE is_free = true AND is_active = true;
$$;

-- ================================================================
-- 3. FUNCIÓN PARA ROLLBACK DE MIGRACIÓN (EMERGENCIA)
-- ================================================================
CREATE OR REPLACE FUNCTION rollback_migration()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- ADVERTENCIA: Esto borrará todos los datos del nuevo sistema
    RAISE NOTICE 'ADVERTENCIA: Ejecutando rollback completo...';
    
    DELETE FROM public.content_access;
    DELETE FROM public.user_progress;
    DELETE FROM public.payments;
    DELETE FROM public.user_subscriptions;
    DELETE FROM public.course_content;
    DELETE FROM public.subscription_plans;
    
    RAISE NOTICE 'Rollback completado. Datos del nuevo sistema eliminados.';
    RAISE NOTICE 'Los datos legacy en user_access y profiles NO fueron afectados.';
    
    RETURN 'ROLLBACK_COMPLETED';
END;
$$;

-- ================================================================
-- 4. INSTRUCCIONES DE USO
-- ================================================================

/*
INSTRUCCIONES PARA EJECUTAR LA MIGRACIÓN:

1. ANTES de ejecutar, verificar que las tablas nuevas existen:
   SELECT tablename FROM pg_tables WHERE schemaname = 'public' 
   AND tablename IN ('subscription_plans', 'user_subscriptions', 'course_content', 'content_access', 'user_progress', 'payments');

2. EJECUTAR la migración:
   SELECT migrate_legacy_data_to_new_system();

3. VERIFICAR la integridad:
   SELECT * FROM verify_migration_integrity();

4. Si hay problemas, hacer rollback:
   SELECT rollback_migration();

5. Después de la migración exitosa, puedes mantener ambos sistemas o
   gradualmente deprecar las tablas legacy (user_access, etc.)
*/

-- ================================================================
-- COMENTARIOS FINALES
-- ================================================================

COMMENT ON FUNCTION migrate_legacy_data_to_new_system() IS 'Migra datos de user_access y profiles al nuevo sistema de membresías';
COMMENT ON FUNCTION verify_migration_integrity() IS 'Verifica que la migración se ejecutó correctamente';
COMMENT ON FUNCTION rollback_migration() IS 'EMERGENCIA: Borra todos los datos del nuevo sistema (mantiene legacy)';

-- ================================================================
-- FIN DEL SCRIPT DE MIGRACIÓN
-- ================================================================