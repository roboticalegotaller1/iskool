// ============================================================================
// MOTOR COGNITIVO BLOOM-BKT & MATRIZ EN ESPIRAL DE 40 SEMANAS (NANO BANANA 2.1)
// Arquitectura Quirúrgica Unificada: Taxonomía de Bloom Revisada (LOTS -> HOTS),
// Bayesian Knowledge Tracing (BKT 36 Micro-Habilidades), Formantes Sagitales DSP,
// Writing Engine Socrático (0% Ghostwriting) y Simulador Oficial SEP / CENNI (1-20).
// ============================================================================

import { CurricularWeek } from './curriculumTypes';
import { english40WeeksCurriculum } from './english40WeeksCurriculum';
import { french40WeeksCurriculum } from './french40WeeksCurriculum';
import {
  IDENTIFIABLE_LANGUAGE_SKILLS,
  INTERNATIONAL_BENCHMARK_AUDITS,
  CONTINUOUS_METHODOLOGY_STAGES,
  CONTINUOUS_40_WEEK_BLUEPRINT,
} from './internationalMethodologyFramework';

export type CognitiveTier = 'LOTS' | 'HOTS';

export interface BloomTaxonomyLevelSpec {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  id: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  tier: CognitiveTier;
  nameEs: string;
  nameEn: string;
  nameFr: string;
  xpMultiplier: number;
  baseXpReward: number;
  mapped5EStageCodes: string[];
  mapped5EDescriptionEs: string;
  cognitiveMechanismEs: string;
  actionVerbs: {
    en: string[];
    fr: string[];
  };
  studentQuestGoal: {
    en: string;
    fr: string;
  };
  socraticTriggerQuestion: {
    en: string;
    fr: string;
  };
  badgeColorHex: string;
  lightBgClass: string;
  borderClass: string;
  textClass: string;
  nanoBananaEmblemPath: string;
}

export interface SagittalVocalTractSpec {
  id: string;
  language: 'en' | 'fr';
  symbolIpa: string;
  titleEs: string;
  exemplarWords: string[];
  targetF1Hz: number;
  targetF2Hz: number;
  targetF3Hz: number;
  jawOpenPct: number;        // 0 - 100
  lipRoundingPct: number;    // 0 - 100
  tongueHeightPct: number;   // 0 - 100
  tongueFrontnessPct: number;// 0 - 100
  velumNasalOpen: boolean;
  anatomicalInstructionEs: string;
  l1SpanishInterferenceTrapEs: string;
  bloomLevelTarget: number;
}

export interface BktParameters {
  pInit: number;    // P(L0): Probabilidad inicial de dominio
  pTransit: number; // P(T): Probabilidad de transición por práctica exitosa
  pSlip: number;    // P(S): Probabilidad de desliz teniendo dominio
  pGuess: number;   // P(G): Probabilidad de acierto fortuito
}

export interface StudentBktProfile {
  id: string;
  name: string;
  enrollmentCode: string;
  cohortGroup: string;
  streakDays: number;
  xpTotal: number;
  socraticCoins: number;
  currentWeek: number;
  bloomUnlockedLevel: 1 | 2 | 3 | 4 | 5 | 6;
  macroMastery: Record<'FON' | 'CO' | 'PO' | 'CE' | 'PE' | 'MED', number>; // 0.0 to 1.0
  dspAccuracyAvg: number;
  sttPercentage: number;
  recentL1InterferenceAlert: {
    en: string;
    fr: string;
  };
  recommendedRemediationId: string;
}

export interface SocraticHintCoinSpec {
  coinNumber: 1 | 2 | 3;
  titleEs: string;
  bloomFocus: string;
  hintQuestion: {
    en: string;
    fr: string;
  };
  structuralScaffold: {
    en: string;
    fr: string;
  };
}

export interface L1InterferencePattern {
  id: string;
  language: 'en' | 'fr';
  patternRegex: RegExp;
  calqueDetected: string;
  categoryEs: string;
  socraticPromptEs: string;
  suggestedTargetReformulation: string;
}

export interface OfficialWritingRubricCriterion {
  id: string;
  nameEs: string;
  nameTarget: string;
  maxScore: number; // 5 for Cambridge (total 20), 6.25 for DELF (total 25)
  descriptorEs: string;
}

export interface ArchitecturePhase12Node {
  phaseNumber: number;
  code: string;
  titleEs: string;
  tagEs: string;
  metricBadge: {
    en: string;
    fr: string;
  };
  descriptionEs: string;
  bloomIntegrationEs: string;
  targetScreenId: 'p1_hub' | 'p2_matrix' | 'p3_dsp' | 'p4_avatar' | 'p5_writing' | 'p6_bkt' | 'p7_audit';
}

// ============================================================================
// 1. LOS 6 NIVELES DE LA TAXONOMÍA DE BLOOM REVISADA (ANDERSON & KRATHWOHL)
// ============================================================================
export const BLOOM_REVISED_TAXONOMY_LEVELS: BloomTaxonomyLevelSpec[] = [
  {
    level: 1,
    id: 'remember',
    tier: 'LOTS',
    nameEs: '1. Recordar',
    nameEn: '1. Remember',
    nameFr: '1. Mémoriser',
    xpMultiplier: 1.0,
    baseXpReward: 50,
    mapped5EStageCodes: ['ETAPA 1'],
    mapped5EDescriptionEs: 'Etapa 1 (Despertar Fonético DSP · 8 min / 15%)',
    cognitiveMechanismEs: 'Reconocimiento auditivo-espectral de fonemas meta, pares mínimos y activación de neuronas espejo articulatorias.',
    actionVerbs: {
      en: ['identify', 'repeat', 'recognize', 'match', 'articulate', 'recall'],
      fr: ['identifier', 'répéter', 'reconnaître', 'associer', 'articuler', 'nommer'],
    },
    studentQuestGoal: {
      en: 'Calibrate your vocal tract formants (F1/F2/F3) and recognize key minimal pairs.',
      fr: 'Calibrez vos formants vocaux (F1/F2/F3) et identifiez les paires minimales clés.',
    },
    socraticTriggerQuestion: {
      en: 'Where does the tip of your tongue touch when producing this target phoneme?',
      fr: 'Où se place le dos de votre langue et quelle est la rondeur de vos lèvres pour ce son ?',
    },
    badgeColorHex: '#475569',
    lightBgClass: 'bg-slate-50',
    borderClass: 'border-slate-300',
    textClass: 'text-slate-800',
    nanoBananaEmblemPath: '/images/languages/nanobanana-gamified/nb_dsp_acoustic_shield.webp',
  },
  {
    level: 2,
    id: 'understand',
    tier: 'LOTS',
    nameEs: '2. Comprender',
    nameEn: '2. Understand',
    nameFr: '2. Comprendre',
    xpMultiplier: 1.2,
    baseXpReward: 60,
    mapped5EStageCodes: ['ETAPA 1', 'ETAPA 2'],
    mapped5EDescriptionEs: 'Etapa 1–2 (Decodificación Auditiva & Inmersión Directa)',
    cognitiveMechanismEs: 'Inferencia semántica directa en el idioma meta sin traducción pasiva al español (Método Directo).',
    actionVerbs: {
      en: ['paraphrase', 'classify', 'infer', 'summarize', 'contextualize', 'interpret'],
      fr: ['paraphraser', 'classer', 'inférer', 'résumer', 'contextualiser', 'interpréter'],
    },
    studentQuestGoal: {
      en: 'Infer the pragmatic meaning of the historical mentor in 1st person without translating.',
      fr: 'Inférez l\'intention pragmatique du mentor historique à la 1re personne sans traduire.',
    },
    socraticTriggerQuestion: {
      en: 'How would you rephrase the mentor’s core idea using your own words in English?',
      fr: 'Comment reformuleriez-vous l’idée centrale du mentor avec vos propres mots en français ?',
    },
    badgeColorHex: '#0284C7',
    lightBgClass: 'bg-sky-50',
    borderClass: 'border-sky-300',
    textClass: 'text-sky-900',
    nanoBananaEmblemPath: '/images/languages/nanobanana-gamified/nb_bloom_crown_mastery.webp',
  },
  {
    level: 3,
    id: 'apply',
    tier: 'LOTS',
    nameEs: '3. Aplicar',
    nameEn: '3. Apply',
    nameFr: '3. Appliquer',
    xpMultiplier: 1.5,
    baseXpReward: 75,
    mapped5EStageCodes: ['ETAPA 2', 'ETAPA 3'],
    mapped5EDescriptionEs: 'Etapa 2 & 3 (Inmersión 1ª Persona + Karaoke DSP >80% · 27 min / 50%)',
    cognitiveMechanismEs: 'Ejecución fonética neuromuscular sincronizada (>80% precisión) y producción oral funcional en situación real.',
    actionVerbs: {
      en: ['dramatize', 'pronounce', 'execute', 'converse', 'demonstrate', 'solve'],
      fr: ['dramatiser', 'prononcer', 'exécuter', 'converser', 'démontrer', 'résoudre'],
    },
    studentQuestGoal: {
      en: 'Achieve >80% acoustic precision in Neuromuscular Karaoke and respond aloud in 1st-person dialogue.',
      fr: 'Atteignez >80% de précision acoustique au Karaoké Neuromusculaire et répondez à voix haute.',
    },
    socraticTriggerQuestion: {
      en: 'How can you apply this grammatical pattern to solve today’s real-world scenario?',
      fr: 'Comment pouvez-vous appliquer cette structure pour accomplir la mission sociale du jour ?',
    },
    badgeColorHex: '#059669',
    lightBgClass: 'bg-emerald-50',
    borderClass: 'border-emerald-300',
    textClass: 'text-emerald-900',
    nanoBananaEmblemPath: '/images/languages/nanobanana-gamified/nb_dsp_acoustic_shield.webp',
  },
  {
    level: 4,
    id: 'analyze',
    tier: 'HOTS',
    nameEs: '4. Analizar',
    nameEn: '4. Analyze',
    nameFr: '4. Analyser',
    xpMultiplier: 2.0,
    baseXpReward: 100,
    mapped5EStageCodes: ['ETAPA 3', 'ETAPA 4'],
    mapped5EDescriptionEs: 'Etapa 3–4 (Contraste Acústico F1/F2/F3 & Inducción Morfosintáctica)',
    cognitiveMechanismEs: 'Deconstrucción inductiva de patrones morfosintácticos (CELTA/DELTA) y diagnóstico de interferencias L1→L2.',
    actionVerbs: {
      en: ['contrast', 'deconstruct', 'differentiate', 'examine', 'correlate', 'investigate'],
      fr: ['contraster', 'déconstruire', 'différencier', 'examiner', 'corréler', 'investiguer'],
    },
    studentQuestGoal: {
      en: 'Contrast native prosody and syntactic connectors against L1 Spanish calques.',
      fr: 'Contrastez la prosodie oxytone et les liaisons obligatoires face aux calques de l’espagnol.',
    },
    socraticTriggerQuestion: {
      en: 'Why does the speaker select this modal verb or tense instead of a literal L1 structure?',
      fr: 'Pourquoi l’auteur choisit-il ce connecteur logique ou ce mode verbal dans ce contexte ?',
    },
    badgeColorHex: '#4F46E5',
    lightBgClass: 'bg-indigo-50',
    borderClass: 'border-indigo-300',
    textClass: 'text-indigo-900',
    nanoBananaEmblemPath: '/images/languages/nanobanana-gamified/nb_bkt_hexagon_crystal.webp',
  },
  {
    level: 5,
    id: 'evaluate',
    tier: 'HOTS',
    nameEs: '5. Evaluar',
    nameEn: '5. Evaluate',
    nameFr: '5. Évaluer',
    xpMultiplier: 2.5,
    baseXpReward: 125,
    mapped5EStageCodes: ['ETAPA 4', 'ETAPA 5'],
    mapped5EDescriptionEs: 'Etapa 4 & 5 (Debate Histórico 1ª Persona & Auditoría Analítica · 20 min / 35%)',
    cognitiveMechanismEs: 'Juicio crítico argumentado ante próceres históricos en 1ª persona y autoevaluación con rúbrica oficial Cambridge/DELF.',
    actionVerbs: {
      en: ['argue', 'critique', 'defend', 'justify', 'assess', 'prioritize'],
      fr: ['argumenter', 'critiquer', 'défendre', 'justifier', 'évaluer', 'hiérarchiser'],
    },
    studentQuestGoal: {
      en: 'Defend a reasoned position in a live debate with Abraham Lincoln or Ada Lovelace.',
      fr: 'Défendez une thèse argumentée lors d’un débat avec Marie Curie ou Victor Hugo.',
    },
    socraticTriggerQuestion: {
      en: 'What historical or empirical evidence justifies your stance against the counterargument?',
      fr: 'Quel argument historique ou scientifique justifie votre prise de position face à l’objection ?',
    },
    badgeColorHex: '#7C3AED',
    lightBgClass: 'bg-violet-50',
    borderClass: 'border-violet-300',
    textClass: 'text-violet-900',
    nanoBananaEmblemPath: '/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp',
  },
  {
    level: 6,
    id: 'create',
    tier: 'HOTS',
    nameEs: '6. Crear',
    nameEn: '6. Create',
    nameFr: '6. Créer',
    xpMultiplier: 3.0,
    baseXpReward: 150,
    mapped5EStageCodes: ['ETAPA 4', 'ETAPA 5'],
    mapped5EDescriptionEs: 'Etapa 4–5 (Producción Escrita Socrática 0% IA & Mediación Original)',
    cognitiveMechanismEs: 'Síntesis original de ensayos, discursos y proyectos accionales con 0% generación automática y 100% autoría del alumno.',
    actionVerbs: {
      en: ['compose', 'hypothesize', 'design', 'formulate', 'synthesize', 'author'],
      fr: ['composer', 'formuler', 'concevoir', 'synthétiser', 'rédiger', 'créer'],
    },
    studentQuestGoal: {
      en: 'Compose an original essay or speech in the Autonomous Socratic Writing Engine (0% AI Ghostwriting).',
      fr: 'Rédigez un essai ou discours original dans le Writing Engine Socratique (0% IA Ghostwriting).',
    },
    socraticTriggerQuestion: {
      en: 'How can you synthesize both perspectives into an original proposal with C1/B2 cohesion?',
      fr: 'Comment synthétiser la thèse et l’antithèse en une proposition originale cohérente ?',
    },
    badgeColorHex: '#D97706',
    lightBgClass: 'bg-amber-50',
    borderClass: 'border-amber-300',
    textClass: 'text-amber-900',
    nanoBananaEmblemPath: '/images/languages/nanobanana-gamified/nb_socratic_gold_coin.webp',
  },
];

// ============================================================================
// 2. ESPECIFICACIONES ANATÓMICAS SAGITALES Y FORMANTES ACÚSTICOS (F1/F2/F3)
// ============================================================================
export const SAGITTAL_VOCAL_TRACT_TARGETS: SagittalVocalTractSpec[] = [
  // INGLÉS (ESL / EFL)
  {
    id: 'en_schwa',
    language: 'en',
    symbolIpa: '/ə/ (Schwa)',
    titleEs: 'Reducción Vocálica Central Átona (Schwa /ə/)',
    exemplarWords: ['teacher /ˈtiːtʃər/', 'about /əˈbaʊt/', 'support /səˈpɔːrt/', 'photograph /ˈfoʊtəɡræf/'],
    targetF1Hz: 500,
    targetF2Hz: 1500,
    targetF3Hz: 2500,
    jawOpenPct: 34,
    lipRoundingPct: 18,
    tongueHeightPct: 50,
    tongueFrontnessPct: 50,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'Relaja completamente la mandíbula (34%) y mantén el dorso de la lengua en posición neutra central durante las sílabas no acentuadas.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Pronunciar vocales tensas completas (/a/, /e/, /o/) en sílabas átonas, destruyendo el ritmo isócrono acentual del inglés.',
    bloomLevelTarget: 3,
  },
  {
    id: 'en_interdental_th',
    language: 'en',
    symbolIpa: '/θ/ vs /ð/',
    titleEs: 'Fricativas Interdentales Sorda (/θ/) y Sonora (/ð/)',
    exemplarWords: ['think /θɪŋk/', 'three /θriː/', 'this /ðɪs/', 'mother /ˈmʌðər/'],
    targetF1Hz: 320,
    targetF2Hz: 1680,
    targetF3Hz: 2720,
    jawOpenPct: 18,
    lipRoundingPct: 10,
    tongueHeightPct: 68,
    tongueFrontnessPct: 92,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'Asoma ligeramente el ápice de la lengua (2-3 mm) entre los incisivos superiores e inferiores y deja fluir una corriente continua de aire.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Ocluir el aire contra los dientes produciendo /t/ ("tink") o /d/ dura ("dis") en lugar de fricción continua.',
    bloomLevelTarget: 3,
  },
  {
    id: 'en_minimal_i',
    language: 'en',
    symbolIpa: '/ɪ/ vs /iː/',
    titleEs: 'Contraste de Par Mínimo: Vocal Corta Relajada /ɪ/ vs. Larga Tensa /iː/',
    exemplarWords: ['ship /ʃɪp/ vs sheep /ʃiːp/', 'sit /sɪt/ vs seat /siːt/', 'live /lɪv/ vs leave /liːv/'],
    targetF1Hz: 290,
    targetF2Hz: 2240,
    targetF3Hz: 2680,
    jawOpenPct: 22,
    lipRoundingPct: 5,
    tongueHeightPct: 86,
    tongueFrontnessPct: 88,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'En /iː/ eleva el predorso lingual hacia el paladar duro con comisuras extendidas; en /ɪ/ desciende 15% la lengua y relaja la tensión muscular.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Usar la única vocal /i/ media del español para ambos vocablos, generando ambigüedad semántica inmediata.',
    bloomLevelTarget: 4,
  },
  {
    id: 'en_allomorphs_ed',
    language: 'en',
    symbolIpa: '/t/ · /d/ · /ɪd/',
    titleEs: 'Alomorfos de Pasado Regular (-ed) y Connected Speech',
    exemplarWords: ['worked /wɜːkt/', 'played /pleɪd/', 'decided /dɪˈsaɪdɪd/', 'looked at /lʊkt_æt/'],
    targetF1Hz: 410,
    targetF2Hz: 1760,
    targetF3Hz: 2600,
    jawOpenPct: 24,
    lipRoundingPct: 15,
    tongueHeightPct: 74,
    tongueFrontnessPct: 80,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'Articula /t/ tras consonante sorda y /d/ tras sonora directamente en la cresta alveolar sin insertar vocal intermedia.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Pronunciar sistemáticamente la vocal escrita "e" (/ˈwɜːrkɛd/), añadiendo una sílaba inexistente.',
    bloomLevelTarget: 4,
  },

  // FRANCÉS (FLE — CECR / DELF-DALF)
  {
    id: 'fr_rounded_u_ou',
    language: 'fr',
    symbolIpa: '/y/ ("tu") vs /u/ ("tout")',
    titleEs: 'Vocal Anterior Cerrada Redondeada /y/ vs. Posterior /u/',
    exemplarWords: ['tu /ty/ vs tout /tu/', 'rue /ʁy/ vs roue /ʁu/', 'lu /ly/ vs loup /lu/'],
    targetF1Hz: 250,
    targetF2Hz: 2100,
    targetF3Hz: 2350,
    jawOpenPct: 16,
    lipRoundingPct: 92,
    tongueHeightPct: 88,
    tongueFrontnessPct: 90,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'Coloca la lengua exactamente en posición de /i/ anterior alta (F2 ~ 2100 Hz) y simultáneamente proyecta los labios en círculo firme como para silbar (92%).',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Retraer la lengua hacia el velo del paladar convirtiendo "tu" /ty/ en "tout" /tu/ (caída de F2 a 750 Hz).',
    bloomLevelTarget: 3,
  },
  {
    id: 'fr_nasal_vowels',
    language: 'fr',
    symbolIpa: '/ɑ̃/ · /ɛ̃/ · /ɔ̃/',
    titleEs: 'Resonancia Velo-Faríngea de Vocales Nasales sin Cierre Alveolar',
    exemplarWords: ['enfant /ɑ̃.fɑ̃/', 'matin /ma.tɛ̃/', 'bonsoir /bɔ̃.swaʁ/', 'important /ɛ̃.pɔʁ.tɑ̃/'],
    targetF1Hz: 520,
    targetF2Hz: 1150,
    targetF3Hz: 2450,
    jawOpenPct: 48,
    lipRoundingPct: 58,
    tongueHeightPct: 42,
    tongueFrontnessPct: 45,
    velumNasalOpen: true,
    anatomicalInstructionEs: 'Desciende el velo del paladar para bifurcar la columna de aire entre cavidad oral y nasal, manteniendo la punta de la lengua baja sin tocar los alvéolos.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Elevar el ápice lingual al final de la vocal para pronunciar una consonante /n/ o /m/ explícita.',
    bloomLevelTarget: 3,
  },
  {
    id: 'fr_uvular_r',
    language: 'fr',
    symbolIpa: '/ʁ/ (Uvulaire)',
    titleEs: 'Fricativa Uvular Sonora /ʁ/ y Anclaje Lingual Inferior',
    exemplarWords: ['Paris /pa.ʁi/', 'république /ʁe.py.blik/', 'travailler /tʁa.va.je/', 'histoire /is.twaʁ/'],
    targetF1Hz: 440,
    targetF2Hz: 1320,
    targetF3Hz: 2380,
    jawOpenPct: 32,
    lipRoundingPct: 26,
    tongueHeightPct: 72,
    tongueFrontnessPct: 22,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'Ancla la punta de la lengua detrás de los incisivos inferiores y eleva suavemente el postdorso lingual hacia la úvula.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Despegar el ápice lingual para producir la vibrante múltiple alveolar /r/ española.',
    bloomLevelTarget: 4,
  },
  {
    id: 'fr_liaisons_oxytone',
    language: 'fr',
    symbolIpa: 'Liaisons /z/ · /t/ · /n/',
    titleEs: 'Liaisons Obligatorias, Elisión Vocal y Acento Oxítono de Grupo Rítmico',
    exemplarWords: ['les_amis /le.za.mi/', 'un_enfant /œ̃.nɑ̃.fɑ̃/', 'c’est_important /sɛ.tɛ̃.pɔʁ.tɑ̃/'],
    targetF1Hz: 360,
    targetF2Hz: 1740,
    targetF3Hz: 2580,
    jawOpenPct: 28,
    lipRoundingPct: 32,
    tongueHeightPct: 65,
    tongueFrontnessPct: 70,
    velumNasalOpen: false,
    anatomicalInstructionEs: 'Enlaza la consonante latente final con la vocal inicial de la palabra siguiente formando una sola palabra fonética con acento en la última sílaba.',
    l1SpanishInterferenceTrapEs: 'Trampa L1 Español: Cortar palabra por palabra con oclusión glotal o acentuar sílabas graves al estilo hispano.',
    bloomLevelTarget: 4,
  },
];

// ============================================================================
// 3. MOTOR MATEMÁTICO BAYESIAN KNOWLEDGE TRACING (BKT) & PROYECCIÓN SEP / CENNI
// ============================================================================
export const DEFAULT_BKT_PARAMS: BktParameters = {
  pInit: 0.45,
  pTransit: 0.14,
  pSlip: 0.08,
  pGuess: 0.18,
};

/**
 * Calcula la probabilidad posterior de dominio BKT P(L_t | obs) tras una evidencia
 * observable (e.g. Karaoke >80%, turno oral en 1ª persona, ensayo socrático).
 */
export function updateBktMasteryProbability(
  priorMastery: number,
  isSuccess: boolean,
  bloomLevel: number = 3,
  params: BktParameters = DEFAULT_BKT_PARAMS
): number {
  const clampedPrior = Math.max(0.05, Math.min(0.99, priorMastery));
  const { pTransit, pSlip, pGuess } = params;

  let posteriorGivenObs: number;
  if (isSuccess) {
    const num = clampedPrior * (1 - pSlip);
    const den = num + (1 - clampedPrior) * pGuess;
    posteriorGivenObs = den > 0 ? num / den : clampedPrior;
  } else {
    const num = clampedPrior * pSlip;
    const den = num + (1 - clampedPrior) * (1 - pGuess);
    posteriorGivenObs = den > 0 ? num / den : clampedPrior;
  }

  // Escalar ligeramente la tasa de aprendizaje según la profundidad cognitiva Bloom (LOTS -> HOTS)
  const bloomBoost = 1 + (Math.max(1, Math.min(6, bloomLevel)) - 1) * 0.12;
  const effectiveTransit = Math.min(0.32, pTransit * bloomBoost);

  const nextMastery = posteriorGivenObs + (1 - posteriorGivenObs) * effectiveTransit;
  return Number(Math.max(0.08, Math.min(0.99, nextMastery)).toFixed(4));
}

export interface OfficialSepCenniProjection {
  averageBktPct: number;
  sepGrade10: number;          // Escala oficial SEP 5.0 a 10.0
  cenniBandNumeric: number;    // Nivel CENNI 1 a 20
  cenniBandLabel: string;
  cefrBand: 'Pre-A1' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
  internationalCertTarget: {
    en: string;
    fr: string;
  };
  unlockedMicroBadgesCount: number; // de 36
}

/**
 * Convierte el vector hexagonal de 6 Macro-Competencias BKT en calificación
 * oficial de Boleta SEP (5.0 - 10.0), Banda CENNI (1 - 20) y equivalencia Cambridge / DELF.
 */
export function computeSepCenniProjection(
  macroMastery: Record<'FON' | 'CO' | 'PO' | 'CE' | 'PE' | 'MED', number>
): OfficialSepCenniProjection {
  const values = Object.values(macroMastery);
  const meanRatio = values.reduce((acc, v) => acc + v, 0) / Math.max(1, values.length);
  const averageBktPct = Math.round(meanRatio * 100);

  // Calificación oficial SEP (5.0 a 10.0 con un decimal)
  const rawSep = 5.0 + meanRatio * 5.0;
  const sepGrade10 = Number(Math.min(10.0, Math.max(5.0, rawSep)).toFixed(1));

  // Mapeo a banda CENNI (1 a 20) y CEFR
  let cenniBandNumeric = 3;
  let cenniBandLabel = 'CENNI 3–5 (Básico Inicial)';
  let cefrBand: OfficialSepCenniProjection['cefrBand'] = 'A1';
  let internationalCertTarget = {
    en: 'Cambridge Pre-A1 Starters / A1 Movers',
    fr: 'FEI DELF Prim A1.1 / DELF A1',
  };

  if (averageBktPct >= 92) {
    cenniBandNumeric = 15;
    cenniBandLabel = 'CENNI 14–16 (Avanzado Autónomo)';
    cefrBand = 'C1';
    internationalCertTarget = {
      en: 'Cambridge C1 Advanced (CAE)',
      fr: 'FEI DALF C1 Autonome',
    };
  } else if (averageBktPct >= 84) {
    cenniBandNumeric = 12;
    cenniBandLabel = 'CENNI 12–13 (Independiente Avanzado)';
    cefrBand = 'B2';
    internationalCertTarget = {
      en: 'Cambridge B2 First for Schools (FCE)',
      fr: 'FEI DELF Junior / Scolaire B2',
    };
  } else if (averageBktPct >= 74) {
    cenniBandNumeric = 10;
    cenniBandLabel = 'CENNI 9–11 (Independiente Umbral)';
    cefrBand = 'B1';
    internationalCertTarget = {
      en: 'Cambridge B1 Preliminary for Schools (PET)',
      fr: 'FEI DELF Junior / Scolaire B1',
    };
  } else if (averageBktPct >= 62) {
    cenniBandNumeric = 7;
    cenniBandLabel = 'CENNI 6–8 (Básico Plataforma)';
    cefrBand = 'A2';
    internationalCertTarget = {
      en: 'Cambridge A2 Key for Schools (KET)',
      fr: 'FEI DELF Junior / Scolaire A2',
    };
  }

  const unlockedMicroBadgesCount = Math.min(
    36,
    Math.max(6, Math.round((averageBktPct / 100) * 36))
  );

  return {
    averageBktPct,
    sepGrade10,
    cenniBandNumeric,
    cenniBandLabel,
    cefrBand,
    internationalCertTarget,
    unlockedMicroBadgesCount,
  };
}

// ============================================================================
// 4. COHORTE DE ALUMNOS EN TIEMPO REAL PARA EL TABLERO FORENSE DOCENTE Y PODIO
// ============================================================================
export const CLASSROOM_COHORT_STUDENTS: StudentBktProfile[] = [
  {
    id: 'stu-sofia-01',
    name: 'Sofía Valentina Mendoza',
    enrollmentCode: 'ISK-2026-014',
    cohortGroup: 'Grupo B1 · Secundaria / CCH',
    streakDays: 14,
    xpTotal: 3480,
    socraticCoins: 9,
    currentWeek: 6,
    bloomUnlockedLevel: 6,
    macroMastery: {
      FON: 0.89,
      CO: 0.91,
      PO: 0.86,
      CE: 0.93,
      PE: 0.84,
      MED: 0.87,
    },
    dspAccuracyAvg: 91,
    sttPercentage: 94,
    recentL1InterferenceAlert: {
      en: 'Dominio sólido de /θ/ y /ð/; ocasional omisión de enlace consonántico en grupos -kt.',
      fr: 'Excelente redondeo en /y/; reforzar liaison obligatoria tras determinante plural.',
    },
    recommendedRemediationId: 'en_allomorphs_ed',
  },
  {
    id: 'stu-mateo-02',
    name: 'Mateo Alejandro Garza',
    enrollmentCode: 'ISK-2026-021',
    cohortGroup: 'Grupo B1 · Secundaria / CCH',
    streakDays: 9,
    xpTotal: 2790,
    socraticCoins: 6,
    currentWeek: 6,
    bloomUnlockedLevel: 5,
    macroMastery: {
      FON: 0.76,
      CO: 0.84,
      PO: 0.78,
      CE: 0.86,
      PE: 0.74,
      MED: 0.79,
    },
    dspAccuracyAvg: 82,
    sttPercentage: 88,
    recentL1InterferenceAlert: {
      en: 'Tendencia a pronunciar vocal llena en sílabas átonas (Schwa /ə/) y epéntesis en -ed.',
      fr: 'Sustitución ocasional de /y/ ("tu") por /u/ ("tout") por falta de avance lingual.',
    },
    recommendedRemediationId: 'en_schwa',
  },
  {
    id: 'stu-camila-03',
    name: 'Camila Regina Villaseñor',
    enrollmentCode: 'ISK-2026-008',
    cohortGroup: 'Grupo B1 · Secundaria / CCH',
    streakDays: 11,
    xpTotal: 3120,
    socraticCoins: 8,
    currentWeek: 6,
    bloomUnlockedLevel: 5,
    macroMastery: {
      FON: 0.84,
      CO: 0.88,
      PO: 0.83,
      CE: 0.90,
      PE: 0.81,
      MED: 0.85,
    },
    dspAccuracyAvg: 87,
    sttPercentage: 91,
    recentL1InterferenceAlert: {
      en: 'Excelente entonación ascendente; vigilar falso amigo "actually" en ensayos Nivel 5 Bloom.',
      fr: 'Buena resonancia nasal en /ɑ̃/; evitar articular /n/ alveolar al cierre de "matin" /ma.tɛ̃/.',
    },
    recommendedRemediationId: 'fr_nasal_vowels',
  },
  {
    id: 'stu-diego-04',
    name: 'Diego Emiliano Santillán',
    enrollmentCode: 'ISK-2026-033',
    cohortGroup: 'Grupo B1 · Secundaria / CCH',
    streakDays: 4,
    xpTotal: 1850,
    socraticCoins: 4,
    currentWeek: 5,
    bloomUnlockedLevel: 3,
    macroMastery: {
      FON: 0.66,
      CO: 0.74,
      PO: 0.68,
      CE: 0.77,
      PE: 0.64,
      MED: 0.69,
    },
    dspAccuracyAvg: 73,
    sttPercentage: 76,
    recentL1InterferenceAlert: {
      en: 'Oclusión dental /d/ en lugar de fricativa interdental /ð/ en "this / mother". Requiere Misión Relámpago DSP.',
      fr: 'Vibrante alveolar /r/ española en lugar de fricativa uvular /ʁ/ francesa.',
    },
    recommendedRemediationId: 'en_interdental_th',
  },
  {
    id: 'stu-valeria-05',
    name: 'Valeria Natalia Orozco',
    enrollmentCode: 'ISK-2026-019',
    cohortGroup: 'Grupo B1 · Secundaria / CCH',
    streakDays: 7,
    xpTotal: 2440,
    socraticCoins: 5,
    currentWeek: 6,
    bloomUnlockedLevel: 4,
    macroMastery: {
      FON: 0.79,
      CO: 0.82,
      PO: 0.77,
      CE: 0.85,
      PE: 0.76,
      MED: 0.80,
    },
    dspAccuracyAvg: 84,
    sttPercentage: 85,
    recentL1InterferenceAlert: {
      en: 'Contraste /ɪ/ vs /iː/ en progreso; fortalecer conectores de contraste en Bloom Nivel 4 (Analyze).',
      fr: 'Reforzar elisión y acento oxítono al final del grupo rítmico.',
    },
    recommendedRemediationId: 'en_minimal_i',
  },
];

// ============================================================================
// 5. WRITING ENGINE SOCRÁTICO (0% GHOSTWRITING, 3 MONEDAS, DETECTOR L1->L2)
// ============================================================================
export const SOCRATIC_HINT_COINS: SocraticHintCoinSpec[] = [
  {
    coinNumber: 1,
    titleEs: 'Moneda Dorada 1 · Pista de Arquitectura Morfosintáctica',
    bloomFocus: 'Bloom Nivel 3–4 (Aplicar & Analizar)',
    hintQuestion: {
      en: 'Before writing your next sentence, ask yourself: Is my subject explicitly stated before the conjugated verb, and am I using the exact tense required by the historical context?',
      fr: 'Avant de rédiger votre phrase, demandez-vous : Mon pronom sujet est-il explicite et ai-je choisi entre le passé composé (action achevée) et l’imparfait (cadre descriptif) ?',
    },
    structuralScaffold: {
      en: 'Structure Pattern: [Time/Context Adjunct] + [Explicit Subject] + [Modal / Auxiliary + Lexical Verb] + [Direct Evidence].',
      fr: 'Schéma syntaxique : [Complément circonstanciel] + [Sujet explicite] + [Auxiliaire + Participe passé accordé] + [Justification].',
    },
  },
  {
    coinNumber: 2,
    titleEs: 'Moneda Dorada 2 · Pista de Cohesión & Conectores Pragmáticos',
    bloomFocus: 'Bloom Nivel 4–5 (Analizar & Evaluar)',
    hintQuestion: {
      en: 'How can you link your thesis and counterargument without repeating "and" or "but"? Consider a high-register contrastive or causal discourse marker.',
      fr: 'Comment articuler votre thèse et votre antithèse sans répéter « mais » ou « et » ? Choisissez un connecteur logique de concession ou de cause.',
    },
    structuralScaffold: {
      en: 'Suggested Discourse Markers: Furthermore · Nevertheless · Consequently · On the one hand / On the other hand · Provided that.',
      fr: 'Connecteurs recommandés : En revanche · Néanmoins · Par conséquent · D’une part / D’autre part · Bien que (+ subjonctif).',
    },
  },
  {
    coinNumber: 3,
    titleEs: 'Moneda Dorada 3 · Pista de Síntesis & Verbo Cognitivo HOTS',
    bloomFocus: 'Bloom Nivel 5–6 (Evaluar & Crear · XP x3.0)',
    hintQuestion: {
      en: 'Does your conclusion synthesize the historical mentor’s 1st-person perspective into an original verifiable proposal of your own?',
      fr: 'Votre conclusion synthétise-t-elle le témoignage à la 1re personne du mentor historique en une proposition citoyenne ou scientifique originale ?',
    },
    structuralScaffold: {
      en: 'HOTS Synthesis Verbs: hypothesize · substantiate · reconcile · formulate · advocate · transcend.',
      fr: 'Verbes cognitifs HOTS : formuler · corroborer · concilier · préconiser · synthétiser · démontrer.',
    },
  },
];

export const L1_INTERFERENCE_DETECTORS: L1InterferencePattern[] = [
  {
    id: 'en_calque_have_years',
    language: 'en',
    patternRegex: /\bi\s+have\s+\d+\s+years\b/i,
    calqueDetected: 'I have [X] years (Calco literal de "Tengo X años")',
    categoryEs: 'Interferencia Morfosintáctica L1→L2',
    socraticPromptEs: 'Pregunta Socrática: En inglés, ¿la edad es una posesión que "tienes" (have) o un estado del ser (to be)? ¿Cómo reformularías el verbo principal?',
    suggestedTargetReformulation: 'Use the verb "to be": I am ... years old.',
  },
  {
    id: 'en_false_friend_actually',
    language: 'en',
    patternRegex: /\bactually\b/i,
    calqueDetected: '"actually" (Alerta de posible falso amigo por "actualmente")',
    categoryEs: 'Falso Amigo Léxico-Pragmático',
    socraticPromptEs: 'Pregunta Socrática: ¿Deseas expresar "en realidad / de hecho" (actually) o "en el momento presente / actualmente" (currently / nowadays)?',
    suggestedTargetReformulation: 'Verify intent: "currently / nowadays" (present time) vs. "actually / in fact" (contrast).',
  },
  {
    id: 'en_calque_depend_of',
    language: 'en',
    patternRegex: /\bdepend(?:s|ed|ing)?\s+of\b/i,
    calqueDetected: 'depend of (Calco preposicional de "depender de")',
    categoryEs: 'Régimen Preposicional L1→L2',
    socraticPromptEs: 'Pregunta Socrática: En inglés, cuando una consecuencia se apoya sobre una condición, ¿qué preposición de contacto sobre superficie acompaña al verbo "depend"?',
    suggestedTargetReformulation: 'Collocation: depend ON (+ noun / gerund).',
  },
  {
    id: 'en_calque_people_is',
    language: 'en',
    patternRegex: /\bpeople\s+is\b/i,
    calqueDetected: 'people is (Concordancia singular por calco de "la gente es")',
    categoryEs: 'Concordancia Sujeto Plural Colectivo',
    socraticPromptEs: 'Pregunta Socrática: Aunque "la gente" es singular en español, ¿el sustantivo plural irregular "people" en inglés exige verbo singular o plural?',
    suggestedTargetReformulation: 'Plural agreement: people ARE / people HAVE.',
  },
  {
    id: 'fr_false_friend_actuellement',
    language: 'fr',
    patternRegex: /\ben\s+réalité\s+actuellement\b|\bactuellement\b/i,
    calqueDetected: '"actuellement" (Verificación de registro temporal: "en ce moment")',
    categoryEs: 'Precisión Léxica FLE',
    socraticPromptEs: 'Pregunta Socrática: Confirma que empleas « actuellement » con el sentido temporal de « en ce moment » y añade un conector argumentativo de nivel B1/B2.',
    suggestedTargetReformulation: 'Enrichissement B2 : « À l’heure actuelle / De nos jours, il convient de souligner que... »',
  },
  {
    id: 'fr_calque_visiter_personne',
    language: 'fr',
    patternRegex: /\bvisiter\s+(?:mon|ma|mes|un|une|le|la)\s+(?:ami|amie|grand-père|grand-mère|professeur|famille)\b/i,
    calqueDetected: 'visiter + persona (Calco de "visitar a alguien")',
    categoryEs: 'Colocación Verbal FLE (Visiter un lieu vs. Rendre visite à une personne)',
    socraticPromptEs: 'Pregunta Socrática: En francés se « visite » un museo o una ciudad, pero cuando vas a ver a una persona, ¿qué locución verbal con « visite » se utiliza?',
    suggestedTargetReformulation: 'Locution exacte : « rendre visite à [une personne] ».',
  },
];

export const OFFICIAL_WRITING_RUBRICS: Record<'en' | 'fr', OfficialWritingRubricCriterion[]> = {
  en: [
    {
      id: 'cam_content',
      nameEs: '1. Cumplimiento de Contenido & Relevancia',
      nameTarget: 'Content & Task Achievement (Cambridge Scale)',
      maxScore: 5,
      descriptorEs: 'Responde íntegramente al reto cognitivo de Bloom con argumentos históricos o empíricos verificables.',
    },
    {
      id: 'cam_communicative',
      nameEs: '2. Logro Comunicativo & Registro Pragmático',
      nameTarget: 'Communicative Achievement & Register',
      maxScore: 5,
      descriptorEs: 'Mantiene el registro académico/cívico apropiado manteniendo la atención del lector con convenciones del género.',
    },
    {
      id: 'cam_organisation',
      nameEs: '3. Organización & Cohesión Discursiva',
      nameTarget: 'Organisation & Cohesive Devices',
      maxScore: 5,
      descriptorEs: 'Articula párrafos lógicos mediante conectores de alto nivel (Furthermore, Nevertheless, Consequently).',
    },
    {
      id: 'cam_language',
      nameEs: '4. Rango Léxico-Gramatical & Precisión',
      nameTarget: 'Language Range & Morphosyntactic Accuracy',
      maxScore: 5,
      descriptorEs: 'Emplea vocabulario preciso, verbos cognitivos de Bloom y estructuras complejas libres de calcos L1.',
    },
  ],
  fr: [
    {
      id: 'delf_consigne',
      nameEs: '1. Respeto de la Consigna & Adecuación Accional',
      nameTarget: 'Respect de la consigne & Adéquation sociolinguistique (FEI DELF)',
      maxScore: 6.25,
      descriptorEs: 'Cumple la misión de Actor Social con el registro de lengua, extensión y formato exigidos por France Éducation International.',
    },
    {
      id: 'delf_argumentation',
      nameEs: '2. Capacidad de Argumentar & Presentar Hechos',
      nameTarget: 'Capacité à présenter des faits et à exprimer sa pensée',
      maxScore: 6.25,
      descriptorEs: 'Desarrolla tesis, ejemplos históricos verificables y matices de causa, consecuencia y concesión.',
    },
    {
      id: 'delf_coherence',
      nameEs: '3. Coherencia & Cohesión (Conectores Lógicos)',
      nameTarget: 'Cohérence et cohésion (articulateurs logiques)',
      maxScore: 6.25,
      descriptorEs: 'Encadena ideas con fluidez mediante conectores estructurantes (D’une part, En revanche, Par conséquent).',
    },
    {
      id: 'delf_morphosyntaxe',
      nameEs: '4. Competencia Léxica & Ortografía Gramatical',
      nameTarget: 'Compétence lexicale et morphosyntaxique',
      maxScore: 6.25,
      descriptorEs: 'Domina concordancias de participios, tiempos verbales, subjuntivo y riqueza léxica sin calcos del español.',
    },
  ],
};

// ============================================================================
// 6. LAS 12 FASES ARQUITECTÓNICAS DE ISKOOL INTEGRADAS CON BLOOM & BKT
// ============================================================================
export const ARCHITECTURE_12_PHASES_NODES: ArchitecturePhase12Node[] = [
  {
    phaseNumber: 1,
    code: 'FASE 01',
    titleEs: 'Bóveda Curricular (Segundo Cerebro)',
    tagEs: 'Vault-First YAML',
    metricBadge: { en: '222 Nodos ESL', fr: '36 Nodos FLE' },
    descriptionEs: 'Nodos Markdown con Frontmatter YAML, niveles CEFR/CENNI, verbos Bloom y enlaces bidireccionales [[WikiLinks]].',
    bloomIntegrationEs: 'Ancla los objetivos cognitivos LOTS y HOTS de cada semana antes de invocar al Motor de IA Pedagógica.',
    targetScreenId: 'p2_matrix',
  },
  {
    phaseNumber: 2,
    code: 'FASE 02',
    titleEs: 'Grafo Académico Políglota (DAG)',
    tagEs: '0 Ciclos · 258 Nodos',
    metricBadge: { en: '258 Nodos DAG', fr: '258 Nœuds DAG' },
    descriptionEs: 'Topología de prerrequisitos verificada sin dependencias circulares entre fonética, gramática y pragmática.',
    bloomIntegrationEs: 'Garantiza que el alumno domine Recordar/Comprender antes de desbloquear Evaluar/Crear.',
    targetScreenId: 'p2_matrix',
  },
  {
    phaseNumber: 3,
    code: 'FASE 03',
    titleEs: 'Alineación Pedagógica NEM & SEP',
    tagEs: 'Inicio · Desarrollo · Cierre',
    metricBadge: { en: '55 Min · Modelo 5E', fr: '55 Min · Cycle 5E' },
    descriptionEs: 'Secuencia cronometrada oficial de 55 minutos alineada con los Procesos de Desarrollo de Aprendizaje (PDA).',
    bloomIntegrationEs: 'Sincroniza las 5 Etapas (5E) con los 6 escalones de la Taxonomía de Bloom.',
    targetScreenId: 'p1_hub',
  },
  {
    phaseNumber: 4,
    code: 'FASE 04',
    titleEs: 'Matriz de Certificación Internacional',
    tagEs: 'Cambridge · DELF · CENNI',
    metricBadge: { en: 'CENNI 1–20 / C1', fr: 'DELF-DALF / CENNI' },
    descriptionEs: 'Doble titulación y equivalencia milimétrica entre Marco Común Europeo (CEFR), SEP CENNI (1–20), Cambridge y FEI DELF/DALF.',
    bloomIntegrationEs: 'Alinea cada banda de certificación con descriptores Can-Do verificables.',
    targetScreenId: 'p6_bkt',
  },
  {
    phaseNumber: 5,
    code: 'FASE 05',
    titleEs: 'Banco Curricular Multinivel',
    tagEs: '640 Ranuras Didácticas',
    metricBadge: { en: '640 Slots Activos', fr: '640 Créneaux' },
    descriptionEs: 'Cobertura integral desde Iniciación Temprana hasta Bachillerato / CCH UNAM con progresión en espiral.',
    bloomIntegrationEs: 'Escala la complejidad léxica y cognitiva por cohorte etaria.',
    targetScreenId: 'p2_matrix',
  },
  {
    phaseNumber: 6,
    code: 'FASE 06',
    titleEs: 'Malla en Espiral de 40 Semanas',
    tagEs: '8 Bloques · 160 Lecciones',
    metricBadge: { en: '40 Sem / 160 Lec', fr: '40 Sem / 160 Leçons' },
    descriptionEs: '8 bloques de 5 semanas donde cada estructura gramatical y fonema reaparece con mayor profundidad cognitiva.',
    bloomIntegrationEs: 'Cada semana otorga hasta 3 estrellas doradas y desbloquea Cofres de Hito al cierre de bloque.',
    targetScreenId: 'p2_matrix',
  },
  {
    phaseNumber: 7,
    code: 'FASE 07',
    titleEs: 'Motor Adaptativo BKT & IRT',
    tagEs: '36 Micro-Habilidades',
    metricBadge: { en: 'BKT P(L_t) Activo', fr: 'BKT P(L_t) Actif' },
    descriptionEs: 'Rastreo probabilístico Bayesiano en tiempo real sobre 6 Macro-Competencias y 36 Micro-Habilidades.',
    bloomIntegrationEs: 'Pondera la evidencia empírica por el multiplicador cognitivo de Bloom (x1.0 a x3.0).',
    targetScreenId: 'p6_bkt',
  },
  {
    phaseNumber: 8,
    code: 'FASE 08',
    titleEs: 'Estudio de Avatares 60 FPS en 1ª Persona',
    tagEs: '100% STT · Canon Vivo',
    metricBadge: { en: '60 FPS Lip-Sync', fr: '60 FPS Cinématique' },
    descriptionEs: 'Mentores 3D y Próceres Históricos que hablan estrictamente en 1ª persona con deformación mandibular anatómica a 60 FPS.',
    bloomIntegrationEs: 'Eleva el Student Talking Time (STT) al 100% con retos de Nivel 3 a Nivel 5 de Bloom.',
    targetScreenId: 'p4_avatar',
  },
  {
    phaseNumber: 9,
    code: 'FASE 09',
    titleEs: 'Laboratorio Acústico DSP & Karaoke',
    tagEs: 'Rayos X Sagital F1/F2/F3',
    metricBadge: { en: 'Umbral >80% DSP', fr: 'Seuil >80% DSP' },
    descriptionEs: 'Calibración SNR de micrófono, corte sagital animado del tracto vocal y evaluación espectral palabra por palabra.',
    bloomIntegrationEs: 'Acondicionamiento neuromuscular articulatorio con racha de Combo (x2, x4, x6).',
    targetScreenId: 'p3_dsp',
  },
  {
    phaseNumber: 10,
    code: 'FASE 10',
    titleEs: 'Writing Engine Socrático Autónomo',
    tagEs: '0% IA Ghostwriting',
    metricBadge: { en: '3 Monedas Socráticas', fr: '3 Pièces Socratiques' },
    descriptionEs: 'Andamiaje de escritura con 3 Monedas de Pista Socrática, detector de calcos L1→L2 y rúbricas Cambridge (0-20) / DELF (0-25).',
    bloomIntegrationEs: 'Culmina la pirámide cognitiva en el Nivel 6 de Bloom (Crear · XP x3.0).',
    targetScreenId: 'p5_writing',
  },
  {
    phaseNumber: 11,
    code: 'FASE 11',
    titleEs: 'Copiloto Docente & Misiones Relámpago',
    tagEs: '1-Click Remediation',
    metricBadge: { en: 'Despacho 1-Clic', fr: 'Envoi 1-Clic' },
    descriptionEs: 'Consola forense de aula que detecta interferencias fonéticas grupales y envía Misiones Relámpago en 1 clic.',
    bloomIntegrationEs: 'Empareja automáticamente la brecha BKT del alumno con el nivel exacto de Bloom.',
    targetScreenId: 'p6_bkt',
  },
  {
    phaseNumber: 12,
    code: 'FASE 12',
    titleEs: 'Auditoría Global & Memoria Zero-PII',
    tagEs: '6 Instituciones · Privacidad',
    metricBadge: { en: 'Zero-PII Blindado', fr: 'Zero-PII Sécurisé' },
    descriptionEs: 'Benchmarking quirúrgico de 6 instituciones mundiales y sincronización institucional anonimizada sin datos sensibles.',
    bloomIntegrationEs: 'Certifica el cumplimiento de estándares internacionales CEFR 2020 y protección de datos.',
    targetScreenId: 'p7_audit',
  },
];

// ============================================================================
// 7. UTILIDAD DE ENRIQUECIMIENTO DE LA MALLA DE 40 SEMANAS CON BÓVEDA Y BLOOM
// ============================================================================
export interface EnrichedWeekNode {
  week: CurricularWeek;
  blockNumber: number; // 1 to 8
  isMilestoneChestWeek: boolean; // Weeks 5, 10, 15, 20, 25, 30, 35, 40
  dominantBloomLevel: BloomTaxonomyLevelSpec;
  vaultFilePath: string;
  vaultYamlFrontmatter: string;
  wikiLinks: string[];
  historicalMentorId: string;
  historicalMentorName: string;
  starsEarned: 0 | 1 | 2 | 3;
  status: 'mastered' | 'active' | 'unlocked';
}

export function getEnriched40WeekMatrix(
  language: 'en' | 'fr',
  activeWeekNumber: number = 6,
  completedWeeks: number[] = [1, 2, 3, 4, 5]
): EnrichedWeekNode[] {
  const baseWeeks = language === 'fr' ? french40WeeksCurriculum : english40WeeksCurriculum;
  const langFolder = language === 'fr' ? 'french' : 'english';

  const englishMentors = [
    { id: 'claire', name: 'Prof. Claire (CLT Cambridge)' },
    { id: 'arthur', name: 'Prof. Arthur (Phonetics Coach)' },
    { id: 'shakespeare', name: 'William Shakespeare (1st Person)' },
    { id: 'ada_lovelace', name: 'Ada Lovelace (1st Person STEM)' },
    { id: 'abraham_lincoln', name: 'Abraham Lincoln (1st Person Civic)' },
  ];

  const frenchMentors = [
    { id: 'claire', name: 'Mme. Sophie (Coach DELF)' },
    { id: 'victor_hugo', name: 'Victor Hugo (1re Personne)' },
    { id: 'jeanne_darc', name: 'Jeanne d’Arc (1re Personne)' },
    { id: 'marie_curie', name: 'Marie Curie (1re Personne Sciences)' },
    { id: 'napoleon', name: 'Napoléon Bonaparte (1re Personne)' },
  ];

  return baseWeeks.map((week) => {
    const wNum = week.weekNumber;
    const blockNumber = Math.ceil(wNum / 5);
    const isMilestoneChestWeek = wNum % 5 === 0;

    // Progresión en espiral de Bloom dentro de cada bloque y a lo largo del año
    const bloomIndex = Math.min(
      5,
      Math.floor(((wNum - 1) % 5) * 1.2 + (blockNumber >= 5 ? 1 : 0))
    );
    const dominantBloomLevel = BLOOM_REVISED_TAXONOMY_LEVELS[bloomIndex] || BLOOM_REVISED_TAXONOMY_LEVELS[2];

    const mentors = language === 'fr' ? frenchMentors : englishMentors;
    const assignedMentor = mentors[(wNum - 1) % mentors.length];

    const slug = week.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const vaultFilePath = `knowledge/${langFolder}/bloque-${blockNumber}/semana-${String(wNum).padStart(2, '0')}-${slug}.md`;

    const prevLink = wNum > 1 ? `[[Semana_${String(wNum - 1).padStart(2, '0')}_Prerrequisito]]` : `[[Indice_Maestro_${langFolder.toUpperCase()}_MOC]]`;
    const nextLink = wNum < 40 ? `[[Semana_${String(wNum + 1).padStart(2, '0')}_Continuidad_Espiral]]` : `[[Certificacion_Oficial_CENNI_CEFR]]`;
    const mentorLink = `[[Mentor_1a_Persona_${assignedMentor.id}]]`;
    const bloomLink = `[[Taxonomia_Bloom_Nivel_${dominantBloomLevel.level}_${dominantBloomLevel.id.toUpperCase()}]]`;

    const vaultYamlFrontmatter = [
      '---',
      `node_id: "${language}-week-${String(wNum).padStart(2, '0')}"`,
      `title: "${week.title}"`,
      `cefr_band: "${week.cefr}"`,
      `cenni_equivalence: "${week.level}"`,
      `certification_target: "${week.certificationTarget}"`,
      `spiral_block: ${blockNumber}`,
      `bloom_taxonomy_level: "${dominantBloomLevel.nameEs} (${dominantBloomLevel.tier} · x${dominantBloomLevel.xpMultiplier} XP)"`,
      `historical_mentor_1st_person: "${assignedMentor.name}"`,
      `bkt_skills_targeted: ["FON", "CO", "PO", "CE", "PE", "MED"]`,
      `status: "verified_vault_first"`,
      '---',
      `# ${week.title}`,
      `**PDA Oficial SEP / NEM:** ${week.pda}`,
      `**Enlaces Bidireccionales Bóveda:** ${prevLink} ↔ ${nextLink} · ${mentorLink} · ${bloomLink}`,
    ].join('\n');

    const isCompleted = completedWeeks.includes(wNum);
    const isActive = wNum === activeWeekNumber;

    return {
      week,
      blockNumber,
      isMilestoneChestWeek,
      dominantBloomLevel,
      vaultFilePath,
      vaultYamlFrontmatter,
      wikiLinks: [prevLink, nextLink, mentorLink, bloomLink],
      historicalMentorId: assignedMentor.id,
      historicalMentorName: assignedMentor.name,
      starsEarned: isCompleted ? 3 : isActive ? 2 : 0,
      status: isCompleted ? 'mastered' : isActive ? 'active' : 'unlocked',
    };
  });
}

export {
  IDENTIFIABLE_LANGUAGE_SKILLS,
  INTERNATIONAL_BENCHMARK_AUDITS,
  CONTINUOUS_METHODOLOGY_STAGES,
  CONTINUOUS_40_WEEK_BLUEPRINT,
};

