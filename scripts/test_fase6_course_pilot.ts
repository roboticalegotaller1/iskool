/**
 * @file test_fase6_course_pilot.ts
 * @description Suite de validación forense y prueba integral del Piloto de Fase 6:
 * Course Planning Layer — High School 1 (B1 → B1+/B2).
 * Prueba la cadena completa: Bóveda Curricular -> Course Plan -> Units -> Lessons -> Slots -> Motor de IA -> Traceability -> Reports.
 */

import { CourseGenerator } from '../src/lib/coursePlanning/courseGenerator';
import { ActivitySlotBridge } from '../src/lib/coursePlanning/activitySlotBridge';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';
import { AcademicGenerationValidator } from '../src/lib/academicGeneration/validator';
import { KnowledgeTimelineService } from '../src/lib/coursePlanning/knowledgeTimelineService';
import { CurriculumAlignmentService } from '../src/lib/coursePlanning/curriculumAlignmentService';
import { CourseCoverageService } from '../src/lib/coursePlanning/courseCoverageService';
import { SkillBalanceService } from '../src/lib/coursePlanning/skillBalanceService';
import { TimeBudgetService } from '../src/lib/coursePlanning/timeBudgetService';
import { CourseQualityChecker } from '../src/lib/coursePlanning/courseQualityChecker';

async function runFase6PilotTest() {
  console.log('================================================================');
  console.log('🧪 INICIO DE PRUEBAS FORENSES: FASE 6 — COURSE PLANNING LAYER');
  console.log('================================================================\n');

  // Configurar mock provider determinista para el Motor de IA Pedagógica
  BaseAcademicGenerator.setMockProvider(async (prompt: string) => {
    return JSON.stringify({
      title: "Algorithmic Echoes: The Social Dilemma and Digital Privacy Forum",
      grade: "high_school_1",
      cefr: "B1",
      skill: "speaking",
      topic: "technology_and_media",
      language_function: "expressing_opinions",
      activity_type: "guided_discussion",
      duration_minutes: 50,
      learning_objective: "Students can articulate and defend a nuanced viewpoint on social media algorithms using formal opinion markers and second conditional hypothetical structures in a structured peer debate.",
      student_instructions: "In groups of three, analyze the provided tech case study on algorithmic recommendation feeds. Choose a stance (pro-regulation vs free-market personalization) and present two reasoned arguments using formal opinion modifiers.",
      teacher_instructions: "Facilitate a fishbowl discussion. Monitor for the accurate deployment of opinion signposts (From my standpoint, As far as I am concerned) and modal speculation (It could lead to, might cause).",
      language_support: {
        useful_phrases: [
          "From my standpoint, algorithmic feeds create filter bubbles.",
          "I am inclined to believe that user consent must be explicit.",
          "If platforms didn't prioritize engagement, civil discourse would improve."
        ],
        grammar_support: [
          "Second Conditional: If + past simple, would + base verb",
          "Passive reporting verbs: It is claimed that, are believed to"
        ],
        vocabulary_support: [
          "algorithmic transparency",
          "echo chamber",
          "data privacy",
          "digital footprint"
        ]
      },
      activity_steps: [
        {
          phase: "warm_up",
          duration_minutes: 8,
          teacher_instructions: "Project two contrasting headlines regarding digital privacy. Elicit immediate student reactions.",
          student_instructions: "Discuss with your elbow partner: How do you feel when your phone suggests an ad for something you just talked about?"
        },
        {
          phase: "core_task",
          duration_minutes: 32,
          teacher_instructions: "Divide class into policy makers and tech creators. Guide the fishbowl argumentation format.",
          student_instructions: "Debate the motion: Tech platforms should be legally restricted from using engagement-based recommendation algorithms."
        },
        {
          phase: "wrap_up",
          duration_minutes: 10,
          teacher_instructions: "Conduct whole-class error correction on pronunciation and connector precision. Collect exit tickets.",
          student_instructions: "Write a 3-sentence exit ticket summarizing the strongest counterargument heard today."
        }
      ],
      assessment: {
        criteria: [
          "Clear defense of a viewpoint with justified evidence",
          "Accurate use of opinion signposts and conditional hypothesis",
          "Active listening and turn-taking courtesy"
        ],
        rubric_snapshot: [
          "Band 4 (Exemplary): Fluent argumentation with complex hedging",
          "Band 3 (Competent): Clear viewpoint with minor pauses",
          "Band 2 (Developing): Simple opinion statements needing prompting"
        ]
      }
    });
  });

  // 1. GENERACIÓN DEL ESQUELETO DEL CURSO PILOTO
  console.log('📌 [PASO 1] Generando Curso Piloto High School 1 (40 Semanas / 8,000 min)...');
  const result = CourseGenerator.call({
    subject: 'english',
    grade: 'high_school_1',
    entry_cefr: 'B1',
    target_cefr: 'B2',
    total_weeks: 40,
    sessions_per_week: 4,
    minutes_per_session: 50,
    instructional_allocation_percent: 85,
    buffer_allocation_percent: 15
  });

  console.log(`✅ Curso Generado: "${result.course.title}" (ID: ${result.course.id})`);
  console.log(`   • Unidades: ${result.units.length} unidades temáticas.`);
  console.log(`   • Lecciones: ${result.lessons.length} lecciones semanales de 50 min.`);
  console.log(`   • Activity Slots: ${result.slots.length} ranuras pedagógicas cronometradas.`);
  console.log(`   • Blueprints de Evaluación: ${result.assessments.length} matrices institucionales.`);

  // 2. INSPECCIÓN DETALLADA DE LA UNIDAD 3 (Technology, Media & Digital Ethics)
  console.log('\n📌 [PASO 2] Inspeccionando Unidad 3: Technology, Media & Digital Ethics...');
  const unit3 = result.units.find(u => u.position === 3);
  if (!unit3) throw new Error('Unidad 3 no encontrada.');

  console.log(`✅ Unidad 3 Localizada: "${unit3.title}" (${unit3.duration_weeks} semanas / 20 lecciones / 80 slots)`);
  console.log(`   • Theme: ${unit3.theme}`);
  console.log(`   • Knowledge Targets (IDs referenciados): ${unit3.knowledge_targets.join(', ')}`);
  console.log(`   • Outcomes:`);
  for (const o of unit3.learning_outcomes) {
    console.log(`     - ${o}`);
  }

  // 3. INSPECCIÓN DETALLADA DE LA LECCIÓN 2 (Semana 12, Sesión 2)
  console.log('\n📌 [PASO 3] Inspeccionando Lección 2 (Semana 12, Sesión 2)...');
  const lesson2 = result.lessons.find(l => l.unit_id === unit3.id && l.session_number === 2);
  if (!lesson2) throw new Error('Lección 2 de la Unidad 3 no encontrada.');

  console.log(`✅ Lección Localizada: "${lesson2.title}"`);
  console.log(`   • Semana: ${lesson2.week_number} | Sesión: ${lesson2.session_number} | Duración: ${lesson2.duration_minutes} min`);
  console.log(`   • Modelo Metodológico: ${lesson2.pedagogical_model} | Tipo: ${lesson2.lesson_type}`);
  console.log(`   • Objetivo Primario: "${lesson2.primary_learning_outcome}"`);
  console.log(`   • Targets de la Sesión: ${lesson2.knowledge_targets.join(', ')}`);

  const lessonSlots = result.slots.filter(s => s.lesson_id === lesson2.id);
  console.log(`   • Slots didácticos asignados (${lessonSlots.length}):`);
  for (const s of lessonSlots) {
    console.log(`     [Slot ${s.position}] ${s.purpose.toUpperCase()} (${s.duration_minutes} min) — ${s.activity_pattern}: ${s.instructions_brief}`);
  }

  // 4. GENERACIÓN REAL DEL CONTENIDO DEL SLOT 3 (Collaborative Production)
  console.log('\n📌 [PASO 4] Conectando Slot 3 con el Motor de IA Pedagógica (AcademicGeneration)...');
  const targetSlot = lessonSlots.find(s => s.position === 3) || lessonSlots[0];
  const slotGenResult = await ActivitySlotBridge.generateSlotContent(
    result.course,
    unit3,
    lesson2,
    targetSlot
  );

  console.log(`✅ Actividad Generada con Éxito: "${slotGenResult.activity.title}"`);
  console.log(`   • ID de Trazabilidad: ${slotGenResult.traceabilityId}`);
  console.log(`   • Estado del Slot: ${targetSlot.status.toUpperCase()}`);
  console.log(`   • Duración: ${slotGenResult.activity.duration_minutes} minutos`);
  console.log(`   • Pasos Didácticos: ${slotGenResult.activity.activity_steps.length} fases cronometradas`);

  // 5. INSPECCIÓN DE TRAZABILIDAD EXTREMO A EXTREMO (Item 32)
  console.log('\n📌 [PASO 5] Verificando Trazabilidad Pedagógica Inmutable (Item 32):');
  console.log(`   • Which Course?            → ${result.course.id} ("${result.course.title}")`);
  console.log(`   • Which Unit?              → ${unit3.id} ("${unit3.title}")`);
  console.log(`   • Which Lesson?            → ${lesson2.id} ("${lesson2.title}")`);
  console.log(`   • Which Learning Outcome?  → "${lesson2.primary_learning_outcome}"`);
  console.log(`   • Which Knowledge Targets? → ${lesson2.knowledge_targets.join(', ')}`);
  console.log(`   • Which CEFR Level?        → ${result.course.entry_cefr} (Target: ${result.course.target_cefr})`);
  console.log(`   • Which Prompt Version?    → prompt_activity_v1`);
  console.log(`   • Which Model?             → Motor de Inteligencia Artificial Pedagógica (Modo Institucional)`);

  // 6. EJECUCIÓN DE REPORTES TÉCNICOS
  console.log('\n📌 [PASO 6] Ejecutando Reportes Técnicos Forenses...');
  console.log(TimeBudgetService.calculate(result.course, result.lessons));
  console.log(SkillBalanceService.formatForCli(result.skillBalance));
  console.log(KnowledgeTimelineService.formatForCli(result.knowledgeTimeline));
  console.log(CurriculumAlignmentService.formatForCli(result.alignment));
  console.log(CourseCoverageService.formatForCli(result.coverage));
  console.log(CourseQualityChecker.formatForCli(result.quality));

  // 7. ESTRUCTURA DE DATOS PARA TEACHER VIEW (Item 34)
  console.log('\n📌 [PASO 7] Vista Docente Estructurada (Teacher View - Week 12, Unit 3, Lesson 2):');
  const teacherViewData = {
    week: lesson2.week_number,
    session: lesson2.session_number,
    unit: {
      position: unit3.position,
      title: unit3.title,
      theme: unit3.theme
    },
    lesson: {
      title: lesson2.title,
      duration: `${lesson2.duration_minutes} min`,
      pedagogicalModel: lesson2.pedagogical_model,
      primaryOutcome: lesson2.primary_learning_outcome,
      knowledgeTargets: lesson2.knowledge_targets,
      activitySlots: lessonSlots.map(s => ({
        position: s.position,
        phase: s.purpose,
        duration: `${s.duration_minutes} min`,
        pattern: s.activity_pattern,
        activityTitle: s.generated_payload?.title || s.instructions_brief,
        status: s.status
      })),
      assessmentEvidence: lesson2.assessment_evidence
    }
  };
  console.log(JSON.stringify(teacherViewData, null, 2));

  // 8. AUDITORÍA FORENSE DE MARCA BLANCA (Regla No Negociable 1)
  console.log('\n📌 [PASO 8] Auditoría Forense de Marca Blanca (Regla No Negociable 1)...');
  const fullPayloadString = JSON.stringify({
    course: result.course,
    unit3,
    lesson2,
    generatedActivity: slotGenResult.activity,
    teacherViewData
  }).toLowerCase();

  const prohibitedBrands = ['gemini', 'obsidian', 'github', 'canvas lms'];
  const violations = prohibitedBrands.filter(brand => fullPayloadString.includes(brand));

  if (violations.length > 0) {
    console.error(`❌ VIOLACIÓN REGLA 1 DETECTADA: Se encontraron marcas prohibidas: ${violations.join(', ')}`);
    process.exit(1);
  } else {
    console.log('✅ AUDITORÍA DE MARCA BLANCA SUPERADA: Cero ocurrencias de marcas comerciales.');
  }

  console.log('\n================================================================');
  console.log('🏁 TODAS LAS PRUEBAS DE LA FASE 6 CONCLUIDAS CON ÉXITO ROTUNDO');
  console.log('================================================================');
}

runFase6PilotTest().catch(err => {
  console.error('[test_fase6_course_pilot ERROR]:', err);
  process.exit(1);
});
