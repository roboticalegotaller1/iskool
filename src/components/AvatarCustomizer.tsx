"use client";

import React, { useState, useEffect } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar } from '../store/useStudentStore';
import { 
  Sparkles, 
  Palette, 
  Check, 
  Lock, 
  Smile, 
  Shirt, 
  Zap,
  PartyPopper,
  User,
  Coins,
  X,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Flame,
  Crown
} from 'lucide-react';
import { ModularAnimeAvatarSprite } from './avatar/ModularAnimeAvatarSprite';
import { 
  AVATAR_HAIRSTYLES,
  AVATAR_HAIR_COLORS,
  AVATAR_SKIN_TONES,
  AVATAR_EYES_STYLES,
  AVATAR_RACE_FEATURES,
  AVATAR_CLOTHING_ITEMS,
  ClothingCategory,
  AvatarClothingItem
} from './avatar/avatarCustomizationTypes';
import { 
  EyePreviewSvg,
  HairPreviewSvg,
  HairColorPreviewSvg,
  SkinTonePreviewSvg,
  RaceFeaturePreviewSvg,
  ClothingItemPreviewSvg
} from './avatar/AvatarTraitPreviews';
import { StudentAvatar } from '@/types';

interface AvatarCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ isOpen, onClose }) => {
  const avatar = useCurrentStudentAvatar();
  const stats = useCurrentStudentStats();
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const updatePhysicalTraits = useStudentStore(state => state.updatePhysicalTraits);
  const equipClothingItem = useStudentStore(state => state.equipClothingItem);
  const purchaseClothingItem = useStudentStore(state => state.purchaseClothingItem);

  // Tab Principal (estilo RPG cozy como la imagen de referencia: ROPA, CUERPO, CABELLO, OJOS, SOMBREROS)
  const [mainTab, setMainTab] = useState<'clothes' | 'body' | 'hair' | 'eyes' | 'hats'>('clothes');
  
  // Sub-categorías para Ropa
  const [clothingSubTab, setClothingSubTab] = useState<ClothingCategory>('top');
  
  // Sub-categorías para Cuerpo y Cabello
  const [bodySubTab, setBodySubTab] = useState<'skin' | 'races' | 'scale'>('skin');
  const [hairSubTab, setHairSubTab] = useState<'styles' | 'colors'>('styles');

  // Modo de Cámara: Dinámico y controlado (acercamiento para rostro/ojos/cabello vs cuerpo entero)
  const [cameraZoom, setCameraZoom] = useState<'face' | 'body'>('body');

  // Estados locales para respuesta inmediata sin lag
  const [selectedGender, setSelectedGender] = useState<'female' | 'male' | 'neutral'>(avatar.gender || 'female');
  const [selectedScale, setSelectedScale] = useState<'compact' | 'normal' | 'tall'>(avatar.body_scale || 'normal');
  const [selectedSkinTone, setSelectedSkinTone] = useState(avatar.skin_tone || '#FED7AA');
  const [selectedHairStyle, setSelectedHairStyle] = useState(avatar.hair_style || 'spiky');
  const [selectedHairColor, setSelectedHairColor] = useState(avatar.hair_color || '#EC4899');
  const [selectedEyesStyle, setSelectedEyesStyle] = useState(avatar.eyes_style || 'determined');
  const [selectedRaceFeature, setSelectedRaceFeature] = useState(avatar.race_feature || 'human');

  const [selectedShoes, setSelectedShoes] = useState(avatar.equipped_shoes || 'shoes_basic');
  const [selectedBottom, setSelectedBottom] = useState(avatar.equipped_bottom || 'bottom_basic');
  const [selectedTop, setSelectedTop] = useState(avatar.equipped_top || 'top_basic');
  const [selectedOuterwear, setSelectedOuterwear] = useState(avatar.equipped_outerwear || 'outerwear_none');
  const [selectedHat, setSelectedHat] = useState(avatar.equipped_hat || 'hat_none');
  const [selectedAccessory, setSelectedAccessory] = useState(avatar.equipped_accessory || 'acc_none');

  // Animación interactiva en vivo ('idle', 'cast', 'cheer')
  const [previewAnimation, setPreviewAnimation] = useState<'idle' | 'cast' | 'cheer'>('idle');
  const [avatarName, setAvatarName] = useState(avatar.avatar_name || 'LucasAvatar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Sincronizar estados locales cuando se abre el modal
  useEffect(() => {
    if (isOpen && avatar) {
      setSelectedGender(avatar.gender || 'female');
      setSelectedScale(avatar.body_scale || 'normal');
      setSelectedSkinTone(avatar.skin_tone || '#FED7AA');
      setSelectedHairStyle(avatar.hair_style || 'spiky');
      setSelectedHairColor(avatar.hair_color || '#EC4899');
      setSelectedEyesStyle(avatar.eyes_style || 'determined');
      setSelectedRaceFeature(avatar.race_feature || 'human');
      setSelectedShoes(avatar.equipped_shoes || 'shoes_basic');
      setSelectedBottom(avatar.equipped_bottom || 'bottom_basic');
      setSelectedTop(avatar.equipped_top || 'top_basic');
      setSelectedOuterwear(avatar.equipped_outerwear || 'outerwear_none');
      setSelectedHat(avatar.equipped_hat || 'hat_none');
      setSelectedAccessory(avatar.equipped_accessory || 'acc_none');
      setAvatarName(avatar.avatar_name || 'LucasAvatar');
    }
  }, [isOpen, avatar]);

  // Al cambiar de pestaña, ajustar la cámara automáticamente para mayor inmersión
  const handleTabChange = (tab: 'clothes' | 'body' | 'hair' | 'eyes' | 'hats') => {
    setMainTab(tab);
    if (tab === 'hair' || tab === 'eyes' || tab === 'body') {
      setCameraZoom('face');
    } else {
      setCameraZoom('body');
    }
  };

  if (!isOpen) return null;

  const currentCoins = stats.coins ?? 0;
  const ownedItems = avatar.wardrobe_inventory || ['shoes_basic', 'bottom_basic', 'top_basic'];

  const triggerAnim = (anim: 'idle' | 'cast' | 'cheer') => {
    setPreviewAnimation(anim);
  };

  // Cambio de género inmediato con reflejo visual
  const handleGenderSelect = (newGender: 'female' | 'male' | 'neutral') => {
    setSelectedGender(newGender);
    updatePhysicalTraits(activeStudentId, { gender: newGender });
    changeAvatar({ gender: newGender });
    triggerAnim('cheer');
  };

  // Cambio de escala / altura
  const handleScaleSelect = (newScale: 'compact' | 'normal' | 'tall') => {
    setSelectedScale(newScale);
    updatePhysicalTraits(activeStudentId, { body_scale: newScale });
    changeAvatar({ body_scale: newScale });
  };

  // Equipar prenda inmediatamente
  const handleEquip = (category: ClothingCategory, itemId: string) => {
    if (category === 'shoes') setSelectedShoes(itemId);
    if (category === 'bottom') setSelectedBottom(itemId);
    if (category === 'top') setSelectedTop(itemId);
    if (category === 'outerwear') setSelectedOuterwear(itemId);
    if (category === 'hat') setSelectedHat(itemId);
    if (category === 'accessory') setSelectedAccessory(itemId);

    equipClothingItem(activeStudentId, category, itemId);
    const keyMap: Record<string, string> = {
      shoes: 'equipped_shoes',
      bottom: 'equipped_bottom',
      top: 'equipped_top',
      outerwear: 'equipped_outerwear',
      hat: 'equipped_hat',
      accessory: 'equipped_accessory'
    };
    const targetProp = keyMap[category] || `equipped_${category}`;
    changeAvatar({ [targetProp]: itemId });
  };

  // Comprar prenda con monedas
  const handlePurchase = (item: AvatarClothingItem) => {
    const res = purchaseClothingItem(activeStudentId, item.id, item.price);
    if (res.success) {
      handleEquip(item.category, item.id);
      setFeedbackNotice({ msg: `¡Compraste "${item.name}"!`, type: 'success' });
      triggerAnim('cheer');
    } else {
      setFeedbackNotice({ msg: res.reason || 'Monedas insuficientes.', type: 'error' });
    }
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // Guardar y Salir
  const handleApply = () => {
    const fullPayload: Partial<StudentAvatar> = {
      gender: selectedGender,
      body_scale: selectedScale,
      skin_tone: selectedSkinTone,
      hair_style: selectedHairStyle,
      hair_color: selectedHairColor,
      eyes_style: selectedEyesStyle,
      race_feature: selectedRaceFeature,
      equipped_shoes: selectedShoes,
      equipped_bottom: selectedBottom,
      equipped_top: selectedTop,
      equipped_outerwear: selectedOuterwear,
      equipped_hat: selectedHat,
      equipped_accessory: selectedAccessory,
    };
    if (avatarName.trim()) {
      fullPayload.avatar_name = avatarName.trim();
    }
    updatePhysicalTraits(activeStudentId, fullPayload);
    changeAvatar(fullPayload);
    onClose();
  };

  const tabsList: { id: 'clothes' | 'body' | 'hair' | 'eyes' | 'hats'; label: string; icon: string }[] = [
    { id: 'clothes', label: 'ROPA', icon: '👕' },
    { id: 'body', label: 'CUERPO', icon: '✨' },
    { id: 'hair', label: 'CABELLO', icon: '💇' },
    { id: 'eyes', label: 'OJOS', icon: '👁️' },
    { id: 'hats', label: 'SOMBREROS', icon: '🎩' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[94vh] border border-[#E6D7C3] dark:border-zinc-800 bg-[#FAF4EB] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR: PESTAÑAS DE JUEGO (Estilo Animal Crossing / Cozy RPG)     */}
        {/* ========================================================================= */}
        <div className="px-3 sm:px-6 pt-3 sm:pt-5 pb-2 sm:pb-3 bg-[#F2E7D5] dark:bg-zinc-900/90 border-b border-[#E3D3BE] dark:border-zinc-800 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none max-w-[calc(100%-110px)] sm:max-w-none">
            <span className="hidden sm:inline-flex items-center justify-center w-6 h-6 rounded bg-[#E4D4BE] dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-300 shadow-inner shrink-0">
              Q
            </span>

            {tabsList.map((tab) => {
              const isActive = mainTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-black tracking-wider transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-[#FFE6C7] dark:bg-amber-500/20 text-[#7A3E00] dark:text-amber-300 ring-2 ring-[#DCA876] dark:ring-amber-500/50 scale-105'
                      : 'bg-[#FAF3E8] dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-white hover:text-zinc-900 dark:hover:bg-zinc-700'
                  }`}
                >
                  <span className="text-base">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}

            <span className="hidden sm:inline-flex items-center justify-center w-6 h-6 rounded bg-[#E4D4BE] dark:bg-zinc-800 text-[10px] font-black text-zinc-600 dark:text-zinc-300 shadow-inner shrink-0">
              E
            </span>
          </div>

          {/* Monedas ISkool */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-[#FFE4C4] dark:bg-amber-950/40 border border-[#DEB887] dark:border-amber-700/50 text-[#8B4513] dark:text-amber-300 text-[11px] sm:text-xs font-black shadow-inner shrink-0">
            <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>{currentCoins} <span className="hidden min-[420px]:inline">Monedas</span></span>
          </div>
        </div>

        {/* Notificación de feedback (compras, avisos) */}
        {feedbackNotice && (
          <div className={`px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 ${
            feedbackNotice.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            <span>{feedbackNotice.msg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* CUERPO PRINCIPAL: IZQUIERDA (CUADRÍCULA 4 COLUMNAS) | DERECHA (ESCENARIO) */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col-reverse lg:flex-row overflow-hidden">
          
          {/* --------------------------------------------------------------------- */}
          {/* PANEL IZQUIERDO: CUADRÍCULA TÁCTIL DE SQUIRCLES (Como la imagen)       */}
          {/* --------------------------------------------------------------------- */}
          <div className="w-full lg:w-[58%] p-4 sm:p-6 flex flex-col overflow-hidden bg-[#FAF4EB] dark:bg-zinc-950/60 border-r border-[#E6D7C3] dark:border-zinc-800/80">
            
            {/* SUB-PESTAÑAS DE CATEGORÍA */}
            <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1 shrink-0">
              {mainTab === 'clothes' && (
                [
                  { id: 'top' as const, label: 'Playeras', icon: '👕' },
                  { id: 'bottom' as const, label: 'Pantalones', icon: '👖' },
                  { id: 'shoes' as const, label: 'Zapatos', icon: '👟' },
                  { id: 'outerwear' as const, label: 'Capas/Chamarras', icon: '🧥' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setClothingSubTab(sub.id);
                      setCameraZoom(sub.id === 'top' || sub.id === 'outerwear' ? 'body' : 'body');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      clothingSubTab === sub.id
                        ? 'bg-[#EBDBC6] dark:bg-zinc-800 text-[#5C3206] dark:text-zinc-100 shadow-sm ring-1 ring-[#D8C0A4]'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                ))
              )}

              {mainTab === 'body' && (
                [
                  { id: 'skin' as const, label: 'Tonos de Piel (15)', icon: '🎨' },
                  { id: 'races' as const, label: 'Razas & Rasgos (15)', icon: '🧝' },
                  { id: 'scale' as const, label: 'Identidad & Talla', icon: '👤' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setBodySubTab(sub.id);
                      setCameraZoom(sub.id === 'scale' ? 'body' : 'face');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      bodySubTab === sub.id
                        ? 'bg-[#EBDBC6] dark:bg-zinc-800 text-[#5C3206] dark:text-zinc-100 shadow-sm ring-1 ring-[#D8C0A4]'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                ))
              )}

              {mainTab === 'hair' && (
                [
                  { id: 'styles' as const, label: '16 Peinados Anime', icon: '💇' },
                  { id: 'colors' as const, label: '15 Colores de Pelo', icon: '🎨' }
                ].map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setHairSubTab(sub.id);
                      setCameraZoom('face');
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                      hairSubTab === sub.id
                        ? 'bg-[#EBDBC6] dark:bg-zinc-800 text-[#5C3206] dark:text-zinc-100 shadow-sm ring-1 ring-[#D8C0A4]'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <span>{sub.icon}</span>
                    <span>{sub.label}</span>
                  </button>
                ))
              )}
            </div>

            {/* CONTENIDO EN CUADRÍCULA DE 4 COLUMNAS (SQUIRCLES TÁCTILES) */}
            <div className="flex-1 overflow-y-auto pr-1">
              
              {/* --- CASO 1: ROPA (TOP, BOTTOM, SHOES, OUTERWEAR) --- */}
              {mainTab === 'clothes' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_CLOTHING_ITEMS.filter(item => item.category === clothingSubTab).map((item) => {
                    const isOwned = item.isDefault || ownedItems.includes(item.id);
                    const isEquipped = (
                      (clothingSubTab === 'top' && selectedTop === item.id) ||
                      (clothingSubTab === 'bottom' && selectedBottom === item.id) ||
                      (clothingSubTab === 'shoes' && selectedShoes === item.id) ||
                      (clothingSubTab === 'outerwear' && selectedOuterwear === item.id)
                    );
                    const canAfford = currentCoins >= item.price;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isOwned) {
                            handleEquip(item.category, item.id);
                          } else {
                            handlePurchase(item);
                          }
                        }}
                        className={`group relative aspect-square p-3 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                          isEquipped
                            ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                            : isOwned
                            ? 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                            : 'bg-[#FFF9EE]/70 dark:bg-zinc-900/60 border-2 border-dashed border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {/* Insignia equipada */}
                        {isEquipped && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Ilustración visual vectorial de la prenda */}
                        <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/90 p-1 flex items-center justify-center shadow-inner mt-1">
                          <ClothingItemPreviewSvg item={item} />
                        </div>

                        {/* Nombre y Precio */}
                        <div className="text-center w-full mt-1">
                          <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            {isEquipped ? (
                              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Puesto</span>
                            ) : isOwned ? (
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">Equipar</span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                <Coins className="w-3 h-3" />
                                {item.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* --- CASO 2: CUERPO (TONOS DE PIEL, RAZAS MÍTICAS, ESCALA Y GÉNERO) --- */}
              {mainTab === 'body' && (
                <div>
                  {bodySubTab === 'skin' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AVATAR_SKIN_TONES.map((tone) => {
                        const toneCol = tone.color || tone.value || '#FED7AA';
                        const isSelected = selectedSkinTone === toneCol;
                        return (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() => {
                              setSelectedSkinTone(toneCol);
                              updatePhysicalTraits(activeStudentId, { skin_tone: toneCol });
                              changeAvatar({ skin_tone: toneCol });
                            }}
                            className={`group relative aspect-square p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                              isSelected
                                ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                                : 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/80 p-1 flex items-center justify-center shadow-inner mt-1">
                              <SkinTonePreviewSvg toneColor={toneCol} />
                            </div>
                            <div className="text-center w-full mt-1">
                              <span className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate block">
                                {tone.name}
                              </span>
                              <span className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate block">
                                {tone.description || 'Tono de piel'}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {bodySubTab === 'races' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AVATAR_RACE_FEATURES.map((race) => {
                        const isSelected = selectedRaceFeature === race.id;
                        return (
                          <button
                            key={race.id}
                            type="button"
                            onClick={() => {
                              setSelectedRaceFeature(race.id);
                              updatePhysicalTraits(activeStudentId, { race_feature: race.id });
                              changeAvatar({ race_feature: race.id });
                            }}
                            className={`group relative aspect-square p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                              isSelected
                                ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                                : 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/80 p-0.5 flex items-center justify-center shadow-inner mt-1">
                              <RaceFeaturePreviewSvg 
                                featureId={race.id} 
                                skinColor={selectedSkinTone} 
                                hairColor={selectedHairColor} 
                              />
                            </div>
                            <div className="text-center w-full mt-1">
                              <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate">{race.name}</p>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">{race.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {bodySubTab === 'scale' && (
                    <div className="space-y-4">
                      {/* Género con cambio inmediato */}
                      <div className="bg-[#FFF9EE] dark:bg-zinc-900 p-4 rounded-2xl border-2 border-[#E9D9C3] dark:border-zinc-800">
                        <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Identidad de Género del Estudiante
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'female' as const, label: 'Femenino', icon: '♀', emoji: '👧' },
                            { id: 'male' as const, label: 'Masculino', icon: '♂', emoji: '👦' },
                            { id: 'neutral' as const, label: 'Mágico / Neutro', icon: '✦', emoji: '✨' }
                          ].map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              onClick={() => handleGenderSelect(g.id)}
                              className={`p-3 rounded-2xl font-black text-xs flex flex-col items-center gap-1 transition-all cursor-pointer ${
                                selectedGender === g.id
                                  ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-400/40 scale-105'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                              }`}
                            >
                              <span className="text-2xl">{g.emoji}</span>
                              <span>{g.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Escala Corporal */}
                      <div className="bg-[#FFF9EE] dark:bg-zinc-900 p-4 rounded-2xl border-2 border-[#E9D9C3] dark:border-zinc-800">
                        <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 mb-2 block">
                          Altura / Complexión
                        </span>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { id: 'compact' as const, label: 'Compacto (S)', desc: 'Ágil y menudo', scale: '0.85' },
                            { id: 'normal' as const, label: 'Normal (M)', desc: 'Equilibrado', scale: '1.0' },
                            { id: 'tall' as const, label: 'Alto (L)', desc: 'Heroico', scale: '1.15' }
                          ].map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleScaleSelect(s.id)}
                              className={`p-3 rounded-2xl font-bold text-xs flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                                selectedScale === s.id
                                  ? 'bg-purple-600 text-white shadow-lg ring-4 ring-purple-400/40 scale-105'
                                  : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
                              }`}
                            >
                              <span className="text-base font-black font-mono">x{s.scale}</span>
                              <span className="font-black">{s.label}</span>
                              <span className="text-[10px] opacity-80">{s.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* --- CASO 3: CABELLO (ESTILOS Y COLORES EN CUADRÍCULA SQUIRCLE) --- */}
              {mainTab === 'hair' && (
                <div>
                  {hairSubTab === 'styles' ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AVATAR_HAIRSTYLES.map((h) => {
                        const isSelected = selectedHairStyle === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => {
                              setSelectedHairStyle(h.id);
                              updatePhysicalTraits(activeStudentId, { hair_style: h.id });
                              changeAvatar({ hair_style: h.id });
                            }}
                            className={`group relative aspect-square p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                              isSelected
                                ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                                : 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/80 p-0.5 flex items-center justify-center shadow-inner mt-1">
                              <HairPreviewSvg styleId={h.id} color={selectedHairColor} />
                            </div>
                            <div className="text-center w-full mt-1">
                              <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate">{h.name}</p>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">{h.description || 'Anime'}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {AVATAR_HAIR_COLORS.map((hc) => {
                        const hairCol = hc.color || hc.value || '#EC4899';
                        const isSelected = selectedHairColor === hairCol;
                        return (
                          <button
                            key={hc.id}
                            type="button"
                            onClick={() => {
                              setSelectedHairColor(hairCol);
                              updatePhysicalTraits(activeStudentId, { hair_color: hairCol });
                              changeAvatar({ hair_color: hairCol });
                            }}
                            className={`group relative aspect-square p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                              isSelected
                                ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                                : 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                            }`}
                          >
                            {isSelected && (
                              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md z-10">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            )}
                            <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/80 p-1 flex items-center justify-center shadow-inner mt-1">
                              <HairColorPreviewSvg color={hairCol} isSelected={isSelected} />
                            </div>
                            <div className="text-center w-full mt-1">
                              <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate">{hc.name}</p>
                              <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">{hc.description || 'Color'}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* --- CASO 4: OJOS Y EXPRESIÓN (15 OPCIONES VISUALES VECTORIALES) --- */}
              {mainTab === 'eyes' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_EYES_STYLES.map((eye) => {
                    const eyeCol = eye.color || eye.value || '#3B82F6';
                    const isSelected = selectedEyesStyle === eye.id;
                    return (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => {
                          setSelectedEyesStyle(eye.id);
                          updatePhysicalTraits(activeStudentId, { eyes_style: eye.id });
                          changeAvatar({ eyes_style: eye.id });
                        }}
                        className={`group relative aspect-square p-2.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                          isSelected
                            ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                            : 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md z-10">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        {/* Previsualización Vectorial Real de los Ojos Anime */}
                        <div className="w-full flex-1 max-h-[58px] rounded-2xl bg-white/85 dark:bg-zinc-800/90 p-1 flex items-center justify-center shadow-inner mt-0.5">
                          <EyePreviewSvg styleId={eye.id} color={eyeCol} />
                        </div>

                        {/* Título y descripción breve */}
                        <div className="text-center w-full mt-1">
                          <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate">
                            {eye.name}
                          </p>
                          <p className="text-[9px] text-zinc-500 dark:text-zinc-400 truncate">
                            {eye.description || 'Mirada anime'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* --- CASO 5: SOMBREROS & VARITAS MÁGICAS --- */}
              {mainTab === 'hats' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {AVATAR_CLOTHING_ITEMS.filter(item => item.category === 'hat' || item.category === 'accessory').map((item) => {
                    const isOwned = item.isDefault || ownedItems.includes(item.id);
                    const isEquipped = (
                      (item.category === 'hat' && selectedHat === item.id) ||
                      (item.category === 'accessory' && selectedAccessory === item.id)
                    );
                    const canAfford = currentCoins >= item.price;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          if (isOwned) {
                            handleEquip(item.category, item.id);
                          } else {
                            handlePurchase(item);
                          }
                        }}
                        className={`group relative aspect-square p-3 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer shadow-sm hover:scale-105 ${
                          isEquipped
                            ? 'bg-[#FFE6C7] dark:bg-amber-950/60 border-2 border-amber-500 ring-4 ring-amber-400/40 shadow-md'
                            : isOwned
                            ? 'bg-[#FFF9EE] dark:bg-zinc-900 border-2 border-[#E9D9C3] dark:border-zinc-800 hover:border-amber-400'
                            : 'bg-[#FFF9EE]/70 dark:bg-zinc-900/60 border-2 border-dashed border-zinc-300 dark:border-zinc-700'
                        }`}
                      >
                        {isEquipped && (
                          <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}

                        <div className="w-14 h-14 rounded-2xl bg-white/80 dark:bg-zinc-800/90 p-1 flex items-center justify-center shadow-inner mt-1">
                          <ClothingItemPreviewSvg item={item} />
                        </div>

                        <div className="text-center w-full mt-1">
                          <p className="text-[11px] font-black text-zinc-800 dark:text-zinc-200 truncate">
                            {item.name}
                          </p>
                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            {isEquipped ? (
                              <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400">Puesto</span>
                            ) : isOwned ? (
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400">Equipar</span>
                            ) : (
                              <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-0.5">
                                <Coins className="w-3 h-3" />
                                {item.price}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* PANEL DERECHO: ESCENARIO DEL AVATAR CON CÁMARA ZOOM Y ANIMACIONES     */}
          {/* --------------------------------------------------------------------- */}
          <div className="w-full lg:w-[42%] p-5 sm:p-6 flex flex-col items-center justify-between bg-slate-900/50 dark:bg-zinc-950/80">
            
            {/* ESCENARIO / DIORAMA CON ZOOM DINÁMICO Y CONTORNO NEÓN */}
            <div className="relative w-full aspect-[4/5] max-w-[340px] rounded-3xl overflow-hidden shadow-2xl border-4 border-cyan-500/30 bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center select-none">
              
              {/* Sutil resplandor de fondo ambiental */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.15)_0%,rgba(236,72,153,0.1)_50%,transparent_80%)] pointer-events-none" />

              {/* Controles flotantes de la cámara (Zoom In / Zoom Out) */}
              <div className="absolute top-3 left-3 z-30 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-md">
                <button
                  type="button"
                  onClick={() => setCameraZoom('face')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                    cameraZoom === 'face'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                  title="Acercar cámara al rostro para ver ojos, cabello y expresiones"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Rostro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCameraZoom('body')}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                    cameraZoom === 'body'
                      ? 'bg-amber-400 text-black shadow-sm'
                      : 'text-zinc-300 hover:text-white'
                  }`}
                  title="Alejar cámara para ver atuendo y cuerpo entero"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Cuerpo</span>
                </button>
              </div>

              {/* Insignia de Nivel */}
              <div className="absolute top-3 right-3 z-30 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-wider uppercase shadow-md">
                Nivel {stats.level || 1}
              </div>

              {/* CONTENEDOR CON TRANSFORM ZOOM SUAVE Y CONTORNO NEÓN PEGADO A LA SILUETA */}
              <div 
                className="w-full h-full flex items-center justify-center transition-transform duration-500 ease-out neon-hero-contour"
                style={{
                  transform: cameraZoom === 'face' 
                    ? 'scale(1.9) translateY(24%)' 
                    : 'scale(1.05) translateY(0%)',
                  transformOrigin: '50% 50%',
                  willChange: 'transform'
                }}
              >
                <ModularAnimeAvatarSprite
                  gender={selectedGender}
                  skinTone={selectedSkinTone}
                  hairStyle={selectedHairStyle}
                  hairColor={selectedHairColor}
                  eyesStyle={selectedEyesStyle}
                  raceFeature={selectedRaceFeature}
                  bodyScale={selectedScale}
                  equippedShoes={selectedShoes}
                  equippedBottom={selectedBottom}
                  equippedTop={selectedTop}
                  equippedOuterwear={selectedOuterwear}
                  equippedHat={selectedHat}
                  equippedAccessory={selectedAccessory}
                  animationState={previewAnimation}
                  width={240}
                  height={280}
                />
              </div>

              {/* Nombre del avatar clickeable */}
              <div className="absolute bottom-3 inset-x-3 z-30 flex items-center justify-center">
                {isEditingName ? (
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    className="w-48 text-center font-black text-xs bg-white dark:bg-zinc-900 border-2 border-amber-500 rounded-xl px-2 py-1 outline-none text-zinc-900 dark:text-zinc-100 shadow-lg"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-xs font-black flex items-center gap-1.5 shadow-md hover:scale-105 transition-transform"
                  >
                    <span>{avatarName}</span>
                    <span className="text-[10px] text-amber-300">✏️</span>
                  </button>
                )}
              </div>
            </div>

            {/* BOTONES DE PRUEBA DE ANIMACIÓN EN VIVO (HECHIZO, CELEBRAR, REPOSO) */}
            <div className="w-full mt-4 bg-[#EDE1D1] dark:bg-zinc-900/80 p-2.5 rounded-2xl border border-[#D8C6B1] dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-2 text-center">
                Probar Animación en Vivo
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => triggerAnim('cast')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    previewAnimation === 'cast'
                      ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/40 scale-105'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Hechizo</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAnim('cheer')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    previewAnimation === 'cheer'
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 scale-105'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 hover:text-amber-600'
                  }`}
                >
                  <PartyPopper className="w-4 h-4" />
                  <span>Celebrar</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAnim('idle')}
                  className={`py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    previewAnimation === 'idle'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/40 scale-105'
                      : 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>Reposo</span>
                </button>
              </div>
            </div>

            {/* Selector Rápido de Género y Altura debajo del Avatar */}
            <div className="w-full mt-3 flex items-center justify-between gap-2">
              <div className="flex-1 bg-[#EDE1D1] dark:bg-zinc-900/80 p-2 rounded-2xl border border-[#D8C6B1] dark:border-zinc-800">
                <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase mb-1">Género</span>
                <div className="flex gap-1">
                  {[
                    { id: 'female' as const, label: '♀ F' },
                    { id: 'male' as const, label: '♂ M' },
                    { id: 'neutral' as const, label: '✦ N' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleGenderSelect(g.id)}
                      className={`flex-1 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                        selectedGender === g.id
                          ? 'bg-blue-600 text-white shadow-sm scale-105'
                          : 'bg-white/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-[#EDE1D1] dark:bg-zinc-900/80 p-2 rounded-2xl border border-[#D8C6B1] dark:border-zinc-800">
                <span className="block text-[9px] text-zinc-500 dark:text-zinc-400 font-bold uppercase mb-1">Altura</span>
                <div className="flex gap-1">
                  {[
                    { id: 'compact' as const, label: 'S' },
                    { id: 'normal' as const, label: 'M' },
                    { id: 'tall' as const, label: 'L' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleScaleSelect(s.id)}
                      className={`flex-1 py-1 rounded-xl text-[10px] font-black transition-all cursor-pointer ${
                        selectedScale === s.id
                          ? 'bg-purple-600 text-white shadow-sm scale-105'
                          : 'bg-white/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* BARRA INFERIOR: BOTÓN APPLY (GUARDAR) Y BACK (VOLVER) (Estilo Referencia)   */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-[#F2E7D5] dark:bg-zinc-900/90 border-t border-[#E3D3BE] dark:border-zinc-800 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleApply}
            className="px-8 py-2.5 rounded-2xl bg-[#FFE6C7] hover:bg-[#FFD8AA] active:scale-95 text-[#633300] font-black text-sm uppercase tracking-wider shadow-md border-2 border-[#DCA876] transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>APPLY (Guardar)</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 rounded-2xl bg-[#FAF3E8] hover:bg-white active:scale-95 text-zinc-700 dark:text-zinc-300 font-black text-sm uppercase tracking-wider shadow-md border-2 border-[#D8C5AE] dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>BACK (Volver)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
