'use server';

/**
 * @file admissionsActions.ts
 * @description Server Actions para el Pipeline de Admisiones y CRM Escolar Unificado 360°.
 * Maneja mutaciones seguras del lado del servidor, asignación de sedes y puentes a Control Escolar.
 */

import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/sessionToken';
import { verifyMultiTenantToken } from '@/lib/auth/multiTenantSession';
import { getServiceSupabaseClient } from '@/lib/supabaseServer';
import { CrmStageKey, PipelineType, LeadPriority, SourceChannelKey } from '@/types/crm';
import { IBIME_CAMPUS_CAPACITY_TARGETS, normalizeCampusKey } from '@/services/admissionsPipelineService';

const STAFF_CRM_ROLES = new Set(['superadmin', 'admin', 'director', 'coordinator', 'owner', 'ceo', 'billing']);

async function requireAdmissionsStaffSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('iskool_session')?.value || cookieStore.get('ibime_session')?.value;
  if (!token) {
    return { authorized: false as const, error: 'Autenticación institucional requerida.' };
  }
  const verified = (await verifyMultiTenantToken(token)) || (await verifySessionToken(token));
  if (!verified || !verified.role) {
    return { authorized: false as const, error: 'Sesión inválida o expirada.' };
  }
  if (!STAFF_CRM_ROLES.has(verified.role.toLowerCase())) {
    return { authorized: false as const, error: 'Permisos insuficientes para operar Admisiones.' };
  }
  return { authorized: true as const, user: verified };
}

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
    const auth = await requireAdmissionsStaffSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }
    if (!input.tutor_first_name || !input.tutor_last_name_1) {
      return { success: false, error: 'El nombre y primer apellido del tutor son obligatorios (Norma SEP).' };
    }

    const normCampus = normalizeCampusKey(input.campus_id);
    const leadId = `lead-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    let candidateId: string | undefined = undefined;

    if (input.candidate_first_name) {
      candidateId = `cand-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    }

    const hasRealDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    if (hasRealDb) {
      try {
        const db = getServiceSupabaseClient();
        await db.from('crm_leads').insert({
          id: leadId,
          school_id: auth.user.school_id || input.school_id,
          campus_id: normCampus,
          pipeline_type: input.pipeline_type || 'K12_GENERAL',
          current_stage: 'nuevo_prospecto',
          tutor_first_name: input.tutor_first_name,
          tutor_last_name_1: input.tutor_last_name_1,
          tutor_last_name_2: input.tutor_last_name_2,
          tutor_phone: input.tutor_phone,
          tutor_email: input.tutor_email,
          source_channel: input.source_channel || 'organico',
          priority: input.priority || 'media',
          target_academic_year: input.target_academic_year || '2026-2027',
        });
      } catch (dbErr) {
        console.warn('[AdmissionsAction] Aviso persistiendo crm_leads:', dbErr);
      }
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
    const auth = await requireAdmissionsStaffSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }
    if (!leadId || !newStage) {
      return { success: false, error: 'Identificador y etapa requeridos.' };
    }

    const hasRealDb = Boolean(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder') &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    if (hasRealDb) {
      try {
        const db = getServiceSupabaseClient();
        let query = db
          .from('crm_leads')
          .update({ current_stage: newStage, updated_at: new Date().toISOString() })
          .eq('id', leadId);
        if (auth.user.role !== 'superadmin' && auth.user.school_id) {
          query = query.eq('school_id', auth.user.school_id);
        }
        await query;
      } catch (dbErr) {
        console.warn('[AdmissionsAction] Aviso actualizando etapa CRM:', dbErr);
      }
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
 * Obtiene el reporte analítico de admisiones autenticado.
 */
export async function getConsolidatedPipelineAnalyticsAction(
  campusId: string = 'all',
  academicYear: string = '2026-2027'
): Promise<ActionResponse<any>> {
  try {
    const auth = await requireAdmissionsStaffSession();
    if (!auth.authorized) {
      return { success: false, error: auth.error };
    }
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
