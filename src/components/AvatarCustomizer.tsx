"use client";

import React, { useState } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar } from '../store/useStudentStore';
import { 
  Sparkles, 
  Palette, 
  Check, 
  Lock, 
  Smile, 
  Shirt, 
  Image as ImageIcon,
  Zap,
  PartyPopper,
  User,
  ShoppingBag,
  Coins,
  ChevronRight,
  ShieldCheck,
  X
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

  const [activeTab, setActiveTab] = useState<'traits' | 'hair' | 'eyes' | 'wardrobe' | 'background'>('traits');
  const [clothingCategory, setClothingCategory] = useState<ClothingCategory>('top');
  const [previewAnimation, setPreviewAnimation] = useState<'idle' | 'cast' | 'cheer'>('idle');
  const [avatarName, setAvatarName] = useState(avatar.avatar_name || 'LucasAvatar');
  const [isEditingName, setIsEditingName] = useState(false);
  const [shopFeedback, setShopFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const currentCoins = stats.coins ?? 0;
  const ownedItems = avatar.wardrobe_inventory || ['shoes_basic', 'bottom_basic', 'top_basic'];

  const triggerAnim = (anim: 'idle' | 'cast' | 'cheer') => {
    setPreviewAnimation(anim);
    if (anim !== 'idle') {
      setTimeout(() => {
        setPreviewAnimation('idle');
      }, 3200);
    }
  };

  const handleTraitUpdate = (updates: Partial<StudentAvatar>) => {
    updatePhysicalTraits(activeStudentId, updates);
    changeAvatar(updates);
  };

  const handleEquip = (category: ClothingCategory, itemId: string) => {
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

  const handlePurchase = (item: AvatarClothingItem) => {
    const res = purchaseClothingItem(activeStudentId, item.id, item.price);
    if (res.success) {
      handleEquip(item.category, item.id);
      setShopFeedback({ msg: `¡Has adquirido "${item.name}" y te lo equipaste!`, type: 'success' });
      triggerAnim('cheer');
    } else {
      setShopFeedback({ msg: res.reason || 'No se pudo completar la compra.', type: 'error' });
    }
    setTimeout(() => setShopFeedback(null), 3500);
  };

  const handleSave = () => {
    if (avatarName.trim() !== avatar.avatar_name) {
      changeAvatar({ avatar_name: avatarName.trim() });
    }
    onClose();
  };

  const backgroundOptions = [
    { id: 'nebula', name: 'Nébula Cósmica', icon: '🌌' },
    { id: 'forest', name: 'Bosque Mágico', icon: '🌲' },
    { id: 'nature_spirit', name: 'Santuario Ancestral', icon: '🍃' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Personalizar Avatar de Explorador
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 font-mono">
                  RPG 2.0
                </span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Personaliza la apariencia, razas míticas, vestuario y poderes mágicos de tu héroe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* ISkool Coins Counter */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/50 text-amber-600 dark:text-amber-300 text-xs font-black shadow-inner">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{currentCoins} Monedas</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Left Preview, Right Customization */}
        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* Left Preview Column */}
          <div className="w-full lg:w-80 p-5 bg-zinc-50/80 dark:bg-zinc-950/40 border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-between shrink-0">
            {/* Avatar Card */}
            <div className="w-full flex flex-col items-center">
              <div className="relative w-full max-w-[260px] aspect-[4/5] rounded-2xl overflow-hidden shadow-xl border border-zinc-300 dark:border-zinc-700/60 bg-gradient-to-b from-indigo-950/90 via-slate-900 to-zinc-950 flex flex-col items-center justify-end pb-3">
                {/* Background effect */}
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-pink-400 animate-ping" />
                  <div className="absolute top-10 right-6 w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" />
                  <div className="absolute bottom-16 left-8 w-1 h-1 rounded-full bg-amber-300" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(244,114,182,0.15),transparent_70%)]" />
                </div>

                {/* Level badge */}
                <div className="absolute top-3 right-3 z-20 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-wider uppercase">
                  Nivel {stats.level || 1}
                </div>

                {/* Interactive Sprite */}
                <div className="relative z-10 w-full flex items-center justify-center -mb-2">
                  <ModularAnimeAvatarSprite
                    skinTone={avatar.skin_tone || '#FCD34D'}
                    hairStyle={avatar.hair_style || 'spiky_hero'}
                    hairColor={avatar.hair_color || '#4B5563'}
                    eyesStyle={avatar.eyes_style || 'determined'}
                    raceFeature={avatar.race_feature || 'human'}
                    bodyScale={avatar.body_scale || 'normal'}
                    gender={avatar.gender || 'neutral'}
                    equippedShoes={avatar.equipped_shoes || 'shoes_basic'}
                    equippedBottom={avatar.equipped_bottom || 'bottom_basic'}
                    equippedTop={avatar.equipped_top || 'top_basic'}
                    equippedOuterwear={avatar.equipped_outerwear || 'outerwear_none'}
                    equippedHat={avatar.equipped_hat || 'hat_none'}
                    equippedAccessory={avatar.equipped_accessory || 'acc_none'}
                    animationState={previewAnimation}
                    width={220}
                    height={260}
                  />
                </div>
              </div>

              {/* Avatar Name */}
              <div className="mt-3 text-center w-full px-2">
                {isEditingName ? (
                  <input
                    type="text"
                    value={avatarName}
                    onChange={(e) => setAvatarName(e.target.value)}
                    onBlur={() => setIsEditingName(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                    autoFocus
                    className="w-full text-center font-bold text-sm bg-white dark:bg-zinc-800 border border-blue-500 rounded-lg px-2 py-1 outline-none text-zinc-800 dark:text-zinc-100"
                  />
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="group flex items-center justify-center gap-1.5 mx-auto text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:text-blue-500 transition-colors"
                  >
                    <span>{avatarName}</span>
                    <span className="text-[10px] text-zinc-400 group-hover:text-blue-500">✏️</span>
                  </button>
                )}
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Haz clic para cambiar el nombre
                </p>
              </div>
            </div>

            {/* Live Animation Triggers */}
            <div className="w-full mt-4 bg-white/60 dark:bg-zinc-900/60 p-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2 text-center">
                Probar Animación en Vivo
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => triggerAnim('cast')}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    previewAnimation === 'cast'
                      ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30 scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-pink-50 dark:hover:bg-pink-950/40 hover:text-pink-600'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Hechizo</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAnim('cheer')}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    previewAnimation === 'cheer'
                      ? 'bg-amber-500 text-white shadow-md shadow-amber-500/30 scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600'
                  }`}
                >
                  <PartyPopper className="w-3.5 h-3.5" />
                  <span>Celebrar</span>
                </button>

                <button
                  type="button"
                  onClick={() => triggerAnim('idle')}
                  className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-1 transition-all ${
                    previewAnimation === 'idle'
                      ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30 scale-105'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Reposo</span>
                </button>
              </div>
            </div>

            {/* Gender and Body Scale Pickers */}
            <div className="w-full mt-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5">
                <span className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Género</span>
                <div className="flex gap-1">
                  {[
                    { id: 'female', label: '♀ F' },
                    { id: 'male', label: '♂ M' },
                    { id: 'neutral', label: '✦ N' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => handleTraitUpdate({ gender: g.id as any })}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        (avatar.gender || 'neutral') === g.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-1.5">
                <span className="block text-[9px] text-zinc-400 font-bold uppercase mb-1">Altura</span>
                <div className="flex gap-1">
                  {[
                    { id: 'compact', label: 'S' },
                    { id: 'normal', label: 'M' },
                    { id: 'tall', label: 'L' }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleTraitUpdate({ body_scale: s.id as any })}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        (avatar.body_scale || 'normal') === s.id
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Customization Column */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-zinc-900">
            {/* Navigation Tabs */}
            <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 px-5 pt-3 overflow-x-auto shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab('traits')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'traits'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rasgos & Razas (15)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('hair')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'hair'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Cabello & Color (16)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('eyes')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'eyes'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Smile className="w-3.5 h-3.5" />
                <span>Ojos & Expresión (15)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('wardrobe')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'wardrobe'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <Shirt className="w-3.5 h-3.5" />
                <span>Ropero & Tienda ISkool</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('background')}
                className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  activeTab === 'background'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Fondo</span>
              </button>
            </div>

            {/* Shop/Action Feedback Banner */}
            {shopFeedback && (
              <div className={`mx-5 mt-3 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 animate-in slide-in-from-top duration-200 ${
                shopFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}>
                {shopFeedback.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
                <span>{shopFeedback.msg}</span>
              </div>
            )}

            {/* Tab Contents (Scrollable Area) */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* TAB 1: RASGOS Y RAZAS */}
              {activeTab === 'traits' && (
                <div className="space-y-5">
                  {/* Skin Tones */}
                  <div>
                    <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>Tonos de Piel Inclusivos & Fantasía (15)</span>
                    </h4>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {AVATAR_SKIN_TONES.map((tone) => {
                        const toneColor = tone.color || tone.value || '#FED7AA';
                        const isSelected = (avatar.skin_tone || '#FCD34D') === toneColor;
                        return (
                          <button
                            key={tone.id}
                            type="button"
                            onClick={() => handleTraitUpdate({ skin_tone: toneColor })}
                            className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/30 font-bold'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/40'
                            }`}
                          >
                            <span 
                              className="w-5 h-5 rounded-full border border-black/20 shrink-0 shadow-sm"
                              style={{ backgroundColor: toneColor }}
                            />
                            <div className="truncate">
                              <p className="text-[11px] truncate text-zinc-800 dark:text-zinc-200">{tone.name}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Race Features */}
                  <div>
                    <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span>Rasgos Míticos, Orejas & Razas (15)</span>
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVATAR_RACE_FEATURES.map((race) => {
                        const isSelected = (avatar.race_feature || 'human') === race.id;
                        return (
                          <button
                            key={race.id}
                            type="button"
                            onClick={() => handleTraitUpdate({ race_feature: race.id as any })}
                            className={`p-2.5 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                              isSelected
                                ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/20 ring-2 ring-purple-500/30'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/40'
                            }`}
                          >
                            <span className="text-xl shrink-0">{race.icon || race.badgeEmoji || '✨'}</span>
                            <div className="truncate">
                              <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{race.name}</p>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{race.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CABELLO Y COLOR */}
              {activeTab === 'hair' && (
                <div className="space-y-5">
                  {/* Hair Colors */}
                  <div>
                    <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Color de Cabello (15 Tonos)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_HAIR_COLORS.map((hc) => {
                        const hairCol = hc.color || hc.value || '#4B5563';
                        const isSelected = (avatar.hair_color || '#4B5563') === hairCol;
                        return (
                          <button
                            key={hc.id}
                            type="button"
                            onClick={() => handleTraitUpdate({ hair_color: hairCol })}
                            title={hc.name}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-transform hover:scale-110 shadow-sm ${
                              isSelected
                                ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900 border-white'
                                : 'border-black/20'
                            }`}
                            style={{ backgroundColor: hairCol }}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hairstyles */}
                  <div>
                    <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                      Estilo de Cabello (16 Opciones Anime & RPG)
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AVATAR_HAIRSTYLES.map((h) => {
                        const isSelected = (avatar.hair_style || 'spiky_hero') === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            onClick={() => handleTraitUpdate({ hair_style: h.id })}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/30'
                                : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/40'
                            }`}
                          >
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{h.name}</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{h.description || 'Anime'}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: OJOS Y EXPRESIÓN */}
              {activeTab === 'eyes' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Ojos, Miradas & Expresiones Anime (15)
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {AVATAR_EYES_STYLES.map((eye) => {
                      const eyeCol = eye.color || eye.value || '#3B82F6';
                      const isSelected = (avatar.eyes_style || 'determined') === eye.id;
                      return (
                        <button
                          key={eye.id}
                          type="button"
                          onClick={() => handleTraitUpdate({ eyes_style: eye.id })}
                          className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? 'border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/20 ring-2 ring-cyan-500/30'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/40'
                          }`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full mt-0.5 shrink-0 border border-black/20"
                            style={{ backgroundColor: eyeCol }}
                          />
                          <div className="truncate">
                            <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">{eye.name}</p>
                            <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">{eye.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 4: ROPERO Y TIENDA ISKOOL */}
              {activeTab === 'wardrobe' && (
                <div className="space-y-4">
                  {/* Category Filter Buttons */}
                  <div className="flex items-center gap-1.5 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl overflow-x-auto">
                    {[
                      { id: 'shoes' as const, label: 'Zapatos', icon: '👟' },
                      { id: 'bottom' as const, label: 'Pantalón/Falda', icon: '👖' },
                      { id: 'top' as const, label: 'Playera/Camisa', icon: '👕' },
                      { id: 'outerwear' as const, label: 'Chamarra/Capa', icon: '🧥' },
                      { id: 'hat' as const, label: 'Gorros', icon: '🎩' },
                      { id: 'accessory' as const, label: 'Varitas & Poderes', icon: '🪄' }
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setClothingCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                          clothingCategory === cat.id
                            ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Clothing Items Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {AVATAR_CLOTHING_ITEMS.filter(item => item.category === clothingCategory).map((item) => {
                      const isOwned = item.isDefault || ownedItems.includes(item.id);
                      const keyMap: Record<string, string> = {
                        shoes: avatar.equipped_shoes || 'shoes_basic',
                        bottom: avatar.equipped_bottom || 'bottom_basic',
                        top: avatar.equipped_top || 'top_basic',
                        outerwear: avatar.equipped_outerwear || 'outerwear_none',
                        hat: avatar.equipped_hat || 'hat_none',
                        accessory: avatar.equipped_accessory || 'acc_none'
                      };
                      const isEquipped = keyMap[item.category] === item.id;
                      const canAfford = currentCoins >= item.price;

                      return (
                        <div
                          key={item.id}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isEquipped
                              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/40'
                              : isOwned
                                ? 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/40 hover:border-zinc-300'
                                : 'border-zinc-200/70 dark:border-zinc-800/70 bg-white dark:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl shrink-0 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800">
                              {item.icon || item.badgeEmoji || '👗'}
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                                  {item.name}
                                </h5>
                                {item.isDefault && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-bold">
                                    Básico
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            {isEquipped ? (
                              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Puesto</span>
                              </span>
                            ) : isOwned ? (
                              <button
                                type="button"
                                onClick={() => handleEquip(item.category, item.id)}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                              >
                                Equipar
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={!canAfford}
                                onClick={() => handlePurchase(item)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                  canAfford
                                    ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-md shadow-amber-500/20'
                                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed opacity-60'
                                }`}
                              >
                                <Coins className="w-3.5 h-3.5" />
                                <span>{item.price}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: FONDO */}
              {activeTab === 'background' && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                    Fondos Dinámicos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {backgroundOptions.map((bg) => {
                      const isSelected = (avatar.background_style || 'nebula') === bg.id;
                      return (
                        <button
                          key={bg.id}
                          type="button"
                          onClick={() => changeAvatar({ background_style: bg.id })}
                          className={`p-4 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 ring-2 ring-blue-500/30 font-bold'
                              : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/40 dark:bg-zinc-800/40'
                          }`}
                        >
                          <span className="text-3xl">{bg.icon}</span>
                          <span className="text-xs text-zinc-800 dark:text-zinc-200 font-bold">{bg.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Tus prendas e inventario quedan guardados automáticamente en tu perfil ISkool.</span>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2.5 text-sm font-bold bg-zinc-900 hover:bg-zinc-800 text-white rounded-2xl transition-all dark:bg-white dark:hover:bg-zinc-100 dark:text-black shadow-lg cursor-pointer flex items-center gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>

      </div>
    </div>
  );
};
