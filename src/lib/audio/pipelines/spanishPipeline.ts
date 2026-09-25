/**
 * Pipeline Lingüístico para Español Mexicano (es-MX)
 * ISkool - Motor de Audio y Fonética Forense
 */

import { ILanguagePipeline, SupportedLocale, LanguageCode, SSMLParams, VoicePair, ExpressiveStyleConfig, OratoricalIntention } from '../types';
import { normalizeMexicanSpanishText } from '../lexicalNormalizer';
import { applyPhoneticSubstitutions } from '../phoneticDictionary';

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

export class SpanishPipeline implements ILanguagePipeline {
  readonly locale: SupportedLocale = 'es-MX';
  readonly language: LanguageCode = 'es';

  normalizeText(text: string): string {
    return normalizeMexicanSpanishText(text);
  }

  applyPhonetics(text: string, format: 'ssml' | 'plain' = 'ssml'): string {
    return applyPhoneticSubstitutions(text, format === 'ssml' ? 'sub' : 'plain');
  }

  analyzeSyntagmas(text: string): string {
    let clean = text
      .replace(/\.{3,}/g, '.')
      .replace(/…/g, '.')
      .replace(/\s+/g, ' ');

    // Separación de oraciones largas con punto seguido (pausa de respiro de 220ms)
    clean = clean.replace(/([.!?])\s+([A-ZÁÉÍÓÚÑ0-9])/g, '$1 <break time="220ms"/> $2');

    // Pausas en oraciones subordinadas y coordinadas adversativas / explicativas (140ms)
    const connectors = [
      'sin embargo', 'por lo tanto', 'en consecuencia', 'no obstante',
      'es decir', 'por consiguiente', 'asimismo', 'ahora bien',
      'pero', 'mas', 'aunque', 'sino que'
    ];
    for (const conn of connectors) {
      const regex = new RegExp(`\\b(${conn}),?\\s+`, 'gi');
      clean = clean.replace(regex, `$1, <break time="140ms"/> `);
    }

    // Comas naturales: pausa breve de 110ms
    clean = clean.replace(/,\s*(?!<break)/g, ', <break time="110ms"/> ');

    // Blindaje de enlaces acústicos: erradicar cortes entre preposiciones/artículos y sustantivos
    const protectedUnits = [
      'en la', 'en el', 'en los', 'en las',
      'de la', 'de el', 'del', 'de los', 'de las',
      'por la', 'por el', 'por los', 'por las',
      'para la', 'para el', 'para los', 'para las',
      'con la', 'con el', 'con los', 'con las',
      'hacia la', 'hacia el', 'hacia los', 'hacia las',
      'sobre la', 'sobre el', 'sobre los', 'sobre las',
      'tras la', 'tras el', 'tras los', 'tras las',
      'un gran', 'una gran', 'unos grandes', 'unas grandes'
    ];

    for (const unit of protectedUnits) {
      const parts = unit.split(' ');
      if (parts.length === 2) {
        const breakRegex = new RegExp(`\\b${parts[0]}\\s*<break[^>]*>\\s*${parts[1]}\\b`, 'gi');
        clean = clean.replace(breakRegex, `${parts[0]} ${parts[1]}`);
      }
    }

    // Normalizar espacios y colapsar micro-pausas redundantes
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

    // 1. Normalización léxica y de fechas
    clean = this.normalizeText(clean);

    // 2. Sustituciones fonéticas
    clean = this.applyPhonetics(clean, 'ssml');

    // 3. Sintagmas y pausas
    clean = this.analyzeSyntagmas(clean);

    // 4. Escape XML seguro
    const safeContent = escapeXmlPreservingSSMLTags(clean);

    // 5. Estilo expresivo si aplica
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
    return {
      female: 'es-MX-DaliaNeural',
      male: 'es-MX-JorgeNeural'
    };
  }

  getExpressiveStyle(intention: OratoricalIntention): ExpressiveStyleConfig {
    switch (intention) {
      case 'arenga':
        return { style: 'excited', styleDegree: 1.3, rate: '+2%', pitch: '+1Hz' };
      case 'philosophical':
        return { style: 'calm', styleDegree: 1.1, rate: '-4%', pitch: '-1Hz' };
      case 'rhetorical':
        return { style: 'calm', styleDegree: 1.0, rate: '-2%', pitch: '0Hz' };
      case 'solemn_narrative':
      default:
        return { style: 'serious', styleDegree: 1.2, rate: '-3%', pitch: '-2Hz' };
    }
  }
}
