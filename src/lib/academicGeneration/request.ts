/**
 * @file request.ts
 * @description Objeto que representa y valida una solicitud académica de generación educativa.
 * Asegura que todos los parámetros existan dentro de la taxonomía oficial de iSchool y no acepta silenciosamente valores inválidos.
 */

import { KnowledgeTaxonomy, VALID_CEFR_LEVELS, VALID_GRADES, VALID_SKILLS } from '../knowledgeVault/taxonomy';
import { AcademicGenerationParams } from './types';
import { CefrLevel, SkillType } from '../knowledgeVault/types';

export class AcademicGenerationRequest {
  public readonly grade: string;
  public readonly cefr: CefrLevel;
  public readonly skill: SkillType;
  public readonly topic: string;
  public readonly language_function: string;
  public readonly activity_type: string;
  public readonly duration_minutes: number;
  public readonly adaptation: 'core' | 'support' | 'extension';
  public readonly extraParams: Record<string, unknown>;

  constructor(params: AcademicGenerationParams) {
    if (!params) {
      throw new Error('AcademicGenerationRequest: Parámetros de solicitud requeridos.');
    }

    // 1. Validar Grado Escolar
    if (!params.grade || typeof params.grade !== 'string') {
      throw new Error('AcademicGenerationRequest: El parámetro "grade" es obligatorio.');
    }
    const cleanGrade = params.grade.trim().toLowerCase();
    if (!KnowledgeTaxonomy.isGradeValid(cleanGrade)) {
      throw new Error(
        `AcademicGenerationRequest: Grado inválido "${params.grade}". Grados permitidos: ${VALID_GRADES.join(', ')}`
      );
    }
    this.grade = cleanGrade;

    // 2. Validar Nivel CEFR (no aceptar silenciosamente B7 ni valores espurios)
    if (!params.cefr || typeof params.cefr !== 'string') {
      throw new Error('AcademicGenerationRequest: El parámetro "cefr" es obligatorio.');
    }
    const rawCefr = params.cefr.trim();
    // Normalizar capitalización si corresponde (ej. b1 -> B1)
    const normalizedCefr = (rawCefr.length <= 3 ? rawCefr.toUpperCase() : rawCefr) as CefrLevel;
    if (!KnowledgeTaxonomy.isCefrLevelValid(normalizedCefr)) {
      throw new Error(
        `AcademicGenerationRequest: Nivel CEFR inválido "${params.cefr}". Niveles permitidos: ${VALID_CEFR_LEVELS.join(', ')}`
      );
    }
    this.cefr = normalizedCefr;

    // 3. Validar Habilidad Lingüística
    if (!params.skill || typeof params.skill !== 'string') {
      throw new Error('AcademicGenerationRequest: El parámetro "skill" es obligatorio.');
    }
    const cleanSkill = params.skill.trim().toLowerCase() as SkillType;
    if (!KnowledgeTaxonomy.isSkillValid(cleanSkill)) {
      throw new Error(
        `AcademicGenerationRequest: Habilidad inválida "${params.skill}". Habilidades permitidas: ${VALID_SKILLS.join(', ')}`
      );
    }
    this.skill = cleanSkill;

    // 4. Validar Tema Curricular
    if (!params.topic || typeof params.topic !== 'string' || params.topic.trim().length === 0) {
      throw new Error('AcademicGenerationRequest: El parámetro "topic" es obligatorio.');
    }
    this.topic = params.topic.trim();

    // 5. Validar Función de Lenguaje
    if (!params.language_function || typeof params.language_function !== 'string' || params.language_function.trim().length === 0) {
      throw new Error('AcademicGenerationRequest: El parámetro "language_function" es obligatorio.');
    }
    this.language_function = params.language_function.trim();

    // 6. Validar Duración en Minutos
    const duration = Number(params.duration_minutes);
    if (!duration || isNaN(duration) || duration <= 0) {
      throw new Error('AcademicGenerationRequest: "duration_minutes" debe ser un número entero positivo.');
    }
    this.duration_minutes = Math.round(duration);

    // 7. Tipo o Patrón de Actividad
    this.activity_type = (params.activity_type || 'guided_discussion').trim().toLowerCase();

    // 8. Modo de Adaptación Pedagógica (Fase 7)
    const validAdaptations = ['core', 'support', 'extension'];
    const rawAdaptation = (params.adaptation || 'core').toString().toLowerCase().trim();
    this.adaptation = (validAdaptations.includes(rawAdaptation) ? rawAdaptation : 'core') as 'core' | 'support' | 'extension';

    // Extraer parámetros adicionales
    const extra: Record<string, unknown> = {};
    const standardKeys = new Set(['grade', 'cefr', 'skill', 'topic', 'language_function', 'activity_type', 'duration_minutes', 'adaptation']);
    for (const [k, v] of Object.entries(params)) {
      if (!standardKeys.has(k)) {
        extra[k] = v;
      }
    }
    this.extraParams = extra;
  }

  /**
   * Método de factoría alternativo compatible con convenciones de estilo Ruby/Rails:
   * AcademicGenerationRequest.new(params)
   */
  static new(params: AcademicGenerationParams): AcademicGenerationRequest {
    return new AcademicGenerationRequest(params);
  }

  /**
   * Devuelve los parámetros sanitizados en forma de objeto plano.
   */
  toParams(): AcademicGenerationParams {
    return {
      grade: this.grade,
      cefr: this.cefr,
      skill: this.skill,
      topic: this.topic,
      language_function: this.language_function,
      activity_type: this.activity_type,
      duration_minutes: this.duration_minutes,
      adaptation: this.adaptation,
      ...this.extraParams
    };
  }
}
