'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Database,
  ShieldCheck,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  AlertTriangle,
  RotateCcw,
  BarChart3,
  Cpu
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'isomorphic-dompurify';
import { useIsSuperUser } from '@/hooks/useIsSuperUser';
import { normalizeLatinHistoricalPhonetics } from '@/lib/historicalVoiceEngine';

// ----------------------------------------------------------------------------
// TIPOS DE ESTADO Y TELEMETRÍA
// ----------------------------------------------------------------------------

export type OracleProcessState =
  | 'idle'
  | 'searching_cache'
  | 'computing_antigravity'
  | 'streaming_voice'
  | 'completed'
  | 'error';

export interface PerformanceTelemetry {
  latencyMs: number;
  tokensConsumed: number;
  origin: 'CACHE_HIT' | 'LIVE_FORENSIC' | 'INITIAL';
  similarity?: number;
}

export interface ExecutiveOracleResponse {
  success: boolean;
  cache_hit: boolean;
  tokens_consumed: number;
  similarity?: number;
  voice_payload: string;
  forensic_display: string;
  execution_time_ms: number;
  error?: string;
}

// Consultas rápidas recomendadas para el directivo
const PRESET_EXECUTIVE_QUERIES = [
  '¿Cuál es la nómina de mis 2 planteles con más alumnos?',
  '¿Cuánto factura mi colegio más redituable vs el de menos matrícula?',
  'Muestra el estado de morosidad y cartera vencida del ciclo',
  'Audita la integridad financiera de Campus Montes'
];

export const ExecutiveOracleDashboard: React.FC = () => {
  const isSuperUser = useIsSuperUser();
  // 1. Estado reactivo del puesto de mando
  const [queryInput, setQueryInput] = useState('');
  const [processState, setProcessState] = useState<OracleProcessState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // 2. Telemetría y resultados analíticos
  const [telemetry, setTelemetry] = useState<PerformanceTelemetry>({
    latencyMs: 0,
    tokensConsumed: 0,
    origin: 'INITIAL'
  });

  const [activeVoiceText, setActiveVoiceText] = useState<string>('');
  const [forensicMarkdown, setForensicMarkdown] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Referencias para reconocimiento y síntesis de voz
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [, startTransition] = useTransition();

  // --------------------------------------------------------------------------
  // INICIALIZACIÓN DE WEB SPEECH RECOGNITION (MICRÓFONO)
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-MX';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQueryInput(transcript);
          setIsListening(false);
          // Envío automático al terminar de hablar
          handleDispatchQuery(transcript);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // --------------------------------------------------------------------------
  // SÍNTESIS DE VOZ EJECUTIVA (TTS FLUIDA)
  // --------------------------------------------------------------------------
  const speakVoicePayload = (text: string) => {
    if (isMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();

    const normalizedText = normalizeLatinHistoricalPhonetics(text);
    const utterance = new SpeechSynthesisUtterance(normalizedText);
    utterance.lang = 'es-MX';
    utterance.rate = 1.05; // Cadencia ejecutiva rápida
    utterance.pitch = 0.98;

    // Seleccionar voz en español de calidad si está disponible
    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.includes('es') && (v.name.includes('Mexico') || v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Sabina')));
    if (esVoice) {
      utterance.voice = esVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setProcessState('streaming_voice');
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setProcessState('completed');
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setProcessState('completed');
    };

    synthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const toggleMute = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    setIsMuted(prev => !prev);
  };

  // --------------------------------------------------------------------------
  // DESPACHO DE CONSULTA ANALÍTICA
  // --------------------------------------------------------------------------
  const handleDispatchQuery = async (queryToSubmit?: string) => {
    const q = (queryToSubmit || queryInput).trim();
    if (!q || processState === 'searching_cache' || processState === 'computing_antigravity') {
      return;
    }

    // Cancelar voz anterior
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    setErrorMessage(null);
    setProcessState('searching_cache');

    try {
      const res = await fetch('/api/oracle/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, stream_voice: true })
      });

      const data: ExecutiveOracleResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ocurrió un error al procesar el dictamen forense.');
      }

      startTransition(() => {
        setActiveVoiceText(data.voice_payload);
        setForensicMarkdown(data.forensic_display);
        setTelemetry({
          latencyMs: data.execution_time_ms,
          tokensConsumed: data.tokens_consumed,
          origin: data.cache_hit ? 'CACHE_HIT' : 'LIVE_FORENSIC',
          similarity: data.similarity
        });
      });

      // Síntesis de voz inmediata
      speakVoicePayload(data.voice_payload);
    } catch (err: unknown) {
      setProcessState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Error de comunicación con el oráculo.');
    }
  };

  const handleToggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('El reconocimiento de voz por navegador no está habilitado en este dispositivo.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setQueryInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Renderizador seguro de Markdown nativo
  const renderMarkdownContent = (md: string) => {
    const rawHtml = marked.parse(md, { async: false }) as string;
    const sanitizedHtml = DOMPurify.sanitize(rawHtml);
    return { __html: sanitizedHtml };
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 space-y-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl">
      {/* -------------------------------------------------------------------- */}
      {/* 1. ENCABEZADO EJECUTIVO & TELEMETRÍA EN VIVO                          */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/40">
            <Sparkles className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                iSkool Executive Oracle
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Antigravity Plus Core
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Puesto de Mando y Análisis Forense Institucional Multi-Plantel
            </p>
          </div>
        </div>

        {/* Badges de Telemetría Dinámica */}
        <div className="flex flex-wrap items-center gap-2.5">
          {telemetry.origin === 'CACHE_HIT' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 text-xs font-semibold shadow-inner">
              <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              <span>
                {isSuperUser 
                  ? `${telemetry.tokensConsumed || 0} Tokens · Caché Semántico en Tiempo Real` 
                  : 'Bóveda Curricular · Caché Semántico en Tiempo Real'}
              </span>
              {telemetry.similarity && (
                <span className="ml-1 opacity-75">({(telemetry.similarity * 100).toFixed(1)}%)</span>
              )}
            </div>
          )}

          {telemetry.origin === 'LIVE_FORENSIC' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/70 border border-purple-500/40 text-purple-300 text-xs font-semibold shadow-inner">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              <span>Motor IA · Análisis Forense en Vivo</span>
            </div>
          )}

          {telemetry.latencyMs > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/60 text-slate-300 text-xs font-mono">
              ⚡ {telemetry.latencyMs}ms
            </div>
          )}

          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Activar voz' : 'Silenciar voz'}
            className={`p-2 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-950/50 border-rose-500/40 text-rose-400 hover:bg-rose-900/60'
                : 'bg-slate-900 border-slate-700/80 text-cyan-400 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 2. BARRA DE ENTRADA UNIFICADA (VOZ + TEXTO + PROMPTS RÁPIDOS)        */}
      {/* -------------------------------------------------------------------- */}
      <div className="space-y-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleDispatchQuery();
          }}
          className="relative flex items-center w-full"
        >
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder={
              isListening
                ? 'Escuchando tu comando de voz en tiempo real...'
                : 'Formula una consulta ejecutiva (ej: "¿Cuál es la nómina de mis 2 colegios más grandes?")...'
            }
            className={`w-full py-4 pl-5 pr-28 rounded-2xl bg-slate-900/90 border text-slate-100 placeholder-slate-500 text-sm sm:text-base focus:outline-none transition-all ${
              isListening
                ? 'border-rose-500 shadow-lg shadow-rose-950/50 ring-2 ring-rose-500/30'
                : 'border-slate-800 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20'
            }`}
          />

          <div className="absolute right-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              aria-label="Dictar por voz"
              className={`p-2.5 rounded-xl border transition-all ${
                isListening
                  ? 'bg-rose-600 border-rose-500 text-white animate-bounce'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <button
              type="submit"
              disabled={!queryInput.trim() || processState === 'searching_cache'}
              aria-label="Ejecutar consulta"
              className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 disabled:opacity-40 text-white shadow-md shadow-cyan-950/50 transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Sugerencias Rápidas */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-slate-500 font-medium">Consultas directivas:</span>
          {PRESET_EXECUTIVE_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setQueryInput(preset);
                handleDispatchQuery(preset);
              }}
              className="text-xs px-3 py-1 rounded-lg bg-slate-900/70 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* 3. RADAR DE ESTADO Y PROCESAMIENTO                                  */}
      {/* -------------------------------------------------------------------- */}
      {processState !== 'idle' && processState !== 'completed' && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 text-sm animate-pulse">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span>
            {processState === 'searching_cache' && 'Inspeccionando Almacén Vectorial en busca de caché semántica...'}
            {processState === 'computing_antigravity' && 'Ejecutando pipeline forense de agregación y cálculo multi-plantel...'}
            {processState === 'streaming_voice' && 'Sintetizando veredicto de audio y modulando salida dual...'}
          </span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-sm">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. SECCIÓN DUAL: AUDIO HIGHLIGHT & DESGLOSE FORENSE                  */}
      {/* -------------------------------------------------------------------- */}
      {forensicMarkdown && (
        <div className="space-y-6 pt-2">
          {/* Tarjeta de Salida Fonética (Voice Payload) */}
          {activeVoiceText && (
            <div className="relative p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/90 border border-cyan-500/30 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-cyan-400 uppercase">
                  <Volume2 className="w-4 h-4" />
                  <span>Dictamen de Voz Ejecutivo</span>
                </div>
                {isSpeaking && (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Reproduciendo audio
                  </span>
                )}
              </div>
              <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed">
                "{activeVoiceText}"
              </p>
            </div>
          )}

          {/* Reporte Forense en Pantalla con Tablas Markdown */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>Desglose Analítico en Pantalla</span>
              </div>
              <button
                onClick={() => handleDispatchQuery()}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Recalcular</span>
              </button>
            </div>

            {/* Inyección estilizada de tablas y Markdown */}
            <div
              className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed
                prose-headings:text-white prose-headings:font-bold prose-headings:mb-2
                prose-table:w-full prose-table:border-collapse prose-table:my-4
                prose-th:bg-slate-800/90 prose-th:text-slate-300 prose-th:p-3 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-slate-700
                prose-td:p-3 prose-td:border prose-td:border-slate-800/90 prose-td:font-mono prose-td:text-slate-300
                prose-strong:text-cyan-300"
              dangerouslySetInnerHTML={renderMarkdownContent(forensicMarkdown)}
            />
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 5. TARJETAS DE INDICADORES MAESTROS (PREVIEW PERMANENTE)              */}
      {/* -------------------------------------------------------------------- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Facturación Red</p>
            <p className="text-lg font-bold font-mono text-emerald-400">$5,000,000 MXN</p>
            <span className="text-[11px] text-slate-500">4 Planteles Activos</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/40 text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Matrícula Censo</p>
            <p className="text-lg font-bold font-mono text-cyan-400">3,740 Alumnos</p>
            <span className="text-[11px] text-slate-500">88.6% Capacidad Global</span>
          </div>
          <div className="p-3 rounded-xl bg-cyan-950/40 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Nómina Mensual</p>
            <p className="text-lg font-bold font-mono text-purple-400">$2,660,000 MXN</p>
            <span className="text-[11px] text-slate-500">215 Colaboradores</span>
          </div>
          <div className="p-3 rounded-xl bg-purple-950/40 text-purple-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Morosidad Global</p>
            <p className="text-lg font-bold font-mono text-rose-400">4.5% ($39,100)</p>
            <span className="text-[11px] text-slate-500">12 Tutores en Gestión</span>
          </div>
          <div className="p-3 rounded-xl bg-rose-950/40 text-rose-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveOracleDashboard;
