"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Download, 
  Printer, 
  Check, 
  Copy, 
  Sparkles, 
  Bot, 
  Building2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  ShieldCheck, 
  X, 
  ExternalLink,
  Layers,
  GraduationCap
} from 'lucide-react';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { isPlatformSuperUser, resolveEffectiveSchoolId, DetailedStudent, FamilyBillingRecord } from '@/types';
import { 
  executeAnalyticQuery, 
  AnalyticReportResult, 
  formatMXN, 
  Student360Detail 
} from '@/services/executiveAnalyticsEngine';

interface ExecutiveAnalyticsStudioProps {
  onBack?: () => void;
  initialQuery?: string;
}

export default function ExecutiveAnalyticsStudio({ onBack, initialQuery }: ExecutiveAnalyticsStudioProps) {
  const { user } = useAuth();
  const {
    institutionsList,
    activeSchoolId,
    selectSchool,
    campusesList,
    detailedStudents,
    groupsList,
    teachersList,
    attendanceList,
    billingRecords,
    staffPayroll
  } = useSchoolAdminStore();

  const isSuperUser = useMemo(() => isPlatformSuperUser(user), [user]);
  const effectiveSchoolId = useMemo(() => {
    return resolveEffectiveSchoolId(user, activeSchoolId, 'sch-jjrosseau');
  }, [user, activeSchoolId]);

  // Selección de colegio: para Super Usuario puede ser 'all' o un id específico; para Dueño queda bloqueado a su colegio
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(
    isSuperUser ? (activeSchoolId || 'sch-jjrosseau') : effectiveSchoolId
  );

  useEffect(() => {
    if (!isSuperUser && user?.school_id) {
      setSelectedSchoolFilter(user.school_id);
    }
  }, [isSuperUser, user]);

  // Estado del layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'table' | 'edition'>('preview');

  // Estado del chat conversacional
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Historial de reporte activo
  const [currentReport, setCurrentReport] = useState<AnalyticReportResult | null>(null);
  const [reportTitle, setReportTitle] = useState('Estudiantes con adeudo activo por nivel y monto pendiente');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Filtros interactivos sobre la tabla del reporte
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');

  // Drawer de ficha 360° de estudiante
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student360Detail | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Referencia para SpeechRecognition
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  // Inicializar motor de reconocimiento de voz del navegador (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-MX';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputText(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Tu navegador no cuenta con soporte para dictado por voz. Puedes escribir tu consulta directamente.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInputText('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Error starting speech:', err);
      }
    }
  };

  // Función ejecutora de consultas locales (Cero Tokens)
  const handleExecuteQuery = (queryToRun?: string) => {
    const query = (queryToRun || inputText).trim();
    if (!query) return;

    setIsProcessing(true);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setTimeout(() => {
      const targetSchool = isSuperUser ? selectedSchoolFilter : effectiveSchoolId;
      const result = executeAnalyticQuery(query, {
        schoolId: targetSchool,
        isSuperUser,
        institutionsList,
        detailedStudents,
        campusesList,
        groupsList,
        teachersList,
        attendanceList,
        billingRecords,
        staffPayroll
      });

      setCurrentReport(result);
      setReportTitle(result.reportTitle);
      setIsProcessing(false);
      setInputText('');

      if (result.studentDetail) {
        setSelectedStudentForDrawer(result.studentDetail);
        const qLower = query.toLowerCase();
        if (
          qLower.includes('detalle') || 
          qLower.includes('ficha') || 
          qLower.includes('expediente') || 
          qLower.includes('edad') ||
          qLower.includes('joven')
        ) {
          setShowDrawer(true);
        }
      }

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 150);
  };

  // Ejecutar consulta inicial por defecto si se especifica o iniciar con el reporte prototipo de la imagen 2
  useEffect(() => {
    const defaultQuery = initialQuery || 'Estudiantes con adeudo activo por nivel y monto pendiente';
    handleExecuteQuery(defaultQuery);
  }, [selectedSchoolFilter]);

  // Manejador de click en fila de alumno o botón Ver Detalle
  const handleRowClick = (row: any) => {
    // 1. Si el reporte es de un solo alumno (STUDENT_LOOKUP) y cuenta con studentDetail
    if (currentReport?.domain === 'STUDENT_LOOKUP' && currentReport?.studentDetail) {
      setSelectedStudentForDrawer(currentReport.studentDetail);
      setShowDrawer(true);
      return;
    }

    // 2. Buscar por studentId o studentName en los datos de la fila
    const targetId = row?.studentId || row?.student_id;
    const targetName = row?.studentName || row?.student_name || (row?.recordType?.includes('Alumno') || row?.recordType?.includes('Ficha') ? row?.name : undefined);

    // Si la fila no contiene referencia a un estudiante (ej. es un plantel o nómina)
    if (!targetId && !targetName) {
      const cName = row?.campusName || (row?.recordType?.includes('Plantel') ? row?.name : undefined);
      if (cName) {
        handleExecuteQuery(`alumnos matriculados en plantel ${cName}`);
      } else if (row?.name?.includes('Israel')) {
        handleExecuteQuery('tutor de diego vargas');
      }
      return;
    }

    const studentMatch = detailedStudents.find(s => 
      (targetId && s.id === targetId) || 
      (targetName && `${s.first_name} ${s.last_name_1}`.toLowerCase().includes(String(targetName).toLowerCase()))
    );

    if (studentMatch) {
      const studentBilling = billingRecords.filter(b => 
        b.studentId === studentMatch.id || 
        b.studentName.toLowerCase().includes(studentMatch.first_name.toLowerCase())
      );
      const studentAtt = attendanceList.filter(a => a.student_id === studentMatch.id);
      const totalDebt = studentBilling.filter(b => b.status !== 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const totalPaid = studentBilling.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const totalClasses = studentAtt.length || 1;
      const presentes = studentAtt.filter(a => a.status === 'presente').length;
      const faltas = studentAtt.filter(a => a.status === 'falta').length;
      const retardos = studentAtt.filter(a => a.status === 'retardo').length;
      const justificados = studentAtt.filter(a => a.status === 'justificado').length;

      setSelectedStudentForDrawer({
        student: studentMatch,
        billingRecords: studentBilling,
        totalDebt,
        totalPaid,
        attendanceStats: {
          totalClasses,
          presentes,
          faltas,
          retardos,
          justificados,
          attendanceRate: (presentes / totalClasses) * 100
        }
      });
      setShowDrawer(true);
    }
  };

  // Copiar resumen de consulta al portapapeles
  const handleCopySummary = () => {
    if (!currentReport) return;
    const textToCopy = `Reporte: ${currentReport.reportTitle}\nInstitución: ${currentReport.schoolName}\nFecha: ${currentReport.generatedAt}\nResumen: ${currentReport.explanation.summary}\nCosto de IA: 0 Tokens (Motor Local)`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Exportar datos a CSV
  const handleExportCSV = () => {
    if (!currentReport || !currentReport.table.rows.length) return;
    const columns = currentReport.table.columns;
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = currentReport.table.rows.map(row => {
      return columns.map(c => `"${row[c.key] ?? ''}"`).join(',');
    });
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentReport.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado reactivo de la tabla de datos
  const filteredTableRows = useMemo(() => {
    if (!currentReport) return [];
    return currentReport.table.rows.filter(row => {
      const matchesSearch = tableSearch === '' || Object.values(row).some(val => 
        String(val).toLowerCase().includes(tableSearch.toLowerCase())
      );
      const matchesStatus = tableStatusFilter === 'all' || 
        String(row.status || '').toLowerCase() === tableStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [currentReport, tableSearch, tableStatusFilter]);

  const currentInstitutionObj = institutionsList.find(i => i.id === selectedSchoolFilter) || institutionsList[0];

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden select-none">
      
      {/* 1. BARRA SUPERIOR EJECUTIVA (ESTILO IMAGEN 2) */}
      <header className="h-14 shrink-0 bg-slate-900/90 backdrop-blur-md border-b border-white/10 px-4 flex items-center justify-between gap-3 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          
          <div className="h-4 w-[1px] bg-white/10 shrink-0" />

          {/* Título dinámico del reporte */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-slate-800 border border-indigo-500 rounded px-2 py-0.5 text-sm font-semibold text-white focus:outline-none"
              />
            ) : (
              <h1 
                onClick={() => setIsEditingTitle(true)}
                title="Clic para editar título del reporte"
                className="text-sm md:text-base font-bold text-white truncate cursor-pointer hover:text-indigo-300 transition flex items-center gap-1.5"
              >
                {reportTitle}
              </h1>
            )}
          </div>
        </div>

        {/* Controles del lado derecho: Selector Institucional, Badge 0 Tokens y Acciones */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Aislamiento Multi-Colegio: Selector solo para Super Usuario; Badge bloqueado para Dueño de Colegio */}
          {isSuperUser ? (
            <div className="flex items-center gap-1.5 bg-slate-800 border border-white/10 rounded-lg px-2.5 py-1 text-xs">
              <Building2 className="h-3.5 w-3.5 text-amber-400 shrink-0" />
              <select
                value={selectedSchoolFilter}
                onChange={(e) => {
                  setSelectedSchoolFilter(e.target.value);
                  selectSchool(e.target.value);
                }}
                className="bg-transparent text-slate-200 font-medium focus:outline-none text-xs cursor-pointer"
              >
                <option value="all" className="bg-slate-900 text-amber-300 font-bold">Consolidado Global (Todos los Colegios)</option>
                {institutionsList.map(inst => (
                  <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-800/80 border border-white/10 rounded-lg px-3 py-1 text-xs text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold text-white truncate max-w-[180px]">
                {currentInstitutionObj?.name || 'Colegio Autónomo'}
              </span>
            </div>
          )}

          {/* Badge de Eficiencia: Cero Tokens */}
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>0 Tokens · Motor Local</span>
          </div>

          {/* Botones de acción del reporte */}
          <button
            onClick={handleExportCSV}
            title="Exportar datos a formato CSV/Excel"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Imprimir reporte o guardar como PDF"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-white" />}
            <span>{copiedSummary ? 'Copiado' : 'Publicar'}</span>
          </button>
        </div>
      </header>

      {/* 2. CUERPO SPLIT-VIEW (PANEL IZQUIERDO CONVERSACIONAL + ÁREA DE REPORTE) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* PANEL LATERAL IZQUIERDO: ASISTENTE CONVERSACIONAL (VOZ Y TEXTO) */}
        <aside 
          className={`shrink-0 bg-slate-900 border-r border-white/10 flex flex-col transition-all duration-300 relative z-20 ${
            isSidebarOpen ? 'w-[360px] md:w-[410px]' : 'w-0 border-r-0 overflow-hidden'
          }`}
        >
          {/* Header del Chat */}
          <div className="h-10 px-4 border-b border-white/5 flex items-center justify-between shrink-0 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">Asistente Ejecutivo de Información</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded font-mono">
              IA Pedagógica & Analítica
            </span>
          </div>

          {/* Historial de conversación (Formato idéntico a imagen 2) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Mensaje del usuario */}
            <div className="flex flex-col items-end">
              <div className="max-w-[90%] bg-slate-800 text-slate-100 rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm border border-white/5 font-medium leading-relaxed">
                {currentReport?.queryReceived || reportTitle}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 mr-1">Tú · Consulta Directiva</span>
            </div>

            {/* Respuesta explicativa estructurada del Asistente */}
            {isProcessing ? (
              <div className="flex items-center gap-2 text-slate-400 p-3 bg-white/5 rounded-xl animate-pulse">
                <div className="h-3 w-3 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-xs">Consultando base de datos escolar con 0 tokens...</span>
              </div>
            ) : currentReport ? (
              <div className="flex flex-col items-start">
                <div className="w-full bg-slate-950/60 border border-white/10 rounded-2xl rounded-tl-sm p-3.5 text-slate-300 space-y-3 shadow-inner">
                  <p className="font-semibold text-slate-100 text-[13px] leading-snug">
                    ¡Listo! Ya actualicé el reporte.
                  </p>
                  
                  <p className="text-slate-400 leading-relaxed">
                    Aquí tienes la consulta que utilicé:
                  </p>

                  <div className="space-y-1.5 bg-white/5 p-2.5 rounded-lg border border-white/5">
                    <p className="font-bold text-slate-200 text-[11px] uppercase tracking-wider text-cyan-400">
                      ¿Qué incluye esta consulta?
                    </p>
                    <ul className="space-y-1 text-[11px] text-slate-300 list-disc list-inside">
                      {currentReport.explanation.fieldsIncluded.map((field, idx) => (
                        <li key={idx} className="leading-tight">
                          <span className="font-semibold text-slate-200">{field.split(':')[0]}:</span> {field.split(':')[1] || ''}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-1 bg-white/5 p-2.5 rounded-lg border border-white/5 text-[11px]">
                    <p className="font-bold text-slate-200 uppercase tracking-wider text-emerald-400">
                      Filtros Aplicados:
                    </p>
                    <ul className="space-y-1 text-slate-300 list-disc list-inside">
                      {currentReport.explanation.filtersApplied.map((filter, idx) => (
                        <li key={idx} className="leading-tight">{filter}</li>
                      ))}
                    </ul>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {currentReport.explanation.visualizationDescription}
                  </p>

                  <div className="pt-1 border-t border-white/5">
                    <p className="text-slate-400 text-[11px] italic">
                      {currentReport.explanation.followUpPrompt}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 ml-1">Motor de Inteligencia Analítica</span>
              </div>
            ) : null}

            {/* Sugerencias contextuales rápidas */}
            {currentReport?.suggestedQueries && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Sugerencias Rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentReport.suggestedQueries.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteQuery(sug)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-indigo-600/20 hover:text-indigo-300 border border-white/5 hover:border-indigo-500/30 text-slate-300 transition cursor-pointer"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Indicador de Grabación de Voz Activa */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 flex items-center justify-between text-xs text-rose-400 shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="font-semibold">Escuchando dictado por voz...</span>
              </div>
              <span className="text-[10px] text-slate-400">Habla con claridad</span>
            </div>
          )}

          {/* Barra de Entrada (Texto y Micrófono) */}
          <div className="p-3 border-t border-white/10 bg-slate-900 shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition shadow-inner">
              <button
                type="button"
                onClick={() => handleExecuteQuery('Resumen general de control total del colegio')}
                title="Plantillas de consulta ejecutiva"
                className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery()}
                placeholder={isListening ? "Escuchando tu voz..." : "Escribe aquí tu consulta..."}
                className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none py-1"
              />

              {/* Botón de Dictado por Voz */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                title={isListening ? "Detener dictado por voz" : "Dictar consulta con tu voz"}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-400 hover:text-cyan-400 hover:bg-white/5'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Botón Enviar */}
              <button
                type="button"
                onClick={() => handleExecuteQuery()}
                disabled={!inputText.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* BOTÓN TOGGLE COLAPSO DEL PANEL LATERAL (FIEL AL BOTÓN EN IMAGEN 2) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Ocultar panel conversacional" : "Mostrar panel conversacional"}
          className="absolute top-3 z-30 flex items-center justify-center h-7 w-7 rounded-full bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 hover:text-white shadow-md transition cursor-pointer"
          style={{ left: isSidebarOpen ? 'calc(410px - 14px)' : '8px' }}
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* ÁREA PRINCIPAL: ESPACIO DE TRABAJO Y VISUALIZACIÓN DEL REPORTE */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          
          {/* Pestañas Superiores de la Vista (Imagen 2: Vista previa | Mi edición actual) */}
          <div className="h-10 px-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-slate-900/40">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'preview'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Vista previa
              </button>
              
              <button
                onClick={() => setActiveTab('table')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'table'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Datos Tabulares ({currentReport?.table.totalRows || 0})
              </button>

              <button
                onClick={() => setActiveTab('edition')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'edition'
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Mi edición actual
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              Institución: <span className="text-white font-bold">{currentReport?.schoolName || currentInstitutionObj?.name}</span>
            </span>
          </div>

          {/* CONTENIDO DEL REPORTE */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Si no hay reporte cargado: Estado vacío idéntico al de la Imagen 2 */}
            {!currentReport ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 mb-4">
                  <Bot className="h-8 w-8 text-cyan-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">El reporte aparecerá aquí</h3>
                <p className="text-xs text-slate-400 max-w-sm mb-6">
                  Escribe una instrucción en el chat o usa el micrófono para ver el resultado.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  <button
                    onClick={() => handleExecuteQuery('Estudiantes con adeudo activo por nivel y monto pendiente')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 transition"
                  >
                    Estudiantes con adeudo activo
                  </button>
                  <button
                    onClick={() => handleExecuteQuery('Comparativa de ingresos y nómina mes a mes')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 transition"
                  >
                    Comparativa entre meses
                  </button>
                  <button
                    onClick={() => handleExecuteQuery('Asistencias y retardos del colegio')}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-300 transition"
                  >
                    Control de asistencias
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Banner de acceso rápido al Expediente 360° si el reporte es de alumno */}
                {currentReport.studentDetail && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border border-indigo-500/30 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">
                            Ficha Integral 360°: {currentReport.studentDetail.student.first_name} {currentReport.studentDetail.student.last_name_1}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                            {currentReport.studentDetail.student.level.toUpperCase()} · {currentReport.studentDetail.student.grade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Haz clic para ver contactos de tutores, fecha de nacimiento, edad, asistencias y desglose de cobros.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (currentReport?.studentDetail) {
                          setSelectedStudentForDrawer(currentReport.studentDetail);
                          setShowDrawer(true);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <span>Abrir Expediente 360°</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* 1. TARJETAS KPI EJECUTIVAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {currentReport.kpis.map((kpi) => (
                    <div 
                      key={kpi.id} 
                      className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 flex flex-col justify-between shadow-sm relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{kpi.label}</span>
                        {kpi.trend && (
                          <span className={`text-[10px] font-bold flex items-center gap-1 ${
                            kpi.trend.direction === 'up' ? 'text-emerald-400' : (kpi.trend.direction === 'down' ? 'text-rose-400' : 'text-slate-400')
                          }`}>
                            {kpi.trend.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : (kpi.trend.direction === 'down' ? <TrendingDown className="h-3 w-3" /> : null)}
                            {kpi.trend.value}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-2xl font-black text-white tracking-tight mb-1">
                        {kpi.value}
                      </div>

                      {kpi.subtext && (
                        <p className="text-[11px] text-slate-500 font-medium truncate">
                          {kpi.subtext}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* 2. GRÁFICA INTERACTIVA SOBRIA */}
                {currentReport.chart && (
                  <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">{currentReport.chart.title}</h3>
                        {currentReport.chart.subtitle && (
                          <p className="text-xs text-slate-400">{currentReport.chart.subtitle}</p>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-1 rounded">
                        {currentReport.chart.type === 'bar' ? 'Gráfico de Barras' : (currentReport.chart.type === 'line' ? 'Tendencia Temporal' : 'Distribución')}
                      </span>
                    </div>

                    {/* Renderizado de Gráficas SVG Interactivas */}
                    {currentReport.chart.type === 'bar' && (
                      <div className="space-y-3 pt-2">
                        {currentReport.chart.labels.map((label, idx) => {
                          const val = currentReport.chart?.datasets[0]?.data[idx] || 0;
                          const maxVal = Math.max(...(currentReport.chart?.datasets[0]?.data || [1]), 1);
                          const percent = Math.min(Math.round((val / maxVal) * 100), 100);
                          const formattedVal = currentReport.chart?.unit === 'currency' ? formatMXN(val) : `${val}`;

                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-300">{label}</span>
                                <span className="text-white font-mono">{formattedVal}</span>
                              </div>
                              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden p-0.5 border border-white/5">
                                <div 
                                  className="h-full rounded-full transition-all duration-500" 
                                  style={{ 
                                    width: `${Math.max(percent, 4)}%`, 
                                    backgroundColor: currentReport.chart?.datasets[0]?.color || '#3b82f6' 
                                  }} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentReport.chart.type === 'line' && (
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2">
                        {currentReport.chart.labels.map((monthLabel, idx) => {
                          const income = currentReport.chart?.datasets[0]?.data[idx] || 0;
                          const expense = currentReport.chart?.datasets[1]?.data[idx] || 0;
                          const margin = income - expense;

                          return (
                            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-2">
                              <span className="text-xs font-bold text-slate-300 block border-b border-white/5 pb-1">
                                {monthLabel}
                              </span>
                              <div className="text-[11px] space-y-1 font-mono">
                                <div className="flex justify-between text-emerald-400">
                                  <span>Ingresos:</span>
                                  <span>{formatMXN(income)}</span>
                                </div>
                                <div className="flex justify-between text-rose-400">
                                  <span>Nómina:</span>
                                  <span>{formatMXN(expense)}</span>
                                </div>
                                <div className="flex justify-between font-bold pt-1 border-t border-white/5 text-white">
                                  <span>Margen:</span>
                                  <span className={margin >= 0 ? 'text-cyan-400' : 'text-amber-400'}>{formatMXN(margin)}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {currentReport.chart.type === 'donut' && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {currentReport.chart.labels.map((label, idx) => {
                          const val = currentReport.chart?.datasets[0]?.data[idx] || 0;
                          const total = currentReport.chart?.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
                          const share = ((val / total) * 100).toFixed(1);

                          return (
                            <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-white/5 text-center space-y-1">
                              <span className="text-xs text-slate-400 block truncate">{label}</span>
                              <span className="text-lg font-bold text-white block">
                                {currentReport.chart?.unit === 'currency' ? formatMXN(val) : val}
                              </span>
                              <span className="text-[10px] text-cyan-400 font-mono font-semibold">{share}% del total</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. BARRA DE HERRAMIENTAS Y TABLA DE DATOS DETALLADA */}
                <div className="bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-sm">
                  {/* Barra de Filtros de la Tabla */}
                  <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900">
                    <div className="flex items-center gap-2 flex-1 max-w-sm bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 focus-within:border-indigo-500">
                      <Search className="h-4 w-4 text-slate-500 shrink-0" />
                      <input
                        type="text"
                        value={tableSearch}
                        onChange={(e) => setTableSearch(e.target.value)}
                        placeholder="Buscar en el reporte..."
                        className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-slate-400">Estado:</span>
                      <select
                        value={tableStatusFilter}
                        onChange={(e) => setTableStatusFilter(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1 text-slate-200 font-medium focus:outline-none text-xs"
                      >
                        <option value="all">Todos los registros</option>
                        <option value="pendiente">Pendientes</option>
                        <option value="vencido">Vencidos</option>
                        <option value="liquidado">Liquidados / Pagados</option>
                      </select>

                      <span className="text-slate-500 font-mono text-[11px]">
                        Mostrando {filteredTableRows.length} de {currentReport.table.totalRows}
                      </span>
                    </div>
                  </div>

                  {/* Tabla con scroll horizontal */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-950/70 border-b border-white/10 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                          {currentReport.table.columns.map((col) => (
                            <th 
                              key={col.key} 
                              className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')}`}
                            >
                              {col.label}
                            </th>
                          ))}
                          <th className="py-3 px-4 text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredTableRows.length === 0 ? (
                          <tr>
                            <td colSpan={currentReport.table.columns.length + 1} className="py-8 text-center text-slate-500">
                              No se encontraron registros que coincidan con la búsqueda.
                            </td>
                          </tr>
                        ) : (
                          filteredTableRows.map((row, rowIdx) => (
                            <tr 
                              key={rowIdx} 
                              onClick={() => handleRowClick(row)}
                              className="hover:bg-white/[0.04] transition cursor-pointer group"
                            >
                              {currentReport.table.columns.map((col) => {
                                const val = row[col.key];

                                if (col.isCurrency) {
                                  return (
                                    <td key={col.key} className="py-3 px-4 text-right font-mono font-bold text-white">
                                      {formatMXN(Number(val) || 0)}
                                    </td>
                                  );
                                }

                                if (col.isBadge) {
                                  const statusStr = String(val).toLowerCase();
                                  const isBad = statusStr.includes('vencido') || statusStr.includes('falta') || statusStr.includes('atención');
                                  const isGood = statusStr.includes('liquidado') || statusStr.includes('presente') || statusStr.includes('superávit') || statusStr.includes('dispersado');
                                  
                                  return (
                                    <td key={col.key} className="py-3 px-4 text-center">
                                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        isBad 
                                          ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' 
                                          : (isGood 
                                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400')
                                      }`}>
                                        {val}
                                      </span>
                                    </td>
                                  );
                                }

                                return (
                                  <td 
                                    key={col.key} 
                                    className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : ''} text-slate-300 font-medium`}
                                  >
                                    {val ?? '-'}
                                  </td>
                                );
                              })}

                              <td className="py-3 px-4 text-right">
                                <button 
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRowClick(row);
                                  }}
                                  className="text-[11px] font-bold text-indigo-400 group-hover:text-indigo-300 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                                >
                                  <span>
                                    {row.studentId || row.studentName 
                                      ? 'Ver expediente' 
                                      : (row.campusName || row.name ? 'Ver alumnos' : (row.netSalary ? 'Ver recibo' : 'Ver detalle'))}
                                  </span>
                                  <ExternalLink className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

          </div>
        </main>
      </div>

      {/* 3. DRAWER SLIDE-OVER: EXPEDIENTE 360° DE ESTUDIANTE / REGISTRO */}
      {showDrawer && selectedStudentForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border-l border-white/10 h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
            
            {/* Header del Drawer */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-lg">
                  {selectedStudentForDrawer.student.first_name[0]}{selectedStudentForDrawer.student.last_name_1[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-white">
                    {selectedStudentForDrawer.student.first_name} {selectedStudentForDrawer.student.last_name_1}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {selectedStudentForDrawer.student.level.toUpperCase()} · {selectedStudentForDrawer.student.grade} Grupo {selectedStudentForDrawer.student.group_id || 'A'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Resumen Financiero y Asistencias */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Adeudo Total</span>
                <p className={`text-lg font-black ${selectedStudentForDrawer.totalDebt > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {formatMXN(selectedStudentForDrawer.totalDebt)}
                </p>
                <span className="text-[10px] text-slate-500">{selectedStudentForDrawer.billingRecords.filter(b => b.status !== 'paid').length} recibos pendientes</span>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-1">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Asistencia</span>
                <p className="text-lg font-black text-cyan-400">
                  {selectedStudentForDrawer.attendanceStats.attendanceRate.toFixed(1)}%
                </p>
                <span className="text-[10px] text-slate-500">
                  {selectedStudentForDrawer.attendanceStats.faltas} faltas / {selectedStudentForDrawer.attendanceStats.retardos} retardos
                </span>
              </div>
            </div>

            {/* Filiación y Contactos */}
            <div className="space-y-3 mb-6 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
              <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider mb-2">Datos Generales y Filiación</h4>
              <div className="grid grid-cols-2 gap-2.5 text-slate-300">
                <div>
                  <span className="text-slate-500 block text-[10px]">Edad Calculada:</span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {selectedStudentForDrawer.student.birth_date 
                      ? `${2026 - new Date(selectedStudentForDrawer.student.birth_date).getFullYear()} Años Cumplidos`
                      : '7 Años'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Fecha de Nacimiento:</span>
                  <span className="font-semibold text-white">
                    {selectedStudentForDrawer.student.birth_date 
                      ? new Date(selectedStudentForDrawer.student.birth_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '10 de Mayo de 2019'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CURP:</span>
                  <span className="font-mono font-semibold">{selectedStudentForDrawer.student.curp || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Matrícula:</span>
                  <span className="font-mono font-semibold">{selectedStudentForDrawer.student.enrollment_id || 'MAT-2026'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Plantel y Turno:</span>
                  <span className="font-semibold text-white">
                    {selectedStudentForDrawer.student.campus_name || 'Plantel Principal'} ({selectedStudentForDrawer.student.shift || 'Matutino'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tutor Responsable:</span>
                  <span className="font-semibold">{selectedStudentForDrawer.student.tutor_name || selectedStudentForDrawer.student.father_name || 'Tutor registrado'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Teléfono de Contacto Familiar:</span>
                  <span className="font-semibold text-emerald-400 text-xs flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    {selectedStudentForDrawer.student.emergency_contact_phone || selectedStudentForDrawer.student.phone || '55-4160-8800'}
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones de Salud y Pedagógicas */}
            {(selectedStudentForDrawer.student.medical_notes || selectedStudentForDrawer.student.academic_notes) && (
              <div className="space-y-2.5 mb-6 text-xs bg-white/5 p-4 rounded-xl border border-white/5">
                <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">Ficha Médica y Pedagógica</h4>
                {selectedStudentForDrawer.student.medical_notes && (
                  <div>
                    <span className="text-amber-400 font-semibold block text-[10px]">Salud y Alergias:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{selectedStudentForDrawer.student.medical_notes}</p>
                  </div>
                )}
                {selectedStudentForDrawer.student.academic_notes && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-cyan-400 font-semibold block text-[10px]">Desempeño Académico:</span>
                    <p className="text-slate-300 text-[11px] mt-0.5">{selectedStudentForDrawer.student.academic_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recibos de Cobranza del Alumno */}
            <div className="space-y-2 mb-6 flex-1">
              <h4 className="font-bold text-slate-200 uppercase text-[11px] tracking-wider">Estado de Cuenta</h4>
              <div className="space-y-2">
                {selectedStudentForDrawer.billingRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay cargos registrados para este estudiante.</p>
                ) : (
                  selectedStudentForDrawer.billingRecords.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{b.concept}</p>
                        <p className="text-[11px] text-slate-400">Vencimiento: {b.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-white">{formatMXN(Number(b.amount))}</p>
                        <span className={`text-[10px] font-bold uppercase ${b.status === 'paid' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {b.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Botón de cierre */}
            <button
              onClick={() => setShowDrawer(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition cursor-pointer"
            >
              Cerrar Expediente
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
