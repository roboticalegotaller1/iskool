/**
 * @module useCrmStore
 * @description Store de Zustand para el módulo CRM Escolar de ISkool.
 *   Gestiona el estado de prospectos, candidatos, actividades, documentos,
 *   eventos de captación y métricas del dashboard directivo.
 * @pattern Zustand v5 con selectores aislados por school_id.
 *   Sigue el patrón de useSchoolAdminStore: estado plano + funciones selectoras puras.
 */
import { create } from 'zustand';
import type {
  CrmLead, CrmLeadCandidate, CrmActivity, CrmDocument,
  CrmEvent, CrmEventAttendee, PipelineType, CrmStageKey,
  LeadPriority, SourceChannelKey, ActivityTypeKey,
  CrmDashboardSummary, CrmFunnelMetrics, EnrollmentCapacityMetric,
  ChannelEffectivenessMetric, CrmLeadWithCandidates,
} from '@/types/crm';
import {
  getStagesForPipeline, getStageDefinition,
  calculateDaysInStage, calculateLeadScore,
  NEW_ENROLLMENT_STAGES, REENROLLMENT_STAGES, INTERNAL_TRANSFER_STAGES,
  SOURCE_CHANNELS, LOST_REASONS,
} from '@/types/crm';
import {
  CRM_LEADS_SEED, CRM_CANDIDATES_SEED, CRM_ACTIVITIES_SEED,
  CRM_DOCUMENTS_SEED, CRM_EVENTS_SEED, CRM_EVENT_ATTENDEES_SEED,
} from '@/store/seeds/crmSeeds';

// ============================================================
// ESTADO Y ACCIONES
// ============================================================

interface CrmStoreState {
  // --- Datos ---
  leads: CrmLead[];
  candidates: CrmLeadCandidate[];
  activities: CrmActivity[];
  documents: CrmDocument[];
  events: CrmEvent[];
  eventAttendees: CrmEventAttendee[];

  // --- UI State ---
  activePipeline: PipelineType;
  selectedLeadId: string | null;
  isLeadDetailOpen: boolean;
  isAddLeadModalOpen: boolean;
  isAddActivityModalOpen: boolean;
  searchQuery: string;
  filterCampusId: string | null;
  filterAssignedTo: string | null;
  filterPriority: LeadPriority | null;
  filterSourceChannel: SourceChannelKey | null;

  // --- Acciones de Pipeline ---
  setActivePipeline: (pipeline: PipelineType) => void;

  // --- Acciones de Lead ---
  selectLead: (leadId: string | null) => void;
  openLeadDetail: (leadId: string) => void;
  closeLeadDetail: () => void;
  openAddLeadModal: () => void;
  closeAddLeadModal: () => void;
  createLead: (lead: Omit<CrmLead, 'id' | 'created_at' | 'updated_at' | 'lead_score'>) => string;
  updateLead: (leadId: string, updates: Partial<CrmLead>) => void;
  deleteLead: (leadId: string) => void;
  advanceLeadStage: (leadId: string) => void;
  regressLeadStage: (leadId: string) => void;
  changeLeadStage: (leadId: string, newStage: CrmStageKey) => void;
  assignLead: (leadId: string, assignedTo: string, assignedToName: string) => void;
  declineLead: (leadId: string, lostReason: string, lostToSchool?: string) => void;

  // --- Acciones de Candidato ---
  addCandidate: (candidate: Omit<CrmLeadCandidate, 'id' | 'created_at' | 'updated_at'>) => string;
  updateCandidate: (candidateId: string, updates: Partial<CrmLeadCandidate>) => void;
  deleteCandidate: (candidateId: string) => void;

  // --- Acciones de Actividad ---
  openAddActivityModal: () => void;
  closeAddActivityModal: () => void;
  addActivity: (activity: Omit<CrmActivity, 'id' | 'created_at'>) => string;
  completeTask: (activityId: string, completedBy: string) => void;

  // --- Acciones de Documento ---
  addDocument: (document: Omit<CrmDocument, 'id' | 'created_at'>) => string;
  updateDocumentStatus: (docId: string, status: CrmDocument['status'], verifiedBy?: string, rejectionReason?: string) => void;

  // --- Acciones de Evento ---
  createEvent: (event: Omit<CrmEvent, 'id' | 'created_at'>) => string;
  updateEvent: (eventId: string, updates: Partial<CrmEvent>) => void;
  addEventAttendee: (attendee: Omit<CrmEventAttendee, 'id' | 'created_at'>) => string;
  updateAttendeeRsvp: (attendeeId: string, rsvpStatus: CrmEventAttendee['rsvp_status']) => void;

  // --- Filtros ---
  setSearchQuery: (query: string) => void;
  setFilterCampus: (campusId: string | null) => void;
  setFilterAssignedTo: (userId: string | null) => void;
  setFilterPriority: (priority: LeadPriority | null) => void;
  setFilterSourceChannel: (channel: SourceChannelKey | null) => void;
  clearAllFilters: () => void;
}

// ============================================================
// UTILIDADES INTERNAS
// ============================================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;
}

function nowISO(): string {
  return new Date().toISOString();
}

// ============================================================
// SELECTORES PUROS (Aislamiento por school_id)
// ============================================================

/** Filtra leads por school_id (con fallback a leads demo si no hay registros específicos) */
export function getSchoolLeads(leads: CrmLead[], schoolId: string | null): CrmLead[] {
  if (!schoolId) return leads;
  const filtered = leads.filter(l => l.school_id === schoolId);
  return filtered.length > 0 ? filtered : leads;
}

/** Filtra leads por pipeline_type */
export function getPipelineLeads(leads: CrmLead[], pipeline: PipelineType): CrmLead[] {
  return leads.filter(l => l.pipeline_type === pipeline);
}

/** Obtiene leads agrupados por etapa para vista Kanban */
export function getLeadsByStage(
  leads: CrmLead[],
  pipeline: PipelineType
): Map<string, CrmLead[]> {
  const stages = getStagesForPipeline(pipeline);
  const grouped = new Map<string, CrmLead[]>();
  for (const stage of stages) {
    grouped.set(stage.key, []);
  }
  for (const lead of leads) {
    const bucket = grouped.get(lead.stage);
    if (bucket) bucket.push(lead);
  }
  return grouped;
}

/** Obtiene candidatos de un lead específico */
export function getLeadCandidates(candidates: CrmLeadCandidate[], leadId: string): CrmLeadCandidate[] {
  return candidates.filter(c => c.lead_id === leadId);
}

/** Obtiene actividades de un lead, ordenadas por fecha descendente */
export function getLeadActivities(activities: CrmActivity[], leadId: string): CrmActivity[] {
  return activities
    .filter(a => a.lead_id === leadId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

/** Obtiene documentos de un lead */
export function getLeadDocuments(documents: CrmDocument[], leadId: string): CrmDocument[] {
  return documents.filter(d => d.lead_id === leadId);
}

/** Obtiene tareas pendientes (no completadas y no vencidas), ordenadas por fecha programada */
export function getPendingTasks(activities: CrmActivity[], schoolLeads: CrmLead[]): CrmActivity[] {
  const leadIds = new Set(schoolLeads.map(l => l.id));
  return activities
    .filter(a => a.is_task && !a.completed_at && leadIds.has(a.lead_id))
    .sort((a, b) => {
      if (!a.scheduled_at) return 1;
      if (!b.scheduled_at) return -1;
      return new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime();
    });
}

/** Obtiene tareas vencidas */
export function getOverdueTasks(activities: CrmActivity[], schoolLeads: CrmLead[]): CrmActivity[] {
  const now = new Date();
  const leadIds = new Set(schoolLeads.map(l => l.id));
  return activities.filter(a =>
    a.is_task && !a.completed_at && a.scheduled_at && leadIds.has(a.lead_id) &&
    new Date(a.scheduled_at) < now
  );
}

/** Calcula métricas del dashboard */
export function calculateDashboardSummary(
  leads: CrmLead[],
  candidates: CrmLeadCandidate[],
  activities: CrmActivity[],
): CrmDashboardSummary {
  const activeLeads = leads.filter(l => !l.outcome || l.outcome === 'waitlisted');
  const enrolledLeads = leads.filter(l => l.outcome === 'enrolled');
  const declinedLeads = leads.filter(l => l.outcome === 'declined');
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const leadsThisMonth = leads.filter(l => new Date(l.created_at) >= thisMonth);

  const totalWithOutcome = enrolledLeads.length + declinedLeads.length;
  const conversionRate = totalWithOutcome > 0
    ? (enrolledLeads.length / totalWithOutcome) * 100
    : 0;

  const overdueTasks = activities.filter(a =>
    a.is_task && !a.completed_at && a.scheduled_at && new Date(a.scheduled_at) < new Date()
  );
  const today = new Date().toISOString().split('T')[0];
  const tasksDueToday = activities.filter(a =>
    a.is_task && !a.completed_at && a.scheduled_at?.startsWith(today)
  );

  return {
    total_enrolled_current_cycle: enrolledLeads.length,
    enrollment_target: 320, // Configurable por escuela
    enrollment_progress_percent: (enrolledLeads.length / 320) * 100,
    enrollment_delta_vs_last_cycle: 0,
    total_active_leads: activeLeads.length,
    leads_this_month: leadsThisMonth.length,
    leads_growth_percent: 0,
    overall_conversion_rate: Math.round(conversionRate * 10) / 10,
    avg_days_to_enroll: 14, // Simplificado
    avg_cac_mxn: 0,
    projected_annual_revenue_mxn: 0,
    reenrollment_rate_percent: 92,
    at_risk_families_count: 0,
    nps_score: 0,
    promoters_percent: 0,
    detractors_percent: 0,
    overdue_tasks_count: overdueTasks.length,
    tasks_due_today: tasksDueToday.length,
  };
}

/** Calcula métricas de embudo de conversión */
export function calculateFunnelMetrics(leads: CrmLead[], pipeline: PipelineType): CrmFunnelMetrics {
  const pipelineLeads = leads.filter(l => l.pipeline_type === pipeline);
  const stages = getStagesForPipeline(pipeline);

  const stageMetrics = stages.map((stage, idx) => {
    const count = pipelineLeads.filter(l => l.stage === stage.key).length;
    // Also count leads that have passed through this stage (are in later stages)
    const stagesAfter = stages.slice(idx).map(s => s.key);
    const totalReachedThisStage = pipelineLeads.filter(l =>
      stagesAfter.includes(l.stage as typeof stagesAfter[number])
    ).length + count;

    const previousTotal = idx === 0 ? pipelineLeads.length : (() => {
      const prevStagesAfter = stages.slice(idx - 1).map(s => s.key);
      return pipelineLeads.filter(l =>
        prevStagesAfter.includes(l.stage as typeof prevStagesAfter[number])
      ).length;
    })();

    return {
      stage_key: stage.key,
      stage_label: stage.label,
      count,
      conversion_rate_from_previous: previousTotal > 0
        ? Math.round((count / previousTotal) * 100)
        : 0,
    };
  });

  const totalEnrolled = pipelineLeads.filter(l =>
    l.stage === 'enrolled' || l.stage === 'reenrolled' || l.stage === 'transferred'
  ).length;

  return {
    pipeline_type: pipeline,
    stages: stageMetrics,
    total_leads: pipelineLeads.length,
    total_enrolled: totalEnrolled,
    overall_conversion_rate: pipelineLeads.length > 0
      ? Math.round((totalEnrolled / pipelineLeads.length) * 100 * 10) / 10
      : 0,
  };
}

/** Calcula efectividad por canal de captación */
export function calculateChannelEffectiveness(leads: CrmLead[]): ChannelEffectivenessMetric[] {
  const channelMap = new Map<string, { total: number; enrolled: number }>();

  for (const lead of leads) {
    const current = channelMap.get(lead.source_channel) || { total: 0, enrolled: 0 };
    current.total++;
    if (lead.outcome === 'enrolled') current.enrolled++;
    channelMap.set(lead.source_channel, current);
  }

  return Array.from(channelMap.entries()).map(([key, data]) => {
    const channelDef = SOURCE_CHANNELS.find(c => c.key === key);
    return {
      channel_key: key as SourceChannelKey,
      channel_label: channelDef?.label ?? key,
      total_leads: data.total,
      enrolled_count: data.enrolled,
      conversion_rate: data.total > 0 ? Math.round((data.enrolled / data.total) * 100 * 10) / 10 : 0,
      avg_days_to_enroll: 0,
      estimated_cost_mxn: 0,
      cac_mxn: 0,
    };
  }).sort((a, b) => b.total_leads - a.total_leads);
}

/** Obtiene un lead con todos sus datos expandidos */
export function getLeadWithDetails(
  leads: CrmLead[],
  candidates: CrmLeadCandidate[],
  activities: CrmActivity[],
  documents: CrmDocument[],
  leadId: string
): CrmLeadWithCandidates | null {
  const lead = leads.find(l => l.id === leadId);
  if (!lead) return null;
  return {
    ...lead,
    candidates: getLeadCandidates(candidates, leadId),
    activities: getLeadActivities(activities, leadId),
    documents: getLeadDocuments(documents, leadId),
  };
}

// ============================================================
// STORE
// ============================================================

export const useCrmStore = create<CrmStoreState>()((set, get) => ({
  // --- Datos (inicializados con seeds) ---
  leads: CRM_LEADS_SEED,
  candidates: CRM_CANDIDATES_SEED,
  activities: CRM_ACTIVITIES_SEED,
  documents: CRM_DOCUMENTS_SEED,
  events: CRM_EVENTS_SEED,
  eventAttendees: CRM_EVENT_ATTENDEES_SEED,

  // --- UI State ---
  activePipeline: 'new_enrollment',
  selectedLeadId: null,
  isLeadDetailOpen: false,
  isAddLeadModalOpen: false,
  isAddActivityModalOpen: false,
  searchQuery: '',
  filterCampusId: null,
  filterAssignedTo: null,
  filterPriority: null,
  filterSourceChannel: null,

  // --- Pipeline ---
  setActivePipeline: (pipeline) => set({ activePipeline: pipeline, selectedLeadId: null }),

  // --- Lead Selection ---
  selectLead: (leadId) => set({ selectedLeadId: leadId }),

  openLeadDetail: (leadId) => set({ selectedLeadId: leadId, isLeadDetailOpen: true }),
  closeLeadDetail: () => set({ isLeadDetailOpen: false }),

  openAddLeadModal: () => set({ isAddLeadModalOpen: true }),
  closeAddLeadModal: () => set({ isAddLeadModalOpen: false }),

  // --- Lead CRUD ---
  createLead: (leadData) => {
    const id = generateId('lead');
    const now = nowISO();
    const newLead: CrmLead = {
      ...leadData,
      id,
      lead_score: 5,
      created_at: now,
      updated_at: now,
      candidates_count: 0,
      documents_complete_percent: 0,
      days_in_current_stage: 0,
    };
    set(state => ({ leads: [...state.leads, newLead], isAddLeadModalOpen: false }));
    return id;
  },

  updateLead: (leadId, updates) => {
    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, ...updates, updated_at: nowISO() } : l
      ),
    }));
  },

  deleteLead: (leadId) => {
    set(state => ({
      leads: state.leads.filter(l => l.id !== leadId),
      candidates: state.candidates.filter(c => c.lead_id !== leadId),
      activities: state.activities.filter(a => a.lead_id !== leadId),
      documents: state.documents.filter(d => d.lead_id !== leadId),
      selectedLeadId: state.selectedLeadId === leadId ? null : state.selectedLeadId,
      isLeadDetailOpen: state.selectedLeadId === leadId ? false : state.isLeadDetailOpen,
    }));
  },

  advanceLeadStage: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const stages = getStagesForPipeline(lead.pipeline_type);
    const currentIdx = stages.findIndex(s => s.key === lead.stage);
    if (currentIdx < 0 || currentIdx >= stages.length - 1) return;

    const nextStage = stages[currentIdx + 1];
    const now = nowISO();

    // Determinar outcome si es etapa terminal
    let outcome = lead.outcome;
    if (nextStage.key === 'enrolled' || nextStage.key === 'reenrolled' || nextStage.key === 'transferred') {
      outcome = 'enrolled';
    }

    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, stage: nextStage.key as CrmStageKey, outcome, updated_at: now } : l
      ),
      activities: [...state.activities, {
        id: generateId('act'),
        lead_id: leadId,
        activity_type: 'stage_change' as ActivityTypeKey,
        title: `Avance: ${stages[currentIdx].label} → ${nextStage.label}`,
        previous_stage: lead.stage,
        new_stage: nextStage.key,
        is_task: false,
        is_overdue: false,
        created_at: now,
      }],
    }));
  },

  regressLeadStage: (leadId) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const stages = getStagesForPipeline(lead.pipeline_type);
    const currentIdx = stages.findIndex(s => s.key === lead.stage);
    if (currentIdx <= 0) return;

    const prevStage = stages[currentIdx - 1];
    const now = nowISO();

    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, stage: prevStage.key as CrmStageKey, outcome: null, updated_at: now } : l
      ),
      activities: [...state.activities, {
        id: generateId('act'),
        lead_id: leadId,
        activity_type: 'stage_change' as ActivityTypeKey,
        title: `Retroceso: ${stages[currentIdx].label} → ${prevStage.label}`,
        previous_stage: lead.stage,
        new_stage: prevStage.key,
        is_task: false,
        is_overdue: false,
        created_at: now,
      }],
    }));
  },

  changeLeadStage: (leadId, newStage) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const stages = getStagesForPipeline(lead.pipeline_type);
    const oldStageDef = getStageDefinition(lead.pipeline_type, lead.stage);
    const newStageDef = getStageDefinition(lead.pipeline_type, newStage);
    const now = nowISO();

    let outcome = lead.outcome;
    if (newStage === 'enrolled' || newStage === 'reenrolled' || newStage === 'transferred') outcome = 'enrolled';
    else if (newStage === 'declined' || newStage === 'withdrawn' || newStage === 'exit') outcome = 'declined';
    else outcome = null;

    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, stage: newStage, outcome, updated_at: now } : l
      ),
      activities: [...state.activities, {
        id: generateId('act'),
        lead_id: leadId,
        activity_type: 'stage_change' as ActivityTypeKey,
        title: `Cambio de etapa: ${oldStageDef.label} → ${newStageDef.label}`,
        previous_stage: lead.stage,
        new_stage: newStage,
        is_task: false,
        is_overdue: false,
        created_at: now,
      }],
    }));
  },

  assignLead: (leadId, assignedTo, assignedToName) => {
    const now = nowISO();
    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? { ...l, assigned_to: assignedTo, assigned_to_name: assignedToName, updated_at: now } : l
      ),
      activities: [...state.activities, {
        id: generateId('act'),
        lead_id: leadId,
        activity_type: 'assignment_change' as ActivityTypeKey,
        title: `Lead asignado a ${assignedToName}`,
        is_task: false,
        is_overdue: false,
        created_at: now,
      }],
    }));
  },

  declineLead: (leadId, lostReason, lostToSchool) => {
    const state = get();
    const lead = state.leads.find(l => l.id === leadId);
    if (!lead) return;

    const stages = getStagesForPipeline(lead.pipeline_type);
    const declinedStage = stages.find(s =>
      s.key === 'declined' || s.key === 'withdrawn' || s.key === 'exit'
    );
    const now = nowISO();

    const reasonLabel = LOST_REASONS.find(r => r.key === lostReason)?.label ?? lostReason;

    set(state => ({
      leads: state.leads.map(l =>
        l.id === leadId ? {
          ...l,
          stage: (declinedStage?.key ?? 'declined') as CrmStageKey,
          outcome: 'declined' as const,
          lost_reason: lostReason,
          lost_to_school: lostToSchool,
          priority: 'cold' as const,
          updated_at: now,
        } : l
      ),
      activities: [...state.activities, {
        id: generateId('act'),
        lead_id: leadId,
        activity_type: 'stage_change' as ActivityTypeKey,
        title: `Lead declinado: ${reasonLabel}${lostToSchool ? ` → ${lostToSchool}` : ''}`,
        previous_stage: lead.stage,
        new_stage: declinedStage?.key ?? 'declined',
        is_task: false,
        is_overdue: false,
        created_at: now,
      }],
    }));
  },

  // --- Candidatos ---
  addCandidate: (candidateData) => {
    const id = generateId('cand');
    const now = nowISO();
    const newCandidate: CrmLeadCandidate = { ...candidateData, id, created_at: now, updated_at: now };
    set(state => ({
      candidates: [...state.candidates, newCandidate],
      leads: state.leads.map(l =>
        l.id === candidateData.lead_id
          ? { ...l, candidates_count: (l.candidates_count ?? 0) + 1, updated_at: now }
          : l
      ),
    }));
    return id;
  },

  updateCandidate: (candidateId, updates) => {
    set(state => ({
      candidates: state.candidates.map(c =>
        c.id === candidateId ? { ...c, ...updates, updated_at: nowISO() } : c
      ),
    }));
  },

  deleteCandidate: (candidateId) => {
    const state = get();
    const candidate = state.candidates.find(c => c.id === candidateId);
    set(state => ({
      candidates: state.candidates.filter(c => c.id !== candidateId),
      documents: state.documents.filter(d => d.candidate_id !== candidateId),
      leads: candidate ? state.leads.map(l =>
        l.id === candidate.lead_id
          ? { ...l, candidates_count: Math.max(0, (l.candidates_count ?? 1) - 1), updated_at: nowISO() }
          : l
      ) : state.leads,
    }));
  },

  // --- Actividades ---
  openAddActivityModal: () => set({ isAddActivityModalOpen: true }),
  closeAddActivityModal: () => set({ isAddActivityModalOpen: false }),

  addActivity: (activityData) => {
    const id = generateId('act');
    const newActivity: CrmActivity = { ...activityData, id, created_at: nowISO() };
    set(state => ({
      activities: [...state.activities, newActivity],
      isAddActivityModalOpen: false,
    }));
    return id;
  },

  completeTask: (activityId, completedBy) => {
    set(state => ({
      activities: state.activities.map(a =>
        a.id === activityId ? { ...a, completed_at: nowISO(), completed_by: completedBy, is_overdue: false } : a
      ),
    }));
  },

  // --- Documentos ---
  addDocument: (docData) => {
    const id = generateId('doc');
    const newDoc: CrmDocument = { ...docData, id, created_at: nowISO() };
    set(state => ({ documents: [...state.documents, newDoc] }));
    return id;
  },

  updateDocumentStatus: (docId, status, verifiedBy, rejectionReason) => {
    const now = nowISO();
    set(state => ({
      documents: state.documents.map(d =>
        d.id === docId ? {
          ...d,
          status,
          verified_by: verifiedBy ?? d.verified_by,
          verified_at: status === 'verified' ? now : d.verified_at,
          rejection_reason: rejectionReason ?? d.rejection_reason,
          uploaded_at: status === 'uploaded' ? now : d.uploaded_at,
        } : d
      ),
    }));
  },

  // --- Eventos ---
  createEvent: (eventData) => {
    const id = generateId('evt');
    const newEvent: CrmEvent = { ...eventData, id, created_at: nowISO() };
    set(state => ({ events: [...state.events, newEvent] }));
    return id;
  },

  updateEvent: (eventId, updates) => {
    set(state => ({
      events: state.events.map(e => e.id === eventId ? { ...e, ...updates } : e),
    }));
  },

  addEventAttendee: (attendeeData) => {
    const id = generateId('att');
    const newAttendee: CrmEventAttendee = { ...attendeeData, id, created_at: nowISO() };
    set(state => ({ eventAttendees: [...state.eventAttendees, newAttendee] }));
    return id;
  },

  updateAttendeeRsvp: (attendeeId, rsvpStatus) => {
    set(state => ({
      eventAttendees: state.eventAttendees.map(a =>
        a.id === attendeeId ? {
          ...a,
          rsvp_status: rsvpStatus,
          check_in_at: rsvpStatus === 'attended' ? nowISO() : a.check_in_at,
        } : a
      ),
    }));
  },

  // --- Filtros ---
  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterCampus: (campusId) => set({ filterCampusId: campusId }),
  setFilterAssignedTo: (userId) => set({ filterAssignedTo: userId }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  setFilterSourceChannel: (channel) => set({ filterSourceChannel: channel }),
  clearAllFilters: () => set({
    searchQuery: '',
    filterCampusId: null,
    filterAssignedTo: null,
    filterPriority: null,
    filterSourceChannel: null,
  }),
}));

/** Selector combinado: aplica todos los filtros activos y devuelve leads filtrados */
export function getFilteredLeads(state: CrmStoreState, schoolId: string | null): CrmLead[] {
  let leads = getSchoolLeads(state.leads, schoolId);
  leads = getPipelineLeads(leads, state.activePipeline);

  if (state.filterCampusId) {
    leads = leads.filter(l => l.campus_id === state.filterCampusId);
  }
  if (state.filterAssignedTo) {
    leads = leads.filter(l => l.assigned_to === state.filterAssignedTo);
  }
  if (state.filterPriority) {
    leads = leads.filter(l => l.priority === state.filterPriority);
  }
  if (state.filterSourceChannel) {
    leads = leads.filter(l => l.source_channel === state.filterSourceChannel);
  }
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase().trim();
    leads = leads.filter(l =>
      l.tutor_first_name.toLowerCase().includes(q) ||
      l.tutor_last_name.toLowerCase().includes(q) ||
      l.tutor_phone?.includes(q) ||
      l.tutor_email?.toLowerCase().includes(q) ||
      l.notes?.toLowerCase().includes(q) ||
      l.campus_name?.toLowerCase().includes(q)
    );
  }

  return leads;
}
