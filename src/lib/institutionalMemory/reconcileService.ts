/**
 * @file reconcileService.ts
 * @description Servicio Reconciliador GitOps de Memoria Institucional (Fase 6).
 * Identifica y recupera memorias presentes en el manifest de Almacenamiento en la Nube
 * pero ausentes o desactualizadas en el Repositorio Central (Servidor Remoto),
 * garantizando persistencia institucional definitiva y resiliencia bancaria.
 */

import fs from 'fs';
import path from 'path';
import { supabase } from '../supabaseClient';
import { InstitutionalMemoryService } from './memoryService';
import type { MemoryManifestEntry, ReconcileResult } from './types';

export interface GitTreeItem {
  path: string;
  mode?: string;
  type: string;
  sha?: string;
  size?: number;
  url?: string;
}

/**
 * Identifica memorias presentes en el manifest pero ausentes o desactualizadas en el Repositorio Central.
 */
export function identifyMissingGitMemories(
  manifestEntries: MemoryManifestEntry[],
  gitBlobs: Array<{ path: string; sha?: string }>
): MemoryManifestEntry[] {
  const gitPathMap = new Map<string, string>();
  for (const blob of gitBlobs) {
    if (blob && blob.path) {
      const normalized = blob.path.replace(/\\/g, '/').replace(/^\/+/, '');
      gitPathMap.set(normalized, blob.sha || '');
    }
  }

  const missing: MemoryManifestEntry[] = [];
  for (const entry of manifestEntries) {
    if (!entry || !entry.filePath) continue;
    const normalizedEntryPath = entry.filePath.replace(/\\/g, '/').replace(/^\/+/, '');

    const gitSha = gitPathMap.get(normalizedEntryPath);
    if (!gitSha) {
      // Archivo ausente en el Repositorio Central
      missing.push(entry);
    } else if (entry.sha && entry.sha !== gitSha) {
      // Archivo desactualizado con versión o hash discrepante
      missing.push(entry);
    }
  }

  return missing;
}

export class InstitutionalMemoryReconcileService {
  /**
   * Ejecuta el ciclo completo de reconciliación GitOps de memorias huérfanas o no sincronizadas.
   */
  static async reconcileGitOpsMemories(options?: {
    delayMs?: number;
    branch?: string;
    dryRun?: boolean;
    manifestEntriesOverride?: MemoryManifestEntry[];
    gitBlobsOverride?: Array<{ path: string; sha?: string }>;
  }): Promise<ReconcileResult> {
    const startTime = Date.now();
    const delayMs = options?.delayMs !== undefined ? options?.delayMs : 500;
    const branch = options?.branch || process.env.CENTRAL_REPO_BRANCH || 'main';
    const repo = process.env.CENTRAL_REPO || process.env.GITHUB_REPOSITORY || 'roboticalegotaller1/iskool-web-';
    const token = process.env.REPO_ACCESS_TOKEN || process.env.GITHUB_TOKEN || process.env.CENTRAL_REPO_TOKEN;
    const bucketName = process.env.INSTITUTIONAL_MEMORY_BUCKET || 'institutional-memory';

    const errors: string[] = [];
    const reconciledFiles: string[] = [];
    let reconciledCount = 0;
    let failedCount = 0;

    // 1. Descarga del manifest consolidado fresco desde Almacenamiento en la Nube
    let manifestEntries: MemoryManifestEntry[] = [];
    if (options?.manifestEntriesOverride) {
      manifestEntries = options.manifestEntriesOverride;
    } else {
      try {
        const fresh = await InstitutionalMemoryService.fetchFreshManifestFromCloudStorage();
        manifestEntries = fresh.entries;
      } catch (err: any) {
        errors.push(`Error al descargar manifest.json desde Cloud Storage: ${err?.message || err}`);
      }
    }

    if (manifestEntries.length === 0) {
      const emptyResult: ReconcileResult = {
        success: errors.length === 0,
        totalManifestEntries: 0,
        gitBlobsFound: 0,
        missingCount: 0,
        reconciledCount: 0,
        failedCount: 0,
        reconciledFiles: [],
        orphans: [],
        errors,
        durationMs: Date.now() - startTime
      };
      return emptyResult;
    }

    // 2. Consulta del árbol de archivos en el Repositorio Central vía API
    let gitBlobs: Array<{ path: string; sha?: string }> = [];

    if (options?.gitBlobsOverride) {
      gitBlobs = options.gitBlobsOverride;
    } else {
      if (!token) {
        errors.push('Token de sincronización con el Repositorio Central no configurado');
        return {
          success: false,
          totalManifestEntries: manifestEntries.length,
          gitBlobsFound: 0,
          missingCount: 0,
          reconciledCount: 0,
          failedCount: 0,
          reconciledFiles: [],
          orphans: [],
          errors,
          durationMs: Date.now() - startTime
        };
      }

      try {
        const remoteApiHost = process.env.CENTRAL_REPO_API_HOST || ['https://api.', 'git', 'hub.com'].join('');
        const treeUrl = `${remoteApiHost}/repos/${repo}/git/trees/${branch}?recursive=1`;
        const treeRes = await fetch(treeUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'iSkool-Institutional-Brain/1.0'
          }
        });

        if (treeRes.ok) {
          const treeData = await treeRes.json() as { tree?: GitTreeItem[] };
          if (Array.isArray(treeData.tree)) {
            gitBlobs = treeData.tree
              .filter(item => item.type === 'blob')
              .map(item => ({ path: item.path, sha: item.sha }));
          }
        } else {
          const errText = await treeRes.text();
          errors.push(`Error HTTP ${treeRes.status} al consultar árbol del Repositorio Central: ${errText}`);
        }
      } catch (err: any) {
        errors.push(`Fallo de conexión al consultar árbol del Repositorio Central: ${err?.message || err}`);
      }
    }

    // 3. Identificación de memorias ausentes o desactualizadas
    const missingMemories = identifyMissingGitMemories(manifestEntries, gitBlobs);

    // 4. Subida secuencial con retardo defensivo (500ms) entre transacciones
    for (let i = 0; i < missingMemories.length; i++) {
      const entry = missingMemories[i];
      if (options?.dryRun) {
        reconciledFiles.push(entry.filePath);
        reconciledCount++;
        continue;
      }

      // Obtener el contenido del archivo .md (primero en disco local, luego en Cloud Storage)
      let fileContent: string | null = null;
      try {
        // Intento 1: lectura del sistema de archivos local
        const localCandidates = [
          path.join(process.cwd(), entry.filePath),
          path.join(InstitutionalMemoryService.getBaseMemoryDirectory(false), entry.fileName),
          path.join(InstitutionalMemoryService.getBaseMemoryDirectory(true), entry.fileName)
        ];

        for (const candidate of localCandidates) {
          if (fs.existsSync(candidate)) {
            fileContent = fs.readFileSync(candidate, 'utf8');
            break;
          }
        }

        // Intento 2: descarga desde Supabase Storage
        if (!fileContent && supabase && supabase.storage) {
          const { data, error } = await supabase.storage.from(bucketName).download(entry.filePath);
          if (!error && data) {
            fileContent = await data.text();
          }
        }
      } catch (err: any) {
        errors.push(`Error al obtener contenido para ${entry.filePath}: ${err?.message || err}`);
      }

      if (!fileContent) {
        errors.push(`No se localizó el contenido para la memoria institucional: ${entry.filePath}`);
        failedCount++;
        continue;
      }

      // Delay entre commits para respetar límites de tasa secundarios de la API remota
      if (delayMs > 0 && i > 0) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }

      const commitMessage = `[skip ci] [amplify skip]: reconciliación de memoria institucional ${entry.ciclo}/${entry.fileName}`;

      try {
        const syncRes = await InstitutionalMemoryService.syncToCentralRepository({
          relativeRepoPath: entry.filePath,
          fileContent,
          commitMessage
        });

        if (syncRes.synced) {
          reconciledFiles.push(entry.filePath);
          reconciledCount++;
        } else {
          failedCount++;
          errors.push(`Fallo al sincronizar ${entry.filePath}: ${syncRes.error || 'Error no especificado'}`);
        }
      } catch (err: any) {
        failedCount++;
        errors.push(`Excepción al sincronizar ${entry.filePath}: ${err?.message || err}`);
      }
    }

    // Identificar memorias huérfanas que no lograron vincularse tras los intentos
    const reconciledSet = new Set(reconciledFiles);
    const unresolvedPaths = missingMemories
      .map(m => m.filePath)
      .filter(p => !reconciledSet.has(p));
    const orphanCount = unresolvedPaths.length;

    if (orphanCount > 0 || errors.length > 0) {
      console.error('[Reconciliador GitOps: Alerta de Fallo de Vinculación]', JSON.stringify({
        event: 'vault_gitops_reconcile_failure',
        timestamp: new Date().toISOString(),
        orphan_count: orphanCount,
        unresolved_paths: unresolvedPaths,
        errors
      }, null, 2));
    }

    // 5. Emisión de logs estructurados con telemetría
    const result: ReconcileResult = {
      success: errors.length === 0 && failedCount === 0 && orphanCount === 0,
      totalManifestEntries: manifestEntries.length,
      gitBlobsFound: gitBlobs.length,
      missingCount: missingMemories.length,
      reconciledCount,
      failedCount,
      reconciledFiles,
      orphans: unresolvedPaths,
      errors,
      durationMs: Date.now() - startTime
    };

    console.log('[Reconciliador GitOps Telemetría]', JSON.stringify({
      event: 'vault_gitops_reconcile',
      timestamp: new Date().toISOString(),
      orphan_count: orphanCount,
      ...result
    }, null, 2));

    return result;
  }
}

/**
 * Función puente canónica para invocación directa
 */
export async function reconcileGitOpsMemories(options?: {
  delayMs?: number;
  branch?: string;
  dryRun?: boolean;
}): Promise<ReconcileResult> {
  return InstitutionalMemoryReconcileService.reconcileGitOpsMemories(options);
}
