"use client";

import React, { useState, useMemo } from 'react';
import { Header } from '@/components/Header';
import { BackButton } from '@/components/navigation/BackButton';
import { useWritingEngineStore } from '@/store/useWritingEngineStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { AutonomousWritingEngineService } from '@/services/writingEngineService';
import {
  WritingLanguage,
  LanguageLevel,
  FinalEvaluationOutput
} from '@/types/writingEngine';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Target,
  FileText,
  Terminal,
  Activity,
  Send,
  Zap
} from 'lucide-react';

export default function TeacherWritingDashboardPage() {
  const {
    selectedCohortGroup,
    teacherDashboard,
    allEvaluations,
    setSelectedCohortGroup
  } = useWritingEngineStore();

  const schools = useSchoolAdminStore(state => state.institutionsList);
  const campuses = useSchoolAdminStore(state => state.campusesList);
  const groups = useSchoolAdminStore(state => state.groupsList);

  // Mapeo dinámico multi-colegio para escuelas creadas o futuras
  const cohortsBySchool = useMemo(() => {
    const result: Record<string, { id: string; label: string }[]> = {
      'Instituto Bilingüe (IBIME)': [
        { id: 'Grupo B2 Avanzado - Sede Montes (Bachillerato)', label: 'Grupo B2 Avanzado · Sede Montes' },
        { id: 'Grupo B1 Intermedio - Sede San Cristóbal', label: 'Grupo B1 Intermedio · Sede San Cristóbal' },
        { id: 'Grupo DELF B2 Français - Campus Lagos', label: 'Grupo DELF B2 Français · Campus Lagos' },
        { id: 'Grupo A2 Key Flyers - Campus Coacalco', label: 'Grupo A2 Key Flyers · Campus Coacalco' }
      ],
      'Colegio Montessori del Valle': [
        { id: 'Taller Cambridge B1 - Primaria Montessori', label: '1ºA Primaria · Taller Cambridge B1' },
        { id: 'Atelier DELF A2 - Secundaria Montessori', label: '1ºA Secundaria · Atelier DELF A2' }
      ],
      'Colegio Jean-Jacques Rousseau': [
        { id: 'Laboratorio Bilingüe A2 - Primaria Jardines', label: 'Primaria Jardines · Lab Bilingüe A2' },
        { id: 'Cambridge First B2 - Secundaria Torres', label: 'Secundaria Torres · Cambridge B2' }
      ]
    };

    // Añadir grupos registrados en useSchoolAdminStore (cualquier colegio creado o futuro)
    (groups || []).forEach((g: any) => {
      const parentSchool = (schools || []).find((s: any) => s.id === g.school_id);
      const parentCampus = (campuses || []).find((c: any) => c.id === g.campus_id);
      const schoolName = parentSchool?.name || 'Colegio Registrado';
      const campusName = parentCampus?.name || g.campus_name || 'Plantel Matriz';
      const groupLabel = `${g.name} (${campusName})`;
      const fullId = `${g.name} - ${campusName} (${schoolName})`;

      if (!result[schoolName]) {
        result[schoolName] = [];
      }
      if (!result[schoolName].some(c => c.id === fullId || c.label === groupLabel)) {
        result[schoolName].push({ id: fullId, label: groupLabel });
      }
    });

    return result;
  }, [schools, campuses, groups]);

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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
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
            <span className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-white border-2 border-slate-200 text-slate-700 flex items-center gap-1.5 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Diseño Ejecutivo Nano Banana 2.1 · Claridad Analítica 0% IA
            </span>
          </div>
        </div>

        {/* HERO NANO BANANA 2.1 DOCENTE (MODO CLARO GAMIFICADO) */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white via-indigo-50/40 to-amber-50/30 border-2 border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src="/images/languages/nanobanana-gamified/nb_socratic_quill_scroll.webp"
              alt="Consola Docente de Escritura Socrática"
              className="w-16 h-16 rounded-2xl object-contain bg-white border-2 border-slate-200 p-1.5 shadow-xs shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Consola Docente de Escritura Socrática
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Cambridge (Pre-A1 - C2) · DELF-DALF (Pre-A1 - C2)
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                  <img
                    src="/images/languages/nanobanana-gamified/nb_socratic_gold_coin.webp"
                    alt="Monedas Socráticas"
                    className="w-3.5 h-3.5 object-contain"
                  />
                  0% Ghostwriting
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-3">
                Writing Engine: Supervisión & Evaluación Analítica
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Monitoreo cuantitativo directo, diagnóstico de interferencias L1 y orquestación de consignas oficiales con rigor de examen internacional y validación de Monedas de Oro Socráticas.
              </p>
            </div>
          </div>

          {/* Selector de Cohorte */}
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-2xl border-2 border-slate-200 shadow-xs">
            <Users className="w-4 h-4 text-indigo-600 ml-2 shrink-0" />
            <select
              value={selectedCohortGroup}
              onChange={(e) => setSelectedCohortGroup(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none pr-4 cursor-pointer"
            >
              {Object.entries(cohortsBySchool).map(([schoolName, cohortList]) => (
                <optgroup key={schoolName} label={`🏫 ${schoolName}`} className="bg-white text-indigo-700 font-bold">
                  {cohortList.map(c => (
                    <option key={c.id} value={c.id} className="bg-white text-slate-800 font-normal">
                      {c.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS NANO BANANA 2.1 */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Dashboard & Semáforo de Cohorte
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consignas')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'consignas'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Generador de Consignas Oficiales
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('inspeccion')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'inspeccion'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            Expedientes de Alumnos ({teacherDashboard.estudiantes.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('consola')}
            className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'consola'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Simulador de Comandos Autónomos
          </button>
        </div>

        {/* PESTAÑA 1: DASHBOARD & SEMÁFORO DE COHORTE */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            
            {/* RESUMEN EJECUTIVO EN 3 LÍNEAS */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Resumen Ejecutivo Pedagógico (Nano Banana 2.1):
              </h2>
              <div className="space-y-2 border-l-4 border-indigo-500 pl-4 py-1 text-sm text-slate-700 leading-relaxed font-sans">
                <p>1. {teacherDashboard.resumenEjecutivo3Lineas[0]}</p>
                <p>2. {teacherDashboard.resumenEjecutivo3Lineas[1]}</p>
                <p>3. {teacherDashboard.resumenEjecutivo3Lineas[2]}</p>
              </div>
            </div>

            {/* MÉTRICAS CUANTITATIVAS & SEMÁFORO DE COHORTE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Promedio General */}
              <div className="p-5 rounded-3xl bg-white border-2 border-slate-200 shadow-xs flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 font-bold">Promedio Global de Cohorte</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black text-slate-900">{teacherDashboard.promedioGlobal}%</span>
                    <span className="text-xs text-indigo-700 font-bold">Escala Oficial</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Calculado sobre {teacherDashboard.totalEstudiantes} entregas</p>
                </div>
                <img
                  src="/images/languages/nanobanana-gamified/nb_cenni_sep_gold_medal.webp"
                  alt="Promedio"
                  className="w-11 h-11 object-contain shrink-0"
                />
              </div>

              {/* Semáforo Verde: Autónomos */}
              <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-emerald-800 font-black">Verde · Autónomos</p>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-emerald-700">
                    {teacherDashboard.semaforoCohorte.verdeAutonomosCount}
                  </span>
                  <span className="text-xs text-emerald-700 font-bold">
                    ({teacherDashboard.semaforoCohorte.verdeAutonomosPorcentaje}%)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-1">≥ 80% sin bloqueo de sintaxis</p>
              </div>

              {/* Semáforo Ámbar: Riesgo L1 */}
              <div className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-amber-800 font-black">Ámbar · Riesgo por L1</p>
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-amber-700">
                    {teacherDashboard.semaforoCohorte.ambarRiesgoL1Count}
                  </span>
                  <span className="text-xs text-amber-700 font-bold">
                    ({teacherDashboard.semaforoCohorte.ambarRiesgoL1Porcentaje}%)
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 mt-1">Interferencia léxica del español</p>
              </div>

              {/* Semáforo Rojo: Bloqueo Sintáctico */}
              <div className="p-5 rounded-3xl bg-rose-50/70 border-2 border-rose-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-rose-800 font-black">Rojo · Bloqueo Sintáctico</p>
                  <XCircle className="w-4 h-4 text-rose-600" />
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-3xl font-black text-rose-700">
                    {teacherDashboard.semaforoCohorte.rojoBloqueoCount}
                  </span>
                  <span className="text-xs text-rose-700 font-bold">
                    ({teacherDashboard.semaforoCohorte.rojoBloqueoPorcentaje}%)
                  </span>
                </div>
                <p className="text-[11px] text-rose-800/80 mt-1">Fuera de longitud o &lt; 60%</p>
              </div>
            </div>

            {/* TOP 3 PATRONES DE ERROR RECURRENTES */}
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Top 3 Patrones de Error Recurrentes en el Aula:
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {teacherDashboard.top3PatronesError.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        {item.categoria}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        Afecta al {item.afectaPorcentaje}%
                      </span>
                    </div>

                    <p className="text-sm font-black text-slate-900">{item.patron}</p>
                    <p className="text-xs text-slate-700 font-mono bg-white border border-slate-200 p-2 rounded-lg">
                      Ej: {item.ejemploTipico}
                    </p>
                    <p className="text-xs text-emerald-700 pt-1">
                      <strong>Remedio didáctico:</strong> {item.remedioDidactico}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMENDACIÓN DE INTERVENCIÓN PARA LA SIGUIENTE CLASE EN VIVO */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50/70 via-white to-emerald-50/50 border-2 border-indigo-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h3 className="text-base font-black text-slate-900">
                  Recomendación de Intervención Pedagógica para la Siguiente Clase en Vivo
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700">
                <div className="p-4 rounded-2xl bg-white border border-indigo-200 space-y-1 shadow-2xs">
                  <span className="font-black text-indigo-700 uppercase tracking-wider text-[10px]">Foco Principal:</span>
                  <p className="text-sm font-bold text-slate-900">
                    {teacherDashboard.recomendacionIntervencionPedagogicaClaseViva.focoPrincipal}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-emerald-200 space-y-1 shadow-2xs">
                  <span className="font-black text-emerald-700 uppercase tracking-wider text-[10px]">Actividad de Activación (10 min):</span>
                  <p>{teacherDashboard.recomendacionIntervencionPedagogicaClaseViva.actividadActivacion10Min}</p>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-amber-200 space-y-1 shadow-2xs">
                  <span className="font-black text-amber-700 uppercase tracking-wider text-[10px]">Material Guía de Consulta:</span>
                  <p>{teacherDashboard.recomendacionIntervencionPedagogicaClaseViva.materialGuia}</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* PESTAÑA 2: GENERADOR DE CONSIGNAS OFICIALES */}
        {activeTab === 'consignas' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-6">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  Generador Autónomo de Consignas de Examen Oficial [COMANDO: CREAR_CONSIGNA]
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Crea reactivos estandarizados según especificaciones exactas de Cambridge Assessment y DELF-DALF.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Idioma */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Idioma:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenLanguage('en')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        genLanguage === 'en'
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🇬🇧 Inglés (Cambridge)
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenLanguage('fr')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                        genLanguage === 'fr'
                          ? 'bg-indigo-600 border-indigo-600 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      🇫🇷 Francés (DELF-DALF)
                    </button>
                  </div>
                </div>

                {/* Nivel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Nivel MCER:</label>
                  <select
                    value={genLevel}
                    onChange={(e) => setGenLevel(e.target.value as LanguageLevel)}
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  <label className="text-xs font-bold text-slate-700">Tema o Eje Situacional (Opcional):</label>
                  <input
                    type="text"
                    value={genTopic}
                    onChange={(e) => setGenTopic(e.target.value)}
                    placeholder="Ej. Movilidad Sustentable, Redes Sociales..."
                    className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGeneratePromptDocente}
                  className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Ejecutar [CREAR_CONSIGNA]
                </button>
              </div>

              {/* Resultado de la consigna generada */}
              {lastGeneratedPrompt && (
                <div className="p-6 rounded-2xl bg-slate-50 border-2 border-indigo-200 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {lastGeneratedPrompt.id}
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-1">
                        {lastGeneratedPrompt.titulo}
                      </h4>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-white border border-slate-200 text-emerald-700">
                      Rango: {lastGeneratedPrompt.limitePalabras.min} - {lastGeneratedPrompt.limitePalabras.max} palabras
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-2">
                    <p><strong>Contexto:</strong> {lastGeneratedPrompt.contexto}</p>
                    <p className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200 text-indigo-950">
                      <strong>Consigna:</strong> {lastGeneratedPrompt.consignaOficial}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-600 mb-1.5">Puntos Obligatorios:</p>
                    <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
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
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900">Expedientes de Alumnos y Entregas</h3>
                  <p className="text-xs text-slate-600">Monitoreo individual de calificaciones analíticas y diagnósticos L1</p>
                </div>
              </div>

              {/* TABLA NANO BANANA 2.1 */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-200">
                    {teacherDashboard.estudiantes.map((std, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-black">
                            {std.studentName.charAt(0)}
                          </div>
                          <span>{std.studentName}</span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-bold text-slate-700">
                            {std.idioma === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'} {std.nivel}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className="font-black text-sm text-indigo-700">{std.calificacion}%</span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            std.semaforo === 'verde'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : std.semaforo === 'ambar'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {std.semaforo === 'verde' ? 'Autónomo' : std.semaforo === 'ambar' ? 'Riesgo L1' : 'Bloqueo'}
                          </span>
                        </td>
                        <td className="p-3.5">
                          {std.interferenciaL1 ? (
                            <span className="text-amber-700 font-semibold">Detectada ⚠️</span>
                          ) : (
                            <span className="text-slate-400">Ninguna</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-xs truncate">
                          {std.errorPrincipal}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              const found = allEvaluations.find(e => e.studentId === std.studentId) || allEvaluations[0];
                              setSelectedStudentEval(found);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-colors cursor-pointer"
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
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
                <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{selectedStudentEval.studentName}</h4>
                      <p className="text-xs text-slate-600">
                        {selectedStudentEval.idioma === 'en' ? 'Cambridge' : 'DELF-DALF'} {selectedStudentEval.nivel} · {selectedStudentEval.calificacionGlobal}%
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentEval(null)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      Cerrar
                    </button>
                  </div>

                  {/* Rúbrica */}
                  {selectedStudentEval.rubricaCambridge && (
                    <div className="grid grid-cols-4 gap-2 text-center text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block font-semibold">Content</span>
                        <strong className="text-emerald-700 text-base">{selectedStudentEval.rubricaCambridge.content}/5</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block font-semibold">Comm. Ach.</span>
                        <strong className="text-indigo-700 text-base">{selectedStudentEval.rubricaCambridge.communicativeAchievement}/5</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block font-semibold">Organisation</span>
                        <strong className="text-amber-700 text-base">{selectedStudentEval.rubricaCambridge.organisation}/5</strong>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-slate-500 block font-semibold">Language</span>
                        <strong className="text-rose-700 text-base">{selectedStudentEval.rubricaCambridge.language}/5</strong>
                      </div>
                    </div>
                  )}

                  {/* Micro-objetivos */}
                  <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs space-y-1.5">
                    <p className="font-bold text-indigo-800">Micro-objetivos asignados para la siguiente sesión:</p>
                    {selectedStudentEval.planAccionSiguienteSesion.objetivosMicroLinguisticos.map((obj, i) => (
                      <p key={i} className="text-slate-700">• {obj}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 4: CONSOLA DE COMANDOS AUTÓNOMOS (MODO CLARO NANO BANANA 2.1) */}
        {activeTab === 'consola' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            <div className="p-6 rounded-3xl bg-white border-2 border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-600" />
                  Simulador de Invocación Directa de Comandos Autónomos
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  Ejecuta cualquiera de los 4 comandos canónicos del Writing Engine y verifica su salida estructurada en tiempo real.
                </p>
              </div>

              {/* Selector de Comando */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(['CREAR_CONSIGNA', 'ANALIZAR_BORRADOR', 'EVALUACION_FINAL', 'DASHBOARD_DOCENTE'] as const).map(cmd => (
                  <button
                    key={cmd}
                    type="button"
                    onClick={() => handleSelectCommandTemplate(cmd)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedCommand === cmd
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    [COMANDO: {cmd}]
                  </button>
                ))}
              </div>

              {/* Panel Dual: Entrada JSON y Salida JSON en Modo Claro */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
                
                {/* Entrada */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold">Payload de Entrada (JSON):</span>
                  </div>
                  <textarea
                    value={consolePayloadInput}
                    onChange={(e) => setConsolePayloadInput(e.target.value)}
                    rows={12}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                  <button
                    type="button"
                    onClick={handleExecuteConsoleCommand}
                    disabled={consoleLoading}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {consoleLoading ? 'Ejecutando...' : `Ejecutar [${selectedCommand}]`}
                  </button>
                </div>

                {/* Salida */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold">Respuesta del Motor Autónomo:</span>
                    <span className="text-[11px] text-emerald-700 font-mono font-bold">Status: 200 OK</span>
                  </div>
                  <pre className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-indigo-950 overflow-y-auto max-h-[320px] leading-relaxed">
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
