/**
 * Pipeline Lingüístico para Francés (fr-FR y fr-CA)
 * ISkool - Motor de Audio y Fonética Forense
 */

import { ILanguagePipeline, SupportedLocale, LanguageCode, SSMLParams, VoicePair, ExpressiveStyleConfig, OratoricalIntention } from '../types';

const FR_ONES: string[] = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize',
  'dix-sept', 'dix-huit', 'dix-neuf'
];

const FR_TENS: string[] = [
  '', 'dix', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante',
  'soixante-dix', 'quatre-vingts', 'quatre-vingt-dix'
];

const FR_CENTURIES_ORDINAL: Record<number, string> = {
  1: 'premier', 2: 'deuxième', 3: 'troisième', 4: 'quatrième', 5: 'cinquième',
  6: 'sixième', 7: 'septième', 8: 'huitième', 9: 'neuvième', 10: 'dixième',
  11: 'onzième', 12: 'douzième', 13: 'treizième', 14: 'quatorzième', 15: 'quinzième',
  16: 'seizième', 17: 'dix-septième', 18: 'dix-huitième', 19: 'dix-neuvième', 20: 'vingtième',
  21: 'vingt-et-unième'
};

const ROMAN_NUMERALS_MAP: Record<string, number> = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
  'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
  'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
  'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20, 'XXI': 21
};

export function numberToFrenchWords(n: number): string {
  if (n === 0) return 'zéro';
  if (n < 0) return `moins ${numberToFrenchWords(Math.abs(n))}`;

  if (n < 20) return FR_ONES[n];

  if (n < 70) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    if (unit === 0) return FR_TENS[ten];
    if (unit === 1) return `${FR_TENS[ten]} et un`;
    return `${FR_TENS[ten]}-${FR_ONES[unit]}`;
  }

  if (n < 80) {
    const unit = n - 60;
    if (unit === 11) return 'soixante et onze';
    return `soixante-${numberToFrenchWords(unit)}`;
  }

  if (n < 100) {
    if (n === 80) return 'quatre-vingts';
    const unit = n - 80;
    return `quatre-vingt-${numberToFrenchWords(unit)}`;
  }

  if (n < 1000) {
    const hundreds = Math.floor(n / 100);
    const remainder = n % 100;
    const hundredPrefix = hundreds === 1 ? 'cent' : `${FR_ONES[hundreds]} cent`;
    const hundredFinal = (hundreds > 1 && remainder === 0) ? `${hundredPrefix}s` : hundredPrefix;
    return remainder > 0 ? `${hundredFinal} ${numberToFrenchWords(remainder)}` : hundredFinal;
  }

  if (n < 1000000) {
    const thousands = Math.floor(n / 1000);
    const remainder = n % 1000;
    const thousandPrefix = thousands === 1 ? 'mille' : `${numberToFrenchWords(thousands)} mille`;
    return remainder > 0 ? `${thousandPrefix} ${numberToFrenchWords(remainder)}` : thousandPrefix;
  }

  return n.toString();
}

export function yearToFrenchWords(year: number): string {
  if (year < 1000 || year > 2099) {
    return numberToFrenchWords(year);
  }

  if (year === 1000) return 'mille';
  if (year === 2000) return 'deux mille';

  if (year > 1000 && year < 2000) {
    const remainder = year - 1000;
    return `mille ${numberToFrenchWords(remainder)}`;
  }

  // 2001 - 2099
  const remainder = year - 2000;
  return `deux mille ${numberToFrenchWords(remainder)}`;
}

function escapeXmlPreservingSSMLTags(input: string): string {
  const parts = input.split(/(<[^>]+>)/g);
  return parts
    .map(part => {
      if (part.startsWith('<') && part.endsWith('>')) {
        return part;
      }
      return part
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    })
    .join('');
}

export class FrenchPipeline implements ILanguagePipeline {
  readonly locale: SupportedLocale;
  readonly language: LanguageCode = 'fr';
  private readonly isCanadian: boolean;

  constructor(locale: 'fr-FR' | 'fr-CA' = 'fr-FR') {
    this.locale = locale;
    this.isCanadian = locale === 'fr-CA';
  }

  normalizeText(text: string): string {
    let result = text;

    // 1. Siglos en francés: "XIXe siècle", "19e siècle", "19ᵉ siècle", "Ier siècle", "1er siècle"
    result = result.replace(/\b(1er|1ᵉʳ|Ier)\s+si[èe]cle\b/gi, 'premier siècle');

    result = result.replace(/\b([1-9]|1[0-9]|2[0-1])(?:e|ᵉ|ème)\s+si[èe]cle\b/gi, (match, p1) => {
      const num = parseInt(p1, 10);
      const ordinal = FR_CENTURIES_ORDINAL[num] || p1;
      return `${ordinal} siècle`;
    });

    result = result.replace(/\b(XIX|XX|XXI|XVIII|XVII|XVI|XV|XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II)\s*(?:e|ᵉ|ème)?\s+si[èe]cle\b/gi, (match, p1) => {
      const num = ROMAN_NUMERALS_MAP[p1.toUpperCase()];
      const ordinal = num ? FR_CENTURIES_ORDINAL[num] : p1;
      return `${ordinal} siècle`;
    });

    // 2. Monarcas y Dinastías Reales en francés:
    // NOTA FORENSE: En francés, los reyes usan cardinales (Louis XIV = Louis quatorze), EXCEPTO "Ier" / "1er" (Louis Ier = Louis premier)
    const royalTitles = [
      'Roi', 'Reine', 'Prince', 'Princesse', 'Empereur', 'Impératrice',
      'Duc', 'Pape', 'Tsar', 'Czar'
    ];

    // Primero monarcas "premier" (Ier / 1er)
    const royalFirstRegex = new RegExp(`\\b(?:(${royalTitles.join('|')})\\s+)?([A-ZÉÈÂÊÎÔÛ][a-zà-ÿ]+(?:-[A-ZÉÈÂÊÎÔÛ][a-zà-ÿ]+)?)\\s+(?:Ier|1er|1ᵉʳ|I)\\b`, 'g');
    result = result.replace(royalFirstRegex, (match, title, name) => {
      const prefix = title ? `${title} ` : '';
      return `${prefix}${name} premier`;
    });

    // Monarcas con números mayores a 1: "Louis XIV" -> "Louis quatorze", "Napoléon III" -> "Napoléon trois"
    const knownFrenchMonarchs = [
      'Louis', 'François', 'Henri', 'Charles', 'Napoléon', 'Philippe',
      'Jean', 'Élisabeth', 'Elisabeth', 'Alexandre', 'Pie', 'Benoît', 'Guillaume'
    ];
    const monarchNumeralRegex = new RegExp(`\\b(?:(${royalTitles.join('|')})\\s+)?(${knownFrenchMonarchs.join('|')})\\s+(II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII)\\b`, 'g');
    result = result.replace(monarchNumeralRegex, (match, title, name, roman) => {
      const num = ROMAN_NUMERALS_MAP[roman.toUpperCase()];
      const cardinal = num ? numberToFrenchWords(num) : roman;
      const prefix = title ? `${title} ` : '';
      return `${prefix}${name} ${cardinal}`;
    });

    // 3. Fechas en francés: "14 juillet 1789", "1er mai 1886", "2 décembre 1804"
    const months = 'janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[ûu]t|septembre|octobre|novembre|d[ée]cembre';
    const frenchDateRegex = new RegExp(`\\b(1er|1ᵉʳ|[1-9]|[12][0-9]|3[01])\\s+(${months}),?\\s+(1[0-9]{3}|20[0-9]{2})\\b`, 'gi');
    result = result.replace(frenchDateRegex, (match, day, month, year) => {
      const dayWord = (day.toLowerCase().startsWith('1er') || day.toLowerCase().startsWith('1ᵉʳ'))
        ? 'premier'
        : numberToFrenchWords(parseInt(day, 10));
      const yearWord = yearToFrenchWords(parseInt(year, 10));
      return `${dayWord} ${month} ${yearWord}`;
    });

    // Días aislados de mes: "1er mai" -> "premier mai"
    const firstDayMonthRegex = new RegExp(`\\b(1er|1ᵉʳ)\\s+(${months})\\b`, 'gi');
    result = result.replace(firstDayMonthRegex, (match, p1, month) => {
      return `premier ${month}`;
    });

    // 4. Años históricos franceses aislados de 4 dígitos (1000 a 2099)
    result = result.replace(/\b(1[0-9]{3}|20[0-9]{2})\b/g, (match) => {
      return yearToFrenchWords(parseInt(match, 10));
    });

    // 5. Símbolos, abreviaturas y unidades francesas
    result = result.replace(/(\d+)\s*%/g, (match, p1) => {
      const words = numberToFrenchWords(parseInt(p1, 10));
      return `${words} pour cent`;
    });

    result = result.replace(/(\d+)\s*km\/h\b/gi, (match, p1) => {
      const words = numberToFrenchWords(parseInt(p1, 10));
      return `${words} kilomètres par heure`;
    });

    result = result.replace(/(\d+)\s*km\b/gi, (match, p1) => {
      const words = numberToFrenchWords(parseInt(p1, 10));
      return `${words} kilomètres`;
    });

    result = result.replace(/(\d+)\s*m\b(?!\w)/gi, (match, p1) => {
      const words = numberToFrenchWords(parseInt(p1, 10));
      return `${words} mètres`;
    });

    result = result.replace(/(\d+)\s*cm\b/gi, (match, p1) => {
      const words = numberToFrenchWords(parseInt(p1, 10));
      return `${words} centimètres`;
    });

    result = result.replace(/(\d+)\s*kg\b/gi, (match, p1) => {
      const words = numberToFrenchWords(parseInt(p1, 10));
      return `${words} kilogrammes`;
    });

    result = result.replace(/\bav\.\s*J\.?-?C\.?\b/gi, 'avant Jésus-Christ');
    result = result.replace(/\bap\.\s*J\.?-?C\.?\b/gi, 'après Jésus-Christ');

    return result;
  }

  applyPhonetics(text: string, format: 'ssml' | 'plain' = 'ssml'): string {
    const historicalFigures: Record<string, string> = {
      'Robespierre': 'Robespièr',
      'Desmoulins': 'Démoulin',
      'Vercingétorix': 'Vercingétoriks',
      'Marat': 'Mara'
    };

    let result = text;
    for (const [name, phonetic] of Object.entries(historicalFigures)) {
      const regex = new RegExp(`\\b${name}\\b`, 'g');
      if (format === 'ssml') {
        result = result.replace(regex, `<sub alias="${phonetic}">${name}</sub>`);
      } else {
        result = result.replace(regex, phonetic);
      }
    }

    return result;
  }

  analyzeSyntagmas(text: string): string {
    let clean = text
      .replace(/\.{3,}/g, '.')
      .replace(/…/g, '.')
      .replace(/\s+/g, ' ');

    // Separación de oraciones largas (220ms)
    clean = clean.replace(/([.!?])\s+([A-ZÀ-Ÿ0-9])/g, '$1 <break time="220ms"/> $2');

    // Conectores adversativos y discursivos franceses (140ms)
    const connectors = [
      'cependant', 'néanmoins', 'toutefois', 'par conséquent',
      'en effet', 'de plus', 'ainsi', 'd\'ailleurs', 'en revanche',
      'mais', 'or'
    ];
    for (const conn of connectors) {
      const regex = new RegExp(`\\b(${conn}),?\\s+`, 'gi');
      clean = clean.replace(regex, `$1, <break time="140ms"/> `);
    }

    // Comas naturales (110ms)
    clean = clean.replace(/,\s*(?!<break)/g, ', <break time="110ms"/> ');

    // Blindaje estricto de elisiones y liaisons francesas:
    // Nunca insertar pausas en partículas elididas (l', d', c', qu', j', s', n', m', t')
    clean = clean.replace(/\b([ldcqujsnmt]')\s*<break[^>]*>\s*/gi, '$1');

    // Blindaje de sintagmas franceses: preposiciones y artículos
    const protectedUnits = [
      'dans le', 'dans la', 'dans les', 'dans un', 'dans une',
      'sur le', 'sur la', 'sur les', 'sur un', 'sur une',
      'pour le', 'pour la', 'pour les', 'pour un', 'pour une',
      'avec le', 'avec la', 'avec les', 'avec un', 'avec une',
      'chez les', 'par le', 'par la', 'par les',
      'vers le', 'vers la', 'vers les',
      'de la', 'de les', 'du roi', 'des rois', 'en France',
      'c\'est un', 'c\'est une'
    ];

    for (const unit of protectedUnits) {
      const parts = unit.split(' ');
      if (parts.length === 2) {
        const breakRegex = new RegExp(`\\b${parts[0]}\\s*<break[^>]*>\\s*${parts[1]}\\b`, 'gi');
        clean = clean.replace(breakRegex, `${parts[0]} ${parts[1]}`);
      }
    }

    clean = clean
      .replace(/(<break[^>]*\/>\s*){2,}/g, '$1')
      .replace(/\s{2,}/g, ' ')
      .trim();

    return clean;
  }

  buildSSML(params: SSMLParams): string {
    const {
      voice,
      text,
      rate = '0%',
      pitch = '0Hz',
      style,
      styleDegree = 1.0,
      intention
    } = params;

    let clean = text
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[\[(.*?)\]\]/g, '$1')
      .replace(/[*_#`~>]/g, '')
      .trim();

    if (!clean) return '';

    clean = this.normalizeText(clean);
    clean = this.applyPhonetics(clean, 'ssml');
    clean = this.analyzeSyntagmas(clean);

    const safeContent = escapeXmlPreservingSSMLTags(clean);

    let expressiveStyle = style;
    let expressiveDegree = styleDegree;
    if (!expressiveStyle && intention) {
      const exp = this.getExpressiveStyle(intention);
      expressiveStyle = exp.style;
      expressiveDegree = exp.styleDegree;
    }

    const innerProsody = `<prosody rate="${rate}" pitch="${pitch}">
    ${safeContent}
  </prosody>`;

    const styledContent = expressiveStyle
      ? `<mstts:express-as style="${expressiveStyle}" styledegree="${expressiveDegree.toFixed(1)}">
    ${innerProsody}
  </mstts:express-as>`
      : innerProsody;

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${this.locale}">
  <voice name="${voice}">
    ${styledContent}
  </voice>
</speak>`.trim();
  }

  getDefaultVoices(): VoicePair {
    if (this.isCanadian) {
      return {
        female: 'fr-CA-SylvieNeural',
        male: 'fr-CA-AntoineNeural'
      };
    }
    return {
      female: 'fr-FR-DeniseNeural',
      male: 'fr-FR-HenriNeural'
    };
  }

  getExpressiveStyle(intention: OratoricalIntention): ExpressiveStyleConfig {
    switch (intention) {
      case 'arenga':
        return { style: 'excited', styleDegree: 1.2, rate: '+2%', pitch: '+1Hz' };
      case 'philosophical':
        return { style: 'calm', styleDegree: 1.1, rate: '-3%', pitch: '-1Hz' };
      case 'rhetorical':
        return { style: 'calm', styleDegree: 1.0, rate: '-1%', pitch: '0Hz' };
      case 'solemn_narrative':
      default:
        return { style: 'serious', styleDegree: 1.2, rate: '-3%', pitch: '-2Hz' };
    }
  }
}
