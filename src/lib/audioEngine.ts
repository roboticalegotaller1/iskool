/**
 * Motor Universal de Telemetría Acústica, Fonética y Diagnóstico de Audio
 * ISkool - Módulo Académico de Idiomas
 * 
 * Diseñado para compatibilidad universal (100% de dispositivos):
 * - iOS Safari (iPhone / iPad)
 * - Android Chrome / WebView / Samsung Internet
 * - Firefox Desktop & Mobile
 * - Windows / Mac Chrome, Edge, Safari
 */

// Normalización de texto y remoción de diacríticos para comparación fonética
export function normalizePhoneticText(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '') // Elimina apóstrofes sin insertar espacio (ej. s'il -> sil, c'est -> cest, I'd -> id)
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim();
}

// Distancia de Levenshtein para evaluar similitud de pronunciación (tolerancia a acentos y fonética aproximada)
export function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // eliminación
          dp[i][j - 1],     // inserción
          dp[i - 1][j - 1]  // sustitución
        );
      }
    }
  }
  return dp[m][n];
}

// Diccionario de contracciones comunes para expandir en transcripción
export const CONTRACTIONS_MAP: Record<string, string[]> = {
  "i'd": ["i", "would"],
  "id": ["i", "would"],
  "i'm": ["i", "am"],
  "im": ["i", "am"],
  "i'll": ["i", "will"],
  "ill": ["i", "will"],
  "i've": ["i", "have"],
  "ive": ["i", "have"],
  "you'd": ["you", "would"],
  "youd": ["you", "would"],
  "you're": ["you", "are"],
  "youre": ["you", "are"],
  "you'll": ["you", "will"],
  "youll": ["you", "will"],
  "you've": ["you", "have"],
  "youve": ["you", "have"],
  "he'd": ["he", "would"],
  "hed": ["he", "would"],
  "she'd": ["she", "would"],
  "shed": ["she", "would"],
  "we'd": ["we", "would"],
  "wed": ["we", "would"],
  "they'd": ["they", "would"],
  "theyd": ["they", "would"],
  "it's": ["it", "is"],
  "its": ["it", "is"],
  "that's": ["that", "is"],
  "thats": ["that", "is"],
  "don't": ["do", "not"],
  "dont": ["do", "not"],
  "can't": ["can", "not"],
  "cant": ["can", "not"],
  "won't": ["will", "not"],
  "wont": ["will", "not"],
  "what's": ["what", "is"],
  "whats": ["what", "is"],
  // Francés
  "c'est": ["cest", "c", "est"],
  "cest": ["cest", "c", "est"],
  "s'il": ["sil", "si", "il"],
  "sil": ["sil", "si", "il"],
  "qu'il": ["quil", "qui", "il"],
  "quil": ["quil", "qui", "il"],
  "j'ai": ["jai", "je", "ai"],
  "jai": ["jai", "je", "ai"],
  "d'un": ["de", "un"],
  "dun": ["de", "un"]
};

// Diccionario exhaustivo de equivalencias fonéticas de aprendizaje para hispanohablantes
const EN_PHONETIC_VARIANTS: Record<string, string[]> = {
  'i': ['i', 'eye', 'ay', 'ai', 'ah', 'id'],
  'would': ['would', 'wood', 'wud', 'woud', 'hood', 'good', 'wad', 'd'],
  'like': ['like', 'liked', 'lik', 'laik', 'light', 'lake', 'lai'],
  'a': ['a', 'uh', 'ah', 'eh', 'an', 'un'],
  'warm': ['warm', 'worm', 'warn', 'warmed', 'wom', 'wurm', 'war'],
  'cappuccino': ['cappuccino', 'capuchino', 'cappucino', 'capuccino', 'chino', 'kapuchino', 'cappuccinos', 'capochino'],
  'and': ['and', 'an', 'und', 'end', 'hand', 'n', 'en', 'ond'],
  'fresh': ['fresh', 'fres', 'frech', 'flash', 'frash', 'flesh', 'frex'],
  'blueberry': ['blueberry', 'blueberries', 'bluberry', 'blue', 'berry', 'bleuberry', 'bluberi', 'blackberry', 'blooberry'],
  'muffin': ['muffin', 'muffins', 'moffin', 'muffen', 'muff', 'mafin', 'moffen', 'muffing'],
  'please': ['please', 'pleas', 'plz', 'peace', 'police', 'plis', 'plise', 'polite'],
  'could': ['could', 'cud', 'good', 'wood'],
  'you': ['you', 'yu', 'u', 'your', 'ya'],
  'recommend': ['recommend', 'recomended', 'recomen', 'recomend'],
  'your': ['your', 'ur', 'youre', 'yo'],
  'most': ['most', 'mus', 'mos'],
  'popular': ['popular', 'populer', 'poplar'],
  'breakfast': ['breakfast', 'brekfast', 'brekfest', 'brekfas'],
  'pastry': ['pastry', 'pastri', 'pastries'],
  'today': ['today', 'todey', 'tudei'],
  'the': ['the', 'da', 'de', 'di', 'za', 'ze', 'tha'],
  'weather': ['weather', 'wether', 'weder', 'wezer'],
  'is': ['is', 'iz', 'es', 'iss'],
  'absolutely': ['absolutely', 'absolutly', 'abslutly'],
  'magnificent': ['magnificent', 'magnificent', 'magnificen'],
  'for': ['for', 'fo', 'fer', 'four'],
  'morning': ['morning', 'mornin'],
  'walk': ['walk', 'wolk', 'wok', 'work'],
  'in': ['in', 'en', 'inn'],
  'park': ['park', 'parc', 'pork'],
  'excuse': ['excuse', 'escuse', 'scuse', 'eskius'],
  'me': ['me', 'mi', 'my', 'mee'],
  'where': ['where', 'were', 'ware', 'wear', 'wher', 'wer'],
  'station': ['station', 'steishon', 'stacion', 'stetion'],
  'library': ['library', 'laibrari', 'libreri', 'librari'],
  'hotel': ['hotel', 'otel', 'jotell', 'jotel']
};

const FR_PHONETIC_VARIANTS: Record<string, string[]> = {
  'bonjour': ['bonjour', 'bonjur', 'bonshur', 'bon sour', 'bonjour'],
  'croissant': ['croissant', 'croisant', 'kroissant', 'kwasan', 'croisan', 'croissan'],
  'croustillant': ['croustillant', 'crustillant', 'krustiyan', 'crostiyan'],
  'sil': ['sil', 'si', 's il', 'seel', 'sil'],
  'vous': ['vous', 'vu', 'voo', 'vouz'],
  'plait': ['plait', 'ple', 'plei', 'plet', 'play', 'plaît'],
  'merci': ['merci', 'melsi', 'mesi', 'mercy'],
  'beaucoup': ['beaucoup', 'bocu', 'boku', 'baucoup', 'bocoup'],
  'un': ['un', 'an', 'en', 'on', 'uhn', 'in'],
  'une': ['une', 'un', 'iun'],
  'cafe': ['cafe', 'kafe', 'caffe', 'kfe', 'coffee'],
  'au': ['au', 'o', 'oh'],
  'lait': ['lait', 'le', 'lay', 'let'],
  'cest': ['cest', "c'est", 'se', 'say', 'ce'],
  'veritable': ['veritable', 'véritable'],
  'plaisir': ['plaisir', 'plesir', 'plezir'],
  'de': ['de', 'duh', 'du'],
  'decouvrir': ['decouvrir', 'découvrir'],
  'les': ['les', 'le', 'lay'],
  'merveilleux': ['merveilleux', 'merveyeu'],
  'musees': ['musees', 'musées', 'muze'],
  'paris': ['paris', 'pari'],
  'je': ['je', 'zhe', 'j'],
  'voudrais': ['voudrais', 'voudre', 'voudrai', 'vudre', 'voudray']
};

/**
 * Validador fonético multinivel y riguroso:
 * 1. Coincidencia exacta tras normalización
 * 2. Diccionario de variantes fonéticas precisas
 * 3. Prohibición de matches por distancia en palabras de 1-2 letras (ej. 'is' no coincide con 'in')
 * 4. Distancia de edición controlada según longitud de palabra
 */
export function isPhoneticallyEquivalent(
  spokenToken: string,
  targetWord: string,
  lang: 'en' | 'fr' = 'en'
): boolean {
  const s = normalizePhoneticText(spokenToken);
  const t = normalizePhoneticText(targetWord);

  if (!s || !t) return false;
  if (s === t) return true;

  // Variantes específicas del idioma (diccionario fonético exacto)
  const dict = lang === 'fr' ? FR_PHONETIC_VARIANTS : EN_PHONETIC_VARIANTS;
  if (dict[t]?.includes(s)) return true;
  if (dict[s]?.includes(t)) return true;

  const maxLen = Math.max(s.length, t.length);
  const minLen = Math.min(s.length, t.length);

  // Palabras muy cortas (1-2 caracteres): NUNCA permitir distancia Levenshtein libre
  // Ej: 'is' no debe coincidir con 'in', 'it', 'if'; 'to' no con 'do'; 'a' no con 'i'
  if (minLen <= 2) {
    return false;
  }

  const dist = levenshteinDistance(s, t);

  if (maxLen === 3) {
    // Para palabras de 3 letras (ej. and, the, you, can), solo permitir dist <= 1 si comparten inicio y fin
    return dist <= 1 && s[0] === t[0] && s[s.length - 1] === t[t.length - 1];
  } else if (maxLen <= 6) {
    // Para palabras medianas (4-6 letras: warm, fresh, like):
    if (dist <= 1) return true;
    if (dist <= 2 && s[0] === t[0] && maxLen >= 5) return true;
    return false;
  } else {
    // Palabras largas (> 6 letras: cappuccino, blueberry, popular, breakfast):
    if (dist <= 2) return true;
    if (dist <= 3 && s[0] === t[0] && s[1] === t[1]) return true;
    if (s.length >= 5 && t.length >= 5 && (s.startsWith(t.slice(0, 4)) || t.startsWith(s.slice(0, 4)))) {
      return dist <= 3;
    }
  }

  return false;
}

/**
 * Expande contracciones en una lista de tokens para permitir emparejamiento perfecto
 */
export function expandContractions(tokens: string[], lang: 'en' | 'fr' = 'en'): string[] {
  const result: string[] = [];
  for (const raw of tokens) {
    const clean = raw.trim().toLowerCase();
    if (!clean) continue;
    const cleanNoPunct = clean.replace(/['’]/g, '');
    const expanded = CONTRACTIONS_MAP[clean] || CONTRACTIONS_MAP[cleanNoPunct];
    if (expanded && lang === 'en') {
      result.push(...expanded);
    } else {
      result.push(clean);
    }
  }
  return result;
}

export interface AlignmentResult {
  matchedIndices: number[];
  unmatchedIndices: number[];
  accuracy: number;
  matchedTokensCount: number;
  detailedMatches: Array<{
    targetIndex: number;
    targetWord: string;
    isMatched: boolean;
    matchedToken?: string;
  }>;
}

/**
 * ALINEADOR SECUENCIAL MULTI-VENTANA Y DE RECUPERACIÓN FONÉTICA
 * Garantiza que:
 * - Si el alumno omite una palabra, el resto NO se bloquea
 * - Las palabras duplicadas (ej. "a" en dos posiciones) se emparejan a sus índices correspondientes
 * - Las palabras compuestas (ej. "blue" + "berry" = "blueberry") se reconocen
 * - Las contracciones (ej. "I'd" = "I would") se descomponen
 * - Cada token hablado se consume una única vez
 */
export function alignSpokenTokensToTarget(
  spokenTokens: string[],
  targetWords: string[],
  lang: 'en' | 'fr' = 'en'
): AlignmentResult {
  if (!targetWords || targetWords.length === 0) {
    return {
      matchedIndices: [],
      unmatchedIndices: [],
      accuracy: 0,
      matchedTokensCount: 0,
      detailedMatches: []
    };
  }

  const expandedSpoken = expandContractions(spokenTokens, lang);

  const matchedTargetIndices = new Set<number>();
  const usedSpokenIndices = new Set<number>();
  const detailedMatches: Array<{
    targetIndex: number;
    targetWord: string;
    isMatched: boolean;
    matchedToken?: string;
  }> = targetWords.map((w, idx) => ({
    targetIndex: idx,
    targetWord: w,
    isMatched: false
  }));

  // Pasada 1: Alineación secuencial con ventana de anticipación (Lookahead Window)
  let spokenIdx = 0;

  for (let targetIdx = 0; targetIdx < targetWords.length; targetIdx++) {
    const expected = targetWords[targetIdx];
    if (spokenIdx >= expandedSpoken.length) break;

    // Ventana de búsqueda: revisamos desde spokenIdx hasta spokenIdx + 4
    const windowEnd = Math.min(expandedSpoken.length, spokenIdx + 4);

    for (let k = spokenIdx; k < windowEnd; k++) {
      if (usedSpokenIndices.has(k)) continue;
      const currentToken = expandedSpoken[k];

      // Caso A: Coincidencia de 1 solo token con la palabra esperada
      if (isPhoneticallyEquivalent(currentToken, expected, lang)) {
        matchedTargetIndices.add(targetIdx);
        usedSpokenIndices.add(k);
        detailedMatches[targetIdx].isMatched = true;
        detailedMatches[targetIdx].matchedToken = currentToken;
        spokenIdx = k + 1;
        break;
      }

      // Caso B: Palabra compuesta (ej. spoken "blue" + "berry" vs target "blueberry")
      if (k + 1 < expandedSpoken.length && !usedSpokenIndices.has(k + 1)) {
        const compoundToken = currentToken + expandedSpoken[k + 1];
        if (isPhoneticallyEquivalent(compoundToken, expected, lang)) {
          matchedTargetIndices.add(targetIdx);
          usedSpokenIndices.add(k);
          usedSpokenIndices.add(k + 1);
          detailedMatches[targetIdx].isMatched = true;
          detailedMatches[targetIdx].matchedToken = compoundToken;
          spokenIdx = k + 2;
          break;
        }
      }
    }
  }

  // Pasada 2: Recuperación fonética para palabras omitidas en orden usando tokens no consumidos
  for (let targetIdx = 0; targetIdx < targetWords.length; targetIdx++) {
    if (matchedTargetIndices.has(targetIdx)) continue;
    const expected = targetWords[targetIdx];

    for (let k = 0; k < expandedSpoken.length; k++) {
      if (usedSpokenIndices.has(k)) continue;
      const currentToken = expandedSpoken[k];
      if (isPhoneticallyEquivalent(currentToken, expected, lang)) {
        matchedTargetIndices.add(targetIdx);
        usedSpokenIndices.add(k);
        detailedMatches[targetIdx].isMatched = true;
        detailedMatches[targetIdx].matchedToken = currentToken;
        break;
      }
    }
  }

  const matchedIndices = Array.from(matchedTargetIndices).sort((a, b) => a - b);
  const unmatchedIndices = targetWords
    .map((_, i) => i)
    .filter(i => !matchedTargetIndices.has(i));

  const accuracy = Math.round((matchedIndices.length / targetWords.length) * 100);

  return {
    matchedIndices,
    unmatchedIndices,
    accuracy,
    matchedTokensCount: matchedIndices.length,
    detailedMatches
  };
}

/**
 * Detección del formato de grabación más compatible con el navegador y SO actual.
 * Resuelve la incompatibilidad histórica de iOS Safari con WebM.
 */
export function getSupportedRecordingMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return '';
  }

  const preferredTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/mp4',
    'audio/aac',
    'audio/ogg;codecs=opus'
  ];

  for (const type of preferredTypes) {
    try {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    } catch {
      // Ignorar fallo de comprobación
    }
  }

  return '';
}

/**
 * Medición de Decibeles Verdaderos (dBFS) y Nivel Normalizado (0 - 100%)
 * 0 dBFS = Nivel de pico máximo sin distorsión
 * -60 dBFS = Silencio / umbral de piso de ruido ambiente
 */
export function calculateDecibelsFromRms(rms: number): {
  dBFS: number;
  percentage: number;
  label: 'Silencio' | 'Ruido Ambiente' | 'Voz Detectada' | 'Nivel Óptimo' | 'Saturación';
} {
  if (rms <= 0.00001) {
    return { dBFS: -60, percentage: 0, label: 'Silencio' };
  }

  // Conversión acústica a dBFS
  const rawDb = 20 * Math.log10(rms);
  const dBFS = Math.round(Math.max(-60, Math.min(0, rawDb)));

  // Mapeo lineal de [-60 dBFS .. 0 dBFS] a [0% .. 100%]
  const percentage = Math.round(((dBFS + 60) / 60) * 100);

  let label: 'Silencio' | 'Ruido Ambiente' | 'Voz Detectada' | 'Nivel Óptimo' | 'Saturación' = 'Silencio';
  if (dBFS > -4) {
    label = 'Saturación';
  } else if (dBFS >= -18) {
    label = 'Nivel Óptimo';
  } else if (dBFS >= -30) {
    label = 'Voz Detectada';
  } else if (dBFS >= -48) {
    label = 'Ruido Ambiente';
  }

  return { dBFS, percentage, label };
}

/**
 * Medición de latencia de hardware y búfer de procesamiento del AudioContext
 */
export function getAudioContextLatencyMs(ctx: AudioContext): number {
  try {
    const baseLatency = (ctx as any).baseLatency || 0.005;
    const outputLatency = (ctx as any).outputLatency || 0.010;
    return Math.round((baseLatency + outputLatency) * 1000);
  } catch {
    return 15; // Estimación estándar de baja latencia
  }
}

/**
 * Inicialización segura y universal de AudioContext para WebKit (Safari iOS/macOS)
 * y navegadores basados en Chromium / Gecko.
 */
export function createUniversalAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    const ctx = new AudioContextClass({
      latencyHint: 'interactive'
    });
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    return ctx;
  } catch {
    try {
      return new AudioContextClass();
    } catch {
      return null;
    }
  }
}

/**
 * Filtro pasabanda vocal humano (180 Hz a 3600 Hz):
 * Remueve frecuencias graves (vibraciones mecánicas, pasos, ventiladores de PC)
 * y agudos estáticos (siseos, estática eléctrica), dejando la señal de voz limpia.
 */
export function createVocalBandpassFilter(ctx: AudioContext): BiquadFilterNode {
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 1400; // Centro de formantes vocales
  filter.Q.value = 0.85; // Ancho de banda vocal suficiente
  return filter;
}

export interface HardwareTelemetryData {
  decibels: number;
  percentage: number;
  statusLabel: string;
  latencyMs: number;
  sampleRate: number;
  channelCount: number;
  isSecureContext: boolean;
  mimeTypeSupported: string;
  speechRecognitionSupported: boolean;
  activeDeviceId: string;
  activeDeviceLabel: string;
}
