// src/app/redisenos_gamificados/gremio_cyber_esports/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
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
  Radio
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS)
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
  battlePassTier: number; // sobre 50
  equippedGear: {
    jacket: string;
    goggles: string;
    title: string;
  };
}

const INITIAL_CYBER_STUDENTS: CyberStudent[] = [
  {
    id: 'cyb-rodrigo',
    gamertag: 'ByteHunter_99',
    realName: 'Rodrigo Salinas',
    grade: '2º de Secundaria · Fase 6 SEP',
    clan: 'Clan Fénix',
    role: 'Arquitecto de Código',
    division: 'Platino',
    mmr: 2150,
    energyCoins: 1420,
    streakDays: 19,
    battlePassTier: 28,
    equippedGear: {
      jacket: 'Chamarra Streetwear Neo-Estilo',
      goggles: 'Gafas Hologen Cyberpunk',
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
    division: 'Diamante',
    mmr: 2680,
    energyCoins: 2300,
    streakDays: 24,
    battlePassTier: 42,
    equippedGear: {
      jacket: 'Capa de Neón Resonante',
      goggles: 'Visor Cuántico de Espectro',
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
    mmr: 1740,
    energyCoins: 890,
    streakDays: 11,
    battlePassTier: 15,
    equippedGear: {
      jacket: 'Sudadera Táctica Glitch',
      goggles: 'Monóculo Termo-Digital',
      title: 'Explorador de Redes'
    }
  }
];

export default function GremioCyberEsportsPage() {
  const [students, setStudents] = useState<CyberStudent[]>(INITIAL_CYBER_STUDENTS);
  const [activeStudentId, setActiveStudentId] = useState<string>('cyb-rodrigo');
  const [dragonHp, setDragonHp] = useState<number>(150);
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<number | null>(null);
  const [triviaFeedback, setTriviaFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [comboMultiplier, setComboMultiplier] = useState<number>(1);
  const [spectatorChat, setSpectatorChat] = useState<string[]>([
    '⚡ Alumno_Mateo: ¡Vamos Rodrigo, responde rápido para el bonus!',
    '🔥 Profe_Laura: Excelente velocidad en el reto de historia.',
    '🌟 Clan_Fenix: ¡Combo de racha activado!'
  ]);
  
  // Modales interactivos
  const [activeModal, setActiveModal] = useState<'none' | 'arena' | 'locker' | 'store' | 'teacherStudio'>('none');
  const [selectedGamerItem, setSelectedGamerItem] = useState<'base' | 'auriculares' | 'chaqueta' | 'gafas' | 'guante'>('base');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  const getGamerRender = () => {
    switch (selectedGamerItem) {
      case 'auriculares':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_auriculares_rgb.jpg';
      case 'chaqueta':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_chaqueta_phoenix.jpg';
      case 'gafas':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_gafas_neon.jpg';
      case 'guante':
        return '/redisenos_assets/gremio_cyber/cyber_gamer_guante_haptico.jpg';
      case 'base':
      default:
        return '/redisenos_assets/gremio_cyber/cyber_gamer_base.jpg';
    }
  };

  const activeStudent = students.find(s => s.id === activeStudentId) || students[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const triggerConfetti = () => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  };

  const handleSelectStudent = (id: string) => {
    gamificationAudio.playClickSound();
    setActiveStudentId(id);
    handleResetArena();
    showToast(`Perfil cambiado a ${students.find(s => s.id === id)?.gamertag}`);
  };

  const handleTriviaAnswer = (optionIdx: number) => {
    setSelectedTriviaOption(optionIdx);
    if (optionIdx === 1) { // 1910 es la correcta
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setDragonHp(0);
      setComboMultiplier(5);
      setTriviaFeedback({
        message: '¡RESPUESTA EXACTA! La Revolución Mexicana estalló el 20 de noviembre de 1910. ¡Speed Bonus x5 aplicado para tu clan!',
        success: true
      });
      setSpectatorChat(prev => [
        ...prev,
        `💥 ${activeStudent.gamertag}: ¡ACIERTO CRÍTICO! +200 MMR para ${activeStudent.clan}`
      ]);
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          mmr: s.mmr + 200,
          energyCoins: s.energyCoins + 350,
          battlePassTier: Math.min(50, s.battlePassTier + 1)
        };
      }));
    } else {
      gamificationAudio.playEnemyHitSound();
      setComboMultiplier(1);
      setTriviaFeedback({
        message: 'Respuesta incorrecta. Recuerda: 1810 inició la Independencia, 1857 fue la Constitución de Reforma y 1910 el inicio del movimiento revolucionario.',
        success: false
      });
    }
  };

  const handleResetArena = () => {
    gamificationAudio.playClickSound();
    setSelectedTriviaOption(null);
    setTriviaFeedback(null);
    setDragonHp(150);
    setComboMultiplier(1);
  };

  const handleEquipJacket = (jacket: string) => {
    gamificationAudio.playClickSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedGear: { ...s.equippedGear, jacket }
      };
    }));
    showToast(`¡${jacket} equipada en tu avatar!`);
  };

  const handleBuyCosmetic = (itemName: string, cost: number) => {
    if (activeStudent.energyCoins < cost) {
      gamificationAudio.playEnemyHitSound();
      showToast('Créditos de Energía insuficientes.');
      return;
    }
    gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        energyCoins: s.energyCoins - cost
      };
    }));
    showToast(`¡Compraste "${itemName}" por ${cost} Créditos!`);
  };

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

      {/* HEADER CYBER-SAGA */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-cyan-500/30 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/redisenos_gamificados"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a Rediseños</span>
            </Link>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800/50">
                07 Secundaria · eSports Didáctico (12 a 14 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                Gremio Cyber-Saga: La Liga Escolar Táctica
              </h1>
            </div>
          </div>

          {/* PERFILES & ACCIONES */}
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
                {activeStudent.energyCoins} Créditos
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
                  setActiveModal('store');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Boutique</span>
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

      {/* CONTENIDO PRINCIPAL: HUD DEL GREMIO & ARENA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* PANTALLA 1: HUD DEL GREMIO & PASE DE BATALLA */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-500/40">
                División {activeStudent.division} · Rango {activeStudent.role}
              </span>
              <span className="text-xs text-slate-400">{activeStudent.grade}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.gamertag}</span>
              <span className="text-xs text-slate-400 font-normal">({activeStudent.realName}) · {activeStudent.clan}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Atuendo: <strong className="text-cyan-400">{activeStudent.equippedGear.jacket}</strong> · {activeStudent.equippedGear.goggles} · Racha Activa: <span className="text-amber-400 font-bold">🔥 {activeStudent.streakDays} Días Ininterrumpidos</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[120px]">
              <span className="text-xl font-black text-cyan-400 block">{activeStudent.battlePassTier}/50</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Pase de Batalla T1</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[120px]">
              <span className="text-xl font-black text-amber-400 block">{activeStudent.energyCoins}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Créditos de Energía</span>
            </div>
          </div>
        </div>

        {/* PANTALLA 2: ARENA DE TRIVIA EN VIVO (DRAGÓN GLITCH) */}
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-cyan-500/40 space-y-6 shadow-2xl">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-wider px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800/50">
                  Duelo de Escuadras Escolar
                </span>
                <span className="text-xs text-cyan-300 font-black flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" /> Combo Racha x{comboMultiplier} - {activeStudent.clan}
                </span>
              </div>
              <h3 className="text-base font-black text-white">Desafío Central: Historia de México (Fase 6 SEP)</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Pregunta en Escenario: <em>"¿En qué año comenzó la Revolución Mexicana?"</em>
              </p>
            </div>

            <div className="text-right w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-bold text-slate-300 mb-1">
                <span>Resistencia del Dragón Glitch:</span>
                <span className={dragonHp === 0 ? 'text-emerald-400 font-black' : 'text-rose-400'}>
                  {dragonHp}/150 HP
                </span>
              </div>
              <div className="w-full sm:w-48 h-3.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-gradient-to-r from-cyan-500 to-rose-500 transition-all duration-500"
                  style={{ width: `${(dragonHp / 150) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Opciones Holográficas de Respuesta */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'A. 1810', text: 'Inicio de la Independencia de México (Grito de Dolores)' },
              { label: 'B. 1910', text: 'Inicio de la Revolución Mexicana (Plan de San Luis)' },
              { label: 'C. 1857', text: 'Promulgación de la Constitución Liberal de Reforma' },
              { label: 'D. 1920', text: 'Plan de Agua Prieta y pacificación armada' }
            ].map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleTriviaAnswer(idx)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-32 ${
                  selectedTriviaOption === idx
                    ? idx === 1
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-xs font-black text-cyan-300">
                    {opt.label.split('.')[0]}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">SPEED BONUS BAR</span>
                </div>
                <div>
                  <h4 className="font-extrabold text-white text-sm mb-1">{opt.label}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{opt.text}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Retroalimentación & Comentarista Histórico en 1ª Persona */}
          {triviaFeedback && (
            <div className={`p-4 rounded-2xl border text-xs font-bold space-y-2 ${
              triviaFeedback.success
                ? 'bg-emerald-950/60 border-emerald-500/80 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500/80 text-rose-200'
            }`}>
              <div className="flex items-center justify-between">
                <span>{triviaFeedback.message}</span>
                <button
                  onClick={handleResetArena}
                  className="px-3 py-1.5 rounded-xl bg-black/40 text-[11px] font-black flex items-center gap-1 shrink-0 ml-3"
                >
                  <RotateCcw className="w-3 h-3" /> Reiniciar Duelo
                </button>
              </div>

              {triviaFeedback.success && (
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <span className="text-amber-400 font-black block flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-400" /> Comentarista Histórico Invitado de Honor (Venustiano Carranza · Primera Persona Estricta):
                  </span>
                  <p className="italic leading-relaxed">
                    "Yo proclamé la Constitución de 1917 en Querétaro para consolidar en leyes supremas las demandas de nuestro pueblo alzado en armas en 1910 contra la dictadura porfirista."
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Chat de Espectadores de Salón */}
          <div className="p-4 rounded-2xl bg-black/60 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" /> Chat de Espectadores de Aula (Moderación IA Activa)
            </span>
            <div className="space-y-1 text-slate-300">
              {spectatorChat.map((msg, i) => (
                <div key={i} className="text-[11px] font-mono leading-relaxed">
                  {msg}
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* PANTALLA 3: AVATAR LOCKER & STREETWEAR TECHWEAR */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">Pedestal eSports 3D & Avatar Techwear Locker</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Columna Izquierda: Viewport 3D del Pro Gamer */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-cyan-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-cyan-400/50 shadow-2xl">
                  <img
                    src={getGamerRender()}
                    alt="Pro Gamer eSports 3D"
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-cyan-300 border border-cyan-400/30">
                    Estadio Neón LED 3D
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {selectedGamerItem === 'auriculares' && '🎧 Auriculares RGB Pro Gamer Equipados'}
                    {selectedGamerItem === 'chaqueta' && '🔥 Chamarra Clan Phoenix del Torneo'}
                    {selectedGamerItem === 'gafas' && '🕶️ Gafas Cyber-HUD con Crosshair'}
                    {selectedGamerItem === 'guante' && '⚡ Guante Háptico eSports (+20% APM)'}
                    {selectedGamerItem === 'base' && '🎮 Techwear Base de Torneo'}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full px-2 text-xs">
                  <span className="text-slate-400 font-bold">Pro Gamer:</span>
                  <span className="text-cyan-300 font-black">{activeStudent.gamertag} ({activeStudent.realName})</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Skins y Equipamiento */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 block mb-2">
                    Skins y Periféricos para el Pedestal 3D:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedGamerItem(prev => prev === 'auriculares' ? 'base' : 'auriculares');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedGamerItem === 'auriculares'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🎧</span>
                      <strong className="text-xs block">Auriculares RGB</strong>
                      <span className="text-[10px] opacity-80">+15% Claridad de Chat</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedGamerItem(prev => prev === 'chaqueta' ? 'base' : 'chaqueta');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedGamerItem === 'chaqueta'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🔥</span>
                      <strong className="text-xs block">Chamarra Phoenix</strong>
                      <span className="text-[10px] opacity-80">+200 MMR de Prestigio</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedGamerItem(prev => prev === 'gafas' ? 'base' : 'gafas');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedGamerItem === 'gafas'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🕶️</span>
                      <strong className="text-xs block">Gafas Cyber-HUD</strong>
                      <span className="text-[10px] opacity-80">+25% Lectura de Métricas</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedGamerItem(prev => prev === 'guante' ? 'base' : 'guante');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedGamerItem === 'guante'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">⚡</span>
                      <strong className="text-xs block">Guante Háptico</strong>
                      <span className="text-[10px] opacity-80">+20% Velocidad APM</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedGamerItem('base');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 text-center"
                  >
                    Restablecer a Streetwear Base de Torneo
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Skin y Periféricos eSports actualizados!');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
              >
                Confirmar y Equipar en Pedestal 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOUTIQUE CYBER (TIENDA DE RECOMPENSAS) */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-cyan-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-extrabold text-white">Boutique Cyber eSports</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-cyan-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Saldo: {activeStudent.energyCoins} Créditos
                </span>
                <button
                  onClick={() => setActiveModal('none')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Chaqueta Streetwear Cyber Anime</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Emblema holográfico de tu colegio con luces neón reactivas al combo.</p>
                </div>
                <button
                  onClick={() => handleBuyCosmetic('Chaqueta Streetwear Cyber Anime', 650)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0"
                >
                  650 Créditos
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300">Gafas Hologen Épicas (100 PDA SEP)</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Desbloquea el análisis de velocidad de respuesta en duelos concurrentes.</p>
                </div>
                <button
                  onClick={() => handleBuyCosmetic('Gafas Hologen Épicas', 500)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0"
                >
                  500 Créditos
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Tienda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANTALLA 4: UNIVERSAL CHALLENGE STUDIO (VISTA DOCENTE) */}
      {activeModal === 'teacherStudio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-400">Universal Challenge Studio</span>
                  <h3 className="text-base font-extrabold text-white">Modo "Torneo de Salón" en Tiempo Real</h3>
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
                <span className="font-bold text-indigo-300 block">1. Proyección en Pantalla de Aula</span>
                <p>El profesor activa la arena con 1 clic para iniciar un torneo relámpago de 10 minutos al inicio o cierre de la clase. Los estudiantes se conectan desde sus dispositivos.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">2. Sincronización Automática con Google Classroom</span>
                <p>Cada entrega de tarea acreditada en Classroom otorga 100 puntos en el Pase de Batalla de ISkool sin intervención manual.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">3. Reportes Automáticos a Google Drive</span>
                <p>Las analíticas de retención y rúbricas grupales se exportan automáticamente a Google Sheets en Drive para la dirección escolar.</p>
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
