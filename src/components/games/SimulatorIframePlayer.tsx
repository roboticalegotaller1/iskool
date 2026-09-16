"use client";

import React, { useState, useEffect, useRef } from 'react';
import { CanvasActivityJSON } from '@/types';
import { 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Award, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ExternalLink, 
  HelpCircle,
  X
} from 'lucide-react';
import { SimulatorGamificationAdapter } from '@/services/simulatorGamificationAdapter';
import { useStudentStore } from '@/store/useStudentStore';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const title = activity.title || 'Simulador Científico e Interactivo';
  const description = activity.description || 'Explora y experimenta con variables en tiempo real.';
  const instructions = (activity as any).instructions || 'Ajusta los parámetros del simulador para observar los efectos y fenómenos analizados.';

  // Escuchar mensajes postMessage seguros del simulador
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Filtrar mensajes no deseados
      if (!event.data || typeof event.data !== 'object') return;

      if (event.data.type === 'SIMULATOR_SCORE' || event.data.type === 'SIM_SCORE') {
        const receivedScore = Math.min(100, Math.max(0, Number(event.data.score) || 100));
        setScore(receivedScore);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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

  const handleFinishSimulation = async () => {
    if (isCompleted) return;

    try {
      const result = await SimulatorGamificationAdapter.handleCompletion({
        simulatorId,
        templateType: 'external_embed',
        category: 'physics',
        activityId: simulatorId,
        teacherId: (activity as any).teacherId || 'usr-teacher-1',
        studentId: activeStudentId,
        score,
        timeSpentSeconds: 120,
        metadata: { completedAt: new Date().toISOString() }
      });

      setEarnedRewards(result.studentEarned);
      setIsCompleted(true);

      if (onComplete) {
        onComplete(score);
      }
    } catch (err) {
      console.error('Error al registrar finalización del simulador:', err);
      setIsCompleted(true);
      if (onComplete) onComplete(score);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`flex flex-col bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full max-w-5xl mx-auto h-[620px]'
      }`}
    >
      {/* Barra Superior de Control y Telemetría */}
      <div className="px-5 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-black tracking-wider text-cyan-400">
                Sandboxed Simulator Environment
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Seguro
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
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Reiniciar Simulador"
            aria-label="Reiniciar Simulador"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
              title="Cerrar Simulador"
              aria-label="Cerrar Simulador"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Contenedor Iframe con Atributo Sandbox Estricto */}
      <div className="relative flex-1 w-full bg-black min-h-0">
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={embedUrl}
          title={title}
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
              <h3 className="text-xl font-black text-white">¡Laboratorio Completado!</h3>
              <p className="text-xs text-slate-300">
                Has experimentado exitosamente con la simulación interactiva. Tu progreso y telemetría fueron comunicados a tu profesor titular.
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
                  className="px-6 py-2.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-lg shadow-cyan-500/25"
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
            onClick={handleFinishSimulation}
            className="px-5 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completar Práctica y Reclamar Recompensas</span>
          </button>
        )}
      </div>
    </div>
  );
};
