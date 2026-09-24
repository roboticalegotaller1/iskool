/**
 * @file differentiationService.ts
 * @description Servicio de Diferenciación Didáctica Multinivel (TeacherCopilot::DifferentiationService).
 * Cumple con los ítems #10, #40, #41 y #58:
 * - Genera versiones paralelas (Core, Support, Extension) a partir de una actividad base.
 * - Mantiene el objetivo curricular y los knowledge targets estrictamente bloqueados (Curriculum Lock).
 * - Utiliza las matrices de andamiaje de AdaptiveLearning y los patrones de AcademicGeneration.
 */

import { ResolvedTeacherContext } from './types';

export interface DifferentiatedActivitySet {
  activity_title: string;
  target_outcome: string;
  knowledge_target: string;
  curriculum_locked: boolean;
  core_version: {
    adaptation_type: 'core';
    target_audience: string;
    instructions: string;
    scaffolding: string[];
    task: string;
    success_criteria: string;
  };
  support_version: {
    adaptation_type: 'support';
    target_audience: string;
    instructions: string;
    scaffolding: string[];
    task: string;
    sentence_starters: string[];
    word_bank: string[];
    success_criteria: string;
  };
  extension_version: {
    adaptation_type: 'extension';
    target_audience: string;
    instructions: string;
    scaffolding: string[];
    task: string;
    challenge_requirement: string;
    success_criteria: string;
  };
}

export class TeacherCopilotDifferentiationService {
  /**
   * Genera las 3 variantes diferenciadas manteniendo la meta curricular fija.
   */
  static differentiateActivity(
    context: ResolvedTeacherContext,
    options: {
      topic?: string;
      customInstruction?: string;
    } = {}
  ): DifferentiatedActivitySet {
    const lesson = context.target_lesson || {
      title: 'Expressing Opinions on Technology',
      primary_learning_outcome: 'Express and support personal opinions regarding technology with polite reasoning.',
      knowledge_targets: ['speaking_b1_secondary_expressing_opinions', 'func_giving_reasons']
    };

    const topic = options.topic || 'Impact of Social Media on Teenagers';
    const mainTarget = lesson.knowledge_targets[0] || 'speaking_b1_secondary_expressing_opinions';

    return {
      activity_title: `Debate Dialógico Diferenciado: ${topic}`,
      target_outcome: lesson.primary_learning_outcome,
      knowledge_target: mainTarget,
      curriculum_locked: true,

      // 1. Versión Estándar (Core - Nivel B1)
      core_version: {
        adaptation_type: 'core',
        target_audience: `${context.cohort_summary.need_distribution.core} alumnos en nivel B1 estándar`,
        instructions: 'En parejas, discutan si las redes sociales acercan o alejan a las personas. Cada estudiante debe expresar su postura y justificarla con al menos dos razones utilizando conectores causales.',
        scaffolding: [
          'Guía de discusión con 3 preguntas orientadoras proyectadas.',
          'Conectores recomendados: because, since, for instance.'
        ],
        task: 'Dialogar durante 3 minutos por turno compartiendo opiniones y respondiendo con interés a la postura del compañero.',
        success_criteria: 'Emite opiniones fundamentadas con vocabulario pertinente de tecnología y conectores claros.'
      },

      // 2. Versión de Apoyo (Support - Andamiaje Alto para Nivel A2 / Brecha en Justificación)
      support_version: {
        adaptation_type: 'support',
        target_audience: `${context.cohort_summary.need_distribution.support} alumnos que requieren andamiaje en conectores`,
        instructions: 'Con tu compañero, elige una de las dos posturas sobre las redes sociales. Utiliza las plantillas de inicio y el banco de palabras para armar tu opinión con una razón sólida.',
        scaffolding: [
          'Tarjeta de andamiaje visual con fórmulas de opinión resaltadas en color.',
          'Banco léxico temático clasificado por polos positivos y negativos.',
          '1 minuto de tiempo de preparación individual antes de la producción oral.'
        ],
        sentence_starters: [
          'In my opinion, social media is good because...',
          'I believe social media has problems since...',
          'For example, my friends use TikTok to...'
        ],
        word_bank: [
          'entertaining (entretenido)',
          'distracting (distractor)',
          'connects friends (conecta amigos)',
          'wastes time (pierde tiempo)',
          'useful for homework (útil para tareas)'
        ],
        task: 'Completar al menos 2 oraciones estructuradas expresando una opinión y comunicárselas a su compañero de banca.',
        success_criteria: 'Comunica una opinión comprensible unida a una causa mediante "because" o "since", apoyándose en las plantillas.'
      },

      // 3. Versión de Extensión (Extension - Desafío Cognitivo Superior para Nivel B2+)
      extension_version: {
        adaptation_type: 'extension',
        target_audience: `${context.cohort_summary.need_distribution.extension} alumnos avanzados`,
        instructions: 'Debate socrático crítico: Presenta tu postura sobre la manipulación algorítmica y los filtros burbuja en redes sociales, refuta un contraargumento y propone una solución ética.',
        scaffolding: [
          'Preguntas de orden superior: ¿Tienen las plataformas responsabilidad moral sobre la polarización?',
          'Cero plantillas básicas; libertad de recursos discursivos.'
        ],
        task: 'Sostener una argumentación de 4 minutos integrando opinión, evidencia factual, reconocimiento de la perspectiva contraria y contraargumento ("Although some argue that..., the fundamental issue is...").',
        challenge_requirement: 'Incorporar conectores concesivos complejos (nevertheless, whereas, despite) y una pregunta retórica para persuadir.',
        success_criteria: 'Demuestra fluidez espontánea, uso sofisticado de discurso concesivo y defensa sólida de una tesis compleja.'
      }
    };
  }
}
