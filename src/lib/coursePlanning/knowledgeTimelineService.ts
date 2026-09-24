/**
 * @file knowledgeTimelineService.ts
 * @description Servicio generador del Cronograma de Exposición Temporal de Conocimientos (Knowledge Timeline).
 * Permite visualizar cuándo, con qué frecuencia y bajo qué rol didáctico se enseña cada objetivo curricular.
 */

import { LessonEntity, KnowledgeTimelineReport } from './types';
import { SpiralCurriculumTracker } from './spiralCurriculumTracker';
import { KnowledgeVaultLoader } from '../knowledgeVault/loader';

export class KnowledgeTimelineService {
  /**
   * Genera el reporte estructurado de la línea de tiempo de conocimiento para un curso.
   */
  static generateReport(courseId: string, lessons: LessonEntity[]): KnowledgeTimelineReport {
    const rawTimeline = SpiralCurriculumTracker.track(lessons);
    
    // Enriquecer títulos con la Bóveda Curricular si están disponibles
    try {
      const allDocs = KnowledgeVaultLoader.loadAll();
      const docTitleMap = new Map<string, string>();
      for (const doc of allDocs) {
        docTitleMap.set(doc.documentId, doc.title);
      }
      
      for (const targetId of Object.keys(rawTimeline)) {
        if (docTitleMap.has(targetId)) {
          rawTimeline[targetId].title = docTitleMap.get(targetId)!;
        }
      }
    } catch {
      // Si la carga falla en entorno aislado, continuar con IDs
    }

    const singleExposureWarnings: string[] = [];
    for (const [id, node] of Object.entries(rawTimeline)) {
      if (node.is_single_exposure_warning) {
        singleExposureWarnings.push(id);
      }
    }

    return {
      course_id: courseId,
      total_nodes_tracked: Object.keys(rawTimeline).length,
      single_exposure_warnings: singleExposureWarnings,
      timeline: rawTimeline
    };
  }

  /**
   * Formatea el reporte como texto legible para CLI / consola.
   */
  static formatForCli(report: KnowledgeTimelineReport): string {
    const lines: string[] = [];
    lines.push(`================================================================`);
    lines.push(`⏳ LÍNEA DE TIEMPO CURRICULAR ESPIRAL [Curso: ${report.course_id}]`);
    lines.push(`================================================================`);
    lines.push(`Total Nodos Rastreados: ${report.total_nodes_tracked}`);
    lines.push(`Advertencias de Exposición Única (Teach Once): ${report.single_exposure_warnings.length}`);
    lines.push(``);

    for (const [id, node] of Object.entries(report.timeline)) {
      const statusIcon = node.is_single_exposure_warning ? '⚠️ [Única Vez]' : '🔄 [Espiral]';
      lines.push(`${statusIcon} ${id} ("${node.title}") — ${node.total_exposures} exposiciones:`);
      
      for (const exp of node.exposures) {
        lines.push(`    • Sem ${exp.week.toString().padStart(2, ' ')} [${exp.role.toUpperCase().padEnd(11, ' ')}] → ${exp.lesson_title}`);
      }
      lines.push(``);
    }

    return lines.join('\n');
  }
}
