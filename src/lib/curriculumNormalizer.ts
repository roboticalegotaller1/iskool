/**
 * @file curriculumNormalizer.ts
 * @description Normalizador canónico compartido de grados escolares, fases NEM,
 * textos de búsqueda y slugs temáticos para la Bóveda Curricular y Motores Pedagógicos de ISkool.
 * Módulo puro sin dependencias de Node.js (seguro para servidor y navegador).
 */

export type CanonicalEducationLevel =
  | 'preescolar'
  | 'primaria'
  | 'secundaria'
  | 'preparatoria';

export type CanonicalFaseNemShort =
  | 'Fase 2'
  | 'Fase 3'
  | 'Fase 4'
  | 'Fase 5'
  | 'Fase 6';

export interface CanonicalGradeInfo {
  gradeNum: number;
  level: CanonicalEducationLevel;
  canonicalSlug: string;
  displayLabel: string;
  faseNem: string;
  faseNemShort: CanonicalFaseNemShort;
  taxonomyCode: string;
  folderPatterns: string[];
}

export interface ExtractedGradeResult {
  grade: CanonicalGradeInfo | null;
  remainingText: string;
}

const ORDINAL_WORD_TO_NUM: Record<string, number> = {
  // 1
  '1': 1,
  '1ro': 1,
  '1er': 1,
  '1ra': 1,
  '1o': 1,
  '1a': 1,
  '1st': 1,
  'primero': 1,
  'primer': 1,
  'primera': 1,
  'uno': 1,
  'first': 1,
  // 2
  '2': 2,
  '2do': 2,
  '2da': 2,
  '2o': 2,
  '2a': 2,
  '2nd': 2,
  'segundo': 2,
  'segunda': 2,
  'dos': 2,
  'second': 2,
  // 3
  '3': 3,
  '3ro': 3,
  '3er': 3,
  '3ra': 3,
  '3o': 3,
  '3a': 3,
  '3rd': 3,
  'tercero': 3,
  'tercer': 3,
  'tercera': 3,
  'tres': 3,
  'third': 3,
  // 4
  '4': 4,
  '4to': 4,
  '4ta': 4,
  '4o': 4,
  '4a': 4,
  '4th': 4,
  'cuarto': 4,
  'cuarta': 4,
  'cuatro': 4,
  'fourth': 4,
  // 5
  '5': 5,
  '5to': 5,
  '5ta': 5,
  '5o': 5,
  '5a': 5,
  '5th': 5,
  'quinto': 5,
  'quinta': 5,
  'cinco': 5,
  'fifth': 5,
  // 6
  '6': 6,
  '6to': 6,
  '6ta': 6,
  '6o': 6,
  '6a': 6,
  '6th': 6,
  'sexto': 6,
  'sexta': 6,
  'seis': 6,
  'sixth': 6,
};

const FOLDER_PATTERNS_BY_GRADE: Record<number, string[]> = {
  1: ['1ro_grado', '1er_grado', '1_grado', '1ro', '1er', 'primero'],
  2: ['2do_grado', '2_grado', '2do', 'segundo'],
  3: ['3ro_grado', '3er_grado', '3_grado', '3ro', '3er', 'tercero'],
  4: ['4to_grado', '4_grado', '4to', 'cuarto'],
  5: ['5to_grado', '5_grado', '5to', 'quinto'],
  6: ['6to_grado', '6_grado', '6to', 'sexto'],
};

const LEVEL_DISPLAY: Record<CanonicalEducationLevel, string> = {
  preescolar: 'Preescolar',
  primaria: 'Primaria',
  secundaria: 'Secundaria',
  preparatoria: 'Preparatoria',
};

const LEVEL_TAXONOMY_PREFIX: Record<CanonicalEducationLevel, string> = {
  preescolar: 'preschool',
  primaria: 'primary',
  secundaria: 'secondary',
  preparatoria: 'high_school',
};

const LEVEL_MAX_GRADE: Record<CanonicalEducationLevel, number> = {
  preescolar: 3,
  primaria: 6,
  secundaria: 3,
  preparatoria: 3,
};

/**
 * Stopwords genéricas de español que se eliminan al extraer tokens temáticos.
 * IMPORTANTE: Conserva estrictamente ordinales matemáticos/históricos y términos de dominio
 * (primero, segundo, tercero, grado, ecuaciones, guerra, mundial, ley, newton, etc.).
 */
const TOPIC_STOPWORDS = new Set<string>([
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'de',
  'del',
  'al',
  'en',
  'y',
  'o',
  'para',
  'por',
  'sobre',
  'que',
  'es',
  'son',
  'como',
  'cual',
  'cuales',
  'tema',
  'clase',
]);

function buildCanonicalGradeInfo(
  gradeNum: number,
  level: CanonicalEducationLevel
): CanonicalGradeInfo | null {
  const maxGrade = LEVEL_MAX_GRADE[level];
  if (!Number.isInteger(gradeNum) || gradeNum < 1 || gradeNum > maxGrade) {
    return null;
  }

  let faseNem: string;
  let faseNemShort: CanonicalFaseNemShort;

  if (level === 'preescolar') {
    faseNem = 'Fase_2_Preescolar';
    faseNemShort = 'Fase 2';
  } else if (level === 'primaria') {
    if (gradeNum <= 2) {
      faseNem = 'Fase_3_Primaria';
      faseNemShort = 'Fase 3';
    } else if (gradeNum <= 4) {
      faseNem = 'Fase_4_Primaria';
      faseNemShort = 'Fase 4';
    } else {
      faseNem = 'Fase_5_Primaria';
      faseNemShort = 'Fase 5';
    }
  } else if (level === 'secundaria') {
    faseNem = 'Fase_6_Secundaria';
    faseNemShort = 'Fase 6';
  } else {
    faseNem = 'Fase_6_Preparatoria';
    faseNemShort = 'Fase 6';
  }

  return {
    gradeNum,
    level,
    canonicalSlug: `${gradeNum}_de_${level}`,
    displayLabel: `${gradeNum}º de ${LEVEL_DISPLAY[level]}`,
    faseNem,
    faseNemShort,
    taxonomyCode: `${LEVEL_TAXONOMY_PREFIX[level]}_${gradeNum}`,
    folderPatterns: [...(FOLDER_PATTERNS_BY_GRADE[gradeNum] || [`${gradeNum}_grado`])],
  };
}

function parseOrdinalToken(rawToken: string): number | null {
  const cleaned = rawToken
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s.°ºª]+/g, '')
    .trim();

  if (cleaned in ORDINAL_WORD_TO_NUM) {
    return ORDINAL_WORD_TO_NUM[cleaned];
  }
  return null;
}

function parseLevelToken(rawLevel: string): CanonicalEducationLevel | null {
  const norm = rawLevel
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (
    norm === 'preescolar' ||
    norm === 'preesc' ||
    norm === 'kinder' ||
    norm === 'prekinder' ||
    norm === 'pre k' ||
    norm === 'preschool' ||
    norm === 'kindergarten'
  ) {
    return 'preescolar';
  }
  if (
    norm === 'primaria' ||
    norm === 'prim' ||
    norm === 'primary' ||
    norm === 'elementary'
  ) {
    return 'primaria';
  }
  if (
    norm === 'secundaria' ||
    norm === 'sec' ||
    norm === 'secu' ||
    norm === 'secondary' ||
    norm === 'middle school' ||
    norm === 'middleschool'
  ) {
    return 'secundaria';
  }
  if (
    norm === 'preparatoria' ||
    norm === 'prepa' ||
    norm === 'bachillerato' ||
    norm === 'bach' ||
    norm === 'cch' ||
    norm === 'ems' ||
    norm === 'media superior' ||
    norm === 'high school' ||
    norm === 'highschool'
  ) {
    return 'preparatoria';
  }
  return null;
}

const ORDINAL_PATTERN =
  '(?:[1-6](?:\\.?\\s*[°ºª]|(?:er|ro|do|to|ra|da|ta|o|a|st|nd|rd|th))?\\.?|primero|primer|primera|segundo|segunda|tercero|tercer|tercera|cuarto|cuarta|quinto|quinta|sexto|sexta|uno|dos|tres|cuatro|cinco|seis|first|second|third|fourth|fifth|sixth)';

const LEVEL_PATTERN =
  '(?:preescolar|preesc\\.?|k[ií]nder|prek[ií]nder|pre-k|preschool|kindergarten|primaria|prim\\.?|primary|elementary|secundaria|secu\\.?|sec\\.?|secondary|middle[\\s_]+school|middleschool|preparatoria|prepa\\.?|bachillerato|bach\\.?|cch|ems|media\\s+superior|high[\\s_]+school|highschool)';

const TAXONOMY_CODE_REGEX =
  /\b(preschool|preescolar|kinder|primary|elementary|primaria|secondary|middle_school|secundaria|high_school|preparatoria|bachillerato|prepa|cch)[_\-\s]+([1-6])\b/i;

const SEMESTER_ORDINAL_FIRST_REGEX = new RegExp(
  `(?:(?:[,;|\\-–—]+|\\s+(?:en|para|nivel)\\s+|\\s+de\\s+)\\s*)?\\b(${ORDINAL_PATTERN})\\s*semestre(?:\\s+(?:de\\s+)?(?:preparatoria|prepa\\.?|bachillerato|bach\\.?|cch|ems|media\\s+superior|high[\\s_]+school))?\\b`,
  'gi'
);

const SEMESTER_LABEL_FIRST_REGEX =
  /(?:(?:[,;|\-–—]+|\s+(?:en|para|nivel)\s+|\s+de\s+)\s*)?\bsemestre\s+([1-6](?:er|ro|do|to|o|°|º)?|primero|primer|segundo|tercero|tercer|cuarto|quinto|sexto)(?:\s+(?:de\s+)?(?:preparatoria|prepa\.?|bachillerato|bach\.?|cch|ems|media\s+superior|high[\s_]+school))?\b/gi;

const ORDINAL_BEFORE_LEVEL_REGEX = new RegExp(
  `(?:(?:[,;|\\-–—]+|\\s+(?:en|para|nivel)\\s+|\\s+de\\s+)\\s*)?\\b(${ORDINAL_PATTERN})(?:\\s*(?:grado|a[ñn]o|grade))?(?:\\s+de)?\\s+(${LEVEL_PATTERN})(?!\\w)`,
  'gi'
);

const LEVEL_BEFORE_ORDINAL_REGEX = new RegExp(
  `(?:(?:[,;|\\-–—]+|\\s+(?:en|para|nivel)\\s+|\\s+de\\s+)\\s*)?\\b(${LEVEL_PATTERN})[\\s_\\-]+(${ORDINAL_PATTERN})(?:\\s*(?:grado|a[ñn]o|grade))?(?!\\w)`,
  'gi'
);

interface GradeMatchCandidate {
  info: CanonicalGradeInfo;
  index: number;
  length: number;
  rawMatch: string;
}

function findBestGradeMatch(input: string): GradeMatchCandidate | null {
  const text = (input || '').trim();
  if (!text) return null;

  // 1. Códigos directos de taxonomía (e.g. secondary_2, primary_4, preschool_1, high_school_3)
  const taxMatch = TAXONOMY_CODE_REGEX.exec(text);
  if (taxMatch) {
    const level = parseLevelToken(taxMatch[1]);
    const num = Number(taxMatch[2]);
    const info = level ? buildCanonicalGradeInfo(num, level) : null;
    if (info) {
      return {
        info,
        index: taxMatch.index,
        length: taxMatch[0].length,
        rawMatch: taxMatch[0],
      };
    }
  }

  const candidates: GradeMatchCandidate[] = [];

  // 2. Semestres de Preparatoria / Bachillerato / CCH (Semestres 1–6 → grados 1–3)
  for (const regex of [SEMESTER_ORDINAL_FIRST_REGEX, SEMESTER_LABEL_FIRST_REGEX]) {
    regex.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const semNum = parseOrdinalToken(m[1]);
      if (semNum && semNum >= 1 && semNum <= 6) {
        const mappedGrade = Math.ceil(semNum / 2);
        const info = buildCanonicalGradeInfo(mappedGrade, 'preparatoria');
        if (info) {
          candidates.push({
            info,
            index: m.index,
            length: m[0].length,
            rawMatch: m[0],
          });
        }
      }
    }
  }

  // 3. Forma "<ordinal> [grado/año] [de] <nivel>" (e.g. "2do de secundaria", "Segundo de Secundaria", "2.º secundaria", "2o sec")
  ORDINAL_BEFORE_LEVEL_REGEX.lastIndex = 0;
  let mOrd: RegExpExecArray | null;
  while ((mOrd = ORDINAL_BEFORE_LEVEL_REGEX.exec(text)) !== null) {
    const num = parseOrdinalToken(mOrd[1]);
    const level = parseLevelToken(mOrd[2]);
    if (num && level) {
      const info = buildCanonicalGradeInfo(num, level);
      if (info) {
        candidates.push({
          info,
          index: mOrd.index,
          length: mOrd[0].length,
          rawMatch: mOrd[0],
        });
      }
    }
  }

  // 4. Forma "<nivel> <ordinal>" (e.g. "Secundaria 2", "Primaria 5to", "CCH 1", "Sec 2")
  LEVEL_BEFORE_ORDINAL_REGEX.lastIndex = 0;
  let mLvl: RegExpExecArray | null;
  while ((mLvl = LEVEL_BEFORE_ORDINAL_REGEX.exec(text)) !== null) {
    const level = parseLevelToken(mLvl[1]);
    const num = parseOrdinalToken(mLvl[2]);
    if (num && level) {
      const info = buildCanonicalGradeInfo(num, level);
      if (info) {
        candidates.push({
          info,
          index: mLvl.index,
          length: mLvl[0].length,
          rawMatch: mLvl[0],
        });
      }
    }
  }

  if (candidates.length === 0) return null;

  // Preferir la coincidencia más específica (más larga) o la más a la derecha cuando el grado va al final del tema
  candidates.sort((a, b) => {
    if (b.index !== a.index) return b.index - a.index;
    return b.length - a.length;
  });

  return candidates[0];
}

/**
 * Normaliza cualquier variante española, inglesa, abreviada, escrita con letra o código de taxonomía
 * de un grado escolar (Preescolar 1–3, Primaria 1–6, Secundaria 1–3, Preparatoria/Bachillerato/CCH 1–3 y Semestres 1–6).
 */
export function normalizeCanonicalGrade(input: string): CanonicalGradeInfo | null {
  const match = findBestGradeMatch(input);
  return match ? match.info : null;
}

/**
 * Extrae el grado canónico desde una cadena de texto libre y devuelve el texto temático restante limpio.
 * Evita falsos positivos con ordinales matemáticos/históricos ("Ecuaciones de segundo grado" sin nivel).
 */
export function extractGradeFromText(input: string): ExtractedGradeResult {
  const raw = (input || '').trim();
  if (!raw) {
    return { grade: null, remainingText: '' };
  }

  const match = findBestGradeMatch(raw);
  if (!match) {
    return { grade: null, remainingText: raw };
  }

  const before = raw.slice(0, match.index);
  const after = raw.slice(match.index + match.length);
  const remainingText = `${before} ${after}`
    .replace(/\s+/g, ' ')
    .replace(/^[\s,;:|\-–—]+/, '')
    .replace(/[\s,;:|\-–—]+$/, '')
    .trim();

  return {
    grade: match.info,
    remainingText,
  };
}

/**
 * Normaliza texto para búsqueda: minúsculas, elimina diacríticos NFD, elimina toda puntuación
 * (¿?¡!.,:;()"'«»—–-/_ y símbolos auxiliares) y colapsa espacios en blanco.
 */
export function normalizeSearchText(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,:;()\[\]{}"'«»„“”‘’—–\-/_\\|+*~^`°ºª#%&@$=<>]+/g, ' ')
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae tokens significativos de un tema educativo eliminando artículos y preposiciones genéricas
 * mientras preserva estrictamente ordinales matemáticos/históricos y términos de dominio
 * (e.g. "Ecuaciones de segundo grado" -> ["ecuaciones", "segundo", "grado"]).
 */
export function extractMeaningfulTopicTokens(input: string): string[] {
  const normalized = normalizeSearchText(input);
  if (!normalized) return [];

  const rawTokens = normalized.split(' ').filter(Boolean);
  const meaningful = rawTokens.filter((token) => !TOPIC_STOPWORDS.has(token));

  return meaningful.length > 0 ? meaningful : rawTokens;
}

/**
 * Genera un slug determinista basado en los tokens significativos del tema.
 * Ejemplos:
 * - "las ecuaciones cuadráticas" -> "ecuaciones_cuadraticas"
 * - "Ecuaciones de segundo grado" -> "ecuaciones_segundo_grado"
 */
export function canonicalTopicSlug(input: string): string {
  return extractMeaningfulTopicTokens(input).join('_').slice(0, 72);
}
