import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import crypto from 'crypto';
import { 
  generateHistoricalSSML, 
  generateNarratorSSML,
  getPersonaProfile, 
  getPersonaGender,
  normalizeLatinHistoricalPhonetics,
  injectLongClauseBreathing,
  NarratorMode
} from '@/lib/historicalVoiceEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// =============================================================================
// CATÁLOGO DE VOCES NEURONALES LATINAS CERTIFICADAS (100% LIBRE DE ES-ES)
// Bloqueo estricto anti-castellano: No se admiten voces de España en el sistema
// =============================================================================
export const NEURAL_VOICES = [
  // Español Latinoamericano Nativo
  { id: 'es-MX-DaliaNeural', label: 'Dalia (México) · Femenina', description: 'Mentora Principal · Tono Cálido, Dulce & Pedagógico', gender: 'female', lang: 'es' },
  { id: 'es-MX-JorgeNeural', label: 'Jorge (México) · Masculina', description: 'Profesor Mentor · Tono Maduro, Sereno & Explicativo', gender: 'male', lang: 'es' },
  { id: 'es-CO-SalomeNeural', label: 'Salomé (Colombia) · Femenina', description: 'Educación & Guiado · Acento Neutro Suave', gender: 'female', lang: 'es' },
  { id: 'es-CO-GonzaloNeural', label: 'Gonzalo (Colombia) · Masculina', description: 'Cronista Histórico · Dicción Elegante & Serena', gender: 'male', lang: 'es' },
  { id: 'es-PE-AlexNeural', label: 'Alex (Perú) · Masculina', description: 'Joven Prócer / Cadete · Timbre Claro & Enérgico', gender: 'male', lang: 'es' },
  { id: 'es-PE-CamilaNeural', label: 'Camila (Perú) · Femenina', description: 'Joven Heroína · Timbre Dulce & Reflexivo', gender: 'female', lang: 'es' },
  { id: 'es-US-PalomaNeural', label: 'Paloma (Latina) · Femenina', description: 'Narradora Expresiva & Dinámica · Enfoque Moderno', gender: 'female', lang: 'es' },
  { id: 'es-US-AlonsoNeural', label: 'Alonso (Latino) · Masculina', description: 'Joven Aventurero · Timbre Brillante & Ágil', gender: 'male', lang: 'es' },
  { id: 'es-AR-ElenaNeural', label: 'Elena (Argentina) · Femenina', description: 'Literatura & Humanidades · Entonación Rioplatense', gender: 'female', lang: 'es' },
  { id: 'es-AR-TomasNeural', label: 'Tomás (Argentina) · Masculina', description: 'Pensamiento & Debate · Tono Analítico', gender: 'male', lang: 'es' },

  // Idiomas adicionales para módulos bilingües de la plataforma
  { id: 'en-US-JennyNeural', label: 'Claire (EE.UU.) · Femenina', description: 'Profesora Claire · Didáctica y Clara', gender: 'female', lang: 'en' },
  { id: 'en-US-GuyNeural', label: 'Arthur (EE.UU.) · Masculina', description: 'Profesor Arthur · Académico y Preciso', gender: 'male', lang: 'en' },
  { id: 'fr-FR-DeniseNeural', label: 'Mme. Sophie (Francia) · Femenina', description: 'Profesora Sophie · Francés Académico', gender: 'female', lang: 'fr' },
  { id: 'fr-FR-HenriNeural', label: 'Prof. Henri (Francia) · Masculina', description: 'Profesor Henri · Fonética Clara', gender: 'male', lang: 'fr' }
];

/**
 * Voces activas verificadas en el servicio Edge TTS
 */
const EDGE_TTS_ACTIVE_LATIN_VOICES = new Set([
  'es-MX-DaliaNeural',
  'es-MX-JorgeNeural',
  'es-CO-GonzaloNeural',
  'es-CO-SalomeNeural',
  'es-PE-AlexNeural',
  'es-PE-CamilaNeural',
  'es-US-AlonsoNeural',
  'es-US-PalomaNeural',
  'es-AR-ElenaNeural',
  'es-AR-TomasNeural',
  'es-CL-LorenzoNeural',
  'es-CL-CatalinaNeural',
  'es-CR-JuanNeural',
  'es-CR-MariaNeural',
  'es-CU-ManuelNeural',
  'es-CU-BelkysNeural',
  'es-DO-EmilioNeural',
  'es-DO-RamonaNeural',
  'es-EC-LuisNeural',
  'es-EC-AndreaNeural',
  'es-GT-AndresNeural',
  'es-GT-MartaNeural',
  'es-VE-SebastianNeural',
  'es-VE-PaolaNeural'
]);

/**
 * PILAR 1: Interceptor Anti-Castellano y Mapeador de Voces Latinas Certificadas.
 * Bloquea estrictamente cualquier voz 'es-ES' (España/Castizo) y traduce identificadores
 * de la matriz a las voces activas en el servicio con modulación equivalente.
 */
export function resolveCertifiedLatinVoice(voiceId?: string, fallbackGender: 'female' | 'male' = 'female'): string {
  if (!voiceId) {
    return fallbackGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
  }

  const lower = voiceId.toLowerCase();

  // 1. BLOQUEO TERMINANTE ANTI-CASTELLANO: Cualquier intento con acento de España es interceptado
  if (lower.includes('es-es') || lower.includes('es_es') || lower.includes('spain') || lower.includes('castellano') || lower.includes('elvira') || lower.includes('alvaro') || lower.includes('ximena')) {
    console.warn(`[Anti-Castellano] Interceptada voz no autorizada '${voiceId}'. Reasignada a voz nativa mexicana.`);
    return fallbackGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
  }

  // 2. Si ya es una voz latina nativa directamente soportada en el pool Edge TTS, mantenerla
  if (EDGE_TTS_ACTIVE_LATIN_VOICES.has(voiceId)) {
    return voiceId;
  }

  // 3. Mapeo de voces Azure exclusivas de la matriz hacia las mejores voces latinas activas
  const AZURE_TO_EDGE_LATIN_MAP: Record<string, string> = {
    // Cohortes infantiles y juveniles
    'es-MX-PelayoNeural': 'es-CO-GonzaloNeural', // Joven/infantil ágil
    'es-MX-MarinaNeural': 'es-CO-SalomeNeural',  // Niña vivaz/dulce
    'es-MX-LarissaNeural': 'es-CO-SalomeNeural', // Niña dulce
    'es-MX-CecilioNeural': 'es-PE-AlexNeural',   // Joven enérgico
    'es-MX-NuriaNeural': 'es-PE-CamilaNeural',   // Joven brillante
    // Adultos jóvenes
    'es-MX-LibertoNeural': 'es-MX-JorgeNeural',  // Caudillo firme
    'es-MX-YagoNeural': 'es-CO-GonzaloNeural',   // Adulto joven reflexivo
    'es-MX-BeatrizNeural': 'es-MX-DaliaNeural',  // Adulta joven líder
    'es-MX-CandelaNeural': 'es-MX-DaliaNeural',  // Heroica
    // Adultos y estadistas
    'es-MX-GerardoNeural': 'es-MX-JorgeNeural',  // Solemne institucional
    'es-MX-RenataNeural': 'es-MX-DaliaNeural',   // Intelectual / líder
    'es-MX-CarlotaNeural': 'es-MX-DaliaNeural',  // Matriarca solemne
    // Tercera edad
    'es-MX-CandidoNeural': 'es-MX-JorgeNeural',  // Anciano sabio
    'es-MX-LucianoNeural': 'es-MX-JorgeNeural'   // Veterano
  };

  if (AZURE_TO_EDGE_LATIN_MAP[voiceId]) {
    return AZURE_TO_EDGE_LATIN_MAP[voiceId];
  }

  // Fallback por género latino
  return fallbackGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
}

interface AudioCacheEntry {
  buffer: Buffer;
  contentType: string;
  createdAt: number;
  hits: number;
}

// =============================================================================
// CACHÉ DE SÍNTESIS DE ALTA VELOCIDAD (SHA-256 LRU)
// Evita llamadas redundantes y garantiza latencia cero en frases recurrentes
// =============================================================================
const MAX_CACHE_ENTRIES = 300;
const audioCache = new Map<string, AudioCacheEntry>();

function getAudioFromCache(hash: string): Buffer | null {
  const entry = audioCache.get(hash);
  if (!entry) return null;
  entry.hits++;
  audioCache.delete(hash);
  audioCache.set(hash, entry);
  return entry.buffer;
}

function saveAudioToCache(hash: string, buffer: Buffer, contentType = 'audio/mpeg') {
  if (audioCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = audioCache.keys().next().value;
    if (oldestKey) audioCache.delete(oldestKey);
  }
  audioCache.set(hash, {
    buffer,
    contentType,
    createdAt: Date.now(),
    hits: 0
  });
}

/**
 * Normaliza y sanea el SSML para garantizar compatibilidad estricta con el motor neural,
 * convirtiendo pausas XML (<break>) en puntuación acústica elocuente y descartando
 * atributos no soportados que provocarían desconexión del socket.
 * Asegura además el tag raíz canónico con xml:lang="es-MX".
 */
function sanitizeSSMLForNeuralEngine(rawSSML: string, targetVoiceName: string): string {
  let sanitized = rawSSML
    // Convertir <break time="..."/> en pausas de puntuación acústica (...)
    .replace(/<break\s+[^>]*\/?>/gi, '... ')
    // Extraer contenido de <emphasis>
    .replace(/<emphasis\s+[^>]*>([\s\S]*?)<\/emphasis>/gi, '$1')
    // Eliminar etiquetas de estilo expresivo si no están soportadas
    .replace(/<mstts:express-as\s+[^>]*>/gi, '')
    .replace(/<\/mstts:express-as>/gi, '')
    // Eliminar atributo contour de <prosody>
    .replace(/\s+contour="[^"]*"/gi, '')
    .trim();

  // Asegurar que el tag raíz tenga xml:lang="es-MX"
  if (sanitized.includes('<speak')) {
    sanitized = sanitized.replace(
      /<speak[^>]*>/i, 
      '<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-MX">'
    );
  }

  // Asegurar que la etiqueta <voice name="..."> use la voz latina certificada
  if (sanitized.includes('<voice')) {
    sanitized = sanitized.replace(
      /<voice\s+name="[^"]*"/i,
      `<voice name="${targetVoiceName}"`
    );
  }

  return sanitized;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      ssml, 
      text, 
      voice, 
      rate = 1.0, 
      pitch = 1.0, 
      characterName,
      historicalAge,
      birthDeathDates,
      variantIndex = 0,
      role = 'character',
      narratorMode = 'wisdom_guide'
    } = body;

    const characterGender = getPersonaGender(characterName);
    let preliminaryVoice = voice;
    let targetSSML = '';
    let rawNormalizedText = '';

    // 1. Procesamiento de carga útil: SSML directo o generación por texto/personaje/narrador
    if (ssml && typeof ssml === 'string' && ssml.trim()) {
      // Extraer voz especificada en <voice name="..."> si existe
      const voiceMatch = /<voice\s+name="([^"]+)"/i.exec(ssml);
      if (voiceMatch && voiceMatch[1]) {
        preliminaryVoice = voiceMatch[1];
      }
      preliminaryVoice = preliminaryVoice || (characterGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural');
      const certifiedVoice = resolveCertifiedLatinVoice(preliminaryVoice, characterGender);
      targetSSML = sanitizeSSMLForNeuralEngine(ssml.trim(), certifiedVoice);
      preliminaryVoice = certifiedVoice;
      rawNormalizedText = normalizeLatinHistoricalPhonetics(ssml.replace(/<[^>]+>/g, ' '));
    } else if (text && typeof text === 'string' && text.trim()) {
      // Limpieza inicial de markdown
      const cleanText = text
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[\[(.*?)\]\]/g, '$1')
        .replace(/[*_#`~>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        return NextResponse.json({ error: 'No hay texto audible tras limpieza' }, { status: 400 });
      }

      // Normalización léxica y fonética latina
      rawNormalizedText = normalizeLatinHistoricalPhonetics(cleanText);

      if (role === 'narrator') {
        // PILAR 4: Generación de SSML para Narradores Gamificados
        const validMode: NarratorMode = ['epic_chronist', 'wisdom_guide', 'time_chrononaut'].includes(narratorMode)
          ? narratorMode 
          : 'wisdom_guide';
        const rawNarratorSSML = generateNarratorSSML(cleanText, validMode);
        preliminaryVoice = preliminaryVoice || (validMode === 'wisdom_guide' ? 'es-MX-DaliaNeural' : 'es-MX-JorgeNeural');
        const certifiedVoice = resolveCertifiedLatinVoice(preliminaryVoice, validMode === 'wisdom_guide' ? 'female' : 'male');
        targetSSML = sanitizeSSMLForNeuralEngine(rawNarratorSSML, certifiedVoice);
        preliminaryVoice = certifiedVoice;
      } else if (characterName) {
        // PILAR 2 y 3: Generación SSML oratorio con matriz de 30 voces y pausas respiratorias
        const profile = getPersonaProfile(characterName, historicalAge, variantIndex, birthDeathDates);
        preliminaryVoice = preliminaryVoice || profile.voiceId;
        const certifiedVoice = resolveCertifiedLatinVoice(preliminaryVoice, profile.gender);
        const rawHistoricalSSML = generateHistoricalSSML(cleanText, characterName, historicalAge, variantIndex, { birthOrDeathDates: birthDeathDates });
        targetSSML = sanitizeSSMLForNeuralEngine(rawHistoricalSSML, certifiedVoice);
        preliminaryVoice = certifiedVoice;
      } else {
        // Locución genérica pedagógica
        const certifiedVoice = resolveCertifiedLatinVoice(preliminaryVoice || 'es-MX-DaliaNeural', 'female');
        preliminaryVoice = certifiedVoice;

        const ratePercent = Math.round((rate - 1.0) * 100);
        const prosodyRate = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        const pitchHz = Math.round((pitch - 1.0) * 100);
        const prosodyPitch = pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`;

        const breathEnhanced = injectLongClauseBreathing(rawNormalizedText);

        targetSSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="es-MX">
  <voice name="${certifiedVoice}">
    <prosody pitch="${prosodyPitch}" rate="${prosodyRate}">
      ${breathEnhanced}
    </prosody>
  </voice>
</speak>`;
      }
    } else {
      return NextResponse.json({ error: 'Se requiere SSML o texto para síntesis' }, { status: 400 });
    }

    const targetVoice = preliminaryVoice;

    // 2. Caché SHA-256 incluyendo identificador de voz y hash del texto normalizado
    const normalizedTextHash = crypto
      .createHash('sha256')
      .update(rawNormalizedText || targetSSML)
      .digest('hex');

    const cacheKey = crypto
      .createHash('sha256')
      .update(`${targetVoice}::${normalizedTextHash}::${targetSSML}`)
      .digest('hex');

    const cachedBuffer = getAudioFromCache(cacheKey);
    if (cachedBuffer) {
      return new NextResponse(new Uint8Array(cachedBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': cachedBuffer.length.toString(),
          'X-Cache': 'HIT',
          'X-Voice-Resolved': targetVoice,
          'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
        },
      });
    }

    // 3. Síntesis neuronal de audio de alta fidelidad (24kHz / 96kbps MP3)
    const tts = new MsEdgeTTS();
    await tts.setMetadata(targetVoice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    const { audioStream } = tts.rawToStream(targetSSML);

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer | string) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      });
      audioStream.on('end', () => resolve());
      audioStream.on('error', (err: Error) => reject(err));
    });

    const audioBuffer = Buffer.concat(chunks);

    if (audioBuffer.length === 0) {
      throw new Error('El sintetizador no generó datos de audio');
    }

    // Guardar en caché LRU
    saveAudioToCache(cacheKey, audioBuffer, 'audio/mpeg');

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'X-Cache': 'MISS',
        'X-Voice-Resolved': targetVoice,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error en síntesis neural de voz oratoria:', error);
    return NextResponse.json(
      { error: 'Error al generar el audio de voz humana', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
