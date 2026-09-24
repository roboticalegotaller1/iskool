/**
 * @file types.ts
 * @description Definición de tipos de datos, interfaces y contratos para el Knowledge Vault de iSchool.
 */

export type SchoolStage = 'preschool' | 'primary' | 'secondary' | 'high_school' | 'advanced';

export type CefrLevel = 
  | 'Foundation' 
  | 'Pre-A1' 
  | 'A1' 
  | 'A2' 
  | 'B1' 
  | 'B2' 
  | 'C1' 
  | 'C2';

export type CambridgeAlignment = 
  | 'Pre-A1 Starters'
  | 'A1 Movers'
  | 'A2 Flyers'
  | 'A2 Key'
  | 'B1 Preliminary'
  | 'B2 First'
  | 'C1 Advanced'
  | 'C2 Proficiency';

export type DelfAlignment = 
  | 'DELF Prim A1.1'
  | 'DELF Prim A1'
  | 'DELF Prim A2'
  | 'DELF Junior A1'
  | 'DELF Junior A2'
  | 'DELF Junior B1'
  | 'DELF Junior B2'
  | 'DELF Tout Public A1'
  | 'DELF Tout Public A2'
  | 'DELF Tout Public B1'
  | 'DELF Tout Public B2'
  | 'DALF C1'
  | 'DALF C2';

export type CenniAlignment = string;

export type SkillType = 
  | 'listening' 
  | 'speaking' 
  | 'reading' 
  | 'writing' 
  | 'grammar' 
  | 'vocabulary' 
  | 'pronunciation';

export type DocumentStatus = 'draft' | 'review' | 'approved' | 'deprecated';

export type DifficultyLevel = 
  | 'beginner' 
  | 'elementary' 
  | 'pre_intermediate' 
  | 'intermediate' 
  | 'upper_intermediate' 
  | 'advanced' 
  | 'mastery';

export type CurricularProgressionRole = 
  | 'introduce' 
  | 'develop' 
  | 'consolidate' 
  | 'extend' 
  | 'review' 
  | 'mastery';

export interface GradeProgressionItem {
  role: CurricularProgressionRole;
  notes?: string;
}

export interface KnowledgeFrontmatter {
  id: string;
  title: string;
  type: string;
  school_stage: SchoolStage[];
  grades: string[];
  age_band?: string[];
  cefr: CefrLevel[];
  cambridge_alignment?: CambridgeAlignment[];
  delf_alignment?: DelfAlignment[];
  cenni_alignment?: CenniAlignment[];
  language?: 'english' | 'french' | string;
  skills: SkillType[];
  subskills?: string[];
  language_functions?: string[];
  grammar?: string[];
  vocabulary?: string[];
  topics?: string[];
  pedagogy?: string[];
  activity_patterns?: string[];
  difficulty?: DifficultyLevel;
  duration_minutes?: number;
  assessment?: string[];

  // Campos del Grafo Académico (Fase 4)
  prerequisites?: string[];
  builds_on?: string[];
  extends?: string[];
  related_to?: string[];
  assessed_by?: string[];
  grade_progression?: Record<string, GradeProgressionItem | string>;
  learning_outcomes?: string[];
  assessment_evidence?: string[];
  aliases?: string[];

  source_ids: string[];
  source_notes?: string;
  status: DocumentStatus;
  version: number;
  [key: string]: unknown;
}

export interface ParsedKnowledgeDocument {
  documentId: string;
  filePath: string;
  relativePath: string;
  title: string;
  type: string;
  frontmatter: KnowledgeFrontmatter;
  rawContent: string;
  markdownBody: string;
  checksum: string;
  wikiLinks: string[];
  lastModifiedMs: number;
}

export interface ValidationErrorItem {
  field?: string;
  message: string;
  value?: unknown;
}

export interface DocumentValidationResult {
  valid: boolean;
  filePath: string;
  documentId?: string;
  errors: ValidationErrorItem[];
  warnings: string[];
}

export interface KnowledgeVaultValidationReport {
  totalFiles: number;
  validFiles: number;
  invalidFiles: number;
  results: DocumentValidationResult[];
}

export interface SyncOperationReport {
  createdCount: number;
  updatedCount: number;
  unchangedCount: number;
  deprecatedCount: number;
  errorCount: number;
  details: {
    documentId: string;
    filePath: string;
    action: 'created' | 'updated' | 'unchanged' | 'deprecated' | 'error';
    reason?: string;
  }[];
}

export interface KnowledgeVaultStats {
  totalDocuments: number;
  byStage: Record<string, number>;
  byGrade: Record<string, number>;
  byCefr: Record<string, number>;
  bySkill: Record<string, number>;
  byStatus: Record<DocumentStatus, number>;
  byCambridge: Record<string, number>;
  missingCurricularGaps: {
    stage: string;
    cefr: string;
    description: string;
  }[];
}

export interface KnowledgeQueryFilter {
  grade?: string | string[];
  cefr?: CefrLevel | CefrLevel[];
  skill?: SkillType | SkillType[];
  subskill?: string | string[];
  topic?: string | string[];
  difficulty?: DifficultyLevel | DifficultyLevel[];
  schoolStage?: SchoolStage | SchoolStage[];
  school_stage?: SchoolStage | SchoolStage[];
  languageFunction?: string | string[];
  language_function?: string | string[];
  status?: DocumentStatus | DocumentStatus[]; // Si no se especifica, por defecto filtra exclusivamente 'approved'
  includeDrafts?: boolean;
}
