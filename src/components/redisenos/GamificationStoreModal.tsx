// src/components/redisenos/GamificationStoreModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Sparkles, Check, ShoppingBag, Shield, Zap, Award, Heart, UserCheck } from 'lucide-react';
import { STORE_CATALOG, StoreItem, StudentProfile, formatCoins } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onPurchaseItem: (item: StoreItem) => boolean;
  onEquipItem: (category: keyof StudentProfile['equippedItems'], itemName: string, avatarUrl?: string) => void;
}

export function GamificationStoreModal({ isOpen, onClose, student, onPurchaseItem, onEquipItem }: Props) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'companions' | 'outfits' | 'powerups' | 'badges'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [ownedIds, setOwnedIds] = useState<string[]>(['item-baby-robot', 'item-flame-cloak']);

  if (!isOpen) return null;

  const filteredItems = STORE_CATALOG.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const getCategorySlot = (cat: StoreItem['category']): keyof StudentProfile['equippedItems'] => {
    if (cat === 'outfits') return 'outfit';
    if (cat === 'companions') return 'companion';
    if (cat === 'badges') return 'badge';
    return 'accessory';
  };

  const handleBuy = (item: StoreItem) => {
    gamificationAudio.playClickSound();
    const success = onPurchaseItem(item);
    if (success) {
      gamificationAudio.playCoinSound();
      setOwnedIds(prev => Array.from(new Set([...prev, item.id])));
      const slot = getCategorySlot(item.category);
      onEquipItem(slot, item.name, item.equippedAvatarImage);
      setFeedbackMessage(`¡Compraste y equipaste "${item.name}" directamente en tu Avatar 3D!`);
      setTimeout(() => setFeedbackMessage(null), 3500);
    } else {
      gamificationAudio.playErrorSound();
      setFeedbackMessage('Monedas insuficientes. ¡Resuelve más retos didácticos para ganar oro!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  const handleEquipOwned = (item: StoreItem) => {
    gamificationAudio.playLevelUpSound();
    const slot = getCategorySlot(item.category);
    onEquipItem(slot, item.name, item.equippedAvatarImage);
    setFeedbackMessage(`¡Avatar actualizado en vivo con "${item.name}"!`);
    setTimeout(() => setFeedbackMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header con saldo */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                Tienda de Recompensas 3D ISkool
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Equipamiento en Vivo en Avatar
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Alumno activo: <strong className="text-slate-200">{student.name}</strong> ({student.levelTitle})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 font-black shadow-inner">
              <span className="text-base">🪙</span>
              <span suppressHydrationWarning className="text-sm tracking-wide">{formatCoins(student.coins)} Monedas</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-bold text-xs">
              <span>⭐</span>
              <span>{student.stars} Estrellas</span>
            </div>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Feedback Banner */}
        {feedbackMessage && (
          <div className={`px-6 py-2 text-xs font-bold flex items-center gap-2 ${
            feedbackMessage.includes('insuficientes') 
              ? 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30' 
              : 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Cuerpo Principal: Pedestal del Avatar en Vivo (Izquierda) + Catálogo 3D (Derecha) */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Pedestal en Vivo del Avatar del Alumno */}
          <div className="lg:col-span-4 p-5 bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 border-b lg:border-b-0 lg:border-r border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Avatar del Alumno en Vivo
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Render 3D Activo
                </span>
              </div>

              <div className="relative w-full aspect-square rounded-3xl overflow-hidden border-2 border-amber-400/50 shadow-2xl bg-slate-900 mb-3">
                <img
                  src={student.avatarImage}
                  alt={student.name}
                  className="w-full h-full object-cover transition-all duration-500"
                />
                <div className="absolute bottom-2.5 left-2.5 right-2.5 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/40 text-center">
                  <span className="text-xs font-black text-amber-300 block truncate">
                    {student.name}
                  </span>
                  <span className="text-[10px] text-emerald-300 font-bold block truncate">
                    {student.equippedItems.companion || student.equippedItems.outfit || 'Equipamiento Base'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Compañero:</span>
                  <span className="text-amber-300 font-bold truncate max-w-[170px]">{student.equippedItems.companion || 'Ninguno'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Atuendo:</span>
                  <span className="text-purple-300 font-bold truncate max-w-[170px]">{student.equippedItems.outfit || 'Túnica Base'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Artefacto / Insignia:</span>
                  <span className="text-emerald-300 font-bold truncate max-w-[170px]">{student.equippedItems.accessory || student.equippedItems.badge || 'Estándar'}</span>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-3 leading-snug">
              Al comprar o presionar <strong>&ldquo;Equipar en Héroe&rdquo;</strong> en cualquier mascota, atuendo o artefacto, el avatar del alumno se actualiza al instante.
            </p>
          </div>

          {/* Catálogo 3D de la Tienda */}
          <div className="lg:col-span-8 flex flex-col overflow-hidden">
            {/* Categorías selector */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-800 overflow-x-auto bg-slate-900/70">
              {[
                { id: 'all', label: 'Todos los Artículos', icon: Sparkles },
                { id: 'companions', label: 'Compañeros Mágicos', icon: Heart },
                { id: 'outfits', label: 'Atuendos y Capas', icon: Zap },
                { id: 'powerups', label: 'Poderes Tácticos', icon: Shield },
                { id: 'badges', label: 'Insignias de Honor', icon: Award }
              ].map(cat => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setActiveCategory(cat.id as any);
                    }}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                        : 'bg-slate-800/70 text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Grid de Ítems con Gráficos 3D Nano Banana 2.1 */}
            <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems.map(item => {
                const canAfford = student.coins >= item.price;
                const isOwned = ownedIds.includes(item.id);
                const isEquipped =
                  student.avatarImage === item.equippedAvatarImage &&
                  (student.equippedItems.outfit === item.name ||
                    student.equippedItems.companion === item.name ||
                    student.equippedItems.accessory === item.name ||
                    student.equippedItems.badge === item.name);

                return (
                  <div
                    key={item.id}
                    className={`group relative p-3.5 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border transition-all flex flex-col justify-between shadow-lg ${
                      isEquipped ? 'border-emerald-400 ring-2 ring-emerald-400/30' : 'border-slate-700/70 hover:border-amber-400/60'
                    }`}
                  >
                    <div>
                      {/* Imagen 3D del Artículo + Miniatura del Avatar Equipado */}
                      <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-950 border border-slate-700/80">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {item.badgeLabel && (
                          <span className="absolute top-2 left-2 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-lg bg-black/80 backdrop-blur-md text-amber-300 border border-amber-400/40">
                            {item.badgeLabel}
                          </span>
                        )}
                        {/* Miniatura de cómo se ve en el Avatar */}
                        <div
                          className="absolute bottom-2 right-2 w-11 h-11 rounded-xl overflow-hidden border-2 border-amber-300 shadow-lg bg-slate-900"
                          title="Vista previa en el Avatar del Alumno"
                        >
                          <img
                            src={item.equippedAvatarImage}
                            alt={`Avatar con ${item.name}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>

                      <h3 className="font-extrabold text-white text-sm mb-1">{item.name}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-2">{item.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2.5 border-t border-slate-700/60 mt-2">
                      <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                        <span>🪙</span>
                        <span>{item.price} Monedas</span>
                      </div>

                      {isEquipped ? (
                        <span className="flex items-center gap-1 text-[11px] font-black text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-xl border border-emerald-400/40">
                          <Check className="w-3.5 h-3.5" /> En Avatar
                        </span>
                      ) : isOwned ? (
                        <button
                          onClick={() => handleEquipOwned(item)}
                          className="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all hover:scale-105"
                        >
                          Equipar en Héroe
                        </button>
                      ) : (
                        <button
                          onClick={() => handleBuy(item)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md hover:scale-105'
                              : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                          }`}
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          {canAfford ? 'Comprar y Equipar' : 'Sin Saldo'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Colegio Montessori del Valle · Gráficos 3D de Alta Fidelidad con Equipamiento Real en Avatar</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-colors"
          >
            Cerrar Tienda
          </button>
        </div>

      </div>
    </div>
  );
}
