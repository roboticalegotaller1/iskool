-- ============================================================================
-- iSchool — Migración Fase 11: Leadership Dashboard + Coordinator Copilot
-- Tablas para el Centro de Acción Académica (Action Center), Historial del Ciclo
-- de Vida de Alertas, y Registro de Auditoría del Asistente de Coordinación.
-- ============================================================================

-- 1. Tabla de Acciones Académicas (Action Center)
CREATE TABLE IF NOT EXISTS public.academic_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  alert_id UUID REFERENCES public.academic_alerts(id) ON DELETE SET NULL,
  
  action_type VARCHAR(100) NOT NULL CHECK (action_type IN (
    'review_prerequisite',
    'schedule_targeted_practice',
    'collect_more_evidence',
    'delay_assessment',
    'create_intervention',
    'observe_skill',
    'prepare_teacher_support',
    'dismiss_signal'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  
  affected_scope_type VARCHAR(50) NOT NULL,
  affected_scope_id VARCHAR(100) NOT NULL,
  target_knowledge_id VARCHAR(150),
  
  assigned_to_role VARCHAR(50) DEFAULT 'teacher',
  scheduled_review_date DATE,
  
  requires_coordinator_approval BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Historial de Transiciones de Estado de Alertas (Alert Lifecycle History)
CREATE TABLE IF NOT EXISTS public.academic_alert_state_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id UUID NOT NULL REFERENCES public.academic_alerts(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL CHECK (new_status IN ('new', 'reviewed', 'actioned', 'resolved', 'dismissed', 'active', 'acknowledged')),
  changed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Auditoría de Consultas del Asistente de Coordinación (Coordinator Copilot Audits)
CREATE TABLE IF NOT EXISTS public.coordinator_copilot_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_role VARCHAR(50) NOT NULL,
  
  raw_query TEXT NOT NULL,
  resolved_intent VARCHAR(100) NOT NULL,
  scope_descriptor JSONB NOT NULL,
  metrics_queried JSONB NOT NULL,
  
  prompt_version VARCHAR(50) NOT NULL DEFAULT 'v1.0.0',
  model_identifier VARCHAR(100) NOT NULL DEFAULT 'models/pedagogical-ai-core',
  response_summary TEXT NOT NULL,
  suggested_actions JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de consulta eficiente
CREATE INDEX IF NOT EXISTS idx_academic_actions_school ON public.academic_actions(school_id, status);
CREATE INDEX IF NOT EXISTS idx_academic_actions_alert ON public.academic_actions(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert ON public.academic_alert_state_history(alert_id, created_at);
CREATE INDEX IF NOT EXISTS idx_coordinator_audits_user ON public.coordinator_copilot_audits(user_id, created_at);

-- RLS (Row Level Security)
ALTER TABLE public.academic_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_alert_state_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coordinator_copilot_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY academic_actions_read_policy ON public.academic_actions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('coordinator', 'director', 'admin', 'superadmin', 'owner', 'teacher')
    )
  );

CREATE POLICY academic_actions_write_policy ON public.academic_actions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('coordinator', 'director', 'admin', 'superadmin', 'owner')
    )
  );

CREATE POLICY alert_history_read_policy ON public.academic_alert_state_history
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('coordinator', 'director', 'admin', 'superadmin', 'owner', 'teacher')
    )
  );

CREATE POLICY coordinator_audits_read_policy ON public.coordinator_copilot_audits
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('coordinator', 'director', 'admin', 'superadmin', 'owner')
    )
  );
