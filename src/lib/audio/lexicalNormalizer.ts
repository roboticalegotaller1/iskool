/**
 * Módulo de Normalización Léxica, Temporal y Acústica para Español Neutro Mexicano (ISkool)
 * Convierte fechas, años, números romanos, abreviaturas históricas y símbolos
 * a texto fonético ortográfico extendido determinista.
 */

// =============================================================================
// TABLAS DE CONVERSIÓN CARDINAL EN ESPAÑOL
// =============================================================================

const UNITS: Record<number, string> = {
  0: 'cero',
  1: 'uno',
  2: 'dos',
  3: 'tres',
  4: 'cuatro',
  5: 'cinco',
  6: 'seis',
  7: 'siete',
  8: 'ocho',
  9: 'nueve',
  10: 'diez',
  11: 'once',
  12: 'doce',
  13: 'trece',
  14: 'catorce',
  15: 'quince',
  16: 'dieciséis',
  17: 'diecisiete',
  18: 'dieciocho',
  19: 'diecinueve',
  20: 'veinte',
  21: 'veintiuno',
  22: 'veintidós',
  23: 'veintitrés',
  24: 'veinticuatro',
  25: 'veinticinco',
  26: 'veintiséis',
  27: 'veintisiete',
  28: 'veintiocho',
  29: 'veintinueve'
};

const TENS: Record<number, string> = {
  30: 'treinta',
  40: 'cuarenta',
  50: 'cincuenta',
  60: 'sesenta',
  70: 'setenta',
  80: 'ochenta',
  90: 'noventa'
};

const HUNDREDS: Record<number, string> = {
  100: 'cien',
  200: 'doscientos',
  300: 'trescientos',
  400: 'cuatrocientos',
  500: 'quinientos',
  600: 'seiscientos',
  700: 'setecientos',
  800: 'ochocientos',
  900: 'novecientos'
};

/**
 * Convierte un número entero del 0 al 9999 a palabras en español mexicano.
 */
export function numberToSpanishWords(n: number): string {
  if (n < 0 || !Number.isInteger(n)) return String(n);
  if (n <= 29) return UNITS[n];

  if (n < 100) {
    const tensDigit = Math.floor(n / 10) * 10;
    const unitDigit = n % 10;
    if (unitDigit === 0) return TENS[tensDigit];
    return `${TENS[tensDigit]} y ${UNITS[unitDigit]}`;
  }

  if (n === 100) return 'cien';

  if (n < 1000) {
    const hundredsDigit = Math.floor(n / 100) * 100;
    const remainder = n % 100;
    const hundredsWord = hundredsDigit === 100 ? 'ciento' : HUNDREDS[hundredsDigit];
    if (remainder === 0) return HUNDREDS[hundredsDigit];
    return `${hundredsWord} ${numberToSpanishWords(remainder)}`;
  }

  if (n < 10000) {
    const thousandsDigit = Math.floor(n / 1000);
    const remainder = n % 1000;
    const thousandsWord = thousandsDigit === 1 ? 'mil' : `${UNITS[thousandsDigit]} mil`;
    if (remainder === 0) return thousandsWord;
    return `${thousandsWord} ${numberToSpanishWords(remainder)}`;
  }

  return String(n);
}

/**
 * Convierte un año de 4 dígitos (1000 a 2099) a su expresión hablada en español.
 * Erradica lecturas anglicadas como "dieciocho diez" -> "mil ochocientos diez".
 */
export function yearToSpanishWords(year: number): string {
  return numberToSpanishWords(year);
}

// =============================================================================
// NÚMEROS ROMANOS EN CONTEXTO HISTÓRICO
// =============================================================================

const ROMAN_CENTURIES: Record<string, string> = {
  I: 'primero',
  II: 'segundo',
  III: 'tercero',
  IV: 'cuarto',
  V: 'quinto',
  VI: 'sexto',
  VII: 'séptimo',
  VIII: 'octavo',
  IX: 'noveno',
  X: 'décimo',
  XI: 'once',
  XII: 'doce',
  XIII: 'trece',
  XIV: 'catorce',
  XV: 'quince',
  XVI: 'dieciséis',
  XVII: 'diecisiete',
  XVIII: 'dieciocho',
  XIX: 'diecinueve',
  XX: 'veinte',
  XXI: 'veintiuno'
};

const ROMAN_REGNALS: Record<string, string> = {
  I: 'Primero',
  II: 'Segundo',
  III: 'Tercero',
  IV: 'Cuarto',
  V: 'Quinto',
  VI: 'Sexto',
  VII: 'Séptimo',
  VIII: 'Octavo',
  IX: 'Noveno',
  X: 'Décimo',
  XI: 'Once',
  XII: 'Doce',
  XIII: 'Trece',
  XIV: 'Catorce',
  XV: 'Quince',
  XVI: 'Dieciséis'
};

// =============================================================================
// NORMALIZADOR LÉXICO PRINCIPAL
// =============================================================================

/**
 * Normaliza textos en español mexicano para motores de síntesis de voz:
 * 1. Expande fechas compuestas completas a palabras (ej. 16 de septiembre de 1810).
 * 2. Transforma años aislados y rangos históricos (1000-2099).
 * 3. Expande siglos y nombres regnales romanos.
 * 4. Normaliza símbolos técnicos y métricos (%, km, m.s.n.m.).
 * 5. Expande abreviaturas históricas, eclesiásticas y títulos.
 * 6. Preserva la entonación con signos de interrogación y admiración de apertura.
 */
export function normalizeMexicanSpanishText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let result = text;

  // 1. Limpieza de sintaxis markdown y enlaces de bóveda
  result = result
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/[*_#`~>]/g, '')
    .trim();

  // 2. Fechas compuestas en español: ej. "16 de septiembre de 1810", "1 de enero del 2024"
  const dateRegex = /\b(0?[1-9]|[12][0-9]|3[01])\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)(?:\s+de|\s+del)?\s+(\d{4})\b/gi;
  result = result.replace(dateRegex, (_match, dayStr, month, yearStr) => {
    const day = parseInt(dayStr, 10);
    const year = parseInt(yearStr, 10);
    const dayWord = day === 1 ? 'primero' : numberToSpanishWords(day);
    const yearWord = (year >= 1000 && year <= 2099) ? yearToSpanishWords(year) : numberToSpanishWords(year);
    return `${dayWord} de ${month.toLowerCase()} de ${yearWord}`;
  });

  // Fechas sin año: ej. "16 de septiembre", "1 de mayo"
  const monthDayRegex = /\b(0?[1-9]|[12][0-9]|3[01])\s+de\s+(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|setiembre|octubre|noviembre|diciembre)\b/gi;
  result = result.replace(monthDayRegex, (_match, dayStr, month) => {
    const day = parseInt(dayStr, 10);
    const dayWord = day === 1 ? 'primero' : numberToSpanishWords(day);
    return `${dayWord} de ${month.toLowerCase()}`;
  });

  // 3. Rangos de años históricos: ej. "1810-1821", "1753 - 1811", "1910 a 1920"
  const yearRangeRegex = /\b(1[0-9]{3}|20[0-9]{2})\s*[-–—]\s*(1[0-9]{3}|20[0-9]{2})\b/g;
  result = result.replace(yearRangeRegex, (_match, y1, y2) => {
    const year1 = yearToSpanishWords(parseInt(y1, 10));
    const year2 = yearToSpanishWords(parseInt(y2, 10));
    return `${year1} a ${year2}`;
  });

  // 4. Años históricos aislados o contextuales (1000 a 2099)
  // Se transforman años precedidos de palabras comunes o entre paréntesis/puntuación
  const contextualYearRegex = /\b(en|año|hacia|desde|hasta|durante|del?)\s+(1[0-9]{3}|20[0-9]{2})\b/gi;
  result = result.replace(contextualYearRegex, (_match, prep, yearStr) => {
    const yearWord = yearToSpanishWords(parseInt(yearStr, 10));
    return `${prep} ${yearWord}`;
  });

  // Cualquier año de 4 dígitos restante entre 1000 y 2099 delimitado por fronteras de palabra
  const standaloneYearRegex = /\b(1[0-9]{3}|20[0-9]{2})\b/g;
  result = result.replace(standaloneYearRegex, (_match, yearStr) => {
    return yearToSpanishWords(parseInt(yearStr, 10));
  });

  // 5. Siglos en números romanos: "Siglo XIX" -> "Siglo diecinueve"
  const centuryRegex = /\b([Ss]iglo|[Ss]iglos)\s+([IVXLCDM]+)\b/g;
  result = result.replace(centuryRegex, (match, word, roman) => {
    const upperRoman = roman.toUpperCase();
    if (ROMAN_CENTURIES[upperRoman]) {
      return `${word} ${ROMAN_CENTURIES[upperRoman]}`;
    }
    return match;
  });

  // 6. Reyes, Emperadores, Papas y Líderes con Ordinales
  const regnalNames = [
    'Carlos', 'Felipe', 'Fernando', 'Luis', 'Alfonso', 'Enrique', 'Pedro', 'Sancho',
    'Juan', 'Jaime', 'Moctezuma', 'Inocencio', 'Alejandro', 'Octavio', 'Pío', 'Pio',
    'León', 'Leon', 'Benedicto', 'Gregorio', 'Pablo', 'Juan Pablo', 'Urbano', 'Clemente'
  ];
  const regnalRegex = new RegExp(`\\b(${regnalNames.join('|')})\\s+([IVXLCDM]+)\\b`, 'gi');
  result = result.replace(regnalRegex, (match, name, roman) => {
    const upperRoman = roman.toUpperCase();
    if (ROMAN_REGNALS[upperRoman]) {
      return `${name} ${ROMAN_REGNALS[upperRoman]}`;
    }
    return match;
  });

  // 7. Símbolos, Unidades Métricas y Geográficas
  const symbolReplacements: Array<{ regex: RegExp; replace: string }> = [
    { regex: /(\d+)\s*%/g, replace: '$1 por ciento' },
    { regex: /%/g, replace: ' por ciento' },
    { regex: /\bm\.s\.n\.m\./gi, replace: 'metros sobre el nivel del mar' },
    { regex: /\bmsnm\b/gi, replace: 'metros sobre el nivel del mar' },
    { regex: /\bkm\/h\b/gi, replace: 'kilómetros por hora' },
    { regex: /\bkm²\b/gi, replace: 'kilómetros cuadrados' },
    { regex: /\bkm2\b/gi, replace: 'kilómetros cuadrados' },
    { regex: /\bm²\b/gi, replace: 'metros cuadrados' },
    { regex: /\bm2\b/gi, replace: 'metros cuadrados' },
    { regex: /\bkm\b/gi, replace: 'kilómetros' },
    { regex: /\bha\b/gi, replace: 'hectáreas' },
    { regex: /\bno\.\s*(\d+)/gi, replace: 'número $1' },
    { regex: /\bNo\.\s*(\d+)/gi, replace: 'número $1' },
    { regex: /\bNúm\.\s*(\d+)/gi, replace: 'número $1' },
    { regex: /\bart\.\s*(\d+)/gi, replace: 'artículo $1' },
    { regex: /\bArt\.\s*(\d+)/gi, replace: 'artículo $1' },
    { regex: /\bpág\.\s*(\d+)/gi, replace: 'página $1' },
    { regex: /\bpágs\.\s*(\d+)/gi, replace: 'páginas $1' },
    { regex: /\bvol\.\s*(\d+)/gi, replace: 'volumen $1' }
  ];
  for (const item of symbolReplacements) {
    result = result.replace(item.regex, item.replace);
  }

  // 8. Abreviaturas Históricas, Eclesiásticas y Militares
  const abbreviations: Array<{ regex: RegExp; replace: string }> = [
    { regex: /\bGral\./gi, replace: 'General' },
    { regex: /\bCnel\./gi, replace: 'Coronel' },
    { regex: /\bCap\./gi, replace: 'Capitán' },
    { regex: /\bTte\./gi, replace: 'Teniente' },
    { regex: /\bLic\./gi, replace: 'Licenciado' },
    { regex: /\bDr\./gi, replace: 'Doctor' },
    { regex: /\bDra\./gi, replace: 'Doctora' },
    { regex: /\bDn\./gi, replace: 'Don' },
    { regex: /\bDña\./gi, replace: 'Doña' },
    { regex: /\bSta\./gi, replace: 'Santa' },
    { regex: /\bSto\./gi, replace: 'Santo' },
    { regex: /\bFray\b/gi, replace: 'Fray' },
    { regex: /\ba\.\s*C\./gi, replace: 'antes de Cristo' },
    { regex: /\ba\.C\./gi, replace: 'antes de Cristo' },
    { regex: /\bd\.\s*C\./gi, replace: 'después de Cristo' },
    { regex: /\bd\.C\./gi, replace: 'después de Cristo' }
  ];
  for (const item of abbreviations) {
    result = result.replace(item.regex, item.replace);
  }

  // 9. Puntuación Expresiva Latina (Apertura de ¿ e ¡)
  // Asegura que las preguntas lleven signo de apertura para una correcta entonación
  result = result.replace(/(^|[.?!\n;]\s*)([^.?!\n¿]+)(\?)/g, '$1¿$2$3');
  // Asegura que las exclamaciones lleven signo de apertura
  result = result.replace(/(^|[.?!\n;]\s*)([^.?!¿¡\n]+)(!)/g, '$1¡$2$3');

  return result;
}
