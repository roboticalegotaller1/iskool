// src/app/redisenos_gamificados/apex_academy_venture_studio/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  X,
  Award,
  Layers,
  Sparkles,
  Building,
  Target,
  QrCode,
  GraduationCap,
  Activity,
  Code,
  Check,
  Calendar,
  Shield
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS)
// ==========================================
interface FounderStudent {
  id: string;
  name: string;
  semester: string;
  startupName: string;
  sector: string;
  avatarIcon: string;
  valuation: string;
  raisedCapital: string;
  runwayMonths: number;
  growthMom: string;
  stage: 'Idea' | 'Semilla' | 'Serie A Pre';
  ventureCredits: number;
  gpa: number;
  cambridgeLevel: string;
  radarScores: {
    math: number;
    stem: number;
    writing: number;
    leadership: number;
    english: number;
  };
}

const INITIAL_FOUNDERS: FounderStudent[] = [
  {
    id: 'fnd-santiago',
    name: 'Santiago De la Vega',
    semester: '5º Semestre · Bachillerato Tecnológico',
    startupName: 'BioAlgae Solutions',
    sector: 'Biotecnología & Captura de Carbono',
    avatarIcon: '🌱',
    valuation: '$2.4M MXN',
    raisedCapital: '$450,000 MXN',
    runwayMonths: 14,
    growthMom: '+18.5%',
    stage: 'Semilla',
    ventureCredits: 3800,
    gpa: 9.7,
    cambridgeLevel: 'C1 Advanced',
    radarScores: { math: 95, stem: 92, writing: 85, leadership: 90, english: 88 }
  },
  {
    id: 'fnd-natalia',
    name: 'Natalia Ramos',
    semester: '6º Semestre · Bachillerato General',
    startupName: 'EduNeuroTech',
    sector: 'Inteligencia Artificial Pedagógica',
    avatarIcon: '🧠',
    valuation: '$4.8M MXN',
    raisedCapital: '$920,000 MXN',
    runwayMonths: 18,
    growthMom: '+27.2%',
    stage: 'Serie A Pre',
    ventureCredits: 5200,
    gpa: 9.9,
    cambridgeLevel: 'C2 Proficiency',
    radarScores: { math: 98, stem: 96, writing: 94, leadership: 95, english: 96 }
  },
  {
    id: 'fnd-alejandro',
    name: 'Alejandro Peña',
    semester: '4º Semestre · Bachillerato Internacional',
    startupName: 'LogiSolar Urban',
    sector: 'Movilidad Eléctrica Escolar',
    avatarIcon: '🔋',
    valuation: '$1.2M MXN',
    raisedCapital: '$180,000 MXN',
    runwayMonths: 8,
    growthMom: '+12.0%',
    stage: 'Idea',
    ventureCredits: 2100,
    gpa: 9.4,
    cambridgeLevel: 'B2 Vantage',
    radarScores: { math: 88, stem: 90, writing: 82, leadership: 86, english: 84 }
  }
];

export default function ApexAcademyVentureStudioPage() {
  const [students, setStudents] = useState<FounderStudent[]>(INITIAL_FOUNDERS);
  const [activeStudentId, setActiveStudentId] = useState<string>('fnd-santiago');
  const [selectedCalculusOption, setSelectedCalculusOption] = useState<number | null>(null);
  const [calculusFeedback, setCalculusFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [admissionProbability, setAdmissionProbability] = useState<number>(94);
  
  // Modales interactivos
  const [activeModal, setActiveModal] = useState<'none' | 'uniMastery' | 'radarPortfolio' | 'store' | 'teacherStudio'>('none');
  const [selectedFounderItem, setSelectedFounderItem] = useState<'base' | 'lentes' | 'maletin' | 'pin'>('base');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  const getFounderRender = () => {
    switch (selectedFounderItem) {
      case 'lentes':
        return '/redisenos_assets/apex_studio/founder_lentes_ar.jpg';
      case 'maletin':
        return '/redisenos_assets/apex_studio/founder_maletin_ejecutivo.jpg';
      case 'pin':
        return '/redisenos_assets/apex_studio/founder_pin_unicornio.jpg';
      case 'base':
      default:
        return '/redisenos_assets/apex_studio/founder_base_pedestal.jpg';
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
    setSelectedCalculusOption(null);
    setCalculusFeedback(null);
    showToast(`Fundador activo cambiado a ${students.find(s => s.id === id)?.name}`);
  };

  const handleSolveCalculus = (optIdx: number) => {
    setSelectedCalculusOption(optIdx);
    if (optIdx === 1) { // 3
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setAdmissionProbability(98);
      setCalculusFeedback({
        message: '¡DEMOSTRACIÓN IMPECABLE! lim(x->0) [sin(3x) / x] = 3. Al multiplicar y dividir por 3 se aplica el límite fundamental lim(u->0) [sin(u)/u] = 1. Probabilidad de admisión UNAM/Tec elevada al 98% (Top 2% Nacional).',
        success: true
      });
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          ventureCredits: s.ventureCredits + 500,
          valuation: '$2.8M MXN',
          radarScores: { ...s.radarScores, math: 99 }
        };
      }));
    } else {
      gamificationAudio.playEnemyHitSound();
      setCalculusFeedback({
        message: 'Resultado incorrecto. Identifica la indeterminación 0/0 y aplica la propiedad del límite trigonométrico fundamental lim(u->0) [sin(u)/u] = 1.',
        success: false
      });
    }
  };

  const handleBuyService = (serviceName: string, cost: number) => {
    if (activeStudent.ventureCredits < cost) {
      gamificationAudio.playEnemyHitSound();
      showToast('Venture Credits insuficientes.');
      return;
    }
    gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        ventureCredits: s.ventureCredits - cost,
        valuation: '$3.5M MXN'
      };
    }));
    showToast(`¡Servicio "${serviceName}" activado! Valuación actualizada.`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden">
      
      {/* CONFETI ANIMADO */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#f59e0b', '#8b5cf6', '#06b6d4', '#10b981', '#ec4899'][i % 5],
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
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-amber-300 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER VENTURE STUDIO */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-amber-500/30 px-4 sm:px-6 py-3">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-800/50">
                09 Preparatoria · Venture Studio (15 a 18 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                Apex Academy Venture Studio: Incubadora de Alto Impacto
              </h1>
            </div>
          </div>

          {/* PERFILES & BOTONERA */}
          <div className="flex items-center gap-2 sm:gap-4 font-sans">
            <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
              {students.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleSelectStudent(s.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    s.id === activeStudent.id
                      ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{s.avatarIcon}</span>
                  <span>{s.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
              <span className="flex items-center gap-1 text-emerald-300">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                {activeStudent.valuation}
              </span>
              <span className="flex items-center gap-1 text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {activeStudent.ventureCredits} Créditos
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('radarPortfolio');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <PieChart className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Radar</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('store');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Activos</span>
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

      {/* CONTENIDO PRINCIPAL: DASHBOARD EJECUTIVO */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* PANTALLA 1: HUD EJECUTIVO & METAS DE INCUBADORA */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900 border border-amber-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black border border-amber-500/40">
                Fase {activeStudent.stage} · GPA {activeStudent.gpa}
              </span>
              <span className="text-xs text-slate-400">{activeStudent.semester}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} {activeStudent.startupName}</span>
              <span className="text-xs text-slate-400 font-normal">por {activeStudent.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Sector: <strong className="text-amber-400">{activeStudent.sector}</strong> · Certificación: <span className="text-cyan-400 font-bold">{activeStudent.cambridgeLevel}</span>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-emerald-400 block">{activeStudent.valuation}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Valuación Post-Money</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-amber-400 block">{activeStudent.growthMom}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Crecimiento MoM</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-cyan-400 block">{activeStudent.runwayMonths} meses</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Runway de Caja</span>
            </div>
          </div>
        </div>

        {/* PANTALLA 2: DESAFÍO CÁLCULO UNIVERSITARIO (UNIMASTERY PRO) */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-amber-500/40 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/50">
                  Desafío de Admisión Superior
                </span>
                <span className="text-xs text-emerald-400 font-bold">UNAM / Tec / MIT Standard</span>
              </div>
              <h3 className="text-base font-black text-white">Evaluación de Cálculo Infinitesimal y Límites Notables</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Reactivo Oficial: <em>"Calcular el límite: lim(x→0) [sin(3x) / x]"</em>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold block mb-1">Probabilidad de Admisión UNAM/Tec:</span>
              <span className="text-xl font-black text-emerald-400 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                {admissionProbability}% Probabilidad
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            {[
              { opt: 0, val: '0', desc: 'Indeterminación sin resolver (0/0 errónea)' },
              { opt: 1, val: '3', desc: 'Demostración correcta: 3 · lim(3x→0) [sin(3x)/3x] = 3(1)' },
              { opt: 2, val: '1', desc: 'Confusión con el límite estándar de u=x' },
              { opt: 3, val: '∞', desc: 'Divergencia inexistente' }
            ].map((item) => (
              <button
                key={item.opt}
                onClick={() => handleSolveCalculus(item.opt)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-32 ${
                  selectedCalculusOption === item.opt
                    ? item.opt === 1
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-sm font-black text-amber-300">
                    {item.val}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">LaTeX Scratchpad</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">{item.desc}</p>
              </button>
            ))}
          </div>

          {calculusFeedback && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              calculusFeedback.success
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500 text-rose-200'
            }`}>
              <span>{calculusFeedback.message}</span>
              <button
                onClick={() => {
                  setSelectedCalculusOption(null);
                  setCalculusFeedback(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/50 text-[11px] font-black shrink-0 ml-3"
              >
                Cerrar Notificación
              </button>
            </div>
          )}
        </div>

      </main>

      {/* PANTALLA 3: PORTAFOLIO DE COMPETENCIAS & RADAR */}
      {activeModal === 'radarPortfolio' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Pedestal Ejecutivo 3D & Portafolio de Competencias</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Columna Izquierda: Viewport 3D del Founder */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-amber-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl">
                  <img
                    src={getFounderRender()}
                    alt="Founder 3D"
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30">
                    Incubadora Silicon Valley 3D
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {selectedFounderItem === 'lentes' && '🕶️ Lentes AR con Analíticas de Valuación'}
                    {selectedFounderItem === 'maletin' && '💼 Maletín Ejecutivo de Fibra con Biometría'}
                    {selectedFounderItem === 'pin' && '🦄 Pin Unicornio de Platino y Diamante'}
                    {selectedFounderItem === 'base' && '👔 Traje Ejecutivo Base de Incubadora'}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full px-2 text-xs">
                  <span className="text-slate-400 font-bold">Fundador Tech:</span>
                  <span className="text-amber-300 font-black">{activeStudent.name}</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Ítems Ejecutivos y Métricas */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-2">
                    Accesorios Ejecutivos para el Pedestal 3D:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedFounderItem(prev => prev === 'lentes' ? 'base' : 'lentes');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedFounderItem === 'lentes'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🕶️</span>
                      <strong className="text-xs block">Lentes AR Venture</strong>
                      <span className="text-[10px] opacity-80">+25% Lectura de Métricas</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedFounderItem(prev => prev === 'maletin' ? 'base' : 'maletin');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedFounderItem === 'maletin'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">💼</span>
                      <strong className="text-xs block">Maletín Biométrico</strong>
                      <span className="text-[10px] opacity-80">Blindaje de Patentes</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedFounderItem(prev => prev === 'pin' ? 'base' : 'pin');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedFounderItem === 'pin'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🦄</span>
                      <strong className="text-xs block">Pin Unicornio</strong>
                      <span className="text-[10px] opacity-80">+300 Créditos Valuación</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedFounderItem('base');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedFounderItem === 'base'
                          ? 'bg-slate-800 text-white border-slate-700 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">👔</span>
                      <strong className="text-xs block">Atuendo Base</strong>
                      <span className="text-[10px] opacity-80">Minimalista</span>
                    </button>
                  </div>
                </div>

                {/* Radar Scores */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-black text-amber-300 block">Dimensiones de Egreso Evaluadas</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Pensamiento Matemático:</span>
                      <span className="text-emerald-400">{activeStudent.radarScores.math}/100</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Habilidades STEM:</span>
                      <span className="text-cyan-400">{activeStudent.radarScores.stem}/100</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Liderazgo & Venture:</span>
                      <span className="text-purple-400">{activeStudent.radarScores.leadership}/100</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-slate-400">Inglés C1 Cambridge:</span>
                      <span className="text-rose-400">{activeStudent.radarScores.english}/100</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Portafolio y accesorios ejecutivos 3D actualizados!');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20"
              >
                Confirmar y Equipar en Pedestal 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICIOS DE ACELERACIÓN PRO (TIENDA DE RECOMPENSAS) */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-extrabold text-white">Servicios de Aceleración Pro</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-amber-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Saldo: {activeStudent.ventureCredits} Créditos
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
                  <h4 className="text-xs font-black text-amber-300">Asesoría de Registro de Patente Escolar</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Protege la propiedad intelectual de tu proyecto científico y eleva la valuación a $3.5M MXN.</p>
                </div>
                <button
                  onClick={() => handleBuyService('Asesoría de Registro de Patente Escolar', 1500)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0"
                >
                  1,500 Créditos
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Auditoría ESG & Sostenibilidad Global</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Aval internacional de sustentabilidad para becas de pregrado en Europa y Norteamérica.</p>
                </div>
                <button
                  onClick={() => handleBuyService('Auditoría ESG & Sostenibilidad Global', 2000)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0"
                >
                  2,000 Créditos
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar
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
                  <h3 className="text-base font-extrabold text-white">Rúbricas Complejas de Preparatoria en 1 Clic</h3>
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
                <span className="font-bold text-indigo-300 block">1. Evaluación Automatizada de Tesis y Reportes</span>
                <p>El profesor ingresa los criterios analíticos; el sistema evalúa automáticamente redacción formal, citas de fuentes académicas y rigurosidad metodológica.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-amber-300 block">2. Integración con Google Workspace Institucional</span>
                <p>Las tesis y proyectos se respaldan automáticamente en carpetas compartidas de Google Drive con SSO seguro @colegio.edu.mx.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">3. Portafolio de Egreso Verificable con QR</span>
                <p>Genera un link público avalado con firma digital HMAC-SHA256 para oficinas de admisión universitaria y comités de becas.</p>
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
