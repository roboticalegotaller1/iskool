/**
 * @file practiceGenerator.ts
 * @description Generador de micro-ejercicios dialógicos en tiempo real para el AI Tutor (Fase 8).
 * Produce reactivos ligeros basados en la Bóveda Curricular:
 * - sentence completion (completar oración con conector)
 * - micro-dialogue (reacción comunicativa en un intercambio)
 * - reformulation (expresar la misma idea con mayor cortesía o precisión)
 * - open opinion prompt (pregunta de opinión con justificación)
 */

import { TutorTurnContext } from './contextBuilder';

export type MicroPracticePattern = 
  | 'sentence_completion'
  | 'micro_dialogue'
  | 'reformulation'
  | 'open_opinion';

export interface MicroPracticeExercise {
  pattern: MicroPracticePattern;
  prompt_for_student: string;
  expected_element: string;
  suggested_model?: string;
}

export class AITutorPracticeGenerator {
  /**
   * Genera un micro-ejercicio contextualizado según el nivel de andamiaje.
   */
  static generate(context: TutorTurnContext, pattern?: MicroPracticePattern): MicroPracticeExercise {
    const selectedPattern = pattern || (
      context.scaffolding_level === 'high' ? 'sentence_completion' :
      context.scaffolding_level === 'medium' ? 'micro_dialogue' : 'open_opinion'
    );

    if (selectedPattern === 'sentence_completion') {
      return {
        pattern: 'sentence_completion',
        prompt_for_student: 'Complete this opinion with your own reason: "I think mobile phones are useful in class because..."',
        expected_element: 'because + subject + verb',
        suggested_model: 'I think mobile phones are useful in class because they help us find information quickly.'
      };
    }

    if (selectedPattern === 'micro_dialogue') {
      return {
        pattern: 'micro_dialogue',
        prompt_for_student: 'Your partner says: "Social networks are totally harmless for teenagers." Politely disagree and give one reason.',
        expected_element: 'Polite disagreement (e.g. "I see your point, but...", "I don\'t really agree because...")',
        suggested_model: 'I see your point, but I disagree because excessive screen time can cause anxiety.'
      };
    }

    if (selectedPattern === 'reformulation') {
      return {
        pattern: 'reformulation',
        prompt_for_student: 'Turn this blunt statement into a polite, justified opinion: "AI is dangerous."',
        expected_element: 'Nuanced connector and justification',
        suggested_model: 'In my view, artificial intelligence could be dangerous if we do not regulate data privacy.'
      };
    }

    // open_opinion (Nivel Low Scaffolding / Extension)
    return {
      pattern: 'open_opinion',
      prompt_for_student: 'Some experts argue that automated algorithms limit our critical thinking by showing only what we already like. What is your stance on this dilemma, and why?',
      expected_element: 'Stance + justification + addressing counter-perspective',
      suggested_model: 'While algorithms offer personalized convenience, I believe they create echo chambers that reduce exposure to diverse viewpoints.'
    };
  }
}
