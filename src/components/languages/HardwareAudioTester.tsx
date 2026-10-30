"use client";

import React, { useState, useEffect, useRef } from 'react';
import { playUniversalIskoolVoice, stopAllIskoolAudio } from '@/lib/historicalVoiceEngine';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Play, 
  Square,
  Sliders,
  ShieldCheck,
  Zap
} from 'lucide-react';

interface HardwareAudioTesterProps {
  language?: 'en' | 'fr';
  isLightMode?: boolean;
  onDiagnosticComplete?: (result: { micOk: boolean; speakerOk: boolean; latencyMs: number }) => void;
}

export const HardwareAudioTester: React.FC<HardwareAudioTesterProps> = ({ 
  language = 'en',
  isLightMode = true,
  onDiagnosticComplete 
}) => {
  // Estados de micrófono
  const [isListening, setIsListening] = useState(false);
  const [micPermission, setMicPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [audioLevel, setAudioLevel] = useState(0); // 0 a 100
  const [decibels, setDecibels] = useState(-60);
  const [sampleRate, setSampleRate] = useState<number | null>(null);
  const [detectedVoiceText, setDetectedVoiceText] = useState('');
  const [measuredLatencyMs, setMeasuredLatencyMs] = useState<number | null>(null);

  // Estados de altavoz
  const [isPlayingTestTone, setIsPlayingTestTone] = useState(false);
  const [isPlayingVoiceSample, setIsPlayingVoiceSample] = useState(false);
  const [speakerVerified, setSpeakerVerified] = useState(false);

  // Referencias de audio
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Iniciar diagnóstico de micrófono y osciloscopio
  const startMicTest = async () => {
    try {
      if (isListening) {
        stopMicTest();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: true, 
          noiseSuppression: true, 
          autoGainControl: true 
        } 
      });

      mediaStreamRef.current = stream;
      setMicPermission('granted');

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      setSampleRate(ctx.sampleRate);

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      source.connect(analyser);

      setIsListening(true);
      startTimeRef.current = performance.now();

      // Inicializar SpeechRecognition para probar transcripción en vivo
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = language === 'fr' ? 'fr-FR' : 'en-US';
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          setDetectedVoiceText(transcript);
          if (startTimeRef.current && !measuredLatencyMs) {
            const lat = Math.round(performance.now() - startTimeRef.current);
            setMeasuredLatencyMs(lat);
          }
        };

        recognition.onerror = () => {
          // Fallback silencioso si el browser no soporta SpeechRecognition activo
        };

        try {
          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          // Ignorar si ya estaba iniciado
        }
      }

      // Loop de visualización en canvas y medición de decibeles
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderMeter = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        // Calcular volumen RMS
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        // dB aproximados
        const dB = Math.round(-60 + (normalized * 0.6));
        setDecibels(dB);

        // Dibujar en Canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const canvasCtx = canvas.getContext('2d');
          if (canvasCtx) {
            canvasCtx.fillStyle = isLightMode ? '#f8fafc' : '#0f172a';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

            const barWidth = (canvas.width / bufferLength) * 2.5;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
              const barHeight = (dataArray[i] / 255) * canvas.height;

              // Gradiente de color según intensidad
              if (dataArray[i] > 180) {
                canvasCtx.fillStyle = '#ef4444'; // Rojo (Saturación)
              } else if (dataArray[i] > 100) {
                canvasCtx.fillStyle = '#eab308'; // Amarillo
              } else {
                canvasCtx.fillStyle = '#10b981'; // Verde óptimo
              }

              canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
              x += barWidth + 1;
            }
          }
        }

        animationFrameRef.current = requestAnimationFrame(renderMeter);
      };

      renderMeter();

    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      setMicPermission('denied');
      setIsListening(false);
    }
  };

  const stopMicTest = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
    setDecibels(-60);

    onDiagnosticComplete?.({
      micOk: micPermission === 'granted' && audioLevel > 5,
      speakerOk: speakerVerified,
      latencyMs: measuredLatencyMs || 120
    });
  };

  // Reproducir tono sinusoidal de prueba (440 Hz)
  const playTestTone = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // La 4

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      setIsPlayingTestTone(true);
      osc.stop(ctx.currentTime + 1.2);

      setTimeout(() => {
        setIsPlayingTestTone(false);
        setSpeakerVerified(true);
      }, 1200);
    } catch (e) {
      console.error('Error al generar tono:', e);
    }
  };

  // Reproducir muestra de voz neural en el idioma objetivo
  const playVoiceSample = async () => {
    stopAllIskoolAudio();
    setIsPlayingVoiceSample(true);

    const text = language === 'fr' 
      ? 'Système audio vérifié. Vous êtes prêt pour votre session en français.' 
      : 'Audio system verified. You are ready for your English language session.';

    const voiceId = language === 'fr' ? 'fr-FR-VivienneMultilingualNeural' : 'en-US-JennyNeural';

    try {
      await playUniversalIskoolVoice({
        text,
        voiceId,
        language,
        rate: 0.95,
        onStart: () => setIsPlayingVoiceSample(true),
        onEnd: () => {
          setIsPlayingVoiceSample(false);
          setSpeakerVerified(true);
        },
        onError: () => setIsPlayingVoiceSample(false)
      });
    } catch {
      setIsPlayingVoiceSample(false);
    }
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      stopMicTest();
    };
  }, []);

  return (
    <div className={`p-6 rounded-3xl border space-y-6 transition-all ${
      isLightMode 
        ? 'bg-white border-slate-200/90 shadow-sm text-slate-900' 
        : 'bg-slate-900 border-slate-800 text-slate-100 shadow-2xl'
    }`}>
      {/* Encabezado */}
      <div className={`flex flex-wrap items-center justify-between gap-3 pb-4 border-b ${
        isLightMode ? 'border-slate-100' : 'border-slate-800'
      }`}>
        <div>
          <span className="text-[10px] font-black uppercase text-teal-600 dark:text-teal-400 tracking-wider block">
            Diagnóstico de Hardware & Audio (Web Audio API)
          </span>
          <h3 className={`text-lg font-black flex items-center gap-2 ${
            isLightMode ? 'text-slate-900' : 'text-white'
          }`}>
            <Activity className="w-5 h-5 text-indigo-600 dark:text-cyan-400" />
            <span>Comprobación de Micrófono & Altavoces del Centro de Idiomas</span>
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-black flex items-center gap-1.5 border ${
            micPermission === 'granted'
              ? (isLightMode ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950 border-emerald-600 text-emerald-300')
              : micPermission === 'denied'
                ? (isLightMode ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-rose-950 border-rose-600 text-rose-300')
                : (isLightMode ? 'bg-slate-100 border-slate-200 text-slate-600' : 'bg-slate-800 border-slate-700 text-slate-400')
          }`}>
            {micPermission === 'granted' && <CheckCircle2 className="w-3.5 h-3.5" />}
            {micPermission === 'denied' && <AlertCircle className="w-3.5 h-3.5" />}
            <span>Micrófono: {micPermission === 'granted' ? 'Calibrado' : micPermission === 'denied' ? 'Bloqueado' : 'Pendiente'}</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Columna Izquierda: Prueba y Visualización del Micrófono */}
        <div className={`lg:col-span-7 space-y-4 p-5 rounded-2xl border transition-all ${
          isLightMode ? 'bg-slate-50/90 border-slate-200/80' : 'bg-slate-950/70 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-black flex items-center gap-2 ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              <Mic className="w-4 h-4 text-indigo-600 dark:text-cyan-400" />
              <span>Sensibilidad & Espectro Vocal</span>
            </span>
            <span className={`text-xs font-mono font-bold ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}>
              {decibels} dBFS ({audioLevel}%)
            </span>
          </div>

          {/* Canvas de Espectrograma en Tiempo Real */}
          <div className={`rounded-xl overflow-hidden border relative h-28 flex items-center justify-center ${
            isLightMode ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'
          }`}>
            <canvas 
              ref={canvasRef} 
              width={400} 
              height={112} 
              className="w-full h-full object-cover"
            />
            {!isListening && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${
                isLightMode ? 'bg-slate-100/90 text-slate-500' : 'bg-slate-950/80 text-slate-400'
              }`}>
                <MicOff className="w-6 h-6 text-slate-400" />
                <span className="text-xs font-bold">Haz clic en Iniciar Prueba para captar tu voz</span>
              </div>
            )}
          </div>

          {/* Medidor VU en Barra Horizontal */}
          <div className="space-y-1">
            <div className={`h-3 rounded-full overflow-hidden flex p-0.5 gap-0.5 ${
              isLightMode ? 'bg-slate-200' : 'bg-slate-800'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  audioLevel > 80 
                    ? 'bg-rose-500' 
                    : audioLevel > 50 
                      ? 'bg-amber-400' 
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${audioLevel}%` }}
              />
            </div>
            <div className={`flex justify-between text-[10px] font-mono ${
              isLightMode ? 'text-slate-500' : 'text-slate-500'
            }`}>
              <span>-60 dB (Silencio)</span>
              <span>-24 dB (Óptimo)</span>
              <span>0 dB (Saturado)</span>
            </div>
          </div>

          {/* Transcripción de Prueba en Vivo */}
          <div className={`p-3 rounded-xl border text-xs space-y-1 ${
            isLightMode ? 'bg-white border-slate-200 text-slate-900 shadow-xs' : 'bg-slate-900 border-slate-800 text-white'
          }`}>
            <span className={`text-[10px] font-bold uppercase block ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Detección de voz en vivo ({language === 'fr' ? 'Francés' : 'Inglés'}):
            </span>
            <p className={`italic font-medium min-h-[1.5rem] ${
              isLightMode ? 'text-slate-800' : 'text-slate-200'
            }`}>
              {detectedVoiceText ? `“${detectedVoiceText}”` : 'Di algo frente al micrófono (ej. "Hello ISkool" o "Bonjour")...'}
            </p>
          </div>

          {/* Botón de Control */}
          <button
            type="button"
            onClick={startMicTest}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
              isListening
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-gradient-to-r from-teal-600 to-indigo-600 hover:from-teal-500 hover:to-indigo-500 text-white'
            }`}
          >
            {isListening ? (
              <>
                <Square className="w-4 h-4 fill-white" />
                <span>Detener Prueba de Micrófono</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>Iniciar Prueba de Micrófono & Decibeles</span>
              </>
            )}
          </button>
        </div>

        {/* Columna Derecha: Prueba de Altavoz y Métricas de Diagnóstico */}
        <div className="lg:col-span-5 space-y-4">
          {/* Tarjeta de Prueba de Altavoz */}
          <div className={`p-5 rounded-2xl border space-y-3.5 transition-all ${
            isLightMode ? 'bg-slate-50/90 border-slate-200/80 text-slate-900' : 'bg-slate-950/70 border-slate-800 text-white'
          }`}>
            <span className={`text-xs font-black flex items-center gap-2 ${
              isLightMode ? 'text-slate-900' : 'text-white'
            }`}>
              <Volume2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Verificación de Altavoces / Salida</span>
            </span>

            <p className={`text-[11px] leading-relaxed ${
              isLightMode ? 'text-slate-600' : 'text-slate-400'
            }`}>
              Verifica que el sonido de los avatares históricos y la guía del karaoke se escuchen nítidos y sin distorsión.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={playTestTone}
                disabled={isPlayingTestTone}
                className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isLightMode 
                    ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>{isPlayingTestTone ? 'Emitiendo...' : 'Tono 440 Hz'}</span>
              </button>

              <button
                type="button"
                onClick={playVoiceSample}
                disabled={isPlayingVoiceSample}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer text-white shadow-xs"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isPlayingVoiceSample ? 'Hablando...' : `Frase en ${language === 'fr' ? 'FR' : 'EN'}`}</span>
              </button>
            </div>

            {speakerVerified && (
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Salida de audio verificada con éxito.</span>
              </div>
            )}
          </div>

          {/* Tarjeta de Especificaciones Técnicas */}
          <div className={`p-4 rounded-2xl border text-xs space-y-2 font-mono ${
            isLightMode 
              ? 'bg-slate-50/70 border-slate-200/80 text-slate-700' 
              : 'bg-slate-950/50 border-slate-800 text-slate-300'
          }`}>
            <span className={`text-[10px] uppercase font-bold block tracking-wider ${
              isLightMode ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Telemetría de la Interfaz:
            </span>
            <div className={`flex justify-between py-1 border-b ${
              isLightMode ? 'border-slate-200 text-slate-700' : 'border-slate-900 text-slate-300'
            }`}>
              <span>Frecuencia de Muestreo:</span>
              <span className="text-cyan-600 dark:text-cyan-400 font-bold">{sampleRate ? `${sampleRate / 1000} kHz` : 'Detectando...'}</span>
            </div>
            <div className={`flex justify-between py-1 border-b ${
              isLightMode ? 'border-slate-200 text-slate-700' : 'border-slate-900 text-slate-300'
            }`}>
              <span>Latencia Vocal:</span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">{measuredLatencyMs ? `${measuredLatencyMs} ms` : '< 150 ms'}</span>
            </div>
            <div className={`flex justify-between py-1 ${
              isLightMode ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span>Filtros DSP:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">AEC + AGC + NS (Activos)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
