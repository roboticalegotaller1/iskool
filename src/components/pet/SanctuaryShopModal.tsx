"use client";

import React, { useState } from 'react';
import { 
  X, Coins, Sparkles, Bed, Utensils, Gamepad2, Lightbulb, 
  Flower2, Trophy, Check, ShieldCheck, AlertCircle
} from 'lucide-react';
import { 
  SANCTUARY_BEDS, 
  SANCTUARY_OTHER_ITEMS, 
  FurnitureCategory, 
  FurnitureItem 
} from './sanctuaryTypes';
import { SanctuaryFurnitureSvg } from './SanctuaryFurnitureSvg';

interface SanctuaryShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  userCoins: number;
  inventory: string[];
  onPurchaseItem: (item: FurnitureItem) => void;
}

export const SanctuaryShopModal: React.FC<SanctuaryShopModalProps> = ({
  isOpen,
  onClose,
  userCoins,
  inventory,
  onPurchaseItem
}) => {
  const [activeCategory, setActiveCategory] = useState<FurnitureCategory>('bed');
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const allItems = [...SANCTUARY_BEDS, ...SANCTUARY_OTHER_ITEMS];
  const filteredItems = allItems.filter(item => item.category === activeCategory);

  const categories: { id: FurnitureCategory; label: string; icon: React.ReactNode }[] = [
    { id: 'bed', label: 'Camas (10 Niveles)', icon: <Bed className="w-3.5 h-3.5" /> },
    { id: 'food', label: 'Nutrición y Comida', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'toy', label: 'Juguetes y Juegos', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'lighting', label: 'Iluminación', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'decor', label: 'Decoración Viva', icon: <Flower2 className="w-3.5 h-3.5" /> },
    { id: 'wall', label: 'Pared y Trofeos', icon: <Trophy className="w-3.5 h-3.5" /> }
  ];

  const getRarityBadge = (rarity: FurnitureItem['rarity']) => {
    switch (rarity) {
      case 'celestial':
        return 'bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500 text-white shadow-amber-500/30';
      case 'legendary':
        return 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black shadow-amber-500/25';
      case 'epic':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/25';
      case 'rare':
        return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-cyan-500/25';
      case 'common':
      default:
        return 'bg-zinc-800 text-zinc-300';
    }
  };

  const handleBuy = (item: FurnitureItem) => {
    if (userCoins < item.price) return;
    onPurchaseItem(item);
    setPurchaseSuccessMessage(`¡Compraste "${item.name}"! Ya puedes colocarlo en tu hogar.`);
    setTimeout(() => {
      setPurchaseSuccessMessage(null);
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-zinc-950 border border-amber-500/30 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] flex flex-col overflow-hidden">
        
        {/* Cabecera de la Tienda */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide font-serif">Tienda del Santuario</h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Mobiliario & Confort
                </span>
              </div>
              <p className="text-xs text-zinc-400">Personaliza la casa de tu compañero con objetos interactivos.</p>
            </div>
          </div>

          {/* Saldo de Monedas y Botón Cerrar */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-sm">
              <Coins className="w-4 h-4 text-yellow-400" />
              <span>{userCoins.toLocaleString()}🪙</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de Confirmación */}
        {purchaseSuccessMessage && (
          <div className="bg-emerald-950/80 border-b border-emerald-500/40 px-6 py-2 flex items-center justify-between text-xs text-emerald-300 font-bold animate-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{purchaseSuccessMessage}</span>
            </div>
            <span className="text-[10px] opacity-75">Modo Decoración activo en el Santuario</span>
          </div>
        )}

        {/* Pestañas de Categoría */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/40 overflow-x-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeCategory === cat.id
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                  : 'bg-zinc-900/70 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Cuadrícula de Objetos */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map(item => {
            const isOwned = inventory.includes(item.id);
            const canAfford = userCoins >= item.price;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-300 ${
                  isOwned 
                    ? 'bg-zinc-900/30 border-zinc-800 opacity-90' 
                    : 'bg-zinc-900/60 hover:bg-zinc-900 border-zinc-800/80 hover:border-amber-500/40 shadow-lg'
                }`}
              >
                {/* Rarity & Tier Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs ${getRarityBadge(item.rarity)}`}>
                    {item.rarity} {item.tier ? `• Tier ${item.tier}` : ''}
                  </span>
                  {item.category === 'bed' && (
                    <span className="text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                      <span>+{item.energyBonus}⚡ Energía</span>
                    </span>
                  )}
                  {item.hungerBonus && (
                    <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                      <span>+{item.hungerBonus}🍖 Comida</span>
                    </span>
                  )}
                  {item.happinessBonus && (
                    <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                      <span>+{item.happinessBonus}🎾 Felicidad</span>
                    </span>
                  )}
                </div>

                {/* Previsualización del Mueble SVG */}
                <div className="h-28 w-full flex items-center justify-center p-2 rounded-xl bg-zinc-950/60 border border-zinc-800/60 my-2 group-hover:scale-105 transition-transform">
                  <div className="w-24 h-24 flex items-center justify-center">
                    <SanctuaryFurnitureSvg itemId={item.id} />
                  </div>
                </div>

                {/* Nombre y Descripción */}
                <div className="mb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                    <span>{item.iconEmoji}</span>
                    <span className="truncate">{item.name}</span>
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Botón de Compra o Estado */}
                <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-amber-300 font-mono font-black text-xs">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{item.price.toLocaleString()}🪙</span>
                  </div>

                  {isOwned ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-black">
                      <Check className="w-3.5 h-3.5" />
                      <span>En Posesión</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuy(item)}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>Comprar</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pie de Página con Nota Pedagógica */}
        <div className="px-6 py-3 border-t border-zinc-800/80 bg-zinc-950 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-400 gap-2">
          <div className="flex items-center gap-1.5 text-amber-400/90">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Gana monedas resolviendo tareas, contratos académicos y retos en el aula.</span>
          </div>
          <span className="text-zinc-500 font-semibold">Todos los objetos se guardan de forma permanente.</span>
        </div>

      </div>
    </div>
  );
};
