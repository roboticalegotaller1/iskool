-- =========================================================================
-- ISkool DevSecOps & Zero-Trust Architecture: Endurecimiento RLS Multi-Tenant
-- Archivo: supabase/migrations/20260916_tenant_isolation_and_rls_hardening.sql
-- Descripción: Garantiza aislamiento físico y lógico estricto por school_id,
--              previniendo fugas de datos entre colegios y asegurando search_path
--              en funciones con privilegios SECURITY DEFINER.
-- =========================================================================

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Asegurar y optimizar funciones helper del contexto de seguridad
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

-- 3. Fijar search_path estricto en funciones SECURITY DEFINER existentes para mitigar CVEs de secuestro de ruta
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    ALTER FUNCTION public.handle_new_user() SET search_path = public, pg_catalog, pg_temp;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_activity_vote_change') THEN
    ALTER FUNCTION public.handle_activity_vote_change() SET search_path = public, pg_catalog, pg_temp;
  END IF;
END $$;

-- 4. Endurecimiento de Tablas Académicas y Estructurales (Multi-Tenancy por school_id)

-- Tabla: academic_years
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de ciclos academicos por colegio" ON public.academic_years;
CREATE POLICY "Aislamiento estricto de ciclos academicos por colegio"
  ON public.academic_years FOR ALL
  TO authenticated
  USING (
    is_superadmin()
    OR school_id = public.get_auth_user_school_id()
  )
  WITH CHECK (
    is_superadmin()
    OR school_id = public.get_auth_user_school_id()
  );

-- Tabla: academic_periods
ALTER TABLE public.academic_periods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de periodos academicos por colegio" ON public.academic_periods;
CREATE POLICY "Aislamiento estricto de periodos academicos por colegio"
  ON public.academic_periods FOR ALL
  TO authenticated
  USING (
    is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.academic_years ay
      WHERE ay.id = academic_periods.academic_year_id 
        AND ay.school_id = public.get_auth_user_school_id()
    )
  )
  WITH CHECK (
    is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.academic_years ay
      WHERE ay.id = academic_periods.academic_year_id 
        AND ay.school_id = public.get_auth_user_school_id()
    )
  );

-- Tabla: groups
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de grupos por colegio" ON public.groups;
CREATE POLICY "Aislamiento estricto de grupos por colegio"
  ON public.groups FOR ALL
  TO authenticated
  USING (
    is_superadmin()
    OR school_id = public.get_auth_user_school_id()
  )
  WITH CHECK (
    is_superadmin()
    OR school_id = public.get_auth_user_school_id()
  );

-- Tabla: subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de materias por colegio" ON public.subjects;
CREATE POLICY "Aislamiento estricto de materias por colegio"
  ON public.subjects FOR ALL
  TO authenticated
  USING (
    is_superadmin()
    OR school_id = public.get_auth_user_school_id()
  )
  WITH CHECK (
    is_superadmin()
    OR school_id = public.get_auth_user_school_id()
  );

-- Tabla: enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de inscripciones por colegio" ON public.enrollments;
CREATE POLICY "Aislamiento estricto de inscripciones por colegio"
  ON public.enrollments FOR ALL
  TO authenticated
  USING (
    student_id = auth.uid()
    OR is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = enrollments.student_id AND s.school_id = public.get_auth_user_school_id()
    )
  )
  WITH CHECK (
    is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = enrollments.student_id AND s.school_id = public.get_auth_user_school_id()
    )
  );

-- Tabla: teacher_assignments
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de asignaciones docentes por colegio" ON public.teacher_assignments;
CREATE POLICY "Aislamiento estricto de asignaciones docentes por colegio"
  ON public.teacher_assignments FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid()
    OR is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = teacher_assignments.group_id AND g.school_id = public.get_auth_user_school_id()
    )
  )
  WITH CHECK (
    is_superadmin()
    OR EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = teacher_assignments.group_id AND g.school_id = public.get_auth_user_school_id()
    )
  );

-- 5. Endurecimiento de Módulo Financiero y Facturación (billing_profiles)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'billing_profiles') THEN
    ALTER TABLE public.billing_profiles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de perfiles de facturacion" ON public.billing_profiles;
    
    CREATE POLICY "Aislamiento estricto de perfiles de facturacion"
      ON public.billing_profiles FOR ALL
      TO authenticated
      USING (
        parent_id = auth.uid()
        OR is_superadmin()
        OR (school_id IS NOT NULL AND school_id = public.get_auth_user_school_id())
      )
      WITH CHECK (
        parent_id = auth.uid()
        OR is_superadmin()
        OR (school_id IS NOT NULL AND school_id = public.get_auth_user_school_id())
      );
  END IF;
END $$;
