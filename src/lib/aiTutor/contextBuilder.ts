/**
 * @file contextBuilder.ts
 * @description Constructor de contexto para la sesión del AI Tutor (Fase 8).
 * Ensambla de forma controlada y presupuestada:
 * 1. Contexto curricular del curso y la lección
 * 2. Nodo activo de la Bóveda Curricular (Knowledge Vault)
 * 3. Perfil académico del alumno (sin PII, estricto Privacy by Design)
 * 4. Estado académico estructurado de la conversación
 * 5. Últimos turnos recientes (control de costos de tokens)
 */

import { TutorSessionEntity, TutorMessage } from './types';
import { StudentAcademicProfileEntity, StudentCompetencyEntity } from '../adaptiveLearning/types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';

export interface TutorTurnContext {
  grade: string;
  age_band: string;
  course_topic: string;
  lesson_title: string;
  target_skill: string;
  primary_learning_outcome: string;
  target_cefr: string;
  student_estimated_level: string;
  strengths: string[];
  developing_points: string[];
  needs_support_points: string[];
  active_concept_id: string;
  active_concept_title: string;
  active_concept_phrases: string[];
  active_concept_grammar: string[];
  active_concept_vocabulary: string[];
  current_hint_level: number;
  scaffolding_level: string;
  language_policy: string;
  session_state_summary: {
    attempts: number;
    successful: number;
    hints_used: number;
    observed_errors: string[];
  };
  recent_messages: { role: string; content: string }[];
}

export class AITutorContextBuilder {
  /**
   * Construye el contexto didáctico para un turno conversacional del AI Tutor.
   */
  static build(
    session: TutorSessionEntity,
    profile: StudentAcademicProfileEntity,
    competenciesMap: Map<string, StudentCompetencyEntity>,
    recentMessagesCount: number = 6
  ): { contextDto: TutorTurnContext; promptText: string } {
    const isFrench = (session as any).subject === 'french' ||
      session.lesson_title?.toLowerCase().includes('français') || 
      session.lesson_title?.toLowerCase().includes('unité') ||
      session.knowledge_target_ids?.some(id => id.startsWith('fr_'));
    const vaultLang = isFrench ? 'french' : 'english';
    const graph = AcademicGraph.build(KnowledgeVaultLoader.loadAll(undefined, vaultLang));
    const state = session.conversation_state;

    // 1. Determinar concepto activo (soporta fallback a prerrequisitos)
    const activeConceptId = state.temporary_support_target_id || state.current_concept_id || session.knowledge_target_ids[0];
    const activeNode = graph.getNode(activeConceptId);
    const activeTitle = activeNode?.title || activeConceptId;

    // 2. Extraer frases y apoyos desde el nodo de la Bóveda Curricular
    const activePhrases: string[] = [];
    const activeGrammar: string[] = [];
    const activeVocab: string[] = [];

    if (activeNode) {
      // Extraer de language_functions
      if (activeNode.language_functions) {
        for (const lf of activeNode.language_functions) {
          activePhrases.push(`Use function: ${lf}`);
        }
      }
      // Si el nodo tiene learning outcomes
      if (activeNode.learning_outcomes) {
        activePhrases.push(...activeNode.learning_outcomes.slice(0, 3));
      }
    }

    // 3. Determinar perfil del estudiante en la habilidad de la lección
    const skillName = (activeNode?.skills[0] || 'speaking').toLowerCase();
    const skillProfile = (profile as any)[skillName];
    const estimatedLevel = skillProfile?.level || profile.overall_estimated_level || 'A1';

    // Fortalezas, en desarrollo y necesidades
    const strengths: string[] = [];
    const developing: string[] = [];
    const needsSupport: string[] = [];

    for (const comp of competenciesMap.values()) {
      if (comp.skill.toLowerCase() !== skillName) continue;
      const n = graph.getNode(comp.knowledge_unit_id);
      const title = n?.title || comp.knowledge_unit_id;

      if (comp.mastery_state === 'mastered' || comp.mastery_state === 'secure') {
        if (strengths.length < 2) strengths.push(title);
      } else if (comp.mastery_state === 'developing') {
        if (developing.length < 2) developing.push(title);
      } else if (comp.mastery_state === 'needs_review' || comp.mastery_state === 'introduced') {
        if (needsSupport.length < 2) needsSupport.push(title);
      }
    }

    // 4. Filtrar únicamente los turnos recientes relevantes (Presupuesto de Contexto)
    const recentMsgs = session.messages.slice(-recentMessagesCount).map(m => ({
      role: m.role,
      content: m.content
    }));

    // 5. Determinar banda etaria según el grado escolar
    let ageBand = '15-16 years old';
    if (session.course_id?.includes('primary') || profile.grade.includes('primary')) {
      ageBand = '9-11 years old';
    } else if (session.course_id?.includes('secondary') || profile.grade.includes('secondary')) {
      ageBand = '12-14 years old';
    }

    const contextDto: TutorTurnContext = {
      grade: profile.grade,
      age_band: ageBand,
      course_topic: 'Technology, Digital Media & Communication',
      lesson_title: 'Expressing Opinions and Giving Reasons in Collaborative Discourse',
      target_skill: skillName,
      primary_learning_outcome: session.primary_learning_outcome,
      target_cefr: 'B1',
      student_estimated_level: estimatedLevel,
      strengths: strengths.length > 0 ? strengths : ['Basic vocabulary recognition'],
      developing_points: developing.length > 0 ? developing : ['Giving reasons with connectors'],
      needs_support_points: needsSupport.length > 0 ? needsSupport : ['Asking for clarification'],
      active_concept_id: activeConceptId,
      active_concept_title: activeTitle,
      active_concept_phrases: activePhrases.slice(0, 4),
      active_concept_grammar: activeGrammar,
      active_concept_vocabulary: activeVocab,
      current_hint_level: state.current_hint_level || 1,
      scaffolding_level: session.scaffolding_level,
      language_policy: session.language_policy,
      session_state_summary: {
        attempts: state.questions_attempted,
        successful: state.successful_attempts,
        hints_used: state.hints_used_count,
        observed_errors: state.observed_errors.slice(-4)
      },
      recent_messages: recentMsgs
    };

    // 6. Formatear bloque de contexto para el prompt (CERO PII)
    const lines: string[] = [
      '### ACADEMIC CONTEXT & CURRICULAR ANCHOR (PRIVACY BY DESIGN) ###',
      `School Grade: ${contextDto.grade} (Age Band: ${contextDto.age_band})`,
      `Curriculum Topic: ${contextDto.course_topic}`,
      `Lesson: ${contextDto.lesson_title}`,
      `Target Skill: ${contextDto.target_skill.toUpperCase()}`,
      `Primary Learning Outcome: ${contextDto.primary_learning_outcome}`,
      `Target CEFR: ${contextDto.target_cefr}`,
      `Student Real Skill Level: ${contextDto.student_estimated_level}`,
      `Known Strengths: ${contextDto.strengths.join(', ')}`,
      `Developing Competencies: ${contextDto.developing_points.join(', ')}`,
      `Needs Support / Gaps: ${contextDto.needs_support_points.join(', ')}`,
      '',
      `ACTIVE KNOWLEDGE UNIT: [${contextDto.active_concept_id}] "${contextDto.active_concept_title}"`,
      state.temporary_support_target_id ? 'STATUS: TEMPORARY PREREQUISITE FALLBACK ACTIVE' : 'STATUS: MAIN CURRICULAR TARGET ACTIVE',
      `Current Scaffolding Level: ${contextDto.scaffolding_level.toUpperCase()}`,
      `Current Hint Level: Level ${contextDto.current_hint_level} of 5`,
      `Language Policy: ${contextDto.language_policy.toUpperCase()}`,
      '',
      'SESSION MEMORY STATE:',
      `- Questions Attempted: ${contextDto.session_state_summary.attempts}`,
      `- Successful Autonomous Attempts: ${contextDto.session_state_summary.successful}`,
      `- Hints Used So Far: ${contextDto.session_state_summary.hints_used}`,
      `- Observed Recurring Errors: ${contextDto.session_state_summary.observed_errors.length > 0 ? contextDto.session_state_summary.observed_errors.join('; ') : 'None yet'}`
    ];

    return {
      contextDto,
      promptText: lines.join('\n')
    };
  }
}
