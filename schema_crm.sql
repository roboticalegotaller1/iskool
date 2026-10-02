-- ============================================================
-- ISkool CRM Escolar — Esquema de Base de Datos
-- Módulo de Admisiones, Retención y Gestión de Matrícula
-- Base de datos: PostgreSQL (Supabase)
-- ============================================================
-- Convenciones:
--   • Aislamiento multi-inquilino por school_id (FK → schools)
--   • UUID v4 como llave primaria (uuid_generate_v4 / gen_random_uuid)
--   • RLS habilitado en todas las tablas
--   • Eliminación en cascada al borrar escuela
--   • Timestamps con timezone UTC
-- ============================================================

-- ============================================================
-- FASE 1: MODELO CORE — LEADS, CANDIDATOS, ACTIVIDADES
-- ============================================================

/**
 * @table crm_leads
 * @description Prospecto familiar (padre/tutor) que muestra interés en el colegio.
 *   Un lead puede tener múltiples hijos candidatos asociados.
 *   Soporta embudos de Nuevo Ingreso, Reinscripción y Transferencia Interna.
 * @relation Pertenece a schools (N:1). Padre de crm_lead_candidates (1:N) y crm_activities (1:N).
 */
create table if not exists public.crm_leads (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  campus_id text,  -- ID del campus destino (matches Campus.id in seeds)

  -- Clasificación del embudo
  pipeline_type text not null default 'new_enrollment'
    check (pipeline_type in ('new_enrollment', 'reenrollment', 'internal_transfer')),
  stage text not null default 'registered',

  -- Datos del tutor / padre de familia (Estándar SEP: Apellido 1 y Apellido 2 separados)
  tutor_first_name text not null,
  tutor_last_name_1 text,        -- Apellido 1 (Paterno)
  tutor_last_name_2 text,        -- Apellido 2 (Materno)
  tutor_last_name text not null, -- Apellidos combinados (retrocompatibilidad)
  tutor_phone text,         -- Teléfono / WhatsApp (canal prioritario en México)
  tutor_email text,
  tutor_relationship text default 'Padre/Madre',  -- Padre, Madre, Tutor, Abuelo, etc.

  -- Canal de captación
  source_channel text not null default 'walk_in'
    check (source_channel in (
      'facebook', 'instagram', 'google', 'tiktok',
      'website_form', 'whatsapp_direct', 'phone_call', 'walk_in',
      'referral', 'school_fair', 'corporate_agreement',
      'billboard', 'flyer', 'open_house', 'other'
    )),
  source_detail text,  -- Detalle libre: "Feria de Colegios Interlomas 2026", "Convenio Empresa X"

  -- Scoring y asignación
  lead_score integer not null default 0,
  assigned_to uuid references public.profiles(id) on delete set null,  -- Asesor de admisiones
  priority text not null default 'normal'
    check (priority in ('hot', 'warm', 'normal', 'cold')),

  -- Programa de referidos
  referred_by_family_id uuid references public.crm_leads(id) on delete set null,
  referral_incentive_applied boolean default false,

  -- Resultado final
  outcome text  -- null = en proceso
    check (outcome is null or outcome in ('enrolled', 'declined', 'waitlisted', 'deferred')),
  lost_reason text,        -- Motivo tipificado de pérdida
  lost_to_school text,     -- Colegio al que se fue (inteligencia competitiva)

  -- Ciclo escolar objetivo
  target_academic_year text,  -- e.g. "2026-2027"

  -- Auditoría
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices de rendimiento
create index if not exists idx_crm_leads_school on public.crm_leads(school_id);
create index if not exists idx_crm_leads_stage on public.crm_leads(school_id, stage);
create index if not exists idx_crm_leads_pipeline on public.crm_leads(school_id, pipeline_type);
create index if not exists idx_crm_leads_assigned on public.crm_leads(assigned_to);
create index if not exists idx_crm_leads_outcome on public.crm_leads(school_id, outcome);

alter table public.crm_leads enable row level security;

create policy "crm_leads_school_isolation"
  on public.crm_leads for all
  to authenticated
  using (
    school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
  );


/**
 * @table crm_lead_candidates
 * @description Hijos / alumnos candidatos asociados a un lead familiar.
 *   Un lead puede tener 1-N candidatos (hermanos solicitando diferentes grados).
 *   Al matricularse, se vincula con students.id para trazabilidad completa.
 * @relation Pertenece a crm_leads (N:1). Puede vincularse a students (1:1 opcional).
 */
create table if not exists public.crm_lead_candidates (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.crm_leads(id) on delete cascade not null,

  -- Datos del candidato (Estándar SEP: Apellido 1 y Apellido 2 separados)
  first_name text not null,
  last_name_1 text,              -- Apellido 1 (Paterno)
  last_name_2 text,              -- Apellido 2 (Materno)
  last_name text not null,       -- Apellidos combinados (retrocompatibilidad)
  birth_date date,
  gender text check (gender is null or gender in ('M', 'F', 'Otro')),
  curp text,

  -- Nivel y grado solicitado
  target_level text not null
    check (target_level in ('maternal', 'preescolar', 'primaria', 'secundaria', 'preparatoria')),
  target_grade text not null,  -- e.g. "1°", "2°", "Kínder 3"
  target_group text,           -- Grupo sugerido: "A", "B" (asignado al admitir)

  -- Colegio de procedencia
  current_school_name text,
  current_school_grade text,

  -- Necesidades especiales / intereses
  special_needs text,
  interests text,  -- Deportes, idiomas, arte, etc.

  -- Evaluación diagnóstica
  evaluation_status text default 'pending'
    check (evaluation_status in ('pending', 'scheduled', 'completed', 'approved', 'not_approved', 'waived')),
  evaluation_date date,
  evaluation_result text,  -- Notas del resultado: "Favorable para programa bilingüe"
  evaluation_score numeric(5,2),

  -- Beca / descuento negociado
  scholarship_type text
    check (scholarship_type is null or scholarship_type in (
      'academic', 'sports', 'siblings', 'corporate_agreement', 'staff_child',
      'financial_need', 'excellence', 'other'
    )),
  scholarship_percent numeric(5,2) default 0
    check (scholarship_percent >= 0 and scholarship_percent <= 100),
  scholarship_approved_by uuid references public.profiles(id) on delete set null,
  scholarship_approved_at timestamptz,

  -- Conversión a alumno matriculado
  enrolled_student_id uuid references public.students(id) on delete set null,
  enrolled_at timestamptz,

  -- Estado
  status text not null default 'active'
    check (status in ('active', 'enrolled', 'declined', 'waitlisted')),

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_crm_candidates_lead on public.crm_lead_candidates(lead_id);
create index if not exists idx_crm_candidates_status on public.crm_lead_candidates(status);
create index if not exists idx_crm_candidates_enrolled on public.crm_lead_candidates(enrolled_student_id);

alter table public.crm_lead_candidates enable row level security;

create policy "crm_candidates_via_lead"
  on public.crm_lead_candidates for all
  to authenticated
  using (
    exists (
      select 1 from public.crm_leads l
      where l.id = crm_lead_candidates.lead_id
      and (
        l.school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
        or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
      )
    )
  );


/**
 * @table crm_activities
 * @description Bitácora cronológica de todas las interacciones y seguimientos con un lead.
 *   Incluye llamadas, mensajes, visitas, cambios de etapa, tareas y recordatorios.
 * @relation Pertenece a crm_leads (N:1). Vinculada a profiles (creador/ejecutor).
 */
create table if not exists public.crm_activities (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.crm_leads(id) on delete cascade not null,

  activity_type text not null
    check (activity_type in (
      'call', 'whatsapp', 'email', 'sms',
      'visit', 'tour', 'open_house',
      'evaluation', 'interview', 'meeting',
      'note', 'stage_change', 'assignment_change',
      'document_uploaded', 'document_verified',
      'scholarship_request', 'scholarship_approved',
      'payment_received', 'enrollment_completed',
      'task', 'reminder', 'follow_up'
    )),

  title text not null,  -- Resumen breve: "Llamada de seguimiento post-tour"
  description text,     -- Detalle completo de la interacción

  -- Para cambios de etapa
  previous_stage text,
  new_stage text,

  -- Para tareas y recordatorios
  is_task boolean default false,
  scheduled_at timestamptz,  -- Fecha programada de la tarea
  completed_at timestamptz,  -- Fecha en que se completó
  is_overdue boolean default false,

  -- Autoría
  created_by uuid references public.profiles(id) on delete set null,
  completed_by uuid references public.profiles(id) on delete set null,

  created_at timestamptz not null default now()
);

create index if not exists idx_crm_activities_lead on public.crm_activities(lead_id);
create index if not exists idx_crm_activities_type on public.crm_activities(activity_type);
create index if not exists idx_crm_activities_tasks on public.crm_activities(is_task, scheduled_at)
  where is_task = true;

alter table public.crm_activities enable row level security;

create policy "crm_activities_via_lead"
  on public.crm_activities for all
  to authenticated
  using (
    exists (
      select 1 from public.crm_leads l
      where l.id = crm_activities.lead_id
      and (
        l.school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
        or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================
-- FASE 1: EXPEDIENTE DIGITAL DE ADMISIÓN
-- ============================================================

/**
 * @table crm_documents
 * @description Documentos requeridos para el expediente de admisión.
 *   Checklist configurable de documentos obligatorios (acta, CURP, vacunas, etc.)
 *   con seguimiento de estado de entrega y verificación.
 * @relation Pertenece a crm_leads (N:1) y opcionalmente a crm_lead_candidates (N:1).
 */
create table if not exists public.crm_documents (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references public.crm_leads(id) on delete cascade not null,
  candidate_id uuid references public.crm_lead_candidates(id) on delete cascade,

  document_type text not null
    check (document_type in (
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

  status text not null default 'pending'
    check (status in ('pending', 'uploaded', 'verified', 'rejected', 'expired')),
  rejection_reason text,

  uploaded_at timestamptz,
  verified_by uuid references public.profiles(id) on delete set null,
  verified_at timestamptz,
  expires_at date,  -- Documentos con vigencia (ej. cartilla de vacunación)

  created_at timestamptz not null default now()
);

create index if not exists idx_crm_documents_lead on public.crm_documents(lead_id);
create index if not exists idx_crm_documents_candidate on public.crm_documents(candidate_id);
create index if not exists idx_crm_documents_status on public.crm_documents(status);

alter table public.crm_documents enable row level security;

create policy "crm_documents_via_lead"
  on public.crm_documents for all
  to authenticated
  using (
    exists (
      select 1 from public.crm_leads l
      where l.id = crm_documents.lead_id
      and (
        l.school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
        or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================
-- FASE 2: EVENTOS DE CAPTACIÓN Y ASISTENTES
-- ============================================================

/**
 * @table crm_events
 * @description Eventos de captación y reclutamiento escolar.
 *   Open House, ferias, clases muestra, showcases deportivos, tours virtuales.
 *   Se registra costo para cálculo de CAC (Costo de Adquisición por Alumno).
 * @relation Pertenece a schools (N:1). Padre de crm_event_attendees (1:N).
 */
create table if not exists public.crm_events (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,
  campus_id text,

  name text not null,
  event_type text not null default 'open_house'
    check (event_type in (
      'open_house', 'school_fair', 'showcase', 'demo_class',
      'virtual_tour', 'parent_workshop', 'sports_day',
      'academic_expo', 'enrollment_day', 'other'
    )),

  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,

  capacity integer,           -- Cupo máximo de asistentes
  cost_mxn numeric(12,2),     -- Costo total del evento (para cálculo de CAC)

  status text not null default 'planned'
    check (status in ('planned', 'confirmed', 'in_progress', 'completed', 'cancelled')),

  created_at timestamptz not null default now()
);

create index if not exists idx_crm_events_school on public.crm_events(school_id);
create index if not exists idx_crm_events_date on public.crm_events(event_date);

alter table public.crm_events enable row level security;

create policy "crm_events_school_isolation"
  on public.crm_events for all
  to authenticated
  using (
    school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
  );


/**
 * @table crm_event_attendees
 * @description Registro de invitados, confirmaciones y asistencia a eventos de captación.
 * @relation Vincula crm_events (N:1) con crm_leads (N:1).
 */
create table if not exists public.crm_event_attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.crm_events(id) on delete cascade not null,
  lead_id uuid references public.crm_leads(id) on delete cascade not null,

  rsvp_status text not null default 'invited'
    check (rsvp_status in ('invited', 'confirmed', 'attended', 'no_show', 'cancelled')),

  check_in_at timestamptz,
  feedback_rating integer check (feedback_rating is null or (feedback_rating >= 1 and feedback_rating <= 5)),
  feedback_notes text,

  created_at timestamptz not null default now(),

  unique(event_id, lead_id)
);

create index if not exists idx_crm_attendees_event on public.crm_event_attendees(event_id);
create index if not exists idx_crm_attendees_lead on public.crm_event_attendees(lead_id);

alter table public.crm_event_attendees enable row level security;

create policy "crm_attendees_via_event"
  on public.crm_event_attendees for all
  to authenticated
  using (
    exists (
      select 1 from public.crm_events e
      where e.id = crm_event_attendees.event_id
      and (
        e.school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
        or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
      )
    )
  );


-- ============================================================
-- FASE 3: NPS ESCOLAR Y ENCUESTAS DE SATISFACCIÓN
-- ============================================================

/**
 * @table crm_nps_surveys
 * @description Encuestas Net Promoter Score para medir satisfacción familiar.
 *   Se envían automáticamente 2 veces al año para detectar riesgo de deserción.
 */
create table if not exists public.crm_nps_surveys (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,

  family_profile_id uuid references public.profiles(id) on delete cascade not null,  -- Padre/tutor
  student_id uuid references public.students(id) on delete set null,

  survey_period text not null,  -- e.g. "2026-2027-Q1", "2026-2027-Q2"
  nps_score integer not null check (nps_score >= 0 and nps_score <= 10),
  category text generated always as (
    case
      when nps_score >= 9 then 'promoter'
      when nps_score >= 7 then 'passive'
      else 'detractor'
    end
  ) stored,

  -- Áreas de satisfacción desglosadas (1-5)
  academic_quality integer check (academic_quality is null or (academic_quality >= 1 and academic_quality <= 5)),
  teacher_attention integer check (teacher_attention is null or (teacher_attention >= 1 and teacher_attention <= 5)),
  facilities integer check (facilities is null or (facilities >= 1 and facilities <= 5)),
  communication integer check (communication is null or (communication >= 1 and communication <= 5)),
  value_for_money integer check (value_for_money is null or (value_for_money >= 1 and value_for_money <= 5)),

  open_feedback text,  -- Comentario libre de la familia

  created_at timestamptz not null default now()
);

create index if not exists idx_crm_nps_school on public.crm_nps_surveys(school_id);
create index if not exists idx_crm_nps_family on public.crm_nps_surveys(family_profile_id);
create index if not exists idx_crm_nps_period on public.crm_nps_surveys(survey_period);

alter table public.crm_nps_surveys enable row level security;

create policy "crm_nps_school_isolation"
  on public.crm_nps_surveys for all
  to authenticated
  using (
    family_profile_id = auth.uid()
    or school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
  );


-- ============================================================
-- FASE 3: ENTREVISTAS DE SALIDA (EXIT INTERVIEWS)
-- ============================================================

/**
 * @table crm_exit_interviews
 * @description Entrevista estructurada cuando una familia da de baja a un alumno.
 *   Alimenta inteligencia competitiva y detección de patrones de deserción.
 */
create table if not exists public.crm_exit_interviews (
  id uuid default gen_random_uuid() primary key,
  school_id uuid references public.schools(id) on delete cascade not null,

  student_id uuid references public.students(id) on delete set null,
  family_profile_id uuid references public.profiles(id) on delete set null,  -- Padre/tutor

  exit_reason text not null
    check (exit_reason in (
      'price', 'academic_quality', 'bullying', 'distance',
      'city_relocation', 'teacher_issues', 'better_offer',
      'financial_hardship', 'schedule_incompatible',
      'special_needs_unmet', 'family_decision', 'other'
    )),
  exit_reason_detail text,

  destination_school text,      -- Colegio al que se van
  destination_school_type text   -- 'private', 'public', 'homeschool', 'unknown'
    check (destination_school_type is null or destination_school_type in ('private', 'public', 'homeschool', 'unknown')),

  would_return boolean,         -- "¿Regresaría si se resolviera el problema?"
  satisfaction_score integer check (satisfaction_score is null or (satisfaction_score >= 1 and satisfaction_score <= 10)),

  conducted_by uuid references public.profiles(id) on delete set null,
  notes text,

  created_at timestamptz not null default now()
);

create index if not exists idx_crm_exit_school on public.crm_exit_interviews(school_id);
create index if not exists idx_crm_exit_reason on public.crm_exit_interviews(exit_reason);

alter table public.crm_exit_interviews enable row level security;

create policy "crm_exit_school_isolation"
  on public.crm_exit_interviews for all
  to authenticated
  using (
    school_id in (select p.school_id from public.profiles p where p.id = auth.uid())
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('superadmin', 'admin'))
  );


-- ============================================================
-- TRIGGER: Actualización automática de updated_at en crm_leads
-- ============================================================
create or replace function public.handle_crm_lead_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog, pg_temp
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trigger_crm_lead_updated_at on public.crm_leads;
create trigger trigger_crm_lead_updated_at
  before update on public.crm_leads
  for each row
  execute function public.handle_crm_lead_updated_at();

-- Mismo trigger para candidates
drop trigger if exists trigger_crm_candidate_updated_at on public.crm_lead_candidates;
create trigger trigger_crm_candidate_updated_at
  before update on public.crm_lead_candidates
  for each row
  execute function public.handle_crm_lead_updated_at();
