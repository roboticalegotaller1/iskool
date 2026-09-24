/**
 * @file types.ts
 * @description Contratos de datos, tipos canónicos e interfaces del Adaptive Learning Layer de iSchool (Fase 7).
 * Modela perfiles de competencia continua, micro-competencias ligadas al Grafo Curricular,
 * evidencias de aprendizaje, detección y priorización de brechas, rutas personales y decisiones adaptativas.
 */

import { CefrLevel, SkillType } from '../knowledgeVault/types';

export type MasteryState = 
  | 'not_assessed'   // Sin evidencia registrada en el sistema
  | 'introduced'     // Expuesto al contenido pero sin evidencia autónoma suficiente
  | 'developing'     // Comprensión parcial / emergente; requiere andamiaje
  | 'secure'         // Desempeño consistente y autónomo bajo el estándar esperado
  | 'mastered'       // Dominio pleno, fluido y capaz de transferir a contextos complejos
  | 'needs_review';  // Evidencia reciente demuestra regresión o decaimiento temporal

export type ConfidenceLevel = 'low' | 'medium' | 'strong';

export type CompetencySource = 
  | 'automatic'
  | 'teacher_confirmed'
  | 'diagnostic'
  | 'assessment'
  | 'manual';

export type EvidenceType = 
  | 'quiz'
  | 'exam'
  | 'teacher_observation'
  | 'class_activity'
  | 'homework'
  | 'project'
  | 'speaking_performance'
  | 'writing_sample'
  | 'diagnostic';

export type RubricLevel = 'not_met' | 'developing' | 'secure' | 'mastered';

export type GapType = 
  | 'blocking_gap'          // Prerrequisito de 2 o más conceptos subsiguientes en la planificación
  | 'important_gap'         // Concepto objetivo directo de la unidad curricular en curso
  | 'practice_gap'          // Concepto en desarrollo que requiere práctica deliberada
  | 'extension_opportunity';// Concepto dominado; listo para desafío de orden superior

export type NextActionType = 
  | 'review'
  | 'practice'
  | 'continue_course'
  | 'support_prerequisite'
  | 'extension'
  | 'assessment';

export type AdaptationType = 'core' | 'support' | 'extension';

/**
 * Nivel competencial estimado por habilidad
 */
export interface SkillCompetencySummary {
  level: CefrLevel | string;
  confidence: number;            // 0.0 a 1.0
  confidence_level: ConfidenceLevel;
  evidence_count: number;
  last_evaluated_at?: string;
  status: 'needs_support' | 'on_track' | 'progressing' | 'advanced';
}

/**
 * Perfil Académico Sintético del Alumno (1:1 con Student por Asignatura)
 */
export interface StudentAcademicProfileEntity {
  id: string;
  student_id: string;
  school_id?: string;
  
  subject: string;
  grade: string;
  overall_estimated_level: CefrLevel | string;
  
  // Habilidades lingüísticas
  reading: SkillCompetencySummary;
  listening: SkillCompetencySummary;
  speaking: SkillCompetencySummary;
  writing: SkillCompetencySummary;
  grammar: SkillCompetencySummary;
  vocabulary: SkillCompetencySummary;
  
  profile_version: number;
  metadata?: Record<string, unknown>;
  
  created_at: string;
  last_updated_at: string;
}

/**
 * Micro-Competencia Granular ligada al Grafo Curricular (1:N con Student)
 */
export interface StudentCompetencyEntity {
  id: string;
  student_id: string;
  knowledge_unit_id: string; // ID exacto del nodo en Knowledge Vault (ej: 'speaking_expressing_opinions_b1')
  
  subject: string;
  domain: string;
  skill: SkillType | string;
  subskill?: string;
  
  estimated_level: CefrLevel | string;
  mastery_state: MasteryState;
  confidence: number;            // 0.0 a 1.0
  confidence_level: ConfidenceLevel;
  
  evidence_count: number;
  last_evidence_at?: string;
  source: CompetencySource;
  
  // Control y Autoridad Docente
  teacher_override: boolean;
  teacher_notes?: string;
  locked: boolean;
  
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

/**
 * Registro Inmutable de Evidencia de Aprendizaje
 */
export interface LearningEvidenceEntity {
  id: string;
  student_id: string;
  
  evidence_type: EvidenceType;
  skill: SkillType | string;
  knowledge_targets: string[];   // Nodos evaluados en la Bóveda Curricular
  learning_outcome?: string;
  assessment_id?: string;
  
  difficulty: number;            // 0.0 a 1.0
  score: number;                 // 0 a 100
  rubric_level?: RubricLevel;
  attempts_count: number;
  
  result_metadata?: Record<string, unknown>;
  created_at: string;
}

/**
 * Brecha Identificada por GapDetector
 */
export interface KnowledgeGap {
  knowledge_unit_id: string;
  title: string;
  skill: string;
  cefr: string;
  current_state: MasteryState;
  gap_type: GapType;
  priority_score: number;        // Puntuación calculada 0 - 100
  downstream_dependents_count: number;
  rationale: string;
}

/**
 * Elemento Priorizado por PriorityService
 */
export interface PriorityItem {
  rank: number;
  knowledge_unit_id: string;
  title: string;
  skill: string;
  cefr: string;
  gap_type: GapType;
  priority_score: number;
  urgency: 'high' | 'medium' | 'low';
  rationale: string;
}

/**
 * Recomendación de Próxima Acción de Aprendizaje (NextActionService)
 */
export interface NextActionRecommendation {
  student_id: string;
  action: NextActionType;
  adaptation_suggested: AdaptationType;
  target_knowledge_unit_id: string;
  target_knowledge_title: string;
  skill: string;
  current_state: MasteryState;
  rationale: string;
  confidence: number;
  bridge_guidance?: string;
}

/**
 * Agrupación Didáctica para el Aula (GroupingService)
 */
export interface GroupCluster {
  id: string;
  pedagogical_label: string;      // Neutral: ej. 'Focus Group: Clarification & Reasons', 'Core Discussion', 'Advanced Synthesis'
  suggested_adaptation: AdaptationType;
  student_ids: string[];
  primary_focus_unit_id: string;
  rationale: string;
}

/**
 * Contexto Académico Mínimo para Generación con IA (Privacy by Design)
 * ESTRICTAMENTE CERO DATOS PERSONALES IDENTIFICABLES (PII).
 */
export interface StudentAcademicContext {
  grade: string;
  skill: string;
  estimated_skill_level: string;
  target_level: string;
  adaptation_type: AdaptationType;
  
  strengths: string[];
  developing_points: string[];
  needs_support_points: string[];
  
  relevant_prerequisites_status: {
    prerequisite_id: string;
    state: MasteryState;
  }[];
  
  scaffolding_requirements?: string[];
  extension_requirements?: string[];
}

/**
 * DTO para Renderizado de Tablero o Dashboard Docente / Estudiante
 */
export interface StudentDashboardSummary {
  student_id: string;
  grade: string;
  overall_cefr: string;
  skills: {
    skill: string;
    cefr: string;
    confidence: number;
    status: string;
  }[];
  strengths: { id: string; title: string; skill: string }[];
  gaps: KnowledgeGap[];
  next_priorities: PriorityItem[];
  recent_evidence: {
    type: EvidenceType;
    skill: string;
    score: number;
    date: string;
  }[];
}
