/**
 * @file adaptive_cli.ts
 * @description CLI de inspección, diagnóstico y gestión del subsistema Adaptive Learning de iSchool (Fase 7).
 * Soporta comandos:
 *   profile <student_id>
 *   gaps <student_id> [unit_id]
 *   path <student_id> [skill]
 *   next <student_id> [unit_id]
 *   group [unit_id]
 *   pilot
 */

import {
  AdaptiveLearningStore,
  AdaptiveLearningMasteryEngine,
  AdaptiveLearningGapDetector,
  AdaptiveLearningPriorityService,
  AdaptiveLearningPathService,
  AdaptiveLearningNextActionService,
  AdaptiveLearningGroupingService,
  AdaptiveLearningStudentContextBuilder,
  StudentAcademicProfileEntity,
  StudentCompetencyEntity,
  LearningEvidenceEntity
} from '../src/lib/adaptiveLearning';
import { KnowledgeVaultLoader } from '../src/lib/knowledgeVault/loader';
import { AcademicGraph } from '../src/lib/knowledgeVault/academicGraph';

async function seedFictionalStudents() {
  AdaptiveLearningStore.clear();

  // 1. Estudiante A: Carlos (A2 Speaking, brechas en giving reasons y clarification)
  const profileA: StudentAcademicProfileEntity = {
    id: 'prof_carlos',
    student_id: 'student_carlos_a2',
    subject: 'english',
    grade: 'high_school_1',
    overall_estimated_level: 'A2',
    reading: { level: 'B1', confidence: 0.70, confidence_level: 'medium', evidence_count: 3, status: 'on_track' },
    listening: { level: 'B1', confidence: 0.65, confidence_level: 'medium', evidence_count: 3, status: 'on_track' },
    speaking: { level: 'A2', confidence: 0.55, confidence_level: 'medium', evidence_count: 3, status: 'needs_support' },
    writing: { level: 'A2', confidence: 0.50, confidence_level: 'medium', evidence_count: 2, status: 'needs_support' },
    grammar: { level: 'B1', confidence: 0.70, confidence_level: 'medium', evidence_count: 4, status: 'on_track' },
    vocabulary: { level: 'A2', confidence: 0.60, confidence_level: 'medium', evidence_count: 3, status: 'progressing' },
    profile_version: 1,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };
  await AdaptiveLearningStore.saveProfile(profileA);

  const compA: StudentCompetencyEntity[] = [
    {
      id: 'comp_c1',
      student_id: 'student_carlos_a2',
      knowledge_unit_id: 'speaking_b1_secondary_expressing_opinions',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'developing',
      confidence: 0.55,
      confidence_level: 'medium',
      evidence_count: 2,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_c2',
      student_id: 'student_carlos_a2',
      knowledge_unit_id: 'func_giving_reasons',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'developing',
      confidence: 0.45,
      confidence_level: 'low',
      evidence_count: 1,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_c3',
      student_id: 'student_carlos_a2',
      knowledge_unit_id: 'func_clarifying',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'needs_review',
      confidence: 0.40,
      confidence_level: 'low',
      evidence_count: 1,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  await AdaptiveLearningStore.saveCompetencies('student_carlos_a2', compA);

  // 2. Estudiante B: Mariana (B1 Speaking, al nivel meta)
  const profileB: StudentAcademicProfileEntity = {
    id: 'prof_mariana',
    student_id: 'student_mariana_b1',
    subject: 'english',
    grade: 'high_school_1',
    overall_estimated_level: 'B1',
    reading: { level: 'B1', confidence: 0.85, confidence_level: 'strong', evidence_count: 5, status: 'on_track' },
    listening: { level: 'B1', confidence: 0.80, confidence_level: 'strong', evidence_count: 4, status: 'on_track' },
    speaking: { level: 'B1', confidence: 0.78, confidence_level: 'medium', evidence_count: 4, status: 'on_track' },
    writing: { level: 'B1', confidence: 0.75, confidence_level: 'medium', evidence_count: 4, status: 'on_track' },
    grammar: { level: 'B1', confidence: 0.82, confidence_level: 'strong', evidence_count: 5, status: 'on_track' },
    vocabulary: { level: 'B1', confidence: 0.80, confidence_level: 'strong', evidence_count: 5, status: 'on_track' },
    profile_version: 1,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };
  await AdaptiveLearningStore.saveProfile(profileB);

  const compB: StudentCompetencyEntity[] = [
    {
      id: 'comp_m1',
      student_id: 'student_mariana_b1',
      knowledge_unit_id: 'speaking_b1_secondary_expressing_opinions',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'secure',
      confidence: 0.80,
      confidence_level: 'strong',
      evidence_count: 4,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_m2',
      student_id: 'student_mariana_b1',
      knowledge_unit_id: 'func_giving_reasons',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'secure',
      confidence: 0.75,
      confidence_level: 'medium',
      evidence_count: 3,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_m3',
      student_id: 'student_mariana_b1',
      knowledge_unit_id: 'speaking_expressing_opinions_reasons_a2',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'A2',
      mastery_state: 'secure',
      confidence: 0.85,
      confidence_level: 'strong',
      evidence_count: 4,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_m4',
      student_id: 'student_mariana_b1',
      knowledge_unit_id: 'func_expressing_opinions',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'A2',
      mastery_state: 'secure',
      confidence: 0.85,
      confidence_level: 'strong',
      evidence_count: 4,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  await AdaptiveLearningStore.saveCompetencies('student_mariana_b1', compB);

  // 3. Estudiante C: Mateo (B2 Speaking, dominio consolidado)
  const profileC: StudentAcademicProfileEntity = {
    id: 'prof_mateo',
    student_id: 'student_mateo_b2',
    subject: 'english',
    grade: 'high_school_1',
    overall_estimated_level: 'B2',
    reading: { level: 'B2', confidence: 0.90, confidence_level: 'strong', evidence_count: 6, status: 'advanced' },
    listening: { level: 'B2', confidence: 0.88, confidence_level: 'strong', evidence_count: 5, status: 'advanced' },
    speaking: { level: 'B2', confidence: 0.92, confidence_level: 'strong', evidence_count: 7, status: 'advanced' },
    writing: { level: 'B2', confidence: 0.85, confidence_level: 'strong', evidence_count: 5, status: 'advanced' },
    grammar: { level: 'B2', confidence: 0.91, confidence_level: 'strong', evidence_count: 6, status: 'advanced' },
    vocabulary: { level: 'B2', confidence: 0.89, confidence_level: 'strong', evidence_count: 6, status: 'advanced' },
    profile_version: 1,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };
  await AdaptiveLearningStore.saveProfile(profileC);

  const compC: StudentCompetencyEntity[] = [
    {
      id: 'comp_mt1',
      student_id: 'student_mateo_b2',
      knowledge_unit_id: 'speaking_b1_secondary_expressing_opinions',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'mastered',
      confidence: 0.95,
      confidence_level: 'strong',
      evidence_count: 6,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_mt2',
      student_id: 'student_mateo_b2',
      knowledge_unit_id: 'func_giving_reasons',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'mastered',
      confidence: 0.92,
      confidence_level: 'strong',
      evidence_count: 5,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_mt3',
      student_id: 'student_mateo_b2',
      knowledge_unit_id: 'speaking_expressing_opinions_reasons_a2',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'A2',
      mastery_state: 'mastered',
      confidence: 0.98,
      confidence_level: 'strong',
      evidence_count: 6,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'comp_mt4',
      student_id: 'student_mateo_b2',
      knowledge_unit_id: 'func_expressing_opinions',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'A2',
      mastery_state: 'mastered',
      confidence: 0.98,
      confidence_level: 'strong',
      evidence_count: 6,
      source: 'assessment',
      teacher_override: false,
      locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  await AdaptiveLearningStore.saveCompetencies('student_mateo_b2', compC);
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';
  const param1 = args[1] || '';
  const param2 = args[2] || '';

  await seedFictionalStudents();

  if (command === 'profile') {
    const studentId = param1 || 'student_carlos_a2';
    const profile = await AdaptiveLearningStore.getProfile(studentId);
    const comps = await AdaptiveLearningStore.getCompetencies(studentId);

    console.log(`\n================================================================`);
    console.log(`  EXPEDIENTE ACADÉMICO ADAPTATIVO: ${studentId.toUpperCase()}`);
    console.log(`================================================================`);
    console.log(`Grado: ${profile.grade} | Asignatura: ${profile.subject.toUpperCase()}`);
    console.log(`Nivel General Estimado: ${profile.overall_estimated_level} (v${profile.profile_version})`);
    console.log(`\n--- RESUMEN POR HABILIDAD LINGÜÍSTICA ---`);
    console.log(`Reading:    ${profile.reading.level} (Confianza: ${profile.reading.confidence} - ${profile.reading.confidence_level}) | Status: ${profile.reading.status}`);
    console.log(`Listening:  ${profile.listening.level} (Confianza: ${profile.listening.confidence} - ${profile.listening.confidence_level}) | Status: ${profile.listening.status}`);
    console.log(`Speaking:   ${profile.speaking.level} (Confianza: ${profile.speaking.confidence} - ${profile.speaking.confidence_level}) | Status: ${profile.speaking.status}`);
    console.log(`Writing:    ${profile.writing.level} (Confianza: ${profile.writing.confidence} - ${profile.writing.confidence_level}) | Status: ${profile.writing.status}`);
    console.log(`Grammar:    ${profile.grammar.level} (Confianza: ${profile.grammar.confidence} - ${profile.grammar.confidence_level}) | Status: ${profile.grammar.status}`);
    console.log(`Vocabulary: ${profile.vocabulary.level} (Confianza: ${profile.vocabulary.confidence} - ${profile.vocabulary.confidence_level}) | Status: ${profile.vocabulary.status}`);

    console.log(`\n--- MICRO-COMPETENCIAS REGISTRADAS (${comps.size}) ---`);
    for (const [id, c] of comps.entries()) {
      console.log(`- [${c.mastery_state.toUpperCase()}] ${id} (${c.estimated_level}) | Confianza: ${c.confidence} (${c.confidence_level}) | Fuente: ${c.source}`);
    }
    console.log(`================================================================\n`);
  } else if (command === 'gaps') {
    const studentId = param1 || 'student_carlos_a2';
    const targetUnit = param2 || 'speaking_b1_secondary_expressing_opinions';
    const comps = await AdaptiveLearningStore.getCompetencies(studentId);
    const gaps = AdaptiveLearningGapDetector.call([targetUnit], comps);

    console.log(`\n================================================================`);
    console.log(`  AUDITORÍA DE BRECHAS CURRICULARES (GAP DETECTOR)`);
    console.log(`  Estudiante: ${studentId} | Unidad Objetivo: ${targetUnit}`);
    console.log(`================================================================`);
    if (gaps.length === 0) {
      console.log(`No se detectaron brechas activas. El estudiante domina los requisitos.`);
    } else {
      gaps.forEach((g, idx) => {
        console.log(`\n[${idx + 1}] ${g.gap_type.toUpperCase()} -> ${g.knowledge_unit_id} (${g.cefr} - ${g.skill})`);
        console.log(`    Título: "${g.title}"`);
        console.log(`    Estado actual: ${g.current_state} | Puntuación de Prioridad: ${g.priority_score}/100`);
        console.log(`    Dependientes posteriores: ${g.downstream_dependents_count}`);
        console.log(`    Razón pedagógica: ${g.rationale}`);
      });
    }
    console.log(`================================================================\n`);
  } else if (command === 'path') {
    const studentId = param1 || 'student_carlos_a2';
    const skill = param2 || 'speaking';
    const comps = await AdaptiveLearningStore.getCompetencies(studentId);
    const gaps = AdaptiveLearningGapDetector.call(['speaking_b1_secondary_expressing_opinions'], comps);
    const priorities = AdaptiveLearningPriorityService.call(gaps, comps, 'speaking_b1_secondary_expressing_opinions');
    const pathResult = AdaptiveLearningPathService.call(studentId, skill, 'B1', priorities, comps);

    console.log(`\n================================================================`);
    console.log(`  RUTA DE APRENDIZAJE PERSONALIZADA (PERSONAL LEARNING PATH)`);
    console.log(`  Estudiante: ${studentId} | Habilidad: ${skill} -> Meta: ${pathResult.target_cefr}`);
    console.log(`================================================================`);
    console.log(`Resumen: ${pathResult.pedagogical_summary}\n`);
    pathResult.steps.forEach(s => {
      console.log(`Paso ${s.step_number}: [${s.cefr}] ${s.knowledge_unit_id} (${s.is_prerequisite_bridge ? 'PUENTE FORMATIVO' : 'OBJETIVO CURSO'})`);
      console.log(`  Título: "${s.title}"`);
      console.log(`  Estado: ${s.current_state} | Meta: ${s.learning_goal}`);
      console.log(`  Justificación: ${s.rationale}\n`);
    });
    console.log(`================================================================\n`);
  } else if (command === 'next') {
    const studentId = param1 || 'student_carlos_a2';
    const targetUnit = param2 || 'speaking_b1_secondary_expressing_opinions';
    const comps = await AdaptiveLearningStore.getCompetencies(studentId);
    const gaps = AdaptiveLearningGapDetector.call([targetUnit], comps);
    const priorities = AdaptiveLearningPriorityService.call(gaps, comps, targetUnit);
    const rec = AdaptiveLearningNextActionService.call(studentId, targetUnit, priorities, comps);

    console.log(`\n================================================================`);
    console.log(`  PRÓXIMA MEJOR ACCIÓN EDUCATIVA (NEXT ACTION SERVICE)`);
    console.log(`  Estudiante: ${studentId} | Lección del Día: ${targetUnit}`);
    console.log(`================================================================`);
    console.log(`Acción Recomendada:      ${rec.action.toUpperCase()}`);
    console.log(`Variante Sugerida:       ${rec.adaptation_suggested.toUpperCase()}`);
    console.log(`Unidad Didáctica Foco:   ${rec.target_knowledge_unit_id} ("${rec.target_knowledge_title}")`);
    console.log(`Estado Actual:           ${rec.current_state} (Confianza: ${rec.confidence})`);
    console.log(`Justificación Pedagógica:\n  ${rec.rationale}`);
    if (rec.bridge_guidance) {
      console.log(`Guía de Andamiaje / Puente:\n  ${rec.bridge_guidance}`);
    }
    console.log(`================================================================\n`);
  } else if (command === 'group') {
    const targetUnit = param1 || 'speaking_b1_secondary_expressing_opinions';
    const compsA = await AdaptiveLearningStore.getCompetencies('student_carlos_a2');
    const compsB = await AdaptiveLearningStore.getCompetencies('student_mariana_b1');
    const compsC = await AdaptiveLearningStore.getCompetencies('student_mateo_b2');

    const students = [
      { student_id: 'student_carlos_a2', display_alias: 'Carlos (Speaking A2)', competenciesMap: compsA },
      { student_id: 'student_mariana_b1', display_alias: 'Mariana (Speaking B1)', competenciesMap: compsB },
      { student_id: 'student_mateo_b2', display_alias: 'Mateo (Speaking B2)', competenciesMap: compsC }
    ];

    const clusters = AdaptiveLearningGroupingService.call(students, targetUnit);

    console.log(`\n================================================================`);
    console.log(`  AGRUPAMIENTO PEDAGÓGICO DIFERENCIADO EN AULA (GROUPING SERVICE)`);
    console.log(`  Lección Objetivo: ${targetUnit}`);
    console.log(`================================================================`);
    clusters.forEach((c, idx) => {
      console.log(`\n[GRUPO ${idx + 1}] "${c.pedagogical_label}"`);
      console.log(`  Variante de Actividad: ${c.suggested_adaptation.toUpperCase()}`);
      console.log(`  Alumnos Asignados:     ${c.student_ids.join(', ')}`);
      console.log(`  Razón Didáctica:       ${c.rationale}`);
    });
    console.log(`================================================================\n`);
  } else {
    console.log(`\nUso del CLI Adaptive Learning:`);
    console.log(`  bin/rails adaptive:profile <student_id>`);
    console.log(`  bin/rails adaptive:gaps <student_id> [target_unit_id]`);
    console.log(`  bin/rails adaptive:path <student_id> [skill]`);
    console.log(`  bin/rails adaptive:next <student_id> [target_unit_id]`);
    console.log(`  bin/rails adaptive:group [target_unit_id]`);
    console.log(`  bin/rails adaptive:pilot\n`);
  }
}

main().catch(err => {
  console.error('Error en adaptive_cli:', err);
  process.exit(1);
});
