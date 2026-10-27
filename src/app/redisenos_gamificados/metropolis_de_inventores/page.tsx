// src/app/redisenos_gamificados/metropolis_de_inventores/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Wind, 
  Sun, 
  Zap, 
  Coins, 
  Smile, 
  ArrowLeft, 
  ShoppingBag, 
  RotateCcw, 
  CheckCircle2, 
  X,
  Factory,
  Trees,
  Award,
  Sparkles,
  Shirt,
  GraduationCap,
  Activity,
  Cpu,
  Layers,
  Settings
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS)
// ==========================================
interface MayorStudent {
  id: string;
  name: string;
  grade: string;
  title: string;
  avatarIcon: string;
  cityPopulation: number;
  cleanEnergyPercent: number;
  citizenHappiness: number;
  municipalBudget: number;
  builtDistricts: number;
  equippedGear: {
    goggles: string;
    vest: string;
    bionicArm: string;
  };
  patentsCount: number;
}

const INITIAL_MAYORS: MayorStudent[] = [
  {
    id: 'may-daniel',
    name: 'Daniel Navarro',
    grade: '2º de Secundaria · Fase 6 SEP',
    title: 'Ingeniero Jefe de Infraestructura',
    avatarIcon: '⚙️',
    cityPopulation: 45000,
    cleanEnergyPercent: 68,
    citizenHappiness: 88,
    municipalBudget: 15400,
    builtDistricts: 6,
    equippedGear: {
      goggles: 'Monóculo Térmico de Latón',
      vest: 'Chaleco de Cuero con Herramientas',
      bionicArm: 'Brazo Mecánico de Vapor'
    },
    patentsCount: 4
  },
  {
    id: 'may-valeria',
    name: 'Valeria Domínguez',
    grade: '3º de Secundaria · Fase 6 SEP',
    title: 'Alcaldesa de Sostenibilidad',
    avatarIcon: '⚡',
    cityPopulation: 82000,
    cleanEnergyPercent: 92,
    citizenHappiness: 95,
    municipalBudget: 28900,
    builtDistricts: 10,
    equippedGear: {
      goggles: 'Gafas de Observatorio Astral',
      vest: 'Bata Dieléctrica de Alta Tensión',
      bionicArm: 'Prótesis Cuántica de Titanio'
    },
    patentsCount: 9
  },
  {
    id: 'may-sebastian',
    name: 'Sebastián Pineda',
    grade: '1º de Secundaria · Fase 6 SEP',
    title: 'Urbanista Promesa',
    avatarIcon: '🚂',
    cityPopulation: 28000,
    cleanEnergyPercent: 54,
    citizenHappiness: 80,
    municipalBudget: 9600,
    builtDistricts: 4,
    equippedGear: {
      goggles: 'Lentes de Soldador Retrofuturista',
      vest: 'Peto Reforzado de Mecánico',
      bionicArm: 'Guante de Inducción Tesla'
    },
    patentsCount: 2
  }
];

interface DistrictStatus {
  id: string;
  name: string;
  energyPercent: number;
  status: 'Operativo' | 'Bajo Voltaje' | 'Óptimo';
  icon: string;
}

const CITY_DISTRICTS: DistrictStatus[] = [
  { id: 'dist-elec', name: 'Distrito Eléctrico Tesla', energyPercent: 95, status: 'Óptimo', icon: '⚡' },
  { id: 'dist-med', name: 'Distrito Médico y Hospitalario', energyPercent: 88, status: 'Operativo', icon: '🏥' },
  { id: 'dist-trans', name: 'Distrito de Transporte Magnético', energyPercent: 74, status: 'Operativo', icon: '🚂' },
  { id: 'dist-obs', name: 'Observatorio y Laboratorio STEM', energyPercent: 62, status: 'Bajo Voltaje', icon: '🔭' }
];

export default function MetropolisDeInventoresPage() {
  const [students, setStudents] = useState<MayorStudent[]>(INITIAL_MAYORS);
  const [activeStudentId, setActiveStudentId] = useState<string>('may-daniel');
  const [districts, setDistricts] = useState<DistrictStatus[]>(CITY_DISTRICTS);
  const [selectedSolution, setSelectedSolution] = useState<number | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [generatorVoltage, setGeneratorVoltage] = useState<number>(220); // Volts
  
  // Modales interactivos
  const [activeModal, setActiveModal] = useState<'none' | 'lab' | 'locker' | 'store' | 'teacherStudio'>('none');
  const [selectedInventorItem, setSelectedInventorItem] = useState<'base' | 'brazo' | 'goggles' | 'dron' | 'tesla'>('base');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  const getInventorRender = () => {
    switch (selectedInventorItem) {
      case 'brazo':
        return '/redisenos_assets/metropolis/inventor_brazo_bionico.jpg';
      case 'goggles':
        return '/redisenos_assets/metropolis/inventor_goggles_bronce.jpg';
      case 'dron':
        return '/redisenos_assets/metropolis/inventor_dron_vapor.jpg';
      case 'tesla':
        return '/redisenos_assets/metropolis/inventor_mochila_tesla.jpg';
      case 'base':
      default:
        return '/redisenos_assets/metropolis/inventor_base_taller.jpg';
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
    setSelectedSolution(null);
    setChallengeFeedback(null);
    showToast(`Alcalde activo cambiado a ${students.find(s => s.id === id)?.name}`);
  };

  const handleSolveChallenge = (optionIdx: number) => {
    setSelectedSolution(optionIdx);
    if (optionIdx === 1) { // 6 aerogeneradores + 10 celdas + baterías
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setGeneratorVoltage(380);
      setChallengeFeedback({
        message: '¡RED ELÉCTRICA OPTIMIZADA A 380V! El balance híbrido eólico-solar con almacenamiento garantiza 50 MW continuos las 24 horas. ¡El Observatorio STEM recibe energía plena!',
        success: true
      });
      // Actualizar distritos a Óptimo
      setDistricts(prev => prev.map(d => ({ ...d, energyPercent: 100, status: 'Óptimo' })));
      // Actualizar estudiante
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          cleanEnergyPercent: Math.min(100, s.cleanEnergyPercent + 10),
          citizenHappiness: Math.min(100, s.citizenHappiness + 8),
          municipalBudget: s.municipalBudget + 3500,
          patentsCount: s.patentsCount + 1
        };
      }));
    } else {
      gamificationAudio.playEnemyHitSound();
      setGeneratorVoltage(110);
      setChallengeFeedback({
        message: 'Falla de Sobrecarga en la Subestación. Los cálculos no cubren la demanda nocturna. Revisa la ley de potencia en la Bóveda Curricular.',
        success: false
      });
    }
  };

  const handleEquipGear = (gearType: 'goggles' | 'vest' | 'bionicArm', itemName: string) => {
    gamificationAudio.playClickSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        equippedGear: { ...s.equippedGear, [gearType]: itemName }
      };
    }));
    showToast(`¡${itemName} equipado!`);
  };

  const handleBuyBlueprint = (blueprintName: string, cost: number) => {
    if (activeStudent.municipalBudget < cost) {
      gamificationAudio.playEnemyHitSound();
      showToast('Presupuesto municipal insuficiente para este proyecto de infraestructura.');
      return;
    }
    gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        municipalBudget: s.municipalBudget - cost,
        builtDistricts: s.builtDistricts + 1,
        citizenHappiness: Math.min(100, s.citizenHappiness + 5)
      };
    }));
    showToast(`¡Plano "${blueprintName}" adquirido y edificio en construcción!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      
      {/* CONFETI ANIMADO */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#10b981', '#06b6d4', '#f59e0b', '#3b82f6', '#ec4899'][i % 5],
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
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black text-xs shadow-2xl flex items-center gap-2 border border-emerald-300 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-slate-950" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER METRÓPOLIS */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-emerald-900/40 px-4 sm:px-6 py-3">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/50">
                08 Secundaria · Sandbox STEM (12 a 14 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                Metrópolis de Inventores: SimCity Didáctico
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
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black scale-105'
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
                <Zap className="w-3.5 h-3.5 text-emerald-400" />
                {activeStudent.cleanEnergyPercent}% Limpia
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Coins className="w-3.5 h-3.5 text-cyan-400" />
                ${activeStudent.municipalBudget.toLocaleString()}
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
                <Shirt className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Taller</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('store');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Planos</span>
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

      {/* CONTENIDO PRINCIPAL: HUD & CUADRÍCULA DE DISTRITOS */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* PANTALLA 1: HUD MUNICIPAL DE LA METRÓPOLIS */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900 border border-emerald-800/40 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black border border-emerald-500/40">
                {activeStudent.title}
              </span>
              <span className="text-xs text-slate-400">{activeStudent.grade}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} Ecociudad Steampunk de {activeStudent.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Atuendo Activo: <strong className="text-emerald-400">{activeStudent.equippedGear.vest}</strong> · {activeStudent.equippedGear.goggles} · {activeStudent.equippedGear.bionicArm}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[100px]">
              <span className="text-xl font-black text-emerald-400 block">{activeStudent.cleanEnergyPercent}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Energía Limpia</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[100px]">
              <span className="text-xl font-black text-amber-400 block">{activeStudent.citizenHappiness}%</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Felicidad</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[100px]">
              <span className="text-xl font-black text-cyan-400 block">{activeStudent.patentsCount}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Patentes Digitales</span>
            </div>
          </div>
        </div>

        {/* DISTRITOS URBANOS & ESTADO ENERGÉTICO */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {districts.map(dist => (
            <div
              key={dist.id}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{dist.icon}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    dist.status === 'Óptimo'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : dist.status === 'Operativo'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                  }`}>
                    {dist.status}
                  </span>
                </div>
                <h4 className="font-extrabold text-white text-sm">{dist.name}</h4>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Iluminación de Distrito:</span>
                  <span className="text-emerald-400">{dist.energyPercent}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                    style={{ width: `${dist.energyPercent}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* PANTALLA 2: LABORATORIO DE CIRCUITOS Y GENERADOR TESLA */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Zap className="w-5 h-5 text-emerald-400" />
              <div>
                <h3 className="text-base font-black text-white">Laboratorio Tesla: Cálculo de Red Eléctrica Sustentable</h3>
                <p className="text-xs text-slate-400">Demanda Total del Distrito: 50 Megawatts (MW) Continuos las 24 Horas</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold block mb-1">Voltímetro Central:</span>
              <span className="text-lg font-black text-emerald-400 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                ⚡ {generatorVoltage} V AC
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Si cada aerogenerador produce 5 MW y cada celda solar aporta 2 MW en horas diurnas pico: ¿cuál combinación minimiza el costo y garantiza suministro ininterrumpido sin emisiones contaminantes?
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => handleSolveChallenge(0)}
              className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                selectedSolution === 0
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500/50'
              }`}
            >
              <span className="block text-[10px] text-slate-400 mb-1">PROPUESTA A</span>
              25 Celdas Solares Únicamente (Sin almacenamiento ni eólica)
            </button>

            <button
              onClick={() => handleSolveChallenge(1)}
              className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                selectedSolution === 1
                  ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-2 ring-emerald-400/40'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500/50'
              }`}
            >
              <span className="block text-[10px] text-emerald-400 mb-1">PROPUESTA B (INGENIERÍA ÓPTIMA)</span>
              6 Aerogeneradores (30 MW) + 10 Celdas (20 MW) con Banco de Baterías de Litio
            </button>

            <button
              onClick={() => handleSolveChallenge(2)}
              className={`p-4 rounded-2xl border text-left text-xs font-bold transition-all ${
                selectedSolution === 2
                  ? 'bg-rose-950/80 border-rose-500 text-rose-300'
                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-emerald-500/50'
              }`}
            >
              <span className="block text-[10px] text-slate-400 mb-1">PROPUESTA C</span>
              1 Central Termoeléctrica de Diésel Escolar
            </button>
          </div>

          {challengeFeedback && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              challengeFeedback.success
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500 text-rose-200'
            }`}>
              <span>{challengeFeedback.message}</span>
              <button
                onClick={() => {
                  setSelectedSolution(null);
                  setChallengeFeedback(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/50 text-[11px] font-black"
              >
                Cerrar Notificación
              </button>
            </div>
          )}
        </div>

      </main>

      {/* PANTALLA 3: PERSONALIZADOR DE AVATAR DE INVENTOR / INGENIERA */}
      {activeModal === 'locker' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Pedestal Steampunk 3D & Taller de Ingeniería</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Columna Izquierda: Viewport 3D del Inventor */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-emerald-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-emerald-400/50 shadow-2xl">
                  <img
                    src={getInventorRender()}
                    alt="Inventor STEM 3D"
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-400/30">
                    Taller Mecánico 3D
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {selectedInventorItem === 'brazo' && '🦾 Brazo Biónico de Vapor Equipado'}
                    {selectedInventorItem === 'goggles' && '🥽 Goggles de Bronce Magnificadoras'}
                    {selectedInventorItem === 'dron' && '⚙️ Dron de Vapor y Relojería Activo'}
                    {selectedInventorItem === 'tesla' && '⚡ Generador Tesla Portátil (+380V)'}
                    {selectedInventorItem === 'base' && '🔧 Atuendo Base de Taller Industrial'}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full px-2 text-xs">
                  <span className="text-slate-400 font-bold">Alcalde Inventor:</span>
                  <span className="text-emerald-300 font-black">{activeStudent.name}</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Ítems */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-2">
                    Mecanismos y Prototipos para el Pedestal 3D:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedInventorItem(prev => prev === 'brazo' ? 'base' : 'brazo');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedInventorItem === 'brazo'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🦾</span>
                      <strong className="text-xs block">Brazo Biónico</strong>
                      <span className="text-[10px] opacity-80">+40% Par Motor Mecánico</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedInventorItem(prev => prev === 'goggles' ? 'base' : 'goggles');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedInventorItem === 'goggles'
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-lg shadow-emerald-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-emerald-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🥽</span>
                      <strong className="text-xs block">Goggles Bronce</strong>
                      <span className="text-[10px] opacity-80">+35% Visión Térmica</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedInventorItem(prev => prev === 'dron' ? 'base' : 'dron');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedInventorItem === 'dron'
                          ? 'bg-amber-500 text-slate-950 border-amber-300 font-black shadow-lg shadow-amber-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-amber-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">⚙️</span>
                      <strong className="text-xs block">Dron de Vapor</strong>
                      <span className="text-[10px] opacity-80">+50% Inspección Aérea</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedInventorItem(prev => prev === 'tesla' ? 'base' : 'tesla');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedInventorItem === 'tesla'
                          ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black shadow-lg shadow-cyan-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-cyan-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">⚡</span>
                      <strong className="text-xs block">Mochila Tesla</strong>
                      <span className="text-[10px] opacity-80">+60% Potencia Dieléctrica</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      gamificationAudio.playClickSound();
                      setSelectedInventorItem('base');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 text-center"
                  >
                    Restablecer a Atuendo Base de Taller
                  </button>
                </div>
              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Equipo del Taller Mecánico 3D actualizado!');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
              >
                Confirmar y Equipar en Pedestal 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOUTIQUE DE PLANOS URBANOS (TIENDA DE RECOMPENSAS) */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Planos de Infraestructura Municipal</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-emerald-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Presupuesto: ${activeStudent.municipalBudget.toLocaleString()}
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
                  <h4 className="text-xs font-black text-emerald-300">Biblioteca Digital Comunitaria</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Aumenta en +15% la felicidad ciudadana y enlaza la Bóveda Curricular con el Lienzo Digital.</p>
                </div>
                <button
                  onClick={() => handleBuyBlueprint('Biblioteca Digital Comunitaria', 2500)}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0"
                >
                  $2,500 Presupuesto
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Central Geotérmica Subterránea</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Aporta 40 MW de energía limpia constante a los distritos hospitalario y de transporte.</p>
                </div>
                <button
                  onClick={() => handleBuyBlueprint('Central Geotérmica Subterránea', 4000)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0"
                >
                  $4,000 Presupuesto
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-300">Huerto Vertical Automatizado</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Genera alimentos sustentables para la población escolar y reduce la huella de carbono.</p>
                </div>
                <button
                  onClick={() => handleBuyBlueprint('Huerto Vertical Automatizado', 1800)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shrink-0"
                >
                  $1,800 Presupuesto
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveModal('none')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
              >
                Cerrar Planos
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
                  <h3 className="text-base font-extrabold text-white">Asignación de Megaproyectos de Ingeniería</h3>
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
                <span className="font-bold text-indigo-300 block">1. Cuadrillas Responsables de Distritos Escolares</span>
                <p>Los profesores de ciencias y matemáticas agrupan a los estudiantes en cuadrillas de ingeniería responsables de mantener iluminado y abastecido un distrito de la metrópolis durante el bimestre.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">2. Integración con el Lienzo Digital y Bóveda</span>
                <p>Los esquemas de circuitos eléctricos y proyectos sustentables diseñados en el Lienzo Digital se transforman automáticamente en patentes de ingeniería de la ciudad.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">3. Vinculación con Google Slides y Sheets</span>
                <p>Las presentaciones de patentes se sincronizan en carpetas compartidas de Google Drive para la evaluación bimestral oficial del colegio.</p>
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
