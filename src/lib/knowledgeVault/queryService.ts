/**
 * @file queryService.ts
 * @description Servicio de recuperación de conocimiento curricular estructurado.
 * Permite consultas combinadas (grado, CEFR, habilidad, tema, etc.).
 * Por seguridad académica estricta, ÚNICAMENTE consume documentos 'approved' por defecto.
 * Diseñado con interfaz desacoplada para admitir búsqueda semántica/vectorial futura sin romper compatibilidad.
 */

import { KnowledgeVaultSyncService, PersistedKnowledgeDocRecord } from './syncService';
import { KnowledgeQueryFilter } from './types';

export class KnowledgeVaultQueryService {
  /**
   * Método principal de consulta (compatible con convenciones Service Object: QueryService.call(...)).
   */
  static async call(filter: KnowledgeQueryFilter = {}): Promise<PersistedKnowledgeDocRecord[]> {
    return this.query(filter);
  }

  /**
   * Recupera los documentos curriculares que satisfacen los filtros dados.
   */
  static async query(filter: KnowledgeQueryFilter = {}): Promise<PersistedKnowledgeDocRecord[]> {
    const localIndex = KnowledgeVaultSyncService.loadLocalIndex();
    let records = Array.from(localIndex.values());

    // 1. Filtrado de integridad: Descartar archivos marcados como faltantes en disco
    records = records.filter(r => !r.missing_on_disk);

    // 2. REGLA ESTRICTA DE SEGURIDAD ACADÉMICA:
    // Por defecto, sólo documentos con status: 'approved' pueden alimentar la generación con IA.
    if (filter.status) {
      const allowedStatuses = this.normalizeToArray(filter.status);
      records = records.filter(r => allowedStatuses.includes(r.status as import('./types').DocumentStatus));
    } else if (!filter.includeDrafts) {
      records = records.filter(r => r.status === 'approved');
    }

    // 3. Filtro por Grado Escolar (grades)
    if (filter.grade) {
      const targetGrades = this.normalizeToArray(filter.grade);
      records = records.filter(r => {
        if (!r.grades || !Array.isArray(r.grades)) return false;
        return targetGrades.some(tg => r.grades.includes(tg));
      });
    }

    // 4. Filtro por Nivel CEFR
    if (filter.cefr) {
      const targetCefrs = this.normalizeToArray(filter.cefr);
      records = records.filter(r => {
        if (!r.cefr || !Array.isArray(r.cefr)) return false;
        return targetCefrs.some(tc => r.cefr.includes(tc));
      });
    }

    // 5. Filtro por Habilidad Lingüística (skills)
    if (filter.skill) {
      const targetSkills = this.normalizeToArray(filter.skill);
      records = records.filter(r => {
        if (!r.skills || !Array.isArray(r.skills)) return false;
        return targetSkills.some(ts => r.skills.includes(ts));
      });
    }

    // 6. Filtro por Eje Temático (topics)
    if (filter.topic) {
      const targetTopics = this.normalizeToArray(filter.topic).map(t => String(t).toLowerCase());
      records = records.filter(r => {
        const topics = ((r.metadata?.topics as unknown[]) || []).map(t => String(t).toLowerCase());
        const docId = (r.document_id || '').toLowerCase();
        return targetTopics.some(tt => 
          topics.some(t => t === tt || t.includes(tt) || tt.includes(t)) ||
          docId.includes(tt)
        );
      });
    }

    // 7. Filtro por Subhabilidad (subskills)
    if (filter.subskill) {
      const targetSubskills = this.normalizeToArray(filter.subskill);
      records = records.filter(r => {
        const subskills = r.metadata?.subskills;
        if (!subskills || !Array.isArray(subskills)) return false;
        return targetSubskills.some(tss => subskills.includes(tss));
      });
    }

    // 8. Filtro por Dificultad (difficulty)
    if (filter.difficulty) {
      const targetDiffs = this.normalizeToArray(filter.difficulty) as string[];
      records = records.filter(r => {
        const diff = r.metadata?.difficulty as string | undefined;
        return diff ? targetDiffs.includes(diff) : false;
      });
    }

    // 9. Filtro por Etapa Escolar (school_stage o schoolStage)
    const schoolStageFilter = filter.schoolStage || filter.school_stage;
    if (schoolStageFilter) {
      const targetStages = this.normalizeToArray(schoolStageFilter);
      records = records.filter(r => {
        if (!r.school_stage || !Array.isArray(r.school_stage)) return false;
        return targetStages.some(ts => r.school_stage.includes(ts));
      });
    }

    // 10. Filtro por Función Comunicativa (languageFunction o language_function)
    const langFuncFilter = filter.languageFunction || filter.language_function;
    if (langFuncFilter) {
      const targetFunctions = this.normalizeToArray(langFuncFilter).map(f => String(f).toLowerCase());
      records = records.filter(r => {
        const funcs = ((r.metadata?.language_functions as unknown[]) || []).map(f => String(f).toLowerCase());
        const docId = (r.document_id || '').toLowerCase();
        return targetFunctions.some(tf => 
          docId === tf ||
          docId === `func_${tf}` ||
          docId.includes(tf) ||
          funcs.some(f => f === tf || f.includes(tf) || tf.includes(f))
        );
      });
    }

    return records;
  }

  /**
   * Obtiene un documento individual por su document_id.
   */
  static async getById(documentId: string): Promise<PersistedKnowledgeDocRecord | null> {
    const localIndex = KnowledgeVaultSyncService.loadLocalIndex();
    const doc = localIndex.get(documentId);
    return doc || null;
  }

  /**
   * Normaliza cualquier entrada a un array para facilitar comparaciones uniformes.
   */
  private static normalizeToArray<T>(val: T | T[]): T[] {
    if (Array.isArray(val)) return val;
    return [val];
  }
}
