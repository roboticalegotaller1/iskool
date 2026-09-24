/**
 * @file traceabilityStore.ts
 * @description Almacén de trazabilidad curricular y auditoría de generaciones educativas de iSchool.
 * Registra cada generación con su linaje completo (IDs de documentos del Knowledge Vault, versiones y checksums SHA256),
 * versión de prompt, respuesta cruda, salida parseada y resultado de validación.
 * Permite saber con precisión matemática: «¿Con qué versión de conocimiento académico fue creada esta actividad?».
 */

import fs from 'fs';
import path from 'path';
import { TraceabilityRecord } from './types';
import { supabase } from '../supabaseClient';

export class AcademicGenerationTraceabilityStore {
  private static readonly STORAGE_DIR = path.resolve(process.cwd(), '.generations');

  /**
   * Asegura que el directorio de almacenamiento local exista.
   */
  private static ensureStorageDir(): void {
    if (!fs.existsSync(this.STORAGE_DIR)) {
      fs.mkdirSync(this.STORAGE_DIR, { recursive: true });
    }
  }

  /**
   * Persiste un registro completo de trazabilidad en disco y sincroniza con Supabase si está disponible.
   */
  static async save(record: TraceabilityRecord): Promise<void> {
    this.ensureStorageDir();

    // 1. Persistencia local inmediata (archivo JSON individual nombrado por generation_id)
    const filePath = path.join(this.STORAGE_DIR, `${record.generation_id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), 'utf-8');

    // 2. Apéndice en el registro histórico consolidado (JSONL)
    const journalPath = path.join(this.STORAGE_DIR, 'generation_journal.jsonl');
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
    fs.appendFileSync(journalPath, summaryLine, 'utf-8');

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
    this.ensureStorageDir();
    const filePath = path.join(this.STORAGE_DIR, `${generationId}.json`);
    if (!fs.existsSync(filePath)) {
      return null;
    }
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as TraceabilityRecord;
  }

  /**
   * Lista todos los registros de generaciones guardadas.
   */
  static async listAll(): Promise<TraceabilityRecord[]> {
    this.ensureStorageDir();
    const files = fs.readdirSync(this.STORAGE_DIR).filter(f => f.endsWith('.json') && !f.startsWith('journal'));
    const records: TraceabilityRecord[] = [];
    for (const f of files) {
      try {
        const full = path.join(this.STORAGE_DIR, f);
        const data = JSON.parse(fs.readFileSync(full, 'utf-8'));
        records.push(data);
      } catch {
        // Ignorar archivos corruptos
      }
    }
    return records.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }
}
