/**
 * @file useAdmissionsPipeline.ts
 * @description Hook de Lógica de Negocio y Conectividad Analítica en Vivo para el Embudo de Admisiones.
 * Conecta el estado del CRM con el Motor Analítico del CEO y provee mutaciones atómicas.
 */

import { useMemo, useCallback } from 'react';
import { useCrmStore } from '@/store/useCrmStore';
import { 
  CrmLead, 
  CrmLeadCandidate, 
  CrmStageKey, 
  PipelineType,
  LeadPriority,
  SourceChannelKey 
} from '@/types/crm';
import {
  computeAdmissionsPipelineMetrics,
  executeEnrollmentBridge,
  EnrollmentBridgePayload,
  EnrollmentBridgeResult,
  PipelineAggregateReport,
  IBIME_CAMPUS_CAPACITY_TARGETS,
  normalizeCampusKey
} from '@/services/admissionsPipelineService';

export interface UseAdmissionsPipelineOptions {
  campusId?: string;
  pipeline?: PipelineType;
  academicYear?: string;
}

export function useAdmissionsPipeline(options: UseAdmissionsPipelineOptions = {}) {
  const {
    campusId: initialCampusId = 'all',
    pipeline: initialPipeline = 'new_enrollment',
    academicYear = '2026-2027'
  } = options;

  // 1. Conexión reactiva con el Store del CRM
  const leads = useCrmStore((state) => state.leads);
  const candidates = useCrmStore((state) => state.candidates);
  const activities = useCrmStore((state) => state.activities);
  const documents = useCrmStore((state) => state.documents);

  // Acciones del Store
  const advanceLeadStageStore = useCrmStore((state) => state.advanceLeadStage);
  const regressLeadStageStore = useCrmStore((state) => state.regressLeadStage);
  const changeLeadStageStore = useCrmStore((state) => state.changeLeadStage);
  const updateLeadStore = useCrmStore((state) => state.updateLead);
  const createLeadStore = useCrmStore((state) => state.createLead);
  const addCandidateStore = useCrmStore((state) => state.addCandidate);
  const addActivityStore = useCrmStore((state) => state.addActivity);

  // 2. Normalización de sede
  const activeCampusKey = normalizeCampusKey(initialCampusId);

  // 3. Cálculo de métricas del pipeline en vivo (Reactividad instantánea)
  const metrics: PipelineAggregateReport = useMemo(() => {
    return computeAdmissionsPipelineMetrics(
      leads,
      candidates,
      activeCampusKey,
      academicYear
    );
  }, [leads, candidates, activeCampusKey, academicYear]);

  // 4. Desglose comparativo de todas las sedes (Consolidado + 4 planteles)
  const campusesBreakdown = useMemo(() => {
    const campusKeys = ['all', 'montes', 'lagos', 'sancristobal', 'coacalco'];
    return campusKeys.map(k => computeAdmissionsPipelineMetrics(leads, candidates, k, academicYear));
  }, [leads, candidates, academicYear]);

  // 5. Leads filtrados por la sede activa
  const filteredLeads = useMemo(() => {
    if (activeCampusKey === 'all') return leads;
    return leads.filter(l => normalizeCampusKey(l.campus_id) === activeCampusKey);
  }, [leads, activeCampusKey]);

  // 6. Mutaciones optimistas y atómicas
  const advanceStage = useCallback((leadId: string) => {
    advanceLeadStageStore(leadId);
  }, [advanceLeadStageStore]);

  const regressStage = useCallback((leadId: string) => {
    regressLeadStageStore(leadId);
  }, [regressLeadStageStore]);

  const changeStage = useCallback((leadId: string, newStage: CrmStageKey, auditNote?: string) => {
    changeLeadStageStore(leadId, newStage);
    if (auditNote) {
      addActivityStore({
        lead_id: leadId,
        activity_type: 'stage_change',
        title: `Etapa cambiada a: ${newStage}`,
        description: auditNote,
        new_stage: newStage,
        is_task: false,
        is_overdue: false
      });
    }
  }, [changeLeadStageStore, addActivityStore]);

  // 7. Puente limpio a Control Escolar al alcanzar Fase 5 (Matrícula)
  const enrollCandidate = useCallback((payload: EnrollmentBridgePayload): EnrollmentBridgeResult => {
    return executeEnrollmentBridge(payload);
  }, []);

  // 8. Registro de nuevo prospecto
  const registerNewProspect = useCallback((leadData: Omit<CrmLead, 'id' | 'created_at' | 'updated_at' | 'lead_score'>, candidateData?: Omit<CrmLeadCandidate, 'id' | 'lead_id' | 'created_at' | 'updated_at'>) => {
    const newLeadId = createLeadStore(leadData);
    if (candidateData) {
      addCandidateStore({
        ...candidateData,
        lead_id: newLeadId
      });
    }
    return newLeadId;
  }, [createLeadStore, addCandidateStore]);

  return {
    // Datos en vivo
    metrics,
    campusesBreakdown,
    leads: filteredLeads,
    allLeads: leads,
    candidates,
    activities,
    documents,
    activeCampusKey,

    // Capacidad y Metas
    capacityTarget: IBIME_CAMPUS_CAPACITY_TARGETS[activeCampusKey] || IBIME_CAMPUS_CAPACITY_TARGETS['all'],

    // Operaciones
    advanceStage,
    regressStage,
    changeStage,
    enrollCandidate,
    registerNewProspect,
    updateLead: updateLeadStore
  };
}
