// src/components/redisenos/RedesignDocViewerModal.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Play, 
  Globe, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Cloud, 
  Layers, 
  Award,
  Sparkles,
  BookOpen,
  Shield,
  Zap,
  ChevronRight,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { RedesignDetail } from '@/lib/redisenosSandboxData';
import { REDESIGNS_EXECUTIVE_SPECS, RedesignExecutiveSpec } from '@/lib/redisenosComprehensiveData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  redesign: RedesignDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchTestMode: (redesignKey: string) => void;
  onOpenTeacherView: (redesignKey: string) => void;
}

export function RedesignDocViewerModal({ redesign, isOpen, onClose, onLaunchTestMode, onOpenTeacherView }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'screens' | 'pedagogy' | 'tech'>('overview');

  if (!isOpen || !redesign) return null;

  const spec: RedesignExecutiveSpec = REDESIGNS_EXECUTIVE_SPECS[redesign.key] || {
    key: redesign.key,
    title: redesign.title,
    level: redesign.level,
    ages: redesign.ages,
    liveDemoUrl: `/redisenos_gamificados/el_reino_de_las_huellitas`,
    tagline: redesign.tagline,
    worldBenchmarkSummary: redesign.worldBenchmark,
    hubImage: redesign.hubImage,
    quizImage: redesign.quizImage,
    avatarImage: redesign.avatarImage,
    identity: {
      educationalLevel: redesign.level,
      gameMetaphor: redesign.summary,
      coreLevelMechanic: redesign.tagline
    },
    screens: {
      hub: {
        title: 'Hub Principal de Aventura',
        visualStructure: 'Entorno 2.5D optimizado para el ritmo cognitivo del nivel.',
        keyComponents: redesign.features
      },
      quiz: {
        title: 'Videojuego de Preguntas & Desafío Lúdico',
        mechanic: 'Mecánica adaptada a la edad.',
        optionsStyle: 'Botones táctiles con retroalimentación inmediata.',
        positiveReinforcement: 'Animaciones de recompensa y confeti.',
        errorPedagogy: 'Pedagogía del error formativa sin castigo punitivo.'
      },
      avatar: {
        title: 'Personalizador de Avatar y Logros',
        customizationFeatures: ['Atuendos', 'Accesorios', 'Insignias'],
        economyModel: 'Economía virtual protegida sin microtransacciones reales.',
        gameplayIntegration: 'Visualización activa en el mundo escolar.'
      },
      teacherStudio: {
        title: 'Universal Challenge Studio',
        flowSteps: ['Crear reto', 'Previsualizar', 'Asignar'],
        polymorphicOutput: 'Conversión polimórfica instantánea.'
      }
    },
    iskoolIntegration: {
      storeConnection: 'Sincronización con useStudentStore y useGamificationStore.',
      vaultIntegration: 'Nodos curriculares en Bóveda Curricular.',
      historicalAvatarsFirstPerson: 'Personajes históricos en primera persona estricta.'
    },
    technicalChallenges: [
      { challenge: 'Rendimiento y Latencia', severity: 'Media', solution: 'Optimización y compresión estricta de activos.' }
    ],
    trainingAndAdoption: {
      trainingHours: '4 a 6 horas.',
      learningCurve: '15 minutos.',
      parentAdoption: 'Reporte formativo transparente.'
    },
    cloudViability: {
      ssoAuth: 'Google Workspace institucional.',
      cloudStorage: 'Google Drive comprimido bajo 300KB.',
      classroomIntegration: 'Sincronización con Classroom.'
    },
    globalBenchmarks: [
      { name: redesign.worldBenchmark, origin: 'Global', description: 'Referente internacional del nivel.', iskoolAdvantage: 'Alineación curricular a la NEM.' }
    ]
  };

  const handleLaunchLive = () => {
    gamificationAudio.playLevelUpSound();
    onClose();
    if (spec.key === '01') {
      router.push('/redisenos_gamificados/el_reino_de_las_huellitas');
    } else if (spec.key === '02') {
      router.push('/redisenos_gamificados/la_isla_de_los_juguetes_magicos');
    } else if (spec.key === '03') {
      router.push('/redisenos_gamificados/Guardianes_Elementales');
    } else if (spec.key === '04') {
      router.push('/redisenos_gamificados/El_Libro_de_aventuras_y_album');
    } else if (spec.liveDemoUrl) {
      router.push(spec.liveDemoUrl);
    } else {
      onLaunchTestMode(spec.key);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header con botón de prueba */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {spec.level} · {spec.ages}
              </span>
              <span className="text-xs text-slate-400">
                Referentes Mundiales: <strong className="text-slate-300">{spec.worldBenchmarkSummary}</strong>
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">{spec.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLaunchLive}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-purple-600 hover:from-emerald-400 hover:to-purple-500 text-slate-950 hover:text-white text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 ring-2 ring-emerald-400/40"
            >
              <Play className="w-4 h-4 fill-current animate-pulse" />
              Probar en Vivo (Prueba)
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: '1. Especificación & Concepto CEO' },
            { id: 'screens', label: '2. Galería de Pantallas (Mockups)' },
            { id: 'pedagogy', label: '3. Integración SEP & Bóveda' },
            { id: 'tech', label: '4. Viabilidad Cloud, Tiempos & Desafíos' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab(t.id as any);
              }}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-slate-800 text-purple-300 border border-purple-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Metáfora y Bucle */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    Metáfora de Juego e Identidad Formativa
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Alineación Oficial NEM 2024
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {spec.identity.gameMetaphor}
                </p>
                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-200">
                  <strong className="text-purple-300">Mecánica Central de Nivel:</strong> {spec.identity.coreLevelMechanic}
                </div>
              </div>

              {/* Imagen Central del Hub */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {spec.screens.hub.title}
                  </h4>
                  <span className="text-[11px] text-purple-400 font-semibold">
                    {spec.screens.hub.visualStructure}
                  </span>
                </div>
                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950 relative group">
                  <img src={spec.hubImage} alt={spec.title} className="w-full object-cover max-h-[380px]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <span className="text-xs text-white font-bold bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md">
                      Entorno Oficial del Nivel {spec.ages}
                    </span>
                    <button
                      onClick={handleLaunchLive}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Entrar al Entorno en Vivo
                    </button>
                  </div>
                </div>
              </div>

              {/* Componentes Clave del Hub */}
              <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-2">
                <span className="text-xs font-bold text-slate-300 block">Componentes Operativos del Hub:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {spec.screens.hub.keyComponents.map((comp, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{comp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmarks Mundiales y Ventaja Exclusiva ISkool (del .md) */}
              <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" />
                    Benchmarks Mundiales y Ventaja Exclusiva ISkool (Fidelidad 100% .md)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Estándares Globales
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {spec.globalBenchmarks?.map((gb, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/80 border border-slate-700/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-cyan-300">{gb.name}</span>
                        <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700">
                          {gb.origin}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] leading-relaxed">
                        {gb.description}
                      </p>
                      <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-300">
                        <strong>Ventaja Exclusiva ISkool:</strong> {gb.iskoolAdvantage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botón directo para ver perspectiva de los 2 profesores */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Docentes Asignados al Colegio Montessori</span>
                  <span className="text-[11px] text-slate-400">Revisa cómo los 2 profesores evalúan y acompañan este rediseño</span>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    onOpenTeacherView(redesign.key);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Ver Vista Docente
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PANTALLAS */}
          {activeTab === 'screens' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pantalla de Quiz Minijuego */}
                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block mb-1">
                      {spec.screens.quiz.title}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                      {spec.screens.quiz.mechanic}
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mb-3">
                      <img src={spec.quizImage} alt="Quiz" className="w-full h-48 object-cover" />
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="text-slate-300">
                        <strong className="text-emerald-300">Refuerzo Positivo:</strong> {spec.screens.quiz.positiveReinforcement}
                      </div>
                      <div className="text-slate-300">
                        <strong className="text-amber-300">Pedagogía del Error:</strong> {spec.screens.quiz.errorPedagogy}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 pt-2 border-t border-slate-700/50">
                    Estilo de controles: {spec.screens.quiz.optionsStyle}
                  </span>
                </div>

                {/* Pantalla de Avatar / Personalizador */}
                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-xs font-bold text-purple-400 block mb-1">
                      {spec.screens.avatar.title}
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                      {spec.screens.avatar.gameplayIntegration}
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mb-3">
                      <img src={spec.avatarImage} alt="Avatar" className="w-full h-48 object-cover" />
                    </div>
                    <div className="space-y-1.5 text-[11px]">
                      <div className="text-slate-300">
                        <strong className="text-purple-300">Economía Protegida:</strong> {spec.screens.avatar.economyModel}
                      </div>
                      <div className="text-slate-300">
                        <strong className="text-indigo-300">Opciones:</strong> {spec.screens.avatar.customizationFeatures.join(' · ')}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 pt-2 border-t border-slate-700/50">
                    Impacto en retención: 100% libre de micropagos con dinero real.
                  </span>
                </div>

              </div>

              {/* Estudio Universal Preview */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white block">
                    {spec.screens.teacherStudio.title}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Salida Polimórfica Inmediata
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {spec.screens.teacherStudio.polymorphicOutput}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 pt-1">
                  {spec.screens.teacherStudio.flowSteps.map((step, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300">
                      <strong className="text-purple-400 block mb-0.5">Paso {idx + 1}</strong>
                      {step}
                    </div>
                  ))}
                </div>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mt-2">
                  <img src="/redisenos_assets/gamification_teacher_universal_studio_1792734542445.jpg" alt="Universal Studio" className="w-full h-48 object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PEDAGOGÍA */}
          {activeTab === 'pedagogy' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="font-bold text-white text-sm">Alineación con la Nueva Escuela Mexicana (NEM 2024)</h4>
                <p className="leading-relaxed">
                  Todos los nodos, cofres y duelos se estructuran en torno a los 4 Campos Formativos oficiales:
                  <em> Lenguajes</em>, <em>Saberes y Pensamiento Científico</em>, <em>Ética, Naturaleza y Sociedades</em>, y <em>De lo Humano y lo Comunitario</em>.
                </p>
                <p className="leading-relaxed">
                  La evaluación es de carácter formativo: el error no castiga al alumno eliminándolo del juego, sino que abre rutas de andamiaje pedagógico con pistas guiadas del Asistente Pedagógico IA.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="font-bold text-white text-sm">Conexión con la Bóveda Curricular</h4>
                <p className="leading-relaxed">
                  {spec.iskoolIntegration.vaultIntegration}
                </p>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                  <strong className="text-purple-300 block mb-1">Sincronización de Estado:</strong>
                  {spec.iskoolIntegration.storeConnection}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="font-bold text-white text-sm">Canon Inviolable de Personajes Históricos (Voz en Primera Persona)</h4>
                <p className="leading-relaxed">
                  {spec.iskoolIntegration.historicalAvatarsFirstPerson}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VIABILIDAD & TECH */}
          {activeTab === 'tech' && (
            <div className="space-y-5 text-xs text-slate-300">
              
              {/* Tabla de Desafíos Técnicos */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Matriz de Desafíos Técnicos & Solución Arquitectónica
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 text-slate-400 text-[10px] uppercase">
                        <th className="py-2 pr-3">Desafío Técnico</th>
                        <th className="py-2 pr-3">Severidad</th>
                        <th className="py-2">Solución Arquitectónica ISkool</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {spec.technicalChallenges.map((tc, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 pr-3 font-semibold text-white">{tc.challenge}</td>
                          <td className="py-2.5 pr-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              tc.severity === 'Alta' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}>
                              {tc.severity}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-300 leading-relaxed">{tc.solution}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tiempos de Capacitación y Cloud */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Tiempos de Capacitación & Curva Docente
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• <strong>Capacitación:</strong> {spec.trainingAndAdoption.trainingHours}</li>
                    <li>• <strong>Curva de Aprendizaje:</strong> {spec.trainingAndAdoption.learningCurve}</li>
                    <li>• <strong>Adopción Familiar:</strong> {spec.trainingAndAdoption.parentAdoption}</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    Viabilidad Google Workspace & Drive
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• <strong>SSO Institucional:</strong> {spec.cloudViability.ssoAuth}</li>
                    <li>• <strong>Almacenamiento Cloud:</strong> {spec.cloudViability.cloudStorage}</li>
                    <li>• <strong>Google Classroom:</strong> {spec.cloudViability.classroomIntegration}</li>
                  </ul>
                </div>

              </div>

              {/* Benchmarks Mundiales */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3">
                <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Benchmarks Internacionales & Ventaja Competitiva de ISkool
                </h4>
                <div className="space-y-2">
                  {spec.globalBenchmarks.map((bm, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <strong className="text-purple-300">{bm.name} ({bm.origin})</strong>
                        <span className="text-[10px] text-slate-400 font-semibold">Referente Internacional</span>
                      </div>
                      <p className="text-slate-400 mb-1 leading-relaxed">{bm.description}</p>
                      <div className="text-emerald-300 font-medium">
                        ✦ <strong>Ventaja Exclusiva ISkool:</strong> {bm.iskoolAdvantage}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Aislamiento Total del Núcleo:</strong> Este rediseño opera mediante una capa visual polimórfica que no altera la base de datos de producción de ISkool. En caso de no requerirse, puede ser desactivado o eliminado en segundos sin riesgo alguno.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Colegio Montessori del Valle · Matriz Forense de Rediseños Gamificados</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Cerrar Documento
          </button>
        </div>

      </div>
    </div>
  );
}
