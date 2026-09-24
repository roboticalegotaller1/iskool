/**
 * @file types.ts
 * @description Tipos, esquemas y contratos de datos para la capa de Generación Académica de iSchool.
 * Establece estructuras estrictas para solicitudes, salidas educativas, validación y trazabilidad.
 */

import { CefrLevel, SkillType } from '../knowledgeVault/types';

export interface AcademicGenerationParams {
  grade: string;
  cefr: CefrLevel | string;
  skill: SkillType | string;
  topic: string;
  language_function: string;
  activity_type?: string;
  duration_minutes: number;
  adaptation?: 'core' | 'support' | 'extension';
  student_context?: unknown;
  [key: string]: unknown;
}

export interface AcademicActivityStep {
  phase: 'warm_up' | 'core_task' | 'wrap_up' | string;
  duration_minutes: number;
  teacher_instructions: string;
  student_instructions: string;
}

export interface AcademicLanguageSupport {
  useful_phrases: string[];
  grammar_support: string[];
  vocabulary_support: string[];
}

export interface AcademicAssessment {
  criteria: string[];
  rubric_snapshot?: string[];
}

export interface AcademicActivityOutput {
  title: string;
  grade: string;
  cefr: string;
  skill: string;
  topic: string;
  language_function: string;
  activity_type: string;
  duration_minutes: number;
  learning_objective: string;
  student_instructions: string;
  teacher_instructions: string;
  language_support: AcademicLanguageSupport;
  activity_steps: AcademicActivityStep[];
  assessment: AcademicAssessment;
  [key: string]: unknown;
}

export interface FieldMismatch {
  field: string;
  expected: unknown;
  received: unknown;
}

export interface AcademicValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  mismatches: FieldMismatch[];
}

export interface KnowledgeDocumentVersion {
  document_id: string;
  version: number;
  checksum: string;
  title?: string;
  document_type?: string;
}

export interface TraceabilityRecord {
  generation_id: string;
  request: AcademicGenerationParams;
  knowledge_document_ids: string[];
  knowledge_versions: KnowledgeDocumentVersion[];
  prompt_version: string;
  model: string;
  prompt_sent?: string;
  raw_output: string;
  generated_output: AcademicActivityOutput | null;
  validation: AcademicValidationResult;
  created_at: string;
}

export interface AcademicGenerationResult {
  success: boolean;
  activity?: AcademicActivityOutput;
  traceability: TraceabilityRecord;
  validation: AcademicValidationResult;
  error?: string;
}
