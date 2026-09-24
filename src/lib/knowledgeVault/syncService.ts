/**
 * @file syncService.ts
 * @description Servicio de sincronización del Knowledge Vault con la base de datos (PostgreSQL/Supabase)
 * y el almacén local persistente con control criptográfico de Checksums (SHA256).
 * Implementa política no destructiva para documentos eliminados o modificados.
 */

import fs from 'fs';
import path from 'path';
import { supabase } from '@/lib/supabaseClient';
import { KnowledgeVaultLoader } from './loader';
import { KnowledgeVaultValidator } from './validator';
import {
  SyncOperationReport,
  KnowledgeVaultStats
} from './types';

export interface PersistedKnowledgeDocRecord {
  id: string;
  document_id: string;
  path: string;
  title: string;
  document_type: string;
  school_stage: string[];
  grades: string[];
  cefr: string[];
  skills: string[];
  metadata: Record<string, unknown>;
  content: string;
  source_ids: string[];
  status: string;
  version: number;
  checksum: string;
  indexed_at: string;
  missing_on_disk?: boolean;
}

export class KnowledgeVaultSyncService {
  /**
   * Ruta del archivo de índice local para resiliencia offline y pruebas.
   */
  static getLocalIndexFilePath(): string {
    const dir = path.join(process.cwd(), 'knowledge', 'english', '.index');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return path.join(dir, 'knowledge_documents.json');
  }

  /**
   * Lee el índice persistido local.
   */
  static loadLocalIndex(): Map<string, PersistedKnowledgeDocRecord> {
    const indexPath = this.getLocalIndexFilePath();
    if (!fs.existsSync(indexPath)) {
      return new Map();
    }
    try {
      const data = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
      const map = new Map<string, PersistedKnowledgeDocRecord>();
      if (Array.isArray(data)) {
        for (const item of data) {
          map.set(item.document_id, item);
        }
      }
      return map;
    } catch {
      return new Map();
    }
  }

  /**
   * Guarda el índice persistido localmente.
   */
  static saveLocalIndex(records: PersistedKnowledgeDocRecord[]): void {
    const indexPath = this.getLocalIndexFilePath();
    fs.writeFileSync(indexPath, JSON.stringify(records, null, 2), 'utf8');
  }

  /**
   * Ejecuta la sincronización completa del Vault con detección de cambios por Checksum.
   */
  static async sync(options: {
    vaultPath?: string;
    force?: boolean;
    skipDatabase?: boolean;
  } = {}): Promise<SyncOperationReport> {
    const docs = KnowledgeVaultLoader.loadAll(options.vaultPath);
    const existingIndex = this.loadLocalIndex();

    let createdCount = 0;
    let updatedCount = 0;
    let unchangedCount = 0;
    let deprecatedCount = 0;
    let errorCount = 0;

    const details: SyncOperationReport['details'] = [];
    const activeDocIds = new Set<string>();
    const updatedRecords: PersistedKnowledgeDocRecord[] = [];

    for (const doc of docs) {
      activeDocIds.add(doc.documentId);

      // 1. Validar el documento antes de sincronizar
      const valResult = KnowledgeVaultValidator.validate(doc);
      if (!valResult.valid) {
        errorCount++;
        details.push({
          documentId: doc.documentId,
          filePath: doc.relativePath,
          action: 'error',
          reason: valResult.errors.map(e => e.message).join('; ')
        });
        continue;
      }

      const existing = existingIndex.get(doc.documentId);

      // 2. Comparación de Checksum
      if (existing && existing.checksum === doc.checksum && !options.force) {
        unchangedCount++;
        updatedRecords.push(existing);
        details.push({
          documentId: doc.documentId,
          filePath: doc.relativePath,
          action: 'unchanged'
        });
        continue;
      }

      // 3. Preparar registro persistido
      const nowIso = new Date().toISOString();
      const isNew = !existing;

      const record: PersistedKnowledgeDocRecord = {
        id: existing?.id || crypto.randomUUID(),
        document_id: doc.documentId,
        path: doc.relativePath,
        title: doc.title,
        document_type: doc.type,
        school_stage: doc.frontmatter.school_stage,
        grades: doc.frontmatter.grades,
        cefr: doc.frontmatter.cefr,
        skills: doc.frontmatter.skills,
        metadata: {
          ...doc.frontmatter,
          wikiLinks: doc.wikiLinks,
          difficulty: doc.frontmatter.difficulty,
          duration_minutes: doc.frontmatter.duration_minutes,
          cambridge_alignment: doc.frontmatter.cambridge_alignment
        },
        content: doc.markdownBody,
        source_ids: doc.frontmatter.source_ids,
        status: doc.frontmatter.status,
        version: doc.frontmatter.version,
        checksum: doc.checksum,
        indexed_at: nowIso,
        missing_on_disk: false
      };

      updatedRecords.push(record);

      if (isNew) {
        createdCount++;
        details.push({
          documentId: doc.documentId,
          filePath: doc.relativePath,
          action: 'created'
        });
      } else {
        updatedCount++;
        details.push({
          documentId: doc.documentId,
          filePath: doc.relativePath,
          action: 'updated'
        });
      }

      // 4. Sincronización en Supabase PostgreSQL si está habilitado
      if (!options.skipDatabase) {
        try {
          await supabase.from('knowledge_documents').upsert({
            document_id: record.document_id,
            path: record.path,
            title: record.title,
            document_type: record.document_type,
            school_stage: record.school_stage,
            grades: record.grades,
            cefr: record.cefr,
            skills: record.skills,
            metadata: record.metadata,
            content: record.content,
            source_ids: record.source_ids,
            status: record.status,
            version: record.version,
            checksum: record.checksum,
            indexed_at: record.indexed_at
          }, { onConflict: 'document_id' });
        } catch {
          // Si la tabla no está creada aún en la base remota, la persistencia local asegura el funcionamiento
        }
      }
    }

    // 5. Política no destructiva para documentos eliminados del disco:
    // En lugar de borrar silenciosamente en BD, se marcan como deprecated / missing_on_disk
    for (const [docId, prevRecord] of existingIndex.entries()) {
      if (!activeDocIds.has(docId)) {
        const deprecatedRecord: PersistedKnowledgeDocRecord = {
          ...prevRecord,
          status: 'deprecated',
          missing_on_disk: true,
          indexed_at: new Date().toISOString()
        };
        updatedRecords.push(deprecatedRecord);
        deprecatedCount++;
        details.push({
          documentId: docId,
          filePath: prevRecord.path,
          action: 'deprecated',
          reason: 'Archivo no encontrado en disco; archivado como deprecated para prevenir borrado silencioso.'
        });

        if (!options.skipDatabase) {
          try {
            await supabase.from('knowledge_documents').update({
              status: 'deprecated',
              updated_at: new Date().toISOString()
            }).eq('document_id', docId);
          } catch {}
        }
      }
    }

    // Guardar el índice persistente local
    this.saveLocalIndex(updatedRecords);

    return {
      createdCount,
      updatedCount,
      unchangedCount,
      deprecatedCount,
      errorCount,
      details
    };
  }

  /**
   * Genera estadísticas de cobertura curricular e identifica posibles huecos.
   */
  static getStats(): KnowledgeVaultStats {
    const localIndex = this.loadLocalIndex();
    const records = Array.from(localIndex.values());

    const byStage: Record<string, number> = {
      preschool: 0,
      primary: 0,
      secondary: 0,
      high_school: 0,
      advanced: 0
    };

    const byCefr: Record<string, number> = {
      Foundation: 0,
      'Pre-A1': 0,
      A1: 0,
      A2: 0,
      B1: 0,
      B2: 0,
      C1: 0,
      C2: 0
    };

    const byStatus = {
      draft: 0,
      review: 0,
      approved: 0,
      deprecated: 0
    };

    const bySkill: Record<string, number> = {};
    const byGrade: Record<string, number> = {};
    const byCambridge: Record<string, number> = {};

    for (const rec of records) {
      if (rec.missing_on_disk) continue;

      const st = rec.status as keyof typeof byStatus;
      if (byStatus[st] !== undefined) byStatus[st]++;

      for (const stage of rec.school_stage || []) {
        byStage[stage] = (byStage[stage] || 0) + 1;
      }

      for (const c of rec.cefr || []) {
        byCefr[c] = (byCefr[c] || 0) + 1;
      }

      for (const g of rec.grades || []) {
        byGrade[g] = (byGrade[g] || 0) + 1;
      }

      for (const sk of rec.skills || []) {
        bySkill[sk] = (bySkill[sk] || 0) + 1;
      }

      const cambridge = rec.metadata?.cambridge_alignment;
      if (Array.isArray(cambridge)) {
        for (const ca of cambridge) {
          byCambridge[ca] = (byCambridge[ca] || 0) + 1;
        }
      }
    }

    // Identificar huecos curriculares (niveles esperados con 0 documentos)
    const missingCurricularGaps: KnowledgeVaultStats['missingCurricularGaps'] = [];
    if (byCefr['C2'] === 0) {
      missingCurricularGaps.push({
        stage: 'advanced',
        cefr: 'C2',
        description: 'No existen nodos aprobados para nivel C2 (Maestría / Proficiency).'
      });
    }

    return {
      totalDocuments: records.filter(r => !r.missing_on_disk).length,
      byStage,
      byGrade,
      byCefr,
      bySkill,
      byStatus,
      byCambridge,
      missingCurricularGaps
    };
  }
}
