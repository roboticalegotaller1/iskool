/**
 * Motor de Configuración, Prosodia y Selección de Voz para Avatares Históricos Vivos (ISkool)
 * Arquitectura DSP & SSML Dinámico de Alta Fidelidad (Zero-Token Cost).
 * Nivel 3: Bloqueo Anti-Castellano, Normalizador Léxico Latino, Matriz de 30 Voces por Cohorte Etaria y Narradores Gamificados.
 */

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
  if (!text || typeof text !== 'string') return '';
  let result = text;

  // 1. Abreviaturas Históricas y Eclesiásticas
  const abbreviations = [
    { regex: /\bGral\./gi, replace: 'General' },
    { regex: /\bCap\./gi, replace: 'Capitán' },
    { regex: /\bCnel\./gi, replace: 'Coronel' },
    { regex: /\bDn\./gi, replace: 'Don' },
    { regex: /\bDña\./gi, replace: 'Doña' },
    { regex: /\bLic\./gi, replace: 'Licenciado' },
    { regex: /\bFray\b/gi, replace: 'Frai' },
    { regex: /\bSta\./gi, replace: 'Santa' },
    { regex: /\bSto\./gi, replace: 'Santo' },
    { regex: /\ba\.\s*C\./gi, replace: 'antes de Cristo' },
    { regex: /\bd\.\s*C\./gi, replace: 'después de Cristo' }
  ];
  for (const item of abbreviations) {
    result = result.replace(item.regex, item.replace);
  }

  // 2. Números Romanos para Siglos
  const centuries = [
    { regex: /\bSiglo\s+XXI\b/gi, replace: 'Siglo veintiuno' },
    { regex: /\bSiglo\s+XX\b/gi, replace: 'Siglo veinte' },
    { regex: /\bSiglo\s+XIX\b/gi, replace: 'Siglo diecinueve' },
    { regex: /\bSiglo\s+XVIII\b/gi, replace: 'Siglo dieciocho' },
    { regex: /\bSiglo\s+XVII\b/gi, replace: 'Siglo diecisiete' },
    { regex: /\bSiglo\s+XVI\b/gi, replace: 'Siglo dieciséis' },
    { regex: /\bSiglo\s+XV\b/gi, replace: 'Siglo quince' },
    { regex: /\bSiglo\s+XIV\b/gi, replace: 'Siglo catorce' },
    { regex: /\bSiglo\s+XIII\b/gi, replace: 'Siglo trece' },
    { regex: /\bSiglo\s+XII\b/gi, replace: 'Siglo doce' },
    { regex: /\bSiglo\s+XI\b/gi, replace: 'Siglo once' },
    { regex: /\bSiglo\s+X\b/gi, replace: 'Siglo diez' },
    { regex: /\bSiglo\s+IX\b/gi, replace: 'Siglo noveno' },
    { regex: /\bSiglo\s+VIII\b/gi, replace: 'Siglo octavo' },
    { regex: /\bSiglo\s+VII\b/gi, replace: 'Siglo séptimo' },
    { regex: /\bSiglo\s+VI\b/gi, replace: 'Siglo sexto' },
    { regex: /\bSiglo\s+V\b/gi, replace: 'Siglo quinto' },
    { regex: /\bSiglo\s+IV\b/gi, replace: 'Siglo cuarto' },
    { regex: /\bSiglo\s+III\b/gi, replace: 'Siglo tercero' },
    { regex: /\bSiglo\s+II\b/gi, replace: 'Siglo segundo' },
    { regex: /\bSiglo\s+I\b/gi, replace: 'Siglo primero' }
  ];
  for (const c of centuries) {
    result = result.replace(c.regex, c.replace);
  }

  // Nombres regnales y papales con ordinales en español
  const regnalNames = [
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime)\s+I\b/gi, replace: '$1 primero' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime|Moctezuma)\s+II\b/gi, replace: '$1 segundo' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime|Inocencio)\s+III\b/gi, replace: '$1 tercero' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime)\s+IV\b/gi, replace: '$1 cuarto' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime)\s+V\b/gi, replace: '$1 quinto' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime|Alejandro)\s+VI\b/gi, replace: '$1 sexto' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime)\s+VII\b/gi, replace: '$1 séptimo' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime|Octavio)\s+VIII\b/gi, replace: '$1 octavo' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime|Pío)\s+IX\b/gi, replace: '$1 noveno' },
    { regex: /\b(Felipe|Carlos|Fernando|Luis|Alfonso|Enrique|Pedro|Sancho|Juan|Jaime|León)\s+X\b/gi, replace: '$1 décimo' },
    { regex: /\b(Luis|Benedicto|Pío|Inocencio|Gregorio)\s+XVI\b/gi, replace: '$1 dieciséis' }
  ];
  for (const r of regnalNames) {
    result = result.replace(r.regex, r.replace);
  }

  // 3. Nahuatlismos y Nombres Prehispánicos (Acentuación Prosódica Fidedigna)
  const nahuatlisms = [
    { regex: /\bTenochtitlan\b/g, replace: 'Tenochtitlán' },
    { regex: /\bCuauhtemoc\b/g, replace: 'Cuauhtémoc' },
    { regex: /\bNezahualcoyotl\b/g, replace: 'Nezahualcóyotl' },
    { regex: /\bIztaccihuatl\b/g, replace: 'Iztaccíhuatl' },
    { regex: /\bXicotencatl\b/g, replace: 'Xicoténcatl' },
    { regex: /\bPopocatepetl\b/g, replace: 'Popocatépetl' },
    { regex: /\bCuitlahuac\b/g, replace: 'Cuitláhuac' },
    { regex: /\bTeotihuacan\b/g, replace: 'Teotihuacán' },
    { regex: /\bQuetzalcoatl\b/g, replace: 'Quetzalcóatl' },
    { regex: /\bAcolhuacan\b/g, replace: 'Acolhuacán' },
    { regex: /\bAnahuac\b/g, replace: 'Anáhuac' },
    { regex: /\bCoyoacan\b/g, replace: 'Coyoacán' },
    { regex: /\bMichoacan\b/g, replace: 'Michoacán' },
    { regex: /\bYucatan\b/g, replace: 'Yucatán' },
    { regex: /\bTlacaelel\b/g, replace: 'Tlacaélel' }
  ];
  for (const n of nahuatlisms) {
    result = result.replace(n.regex, n.replace);
  }

  // 4. Puntuación Expresiva Latina (Inyección de ¿ e ¡ faltantes)
  // Preguntas sin apertura
  result = result.replace(/(^|[.?!\n;]\s*)([^.?!\n¿]+)(\?)/g, '$1¿$2$3');
  // Exclamaciones sin apertura
  result = result.replace(/(^|[.?!\n;]\s*)([^.?!¿¡\n]+)(!)/g, '$1¡$2$3');

  return result;
}

/**
 * Infiere automáticamente la etapa etaria (cohorte) del personaje
 */
export function inferCharacterAgeCohort(characterName: string, historicalAge?: number): HistoricalAgeCohort {
  const norm = characterName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const gender = getPersonaGender(characterName);

  if (typeof historicalAge === 'number') {
    if (historicalAge <= 12) return gender === 'female' ? 'child_female' : 'child_male';
    if (historicalAge <= 20) return gender === 'female' ? 'teen_female' : 'teen_male';
    if (historicalAge <= 35) return gender === 'female' ? 'young_adult_female' : 'young_adult_male';
    if (historicalAge <= 55) return gender === 'female' ? 'adult_female' : 'adult_male';
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
  variantIndex: 0 | 1 | 2 = 0
): VoiceMatrixOption {
  const cohort = inferCharacterAgeCohort(characterName, historicalAge);
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
    'mujer', 'senora', 'dona', 'nina', 'madre', 'hermana'
  ];
  if (femaleKeywords.some(k => norm.includes(k))) return 'female';
  return 'male';
}

/**
 * Extrae el perfil histórico acústico contextual de un personaje
 */
export function getPersonaProfile(characterName?: string, historicalAge?: number, variantIndex: 0 | 1 | 2 = 0): HistoricalPersonaProfile {
  const norm = (characterName || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  const gender = getPersonaGender(characterName);
  const cohort = inferCharacterAgeCohort(characterName || '', historicalAge);
  const resolvedVoice = resolveCharacterVoice(characterName || '', historicalAge, variantIndex);

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
 * Divide cláusulas continuas que excedan 14 palabras antes de un signo de puntuación fuerte,
 * insertando un evento acústico de respiración oratoria (...) para simular capacidad pulmonar humana.
 */
export function injectLongClauseBreathing(rawText: string): string {
  const chunks = rawText.split(/([,;:.!?\n—]+)/);
  const result: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    if (i % 2 === 1) {
      result.push(chunk);
      continue;
    }

    const words = chunk.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 14) {
      result.push(chunk);
      continue;
    }

    let splitIndex = Math.min(10, Math.floor(words.length / 2));
    const breakPrepositions = ['de', 'que', 'en', 'y', 'para', 'con', 'por', 'a', 'como', 'donde'];
    for (let w = 8; w <= Math.min(12, words.length - 2); w++) {
      const wordLower = words[w].toLowerCase().replace(/[^a-záéíóúüñ]/g, '');
      if (breakPrepositions.includes(wordLower)) {
        splitIndex = w;
        break;
      }
    }

    const firstPart = words.slice(0, splitIndex).join(' ');
    const secondPart = words.slice(splitIndex).join(' ');
    result.push(`${firstPart}... ${secondPart}`);
  }

  return result.join('');
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
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Pre-procesador de Prosodia y SSML Dinámico Latino (Zero-Token Cost).
 * Integra normalizador fonético latino, bloqueo anti-castellano explícito (xml:lang="es-MX"),
 * inyección de micro-respiraciones y modulación multi-estilo.
 */
export function generateHistoricalSSML(
  text: string, 
  characterName?: string, 
  historicalAge?: number, 
  variantIndex: 0 | 1 | 2 = 0,
  overrides?: { voiceId?: string; voiceRate?: string; voicePitch?: string }
): string {
  const profile = getPersonaProfile(characterName, historicalAge, variantIndex);

  // 1. Limpieza de sintaxis de markdown y enlaces de bóveda
  let clean = text
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[\[(.*?)\]\]/g, '$1')
    .replace(/[*_#`~>]/g, '')
    .replace(/\r\n/g, '\n')
    .trim();

  if (!clean) return '';

  // 2. Normalización fonética y léxica histórica latina (Abreviaturas, Siglos, Nahuatlismos, Signos ¿ e ¡)
  clean = normalizeLatinHistoricalPhonetics(clean);

  // 3. Inyección de micro-respiraciones en cláusulas extensas (>14 palabras)
  clean = injectLongClauseBreathing(clean);

  // 4. Detección de intención oratoria para modulación de prosodia
  const intention = detectOratoricalIntention(clean);

  let dynamicRate = overrides?.voiceRate || profile.prosodyRate;
  let dynamicPitch = overrides?.voicePitch || profile.prosodyPitch;

  if (!overrides?.voiceRate && !overrides?.voicePitch) {
    if (intention === 'arenga') {
      dynamicRate = profile.gender === 'female' ? '-2%' : '-3%';
      dynamicPitch = profile.gender === 'female' ? '+1Hz' : '+1Hz';
    } else if (intention === 'philosophical') {
      dynamicRate = '-7%';
      dynamicPitch = profile.gender === 'female' ? '-1Hz' : '-3Hz';
    } else if (intention === 'rhetorical') {
      dynamicRate = '-4%';
      dynamicPitch = '+0Hz';
    }
  }

  // 5. Inserción de micro-puntuación acústica para respiración oratoria humana
  let processed = clean.replace(/\n\s*\n+/g, '...\n\n');
  processed = processed.replace(/(\.{3}|…)/g, '...');
  processed = processed.replace(/:\s+/g, ': ... ');
  processed = processed.replace(/,\s+(pero|sin embargo|mas|por tanto|pues|así|porque)\b/gi, '... $1');

  if (intention === 'philosophical') {
    processed = processed.replace(/\b(patria|libertad|pueblo|muerte|justicia|soberanía)\b/gi, '$1...');
  }

  const escaped = escapeXml(processed);
  const voiceName = overrides?.voiceId || profile.voiceId;

  // 6. SSML con bloqueo estricto anti-castellano: xml:lang fijado a "es-MX"
  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-MX">
  <voice name="${voiceName}">
    <prosody rate="${dynamicRate}" pitch="${dynamicPitch}">
      ${escaped}
    </prosody>
  </voice>
</speak>`.trim();
}

/**
 * Generador de SSML especializado para Narradores Gamificados de Quests
 */
export function generateNarratorSSML(text: string, mode: NarratorMode = 'wisdom_guide'): string {
  const profile = NARRATOR_VOICE_PROFILES[mode] || NARRATOR_VOICE_PROFILES.wisdom_guide;
  let clean = normalizeLatinHistoricalPhonetics(text);
  clean = injectLongClauseBreathing(clean);

  let processed = clean.replace(/\n\s*\n+/g, '...\n\n');
  processed = processed.replace(/(\.{3}|…)/g, '...');
  const escaped = escapeXml(processed);

  return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-MX">
  <voice name="${profile.voiceId}">
    <prosody rate="${profile.prosodyRate}" pitch="${profile.prosodyPitch}">
      ${escaped}
    </prosody>
  </voice>
</speak>`.trim();
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
 * 1. Prioriza el motor neural en `/api/ai/tts` con prosodia oratoria, respiración natural y timbre latino.
 * 2. Utiliza caché en memoria para respuesta instantánea en clics repetidos.
 * 3. Si no hay conexión o falla la red, activa el fallback local con SpeechSynthesis aplicando
 *    el bloqueo estricto anti-castellano (excluyendo terminantemente voces es-ES).
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
  const cacheKey = `${voiceId || characterName || role}::${narratorMode}::${rate}::${pitch}::${cleanText}`;

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
      const utterance = new SpeechSynthesisUtterance(cleanText);

      if (characterName) {
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

