// src/app/redisenos_gamificados/El_Libro_de_aventuras_y_album/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  BookOpen, 
  MapPin, 
  ShoppingBag, 
  Award, 
  Heart, 
  Star, 
  Coins, 
  Flame, 
  Shield, 
  CheckCircle2, 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Play, 
  X, 
  Smile, 
  Trophy, 
  Gift, 
  Layers, 
  Wand2, 
  Check, 
  ChevronRight, 
  HelpCircle,
  Gem,
  Swords,
  Clock,
  Compass,
  Zap,
  Users
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELO DE DATOS Y PERFILES DE ESTUDIANTES
// ==========================================
interface StudentProfile04 {
  id: string;
  name: string;
  grade: string;
  level: number;
  stars: number;
  coins: number;
  xp: number;
  maxXp: number;
  streakDays: number;
  pipHappiness: number; // 0 - 100
  pipLevel: number;
  equippedItems: {
    companion?: string;
    outfit?: string;
    powerup?: string;
    badge?: string;
  };
  inventory: string[];
  collectedStickers: string[];
  storiesCompleted: number; // sobre 12
  familyMissionGems: number; // 2 de 3
}

const INITIAL_PROFILES_04: StudentProfile04[] = [
  {
    id: 'student-leo',
    name: 'Leo García',
    grade: '2º de Primaria',
    level: 5,
    stars: 350,
    coins: 1250,
    xp: 420,
    maxXp: 500,
    streakDays: 14,
    pipHappiness: 85,
    pipLevel: 5,
    equippedItems: {
      outfit: 'base',
      companion: 'Pip',
      badge: 'Lupa de Explorador'
    },
    inventory: ['item-streak-shield'],
    collectedStickers: ['sticker-whale', 'sticker-dumpling', 'sticker-fox', 'sticker-bear'],
    storiesCompleted: 6,
    familyMissionGems: 2
  },
  {
    id: 'student-sofia',
    name: 'Sofía Morales',
    grade: '1º de Primaria',
    level: 3,
    stars: 210,
    coins: 800,
    xp: 180,
    maxXp: 300,
    streakDays: 8,
    pipHappiness: 92,
    pipLevel: 3,
    equippedItems: {
      outfit: 'base',
      companion: 'Pip',
      badge: 'Libro Abierto'
    },
    inventory: [],
    collectedStickers: ['sticker-whale', 'sticker-dumpling'],
    storiesCompleted: 4,
    familyMissionGems: 1
  },
  {
    id: 'student-mateo',
    name: 'Mateo Hernández',
    grade: '3º de Primaria',
    level: 7,
    stars: 520,
    coins: 2100,
    xp: 640,
    maxXp: 700,
    streakDays: 22,
    pipHappiness: 78,
    pipLevel: 7,
    equippedItems: {
      outfit: 'item-flame-cloak',
      companion: 'item-phoenix',
      badge: 'item-badge-scholar'
    },
    inventory: ['item-flame-cloak', 'item-phoenix', 'item-badge-scholar'],
    collectedStickers: ['sticker-whale', 'sticker-dumpling', 'sticker-fox', 'sticker-bear', 'sticker-dragon', 'sticker-starfish'],
    storiesCompleted: 9,
    familyMissionGems: 3
  }
];

// Estampas Holográficas del Álbum
interface StickerItem {
  id: string;
  name: string;
  symbol: string;
  rarity: 'Común' | 'Rara' | 'Holográfica Legendaria';
  subject: string;
  lore: string;
  gradient: string;
}

const ALBUM_STICKERS: StickerItem[] = [
  {
    id: 'sticker-whale',
    name: 'Ballena Cósmica Estelar',
    symbol: '🐋',
    rarity: 'Holográfica Legendaria',
    subject: 'Ciencias Naturales · Vida Marina',
    lore: 'Navega por los océanos y constelaciones. Nos enseña cómo respiran los cetáceos con pulmones y cómo migran miles de kilómetros en el Golfo de California.',
    gradient: 'from-blue-600 via-indigo-500 to-cyan-400'
  },
  {
    id: 'sticker-dumpling',
    name: 'Pancito Tierno Kawaii',
    symbol: '🥟',
    rarity: 'Rara',
    subject: 'Lenguajes · Sabores del Mundo',
    lore: 'Elaborado al vapor con harina y amor. Representa la diversidad gastronómica de las culturas de Oriente y la importancia de la nutrición balanceada.',
    gradient: 'from-amber-400 via-orange-400 to-yellow-300'
  },
  {
    id: 'sticker-fox',
    name: 'Zorro Ígneo de Cola Flamígera',
    symbol: '🦊',
    rarity: 'Holográfica Legendaria',
    subject: 'Saberes Científicos · Adaptación',
    lore: 'Su pelaje irradia luz mágica de conocimiento. Es un maestro de la astucia, la rapidez de cálculo y el respeto a la fauna silvestre de los bosques.',
    gradient: 'from-orange-500 via-amber-500 to-rose-500'
  },
  {
    id: 'sticker-bear',
    name: 'Osito de Cristal Galáctico',
    symbol: '🐻',
    rarity: 'Holográfica Legendaria',
    subject: 'Pensamiento Matemático · Simetría',
    lore: 'Hecho de cuarzo arcoíris pulido. Guarda los secretos de los prismas de luz y los patrones geométricos que encontramos en los copos de nieve.',
    gradient: 'from-cyan-400 via-purple-400 to-pink-400'
  }
];

// Ítems de la Tienda de Recompensas (Imagen 3)
interface StoreProduct {
  id: string;
  name: string;
  englishName: string;
  category: 'companions' | 'skins' | 'powerups' | 'badges';
  categoryLabel: string;
  price: number;
  icon: string;
  visualPreview: string;
  description: string;
  perk: string;
}

const REWARD_STORE_ITEMS: StoreProduct[] = [
  // Compañeros Mágicos Flotantes
  {
    id: 'item-phoenix',
    name: 'Polluelo Fénix',
    englishName: 'Phoenix Chick',
    category: 'companions',
    categoryLabel: 'Compañeros Mágicos Flotantes',
    price: 500,
    icon: '🔥',
    visualPreview: 'bg-gradient-to-tr from-amber-500 to-red-500',
    description: 'Ave mística con plumaje radiante que vuela en órbita alrededor de tu pupitre y salón.',
    perk: '+5% de bonus en multiplicador de racha sabia'
  },
  {
    id: 'item-baby-robot',
    name: 'Robot Bebé Asistente',
    englishName: 'Baby Robot',
    category: 'companions',
    categoryLabel: 'Compañeros Mágicos Flotantes',
    price: 450,
    icon: '🤖',
    visualPreview: 'bg-gradient-to-tr from-cyan-500 to-blue-600',
    description: 'Androide mecatrónico chibi con ojos LED que parpadean al acertar operaciones de cálculo.',
    perk: 'Ilumina las pistas difíciles en desafíos matemáticos'
  },
  {
    id: 'item-clay-panda',
    name: 'Panda de Arcilla Suavecito',
    englishName: 'Clay Panda',
    category: 'companions',
    categoryLabel: 'Compañeros Mágicos Flotantes',
    price: 400,
    icon: '🐼',
    visualPreview: 'bg-gradient-to-tr from-slate-200 to-amber-700',
    description: 'Compañero modelado en arcilla y pincel de artista que festeja tus lecturas diarias.',
    perk: 'Aumenta la felicidad de Pip en +15%'
  },

  // Atuendos Vestibles para Avatar
  {
    id: 'item-flame-cloak',
    name: 'Capa de Llama Elemental',
    englishName: 'Elemental Flame Cloak',
    category: 'skins',
    categoryLabel: 'Atuendos Vestibles para Avatar',
    price: 750,
    icon: '🧣',
    visualPreview: 'bg-gradient-to-tr from-orange-600 to-rose-600',
    description: 'Tejida con fuego etéreo de sabiduría. Resalta tu dedicación en las asambleas escolares.',
    perk: 'Efecto de estela de fuego en el mapa de aventura'
  },
  {
    id: 'item-cyber-jacket',
    name: 'Chamarra Urbana Cyber Anime',
    englishName: 'Cyber Anime Streetwear Jacket',
    category: 'skins',
    categoryLabel: 'Atuendos Vestibles para Avatar',
    price: 650,
    icon: '🧥',
    visualPreview: 'bg-gradient-to-tr from-cyan-600 to-indigo-700',
    description: 'Moda juvenil de alta tecnología con ribetes fluorescentes y escudo escolar bordado.',
    perk: 'Diseño exclusivo con reflejos de neón'
  },
  {
    id: 'item-lab-coat',
    name: 'Bata de Laboratorio con Pines Dorados',
    englishName: 'Lab Coat with Golden Pins',
    category: 'skins',
    categoryLabel: 'Atuendos Vestibles para Avatar',
    price: 550,
    icon: '🥼',
    visualPreview: 'bg-gradient-to-tr from-slate-100 to-emerald-300',
    description: 'Bata de mini-científico con pines de honor por investigaciones y experimentos escolares.',
    perk: '+10% XP en actividades de ciencias naturales'
  },

  // Potenciadores Tácticos
  {
    id: 'item-hourglass',
    name: 'Reloj de Arena de Sabiduría',
    englishName: 'Hourglass of Wisdom',
    category: 'powerups',
    categoryLabel: 'Potenciadores Tácticos',
    price: 300,
    icon: '⏳',
    visualPreview: 'bg-gradient-to-tr from-amber-600 to-yellow-500',
    description: 'Otorga +30 segundos adicionales para reflexionar con calma en acertijos cronometrados.',
    perk: 'Tiempo sereno sin presión en quizzes'
  },
  {
    id: 'item-mana-potion',
    name: 'Poción de Maná Lógico',
    englishName: 'Logic Mana Potion',
    category: 'powerups',
    categoryLabel: 'Potenciadores Tácticos',
    price: 250,
    icon: '🧪',
    visualPreview: 'bg-gradient-to-tr from-blue-400 to-cyan-300',
    description: 'Recarga instantáneamente 5 cristales de maná para lanzar hechizos de luz en la arena.',
    perk: 'Rellena el medidor de energía arcana'
  },
  {
    id: 'item-streak-shield',
    name: 'Ficha de Escudo de Racha',
    englishName: 'Streak Shield Token',
    category: 'powerups',
    categoryLabel: 'Potenciadores Tácticos',
    price: 200,
    icon: '🛡️',
    visualPreview: 'bg-gradient-to-tr from-yellow-500 to-red-500',
    description: 'Protege tu racha diaria si un día no puedes conectarte por fuerza mayor o descanso familiar.',
    perk: 'Blindaje ininterrumpido de racha de estudio'
  },

  // Insignias Holográficas de Logros
  {
    id: 'item-badge-scholar',
    name: 'Insignia Maestro Erudito',
    englishName: 'Master Scholar Badge',
    category: 'badges',
    categoryLabel: 'Insignias Holográficas de Logros',
    price: 1000,
    icon: '🏅',
    visualPreview: 'bg-gradient-to-tr from-yellow-400 to-amber-600',
    description: 'Medalla dorada con corona de laurel y birrete que certifica excelencia académica integral.',
    perk: 'Distintivo conmemorativo en el perfil escolar'
  },
  {
    id: 'item-badge-coding',
    name: 'Insignia Experto en Código',
    englishName: 'Coding Expert Badge',
    category: 'badges',
    categoryLabel: 'Insignias Holográficas de Logros',
    price: 900,
    icon: '🚀',
    visualPreview: 'bg-gradient-to-tr from-blue-600 to-purple-600',
    description: 'Acredita dominio de pensamiento lógico computacional y resolución secuencial de retos.',
    perk: 'Emblema ciber-espacial en la arena'
  },
  {
    id: 'item-badge-team',
    name: 'Insignia Líder de Equipo',
    englishName: 'Team Leader Badge',
    category: 'badges',
    categoryLabel: 'Insignias Holográficas de Logros',
    price: 800,
    icon: '🤝',
    visualPreview: 'bg-gradient-to-tr from-emerald-500 to-teal-700',
    description: 'Reconocimiento otorgado por profesores por fomentar el compañerismo y la armonía en clase.',
    perk: 'Aura verde de liderazgo solidario'
  }
];

export default function LibroAventurasPage() {
  // Estado de Alumnos (3 perfiles independientes)
  const [profiles, setProfiles] = useState<StudentProfile04[]>(INITIAL_PROFILES_04);
  const [activeProfileId, setActiveProfileId] = useState<string>('student-leo');
  
  // Modales
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isBattleOpen, setIsBattleOpen] = useState(false);
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null);
  const [isStoriesModalOpen, setIsStoriesModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFamilyMissionModalOpen, setIsFamilyMissionModalOpen] = useState(false);
  
  // Notificaciones y Confetti
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);
  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(false);

  // Estados de Combate contra el Gólem (Imagen 4)
  const [golemHp, setGolemHp] = useState<number>(80);
  const [playerHp, setPlayerHp] = useState<number>(100);
  const [playerMana, setPlayerMana] = useState<number>(5);
  const [battleAnswerState, setBattleAnswerState] = useState<'idle' | 'casting' | 'hit' | 'victory' | 'error'>('idle');
  const [damageFloater, setDamageFloater] = useState<string | null>(null);
  const [battleExplanation, setBattleExplanation] = useState<string | null>(null);

  // Interacción Mascota Pip
  const [pipSpeech, setPipSpeech] = useState<string>('¡Hola! ¡Vamos a explorar juntos!');
  const [isPipWinking, setIsPipWinking] = useState<boolean>(false);
  const [pipHeartActive, setPipHeartActive] = useState<boolean>(false);

  const activeStudent = profiles.find(p => p.id === activeProfileId) || profiles[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Sonidos
  const playSound = (type: 'click' | 'magic' | 'hit' | 'coin' | 'level') => {
    if (isSoundMuted) return;
    if (type === 'click') gamificationAudio.playClickSound();
    if (type === 'magic') gamificationAudio.playMagicCastSound();
    if (type === 'hit') gamificationAudio.playEnemyHitSound();
    if (type === 'coin') gamificationAudio.playCoinSound();
    if (type === 'level') gamificationAudio.playLevelUpSound();
  };

  // Interactuar con Pip
  const handlePetPip = (action: 'cookie' | 'ball' | 'pet') => {
    playSound('coin');
    setIsPipWinking(true);
    setPipHeartActive(true);
    setTimeout(() => setIsPipWinking(false), 900);
    setTimeout(() => setPipHeartActive(false), 1500);

    let newHappiness = Math.min(100, activeStudent.pipHappiness + 5);
    let speech = '¡Wof! ¡Qué rico!';
    if (action === 'ball') {
      speech = '¡Atrapé la pelota estelar! 🌟';
    } else if (action === 'pet') {
      speech = '¡Ronroneo de alegría! ¡Eres genial!';
    } else {
      speech = '¡Galletita deliciosa! +5% Felicidad';
    }
    setPipSpeech(speech);

    setProfiles(prev => prev.map(p => {
      if (p.id !== activeStudent.id) return p;
      return {
        ...p,
        pipHappiness: newHappiness
      };
    }));
  };

  // Compra en la Tienda (Imagen 3)
  const handlePurchaseStoreItem = (item: StoreProduct) => {
    if (activeStudent.inventory.includes(item.id)) {
      // Si ya lo tiene, equiparlo
      playSound('click');
      setProfiles(prev => prev.map(p => {
        if (p.id !== activeStudent.id) return p;
        return {
          ...p,
          equippedItems: {
            ...p.equippedItems,
            ...(item.category === 'companions' && { companion: item.id }),
            ...(item.category === 'skins' && { outfit: item.id }),
            ...(item.category === 'badges' && { badge: item.id }),
            ...(item.category === 'powerups' && { powerup: item.id })
          }
        };
      }));
      showToast(`¡Equipaste "${item.name}" con éxito en tu entorno!`);
      return;
    }

    if (activeStudent.coins < item.price) {
      showToast(`No tienes suficientes monedas. Necesitas ${item.price} 🪙`);
      return;
    }

    playSound('coin');
    setProfiles(prev => prev.map(p => {
      if (p.id !== activeStudent.id) return p;
      return {
        ...p,
        coins: p.coins - item.price,
        inventory: [...p.inventory, item.id],
        equippedItems: {
          ...p.equippedItems,
          ...(item.category === 'companions' && { companion: item.id }),
          ...(item.category === 'skins' && { outfit: item.id }),
          ...(item.category === 'badges' && { badge: item.id }),
          ...(item.category === 'powerups' && { powerup: item.id })
        }
      };
    }));

    showToast(`¡Compraste y equipaste "${item.name}" (-${item.price} 🪙)!`);
  };

  // Desafío de Hechizos Didácticos (Imagen 4: 24 ÷ 4 = ?)
  const handleSolveSpell = (optionValue: number) => {
    if (battleAnswerState === 'casting' || battleAnswerState === 'victory') return;

    if (optionValue === 6) {
      // ¡Acierto!
      playSound('magic');
      setBattleAnswerState('casting');
      setBattleExplanation('¡Exacto! 4 multiplicado por 6 es 24. ¡El rayo arcano impacta al Gólem!');

      setTimeout(() => {
        playSound('hit');
        setBattleAnswerState('hit');
        setDamageFloater('-80 HP ¡Impacto Crítico!');
        setGolemHp(0);

        setTimeout(() => {
          playSound('level');
          setBattleAnswerState('victory');
          setConfettiActive(true);
          setDamageFloater(null);

          // Premiar al alumno
          setProfiles(prev => prev.map(p => {
            if (p.id !== activeStudent.id) return p;
            return {
              ...p,
              coins: p.coins + 150,
              xp: Math.min(p.maxXp, p.xp + 100),
              stars: p.stars + 5,
              storiesCompleted: Math.min(12, p.storiesCompleted + 1)
            };
          }));

          setTimeout(() => setConfettiActive(false), 5000);
        }, 1200);
      }, 900);
    } else {
      // Error amable
      playSound('click');
      setBattleAnswerState('error');
      setBattleExplanation(`¡Casi! 4 × ${optionValue} = ${4 * optionValue}. Recuerda que buscamos 24. ¡Vuelve a intentarlo!`);
      setTimeout(() => setBattleAnswerState('idle'), 2500);
    }
  };

  const handleResetBattle = () => {
    setGolemHp(80);
    setPlayerHp(100);
    setPlayerMana(5);
    setBattleAnswerState('idle');
    setDamageFloater(null);
    setBattleExplanation(null);
    setConfettiActive(false);
  };

  // Abrir Sobre de Estampas
  const handleOpenNewStickerPack = () => {
    playSound('coin');
    const randomSticker = ALBUM_STICKERS[Math.floor(Math.random() * ALBUM_STICKERS.length)];
    setSelectedSticker(randomSticker);
    setIsAlbumModalOpen(true);
    setConfettiActive(true);
    showToast(`¡Abriste un sobre dorado y obtuviste: "${randomSticker.name}"!`);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 via-sky-300 to-emerald-400 text-slate-900 font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col relative overflow-x-hidden">
      
      {/* Confetti Particle FX */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3.5 h-3.5 rounded-full animate-bounce shadow-md"
              style={{
                left: `${(i * 5.7) % 100}%`,
                top: `${(i * 7.3) % 85}%`,
                backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#eab308'][i % 6],
                animationDuration: `${1 + (i % 3) * 0.4}s`,
                animationDelay: `${(i * 0.08)}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white px-6 py-2.5 rounded-full shadow-2xl border border-amber-400/60 font-bold text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ==========================================
          HEADER SUPERIOR INSTITUCIONAL Y CONMUTADOR
         ========================================== */}
      <header className="bg-sky-500/80 backdrop-blur-md border-b-4 border-sky-600 px-4 py-2.5 shadow-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          
          {/* Botón Volver */}
          <Link
            href="/redisenos_gamificados"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs border-2 border-amber-600 shadow-md transition-transform hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Rediseños</span>
          </Link>

          {/* Conmutador de 3 Alumnos Reales (Requisito 5) */}
          <div className="flex items-center gap-1.5 bg-sky-700/60 p-1 rounded-2xl border border-white/30">
            <span className="text-[10px] font-black uppercase text-sky-100 px-2 hidden sm:inline">
              Alumno:
            </span>
            {profiles.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  playSound('click');
                  setActiveProfileId(p.id);
                  showToast(`Cambiado a perfil de ${p.name} (${p.grade})`);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                  activeProfileId === p.id
                    ? 'bg-amber-400 text-slate-950 shadow-md scale-105 border border-amber-500'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {p.name.split(' ')[0]} <span className="text-[10px] opacity-80 hidden md:inline">({p.grade})</span>
              </button>
            ))}
          </div>

          {/* Cartera Rápida & Mute */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-400 border-2 border-amber-600 text-slate-950 font-black text-xs shadow-sm">
              <Coins className="w-3.5 h-3.5 text-amber-900" />
              <span>{activeStudent.coins.toLocaleString()}</span>
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-xl bg-purple-500 border-2 border-purple-700 text-white font-black text-xs shadow-sm">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              <span>{activeStudent.stars}</span>
            </div>

            <button
              onClick={() => setIsSoundMuted(!isSoundMuted)}
              className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30"
              title={isSoundMuted ? 'Activar sonido' : 'Silenciar'}
            >
              {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* ==========================================
          MARCO PRINCIPAL DEL HUB (IMAGEN 1: STARGAZER'S ADVENTURE)
         ========================================== */}
      <main className="max-w-7xl mx-auto w-full p-3 sm:p-5 flex-1 flex flex-col justify-center">
        
        {/* Gran Marco Estilizado (Contenedor Blanco con Borde Azul) */}
        <div className="bg-sky-100 rounded-3xl p-3 sm:p-5 border-8 border-sky-500 shadow-2xl relative overflow-hidden flex flex-col gap-4">
          
          {/* 1. CABECERA: TÍTULO Y SALUDO A LEO */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-gradient-to-r from-sky-400 via-sky-300 to-indigo-400 p-4 rounded-2xl border-4 border-sky-500 shadow-md">
            
            {/* Logo de Juego */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-1.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-amber-400 border-2 border-white shadow-lg text-white font-black text-lg md:text-2xl tracking-wider uppercase transform -rotate-1">
                ⭐ AVENTURA ESTELAR ⭐
              </div>
              <div>
                <h1 className="text-sm md:text-lg font-black text-sky-950 leading-tight">
                  ¡Hola, {activeStudent.name.split(' ')[0]}! ({activeStudent.grade})
                </h1>
                <p className="text-xs md:text-sm font-bold text-indigo-900">
                  ¡Bienvenido de vuelta a la Aventura del Grimorio!
                </p>
              </div>
            </div>

            {/* Ajustes y Estrellas */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 bg-amber-400 px-4 py-1.5 rounded-2xl border-2 border-amber-600 text-slate-950 font-black text-sm shadow-md">
                <Star className="w-4 h-4 fill-amber-600 text-amber-700" />
                <span>{activeStudent.stars}</span>
              </div>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 flex items-center justify-center font-black text-slate-900 shadow-md transition-transform hover:scale-105"
                title="Ajustes de Sonido y Lectura"
              >
                ⚙️
              </button>

              <button
                onClick={() => showToast(`Perfil de ${activeStudent.name}: Nivel ${activeStudent.level}`)}
                className="w-10 h-10 rounded-2xl bg-amber-400 hover:bg-amber-300 border-2 border-amber-600 flex items-center justify-center font-black text-slate-900 shadow-md transition-transform hover:scale-105"
                title="Perfil del Alumno"
              >
                👤
              </button>
            </div>

          </div>

          {/* 2. BOTONERA DE MADERA TÁCTIL (TABLÓN DE ROBLE) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            
            {/* Botón 1: Leer Historias */}
            <button
              onClick={() => {
                playSound('click');
                setIsStoriesModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 hover:from-amber-500 hover:to-amber-800 text-amber-100 border-4 border-amber-950 shadow-lg flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wide transition-transform hover:scale-105 active:scale-95 text-shadow"
            >
              <BookOpen className="w-5 h-5 text-amber-200" />
              <span>Leer Historias</span>
            </button>

            {/* Botón 2: Misiones */}
            <button
              onClick={() => {
                playSound('click');
                setIsFamilyMissionModalOpen(true);
              }}
              className="p-3 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 hover:from-amber-500 hover:to-amber-800 text-amber-100 border-4 border-amber-950 shadow-lg flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wide transition-transform hover:scale-105 active:scale-95 text-shadow"
            >
              <MapPin className="w-5 h-5 text-emerald-300" />
              <span>Misiones</span>
            </button>

            {/* Botón 3: Jugar con Mascota Pip */}
            <button
              onClick={() => {
                handlePetPip('pet');
              }}
              className="p-3 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 hover:from-amber-500 hover:to-amber-800 text-amber-100 border-4 border-amber-950 shadow-lg flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wide transition-transform hover:scale-105 active:scale-95 text-shadow"
            >
              <span>🐾</span>
              <span>Jugar con Pip</span>
            </button>

            {/* Botón 4: Logros */}
            <button
              onClick={() => {
                playSound('click');
                showToast(`Logros de ${activeStudent.name}: ${activeStudent.collectedStickers.length} Estampas y 4 Insignias`);
              }}
              className="p-3 rounded-2xl bg-gradient-to-b from-amber-600 via-amber-700 to-amber-900 hover:from-amber-500 hover:to-amber-800 text-amber-100 border-4 border-amber-950 shadow-lg flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wide transition-transform hover:scale-105 active:scale-95 text-shadow"
            >
              <Trophy className="w-5 h-5 text-yellow-300" />
              <span>Logros</span>
            </button>

            {/* Botón 5: Tienda de Recompensas (Imagen 3) */}
            <button
              onClick={() => {
                playSound('click');
                setIsStoreOpen(true);
              }}
              className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-gradient-to-b from-rose-600 via-rose-700 to-rose-950 hover:from-rose-500 hover:to-rose-800 text-rose-100 border-4 border-rose-950 shadow-lg flex items-center justify-center gap-2 font-black text-xs md:text-sm uppercase tracking-wide transition-transform hover:scale-105 active:scale-95 animate-pulse"
            >
              <ShoppingBag className="w-5 h-5 text-amber-300" />
              <span>Tienda Real</span>
            </button>

          </div>

          {/* 3. GRID CENTRAL DE MÓDULOS (ÁLBUM, MAPA, MASCOTA PIP) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
            
            {/* =====================================
                COLUMNA IZQUIERDA: COLECCIONABLES & ÁLBUM
               ===================================== */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              
              {/* Caja 1: Álbum Holográfico */}
              <div className="bg-sky-200/90 rounded-2xl p-3.5 border-4 border-amber-500 shadow-md flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-600">
                      Coleccionables
                    </span>
                    <button
                      onClick={handleOpenNewStickerPack}
                      className="text-[11px] font-black text-purple-700 hover:text-purple-900 flex items-center gap-1 underline"
                    >
                      <Gift className="w-3.5 h-3.5 text-purple-600" />
                      <span>Abrir Sobre</span>
                    </button>
                  </div>
                  <h3 className="text-xs md:text-sm font-black text-sky-950 uppercase tracking-tight mb-2">
                    Álbum de Estampas Holográficas
                  </h3>

                  {/* Libro Grimorio con 4 Estampas Vivas */}
                  <div className="bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 rounded-2xl p-3 border-4 border-purple-600 shadow-inner grid grid-cols-2 gap-2 relative overflow-hidden min-h-[170px]">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
                    
                    {ALBUM_STICKERS.map((stk) => {
                      const isCollected = activeStudent.collectedStickers.includes(stk.id);
                      return (
                        <div
                          key={stk.id}
                          onClick={() => {
                            playSound('magic');
                            setSelectedSticker(stk);
                            setIsAlbumModalOpen(true);
                          }}
                          className={`relative group p-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                            isCollected
                              ? 'bg-white/10 hover:bg-white/20 border-2 border-amber-400 shadow-lg hover:scale-105'
                              : 'bg-black/30 border-2 border-dashed border-white/20 opacity-50'
                          }`}
                        >
                          <span className="text-3xl filter drop-shadow-md group-hover:scale-125 transition-transform">
                            {stk.symbol}
                          </span>
                          <span className="text-[10px] font-black text-amber-200 mt-1 line-clamp-1 text-center">
                            {stk.name}
                          </span>
                          {isCollected && (
                            <span className="text-[8px] font-bold text-emerald-300">Coleccionada</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <p className="text-[10px] text-slate-700 font-semibold mt-2 text-center">
                  Toca cualquier estampa para ver su conocimiento pedagógico de la Bóveda Curricular.
                </p>
              </div>

              {/* Caja 2: Mis Insignias */}
              <div className="bg-sky-200/90 rounded-2xl p-3.5 border-4 border-amber-500 shadow-md">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-600 inline-block mb-2">
                  Mis Insignias
                </span>
                
                <div className="grid grid-cols-4 gap-2">
                  <div
                    onClick={() => { playSound('coin'); showToast('Insignia: Lupa de Explorador Curioso'); }}
                    className="p-2 rounded-xl bg-amber-300 hover:bg-amber-200 border-2 border-amber-600 flex flex-col items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-105"
                  >
                    <span className="text-xl">🔍</span>
                    <span className="text-[8px] font-black text-slate-900 mt-0.5">Explora</span>
                  </div>

                  <div
                    onClick={() => { playSound('coin'); showToast('Insignia: Libro del Saber'); }}
                    className="p-2 rounded-xl bg-amber-300 hover:bg-amber-200 border-2 border-amber-600 flex flex-col items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-105"
                  >
                    <span className="text-xl">📖</span>
                    <span className="text-[8px] font-black text-slate-900 mt-0.5">Lectura</span>
                  </div>

                  <div
                    onClick={() => { playSound('coin'); showToast('Insignia: Genio Matemático'); }}
                    className="p-2 rounded-xl bg-amber-300 hover:bg-amber-200 border-2 border-amber-600 flex flex-col items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-105"
                  >
                    <span className="text-xl">➕✖️</span>
                    <span className="text-[8px] font-black text-slate-900 mt-0.5">Cálculo</span>
                  </div>

                  <div
                    onClick={() => { playSound('coin'); showToast('Insignia: Amistad y Compañerismo'); }}
                    className="p-2 rounded-xl bg-amber-300 hover:bg-amber-200 border-2 border-amber-600 flex flex-col items-center justify-center cursor-pointer shadow-sm transition-transform hover:scale-105"
                  >
                    <span className="text-xl">👥</span>
                    <span className="text-[8px] font-black text-slate-900 mt-0.5">Unión</span>
                  </div>
                </div>
              </div>

            </div>

            {/* =====================================
                COLUMNA CENTRAL: MAPA DE AVENTURA & MISIÓN
               ===================================== */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              
              {/* Mapa de Aventura */}
              <div className="bg-sky-200/90 rounded-2xl p-3.5 border-4 border-amber-500 shadow-md flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-600">
                    Mapa de Aventura
                  </span>
                  <span className="text-xs font-black text-indigo-950 bg-sky-300 px-2.5 py-0.5 rounded-full border border-sky-400">
                    {activeStudent.storiesCompleted}/12 Historias
                  </span>
                </div>

                {/* Sendero Curvilíneo Estilo Nintendo */}
                <div className="bg-gradient-to-b from-sky-300 via-indigo-200 to-emerald-200 rounded-2xl p-3 border-2 border-sky-400 relative overflow-hidden min-h-[170px] flex items-center justify-between">
                  
                  {/* Nodo 1: Árbol de Cuentos */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500 border-2 border-emerald-700 flex items-center justify-center text-2xl shadow-md transform hover:scale-110 transition-transform cursor-pointer">
                      🌳
                    </div>
                    <span className="text-[10px] font-black text-slate-900 text-center">Árbol de Cuentos</span>
                    <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 rounded-full">Superado</span>
                  </div>

                  {/* Conector */}
                  <div className="flex-1 h-2 bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full mx-1 z-0 relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border border-amber-600 animate-ping" />
                  </div>

                  {/* Nodo 2: Caverna de Cristal (¡Combate con Gólem!) */}
                  <div 
                    onClick={() => {
                      playSound('magic');
                      setIsBattleOpen(true);
                    }}
                    className="flex flex-col items-center gap-1 z-10 cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 border-4 border-amber-400 flex items-center justify-center text-3xl shadow-xl transform group-hover:scale-110 transition-transform animate-bounce">
                      💎
                    </div>
                    <span className="text-[10px] font-black text-purple-950 text-center">Caverna de Cristal</span>
                    <span className="text-[9px] font-black text-rose-700 bg-rose-200 px-2 py-0.5 rounded-full border border-rose-400 animate-pulse">
                      ¡Batalla Gólem!
                    </span>
                  </div>

                  {/* Conector */}
                  <div className="flex-1 h-2 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full mx-1 z-0" />

                  {/* Nodo 3: Castillo Lunar */}
                  <div className="flex flex-col items-center gap-1 z-10 opacity-75">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-700 border-2 border-indigo-900 flex items-center justify-center text-2xl shadow-md">
                      🏰
                    </div>
                    <span className="text-[10px] font-black text-slate-900 text-center">Castillo Lunar</span>
                    <span className="text-[9px] font-bold text-slate-600 bg-slate-200 px-1.5 rounded-full">Bloqueado</span>
                  </div>

                </div>

                <div className="mt-2 text-center">
                  <button
                    onClick={() => {
                      playSound('magic');
                      setIsBattleOpen(true);
                    }}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-transform hover:scale-105 flex items-center justify-center gap-2 border-2 border-white/50"
                  >
                    <Swords className="w-4 h-4 text-amber-300" />
                    <span>Entrar a la Batalla contra el Gólem (Imagen 4)</span>
                  </button>
                </div>
              </div>

              {/* Misión Actual / Misión Familiar */}
              <div className="bg-sky-200/90 rounded-2xl p-3.5 border-4 border-amber-500 shadow-md">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-600">
                    Misión Actual
                  </span>
                  <span className="text-[10px] font-black text-blue-900 bg-blue-100 px-2 py-0.5 rounded-full border border-blue-300">
                    Misión Familiar
                  </span>
                </div>

                <h3 className="text-sm font-black text-purple-950 uppercase tracking-tight">
                  ¡Explora la Galaxia!
                </h3>
                <p className="text-xs font-bold text-slate-700 mb-2">
                  ¡Encuentra 3 gemas estelares! ¡Colecciona en familia!
                </p>

                {/* Barra de Progreso de Gemas */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-300 h-4 rounded-full overflow-hidden border-2 border-slate-400 p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-500 shadow-inner"
                      style={{ width: `${(activeStudent.familyMissionGems / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-800">
                    {activeStudent.familyMissionGems}/3 Gemas
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-sky-300/80">
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-sm">⭐⭐</span>
                    <span className="text-slate-400 text-sm">⭐</span>
                  </div>
                  <button
                    onClick={() => {
                      playSound('click');
                      setIsFamilyMissionModalOpen(true);
                    }}
                    className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-[11px] shadow-sm transition-transform hover:scale-105"
                  >
                    Ver Desafío Familiar
                  </button>
                </div>
              </div>

            </div>

            {/* =====================================
                COLUMNA DERECHA: MASCOTA PIP (REACTIVO)
               ===================================== */}
            <div className="lg:col-span-3 flex flex-col gap-3">
              
              {/* Tarjeta de Pip */}
              <div className="bg-sky-200/90 rounded-2xl p-3.5 border-4 border-amber-500 shadow-md flex-1 flex flex-col items-center justify-between relative overflow-hidden">
                
                <div className="w-full flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full border border-amber-600">
                    Mascota Compañera
                  </span>
                  <span className="text-xs font-black text-sky-950">Pip</span>
                </div>

                {/* Globo de Diálogo de Pip */}
                <div className="bg-white rounded-2xl p-2.5 shadow-md border-2 border-sky-400 max-w-[200px] text-center my-1 relative animate-in fade-in">
                  <p className="text-[11px] font-bold text-slate-800 leading-tight">
                    {pipSpeech}
                  </p>
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r-2 border-b-2 border-sky-400 transform rotate-45" />
                </div>

                {/* Pip SVG Animado (Alien Puppy) */}
                <div 
                  onClick={() => handlePetPip('pet')}
                  className="relative cursor-pointer group my-2"
                  title="¡Haz clic para acariciar a Pip!"
                >
                  {/* Corazón Flotante */}
                  {pipHeartActive && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-2xl animate-bounce z-20">
                      💖
                    </div>
                  )}

                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 border-4 border-white shadow-xl flex items-center justify-center text-6xl relative transform group-hover:scale-105 transition-transform">
                    {/* Expresión de Pip */}
                    <span>{isPipWinking ? '🐶' : '🐕'}</span>
                    
                    {/* Antenas alienígenas de Pip */}
                    <div className="absolute -top-3 left-4 w-2 h-4 bg-sky-400 rounded-full border border-white transform -rotate-12" />
                    <div className="absolute -top-3 right-4 w-2 h-4 bg-sky-400 rounded-full border border-white transform rotate-12" />
                  </div>
                </div>

                {/* Botoncitos de Acción con Pip */}
                <div className="flex items-center gap-2 mb-2">
                  <button
                    onClick={() => handlePetPip('cookie')}
                    className="p-2 rounded-xl bg-amber-400 hover:bg-amber-300 border border-amber-600 text-xs font-black shadow-sm"
                    title="Alimentar con galleta mágica"
                  >
                    🍪 Galleta
                  </button>
                  <button
                    onClick={() => handlePetPip('ball')}
                    className="p-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 border border-emerald-600 text-xs font-black shadow-sm"
                    title="Jugar a la pelota"
                  >
                    🎾 Pelota
                  </button>
                </div>

                {/* Medidor de Felicidad de Pip */}
                <div className="w-full bg-white/80 rounded-xl p-2.5 border-2 border-sky-300">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase text-slate-700">Felicidad de Pip:</span>
                    <span className="text-xs font-black text-emerald-600">{activeStudent.pipHappiness}%</span>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-sm mb-1.5">
                    <span>⭐⭐⭐⭐</span>
                    <Smile className="w-4 h-4 text-amber-500 ml-1" />
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-black text-slate-800">
                    <span>Nivel de Vínculo:</span>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-300">
                      Nivel {activeStudent.pipLevel}
                    </span>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

      {/* ==========================================
          MODAL 1: TIENDA DE RECOMPENSAS (IMAGEN 3)
         ========================================== */}
      {isStoreOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-gradient-to-b from-[#2a1708] via-[#1c1005] to-[#0d0702] border-4 border-amber-500/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header de la Tienda de Recompensas */}
            <div className="px-6 py-4 border-b border-amber-500/30 flex items-center justify-between bg-black/40">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-amber-300 tracking-wide uppercase flex items-center gap-2">
                  <ShoppingBag className="w-6 h-6 text-amber-400" />
                  Tienda de Recompensas (Reward Store)
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-amber-200/80 uppercase">
                    Monedas Disponibles:
                  </span>
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm">
                    <span>🪙</span>
                    <span>{activeStudent.coins.toLocaleString()} GC</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('click');
                  setIsStoreOpen(false);
                }}
                className="w-10 h-10 rounded-2xl bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/40 text-amber-300 flex items-center justify-center font-black transition-transform hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Catálogo con las 4 Repisas de Cristal (Imagen 3) */}
            <div className="p-4 md:p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Repisa 1: Compañeros Mágicos Flotantes */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>✨</span> Compañeros Mágicos Flotantes (Magical Floating Companions)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {REWARD_STORE_ITEMS.filter(i => i.category === 'companions').map(item => {
                    const isOwned = activeStudent.inventory.includes(item.id);
                    const isEquipped = activeStudent.equippedItems.companion === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-amber-400 transition-all shadow-lg hover:shadow-amber-500/10"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-20 h-20 rounded-2xl ${item.visualPreview} flex items-center justify-center text-4xl shadow-inner border border-white/20 mb-3 transform hover:scale-110 transition-transform`}>
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <span className="text-[10px] text-amber-300/70 font-semibold">{item.englishName}</span>
                          <p className="text-xs text-amber-100/70 mt-1 line-clamp-2">{item.description}</p>
                          <span className="text-[10px] font-bold text-emerald-400 mt-1">{item.perk}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                            <span>🪙</span>
                            <span>{item.price} GC</span>
                          </div>

                          <button
                            onClick={() => handlePurchaseStoreItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                              isEquipped
                                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                                : isOwned
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 border border-sky-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950'
                            }`}
                          >
                            {isEquipped ? 'Equipado' : isOwned ? 'Equipar' : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Repisa 2: Atuendos Vestibles para Avatar */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>👘</span> Atuendos Vestibles para Avatar (Wearable Avatar Skins)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {REWARD_STORE_ITEMS.filter(i => i.category === 'skins').map(item => {
                    const isOwned = activeStudent.inventory.includes(item.id);
                    const isEquipped = activeStudent.equippedItems.outfit === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-amber-400 transition-all shadow-lg hover:shadow-amber-500/10"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-20 h-20 rounded-2xl ${item.visualPreview} flex items-center justify-center text-4xl shadow-inner border border-white/20 mb-3 transform hover:scale-110 transition-transform`}>
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <span className="text-[10px] text-amber-300/70 font-semibold">{item.englishName}</span>
                          <p className="text-xs text-amber-100/70 mt-1 line-clamp-2">{item.description}</p>
                          <span className="text-[10px] font-bold text-emerald-400 mt-1">{item.perk}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                            <span>🪙</span>
                            <span>{item.price} GC</span>
                          </div>

                          <button
                            onClick={() => handlePurchaseStoreItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                              isEquipped
                                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                                : isOwned
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 border border-sky-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950'
                            }`}
                          >
                            {isEquipped ? 'Equipado' : isOwned ? 'Equipar' : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Repisa 3: Potenciadores Tácticos */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>⚡</span> Potenciadores Tácticos (Tactical Power-Ups)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {REWARD_STORE_ITEMS.filter(i => i.category === 'powerups').map(item => {
                    const isOwned = activeStudent.inventory.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-amber-400 transition-all shadow-lg hover:shadow-amber-500/10"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-20 h-20 rounded-2xl ${item.visualPreview} flex items-center justify-center text-4xl shadow-inner border border-white/20 mb-3 transform hover:scale-110 transition-transform`}>
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <span className="text-[10px] text-amber-300/70 font-semibold">{item.englishName}</span>
                          <p className="text-xs text-amber-100/70 mt-1 line-clamp-2">{item.description}</p>
                          <span className="text-[10px] font-bold text-emerald-400 mt-1">{item.perk}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                            <span>🪙</span>
                            <span>{item.price} GC</span>
                          </div>

                          <button
                            onClick={() => handlePurchaseStoreItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                              isOwned
                                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950'
                            }`}
                          >
                            {isOwned ? 'Adquirido' : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Repisa 4: Insignias Holográficas de Logros */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🎖️</span> Insignias Holográficas de Logros (Holographic Badges)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {REWARD_STORE_ITEMS.filter(i => i.category === 'badges').map(item => {
                    const isOwned = activeStudent.inventory.includes(item.id);
                    const isEquipped = activeStudent.equippedItems.badge === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-amber-950/30 border border-amber-500/40 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md hover:border-amber-400 transition-all shadow-lg hover:shadow-amber-500/10"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className={`w-20 h-20 rounded-2xl ${item.visualPreview} flex items-center justify-center text-4xl shadow-inner border border-white/20 mb-3 transform hover:scale-110 transition-transform`}>
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <span className="text-[10px] text-amber-300/70 font-semibold">{item.englishName}</span>
                          <p className="text-xs text-amber-100/70 mt-1 line-clamp-2">{item.description}</p>
                          <span className="text-[10px] font-bold text-emerald-400 mt-1">{item.perk}</span>
                        </div>

                        <div className="mt-4 pt-3 border-t border-amber-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-amber-400 font-black text-xs">
                            <span>🪙</span>
                            <span>{item.price} GC</span>
                          </div>

                          <button
                            onClick={() => handlePurchaseStoreItem(item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${
                              isEquipped
                                ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                                : isOwned
                                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 border border-sky-400'
                                : 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950'
                            }`}
                          >
                            {isEquipped ? 'Portando' : isOwned ? 'Portar' : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: BATALLA DIDÁCTICA CONTRA EL GÓLEM (IMAGEN 4)
         ========================================== */}
      {isBattleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-5xl bg-gradient-to-b from-emerald-950 via-slate-900 to-sky-950 border-4 border-emerald-500/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header de Combate */}
            <div className="px-6 py-3 border-b border-emerald-500/30 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-4">
                {/* HUD Monedas y Estrellas en Combate */}
                <div className="flex items-center gap-1 bg-amber-400 px-3 py-1 rounded-xl text-slate-950 font-black text-xs border border-amber-600 shadow-sm">
                  <span>🪙</span>
                  <span>200</span>
                </div>
                <div className="flex items-center gap-1 bg-amber-500 px-3 py-1 rounded-xl text-slate-950 font-black text-xs border border-amber-600 shadow-sm">
                  <span>⭐</span>
                  <span>x3</span>
                </div>
                <div className="flex items-center gap-1 bg-cyan-500 px-3 py-1 rounded-xl text-slate-950 font-black text-xs border border-cyan-600 shadow-sm">
                  <span>💎</span>
                  <span>0</span>
                </div>
              </div>

              {/* Minimapa e Indicadores */}
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-xl bg-purple-900/60 border border-purple-400 text-purple-200 text-xs font-bold flex items-center gap-1">
                  <span>🗺️</span>
                  <span>Bosque Ancestral</span>
                </div>

                <button
                  onClick={() => {
                    playSound('click');
                    setIsBattleOpen(false);
                  }}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Escenario de Batalla */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1 flex flex-col justify-between gap-4 relative">
              
              {/* Parte Superior: Vida del Gólem & Multiplicador Combo */}
              <div className="flex items-start justify-between gap-4">
                
                {/* Vacío izquierdo o info de fase */}
                <div className="hidden sm:block">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                    Fase 3 SEP · Primaria Baja (Aritmética Mágica)
                  </span>
                </div>

                {/* Banner de Combo: x3 ¡RACHA SABIA! */}
                <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/30 to-amber-500/20 px-4 py-1.5 rounded-2xl border-2 border-amber-400 text-center flex items-center gap-2 shadow-lg animate-pulse">
                  <span className="text-xl">⭐</span>
                  <div>
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider block">
                      Multiplicador de Combo
                    </span>
                    <span className="text-sm font-black text-white">
                      x3 ¡RACHA SABIA!
                    </span>
                  </div>
                  <span className="text-xl">⭐</span>
                </div>

                {/* Barra de Vida del Forest Golem */}
                <div className="bg-slate-950/80 border-2 border-emerald-500/60 p-3 rounded-2xl shadow-xl min-w-[220px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-emerald-300">Forest Golem</span>
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                      HP: {golemHp}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-3.5 rounded-full overflow-hidden border border-slate-700 p-0.5">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-lime-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${(golemHp / 80) * 100}%` }}
                    />
                  </div>
                </div>

              </div>

              {/* Escenario Central: Maga Chibi vs Silvanus the Forest Golem */}
              <div className="grid grid-cols-2 gap-4 items-center justify-items-center py-4 relative">
                
                {/* Heroína: Maga Chibi con Báculo Brillante */}
                <div className="flex flex-col items-center gap-2">
                  <div className="relative">
                    {/* Efecto de Hechizo Lanzado */}
                    {battleAnswerState === 'casting' && (
                      <div className="absolute -right-16 top-10 text-3xl animate-ping z-30">
                        ⚡
                      </div>
                    )}

                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-400 border-4 border-amber-300 shadow-2xl flex items-center justify-center text-7xl md:text-8xl relative transform hover:scale-105 transition-transform">
                      <span>🧙‍♀️</span>
                      <div className="absolute -top-3 -right-2 text-3xl animate-spin">
                        ✨
                      </div>
                    </div>
                  </div>

                  {/* Vida del Jugador & Cristales de Maná */}
                  <div className="bg-slate-900/90 border border-slate-700 px-3 py-1.5 rounded-2xl flex flex-col items-center gap-1 w-full max-w-[160px]">
                    <div className="flex items-center gap-1 text-xs font-black text-rose-400">
                      <Heart className="w-3.5 h-3.5 fill-rose-500" />
                      <span>{playerHp} HP</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(playerMana)].map((_, i) => (
                        <div key={i} className="w-3 h-4 bg-cyan-400 rounded-sm border border-cyan-200 animate-pulse shadow-sm" />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Enemigo: Forest Golem */}
                <div className="flex flex-col items-center gap-2 relative">
                  {/* Daño Flotante */}
                  {damageFloater && (
                    <div className="absolute -top-8 text-rose-400 font-black text-xl animate-bounce z-40 bg-black/80 px-3 py-1 rounded-full border border-rose-500 shadow-2xl">
                      {damageFloater}
                    </div>
                  )}

                  <div className={`w-36 h-36 md:w-44 md:h-44 rounded-3xl bg-gradient-to-tr from-emerald-800 via-stone-700 to-amber-900 border-4 border-emerald-400 shadow-2xl flex items-center justify-center text-8xl md:text-9xl transition-all duration-300 ${
                    battleAnswerState === 'hit' ? 'scale-90 rotate-6 filter brightness-150' : 'hover:scale-105'
                  }`}>
                    <span>{golemHp > 0 ? '🗿' : '🌸'}</span>
                  </div>

                  <span className="text-xs font-black text-emerald-300">
                    {golemHp > 0 ? 'Silvanus · Gólem del Bosque' : '¡Gólem Purificado!'}
                  </span>
                </div>

              </div>

              {/* Banner de Retroalimentación Pedagógica */}
              {battleExplanation && (
                <div className={`p-3 rounded-2xl border text-center text-xs font-bold animate-in fade-in ${
                  battleAnswerState === 'error'
                    ? 'bg-rose-950/70 border-rose-500 text-rose-200'
                    : 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                }`}>
                  {battleExplanation}
                </div>
              )}

              {/* Cuadro de Diálogo Didáctico (¡RESUELVE EL HECHIZO! 24 ÷ 4 = ?) */}
              {golemHp > 0 ? (
                <div className="bg-amber-100 rounded-3xl p-4 md:p-6 border-4 border-amber-500 shadow-2xl text-center space-y-4">
                  <div className="inline-block bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white font-black text-xs md:text-sm px-6 py-1.5 rounded-full border-2 border-white shadow-md uppercase tracking-wider">
                    ¡RESUELVE EL HECHIZO!
                  </div>

                  <h3 className="text-2xl md:text-4xl font-black text-slate-900 tracking-wide">
                    24 ÷ 4 = ?
                  </h3>

                  {/* Las 4 Gemas Táctiles de Respuesta */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                    
                    {/* Gema 1: 4 */}
                    <button
                      onClick={() => handleSolveSpell(4)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-tr from-purple-700 to-fuchsia-500 hover:from-purple-600 hover:to-fuchsia-400 text-white font-black text-xl shadow-lg border-2 border-purple-300 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">💎</span>
                      <span>4</span>
                    </button>

                    {/* Gema 2: 6 (Correcta) */}
                    <button
                      onClick={() => handleSolveSpell(6)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 hover:from-emerald-500 hover:to-green-300 text-white font-black text-xl shadow-xl border-4 border-yellow-300 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center gap-2 ring-4 ring-emerald-400/40 animate-pulse"
                    >
                      <span className="text-lg">💎</span>
                      <span>6</span>
                    </button>

                    {/* Gema 3: 8 */}
                    <button
                      onClick={() => handleSolveSpell(8)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-tr from-rose-700 to-red-500 hover:from-rose-600 hover:to-red-400 text-white font-black text-xl shadow-lg border-2 border-rose-300 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">💎</span>
                      <span>8</span>
                    </button>

                    {/* Gema 4: 12 */}
                    <button
                      onClick={() => handleSolveSpell(12)}
                      className="py-3 px-4 rounded-2xl bg-gradient-to-tr from-blue-700 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-black text-xl shadow-lg border-2 border-blue-300 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <span className="text-lg">💎</span>
                      <span>12</span>
                    </button>

                  </div>
                </div>
              ) : (
                /* Estado de Victoria */
                <div className="bg-slate-900/90 rounded-3xl p-6 border-4 border-amber-400 shadow-2xl text-center space-y-4 animate-in zoom-in-95">
                  <span className="text-5xl">🏆</span>
                  <h3 className="text-2xl font-black text-amber-300 uppercase tracking-wide">
                    ¡Victoria! ¡Has Purificado al Gólem Silvano!
                  </h3>
                  <p className="text-sm text-slate-300 max-w-lg mx-auto">
                    Tu dominio en la división y el cálculo mental ha liberado la Caverna de Cristal. ¡Obtienes recompensas para tu álbum y tu mascota Pip!
                  </p>

                  <div className="flex items-center justify-center gap-4 py-2">
                    <div className="px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-sm">
                      +150 Monedas 🪙
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-400 text-purple-300 font-black text-sm">
                      +100 XP ⭐
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-black text-sm">
                      +1 Gema Estelar 💎
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleResetBattle}
                      className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Volver a Jugar Batalla</span>
                    </button>

                    <button
                      onClick={() => setIsBattleOpen(false)}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg"
                    >
                      Continuar la Aventura
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: FICHA DE ESTAMPA DEL ÁLBUM
         ========================================== */}
      {isAlbumModalOpen && selectedSticker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 border-4 border-amber-400 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center">
            
            <button
              onClick={() => setIsAlbumModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Estampa Grande con Brillo */}
            <div className={`w-32 h-32 rounded-3xl bg-gradient-to-tr ${selectedSticker.gradient} border-4 border-white shadow-2xl flex items-center justify-center text-7xl my-3 transform hover:scale-110 transition-transform animate-pulse`}>
              {selectedSticker.symbol}
            </div>

            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-amber-950/80 px-3 py-0.5 rounded-full border border-amber-500/40 mb-1">
              {selectedSticker.rarity}
            </span>

            <h3 className="text-xl font-black text-white">{selectedSticker.name}</h3>
            <span className="text-xs font-bold text-cyan-300 mb-3">{selectedSticker.subject}</span>

            <p className="text-xs text-slate-300 leading-relaxed bg-white/5 p-3 rounded-2xl border border-white/10 mb-4 text-left">
              <strong>Sabiduría Curricular:</strong> {selectedSticker.lore}
            </p>

            <button
              onClick={() => {
                playSound('coin');
                setIsAlbumModalOpen(false);
                showToast(`¡Estampa "${selectedSticker.name}" pegada en el Grimorio de ${activeStudent.name}!`);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg"
            >
              Pegar en el Gran Grimorio
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 4: LECTOR DE HISTORIAS DEL GRIMORIO
         ========================================== */}
      {isStoriesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-amber-50 border-4 border-amber-800 rounded-3xl shadow-2xl p-6 text-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b-2 border-amber-200 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-amber-800" />
                <h3 className="text-lg font-black text-amber-950">El Gran Grimorio · Capítulos de Aventura</h3>
              </div>
              <button
                onClick={() => setIsStoriesModalOpen(false)}
                className="w-8 h-8 rounded-full bg-amber-200 hover:bg-amber-300 flex items-center justify-center font-bold text-amber-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-amber-100/80 border border-amber-300 hover:bg-amber-200/80 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-900">Capítulo 1: El Reino de las Fracciones</span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">Completado</span>
                </div>
                <p className="text-xs text-amber-900/80">
                  Descubre cómo los panaderos estelares reparten pasteles en mitades y cuartos perfectos para alimentar a los dragones bebés.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-100/80 border border-amber-300 hover:bg-amber-200/80 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-900">Capítulo 2: Los Secretos de la Naturaleza</span>
                  <span className="text-[10px] font-bold bg-amber-300 text-amber-900 px-2 py-0.5 rounded-full">En Curso</span>
                </div>
                <p className="text-xs text-amber-900/80">
                  Acompaña a la Ballena Cósmica a través de los ecosistemas mexicanos y aprende sobre la fotosíntesis y el ciclo del agua.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-100/80 border border-amber-300 opacity-60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-900">Capítulo 3: Héroes de la Historia</span>
                  <span className="text-[10px] font-bold bg-slate-300 text-slate-700 px-2 py-0.5 rounded-full">Bloqueado</span>
                </div>
                <p className="text-xs text-amber-900/80">
                  Cartas epistolares en primera persona donde Don Miguel Hidalgo y Doña Josefa Ortiz narran sus ideales libertarios.
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  playSound('click');
                  setIsStoriesModalOpen(false);
                  setIsBattleOpen(true);
                }}
                className="px-6 py-2.5 rounded-2xl bg-amber-700 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md"
              >
                Iniciar Lectura Interactiva
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 5: DESAFÍO FAMILIAR
         ========================================== */}
      {isFamilyMissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-gradient-to-b from-sky-900 to-indigo-950 border-4 border-amber-400 rounded-3xl shadow-2xl p-6 text-white text-center">
            <button
              onClick={() => setIsFamilyMissionModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-4xl my-2 inline-block">🚀</span>
            <h3 className="text-lg font-black text-amber-300 uppercase">Misión Familiar: ¡Explora la Galaxia!</h3>
            <p className="text-xs text-slate-200 mt-2 leading-relaxed">
              Lee un cuento de 10 minutos con tus papás o hermanos sobre animales marinos. Al terminar, presiona el botón para reclamar la 3ª Gema Estelar.
            </p>

            <div className="my-4 p-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-between text-xs font-bold">
              <span>Progreso de Gemas:</span>
              <span className="text-amber-300 font-black">{activeStudent.familyMissionGems}/3 Completadas</span>
            </div>

            <button
              onClick={() => {
                playSound('level');
                setProfiles(prev => prev.map(p => {
                  if (p.id !== activeStudent.id) return p;
                  return {
                    ...p,
                    familyMissionGems: 3,
                    coins: p.coins + 100,
                    stars: p.stars + 10
                  };
                }));
                setIsFamilyMissionModalOpen(false);
                setConfettiActive(true);
                showToast('¡Misión Familiar Completada! +1 Gema Estelar, +100 🪙 y +10 ⭐');
                setTimeout(() => setConfettiActive(false), 3000);
              }}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg"
            >
              ¡Completar Desafío Familiar!
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 6: AJUSTES DE SONIDO Y LECTURA
         ========================================== */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-sm bg-slate-900 border-4 border-sky-400 rounded-3xl shadow-2xl p-6 text-white text-center">
            <button
              onClick={() => setIsSettingsOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-black text-sky-300 uppercase mb-4">Ajustes de Aventura</h3>

            <div className="space-y-3 text-left text-xs font-bold text-slate-300">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700">
                <span>Efectos de Sonido Web Audio:</span>
                <button
                  onClick={() => setIsSoundMuted(!isSoundMuted)}
                  className={`px-3 py-1 rounded-xl text-xs font-black ${
                    isSoundMuted ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}
                >
                  {isSoundMuted ? 'Silenciado' : 'Activado'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700">
                <span>Tamaño de Texto Didáctico:</span>
                <span className="px-2 py-1 rounded-lg bg-sky-950 text-sky-300 border border-sky-700">
                  Grande (6 a 8 años)
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700">
                <span>Colegio Activo:</span>
                <span className="text-emerald-400">Montessori del Valle</span>
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="w-full mt-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md"
            >
              Guardar Ajustes
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-3 text-center text-[11px] font-bold text-sky-950/80 bg-sky-300/40 border-t border-sky-400/50">
        Colegio Montessori del Valle (CCT: 09PPR8800M) · Módulo 04 Primaria Baja: El Libro de Aventuras & Álbum Holográfico · Nueva Escuela Mexicana
      </footer>

    </div>
  );
}
