/**
 * @file leadership_cli.ts
 * @description Interfaz de Línea de Comandos para Leadership Dashboard y Coordinator Copilot (Fase 11).
 * Invocado a través del shim `bin/rails`.
 */

import { LeadershipDashboardService } from '../src/lib/leadership/dashboardService';
import { CoordinatorCopilotBriefService } from '../src/lib/coordinatorCopilot/briefService';
import { CoordinatorCopilotEngine } from '../src/lib/coordinatorCopilot/copilotEngine';
import { LeadershipScopeDescriptor } from '../src/lib/leadership/types';
import { UserAcademicContext } from '../src/lib/leadership/scopeService';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const param1 = args[1] || '';

  const defaultUser: UserAcademicContext = {
    userId: 'usr_coord_english_01',
    role: 'coordinator',
    schoolId: 'sch-jjrosseau',
    assignedGrades: ['high_school_1', 'high_school_2', 'high_school_3'],
    assignedGroupIds: ['group_hs1_a', 'group_hs1_b', 'group_hs1_c']
  };

  const defaultScope: LeadershipScopeDescriptor = {
    scope_type: 'grade',
    school_id: 'sch-jjrosseau',
    school_stage: 'High School',
    grade: (command === 'dashboard' && param1) ? param1 : 'high_school_1',
    subject: 'English',
    academic_period: 'term_1_2026'
  };

  switch (command) {
    case 'dashboard': {
      console.log(`\n================================================================`);
      console.log(`🏛️  iSchool — Leadership Dashboard (Directores y Coordinadores)`);
      console.log(`================================================================`);
      console.log(`Alcance: ${defaultScope.school_stage} — ${defaultScope.grade} (${defaultScope.subject})`);
      console.log(`Periodo: ${defaultScope.academic_period}\n`);

      const data = await LeadershipDashboardService.call({
        scope: defaultScope,
        userProfile: defaultUser
      });

      console.log(`📊 [TOP SUMMARY]`);
      console.log(`  Alumnos: ${data.overview.total_students} | Grupos: ${data.overview.total_groups}`);
      console.log(`  Cobertura (Taught): ${data.overview.curriculum_coverage_percent}%`);
      console.log(`  Maestría (Mastered): ${data.overview.knowledge_mastery_percent}%`);
      console.log(`  Brecha Instrucción-Maestría (IMG): ${data.overview.instruction_mastery_gap}%`);
      console.log(`  Tendencia Global: ${data.overview.overall_trend.toUpperCase()}`);
      console.log(`  Fortaleza Principal: ${data.overview.strongest_academic_area}`);
      console.log(`  Atención Prioritaria: ${data.overview.primary_academic_attention}`);
      console.log(`  Alertas Prioritarias: ${data.overview.priority_alerts_count}`);
      console.log(`  Última Actualización: ${data.overview.data_freshness_timestamp}`);

      console.log(`\n🔄 [¿QUÉ CAMBIÓ? - ÚLTIMOS 30 DÍAS]`);
      data.what_changed.changes.forEach((c, idx) => {
        console.log(`  ${idx + 1}. ${c.target} [${c.direction.toUpperCase()}]: ${c.delta_description}`);
      });

      console.log(`\n⚠️  [SEÑALES ACADÉMICAS PRIORITARIAS]`);
      data.priority_signals.forEach((s, idx) => {
        console.log(`  ${idx + 1}. [${s.severity.toUpperCase()}] ${s.headline}`);
        console.log(`     Señal: ${s.observed_signal}`);
        console.log(`     Acción: ${s.recommended_academic_action}`);
      });

      console.log(`\n🌟 [SEÑALES POSITIVAS DE CONSOLIDACIÓN]`);
      data.positive_signals.forEach((s, idx) => {
        console.log(`  ${idx + 1}. ${s.headline}: ${s.details}`);
      });

      console.log(`\n👥 [COMPARATIVA JUSTA DE GRUPOS]`);
      console.table(data.fair_group_comparisons.map(g => ({
        Grupo: g.group_name,
        Alumnos: g.student_count,
        'Cobertura %': g.course_coverage_percent,
        'Maestría %': g.knowledge_mastery_percent,
        'IMG %': g.instruction_mastery_gap,
        'Nivel Entrada': g.starting_level,
        Confianza: g.evidence_confidence.toUpperCase(),
        Estado: g.status
      })));

      console.log(`\n🔗 [CUELLOS DE BOTELLA CURRICULARES (BÓVEDA)]`);
      data.bottlenecks.forEach((b, idx) => {
        console.log(`  ${idx + 1}. "${b.title}" (${b.cefr}) — Maestría: ${b.mastery_percentage}%`);
        console.log(`     Bloquea: ${b.downstream_dependencies_count} competencias en ${b.affected_groups.join(', ')}`);
        console.log(`     Recomendación: ${b.actionable_recommendation}`);
      });

      console.log(`\n🛡️  [PANEL DE CALIDAD DE DATOS]`);
      console.log(`  Estado: ${data.data_quality.status.toUpperCase()}`);
      console.log(`  Evidencias Totales: ${data.data_quality.total_evidence_points}`);
      console.log(`  Alumnos Monitoreados: ${data.data_quality.students_tracked}`);
      console.log(`  Métricas de Baja Confianza: ${data.data_quality.low_confidence_metrics_count}`);

      console.log(`\n📝 [SÍNTESIS EJECUTIVA GROUNDED]`);
      console.log(`  "${data.executive_brief}"\n`);
      break;
    }

    case 'brief': {
      const briefType = param1 || 'daily';
      console.log(`\n================================================================`);
      console.log(`📋 iSchool — Coordinator Brief Generator (${briefType.toUpperCase()})`);
      console.log(`================================================================\n`);

      if (briefType === 'daily') {
        const brief = await CoordinatorCopilotBriefService.generateDailyBrief(defaultScope, defaultUser);
        console.log(`📅 FECHA: ${brief.date} | ALCANCE: ${brief.scope_name}`);
        console.log(`💡 ${brief.headline}\n`);
        console.log(`SEÑALES CLAVE DE HOY:`);
        brief.top_attention_signals.forEach((s, idx) => {
          console.log(`  ${idx + 1}. ${s.title}`);
          console.log(`     Resumen: ${s.metrics_summary} | Tendencia: ${s.trend}`);
          console.log(`     Soporte: ${s.evidence_status}`);
        });
        console.log(`\nACCION RECOMENDADA PARA EL DÍA:`);
        console.log(`  👉 ${brief.recommended_daily_action}\n`);
      } else if (briefType === 'weekly') {
        const brief = await CoordinatorCopilotBriefService.generateWeeklyBrief(defaultScope, defaultUser);
        console.log(`📅 REPORTE SEMANAL: ${brief.week_label} | ${brief.scope_name}\n`);
        console.log(`📈 QUÉ MEJORÓ:`);
        brief.what_improved.forEach(i => console.log(`  • ${i}`));
        console.log(`\n📉 QUÉ DECAYÓ:`);
        brief.what_declined.forEach(d => console.log(`  • ${d}`));
        console.log(`\n⚖️  QUÉ SE MANTUVO ESTABLE:`);
        brief.what_stayed_stable.forEach(s => console.log(`  • ${s}`));
        console.log(`\n📊 BALANCE SEMANAL:`);
        console.log(`  Delta Cobertura: +${brief.coverage_delta}% | Delta Maestría: +${brief.mastery_delta}%`);
        console.log(`  Alertas Nuevas: ${brief.new_alerts_count} | Alertas Resueltas: ${brief.resolved_alerts_count}`);
        console.log(`  Calidad de Datos: ${brief.evidence_quality_status}\n`);
      } else if (briefType === 'meeting') {
        const brief = await CoordinatorCopilotBriefService.generateMeetingBrief(defaultScope, defaultUser);
        console.log(`🤝 ${brief.meeting_title.toUpperCase()}`);
        console.log(`📅 FECHA: ${brief.date} | ALCANCE: ${brief.scope_name}\n`);
        console.log(`REGLAS DE ORO DE LA REUNIÓN:`);
        brief.meeting_ground_rules.forEach(r => console.log(`  🔒 ${r}`));
        console.log(`\nTEMAS DE LA AGENDA PEDAGÓGICA:`);
        brief.agenda_topics.forEach(t => {
          console.log(`\n  [TEMA ${t.topic_number}] ${t.title}`);
          console.log(`  • Señal Observada: ${t.academic_signal}`);
          console.log(`  • Datos de Respaldo: ${t.observed_data}`);
          console.log(`  • Preguntas Guía para el Diálogo:`);
          t.suggested_discussion_questions.forEach(q => console.log(`     - ${q}`));
        });
        console.log(``);
      }
      break;
    }

    case 'ask': {
      const query = args.slice(1).join(' ') || '¿Cómo vamos en inglés High School 1?';
      console.log(`\n================================================================`);
      console.log(`🤖 iSchool — Coordinator Copilot (Consulta en Lenguaje Natural)`);
      console.log(`================================================================`);
      console.log(`Pregunta: "${query}"\n`);

      const res = await CoordinatorCopilotEngine.ask(query, defaultScope, defaultUser);

      console.log(`🎯 INTENCIÓN IDENTIFICADA: ${res.intent.toUpperCase()}`);
      console.log(`\n📌 RESPUESTA SINTÉTICA (GROUNDED):`);
      console.log(res.summary);

      if (res.insufficient_evidence_warning) {
        console.log(`\n⚠️  ${res.insufficient_evidence_warning}`);
      }

      console.log(`\n🔍 EXPLICACIÓN DEL "POR QUÉ" (EXPLAIN WHY):`);
      console.log(res.why_explanation);

      console.log(`\n📋 ACCIONES PEDAGÓGICAS RECOMENDADAS:`);
      res.action_recommendations.forEach((r, idx) => {
        console.log(`  ${idx + 1}. [${r.action_type}] ${r.description}`);
        console.log(`     Por qué: ${r.why_rationale}`);
        console.log(`     Requiere Aprobación de Coordinación: ${r.requires_approval ? 'SÍ (Human-in-the-loop)' : 'NO'}`);
      });

      console.log(`\n🔒 REGISTRO DE AUDITORÍA: ${res.audit_id}\n`);
      break;
    }

    default: {
      console.log(`\nUso de bin/rails leadership:* y coordinator:*:`);
      console.log(`  bin/rails leadership:dashboard [grade]      # Genera el Leadership Dashboard estructurado`);
      console.log(`  bin/rails coordinator:brief [daily|weekly|meeting] # Genera briefs ejecutivos y de junta docente`);
      console.log(`  bin/rails coordinator:ask "<pregunta>"      # Consulta en lenguaje natural al Coordinator Copilot`);
      console.log(`  bin/rails leadership:pilot                 # Ejecuta la batería de certificación de Fase 11\n`);
    }
  }
}

main().catch(err => {
  console.error('[leadership_cli ERROR]:', err);
  process.exit(1);
});
