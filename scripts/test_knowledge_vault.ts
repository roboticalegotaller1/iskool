/**
 * @file test_knowledge_vault.ts
 * @description Suite completa de pruebas automatizadas para el iSchool English Knowledge Vault.
 * Valida parseo, metadatos, CEFR inválido, checksums, sincronización, consultas y filtrado 'approved'.
 */

import fs from 'fs';
import path from 'path';
import { KnowledgeVaultParser } from '../src/lib/knowledgeVault/parser';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';
import { KnowledgeVaultSyncService } from '../src/lib/knowledgeVault/syncService';
import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { KnowledgeTaxonomy } from '../src/lib/knowledgeVault/taxonomy';
import { KnowledgeVaultContextBuilder } from '../src/lib/knowledgeVault/contextBuilder';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
    failedTests++;
  }
}

async function runTestSuite() {
  console.log(`================================================================`);
  console.log(`🧪 SUITE DE PRUEBAS: iSchool English Knowledge Vault`);
  console.log(`================================================================\n`);

  // --------------------------------------------------------------------------
  // TEST 1: Parsing correcto del YAML Frontmatter
  // --------------------------------------------------------------------------
  console.log(`--- TEST 1: Parsing Correcto de YAML Frontmatter ---`);
  const sampleYamlDoc = `---
id: test_doc_1
title: "Testing Vocabulary and Grammar"
type: skill_node
school_stage:
  - primary
grades:
  - primary_3
cefr:
  - A1
skills:
  - vocabulary
  - grammar
topics:
  - school_life
difficulty: elementary
duration_minutes: 40
source_ids:
  - cefr_companion_volume_2020
status: approved
version: 1
---

# Testing Vocabulary and Grammar

Este es el cuerpo en Markdown del documento pedagógico.
`;
  const parsed1 = KnowledgeVaultParser.parse(sampleYamlDoc, 'test/sample.md');
  assert(parsed1.documentId === 'test_doc_1', 'Extrae id correctamente del YAML');
  assert(parsed1.title === 'Testing Vocabulary and Grammar', 'Extrae title limpio');
  assert(parsed1.frontmatter.school_stage.includes('primary'), 'Extrae school_stage como array');
  assert(parsed1.frontmatter.cefr.includes('A1'), 'Extrae nivel CEFR correctamente');
  assert(parsed1.frontmatter.skills.length === 2, 'Extrae habilidades correctamente');
  assert(parsed1.frontmatter.duration_minutes === 40, 'Extrae número de duración');
  assert(parsed1.frontmatter.version === 1, 'Extrae versión numérica');

  // --------------------------------------------------------------------------
  // TEST 2: Preservación Íntegra del Markdown Body
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 2: Markdown Body Separado e Íntegro ---`);
  assert(!parsed1.markdownBody.includes('---'), 'El cuerpo no contiene delimitadores YAML');
  assert(parsed1.markdownBody.includes('# Testing Vocabulary and Grammar'), 'Conserva encabezados');
  assert(parsed1.markdownBody.includes('Este es el cuerpo en Markdown del documento pedagógico.'), 'Conserva párrafos de contenido');

  // --------------------------------------------------------------------------
  // TEST 3: Documento Sin Frontmatter
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 3: Manejo Seguro de Documento Sin Frontmatter ---`);
  const rawNoFrontmatter = `# Archivo Simple Sin Metadatos
Este texto no tiene bloque YAML inicial.
`;
  const parsedNoFm = KnowledgeVaultParser.parse(rawNoFrontmatter, 'knowledge/plain.md');
  assert(parsedNoFm.frontmatter._has_frontmatter === false, 'Detecta que carece de frontmatter');
  const valNoFm = KnowledgeVaultValidator.validate(parsedNoFm);
  assert(!valNoFm.valid, 'El validador rechaza el documento sin frontmatter');
  assert(valNoFm.errors.some(e => e.field === 'frontmatter'), 'Reporta error en el campo frontmatter');

  // --------------------------------------------------------------------------
  // TEST 4: Metadata Inválida (Campos obligatorios faltantes)
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 4: Metadata Inválida y Campos Faltantes ---`);
  const invalidMetadataDoc = `---
id: doc_missing_fields
title: "Documento Incompleto"
status: approved
version: 1
---
Cuerpo sin campos requeridos.
`;
  const parsedInvalid = KnowledgeVaultParser.parse(invalidMetadataDoc, 'invalid.md');
  const valInvalid = KnowledgeVaultValidator.validate(parsedInvalid);
  assert(!valInvalid.valid, 'Rechaza documento con campos requeridos omitidos');
  assert(valInvalid.errors.some(e => e.field === 'cefr'), 'Exige campo cefr obligatorio');
  assert(valInvalid.errors.some(e => e.field === 'skills'), 'Exige campo skills obligatorio');
  assert(valInvalid.errors.some(e => e.field === 'school_stage'), 'Exige campo school_stage obligatorio');
  assert(valInvalid.errors.some(e => e.field === 'grades'), 'Exige campo grades obligatorio');
  assert(valInvalid.errors.some(e => e.field === 'source_ids'), 'Exige campo source_ids obligatorio');

  // --------------------------------------------------------------------------
  // TEST 5: CEFR Inválido (Ej: "B7" debe fallar taxativamente)
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 5: CEFR Inválido (B7 vs B2) ---`);
  const invalidCefrDoc = `---
id: doc_invalid_cefr
title: "Invalid CEFR Level"
type: skill_node
school_stage: [secondary]
grades: [secondary_2]
cefr: [B7]
skills: [speaking]
source_ids: [cefr_companion_volume_2020]
status: approved
version: 1
---
Contenido con nivel inventado B7.
`;
  const parsedB7 = KnowledgeVaultParser.parse(invalidCefrDoc, 'test/b7.md');
  const valB7 = KnowledgeVaultValidator.validate(parsedB7);
  assert(!valB7.valid, 'cefr: B7 debe fallar obligatoriamente');
  assert(valB7.errors.some(e => e.field === 'cefr' && e.value === 'B7'), 'Especifica error con valor B7');
  assert(!KnowledgeTaxonomy.isCefrLevelValid('B7'), 'Taxonomía rechaza B7');
  assert(KnowledgeTaxonomy.isCefrLevelValid('B2'), 'Taxonomía aprueba B2');

  // --------------------------------------------------------------------------
  // TEST 6: Documento Válido
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 6: Documento Válido Cumpliendo Taxonomía ---`);
  const validDoc = `---
id: doc_perfect_b2
title: "Debating Contemporary Technology"
type: language_function
school_stage:
  - high_school
grades:
  - high_school_2
cefr:
  - B2
cambridge_alignment:
  - B2 First
skills:
  - speaking
subskills:
  - expressing_opinion
topics:
  - technology_and_digital_life
difficulty: upper_intermediate
duration_minutes: 50
source_ids:
  - cefr_companion_volume_2020
status: approved
version: 1
---
# Debating Contemporary Technology
[[B2]] [[Speaking]]
`;
  const parsedValid = KnowledgeVaultParser.parse(validDoc, 'test/valid.md');
  const valResult = KnowledgeVaultValidator.validate(parsedValid);
  assert(valResult.valid, 'Documento con metadatos completos y correctos es aprobado');
  assert(valResult.errors.length === 0, 'Cero errores de validación');
  assert(parsedValid.wikiLinks.includes('B2'), 'Extrae enlace de boveda [[B2]]');

  // --------------------------------------------------------------------------
  // TEST 7: Checksum Criptográfico SHA256
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 7: Cálculo y Coherencia de Checksum SHA256 ---`);
  const checksum1 = KnowledgeVaultParser.computeChecksum(validDoc);
  const checksum2 = KnowledgeVaultParser.computeChecksum(validDoc);
  assert(typeof checksum1 === 'string' && checksum1.length === 64, 'Checksum es un hash SHA256 de 64 caracteres');
  assert(checksum1 === checksum2, 'El checksum es determinista ante idéntico contenido');

  // --------------------------------------------------------------------------
  // TEST 8: Detección de Archivo Modificado
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 8: Detección de Modificaciones por Checksum ---`);
  const modifiedDoc = validDoc + '\nNuevo párrafo adicional.';
  const checksumModified = KnowledgeVaultParser.computeChecksum(modifiedDoc);
  assert(checksum1 !== checksumModified, 'Cualquier modificación altera el checksum');

  // --------------------------------------------------------------------------
  // TEST 9: Sincronización del Vault
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 9: Ciclo de Vida de Sincronización ---`);
  const syncReport = await KnowledgeVaultSyncService.sync({ skipDatabase: true, force: true });
  assert(syncReport.createdCount > 0 || syncReport.updatedCount > 0 || syncReport.unchangedCount > 0, 'Sincroniza documentos del vault');
  assert(syncReport.errorCount === 0, 'Cero errores en la sincronización del vault real');

  // Sincronización idempotente posterior sin force
  const syncReport2 = await KnowledgeVaultSyncService.sync({ skipDatabase: true });
  assert(syncReport2.unchangedCount > 0, 'Omite reprocesar archivos sin cambios');

  // --------------------------------------------------------------------------
  // TEST 10: Consultas por Grade
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 10: Consultas por Grado Escolar (Grade) ---`);
  const resultsGrade = await KnowledgeVaultQueryService.query({ grade: 'secondary_3' });
  assert(resultsGrade.length > 0, 'Recupera documentos correspondientes a secondary_3');
  assert(resultsGrade.every(r => r.grades.includes('secondary_3')), 'Todos los resultados contienen el grado secondary_3');

  // --------------------------------------------------------------------------
  // TEST 11: Consultas por CEFR
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 11: Consultas por Nivel CEFR ---`);
  const resultsB1 = await KnowledgeVaultQueryService.query({ cefr: 'B1' });
  assert(resultsB1.length > 0, 'Recupera documentos con nivel B1');
  assert(resultsB1.every(r => r.cefr.includes('B1')), 'Todos los resultados corresponden al nivel B1');

  // --------------------------------------------------------------------------
  // TEST 12: Consultas por Skill
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 12: Consultas por Habilidad Lingüística ---`);
  const resultsSpeaking = await KnowledgeVaultQueryService.query({ skill: 'speaking' });
  assert(resultsSpeaking.length > 0, 'Recupera documentos de speaking');
  assert(resultsSpeaking.every(r => r.skills.includes('speaking')), 'Todos los resultados incluyen habilidad speaking');

  // --------------------------------------------------------------------------
  // TEST 13: Consultas Combinadas (Grade + CEFR + Skill + Topic)
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 13: Consultas Combinadas Multifactoriales ---`);
  const resultsCombined = await KnowledgeVaultQueryService.call({
    grade: 'secondary_3',
    cefr: 'B1',
    skill: 'speaking',
    topic: 'technology_and_media'
  });
  assert(resultsCombined.some(r => r.document_id === 'speaking_b1_secondary_expressing_opinions'), 'Recupera el nodo específico esperado');

  // --------------------------------------------------------------------------
  // TEST 14: Filtrado Exclusivo por Estado 'approved' por Defecto
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 14: Filtro Estricto de Seguridad Académica ('approved') ---`);
  // Insertar temporalmente un borrador en el índice para verificar que no se fuga en consultas de producción
  const localIndex = KnowledgeVaultSyncService.loadLocalIndex();
  const draftRecord = {
    id: 'test-draft-uuid',
    document_id: 'draft_unapproved_node',
    path: 'knowledge/english/draft.md',
    title: 'Borrador No Aprobado',
    document_type: 'skill_node',
    school_stage: ['secondary'],
    grades: ['secondary_3'],
    cefr: ['B1'],
    skills: ['speaking'],
    metadata: { topics: ['technology_and_digital_life'] },
    content: 'Texto no verificado',
    source_ids: ['test'],
    status: 'draft',
    version: 1,
    checksum: 'mock-draft-hash',
    indexed_at: new Date().toISOString()
  };
  localIndex.set('draft_unapproved_node', draftRecord);
  KnowledgeVaultSyncService.saveLocalIndex(Array.from(localIndex.values()));

  // Consulta por defecto: NO debe devolver borradores
  const safeResults = await KnowledgeVaultQueryService.query({
    grade: 'secondary_3',
    skill: 'speaking'
  });
  assert(!safeResults.some(r => r.document_id === 'draft_unapproved_node'), 'Consulta por defecto excluye nodos en borrador (draft)');
  assert(safeResults.every(r => r.status === 'approved'), 'Todos los documentos devueltos por defecto tienen status: approved');

  // Consulta con inclusión explícita solicitada por el caller
  const callerExplicitResults = await KnowledgeVaultQueryService.query({
    grade: 'secondary_3',
    skill: 'speaking',
    includeDrafts: true
  });
  assert(callerExplicitResults.some(r => r.document_id === 'draft_unapproved_node'), 'Permite consultar borradores sólo si caller lo solicita explícitamente');

  // Limpiar el registro simulado
  localIndex.delete('draft_unapproved_node');
  KnowledgeVaultSyncService.saveLocalIndex(Array.from(localIndex.values()));

  // --------------------------------------------------------------------------
  // TEST 15: Detección de Identificadores Duplicados en Lote (Batch)
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 15: Detección de IDs Duplicados en validateBatch ---`);
  const mockDocA = KnowledgeVaultParser.parse(`---
id: duplicate_sample_id
title: Doc A
type: skill_node
school_stage: [high_school]
grades: [high_school_1]
cefr: [B1]
skills: [speaking]
source_ids: [cefr_companion_volume_2020]
status: approved
version: 1
---
Contenido A`, 'path/a.md');

  const mockDocB = KnowledgeVaultParser.parse(`---
id: duplicate_sample_id
title: Doc B
type: skill_node
school_stage: [high_school]
grades: [high_school_1]
cefr: [B2]
skills: [writing]
source_ids: [cefr_companion_volume_2020]
status: approved
version: 1
---
Contenido B`, 'path/b.md');

  const batchDuplicateReport = KnowledgeVaultValidator.validateBatch([mockDocA, mockDocB]);
  assert(!batchDuplicateReport.results[0].valid, 'Marca inválido el primer documento con ID repetido');
  assert(!batchDuplicateReport.results[1].valid, 'Marca inválido el segundo documento con ID repetido');
  assert(batchDuplicateReport.results[0].errors.some(e => e.field === 'id' && e.message.includes('duplicado')), 'Reporta error específico de ID duplicado');

  // --------------------------------------------------------------------------
  // TEST 16: Detección de source_ids Inexistentes en 99_SOURCES
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 16: Detección de Fuentes No Registradas ---`);
  const mockUnregisteredSourceDoc = KnowledgeVaultParser.parse(`---
id: unverified_source_doc
title: Doc con Fuente Fantasma
type: skill_node
school_stage: [high_school]
grades: [high_school_1]
cefr: [B1]
skills: [reading]
source_ids: [fake_invented_source_2099]
status: approved
version: 1
---
Contenido`, 'path/unverified.md');

  const batchSourceReport = KnowledgeVaultValidator.validateBatch([mockUnregisteredSourceDoc]);
  assert(!batchSourceReport.results[0].valid, 'Rechaza documentos que citan fuentes no registradas');
  assert(batchSourceReport.results[0].errors.some(e => e.field === 'source_ids' && String(e.value) === 'fake_invented_source_2099'), 'Identifica la fuente inexistente en el reporte de error');

  // --------------------------------------------------------------------------
  // TEST 17: Demostración de las 4 Consultas de Recuperación Requeridas
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 17: Demostración de Queries A, B, C y D ---`);
  
  // Query A: grade: high_school_1, cefr: B1, skill: speaking, language_function: expressing_opinions
  const queryAResults = await KnowledgeVaultQueryService.call({
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    language_function: 'expressing_opinions'
  });
  assert(queryAResults.length > 0, 'Query A recupera documentos válidos para High School 1 + B1 + Speaking + expressing_opinions');
  assert(queryAResults.some(d => d.document_id === 'func_expressing_opinions'), 'Query A recupera el nodo funcional func_expressing_opinions');

  // Query B: grade: high_school_1, cefr: B2, skill: writing
  const queryBResults = await KnowledgeVaultQueryService.call({
    grade: 'high_school_1',
    cefr: 'B2',
    skill: 'writing'
  });
  assert(queryBResults.length > 0, 'Query B recupera documentos de Writing para B2 en High School 1');
  assert(queryBResults.some(d => d.document_id.includes('writing')), 'Query B contiene nodos específicos de escritura');

  // Query C: grade: high_school_1, skill: speaking, topic: technology
  const queryCResults = await KnowledgeVaultQueryService.call({
    grade: 'high_school_1',
    skill: 'speaking',
    topic: 'technology'
  });
  assert(queryCResults.length > 0, 'Query C recupera nodos de Speaking asociados al eje de Tecnología');
  assert(queryCResults.some(d => d.document_id === 'speaking_b1_b2_collaborative_discussion' || d.document_id === 'func_expressing_opinions'), 'Query C mapea nodos relevantes al tema tecnológico');

  // Query D: grade: high_school_1, skill: reading
  const queryDResults = await KnowledgeVaultQueryService.call({
    grade: 'high_school_1',
    skill: 'reading'
  });
  assert(queryDResults.length >= 3, 'Query D recupera al menos 3 documentos densos de comprensión lectora');
  assert(queryDResults.some(d => d.document_id === 'reading_b1_b2_gist_and_scanning'), 'Query D incluye comprensión global y scanning');

  // --------------------------------------------------------------------------
  // TEST 18: KnowledgeVault::ContextBuilder (Generación de Contexto para IA)
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 18: Integración de KnowledgeVaultContextBuilder ---`);
  const aiContext = await KnowledgeVaultContextBuilder.call({
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    language_function: 'expressing_opinions',
    topic: 'technology'
  });

  assert(aiContext.grade === 'high_school_1', 'ContextBuilder conserva el grado especificado');
  assert(aiContext.cefrTarget === 'B1', 'ContextBuilder conserva el nivel CEFR objetivo');
  assert(aiContext.skill === 'speaking', 'ContextBuilder define la habilidad comunicativa meta');
  assert(aiContext.learningObjectives.length > 0, 'ContextBuilder extrae objetivos de aprendizaje can-do');
  assert(aiContext.languageFunctions.some(lf => lf.id === 'func_expressing_opinions'), 'ContextBuilder incluye la función de lenguaje con su repertorio');
  assert(aiContext.grammar.keyStructures.length > 0, 'ContextBuilder extrae progresión gramatical pertinente');
  assert(aiContext.vocabularyDomain.collocations.length > 0 || aiContext.vocabularyDomain.lexicalRange.length > 0, 'ContextBuilder aporta vocabulario y colocaciones temáticas');
  assert(aiContext.activityPatterns.length > 0, 'ContextBuilder selecciona patrones de actividad reutilizables');
  assert(aiContext.assessmentCriteria.length > 0, 'ContextBuilder incluye rúbricas analíticas CEFR');
  assert(aiContext.sourceReferences.length > 0, 'ContextBuilder acredita fuentes bibliográficas oficiales');

  // --------------------------------------------------------------------------
  // TEST 19: Formato Final de Prompt y Regla No Negociable de Marca Blanca
  // --------------------------------------------------------------------------
  console.log(`\n--- TEST 19: Verificación de Formato de Prompt y Marca Blanca ---`);
  const promptText = aiContext.toPromptContext();
  assert(promptText.includes('PEDAGOGICAL KNOWLEDGE VAULT - ACADEMIC CONTEXT'), 'Prompt contiene encabezado formal de iSchool');
  assert(promptText.includes('HIGH_SCHOOL_1'), 'Prompt contiene grado');
  assert(promptText.includes('CEFR TARGET: B1'), 'Prompt contiene objetivo CEFR');
  assert(promptText.includes('RECOMMENDED ACTIVITY PATTERNS'), 'Prompt contiene sección de patrones de actividad');
  assert(promptText.includes('ASSESSMENT CRITERIA'), 'Prompt contiene criterios de evaluación');

  // Regla No Negociable 1: Prohibición total de marcas comerciales externas en prompts generados
  const forbiddenTrademarks = ['Gemini', 'Obsidian', 'Canvas LMS', 'Google AI'];
  let trademarkViolationFound = false;
  for (const mark of forbiddenTrademarks) {
    if (promptText.includes(mark)) {
      trademarkViolationFound = true;
      console.error(`  ❌ Marca prohibida detectada en el contexto: "${mark}"`);
    }
  }
  assert(!trademarkViolationFound, 'El contexto generado cumple estrictamente con la política de Marca Blanca Institucional (Regla 1)');

  // --------------------------------------------------------------------------
  // RESUMEN FINAL DE LA AUDITORÍA
  // --------------------------------------------------------------------------
  console.log(`\n================================================================`);
  console.log(`📊 RESUMEN DE PRUEBAS: ${passedTests} PASADAS, ${failedTests} FALLADAS de ${totalTests}`);
  console.log(`================================================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch(err => {
  console.error('Error fatal durante la ejecución de las pruebas:', err);
  process.exit(1);
});
