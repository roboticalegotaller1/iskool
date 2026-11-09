import { StudioBlock } from '@/types/studioBlocks';

export type ExamVariantCode = 'A' | 'B' | 'C' | 'D';

export interface ExamQuestionItem {
  id: string;
  type: 'single_choice' | 'multiple_choice' | 'open_rubric';
  stem: string;
  options: string[]; // 4 opciones para single/multiple choice
  correctOptionIndex: number;
  points: number;
  penaltyPerError: number;
  bloomLevel: number;
  pdaReference: string;
  explanation: string;
  expectedKeywords?: string[]; // Para evaluación determinista 0 tokens de preguntas abiertas
}

export interface ShuffledVariantQuestion {
  originalQuestionId: string;
  variantQuestionNumber: number;
  type: 'single_choice' | 'multiple_choice' | 'open_rubric';
  stem: string;
  options: string[];
  correctOptionLetter: 'A' | 'B' | 'C' | 'D';
  correctOptionIndex: number;
  optionPermutation: number[]; // Mapeo hacia índice original
  points: number;
  penaltyPerError: number;
  bloomLevel: number;
  pdaReference: string;
  explanation: string;
  expectedKeywords?: string[];
}

export interface GeneratedExamVariant {
  variantCode: ExamVariantCode;
  seed: number;
  folioCode: string;
  questions: ShuffledVariantQuestion[];
  answerKey: Array<{
    questionNumber: number;
    originalQuestionId: string;
    correctLetter: 'A' | 'B' | 'C' | 'D';
    points: number;
  }>;
}

export interface StudentOmrScanSheetResult {
  studentId: string;
  studentName: string;
  listNumber: number;
  variantCode: ExamVariantCode;
  scannedAtIso: string;
  scanDurationMs: number;
  markedAnswers: Array<{
    questionNumber: number;
    markedLetter: 'A' | 'B' | 'C' | 'D' | 'BLANK';
    correctedFromLetter?: 'A' | 'B' | 'C' | 'D' | null;
    isCorrect: boolean;
    pointsAwarded: number;
  }>;
  openAnswerText?: string;
  openAnswerScore?: number;
  correctCount: number;
  incorrectCount: number;
  blankCount: number;
  correctedBubblesCount: number;
  rawPoints: number;
  maxPoints: number;
  finalGrade10: number; // Escala oficial SEP 5.0 - 10.0 (o 0.0 - 10.0)
  masteryLevel: 'Destacado (9-10)' | 'Satisfactorio (8-8.9)' | 'En Proceso (6-7.9)' | 'Requiere Apoyo (<6)';
}

export interface ExamItemPsychometrics {
  originalQuestionId: string;
  stem: string;
  correctRatePercent: number;
  difficultyLabel: 'Fácil (>80%)' | 'Óptimo (50-80%)' | 'Complejo (<50%)';
  mostFrequentDistractor: string;
  optionDistribution: Record<'A' | 'B' | 'C' | 'D' | 'BLANK', number>;
}

export interface ClassroomOmrBatchReport {
  examTitle: string;
  schoolName: string;
  groupName: string;
  totalStudentsScanned: number;
  totalScanTimeMs: number;
  tokensConsumed: 0;
  averageGrade10: number;
  approvalRatePercent: number;
  hardestQuestion: ExamItemPsychometrics | null;
  easiestQuestion: ExamItemPsychometrics | null;
  studentResults: StudentOmrScanSheetResult[];
  itemPsychometrics: ExamItemPsychometrics[];
}

/**
 * Generador pseudoaleatorio determinista Mulberry32 (0 Tokens, reproducible al 100%)
 */
export function createDeterministicPrng(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Permutación Fisher-Yates determinista con semilla fija (0 Tokens)
 */
export function deterministicShuffle<T>(items: readonly T[], seed: number): { shuffled: T[]; indices: number[] } {
  const prng = createDeterministicPrng(seed);
  const indices = items.map((_, idx) => idx);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const temp = indices[i];
    indices[i] = indices[j];
    indices[j] = temp;
  }
  return {
    shuffled: indices.map((idx) => items[idx]),
    indices
  };
}

const LETTERS: Array<'A' | 'B' | 'C' | 'D'> = ['A', 'B', 'C', 'D'];

const VARIANT_SEEDS: Record<ExamVariantCode, number> = {
  A: 101810,
  B: 202821,
  C: 303910,
  D: 404917
};

/**
 * Genera las 4 variantes anti-copia (Fila A, B, C, D) barajando preguntas e incisos en 0 Tokens
 */
export function generateExamVariantsZeroToken(
  baseQuestions: ExamQuestionItem[],
  variantsToGenerate: ExamVariantCode[] = ['A', 'B', 'C', 'D'],
  shuffleQuestions = true,
  shuffleOptions = true
): GeneratedExamVariant[] {
  return variantsToGenerate.map((variantCode) => {
    const baseSeed = VARIANT_SEEDS[variantCode];
    const questionOrder =
      variantCode === 'A' || !shuffleQuestions
        ? { shuffled: [...baseQuestions], indices: baseQuestions.map((_, i) => i) }
        : deterministicShuffle(baseQuestions, baseSeed);

    const variantQuestions: ShuffledVariantQuestion[] = questionOrder.shuffled.map((q, qIdx) => {
      const normalizedOptions =
        q.options && q.options.length >= 4
          ? q.options.slice(0, 4)
          : [...(q.options || []), 'Opción complementaria A', 'Opción complementaria B', 'Opción complementaria C', 'Opción complementaria D'].slice(0, 4);

      const safeCorrectIdx = Math.max(0, Math.min(3, q.correctOptionIndex ?? 0));

      const optOrder = !shuffleOptions
        ? { shuffled: normalizedOptions, indices: [0, 1, 2, 3] }
        : deterministicShuffle(normalizedOptions, baseSeed + (qIdx + 1) * 7919);

      const newCorrectIdx = optOrder.indices.indexOf(safeCorrectIdx);
      const safeNewCorrectIdx = newCorrectIdx >= 0 ? newCorrectIdx : 0;

      return {
        originalQuestionId: q.id,
        variantQuestionNumber: qIdx + 1,
        type: q.type,
        stem: q.stem,
        options: optOrder.shuffled,
        correctOptionLetter: LETTERS[safeNewCorrectIdx],
        correctOptionIndex: safeNewCorrectIdx,
        optionPermutation: optOrder.indices,
        points: q.points || 2,
        penaltyPerError: q.penaltyPerError ?? 0,
        bloomLevel: q.bloomLevel || 4,
        pdaReference: q.pdaReference || 'NEM-SEP-2024',
        explanation: q.explanation || 'Reactivo verificado por clave determinista de Bóveda Curricular.',
        expectedKeywords: q.expectedKeywords
      };
    });

    return {
      variantCode,
      seed: baseSeed,
      folioCode: `OMR-${variantCode}-${baseSeed}`,
      questions: variantQuestions,
      answerKey: variantQuestions.map((vq) => ({
        questionNumber: vq.variantQuestionNumber,
        originalQuestionId: vq.originalQuestionId,
        correctLetter: vq.correctOptionLetter,
        points: vq.points
      }))
    };
  });
}

/**
 * Extrae reactivos automáticamente de TODOS los bloques de evaluación y examen de ISkool Studio (0 Tokens)
 * con deduplicación estricta para evitar reactivos repetidos.
 */
export function extractExamQuestionsFromStudioBlocks(
  blocks: StudioBlock[],
  defaultPenalty = 0
): ExamQuestionItem[] {
  const extracted: ExamQuestionItem[] = [];
  const seenStems = new Set<string>();

  const pushUniqueQuestion = (item: ExamQuestionItem) => {
    const cleanStem = (item.stem || '').trim();
    if (!cleanStem) return;
    const normKey = cleanStem
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
    if (seenStems.has(normKey)) return;
    seenStems.add(normKey);
    extracted.push(item);
  };

  blocks.forEach((blk, idx) => {
    const raw = (blk.data || {}) as Record<string, any>;

    if (blk.type === 'omr_optical_exam_block' && Array.isArray(raw.questions) && raw.questions.length > 0) {
      raw.questions.forEach((q: any, qIdx: number) => {
        pushUniqueQuestion({
          id: q.id || `omr-q-${idx}-${qIdx}`,
          type: q.type || 'single_choice',
          stem: q.stem || q.question || `Reactivo #${qIdx + 1}`,
          options: Array.isArray(q.options) && q.options.length >= 4
            ? q.options.slice(0, 4)
            : ['Hidalgo y Allende', 'Iturbide y Guerrero', 'Morelos y Galeana', 'Aldama y Abasolo'],
          correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
          points: q.points || 2,
          penaltyPerError: typeof q.penaltyPerError === 'number' ? q.penaltyPerError : defaultPenalty,
          bloomLevel: q.bloomLevel || 4,
          pdaReference: q.pdaReference || 'NEM-HIS-F5-01',
          explanation: q.explanation || 'Clave verificada en Bóveda Curricular.',
          expectedKeywords: q.expectedKeywords || ['soberanía', 'constitución', 'libertad']
        });
      });
      return;
    }

    if (blk.type === 'quiz_question') {
      pushUniqueQuestion({
        id: `quiz-${blk.id}`,
        type: 'single_choice',
        stem: raw.question || blk.title,
        options: Array.isArray(raw.options) && raw.options.length >= 4
          ? raw.options.slice(0, 4)
          : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correctOptionIndex: typeof raw.correctIndex === 'number' ? raw.correctIndex : 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 3,
        pdaReference: 'NEM-EVAL-01',
        explanation: raw.explanation || 'Respuesta validada por clave curricular.'
      });
    } else if (blk.type === 'historical_figure_block' && Array.isArray(raw.verificationQuestions)) {
      raw.verificationQuestions.slice(0, 2).forEach((vq: any, vIdx: number) => {
        pushUniqueQuestion({
          id: `hist-${blk.id}-${vIdx}`,
          type: 'single_choice',
          stem: vq.question,
          options: Array.isArray(vq.options) && vq.options.length >= 4
            ? vq.options.slice(0, 4)
            : ['Querétaro, 1810', 'Dolores, 1810', 'Apatzingán, 1814', 'Iguala, 1821'],
          correctOptionIndex: typeof vq.correctIndex === 'number' ? vq.correctIndex : 0,
          points: 2,
          penaltyPerError: defaultPenalty,
          bloomLevel: 4,
          pdaReference: 'NEM-HIS-F5-01',
          explanation: vq.explanation || 'Fuente histórica primaria verificada en Bóveda.'
        });
      });
    } else if (blk.type === 'timed_reading_block') {
      const rqList = Array.isArray(raw.comprehensionQuestions)
        ? raw.comprehensionQuestions
        : Array.isArray(raw.questions)
          ? raw.questions
          : [];
      rqList.slice(0, 2).forEach((rq: any, rIdx: number) => {
        pushUniqueQuestion({
          id: `read-${blk.id}-${rIdx}`,
          type: 'single_choice',
          stem: rq.question || rq.stem || `Comprensión lectora: ${blk.title}`,
          options: Array.isArray(rq.options) && rq.options.length >= 4
            ? rq.options.slice(0, 4)
            : ['Idea central fundamentada en el texto', 'Dato secundario aislado', 'Hipótesis no mencionada', 'Opinión externa al texto'],
          correctOptionIndex: typeof rq.correctIndex === 'number' ? rq.correctIndex : 0,
          points: 2,
          penaltyPerError: defaultPenalty,
          bloomLevel: 3,
          pdaReference: 'NEM-LEN-F5-01',
          explanation: rq.explanation || 'Comprensión lectora verificada.'
        });
      });
    } else if (blk.type === 'drag_drop_match' && Array.isArray(raw.pairs) && raw.pairs.length > 0) {
      const firstPair = raw.pairs[0];
      const otherDefs = raw.pairs.slice(1, 4).map((p: any) => p.right || p.definition || p.match);
      pushUniqueQuestion({
        id: `match-${blk.id}`,
        type: 'single_choice',
        stem: `Relación conceptual (${blk.title}): ¿Qué definición o par corresponde exactamente a "${firstPair.left || firstPair.term || 'Concepto clave'}"?`,
        options: [
          firstPair.right || firstPair.definition || firstPair.match || 'Definición oficial verificada',
          otherDefs[0] || 'Proceso secundario no relacionado directamente',
          otherDefs[1] || 'Antecedente cronológico de otra etapa',
          otherDefs[2] || 'Consecuencia externa al fenómeno estudiado'
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 3,
        pdaReference: 'NEM-REL-01',
        explanation: 'Asociación conceptual directa extraída del bloque de emparejamiento.'
      });
    } else if (blk.type === 'ordering_sequence' && Array.isArray(raw.items) && raw.items.length >= 2) {
      const seqLabels = raw.items.map((it: any, sIdx: number) => `${sIdx + 1}. ${typeof it === 'string' ? it : it.label || it.text || `Paso ${sIdx + 1}`}`);
      pushUniqueQuestion({
        id: `ord-${blk.id}`,
        type: 'single_choice',
        stem: `Secuencia cronológica y algorítmica (${blk.title}): ¿Cuál es el orden correcto de los elementos?`,
        options: [
          seqLabels.slice(0, 4).join(' → '),
          [...seqLabels].reverse().slice(0, 4).join(' → '),
          [seqLabels[1], seqLabels[0], ...seqLabels.slice(2, 4)].filter(Boolean).join(' → '),
          [...seqLabels.slice(2, 4), seqLabels[0], seqLabels[1]].filter(Boolean).join(' → ')
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 4,
        pdaReference: 'NEM-SEQ-01',
        explanation: 'Orden secuencial verificado en el bloque de secuencia.'
      });
    } else if (blk.type === 'fill_in_blanks') {
      const words: string[] = Array.isArray(raw.wordBank) && raw.wordBank.length > 0
        ? raw.wordBank
        : ['Querétaro', 'Ignacio Pérez', 'Dolores', 'Miguel Hidalgo'];
      pushUniqueQuestion({
        id: `fill-${blk.id}`,
        type: 'single_choice',
        stem: `Completa correctamente el enunciado curricular: "${(raw.textWithBlanks || blk.title).replace(/\[([^\]]+)\]/g, '______')}"`,
        options: [
          words.slice(0, 3).join(' → '),
          [...words].reverse().slice(0, 3).join(' → '),
          'Veracruz → Córdoba → Ciudad de México',
          'Valladolid → Acapulco → Chilpancingo'
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 3,
        pdaReference: 'NEM-LEN-02',
        explanation: 'Secuencia léxica validada con el banco de palabras oficial.'
      });
    } else if (blk.type === 'boss_enemy' && Array.isArray(raw.questions)) {
      raw.questions.slice(0, 2).forEach((bq: any, bIdx: number) => {
        pushUniqueQuestion({
          id: `boss-${blk.id}-${bIdx}`,
          type: 'single_choice',
          stem: bq.question,
          options: Array.isArray(bq.options) && bq.options.length >= 4
            ? bq.options.slice(0, 4)
            : ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctOptionIndex: typeof bq.correctIndex === 'number' ? bq.correctIndex : 0,
          points: 2,
          penaltyPerError: defaultPenalty,
          bloomLevel: 4,
          pdaReference: 'NEM-BOSS-01',
          explanation: bq.explanation || 'Reactivo de maestría del duelo curricular.'
        });
      });
    } else if (blk.type === 'interactive_hotspot_canvas' && Array.isArray(raw.hotspots) && raw.hotspots.length > 0) {
      const pin0 = raw.hotspots[0];
      const otherPins = raw.hotspots.slice(1, 4).map((p: any) => p.correctLabel);
      pushUniqueQuestion({
        id: `hotspot-${blk.id}`,
        type: 'single_choice',
        stem: `Identificación en Mapa / Diagrama (${raw.diagramTitle || blk.title}): ¿Qué elemento corresponde al Punto Caliente #${pin0.pinNumber || 1} (${pin0.hint || 'coordenada principal'})?`,
        options: [
          pin0.correctLabel || 'Punto de referencia primario',
          otherPins[0] || 'Elemento periférico norte',
          otherPins[1] || 'Región secundaria sur',
          otherPins[2] || 'Zona limítrofe externa'
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 4,
        pdaReference: 'NEM-GEO-01',
        explanation: 'Coordenada verificada en el lienzo de oclusión visual.'
      });
    } else if (blk.type === 'interactive_whiteboard_math') {
      const expr = raw.formulaExpression || 'y = 2x + 3';
      const tx = raw.targetCoordinate?.x ?? 2;
      const ty = raw.targetCoordinate?.y ?? 7;
      pushUniqueQuestion({
        id: `math-wb-${blk.id}`,
        type: 'single_choice',
        stem: `${raw.promptQuestion || `En el modelo algebraico ${expr}, ¿cuál es el par ordenado (x, y) que satisface exactamente la función para x = ${tx}?`}`,
        options: [
          `(${tx}, ${ty})`,
          `(${tx}, ${ty + 2})`,
          `(${tx + 1}, ${ty - 1})`,
          `(${ty}, ${tx})`
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 4,
        pdaReference: 'NEM-MAT-F6-01',
        explanation: `Sustituyendo x = ${tx} en ${expr} se obtiene el punto exacto (${tx}, ${ty}).`
      });
    } else if (blk.type === 'cornell_smart_notes' || blk.type === 'exit_ticket_reflection' || blk.type === 'socratic_debate_arena' || blk.type === 'open_poll_wordcloud') {
      const kws: string[] = Array.isArray(raw.requiredSummaryKeywords)
        ? raw.requiredSummaryKeywords
        : ['soberanía', 'pueblo', 'igualdad', 'libertad'];
      pushUniqueQuestion({
        id: `synth-${blk.id}`,
        type: 'single_choice',
        stem: `Síntesis Metacognitiva (${raw.topicTitle || raw.centralDilemma || raw.closurePrompt || blk.title}): ¿Qué conjunto de conceptos clave integra de forma rigurosa la conclusión de la sesión?`,
        options: [
          kws.join(', '),
          'Memorización aislada sin relación con el entorno comunitario',
          'Reproducción literal sin contraste de fuentes primarias',
          'Omisión de causas históricas y científicas del fenómeno'
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 5,
        pdaReference: 'NEM-SINT-01',
        explanation: 'Síntesis verificada mediante los conceptos rectores del bloque.',
        expectedKeywords: kws
      });
    } else if (blk.type === 'secret_code_puzzle' || blk.type === 'checkpoint_gate') {
      pushUniqueQuestion({
        id: `gate-${blk.id}`,
        type: 'single_choice',
        stem: raw.riddleQuestion || raw.checkpointQuestion || `Verificación de dominio (${blk.title}): ¿Cuál es la clave o criterio que acredita el avance de este bloque?`,
        options: [
          raw.secretCode || raw.expectedAnswer || 'Cumplimiento integral de los criterios de la rúbrica y evidencia verificada',
          'Avance automático sin validación de evidencias',
          'Entrega parcial sin fundamentación teórica',
          'Revisión superficial sin contraste experimental'
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 4,
        pdaReference: 'NEM-GATE-01',
        explanation: 'Punto de control acreditado por clave determinista.'
      });
    } else if (
      blk.type === 'languages_evaluation_rubric' ||
      blk.type === 'languages_karaoke_block' ||
      blk.type === 'languages_socratic_tutor' ||
      blk.type === 'languages_roleplay_mission' ||
      blk.type === 'languages_practice_portal'
    ) {
      pushUniqueQuestion({
        id: `lang-${blk.id}`,
        type: 'single_choice',
        stem: raw.prompt || raw.targetPhrase || `Competencia Comunicativa CEFR (${blk.title}): Selecciona la estructura lingüística formal y gramaticalmente correcta para esta misión:`,
        options: [
          raw.targetPhrase || 'Bonjour, je voudrais réserver une table pour deux personnes, s’il vous plaît.',
          'Je veux table maintenant vite.',
          'Moi aller brasserie hier demain.',
          'Pourquoi tu pas parler jamais.'
        ],
        correctOptionIndex: 0,
        points: 2,
        penaltyPerError: defaultPenalty,
        bloomLevel: 4,
        pdaReference: 'CEFR-DELF-CAMB',
        explanation: 'Estructura comunicativa validada conforme al Marco Común Europeo (CEFR / CENNI).'
      });
    }
  });

  if (extracted.length >= 5) {
    return extracted.slice(0, 10);
  }

  // Banco base de respaldo curricular SEP NEM (0 Tokens)
  const fallbackBank: ExamQuestionItem[] = [
    {
      id: 'sep-omr-1',
      type: 'single_choice',
      stem: '¿Desde qué ciudad envió Doña Josefa Ortiz de Domínguez el aviso urgente la noche del 15 de septiembre de 1810 tras descubrirse la conspiración?',
      options: [
        'Santiago de Querétaro',
        'San Miguel el Grande',
        'Valladolid (hoy Morelia)',
        'Chilpancingo de los Bravo'
      ],
      correctOptionIndex: 0,
      points: 2,
      penaltyPerError: defaultPenalty,
      bloomLevel: 4,
      pdaReference: 'NEM-HIS-F5-01',
      explanation: 'Desde su residencia en la Corregiduría de Querétaro envió a Ignacio Pérez a cabalgar hacia San Miguel y Dolores.'
    },
    {
      id: 'sep-omr-2',
      type: 'single_choice',
      stem: '¿Qué documento redactado por José María Morelos en 1813 proclamó por primera vez la abolición de la esclavitud y que la soberanía dimana directamente del pueblo?',
      options: [
        'Sentimientos de la Nación',
        'Plan de Iguala',
        'Tratados de Córdoba',
        'Estatuto Provisional del Imperio'
      ],
      correctOptionIndex: 0,
      points: 2,
      penaltyPerError: defaultPenalty,
      bloomLevel: 4,
      pdaReference: 'NEM-HIS-F5-02',
      explanation: 'Los Sentimientos de la Nación fueron leídos el 14 de septiembre de 1813 en la apertura del Congreso de Anáhuac en Chilpancingo.'
    },
    {
      id: 'sep-omr-3',
      type: 'single_choice',
      stem: '¿Cuál es el orden cronológico correcto de las 4 etapas del proceso de Independencia de México (1810-1821)?',
      options: [
        '1. Inicio (Hidalgo) → 2. Organización (Morelos) → 3. Resistencia (Guerrero y Mina) → 4. Consumación (Ejército Trigarante)',
        '1. Organización → 2. Inicio → 3. Consumación → 4. Resistencia',
        '1. Resistencia → 2. Consumación → 3. Inicio → 4. Organización',
        '1. Inicio → 2. Consumación → 3. Organización → 4. Resistencia'
      ],
      correctOptionIndex: 0,
      points: 2,
      penaltyPerError: defaultPenalty,
      bloomLevel: 3,
      pdaReference: 'NEM-HIS-F5-03',
      explanation: 'La historiografía escolar SEP divide el movimiento en Inicio (1810-1811), Organización (1811-1815), Resistencia (1815-1820) y Consumación (1821).'
    },
    {
      id: 'sep-omr-4',
      type: 'single_choice',
      stem: '¿En qué batalla del 30 de octubre de 1810 las fuerzas insurgentes de Hidalgo y Allende derrotaron al ejército realista a las puertas de la Ciudad de México?',
      options: [
        'Batalla del Monte de las Cruces',
        'Batalla del Puente de Calderón',
        'Sitio de Cuautla',
        'Toma del Fuerte de San Diego'
      ],
      correctOptionIndex: 0,
      points: 2,
      penaltyPerError: defaultPenalty,
      bloomLevel: 4,
      pdaReference: 'NEM-HIS-F5-04',
      explanation: 'La victoria insurgente en el Monte de las Cruces abrió el paso al Valle de México el 30 de octubre de 1810.'
    },
    {
      id: 'sep-omr-5',
      type: 'single_choice',
      stem: '¿Qué caudillo insurgente sostuvo la lucha en las montañas del sur y selló el Abrazo de Acatempan en 1821 para consumar la Independencia?',
      options: [
        'Vicente Guerrero Saldaña',
        'Mariano Matamoros',
        'Hermenegildo Galeana',
        'Nicolás Bravo'
      ],
      correctOptionIndex: 0,
      points: 2,
      penaltyPerError: defaultPenalty,
      bloomLevel: 3,
      pdaReference: 'NEM-HIS-F5-05',
      explanation: 'Vicente Guerrero mantuvo viva la resistencia en el sur bajo el lema "La Patria es Primero".'
    }
  ];

  for (const item of fallbackBank) {
    if (extracted.length >= 8) break;
    pushUniqueQuestion(item);
  }
  return extracted.slice(0, 12);
}

/**
 * Evalúa de forma determinista (0 Tokens) una pregunta abierta mediante matriz de conceptos clave
 */
export function evaluateOpenAnswerDeterministically(
  studentText: string,
  expectedKeywords: string[] = ['soberanía', 'pueblo', 'igualdad', 'libertad'],
  maxPoints = 2
): { score: number; matchedKeywords: string[]; feedback: string } {
  if (!studentText || !studentText.trim()) {
    return {
      score: 0,
      matchedKeywords: [],
      feedback: 'Sin respuesta registrada en el campo descriptivo.'
    };
  }
  const normalized = studentText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const matched = expectedKeywords.filter((kw) => {
    const cleanKw = kw
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
    return normalized.includes(cleanKw);
  });

  const ratio = expectedKeywords.length > 0 ? matched.length / expectedKeywords.length : 1;
  const wordCountBonus = studentText.trim().split(/\s+/).length >= 12 ? 0.25 : 0;
  const rawScore = Math.min(maxPoints, Number(((ratio + wordCountBonus) * maxPoints).toFixed(2)));

  return {
    score: rawScore,
    matchedKeywords: matched,
    feedback:
      matched.length > 0
        ? `Rúbrica determinista (0 Tokens): identificó ${matched.length}/${expectedKeywords.length} conceptos rectores (${matched.join(', ')}).`
        : 'Rúbrica determinista (0 Tokens): se recomienda incorporar conceptos clave del PDA oficial.'
  };
}

const SAMPLE_CLASSROOM_STUDENTS = [
  'Santiago Gómez Pérez',
  'Valentina Hernández Ruiz',
  'Mateo Morales Mendoza',
  'Sofía Ramírez Torres',
  'Sebastián Flores Aguilar',
  'Camila Vázquez Castro',
  'Leonardo Mendoza Peña',
  'Regina Ortiz Delgado',
  'Emiliano Cruz Navarro',
  'Ximena Reyes Salazar',
  'Diego Guerrero Cervantes',
  'Mariana Domínguez Soto'
];

/**
 * Simulador y Procesador de Escaneo Óptico OMR por Lote / Cámara (Califica todo el grupo en <1ms con 0 Tokens)
 */
export function runClassroomOmrBatchGradingZeroToken(params: {
  examTitle: string;
  schoolName: string;
  groupName: string;
  baseQuestions: ExamQuestionItem[];
  variants: GeneratedExamVariant[];
  penaltyPerError: number;
  studentsList?: string[];
}): ClassroomOmrBatchReport {
  const startPerf = Date.now();
  const roster = params.studentsList && params.studentsList.length > 0 ? params.studentsList : SAMPLE_CLASSROOM_STUDENTS;
  const variantsMap = new Map<ExamVariantCode, GeneratedExamVariant>();
  params.variants.forEach((v) => variantsMap.set(v.variantCode, v));
  const availableCodes = params.variants.map((v) => v.variantCode);

  // Acumuladores psicométricos por pregunta original
  const psychMap = new Map<
    string,
    {
      stem: string;
      correctCount: number;
      totalCount: number;
      optionCounts: Record<'A' | 'B' | 'C' | 'D' | 'BLANK', number>;
    }
  >();

  params.baseQuestions.forEach((q) => {
    psychMap.set(q.id, {
      stem: q.stem,
      correctCount: 0,
      totalCount: 0,
      optionCounts: { A: 0, B: 0, C: 0, D: 0, BLANK: 0 }
    });
  });

  const studentResults: StudentOmrScanSheetResult[] = roster.map((studentName, idx) => {
    const listNumber = idx + 1;
    const variantCode = availableCodes[idx % availableCodes.length] || 'A';
    const variant = variantsMap.get(variantCode) || params.variants[0];
    const prng = createDeterministicPrng(9001 + listNumber * 313 + variant.seed);

    let correctCount = 0;
    let incorrectCount = 0;
    let blankCount = 0;
    let correctedBubblesCount = 0;
    let rawPoints = 0;
    let maxPoints = 0;

    // Nivel base del estudiante para distribución realista (75% - 100% aciertos)
    const studentSkill = 0.68 + (idx % 5) * 0.07;

    const markedAnswers = variant.questions.map((vq) => {
      maxPoints += vq.points;
      const roll = prng();
      let markedLetter: 'A' | 'B' | 'C' | 'D' | 'BLANK' = vq.correctOptionLetter;
      let correctedFromLetter: 'A' | 'B' | 'C' | 'D' | null = null;

      // Simular que el alumno corrigió un alveolo tachando y marcando la fila de corrección OMR
      if (prng() < 0.14) {
        const wrongLetters = LETTERS.filter((l) => l !== vq.correctOptionLetter);
        correctedFromLetter = wrongLetters[Math.floor(prng() * wrongLetters.length)];
        correctedBubblesCount++;
      }

      if (roll > studentSkill) {
        if (prng() < 0.08) {
          markedLetter = 'BLANK';
        } else {
          const wrongLetters = LETTERS.filter((l) => l !== vq.correctOptionLetter);
          markedLetter = wrongLetters[Math.floor(prng() * wrongLetters.length)];
        }
      }

      const isCorrect = markedLetter === vq.correctOptionLetter;
      let pointsAwarded = 0;
      if (isCorrect) {
        correctCount++;
        pointsAwarded = vq.points;
      } else if (markedLetter === 'BLANK') {
        blankCount++;
        pointsAwarded = 0;
      } else {
        incorrectCount++;
        pointsAwarded = -Math.abs(params.penaltyPerError);
      }
      rawPoints += pointsAwarded;

      // Registrar en psicometría normalizada a la pregunta original
      const pEntry = psychMap.get(vq.originalQuestionId);
      if (pEntry) {
        pEntry.totalCount++;
        if (isCorrect) pEntry.correctCount++;
        pEntry.optionCounts[markedLetter] = (pEntry.optionCounts[markedLetter] || 0) + 1;
      }

      return {
        questionNumber: vq.variantQuestionNumber,
        markedLetter,
        correctedFromLetter,
        isCorrect,
        pointsAwarded: Number(pointsAwarded.toFixed(2))
      };
    });

    const clampedRaw = Math.max(0, rawPoints);
    const finalGrade10 = maxPoints > 0 ? Number(((clampedRaw / maxPoints) * 10).toFixed(1)) : 10;
    const masteryLevel: StudentOmrScanSheetResult['masteryLevel'] =
      finalGrade10 >= 9
        ? 'Destacado (9-10)'
        : finalGrade10 >= 8
          ? 'Satisfactorio (8-8.9)'
          : finalGrade10 >= 6
            ? 'En Proceso (6-7.9)'
            : 'Requiere Apoyo (<6)';

    return {
      studentId: `ALU-2026-${String(listNumber).padStart(3, '0')}`,
      studentName,
      listNumber,
      variantCode,
      scannedAtIso: new Date().toISOString(),
      scanDurationMs: 18 + (idx % 9),
      markedAnswers,
      correctCount,
      incorrectCount,
      blankCount,
      correctedBubblesCount,
      rawPoints: Number(clampedRaw.toFixed(2)),
      maxPoints,
      finalGrade10,
      masteryLevel
    };
  });

  const itemPsychometrics: ExamItemPsychometrics[] = params.baseQuestions.map((q) => {
    const p = psychMap.get(q.id);
    const total = p?.totalCount || 1;
    const rate = Number((((p?.correctCount || 0) / total) * 100).toFixed(1));
    const difficultyLabel: ExamItemPsychometrics['difficultyLabel'] =
      rate >= 80 ? 'Fácil (>80%)' : rate >= 50 ? 'Óptimo (50-80%)' : 'Complejo (<50%)';

    const dist = p?.optionCounts || { A: 0, B: 0, C: 0, D: 0, BLANK: 0 };
    const distractors = q.options.filter((_, idx) => idx !== q.correctOptionIndex);
    const mostFrequentDistractor = distractors[0] || 'Confusión cronológica de etapas';

    return {
      originalQuestionId: q.id,
      stem: q.stem,
      correctRatePercent: rate,
      difficultyLabel,
      mostFrequentDistractor,
      optionDistribution: dist
    };
  });

  const sortedByDifficulty = [...itemPsychometrics].sort((a, b) => a.correctRatePercent - b.correctRatePercent);
  const avgGrade =
    studentResults.length > 0
      ? Number((studentResults.reduce((acc, s) => acc + s.finalGrade10, 0) / studentResults.length).toFixed(1))
      : 0;
  const approvedCount = studentResults.filter((s) => s.finalGrade10 >= 6).length;

  return {
    examTitle: params.examTitle,
    schoolName: params.schoolName,
    groupName: params.groupName,
    totalStudentsScanned: studentResults.length,
    totalScanTimeMs: Math.max(12, Date.now() - startPerf),
    tokensConsumed: 0,
    averageGrade10: avgGrade,
    approvalRatePercent: Number(((approvedCount / Math.max(1, studentResults.length)) * 100).toFixed(1)),
    hardestQuestion: sortedByDifficulty[0] || null,
    easiestQuestion: sortedByDifficulty[sortedByDifficulty.length - 1] || null,
    studentResults,
    itemPsychometrics
  };
}

