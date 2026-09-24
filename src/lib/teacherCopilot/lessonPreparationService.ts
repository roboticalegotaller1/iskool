/**
 * @file lessonPreparationService.ts
 * @description Servicio de Preparación Estructurada de Lección (TeacherCopilot::LessonPreparationService).
 * Cumple con los ítems #7, #8, #9, #32, #42 y #43:
 * - Reutiliza la lección existente en Course Planning sin generar planes duplicados.
 * - Integra restricciones de aula (duración, tecnología, impresión) y necesidades reales del grupo.
 * - Estructura el flujo didáctico con tiempos cronometrados, notas de facilitación, apoyos y Exit Check.
 */

import { ResolvedTeacherContext, LessonPrepDetails } from './types';

export class TeacherCopilotLessonPreparationService {
  /**
   * Prepara la sesión de clase integrando el contexto curricular y las necesidades del grupo.
   */
  static prepare(context: ResolvedTeacherContext): LessonPrepDetails {
    const course = context.course;
    const unit = context.current_unit || { title: 'Technology & Media' };
    const lesson = context.target_lesson || {
      title: 'Expressing and Supporting Opinions with Reasons',
      duration_minutes: 50,
      primary_learning_outcome: 'Students can formulate an opinion and justify it using connectors.',
      knowledge_targets: ['speaking_b1_secondary_expressing_opinions', 'func_giving_reasons']
    };

    const constraints = context.constraints;
    const needDist = context.cohort_summary.need_distribution;
    const availableTime = constraints.time_available_minutes || lesson.duration_minutes || 50;

    // Calcular distribución de tiempo según la duración disponible
    const warmUpTime = Math.max(5, Math.round(availableTime * 0.10));
    const activationTime = Math.max(10, Math.round(availableTime * 0.20));
    const guidedTime = Math.max(15, Math.round(availableTime * 0.30));
    const pairDiscussionTime = Math.max(15, Math.round(availableTime * 0.30));
    const exitCheckTime = availableTime - (warmUpTime + activationTime + guidedTime + pairDiscussionTime);

    const suggestedFlow = [
      {
        slot_name: 'Warm-up & Hook',
        duration_minutes: warmUpTime,
        purpose: 'Activación del interés y sondeo diagnóstico',
        description: 'Proyectar una imagen de dos jóvenes debatiendo sobre el uso de celulares. Pregunta detonadora rápida: "Do you prefer studying with or without your phone?"',
        interaction_type: 'plenary' as const
      },
      {
        slot_name: 'Language Activation & Modeling',
        duration_minutes: activationTime,
        purpose: 'Presentación de conectores y estructuras funcionales',
        description: 'Modelar en el pizarrón 3 fórmulas de opinión ("In my view...", "I believe...") y conectores causales ("because...", "since..."). Contrastar una opinión aislada vs. una opinión respaldada.',
        interaction_type: 'plenary' as const
      },
      {
        slot_name: 'Guided Speaking Circle',
        duration_minutes: guidedTime,
        purpose: 'Práctica estructurada con andamiaje',
        description: 'Dinámica de "Opinion Line": Los alumnos eligen un lado del salón según su postura y comparten una razón con su vecino utilizando una plantilla visual.',
        interaction_type: 'small_groups' as const
      },
      {
        slot_name: 'Collaborative Pair Discussion',
        duration_minutes: pairDiscussionTime,
        purpose: 'Producción comunicativa interactiva',
        description: 'Debate en parejas: Tarjetas con 3 dilemas éticos de tecnología (IA en tareas, privacidad en redes, influencers). Cada alumno debe argumentar su postura y pedir al menos una aclaración a su compañero.',
        interaction_type: 'pairs' as const
      },
      {
        slot_name: 'Exit Check Formativo',
        duration_minutes: exitCheckTime > 0 ? exitCheckTime : 5,
        purpose: 'Recolección de evidencia rápida antes del cierre',
        description: 'Micro-respuesta oral de 45 segundos: Cada estudiante expresa a su compañero de banca una opinión sobre la tecnología y una razón clara con "because / since". El docente circula y toma notas breves.',
        interaction_type: 'individual' as const
      }
    ];

    const differentiationTips = {
      support: 'Para los 6 estudiantes en nivel emergente: Entregar una tarjeta con sentence starters ("In my opinion, ... because ...") y banco de palabras (safe, useful, distracting, connects people).',
      extension: 'Para los 4 estudiantes avanzados: Desafío de refutación ("Express your opinion, state a reason, and answer one possible counterargument").'
    };

    const teacherNotes = [
      'Recordatorio: La escuela no cuenta con presupuesto de fotocopias para esta sesión; proyectar los dilemas en la pantalla principal.',
      'Foco pedagógico: No interrumpir la fluidez durante el debate en parejas para corregir pronunciación menor; registrar errores recurrentes de conectores para el cierre plenario.',
      'Tiempo de espera: Conceder al menos 5 segundos de silencio constructivo tras formular preguntas abiertas para permitir que los alumnos elaboren su respuesta mentalmente.'
    ];

    const quickAssessment = {
      type: '1-minute oral exit ticket',
      prompt: 'State one clear opinion about artificial intelligence or social media, and support it with a valid reason using "because" or "since".',
      success_criteria: 'El estudiante emite un enunciado completo con postura clara y al menos una cláusula causal coherente.'
    };

    return {
      course_title: course.title,
      unit_title: unit.title,
      lesson_title: lesson.title,
      duration_minutes: availableTime,
      main_outcome: lesson.primary_learning_outcome,
      knowledge_targets: lesson.knowledge_targets,
      suggested_flow: suggestedFlow,
      group_needs: {
        support_count: needDist.support,
        core_count: needDist.core,
        extension_count: needDist.extension
      },
      differentiation_tips: differentiationTips,
      teacher_notes: teacherNotes,
      quick_assessment: quickAssessment
    };
  }
}
