"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { Header } from '@/components/Header';
import { Loader } from '@/components/Loader';
import { useHydration } from '@/hooks/useHydration';
import { 
  Coins, ArrowLeft, Shield, Sparkles, Heart, Bell, ShoppingBag, 
  Footprints, PenTool, BookOpen, Scroll, GlassWater, Wand2, 
  Gem, Clock, Crown, Flame, Eye, Check, X, ChevronRight, 
  Star, Sparkle, Backpack, RefreshCw, ZoomIn, ZoomOut, Zap, ShieldAlert, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ModularAnimeAvatarSprite } from '@/components/avatar/ModularAnimeAvatarSprite';
import { AvatarAnimationState } from '@/components/avatar/avatarCustomizationTypes';
import { ShopArtifact, ShopArtifactCategory, ShopArtifactRarity } from '@/types';
import { DEFAULT_ARTIFACTS_SEED } from '@/store/seeds';

// Motor de audio Web Audio API sintetizado para retroalimentación inmediata
function playShopSound(type: 'buy' | 'hover' | 'error' | 'inspect' | 'pose') {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'buy') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.50, now + 0.24);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.start(now);
      osc.stop(now + 0.55);
    } else if (type === 'inspect') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.12);
      gain.gain.setValueAtTime(0.10, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'hover') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    } else if (type === 'error') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.1);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'pose') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.15);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Ignorar si el audio no está habilitado por interacción
  }
}

type ShopViewTab = 'store' | 'inventory' | 'alerts';

export default function MagicShopPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);
  const studentMessages = useStudentStore(state => state.studentMessages);
  const purchaseArtifact = useStudentStore(state => state.purchaseArtifact);
  const markStudentMessageAsRead = useStudentStore(state => state.markStudentMessageAsRead);
  const fetchStats = useStudentStore(state => state.fetchStats);
  const stats = useCurrentStudentStats();
  const avatar = useCurrentStudentAvatar();

  const [activeTab, setActiveTab] = useState<ShopViewTab>('store');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedArtifactForInspect, setSelectedArtifactForInspect] = useState<ShopArtifact | null>(null);

  // Estados del Avatar Cel-Shaded en el escenario
  const [previewAnimation, setPreviewAnimation] = useState<AvatarAnimationState>('idle');
  const [cameraZoom, setCameraZoom] = useState<'full' | 'face'>('full');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && user.role === 'student') {
      fetchStats();
    }
  }, [user, fetchStats]);

  const shopArtifacts = useGamificationStore(state => state.shopArtifacts);

  // Asegurar que siempre se cargue el catálogo de producción si hay caché desactualizada
  useEffect(() => {
    if (!shopArtifacts || shopArtifacts.length === 0 || !shopArtifacts.some(a => a.id === 'art-hp-potion')) {
      useGamificationStore.setState({ shopArtifacts: DEFAULT_ARTIFACTS_SEED });
    }
  }, [shopArtifacts]);

  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);

  const ownedArtifactIds = studentInventoryMap[activeStudentId] || [];
  const activeStudent = detailedStudents?.find(s => s.id === activeStudentId);

  const defaultDialogue = "¡Saludos, noble estudiante! Soy Lyra, la Encantadora de la Bóveda. Aquí puedes canjear tus monedas escolares por reliquias auténticas para tus batallas contra jefes, desafíos pedagógicos y auras mágicas. ¿Qué destino buscas fortalecer hoy?";
  const [fairyDialogue, setFairyDialogue] = useState(defaultDialogue);
  const [tempDialogueTimeout, setTempDialogueTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccessBanner, setPurchaseSuccessBanner] = useState<string | null>(null);
  const isHydrated = useHydration();

  // Helper para diálogos temporales
  const triggerFairyReaction = (text: string) => {
    if (tempDialogueTimeout) clearTimeout(tempDialogueTimeout);
    setFairyDialogue(text);
    const timeout = setTimeout(() => {
      setFairyDialogue(defaultDialogue);
    }, 5000);
    setTempDialogueTimeout(timeout);
  };

  const handlePurchase = async (artifact: ShopArtifact) => {
    if (ownedArtifactIds.includes(artifact.id)) {
      playShopSound('error');
      triggerFairyReaction(`¡Ya portas el "${artifact.name}" en tu mochila! Su poder sagrado ya te acompaña en clase y combate.`);
      return;
    }

    if (stats.coins < artifact.price) {
      playShopSound('error');
      triggerFairyReaction(`¡Aún te faltan monedas escolares para el "${artifact.name}"! Supera quizzes, retos y lecturas para reunir ${artifact.price} monedas.`);
      return;
    }

    try {
      setIsPurchasing(true);
      await purchaseArtifact(activeStudentId, artifact.id);
      playShopSound('buy');
      setPreviewAnimation('cheer');
      triggerFairyReaction(`¡Magnífica elección! El artefacto "${artifact.name}" ahora es tuyo. ¡Úsalo con sabiduría en tus próximas aventuras!`);
      setPurchaseSuccessBanner(`¡Has adquirido "${artifact.name}" con éxito!`);
      setSelectedArtifactForInspect(null);
      setTimeout(() => setPurchaseSuccessBanner(null), 4000);
    } catch (err) {
      console.error(err);
      playShopSound('error');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleHoverItem = (artifact: ShopArtifact) => {
    playShopSound('hover');
    if (tempDialogueTimeout) return;
    triggerFairyReaction(`El artefacto "${artifact.name}" (${artifact.price} monedas): ${artifact.description} ${artifact.detailedEffect || ''}`);
  };

  const handleLeaveHover = () => {
    if (tempDialogueTimeout) return;
    setFairyDialogue(defaultDialogue);
  };

  const categories = [
    { id: 'all', label: 'TODOS', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'rpg_combat', label: 'COMBATE RPG', icon: <Flame className="w-4 h-4 text-rose-400" /> },
    { id: 'academic_challenges', label: 'RETOS & EXAMEN', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'progression_economy', label: 'RACHA & ECONOMÍA', icon: <Shield className="w-4 h-4 text-emerald-400" /> },
    { id: 'sanctuary_companions', label: 'COMPAÑEROS', icon: <Heart className="w-4 h-4 text-pink-400" /> },
    { id: 'avatar_cosmetics', label: 'PRESTIGIO & AURAS', icon: <Crown className="w-4 h-4 text-amber-400" /> },
  ];

  const filteredArtifacts = useMemo(() => {
    if (activeCategory === 'all') return shopArtifacts;
    return shopArtifacts.filter(a => a.category === activeCategory);
  }, [shopArtifacts, activeCategory]);

  const getRarityBadge = (rarity?: ShopArtifactRarity) => {
    switch (rarity) {
      case 'legendary':
        return {
          label: 'Legendario',
          color: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black',
          border: 'border-amber-400/80 shadow-lg shadow-amber-500/20'
        };
      case 'epic':
        return {
          label: 'Épico',
          color: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black',
          border: 'border-purple-400/80 shadow-lg shadow-purple-500/20'
        };
      case 'rare':
        return {
          label: 'Raro',
          color: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-black',
          border: 'border-cyan-400/80 shadow-lg shadow-cyan-500/20'
        };
      case 'common':
      default:
        return {
          label: 'Común',
          color: 'bg-zinc-800 text-zinc-300 font-bold',
          border: 'border-zinc-700/80'
        };
    }
  };

  const getArtifactIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'Shield': return <Shield className="w-6 h-6 text-cyan-400" />;
      case 'GlassWater':
      case 'Wine': return <GlassWater className="w-6 h-6 text-pink-400" />;
      case 'PenTool': return <PenTool className="w-6 h-6 text-amber-400" />;
      case 'Clock': return <Clock className="w-6 h-6 text-blue-400" />;
      case 'Footprints': return <Footprints className="w-6 h-6 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6 text-purple-400" />;
      case 'Heart': return <Heart className="w-6 h-6 text-rose-400" />;
      case 'Gem': return <Gem className="w-6 h-6 text-cyan-300" />;
      case 'Scroll': return <Scroll className="w-6 h-6 text-yellow-300" />;
      case 'Coins': return <Coins className="w-6 h-6 text-yellow-400" />;
      case 'Crown': return <Crown className="w-6 h-6 text-amber-300" />;
      case 'Wand2': return <Wand2 className="w-6 h-6 text-indigo-400" />;
      case 'Shirt': return <Zap className="w-6 h-6 text-indigo-300" />;
      default: return <Sparkles className="w-6 h-6 text-emerald-400" />;
    }
  };

  if (!isHydrated || loading || !user) {
    return <Loader message="Sincronizando Bóveda de Reliquias Mágicas..." />;
  }

  const unreadMessagesCount = studentMessages.filter(m => m.student_id === activeStudentId && !m.is_read).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white select-none font-sans">
      <Header />

      {/* Keyframes de animación visual */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes rune-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes rune-pulse {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.05); }
        }
        @keyframes particle-drift {
          0% { transform: translateY(0px) rotate(0deg); opacity: 0; }
          40% { opacity: 0.9; }
          100% { transform: translateY(-70px) rotate(45deg); opacity: 0; }
        }
        .rune-ring-1 {
          animation: rune-spin 24s linear infinite;
        }
        .rune-ring-2 {
          animation: rune-spin 18s linear infinite reverse;
        }
        .rune-glow {
          animation: rune-pulse 4s ease-in-out infinite;
        }
        .particle-spark {
          animation: particle-drift 4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />

      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 flex flex-col gap-5">
        
        {/* ========================================================================= */}
        {/* BARRA SUPERIOR: RETORNO, PERFIL DEL ESTUDIANTE Y MONEDAS                  */}
        {/* ========================================================================= */}
        <div className="flex flex-wrap justify-between items-center gap-3 p-3.5 rounded-3xl bg-slate-900/70 border border-cyan-500/20 backdrop-blur-xl shadow-xl">
          <div className="flex items-center gap-2.5">
            <Link 
              href="/student"
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-cyan-400" />
              <span>Portal Escolar</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-cyan-950/40 border border-cyan-800/50 text-xs text-cyan-300 font-bold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>{avatar.avatar_name || (activeStudent ? `${activeStudent.first_name} ${activeStudent.last_name_1}` : 'Héroe Escolar')}</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black border border-cyan-500/30">
                Nv. {stats.level || 1}
              </span>
            </div>
          </div>

          {/* Selector de Pestañas Principales */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-950/80 border border-slate-800">
            <button
              onClick={() => { setActiveTab('store'); playShopSound('inspect'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'store'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Reliquias</span>
            </button>

            <button
              onClick={() => { setActiveTab('inventory'); playShopSound('inspect'); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'inventory'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Backpack className="w-3.5 h-3.5" />
              <span>Mi Mochila</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-bold">
                {ownedArtifactIds.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('alerts'); playShopSound('inspect'); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer relative ${
                activeTab === 'alerts'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-900/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Buzón</span>
              {unreadMessagesCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1.5 right-1.5" />
              )}
            </button>
          </div>

          {/* Saldo de Monedas ISkool */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-950/60 to-yellow-950/40 border border-amber-500/50 px-4 py-2 rounded-2xl shadow-lg shadow-amber-500/15">
            <Coins className="h-5 w-5 text-yellow-400 fill-current animate-pulse" />
            <div className="flex flex-col">
              <span className="text-[9px] uppercase tracking-wider text-amber-300/80 font-bold">Tus Monedas</span>
              <span className="text-sm sm:text-base font-black text-yellow-300 leading-tight">
                {stats.coins} <span className="text-xs font-normal text-amber-200/70">🪙</span>
              </span>
            </div>
          </div>
        </div>

        {/* Banner de compra exitosa */}
        {purchaseSuccessBanner && (
          <div className="p-3 rounded-2xl bg-emerald-950/80 border-2 border-emerald-500/70 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-xl animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{purchaseSuccessBanner}</span>
            </div>
            <button 
              onClick={() => setPurchaseSuccessBanner(null)}
              className="text-emerald-400 hover:text-white text-xs font-black"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ESCENARIO MÍSTICO CEL-SHADED: AVATAR EN VIVO + PEDESTAL + LYRA           */}
        {/* ========================================================================= */}
        <div className="relative w-full rounded-[32px] border border-cyan-500/30 bg-gradient-to-b from-indigo-950/90 via-slate-900/90 to-slate-950 p-4 sm:p-6 overflow-hidden shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 min-h-[300px]">
          
          {/* Fondo místico y constelaciones */}
          <div className="absolute inset-0 pointer-events-none opacity-25 z-0">
            <div className="absolute w-96 h-96 -top-20 -left-20 bg-cyan-600/30 rounded-full blur-[100px]" />
            <div className="absolute w-96 h-96 -bottom-20 -right-20 bg-purple-600/30 rounded-full blur-[100px]" />
          </div>

          {/* Partículas místicas flotantes */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="particle-spark absolute left-[20%] top-[80%] w-2 h-2 rounded-full bg-cyan-400 blur-[1px]" style={{ animationDelay: '0s' }} />
            <div className="particle-spark absolute left-[35%] top-[70%] w-1.5 h-1.5 rounded-full bg-amber-400 blur-[1px]" style={{ animationDelay: '1.2s' }} />
            <div className="particle-spark absolute left-[50%] top-[85%] w-2.5 h-2.5 rounded-full bg-purple-400 blur-[1px]" style={{ animationDelay: '2.4s' }} />
            <div className="particle-spark absolute left-[75%] top-[75%] w-2 h-2 rounded-full bg-emerald-400 blur-[1px]" style={{ animationDelay: '0.8s' }} />
            <div className="particle-spark absolute left-[88%] top-[80%] w-1.5 h-1.5 rounded-full bg-yellow-300 blur-[1px]" style={{ animationDelay: '3.1s' }} />
          </div>

          {/* LADO IZQUIERDO: DIÁLOGOS DE LYRA (ENCANTADORA DE LA BÓVEDA) */}
          <div className="relative z-20 flex-1 max-w-xl flex flex-col gap-3">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
              <span>Lyra • Encantadora de la Bóveda Académica</span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-slate-950/85 border-2 border-cyan-500/40 backdrop-blur-xl shadow-2xl relative">
              <div className="absolute -bottom-2 left-8 w-4 h-4 bg-slate-950 border-r-2 border-b-2 border-cyan-500/40 rotate-45" />
              <p className="text-xs sm:text-sm text-slate-100 font-medium leading-relaxed italic">
                "{fairyDialogue}"
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-400">
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <Flame className="w-3 h-3 text-rose-400" /> Daño & Salud para RPG
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <Shield className="w-3 h-3 text-emerald-400" /> Protección de Racha
              </span>
              <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-xl border border-slate-800">
                <Wand2 className="w-3 h-3 text-indigo-400" /> Pistas de IA Pedagógica
              </span>
            </div>
          </div>

          {/* LADO DERECHO: AVATAR CEL-SHADED DEL ESTUDIANTE SOBRE EL PEDESTAL RÚNICO */}
          <div className="relative z-20 flex flex-col items-center justify-center shrink-0 w-64 sm:w-72 h-72">
            
            {/* Controles rápidos de perspectiva y pose flotantes */}
            <div className="absolute top-0 right-0 z-30 flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  setCameraZoom(cameraZoom === 'full' ? 'face' : 'full');
                  playShopSound('pose');
                }}
                className="p-1.5 rounded-full bg-slate-900/80 border border-cyan-400/40 text-cyan-300 hover:scale-105 transition-all text-xs shadow-md"
                title={cameraZoom === 'full' ? 'Acercar Rostro' : 'Cuerpo Entero'}
              >
                {cameraZoom === 'full' ? <ZoomIn className="w-3.5 h-3.5" /> : <ZoomOut className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Pedestal Rúnico Holográfico SVG */}
            <div className="absolute bottom-2 w-52 h-20 pointer-events-none flex items-center justify-center">
              <svg viewBox="0 0 200 60" className="w-full h-full">
                {/* Anillo exterior */}
                <ellipse cx="100" cy="30" rx="90" ry="22" fill="none" stroke="#06B6D4" strokeWidth="1.8" className="rune-ring-1" strokeDasharray="6 6" />
                {/* Anillo intermedio */}
                <ellipse cx="100" cy="30" rx="72" ry="17" fill="none" stroke="#A855F7" strokeWidth="1.5" className="rune-ring-2" strokeDasharray="4 4" />
                {/* Resplandor central del pedestal */}
                <ellipse cx="100" cy="30" rx="55" ry="13" fill="url(#pedestalGlow)" className="rune-glow" />
                <defs>
                  <radialGradient id="pedestalGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.75" />
                    <stop offset="60%" stopColor="#818CF8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>

            {/* Sprite del Avatar 3D Cel-Shaded */}
            <div className="relative w-48 h-56 flex items-center justify-center">
              <ModularAnimeAvatarSprite
                gender={avatar.gender || 'male'}
                skinTone={avatar.skin_tone || '#FED7AA'}
                hairStyle={avatar.hair_style || 'spiky'}
                hairColor={avatar.hair_color || '#111827'}
                eyesStyle={avatar.eyes_style || 'determined'}
                raceFeature={avatar.race_feature || 'human'}
                bodyScale={avatar.body_scale || 'normal'}
                equippedShoes={avatar.equipped_shoes || 'shoes_tan_boots'}
                equippedBottom={avatar.equipped_bottom || 'bottom_ripped_jeans'}
                equippedTop={avatar.equipped_top || 'top_dia_de_muertos'}
                equippedOuterwear={avatar.equipped_outerwear || 'outerwear_none'}
                equippedHat={avatar.equipped_hat || 'hat_snapback_trainer'}
                equippedAccessory={avatar.equipped_accessory || 'acc_none'}
                animationState={previewAnimation}
                showPedestal={false}
                zoom={cameraZoom}
                className="w-full h-full drop-shadow-[0_0_20px_rgba(34,211,238,0.35)]"
              />
            </div>

            {/* Botones de Pose Rápida en la base */}
            <div className="flex items-center gap-1 mt-1 z-30">
              {[
                { id: 'idle' as const, label: 'Reposo' },
                { id: 'cast' as const, label: 'Poder' },
                { id: 'cheer' as const, label: 'Celebrar' }
              ].map((pose) => (
                <button
                  key={pose.id}
                  onClick={() => {
                    setPreviewAnimation(pose.id);
                    playShopSound('pose');
                  }}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase transition-all cursor-pointer ${
                    previewAnimation === pose.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40'
                      : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {pose.label}
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* VISTA 1: MOSTRADOR DE RELIQUIAS (TIENDA ACTIVA)                           */}
        {/* ========================================================================= */}
        {activeTab === 'store' && (
          <div className="flex flex-col gap-4">
            
            {/* Barra de Filtros de Categoría (Idéntica a categorías de Avatar) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setActiveCategory(cat.id);
                      playShopSound('inspect');
                    }}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
                      isActive
                        ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/30 scale-102 ring-2 ring-cyan-300'
                        : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                    }`}
                  >
                    {cat.icon}
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Grid de Artefactos de Producción */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredArtifacts.map((art) => {
                const isOwned = ownedArtifactIds.includes(art.id);
                const hasCoins = stats.coins >= art.price;
                const rarityBadge = getRarityBadge(art.rarity);
                const iconComponent = getArtifactIconComponent(art.icon);

                return (
                  <div
                    key={art.id}
                    onMouseEnter={() => handleHoverItem(art)}
                    onMouseLeave={handleLeaveHover}
                    className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col justify-between gap-3 bg-slate-900/60 backdrop-blur-md relative overflow-hidden group ${
                      isOwned
                        ? 'border-slate-800/80 opacity-75'
                        : `${rarityBadge.border} hover:scale-102 hover:shadow-xl`
                    }`}
                  >
                    {/* Resplandor de fondo de rareza en hover */}
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/15 transition-all" />

                    <div>
                      {/* Cabecera de la tarjeta: Icono + Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner shrink-0 group-hover:scale-110 transition-transform">
                          {iconComponent}
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${rarityBadge.color}`}>
                            {rarityBadge.label}
                          </span>
                          {art.category && (
                            <span className="text-[9px] text-slate-400 uppercase font-bold">
                              {art.category === 'rpg_combat' ? 'Combate RPG' :
                               art.category === 'academic_challenges' ? 'Retos & Examen' :
                               art.category === 'progression_economy' ? 'Racha & XP' :
                               art.category === 'sanctuary_companions' ? 'Santuario' : 'Cosmético'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Título y descripción */}
                      <h3 className="text-sm font-black text-white group-hover:text-cyan-300 transition-colors">
                        {art.name}
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {art.description}
                      </p>

                      {/* Insignia de Efecto Cuantificable */}
                      <div className="mt-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-950/50 border border-cyan-800/40 text-cyan-300 text-[10px] font-bold w-fit">
                        <Zap className="w-3 h-3 text-cyan-400" />
                        <span>{art.effect}</span>
                      </div>
                    </div>

                    {/* Barra inferior: Precio + Acciones */}
                    <div className="border-t border-slate-800/80 pt-3 mt-1 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-yellow-400 font-black text-sm">
                        <Coins className="w-4 h-4 fill-current text-yellow-500" />
                        <span>{art.price}</span>
                        <span className="text-[10px] text-slate-500 font-normal">monedas</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedArtifactForInspect(art);
                            playShopSound('inspect');
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Inspeccionar Reliquia"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {isOwned ? (
                          <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-700 flex items-center gap-1">
                            <Check className="w-3 h-3 text-cyan-400" /> En Mochila
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handlePurchase(art)}
                            disabled={!hasCoins || isPurchasing}
                            className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1 ${
                              hasCoins && !isPurchasing
                                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/30'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-800'
                            }`}
                          >
                            {isPurchasing ? 'Canjeando...' : 'Canjear'}
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 2: MI MOCHILA DE HÉROE (INVENTARIO INTERACTIVO)                      */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Backpack className="w-5 h-5 text-cyan-400" />
                  Mochila de Reliquias del Estudiante
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Posees {ownedArtifactIds.length} de {shopArtifacts.length} artefactos mágicos disponibles.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('store')}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black flex items-center gap-1 hover:bg-cyan-400 transition-all cursor-pointer"
              >
                <span>Visitar Mostrador</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {ownedArtifactIds.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                <Backpack className="w-12 h-12 text-slate-600" />
                <p className="text-sm text-slate-400 font-medium">Aún no has adquirido ningún artefacto en la Bóveda.</p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="px-4 py-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-lg"
                >
                  Explorar Reliquias en Venta
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {ownedArtifactIds.map((artId) => {
                  const art = shopArtifacts.find(a => a.id === artId);
                  if (!art) return null;
                  const rarityBadge = getRarityBadge(art.rarity);
                  const iconComponent = getArtifactIconComponent(art.icon);

                  return (
                    <div
                      key={art.id}
                      className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between gap-3 shadow-md hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          {iconComponent}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`px-2 py-0.2 rounded-full text-[8px] uppercase tracking-wider ${rarityBadge.color}`}>
                              {rarityBadge.label}
                            </span>
                            <span className="text-[9px] text-emerald-400 font-black">Activo en perfil ✓</span>
                          </div>
                          <h4 className="text-xs font-black text-white truncate mt-1">{art.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{art.description}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-cyan-300 font-bold bg-cyan-950/40 px-2 py-0.5 rounded-md border border-cyan-800/30">
                          {art.effect}
                        </span>
                        <span className="text-[10px] text-slate-500 italic">Listo para el próximo reto</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* VISTA 3: BUZÓN DEL GREMIO (ALERTAS Y NOTIFICACIONES)                       */}
        {/* ========================================================================= */}
        {activeTab === 'alerts' && (
          <div className="flex flex-col gap-4 p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md">
            <div className="border-b border-slate-800 pb-3">
              <h2 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-400" />
                Buzón de Mensajes y Alertas del Gremio
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Historial de transacciones, concesiones docentes y avisos del sistema.
              </p>
            </div>

            <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
              {studentMessages.filter(m => m.student_id === activeStudentId).length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500 italic">
                  No hay mensajes ni notificaciones en este momento.
                </div>
              ) : (
                studentMessages
                  .filter(m => m.student_id === activeStudentId)
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                        msg.is_read
                          ? 'border-slate-800/60 bg-slate-950/40 text-slate-400'
                          : 'border-cyan-500/40 bg-cyan-950/20 text-slate-100 shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-extrabold uppercase text-[10px] text-cyan-300">
                          {msg.title}
                        </span>
                        {!msg.is_read && (
                          <button
                            onClick={() => markStudentMessageAsRead(msg.id)}
                            className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold underline"
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                      <p className="text-slate-200 text-xs">{msg.message}</p>
                      <span className="text-[9px] text-slate-500 mt-2 block">
                        {new Date(msg.sent_at).toLocaleString()}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL DE INSPECCIÓN RÚNICA DETALLADA                                      */}
        {/* ========================================================================= */}
        {selectedArtifactForInspect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            <div 
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border-2 border-cyan-500/50 p-6 shadow-2xl flex flex-col gap-4 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setSelectedArtifactForInspect(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Cabecera del modal */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                  {getArtifactIconComponent(selectedArtifactForInspect.icon)}
                </div>
                <div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider ${getRarityBadge(selectedArtifactForInspect.rarity).color}`}>
                    {getRarityBadge(selectedArtifactForInspect.rarity).label}
                  </span>
                  <h3 className="text-base font-black text-white mt-1">
                    {selectedArtifactForInspect.name}
                  </h3>
                  <div className="flex items-center gap-1 text-yellow-400 font-black text-xs mt-0.5">
                    <Coins className="w-3.5 h-3.5 fill-current" />
                    <span>{selectedArtifactForInspect.price} Monedas Escolares</span>
                  </div>
                </div>
              </div>

              {/* Contenido detallado */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2.5">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Efecto Táctico Principal</span>
                  <p className="text-xs text-cyan-300 font-bold mt-0.5">
                    {selectedArtifactForInspect.detailedEffect || selectedArtifactForInspect.effect}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descripción del Saber</span>
                  <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                    {selectedArtifactForInspect.description}
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-400">Balance tras compra:</span>
                  <span className={stats.coins >= selectedArtifactForInspect.price ? 'text-emerald-400' : 'text-rose-400'}>
                    {stats.coins} ➔ {Math.max(0, stats.coins - selectedArtifactForInspect.price)} monedas
                  </span>
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedArtifactForInspect(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
                >
                  Regresar
                </button>

                {ownedArtifactIds.includes(selectedArtifactForInspect.id) ? (
                  <button
                    disabled
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-400 text-xs font-black uppercase border border-slate-700 cursor-not-allowed"
                  >
                    Ya en tu Mochila
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handlePurchase(selectedArtifactForInspect)}
                    disabled={stats.coins < selectedArtifactForInspect.price || isPurchasing}
                    className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                      stats.coins >= selectedArtifactForInspect.price && !isPurchasing
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/50'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isPurchasing ? 'Procesando...' : `Confirmar Canje (${selectedArtifactForInspect.price} Monedas)`}
                  </button>
                )}
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
