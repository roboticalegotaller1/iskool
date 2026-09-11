"use client";

import React, { useState } from 'react';
import { 
  Plus, X, Heart, Sparkles, Move, Moon, Utensils, Gamepad2, Info
} from 'lucide-react';
import { 
  HouseThemeId, 
  SANCTUARY_HOUSES, 
  SANCTUARY_SLOTS, 
  ALL_SANCTUARY_ITEMS,
  FurnitureItem
} from './sanctuaryTypes';
import { SanctuaryFurnitureSvg } from './SanctuaryFurnitureSvg';
import { PetSvgRenderer } from './PetSvgRenderer';
import { ElementalPetRace, PetEvolutionStage } from '@/types';
import { AnimeAvatarSprite } from '../AnimeAvatarSprite';

interface SanctuaryRoomViewProps {
  houseTheme: HouseThemeId;
  placedItems: Record<number, string>; // slotId -> itemId
  inventory: string[];
  isDecoratingMode: boolean;
  petRace: ElementalPetRace;
  petStage: PetEvolutionStage;
  petName: string;
  avatarData?: {
    gender?: 'male' | 'female';
    rpg_class?: string;
    head_type?: string;
    skin_tone?: string;
    hair_color?: string;
    hair_style?: string;
  };
  onSlotClick: (slotId: number) => void;
  onRemoveItem: (slotId: number) => void;
  onPetTouch: () => void;
  onFeedPet: () => void;
  onPlayPet: () => void;
  onSleepPet: () => void;
}

export const SanctuaryRoomView: React.FC<SanctuaryRoomViewProps> = ({
  houseTheme,
  placedItems,
  inventory,
  isDecoratingMode,
  petRace,
  petStage,
  petName,
  avatarData,
  onSlotClick,
  onRemoveItem,
  onPetTouch,
  onFeedPet,
  onPlayPet,
  onSleepPet
}) => {
  const houseConfig = SANCTUARY_HOUSES[houseTheme] || SANCTUARY_HOUSES.forest_cabin;

  // Estado del compañero en la habitación (posición interactiva, acción actual)
  const [petActionState, setPetActionState] = useState<'idle' | 'sleeping' | 'eating' | 'playing' | 'petted'>('idle');
  const [petPosition, setPetPosition] = useState<{ xPercent: number; yPercent: number }>({ xPercent: 50, yPercent: 68 });
  const [activeSpeechBubble, setActiveSpeechBubble] = useState<string | null>(null);
  const [heartsList, setHeartsList] = useState<{ id: number; x: number; y: number }[]>([]);

  // Interacción al hacer clic sobre un mueble colocado
  const handleFurnitureInteract = (slotId: number, itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDecoratingMode) return;

    const slot = SANCTUARY_SLOTS.find(s => s.id === slotId);
    const item = ALL_SANCTUARY_ITEMS.find(i => i.id === itemId);
    if (!slot || !item) return;

    // Desplazar mascota hacia el mueble
    setPetPosition({ xPercent: slot.xPercent, yPercent: Math.min(85, slot.yPercent + 4) });

    if (item.category === 'bed') {
      setPetActionState('sleeping');
      setActiveSpeechBubble('¡Zzz... Esta cama está súper acogedora! (+⚡ Energía)');
      onSleepPet();
    } else if (item.category === 'food') {
      setPetActionState('eating');
      setActiveSpeechBubble('¡Ñam ñam! ¡Qué comida tan deliciosa! (+🍖 Hambre)');
      onFeedPet();
    } else if (item.category === 'toy') {
      setPetActionState('playing');
      setActiveSpeechBubble('¡A jugar! ¡Esto es súper divertido! (+🎾 Felicidad)');
      onPlayPet();
    } else if (item.category === 'lighting') {
      setActiveSpeechBubble(`¡Encendiste el/la "${item.name}"! Qué bonita iluminación.`);
    } else {
      setActiveSpeechBubble(`¡Admirando "${item.name}" en su lugar especial!`);
    }

    setTimeout(() => {
      if (item.category !== 'bed') {
        setPetActionState('idle');
      }
    }, 4500);

    setTimeout(() => {
      setActiveSpeechBubble(null);
    }, 4000);
  };

  // Caricia directa sobre la mascota
  const handlePetDirectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPetTouch();
    setPetActionState('petted');
    setActiveSpeechBubble('¡Prrr! ¡Me encantan tus caricias! (+5❤️ Amistad)');

    const newHeart = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY };
    setHeartsList(prev => [...prev.slice(-8), newHeart]);

    setTimeout(() => {
      setHeartsList(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);

    setTimeout(() => {
      setPetActionState('idle');
      setActiveSpeechBubble(null);
    }, 3000);
  };

  // Despertar a la mascota si estaba durmiendo
  const handleWakeUp = () => {
    setPetActionState('idle');
    setActiveSpeechBubble('¡Buenos días! ¡Listo para aprender hoy!');
    setTimeout(() => setActiveSpeechBubble(null), 3000);
  };

  return (
    <div 
      className={`relative w-full h-[520px] sm:h-[580px] rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 select-none bg-gradient-to-b ${houseConfig.bgGradient} transition-colors duration-700`}
      style={{ perspective: '1000px' }}
    >
      {/* ========================================================= */}
      {/* 1. FONDO ARQUITECTÓNICO Y VENTANAL DINÁMICO              */}
      {/* ========================================================= */}

      {/* Pared de fondo */}
      <div 
        className="absolute inset-x-0 top-0 h-[65%] opacity-90 border-b border-black/40"
        style={{ backgroundColor: houseConfig.wallColor }}
      >
        {/* Texturas o ranuras arquitectónicas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(0,0,0,0.4)_100%)]" />

        {/* Ventanal Arqueado con Paisaje Animado */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 w-64 sm:w-80 h-36 rounded-t-full border-4 border-amber-500/30 overflow-hidden shadow-inner bg-slate-950">
          {/* Fondo del ventanal */}
          <div className="absolute inset-0 bg-gradient-to-b from-sky-900 via-indigo-950 to-slate-950">
            {/* Animación del paisaje según el tema */}
            {houseTheme === 'forest_cabin' && (
              <div className="absolute inset-0 flex items-end justify-center">
                <span className="text-5xl opacity-40 animate-pulse">🌲🌲🌲</span>
                <span className="absolute top-4 right-10 text-xs text-yellow-200 animate-ping">✨</span>
              </div>
            )}
            {houseTheme === 'cosmic_observatory' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
                <span className="text-3xl animate-spin" style={{ animationDuration: '30s' }}>🪐</span>
                <span className="absolute top-6 left-8 text-xs text-cyan-200 animate-ping">⭐</span>
              </div>
            )}
            {houseTheme === 'ice_temple' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-12 bg-gradient-to-r from-teal-400/20 via-cyan-400/30 to-purple-400/20 blur-md animate-pulse" />
                <span className="text-4xl opacity-50">🏔️</span>
              </div>
            )}
            {houseTheme === 'magma_forge' && (
              <div className="absolute inset-0 flex items-end justify-center">
                <div className="w-full h-8 bg-rose-600/30 blur-lg animate-pulse" />
                <span className="text-4xl opacity-50">🌋</span>
              </div>
            )}
            {houseTheme === 'coral_sanctuary' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-40 animate-bounce" style={{ animationDuration: '6s' }}>🪸</span>
                <span className="absolute top-4 left-6 text-xl opacity-60 animate-pulse">🐠</span>
              </div>
            )}
          </div>
          {/* Marcos del ventanal */}
          <div className="absolute inset-0 border-r-2 border-l-2 border-amber-500/20 pointer-events-none" />
          <div className="absolute top-1/2 inset-x-0 h-0.5 bg-amber-500/20 pointer-events-none" />
        </div>

        {/* Vigas de soporte o pilares */}
        <div className="absolute top-0 left-6 bottom-0 w-4 bg-black/30 border-r border-white/5" />
        <div className="absolute top-0 right-6 bottom-0 w-4 bg-black/30 border-l border-white/5" />
      </div>

      {/* Suelo en perspectiva 2.5D */}
      <div 
        className="absolute inset-x-0 bottom-0 h-[45%] border-t-2 border-black/40 shadow-2xl"
        style={{ 
          backgroundColor: houseConfig.floorColor,
          backgroundImage: 'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.06), transparent 80%)'
        }}
      >
        {/* Tablones o baldosas */}
        <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(0,0,0,0.4)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.4)_1px,transparent_1px)] bg-[size:40px_20px]" />
      </div>

      {/* ========================================================= */}
      {/* 2. PARTÍCULAS AMBIENTALES EN VIVO (60 FPS)               */}
      {/* ========================================================= */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
        {houseConfig.ambientParticles === 'fireflies' && (
          <>
            <div className="absolute top-[30%] left-[20%] w-2 h-2 rounded-full bg-yellow-300 shadow-[0_0_8px_#fde047] animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute top-[45%] right-[25%] w-2.5 h-2.5 rounded-full bg-emerald-300 shadow-[0_0_10px_#6ee7b7] animate-pulse" style={{ animationDuration: '4s' }} />
            <div className="absolute top-[60%] left-[40%] w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_8px_#fcd34d] animate-ping" style={{ animationDuration: '2.5s' }} />
            <div className="absolute top-[25%] right-[15%] w-2 h-2 rounded-full bg-yellow-200 shadow-[0_0_6px_#fef08a] animate-pulse" />
          </>
        )}
        {houseConfig.ambientParticles === 'stardust' && (
          <>
            <div className="absolute top-[20%] left-[30%] text-xs text-indigo-300 animate-pulse">✨</div>
            <div className="absolute top-[40%] right-[30%] text-sm text-cyan-300 animate-bounce" style={{ animationDuration: '5s' }}>✦</div>
            <div className="absolute top-[55%] left-[25%] text-xs text-purple-300 animate-ping" style={{ animationDuration: '3.5s' }}>⭐</div>
            <div className="absolute top-[35%] right-[18%] text-xs text-white animate-pulse">✦</div>
          </>
        )}
        {houseConfig.ambientParticles === 'snowflakes' && (
          <>
            <div className="absolute top-[15%] left-[35%] text-xs text-cyan-200 animate-bounce" style={{ animationDuration: '4s' }}>❄️</div>
            <div className="absolute top-[35%] right-[20%] text-xs text-white animate-pulse">❄️</div>
            <div className="absolute top-[50%] left-[15%] text-xs text-sky-200 animate-bounce" style={{ animationDuration: '6s' }}>❄️</div>
          </>
        )}
        {houseConfig.ambientParticles === 'embers' && (
          <>
            <div className="absolute bottom-[30%] left-[30%] w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] animate-ping" />
            <div className="absolute bottom-[40%] right-[35%] w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e] animate-pulse" />
            <div className="absolute bottom-[25%] right-[20%] w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#fbbf24] animate-ping" />
          </>
        )}
        {houseConfig.ambientParticles === 'bubbles' && (
          <>
            <div className="absolute bottom-[20%] left-[25%] w-3 h-3 rounded-full border border-teal-300/60 bg-teal-400/20 animate-bounce" style={{ animationDuration: '4s' }} />
            <div className="absolute bottom-[35%] right-[25%] w-4 h-4 rounded-full border border-cyan-300/60 bg-cyan-400/20 animate-bounce" style={{ animationDuration: '5s' }} />
            <div className="absolute bottom-[15%] right-[40%] w-2.5 h-2.5 rounded-full border border-teal-200/60 bg-teal-300/20 animate-bounce" style={{ animationDuration: '3.5s' }} />
          </>
        )}
      </div>

      {/* ========================================================= */}
      {/* 3. AVATAR DEL ESTUDIANTE EN SU RINCÓN DE ESTUDIO         */}
      {/* ========================================================= */}
      <div 
        className="absolute left-[6%] bottom-[20%] z-20 flex flex-col items-center group cursor-pointer"
        onClick={() => {
          setActiveSpeechBubble(`¡Hola, ${petName}! Estamos decorando nuestra casa juntos.`);
          setTimeout(() => setActiveSpeechBubble(null), 3000);
        }}
      >
        <div className="relative w-16 h-20 filter drop-shadow-xl group-hover:scale-105 transition-transform">
          <AnimeAvatarSprite 
            gender={avatarData?.gender || 'female'}
            rpgClass={avatarData?.rpg_class || 'mago'}
            headType={avatarData?.head_type || 'standard'}
            skinTone={avatarData?.skin_tone || 'light'}
            hairColor={avatarData?.hair_color || 'pink'}
            hairStyle={avatarData?.hair_style || 'spiky'}
            className="w-full h-full"
          />
        </div>
        {/* Sombra del avatar en el suelo */}
        <div className="w-12 h-2.5 bg-black/40 rounded-full blur-[1px] mt-0.5" />
        <span className="text-[9px] font-black uppercase text-amber-200 tracking-wider bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30 mt-1 shadow-sm">
          Tú
        </span>
      </div>

      {/* ========================================================= */}
      {/* 4. LAS 32 RANURAS DE COLOCACIÓN (HOTSPOTS)                */}
      {/* ========================================================= */}
      {SANCTUARY_SLOTS.map(slot => {
        const placedItemId = placedItems[slot.id];
        const placedItem = placedItemId ? ALL_SANCTUARY_ITEMS.find(i => i.id === placedItemId) : null;
        const scale = slot.slotScale || 1.0;

        return (
          <div
            key={slot.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300"
            style={{
              left: `${slot.xPercent}%`,
              top: `${slot.yPercent}%`,
              zIndex: slot.zIndex,
              width: `${Math.round(64 * scale)}px`,
              height: `${Math.round(64 * scale)}px`
            }}
          >
            {/* Si tiene objeto colocado */}
            {placedItem ? (
              <div 
                className="relative w-full h-full flex items-center justify-center group cursor-pointer"
                onClick={(e) => handleFurnitureInteract(slot.id, placedItem.id, e)}
              >
                {/* Visual SVG del mueble */}
                <SanctuaryFurnitureSvg 
                  itemId={placedItem.id} 
                  className="w-full h-full filter drop-shadow-md group-hover:brightness-110 transition-transform group-hover:scale-105"
                  isInteracting={petActionState !== 'idle'}
                />

                {/* Botón de retirar o mover si está en Modo Decoración */}
                {isDecoratingMode ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveItem(slot.id);
                    }}
                    title="Retirar al inventario"
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold flex items-center justify-center shadow-lg border border-white cursor-pointer z-30 animate-in zoom-in"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  /* Tooltip de interacción en modo normal */
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-black/80 backdrop-blur-xs text-amber-200 text-[9px] font-black px-2 py-0.5 rounded-lg border border-amber-500/30 whitespace-nowrap shadow-md z-30">
                    {placedItem.name}
                  </div>
                )}
              </div>
            ) : (
              /* Ranura vacía */
              isDecoratingMode ? (
                <button
                  type="button"
                  onClick={() => onSlotClick(slot.id)}
                  className="w-full h-full rounded-2xl border-2 border-dashed border-amber-400/60 hover:border-amber-300 bg-amber-500/10 hover:bg-amber-500/25 flex flex-col items-center justify-center text-amber-300 transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.15)] group animate-pulse"
                >
                  <Plus className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  <span className="text-[7.5px] font-black uppercase tracking-tighter truncate px-1 text-center text-amber-200">
                    {slot.label}
                  </span>
                </button>
              ) : null
            )}
          </div>
        );
      })}

      {/* ========================================================= */}
      {/* 5. COMPAÑERO VIVO ANIMADO EN LA HABITACIÓN                */}
      {/* ========================================================= */}
      <div
        className={`absolute -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center transition-all duration-700 cursor-pointer ${
          petActionState === 'petted' ? 'scale-110' : ''
        }`}
        style={{
          left: `${petPosition.xPercent}%`,
          top: `${petPosition.yPercent}%`
        }}
        onClick={handlePetDirectClick}
      >
        {/* Burbuja de diálogo o pensamiento */}
        {activeSpeechBubble && (
          <div className="absolute -top-12 px-3 py-1 bg-zinc-900/95 text-white text-[10px] font-bold rounded-2xl border border-amber-500/40 shadow-xl whitespace-nowrap animate-bounce z-40">
            {activeSpeechBubble}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900/95" />
          </div>
        )}

        {/* Indicador visual de sueño si está durmiendo */}
        {petActionState === 'sleeping' && (
          <div className="absolute -top-8 right-0 flex items-center gap-1 font-mono font-black text-xs text-indigo-300 animate-pulse z-40">
            <span>Zzz...</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleWakeUp();
              }}
              className="px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[8px] font-black uppercase ml-1 cursor-pointer hover:bg-amber-400"
            >
              Despertar
            </button>
          </div>
        )}

        {/* Sprite SVG del compañero elemental */}
        <div className={`w-28 h-28 relative flex items-center justify-center filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] ${
          petActionState === 'sleeping' ? 'rotate-12 translate-y-3 opacity-90' :
          petActionState === 'eating' ? 'animate-bounce' :
          petActionState === 'playing' ? 'animate-pulse scale-105' : ''
        }`}>
          <PetSvgRenderer
            raceId={petRace}
            stage={petStage}
            actionId={
              petActionState === 'sleeping' ? 'sleep_snooze' :
              petActionState === 'eating' ? 'funny_face' :
              petActionState === 'playing' ? 'joy_bounce' : 'idle'
            }
            isPetting={petActionState === 'petted'}
            className="w-full h-full"
          />
        </div>

        {/* Sombra de la mascota */}
        <div className="w-16 h-3 bg-black/40 rounded-full blur-[2px] mt-1" />

        {/* Nombre y Raza debajo */}
        <div className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-black text-white mt-1 shadow-md">
          <Heart className="w-2.5 h-2.5 text-rose-500 fill-current" />
          <span>{petName}</span>
        </div>
      </div>

      {/* Partículas de corazones flotantes al acariciar */}
      {heartsList.map(heart => (
        <div
          key={heart.id}
          className="fixed pointer-events-none text-rose-500 text-2xl animate-in fade-in zoom-in-50 duration-700 z-[200]"
          style={{ left: heart.x - 12, top: heart.y - 20 }}
        >
          ❤️
        </div>
      ))}

      {/* Banner flotante de Modo Decoración */}
      {isDecoratingMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-2xl shadow-xl font-black text-xs flex items-center gap-2 border border-amber-300 animate-in slide-in-from-top-4 z-40">
          <Sparkles className="w-4 h-4" />
          <span>Modo Decoración Activo: Toca un punto (+) para colocar un objeto o (✕) para retirarlo</span>
        </div>
      )}

      {/* Leyenda de la Casa seleccionada */}
      <div className="absolute bottom-3 right-4 bg-black/60 backdrop-blur-xs px-3 py-1 rounded-xl border border-white/10 text-[10px] text-zinc-300 font-bold flex items-center gap-1.5 z-20">
        <span>{houseConfig.badgeEmoji}</span>
        <span>{houseConfig.name}</span>
      </div>

    </div>
  );
};
