"use client";

import React from 'react';
import { 
  Trophy, 
  Coins, 
  Lock, 
  CheckCircle2, 
  Sparkles, 
  Swords, 
  BookOpen, 
  Brain, 
  ArrowRight
} from 'lucide-react';
import { Quest } from '@/types';

interface QuestCardProps {
  quest: Quest;
  status: 'pending' | 'completed' | 'failed';
  isLocked?: boolean;
  requiredLevel?: number;
  index?: number;
  onSelect: (quest: Quest) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  quest,
  status,
  isLocked = false,
  requiredLevel,
  index = 0,
  onSelect
}) => {
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isBoss = quest.type === 'exam';
  const isReading = quest.type === 'reading' || quest.type === 'timed_reading';

  // Determinación de ícono y etiqueta de tipo de misión
  const getTypeBadge = () => {
    if (isBoss) {
      return {
        label: 'JEFE DE NIVEL',
        icon: Swords,
        color: 'text-rose-400 bg-rose-950/70 border-rose-500/40 shadow-rose-950/50'
      };
    }
    if (isReading) {
      return {
        label: 'PERGAMINO ANCESTRAL',
        icon: BookOpen,
        color: 'text-amber-300 bg-amber-950/70 border-amber-500/40 shadow-amber-950/50'
      };
    }
    if (quest.type === 'quiz') {
      return {
        label: 'DESAFÍO DEL SABIO',
        icon: Brain,
        color: 'text-cyan-300 bg-cyan-950/70 border-cyan-500/40 shadow-cyan-950/50'
      };
    }
    return {
      label: 'MISIÓN CURRICULAR',
      icon: Sparkles,
      color: 'text-indigo-300 bg-indigo-950/70 border-indigo-500/40 shadow-indigo-950/50'
    };
  };

  const typeInfo = getTypeBadge();
  const TypeIcon = typeInfo.icon;

  const campoFormativo = quest.campos_formativos?.[0] || 'Saberes y Pensamiento Científico';

  return (
    <div 
      className={`group relative overflow-hidden rounded-3xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 backdrop-blur-xl border ${
        isLocked
          ? 'bg-slate-950/40 border-slate-900 opacity-60 pointer-events-none'
          : isCompleted
            ? 'bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-emerald-950/30 border-emerald-500/30 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]'
            : isBoss
              ? 'bg-gradient-to-b from-slate-900/95 via-rose-950/20 to-slate-950/95 border-rose-500/40 hover:border-rose-500/80 hover:shadow-[0_0_35px_rgba(244,63,94,0.3)] hover:scale-[1.02]'
              : 'bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/95 border-slate-800 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] hover:scale-[1.02]'
      }`}
    >
      {/* Resplandor superior decorativo */}
      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${
        isBoss ? 'bg-rose-500/20 group-hover:opacity-100' : isCompleted ? 'bg-emerald-500/20 group-hover:opacity-100' : 'bg-amber-500/15 group-hover:opacity-100'
      }`} />

      {/* CABECERA: Badges y Estado */}
      <div className="relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Badge de Categoría */}
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${typeInfo.color}`}>
            <TypeIcon className="w-3.5 h-3.5 shrink-0" />
            <span>{typeInfo.label}</span>
          </span>

          {/* Badge de Estado */}
          {isCompleted ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-950/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Superada</span>
            </span>
          ) : isLocked ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-950/80 border border-rose-500/40 text-rose-400 shadow-sm">
              <Lock className="w-3 h-3 text-rose-400" />
              <span>Nv. {requiredLevel || quest.required_level || 1}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 border border-amber-400/40 text-amber-300 shadow-sm animate-pulse">
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Activa</span>
            </span>
          )}
        </div>

        {/* TÍTULO Y DESCRIPCIÓN */}
        <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
          {quest.title}
        </h3>

        <p className="text-xs sm:text-sm text-slate-300/80 mt-2 line-clamp-2 font-medium leading-relaxed">
          {quest.description || 'Supera este reto pedagógico en el Entorno Inmersivo para incrementar tus habilidades académicas.'}
        </p>

        {/* Campo Formativo / Eje NEM */}
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
          <span className="truncate">{campoFormativo}</span>
        </div>
      </div>

      {/* ZONA CENTRAL: RECOMPENSA GIGANTE PROMETIDA */}
      <div className="relative z-10 my-4 p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-indigo-500/15 border border-amber-400/30 flex items-center justify-around shadow-inner backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-xl shrink-0 shadow-xs">
            🏆
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black tracking-widest text-amber-200/75 uppercase">XP Recompensa</span>
            <span className="text-base sm:text-lg font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
              +{quest.xp_reward || 50} XP
            </span>
          </div>
        </div>

        <div className="h-8 w-px bg-amber-500/25" />

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/20 border border-yellow-400/40 flex items-center justify-center text-xl shrink-0 shadow-xs">
            🪙
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[9px] font-black tracking-widest text-yellow-200/75 uppercase">Monedas</span>
            <span className="text-base sm:text-lg font-black text-yellow-300 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
              +{quest.coins_reward || 25} Oro
            </span>
          </div>
        </div>
      </div>

      {/* PIE: BOTÓN DE ACCIÓN RPG */}
      <div className="relative z-10 pt-2 border-t border-slate-800/80">
        {isLocked ? (
          <button
            type="button"
            disabled
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Lock className="w-4 h-4" />
            <span>Requiere Nivel {requiredLevel || quest.required_level || 1}</span>
          </button>
        ) : isCompleted ? (
          <button
            type="button"
            onClick={() => onSelect(quest)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700/60 text-slate-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-emerald-400/40 active:scale-98"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Repasar Misión ↺</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSelect(quest)}
            className={`w-full py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-lg ${
              isBoss
                ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-900/50 border border-rose-400/40 hover:shadow-rose-600/40'
                : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-amber-950/40 border border-amber-300/60 hover:shadow-amber-500/40'
            }`}
          >
            <span>{isBoss ? 'Desafiar Jefe ⚔️' : 'Comenzar Misión ⚔️'}</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>
    </div>
  );
};
