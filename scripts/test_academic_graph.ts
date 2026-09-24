/**
 * @file test_academic_graph.ts
 * @description Suite de pruebas automatizadas para el Grafo Académico Curricular (AcademicGraph).
 * Valida detección de ciclos, resolución de dependencias, ruta de aprendizaje topológica,
 * detección de nodos huérfanos y cobertura multidimensional.
 */

import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { AcademicGraph } from '../src/lib/knowledgeVault/academicGraph';
import { CoverageService } from '../src/lib/knowledgeVault/coverageService';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';

interface TestStats {
  passed: number;
  failed: number;
}

const stats: TestStats = { passed: 0, failed: 0 };

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    stats.passed++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    stats.failed++;
  }
}

async function run() {
  console.log('================================================================');
  console.log('🧪 TEST SUITE: iSchool Academic Graph & Coverage Engine');
  console.log('================================================================\n');

  const docs = KnowledgeVaultLoader.loadAll();
  assert(docs.length >= 120, `Carga exitosa de documentos curriculares (total: ${docs.length})`);

  // 1. Construcción del Grafo
  console.log('\n--- 1. Construcción e Indexación del Grafo ---');
  const graph = AcademicGraph.build(docs);
  const allNodes = graph.getAllNodes();
  const allEdges = graph.getAllEdges();
  assert(allNodes.length > 100, `Nodos registrados en el grafo: ${allNodes.length}`);
  assert(allEdges.length > 150, `Aristas de relación curricular: ${allEdges.length}`);

  // 2. Detección de Ciclos
  console.log('\n--- 2. Detección de Ciclos de Dependencia ---');
  const cycles = graph.detectCycles();
  assert(cycles.length === 0, `Cero dependencias circulares detectadas (encontrados: ${cycles.length})`);

  // 3. Resolución de Prerrequisitos y Ruta Topológica
  console.log('\n--- 3. Resolución de Prerrequisitos y Ruta de Aprendizaje ---');
  const targetId = 'func_asking_for_clarification_a1';
  const prereqs = graph.getPrerequisites(targetId, true);
  assert(prereqs.length >= 1, `Prerrequisitos resueltos para ${targetId}: [${prereqs.join(', ')}]`);
  assert(prereqs.includes('func_simple_requests_classroom_pre_a1'), 'Incluye func_simple_requests_classroom_pre_a1 como prerrequisito directo');

  const learningPath = graph.getLearningPath(targetId);
  assert(learningPath.length >= 2, `Ruta de aprendizaje topológica generada (${learningPath.length} pasos)`);
  assert(learningPath[learningPath.length - 1] === targetId, `El nodo objetivo ${targetId} es el paso final de la ruta`);

  // 4. Verificación de Nodos Batch 1 Cero Huérfanos
  console.log('\n--- 4. Conectividad Curricular de Batch 1 ---');
  const batch1Ids = [
    'grammar_verb_be_present_pre_a1',
    'grammar_present_simple_habits_a1',
    'func_greetings_leave_taking_pre_a1',
    'func_expressing_likes_dislikes_a1',
    'listening_classroom_instructions_pre_a1',
    'speaking_greetings_introductions_pre_a1',
    'reading_phonemic_word_recognition_pre_a1',
    'writing_word_labeling_pre_a1'
  ];
  for (const bId of batch1Ids) {
    const node = graph.getNode(bId);
    assert(node !== undefined, `Nodo ${bId} existe en el grafo`);
    const hasIncoming = (node?.prerequisites.length ?? 0) > 0 || (node?.builds_on.length ?? 0) > 0 || (node?.related_to.length ?? 0) > 0;
    const dependents = graph.getDependents(bId);
    assert(hasIncoming || dependents.length > 0, `Nodo ${bId} está interconectado pedagógicamente (dependientes: ${dependents.length})`);
  }

  // 5. Motor de Cobertura Curricular
  console.log('\n--- 5. Análisis de Cobertura Curricular ---');
  const coverage = CoverageService.generateReport(docs);
  assert(coverage.totalDocuments > 100, `Documentos curriculares evaluados: ${coverage.totalDocuments}`);
  assert(coverage.cefrCounts['Pre-A1'] >= 20, `Cobertura Pre-A1 consolidada: ${coverage.cefrCounts['Pre-A1']} nodos`);
  assert(coverage.cefrCounts['A1'] >= 25, `Cobertura A1 consolidada: ${coverage.cefrCounts['A1']} nodos`);

  // 6. Auditoría de Duplicados
  console.log('\n--- 6. Detección de Duplicados Semánticos ---');
  const duplicates = CoverageService.findDuplicates(docs);
  assert(duplicates.length === 0, `Cero duplicados detectados (encontrados: ${duplicates.length})`);

  // 7. Validación Estricta de Referencias Cruzadas
  console.log('\n--- 7. Integridad de Referencias Cruzadas ---');
  const validationReport = KnowledgeVaultValidator.validateBatch(docs);
  assert(validationReport.invalidFiles === 0, `Cero archivos inválidos en la bóveda completa (${validationReport.validFiles}/${validationReport.totalFiles} válidos)`);

  console.log('\n================================================================');
  console.log(`RESUMEN FINAL: ${stats.passed} PASARON, ${stats.failed} FALLARON`);
  console.log('================================================================\n');

  if (stats.failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
