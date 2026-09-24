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
  // Español Latinoamericano Nativo (Certificado Anti-Castellano)
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

  // Francés (FLE - Français Langue Étrangère) · Voces Nativas Certificadas
  { id: 'fr-FR-VivienneMultilingualNeural', label: 'Mme. Sophie (Francia) · Parisina Expresiva', description: 'Mentora Principal · Entonación Expresiva, Rítmica y Pedagógica', gender: 'female', lang: 'fr' },
  { id: 'fr-FR-DeniseNeural', label: 'Marie Curie (Francia) · Académica Posada', description: 'Francés Académico · Articulación Impecable y Solemne', gender: 'female', lang: 'fr' },
  { id: 'fr-FR-EloiseNeural', label: 'Jeanne d\'Arc (Francia) · Juvenil Heroica', description: 'Timbre Juvenil y Firme · Pronunciación Clara para Principiantes', gender: 'female', lang: 'fr' },
  { id: 'fr-FR-HenriNeural', label: 'Prof. Henri / Napoléon (Francia) · Masculina Solemne', description: 'Profesor y Caudillo · Dicción Histórica, Grave y Clara', gender: 'male', lang: 'fr' },
  { id: 'fr-FR-RemyMultilingualNeural', label: 'Rémy (Francia) · Conversacional Moderno', description: 'Francés Actual · Modulación Cálida y Natural', gender: 'male', lang: 'fr' },
  { id: 'fr-CA-SylvieNeural', label: 'Sylvie (Canadá) · Québécoise Suave', description: 'Francés de América del Norte · Fonética Suave', gender: 'female', lang: 'fr' },
  { id: 'fr-CA-JeanNeural', label: 'Jean (Canadá) · Québécois Masculino', description: 'Francés Canadiense · Articulación Precisa', gender: 'male', lang: 'fr' },

  // Inglés (ESL - English as a Second Language) · Voces Nativas Certificadas
  { id: 'en-US-JennyNeural', label: 'Claire (EE.UU.) · Femenina Didáctica', description: 'Profesora Claire · Timbre Suave, Cálido y Didáctico', gender: 'female', lang: 'en' },
  { id: 'en-US-GuyNeural', label: 'Prof. Arthur / Lincoln (EE.UU.) · Académica', description: 'Profesor Arthur · Cadencia Estable y Académica', gender: 'male', lang: 'en' },
  { id: 'en-GB-RyanNeural', label: 'Shakespeare (Reino Unido) · Oxford Clásico', description: 'Inglés Británico RP · Oratoria Teatral y Resonante', gender: 'male', lang: 'en' },
  { id: 'en-GB-SoniaNeural', label: 'Ada Lovelace (Reino Unido) · Victoriana Científica', description: 'Inglés Británico · Articulación Lógica y Elegante', gender: 'female', lang: 'en' },
  { id: 'en-US-AvaMultilingualNeural', label: 'Ava (EE.UU.) · Multilingüe Expresiva', description: 'Expresividad Moderna · Alta Claridad en Consonantes', gender: 'female', lang: 'en' },
  { id: 'en-US-AndrewMultilingualNeural', label: 'Andrew (EE.UU.) · Multilingüe Dinámico', description: 'Voz Juvenil · Enfoque Comunicativo Ágil', gender: 'male', lang: 'en' }
];

/**
 * Catálogos de Voces Activas Verificadas en Edge TTS por Región
 */
export const EDGE_TTS_ACTIVE_FRENCH_VOICES = new Set([
  'fr-FR-VivienneMultilingualNeural',
  'fr-FR-DeniseNeural',
  'fr-FR-HenriNeural',
  'fr-FR-RemyMultilingualNeural',
  'fr-FR-EloiseNeural',
  'fr-CA-SylvieNeural',
  'fr-CA-AntoineNeural',
  'fr-CA-JeanNeural',
  'fr-CA-ThierryNeural',
  'fr-BE-CharlineNeural',
  'fr-BE-GerardNeural',
  'fr-CH-ArianeNeural',
  'fr-CH-FabriceNeural'
]);

export const EDGE_TTS_ACTIVE_ENGLISH_VOICES = new Set([
  'en-US-JennyNeural',
  'en-US-GuyNeural',
  'en-US-AriaNeural',
  'en-US-AvaMultilingualNeural',
  'en-US-AndrewMultilingualNeural',
  'en-US-BrianMultilingualNeural',
  'en-US-EmmaMultilingualNeural',
  'en-GB-RyanNeural',
  'en-GB-SoniaNeural',
  'en-GB-LibbyNeural',
  'en-GB-ThomasNeural'
]);

export const EDGE_TTS_ACTIVE_LATIN_VOICES = new Set([
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
 * Resolvedor Multilingüe y Certificado de Voz Neural y Locale:
 * - Detecta el idioma objetivo (Francés, Inglés o Español)
 * - Garantiza que el Francés utilice voces 100% nativas de Francia/Canadá con locale 'fr-FR'/'fr-CA'
 * - Aplica el Bloqueo Anti-Castellano estricto para Español
 */
export function resolveCertifiedPlatformVoice(
  voiceId?: string, 
  explicitLang?: string, 
  fallbackGender: 'female' | 'male' = 'female'
): { voice: string; lang: 'fr' | 'en' | 'es'; locale: string } {
  const lower = (voiceId || '').toLowerCase();
  const explicit = (explicitLang || '').toLowerCase();

  // 1. DETECCIÓN Y RESOLUCIÓN PARA FRANCÉS (FLE)
  if (lower.startsWith('fr-') || lower.includes('french') || explicit === 'fr' || explicit.startsWith('fr-')) {
    if (voiceId && EDGE_TTS_ACTIVE_FRENCH_VOICES.has(voiceId)) {
      const locale = voiceId.startsWith('fr-CA') ? 'fr-CA' : 'fr-FR';
      return { voice: voiceId, lang: 'fr', locale };
    }
    // Fallback francés nativo por género
    const defaultFrench = fallbackGender === 'male' ? 'fr-FR-HenriNeural' : 'fr-FR-VivienneMultilingualNeural';
    return { voice: defaultFrench, lang: 'fr', locale: 'fr-FR' };
  }

  // 2. DETECCIÓN Y RESOLUCIÓN PARA INGLÉS (ESL)
  if (lower.startsWith('en-') || lower.includes('english') || explicit === 'en' || explicit.startsWith('en-')) {
    if (voiceId && EDGE_TTS_ACTIVE_ENGLISH_VOICES.has(voiceId)) {
      const locale = voiceId.startsWith('en-GB') ? 'en-GB' : 'en-US';
      return { voice: voiceId, lang: 'en', locale };
    }
    // Fallback inglés nativo por género
    const defaultEnglish = fallbackGender === 'male' ? 'en-US-GuyNeural' : 'en-US-JennyNeural';
    return { voice: defaultEnglish, lang: 'en', locale: 'en-US' };
  }

  // 3. RESOLUCIÓN PARA ESPAÑOL (CON BLOQUEO ESTRICTO ANTI-CASTELLANO)
  if (lower.includes('es-es') || lower.includes('es_es') || lower.includes('spain') || lower.includes('castellano') || lower.includes('elvira') || lower.includes('alvaro') || lower.includes('ximena')) {
    console.warn(`[Anti-Castellano] Interceptada voz no autorizada '${voiceId}'. Reasignada a voz nativa mexicana.`);
    const safeLatin = fallbackGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
    return { voice: safeLatin, lang: 'es', locale: 'es-MX' };
  }

  if (voiceId && EDGE_TTS_ACTIVE_LATIN_VOICES.has(voiceId)) {
    return { voice: voiceId, lang: 'es', locale: 'es-MX' };
  }

  // Mapeo Azure -> Edge para voces latinas
  const AZURE_TO_EDGE_LATIN_MAP: Record<string, string> = {
    'es-MX-PelayoNeural': 'es-CO-GonzaloNeural',
    'es-MX-MarinaNeural': 'es-CO-SalomeNeural',
    'es-MX-LarissaNeural': 'es-CO-SalomeNeural',
    'es-MX-CecilioNeural': 'es-PE-AlexNeural',
    'es-MX-NuriaNeural': 'es-PE-CamilaNeural',
    'es-MX-LibertoNeural': 'es-MX-JorgeNeural',
    'es-MX-YagoNeural': 'es-CO-GonzaloNeural',
    'es-MX-BeatrizNeural': 'es-MX-DaliaNeural',
    'es-MX-CandelaNeural': 'es-MX-DaliaNeural',
    'es-MX-GerardoNeural': 'es-MX-JorgeNeural',
    'es-MX-RenataNeural': 'es-MX-DaliaNeural',
    'es-MX-CarlotaNeural': 'es-MX-DaliaNeural',
    'es-MX-CandidoNeural': 'es-MX-JorgeNeural',
    'es-MX-LucianoNeural': 'es-MX-JorgeNeural'
  };

  if (voiceId && AZURE_TO_EDGE_LATIN_MAP[voiceId]) {
    return { voice: AZURE_TO_EDGE_LATIN_MAP[voiceId], lang: 'es', locale: 'es-MX' };
  }

  // Fallback por defecto en español
  const defaultLatin = fallbackGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
  return { voice: defaultLatin, lang: 'es', locale: 'es-MX' };
}

// Mantener compatibilidad hacia atrás
export function resolveCertifiedLatinVoice(voiceId?: string, fallbackGender: 'female' | 'male' = 'female'): string {
  return resolveCertifiedPlatformVoice(voiceId, 'es', fallbackGender).voice;
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
 * respetando el xml:lang del idioma seleccionado (fr-FR, en-US o es-MX) para que el
 * diccionario fonético aplique la pronunciación, ligaduras y nasales correctas.
 */
function sanitizeSSMLForNeuralEngine(rawSSML: string, targetVoiceName: string, locale: string = 'es-MX'): string {
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

  // Asegurar que el tag raíz tenga el xml:lang adecuado al idioma
  if (sanitized.includes('<speak')) {
    sanitized = sanitized.replace(
      /<speak[^>]*>/i, 
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${locale}">`
    );
  }

  // Asegurar que la etiqueta <voice name="..."> use la voz autorizada
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
      language,
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

    // Detección de idioma y resolución de voz certificada
    let explicitLang = language;
    if (!explicitLang && preliminaryVoice) {
      if (preliminaryVoice.startsWith('fr-')) explicitLang = 'fr';
      else if (preliminaryVoice.startsWith('en-')) explicitLang = 'en';
      else if (preliminaryVoice.startsWith('es-')) explicitLang = 'es';
    }

    // 1. Procesamiento de carga útil: SSML directo o generación por texto/personaje/narrador
    if (ssml && typeof ssml === 'string' && ssml.trim()) {
      const voiceMatch = /<voice\s+name="([^"]+)"/i.exec(ssml);
      if (voiceMatch && voiceMatch[1]) {
        preliminaryVoice = voiceMatch[1];
      }
      const resolved = resolveCertifiedPlatformVoice(preliminaryVoice, explicitLang, characterGender);
      targetSSML = sanitizeSSMLForNeuralEngine(ssml.trim(), resolved.voice, resolved.locale);
      preliminaryVoice = resolved.voice;
      rawNormalizedText = resolved.lang === 'es' 
        ? normalizeLatinHistoricalPhonetics(ssml.replace(/<[^>]+>/g, ' '))
        : ssml.replace(/<[^>]+>/g, ' ').trim();
    } else if (text && typeof text === 'string' && text.trim()) {
      // Limpieza inicial de markdown preservando ortografía del idioma
      const cleanText = text
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[\[(.*?)\]\]/g, '$1')
        .replace(/[*_#`~>]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      if (!cleanText) {
        return NextResponse.json({ error: 'No hay texto audible tras limpieza' }, { status: 400 });
      }

      // Resolver voz y locale
      const resolved = resolveCertifiedPlatformVoice(preliminaryVoice, explicitLang, characterGender);
      preliminaryVoice = resolved.voice;
      const targetLocale = resolved.locale;
      const isFrench = resolved.lang === 'fr';
      const isEnglish = resolved.lang === 'en';

      if (resolved.lang === 'es') {
        rawNormalizedText = normalizeLatinHistoricalPhonetics(cleanText);
      } else {
        // En francés e inglés NO alterar la ortografía ni apóstrofes
        rawNormalizedText = cleanText;
      }

      if (role === 'narrator' && !isFrench && !isEnglish) {
        // Narradores Gamificados en Español
        const validMode: NarratorMode = ['epic_chronist', 'wisdom_guide', 'time_chrononaut'].includes(narratorMode)
          ? narratorMode 
          : 'wisdom_guide';
        const rawNarratorSSML = generateNarratorSSML(cleanText, validMode);
        preliminaryVoice = preliminaryVoice || (validMode === 'wisdom_guide' ? 'es-MX-DaliaNeural' : 'es-MX-JorgeNeural');
        const certified = resolveCertifiedPlatformVoice(preliminaryVoice, 'es', validMode === 'wisdom_guide' ? 'female' : 'male');
        targetSSML = sanitizeSSMLForNeuralEngine(rawNarratorSSML, certified.voice, certified.locale);
        preliminaryVoice = certified.voice;
      } else if (characterName && !isFrench && !isEnglish) {
        // Próceres Históricos Mexicanos
        const profile = getPersonaProfile(characterName, historicalAge, variantIndex, birthDeathDates);
        preliminaryVoice = preliminaryVoice || profile.voiceId;
        const certified = resolveCertifiedPlatformVoice(preliminaryVoice, 'es', profile.gender);
        const rawHistoricalSSML = generateHistoricalSSML(cleanText, characterName, historicalAge, variantIndex, { birthOrDeathDates: birthDeathDates });
        targetSSML = sanitizeSSMLForNeuralEngine(rawHistoricalSSML, certified.voice, certified.locale);
        preliminaryVoice = certified.voice;
      } else {
        // Francés, Inglés o Locución Pedagógica Directa
        const ratePercent = Math.round((rate - 1.0) * 100);
        const prosodyRate = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        const pitchHz = Math.round((pitch - 1.0) * 100);
        const prosodyPitch = pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`;

        // Para francés, escapar XML y mantener dicción nativa
        const escapedText = cleanText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&apos;');

        targetSSML = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${targetLocale}">
  <voice name="${preliminaryVoice}">
    <prosody pitch="${prosodyPitch}" rate="${prosodyRate}">
      ${escapedText}
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
