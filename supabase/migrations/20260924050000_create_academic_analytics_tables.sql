-- ============================================================================
-- iSchool — Migración Fase 10: Academic Analytics Engine
-- Tablas para snapshots periódicos de analítica pedagógica, registro de alertas
-- académicas estructuradas y seguimiento longitudinal de intervenciones didácticas.
-- ============================================================================

-- 1. Instantáneas Históricas de Analítica Académica (Academic Analytics Snapshots)
CREATE TABLE IF NOT EXISTS public.academic_analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  group_id VARCHAR(100),
  grade VARCHAR(50),
  snapshot_date DATE NOT NULL,
  period_type VARCHAR(50) DEFAULT 'monthly' CHECK (period_type IN ('daily', 'weekly', 'monthly', 'unit_end', 'term_end', 'semester_end')),
  
  metrics_payload JSONB NOT NULL, -- Cobertura, maestría por habilidad, distribución CEFR, gaps
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Registro de Alertas Académicas Estructuradas (Academic Alerts)
CREATE TABLE IF NOT EXISTS public.academic_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  
  scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('student', 'group', 'course', 'curriculum', 'grade')),
  scope_id VARCHAR(100) NOT NULL,
  
  alert_type VARCHAR(100) NOT NULL CHECK (alert_type IN (
    'student_gap', 
    'group_gap', 
    'curriculum_bottleneck', 
    'assessment_issue', 
    'course_delay', 
    'mastery_stagnation', 
    'low_evidence', 
    'skill_imbalance', 
    'coverage_gap',
    'instruction_mastery_gap'
  )),
  severity VARCHAR(20) DEFAULT 'attention' CHECK (severity IN ('info', 'attention', 'priority')),
  
  target_knowledge_id VARCHAR(150),
  signal_summary TEXT NOT NULL,
  supporting_evidence JSONB NOT NULL,
  suggested_actions JSONB NOT NULL,
  
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  acknowledged_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Seguimiento Longitudinal de Intervenciones Pedagógicas (Academic Interventions)
CREATE TABLE IF NOT EXISTS public.academic_interventions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
  
  scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('student', 'group', 'grade')),
  scope_id VARCHAR(100) NOT NULL,
  
  target_knowledge_id VARCHAR(150) NOT NULL,
  strategy TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  
  baseline_mastery NUMERIC(5,2) NOT NULL,
  post_intervention_mastery NUMERIC(5,2),
  
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
  lead_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de consulta de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_academic_snapshots_scope ON public.academic_analytics_snapshots(course_id, group_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_academic_alerts_scope ON public.academic_alerts(scope_type, scope_id, status);
CREATE INDEX IF NOT EXISTS idx_academic_alerts_severity ON public.academic_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_academic_interventions_target ON public.academic_interventions(target_knowledge_id, status);

-- RLS (Row Level Security)
ALTER TABLE public.academic_analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY academic_snapshots_read_policy ON public.academic_analytics_snapshots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner')
    )
  );

CREATE POLICY academic_alerts_read_policy ON public.academic_alerts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner')
    )
  );

CREATE POLICY academic_interventions_policy ON public.academic_interventions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'coordinator', 'director', 'admin', 'superadmin', 'owner')
    )
  );
