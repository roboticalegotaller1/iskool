/**
 * @file evalDataset.ts
 * @description Conjunto de Evaluación Dorada (Golden Dataset) y Evaluador Automático de Regresión (Ítems #42, #43, #44, #46 y #47).
 * Permite someter cualquier cambio de prompt o modelo a pruebas de regresión contra casos canónicos de referencia,
 * verificando validez de esquema, adecuación al nivel CEFR, presencia de elementos pedagógicos y ausencia de alucinaciones.
 */

import { GoldenEvaluationCase } from './types';

export class AIEvalDataset {
  /**
   * Catálogo de Casos Dorados Canónicos del Ecosistema iSchool.
   */
  public static readonly GOLDEN_CASES: GoldenEvaluationCase[] = [
    {
      id: 'eval_case_hs1_speaking_debate',
      feature: 'academic_generation',
      grade: 'high_school_1',
      cefr: 'B1',
      skill: 'speaking',
      prompt_input: 'Generate a 50-minute communicative lesson for B1 students focusing on expressing polite opinions and asking for clarification.',
      required_elements: [
        'learning_objective',
        'activities',
        'clarification',
        'pair_work'
      ],
      forbidden_elements: [
        'preschool_activities',
        'c2_vocabulary',
        'undefined_slots'
      ],
      max_acceptable_latency_ms: 6000
    },
    {
      id: 'eval_case_sec2_writing_email',
      feature: 'academic_generation',
      grade: 'secondary_2',
      cefr: 'A2+',
      skill: 'writing',
      prompt_input: 'Create an activity for writing an informal email inviting a friend to a weekend celebration.',
      required_elements: [
        'informal_greeting',
        'date_and_time',
        'closing_formula'
      ],
      forbidden_elements: [
        'academic_dissertation',
        'legal_contracts'
      ],
      max_acceptable_latency_ms: 5000
    },
    {
      id: 'eval_case_analytics_grounding_no_invented_math',
      feature: 'insight_service',
      grade: 'high_school_1',
      cefr: 'B1',
      skill: 'speaking',
      prompt_input: 'Explain group mastery where Reading is 79% and Speaking is 54% due to clarification bottleneck (42%).',
      required_elements: [
        '79%',
        '54%',
        '42%',
        'clarification'
      ],
      forbidden_elements: [
        '88%', // Número no suministrado en la entrada
        '95%'  // Alucinación numérica
      ],
      max_acceptable_latency_ms: 3000
    }
  ];

  /**
   * Ejecuta la evaluación automática de una salida de IA frente a un caso dorado.
   */
  static evaluateOutput(
    caseId: string,
    output: Record<string, any> | string,
    latencyMs: number
  ): { passed: boolean; score: number; failures: string[] } {
    const goldCase = this.GOLDEN_CASES.find(c => c.id === caseId);
    if (!goldCase) {
      throw new Error(`Caso de evaluación ${caseId} no encontrado en el Golden Dataset.`);
    }

    const failures: string[] = [];
    const textToAnalyze = typeof output === 'string' ? output.toLowerCase() : JSON.stringify(output).toLowerCase();

    // 1. Verificación de Elementos Requeridos
    for (const req of goldCase.required_elements) {
      if (!textToAnalyze.includes(req.toLowerCase())) {
        failures.push(`Falta elemento requerido: "${req}"`);
      }
    }

    // 2. Verificación de Ausencia de Elementos Prohibidos
    for (const forb of goldCase.forbidden_elements) {
      if (textToAnalyze.includes(forb.toLowerCase())) {
        failures.push(`Contiene elemento prohibido o alucinación: "${forb}"`);
      }
    }

    // 3. Verificación de Latencia Máxima
    if (latencyMs > goldCase.max_acceptable_latency_ms) {
      failures.push(`Latencia excedida (${latencyMs}ms > ${goldCase.max_acceptable_latency_ms}ms)`);
    }

    const totalChecks = goldCase.required_elements.length + goldCase.forbidden_elements.length + 1;
    const passedChecks = totalChecks - failures.length;
    const score = Math.max(0, Math.round((passedChecks / totalChecks) * 100));

    return {
      passed: failures.length === 0,
      score,
      failures
    };
  }
}
