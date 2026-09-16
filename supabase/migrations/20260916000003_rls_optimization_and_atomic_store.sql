-- =========================================================================
-- ISkool Database Optimization & Enterprise Multi-Tenancy Architecture
-- Archivo: supabase/migrations/20260916000003_rls_optimization_and_atomic_store.sql
-- Misión: Optimización extrema de CPU en Políticas RLS, Indexación B-Tree
--         Estratégica y Transacción Atómica ACID para la Tienda Mágica.
-- =========================================================================

-- 1. Habilitar extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 2. FUNCIONES DE CONTEXTO CACHEADAS (STABLE SECURITY DEFINER)
-- Optimización: Reducción de coste de CPU de O(N) a O(1) mediante InitPlan
-- =========================================================================

-- Obtiene el school_id del usuario autenticado (con prioridad al JWT claims)
CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS UUID AS $$
DECLARE
  v_school_id TEXT;
BEGIN
  -- 1. Intentar extraer del claim JWT directamente sin tocar tablas
  v_school_id := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'school_id';
  IF v_school_id IS NOT NULL AND v_school_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RETURN v_school_id::UUID;
  END IF;

  -- 2. Fallback indexado a profiles
  RETURN (SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
EXCEPTION
  WHEN OTHERS THEN
    RETURN (SELECT school_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

-- Verifica si el usuario actual es Superadministrador
CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN AS $$
DECLARE
  v_role TEXT;
BEGIN
  -- 1. Intentar extraer del claim JWT
  v_role := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'user_role';
  IF v_role = 'superadmin' THEN
    RETURN TRUE;
  END IF;

  -- 2. Fallback indexado
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'superadmin'
  );
EXCEPTION
  WHEN OTHERS THEN
    RETURN EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'superadmin'
    );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

-- Función de pertenencia de tutor/padre para erradicar subconsultas correlacionadas en filas
CREATE OR REPLACE FUNCTION public.is_parent_of_student(p_student_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.parent_student
    WHERE student_id = p_student_id AND parent_id = auth.uid()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;

-- Función de pertenencia de alumno a colegio para erradicar subconsultas EXISTS redundantes
CREATE OR REPLACE FUNCTION public.student_belongs_to_school(p_student_id UUID, p_school_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.students
    WHERE id = p_student_id AND school_id = p_school_id
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp;


-- =========================================================================
-- 3. INDEXACIÓN ESTRATÉGICA COMPUESTA B-TREE
-- Cobertura de consultas de alta concurrencia y aceleración de JOINs
-- =========================================================================

-- A. Claves Compuestas Multi-Tenant (school_id, id)
CREATE INDEX IF NOT EXISTS idx_profiles_school_id_id ON public.profiles(school_id, id);
CREATE INDEX IF NOT EXISTS idx_schools_id_is_active ON public.schools(id, is_active);

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'groups') THEN
    CREATE INDEX IF NOT EXISTS idx_groups_school_id_id ON public.groups(school_id, id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'subjects') THEN
    CREATE INDEX IF NOT EXISTS idx_subjects_school_id_id ON public.subjects(school_id, id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
    CREATE INDEX IF NOT EXISTS idx_students_school_id_id ON public.students(school_id, id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'academic_years') THEN
    CREATE INDEX IF NOT EXISTS idx_academic_years_school_id_id ON public.academic_years(school_id, id);
  END IF;
END $$;

-- B. Tablas de Alto Tráfico: B-Tree en (student_id, created_at DESC) y Claves Foráneas
DO $$
BEGIN
  -- Calificaciones (grades)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'grades') THEN
    CREATE INDEX IF NOT EXISTS idx_grades_student_created ON public.grades(student_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_grades_school_student ON public.grades(school_id, student_id);
    CREATE INDEX IF NOT EXISTS idx_grades_subject_period ON public.grades(subject_id, period_id);
  END IF;

  -- Asistencias (attendance)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
    CREATE INDEX IF NOT EXISTS idx_attendance_student_created ON public.attendance(student_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_attendance_school_student ON public.attendance(school_id, student_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_group_date ON public.attendance(group_id, date);
  END IF;

  -- Intentos de evaluación y tareas (quest_attempts)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quest_attempts') THEN
    CREATE INDEX IF NOT EXISTS idx_quest_attempts_student_created ON public.quest_attempts(student_id, created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_quest_attempts_quest_student ON public.quest_attempts(quest_id, student_id);
  END IF;

  -- Evidencias pedagógicas (portfolio_items)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portfolio_items') THEN
    CREATE INDEX IF NOT EXISTS idx_portfolio_items_student_created ON public.portfolio_items(student_id, created_at DESC);
  END IF;

  -- Mensajería institucional y del alumno
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_messages') THEN
    CREATE INDEX IF NOT EXISTS idx_student_messages_student_sent ON public.student_messages(student_id, is_read, sent_at DESC);
  END IF;

  -- Inventario de artefactos gamificados
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_inventory') THEN
    CREATE INDEX IF NOT EXISTS idx_student_inventory_student_artifact ON public.student_inventory(student_id, artifact_id);
  END IF;

  -- Estadísticas gamificadas
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_stats') THEN
    CREATE INDEX IF NOT EXISTS idx_student_stats_school_student ON public.student_stats(school_id, student_id);
  END IF;

  -- Votos y actividades de la Comunidad Docente
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'activity_votes') THEN
    CREATE INDEX IF NOT EXISTS idx_activity_votes_composite ON public.activity_votes(activity_id, voter_teacher_id);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'community_activities') THEN
    CREATE INDEX IF NOT EXISTS idx_community_activities_teacher_created ON public.community_activities(teacher_id, created_at DESC);
  END IF;

  -- Relación Tutor-Alumno
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'parent_student') THEN
    CREATE INDEX IF NOT EXISTS idx_parent_student_composite ON public.parent_student(parent_id, student_id);
  END IF;
END $$;


-- =========================================================================
-- 4. REESCRITURA DE POLÍTICAS RLS DE ALTO RENDIMIENTO (BAJO COSTO DE CPU)
-- Reemplazo de subconsultas EXISTS correlacionadas fila por fila
-- mediante evaluación escalar (SELECT func()) que se ejecuta una sola vez.
-- =========================================================================

-- Tabla: grades
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'grades') THEN
    ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de calificaciones por colegio" ON public.grades;
    DROP POLICY IF EXISTS "grades_optimized_school_isolation" ON public.grades;

    CREATE POLICY "grades_optimized_school_isolation"
      ON public.grades FOR ALL
      TO authenticated
      USING (
        student_id = auth.uid()
        OR (SELECT public.is_superadmin())
        OR (school_id IS NOT NULL AND school_id = (SELECT public.get_auth_user_school_id()))
        OR public.is_parent_of_student(student_id)
      )
      WITH CHECK (
        (SELECT public.is_superadmin())
        OR (school_id IS NOT NULL AND school_id = (SELECT public.get_auth_user_school_id()))
      );
  END IF;
END $$;

-- Tabla: attendance
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'attendance') THEN
    ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de asistencias por colegio" ON public.attendance;
    DROP POLICY IF EXISTS "attendance_optimized_school_isolation" ON public.attendance;

    CREATE POLICY "attendance_optimized_school_isolation"
      ON public.attendance FOR ALL
      TO authenticated
      USING (
        student_id = auth.uid()
        OR (SELECT public.is_superadmin())
        OR (school_id IS NOT NULL AND school_id = (SELECT public.get_auth_user_school_id()))
        OR public.is_parent_of_student(student_id)
      )
      WITH CHECK (
        (SELECT public.is_superadmin())
        OR (school_id IS NOT NULL AND school_id = (SELECT public.get_auth_user_school_id()))
      );
  END IF;
END $$;

-- Tabla: students
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
    ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de alumnos por colegio" ON public.students;
    DROP POLICY IF EXISTS "students_optimized_school_isolation" ON public.students;

    CREATE POLICY "students_optimized_school_isolation"
      ON public.students FOR ALL
      TO authenticated
      USING (
        id = auth.uid()
        OR (SELECT public.is_superadmin())
        OR school_id = (SELECT public.get_auth_user_school_id())
        OR public.is_parent_of_student(id)
      )
      WITH CHECK (
        (SELECT public.is_superadmin())
        OR school_id = (SELECT public.get_auth_user_school_id())
      );
  END IF;
END $$;

-- Tabla: portfolio_items
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'portfolio_items') THEN
    ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de portfolio_items por colegio" ON public.portfolio_items;
    DROP POLICY IF EXISTS "portfolio_items_optimized_isolation" ON public.portfolio_items;

    CREATE POLICY "portfolio_items_optimized_isolation"
      ON public.portfolio_items FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR (SELECT public.is_superadmin())
        OR public.student_belongs_to_school(student_id, (SELECT public.get_auth_user_school_id()))
        OR public.is_parent_of_student(student_id)
      );
  END IF;
END $$;

-- Tabla: quest_attempts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'quest_attempts') THEN
    ALTER TABLE public.quest_attempts ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de quest_attempts por colegio" ON public.quest_attempts;
    DROP POLICY IF EXISTS "quest_attempts_optimized_isolation" ON public.quest_attempts;

    CREATE POLICY "quest_attempts_optimized_isolation"
      ON public.quest_attempts FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR (SELECT public.is_superadmin())
        OR public.student_belongs_to_school(student_id, (SELECT public.get_auth_user_school_id()))
      );
  END IF;
END $$;

-- Tabla: student_stats
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_stats') THEN
    ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Aislamiento estricto de student_stats por colegio" ON public.student_stats;
    DROP POLICY IF EXISTS "student_stats_optimized_isolation" ON public.student_stats;

    CREATE POLICY "student_stats_optimized_isolation"
      ON public.student_stats FOR SELECT
      TO authenticated
      USING (
        student_id = auth.uid()
        OR (SELECT public.is_superadmin())
        OR (school_id IS NOT NULL AND school_id = (SELECT public.get_auth_user_school_id()))
        OR public.student_belongs_to_school(student_id, (SELECT public.get_auth_user_school_id()))
      );
  END IF;
END $$;


-- =========================================================================
-- 5. TRANSACCIÓN ATÓMICA DE TIENDA CON BLOQUEO EXCLUSIVO (SELECT FOR UPDATE)
-- Previene Race Conditions, saldo negativo y sobreventa de stock bajo alta concurrencia
-- =========================================================================

-- Asegurar columna stock en catálogo de artefactos (NULL = stock ilimitado)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'shop_artifacts') THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'shop_artifacts' AND column_name = 'stock'
    ) THEN
      ALTER TABLE public.shop_artifacts ADD COLUMN stock INTEGER DEFAULT NULL;
    END IF;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.buy_item_transaction(
  p_student_id UUID,
  p_artifact_id TEXT,
  p_quantity INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_coins INTEGER;
  v_price INTEGER;
  v_stock INTEGER;
  v_name TEXT;
  v_category TEXT;
  v_total_cost INTEGER;
  v_message_id UUID;
  v_message_text TEXT;
  v_inventory TEXT[];
BEGIN
  -- 1. Validación de parámetros de entrada
  IF p_student_id IS NULL OR p_artifact_id IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Parámetros inválidos para compra: studentId=% artifactId=% cantidad=%', 
      p_student_id, p_artifact_id, p_quantity
      USING ERRCODE = '22023';
  END IF;

  -- 2. BLOQUEO EXCLUSIVO DE FILA EN CATÁLOGO (FOR UPDATE)
  -- Previene modificaciones concurrentes de precio y sobreventa de stock
  SELECT price, stock, name, category
  INTO v_price, v_stock, v_name, v_category
  FROM public.shop_artifacts
  WHERE id = p_artifact_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El artefacto % no existe en la tienda oficial.', p_artifact_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 3. Verificación de Stock disponible
  IF v_stock IS NOT NULL AND v_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente para "%". Disponibles: %, Solicitados: %', 
      v_name, v_stock, p_quantity
      USING ERRCODE = '55000';
  END IF;

  v_total_cost := v_price * p_quantity;

  -- 4. BLOQUEO EXCLUSIVO DE FILA EN ESTADÍSTICAS DEL ALUMNO (FOR UPDATE)
  -- Previene Race Conditions y saldo negativo ante múltiples clics concurrentes
  SELECT coins
  INTO v_coins
  FROM public.student_stats
  WHERE student_id = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontraron estadísticas para el alumno %', p_student_id
      USING ERRCODE = 'P0002';
  END IF;

  -- 5. Verificación atómica de fondos suficientes
  IF v_coins < v_total_cost THEN
    RAISE EXCEPTION 'Fondos insuficientes. Requerido: % monedas, Disponible: % monedas.', 
      v_total_cost, v_coins
      USING ERRCODE = '54000';
  END IF;

  -- 6. Verificación de unicidad para coleccionables únicos (no acumulables)
  IF (v_category IS DISTINCT FROM 'consumable' AND v_category IS DISTINCT FROM 'pocion') THEN
    IF EXISTS (
      SELECT 1 FROM public.student_inventory
      WHERE student_id = p_student_id AND artifact_id = p_artifact_id
    ) THEN
      RAISE EXCEPTION 'El alumno ya posee el artefacto único "%".', v_name
        USING ERRCODE = '23505';
    END IF;
  END IF;

  -- 7. Descuento atómico de saldo
  v_coins := v_coins - v_total_cost;
  UPDATE public.student_stats
  SET coins = v_coins,
      updated_at = now()
  WHERE student_id = p_student_id;

  -- 8. Descuento atómico de stock (si es finito)
  IF v_stock IS NOT NULL THEN
    v_stock := v_stock - p_quantity;
    UPDATE public.shop_artifacts
    SET stock = v_stock
    WHERE id = p_artifact_id;
  END IF;

  -- 9. Inserción atómica en inventario del alumno
  INSERT INTO public.student_inventory (student_id, artifact_id, acquired_at)
  VALUES (p_student_id, p_artifact_id, now());

  -- 10. Notificación y recibo de compra en mensajería interna
  v_message_text := 'Has adquirido "' || v_name || '" por ' || v_total_cost || ' monedas escolares.';
  INSERT INTO public.student_messages (student_id, title, message, is_read, type, sent_at)
  VALUES (p_student_id, '🎁 Compra en Tienda Mágica', v_message_text, false, 'purchase', now())
  RETURNING id INTO v_message_id;

  -- 11. Consolidación de inventario actualizado
  SELECT array_agg(artifact_id) INTO v_inventory
  FROM public.student_inventory
  WHERE student_id = p_student_id;

  -- 12. Retorno exitoso garantizado por ACID
  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', gen_random_uuid(),
    'artifact_id', p_artifact_id,
    'artifact_name', v_name,
    'quantity', p_quantity,
    'total_cost', v_total_cost,
    'new_coins', v_coins,
    'remaining_stock', v_stock,
    'inventory', COALESCE(v_inventory, ARRAY[]::TEXT[]),
    'receipt_message_id', v_message_id
  );
END;
$$;

-- Mantener compatibilidad retroactiva con purchase_artifact apuntando a la transacción atómica
CREATE OR REPLACE FUNCTION public.purchase_artifact(
  p_student_id UUID,
  p_artifact_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  RETURN public.buy_item_transaction(p_student_id, p_artifact_id, 1);
END;
$$;
