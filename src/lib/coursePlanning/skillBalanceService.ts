/**
 * @file skillBalanceService.ts
 * @description Servicio de análisis y diagnóstico del equilibrio didáctico de habilidades (Skill Balance).
 * Audita la distribución de Listening, Speaking, Reading, Writing, Grammar y Vocabulary,
 * detectando desequilibrios pedagógicos graves (e.g., 75 actividades de gramática vs 2 de expresión oral).
 */

import { LessonEntity, ActivitySlotEntity, SkillBalanceReport } from './types';

export class SkillBalanceService {
  /**
   * Calcula el balance de habilidades a partir de las lecciones y sus slots.
   */
  static analyze(lessons: LessonEntity[], slots: ActivitySlotEntity[] = []): SkillBalanceReport {
    const counts: Record<string, number> = {
      listening: 0,
      speaking: 0,
      reading: 0,
      writing: 0,
      grammar: 0,
      vocabulary: 0
    };

    // 1. Contar a nivel de lecciones
    for (const lesson of lessons) {
      const titleLower = lesson.title.toLowerCase();
      const outcomeLower = lesson.primary_learning_outcome.toLowerCase();
      const targetsStr = (lesson.knowledge_targets || []).join(' ').toLowerCase();

      if (titleLower.includes('listening') || targetsStr.includes('listening')) counts.listening++;
      if (titleLower.includes('speaking') || targetsStr.includes('speaking') || outcomeLower.includes('debate') || outcomeLower.includes('discuss')) counts.speaking++;
      if (titleLower.includes('reading') || targetsStr.includes('reading')) counts.reading++;
      if (titleLower.includes('writing') || targetsStr.includes('writing') || outcomeLower.includes('essay') || outcomeLower.includes('proposal')) counts.writing++;
      if (targetsStr.includes('grammar') || outcomeLower.includes('conditional') || outcomeLower.includes('passive')) counts.grammar++;
      if (targetsStr.includes('vocab') || outcomeLower.includes('collocations') || outcomeLower.includes('lexicon')) counts.vocabulary++;
    }

    // 2. Si hay slots específicos, añadir su granularidad
    for (const slot of slots) {
      const pattern = (slot.activity_pattern || '').toLowerCase();
      if (pattern.includes('listening')) counts.listening += 0.5;
      if (pattern.includes('interview') || pattern.includes('debate') || pattern.includes('discussion')) counts.speaking += 0.5;
      if (pattern.includes('reading') || pattern.includes('jigsaw')) counts.reading += 0.5;
      if (pattern.includes('paragraph') || pattern.includes('writing')) counts.writing += 0.5;
    }

    const totalPoints = Object.values(counts).reduce((sum, v) => sum + v, 0);
    const percentages: Record<string, number> = {};
    const warnings: string[] = [];

    for (const [skill, count] of Object.entries(counts)) {
      const pct = totalPoints > 0 ? Math.round((count / totalPoints) * 100) : 0;
      percentages[skill] = pct;
    }

    // Reglas de diagnóstico de desequilibrio:
    // 1. Habla oral por debajo del 15% en un currículo comunicativo
    if (percentages.speaking < 15) {
      warnings.push(`⚠️ Desbalance crítico en Speaking: representa solo el ${percentages.speaking}% del tiempo lectivo (mínimo recomendado: 20%).`);
    }
    // 2. Sobresaturación gramatical aislada (>35%)
    if (percentages.grammar > 35) {
      warnings.push(`⚠️ Saturación excesiva de Grammar: representa el ${percentages.grammar}% del curso, vulnerando el principio comunicativo (máximo recomendado: 25%).`);
    }
    // 3. Omisión o sub-representación de Listening (<10%)
    if (percentages.listening < 10) {
      warnings.push(`⚠️ Comprensión auditiva (Listening) deficitaria: representa solo el ${percentages.listening}% del curso.`);
    }

    const isBalanced = warnings.length === 0;

    return {
      total_slots: lessons.length,
      skill_counts: counts,
      skill_percentages: percentages,
      warnings,
      is_balanced: isBalanced
    };
  }

  /**
   * Formateo textual para CLI.
   */
  static formatForCli(report: SkillBalanceReport): string {
    const lines: string[] = [];
    lines.push(`================================================================`);
    lines.push(`📊 BALANCE PEDAGÓGICO DE HABILIDADES (Skill Balance)`);
    lines.push(`================================================================`);
    lines.push(`Estado: ${report.is_balanced ? '🟢 EQUILIBRADO' : '⚠️ REQUIERE AJUSTE'}`);
    lines.push(``);
    lines.push(`Distribución Porcentual:`);
    for (const [skill, pct] of Object.entries(report.skill_percentages)) {
      const bar = '█'.repeat(Math.round(pct / 4)) + '░'.repeat(25 - Math.round(pct / 4));
      lines.push(`  • ${skill.toUpperCase().padEnd(12, ' ')}: ${pct.toString().padStart(2, ' ')}% [${bar}] (${report.skill_counts[skill]} unidades/slots)`);
    }
    lines.push(``);
    if (report.warnings.length > 0) {
      lines.push(`Alertas de Desbalance:`);
      for (const w of report.warnings) {
        lines.push(`  ${w}`);
      }
    } else {
      lines.push(`✅ Distribución armónica: Ninguna macro-habilidad desatendida.`);
    }

    return lines.join('\n');
  }
}
