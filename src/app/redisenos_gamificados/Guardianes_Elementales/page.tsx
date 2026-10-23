// src/app/redisenos_gamificados/Guardianes_Elementales/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Sparkles, 
  MapPin, 
  ShoppingBag, 
  Swords, 
  BookOpen, 
  Award, 
  Flame, 
  Shield, 
  Star, 
  Coins, 
  ChevronLeft, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Save, 
  Crown, 
  Wand2, 
  Feather, 
  Heart, 
  Zap, 
  Clock, 
  Shirt, 
  Compass, 
  ArrowRight,
  Info,
  Layers,
  HelpCircle,
  Play
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// MODELO DE PERFILES ESTUDIANTILES (3 PERFILES INDEPENDIENTES)
// ==========================================
interface GuardianStudent {
  id: string;
  name: string;
  avatarTitle: string;
  level: number;
  xp: number;
  xpNextLevel: number;
  coins: number;
  stars: number;
  hp: number;
  maxHp: number;
  element: 'Luz' | 'Fuego' | 'Cristal';
  equippedItem: 'base' | 'capa_fuego' | 'baculo_sabiduria' | 'mascota_fenix' | 'corona_100';
  unlockedItems: string[];
  achievementsUnlocked: number; // sobre 6
  missionsCompleted: { math: number; spanish: number };
}

const INITIAL_GUARDIAN_STUDENTS: GuardianStudent[] = [
  {
    id: 'liam',
    name: 'Liam',
    avatarTitle: 'Mago Aprendiz de la Luz',
    level: 8,
    xp: 2840,
    xpNextLevel: 3200,
    coins: 5430,
    stars: 85,
    hp: 100,
    maxHp: 100,
    element: 'Luz',
    equippedItem: 'base',
    unlockedItems: ['base', 'capa_fuego', 'baculo_sabiduria'],
    achievementsUnlocked: 4,
    missionsCompleted: { math: 3, spanish: 1 }
  },
  {
    id: 'valentina',
    name: 'Valentina',
    avatarTitle: 'Guardiana de las Brasas',
    level: 9,
    xp: 3450,
    xpNextLevel: 4000,
    coins: 7120,
    stars: 95,
    hp: 100,
    maxHp: 100,
    element: 'Fuego',
    equippedItem: 'mascota_fenix',
    unlockedItems: ['base', 'capa_fuego', 'mascota_fenix', 'corona_100'],
    achievementsUnlocked: 5,
    missionsCompleted: { math: 5, spanish: 3 }
  },
  {
    id: 'diego',
    name: 'Diego',
    avatarTitle: 'Alquimista de Montes Cristalinos',
    level: 6,
    xp: 1980,
    xpNextLevel: 2500,
    coins: 3250,
    stars: 60,
    hp: 100,
    maxHp: 100,
    element: 'Cristal',
    equippedItem: 'baculo_sabiduria',
    unlockedItems: ['base', 'baculo_sabiduria'],
    achievementsUnlocked: 3,
    missionsCompleted: { math: 2, spanish: 2 }
  }
];

// Catálogo de ítems de la Tienda de Recompensas (Imagen 4)
interface StoreItem {
  id: string;
  name: string;
  category: 'companions' | 'skins' | 'powerups' | 'badges';
  price: number;
  icon: string;
  description: string;
  avatarItemKey?: 'capa_fuego' | 'baculo_sabiduria' | 'mascota_fenix' | 'corona_100';
}

const REWARD_STORE_ITEMS: StoreItem[] = [
  // Magical Floating Companions
  { id: 'phoenix_chick', name: 'Pollito Fénix', category: 'companions', price: 500, icon: '🔥', description: 'Compañero ígneo que otorga +10% de maná en desafíos aritméticos.', avatarItemKey: 'mascota_fenix' },
  { id: 'baby_robot', name: 'Bebé Robot', category: 'companions', price: 450, icon: '🤖', description: 'Asistente de lógica que sugiere patrones en ecuaciones complejas.' },
  { id: 'clay_panda', name: 'Panda de Barro', category: 'companions', price: 400, icon: '🐼', description: 'Símbolo de calma y concentración durante los exámenes de comprensión.' },
  
  // Wearable Avatar Skins
  { id: 'flame_cloak', name: 'Capa Elemental de Fuego', category: 'skins', price: 750, icon: '🔥', description: 'Manto tejido con fuego arcano que ondea con energía elemental.', avatarItemKey: 'capa_fuego' },
  { id: 'cyber_jacket', name: 'Chaqueta Urbana Anime Cyber', category: 'skins', price: 650, icon: '🧥', description: 'Estilo contemporáneo para guardianes de la era digital.' },
  { id: 'lab_coat', name: 'Bata de Laboratorio con Broches Dorados', category: 'skins', price: 550, icon: '🥼', description: 'Atuendo ceremonial para maestros de ciencias experimentales.' },
  
  // Tactical Power-Ups
  { id: 'hourglass', name: 'Reloj de Arena de la Sabiduría', category: 'powerups', price: 300, icon: '⏳', description: 'Otorga 30 segundos adicionales para reflexionar sin presión.' },
  { id: 'mana_potion', name: 'Poción de Maná Lógico', category: 'powerups', price: 250, icon: '🧪', description: 'Elimina 1 opción incorrecta en la arena de combate didáctico.' },
  { id: 'streak_shield', name: 'Escudo de Racha Continua', category: 'powerups', price: 200, icon: '🛡️', description: 'Protege tu multiplicador de racha si cometes un desliz.' },
  
  // Holographic Achievement Badges
  { id: 'master_scholar', name: 'Insignia Erudito Maestro', category: 'badges', price: 1000, icon: '🏅', description: 'Acreditación SEP al completar todas las misiones del bimestre.' },
  { id: 'coding_expert', name: 'Insignia Experto en Código', category: 'badges', price: 900, icon: '💻', description: 'Habilidad demostrada en pensamiento computacional algorítmico.' },
  { id: 'team_leader', name: 'Insignia Líder de Equipo', category: 'badges', price: 800, icon: '🤝', description: 'Reconocimiento por colaboración y ayuda a compañeros de aula.' }
];

// Logros del Álbum (Imagen 1 - Izquierda)
interface AchievementBadge {
  id: string;
  name: string;
  stars: number;
  unlocked: boolean;
  field: string;
  description: string;
}

const INITIAL_ACHIEVEMENTS: AchievementBadge[] = [
  { id: 'science_master', name: '¡MAESTRO DE CIENCIAS!', stars: 3, unlocked: true, field: 'Saberes y Pensamiento Científico', description: 'Dominio de experimentos con estados de la materia.' },
  { id: 'gears_tech', name: '¡MAESTRO MECATRONICO!', stars: 3, unlocked: true, field: 'Tecnología y Pensamiento Lógico', description: 'Construcción de mecanismos de engranajes y poleas.' },
  { id: 'atom_molecules', name: '¡EXPLORADOR QUÍMICO!', stars: 3, unlocked: true, field: 'Saberes Experimentales', description: 'Identificación de mezclas homogéneas y heterogéneas.' },
  { id: 'math_genius', name: '¡GENIO DE MATEMÁTICAS!', stars: 3, unlocked: true, field: 'Pensamiento Matemático', description: 'Resolución de divisiones y multiplicaciones de Fase 3.' },
  { id: 'arithmetic_wizard', name: '¡ARITMÉTICO ARCANO!', stars: 3, unlocked: false, field: 'Cálculo Mental', description: 'Racha de 10 respuestas correctas consecutivas sin error.' },
  { id: 'abacus_sorcerer', name: '¡SEÑOR DEL ÁBACO!', stars: 3, unlocked: false, field: 'Numeración Decimal', description: 'Descomposición aditiva y multiplicativa de millares.' }
];

export default function GuardianesElementalesPage() {
  // Estado de estudiantes y selección activa
  const [students, setStudents] = useState<GuardianStudent[]>(INITIAL_GUARDIAN_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('liam');

  // Vistas activas: 'map' (Imagen 3), 'customizer' (Imagen 1), 'store' (Imagen 4), 'battle' (Imagen 5)
  const [currentView, setCurrentView] = useState<'map' | 'customizer' | 'store' | 'battle'>('map');

  // Sonido y accesibilidad
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<string | null>(null);

  // Estados de Personalizador de Héroe (Imagen 1)
  const [selectedHeroItem, setSelectedHeroItem] = useState<'base' | 'capa_fuego' | 'baculo_sabiduria' | 'mascota_fenix' | 'corona_100'>('base');
  const [achievements, setAchievements] = useState<AchievementBadge[]>(INITIAL_ACHIEVEMENTS);
  const [activeBadgeDetail, setActiveBadgeDetail] = useState<AchievementBadge | null>(null);

  // Estados de Tienda (Imagen 4)
  const [storeCategory, setStoreCategory] = useState<'all' | 'companions' | 'skins' | 'powerups' | 'badges'>('all');

  // Estados de Combate contra Forest Golem (Imagen 5)
  const [golemHp, setGolemHp] = useState<number>(80);
  const [sorceressHp, setSorceressHp] = useState<number>(100);
  const [manaCount, setManaCount] = useState<number>(5);
  const [comboMultiplier, setComboMultiplier] = useState<number>(3);
  const [selectedRune, setSelectedRune] = useState<number | null>(null);
  const [battleFeedback, setBattleFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [isCastingSpell, setIsCastingSpell] = useState<boolean>(false);
  const [isGolemDefeated, setIsGolemDefeated] = useState<boolean>(false);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  // Estudiante activo
  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  // Sincronizar ítem seleccionado con el estudiante activo al cambiar de perfil
  useEffect(() => {
    setSelectedHeroItem(activeStudent.equippedItem);
  }, [activeStudentId, activeStudent.equippedItem]);

  // Mensajes de notificación
  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Reproductor de voz en español oficial
  const speakText = (text: string) => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-MX';
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    } catch {
      // Silencioso si no está disponible
    }
  };

  // Mapeo dinámico del render de Liam generado en Nano Banana
  const getLiamRender = () => {
    switch (selectedHeroItem) {
      case 'capa_fuego':
        return '/redisenos_assets/guardianes/liam_capa_fuego.jpg';
      case 'baculo_sabiduria':
        return '/redisenos_assets/guardianes/liam_baculo_sabiduria.jpg';
      case 'mascota_fenix':
        return '/redisenos_assets/guardianes/liam_mascota_fenix.jpg';
      case 'corona_100':
        return '/redisenos_assets/guardianes/liam_corona_100.jpg';
      case 'base':
      default:
        return '/redisenos_assets/guardianes/liam_base_pedestal.jpg';
    }
  };

  // Manejo de clic en Ítem del Personalizador (Imagen 1)
  const handleSelectHeroItem = (itemKey: 'capa_fuego' | 'baculo_sabiduria' | 'mascota_fenix' | 'corona_100') => {
    if (soundEnabled) gamificationAudio.playClickSound();
    
    // Toggle: Si ya está seleccionado, vuelve a base
    const nextItem = selectedHeroItem === itemKey ? 'base' : itemKey;
    setSelectedHeroItem(nextItem);

    if (nextItem !== 'base') {
      const itemNames = {
        capa_fuego: 'Capa Elemental de Fuego',
        baculo_sabiduria: 'Báculo de Sabiduría del Búho',
        mascota_fenix: 'Mascota Fénix Radiante',
        corona_100: 'Corona Real de 100 Puntos'
      };
      showToast(`¡Equipaste: ${itemNames[itemKey]}!`);
      speakText(`Has equipado ${itemNames[itemKey]}`);
    }
  };

  // Guardar configuración del Héroe
  const handleSaveHero = () => {
    if (soundEnabled) gamificationAudio.playLevelUpSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedItem: selectedHeroItem
      };
    }));
    showToast(`¡Configuración de ${activeStudent.name} guardada exitosamente!`);
    speakText(`Héroe guardado con éxito.`);
  };

  // Comprar Ítem en la Tienda (Imagen 4)
  const handleBuyStoreItem = (item: StoreItem) => {
    if (activeStudent.coins < item.price) {
      if (soundEnabled) gamificationAudio.playErrorSound();
      showToast(`¡Monedas insuficientes! Necesitas ${item.price} y tienes ${activeStudent.coins}.`);
      speakText(`No tienes suficientes monedas. Resuelve más misiones.`);
      return;
    }

    if (soundEnabled) gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      const nextUnlocked = Array.from(new Set([...s.unlockedItems, item.id, ...(item.avatarItemKey ? [item.avatarItemKey] : [])]));
      return {
        ...s,
        coins: s.coins - item.price,
        unlockedItems: nextUnlocked
      };
    }));

    showToast(`¡Compraste "${item.name}" por ${item.price} Monedas!`);
    speakText(`¡Excelente compra! Has adquirido ${item.name}`);
  };

  // Manejar respuesta de la batalla didáctica con Forest Golem (Imagen 5)
  const handleSolveRune = (runeValue: number) => {
    if (isGolemDefeated || isCastingSpell) return;
    setSelectedRune(runeValue);

    // Ecuación oficial de la Imagen 5: 24 ÷ 4 = 6
    if (runeValue === 6) {
      setIsCastingSpell(true);
      if (soundEnabled) {
        gamificationAudio.playMagicCastSound();
        setTimeout(() => gamificationAudio.playEnemyHitSound(), 350);
      }

      setTimeout(() => {
        setGolemHp(0);
        setIsGolemDefeated(true);
        setIsCastingSpell(false);
        setConfettiActive(true);
        if (soundEnabled) gamificationAudio.playVictorySound();

        // Recompensas para el estudiante activo
        setStudents(prev => prev.map(s => {
          if (s.id !== activeStudent.id) return s;
          return {
            ...s,
            coins: s.coins + 150,
            xp: s.xp + 50,
            stars: Math.min(100, s.stars + 1),
            missionsCompleted: {
              ...s.missionsCompleted,
              math: Math.min(5, s.missionsCompleted.math + 1)
            }
          };
        }));

        setBattleFeedback({
          isCorrect: true,
          message: '¡CORRECTO! 24 ÷ 4 = 6. ¡Has canalizado el hechizo y purificado al Golem del Bosque!'
        });
        speakText('¡Excelente! Veinticuatro entre cuatro es seis. ¡Has purificado al Golem del Bosque!');
      }, 700);

    } else {
      if (soundEnabled) gamificationAudio.playErrorSound();
      setBattleFeedback({
        isCorrect: false,
        message: `¡Casi! ${runeValue} no es el resultado. Pista: ¿Qué número multiplicado por 4 da 24? ¡Inténtalo de nuevo!`
      });
      speakText('Casi. Piensa qué número multiplicado por 4 nos da 24.');
    }
  };

  // Reiniciar batalla de Forest Golem
  const handleResetBattle = () => {
    setGolemHp(80);
    setIsGolemDefeated(false);
    setSelectedRune(null);
    setBattleFeedback(null);
    setConfettiActive(false);
    if (soundEnabled) gamificationAudio.playClickSound();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-purple-500 selection:text-white relative overflow-x-hidden">
      
      {/* ============================================================ */}
      {/* 1. TOP BAR GLOBAL CON SELECTOR DE PERFILES Y NAVEGACIÓN */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 shadow-xl px-4 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo y Enlace a Hub de Rediseños */}
          <div className="flex items-center gap-3">
            <Link 
              href="/redisenos_gamificados"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-4 h-4 text-purple-400" />
              <span>Volver a Rediseños</span>
            </Link>

            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-wider text-purple-300">
                03 Primaria Baja · Academia de Guardianes Elementales
              </span>
            </div>
          </div>

          {/* Selector de 3 Perfiles Estudiantiles Independientes */}
          <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800">
            <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2 hidden md:inline">
              Perfil:
            </span>
            {students.map(st => (
              <button
                key={st.id}
                onClick={() => {
                  if (soundEnabled) gamificationAudio.playClickSound();
                  setActiveStudentId(st.id);
                  showToast(`Cambiando al perfil de ${st.name} (Nivel ${st.level})`);
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  st.id === activeStudentId
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md ring-1 ring-purple-300'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{st.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/40 text-amber-300">
                  Nv.{st.level}
                </span>
              </button>
            ))}
          </div>

          {/* Monedas, Estrellas y Controles */}
          <div className="flex items-center gap-3">
            {/* Monedas */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-extrabold">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeStudent.coins.toLocaleString()}</span>
            </div>

            {/* Estrellas */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-extrabold">
              <Star className="w-3.5 h-3.5 text-purple-400 fill-purple-400" />
              <span>{activeStudent.stars}/100</span>
            </div>

            {/* Conmutador de Sonido */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) gamificationAudio.playClickSound();
              }}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
              title={soundEnabled ? 'Silenciar Audio' : 'Activar Audio'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 2. BOTONES DE NAVEGACIÓN ENTRE LAS 4 VISTAS DEL SISTEMA */}
      {/* ============================================================ */}
      <nav className="bg-slate-900 border-b border-slate-800/80 px-4 py-2 sticky top-[53px] z-40">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-x-auto">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (soundEnabled) gamificationAudio.playClickSound();
                setCurrentView('map');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                currentView === 'map'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-300" />
              <span>1. Mapa Overworld (Imagen 3)</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) gamificationAudio.playClickSound();
                setCurrentView('customizer');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                currentView === 'customizer'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Shirt className="w-3.5 h-3.5 text-purple-300" />
              <span>2. Personalizador & Álbum (Imagen 1)</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) gamificationAudio.playClickSound();
                setCurrentView('store');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                currentView === 'store'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span>3. Tienda Mágica (Imagen 4)</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) gamificationAudio.playClickSound();
                setCurrentView('battle');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
                currentView === 'battle'
                  ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              <Swords className="w-3.5 h-3.5 text-rose-300" />
              <span>4. Duelo Forest Golem (Imagen 5)</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-bold text-slate-400">
            <span className="px-2 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
              SEP Fases 3 y 4 · 6 a 8 años
            </span>
            <span className="px-2 py-0.5 rounded-md bg-indigo-950 text-indigo-300 border border-indigo-800">
              Benchmark: Prodigy Math & Mario RPG
            </span>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* 3. VISTA 1: MAPA OVERWORLD (IMAGEN 3)                        */}
      {/* ============================================================ */}
      {currentView === 'map' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 animate-fadeIn">
          
          {/* Marco Superior del Mapa con Título Heroico y Utilidades */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-amber-600/40 shadow-2xl bg-gradient-to-b from-sky-900/60 to-emerald-950/70 p-4 sm:p-6">
            
            {/* Header del Overworld */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              
              {/* Emblema Central */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center">
                  <Flame className="w-7 h-7 text-slate-950 fill-slate-950" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 tracking-tight">
                    ACADEMIA DE GUARDIANES ELEMENTALES
                  </h1>
                  <p className="text-xs font-bold text-emerald-300">
                    Saga de Rol Pedagógico · Biomas de Aprendizaje Curricular NEM 2024
                  </p>
                </div>
              </div>

              {/* Medalla de Nivel */}
              <div className="flex items-center gap-3 bg-amber-950/80 border-2 border-amber-500/60 px-4 py-2 rounded-2xl shadow-lg">
                <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-bounce" />
                <div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400 block">Rango Arcano</span>
                  <span className="text-lg font-black text-white">NIVEL {activeStudent.level}</span>
                </div>
              </div>
            </div>

            {/* CONTENIDO PRINCIPAL DEL OVERWORLD: MAPA CENTRAL + PANELES LATERALES */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Panel Izquierdo: Pergamino del Héroe & Dragón (Como en Imagen 3) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 text-slate-900 p-4 rounded-3xl border-4 border-amber-800 shadow-2xl relative">
                  
                  {/* Estrellas de Rango */}
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(st => (
                      <Star key={st} className="w-5 h-5 text-amber-500 fill-amber-400" />
                    ))}
                  </div>

                  {/* Pergamino con Liam y su Dragoncito Azul */}
                  <div className="bg-amber-50 rounded-2xl p-3 border-2 border-amber-300 text-center shadow-inner relative group cursor-pointer"
                       onClick={() => {
                         if (soundEnabled) gamificationAudio.playClickSound();
                         setCurrentView('customizer');
                       }}>
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 bg-gradient-to-tr from-sky-200 to-indigo-100 border border-amber-300">
                      <Image
                        src={getLiamRender()}
                        alt="Liam y Dragoncito"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-black uppercase text-amber-950 block">
                      {activeStudent.name} & Bebé Dragón
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 block mt-0.5">
                      Toca para Personalizar Héroe
                    </span>
                  </div>

                  {/* Monedas en Pergamino */}
                  <div className="mt-4 bg-gradient-to-r from-amber-400 to-yellow-400 p-3 rounded-2xl border-2 border-amber-700 flex items-center justify-center gap-2 shadow-md">
                    <Coins className="w-6 h-6 text-amber-950" />
                    <span className="text-lg font-black text-amber-950">
                      {activeStudent.coins.toLocaleString()} MONEDAS
                    </span>
                  </div>

                  {/* Botón rápido a Álbum de Logros */}
                  <button
                    onClick={() => {
                      if (soundEnabled) gamificationAudio.playClickSound();
                      setCurrentView('customizer');
                    }}
                    className="w-full mt-3 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102"
                  >
                    <BookOpen className="w-4 h-4 text-purple-300" />
                    <span>Abrir Álbum de Logros</span>
                  </button>
                </div>
              </div>

              {/* Mapa Central con los 28 Nodos Interactivos (Imagen 3) */}
              <div className="lg:col-span-6 relative rounded-3xl overflow-hidden border-4 border-amber-800 shadow-2xl bg-slate-900 aspect-[4/3] flex items-center justify-center">
                {/* Imagen del Mapa Overworld Oficial */}
                <Image
                  src="/redisenos_assets/guardianes/mapa_guardianes_overworld.jpg"
                  alt="Mapa Overworld Guardianes Elementales"
                  fill
                  className="object-cover"
                />

                {/* Capa de Nodos Clicables sobre el Mapa */}
                <div className="absolute inset-0">
                  
                  {/* Nodo 12: Montes Cristalinos (Nodo Activo con Liam y Dragoncito) */}
                  <div className="absolute top-[48%] left-[50%] -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-20">
                    <div 
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playClickSound();
                        showToast("¡Estás en Montes Cristalinos! Nivel en curso.");
                      }}
                      className="w-12 h-12 rounded-full border-4 border-amber-400 bg-sky-500 shadow-xl flex items-center justify-center text-white font-black text-xs animate-pulse ring-4 ring-yellow-400/50 hover:scale-110 transition-transform"
                    >
                      <span className="text-white font-black text-xs">12</span>
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] font-black text-white whitespace-nowrap border border-white/20">
                      Montes Cristalinos
                    </div>
                  </div>

                  {/* Nodo 24: Duelo Didáctico contra Forest Golem (BOSS) */}
                  <div className="absolute top-[22%] right-[18%] group cursor-pointer z-20">
                    <div 
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playClickSound();
                        setCurrentView('battle');
                      }}
                      className="w-12 h-12 rounded-full border-4 border-rose-500 bg-gradient-to-tr from-rose-600 to-amber-500 shadow-2xl flex items-center justify-center text-white font-black text-xs animate-bounce hover:scale-125 transition-transform ring-4 ring-rose-400/50"
                    >
                      <Swords className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute top-12 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg bg-rose-950/90 backdrop-blur-md text-[10px] font-black text-rose-200 whitespace-nowrap border border-rose-500 shadow-lg">
                      ¡Duelo con Forest Golem!
                    </div>
                  </div>

                  {/* Nodo 1: Inicio en el Bosque */}
                  <div className="absolute bottom-[22%] left-[36%] group cursor-pointer z-10">
                    <button
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playClickSound();
                        showToast("Nivel 1: Suma y Resta Inicial completado con 3 estrellas.");
                      }}
                      className="w-8 h-8 rounded-full border-2 border-emerald-400 bg-emerald-600 text-white font-black text-xs flex items-center justify-center hover:scale-110 shadow-md"
                    >
                      1
                    </button>
                  </div>

                  {/* Nodo 28: Cráter Volcánico Final */}
                  <div className="absolute top-[16%] right-[32%] group cursor-pointer z-10">
                    <button
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playClickSound();
                        showToast("Nivel 28: Requiere superar el Duelo de la Runa 24.");
                      }}
                      className="w-8 h-8 rounded-full border-2 border-amber-400 bg-amber-700 text-white font-black text-xs flex items-center justify-center hover:scale-110 shadow-md"
                    >
                      28
                    </button>
                  </div>

                  {/* Acceso Rápido a la Arena en el Centro Inferior */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-30">
                    <button
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playLevelUpSound();
                        setCurrentView('battle');
                      }}
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:from-rose-500 hover:to-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-2xl border-2 border-amber-300 ring-2 ring-rose-500/40 hover:scale-105 active:scale-95 transition-all"
                    >
                      <Swords className="w-4 h-4 text-amber-300" />
                      <span>¡Entrar al Duelo Didáctico (Forest Golem)!</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Panel Derecho: Misiones del Día NEM 2024 (Como en Imagen 3) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="bg-gradient-to-b from-amber-100 to-amber-200 text-slate-900 p-4 rounded-3xl border-4 border-amber-800 shadow-2xl relative">
                  
                  {/* Chinchetas Rojas de Adorno */}
                  <div className="absolute -top-3 left-4 w-4 h-4 rounded-full bg-rose-600 border-2 border-amber-900 shadow-md"></div>
                  <div className="absolute -top-3 right-4 w-4 h-4 rounded-full bg-rose-600 border-2 border-amber-900 shadow-md"></div>

                  <h3 className="text-center font-black text-sm uppercase tracking-wider text-amber-950 mb-3 border-b-2 border-amber-300 pb-1">
                    Misiones del Día
                  </h3>

                  {/* Misión 1: NEM 2024 Matemáticas */}
                  <div className="bg-amber-50 rounded-2xl p-3 border-2 border-amber-300 mb-3 shadow-inner">
                    <span className="text-[10px] font-black uppercase text-emerald-800 block">
                      NEM 2024: MATEMÁTICAS
                    </span>
                    <div className="flex items-center gap-2 my-1">
                      <span className="text-lg">🧮</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        ¡Suma y Resta en el Bosque!
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-black text-amber-900 mb-1">
                      <span>Progreso:</span>
                      <span>{activeStudent.missionsCompleted.math} / 5</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-amber-200 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
                        style={{ width: `${(activeStudent.missionsCompleted.math / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Misión 2: NEM 2024 Español */}
                  <div className="bg-amber-50 rounded-2xl p-3 border-2 border-amber-300 shadow-inner">
                    <span className="text-[10px] font-black uppercase text-amber-800 block">
                      NEM 2024: ESPAÑOL
                    </span>
                    <div className="flex items-center gap-2 my-1">
                      <span className="text-lg">📖</span>
                      <span className="text-xs font-bold text-slate-800 leading-tight">
                        ¡Lee la Leyenda del Dragón!
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] font-black text-amber-900 mb-1">
                      <span>Progreso:</span>
                      <span>{activeStudent.missionsCompleted.spanish} / 4</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-amber-200 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                        style={{ width: `${(activeStudent.missionsCompleted.spanish / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Botón a la Tienda de Recompensas */}
                  <button
                    onClick={() => {
                      if (soundEnabled) gamificationAudio.playClickSound();
                      setCurrentView('store');
                    }}
                    className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all hover:scale-102"
                  >
                    <ShoppingBag className="w-4 h-4 text-slate-950" />
                    <span>Visitar Tienda Mágica</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </main>
      )}

      {/* ============================================================ */}
      {/* 4. VISTA 2: PERSONALIZADOR DE HÉROE & ÁLBUM (IMAGEN 1)       */}
      {/* ============================================================ */}
      {currentView === 'customizer' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 animate-fadeIn">
          
          {/* Header Superior del Personalizador como en Imagen 1 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-3xl border border-slate-800 shadow-xl">
            {/* Liam Nivel 8 */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-800">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 p-0.5 relative overflow-hidden">
                <Image
                  src={getLiamRender()}
                  alt="Avatar Liam"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="text-sm font-black text-white block">{activeStudent.name}</span>
                <span className="text-xs font-extrabold text-sky-400">NIVEL {activeStudent.level}</span>
              </div>
            </div>

            {/* Monedas y Estrellas de Imagen 1 (5,430 Monedas / 85/100 Estrellas) */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black text-sm shadow-md">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{activeStudent.coins.toLocaleString()} MONEDAS</span>
              </div>

              <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-purple-500/20 border border-purple-500/40 text-purple-300 font-black text-sm shadow-md">
                <Star className="w-5 h-5 text-purple-400 fill-purple-400" />
                <span>{activeStudent.stars}/100 ESTRELLAS</span>
              </div>
            </div>
          </div>

          {/* CUERPO DEL PERSONALIZADOR: LIBRO DE LOGROS A LA IZQUIERDA + HÉROE A LA DERECHA */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* LADO IZQUIERDO: ÁLBUM DE LOGROS (Libro Grimoire en Imagen 1) */}
            <div className="lg:col-span-7 bg-gradient-to-br from-amber-950 via-amber-900 to-amber-950 p-6 rounded-3xl border-4 border-amber-700 shadow-2xl relative flex flex-col justify-between">
              <div>
                <div className="text-center mb-4">
                  <h2 className="text-xl sm:text-2xl font-black text-amber-200 uppercase tracking-wider flex items-center justify-center gap-2">
                    <BookOpen className="w-6 h-6 text-amber-400" />
                    ÁLBUM DE LOGROS
                  </h2>
                  <p className="text-xs text-amber-300 font-bold">
                    Registro Curricular de Competencias Acreditadas · SEP NEM 2024
                  </p>
                </div>

                {/* Cuadrícula de 6 Pegatinas Maestras Hexagonales */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-amber-100/90 border-2 border-amber-500/60 shadow-inner">
                  {achievements.map(ach => (
                    <div
                      key={ach.id}
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playClickSound();
                        setActiveBadgeDetail(ach);
                      }}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center text-center cursor-pointer transition-all hover:scale-105 ${
                        ach.unlocked
                          ? 'bg-gradient-to-b from-white to-amber-50 border-amber-500 shadow-md ring-1 ring-amber-300'
                          : 'bg-amber-200/50 border-amber-400/40 opacity-60'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md mb-1.5">
                        {ach.id === 'science_master' && '🧪'}
                        {ach.id === 'gears_tech' && '⚙️'}
                        {ach.id === 'atom_molecules' && '🔬'}
                        {ach.id === 'math_genius' && '🧮'}
                        {ach.id === 'arithmetic_wizard' && '➕'}
                        {ach.id === 'abacus_sorcerer' && '🔢'}
                      </div>

                      <span className="text-[11px] font-black text-slate-900 leading-tight">
                        {ach.name}
                      </span>

                      {/* Estrellitas de Logro */}
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3].map(st => (
                          <Star
                            key={st}
                            className={`w-3 h-3 ${ach.unlocked ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Barra de Progreso del Álbum (¡ÁLBUM DE PEGATINAS MAESTRAS! 4/6) */}
              <div className="mt-6 p-4 rounded-2xl bg-amber-950/90 border-2 border-amber-600 shadow-lg">
                <div className="flex items-center justify-between text-xs font-black text-amber-200 mb-1.5">
                  <span>¡ÁLBUM DE PEGATINAS MAESTRAS!</span>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black">
                    {activeStudent.achievementsUnlocked} / 6
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-amber-900 overflow-hidden border border-amber-700">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-500"
                    style={{ width: `${(activeStudent.achievementsUnlocked / 6) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* LADO DERECHO: PERSONALIZADOR DE HÉROE (LIAM EN PEDESTAL - IMAGEN 1) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-sky-950 via-slate-900 to-emerald-950 p-6 rounded-3xl border-4 border-amber-600 shadow-2xl flex flex-col justify-between relative overflow-hidden">
              
              <div className="text-center mb-2">
                <h2 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200 uppercase tracking-wide">
                  PERSONALIZADOR DE HÉROE
                </h2>
                <p className="text-xs text-emerald-300 font-bold">
                  Equipa artefactos mágicos creados con Nano Banana
                </p>
              </div>

              {/* Pedestal de Liam con Render Dinámico de Alta Definición */}
              <div className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden my-3 border-2 border-amber-400/40 shadow-2xl bg-gradient-to-t from-emerald-900/60 via-transparent to-sky-800/40 flex items-center justify-center">
                
                {/* Destellos de fondo */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15)_0%,transparent_70%)] pointer-events-none"></div>

                {/* Render Nano Banana de Liam con el Ítem Seleccionado */}
                <Image
                  src={getLiamRender()}
                  alt={`Liam con ${selectedHeroItem}`}
                  fill
                  priority
                  className="object-contain p-2 transition-all duration-300"
                />

                {/* Indicador del Atuendo Activo */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-xl bg-black/80 backdrop-blur-md border border-amber-400/60 text-[11px] font-black text-amber-300 whitespace-nowrap shadow-lg">
                  {selectedHeroItem === 'base' && '⚔️ Túnica de Explorador Base'}
                  {selectedHeroItem === 'capa_fuego' && '🔥 Capa Elemental de Fuego Equipada'}
                  {selectedHeroItem === 'baculo_sabiduria' && '🦉 Báculo de Sabiduría Equipado'}
                  {selectedHeroItem === 'mascota_fenix' && '🦅 Mascota Fénix Radiante Equipada'}
                  {selectedHeroItem === 'corona_100' && '👑 Corona Real de 100 Puntos Equipada'}
                </div>
              </div>

              {/* 4 Botones de Ítems (Como en Imagen 1) */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                
                {/* 1. CAPA DE FUEGO */}
                <button
                  onClick={() => handleSelectHeroItem('capa_fuego')}
                  className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 font-black text-xs transition-all hover:scale-102 ${
                    selectedHeroItem === 'capa_fuego'
                      ? 'bg-rose-600 border-amber-300 text-white shadow-lg ring-2 ring-rose-400'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-amber-500'
                  }`}
                >
                  <span className="text-xl">🔥</span>
                  <div className="text-left">
                    <span className="block leading-tight text-[11px]">CAPA DE FUEGO</span>
                    <span className="text-[9px] text-amber-300">
                      {selectedHeroItem === 'capa_fuego' ? 'Equipada' : 'Tocar para vestir'}
                    </span>
                  </div>
                </button>

                {/* 2. BÁCULO DE SABIDURÍA */}
                <button
                  onClick={() => handleSelectHeroItem('baculo_sabiduria')}
                  className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 font-black text-xs transition-all hover:scale-102 ${
                    selectedHeroItem === 'baculo_sabiduria'
                      ? 'bg-sky-600 border-amber-300 text-white shadow-lg ring-2 ring-sky-400'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-amber-500'
                  }`}
                >
                  <span className="text-xl">🦉</span>
                  <div className="text-left">
                    <span className="block leading-tight text-[11px]">BÁCULO DE SABIDURÍA</span>
                    <span className="text-[9px] text-sky-300">
                      {selectedHeroItem === 'baculo_sabiduria' ? 'Equipado' : 'Tocar para empuñar'}
                    </span>
                  </div>
                </button>

                {/* 3. MASCOTA FÉNIX */}
                <button
                  onClick={() => handleSelectHeroItem('mascota_fenix')}
                  className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 font-black text-xs transition-all hover:scale-102 ${
                    selectedHeroItem === 'mascota_fenix'
                      ? 'bg-amber-600 border-amber-300 text-white shadow-lg ring-2 ring-amber-400'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-amber-500'
                  }`}
                >
                  <span className="text-xl">🦅</span>
                  <div className="text-left">
                    <span className="block leading-tight text-[11px]">MASCOTA FÉNIX</span>
                    <span className="text-[9px] text-yellow-300">
                      {selectedHeroItem === 'mascota_fenix' ? 'Equipada' : 'Tocar para llamar'}
                    </span>
                  </div>
                </button>

                {/* 4. CORONA DE 100 PUNTOS */}
                <button
                  onClick={() => handleSelectHeroItem('corona_100')}
                  className={`p-2.5 rounded-2xl border-2 flex items-center gap-2 font-black text-xs transition-all hover:scale-102 ${
                    selectedHeroItem === 'corona_100'
                      ? 'bg-yellow-500 border-white text-slate-950 shadow-lg ring-2 ring-yellow-300'
                      : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-amber-500'
                  }`}
                >
                  <span className="text-xl">👑</span>
                  <div className="text-left">
                    <span className="block leading-tight text-[11px]">CORONA DE 100 PUNTOS</span>
                    <span className="text-[9px] text-slate-400">
                      {selectedHeroItem === 'corona_100' ? 'Equipada' : 'Tocar para coronar'}
                    </span>
                  </div>
                </button>

              </div>

              {/* Botones de Acción Inferiores (Imagen 1) */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={handleSaveHero}
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md hover:scale-102 active:scale-95 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>GUARDAR HÉROE</span>
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) gamificationAudio.playClickSound();
                    setCurrentView('map');
                  }}
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md hover:scale-102 active:scale-95 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>MAPA DE AVENTURAS</span>
                </button>

                <button
                  onClick={() => {
                    if (soundEnabled) gamificationAudio.playClickSound();
                    setCurrentView('store');
                  }}
                  className="py-2.5 px-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-[11px] flex items-center justify-center gap-1 shadow-md hover:scale-102 active:scale-95 transition-all"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>TIENDA MÁGICA</span>
                </button>
              </div>

            </div>

          </div>

          {/* Modal Detalle de Insignia de Logro */}
          {activeBadgeDetail && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-slate-900 border-2 border-amber-500/60 p-6 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400 mx-auto flex items-center justify-center text-3xl">
                  🏅
                </div>
                <h3 className="text-lg font-black text-amber-200">{activeBadgeDetail.name}</h3>
                <p className="text-xs text-slate-300">{activeBadgeDetail.description}</p>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-left space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 block">Campo Formativo NEM:</span>
                  <span className="text-xs font-black text-purple-300">{activeBadgeDetail.field}</span>
                </div>
                <button
                  onClick={() => setActiveBadgeDetail(null)}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

        </main>
      )}

      {/* ============================================================ */}
      {/* 5. VISTA 3: TIENDA DE RECOMPENSAS (IMAGEN 4)                 */}
      {/* ============================================================ */}
      {currentView === 'store' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 animate-fadeIn">
          
          {/* Header de la Tienda según Imagen 4 */}
          <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 p-6 rounded-3xl border-2 border-amber-500/50 shadow-2xl text-center relative overflow-hidden">
            <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-wide uppercase">
              TIENDA DE RECOMPENSAS MÁGICAS
            </h2>
            <p className="text-xs font-bold text-amber-200 mt-1">
              Catálogo Curricular de Coleccionables y Potenciadores Tácticos
            </p>

            <div className="inline-flex items-center gap-2 mt-4 px-5 py-2 rounded-2xl bg-amber-500/20 border border-amber-400 text-amber-300 font-black text-sm shadow-md">
              <Coins className="w-5 h-5 text-amber-400" />
              <span>MONEDAS DISPONIBLES: {activeStudent.coins.toLocaleString()}</span>
            </div>
          </div>

          {/* Filtros de Categoría */}
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {[
              { id: 'all', label: 'Todos los Artículos' },
              { id: 'companions', label: 'Compañeros Mágicos' },
              { id: 'skins', label: 'Atuendos y Capas' },
              { id: 'powerups', label: 'Poderes Tácticos' },
              { id: 'badges', label: 'Insignias de Logro' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  if (soundEnabled) gamificationAudio.playClickSound();
                  setStoreCategory(cat.id as any);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
                  storeCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 4 Categorías en Estantes de Cristal (Imagen 4) */}
          <div className="space-y-8">
            
            {/* 1. Magical Floating Companions */}
            {(storeCategory === 'all' || storeCategory === 'companions') && (
              <section className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🦅</span> Compañeros Mágicos Flotantes
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REWARD_STORE_ITEMS.filter(it => it.category === 'companions').map(item => {
                    const isUnlocked = activeStudent.unlockedItems.includes(item.id) || (item.avatarItemKey && activeStudent.unlockedItems.includes(item.avatarItemKey));
                    return (
                      <div key={item.id} className="p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-400 transition-all shadow-xl flex flex-col justify-between">
                        <div className="text-center mb-3">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-400/50 mx-auto flex items-center justify-center text-3xl shadow-inner mb-2">
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300">{item.price} Monedas</span>
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                if (item.avatarItemKey) {
                                  setSelectedHeroItem(item.avatarItemKey);
                                  setCurrentView('customizer');
                                  showToast(`¡Equipaste ${item.name}!`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs"
                            >
                              Equipar en Héroe
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyStoreItem(item)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                            >
                              Comprar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 2. Wearable Avatar Skins */}
            {(storeCategory === 'all' || storeCategory === 'skins') && (
              <section className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🧥</span> Atuendos y Capas de Héroe
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REWARD_STORE_ITEMS.filter(it => it.category === 'skins').map(item => {
                    const isUnlocked = activeStudent.unlockedItems.includes(item.id) || (item.avatarItemKey && activeStudent.unlockedItems.includes(item.avatarItemKey));
                    return (
                      <div key={item.id} className="p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-400 transition-all shadow-xl flex flex-col justify-between">
                        <div className="text-center mb-3">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-purple-500/30 border border-rose-400/50 mx-auto flex items-center justify-center text-3xl shadow-inner mb-2">
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300">{item.price} Monedas</span>
                          {isUnlocked ? (
                            <button
                              onClick={() => {
                                if (item.avatarItemKey) {
                                  setSelectedHeroItem(item.avatarItemKey);
                                  setCurrentView('customizer');
                                  showToast(`¡Equipaste ${item.name}!`);
                                }
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-xs"
                            >
                              Equipar en Héroe
                            </button>
                          ) : (
                            <button
                              onClick={() => handleBuyStoreItem(item)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                            >
                              Comprar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 3. Tactical Power-Ups */}
            {(storeCategory === 'all' || storeCategory === 'powerups') && (
              <section className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🧪</span> Poderes Tácticos
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REWARD_STORE_ITEMS.filter(it => it.category === 'powerups').map(item => {
                    const isUnlocked = activeStudent.unlockedItems.includes(item.id);
                    return (
                      <div key={item.id} className="p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-400 transition-all shadow-xl flex flex-col justify-between">
                        <div className="text-center mb-3">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/20 to-teal-500/30 border border-sky-400/50 mx-auto flex items-center justify-center text-3xl shadow-inner mb-2">
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300">{item.price} Monedas</span>
                          <button
                            onClick={() => handleBuyStoreItem(item)}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                          >
                            {isUnlocked ? 'Comprar Más (+1)' : 'Comprar'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 4. Holographic Achievement Badges */}
            {(storeCategory === 'all' || storeCategory === 'badges') && (
              <section className="space-y-3">
                <h3 className="text-sm font-black text-amber-300 uppercase tracking-wider flex items-center gap-2">
                  <span>🏅</span> Insignias Holográficas de Logro
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {REWARD_STORE_ITEMS.filter(it => it.category === 'badges').map(item => {
                    const isUnlocked = activeStudent.unlockedItems.includes(item.id);
                    return (
                      <div key={item.id} className="p-5 rounded-3xl bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-400 transition-all shadow-xl flex flex-col justify-between">
                        <div className="text-center mb-3">
                          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-yellow-500/20 to-amber-500/30 border border-yellow-400/50 mx-auto flex items-center justify-center text-3xl shadow-inner mb-2">
                            {item.icon}
                          </div>
                          <h4 className="font-black text-white text-sm">{item.name}</h4>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
                        </div>
                        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                          <span className="text-xs font-black text-amber-300">{item.price} Monedas</span>
                          {isUnlocked ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-500 text-xs font-bold">
                              En Colección
                            </span>
                          ) : (
                            <button
                              onClick={() => handleBuyStoreItem(item)}
                              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md"
                            >
                              Comprar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

          </div>

        </main>
      )}

      {/* ============================================================ */}
      {/* 6. VISTA 4: DUELO CON FOREST GOLEM (IMAGEN 5)                */}
      {/* ============================================================ */}
      {currentView === 'battle' && (
        <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 space-y-6 animate-fadeIn">
          
          {/* Header Superior del Duelo Didáctico */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1.5 rounded-xl bg-rose-600/30 text-rose-300 border border-rose-500/50 text-xs font-black flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-rose-400" />
                Duelo de Hechizos Didácticos · Nodo 24
              </span>
              <span className="text-xs font-bold text-slate-400">
                Aritmética Mental NEM Fase 3 · División Elemental
              </span>
            </div>

            {/* Multiplicador de Racha (★ x3 ★ ¡RACHA SABIA!) */}
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-2 border-amber-400 text-amber-300 font-black text-sm shadow-md animate-pulse">
              <span>⭐ x{comboMultiplier}</span>
              <span className="tracking-wider">¡RACHA SABIA!</span>
            </div>
          </div>

          {/* ARENA DE BATALLA (REPRODUCCIÓN EXACTA DE IMAGEN 5) */}
          <div className="relative rounded-3xl overflow-hidden border-4 border-amber-600/50 shadow-2xl bg-slate-900 aspect-[16/9] flex flex-col justify-between p-4 sm:p-6">
            
            {/* Imagen de Fondo de la Batalla Oficial */}
            <Image
              src={isGolemDefeated ? "/redisenos_assets/guardianes/forest_golem_purificado.jpg" : "/redisenos_assets/guardianes/batalla_forest_golem.jpg"}
              alt="Arena de Combate Forest Golem"
              fill
              priority
              className="object-cover transition-opacity duration-700"
            />

            {/* Efecto de Hechizo Mágico en Vuelo */}
            {isCastingSpell && (
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <div className="w-40 h-40 rounded-full bg-cyan-400/40 blur-2xl animate-ping"></div>
                <div className="text-4xl animate-bounce">⚡✨💫</div>
              </div>
            )}

            {/* Partículas de Confetti al derrotar al Golem */}
            {confettiActive && (
              <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
                {[...Array(40)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full animate-bounce"
                    style={{
                      left: `${(i * 7) % 100}%`,
                      top: `${(i * 9) % 80}%`,
                      backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
                      animationDuration: `${1 + (i % 2)}s`,
                      animationDelay: `${(i * 0.1)}s`
                    }}
                  />
                ))}
              </div>
            )}

            {/* Barra de Estado Superior: Forest Golem HP a la Derecha */}
            <div className="relative z-20 flex items-start justify-between">
              
              {/* Monedas y Estrellas en Combate */}
              <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <div className="flex items-center gap-1.5 text-amber-300 font-black text-xs">
                  <Coins className="w-4 h-4 text-amber-400" />
                  <span>{activeStudent.coins}</span>
                </div>
                <div className="flex items-center gap-1.5 text-purple-300 font-black text-xs">
                  <Star className="w-4 h-4 text-purple-400 fill-purple-400" />
                  <span>x3</span>
                </div>
              </div>

              {/* Barra de Vida del Forest Golem (80 / 80 HP) */}
              <div className="bg-black/75 backdrop-blur-md p-3 rounded-2xl border-2 border-emerald-500/60 shadow-xl max-w-xs w-full">
                <div className="flex items-center justify-between text-xs font-black text-white mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-300">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    Forest Golem
                  </span>
                  <span className="text-amber-300">{golemHp} / 80 HP</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden border border-white/20">
                  <div
                    className={`h-full transition-all duration-500 ${
                      golemHp > 30 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : 'bg-gradient-to-r from-rose-600 to-amber-500'
                    }`}
                    style={{ width: `${(golemHp / 80) * 100}%` }}
                  ></div>
                </div>
              </div>

            </div>

            {/* Barra Inferior: Cristales de Maná de la Aprendiz (Izquierda) + Tarjeta de Hechizo (Derecha/Centro) */}
            <div className="relative z-20 flex flex-col md:flex-row items-end justify-between gap-4">
              
              {/* Cristales de Maná y Salud de la Aprendiz */}
              <div className="bg-black/70 backdrop-blur-md p-3 rounded-2xl border border-white/20 space-y-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(m => (
                    <div
                      key={m}
                      className={`w-6 h-8 rounded-lg flex items-center justify-center text-xs font-black transition-all ${
                        m <= manaCount
                          ? 'bg-gradient-to-t from-cyan-600 to-sky-400 text-white shadow-md shadow-cyan-500/50'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      🔷
                    </div>
                  ))}
                  <span className="text-xs font-black text-cyan-300 ml-1">{manaCount} Maná</span>
                </div>
                
                {/* Salud de la Aprendiz (100 HP) */}
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                  <div className="w-28 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="w-full h-full bg-rose-500"></div>
                  </div>
                  <span className="text-[10px] font-black text-white">{sorceressHp} HP</span>
                </div>
              </div>

              {/* TARJETA DE HECHIZO CON LAS 4 RUNAS MÁGICAS (IMAGEN 5) */}
              <div className="w-full max-w-lg bg-gradient-to-b from-amber-50 to-amber-100 text-slate-900 p-4 sm:p-5 rounded-3xl border-4 border-amber-600 shadow-2xl space-y-3">
                
                {/* Banner: ¡RESUELVE EL HECHIZO! */}
                <div className="text-center">
                  <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
                    ¡RESUELVE EL HECHIZO!
                  </span>
                  <div className="text-2xl sm:text-3xl font-black text-slate-950 mt-1">
                    24 ÷ 4 = ?
                  </div>
                </div>

                {/* 4 Runas Mágicas de Opción: [4] [6] [8] [12] */}
                <div className="grid grid-cols-4 gap-2 sm:gap-3">
                  
                  {/* Runa 4 (Púrpura) */}
                  <button
                    onClick={() => handleSolveRune(4)}
                    disabled={isGolemDefeated || isCastingSpell}
                    className={`py-3 rounded-2xl border-2 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transition-all hover:scale-105 active:scale-95 ${
                      selectedRune === 4
                        ? 'bg-purple-600 text-white border-purple-800 ring-2 ring-purple-400'
                        : 'bg-purple-500 hover:bg-purple-400 text-white border-purple-700'
                    }`}
                  >
                    4
                  </button>

                  {/* Runa 6 (Verde - ¡RESPUESTA CORRECTA!) */}
                  <button
                    onClick={() => handleSolveRune(6)}
                    disabled={isGolemDefeated || isCastingSpell}
                    className={`py-3 rounded-2xl border-2 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transition-all hover:scale-105 active:scale-95 ${
                      selectedRune === 6
                        ? 'bg-emerald-600 text-white border-emerald-800 ring-4 ring-yellow-300 animate-pulse'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-white border-emerald-700'
                    }`}
                  >
                    6
                  </button>

                  {/* Runa 8 (Roja) */}
                  <button
                    onClick={() => handleSolveRune(8)}
                    disabled={isGolemDefeated || isCastingSpell}
                    className={`py-3 rounded-2xl border-2 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transition-all hover:scale-105 active:scale-95 ${
                      selectedRune === 8
                        ? 'bg-rose-600 text-white border-rose-800 ring-2 ring-rose-400'
                        : 'bg-rose-500 hover:bg-rose-400 text-white border-rose-700'
                    }`}
                  >
                    8
                  </button>

                  {/* Runa 12 (Azul) */}
                  <button
                    onClick={() => handleSolveRune(12)}
                    disabled={isGolemDefeated || isCastingSpell}
                    className={`py-3 rounded-2xl border-2 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg transition-all hover:scale-105 active:scale-95 ${
                      selectedRune === 12
                        ? 'bg-sky-600 text-white border-sky-800 ring-2 ring-sky-400'
                        : 'bg-sky-500 hover:bg-sky-400 text-white border-sky-700'
                    }`}
                  >
                    12
                  </button>

                </div>

                {/* Feedback didáctico */}
                {battleFeedback && (
                  <div className={`p-3 rounded-xl text-xs font-bold text-center animate-fadeIn ${
                    battleFeedback.isCorrect 
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-400'
                      : 'bg-amber-100 text-amber-900 border border-amber-400'
                  }`}>
                    {battleFeedback.message}
                  </div>
                )}

                {/* Acciones al ganar el combate */}
                {isGolemDefeated && (
                  <div className="flex items-center gap-2 pt-2 border-t border-amber-300">
                    <button
                      onClick={handleResetBattle}
                      className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Volver a Jugar</span>
                    </button>
                    <button
                      onClick={() => {
                        if (soundEnabled) gamificationAudio.playClickSound();
                        setCurrentView('map');
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>Avanzar en Mapa</span>
                    </button>
                  </div>
                )}

              </div>

            </div>

          </div>

        </main>
      )}

      {/* ============================================================ */}
      {/* 7. TOAST NOTIFICACIÓN FLOTANTE                               */}
      {/* ============================================================ */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border-2 border-purple-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slideUp backdrop-blur-md">
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
          <span className="text-xs font-black">{notification}</span>
        </div>
      )}

    </div>
  );
}
