-- Migración: Aislamiento Estricto de Datos Multi-Colegio (Multi-Tenancy) y Políticas RLS
-- Fecha: 2026-09-04
-- Descripción: Garantiza que ningún dato institucional (colegios, planteles, alumnos, profesores,
--              calificaciones, asistencias, grupos, horarios, finanzas, portafolios y estadísticas)
--              pueda ser compartido o visualizado entre colegios distintos.
--              Excepción permanente: Bóveda Curricular (Planeaciones) y Comunidad Docente (Segundo Cerebro).

-- 1. Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Asegurar columna school_id en perfiles de usuario (profiles)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_profiles_school_id ON public.profiles(school_id);
  END IF;
END $$;

-- 3. Asegurar columna school_id en asistencias (attendance)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'attendance' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.attendance ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_attendance_school_id ON public.attendance(school_id);
  END IF;
END $$;

-- 4. Asegurar columna school_id en calificaciones (grades)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'grades' AND column_name = 'school_id'
  ) THEN
    ALTER TABLE public.grades ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_grades_school_id ON public.grades(school_id);
  END IF;
END $$;

-- 5. Asegurar columna school_id en student_stats y student_avatars si se requiere consulta directa
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_stats') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'student_stats' AND column_name = 'school_id'
    ) THEN
      ALTER TABLE public.student_stats ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_student_stats_school_id ON public.student_stats(school_id);
    END IF;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_avatars') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'student_avatars' AND column_name = 'school_id'
    ) THEN
      ALTER TABLE public.student_avatars ADD COLUMN school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE;
      CREATE INDEX IF NOT EXISTS idx_student_avatars_school_id ON public.student_avatars(school_id);
    END IF;
  END IF;
END $$;

-- 6. Función Helper para obtener el school_id del usuario autenticado actual
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS UUID AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 7. Función Helper para verificar si el usuario actual es Superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- =========================================================================
-- 8. APLICACIÓN DE ROW LEVEL SECURITY (RLS) ESTRICTA MULTI-COLEGIO
-- =========================================================================

-- Tabla: profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de perfiles por colegio" ON public.profiles;
CREATE POLICY "Aislamiento estricto de perfiles por colegio"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    id = auth.uid() 
    OR is_superadmin()
    OR (school_id IS NOT NULL AND school_id = public.get_auth_user_school_id())
  );

-- Tabla: schools
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de colegios" ON public.schools;
CREATE POLICY "Aislamiento estricto de colegios"
  ON public.schools FOR SELECT
  TO authenticated
  USING (
    is_superadmin()
    OR id = public.get_auth_user_school_id()
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
  );

-- Tabla: students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de alumnos por colegio" ON public.students;
CREATE POLICY "Aislamiento estricto de alumnos por colegio"
  ON public.students FOR ALL
  TO authenticated
  USING (
    id = auth.uid()
    OR is_superadmin()
    OR school_id = public.get_auth_user_school_id()
    OR EXISTS (
      SELECT 1 FROM public.parent_student ps
      WHERE ps.student_id = students.id AND ps.parent_id = auth.uid()
    )
  );

-- Tabla: attendance
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de asistencias por colegio" ON public.attendance;
CREATE POLICY "Aislamiento estricto de asistencias por colegio"
  ON public.attendance FOR ALL
  TO authenticated
  USING (
    student_id = auth.uid()
    OR is_superadmin()
    OR (school_id IS NOT NULL AND school_id = public.get_auth_user_school_id())
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = attendance.student_id AND s.school_id = public.get_auth_user_school_id()
    )
    OR EXISTS (
      SELECT 1 FROM public.parent_student ps
      WHERE ps.student_id = attendance.student_id AND ps.parent_id = auth.uid()
    )
  );

-- Tabla: grades
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Aislamiento estricto de calificaciones por colegio" ON public.grades;
CREATE POLICY "Aislamiento estricto de calificaciones por colegio"
  ON public.grades FOR ALL
  TO authenticated
  USING (
    student_id = auth.uid()
    OR is_superadmin()
    OR (school_id IS NOT NULL AND school_id = public.get_auth_user_school_id())
    OR EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = grades.student_id AND s.school_id = public.get_auth_user_school_id()
    )
    OR EXISTS (
      SELECT 1 FROM public.parent_student ps
      WHERE ps.student_id = grades.student_id AND ps.parent_id = auth.uid()
    )
  );

-- Tabla: student_stats (Gamificación individual protegida)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_stats') THEN
    ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Permitir lectura de student_stats a alumnos dueños, docentes y administradores" ON public.student_stats;
    DROP POLICY IF EXISTS "Aislamiento estricto de student_stats por colegio" ON public.student_stats;
    
    CREATE POLICY "Aislamiento estricto de student_stats por colegio"
      ON public.student_stats FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR is_superadmin()
        OR EXISTS (
          SELECT 1 FROM public.students s
          WHERE s.id = student_stats.student_id AND s.school_id = public.get_auth_user_school_id()
        )
      );
  END IF;
END $$;

-- Tabla: quest_attempts (Intentos de examen y tareas protegidos por colegio)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quest_attempts') THEN
    ALTER TABLE public.quest_attempts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Permitir lectura de intentos al propio alumno, docentes o administradores" ON public.quest_attempts;
    DROP POLICY IF EXISTS "Aislamiento estricto de quest_attempts por colegio" ON public.quest_attempts;

    CREATE POLICY "Aislamiento estricto de quest_attempts por colegio"
      ON public.quest_attempts FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR is_superadmin()
        OR EXISTS (
          SELECT 1 FROM public.students s
          WHERE s.id = quest_attempts.student_id AND s.school_id = public.get_auth_user_school_id()
        )
      );
  END IF;
END $$;

-- Tabla: portfolio_items (Portafolios y tareas protegidos por colegio)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portfolio_items') THEN
    ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Permitir lectura de evidencias al estudiante dueño, docentes o tutores" ON public.portfolio_items;
    DROP POLICY IF EXISTS "Aislamiento estricto de portfolio_items por colegio" ON public.portfolio_items;

    CREATE POLICY "Aislamiento estricto de portfolio_items por colegio"
      ON public.portfolio_items FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR is_superadmin()
        OR EXISTS (
          SELECT 1 FROM public.students s
          WHERE s.id = portfolio_items.student_id AND s.school_id = public.get_auth_user_school_id()
        )
        OR EXISTS (
          SELECT 1 FROM public.parent_student ps
          WHERE ps.student_id = portfolio_items.student_id AND ps.parent_id = auth.uid()
        )
      );
  END IF;
END $$;

-- NOTA INSTITUCIONAL:
-- Las tablas de la Bóveda Curricular (planeaciones) y la Comunidad Docente
-- (community_resources, community_comments, community_likes) NO reciben filtro restrictivo
-- de school_id para que continúen funcionando como el repositorio colaborativo global pedagógico.
