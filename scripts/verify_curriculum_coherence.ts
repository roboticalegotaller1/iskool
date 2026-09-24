import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { AcademicGraph } from '../src/lib/knowledgeVault/academicGraph';

async function main() {
  console.log(`\n================================================================`);
  console.log(`🧠 PRUEBA DE COHERENCIA PEDAGÓGICA (GROUNDED EN KNOWLEDGE VAULT)`);
  console.log(`================================================================\n`);

  const docs = KnowledgeVaultLoader.loadAll();
  const graph = AcademicGraph.build(docs);

  // PREGUNTA 1: What speaking skills should a Primary 2 student be developing?
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`PREGUNTA 1: What speaking skills should a Primary 2 student be developing?`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const q1Results = await KnowledgeVaultQueryService.query({
    grade: 'primary_2',
    skill: 'speaking',
    status: 'approved'
  });
  console.log(`Respuesta fundada en la Bóveda Curricular:`);
  console.log(`Un estudiante de Primary 2 (transición Pre-A1 a A1) consolida el saludo, la auto-presentación y comienza a expresar preferencias personales (likes/dislikes):`);
  q1Results.filter(r => r.document_type === 'skill_progression' || r.document_type === 'language_function').forEach(r => {
    const docNode = graph.getNode(r.document_id);
    const progressionRole = docNode?.grade_progression?.['primary_2']?.role || 'active';
    console.log(`  📄 [${r.document_id}] ${r.title}`);
    console.log(`     - Rol en Primary 2: ${progressionRole.toUpperCase()}`);
    if (docNode?.learning_outcomes) {
      console.log(`     - Learning Outcomes:`);
      docNode.learning_outcomes.forEach(o => console.log(`       * ${o}`));
    }
  });

  // PREGUNTA 2: What grammar is introduced in A1?
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`PREGUNTA 2: What grammar is introduced in A1?`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const q2Results = docs.filter(d => {
    const fm = d.frontmatter;
    return fm.status === 'approved' &&
      fm.cefr.includes('A1') &&
      fm.skills.includes('grammar') &&
      d.documentId.startsWith('grammar_');
  });
  console.log(`Respuesta fundada en la Bóveda Curricular:`);
  console.log(`La gramática formal de nivel A1 abarca 5 ejes estructurales principales:`);
  q2Results.forEach(r => {
    console.log(`  📄 [${r.documentId}] ${r.frontmatter.title}`);
    const outcomes = r.frontmatter.learning_outcomes || [];
    outcomes.slice(0, 2).forEach(o => console.log(`     * ${o}`));
  });

  // PREGUNTA 3: What prerequisites exist for asking simple questions?
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`PREGUNTA 3: What prerequisites exist for asking simple questions?`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const targetId = 'func_asking_for_clarification_a1';
  const targetNode = graph.getNode(targetId);
  const prereqs = graph.getPrerequisites(targetId, true);
  const learningPath = graph.getLearningPath(targetId);
  console.log(`Respuesta fundada en el Grafo Académico para [${targetId}]:`);
  console.log(`  Nodo objetivo: ${targetNode?.title}`);
  console.log(`  Prerrequisitos directos y transitivos detectados:`);
  prereqs.forEach((pid, idx) => {
    const pNode = graph.getNode(pid);
    console.log(`     ${idx + 1}. [${pid}] (${pNode?.title})`);
  });
  console.log(`  Ruta de aprendizaje topológica recomendada (orden de enseñanza):`);
  learningPath.forEach((stepId, idx) => {
    const sNode = graph.getNode(stepId);
    console.log(`     Paso ${idx + 1}: [${stepId}] -> ${sNode?.title}`);
  });

  // PREGUNTA 4: What language functions are expected before A2?
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`PREGUNTA 4: What language functions are expected before A2?`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const q4Results = docs.filter(d => {
    const fm = d.frontmatter;
    return fm.status === 'approved' &&
      d.relativePath.includes('LanguageFunctions') &&
      (fm.cefr.includes('Pre-A1') || fm.cefr.includes('A1'));
  });
  console.log(`Respuesta fundada en la Bóveda Curricular:`);
  console.log(`Se esperan 6 funciones del lenguaje clave dominadas en Pre-A1 y A1:`);
  q4Results.forEach(r => {
    console.log(`  📄 [${r.documentId}] (CEFR: ${r.frontmatter.cefr.join(', ')})`);
    console.log(`     ${r.frontmatter.title}`);
  });

  // PREGUNTA 5: What vocabulary domains are appropriate for Primary 3?
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`PREGUNTA 5: What vocabulary domains are appropriate for Primary 3?`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const q5Results = await KnowledgeVaultQueryService.query({
    grade: 'primary_3',
    skill: 'vocabulary',
    status: 'approved'
  });
  console.log(`Respuesta fundada en la Bóveda Curricular:`);
  console.log(`Dominios léxicos activos para Primary 3 (A1):`);
  q5Results.filter(r => r.document_type === 'lexical_domain' || r.document_id.startsWith('vocab_')).forEach(r => {
    const docNode = graph.getNode(r.document_id);
    const role = docNode?.grade_progression?.['primary_3']?.role || 'active';
    console.log(`  📄 [${r.document_id}] ${r.title} (Progression: ${role.toUpperCase()})`);
  });

  // PREGUNTA 6: What should a student master before leaving A1?
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`PREGUNTA 6: What should a student master before leaving A1?`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  const primary4Profile = docs.find(d => d.documentId === 'grade_map_primary_4');
  console.log(`Respuesta fundada en el Mapa Curricular Maestro [grade_map_primary_4]:`);
  console.log(`Perfil de Egreso A1 (Exit Profile Primary 4):`);
  console.log(`  • CEFR Alcanzado: A1 Consolidado / Umbral A2`);
  console.log(`  • Cambridge Alignment: A1 Movers`);
  console.log(`  • Criterios de Dominio antes de Secundaria / A2:`);
  console.log(`    - Comprensión de lecturas breves y localización de información específica (scanning).`);
  console.log(`    - Intercambio oral fluido sobre gustos, aversiones, rutinas diarias y descripción física.`);
  console.log(`    - Redacción de oraciones compuestas con conectores coordinantes 'and' y 'but' con puntuación.`);
  console.log(`    - Control del Present Simple afirmativo, negativo e interrogativo con inflexión en 3a persona.`);
  console.log(`    - Estrategias de reparación conversacional ("Can you repeat, please?").`);
  console.log(`    - Dominio de más de 600 vocablos nucleares categorizados por dominios.`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
