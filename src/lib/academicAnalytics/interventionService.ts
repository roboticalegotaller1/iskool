/**
 * @file interventionService.ts
 * @description Servicio de Registro y Evaluación de Intervenciones Pedagógicas (Ítems #48, #49 y #60).
 * Registra líneas base, estrategias de apoyo y calcula la comparativa Antes/Después,
 * señalando siempre el tamaño de muestra y las limitaciones observacionales.
 */

import { AcademicInterventionEntity } from './types';

export class AcademicAnalyticsInterventionService {
  /**
   * Registra el inicio de una intervención pedagógica con su línea base.
   */
  static registerIntervention(
    scopeType: 'student' | 'group' | 'grade',
    scopeId: string,
    targetKnowledgeId: string,
    strategy: string,
    baselineMastery: number,
    sampleSize: number
  ): AcademicInterventionEntity {
    return {
      id: `int_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      scope_type: scopeType,
      scope_id: scopeId,
      target_knowledge_id: targetKnowledgeId,
      strategy,
      start_date: new Date().toISOString().split('T')[0],
      baseline_mastery: baselineMastery,
      status: 'in_progress',
      sample_size_students: sampleSize,
      evaluation_limitations: `Muestra observada de ${sampleSize} alumnos. No se asume causalidad absoluta ni se aísla de factores externos.`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Evalúa la efectividad de una intervención comparando la línea base previa con la maestría posterior (Ítem #49).
   */
  static evaluateIntervention(
    intervention: AcademicInterventionEntity,
    postInterventionMastery: number
  ): {
    intervention_id: string;
    target_knowledge: string;
    baseline: number;
    post_intervention: number;
    delta_improvement: number;
    outcome_assessment: 'highly_effective' | 'moderate_progress' | 'inconclusive' | 'no_effect';
    summary_verdict: string;
    evaluation_limitations: string;
  } {
    const delta = Number((postInterventionMastery - intervention.baseline_mastery).toFixed(1));

    let outcome: 'highly_effective' | 'moderate_progress' | 'inconclusive' | 'no_effect' = 'moderate_progress';
    if (delta >= 25) outcome = 'highly_effective';
    else if (delta >= 10) outcome = 'moderate_progress';
    else if (delta > 0) outcome = 'inconclusive';
    else outcome = 'no_effect';

    const verdict = outcome === 'highly_effective'
      ? `Intervención Altamente Efectiva: La maestría en "${intervention.target_knowledge_id}" se incrementó en +${delta}% ` +
        `(${intervention.baseline_mastery}% -> ${postInterventionMastery}%), superando con creces la meta esperada en el grupo de ${intervention.sample_size_students} alumnos.`
      : outcome === 'moderate_progress'
      ? `Progreso Favorable: La intervención produjo un avance de +${delta}% sobre la línea base previa.`
      : `Efecto Inconcluso: La variación observada (+${delta}%) no supera el margen de fluctuación estándar.`;

    return {
      intervention_id: intervention.id,
      target_knowledge: intervention.target_knowledge_id,
      baseline: intervention.baseline_mastery,
      post_intervention: postInterventionMastery,
      delta_improvement: delta,
      outcome_assessment: outcome,
      summary_verdict: verdict,
      evaluation_limitations: intervention.evaluation_limitations
    };
  }
}
