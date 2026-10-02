-- ============================================================================
-- ISkool CRM Escolar Unificado 360° — Esquema de Base de Datos y Seguridad RLS
-- Módulo de Admisiones, Retención y Gestión de Matrícula Multisede
-- Motor: PostgreSQL / Supabase
-- ============================================================================
-- Convenciones de Arquitectura y Guardarraíles:
--   • Aislamiento multi-inquilino hermético por school_id (FK → schools)
--   • UUID v4 como llave primaria (uuid_generate_v4 / gen_random_uuid)
--   • Row Level Security (RLS) mandatorio en el 100% de tablas del CRM
--   • Cero impacto colateral en tablas Académicas (NEM), Finanzas, Gamificación ni Facturación CFDI
--   • Estándar SEP: Apellido 1 (Paterno) y Apellido 2 (Materno) segregados
--   • Timestamps con timezone UTC
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONES DEL SISTEMA
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABLA PRINCIPAL: crm_leads (PROSPECTOS FAMILIARES 1:N)
-- ============================================================================

/**
 * @table crm_leads
 * @description Prospecto familiar (padre/tutor) que muestra interés en el colegio.
 *   Un lead puede tener múltiples hijos candidatos asociados.
 *   Soporta embudos de Nuevo Ingreso, Reinscripción y Transferencia Interna.
 * @relation Pertenece a schools (N:1). Padre de crm_lead_candidates (1:N) y crm_activities (1:N).
 */
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  campus_id text,  -- ID del campus destino (matches Campus.id in seeds: montes, lagos, sancristobal, coacalco)

  -- Clasificación del embudo
  pipeline_type text NOT NULL DEFAULT 'new_enrollment'
    CHECK (pipeline_type IN ('new_enrollment', 'reenrollment', 'internal_transfer')),
  stage text NOT NULL DEFAULT 'registered',

  -- Datos del tutor / padre de familia (Estándar SEP: Apellido 1 y Apellido 2 separados)
  tutor_first_name text NOT NULL,
  tutor_last_name_1 text,        -- Apellido 1 (Paterno)
  tutor_last_name_2 text,        -- Apellido 2 (Materno)
  tutor_last_name text NOT NULL, -- Apellidos combinados (retrocompatibilidad)
  tutor_phone text,         -- Teléfono / WhatsApp (canal prioritario en México)
  tutor_email text,
  tutor_relationship text DEFAULT 'Padre/Madre',  -- Padre, Madre, Tutor, Abuelo, etc.

  -- Canal de captación
  source_channel text NOT NULL DEFAULT 'walk_in'
    CHECK (source_channel IN (
      'facebook', 'instagram', 'google', 'tiktok',
      'website_form', 'whatsapp_direct', 'phone_call', 'walk_in',
      'referral', 'school_fair', 'corporate_agreement',
      'billboard', 'flyer', 'open_house', 'other'
    )),
  source_detail text,  -- Detalle libre: "Feria de Colegios Interlomas 2026", "Convenio Empresa X"

  -- Scoring y asignación
  lead_score integer NOT NULL DEFAULT 0,
  assigned_to uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Asesor de admisiones
  priority text NOT NULL DEFAULT 'normal'
    CHECK (priority IN ('hot', 'warm', 'normal', 'cold')),

  -- Programa de referidos
  referred_by_family_id uuid REFERENCES public.crm_leads(id) ON DELETE SET NULL,
  referral_incentive_applied boolean DEFAULT false,

  -- Resultado final
  outcome text  -- null = en proceso
    CHECK (outcome IS NULL OR outcome IN ('enrolled', 'declined', 'waitlisted', 'deferred')),
  lost_reason text,        -- Motivo tipificado de pérdida
  lost_to_school text,     -- Colegio al que se fue (inteligencia competitiva)

  -- Ciclo escolar objetivo
  target_academic_year text,  -- e.g. "2026-2027"

  -- Auditoría
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_crm_leads_school ON public.crm_leads(school_id);
CREATE INDEX IF NOT EXISTS idx_crm_leads_stage ON public.crm_leads(school_id, stage);
CREATE INDEX IF NOT EXISTS idx_crm_leads_pipeline ON public.crm_leads(school_id, pipeline_type);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned ON public.crm_leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_crm_leads_outcome ON public.crm_leads(school_id, outcome);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_leads_school_isolation" ON public.crm_leads;
CREATE POLICY "crm_leads_school_isolation"
  ON public.crm_leads FOR ALL
  TO authenticated
  USING (
    school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );


-- ============================================================================
-- 3. TABLA DE CANDIDATOS: crm_lead_candidates (ASPIRANTES HIJOS)
-- ============================================================================

/**
 * @table crm_lead_candidates
 * @description Hijos / alumnos candidatos asociados a un lead familiar.
 *   Un lead puede tener 1-N candidatos (hermanos solicitando diferentes grados).
 *   Al matricularse, se vincula con students.id para trazabilidad completa.
 * @relation Pertenece a crm_leads (N:1). Puede vincularse a students (1:1 opcional).
 */
CREATE TABLE IF NOT EXISTS public.crm_lead_candidates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE NOT NULL,

  -- Datos del candidato (Estándar SEP: Apellido 1 y Apellido 2 separados)
  first_name text NOT NULL,
  last_name_1 text,              -- Apellido 1 (Paterno)
  last_name_2 text,              -- Apellido 2 (Materno)
  last_name text NOT NULL,       -- Apellidos combinados (retrocompatibilidad)
  birth_date date,
  gender text CHECK (gender IS NULL OR gender IN ('M', 'F', 'Otro')),
  curp text,

  -- Nivel y grado solicitado
  target_level text NOT NULL
    CHECK (target_level IN ('maternal', 'preescolar', 'primaria', 'secundaria', 'preparatoria')),
  target_grade text NOT NULL,  -- e.g. "1°", "2°", "Kínder 3"
  target_group text,           -- Grupo sugerido: "A", "B" (asignado al admitir)

  -- Colegio de procedencia
  current_school_name text,
  current_school_grade text,

  -- Necesidades especiales / intereses
  special_needs text,
  interests text,  -- Deportes, idiomas, arte, etc.

  -- Evaluación diagnóstica
  evaluation_status text DEFAULT 'pending'
    CHECK (evaluation_status IN ('pending', 'scheduled', 'completed', 'approved', 'not_approved', 'waived')),
  evaluation_date date,
  evaluation_result text,  -- Notas del resultado: "Favorable para programa bilingüe"
  evaluation_score numeric(5,2),

  -- Beca / descuento negociado
  scholarship_type text
    CHECK (scholarship_type IS NULL OR scholarship_type IN (
      'academic', 'sports', 'siblings', 'corporate_agreement', 'staff_child',
      'financial_need', 'excellence', 'other'
    )),
  scholarship_percent numeric(5,2) DEFAULT 0
    CHECK (scholarship_percent >= 0 AND scholarship_percent <= 100),
  scholarship_approved_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  scholarship_approved_at timestamptz,

  -- Conversión a alumno matriculado
  enrolled_student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  enrolled_at timestamptz,

  -- Estado
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'enrolled', 'declined', 'waitlisted')),

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_candidates_lead ON public.crm_lead_candidates(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_candidates_status ON public.crm_lead_candidates(status);
CREATE INDEX IF NOT EXISTS idx_crm_candidates_enrolled ON public.crm_lead_candidates(enrolled_student_id);

ALTER TABLE public.crm_lead_candidates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_candidates_via_lead" ON public.crm_lead_candidates;
CREATE POLICY "crm_candidates_via_lead"
  ON public.crm_lead_candidates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_leads l
      WHERE l.id = crm_lead_candidates.lead_id
      AND (
        l.school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================================
-- 4. BITÁCORA DE INTERACCIONES: crm_activities
-- ============================================================================

/**
 * @table crm_activities
 * @description Bitácora cronológica de todas las interacciones y seguimientos con un lead.
 *   Incluye llamadas, mensajes, visitas, cambios de etapa, tareas y recordatorios.
 * @relation Pertenece a crm_leads (N:1). Vinculada a profiles (creador/ejecutor).
 */
CREATE TABLE IF NOT EXISTS public.crm_activities (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE NOT NULL,

  activity_type text NOT NULL
    CHECK (activity_type IN (
      'call', 'whatsapp', 'email', 'sms',
      'visit', 'tour', 'open_house',
      'evaluation', 'interview', 'meeting',
      'note', 'stage_change', 'assignment_change',
      'document_uploaded', 'document_verified',
      'scholarship_request', 'scholarship_approved',
      'payment_received', 'enrollment_completed',
      'task', 'reminder', 'follow_up'
    )),

  title text NOT NULL,  -- Resumen breve: "Llamada de seguimiento post-tour"
  description text,     -- Detalle completo de la interacción

  -- Para cambios de etapa
  previous_stage text,
  new_stage text,

  -- Para tareas y recordatorios
  is_task boolean DEFAULT false,
  scheduled_at timestamptz,  -- Fecha programada de la tarea
  completed_at timestamptz,  -- Fecha en que se completó
  is_overdue boolean DEFAULT false,

  -- Autoría
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  completed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_activities_lead ON public.crm_activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_activities_type ON public.crm_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_crm_activities_tasks ON public.crm_activities(is_task, scheduled_at)
  WHERE is_task = true;

ALTER TABLE public.crm_activities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_activities_via_lead" ON public.crm_activities;
CREATE POLICY "crm_activities_via_lead"
  ON public.crm_activities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_leads l
      WHERE l.id = crm_activities.lead_id
      AND (
        l.school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================================
-- 5. EXPEDIENTE DIGITAL DE ADMISIÓN: crm_documents (15 DOCUMENTOS)
-- ============================================================================

/**
 * @table crm_documents
 * @description Documentos requeridos para el expediente de admisión.
 *   Checklist configurable de documentos obligatorios (acta, CURP, vacunas, etc.)
 *   con seguimiento de estado de entrega y verificación.
 * @relation Pertenece a crm_leads (N:1) y opcionalmente a crm_lead_candidates (N:1).
 */
CREATE TABLE IF NOT EXISTS public.crm_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE NOT NULL,
  candidate_id uuid REFERENCES public.crm_lead_candidates(id) ON DELETE CASCADE,

  document_type text NOT NULL
    CHECK (document_type IN (
      'birth_certificate', 'curp_document', 'vaccination_card',
      'previous_school_transcript', 'no_debt_letter', 'good_conduct_letter',
      'photos', 'medical_report', 'psycho_evaluation',
      'ine_tutor', 'proof_of_address', 'recommendation_letter',
      'payment_receipt', 'enrollment_contract', 'other'
    )),
  document_label text,  -- Etiqueta legible: "Acta de Nacimiento", "CURP", etc.

  file_url text,
  file_name text,
  file_size_bytes integer,

  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'uploaded', 'verified', 'rejected', 'expired')),
  rejection_reason text,

  uploaded_at timestamptz,
  verified_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  verified_at timestamptz,
  expires_at date,  -- Documentos con vigencia (ej. cartilla de vacunación)

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_documents_lead ON public.crm_documents(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_documents_candidate ON public.crm_documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_crm_documents_status ON public.crm_documents(status);

ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_documents_via_lead" ON public.crm_documents;
CREATE POLICY "crm_documents_via_lead"
  ON public.crm_documents FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_leads l
      WHERE l.id = crm_documents.lead_id
      AND (
        l.school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================================
-- 6. EVENTOS DE CAPTACIÓN: crm_events & crm_event_attendees
-- ============================================================================

/**
 * @table crm_events
 * @description Eventos de captación y reclutamiento escolar (Open House, ferias).
 *   Se registra costo para cálculo de CAC (Costo de Adquisición por Alumno).
 */
CREATE TABLE IF NOT EXISTS public.crm_events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,
  campus_id text,

  name text NOT NULL,
  event_type text NOT NULL DEFAULT 'open_house'
    CHECK (event_type IN (
      'open_house', 'school_fair', 'showcase', 'demo_class',
      'virtual_tour', 'parent_workshop', 'sports_day',
      'academic_expo', 'enrollment_day', 'other'
    )),

  description text,
  event_date date NOT NULL,
  start_time time,
  end_time time,
  location text,

  capacity integer,           -- Cupo máximo de asistentes
  cost_mxn numeric(12,2),     -- Costo total del evento (para cálculo de CAC)

  status text NOT NULL DEFAULT 'planned'
    CHECK (status IN ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_events_school ON public.crm_events(school_id);
CREATE INDEX IF NOT EXISTS idx_crm_events_date ON public.crm_events(event_date);

ALTER TABLE public.crm_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_events_school_isolation" ON public.crm_events;
CREATE POLICY "crm_events_school_isolation"
  ON public.crm_events FOR ALL
  TO authenticated
  USING (
    school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );


/**
 * @table crm_event_attendees
 * @description Registro de invitados, confirmaciones y asistencia a eventos de captación.
 */
CREATE TABLE IF NOT EXISTS public.crm_event_attendees (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES public.crm_events(id) ON DELETE CASCADE NOT NULL,
  lead_id uuid REFERENCES public.crm_leads(id) ON DELETE CASCADE NOT NULL,

  rsvp_status text NOT NULL DEFAULT 'invited'
    CHECK (rsvp_status IN ('invited', 'confirmed', 'attended', 'no_show', 'cancelled')),

  check_in_at timestamptz,
  feedback_rating integer CHECK (feedback_rating IS NULL OR (feedback_rating >= 1 AND feedback_rating <= 5)),
  feedback_notes text,

  created_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(event_id, lead_id)
);

CREATE INDEX IF NOT EXISTS idx_crm_attendees_event ON public.crm_event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_crm_attendees_lead ON public.crm_event_attendees(lead_id);

ALTER TABLE public.crm_event_attendees ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_attendees_via_event" ON public.crm_event_attendees;
CREATE POLICY "crm_attendees_via_event"
  ON public.crm_event_attendees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.crm_events e
      WHERE e.id = crm_event_attendees.event_id
      AND (
        e.school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
        OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================================
-- 7. CALIDAD Y RETENCIÓN: crm_nps_surveys & crm_exit_interviews
-- ============================================================================

/**
 * @table crm_nps_surveys
 * @description Encuestas Net Promoter Score para medir satisfacción familiar.
 */
CREATE TABLE IF NOT EXISTS public.crm_nps_surveys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,

  family_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,  -- Padre/tutor
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,

  survey_period text NOT NULL,  -- e.g. "2026-2027-Q1", "2026-2027-Q2"
  nps_score integer NOT NULL CHECK (nps_score >= 0 AND nps_score <= 10),
  category text GENERATED ALWAYS AS (
    CASE
      WHEN nps_score >= 9 THEN 'promoter'
      WHEN nps_score >= 7 THEN 'passive'
      ELSE 'detractor'
    END
  ) STORED,

  academic_quality integer CHECK (academic_quality IS NULL OR (academic_quality >= 1 AND academic_quality <= 5)),
  teacher_attention integer CHECK (teacher_attention IS NULL OR (teacher_attention >= 1 AND teacher_attention <= 5)),
  facilities integer CHECK (facilities IS NULL OR (facilities >= 1 AND facilities <= 5)),
  communication integer CHECK (communication IS NULL OR (communication >= 1 AND communication <= 5)),
  value_for_money integer CHECK (value_for_money IS NULL OR (value_for_money >= 1 AND value_for_money <= 5)),

  open_feedback text,  -- Comentario libre de la familia

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_nps_school ON public.crm_nps_surveys(school_id);
CREATE INDEX IF NOT EXISTS idx_crm_nps_family ON public.crm_nps_surveys(family_profile_id);
CREATE INDEX IF NOT EXISTS idx_crm_nps_period ON public.crm_nps_surveys(survey_period);

ALTER TABLE public.crm_nps_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_nps_school_isolation" ON public.crm_nps_surveys;
CREATE POLICY "crm_nps_school_isolation"
  ON public.crm_nps_surveys FOR ALL
  TO authenticated
  USING (
    family_profile_id = auth.uid()
    OR school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );


/**
 * @table crm_exit_interviews
 * @description Entrevista estructurada cuando una familia da de baja a un alumno.
 */
CREATE TABLE IF NOT EXISTS public.crm_exit_interviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  school_id uuid REFERENCES public.schools(id) ON DELETE CASCADE NOT NULL,

  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  family_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,  -- Padre/tutor

  exit_reason text NOT NULL
    CHECK (exit_reason IN (
      'price', 'academic_quality', 'bullying', 'distance',
      'city_relocation', 'teacher_issues', 'better_offer',
      'financial_hardship', 'schedule_incompatible',
      'special_needs_unmet', 'family_decision', 'other'
    )),
  exit_reason_detail text,

  destination_school text,      -- Colegio al que se van
  destination_school_type text   -- 'private', 'public', 'homeschool', 'unknown'
    CHECK (destination_school_type IS NULL OR destination_school_type IN ('private', 'public', 'homeschool', 'unknown')),

  would_return boolean,         -- "¿Regresaría si se resolviera el problema?"
  satisfaction_score integer CHECK (satisfaction_score IS NULL OR (satisfaction_score >= 1 AND satisfaction_score <= 10)),

  conducted_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes text,

  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_crm_exit_school ON public.crm_exit_interviews(school_id);
CREATE INDEX IF NOT EXISTS idx_crm_exit_reason ON public.crm_exit_interviews(exit_reason);

ALTER TABLE public.crm_exit_interviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_exit_school_isolation" ON public.crm_exit_interviews;
CREATE POLICY "crm_exit_school_isolation"
  ON public.crm_exit_interviews FOR ALL
  TO authenticated
  USING (
    school_id IN (SELECT p.school_id FROM public.profiles p WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('superadmin', 'admin'))
  );


-- ============================================================================
-- 8. TRIGGERS AUTOMATIZADOS: UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_crm_lead_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, pg_temp
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS trigger_crm_lead_updated_at ON public.crm_leads;
CREATE TRIGGER trigger_crm_lead_updated_at
  BEFORE UPDATE ON public.crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_lead_updated_at();

DROP TRIGGER IF EXISTS trigger_crm_candidate_updated_at ON public.crm_lead_candidates;
CREATE TRIGGER trigger_crm_candidate_updated_at
  BEFORE UPDATE ON public.crm_lead_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_crm_lead_updated_at();
