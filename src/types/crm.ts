/**
 * @module CRM Types
 * @description Tipos del módulo CRM Escolar de ISkool.
 *   Gestión de prospectos familiares, candidatos, pipeline de admisiones,
 *   expediente digital, eventos de captación y métricas directivas.
 * @database Mapea a las tablas crm_leads, crm_lead_candidates, crm_activities,
 *   crm_documents, crm_events, crm_event_attendees, crm_nps_surveys, crm_exit_interviews.
 */

// ============================================================
// CONTROL DE ACCESO Y ROLES AUTORIZADOS DEL CRM
// ============================================================

export type CrmAuthorizedRole = 'owner' | 'director' | 'admin' | 'superadmin' | 'admissions_sales' | 'ventas';

export const CRM_AUTHORIZED_ROLES: string[] = [
  'owner',
  'director',
  'admin',
  'superadmin',
  'admissions_sales',
  'ventas'
];

export function isCrmAuthorized(user?: { role?: string; email?: string } | null): boolean {
  if (!user) return false;
  const role = user.role?.toLowerCase() || '';
  const email = user.email?.toLowerCase() || '';
  return (
    CRM_AUTHORIZED_ROLES.includes(role) ||
    email.includes('ventas') ||
    email.includes('admisiones')
  );
}

// ============================================================
// CONSTANTES DE PIPELINE
// ============================================================

/** Etapas del embudo de Nuevo Ingreso */
export const NEW_ENROLLMENT_STAGES = [
  { key: 'registered',       label: '1. Registrado',              color: 'slate',   icon: '📋' },
  { key: 'contacted',        label: '2. Contacto Efectivo',       color: 'purple',  icon: '📞' },
  { key: 'tour_scheduled',   label: '3. Recorrido / Tour',        color: 'indigo',  icon: '🏫' },
  { key: 'evaluation',       label: '4. Evaluación Diagnóstica',  color: 'blue',    icon: '📝' },
  { key: 'proposal_sent',    label: '5. Propuesta Económica',     color: 'cyan',    icon: '💼' },
  { key: 'reservation',      label: '6. Reserva de Plaza',        color: 'teal',    icon: '💳' },
  { key: 'enrolled',         label: '7. Inscrito ✓',              color: 'emerald', icon: '🎓' },
  { key: 'declined',         label: '8. Declinado ✗',             color: 'red',     icon: '❌' },
] as const;

/** Etapas del embudo de Reinscripciones */
export const REENROLLMENT_STAGES = [
  { key: 'census',           label: '1. Censo de Intención',       color: 'slate',   icon: '📊' },
  { key: 'status_review',    label: '2. Revisión de Estatus',      color: 'amber',   icon: '🔍' },
  { key: 'payment_pending',  label: '3. Pago de Reinscripción',    color: 'blue',    icon: '💳' },
  { key: 'at_risk',          label: '4. En Riesgo de Deserción',   color: 'orange',  icon: '⚠️' },
  { key: 'reenrolled',       label: '5. Reinscrito ✓',             color: 'emerald', icon: '✅' },
  { key: 'withdrawn',        label: '6. Baja Definitiva ✗',        color: 'red',     icon: '🚪' },
] as const;

/** Etapas del embudo de Transferencia Interna */
export const INTERNAL_TRANSFER_STAGES = [
  { key: 'detected',         label: '1. Detección Automática',    color: 'slate',   icon: '🔎' },
  { key: 'intention_survey', label: '2. Encuesta de Intención',   color: 'purple',  icon: '📊' },
  { key: 'pre_enrollment',   label: '3. Pre-Inscripción',         color: 'blue',    icon: '📝' },
  { key: 'payment_confirm',  label: '4. Confirmación de Pago',    color: 'teal',    icon: '💳' },
  { key: 'transferred',      label: '5. Transferido ✓',           color: 'emerald', icon: '🔄' },
  { key: 'exit',             label: '6. Salida ✗',                color: 'red',     icon: '🚪' },
] as const;

export type NewEnrollmentStageKey = typeof NEW_ENROLLMENT_STAGES[number]['key'];
export type ReenrollmentStageKey = typeof REENROLLMENT_STAGES[number]['key'];
export type InternalTransferStageKey = typeof INTERNAL_TRANSFER_STAGES[number]['key'];

export type PipelineType = 'new_enrollment' | 'reenrollment' | 'internal_transfer' | 'corporate_recruitment';
export type CrmStageKey = NewEnrollmentStageKey | ReenrollmentStageKey | InternalTransferStageKey;

/** Devuelve las etapas correspondientes al tipo de embudo */
export function getStagesForPipeline(pipeline: PipelineType) {
  switch (pipeline) {
    case 'new_enrollment': return NEW_ENROLLMENT_STAGES;
    case 'corporate_recruitment': return NEW_ENROLLMENT_STAGES;
    case 'reenrollment': return REENROLLMENT_STAGES;
    case 'internal_transfer': return INTERNAL_TRANSFER_STAGES;
  }
}

/** Encuentra la definición de una etapa por su key dentro de un pipeline */
export function getStageDefinition(pipeline: PipelineType, stageKey: string) {
  const stages = getStagesForPipeline(pipeline);
  return stages.find(s => s.key === stageKey) ?? stages[0];
}

// ============================================================
// CANALES DE CAPTACIÓN
// ============================================================

export const SOURCE_CHANNELS = [
  { key: 'facebook',             label: 'Facebook / Meta Ads',       icon: '📘' },
  { key: 'instagram',            label: 'Instagram',                 icon: '📸' },
  { key: 'google',               label: 'Google Ads / Búsqueda',     icon: '🔍' },
  { key: 'tiktok',               label: 'TikTok',                    icon: '🎵' },
  { key: 'website_form',         label: 'Formulario del Sitio Web',  icon: '🌐' },
  { key: 'whatsapp_direct',      label: 'WhatsApp Directo',          icon: '💬' },
  { key: 'phone_call',           label: 'Llamada Telefónica',        icon: '📞' },
  { key: 'walk_in',              label: 'Visita Presencial',         icon: '🚶' },
  { key: 'referral',             label: 'Recomendación Familiar',    icon: '👨‍👩‍👧' },
  { key: 'school_fair',          label: 'Feria Escolar',             icon: '🎪' },
  { key: 'corporate_agreement',  label: 'Convenio Corporativo',      icon: '🏢' },
  { key: 'linkedin',             label: 'LinkedIn Talent Solutions', icon: '💼' },
  { key: 'job_board',            label: 'Bolsa de Empleo Técnica',   icon: '📋' },
  { key: 'headhunting',          label: 'Headhunting Ejecutivo',     icon: '🎯' },
  { key: 'internal_referral',    label: 'Referido de Colaborador',   icon: '🤝' },
  { key: 'billboard',            label: 'Espectacular / Lona',       icon: '🪧' },
  { key: 'flyer',                label: 'Volanteo / Folleto',        icon: '📄' },
  { key: 'open_house',           label: 'Open House',                icon: '🏠' },
  { key: 'other',                label: 'Otro',                      icon: '📌' },
] as const;

export type SourceChannelKey = typeof SOURCE_CHANNELS[number]['key'];

// ============================================================
// MOTIVOS DE DECLINACIÓN / BAJA
// ============================================================

export const LOST_REASONS = [
  { key: 'price',                label: 'Precio / Colegiatura elevada' },
  { key: 'distance',             label: 'Distancia / Ubicación' },
  { key: 'capacity_full',        label: 'Cupo lleno en grado solicitado' },
  { key: 'evaluation_failed',    label: 'No aprobó evaluación diagnóstica' },
  { key: 'chose_another_school', label: 'Eligió otro colegio' },
  { key: 'city_relocation',      label: 'Cambio de ciudad / Estado' },
  { key: 'schedule_incompatible',label: 'Horario incompatible' },
  { key: 'academic_program',     label: 'Programa académico no convenció' },
  { key: 'financial_hardship',   label: 'Dificultad económica' },
  { key: 'no_response',          label: 'Sin respuesta / Ghosting' },
  { key: 'deferred_next_cycle',  label: 'Pospuso al siguiente ciclo' },
  { key: 'other',                label: 'Otro motivo' },
] as const;

export type LostReasonKey = typeof LOST_REASONS[number]['key'];

// ============================================================
// TIPOS DE BECA
// ============================================================

export const SCHOLARSHIP_TYPES = [
  { key: 'academic',             label: 'Excelencia Académica',     icon: '🏆' },
  { key: 'sports',               label: 'Deportiva',                icon: '⚽' },
  { key: 'siblings',             label: 'Descuento por Hermanos',   icon: '👨‍👩‍👧‍👦' },
  { key: 'corporate_agreement',  label: 'Convenio Empresarial',     icon: '🏢' },
  { key: 'staff_child',          label: 'Hijo de Docente / Personal', icon: '👩‍🏫' },
  { key: 'financial_need',       label: 'Situación Económica',      icon: '🤝' },
  { key: 'excellence',           label: 'Beca de Honor',            icon: '⭐' },
  { key: 'other',                label: 'Otra',                     icon: '📋' },
] as const;

export type ScholarshipTypeKey = typeof SCHOLARSHIP_TYPES[number]['key'];

// ============================================================
// TIPOS DE DOCUMENTO DEL EXPEDIENTE
// ============================================================

export const DOCUMENT_TYPES = [
  { key: 'birth_certificate',          label: 'Acta de Nacimiento',              required: true },
  { key: 'curp_document',              label: 'CURP',                            required: true },
  { key: 'vaccination_card',           label: 'Cartilla de Vacunación',          required: true },
  { key: 'previous_school_transcript', label: 'Boleta de Escuela Anterior',      required: true },
  { key: 'no_debt_letter',             label: 'Carta de No Adeudo',              required: false },
  { key: 'good_conduct_letter',        label: 'Carta de Buena Conducta',         required: false },
  { key: 'photos',                     label: 'Fotografías (infantil/credencial)', required: true },
  { key: 'medical_report',             label: 'Certificado Médico',              required: false },
  { key: 'psycho_evaluation',          label: 'Evaluación Psicopedagógica',      required: false },
  { key: 'ine_tutor',                  label: 'INE del Tutor',                   required: true },
  { key: 'proof_of_address',           label: 'Comprobante de Domicilio',        required: true },
  { key: 'recommendation_letter',      label: 'Carta de Recomendación',          required: false },
  { key: 'payment_receipt',            label: 'Comprobante de Pago',             required: false },
  { key: 'enrollment_contract',        label: 'Contrato de Inscripción Firmado', required: false },
  { key: 'other',                      label: 'Otro Documento',                  required: false },
] as const;

export type DocumentTypeKey = typeof DOCUMENT_TYPES[number]['key'];

// ============================================================
// INTERFACES PRINCIPALES
// ============================================================

export type LeadPriority = 'hot' | 'warm' | 'normal' | 'cold';
export type LeadOutcome = 'enrolled' | 'declined' | 'waitlisted' | 'deferred' | null;

/**
 * @interface CrmLead
 * @description Prospecto familiar (padre/tutor) interesado en el colegio.
 * @database Mapea a public.crm_leads
 */
export interface CrmLead {
  id: string;
  school_id: string;
  campus_id?: string;

  // Clasificación
  pipeline_type: PipelineType;
  stage: CrmStageKey;

  // Datos del tutor (Apellidos siempre separados: Paterno y Materno)
  tutor_first_name: string;
  tutor_last_name_1?: string;   // Primer Apellido (Paterno)
  tutor_last_name_2?: string;   // Segundo Apellido (Materno)
  tutor_last_name: string;      // Apellidos combinados (retrocompatibilidad)
  tutor_phone?: string;
  tutor_email?: string;
  tutor_relationship: string;

  // Canal de captación
  source_channel: SourceChannelKey;
  source_detail?: string;

  // Scoring y asignación
  lead_score: number;
  assigned_to?: string;          // profile.id del asesor
  assigned_to_name?: string;     // Nombre del asesor (join para display)
  priority: LeadPriority;

  // Referidos
  referred_by_family_id?: string;
  referred_by_family_name?: string;  // Para display
  referral_incentive_applied: boolean;

  // Resultado
  outcome: LeadOutcome;
  lost_reason?: string;
  lost_to_school?: string;

  // Ciclo
  target_academic_year?: string;

  // Meta
  notes?: string;
  created_at: string;
  updated_at: string;

  // Atributos de Reclutamiento Corporativo B2B
  proposed_salary?: string;
  department?: string;
  recruiter_name?: string;
  recruiter_title?: string;

  // Campos computados (no en DB, calculados en frontend)
  candidates_count?: number;
  documents_complete_percent?: number;
  days_in_current_stage?: number;
  campus_name?: string;
}

/**
 * @interface CrmLeadCandidate
 * @description Hijo / alumno candidato o aspirante a plaza corporativa.
 * @database Mapea a public.crm_lead_candidates
 */
export interface CrmLeadCandidate {
  id: string;
  lead_id: string;

  // Datos del candidato (Apellidos siempre separados: Paterno y Materno)
  first_name: string;
  last_name_1?: string;          // Primer Apellido (Paterno)
  last_name_2?: string;          // Segundo Apellido (Materno)
  last_name: string;            // Apellidos combinados (retrocompatibilidad)
  birth_date?: string;
  gender?: 'M' | 'F' | 'Otro';
  curp?: string;

  // Nivel y grado (o Especialidad y Vacante en B2B)
  target_level: 'maternal' | 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria' | 'corporativo' | 'especialidad';
  target_grade: string;
  target_group?: string;

  // Atributos de Reclutamiento Corporativo B2B
  position_title?: string;
  department?: string;
  proposed_salary?: string;
  technical_score?: number;
  certifications?: string[];

  // Escuela de procedencia
  current_school_name?: string;
  current_school_grade?: string;

  // Necesidades
  special_needs?: string;
  interests?: string;

  // Evaluación
  evaluation_status: 'pending' | 'scheduled' | 'completed' | 'approved' | 'not_approved' | 'waived';
  evaluation_date?: string;
  evaluation_result?: string;
  evaluation_score?: number;

  // Beca
  scholarship_type?: ScholarshipTypeKey;
  scholarship_percent: number;
  scholarship_approved_by?: string;
  scholarship_approved_at?: string;

  // Conversión
  enrolled_student_id?: string;
  enrolled_at?: string;

  status: 'active' | 'enrolled' | 'declined' | 'waitlisted';
  created_at: string;
  updated_at: string;
}

// ============================================================
// TIPOS DE ACTIVIDAD
// ============================================================

export const ACTIVITY_TYPES = [
  { key: 'call',                 label: 'Llamada Telefónica',        icon: '📞', color: 'blue' },
  { key: 'whatsapp',             label: 'Mensaje de WhatsApp',       icon: '💬', color: 'green' },
  { key: 'email',                label: 'Correo Electrónico',        icon: '📧', color: 'indigo' },
  { key: 'sms',                  label: 'SMS',                       icon: '📱', color: 'purple' },
  { key: 'visit',                label: 'Visita Presencial',         icon: '🚶', color: 'amber' },
  { key: 'tour',                 label: 'Recorrido / Tour',          icon: '🏫', color: 'teal' },
  { key: 'open_house',           label: 'Open House',                icon: '🏠', color: 'cyan' },
  { key: 'evaluation',           label: 'Evaluación Diagnóstica',    icon: '📝', color: 'orange' },
  { key: 'interview',            label: 'Entrevista',                icon: '🤝', color: 'rose' },
  { key: 'meeting',              label: 'Reunión',                   icon: '👥', color: 'violet' },
  { key: 'note',                 label: 'Nota Interna',              icon: '📌', color: 'slate' },
  { key: 'stage_change',         label: 'Cambio de Etapa',           icon: '⚡', color: 'yellow' },
  { key: 'document_uploaded',    label: 'Documento Subido',          icon: '📄', color: 'sky' },
  { key: 'document_verified',    label: 'Documento Verificado',      icon: '✅', color: 'emerald' },
  { key: 'scholarship_request',  label: 'Solicitud de Beca',         icon: '🎓', color: 'amber' },
  { key: 'scholarship_approved', label: 'Beca Aprobada',             icon: '🏆', color: 'emerald' },
  { key: 'payment_received',     label: 'Pago Recibido',             icon: '💳', color: 'green' },
  { key: 'enrollment_completed', label: 'Inscripción Completada',    icon: '🎉', color: 'emerald' },
  { key: 'task',                 label: 'Tarea Programada',          icon: '📋', color: 'blue' },
  { key: 'reminder',             label: 'Recordatorio',              icon: '🔔', color: 'amber' },
  { key: 'follow_up',            label: 'Seguimiento',               icon: '🔄', color: 'indigo' },
] as const;

export type ActivityTypeKey = typeof ACTIVITY_TYPES[number]['key'];

/**
 * @interface CrmActivity
 * @description Registro de interacción o seguimiento con un lead.
 * @database Mapea a public.crm_activities
 */
export interface CrmActivity {
  id: string;
  lead_id: string;

  activity_type: ActivityTypeKey;
  title: string;
  description?: string;

  // Cambios de etapa
  previous_stage?: string;
  new_stage?: string;

  // Tareas
  is_task: boolean;
  scheduled_at?: string;
  completed_at?: string;
  is_overdue: boolean;

  // Autoría
  created_by?: string;
  created_by_name?: string;  // Para display
  completed_by?: string;

  created_at: string;
}

/**
 * @interface CrmDocument
 * @description Documento del expediente digital de admisión.
 * @database Mapea a public.crm_documents
 */
export interface CrmDocument {
  id: string;
  lead_id: string;
  candidate_id?: string;

  document_type: DocumentTypeKey;
  document_label?: string;

  file_url?: string;
  file_name?: string;
  file_size_bytes?: number;

  status: 'pending' | 'uploaded' | 'verified' | 'rejected' | 'expired';
  rejection_reason?: string;

  uploaded_at?: string;
  verified_by?: string;
  verified_at?: string;
  expires_at?: string;

  created_at: string;
}

/**
 * @interface CrmEvent
 * @description Evento de captación escolar (Open House, feria, etc.).
 * @database Mapea a public.crm_events
 */
export interface CrmEvent {
  id: string;
  school_id: string;
  campus_id?: string;

  name: string;
  event_type: 'open_house' | 'school_fair' | 'showcase' | 'demo_class' |
              'virtual_tour' | 'parent_workshop' | 'sports_day' |
              'academic_expo' | 'enrollment_day' | 'other';

  description?: string;
  event_date: string;
  start_time?: string;
  end_time?: string;
  location?: string;

  capacity?: number;
  cost_mxn?: number;

  status: 'planned' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;

  // Campos computados
  attendees_count?: number;
  attended_count?: number;
  enrolled_from_event?: number;
}

/**
 * @interface CrmEventAttendee
 * @description Registro de asistencia a un evento de captación.
 * @database Mapea a public.crm_event_attendees
 */
export interface CrmEventAttendee {
  id: string;
  event_id: string;
  lead_id: string;

  rsvp_status: 'invited' | 'confirmed' | 'attended' | 'no_show' | 'cancelled';

  check_in_at?: string;
  feedback_rating?: number;
  feedback_notes?: string;

  created_at: string;

  // Para display
  lead_tutor_name?: string;
  lead_student_name?: string;
}

// ============================================================
// MÉTRICAS Y DASHBOARD
// ============================================================

/** Métricas del embudo de conversión */
export interface CrmFunnelMetrics {
  pipeline_type: PipelineType;
  stages: {
    stage_key: string;
    stage_label: string;
    count: number;
    conversion_rate_from_previous: number;  // Porcentaje vs etapa anterior
  }[];
  total_leads: number;
  total_enrolled: number;
  overall_conversion_rate: number;  // enrolled / total_leads * 100
}

/** Métricas de matrícula por grado */
export interface EnrollmentCapacityMetric {
  level: string;
  grade: string;
  group_name: string;
  group_id: string;
  enrolled_count: number;
  capacity: number;        // Cupo máximo
  available_spots: number;
  occupancy_percent: number;
  prospects_in_pipeline: number;  // Prospectos apuntando a este grado
}

/** Efectividad por canal de captación */
export interface ChannelEffectivenessMetric {
  channel_key: SourceChannelKey;
  channel_label: string;
  total_leads: number;
  enrolled_count: number;
  conversion_rate: number;
  avg_days_to_enroll: number;
  estimated_cost_mxn: number;   // Inversión en este canal
  cac_mxn: number;              // Costo de Adquisición por Alumno
}

/** Resumen del dashboard directivo */
export interface CrmDashboardSummary {
  // Matrícula
  total_enrolled_current_cycle: number;
  enrollment_target: number;
  enrollment_progress_percent: number;
  enrollment_delta_vs_last_cycle: number;

  // Pipeline
  total_active_leads: number;
  leads_this_month: number;
  leads_growth_percent: number;

  // Conversión
  overall_conversion_rate: number;
  avg_days_to_enroll: number;

  // Financiero
  avg_cac_mxn: number;
  projected_annual_revenue_mxn: number;

  // Retención
  reenrollment_rate_percent: number;
  at_risk_families_count: number;

  // NPS
  nps_score: number;
  promoters_percent: number;
  detractors_percent: number;

  // Tareas
  overdue_tasks_count: number;
  tasks_due_today: number;
}

/** Lead con candidatos expandidos para vista de detalle */
export interface CrmLeadWithCandidates extends CrmLead {
  candidates: CrmLeadCandidate[];
  activities: CrmActivity[];
  documents: CrmDocument[];
}

// ============================================================
// UTILIDADES DE DISPLAY
// ============================================================

export const PRIORITY_CONFIG: Record<LeadPriority, { label: string; color: string; icon: string }> = {
  hot:    { label: 'Caliente',  color: 'red',    icon: '🔴' },
  warm:   { label: 'Tibio',     color: 'amber',  icon: '🟡' },
  normal: { label: 'Normal',    color: 'blue',   icon: '🔵' },
  cold:   { label: 'Frío',      color: 'slate',  icon: '⚪' },
};

export const PIPELINE_CONFIG: Record<PipelineType, { label: string; icon: string; color: string }> = {
  new_enrollment:        { label: 'Nuevo Ingreso',          icon: '🟢', color: 'emerald' },
  reenrollment:          { label: 'Reinscripciones',        icon: '🔵', color: 'blue' },
  internal_transfer:     { label: 'Transferencia Interna',  icon: '🟡', color: 'amber' },
  corporate_recruitment: { label: 'Reclutamiento B2B',      icon: '💼', color: 'indigo' },
};

/** Formato legible del nombre completo del tutor (Paterno y Materno) */
export function formatTutorName(lead: CrmLead): string {
  const apellidos = [lead.tutor_last_name_1, lead.tutor_last_name_2].filter(Boolean).join(' ');
  return `${lead.tutor_first_name} ${apellidos || lead.tutor_last_name || ''}`.trim();
}

/** Formato legible del nombre completo del alumno/candidato (Paterno y Materno) */
export function formatCandidateName(cand: CrmLeadCandidate): string {
  const apellidos = [cand.last_name_1, cand.last_name_2].filter(Boolean).join(' ');
  return `${cand.first_name} ${apellidos || cand.last_name || ''}`.trim();
}

/** Calcula los días que un lead ha permanecido en su etapa actual */
export function calculateDaysInStage(lead: CrmLead): number {
  const updated = new Date(lead.updated_at);
  const now = new Date();
  return Math.floor((now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24));
}

/** Determina si un lead está estancado (más de N días en la misma etapa) */
export function isLeadStagnant(lead: CrmLead, thresholdDays: number = 7): boolean {
  return calculateDaysInStage(lead) >= thresholdDays;
}

/** Calcula el puntaje de scoring basado en señales del lead */
export function calculateLeadScore(lead: CrmLead, candidates: CrmLeadCandidate[]): number {
  let score = 0;

  // Señales positivas por etapa alcanzada
  const stageScores: Record<string, number> = {
    registered: 5, contacted: 15, tour_scheduled: 35,
    evaluation: 55, proposal_sent: 70, reservation: 85, enrolled: 100,
  };
  score += stageScores[lead.stage] ?? 5;

  // Canal de captación (referidos tienen más probabilidad)
  if (lead.source_channel === 'referral') score += 15;
  if (lead.source_channel === 'corporate_agreement') score += 10;

  // Beca por hermanos (ya tienen familia en el colegio)
  const hasSiblingScholarship = candidates.some(c => c.scholarship_type === 'siblings');
  if (hasSiblingScholarship) score += 20;

  // Evaluación aprobada
  const hasApprovedEval = candidates.some(c => c.evaluation_status === 'approved');
  if (hasApprovedEval) score += 20;

  // Penalización por estancamiento
  const daysStuck = calculateDaysInStage(lead);
  if (daysStuck > 14) score -= 20;
  else if (daysStuck > 7) score -= 10;

  // Penalización por prioridad fría
  if (lead.priority === 'cold') score -= 15;

  return Math.max(0, Math.min(100, score));
}
