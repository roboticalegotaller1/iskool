"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ElementalPetRace, PetEvolutionStage } from '@/types';
import { PetSvgRenderer } from './PetSvgRenderer';
import { resolvePetRace, LIVING_IDLE_ACTIONS, EVOLUTION_STAGE_CONFIG, IdleActionDefinition } from './types';
import { getPetToAvatarScaleRatio, getPetScaleRatioDescription } from '@/utils/petScaleHelper';
import { Sparkles, Heart, Flame, Shield, ArrowUpCircle } from 'lucide-react';

interface FloatingHeart {
  id: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  opacity: number;
}

interface LivingCompanionEngineProps {
  raceId?: ElementalPetRace | string;
  stage?: PetEvolutionStage;
  petName?: string;
  happiness?: number;
  hunger?: number;
  friendshipExp?: number;
  tasksCompleted?: number;
  onPetTouch?: () => void;
  onOpenSanctuary?: () => void;
  onTriggerHatch?: () => void;
  onEvolveStage?: () => void;
  className?: string;
  avatarHeight?: number;
}

export const LivingCompanionEngine: React.FC<LivingCompanionEngineProps> = ({
  raceId = 'cryo_dragon',
  stage = 'egg',
  petName = 'Compañero',
  happiness = 85,
  friendshipExp = 120,
  tasksCompleted = 0,
  onPetTouch,
  onOpenSanctuary,
  onTriggerHatch,
  onEvolveStage,
  className = '',
  avatarHeight = 180
}) => {
  const meta = resolvePetRace(raceId);
  const stageConfig = EVOLUTION_STAGE_CONFIG[stage] || EVOLUTION_STAGE_CONFIG.egg;
  const isEgg = stage === 'egg';

  // Estados de animación viva y acciones aleatorias
  const [currentAction, setCurrentAction] = useState<IdleActionDefinition | null>(null);
  const [isPetting, setIsPetting] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<FloatingHeart[]>([]);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const petTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextActionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. MOTOR PROCEDIMENTAL DE ESPERA VIVA (32 Acciones Aleatorias)
  const scheduleNextAction = useCallback(() => {
    if (isEgg || isPetting) return;

    // Intervalo aleatorio entre 3.5 y 7 segundos
    const delay = Math.floor(Math.random() * 3500) + 3500;

    nextActionTimerRef.current = setTimeout(() => {
      // Elegir aleatoriamente una de las 32 conductas
      const randomIndex = Math.floor(Math.random() * LIVING_IDLE_ACTIONS.length);
      const chosenAction = LIVING_IDLE_ACTIONS[randomIndex];
      setCurrentAction(chosenAction);

      // Revertir a reposo al concluir la duración de la acción
      setTimeout(() => {
        setCurrentAction(null);
        scheduleNextAction();
      }, chosenAction.durationMs);
    }, delay);
  }, [isEgg, isPetting]);

  useEffect(() => {
    scheduleNextAction();
    return () => {
      if (nextActionTimerRef.current) clearTimeout(nextActionTimerRef.current);
    };
  }, [scheduleNextAction]);

  // 2. SISTEMA INTERACTIVO DE CARICIAS (Inspiración Pokémon GO)
  const handlePointerInteraction = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCursorPos({ x, y });
    setIsPetting(true);

    // Notificar callback externo para sumar puntos de amistad
    if (onPetTouch) onPetTouch();

    // Spawn de corazón flotante ascendente
    const newHeart: FloatingHeart = {
      id: Date.now() + Math.random(),
      x: x + (Math.random() * 20 - 10),
      y: y - 10,
      scale: Math.random() * 0.4 + 0.8,
      rotation: Math.random() * 40 - 20,
      opacity: 1
    };

    setFloatingHearts(prev => [...prev.slice(-12), newHeart]);

    // Resetear temporizador de caricia
    if (petTimeoutRef.current) clearTimeout(petTimeoutRef.current);
    petTimeoutRef.current = setTimeout(() => {
      setIsPetting(false);
    }, 900);
  };

  // Limpieza gradual de corazones flotantes
  useEffect(() => {
    if (floatingHearts.length === 0) return;
    const interval = setInterval(() => {
      setFloatingHearts(prev =>
        prev
          .map(h => ({ ...h, y: h.y - 3, opacity: h.opacity - 0.05 }))
          .filter(h => h.opacity > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [floatingHearts]);

  // Transformaciones dinámicas CSS según la acción activa
  const getActionTransformClass = () => {
    if (isPetting) return 'scale-105 -translate-y-1';
    if (!currentAction) return 'hover:scale-102';

    switch (currentAction.id) {
      case 'head_tilt_left':
        return '-rotate-6 translate-y-0.5';
      case 'head_tilt_right':
        return 'rotate-6 translate-y-0.5';
      case 'drop_to_ground':
        return 'translate-y-3 scale-y-90 scale-x-105';
      case 'joy_bounce':
        return '-translate-y-4 scale-110';
      case 'stretch':
        return 'scale-x-110 scale-y-95';
      case 'yawn':
        return 'scale-105';
      case 'arch_back':
        return '-translate-y-2 scale-y-108';
      case 'float_hover':
        return '-translate-y-3.5';
      case 'tail_chase':
        return 'rotate-12 translate-x-1';
      case 'dance_step':
        return 'translate-x-2 -rotate-3';
      case 'startle_wake':
        return '-translate-y-2 scale-108';
      default:
        return '';
    }
  };

  // Cálculo de progreso para siguiente evolución
  const nextStageTasks = 
    stage === 'egg' ? 1 : 
    stage === 'baby' ? 3 : 
    stage === 'child' ? 10 : 
    stage === 'teen' ? 25 : 50;

  const isReadyToEvolve = !isEgg && tasksCompleted >= nextStageTasks && stage !== 'adult' && stage !== 'mystic';

  const scaleRatio = getPetToAvatarScaleRatio(stage);
  const ratioDescription = getPetScaleRatioDescription(stage);
  const petPixelHeight = Math.round(avatarHeight * scaleRatio);
  const petPixelWidth = Math.round(petPixelHeight * 0.95);

  return (
    <div
      className={`relative flex flex-col items-center select-none ${className}`}
      ref={containerRef}
    >
      {/* Contenedor Visual de la Mascota con Efectos Táctiles y Contorno Neón */}
      <div
        onPointerDown={handlePointerInteraction}
        onPointerMove={(e) => {
          if (e.buttons === 1) handlePointerInteraction(e);
        }}
        className="relative flex items-end justify-center cursor-pointer transition-all duration-300 group touch-none pb-2 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-cyan-500/30 shadow-xl"
        style={{ 
          height: `${Math.max(140, Math.min(252, Math.round(petPixelHeight * 1.35)))}px`, 
          width: `${Math.max(160, petPixelWidth + 40)}px` 
        }}
        title={`¡Haz clic o desliza suavemente sobre tu compañero para acariciarlo! (Escala: ${ratioDescription})`}
      >
        {/* Sutil resplandor de fondo ambiental */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.15)_0%,rgba(236,72,153,0.1)_50%,transparent_80%)] pointer-events-none" />

        {/* Glow elemental circundante adaptativo al tamaño de la mascota */}
        <div
          className="absolute rounded-full filter blur-xl transition-all duration-500 opacity-60 group-hover:opacity-90 pointer-events-none"
          style={{ 
            backgroundColor: meta.glowColor,
            width: `${Math.max(80, petPixelWidth * 1.35)}px`,
            height: `${Math.max(80, petPixelHeight * 1.35)}px`,
            bottom: '8px'
          }}
        />

        {/* Sombra base en el suelo */}
        <div 
          className="absolute bottom-1.5 bg-black/35 rounded-full blur-[2px] pointer-events-none transition-all duration-300"
          style={{
            width: `${Math.max(36, petPixelWidth * 0.85)}px`,
            height: `${Math.max(8, petPixelHeight * 0.12)}px`
          }}
        />

        {/* Burbuja de Pensamiento / Reacción Viva (Idle Thought) completamente contenida dentro del recuadro */}
        {currentAction?.thoughtBubble && !isPetting && !isEgg && (
          <div className="absolute top-2.5 right-2.5 z-20 px-3 py-1.5 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-700/90 text-[11px] font-black shadow-xl animate-in zoom-in-75 fade-in duration-200 text-slate-800 dark:text-slate-100 flex items-center gap-1.5 backdrop-blur-sm pointer-events-none select-none">
            <span>{currentAction.thoughtBubble}</span>
          </div>
        )}

        {/* Indicador táctil de Caricia activa centrado en el margen superior interior */}
        {isPetting && (
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full bg-rose-500 text-white text-[10px] font-black shadow-lg animate-bounce flex items-center gap-1 pointer-events-none select-none">
            <Heart className="h-3 w-3 fill-current" />
            <span>¡Le encanta! +Amistad</span>
          </div>
        )}

        {/* SVG Renderizador con Escala Proporcional Estricta y Contorno Neón Pegado a la Silueta */}
        <div
          className={`relative z-10 transform transition-transform duration-300 ease-out will-change-transform flex items-center justify-center neon-hero-contour ${getActionTransformClass()}`}
          style={{ 
            width: `${petPixelWidth}px`,
            height: `${petPixelHeight}px`,
            transformOrigin: 'bottom center' 
          }}
        >
          <PetSvgRenderer
            raceId={meta.id}
            stage={stage}
            actionId={currentAction?.id || (isPetting ? 'pout' : 'idle')}
            isPetting={isPetting}
          />
        </div>

        {/* Corazones Flotantes (Pokémon GO Petting Effect) */}
        {floatingHearts.map(heart => (
          <div
            key={heart.id}
            className="absolute pointer-events-none z-30 transition-opacity text-rose-500 drop-shadow-md"
            style={{
              left: `${heart.x}px`,
              top: `${heart.y}px`,
              transform: `scale(${heart.scale}) rotate(${heart.rotation}deg)`,
              opacity: heart.opacity
            }}
          >
            <Heart className="h-5 w-5 fill-current" />
          </div>
        ))}
      </div>

      {/* Barra de Información, Vínculo y Estado Evolutivo */}
      <div className="w-full max-w-[285px] mt-2 px-3 py-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-1.5">
        {/* Cabecera de Mascota */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-base">{meta.badgeEmoji}</span>
            <span className="font-black text-xs text-slate-900 dark:text-white truncate">
              {isEgg ? 'Huevo Primordial' : petName}
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white shrink-0" style={{ backgroundColor: meta.secondaryColor }}>
              {meta.element}
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {stageConfig.label}
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300" title={`Proporción oficial: ${ratioDescription}`}>
              {stage === 'egg' ? '1/5' : stage === 'baby' ? '1/4' : stage === 'child' ? '1/2' : stage === 'teen' ? '2/3' : '1:1'}
            </span>
          </div>
        </div>

        {/* Barra de Felicidad / Amistad */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3 text-rose-500 fill-current" />
              Amistad: {happiness}%
            </span>
            <span>EXP Vínculo: {friendshipExp} pts</span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-rose-500 to-pink-500"
              style={{ width: `${Math.min(100, happiness)}%` }}
            />
          </div>
        </div>

        {/* Estado Evolutivo y Acción Rápida */}
        {isEgg ? (
          <div className="pt-1 flex items-center justify-between gap-2">
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
              🐣 <strong>Nacerá</strong> cuando entregues tu <strong>primera tarea</strong>.
            </p>
            {onTriggerHatch && (
              <button
                type="button"
                onClick={onTriggerHatch}
                className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-[10px] shadow-sm transition-transform active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="h-3 w-3" />
                <span>Eclosionar</span>
              </button>
            )}
          </div>
        ) : isReadyToEvolve ? (
          <div className="pt-1 flex items-center justify-between gap-2 bg-emerald-50 dark:bg-emerald-950/40 p-2 rounded-xl border border-emerald-300 dark:border-emerald-800">
            <div className="text-[10px] text-emerald-800 dark:text-emerald-300 font-bold leading-tight">
              ✨ ¡Cumpliste las tareas requeridas para evolucionar!
            </div>
            {onEvolveStage && (
              <button
                type="button"
                onClick={onEvolveStage}
                className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] shadow-sm transition-transform active:scale-95 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <ArrowUpCircle className="h-3.5 w-3.5" />
                <span>Evolucionar</span>
              </button>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>Tareas: {tasksCompleted}/{nextStageTasks} para siguiente fase</span>
            {onOpenSanctuary && (
              <button
                type="button"
                onClick={onOpenSanctuary}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Ver Santuario →
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
