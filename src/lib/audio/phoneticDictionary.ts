/**
 * Diccionario Fonético Forense de Toponimias, Vocabulario Náhuatl y Figuras Históricas de México
 * Corrige la pronunciación deficiente en motores de IA neural aplicando sustituciones <sub alias="...">,
 * fonemas IPA o transliteraciones fonéticas nativas.
 */

export interface PhoneticEntry {
  term: string;
  alias: string;
  ipa?: string;
  description?: string;
}

export const MEXICAN_HISTORICAL_PHONETIC_MAP: Record<string, PhoneticEntry> = {
  cuauhtemoc: {
    term: 'Cuauhtémoc',
    alias: 'cuautémoc',
    ipa: 'kwawˈtemok',
    description: 'Último tlatoani mexica de México-Tenochtitlan'
  },
  nezahualcoyotl: {
    term: 'Nezahualcóyotl',
    alias: 'nesagualcóyotl',
    ipa: 'nesawaɬˈkoʝotɬ',
    description: 'Rey poeta de Texcoco y legislador chichimeca'
  },
  tenochtitlan: {
    term: 'Tenochtitlán',
    alias: 'tenochtitlán',
    ipa: 'tenotʃtiˈtlan',
    description: 'Capital imperial del imperio mexica'
  },
  tlaxcala: {
    term: 'Tlaxcala',
    alias: 'tlaskala',
    ipa: 'tlaksˈkala',
    description: 'Nación aliada y cuna de la resistencia mesoamericana'
  },
  xochimilco: {
    term: 'Xochimilco',
    alias: 'sochimilco',
    ipa: 'sotʃiˈmilko',
    description: 'Tierra de flores y chinampas lacustres'
  },
  oaxaca: {
    term: 'Oaxaca',
    alias: 'oajaca',
    ipa: 'waˈxaka',
    description: 'Topónimo de Huaxyacac'
  },
  popocatepetl: {
    term: 'Popocatépetl',
    alias: 'popocatépetl',
    ipa: 'popokaˈtepetl',
    description: 'Cerro que humea, guardián del valle de México'
  },
  iztaccihuatl: {
    term: 'Iztaccíhuatl',
    alias: 'istaksíhuatl',
    ipa: 'istakˈsiwatɬ',
    description: 'Mujer dormida en la sierra nevada'
  },
  quetzalcoatl: {
    term: 'Quetzalcóatl',
    alias: 'ketsalkóatl',
    ipa: 'ketsaɬˈkoatɬ',
    description: 'Serpiente emplumada, deidad del conocimiento'
  },
  cuitlahuac: {
    term: 'Cuitláhuac',
    alias: 'kuitláhuac',
    ipa: 'kwitˈlawak',
    description: 'Tlatoani vencedor de la Noche Victoriosa'
  },
  xicotencatl: {
    term: 'Xicoténcatl',
    alias: 'shikoténcatl',
    ipa: 'ʃikoˈteŋkatɬ',
    description: 'Caudillo y estratega tlaxcalteca invicto'
  },
  teotihuacan: {
    term: 'Teotihuacán',
    alias: 'teotihuacán',
    ipa: 'teotiwaˈkan',
    description: 'Ciudad donde los hombres se convierten en dioses'
  },
  tlacaelel: {
    term: 'Tlacaélel',
    alias: 'tlakaélel',
    ipa: 'tlakaˈelel',
    description: 'Cihuacóatl y gran reformador imperial mexica'
  },
  moctezuma: {
    term: 'Moctezuma',
    alias: 'moktezuma',
    ipa: 'moteːkʷˈsoːma',
    description: 'Uey Tlatoani mexica a la llegada española'
  },
  malintzin: {
    term: 'Malintzin',
    alias: 'malintsin',
    ipa: 'maˈlintsin',
    description: 'Doña Marina, intérprete y estratega lingüística'
  },
  huitzilopochtli: {
    term: 'Huitzilopochtli',
    alias: 'uitsilopochtli',
    ipa: 'wit͡siloˈpot͡ʃt͡ɬi',
    description: 'Colibrí del sur, deidad protectora de Tenochtitlan'
  },
  tzintzuntzan: {
    term: 'Tzintzuntzan',
    alias: 'tsintsúntsan',
    ipa: 'tsinˈtsuntsan',
    description: 'Lugar de colibríes, capital del señorío purépecha'
  },
  anahuac: {
    term: 'Anáhuac',
    alias: 'anahuac',
    ipa: 'aˈnawak',
    description: 'Tierra rodeada de agua, cuenca de México'
  },
  acolhuacan: {
    term: 'Acolhuacán',
    alias: 'akolhuacán',
    ipa: 'akolwaˈkan',
    description: 'Señorío acolhua en el lago de Texcoco'
  },
  michoacan: {
    term: 'Michoacán',
    alias: 'michoacán',
    ipa: 'mitʃwaˈkan',
    description: 'Lugar de pescadores'
  },
  hidalgo: {
    term: 'Hidalgo',
    alias: 'Idalgo',
    ipa: 'iˈdalɣo',
    description: 'Don Miguel Hidalgo y Costilla, Padre de la Patria'
  },
  allende: {
    term: 'Allende',
    alias: 'Ayende',
    ipa: 'aˈʝende',
    description: 'Ignacio Allende, Capitán General insurgente'
  },
  morelos: {
    term: 'Morelos',
    alias: 'Morelos',
    ipa: 'moˈrelos',
    description: 'José María Morelos y Pavón, Siervo de la Nación'
  },
  iturbide: {
    term: 'Iturbide',
    alias: 'Iturbide',
    ipa: 'iturˈbiðe',
    description: 'Agustín de Iturbide, consumador del Plan de Iguala'
  },
  benito_juarez: {
    term: 'Benito Juárez',
    alias: 'Benito Juárez',
    ipa: 'beˈnito ˈxwaɾes',
    description: 'Benemérito de las Américas'
  },
  pais: {
    term: 'país',
    alias: 'pa-ís',
    ipa: 'pa.ˈis',
    description: 'Modulación fonética natural del hiato acentual en la vocal cerrada tónica (pa-ís)'
  },
  paises: {
    term: 'países',
    alias: 'pa-íses',
    ipa: 'pa.ˈi.ses',
    description: 'Modulación fonética natural del plural con hiato acentual silábico (pa-íses)'
  },
  patria: {
    term: 'patria',
    alias: 'pátria',
    ipa: 'ˈpa.tɾja',
    description: 'Modulación fonética natural con acento prosódico primario en primera sílaba [ˈpa] y diptongo átono fluido [tɾja] para erradicar hiatos robóticos'
  },
  patrias: {
    term: 'patrias',
    alias: 'pátrias',
    ipa: 'ˈpa.tɾjas',
    description: 'Modulación fonética natural plural de patria [ˈpa.tɾjas]'
  },
  patrio: {
    term: 'patrio',
    alias: 'pátrio',
    ipa: 'ˈpa.tɾjo',
    description: 'Modulación fonética natural masculina de patrio [ˈpa.tɾjo]'
  },
  patrios: {
    term: 'patrios',
    alias: 'pátrios',
    ipa: 'ˈpa.tɾjos',
    description: 'Modulación fonética natural masculina plural de patrios [ˈpa.tɾjos]'
  },
  // Nombres y Términos Históricos Anglosajones con Pronunciación Auténtica
  john_pershing: {
    term: 'John J. Pershing',
    alias: 'Jon Pérshin',
    ipa: 'dʒɒn ˈpɜːrʃɪŋ',
    description: 'General John J. Pershing, comandante de la Expedición Punitiva'
  },
  pershing: {
    term: 'Pershing',
    alias: 'Pérshin',
    ipa: 'ˈpɜːrʃɪŋ',
    description: 'General John J. Pershing'
  },
  columbus: {
    term: 'Columbus',
    alias: 'Colómbus',
    ipa: 'kəˈlʌmbəs',
    description: 'Población de Columbus, Nuevo México, asaltada por Villa en 1916'
  },
  woodrow_wilson: {
    term: 'Woodrow Wilson',
    alias: 'Uúdrou Uílson',
    ipa: 'ˈwʊdroʊ ˈwɪlsən',
    description: 'Presidente Woodrow Wilson'
  },
  henry_lane_wilson: {
    term: 'Henry Lane Wilson',
    alias: 'Jénri Léin Uílson',
    ipa: 'ˈhɛnri leɪn ˈwɪlsən',
    description: 'Embajador estadounidense Henry Lane Wilson, pacto de la Embajada'
  },
  wilson: {
    term: 'Wilson',
    alias: 'Uílson',
    ipa: 'ˈwɪlsən',
    description: 'Apellido Wilson'
  },
  james_polk: {
    term: 'James K. Polk',
    alias: 'Yeims Polk',
    ipa: 'dʒeɪmz poʊk',
    description: 'Presidente James K. Polk'
  },
  winfield_scott: {
    term: 'Winfield Scott',
    alias: 'Uínfild Eskót',
    ipa: 'ˈwɪnfiːld skɒt',
    description: 'General Winfield Scott'
  },
  zachary_taylor: {
    term: 'Zachary Taylor',
    alias: 'Zácari Téilor',
    ipa: 'ˈzækəri ˈteɪlər',
    description: 'General Zachary Taylor'
  },
  george_washington: {
    term: 'George Washington',
    alias: 'Yorch Uáshington',
    ipa: 'dʒɔːrdʒ ˈwɒʃɪŋtən',
    description: 'George Washington'
  },
  washington: {
    term: 'Washington',
    alias: 'Uáshington',
    ipa: 'ˈwɒʃɪŋtən',
    description: 'Washington'
  },
  abraham_lincoln: {
    term: 'Abraham Lincoln',
    alias: 'Éibraham Líncoln',
    ipa: 'ˈeɪbrəhæm ˈlɪŋkən',
    description: 'Presidente Abraham Lincoln'
  },
  lincoln: {
    term: 'Lincoln',
    alias: 'Líncoln',
    ipa: 'ˈlɪŋkən',
    description: 'Lincoln'
  },
  roosevelt: {
    term: 'Roosevelt',
    alias: 'Róusevelt',
    ipa: 'ˈroʊzəvɛlt',
    description: 'Presidente Roosevelt'
  },
  eisenhower: {
    term: 'Eisenhower',
    alias: 'Aisenjáuer',
    ipa: 'ˈaɪzənhaʊər',
    description: 'Presidente Dwight Eisenhower'
  }
};

/**
 * Normaliza una cadena quitando acentos para indexación insensible
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/**
 * Aplica sustituciones fonéticas a un texto.
 * 
 * @param text Texto de entrada
 * @param format Modo de reemplazo:
 *   - 'sub': Inyecta etiquetas SSML estándar <sub alias="...">palabra</sub>
 *   - 'phoneme': Inyecta etiquetas IPA <phoneme alphabet="ipa" ph="...">palabra</phoneme>
 *   - 'plain': Sustituye la palabra directamente por su alias fonético de lectura natural
 */
export function applyPhoneticSubstitutions(
  text: string, 
  format: 'sub' | 'phoneme' | 'plain' = 'sub'
): string {
  if (!text || typeof text !== 'string') return '';
  let result = text;

  // Lista de patrones ordenados por longitud descendente para evitar colisiones
  const patterns: Array<{ regex: RegExp; entry: PhoneticEntry }> = [
    { regex: /\bBenito\s+Ju[aá]rez\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.benito_juarez },
    { regex: /\bCuauht[eé]moc\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.cuauhtemoc },
    { regex: /\bNezahualc[oó]yotl\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.nezahualcoyotl },
    { regex: /\bTenochtitl[aá]n\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.tenochtitlan },
    { regex: /\bTlaxcala\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.tlaxcala },
    { regex: /\bXochimilco\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.xochimilco },
    { regex: /\bOaxaca\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.oaxaca },
    { regex: /\bPopocat[eé]petl\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.popocatepetl },
    { regex: /\bIztacc[ií]huatl\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.iztaccihuatl },
    { regex: /\bQuetzalc[oó]atl\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.quetzalcoatl },
    { regex: /\bCuitl[aá]huac\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.cuitlahuac },
    { regex: /\bXicot[eé]ncatl\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.xicotencatl },
    { regex: /\bTeotihuac[aá]n\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.teotihuacan },
    { regex: /\bTlaca[eé]lel\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.tlacaelel },
    { regex: /\bMoctezuma\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.moctezuma },
    { regex: /\bMalintzin\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.malintzin },
    { regex: /\bHuitzilopochtli\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.huitzilopochtli },
    { regex: /\bTzintzuntzan\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.tzintzuntzan },
    { regex: /\bAn[aá]huac\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.anahuac },
    { regex: /\bAcolhuac[aá]n\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.acolhuacan },
    { regex: /\bMichoac[aá]n\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.michoacan },
    { regex: /\bHidalgo\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.hidalgo },
    { regex: /\bAllende\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.allende },
    { regex: /\bMorelos\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.morelos },
    { regex: /\bIturbide\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.iturbide },
    // Modulación fonética prioritaria para el hiato acentual en "país" / "países"
    { regex: /\bpa[ií]ses\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.paises },
    { regex: /\bpa[ií]s\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.pais },
    // Modulación fonética de alta fidelidad humana para "patria" / "patrias" / "patrio" / "patrios"
    { regex: /\bpatrias\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.patrias },
    { regex: /\bpatria\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.patria },
    { regex: /\bpatrios\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.patrios },
    { regex: /\bpatrio\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.patrio },
    // Figuras y Nombres Anglosajones en Contexto Histórico
    { regex: /\bJohn\s+J\.\s+Pershing\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.john_pershing },
    { regex: /\bPershing\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.pershing },
    { regex: /\bColumbus\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.columbus },
    { regex: /\bWoodrow\s+Wilson\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.woodrow_wilson },
    { regex: /\bHenry\s+Lane\s+Wilson\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.henry_lane_wilson },
    { regex: /\bWilson\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.wilson },
    { regex: /\bJames\s+K\.\s+Polk\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.james_polk },
    { regex: /\bWinfield\s+Scott\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.winfield_scott },
    { regex: /\bZachary\s+Taylor\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.zachary_taylor },
    { regex: /\bGeorge\s+Washington\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.george_washington },
    { regex: /\bWashington\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.washington },
    { regex: /\bAbraham\s+Lincoln\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.abraham_lincoln },
    { regex: /\bLincoln\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.lincoln },
    { regex: /\bRoosevelt\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.roosevelt },
    { regex: /\bEisenhower\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.eisenhower }
  ];

  for (const { regex, entry } of patterns) {
    result = result.replace(regex, (match) => {
      // Preservar mayúscula inicial si el término original la tenía
      const isCapitalized = /^[A-ZÁÉÍÓÚ]/.test(match);
      const effectiveAlias = isCapitalized 
        ? entry.alias.charAt(0).toUpperCase() + entry.alias.slice(1) 
        : entry.alias;

      // Si la palabra ya está dentro de una etiqueta <sub...> o <phoneme...>, no re-envolver
      if (format === 'sub') {
        return `<sub alias="${effectiveAlias}">${match}</sub>`;
      }
      if (format === 'phoneme' && entry.ipa) {
        return `<phoneme alphabet="ipa" ph="${entry.ipa}">${match}</phoneme>`;
      }
      return effectiveAlias;
    });
  }

  return result;
}
