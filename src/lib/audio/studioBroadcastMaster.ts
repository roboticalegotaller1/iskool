/**
 * Motor Acústico Institucional de Masterización Broadcast en Tiempo Real (Web Audio API)
 * --------------------------------------------------------------------------------------
 * Aplica una cadena DSP de 7 etapas con calidad de estudio de grabación a cualquier
 * elemento de audio reproducible en el navegador:
 *   1. Filtro Paso-Alto Butterworth (65 Hz) — Elimina retumbos subsónicos y plosivas.
 *   2. Ecualizador de Calidez Torácica (125–140 Hz) — Cuerpo de micrófono de condensador.
 *   3. Corte Anti-Cajón / Resonancia Nasal (330 Hz) — Limpia coloraciones sintéticas.
 *   4. Realce de Presencia y Dicción Cristalina (3550 Hz) — Claridad en consonantes.
 *   5. De-Esser Dinámico de Sibilancia (6800 Hz) — Suaviza las "s" y "c" filosas.
 *   6. Estante de Aire Sedoso de Estudio (11000 Hz) — Brillo y respiración natural.
 *   7. Compresor Óptico Broadcast Transparente.
 *
 * Incluye un AudioContext compartido pre-desbloqueado por gestos del usuario para
 * garantizar reproducción audible instantánea incluso tras llamadas asíncronas de red
 * o eventos de reconocimiento de voz en Google Chrome.
 */

export interface StudioBroadcastOptions {
  gender?: 'female' | 'male';
  isMale?: boolean;
  role?: string;
  enableRoomPresence?: boolean;
}

export interface StudioBroadcastChain {
  context: AudioContext;
  analyser: AnalyserNode;
  cleanup: () => void;
}

export interface ActiveFormantLevels {
  rms: number;
  open: number;
  spread: number;
  rounded: number;
  alveolar: boolean;
  bilabial: boolean;
  audioGraphActive: boolean;
}

const liveFormantLevels: ActiveFormantLevels = {
  rms: 0,
  open: 0,
  spread: 0,
  rounded: 0,
  alveolar: false,
  bilabial: false,
  audioGraphActive: false,
};

export function resetActiveVoiceFormantLevels(): void {
  if (typeof window === 'undefined') return;
  const w = window as unknown as {
    __iskoolActiveFormantLevels?: ActiveFormantLevels;
    __iskoolVoiceAudiblySpeaking?: boolean;
  };
  liveFormantLevels.rms = 0;
  liveFormantLevels.open = 0;
  liveFormantLevels.spread = 0;
  liveFormantLevels.rounded = 0;
  liveFormantLevels.alveolar = false;
  liveFormantLevels.bilabial = false;
  liveFormantLevels.audioGraphActive = false;
  w.__iskoolActiveFormantLevels = liveFormantLevels;
  w.__iskoolVoiceAudiblySpeaking = false;
}

function bandAverageNormalized(
  freqData: Uint8Array,
  binHz: number,
  lowHz: number,
  highHz: number
): number {
  const startBin = Math.max(1, Math.floor(lowHz / binHz));
  const endBin = Math.min(freqData.length - 1, Math.ceil(highHz / binHz));
  if (endBin < startBin) return 0;
  let sum = 0;
  for (let i = startBin; i <= endBin; i++) {
    sum += freqData[i];
  }
  return sum / ((endBin - startBin + 1) * 255);
}

const processedAudioElements = new WeakMap<HTMLAudioElement, StudioBroadcastChain>();
let sharedBroadcastAudioContext: AudioContext | null = null;
let gestureListenersInstalled = false;
let activeUnlockHandler: (() => void) | null = null;

function removeGestureUnlockListeners(): void {
  if (typeof window === 'undefined' || !gestureListenersInstalled || !activeUnlockHandler) return;
  window.removeEventListener('pointerdown', activeUnlockHandler, true);
  window.removeEventListener('keydown', activeUnlockHandler, true);
  window.removeEventListener('touchstart', activeUnlockHandler, true);
  window.removeEventListener('click', activeUnlockHandler, true);
  gestureListenersInstalled = false;
  activeUnlockHandler = null;
}

export function unlockSharedBroadcastAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  try {
    if (!sharedBroadcastAudioContext || sharedBroadcastAudioContext.state === 'closed') {
      sharedBroadcastAudioContext = new AudioContextClass({ latencyHint: 'interactive' });
    }
    if (sharedBroadcastAudioContext.state === 'running') {
      removeGestureUnlockListeners();
    } else if (sharedBroadcastAudioContext.state === 'suspended') {
      sharedBroadcastAudioContext.resume().then(() => {
        if (sharedBroadcastAudioContext?.state === 'running') {
          removeGestureUnlockListeners();
        }
      }).catch(() => {});
    }
    return sharedBroadcastAudioContext;
  } catch {
    return null;
  }
}

/**
 * Singleton AudioContext ligero compartido para efectos SFX de UI (hover/clicks/juegos)
 * evitando agotar el límite de 6–8 contextos de hardware del navegador.
 */
export function getSharedSfxAudioContext(): AudioContext | null {
  return unlockSharedBroadcastAudioContext();
}

function ensureGestureUnlockInstalled(): void {
  if (typeof window === 'undefined' || gestureListenersInstalled) return;
  if (sharedBroadcastAudioContext && sharedBroadcastAudioContext.state === 'running') return;
  gestureListenersInstalled = true;

  const unlockHandler = () => {
    const ctx = unlockSharedBroadcastAudioContext();
    if (ctx && ctx.state === 'running') {
      removeGestureUnlockListeners();
    }
  };
  activeUnlockHandler = unlockHandler;

  window.addEventListener('pointerdown', unlockHandler, { passive: true, capture: true });
  window.addEventListener('keydown', unlockHandler, { passive: true, capture: true });
  window.addEventListener('touchstart', unlockHandler, { passive: true, capture: true });
  window.addEventListener('click', unlockHandler, { passive: true, capture: true });
}

if (typeof window !== 'undefined') {
  ensureGestureUnlockInstalled();
}

/**
 * Genera una respuesta al impulso (Impulse Response) de cabina de locución profesional
 * (RT60 ~0.24s) para otorgar profundidad tridimensional natural sin eco metálico.
 */
export function createStudioBoothImpulseBuffer(
  ctx: AudioContext,
  durationSeconds = 0.24,
  decayRate = 5.2
): AudioBuffer {
  const sampleRate = ctx.sampleRate || 48000;
  const length = Math.max(1, Math.floor(sampleRate * durationSeconds));
  const impulse = ctx.createBuffer(2, length, sampleRate);
  const left = impulse.getChannelData(0);
  const right = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    const t = i / length;
    const envelope = Math.pow(1 - t, decayRate);
    left[i] = (Math.random() * 2 - 1) * envelope * 0.32;
    right[i] = (Math.random() * 2 - 1) * envelope * 0.32;
  }
  return impulse;
}

/**
 * Conecta un HTMLAudioElement a la cadena de masterización Broadcast de 7 etapas.
 * Si el AudioContext compartido se encuentra suspendido por políticas de autoplay asíncrono,
 * evita secuestrar el elemento <audio> para que la reproducción nativa HTML5 (ya masterizada
 * a -14.0 LUFS en el servidor) suene siempre al 100% sin riesgo de silencio.
 */
export function attachStudioBroadcastMaster(
  audio: HTMLAudioElement,
  options: StudioBroadcastOptions = {}
): StudioBroadcastChain | null {
  if (typeof window === 'undefined' || !audio) return null;

  ensureGestureUnlockInstalled();

  const existing = processedAudioElements.get(audio);
  if (existing) {
    if (existing.context.state === 'suspended') {
      existing.context.resume().catch(() => {});
    }
    return existing;
  }

  try {
    const ctx = unlockSharedBroadcastAudioContext();
    if (!ctx) return null;

    // CRÍTICO: Si el AudioContext aún no está en estado 'running' (p. ej. tras callback de voz sin clic reciente),
    // NO secuestrar el HTMLAudioElement con createMediaElementSource, permitiendo que <audio> reproduzca directamente.
    if (ctx.state !== 'running') {
      ctx.resume().catch(() => {});
      return null;
    }

    const source = ctx.createMediaElementSource(audio);
    const isMale = options.isMale ?? (options.gender === 'male');

    // Etapa 1: Filtro Paso-Alto Subsónico Transparente (65 Hz)
    const highPass = ctx.createBiquadFilter();
    highPass.type = 'highpass';
    highPass.frequency.value = 65;
    highPass.Q.value = 0.707;

    // Etapa 2: Calidez Torácica Transparente (evita sobre-ecualizar el master -14 LUFS del servidor)
    const chestWarmth = ctx.createBiquadFilter();
    chestWarmth.type = 'peaking';
    chestWarmth.frequency.value = isMale ? 125 : 140;
    chestWarmth.Q.value = 1.0;
    chestWarmth.gain.value = 0.2;

    // Etapa 3: Limpieza Ultra-Suave de Resonancia (330 Hz)
    const mudCut = ctx.createBiquadFilter();
    mudCut.type = 'peaking';
    mudCut.frequency.value = 330;
    mudCut.Q.value = 1.4;
    mudCut.gain.value = -0.2;

    // Etapa 4: Presencia Vocal Transparente (3550 Hz)
    const presenceBoost = ctx.createBiquadFilter();
    presenceBoost.type = 'peaking';
    presenceBoost.frequency.value = 3550;
    presenceBoost.Q.value = 1.0;
    presenceBoost.gain.value = 0.25;

    // Etapa 5: De-Esser Transparente (6800 Hz)
    const deEsser = ctx.createBiquadFilter();
    deEsser.type = 'peaking';
    deEsser.frequency.value = 6800;
    deEsser.Q.value = 2.0;
    deEsser.gain.value = -0.3;

    // Etapa 6: Aire Sedoso de Estudio (11000 Hz)
    const silkAir = ctx.createBiquadFilter();
    silkAir.type = 'highshelf';
    silkAir.frequency.value = 11000;
    silkAir.gain.value = 0.25;

    // Etapa 7: Protección de Picos Transparente (Ratio 1.15:1)
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -6;
    compressor.knee.value = 12;
    compressor.ratio.value = 1.15;
    compressor.attack.value = 0.025;
    compressor.release.value = 0.18;

    const makeupGain = ctx.createGain();
    makeupGain.gain.value = 1.0;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.68;

    source.connect(highPass);
    highPass.connect(chestWarmth);
    chestWarmth.connect(mudCut);
    mudCut.connect(presenceBoost);
    presenceBoost.connect(deEsser);
    deEsser.connect(silkAir);
    silkAir.connect(compressor);
    compressor.connect(makeupGain);
    makeupGain.connect(analyser);
    analyser.connect(ctx.destination);

    // Puente Acústico de Formantes en Tiempo Real a 60 FPS para Lip-Sync Anatómico
    const freqBins = new Uint8Array(analyser.frequencyBinCount);
    const timeDomain = new Uint8Array(analyser.fftSize);
    const binHz = (ctx.sampleRate || 48000) / analyser.fftSize;
    let rafId: number | null = null;
    let prevRms = 0;
    let disposed = false;

    const sampleFormantsLoop = () => {
      if (disposed) return;
      if (audio.paused || audio.ended) {
        rafId = null;
        resetActiveVoiceFormantLevels();
        return;
      }

      analyser.getByteTimeDomainData(timeDomain);
      let sumSq = 0;
      for (let i = 0; i < timeDomain.length; i++) {
        const centered = (timeDomain[i] - 128) / 128;
        sumSq += centered * centered;
      }
      const rms = Math.sqrt(sumSq / timeDomain.length);

      analyser.getByteFrequencyData(freqBins);
      // F1 (300–950 Hz): apertura mandibular vocálica (/a/, /e/, /o/)
      const f1Open = bandAverageNormalized(freqBins, binHz, 300, 950);
      // F2 (1650–3300 Hz): extensión comisural / sonrisa palatal (/i/, /e/)
      const f2Spread = bandAverageNormalized(freqBins, binHz, 1650, 3300);
      // Redondeo labial grave (150–420 Hz): vocales posteriores redondeadas (/o/, /u/)
      const lowRound = bandAverageNormalized(freqBins, binHz, 150, 420);
      // Fricativas/oclusivas alveolares (3800–7600 Hz): elevación lingual (/s/, /t/, /d/, /n/, /l/)
      const highAlveolar = bandAverageNormalized(freqBins, binHz, 3800, 7600);

      // Detección transitoria de cierre bilabial (/m/, /b/, /p/): caída súbita de envolvente con resonancia grave
      const suddenDip = prevRms > 0.045 && rms < prevRms * 0.48 && lowRound > f2Spread * 1.15;
      prevRms = rms * 0.65 + prevRms * 0.35;

      const normalizedOpen =
        rms < 0.012
          ? 0
          : Math.min(1, Math.max(0, (rms - 0.012) * 4.4 * 0.55 + Math.max(0, f1Open - 0.08) * 1.75 * 0.45));

      const w = window as unknown as {
        __iskoolActiveFormantLevels?: ActiveFormantLevels;
        __iskoolVoiceAudiblySpeaking?: boolean;
      };
      w.__iskoolVoiceAudiblySpeaking = true;
      liveFormantLevels.rms = rms;
      liveFormantLevels.open = normalizedOpen;
      liveFormantLevels.spread = Math.min(1, f2Spread * 1.65);
      liveFormantLevels.rounded = Math.min(1, lowRound * 1.45);
      liveFormantLevels.alveolar = highAlveolar > 0.22 && highAlveolar > f1Open * 0.72;
      liveFormantLevels.bilabial = suddenDip;
      liveFormantLevels.audioGraphActive = true;
      w.__iskoolActiveFormantLevels = liveFormantLevels;

      rafId = window.requestAnimationFrame(sampleFormantsLoop);
    };

    const startSampling = () => {
      if (disposed || rafId !== null) return;
      rafId = window.requestAnimationFrame(sampleFormantsLoop);
    };

    const stopSampling = () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
      resetActiveVoiceFormantLevels();
    };

    audio.addEventListener('play', startSampling);
    audio.addEventListener('playing', startSampling);
    audio.addEventListener('pause', stopSampling);
    audio.addEventListener('ended', stopSampling);
    if (!audio.paused && !audio.ended) {
      startSampling();
    }

    const cleanup = () => {
      disposed = true;
      stopSampling();
      audio.removeEventListener('play', startSampling);
      audio.removeEventListener('playing', startSampling);
      audio.removeEventListener('pause', stopSampling);
      audio.removeEventListener('ended', stopSampling);
      processedAudioElements.delete(audio);
      try {
        source.disconnect();
        highPass.disconnect();
        chestWarmth.disconnect();
        mudCut.disconnect();
        presenceBoost.disconnect();
        deEsser.disconnect();
        silkAir.disconnect();
        compressor.disconnect();
        makeupGain.disconnect();
        analyser.disconnect();
      } catch {}
    };

    const chain: StudioBroadcastChain = { context: ctx, analyser, cleanup };
    processedAudioElements.set(audio, chain);
    return chain;
  } catch {
    return null;
  }
}
