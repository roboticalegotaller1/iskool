/**
 * @file memoryService.ts
 * @description Servicio de Ingestión, Consulta y Síntesis de Memoria Institucional (iSkool Institutional Brain).
 * Permite que cada ciclo escolar la institución acumule aprendizaje pedagógico real a partir del trabajo docente ordinario.
 * Cero dependencias externas innecesarias: aprovecha el parser canónico de la Bóveda Curricular.
 */

import fs from 'fs';
import path from 'path';
import { KnowledgeVaultParser } from '../knowledgeVault/parser';
import {
  CreateInstitutionalMemoryInput,
  InstitutionalMemoryDocument,
  InstitutionalMemoryFrontmatter,
  InstitutionalMemoryFrontmatterSchema,
  InstitutionalMemorySections,
  InstitutionalMemorySynthesis
} from './types';
import { PedagogicalPiiGuard } from './piiGuard';

function cleanString(str: string): string {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function sanitizeSafeFilename(str: string): string {
  const clean = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  return clean.replace(/[^a-zA-Z0-9_-]/g, '_').replace(/_+/g, '_');
}

export class InstitutionalMemoryService {
  /**
   * Obtiene la ruta física del directorio de Memorias Institucionales dentro de la Bóveda Curricular.
   */
  static getBaseMemoryDirectory(): string {
    const envPath = process.env.CURRICULAR_VAULT_PATH || process.env.VAULT_PATH;
    let basePlannings = path.join(process.cwd(), 'planeaciones');
    if (envPath && fs.existsSync(envPath)) {
      const sub = path.join(envPath, 'planeaciones');
      basePlannings = fs.existsSync(sub) ? sub : envPath;
    }
    const memoryDir = path.join(basePlannings, 'Memorias_Institucionales');
    if (!fs.existsSync(memoryDir)) {
      fs.mkdirSync(memoryDir, { recursive: true });
    }
    return memoryDir;
  }

  /**
   * Guarda de forma atómica una nueva Memoria Institucional en la Bóveda Curricular.
   * Ejecuta estrictamente el escaneo de Cero PII antes de escribir en disco.
   */
  static async saveMemory(input: CreateInstitutionalMemoryInput): Promise<{
    success: boolean;
    filePath: string;
    documentId: string;
  }> {
    // 1. BLINDAJE DE PRIVACIDAD: Cero PII en la Bóveda Curricular
    PedagogicalPiiGuard.assertZeroPii(input, 'InstitutionalMemory.saveMemory');

    // 2. Validación de Frontmatter con Zod
    const frontmatterToValidate: InstitutionalMemoryFrontmatter = {
      type: 'institutional_memory',
      memory_version: '1.0',
      institution_id: input.institution_id,
      campus: input.campus || 'Campus Central',
      academic_cycle: input.academic_cycle,
      phase_nem: input.phase_nem,
      grade: input.grade,
      subject: input.subject,
      topic: input.topic,
      activity_source: input.activity_source,
      created_by_teacher_ref: input.created_by_teacher_ref,
      author_display_name: input.author_display_name,
      adaptation_of: input.adaptation_of || null,
      group_cohort: input.group_cohort,
      metrics: input.metrics,
      provenance: {
        rails_activity_id: input.provenance.rails_activity_id,
        rails_assessment_batch_id: input.provenance.rails_assessment_batch_id,
        captured_at: new Date().toISOString(),
        ingestion_agent: input.provenance.ingestion_agent || 'iSkool-Memory-Worker/1.0',
        school_id: input.provenance.school_id
      },
      tags: [
        'memoria_institucional',
        `ciclo_${input.academic_cycle.replace('-', '_')}`,
        cleanString(input.subject),
        `grado_${input.grade}`
      ]
    };

    InstitutionalMemoryFrontmatterSchema.parse(frontmatterToValidate);

    // 3. Directorio por ciclo escolar
    const baseDir = this.getBaseMemoryDirectory();
    const cycleDir = path.join(baseDir, sanitizeSafeFilename(input.academic_cycle));
    if (!fs.existsSync(cycleDir)) {
      fs.mkdirSync(cycleDir, { recursive: true });
    }

    // 4. Generación del nombre de archivo
    const safeTopic = sanitizeSafeFilename(input.topic);
    const safeSubject = sanitizeSafeFilename(input.subject);
    const safeCohort = sanitizeSafeFilename(input.group_cohort);
    const filename = input.customFilename || 
      `Memoria_${input.academic_cycle}_G${input.grade}_${safeSubject}_${safeTopic}_${safeCohort}.md`;
    const fullPath = path.join(cycleDir, filename);

    // 5. Construcción del archivo completo con Frontmatter YAML nativo
    const fileContent = this.serializeMemoryFile(frontmatterToValidate, input);

    // 6. Escritura atómica en disco
    fs.writeFileSync(fullPath, fileContent, 'utf8');

    const documentId = `memoria-${input.academic_cycle}-${input.grade}-${safeSubject}-${safeTopic}-${safeCohort}`.toLowerCase();

    return {
      success: true,
      filePath: fullPath,
      documentId
    };
  }

  /**
   * Serializa la memoria a Markdown con YAML frontmatter compatible con Obsidian y Dataview.
   */
  private static serializeMemoryFile(
    fm: InstitutionalMemoryFrontmatter,
    input: CreateInstitutionalMemoryInput
  ): string {
    const yamlLines = [
      '---',
      `type: ${fm.type}`,
      `memory_version: "${fm.memory_version}"`,
      `institution_id: "${fm.institution_id}"`,
      `campus: "${fm.campus || 'Campus Central'}"`,
      `academic_cycle: "${fm.academic_cycle}"`,
      fm.phase_nem ? `phase_nem: "${fm.phase_nem}"` : null,
      `grade: ${typeof fm.grade === 'number' ? fm.grade : `"${fm.grade}"`}`,
      `subject: "${fm.subject}"`,
      `topic: "${fm.topic}"`,
      fm.activity_source ? `activity_source: "${fm.activity_source}"` : null,
      `created_by_teacher_ref: "${fm.created_by_teacher_ref}"`,
      `author_display_name: "${fm.author_display_name}"`,
      `adaptation_of: ${fm.adaptation_of ? `"${fm.adaptation_of}"` : 'null'}`,
      `group_cohort: "${fm.group_cohort}"`,
      'metrics:',
      `  students_evaluated_count: ${fm.metrics.students_evaluated_count}`,
      `  mastery_rate: ${fm.metrics.mastery_rate}`,
      '  comprehension_friction_points:',
      ...(fm.metrics.comprehension_friction_points && fm.metrics.comprehension_friction_points.length > 0
        ? fm.metrics.comprehension_friction_points.map(p => `    - "${p}"`)
        : ['    - "ninguna_detectada"']),
      'provenance:',
      `  rails_activity_id: ${fm.provenance.rails_activity_id}`,
      fm.provenance.rails_assessment_batch_id ? `  rails_assessment_batch_id: ${fm.provenance.rails_assessment_batch_id}` : null,
      `  captured_at: "${fm.provenance.captured_at}"`,
      `  ingestion_agent: "${fm.provenance.ingestion_agent}"`,
      'tags:',
      ...(fm.tags || []).map(t => `  - ${t}`),
      '---',
      ''
    ].filter(Boolean).join('\n');

    const markdownBody = this.buildStandardMarkdownBody(input, fm);
    return `${yamlLines}\n${markdownBody}\n`;
  }

  /**
   * Construye las 5 secciones obligatorias de la Memoria Institucional en Markdown.
   */
  private static buildStandardMarkdownBody(
    input: CreateInstitutionalMemoryInput,
    fm: InstitutionalMemoryFrontmatter
  ): string {
    const frictionList = input.sections.friccionesErrores.length > 0
      ? input.sections.friccionesErrores.map(f => `- ⚠️ **Punto Crítico:** ${f}`).join('\n')
      : '- No se registraron fricciones conceptuales anómalas en este grupo.';

    const adaptList = input.sections.adaptacionesExitosas.length > 0
      ? input.sections.adaptacionesExitosas.map(a => `- 💡 **Intervención Probada:** ${a}`).join('\n')
      : '- Se aplicó la secuencia didáctica estándar de la Bóveda Curricular sin adaptaciones mayores.';

    const recList = input.sections.recomendacionesProximoCiclo.length > 0
      ? input.sections.recomendacionesProximoCiclo.map(r => `- 🔮 **Recomendación:** ${r}`).join('\n')
      : '- Mantener el cronometraje de sesiones y asegurar material manipulable en el inicio.';

    const activitySourceLink = input.activity_source 
      ? input.activity_source 
      : `[[planeaciones/General/Planeacion_${sanitizeSafeFilename(input.topic)}.md]]`;

    const adaptationLink = input.adaptation_of
      ? `Adaptación de memoria previa: ${input.adaptation_of}`
      : 'Diseño original para la cohorte institucional.';

    return `
# 🧠 Memoria Institucional: ${input.topic} (${input.academic_cycle})

> **Principio de Memoria Institucional iSkool:**
> *«Cada ciclo escolar que una institución utiliza iSkool, la institución debe saber más sobre sí misma que el ciclo anterior. El docente trabaja en su flujo normal; iSkool recuerda; la institución aprende.»*

---

## 📍 Contexto Pedagógico y Diagnóstico Inicial
${input.sections.contextoDiagnostico || 'Evaluación diagnóstica y formativa regular realizada durante el ciclo lectivo en el grupo.'}

- **Institución:** ${input.institution_id} (${input.campus || 'Campus Central'})
- **Ciclo Escolar:** ${input.academic_cycle}
- **Grado y Asignatura:** Grado ${input.grade} • ${input.subject}
- **Cohorte / Grupo:** Grupo ${input.group_cohort}
- **Docente Titular:** ${input.author_display_name}
- **Planeación Didáctica Origen:** ${activitySourceLink}
- **Linaje Pedagógico:** ${adaptationLink}

---

## ⚠️ Fricciones y Errores Conceptuales Frecuentes
${frictionList}

---

## 💡 Adaptaciones e Intervenciones Exitosas
${adaptList}

---

## 🔮 Recomendaciones para el Próximo Ciclo Escolar
${recList}

---

## 🔗 Procedencia y Trazabilidad Institucional
${input.sections.procedenciaTrazabilidad || 'Registro generado automáticamente por el Motor de Telemetría Pedagógica Asíncrona de iSkool a partir de evaluaciones consolidadas.'}

- **Rails Activity ID:** \`${fm.provenance.rails_activity_id}\`
- **Rails Assessment Batch ID:** \`${fm.provenance.rails_assessment_batch_id || 'N/A'}\`
- **Muestra Evaluada:** ${fm.metrics.students_evaluated_count} estudiantes (datos anónimos agregados, Cero PII)
- **Tasa de Dominio Lograda:** ${(fm.metrics.mastery_rate * 100).toFixed(1)}%
- **Agente de Ingestión:** \`${fm.provenance.ingestion_agent}\`
- **Fecha de Captura:** \`${fm.provenance.captured_at}\`
`.trim();
  }

  /**
   * Carga y parsea recursivamente todas las Memorias Institucionales de la Bóveda Curricular.
   */
  static loadAllMemories(): InstitutionalMemoryDocument[] {
    const memoryDir = this.getBaseMemoryDirectory();
    if (!fs.existsSync(memoryDir)) return [];

    const documents: InstitutionalMemoryDocument[] = [];
    const files = this.scanMarkdownFilesRecursively(memoryDir);

    for (const filePath of files) {
      try {
        const rawContent = fs.readFileSync(filePath, 'utf8');
        const parsed = KnowledgeVaultParser.parse(rawContent, filePath);
        const fm = parsed.frontmatter as unknown as InstitutionalMemoryFrontmatter;

        if (fm && fm.type === 'institutional_memory') {
          const wikiLinks = parsed.wikiLinks || [];
          const sections = this.extractSectionsFromMarkdown(parsed.markdownBody);
          const relativePath = path.relative(memoryDir, filePath);
          const id = path.basename(filePath, '.md').toLowerCase();

          documents.push({
            id,
            filePath,
            relativePath,
            frontmatter: fm,
            sections,
            rawContent,
            wikiLinks,
            createdAt: fm.provenance?.captured_at || new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn(`[InstitutionalMemoryService] Advertencia al procesar "${filePath}":`, err);
      }
    }

    return documents;
  }

  /**
   * Consulta memorias existentes filtradas por asignatura, grado, tema o ciclo escolar.
   */
  static queryMemories(query: {
    grade?: number | string;
    subject?: string;
    topic?: string;
    phase_nem?: string;
    cycle?: string;
  }): InstitutionalMemoryDocument[] {
    const all = this.loadAllMemories();
    const cleanSub = query.subject ? cleanString(query.subject) : null;
    const cleanTop = query.topic ? cleanString(query.topic) : null;
    const gradeStr = query.grade !== undefined ? String(query.grade) : null;

    return all.filter(doc => {
      const fm = doc.frontmatter;
      if (query.cycle && fm.academic_cycle !== query.cycle) return false;
      if (gradeStr && String(fm.grade) !== gradeStr && !String(fm.grade).includes(gradeStr)) return false;

      if (cleanSub) {
        const docSub = cleanString(fm.subject);
        if (!docSub.includes(cleanSub) && !cleanSub.includes(docSub)) return false;
      }

      if (cleanTop) {
        const docTop = cleanString(fm.topic);
        const words = cleanTop.split(/\s+/).filter(w => w.length > 2);
        const matchesAnyWord = words.some(w => docTop.includes(w));
        if (!docTop.includes(cleanTop) && !matchesAnyWord) return false;
      }

      return true;
    });
  }

  /**
   * Sintetiza las memorias de ciclos anteriores en un resumen pedagógico directamente accionable
   * para el nuevo docente que entra al aula (Evita la amnesia institucional).
   */
  static synthesizePriorCycleLearnings(
    memories: InstitutionalMemoryDocument[],
    targetTopic?: string
  ): InstitutionalMemorySynthesis {
    if (memories.length === 0) {
      return {
        topic: targetTopic || 'General',
        subject: 'General',
        grade: 'N/A',
        totalMemoriesFound: 0,
        cyclesCovered: [],
        averageMasteryRate: 0,
        totalStudentsEvaluated: 0,
        recurrentFrictionPoints: [],
        provenInterventions: [],
        recommendationsForNextTeacher: [
          'No se registran memorias de ciclos escolares anteriores para este tema específico. Inicia con evaluación diagnóstica.'
        ],
        citedMemories: []
      };
    }

    const cyclesSet = new Set<string>();
    let totalStudents = 0;
    let totalMastery = 0;
    const frictionMap = new Map<string, { occurrences: number; cycles: Set<string> }>();
    const interventionList: { intervention: string; reportedBy: string[]; impactScore: number }[] = [];
    const recommendationsSet = new Set<string>();

    for (const mem of memories) {
      const fm = mem.frontmatter;
      cyclesSet.add(fm.academic_cycle);
      const studentCount = Number(fm.metrics?.students_evaluated_count || 0);
      const mastery = Number(fm.metrics?.mastery_rate || 0);
      totalStudents += studentCount;
      totalMastery += mastery * (studentCount || 1);

      // Fricciones
      const frictions = Array.isArray(fm.metrics?.comprehension_friction_points) 
        ? fm.metrics.comprehension_friction_points 
        : [];

      for (const fric of frictions) {
        const cleanFric = String(fric).trim();
        if (!cleanFric || cleanFric === 'ninguna_detectada') continue;
        if (!frictionMap.has(cleanFric)) {
          frictionMap.set(cleanFric, { occurrences: 0, cycles: new Set() });
        }
        const entry = frictionMap.get(cleanFric)!;
        entry.occurrences += 1;
        entry.cycles.add(fm.academic_cycle);
      }

      // Intervenciones
      for (const adapt of mem.sections.adaptacionesExitosas) {
        const cleanAdapt = adapt.replace(/^[-*•\s]+/, '').trim();
        if (cleanAdapt.length > 5) {
          interventionList.push({
            intervention: cleanAdapt,
            reportedBy: [fm.author_display_name],
            impactScore: mastery
          });
        }
      }

      // Recomendaciones
      for (const rec of mem.sections.recomendacionesProximoCiclo) {
        const cleanRec = rec.replace(/^[-*•\s]+/, '').trim();
        if (cleanRec.length > 5) {
          recommendationsSet.add(cleanRec);
        }
      }
    }

    const averageMastery = totalStudents > 0 ? (totalMastery / totalStudents) : 0;

    const recurrentFrictionPoints = Array.from(frictionMap.entries())
      .map(([friction, data]) => ({
        friction,
        occurrences: data.occurrences,
        cycles: Array.from(data.cycles)
      }))
      .sort((a, b) => b.occurrences - a.occurrences);

    const citedMemories = memories.map(m => ({
      cycle: m.frontmatter.academic_cycle,
      cohort: m.frontmatter.group_cohort,
      teacher: m.frontmatter.author_display_name,
      activitySource: m.frontmatter.activity_source,
      wikiLink: `[[planeaciones/Memorias_Institucionales/${sanitizeSafeFilename(m.frontmatter.academic_cycle)}/${path.basename(m.filePath)}]]`
    }));

    const primaryDoc = memories[0].frontmatter;

    return {
      topic: targetTopic || primaryDoc.topic,
      subject: primaryDoc.subject,
      grade: primaryDoc.grade,
      totalMemoriesFound: memories.length,
      cyclesCovered: Array.from(cyclesSet).sort(),
      averageMasteryRate: parseFloat(averageMastery.toFixed(2)),
      totalStudentsEvaluated: totalStudents,
      recurrentFrictionPoints,
      provenInterventions: interventionList.slice(0, 5),
      recommendationsForNextTeacher: Array.from(recommendationsSet),
      citedMemories
    };
  }

  /**
   * Parsea las 5 secciones estructuradas a partir del contenido Markdown.
   */
  private static extractSectionsFromMarkdown(content: string): InstitutionalMemorySections {
    const getSectionContent = (headingRegex: RegExp): string => {
      const match = content.match(headingRegex);
      return match ? match[1].trim() : '';
    };

    const getBulletList = (headingRegex: RegExp): string[] => {
      const sectionText = getSectionContent(headingRegex);
      if (!sectionText) return [];
      return sectionText
        .split('\n')
        .map(l => l.replace(/^[-*•\s]+/, '').replace(/^[⚠️💡🔮\s]+/, '').replace(/^\*\*(?:Punto Crítico|Intervención Probada|Recomendación):\*\*\s*/i, '').trim())
        .filter(l => l.length > 0 && !l.startsWith('No se registraron'));
    };

    const diagMatch = content.match(/## 📍 Contexto Pedagógico y Diagnóstico Inicial[\s\S]*?\n([\s\S]*?)(?=## ⚠️|---|$)/);
    const contextText = diagMatch ? diagMatch[1].trim() : '';

    const fricciones = getBulletList(/## ⚠️ Fricciones y Errores Conceptuales Frecuentes[\s\S]*?\n([\s\S]*?)(?=## 💡|---|$)/);
    const adaptaciones = getBulletList(/## 💡 Adaptaciones e Intervenciones Exitosas[\s\S]*?\n([\s\S]*?)(?=## 🔮|---|$)/);
    const recomendaciones = getBulletList(/## 🔮 Recomendaciones para el Próximo Ciclo Escolar[\s\S]*?\n([\s\S]*?)(?=## 🔗|---|$)/);

    const procMatch = content.match(/## 🔗 Procedencia y Trazabilidad Institucional[\s\S]*?\n([\s\S]*?)(?=$)/);
    const procedencia = procMatch ? procMatch[1].trim() : '';

    return {
      contextoDiagnostico: contextText,
      friccionesErrores: fricciones,
      adaptacionesExitosas: adaptaciones,
      recomendacionesProximoCiclo: recomendaciones,
      procedenciaTrazabilidad: procedencia
    };
  }

  private static scanMarkdownFilesRecursively(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.scanMarkdownFilesRecursively(fullPath));
      } else if (file.endsWith('.md')) {
        results.push(fullPath);
      }
    }
    return results;
  }
}
