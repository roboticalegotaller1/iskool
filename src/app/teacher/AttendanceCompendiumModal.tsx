"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, Calendar, Users, Filter, Download, Printer, 
  FileText, CheckCircle2, AlertCircle, AlertTriangle, 
  Clock, ShieldCheck, Search, ChevronDown, ChevronUp,
  BookOpen, Sparkles, Award, ArrowUpDown, Info, Eye,
  MessageSquare, RefreshCw
} from 'lucide-react';
import { DetailedStudent, Group, ClassSchedule, Subject, Attendance, AttendanceStatus } from '@/types';

interface AttendanceCompendiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupsList: Group[];
  schedulesList: ClassSchedule[];
  subjects: Subject[];
  detailedStudents: DetailedStudent[];
  attendanceList: Attendance[];
  initialGroupId?: string;
  initialSubjectId?: string;
  teacherId?: string;
}

export interface StudentCompendiumData {
  student: DetailedStudent;
  fullName: string;
  presentes: number;
  justificados: number;
  retardos: number;
  faltas: number;
  totalSesiones: number;
  faltasPorRetardo: number;
  retardosRestantes: number;
  faltasEfectivas: number;
  asistenciasEfectivas: number;
  porcentajeAsistencia: number;
  observaciones: Array<{
    date: string;
    subjectId?: string;
    subjectName: string;
    status: AttendanceStatus;
    comments: string;
  }>;
}

export function AttendanceCompendiumModal({
  isOpen,
  onClose,
  groupsList,
  schedulesList,
  subjects,
  detailedStudents,
  attendanceList,
  initialGroupId,
  initialSubjectId,
  teacherId = 'usr-teacher-1'
}: AttendanceCompendiumModalProps) {
  // Helper de nombre oficial del estudiante
  const formatName = (student: DetailedStudent) => {
    const parts = [
      student.last_name_1,
      student.last_name_2,
      student.first_name,
      student.second_name
    ].filter(Boolean);
    return parts.join(' ') || `${student.first_name} ${student.last_name_1 || ''}`;
  };

  // Grupos asignados al profesor
  const availableGroups = useMemo(() => {
    return groupsList.filter(g => 
      schedulesList.some(s => s.groupId === g.id && (s.teacherId === teacherId || !teacherId))
    );
  }, [groupsList, schedulesList, teacherId]);

  // Selección de Grupo
  const [selectedGroupId, setSelectedGroupId] = useState<string>(
    initialGroupId || availableGroups[0]?.id || 'grp-pa-a'
  );

  // Selección de Materia
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    initialSubjectId || 'all'
  );

  // Fechas del periodo (Por defecto: detectar automáticamente el periodo activo de registros del grupo o mes en curso)
  const defaultDates = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    
    let start = `${year}-${month}-01`;
    let end = `${year}-${month}-${day}`;

    // Obtener fechas de registros del grupo
    const groupDates = attendanceList
      .filter(att => att.group_id === selectedGroupId)
      .map(att => att.date)
      .sort();

    if (groupDates.length > 0) {
      const earliest = groupDates[0];
      const latest = groupDates[groupDates.length - 1];
      // Si los registros están en un mes/año distinto al actual, ajustar automáticamente el periodo por defecto
      if (earliest < start || latest < start || latest > end) {
        start = earliest;
        end = latest;
      }
    }

    return { start, end };
  }, [attendanceList, selectedGroupId]);

  const [startDate, setStartDate] = useState<string>(defaultDates.start);
  const [endDate, setEndDate] = useState<string>(defaultDates.end);

  // Sincronizar fechas si cambia el grupo
  useEffect(() => {
    setStartDate(defaultDates.start);
    setEndDate(defaultDates.end);
  }, [defaultDates.start, defaultDates.end]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'matrix' | 'observations'>('summary');
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  const [riskFilter, setRiskFilter] = useState<'all' | 'risk' | 'perfect'>('all');

  // Materias asociadas al grupo seleccionado
  const availableSubjectsForGroup = useMemo(() => {
    return subjects.filter(sub => 
      schedulesList.some(s => s.groupId === selectedGroupId && s.subjectId === sub.id)
    );
  }, [subjects, schedulesList, selectedGroupId]);

  // Alumnos del grupo seleccionado
  const studentsInGroup = useMemo(() => {
    return detailedStudents
      .filter(s => s.group_id === selectedGroupId)
      .sort((a, b) => formatName(a).localeCompare(formatName(b)));
  }, [detailedStudents, selectedGroupId]);

  // Acciones rápidas de periodo
  const handleQuickPeriod = (type: 'week' | 'fortnight' | 'this_month' | 'prev_month' | 'all') => {
    const now = new Date();
    const formatDateStr = (d: Date) => d.toISOString().split('T')[0];

    if (type === 'week') {
      const pastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      setStartDate(formatDateStr(pastWeek));
      setEndDate(formatDateStr(now));
    } else if (type === 'fortnight') {
      const pastFortnight = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      setStartDate(formatDateStr(pastFortnight));
      setEndDate(formatDateStr(now));
    } else if (type === 'this_month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDateStr(start));
      setEndDate(formatDateStr(now));
    } else if (type === 'prev_month') {
      const startPrev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endPrev = new Date(now.getFullYear(), now.getMonth(), 0);
      setStartDate(formatDateStr(startPrev));
      setEndDate(formatDateStr(endPrev));
    } else if (type === 'all') {
      setStartDate('2026-08-01');
      setEndDate(formatDateStr(now));
    }
  };

  // Cálculo del compendio para todos los alumnos en el periodo
  const compendiumData: StudentCompendiumData[] = useMemo(() => {
    return studentsInGroup.map((student) => {
      // Filtrar asistencias del alumno en el periodo y filtros dados
      const studentRecords = attendanceList.filter(att => {
        if (att.student_id !== student.id) return false;
        if (att.group_id !== selectedGroupId) return false;
        if (selectedSubjectId !== 'all' && att.subject_id && att.subject_id !== selectedSubjectId) return false;
        if (startDate && att.date < startDate) return false;
        if (endDate && att.date > endDate) return false;
        return true;
      });

      let presentes = 0;
      let justificados = 0;
      let retardos = 0;
      let faltas = 0;
      const observaciones: StudentCompendiumData['observaciones'] = [];

      studentRecords.forEach(rec => {
        if (rec.status === 'presente') presentes++;
        else if (rec.status === 'justificado') justificados++;
        else if (rec.status === 'retardo') retardos++;
        else if (rec.status === 'falta') faltas++;

        // Guardar observaciones relevantes
        if (rec.comments || rec.status !== 'presente') {
          const subObj = subjects.find(s => s.id === rec.subject_id);
          observaciones.push({
            date: rec.date,
            subjectId: rec.subject_id,
            subjectName: subObj ? subObj.name : 'General',
            status: rec.status,
            comments: rec.comments || (rec.status === 'retardo' ? 'Retardo registrado' : rec.status === 'falta' ? 'Inasistencia sin justificar' : 'Justificado')
          });
        }
      });

      const totalSesiones = presentes + justificados + retardos + faltas;

      // REGLA SOLICITADA POR EL USUARIO:
      // 1. Presente y Justificado cuentan como asistencia
      // 2. Falta cuenta como falta directa
      // 3. 3 Retardos equivalen a 1 falta
      const faltasPorRetardo = Math.floor(retardos / 3);
      const retardosRestantes = retardos % 3; // Los que aún computan como asistidos antes de formar la terna
      const faltasEfectivas = faltas + faltasPorRetardo;
      const asistenciasEfectivas = presentes + justificados + retardosRestantes;
      
      const porcentajeAsistencia = totalSesiones > 0 
        ? Math.max(0, Math.min(100, Math.round((asistenciasEfectivas / totalSesiones) * 100)))
        : 100;

      // Ordenar observaciones por fecha descendente
      observaciones.sort((a, b) => b.date.localeCompare(a.date));

      return {
        student,
        fullName: formatName(student),
        presentes,
        justificados,
        retardos,
        faltas,
        totalSesiones,
        faltasPorRetardo,
        retardosRestantes,
        faltasEfectivas,
        asistenciasEfectivas,
        porcentajeAsistencia,
        observaciones
      };
    });
  }, [studentsInGroup, attendanceList, selectedGroupId, selectedSubjectId, startDate, endDate, subjects]);

  // Lista filtrada por búsqueda y por estatus de riesgo
  const filteredData = useMemo(() => {
    return compendiumData.filter(item => {
      // Filtro de texto
      const matchesSearch = 
        item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.student.enrollment_id ? item.student.enrollment_id.toLowerCase().includes(searchTerm.toLowerCase()) : false);
      
      if (!matchesSearch) return false;

      // Filtro de riesgo
      if (riskFilter === 'risk') return item.porcentajeAsistencia < 80;
      if (riskFilter === 'perfect') return item.porcentajeAsistencia === 100 && item.totalSesiones > 0;
      return true;
    });
  }, [compendiumData, searchTerm, riskFilter]);

  // Métricas y KPIs globales del compendio
  const groupMetrics = useMemo(() => {
    const totalStudents = compendiumData.length;
    if (totalStudents === 0) {
      return {
        promedioAsistencia: 100,
        totalSesionesUnicas: 0,
        alumnosEnRiesgo: 0,
        alumnosPerfectos: 0,
        totalPresentes: 0,
        totalFaltas: 0,
        totalRetardos: 0,
        totalJustificados: 0,
        totalFaltasPorRetardo: 0
      };
    }

    let sumPorcentajes = 0;
    let alumnosEnRiesgo = 0;
    let alumnosPerfectos = 0;
    let totalPresentes = 0;
    let totalFaltas = 0;
    let totalRetardos = 0;
    let totalJustificados = 0;
    let totalFaltasPorRetardo = 0;

    compendiumData.forEach(item => {
      sumPorcentajes += item.porcentajeAsistencia;
      if (item.porcentajeAsistencia < 80) alumnosEnRiesgo++;
      if (item.porcentajeAsistencia === 100 && item.totalSesiones > 0) alumnosPerfectos++;
      totalPresentes += item.presentes;
      totalFaltas += item.faltas;
      totalRetardos += item.retardos;
      totalJustificados += item.justificados;
      totalFaltasPorRetardo += item.faltasPorRetardo;
    });

    // Sesiones únicas en el periodo
    const uniqueDates = new Set(
      attendanceList
        .filter(att => {
          if (att.group_id !== selectedGroupId) return false;
          if (selectedSubjectId !== 'all' && att.subject_id && att.subject_id !== selectedSubjectId) return false;
          if (startDate && att.date < startDate) return false;
          if (endDate && att.date > endDate) return false;
          return true;
        })
        .map(att => att.date)
    );

    return {
      promedioAsistencia: Math.round(sumPorcentajes / totalStudents),
      totalSesionesUnicas: uniqueDates.size,
      alumnosEnRiesgo,
      alumnosPerfectos,
      totalPresentes,
      totalFaltas,
      totalRetardos,
      totalJustificados,
      totalFaltasPorRetardo
    };
  }, [compendiumData, attendanceList, selectedGroupId, selectedSubjectId, startDate, endDate]);

  // Lista de fechas únicas para la matriz / sábana diaria
  const matrixDates = useMemo(() => {
    const dates = new Set<string>();
    attendanceList.forEach(att => {
      if (att.group_id !== selectedGroupId) return false;
      if (selectedSubjectId !== 'all' && att.subject_id && att.subject_id !== selectedSubjectId) return false;
      if (startDate && att.date < startDate) return false;
      if (endDate && att.date > endDate) return false;
      dates.add(att.date);
    });
    return Array.from(dates).sort();
  }, [attendanceList, selectedGroupId, selectedSubjectId, startDate, endDate]);

  // Función para exportar a CSV con BOM UTF-8
  const handleExportCSV = () => {
    const groupObj = groupsList.find(g => g.id === selectedGroupId);
    const groupName = groupObj ? groupObj.name : selectedGroupId;
    const subjectObj = subjects.find(s => s.id === selectedSubjectId);
    const subjectName = selectedSubjectId === 'all' ? 'Todas las Asignaturas' : (subjectObj ? subjectObj.name : selectedSubjectId);

    const headers = [
      "Matrícula",
      "Nombre del Alumno",
      "Asistencias (Presente)",
      "Justificados",
      "Retardos",
      "Faltas Directas",
      "Faltas por Retardos (3R=1F)",
      "Faltas Totales Efectivas",
      "Total Sesiones",
      "% Asistencia",
      "Observaciones del Periodo"
    ];

    const rows = compendiumData.map(item => {
      const obsText = item.observaciones
        .map(obs => `[${obs.date}] ${obs.status.toUpperCase()}: ${obs.comments}`)
        .join(' | ');

      return [
        `"${item.student.enrollment_id}"`,
        `"${item.fullName}"`,
        item.presentes,
        item.justificados,
        item.retardos,
        item.faltas,
        item.faltasPorRetardo,
        item.faltasEfectivas,
        item.totalSesiones,
        `"${item.porcentajeAsistencia}%"`,
        `"${obsText.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [
      `"COMPENDIO OFICIAL DE ASISTENCIA - COLEGIO ANGLO MEXICANO"`,
      `"Grupo: ${groupName}","Asignatura: ${subjectName}","Periodo: ${startDate} al ${endDate}"`,
      `"Fecha de Generación: ${new Date().toLocaleDateString('es-MX')}","Promedio Grupal: ${groupMetrics.promedioAsistencia}%"`,
      "",
      headers.join(','),
      ...rows
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Compendio_Asistencia_${groupName}_${startDate}_a_${endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Función para disparar impresión optimizada
  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const currentGroupObj = groupsList.find(g => g.id === selectedGroupId);
  const currentSubjectObj = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div id="compendium-modal-root" className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-950/75 backdrop-blur-md animate-in fade-in duration-200 print:static print:p-0 print:bg-white print:backdrop-blur-none print:z-auto print:block">
      
      {/* Estilos globales específicos para impresión ultra compacta y legible */}
      <style jsx global>{`
        @media print {
          @page {
            size: letter portrait;
            margin: 6mm 8mm 6mm 8mm;
          }
          body {
            background: white !important;
            color: black !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          /* Ocultar elementos de fondo y barras de navegación */
          header, nav, aside {
            display: none !important;
          }
        }
      `}</style>

      {/* Contenedor Principal del Modal */}
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden print:max-h-none print:h-auto print:border-none print:shadow-none print:w-full print:rounded-none print:overflow-visible print:bg-white">
        
        {/* Cabecera del Modal en Pantalla */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 md:px-7 border-b border-zinc-100 dark:border-zinc-800/90 bg-gradient-to-r from-zinc-50 via-white to-blue-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-blue-950/20 print:hidden">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-2xl bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  Compendio Oficial de Asistencias
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                    Colegio Anglo Mexicano
                  </span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Consolidado grupal, cálculo de porcentajes con regla 3R=1F y bitácora de incidencias
                </p>
              </div>
            </div>
          </div>

          {/* Botones de Acción de Cabecera */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end print:hidden">
            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-all shadow-sm"
              title="Descargar archivo CSV compatible con Excel"
            >
              <Download className="w-4 h-4 text-zinc-500" />
              <span className="hidden md:inline">Exportar</span> CSV
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-500/20"
              title="Imprimir boleta / guardar en PDF"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Panel de Filtros y Configuración del Periodo */}
        <div className="p-4 md:px-7 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 print:hidden flex flex-col gap-3">
          
          {/* Fila de Selectores Principales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            
            {/* Selector de Grupo */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Grupo Escolar
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                {availableGroups.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} - {g.level_grade_id.startsWith('primaria') ? 'Primaria Alta' : g.level_grade_id.startsWith('secundaria') ? 'Secundaria' : 'Preparatoria'}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector de Materia */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Asignatura
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-semibold focus:outline-none focus:border-indigo-500 shadow-sm"
              >
                <option value="all">📚 Todas las Asignaturas (Global)</option>
                {availableSubjectsForGroup.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>

            {/* Rango Desde */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" /> Fecha Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

            {/* Rango Hasta */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3 h-3 text-indigo-500" /> Fecha Fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 font-mono focus:outline-none focus:border-indigo-500 shadow-sm"
              />
            </div>

          </div>

          {/* Botones de Periodo Rápido & Buscador */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-400 mr-1">Periodo rápido:</span>
              <button
                type="button"
                onClick={() => handleQuickPeriod('week')}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => handleQuickPeriod('fortnight')}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Últimos 15 días
              </button>
              <button
                type="button"
                onClick={() => handleQuickPeriod('this_month')}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Este Mes
              </button>
              <button
                type="button"
                onClick={() => handleQuickPeriod('prev_month')}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
              >
                Mes Anterior
              </button>
              <button
                type="button"
                onClick={() => handleQuickPeriod('all')}
                className="px-2.5 py-1 text-[10px] font-bold rounded-lg border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 transition-colors"
              >
                Todo el Periodo
              </button>
            </div>

            {/* Buscador de alumno */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o matrícula..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-indigo-500"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Tarjetas de Métricas Globales (KPIs) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 p-4 md:px-7 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/40">
          
          {/* KPI 1: Promedio Grupal */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs flex flex-col justify-between">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Promedio Asistencia</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-black ${
                groupMetrics.promedioAsistencia >= 85 ? 'text-emerald-600 dark:text-emerald-400' :
                groupMetrics.promedioAsistencia >= 80 ? 'text-amber-500 dark:text-amber-400' :
                'text-rose-600 dark:text-rose-400'
              }`}>
                {groupMetrics.promedioAsistencia}%
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">grupal</span>
            </div>
          </div>

          {/* KPI 2: Sesiones / Días */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xs flex flex-col justify-between">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider">Sesiones / Días</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-zinc-800 dark:text-zinc-100">
                {groupMetrics.totalSesionesUnicas}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">clases registradas</span>
            </div>
          </div>

          {/* KPI 3: Presentes */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-emerald-200/40 dark:border-emerald-900/30 shadow-xs flex flex-col justify-between">
            <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Presentes</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
                {groupMetrics.totalPresentes}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">asistencias</span>
            </div>
          </div>

          {/* KPI 4: Justificados */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-blue-200/40 dark:border-blue-900/30 shadow-xs flex flex-col justify-between">
            <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">Justificados</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {groupMetrics.totalJustificados}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">médicos / permiso</span>
            </div>
          </div>

          {/* KPI 5: Retardos */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-amber-200/40 dark:border-amber-900/30 shadow-xs flex flex-col justify-between">
            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">Retardos</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">
                {groupMetrics.totalRetardos}
              </span>
              {groupMetrics.totalFaltasPorRetardo > 0 && (
                <span className="text-[9px] font-extrabold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded">
                  +{groupMetrics.totalFaltasPorRetardo}F
                </span>
              )}
            </div>
          </div>

          {/* KPI 6: Faltas / Riesgo */}
          <div className="p-3 rounded-2xl bg-white dark:bg-zinc-950 border border-rose-200/40 dark:border-rose-900/30 shadow-xs flex flex-col justify-between">
            <span className="text-[9px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">En Riesgo (&lt;80%)</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className={`text-xl font-black ${groupMetrics.alumnosEnRiesgo > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-800 dark:text-zinc-100'}`}>
                {groupMetrics.alumnosEnRiesgo}
              </span>
              <span className="text-[10px] text-zinc-400 font-bold">de {compendiumData.length}</span>
            </div>
          </div>

        </div>

        {/* Pestañas de Vista y Banner de Regla de Cálculo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-5 md:px-7 py-2.5 bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-100 dark:border-zinc-800">
          
          {/* Navegación por pestañas */}
          <div className="flex items-center gap-1.5 print:hidden">
            <button
              type="button"
              onClick={() => setActiveTab('summary')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Tabla Compendio & Porcentajes
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('matrix')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              Sábana Diaria (Matriz)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('observations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                activeTab === 'observations'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Bitácora de Observaciones ({compendiumData.reduce((acc, c) => acc + c.observaciones.length, 0)})
            </button>
          </div>

          {/* Banner explicativo de la Regla Institucional */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>
              <strong>Regla Oficial:</strong> Presente + Justificado = Asistencia. Falta = Inasistencia. <strong>3 Retardos = 1 Falta</strong>.
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DOCUMENTO OFICIAL PARA IMPRESIÓN Y DESCARGA EN PDF (SOLO VISIBLE AL IMPRIMIR) */}
        {/* ========================================================================= */}
        <div className="hidden print:block w-full text-black bg-white p-2">
          
          {/* Encabezado Oficial Institucional */}
          <div className="border-b-2 border-black pb-2 mb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border-2 border-black bg-zinc-100 flex items-center justify-center font-black text-xs text-black">
                  CAM
                </div>
                <div>
                  <h1 className="text-sm font-black tracking-tight uppercase leading-tight text-black">
                    Colegio Anglo Mexicano
                  </h1>
                  <h2 className="text-xs font-bold text-zinc-900 leading-tight">
                    Compendio Oficial de Asistencia y Puntualidad Escolar
                  </h2>
                  <p className="text-[9px] text-zinc-600 font-medium">
                    Sistema de Control Escolar e Integración Curricular NEM
                  </p>
                </div>
              </div>
              <div className="text-right text-[9px] text-zinc-700">
                <p className="font-mono"><strong>Emisión:</strong> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="font-black text-xs text-black mt-0.5">Promedio Grupal: {groupMetrics.promedioAsistencia}%</p>
              </div>
            </div>
          </div>

          {/* Ficha Resumen del Periodo */}
          <div className="grid grid-cols-4 gap-1 p-2 mb-2 bg-zinc-50 border border-zinc-300 rounded text-[9px] text-zinc-900 leading-snug">
            <div><strong>Grupo:</strong> {currentGroupObj?.name} ({currentGroupObj?.grade})</div>
            <div><strong>Asignatura:</strong> {selectedSubjectId === 'all' ? 'Todas las Asignaturas (Global)' : currentSubjectObj?.name}</div>
            <div><strong>Periodo:</strong> {startDate} al {endDate}</div>
            <div><strong>Total Clases:</strong> {groupMetrics.totalSesionesUnicas} sesiones registradas</div>
            <div><strong>Asistencias (P):</strong> {groupMetrics.totalPresentes}</div>
            <div><strong>Justificados (J):</strong> {groupMetrics.totalJustificados}</div>
            <div><strong>Retardos (R):</strong> {groupMetrics.totalRetardos} {groupMetrics.totalFaltasPorRetardo > 0 ? `(+${groupMetrics.totalFaltasPorRetardo} F acum.)` : ''}</div>
            <div><strong>Alumnos en Riesgo (&lt;80%):</strong> {groupMetrics.alumnosEnRiesgo} de {compendiumData.length}</div>
          </div>

          {/* Tabla Compacta Oficial con Observaciones */}
          <table className="w-full text-left border-collapse text-[9px] border border-black mb-2">
            <thead>
              <tr className="bg-zinc-100 border-b border-black text-[8px] font-black uppercase text-black">
                <th className="py-1 px-1 text-center w-5 border-r border-black">#</th>
                <th className="py-1 px-1.5 border-r border-black min-w-[130px]">Alumno / Matrícula</th>
                <th className="py-1 px-1 text-center w-8 border-r border-black">P</th>
                <th className="py-1 px-1 text-center w-8 border-r border-black">J</th>
                <th className="py-1 px-1 text-center w-8 border-r border-black">R</th>
                <th className="py-1 px-1 text-center w-8 border-r border-black">F</th>
                <th className="py-1 px-1 text-center w-9 border-r border-black">Total</th>
                <th className="py-1 px-1 text-center w-16 border-r border-black">% Asist.</th>
                <th className="py-1 px-2">Notas, Justificantes e Incidencias del Periodo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-300">
              {compendiumData.map((item, idx) => (
                <tr key={item.student.id} className="break-inside-avoid">
                  <td className="py-1 px-1 text-center font-mono font-bold border-r border-zinc-300 text-zinc-600">
                    {idx + 1}
                  </td>
                  <td className="py-1 px-1.5 border-r border-zinc-300">
                    <span className="font-bold text-black block leading-tight">{item.fullName}</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{item.student.enrollment_id}</span>
                  </td>
                  <td className="py-1 px-1 text-center font-bold text-black border-r border-zinc-300">
                    {item.presentes}
                  </td>
                  <td className="py-1 px-1 text-center font-bold text-black border-r border-zinc-300">
                    {item.justificados}
                  </td>
                  <td className="py-1 px-1 text-center font-bold text-black border-r border-zinc-300">
                    {item.retardos}
                    {item.faltasPorRetardo > 0 && (
                      <span className="text-[7px] block font-black text-rose-700">+{item.faltasPorRetardo}F</span>
                    )}
                  </td>
                  <td className="py-1 px-1 text-center font-bold text-black border-r border-zinc-300">
                    {item.faltas}
                    {item.faltasPorRetardo > 0 && (
                      <span className="text-[7px] block text-zinc-500 font-normal">Tot:{item.faltasEfectivas}</span>
                    )}
                  </td>
                  <td className="py-1 px-1 text-center font-mono font-bold text-black border-r border-zinc-300">
                    {item.totalSesiones}
                  </td>
                  <td className="py-1 px-1 text-center border-r border-zinc-300 font-bold">
                    <span className="text-black">{item.porcentajeAsistencia}%</span>
                    {item.porcentajeAsistencia < 80 ? (
                      <span className="block text-[7px] font-black uppercase text-rose-700 leading-none mt-0.5">[EN RIESGO]</span>
                    ) : item.porcentajeAsistencia < 85 ? (
                      <span className="block text-[7px] font-semibold text-amber-700 leading-none mt-0.5">[Regular]</span>
                    ) : (
                      <span className="block text-[7px] font-semibold text-emerald-800 leading-none mt-0.5">[Excelente]</span>
                    )}
                  </td>
                  <td className="py-1 px-2 text-[8px] text-zinc-900 leading-snug">
                    {item.observaciones.length > 0 ? (
                      <div className="space-y-0.5">
                        {item.observaciones.map((obs, obsIdx) => (
                          <div key={obsIdx} className="flex items-start gap-1">
                            <span className="font-mono font-bold text-black shrink-0">• {obs.date}</span>
                            <span className="font-bold text-zinc-700 uppercase shrink-0">[{obs.status}]:</span>
                            <span className="text-zinc-800">{obs.comments}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-400 italic">Sin incidencias ni observaciones registradas</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Nota Pedagógica Institucional */}
          <div className="text-[8px] text-zinc-600 mb-4 italic flex justify-between">
            <span>* Regla Institucional: Presente (P) y Justificado (J) computan como asistencia. 3 retardos (R) acumulan 1 falta (F). Mínimo aprobatorio SEP: 80%.</span>
            <span>Documento generado para control interno docente • Colegio Anglo Mexicano</span>
          </div>

          {/* Espacio de Validación Oficial y Firmas */}
          <div className="grid grid-cols-2 gap-12 text-center break-inside-avoid pt-2">
            <div>
              <div className="border-b border-black w-3/4 mx-auto mb-1 pt-6"></div>
              <p className="text-[9px] font-bold text-black uppercase">Firma del Docente Titular</p>
              <p className="text-[8px] text-zinc-600">Responsable de Asistencia del Grupo</p>
            </div>
            <div>
              <div className="border-b border-black w-3/4 mx-auto mb-1 pt-6"></div>
              <p className="text-[9px] font-bold text-black uppercase">Firma de Dirección Académica</p>
              <p className="text-[8px] text-zinc-600">Colegio Anglo Mexicano • Sello y Validación</p>
            </div>
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CUERPO INTERACTIVO EN PANTALLA (OCULTO AL IMPRIMIR) */}
        {/* ========================================================================= */}
        <div className="flex-1 min-h-0 flex flex-col p-4 md:p-6 print:hidden overflow-hidden">

          {/* PESTAÑA 1: TABLA COMPENDIO Y PORCENTAJES (PRINCIPAL) */}
          {activeTab === 'summary' && (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="overflow-auto flex-1 min-h-0 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-xs relative">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
                    <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-wider">
                      <th className="sticky top-0 left-0 z-40 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-4 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">ALUMNO</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-3 text-center text-emerald-700 dark:text-emerald-400 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">ASISTENCIAS</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-3 text-center text-blue-700 dark:text-blue-400 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">JUSTIFICADOS</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-3 text-center text-amber-700 dark:text-amber-400 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">RETARDOS</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-3 text-center text-rose-700 dark:text-rose-400 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">FALTAS</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-3 text-center text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 shadow-xs">TOTAL CLASES</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-4 text-center min-w-[160px] border-b border-zinc-200 dark:border-zinc-800 shadow-xs">% ASISTENCIA</th>
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3.5 px-4 text-left border-b border-zinc-200 dark:border-zinc-800 shadow-xs">OBSERVACIONES DEL PERIODO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {filteredData.map((item) => {
                      const isExpanded = expandedStudentId === item.student.id;
                      const hasObservations = item.observaciones.length > 0;
                      
                      const isAtRisk = item.porcentajeAsistencia < 80;
                      const isWarning = item.porcentajeAsistencia >= 80 && item.porcentajeAsistencia < 85;

                      return (
                        <React.Fragment key={item.student.id}>
                          <tr className={`hover:bg-zinc-50/60 dark:hover:bg-zinc-900/50 transition-colors ${
                            isExpanded ? 'bg-zinc-50/80 dark:bg-zinc-900/80' : ''
                          }`}>
                            
                            {/* Datos del Alumno */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/50 dark:border-indigo-800/50 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-extrabold text-[10px] shrink-0">
                                  {item.student.first_name[0]}{item.student.last_name_1?.[0] || ''}
                                </div>
                                <div>
                                  <span className="font-bold text-zinc-900 dark:text-zinc-100 block">
                                    {item.fullName}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono">{item.student.enrollment_id}</span>
                                </div>
                              </div>
                            </td>

                            {/* Presentes */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-extrabold border border-emerald-200/60 dark:border-emerald-800/50 text-xs">
                                {item.presentes}
                              </span>
                            </td>

                            {/* Justificados */}
                            <td className="py-3 px-3 text-center">
                              <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-extrabold border border-blue-200/60 dark:border-blue-800/50 text-xs">
                                {item.justificados}
                              </span>
                            </td>

                            {/* Retardos */}
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-lg font-extrabold border text-xs ${
                                  item.retardos > 0 
                                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/50'
                                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                                }`}>
                                  {item.retardos}
                                </span>
                                {item.faltasPorRetardo > 0 && (
                                  <span className="text-[9px] text-rose-600 dark:text-rose-400 font-bold mt-0.5" title={`${item.retardos} retardos = ${item.faltasPorRetardo} falta acumulada`}>
                                    ={item.faltasPorRetardo} Falta
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Faltas */}
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex flex-col items-center">
                                <span className={`inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-lg font-extrabold border text-xs ${
                                  item.faltas > 0 
                                    ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/50'
                                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800'
                                }`}>
                                  {item.faltas}
                                </span>
                                {item.faltasPorRetardo > 0 && (
                                  <span className="text-[9px] text-zinc-400 font-medium mt-0.5">
                                    Total: {item.faltasEfectivas}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Total Sesiones */}
                            <td className="py-3 px-3 text-center font-mono font-bold text-zinc-700 dark:text-zinc-300">
                              {item.totalSesiones}
                            </td>

                            {/* Porcentaje de Asistencia */}
                            <td className="py-3 px-4 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center justify-between w-full max-w-[130px]">
                                  <span className={`text-xs font-black ${
                                    isAtRisk ? 'text-rose-600 dark:text-rose-400' :
                                    isWarning ? 'text-amber-600 dark:text-amber-400' :
                                    'text-emerald-600 dark:text-emerald-400'
                                  }`}>
                                    {item.porcentajeAsistencia}%
                                  </span>
                                  {isAtRisk ? (
                                    <span className="text-[9px] font-black uppercase text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950 px-1.5 py-0.2 rounded border border-rose-300 dark:border-rose-800 flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" /> En Riesgo
                                    </span>
                                  ) : isWarning ? (
                                    <span className="text-[9px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                                      Regular
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
                                      Excelente
                                    </span>
                                  )}
                                </div>
                                
                                {/* Barra de Progreso */}
                                <div className="w-full max-w-[130px] h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full transition-all ${
                                      isAtRisk ? 'bg-rose-500' :
                                      isWarning ? 'bg-amber-500' :
                                      'bg-emerald-500'
                                    }`}
                                    style={{ width: `${item.porcentajeAsistencia}%` }}
                                  />
                                </div>
                              </div>
                            </td>

                            {/* Columna de Observaciones */}
                            <td className="py-3 px-4">
                              {hasObservations ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedStudentId(isExpanded ? null : item.student.id)}
                                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 px-2.5 py-1 rounded-xl transition-all border border-indigo-200/50 dark:border-indigo-800/40"
                                  >
                                    <MessageSquare className="w-3 h-3" />
                                    <span>{item.observaciones.length} {item.observaciones.length === 1 ? 'nota' : 'notas'}</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>
                                  
                                  {/* Resumen de última observación */}
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-[200px]" title={item.observaciones[0]?.comments}>
                                    "{item.observaciones[0]?.comments}"
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[11px] text-zinc-400 italic">
                                  Sin incidencias registradas
                                </span>
                              )}
                            </td>

                          </tr>

                          {/* Fila Expandible con el Historial Detallado de Observaciones del Alumno */}
                          {isExpanded && (
                            <tr className="bg-indigo-50/30 dark:bg-indigo-950/20">
                              <td colSpan={8} className="py-4 px-6">
                                <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950 border border-indigo-100 dark:border-indigo-900/50 shadow-inner">
                                  <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                                      <MessageSquare className="w-4 h-4 text-indigo-500" />
                                      Bitácora de Incidencias & Observaciones: {item.fullName}
                                    </h4>
                                    <span className="text-[10px] text-zinc-400">
                                      {item.observaciones.length} registros en el periodo seleccionado
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                                    {item.observaciones.map((obs, idx) => (
                                      <div 
                                        key={idx}
                                        className="p-3 rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex items-start gap-2.5"
                                      >
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                                          obs.status === 'presente' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                                          obs.status === 'justificado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                                          obs.status === 'retardo' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                                          'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                                        }`}>
                                          {obs.status}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center justify-between text-[10px] text-zinc-400 mb-0.5">
                                            <span className="font-mono font-bold text-zinc-600 dark:text-zinc-300">{obs.date}</span>
                                            <span className="font-medium text-zinc-500">{obs.subjectName}</span>
                                          </div>
                                          <p className="text-xs text-zinc-800 dark:text-zinc-200 font-medium">
                                            {obs.comments}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}

                    {filteredData.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-10 text-center text-zinc-400">
                          No se encontraron alumnos para los filtros o periodo seleccionado.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 2: SÁBANA DIARIA (MATRIZ DÍA X DÍA) */}
          {activeTab === 'matrix' && (
            <div className="flex-1 min-h-0 flex flex-col gap-4">
              <div className="flex items-center justify-between shrink-0">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">
                  Visualización cronológica de cada fecha registrada (P: Presente, J: Justificado, R: Retardo, F: Falta)
                </span>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-600"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Presente (P)</span>
                  <span className="flex items-center gap-1 text-blue-600"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Justificado (J)</span>
                  <span className="flex items-center gap-1 text-amber-600"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Retardo (R)</span>
                  <span className="flex items-center gap-1 text-rose-600"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Falta (F)</span>
                </div>
              </div>

              <div className="overflow-auto flex-1 min-h-0 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-950 shadow-xs relative">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 shadow-sm border-b border-zinc-200 dark:border-zinc-800">
                    <tr className="bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-500 dark:text-zinc-400 font-black uppercase">
                      <th className="sticky top-0 left-0 z-40 bg-zinc-100 dark:bg-zinc-900 py-3 px-4 min-w-[200px] border-b border-zinc-200 dark:border-zinc-800 shadow-xs">ALUMNO</th>
                      {matrixDates.map(date => {
                        const parts = date.split('-');
                        const dayMonth = `${parts[2]}/${parts[1]}`;
                        return (
                          <th key={date} className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3 px-2 text-center min-w-[45px] font-mono text-[10px] border-b border-zinc-200 dark:border-zinc-800 shadow-xs" title={date}>
                            {dayMonth}
                          </th>
                        );
                      })}
                      <th className="sticky top-0 z-30 bg-zinc-100 dark:bg-zinc-900 py-3 px-3 text-center min-w-[80px] border-b border-zinc-200 dark:border-zinc-800 shadow-xs">TOTAL %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {filteredData.map(item => (
                      <tr key={item.student.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50">
                        <td className="py-2.5 px-4 font-bold text-zinc-800 dark:text-zinc-200 sticky left-0 bg-white dark:bg-zinc-950 z-20">
                          {item.fullName}
                        </td>
                        {matrixDates.map(date => {
                          const record = attendanceList.find(att => 
                            att.student_id === item.student.id &&
                            att.group_id === selectedGroupId &&
                            att.date === date &&
                            (selectedSubjectId === 'all' || att.subject_id === selectedSubjectId)
                          );

                          if (!record) {
                            return (
                              <td key={date} className="py-2.5 px-2 text-center text-zinc-300 dark:text-zinc-700">
                                -
                              </td>
                            );
                          }

                          const st = record.status;
                          const letter = st === 'presente' ? 'P' : st === 'justificado' ? 'J' : st === 'retardo' ? 'R' : 'F';
                          const color = 
                            st === 'presente' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' :
                            st === 'justificado' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300' :
                            st === 'retardo' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300' :
                            'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300';

                          return (
                            <td key={date} className="py-2.5 px-2 text-center">
                              <span 
                                className={`inline-block w-6 h-6 leading-6 rounded-md font-black text-[10px] ${color}`}
                                title={`${date} - ${st.toUpperCase()}${record.comments ? ': ' + record.comments : ''}`}
                              >
                                {letter}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-2.5 px-3 text-center font-black">
                          <span className={`px-2 py-0.5 rounded-md text-xs ${
                            item.porcentajeAsistencia >= 85 ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' :
                            item.porcentajeAsistencia >= 80 ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' :
                            'text-rose-600 bg-rose-50 dark:bg-rose-950/40'
                          }`}>
                            {item.porcentajeAsistencia}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PESTAÑA 3: BITÁCORA GENERAL DE OBSERVACIONES DEL GRUPO */}
          {activeTab === 'observations' && (
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {compendiumData.flatMap(item => 
                  item.observaciones.map((obs, idx) => ({
                    ...obs,
                    studentName: item.fullName,
                    enrollmentId: item.student.enrollment_id,
                    studentId: item.student.id,
                    uniqueKey: `${item.student.id}-${obs.date}-${idx}`
                  }))
                )
                .sort((a, b) => b.date.localeCompare(a.date))
                .map(entry => (
                  <div
                    key={entry.uniqueKey}
                    className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xs flex flex-col justify-between gap-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100 block">
                          {entry.studentName}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">{entry.enrollmentId}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        entry.status === 'presente' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' :
                        entry.status === 'justificado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400' :
                        entry.status === 'retardo' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                      }`}>
                        {entry.status}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-700 dark:text-zinc-300 font-medium bg-zinc-50 dark:bg-zinc-900/70 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                      "{entry.comments}"
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-850">
                      <span className="font-mono font-bold">📅 {entry.date}</span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">📚 {entry.subjectName}</span>
                    </div>
                  </div>
                ))}

                {compendiumData.every(c => c.observaciones.length === 0) && (
                  <div className="col-span-2 py-12 text-center text-zinc-400">
                    No hay observaciones ni incidencias registradas en este periodo.
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Pie de Modal en Pantalla */}
        <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Mostrando <strong>{filteredData.length}</strong> de <strong>{studentsInGroup.length}</strong> alumnos del grupo <strong>{currentGroupObj?.name}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            Cerrar Compendio
          </button>
        </div>

      </div>

    </div>
  );
}
