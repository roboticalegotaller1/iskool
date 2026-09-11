"use client";

import React, { useState } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar } from '@/store/useStudentStore';
import { 
  Flame, Coins, Heart, Sparkles, Dumbbell, Shield, Edit3, Check
} from 'lucide-react';
import { PetSvgRenderer } from './pet/PetSvgRenderer';

export function PetSanctuary() {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const feedPetRpg = useStudentStore(state => state.feedPetRpg);
  const trainPetRpg = useStudentStore(state => state.trainPetRpg);
  const changeAvatar = useStudentStore(state => state.changeAvatar);

  const rawStats = useCurrentStudentStats();
  const rawAvatar = useCurrentStudentAvatar();

  const defaultStats = {
    xp: 0,
    level: 1,
    coins: 0,
    pet_stage: 'egg' as const,
    pet_energy: 100,
    pet_happiness: 50
  };

  const defaultAvatar = {
    pet_type: 'dragon' as const,
    pet_name: 'Mascota',
    pet_outfit: 'none'
  };

  const stats = rawStats ? { ...defaultStats, ...rawStats } : defaultStats;
  const avatar = rawAvatar ? { ...defaultAvatar, ...rawAvatar } : defaultAvatar;

  const [isEditingName, setIsEditingName] = useState(false);
  const [petNameInput, setPetNameInput] = useState(avatar.pet_name || '');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const handleSaveName = async () => {
    if (petNameInput.trim()) {
      await changeAvatar({ pet_name: petNameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleFeed = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await feedPetRpg();
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTrain = async () => {
    if (isActionLoading) return;
    setIsActionLoading(true);
    try {
      await trainPetRpg();
    } finally {
      setIsActionLoading(false);
    }
  };

  // Renderizador SVG de la mascota según su tipo y etapa
  const renderPetVisual = () => {
    return (
      <PetSvgRenderer
        raceId={avatar.pet_type || 'cryo_dragon'}
        stage={stats.pet_stage || 'egg'}
        className="w-full h-full"
      />
    );
  };

  const getStageBadgeColor = () => {
    switch (stats.pet_stage) {
      case 'mystic': return 'from-teal-500 to-emerald-600 text-white shadow-teal-500/35 border-teal-400/40';
      case 'adult': return 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/35 border-emerald-400/40';
      case 'baby': return 'from-blue-500 to-cyan-600 text-white shadow-blue-500/35 border-blue-400/40';
      case 'egg':
      default: return 'from-amber-400 to-yellow-500 text-amber-950 shadow-amber-500/20 border-yellow-350/50';
    }
  };

  const getPetTitle = () => {
    const stage = stats.pet_stage || 'egg';
    if (stage === 'egg') return 'Huevo de Mascota';
    if (stage === 'baby') return 'Cría de Mascota';
    if (stage === 'adult') return 'Mascota Guardiana';
    if (stage === 'mystic') return 'Mascota Divina Mística';
    return 'Mascota de Batalla';
  };

  return (
    <div id="rpg-pet-sanctuary" className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-md shadow-2xl w-full lg:w-80 flex flex-col gap-5 relative overflow-hidden transition-all duration-300 hover:border-teal-500/40 shrink-0">
      
      {/* Glow para místico */}
      {stats.pet_stage === 'mystic' && (
        <div className="absolute -inset-10 bg-teal-500/5 blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Cabecera */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <Flame className={`h-4.5 w-4.5 ${stats.pet_stage === 'mystic' ? 'text-teal-400 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-xs font-black text-teal-300 uppercase tracking-widest font-serif">Santuario RPG</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm bg-gradient-to-r ${getStageBadgeColor()}`}>
          {stats.pet_stage || 'egg'}
        </span>
      </div>

      {/* Visualización de la Mascota */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        <div className={`h-28 w-28 flex items-center justify-center relative bg-teal-950/20 rounded-full border border-teal-500/10 p-3 overflow-hidden shadow-inner group transition-all duration-500 hover:scale-105 hover:bg-teal-950/30 ${stats.pet_stage === 'mystic' ? 'border-teal-500/30 shadow-[0_0_15px_rgba(45,212,191,0.15)]' : ''}`}>
          
          {/* Bobbing animation container */}
          <div className="w-full h-full animate-bounce" style={{ animationDuration: '3s' }}>
            {renderPetVisual()}
          </div>
          
          {stats.pet_stage === 'mystic' && (
            <div className="absolute inset-0 border border-teal-500/30 rounded-full animate-ping pointer-events-none opacity-20" />
          )}
        </div>

        {/* Editor de Nombre */}
        <div className="flex items-center gap-1.5 min-h-[28px]">
          {isEditingName ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={petNameInput}
                onChange={(e) => setPetNameInput(e.target.value)}
                maxLength={14}
                aria-label="Editar nombre de la mascota"
                className="bg-zinc-900 border border-teal-500/40 text-xs px-2 py-0.5 rounded text-white font-bold focus:outline-none focus:border-teal-400 w-28"
              />
              <button 
                type="button"
                onClick={handleSaveName}
                aria-label="Guardar nuevo nombre de la mascota"
                className="p-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs flex items-center justify-center cursor-pointer font-bold"
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <>
              <span className="text-xs font-black text-zinc-100">{avatar.pet_name || 'Compañero'}</span>
              <button
                type="button"
                onClick={() => {
                  setPetNameInput(avatar.pet_name || '');
                  setIsEditingName(true);
                }}
                aria-label="Cambiar nombre de la mascota"
                className="text-zinc-500 hover:text-teal-400 transition-colors p-0.5 rounded cursor-pointer"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
        <p className="text-[10px] text-zinc-400 font-semibold italic text-center leading-none mt-0.5">{getPetTitle()}</p>
      </div>

      {/* Barras de Estado */}
      <div className="flex flex-col gap-3.5 relative z-10">
        {/* Energía */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold mb-1 text-zinc-400">
            <span className="flex items-center gap-1 font-serif">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Energía de Mascota
            </span>
            <span className="font-mono">{stats.pet_energy ?? 100}/100</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.pet_energy ?? 100}%` }} 
            />
          </div>
        </div>

        {/* Felicidad */}
        <div>
          <div className="flex justify-between items-center text-[10px] font-bold mb-1 text-zinc-400">
            <span className="flex items-center gap-1 font-serif">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-current" />
              Felicidad de Mascota
            </span>
            <span className="font-mono">{stats.pet_happiness ?? 50}/100</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
            <div 
              className="h-full bg-gradient-to-r from-rose-600 to-pink-500 rounded-full transition-all duration-500" 
              style={{ width: `${stats.pet_happiness ?? 50}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Botones de Acción */}
      <div className="grid grid-cols-2 gap-3 mt-auto pt-3.5 border-t border-zinc-800/80 relative z-10">
        <button
          type="button"
          disabled={isActionLoading || stats.coins < 50}
          onClick={handleFeed}
          aria-label="Alimentar a la mascota consumiendo 50 galeones"
          className="py-2.5 bg-emerald-700 hover:bg-emerald-650 disabled:opacity-40 disabled:hover:bg-emerald-700 text-white rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/20 transition-all active:scale-95 cursor-pointer border border-emerald-600/35"
        >
          <Coins className="h-3.5 w-3.5 text-yellow-400" />
          Alimentar (-50🪙)
        </button>
        
        <button
          type="button"
          disabled={isActionLoading || (stats.pet_energy ?? 100) < 25}
          onClick={handleTrain}
          aria-label="Entrenar a la mascota consumiendo 25 de energía"
          className="py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 disabled:opacity-40 text-slate-950 rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 transition-all active:scale-95 cursor-pointer border border-amber-400/40"
        >
          <Dumbbell className="h-3.5 w-3.5 text-slate-950" />
          Entrenar (-25⚡)
        </button>
      </div>

      {/* Beneficio de Felicidad Informativo */}
      <div className="bg-zinc-950/60 p-2.5 rounded-2xl border border-zinc-900 text-center relative z-10 flex items-center gap-2 justify-center">
        <Shield className="h-3.5 w-3.5 text-amber-500" />
        <span className="text-[9px] text-zinc-400 font-semibold leading-tight">
          {(stats.pet_happiness ?? 50) > 80 
            ? '¡Mascota Feliz! Inyectada en combate y reduce daño del Boss en un 15%' 
            : 'Mantén la felicidad > 80 para invocarla como aliado protector en combate.'}
        </span>
      </div>

    </div>
  );
}
