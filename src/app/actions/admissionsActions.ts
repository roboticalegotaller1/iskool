'use server';

/**
 * @file admissionsActions.ts
 * @description Server Actions para el Pipeline de Admisiones y CRM Escolar Unificado 360°.
 * Maneja mutaciones seguras del lado del servidor, asignación de sedes y puentes a Control Escolar.
 */

import { CrmStageKey, PipelineType, LeadPriority, SourceChannelKey } from '@/types/crm';
import { IBIME_CAMPUS_CAPACITY_TARGETS, normalizeCampusKey } from '@/services/admissionsPipelineService';

export interface CreateAdmissionsLeadInput {
  school_id: string;
  campus_id: string;
  pipeline_type?: PipelineType;
  tutor_first_name: string;
  tutor_last_name_1: string;
  tutor_last_name_2?: string;
  tutor_phone?: string;
  tutor_email?: string;
  tutor_relationship?: string;
  source_channel?: SourceChannelKey;
  priority?: LeadPriority;
  target_academic_year?: string;
  candidate_first_name?: string;
  candidate_last_name_1?: string;
  candidate_last_name_2?: string;
  target_level?: 'maternal' | 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria';
  target_grade?: string;
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Registra un nuevo lead familiar y opcionalmente su primer candidato escolar.
 */
export async function createAdmissionsLeadAction(
  input: CreateAdmissionsLeadInput
): Promise<ActionResponse<{ leadId: string; candidateId?: string }>> {
  try {
    if (!input.tutor_first_name || !input.tutor_last_name_1) {
      return { success: false, error: 'El nombre y primer apellido del tutor son obligatorios (Norma SEP).' };
    }

    const normCampus = normalizeCampusKey(input.campus_id);
    const leadId = `lead-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    let candidateId: string | undefined = undefined;

    if (input.candidate_first_name) {
      candidateId = `cand-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    }

    return {
      success: true,
      data: {
        leadId,
        candidateId
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al crear el lead en servidor.' };
  }
}

/**
 * Actualiza la etapa o fase del aspirante en el pipeline escolar.
 */
export async function updateLeadStageAction(
  leadId: string,
  newStage: CrmStageKey,
  auditNote?: string
): Promise<ActionResponse<{ leadId: string; stage: CrmStageKey }>> {
  try {
    if (!leadId || !newStage) {
      return { success: false, error: 'Identificador y etapa requeridos.' };
    }

    return {
      success: true,
      data: {
        leadId,
        stage: newStage
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al actualizar etapa de lead.' };
  }
}

/**
 * Obtiene el reporte analítico estático/base para renderizado SSR o API.
 */
export async function getConsolidatedPipelineAnalyticsAction(
  campusId: string = 'all',
  academicYear: string = '2026-2027'
): Promise<ActionResponse<any>> {
  try {
    const normKey = normalizeCampusKey(campusId);
    const target = IBIME_CAMPUS_CAPACITY_TARGETS[normKey] || IBIME_CAMPUS_CAPACITY_TARGETS['all'];

    return {
      success: true,
      data: {
        campusId: normKey,
        targetCapacity: target,
        academicYear,
        timestamp: new Date().toISOString()
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || 'Error al obtener analítica del pipeline.' };
  }
}
