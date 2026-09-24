-- ============================================================================
-- iSchool — Migración Fase 9: Teacher Copilot
-- Tablas para sesiones de asistencia docente, registro de auditoría e interacciones,
-- y gestión del ciclo de vida de artefactos pedagógicos generados (draft -> approved -> published).
-- ============================================================================

-- 1. Sesiones de Asistencia Docente (Teacher Copilot Sessions)
CREATE TABLE IF NOT EXISTS public.teacher_copilot_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  school_id UUID REFERENCES public.schools(id) ON DELETE SET NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  group_id VARCHAR(100),
  unit_id UUID REFERENCES public.course_units(id) ON DELETE SET NULL,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES public.course_assessments(id) ON DELETE SET NULL,
  
  title VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  
  settings JSONB DEFAULT '{}'::jsonb, -- Restricciones de aula, preferencias docentes
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Registro de Interacciones y Auditoría (Teacher Copilot Interactions / Audit Trail)
CREATE TABLE IF NOT EXISTS public.teacher_copilot_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.teacher_copilot_sessions(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  
  request_text TEXT NOT NULL,
  intent VARCHAR(100) NOT NULL,
  resolved_context JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  model_used VARCHAR(100),
  prompt_version VARCHAR(50),
  response_payload JSONB DEFAULT '{}'::jsonb NOT NULL,
  
  teacher_action VARCHAR(50) DEFAULT 'pending' CHECK (teacher_action IN ('pending', 'approved', 'edited', 'published', 'discarded', 'regenerated')),
  teacher_feedback TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Artefactos Pedagógicos Generados (Teacher Generated Artifacts)
CREATE TABLE IF NOT EXISTS public.teacher_generated_artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.teacher_copilot_sessions(id) ON DELETE CASCADE NOT NULL,
  interaction_id UUID REFERENCES public.teacher_copilot_interactions(id) ON DELETE SET NULL,
  
  artifact_type VARCHAR(100) NOT NULL CHECK (artifact_type IN (
    'lesson_plan', 
    'activity', 
    'assessment_blueprint', 
    'assessment_items', 
    'grouping_plan', 
    'differentiated_activity', 
    'course_progress_report', 
    'daily_brief'
  )),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'edited', 'approved', 'published', 'discarded')),
  
  title VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  version INT DEFAULT 1,
  curriculum_locked BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de consulta frecuente
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_teacher_id ON public.teacher_copilot_sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_copilot_sessions_course_id ON public.teacher_copilot_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_copilot_interactions_session_id ON public.teacher_copilot_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_copilot_artifacts_session_id ON public.teacher_generated_artifacts(session_id);
CREATE INDEX IF NOT EXISTS idx_copilot_artifacts_status ON public.teacher_generated_artifacts(status);

-- RLS (Row Level Security)
ALTER TABLE public.teacher_copilot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_copilot_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_generated_artifacts ENABLE ROW LEVEL SECURITY;

-- Políticas de aislamiento multi-inquilino
CREATE POLICY teacher_copilot_sessions_teacher_policy ON public.teacher_copilot_sessions
  FOR ALL
  USING (
    teacher_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY teacher_copilot_interactions_teacher_policy ON public.teacher_copilot_interactions
  FOR ALL
  USING (
    teacher_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY teacher_generated_artifacts_teacher_policy ON public.teacher_generated_artifacts
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_copilot_sessions s
      WHERE s.id = teacher_generated_artifacts.session_id 
        AND (s.teacher_id = auth.uid() OR EXISTS (
          SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'super_admin')
        ))
    )
  );
