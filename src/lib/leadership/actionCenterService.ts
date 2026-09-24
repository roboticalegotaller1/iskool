/**
 * @file actionCenterService.ts
 * @description Servicio de Gestión del Centro de Acción Académica y Ciclo de Vida de Alertas (Ítems #35, #36, #37, #38 y #39).
 * Permite a los coordinadores y directores transformar alertas en acciones e intervenciones pedagógicas con
 * fecha de revisión de seguimiento (follow-up date), manteniendo un historial inmutable de decisiones.
 */

import {
  AcademicActionEntity,
  AlertLifecycleStatus,
  AlertStateHistoryEntry,
  LeadershipScopeType
} from './types';
import { LeadershipStore } from './leadershipStore';
import { AcademicAnalyticsStore } from '../academicAnalytics/analyticsStore';
import { AcademicInterventionEntity } from '../academicAnalytics/types';

export class LeadershipActionCenterService {
  /**
   * Transiciona el estado de una alerta académica registrando el cambio en el historial inmutable.
   */
  static async transitionAlert(
    alertId: string,
    newStatus: AlertLifecycleStatus,
    changedBy: string,
    notes?: string
  ): Promise<void> {
    const alert = await AcademicAnalyticsStore.getAlert(alertId);
    if (alert) {
      // Mapear compatibilidad de status
      const mappedStatus = (newStatus === 'new' ? 'active' :
        newStatus === 'reviewed' ? 'acknowledged' :
        newStatus === 'actioned' ? 'acknowledged' :
        newStatus === 'resolved' ? 'resolved' : 'dismissed') as any;

      await AcademicAnalyticsStore.saveAlert({
        ...alert,
        status: mappedStatus
      });
    }

    const historyEntry: AlertStateHistoryEntry = {
      status: newStatus,
      changed_by: changedBy,
      timestamp: new Date().toISOString(),
      notes
    };
    (historyEntry as any).alert_id = alertId;

    await LeadershipStore.recordAlertStateChange(historyEntry);
  }

  /**
   * Crea una Intervención Pedagógica a partir de una Alerta Académica (Ítem #38).
   * Requiere confirmación humana y establece una fecha de seguimiento (Follow-up / Ítem #39).
   */
  static async createInterventionFromAlert(params: {
    alertId: string;
    targetKnowledgeId: string;
    strategy: string;
    scopeType: 'student' | 'group' | 'grade';
    scopeId: string;
    sampleSizeStudents: number;
    baselineMastery: number;
    reviewInWeeks: number; // e.g. 2 semanas
    coordinatorId: string;
    notes?: string;
  }): Promise<{ action: AcademicActionEntity; intervention: AcademicInterventionEntity }> {
    const now = new Date();
    const reviewDate = new Date(now.getTime() + params.reviewInWeeks * 7 * 24 * 60 * 60 * 1000);
    const reviewDateStr = reviewDate.toISOString().split('T')[0];

    // 1. Crear la intervención académica en AcademicAnalytics
    const interventionId = `interv_${Date.now()}`;
    const intervention: AcademicInterventionEntity = {
      id: interventionId,
      scope_type: params.scopeType,
      scope_id: params.scopeId,
      target_knowledge_id: params.targetKnowledgeId,
      strategy: params.strategy,
      start_date: now.toISOString().split('T')[0],
      baseline_mastery: params.baselineMastery,
      status: 'in_progress',
      sample_size_students: params.sampleSizeStudents,
      evaluation_limitations: 'Evaluación formativa observada. Sujeto a recolección de evidencias en la fecha de revisión.',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    await AcademicAnalyticsStore.saveIntervention(intervention);

    // 2. Crear la acción académica aprobada en el Action Center
    const actionId = `action_${Date.now()}`;
    const action: AcademicActionEntity = {
      id: actionId,
      alert_id: params.alertId,
      action_type: 'create_intervention',
      title: `Intervención didáctica en: ${params.targetKnowledgeId}`,
      description: `Estrategia: ${params.strategy}. Revisión programada en ${params.reviewInWeeks} semanas.`,
      affected_scope_type: params.scopeType as LeadershipScopeType,
      affected_scope_id: params.scopeId,
      target_knowledge_id: params.targetKnowledgeId,
      assigned_to_role: 'teacher',
      scheduled_review_date: reviewDateStr,
      requires_coordinator_approval: true,
      is_approved: true,
      approved_by: params.coordinatorId,
      status: 'in_progress',
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };
    await LeadershipStore.saveAction(action);

    // 3. Transicionar la alerta al estado 'actioned'
    await this.transitionAlert(
      params.alertId,
      'actioned',
      params.coordinatorId,
      `Intervención creada con fecha de revisión para ${reviewDateStr}.`
    );

    return { action, intervention };
  }

  /**
   * Aprueba formalmente una acción pendiente en el Action Center.
   */
  static async approveAction(actionId: string, coordinatorId: string): Promise<AcademicActionEntity> {
    const action = await LeadershipStore.getAction(actionId);
    if (!action) {
      throw new Error(`Acción académica con ID ${actionId} no encontrada.`);
    }

    const updated: AcademicActionEntity = {
      ...action,
      is_approved: true,
      approved_by: coordinatorId,
      status: 'in_progress',
      updated_at: new Date().toISOString()
    };

    return await LeadershipStore.saveAction(updated);
  }
}
