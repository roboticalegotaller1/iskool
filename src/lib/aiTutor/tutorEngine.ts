/**
 * @file tutorEngine.ts
 * @description Orquestador central del AI Tutor conversacional (Fase 8).
 * Administra el ciclo de vida de la sesión, los turnos conversacionales, la escalera de pistas,
 * el fallback a prerrequisitos, la defensa anti-inyecciones y la integración con el MasteryEngine.
 */

import {
  TutorSessionEntity,
  TutorMessage,
  ConversationState,
  TutorResponseOutput,
  TutorSessionType,
  ScaffoldingLevel,
  LanguagePolicy,
  TutorMode,
  NextStepDecision
} from './types';
import { StudentAcademicProfileEntity, StudentCompetencyEntity } from '../adaptiveLearning/types';
import { AITutorContextBuilder } from './contextBuilder';
import { AITutorPromptBuilder } from './promptBuilder';
import { AITutorNextStepService } from './nextStepService';
import { AITutorEvidenceExtractor } from './evidenceExtractor';
import { AITutorSessionSummaryService } from './sessionSummaryService';
import { AdaptiveLearningMasteryEngine } from '../adaptiveLearning/masteryEngine';
import { BaseAcademicGenerator } from '../academicGeneration/baseGenerator';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';

export class AITutorEngine {
  /**
   * Inicializa una nueva sesión de tutoría pedagógica
   */
  static startSession(params: {
    studentId: string;
    courseId?: string;
    unitId?: string;
    lessonId?: string;
    primaryLearningOutcome: string;
    knowledgeTargetIds: string[];
    sessionType?: TutorSessionType;
    scaffoldingLevel?: ScaffoldingLevel;
    languagePolicy?: LanguagePolicy;
    tutorMode?: TutorMode;
  }): TutorSessionEntity {
    const targets = params.knowledgeTargetIds || (params as any).knowledge_target_ids || [];
    const mainTarget = targets[0] || 'fr_gram_present_indicatif_a1';
    const outcome = params.primaryLearningOutcome || (params as any).primary_learning_outcome || (params as any).lesson_title || 'Objectif Pédagogique';

    const state: ConversationState = {
      current_objective: outcome,
      current_concept_id: mainTarget,
      main_target_id: mainTarget,
      questions_attempted: 0,
      successful_attempts: 0,
      consecutive_correct: 0,
      consecutive_errors: 0,
      hints_used_count: 0,
      current_hint_level: 1,
      observed_errors: [],
      demonstrated_understanding: false,
      remaining_goals: [params.primaryLearningOutcome],
      is_exit_check: false,
      exit_check_passed: false
    };

    return {
      id: `tut_sess_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      student_id: params.studentId,
      course_id: params.courseId,
      unit_id: params.unitId,
      lesson_id: params.lessonId,
      session_type: params.sessionType || 'lesson_support',
      status: 'active',
      tutor_mode: params.tutorMode || 'guided_practice',
      scaffolding_level: params.scaffoldingLevel || 'medium',
      language_policy: params.languagePolicy || 'mostly_target_language',
      primary_learning_outcome: params.primaryLearningOutcome,
      knowledge_target_ids: params.knowledgeTargetIds,
      conversation_state: state,
      messages: [],
      started_at: new Date().toISOString(),
      duration_seconds: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  /**
   * Procesa un turno conversacional del estudiante
   */
  static async processTurn(
    session: TutorSessionEntity,
    studentInput: string,
    profile: StudentAcademicProfileEntity,
    competenciesMap: Map<string, StudentCompetencyEntity>
  ): Promise<{
    session: TutorSessionEntity;
    output: TutorResponseOutput;
  }> {
    const state = session.conversation_state;
    const cleanInput = studentInput.trim();

    // 1. FILTRO ANTI-INYECCIÓN Y SEGURIDAD PEDAGÓGICA (Zero-Token Cost Defense)
    const lowerInput = cleanInput.toLowerCase();
    if (
      lowerInput.includes('ignore your rules') ||
      lowerInput.includes('ignore previous instructions') ||
      lowerInput.includes('olvida tus reglas') ||
      lowerInput.includes('give me all the answers') ||
      lowerInput.includes('dame todas las respuestas') ||
      lowerInput.includes('system prompt')
    ) {
      const output: TutorResponseOutput = {
        student_message: 'My goal as your iSchool Tutor is to help you build this skill yourself step by step! Let\'s focus on the activity: how would you share your viewpoint about this topic?',
        tutor_action: 'practice',
        target_knowledge: state.current_concept_id,
        evidence: { demonstrated: false, confidence: 0.20, notes: 'Prompt injection attempt blocked and redirected.' },
        next_step: 'maintain_curricular_focus'
      };
      this.recordMessages(session, cleanInput, output);
      return { session, output };
    }

    // 2. FILTRO FUERA DE MATERIA (OUT-OF-SCOPE)
    if (
      lowerInput.includes('química') ||
      lowerInput.includes('chemistry') ||
      lowerInput.includes('matemáticas') ||
      lowerInput.includes('algebra') ||
      lowerInput.includes('biología')
    ) {
      const output: TutorResponseOutput = {
        student_message: 'That sounds interesting, but right now this session is dedicated to our English speaking practice! Let\'s return to our topic: what is your opinion about technology in modern communication?',
        tutor_action: 'practice',
        target_knowledge: state.current_concept_id,
        evidence: { demonstrated: false, confidence: 0.10, notes: 'Out-of-scope subject redirected.' },
        next_step: 'return_to_english_focus'
      };
      this.recordMessages(session, cleanInput, output);
      return { session, output };
    }

    // 3. EVALUACIÓN DE PRÓXIMA ACCIÓN MEDIANTE NEXT STEP SERVICE
    const evaluation = AITutorNextStepService.evaluate(state, cleanInput, session.scaffolding_level);
    session.scaffolding_level = evaluation.next_scaffolding;
    state.current_hint_level = evaluation.next_hint_level;

    if (evaluation.decision === 'hint') {
      state.hints_used_count += 1;
    }

    // 4. VERIFICACIÓN DE FALLBACK A PRERREQUISITOS
    const graph = AcademicGraph.build(KnowledgeVaultLoader.loadAll());
    if (state.consecutive_errors >= 2 && !state.temporary_support_target_id) {
      const mainNode = graph.getNode(state.main_target_id);
      if (mainNode) {
        const prereqs = [...mainNode.prerequisites, ...mainNode.builds_on];
        if (prereqs.length > 0) {
          state.temporary_support_target_id = prereqs[0];
          state.current_concept_id = prereqs[0];
        }
      }
    }

    // 5. CONSTRUCCIÓN DE CONTEXTO Y PROMPT
    const { contextDto, promptText } = AITutorContextBuilder.build(
      session,
      profile,
      competenciesMap,
      6
    );

    const fullPrompt = AITutorPromptBuilder.build(contextDto, cleanInput, evaluation.decision);

    // 6. INVOCACIÓN AL MOTOR DE IA PEDAGÓGICA (vía BaseAcademicGenerator)
    class TempTutorGenerator extends BaseAcademicGenerator<TutorResponseOutput> {
      protected parseOutput(raw: string): TutorResponseOutput {
        try {
          const clean = raw.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          return JSON.parse(clean);
        } catch {
          return {
            student_message: raw,
            tutor_action: 'practice',
            target_knowledge: state.current_concept_id,
            next_step: 'continue_dialogue'
          };
        }
      }
      protected validateOutput(): any {
        return { valid: true, errors: [], warnings: [], mismatches: [] };
      }
      public async call(prompt: string): Promise<string> {
        return this.callModel(prompt, BaseAcademicGenerator.DEFAULT_MODEL);
      }
    }

    const generator = new TempTutorGenerator();
    const rawResponse = await generator.call(fullPrompt);

    let parsedOutput: TutorResponseOutput;
    try {
      const clean = rawResponse.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
      parsedOutput = JSON.parse(clean);
    } catch {
      parsedOutput = {
        student_message: rawResponse,
        tutor_action: evaluation.decision,
        target_knowledge: state.current_concept_id,
        next_step: 'continue'
      };
    }

    // 7. ACTUALIZACIÓN DEL ESTADO ACADÉMICO
    state.questions_attempted += 1;

    if (parsedOutput.evidence?.demonstrated) {
      state.successful_attempts += 1;
      state.consecutive_correct += 1;
      state.consecutive_errors = 0;
      state.demonstrated_understanding = true;

      // Si estaba en fallback de prerrequisito y demostró comprensión, regresar al objetivo principal
      if (state.temporary_support_target_id) {
        state.temporary_support_target_id = undefined;
        state.current_concept_id = state.main_target_id;
      }

      // Si estaba en Exit Check, marcarlo como aprobado
      if (state.is_exit_check) {
        state.exit_check_passed = true;
      }
    } else {
      state.consecutive_errors += 1;
      state.consecutive_correct = 0;
      if (parsedOutput.evidence?.notes) {
        state.observed_errors.push(parsedOutput.evidence.notes);
      }
    }

    // Si la acción evaluada fue exit_check, marcar estado
    if (evaluation.decision === 'exit_check') {
      state.is_exit_check = true;
    }

    // 8. REGISTRAR MENSAJES EN EL HISTORIAL DE LA SESIÓN
    this.recordMessages(session, cleanInput, parsedOutput);
    session.updated_at = new Date().toISOString();

    return { session, output: parsedOutput };
  }

  /**
   * Concluye formalmente la sesión de tutoría y actualiza el MasteryEngine
   */
  static completeSession(
    session: TutorSessionEntity,
    profile: StudentAcademicProfileEntity,
    competenciesMap: Map<string, StudentCompetencyEntity>
  ): {
    session: TutorSessionEntity;
    summary: any;
    evidence: any;
    masteryResult: any;
  } {
    session.status = 'completed';
    session.completed_at = new Date().toISOString();

    const startMs = new Date(session.started_at).getTime();
    const endMs = new Date(session.completed_at).getTime();
    session.duration_seconds = Math.max(300, Math.round((endMs - startMs) / 1000));

    // 1. Extraer evidencia formativa
    const evidence = AITutorEvidenceExtractor.extract(session);
    session.evidence_id = evidence.id;

    // 2. Procesar evidencia a través del MasteryEngine (Regla de Prudencia)
    const masteryResult = AdaptiveLearningMasteryEngine.call(profile, competenciesMap, evidence);

    // 3. Generar resúmenes diferenciados para alumno y docente
    const summary = AITutorSessionSummaryService.generate(session, evidence);

    return {
      session,
      summary,
      evidence,
      masteryResult
    };
  }

  private static recordMessages(
    session: TutorSessionEntity,
    userText: string,
    assistantOutput: TutorResponseOutput
  ): void {
    const userMsg: TutorMessage = {
      id: `msg_u_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      session_id: session.id,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString()
    };

    const assistantMsg: TutorMessage = {
      id: `msg_a_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      session_id: session.id,
      role: 'assistant',
      content: assistantOutput.student_message,
      tutor_action: assistantOutput.tutor_action,
      hint_level: assistantOutput.hint_level_given,
      scaffolding_level: session.scaffolding_level,
      created_at: new Date().toISOString()
    };

    session.messages.push(userMsg, assistantMsg);
  }
}
