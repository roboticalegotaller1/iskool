-- ============================================================================
-- iSchool — Migración Fase 12: Production Readiness, Governance, AI Gateway & Cost Control
-- Tablas para Entregas Curriculares (Curriculum Releases), Contabilidad y Presupuestos
-- de IA (AI Cost Ledgers & Budgets), Auditoría Inmutable y Registro de Feedback Docente.
-- ============================================================================

-- 1. Tabla de Entregas Curriculares Inmutables (Curriculum Releases)
CREATE TABLE IF NOT EXISTS public.curriculum_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  release_tag VARCHAR(100) UNIQUE NOT NULL, -- ej: 'release_1.0_english_2026'
  academic_year VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  
  description TEXT NOT NULL,
  approved_node_ids JSONB NOT NULL, -- Lista de IDs de nodos del Knowledge Vault congelados
  node_versions_snapshot JSONB NOT NULL, -- Snapshot de versiones de cada nodo
  
  status VARCHAR(50) DEFAULT 'published' CHECK (status IN ('draft', 'review', 'published', 'deprecated', 'archived')),
  published_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ DEFAULT now(),
  
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla del Libro Mayor de Costos de IA (AI Cost Ledgers)
CREATE TABLE IF NOT EXISTS public.ai_cost_ledgers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_role VARCHAR(50) NOT NULL,
  
  request_id VARCHAR(120) NOT NULL,
  feature VARCHAR(100) NOT NULL CHECK (feature IN (
    'academic_generation',
    'ai_tutor',
    'teacher_copilot',
    'coordinator_copilot',
    'insight_service',
    'activity_generator'
  )),
  
  model_identifier VARCHAR(100) NOT NULL,
  input_tokens INTEGER NOT NULL DEFAULT 0,
  output_tokens INTEGER NOT NULL DEFAULT 0,
  latency_ms INTEGER NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(10, 6) NOT NULL DEFAULT 0.000000,
  
  status VARCHAR(50) NOT NULL CHECK (status IN ('success', 'failed', 'circuit_broken', 'rate_limited', 'cached')),
  cache_hit BOOLEAN DEFAULT false,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Presupuestos de IA por Escuela (AI School Budgets)
CREATE TABLE IF NOT EXISTS public.ai_school_budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID UNIQUE REFERENCES public.schools(id) ON DELETE CASCADE,
  
  billing_month VARCHAR(20) NOT NULL, -- ej: '2026-09'
  monthly_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
  current_spend_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
  
  alert_threshold_percent INTEGER NOT NULL DEFAULT 80,
  status VARCHAR(50) DEFAULT 'normal' CHECK (status IN ('normal', 'warning', 'limit_approaching', 'restricted')),
  
  allow_overage BOOLEAN DEFAULT false,
  notifications_sent JSONB DEFAULT '[]'::jsonb,
  
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Registro Inmutable de Auditoría de IA y Plataforma (ISkool Platform Audit Logs)
CREATE TABLE IF NOT EXISTS public.iskool_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_role VARCHAR(50) NOT NULL,
  
  action_category VARCHAR(100) NOT NULL CHECK (action_category IN (
    'security_tenant_isolation',
    'curriculum_release_published',
    'curriculum_node_approval',
    'mastery_manual_override',
    'ai_generation_request',
    'ai_budget_alert',
    'content_safety_escalation',
    'auth_permission_change'
  )),
  
  action_summary TEXT NOT NULL,
  affected_resource_type VARCHAR(100) NOT NULL,
  affected_resource_id VARCHAR(150) NOT NULL,
  
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address VARCHAR(50),
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Feedback y Evaluación Docente de Generaciones de IA (AI Teacher Feedback)
CREATE TABLE IF NOT EXISTS public.ai_teacher_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  generation_id VARCHAR(150) NOT NULL,
  
  rating VARCHAR(50) NOT NULL CHECK (rating IN ('useful', 'not_useful', 'too_easy', 'too_difficult', 'incorrect', 'inappropriate')),
  feedback_tags JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de consulta de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_curriculum_releases_tag ON public.curriculum_releases(release_tag);
CREATE INDEX IF NOT EXISTS idx_ai_cost_school_month ON public.ai_cost_ledgers(school_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_cost_feature ON public.ai_cost_ledgers(feature);
CREATE INDEX IF NOT EXISTS idx_ai_cost_request ON public.ai_cost_ledgers(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_budgets_school ON public.ai_school_budgets(school_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_school ON public.iskool_audit_logs(school_id, action_category);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_generation ON public.ai_teacher_feedbacks(generation_id);

-- RLS (Row Level Security)
ALTER TABLE public.curriculum_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_cost_ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_school_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iskool_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_teacher_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY curriculum_releases_read_policy ON public.curriculum_releases
  FOR SELECT
  USING (true); -- Releases publicadas accesibles para toda la comunidad académica

CREATE POLICY ai_cost_ledgers_read_policy ON public.ai_cost_ledgers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'owner', 'director')
    )
  );

CREATE POLICY ai_budgets_read_policy ON public.ai_school_budgets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'owner', 'director')
    )
  );

CREATE POLICY audit_logs_read_policy ON public.iskool_audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'superadmin', 'owner')
    )
  );

CREATE POLICY teacher_feedbacks_policy ON public.ai_teacher_feedbacks
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'coordinator', 'director', 'admin', 'superadmin')
    )
  );
