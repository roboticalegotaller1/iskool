/**
 * Pipeline Lingüístico para Inglés (en-US y en-GB)
 * ISkool - Motor de Audio y Fonética Forense
 */

import { ILanguagePipeline, SupportedLocale, LanguageCode, SSMLParams, VoicePair, ExpressiveStyleConfig, OratoricalIntention } from '../types';

const ONES: string[] = [
  '', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen',
  'seventeen', 'eighteen', 'nineteen'
];

const TENS: string[] = [
  '', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
];

const ORDINALS_MAP: Record<number, string> = {
  1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth',
  6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
  11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth', 15: 'fifteenth',
  16: 'sixteenth', 17: 'seventeenth', 18: 'eighteenth', 19: 'nineteenth', 20: 'twentieth',
  21: 'twenty-first', 22: 'twenty-second', 23: 'twenty-third', 24: 'twenty-fourth', 25: 'twenty-fifth',
  26: 'twenty-sixth', 27: 'twenty-seventh', 28: 'twenty-eighth', 29: 'twenty-ninth', 30: 'thirtieth',
  31: 'thirty-first'
};

const CENTURIES_ORDINAL: Record<number, string> = {
  1: 'first', 2: 'second', 3: 'third', 4: 'fourth', 5: 'fifth',
  6: 'sixth', 7: 'seventh', 8: 'eighth', 9: 'ninth', 10: 'tenth',
  11: 'eleventh', 12: 'twelfth', 13: 'thirteenth', 14: 'fourteenth', 15: 'fifteenth',
  16: 'sixteenth', 17: 'seventeenth', 18: 'eighteenth', 19: 'nineteenth', 20: 'twentieth',
  21: 'twenty-first'
};

const ROMAN_NUMERALS_MAP: Record<string, number> = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5,
  'VI': 6, 'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10,
  'XI': 11, 'XII': 12, 'XIII': 13, 'XIV': 14, 'XV': 15,
  'XVI': 16, 'XVII': 17, 'XVIII': 18, 'XIX': 19, 'XX': 20, 'XXI': 21
};

export function numberToEnglishWords(n: number): string {
  if (n === 0) return 'zero';
  if (n < 0) return `minus ${numberToEnglishWords(Math.abs(n))}`;

  let words = '';

  if (Math.floor(n / 1000000) > 0) {
    words += `${numberToEnglishWords(Math.floor(n / 1000000))} million `;
    n %= 1000000;
  }

  if (Math.floor(n / 1000) > 0) {
    words += `${numberToEnglishWords(Math.floor(n / 1000))} thousand `;
    n %= 1000;
  }

  if (Math.floor(n / 100) > 0) {
    words += `${ONES[Math.floor(n / 100)]} hundred `;
    n %= 100;
  }

  if (n > 0) {
    if (n < 20) {
      words += ONES[n];
    } else {
      const ten = TENS[Math.floor(n / 10)];
      const one = ONES[n % 10];
      words += one ? `${ten}-${one}` : ten;
    }
  }

  return words.trim();
}

export function yearToEnglishWords(year: number): string {
  if (year < 1000 || year > 2099) {
    return numberToEnglishWords(year);
  }

  // Años pares exactos de milenio / siglo
  if (year === 1000) return 'one thousand';
  if (year === 2000) return 'two thousand';

  if (year >= 2001 && year <= 2009) {
    return `two thousand ${ONES[year - 2000]}`;
  }

  // 1100, 1200, 1300... 1900
  if (year % 100 === 0) {
    const centuryPrefix = Math.floor(year / 100);
    return `${numberToEnglishWords(centuryPrefix)} hundred`;
  }

  const century = Math.floor(year / 100);
  const remainder = year % 100;

  const centuryWords = numberToEnglishWords(century);

  if (remainder < 10) {
    return `${centuryWords} oh-${ONES[remainder]}`;
  }

  const remainderWords = remainder < 20
    ? ONES[remainder]
    : `${TENS[Math.floor(remainder / 10)]}${remainder % 10 ? `-${ONES[remainder % 10]}` : ''}`;

  return `${centuryWords} ${remainderWords}`;
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

export class EnglishPipeline implements ILanguagePipeline {
  readonly locale: SupportedLocale;
  readonly language: LanguageCode = 'en';
  private readonly isBritish: boolean;

  constructor(locale: 'en-US' | 'en-GB' = 'en-US') {
    this.locale = locale;
    this.isBritish = locale === 'en-GB';
  }

  normalizeText(text: string): string {
    let result = text;

    // 1. Siglos en inglés: "18th century", "19th Century", "XIX century", "Century XIX"
    result = result.replace(/\b([1-9]|1[0-9]|2[0-1])(?:st|nd|rd|th)\s+[Cc]entury\b/g, (match, p1) => {
      const num = parseInt(p1, 10);
      const ordinal = CENTURIES_ORDINAL[num] || p1;
      return `${ordinal} century`;
    });

    result = result.replace(/\b(?:Century|century)\s+(XIX|XX|XXI|XVIII|XVII|XVI|XV|XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)\b/g, (match, p1) => {
      const num = ROMAN_NUMERALS_MAP[p1.toUpperCase()];
      const ordinal = num ? CENTURIES_ORDINAL[num] : p1;
      return `${ordinal} century`;
    });

    result = result.replace(/\b(XIX|XX|XXI|XVIII|XVII|XVI|XV|XIV|XIII|XII|XI|X|IX|VIII|VII|VI|V|IV|III|II|I)\s+[Cc]entury\b/g, (match, p1) => {
      const num = ROMAN_NUMERALS_MAP[p1.toUpperCase()];
      const ordinal = num ? CENTURIES_ORDINAL[num] : p1;
      return `${ordinal} century`;
    });

    // 2. Monarcas y Dinastías Reales: "King George III", "Henry VIII", "Queen Elizabeth II", "Charles I"
    const royalPrefixes = [
      'King', 'Queen', 'Prince', 'Princess', 'Emperor', 'Empress',
      'Pope', 'Tsar', 'Czar', 'Kaiser', 'Archduke'
    ];
    const royalRegex = new RegExp(`\\b(${royalPrefixes.join('|')})\\s+([A-Z][a-z]+(?:\\s+[A-Z][a-z]+)?)\\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI)\\b`, 'g');
    result = result.replace(royalRegex, (match, title, name, roman) => {
      const num = ROMAN_NUMERALS_MAP[roman.toUpperCase()];
      const ordinal = num ? ORDINALS_MAP[num] : roman;
      return `${title} ${name} the ${ordinal}`;
    });

    // Nombres históricos directos sin prefijo (ej: Henry VIII, Elizabeth I, Louis XIV)
    const knownMonarchNames = [
      'Henry', 'George', 'Edward', 'Elizabeth', 'Charles', 'Richard',
      'William', 'James', 'Mary', 'Louis', 'Napoleon', 'Philip', 'Alexander', 'Nicholas'
    ];
    const monarchRegex = new RegExp(`\\b(${knownMonarchNames.join('|')})\\s+(I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI)\\b`, 'g');
    result = result.replace(monarchRegex, (match, name, roman) => {
      const num = ROMAN_NUMERALS_MAP[roman.toUpperCase()];
      const ordinal = num ? ORDINALS_MAP[num] : roman;
      return `${name} the ${ordinal}`;
    });

    // 3. Fechas compuestas en formato US: "July 4, 1776", "July 4th, 1776"
    const months = 'January|February|March|April|May|June|July|August|September|October|November|December';
    const dateUsRegex = new RegExp(`\\b(${months})\\s+([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?,?\\s+(1[0-9]{3}|20[0-9]{2})\\b`, 'gi');
    result = result.replace(dateUsRegex, (match, month, day, year) => {
      const dayNum = parseInt(day, 10);
      const dayOrdinal = ORDINALS_MAP[dayNum] || day;
      const yearWords = yearToEnglishWords(parseInt(year, 10));
      return `${month} ${dayOrdinal}, ${yearWords}`;
    });

    // 4. Fechas compuestas en formato UK: "4 July 1776", "4th July 1776"
    const dateUkRegex = new RegExp(`\\b([1-9]|[12][0-9]|3[01])(?:st|nd|rd|th)?\\s+(${months}),?\\s+(1[0-9]{3}|20[0-9]{2})\\b`, 'gi');
    result = result.replace(dateUkRegex, (match, day, month, year) => {
      const dayNum = parseInt(day, 10);
      const dayOrdinal = ORDINALS_MAP[dayNum] || day;
      const yearWords = yearToEnglishWords(parseInt(year, 10));
      return `the ${dayOrdinal} of ${month} ${yearWords}`;
    });

    // 5. Años históricos aislados de 4 dígitos (1000 a 2099)
    result = result.replace(/\b(1[0-9]{3}|20[0-9]{2})\b/g, (match) => {
      return yearToEnglishWords(parseInt(match, 10));
    });

    // 6. Símbolos, abreviaturas y unidades de medida
    result = result.replace(/(\d+)\s*%/g, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} ${this.isBritish ? 'per cent' : 'percent'}`;
    });

    result = result.replace(/(\d+)\s*km\/h\b/gi, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} ${this.isBritish ? 'kilometres' : 'kilometers'} per hour`;
    });

    result = result.replace(/(\d+)\s*km\b/gi, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} ${this.isBritish ? 'kilometres' : 'kilometers'}`;
    });

    result = result.replace(/(\d+)\s*mph\b/gi, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} miles per hour`;
    });

    result = result.replace(/(\d+)\s*m\b(?!\w)/gi, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} ${this.isBritish ? 'metres' : 'meters'}`;
    });

    result = result.replace(/(\d+)\s*ft\b/gi, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} feet`;
    });

    result = result.replace(/(\d+)\s*lbs?\b/gi, (match, p1) => {
      const words = numberToEnglishWords(parseInt(p1, 10));
      return `${words} pounds`;
    });

    result = result.replace(/\bB\.?C\.?E\.?\b/g, 'B C E');
    result = result.replace(/\bB\.?C\.?\b/g, 'B C');
    result = result.replace(/\bA\.?D\.?\b/g, 'A D');
    result = result.replace(/\bC\.?E\.?\b/g, 'C E');

    return result;
  }

  applyPhonetics(text: string, format: 'ssml' | 'plain' = 'ssml'): string {
    const englishLoanwords: Record<string, string> = {
      'Versailles': 'ver-SY',
      'Champs-Élysées': 'shahn-zay-lee-ZAY',
      'Lafayette': 'Lah-fee-ET',
      'Coup d\'état': 'koo day-TAH',
      'Magna Carta': 'Magna Karta',
      'Renaissance': this.isBritish ? 'Ruh-NAY-sons' : 'REN-uh-sahns'
    };

    let result = text;
    for (const [term, phonetic] of Object.entries(englishLoanwords)) {
      const regex = new RegExp(`\\b${term}\\b`, 'g');
      if (format === 'ssml') {
        result = result.replace(regex, `<sub alias="${phonetic}">${term}</sub>`);
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

    // Separación de oraciones largas con punto seguido (220ms)
    clean = clean.replace(/([.!?])\s+([A-Z0-9])/g, '$1 <break time="220ms"/> $2');

    // Conectores adversativos y de discurso (140ms)
    const connectors = [
      'however', 'therefore', 'nevertheless', 'furthermore',
      'consequently', 'moreover', 'on the other hand', 'in fact',
      'meanwhile', 'nonetheless', 'indeed'
    ];
    for (const conn of connectors) {
      const regex = new RegExp(`\\b(${conn}),?\\s+`, 'gi');
      clean = clean.replace(regex, `$1, <break time="140ms"/> `);
    }

    // Comas naturales (110ms)
    clean = clean.replace(/,\s*(?!<break)/g, ', <break time="110ms"/> ');

    // Protección estricta de sintagmas ingleses: evitar cortes en preposiciones y artículos
    const protectedUnits = [
      'in the', 'on the', 'at the', 'to the', 'for the',
      'of the', 'by the', 'from the', 'with the', 'with a',
      'under the', 'through the', 'into the', 'between the',
      'as a', 'such a', 'is a', 'was a'
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
    if (this.isBritish) {
      return {
        female: 'en-GB-SoniaNeural',
        male: 'en-GB-RyanNeural'
      };
    }
    return {
      female: 'en-US-JennyNeural',
      male: 'en-US-GuyNeural'
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
