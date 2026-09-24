/**
 * @file metricService.ts
 * @description Servicio de Fórmulas Matemáticas y Métricas Pedagógicas Deterministas (Ítems #3 y #43).
 * Todas las operaciones cuantitativas (porcentajes, promedios, tasas de maestría y brechas) se calculan
 * con precisión aritmética estricta en código local/base de datos, sin intervención de modelos de lenguaje.
 */

import {
  KnowledgeMasteryRate,
  SkillMasteryMetric,
  MetricConfidence,
  InstructionMasteryGapReport,
  LearningVelocityMetric
} from './types';
import { StudentCompetencyEntity, LearningEvidenceEntity, StudentAcademicProfileEntity } from '../adaptiveLearning/types';
import { SkillType } from '../knowledgeVault/types';

export class AcademicAnalyticsMetricService {
  /**
   * Evalúa el nivel de confianza de una métrica en función del volumen y diversidad de evidencias (Ítem #8).
   */
  static evaluateConfidence(evidenceCount: number, distinctSourcesCount: number = 1): MetricConfidence {
    if (evidenceCount >= 5 && distinctSourcesCount >= 2) {
      return {
        rating: 'high',
        evidence_count: evidenceCount,
        distinct_sources_count: distinctSourcesCount,
        is_provisional: false,
        rationale: 'Métrica consolidada con volumen suficiente y triangulación de fuentes diversas.'
      };
    }

    if (evidenceCount >= 2) {
      return {
        rating: 'medium',
        evidence_count: evidenceCount,
        distinct_sources_count: distinctSourcesCount,
        is_provisional: false,
        rationale: 'Métrica en desarrollo basada en múltiples observaciones directas.'
      };
    }

    return {
      rating: 'low',
      evidence_count: evidenceCount,
      distinct_sources_count: distinctSourcesCount,
      is_provisional: true,
      rationale: 'Advertencia: Métrica provisional sustentada en evidencia limitada (<= 1 registro).'
    };
  }

  /**
   * Calcula la Tasa de Maestría de Conocimiento Granular (KMR) para un nodo curricular dado (Ítem #10).
   */
  static calculateKnowledgeMasteryRate(
    knowledgeUnitId: string,
    title: string,
    cefr: string,
    skill: string,
    competenciesList: StudentCompetencyEntity[]
  ): KnowledgeMasteryRate {
    const relevantComps = competenciesList.filter(c => c.knowledge_unit_id === knowledgeUnitId);
    const totalAssessed = relevantComps.length;

    if (totalAssessed === 0) {
      return {
        knowledge_unit_id: knowledgeUnitId,
        title,
        cefr,
        skill,
        total_students_assessed: 0,
        secure_or_mastered_count: 0,
        developing_count: 0,
        needs_support_count: 0,
        mastery_percentage: 0,
        confidence: this.evaluateConfidence(0, 0)
      };
    }

    let secureOrMastered = 0;
    let developing = 0;
    let needsSupport = 0;
    let totalEvidencePoints = 0;

    for (const c of relevantComps) {
      totalEvidencePoints += c.evidence_count || 1;
      if (c.mastery_state === 'secure' || c.mastery_state === 'mastered') {
        secureOrMastered++;
      } else if (c.mastery_state === 'developing') {
        developing++;
      } else {
        needsSupport++;
      }
    }

    const masteryPercent = Math.round((secureOrMastered / totalAssessed) * 100);
    const confidence = this.evaluateConfidence(totalEvidencePoints, 2);

    return {
      knowledge_unit_id: knowledgeUnitId,
      title,
      cefr,
      skill,
      total_students_assessed: totalAssessed,
      secure_or_mastered_count: secureOrMastered,
      developing_count: developing,
      needs_support_count: needsSupport,
      mastery_percentage: masteryPercent,
      confidence
    };
  }

  /**
   * Calcula la maestría agregada para una macro-habilidad (Reading, Speaking, Writing, etc.).
   */
  static calculateSkillMastery(
    skill: SkillType | string,
    profiles: StudentAcademicProfileEntity[],
    evidences: LearningEvidenceEntity[]
  ): SkillMasteryMetric {
    const skillEvidences = evidences.filter(e => e.skill.toLowerCase() === skill.toLowerCase());
    const totalEvidences = skillEvidences.length;

    let scoreSum = 0;
    let count = 0;

    if (skillEvidences.length > 0) {
      for (const e of skillEvidences) {
        scoreSum += e.score;
        count++;
      }
    } else if (profiles.length > 0) {
      // Fallback a perfiles si no hay evidencias crudas en memoria
      for (const p of profiles) {
        const sk = (p as any)[skill.toLowerCase()];
        if (sk) {
          const baseScore = sk.level === 'B2' ? 85 : sk.level === 'B1' ? 75 : sk.level === 'A2' ? 50 : 35;
          scoreSum += baseScore;
          count++;
        }
      }
    }

    const avgScore = count > 0 ? Math.round(scoreSum / count) : 50;

    let cefrEq = 'B1';
    let status: SkillMasteryMetric['status'] = 'on_target';

    if (avgScore >= 80) {
      cefrEq = 'B2';
      status = 'strong';
    } else if (avgScore >= 65) {
      cefrEq = 'B1';
      status = 'on_target';
    } else if (avgScore >= 50) {
      cefrEq = 'A2+';
      status = 'developing';
    } else {
      cefrEq = 'A2';
      status = 'critical_attention';
    }

    const confidence = this.evaluateConfidence(totalEvidences || count, 2);

    return {
      skill,
      mastery_percentage: avgScore,
      cefr_equivalent: cefrEq,
      evidence_volume: totalEvidences || count,
      confidence,
      status
    };
  }

  /**
   * Diagnostica la Brecha Instrucción-Maestría (Instruction-Mastery Gap) (Ítems #19 y #20).
   */
  static calculateInstructionMasteryGap(
    courseId: string,
    courseTitle: string,
    taughtPercentage: number,
    masteredPercentage: number,
    divergentTargets: InstructionMasteryGapReport['divergent_targets'] = []
  ): InstructionMasteryGapReport {
    const gap = Math.round(taughtPercentage - masteredPercentage);
    const isDivergent = gap > 25;

    let signal = `El curso muestra una alineación pedagógica saludable (Brecha de ${gap}%).`;
    if (isDivergent) {
      signal = `Alerta de Divergencia Didáctica: El contenido impartido (${taughtPercentage}%) supera ampliamente ` +
        `la maestría consolidada del grupo (${masteredPercentage}%), generando una brecha crítica de ${gap} puntos porcentuales. ` +
        `Se recomienda desacelerar el ritmo del calendario y programar sesiones de consolidación.`;
    }

    return {
      course_id: courseId,
      course_title: courseTitle,
      curriculum_coverage_percent: taughtPercentage,
      student_mastery_percent: masteredPercentage,
      gap_percentage: gap,
      is_divergent: isDivergent,
      divergent_targets: divergentTargets,
      pedagogical_signal: signal
    };
  }

  /**
   * Calcula la velocidad de aprendizaje ponderada sin estigmatizar al estudiante (Ítem #7).
   */
  static calculateLearningVelocity(
    studentId: string,
    competenciesList: StudentCompetencyEntity[],
    periodWeeks: number = 8
  ): LearningVelocityMetric {
    const studentComps = competenciesList.filter(c => c.student_id === studentId);
    const securedUnits = studentComps.filter(c => c.mastery_state === 'secure' || c.mastery_state === 'mastered').length;
    const totalTargeted = studentComps.length || 1;

    const ratePerWeek = Number((securedUnits / Math.max(1, periodWeeks)).toFixed(2));
    const confidence = this.evaluateConfidence(securedUnits * 2, 2);

    return {
      units_secured_in_period: securedUnits,
      total_units_targeted: totalTargeted,
      acquisition_rate: ratePerWeek,
      opportunity_context: `Calculado sobre un ciclo de ${periodWeeks} semanas lectivas de exposición curricular activa.`,
      confidence
    };
  }
}
