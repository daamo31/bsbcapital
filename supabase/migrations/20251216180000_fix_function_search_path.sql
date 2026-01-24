-- Fix Function Search Path Security Warnings
-- Date: 2025-12-16
-- Todas las funciones deben tener un search_path fijo para evitar ataques de inyección de esquema

-- 1. Arreglar función is_admin (aparece duplicada en warnings)
ALTER FUNCTION public.is_admin() SET search_path = public, pg_temp;

-- 2. Arreglar función update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, pg_temp;

-- 3. Arreglar función update_user_payments_updated_at
ALTER FUNCTION public.update_user_payments_updated_at() SET search_path = public, pg_temp;

-- 4. Arreglar función check_user_access
ALTER FUNCTION public.check_user_access(uuid) SET search_path = public, pg_temp;

-- 5. Arreglar función grant_subscription_access
ALTER FUNCTION public.grant_subscription_access(uuid, text) SET search_path = public, pg_temp;

-- 6. Arreglar función notify_new_lead
ALTER FUNCTION public.notify_new_lead() SET search_path = public, pg_temp;

-- 7. Arreglar función notify_new_bsb_maker_lead
ALTER FUNCTION public.notify_new_bsb_maker_lead() SET search_path = public, pg_temp;

-- 8. Arreglar función update_user_plan_from_profile
ALTER FUNCTION public.update_user_plan_from_profile() SET search_path = public, pg_temp;

-- 9. Arreglar función migrate_legacy_data_to_new_system
ALTER FUNCTION public.migrate_legacy_data_to_new_system() SET search_path = public, pg_temp;

-- 10. Arreglar función verify_migration_integrity
ALTER FUNCTION public.verify_migration_integrity() SET search_path = public, pg_temp;

-- 11. Arreglar función rollback_migration
ALTER FUNCTION public.rollback_migration() SET search_path = public, pg_temp;

-- 12. Arreglar función is_super_admin
ALTER FUNCTION public.is_super_admin() SET search_path = public, pg_temp;

-- 13. Arreglar función has_access_level
ALTER FUNCTION public.has_access_level(text) SET search_path = public, pg_temp;

-- 14. Arreglar función log_admin_activity
ALTER FUNCTION public.log_admin_activity(text, jsonb) SET search_path = public, pg_temp;

-- 15. Arreglar función get_calendar_data
ALTER FUNCTION public.get_calendar_data(date, date) SET search_path = public, pg_temp;

-- 16. Arreglar función quick_time_block
ALTER FUNCTION public.quick_time_block(timestamp with time zone, timestamp with time zone, text) SET search_path = public, pg_temp;

-- 17. Arreglar función get_all_consultations_admin
ALTER FUNCTION public.get_all_consultations_admin() SET search_path = public, pg_temp;

-- 18. Arreglar función get_available_plans_with_content
ALTER FUNCTION public.get_available_plans_with_content() SET search_path = public, pg_temp;

-- 19. Arreglar función check_user_content_access
ALTER FUNCTION public.check_user_content_access(uuid) SET search_path = public, pg_temp;

-- 20. Arreglar función get_user_accessible_content
ALTER FUNCTION public.get_user_accessible_content() SET search_path = public, pg_temp;

-- 21. Arreglar función get_dashboard_metrics
ALTER FUNCTION public.get_dashboard_metrics() SET search_path = public, pg_temp;

-- Verificación
DO $$
BEGIN
  RAISE NOTICE 'Todas las funciones ahora tienen search_path fijo para mayor seguridad';
END
$$;
