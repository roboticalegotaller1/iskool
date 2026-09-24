/**
 * @file assessmentBlueprintService.ts
 * @description Servicio de diseño y especificación técnica de Blueprints de Evaluación (Assessment Blueprint).
 * Asegura que ninguna evaluación o examen se genere arbitrariamente sin una matriz previa de especificaciones,
 * ponderación por habilidades, rúbricas vinculadas y evidencias observables.
 */

import { UnitEntity, AssessmentEntity, AssessmentBlueprintData, AssessmentType } from './types';

export class AssessmentBlueprintService {
  /**
   * Construye un AssessmentBlueprint equilibrado para una unidad curricular dada.
   */
  static createUnitBlueprint(
    unit: UnitEntity,
    options: {
      type?: AssessmentType;
      weekScheduled?: number;
      customWeights?: Record<string, number>;
      rubricId?: string;
    } = {}
  ): AssessmentEntity {
    const assessmentType = options.type || 'formative';
    const weekScheduled = options.weekScheduled || (unit.position * unit.duration_weeks);
    
    // Ponderación estándar equilibrada por macro-habilidades o personalizada
    const defaultWeights: Record<string, number> = {
      reading: 30,
      writing: 25,
      speaking: 25,
      listening: 20
    };
    
    const weights = options.customWeights || defaultWeights;
    const rubricId = options.rubricId || 'rubric_writing_b1_b2';

    // Generar especificaciones de ítems basadas en los knowledge targets de la unidad
    const itemSpecifications = [
      {
        section_name: 'Part 1: Receptive Academic Reading Comprehension',
        skill: 'reading',
        weight_percent: weights.reading || 30,
        format: 'multiple_choice_and_inference_matrix',
        learning_outcomes: unit.learning_outcomes.slice(0, 1),
        knowledge_targets: unit.knowledge_targets.filter(k => k.toLowerCase().includes('reading'))
      },
      {
        section_name: 'Part 2: Collaborative Argumentation & Speaking Defense',
        skill: 'speaking',
        weight_percent: weights.speaking || 25,
        format: 'structured_paired_simulation_and_debate',
        learning_outcomes: unit.learning_outcomes.slice(1, 2),
        knowledge_targets: unit.knowledge_targets.filter(k => k.toLowerCase().includes('speaking'))
      },
      {
        section_name: 'Part 3: Formal Discursive Essay / Policy Brief',
        skill: 'writing',
        weight_percent: weights.writing || 25,
        format: 'four_paragraph_discursive_composition',
        learning_outcomes: unit.learning_outcomes.slice(2, 3),
        knowledge_targets: unit.knowledge_targets.filter(k => k.toLowerCase().includes('writing'))
      },
      {
        section_name: 'Part 4: Listening for Attitudinal Nuance & Tone',
        skill: 'listening',
        weight_percent: weights.listening || 20,
        format: 'audio_gist_and_detail_completion',
        learning_outcomes: unit.learning_outcomes.slice(3, 4),
        knowledge_targets: unit.knowledge_targets.filter(k => k.toLowerCase().includes('listening'))
      }
    ];

    const blueprintData: AssessmentBlueprintData = {
      skill_weights: weights,
      target_cefr: 'B1_plus_to_B2',
      evidence_types: [
        'Ensayos argumentativos analizados con rúbrica analítica',
        'Grabaciones de debate evaluadas en turn-taking y fluidez',
        'Matrices de inferencia y extracción de ideas centrales'
      ],
      rubric_id: rubricId,
      item_specifications: itemSpecifications
    };

    return {
      id: `assessment_${unit.id}`,
      course_id: unit.course_id,
      unit_id: unit.id,
      title: `Assessment Blueprint: Unit ${unit.position} — ${unit.title}`,
      assessment_type: assessmentType,
      week_scheduled: weekScheduled,
      blueprint: blueprintData,
      rubric_id: rubricId,
      learning_outcomes: unit.learning_outcomes,
      knowledge_targets: unit.knowledge_targets,
      status: 'approved',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
}
