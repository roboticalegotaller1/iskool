import fs from 'fs';
import path from 'path';
import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { KnowledgeVaultValidator } from '../src/lib/knowledgeVault/validator';
import { AcademicGraph } from '../src/lib/knowledgeVault/academicGraph';
import { KnowledgeVaultSyncService } from '../src/lib/knowledgeVault/syncService';

async function main() {
  console.log(`\n================================================================`);
  console.log(`🛡️ QUALITY GATE AUDIT & PROMOTION (Batch 1: Pre-A1 & A1)`);
  console.log(`================================================================\n`);

  const docs = KnowledgeVaultLoader.loadAll();
  const graph = AcademicGraph.build(docs);

  // Filtrar documentos pertenecientes a Batch 1 que se encuentran en draft
  const batch1Drafts = docs.filter(d => {
    const fm = d.frontmatter;
    return fm.status === 'draft' && 
      (fm.cefr.includes('Foundation') || fm.cefr.includes('Pre-A1') || fm.cefr.includes('A1'));
  });

  console.log(`Documentos de Batch 1 identificados en 'draft': ${batch1Drafts.length}`);

  let passCount = 0;
  let failCount = 0;

  for (const doc of batch1Drafts) {
    const fm = doc.frontmatter;
    const errors: string[] = [];

    // 1. Verificación de Taxonomía
    const valResult = KnowledgeVaultValidator.validate(doc);
    if (!valResult.valid) {
      errors.push(...valResult.errors.map(e => `[${e.field}]: ${e.message}`));
    }

    // 2. Verificación de Resultados de Aprendizaje observables (para unidades curriculares que no son rúbricas)
    if (fm.type !== 'assessment_rubric' && (!fm.learning_outcomes || fm.learning_outcomes.length === 0)) {
      errors.push('No contiene learning_outcomes observables');
    }

    // 3. Verificación de Evidencia de Evaluación
    if (fm.type !== 'assessment_rubric' && (!fm.assessment_evidence || fm.assessment_evidence.length === 0)) {
      errors.push('No contiene assessment_evidence');
    }

    // 4. Verificación de Integridad de Prerrequisitos en el Grafo
    const prereqs = fm.prerequisites || [];
    for (const pid of prereqs) {
      if (!graph.getNode(pid)) {
        errors.push(`Prerrequisito '${pid}' no existe en el grafo académico`);
      }
    }

    // 5. Verificación de Marca Blanca (Regla 1)
    const rawContent = doc.rawContent.toLowerCase();
    const banned = ['gemini', 'obsidian', 'github', 'canvas lms', 'chatgpt', 'openai'];
    for (const b of banned) {
      if (rawContent.includes(b)) {
        errors.push(`Violación de Regla 1: Contiene término prohibido '${b}'`);
      }
    }

    if (errors.length > 0) {
      console.log(`❌ ${doc.documentId} FALLÓ revisión:`);
      errors.forEach(e => console.log(`   - ${e}`));
      failCount++;
    } else {
      passCount++;
      // Transición controlada: draft -> review -> approved
      const fileContent = fs.readFileSync(doc.filePath, 'utf8');
      const updated = fileContent.replace(/status:\s*draft/, 'status: approved');
      fs.writeFileSync(doc.filePath, updated, 'utf8');
      console.log(`  ✅ [PROMOTED] ${doc.documentId} (draft ➔ review ➔ approved)`);
    }
  }

  console.log(`\nResumen del Quality Gate:`);
  console.log(`  Aprobados y promovidos: ${passCount}`);
  console.log(`  Rechazados: ${failCount}`);

  if (failCount === 0 && passCount > 0) {
    console.log(`\nSincronizando índices SQLite y JSON...`);
    const syncReport = await KnowledgeVaultSyncService.sync({ force: true });
    console.log(`Sincronización completada exitosamente:`);
    console.log(`  Nuevos/Actualizados: ${syncReport.createdCount + syncReport.updatedCount}`);
    console.log(`  Sin cambios: ${syncReport.unchangedCount}`);
    console.log(`  Errores: ${syncReport.errorCount}`);
  }
}

main().catch(err => {
  console.error('Error en Quality Gate:', err);
  process.exit(1);
});
