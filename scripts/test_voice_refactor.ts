import { normalizeMexicanSpanishText } from '../src/lib/audio/lexicalNormalizer';
import { applyPhoneticSubstitutions } from '../src/lib/audio/phoneticDictionary';
import { 
  buildOptimizedSSML, 
  generateHistoricalSSML, 
  generateNarratorSSML,
  analyzeAndInjectSyntagmas 
} from '../src/lib/historicalVoiceEngine';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

function sanitizeForTTS(rawSSML: string, targetVoice: string = 'es-MX-JorgeNeural'): string {
  let sanitized = rawSSML
    .replace(/<sub\s+alias="([^"]+)"[^>]*>[\s\S]*?<\/sub>/gi, '$1')
    .replace(/<phoneme\s+[^>]*>([\s\S]*?)<\/phoneme>/gi, '$1')
    .replace(/<break\s+time="(\d+)ms"[^>]*\/?>/gi, (_match, msStr) => {
      const ms = parseInt(msStr, 10);
      if (ms <= 180) return ', ';
      if (ms <= 350) return '. ';
      return '.\n\n';
    })
    .replace(/<break\s+strength="(?:x-weak|weak)"[^>]*\/?>/gi, ', ')
    .replace(/<break\s+strength="(?:medium|strong|x-strong)"[^>]*\/?>/gi, '. ')
    .replace(/<break\s*\/?>/gi, ', ')
    .replace(/<mstts:express-as\s+[^>]*>([\s\S]*?)<\/mstts:express-as>/gi, '$1')
    .replace(/<emphasis\s+[^>]*>([\s\S]*?)<\/emphasis>/gi, '$1')
    .replace(/\s+contour="[^"]*"/gi, '');

  sanitized = sanitized
    .replace(/([,;:])\s*,\s*/g, '$1 ')
    .replace(/\.\s*\.\s*/g, '. ')
    .replace(/([,;:])\s*\.\s*/g, '. ')
    .replace(/\.\s*,\s*/g, '. ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (sanitized.includes('<voice')) {
    sanitized = sanitized.replace(
      /<voice\s+name="[^"]*"/i,
      `<voice name="${targetVoice}"`
    );
  }

  return sanitized;
}

async function runRefactorVerificationSuite() {
  console.log('=== SUITE FORENSE DE VERIFICACIÓN DEL MOTOR DE VOZ ISKOOL ===\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASSED] ${testName}`);
      passedTests++;
    } else {
      console.error(`  ✗ [FAILED] ${testName}${detail ? ': ' + detail : ''}`);
    }
  }

  // TEST 1: Fechas y Números
  console.log('--- 1. Expansión Léxica de Fechas, Años y Números Romanos ---');
  const d1 = normalizeMexicanSpanishText('En 1810 se inició la gesta.');
  assert(d1.includes('mil ochocientos diez'), 'Año 1810 -> mil ochocientos diez');

  const d2 = normalizeMexicanSpanishText('El 16 de septiembre de 1810 en Dolores.');
  assert(d2.includes('dieciséis de septiembre de mil ochocientos diez'), '16 de septiembre de 1810');

  const d3 = normalizeMexicanSpanishText('Carlos V y Felipe II dominaron el Siglo XVI.');
  assert(d3.includes('Carlos Quinto') && d3.includes('Felipe Segundo') && d3.includes('Siglo dieciséis'), 'Carlos V, Felipe II y Siglo XVI');

  const d4 = normalizeMexicanSpanishText('El volcán se eleva a 3500 m.s.n.m. a 120 km con 95% de niebla.');
  assert(d4.includes('metros sobre el nivel del mar') && d4.includes('kilómetros') && d4.includes('por ciento'), 'Símbolos %, km, m.s.n.m.');

  // TEST 2: Supresión Total de Puntos Suspensivos y Sintagmas
  console.log('\n--- 2. Sintagmas, Sinalefa y Supresión de Elipsis (...) ---');
  const phrase = 'Luchamos en la patria de los héroes para el pueblo con la espada por la libertad.';
  const syntagma = analyzeAndInjectSyntagmas(phrase);
  assert(!syntagma.includes('...'), 'Cero elipsis (...) inyectadas');
  assert(!/\ben\s*<break[^>]*\/>\s*la\b/i.test(syntagma), 'Sin ruptura en "en la" (sintagma intacto)');
  assert(!/\bde\s*<break[^>]*\/>\s*los\b/i.test(syntagma), 'Sin ruptura en "de los" (sintagma intacto)');
  assert(!/\bpara\s*<break[^>]*\/>\s*el\b/i.test(syntagma), 'Sin ruptura en "para el" (sintagma intacto)');
  assert(!/\bpor\s*<break[^>]*\/>\s*la\b/i.test(syntagma), 'Sin ruptura en "por la" (sintagma intacto)');

  // TEST 3: Diccionario Fonético Náhuatl e Histórico
  console.log('\n--- 3. Diccionario Fonético Prehispánico e Histórico ---');
  const nahuatlPhrase = 'Cuauhtémoc, Nezahualcóyotl, Tenochtitlán, Tlaxcala, Xochimilco, Oaxaca y Popocatépetl.';
  const phoneticSub = applyPhoneticSubstitutions(nahuatlPhrase, 'sub');
  assert(phoneticSub.includes('alias="cuautémoc"'), 'Alias Cuauhtémoc');
  assert(phoneticSub.includes('alias="nesagualcóyotl"'), 'Alias Nezahualcóyotl');
  assert(phoneticSub.includes('alias="tenochtitlán"'), 'Alias Tenochtitlán');
  assert(phoneticSub.includes('alias="tlaskala"'), 'Alias Tlaxcala');
  assert(phoneticSub.includes('alias="sochimilco"'), 'Alias Xochimilco');
  assert(phoneticSub.includes('alias="oajaca"'), 'Alias Oaxaca');
  assert(phoneticSub.includes('alias="popocatépetl"'), 'Alias Popocatépetl');

  // TEST 4: Constructor buildOptimizedSSML e Inyección Expresiva Dinámica
  console.log('\n--- 4. Inyección Expresiva Dinámica (<mstts:express-as>) ---');
  const arengaSSML = generateHistoricalSSML('¡Compatriotas, a las armas! ¡Por la patria!', 'Miguel Hidalgo');
  assert(arengaSSML.includes('<mstts:express-as style="excited"'), 'Arenga style="excited"');
  assert(arengaSSML.includes('rate="+2%"'), 'Arenga prosody rate +2%');

  const philSSML = generateHistoricalSSML('La patria, la libertad y la justicia son el supremo destino del pueblo.', 'Benito Juárez');
  assert(philSSML.includes('<mstts:express-as style="calm"'), 'Filosófica style="calm"');
  assert(philSSML.includes('rate="-4%"'), 'Filosófica prosody rate -4%');

  const enigmaSSML = generateNarratorSSML('El enigma del tiempo guarda secretos clasificados.', 'time_chrononaut');
  assert(enigmaSSML.includes('<mstts:express-as style="whispering"'), 'Enigmas style="whispering"');

  const guideSSML = generateNarratorSSML('¡Excelente logro alcanzado en la misión pedagógica!', 'wisdom_guide');
  assert(guideSSML.includes('<mstts:express-as style="cheerful"'), 'Guía del Saber style="cheerful"');

  // TEST 5: Síntesis Acústica Real de Audio de Alta Fidelidad
  console.log('\n--- 5. Síntesis Real de Audio Neural (24kHz / 96kbps MP3) ---');
  const textToSynthesize = 'El dieciséis de septiembre de 1810, Don Miguel Hidalgo convocó al pueblo en Dolores.';
  const ssmlToSynthesize = generateHistoricalSSML(textToSynthesize, 'Miguel Hidalgo');
  const sanitizedSSML = sanitizeForTTS(ssmlToSynthesize);

  const tts = new MsEdgeTTS();
  await tts.setMetadata('es-MX-JorgeNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);
  const { audioStream } = tts.rawToStream(sanitizedSSML);
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    audioStream.on('data', (c: Buffer) => chunks.push(c));
    audioStream.on('end', () => resolve());
    audioStream.on('error', (e) => reject(e));
  });
  const audioBuffer = Buffer.concat(chunks);
  assert(audioBuffer.length > 50000, `Audio sintetizado con éxito (${audioBuffer.length} bytes recibidos)`);

  console.log(`\n======================================================`);
  console.log(`RESULTADO DE LA SUITE: ${passedTests} de ${totalTests} pruebas superadas.`);
  console.log(`======================================================\n`);
}

runRefactorVerificationSuite().catch(console.error);
