-- database: :memory:
-- Fix Security Issues in Supabase Database
-- Date: 2025-12-16

-- 1. Habilitar RLS en la tabla consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar vistas SECURITY DEFINER que exponen auth.users
-- Estas vistas son un riesgo de seguridad y deben ser recreadas sin SECURITY DEFINER

-- Primero, eliminar las vistas existentes
DROP VIEW IF EXISTS public.real_users CASCADE;
DROP VIEW IF EXISTS public.real_consultations CASCADE;
DROP VIEW IF EXISTS public.consultations_dashboard CASCADE;

-- 3. Recrear las vistas sin SECURITY DEFINER (usando SECURITY INVOKER por defecto)
-- Esto hace que las vistas respeten el RLS del usuario que hace la consulta

-- Vista de usuarios PARA ADMIN (con verificación de rol admin)
-- Los admins pueden ver todos los usuarios, los usuarios normales solo se ven a sí mismos
CREATE OR REPLACE VIEW public.real_users
WITH (security_invoker = true)
AS
SELECT 
  p.id,
  p.full_name,
  p.subscription_status,
  p.plan,
  p.role,
  p.updated_at
FROM profiles p
WHERE 
  -- Los admins pueden ver todos
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR 
  -- Los usuarios normales solo se ven a sí mismos
  p.id = auth.uid();

-- Dar permisos solo a authenticated
GRANT SELECT ON public.real_users TO authenticated;
REVOKE SELECT ON public.real_users FROM anon;

-- Vista de consultas PARA ADMIN (con verificación de rol admin)
-- Los admins pueden ver todas las consultas, los usuarios normales solo las suyas
CREATE OR REPLACE VIEW public.real_consultations
WITH (security_invoker = true)
AS
SELECT 
  c.id,
  c.created_at,
  c.updated_at,
  c.user_id,
  c.client_id,
  c.client_name,
  c.client_email,
  c.service,
  c.status,
  c.duration,
  c.amount,
  c.currency,
  c.payment_status,
  c.booking_date,
  c.start_time,
  c.end_time,
  c.telephone,
  c.notes,
  c.description,
  c.title,
  c.stripe_session_id,
  c.stripe_price_id,
  c.stripe_product_id,
  p.full_name as user_name
FROM consultations c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE 
  -- Los admins pueden ver todas
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  OR 
  -- Los usuarios normales solo ven las suyas
  c.user_id = auth.uid();

-- Dar permisos solo a authenticated
GRANT SELECT ON public.real_consultations TO authenticated;
REVOKE SELECT ON public.real_consultations FROM anon;

-- Vista de dashboard de consultas PARA ADMIN
-- Solo los admins pueden acceder a este dashboard completo
CREATE OR REPLACE VIEW public.consultations_dashboard
WITH (security_invoker = true)
AS
SELECT 
  c.id,
  c.created_at,
  c.updated_at,
  c.user_id,
  c.client_id,
  c.client_name,
  c.client_email,
  c.service,
  c.status,
  c.duration,
  c.amount,
  c.currency,
  c.payment_status,
  c.booking_date,
  c.start_time,
  c.end_time,
  c.telephone,
  c.notes,
  c.description,
  c.country,
  c.age_range,
  c.monthly_income_range,
  c.consultation_main_goal,
  c.profile_type,
  c.form_completed_at,
  c.company_name,
  c.company_country,
  p.full_name as user_full_name,
  p.role as user_role
FROM consultations c
LEFT JOIN profiles p ON c.user_id = p.id
WHERE 
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin';

-- Dar permisos solo a authenticated
GRANT SELECT ON public.consultations_dashboard TO authenticated;
REVOKE SELECT ON public.consultations_dashboard FROM anon;

-- 4. Verificar que las políticas RLS de consultations estén correctas
-- Las políticas ya existen, solo necesitamos asegurarnos que están activas

-- Comentario: Las siguientes políticas ya existen según el error:
-- - "Enable insert for authenticated users"
-- - "Users can insert own consultations"
-- - "Users can update own consultations"
-- - "Users can view their own consultations"

-- 5. Añadir política de eliminación si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'consultations' 
    AND policyname = 'Users can delete own consultations'
  ) THEN
    CREATE POLICY "Users can delete own consultations"
      ON public.consultations
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- 6. Comentarios de seguridad
COMMENT ON VIEW public.real_users IS 'Vista segura que no expone datos sensibles de auth.users';
COMMENT ON VIEW public.real_consultations IS 'Vista segura con datos de consultas sin exponer auth.users';
COMMENT ON VIEW public.consultations_dashboard IS 'Dashboard de consultas para usuarios autenticados';

-- 7. Verificación final
DO $$
BEGIN
  -- Verificar que RLS está habilitado
  IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'consultations' AND relnamespace = 'public'::regnamespace) THEN
    RAISE EXCEPTION 'RLS no está habilitado en consultations';
  END IF;
  
  RAISE NOTICE 'Todas las correcciones de seguridad se han aplicado correctamente';
END
$$;
