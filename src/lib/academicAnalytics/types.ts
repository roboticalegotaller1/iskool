/**
 * @file types.ts
 * @description Tipos canónicos, contratos e interfaces del Academic Analytics Layer de iSchool (Fase 10).
 * Define dimensiones analíticas, métricas pedagógicas deterministas, heatmaps, alertas estructuradas,
 * snapshots históricos, contratos de dashboard e informes de calidad de datos.
 */

import { CefrLevel, SkillType } from '../knowledgeVault/types';
import { MasteryState } from '../adaptiveLearning/types';

export type AnalyticsScopeType = 'student' | 'group' | 'course' | 'curriculum' | 'grade' | 'school_stage';

export type TimeWindow = '7_days' | '30_days' | 'unit' | 'term' | 'semester' | 'academic_year';

export type AlertSeverity = 'info' | 'attention' | 'priority';

export type AcademicAlertType =
  | 'student_gap'
  | 'group_gap'
  | 'curriculum_bottleneck'
  | 'assessment_issue'
  | 'course_delay'
  | 'mastery_stagnation'
  | 'low_evidence'
  | 'skill_imbalance'
  | 'coverage_gap'
  | 'instruction_mastery_gap';

export type ConfidenceRating = 'low' | 'medium' | 'high';

/**
 * Métrica de Confianza de Datos (Ítem #8)
 */
export interface MetricConfidence {
  rating: ConfidenceRating;
  evidence_count: number;
  distinct_sources_count: number;
  last_evidence_date?: string;
  is_provisional: boolean;
  rationale: string;
}

/**
 * Tasa de Maestría de Conocimiento Granular (KMR)
 */
export interface KnowledgeMasteryRate {
  knowledge_unit_id: string;
  title: string;
  cefr: string;
  skill: string;
  total_students_assessed: number;
  secure_or_mastered_count: number;
  developing_count: number;
  needs_support_count: number;
  mastery_percentage: number; // 0 - 100
  confidence: MetricConfidence;
}

/**
 * Resumen de Maestría por Macro-Habilidad
 */
export interface SkillMasteryMetric {
  skill: SkillType | string;
  mastery_percentage: number; // 0 - 100
  cefr_equivalent: string;
  evidence_volume: number;
  confidence: MetricConfidence;
  status: 'critical_attention' | 'developing' | 'on_target' | 'strong';
}

/**
 * Velocidad de Aprendizaje Ponderada (Ítem #7)
 * Mide unidades aseguradas en la ventana sin etiquetar al alumno.
 */
export interface LearningVelocityMetric {
  units_secured_in_period: number;
  total_units_targeted: number;
  acquisition_rate: number; // Unidades por semana/término
  opportunity_context: string; // Contexto de horas de clase y sesiones activas
  confidence: MetricConfidence;
}

/**
 * Matriz de Knowledge Heatmap (Ítem #10)
 */
export interface KnowledgeHeatmapRow {
  knowledge_unit_id: string;
  title: string;
  skill: string;
  cefr: string;
  group_mastery_percent: number;
  mastery_tier: 'high_mastery' | 'moderate_mastery' | 'emerging' | 'critical_gap';
}

/**
 * Matriz de Skill Heatmap (Ítem #11)
 */
export interface SkillHeatmapRow {
  scope_name: string; // Grupo, Grado o Término
  listening: number;
  speaking: number;
  reading: number;
  writing: number;
  grammar: number;
  vocabulary: number;
}

/**
 * Diagnóstico de Brecha Instrucción-Maestría (Ítems #19 y #20)
 */
export interface InstructionMasteryGapReport {
  course_id: string;
  course_title: string;
  curriculum_coverage_percent: number; // Taught
  student_mastery_percent: number;     // Mastered
  gap_percentage: number;              // Taught - Mastered
  is_divergent: boolean;               // True si gap > 25%
  divergent_targets: {
    unit_id: string;
    title: string;
    taught_in_lesson: string;
    actual_mastery_percent: number;
  }[];
  pedagogical_signal: string;
}

/**
 * Detección de Cuello de Botella Curricular (Ítems #13 y #14)
 */
export interface CurriculumBottleneck {
  bottleneck_unit_id: string;
  title: string;
  skill: string;
  cefr: string;
  group_mastery_percent: number;
  dependent_downstream_units_count: number;
  impacted_future_lessons: string[];
  severity: AlertSeverity;
  observed_contributor_analysis: string;
  recommended_reteach_action: string;
}

/**
 * Comparativa Temporal de Tendencia (Ítems #21 a #23)
 */
export interface TrendComparisonResult {
  scope_id: string;
  metric_name: string;
  time_window: TimeWindow;
  baseline_value: number | null;
  current_value: number;
  delta_percent: number | null;
  direction: 'improving' | 'stagnant' | 'regressing' | 'insufficient_data';
  has_sufficient_data: boolean;
  data_points_analyzed: number;
  narrative_summary: string;
}

/**
 * Entidad de Alerta Académica Estructurada (Ítems #24 a #28)
 */
export interface AcademicAlertEntity {
  id: string;
  school_id?: string;
  course_id?: string;
  scope_type: AnalyticsScopeType;
  scope_id: string;
  alert_type: AcademicAlertType;
  severity: AlertSeverity;
  target_knowledge_id?: string;
  signal_summary: string;
  supporting_evidence: {
    data_points: number;
    metrics_summary: string;
    key_observations: string[];
  };
  suggested_actions: string[];
  status: 'active' | 'acknowledged' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

/**
 * Seguimiento de Intervención Pedagógica (Ítems #48 y #49)
 */
export interface AcademicInterventionEntity {
  id: string;
  school_id?: string;
  course_id?: string;
  scope_type: 'student' | 'group' | 'grade';
  scope_id: string;
  target_knowledge_id: string;
  strategy: string;
  start_date: string;
  end_date?: string;
  baseline_mastery: number; // Porcentaje antes de la intervención
  post_intervention_mastery?: number; // Porcentaje después
  delta_improvement?: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  sample_size_students: number;
  evaluation_limitations: string;
  created_at: string;
  updated_at: string;
}

/**
 * Instantánea Periódica de Analítica (Ítem #42)
 */
export interface AcademicAnalyticsSnapshotEntity {
  id: string;
  school_id?: string;
  course_id?: string;
  group_id?: string;
  grade?: string;
  snapshot_date: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'unit_end' | 'term_end';
  metrics_payload: {
    coverage_percent: number;
    average_mastery_percent: number;
    skill_mastery: Record<string, number>;
    cefr_distribution: Record<string, number>;
    top_gaps: string[];
  };
  created_at: string;
}

/**
 * Informe de Integridad y Salud de Datos (Ítem #65 y #66)
 */
export interface AnalyticsHealthReport {
  timestamp: string;
  total_evidence_records: number;
  total_students_tracked: number;
  students_with_evidence: number;
  students_without_evidence: number;
  orphan_evidence_count: number;
  invalid_knowledge_references: string[];
  stale_profiles_count: number; // Sin evidencia en > 45 días
  low_confidence_metrics_count: number;
  status: 'healthy' | 'warning' | 'critical';
  recommendations: string[];
}

/**
 * Contrato de Datos para Dashboard Ejecutivo (Ítem #33 y #52)
 */
export interface ExecutiveAcademicSummaryDTO {
  school_stage: string;
  grade: string;
  subject: string;
  total_students: number;
  curriculum_coverage_percent: number;
  average_mastery_percent: number;
  instruction_mastery_gap: number;
  strongest_skill: string;
  primary_attention_skill: string;
  key_curriculum_bottleneck: string | null;
  groups_requiring_attention_count: number;
  students_requiring_targeted_support_count: number;
  priority_alerts_count: number;
  alerts: AcademicAlertEntity[];
  skill_mastery_breakdown: SkillMasteryMetric[];
  narrative_insight?: string;
}
