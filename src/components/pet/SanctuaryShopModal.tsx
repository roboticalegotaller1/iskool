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

  const categories: { id: FurnitureCategory; label: string; shortLabel: string; icon: React.ReactNode }[] = [
    { id: 'bed', label: 'Camas (10 Niveles)', shortLabel: 'Camas', icon: <Bed className="w-3.5 h-3.5" /> },
    { id: 'food', label: 'Nutrición y Comida', shortLabel: 'Comida', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'toy', label: 'Juguetes y Juegos', shortLabel: 'Juegos', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'lighting', label: 'Iluminación', shortLabel: 'Luces', icon: <Lightbulb className="w-3.5 h-3.5" /> },
    { id: 'decor', label: 'Decoración Viva', shortLabel: 'Decoración', icon: <Flower2 className="w-3.5 h-3.5" /> },
    { id: 'wall', label: 'Pared y Trofeos', shortLabel: 'Trofeos', icon: <Trophy className="w-3.5 h-3.5" /> }
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
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700/60';
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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[92vh] sm:h-[86vh] max-h-[820px] bg-zinc-950 border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.18)] flex flex-col overflow-hidden">
        
        {/* Cabecera de la Tienda - Limpia, espaciosa y sin encimarse */}
        <div className="flex items-center justify-between px-3.5 sm:px-6 py-2.5 sm:py-3.5 border-b border-zinc-800 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white tracking-wide font-serif truncate">
                  Tienda del Santuario
                </h2>
                <span className="hidden md:inline-flex text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                  Mobiliario & Confort
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-zinc-400 truncate max-w-[210px] sm:max-w-md">
                Personaliza la casa de tu compañero con objetos interactivos.
              </p>
            </div>
          </div>

          {/* Saldo de Monedas y Botón Cerrar */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono font-black text-xs sm:text-sm shadow-xs">
              <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
              <span>{userCoins.toLocaleString()}🪙</span>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar Tienda"
              className="p-1.5 sm:p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Mensaje de Confirmación */}
        {purchaseSuccessMessage && (
          <div className="bg-emerald-950/90 border-b border-emerald-500/40 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-emerald-300 font-bold animate-in slide-in-from-top-2 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">{purchaseSuccessMessage}</span>
            </div>
            <span className="text-[10px] opacity-80 hidden sm:inline shrink-0">Modo Decoración activo en el Santuario</span>
          </div>
        )}

        {/* Pestañas de Categoría - Sin scrollbars toscas y con etiquetas adaptadas */}
        <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 border-b border-zinc-800/80 bg-zinc-900/50 overflow-x-auto scrollbar-none no-scrollbar touch-pan-x shrink-0">
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-black'
                    : 'bg-zinc-900/80 text-zinc-400 hover:text-white hover:bg-zinc-800/80 border border-zinc-800'
                }`}
              >
                {cat.icon}
                <span className="hidden sm:inline">{cat.label}</span>
                <span className="sm:hidden">{cat.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Cuadrícula de Objetos - Adaptativa, proporcionada y con scroll suave */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 sm:p-5 grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
          {filteredItems.map(item => {
            const isOwned = inventory.includes(item.id);
            const canAfford = userCoins >= item.price;

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between p-3 sm:p-3.5 rounded-2xl border transition-all duration-300 group ${
                  isOwned 
                    ? 'bg-zinc-900/35 border-zinc-800/70 opacity-90' 
                    : 'bg-zinc-900/60 hover:bg-zinc-900/90 border-zinc-800/80 hover:border-amber-500/40 shadow-md hover:shadow-amber-500/10'
                }`}
              >
                {/* Fila Superior: Insignia de Rareza y Bonificaciones */}
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className={`text-[8.5px] sm:text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs shrink-0 ${getRarityBadge(item.rarity)}`}>
                    {item.rarity} {item.tier ? `• T${item.tier}` : ''}
                  </span>
                  
                  <div className="flex items-center gap-1 shrink-0">
                    {item.category === 'bed' && (
                      <span className="text-[9.5px] sm:text-[10px] text-indigo-300 font-bold px-1.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30">
                        +{item.energyBonus}⚡
                      </span>
                    )}
                    {item.hungerBonus && (
                      <span className="text-[9.5px] sm:text-[10px] text-amber-300 font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30">
                        +{item.hungerBonus}🍖
                      </span>
                    )}
                    {item.happinessBonus && (
                      <span className="text-[9.5px] sm:text-[10px] text-rose-300 font-bold px-1.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30">
                        +{item.happinessBonus}🎾
                      </span>
                    )}
                  </div>
                </div>

                {/* Previsualización del Mueble SVG Proporcionada y Centrada */}
                <div className="h-20 sm:h-24 w-full flex items-center justify-center p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/70 my-1 group-hover:border-zinc-700 transition-all">
                  <div className="w-28 h-18 sm:w-32 sm:h-20 max-w-full max-h-full flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300">
                    <SanctuaryFurnitureSvg itemId={item.id} />
                  </div>
                </div>

                {/* Nombre y Descripción */}
                <div className="my-1.5">
                  <h3 className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                    <span className="text-sm sm:text-base shrink-0">{item.iconEmoji}</span>
                    <span className="truncate">{item.name}</span>
                  </h3>
                  <p className="text-[10.5px] sm:text-[11px] text-zinc-400 line-clamp-2 mt-0.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Botón de Compra o Estado de Posesión */}
                <div className="pt-2 mt-auto border-t border-zinc-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-amber-300 font-mono font-black text-xs sm:text-sm shrink-0">
                    <Coins className="w-3.5 h-3.5 text-yellow-400" />
                    <span>{item.price.toLocaleString()}🪙</span>
                  </div>

                  {isOwned ? (
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-[11px] font-black shrink-0">
                      <Check className="w-3 h-3" />
                      <span>En Posesión</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleBuy(item)}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-sm ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/20 active:scale-95'
                          : 'bg-zinc-800 text-zinc-500 border border-zinc-700/60 cursor-not-allowed opacity-60'
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

        {/* Pie de Página con Nota Pedagógica Limpia */}
        <div className="px-3.5 sm:px-6 py-2 sm:py-2.5 border-t border-zinc-800/80 bg-zinc-950/90 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-[11px] text-zinc-400 gap-1.5 shrink-0">
          <div className="flex items-center gap-1.5 text-amber-400/90 text-center sm:text-left truncate">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
            <span className="truncate">Gana monedas completando tareas y retos académicos.</span>
          </div>
          <span className="text-zinc-500 font-semibold text-[10px] shrink-0">Inventario permanente en tu Santuario.</span>
        </div>

      </div>
    </div>
  );
};
