/**
 * @file types.ts
 * @description Contratos de datos y modelos para la Gobernanza de IA, Minimización de Datos y Seguridad (Fase 12).
 */

export interface SanitizedStudentContext {
  student_ref: string; // ej: 'student_ref_9281'
  grade: string;
  entry_cefr?: string;
  target_cefr?: string;
  active_competencies: string[];
  active_gaps: string[];
  pii_redacted: boolean;
  redacted_fields_count: number;
}

export interface RegisteredPromptEntity {
  prompt_id: string; // ej: 'iskool_tutor_system'
  version: string;   // ej: 'v1.0.0'
  feature: string;
  description: string;
  expected_schema_name: string;
  system_instructions: string;
  updated_at: string;
}

export type SafetyCategory =
  | 'self_harm'
  | 'violence'
  | 'harassment'
  | 'sexual_content'
  | 'privacy_violation'
  | 'unsafe_challenge'
  | 'off_platform_contact';

export interface SafetyCheckResult {
  safe: boolean;
  flagged_categories: SafetyCategory[];
  severity: 'low' | 'medium' | 'high';
  requires_teacher_escalation: boolean;
  action_taken: 'allow' | 'sanitize' | 'block_and_escalate';
  rationale?: string;
}

export interface GoldenEvaluationCase {
  id: string;
  feature: string;
  grade: string;
  cefr: string;
  skill: string;
  prompt_input: string;
  required_elements: string[];
  forbidden_elements: string[];
  max_acceptable_latency_ms: number;
}
