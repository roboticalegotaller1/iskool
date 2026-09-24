/**
 * @file activitySlotBridge.ts
 * @description Puente de conexión determinista entre una Ranura de Actividad (Activity Slot) y el Motor de IA Pedagógica.
 * Hereda estrictamente los parámetros didácticos desde Course -> Unit -> Lesson -> Slot sin permitir alucinaciones.
 */

import { CourseEntity, UnitEntity, LessonEntity, ActivitySlotEntity } from './types';
import { AcademicGenerationGenerator } from '../academicGeneration/generator';
import { AcademicGenerationParams, AcademicActivityOutput } from '../academicGeneration/types';

export interface SlotGenerationResult {
  slot: ActivitySlotEntity;
  activity: AcademicActivityOutput;
  traceabilityId: string;
  generationLog: string;
}

export class ActivitySlotBridge {
  /**
   * Genera el contenido concreto para un Activity Slot específico utilizando AcademicGeneration.
   */
  static async generateSlotContent(
    course: CourseEntity,
    unit: UnitEntity,
    lesson: LessonEntity,
    slot: ActivitySlotEntity
  ): Promise<SlotGenerationResult> {
    // 1. Determinar habilidad principal de la lección / slot
    let primarySkill = 'speaking';
    const titleLower = lesson.title.toLowerCase();
    if (titleLower.includes('writing')) primarySkill = 'writing';
    else if (titleLower.includes('reading')) primarySkill = 'reading';
    else if (titleLower.includes('listening')) primarySkill = 'listening';

    // 2. Determinar función lingüística principal
    const langFunction = unit.language_functions[0] || 'expressing_opinions';

    // 3. Preparar parámetros tipados y cerrados (sin margen para reinvención de metas)
    const generationParams: AcademicGenerationParams = {
      grade: course.grade,
      cefr: course.entry_cefr,
      skill: primarySkill,
      topic: unit.theme,
      language_function: langFunction,
      activity_type: slot.activity_pattern || 'guided_discussion',
      duration_minutes: lesson.duration_minutes || 50,
      learning_outcome: lesson.primary_learning_outcome,
      course_id: course.id,
      unit_id: unit.id,
      lesson_id: lesson.id,
      slot_id: slot.id
    };

    // 4. Invocar el generador canónico conectado a la Bóveda Curricular
    const generationResult = await AcademicGenerationGenerator.call(generationParams);

    // 5. Actualizar el slot con la actividad generada
    slot.generated_activity_id = generationResult.traceability.generation_id;
    slot.generated_payload = generationResult.activity || undefined;
    slot.status = 'generated';
    slot.updated_at = new Date().toISOString();

    return {
      slot,
      activity: generationResult.activity!,
      traceabilityId: generationResult.traceability.generation_id,
      generationLog: `[ActivitySlotBridge] Slot "${slot.id}" generado exitosamente bajo el estándar ${course.entry_cefr} para "${lesson.title}".`
    };
  }
}
