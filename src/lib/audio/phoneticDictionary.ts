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
    { regex: /\bIturbide\b/gi, entry: MEXICAN_HISTORICAL_PHONETIC_MAP.iturbide }
  ];

  for (const { regex, entry } of patterns) {
    result = result.replace(regex, (match) => {
      // Si la palabra ya está dentro de una etiqueta <sub...> o <phoneme...>, no re-envolver
      if (format === 'sub') {
        return `<sub alias="${entry.alias}">${match}</sub>`;
      }
      if (format === 'phoneme' && entry.ipa) {
        return `<phoneme alphabet="ipa" ph="${entry.ipa}">${match}</phoneme>`;
      }
      return entry.alias;
    });
  }

  return result;
}
