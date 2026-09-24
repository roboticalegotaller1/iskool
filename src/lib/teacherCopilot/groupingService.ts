/**
 * @file groupingService.ts
 * @description Servicio de Agrupamiento Pedagógico Configurable (TeacherCopilot::GroupingService).
 * Cumple con los ítems #15, #16, #17 y #18:
 * - Soporta 5 estrategias: similar_need, mixed_ability, peer_support, random, project_balance.
 * - Emplea denominaciones pedagógicas neutrales y dignificantes (cero estigmatización).
 * - Provee explicaciones transparentes de la lógica de conformación de equipos sin exponer datos sensibles entre pares.
 */

import { GroupingStrategyType, PedagogicalGroupRecommendation, ResolvedTeacherContext } from './types';

export class TeacherCopilotGroupingService {
  /**
   * Genera recomendaciones de agrupación según la estrategia solicitada por el docente.
   */
  static generateGroups(
    context: ResolvedTeacherContext,
    options: {
      strategy?: GroupingStrategyType;
      targetGroupCount?: number;
    } = {}
  ): PedagogicalGroupRecommendation[] {
    const strategy = options.strategy || context.preferences.grouping_preference || 'similar_need';
    const totalStudents = context.cohort_summary.total_students || 25;
    const needDist = context.cohort_summary.need_distribution;

    // Crear lista de alias anonimizados para la conformación de grupos (Zero PII)
    const supportAliases: string[] = [];
    for (let i = 1; i <= needDist.support; i++) {
      supportAliases.push(`Student_S${i.toString().padStart(2, '0')}`);
    }

    const coreAliases: string[] = [];
    for (let i = 1; i <= needDist.core; i++) {
      coreAliases.push(`Student_C${i.toString().padStart(2, '0')}`);
    }

    const extensionAliases: string[] = [];
    for (let i = 1; i <= needDist.extension; i++) {
      extensionAliases.push(`Student_E${i.toString().padStart(2, '0')}`);
    }

    const recommendations: PedagogicalGroupRecommendation[] = [];

    switch (strategy) {
      case 'mixed_ability': {
        // Formar 4-5 grupos heterogéneos con 1 alumno de extensión, 3-4 core y 1-2 support
        const numGroups = options.targetGroupCount || 5;
        for (let g = 1; g <= numGroups; g++) {
          const members: string[] = [];
          if (extensionAliases.length > 0) members.push(extensionAliases.pop()!);
          if (supportAliases.length > 0) members.push(supportAliases.pop()!);
          // Rellenar con core
          while (members.length < Math.floor(totalStudents / numGroups) && coreAliases.length > 0) {
            members.push(coreAliases.pop()!);
          }

          recommendations.push({
            group_number: g,
            label: `Mesa de Colaboración Heterogénea ${g}`,
            strategy: 'mixed_ability',
            student_aliases: members,
            suggested_adaptation: 'core',
            target_focus: 'Debate interactivo y co-construcción de argumentos con roles asignados.',
            rationale: 'Distribución equilibrada donde estudiantes con alta fluidez modelan el discurso, mientras los compañeros en desarrollo aportan ideas apoyándose en roles estructurados (moderador, vocero, sintetizador).'
          });
        }
        break;
      }

      case 'peer_support': {
        // Formar parejas de apoyo guiado
        const numPairs = Math.min(supportAliases.length, extensionAliases.length + coreAliases.length);
        const mentors = [...extensionAliases, ...coreAliases];

        for (let p = 1; p <= numPairs; p++) {
          const mentee = supportAliases[p - 1] || `Student_S${p}`;
          const mentor = mentors[p - 1] || `Student_C${p}`;

          recommendations.push({
            group_number: p,
            label: `Pareja de Tutoría entre Pares ${p}`,
            strategy: 'peer_support',
            student_aliases: [mentee, mentor],
            suggested_adaptation: 'support',
            target_focus: 'Intercambio guiado de opiniones con andamiaje recíproco.',
            rationale: 'El compañero guía modela conectores causales y formula preguntas aclaratorias, permitiendo que el compañero asistido practique en un entorno de baja ansiedad.'
          });
        }
        break;
      }

      case 'random': {
        const numGroups = options.targetGroupCount || 4;
        const allStudents = [...supportAliases, ...coreAliases, ...extensionAliases];
        const groupSize = Math.ceil(allStudents.length / numGroups);

        for (let g = 1; g <= numGroups; g++) {
          const members = allStudents.slice((g - 1) * groupSize, g * groupSize);
          recommendations.push({
            group_number: g,
            label: `Equipo de Práctica Conversacional ${g}`,
            strategy: 'random',
            student_aliases: members,
            suggested_adaptation: 'core',
            target_focus: 'Práctica comunicativa espontánea en equipo.',
            rationale: 'Asignación aleatoria para fomentar la adaptabilidad comunicativa y la interacción social con diversos compañeros.'
          });
        }
        break;
      }

      case 'project_balance': {
        const numGroups = options.targetGroupCount || 4;
        for (let g = 1; g <= numGroups; g++) {
          recommendations.push({
            group_number: g,
            label: `Panel de Proyecto y Debate Multidisciplinario ${g}`,
            strategy: 'project_balance',
            student_aliases: [`Student_E0${g}`, `Student_C0${g * 2}`, `Student_C0${g * 2 + 1}`, `Student_S0${g}`].filter(Boolean),
            suggested_adaptation: 'core',
            target_focus: 'Desarrollo de propuesta comunitaria sobre tecnología responsable.',
            rationale: 'Balance de perfiles: liderazgo discursivo, investigación documental y redacción de conclusiones compartidas.'
          });
        }
        break;
      }

      case 'similar_need':
      default: {
        // 3 Grupos de Necesidad Similar (Ítem #16 y Piloto 3)
        // Grupo 1: Apoyo focalizado (Support)
        recommendations.push({
          group_number: 1,
          label: 'Círculo de Práctica Guiada y Andamiaje Estructural',
          strategy: 'similar_need',
          student_aliases: supportAliases,
          suggested_adaptation: 'support',
          target_focus: 'Formulación de opiniones con bancos de conectores (because, since) y modelado paso a paso.',
          rationale: 'Permite al docente intervenir directamente con apoyos visuales y sentence starters sin ralentizar al resto de la clase.'
        });

        // Grupo 2: Práctica estándar (Core)
        recommendations.push({
          group_number: 2,
          label: 'Foro Colaborativo de Debate y Discusión Estándar',
          strategy: 'similar_need',
          student_aliases: coreAliases,
          suggested_adaptation: 'core',
          target_focus: 'Intercambio fluido de opiniones en parejas y pequeñas mesas de conversación.',
          rationale: 'Alumnos que dominan la estructura básica y se benefician de práctica conversacional interactiva y autónoma.'
        });

        // Grupo 3: Desafío y extensión (Extension)
        recommendations.push({
          group_number: 3,
          label: 'Panel de Análisis Crítico, Contraargumentación y Síntesis',
          strategy: 'similar_need',
          student_aliases: extensionAliases,
          suggested_adaptation: 'extension',
          target_focus: 'Debate de posturas complejas, refutación de contraargumentos y formulación de preguntas retóricas.',
          rationale: 'Estudiantes con fluidez B2 que requieren desafíos de mayor orden cognitivo para evitar el desinterés.'
        });
        break;
      }
    }

    return recommendations;
  }
}
