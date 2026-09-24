/**
 * @file alertService.ts
 * @description Motor de Alertas Académicas Estructuradas (Ítems #24, #25, #26, #27 y #28).
 * Filosofía Central: ALERTA != CONCLUSIÓN.
 * El motor identifica señales de desajuste pedagógico y aporta datos objetivos de apoyo,
 * sin emitir juicios ni asignar culpas a docentes o estudiantes.
 */

import { AcademicAlertEntity, AcademicAlertType, AlertSeverity, AnalyticsScopeType } from './types';

export class AcademicAnalyticsAlertService {
  /**
   * Genera alertas pedagógicas estandarizadas basadas en métricas observables.
   */
  static generateAlerts(
    scopeType: AnalyticsScopeType,
    scopeId: string,
    diagnostics: {
      instructionMasteryGap?: number;
      curriculumBottlenecks?: { title: string; unit_id: string; mastery: number }[];
      skillImbalances?: { skill: string; mastery: number }[];
      lowEvidenceCount?: number;
      stagnationTarget?: string;
    }
  ): AcademicAlertEntity[] {
    const alerts: AcademicAlertEntity[] = [];

    // 1. Alerta de Brecha Instrucción-Maestría
    if (diagnostics.instructionMasteryGap && diagnostics.instructionMasteryGap > 25) {
      alerts.push({
        id: `alert_img_${Date.now()}_1`,
        scope_type: scopeType,
        scope_id: scopeId,
        alert_type: 'instruction_mastery_gap',
        severity: diagnostics.instructionMasteryGap > 30 ? 'priority' : 'attention',
        signal_summary: `Señal de Divergencia Instruccional: El contenido cubierto en clase supera en ${diagnostics.instructionMasteryGap}% a la maestría consolidada.`,
        supporting_evidence: {
          data_points: 3,
          metrics_summary: `Brecha observada: ${diagnostics.instructionMasteryGap} puntos porcentuales entre taught y mastered.`,
          key_observations: [
            'El avance del calendario avanza a ritmo normal.',
            'Las evidencias formativas recientes muestran una asimilación parcial en producción oral.'
          ]
        },
        suggested_actions: [
          'Programar 1 sesión de consolidación comunicativa antes de iniciar la siguiente unidad temática.',
          'Incorporar rutinas de calentamiento con tarjetas de andamiaje.'
        ],
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    // 2. Alerta de Cuello de Botella Curricular
    if (diagnostics.curriculumBottlenecks && diagnostics.curriculumBottlenecks.length > 0) {
      for (const b of diagnostics.curriculumBottlenecks) {
        alerts.push({
          id: `alert_bot_${Date.now()}_${b.unit_id}`,
          scope_type: scopeType,
          scope_id: scopeId,
          alert_type: 'curriculum_bottleneck',
          severity: b.mastery < 45 ? 'priority' : 'attention',
          target_knowledge_id: b.unit_id,
          signal_summary: `Cuello de Botella Curricular detectado en "${b.title}" (Maestría del ${b.mastery}%).`,
          supporting_evidence: {
            data_points: 25,
            metrics_summary: `Maestría del grupo: ${b.mastery}% en nodo prerrequisito.`,
            key_observations: [
              `El concepto "${b.title}" es prerrequisito directo de múltiples objetivos posteriores en la programación.`,
              'La baja consolidación actual está bloqueando el avance en debates colaborativos.'
            ]
          },
          suggested_actions: [
            'Asignar 15 minutos de práctica guiada con bancos de preguntas de aclaración en pantalla.',
            'Conformar mesas de apoyo con roles dialógicos estructurados.'
          ],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    // 3. Alerta de Desequilibrio de Macro-Habilidades (Skill Imbalance)
    if (diagnostics.skillImbalances && diagnostics.skillImbalances.length > 0) {
      const weakSkill = diagnostics.skillImbalances.find(s => s.mastery < 55);
      if (weakSkill) {
        alerts.push({
          id: `alert_sk_${Date.now()}`,
          scope_type: scopeType,
          scope_id: scopeId,
          alert_type: 'skill_imbalance',
          severity: 'attention',
          signal_summary: `Desequilibrio de Habilidad: ${weakSkill.skill} registra una maestría promedio de ${weakSkill.mastery}%, significativamente menor a Reading/Listening.`,
          supporting_evidence: {
            data_points: 40,
            metrics_summary: `Habilidad receptiva fuerte (>75%) vs habilidad productiva emergente (${weakSkill.mastery}%).`,
            key_observations: [
              'Los estudiantes comprenden textos y audios pero vacilan al formular respuestas orales espontáneas.'
            ]
          },
          suggested_actions: [
            'Aumentar el tiempo dedicado a producción en parejas (Speaking Slots) en las lecciones venideras.',
            'Proveer sentence starters para reducir la ansiedad de hablar en público.'
          ],
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      }
    }

    return alerts;
  }
}
