/**
 * @file analyticsStore.ts
 * @description Capa de Almacenamiento y Persistencia para el Academic Analytics Layer (Fase 10).
 * Soporte dual: In-Memory Map para pruebas automatizadas offline y Supabase para base de datos productiva.
 */

import {
  AcademicAnalyticsSnapshotEntity,
  AcademicAlertEntity,
  AcademicInterventionEntity
} from './types';
import { supabase } from '../supabaseClient';

export class AcademicAnalyticsStore {
  private static snapshots = new Map<string, AcademicAnalyticsSnapshotEntity>();
  private static alerts = new Map<string, AcademicAlertEntity>();
  private static interventions = new Map<string, AcademicInterventionEntity>();

  static clear(): void {
    this.snapshots.clear();
    this.alerts.clear();
    this.interventions.clear();
  }

  // --- SNAPSHOTS HISTÓRICOS ---
  static async saveSnapshot(snapshot: AcademicAnalyticsSnapshotEntity): Promise<AcademicAnalyticsSnapshotEntity> {
    this.snapshots.set(snapshot.id, snapshot);

    try {
      if (supabase) {
        await supabase.from('academic_analytics_snapshots').upsert({
          id: snapshot.id,
          school_id: snapshot.school_id,
          course_id: snapshot.course_id,
          group_id: snapshot.group_id,
          grade: snapshot.grade,
          snapshot_date: snapshot.snapshot_date,
          period_type: snapshot.period_type,
          metrics_payload: snapshot.metrics_payload,
          created_at: snapshot.created_at
        });
      }
    } catch {
      // Degradar a memoria
    }

    return snapshot;
  }

  static async getSnapshots(scopeId?: string): Promise<AcademicAnalyticsSnapshotEntity[]> {
    const list = Array.from(this.snapshots.values());
    if (scopeId) {
      return list.filter(s => s.group_id === scopeId || s.course_id === scopeId);
    }
    return list;
  }

  // --- ALERTAS ACADÉMICAS ---
  static async saveAlert(alert: AcademicAlertEntity): Promise<AcademicAlertEntity> {
    this.alerts.set(alert.id, { ...alert, updated_at: new Date().toISOString() });

    try {
      if (supabase) {
        await supabase.from('academic_alerts').upsert({
          id: alert.id,
          school_id: alert.school_id,
          course_id: alert.course_id,
          scope_type: alert.scope_type,
          scope_id: alert.scope_id,
          alert_type: alert.alert_type,
          severity: alert.severity,
          target_knowledge_id: alert.target_knowledge_id,
          signal_summary: alert.signal_summary,
          supporting_evidence: alert.supporting_evidence,
          suggested_actions: alert.suggested_actions,
          status: alert.status,
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Degradar a memoria
    }

    return alert;
  }

  static async getAlert(id: string): Promise<AcademicAlertEntity | undefined> {
    return this.alerts.get(id);
  }

  static async getAlerts(scopeId?: string): Promise<AcademicAlertEntity[]> {
    const list = Array.from(this.alerts.values());
    if (scopeId) {
      return list.filter(a => a.scope_id === scopeId);
    }
    return list;
  }

  static async updateAlertStatus(alertId: string, status: AcademicAlertEntity['status']): Promise<AcademicAlertEntity | null> {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;
    alert.status = status;
    alert.updated_at = new Date().toISOString();
    this.alerts.set(alertId, alert);
    return alert;
  }

  // --- INTERVENCIONES DIDÁCTICAS ---
  static async saveIntervention(intervention: AcademicInterventionEntity): Promise<AcademicInterventionEntity> {
    this.interventions.set(intervention.id, { ...intervention, updated_at: new Date().toISOString() });

    try {
      if (supabase) {
        await supabase.from('academic_interventions').upsert({
          id: intervention.id,
          school_id: intervention.school_id,
          course_id: intervention.course_id,
          scope_type: intervention.scope_type,
          scope_id: intervention.scope_id,
          target_knowledge_id: intervention.target_knowledge_id,
          strategy: intervention.strategy,
          start_date: intervention.start_date,
          end_date: intervention.end_date,
          baseline_mastery: intervention.baseline_mastery,
          post_intervention_mastery: intervention.post_intervention_mastery,
          status: intervention.status,
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Degradar a memoria
    }

    return intervention;
  }

  static async getInterventions(scopeId?: string): Promise<AcademicInterventionEntity[]> {
    const list = Array.from(this.interventions.values());
    if (scopeId) {
      return list.filter(i => i.scope_id === scopeId);
    }
    return list;
  }
}
