/**
 * @file traceabilityStore.ts
 * @description Almacén de trazabilidad curricular y auditoría de generaciones educativas de iSchool.
 * Registra cada generación con su linaje completo (IDs de documentos del Knowledge Vault, versiones y checksums SHA256),
 * versión de prompt, respuesta cruda, salida parseada y resultado de validación.
 * Permite saber con precisión matemática: «¿Con qué versión de conocimiento académico fue creada esta actividad?».
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { TraceabilityRecord } from './types';
import { supabase } from '../supabaseClient';

export class AcademicGenerationTraceabilityStore {
  private static resolvedDir: string | null = null;

  /**
   * Asegura que el directorio de almacenamiento exista (con respaldo en /tmp para entornos cloud serverless).
   */
  private static ensureStorageDir(): string {
    if (this.resolvedDir && fs.existsSync(/*turbopackIgnore: true*/ this.resolvedDir)) {
      return this.resolvedDir;
    }
    const primaryDir = path.resolve(/*turbopackIgnore: true*/ process.cwd(), '.generations');
    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ primaryDir)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ primaryDir, { recursive: true });
      }
      this.resolvedDir = primaryDir;
      return primaryDir;
    } catch {
      const fallbackDir = path.join(os.tmpdir(), 'iskool-generations');
      if (!fs.existsSync(/*turbopackIgnore: true*/ fallbackDir)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ fallbackDir, { recursive: true });
      }
      this.resolvedDir = fallbackDir;
      return fallbackDir;
    }
  }

  /**
   * Persiste un registro completo de trazabilidad en disco y sincroniza con Supabase si está disponible.
   */
  static async save(record: TraceabilityRecord): Promise<void> {
    try {
      const storageDir = this.ensureStorageDir();

      // 1. Persistencia local inmediata (archivo JSON individual nombrado por generation_id)
      const filePath = path.join(storageDir, `${record.generation_id}.json`);
      fs.writeFileSync(/*turbopackIgnore: true*/ filePath, JSON.stringify(record, null, 2), 'utf-8');

      // 2. Apéndice en el registro histórico consolidado (JSONL)
      const journalPath = path.join(storageDir, 'generation_journal.jsonl');
      const summaryLine = JSON.stringify({
        generation_id: record.generation_id,
        grade: record.request.grade,
        cefr: record.request.cefr,
        skill: record.request.skill,
        topic: record.request.topic,
        activity_type: record.request.activity_type,
        knowledge_doc_count: record.knowledge_document_ids.length,
        prompt_version: record.prompt_version,
        model: record.model,
        validation_valid: record.validation.valid,
        created_at: record.created_at
      }) + '\n';
      fs.appendFileSync(/*turbopackIgnore: true*/ journalPath, summaryLine, 'utf-8');
    } catch {
      // Continuar de forma resiliente en entornos efímeros de solo lectura
    }

    // 3. Intento de persistencia en Supabase (si existe la tabla o infraestructura)
    try {
      if (supabase) {
        await supabase.from('academic_generations').insert({
          generation_id: record.generation_id,
          grade: record.request.grade,
          cefr: record.request.cefr,
          skill: record.request.skill,
          topic: record.request.topic,
          language_function: record.request.language_function,
          activity_type: record.request.activity_type,
          prompt_version: record.prompt_version,
          model: record.model,
          knowledge_document_ids: record.knowledge_document_ids,
          knowledge_versions: record.knowledge_versions,
          generated_output: record.generated_output,
          validation_status: record.validation.valid ? 'passed' : 'failed',
          created_at: record.created_at
        });
      }
    } catch {
      // Si la tabla remota no existe aún en Supabase en esta fase, no bloquea el flujo principal
    }
  }

  /**
   * Recupera un registro de trazabilidad por su ID.
   */
  static async getById(generationId: string): Promise<TraceabilityRecord | null> {
    const storageDir = this.ensureStorageDir();
    const filePath = path.join(storageDir, `${generationId}.json`);
    if (!fs.existsSync(/*turbopackIgnore: true*/ filePath)) {
      return null;
    }
    const content = fs.readFileSync(/*turbopackIgnore: true*/ filePath, 'utf-8');
    return JSON.parse(content) as TraceabilityRecord;
  }

  /**
   * Lista todos los registros de generaciones guardadas.
   */
  static async listAll(): Promise<TraceabilityRecord[]> {
    const storageDir = this.ensureStorageDir();
    const files = fs.readdirSync(/*turbopackIgnore: true*/ storageDir).filter(f => f.endsWith('.json') && !f.startsWith('journal'));
    const records: TraceabilityRecord[] = [];
    for (const f of files) {
      try {
        const full = path.join(storageDir, f);
        const data = JSON.parse(fs.readFileSync(/*turbopackIgnore: true*/ full, 'utf-8'));
        records.push(data);
      } catch {
        // Ignorar archivos corruptos
      }
    }
    return records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
