/**
 * @file test_batch_2_a2.ts
 * @description Prueba forense de Retrieval y Generación para Batch 2 (A2)
 * Cumple estrictamente con las especificaciones del usuario:
 * - Retrieval: Secondary 1 | A2 | Speaking | Making suggestions
 * - Generación: Secondary 1 | A2 | Speaking | Travel | Making suggestions | 15 minutes
 */

import { KnowledgeVaultQueryService } from '../src/lib/knowledgeVault/queryService';
import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';

async function runA2Tests() {
  console.log('\n================================================================');
  console.log('🔍 PRUEBA DE RETRIEVAL BATCH 2 — A2');
  console.log('================================================================');

  const query = {
    grade: 'secondary_1',
    cefr: 'A2',
    skill: 'speaking',
    language_function: 'making_suggestions',
    includeDrafts: false
  };

  console.log('Query:', JSON.stringify(query, null, 2));

  const retrievedDocs = await KnowledgeVaultQueryService.query({
    grade: 'secondary_1',
    cefr: 'A2',
    skill: 'speaking',
    language_function: 'making_suggestions'
  });

  console.log(`\nDocumentos recuperados (${retrievedDocs.length}):`);
  for (const doc of retrievedDocs) {
    const meta = (doc.metadata || {}) as Record<string, any>;
    const prereqs = meta.prerequisites || (doc as any).prerequisites || [];
    const buildsOn = meta.builds_on || (doc as any).builds_on || [];
    const relatedTo = meta.related_to || (doc as any).related_to || [];
    const assessedBy = meta.assessed_by || (doc as any).assessed_by || [];
    const learningOutcomes = meta.learning_outcomes || (doc as any).learning_outcomes || [];
    const assessmentEvidence = meta.assessment_evidence || (doc as any).assessment_evidence || [];

    console.log(`\n--- [${doc.document_id}] ---`);
    console.log(`Título: ${doc.title}`);
    console.log(`Tipo: ${doc.document_type}`);
    console.log(`Grados: ${doc.grades.join(', ')}`);
    console.log(`CEFR: ${doc.cefr.join(', ')}`);
    console.log(`Habilidades: ${doc.skills.join(', ')}`);
    console.log(`Funciones: ${meta.language_functions?.join(', ') || 'N/A'}`);
    console.log(`Relaciones:`);
    console.log(`  - Prerequisitos: ${prereqs.length > 0 ? prereqs.join(', ') : 'ninguno'}`);
    console.log(`  - Builds on: ${buildsOn.length > 0 ? buildsOn.join(', ') : 'ninguno'}`);
    console.log(`  - Related to: ${relatedTo.length > 0 ? relatedTo.join(', ') : 'ninguno'}`);
    console.log(`  - Evaluado por: ${assessedBy.length > 0 ? assessedBy.join(', ') : 'ninguno'}`);
    console.log(`Learning Outcomes:`);
    learningOutcomes.forEach((lo: string) => console.log(`  • ${lo}`));
    console.log(`Assessment Evidence:`);
    assessmentEvidence.forEach((ae: string) => console.log(`  • ${ae}`));
    console.log(`Fuentes: ${doc.source_ids?.join(', ') || 'ninguna'}`);
  }

  console.log('\n================================================================');
  console.log('🧪 PRUEBA DE GENERACIÓN BATCH 2 — A2');
  console.log('================================================================');
  console.log('Parámetros solicitados:');
  console.log('  • Grade: secondary_1');
  console.log('  • CEFR: A2');
  console.log('  • Skill: speaking');
  console.log('  • Topic: travel_and_culture');
  console.log('  • Language Function: making_suggestions');
  console.log('  • Duration: 15 minutes');

  // Configurar mock contextual de alta fidelidad cumpliendo con el schema de AcademicActivityOutput
  BaseAcademicGenerator.setMockProvider(async (prompt: string) => {
    return JSON.stringify({
      title: "Weekend Excursion: Making Suggestions for a Class Trip",
      grade: "secondary_1",
      cefr: "A2",
      skill: "speaking",
      topic: "travel_and_culture",
      language_function: "making_suggestions",
      activity_type: "information_gap",
      duration_minutes: 15,
      learning_objective: "Students can make, accept, and counter-propose travel suggestions using 'Shall we...?' and 'Why don't we...?' in a collaborative paired decision task.",
      student_instructions: "In pairs, look at the travel options for a day trip. Suggest activities to your partner using 'Shall we...?' and 'Why don't we...?'. Agree on one destination and departure time.",
      teacher_instructions: "Model the suggestion frames on the board. Monitor pairs for bare infinitive use. Select 3 pairs to present their final itinerary.",
      language_support: {
        target_structures: [
          "Shall we + base verb (e.g., Shall we take the train?)",
          "Why don't we + base verb (e.g., Why don't we visit the zoo?)",
          "Let's + base verb (e.g., Let's meet at 9:00 AM)"
        ],
        key_vocabulary: [
          "train", "station", "ticket", "platform", "suitcase", "backpack", "guidebook", "sightseeing"
        ],
        sentence_frames: [
          "Shall we go to...?",
          "Why don't we take the...?",
          "That sounds like a great idea!",
          "I'm not so sure. Why don't we... instead?"
        ],
        useful_phrases: [
          "Shall we...?",
          "Why don't we...?",
          "That sounds great!",
          "I would prefer to..."
        ]
      },
      activity_steps: [
        {
          step_number: 1,
          phase: "Warm-up & Model",
          duration_minutes: 3,
          teacher_action: "Display photos of 3 travel destinations. Model: 'Why don't we visit the museum?'. Elicit choral response.",
          student_action: "Listen and repeat the target phrase with rising-falling intonation."
        },
        {
          step_number: 2,
          phase: "Collaborative Decision Task",
          duration_minutes: 8,
          teacher_action: "Hand out paired trip cards. Monitor pair negotiation and prompt turn-taking.",
          student_action: "Student A suggests a destination; Student B reacts and counter-proposes until an agreement is reached."
        },
        {
          step_number: 3,
          phase: "Reporting & Formative Wrap-up",
          duration_minutes: 4,
          teacher_action: "Ask 3 pairs to state their decision: 'We decided to go to... because...'. Provide praise and target form feedback.",
          student_action: "Report pair decision to the whole class in two connected sentences."
        }
      ],
      assessment: {
        evidence: "Paired oral decision demonstrating at least 2 suggestion formulas and 1 polite reaction.",
        criteria: [
          "Uses bare infinitive after Shall we and Why don't we",
          "Maintains turn-taking without switching to Spanish",
          "Includes at least 3 travel vocabulary terms"
        ],
        success_criteria: [
          "Uses bare infinitive after Shall we and Why don't we",
          "Maintains turn-taking without switching to Spanish",
          "Includes at least 3 travel vocabulary terms"
        ],
        rubric_snapshot: [
          "A2 Flyers/Key Holistic Speaking Rubric - Interactive Communication & Language Accuracy"
        ]
      }
    });
  });

  const generationResult = await AcademicGenerationGenerator.call({
    grade: 'secondary_1',
    cefr: 'A2',
    skill: 'speaking',
    topic: 'travel_and_culture',
    language_function: 'making_suggestions',
    duration_minutes: 15,
    activity_type: 'information_gap'
  });

  console.log('\nResultado de Generación Académica:');
  console.log(`  • Éxito: ${generationResult.success ? '✅ SÍ' : '❌ NO'}`);
  const activity = generationResult.activity as any;
  if (activity) {
    console.log(`  • Actividad generada: "${activity.title}"`);
    console.log(`  • Grado objetivo: ${activity.grade}`);
    console.log(`  • CEFR objetivo: ${activity.cefr}`);
    console.log(`  • Habilidad: ${activity.skill}`);
    console.log(`  • Tema: ${activity.topic}`);
    console.log(`  • Función: ${activity.language_function}`);
    console.log(`  • Duración: ${activity.duration_minutes} min`);
    console.log(`  • Documentos del Knowledge Vault trazados: ${generationResult.traceability.knowledge_document_ids.length}`);
    generationResult.traceability.knowledge_document_ids.forEach(docId => console.log(`     - [${docId}]`));
    console.log(`  • Pasos cronometrados de la actividad: ${activity.activity_steps?.length || 0}`);
    (activity.activity_steps || []).forEach((s: any, idx: number) => console.log(`     * Paso ${idx + 1}: ${s.phase || s.phase_name} (${s.duration_minutes} min)`));
    console.log(`  • Criterios de evaluación vinculados: ${activity.assessment?.criteria?.length || 0}`);
    (activity.assessment?.criteria || []).forEach((c: string) => console.log(`     * ${c}`));
  }
  console.log(`  • Validación de fidelidad pedagógica:`);
  console.log(`     * Valid: ${generationResult.validation.valid ? '✅ SÍ' : '❌ NO'}`);
  console.log(`     * Errores: ${generationResult.validation.errors.length}`);
  if (generationResult.validation.errors.length > 0) {
    generationResult.validation.errors.forEach(e => console.log(`       ❌ ${e}`));
  }
  console.log(`     * Advertencias: ${generationResult.validation.warnings.length}`);
  if (generationResult.validation.warnings.length > 0) {
    generationResult.validation.warnings.forEach(w => console.log(`       ⚠️ ${w}`));
  }
}

runA2Tests().catch(err => {
  console.error('Error en pruebas A2:', err);
  process.exit(1);
});
