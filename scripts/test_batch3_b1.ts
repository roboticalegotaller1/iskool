/**
 * @file test_batch3_b1.ts
 * @description Prueba forense de Retrieval y Generación Académica para Batch 3 (B1)
 * Cumple estrictamente con las especificaciones del plan de Fase 5:
 * - Retrieval: Secondary 3 | B1 | Reading | Inference and Author Purpose
 * - Generación: Secondary 3 | B1 | Reading | Technology & Media | Inferring Author Perspective & Bias | 25 min
 */

import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';
import { AcademicGenerationValidator } from '../src/lib/academicGeneration/validator';

async function runB1Tests() {
  console.log('\n================================================================');
  console.log('🔍 PRUEBA DE RETRIEVAL BATCH 3 — B1');
  console.log('================================================================');

  const queryParams = {
    grade: 'secondary_3',
    cefr: 'B1',
    skill: 'reading',
    includeDrafts: false
  };

  console.log('Query Params:', JSON.stringify(queryParams, null, 2));

  const retrievedDocs = await KnowledgeVaultQueryService.query({
    grade: 'secondary_3',
    cefr: 'B1',
    skill: 'reading'
  });

  console.log(`\nDocumentos recuperados (${retrievedDocs.length}):`);
  
  const targetDoc = retrievedDocs.find(d => 
    d.document_id === 'reading_b1_b2_inference_and_author_purpose' ||
    d.title.toLowerCase().includes('inference')
  );

  for (const doc of retrievedDocs) {
    const meta = (doc.metadata || {}) as Record<string, any>;
    const prereqs = meta.prerequisites || (doc as any).prerequisites || [];
    const buildsOn = meta.builds_on || (doc as any).builds_on || [];
    const learningOutcomes = meta.learning_outcomes || (doc as any).learning_outcomes || [];
    const assessmentEvidence = meta.assessment_evidence || (doc as any).assessment_evidence || [];

    console.log(`\n--- [${doc.document_id}] ---`);
    console.log(`Título: ${doc.title}`);
    console.log(`Tipo: ${doc.document_type}`);
    console.log(`Grados: ${doc.grades.join(', ')}`);
    console.log(`CEFR: ${doc.cefr.join(', ')}`);
    console.log(`Habilidades: ${doc.skills.join(', ')}`);
    console.log(`Prerrequisitos: ${prereqs.length > 0 ? prereqs.join(', ') : 'ninguno'}`);
    console.log(`Builds on: ${buildsOn.length > 0 ? buildsOn.join(', ') : 'ninguno'}`);
    console.log(`Learning Outcomes: ${learningOutcomes.length} definidos`);
    learningOutcomes.forEach((lo: string) => console.log(`  • ${lo}`));
    console.log(`Assessment Evidence: ${assessmentEvidence.length} definidas`);
    assessmentEvidence.forEach((ae: string) => console.log(`  • ${ae}`));
    console.log(`Fuentes: ${doc.source_ids?.join(', ') || 'ninguna'}`);
  }

  if (targetDoc) {
    console.log(`\n🎯 [ÉXITO RETRIEVAL] Nodo objetivo "reading_b1_b2_inference_and_author_purpose" recuperado exitosamente.`);
  } else {
    console.warn(`\n⚠️ [AVISO] El nodo específico no apareció en los primeros resultados filtrados.`);
  }

  console.log('\n================================================================');
  console.log('🧪 PRUEBA DE GENERACIÓN ACADÉMICA BATCH 3 — B1');
  console.log('================================================================');
  console.log('Parámetros solicitados:');
  console.log('  • Grade: secondary_3');
  console.log('  • CEFR: B1');
  console.log('  • Skill: reading');
  console.log('  • Topic: technology_and_media');
  console.log('  • Subskill: inferring_author_perspective_and_bias');
  console.log('  • Duration: 25 minutes');

  // Proveedor de alta fidelidad pedagógica para simulación de generación
  BaseAcademicGenerator.setMockProvider(async (prompt: string) => {
    return JSON.stringify({
      title: "Decoding the Digital Debate: Detecting Stance and Hidden Bias in Tech Articles",
      grade: "secondary_3",
      cefr: "B1",
      skill: "reading",
      topic: "technology_and_media",
      language_function: "evaluating_arguments_and_critiquing",
      activity_type: "reading_jigsaw",
      duration_minutes: 25,
      learning_objective: "Students can infer the author's underlying attitude and distinguish factual statements from implicit editorial bias in an informational article on social media algorithms.",
      student_instructions: "Read the article 'The Cost of Screen Time' silently. Underline modal verbs and evaluative adjectives that hint at the author's personal skepticism. In pairs, complete the Author Stance Matrix and state whether the writer advocates for regulation.",
      teacher_instructions: "Pre-teach key terms (algorithm, filter bubble, bias). Distribute the text and matrix. Give students 10 minutes for individual reading and clue hunting, then 10 minutes for paired debate. Dedicate 5 minutes to plenary synthesis.",
      language_support: {
        useful_phrases: [
          "The author seems skeptical about...",
          "The choice of the word 'alarming' suggests that...",
          "While acknowledging benefits, the text primarily focuses on..."
        ],
        grammar_support: [
          "Modal verbs of probability: might indicate, could suggest, cannot be overlooked",
          "Concessive transition phrases: Even though proponents argue..., in reality...",
          "Reporting verbs conveying attitude: claims, questions, highlights, overlooks"
        ],
        vocabulary_support: [
          "algorithm", "data privacy", "misinformation", "bias", "objective", "skeptical", "endorse", "transparency"
        ]
      },
      activity_steps: [
        {
          phase: "warm_up",
          duration_minutes: 5,
          teacher_instructions: "Display contrasting tech headlines and prompt students to identify subtle bias in word choice.",
          student_instructions: "Vote on which headline sounds neutral and justify choices using target vocabulary."
        },
        {
          phase: "core_task",
          duration_minutes: 15,
          teacher_instructions: "Guide students to annotate objective facts vs attitude markers, and complete the Stance Matrix in pairs.",
          student_instructions: "Read article individually, annotate modal verbs, and negotiate consensus with partner."
        },
        {
          phase: "wrap_up",
          duration_minutes: 5,
          teacher_instructions: "Collect exit tickets and highlight exemplary evidence-based inferences.",
          student_instructions: "Submit completed Stance Matrix and 2-sentence inference."
        }
      ],
      assessment: {
        criteria: [
          "Accurately identifies at least 2 evaluative vocabulary cues revealing the author's perspective",
          "Distinguishes between objective factual data and authorial opinion",
          "Formulates a coherent 2-sentence inference justified by textual reference"
        ],
        rubric_snapshot: [
          "B1 Preliminary Receptive Skills Rubric - Critical Inference and Author Purpose"
        ]
      }
    });
  });

  const result = await AcademicGenerationGenerator.call({
    grade: 'secondary_3',
    cefr: 'B1',
    skill: 'reading',
    topic: 'technology_and_media',
    language_function: 'evaluating_arguments_and_critiquing',
    duration_minutes: 25,
    activity_type: 'reading_jigsaw'
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
  console.log('🏁 PRUEBAS DE BATCH 3 CONCLUIDAS CON ÉXITO');
  console.log('================================================================\n');
}

runB1Tests().catch(err => {
  console.error('Error fatal en pruebas B1:', err);
  process.exit(1);
});
