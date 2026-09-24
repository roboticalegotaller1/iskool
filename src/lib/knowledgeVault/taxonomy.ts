/**
 * @file taxonomy.ts
 * @description Fuente única de verdad para la taxonomía centralizada de la Bóveda Curricular de Inglés.
 * Centraliza validaciones, listas blancas y reglas de consistencia para prevenir duplicación arbitraria.
 */

import {
  SchoolStage,
  CefrLevel,
  CambridgeAlignment,
  SkillType,
  DocumentStatus,
  DifficultyLevel,
  CurricularProgressionRole
} from './types';

export const VALID_CEFR_LEVELS: readonly CefrLevel[] = [
  'Foundation',
  'Pre-A1',
  'A1',
  'A2',
  'B1',
  'B2',
  'C1',
  'C2'
] as const;

export const VALID_SCHOOL_STAGES: readonly SchoolStage[] = [
  'preschool',
  'primary',
  'secondary',
  'high_school',
  'advanced'
] as const;

export const VALID_GRADES: readonly string[] = [
  'preschool',
  'preschool_1',
  'preschool_2',
  'preschool_3',
  'primary_1',
  'primary_2',
  'primary_3',
  'primary_4',
  'primary_5',
  'primary_6',
  'secondary_1',
  'secondary_2',
  'secondary_3',
  'high_school_1',
  'high_school_2',
  'high_school_3',
  'advanced_specialized'
] as const;

export const VALID_CAMBRIDGE_ALIGNMENTS: readonly CambridgeAlignment[] = [
  'Pre-A1 Starters',
  'A1 Movers',
  'A2 Flyers',
  'A2 Key',
  'B1 Preliminary',
  'B2 First',
  'C1 Advanced',
  'C2 Proficiency'
] as const;

export const VALID_SKILLS: readonly SkillType[] = [
  'listening',
  'speaking',
  'reading',
  'writing',
  'grammar',
  'vocabulary',
  'pronunciation'
] as const;

export const VALID_DOCUMENT_STATUSES: readonly DocumentStatus[] = [
  'draft',
  'review',
  'approved',
  'deprecated'
] as const;

export const VALID_DIFFICULTIES: readonly DifficultyLevel[] = [
  'beginner',
  'elementary',
  'pre_intermediate',
  'intermediate',
  'upper_intermediate',
  'advanced',
  'mastery'
] as const;

/**
 * Mapeo oficial de correspondencia esperada Grado ↔️ Nivel CEFR
 */
export const STAGE_CEFR_EXPECTED_MAP: Record<SchoolStage, CefrLevel[]> = {
  preschool: ['Foundation', 'Pre-A1'],
  primary: ['Pre-A1', 'A1', 'A2'],
  secondary: ['A2', 'B1'],
  high_school: ['B1', 'B2', 'C1'],
  advanced: ['C1', 'C2']
};

export const VALID_PROGRESSION_ROLES: readonly CurricularProgressionRole[] = [
  'introduce',
  'develop',
  'consolidate',
  'extend',
  'review',
  'mastery'
] as const;

/**
 * Validadores puros de taxonomía
 */
export class KnowledgeTaxonomy {
  static isCefrLevelValid(level: string): level is CefrLevel {
    return VALID_CEFR_LEVELS.includes(level as CefrLevel);
  }

  static isSchoolStageValid(stage: string): stage is SchoolStage {
    return VALID_SCHOOL_STAGES.includes(stage as SchoolStage);
  }

  static isGradeValid(grade: string): boolean {
    return VALID_GRADES.includes(grade);
  }

  static isSkillValid(skill: string): skill is SkillType {
    return VALID_SKILLS.includes(skill as SkillType);
  }

  static isStatusValid(status: string): status is DocumentStatus {
    return VALID_DOCUMENT_STATUSES.includes(status as DocumentStatus);
  }

  static isCambridgeAlignmentValid(alignment: string): alignment is CambridgeAlignment {
    return VALID_CAMBRIDGE_ALIGNMENTS.includes(alignment as CambridgeAlignment);
  }

  static isDifficultyValid(diff: string): diff is DifficultyLevel {
    return VALID_DIFFICULTIES.includes(diff as DifficultyLevel);
  }

  static isProgressionRoleValid(role: string): role is CurricularProgressionRole {
    return VALID_PROGRESSION_ROLES.includes(role as CurricularProgressionRole);
  }
}

