-- =========================================================================
-- MIGRACIÓN DE CORRECCIÓN: ELIMINACIÓN DEFINITIVA DE RECURSIÓN INFINITA EN PROFILES (RLS)
-- =========================================================================

-- 1. Actualizar funciones auxiliares a PL/pgSQL SECURITY DEFINER con search_path fijo
--    Al usar PL/pgSQL, PostgreSQL no inlina el cuerpo de la función en la expresión de la política,
--    y al ser SECURITY DEFINER con el rol postgres (BYPASSRLS), evita la recursión cíclica.
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school_id UUID;
BEGIN
  SELECT school_id INTO v_school_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN v_school_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_is_super BOOLEAN;
BEGIN
  SELECT (role = 'superadmin') INTO v_is_super
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(v_is_super, false);
END;
$$;

-- 2. Limpiar políticas recursivas de la tabla PROFILES
DROP POLICY IF EXISTS "Aislamiento de perfiles por colegio" ON public.profiles;
DROP POLICY IF EXISTS "Aislamiento estricto de perfiles por colegio" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for public" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_manage" ON public.profiles;
DROP POLICY IF EXISTS "profiles_superadmin_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_school_colleagues_read" ON public.profiles;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Acceso completo del usuario a su propio perfil (Sin recursión)
CREATE POLICY "profiles_self_manage"
  ON public.profiles FOR ALL
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Política 2: Lectura para Superadmin
CREATE POLICY "profiles_superadmin_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_superadmin());

-- Política 3: Lectura entre colegas del mismo colegio (SELECT ONLY)
CREATE POLICY "profiles_school_colleagues_read"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    school_id IS NOT NULL 
    AND school_id = public.get_auth_user_school_id()
  );

-- 3. Limpiar políticas recursivas obsoletas en ATTENDANCE y GRADES
DROP POLICY IF EXISTS "Aislamiento de asistencias por colegio" ON public.attendance;
DROP POLICY IF EXISTS "Aislamiento de calificaciones por colegio" ON public.grades;

-- 4. Fortalecer políticas en STUDENT_STATS
DROP POLICY IF EXISTS "Aislamiento estricto de student_stats por colegio" ON public.student_stats;
DROP POLICY IF EXISTS "Permitir lectura de student_stats a alumnos dueños, docentes y administradores" ON public.student_stats;
DROP POLICY IF EXISTS "Permitir insercion de student_stats al propio alumno" ON public.student_stats;
DROP POLICY IF EXISTS "Permitir actualizacion de student_stats al propio alumno" ON public.student_stats;
DROP POLICY IF EXISTS "Allow all for public" ON public.student_stats;
DROP POLICY IF EXISTS "student_stats_owner_all" ON public.student_stats;
DROP POLICY IF EXISTS "student_stats_superadmin" ON public.student_stats;
DROP POLICY IF EXISTS "student_stats_school_staff_read" ON public.student_stats;

ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;

-- Alumno dueño: Control total de sus propias estadísticas
CREATE POLICY "student_stats_owner_all"
  ON public.student_stats FOR ALL
  TO authenticated
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

-- Superadmin: Control total
CREATE POLICY "student_stats_superadmin"
  ON public.student_stats FOR ALL
  TO authenticated
  USING (public.is_superadmin())
  WITH CHECK (public.is_superadmin());

-- Docentes y directivos del plantel: Lectura autorizada
CREATE POLICY "student_stats_school_staff_read"
  ON public.student_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_stats.student_id 
        AND s.school_id = public.get_auth_user_school_id()
    )
  );
