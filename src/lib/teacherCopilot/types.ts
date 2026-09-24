/**
 * @file types.ts
 * @description Contratos de datos, tipos canónicos e interfaces del Teacher Copilot de iSchool (Fase 9).
 * Define las entidades de sesión de asistencia docente, intenciones de peticiones pedagógicas,
 * restricciones de aula, preferencias docentes, artefactos borradores y respuestas estructuradas.
 */

import { CefrLevel, SkillType } from '../knowledgeVault/types';
import { AssessmentBlueprintData } from '../coursePlanning/types';

/**
 * Taxonomía Centralizada de Peticiones del Docente (Ítem #4)
 */
export type TeacherRequestType =
  | 'lesson_planning'
  | 'activity_generation'
  | 'differentiation'
  | 'assessment_generation'
  | 'assessment_analysis'
  | 'student_progress'
  | 'group_analysis'
  | 'student_grouping'
  | 'remediation'
  | 'extension'
  | 'course_progress'
  | 'resource_generation'
  | 'summary';

export type CopilotSessionStatus = 'active' | 'completed' | 'archived';
export type ArtifactStatus = 'draft' | 'edited' | 'approved' | 'published' | 'discarded';
export type TeacherActionType = 'pending' | 'approved' | 'edited' | 'published' | 'discarded' | 'regenerated';

export type ArtifactType =
  | 'lesson_plan'
  | 'activity'
  | 'assessment_blueprint'
  | 'assessment_items'
  | 'grouping_plan'
  | 'differentiated_activity'
  | 'course_progress_report'
  | 'daily_brief';

export type GroupingStrategyType =
  | 'similar_need'
  | 'mixed_ability'
  | 'peer_support'
  | 'random'
  | 'project_balance';

/**
 * Condiciones y Restricciones Reales del Aula (Ítems #42 y #43)
 */
export interface ClassroomConstraints {
  class_size: number;
  available_technology: 'none' | 'projector_only' | 'tablets' | 'byod' | 'computer_lab';
  pair_work_allowed: boolean;
  group_work_allowed: boolean;
  printing_available: boolean;
  internet_available: boolean;
  projector_available: boolean;
  time_available_minutes: number;
}

/**
 * Preferencias Pedagógicas Persistentes del Docente (Ítem #44)
 */
export interface TeacherPreferences {
  preferred_lesson_style: 'communicative' | 'socratic' | 'structured' | 'task_based';
  grouping_preference: GroupingStrategyType;
  language_policy: 'target_language_only' | 'mostly_target_language' | 'bilingual_support';
  assessment_style: 'formative_frequent' | 'performance_based' | 'traditional';
  prohibited_dynamics?: string[]; // e.g. ['movement_around_room']
}

/**
 * Entidad TeacherCopilotSession (Ítem #2)
 */
export interface TeacherCopilotSessionEntity {
  id: string;
  teacher_id: string;
  school_id?: string;
  course_id?: string;
  group_id?: string;
  unit_id?: string;
  lesson_id?: string;
  assessment_id?: string;
  
  title: string;
  status: CopilotSessionStatus;
  
  constraints: ClassroomConstraints;
  preferences: TeacherPreferences;
  metadata?: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

/**
 * Intención Resuelta por el IntentService (Ítem #5)
 */
export interface ResolvedTeacherIntent {
  intent: TeacherRequestType;
  confidence: number;
  extracted_params: {
    duration_minutes?: number;
    skill?: SkillType | string;
    topic?: string;
    student_alias?: string;
    grouping_strategy?: GroupingStrategyType;
    assessment_format?: string;
    target_date?: string;
    filter_type?: string;
  };
  raw_request: string;
}

/**
 * Contexto Resuelto para la Petición Docente (Ítem #3 y #6)
 * Zero PII garantizado.
 */
export interface ResolvedTeacherContext {
  teacher_id: string;
  course: {
    id: string;
    title: string;
    grade: string;
    target_cefr: string;
  };
  current_unit?: {
    id: string;
    position: number;
    title: string;
    theme: string;
    knowledge_targets: string[];
    learning_outcomes: string[];
  };
  target_lesson?: {
    id: string;
    position: number;
    week_number: number;
    session_number: number;
    title: string;
    duration_minutes: number;
    primary_learning_outcome: string;
    knowledge_targets: string[];
  };
  knowledge_nodes: {
    id: string;
    title: string;
    cefr: string;
    skill: string;
    prerequisites: string[];
    common_errors: string[];
  }[];
  cohort_summary: {
    total_students: number;
    cefr_distribution: Record<string, number>;
    need_distribution: {
      support: number;
      core: number;
      extension: number;
    };
    most_common_gaps: {
      unit_id: string;
      title: string;
      affected_count: number;
    }[];
  };
  constraints: ClassroomConstraints;
  preferences: TeacherPreferences;
}

/**
 * Agrupación Pedagógica Generada (Ítems #15 a #18)
 */
export interface PedagogicalGroupRecommendation {
  group_number: number;
  label: string;
  strategy: GroupingStrategyType;
  student_aliases: string[];
  suggested_adaptation: 'support' | 'core' | 'extension';
  target_focus: string;
  rationale: string;
}

/**
 * Salida Estructurada Canónica del Teacher Copilot (Ítem #35)
 */
export interface TeacherCopilotResponseOutput {
  intent: TeacherRequestType;
  summary: string;
  recommendations: string[];
  student_groups?: PedagogicalGroupRecommendation[];
  resources?: {
    title: string;
    type: string;
    description: string;
    content: string | Record<string, unknown>;
  }[];
  warnings: string[];
  source_context: {
    course: string;
    unit?: string;
    lesson?: string;
    targets: string[];
  };
  actionable_next_steps: string[];
}

/**
 * Artefacto Pedagógico Generado y Versionado (Ítems #38 y #39)
 */
export interface TeacherGeneratedArtifactEntity {
  id: string;
  session_id: string;
  interaction_id?: string;
  artifact_type: ArtifactType;
  status: ArtifactStatus;
  title: string;
  content: Record<string, unknown>;
  version: number;
  curriculum_locked: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Registro de Auditoría de Interacción (Ítem #48)
 */
export interface TeacherCopilotInteractionEntity {
  id: string;
  session_id: string;
  teacher_id: string;
  request_text: string;
  intent: TeacherRequestType;
  resolved_context: ResolvedTeacherContext;
  model_used: string;
  prompt_version: string;
  response_payload: TeacherCopilotResponseOutput;
  teacher_action: TeacherActionType;
  teacher_feedback?: string;
  created_at: string;
}

/**
 * Salida Especializada: Preparación de Lección (Ítem #9)
 */
export interface LessonPrepDetails {
  course_title: string;
  unit_title: string;
  lesson_title: string;
  duration_minutes: number;
  main_outcome: string;
  knowledge_targets: string[];
  suggested_flow: {
    slot_name: string;
    duration_minutes: number;
    purpose: string;
    description: string;
    interaction_type: 'individual' | 'pairs' | 'plenary' | 'small_groups';
  }[];
  group_needs: {
    support_count: number;
    core_count: number;
    extension_count: number;
  };
  differentiation_tips: {
    support: string;
    extension: string;
  };
  teacher_notes: string[];
  quick_assessment: {
    type: string;
    prompt: string;
    success_criteria: string;
  };
}

/**
 * Salida Especializada: Diagnóstico de Alumno Individual (Ítems #13 y #14)
 */
export interface ExplainableStudentDiagnosis {
  student_alias: string;
  target_outcome: string;
  status: 'needs_support' | 'developing' | 'on_track' | 'advanced';
  reasons: string[];
  demonstrated_strengths: string[];
  active_gaps: {
    unit_id: string;
    title: string;
    gap_type: string;
  }[];
  prerequisite_status: {
    unit_id: string;
    title: string;
    state: string;
  }[];
  pedagogical_recommendation: string;
}
