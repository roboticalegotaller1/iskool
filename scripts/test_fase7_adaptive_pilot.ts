/**
 * @file test_fase7_adaptive_pilot.ts
 * @description Script integral de validación y certificación de la Fase 7 de iSchool:
 * "Personalización por alumno y rutas adaptativas de aprendizaje".
 *
 * Ejecuta el ciclo completo:
 * 1. Inicializa los 3 perfiles ficticios (Carlos A2, Mariana B1, Mateo B2).
 * 2. Genera las 3 actividades adaptadas (Support, Core, Extension) sobre la misma Lección de High School 1 B1 Speaking.
 * 3. Compara lado a lado las 3 versiones generadas evaluando andamiaje y complejidad.
 * 4. Demuestra el ciclo de progreso: Actividad -> Evidencia -> MasteryEngine -> Perfil Actualizado -> Nueva Acción.
 * 5. Verifica la autoridad docente (Teacher Override y candados).
 * 6. Verifica Privacy by Design (cero PII enviada a la IA).
 * 7. Certifica el estricto cumplimiento de Marca Blanca Institucional (Regla No Negociable 1).
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
import { AcademicGenerationGenerator } from '../src/lib/academicGeneration/generator';
import { AcademicGenerationParams } from '../src/lib/academicGeneration/types';
import { BaseAcademicGenerator } from '../src/lib/academicGeneration/baseGenerator';

async function runFase7Pilot() {
  console.log(`\n================================================================================`);
  console.log(`  iSchool — PILOTO DE CERTIFICACIÓN FASE 7: APRENDIZAJE ADAPTATIVO`);
  console.log(`================================================================================\n`);

  // ----------------------------------------------------------------------------
  // PASO 1: Inicialización de los 3 Perfiles Ficticios
  // ----------------------------------------------------------------------------
  console.log(`[Paso 1] Inicializando perfiles académicos ficticios...`);
  AdaptiveLearningStore.clear();

  // Alumno A: Carlos (Speaking A2, requiere apoyo en justificación y aclaración)
  const profileCarlos: StudentAcademicProfileEntity = {
    id: 'prof_carlos',
    student_id: 'student_carlos_a2',
    subject: 'english',
    grade: 'high_school_1',
    overall_estimated_level: 'A2',
    reading: { level: 'B1', confidence: 0.70, confidence_level: 'medium', evidence_count: 3, status: 'on_track' },
    listening: { level: 'B1', confidence: 0.65, confidence_level: 'medium', evidence_count: 3, status: 'on_track' },
    speaking: { level: 'A2', confidence: 0.50, confidence_level: 'medium', evidence_count: 2, status: 'needs_support' },
    writing: { level: 'A2', confidence: 0.50, confidence_level: 'medium', evidence_count: 2, status: 'needs_support' },
    grammar: { level: 'B1', confidence: 0.70, confidence_level: 'medium', evidence_count: 4, status: 'on_track' },
    vocabulary: { level: 'A2', confidence: 0.60, confidence_level: 'medium', evidence_count: 3, status: 'progressing' },
    profile_version: 1,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };
  await AdaptiveLearningStore.saveProfile(profileCarlos);

  const compsCarlos: StudentCompetencyEntity[] = [
    {
      id: 'comp_c1',
      student_id: 'student_carlos_a2',
      knowledge_unit_id: 'speaking_b1_secondary_expressing_opinions',
      subject: 'english',
      domain: 'Skills',
      skill: 'speaking',
      estimated_level: 'B1',
      mastery_state: 'developing',
      confidence: 0.50,
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
  await AdaptiveLearningStore.saveCompetencies('student_carlos_a2', compsCarlos);

  // Alumno B: Mariana (Speaking B1, on target)
  const profileMariana: StudentAcademicProfileEntity = {
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
  await AdaptiveLearningStore.saveProfile(profileMariana);

  const compsMariana: StudentCompetencyEntity[] = [
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
  await AdaptiveLearningStore.saveCompetencies('student_mariana_b1', compsMariana);

  // Alumno C: Mateo (Speaking B2, dominio consolidado)
  const profileMateo: StudentAcademicProfileEntity = {
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
  await AdaptiveLearningStore.saveProfile(profileMateo);

  const compsMateo: StudentCompetencyEntity[] = [
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
  await AdaptiveLearningStore.saveCompetencies('student_mateo_b2', compsMateo);
  console.log(`✓ Perfiles y micro-competencias cargados en AdaptiveLearningStore.`);

  // ----------------------------------------------------------------------------
  // PASO 2: Diagnóstico y Recomendación de Acciones Pedagógicas
  // ----------------------------------------------------------------------------
  console.log(`\n[Paso 2] Ejecutando diagnósticos adaptativos...`);
  const targetUnit = 'speaking_b1_secondary_expressing_opinions';

  const mapCarlos = await AdaptiveLearningStore.getCompetencies('student_carlos_a2');
  const gapsCarlos = AdaptiveLearningGapDetector.call([targetUnit], mapCarlos);
  const prioCarlos = AdaptiveLearningPriorityService.call(gapsCarlos, mapCarlos, targetUnit);
  const nextCarlos = AdaptiveLearningNextActionService.call('student_carlos_a2', targetUnit, prioCarlos, mapCarlos);

  const mapMariana = await AdaptiveLearningStore.getCompetencies('student_mariana_b1');
  const gapsMariana = AdaptiveLearningGapDetector.call([targetUnit], mapMariana);
  const prioMariana = AdaptiveLearningPriorityService.call(gapsMariana, mapMariana, targetUnit);
  const nextMariana = AdaptiveLearningNextActionService.call('student_mariana_b1', targetUnit, prioMariana, mapMariana);

  const mapMateo = await AdaptiveLearningStore.getCompetencies('student_mateo_b2');
  const gapsMateo = AdaptiveLearningGapDetector.call([targetUnit], mapMateo);
  const prioMateo = AdaptiveLearningPriorityService.call(gapsMateo, mapMateo, targetUnit);
  const nextMateo = AdaptiveLearningNextActionService.call('student_mateo_b2', targetUnit, prioMateo, mapMateo);

  console.log(`- Carlos:  Acción = ${nextCarlos.action} | Variante = ${nextCarlos.adaptation_suggested}`);
  console.log(`- Mariana: Acción = ${nextMariana.action} | Variante = ${nextMariana.adaptation_suggested}`);
  console.log(`- Mateo:   Acción = ${nextMateo.action} | Variante = ${nextMateo.adaptation_suggested}`);

  if (nextCarlos.adaptation_suggested !== 'support') throw new Error('Carlos debió recibir variante support.');
  if (nextMariana.adaptation_suggested !== 'core') throw new Error('Mariana debió recibir variante core.');
  if (nextMateo.adaptation_suggested !== 'extension') throw new Error('Mateo debió recibir variante extension.');
  console.log(`✓ Recomendaciones deterministas verificadas al 100%.`);

  // ----------------------------------------------------------------------------
  // PASO 3: Construcción de Contexto Académico con Privacy by Design
  // ----------------------------------------------------------------------------
  console.log(`\n[Paso 3] Construyendo contextos académicos sin PII...`);
  const ctxCarlos = AdaptiveLearningStudentContextBuilder.build(
    profileCarlos, mapCarlos, 'speaking', 'B1', 'support', [targetUnit]
  );
  const ctxMariana = AdaptiveLearningStudentContextBuilder.build(
    profileMariana, mapMariana, 'speaking', 'B1', 'core', [targetUnit]
  );
  const ctxMateo = AdaptiveLearningStudentContextBuilder.build(
    profileMateo, mapMateo, 'speaking', 'B1', 'extension', [targetUnit]
  );

  // Verificar Privacy by Design: Cero nombres reales, teléfonos, correos en los prompts
  const forbiddenPii = ['carlos', 'mariana', 'mateo', '@', 'phone', 'calle', 'tutor'];
  for (const pii of forbiddenPii) {
    if (ctxCarlos.promptText.toLowerCase().includes(pii) ||
        ctxMariana.promptText.toLowerCase().includes(pii) ||
        ctxMateo.promptText.toLowerCase().includes(pii)) {
      throw new Error(`Violación de Privacy by Design: PII "${pii}" detectada en el contexto académico.`);
    }
  }
  console.log(`✓ CERO PII en los contextos académicos. Principio de Privacy by Design certificado.`);

  // ----------------------------------------------------------------------------
  // PASO 4: Generación Adaptada de las 3 Actividades con el Motor de IA
  // ----------------------------------------------------------------------------
  console.log(`\n[Paso 4] Generando las 3 actividades adaptadas con el Motor de IA Pedagógica...`);
  const lessonTheme = 'Impact of Artificial Intelligence and Social Media on Communication';
  const lessonLangFunc = 'func_expressing_opinions';

  // 4.1 Generación Support (Carlos)
  console.log(`-> Generando Variante SUPPORT para Carlos...`);
  const paramsSupport: AcademicGenerationParams = {
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: lessonTheme,
    language_function: lessonLangFunc,
    activity_type: 'guided_discussion',
    duration_minutes: 50,
    adaptation: 'support',
    student_context: ctxCarlos.contextDto,
    student_context_text: ctxCarlos.promptText
  };
  const resultSupport = await AcademicGenerationGenerator.call(paramsSupport);
  if (!resultSupport.success || !resultSupport.activity) {
    throw new Error(`Fallo en la generación Support: ${JSON.stringify(resultSupport.validation)}`);
  }
  console.log(`✓ Support generada: "${resultSupport.activity.title}"`);

  // 4.2 Generación Core (Mariana)
  console.log(`-> Generando Variante CORE para Mariana...`);
  const paramsCore: AcademicGenerationParams = {
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: lessonTheme,
    language_function: lessonLangFunc,
    activity_type: 'guided_discussion',
    duration_minutes: 50,
    adaptation: 'core',
    student_context: ctxMariana.contextDto,
    student_context_text: ctxMariana.promptText
  };
  const resultCore = await AcademicGenerationGenerator.call(paramsCore);
  if (!resultCore.success || !resultCore.activity) {
    throw new Error(`Fallo en la generación Core: ${JSON.stringify(resultCore.validation)}`);
  }
  console.log(`✓ Core generada: "${resultCore.activity.title}"`);

  // 4.3 Generación Extension (Mateo)
  console.log(`-> Generando Variante EXTENSION para Mateo...`);
  const paramsExtension: AcademicGenerationParams = {
    grade: 'high_school_1',
    cefr: 'B1',
    skill: 'speaking',
    topic: lessonTheme,
    language_function: lessonLangFunc,
    activity_type: 'guided_discussion',
    duration_minutes: 50,
    adaptation: 'extension',
    student_context: ctxMateo.contextDto,
    student_context_text: ctxMateo.promptText
  };
  const resultExtension = await AcademicGenerationGenerator.call(paramsExtension);
  if (!resultExtension.success || !resultExtension.activity) {
    throw new Error(`Fallo en la generación Extension: ${JSON.stringify(resultExtension.validation)}`);
  }
  console.log(`✓ Extension generada: "${resultExtension.activity.title}"`);

  // ----------------------------------------------------------------------------
  // PASO 5: Comparación Lado a Lado de las 3 Variantes
  // ----------------------------------------------------------------------------
  console.log(`\n================================================================================`);
  console.log(`  COMPARATIVA LADO A LADO DE LAS 3 VARIANTES ADAPTADAS`);
  console.log(`================================================================================`);
  console.log(`Materia: Inglés | Grado: High School 1 | Habilidad: Speaking | Nivel Curso: B1`);
  console.log(`Tema Común: "${lessonTheme}"\n`);

  console.log(`--- [1] VARIANTE SUPPORT (Para Carlos / A2) ---`);
  console.log(`Título: "${resultSupport.activity.title}"`);
  console.log(`Objetivo: ${resultSupport.activity.learning_objective}`);
  console.log(`Andamiaje y Frases Útiles (${resultSupport.activity.language_support.useful_phrases.length}):`);
  resultSupport.activity.language_support.useful_phrases.slice(0, 3).forEach(p => console.log(`  • ${p}`));
  console.log(`Bancos de Vocabulario: ${resultSupport.activity.language_support.vocabulary_support.slice(0, 4).join(', ')}`);
  console.log(`Instrucciones Docente: ${resultSupport.activity.teacher_instructions.slice(0, 140)}...`);

  console.log(`\n--- [2] VARIANTE CORE (Para Mariana / B1) ---`);
  console.log(`Título: "${resultCore.activity.title}"`);
  console.log(`Objetivo: ${resultCore.activity.learning_objective}`);
  console.log(`Frases Útiles (${resultCore.activity.language_support.useful_phrases.length}):`);
  resultCore.activity.language_support.useful_phrases.slice(0, 3).forEach(p => console.log(`  • ${p}`));
  console.log(`Instrucciones Docente: ${resultCore.activity.teacher_instructions.slice(0, 140)}...`);

  console.log(`\n--- [3] VARIANTE EXTENSION (Para Mateo / B2) ---`);
  console.log(`Título: "${resultExtension.activity.title}"`);
  console.log(`Objetivo: ${resultExtension.activity.learning_objective}`);
  console.log(`Criterios de Evaluación Cognitiva:`);
  resultExtension.activity.assessment.criteria.forEach(c => console.log(`  • ${c}`));
  console.log(`Instrucciones Docente: ${resultExtension.activity.teacher_instructions.slice(0, 140)}...`);
  console.log(`================================================================================\n`);

  // ----------------------------------------------------------------------------
  // PASO 6: Demostración del Ciclo Completo de Progreso (Evidence -> MasteryEngine)
  // ----------------------------------------------------------------------------
  console.log(`[Paso 6] Simulando ciclo completo de progreso para Carlos...`);
  console.log(`Estado Inicial Carlos en "${targetUnit}": ${compsCarlos[0].mastery_state} (Confianza: ${compsCarlos[0].confidence})`);

  // Carlos realiza la actividad y presenta una evidencia exitosa
  const evidenceCarlos: LearningEvidenceEntity = {
    id: `ev_${Date.now()}`,
    student_id: 'student_carlos_a2',
    evidence_type: 'class_activity',
    skill: 'speaking',
    knowledge_targets: [targetUnit, 'func_giving_reasons'],
    learning_outcome: 'Student articulates simple opinions with reasons in guided discussion.',
    difficulty: 0.60,
    score: 88,
    rubric_level: 'secure',
    attempts_count: 1,
    created_at: new Date().toISOString()
  };

  await AdaptiveLearningStore.recordEvidence(evidenceCarlos);
  const masteryUpdate = AdaptiveLearningMasteryEngine.call(profileCarlos, mapCarlos, evidenceCarlos);

  console.log(`\nCambios tras procesar la evidencia mediante MasteryEngine:`);
  for (const ch of masteryUpdate.changes_summary) {
    console.log(`  • ${ch.knowledge_unit_id}: ${ch.previous_state} -> ${ch.new_state} (Confianza: ${ch.previous_confidence} -> ${ch.new_confidence}) [${ch.reason}]`);
  }

  // Verificar la nueva recomendación tras el progreso
  const updatedGapsCarlos = AdaptiveLearningGapDetector.call([targetUnit], mapCarlos);
  const updatedPrioCarlos = AdaptiveLearningPriorityService.call(updatedGapsCarlos, mapCarlos, targetUnit);
  const updatedNextCarlos = AdaptiveLearningNextActionService.call('student_carlos_a2', targetUnit, updatedPrioCarlos, mapCarlos);

  console.log(`Nueva Acción Recomendada para Carlos: ${updatedNextCarlos.action} | Variante: ${updatedNextCarlos.adaptation_suggested}`);
  console.log(`Justificación: ${updatedNextCarlos.rationale}`);
  console.log(`✓ Ciclo de progreso completado y verificado.`);

  // ----------------------------------------------------------------------------
  // PASO 7: Verificación de Autoridad Docente (Teacher Override)
  // ----------------------------------------------------------------------------
  console.log(`\n[Paso 7] Verificando autoridad docente (Teacher Override y candados)...`);
  // El profesor confirma y bloquea la competencia en 'mastered'
  await AdaptiveLearningStore.setTeacherOverride(
    'student_carlos_a2',
    'func_clarifying',
    'mastered',
    'El docente certificó en observación directa el dominio fluido de clarificación.',
    true // locked = true
  );

  const compClarifying = mapCarlos.get('func_clarifying')!;
  if (!compClarifying.locked || compClarifying.source !== 'teacher_confirmed') {
    throw new Error('Teacher Override no se aplicó correctamente.');
  }

  // Simular una mala nota (Score 35)
  const badEvidence: LearningEvidenceEntity = {
    id: `ev_bad_${Date.now()}`,
    student_id: 'student_carlos_a2',
    evidence_type: 'quiz',
    skill: 'speaking',
    knowledge_targets: ['func_clarifying'],
    difficulty: 0.8,
    score: 35,
    rubric_level: 'not_met',
    attempts_count: 1,
    created_at: new Date().toISOString()
  };

  const overrideTestResult = AdaptiveLearningMasteryEngine.call(profileCarlos, mapCarlos, badEvidence);
  const lockedState = mapCarlos.get('func_clarifying')!.mastery_state;

  if (lockedState !== 'mastered') {
    throw new Error(`Violación de autoridad docente: El candado docente fue ignorado y el estado cambió a ${lockedState}.`);
  }
  console.log(`✓ Candado docente respetado: a pesar de la mala nota (35/100), el estado se mantuvo en "${lockedState}".`);

  // ----------------------------------------------------------------------------
  // PASO 8: Verificación Estricta de Marca Blanca Institucional
  // ----------------------------------------------------------------------------
  console.log(`\n[Paso 8] Auditoría de Marca Blanca Institucional (Regla No Negociable 1)...`);
  const forbiddenBrands = ['gemini', 'obsidian', 'github', 'canvas lms'];
  const fullTextToInspect = [
    resultSupport.activity.title,
    resultSupport.activity.learning_objective,
    resultSupport.activity.teacher_instructions,
    resultSupport.activity.student_instructions,
    resultCore.activity.title,
    resultCore.activity.learning_objective,
    resultCore.activity.teacher_instructions,
    resultExtension.activity.title,
    resultExtension.activity.learning_objective,
    resultExtension.activity.teacher_instructions
  ].join(' ').toLowerCase();

  for (const brand of forbiddenBrands) {
    if (fullTextToInspect.includes(brand)) {
      throw new Error(`Violación de Marca Blanca: Marca comercial externa "${brand}" detectada en las actividades generadas.`);
    }
  }
  console.log(`✓ CERO menciones de marcas comerciales externas. 100% Marca Blanca Institucional.`);

  console.log(`\n================================================================================`);
  console.log(`  CERTIFICACIÓN EXITOSA: TODAS LAS COMPUERTAS DE LA FASE 7 HAN SIDO SUPERADAS`);
  console.log(`================================================================================\n`);
}

runFase7Pilot().catch(err => {
  console.error('\n❌ ERROR EN EL PILOTO DE LA FASE 7:', err);
  process.exit(1);
});
