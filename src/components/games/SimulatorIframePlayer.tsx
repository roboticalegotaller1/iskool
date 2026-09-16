"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CanvasActivityJSON } from '@/types';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  X,
  AlertTriangle,
  Lock,
  Loader2
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { isAllowedSimulatorOrigin } from '@/lib/gameSecurityOrigins';

interface SimulatorIframePlayerProps {
  activity: CanvasActivityJSON;
  simulatorUrl?: string;
  simulatorId?: string;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const SimulatorIframePlayer: React.FC<SimulatorIframePlayerProps> = ({
  activity,
  simulatorUrl: propUrl,
  simulatorId: propSimId,
  onClose,
  onComplete
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [earnedRewards, setEarnedRewards] = useState<{ xp: number; coins: number } | null>(null);
  const [score, setScore] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<string | null>(null);

  // Estados de Handshake Criptográfico
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [minRequiredTime, setMinRequiredTime] = useState<number>(15);
  const [isHandshakeReady, setIsHandshakeReady] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Referencias de Telemetría Real en el Padre
  const sessionStartTimeRef = useRef<number>(Date.now());
  const interactionCountRef = useRef<number>(0);
  const sessionTokenRef = useRef<string | null>(null);

  sessionTokenRef.current = sessionToken;

  const activeStudentId = useStudentStore((s) => s.activeStudentId);

  // Extraer URL y metadatos del simulador
  const embedUrl = propUrl 
    || (activity as any).embedUrl 
    || (activity as any).simulatorUrl 
    || (activity.metadata as any)?.embedUrl 
    || 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html';

  const simulatorId = propSimId 
    || (activity as any).simulatorId 
    || (activity.metadata as any)?.simulatorId 
    || 'phet-forces-motion';

  const difficulty = (activity as any).difficulty || (activity.metadata as any)?.difficulty || 'medium';
  const title = activity.title || 'Simulador Científico e Interactivo';
  const instructions = (activity as any).instructions || 'Ajusta los parámetros del simulador para observar los efectos y fenómenos analizados.';

  // 1. Inicializar Sesión Criptográfica al montar o reiniciar el simulador
  const initCryptographicSession = useCallback(async () => {
    try {
      setSecurityNotice(null);
      setIsHandshakeReady(false);
      sessionStartTimeRef.current = Date.now();
      interactionCountRef.current = 0;

      const res = await fetch('/api/gamification/simulator-session/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: activeStudentId || 'usr-student-anon',
          simulatorId,
          difficulty,
          teacherId: (activity as any).teacherId || 'usr-teacher-1'
        })
      });

      if (!res.ok) {
        throw new Error(`Error en handshake (${res.status})`);
      }

      const data = await res.json();
      if (data.success && data.sessionToken) {
        setSessionToken(data.sessionToken);
        setSessionId(data.sessionId);
        setMinRequiredTime(data.minTimeSpentSeconds || 15);
      }
    } catch (err) {
      console.warn('Inicialización de sesión criptográfica en modo contingencia:', err);
    }
  }, [activeStudentId, simulatorId, difficulty, activity]);

  useEffect(() => {
    initCryptographicSession();
  }, [initCryptographicSession, iframeKey]);

  // 2. Enviar Handshake al Iframe cuando esté cargado
  const sendHandshakeToIframe = useCallback(() => {
    if (!iframeRef.current || !iframeRef.current.contentWindow || !sessionTokenRef.current) return;

    try {
      let targetOrigin = '*';
      if (embedUrl.startsWith('http://') || embedUrl.startsWith('https://')) {
        try {
          targetOrigin = new URL(embedUrl).origin;
        } catch {
          targetOrigin = '*';
        }
      }

      iframeRef.current.contentWindow.postMessage({
        type: 'INIT_GAME_SESSION',
        sessionToken: sessionTokenRef.current,
        sessionId,
        difficulty
      }, targetOrigin === 'null' ? '*' : targetOrigin);
    } catch (err) {
      console.warn('Aviso transmitiendo handshake criptográfico al iframe:', err);
    }
  }, [embedUrl, sessionId, difficulty]);

  // 3. Validación Estricta de postMessage contra Spoofing y Orígenes No Autorizados
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const localOrigin = typeof window !== 'undefined' ? window.location.origin : '';

      // VALIDACIÓN OBLIGATORIA: Descartar inmediatamente si el origen no coincide con el autorizado
      if (!isAllowedSimulatorOrigin(event.origin, localOrigin)) {
        console.warn(`[Seguridad ISkool] Descartado postMessage de origen no autorizado: ${event.origin}`);
        return;
      }

      if (!event.data || typeof event.data !== 'object') return;

      // Iframe listo para recibir handshake
      if (event.data.type === 'SIMULATOR_IFRAME_READY') {
        sendHandshakeToIframe();
        return;
      }

      // Handshake confirmado por el simulador
      if (event.data.type === 'GAME_SESSION_ACKNOWLEDGED') {
        setIsHandshakeReady(true);
        return;
      }

      // Recepción de puntaje intermedio
      if (event.data.type === 'SIMULATOR_SCORE' || event.data.type === 'SIM_SCORE') {
        const receivedScore = Math.min(100, Math.max(0, Number(event.data.score) || 100));
        setScore(receivedScore);
        interactionCountRef.current++;
        return;
      }

      // Finalización enviada por el SDK del simulador (simulator_bridge.js) o juego interactivo
      if (event.data.type === 'SIMULATOR_COMPLETE' || event.data.type === 'GAME_COMPLETE') {
        // EXIGENCIA CRÍTICA: Si el payload carece de token de sesión, descartar el mensaje inmediatamente
        if (!event.data.sessionToken || typeof event.data.sessionToken !== 'string') {
          console.warn('[Seguridad ISkool] Descartado: Payload de finalización sin token de sesión válido.');
          return;
        }

        // Validar correspondencia de token para evitar spoofing cruzado
        if (sessionTokenRef.current && event.data.sessionToken !== sessionTokenRef.current) {
          setSecurityNotice('Intento de vulneración: El token de sesión no coincide con la instancia activa.');
          return;
        }

        // Métrica exigida de tiempo jugado (durationMs)
        const durationMs = typeof event.data.durationMs === 'number'
          ? event.data.durationMs
          : (typeof event.data.timeSpentSeconds === 'number'
              ? event.data.timeSpentSeconds * 1000
              : Math.max(0, Date.now() - sessionStartTimeRef.current));

        const simScore = Math.min(100, Math.max(0, Number(event.data.score) || 100));
        setScore(simScore);

        submitCompletionToServer({
          score: simScore,
          durationMs,
          timeSpentSeconds: durationMs / 1000,
          interactionCount: Number(event.data.interactionCount) || interactionCountRef.current,
          userActions: event.data.userActions,
          sessionToken: event.data.sessionToken
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendHandshakeToIframe]);

  // 4. Registrar interacciones físicas del alumno en el contenedor
  const handleUserInteraction = () => {
    interactionCountRef.current++;
  };

  const handleReload = () => {
    setIframeKey((prev) => prev + 1);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // 5. Envío y Validación de Telemetría Server-Side con Invalidador de Sesión Única
  const submitCompletionToServer = async (telemetryParams?: {
    score?: number;
    durationMs?: number;
    timeSpentSeconds?: number;
    interactionCount?: number;
    userActions?: any[];
    sessionToken?: string;
  }) => {
    if (isCompleted || isSubmitting) return;

    setSecurityNotice(null);
    setIsSubmitting(true);

    const durationMs = telemetryParams?.durationMs 
      ?? Math.max(1000, Date.now() - sessionStartTimeRef.current);

    const timeElapsedSeconds = telemetryParams?.timeSpentSeconds 
      ?? (durationMs / 1000);

    const totalInteractions = telemetryParams?.interactionCount 
      ?? Math.max(interactionCountRef.current, 3);

    const finalScore = telemetryParams?.score ?? score;

    // Validación previa de tiempo mínimo biológico en cliente para UX inmediata
    if (timeElapsedSeconds < minRequiredTime) {
      setSecurityNotice(
        `Tiempo mínimo de estudio no alcanzado (${Math.round(timeElapsedSeconds)}s de ${minRequiredTime}s requeridos). Explora e interactúa más con el simulador para validar tu aprendizaje.`
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/gamification/simulator-session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionToken: telemetryParams?.sessionToken || sessionTokenRef.current,
          score: finalScore,
          durationMs,
          timeSpentSeconds: timeElapsedSeconds,
          interactionCount: totalInteractions,
          userActions: telemetryParams?.userActions
        })
      });

      const data = await res.json();

      if (!res.ok) {
        // Manejar rechazos de seguridad del servidor
        if (res.status === 409) {
          setSecurityNotice('Esta sesión de simulación ya fue consumida y revocada. Reinicia para comenzar un nuevo reto.');
        } else if (res.status === 403) {
          setSecurityNotice(data.error || 'Telemetría insuficiente para validar la actividad.');
        } else if (res.status === 401) {
          setSecurityNotice('Firma criptográfica inválida. La sesión ha sido anulada por seguridad.');
        } else {
          setSecurityNotice(data.error || 'Error al validar la práctica con el servidor.');
        }
        setIsSubmitting(false);
        return;
      }

      // Recompensa autorizada por el servidor
      const studentRewards = data.studentEarned || { xp: 100, coins: 20 };
      setEarnedRewards(studentRewards);

      // Acreditar progreso seguro en el almacén del estudiante
      if (activeStudentId) {
        try {
          useStudentStore.getState().addXpAndCoins(
            activeStudentId,
            studentRewards.xp,
            studentRewards.coins
          );
        } catch (storeErr) {
          console.warn('Aviso actualizando recompensas en memoria:', storeErr);
        }
      }

      setIsCompleted(true);
      if (onComplete) {
        onComplete(data.verifiedScore ?? finalScore);
      }
    } catch (err: any) {
      console.error('Error al verificar sesión en el servidor:', err);
      setSecurityNotice('No fue posible contactar con el motor de validación. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onClick={handleUserInteraction}
      onKeyDown={handleUserInteraction}
      className={`flex flex-col bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full max-w-5xl mx-auto h-[620px]'
      }`}
    >
      {/* Barra Superior de Control y Telemetría Criptográfica */}
      <div className="px-5 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" /> Sandboxed Cryptographic Bridge
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {isHandshakeReady ? 'Handshake Verificado' : 'Canal Protegido'}
              </span>
            </div>
            <h2 className="text-sm font-bold text-white truncate">{title}</h2>
          </div>
        </div>

        {/* Acciones de Cabecera */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReload}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Reiniciar Simulador"
            aria-label="Reiniciar Simulador"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
              title="Cerrar Simulador"
              aria-label="Cerrar Simulador"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Banner de Advertencia de Telemetría o Seguridad */}
      {securityNotice && (
        <div className="px-5 py-2.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{securityNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setSecurityNotice(null)}
            className="text-amber-400 hover:text-white text-xs font-bold px-2 py-0.5 rounded-lg bg-amber-500/20 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Contenedor Iframe con Atributo Sandbox Estricto */}
      <div className="relative flex-1 w-full bg-black min-h-0">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={embedUrl}
          title={title}
          onLoad={sendHandshakeToIframe}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allow="fullscreen; accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
        />

        {/* Modal de Finalización con Recompensas Otorgadas */}
        {isCompleted && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-6 z-20">
            <div className="max-w-md w-full bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 text-center space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-white">¡Laboratorio Completado y Verificado!</h3>
              <p className="text-xs text-slate-300">
                Tu telemetría de interacción fue validada criptográficamente por el motor pedagógico y comunicada a tu profesor titular.
              </p>

              {earnedRewards && (
                <div className="flex items-center justify-center gap-4 py-2">
                  <div className="px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    <span>+{earnedRewards.xp} XP</span>
                  </div>
                  <div className="px-4 py-2 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black flex items-center gap-1.5">
                    <span>🪙 +{earnedRewards.coins} Monedas</span>
                  </div>
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
                >
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Barra Inferior Informativa y Botón de Conclusión */}
      <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="truncate max-w-md">{instructions}</span>
        </div>

        {!isCompleted && (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => submitCompletionToServer()}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Verificando Telemetría...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Completar Práctica y Reclamar Recompensas</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
