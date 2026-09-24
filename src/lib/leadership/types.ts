/**
 * @file types.ts
 * @description Contratos de datos, tipos canónicos y modelos del Leadership Dashboard y Action Center (Fase 11).
 * Define las estructuras para el resumen ejecutivo, comparativas temporales, señales académicas prioritarias,
 * comparativa justa entre grupos, ciclo de vida de alertas pedagógicas y panel de calidad de datos.
 */

import { SkillType } from '../knowledgeVault/types';
import {
  AcademicAlertEntity,
  AcademicAlertType,
  AlertSeverity,
  ConfidenceRating,
  MetricConfidence,
  SkillMasteryMetric,
  TimeWindow
} from '../academicAnalytics/types';
import { UserRole } from '@/types';

export type LeadershipScopeType =
  | 'school'
  | 'campus'
  | 'school_stage'
  | 'grade'
  | 'subject'
  | 'course'
  | 'group'
  | 'academic_period';

export interface LeadershipScopeDescriptor {
  scope_type: LeadershipScopeType;
  school_id: string;
  campus_id?: string;
  school_stage?: string; // 'High School', 'Secundaria', 'Primaria', etc.
  grade?: string;        // 'high_school_1', 'secondary_2', etc.
  subject?: string;      // 'English', etc.
  course_id?: string;
  group_id?: string;     // 'group_a', etc.
  academic_period?: string; // 'term_1_2026', etc.
}

/**
 * Resumen Ejecutivo Superior (Top Summary / Ítem #5 y #6)
 * Prohibido crear un "School Academic Score" opaco. Métricas separadas e interpretables.
 */
export interface LeadershipTopSummaryDTO {
  scope_name: string;
  subject: string;
  total_students: number;
  total_groups: number;
  curriculum_coverage_percent: number; // Taught
  knowledge_mastery_percent: number;   // Mastered
  instruction_mastery_gap: number;     // Taught - Mastered
  overall_trend: 'improving' | 'stagnant' | 'regressing' | 'insufficient_data';
  primary_academic_attention: string;  // e.g. "Speaking Interaction (Clarification)"
  strongest_academic_area: string;     // e.g. "Reading Inference"
  priority_alerts_count: number;
  groups_needing_attention_count: number;
  low_evidence_groups_count: number;
  data_freshness_timestamp: string;
}

/**
 * Sección "¿Qué Cambió?" (What Changed? / Ítem #7)
 * Comparativa longitudinal trazable frente al periodo previo.
 */
export interface WhatChangedItemDTO {
  target: string; // Habilidad, grupo o concepto
  baseline_period: string;
  current_period: string;
  delta_description: string;
  direction: 'improved' | 'declined' | 'stable' | 'insufficient_data';
  delta_percent?: number;
  data_support: string;
}

export interface WhatChangedSectionDTO {
  time_window: TimeWindow;
  comparison_label: string; // e.g. "Últimos 30 días vs periodo previo"
  changes: WhatChangedItemDTO[];
}

/**
 * Señal Académica Prioritaria (Priority Attention / Ítem #8)
 * Basada en hechos observados, sin ordenar personas ni asignar culpas.
 */
export interface PriorityAttentionSignalDTO {
  id: string;
  scope_label: string;
  category: AcademicAlertType;
  severity: AlertSeverity;
  headline: string;
  observed_signal: string;
  supporting_data: {
    evidence_points: number;
    metrics_summary: string;
  };
  recommended_academic_action: string;
  requires_coordinator_action: boolean;
}

/**
 * Señal Positiva de Consolidación (Positive Signals / Ítem #9)
 */
export interface PositiveSignalDTO {
  id: string;
  scope_label: string;
  headline: string;
  details: string;
  evidence_points: number;
  growth_delta?: number;
}

/**
 * Comparativa Justa entre Grupos (Fair Group Comparison / Ítems #14 y #15)
 * Incluye contexto relevante para evitar comparaciones descontextualizadas o rankings docentes.
 */
export interface FairGroupComparisonDTO {
  group_id: string;
  group_name: string;
  student_count: number;
  course_coverage_percent: number;
  knowledge_mastery_percent: number;
  instruction_mastery_gap: number;
  evidence_confidence: ConfidenceRating;
  evidence_volume: number;
  starting_level: string; // e.g. "A2 entry"
  course_timeline_position: string; // e.g. "Week 12 of 36"
  strongest_skill: string;
  primary_gap: string;
  status: 'on_track' | 'divergent_gap' | 'low_evidence' | 'steady_progress';
}

/**
 * Vista de Cuello de Botella Curricular (Knowledge Bottleneck View / Ítem #11)
 */
export interface KnowledgeBottleneckViewDTO {
  unit_id: string;
  title: string;
  cefr: string;
  skill: string;
  mastery_percentage: number;
  downstream_dependencies_count: number;
  impacted_learning_targets: string[];
  affected_groups: string[];
  total_observations: number;
  trend: 'improving' | 'stagnant' | 'regressing';
  actionable_recommendation: string;
}

/**
 * Vista Curricular de Cobertura y Consolidación por Grado (Ítem #12)
 */
export interface GradeCurriculumViewDTO {
  grade: string;
  subject: string;
  total_curriculum_targets: number;
  taught_count: number;
  secure_or_mastered_count: number;
  developing_count: number;
  low_evidence_count: number;
  not_yet_taught_count: number;
}

/**
 * Vista de Intervenciones Pedagógicas (Ítem #20)
 */
export interface LeadershipInterventionViewDTO {
  id: string;
  target_knowledge_title: string;
  scope_name: string;
  strategy: string;
  started_date: string;
  baseline_mastery_percent: number;
  current_mastery_percent: number;
  delta_percent: number;
  sample_size_students: number;
  evidence_confidence: ConfidenceRating;
  status: 'in_progress' | 'completed' | 'abandoned';
  interpretation: string; // Observación prudente sin atribución causal absoluta
  follow_up_review_date: string;
}

/**
 * Panel de Calidad de Datos (Ítem #47)
 */
export interface LeadershipDataQualityPanelDTO {
  status: 'healthy' | 'warning' | 'critical';
  total_evidence_points: number;
  students_tracked: number;
  students_without_recent_evidence: number;
  stale_profiles_count: number;
  low_confidence_metrics_count: number;
  missing_curriculum_mappings_count: number;
  last_updated: string;
}

/**
 * Estado y Ciclo de Vida de Alertas Académicas (Ítems #36 y #37)
 */
export type AlertLifecycleStatus = 'new' | 'reviewed' | 'actioned' | 'resolved' | 'dismissed';

export interface AlertStateHistoryEntry {
  status: AlertLifecycleStatus;
  changed_by: string; // ID o rol del usuario
  timestamp: string;
  notes?: string;
}

/**
 * Entidad de Acción Académica en el Action Center (Ítems #35 y #38)
 */
export interface AcademicActionEntity {
  id: string;
  alert_id?: string;
  action_type:
    | 'review_prerequisite'
    | 'schedule_targeted_practice'
    | 'collect_more_evidence'
    | 'delay_assessment'
    | 'create_intervention'
    | 'observe_skill'
    | 'prepare_teacher_support'
    | 'dismiss_signal';
  title: string;
  description: string;
  affected_scope_type: LeadershipScopeType;
  affected_scope_id: string;
  target_knowledge_id?: string;
  assigned_to_role?: UserRole;
  scheduled_review_date?: string; // Fecha de revisión de seguimiento
  requires_coordinator_approval: boolean;
  is_approved: boolean;
  approved_by?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  created_at: string;
  updated_at: string;
}

/**
 * Contrato Maestro del Leadership Dashboard (Ítem #40)
 */
export interface LeadershipDashboardDTO {
  scope: LeadershipScopeDescriptor;
  academic_period: string;
  data_freshness: string;
  overview: LeadershipTopSummaryDTO;
  what_changed: WhatChangedSectionDTO;
  priority_signals: PriorityAttentionSignalDTO[];
  positive_signals: PositiveSignalDTO[];
  fair_group_comparisons: FairGroupComparisonDTO[];
  curriculum_view: GradeCurriculumViewDTO;
  bottlenecks: KnowledgeBottleneckViewDTO[];
  active_interventions: LeadershipInterventionViewDTO[];
  data_quality: LeadershipDataQualityPanelDTO;
  executive_brief?: string;
}
