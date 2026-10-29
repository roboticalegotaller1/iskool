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
    { id: 'es-PE-AlexNeural', label: 'Alex (Joven Cadete) · Opción A', prosodyRate: '+2%', prosodyPitch: '+2Hz', description: 'Voz juvenil latinoamericana clara, vivaz y de excelente dicción' },
    { id: 'es-US-AlonsoNeural', label: 'Alonso (Joven) · Opción B', prosodyRate: '+2%', prosodyPitch: '+2Hz', description: 'Timbre juvenil despierto y articulación nítida' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Joven) · Opción C', prosodyRate: '+2%', prosodyPitch: '+2Hz', description: 'Cadencia clara, curiosa y bien vocalizada' }
  ],
  child_female: [
    { id: 'es-PE-CamilaNeural', label: 'Camila (Joven) · Opción A', prosodyRate: '+2%', prosodyPitch: '+2Hz', description: 'Voz juvenil dulce, cristalina y natural' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Joven) · Opción B', prosodyRate: '+2%', prosodyPitch: '+2Hz', description: 'Timbre dulce, reflexivo y de dicción impecable' },
    { id: 'es-MX-DaliaNeural', label: 'Dalia (Joven) · Opción C', prosodyRate: '+2%', prosodyPitch: '+2Hz', description: 'Calidez mexicana juvenil, entusiasta y clara' }
  ],
  teen_male: [
    { id: 'es-PE-AlexNeural', label: 'Alex (Cadete Heroico) · Opción A', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven cadete / prócer heroico, enérgico, leal y de dicción limpia' },
    { id: 'es-US-AlonsoNeural', label: 'Alonso (Joven Prócer) · Opción B', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven latino, voz clara, limpia y decidida' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Académico Joven) · Opción C', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven elocuente, articulación culta y precisa' }
  ],
  teen_female: [
    { id: 'es-PE-CamilaNeural', label: 'Camila (Joven Heroína) · Opción A', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven heroína dulce, firme y elocuente' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Joven Ilustrada) · Opción B', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven culta, dicción poética y cristalina' },
    { id: 'es-MX-DaliaNeural', label: 'Dalia (Joven Mexicana) · Opción C', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven expresiva, cálida y decidida' }
  ],
  young_adult_male: [
    { id: 'es-PE-AlexNeural', label: 'Alex (Caudillo Joven) · Opción A', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Firme y nítido, ideal para tlatoanis y caudillos jóvenes' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Intelectual / Jurista) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Dicción parlamentaria elegante, clara y fluida' },
    { id: 'es-MX-JorgeNeural', label: 'Jorge (Caudillo Mexicano) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Timbre mexicano firme, fluido y de convicción patriótica' }
  ],
  young_adult_female: [
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Poetisa / Heroína) · Opción A', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Dicción literaria impecable, clara, culta y fluida' },
    { id: 'es-PE-CamilaNeural', label: 'Camila (Insurgente) · Opción B', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Heroica, decidida, dicción pulcra y valiente' },
    { id: 'es-MX-DaliaNeural', label: 'Dalia (Líder Mexicana) · Opción C', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Apasionada, líder patriótica, timbre cálido y firme' }
  ],
  adult_male: [
    { id: 'es-MX-JorgeNeural', label: 'Jorge (México · Estadista) · Opción A', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Barítono mexicano fluido, oratoria de estadista o general con dicción nítida' },
    { id: 'es-US-AlonsoNeural', label: 'Alonso (Militar / Humanista) · Opción B', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Voz serena, cálida, caballerosa y de articulación cristalina' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Tribuno / Reformador) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Oratoria republicana culta, clara y precisa' }
  ],
  adult_female: [
    { id: 'es-MX-DaliaNeural', label: 'Dalia (México · Matrona Patria) · Opción A', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Voz de mujer mexicana digna, cálida, fluida y de dicción impecable' },
    { id: 'es-US-PalomaNeural', label: 'Paloma (Expresiva / Firme) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Intelectual, expresiva, líder histórica con timbre natural' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Clásica / Ilustrada) · Opción C', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Resonancia serena, dicción culta y calidez humana' }
  ],
  elder_male: [
    { id: 'es-MX-JorgeNeural', label: 'Jorge (Padre de la Patria) · Opción A', prosodyRate: '-1%', prosodyPitch: '-2Hz', description: 'Sabio, venerable y fluido, conservando dicción clara y natural' },
    { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Patriarca Ilustrado) · Opción B', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Oratoria serena y fluida de maestro y humanista' },
    { id: 'es-US-AlonsoNeural', label: 'Alonso (Mentor Republicano) · Opción C', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Tempo equilibrado, cálido y humano' }
  ],
  elder_female: [
    { id: 'es-MX-DaliaNeural', label: 'Dalia (Matriarca Venerable) · Opción A', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Voz de matriarca serena, fluida, sabia y de clara dicción' },
    { id: 'es-US-PalomaNeural', label: 'Paloma (Testimonio Vivo) · Opción B', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Estilo sereno, cálido y reflexivo' },
    { id: 'es-CO-SalomeNeural', label: 'Salomé (Consejera Ilustrada) · Opción C', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Tono equilibrado de consejera histórica ilustrada' }
  ]
};

// =============================================================================
// PILAR 4: VOCES DE NARRADORES GAMIFICADOS (ISKOOL QUESTS)
// =============================================================================
export const NARRATOR_VOICE_PROFILES: Record<NarratorMode, NarratorVoiceProfile> = {
  epic_chronist: {
    id: 'epic_chronist',
    name: 'El Cronista Épico',
    voiceId: 'es-PE-AlexNeural',
    prosodyRate: '+3%',
    prosodyPitch: '+1Hz',
    pauseMs: 180,
    description: 'Relato apasionado estilo cinemática o tráiler histórico de batallas y gloria',
    roleTag: 'Acción / Batallas / Momentos Clave'
  },
  wisdom_guide: {
    id: 'wisdom_guide',
    name: 'La Guía del Saber',
    voiceId: 'es-MX-DaliaNeural',
    prosodyRate: '+2%',
    prosodyPitch: '+0Hz',
    pauseMs: 180,
    description: 'Retroalimentación de misiones, logros pedagógicos y explicaciones didácticas',
    roleTag: 'Misiones / Desafíos / Logros Gamificados'
  },
  time_chrononaut: {
    id: 'time_chrononaut',
    name: 'El Crononauta / Investigador del Tiempo',
    voiceId: 'es-CO-GonzaloNeural',
    prosodyRate: '+1%',
    prosodyPitch: '-1Hz',
    pauseMs: 200,
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
 * Perfiles Acústicos de Autor Calibrados Individualmente por Personaje Histórico
 * Garantiza máxima humanidad, timbre distintivo y dicción impecable para cada prócer.
 */
const CHARACTER_BESPOKE_VOICES: Array<{
  match: string[];
  options: [VoiceMatrixOption, VoiceMatrixOption, VoiceMatrixOption];
}> = [
  {
    // Don Miguel Hidalgo y Costilla: Patriarca sabio, fluido y cálido
    match: ['hidalgo', 'costilla', 'padre de la patria'],
    options: [
      { id: 'es-MX-JorgeNeural', label: 'Don Miguel Hidalgo (México) · Opción A', prosodyRate: '-1%', prosodyPitch: '-2Hz', description: 'Voz paternal, sabia y fluida con dicción mexicana impecable' },
      { id: 'es-CO-GonzaloNeural', label: 'Don Miguel Hidalgo (Ilustrado) · Opción B', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Oratoria teológica e ilustrada de gran claridad' },
      { id: 'es-US-AlonsoNeural', label: 'Don Miguel Hidalgo (Sereno) · Opción C', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Timbre cálido y reflexivo' }
    ]
  },
  {
    // Doña Josefa Ortiz de Domínguez: Matrona firme, decidida y fluida
    match: ['josefa', 'corregidora', 'ortiz de dominguez'],
    options: [
      { id: 'es-MX-DaliaNeural', label: 'Doña Josefa Ortiz (México) · Opción A', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Voz de matrona insurgente firme, digna, fluida y de dicción cristalina' },
      { id: 'es-US-PalomaNeural', label: 'Doña Josefa Ortiz (Firme) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Carácter enérgico y temple patriótico' },
      { id: 'es-CO-SalomeNeural', label: 'Doña Josefa Ortiz (Solemne) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Articulación clásica y fluida' }
    ]
  },
  {
    // José María Morelos y Pavón: Siervo de la Nación, voz de mando y estadista
    match: ['morelos', 'siervo de la nacion', 'pavon'],
    options: [
      { id: 'es-MX-JorgeNeural', label: 'General Morelos (México) · Opción A', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Voz firme y fluida de estratega y legislador de Chilpancingo' },
      { id: 'es-US-AlonsoNeural', label: 'General Morelos (Estadista) · Opción B', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Dicción solemne y equilibrada' },
      { id: 'es-CO-GonzaloNeural', label: 'General Morelos (Constitucional) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Oratoria jurídica de los Sentimientos de la Nación' }
    ]
  },
  {
    // Ignacio Allende: Capitán General Insurgente, marcial y ágil
    match: ['allende', 'ignacio allende'],
    options: [
      { id: 'es-PE-AlexNeural', label: 'General Allende (Marcial) · Opción A', prosodyRate: '+2%', prosodyPitch: '+0Hz', description: 'Militar joven, enérgico, de dicción brillante y decidida' },
      { id: 'es-US-AlonsoNeural', label: 'General Allende (Caballeroso) · Opción B', prosodyRate: '+2%', prosodyPitch: '+0Hz', description: 'Timbre claro y marcial' },
      { id: 'es-MX-JorgeNeural', label: 'General Allende (México) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Firmeza insurgente mexicana' }
    ]
  },
  {
    // Cuauhtémoc: Último Tlatoani Mexica, joven guerrero digno y heroico
    match: ['cuauhtemoc', 'cuauhtemotzin', 'tlatoani'],
    options: [
      { id: 'es-PE-AlexNeural', label: 'Tlatoani Cuauhtémoc · Opción A', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Joven guerrero mexica de voz firme, digna, fluida y articulación nítida' },
      { id: 'es-MX-JorgeNeural', label: 'Tlatoani Cuauhtémoc (Grave) · Opción B', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Resonancia heroica y solemne' },
      { id: 'es-US-AlonsoNeural', label: 'Tlatoani Cuauhtémoc (Sereno) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Temple estoico y claro' }
    ]
  },
  {
    // Sor Juana Inés de la Cruz: Décima Musa, dicción poética y cristalina
    match: ['sor juana', 'juana ines', 'asbaje', 'decima musa'],
    options: [
      { id: 'es-CO-SalomeNeural', label: 'Sor Juana Inés (Poética) · Opción A', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Dicción literaria impecable, culta, cristalina y fluida' },
      { id: 'es-MX-DaliaNeural', label: 'Sor Juana Inés (México) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Calidez reflexiva y filosófica' },
      { id: 'es-PE-CamilaNeural', label: 'Sor Juana Inés (Lírica) · Opción C', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Suavidad lírica y claridad silábica' }
    ]
  },
  {
    // Benito Juárez García: Benemérito de las Américas, sobrio y jurídico
    match: ['juarez', 'benito juarez', 'benemerito', 'guelatao'],
    options: [
      { id: 'es-MX-JorgeNeural', label: 'Presidente Benito Juárez · Opción A', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Estadista republicano sobrio, fluido y de dicción jurídica impecable' },
      { id: 'es-CO-GonzaloNeural', label: 'Benito Juárez (Jurista) · Opción B', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Oratoria constitucional cristalina' },
      { id: 'es-US-AlonsoNeural', label: 'Benito Juárez (Sereno) · Opción C', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Firmeza republicana templada' }
    ]
  },
  {
    // Francisco Villa: Centauro del Norte, voz enérgica, franca y humana
    match: ['villa', 'doroteo', 'arango', 'centauro'],
    options: [
      { id: 'es-MX-JorgeNeural', label: 'General Francisco Villa · Opción A', prosodyRate: '+2%', prosodyPitch: '-1Hz', description: 'Voz norteña enérgica, franca, ágil y de dicción directa' },
      { id: 'es-US-AlonsoNeural', label: 'Francisco Villa (Dinámico) · Opción B', prosodyRate: '+2%', prosodyPitch: '-1Hz', description: 'Cadencia ágil de comandante en campaña' },
      { id: 'es-PE-AlexNeural', label: 'Francisco Villa (Brioso) · Opción C', prosodyRate: '+2%', prosodyPitch: '+0Hz', description: 'Timbre vibrante y decidido' }
    ]
  },
  {
    // Emiliano Zapata: Caudillo del Sur, templado y profundo
    match: ['zapata', 'emiliano zapata', 'anenecuilco', 'caudillo del sur'],
    options: [
      { id: 'es-MX-JorgeNeural', label: 'General Emiliano Zapata · Opción A', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Voz sureña firme, templada, fluida y de gran claridad' },
      { id: 'es-US-AlonsoNeural', label: 'Emiliano Zapata (Sereno) · Opción B', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Convicción agrarista serena y nítida' },
      { id: 'es-CO-GonzaloNeural', label: 'Emiliano Zapata (Manifiesto) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Dicción clara del Plan de Ayala' }
    ]
  },
  {
    // Francisco I. Madero: Apóstol de la Democracia, culto, amable y elocuente
    match: ['madero', 'francisco i madero', 'apostol de la democracia'],
    options: [
      { id: 'es-CO-GonzaloNeural', label: 'Presidente Francisco I. Madero · Opción A', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Idealista democrático, dicción culta, fluida y perfectamente articulada' },
      { id: 'es-US-AlonsoNeural', label: 'Francisco I. Madero (Cálido) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Tono conciliador y humano' },
      { id: 'es-MX-JorgeNeural', label: 'Francisco I. Madero (México) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Firmeza institucional mexicana' }
    ]
  },
  {
    // General Felipe Ángeles: Estratega humanista y académico
    match: ['felipe angeles', 'general angeles'],
    options: [
      { id: 'es-US-AlonsoNeural', label: 'General Felipe Ángeles · Opción A', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Militar académico y humanista, caballeroso y de dicción cristalina' },
      { id: 'es-CO-GonzaloNeural', label: 'General Felipe Ángeles (Docto) · Opción B', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Precisión intelectual y fluidez' },
      { id: 'es-MX-JorgeNeural', label: 'General Felipe Ángeles (México) · Opción C', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Temple leal y reflexivo' }
    ]
  },
  {
    // Carmen Serdán Alatriste y Leona Vicario: Heroínas jóvenes de dicción clara y valiente
    match: ['carmen serdan', 'leona vicario', 'gertrudis bocanegra', 'malintzin', 'malinche'],
    options: [
      { id: 'es-PE-CamilaNeural', label: 'Heroína Patria (Joven) · Opción A', prosodyRate: '+2%', prosodyPitch: '+1Hz', description: 'Joven revolucionaria e insurgente, dulce, fluida y nítida' },
      { id: 'es-MX-DaliaNeural', label: 'Heroína Patria (México) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Calidez mexicana y convicción patriótica' },
      { id: 'es-CO-SalomeNeural', label: 'Heroína Patria (Ilustrada) · Opción C', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Articulación limpia y elocuente' }
    ]
  },
  {
    // Aquiles Serdán: Joven mártir revolucionario
    match: ['aquiles serdan'],
    options: [
      { id: 'es-PE-AlexNeural', label: 'Aquiles Serdán · Opción A', prosodyRate: '+2%', prosodyPitch: '+0Hz', description: 'Joven revolucionario firme, apasionado y de dicción fluida' },
      { id: 'es-US-AlonsoNeural', label: 'Aquiles Serdán (Firme) · Opción B', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Timbre decidido y limpio' },
      { id: 'es-MX-JorgeNeural', label: 'Aquiles Serdán (México) · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Resonancia patriótica' }
    ]
  },
  {
    // Andrés Quintana Roo, Belisario Domínguez y Ricardo Flores Magón: Tribunos, periodistas y juristas
    match: ['quintana roo', 'belisario dominguez', 'belisario', 'flores magon', 'magon'],
    options: [
      { id: 'es-CO-GonzaloNeural', label: 'Tribuno / Jurista Patrio · Opción A', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Dicción parlamentaria y periodística de máxima claridad y fluidez' },
      { id: 'es-US-AlonsoNeural', label: 'Tribuno / Humanista · Opción B', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Voz cálida, digna y fluida' },
      { id: 'es-MX-JorgeNeural', label: 'Tribuno Mexicano · Opción C', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Peso institucional y firmeza ética' }
    ]
  },
  {
    // Guadalupe Victoria y José Guadalupe Posada
    match: ['guadalupe victoria', 'guadalupe posada', 'posada'],
    options: [
      { id: 'es-US-AlonsoNeural', label: 'Voz Republicana / Cronista · Opción A', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Voz cálida, cercana, humana y de articulación fluida' },
      { id: 'es-MX-JorgeNeural', label: 'Voz Mexicana Clásica · Opción B', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Timbre mexicano tradicional y claro' },
      { id: 'es-CO-GonzaloNeural', label: 'Voz Histórica Ilustrada · Opción C', prosodyRate: '+1%', prosodyPitch: '+0Hz', description: 'Dicción pulcra y fluida' }
    ]
  },
  {
    // Lázaro Cárdenas, Plutarco Elías Calles y Gustavo Díaz Ordaz: Presidentes del Siglo XX
    match: ['lazaro cardenas', 'cardenas', 'plutarco elias calles', 'calles', 'gustavo diaz ordaz', 'diaz ordaz'],
    options: [
      { id: 'es-MX-JorgeNeural', label: 'Estadista Presidencial (México) · Opción A', prosodyRate: '+0%', prosodyPitch: '-2Hz', description: 'Oratoria de Estado mexicana, grave, fluida y de dicción perfecta' },
      { id: 'es-CO-GonzaloNeural', label: 'Estadista Institucional · Opción B', prosodyRate: '+0%', prosodyPitch: '-1Hz', description: 'Articulación institucional clara y solemne' },
      { id: 'es-US-AlonsoNeural', label: 'Estadista Republicano · Opción C', prosodyRate: '+1%', prosodyPitch: '-1Hz', description: 'Tono firme y equilibrado' }
    ]
  }
];

/**
 * Función de Selección Inteligente de Voz por Personaje, Edad y Variante (A, B, C)
 */
export function resolveCharacterVoice(
  characterName: string, 
  historicalAge?: number, 
  variantIndex: 0 | 1 | 2 = 0,
  birthOrDeathDates?: string
): VoiceMatrixOption {
  const norm = (characterName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const idx = Math.min(2, Math.max(0, variantIndex)) as 0 | 1 | 2;

  for (const entry of CHARACTER_BESPOKE_VOICES) {
    if (entry.match.some(m => norm.includes(m))) {
      return entry.options[idx];
    }
  }

  const cohort = inferCharacterAgeCohort(characterName, historicalAge, birthOrDeathDates);
  const cohortVoices = HISTORICAL_VOICE_MATRIX[cohort];
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
  const finalRate = overrides?.voiceRate || profile.prosodyRate || expressive.rate;
  const finalPitch = overrides?.voicePitch || profile.prosodyPitch || expressive.pitch;
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
  role?: 'character' | 'narrator' | 'pedagogical' | 'mentor' | 'language_tutor';
  narratorMode?: NarratorMode;
  voiceId?: string;
  language?: 'es' | 'en' | 'fr' | string;
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
export async function playUniversalIskoolVoice(
  optionsOrText: UniversalVoicePlayOptions | string,
  extraOptions?: Omit<UniversalVoicePlayOptions, 'text'>
): Promise<UniversalAudioController> {
  const options: UniversalVoicePlayOptions =
    typeof optionsOrText === 'string'
      ? { text: optionsOrText, ...(extraOptions || {}) }
      : optionsOrText;

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
  const rawLang = (language || '').toLowerCase();
  const effectiveLang: 'es' | 'en' | 'fr' = rawLang.startsWith('fr')
    ? 'fr'
    : rawLang.startsWith('en')
    ? 'en'
    : voiceId?.startsWith('fr-')
    ? 'fr'
    : voiceId?.startsWith('en-')
    ? 'en'
    : 'es';
  const cacheKey = `${voiceId || characterName || role}::${effectiveLang}::${narratorMode}::${rate}::${pitch}::${cleanText}`;

  // Intentar primero con el motor neural de alta fidelidad
  try {
    let audioUrl = universalAudioBlobCache.get(cacheKey);

    if (!audioUrl) {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
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
    // El archivo MP3 neural de 24kHz ya viene sintetizado con la prosodia humana exacta;
    // mantener playbackRate en 1.0 evita artefactos metálicos por time-stretching del navegador.
    audio.playbackRate = 1.0;

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

      // 1. Preprocesamiento humano: pausas orgánicas y expansión de abreviaturas
      const humanizedText = cleanText
        .replace(/([,;:.?!])/g, '$1 ')
        .replace(/\s+/g, ' ')
        .replace(/\bProf\.\s*/gi, 'Professor ')
        .replace(/\bDr\.\s*/gi, 'Doctor ')
        .replace(/\bMr\.\s*/gi, 'Mister ')
        .replace(/\bMrs\.\s*/gi, 'Missus ')
        .replace(/\bMs\.\s*/gi, 'Miss ')
        .replace(/\bMme\.\s*/gi, 'Madame ')
        .replace(/\bM\.\s*/gi, 'Monsieur ')
        .replace(/\betc\./gi, 'et cetera')
        .replace(/\be\.g\./gi, 'for example')
        .replace(/\bi\.e\./gi, 'that is')
        .replace(/\bCafé\b/g, 'Cafe')
        .replace(/\bNo\.\s*/gi, 'Number ')
        .trim();

      const pipeline = getLanguagePipeline(voiceId || effectiveLang);
      const speechText = pipeline.applyPhonetics(pipeline.normalizeText(humanizedText), 'plain');
      const utterance = new SpeechSynthesisUtterance(speechText);
      const voices = window.speechSynthesis.getVoices();

      // 2. Detección exhaustiva de género biológico para separación de voces Arthur vs Claire
      const voiceIdLower = (voiceId || '').toLowerCase();
      const nameLower = (characterName || '').toLowerCase();
      const isExplicitMale = effectiveGender === 'male' || 
                             nameLower.includes('arthur') || 
                             nameLower.includes('henri') || 
                             nameLower.includes('shakespeare') || 
                             nameLower.includes('lincoln') || 
                             nameLower.includes('napoleon') ||
                             voiceIdLower.includes('guy') || 
                             voiceIdLower.includes('male') || 
                             voiceIdLower.includes('ryan') || 
                             voiceIdLower.includes('jean');
      const isExplicitFemale = effectiveGender === 'female' || 
                               nameLower.includes('claire') || 
                               nameLower.includes('sophie') || 
                               nameLower.includes('ada') || 
                               nameLower.includes('curie') ||
                               voiceIdLower.includes('jenny') || 
                               voiceIdLower.includes('female') || 
                               voiceIdLower.includes('sonia') || 
                               voiceIdLower.includes('vivienne') ||
                               voiceIdLower.includes('denise');
      const isMale = isExplicitMale && !isExplicitFemale;

      if (pipeline.language === 'en') {
        utterance.lang = pipeline.locale || 'en-US';
        const englishVoices = voices.filter(v => 
          v.lang.toLowerCase().replace('_', '-').startsWith('en')
        );

        if (isMale) {
          // Arthur, Shakespeare, Lincoln (Voz Masculina)
          const maleVoice = englishVoices.find(v => {
            const n = v.name.toLowerCase();
            const isKnownFemale = n.includes('zira') || n.includes('jenny') || n.includes('aria') || 
                                  n.includes('sonia') || n.includes('samantha') || n.includes('victoria') || 
                                  n.includes('claire') || n.includes('hazel') || n.includes('female') || 
                                  n.includes('karen') || n.includes('susan') || n.includes('female');
            if (isKnownFemale) return false;
            return n.includes('david') || n.includes('guy') || n.includes('mark') || 
                   n.includes('george') || n.includes('ryan') || n.includes('arthur') || 
                   n.includes('richard') || n.includes('daniel') || n.includes('male') || 
                   n.includes('james') || n.includes('steven') || n.includes('google us english') ||
                   (n.includes('natural') && !n.includes('female'));
          });

          if (maleVoice) {
            utterance.voice = maleVoice;
            utterance.pitch = pitch * 0.86; // Tono barítono masculino cálido
            utterance.rate = rate * 0.90;   // Cadencia reflexiva y académica masculina
          } else {
            // Calibración acústica profunda para sistemas con solo una voz instalada (e.g. Zira en Windows)
            if (englishVoices.length > 0) utterance.voice = englishVoices[0];
            utterance.pitch = pitch * 0.68; // Descenso formántico profundo a barítono masculino inconfundible
            utterance.rate = rate * 0.88;   // Cadencia reflexiva y académica
          }
        } else {
          // Claire, Ada Lovelace (Voz Femenina)
          const femaleVoice = englishVoices.find(v => {
            const n = v.name.toLowerCase();
            return n.includes('zira') || n.includes('jenny') || n.includes('aria') || 
                   n.includes('sonia') || n.includes('samantha') || n.includes('victoria') || 
                   n.includes('claire') || n.includes('hazel') || n.includes('female') || 
                   n.includes('karen') || n.includes('susan') || n.includes('google uk english female');
          }) || englishVoices[0];

          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = pitch * 1.15; // Tono cálido, melódico y pedagógico femenino
          utterance.rate = rate * 0.92;   // Articulación pedagógica clara
        }
      } else if (pipeline.language === 'fr') {
        utterance.lang = pipeline.locale || 'fr-FR';
        const frenchVoices = voices.filter(v => 
          v.lang.toLowerCase().replace('_', '-').startsWith('fr')
        );

        if (isMale) {
          // Henri, Napoléon, Victor Hugo (Voz Masculina)
          const maleVoice = frenchVoices.find(v => {
            const n = v.name.toLowerCase();
            const isKnownFemale = n.includes('julie') || n.includes('hortense') || n.includes('denise') || 
                                  n.includes('vivienne') || n.includes('sylvie') || n.includes('eloise') || 
                                  n.includes('femme') || n.includes('female');
            if (isKnownFemale) return false;
            return n.includes('paul') || n.includes('henri') || n.includes('antoine') || 
                   n.includes('jean') || n.includes('remy') || n.includes('claude') || 
                   n.includes('homme') || n.includes('male');
          });

          if (maleVoice) {
            utterance.voice = maleVoice;
            utterance.pitch = pitch * 0.86;
            utterance.rate = rate * 0.90;
          } else {
            if (frenchVoices.length > 0) utterance.voice = frenchVoices[0];
            utterance.pitch = pitch * 0.70;
            utterance.rate = rate * 0.88;
          }
        } else {
          // Sophie, Marie Curie, Jeanne d'Arc (Voz Femenina)
          const femaleVoice = frenchVoices.find(v => {
            const n = v.name.toLowerCase();
            return n.includes('julie') || n.includes('hortense') || n.includes('denise') || 
                   n.includes('vivienne') || n.includes('sylvie') || n.includes('eloise') || 
                   n.includes('femme') || n.includes('female');
          }) || frenchVoices[0];

          if (femaleVoice) utterance.voice = femaleVoice;
          utterance.pitch = pitch * 1.14;
          utterance.rate = rate * 0.92;
        }
      } else if (characterName) {
        configureHistoricalUtterance(utterance, characterName, historicalAge);
      } else {
        const localVoice = selectHistoricalSpeechVoice(effectiveGender);
        if (localVoice) utterance.voice = localVoice;
        utterance.lang = 'es-MX';
        utterance.rate = rate * (effectiveGender === 'female' ? 0.93 : 0.89);
        utterance.pitch = pitch * (effectiveGender === 'female' ? 1.08 : 0.82);
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
  cx: number;         // Centro anatómico en espacio 1024
  cy: number;
  x2: number;         // Comisura derecha en espacio 1024
  y2: number;
  chinY?: number;     // Borde inferior del mentón/mandíbula en espacio 1024
  eyeY?: number;      // Altura de párpados en espacio 1024
  leftEyeX?: number;  // Centro ojo izquierdo en espacio 1024
  rightEyeX?: number; // Centro ojo derecho en espacio 1024
  eyeRadius?: number; // Radio ocular en espacio 1024
  baseOpen?: number;  // Apertura labial base en el render original (0 = cerrado, 0.35 = sonrisa abierta)
  bustCrop?: { focusX: number; focusY: number; zoom: number }; // Encuadre inteligente para retratos de cuerpo medio
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
  const is2DPortrait = norm.includes('2d') || norm.includes('.jpg');

  // 1. NAPOLÉON BONAPARTE (3D: /images/languages/3d/napoleon_3d.webp | 2D: /images/languages/historical/napoleon.jpg)
  if (norm.includes('napoleon') || norm.includes('bonaparte')) {
    if (is2DPortrait) {
      return {
        x1: 468, y1: 380, cx: 498, cy: 380, x2: 528, y2: 380,
        chinY: 428, eyeY: 282, leftEyeX: 454, rightEyeX: 542, eyeRadius: 18, baseOpen: 0,
        maxOpening: 14, cavityDarkColor: '#180407', cavityMidColor: '#330a10', cavityRimColor: '#58141d',
        lowerLipRimColor: 'rgba(185, 88, 82, 0.92)', teethColor: '#eee3d6'
      };
    }
    return {
      x1: 486, y1: 264, cx: 512, cy: 266, x2: 538, y2: 264,
      chinY: 304, eyeY: 196, leftEyeX: 480, rightEyeX: 544, eyeRadius: 16, baseOpen: 0.18,
      maxOpening: 14, cavityDarkColor: '#180407', cavityMidColor: '#330a10', cavityRimColor: '#58141d',
      lowerLipRimColor: 'rgba(185, 88, 82, 0.92)', teethColor: '#eee3d6'
    };
  }

  // 2. WILLIAM SHAKESPEARE (3D: /images/languages/3d/shakespeare_3d.webp | 2D: /images/languages/historical/shakespeare.jpg)
  if (norm.includes('shakespeare')) {
    if (is2DPortrait) {
      return {
        x1: 446, y1: 478, cx: 480, cy: 478, x2: 514, y2: 478,
        chinY: 554, eyeY: 342, leftEyeX: 438, rightEyeX: 534, eyeRadius: 20, baseOpen: 0,
        maxOpening: 14, cavityDarkColor: '#140507', cavityMidColor: '#2e0d11', cavityRimColor: '#4e171e',
        lowerLipRimColor: 'rgba(180, 85, 78, 0.92)', teethColor: '#f0e5d8', mustacheCover: true
      };
    }
    return {
      x1: 474, y1: 318, cx: 510, cy: 320, x2: 546, y2: 318,
      chinY: 382, eyeY: 232, leftEyeX: 462, rightEyeX: 554, eyeRadius: 24, baseOpen: 0.32,
      maxOpening: 15, cavityDarkColor: '#140507', cavityMidColor: '#2e0d11', cavityRimColor: '#4e171e',
      lowerLipRimColor: 'rgba(180, 85, 78, 0.92)', teethColor: '#f0e5d8', mustacheCover: true
    };
  }

  // 3. ABRAHAM LINCOLN (3D: /images/languages/3d/abraham_lincoln_3d.webp | 2D: /images/languages/historical/abraham_lincoln.jpg)
  if (norm.includes('lincoln') || norm.includes('abraham')) {
    if (is2DPortrait) {
      return {
        x1: 476, y1: 462, cx: 518, cy: 462, x2: 560, y2: 462,
        chinY: 575, eyeY: 320, leftEyeX: 462, rightEyeX: 570, eyeRadius: 20, baseOpen: 0,
        maxOpening: 14, cavityDarkColor: '#120406', cavityMidColor: '#2b0b0e', cavityRimColor: '#4a1419',
        lowerLipRimColor: 'rgba(170, 80, 75, 0.90)', teethColor: '#ebe0d2'
      };
    }
    return {
      x1: 490, y1: 263, cx: 524, cy: 264, x2: 558, y2: 263,
      chinY: 348, eyeY: 188, leftEyeX: 482, rightEyeX: 564, eyeRadius: 18, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#120406', cavityMidColor: '#2b0b0e', cavityRimColor: '#4a1419',
      lowerLipRimColor: 'rgba(170, 80, 75, 0.90)', teethColor: '#ebe0d2'
    };
  }

  // 4. ADA LOVELACE (3D: /images/languages/3d/ada_lovelace_3d.webp | 2D: /images/languages/historical/ada_lovelace.jpg)
  if (norm.includes('ada') || norm.includes('lovelace')) {
    if (is2DPortrait) {
      return {
        x1: 504, y1: 344, cx: 530, cy: 344, x2: 556, y2: 344,
        chinY: 392, eyeY: 248, leftEyeX: 484, rightEyeX: 570, eyeRadius: 18, baseOpen: 0,
        maxOpening: 14, cavityDarkColor: '#1a0408', cavityMidColor: '#380a12', cavityRimColor: '#5e121e',
        lowerLipRimColor: 'rgba(210, 90, 105, 0.94)', teethColor: '#fff6ed'
      };
    }
    return {
      x1: 472, y1: 388, cx: 512, cy: 390, x2: 552, y2: 388,
      chinY: 438, eyeY: 288, leftEyeX: 452, rightEyeX: 570, eyeRadius: 30, baseOpen: 0.35,
      maxOpening: 16, cavityDarkColor: '#1a0408', cavityMidColor: '#380a12', cavityRimColor: '#5e121e',
      lowerLipRimColor: 'rgba(210, 90, 105, 0.94)', teethColor: '#fff6ed'
    };
  }

  // 5. MARIE CURIE (3D: /images/languages/3d/marie_curie_3d.webp | 2D: /images/languages/historical/marie_curie.jpg)
  if (norm.includes('curie') || norm.includes('marie')) {
    if (is2DPortrait) {
      return {
        x1: 472, y1: 460, cx: 504, cy: 460, x2: 536, y2: 460,
        chinY: 522, eyeY: 332, leftEyeX: 454, rightEyeX: 558, eyeRadius: 18, baseOpen: 0,
        maxOpening: 13, cavityDarkColor: '#1c050a', cavityMidColor: '#3a0e16', cavityRimColor: '#601924',
        lowerLipRimColor: 'rgba(195, 92, 100, 0.92)', teethColor: '#f6efe6'
      };
    }
    return {
      x1: 492, y1: 242, cx: 518, cy: 244, x2: 544, y2: 242,
      chinY: 280, eyeY: 176, leftEyeX: 480, rightEyeX: 552, eyeRadius: 20, baseOpen: 0.28,
      maxOpening: 13, cavityDarkColor: '#1c050a', cavityMidColor: '#3a0e16', cavityRimColor: '#601924',
      lowerLipRimColor: 'rgba(195, 92, 100, 0.92)', teethColor: '#f6efe6'
    };
  }

  // 6. VICTOR HUGO (3D: /images/languages/3d/victor_hugo_3d.webp | 2D: /images/languages/historical/victor_hugo.jpg)
  if (norm.includes('victor') || norm.includes('hugo')) {
    if (is2DPortrait) {
      return {
        x1: 484, y1: 402, cx: 520, cy: 402, x2: 556, y2: 402,
        chinY: 486, eyeY: 292, leftEyeX: 468, rightEyeX: 572, eyeRadius: 18, baseOpen: 0,
        maxOpening: 13, cavityDarkColor: '#0c0203', cavityMidColor: '#240407', cavityRimColor: '#400e12',
        lowerLipRimColor: 'rgba(155, 78, 72, 0.90)', teethColor: '#eae1d2', mustacheCover: true
      };
    }
    return {
      x1: 474, y1: 455, cx: 510, cy: 455, x2: 546, y2: 455,
      chinY: 576, eyeY: 308, leftEyeX: 446, rightEyeX: 570, eyeRadius: 22, baseOpen: 0,
      maxOpening: 15, cavityDarkColor: '#0c0203', cavityMidColor: '#240407', cavityRimColor: '#400e12',
      lowerLipRimColor: 'rgba(155, 78, 72, 0.90)', teethColor: '#eae1d2', mustacheCover: true
    };
  }

  // 7. JEANNE D'ARC (3D: /images/languages/3d/jeanne_darc_3d.webp | 2D: /images/languages/historical/jeanne_darc.jpg)
  if (norm.includes('jeanne') || norm.includes('darc') || norm.includes('arc')) {
    if (is2DPortrait) {
      return {
        x1: 488, y1: 390, cx: 516, cy: 390, x2: 544, y2: 390,
        chinY: 438, eyeY: 286, leftEyeX: 464, rightEyeX: 568, eyeRadius: 18, baseOpen: 0,
        maxOpening: 13, cavityDarkColor: '#120305', cavityMidColor: '#2a060b', cavityRimColor: '#461117',
        lowerLipRimColor: 'rgba(185, 90, 90, 0.92)', teethColor: '#f2ebe0'
      };
    }
    return {
      x1: 478, y1: 436, cx: 514, cy: 437, x2: 550, y2: 436,
      chinY: 498, eyeY: 314, leftEyeX: 444, rightEyeX: 580, eyeRadius: 28, baseOpen: 0,
      maxOpening: 15, cavityDarkColor: '#120305', cavityMidColor: '#2a060b', cavityRimColor: '#461117',
      lowerLipRimColor: 'rgba(185, 90, 90, 0.92)', teethColor: '#f2ebe0'
    };
  }

  // 8. MENTOR FEMENINO 3D (/images/languages/3d/mentor_female_3d.webp)
  if (norm.includes('female') || norm.includes('claire') || norm.includes('sophie') || norm.includes('elara') || norm.includes('fem') || norm.includes('mme') || norm.includes('mentor_female')) {
    return {
      x1: 464, y1: 370, cx: 516, cy: 374, x2: 568, y2: 370,
      chinY: 424, eyeY: 256, leftEyeX: 444, rightEyeX: 588, eyeRadius: 34, baseOpen: 0.38,
      maxOpening: 16, cavityDarkColor: '#1e0409', cavityMidColor: '#3e0c15', cavityRimColor: '#681622',
      lowerLipRimColor: 'rgba(215, 92, 105, 0.94)', teethColor: '#fff7f0'
    };
  }

  // 9. MENTOR MASCULINO 3D (/images/languages/3d/mentor_male_3d_v2.webp)
  if (norm.includes('male') || norm.includes('arthur') || norm.includes('henri') || norm.includes('prof') || norm.includes('mentor_male')) {
    return {
      x1: 448, y1: 292, cx: 486, cy: 294, x2: 524, y2: 292,
      chinY: 350, eyeY: 196, leftEyeX: 442, rightEyeX: 534, eyeRadius: 24, baseOpen: 0.30,
      maxOpening: 14, cavityDarkColor: '#160406', cavityMidColor: '#300a0e', cavityRimColor: '#521319',
      lowerLipRimColor: 'rgba(178, 82, 75, 0.90)', teethColor: '#eee4d6', mustacheCover: true
    };
  }

  // =========================================================================
  // CATÁLOGO COMPLETO DE PERSONAJES HISTÓRICOS MEXICANOS (CALIBRACIÓN SUB-PÍXEL VERIFICADA)
  // =========================================================================

  // 10. EMILIANO ZAPATA (/images/history/emiliano_zapata_avatar.png)
  if (norm.includes('zapata') || norm.includes('emiliano') || norm.includes('anenecuilco')) {
    return {
      x1: 516, y1: 562, cx: 566, cy: 560, x2: 616, y2: 562,
      chinY: 648, eyeY: 422, leftEyeX: 500, rightEyeX: 626, eyeRadius: 22, baseOpen: 0,
      maxOpening: 15, cavityDarkColor: '#0e0204', cavityMidColor: '#26050a', cavityRimColor: '#440d14',
      lowerLipRimColor: 'rgba(152, 62, 54, 0.92)', teethColor: '#ede4d6', mustacheCover: true
    };
  }

  // 11. BENITO JUÁREZ (/images/history/benito_juarez_avatar.png)
  if (norm.includes('juarez') || norm.includes('benito') || norm.includes('guelatao') || norm.includes('benemerito')) {
    return {
      x1: 462, y1: 355, cx: 500, cy: 353, x2: 538, y2: 355,
      chinY: 420, eyeY: 252, leftEyeX: 452, rightEyeX: 552, eyeRadius: 18, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#160406', cavityMidColor: '#320a10', cavityRimColor: '#52131a',
      lowerLipRimColor: 'rgba(168, 76, 70, 0.90)', teethColor: '#eee4d8'
    };
  }

  // 12. SOR JUANA INÉS DE LA CRUZ (/images/history/sor_juana_avatar.png)
  if (norm.includes('sor juana') || norm.includes('juana ines') || norm.includes('asbaje') || norm.includes('decima musa') || norm.includes('nepantla')) {
    return {
      x1: 486, y1: 331, cx: 511, cy: 332, x2: 536, y2: 331,
      chinY: 382, eyeY: 256, leftEyeX: 472, rightEyeX: 548, eyeRadius: 16, baseOpen: 0,
      maxOpening: 13, cavityDarkColor: '#1c0409', cavityMidColor: '#3e0c16', cavityRimColor: '#641624',
      lowerLipRimColor: 'rgba(202, 88, 98, 0.94)', teethColor: '#fff5ec'
    };
  }

  // 13. JOSÉ MARÍA MORELOS Y PAVÓN (/images/history/morelos_avatar.png)
  if (norm.includes('morelos') || norm.includes('siervo de la nacion') || norm.includes('apatzingan') || norm.includes('cuautla')) {
    return {
      x1: 482, y1: 314, cx: 510, cy: 314, x2: 538, y2: 314,
      chinY: 374, eyeY: 232, leftEyeX: 468, rightEyeX: 552, eyeRadius: 16, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#100305', cavityMidColor: '#2a070c', cavityRimColor: '#480e14',
      lowerLipRimColor: 'rgba(160, 70, 65, 0.90)', teethColor: '#ede4d6'
    };
  }

  // 14. CUAUHTÉMOC (/images/history/cuauhtemoc_avatar.png)
  if (norm.includes('cuauhtemoc') || norm.includes('cuauhtemotzin') || norm.includes('tlatoani') || norm.includes('joven abuelo')) {
    return {
      x1: 474, y1: 446, cx: 510, cy: 446, x2: 546, y2: 446,
      chinY: 506, eyeY: 336, leftEyeX: 460, rightEyeX: 560, eyeRadius: 18, baseOpen: 0,
      maxOpening: 15, cavityDarkColor: '#140305', cavityMidColor: '#30080e', cavityRimColor: '#501117',
      lowerLipRimColor: 'rgba(172, 78, 68, 0.92)', teethColor: '#f2eae0'
    };
  }

  // 15. IGNACIO ALLENDE (/images/history/ignacio_allende_avatar.png)
  if (norm.includes('allende') || norm.includes('ignacio allende') || norm.includes('san miguel')) {
    return {
      x1: 480, y1: 330, cx: 508, cy: 330, x2: 536, y2: 330,
      chinY: 386, eyeY: 244, leftEyeX: 466, rightEyeX: 552, eyeRadius: 16, baseOpen: 0,
      maxOpening: 13, cavityDarkColor: '#140407', cavityMidColor: '#2e0910', cavityRimColor: '#4c1219',
      lowerLipRimColor: 'rgba(175, 78, 75, 0.90)', teethColor: '#f0e6da', mustacheCover: true
    };
  }

  // 16. CARMEN SERDÁN ALATRISTE (/images/history/carmen_serdan_avatar.png)
  if (norm.includes('carmen serdan') || (norm.includes('serdan') && (norm.includes('carmen') || norm.includes('alatriste')))) {
    return {
      x1: 506, y1: 226, cx: 524, cy: 226, x2: 542, y2: 226,
      chinY: 256, eyeY: 172, leftEyeX: 498, rightEyeX: 548, eyeRadius: 12, baseOpen: 0,
      bustCrop: { focusX: 524, focusY: 220, zoom: 1.55 },
      maxOpening: 11, cavityDarkColor: '#1a0408', cavityMidColor: '#380a14', cavityRimColor: '#5e1420',
      lowerLipRimColor: 'rgba(195, 84, 92, 0.92)', teethColor: '#fdf3ea'
    };
  }

  // 17. AQUILES SERDÁN (/images/history/aquiles_serdan_avatar.png)
  if (norm.includes('aquiles serdan') || norm.includes('aquiles')) {
    return {
      x1: 488, y1: 240, cx: 511, cy: 240, x2: 534, y2: 240,
      chinY: 282, eyeY: 176, leftEyeX: 478, rightEyeX: 544, eyeRadius: 14, baseOpen: 0,
      bustCrop: { focusX: 511, focusY: 235, zoom: 1.35 },
      maxOpening: 12, cavityDarkColor: '#120406', cavityMidColor: '#28080d', cavityRimColor: '#461016',
      lowerLipRimColor: 'rgba(165, 72, 68, 0.90)', teethColor: '#ede4d8', mustacheCover: true
    };
  }

  // 18. FRANCISCO I. MADERO (/images/history/madero_avatar.png)
  if (norm.includes('madero') || norm.includes('francisco i madero') || norm.includes('apostol')) {
    return {
      x1: 477, y1: 332, cx: 511, cy: 332, x2: 545, y2: 332,
      chinY: 425, eyeY: 238, leftEyeX: 466, rightEyeX: 558, eyeRadius: 18, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#120406', cavityMidColor: '#28080d', cavityRimColor: '#461016',
      lowerLipRimColor: 'rgba(168, 76, 72, 0.90)', teethColor: '#ede4d8', mustacheCover: true
    };
  }

  // 19. LÁZARO CÁRDENAS DEL RÍO (/images/history/lazaro_cardenas_avatar.png)
  if (norm.includes('cardenas') || norm.includes('lazaro') || norm.includes('expropiacion')) {
    return {
      x1: 480, y1: 360, cx: 518, cy: 360, x2: 556, y2: 360,
      chinY: 452, eyeY: 258, leftEyeX: 460, rightEyeX: 570, eyeRadius: 18, baseOpen: 0,
      maxOpening: 15, cavityDarkColor: '#140407', cavityMidColor: '#2e0a10', cavityRimColor: '#4c131a',
      lowerLipRimColor: 'rgba(170, 76, 72, 0.90)', teethColor: '#eee5d8'
    };
  }

  // 20. PLUTARCO ELÍAS CALLES (/images/history/plutarco_elias_calles_avatar.png)
  if (norm.includes('calles') || norm.includes('plutarco')) {
    return {
      x1: 484, y1: 258, cx: 511, cy: 258, x2: 538, y2: 258,
      chinY: 306, eyeY: 186, leftEyeX: 476, rightEyeX: 546, eyeRadius: 14, baseOpen: 0,
      bustCrop: { focusX: 511, focusY: 250, zoom: 1.32 },
      maxOpening: 12, cavityDarkColor: '#100305', cavityMidColor: '#26070b', cavityRimColor: '#420e14',
      lowerLipRimColor: 'rgba(158, 68, 62, 0.90)', teethColor: '#ece2d4', mustacheCover: true
    };
  }

  // 21. RICARDO FLORES MAGÓN (/images/history/ricardo_flores_magon_avatar.png)
  if (norm.includes('magon') || norm.includes('flores magon') || norm.includes('regeneracion')) {
    return {
      x1: 506, y1: 374, cx: 536, cy: 374, x2: 566, y2: 374,
      chinY: 432, eyeY: 274, leftEyeX: 490, rightEyeX: 580, eyeRadius: 18, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#120406', cavityMidColor: '#2a090e', cavityRimColor: '#481218',
      lowerLipRimColor: 'rgba(162, 72, 68, 0.90)', teethColor: '#eee4d6'
    };
  }

  // 22. GUADALUPE VICTORIA (/images/history/guadalupe_victoria_avatar.png)
  if (norm.includes('guadalupe victoria') || (norm.includes('victoria') && !norm.includes('victor'))) {
    return {
      x1: 484, y1: 298, cx: 507, cy: 298, x2: 530, y2: 298,
      chinY: 346, eyeY: 222, leftEyeX: 474, rightEyeX: 542, eyeRadius: 15, baseOpen: 0,
      bustCrop: { focusX: 507, focusY: 280, zoom: 1.25 },
      maxOpening: 13, cavityDarkColor: '#120406', cavityMidColor: '#2a080d', cavityRimColor: '#461117',
      lowerLipRimColor: 'rgba(168, 76, 72, 0.90)', teethColor: '#ede4d6'
    };
  }

  // 23. ANDRÉS QUINTANA ROO (/images/history/andres_quintana_roo_avatar.png)
  if (norm.includes('quintana roo') || norm.includes('andres quintana')) {
    return {
      x1: 532, y1: 362, cx: 560, cy: 362, x2: 588, y2: 362,
      chinY: 420, eyeY: 268, leftEyeX: 514, rightEyeX: 596, eyeRadius: 17, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#140407', cavityMidColor: '#2c090f', cavityRimColor: '#4a1218',
      lowerLipRimColor: 'rgba(168, 76, 72, 0.90)', teethColor: '#ede5d8'
    };
  }

  // 24. BELISARIO DOMÍNGUEZ (/images/history/belisario_dominguez_avatar.png)
  if (norm.includes('belisario') || norm.includes('dominguez')) {
    return {
      x1: 484, y1: 295, cx: 511, cy: 295, x2: 538, y2: 295,
      chinY: 348, eyeY: 216, leftEyeX: 474, rightEyeX: 548, eyeRadius: 15, baseOpen: 0,
      bustCrop: { focusX: 511, focusY: 280, zoom: 1.22 },
      maxOpening: 13, cavityDarkColor: '#100305', cavityMidColor: '#26070b', cavityRimColor: '#420e14',
      lowerLipRimColor: 'rgba(156, 68, 62, 0.90)', teethColor: '#eae1d2', mustacheCover: true
    };
  }

  // 25. GENERAL FELIPE ÁNGELES (/images/history/felipe_angeles_avatar.png)
  if (norm.includes('angeles') || norm.includes('felipe angeles')) {
    return {
      x1: 470, y1: 306, cx: 496, cy: 306, x2: 522, y2: 306,
      chinY: 356, eyeY: 232, leftEyeX: 462, rightEyeX: 534, eyeRadius: 15, baseOpen: 0,
      bustCrop: { focusX: 496, focusY: 290, zoom: 1.22 },
      maxOpening: 13, cavityDarkColor: '#120406', cavityMidColor: '#2a080d', cavityRimColor: '#461117',
      lowerLipRimColor: 'rgba(164, 74, 70, 0.90)', teethColor: '#eee5d8', mustacheCover: true
    };
  }

  // 26. GUSTAVO DÍAZ ORDAZ (/images/history/gustavo_diaz_ordaz_avatar.png)
  if (norm.includes('diaz ordaz') || norm.includes('ordaz')) {
    return {
      x1: 470, y1: 456, cx: 513, cy: 456, x2: 556, y2: 456,
      chinY: 538, eyeY: 334, leftEyeX: 458, rightEyeX: 568, eyeRadius: 20, baseOpen: 0,
      maxOpening: 15, cavityDarkColor: '#140407', cavityMidColor: '#2e0a10', cavityRimColor: '#4c131a',
      lowerLipRimColor: 'rgba(164, 74, 70, 0.90)', teethColor: '#eee5d8'
    };
  }

  // 27. JOSÉ GUADALUPE POSADA (/images/history/jose_guadalupe_posada_avatar.png)
  if (norm.includes('posada') || norm.includes('guadalupe posada')) {
    return {
      x1: 552, y1: 332, cx: 584, cy: 332, x2: 616, y2: 332,
      chinY: 392, eyeY: 238, leftEyeX: 538, rightEyeX: 624, eyeRadius: 18, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#0e0204', cavityMidColor: '#240509', cavityRimColor: '#400c12',
      lowerLipRimColor: 'rgba(152, 64, 58, 0.90)', teethColor: '#ede4d6', mustacheCover: true
    };
  }

  // 28. FRANCISCO VILLA (/images/history/francisco_villa_avatar.png)
  if (norm.includes('villa') || norm.includes('doroteo') || norm.includes('arango') || norm.includes('centauro')) {
    return {
      x1: 490, y1: 340, cx: 516, cy: 340, x2: 542, y2: 340,
      chinY: 388, eyeY: 274, leftEyeX: 482, rightEyeX: 550, eyeRadius: 15, baseOpen: 0,
      bustCrop: { focusX: 516, focusY: 320, zoom: 1.32 },
      maxOpening: 13, cavityDarkColor: '#080102', cavityMidColor: '#1f0306', cavityRimColor: '#3d0b11',
      lowerLipRimColor: 'rgba(145, 60, 50, 0.92)', teethColor: '#ede5d8', mustacheCover: true
    };
  }

  // 29. JOSEFA ORTIZ DE DOMÍNGUEZ (/images/history/josefa_ortiz_avatar.png)
  if (norm.includes('josefa') || norm.includes('corregidora') || norm.includes('ortiz de dominguez')) {
    return {
      x1: 478, y1: 358, cx: 506, cy: 358, x2: 534, y2: 358,
      chinY: 416, eyeY: 266, leftEyeX: 464, rightEyeX: 550, eyeRadius: 18, baseOpen: 0,
      maxOpening: 13.5, cavityDarkColor: '#0a0102', cavityMidColor: '#240407', cavityRimColor: '#450d13',
      lowerLipRimColor: 'rgba(150, 48, 54, 0.92)', teethColor: '#f2ede4'
    };
  }

  // 30. DON MIGUEL HIDALGO Y COSTILLA (/images/history/hidalgo_avatar.png)
  if (norm.includes('hidalgo') || norm.includes('cura hidalgo') || norm.includes('costilla') || norm.includes('padre de la patria')) {
    return {
      x1: 472, y1: 344, cx: 506, cy: 344, x2: 540, y2: 344,
      chinY: 405, eyeY: 248, leftEyeX: 458, rightEyeX: 554, eyeRadius: 18, baseOpen: 0,
      maxOpening: 14, cavityDarkColor: '#090203', cavityMidColor: '#210508', cavityRimColor: '#3c0f14',
      lowerLipRimColor: 'rgba(165, 80, 75, 0.88)', teethColor: '#eee6da'
    };
  }

  // 31. LEONA VICARIO / PERSONAJE GENÉRICO (/images/history/personaje_generico_avatar.png)
  if (norm.includes('leona') || norm.includes('vicario')) {
    return {
      x1: 486, y1: 331, cx: 511, cy: 332, x2: 536, y2: 331,
      chinY: 382, eyeY: 256, leftEyeX: 472, rightEyeX: 548, eyeRadius: 16, baseOpen: 0,
      maxOpening: 12, cavityDarkColor: '#160408', cavityMidColor: '#340810', cavityRimColor: '#54101a',
      lowerLipRimColor: 'rgba(195, 84, 92, 0.92)', teethColor: '#fcf3eb'
    };
  }

  // Fallback seguro centrado adaptado a personaje_generico_avatar.png (520, 336)
  return {
    x1: 490, y1: 336, cx: 520, cy: 336, x2: 550, y2: 336,
    chinY: 418, eyeY: 242, leftEyeX: 474, rightEyeX: 566, eyeRadius: 18, baseOpen: 0,
    maxOpening: 13, cavityDarkColor: '#140306', cavityMidColor: '#2d0910', cavityRimColor: '#50121a',
    lowerLipRimColor: 'rgba(180, 76, 78, 0.90)', teethColor: '#f2eae0', mustacheCover: true
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
    speechRate: 0.97,
    speechPitch: 0.99,
    era: 'Elizabethan Era (1564 - 1616)',
    country: 'England',
    avatarEmoji: '📜',
    avatarImage: '/images/languages/3d/shakespeare_3d.webp',
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
    speechRate: 0.98,
    speechPitch: 1.01,
    era: 'Victorian Scientific Era (1815 - 1852)',
    country: 'United Kingdom',
    avatarEmoji: '⚙️',
    avatarImage: '/images/languages/3d/ada_lovelace_3d.webp',
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
    voiceId: 'en-US-AndrewMultilingualNeural',
    speechRate: 0.96,
    speechPitch: 0.98,
    era: 'American Civil War (1809 - 1865)',
    country: 'United States',
    avatarEmoji: '🏛️',
    avatarImage: '/images/languages/3d/abraham_lincoln_3d.webp',
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
    voiceId: 'fr-FR-RemyMultilingualNeural',
    speechRate: 0.98,
    speechPitch: 0.99,
    era: 'Premier Empire Français (1769 - 1821)',
    country: 'France',
    avatarEmoji: '⚔️',
    avatarImage: '/images/languages/3d/napoleon_3d.webp',
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
    speechRate: 0.98,
    speechPitch: 1.00,
    era: 'Révolution Scientifique (1867 - 1934)',
    country: 'France / Pologne',
    avatarEmoji: '🔬',
    avatarImage: '/images/languages/3d/marie_curie_3d.webp',
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
    speechRate: 0.97,
    speechPitch: 0.98,
    era: 'Romantisme & XIXe Siècle (1802 - 1885)',
    country: 'France',
    avatarEmoji: '📖',
    avatarImage: '/images/languages/3d/victor_hugo_3d.webp',
    canonicalIntro: 'Je suis Victor Hugo. J\'ai écrit Les Misérables et Notre-Dame de Paris pour donner une voix aux humbles et défendre la dignité humaine contre toute forme d\'oppression.',
    pdaRelevance: 'Riqueza estilística, narrativa emotiva y estructuras sintácticas compuestas del francés literario.',
    sampleQuestions: [
      'Pourquoi avez-vous créé le personnage de Jean Valjean?',
      'Que ressentiez-vous pendant vos années d\'exil à Guernesey?'
    ]
  },
  {
    id: 'jeanne_darc',
    name: 'Jeanne d\'Arc',
    language: 'fr',
    gender: 'female',
    voiceId: 'fr-FR-VivienneMultilingualNeural',
    speechRate: 0.99,
    speechPitch: 1.01,
    era: 'Guerre de Cent Ans (1412 - 1431)',
    country: 'France',
    avatarEmoji: '🛡️',
    avatarImage: '/images/languages/3d/jeanne_darc_3d.webp',
    canonicalIntro: 'Je suis Jeanne d\'Arc, la Pucelle d\'Orléans. À dix-sept ans, guidée par ma foi et mes voix, j\'ai levé le siège d\'Orléans et conduit le dauphin Charles à son sacre à Reims.',
    pdaRelevance: 'Léxico medieval heroico, oraciones afirmativas directas y entonación de convicción en francés.',
    sampleQuestions: [
      'Comment avez-vous convaincu le dauphin à Chinon?',
      'Racontez-nous la libération d\'Orléans en mai 1429.'
    ]
  }
];

