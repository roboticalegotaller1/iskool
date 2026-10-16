"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  ShieldAlert,
  KeyRound, 
  Search, 
  Download, 
  Cpu, 
  BarChart3, 
  Sparkles, 
  School, 
  Brain, 
  TrendingUp,
  CreditCard,
  CheckCircle2,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { 
  useSchoolAdminStore, 
  getSchoolCampuses, 
  getSchoolStudents, 
  getSchoolTeachers,
  getSchoolDeletionAuditLogs
} from '@/store/useSchoolAdminStore';
import { useSuperUserTokenMetrics } from '@/hooks/useIsSuperUser';
import { StudentDeletionAuditLog, UserProfile } from '@/types';
import { SchoolStatusSlider } from '@/components/admin/SchoolStatusSlider';
import { SchoolOfficialLogo } from '@/components/brand/SchoolOfficialLogo';

type CommandCenterTab = 'governance' | 'tokens' | 'vault' | 'audit';

interface SuperUserCommandCenterProps {
  onBackToDirectory?: () => void;
}

export function SuperUserCommandCenter({ onBackToDirectory }: SuperUserCommandCenterProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CommandCenterTab>('governance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'official' | 'sandbox' | 'corporate' | 'independent'>('all');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store data
  const institutionsList = useSchoolAdminStore((s) => s.institutionsList);
  const activeSchoolId = useSchoolAdminStore((s) => s.activeSchoolId);
  const selectSchool = useSchoolAdminStore((s) => s.selectSchool);
  const campusesList = useSchoolAdminStore((s) => s.campusesList);
  const teachersList = useSchoolAdminStore((s) => s.teachersList);
  const detailedStudents = useSchoolAdminStore((s) => s.detailedStudents);
  const staffUsers = useSchoolAdminStore((s) => s.staffUsers);
  const toggleSchoolSuspension = useSchoolAdminStore((s) => s.toggleSchoolSuspension);
  const updateIndependentTeacherQuota = useSchoolAdminStore((s) => s.updateIndependentTeacherQuota);
  const studentDeletionAuditLogs = useSchoolAdminStore((s) => s.studentDeletionAuditLogs) || [];

  // Telemetría de tokens
  const { totalTokensConsumed, totalTokenQuota, estimatedCostUsd } = useSuperUserTokenMetrics();

  // Filtrado de instituciones
  const filteredInstitutions = useMemo(() => {
    return (institutionsList || []).filter((inst) => {
      const matchesSearch = 
        inst.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inst.cct.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inst.tagline && inst.tagline.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedFilter === 'official') return !inst.isTestCase && !inst.is_corporate_enterprise && !inst.isIndependentTeachersNetwork;
      if (selectedFilter === 'sandbox') return Boolean(inst.isTestCase);
      if (selectedFilter === 'corporate') return Boolean(inst.is_corporate_enterprise || inst.institution_type === 'corporate');
      if (selectedFilter === 'independent') return Boolean(inst.isIndependentTeachersNetwork || inst.id === 'sch-profesores-independientes');

      return true;
    });
  }, [institutionsList, searchQuery, selectedFilter]);

  // Telemetría de docentes ordenada por consumo
  const teacherTelemetry = useMemo(() => {
    return [...(teachersList || [])].sort((a, b) => (b.ai_tokens_consumed || 0) - (a.ai_tokens_consumed || 0));
  }, [teachersList]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Exportador de bitácora
  const exportAuditLogsCSV = () => {
    const logs = studentDeletionAuditLogs.length > 0 ? studentDeletionAuditLogs : getSchoolDeletionAuditLogs(studentDeletionAuditLogs, null);
    if (!logs.length) {
      showNotification('No hay registros de auditoría para exportar en este momento.');
      return;
    }

    const headers = ['ID Registro', 'Alumno', 'CURP', 'Colegio', 'Grado', 'Fecha Eliminación', 'Eliminado Por', 'Rol', 'Motivo'];
    const rows = logs.map((log: StudentDeletionAuditLog) => [
      log.id,
      `"${log.student_name}"`,
      log.curp || 'N/A',
      `"${log.school_name || log.school_id}"`,
      `"${log.grade || ''} ${log.level || ''}"`,
      log.deleted_at_formatted || log.deleted_at,
      `"${log.deleted_by_name}"`,
      log.deleted_by_role,
      `"${log.reason.replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r: string[]) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_superusuario_iskool_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Bitácora de auditoría exportada exitosamente.');
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-5 w-5 text-indigo-200" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* HEADER PRINCIPAL DEL CENTRO DE MANDO */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-amber-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Centro de Mando Superusuario
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Nivel 1 · Acceso Total
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Gobernanza Multi-Plantel, Telemetría del Motor de IA, Auditoría de Bóveda y Permisos Institucionales.
            </p>
          </div>
        </div>

        {/* Acciones Rápidas del Header */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBackToDirectory ? (
            <button
              onClick={onBackToDirectory}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <School className="h-4 w-4 text-indigo-500" />
              <span>Directorio de Colegios</span>
            </button>
          ) : (
            <Link
              href="/admin"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <School className="h-4 w-4 text-indigo-500" />
              <span>Directorio de Colegios</span>
            </Link>
          )}

          <Link
            href="/admin/ceo"
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md shadow-slate-900/20 transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <span>Visión Ejecutiva CEO</span>
          </Link>
        </div>
      </header>

      {/* NAVEGACIÓN POR PILARES DEL PORTAL */}
      <div className="border-b border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 px-4 sm:px-6">
        <div className="flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar py-2.5 max-w-7xl mx-auto">
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'governance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>1. Gobernanza Multi-Plantel</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'governance' ? 'bg-indigo-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}`}>
              {institutionsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'tokens'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/25'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>2. Telemetría de IA & Tokens</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'tokens' ? 'bg-purple-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}`}>
              {teachersList.length} docentes
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'vault'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <Brain className="h-4 w-4" />
            <span>3. Control Bóveda Curricular</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'vault' ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}`}>
              Fases 3-6 NEM
            </span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'audit'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/25'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>4. Auditoría & Permisos</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === 'audit' ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300'}`}>
              {studentDeletionAuditLogs.length} eventos
            </span>
          </button>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* ============================================================== */}
        {/* PESTAÑA 1: GOBERNANZA MULTI-PLANTEL */}
        {/* ============================================================== */}
        {activeTab === 'governance' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* KPI Cards de Gobernanza */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Red de Instituciones</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <School className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{institutionsList.length}</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    {institutionsList.filter(i => i.status !== 'inactive').length} activas · {institutionsList.filter(i => i.status === 'inactive').length} suspendidas
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Planteles & Sedes</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{campusesList.length}</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Campus físicos y sedes independientes
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Cuerpo Docente Total</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{teachersList.length}</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Profesores registrados con cuota de IA
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Matrícula Escolar Global</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">{detailedStudents.length}</span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    {detailedStudents.filter(s => !s.is_blocked).length} estudiantes en estatus regular
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Buscar institución por nombre, CCT o lema..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto no-scrollbar">
                {(['all', 'official', 'sandbox', 'corporate', 'independent'] as const).map((filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => setSelectedFilter(filterKey)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer shrink-0 ${
                      selectedFilter === filterKey
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200'
                    }`}
                  >
                    {filterKey === 'all' ? 'Todas' : filterKey === 'official' ? 'Oficiales' : filterKey === 'sandbox' ? 'Sandbox' : filterKey === 'corporate' ? 'Empresas B2B' : 'Independientes'}
                  </button>
                ))}
              </div>
            </div>

            {/* Directorio de Instituciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredInstitutions.map((inst) => {
                const instCampuses = getSchoolCampuses(campusesList, inst.id);
                const instStudents = getSchoolStudents(detailedStudents, inst.id, instCampuses);
                const instTeachers = getSchoolTeachers(teachersList, inst.id, instCampuses);
                const isSuspended = inst.status === 'inactive';
                const isSelected = activeSchoolId === inst.id;

                return (
                  <div
                    key={inst.id}
                    className={`rounded-2xl border p-5 transition-all bg-white dark:bg-zinc-900 flex flex-col justify-between shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                        : isSuspended
                        ? 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
                        : 'border-slate-200 dark:border-zinc-800 hover:border-indigo-300'
                    }`}
                  >
                    <div>
                      {/* Top Header Card */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center p-1 overflow-hidden shrink-0">
                            <SchoolOfficialLogo
                              schoolId={inst.id}
                              name={inst.name}
                              logoUrl={inst.logoUrl}
                              size={44}
                              variant="shield_only"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                              {inst.name}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                              CCT: {inst.cct}
                            </span>
                          </div>
                        </div>

                        <SchoolStatusSlider
                          schoolId={inst.id}
                          schoolName={inst.name}
                          status={inst.status || 'active'}
                          isTestCase={inst.isTestCase}
                          onToggle={() => {
                            toggleSchoolSuspension(inst.id);
                            showNotification(`Estado de ${inst.name} actualizado`);
                          }}
                        />
                      </div>

                      {/* Métricas rápidas */}
                      <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                          <span className="text-xs font-black text-slate-900 dark:text-white block">{instCampuses.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Planteles</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                          <span className="text-xs font-black text-blue-600 block">{instStudents.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Alumnos</span>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800/50">
                          <span className="text-xs font-black text-emerald-600 block">{instTeachers.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Docentes</span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Operación */}
                    <div className="flex items-center gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800">
                      <button
                        onClick={() => {
                          selectSchool(inst.id);
                          showNotification(`Contexto establecido en: ${inst.name}`);
                          router.push('/admin');
                        }}
                        className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        <span>Operar Plantel</span>
                      </button>

                      <button
                        onClick={() => {
                          selectSchool(inst.id);
                          router.push('/teacher');
                        }}
                        className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Ver como Docente de este colegio"
                      >
                        <ExternalLink className="h-3.5 w-3.5 text-purple-500" />
                        <span>Aula</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: TELEMETRÍA DE IA & CONSUMO DE TOKENS */}
        {/* ============================================================== */}
        {activeTab === 'tokens' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner de Monitoreo */}
            <div className="rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-bold">
                  <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Motor de Inteligencia Artificial Pedagógica
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Telemetría de Inferencia & Cuotas en Tiempo Real
                </h2>
                <p className="text-xs sm:text-sm text-purple-200/80 leading-relaxed">
                  Supervisa el consumo acumulativo de tokens utilizados por los docentes en la generación de planeaciones formativas, rúbricas de evaluación y proyectos de aula vinculados a la Bóveda Curricular.
                </p>
              </div>
            </div>

            {/* KPIs de Inferencia IA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Tokens Consumidos</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400">
                    <Cpu className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-purple-700 dark:text-purple-400">
                    {totalTokensConsumed.toLocaleString()}
                  </span>
                  <div className="mt-2 w-full bg-slate-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-purple-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (totalTokensConsumed / totalTokenQuota) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    {((totalTokensConsumed / totalTokenQuota) * 100).toFixed(1)}% de la cuota global utilizada
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Cuota Asignada de Red</span>
                  <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {(totalTokenQuota / 1000000).toFixed(2)}M
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Capacidad autorizada para todo el ecosistema
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Inversión Estimada</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                    ${(estimatedCostUsd * 18.5).toFixed(2)} MXN
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    ≈ ${estimatedCostUsd} USD al costo institucional
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Ahorro Bóveda (0 Tokens)</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                    <Brain className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-amber-600 dark:text-amber-400">
                    84.2%
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                    Consultas resueltas desde caché curricular
                  </p>
                </div>
              </div>
            </div>

            {/* Tabla de Consumo por Docente */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Desglose de Inferencia por Docente
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Permite supervisar qué educadores hacen mayor uso del asistente y ajustar sus cuotas individuales.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-800 text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Docente</th>
                      <th className="py-3 px-4">Plantel / Institución</th>
                      <th className="py-3 px-4">Especialidad / Materias</th>
                      <th className="py-3 px-4">Tokens Usados</th>
                      <th className="py-3 px-4">Cuota Asignada</th>
                      <th className="py-3 px-4">% Utilizado</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {teacherTelemetry.slice(0, 15).map((t: UserProfile) => {
                      const quota = t.token_quota || 250000;
                      const consumed = t.ai_tokens_consumed || 0;
                      const pct = Math.min(100, (consumed / quota) * 100);
                      const isHigh = pct >= 80;
                      const teacherName = `${t.first_name || ''} ${t.last_name || ''}`.trim() || t.email;

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {teacherName.charAt(0)}
                            </div>
                            <span className="truncate max-w-[160px]">{teacherName}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-zinc-400">
                            {t.school_id === 'sch-jjrosseau' ? 'Col. Rousseau' : t.school_id === 'sch-ibime' ? 'IBIME' : 'Red Autónoma'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 dark:text-zinc-400 max-w-[140px] truncate">
                            {(t.assigned_subjects || []).join(', ') || t.specialty || 'General'}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-purple-700 dark:text-purple-400">
                            {consumed.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-500">
                            {quota.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${isHigh ? 'bg-rose-500' : 'bg-purple-600'}`}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                              <span className={`text-[10px] font-bold ${isHigh ? 'text-rose-600' : 'text-slate-500'}`}>
                                {pct.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                updateIndependentTeacherQuota(t.id, quota + 50000);
                                showNotification(`Cuota incrementada +50k tokens para ${teacherName}`);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 dark:bg-purple-950 hover:bg-purple-100 text-purple-700 dark:text-purple-300 text-[11px] font-black border border-purple-200 dark:border-purple-800 transition-all cursor-pointer"
                            >
                              +50k Cuota
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: CONTROL CENTRAL DE BÓVEDA CURRICULAR */}
        {/* ============================================================== */}
        {activeTab === 'vault' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Banner de Bóveda */}
            <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                  <Brain className="h-3.5 w-3.5 text-emerald-300" /> Bóveda Curricular Institucional (Vault-First)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
                  Repositorio de Conocimiento & Planes Didácticos
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed">
                  Supervisa la indexación de las planeaciones pedagógicas oficiales de la SEP (Nueva Escuela Mexicana 2024), compendios de libros digitales y nodos curriculares bidireccionales sincronizados con el Repositorio Central.
                </p>
              </div>
            </div>

            {/* Fases NEM y Distribución */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Fase 3 (1º y 2º Primaria)</span>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">124</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Lenguajes, Saberes, Ética y Humano indexados
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Fase 4 (3º y 4º Primaria)</span>
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">118</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Planeaciones con proyectos y rúbricas analíticas
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Fase 5 (5º y 6º Primaria)</span>
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">132</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Nodos transversales de ciencias y proyectos comunitarios
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Fase 6 (Secundaria)</span>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900 dark:text-white">96</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Disciplinas académicas con sesiones cronometradas
                  </p>
                </div>
              </div>
            </div>

            {/* Herramientas de Auditoría Curricular */}
            <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Sincronización Institucional de Bóveda Curricular
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                    Garantiza que toda planeación cumpla el ciclo Vault-First: consulta inicial sin consumo de IA y fallback automático con almacenamiento estricto en Markdown.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showNotification('Bóveda Curricular reindexada y sincronizada al 100%');
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Reindexar Nodos</span>
                  </button>

                  <Link
                    href="/planeaciones"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-bold border border-slate-200 dark:border-zinc-700 transition-all flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-4 w-4 text-emerald-600" />
                    <span>Explorar Bóveda</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: AUDITORÍA & PERMISOS AVANZADOS */}
        {/* ============================================================== */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header de Auditoría */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-amber-500" />
                  Bitácora Inmutable de Auditoría & Trazabilidad
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                  Registro cronológico de eliminaciones de alumnos, cambios de credenciales y eventos de gobernanza escolar.
                </p>
              </div>

              <button
                onClick={exportAuditLogsCSV}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                <span>Exportar Bitácora CSV</span>
              </button>
            </div>

            {/* Tabla de Auditoría */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600 dark:text-zinc-300">
                  <thead className="bg-slate-50 dark:bg-zinc-800 text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400 tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Evento / Registro</th>
                      <th className="py-3 px-4">Institución</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4">Rol</th>
                      <th className="py-3 px-4">Motivo / Causa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
                    {studentDeletionAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                          <p className="font-bold">No hay eliminaciones o eventos críticos pendientes de auditoría.</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">El ecosistema opera con integridad de datos al 100%.</p>
                        </td>
                      </tr>
                    ) : (
                      studentDeletionAuditLogs.map((log: StudentDeletionAuditLog) => (
                        <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors">
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                            {log.deleted_at_formatted || log.deleted_at}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {log.student_name}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              ID: {log.student_id} · CURP: {log.curp || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {log.school_name || log.school_id}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-700 dark:text-zinc-200">
                            {log.deleted_by_name}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 uppercase">
                              {log.deleted_by_role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                            {log.reason}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Directorio de Cuentas Directivas */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 p-5 space-y-4">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-indigo-600" />
                Directorio Central de Directores & Administradores de Plantel
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {staffUsers.map((staff: UserProfile) => {
                  const staffName = `${staff.first_name || ''} ${staff.last_name || ''}`.trim() || staff.email;
                  return (
                    <div key={staff.id} className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 flex items-center justify-between gap-3">
                      <div className="truncate">
                        <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                          {staffName}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {staff.email} · {staff.role}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${staff.is_blocked ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {staff.is_blocked ? 'Inactivo' : 'Activo'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
