/**
 * @file studentContextBuilder.ts
 * @description Constructor de contexto académico mínimo y estructurado para inferencia con IA (Fase 7).
 * Implementa el principio estricto de PRIVACY BY DESIGN:
 * - NUNCA expone información personal identificable (PII): ni nombres reales, ni correos, ni teléfonos, ni datos médicos o familiares.
 * - Inyecta exclusivamente atributos pedagógicos funcionales: nivel competencial, brechas, fortalezas y requerimientos de andamiaje.
 */

import {
  StudentAcademicProfileEntity,
  StudentCompetencyEntity,
  StudentAcademicContext,
  AdaptationType
} from './types';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';
import { AcademicGraph } from '../knowledgeVault/academicGraph';

export class AdaptiveLearningStudentContextBuilder {
  /**
   * Genera el DTO y el texto formateado de contexto académico sin PII.
   */
  static build(
    profile: StudentAcademicProfileEntity,
    competenciesMap: Map<string, StudentCompetencyEntity>,
    targetSkill: string,
    targetCefr: string,
    adaptationType: AdaptationType,
    relevantKnowledgeUnitIds: string[] = []
  ): { contextDto: StudentAcademicContext; promptText: string } {
    const cleanSkill = targetSkill.toLowerCase();
    const graph = AcademicGraph.build(KnowledgeVaultLoader.loadAll());

    // 1. Extraer nivel de la habilidad
    const skillSummary = (profile as any)[cleanSkill];
    const estimatedSkillLevel = skillSummary?.level || profile.overall_estimated_level || 'A1';

    // 2. Extraer fortalezas, en desarrollo y necesidades de apoyo
    const strengths: string[] = [];
    const developing: string[] = [];
    const needsSupport: string[] = [];

    for (const comp of competenciesMap.values()) {
      if (comp.skill.toLowerCase() !== cleanSkill) continue;
      const node = graph.getNode(comp.knowledge_unit_id);
      const title = node?.title || comp.knowledge_unit_id;

      if (comp.mastery_state === 'mastered' || comp.mastery_state === 'secure') {
        if (strengths.length < 3) strengths.push(title);
      } else if (comp.mastery_state === 'developing') {
        if (developing.length < 3) developing.push(title);
      } else if (comp.mastery_state === 'needs_review' || comp.mastery_state === 'introduced') {
        if (needsSupport.length < 3) needsSupport.push(title);
      }
    }

    // 3. Revisar prerrequisitos relevantes
    const prereqStatus: StudentAcademicContext['relevant_prerequisites_status'] = [];
    for (const unitId of relevantKnowledgeUnitIds) {
      const node = graph.getNode(unitId);
      if (!node) continue;
      for (const preId of [...node.prerequisites, ...node.builds_on]) {
        const comp = competenciesMap.get(preId);
        prereqStatus.push({
          prerequisite_id: preId,
          state: comp ? comp.mastery_state : 'not_assessed'
        });
      }
    }

    // 4. Determinar requerimientos de andamiaje o extensión
    let scaffoldingReqs: string[] | undefined;
    let extensionReqs: string[] | undefined;

    if (adaptationType === 'support') {
      scaffoldingReqs = [
        'Sentence starters and structural frames (e.g., "In my view, ...", "I believe that ... because ...")',
        'Bilingual or contextualized word bank highlighting topic keywords and functional connectors',
        'Model response / exemplar demonstration before production',
        'Chunked instructions into micro-steps to prevent cognitive overload',
        'Visual prompts or graphic organizers to scaffold ideas'
      ];
    } else if (adaptationType === 'extension') {
      extensionReqs = [
        'Minimal explicit scaffolding; encourage autonomous idea generation',
        'Higher lexical range requirement (idiomatic expressions, complex collocations, formal nuance)',
        'Mandatory counterargumentation and multi-perspective reasoning ("While X is often asserted, Y suggests...")',
        'Increased discourse length and sustained oral / written fluency',
        'Cognitively challenging evaluative criteria (critical analysis, synthesis)'
      ];
    }

    // 5. Construir DTO limpio (CERO PII)
    const contextDto: StudentAcademicContext = {
      grade: profile.grade,
      skill: targetSkill,
      estimated_skill_level: estimatedSkillLevel,
      target_level: targetCefr,
      adaptation_type: adaptationType,
      strengths: strengths.length > 0 ? strengths : ['Basic vocabulary recognition'],
      developing_points: developing.length > 0 ? developing : ['Giving reasons and elaborating'],
      needs_support_points: needsSupport.length > 0 ? needsSupport : ['Asking for clarification'],
      relevant_prerequisites_status: prereqStatus,
      scaffolding_requirements: scaffoldingReqs,
      extension_requirements: extensionReqs
    };

    // 6. Formatear bloque textual para el prompt
    const lines: string[] = [
      '### STUDENT ACADEMIC CONTEXT (PRIVACY BY DESIGN) ###',
      `Grade: ${contextDto.grade}`,
      `Target Skill: ${contextDto.skill}`,
      `Current Estimated Level: ${contextDto.estimated_skill_level}`,
      `Target Curriculum Level: ${contextDto.target_level}`,
      `Requested Adaptation: ${contextDto.adaptation_type.toUpperCase()}`,
      `Known Strengths: ${contextDto.strengths.join(', ')}`,
      `Developing Competencies: ${contextDto.developing_points.join(', ')}`,
      `Needs Support / Gaps: ${contextDto.needs_support_points.join(', ')}`
    ];

    if (contextDto.scaffolding_requirements) {
      lines.push('MANDATORY SCAFFOLDING PROVISIONS:');
      for (const req of contextDto.scaffolding_requirements) {
        lines.push(`- ${req}`);
      }
      lines.push('NOTE: Do NOT lower the overarching educational objective or change the lesson theme. Provide scaffolding as a bridge toward grade-level mastery.');
    }

    if (contextDto.extension_requirements) {
      lines.push('MANDATORY EXTENSION PROVISIONS:');
      for (const req of contextDto.extension_requirements) {
        lines.push(`- ${req}`);
      }
      lines.push('NOTE: Increase depth, nuance, and critical reasoning. Do NOT simply append "more questions" of the same difficulty.');
    }

    return {
      contextDto,
      promptText: lines.join('\n')
    };
  }
}
