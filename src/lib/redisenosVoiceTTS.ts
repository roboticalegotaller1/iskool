// src/lib/redisenosVoiceTTS.ts
"use client";

/**
 * MOTOR CENTRALIZADO DE SÍNTESIS DE VOZ FEMENINA NATURAL EN ESPAÑOL
 * ----------------------------------------------------------------------------
 * Conecta todos los rediseños gamificados (Casos 01 al 10) y el Visor Ejecutivo CEO
 * con el motor neuronal de alta fidelidad (/api/ai/tts · 24kHz / 96kbps) utilizando
 * exclusivamente las mejores voces femeninas naturales en español latinoamericano.
 */

export interface FemaleSpanishVoiceProfile {
  id: string;
  name: string;
  region: string;
  style: string;
  recommendedFor: string;
  defaultRate: number;
  defaultPitch: number;
}

export const NATURAL_FEMALE_SPANISH_VOICES: FemaleSpanishVoiceProfile[] = [
  {
    id: 'es-MX-DaliaNeural',
    name: 'Dalia (Natural Mexicana)',
    region: 'México · es-MX',
    style: 'Cálida, humana, maternal y expresiva',
    recommendedFor: 'Preescolar, Primaria y Tutoría Pedagógica',
    defaultRate: 1.0,
    defaultPitch: 1.02
  },
  {
    id: 'es-CO-SalomeNeural',
    name: 'Salomé (Natural Colombiana)',
    region: 'Latinoamérica · es-CO',
    style: 'Melódica, clara, dinámica y envolvente',
    recommendedFor: 'Narrativa, Cuentos Interactivos y Exploración',
    defaultRate: 1.0,
    defaultPitch: 1.0
  },
  {
    id: 'es-PE-CamilaNeural',
    name: 'Camila (Natural Andina)',
    region: 'Perú · es-PE',
    style: 'Dulce, pausada, articulada y empática',
    recommendedFor: 'Lectoescritura, Álbumes y Mentoras Históricas',
    defaultRate: 0.98,
    defaultPitch: 1.02
  },
  {
    id: 'es-US-PalomaNeural',
    name: 'Paloma (Natural Ejecutiva)',
    region: 'Hispanoamérica · es-US',
    style: 'Ejecutiva, serena, académica y de alta precisión',
    recommendedFor: 'Secundaria, Preparatoria y Resumen Ejecutivo CEO',
    defaultRate: 1.02,
    defaultPitch: 1.0
  },
  {
    id: 'es-CR-MariaNeural',
    name: 'María (Natural Centroamericana)',
    region: 'Costa Rica · es-CR',
    style: 'Suave, armónica y cercana',
    recommendedFor: 'Acompañamiento Socioemocional y Retroalimentación',
    defaultRate: 0.99,
    defaultPitch: 1.01
  }
];

export interface SpeakNaturalFemaleOptions {
  voiceId?: string;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

// Estado global de reproducción y caché de audio en cliente
let activeAudioElement: HTMLAudioElement | null = null;
let activeAbortController: AbortController | null = null;
let preferredFemaleVoiceId: string = 'es-MX-DaliaNeural';
const clientAudioBlobCache = new Map<string, string>();

/**
 * Obtiene la voz femenina natural actualmente preferida por el usuario.
 */
export function getPreferredFemaleVoiceId(): string {
  if (typeof window !== 'undefined') {
    const saved = window.localStorage.getItem('iskool_preferred_female_voice');
    if (saved && NATURAL_FEMALE_SPANISH_VOICES.some(v => v.id === saved)) {
      preferredFemaleVoiceId = saved;
    }
  }
  return preferredFemaleVoiceId;
}

/**
 * Establece la voz femenina natural preferida para toda la suite.
 */
export function setPreferredFemaleVoiceId(voiceId: string): void {
  if (NATURAL_FEMALE_SPANISH_VOICES.some(v => v.id === voiceId)) {
    preferredFemaleVoiceId = voiceId;
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('iskool_preferred_female_voice', voiceId);
      } catch {
        // Ignorar errores de almacenamiento privado
      }
    }
  }
}

/**
 * Detiene inmediatamente cualquier reproducción de voz neural o de navegador activa.
 */
export function stopNaturalFemaleVoice(): void {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
    } catch {
      // Ignorar error al pausar
    }
    activeAudioElement = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignorar error de speechSynthesis
    }
  }
}

/**
 * Selecciona la mejor voz femenina en español disponible en el navegador como respaldo offline,
 * descartando explícitamente voces masculinas.
 */
function selectBestBrowserFemaleSpanishVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const esVoices = voices.filter(v => v.lang.toLowerCase().startsWith('es'));
  if (esVoices.length === 0) return null;

  const femaleKeywords = [
    'dalia', 'salome', 'salomé', 'camila', 'paloma', 'sabina', 'paulina',
    'maria', 'maría', 'helena', 'laura', 'monica', 'mónica', 'lucia', 'lucía',
    'sofia', 'sofía', 'valentina', 'isabela', 'renata', 'beatriz', 'larissa',
    'marina', 'nuria', 'catala', 'catalina', 'elena', 'paola', 'andrea',
    'marta', 'female', 'mujer', 'femenina'
  ];

  const maleKeywords = [
    'raul', 'raúl', 'jorge', 'pablo', 'diego', 'carlos', 'alonso', 'gonzalo',
    'alex', 'tomas', 'tomás', 'lorenzo', 'juan', 'manuel', 'emilio', 'luis',
    'andres', 'andrés', 'sebastian', 'sebastián', 'male', 'hombre'
  ];

  let bestVoice: SpeechSynthesisVoice | null = null;
  let bestScore = -999;

  for (const v of esVoices) {
    const nameLower = v.name.toLowerCase();
    const langLower = v.lang.toLowerCase();
    let score = 0;

    // Priorizar español de México y Latinoamérica
    if (langLower === 'es-mx' || langLower === 'es_mx') score += 40;
    else if (langLower.startsWith('es-us') || langLower.startsWith('es-co') || langLower.startsWith('es-pe') || langLower.startsWith('es-419')) score += 30;
    else if (langLower.startsWith('es')) score += 15;

    // Priorizar voces Neural / Natural / Online
    if (nameLower.includes('natural') || nameLower.includes('neural')) score += 60;
    if (!v.localService) score += 20;

    // Bonificar coincidencias con nombres femeninos
    if (femaleKeywords.some(k => nameLower.includes(k))) {
      score += 80;
    }

    // Penalizar severamente nombres masculinos
    if (maleKeywords.some(k => nameLower.includes(k))) {
      score -= 200;
    }

    if (score > bestScore) {
      bestScore = score;
      bestVoice = v;
    }
  }

  return bestVoice || esVoices[0];
}

/**
 * Respaldo en navegador con selección estricta de voz femenina en español.
 */
function speakFallbackBrowserFemale(
  text: string,
  options: SpeakNaturalFemaleOptions
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    const chosenVoice = selectBestBrowserFemaleSpanishVoice();
    if (chosenVoice) {
      utter.voice = chosenVoice;
      utter.lang = chosenVoice.lang || 'es-MX';
    } else {
      utter.lang = 'es-MX';
    }
    utter.rate = options.rate ?? 1.0;
    utter.pitch = options.pitch ?? 1.05;

    utter.onstart = () => options.onStart?.();
    utter.onend = () => options.onEnd?.();
    utter.onerror = () => {
      options.onError?.();
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utter);
  } catch {
    options.onEnd?.();
  }
}

/**
 * Reproduce texto en español utilizando el motor neuronal de voces femeninas humanas (/api/ai/tts).
 * Garantiza entonación humana natural, cálida y cristalina en todos los rediseños.
 */
export async function speakNaturalFemaleSpanish(
  text: string,
  options: SpeakNaturalFemaleOptions = {}
): Promise<void> {
  if (typeof window === 'undefined' || !text || !text.trim()) {
    options.onEnd?.();
    return;
  }

  stopNaturalFemaleVoice();

  const targetVoiceId = options.voiceId || getPreferredFemaleVoiceId() || 'es-MX-DaliaNeural';
  const profile = NATURAL_FEMALE_SPANISH_VOICES.find(v => v.id === targetVoiceId) || NATURAL_FEMALE_SPANISH_VOICES[0];
  const rate = options.rate ?? profile.defaultRate;
  const pitch = options.pitch ?? profile.defaultPitch;

  const cleanText = text.replace(/\s+/g, ' ').trim();
  const cacheKey = `${profile.id}:${rate.toFixed(2)}:${pitch.toFixed(2)}:${cleanText}`;

  // 1. Verificar caché en memoria del cliente (latencia 0ms)
  const cachedBlobUrl = clientAudioBlobCache.get(cacheKey);
  if (cachedBlobUrl) {
    try {
      const audio = new Audio(cachedBlobUrl);
      activeAudioElement = audio;
      options.onStart?.();
      audio.onended = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        options.onEnd?.();
      };
      audio.onerror = () => {
        if (activeAudioElement === audio) activeAudioElement = null;
        speakFallbackBrowserFemale(cleanText, options);
      };
      await audio.play();
      return;
    } catch {
      // Si falla reproducción del blob en caché, continuar con petición o fallback
    }
  }

  // 2. Solicitar síntesis neuronal de alta definición a /api/ai/tts
  const abortController = new AbortController();
  activeAbortController = abortController;

  try {
    options.onStart?.();

    const response = await fetch('/api/ai/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: abortController.signal,
      body: JSON.stringify({
        text: cleanText,
        voice: profile.id,
        language: 'es',
        rate,
        pitch,
        role: 'pedagogical_female'
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const audioBlob = await response.blob();
    if (abortController.signal.aborted) return;

    const blobUrl = URL.createObjectURL(audioBlob);
    if (clientAudioBlobCache.size >= 100) {
      const oldestKey = clientAudioBlobCache.keys().next().value;
      if (oldestKey) {
        const oldUrl = clientAudioBlobCache.get(oldestKey);
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        clientAudioBlobCache.delete(oldestKey);
      }
    }
    clientAudioBlobCache.set(cacheKey, blobUrl);

    const audio = new Audio(blobUrl);
    activeAudioElement = audio;
    audio.onended = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      options.onEnd?.();
    };
    audio.onerror = () => {
      if (activeAudioElement === audio) activeAudioElement = null;
      speakFallbackBrowserFemale(cleanText, options);
    };

    await audio.play();
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      options.onEnd?.();
      return;
    }
    // Respaldo inmediato con la mejor voz femenina del navegador
    speakFallbackBrowserFemale(cleanText, options);
  }
}

