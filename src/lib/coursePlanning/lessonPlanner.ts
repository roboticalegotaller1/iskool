/**
 * @file lessonPlanner.ts
 * @description Planificador de Lecciones Didácticas (CoursePlanning::LessonPlanner).
 * Transforma una Unidad Curricular en una secuencia de lecciones semanales de 50 minutos con
 * modelos metodológicos definidos (PPP, ESA, TBL), objetivos pedagógicos y ranuras de actividad (slots).
 */

import { UnitEntity, LessonEntity, ActivitySlotEntity, LessonType, PedagogicalModel } from './types';

export class LessonPlanner {
  /**
   * Planifica todas las lecciones de una unidad dada.
   */
  static planLessonsForUnit(
    unit: UnitEntity,
    startWeek: number = 1,
    sessionsPerWeek: number = 4,
    minutesPerSession: number = 50
  ): { lessons: LessonEntity[]; slots: ActivitySlotEntity[] } {
    const totalSessions = unit.duration_weeks * sessionsPerWeek;
    const lessons: LessonEntity[] = [];
    const allSlots: ActivitySlotEntity[] = [];
    const now = new Date().toISOString();

    for (let sessionIndex = 1; sessionIndex <= totalSessions; sessionIndex++) {
      const weekOffset = Math.floor((sessionIndex - 1) / sessionsPerWeek);
      const weekNumber = startWeek + weekOffset;
      const sessionNumber = ((sessionIndex - 1) % sessionsPerWeek) + 1;

      // Determinar tipo de lección y modelo según momento didáctico de la unidad
      let lessonType: LessonType = 'development';
      let pedagogicalModel: PedagogicalModel = 'PPP';

      if (sessionIndex === 1) {
        lessonType = 'introduction';
        pedagogicalModel = 'ESA';
      } else if (sessionIndex === totalSessions) {
        lessonType = 'assessment';
        pedagogicalModel = 'TBL';
      } else if (sessionIndex === totalSessions - 1) {
        lessonType = 'review';
        pedagogicalModel = 'PBL';
      } else if (sessionIndex === totalSessions - 2) {
        lessonType = 'integration';
        pedagogicalModel = 'discussion_first';
      } else if (sessionIndex % 2 === 0) {
        lessonType = 'practice';
        pedagogicalModel = 'TBL';
      }

      // Título y objetivo adaptativo
      const lessonTitle = this.determineLessonTitle(unit, sessionNumber, weekNumber, lessonType);
      const primaryOutcome = this.determineLessonOutcome(unit, sessionIndex, totalSessions, lessonType);
      const secondaryOutcomes = unit.learning_outcomes.slice(0, 2);

      // Selección de targets curriculares específicos para la sesión
      const targetSubIndex = (sessionIndex - 1) % Math.max(1, unit.knowledge_targets.length);
      const sessionTargets = [
        unit.knowledge_targets[targetSubIndex] || unit.knowledge_targets[0] || 'general_english',
        unit.knowledge_targets[(targetSubIndex + 1) % unit.knowledge_targets.length] || unit.knowledge_targets[0]
      ];

      const lessonId = `lesson_${unit.id}_s${sessionIndex}`;
      const lesson: LessonEntity = {
        id: lessonId,
        unit_id: unit.id,
        position: sessionIndex,
        week_number: weekNumber,
        session_number: sessionNumber,
        title: lessonTitle,
        duration_minutes: minutesPerSession,
        lesson_type: lessonType,
        pedagogical_model: pedagogicalModel,
        primary_learning_outcome: primaryOutcome,
        secondary_learning_outcomes: secondaryOutcomes,
        knowledge_targets: sessionTargets,
        activity_patterns: this.determineActivityPatterns(lessonType),
        assessment_evidence: lessonType === 'assessment' 
          ? 'Rúbrica analítica y rúbrica holística de desempeño' 
          : 'Boleto de salida (Exit Ticket) y rúbrica rápida formativa',
        status: 'approved',
        metadata: {},
        created_at: now,
        updated_at: now
      };

      lessons.push(lesson);

      // Generar 4 slots de actividad estructurados para la sesión (Total = 50 min)
      const slots = this.generateSlotsForLesson(lessonId, lessonType, pedagogicalModel);
      allSlots.push(...slots);
    }

    return { lessons, slots: allSlots };
  }

  /**
   * Genera las ranuras de actividad cronometradas para una lección.
   */
  private static generateSlotsForLesson(
    lessonId: string,
    lessonType: LessonType,
    model: PedagogicalModel
  ): ActivitySlotEntity[] {
    const now = new Date().toISOString();
    return [
      {
        id: `slot_${lessonId}_1`,
        lesson_id: lessonId,
        position: 1,
        purpose: 'activation',
        duration_minutes: 8,
        activity_pattern: 'pair_interview',
        instructions_brief: 'Icebreaker dinámico para activar conocimientos previos y motivación temática.',
        status: 'pending',
        created_at: now,
        updated_at: now
      },
      {
        id: `slot_${lessonId}_2`,
        lesson_id: lessonId,
        position: 2,
        purpose: 'input',
        duration_minutes: 12,
        activity_pattern: 'information_gap',
        instructions_brief: 'Modelado explícito, análisis de muestras textuales/orales y andamiaje lingüístico.',
        status: 'pending',
        created_at: now,
        updated_at: now
      },
      {
        id: `slot_${lessonId}_3`,
        lesson_id: lessonId,
        position: 3,
        purpose: 'collaborative_production',
        duration_minutes: 20,
        activity_pattern: lessonType === 'practice' ? 'guided_discussion' : 'opinion_paragraph',
        instructions_brief: 'Producción comunicativa guiada y colaborativa con asignación de roles asimétricos.',
        status: 'pending',
        created_at: now,
        updated_at: now
      },
      {
        id: `slot_${lessonId}_4`,
        lesson_id: lessonId,
        position: 4,
        purpose: 'reflection',
        duration_minutes: 10,
        activity_pattern: 'error_correction',
        instructions_brief: 'Autoevaluación formativa, retroalimentación entre pares y boleto de salida.',
        status: 'pending',
        created_at: now,
        updated_at: now
      }
    ];
  }

  private static determineLessonTitle(
    unit: UnitEntity,
    sessionNum: number,
    weekNum: number,
    type: LessonType
  ): string {
    if (type === 'introduction') {
      return `${unit.title}: Exploratory Framing & Core Concepts`;
    }
    if (type === 'assessment') {
      return `Unit ${unit.position} Summative Assessment & Authentic Production`;
    }
    if (type === 'review') {
      return `Collaborative Synthesis & Spaced Review Workshop`;
    }
    if (type === 'integration') {
      return `Cross-Disciplinary Integration: Applied Dilemmas`;
    }

    // Nombres contextuales específicos para Unit 3 (Technology & Media)
    if (unit.theme === 'technology_and_media') {
      const titles = [
        'Speaking: Expressing and Supporting Opinions on Technology',
        'Reading: Deconstructing Rhetorical Devices and Bias in Tech Media',
        'Grammar & Discourse: Intermediate Passive Reporting in Scientific News',
        'Writing: Drafting Balanced Argumentative Stances on AI Ethics',
        'Listening: Attitudinal Nuance and Tone in Tech Policy Podcasts',
        'Oral Simulation: Multilateral Debate on Data Privacy Rights'
      ];
      return titles[(sessionNum - 1) % titles.length];
    }

    return `${unit.title}: Deep Skill Development (Part ${sessionNum})`;
  }

  private static determineLessonOutcome(
    unit: UnitEntity,
    sessionIdx: number,
    totalSessions: number,
    type: LessonType
  ): string {
    if (type === 'assessment') {
      return `Demonstrate mastery of ${unit.title} learning targets through authentic production and paired interaction [Unit ${unit.position} - Session ${sessionIdx}].`;
    }
    if (type === 'review') {
      return `Consolidate and review key language functions and grammar structures practiced throughout ${unit.title} [Unit ${unit.position} - Session ${sessionIdx}].`;
    }
    if (type === 'integration') {
      return `Integrate cross-disciplinary vocabulary and communicative strategies to solve complex case dilemmas in ${unit.title} [Unit ${unit.position} - Session ${sessionIdx}].`;
    }
    if (type === 'introduction') {
      return `Explore core themes, elicit prior knowledge and frame communicative objectives for ${unit.title} [Unit ${unit.position} - Session ${sessionIdx}].`;
    }

    const baseOutcome = (unit.learning_outcomes && unit.learning_outcomes.length > 0)
      ? unit.learning_outcomes[(sessionIdx - 1) % unit.learning_outcomes.length]
      : `communicate effectively within ${unit.title}`;

    const progressionVerbs = [
      'Analyze and identify structural patterns to',
      'Practice guided communicative exchanges to',
      'Formulate reasoned arguments and evidence to',
      'Collaborate in paired interactive simulations to',
      'Evaluate contrasting perspectives and synthesize data to',
      'Deliver focused presentations and justify stances to'
    ];

    const verbPhrase = progressionVerbs[(sessionIdx - 1) % progressionVerbs.length];
    const cleanBase = baseOutcome.replace(/[\.\s]+$/, '');
    const lowerBase = cleanBase.charAt(0).toLowerCase() + cleanBase.slice(1);

    return `${verbPhrase} ${lowerBase} [Unit ${unit.position} - Session ${sessionIdx}].`;
  }

  private static determineActivityPatterns(type: LessonType): string[] {
    switch (type) {
      case 'introduction':
        return ['pair_interview', 'information_gap'];
      case 'practice':
        return ['guided_discussion', 'vocabulary_sort'];
      case 'development':
        return ['opinion_paragraph', 'guided_discussion'];
      case 'integration':
        return ['debate', 'problem_solving_discussion'];
      case 'assessment':
        return ['debate', 'opinion_paragraph'];
      default:
        return ['guided_discussion', 'pair_interview'];
    }
  }
}
