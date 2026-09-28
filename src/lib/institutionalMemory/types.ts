/**
 * @file types.ts
 * @description Definición de tipos, interfaces y esquemas Zod para la Memoria Institucional de iSkool.
 * Cumple estrictamente con la Regla de Privacidad Absoluta de Menores (Cero PII en Bóveda Curricular)
 * y Procedencia Institucional de Primera Clase.
 */

import { z } from 'zod';

export interface InstitutionalMemoryMetrics {
  students_evaluated_count: number;
  mastery_rate: number; // 0.0 a 1.0
  comprehension_friction_points: string[];
  average_session_duration_minutes?: number;
  completion_rate?: number; // 0.0 a 1.0
}

export interface InstitutionalMemoryProvenance {
  rails_activity_id: number | string;
  rails_assessment_batch_id?: number | string;
  captured_at: string; // ISO 8601 string
  ingestion_agent: string; // e.g. "iSkool-Memory-Worker/1.0"
  school_id?: string;
  checksum?: string;
}

export interface InstitutionalMemoryFrontmatter {
  type: 'institutional_memory';
  memory_version: string;
  institution_id: string;
  campus?: string;
  academic_cycle: string; // e.g. "2024-2025", "2025-2026"
  phase_nem?: string; // e.g. "fase_3", "fase_4", "fase_5", "fase_6"
  grade: number | string; // e.g. 4, "4to_grado", "1_secundaria"
  subject: string; // e.g. "matematicas", "lenguajes", "ciencias"
  topic: string; // e.g. "fracciones_equivalentes"
  activity_source?: string; // WikiLink e.g. "[[planeaciones/...]]"
  created_by_teacher_ref: string; // Pseudonymous teacher ID, e.g. "teacher_usr_123"
  author_display_name: string; // e.g. "Prof. Ana Martinez" (Docente titular institucional)
  adaptation_of?: string | null; // WikiLink to previous memory or null
  group_cohort: string; // e.g. "4A", "4B" (Solo identificador de cohorte/grupo, nunca alumnos)
  metrics: InstitutionalMemoryMetrics;
  provenance: InstitutionalMemoryProvenance;
  tags?: string[];
  [key: string]: unknown;
}

export const InstitutionalMemoryMetricsSchema = z.object({
  students_evaluated_count: z.number().int().min(1, 'El conteo de alumnos debe ser al menos 1'),
  mastery_rate: z.number().min(0).max(1, 'El índice de dominio debe estar entre 0.0 y 1.0'),
  comprehension_friction_points: z.array(z.string().trim()).default([]),
  average_session_duration_minutes: z.number().positive().optional(),
  completion_rate: z.number().min(0).max(1).optional()
});

export const InstitutionalMemoryProvenanceSchema = z.object({
  rails_activity_id: z.union([z.number(), z.string().trim()]),
  rails_assessment_batch_id: z.union([z.number(), z.string().trim()]).optional(),
  captured_at: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'captured_at debe ser una fecha ISO válida'
  }),
  ingestion_agent: z.string().trim().default('iSkool-Memory-Worker/1.0'),
  school_id: z.string().trim().optional(),
  checksum: z.string().trim().optional()
});

export const InstitutionalMemoryFrontmatterSchema = z.object({
  type: z.literal('institutional_memory'),
  memory_version: z.union([z.string(), z.number()]).transform(v => String(v)).default('1.0'),
  institution_id: z.string().trim().min(1, 'institution_id es obligatorio'),
  campus: z.string().trim().optional().default('Campus Central'),
  academic_cycle: z.string().trim().regex(/^\d{4}-\d{4}$/, 'academic_cycle debe tener formato AAAA-AAAA (ej. 2025-2026)'),
  phase_nem: z.string().trim().optional(),
  grade: z.union([z.number(), z.string().trim()]),
  subject: z.string().trim().min(1, 'subject es obligatorio'),
  topic: z.string().trim().min(1, 'topic es obligatorio'),
  activity_source: z.string().trim().optional(),
  created_by_teacher_ref: z.string().trim().min(1, 'created_by_teacher_ref es obligatorio'),
  author_display_name: z.string().trim().min(1, 'author_display_name es obligatorio'),
  adaptation_of: z.string().trim().nullable().optional(),
  group_cohort: z.string().trim().min(1, 'group_cohort es obligatorio (ej. 4A)'),
  metrics: InstitutionalMemoryMetricsSchema,
  provenance: InstitutionalMemoryProvenanceSchema,
  tags: z.array(z.string()).optional()
});

export interface InstitutionalMemorySections {
  contextoDiagnostico: string; // ## 📍 Contexto Pedagógico y Diagnóstico Inicial
  friccionesErrores: string[]; // ## ⚠️ Fricciones y Errores Conceptuales Frecuentes
  adaptacionesExitosas: string[]; // ## 💡 Adaptaciones e Intervenciones Exitosas
  recomendacionesProximoCiclo: string[]; // ## 🔮 Recomendaciones para el Próximo Ciclo Escolar
  procedenciaTrazabilidad: string; // ## 🔗 Procedencia y Trazabilidad Institucional
}

export interface InstitutionalMemoryDocument {
  id: string;
  filePath: string;
  relativePath: string;
  frontmatter: InstitutionalMemoryFrontmatter;
  sections: InstitutionalMemorySections;
  rawContent: string;
  wikiLinks: string[];
  createdAt: string;
}

export interface CreateInstitutionalMemoryInput {
  institution_id: string;
  campus?: string;
  academic_cycle: string;
  phase_nem?: string;
  grade: number | string;
  subject: string;
  topic: string;
  activity_source?: string;
  created_by_teacher_ref: string;
  author_display_name: string;
  adaptation_of?: string | null;
  group_cohort: string;
  metrics: InstitutionalMemoryMetrics;
  provenance: {
    rails_activity_id: number | string;
    rails_assessment_batch_id?: number | string;
    ingestion_agent?: string;
    school_id?: string;
  };
  sections: {
    contextoDiagnostico: string;
    friccionesErrores: string[];
    adaptacionesExitosas: string[];
    recomendacionesProximoCiclo: string[];
    procedenciaTrazabilidad?: string;
  };
  customFilename?: string;
}

export interface InstitutionalMemorySynthesis {
  topic: string;
  subject: string;
  grade: number | string;
  totalMemoriesFound: number;
  cyclesCovered: string[];
  averageMasteryRate: number;
  totalStudentsEvaluated: number;
  recurrentFrictionPoints: {
    friction: string;
    occurrences: number;
    cycles: string[];
  }[];
  provenInterventions: {
    intervention: string;
    reportedBy: string[];
    impactScore: number;
  }[];
  recommendationsForNextTeacher: string[];
  citedMemories: {
    cycle: string;
    cohort: string;
    teacher: string;
    activitySource?: string;
    wikiLink: string;
  }[];
}

export interface SaveMemoryResult {
  success: boolean;
  filePath: string;
  documentId: string;
  remoteGitSynced?: boolean;
  remoteGitCommit?: string;
  storageSynced?: boolean;
  syncWarning?: string;
}

