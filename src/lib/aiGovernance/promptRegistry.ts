/**
 * @file promptRegistry.ts
 * @description Registro Central y Versionado Canónico de Prompts (AI::PromptRegistry / Ítems #18 y #19).
 * Elimina las cadenas anónimas dispersas en el código, asegurando inmutabilidad, trazabilidad y control de versiones.
 */

import { RegisteredPromptEntity } from './types';

export class AIPromptRegistry {
  private static prompts = new Map<string, RegisteredPromptEntity>();

  static {
    // Inicialización del catálogo canónico de prompts del sistema
    this.register({
      prompt_id: 'iskool_academic_activity_generator',
      version: 'v1.0.0',
      feature: 'academic_generation',
      description: 'Generación de actividades y lecciones alineadas a la Bóveda Curricular',
      expected_schema_name: 'ActivityPlanSchema',
      system_instructions: 'Usted es el Motor de Inteligencia Artificial Pedagógica de iSchool. Genere secuencias didácticas basadas en el currículo oficial.',
      updated_at: '2026-09-24T00:00:00Z'
    });

    this.register({
      prompt_id: 'iskool_tutor_conversation_system',
      version: 'v1.0.0',
      feature: 'ai_tutor',
      description: 'Sistema conversacional socrático para el Tutor de IA adaptativo',
      expected_schema_name: 'TutorResponseSchema',
      system_instructions: 'Actúe como tutor pedagógico interactivo de inglés. Use la escalera de pistas y nunca dé la respuesta directa de inmediato.',
      updated_at: '2026-09-24T00:00:00Z'
    });

    this.register({
      prompt_id: 'iskool_teacher_copilot_system',
      version: 'v1.0.0',
      feature: 'teacher_copilot',
      description: 'Asistente de planeación, agrupación y diferenciación para docentes',
      expected_schema_name: 'TeacherCopilotResponseSchema',
      system_instructions: 'Asista al profesor en la preparación de clases con enfoque determinista y generación de artefactos en borrador.',
      updated_at: '2026-09-24T00:00:00Z'
    });

    this.register({
      prompt_id: 'iskool_coordinator_copilot_system',
      version: 'v1.0.0',
      feature: 'coordinator_copilot',
      description: 'Asistente directivo con principio Explain-Why fundamentado en métricas deterministas',
      expected_schema_name: 'CoordinatorCopilotResponseSchema',
      system_instructions: 'Explique tendencias académicas, cuellos de botella y brechas curriculares a coordinadores sin juzgar docentes.',
      updated_at: '2026-09-24T00:00:00Z'
    });

    this.register({
      prompt_id: 'iskool_analytics_insight_system',
      version: 'v1.0.0',
      feature: 'insight_service',
      description: 'Traducción de métricas numéricas ya calculadas a síntesis cualitativa',
      expected_schema_name: 'InsightSummarySchema',
      system_instructions: 'Sintetice métricas estructuradas en texto comprensible. Prohibido inventar o calcular números.',
      updated_at: '2026-09-24T00:00:00Z'
    });
  }

  /**
   * Registra un prompt en el catálogo.
   */
  static register(prompt: RegisteredPromptEntity): void {
    const key = `${prompt.prompt_id}:${prompt.version}`;
    this.prompts.set(key, prompt);
  }

  /**
   * Obtiene un prompt específico por su identificador y versión.
   */
  static get(promptId: string, version: string = 'v1.0.0'): RegisteredPromptEntity | undefined {
    return this.prompts.get(`${promptId}:${version}`);
  }

  /**
   * Lista todos los prompts registrados.
   */
  static listAll(): RegisteredPromptEntity[] {
    return Array.from(this.prompts.values());
  }
}
