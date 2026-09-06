"use client";

import React, { useState } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar } from '@/store/useStudentStore';
import { 
  Flame, Coins, Heart, Sparkles, Dumbbell, Shield, Edit3, Check
} from 'lucide-react';

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
    const stage = stats.pet_stage || 'egg';
    const type = avatar.pet_type || 'dragon';

    if (stage === 'egg') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md animate-pulse">
          <ellipse cx="50" cy="55" rx="23" ry="32" fill="#FEF3C7" stroke="#D97706" strokeWidth="2.5" />
          <circle cx="43" cy="42" r="3.5" fill="#FBBF24" opacity="0.6" />
          <circle cx="57" cy="52" r="5.5" fill="#FBBF24" opacity="0.6" />
          <circle cx="45" cy="68" r="4.5" fill="#FBBF24" opacity="0.6" />
          <circle cx="50" cy="60" r="2.5" fill="#FBBF24" opacity="0.6" />
        </svg>
      );
    }

    // Especies
    switch (type) {
      case 'lobo':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
            <circle cx="50" cy="56" r="23" fill="#9CA3AF" />
            <circle cx="50" cy="56" r="14" fill="#E5E7EB" />
            <circle cx="50" cy="36" r="16" fill="#D1D5DB" />
            <polygon points="34,30 32,14 44,22" fill="#9CA3AF" />
            <polygon points="36,28 35,18 42,23" fill="#FCA5A5" />
            <polygon points="66,30 68,14 56,22" fill="#9CA3AF" />
            <polygon points="64,28 65,18 58,23" fill="#FCA5A5" />
            <circle cx="38" cy="40" r="5" fill="#F3F4F6" />
            <circle cx="62" cy="40" r="5" fill="#F3F4F6" />
            <circle cx="44" cy="33" r="2" fill="#1F2937" />
            <circle cx="56" cy="33" r="2" fill="#1F2937" />
            <ellipse cx="50" cy="39" rx="4" ry="2.5" fill="#F3F4F6" />
            <polygon points="48,38 52,38 50,40" fill="#111827" />
            <path d="M49 41 Q 50 42.5 51 41" stroke="#111827" strokeWidth="1" fill="none" />
          </svg>
        );
      case 'venado':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
            <circle cx="50" cy="56" r="23" fill="#D97706" />
            <circle cx="42" cy="48" r="2" fill="#FFFFFF" />
            <circle cx="58" cy="52" r="2" fill="#FFFFFF" />
            <circle cx="40" cy="58" r="1.5" fill="#FFFFFF" />
            <circle cx="56" cy="62" r="1.5" fill="#FFFFFF" />
            <circle cx="50" cy="36" r="16" fill="#F59E0B" />
            <ellipse cx="33" cy="26" rx="5" ry="10" transform="rotate(-30, 33, 26)" fill="#D97706" />
            <ellipse cx="33" cy="26" rx="2.5" ry="7" transform="rotate(-30, 33, 26)" fill="#FCA5A5" />
            <ellipse cx="67" cy="26" rx="5" ry="10" transform="rotate(30, 67, 26)" fill="#D97706" />
            <ellipse cx="67" cy="26" rx="2.5" ry="7" transform="rotate(30, 67, 26)" fill="#FCA5A5" />
            <circle cx="43" cy="34" r="2.5" fill="#1F2937" />
            <circle cx="42.2" cy="33.2" r="0.8" fill="#FFFFFF" />
            <circle cx="57" cy="34" r="2.5" fill="#1F2937" />
            <circle cx="56.2" cy="33.2" r="0.8" fill="#FFFFFF" />
            <ellipse cx="50" cy="40" rx="3" ry="2" fill="#FEF3C7" />
            <circle cx="50" cy="39" r="1" fill="#111827" />
          </svg>
        );
      case 'gusano':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
            <circle cx="38" cy="65" r="12" fill="#EC4899" />
            <circle cx="46" cy="59" r="11" fill="#F43F5E" />
            <circle cx="56" cy="55" r="12" fill="#F472B6" />
            <circle cx="62" cy="40" r="14" fill="#FB7185" />
            <path d="M58 28 Q 54 20 48 22" stroke="#EC4899" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="47" cy="22" r="2.5" fill="#FBBF24" />
            <circle cx="58" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="58" cy="38" r="0.8" fill="#111827" />
            <circle cx="67" cy="38" r="1.5" fill="#FFFFFF" />
            <circle cx="67" cy="38" r="0.8" fill="#111827" />
            <path d="M60 45 Q 64 48 68 44" stroke="#881337" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          </svg>
        );
      case 'gatito':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
            <circle cx="50" cy="56" r="23" fill="#F59E0B" />
            <circle cx="50" cy="58" r="13" fill="#FEF3C7" />
            <circle cx="50" cy="35" r="16" fill="#FBBF24" />
            <polygon points="34,26 31,10 45,20" fill="#F59E0B" />
            <polygon points="36,23 34,14 42,20" fill="#FCA5A5" />
            <polygon points="66,26 69,10 55,20" fill="#F59E0B" />
            <polygon points="64,23 66,14 58,20" fill="#FCA5A5" />
            <circle cx="43" cy="33" r="2" fill="#065F46" />
            <circle cx="57" cy="33" r="2" fill="#065F46" />
            <path d="M46 40 Q 50 43 54 40" stroke="#78350F" strokeWidth="1.2" fill="none" />
            <line x1="33" y1="38" x2="25" y2="36" stroke="#78350F" strokeWidth="1" />
            <line x1="33" y1="41" x2="24" y2="41" stroke="#78350F" strokeWidth="1" />
            <line x1="67" y1="38" x2="75" y2="36" stroke="#78350F" strokeWidth="1" />
            <line x1="67" y1="41" x2="76" y2="41" stroke="#78350F" strokeWidth="1" />
          </svg>
        );
      case 'dragon':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
            <circle cx="50" cy="55" r="24" fill="#34D399" />
            <circle cx="50" cy="35" r="16" fill="#6EE7B7" />
            <circle cx="44" cy="32" r="2" fill="#065F46" />
            <circle cx="56" cy="32" r="2" fill="#065F46" />
            <path d="M46 41 Q 50 44 54 41" stroke="#065F46" strokeWidth="1.5" fill="none" />
            <polygon points="40,22 44,14 47,22" fill="#FBBF24" />
            <polygon points="60,22 56,14 53,22" fill="#FBBF24" />
          </svg>
        );
    }
  };

  const getStageBadgeColor = () => {
    switch (stats.pet_stage) {
      case 'mystic': return 'from-purple-500 to-indigo-600 text-white shadow-purple-500/35 border-purple-400/40';
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
    <div id="rpg-pet-sanctuary" className="bg-zinc-950/50 p-6 rounded-3xl border border-zinc-800 backdrop-blur-md shadow-2xl w-full lg:w-80 flex flex-col gap-5 relative overflow-hidden transition-all duration-300 hover:border-purple-500/40 shrink-0">
      
      {/* Glow para místico */}
      {stats.pet_stage === 'mystic' && (
        <div className="absolute -inset-10 bg-purple-500/5 blur-3xl pointer-events-none animate-pulse" />
      )}

      {/* Cabecera */}
      <div className="flex justify-between items-center border-b border-zinc-800 pb-2.5 relative z-10">
        <div className="flex items-center gap-2">
          <Flame className={`h-4.5 w-4.5 ${stats.pet_stage === 'mystic' ? 'text-purple-400 animate-pulse' : 'text-amber-500'}`} />
          <span className="text-xs font-black text-purple-300 uppercase tracking-widest font-serif">Santuario RPG</span>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-sm bg-gradient-to-r ${getStageBadgeColor()}`}>
          {stats.pet_stage || 'egg'}
        </span>
      </div>

      {/* Visualización de la Mascota */}
      <div className="flex flex-col items-center gap-3 relative z-10">
        <div className={`h-28 w-28 flex items-center justify-center relative bg-purple-950/20 rounded-full border border-purple-500/10 p-3 overflow-hidden shadow-inner group transition-all duration-500 hover:scale-105 hover:bg-purple-950/30 ${stats.pet_stage === 'mystic' ? 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : ''}`}>
          
          {/* Bobbing animation container */}
          <div className="w-full h-full animate-bounce" style={{ animationDuration: '3s' }}>
            {renderPetVisual()}
          </div>
          
          {stats.pet_stage === 'mystic' && (
            <div className="absolute inset-0 border border-purple-500/30 rounded-full animate-ping pointer-events-none opacity-20" />
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
                className="bg-zinc-900 border border-purple-500/40 text-xs px-2 py-0.5 rounded text-white font-bold focus:outline-none focus:border-purple-400 w-28"
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
                className="text-zinc-500 hover:text-purple-400 transition-colors p-0.5 rounded cursor-pointer"
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
              className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 rounded-full transition-all duration-500" 
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
          className="py-2.5 bg-purple-700 hover:bg-purple-650 disabled:opacity-40 disabled:hover:bg-purple-700 text-white rounded-xl text-[10.5px] font-black flex items-center justify-center gap-1.5 shadow-md shadow-purple-950/20 transition-all active:scale-95 cursor-pointer border border-purple-600/35"
        >
          <Dumbbell className="h-3.5 w-3.5 text-indigo-300" />
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
