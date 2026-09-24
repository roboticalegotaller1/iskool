/**
 * @file masteryEngine.ts
 * @description Motor de actualización prudente, acumulativa y continua de estados de maestría (Fase 7).
 * Procesa evidencias de aprendizaje formativas y sumativas, actualizando las micro-competencias
 * del estudiante sin saltos abruptos (Regla de Prudencia) y respetando la autoridad docente.
 */

import {
  StudentAcademicProfileEntity,
  StudentCompetencyEntity,
  LearningEvidenceEntity,
  MasteryState,
  ConfidenceLevel,
  SkillCompetencySummary
} from './types';
import { VALID_CEFR_LEVELS } from '../knowledgeVault/taxonomy';

export interface MasteryEngineResult {
  student_id: string;
  affected_skill: string;
  updated_competencies: StudentCompetencyEntity[];
  updated_profile: StudentAcademicProfileEntity;
  changes_summary: {
    knowledge_unit_id: string;
    previous_state: MasteryState;
    new_state: MasteryState;
    previous_confidence: number;
    new_confidence: number;
    reason: string;
  }[];
}

export class AdaptiveLearningMasteryEngine {
  /**
   * Orden ordinal CEFR para cálculo ponderado
   */
  private static cefrRank(cefr: string): number {
    const clean = cefr.replace('+', '').trim();
    const idx = VALID_CEFR_LEVELS.indexOf(clean as any);
    return idx >= 0 ? idx : 0;
  }

  /**
   * Determina el nivel de confianza textual según el valor numérico y cantidad de evidencias
   */
  public static calculateConfidenceLevel(confidence: number, count: number): ConfidenceLevel {
    if (count < 2 || confidence < 0.50) return 'low';
    if (count < 5 || confidence < 0.80) return 'medium';
    return 'strong';
  }

  /**
   * Procesa una nueva evidencia de aprendizaje y actualiza únicamente las competencias relacionadas.
   */
  static call(
    profile: StudentAcademicProfileEntity,
    competenciesMap: Map<string, StudentCompetencyEntity>,
    evidence: LearningEvidenceEntity
  ): MasteryEngineResult {
    const studentId = profile.student_id;
    const affectedSkill = (evidence.skill || (evidence as any).target_skill || (evidence as any).evidence_type?.includes('oral') ? 'speaking' : 'grammar').toLowerCase();
    const changes: MasteryEngineResult['changes_summary'] = [];
    const updatedCompetencies: StudentCompetencyEntity[] = [];

    // 1. Procesar cada knowledge_target evaluado en la evidencia (con fallback defensivo)
    const targets = Array.isArray(evidence.knowledge_targets)
      ? evidence.knowledge_targets
      : ((evidence as any).knowledge_unit_id ? [(evidence as any).knowledge_unit_id] : []);

    for (const unitId of targets) {
      let competency = competenciesMap.get(unitId);

      // Si no existía, inicializar en not_assessed
      if (!competency) {
        competency = {
          id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          student_id: studentId,
          knowledge_unit_id: unitId,
          subject: profile.subject || 'english',
          domain: 'Skills',
          skill: affectedSkill,
          estimated_level: profile.overall_estimated_level || 'A1',
          mastery_state: 'not_assessed',
          confidence: 0.10,
          confidence_level: 'low',
          evidence_count: 0,
          source: 'automatic',
          teacher_override: false,
          locked: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const prevState = competency.mastery_state;
      const prevConfidence = competency.confidence;

      // 2. Comprobar autoridad docente: Si está bloqueado o confirmado manualmente por el profesor, NO sobreescribir
      if (competency.locked || (competency.teacher_override && competency.source === 'teacher_confirmed')) {
        changes.push({
          knowledge_unit_id: unitId,
          previous_state: prevState,
          new_state: prevState,
          previous_confidence: prevConfidence,
          new_confidence: prevConfidence,
          reason: 'Bloqueado por confirmación o candado docente (Teacher Override).'
        });
        continue;
      }

      // 3. Evaluar desempeño de la evidencia
      const rawScore = evidence.score; // 0 - 100
      const difficulty = evidence.difficulty || 0.50; // 0.0 - 1.0
      const rubric = evidence.rubric_level;

      // Desempeño ponderado por dificultad
      // Si la tarea fue muy desafiante (diff 0.9), un 75 vale más que un 75 en tarea fácil (diff 0.2)
      const adjustedScore = Math.min(100, Math.max(0, rawScore * (0.8 + 0.4 * difficulty)));

      // 4. Aplicar Regla de Prudencia (Sin saltos bruscos)
      let targetState: MasteryState = prevState;
      let reason = '';

      if (adjustedScore >= 88 || rubric === 'mastered') {
        if (prevState === 'not_assessed' || prevState === 'introduced') {
          targetState = competency.evidence_count >= 1 ? 'secure' : 'developing';
          reason = 'Evidencia sobresaliente inicial.';
        } else if (prevState === 'developing') {
          targetState = 'secure';
          reason = 'Consolidación de desempeño favorable.';
        } else if (prevState === 'secure' || prevState === 'mastered') {
          targetState = 'mastered';
          reason = 'Desempeño consistente en nivel superior.';
        } else if (prevState === 'needs_review') {
          targetState = 'secure';
          reason = 'Recuperación exitosa tras revisión.';
        }
      } else if (adjustedScore >= 68 || rubric === 'secure') {
        if (prevState === 'not_assessed') {
          targetState = 'introduced';
          reason = 'Contacto inicial satisfactorio.';
        } else if (prevState === 'introduced' || prevState === 'needs_review') {
          targetState = 'developing';
          reason = 'Evidencia de progreso.';
        } else if (prevState === 'developing') {
          targetState = competency.evidence_count >= 2 ? 'secure' : 'developing';
          reason = 'Refuerzo continuo de la competencia.';
        } else if (prevState === 'mastered') {
          targetState = 'secure';
          reason = 'Ajuste prudente a nivel seguro.';
        }
      } else if (adjustedScore >= 45 || rubric === 'developing') {
        if (prevState === 'not_assessed') {
          targetState = 'introduced';
          reason = 'Exposición inicial con áreas de oportunidad.';
        } else if (prevState === 'mastered') {
          // REGLA DE PRUDENCIA: Un alumno en 'mastered' nunca cae a 'not_assessed' por un mal día
          targetState = 'secure';
          reason = 'Desempeño irregular aislado en contenido dominado.';
        } else if (prevState === 'secure') {
          targetState = 'developing';
          reason = 'Dificultad observada; requiere andamiaje.';
        } else {
          targetState = 'developing';
          reason = 'Muestra comprensión parcial.';
        }
      } else {
        // Desempeño bajo (< 45) o rubric 'not_met'
        if (prevState === 'mastered') {
          targetState = 'needs_review';
          reason = 'Desempeño inesperadamente bajo en competencia consolidada; marcado para revisión.';
        } else if (prevState === 'secure') {
          targetState = 'needs_review';
          reason = 'Falla reiterada; requiere revisión de conceptos.';
        } else if (prevState === 'developing') {
          targetState = 'needs_review';
          reason = 'Persistencia de dificultades; requiere apoyo focalizado.';
        } else {
          targetState = 'introduced';
          reason = 'Intento fallido inicial sin penalización punitiva.';
        }
      }

      // 5. Cálculo y acumulación de confianza
      const newEvidenceCount = competency.evidence_count + 1;
      // La confianza aumenta con la acumulación de evidencias
      const deltaConfidence = 0.20 / Math.sqrt(newEvidenceCount);
      const newConfidenceNum = Math.min(0.98, prevConfidence + deltaConfidence);
      const newConfidenceLevel = this.calculateConfidenceLevel(newConfidenceNum, newEvidenceCount);

      competency.mastery_state = targetState;
      competency.confidence = Number(newConfidenceNum.toFixed(2));
      competency.confidence_level = newConfidenceLevel;
      competency.evidence_count = newEvidenceCount;
      competency.last_evidence_at = evidence.created_at || new Date().toISOString();
      competency.updated_at = new Date().toISOString();

      changes.push({
        knowledge_unit_id: unitId,
        previous_state: prevState,
        new_state: targetState,
        previous_confidence: prevConfidence,
        new_confidence: competency.confidence,
        reason
      });

      competenciesMap.set(unitId, competency);
      updatedCompetencies.push(competency);
    }

    // 6. Recalcular resumen de habilidad en el StudentAcademicProfileEntity
    this.recalculateSkillSummary(profile, competenciesMap, affectedSkill);

    // 7. Recalcular nivel general
    this.recalculateOverallLevel(profile);

    profile.profile_version += 1;
    profile.last_updated_at = new Date().toISOString();

    return {
      student_id: studentId,
      affected_skill: affectedSkill,
      updated_competencies: updatedCompetencies,
      updated_profile: profile,
      changes_summary: changes
    };
  }

  /**
   * Recalcula el nivel CEFR y estado de una habilidad específica a partir de sus micro-competencias
   */
  private static recalculateSkillSummary(
    profile: StudentAcademicProfileEntity,
    competenciesMap: Map<string, StudentCompetencyEntity>,
    skillName: string
  ): void {
    const cleanSkill = skillName.toLowerCase();
    const skillComps: StudentCompetencyEntity[] = [];

    for (const comp of competenciesMap.values()) {
      if ((comp.skill || '').toLowerCase() === cleanSkill) {
        skillComps.push(comp);
      }
    }

    if (skillComps.length === 0) return;

    // Conteo por estados de maestría
    let masteredCount = 0;
    let secureCount = 0;
    let developingCount = 0;
    let reviewCount = 0;
    let totalConfidence = 0;
    let totalEvidence = 0;

    for (const c of skillComps) {
      if (c.mastery_state === 'mastered') masteredCount++;
      else if (c.mastery_state === 'secure') secureCount++;
      else if (c.mastery_state === 'developing') developingCount++;
      else if (c.mastery_state === 'needs_review') reviewCount++;

      totalConfidence += c.confidence;
      totalEvidence += c.evidence_count;
    }

    const totalComps = skillComps.length;
    const avgConfidence = totalConfidence / totalComps;

    // Diagnosticar status pedagógico de la habilidad
    let status: SkillCompetencySummary['status'] = 'on_track';
    if (reviewCount >= 2 || (developingCount / totalComps > 0.40)) {
      status = 'needs_support';
    } else if (masteredCount / totalComps > 0.60) {
      status = 'advanced';
    } else if (secureCount + masteredCount > developingCount) {
      status = 'progressing';
    }

    const summary: SkillCompetencySummary = {
      level: (profile as any)[cleanSkill]?.level || profile.overall_estimated_level || 'A1',
      confidence: Number(avgConfidence.toFixed(2)),
      confidence_level: this.calculateConfidenceLevel(avgConfidence, totalEvidence),
      evidence_count: totalEvidence,
      last_evaluated_at: new Date().toISOString(),
      status
    };

    // Asignar al slot correspondiente
    if (cleanSkill === 'reading') profile.reading = summary;
    else if (cleanSkill === 'listening') profile.listening = summary;
    else if (cleanSkill === 'speaking') profile.speaking = summary;
    else if (cleanSkill === 'writing') profile.writing = summary;
    else if (cleanSkill === 'grammar') profile.grammar = summary;
    else if (cleanSkill === 'vocabulary') profile.vocabulary = summary;
  }

  /**
   * Recalcula el nivel general estimado del estudiante a partir del balance de sus 6 habilidades
   */
  private static recalculateOverallLevel(profile: StudentAcademicProfileEntity): void {
    const skills = [
      profile.reading,
      profile.listening,
      profile.speaking,
      profile.writing,
      profile.grammar,
      profile.vocabulary
    ].filter(Boolean);

    if (skills.length === 0) return;

    let totalRanks = 0;
    for (const s of skills) {
      totalRanks += this.cefrRank(s.level);
    }
    const avgRank = Math.round(totalRanks / skills.length);
    profile.overall_estimated_level = VALID_CEFR_LEVELS[Math.min(avgRank, VALID_CEFR_LEVELS.length - 1)];
  }
}
