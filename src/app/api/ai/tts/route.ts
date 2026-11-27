import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { synthesizeNeuralAudioWithMeta } from '@/lib/serverNeuralTts';
import { 
  generateHistoricalSSML, 
  generateNarratorSSML,
  buildOptimizedSSML,
  getPersonaProfile, 
  getPersonaGender,
  normalizeLatinHistoricalPhonetics,
  detectOratoricalIntention,
  injectLongClauseBreathing,
  NARRATOR_VOICE_PROFILES,
  NarratorMode
} from '@/lib/historicalVoiceEngine';
import { getLanguagePipeline } from '@/lib/audio';

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
  { id: 'es-PE-AlexNeural', label: 'Alex (Latinoamérica) · Masculina', description: 'Joven Prócer / Cadete · Timbre Claro & Enérgico', gender: 'male', lang: 'es' },
  { id: 'es-CR-MariaNeural', label: 'María (Latinoamérica) · Femenina', description: 'Joven Heroína · Timbre Dulce, Cálido & Fonética Impecable', gender: 'female', lang: 'es' },
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
 * Catálogos de Voces Activas Verificadas del Motor Neural Directo por Región
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
    const isCanadian = lower.startsWith('fr-ca') || explicit === 'fr-ca';
    if (isCanadian) {
      const defaultCA = fallbackGender === 'male' ? 'fr-CA-AntoineNeural' : 'fr-CA-SylvieNeural';
      return { voice: defaultCA, lang: 'fr', locale: 'fr-CA' };
    }
    // Fallback francés nativo por género
    const defaultFrench = fallbackGender === 'male' ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural';
    return { voice: defaultFrench, lang: 'fr', locale: 'fr-FR' };
  }

  // 2. DETECCIÓN Y RESOLUCIÓN PARA INGLÉS (ESL)
  if (lower.startsWith('en-') || lower.includes('english') || explicit === 'en' || explicit.startsWith('en-')) {
    if (voiceId && EDGE_TTS_ACTIVE_ENGLISH_VOICES.has(voiceId)) {
      const locale = voiceId.startsWith('en-GB') ? 'en-GB' : 'en-US';
      return { voice: voiceId, lang: 'en', locale };
    }
    const isBritish = lower.startsWith('en-gb') || explicit === 'en-gb';
    if (isBritish) {
      const defaultGB = fallbackGender === 'male' ? 'en-GB-RyanNeural' : 'en-GB-SoniaNeural';
      return { voice: defaultGB, lang: 'en', locale: 'en-GB' };
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

  if (lower === 'es-pe-camilaneural') {
    return { voice: 'es-CR-MariaNeural', lang: 'es', locale: 'es-MX' };
  }

  if (voiceId && EDGE_TTS_ACTIVE_LATIN_VOICES.has(voiceId)) {
    return { voice: voiceId, lang: 'es', locale: 'es-MX' };
  }

  // Mapeo de voces heredadas y arquetipos internos (es-419-* / voice_*) -> 24 Voces Neurales Latinas
  const LEGACY_TO_NEURAL_LATIN_MAP: Record<string, string> = {
    'es-MX-PelayoNeural': 'es-CO-GonzaloNeural',
    'es-MX-MarinaNeural': 'es-CO-SalomeNeural',
    'es-MX-LarissaNeural': 'es-CO-SalomeNeural',
    'es-MX-CecilioNeural': 'es-PE-AlexNeural',
    'es-MX-NuriaNeural': 'es-CR-MariaNeural',
    'es-MX-LibertoNeural': 'es-MX-JorgeNeural',
    'es-MX-YagoNeural': 'es-CO-GonzaloNeural',
    'es-MX-BeatrizNeural': 'es-MX-DaliaNeural',
    'es-MX-CandelaNeural': 'es-MX-DaliaNeural',
    'es-MX-GerardoNeural': 'es-MX-JorgeNeural',
    'es-MX-RenataNeural': 'es-MX-DaliaNeural',
    'es-MX-CarlotaNeural': 'es-MX-DaliaNeural',
    'es-MX-CandidoNeural': 'es-MX-JorgeNeural',
    'es-MX-LucianoNeural': 'es-MX-JorgeNeural',
    'es-419-advisor-7': 'es-US-PalomaNeural',
    'es-419-advisor-4': 'es-MX-DaliaNeural',
    'es-419-podcaster-2': 'es-MX-DaliaNeural',
    'es-419-commercial-6': 'es-CO-SalomeNeural',
    'es-419-tutor-3': 'es-CR-MariaNeural',
    'es-419-assistant-1': 'es-CR-MariaNeural',
    'es-419-concierge-2': 'es-MX-JorgeNeural',
    'es-419-concierge-7': 'es-CO-GonzaloNeural',
    'es-419-concierge-8': 'es-US-AlonsoNeural',
    'es-419-tutor-2': 'es-MX-JorgeNeural',
    'es-419-tutor-4': 'es-US-AlonsoNeural',
    'es-419-podcaster-1': 'es-CO-GonzaloNeural',
    'es-419-podcaster-3': 'es-PE-AlexNeural',
    'es-419-assistant-9': 'es-US-AlonsoNeural',
    'voice_n1k681ufsc1y': 'es-US-PalomaNeural',
    'voice_oqncq3e569jl': 'es-MX-DaliaNeural',
    'voice_q79aaaxpz15o': 'es-CO-SalomeNeural',
    'voice_vat8814ynez3': 'es-US-AlonsoNeural',
    'voice_20glo3j2lyii': 'es-MX-JorgeNeural',
    'voice_ffnov7sw7hon': 'es-PE-AlexNeural'
  };

  if (voiceId && (LEGACY_TO_NEURAL_LATIN_MAP[voiceId] || LEGACY_TO_NEURAL_LATIN_MAP[lower])) {
    return { voice: LEGACY_TO_NEURAL_LATIN_MAP[voiceId] || LEGACY_TO_NEURAL_LATIN_MAP[lower], lang: 'es', locale: 'es-MX' };
  }

  // Fallback por defecto en español
  const defaultLatin = fallbackGender === 'male' ? 'es-MX-JorgeNeural' : 'es-MX-DaliaNeural';
  return { voice: defaultLatin, lang: 'es', locale: 'es-MX' };
}

// Mantener compatibilidad hacia atrás
export function resolveCertifiedLatinVoice(voiceId?: string, fallbackGender: 'female' | 'male' = 'female'): string {
  return resolveCertifiedPlatformVoice(voiceId, 'es', fallbackGender).voice;
}

// =============================================================================
// LIMITADOR DE TASA EN MEMORIA ACOTADO POR IP (120 req/min, mapa <= 1000 IPs)
// Protege el motor neuronal contra ráfagas anómalas sin sobrecarga externa
// =============================================================================
const TTS_RATE_LIMIT_MAX_REQ = 120;
const TTS_RATE_LIMIT_WINDOW_MS = 60_000;
const TTS_RATE_LIMIT_MAX_KEYS = 1000;
const ttsRateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

// Deduplicación de síntesis simultáneas idénticas en vuelo (evita trabajo duplicado concurrente)
const inFlightSynthesisPromises = new Map<string, Promise<{ buffer: Buffer; cacheHit: boolean }>>();

function extractClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return 'local-client';
}

function checkTtsRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  if (ttsRateLimitBuckets.size > TTS_RATE_LIMIT_MAX_KEYS) {
    for (const [key, bucket] of ttsRateLimitBuckets) {
      if (bucket.resetAt <= now) {
        ttsRateLimitBuckets.delete(key);
      }
    }
    while (ttsRateLimitBuckets.size > TTS_RATE_LIMIT_MAX_KEYS) {
      const oldestKey = ttsRateLimitBuckets.keys().next().value;
      if (!oldestKey) break;
      ttsRateLimitBuckets.delete(oldestKey);
    }
  }

  const existing = ttsRateLimitBuckets.get(ip);
  if (!existing || existing.resetAt <= now) {
    ttsRateLimitBuckets.set(ip, { count: 1, resetAt: now + TTS_RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (existing.count >= TTS_RATE_LIMIT_MAX_REQ) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, retryAfterSec };
  }

  existing.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

/**
 * Normaliza y sanea el SSML para garantizar compatibilidad estricta con el motor neural:
 * 1. Despliega la transcripción fonética de <sub alias="..."> para articulación nativa mexicana.
 * 2. Transforma micro-pausas <break time="..."> en articulación prosódica natural (sin puntos suspensivos ...).
 * 3. Extrae el contenido de <mstts:express-as> y <emphasis> preservando la prosodia.
 * 4. Limpia dobles signos de puntuación y asegura namespaces correctos.
 */
function sanitizeSSMLForNeuralEngine(rawSSML: string, targetVoiceName: string, locale: string = 'es-MX'): string {
  let sanitized = rawSSML
    // 1. Desplegar transcripción fonética de <sub alias="..."> (pronunciación fonética real)
    .replace(/<sub\s+alias="([^"]+)"[^>]*>[\s\S]*?<\/sub>/gi, '$1')
    // 2. Desplegar contenido de <phoneme>
    .replace(/<phoneme\s+[^>]*>([\s\S]*?)<\/phoneme>/gi, '$1')
    // 3. Convertir <break time="..."/> en pausas prosódicas naturales SIN puntos suspensivos (...)
    .replace(/<break\s+time="(\d+)ms"[^>]*\/?>/gi, (_match, msStr) => {
      const ms = parseInt(msStr, 10);
      if (ms <= 180) return ', ';
      if (ms <= 350) return '. ';
      return '.\n\n';
    })
    .replace(/<break\s+strength="(?:x-weak|weak)"[^>]*\/?>/gi, ', ')
    .replace(/<break\s+strength="(?:medium|strong|x-strong)"[^>]*\/?>/gi, '. ')
    .replace(/<break\s*\/?>/gi, ', ')
    // 4. Extraer contenido de <mstts:express-as> y <emphasis>
    .replace(/<mstts:express-as\s+[^>]*>([\s\S]*?)<\/mstts:express-as>/gi, '$1')
    .replace(/<emphasis\s+[^>]*>([\s\S]*?)<\/emphasis>/gi, '$1')
    // 5. Eliminar atributo contour de <prosody>
    .replace(/\s+contour="[^"]*"/gi, '');

  // 6. Limpieza acústica de dobles signos generados por yuxtaposición
  sanitized = sanitized
    .replace(/([,;:])\s*,\s*/g, '$1 ')
    .replace(/\.\s*\.\s*/g, '. ')
    .replace(/([,;:])\s*\.\s*/g, '. ')
    .replace(/\.\s*,\s*/g, '. ')
    .replace(/\s{2,}/g, ' ')
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
    const clientIp = extractClientIp(req);
    const rateLimit = checkTtsRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Límite de solicitudes de síntesis de voz excedido temporalmente. Intenta en unos segundos.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSec),
          },
        }
      );
    }

    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al servicio de síntesis de voz' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Cuerpo JSON inválido o malformado para síntesis de voz.' },
        { status: 400 }
      );
    }
    const { 
      ssml, 
      text, 
      voice, 
      language,
      lang: bodyLang,
      gender: bodyGender,
      rate = 1.0, 
      pitch = 1.0, 
      characterName,
      historicalAge,
      birthDeathDates,
      variantIndex = 0,
      role = 'character',
      narratorMode = 'wisdom_guide'
    } = body;

    const characterGender: 'female' | 'male' =
      bodyGender === 'male' || bodyGender === 'female'
        ? bodyGender
        : getPersonaGender(characterName);
    let preliminaryVoice = voice;
    let targetSSML = '';
    let rawNormalizedText = '';
    let cleanText = '';

    if ((text && typeof text === 'string' && text.length > 10000) || (ssml && typeof ssml === 'string' && ssml.length > 15000)) {
      return NextResponse.json(
        { error: 'El texto o SSML supera la longitud máxima permitida para síntesis de audio' },
        { status: 413 }
      );
    }

    // Detección de idioma y resolución de voz certificada
    let explicitLang = language || bodyLang;
    if (!explicitLang && preliminaryVoice) {
      if (preliminaryVoice.startsWith('fr-')) explicitLang = 'fr';
      else if (preliminaryVoice.startsWith('en-')) explicitLang = 'en';
      else if (preliminaryVoice.startsWith('es-')) explicitLang = 'es';
    }

    let resolvedProsodyRate = '+0%';
    let resolvedProsodyPitch = '+0Hz';

    // 1. Procesamiento de carga útil: SSML directo o generación por texto/personaje/narrador
    if (ssml && typeof ssml === 'string' && ssml.trim()) {
      const voiceMatch = /<voice\s+name="([^"]+)"/i.exec(ssml);
      if (voiceMatch && voiceMatch[1]) {
        preliminaryVoice = voiceMatch[1];
      }
      if (characterName) {
        const profile = getPersonaProfile(characterName, historicalAge, variantIndex, birthDeathDates);
        preliminaryVoice = voice || profile.voiceId || preliminaryVoice;
        resolvedProsodyRate = profile.prosodyRate || '-2%';
        resolvedProsodyPitch = profile.prosodyPitch || '+0Hz';
      }
      const resolved = resolveCertifiedPlatformVoice(preliminaryVoice, explicitLang, characterGender);
      targetSSML = sanitizeSSMLForNeuralEngine(ssml.trim(), resolved.voice, resolved.locale);
      preliminaryVoice = resolved.voice;
      const pipeline = getLanguagePipeline(resolved.locale || preliminaryVoice || resolved.lang);
      if (text && typeof text === 'string' && text.trim()) {
        cleanText = text
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\[\[(.*?)\]\]/g, '$1')
          .replace(/[*_#`~>]/g, '')
          .replace(/[ \t]+/g, ' ')
          .trim();
        rawNormalizedText = pipeline.applyPhonetics(pipeline.normalizeText(cleanText), 'plain');
      } else {
        // Extraer desde targetSSML ya sanitizado (donde <sub alias="..."> ya fue expandido a su fonética nativa)
        rawNormalizedText = targetSSML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    } else if (text && typeof text === 'string' && text.trim()) {
      // Limpieza inicial de markdown preservando saltos de párrafo y listas para respiración natural
      cleanText = text
        .replace(/!\[.*?\]\(.*?\)/g, '')
        .replace(/\[\[(.*?)\]\]/g, '$1')
        .replace(/[*_#`~>]/g, '')
        .replace(/[ \t]+/g, ' ')
        .trim();

      if (!cleanText) {
        return NextResponse.json({ error: 'No hay texto audible tras limpieza' }, { status: 400 });
      }

      // Si se especificó un personaje histórico y no se forzó una voz explícita, obtener la voz calibrada del personaje primero
      const characterProfile = characterName
        ? getPersonaProfile(characterName, historicalAge, variantIndex, birthDeathDates)
        : null;
      if (characterProfile && !voice) {
        preliminaryVoice = characterProfile.voiceId;
      }

      // Resolver voz y locale certificados
      const resolved = resolveCertifiedPlatformVoice(preliminaryVoice, explicitLang, characterProfile?.gender || characterGender);
      preliminaryVoice = resolved.voice;
      const targetLocale = resolved.locale;
      const pipeline = getLanguagePipeline(targetLocale || preliminaryVoice || resolved.lang);

      rawNormalizedText = pipeline.applyPhonetics(pipeline.normalizeText(cleanText), 'plain');

      if (role === 'narrator' && resolved.lang === 'es' && !characterName) {
        // Narradores Gamificados en Español
        const validMode: NarratorMode = ['epic_chronist', 'wisdom_guide', 'time_chrononaut'].includes(narratorMode)
          ? narratorMode 
          : 'wisdom_guide';
        const narratorDefaults = NARRATOR_VOICE_PROFILES[validMode] || NARRATOR_VOICE_PROFILES.wisdom_guide;
        const rawNarratorSSML = generateNarratorSSML(cleanText, validMode);
        preliminaryVoice = voice || narratorDefaults.voiceId;
        const certified = resolveCertifiedPlatformVoice(preliminaryVoice, 'es', validMode === 'wisdom_guide' ? 'female' : 'male');
        targetSSML = sanitizeSSMLForNeuralEngine(rawNarratorSSML, certified.voice, certified.locale);
        preliminaryVoice = certified.voice;
        resolvedProsodyRate = narratorDefaults.prosodyRate;
        resolvedProsodyPitch = narratorDefaults.prosodyPitch;
      } else if (characterProfile && resolved.lang === 'es') {
        // Próceres Históricos Mexicanos y Latinoamericanos con Calibración de Autor
        const certified = resolveCertifiedPlatformVoice(voice || characterProfile.voiceId, 'es', characterProfile.gender);
        const rawHistoricalSSML = generateHistoricalSSML(cleanText, characterName, historicalAge, variantIndex, {
          voiceId: certified.voice,
          birthOrDeathDates: birthDeathDates
        });
        targetSSML = sanitizeSSMLForNeuralEngine(rawHistoricalSSML, certified.voice, certified.locale);
        preliminaryVoice = certified.voice;
        resolvedProsodyRate = characterProfile.prosodyRate || '-2%';
        resolvedProsodyPitch = characterProfile.prosodyPitch || '+0Hz';
      } else {
        // Canalización Multilingüe Automatizada (incluye Tutores Pedagógicos y Próceres en Francés e Inglés)
        const isSpanishPedagogicalTutor = resolved.lang === 'es' && !characterProfile && (role === 'tutor' || role === 'pedagogical');
        const hasExplicitRate = typeof body.rate === 'number' && Math.abs(body.rate - 1.0) > 0.001;
        const hasExplicitPitch = typeof body.pitch === 'number' && Math.abs(body.pitch - 1.0) > 0.001;

        const ratePercent = characterProfile
          ? parseInt(characterProfile.prosodyRate, 10) || 0
          : hasExplicitRate
            ? Math.max(-6, Math.min(8, Math.round((rate - 1.0) * 50)))
            : isSpanishPedagogicalTutor
              ? (characterGender === 'male' ? 3 : 4)
              : 0;
        resolvedProsodyRate = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
        const pitchHz = characterProfile
          ? parseInt(characterProfile.prosodyPitch, 10) || 0
          : hasExplicitPitch
            ? Math.max(-3, Math.min(3, Math.round((pitch - 1.0) * 35)))
            : isSpanishPedagogicalTutor
              ? (characterGender === 'male' ? -1 : 1)
              : 0;
        resolvedProsodyPitch = pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`;

        const directSSML = pipeline.buildSSML({
          voice: preliminaryVoice,
          text: cleanText,
          rate: resolvedProsodyRate,
          pitch: resolvedProsodyPitch,
          locale: pipeline.locale,
          language: pipeline.language,
          intention: detectOratoricalIntention(cleanText)
        });
        targetSSML = sanitizeSSMLForNeuralEngine(directSSML, preliminaryVoice, pipeline.locale);
      }
    } else {
      return NextResponse.json({ error: 'Se requiere SSML o texto para síntesis' }, { status: 400 });
    }

    const targetVoice = preliminaryVoice;

    // 2. Síntesis neuronal directa de alta fidelidad (24 kHz / 96 kbps, 0 Tokens)
    // respaldada por la caché unificada LRU (RAM + disco acotado) en serverNeuralTts.ts
    const fallbackRatePercent = Math.max(-6, Math.min(4, Math.round((rate - 1.0) * 50)));
    const fallbackRate = fallbackRatePercent >= 0 ? `+${fallbackRatePercent}%` : `${fallbackRatePercent}%`;
    const fallbackPitchHz = Math.max(-3, Math.min(3, Math.round((pitch - 1.0) * 35)));
    const fallbackPitch = fallbackPitchHz >= 0 ? `+${fallbackPitchHz}Hz` : `${fallbackPitchHz}Hz`;

    const finalRate = resolvedProsodyRate !== '+0%' ? resolvedProsodyRate : fallbackRate;
    const finalPitch = resolvedProsodyPitch !== '+0Hz' ? resolvedProsodyPitch : fallbackPitch;

    const extractedFromSSML = targetSSML
      ? targetSSML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    const synthText = rawNormalizedText || extractedFromSSML || cleanText || text;

    const inFlightKey = `${targetVoice}::${finalRate}::${finalPitch}::${synthText}`;
    let pendingPromise = inFlightSynthesisPromises.get(inFlightKey);
    if (!pendingPromise) {
      pendingPromise = synthesizeNeuralAudioWithMeta({
        text: synthText,
        voice: targetVoice,
        rate: finalRate,
        pitch: finalPitch,
        characterName: characterName || '',
        role: role || ''
      }).finally(() => {
        inFlightSynthesisPromises.delete(inFlightKey);
      });
      inFlightSynthesisPromises.set(inFlightKey, pendingPromise);
    }
    const { buffer: audioBuffer, cacheHit } = await pendingPromise;

    if (!audioBuffer || audioBuffer.length === 0) {
      throw new Error('El sintetizador no generó datos de audio');
    }

    const cacheStatus = cacheHit ? 'HIT' : 'MISS';

    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'X-Cache': cacheStatus,
        'X-TTS-Cache': cacheStatus,
        'X-Voice-Resolved': targetVoice,
        'X-TTS-Engine': 'Motor-Neuronal-Institucional-96k-0Tokens',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error en síntesis neural de voz oratoria:', error);
    return NextResponse.json(
      {
        error: 'Error al generar el audio de voz humana',
        ...(process.env.NODE_ENV !== 'production' ? { details: error?.message || String(error) } : {})
      },
      { status: 500 }
    );
  }
}
