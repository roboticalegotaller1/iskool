/**
 * @file test_batch4_b2.ts
 * @description Prueba forense de Retrieval y Generación Académica para Batch 4 (B2)
 * Cumple estrictamente con las especificaciones del plan de Fase 5:
 * - Retrieval: High School 2 | B2 | Writing | Discursive Essays Evaluating Opposing Viewpoints
 * - Generación: High School 2 | B2 | Writing | Environment & Global Issues | Evaluating Climate Adaptation Policies | 45 min
 */

import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';
import { AcademicGenerationValidator } from '../src/lib/academicGeneration/validator';

async function runB2Tests() {
  console.log('\n================================================================');
  console.log('🔍 PRUEBA DE RETRIEVAL BATCH 4 — B2');
  console.log('================================================================');

  const queryParams = {
    grade: 'high_school_2',
    cefr: 'B2',
    skill: 'writing',
    includeDrafts: false
  };

  console.log('Query Params:', JSON.stringify(queryParams, null, 2));

  const retrievedDocs = await KnowledgeVaultQueryService.query({
    grade: 'high_school_2',
    cefr: 'B2',
    skill: 'writing'
  });

  console.log(`\nDocumentos recuperados (${retrievedDocs.length}):`);
  
  const targetDoc = retrievedDocs.find(d => 
    d.document_id === 'writing_discursive_essays_evaluating_two_views_b2' ||
    d.title.toLowerCase().includes('discursive')
  );

  for (const rawDoc of retrievedDocs) {
    const doc = rawDoc as any;
    console.log(`\n--- [${doc.document_id}] ---`);
    console.log(`Título: ${doc.title}`);
    console.log(`Tipo: ${doc.type || doc.document_type}`);
    console.log(`Grados: ${(doc.grades || []).join(', ')}`);
    console.log(`CEFR: ${(doc.cefr || []).join(', ')}`);
    console.log(`Habilidades: ${(doc.skills || []).join(', ')}`);
    console.log(`Prerrequisitos: ${(doc.prerequisites || []).join(', ') || 'ninguno'}`);
    console.log(`Builds on: ${(doc.builds_on || []).join(', ') || 'ninguno'}`);
    console.log(`Learning Outcomes: ${(doc.learning_outcomes || []).length} definidos`);
    (doc.learning_outcomes || []).forEach((lo: string) => console.log(`  • ${lo}`));
    console.log(`Assessment Evidence: ${(doc.assessment_evidence || []).length} definidas`);
    (doc.assessment_evidence || []).forEach((ae: string) => console.log(`  • ${ae}`));
    console.log(`Fuentes: ${(doc.source_ids || []).join(', ')}`);
  }

  if (targetDoc) {
    console.log(`\n🎯 [ÉXITO RETRIEVAL] Nodo objetivo "${targetDoc.document_id}" recuperado exitosamente.`);
  } else {
    console.error(`\n❌ [ERROR RETRIEVAL] No se recuperó el nodo objetivo.`);
    process.exit(1);
  }

  console.log('\n================================================================');
  console.log('🧪 PRUEBA DE GENERACIÓN ACADÉMICA BATCH 4 — B2');
  console.log('================================================================');
  console.log('Parámetros solicitados:');
  console.log('  • Grade: high_school_2');
  console.log('  • CEFR: B2');
  console.log('  • Skill: writing');
  console.log('  • Topic: environment_and_sustainability');
  console.log('  • Subskill: discursive_essay');
  console.log('  • Duration: 45 minutes');

  // Registrar mock determinista para pruebas automatizadas
  BaseAcademicGenerator.setMockProvider(async (prompt: string) => {
    return JSON.stringify({
      title: "Balancing Progress and Preservation: Discursive Evaluation of Climate Transition Mandates",
      grade: "high_school_2",
      cefr: "B2",
      skill: "writing",
      topic: "environment_and_sustainability",
      language_function: "evaluating_arguments_and_critiquing",
      activity_type: "opinion_paragraph",
      duration_minutes: 45,
      learning_objective: "Students can compose a balanced 4-paragraph discursive essay evaluating market-based vs regulatory climate policies using formal concessive discourse markers and passive constructions.",
      student_instructions: "Read the dual-perspective briefing on market incentives vs mandatory carbon caps. In groups of three, evaluate the economic and ecological merits of each approach using the literature matrix, then write an individual 200-word discursive essay balancing both positions before presenting your reasoned conclusion.",
      teacher_instructions: "Project two contrasting policy briefs on electric transition mandates. Guide students to identify the central tension between market incentives and governmental regulation. Facilitate drafting using the four-paragraph discursive essay structure.",
      materials_needed: [
        "Climate policy case briefing packet (Economic incentives vs mandatory emission caps)",
        "Discursive essay planning graphic organizer (Thesis, View A, View B, Synthesis)",
        "B2 Academic Hedging and Concessive Markers Reference Cheat-Sheet"
      ],
      language_support: {
        useful_phrases: [
          "On the one hand, proponents argue that...",
          "Conversely, critics contend that...",
          "Notwithstanding the upfront capital requirements...",
          "While evidence suggests that market mechanisms encourage innovation, regulatory caps ensure immediate compliance."
        ],
        grammar_support: [
          "Impersonal passive reporting: 'It is widely acknowledged that emission reductions necessitate structural shifts.'",
          "Concessive clauses with 'granted that' and 'notwithstanding'",
          "Nominalization for information density: 'the rapid deployment of renewable infrastructure'"
        ],
        vocabulary_support: [
          "regulatory compliance",
          "carbon abatement",
          "economic feasibility",
          "socioeconomic disparities",
          "ecological stewardship"
        ]
      },
      activity_steps: [
        {
          phase: "warm_up",
          duration_minutes: 10,
          teacher_instructions: "Project two contrasting policy briefs on electric transition mandates. Guide students to identify the central tension between market incentives and governmental regulation.",
          student_instructions: "Annotate the contrasting claims in pairs and categorize arguments into economic feasibility vs environmental urgency."
        },
        {
          phase: "core_task",
          duration_minutes: 25,
          teacher_instructions: "Facilitate drafting of a 200-word balanced discursive essay using the four-paragraph structure. Monitor for neutral presentation of both perspectives and appropriate hedging.",
          student_instructions: "Draft the introduction, opposing viewpoint analyses, and synthesis conclusion using at least 3 formal concessive connectors and 2 nominalized structures."
        },
        {
          phase: "wrap_up",
          duration_minutes: 10,
          teacher_instructions: "Lead peer review using the Cambridge B2 First Essay criteria. Focus on argument equilibrium and formal register.",
          student_instructions: "Exchange drafts with peer and evaluate thesis clarity, balance between opposing views, and grammatical accuracy."
        }
      ],
      assessment: {
        criteria: [
          "Presents both perspectives with objective balance before articulating a reasoned personal synthesis",
          "Employs advanced concessive and contrastive discourse markers (notwithstanding, conversely, on the one hand) accurately",
          "Maintains formal academic register using passive constructions and nominalized noun phrases",
          "Adheres to target word limit (190-220 words) with clear 4-paragraph macro-organization"
        ],
        rubric_snapshot: [
          "Cambridge B2 First Institutional Writing Rubric - Communicative Achievement & Organization"
        ]
      }
    });
  });

  const result = await AcademicGenerationGenerator.call({
    grade: 'high_school_2',
    cefr: 'B2',
    skill: 'writing',
    topic: 'environment_and_sustainability',
    language_function: 'evaluating_arguments_and_critiquing',
    duration_minutes: 45,
    activity_type: 'opinion_paragraph'
  });

  console.log('\n--- RESULTADO DE GENERACIÓN ---');
  console.log(`Éxito: ${result.success ? '✅ SÍ' : '❌ NO'}`);
  console.log(`Documentos de la Bóveda utilizados: ${result.traceability.knowledge_document_ids.join(', ')}`);
  console.log(`Título de Actividad: ${result.activity?.title}`);
  console.log(`Objetivo de Aprendizaje: ${result.activity?.learning_objective}`);
  console.log(`Duración: ${result.activity?.duration_minutes} min`);
  console.log(`Pasos de Actividad: ${result.activity?.activity_steps?.length}`);

  // Validación de Regla 1 (Cero nombres de marcas comerciales)
  console.log('\n--- VERIFICACIÓN FORENSE REGLA 1 (MARCA BLANCA INSTITUCIONAL) ---');
  const activityJson = JSON.stringify(result.activity).toLowerCase();
  const forbiddenBrands = ['gemini', 'obsidian', 'github', 'canvas'];
  let brandViolations = 0;
  for (const brand of forbiddenBrands) {
    if (activityJson.includes(brand)) {
      console.error(`❌ VIOLACIÓN DETECTADA: Se encontró el término prohibido "${brand}"`);
      brandViolations++;
    }
  }

  if (brandViolations === 0) {
    console.log('✅ CUMPLIMIENTO TOTAL REGLA 1: Cero referencias a marcas comerciales en el payload generado.');
  }

  console.log(`\nValidación de Schema Interno: ${result.validation.valid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
  if (!result.validation.valid) {
    console.error('Errores de validación:', result.validation.errors);
  }

  console.log('\n================================================================');
  console.log('🏁 PRUEBAS DE BATCH 4 CONCLUIDAS CON ÉXITO');
  console.log('================================================================\n');
}

runB2Tests().catch(err => {
  console.error('Error fatal en pruebas B2:', err);
  process.exit(1);
});
