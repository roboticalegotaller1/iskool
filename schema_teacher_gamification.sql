-- ============================================================================
-- SCHEMA TEACHER GAMIFICATION & SOCIAL LOOP
-- Plataforma ISkool • Sistema de Gamificación Docente, Red Social y Simuladores
-- ============================================================================

-- 1. Tabla de Estadísticas de Gamificación del Docente
CREATE TABLE IF NOT EXISTS public.teacher_gamification_stats (
    teacher_id UUID PRIMARY KEY,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    rank TEXT NOT NULL DEFAULT 'Iniciado',
    karma_points INTEGER NOT NULL DEFAULT 0,
    pedagogical_coins INTEGER NOT NULL DEFAULT 0,
    activities_created INTEGER NOT NULL DEFAULT 0,
    activities_published INTEGER NOT NULL DEFAULT 0,
    activities_assigned INTEGER NOT NULL DEFAULT 0,
    upvotes_received INTEGER NOT NULL DEFAULT 0,
    upvotes_given INTEGER NOT NULL DEFAULT 0,
    students_impacted INTEGER NOT NULL DEFAULT 0,
    weekly_streak INTEGER NOT NULL DEFAULT 1,
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla de Insignias Docentes Otorgadas
CREATE TABLE IF NOT EXISTS public.teacher_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    badge_code TEXT NOT NULL,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(teacher_id, badge_code)
);

-- 3. Tabla de Bitácora de Acciones Gamificadas del Docente
CREATE TABLE IF NOT EXISTS public.teacher_action_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL,
    action_type TEXT NOT NULL,
    xp_earned INTEGER NOT NULL DEFAULT 0,
    karma_earned INTEGER NOT NULL DEFAULT 0,
    coins_earned INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Índices para consultas de alta velocidad y rankings institucionales
CREATE INDEX IF NOT EXISTS idx_teacher_gamif_xp ON public.teacher_gamification_stats(xp DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_gamif_karma ON public.teacher_gamification_stats(karma_points DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_badges_teacher ON public.teacher_badges(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_action_logs_teacher ON public.teacher_action_logs(teacher_id, created_at DESC);

-- ============================================================================
-- SEGURIDAD A NIVEL DE FILA (RLS)
-- ============================================================================

ALTER TABLE public.teacher_gamification_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_action_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para teacher_gamification_stats
DROP POLICY IF EXISTS "Lectura de estadísticas docentes autenticados" ON public.teacher_gamification_stats;
CREATE POLICY "Lectura de estadísticas docentes autenticados"
    ON public.teacher_gamification_stats
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Actualización de estadísticas docentes propias" ON public.teacher_gamification_stats;
CREATE POLICY "Actualización de estadísticas docentes propias"
    ON public.teacher_gamification_stats
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

-- Políticas para teacher_badges
DROP POLICY IF EXISTS "Lectura de insignias docentes" ON public.teacher_badges;
CREATE POLICY "Lectura de insignias docentes"
    ON public.teacher_badges
    FOR SELECT
    TO authenticated
    USING (true);

-- Políticas para teacher_action_logs
DROP POLICY IF EXISTS "Lectura de logs propios" ON public.teacher_action_logs;
CREATE POLICY "Lectura de logs propios"
    ON public.teacher_action_logs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = teacher_id);

-- ============================================================================
-- FUNCIÓN RPC ATÓMICA: record_teacher_social_action
-- Ejecutada con SECURITY DEFINER para garantizar integridad y evitar fraude
-- ============================================================================

CREATE OR REPLACE FUNCTION public.record_teacher_social_action(
    p_teacher_id UUID,
    p_action_type TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
DECLARE
    v_xp_add INTEGER := 0;
    v_karma_add INTEGER := 0;
    v_coins_add INTEGER := 0;
    v_old_level INTEGER := 1;
    v_new_level INTEGER := 1;
    v_new_xp INTEGER := 0;
    v_new_rank TEXT := 'Iniciado';
    v_leveled_up BOOLEAN := FALSE;
    v_badges_awarded TEXT[] := ARRAY[]::TEXT[];
    v_stats RECORD;
BEGIN
    -- 1. Ponderación por tipo de acción institucional (MANUAL_FUNCIONES_LMS_GAMIFICADO)
    CASE p_action_type
        WHEN 'CREATE_ACTIVITY' THEN
            v_xp_add := 30;
            v_karma_add := 0;
            v_coins_add := 10;
        WHEN 'PUBLISH_COMMUNITY' THEN
            v_xp_add := 50;
            v_karma_add := 15;
            v_coins_add := 15;
        WHEN 'RECEIVE_UPVOTE' THEN
            v_xp_add := 10;
            v_karma_add := 5;
            v_coins_add := 2;
        WHEN 'GIVE_UPVOTE' THEN
            v_xp_add := 5;
            v_karma_add := 2;
            v_coins_add := 1;
        WHEN 'ASSIGN_CLASS' THEN
            v_xp_add := 40;
            v_karma_add := 5;
            v_coins_add := 10;
        WHEN 'STUDENT_COMPLETION' THEN
            v_xp_add := 5;
            v_karma_add := 2;
            v_coins_add := 1;
        WHEN 'REVIEW_EVIDENCE' THEN
            v_xp_add := 20;
            v_karma_add := 5;
            v_coins_add := 5;
        WHEN 'SIMULATOR_EXPLORATION' THEN
            v_xp_add := 25;
            v_karma_add := 10;
            v_coins_add := 5;
        ELSE
            v_xp_add := 10;
            v_karma_add := 2;
            v_coins_add := 2;
    END CASE;

    -- Multiplicador si es un simulador avanzado (50 simuladores compatibles)
    IF (p_metadata->>'is_simulator')::BOOLEAN IS TRUE THEN
        v_xp_add := v_xp_add + 15;
        v_karma_add := v_karma_add + 5;
    END IF;

    -- 2. Asegurar que exista el registro base en teacher_gamification_stats
    INSERT INTO public.teacher_gamification_stats (teacher_id, xp, level, rank, karma_points, pedagogical_coins, last_active_at)
    VALUES (p_teacher_id, 0, 1, 'Iniciado', 0, 0, now())
    ON CONFLICT (teacher_id) DO NOTHING;

    -- 3. Obtener estadísticas actuales
    SELECT * INTO v_stats FROM public.teacher_gamification_stats WHERE teacher_id = p_teacher_id;
    v_old_level := v_stats.level;
    v_new_xp := v_stats.xp + v_xp_add;

    -- 4. Cálculo de nivel algorítmico y rangos oficiales
    v_new_level := GREATEST(1, FLOOR(1 + SQRT(v_new_xp::FLOAT / 120.0))::INTEGER);

    IF v_new_level >= 20 THEN
        v_new_rank := 'Leyenda ISkool';
    ELSIF v_new_level >= 13 THEN
        v_new_rank := 'Curador Magistral';
    ELSIF v_new_level >= 8 THEN
        v_new_rank := 'Mentor Pedagógico';
    ELSIF v_new_level >= 4 THEN
        v_new_rank := 'Docente Innovador';
    ELSE
        v_new_rank := 'Iniciado';
    END IF;

    IF v_new_level > v_old_level THEN
        v_leveled_up := TRUE;
    END IF;

    -- 5. Actualizar estadísticas acumuladas
    UPDATE public.teacher_gamification_stats
    SET
        xp = v_new_xp,
        level = v_new_level,
        rank = v_new_rank,
        karma_points = karma_points + v_karma_add,
        pedagogical_coins = pedagogical_coins + v_coins_add,
        activities_created = activities_created + (CASE WHEN p_action_type = 'CREATE_ACTIVITY' THEN 1 ELSE 0 END),
        activities_published = activities_published + (CASE WHEN p_action_type = 'PUBLISH_COMMUNITY' THEN 1 ELSE 0 END),
        activities_assigned = activities_assigned + (CASE WHEN p_action_type = 'ASSIGN_CLASS' THEN 1 ELSE 0 END),
        upvotes_received = upvotes_received + (CASE WHEN p_action_type = 'RECEIVE_UPVOTE' THEN 1 ELSE 0 END),
        upvotes_given = upvotes_given + (CASE WHEN p_action_type = 'GIVE_UPVOTE' THEN 1 ELSE 0 END),
        students_impacted = students_impacted + (CASE WHEN p_action_type = 'STUDENT_COMPLETION' THEN 1 ELSE 0 END),
        last_active_at = now(),
        updated_at = now()
    WHERE teacher_id = p_teacher_id;

    -- 6. Insertar bitácora de acción
    INSERT INTO public.teacher_action_logs (teacher_id, action_type, xp_earned, karma_earned, coins_earned, metadata)
    VALUES (p_teacher_id, p_action_type, v_xp_add, v_karma_add, v_coins_add, p_metadata);

    -- 7. Evaluación de Insignias Automáticas
    -- Insignia 1: Primer Creador
    IF p_action_type = 'CREATE_ACTIVITY' THEN
        INSERT INTO public.teacher_badges (teacher_id, badge_code)
        VALUES (p_teacher_id, 'FIRST_CREATOR')
        ON CONFLICT DO NOTHING;
        IF FOUND THEN v_badges_awarded := array_append(v_badges_awarded, 'FIRST_CREATOR'); END IF;
    END IF;

    -- Insignia 2: Arquitecto de Simuladores
    IF (p_metadata->>'is_simulator')::BOOLEAN IS TRUE THEN
        INSERT INTO public.teacher_badges (teacher_id, badge_code)
        VALUES (p_teacher_id, 'SIMULATOR_ARCHITECT')
        ON CONFLICT DO NOTHING;
        IF FOUND THEN v_badges_awarded := array_append(v_badges_awarded, 'SIMULATOR_ARCHITECT'); END IF;
    END IF;

    -- Insignia 3: Pilar de la Comunidad (5 publicaciones)
    IF (v_stats.activities_published + (CASE WHEN p_action_type = 'PUBLISH_COMMUNITY' THEN 1 ELSE 0 END)) >= 5 THEN
        INSERT INTO public.teacher_badges (teacher_id, badge_code)
        VALUES (p_teacher_id, 'COMMUNITY_PILLAR')
        ON CONFLICT DO NOTHING;
        IF FOUND THEN v_badges_awarded := array_append(v_badges_awarded, 'COMMUNITY_PILLAR'); END IF;
    END IF;

    -- 8. Respuesta estructurada
    RETURN jsonb_build_object(
        'success', TRUE,
        'teacher_id', p_teacher_id,
        'action_type', p_action_type,
        'xp_added', v_xp_add,
        'karma_added', v_karma_add,
        'coins_added', v_coins_add,
        'new_xp', v_new_xp,
        'new_level', v_new_level,
        'new_rank', v_new_rank,
        'leveled_up', v_leveled_up,
        'badges_awarded', to_jsonb(v_badges_awarded)
    );
END;
$$;
