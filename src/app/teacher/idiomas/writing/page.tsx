"use client";

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/navigation/BackButton';
import { useWritingEngineStore } from '@/store/useWritingEngineStore';
import { AutonomousWritingEngineService } from '@/services/writingEngineService';
import {
  WritingLanguage,
  LanguageLevel,
  FinalEvaluationOutput,
  LEVEL_EXAM_SPECS
} from '@/types/writingEngine';
import {
  PenTool,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Target,
  FileText,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Terminal,
  Activity,
  Award,
  BookOpen,
  Calendar,
  Send,
  Zap
} from 'lucide-react';

export default function TeacherWritingDashboardPage() {
  const {
    selectedCohortGroup,
    teacherDashboard,
    allEvaluations,
    setSelectedCohortGroup,
    generateNewPrompt,
    addTeacherEvaluation
  } = useWritingEngineStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'consignas' | 'inspeccion' | 'consola'>('dashboard');
  const [selectedStudentEval, setSelectedStudentEval] = useState<FinalEvaluationOutput | null>(null);

  // Estado para generador de consignas
  const [genLanguage, setGenLanguage] = useState<WritingLanguage>('en');
  const [genLevel, setGenLevel] = useState<LanguageLevel>('B2');
  const [genTopic, setGenTopic] = useState<string>('');
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState<any>(null);

  // Estado para la consola interactiva de comandos
  const [selectedCommand, setSelectedCommand] = useState<'CREAR_CONSIGNA' | 'ANALIZAR_BORRADOR' | 'EVALUACION_FINAL' | 'DASHBOARD_DOCENTE'>('DASHBOARD_DOCENTE');
  const [consolePayloadInput, setConsolePayloadInput] = useState<string>(
    JSON.stringify({ grupo: 'Grupo Cambridge B2 - Sede Montes' }, null, 2)
  );
  const [consoleResponseOutput, setConsoleResponseOutput] = useState<any>(null);
  const [consoleLoading, setConsoleLoading] = useState<boolean>(false);

  const handleGeneratePromptDocente = () => {
    const prompt = AutonomousWritingEngineService.crearConsigna({
      idioma: genLanguage,
      nivel: genLevel,
      tema: genTopic || undefined
    });
    setLastGeneratedPrompt(prompt);
  };

  const handleExecuteConsoleCommand = () => {
    setConsoleLoading(true);
    try {
      let parsed = {};
      try {
        parsed = JSON.parse(consolePayloadInput);
      } catch (e) {
        parsed = {};
      }

      let res: any = null;
      if (selectedCommand === 'CREAR_CONSIGNA') {
        res = AutonomousWritingEngineService.crearConsigna(parsed as any);
      } else if (selectedCommand === 'ANALIZAR_BORRADOR') {
        res = AutonomousWritingEngineService.analizarBorrador(parsed as any);
      } else if (selectedCommand === 'EVALUACION_FINAL') {
        res = AutonomousWritingEngineService.evaluarTextoFinal(parsed as any);
      } else if (selectedCommand === 'DASHBOARD_DOCENTE') {
        res = AutonomousWritingEngineService.generarDashboardDocente({
          grupo: (parsed as any).grupo || selectedCohortGroup,
          evaluaciones: (parsed as any).evaluaciones || allEvaluations
        });
      }

      setConsoleResponseOutput(res);
    } catch (err: any) {
      setConsoleResponseOutput({ error: err?.message || 'Error en ejecución de comando' });
    } finally {
      setConsoleLoading(false);
    }
  };

  const handleSelectCommandTemplate = (cmd: typeof selectedCommand) => {
    setSelectedCommand(cmd);
    if (cmd === 'CREAR_CONSIGNA') {
      setConsolePayloadInput(JSON.stringify({ idioma: 'en', nivel: 'B2', tema: 'Inteligencia Artificial y Ética' }, null, 2));
    } else if (cmd === 'ANALIZAR_BORRADOR') {
      setConsolePayloadInput(JSON.stringify({
        idioma: 'en',
        nivel: 'B2',
        consigna: 'Essay on technology in education',
        borrador_actual: 'Actually, many people is using tablets in school. It depend of the infrastructure.'
      }, null, 2));
    } else if (cmd === 'EVALUACION_FINAL') {
      setConsolePayloadInput(JSON.stringify({
        idioma: 'en',
        nivel: 'B2',
        consigna: 'Essay on classroom technology',
        texto_final: 'Furthermore, educational technologies empower self-directed inquiry. However, students depend of stable internet.',
        studentName: 'Mariana Rosas'
      }, null, 2));
    } else if (cmd === 'DASHBOARD_DOCENTE') {
      setConsolePayloadInput(JSON.stringify({ grupo: selectedCohortGroup }, null, 2));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/20 selection:text-indigo-200">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Retorno y Subtítulo */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <BackButton
            fallbackUrl="/teacher/idiomas"
            label="Volver al Centro de Idiomas Docente"
            variant="header"
          />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Principio Apple Clean UX · Métricas Sin Saturación
            </span>
          </div>
        </div>

        {/* HERO APPLE CLEAN DOCENTE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Consola Docente de Escritura
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Cambridge (Pre-A1 - C2) · DELF-DALF (Pre-A1 - C2)
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
              <PenTool className="w-7 h-7 text-indigo-400" />
              Writing Engine: Supervisión & Evaluación Analítica
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl">
              Monitoreo cuantitativo directo, diagnóstico de interferencias L1 y orquestación de consignas oficiales con rigor de examen internacional.
            </p>
          </div>

          {/* Selector de Cohorte */}
          <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-slate-800">
            <Users className="w-4 h-4 text-indigo-400 ml-2" />
            <select
              value={selectedCohortGroup}
              onChange={(e) => setSelectedCohortGroup(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none pr-4 cursor-pointer"
            >
              <option value="Grupo B2 Avanzado - Sede Montes (Bachillerato)">Grupo B2 Avanzado · Sede Montes</option>
              <option value="Grupo B1 Intermedio - Sede San Cristóbal">Grupo B1 Intermedio · Sede San Cristóbal</option>
              <option value="Grupo DELF B2 Français - Campus Lagos">Grupo DELF B2 Français · Campus Lagos</option>
              <option value="Grupo A2 Key Flyers - Campus Coacalco">Grupo A2 Key Flyers · Campus Coacalco</option>
            </select>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS APPLE CLEAN */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Activity className="w-4 h-4" />
            Dashboard & Semáforo de Cohorte
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consignas')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'consignas'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generador de Consignas Oficiales
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspeccion')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'inspeccion'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            Expedientes de Alumnos ({teacherDashboard.estudiantes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consola')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'consola'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Consola de Comandos Autónomos
          </button>
        </div>

        {/* PESTAÑA 1: DASHBOARD & SEMÁFORO DE COHORTE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* RESUMEN EJECUTIVO EN 3 LÍNEAS */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Resumen Ejecutivo Pedagógico (Apple Clean UX):
              </h2>
              <div className="space-y-2 border-l-2 border-indigo-500 pl-4 py-1 text-sm text-slate-200 leading-relaxed font-sans">
                <p>1. {teacherDashboard.resumenEjecutivo3Lineas[0]}</p>
                <p>2. {teacherDashboard.resumenEjecutivo3Lineas[1]}</p>
                <p>3. {teacherDashboard.resumenEjecutivo3Lineas[2]}</p>
              </div>
            </div>

            {/* MÉTRICAS CUANTITATIVAS & SEMÁFORO DE COHORTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Promedio General */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-md">
                <p className="text-xs text-slate-400 font-bold">Promedio Global de Cohorte</p>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-white">{teacherDashboard.promedioGlobal}%</span>
                  <span className="text-xs text-teal-400 font-semibold">Escala Oficial</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Calculado sobre {teacherDashboard.totalEstudiantes} entregas</p>
              </div>

              {/* Semáforo Verde: Autónomos */}
              <div className="p-5 rounded-3xl bg-emerald-950/20 border border-emerald-500/30 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-emerald-400 font-bold">Verde · Autónomos</p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-emerald-300">
                    {teacherDashboard.semaforoCohorte.verdeAutonomosCount}
                  </span>
                  <span className="text-xs text-emerald-400 font-bold">
                    ({teacherDashboard.semaforoCohorte.verdeAutonomosPorcentaje}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">≥ 80% sin bloqueo de sintaxis</p>
              </div>

              {/* Semáforo Ámbar: Riesgo L1 */}
              <div className="p-5 rounded-3xl bg-amber-950/20 border border-amber-500/30 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-amber-400 font-bold">Ámbar · Riesgo por L1</p>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-amber-300">
                    {teacherDashboard.semaforoCohorte.ambarRiesgoL1Count}
                  </span>
                  <span className="text-xs text-amber-400 font-bold">
                    ({teacherDashboard.semaforoCohorte.ambarRiesgoL1Porcentaje}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Interferencia léxica del español</p>
              </div>

              {/* Semáforo Rojo: Bloqueo Sintáctico */}
              <div className="p-5 rounded-3xl bg-rose-950/20 border border-rose-500/30 shadow-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-rose-400 font-bold">Rojo · Bloqueo Sintáctico</p>
                  <XCircle className="w-4 h-4 text-rose-400" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-rose-300">
                    {teacherDashboard.semaforoCohorte.rojoBloqueoCount}
                  </span>
                  <span className="text-xs text-rose-400 font-bold">
                    ({teacherDashboard.semaforoCohorte.rojoBloqueoPorcentaje}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Fuera de longitud o &lt; 60%</p>
              </div>
            </div>

            {/* TOP 3 PATRONES DE ERROR RECURRENTES */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                Top 3 Patrones de Error Recurrentes en el Aula:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teacherDashboard.top3PatronesError.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.categoria}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Afecta al {item.afectaPorcentaje}%
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-100">{item.patron}</p>
                    <p className="text-xs text-slate-400 font-mono bg-slate-900 p-2 rounded-lg">
                      Ej: {item.ejemploTipico}
                    </p>
                    <p className="text-xs text-teal-300 pt-1">
                      <strong>Remedio didáctico:</strong> {item.remedioDidactico}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMENDACIÓN DE INTERVENCIÓN PARA LA SIGUIENTE CLASE EN VIVO */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Recomendación de Intervención Pedagógica para la Siguiente Clase en Vivo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-200">
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-1">
                  <span className="font-bold text-indigo-400 uppercase tracking-wider text-[10px]">Foco Principal:</span>
                  <p className="text-sm font-semibold text-white">
                    {teacherDashboard.recomendacionIntervencionPedagogicaClaseViva.focoPrincipal}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-1">
                  <span className="font-bold text-teal-400 uppercase tracking-wider text-[10px]">Actividad de Activación (10 min):</span>
                  <p>{teacherDashboard.recomendacionIntervencionPedagogicaClaseViva.actividadActivacion10Min}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/20 space-y-1">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">Material Guía de Consulta:</span>
                  <p>{teacherDashboard.recomendacionIntervencionPedagogicaClaseViva.materialGuia}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA 2: GENERADOR DE CONSIGNAS OFICIALES */}
        {activeTab === 'consignas' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Generador Autónomo de Consignas de Examen Oficial [COMANDO: CREAR_CONSIGNA]
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Crea reactivos estandarizados según especificaciones exactas de Cambridge Assessment y DELF-DALF.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Idioma */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Idioma:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenLanguage('en')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        genLanguage === 'en'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🇬🇧 Inglés (Cambridge)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenLanguage('fr')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors ${
                        genLanguage === 'fr'
                          ? 'bg-indigo-600 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      🇫🇷 Francés (DELF-DALF)
                    </button>
                  </div>
                </div>

                {/* Nivel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Nivel MCER:</label>
                  <select
                    value={genLevel}
                    onChange={(e) => setGenLevel(e.target.value as LanguageLevel)}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Pre-A1">Pre-A1 (Starters / Prim A1.1)</option>
                    <option value="A1">A1 (Movers / Junior A1)</option>
                    <option value="A2">A2 (Key Flyers / Junior A2)</option>
                    <option value="B1">B1 (Preliminary / DELF B1)</option>
                    <option value="B2">B2 (First FCE / DELF B2)</option>
                    <option value="C1">C1 (Advanced CAE / DALF C1)</option>
                    <option value="C2">C2 (Proficiency CPE / DALF C2)</option>
                  </select>
                </div>

                {/* Tema opcional */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Tema o Eje Situacional (Opcional):</label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="Ej. Movilidad Sustentable, Redes Sociales..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGeneratePromptDocente}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Ejecutar [CREAR_CONSIGNA]
                </button>
              </div>

              {/* Resultado de la consigna generada */}
              {lastGeneratedPrompt && (
                <div className="p-6 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                        {lastGeneratedPrompt.id}
                      </span>
                      <h4 className="text-base font-bold text-white mt-1">
                        {lastGeneratedPrompt.titulo}
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-teal-400">
                      Rango: {lastGeneratedPrompt.limitePalabras.min} - {lastGeneratedPrompt.limitePalabras.max} palabras
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-2">
                    <p><strong>Contexto:</strong> {lastGeneratedPrompt.contexto}</p>
                    <p className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-indigo-200">
                      <strong>Consigna:</strong> {lastGeneratedPrompt.consignaOficial}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 mb-1.5">Puntos Obligatorios:</p>
                    <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                      {lastGeneratedPrompt.puntosClaveObligatorios.map((pt: string, i: number) => (
                        <li key={i}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA 3: INSPECTOR DE EXPEDIENTES DE ALUMNOS */}
        {activeTab === 'inspeccion' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Expedientes de Alumnos y Entregas</h3>
                  <p className="text-xs text-slate-400">Monitoreo individual de calificaciones analíticas y diagnósticos L1</p>
                </div>
              </div>

              {/* TABLA APPLE CLEAN */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Estudiante</th>
                      <th className="p-3.5">Idioma & Nivel</th>
                      <th className="p-3.5">Calificación</th>
                      <th className="p-3.5">Semáforo</th>
                      <th className="p-3.5">Riesgo L1</th>
                      <th className="p-3.5">Error Principal</th>
                      <th className="p-3.5 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {teacherDashboard.estudiantes.map((std, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs">
                            {std.studentName.charAt(0)}
                          </div>
                          <span>{std.studentName}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-200">
                            {std.idioma === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'} {std.nivel}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-black text-sm text-teal-400">{std.calificacion}%</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            std.semaforo === 'verde'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : std.semaforo === 'ambar'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {std.semaforo === 'verde' ? 'Autónomo' : std.semaforo === 'ambar' ? 'Riesgo L1' : 'Bloqueo'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {std.interferenciaL1 ? (
                            <span className="text-amber-400 font-semibold">Detectada ⚠️</span>
                          ) : (
                            <span className="text-slate-500">Ninguna</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-400 max-w-xs truncate">
                          {std.errorPrincipal}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const found = allEvaluations.find(e => e.studentId === std.studentId) || allEvaluations[0];
                              setSelectedStudentEval(found);
                            }}
                            className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            Ver Rúbrica
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MODAL DETALLE DE RÚBRICA DEL ALUMNO */}
            {selectedStudentEval && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-base font-bold text-white">{selectedStudentEval.studentName}</h4>
                      <p className="text-xs text-slate-400">
                        {selectedStudentEval.idioma === 'en' ? 'Cambridge' : 'DELF-DALF'} {selectedStudentEval.nivel} · {selectedStudentEval.calificacionGlobal}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentEval(null)}
                      className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs"
                    >
                      Cerrar
                    </button>
                  </div>

                  {/* Rúbrica */}
                  {selectedStudentEval.rubricaCambridge && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Content</span>
                        <strong className="text-teal-400 text-base">{selectedStudentEval.rubricaCambridge.content}/5</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Comm. Ach.</span>
                        <strong className="text-indigo-400 text-base">{selectedStudentEval.rubricaCambridge.communicativeAchievement}/5</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Organisation</span>
                        <strong className="text-amber-400 text-base">{selectedStudentEval.rubricaCambridge.organisation}/5</strong>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                        <span className="text-slate-400 block">Language</span>
                        <strong className="text-rose-400 text-base">{selectedStudentEval.rubricaCambridge.language}/5</strong>
                      </div>
                    </div>
                  )}

                  {/* Micro-objetivos */}
                  <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 text-xs space-y-1.5">
                    <p className="font-bold text-indigo-300">Micro-objetivos asignados para la siguiente sesión:</p>
                    {selectedStudentEval.planAccionSiguienteSesion.objetivosMicroLinguisticos.map((obj, i) => (
                      <p key={i} className="text-slate-300">• {obj}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: CONSOLA DE COMANDOS AUTÓNOMOS */}
        {activeTab === 'consola' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-teal-400" />
                  Consola de Invocación Directa de Comandos Autónomos
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ejecuta cualquiera de los 4 comandos canónicos del Writing Engine y verifica su salida JSON estricta en tiempo real.
                </p>
              </div>

              {/* Selector de Comando */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(['CREAR_CONSIGNA', 'ANALIZAR_BORRADOR', 'EVALUACION_FINAL', 'DASHBOARD_DOCENTE'] as const).map(cmd => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleSelectCommandTemplate(cmd)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedCommand === cmd
                        ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    [COMANDO: {cmd}]
                  </button>
                ))}
              </div>

              {/* Panel Dual: Entrada JSON y Salida JSON */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                
                {/* Entrada */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold">Payload de Entrada (JSON):</span>
                  </div>
                  <textarea
                    value={consolePayloadInput}
                    onChange={(e) => setConsolePayloadInput(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleExecuteConsoleCommand}
                    disabled={consoleLoading}
                    className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/20"
                  >
                    <Send className="w-4 h-4" />
                    {consoleLoading ? 'Ejecutando...' : `Ejecutar [${selectedCommand}]`}
                  </button>
                </div>

                {/* Salida */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-bold">Respuesta del Motor Autónomo:</span>
                    <span className="text-[11px] text-indigo-400 font-mono">Status: 200 OK</span>
                  </div>
                  <pre className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs font-mono text-indigo-200 overflow-y-auto max-h-[320px] leading-relaxed">
                    {consoleResponseOutput
                      ? JSON.stringify(consoleResponseOutput, null, 2)
                      : '// Presiona "Ejecutar" para visualizar la salida estructurada del comando.'}
                  </pre>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
