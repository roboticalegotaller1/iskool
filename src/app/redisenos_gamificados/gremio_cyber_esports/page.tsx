// src/app/redisenos_gamificados/gremio_cyber_esports/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Terminal, 
  Zap, 
  Trophy, 
  Award, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  Play, 
  Users, 
  Cpu, 
  Flame, 
  Coins, 
  X,
  Sparkles,
  Shirt,
  GraduationCap,
  MessageSquare,
  Clock,
  Swords,
  Radio,
  Send,
  Eye,
  Shield,
  Layers,
  Check,
  ChevronRight,
  FlameKindling
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES
// ==========================================
interface CyberStudent {
  id: string;
  gamertag: string;
  realName: string;
  grade: string;
  clan: 'Clan Fénix' | 'Clan Serpiente';
  role: 'Estratega de Datos' | 'Analista Lógico' | 'Arquitecto de Código';
  division: 'Bronce' | 'Plata' | 'Oro' | 'Platino' | 'Diamante';
  mmr: number;
  energyCoins: number;
  streakDays: number;
  battlePassTier: number; // 1 a 7
  equippedGear: {
    jacket: string;
    goggles: string;
    backpack: string;
    title: string;
  };
}

const INITIAL_CYBER_STUDENTS: CyberStudent[] = [
  {
    id: 'cyb-rodrigo',
    gamertag: 'GamerKai',
    realName: 'Rodrigo Salinas',
    grade: '2º de Secundaria · Fase 6 SEP',
    clan: 'Clan Fénix',
    role: 'Arquitecto de Código',
    division: 'Diamante',
    mmr: 2890,
    energyCoins: 1450,
    streakDays: 30,
    battlePassTier: 3,
    equippedGear: {
      jacket: 'Chamarra Neo-Estilo (Legendario)',
      goggles: 'Gafas Hologen Cyberpunk',
      backpack: 'Mochila Tech-B Táctica',
      title: 'Maestro del Algoritmo'
    }
  },
  {
    id: 'cyb-camila',
    gamertag: 'KitsuneCode',
    realName: 'Camila Vega',
    grade: '3º de Secundaria · Fase 6 SEP',
    clan: 'Clan Fénix',
    role: 'Estratega de Datos',
    division: 'Platino',
    mmr: 2590,
    energyCoins: 2100,
    streakDays: 24,
    battlePassTier: 4,
    equippedGear: {
      jacket: 'Chaleco Táctico Visor X',
      goggles: 'Gafas Visor X Pro',
      backpack: 'Mochila Tech-B Táctica',
      title: 'Gran Maestra de Datos'
    }
  },
  {
    id: 'cyb-iker',
    gamertag: 'EchoPulse',
    realName: 'Iker Torres',
    grade: '1º de Secundaria · Fase 6 SEP',
    clan: 'Clan Serpiente',
    role: 'Analista Lógico',
    division: 'Oro',
    mmr: 1840,
    energyCoins: 920,
    streakDays: 14,
    battlePassTier: 2,
    equippedGear: {
      jacket: 'Camiseta Streetwear GTR',
      goggles: 'Gafas Visor X Pro',
      backpack: 'Mochila Tech-B Táctica',
      title: 'Explorador de Redes'
    }
  }
];

// Recompensas del Pase de Batalla (Season 2)
interface BattlePassItem {
  tier: number;
  name: string;
  category: string;
  unlocked: boolean;
  rarity: 'Común' | 'Raro' | 'Épico' | 'Legendario';
  icon: string;
}

const BATTLE_PASS_TIERS: BattlePassItem[] = [
  { tier: 1, name: 'Marco Neón Cyber', category: 'Avatar Frame', unlocked: true, rarity: 'Común', icon: '🖼️' },
  { tier: 2, name: 'Stylus Láser Táctico', category: 'Herramienta', unlocked: true, rarity: 'Raro', icon: '🗡️' },
  { tier: 3, name: 'Skin Streetwear Pro', category: 'Atuendo', unlocked: true, rarity: 'Épico', icon: '🧥' },
  { tier: 4, name: 'Puntero Láser Quantum', category: 'Gadget', unlocked: false, rarity: 'Raro', icon: '🔫' },
  { tier: 5, name: 'Teclado Dorado Esports', category: 'Periférico', unlocked: false, rarity: 'Épico', icon: '⌨️' },
  { tier: 6, name: 'Estampa Holográfica Estelar', category: 'Cosmético', unlocked: false, rarity: 'Épico', icon: '⭐' },
  { tier: 7, name: 'Blaster de Código Legendario', category: 'Arma Cósmica', unlocked: false, rarity: 'Legendario', icon: '⚡' }
];

export default function GremioCyberEsportsPage() {
  const [students, setStudents] = useState<CyberStudent[]>(INITIAL_CYBER_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('cyb-rodrigo');
  
  // Estado del Raid Boss (Chronos Overseer)
  const [bossHp, setBossHp] = useState<number>(680);
  const [bossMaxHp] = useState<number>(1000);
  const [projectDeliveries, setProjectDeliveries] = useState<number>(14);

  // Estado del Duelo de Trivia en Vivo (Arena)
  const [phoenixScore, setPhoenixScore] = useState<number>(1450);
  const [serpentScore, setSerpentScore] = useState<number>(1320);
  const [duelTimer, setDuelTimer] = useState<number>(117); // 01:57
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null);
  const [triviaFeedback, setTriviaFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [spectatorChat, setSpectatorChat] = useState<Array<{ sender: string; text: string; team: string }>>([
    { sender: 'GamerKid', text: '¡LETS GO PHOENIX! 🔥', team: 'phoenix' },
    { sender: 'RacerMax', text: '1910 for sure! 🇲🇽', team: 'serpent' },
    { sender: 'QuizQueen', text: '¡Vamos México! Velocidad máxima', team: 'phoenix' },
    { sender: 'NetCoder', text: 'Speed bonus activo, respondan ya', team: 'neutral' }
  ]);
  const [chatInput, setChatInput] = useState<string>('');

  // Modales
  const [activeModal, setActiveModal] = useState<'none' | 'arena' | 'locker' | 'store' | 'teacherStudio' | 'battlePass'>('none');
  const [selectedGearId, setSelectedGearId] = useState<string>('chamarra_neo');
  const [selectedCategory, setSelectedCategory] = useState<'Chamarra' | 'Gafas Cyber' | 'Mochila Tech' | 'Títulos de Clan'>('Chamarra');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  // Temporizador del Duelo
  useEffect(() => {
    if (activeModal !== 'arena') return;
    const interval = setInterval(() => {
      setDuelTimer(prev => (prev > 0 ? prev - 1 : 120));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeModal]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectStudent = (id: string) => {
    gamificationAudio.playClickSound();
    setActiveStudentId(id);
    const st = students.find(s => s.id === id);
    showToast(`Perfil cambiado a ${st?.gamertag} (${st?.clan})`);
  };

  // Contribución de Proyecto Escolar al Boss Raid
  const handleContributeProject = () => {
    gamificationAudio.playLevelUpSound();
    triggerConfetti();
    const damage = 120;
    setBossHp(prev => Math.max(0, prev - damage));
    setProjectDeliveries(prev => prev + 1);
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        mmr: s.mmr + 150,
        energyCoins: s.energyCoins + 250
      };
    }));
    showToast(`¡Proyecto entregado con éxito! -${damage} HP a Chronos Overseer · +150 MMR`);
  };

  // Responder Trivia en la Arena
  const handleTriviaAnswer = (optionIdx: number) => {
    setSelectedTriviaOption(optionIdx);
    if (optionIdx === 1) { // B. 1910
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setComboMultiplier(5);
      setPhoenixScore(prev => prev + 200);
      setTriviaFeedback({
        message: '¡RESPUESTA EXACTA! El movimiento revolucionario comenzó el 20 de noviembre de 1910. ¡Speed Bonus x5 aplicado para Clan Phoenix!',
        success: true
      });
      setSpectatorChat(prev => [
        ...prev,
        { sender: activeStudent.gamertag, text: '¡ACIERTO CRÍTICO! +200 PTS para Clan Fénix 🏆', team: 'phoenix' }
      ]);
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          mmr: s.mmr + 200,
          energyCoins: s.energyCoins + 300,
          battlePassTier: Math.min(7, s.battlePassTier + 1)
        };
      }));
    } else {
      gamificationAudio.playEnemyHitSound();
      setComboMultiplier(1);
      setTriviaFeedback({
        message: 'Respuesta incorrecta. Recuerda: 1810 inició la Independencia, 1857 la Constitución de Reforma y 1910 la Revolución.',
        success: false
      });
    }
  };

  const handleResetArena = () => {
    gamificationAudio.playClickSound();
    setSelectedTriviaOption(null);
    setTriviaFeedback(null);
    setComboMultiplier(1);
  };

  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    gamificationAudio.playClickSound();
    setSpectatorChat(prev => [
      ...prev,
      { sender: activeStudent.gamertag, text: chatInput.trim(), team: 'phoenix' }
    ]);
    setChatInput('');
  };

  // Equipar Ropa en el Locker
  const handleEquipGear = (gearName: string) => {
    gamificationAudio.playClickSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedGear: { ...s.equippedGear, jacket: gearName }
      };
    }));
    showToast(`¡${gearName} equipado en tu pedestal 3D!`);
  };

  // Catálogo de Gear en el Locker
  const GEAR_CATALOG = [
    {
      id: 'chamarra_neo',
      name: 'Chamarra Neo-Estilo',
      category: 'Chamarra',
      rarity: 'Legendario',
      bonus: 'Racha 30 días · 3D',
      image: '/redisenos_assets/gremio_cyber/gear_chamarra_neo_estilo.jpg',
      badgeColor: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-400'
    },
    {
      id: 'gafas_hologen',
      name: 'Gafas Hologen',
      category: 'Gafas Cyber',
      rarity: 'Épico',
      bonus: '100 PDA Completados',
      image: '/redisenos_assets/gremio_cyber/gear_gafas_hologen.jpg',
      badgeColor: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-400'
    },
    {
      id: 'gafas_visor_x',
      name: 'Gafas Visor X',
      category: 'Gafas Cyber',
      rarity: 'Raro',
      bonus: 'Visor HUD Táctico',
      image: '/redisenos_assets/gremio_cyber/gear_gafas_visor_x.jpg',
      badgeColor: 'from-blue-500 to-cyan-600',
      borderColor: 'border-cyan-400'
    },
    {
      id: 'chaleco_visor_x',
      name: 'Chaleco Táctico Visor X',
      category: 'Chamarra',
      rarity: 'Raro',
      bonus: 'Armadura Balística Tech',
      image: '/redisenos_assets/gremio_cyber/gear_chaleco_visor_x.jpg',
      badgeColor: 'from-blue-500 to-cyan-600',
      borderColor: 'border-cyan-400'
    },
    {
      id: 'mochila_tech_b',
      name: 'Mochila Tech-B',
      category: 'Mochila Tech',
      rarity: 'Raro',
      bonus: 'Almacén de Dispositivos',
      image: '/redisenos_assets/gremio_cyber/gear_mochila_tech_b.jpg',
      badgeColor: 'from-blue-500 to-cyan-600',
      borderColor: 'border-cyan-400'
    },
    {
      id: 'camiseta_gtr',
      name: 'Camiseta Street GTR',
      category: 'Chamarra',
      rarity: 'Épico',
      bonus: 'Estilo Urbano Cyber',
      image: '/redisenos_assets/gremio_cyber/gear_camiseta_gtr.jpg',
      badgeColor: 'from-purple-500 to-pink-600',
      borderColor: 'border-purple-400'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      
      {/* CONFETI ANIMADO */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#06b6d4', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'][i % 5],
                top: `${(i * 7) % 95}%`,
                left: `${(i * 13) % 98}%`,
                transform: `rotate(${i * 24}deg)`,
                animationDuration: `${1.2 + (i % 5) * 0.3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* TOAST NOTIFICACIÓN */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-cyan-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-cyan-300 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOPBAR TÁCTICA DEL GREMIO */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 px-4 sm:px-6 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver</span>
            </Link>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                07 Secundaria · eSports Didáctico (12 a 14 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Gremio Cyber-Saga: Torneo de Clanes Escolares
              </h1>
            </div>
          </div>

          {/* PERFILES & CRÉDITOS */}
          <div className="flex items-center gap-2 sm:gap-4 font-sans">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    s.id === activeStudent.id
                      ? 'bg-cyan-500 text-slate-950 shadow-md font-black scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.gamertag}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
              <span className="flex items-center gap-1 text-cyan-300">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.mmr} MMR
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.energyCoins} Monedas ISkool
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('locker');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <Shirt className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Locker</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('arena');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-rose-500/20 animate-pulse"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>Arena en Vivo</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('teacherStudio');
                }}
                className="p-2 rounded-xl bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700 text-indigo-300 text-xs font-bold"
                title="Universal Challenge Studio (Vista Docente)"
              >
                <GraduationCap className="w-4 h-4 text-indigo-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL: CANVAS MAESTRO 16:9 DE CLASE MUNDIAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* ESCENARIO MAESTRO 16:9 IDÉNTICO AL MOCKUP OFICIAL */}
        <div className="relative w-full aspect-[16/9] min-h-[520px] rounded-3xl overflow-hidden border-2 border-cyan-500/50 shadow-2xl shadow-cyan-950/40 bg-slate-950">
          
          {/* Fondo Oficial de Alta Resolución */}
          <img
            src="/redisenos_assets/gremio_cyber/cyber_master_hub_scene.jpg"
            alt="Gremio Cyber-Saga Escenario Maestro"
            className="w-full h-full object-cover object-center pointer-events-none"
          />

          {/* CAPA INTERACTIVA: HOTSPOTS Y CONTROLES VIVOS DIRECTAMENTE SOBRE EL HUB */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50">
            
            {/* Top Bar del Hub en el Escenario */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-cyan-500/40">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black text-white">{activeStudent.gamertag}</span>
                <span className="text-[11px] font-bold text-cyan-300">XP: {activeStudent.mmr}</span>
                <span className="text-[11px] text-amber-400 font-bold">⚡ 1000/150</span>
              </div>

              {/* Botón de Pase de Batalla Recompensas */}
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('battlePass');
                }}
                className="bg-cyan-950/80 hover:bg-cyan-900/90 text-cyan-300 border border-cyan-400/60 px-4 py-1.5 rounded-2xl text-xs font-black backdrop-blur-md transition-all shadow-lg shadow-cyan-950/50 flex items-center gap-1.5 hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>COSMETIC REWARDS (PASS)</span>
              </button>
            </div>

            {/* SECCIÓN INTERMEDIA: DERECHA (BATTLE PASS, LEADERBOARD, ARENA VS, RAID BOSS) */}
            <div className="flex justify-end w-full">
              <div className="w-full md:w-[62%] space-y-3">
                
                {/* 1. Track Interactivo del Pase de Batalla (7 Tiers) */}
                <div className="bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-cyan-500/40 space-y-2">
                  <div className="flex items-center justify-between text-xs font-black">
                    <span className="text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" /> Pase de Batalla · Temporada 2 (Horizonte Cuántico)
                    </span>
                    <span className="text-slate-400 text-[11px]">Nivel {activeStudent.battlePassTier} de 7 Desbloqueado</span>
                  </div>

                  <div className="grid grid-cols-7 gap-1.5">
                    {BATTLE_PASS_TIERS.map(tier => {
                      const isUnlocked = tier.tier <= activeStudent.battlePassTier;
                      return (
                        <button
                          key={tier.tier}
                          onClick={() => {
                            gamificationAudio.playClickSound();
                            showToast(`Tier ${tier.tier}: ${tier.name} (${isUnlocked ? 'Desbloqueado' : 'Bloqueado en pase'})`);
                          }}
                          className={`p-1.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                            isUnlocked
                              ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/30'
                              : 'bg-slate-900/80 border-slate-800 text-slate-500'
                          }`}
                        >
                          <span className="text-sm mb-0.5">{tier.icon}</span>
                          <span className="text-[9px] font-black uppercase block">T{tier.tier}</span>
                          <span className="text-[8px] font-bold text-slate-400 truncate w-full">
                            {isUnlocked ? 'OK' : 'LOCK'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Doble Panel: Tabla de Clanes & Arena VS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Tabla de Clanes */}
                  <div className="bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-black text-slate-300 border-b border-slate-800 pb-1">
                      <span className="flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" /> Top Clanes Salón
                      </span>
                      <span className="text-[10px] text-cyan-400 font-bold">PUNTOS</span>
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <div className="flex items-center justify-between p-1 rounded-lg bg-amber-500/10 text-amber-300 font-bold">
                        <span>🥇 1. Cyber-Dragons</span>
                        <span>4,890 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-1 rounded-lg bg-slate-900/60 text-slate-300">
                        <span>🥈 2. Neo-Shinobi</span>
                        <span>2,590 pts</span>
                      </div>
                      <div className="flex items-center justify-between p-1 rounded-lg bg-slate-900/60 text-slate-300">
                        <span>🥉 3. Static Shock</span>
                        <span>2,750 pts</span>
                      </div>
                    </div>
                  </div>

                  {/* Acceso Directo Arena Sincronizada (VS) */}
                  <div className="bg-slate-950/85 backdrop-blur-md p-3 rounded-2xl border border-rose-500/40 text-xs flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider">
                          Arena Sincronizada
                        </span>
                        <span className="text-[10px] font-mono text-cyan-300 font-black">00:34</span>
                      </div>
                      <div className="flex items-center justify-around py-1">
                        <span className="text-cyan-400 font-black text-xs">Fénix 🦅</span>
                        <span className="text-slate-500 font-extrabold text-[10px]">VS</span>
                        <span className="text-rose-400 font-black text-xs">🐍 Serpiente</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setActiveModal('arena');
                      }}
                      className="w-full py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-rose-500 hover:from-cyan-400 hover:to-rose-400 text-slate-950 font-black text-xs text-center shadow-md transition-all hover:scale-[1.02]"
                    >
                      JOIN MATCH (UNIRSE)
                    </button>
                  </div>

                </div>

                {/* 3. Raid Boss Semanal: Chronos Overseer */}
                <div className="bg-slate-950/85 backdrop-blur-md p-3.5 rounded-2xl border border-indigo-500/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/redisenos_assets/gremio_cyber/cyber_raid_boss_chronos.jpg"
                      alt="Boss Chronos Overseer"
                      className="w-12 h-12 rounded-xl object-cover border border-rose-500/50 shadow-md shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white">Boss Raid: Chronos Overseer</span>
                        <span className="text-[10px] font-bold text-rose-400">
                          {bossHp}/{bossMaxHp} HP
                        </span>
                      </div>
                      <div className="w-36 sm:w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800 mt-1">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Entregas grupales de ciencias: {projectDeliveries} registradas
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={handleContributeProject}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shrink-0 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
                  >
                    CONTRIBUTE PROJECT
                  </button>
                </div>

              </div>
            </div>

            {/* Bottom Bar: Portales de Acción Rápida */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300 font-bold">
                  Atuendo: <strong className="text-cyan-400">{activeStudent.equippedGear.jacket}</strong>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-amber-400 font-bold">
                  🔥 Racha: {activeStudent.streakDays} Días
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setActiveModal('locker');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 text-xs font-black backdrop-blur-md flex items-center gap-1.5"
                >
                  <Shirt className="w-3.5 h-3.5" />
                  <span>Personalizar Locker 3D</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* METADATOS PEDAGÓGICOS DEL GREMIO (BENCHMARKS Y ARQUITECTURA) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-black text-xs uppercase">
              <FlameKindling className="w-4 h-4 text-cyan-400" />
              <span>Pedagogía de Clanes eSports</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Fomenta la colaboración escolar mediante cuadrillas de salón (*Clan Fénix vs Clan Serpiente*). El esfuerzo individual en tareas nutre el multiplicador de puntos del grupo completo sin microtransacciones.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Speed Bonus & Precisión SEP</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Duelos de trivia en vivo basados en la Fase 6 de la NEM (Historia, Ciencias, Matemáticas). La velocidad de respuesta otorga multiplicadores de racha *Combo x5*, reforzando retención de contenidos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase">
              <Radio className="w-4 h-4 text-indigo-400" />
              <span>Comentaristas en 1ª Persona</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Cumplimiento riguroso de la Regla No Negociable 2: próceres como Venustiano Carranza o Benito Juárez comentan las jugadas clave en estricta primera persona histórica (*"Yo proclamé..."*).
            </p>
          </div>
        </div>

      </main>

      {/* ======================================================== */}
      {/* MODAL 1: ARENA DE TRIVIA EN VIVO (VIDEOJUEGO DE PREGUNTAS) */}
      {/* ======================================================== */}
      {activeModal === 'arena' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
          <div className="relative bg-slate-950 border-2 border-cyan-500/60 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Header de la Arena */}
            <div className="p-4 bg-slate-900/90 border-b border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-xl bg-rose-500/20 text-rose-300 text-xs font-black border border-rose-500/40 animate-pulse">
                  EN VIVO · ARENA DE CLANES
                </span>
                <span className="text-xs text-slate-300 font-bold hidden sm:inline">
                  Fase 6 SEP · Historia de México
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 font-mono font-black text-xs">
                  <span className="text-cyan-400">🦅 FÉNIX: {phoenixScore}</span>
                  <span className="px-2 py-0.5 rounded bg-black text-amber-400 border border-amber-500/40">
                    ⏱️ {formatTimer(duelTimer)}
                  </span>
                  <span className="text-rose-400">SERPIENTE: {serpentScore} 🐍</span>
                </div>

                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Escenario de Combate Holográfico */}
            <div className="relative flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
              
              {/* Imagen Oficial del Duelo con Pedestales */}
              <div className="relative w-full aspect-[16/9] min-h-[340px] max-h-[440px] rounded-2xl overflow-hidden border border-cyan-400/40 shadow-xl">
                <img
                  src="/redisenos_assets/gremio_cyber/cyber_arena_duel_scene.jpg"
                  alt="Duelo de Clanes Escolar"
                  className="w-full h-full object-cover"
                />

                {/* Capa de Speed Bonus Bar */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-400/50 flex items-center gap-2">
                  <span className="text-[10px] font-black text-cyan-300 uppercase tracking-widest">
                    SPEED BONUS BAR:
                  </span>
                  <span className="text-xs font-extrabold text-amber-400">
                    🔥 COMBO RACHA x{comboMultiplier} (CLAN PHOENIX)
                  </span>
                </div>
              </div>

              {/* Panel Central de la Pregunta & Opciones Holográficas */}
              <div className="bg-slate-900/90 border border-cyan-500/40 p-5 rounded-2xl space-y-4">
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400">
                    Pregunta Curricular Oficial en Pantalla Gigante:
                  </span>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    ¿EN QUÉ AÑO COMENZÓ LA REVOLUCIÓN MEXICANA?
                  </h3>
                </div>

                {/* 4 Opciones Holográficas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { label: 'A. 1810', text: 'Grito de Dolores e inicio del movimiento insurgente', isCorrect: false },
                    { label: 'B. 1910', text: 'Plan de San Luis y levantamiento armado contra el Porfiriato', isCorrect: true },
                    { label: 'C. 1857', text: 'Promulgación de la Constitución Política Liberal', isCorrect: false },
                    { label: 'D. 1920', text: 'Plan de Agua Prieta y fin del periodo bélico inicial', isCorrect: false }
                  ].map((opt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleTriviaAnswer(idx)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedTriviaOption === idx
                          ? opt.isCorrect
                            ? 'bg-emerald-950/90 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/50 scale-[1.01]'
                            : 'bg-rose-950/90 border-rose-500 text-rose-100'
                          : 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-cyan-400/60 hover:bg-slate-900'
                      }`}
                    >
                      <div>
                        <strong className="text-sm font-black block text-white">{opt.label}</strong>
                        <span className="text-xs text-slate-400">{opt.text}</span>
                      </div>
                      {selectedTriviaOption === idx && (
                        <span className="text-lg shrink-0 ml-2">
                          {opt.isCorrect ? '✅' : '❌'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Retroalimentación & Comentarista Histórico en 1ª Persona */}
                {triviaFeedback && (
                  <div className={`p-4 rounded-xl border text-xs font-bold space-y-2 ${
                    triviaFeedback.success
                      ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                      : 'bg-rose-950/70 border-rose-500/80 text-rose-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span>{triviaFeedback.message}</span>
                      <button
                        onClick={handleResetArena}
                        className="px-3 py-1.5 rounded-lg bg-black/40 text-[11px] font-black flex items-center gap-1 shrink-0 ml-3"
                      >
                        <RotateCcw className="w-3 h-3" /> Reintentar
                      </button>
                    </div>

                    {triviaFeedback.success && (
                      <div className="p-3 rounded-lg bg-slate-950/90 border border-amber-500/40 text-slate-300 space-y-1">
                        <span className="text-amber-400 font-black block flex items-center gap-1.5">
                          <Radio className="w-3.5 h-3.5 text-amber-400" /> Comentarista Histórico de Honor (Venustiano Carranza · Primera Persona Estricta):
                        </span>
                        <p className="italic text-[11px] leading-relaxed">
                          "Yo convoqué al Congreso Constituyente de Querétaro y promulgué la Constitución de 1917 para plasmar en nuestra Carta Magna los ideales y la sangre derramada por nuestro pueblo alzado en armas aquel 20 de noviembre de 1910."
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Chat de Espectadores de Salón (Moderación IA Activa) */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    Chat de Espectadores del Aula (Moderación Automática Activa)
                  </span>
                  <span className="text-[10px] text-slate-500">Solo emotes y mensajes de apoyo</span>
                </div>

                <div className="max-h-28 overflow-y-auto space-y-1.5 pr-2">
                  {spectatorChat.map((msg, i) => (
                    <div key={i} className="text-xs flex items-center gap-2">
                      <span className={`font-black text-[11px] ${
                        msg.team === 'phoenix' ? 'text-cyan-400' : msg.team === 'serpent' ? 'text-rose-400' : 'text-slate-400'
                      }`}>
                        [{msg.sender}]:
                      </span>
                      <span className="text-slate-300">{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Formulario de Chat */}
                <form onSubmit={handleSendChatMessage} className="flex gap-2 pt-1 border-t border-slate-800">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Escribe ánimos para tu clan..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: AVATAR LOCKER & PERSONALIZACIÓN TECHWEAR 3D     */}
      {/* ======================================================== */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-cyan-500/60 rounded-3xl max-w-5xl w-full p-6 space-y-5 shadow-2xl">
            
            {/* Header del Locker */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">
                  AVATAR LOCKER & PERSONALIZACIÓN STREETWEAR
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout en 3 Columnas Fiel al Mockup Oficial */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              
              {/* Columna 1: Categorías (Izquierda) */}
              <div className="md:col-span-3 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 block px-1">
                  CATEGORÍAS:
                </span>
                {(['Chamarra', 'Gafas Cyber', 'Mochila Tech', 'Títulos de Clan'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedCategory(cat);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left text-xs font-black transition-all flex items-center justify-between ${
                      selectedCategory === cat
                        ? 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-cyan-400/50'
                    }`}
                  >
                    <span>{cat}</span>
                    <ChevronRight className="w-4 h-4 opacity-70" />
                  </button>
                ))}
              </div>

              {/* Columna 2: Pedestal 3D Holográfico del Alumno (Centro) */}
              <div className="md:col-span-4 flex flex-col items-center justify-center bg-slate-900/60 p-4 rounded-3xl border border-cyan-500/30 relative overflow-hidden">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-cyan-400/40 shadow-2xl bg-black">
                  <img
                    src="/redisenos_assets/gremio_cyber/cyber_locker_scene.jpg"
                    alt="Pedestal 3D Holográfico"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-md text-[10px] font-black text-cyan-300 border border-cyan-400/30">
                    Pedestal Neón 3D
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/85 backdrop-blur-md text-[10px] font-black text-white text-center border border-white/10">
                    Atuendo: {activeStudent.equippedGear.jacket}
                  </div>
                </div>

                <div className="mt-3 text-center text-xs">
                  <span className="font-extrabold text-white block">{activeStudent.gamertag}</span>
                  <span className="text-[11px] text-cyan-400">{activeStudent.grade}</span>
                </div>
              </div>

              {/* Columna 3: Catálogo de Gear y Accesorios (Derecha) */}
              <div className="md:col-span-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400">
                    GEAR DISPONIBLE ({selectedCategory}):
                  </span>
                  <span className="text-[10px] text-cyan-400 font-bold">6 Artículos</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {GEAR_CATALOG.filter(g => selectedCategory === 'Chamarra' ? true : g.category === selectedCategory).map(gear => (
                    <div
                      key={gear.id}
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedGearId(gear.id);
                      }}
                      className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                        selectedGearId === gear.id
                          ? 'bg-cyan-950/80 border-cyan-400 ring-2 ring-cyan-400/40 shadow-lg'
                          : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-2 border border-slate-800">
                        <img
                          src={gear.image}
                          alt={gear.name}
                          className="w-full h-full object-cover"
                        />
                        <span className={`absolute top-1 right-1 text-[8px] font-black px-1.5 py-0.5 rounded bg-gradient-to-r ${gear.badgeColor} text-white`}>
                          {gear.rarity}
                        </span>
                      </div>
                      <div>
                        <strong className="text-xs font-bold text-white block truncate">{gear.name}</strong>
                        <span className="text-[10px] text-slate-400 block truncate">{gear.bonus}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEquipGear(gear.name);
                        }}
                        className="mt-2 w-full py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-black text-center"
                      >
                        Equipar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Bottom Bar del Locker */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-amber-400 flex items-center gap-1">
                  <Coins className="w-4 h-4 text-amber-400" /> Monedas ISkool: {activeStudent.energyCoins}
                </span>
                <span className="font-bold text-cyan-300">
                  Nivel 28 - Rango Diamante 💎
                </span>
              </div>

              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Personalización de avatar guardada!');
                }}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
              >
                Confirmar y Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: PASE DE BATALLA COMPLETO (SEASON 2)            */}
      {/* ======================================================== */}
      {activeModal === 'battlePass' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-cyan-500/60 rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">
                  Pase de Batalla Académico · Temporada 2 (Horizonte Cuántico)
                </h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {BATTLE_PASS_TIERS.map(tier => {
                const isUnlocked = tier.tier <= activeStudent.battlePassTier;
                return (
                  <div
                    key={tier.tier}
                    className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                      isUnlocked
                        ? 'bg-cyan-950/40 border-cyan-500/40 text-cyan-100'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{tier.icon}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-white">Tier {tier.tier}: {tier.name}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-bold">
                            {tier.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">Rareza: {tier.rarity} · Exclusivo por mérito escolar</span>
                      </div>
                    </div>

                    <button
                      disabled={!isUnlocked}
                      onClick={() => {
                        gamificationAudio.playCoinSound();
                        showToast(`¡Recompensa "${tier.name}" reclamada en tu inventario!`);
                      }}
                      className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isUnlocked
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? 'Reclamado ✅' : 'Bloqueado 🔒'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Pase
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: UNIVERSAL CHALLENGE STUDIO (DOCENTE)           */}
      {/* ======================================================== */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 border-2 border-indigo-500/60 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400">Universal Challenge Studio</span>
                  <h3 className="text-base font-extrabold text-white">Panel Maestro del Educador (Secundaria)</h3>
                </div>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 space-y-1.5">
                <span className="font-bold text-indigo-300 block">1. Modo Torneo Relámpago de Salón</span>
                <p>El profesor proyecta la arena de combate con 1 clic en la pantalla interactiva del aula. Los estudiantes participan en vivo desde sus dispositivos en competencias de 10 minutos.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">2. Sincronización Automática con Bóveda Curricular</span>
                <p>Las preguntas se nutren de los PDA SEP oficiales de Secundaria (Fase 6). Las entregas de proyectos otorgan daño directo al Boss Raid semanal.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">3. Reportes de Retención & Evaluación Formativa</span>
                <p>Analíticas inmediatas de precisión y velocidad de respuesta para orientar la retroalimentación pedagógica grupal.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Panel Docente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
