/**
 * Suite de Verificación Forense Multilingüe del Motor TTS (ISkool)
 * Valida: es-MX, en-US, en-GB, fr-FR, fr-CA
 * Strategy Pattern, Fechas, Siglos, Monarcas, Sinalefas/Liaisons y Síntesis Real.
 */

import { getLanguagePipeline, resolveTargetLocale } from '../src/lib/audio';
import { buildOptimizedSSML } from '../src/lib/historicalVoiceEngine';

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ [PASSED] ${testName}`);
  } else {
    console.error(`  ✗ [FAILED] ${testName}${detail ? ` -> ${detail}` : ''}`);
    process.exitCode = 1;
  }
}

async function runMultilingualSuite() {
  console.log('\n=== SUITE FORENSE MULTILINGÜE DEL MOTOR TTS ISKOOL ===\n');

  // =========================================================================
  // 1. INGLÉS DE ESTADOS UNIDOS (en-US)
  // =========================================================================
  console.log('--- 1. Pipeline en-US: Fechas, Años, Siglos y Monarcas ---');
  const enUSPipeline = getLanguagePipeline('en-US');

  assert(enUSPipeline.locale === 'en-US', 'Locale correcto para en-US');

  const enYears = enUSPipeline.normalizeText('The year was 1776, followed by 1800, 1805 and 2024.');
  assert(
    enYears.includes('seventeen seventy-six') &&
    enYears.includes('eighteen hundred') &&
    enYears.includes('eighteen oh-five') &&
    enYears.includes('twenty twenty-four'),
    'Años cardinales en-US (1776, 1800, 1805, 2024)',
    enYears
  );

  const enDate = enUSPipeline.normalizeText('Declaration was signed on July 4, 1776 in Philadelphia.');
  assert(
    enDate.includes('July fourth, seventeen seventy-six'),
    'Fecha compuesta US (July 4, 1776 -> July fourth, seventeen seventy-six)',
    enDate
  );

  const enRoyals = enUSPipeline.normalizeText('King George III and Henry VIII clashed, while Queen Elizabeth II reigned.');
  assert(
    enRoyals.includes('King George the third') &&
    enRoyals.includes('Henry the eighth') &&
    enRoyals.includes('Queen Elizabeth the second'),
    'Dinastías y monarcas en inglés con ordinales (King George the third, Henry the eighth, Queen Elizabeth the second)',
    enRoyals
  );

  const enCentury = enUSPipeline.normalizeText('During the 18th century and the 19th century.');
  assert(
    enCentury.includes('eighteenth century') && enCentury.includes('nineteenth century'),
    'Siglos en inglés (18th century -> eighteenth century, 19th century -> nineteenth century)',
    enCentury
  );

  const enUnits = enUSPipeline.normalizeText('Speed was 60 mph across 25 km, with 100% precision.');
  assert(
    enUnits.includes('sixty miles per hour') &&
    enUnits.includes('twenty-five kilometers') &&
    enUnits.includes('one hundred percent'),
    'Unidades y símbolos US (mph, km, % -> percent)',
    enUnits
  );

  const enSyntagma = enUSPipeline.analyzeSyntagmas('In the beginning, of the people, for the freedom.');
  assert(
    !/in\s*<break[^>]*>\s*the/i.test(enSyntagma) &&
    !/of\s*<break[^>]*>\s*the/i.test(enSyntagma) &&
    !/for\s*<break[^>]*>\s*the/i.test(enSyntagma) &&
    !enSyntagma.includes('...'),
    'Sintagmas en-US protegidos y cero elipsis (...)'
  );

  // =========================================================================
  // 2. INGLÉS BRITÁNICO (en-GB)
  // =========================================================================
  console.log('\n--- 2. Pipeline en-GB: Dicción Británica y Ortografía RP ---');
  const enGBPipeline = getLanguagePipeline('en-GB');

  assert(enGBPipeline.locale === 'en-GB', 'Locale correcto para en-GB');

  const enGBDate = enGBPipeline.normalizeText('The event took place on 4 July 1776.');
  assert(
    enGBDate.includes('the fourth of July seventeen seventy-six'),
    'Fecha compuesta británica (4 July 1776 -> the fourth of July seventeen seventy-six)',
    enGBDate
  );

  const enGBMonarch = enGBPipeline.normalizeText('King Charles III ascended following Queen Victoria and Elizabeth I.');
  assert(
    enGBMonarch.includes('King Charles the third') && enGBMonarch.includes('Elizabeth the first'),
    'Monarcas británicos (King Charles the third, Elizabeth the first)',
    enGBMonarch
  );

  const enGBUnits = enGBPipeline.normalizeText('Distance 50 km with 99% accuracy.');
  assert(
    enGBUnits.includes('fifty kilometres') && enGBUnits.includes('ninety-nine per cent'),
    'Ortografía británica en unidades (kilometres, per cent)',
    enGBUnits
  );

  // =========================================================================
  // 3. FRANCÉS METROPOLITANO (fr-FR)
  // =========================================================================
  console.log('\n--- 3. Pipeline fr-FR: Fechas, Monarcas, Liaisons y Elisiones ---');
  const frFRPipeline = getLanguagePipeline('fr-FR');

  assert(frFRPipeline.locale === 'fr-FR', 'Locale correcto para fr-FR');

  const frYears = frFRPipeline.normalizeText('En 1789, 1804 et 1914 débutèrent des ères nouvelles.');
  assert(
    frYears.includes('mille sept cent quatre-vingt-neuf') &&
    frYears.includes('mille huit cent quatre') &&
    frYears.includes('mille neuf cent quatorze'),
    'Años cardinales franceses (1789 -> mille sept cent quatre-vingt-neuf, 1804, 1914)',
    frYears
  );

  const frDate = frFRPipeline.normalizeText('La prise de la Bastille eut lieu le 14 juillet 1789.');
  assert(
    frDate.includes('quatorze juillet mille sept cent quatre-vingt-neuf'),
    'Fecha francesa completa (14 juillet 1789 -> quatorze juillet mille sept cent quatre-vingt-neuf)',
    frDate
  );

  const frFirstDate = frFRPipeline.normalizeText('La fête du travail est le 1er mai.');
  assert(
    frFirstDate.includes('premier mai'),
    'Ordinal en primer día del mes (1er mai -> premier mai)',
    frFirstDate
  );

  const frRoyals = frFRPipeline.normalizeText('Louis XIV, Louis XVI, François Ier et Napoléon III ont régné.');
  assert(
    frRoyals.includes('Louis quatorze') &&
    frRoyals.includes('Louis seize') &&
    frRoyals.includes('François premier') &&
    frRoyals.includes('Napoléon trois'),
    'Monarcas franceses (cardinales excepto premier: Louis quatorze, Louis seize, François premier, Napoléon trois)',
    frRoyals
  );

  const frCenturies = frFRPipeline.normalizeText('Au cours du XIXe siècle et du Ier siècle.');
  assert(
    frCenturies.includes('dix-neuvième siècle') && frCenturies.includes('premier siècle'),
    'Siglos en francés (XIXe siècle -> dix-neuvième siècle, Ier siècle -> premier siècle)',
    frCenturies
  );

  const frUnits = frFRPipeline.normalizeText('Vitesse de 120 km/h sur 50 km, soit 100% de réussite.');
  assert(
    frUnits.includes('cent vingt kilomètres par heure') &&
    frUnits.includes('cinquante kilomètres') &&
    frUnits.includes('cent pour cent'),
    'Unidades francesas (km/h, km, % -> pour cent)',
    frUnits
  );

  const frLiaisons = frFRPipeline.analyzeSyntagmas("C'est l'amour de la patrie, d'une grande nation dans les cœurs.");
  assert(
    !/l'\s*<break/i.test(frLiaisons) &&
    !/d'\s*<break/i.test(frLiaisons) &&
    !/dans\s*<break[^>]*>\s*les/i.test(frLiaisons) &&
    !frLiaisons.includes('...'),
    'Blindaje estricto de elisiones francesas (l\', d\') y sintagmas (dans les), sin elipsis (...)',
    frLiaisons
  );

  // =========================================================================
  // 4. FRANCÉS CANADIENSE (fr-CA)
  // =========================================================================
  console.log('\n--- 4. Pipeline fr-CA: Voces y Contexto Franco-Canadiense ---');
  const frCAPipeline = getLanguagePipeline('fr-CA');

  assert(frCAPipeline.locale === 'fr-CA', 'Locale correcto para fr-CA');
  const caVoices = frCAPipeline.getDefaultVoices();
  assert(
    caVoices.female.startsWith('fr-CA') && caVoices.male.startsWith('fr-CA'),
    'Voces por defecto en fr-CA (SylvieNeural, AntoineNeural)',
    JSON.stringify(caVoices)
  );

  // =========================================================================
  // 5. ESPAÑOL MEXICANO (es-MX) - COMPROBACIÓN DE REGRESIÓN
  // =========================================================================
  console.log('\n--- 5. Pipeline es-MX: Bóveda Curricular Mexicana ---');
  const esMXPipeline = getLanguagePipeline('es-MX');

  const esDate = esMXPipeline.normalizeText('El 16 de septiembre de 1810 inició la gesta.');
  assert(
    esDate.includes('dieciséis de septiembre de mil ochocientos diez'),
    'Regresión es-MX: 16 de septiembre de 1810',
    esDate
  );

  const esMonarch = esMXPipeline.normalizeText('Carlos V gobernaba en el Siglo XVI.');
  assert(
    esMonarch.toLowerCase().includes('carlos quinto') && esMonarch.toLowerCase().includes('siglo dieciséis'),
    'Regresión es-MX: Carlos V y Siglo XVI',
    esMonarch
  );

  const esPhonetic = esMXPipeline.applyPhonetics('Cuauhtémoc y Nezahualcóyotl en Tenochtitlán.', 'ssml');
  assert(
    /alias="cuautémoc"/i.test(esPhonetic) &&
    /alias="(?:nezaualcóyotl|nesagualcóyotl)"/i.test(esPhonetic) &&
    /alias="tenochtitlán"/i.test(esPhonetic),
    'Regresión es-MX: Diccionario fonético prehispánico',
    esPhonetic
  );

  // =========================================================================
  // 6. RESOLUCIÓN DE ESTRATEGIAS (STRATEGY PATTERN DISPATCHER)
  // =========================================================================
  console.log('\n--- 6. Dispatcher de Estrategia por Indicador de Voz / Locale ---');
  assert(resolveTargetLocale('en-US-JennyNeural') === 'en-US', 'en-US-JennyNeural -> en-US');
  assert(resolveTargetLocale('en-GB-RyanNeural') === 'en-GB', 'en-GB-RyanNeural -> en-GB');
  assert(resolveTargetLocale('fr-FR-DeniseNeural') === 'fr-FR', 'fr-FR-DeniseNeural -> fr-FR');
  assert(resolveTargetLocale('fr-CA-SylvieNeural') === 'fr-CA', 'fr-CA-SylvieNeural -> fr-CA');
  assert(resolveTargetLocale('es-MX-DaliaNeural') === 'es-MX', 'es-MX-DaliaNeural -> es-MX');
  assert(resolveTargetLocale('es-CO-GonzaloNeural') === 'es-MX', 'es-CO-GonzaloNeural -> es-MX (Latino)');

  // =========================================================================
  // 7. SÍNTESIS REAL DE AUDIO NEURAL MULTILINGÜE (/api/ai/tts)
  // =========================================================================
  console.log('\n--- 7. Síntesis Real de Audio Neural Multilingüe (/api/ai/tts) ---');

  const testCases = [
    {
      lang: 'en-US',
      voice: 'en-US-JennyNeural',
      text: 'On July 4, 1776, thirteen American colonies declared their independence from King George III.'
    },
    {
      lang: 'en-GB',
      voice: 'en-GB-RyanNeural',
      text: 'On 4 July 1776, history changed across the Atlantic.'
    },
    {
      lang: 'fr-FR',
      voice: 'fr-FR-DeniseNeural',
      text: 'Le 14 juillet 1789, le peuple de Paris prit la Bastille, mettant fin au règne de Louis XVI.'
    },
    {
      lang: 'fr-CA',
      voice: 'fr-CA-SylvieNeural',
      text: 'En 1534, Jacques Cartier explora le fleuve Saint-Laurent en Nouvelle-France.'
    },
    {
      lang: 'es-MX',
      voice: 'es-MX-DaliaNeural',
      text: 'El 16 de septiembre de 1810, Don Miguel Hidalgo dio el Grito de Dolores.'
    }
  ];

  for (const tc of testCases) {
    try {
      const res = await fetch('http://localhost:3000/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: tc.text,
          voice: tc.voice,
          language: tc.lang
        })
      });

      if (!res.ok) {
        assert(false, `Síntesis ${tc.lang} (${tc.voice})`, `HTTP Status ${res.status}`);
        continue;
      }

      const contentType = res.headers.get('content-type');
      const arrayBuf = await res.arrayBuffer();
      const bytes = arrayBuf.byteLength;

      assert(
        contentType?.includes('audio/mpeg') && bytes > 5000,
        `Síntesis ${tc.lang} (${tc.voice}) completada: ${bytes} bytes MP3`,
        `Bytes: ${bytes}, Content-Type: ${contentType}`
      );
    } catch (err: any) {
      assert(false, `Síntesis ${tc.lang} (${tc.voice})`, err?.message || String(err));
    }
  }

  console.log('\n======================================================');
  console.log('RESULTADO MULTILINGÜE: Verificación forense completada.');
  console.log('======================================================\n');
}

runMultilingualSuite();
