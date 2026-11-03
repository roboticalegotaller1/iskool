// src/lib/redisenosVoiceTTS.ts
"use client";

import { playUniversalIskoolVoice, stopAllIskoolAudio } from './historicalVoiceEngine';

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

// Estado global de preferencia de voz femenina en cliente
let preferredFemaleVoiceId: string = 'es-MX-DaliaNeural';

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
  stopAllIskoolAudio();
}

/**
 * Reproduce texto en español utilizando el motor universal de estudio (/api/ai/tts)
 * con protección atómica anti-doble clic y masterización broadcast de 7 etapas.
 */
export async function speakNaturalFemaleSpanish(
  text: string,
  options: SpeakNaturalFemaleOptions = {}
): Promise<void> {
  if (typeof window === 'undefined' || !text || !text.trim()) {
    options.onEnd?.();
    return;
  }

  const targetVoiceId = options.voiceId || getPreferredFemaleVoiceId() || 'es-MX-DaliaNeural';
  const profile = NATURAL_FEMALE_SPANISH_VOICES.find(v => v.id === targetVoiceId) || NATURAL_FEMALE_SPANISH_VOICES[0];

  await playUniversalIskoolVoice({
    text,
    voiceId: profile.id,
    language: 'es',
    gender: 'female',
    role: 'pedagogical',
    rate: options.rate ?? profile.defaultRate,
    pitch: options.pitch ?? profile.defaultPitch,
    onStart: options.onStart,
    onEnd: options.onEnd,
    onError: () => options.onError?.()
  });
}

