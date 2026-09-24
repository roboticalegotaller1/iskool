/**
 * @file analytics_cli.ts
 * @description CLI de analítica académica y chequeo de salud de datos para iSchool (Fase 10).
 */

import {
  AcademicAnalyticsQueryService,
  AcademicAnalyticsHealthService,
  AcademicAnalyticsCurriculumAnalytics
} from '../src/lib/academicAnalytics';
import { AdaptiveLearningStore } from '../src/lib/adaptiveLearning/adaptiveStore';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'health': {
      console.log(`\n================================================================================`);
      console.log(`  iSchool — INFORME DE SALUD E INTEGRIDAD DE DATOS ACADÉMICOS`);
      console.log(`================================================================================\n`);

      const allProfiles = await AdaptiveLearningStore.getAllProfiles();
      const allComps: any[] = [];
      const allEvs: any[] = [];

      for (const p of allProfiles) {
        const compsMap = await AdaptiveLearningStore.getCompetencies(p.student_id);
        allComps.push(...Array.from(compsMap.values()));
        const evs = await AdaptiveLearningStore.getEvidences(p.student_id);
        allEvs.push(...evs);
      }

      const report = AcademicAnalyticsHealthService.runHealthCheck(allProfiles, allComps, allEvs);
      console.log(`Estado Global: ${report.status.toUpperCase()}`);
      console.log(`Fecha de Auditoría: ${report.timestamp}`);
      console.log(`Total de Evidencias: ${report.total_evidence_records}`);
      console.log(`Estudiantes Monitoreados: ${report.total_students_tracked}`);
      console.log(`Estudiantes con Evidencias: ${report.students_with_evidence}`);
      console.log(`Estudiantes sin Evidencias: ${report.students_without_evidence}`);
      console.log(`Evidencias Huérfanas: ${report.orphan_evidence_count}`);
      console.log(`Referencias Inválidas a Bóveda: ${report.invalid_knowledge_references.length}`);
      console.log(`Métricas con Confianza Baja: ${report.low_confidence_metrics_count}`);

      console.log(`\nRecomendaciones de Calidad:`);
      report.recommendations.forEach((r, idx) => console.log(`  ${idx + 1}. ${r}`));
      console.log(`================================================================================\n`);
      break;
    }

    case 'summary': {
      console.log(`\n================================================================================`);
      console.log(`  iSchool — RESUMEN EJECUTIVO DE ANALÍTICA ACADÉMICA (HIGH SCHOOL 1 ENGLISH)`);
      console.log(`================================================================================\n`);

      const summary = await AcademicAnalyticsQueryService.query({ metric: 'executive_summary' });
      console.log(`Asignatura: ${summary.subject} | Grado: ${summary.grade}`);
      console.log(`Total Estudiantes: ${summary.total_students}`);
      console.log(`Cobertura de Currículo: ${summary.curriculum_coverage_percent}%`);
      console.log(`Maestría Promedio: ${summary.average_mastery_percent}%`);
      console.log(`Brecha Instrucción-Maestría: ${summary.instruction_mastery_gap}%`);
      console.log(`Habilidad Más Fuerte: ${summary.strongest_skill}`);
      console.log(`Área de Atención Primaria: ${summary.primary_attention_skill}`);
      console.log(`Cuello de Botella Clave: ${summary.key_curriculum_bottleneck}`);

      console.log(`\n--- SÍNTESIS NARRATIVA CON INTELIGENCIA ARTIFICIAL PEDAGÓGICA ---`);
      console.log(summary.narrative_insight);

      console.log(`\n--- ALERTAS ACTIVAS ---`);
      summary.alerts.forEach((a: any) => {
        console.log(`  [${a.severity.toUpperCase()}] ${a.signal_summary}`);
      });
      console.log(`================================================================================\n`);
      break;
    }

    case 'bottlenecks': {
      console.log(`\n================================================================================`);
      console.log(`  iSchool — CUELLOS DE BOTELLA CURRICULARES EN EL GRAFO DE BÓVEDA`);
      console.log(`================================================================================\n`);

      const allProfiles = await AdaptiveLearningStore.getAllProfiles();
      const allComps: any[] = [];
      for (const p of allProfiles) {
        const compsMap = await AdaptiveLearningStore.getCompetencies(p.student_id);
        allComps.push(...Array.from(compsMap.values()));
      }

      const bottlenecks = AcademicAnalyticsCurriculumAnalytics.detectBottlenecks(allComps);
      bottlenecks.forEach(b => {
        console.log(`• [${b.severity.toUpperCase()}] ${b.title} (Maestría: ${b.group_mastery_percent}%)`);
        console.log(`  Nodos Bloqueados: ${b.dependent_downstream_units_count} conceptos posteriores.`);
        console.log(`  Diagnóstico: ${b.observed_contributor_analysis}`);
        console.log(`  Acción Pedagógica Sugerida: ${b.recommended_reteach_action}\n`);
      });
      console.log(`================================================================================\n`);
      break;
    }

    case 'pilot': {
      const { spawn } = require('child_process');
      const path = require('path');
      const tsxCli = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
      const pilotScript = path.join(__dirname, '..', 'scripts', 'test_fase10_analytics_pilot.ts');
      const child = spawn(process.execPath, [tsxCli, pilotScript], { stdio: 'inherit' });
      child.on('exit', (code: number) => process.exit(code || 0));
      break;
    }

    default:
      console.log(`Academic Analytics CLI:`);
      console.log(`  bin/rails analytics:health       # Auditoría de calidad de datos`);
      console.log(`  bin/rails analytics:summary      # Resumen ejecutivo para dirección/coordinación`);
      console.log(`  bin/rails analytics:bottlenecks  # Detección de cuellos de botella en Bóveda`);
      console.log(`  bin/rails analytics:pilot        # Ejecutar piloto de certificación Fase 10`);
      break;
  }
}

main().catch(err => {
  console.error('Error fatal en analytics_cli:', err);
  process.exit(1);
});
