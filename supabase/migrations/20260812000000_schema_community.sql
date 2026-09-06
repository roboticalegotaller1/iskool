-- Migration: 20260812000000_schema_community.sql
-- Description: Infraestructura de base de datos para "ISkool Canvas y Comunidad Docente"
-- Incluye prevención de fraude en votaciones mediante Llave Primaria Compuesta, RLS y Trigger SECURITY DEFINER.

-- 1. Tabla community_activities
CREATE TABLE IF NOT EXISTS public.community_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    template_type TEXT NOT NULL, -- Ej: 'trivia', 'memorama'
    content_json JSONB NOT NULL, -- Contenido generado por IA o autor
    upvotes INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabla activity_votes (Llave primaría compuesta anti-fraude)
CREATE TABLE IF NOT EXISTS public.activity_votes (
    activity_id UUID NOT NULL REFERENCES public.community_activities(id) ON DELETE CASCADE,
    voter_teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (activity_id, voter_teacher_id)
);

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_community_activities_teacher ON public.community_activities(teacher_id);
CREATE INDEX IF NOT EXISTS idx_activity_votes_voter ON public.activity_votes(voter_teacher_id);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.community_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_votes ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de Seguridad (RLS) para community_activities
DROP POLICY IF EXISTS "Authenticated users can view community activities" ON public.community_activities;
CREATE POLICY "Authenticated users can view community activities"
    ON public.community_activities
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Teachers can create their own community activities" ON public.community_activities;
CREATE POLICY "Teachers can create their own community activities"
    ON public.community_activities
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can update their own community activities" ON public.community_activities;
CREATE POLICY "Teachers can update their own community activities"
    ON public.community_activities
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = teacher_id)
    WITH CHECK (auth.uid() = teacher_id);

DROP POLICY IF EXISTS "Teachers can delete their own community activities" ON public.community_activities;
CREATE POLICY "Teachers can delete their own community activities"
    ON public.community_activities
    FOR DELETE
    TO authenticated
    USING (auth.uid() = teacher_id);

-- 5. Políticas de Seguridad (RLS) para activity_votes
DROP POLICY IF EXISTS "Authenticated users can view activity votes" ON public.activity_votes;
CREATE POLICY "Authenticated users can view activity votes"
    ON public.activity_votes
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Teachers can cast their own vote" ON public.activity_votes;
CREATE POLICY "Teachers can cast their own vote"
    ON public.activity_votes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = voter_teacher_id);

DROP POLICY IF EXISTS "Teachers can remove their own vote" ON public.activity_votes;
CREATE POLICY "Teachers can remove their own vote"
    ON public.activity_votes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = voter_teacher_id);

-- 6. Función Trigger (SECURITY DEFINER) para actualizar contador de upvotes
CREATE OR REPLACE FUNCTION public.handle_activity_vote_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.community_activities
        SET upvotes = upvotes + 1
        WHERE id = NEW.activity_id;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.community_activities
        SET upvotes = GREATEST(0, upvotes - 1)
        WHERE id = OLD.activity_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$;

-- Vincular Trigger a la tabla activity_votes
DROP TRIGGER IF EXISTS trigger_handle_activity_vote ON public.activity_votes;
CREATE TRIGGER trigger_handle_activity_vote
AFTER INSERT OR DELETE ON public.activity_votes
FOR EACH ROW
EXECUTE FUNCTION public.handle_activity_vote_change();
