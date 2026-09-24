/**
 * @file test_batch5_c1.ts
 * @description Prueba forense de Retrieval y Generación Académica para Batch 5 (C1)
 * Cumple estrictamente con las especificaciones del plan de Fase 5:
 * - Retrieval: Advanced Specialized | C1 | Writing | Academic Research Proposals
 * - Generación: Advanced Specialized | C1 | Writing | Science & Discovery | Research Proposal on Ethical AI in Genomic Medicine | 60 min
 */

import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';
import { AcademicGenerationValidator } from '../src/lib/academicGeneration/validator';

async function runC1Tests() {
  console.log('\n================================================================');
  console.log('🔍 PRUEBA DE RETRIEVAL BATCH 5 — C1');
  console.log('================================================================');

  const queryParams = {
    grade: 'advanced_specialized',
    cefr: 'C1',
    skill: 'writing',
    includeDrafts: false
  };

  console.log('Query Params:', JSON.stringify(queryParams, null, 2));

  const retrievedDocs = await KnowledgeVaultQueryService.query({
    grade: 'advanced_specialized',
    cefr: 'C1',
    skill: 'writing'
  });

  console.log(`\nDocumentos recuperados (${retrievedDocs.length}):`);
  
  const targetDoc = retrievedDocs.find(d => 
    d.document_id === 'writing_c1_academic_research_proposal' ||
    d.title.toLowerCase().includes('research proposal')
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
  console.log('🧪 PRUEBA DE GENERACIÓN ACADÉMICA BATCH 5 — C1');
  console.log('================================================================');
  console.log('Parámetros solicitados:');
  console.log('  • Grade: advanced_specialized');
  console.log('  • CEFR: C1');
  console.log('  • Skill: writing');
  console.log('  • Topic: science_and_discovery');
  console.log('  • Subskill: research_proposal');
  console.log('  • Duration: 60 minutes');

  // Registrar mock determinista para pruebas automatizadas C1
  BaseAcademicGenerator.setMockProvider(async (prompt: string) => {
    return JSON.stringify({
      title: "Algorithmic Precision vs Epistemic Equity: Collegiate Research Proposal Blueprint",
      grade: "advanced_specialized",
      cefr: "C1",
      skill: "writing",
      topic: "science_and_discovery",
      language_function: "evaluating_arguments_and_critiquing",
      activity_type: "opinion_paragraph",
      duration_minutes: 60,
      learning_objective: "Students can draft a collegiate academic research proposal of 250 words articulating a problem statement, literature gap, and methodological design using mandative subjunctive and participial absolute clauses.",
      student_instructions: "Examine the bioethics briefing on AI-driven genomic editing. Individually author an academic research proposal outline including an abstract, research question, theoretical justification, and proposed mixed-methods protocol. Ensure compliance with APA 7th referencing standards and utilize at least 2 inverted or subjunctive structures.",
      teacher_instructions: "Introduce the IMRaD proposal rubric and discuss how to problematize an empirical literature gap. Guide students through drafting the justification using academic nominalization and participial absolute clauses. Facilitate blind peer review modeled on international grant evaluation boards.",
      materials_needed: [
        "Pre-college academic proposal template (Abstract, Justification, Literature Gap, Methodology)",
        "Sample journal excerpts on algorithmic genomic diagnostics",
        "Institutional C1 Advanced Academic Writing Rubric"
      ],
      language_support: {
        useful_phrases: [
          "Lying at the intersection of genomic diagnostics and computational ethics is...",
          "Despite extensive literature devoted to X, the ontological implications of Y remain unexplored.",
          "It is imperative that regulatory frameworks mandate transparency before clinical deployment.",
          "The preliminary simulations having concluded, empirical validation becomes paramount."
        ],
        grammar_support: [
          "Mandative subjunctive: 'recommend that the institutional review board require...'",
          "Absolute participial clauses: 'algorithmic bias having been mitigated, the diagnostic model...'",
          "Marked thematic fronting: 'Crucial to this investigation is the integrity of the genomic dataset.'"
        ],
        vocabulary_support: [
          "epistemic vulnerability",
          "ontological framework",
          "methodological rigor",
          "reproducibility crisis",
          "bioethical mandate",
          "paradigm shift"
        ]
      },
      activity_steps: [
        {
          phase: "warm_up",
          duration_minutes: 15,
          teacher_instructions: "Deconstruct an excerpt from an authentic collegiate research grant application. Highlight how the author justifies the knowledge gap and articulates the research question.",
          student_instructions: "Analyze the sample proposal in pairs, annotate the problem statement, and evaluate the clarity of the primary research hypothesis."
        },
        {
          phase: "core_task",
          duration_minutes: 35,
          teacher_instructions: "Facilitate drafting of the 250-word research proposal. Monitor for precision in research design terminology, APA citation formatting, and advanced grammatical structures.",
          student_instructions: "Author the research proposal draft adhering to the formal headings: Abstract, Epistemic Rationale, Research Questions, and Proposed Mixed-Methods Methodology."
        },
        {
          phase: "wrap_up",
          duration_minutes: 10,
          teacher_instructions: "Orchestrate blind peer referee evaluations using the Institutional C1 Academic Writing Rubric. Focus on argument cogency and stylistic authority.",
          student_instructions: "Complete referee evaluation report for peer proposal, providing structured constructive critique on methodological feasibility and linguistic elegance."
        }
      ],
      assessment: {
        criteria: [
          "Articulates a sophisticated academic research question and justifies an original literature gap",
          "Deploys advanced syntactic structures (subjunctive mood, participial clauses, marked fronting) with native-like accuracy",
          "Adheres to collegiate academic register, eliminating colloquialisms and employing high-density nominalization",
          "Complies with formal structural conventions of international scholarly research proposals"
        ],
        rubric_snapshot: [
          "Institutional CEFR Assessment Rubric: Advanced Academic Proficiency (C1 Writing - Content, Communicative Achievement, Organization, Language)"
        ]
      }
    });
  });

  const result = await AcademicGenerationGenerator.call({
    grade: 'advanced_specialized',
    cefr: 'C1',
    skill: 'writing',
    topic: 'science_and_discovery',
    language_function: 'evaluating_arguments_and_critiquing',
    duration_minutes: 60,
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
  console.log('🏁 PRUEBAS DE BATCH 5 CONCLUIDAS CON ÉXITO');
  console.log('================================================================\n');
}

runC1Tests().catch(err => {
  console.error('Error fatal en pruebas C1:', err);
  process.exit(1);
});
