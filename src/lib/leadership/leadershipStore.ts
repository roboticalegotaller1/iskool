/**
 * @file leadershipStore.ts
 * @description Capa de Almacenamiento y Persistencia para el Leadership Dashboard y Action Center (Fase 11).
 * Implementa almacenamiento dual: Map en memoria para pruebas offline ultra-rápidas y Supabase para producción.
 */

import {
  AcademicActionEntity,
  AlertStateHistoryEntry,
  AlertLifecycleStatus
} from './types';
import { supabase } from '../supabaseClient';

export interface CoordinatorCopilotAuditEntity {
  id: string;
  school_id: string;
  user_id: string;
  user_role: string;
  raw_query: string;
  resolved_intent: string;
  scope_descriptor: any;
  metrics_queried: any;
  prompt_version: string;
  model_identifier: string;
  response_summary: string;
  suggested_actions: string[];
  created_at: string;
}

export class LeadershipStore {
  private static actions = new Map<string, AcademicActionEntity>();
  private static alertHistories: AlertStateHistoryEntry[] = [];
  private static copilotAudits: CoordinatorCopilotAuditEntity[] = [];

  static clear(): void {
    this.actions.clear();
    this.alertHistories = [];
    this.copilotAudits = [];
  }

  // --- CENTRO DE ACCIONES ACADÉMICAS ---
  static async saveAction(action: AcademicActionEntity): Promise<AcademicActionEntity> {
    this.actions.set(action.id, { ...action, updated_at: new Date().toISOString() });

    try {
      if (supabase) {
        await supabase.from('academic_actions').upsert({
          id: action.id,
          alert_id: action.alert_id,
          action_type: action.action_type,
          title: action.title,
          description: action.description,
          affected_scope_type: action.affected_scope_type,
          affected_scope_id: action.affected_scope_id,
          target_knowledge_id: action.target_knowledge_id,
          assigned_to_role: action.assigned_to_role,
          scheduled_review_date: action.scheduled_review_date,
          requires_coordinator_approval: action.requires_coordinator_approval,
          is_approved: action.is_approved,
          approved_by: action.approved_by,
          status: action.status,
          created_at: action.created_at,
          updated_at: action.updated_at
        });
      }
    } catch {
      // Degradar a memoria
    }

    return action;
  }

  static async getAction(id: string): Promise<AcademicActionEntity | undefined> {
    return this.actions.get(id);
  }

  static async listActions(status?: string): Promise<AcademicActionEntity[]> {
    const list = Array.from(this.actions.values());
    if (status) {
      return list.filter(a => a.status === status);
    }
    return list;
  }

  // --- HISTORIAL DE ESTADOS DE ALERTAS ---
  static async recordAlertStateChange(entry: AlertStateHistoryEntry): Promise<void> {
    this.alertHistories.push(entry);

    try {
      if (supabase) {
        await supabase.from('academic_alert_state_history').insert({
          alert_id: (entry as any).alert_id,
          new_status: entry.status,
          changed_by: entry.changed_by,
          notes: entry.notes,
          created_at: entry.timestamp
        });
      }
    } catch {
      // Degradar a memoria
    }
  }

  static async getAlertHistory(alertId?: string): Promise<AlertStateHistoryEntry[]> {
    if (alertId) {
      return this.alertHistories.filter(h => (h as any).alert_id === alertId);
    }
    return this.alertHistories;
  }

  // --- BITÁCORA DE AUDITORÍA DEL COORDINATOR COPILOT ---
  static async recordCopilotAudit(audit: CoordinatorCopilotAuditEntity): Promise<CoordinatorCopilotAuditEntity> {
    this.copilotAudits.push(audit);

    try {
      if (supabase) {
        await supabase.from('coordinator_copilot_audits').insert({
          id: audit.id,
          school_id: audit.school_id,
          user_id: audit.user_id,
          user_role: audit.user_role,
          raw_query: audit.raw_query,
          resolved_intent: audit.resolved_intent,
          scope_descriptor: audit.scope_descriptor,
          metrics_queried: audit.metrics_queried,
          prompt_version: audit.prompt_version,
          model_identifier: audit.model_identifier,
          response_summary: audit.response_summary,
          suggested_actions: audit.suggested_actions,
          created_at: audit.created_at
        });
      }
    } catch {
      // Degradar a memoria
    }

    return audit;
  }

  static async listCopilotAudits(userId?: string): Promise<CoordinatorCopilotAuditEntity[]> {
    if (userId) {
      return this.copilotAudits.filter(a => a.user_id === userId);
    }
    return this.copilotAudits;
  }
}
