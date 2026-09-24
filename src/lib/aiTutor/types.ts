/**
 * @file types.ts
 * @description Contratos de datos, tipos canónicos e interfaces del AI Tutor Layer de iSchool (Fase 8).
 * Modela sesiones de tutoría conversacional ancladas a lecciones y al currículo,
 * memoria de sesión estructurada, escaleras de pistas, andamiaje dinámico y resúmenes.
 */

import { CefrLevel, SkillType } from '../knowledgeVault/types';
import { LearningEvidenceEntity } from '../adaptiveLearning/types';

export type TutorSessionType = 
  | 'lesson_support'
  | 'practice'
  | 'review'
  | 'homework_help'
  | 'gap_remediation'
  | 'extension'
  | 'assessment_preparation';

export type TutorSessionStatus = 'active' | 'paused' | 'completed' | 'abandoned';

export type TutorMode = 
  | 'explain'
  | 'guided_practice'
  | 'socratic'
  | 'practice'
  | 'feedback'
  | 'review'
  | 'challenge';

export type HintLevel = 1 | 2 | 3 | 4 | 5;

export type ScaffoldingLevel = 'high' | 'medium' | 'low';

export type LanguagePolicy = 
  | 'target_language_only'
  | 'mostly_target_language'
  | 'bilingual_support';

export type NextStepDecision = 
  | 'explain'
  | 'ask'
  | 'hint'
  | 'practice'
  | 'review_prerequisite'
  | 'increase_difficulty'
  | 'reduce_scaffolding'
  | 'exit_check'
  | 'finish';

/**
 * Estado Académico Estructurado de la Conversación
 * Mantiene la memoria didáctica sin necesidad de reenviar indefinidamente todo el historial textual.
 */
export interface ConversationState {
  current_objective: string;
  current_concept_id: string;
  main_target_id: string;
  temporary_support_target_id?: string; // Usado durante Prerequisite Fallback
  
  questions_attempted: number;
  successful_attempts: number;
  consecutive_correct: number;
  consecutive_errors: number;
  
  hints_used_count: number;
  current_hint_level: HintLevel;
  
  observed_errors: string[];
  demonstrated_understanding: boolean;
  remaining_goals: string[];
  
  is_exit_check: boolean;
  exit_check_passed: boolean;
}

/**
 * Mensaje individual de la sesión de tutoría
 */
export interface TutorMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  tutor_action?: string;
  hint_level?: number;
  scaffolding_level?: ScaffoldingLevel;
  metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * Entidad Canónica de Sesión de Tutoría
 */
export interface TutorSessionEntity {
  id: string;
  student_id: string;
  school_id?: string;
  course_id?: string;
  unit_id?: string;
  lesson_id?: string;
  
  session_type: TutorSessionType;
  status: TutorSessionStatus;
  tutor_mode: TutorMode;
  scaffolding_level: ScaffoldingLevel;
  language_policy: LanguagePolicy;
  
  primary_learning_outcome: string;
  knowledge_target_ids: string[];
  
  conversation_state: ConversationState;
  messages: TutorMessage[];
  evidence_id?: string;
  
  started_at: string;
  completed_at?: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
}

/**
 * Respuesta estructurada producida por el Motor de IA Pedagógica
 */
export interface TutorResponseOutput {
  student_message: string;
  tutor_action: NextStepDecision;
  target_knowledge: string;
  evidence?: {
    demonstrated: boolean;
    confidence: number;
    notes: string;
  };
  next_step: string;
  hint_level_given?: number;
  scaffolding_adjustment?: 'increased' | 'decreased' | 'maintained';
}

/**
 * Resumen amigable orientado al estudiante
 */
export interface StudentFacingSummary {
  today_practiced: string;
  did_well_with: string;
  keep_practicing: string;
  next_recommendation: string;
}

/**
 * Resumen técnico orientado al profesor
 */
export interface TeacherFacingSummary {
  target_unit_id: string;
  total_questions_attempted: number;
  independent_successful_attempts: number;
  hints_required_count: number;
  main_issues_observed: string[];
  suggested_action: string;
  evidence_record_id?: string;
}

/**
 * Resumen consolidado de la sesión
 */
export interface TutorSessionSummary {
  session_id: string;
  student_id: string;
  duration_seconds: number;
  student_summary: StudentFacingSummary;
  teacher_summary: TeacherFacingSummary;
  generated_evidence?: LearningEvidenceEntity;
}
