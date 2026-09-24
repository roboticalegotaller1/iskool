/**
 * @file types.ts
 * @description Definición de tipos canónicos e interfaces del Course Planning Layer de iSchool (Fase 6).
 * Modela la jerarquía Course -> Units -> Lessons -> Activity Slots -> Assessments,
 * así como los contratos para presupuestos temporales, balances didácticos, alineación y calidad.
 */

import { CefrLevel, SkillType } from '../knowledgeVault/types';
import { AcademicActivityOutput } from '../academicGeneration/types';

export type CourseStatus = 'draft' | 'review' | 'approved' | 'archived';
export type UnitStatus = 'draft' | 'review' | 'approved';
export type LessonStatus = 'draft' | 'review' | 'approved';
export type AssessmentStatus = 'draft' | 'review' | 'approved';

export type LessonType = 
  | 'introduction'
  | 'development'
  | 'practice'
  | 'integration'
  | 'review'
  | 'assessment'
  | 'project';

export type PedagogicalModel = 
  | 'PPP'               // Presentation, Practice, Production
  | 'ESA'               // Engage, Study, Activate
  | 'TBL'               // Task-Based Learning
  | 'PBL'               // Project-Based Learning
  | 'discussion_first'  // Inquiry & Discourse First
  | 'inquiry_based';

export type SlotPurpose = 
  | 'opening'
  | 'activation'
  | 'input'
  | 'guided_practice'
  | 'independent_practice'
  | 'collaborative_production'
  | 'reflection'
  | 'assessment'
  | 'wrap_up';

export type SlotStatus = 'pending' | 'generated' | 'customized' | 'reviewed';

export type AssessmentType = 
  | 'diagnostic'
  | 'formative'
  | 'summative'
  | 'performance'
  | 'project'
  | 'quiz'
  | 'exam'
  | 'portfolio';

export type SpiralProgressionRole = 
  | 'introduce'
  | 'practice'
  | 'revisit'
  | 'consolidate'
  | 'extend'
  | 'assess';

/**
 * Perfil académico y restricciones para el diseño del curso
 */
export interface CourseProfile {
  grade: string;
  entry_profile: {
    cefr: CefrLevel | string;
  };
  target_profile: {
    cefr: CefrLevel | string;
  };
  priority_skills: (SkillType | string)[];
  total_weeks: number;
  sessions_per_week: number;
  minutes_per_session: number;
  instructional_allocation_percent?: number; // e.g. 85%
  buffer_allocation_percent?: number;        // e.g. 15%
}

/**
 * Entidad Course (Plan Anual de Asignatura)
 */
export interface CourseEntity {
  id: string;
  school_id?: string;
  subject_id?: string;
  academic_year_id?: string;
  level_grade_id?: string;
  
  title: string;
  subject: string;
  school_stage: string;
  grade: string;
  academic_year: string;
  
  entry_cefr: string;
  target_cefr: string;
  
  total_weeks: number;
  sessions_per_week: number;
  minutes_per_session: number;
  instructional_allocation_percent: number;
  buffer_allocation_percent: number;
  
  status: CourseStatus;
  version: number;
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

/**
 * Entidad Unit (Agrupación Temática y de Competencias)
 */
export interface UnitEntity {
  id: string;
  course_id: string;
  position: number;
  title: string;
  theme: string;
  duration_weeks: number;
  
  knowledge_targets: string[];      // IDs de la Bóveda Curricular
  learning_outcomes: string[];      // Resultados esperados observables
  skills: string[];                 // Habilidades cubiertas
  
  grammar_targets: string[];
  vocabulary_domains: string[];
  language_functions: string[];
  
  assessment_targets: string[];
  prerequisite_unit_ids: string[];
  
  status: UnitStatus;
  version: number;
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

/**
 * Entidad Lesson (Sesión Didáctica de Aula)
 */
export interface LessonEntity {
  id: string;
  unit_id: string;
  position: number;
  week_number: number;
  session_number: number;
  
  title: string;
  duration_minutes: number;
  lesson_type: LessonType;
  pedagogical_model: PedagogicalModel;
  
  primary_learning_outcome: string;
  secondary_learning_outcomes: string[];
  
  knowledge_targets: string[];      // IDs de la Bóveda Curricular
  activity_patterns: string[];      // e.g. 'guided_discussion', 'opinion_paragraph'
  assessment_evidence?: string;
  
  status: LessonStatus;
  metadata: Record<string, unknown>;
  
  created_at: string;
  updated_at: string;
}

/**
 * Ranura de Actividad Didáctica dentro de una Lección
 */
export interface ActivitySlotEntity {
  id: string;
  lesson_id: string;
  position: number;
  purpose: SlotPurpose;
  duration_minutes: number;
  activity_pattern?: string;
  instructions_brief?: string;
  
  generated_activity_id?: string;
  generated_payload?: AcademicActivityOutput;
  status: SlotStatus;
  
  created_at: string;
  updated_at: string;
}

/**
 * Blueprint de Evaluación Formativa o Sumativa
 */
export interface AssessmentBlueprintData {
  skill_weights: Record<string, number>; // e.g. { reading: 30, writing: 25, speaking: 25, listening: 20 }
  target_cefr: string;
  evidence_types: string[];
  rubric_id?: string;
  item_specifications: {
    section_name: string;
    skill: string;
    weight_percent: number;
    format: string;
    learning_outcomes: string[];
    knowledge_targets: string[];
  }[];
}

/**
 * Entidad Assessment (Instancia o Hito Evaluativo)
 */
export interface AssessmentEntity {
  id: string;
  course_id: string;
  unit_id?: string;
  
  title: string;
  assessment_type: AssessmentType;
  week_scheduled: number;
  
  blueprint: AssessmentBlueprintData;
  rubric_id?: string;
  learning_outcomes: string[];
  knowledge_targets: string[];
  
  status: AssessmentStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Diagnóstico del Presupuesto de Tiempo
 */
export interface TimeBudgetReport {
  total_weeks: number;
  sessions_per_week: number;
  minutes_per_session: number;
  total_available_minutes: number;
  
  target_instructional_minutes: number;
  planned_instructional_minutes: number;
  
  target_buffer_minutes: number;
  planned_buffer_minutes: number;
  
  total_planned_minutes: number;
  is_overflow: boolean;
  overflow_minutes: number;
  instructional_utilization_percent: number;
}

/**
 * Diagnóstico de Equilibrio de Habilidades Didácticas
 */
export interface SkillBalanceReport {
  total_slots: number;
  skill_counts: Record<string, number>;
  skill_percentages: Record<string, number>;
  warnings: string[];
  is_balanced: boolean;
}

/**
 * Registro de Exposición en la Línea de Tiempo Curricular Espiral
 */
export interface KnowledgeExposureEvent {
  week: number;
  session_number: number;
  unit_position: number;
  lesson_title: string;
  role: SpiralProgressionRole;
}

export interface KnowledgeTimelineNode {
  knowledge_id: string;
  title: string;
  exposures: KnowledgeExposureEvent[];
  total_exposures: number;
  is_single_exposure_warning: boolean;
}

export interface KnowledgeTimelineReport {
  course_id: string;
  total_nodes_tracked: number;
  single_exposure_warnings: string[];
  timeline: Record<string, KnowledgeTimelineNode>;
}

/**
 * Reporte de Alineación Curricular (Taught vs Assessed)
 */
export interface CurriculumAlignmentReport {
  course_id: string;
  taught_not_assessed: string[];
  assessed_not_taught: string[];
  outcome_not_scheduled: string[];
  knowledge_without_lesson: string[];
  assessment_without_learning_target: string[];
  alignment_score_percent: number;
  is_fully_aligned: boolean;
}

/**
 * Reporte de Cobertura de Grado (Grade Map vs Course Plan)
 */
export interface CourseCoverageReport {
  course_id: string;
  grade: string;
  required_knowledge_targets: string[];
  covered_targets: string[];
  partially_covered_targets: string[];
  missing_targets: string[];
  coverage_percent: number;
}

/**
 * Verificaciones de Calidad e Integridad Curricular
 */
export interface QualityCheckItem {
  rule_id: string;
  title: string;
  severity: 'error' | 'warning' | 'info';
  passed: boolean;
  message: string;
  details?: unknown;
}

export interface CourseQualityReport {
  passed: boolean;
  total_checks: number;
  error_count: number;
  warning_count: number;
  checks: QualityCheckItem[];
}
