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
  Crown,
  Star,
  Tag,
  ArrowLeft,
  Eye,
  Scissors
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
  AvatarClothingItem,
  AvatarAnimationState
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

type AvatarStudioCategory = 
  | 'appearance' 
  | 'featured' 
  | 'poses' 
  | 'hats' 
  | 'accessories' 
  | 'tops' 
  | 'outerwear' 
  | 'bottoms' 
  | 'footwear';

export const AvatarCustomizer: React.FC<AvatarCustomizerProps> = ({ isOpen, onClose }) => {
  const avatar = useCurrentStudentAvatar();
  const stats = useCurrentStudentStats();
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const updatePhysicalTraits = useStudentStore(state => state.updatePhysicalTraits);
  const equipClothingItem = useStudentStore(state => state.equipClothingItem);
  const purchaseClothingItem = useStudentStore(state => state.purchaseClothingItem);

  // Categoría activa de la barra lateral
  const [activeCategory, setActiveCategory] = useState<AvatarStudioCategory>('appearance');
  
  // Sub-categoría de Apariencia (Rostro, Cabello, Ojos, Piel, etc.)
  const [appearanceSubTab, setAppearanceSubTab] = useState<'skin' | 'hair' | 'hair_color' | 'eyes' | 'races' | 'body'>('skin');

  // Modo de Cámara: Cuerpo entero vs Rostro
  const [cameraZoom, setCameraZoom] = useState<'full' | 'face'>('full');

  // Estados locales para respuesta inmediata sin lag
  const [selectedGender, setSelectedGender] = useState<'female' | 'male' | 'neutral'>(avatar.gender || 'female');
  const [selectedScale, setSelectedScale] = useState<'compact' | 'normal' | 'tall'>(avatar.body_scale || 'normal');
  const [selectedSkinTone, setSelectedSkinTone] = useState(avatar.skin_tone || '#FED7AA');
  const [selectedHairStyle, setSelectedHairStyle] = useState(avatar.hair_style || 'spiky');
  const [selectedHairColor, setSelectedHairColor] = useState(avatar.hair_color || '#FBBF24');
  const [selectedEyesStyle, setSelectedEyesStyle] = useState(avatar.eyes_style || 'determined');
  const [selectedRaceFeature, setSelectedRaceFeature] = useState(avatar.race_feature || 'human');

  const [selectedShoes, setSelectedShoes] = useState(avatar.equipped_shoes || 'shoes_tan_boots');
  const [selectedBottom, setSelectedBottom] = useState(avatar.equipped_bottom || 'bottom_ripped_jeans');
  const [selectedTop, setSelectedTop] = useState(avatar.equipped_top || 'top_dia_de_muertos');
  const [selectedOuterwear, setSelectedOuterwear] = useState(avatar.equipped_outerwear || 'outerwear_none');
  const [selectedHat, setSelectedHat] = useState(avatar.equipped_hat || 'hat_snapback_trainer');
  const [selectedAccessory, setSelectedAccessory] = useState(avatar.equipped_accessory || 'acc_red_backpack');

  // Animación / Pose activa
  const [previewAnimation, setPreviewAnimation] = useState<AvatarAnimationState>('idle');
  const [avatarName, setAvatarName] = useState(avatar.avatar_name || 'Entrenador');
  const [isEditingName, setIsEditingName] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Sincronizar estados locales cuando se abre el modal
  useEffect(() => {
    if (isOpen && avatar) {
      setSelectedGender(avatar.gender || 'female');
      setSelectedScale(avatar.body_scale || 'normal');
      setSelectedSkinTone(avatar.skin_tone || '#FED7AA');
      setSelectedHairStyle(avatar.hair_style || 'spiky');
      setSelectedHairColor(avatar.hair_color || '#FBBF24');
      setSelectedEyesStyle(avatar.eyes_style || 'determined');
      setSelectedRaceFeature(avatar.race_feature || 'human');
      setSelectedShoes(avatar.equipped_shoes || 'shoes_tan_boots');
      setSelectedBottom(avatar.equipped_bottom || 'bottom_ripped_jeans');
      setSelectedTop(avatar.equipped_top || 'top_dia_de_muertos');
      setSelectedOuterwear(avatar.equipped_outerwear || 'outerwear_none');
      setSelectedHat(avatar.equipped_hat || 'hat_snapback_trainer');
      setSelectedAccessory(avatar.equipped_accessory || 'acc_red_backpack');
      setAvatarName(avatar.avatar_name || 'Entrenador');
    }
  }, [isOpen, avatar]);

  if (!isOpen) return null;

  const currentCoins = stats.coins ?? 0;
  const ownedItems = avatar.wardrobe_inventory || [
    'shoes_basic', 'shoes_tan_boots',
    'bottom_basic', 'bottom_ripped_jeans',
    'top_basic', 'top_dia_de_muertos',
    'outerwear_none', 'outerwear_fur_duster',
    'hat_none', 'hat_snapback_trainer',
    'acc_none', 'acc_red_backpack'
  ];

  const triggerAnim = (anim: AvatarAnimationState) => {
    setPreviewAnimation(anim);
  };

  // Cambio de categoría del estudio de avatar
  const handleCategorySelect = (cat: AvatarStudioCategory) => {
    setActiveCategory(cat);
    if (cat === 'appearance' && (appearanceSubTab === 'hair' || appearanceSubTab === 'eyes' || appearanceSubTab === 'hair_color')) {
      setCameraZoom('face');
    } else {
      setCameraZoom('full');
    }
  };

  // Cambio de género
  const handleGenderSelect = (newGender: 'female' | 'male' | 'neutral') => {
    setSelectedGender(newGender);
    updatePhysicalTraits(activeStudentId, { gender: newGender });
    changeAvatar({ gender: newGender });
    triggerAnim('cheer');
  };

  // Cambio de escala
  const handleScaleSelect = (newScale: 'compact' | 'normal' | 'tall') => {
    setSelectedScale(newScale);
    updatePhysicalTraits(activeStudentId, { body_scale: newScale });
    changeAvatar({ body_scale: newScale });
  };

  // Manejadores de rasgos físicos reactivos en tiempo real
  const handleSkinToneSelect = (toneId: string) => {
    setSelectedSkinTone(toneId);
    updatePhysicalTraits(activeStudentId, { skin_tone: toneId });
    changeAvatar({ skin_tone: toneId });
  };

  const handleHairStyleSelect = (styleId: string) => {
    setSelectedHairStyle(styleId);
    updatePhysicalTraits(activeStudentId, { hair_style: styleId });
    changeAvatar({ hair_style: styleId });
  };

  const handleHairColorSelect = (colorVal: string) => {
    setSelectedHairColor(colorVal);
    updatePhysicalTraits(activeStudentId, { hair_color: colorVal });
    changeAvatar({ hair_color: colorVal });
  };

  const handleEyesStyleSelect = (eyeId: string) => {
    setSelectedEyesStyle(eyeId);
    updatePhysicalTraits(activeStudentId, { eyes_style: eyeId });
    changeAvatar({ eyes_style: eyeId });
  };

  const handleRaceFeatureSelect = (raceId: string) => {
    setSelectedRaceFeature(raceId);
    updatePhysicalTraits(activeStudentId, { race_feature: raceId });
    changeAvatar({ race_feature: raceId });
  };

  // Equipar prenda
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

  // Comprar prenda
  const handlePurchase = (item: AvatarClothingItem) => {
    const res = purchaseClothingItem(activeStudentId, item.id, item.price);
    if (res.success) {
      handleEquip(item.category, item.id);
      setFeedbackNotice({ msg: `¡Compraste "${item.name}"!`, type: 'success' });
      triggerAnim('cheer');
    } else {
      setFeedbackNotice({ msg: res.reason || 'Monedas insuficientes.', type: 'error' });
    }
    setTimeout(() => setFeedbackNotice(null), 3500);
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

  // Lista de categorías del estudio de avatar (con iconos teal y tarjetas cuadradas)
  const categoryNavItems: { id: AvatarStudioCategory; label: string; icon: React.ReactNode; isNew?: boolean }[] = [
    { 
      id: 'appearance', 
      label: 'APPEARANCE', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      ),
      isNew: true 
    },
    { 
      id: 'featured', 
      label: 'FEATURED', 
      icon: <Star className="w-6 h-6 text-amber-500 fill-amber-400" /> 
    },
    { 
      id: 'poses', 
      label: 'POSES', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M14 6c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm-3 4h2c.55 0 1 .45 1 1v4h1v7h-2v-6h-2v6H9v-7h1v-4c0-.55.45-1 1-1z" />
        </svg>
      )
    },
    { 
      id: 'hats', 
      label: 'HATS', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M12 4C8.69 4 6 6.69 6 10v1H3c-.55 0-1 .45-1 1s.45 1 1 1h18c.55 0 1-.45 1-1s-.45-1-1-1h-3v-1c0-3.31-2.69-6-6-6zm-4 7c0-2.21 1.79-4 4-4s4 1.79 4 4v1H8v-1z" />
        </svg>
      )
    },
    { 
      id: 'accessories', 
      label: 'ACCESSORIES', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="12" cy="18" r="2.5" />
        </svg>
      )
    },
    { 
      id: 'tops', 
      label: 'TOPS', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M21.5 5.5l-4-3C17.2 2.2 16.8 2 16.4 2H7.6c-.4 0-.8.2-1.1.5l-4 3c-.4.3-.6.8-.4 1.3l1.5 4.5c.2.6.8 1 1.4.9l2-.3V20c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V11.9l2 .3c.6.1 1.2-.3 1.4-.9l1.5-4.5c.2-.5 0-1-.5-1.3z" />
        </svg>
      )
    },
    { 
      id: 'outerwear', 
      label: 'OUTERWEAR', 
      icon: <Shirt className="w-6 h-6" /> 
    },
    { 
      id: 'bottoms', 
      label: 'BOTTOMS', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M18 2H6c-.55 0-1 .45-1 1v18c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-8h2v8c0 .55.45 1 1 1h4c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 8h-2V4h2v6zm-6-6v6H9V4h2z" />
        </svg>
      )
    },
    { 
      id: 'footwear', 
      label: 'FOOTWEAR', 
      icon: (
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
          <path d="M2 18h20v2H2zm19.5-6.5c-.83-.83-1.92-1.34-3.1-1.44L14 9.5V5c0-1.1-.9-2-2-2h-3c-1.1 0-2 .9-2 2v6.5l-4.5 1.5c-1.1.37-1.87 1.37-1.98 2.54L0 16h22l-.5-4.5z" />
        </svg>
      )
    }
  ];

  // Filtrar prendas según la categoría seleccionada
  const getItemsForCategory = () => {
    if (activeCategory === 'featured') {
      return AVATAR_CLOTHING_ITEMS.filter(item => 
        item.id === 'top_dia_de_muertos' || 
        item.id === 'outerwear_fur_duster' || 
        item.id === 'bottom_ripped_jeans' || 
        item.id === 'shoes_tan_boots' || 
        item.id === 'hat_snapback_trainer' || 
        item.id === 'acc_red_backpack'
      );
    }
    if (activeCategory === 'tops') return AVATAR_CLOTHING_ITEMS.filter(i => i.category === 'top');
    if (activeCategory === 'bottoms') return AVATAR_CLOTHING_ITEMS.filter(i => i.category === 'bottom');
    if (activeCategory === 'footwear') return AVATAR_CLOTHING_ITEMS.filter(i => i.category === 'shoes');
    if (activeCategory === 'outerwear') return AVATAR_CLOTHING_ITEMS.filter(i => i.category === 'outerwear');
    if (activeCategory === 'hats') return AVATAR_CLOTHING_ITEMS.filter(i => i.category === 'hat');
    if (activeCategory === 'accessories') return AVATAR_CLOTHING_ITEMS.filter(i => i.category === 'accessory');
    return [];
  };

  const currentItems = getItemsForCategory();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full h-full max-w-6xl max-h-[96vh] rounded-[36px] overflow-hidden shadow-2xl flex flex-col bg-gradient-to-b from-[#E0F2FE] via-[#F0FDF4] to-[#E2E8F0] dark:from-slate-950 dark:via-zinc-900 dark:to-slate-950 text-zinc-900 dark:text-zinc-100 border border-cyan-300/40 dark:border-cyan-900/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* CABECERA SUPERIOR ESTILO POKÉMON GO                                       */}
        {/* ========================================================================= */}
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between border-b border-cyan-200/50 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-900/80 backdrop-blur-md shrink-0 z-20">
          {/* Botón circular de retroceso (Estilo Pokémon GO exacto de imagen 2) */}
          <button
            type="button"
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white dark:bg-zinc-800 shadow-md border-2 border-cyan-400 dark:border-cyan-600 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Nombre y Título de Entrenador */}
          <div className="flex items-center gap-2">
            {isEditingName ? (
              <input
                type="text"
                value={avatarName}
                onChange={(e) => setAvatarName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                autoFocus
                className="w-44 text-center font-black text-sm bg-white dark:bg-zinc-900 border-2 border-cyan-500 rounded-xl px-2 py-1 outline-none shadow-md"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-cyan-300 dark:border-zinc-700 shadow-sm hover:scale-102 transition-transform"
              >
                <span className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                  {avatarName}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500 text-white font-bold">
                  Nv. {stats.level || 1}
                </span>
                <span className="text-[11px] text-zinc-400">✏️</span>
              </button>
            )}
          </div>

          {/* Contador de Monedas ISkool */}
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-black shadow-inner">
            <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>{currentCoins} <span className="font-bold">Monedas</span></span>
          </div>
        </div>

        {/* Notificación de feedback */}
        {feedbackNotice && (
          <div className={`px-4 py-2 text-xs font-bold text-center flex items-center justify-center gap-2 shrink-0 ${
            feedbackNotice.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
          }`}>
            <span>{feedbackNotice.msg}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ESCENARIO PRINCIPAL (BARRA LATERAL IZQUIERDA + CATÁLOGO + AVATAR 3D)       */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-row overflow-hidden relative">
          
          {/* ----------------------------------------------------------------------- */}
          {/* 1. BARRA VERTICAL DE CATEGORÍAS (IDÉNTICA A POKÉMON GO IMAGES 1 & 2)     */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-24 sm:w-28 p-2 sm:p-2.5 flex flex-col gap-2 overflow-y-auto scrollbar-none bg-white/60 dark:bg-zinc-950/40 border-r border-cyan-200/50 dark:border-zinc-800/60 shrink-0 z-10">
            {categoryNavItems.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`relative w-full aspect-square rounded-2xl flex flex-col items-center justify-center p-1.5 transition-all cursor-pointer shadow-sm ${
                    isActive
                      ? 'bg-white dark:bg-zinc-800 ring-3 ring-cyan-500 text-cyan-600 dark:text-cyan-400 scale-105 shadow-md'
                      : 'bg-white/90 dark:bg-zinc-900/90 text-cyan-700 dark:text-cyan-400 hover:bg-white hover:scale-102'
                  }`}
                >
                  {/* Badge "NEW" rosa como en imagen 2 */}
                  {cat.isNew && (
                    <span className="absolute -top-1.5 -left-1.5 px-1.5 py-0.2 rounded-full bg-pink-500 text-white text-[9px] font-black tracking-wider uppercase shadow">
                      NEW
                    </span>
                  )}
                  <div className="mb-1">{cat.icon}</div>
                  <span className="text-[9px] font-black uppercase tracking-wider text-center leading-tight">
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 2. ESTANTE / BANDEJA DE ÍTEMS Y PROPIEDADES (EXPANSIÓN FLUIDA)          */}
          {/* ----------------------------------------------------------------------- */}
          <div className="w-72 sm:w-80 p-3 sm:p-4 flex flex-col overflow-y-auto bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md border-r border-cyan-200/60 dark:border-zinc-800/80 shrink-0 z-10">
            
            {/* Título de la sección activa */}
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                <span>✨</span>
                <span>{categoryNavItems.find(c => c.id === activeCategory)?.label || 'ÍTEMS'}</span>
              </h3>
              <span className="text-[10px] text-zinc-500 font-bold">
                {activeCategory === 'appearance' ? 'Personalizar' : `${currentItems.length} opciones`}
              </span>
            </div>

            {/* SECCIÓN A: APARIENCIA (SUB-PESTAÑAS DE CUERPO, CABELLO, OJOS, PIEL) */}
            {activeCategory === 'appearance' && (
              <div className="flex flex-col gap-3">
                {/* Sub-pestañas de rasgos (Grid de 2 filas accesible y visible al 100%) */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl">
                  {[
                    { id: 'skin' as const, label: 'Piel', icon: '🎨' },
                    { id: 'hair' as const, label: 'Pelo', icon: '💇' },
                    { id: 'hair_color' as const, label: 'Color', icon: '🌈' },
                    { id: 'eyes' as const, label: 'Ojos', icon: '👁️' },
                    { id: 'races' as const, label: 'Rasgos', icon: '🧝' },
                    { id: 'body' as const, label: 'Cuerpo', icon: '👤' }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        setAppearanceSubTab(sub.id);
                        if (sub.id === 'hair' || sub.id === 'eyes' || sub.id === 'hair_color' || sub.id === 'races') {
                          setCameraZoom('face');
                        } else {
                          setCameraZoom('full');
                        }
                      }}
                      className={`px-2 py-2 rounded-xl text-[11px] font-black transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        appearanceSubTab === sub.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md'
                          : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50'
                      }`}
                    >
                      <span className="text-xs">{sub.icon}</span>
                      <span className="truncate">{sub.label}</span>
                    </button>
                  ))}
                </div>

                {/* Contenido según sub-pestaña */}
                {appearanceSubTab === 'skin' && (
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_SKIN_TONES.map((tone) => (
                      <button
                        key={tone.id}
                        type="button"
                        onClick={() => handleSkinToneSelect(tone.id)}
                        className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedSkinTone === tone.id
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full shadow-inner border border-black/20" style={{ backgroundColor: tone.value }} />
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{tone.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {appearanceSubTab === 'hair' && (
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_HAIRSTYLES.map((style) => (
                      <button
                        key={style.id}
                        type="button"
                        onClick={() => handleHairStyleSelect(style.id)}
                        className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedHairStyle === style.id
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="w-10 h-10">
                          <HairPreviewSvg styleId={style.id} color={selectedHairColor} />
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{style.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {appearanceSubTab === 'hair_color' && (
                  <div className="grid grid-cols-3 gap-2">
                    {AVATAR_HAIR_COLORS.map((col) => (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleHairColorSelect(col.value || col.id)}
                        className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedHairColor === (col.value || col.id)
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-full shadow-inner border border-black/20" style={{ backgroundColor: col.value }} />
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{col.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {appearanceSubTab === 'eyes' && (
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_EYES_STYLES.map((eye) => (
                      <button
                        key={eye.id}
                        type="button"
                        onClick={() => handleEyesStyleSelect(eye.id)}
                        className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedEyesStyle === eye.id
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="w-14 h-8">
                          <EyePreviewSvg styleId={eye.id} />
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{eye.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {appearanceSubTab === 'races' && (
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_RACE_FEATURES.map((race) => (
                      <button
                        key={race.id}
                        type="button"
                        onClick={() => handleRaceFeatureSelect(race.id)}
                        className={`p-2 rounded-2xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          selectedRaceFeature === race.id
                            ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 ring-2 ring-cyan-400'
                            : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800'
                        }`}
                      >
                        <div className="w-10 h-10">
                          <RaceFeaturePreviewSvg featureId={race.id} />
                        </div>
                        <span className="text-[10px] font-bold text-center leading-tight truncate w-full">{race.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {appearanceSubTab === 'body' && (
                  <div className="flex flex-col gap-3">
                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 block mb-2">Género</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'female' as const, label: 'Femenino ♀' },
                          { id: 'male' as const, label: 'Masculino ♂' },
                          { id: 'neutral' as const, label: 'Neutro ✦' }
                        ].map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => handleGenderSelect(g.id)}
                            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              selectedGender === g.id
                                ? 'bg-cyan-500 text-white shadow-md'
                                : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                            }`}
                          >
                            {g.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                      <span className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400 block mb-2">Altura / Proporción</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: 'compact' as const, label: 'Compacto (S)' },
                          { id: 'normal' as const, label: 'Estándar (M)' },
                          { id: 'tall' as const, label: 'Atlético (L)' }
                        ].map((s) => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => handleScaleSelect(s.id)}
                            className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                              selectedScale === s.id
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200'
                            }`}
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECCIÓN B: POSES DE ENTRENADOR */}
            {activeCategory === 'poses' && (
              <div className="flex flex-col gap-2.5">
                {[
                  { id: 'idle' as const, label: 'Reposo Natural', desc: 'Respiración tranquila y postura erguida', icon: '🧍' },
                  { id: 'pose' as const, label: 'Pose de Combate', desc: 'Mano en la cintura y mirada confiada (Postura de Duelo)', icon: '🥋' },
                  { id: 'cast' as const, label: 'Canalización Mágica', desc: 'Brazo levantado y rayos de plasma brillante', icon: '⚡' },
                  { id: 'cheer' as const, label: 'Salto de Victoria', desc: 'Celebración enérgica con sonrisa radiante', icon: '🎉' },
                  { id: 'walk' as const, label: 'Paso de Marcha', desc: 'Animación fluida de exploración', icon: '🚶' }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => triggerAnim(p.id)}
                    className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                      previewAnimation === p.id
                        ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/50 ring-2 ring-cyan-400'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="text-2xl">{p.icon}</span>
                    <div className="flex-1 min-w-0">
                      <span className="font-black text-xs block text-slate-900 dark:text-white">{p.label}</span>
                      <span className="text-[10px] text-zinc-500 block truncate">{p.desc}</span>
                    </div>
                    {previewAnimation === p.id && <Check className="w-4 h-4 text-cyan-500 stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}

            {/* SECCIÓN C: CATÁLOGO DE PRENDAS MODULARES */}
            {activeCategory !== 'appearance' && activeCategory !== 'poses' && (
              <div className="grid grid-cols-1 gap-2.5">
                {currentItems.map((item) => {
                  const isEquipped = 
                    selectedShoes === item.id ||
                    selectedBottom === item.id ||
                    selectedTop === item.id ||
                    selectedOuterwear === item.id ||
                    selectedHat === item.id ||
                    selectedAccessory === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isEquipped && (item.category === 'outerwear' || item.category === 'hat' || item.category === 'accessory') && !item.id.endsWith('_none')) {
                          const noneMap: Record<string, string> = {
                            outerwear: 'outerwear_none',
                            hat: 'hat_none',
                            accessory: 'acc_none'
                          };
                          handleEquip(item.category, noneMap[item.category] || item.id);
                        } else {
                          handleEquip(item.category, item.id);
                        }
                      }}
                      className={`p-3 rounded-2xl border flex items-center gap-3 transition-all cursor-pointer select-none hover:shadow-md ${
                        isEquipped
                          ? 'border-cyan-500 bg-cyan-50/80 dark:bg-cyan-950/40 ring-2 ring-cyan-400'
                          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 hover:border-cyan-300'
                      }`}
                    >
                      {/* Miniatura SVG */}
                      <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 p-1 flex items-center justify-center shrink-0 border border-zinc-200 dark:border-zinc-700">
                        <ClothingItemPreviewSvg item={item} />
                      </div>

                      {/* Info de prenda */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black block text-slate-900 dark:text-white truncate">
                            {item.name}
                          </span>
                          {item.price > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded-md border border-amber-200/50 dark:border-amber-800/50 shrink-0">
                              <Coins className="w-2.5 h-2.5" />
                              {item.price}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 block truncate mb-1">
                          {item.description}
                        </span>
                        
                        {/* Rarity tag */}
                        <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.2 rounded-full ${
                          item.rarity === 'legendary' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' :
                          item.rarity === 'epic' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          item.rarity === 'rare' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-zinc-100 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-200'
                        }`}>
                          {item.rarity}
                        </span>
                      </div>

                      {/* Botón de acción (Puesto / Usar) */}
                      <div className="shrink-0">
                        {isEquipped ? (
                          (item.category === 'outerwear' || item.category === 'hat' || item.category === 'accessory') && !item.id.endsWith('_none') ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                const noneMap: Record<string, string> = {
                                  outerwear: 'outerwear_none',
                                  hat: 'hat_none',
                                  accessory: 'acc_none'
                                };
                                handleEquip(item.category, noneMap[item.category] || item.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow transition-colors cursor-pointer group"
                              title="Haz clic para quitar esta prenda"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[3] group-hover:hidden" />
                              <span className="group-hover:hidden">Puesto</span>
                              <span className="hidden group-hover:inline">Quitar</span>
                            </button>
                          ) : (
                            <span className="px-3 py-1.5 rounded-xl bg-cyan-500 text-white text-xs font-black flex items-center gap-1 shadow">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Puesto</span>
                            </span>
                          )
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEquip(item.category, item.id);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-700 border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400 text-xs font-black hover:bg-cyan-500 hover:text-white transition-all cursor-pointer shadow-sm flex items-center gap-1"
                          >
                            <span>Usar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* 3. ESCENARIO CENTRAL DEL ENTRENADOR 3D CEL-SHADED SOBRE PEDESTAL         */}
          {/* ----------------------------------------------------------------------- */}
          <div className="flex-1 flex flex-col items-center justify-center relative p-4 overflow-hidden">
            
            {/* Controles flotantes de cámara y perspectiva */}
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <button
                type="button"
                onClick={() => setCameraZoom(cameraZoom === 'full' ? 'face' : 'full')}
                className="px-3 py-1.5 rounded-full bg-white/80 dark:bg-zinc-800/80 backdrop-blur-md border border-cyan-300 dark:border-zinc-700 text-cyan-700 dark:text-cyan-300 text-xs font-bold shadow-md hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {cameraZoom === 'full' ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
                <span>{cameraZoom === 'full' ? 'Enfocar Rostro' : 'Cuerpo Entero'}</span>
              </button>
            </div>

            {/* Selector rápido de Poses flotante en la base */}
            <div className="absolute bottom-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md border border-cyan-300/60 dark:border-zinc-700 shadow-lg">
              {[
                { id: 'idle' as const, label: 'Reposo' },
                { id: 'pose' as const, label: 'Pose' },
                { id: 'cast' as const, label: 'Poder' },
                { id: 'cheer' as const, label: 'Celebrar' }
              ].map((anim) => (
                <button
                  key={anim.id}
                  type="button"
                  onClick={() => triggerAnim(anim.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-black transition-all cursor-pointer ${
                    previewAnimation === anim.id
                      ? 'bg-cyan-500 text-white shadow-md'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  {anim.label}
                </button>
              ))}
            </div>

            {/* AVATAR 3D CEL-SHADED DE CUERPO COMPLETO CON MÁXIMA VISIBILIDAD */}
            <div className="w-full h-full max-h-[85vh] flex items-center justify-center py-2">
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
                showPedestal={false}
                zoom={cameraZoom}
                className="w-full h-full max-h-[84vh]"
              />
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* BARRA INFERIOR DE CONFIRMACIÓN (APPLY / BACK)                              */}
        {/* ========================================================================= */}
        <div className="px-6 py-3.5 bg-white/90 dark:bg-zinc-900/90 border-t border-cyan-200/50 dark:border-zinc-800 flex items-center justify-between shrink-0 z-20">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-2xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-black text-xs uppercase tracking-wider transition-all cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleApply}
            className="px-8 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-450 hover:to-blue-550 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Guardar Aspecto</span>
          </button>
        </div>

      </div>
    </div>
  );
};
