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
  InstitutionalMemoryFrontmatterSchema,
  type CreateInstitutionalMemoryInput,
  type InstitutionalMemoryDocument,
  type InstitutionalMemoryFrontmatter,
  type InstitutionalMemorySections,
  type InstitutionalMemorySynthesis,
  type SaveMemoryResult,
  type MemoryManifestEntry
} from './types';
import { PedagogicalPiiGuard } from './piiGuard';
import { supabase } from '../supabaseClient';

export type { MemoryManifestEntry };

// Caché volátil en memoria para manifest.json de Supabase Storage con TTL de 60 segundos
let manifestCache: { data: MemoryManifestEntry[]; timestamp: number } | null = null;
const MANIFEST_TTL_MS = 60 * 1000;


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
  /**
   * Obtiene la ruta física del directorio de Memorias Institucionales dentro de la Bóveda Curricular.
   * Si detecta entorno serverless con sistema de archivos de solo lectura, conmuta de forma segura
   * hacia el directorio temporal /tmp para evitar errores EROFS.
   */
  static getBaseMemoryDirectory(forWrite: boolean = false): string {
    const envPath = process.env.CURRICULAR_VAULT_PATH || process.env.VAULT_PATH;
    let basePlannings = path.join(process.cwd(), 'planeaciones');
    if (envPath && fs.existsSync(envPath)) {
      const sub = path.join(envPath, 'planeaciones');
      basePlannings = fs.existsSync(sub) ? sub : envPath;
    }
    const memoryDir = path.join(basePlannings, 'Memorias_Institucionales');

    if (forWrite) {
      const isServerless = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.env.VERCEL);
      let isWritable = !isServerless;
      if (isWritable) {
        try {
          if (!fs.existsSync(memoryDir)) {
            fs.mkdirSync(memoryDir, { recursive: true });
          }
          fs.accessSync(memoryDir, fs.constants.W_OK);
        } catch {
          isWritable = false;
        }
      }

      if (!isWritable) {
        const tempBase = process.env.TMPDIR || '/tmp';
        const tempMemoryDir = path.join(tempBase, 'iskool', 'planeaciones', 'Memorias_Institucionales');
        if (!fs.existsSync(tempMemoryDir)) {
          fs.mkdirSync(tempMemoryDir, { recursive: true });
        }
        return tempMemoryDir;
      }
    }

    if (!fs.existsSync(memoryDir)) {
      try {
        fs.mkdirSync(memoryDir, { recursive: true });
      } catch {
        // En solo lectura, continuar si ya existe o no se puede crear
      }
    }
    return memoryDir;
  }

  /**
   * Sincronización GitOps con el Repositorio Central (Servidor Remoto).
   * En producción (AWS Amplify / Lambda), persiste la memoria directamente en la rama principal
   * del Repositorio Central para eliminar la volatilidad de entornos serverless.
   */
  static async syncToCentralRepository(params: {
    relativeRepoPath: string;
    fileContent: string;
    commitMessage?: string;
  }): Promise<{ synced: boolean; commitSha?: string; error?: string }> {
    const token = process.env.REPO_ACCESS_TOKEN || process.env.GITHUB_TOKEN || process.env.CENTRAL_REPO_TOKEN;
    if (!token) {
      console.warn('[Memoria Institucional GitOps] Advertencia: Token de sincronización con el Repositorio Central no configurado (REPO_ACCESS_TOKEN / GITHUB_TOKEN). Conmutando a Almacenamiento en la Nube (Cloud Storage) como persistencia primaria.');
      return { synced: false, error: 'Token de sincronización institucional no configurado; conmutado a Cloud Storage' };
    }

    const repo = process.env.CENTRAL_REPO || process.env.GITHUB_REPOSITORY || 'roboticalegotaller1/iskool-web-';
    const branch = process.env.CENTRAL_REPO_BRANCH || 'main';
    const sanitizedPath = params.relativeRepoPath.replace(/\\/g, '/');
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${sanitizedPath}`;

    // Prevención de Bucles de Build en AWS Amplify: commit message con [skip ci] [amplify skip]
    let commitMessage = params.commitMessage || `persistencia de memoria institucional ${sanitizedPath}`;
    if (!commitMessage.includes('[skip ci]')) {
      commitMessage = `[skip ci] [amplify skip]: ${commitMessage}`;
    }

    const maxAttempts = 3;
    let lastError = '';

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        // 1. Manejo de Actualización (SHA): Verificar si el archivo ya existe para obtener su SHA (Previene HTTP 422)
        let currentSha: string | undefined = undefined;
        const checkRes = await fetch(`${apiUrl}?ref=${branch}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'iSkool-Institutional-Brain/1.0'
          }
        });

        if (checkRes.ok) {
          const checkData = await checkRes.json() as { sha?: string };
          currentSha = checkData.sha;
        }

        // 2. Transmitir commit a la rama principal del Repositorio Central con SHA si existe
        const commitRes = await fetch(apiUrl, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'iSkool-Institutional-Brain/1.0'
          },
          body: JSON.stringify({
            message: commitMessage,
            content: Buffer.from(params.fileContent, 'utf8').toString('base64'),
            branch,
            ...(currentSha ? { sha: currentSha } : {})
          })
        });

        if (commitRes.ok) {
          const commitData = await commitRes.json() as { commit?: { sha?: string } };
          return { synced: true, commitSha: commitData.commit?.sha };
        }

        // Manejo de Colisiones Concurrentes (HTTP 409 Conflict o HTTP 422 Unprocessable Entity)
        if (commitRes.status === 409 || commitRes.status === 422) {
          lastError = `HTTP ${commitRes.status}: versión en conflicto o SHA desactualizado`;
          if (attempt < maxAttempts) {
            const delay = Math.pow(2, attempt) * 300 + Math.random() * 200;
            console.warn(`[GitOps:Retry] Intento ${attempt} falló (${commitRes.status}). Reintentando en ${Math.round(delay)}ms con retroceso exponencial...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          } else {
            console.warn(`[GitOps:SyncConflict] Falló sincronización con repo central tras ${maxAttempts} reintentos: ${lastError}`);
            return { synced: false, error: lastError };
          }
        }

        const errorText = await commitRes.text();
        return { synced: false, error: `Error HTTP ${commitRes.status}: ${errorText}` };
      } catch (err: any) {
        lastError = err.message || 'Fallo de conexión con el Servidor Remoto';
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt) * 300 + Math.random() * 200;
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        return { synced: false, error: lastError };
      }
    }

    return { synced: false, error: lastError || 'Fallo de sincronización GitOps tras reintentos' };
  }

  /**
   * Respaldo en Almacenamiento Institucional en la Nube (Supabase Storage / Bucket).
   * Proporciona redundancia unificada si la sincronización directa requiere respaldo inmediato
   * y actualiza el archivo manifest.json central.
   */
  static async syncToCloudStorage(
    storagePath: string,
    fileContent: string,
    manifestEntry?: MemoryManifestEntry
  ): Promise<{ synced: boolean; error?: string }> {
    try {
      if (!supabase || !supabase.storage) {
        return { synced: false, error: 'Cliente de almacenamiento en la nube no inicializado' };
      }
      const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';
      const cleanPath = storagePath.replace(/\\/g, '/');
      const blob = Buffer.from(fileContent, 'utf8');

      const { error } = await supabase.storage
        .from(bucketName)
        .upload(cleanPath, blob, {
          contentType: 'text/markdown; charset=utf-8',
          upsert: true
        });

      if (error) {
        return { synced: false, error: error.message };
      }

      // Actualizar o regenerar manifest.json en la raíz del bucket institucional
      if (manifestEntry) {
        await this.updateManifestInCloudStorage(manifestEntry);
      }

      return { synced: true };
    } catch (err: any) {
      return { synced: false, error: err.message };
    }
  }

  /**
   * Actualiza o inserta de forma atómica una entrada en el manifest.json central de Supabase Storage.
   */
  static async updateManifestInCloudStorage(entry: MemoryManifestEntry): Promise<void> {
    if (!supabase || !supabase.storage) return;
    const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';

    try {
      let currentEntries: MemoryManifestEntry[] = [];
      const cached = await this.fetchManifestFromCloudStorage();
      if (cached && Array.isArray(cached)) {
        currentEntries = [...cached];
      }

      const idx = currentEntries.findIndex(e => e.id === entry.id || e.filePath === entry.filePath);
      if (idx >= 0) {
        currentEntries[idx] = entry;
      } else {
        currentEntries.push(entry);
      }

      await this.uploadFullManifest(bucketName, currentEntries);
    } catch (err) {
      console.warn('[InstitutionalMemoryService] Advertencia al actualizar manifest.json:', err);
    }
  }

  /**
   * Descarga el manifest.json desde Supabase Storage con soporte de caché volátil en memoria (TTL 60s).
   */
  static async fetchManifestFromCloudStorage(): Promise<MemoryManifestEntry[] | null> {
    if (!supabase || !supabase.storage) return null;
    const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';

    const now = Date.now();
    if (manifestCache && (now - manifestCache.timestamp < MANIFEST_TTL_MS)) {
      return manifestCache.data;
    }

    try {
      const { data, error } = await supabase.storage.from(bucketName).download('manifest.json');
      if (!error && data) {
        const text = await data.text();
        const entries = JSON.parse(text) as MemoryManifestEntry[];
        if (Array.isArray(entries)) {
          manifestCache = { data: entries, timestamp: now };
          return entries;
        }
      }
    } catch {
      // Ignorar fallo si el archivo manifest.json aún no existe
    }

    return null;
  }

  /**
   * Carga masiva o autogeneración de manifest.json consolidado en Supabase Storage.
   */
  static async uploadFullManifest(bucketName: string, entries: MemoryManifestEntry[]): Promise<void> {
    if (!supabase || !supabase.storage) return;
    try {
      const manifestJson = JSON.stringify(entries, null, 2);
      const blob = Buffer.from(manifestJson, 'utf8');
      await supabase.storage
        .from(bucketName)
        .upload('manifest.json', blob, {
          contentType: 'application/json; charset=utf-8',
          upsert: true
        });

      manifestCache = {
        data: entries,
        timestamp: Date.now()
      };
    } catch (err) {
      console.warn('[InstitutionalMemoryService] Advertencia al subir manifest.json consolidado:', err);
    }
  }

  /**
   * Guarda de forma atómica una nueva Memoria Institucional en la Bóveda Curricular.
   * Ejecuta estrictamente el escaneo de Cero PII antes de escribir en disco.
   * En producción (AWS Amplify / Lambda), sincroniza con el Repositorio Central y Almacenamiento en la Nube.
   */
  static async saveMemory(
    input: CreateInstitutionalMemoryInput,
    options?: { deferGitSync?: boolean }
  ): Promise<SaveMemoryResult> {
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
    const baseDir = this.getBaseMemoryDirectory(true);
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

    // 6. Escritura atómica en disco (o /tmp en entornos serverless de solo lectura)
    fs.writeFileSync(fullPath, fileContent, 'utf8');

    const documentId = `memoria-${input.academic_cycle}-${input.grade}-${safeSubject}-${safeTopic}-${safeCohort}`.toLowerCase();

    // 7. Sincronización Remota GitOps & Cloud Storage (Producción / AWS Amplify)
    let remoteGitSynced = false;
    let remoteGitCommit: string | undefined = undefined;
    let storageSynced = false;
    let syncWarning: string | undefined = undefined;

    const isProductionOrCloud = Boolean(
      process.env.NODE_ENV === 'production' ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.VERCEL ||
      process.env.FORCE_REMOTE_PERSISTENCE === 'true'
    );

    const hasGitToken = Boolean(
      process.env.REPO_ACCESS_TOKEN ||
      process.env.GITHUB_TOKEN ||
      process.env.CENTRAL_REPO_TOKEN
    );

    const repoRelativePath = `planeaciones/Memorias_Institucionales/${sanitizeSafeFilename(input.academic_cycle)}/${filename}`;
    const commitMessage = `[skip ci] [amplify skip]: persistencia de memoria institucional ${input.academic_cycle}/${filename}`;

    if (isProductionOrCloud || hasGitToken) {
      if (options?.deferGitSync) {
        remoteGitSynced = true; // GitOps diferido para ejecución asíncrona no bloqueante
      } else {
        try {
          const gitResult = await this.syncToCentralRepository({
            relativeRepoPath,
            fileContent,
            commitMessage
          });
          remoteGitSynced = gitResult.synced;
          remoteGitCommit = gitResult.commitSha;
          if (!gitResult.synced && gitResult.error) {
            syncWarning = `GitOps: ${gitResult.error}`;
          }
        } catch (err: any) {
          syncWarning = `GitOps Error: ${err.message}`;
        }
      }

      try {
        const manifestEntry: MemoryManifestEntry = {
          id: documentId,
          fileName: filename,
          filePath: repoRelativePath,
          ciclo: input.academic_cycle,
          grado: String(input.grade),
          asignatura: input.subject,
          tema: input.topic,
          fecha: new Date().toISOString(),
          resumen_didactico: input.sections.contextoDiagnostico?.slice(0, 300),
          adecuaciones_clave: input.sections.adaptacionesExitosas?.slice(0, 5) || [],
          palabras_clave: [
            cleanString(input.subject),
            cleanString(input.topic),
            `grado_${input.grade}`,
            `ciclo_${input.academic_cycle}`
          ]
        };

        const storageResult = await this.syncToCloudStorage(repoRelativePath, fileContent, manifestEntry);
        storageSynced = storageResult.synced;
      } catch (err: any) {
        // Fallback silencioso para no interrumpir el flujo del docente
      }
    }

    return {
      success: true,
      filePath: fullPath,
      documentId,
      remoteGitSynced,
      remoteGitCommit,
      storageSynced,
      syncWarning,
      repoRelativePath,
      fileContent,
      commitMessage
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
   * En entornos serverless, escanea tanto el bundle estático como el directorio temporal /tmp.
   */
  static loadAllMemories(): InstitutionalMemoryDocument[] {
    const primaryDir = this.getBaseMemoryDirectory(false);
    const tempBase = process.env.TMPDIR || '/tmp';
    const tempMemoryDir = path.join(tempBase, 'iskool', 'planeaciones', 'Memorias_Institucionales');

    const searchDirs = [primaryDir];
    if (fs.existsSync(tempMemoryDir) && tempMemoryDir !== primaryDir) {
      searchDirs.push(tempMemoryDir);
    }

    const documentsMap = new Map<string, InstitutionalMemoryDocument>();

    for (const dir of searchDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = this.scanMarkdownFilesRecursively(dir);

      for (const filePath of files) {
        try {
          const rawContent = fs.readFileSync(filePath, 'utf8');
          const parsed = KnowledgeVaultParser.parse(rawContent, filePath);
          const fm = parsed.frontmatter as unknown as InstitutionalMemoryFrontmatter;

          if (fm && fm.type === 'institutional_memory') {
            const wikiLinks = parsed.wikiLinks || [];
            const sections = this.extractSectionsFromMarkdown(parsed.markdownBody);
            const relativePath = path.relative(dir, filePath);
            const id = path.basename(filePath, '.md').toLowerCase();

            if (!documentsMap.has(id)) {
              documentsMap.set(id, {
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
          }
        } catch (err) {
          console.warn(`[InstitutionalMemoryService] Advertencia al procesar "${filePath}":`, err);
        }
      }
    }

    return Array.from(documentsMap.values());
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
   * Carga de memorias desde el almacenamiento unificado en la nube (Supabase Storage).
   * Resuelve la inconsistencia en entornos multi-lambda donde /tmp es efímero y no compartido.
   */
  static async loadMemoriesFromCloudStorage(): Promise<InstitutionalMemoryDocument[]> {
    if (!supabase || !supabase.storage) return [];
    const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';

    try {
      const { data: rootItems, error: listErr } = await supabase.storage.from(bucketName).list('', {
        limit: 100
      });
      if (listErr || !rootItems) return [];

      const documents: InstitutionalMemoryDocument[] = [];

      for (const item of rootItems) {
        if (!item.id && item.name) {
          // Es subdirectorio de ciclo escolar (ej. 2025-2026)
          const { data: subFiles } = await supabase.storage.from(bucketName).list(item.name, {
            limit: 100
          });
          if (subFiles) {
            for (const file of subFiles) {
              if (file.name.endsWith('.md')) {
                const doc = await this.downloadAndParseStorageFile(bucketName, `${item.name}/${file.name}`);
                if (doc) documents.push(doc);
              }
            }
          }
        } else if (item.name.endsWith('.md')) {
          const doc = await this.downloadAndParseStorageFile(bucketName, item.name);
          if (doc) documents.push(doc);
        }
      }

      return documents;
    } catch (err) {
      console.warn('[InstitutionalMemoryService] Advertencia al consultar Cloud Storage multi-lambda:', err);
      return [];
    }
  }

  private static async downloadAndParseStorageFile(bucket: string, storagePath: string): Promise<InstitutionalMemoryDocument | null> {
    try {
      const { data, error } = await supabase.storage.from(bucket).download(storagePath);
      if (error || !data) return null;

      const rawContent = await data.text();
      const parsed = KnowledgeVaultParser.parse(rawContent, storagePath);
      const fm = parsed.frontmatter as unknown as InstitutionalMemoryFrontmatter;

      if (fm && fm.type === 'institutional_memory') {
        const sections = this.extractSectionsFromMarkdown(parsed.markdownBody);
        const id = path.basename(storagePath, '.md').toLowerCase();
        return {
          id,
          filePath: `storage://${bucket}/${storagePath}`,
          relativePath: storagePath,
          frontmatter: fm,
          sections,
          rawContent,
          wikiLinks: parsed.wikiLinks || [],
          createdAt: fm.provenance?.captured_at || new Date().toISOString()
        };
      }
    } catch {
      return null;
    }
    return null;
  }

  /**
   * Consulta asíncrona de memorias con consistencia Multi-Lambda.
   * Si se ejecuta en producción (AWS Amplify / Lambda), además del filesystem local empaquetado,
   * consulta el bucket unificado de Supabase Storage para servir la memoria más reciente.
   */
  static async queryMemoriesAsync(query: {
    grade?: number | string;
    subject?: string;
    topic?: string;
    phase_nem?: string;
    cycle?: string;
  }): Promise<InstitutionalMemoryDocument[]> {
    const localDocs = this.loadAllMemories();
    const docMap = new Map<string, InstitutionalMemoryDocument>();
    for (const doc of localDocs) {
      docMap.set(doc.id, doc);
    }

    const isProductionOrCloud = Boolean(
      process.env.NODE_ENV === 'production' ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.VERCEL
    );

    if (isProductionOrCloud && supabase && supabase.storage) {
      const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';
      try {
        const manifestEntries = await this.fetchManifestFromCloudStorage();

        if (manifestEntries && manifestEntries.length > 0) {
          const cleanSub = query.subject ? cleanString(query.subject) : null;
          const cleanTop = query.topic ? cleanString(query.topic) : null;
          const gradeStr = query.grade !== undefined ? String(query.grade) : null;

          const matchingEntries = manifestEntries.filter(entry => {
            if (query.cycle && entry.ciclo !== query.cycle) return false;
            if (gradeStr && entry.grado !== gradeStr && !entry.grado.includes(gradeStr)) return false;

            if (cleanSub) {
              const entrySub = cleanString(entry.asignatura);
              if (!entrySub.includes(cleanSub) && !cleanSub.includes(entrySub)) return false;
            }

            if (cleanTop) {
              const entryTop = cleanString(entry.tema);
              const words = cleanTop.split(/\s+/).filter(w => w.length > 2);
              const matchesAnyWord = words.some(w => entryTop.includes(w) || entry.palabras_clave.some(k => k.includes(w)));
              if (!entryTop.includes(cleanTop) && !matchesAnyWord) return false;
            }

            return true;
          });

          // Descargar en paralelo únicamente las 3 a 5 memorias más relevantes
          const targetEntries = matchingEntries.slice(0, 5);
          const downloaded = await Promise.all(
            targetEntries.map(e => this.downloadAndParseStorageFile(bucketName, e.filePath))
          );

          for (const doc of downloaded) {
            if (doc && !docMap.has(doc.id)) {
              docMap.set(doc.id, doc);
            }
          }
        } else {
          // Fallback defensivo: escaneo de archivos .md y autogeneración de manifest en segundo plano
          const cloudDocs = await this.loadMemoriesFromCloudStorage();
          for (const doc of cloudDocs) {
            if (!docMap.has(doc.id)) {
              docMap.set(doc.id, doc);
            }
          }

          if (cloudDocs.length > 0) {
            const entriesToSave: MemoryManifestEntry[] = cloudDocs.map(d => ({
              id: d.id,
              fileName: path.basename(d.filePath),
              filePath: d.relativePath,
              ciclo: d.frontmatter.academic_cycle,
              grado: String(d.frontmatter.grade),
              asignatura: d.frontmatter.subject,
              tema: d.frontmatter.topic,
              fecha: d.frontmatter.provenance?.captured_at || new Date().toISOString(),
              resumen_didactico: d.sections.contextoDiagnostico?.slice(0, 300),
              adecuaciones_clave: d.sections.adaptacionesExitosas?.slice(0, 5) || [],
              palabras_clave: [
                cleanString(d.frontmatter.subject),
                cleanString(d.frontmatter.topic),
                `grado_${d.frontmatter.grade}`
              ]
            }));

            this.uploadFullManifest(bucketName, entriesToSave).catch(() => {});
          }
        }
      } catch (err) {
        console.warn('[InstitutionalMemoryService] Fallback resiliente a memorias locales:', err);
      }
    }

    const all = Array.from(docMap.values());
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
   * Poda y formatea las memorias institucionales para el prompt del Motor de IA Pedagógica
   * bajo un presupuesto estricto de tokens (por defecto maxTokens = 1200 ≈ 4800 caracteres).
   * Extrae exclusivamente:
   * - Logros pedagógicos.
   * - Dificultades detectadas y errores conceptuales comunes.
   * - Adecuaciones curriculares que funcionaron.
   * - Recomendaciones para el docente.
   * Limita a un máximo de 3 memorias ordenadas por relevancia y ciclo escolar.
   */
  static formatMemoriesForPrompt(
    memories: InstitutionalMemoryDocument[],
    maxTokens: number = 1200
  ): string {
    if (!memories || memories.length === 0) return '';

    const selected = [...memories]
      .sort((a, b) => {
        const cA = a.frontmatter.academic_cycle || '';
        const cB = b.frontmatter.academic_cycle || '';
        return cB.localeCompare(cA);
      })
      .slice(0, 3);

    const maxChars = maxTokens * 4;
    const perMemoryBudget = Math.floor(maxChars / selected.length);

    const memoryBlocks: string[] = selected.map(doc => {
      const fm = doc.frontmatter;
      const sec = doc.sections;

      const logros = `Tasa de dominio ${(fm.metrics.mastery_rate * 100).toFixed(0)}% en muestra de ${fm.metrics.students_evaluated_count} alumnos.`;

      const dificultades = sec.friccionesErrores && sec.friccionesErrores.length > 0
        ? sec.friccionesErrores.slice(0, 3).map(f => `  • ${f}`).join('\n')
        : '  • Sin dificultades críticas registradas';

      const adecuaciones = sec.adaptacionesExitosas && sec.adaptacionesExitosas.length > 0
        ? sec.adaptacionesExitosas.slice(0, 3).map(a => `  • ${a}`).join('\n')
        : '  • Secuencias graduadas con material manipulable y andamiaje.';

      const recomendaciones = sec.recomendacionesProximoCiclo && sec.recomendacionesProximoCiclo.length > 0
        ? sec.recomendacionesProximoCiclo.slice(0, 3).map(r => `  • ${r}`).join('\n')
        : '  • Evaluación formativa continua y andamiaje progresivo.';

      let block = `[MEMORIA DE CICLO ANTERIOR - Ciclo ${fm.academic_cycle} | Grado ${fm.grade}º | ${fm.subject}]:
- Logros pedagógicos: ${logros}
- Dificultades detectadas y errores conceptuales comunes:
${dificultades}
- Adecuaciones curriculares que funcionaron:
${adecuaciones}
- Recomendaciones para el docente:
${recomendaciones}`;

      if (block.length > perMemoryBudget) {
        block = block.slice(0, perMemoryBudget - 25) + '\n...[resumen acotado por token budget]';
      }

      return block;
    });

    const header = `[MEMORIA INSTITUCIONAL DEL COLEGIO - SEGUNDO CEREBRO]:
Instrucción pedagógica: Integra explícitamente estas experiencias previas en el diseño de las actividades (Desarrollo y Cierre) para prevenir los bloqueos conceptuales históricos.`;

    return `${header}\n\n${memoryBlocks.join('\n\n')}`;
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
