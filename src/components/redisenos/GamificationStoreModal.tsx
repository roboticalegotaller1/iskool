// src/components/redisenos/GamificationStoreModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Sparkles, Check, ShoppingBag, Shield, Zap, Award, Heart } from 'lucide-react';
import { STORE_CATALOG, StoreItem, StudentProfile, formatCoins } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile;
  onPurchaseItem: (item: StoreItem) => boolean;
  onEquipItem: (category: keyof StudentProfile['equippedItems'], itemName: string) => void;
}

export function GamificationStoreModal({ isOpen, onClose, student, onPurchaseItem, onEquipItem }: Props) {
  const [activeCategory, setActiveCategory] = useState<'all' | 'companions' | 'outfits' | 'powerups' | 'badges'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredItems = STORE_CATALOG.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const handleBuy = (item: StoreItem) => {
    gamificationAudio.playClickSound();
    const success = onPurchaseItem(item);
    if (success) {
      gamificationAudio.playCoinSound();
      setFeedbackMessage(`¡Compraste con éxito "${item.name}"!`);
      // Auto-equip if it's outfit or companion
      if (item.category === 'outfits') onEquipItem('outfit', item.name);
      if (item.category === 'companions') onEquipItem('companion', item.name);
      if (item.category === 'badges') onEquipItem('badge', item.name);
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      gamificationAudio.playErrorSound();
      setFeedbackMessage('Monedas insuficientes. ¡Resuelve más retos didácticos para ganar oro!');
      setTimeout(() => setFeedbackMessage(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header con saldo */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Tienda de Recompensas ISkool
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Totalmente Funcional
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Alumno activo: <strong className="text-slate-200">{student.name}</strong> ({student.levelTitle})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Saldo de monedas */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold shadow-inner">
              <span className="text-lg">🪙</span>
              <span suppressHydrationWarning className="text-base tracking-wide">{formatCoins(student.coins)} Monedas</span>
            </div>
            
            {/* Estrellas */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-semibold text-sm">
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
          <div className={`px-6 py-2.5 text-sm font-semibold flex items-center gap-2 ${
            feedbackMessage.includes('éxito') 
              ? 'bg-emerald-500/20 text-emerald-300 border-b border-emerald-500/30' 
              : 'bg-rose-500/20 text-rose-300 border-b border-rose-500/30'
          }`}>
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}

        {/* Showcase Banner Gráfico */}
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-300">Catálogo Anual 2026-2027</span>
            <span className="text-xs text-slate-400">· Equipamiento sin microtransacciones reales; 100% mérito pedagógico</span>
          </div>
          <div className="text-xs text-slate-300 font-medium">
            Ítem equipado actualmente: <span className="text-amber-300 font-bold">{student.equippedItems.outfit || 'Ninguno'}</span>
          </div>
        </div>

        {/* Categorías selector */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800 overflow-x-auto">
          {[
            { id: 'all', label: 'Todos los Artículos', icon: Sparkles },
            { id: 'companions', label: 'Mascotas Flotantes', icon: Heart },
            { id: 'outfits', label: 'Atuendos y Capas', icon: Zap },
            { id: 'powerups', label: 'Pociones y Potenciadores', icon: Shield },
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
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-1 ring-purple-400'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Grid de Ítems */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const canAfford = student.coins >= item.price;
            const isEquipped = 
              student.equippedItems.outfit === item.name || 
              student.equippedItems.companion === item.name ||
              student.equippedItems.badge === item.name;

            return (
              <div
                key={item.id}
                className="group relative p-4 rounded-2xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                      {item.icon}
                    </div>
                    {item.badgeLabel && (
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        {item.badgeLabel}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-white text-sm mb-1">{item.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{item.description}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-700/50 mt-2">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                    <span>🪙</span>
                    <span>{item.price}</span>
                  </div>

                  {isEquipped ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                      <Check className="w-3.5 h-3.5" /> Equipado
                    </span>
                  ) : (
                    <button
                      onClick={() => handleBuy(item)}
                      disabled={!canAfford}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                        canAfford
                          ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-md shadow-purple-600/30 hover:scale-105'
                          : 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {canAfford ? 'Comprar y Equipar' : 'Faltan Monedas'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Colegio Montessori del Valle · Tienda Segura para Alumnos</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Cerrar Tienda
          </button>
        </div>

      </div>
    </div>
  );
}
