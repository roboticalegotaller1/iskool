/**
 * @file rebuild-vault-manifest.ts
 * @description Herramienta CLI de Recuperación ante Desastres (Disaster Recovery & Reindexación Total).
 * Reconstruye de forma determinista el archivo manifest.json desde el árbol de la Bóveda Curricular
 * mediante escaneo recursivo, parseo de frontmatter con gray-matter, validación de tipos con Zod
 * y cómputo de hashes SHA-256 individuales y globales.
 * 
 * Cumple con los protocolos de resiliencia bancaria e institucional de iSkool:
 * 1. Escaneo recursivo de archivos markdown.
 * 2. Parseo y tipado estricto con validación de Cero PII.
 * 3. Cómputo criptográfico de SHA-256 por archivo y versionHash global.
 * 4. Regeneración con ordenamiento cronológico por ciclo y fecha.
 * 5. Commit atómico con la etiqueta [vault-rebuild] [skip ci] solo si existen cambios (idempotente).
 * 
 * Uso CLI:
 *   npm run vault:rebuild
 *   npx tsx scripts/rebuild-vault-manifest.ts [--dry-run] [--no-commit] [--vault-dir <path>]
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execSync } from 'child_process';
import matter from 'gray-matter';
import {
  InstitutionalMemoryFrontmatterSchema,
  type MemoryManifestEntry,
  type InstitutionalMemoryFrontmatter
} from '../src/lib/institutionalMemory/types';
import {
  InstitutionalMemoryService,
  cleanString
} from '../src/lib/institutionalMemory/memoryService';

export interface RebuildOptions {
  vaultDir?: string;
  manifestPath?: string;
  dryRun?: boolean;
  skipCommit?: boolean;
  syncCloudStorage?: boolean;
  silent?: boolean;
  repoRootDir?: string;
}

export interface RebuildResult {
  success: boolean;
  scannedFiles: number;
  validMemories: number;
  invalidFiles: string[];
  versionHash: string;
  manifestPath: string;
  modified: boolean;
  commitCreated: boolean;
  commitSha?: string;
  entries: MemoryManifestEntry[];
}

/**
 * Escanea recursivamente todos los archivos markdown en el directorio indicado.
 */
function scanMarkdownFiles(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    // Ignorar carpetas ocultas, de sistema o .obsidian
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    if (entry.isDirectory()) {
      results = results.concat(scanMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Función principal de reindexación total y auto-sanación de manifest.json.
 */
export async function rebuildVaultManifest(options?: RebuildOptions): Promise<RebuildResult> {
  const silent = Boolean(options?.silent);
  const dryRun = Boolean(options?.dryRun);
  const skipCommit = Boolean(options?.skipCommit);
  const repoRootDir = options?.repoRootDir || process.cwd();

  const vaultDir = options?.vaultDir || 
    (process.env.CURRICULAR_VAULT_PATH 
      ? path.join(process.env.CURRICULAR_VAULT_PATH, 'Memorias_Institucionales')
      : path.join(repoRootDir, 'planeaciones', 'Memorias_Institucionales'));

  const manifestPath = options?.manifestPath || path.join(vaultDir, 'manifest.json');

  if (!silent) {
    console.log(`\n================================================================`);
    console.log(`🛠️ BÓVEDA CURRICULAR: HERRAMIENTA DE RECUPERACIÓN ANTE DESASTRES`);
    console.log(`   CLI de Reindexación Total y Auto-Sanación de manifest.json`);
    console.log(`================================================================`);
    console.log(`📂 Directorio Bóveda: ${vaultDir}`);
    console.log(`📄 Destino Manifest: ${manifestPath}`);
    if (dryRun) console.log(`🔍 Modo: DRY-RUN (Sin escritura en disco ni commits)`);
    console.log(`----------------------------------------------------------------\n`);
  }

  // 1. Escaneo recursivo de archivos markdown
  const markdownFiles = scanMarkdownFiles(vaultDir);
  if (!silent) {
    console.log(`[Reindexador:Escaneo] Archivos Markdown encontrados: ${markdownFiles.length}`);
  }

  const validEntries: MemoryManifestEntry[] = [];
  const invalidFiles: string[] = [];

  // 2. Parseo de frontmatter con gray-matter y validación con Zod
  for (const filePath of markdownFiles) {
    // Excluir si por alguna razón el archivo escaneado es un índice o no es memoria
    const baseName = path.basename(filePath);
    if (baseName.startsWith('00_') || baseName === 'manifest.json') continue;

    try {
      const rawContent = fs.readFileSync(filePath, 'utf8');
      const parsedMatter = matter(rawContent);
      const rawData = parsedMatter.data;

      // Validar si es una memoria institucional
      if (!rawData || rawData.type !== 'institutional_memory') {
        // Archivo markdown de otra categoría dentro de la bóveda
        continue;
      }

      const parseResult = InstitutionalMemoryFrontmatterSchema.safeParse(rawData);
      if (!parseResult.success) {
        const errorDetails = parseResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ');
        invalidFiles.push(`${baseName} (${errorDetails})`);
        if (!silent) {
          console.warn(`⚠️ [Reindexador:Validación] Archivo inválido omitido "${baseName}": ${errorDetails}`);
        }
        continue;
      }

      const fm = parseResult.data as InstitutionalMemoryFrontmatter;

      // 3. Recomputar hash SHA-256 individual del archivo
      const fileSha = crypto.createHash('sha256').update(rawContent, 'utf8').digest('hex');

      // Extraer resumen didáctico y adecuaciones clave
      const sections = InstitutionalMemoryService.extractSectionsFromMarkdown(parsedMatter.content);
      const resumen = sections.contextoDiagnostico 
        ? sections.contextoDiagnostico.slice(0, 300) 
        : (fm.topic || '');
      const adecuaciones = sections.adaptacionesExitosas 
        ? sections.adaptacionesExitosas.slice(0, 5) 
        : [];

      // Identificador único y ruta relativa al repositorio
      const documentId = baseName.replace(/\.md$/i, '').toLowerCase();
      const relativePath = path.relative(repoRootDir, filePath).replace(/\\/g, '/');

      const manifestEntry: MemoryManifestEntry = {
        id: documentId,
        fileName: baseName,
        filePath: relativePath,
        ciclo: fm.academic_cycle,
        grado: String(fm.grade),
        asignatura: fm.subject,
        tema: fm.topic,
        fecha: fm.provenance?.captured_at || new Date().toISOString(),
        sha: fileSha,
        resumen_didactico: resumen,
        adecuaciones_clave: adecuaciones,
        palabras_clave: [
          cleanString(fm.subject),
          cleanString(fm.topic),
          `grado_${fm.grade}`,
          `ciclo_${fm.academic_cycle}`
        ]
      };

      validEntries.push(manifestEntry);
    } catch (err: any) {
      invalidFiles.push(`${baseName} (Error de lectura: ${err?.message})`);
      if (!silent) {
        console.warn(`⚠️ [Reindexador:Error] No se pudo procesar "${baseName}":`, err?.message);
      }
    }
  }

  // 4. Ordenamiento cronológico estricto (ciclo descendente, fecha descendente) y deduplicación
  const sortedEntries = InstitutionalMemoryService.mergeAndSortManifestEntries(validEntries, []);

  // 5. Cómputo del versionHash criptográfico global
  const formattedManifestJson = JSON.stringify(sortedEntries, null, 2);
  const versionHash = crypto.createHash('sha256').update(formattedManifestJson, 'utf8').digest('hex');

  if (!silent) {
    console.log(`[Reindexador:Análisis] Memorias institucionales válidas: ${sortedEntries.length}`);
    console.log(`[Reindexador:Cripto] Hash global de versión (SHA-256): ${versionHash}`);
  }

  // 6. Verificación de Idempotencia contra el manifest existente
  let isDifferent = true;
  if (fs.existsSync(manifestPath)) {
    try {
      const existingRaw = fs.readFileSync(manifestPath, 'utf8');
      const existingHash = crypto.createHash('sha256').update(existingRaw.trim(), 'utf8').digest('hex');
      const newHash = crypto.createHash('sha256').update(formattedManifestJson.trim(), 'utf8').digest('hex');
      if (existingHash === newHash) {
        isDifferent = false;
      }
    } catch {
      isDifferent = true;
    }
  }

  let commitCreated = false;
  let commitSha: string | undefined = undefined;

  if (!isDifferent) {
    if (!silent) {
      console.log(`✅ [Reindexador:Idempotente] El manifest.json actual ya está 100% sincronizado.`);
      console.log(`   Hash: ${versionHash}. No se requieren cambios ni commits.`);
    }
  } else {
    // Regenerar manifest.json en disco
    if (!dryRun) {
      const targetDir = path.dirname(manifestPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      fs.writeFileSync(manifestPath, formattedManifestJson, 'utf8');
      if (!silent) {
        console.log(`💾 [Reindexador:Escritura] manifest.json guardado en: ${manifestPath}`);
      }

      // Sincronizar en Almacenamiento en la Nube si está habilitado
      if (options?.syncCloudStorage !== false) {
        try {
          const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';
          await InstitutionalMemoryService.uploadFullManifest(bucketName, sortedEntries);
          if (!silent) {
            console.log(`☁️ [Reindexador:Cloud] Sincronizado exitosamente con Almacenamiento en la Nube.`);
          }
        } catch (cloudErr: any) {
          if (!silent) {
            console.warn(`[Reindexador:CloudWarn] Almacenamiento remoto no disponible: ${cloudErr?.message}`);
          }
        }
      }

      // 7. Commit Atómico en el Repositorio Central con la etiqueta [vault-rebuild] [skip ci]
      if (!skipCommit) {
        const gitDir = path.join(repoRootDir, '.git');
        if (fs.existsSync(gitDir)) {
          try {
            const relManifestPath = path.relative(repoRootDir, manifestPath).replace(/\\/g, '/');
            const statusOutput = execSync(`git status --porcelain "${relManifestPath}"`, {
              cwd: repoRootDir,
              encoding: 'utf8'
            }).trim();

            if (statusOutput.length > 0) {
              execSync(`git add "${relManifestPath}"`, { cwd: repoRootDir, stdio: 'pipe' });
              const commitMessage = `[vault-rebuild] [skip ci]: auto-sanacion y reindexacion total de manifest.json (hash: ${versionHash.slice(0, 8)})`;
              execSync(`git commit -m "${commitMessage}"`, { cwd: repoRootDir, stdio: 'pipe' });
              commitSha = execSync('git rev-parse HEAD', { cwd: repoRootDir, encoding: 'utf8' }).trim();
              commitCreated = true;
              if (!silent) {
                console.log(`🔒 [Reindexador:GitOps] Commit atómico generado exitosamente: ${commitSha} (${commitMessage})`);
              }
            } else if (!silent) {
              console.log(`ℹ️ [Reindexador:GitOps] No hay cambios detectados por Git en ${relManifestPath}.`);
            }
          } catch (gitErr: any) {
            if (!silent) {
              console.warn(`⚠️ [Reindexador:GitWarn] No se pudo crear el commit automático: ${gitErr?.message}`);
            }
          }
        }
      }
    } else if (!silent) {
      console.log(`🔍 [Reindexador:DryRun] Escritura y commit omitidos por bandera --dry-run.`);
    }
  }

  if (!silent) {
    console.log(`\n================================================================`);
    console.log(`🏁 RECONSTRUCCIÓN CONCLUIDA: ${sortedEntries.length} memorias indexadas con éxito`);
    console.log(`================================================================\n`);
  }

  return {
    success: true,
    scannedFiles: markdownFiles.length,
    validMemories: sortedEntries.length,
    invalidFiles,
    versionHash,
    manifestPath,
    modified: isDifferent,
    commitCreated,
    commitSha,
    entries: sortedEntries
  };
}

// Invocación como script ejecutable CLI
if (
  process.argv[1] &&
  (process.argv[1].endsWith('rebuild-vault-manifest.ts') || process.argv[1].endsWith('rebuild-vault-manifest.js'))
) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const skipCommit = args.includes('--no-commit');
  const vaultDirIndex = args.indexOf('--vault-dir');
  const vaultDir = vaultDirIndex !== -1 && args[vaultDirIndex + 1] ? args[vaultDirIndex + 1] : undefined;
  const manifestPathIndex = args.indexOf('--manifest-path');
  const manifestPath = manifestPathIndex !== -1 && args[manifestPathIndex + 1] ? args[manifestPathIndex + 1] : undefined;

  rebuildVaultManifest({
    dryRun,
    skipCommit,
    vaultDir,
    manifestPath
  }).catch((err) => {
    console.error('❌ Error crítico durante la reindexación de la Bóveda Curricular:', err);
    process.exit(1);
  });
}
