/**
 * Motor de Configuración, Prosodia y Selección de Voz para Avatares Históricos Vivos (ISkool)
 * Arquitectura DSP & SSML Dinámico de Alta Fidelidad (Zero-Token Cost).
 * Nivel 3: Bloqueo Anti-Castellano, Normalizador Léxico Latino, Matriz de 30 Voces por Cohorte Etaria y Narradores Gamificados.
 */

import { normalizeMexicanSpanishText } from './audio/lexicalNormalizer';
import { applyPhoneticSubstitutions } from './audio/phoneticDictionary';
import {
  getLanguagePipeline,
  resolveTargetLocale,
  getDefaultVoicesForLocale,
  ILanguagePipeline,
  SupportedLocale,
  LanguageCode,
  SSMLParams
} from './audio';

export {
  getLanguagePipeline,
  resolveTargetLocale,
  getDefaultVoicesForLocale
};
export type {
  ILanguagePipeline,
  SupportedLocale,
  LanguageCode,
  SSMLParams
};


export type HistoricalEra = 'virreinal' | 'independencia' | 'revolucion' | 'reforma';
export type OratoricalIntention = 'arenga' | 'philosophical' | 'rhetorical' | 'solemn_narrative';

export type HistoricalAgeCohort = 
  | 'child_male'
  | 'child_female'
  | 'teen_male'
  | 'teen_female'
  | 'young_adult_male'
  | 'young_adult_female'
  | 'adult_male'
  | 'adult_female'
  | 'elder_male'
  | 'elder_female';

export interface VoiceMatrixOption {
  id: string;
  label: string;
  prosodyRate: string;
  prosodyPitch: string;
  description: string;
}

export interface HistoricalPersonaProfile {
  name: string;
  gender: 'female' | 'male';
  era: HistoricalEra;
  cohort: HistoricalAgeCohort;
  voiceId: string;
  expressStyle: 'calm' | 'serious';
  styleDegree: number;
  prosodyRate: string;
  prosodyPitch: string;
  pitchContour: string;
  commaPauseMs: number;
  sentencePauseMs: number;
  solemnityLevel: number;
  description: string;
}

export type NarratorMode = 'epic_chronist' | 'wisdom_guide' | 'time_chrononaut';

export interface NarratorVoiceProfile {
  id: NarratorMode;
  name: string;
  voiceId: string;
  prosodyRate: string;
  prosodyPitch: string;
  pauseMs: number;
  description: string;
  roleTag: string;
}

// =============================================================================
// PILAR 3: MATRIZ DE 30 VOCES HISTÓRICAS LATINOAMERICANAS (3 POR COHORTE)
// =============================================================================
export const HISTORICAL_VOICE_MATRIX: Record<HistoricalAgeCohort, [VoiceMatrixOption, VoiceMatrixOption, VoiceMatrixOption]> = {
  child_male: [
    { id: 'es-MX-PelayoNeural', label: 'Pelayo (México) · Opción A', prosodyRate: '+4%', prosodyPitch: '+12%', description: 'Voz nativa de niño mexicano, vivaz e intrépido' },
    { id: 'es-MX-MarinaNeural', label: 'Marina (Modulada) · Opción B', prosodyRate: '+3%', prosodyPitch: '+18%', description: 'Modulación infantil vivaz de timbre despierto' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Infantil) · Opción C', prosodyRate: '+6%', prosodyPitch: '+20%', description: 'Cadencia ágil infantil, curioso y despierto' }
  ],
  child_female: [
    { id: 'es-MX-MarinaNeural', label: 'Marina (México) · Opción A', prosodyRate: '+3%', prosodyPitch: '+10%', description: 'Voz nativa de niña mexicana, dulce y vivaz' },
    { id: 'es-MX-LarissaNeural', label: 'Larissa (México) · Opción B', prosodyRate: '+2%', prosodyPitch: '+12%', description: 'Timbre dulce infantil y reflexivo' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Curiosa) · Opción C', prosodyRate: '+5%', prosodyPitch: '+16%', description: 'Curiosa, expresiva, entusiasta y participativa' }
  ],
  teen_male: [
    { id: 'es-MX-CecilioNeural', label: 'Cecilio (México) · Opción A', prosodyRate: '+1%', prosodyPitch: '+4%', description: 'Joven cadete / prócer mexicano, enérgico y leal' },
    { id: 'es-PE-AlexNeural', label: 'Alex (Perú) · Opción B', prosodyRate: '+0%', prosodyPitch: '+2%', description: 'Joven latino neutral, voz clara, limpia y fresca' },
    { id: 'es-US-AlonsoNeural', label: 'Alonso (Latino) · Opción C', prosodyRate: '+2%', prosodyPitch: '+3%', description: 'Joven dinámico, timbre brillante y decidido' }
  ],
  teen_female: [
    { id: 'es-MX-NuriaNeural', label: 'Nuria (México) · Opción A', prosodyRate: '+1%', prosodyPitch: '+3%', description: 'Joven mexicana, elocuente y brillante' },
    { id: 'es-PE-CamilaNeural', label: 'Camila (Perú) · Opción B', prosodyRate: '+0%', prosodyPitch: '+2%', description: 'Joven neutral, dulce y reflexiva' },
    { id: 'es-US-PalomaNeural', label: 'Paloma (Latina) · Opción C', prosodyRate: '+2%', prosodyPitch: '+4%', description: 'Joven expresiva, templada y decidida' }
  ],
  young_adult_male: [
    { id: 'es-MX-LibertoNeural', label: 'Liberto (México) · Opción A', prosodyRate: '-3%', prosodyPitch: '-1Hz', description: 'Firme, ideal para caudillos y próceres insurgentes jóvenes' },
    { id: 'es-MX-YagoNeural', label: 'Yago (México) · Opción B', prosodyRate: '-2%', prosodyPitch: '-1Hz', description: 'Voz templada, reflexiva y de convicción patriótica' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Colombia) · Opción C', prosodyRate: '-2%', prosodyPitch: '+0Hz', description: 'Latino neutro, dicción elegante y caballerosa' }
  ],
  young_adult_female: [
    { id: 'es-MX-BeatrizNeural', label: 'Beatriz (México) · Opción A', prosodyRate: '-3%', prosodyPitch: '+0Hz', description: 'Apasionada, líder patriótica, timbre claro y firme' },
    { id: 'es-MX-CandelaNeural', label: 'Candela (México) · Opción B', prosodyRate: '-3%', prosodyPitch: '+1Hz', description: 'Heroica, decidida, dicción pulcra y valiente' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Colombia) · Opción C', prosodyRate: '-2%', prosodyPitch: '+1Hz', description: 'Armónica, cercana, diplomática y culta' }
  ],
  adult_male: [
    { id: 'es-MX-JorgeNeural', label: 'Jorge (México) · Opción A', prosodyRate: '-5%', prosodyPitch: '-2Hz', description: 'Grave, oratoria militar o de estadista republicano' },
    { id: 'es-MX-GerardoNeural', label: 'Gerardo (México) · Opción B', prosodyRate: '-4%', prosodyPitch: '-2Hz', description: 'Autoritaria, solemne, peso institucional y docto' },
    { id: 'es-MX-LibertoNeural', label: 'Liberto (Maduro) · Opción C', prosodyRate: '-5%', prosodyPitch: '-3Hz', description: 'Madurez serena, temple patriótico inalterable' }
  ],
  adult_female: [
    { id: 'es-MX-DaliaNeural', label: 'Dalia (México) · Opción A', prosodyRate: '-5%', prosodyPitch: '-2Hz', description: 'Voz de adulto mujer matrona de la patria, dignificada, solemne y noble' },
    { id: 'es-MX-RenataNeural', label: 'Renata (México) · Opción B', prosodyRate: '-4%', prosodyPitch: '-1Hz', description: 'Intelectual, analítica, líder histórica y estratega' },
    { id: 'es-MX-CarlotaNeural', label: 'Carlota (México) · Opción C', prosodyRate: '-6%', prosodyPitch: '-2Hz', description: 'Matrona venerable, resonancia media, firmeza y calidez' }
  ],
  elder_male: [
    { id: 'es-MX-CandidoNeural', label: 'Cándido (México) · Opción A', prosodyRate: '-7%', prosodyPitch: '-3Hz', description: 'Anciano sabio, venerable, pausado y honorable' },
    { id: 'es-MX-LucianoNeural', label: 'Luciano (México) · Opción B', prosodyRate: '-8%', prosodyPitch: '-4Hz', description: 'Voz veterana, textura curtida, patriarca republicano' },
    { id: 'es-MX-JorgeNeural', label: 'Jorge (Solemne) · Opción C', prosodyRate: '-8%', prosodyPitch: '-4Hz', description: 'Tempo solemne de padre de la patria y mentor' }
  ],
  elder_female: [
    { id: 'es-MX-CarlotaNeural', label: 'Carlota (Venerable) · Opción A', prosodyRate: '-6%', prosodyPitch: '-2Hz', description: 'Voz de matriarca venerable, pausada, sabia y profunda' },
    { id: 'es-MX-DaliaNeural', label: 'Dalia (Serena) · Opción B', prosodyRate: '-7%', prosodyPitch: '-3Hz', description: 'Estilo sereno, testimonio vivo y memoria venerable' },
    { id: 'es-MX-RenataNeural', label: 'Renata (Consejera) · Opción C', prosodyRate: '-6%', prosodyPitch: '-2Hz', description: 'Tono reposado de consejera histórica ilustrada' }
  ]
};

// =============================================================================
// PILAR 4: VOCES DE NARRADORES GAMIFICADOS (ISKOOL QUESTS)
// =============================================================================
export const NARRATOR_VOICE_PROFILES: Record<NarratorMode, NarratorVoiceProfile> = {
  epic_chronist: {
    id: 'epic_chronist',
    name: 'El Cronista Épico',
    voiceId: 'es-MX-GerardoNeural',
    prosodyRate: '+4%',
    prosodyPitch: '+1Hz',
    pauseMs: 220,
    description: 'Relato apasionado estilo cinemática o tráiler histórico de batallas y gloria',
    roleTag: 'Acción / Batallas / Momentos Clave'
  },
  wisdom_guide: {
    id: 'wisdom_guide',
    name: 'La Guía del Saber',
    voiceId: 'es-MX-BeatrizNeural',
    prosodyRate: '+2%',
    prosodyPitch: '+1Hz',
    pauseMs: 250,
    description: 'Retroalimentación de misiones, logros pedagógicos y explicaciones didácticas',
    roleTag: 'Misiones / Desafíos / Logros Gamificados'
  },
  time_chrononaut: {
    id: 'time_chrononaut',
    name: 'El Crononauta / Investigador del Tiempo',
    voiceId: 'es-MX-LibertoNeural',
    prosodyRate: '-2%',
    prosodyPitch: '-1Hz',
    pauseMs: 320,
    description: 'Misterio, enigmas y datos curiosos que despiertan la fascinación del alumno',
    roleTag: 'Misterio / Datos Curiosos / Archivos Secretos'
  }
};

// =============================================================================
// PILAR 2: NORMALIZADOR LÉXICO, FONÉTICO Y DE ENTONACIÓN HISTÓRICO-LATINA
// =============================================================================
export function normalizeLatinHistoricalPhonetics(text: string): string {
  const lexical = normalizeMexicanSpanishText(text);
  return applyPhoneticSubstitutions(lexical, 'plain');
}


/**
 * Calcula con rigor la edad al momento de su muerte a partir de cadenas de fechas (Frontmatter: birthOrEstablishment - deathOrPresentState)
 */
export function calculateAgeAtDeathFromDates(birthStr?: string, deathStr?: string): number | undefined {
  if (!birthStr || !deathStr) return undefined;

  // Extraer años de 4 dígitos (ej: 1753, 1811)
  const birthYearMatch = birthStr.match(/\b(1[4-9]\d{2}|20\d{2})\b/);
  const deathYearMatch = deathStr.match(/\b(1[4-9]\d{2}|20\d{2})\b/);

  if (birthYearMatch && deathYearMatch) {
    const bYear = parseInt(birthYearMatch[1], 10);
    const dYear = parseInt(deathYearMatch[1], 10);
    if (dYear >= bYear && (dYear - bYear) <= 120) {
      return dYear - bYear;
    }
  }
  return undefined;
}

/**
 * Infiere automáticamente la etapa etaria (cohorte) del personaje en función de su edad al morir o edad histórica
 */
export function inferCharacterAgeCohort(characterName: string, historicalAge?: number, birthOrDeathDates?: string): HistoricalAgeCohort {
  const norm = characterName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const gender = getPersonaGender(characterName);

  // Si no se proporcionó un número pero sí las fechas en formato "birth - death"
  let resolvedAge = historicalAge;
  if (resolvedAge === undefined && birthOrDeathDates) {
    const parts = birthOrDeathDates.split('-');
    if (parts.length >= 2) {
      resolvedAge = calculateAgeAtDeathFromDates(parts[0], parts[1]);
    }
  }

  if (typeof resolvedAge === 'number') {
    if (resolvedAge <= 12) return gender === 'female' ? 'child_female' : 'child_male';
    if (resolvedAge <= 20) return gender === 'female' ? 'teen_female' : 'teen_male';
    if (resolvedAge <= 35) return gender === 'female' ? 'young_adult_female' : 'young_adult_male';
    if (resolvedAge <= 55) return gender === 'female' ? 'adult_female' : 'adult_male';
    return gender === 'female' ? 'elder_female' : 'elder_male';
  }

  // Detección contextual por nombre y biografía histórica
  if (norm.includes('nino') || norm.includes('cadete') || norm.includes('escutia') || norm.includes('suarez') || norm.includes('montes de oca') || norm.includes('marquez') || norm.includes('barrera') || norm.includes('melgar')) {
    return 'teen_male';
  }
  if (norm.includes('hidalgo') || norm.includes('candido') || norm.includes('anciano') || norm.includes('abuelo')) {
    return 'elder_male';
  }
  if (norm.includes('zapata') || norm.includes('cuauhtemoc') || norm.includes('allende') || norm.includes('aldama') || norm.includes('madero')) {
    return 'young_adult_male';
  }
  if (norm.includes('villa') || norm.includes('morelos') || norm.includes('juarez') || norm.includes('guerrero') || norm.includes('carranza') || norm.includes('diaz')) {
    return 'adult_male';
  }
  if (norm.includes('leona') || norm.includes('sor juana') || norm.includes('carmen serdan') || norm.includes('malinche') || norm.includes('malintzin')) {
    return 'young_adult_female';
  }
  if (norm.includes('josefa') || norm.includes('corregidora') || norm.includes('gertrudis') || norm.includes('frida')) {
    return 'adult_female';
  }
  if (norm.includes('abuela') || norm.includes('anciana') || norm.includes('venerable') || norm.includes('matriarca')) {
    return 'elder_female';
  }

  return gender === 'female' ? 'adult_female' : 'adult_male';
}

/**
 * Función de Selección Inteligente de Voz por Personaje, Edad y Variante (A, B, C)
 */
export function resolveCharacterVoice(
  characterName: string, 
  historicalAge?: number, 
  variantIndex: 0 | 1 | 2 = 0,
  birthOrDeathDates?: string
): VoiceMatrixOption {
  const cohort = inferCharacterAgeCohort(characterName, historicalAge, birthOrDeathDates);
  const cohortVoices = HISTORICAL_VOICE_MATRIX[cohort];
  const idx = Math.min(2, Math.max(0, variantIndex));
  return cohortVoices[idx];
}

/**
 * Determina el género del personaje
 */
export function getPersonaGender(characterName?: string): 'female' | 'male' {
  if (!characterName) return 'female';
  const norm = characterName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const femaleKeywords = [
    'josefa', 'corregidora', 'leona', 'vicario', 'juana', 'sor juana', 
    'gertrudis', 'bocanegra', 'mariana', 'rodriguez', 'carmen', 'serdan', 
    'frida', 'kahlo', 'malinche', 'malintzin', 'rosario', 'castellanos', 
    'mujer', 'senora', 'dona', 'nina', 'madre', 'hermana',
    // Próceres y mentoras de idiomas (francés e inglés)
    'marie', 'curie', 'jeanne', 'darc', 'd\'arc', 'ada', 'lovelace',
    'sophie', 'claire', 'sylvie', 'denise', 'eloise', 'vivienne', 'sonia'
  ];
  if (femaleKeywords.some(k => norm.includes(k))) return 'female';
  return 'male';
}

/**
 * Extrae el perfil histórico acústico contextual de un personaje
 */
export function getPersonaProfile(
  characterName?: string, 
  historicalAge?: number, 
  variantIndex: 0 | 1 | 2 = 0,
  birthOrDeathDates?: string
): HistoricalPersonaProfile {
  const norm = (characterName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const gender = getPersonaGender(characterName);

  // Verificación prioritaria en el Catálogo Multilingüe Internacional (Francés e Inglés)
  const multiFig = MULTILINGUAL_HISTORICAL_FIGURES.find(f => {
    const fNorm = f.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const idNorm = f.id.toLowerCase();
    return norm.includes(fNorm) || fNorm.includes(norm) || norm.includes(idNorm);
  });

  if (multiFig) {
    const rateDelta = Math.round((multiFig.speechRate - 1.0) * 100);
    const pitchDelta = Math.round((multiFig.speechPitch - 1.0) * 100);
    return {
      name: multiFig.name,
      gender: multiFig.gender,
      era: 'moderna' as HistoricalEra,
      cohort: multiFig.gender === 'female' ? 'adult_female' : 'adult_male',
      voiceId: multiFig.voiceId,
      expressStyle: 'calm',
      styleDegree: 1.2,
      prosodyRate: rateDelta >= 0 ? `+${rateDelta}%` : `${rateDelta}%`,
      prosodyPitch: pitchDelta >= 0 ? `+${pitchDelta}Hz` : `${pitchDelta}Hz`,
      pitchContour: '',
      commaPauseMs: 200,
      sentencePauseMs: 400,
      solemnityLevel: 1.3,
      description: `${multiFig.name} · ${multiFig.era} (${multiFig.country})`
    };
  }

  const cohort = inferCharacterAgeCohort(characterName || '', historicalAge, birthOrDeathDates);
  const resolvedVoice = resolveCharacterVoice(characterName || '', historicalAge, variantIndex, birthOrDeathDates);

  // Época por defecto según personaje
  let era: HistoricalEra = 'independencia';
  if (norm.includes('sor juana') || norm.includes('malinche') || norm.includes('malintzin') || norm.includes('virrein') || norm.includes('colonial') || norm.includes('cuauhtemoc')) {
    era = 'virreinal';
  } else if (norm.includes('villa') || norm.includes('zapata') || norm.includes('madero') || norm.includes('carranza') || norm.includes('serdan')) {
    era = 'revolucion';
  } else if (norm.includes('juarez') || norm.includes('reforma') || norm.includes('frida')) {
    era = 'reforma';
  }

  // Cadencia y expresividad de época
  const isFemale = gender === 'female';
  const isMatron = isFemale && (norm.includes('josefa') || norm.includes('corregidora') || norm.includes('matrona') || cohort === 'adult_female' || cohort === 'elder_female');

  return {
    name: characterName || (isFemale ? 'Prócer Femenina' : 'Prócer Histórico'),
    gender,
    era,
    cohort,
    voiceId: resolvedVoice.id,
    expressStyle: isMatron ? 'serious' : (isFemale ? 'calm' : 'serious'),
    styleDegree: isMatron ? 1.4 : (isFemale ? 1.3 : 1.4),
    prosodyRate: resolvedVoice.prosodyRate || (isMatron ? '-5%' : (isFemale ? '-4%' : '-5%')),
    prosodyPitch: resolvedVoice.prosodyPitch || (isMatron ? '-2Hz' : (isFemale ? '+0Hz' : '-2Hz')),
    pitchContour: isMatron ? '(0%, -1Hz) (40%, +1Hz) (100%, -3Hz)' : (isFemale ? '(0%, +0Hz) (40%, +2Hz) (100%, -3Hz)' : '(0%, +1Hz) (60%, -1Hz) (100%, -4Hz)'),
    commaPauseMs: isMatron ? 280 : 250,
    sentencePauseMs: isMatron ? 550 : 500,
    solemnityLevel: isMatron ? 1.6 : 1.4,
    description: isMatron ? 'Voz de adulto mujer matrona de la patria, dignificada y noble' : resolvedVoice.description
  };
}

/**
 * Analizador de sintagmas e inyección de micro-pausas exactas (sin elipsis ...)
 * Preserva unidades de sentido (sintagma nominal, preposicional y verbal) y prohíbe
 * pausas entre preposiciones/artículos y su sustantivo.
 */
export function analyzeAndInjectSyntagmas(text: string): string {
  if (!text) return '';
  let result = text;

  // 1. Puntos y aparte (párrafos): 450ms
  result = result.replace(/([.!?])\s*\n\s*\n+/g, '$1<break time="450ms"/>\n\n');
  result = result.replace(/\n\s*\n+/g, '.<break time="450ms"/>\n\n');

  // 2. Puntos y seguido: 280ms
  result = result.replace(/\.\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/g, '.<break time="280ms"/> ');

  // 3. Signos exclamativos e interrogativos de cierre: 280ms
  result = result.replace(/([!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/g, '$1<break time="280ms"/> ');

  // 4. Delimitadores de cláusula (comas: 120ms, punto y coma: 160ms, dos puntos: 160ms)
  result = result.replace(/,(?!\d)\s*/g, ',<break time="120ms"/> ');
  result = result.replace(/;\s*/g, ';<break time="160ms"/> ');
  result = result.replace(/:\s+/g, ':<break time="160ms"/> ');
  result = result.replace(/\s*—\s*/g, ' —<break time="120ms"/> ');

  // 5. Cláusulas extensas (>14 palabras continuas sin descanso sintáctico)
  const chunks = result.split(/(<break[^>]*\/>)/);
  const reassembled: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (chunk.startsWith('<break')) {
      reassembled.push(chunk);
      continue;
    }

    const words = chunk.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 14) {
      reassembled.push(chunk);
      continue;
    }

    // Buscar punto de cesura sintáctica óptima (entre palabras 7 y 12)
    let breakIndex = -1;
    const clauseConnectors = ['que', 'porque', 'cuando', 'donde', 'como', 'aunque', 'para', 'con', 'por', 'y'];

    for (let w = Math.min(12, words.length - 3); w >= 7; w--) {
      const cleanWord = words[w].toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
      if (clauseConnectors.includes(cleanWord)) {
        breakIndex = w;
        break;
      }
    }

    if (breakIndex === -1) {
      breakIndex = Math.floor(words.length / 2);
    }

    // Inyectar el break ANTES del conector (manteniendo intacto el sintagma)
    const firstPart = words.slice(0, breakIndex).join(' ');
    const secondPart = words.slice(breakIndex).join(' ');
    reassembled.push(`${firstPart} <break time="120ms"/> ${secondPart}`);
  }

  result = reassembled.join('');

  // 6. REGLA INVIOLABLE DE SINALEFA Y SINTAGMAS:
  // Prohibir pausas entre preposición y artículo/determinante
  const prepositions = '(?:de|en|a|con|por|para|hacia|contra|desde|hasta|entre|sobre|sin|tras)';
  const determiners = '(?:el|la|los|las|un|una|unos|unas|este|esta|estos|estas|mi|tu|su|nuestro|nuestra)';
  const prepArticleRegex = new RegExp(`\\b(${prepositions})\\s*<break[^>]*\\/>\\s*(${determiners})\\b`, 'gi');
  result = result.replace(prepArticleRegex, '$1 $2');

  // Prohibir pausas entre artículo y su sustantivo
  const articleRegex = new RegExp(`\\b(${determiners})\\s*<break[^>]*\\/>\\s*([a-záéíóúüñ]+)`, 'gi');
  result = result.replace(articleRegex, '$1 $2');

  // Limpiar espacios duplicados
  result = result.replace(/\s{2,}/g, ' ').trim();

  return result;
}

/**
 * Función heredada: delega al analizador de sintagmas erradicando la elipsis (...)
 */
export function injectLongClauseBreathing(rawText: string): string {
  return analyzeAndInjectSyntagmas(rawText);
}

/**
 * Detecta la intención oratoria y el registro emocional predominante del texto
 */
export function detectOratoricalIntention(text: string): OratoricalIntention {
  const norm = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const hasExclamations = /¡|!/.test(text);
  const hasCallToArms = /\b(viva|muera|armas|lucha|adelante|victoria|gloria|combate|compatriotas|soldados|hermanos|fuego)\b/i.test(norm);
  if (hasExclamations && (hasCallToArms || (text.match(/!/g) || []).length >= 2)) {
    return 'arenga';
  }

  const philosophicalTerms = [
    'patria', 'libertad', 'pueblo', 'morir', 'muerte', 'ley', 'constitucion',
    'dios', 'justicia', 'honor', 'supremo', 'sacrificio', 'conciencia', 'destino',
    'nacion', 'soberania', 'deber', 'tierra', 'memoria', 'republica'
  ];
  const countMatches = philosophicalTerms.filter(t => norm.includes(t)).length;
  if (countMatches >= 2 || (countMatches >= 1 && text.length > 55)) {
    return 'philosophical';
  }

  if (/¿|\?/.test(text)) {
    return 'rhetorical';
  }

  return 'solemn_narrative';
}

/**
 * Escapa caracteres reservados para asegurar validez estricta XML en SSML
 * preservando intactas las etiquetas SSML estructuradas (<sub...>, <break...>, <phoneme...>).
 */
export function escapeXmlPreservingSSMLTags(input: string): string {
  if (!input) return '';
  const parts = input.split(/(<[^>]+>)/g);
  return parts.map(part => {
    if (part.startsWith('<') && part.endsWith('>')) {
      // Verificar si es una etiqueta SSML permitida
      if (/^<\/?(?:sub|break|phoneme|prosody|mstts:express-as|speak|voice)\b/i.test(part)) {
        return part;
      }
    }
    return part
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }).join('');
}

/**
 * Mapeo de intención oratoria a estilos expresivos (mstts:express-as) y prosodia calibrada
 */
export interface OratoricalExpressiveStyle {
  style: string;
  styleDegree: number;
  rate: string;
  pitch: string;
}

export function getOratoricalExpressiveStyle(
  intention: OratoricalIntention,
  gender: 'female' | 'male' = 'male',
  role?: string
): OratoricalExpressiveStyle {
  if (role === 'time_chrononaut') {
    return {
      style: 'whispering',
      styleDegree: 1.2,
      rate: '-2%',
      pitch: '-1Hz'
    };
  }
  if (role === 'wisdom_guide') {
    return {
      style: 'cheerful',
      styleDegree: 1.2,
      rate: '+2%',
      pitch: '+1Hz'
    };
  }
  if (role === 'epic_chronist') {
    return {
      style: 'excited',
      styleDegree: 1.4,
      rate: '+4%',
      pitch: '+2Hz'
    };
  }

  switch (intention) {
    case 'arenga':
      return {
        style: 'excited',
        styleDegree: 1.4,
        rate: gender === 'female' ? '+2%' : '+2%',
        pitch: '+2Hz'
      };
    case 'philosophical':
      return {
        style: 'calm',
        styleDegree: 1.2,
        rate: '-4%',
        pitch: gender === 'female' ? '-1Hz' : '-2Hz'
      };
    case 'rhetorical':
      return {
        style: 'calm',
        styleDegree: 1.1,
        rate: '-3%',
        pitch: '+1Hz'
      };
    case 'solemn_narrative':
    default:
      return {
        style: 'calm',
        styleDegree: 1.2,
        rate: '-4%',
        pitch: '-1Hz'
      };
  }
}

// =============================================================================
// CONSTRUCTOR SSML OPTIMIZADO FORENSE
// =============================================================================

export interface SSMLConfig {
  voice: string;
  text: string;
  rate?: string;
  pitch?: string;
  style?: string;
  styleDegree?: number;
  locale?: string;
  language?: 'es' | 'en' | 'fr';
  intention?: OratoricalIntention;
}

/**
 * Construye SSML optimizado de alta fidelidad:
 * 1. Normalización léxica y temporal mexicana determinista (fechas y números).
 * 2. Transcripción fonética prehispánica e histórica (<sub alias="...">).
 * 3. Segmentación por sintagmas y micro-pausas exactas (sin elipsis ...).
 * 4. Inyección expresiva dinámica (<mstts:express-as>).
 * 5. Sanitización XML estricta.
 */
export function buildOptimizedSSML(config: SSMLConfig): string {
  if (!config.text || typeof config.text !== 'string') return '';

  const targetIndicator = config.locale || config.voice || config.language || 'es-MX';
  const pipeline = getLanguagePipeline(targetIndicator);
  const defaultVoices = pipeline.getDefaultVoices();
  const targetVoice = config.voice || defaultVoices.female;

  return pipeline.buildSSML({
    voice: targetVoice,
    text: config.text,
    rate: config.rate,
    pitch: config.pitch,
    style: config.style,
    styleDegree: config.styleDegree ?? 1.2,
    locale: pipeline.locale,
    language: pipeline.language,
    intention: config.intention
  });
}

/**
 * Pre-procesador de Prosodia y SSML Dinámico Latino para Próceres Históricos
 */
export function generateHistoricalSSML(
  text: string, 
  characterName?: string, 
  historicalAge?: number, 
  variantIndex: 0 | 1 | 2 = 0,
  overrides?: { voiceId?: string; voiceRate?: string; voicePitch?: string; birthOrDeathDates?: string; style?: string; styleDegree?: number }
): string {
  const profile = getPersonaProfile(characterName, historicalAge, variantIndex, overrides?.birthOrDeathDates);
  const intention = detectOratoricalIntention(text);
  const expressive = getOratoricalExpressiveStyle(intention, profile.gender);

  const voiceName = overrides?.voiceId || profile.voiceId;
  const finalRate = overrides?.voiceRate || expressive.rate || profile.prosodyRate;
  const finalPitch = overrides?.voicePitch || expressive.pitch || profile.prosodyPitch;
  const finalStyle = overrides?.style || expressive.style;
  const finalStyleDegree = overrides?.styleDegree || expressive.styleDegree;

  return buildOptimizedSSML({
    voice: voiceName,
    text,
    rate: finalRate,
    pitch: finalPitch,
    style: finalStyle,
    styleDegree: finalStyleDegree,
    locale: 'es-MX',
    language: 'es',
    intention
  });
}

/**
 * Generador de SSML especializado para Narradores Gamificados de Quests
 */
export function generateNarratorSSML(text: string, mode: NarratorMode = 'wisdom_guide'): string {
  const profile = NARRATOR_VOICE_PROFILES[mode] || NARRATOR_VOICE_PROFILES.wisdom_guide;
  const expressive = getOratoricalExpressiveStyle('solemn_narrative', 'female', mode);

  return buildOptimizedSSML({
    voice: profile.voiceId,
    text,
    rate: profile.prosodyRate,
    pitch: profile.prosodyPitch,
    style: expressive.style,
    styleDegree: expressive.styleDegree,
    locale: 'es-MX',
    language: 'es'
  });
}


/**
 * Filtro estricto para descartar voces mecánicas locales de baja calidad (SAPI5, robótica legacy)
 */
function isMechanicalLegacyVoice(v: SpeechSynthesisVoice): boolean {
  const name = (v.name || '').toLowerCase();
  const uri = (v.voiceURI || '').toLowerCase();

  const rejectPatterns = [
    'desktop',
    'sapi',
    'robotic',
    'pcm',
    'synthetic',
    'scansoft',
    'espeak',
    'mproject',
    'tts_ms'
  ];

  return rejectPatterns.some(p => name.includes(p) || uri.includes(p));
}

/**
 * Puntuación de calidad para voces del navegador con BLOQUEO ESTRICTO ANTI-CASTELLANO.
 * Prohíbe terminantemente voces con código o descriptor de España (es-ES / castizo).
 * Acepta exclusivamente identificadores es-MX, es-419, es-US, es-CO, es-PE o descriptores latinos.
 */
function scoreVoiceQuality(v: SpeechSynthesisVoice, gender: 'female' | 'male'): number {
  const name = (v.name || '').toLowerCase();
  const uri = (v.voiceURI || '').toLowerCase();
  const lang = (v.lang || '').toLowerCase();

  // 1. BLOQUEO TERMINANTE ANTI-CASTELLANO: Rechazo absoluto de voces de España
  if (
    lang === 'es-es' || 
    lang === 'es_es' || 
    name.includes('spain') || 
    name.includes('españa') || 
    name.includes('castellano') ||
    name.includes('castilian') ||
    uri.includes('es-es') ||
    uri.includes('es_es') ||
    uri.includes('spain')
  ) {
    return -9999;
  }

  // 2. Penalización absoluta para voces mecánicas legacy
  if (isMechanicalLegacyVoice(v)) {
    return -1000;
  }

  // 3. FILTRO ESTRICTO DE IDENTIFICADORES Y DESCRIPTORES LATINOS ACEPTADOS
  const latinLocales = ['es-mx', 'es_mx', 'es-419', 'es_419', 'es-us', 'es_us', 'es-co', 'es_co', 'es-pe', 'es_pe'];
  const hasLatinLocale = latinLocales.some(l => lang.includes(l) || uri.includes(l));

  const latinDescriptors = ['méxico', 'mexico', 'natural latin', 'paulina', 'sabina', 'dalia', 'jorge', 'latin'];
  const hasLatinDescriptor = latinDescriptors.some(d => name.includes(d) || uri.includes(d));

  if (!hasLatinLocale && !hasLatinDescriptor) {
    // Si el sistema no contiene identificadores o descriptores latinos certificados, rechazar
    return -500;
  }

  let score = 50;

  // Afinidad por local específico
  if (lang.includes('es-mx') || lang.includes('es_mx') || name.includes('mexico') || name.includes('méxico')) score += 120;
  else if (lang.includes('es-419') || name.includes('natural latin')) score += 100;
  else if (lang.includes('es-co') || lang.includes('es-pe') || lang.includes('es-us')) score += 80;

  // Bonificación por voces Naturales y Online
  if (name.includes('natural') || uri.includes('natural')) score += 100;
  if (name.includes('online') || uri.includes('online')) score += 80;
  if (name.includes('neural') || uri.includes('neural')) score += 90;
  if (name.includes('google') || uri.includes('google')) score += 50;

  // Coincidencia de género
  const femaleNames = ['dalia', 'sabina', 'paulina', 'helena', 'elena', 'laura', 'monica', 'sofia', 'lucia', 'maria', 'paloma', 'camila', 'salome', 'larissa', 'marina', 'nuria', 'beatriz', 'candela', 'renata', 'carlota'];
  const maleNames = ['jorge', 'raul', 'pablo', 'carlos', 'miguel', 'diego', 'enrique', 'david', 'pedro', 'gonzalo', 'alex', 'alonso', 'pelayo', 'cecilio', 'liberto', 'yago', 'gerardo', 'candido', 'luciano'];

  if (gender === 'female') {
    if (femaleNames.some(fn => name.includes(fn))) score += 60;
    if (maleNames.some(mn => name.includes(mn))) score -= 500;
    if (name.includes('female') || name.includes('mujer')) score += 40;
  } else {
    if (maleNames.some(mn => name.includes(mn))) score += 60;
    if (femaleNames.some(fn => name.includes(fn))) score -= 500;
    if (name.includes('male') || name.includes('hombre')) score += 40;
  }

  return score;
}

/**
 * Selección optimizada de voz de respaldo local en el navegador (SpeechSynthesis).
 * Aplica filtro anti-castellano estricto: si solo existen voces es-ES, retorna null
 * para que el cliente descarte el sintetizador local y use el fallback HTTP directo.
 */
export function selectHistoricalSpeechVoice(gender: 'female' | 'male'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Filtrar voces en español excluyendo España y verificando compatibilidad latina
  const scored = voices
    .map(v => ({ voice: v, score: scoreVoiceQuality(v, gender) }))
    .filter(item => item.score > 0) // Solo puntuaciones positivas (latinas y naturales)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0) {
    return scored[0].voice;
  }

  return null;
}

/**
 * Configura la locución local en SpeechSynthesis con prosodia pedagógica y locale latino.
 * Retorna true si encontró una voz local latina compatible, o false si se requiere fallback HTTP.
 */
export function configureHistoricalUtterance(
  utterance: SpeechSynthesisUtterance,
  characterName: string,
  historicalAge?: number
): boolean {
  const profile = getPersonaProfile(characterName, historicalAge);
  utterance.lang = 'es-MX';

  if (profile.gender === 'female') {
    if (profile.cohort === 'adult_female' || profile.cohort === 'elder_female') {
      utterance.pitch = 0.90; // Timbre grave, reposado y solemne de matrona de la patria
      utterance.rate = 0.90;
    } else {
      utterance.pitch = 1.0;
      utterance.rate = 0.95;
    }
  } else {
    utterance.pitch = 0.92;
    utterance.rate = 0.92;
  }

  const voice = selectHistoricalSpeechVoice(profile.gender);
  if (voice) {
    utterance.voice = voice;
    return true;
  }
  return false;
}

// =============================================================================
// MOTOR UNIVERSAL DE REPRODUCCIÓN DE VOZ DE ALTA FIDELIDAD (ISKOOL)
// Integra TTS Neural, caché en memoria, SSML y fallback local con bloqueo estricto anti-castellano.
// =============================================================================

export interface UniversalVoicePlayOptions {
  text: string;
  characterName?: string;
  historicalAge?: number;
  variantIndex?: number;
  role?: 'character' | 'narrator' | 'pedagogical';
  narratorMode?: NarratorMode;
  voiceId?: string;
  language?: 'es' | 'en' | 'fr';
  gender?: 'female' | 'male';
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface UniversalAudioController {
  stop: () => void;
  isPlaying: () => boolean;
}

// Caché en memoria para URLs de audio ya sintetizadas (latencia 0 ms en repeticiones)
const universalAudioBlobCache = new Map<string, string>();
let globalActiveAudioElement: HTMLAudioElement | null = null;
let globalActiveUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Detiene inmediatamente cualquier locución o audio en curso en todo el sistema ISkool.
 */
export function stopAllIskoolAudio(): void {
  if (typeof window === 'undefined') return;

  if (globalActiveAudioElement) {
    try {
      globalActiveAudioElement.pause();
      globalActiveAudioElement.currentTime = 0;
    } catch {}
    globalActiveAudioElement = null;
  }

  if ('speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
    globalActiveUtterance = null;
  }
}

/**
 * Reproductor de voz universal de ISkool:
 * 1. Prioriza el motor neural en `/api/ai/tts` con prosodia oratoria, respiración natural y fonética nativa certificada.
 * 2. Utiliza caché en memoria para respuesta instantánea en clics repetidos.
 * 3. Si no hay conexión o falla la red, activa el fallback local con SpeechSynthesis aplicando
 *    el dialecto nativo (fr-FR para francés, en-US para inglés o es-MX con filtro anti-castellano para español).
 */
export async function playUniversalIskoolVoice(options: UniversalVoicePlayOptions): Promise<UniversalAudioController> {
  const {
    text,
    characterName,
    historicalAge,
    variantIndex = 0,
    role = characterName ? 'character' : 'pedagogical',
    narratorMode = 'wisdom_guide',
    voiceId,
    language,
    gender,
    rate = 1.0,
    pitch = 1.0,
    onStart,
    onEnd,
    onError
  } = options;

  let isStopped = false;
  let isCurrentlyPlaying = false;

  const controller: UniversalAudioController = {
    stop: () => {
      isStopped = true;
      isCurrentlyPlaying = false;
      stopAllIskoolAudio();
      onEnd?.();
    },
    isPlaying: () => isCurrentlyPlaying
  };

  if (typeof window === 'undefined') return controller;

  // Detener cualquier audio anterior
  stopAllIskoolAudio();

  // Limpieza inicial de texto y markdown
  const cleanText = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/[*_#`~>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    onEnd?.();
    return controller;
  }

  const effectiveGender = gender || (characterName ? getPersonaGender(characterName) : 'female');
  const effectiveLang: 'es' | 'en' | 'fr' = language || (voiceId?.startsWith('fr-') ? 'fr' : (voiceId?.startsWith('en-') ? 'en' : 'es'));
  const cacheKey = `${voiceId || characterName || role}::${effectiveLang}::${narratorMode}::${rate}::${pitch}::${cleanText}`;

  // Intentar primero con el motor neural de alta fidelidad
  try {
    let audioUrl = universalAudioBlobCache.get(cacheKey);

    if (!audioUrl) {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          characterName,
          historicalAge,
          variantIndex,
          role,
          narratorMode,
          voice: voiceId,
          language: effectiveLang,
          rate,
          pitch
        })
      });

      if (!response.ok) {
        throw new Error(`TTS server HTTP ${response.status}`);
      }

      const blob = await response.blob();
      audioUrl = URL.createObjectURL(blob);
      universalAudioBlobCache.set(cacheKey, audioUrl);
    }

    if (isStopped) return controller;

    const audio = new Audio(audioUrl);
    globalActiveAudioElement = audio;
    audio.playbackRate = rate;

    audio.onplay = () => {
      if (isStopped) {
        audio.pause();
        return;
      }
      isCurrentlyPlaying = true;
      onStart?.();
    };

    audio.onended = () => {
      isCurrentlyPlaying = false;
      if (globalActiveAudioElement === audio) {
        globalActiveAudioElement = null;
      }
      onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn('[VozUniversal] Error reproduciendo audio neural, derivando a síntesis local:', e);
      isCurrentlyPlaying = false;
      if (globalActiveAudioElement === audio) {
        globalActiveAudioElement = null;
      }
      runLocalSpeechFallback();
    };

    await audio.play();
    return controller;
  } catch (err) {
    console.warn('[VozUniversal] Derivando a síntesis local debido a:', err);
    if (!isStopped) {
      runLocalSpeechFallback();
    }
    return controller;
  }

  function runLocalSpeechFallback() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      onError?.(new Error('Síntesis de voz no soportada'));
      onEnd?.();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const pipeline = getLanguagePipeline(voiceId || effectiveLang);
      const speechText = pipeline.applyPhonetics(pipeline.normalizeText(cleanText), 'plain');
      const utterance = new SpeechSynthesisUtterance(speechText);

      if (pipeline.language === 'fr') {
        utterance.lang = pipeline.locale;
        utterance.rate = rate * 0.95;
        utterance.pitch = pitch;
        const voices = window.speechSynthesis.getVoices();
        const frenchVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(pipeline.locale.toLowerCase()) && !v.name.toLowerCase().includes('desktop'))
          || voices.find(v => v.lang.toLowerCase().startsWith('fr') && !v.name.toLowerCase().includes('desktop'));
        if (frenchVoice) utterance.voice = frenchVoice;
      } else if (pipeline.language === 'en') {
        utterance.lang = pipeline.locale;
        utterance.rate = rate * 0.95;
        utterance.pitch = pitch;
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.toLowerCase().replace('_', '-').startsWith(pipeline.locale.toLowerCase()) && !v.name.toLowerCase().includes('desktop'))
          || voices.find(v => v.lang.toLowerCase().startsWith('en') && !v.name.toLowerCase().includes('desktop'));
        if (englishVoice) utterance.voice = englishVoice;
      } else if (characterName) {
        configureHistoricalUtterance(utterance, characterName, historicalAge);
      } else {
        const localVoice = selectHistoricalSpeechVoice(effectiveGender);
        if (localVoice) {
          utterance.voice = localVoice;
        }
        utterance.lang = 'es-MX';
        utterance.rate = rate * (effectiveGender === 'female' ? 0.94 : 0.92);
        utterance.pitch = pitch * (effectiveGender === 'female' ? 0.95 : 0.92);
      }

      utterance.onstart = () => {
        if (isStopped) {
          window.speechSynthesis.cancel();
          return;
        }
        isCurrentlyPlaying = true;
        onStart?.();
      };

      utterance.onend = () => {
        isCurrentlyPlaying = false;
        globalActiveUtterance = null;
        onEnd?.();
      };

      utterance.onerror = (err) => {
        isCurrentlyPlaying = false;
        globalActiveUtterance = null;
        onError?.(err);
        onEnd?.();
      };

      globalActiveUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (localErr) {
      onError?.(localErr);
      onEnd?.();
    }
  }
}

// =============================================================================
// CATÁLOGO MULTILINGÜE DE PERSONAJES HISTÓRICOS PARA EL CENTRO DE IDIOMAS
// (Canon Inviolable de Primera Persona Estricta y Voces Neurales Calibradas)
// =============================================================================

export interface CharacterAnatomicalMouth {
  x1: number;         // Comisura izquierda en espacio 1024
  y1: number;
  cx: number;         // Centro anatómico
  cy: number;
  x2: number;         // Comisura derecha en espacio 1024
  y2: number;
  maxOpening: number; // Apertura vertical máxima en px
  cavityDarkColor: string;
  cavityMidColor: string;
  cavityRimColor: string;
  lowerLipRimColor: string;
  teethColor: string;
  mustacheCover?: boolean;
}

export function getHistoricalMouthConfig(idOrName: string): CharacterAnatomicalMouth {
  const norm = (idOrName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // 1. NAPOLÉON BONAPARTE (public/images/languages/historical/napoleon.jpg)
  // Labios reales: centro y = 375, cx = 484, comisuras x1: 454, x2: 514
  if (norm.includes('napoleon') || norm.includes('bonaparte')) {
    return {
      x1: 454,
      y1: 375,
      cx: 484,
      cy: 375,
      x2: 514,
      y2: 375,
      maxOpening: 9.5,
      cavityDarkColor: '#120304',
      cavityMidColor: '#28060a',
      cavityRimColor: '#421015',
      lowerLipRimColor: 'rgba(175, 95, 85, 0.92)',
      teethColor: '#eee7db'
    };
  }

  // 2. WILLIAM SHAKESPEARE (public/images/languages/historical/shakespeare.jpg)
  // Labios reales bajo bigote: centro y = 472, cx = 460 (cabeza a 3/4), comisuras x1: 428, x2: 492
  if (norm.includes('shakespeare')) {
    return {
      x1: 428,
      y1: 472,
      cx: 460,
      cy: 472,
      x2: 492,
      y2: 472,
      maxOpening: 10,
      cavityDarkColor: '#0e0203',
      cavityMidColor: '#240508',
      cavityRimColor: '#400e12',
      lowerLipRimColor: 'rgba(165, 80, 75, 0.92)',
      teethColor: '#ece4d6',
      mustacheCover: true
    };
  }

  // 3. ABRAHAM LINCOLN (public/images/languages/historical/abraham_lincoln.jpg)
  // Labios reales: centro y = 458, cx = 490, comisuras x1: 452, x2: 528
  if (norm.includes('lincoln') || norm.includes('abraham')) {
    return {
      x1: 452,
      y1: 458,
      cx: 490,
      cy: 458,
      x2: 528,
      y2: 458,
      maxOpening: 10.5,
      cavityDarkColor: '#0a0203',
      cavityMidColor: '#220407',
      cavityRimColor: '#3e0c12',
      lowerLipRimColor: 'rgba(160, 85, 78, 0.90)',
      teethColor: '#eae1d2'
    };
  }

  // 4. ADA LOVELACE (public/images/languages/historical/ada_lovelace.jpg)
  // Labios reales: centro y = 338, cx = 494, comisuras x1: 470, x2: 518
  if (norm.includes('ada') || norm.includes('lovelace')) {
    return {
      x1: 470,
      y1: 340,
      cx: 494,
      cy: 338,
      x2: 518,
      y2: 340,
      maxOpening: 8.5,
      cavityDarkColor: '#140305',
      cavityMidColor: '#2d070c',
      cavityRimColor: '#4a1218',
      lowerLipRimColor: 'rgba(195, 90, 95, 0.92)',
      teethColor: '#f5efe6'
    };
  }

  // 5. MARIE CURIE (public/images/languages/historical/marie_curie.jpg)
  // Labios reales: centro y = 440, cx = 490, comisuras x1: 456, x2: 524
  if (norm.includes('curie') || norm.includes('marie')) {
    return {
      x1: 456,
      y1: 440,
      cx: 490,
      cy: 440,
      x2: 524,
      y2: 440,
      maxOpening: 9.5,
      cavityDarkColor: '#100203',
      cavityMidColor: '#260509',
      cavityRimColor: '#441016',
      lowerLipRimColor: 'rgba(168, 82, 80, 0.90)',
      teethColor: '#eee5d8'
    };
  }

  // 6. VICTOR HUGO (public/images/languages/historical/victor_hugo.jpg)
  // Labios reales bajo bigote: centro y = 394, cx = 504, comisuras x1: 476, x2: 534
  if (norm.includes('victor') || norm.includes('hugo')) {
    return {
      x1: 476,
      y1: 394,
      cx: 504,
      cy: 394,
      x2: 534,
      y2: 394,
      maxOpening: 9.5,
      cavityDarkColor: '#0c0203',
      cavityMidColor: '#240407',
      cavityRimColor: '#400e12',
      lowerLipRimColor: 'rgba(155, 78, 72, 0.90)',
      teethColor: '#eae1d2',
      mustacheCover: true
    };
  }

  // 7. JEANNE D'ARC (public/images/languages/historical/jeanne_darc.jpg)
  // Labios reales: centro y = 382, cx = 500, comisuras x1: 472, x2: 528
  if (norm.includes('jeanne') || norm.includes('darc') || norm.includes('arc')) {
    return {
      x1: 472,
      y1: 382,
      cx: 500,
      cy: 382,
      x2: 528,
      y2: 382,
      maxOpening: 9.0,
      cavityDarkColor: '#120305',
      cavityMidColor: '#2a060b',
      cavityRimColor: '#461117',
      lowerLipRimColor: 'rgba(185, 90, 90, 0.92)',
      teethColor: '#f2ebe0'
    };
  }

  // MENTORES ESTÁNDAR
  // Mentor Femenino: public/images/languages/mentor_female.jpg (y = 545, cx = 508, x1: 430, x2: 586)
  if (norm.includes('female') || norm.includes('claire') || norm.includes('sophie') || norm.includes('elara') || norm.includes('fem')) {
    return {
      x1: 430,
      y1: 538,
      cx: 508,
      cy: 545,
      x2: 586,
      y2: 538,
      maxOpening: 12,
      cavityDarkColor: '#0a0102',
      cavityMidColor: '#240407',
      cavityRimColor: '#450d13',
      lowerLipRimColor: 'rgba(190, 85, 90, 0.92)',
      teethColor: '#f4ede6'
    };
  }

  // Mentor Masculino: public/images/languages/mentor_male.jpg (y = 502, cx = 500, x1: 440, x2: 560)
  if (norm.includes('male') || norm.includes('arthur') || norm.includes('henri')) {
    return {
      x1: 440,
      y1: 502,
      cx: 500,
      cy: 502,
      x2: 560,
      y2: 502,
      maxOpening: 11,
      cavityDarkColor: '#080102',
      cavityMidColor: '#200306',
      cavityRimColor: '#3e0c12',
      lowerLipRimColor: 'rgba(165, 80, 75, 0.90)',
      teethColor: '#ede4d6',
      mustacheCover: true
    };
  }

  // Fallback seguro centrado
  return {
    x1: 460,
    y1: 440,
    cx: 500,
    cy: 440,
    x2: 540,
    y2: 440,
    maxOpening: 10,
    cavityDarkColor: '#0a0102',
    cavityMidColor: '#240407',
    cavityRimColor: '#450d13',
    lowerLipRimColor: 'rgba(160, 60, 65, 0.88)',
    teethColor: '#f0ece2'
  };
}

export interface MultilingualHistoricalFigure {
  id: string;
  name: string;
  language: 'en' | 'fr';
  gender: 'female' | 'male';
  voiceId: string;
  speechRate: number;
  speechPitch: number;
  era: string;
  country: string;
  avatarEmoji: string;
  avatarImage: string;
  canonicalIntro: string;
  pdaRelevance: string;
  sampleQuestions: string[];
  mouthConfig?: CharacterAnatomicalMouth;
}

export const MULTILINGUAL_HISTORICAL_FIGURES: MultilingualHistoricalFigure[] = [
  {
    id: 'shakespeare',
    name: 'William Shakespeare',
    language: 'en',
    gender: 'male',
    voiceId: 'en-GB-RyanNeural',
    speechRate: 0.88,
    speechPitch: 1.0,
    era: 'Elizabethan Era (1564 - 1616)',
    country: 'England',
    avatarEmoji: '📜',
    avatarImage: '/images/languages/historical/shakespeare.jpg',
    canonicalIntro: 'I am William Shakespeare. I was born in Stratford-upon-Avon, and upon the boards of the Globe Theatre in London, I crafted the tragedies of Hamlet and Macbeth.',
    pdaRelevance: 'Fluidez auditiva poética, figuras retóricas y riqueza léxica renacentista en lengua inglesa.',
    sampleQuestions: [
      'Where did you write your famous sonnets?',
      'How was daily life at the Globe Theatre in London?'
    ]
  },
  {
    id: 'ada_lovelace',
    name: 'Ada Lovelace',
    language: 'en',
    gender: 'female',
    voiceId: 'en-GB-SoniaNeural',
    speechRate: 0.90,
    speechPitch: 1.05,
    era: 'Victorian Scientific Era (1815 - 1852)',
    country: 'United Kingdom',
    avatarEmoji: '⚙️',
    avatarImage: '/images/languages/historical/ada_lovelace.jpg',
    canonicalIntro: 'I am Ada Lovelace. In 1843, I authored the very first computer algorithm for Charles Babbage\'s Analytical Engine, foreseeing that machines would manipulate symbols and compose music.',
    pdaRelevance: 'Léxico científico de vanguardia, argumentación lógica y pensamiento computacional bilingüe.',
    sampleQuestions: [
      'How did you imagine the future of computing?',
      'What inspired your collaboration with Charles Babbage?'
    ]
  },
  {
    id: 'abraham_lincoln',
    name: 'Abraham Lincoln',
    language: 'en',
    gender: 'male',
    voiceId: 'en-US-GuyNeural',
    speechRate: 0.84,
    speechPitch: 0.95,
    era: 'American Civil War (1809 - 1865)',
    country: 'United States',
    avatarEmoji: '🏛️',
    avatarImage: '/images/languages/historical/abraham_lincoln.jpg',
    canonicalIntro: 'I am Abraham Lincoln, 16th President of the United States. In 1863, amidst our nation\'s trial at Gettysburg, I proclaimed that government of the people, by the people, for the people, shall not perish from the earth.',
    pdaRelevance: 'Oratoria formal, estructuras de discurso cívico y argumentación republicana en inglés estadounidense.',
    sampleQuestions: [
      'What were your thoughts while delivering the Gettysburg Address?',
      'How did you preserve the Union during the darkest days of the Civil War?'
    ]
  },
  {
    id: 'napoleon',
    name: 'Napoléon Bonaparte',
    language: 'fr',
    gender: 'male',
    voiceId: 'fr-FR-HenriNeural',
    speechRate: 0.88,
    speechPitch: 0.96,
    era: 'Premier Empire Français (1769 - 1821)',
    country: 'France',
    avatarEmoji: '⚔️',
    avatarImage: '/images/languages/historical/napoleon.jpg',
    canonicalIntro: 'Je suis Napoléon Bonaparte, né à Ajaccio en Corse. J\'ai réorganisé l\'administration, promulgué le Code Civil et conduit les armées de la République avant de ceindre la couronne impériale.',
    pdaRelevance: 'Conectores argumentativos solemnes, léxico institucional civil y retórica histórica francesa.',
    sampleQuestions: [
      'Comment avez-vous rédigé le Code Civil des Français?',
      'Quelle était votre stratégie lors de la bataille d\'Austerlitz?'
    ]
  },
  {
    id: 'marie_curie',
    name: 'Marie Curie',
    language: 'fr',
    gender: 'female',
    voiceId: 'fr-FR-DeniseNeural',
    speechRate: 0.90,
    speechPitch: 1.02,
    era: 'Révolution Scientifique (1867 - 1934)',
    country: 'France / Pologne',
    avatarEmoji: '🔬',
    avatarImage: '/images/languages/historical/marie_curie.jpg',
    canonicalIntro: 'Je suis Marie Curie. Avec Pierre Curie, j\'ai isolé le polonium et le radium dans mon modeste hangar de la rue Lhomond à Paris, devenant la première lauréate de deux Prix Nobel.',
    pdaRelevance: 'Vocabulario científico riguroso, enunciados descriptivos y argumentación empírica en lengua francesa.',
    sampleQuestions: [
      'Comment avez-vous réussi à isoler le radium?',
      'Quel sentiment éprouviez-vous en recevant vos deux Prix Nobel?'
    ]
  },
  {
    id: 'victor_hugo',
    name: 'Victor Hugo',
    language: 'fr',
    gender: 'male',
    voiceId: 'fr-FR-HenriNeural',
    speechRate: 0.86,
    speechPitch: 0.98,
    era: 'Romantisme & XIXe Siècle (1802 - 1885)',
    country: 'France',
    avatarEmoji: '📖',
    avatarImage: '/images/languages/historical/victor_hugo.jpg',
    canonicalIntro: 'Je suis Victor Hugo. J\'ai écrit Les Misérables et Notre-Dame de Paris pour donner une voix aux humbles et défendre la dignité humaine contre toute forme d\'oppression.',
    pdaRelevance: 'Riqueza estilística, narrativa emotiva y estructuras sintácticas compuestas del francés literario.',
    sampleQuestions: [
      'Pourquoi avez-vous créé le personaje de Jean Valjean?',
      'Que ressentiez-vous pendant vos années d\'exil à Guernesey?'
    ]
  },
  {
    id: 'jeanne_darc',
    name: 'Jeanne d\'Arc',
    language: 'fr',
    gender: 'female',
    voiceId: 'fr-FR-EloiseNeural',
    speechRate: 0.92,
    speechPitch: 1.08,
    era: 'Guerre de Cent Ans (1412 - 1431)',
    country: 'France',
    avatarEmoji: '🛡️',
    avatarImage: '/images/languages/historical/jeanne_darc.jpg',
    canonicalIntro: 'Je suis Jeanne d\'Arc, la Pucelle d\'Orléans. À dix-sept ans, guidée par ma foi et mes voix, j\'ai levé le siège d\'Orléans et conduit le dauphin Charles à son sacre à Reims.',
    pdaRelevance: 'Léxico medieval heroico, oraciones afirmativas directas y entonación de convicción en francés.',
    sampleQuestions: [
      'Comment avez-vous convaincu le dauphin à Chinon?',
      'Racontez-nous la libération d\'Orléans en mai 1429.'
    ]
  }
];

