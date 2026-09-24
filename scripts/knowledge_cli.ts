#!/usr/bin/env tsx
/**
 * @file knowledge_cli.ts
 * @description Interfaz de línea de comandos para la Bóveda Curricular de Inglés de iSchool.
 * Implementa los comandos validate, sync y stats.
 */

import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';
import { KnowledgeVaultSyncService } from '../src/lib/knowledgeVault/syncService';

import { CoverageService } from '../src/lib/knowledgeVault/coverageService';
import { AcademicGraph } from '../src/lib/knowledgeVault/academicGraph';
import { KnowledgeVaultHealthService } from '../src/lib/knowledgeVault/healthService';
import { GradeCoverageService } from '../src/lib/knowledgeVault/gradeCoverageService';
import { KnowledgeVaultPrerequisiteService } from '../src/lib/knowledgeVault/prerequisiteService';
import { KnowledgeVaultLearningPathService } from '../src/lib/knowledgeVault/learningPathService';

async function main() {
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();

  switch (command) {
    case 'validate':
    case 'knowledge:validate':
      await runValidate();
      break;

    case 'sync':
    case 'knowledge:sync':
      await runSync(args.includes('--force'));
      break;

    case 'stats':
    case 'knowledge:stats':
      runStats();
      break;

    case 'health':
    case 'knowledge:health':
      runHealth();
      break;

    case 'grade_coverage':
    case 'knowledge:grade_coverage':
      runGradeCoverage(args[1]);
      break;

    case 'coverage':
    case 'knowledge:coverage':
      runCoverage(args.slice(1));
      break;

    case 'duplicates':
    case 'knowledge:duplicates':
      runDuplicates();
      break;

    case 'graph':
    case 'knowledge:graph':
      runGraph(args.slice(1));
      break;

    case 'prereq':
    case 'knowledge:prereq':
      runPrereq(args[1]);
      break;

    case 'learning_path':
    case 'knowledge:learning_path':
      runLearningPath(args[1], args[2], args[3]);
      break;

    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      break;
  }
}

async function runValidate() {
  console.log(`\n================================================================`);
  console.log(`🔍 VALIDACIÓN DE BÓVEDA CURRICULAR (iSchool English Knowledge Vault)`);
  console.log(`================================================================\n`);

  const docs = KnowledgeVaultLoader.loadAll();
  console.log(`📂 Archivos encontrados: ${docs.length}\n`);

  if (docs.length === 0) {
    console.warn(`⚠️ No se encontraron archivos .md en knowledge/english/`);
    process.exit(0);
  }

  const report = KnowledgeVaultValidator.validateBatch(docs);

  for (const res of report.results) {
    if (res.valid) {
      console.log(`  ✅ [PASS] ${res.filePath} (${res.documentId || 'sin id'})`);
      if (res.warnings.length > 0) {
        for (const w of res.warnings) {
          console.log(`     ⚠️ Advertencia: ${w}`);
        }
      }
    } else {
      console.error(`  ❌ [FAIL] ${res.filePath}`);
      for (const err of res.errors) {
        console.error(`     - [${err.field || 'general'}]: ${err.message}`);
      }
    }
  }

  console.log(`\n----------------------------------------------------------------`);
  console.log(`Resumen: ${report.validFiles} válidos, ${report.invalidFiles} con errores.`);
  console.log(`----------------------------------------------------------------\n`);

  if (report.invalidFiles > 0) {
    console.error(`❌ Validación fallida. Corrige los errores antes de sincronizar.`);
    process.exit(1);
  } else {
    console.log(`🎉 ¡Todos los documentos cumplen estrictamente con la taxonomía!`);
    process.exit(0);
  }
}

async function runSync(force: boolean = false) {
  console.log(`\n================================================================`);
  console.log(`🚀 SINCRONIZACIÓN DE BÓVEDA CURRICULAR`);
  console.log(`================================================================\n`);

  console.log(`Iniciando sincronización ${force ? '(Modo Forzado: sobreescribiendo checksums)' : 'incremental con checksums'}...`);

  const report = await KnowledgeVaultSyncService.sync({ force });

  console.log(`\nResultados de Sincronización:`);
  console.log(`  ➕ Creados:     ${report.createdCount}`);
  console.log(`  🔄 Actualizados: ${report.updatedCount}`);
  console.log(`  ⏸️  Sin cambios:  ${report.unchangedCount}`);
  console.log(`  📦 Archivados:   ${report.deprecatedCount}`);
  console.log(`  ❌ Errores:      ${report.errorCount}`);

  if (report.errorCount > 0) {
    console.error(`\n⚠️ Se detectaron ${report.errorCount} documentos con errores que no pudieron sincronizarse.`);
    process.exit(1);
  } else {
    console.log(`\n🎉 Sincronización exitosa.`);
    process.exit(0);
  }
}

function runStats() {
  console.log(`\n================================================================`);
  console.log(`📊 ESTADÍSTICAS Y COBERTURA CURRICULAR: BÓVEDA DE INGLÉS`);
  console.log(`================================================================\n`);

  const stats = KnowledgeVaultSyncService.getStats();

  console.log(`Total documents: ${stats.totalDocuments}\n`);

  console.log(`Por Etapa Escolar:`);
  console.log(`  Preschool:   ${stats.byStage.preschool || 0}`);
  console.log(`  Primary:     ${stats.byStage.primary || 0}`);
  console.log(`  Secondary:   ${stats.byStage.secondary || 0}`);
  console.log(`  High School: ${stats.byStage.high_school || 0}`);
  console.log(`  Advanced:    ${stats.byStage.advanced || 0}\n`);

  console.log(`Por Nivel CEFR:`);
  console.log(`  Foundation: ${stats.byCefr['Foundation'] || 0}`);
  console.log(`  Pre-A1:     ${stats.byCefr['Pre-A1'] || 0}`);
  console.log(`  A1:         ${stats.byCefr['A1'] || 0}`);
  console.log(`  A2:         ${stats.byCefr['A2'] || 0}`);
  console.log(`  B1:         ${stats.byCefr['B1'] || 0}`);
  console.log(`  B2:         ${stats.byCefr['B2'] || 0}`);
  console.log(`  C1:         ${stats.byCefr['C1'] || 0}`);
  console.log(`  C2:         ${stats.byCefr['C2'] || 0}\n`);

  console.log(`Por Habilidad Lingüística (Skill):`);
  for (const [skill, count] of Object.entries(stats.bySkill)) {
    console.log(`  ${skill.charAt(0).toUpperCase() + skill.slice(1)}: ${count}`);
  }
  console.log('');

  console.log(`Por Estado de Gobernanza:`);
  console.log(`  Draft:      ${stats.byStatus.draft || 0}`);
  console.log(`  Review:     ${stats.byStatus.review || 0}`);
  console.log(`  Approved:   ${stats.byStatus.approved || 0}`);
  console.log(`  Deprecated: ${stats.byStatus.deprecated || 0}\n`);

  if (Object.keys(stats.byCambridge).length > 0) {
    console.log(`Alineaciones Cambridge Registradas:`);
    for (const [cambridge, count] of Object.entries(stats.byCambridge)) {
      console.log(`  ${cambridge}: ${count}`);
    }
    console.log('');
  }

  if (stats.missingCurricularGaps.length > 0) {
    console.log(`⚠️ Huecos Curriculares Detectados:`);
    for (const gap of stats.missingCurricularGaps) {
      console.log(`  - [${gap.stage} | ${gap.cefr}]: ${gap.description}`);
    }
    console.log('');
  } else {
    console.log(`✅ Cobertura balanceada en todas las etapas fundamentales.`);
  }
}

function runCoverage(targetGrades?: string[]) {
  console.log(`\n================================================================`);
  console.log(`📊 MATRIZ DE COBERTURA CURRICULAR (iSchool English Knowledge Vault)`);
  console.log(`================================================================\n`);

  const docs = KnowledgeVaultLoader.loadAll();
  const report = CoverageService.generateReport(docs);

  console.log(`Total documentos curriculares analizados: ${report.totalDocuments}\n`);
  const ascii = CoverageService.formatAsciiTable(report, targetGrades && targetGrades.length > 0 ? targetGrades : undefined);
  console.log(ascii);

  console.log(`\nDistribución de Conceptos por Nivel CEFR:`);
  for (const [cefr, count] of Object.entries(report.cefrCounts)) {
    if (count > 0) console.log(`  • ${cefr.padEnd(12)}: ${count} nodos`);
  }

  if (report.gaps.length > 0) {
    console.log(`\n⚠️ Huecos Detectados en la Matriz (${report.gaps.length} celdas sin cobertura):`);
    const gapSample = report.gaps.slice(0, 10);
    gapSample.forEach(g => console.log(`  - Grado: ${g.grade.padEnd(15)} | Dominio: ${g.domain}`));
    if (report.gaps.length > 10) {
      console.log(`  ... y ${report.gaps.length - 10} huecos adicionales.`);
    }
  } else {
    console.log(`\n✅ Cobertura 100% completa en la matriz evaluada.`);
  }
  console.log('');
}

function runDuplicates() {
  console.log(`\n================================================================`);
  console.log(`🔍 AUDITORÍA DE DUPLICADOS SEMÁNTICOS Y COLISIÓN DE CONCEPTOS`);
  console.log(`================================================================\n`);

  const docs = KnowledgeVaultLoader.loadAll();
  const duplicates = CoverageService.findDuplicates(docs);

  if (duplicates.length === 0) {
    console.log(`✅ Cero duplicados semánticos detectados. Todos los identificadores son canónicos y disjuntos.\n`);
  } else {
    console.log(`⚠️ Se detectaron ${duplicates.length} posibles colisiones semánticas:\n`);
    duplicates.forEach((d, idx) => {
      console.log(`  [${idx + 1}] ID A: ${d.idA} ("${d.titleA}")`);
      console.log(`      ID B: ${d.idB} ("${d.titleB}")`);
      console.log(`      Motivo: ${d.reason}\n`);
    });
  }
}

function runHealth() {
  const docs = KnowledgeVaultLoader.loadAll();
  const report = KnowledgeVaultHealthService.runAudit(docs);
  console.log(KnowledgeVaultHealthService.formatReport(report));
}

function runGradeCoverage(grade?: string) {
  if (!grade) {
    console.error('\n❌ Debes especificar un grado escolar válido. Ejemplo: bin/rails knowledge:grade_coverage[primary_5] o knowledge:grade_coverage secondary_2');
    return;
  }
  try {
    const docs = KnowledgeVaultLoader.loadAll();
    const report = GradeCoverageService.analyzeGrade(grade, docs);
    console.log(GradeCoverageService.formatReport(report));
  } catch (err: unknown) {
    console.error(`\n❌ Error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function runPrereq(nodeId?: string) {
  if (!nodeId) {
    console.error('\n❌ Debes especificar el ID de un concepto. Ejemplo: bin/rails knowledge:prereq grammar_present_perfect_b1');
    return;
  }
  try {
    const result = KnowledgeVaultPrerequisiteService.call(nodeId);
    console.log(`\n================================================================`);
    console.log(`🔍 ANÁLISIS DE PRERREQUISITOS PARA: [${result.nodeId}]`);
    console.log(`Título: "${result.nodeTitle}"`);
    console.log(`================================================================\n`);

    console.log(`Prerrequisitos Directos (${result.directPrerequisites.length}):`);
    if (result.directPrerequisites.length === 0) {
      console.log('  • Ninguno (Concepto Raíz o Inicial)');
    } else {
      result.directPrerequisites.forEach(p => console.log(`  • [${p.id}] ([${p.cefr.join('/')}]) ${p.title} (${p.type})`));
    }

    console.log(`\nPrerrequisitos Aguas Arriba (Transitados) (${result.upstreamPrerequisites.length}):`);
    if (result.upstreamPrerequisites.length === 0) {
      console.log('  • Ninguno adicional');
    } else {
      result.upstreamPrerequisites.forEach(p => console.log(`  • [${p.id}] ([${p.cefr.join('/')}]) ${p.title}`));
    }

    console.log(`\nRuta de Aprendizaje Topológica (${result.learningPathSequence.length} pasos):`);
    result.learningPathSequence.forEach(s => {
      console.log(`  Paso ${s.step}: [${s.id}] -> ${s.title}`);
    });

    if (result.hasCycle) {
      console.error(`\n❌ ¡ALERTA! Ciclo detectado: ${result.cycleDetails?.join(' -> ')}`);
    } else {
      console.log(`\n✅ Ausencia garantizada de dependencias circulares.`);
    }
  } catch (err: unknown) {
    console.error(`\n❌ Error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function runLearningPath(fromCefr?: string, toCefr?: string, skill?: string) {
  if (!fromCefr || !toCefr) {
    console.error('\n❌ Debes especificar al menos el nivel origen y destino. Ejemplo: bin/rails knowledge:learning_path A1 B1 speaking');
    return;
  }
  try {
    const result = KnowledgeVaultLearningPathService.call({ fromCefr, toCefr, skill });
    console.log(`\n================================================================`);
    console.log(`🛤️ SECUENCIA DE APRENDIZAJE: De [${result.fromCefr}] a [${result.toCefr}]${skill ? ` en Habilidad [${skill.toUpperCase()}]` : ''}`);
    console.log(`================================================================\n`);
    console.log(`Total Pasos Identificados: ${result.totalSteps}\n`);
    result.steps.forEach(s => {
      console.log(`  ${s.order}. [${s.id}] ([${s.cefr.join('/')}]) ${s.title}`);
      if (s.learningOutcomes.length > 0) {
        console.log(`     * Outcome: ${s.learningOutcomes[0]}`);
      }
    });
  } catch (err: unknown) {
    console.error(`\n❌ Error: ${err instanceof Error ? err.message : String(err)}`);
  }
}

function runGraph(args: string[] = []) {
  console.log(`\n================================================================`);
  console.log(`🕸️ ANÁLISIS DEL GRAFO ACADÉMICO CURRICULAR (iSchool)`);
  console.log(`================================================================\n`);

  const docs = KnowledgeVaultLoader.loadAll();
  const graph = AcademicGraph.build(docs);

  // Analizar argumentos de formato
  const formatArg = args.find(a => a.startsWith('--format='));
  const format = formatArg ? formatArg.split('=')[1].toLowerCase() : 'text';
  const targetNodeId = args.find(a => !a.startsWith('--'));

  if (format === 'mermaid') {
    console.log('```mermaid');
    console.log(graph.toMermaid({ nodeId: targetNodeId }));
    console.log('```\n');
    return;
  } else if (format === 'json') {
    console.log(graph.toJson(targetNodeId));
    return;
  } else if (format === 'dot') {
    console.log(graph.toDot({ nodeId: targetNodeId }));
    return;
  }

  const stats = graph.getStats();
  console.log(`Total Nodos Registrados: ${stats.totalNodes}`);
  console.log(`Total Aristas de Relación: ${stats.totalEdges}`);
  console.log(`Desglose de Relaciones:`);
  console.log(`  • Prerrequisitos (prerequisite): ${stats.edgeBreakdown.prerequisite}`);
  console.log(`  • Antecedentes directos (builds_on): ${stats.edgeBreakdown.builds_on}`);
  console.log(`  • Extensiones (extends): ${stats.edgeBreakdown.extends}`);
  console.log(`  • Transversales (related_to): ${stats.edgeBreakdown.related_to}`);
  console.log(`  • Evaluación (assessed_by): ${stats.edgeBreakdown.assessed_by}`);
  console.log(`Nodos Huérfanos: ${stats.orphanCount}`);
  console.log(`Ciclos Detectados: ${stats.cyclesCount}`);

  if (stats.cyclesCount > 0) {
    console.error(`\n❌ ¡ALERTA! Se detectaron ${stats.cyclesCount} dependencias circulares:`);
    const cycles = graph.detectCycles();
    cycles.forEach((c, i) => console.error(`  Ciclo ${i + 1}: ${c.join(' -> ')}`));
  }

  if (targetNodeId) {
    const node = graph.getNode(targetNodeId);
    if (!node) {
      console.error(`\nNodo "${targetNodeId}" no encontrado en el grafo.`);
    } else {
      console.log(`\n--- INSPECCIÓN DE NODO: ${node.id} ---`);
      console.log(`Título: ${node.title}`);
      console.log(`Nivel CEFR: ${node.cefr.join(', ')}`);
      console.log(`Prerrequisitos directos: ${node.prerequisites.join(', ') || 'Ninguno (Nodo raíz)'}`);
      console.log(`Construye sobre (builds_on): ${node.builds_on.join(', ') || 'Ninguno'}`);
      console.log(`Ruta completa de aprendizaje: ${graph.getLearningPath(node.id).join(' -> ')}`);
      console.log(`Nodos dependientes: ${graph.getDependents(node.id).join(', ') || 'Ninguno'}`);
    }
  }
  console.log('');
}

function printHelp() {
  console.log(`
Uso del CLI de la Bóveda Curricular de Inglés:
  npx tsx scripts/knowledge_cli.ts <comando> [opciones]

Comandos disponibles:
  validate                          Valida sintaxis YAML, campos requeridos, niveles CEFR e integridad.
  sync [--force]                    Sincroniza documentos con la base de datos y almacén con Checksums.
  stats                             Muestra métricas generales y distribución por CEFR/Grado.
  health                            Diagnóstico integral de salud curricular y control de calidad binario.
  grade_coverage <grado>            Diagnóstico semafórico por dominio para un grado (ej. primary_5).
  coverage                          Genera y visualiza la Matriz de Cobertura Grado x Dominio x CEFR.
  duplicates                        Ejecuta auditoría para detectar posibles conceptos duplicados o colisiones.
  graph [node_id] [--format=...]    Analiza topología (soporta --format=text|mermaid|json|dot).
  prereq <node_id>                  Resuelve prerrequisitos directos, aguas arriba y ruta topológica.
  learning_path <from> <to> [skill] Genera secuencia didáctica ordenada entre niveles CEFR.
`);
}

main().catch(err => {
  console.error('Error inesperado en el CLI:', err);
  process.exit(1);
});
