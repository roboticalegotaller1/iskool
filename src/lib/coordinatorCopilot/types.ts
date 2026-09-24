/**
 * @file types.ts
 * @description Tipos, intenciones y contratos para el Asistente de Coordinación Pedagógica (Coordinator Copilot / Fase 11).
 * Define las 10 intenciones directivas, el contexto agregado con Zero PII y las salidas estructuradas de briefs.
 */

import { SkillType } from '../knowledgeVault/types';
import {
  FairGroupComparisonDTO,
  GradeCurriculumViewDTO,
  KnowledgeBottleneckViewDTO,
  LeadershipInterventionViewDTO,
  LeadershipScopeDescriptor,
  LeadershipTopSummaryDTO,
  PriorityAttentionSignalDTO,
  WhatChangedItemDTO
} from '../leadership/types';

export type CoordinatorRequestType =
  | 'overview'               // ¿Cómo vamos en inglés?
  | 'compare_groups'         // Compara los grupos de High School 1 / ¿Qué grupo necesita refuerzo?
  | 'skill_analysis'         // ¿Por qué High School 1 está bajo en speaking?
  | 'curriculum_gap'         // ¿Los alumnos están dominando lo que ya se enseñó? (IMG)
  | 'knowledge_bottleneck'   // ¿Qué competencia está bloqueando más aprendizajes?
  | 'trend_analysis'         // ¿Qué cambió respecto al mes pasado?
  | 'intervention_analysis'  // ¿Funcionó la intervención en clarification?
  | 'course_progress'        // ¿Qué falta cubrir en el currículo?
  | 'evidence_quality'       // ¿Dónde tenemos poca evidencia?
  | 'action_planning';       // ¿Qué debería revisar con los maestros mañana en la junta?

export interface ResolvedCoordinatorIntent {
  intent: CoordinatorRequestType;
  target_grade?: string;
  target_group?: string;
  target_skill?: SkillType | string;
  target_knowledge_unit?: string;
  time_window?: string;
  requires_explanation: boolean;
}

export interface CoordinatorScopedContext {
  scope: LeadershipScopeDescriptor;
  overview: LeadershipTopSummaryDTO;
  curriculum: GradeCurriculumViewDTO;
  bottlenecks: KnowledgeBottleneckViewDTO[];
  groups: FairGroupComparisonDTO[];
  recent_changes: WhatChangedItemDTO[];
  priority_signals: PriorityAttentionSignalDTO[];
  interventions: LeadershipInterventionViewDTO[];
  zero_pii_confirmed: boolean;
}

export interface CoordinatorCopilotResponseOutput {
  intent: CoordinatorRequestType;
  summary: string;
  grounding_data: Record<string, any>;
  why_explanation: string;
  action_recommendations: {
    action_type: string;
    description: string;
    why_rationale: string;
    requires_approval: boolean;
  }[];
  insufficient_evidence_warning?: string;
  audit_id: string;
}

export interface CoordinatorDailyBriefDTO {
  date: string;
  scope_name: string;
  headline: string;
  top_attention_signals: {
    title: string;
    metrics_summary: string;
    trend: string;
    evidence_status: string;
  }[];
  recommended_daily_action: string;
}

export interface CoordinatorWeeklyBriefDTO {
  week_label: string;
  scope_name: string;
  what_improved: string[];
  what_declined: string[];
  what_stayed_stable: string[];
  new_alerts_count: number;
  resolved_alerts_count: number;
  active_interventions_count: number;
  coverage_delta: number;
  mastery_delta: number;
  evidence_quality_status: string;
}

export interface AcademicMeetingBriefDTO {
  meeting_title: string;
  scope_name: string;
  date: string;
  agenda_topics: {
    topic_number: number;
    title: string;
    academic_signal: string;
    observed_data: string;
    suggested_discussion_questions: string[];
  }[];
  meeting_ground_rules: string[]; // Cero ataques personales, enfoque en prerrequisitos y evidencias
}
