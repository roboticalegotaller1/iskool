/**
 * @file nextActionService.ts
 * @description Servicio de recomendación de la Próxima Mejor Acción Pedagógica (Next Best Learning Action).
 * Emite una decisión estructurada, auditable y sin cajas negras:
 * - review: repasar concepto con decaimiento o dificultad
 * - practice: práctica deliberada para consolidar competencia en desarrollo
 * - continue_course: proseguir con la secuencia estándar del grupo (core)
 * - support_prerequisite: andamiar prerrequisito bloqueante antes de abordar la meta del día
 * - extension: desafío enriquecido para estudiante que ya domina el contenido
 * - assessment: aplicación de evaluación formativa/sumativa
 */

import {
  NextActionRecommendation,
  PriorityItem,
  StudentCompetencyEntity,
  AdaptationType,
  NextActionType
} from './types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';

export class AdaptiveLearningNextActionService {
  /**
   * Determina la acción pedagógica más adecuada para el alumno en el contexto de la lección actual.
   */
  static call(
    studentId: string,
    currentLessonTargetUnitId: string,
    priorities: PriorityItem[],
    competenciesMap: Map<string, StudentCompetencyEntity>
  ): NextActionRecommendation {
    const graph = AcademicGraph.build(KnowledgeVaultLoader.loadAll());
    const targetNode = graph.getNode(currentLessonTargetUnitId);
    const targetComp = competenciesMap.get(currentLessonTargetUnitId);
    const targetState = targetComp ? targetComp.mastery_state : 'not_assessed';
    const targetTitle = targetNode?.title || currentLessonTargetUnitId;
    const targetSkill = targetNode?.skills[0] || 'speaking';

    // 1. Caso 1: Estudiante con Dominio Pleno (Mastered) -> Extensión
    if (targetState === 'mastered') {
      return {
        student_id: studentId,
        action: 'extension',
        adaptation_suggested: 'extension',
        target_knowledge_unit_id: currentLessonTargetUnitId,
        target_knowledge_title: targetTitle,
        skill: targetSkill,
        current_state: targetState,
        confidence: targetComp?.confidence || 0.85,
        rationale: `El alumno cuenta con dominio consolidado ("mastered") en "${targetTitle}". Se recomienda enriquecimiento de orden superior, pensamiento crítico y menor andamiaje en la sesión de hoy.`,
        bridge_guidance: 'Fomentar debate multifacético, argumentación con contra-ejemplos y uso de registro formal avanzado.'
      };
    }

    // 2. Caso 2: Prerrequisito Bloqueante no consolidado para la lección de hoy -> Apoyo al prerrequisito
    if (targetNode) {
      const prereqs = [...targetNode.prerequisites, ...targetNode.builds_on];
      for (const preId of prereqs) {
        const preComp = competenciesMap.get(preId);
        const preState = preComp ? preComp.mastery_state : 'not_assessed';
        if (preState !== 'secure' && preState !== 'mastered') {
          const preNode = graph.getNode(preId);
          return {
            student_id: studentId,
            action: 'support_prerequisite',
            adaptation_suggested: 'support',
            target_knowledge_unit_id: preId,
            target_knowledge_title: preNode?.title || preId,
            skill: preNode?.skills[0] || targetSkill,
            current_state: preState,
            confidence: preComp?.confidence || 0.40,
            rationale: `Existe un prerrequisito bloqueante: "${preNode?.title}" se encuentra en estado "${preState}". Para que el estudiante pueda abordar con éxito "${targetTitle}", se requiere una variante con andamiaje intensivo que tienda un puente sobre este prerrequisito.`,
            bridge_guidance: `Integrar sentence starters y bancos de palabras específicos para activar "${preNode?.title}" durante la fase de activación de la lección.`
          };
        }
      }
    }

    // 3. Caso 3: El concepto de la lección está en "needs_review" -> Revisión
    if (targetState === 'needs_review') {
      return {
        student_id: studentId,
        action: 'review',
        adaptation_suggested: 'support',
        target_knowledge_unit_id: currentLessonTargetUnitId,
        target_knowledge_title: targetTitle,
        skill: targetSkill,
        current_state: targetState,
        confidence: targetComp?.confidence || 0.60,
        rationale: `Evidencia reciente muestra retroceso o dificultad en "${targetTitle}". Se aconseja una variante de apoyo para reactivar y clarificar las dudas identificadas.`,
        bridge_guidance: 'Proveer retroalimentación correctiva inmediata y modelos explícitos de respuesta antes de la producción autónoma.'
      };
    }

    // 4. Caso 4: El concepto de la lección está en "developing" o "introduced" -> Práctica guiada
    if (targetState === 'developing' || targetState === 'introduced') {
      return {
        student_id: studentId,
        action: 'practice',
        adaptation_suggested: 'support',
        target_knowledge_unit_id: currentLessonTargetUnitId,
        target_knowledge_title: targetTitle,
        skill: targetSkill,
        current_state: targetState,
        confidence: targetComp?.confidence || 0.50,
        rationale: `El alumno se encuentra en etapa de desarrollo ("${targetState}") para "${targetTitle}". Requiere andamiaje estructural para guiar su interacción comunicativa en clase.`,
        bridge_guidance: 'Incorporar sentence starters, organizadores gráficos e instrucciones fragmentadas paso a paso.'
      };
    }

    // 5. Caso 5: El concepto está en nivel "secure" o "not_assessed" regular -> Proseguir con el curso (Core)
    return {
      student_id: studentId,
      action: 'continue_course',
      adaptation_suggested: 'core',
      target_knowledge_unit_id: currentLessonTargetUnitId,
      target_knowledge_title: targetTitle,
      skill: targetSkill,
      current_state: targetState,
      confidence: targetComp?.confidence || 0.70,
      rationale: `El alumno posee las bases requeridas para participar en la actividad estándar ("core") planificada para High School 1 en "${targetTitle}".`,
      bridge_guidance: 'Monitorear la autonomía del alumno durante la producción y proveer apoyo incidental si surgen dudas.'
    };
  }
}
