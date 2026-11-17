-- ============================================================================
-- MIGRACIÓN UNIFICADA DE ESQUEMA FALTANTE, AISLAMIENTO MULTI-COLEGIO Y RLS ZERO-TRUST
-- Auditoría Forense Integral v2 (ISkool)
-- Garantiza despliegue limpio idempotente, cierra escalación de privilegios DB-01..04
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. CONSOLIDACIÓN IDEMPOTENTE DE TABLAS BASE Y TABLAS FALTANTES EN MIGRACIONES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.schools (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  cct TEXT UNIQUE,
  address TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('superadmin', 'admin', 'director', 'coordinator', 'teacher', 'student', 'parent', 'owner', 'ceo')),
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.academic_years (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.academic_periods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  academic_year_id UUID REFERENCES public.academic_years(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.levels_grades (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  level TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  level_grade_id TEXT,
  academic_year_id UUID,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY,
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  curp TEXT,
  grade TEXT,
  group_id UUID,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  school_id UUID,
  title TEXT NOT NULL,
  description TEXT,
  xp_reward INTEGER DEFAULT 50 NOT NULL,
  coins_reward INTEGER DEFAULT 10 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.quest_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL,
  quest_id UUID,
  school_id UUID,
  score INTEGER DEFAULT 0 NOT NULL,
  is_completed BOOLEAN DEFAULT false NOT NULL,
  answers JSONB DEFAULT '[]'::jsonb,
  feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  group_id UUID,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'present',
  registered_by UUID,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.grades (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id UUID NOT NULL,
  student_id UUID NOT NULL,
  subject_id UUID,
  period_id UUID,
  score NUMERIC(5,2) NOT NULL,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_stats (
  student_id UUID PRIMARY KEY,
  school_id UUID,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  coins INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  max_streak INTEGER DEFAULT 0 NOT NULL,
  last_active_date DATE,
  skill_points INTEGER DEFAULT 0 NOT NULL,
  pet_stage TEXT DEFAULT 'egg' NOT NULL,
  pet_energy INTEGER DEFAULT 100 NOT NULL,
  pet_happiness INTEGER DEFAULT 50 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_avatars (
  student_id UUID PRIMARY KEY,
  avatar_url TEXT,
  skin_id TEXT,
  pet_race TEXT,
  pet_name TEXT,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.shop_artifacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 10,
  stock INTEGER,
  category TEXT DEFAULT 'accessory',
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_inventory (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL,
  artifact_id TEXT NOT NULL,
  acquired_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  type TEXT DEFAULT 'system',
  sent_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Tablas detectadas sin DDL en migraciones previas
CREATE TABLE IF NOT EXISTS public.school_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  school_id TEXT NOT NULL UNIQUE,
  name TEXT,
  website TEXT,
  logo_url TEXT,
  cct TEXT,
  address TEXT,
  phone TEXT,
  coordinators JSONB DEFAULT '[]'::jsonb,
  teachers JSONB DEFAULT '[]'::jsonb,
  theme_colors JSONB,
  primary_color TEXT,
  is_configured BOOLEAN DEFAULT true NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.oauth_credentials (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  provider TEXT NOT NULL UNIQUE,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.guild_bosses (
  id TEXT PRIMARY KEY,
  school_id TEXT,
  name TEXT NOT NULL,
  hp_max INTEGER NOT NULL DEFAULT 200 CHECK (hp_max > 0),
  hp_actual INTEGER NOT NULL DEFAULT 150 CHECK (hp_actual >= 0),
  xp_reward INTEGER NOT NULL DEFAULT 500 CHECK (xp_reward >= 0),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.ai_response_cache (
  cache_key TEXT PRIMARY KEY,
  feature TEXT NOT NULL DEFAULT 'general_academic',
  school_id TEXT,
  model TEXT NOT NULL,
  output JSONB,
  raw_text TEXT,
  tokens_saved INTEGER DEFAULT 0 NOT NULL,
  cached_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.academic_generations (
  generation_id TEXT PRIMARY KEY,
  school_id TEXT,
  grade TEXT,
  cefr TEXT,
  skill TEXT,
  topic TEXT,
  language_function TEXT,
  activity_type TEXT,
  prompt_version TEXT,
  model TEXT,
  knowledge_document_ids JSONB DEFAULT '[]'::jsonb,
  knowledge_versions JSONB DEFAULT '[]'::jsonb,
  generated_output JSONB,
  validation_status TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- Corrección de columnas y restricción UNIQUE faltante en billing_profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'billing_profiles'
  ) THEN
    ALTER TABLE public.billing_profiles
      ADD COLUMN IF NOT EXISTS auto_invoice_on_payment BOOLEAN NOT NULL DEFAULT true;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'billing_profiles_parent_school_unique'
        AND conrelid = 'public.billing_profiles'::regclass
    ) THEN
      DELETE FROM public.billing_profiles a
      USING public.billing_profiles b
      WHERE a.ctid < b.ctid
        AND a.parent_id = b.parent_id
        AND a.school_id = b.school_id;

      ALTER TABLE public.billing_profiles
        ADD CONSTRAINT billing_profiles_parent_school_unique UNIQUE (parent_id, school_id);
    END IF;
  END IF;
END $$;

-- ============================================================================
-- 2. FUNCIONES HELPER DE AISLAMIENTO ESCOLAR Y PRIVILEGIOS ZERO-TRUST
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_user_school_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_school UUID;
BEGIN
  SELECT school_id INTO v_school
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN v_school;
END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_school_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
  SELECT public.get_auth_user_school_id();
$$;

CREATE OR REPLACE FUNCTION public.is_superadmin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
  RETURN v_role = 'superadmin';
END;
$$;

-- ============================================================================
-- 3. DB-01: BLOQUEO DE AUTO-ESCALACIÓN DE ROL O CAMBIO DE PLANTEL EN PROFILES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
BEGIN
  -- Únicamente service_role, superadmin verificado o administración interna de BD pueden alterar role/school_id
  IF v_jwt_role = 'service_role' OR current_user IN ('postgres', 'supabase_admin') OR public.is_superadmin() THEN
    RETURN NEW;
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Operación prohibida: el rol del perfil no puede modificarse directamente desde cliente.'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.school_id IS DISTINCT FROM OLD.school_id THEN
    RAISE EXCEPTION 'Operación prohibida: la asignación de plantel es inmutable para el propio usuario.'
      USING ERRCODE = '42501';
  END IF;

  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "profiles_self_manage" ON public.profiles;
    DROP POLICY IF EXISTS "Aislamiento estricto de perfiles por colegio" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
    DROP POLICY IF EXISTS "profiles_self_update_safe" ON public.profiles;

    CREATE POLICY "profiles_self_select"
      ON public.profiles FOR SELECT
      TO authenticated
      USING (id = auth.uid() OR public.is_superadmin());

    CREATE POLICY "profiles_self_update_safe"
      ON public.profiles FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (id = auth.uid());

    DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
    CREATE TRIGGER trg_prevent_profile_privilege_escalation
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.prevent_profile_privilege_escalation();
  END IF;
END $$;

-- ============================================================================
-- 4. DB-02: ENDURECIMIENTO DE FUNCIONES SECURITY DEFINER Y RPCS FALTANTES
-- ============================================================================

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
  v_jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
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
  IF v_jwt_role <> 'service_role' AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    IF auth.uid() IS NULL OR auth.uid() <> p_student_id THEN
      RAISE EXCEPTION 'No autorizado: solo el propio alumno autenticado puede comprar con sus monedas.'
        USING ERRCODE = '42501';
    END IF;
  END IF;

  IF p_student_id IS NULL OR p_artifact_id IS NULL OR p_quantity <= 0 THEN
    RAISE EXCEPTION 'Parámetros inválidos para compra.' USING ERRCODE = '22023';
  END IF;

  SELECT price, stock, name, category
  INTO v_price, v_stock, v_name, v_category
  FROM public.shop_artifacts
  WHERE id = p_artifact_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'El artefacto % no existe en la tienda oficial.', p_artifact_id USING ERRCODE = 'P0002';
  END IF;

  IF v_stock IS NOT NULL AND v_stock < p_quantity THEN
    RAISE EXCEPTION 'Stock insuficiente para "%".', v_name USING ERRCODE = '55000';
  END IF;

  v_total_cost := v_price * p_quantity;

  SELECT coins
  INTO v_coins
  FROM public.student_stats
  WHERE student_id = p_student_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No se encontraron estadísticas para el alumno %.', p_student_id USING ERRCODE = 'P0002';
  END IF;

  IF v_coins < v_total_cost THEN
    RAISE EXCEPTION 'Fondos insuficientes. Requerido: %, Disponible: %.', v_total_cost, v_coins USING ERRCODE = '54000';
  END IF;

  IF (v_category IS DISTINCT FROM 'consumable' AND v_category IS DISTINCT FROM 'pocion') THEN
    IF EXISTS (
      SELECT 1 FROM public.student_inventory
      WHERE student_id = p_student_id AND artifact_id = p_artifact_id
    ) THEN
      RAISE EXCEPTION 'El alumno ya posee el artefacto único "%".', v_name USING ERRCODE = '23505';
    END IF;
  END IF;

  v_coins := v_coins - v_total_cost;
  UPDATE public.student_stats
  SET coins = v_coins, updated_at = timezone('utc', now())
  WHERE student_id = p_student_id;

  IF v_stock IS NOT NULL THEN
    v_stock := v_stock - p_quantity;
    UPDATE public.shop_artifacts SET stock = v_stock WHERE id = p_artifact_id;
  END IF;

  INSERT INTO public.student_inventory (student_id, artifact_id, acquired_at)
  VALUES (p_student_id, p_artifact_id, timezone('utc', now()));

  v_message_text := 'Has adquirido "' || v_name || '" por ' || v_total_cost || ' monedas escolares.';
  INSERT INTO public.student_messages (student_id, title, message, is_read, type, sent_at)
  VALUES (p_student_id, '🎁 Compra en Tienda Mágica', v_message_text, false, 'purchase', timezone('utc', now()))
  RETURNING id INTO v_message_id;

  SELECT array_agg(artifact_id) INTO v_inventory
  FROM public.student_inventory
  WHERE student_id = p_student_id;

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

CREATE OR REPLACE FUNCTION public.grant_artifact(
  p_student_id UUID,
  p_artifact_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
  v_caller_role TEXT;
  v_caller_school UUID;
  v_target_school UUID;
  v_inventory TEXT[];
  v_message_id UUID;
BEGIN
  IF v_jwt_role <> 'service_role' AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    SELECT role, school_id INTO v_caller_role, v_caller_school
    FROM public.profiles WHERE id = auth.uid() LIMIT 1;

    IF auth.uid() IS NULL OR v_caller_role NOT IN ('teacher', 'coordinator', 'director', 'admin', 'superadmin') THEN
      RAISE EXCEPTION 'No autorizado para otorgar artefactos.' USING ERRCODE = '42501';
    END IF;

    SELECT school_id INTO v_target_school FROM public.students WHERE id = p_student_id LIMIT 1;
    IF v_caller_role <> 'superadmin' AND v_target_school IS NOT NULL AND v_caller_school IS DISTINCT FROM v_target_school THEN
      RAISE EXCEPTION 'Prohibido otorgar artefactos entre planteles distintos.' USING ERRCODE = '42501';
    END IF;
  END IF;

  INSERT INTO public.student_inventory (student_id, artifact_id, acquired_at)
  SELECT p_student_id, p_artifact_id, timezone('utc', now())
  WHERE NOT EXISTS (
    SELECT 1 FROM public.student_inventory
    WHERE student_id = p_student_id AND artifact_id = p_artifact_id
  );

  INSERT INTO public.student_messages (student_id, title, message, is_read, type, sent_at)
  VALUES (p_student_id, '🏅 Reconocimiento Docente', 'Se ha acreditado el artefacto ' || p_artifact_id || ' en tu bóveda.', false, 'reward', timezone('utc', now()))
  RETURNING id INTO v_message_id;

  SELECT array_agg(artifact_id) INTO v_inventory
  FROM public.student_inventory WHERE student_id = p_student_id;

  RETURN jsonb_build_object(
    'success', true,
    'inventory', COALESCE(v_inventory, ARRAY[]::TEXT[]),
    'new_inventory', COALESCE(v_inventory, ARRAY[]::TEXT[]),
    'receipt_message_id', v_message_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.revoke_artifact(
  p_student_id UUID,
  p_artifact_id TEXT,
  p_reason TEXT DEFAULT 'Ajuste administrativo docente'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
  v_caller_role TEXT;
  v_caller_school UUID;
  v_target_school UUID;
  v_inventory TEXT[];
BEGIN
  IF v_jwt_role <> 'service_role' AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    SELECT role, school_id INTO v_caller_role, v_caller_school
    FROM public.profiles WHERE id = auth.uid() LIMIT 1;

    IF auth.uid() IS NULL OR v_caller_role NOT IN ('teacher', 'coordinator', 'director', 'admin', 'superadmin') THEN
      RAISE EXCEPTION 'No autorizado para revocar artefactos.' USING ERRCODE = '42501';
    END IF;

    SELECT school_id INTO v_target_school FROM public.students WHERE id = p_student_id LIMIT 1;
    IF v_caller_role <> 'superadmin' AND v_target_school IS NOT NULL AND v_caller_school IS DISTINCT FROM v_target_school THEN
      RAISE EXCEPTION 'Prohibido revocar artefactos entre planteles distintos.' USING ERRCODE = '42501';
    END IF;
  END IF;

  DELETE FROM public.student_inventory
  WHERE student_id = p_student_id AND artifact_id = p_artifact_id;

  INSERT INTO public.student_messages (student_id, title, message, is_read, type, sent_at)
  VALUES (p_student_id, 'ℹ️ Ajuste de Inventario', COALESCE(p_reason, 'Ajuste administrativo'), false, 'system', timezone('utc', now()));

  SELECT array_agg(artifact_id) INTO v_inventory
  FROM public.student_inventory WHERE student_id = p_student_id;

  RETURN jsonb_build_object(
    'success', true,
    'inventory', COALESCE(v_inventory, ARRAY[]::TEXT[])
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_guild_attack(
  damage_amount INTEGER DEFAULT 10
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_boss RECORD;
  v_damage INTEGER := LEAST(GREATEST(COALESCE(damage_amount, 10), 1), 100);
BEGIN
  IF COALESCE(current_setting('request.jwt.claim.role', true), '') <> 'service_role'
     AND current_user NOT IN ('postgres', 'supabase_admin')
     AND auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Autenticación requerida.' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.guild_bosses (id, name, hp_max, hp_actual, xp_reward)
  VALUES ('boss-historia', 'Guardián de Historia', 200, 150, 500)
  ON CONFLICT (id) DO NOTHING;

  UPDATE public.guild_bosses
  SET hp_actual = GREATEST(0, hp_actual - v_damage),
      updated_at = timezone('utc', now())
  WHERE id = 'boss-historia'
  RETURNING id, name, hp_max, hp_actual, xp_reward INTO v_boss;

  RETURN jsonb_build_object(
    'success', true,
    'id', v_boss.id,
    'name', v_boss.name,
    'hp_max', v_boss.hp_max,
    'hp_actual', v_boss.hp_actual,
    'xp_reward', v_boss.xp_reward
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.execute_forensic_query(
  sql_text TEXT,
  p_school_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
  v_jwt_role TEXT := COALESCE(current_setting('request.jwt.claim.role', true), '');
  v_caller_role TEXT;
  v_clean_sql TEXT;
  v_result JSONB := '[]'::jsonb;
BEGIN
  IF v_jwt_role <> 'service_role' AND current_user NOT IN ('postgres', 'supabase_admin') THEN
    SELECT role INTO v_caller_role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
    IF auth.uid() IS NULL OR v_caller_role NOT IN ('superadmin', 'ceo', 'owner', 'director', 'admin') THEN
      RAISE EXCEPTION 'No autorizado para consultas forenses.' USING ERRCODE = '42501';
    END IF;
  END IF;

  v_clean_sql := regexp_replace(btrim(COALESCE(sql_text, '')), ';+$', '');
  IF v_clean_sql = '' OR v_clean_sql ~ ';' OR v_clean_sql !~* '^(SELECT|WITH)\s' THEN
    RAISE EXCEPTION 'Únicamente se permiten consultas SELECT de lectura única.' USING ERRCODE = '22023';
  END IF;

  IF v_clean_sql ~* '\m(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|REVOKE|CREATE|COPY|EXECUTE|CALL|DO|SET)\M' THEN
    RAISE EXCEPTION 'Operación bloqueada por política de solo lectura.' USING ERRCODE = '42501';
  END IF;

  PERFORM set_config('statement_timeout', '3000', true);
  EXECUTE format('SELECT COALESCE(jsonb_agg(row_to_json(t)), ''[]''::jsonb) FROM (%s) t', v_clean_sql)
  INTO v_result;

  RETURN v_result;
END;
$$;

-- Endurecer permisos sobre RPCs sensibles (revocar acceso anon / public)
DO $$
DECLARE
  v_sig TEXT;
BEGIN
  FOR v_sig IN
    SELECT p.oid::regprocedure::text
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'submit_reading_quest',
        'buy_item_transaction',
        'purchase_artifact',
        'grant_artifact',
        'revoke_artifact',
        'trigger_guild_attack',
        'execute_forensic_query',
        'prevent_profile_privilege_escalation'
      )
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, pg_catalog, pg_temp', v_sig);
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon', v_sig);
    IF v_sig NOT LIKE '%execute_forensic_query%' AND v_sig NOT LIKE '%prevent_profile_privilege_escalation%' THEN
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO authenticated', v_sig);
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- 5. DB-03 & DB-04: POLÍTICAS RLS POR ROL Y ESCUELA (CERO FOR ALL PERMISIVO)
-- ============================================================================

DO $$
DECLARE
  v_table TEXT;
  v_policy TEXT;
BEGIN
  -- 5A. student_stats: lectura propia o personal escolar; escrituras solo personal escolar/service_role (RPC maneja mutaciones)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_stats') THEN
    ALTER TABLE public.student_stats ENABLE ROW LEVEL SECURITY;
    FOR v_policy IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'student_stats' LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.student_stats', v_policy);
    END LOOP;

    CREATE POLICY "student_stats_select_scoped"
      ON public.student_stats FOR SELECT TO authenticated
      USING (
        student_id = auth.uid()
        OR public.is_superadmin()
        OR (
          school_id = (SELECT public.get_auth_user_school_id())
          AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'director', 'coordinator', 'teacher'))
        )
      );

    CREATE POLICY "student_stats_staff_write"
      ON public.student_stats FOR ALL TO authenticated
      USING (
        public.is_superadmin()
        OR (
          school_id = (SELECT public.get_auth_user_school_id())
          AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'director', 'coordinator'))
        )
      )
      WITH CHECK (
        public.is_superadmin()
        OR (
          school_id = (SELECT public.get_auth_user_school_id())
          AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'director', 'coordinator'))
        )
      );
  END IF;

  -- 5B. grades y attendance: lectura escolar, escritura solo docentes/coordinación/dirección del mismo plantel
  FOREACH v_table IN ARRAY ARRAY['grades', 'attendance'] LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = v_table) THEN
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', v_table);
      FOR v_policy IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = v_table LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', v_policy, v_table);
      END LOOP;

      EXECUTE format(
        'CREATE POLICY "%s_read_scoped" ON public.%I FOR SELECT TO authenticated ' ||
        'USING (public.is_superadmin() OR school_id = (SELECT public.get_auth_user_school_id()))',
        v_table, v_table
      );

      EXECUTE format(
        'CREATE POLICY "%s_staff_write" ON public.%I FOR ALL TO authenticated ' ||
        'USING (public.is_superadmin() OR (school_id = (SELECT public.get_auth_user_school_id()) AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN (''teacher'', ''coordinator'', ''director'', ''admin'')))) ' ||
        'WITH CHECK (public.is_superadmin() OR (school_id = (SELECT public.get_auth_user_school_id()) AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN (''teacher'', ''coordinator'', ''director'', ''admin''))))',
        v_table, v_table
      );
    END IF;
  END LOOP;

  -- 5C. Nuevas tablas operativas: RLS estricto
  ALTER TABLE public.school_settings ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "school_settings_read_scoped" ON public.school_settings;
  CREATE POLICY "school_settings_read_scoped"
    ON public.school_settings FOR SELECT TO authenticated
    USING (public.is_superadmin() OR school_id = (SELECT public.get_auth_user_school_id())::text);

  DROP POLICY IF EXISTS "school_settings_write_admin" ON public.school_settings;
  CREATE POLICY "school_settings_write_admin"
    ON public.school_settings FOR ALL TO authenticated
    USING (
      public.is_superadmin()
      OR (school_id = (SELECT public.get_auth_user_school_id())::text AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'director', 'owner', 'ceo')))
    )
    WITH CHECK (
      public.is_superadmin()
      OR (school_id = (SELECT public.get_auth_user_school_id())::text AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'director', 'owner', 'ceo')))
    );

  -- oauth_credentials: nunca expuesta a authenticated/anon desde cliente (solo service_role)
  ALTER TABLE public.oauth_credentials ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "oauth_credentials_deny_all_client" ON public.oauth_credentials;
  CREATE POLICY "oauth_credentials_deny_all_client"
    ON public.oauth_credentials FOR ALL TO authenticated
    USING (false)
    WITH CHECK (false);

  ALTER TABLE public.guild_bosses ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "guild_bosses_read_auth" ON public.guild_bosses;
  CREATE POLICY "guild_bosses_read_auth"
    ON public.guild_bosses FOR SELECT TO authenticated
    USING (true);
  DROP POLICY IF EXISTS "guild_bosses_staff_write" ON public.guild_bosses;
  CREATE POLICY "guild_bosses_staff_write"
    ON public.guild_bosses FOR ALL TO authenticated
    USING (public.is_superadmin() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'coordinator', 'director', 'admin')))
    WITH CHECK (public.is_superadmin() OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'coordinator', 'director', 'admin')));

  ALTER TABLE public.ai_response_cache ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "ai_response_cache_staff_read" ON public.ai_response_cache;
  CREATE POLICY "ai_response_cache_staff_read"
    ON public.ai_response_cache FOR SELECT TO authenticated
    USING (public.is_superadmin() OR (school_id IS NOT NULL AND school_id = (SELECT public.get_auth_user_school_id())::text));

  ALTER TABLE public.academic_generations ENABLE ROW LEVEL SECURITY;
  DROP POLICY IF EXISTS "academic_generations_staff_scoped" ON public.academic_generations;
  CREATE POLICY "academic_generations_staff_scoped"
    ON public.academic_generations FOR ALL TO authenticated
    USING (
      public.is_superadmin()
      OR ((school_id IS NULL OR school_id = (SELECT public.get_auth_user_school_id())::text) AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'coordinator', 'director', 'admin')))
    )
    WITH CHECK (
      public.is_superadmin()
      OR ((school_id IS NULL OR school_id = (SELECT public.get_auth_user_school_id())::text) AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'coordinator', 'director', 'admin')))
    );

  -- 5D. Corregir 'super_admin' -> 'superadmin' y aislar por school_id en teacher_copilot_sessions si existe
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teacher_copilot_sessions') THEN
    DROP POLICY IF EXISTS "teacher_copilot_sessions_teacher_policy" ON public.teacher_copilot_sessions;
    CREATE POLICY "teacher_copilot_sessions_teacher_policy"
      ON public.teacher_copilot_sessions FOR ALL TO authenticated
      USING (
        teacher_id = auth.uid()
        OR public.is_superadmin()
        OR (
          school_id = (SELECT public.get_auth_user_school_id())
          AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('admin', 'director', 'coordinator'))
        )
      )
      WITH CHECK (
        teacher_id = auth.uid()
        OR public.is_superadmin()
      );
  END IF;
END $$;
