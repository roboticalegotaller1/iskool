/**
 * @file promptBuilder.ts
 * @description Capa responsable de construir el prompt versionado para el Motor de IA Pedagógica.
 * Separa de manera estricta:
 * 1. SYSTEM RULES
 * 2. ACADEMIC CONTEXT
 * 3. GENERATION REQUEST
 * 4. OUTPUT SCHEMA
 *
 * REGLA ARQUITECTÓNICA VITAL:
 * No introduce conocimiento pedagógico hardcodeado ("B1 students should know...").
 * Todo el conocimiento emana exclusivamente del Knowledge Vault institucional.
 */

import { AcademicGenerationRequest } from './request';
import { RetrievedAcademicContext } from './contextService';

export class AcademicGenerationPromptBuilder {
  public static readonly PROMPT_VERSION = '1.0.0';

  /**
   * Construye el prompt completo ensamblado a partir de la solicitud y el contexto recuperado.
   */
  static build(request: AcademicGenerationRequest, retrieved: RetrievedAcademicContext): string {
    const sections = [
      this.buildSystemRules(),
      '',
      this.buildAcademicContext(retrieved),
      '',
      this.buildGenerationRequest(request),
      '',
      this.buildOutputSchema(request)
    ];

    return sections.join('\n');
  }

  /**
   * SECCIÓN 1: SYSTEM RULES
   * Instrucción base versionada que subordina el modelo a la autoridad curricular de iSchool.
   */
  static buildSystemRules(): string {
    return [
      '### SECTION 1: SYSTEM RULES ###',
      'You are an educational content generation engine for iSchool.',
      'You must generate educational content using the academic context supplied by iSchool.',
      'The supplied Knowledge Vault context is authoritative for:',
      '- grade level',
      '- CEFR level',
      '- learning objectives',
      '- language functions',
      '- grammar expectations',
      '- vocabulary expectations',
      '- skill progression',
      '- assessment criteria',
      '',
      'MANDATORY BEHAVIORAL CONSTRAINTS:',
      '1. Do not increase or decrease the requested level without explicit instruction.',
      '2. Do not invent curriculum requirements that contradict the supplied context.',
      '3. Generate original, engaging, pedagogically sound educational content.',
      '4. Do not reproduce copyrighted textbook exercises or passages.',
      '5. Strictly adhere to the institutional white-label policy (never mention third-party commercial brands).',
      '6. Return the response using the requested structured JSON schema ONLY. No conversational preambles.'
    ].join('\n');
  }

  /**
   * SECCIÓN 2: ACADEMIC CONTEXT
   * Inyección del contexto curricular extraído directamente del Knowledge Vault.
   */
  static buildAcademicContext(retrieved: RetrievedAcademicContext): string {
    return [
      '### SECTION 2: ACADEMIC CONTEXT (AUTHORITATIVE KNOWLEDGE VAULT) ###',
      'Below is the official curricular context extracted from the iSchool Knowledge Vault.',
      'You MUST ground your activity entirely within these bounds:',
      '',
      retrieved.prompt_context_text
    ].join('\n');
  }

  /**
   * SECCIÓN 3: GENERATION REQUEST
   * Especificación de la actividad pedagógica solicitada por el docente o sistema.
   */
  static buildGenerationRequest(request: AcademicGenerationRequest): string {
    const lines = [
      '### SECTION 3: GENERATION REQUEST ###',
      'Design an individualized, classroom-ready educational activity according to these exact specifications:',
      `- Grade: ${request.grade}`,
      `- CEFR Target: ${request.cefr}`,
      `- Primary Skill: ${request.skill}`,
      `- Topic / Domain: ${request.topic}`,
      `- Language Function: ${request.language_function}`,
      `- Activity Pattern: ${request.activity_type}`,
      `- Total Duration: ${request.duration_minutes} minutes`,
      `- Adaptation Mode: ${request.adaptation.toUpperCase()}`
    ];

    // Inyección de contexto académico sin PII (Privacy by Design)
    if (request.extraParams.student_context_text) {
      lines.push('');
      lines.push(String(request.extraParams.student_context_text));
    }

    lines.push('');
    lines.push('PEDAGOGICAL REQUIREMENTS FOR THIS ACTIVITY:');
    lines.push(`1. The activity must actively train the student to use the expressions provided in the language function "${request.language_function}".`);
    lines.push(`2. Target timing must match exactly ${request.duration_minutes} minutes distributed across warm-up, core task, and wrap-up phases.`);

    if (request.adaptation === 'support') {
      lines.push('3. MANDATORY SUPPORT ADAPTATION:');
      lines.push('   - Provide structured sentence starters and conversational frames for the student.');
      lines.push('   - Include an explicit word bank with functional expressions and vocabulary prompts.');
      lines.push('   - Provide a clear model answer or sample exchange demonstrating successful task completion.');
      lines.push('   - Chunk instructions into small, sequential steps to reduce cognitive load.');
      lines.push('   - Maintain the SAME lesson topic and learning objective as the class; scaffold as a bridge to grade-level competence.');
    } else if (request.adaptation === 'extension') {
      lines.push('3. MANDATORY EXTENSION ADAPTATION:');
      lines.push('   - Challenge the student with higher cognitive complexity, critical thinking, and nuanced evaluation.');
      lines.push('   - Require counterargumentation, contrasting perspectives, and formal justification.');
      lines.push('   - Expect higher lexical range (idiomatic collocations, sophisticated discourse markers).');
      lines.push('   - Reduce explicit sentence starters to encourage autonomous, extended communicative production.');
      lines.push('   - Do NOT simply provide "more questions" of the same difficulty; elevate analytical depth.');
    } else {
      lines.push('3. Include explicit scaffolding so students of the requested CEFR level feel supported before communicative production.');
    }

    return lines.join('\n');
  }

  /**
   * SECCIÓN 4: OUTPUT SCHEMA
   * Esquema JSON estricto requerido.
   */
  static buildOutputSchema(request: AcademicGenerationRequest): string {
    return [
      '### SECTION 4: OUTPUT SCHEMA ###',
      'You must respond with a single valid JSON object strictly adhering to this structure:',
      '{',
      '  "title": "Clear, engaging title for the activity",',
      `  "grade": "${request.grade}",`,
      `  "cefr": "${request.cefr}",`,
      `  "skill": "${request.skill}",`,
      `  "topic": "${request.topic}",`,
      `  "language_function": "${request.language_function}",`,
      `  "activity_type": "${request.activity_type}",`,
      `  "duration_minutes": ${request.duration_minutes},`,
      '  "learning_objective": "Explicit Can-Do statement grounded in the provided objectives",',
      '  "student_instructions": "Clear, age-appropriate step-by-step instructions for the student in English",',
      '  "teacher_instructions": "Pedagogical guidance, classroom setup, timing tips and monitoring notes for the teacher",',
      '  "language_support": {',
      '    "useful_phrases": ["Array of functional model phrases from the language function context"],',
      '    "grammar_support": ["Array of grammar structures to reinforce during the activity"],',
      '    "vocabulary_support": ["Array of topic-specific vocabulary and collocations to activate"]',
      '  },',
      '  "activity_steps": [',
      '    {',
      '      "phase": "warm_up | core_task | wrap_up",',
      '      "duration_minutes": 5,',
      '      "teacher_instructions": "What the teacher does during this phase",',
      '      "student_instructions": "What the students do during this phase"',
      '    }',
      '  ],',
      '  "assessment": {',
      '    "criteria": ["3 to 4 specific, observable evaluation criteria derived from the CEFR rubric context"],',
      '    "rubric_snapshot": ["Brief performance indicators for meeting expectations"]',
      '  }',
      '}',
      '',
      'CRITICAL: Return ONLY raw valid JSON. Do not enclose in markdown ticks if not required, or if you do, use ```json ... ```.'
    ].join('\n');
  }
}
