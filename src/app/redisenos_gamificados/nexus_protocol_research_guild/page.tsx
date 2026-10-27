// src/app/redisenos_gamificados/nexus_protocol_research_guild/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Globe2, 
  FileText, 
  Award, 
  Atom, 
  ArrowLeft, 
  ShoppingBag, 
  CheckCircle2, 
  RotateCcw, 
  X,
  Compass,
  Cpu,
  BookOpen,
  Sparkles,
  Layers,
  GraduationCap,
  QrCode,
  Terminal,
  Activity,
  Check,
  GitBranch,
  Network
} from 'lucide-react';
import { gamificationAudio } from '@/lib/redisenosAudio';

// ==========================================
// 1. MODELOS DE DATOS Y PERFILES (3 ALUMNOS)
// ==========================================
interface ResearcherStudent {
  id: string;
  name: string;
  semester: string;
  fellowshipTitle: string;
  avatarIcon: string;
  publishedPapers: number;
  hIndex: number;
  diplomacyPoints: number;
  computeHours: number;
  activeTesis: string;
  unlockedMasteryNodes: number;
  equippedCredential: {
    badge: string;
    clearanceLevel: string;
  };
}

const INITIAL_RESEARCHERS: ResearcherStudent[] = [
  {
    id: 'res-elena',
    name: 'Elena Rostova',
    semester: '6º Semestre · Bachillerato Internacional',
    fellowshipTitle: 'Senior Fellow en Diplomacia Científica',
    avatarIcon: '🌐',
    publishedPapers: 5,
    hIndex: 4,
    diplomacyPoints: 3400,
    computeHours: 120,
    activeTesis: 'Modelado Estocástico de Sequías en Cuencas del Norte de México',
    unlockedMasteryNodes: 14,
    equippedCredential: {
      badge: 'Beca de Publicación Open-Access',
      clearanceLevel: 'Nivel 5 · Cuántico'
    }
  },
  {
    id: 'res-julian',
    name: 'Julián Carvajal',
    semester: '5º Semestre · Bachillerato Tecnológico',
    fellowshipTitle: 'Investigador Asociado de Física Cuántica',
    avatarIcon: '⚛️',
    publishedPapers: 3,
    hIndex: 2,
    diplomacyPoints: 2100,
    computeHours: 85,
    activeTesis: 'Cálculo de Densidad de Estados en Materiales 2D Grafeno',
    unlockedMasteryNodes: 11,
    equippedCredential: {
      badge: 'Acceso a Supercómputo Paralelo',
      clearanceLevel: 'Nivel 4 · Avanzado'
    }
  },
  {
    id: 'res-andrea',
    name: 'Andrea Morales',
    semester: '4º Semestre · Bachillerato General',
    fellowshipTitle: 'Analista de Políticas Geopolíticas',
    avatarIcon: '📜',
    publishedPapers: 2,
    hIndex: 2,
    diplomacyPoints: 1650,
    computeHours: 40,
    activeTesis: 'Impacto Ético de la Automatización en el Empleo Juvenil',
    unlockedMasteryNodes: 8,
    equippedCredential: {
      badge: 'Acreditación de Laboratorio Social',
      clearanceLevel: 'Nivel 3 · Intermedio'
    }
  }
];

interface MasteryNode {
  id: string;
  title: string;
  discipline: string;
  status: 'dominado' | 'investigando' | 'bloqueado';
  unlockRequirement?: string;
}

const MASTERY_TREE_NODES: MasteryNode[] = [
  { id: 'node-calc', title: 'Cálculo Multivariable & Tensores', discipline: 'Matemáticas', status: 'dominado' },
  { id: 'node-ai', title: 'Redes Neuronales y Filosofía Ética', discipline: 'Ciencias de Cómputo', status: 'investigando', unlockRequirement: 'Dominar Cálculo Multivariable' },
  { id: 'node-bio', title: 'Biología Molecular & CRISPR-Cas', discipline: 'Biotecnología', status: 'dominado' },
  { id: 'node-pol', title: 'Diplomacia Científica & Tratados ONU', discipline: 'Ciencias Sociales', status: 'bloqueado', unlockRequirement: 'Completar Tesis en Bioseguridad' }
];

export default function NexusProtocolPage() {
  const [students, setStudents] = useState<ResearcherStudent[]>(INITIAL_RESEARCHERS);
  const [activeStudentId, setActiveStudentId] = useState<string>('res-elena');
  const [nodes, setNodes] = useState<MasteryNode[]>(MASTERY_TREE_NODES);
  const [selectedThesisArgument, setSelectedThesisArgument] = useState<number | null>(null);
  const [thesisFeedback, setThesisFeedback] = useState<{ message: string; success: boolean } | null>(null);
  const [peerReviewConsensus, setPeerReviewConsensus] = useState<number>(85);
  
  // Modales interactivos
  const [activeModal, setActiveModal] = useState<'none' | 'thesisDefense' | 'credentials' | 'store' | 'teacherStudio'>('none');
  const [selectedResearcherItem, setSelectedResearcherItem] = useState<'base' | 'band' | 'capa' | 'relicario'>('base');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confettiActive, setConfettiActive] = useState<boolean>(false);

  const getResearcherRender = () => {
    switch (selectedResearcherItem) {
      case 'band':
        return '/redisenos_assets/nexus_guild/investigador_neural_band.jpg';
      case 'capa':
        return '/redisenos_assets/nexus_guild/investigador_capa_academica.jpg';
      case 'relicario':
        return '/redisenos_assets/nexus_guild/investigador_relicario_cuantico.jpg';
      case 'base':
      default:
        return '/redisenos_assets/nexus_guild/investigador_base_pedestal.jpg';
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
    setSelectedThesisArgument(null);
    setThesisFeedback(null);
    showToast(`Investigador activo cambiado a ${students.find(s => s.id === id)?.name}`);
  };

  const handleDefendThesis = (argIdx: number) => {
    setSelectedThesisArgument(argIdx);
    if (argIdx === 1) { // Triangulación con datos empíricos de CONAGUA
      gamificationAudio.playLevelUpSound();
      triggerConfetti();
      setPeerReviewConsensus(99);
      setThesisFeedback({
        message: '¡CONSENSO CIENTÍFICO PLENO! El Comité de Revisión por Pares indexó tu investigación. Tu tesis sobre sequías fue admitida para la Cumbre Global con Índice H +1 y +600 Puntos de Diplomacia.',
        success: true
      });
      // Desbloquear nodo de Inteligencia Artificial Ética
      setNodes(prev => prev.map(n => n.id === 'node-ai' ? { ...n, status: 'dominado' } : n));
      setStudents(prev => prev.map(s => {
        if (s.id !== activeStudent.id) return s;
        return {
          ...s,
          publishedPapers: s.publishedPapers + 1,
          hIndex: s.hIndex + 1,
          diplomacyPoints: s.diplomacyPoints + 600,
          unlockedMasteryNodes: s.unlockedMasteryNodes + 1
        };
      }));
    } else {
      gamificationAudio.playEnemyHitSound();
      setPeerReviewConsensus(45);
      setThesisFeedback({
        message: 'Rechazo Metodológico (Peer-Review): La hipótesis carece de pruebas estadísticas de significancia (p < 0.05). Fundamenta el modelo con fuentes empíricas en la Bóveda Curricular.',
        success: false
      });
    }
  };

  const handleBuyCredential = (credentialName: string, costPoints: number) => {
    if (activeStudent.diplomacyPoints < costPoints) {
      gamificationAudio.playEnemyHitSound();
      showToast('Puntos de Diplomacia insuficientes.');
      return;
    }
    gamificationAudio.playCoinSound();
    setStudents(prev => prev.map(s => {
      if (s.id !== activeStudent.id) return s;
      return {
        ...s,
        diplomacyPoints: s.diplomacyPoints - costPoints,
        equippedCredential: {
          ...s.equippedCredential,
          badge: credentialName
        }
      };
    }));
    showToast(`¡Acreditación "${credentialName}" adquirida y registrada en tu portafolio!`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* CONFETI ANIMADO */}
      {confettiActive && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-indigo-500/10 backdrop-blur-[1px] animate-pulse" />
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-sm animate-bounce"
              style={{
                backgroundColor: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'][i % 5],
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
        <div className="fixed top-20 right-6 z-50 px-4 py-2.5 rounded-2xl bg-indigo-600 text-white font-black text-xs shadow-2xl flex items-center gap-2 border border-indigo-400 animate-in slide-in-from-top-4">
          <Sparkles className="w-4 h-4 fill-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER NEXUS PROTOCOL */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-indigo-500/30 px-4 sm:px-6 py-3">
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
              <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 bg-indigo-950/70 px-2 py-0.5 rounded border border-indigo-800/50">
                10 Preparatoria · Think Tank Global (15 a 18 Años)
              </span>
              <h1 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                Nexus Protocol: Laboratorio de Investigación y Diplomacia
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
                      ? 'bg-indigo-600 text-white shadow-md font-black scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{s.avatarIcon}</span>
                  <span>{s.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-bold">
              <span className="flex items-center gap-1 text-indigo-300">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                {activeStudent.publishedPapers} Papers (h-{activeStudent.hIndex})
              </span>
              <span className="flex items-center gap-1 text-cyan-300">
                <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
                {activeStudent.diplomacyPoints} Diplomacia
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('credentials');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700"
              >
                <Award className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Credencial</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('store');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-black text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Acreditaciones</span>
              </button>

              <button
                onClick={() => {
                  gamificationAudio.playClickSound();
                  setActiveModal('teacherStudio');
                }}
                className="p-2 rounded-xl bg-purple-950/70 hover:bg-purple-900 border border-purple-700 text-purple-300 text-xs font-bold"
                title="Universal Challenge Studio (Vista Docente)"
              >
                <GraduationCap className="w-4 h-4 text-purple-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL: HUD & ÁRBOL DE MAESTRÍA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full space-y-6">
        
        {/* PANTALLA 1: HUD DEL THINK TANK & NODOS */}
        <div className="p-5 md:p-6 rounded-3xl bg-slate-900 border border-indigo-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-black border border-indigo-500/40">
                {activeStudent.fellowshipTitle} · {activeStudent.equippedCredential.clearanceLevel}
              </span>
              <span className="text-xs text-slate-400">{activeStudent.semester}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>{activeStudent.avatarIcon} {activeStudent.name}</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              Línea de Investigación Activa: <strong className="text-indigo-300">{activeStudent.activeTesis}</strong>
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-indigo-400 block">{activeStudent.publishedPapers}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Papers Publicados</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-amber-400 block">h-{activeStudent.hIndex}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Índice H</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/90 border border-slate-800 text-center min-w-[110px]">
              <span className="text-xl font-black text-cyan-400 block">{activeStudent.unlockedMasteryNodes}/20</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Nodos de Maestría</span>
            </div>
          </div>
        </div>

        {/* GRAFO VIVO DE CONSTELACIONES Y NODOS DE MAESTRÍA */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-black text-white">Grafo de Conocimiento Vivo (Árbol de Maestría Académica)</h3>
            </div>
            <span className="text-xs text-slate-400">Dependencias curriculares interconectadas</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {nodes.map(node => (
              <div
                key={node.id}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-40 ${
                  node.status === 'dominado'
                    ? 'bg-indigo-950/30 border-indigo-500/60 shadow-lg shadow-indigo-950/30'
                    : node.status === 'investigando'
                    ? 'bg-amber-950/20 border-amber-500/60 animate-pulse'
                    : 'bg-slate-950 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                      {node.discipline}
                    </span>
                    {node.status === 'dominado' ? (
                      <span className="text-emerald-400 text-xs font-black flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Dominado
                      </span>
                    ) : node.status === 'investigando' ? (
                      <span className="text-amber-400 text-xs font-black">En Tesis</span>
                    ) : (
                      <span className="text-slate-500 text-xs font-bold">Bloqueado</span>
                    )}
                  </div>
                  <h4 className="font-extrabold text-white text-sm leading-snug">{node.title}</h4>
                </div>

                <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                  {node.unlockRequirement ? node.unlockRequirement : 'Nodo fundamental activo'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANTALLA 2: DEFENSA DE TESIS CIENTÍFICA & PANEL PEER REVIEW */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-indigo-500/40 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-950/70 border border-indigo-800/50">
                  Defensa de Paper Científico
                </span>
                <span className="text-xs text-cyan-300 font-bold">Panel de Revisión por Pares (Peer Review)</span>
              </div>
              <h3 className="text-base font-black text-white">Sínodo Académico de Graduación Internacional</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Pregunta del Comité Evaluador: <em>"¿Cómo mitiga su tesis el riesgo de sesgo en los datos satelitales al predecir caudales hidrológicos durante fenómenos climáticos extremos?"</em>
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-400 font-bold block mb-1">Consenso del Panel Peer-Review:</span>
              <span className="text-xl font-black text-indigo-400 bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800">
                {peerReviewConsensus}% Aprobación
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { idx: 0, label: 'ARGUMENTO A', text: 'Ignorar los valores atípicos (outliers) para forzar un gráfico lineal y presentable.' },
              { idx: 1, label: 'ARGUMENTO B (CIENTÍFICO RIGUROSO)', text: 'Triangulación con estaciones terrestres de CONAGUA, validación cruzada k-fold y estimadores de incertidumbre bayesianos.' },
              { idx: 2, label: 'ARGUMENTO C', text: 'Delegar la calibración a un motor automatizado sin verificación empírica de campo.' }
            ].map(item => (
              <button
                key={item.idx}
                onClick={() => handleDefendThesis(item.idx)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between h-36 ${
                  selectedThesisArgument === item.idx
                    ? item.idx === 1
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 ring-2 ring-emerald-400/40'
                      : 'bg-rose-950/80 border-rose-500 text-rose-200'
                    : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-indigo-500/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-indigo-400">{item.label}</span>
                  {selectedThesisArgument === item.idx && item.idx === 1 && (
                    <Check className="w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{item.text}</p>
              </button>
            ))}
          </div>

          {thesisFeedback && (
            <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
              thesisFeedback.success
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/60 border-rose-500 text-rose-200'
            }`}>
              <span>{thesisFeedback.message}</span>
              <button
                onClick={() => {
                  setSelectedThesisArgument(null);
                  setThesisFeedback(null);
                }}
                className="px-3 py-1.5 rounded-xl bg-black/50 text-[11px] font-black shrink-0 ml-3"
              >
                Cerrar Notificación
              </button>
            </div>
          )}
        </div>

      </main>

      {/* PANTALLA 3: CREDENCIALES Y PORTAFOLIO DE EGRESO */}
      {activeModal === 'credentials' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-4xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">Pedestal de Investigación 3D & Credenciales de Egreso</h3>
              </div>
              <button
                onClick={() => setActiveModal('none')}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Columna Izquierda: Viewport 3D del Investigador */}
              <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-950 p-4 rounded-3xl border border-indigo-500/30 shadow-inner">
                <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-indigo-400/50 shadow-2xl">
                  <img
                    src={getResearcherRender()}
                    alt="Investigador Nexus 3D"
                    className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                  />
                  <div className="absolute top-2 left-2 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-[10px] font-black text-indigo-300 border border-indigo-400/30">
                    Observatorio Estelar 3D
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-xl bg-black/80 backdrop-blur-md text-[11px] font-black text-white text-center border border-white/10">
                    {selectedResearcherItem === 'band' && '👑 Diadema Neural Violeta de Constelaciones'}
                    {selectedResearcherItem === 'capa' && '🌌 Toga Académica con Astrolabio y Constelaciones'}
                    {selectedResearcherItem === 'relicario' && '🔮 Relicario Cuántico de Singularidad Estelar'}
                    {selectedResearcherItem === 'base' && '🔬 Bata de Investigación y Laboratorio Base'}
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between w-full px-2 text-xs">
                  <span className="text-slate-400 font-bold">Investigadora:</span>
                  <span className="text-indigo-300 font-black">{activeStudent.name}</span>
                </div>
              </div>

              {/* Columna Derecha: Catálogo de Insignias y Firma QR */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-400 block mb-2">
                    Regalías Científicas para el Pedestal 3D:
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedResearcherItem(prev => prev === 'band' ? 'base' : 'band');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedResearcherItem === 'band'
                          ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">👑</span>
                      <strong className="text-xs block">Diadema Neural</strong>
                      <span className="text-[10px] opacity-80">+30% Enfoque Matemático</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedResearcherItem(prev => prev === 'capa' ? 'base' : 'capa');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedResearcherItem === 'capa'
                          ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🌌</span>
                      <strong className="text-xs block">Toga Celestial</strong>
                      <span className="text-[10px] opacity-80">Rigor Académico SEP</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedResearcherItem(prev => prev === 'relicario' ? 'base' : 'relicario');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedResearcherItem === 'relicario'
                          ? 'bg-indigo-600 text-white border-indigo-300 font-black shadow-lg shadow-indigo-500/30 scale-[1.02]'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🔮</span>
                      <strong className="text-xs block">Relicario Cuántico</strong>
                      <span className="text-[10px] opacity-80">+25% Consenso Sínodo</span>
                    </button>

                    <button
                      onClick={() => {
                        gamificationAudio.playClickSound();
                        setSelectedResearcherItem('base');
                      }}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        selectedResearcherItem === 'base'
                          ? 'bg-slate-800 text-white border-slate-700 font-black'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-indigo-400/50'
                      }`}
                    >
                      <span className="text-base block mb-0.5">🔬</span>
                      <strong className="text-xs block">Bata de Lab Base</strong>
                      <span className="text-[10px] opacity-80">Por Defecto</span>
                    </button>
                  </div>
                </div>

                {/* Firma QR Criptográfica */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-300">Firma Criptográfica SHA-256</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Inmutable en Bóveda
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-snug">
                    Tesis: <strong className="text-white">Modelación Estocástica de Sequías Mediante Estimadores Bayesianos</strong>
                  </p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <QrCode className="w-4 h-4 text-indigo-400" /> Hash: e3b0c44298fc1c14...
                    </span>
                    <span className="text-emerald-400 font-bold">Estado: Aprobada 99%</span>
                  </div>
                </div>

              </div>

            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  gamificationAudio.playLevelUpSound();
                  setActiveModal('none');
                  showToast('¡Credenciales y pedestal científico 3D actualizados!');
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-slate-950 font-black text-xs shadow-lg shadow-indigo-500/20"
              >
                Confirmar y Equipar en Pedestal 3D
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOUTIQUE DE ACREDITACIONES CIENTÍFICAS (TIENDA DE RECOMPENSAS) */}
      {activeModal === 'store' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-extrabold text-white">Acreditaciones y Recursos Científicos</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-indigo-300 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800">
                  Puntos: {activeStudent.diplomacyPoints} Diplomacia
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
                  <h4 className="text-xs font-black text-indigo-300">Beca de Publicación Open-Access</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Financia los cargos de procesamiento de artículos (APC) en revistas académicas internacionales indexadas.</p>
                </div>
                <button
                  onClick={() => handleBuyCredential('Beca de Publicación Open-Access', 1000)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shrink-0"
                >
                  1,000 Puntos
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-cyan-300">Acceso a Supercómputo Paralelo (100 Horas)</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">Permite compilar simulaciones físicas complejas en cluster de alta velocidad.</p>
                </div>
                <button
                  onClick={() => handleBuyCredential('Acceso a Supercómputo Paralelo', 1500)}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shrink-0"
                >
                  1,500 Puntos
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
          <div className="bg-slate-900 border border-purple-500/50 rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-400" />
                <div>
                  <span className="text-[10px] font-black uppercase text-purple-400">Universal Challenge Studio</span>
                  <h3 className="text-base font-extrabold text-white">Diseño de Retos Basados en Problemas (ABP)</h3>
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
              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/50 space-y-1.5">
                <span className="font-bold text-purple-300 block">1. Formulación de Desafíos Científicos Reales</span>
                <p>El profesorado estructura problemas empíricos (transición energética, secuenciación genética, análisis constitucional) asignados a las cuadrillas de Nexus.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-cyan-300 block">2. Hipervínculos a la Bóveda Curricular</span>
                <p>Cada nodo del árbol de maestría se enlaza directamente con los documentos Markdown de la Bóveda con enlaces bidireccionales sin requerir herramientas externas.</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-bold text-emerald-300 block">3. Interacción con Figuras Históricas en 1ª Persona</span>
                <p>Los estudiantes pueden debatir con próceres sobre federalismo y soberanía constitucional manteniendo un rigor histórico en primera persona estricta.</p>
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
