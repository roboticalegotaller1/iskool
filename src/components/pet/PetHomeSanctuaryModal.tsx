"use client";

import React, { useState } from 'react';
import { 
  X, Sparkles, Coins, Bed, Utensils, Gamepad2, Heart, 
  Palette, ShoppingBag, Moon, Sun, ArrowRight, ShieldCheck
} from 'lucide-react';
import { 
  HouseThemeId, 
  SANCTUARY_HOUSES, 
  SANCTUARY_SLOTS, 
  ALL_SANCTUARY_ITEMS,
  FurnitureItem 
} from './sanctuaryTypes';
import { SanctuaryRoomView } from './SanctuaryRoomView';
import { SanctuaryShopModal } from './SanctuaryShopModal';
import { SanctuaryFurnitureSvg } from './SanctuaryFurnitureSvg';
import { 
  useStudentStore, 
  useCurrentStudentStats, 
  useCurrentStudentAvatar 
} from '@/store/useStudentStore';

interface PetHomeSanctuaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PetHomeSanctuaryModal: React.FC<PetHomeSanctuaryModalProps> = ({
  isOpen,
  onClose
}) => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const setSanctuaryHouse = useStudentStore(state => state.setSanctuaryHouse);
  const purchaseSanctuaryItem = useStudentStore(state => state.purchaseSanctuaryItem);
  const placeSanctuaryItem = useStudentStore(state => state.placeSanctuaryItem);
  const removeSanctuaryItem = useStudentStore(state => state.removeSanctuaryItem);
  const feedPetInSanctuary = useStudentStore(state => state.feedPetInSanctuary);
  const petPlayInSanctuary = useStudentStore(state => state.petPlayInSanctuary);
  const petSleepInSanctuary = useStudentStore(state => state.petSleepInSanctuary);
  const petCompanionTouch = useStudentStore(state => state.petCompanionTouch);

  const rawStats = useCurrentStudentStats();
  const rawAvatar = useCurrentStudentAvatar();

  const stats = rawStats || { xp: 0, level: 1, coins: 0, pet_energy: 100, pet_happiness: 80, friendship_exp: 100, pet_stage: 'egg' as const };
  const avatar = rawAvatar || { pet_type: 'cryo_dragon' as const, pet_name: 'Compañero', pet_hunger: 75, pet_happiness: 80, sanctuary_inventory: [] };

  const currentHouseTheme = (avatar.sanctuary_house_type as HouseThemeId) || 'forest_cabin';
  const placedItems = avatar.sanctuary_placed_items || {};
  const inventory = avatar.sanctuary_inventory || [];

  // Estados de control de la UI
  const [isDecoratingMode, setIsDecoratingMode] = useState(false);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [selectedSlotForPlacement, setSelectedSlotForPlacement] = useState<number | null>(null);

  if (!isOpen) return null;

  const houseOptions: { id: HouseThemeId; name: string; icon: string }[] = [
    { id: 'forest_cabin', name: 'Cabaña Silvestre', icon: '🌲' },
    { id: 'cosmic_observatory', name: 'Observatorio Astral', icon: '🌌' },
    { id: 'ice_temple', name: 'Templo de Cristal', icon: '❄️' },
    { id: 'magma_forge', name: 'Forja Magmática', icon: '🌋' },
    { id: 'coral_sanctuary', name: 'Cueva de Coral', icon: '🌊' }
  ];

  // Acciones Tamagotchi
  const handleFeed = () => {
    feedPetInSanctuary(activeStudentId);
  };

  const handlePlay = () => {
    petPlayInSanctuary(activeStudentId);
  };

  const handleSleep = () => {
    petSleepInSanctuary(activeStudentId);
  };

  const handlePetTouch = () => {
    petCompanionTouch(activeStudentId);
  };

  // Compra en la tienda
  const handlePurchaseItem = (item: FurnitureItem) => {
    purchaseSanctuaryItem(activeStudentId, item.id, item.price);
  };

  // Selección de ranura para colocar objeto
  const handleSlotClick = (slotId: number) => {
    setSelectedSlotForPlacement(slotId);
  };

  // Colocar objeto seleccionado del inventario en la ranura
  const handleConfirmPlacement = (itemId: string) => {
    if (selectedSlotForPlacement !== null) {
      placeSanctuaryItem(activeStudentId, selectedSlotForPlacement, itemId);
      setSelectedSlotForPlacement(null);
    }
  };

  // Retirar objeto de una ranura
  const handleRemoveItem = (slotId: number) => {
    removeSanctuaryItem(activeStudentId, slotId);
  };

  const selectedSlotConfig = selectedSlotForPlacement !== null 
    ? SANCTUARY_SLOTS.find(s => s.id === selectedSlotForPlacement) 
    : null;

  // Filtrar inventario disponible para la ranura seleccionada
  const availableItemsForSlot = selectedSlotConfig
    ? inventory
        .map(id => ALL_SANCTUARY_ITEMS.find(item => item.id === id))
        .filter((item): item is FurnitureItem => {
          if (!item) return false;
          // Si el objeto ya está colocado en otra ranura, se permite reubicarlo o se excluye
          return selectedSlotConfig.allowedCategories.includes(item.category);
        })
    : [];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl max-h-[96vh] bg-zinc-950 border border-amber-500/40 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden">
        
        {/* ========================================================= */}
        {/* BARRA SUPERIOR: SELECTOR DE 5 CASAS Y SALDO               */}
        {/* ========================================================= */}
        <div className="px-5 py-3 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-white font-serif tracking-wide">
                  Santuario & Hogar de {avatar.pet_name || 'Compañero'}
                </h1>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Tamagotchi RPG
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Personaliza y cuida a tu compañero interactivo.</p>
            </div>
          </div>

          {/* Selector de las 5 Casas Temáticas */}
          <div className="flex items-center gap-1.5 bg-zinc-900/80 p-1 rounded-2xl border border-zinc-800 overflow-x-auto max-w-full">
            {houseOptions.map(h => {
              const isSelected = currentHouseTheme === h.id;
              return (
                <button
                  key={h.id}
                  onClick={() => setSanctuaryHouse(activeStudentId, h.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black scale-105'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <span className="text-sm">{h.icon}</span>
                  <span className="hidden sm:inline text-[11px]">{h.name}</span>
                </button>
              );
            })}
          </div>

          {/* Monedas y Botón Cerrar */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-xs">
              <Coins className="w-3.5 h-3.5 text-yellow-400" />
              <span>{(stats.coins || 0).toLocaleString()}🪙</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* HUD DE ESTADÍSTICAS TAMAGOTCHI & BOTONES DE ACCIÓN RÁPIDA */}
        {/* ========================================================= */}
        <div className="px-5 py-2.5 bg-zinc-900/40 border-b border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
          
          {/* Indicadores de Estado */}
          <div className="flex items-center gap-4 text-xs font-bold">
            {/* Hambre */}
            <div className="flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-zinc-400 text-[11px]">Hambre:</span>
              <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div 
                  className="h-full bg-orange-400 rounded-full transition-all duration-500" 
                  style={{ width: `${avatar.pet_hunger ?? 70}%` }} 
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-300">{avatar.pet_hunger ?? 70}%</span>
            </div>

            {/* Energía */}
            <div className="flex items-center gap-1.5">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-zinc-400 text-[11px]">Energía:</span>
              <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.pet_energy ?? 85}%` }} 
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-300">{stats.pet_energy ?? 85}%</span>
            </div>

            {/* Felicidad */}
            <div className="flex items-center gap-1.5">
              <Gamepad2 className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-zinc-400 text-[11px]">Felicidad:</span>
              <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden border border-zinc-700">
                <div 
                  className="h-full bg-rose-500 rounded-full transition-all duration-500" 
                  style={{ width: `${avatar.pet_happiness ?? 80}%` }} 
                />
              </div>
              <span className="font-mono text-[10px] text-zinc-300">{avatar.pet_happiness ?? 80}%</span>
            </div>

            {/* Vínculo / Amistad */}
            <div className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-current" />
              <span className="text-zinc-400 text-[11px]">Amistad:</span>
              <span className="font-mono text-[10px] text-pink-300">{stats.friendship_exp ?? 100} XP</span>
            </div>
          </div>

          {/* Botones de Acción Rápida */}
          <div className="flex items-center gap-2">
            {/* Modo Decoración Toggle */}
            <button
              onClick={() => setIsDecoratingMode(prev => !prev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                isDecoratingMode
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/30'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>{isDecoratingMode ? 'Finalizar Diseño' : 'Modo Decorar (32 Ranuras)'}</span>
            </button>

            {/* Botón de Tienda */}
            <button
              onClick={() => setIsShopModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Tienda de Muebles</span>
            </button>

            {/* Acciones Rápidas Tamagotchi */}
            <button
              onClick={handleFeed}
              title="Alimentar con monedas o comida (-20🪙)"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🍖</span>
              <span className="hidden sm:inline">Comer</span>
            </button>

            <button
              onClick={handlePlay}
              title="Jugar con tu compañero (-15🪙)"
              className="px-2.5 py-1.5 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>🎾</span>
              <span className="hidden sm:inline">Jugar</span>
            </button>

            <button
              onClick={handleSleep}
              title="Descansar en la cama (+Energía)"
              className="px-2.5 py-1.5 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-500/40 text-purple-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>💤</span>
              <span className="hidden sm:inline">Dormir</span>
            </button>

            <button
              onClick={handlePetTouch}
              title="Acariciar (Mecánica Pokémon GO)"
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/70 hover:bg-rose-900 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Acariciar</span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ESCENARIO PRINCIPAL DEL HOGAR                             */}
        {/* ========================================================= */}
        <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
          <SanctuaryRoomView
            houseTheme={currentHouseTheme}
            placedItems={placedItems}
            inventory={inventory}
            isDecoratingMode={isDecoratingMode}
            petRace={avatar.pet_type || 'cryo_dragon'}
            petStage={stats.pet_stage || 'egg'}
            petName={avatar.pet_name || 'Compañero'}
            avatarData={{
              gender: avatar.gender,
              rpg_class: avatar.rpg_class || avatar.outfit_style,
              head_type: avatar.head_type || avatar.eyes_style,
              skin_tone: avatar.skin_tone,
              hair_color: avatar.hair_color,
              hair_style: avatar.hair_style
            }}
            onSlotClick={handleSlotClick}
            onRemoveItem={handleRemoveItem}
            onPetTouch={handlePetTouch}
            onFeedPet={handleFeed}
            onPlayPet={handlePlay}
            onSleepPet={handleSleep}
          />
        </div>

        {/* ========================================================= */}
        {/* MODAL / DRAWER DE COLOCACIÓN PARA LA RANURA SELECCIONADA  */}
        {/* ========================================================= */}
        {selectedSlotConfig && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="relative w-full max-w-lg bg-zinc-900 border border-amber-500/50 rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
              
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <span>🎨</span>
                    <span>Colocar en: {selectedSlotConfig.label}</span>
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Categorías permitidas: {selectedSlotConfig.allowedCategories.join(', ')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSlotForPlacement(null)}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {availableItemsForSlot.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                  {availableItemsForSlot.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleConfirmPlacement(item.id)}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 hover:bg-zinc-800 border border-zinc-800 hover:border-amber-500/50 transition-all text-left group cursor-pointer"
                    >
                      <div className="w-12 h-12 flex items-center justify-center shrink-0">
                        <SanctuaryFurnitureSvg itemId={item.id} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-black text-white truncate">{item.name}</div>
                        <div className="text-[10px] text-amber-400 capitalize">{item.rarity}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800/80 text-center flex flex-col items-center gap-3">
                  <span className="text-3xl">🏬</span>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-200">No tienes objetos de esta categoría</h4>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      Adquiere camas, comederos, juguetes o trofeos en la Tienda del Santuario con tus monedas.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedSlotForPlacement(null);
                      setIsShopModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md"
                  >
                    Abrir Tienda del Santuario
                  </button>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-zinc-800">
                <button
                  onClick={() => setSelectedSlotForPlacement(null)}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Modal de Tienda */}
        <SanctuaryShopModal
          isOpen={isShopModalOpen}
          onClose={() => setIsShopModalOpen(false)}
          userCoins={stats.coins || 0}
          inventory={inventory}
          onPurchaseItem={handlePurchaseItem}
        />

      </div>
    </div>
  );
};
