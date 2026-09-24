/**
 * @file contextBuilder.ts
 * @description Ensamblador de contexto curricular de alta fidelidad para el Motor de IA Pedagógica.
 * Transforma documentos recuperados de la Bóveda Curricular en un esquema estructurado y depurado,
 * evitando duplicaciones, previniendo alucinaciones y garantizando fundamentación académica rigurosa.
 */

import { KnowledgeVaultQueryService } from './queryService';
import { PersistedKnowledgeDocRecord } from './syncService';
import { CefrLevel, SkillType, DifficultyLevel } from './types';

export interface ContextBuilderParams {
  grade?: string;
  cefr?: CefrLevel | string;
  skill?: SkillType | string;
  language_function?: string;
  languageFunction?: string;
  topic?: string;
  difficulty?: DifficultyLevel | string;
  activity_pattern?: string;
  activityPattern?: string;
}

export interface StructuredAiContext {
  grade: string;
  cefrTarget: string;
  skill: string;
  learningObjectives: string[];
  subskills: string[];
  languageFunctions: {
    id: string;
    title: string;
    expressions: string[];
    pedagogicalGuidance: string[];
  }[];
  grammar: {
    progression: string[];
    keyStructures: string[];
  };
  vocabularyDomain: {
    domain: string;
    lexicalRange: string[];
    collocations: string[];
    phrasalVerbs: string[];
  };
  pedagogicalConstraints: string[];
  activityPatterns: {
    id: string;
    title: string;
    purpose: string;
    duration: string;
    teacherRole: string;
    studentRole: string;
    inputRequirements: string;
    outputRequirements: string;
  }[];
  assessmentCriteria: {
    rubricId: string;
    title: string;
    criteria: string[];
  }[];
  sourceReferences: {
    id: string;
    title: string;
  }[];
  consultedDocuments: {
    document_id: string;
    version: number;
    checksum: string;
    title: string;
    document_type: string;
  }[];
  rawDocumentsCount: number;
  toPromptContext(): string;
}

export class KnowledgeVaultContextBuilder {
  /**
   * Punto de entrada principal (compatible con Service Object de arquitectura limpia: ContextBuilder.call(params)).
   */
  static async call(params: ContextBuilderParams): Promise<StructuredAiContext> {
    return this.buildContext(params);
  }

  /**
   * Construye el contexto estructurado a partir del contenido validado de la Bóveda Curricular.
   */
  static async buildContext(params: ContextBuilderParams): Promise<StructuredAiContext> {
    const grade = params.grade || 'high_school_1';
    const cefr = (params.cefr || 'B1') as CefrLevel;
    const skill = (params.skill || 'speaking') as SkillType;
    const langFunc = params.language_function || params.languageFunction;
    const topic = params.topic;
    const targetPattern = params.activity_pattern || params.activityPattern;

    // 1. Recuperar nodos pedagógicos directos mediante QueryService
    const skillDocs = await KnowledgeVaultQueryService.call({
      grade,
      cefr,
      skill,
      topic,
      language_function: langFunc
    });

    // 2. Recuperar el Grade Map institucional
    const gradeMapDocs = await KnowledgeVaultQueryService.call({
      grade,
      status: 'approved'
    });
    const gradeMap = gradeMapDocs.find(d => d.document_id.toLowerCase().includes('highschool_1') || d.document_type === 'grade_map');

    // 3. Recuperar funciones de lenguaje correspondientes
    let langFuncDocs: PersistedKnowledgeDocRecord[] = [];
    if (langFunc) {
      langFuncDocs = await KnowledgeVaultQueryService.call({
        language_function: langFunc
      });
    }

    // 4. Recuperar vocabulario temático relevante
    let vocabDocs: PersistedKnowledgeDocRecord[] = [];
    if (topic) {
      const rawVocab = await KnowledgeVaultQueryService.call({
        grade,
        skill: 'vocabulary',
        topic
      });
      vocabDocs = rawVocab.filter(d => d.document_id.startsWith('vocab_') || d.document_type === 'vocabulary_set');
    }

    // 5. Recuperar gramática relacionada (filtrar nodos de gramática específicos)
    const rawGrammar = await KnowledgeVaultQueryService.call({
      grade,
      skill: 'grammar'
    });
    const grammarDocs = rawGrammar.filter(d => d.document_id.startsWith('grammar_') || d.document_type === 'grammar_progression');

    // 6. Recuperar patrones de actividad recomendados para la habilidad meta
    const allPatterns = await KnowledgeVaultQueryService.call({
      grade,
      status: 'approved'
    });
    const patternDocs = allPatterns.filter(d => 
      (d.document_type === 'activity_pattern' || d.document_id.startsWith('pattern_')) &&
      (!targetPattern ? (Array.isArray(d.skills) && d.skills.includes(skill)) : d.document_id.includes(targetPattern))
    );

    // 7. Recuperar rúbricas analíticas para la habilidad meta
    const allRubrics = await KnowledgeVaultQueryService.call({
      grade,
      skill,
      status: 'approved'
    });
    const rubricDocs = allRubrics.filter(d => 
      d.document_type === 'assessment_rubric' || 
      d.document_type === 'rubric' || 
      d.document_id.startsWith('rubric_')
    );

    // Consolidar IDs de fuentes citadas en todos los documentos utilizados
    const allDocs = [
      ...skillDocs,
      ...(gradeMap ? [gradeMap] : []),
      ...langFuncDocs,
      ...vocabDocs,
      ...grammarDocs,
      ...patternDocs,
      ...rubricDocs
    ];

    const sourceIdSet = new Set<string>();
    for (const d of allDocs) {
      if (Array.isArray(d.source_ids)) {
        for (const s of d.source_ids) {
          sourceIdSet.add(s);
        }
      }
    }

    // Obtener fichas bibliográficas de fuentes desde el índice
    const sourceReferences: { id: string; title: string }[] = [];
    for (const sid of sourceIdSet) {
      const srcDoc = await KnowledgeVaultQueryService.getById(sid);
      sourceReferences.push({
        id: sid,
        title: srcDoc ? srcDoc.title : sid
      });
    }

    // 8. Sintetizar y estructurar la información (Evitar dumps de texto crudo)
    const learningObjectives: string[] = [];
    const subskillsSet = new Set<string>();
    const pedagogicalConstraints: string[] = [];

    for (const doc of skillDocs) {
      const text = doc.content || '';
      if (Array.isArray(doc.metadata?.subskills)) {
        for (const sub of doc.metadata.subskills) subskillsSet.add(String(sub));
      }

      // Extraer oraciones de descriptores can-do del markdown
      const canDoMatches = text.match(/- (?:El estudiante|Student|Learner)[^\n]+/gi);
      if (canDoMatches) {
        for (const c of canDoMatches) {
          const clean = c.replace(/^- /, '').trim();
          if (!learningObjectives.includes(clean)) learningObjectives.push(clean);
        }
      }

      // Extraer pautas pedagógicas
      const pautasMatches = text.match(/- \*\*(?:Estructura|Prohibición|Requisito|Pauta)[^*]+\*\*[^\n]+/gi);
      if (pautasMatches) {
        for (const p of pautasMatches) {
          const clean = p.replace(/^- /, '').trim();
          if (!pedagogicalConstraints.includes(clean)) pedagogicalConstraints.push(clean);
        }
      }
    }

    // Si no se extrajeron objetivos específicos de los nodos, derivar del grade map
    if (learningObjectives.length === 0 && gradeMap) {
      const mapText = gradeMap.content || '';
      const gObjectives = mapText.match(/- \*\*Speaking:[^*]+\*\*[^\n]+/gi);
      if (gObjectives) {
        for (const obj of gObjectives) learningObjectives.push(obj.replace(/^- /, '').trim());
      }
    }

    // Procesar funciones del lenguaje (filtrando exclusivamente nodos funcionales)
    const actualLangFuncDocs = langFuncDocs.filter(d => d.document_type === 'language_function' || d.document_id.startsWith('func_'));
    const languageFunctions: StructuredAiContext['languageFunctions'] = [];
    for (const lf of actualLangFuncDocs) {
      const lfText = lf.content || '';
      const expressions: string[] = [];
      const guidance: string[] = [];

      const expMatches = lfText.match(/\*["“]([^"”]+)["”]\*/g);
      if (expMatches) {
        for (const e of expMatches) {
          const clean = e.replace(/^\*["“]|["”]\*$/g, '').trim();
          if (clean && !expressions.includes(clean)) expressions.push(clean);
        }
      }

      const guideMatches = lfText.match(/-\s*([A-ZÁÉÍÓÚ][^\n]+)/g);
      if (guideMatches) {
        for (const g of guideMatches) {
          const clean = g.replace(/^-\s*/, '').trim();
          if (clean.includes('Entrenar') || clean.includes('Conectar') || clean.includes('Prestar') || clean.includes('Fomentar') || clean.includes('Enseñar') || clean.includes('Dominio')) {
            if (!guidance.includes(clean)) guidance.push(clean);
          }
        }
      }

      languageFunctions.push({
        id: lf.document_id,
        title: lf.title,
        expressions,
        pedagogicalGuidance: guidance
      });
    }

    // Procesar gramática
    const grammarProgression: string[] = [];
    const keyStructures: string[] = [];
    for (const g of grammarDocs) {
      const gText = g.content || '';
      keyStructures.push(g.title);
      const structMatches = gText.match(/- \*\*[^*]+\*\*[^\n]+/g);
      if (structMatches) {
        for (const s of structMatches.slice(0, 3)) grammarProgression.push(s.replace(/^- /, '').trim());
      }
    }

    // Procesar vocabulario
    const lexicalRange: string[] = [];
    const collocations: string[] = [];
    const phrasalVerbs: string[] = [];
    for (const v of vocabDocs) {
      const vText = v.content || '';
      // 1. Colocaciones
      const colLineMatch = vText.match(/(?:Colocaciones|Collocations)[^\n]*\n+\s*-\s*\*([^*]+)\*/i);
      if (colLineMatch) {
        const items = colLineMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        for (const it of items) {
          if (it && !collocations.includes(it)) collocations.push(it);
        }
      }

      // 2. Phrasal verbs
      const pvLineMatch = vText.match(/(?:Phrasal Verbs)[^\n]*\n+\s*-\s*\*([^*]+)\*/i);
      if (pvLineMatch) {
        const items = pvLineMatch[1].split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
        for (const it of items) {
          if (it && !phrasalVerbs.includes(it)) phrasalVerbs.push(it);
        }
      }

      // 3. Términos clave entre backticks
      const backtickMatches = vText.match(/`([^`]+)`/g);
      if (backtickMatches) {
        for (const b of backtickMatches) {
          const clean = b.replace(/`/g, '').trim();
          if (clean && !lexicalRange.includes(clean)) lexicalRange.push(clean);
        }
      }
    }

    // Procesar patrones de actividad (máximo 2 representativos)
    const activityPatterns: StructuredAiContext['activityPatterns'] = [];
    for (const p of patternDocs.slice(0, 2)) {
      const pText = p.content || '';
      const purposeMatch = pText.match(/## 1\. Purpose\s*\n+([^\n#]+)/i);
      const durationMatch = pText.match(/## 5\. Approximate Duration\s*\n+([^\n#]+)/i);
      const teacherMatch = pText.match(/## 6\. Teacher Role\s*\n+([^\n#]+)/i);
      const studentMatch = pText.match(/## 7\. Student Role\s*\n+([^\n#]+)/i);
      const inputMatch = pText.match(/## 8\. Input Requirements\s*\n+([^\n#]+)/i);
      const outputMatch = pText.match(/## 9\. Output Requirements\s*\n+([^\n#]+)/i);

      activityPatterns.push({
        id: p.document_id,
        title: p.title,
        purpose: purposeMatch ? purposeMatch[1].trim() : 'Facilitar interacción comunicativa guiada.',
        duration: durationMatch ? durationMatch[1].trim() : `${p.metadata?.duration_minutes || 40} minutos`,
        teacherRole: teacherMatch ? teacherMatch[1].trim() : 'Facilitador y observador formativo.',
        studentRole: studentMatch ? studentMatch[1].trim() : 'Participante activo en lengua meta.',
        inputRequirements: inputMatch ? inputMatch[1].trim() : 'Guía de discusión y banco de expresiones.',
        outputRequirements: outputMatch ? outputMatch[1].trim() : 'Resolución dialogada o síntesis oral.'
      });
    }

    // Procesar criterios de evaluación
    const assessmentCriteria: StructuredAiContext['assessmentCriteria'] = [];
    for (const r of rubricDocs) {
      const rText = r.content || '';
      const criteriaHeaders = rText.match(/### Criterio \d+:\s*([^\n]+)/g);
      const criteria: string[] = [];
      if (criteriaHeaders) {
        for (const ch of criteriaHeaders) criteria.push(ch.replace(/^### Criterio \d+:\s*/, '').trim());
      }
      assessmentCriteria.push({
        rubricId: r.document_id,
        title: r.title,
        criteria: criteria.length > 0 ? criteria : ['Task Achievement', 'Fluency', 'Range', 'Accuracy']
      });
    }

    // Añadir restricciones obligatorias de iSchool
    pedagogicalConstraints.push('PROHIBICIÓN ESTRICTA: No utilizar marcas comerciales externas en los reactivos ni en la interfaz.');
    pedagogicalConstraints.push('ANDAMIAJE PEDAGÓGICO OBLIGATORIO: Ofrecer modelos de frases funcionales antes de exigir producción oral autónoma.');
    pedagogicalConstraints.push('CALIBRACIÓN CEFR: El lenguaje y los distractores deben respetar el nivel objetivo B1 → B2 sin exceder la dificultad.');

    // Ensamblar catálogo deduplicado de documentos curriculares consultados para trazabilidad
    const seenDocIds = new Set<string>();
    const consultedDocuments: StructuredAiContext['consultedDocuments'] = [];
    for (const d of allDocs) {
      if (!seenDocIds.has(d.document_id)) {
        seenDocIds.add(d.document_id);
        consultedDocuments.push({
          document_id: d.document_id,
          version: typeof d.version === 'number' ? d.version : 1,
          checksum: d.checksum || '',
          title: d.title || d.document_id,
          document_type: d.document_type || 'unknown'
        });
      }
    }

    const result: StructuredAiContext = {
      grade,
      cefrTarget: cefr,
      skill,
      learningObjectives: learningObjectives.length > 0 ? learningObjectives : [`Desarrollar fluidez comunicativa en ${skill} para nivel ${cefr}`],
      subskills: Array.from(subskillsSet),
      languageFunctions,
      grammar: {
        progression: grammarProgression,
        keyStructures
      },
      vocabularyDomain: {
        domain: topic || 'general_academic',
        lexicalRange: lexicalRange.slice(0, 10),
        collocations: collocations.slice(0, 8),
        phrasalVerbs: phrasalVerbs.slice(0, 6)
      },
      pedagogicalConstraints,
      activityPatterns,
      assessmentCriteria,
      sourceReferences,
      consultedDocuments,
      rawDocumentsCount: allDocs.length,

      /**
       * Genera el bloque de contexto limpio listo para ser inyectado en el prompt de la IA.
       */
      toPromptContext(): string {
        return [
          '================================================================',
          'PEDAGOGICAL KNOWLEDGE VAULT - ACADEMIC CONTEXT (iSchool)',
          '================================================================',
          `GRADE: ${grade.toUpperCase()}`,
          `CEFR TARGET: ${cefr.toUpperCase()} (Entry B1 -> Target B2)`,
          `SKILL: ${skill.toUpperCase()}`,
          `SUBSKILLS: ${Array.from(subskillsSet).join(', ') || 'General interaction'}`,
          '',
          '--- LEARNING OBJECTIVES & CAN-DO STATEMENTS ---',
          ...learningObjectives.map(o => `• ${o}`),
          '',
          '--- LANGUAGE FUNCTIONS & TARGET REPERTOIRE ---',
          ...languageFunctions.flatMap(lf => [
            `[${lf.title}]`,
            '  Model Expressions:',
            ...lf.expressions.map(e => `    - "${e}"`),
            '  Pedagogical Guidance:',
            ...lf.pedagogicalGuidance.map(g => `    - ${g}`)
          ]),
          '',
          '--- GRAMMAR PROGRESSION & STRUCTURES ---',
          ...keyStructures.map(ks => `• Focus: ${ks}`),
          ...grammarProgression.map(gp => `  - ${gp}`),
          '',
          '--- VOCABULARY DOMAIN & COLLOCATIONS ---',
          `Domain: ${topic || 'Technology & Society'}`,
          'Recommended Collocations & Expressions:',
          ...collocations.map(c => `• "${c}"`),
          ...lexicalRange.map(l => `• ${l}`),
          '',
          '--- RECOMMENDED ACTIVITY PATTERNS ---',
          ...activityPatterns.map(ap => 
            `[Pattern: ${ap.title}]\n` +
            `  Purpose: ${ap.purpose}\n` +
            `  Duration: ${ap.duration}\n` +
            `  Teacher Role: ${ap.teacherRole}\n` +
            `  Student Role: ${ap.studentRole}\n` +
            `  Input: ${ap.inputRequirements}\n` +
            `  Output: ${ap.outputRequirements}`
          ),
          '',
          '--- ASSESSMENT CRITERIA (CEFR ALIGNED) ---',
          ...assessmentCriteria.flatMap(ac => [
            `Rubric: ${ac.title}`,
            ...ac.criteria.map(c => `• ${c}`)
          ]),
          '',
          '--- PEDAGOGICAL CONSTRAINTS ---',
          ...pedagogicalConstraints.map(c => `⚠️ ${c}`),
          '',
          '--- AUTHORITATIVE SOURCE REFERENCES ---',
          ...sourceReferences.map(s => `• [${s.id}] ${s.title}`),
          '================================================================'
        ].join('\n');
      }
    };

    return result;
  }
}
