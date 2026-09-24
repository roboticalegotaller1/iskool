-- ============================================================================
-- MIGRACIÓN: CREACIÓN DE TABLAS PARA AI TUTOR LAYER (FASE 8)
-- Sesiones de Tutoría Pedagógica y Mensajes Conversacionales
-- ============================================================================

-- 1. Tabla de Sesiones del AI Tutor (Tutor Sessions)
-- Ancla la conversación con el alumno a la lección, curso, Bóveda Curricular y perfil competencial.
CREATE TABLE IF NOT EXISTS public.tutor_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  unit_id UUID REFERENCES public.course_units(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
  
  session_type TEXT NOT NULL DEFAULT 'lesson_support' CHECK (session_type IN (
    'lesson_support', 'practice', 'review', 'homework_help', 'gap_remediation', 'extension', 'assessment_preparation'
  )),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'abandoned')),
  tutor_mode TEXT NOT NULL DEFAULT 'guided_practice' CHECK (tutor_mode IN (
    'explain', 'guided_practice', 'socratic', 'practice', 'feedback', 'review', 'challenge'
  )),
  scaffolding_level TEXT NOT NULL DEFAULT 'medium' CHECK (scaffolding_level IN ('high', 'medium', 'low')),
  language_policy TEXT NOT NULL DEFAULT 'mostly_target_language' CHECK (language_policy IN (
    'target_language_only', 'mostly_target_language', 'bilingual_support'
  )),
  
  primary_learning_outcome TEXT NOT NULL,
  knowledge_target_ids TEXT[] NOT NULL DEFAULT '{}',
  
  -- Memoria y estado académico estructurado de la sesión
  conversation_state JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Evidencia formativa resultante ligada al subsistema adaptativo (Fase 7)
  evidence_id UUID REFERENCES public.learning_evidences(id) ON DELETE SET NULL,
  
  started_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  completed_at TIMESTAMPTZ,
  duration_seconds INT NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Mensajes de la Sesión del Tutor (Tutor Session Messages)
-- Bitácora de turnos conversacionales con metadatos pedagógicos.
CREATE TABLE IF NOT EXISTS public.tutor_session_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES public.tutor_sessions(id) ON DELETE CASCADE NOT NULL,
  
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  
  tutor_action TEXT, -- e.g., 'explain', 'ask', 'hint', 'practice', 'review_prerequisite', 'exit_check', 'finish'
  hint_level INT CHECK (hint_level >= 1 AND hint_level <= 5),
  scaffolding_level TEXT CHECK (scaffolding_level IN ('high', 'medium', 'low')),
  
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_student ON public.tutor_sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_lesson ON public.tutor_sessions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_tutor_sessions_status ON public.tutor_sessions(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_tutor_messages_session ON public.tutor_session_messages(session_id, created_at ASC);

-- ============================================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.tutor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutor_session_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento escolar para sesiones de tutoría
DROP POLICY IF EXISTS "tutor_sessions_isolation" ON public.tutor_sessions;
CREATE POLICY "tutor_sessions_isolation"
  ON public.tutor_sessions FOR ALL
  TO authenticated
  USING (
    auth.uid() = student_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('teacher', 'coordinator', 'admin', 'director', 'superadmin')
    )
  );

-- Políticas de aislamiento escolar para mensajes de la tutoría
DROP POLICY IF EXISTS "tutor_messages_isolation" ON public.tutor_session_messages;
CREATE POLICY "tutor_messages_isolation"
  ON public.tutor_session_messages FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.tutor_sessions s
      WHERE s.id = tutor_session_messages.session_id
        AND (
          s.student_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('teacher', 'coordinator', 'admin', 'director', 'superadmin')
          )
        )
    )
  );
