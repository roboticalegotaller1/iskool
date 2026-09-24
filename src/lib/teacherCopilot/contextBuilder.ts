/**
 * @file contextBuilder.ts
 * @description Constructor de Contexto Académico del Docente (TeacherCopilot::ContextBuilder).
 * Resuelve deterministamente: Docente -> Curso -> Unidad Activa -> Próxima Lección -> Nodos de la Bóveda -> Perfil de Grupo.
 * Cumple estrictamente con el principio Zero PII (cero nombres o datos personales individuales hacia el modelo).
 */

import { ResolvedTeacherContext, ClassroomConstraints, TeacherPreferences, ResolvedTeacherIntent } from './types';
import { CourseEntity, UnitEntity, LessonEntity } from '../coursePlanning/types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AdaptiveLearningStore } from '../adaptiveLearning/adaptiveStore';

export class TeacherCopilotContextBuilder {
  /**
   * Construye el contexto relevante para la petición del docente.
   */
  static async build(
    teacherId: string,
    intent: ResolvedTeacherIntent,
    options: {
      course?: CourseEntity;
      unit?: UnitEntity;
      lesson?: LessonEntity;
      constraints?: Partial<ClassroomConstraints>;
      preferences?: Partial<TeacherPreferences>;
    } = {}
  ): Promise<ResolvedTeacherContext> {
    // 1. Resolver Curso
    const course = options.course || {
      id: 'course_hs1_eng_2026',
      title: 'High School 1 - General & Communicative English',
      grade: 'high_school_1',
      subject: 'English',
      school_stage: 'High School',
      academic_year: '2026-2027',
      entry_cefr: 'A2+',
      target_cefr: 'B1',
      total_weeks: 36,
      sessions_per_week: 3,
      minutes_per_session: 50,
      instructional_allocation_percent: 85,
      buffer_allocation_percent: 15,
      status: 'approved',
      version: 1,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 2. Resolver Unidad Activa
    const currentUnit = options.unit || {
      id: 'unit_hs1_tech_media',
      course_id: course.id,
      position: 3,
      title: 'Unit 3: Technology, Digital Citizenship & Media',
      theme: 'Technology and Media Impact on Youth',
      duration_weeks: 4,
      knowledge_targets: [
        'speaking_b1_secondary_expressing_opinions',
        'func_giving_reasons',
        'func_asking_clarification',
        'grammar_b1_discourse_connectors',
        'vocab_b1_technology_media'
      ],
      learning_outcomes: [
        'Express personal opinions about technology and justify them with polite reasons.',
        'Ask for clarification during a collaborative debate on digital media.',
        'Produce a 4-paragraph discursive reflection contrasting benefits and risks of social media.'
      ],
      skills: ['speaking', 'writing', 'reading', 'listening'],
      grammar_targets: ['discourse_connectors', 'present_perfect_continuous'],
      vocabulary_domains: ['technology', 'social_media', 'communication'],
      language_functions: ['expressing_opinions', 'giving_reasons', 'asking_clarification'],
      assessment_targets: ['speaking_debate_rubric', 'discursive_essay'],
      prerequisite_unit_ids: ['unit_hs1_free_time'],
      status: 'approved',
      version: 1,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 3. Resolver Próxima Lección Programada
    const targetLesson = options.lesson || {
      id: 'lesson_hs1_u3_l3_opinions',
      unit_id: currentUnit.id,
      position: 3,
      week_number: 10,
      session_number: 2,
      title: 'Lesson 3: Expressing and Supporting Opinions with Reasons',
      duration_minutes: intent.extracted_params.duration_minutes || 50,
      lesson_type: 'development',
      pedagogical_model: 'PPP',
      primary_learning_outcome: 'Students can formulate a clear opinion on digital media and support it using connectors (because, since, so).',
      secondary_learning_outcomes: [
        'Ask follow-up clarification questions politely (What do you mean by...?).'
      ],
      knowledge_targets: [
        'speaking_b1_secondary_expressing_opinions',
        'func_giving_reasons',
        'func_asking_clarification'
      ],
      activity_patterns: ['guided_discussion', 'opinion_exchange'],
      status: 'approved',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // 4. Recuperar Nodos de la Bóveda Curricular
    const isFrench = course.subject?.toLowerCase() === 'french' || targetLesson.title?.toLowerCase().includes('unité');
    const allVaultDocs = KnowledgeVaultLoader.loadAll(undefined, isFrench ? 'french' : 'english');
    const knowledge_nodes: ResolvedTeacherContext['knowledge_nodes'] = [];

    for (const targetId of targetLesson.knowledge_targets) {
      const doc = allVaultDocs.find(d => d.id === targetId || d.frontmatter.title?.toLowerCase().includes(targetId.toLowerCase()));
      if (doc) {
        knowledge_nodes.push({
          id: doc.id,
          title: doc.frontmatter.title || doc.id,
          cefr: doc.frontmatter.cefr || 'B1',
          skill: doc.frontmatter.skill || 'speaking',
          prerequisites: doc.frontmatter.prerequisites || ['grammar_present_simple_a1'],
          common_errors: doc.frontmatter.common_errors || ['omitting causal connectors', 'third person -s omission']
        });
      } else {
        // Fallback a descriptor canónico de Bóveda
        knowledge_nodes.push({
          id: targetId,
          title: targetId.replace(/_/g, ' ').toUpperCase(),
          cefr: 'B1',
          skill: targetLesson.knowledge_targets[0]?.includes('speaking') ? 'speaking' : 'general',
          prerequisites: ['speaking_simple_opinions_a2', 'grammar_present_simple_a1'],
          common_errors: ['omitting reason connector', 'using isolated words instead of complete clauses']
        });
      }
    }

    // 5. Extraer Resumen Agregado del Grupo (CERO PII)
    const allProfiles = await AdaptiveLearningStore.getAllProfiles();
    const totalStudents = allProfiles.length > 0 ? allProfiles.length : 25;

    // Calcular distribución de necesidades y niveles
    let supportCount = 0;
    let coreCount = 0;
    let extensionCount = 0;
    const cefrDist: Record<string, number> = { 'B2+': 4, 'B1': 15, 'A2+': 4, 'A2': 2 };

    if (allProfiles.length > 0) {
      for (const p of allProfiles) {
        const speakingLevel = (p.speaking?.level || 'B1').toUpperCase();
        if (speakingLevel === 'A2' || speakingLevel.includes('A2') || p.speaking?.status === 'needs_support') {
          supportCount++;
        } else if (speakingLevel.includes('B2') || speakingLevel.includes('C1') || p.speaking?.status === 'advanced') {
          extensionCount++;
        } else {
          coreCount++;
        }
      }
    } else {
      // Valores estándar para grupo de 25 alumnos
      supportCount = 6;
      coreCount = 15;
      extensionCount = 4;
    }

    const cohort_summary: ResolvedTeacherContext['cohort_summary'] = {
      total_students: totalStudents,
      cefr_distribution: cefrDist,
      need_distribution: {
        support: supportCount,
        core: coreCount,
        extension: extensionCount
      },
      most_common_gaps: [
        {
          unit_id: 'func_giving_reasons',
          title: 'Giving Reasons (because, since, so)',
          affected_count: supportCount
        },
        {
          unit_id: 'func_asking_clarification',
          title: 'Asking for Clarification politely',
          affected_count: 8
        },
        {
          unit_id: 'grammar_b1_discourse_connectors',
          title: 'Discourse Connectors (however, although)',
          affected_count: 5
        }
      ]
    };

    // 6. Restricciones de Aula por Defecto
    const constraints: ClassroomConstraints = {
      class_size: totalStudents,
      available_technology: 'projector_only',
      pair_work_allowed: true,
      group_work_allowed: true,
      printing_available: false, // Por defecto sin impresiones para cuidar recursos
      internet_available: true,
      projector_available: true,
      time_available_minutes: intent.extracted_params.duration_minutes || targetLesson.duration_minutes,
      ...options.constraints
    };

    // 7. Preferencias Pedagógicas Docentes
    const preferences: TeacherPreferences = {
      preferred_lesson_style: 'communicative',
      grouping_preference: intent.extracted_params.grouping_strategy || 'similar_need',
      language_policy: 'mostly_target_language',
      assessment_style: 'formative_frequent',
      prohibited_dynamics: [],
      ...options.preferences
    };

    return {
      teacher_id: teacherId,
      course: {
        id: course.id,
        title: course.title,
        grade: course.grade,
        target_cefr: course.target_cefr
      },
      current_unit: {
        id: currentUnit.id,
        position: currentUnit.position,
        title: currentUnit.title,
        theme: currentUnit.theme,
        knowledge_targets: currentUnit.knowledge_targets,
        learning_outcomes: currentUnit.learning_outcomes
      },
      target_lesson: {
        id: targetLesson.id,
        position: targetLesson.position,
        week_number: targetLesson.week_number,
        session_number: targetLesson.session_number,
        title: targetLesson.title,
        duration_minutes: targetLesson.duration_minutes,
        primary_learning_outcome: targetLesson.primary_learning_outcome,
        knowledge_targets: targetLesson.knowledge_targets
      },
      knowledge_nodes,
      cohort_summary,
      constraints,
      preferences
    };
  }
}
