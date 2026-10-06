"use client";

/**
 * @module CrmAdmissionsStudio
 * @description Componente principal del CRM Escolar de ISkool.
 *   Tablero Kanban de pipeline, ficha de detalle con drawer lateral,
 *   dashboard de métricas, gestión de tareas y modales de captura.
 *   100% aislado — no modifica ningún archivo existente del proyecto.
 */
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, ChevronLeft, X, Phone, Mail, Calendar, Clock,
  CheckCircle2, AlertCircle, ArrowRight, Users, Target, TrendingUp,
  FileText, Star, Building2, EyeOff, Eye, BarChart3,
  MessageCircle, ChevronDown, ShieldCheck, Lock, Edit3, UserPlus,
  Layers, School, ArrowUpRight, DollarSign, Receipt, ClipboardList, Check, Award, ArrowLeft, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCrmStore, getFilteredLeads, getLeadsByStage, getLeadCandidates, getLeadActivities, getLeadDocuments, getPendingTasks, getOverdueTasks, calculateDashboardSummary, calculateFunnelMetrics, calculateChannelEffectiveness, getSchoolLeads, getPipelineLeads } from '@/store/useCrmStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import type { CrmLead, CrmActivity, PipelineType, CrmStageKey, CrmAuthorizedRole, LeadPriority } from '@/types/crm';
import {
  NEW_ENROLLMENT_STAGES, SOURCE_CHANNELS, ACTIVITY_TYPES, DOCUMENT_TYPES,
  PRIORITY_CONFIG, PIPELINE_CONFIG, LOST_REASONS,
  getStagesForPipeline, getStageDefinition, formatTutorName, formatCandidateName, calculateDaysInStage,
  isCrmAuthorized, CRM_AUTHORIZED_ROLES
} from '@/types/crm';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export interface CrmAdmissionsStudioProps {
  initialCampus?: string;
  initialTab?: 'pipeline' | 'institutional' | 'directory' | 'dashboard' | 'tasks';
  embeddedInDashboard?: boolean;
  onBackToDashboard?: () => void;
  onSwitchToOperational?: () => void;
}

export default function CrmAdmissionsStudio({
  initialCampus,
  initialTab = 'institutional',
  embeddedInDashboard = false,
  onBackToDashboard,
  onSwitchToOperational,
}: CrmAdmissionsStudioProps = {}) {
  const { user, loading: authLoading } = useAuth();
  const { activeSchoolId, institutionsList } = useSchoolAdminStore();
  const school = institutionsList.find((s: { id: string }) => s.id === activeSchoolId);

  // Soporte para selección de perfiles autorizados (Dueño, Directivo, Administración y Ventas)
  // Por defecto inicializa en 'owner' si no hay sesión abierta para facilitar pruebas directas
  const [simulatedRole, setSimulatedRole] = useState<CrmAuthorizedRole | null>(null);

  const effectiveUser = useMemo(() => {
    if (simulatedRole) {
      if (simulatedRole === 'owner') {
        return { first_name: 'Don Alejandro', last_name: 'Vargas Robles', role: 'owner', email: 'dueno@jjrosseau.edu.mx' };
      }
      if (simulatedRole === 'director') {
        return { first_name: 'Lic. Roberto', last_name: 'Garza Hernández', role: 'director', email: 'director@iskool.edu.mx' };
      }
      return { first_name: 'Lic. Mariana', last_name: 'Solís', role: 'admissions_sales', email: 'ventas@iskool.edu.mx' };
    }
    if (user && isCrmAuthorized(user)) {
      return user;
    }
    // Fallback inicial para desarrollo/pruebas directas
    return { first_name: 'Don Alejandro', last_name: 'Vargas Robles', role: 'owner', email: 'dueno@jjrosseau.edu.mx' };
  }, [simulatedRole, user]);

  const hasAccess = useMemo(() => {
    if (simulatedRole) return true;
    if (user) return isCrmAuthorized(user);
    // Si entra directamente a la URL en modo dev sin sesión, permite ver como Dueño por defecto
    return true;
  }, [simulatedRole, user]);

  const store = useCrmStore();
  const {
    leads, candidates, activities, documents,
    activePipeline, setActivePipeline,
    searchQuery, setSearchQuery,
    filterCampusId, setFilterCampus,
    filterPriority, setFilterPriority,
    clearAllFilters,
    advanceLeadStage, changeLeadStage,
    addActivity, completeTask,
    openLeadDetail, closeLeadDetail,
  } = store;

  // --- Estado local de UI ---
  const [activeTab, setActiveTab] = useState<'pipeline' | 'institutional' | 'directory' | 'dashboard' | 'tasks'>(initialTab);

  // Sincronizar filtro multi-plantel reactivamente con la selección global de la Vista de CEO
  useEffect(() => {
    if (initialCampus !== undefined) {
      if (!initialCampus || initialCampus === 'all') {
        setFilterCampus(null);
      } else {
        const normalized = initialCampus.replace('cmp-', '').toLowerCase();
        setFilterCampus(normalized);
      }
    }
  }, [initialCampus, setFilterCampus]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [collapsedStages, setCollapsedStages] = useState<string[]>(['declined', 'withdrawn', 'exit']);
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
  const [isAddActivityModalOpen, setIsAddActivityModalOpen] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<'all' | 'marketing' | 'campus_dir' | 'psychology' | 'academic_dir' | 'treasury'>('all');
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentLead, setAssignmentLead] = useState<CrmLead | null>(null);
  const [isCfdiModalOpen, setIsCfdiModalOpen] = useState(false);
  const [cfdiLead, setCfdiLead] = useState<CrmLead | null>(null);

  // --- Datos derivados ---
  const effectiveSchoolId = activeSchoolId || 'sch-ibime';
  const filteredLeads = useMemo(() => getFilteredLeads(store, effectiveSchoolId), [store, effectiveSchoolId]);
  const stages = useMemo(() => getStagesForPipeline(activePipeline), [activePipeline]);
  const schoolLeads = useMemo(() => getSchoolLeads(leads, effectiveSchoolId), [leads, effectiveSchoolId]);

  // --- Fases Institucionales Corresponsables (Main) ---
  const institutionalPhases = useMemo(() => {
    const p1 = schoolLeads.filter(l => l.stage === 'registered' || l.stage === 'contacted' || l.stage === 'census');
    const p2 = schoolLeads.filter(l => l.stage === 'tour_scheduled' || l.stage === 'status_review' || l.stage === 'intention_survey');
    const p3 = schoolLeads.filter(l => l.stage === 'evaluation');
    const p4 = schoolLeads.filter(l => l.stage === 'proposal_sent' || l.stage === 'reservation' || l.stage === 'payment_pending');
    const p5 = schoolLeads.filter(l => l.stage === 'enrolled' || l.stage === 'reenrolled' || l.stage === 'transferred');

    return [
      {
        num: 1,
        id: 'marketing' as const,
        phase: 'Fase 1 · Lead',
        title: 'Captación & CRM',
        desc: 'Registro del aspirante, canal de origen y primer contacto de bienvenida.',
        dept: 'Admisiones & Marketing',
        location: 'Landing Web, Ferias Escolares o WhatsApp',
        leads: p1,
        color: 'purple',
        bgColor: 'bg-purple-50/70',
        borderColor: 'border-purple-200',
        textAccent: 'text-purple-700',
        badge: 'bg-purple-50 text-purple-700 border-purple-200',
        dot: 'bg-purple-600',
        icon: '🎯'
      },
      {
        num: 2,
        id: 'campus_dir' as const,
        phase: 'Fase 2 · Visita',
        title: 'Tours de Campus',
        desc: 'Recorrido presencial de instalaciones STEAM, laboratorios y canchas.',
        dept: 'Dirección de Campus & RRPP',
        location: 'Agenda de Visitas / Directorio de Pipeline',
        leads: p2,
        color: 'indigo',
        bgColor: 'bg-indigo-50/70',
        borderColor: 'border-indigo-200',
        textAccent: 'text-indigo-700',
        badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-600',
        icon: '🏫'
      },
      {
        num: 3,
        id: 'psychology' as const,
        phase: 'Fase 3 · Evaluación',
        title: 'Diagnóstico Psicopedagógico',
        desc: 'Evaluación cognitiva, socioemocional y entrevista familiar de admisión.',
        dept: 'Gabinete Psicopedagógico',
        location: 'Expediente Diagnóstico Psicopedagógico',
        leads: p3,
        color: 'blue',
        bgColor: 'bg-blue-50/70',
        borderColor: 'border-blue-200',
        textAccent: 'text-blue-700',
        badge: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-600',
        icon: '📝'
      },
      {
        num: 4,
        id: 'academic_dir' as const,
        phase: 'Fase 4 · Reserva',
        title: 'Carta de Asignación',
        desc: 'Reserva formal de cupo en grado y grupo escolar con vigencia estipulada.',
        dept: 'Dirección Académica & Comité',
        location: 'Comité Directivo de Asignación Escolar',
        leads: p4,
        color: 'teal',
        bgColor: 'bg-teal-50/70',
        borderColor: 'border-teal-200',
        textAccent: 'text-teal-700',
        badge: 'bg-teal-50 text-teal-700 border-teal-200',
        dot: 'bg-teal-600',
        icon: '📜'
      },
      {
        num: 5,
        id: 'treasury' as const,
        phase: 'Fase 5 · Matrícula',
        title: 'Inscripción Pagada & SAT',
        desc: 'Conciliación de pago bancario, CFDI 4.0 IEDU SAT y alta en matrícula SEP.',
        dept: 'Caja, Tesorería & Control Escolar',
        location: 'Módulo Cobranza SPEI + Padrón de Alumnos',
        leads: p5,
        color: 'emerald',
        bgColor: 'bg-emerald-50/70',
        borderColor: 'border-emerald-200',
        textAccent: 'text-emerald-700',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-600',
        icon: '🎓'
      }
    ];
  }, [schoolLeads]);

  // Filtrado por departamento si está activo
  const leadsFilteredByDepartment = useMemo(() => {
    if (departmentFilter === 'all') return filteredLeads;
    const phaseObj = institutionalPhases.find(p => p.id === departmentFilter);
    if (!phaseObj) return filteredLeads;
    const phaseLeadIds = new Set(phaseObj.leads.map(l => l.id));
    return filteredLeads.filter(l => phaseLeadIds.has(l.id));
  }, [filteredLeads, departmentFilter, institutionalPhases]);

  const leadsByStage = useMemo(() => getLeadsByStage(leadsFilteredByDepartment, activePipeline), [leadsFilteredByDepartment, activePipeline]);

  const pipelineLeads = useMemo(() => getPipelineLeads(schoolLeads, activePipeline), [schoolLeads, activePipeline]);
  const pendingTasksList = useMemo(() => getPendingTasks(activities, schoolLeads), [activities, schoolLeads]);
  const overdueTasksList = useMemo(() => getOverdueTasks(activities, schoolLeads), [activities, schoolLeads]);
  const dashboardSummary = useMemo(() => calculateDashboardSummary(schoolLeads, candidates, activities), [schoolLeads, candidates, activities]);
  const funnelMetrics = useMemo(() => calculateFunnelMetrics(schoolLeads, activePipeline), [schoolLeads, activePipeline]);
  const channelMetrics = useMemo(() => calculateChannelEffectiveness(schoolLeads), [schoolLeads]);

  // Lead seleccionado con detalles
  const selectedLead = useMemo(() => selectedLeadId ? leads.find(l => l.id === selectedLeadId) : null, [selectedLeadId, leads]);
  const selectedCandidates = useMemo(() => selectedLeadId ? getLeadCandidates(candidates, selectedLeadId) : [], [selectedLeadId, candidates]);
  const selectedActivities = useMemo(() => selectedLeadId ? getLeadActivities(activities, selectedLeadId) : [], [selectedLeadId, activities]);
  const selectedDocuments = useMemo(() => selectedLeadId ? getLeadDocuments(documents, selectedLeadId) : [], [selectedLeadId, documents]);

  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  const toggleStageCollapse = (stageKey: string) => {
    setCollapsedStages(prev =>
      prev.includes(stageKey) ? prev.filter(k => k !== stageKey) : [...prev, stageKey]
    );
  };

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverStage !== stageKey) {
      setDragOverStage(stageKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Solo si sale del contenedor
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      const targetLead = leads.find(l => l.id === leadId);
      const stageDef = getStageDefinition(activePipeline, targetStage);
      changeLeadStage(leadId, targetStage as CrmStageKey);
      if (targetLead) {
        showToast(`✓ ${formatTutorName(targetLead)} movido a "${stageDef.label.replace(/^\d+\.\s*/, '')}"`);
      }
    }
  };

  // ============================================================
  // HEADER
  // ============================================================
  const renderHeader = () => (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <Link 
              href={activeSchoolId === 'sch-ibime' || school?.name?.toLowerCase().includes('ibime') || user?.school_id === 'sch-ibime' || user?.email?.toLowerCase().includes('ibime') ? '/ibime/portal' : '/admin'} 
              className="text-slate-500 hover:text-slate-700 flex items-center text-xs font-semibold mr-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-0.5" />
              Volver a Administración
            </Link>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200">
              Crecimiento & Matrícula Nueva
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
              Ciclo 2026-2027
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              ⚡ Fusión Unificada 360°
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-700 flex items-center tracking-tight">
            📋 CRM de Admisiones Escolar 360°
          </h1>
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <p className="text-slate-600 font-semibold text-xs sm:text-sm">{school?.name || 'Instituto Bilingüe IBIME (Red de Planteles)'}</p>
            <span className="text-slate-300">•</span>
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-xl text-xs">
              <span className="text-slate-400 font-medium">Perfil Activo:</span>
              <span className="font-bold text-slate-800">
                {effectiveUser?.role === 'owner' ? '👑 Dueño' :
                 effectiveUser?.role === 'admissions_sales' || effectiveUser?.role === 'ventas' ? '💼 Admón. y Ventas' :
                 '👔 Directivo'} — {effectiveUser?.first_name} {effectiveUser?.last_name}
              </span>
              <select
                value={simulatedRole || (effectiveUser?.role as any) || ''}
                onChange={e => setSimulatedRole(e.target.value ? (e.target.value as CrmAuthorizedRole) : null)}
                className="ml-1 bg-white border border-slate-200 rounded-md px-1.5 py-0.5 text-[11px] text-slate-700 font-medium cursor-pointer hover:bg-slate-100 focus:outline-none"
                title="Cambiar perfil activo para pruebas"
              >
                <option value="owner">👑 Perfil: Dueño</option>
                <option value="director">👔 Perfil: Directivo</option>
                <option value="admissions_sales">💼 Perfil: Admón. y Ventas</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
            {(['new_enrollment', 'reenrollment', 'internal_transfer'] as PipelineType[]).map(pt => (
              <button
                key={pt}
                onClick={() => setActivePipeline(pt)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activePipeline === pt
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {PIPELINE_CONFIG[pt].icon} {PIPELINE_CONFIG[pt].label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setActiveTab('directory')}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
            title="Directorio de familias del pipeline"
          >
            <ClipboardList size={15} className="text-purple-600" />
            Directorio ({schoolLeads.length})
          </button>

          <button
            onClick={() => {
              if (onSwitchToOperational) {
                onSwitchToOperational();
              } else {
                window.location.href = '/admin';
              }
            }}
            className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Ir a la gestión operativa de Control Escolar"
          >
            <School size={15} className="text-indigo-600" />
            Control Escolar
            <ArrowUpRight size={13} className="text-slate-400" />
          </button>

          {embeddedInDashboard && (
            <Link
              href="/admin/crm"
              target="_blank"
              className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
              title="Abrir CRM en pantalla completa independiente"
            >
              <ExternalLink size={14} />
              Pantalla Completa
            </Link>
          )}

          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Volver a la vista del embudo clásico"
            >
              <ArrowLeft size={14} />
              Vista Resumen Clásico
            </button>
          )}

          <button
            onClick={() => setIsAddLeadModalOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl px-4 py-2.5 flex items-center font-bold text-xs shadow-md shadow-purple-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            + Registrar Aspirante
          </button>
        </div>
      </div>

      {renderFinancialVelocityBar()}
      {renderDepartmentalMatrix()}
    </div>
  );

  // ============================================================
  // BARRA FINANCIERA & VELOCIDAD DEL PIPELINE (Del Main)
  // ============================================================
  const renderFinancialVelocityBar = () => (
    <div className="bg-white/95 backdrop-blur-sm p-5 rounded-3xl text-slate-800 border border-slate-200/90 space-y-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200">
              ⚡ Eficiencia Comercial Escolar
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              0 Tokens • Sincronización Inmediata
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 mt-1">
            Velocidad del Pipeline: 9.5 Días Promedio de Conversión
          </h3>
          <p className="text-xs text-slate-600">
            El ciclo promedio del mercado escolar mexicano es de 22 días. ISkool reduce los tiempos en más del <strong className="text-emerald-600 font-bold">56%</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-gradient-to-br from-slate-50 to-indigo-50/50 p-3 rounded-2xl border border-slate-200/80 shrink-0">
          <div className="text-right">
            <span className="text-[10px] text-purple-700 block font-semibold">Valor Pipeline 2026-2027:</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono tracking-tight">$4,180,000 MXN</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />
          <div className="hidden sm:block text-right">
            <span className="text-[10px] text-slate-500 block font-medium">Familias en Pipeline:</span>
            <span className="text-base font-bold text-slate-800 font-mono">{schoolLeads.filter(l => l.outcome !== 'declined').length} Familias</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-white hover:shadow-xs transition-all">
          <span className="text-[10px] text-purple-700 block font-bold uppercase">1. Contacto Inicial</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">&lt; 24 hrs</span>
          <span className="text-[10px] text-emerald-600 block font-medium">98% efectividad de llamada</span>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-white hover:shadow-xs transition-all">
          <span className="text-[10px] text-indigo-700 block font-bold uppercase">2. Tour a Diagnóstico</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">2.1 días</span>
          <span className="text-[10px] text-slate-500 block font-medium">Gabinete Psicopedagógico</span>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-xs transition-all">
          <span className="text-[10px] text-blue-700 block font-bold uppercase">3. Dictamen a Asignación</span>
          <span className="text-lg font-black text-slate-900 font-mono mt-0.5 block">1.4 días</span>
          <span className="text-[10px] text-indigo-600 block font-medium">Comité Directivo de Plazas</span>
        </div>
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-white hover:shadow-xs transition-all">
          <span className="text-[10px] text-emerald-700 block font-bold uppercase">4. Cierre y Matrícula</span>
          <span className="text-lg font-black text-emerald-600 font-mono mt-0.5 block">2.8 días</span>
          <span className="text-[10px] text-slate-500 block font-medium">SPEI + CFDI 4.0 IEDU SAT</span>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // MATRIZ DE CORRESPONSABILIDAD DEPARTAMENTAL (Del Main)
  // ============================================================
  const renderDepartmentalMatrix = () => (
    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-3xl text-slate-800 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Layers size={12} />
            Flujo Operativo Institucional Interdepartamental
          </div>
          <h3 className="text-base font-black text-slate-900 mt-1">
            ¿Dónde se llena esta información y quién es responsable de reportarla?
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            El avance de los aspirantes es el resultado sincronizado de 5 áreas escolares. Haz clic en cualquier fase para filtrar sus familias:
          </p>
        </div>
        <div className="flex items-center gap-2">
          {departmentFilter !== 'all' && (
            <button
              onClick={() => setDepartmentFilter('all')}
              className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer font-semibold"
            >
              <X size={12} /> Ver Todos los Departamentos
            </button>
          )}
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            ⚡ 5 Departamentos Coordinados
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {institutionalPhases.map(phase => {
          const isSelected = departmentFilter === phase.id;
          return (
            <div
              key={phase.id}
              onClick={() => setDepartmentFilter(isSelected ? 'all' : phase.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none ${
                isSelected
                  ? 'bg-indigo-50/90 border-indigo-400 ring-2 ring-indigo-400 shadow-md scale-[1.02]'
                  : `${phase.bgColor} ${phase.borderColor} hover:border-slate-400 hover:shadow-xs`
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase ${phase.textAccent}`}>
                    {phase.phase}
                  </span>
                  <span className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded-full text-slate-700 border border-slate-200/80 shadow-2xs">
                    {phase.leads.length}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                  <span>{phase.icon}</span>
                  {phase.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 leading-snug line-clamp-2">
                  {phase.desc}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/80 space-y-1">
                <div className="text-[10px] text-slate-400 font-semibold">¿Quién reporta?</div>
                <div className="text-[11px] text-slate-800 font-bold">{phase.dept}</div>
                <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                <div className="text-[10px] text-slate-600 bg-white p-1.5 rounded border border-slate-200/80 truncate shadow-2xs" title={phase.location}>
                  {phase.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ============================================================
  // STATS ROW
  // ============================================================
  const renderStatsRow = () => (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { label: 'Leads Activos', value: dashboardSummary.total_active_leads, icon: Users, color: 'blue', sub: `${dashboardSummary.leads_this_month} este mes` },
        { label: 'Tasa de Conversión', value: `${dashboardSummary.overall_conversion_rate}%`, icon: TrendingUp, color: 'emerald', sub: 'leads → inscritos' },
        { label: 'Inscritos este Ciclo', value: `${dashboardSummary.total_enrolled_current_cycle}/${dashboardSummary.enrollment_target}`, icon: Target, color: 'indigo', sub: `${Math.round(dashboardSummary.enrollment_progress_percent)}% de la meta` },
        { label: 'Tareas Vencidas', value: dashboardSummary.overdue_tasks_count, icon: AlertCircle, color: dashboardSummary.overdue_tasks_count > 0 ? 'red' : 'slate', sub: `${dashboardSummary.tasks_due_today} para hoy` },
      ].map((stat, i) => (
        <div key={i} className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-500">{stat.label}</span>
            <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
          <div className="text-xs text-slate-400 mt-1">{stat.sub}</div>
        </div>
      ))}
    </div>
  );

  // ============================================================
  // FILTER BAR
  // ============================================================
  const renderFilterBar = () => {
    const hasFilters = searchQuery || filterCampusId || filterPriority;
    return (
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, teléfono, correo..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
        </div>
        <select
          value={filterCampusId || ''}
          onChange={e => setFilterCampus(e.target.value || null)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 cursor-pointer"
        >
          <option value="">🏢 Todos los Planteles (Consolidado)</option>
          <option value="montes">🏫 Campus Montes (Sede Matriz & CCH)</option>
          <option value="lagos">🏫 Campus Lagos (Preescolar & Primaria)</option>
          <option value="sancristobal">🏫 Campus San Cristóbal (Secundaria & Preparatoria)</option>
          <option value="coacalco">🏫 Campus Coacalco (Primaria & Secundaria)</option>
        </select>
        <select
          value={filterPriority || ''}
          onChange={e => setFilterPriority((e.target.value || null) as typeof filterPriority)}
          className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
        >
          <option value="">Todas las prioridades</option>
          {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => {
            const config = cfg as { label: string; icon: string };
            return <option key={key} value={key}>{config.icon} {config.label}</option>;
          })}
        </select>
        {hasFilters && (
          <button onClick={clearAllFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <X className="w-4 h-4 mr-1" /> Limpiar filtros
          </button>
        )}
      </div>
    );
  };

  // ============================================================
  // TABS
  // ============================================================
  const renderTabs = () => (
    <div className="flex bg-slate-100/90 p-1.5 rounded-2xl mb-6 w-full max-w-full overflow-x-auto gap-1 border border-slate-200/80 shadow-xs">
      {[
        { key: 'pipeline' as const, label: 'Tablero Kanban Ágil', icon: '��' },
        { key: 'institutional' as const, label: 'Embudo Institucional Directivo', icon: '🏛️' },
        { key: 'directory' as const, label: 'Directorio 360° Familias', icon: '👥', badge: schoolLeads.length },
        { key: 'dashboard' as const, label: 'Dashboard & Finanzas', icon: '📈' },
        { key: 'tasks' as const, label: 'Tareas & Agenda', icon: '🔔', badge: overdueTasksList.length, badgeRed: true },
      ].map(tab => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === tab.key
              ? 'bg-white shadow-xs text-indigo-900 border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className={`py-0.5 px-2 rounded-full text-xs font-bold ${
              tab.badgeRed ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-700'
            }`}>
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );

  // ============================================================
  // LEAD CARD
  // ============================================================
  const renderLeadCard = (lead: CrmLead) => {
    const priorityConfig = PRIORITY_CONFIG[lead.priority];
    const sourceChannel = SOURCE_CHANNELS.find(c => c.key === lead.source_channel);
    const daysInStage = calculateDaysInStage(lead);
    const isStalled = daysInStage > 7;
    const leadCandidates = getLeadCandidates(candidates, lead.id);
    const firstCandidate = leadCandidates[0];

    const priorityColors: Record<string, string> = {
      hot: '#ef4444', warm: '#f59e0b', normal: '#3b82f6', cold: '#94a3b8'
    };

    return (
      <div
        key={lead.id}
        draggable
        onDragStart={(e) => handleDragStart(e, lead.id)}
        onClick={() => setSelectedLeadId(lead.id)}
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-slate-300 transition-all relative overflow-hidden group select-none"
        style={{ borderLeftWidth: '4px', borderLeftColor: priorityColors[lead.priority] || '#94a3b8' }}
      >
        {/* Prioridad interactiva y días en etapa */}
        <div className="flex justify-between items-center mb-2">
          <div className="relative z-10" onClick={e => e.stopPropagation()}>
            <select
              value={lead.priority}
              onChange={(e) => {
                const newPriority = e.target.value as LeadPriority;
                store.updateLead(lead.id, { priority: newPriority });
                showToast(`Prioridad de ${lead.tutor_first_name} actualizada a ${PRIORITY_CONFIG[newPriority].label}`);
              }}
              className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer focus:outline-none transition-all shadow-xs ${
                lead.priority === 'hot' ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' :
                lead.priority === 'warm' ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' :
                lead.priority === 'cold' ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200' :
                'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
              }`}
              title="Clic para cambiar la prioridad directamente desde el tablero"
            >
              <option value="hot">🔴 Caliente</option>
              <option value="warm">🟡 Tibio</option>
              <option value="normal">🔵 Normal</option>
              <option value="cold">⚪ Frío</option>
            </select>
          </div>
          <span className={`text-xs font-medium ${isStalled ? 'text-red-500 font-bold' : 'text-slate-400'}`} title={`Lleva ${daysInStage} días en esta etapa`}>
            {daysInStage}d
          </span>
        </div>

        {/* Nombre del candidato */}
        {firstCandidate && (
          <h3 className="font-bold text-slate-800 text-sm leading-tight mb-0.5 truncate">
            {formatCandidateName(firstCandidate)}
          </h3>
        )}
        <p className="text-xs text-slate-500 mb-1">{firstCandidate?.target_level} {firstCandidate?.target_grade}</p>

        {/* Tutor */}
        <p className="text-xs text-slate-600 font-medium truncate">{formatTutorName(lead)}</p>
        <div className="text-xs text-slate-400 flex items-center mt-1">
          <Phone className="w-3 h-3 mr-1" />
          {lead.tutor_phone || 'Sin teléfono'}
        </div>

        {/* Canal y Campus */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
          <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
            {sourceChannel?.icon} {sourceChannel?.label}
          </span>
          {lead.campus_name && (
            <span className="text-[10px] text-slate-400 flex items-center">
              <Building2 className="w-3 h-3 mr-0.5" />
              {lead.campus_name.split('(')[0]?.trim()}
            </span>
          )}
        </div>

        {/* Score bar */}
        <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              (lead.lead_score || 0) >= 70 ? 'bg-emerald-500' :
              (lead.lead_score || 0) >= 40 ? 'bg-blue-500' : 'bg-slate-300'
            }`}
            style={{ width: `${Math.min(100, Math.max(2, lead.lead_score || 0))}%` }}
          />
        </div>

        {/* Candidatos count badge */}
        {(lead.candidates_count ?? 0) > 1 && (
          <div className="absolute top-2 right-2 bg-indigo-100 text-indigo-700 rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">
            {lead.candidates_count}
          </div>
        )}
      </div>
    );
  };

  // ============================================================
  // PIPELINE KANBAN
  // ============================================================
  const renderPipeline = () => (
    <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px] items-start">
      {stages.map(stage => {
        const isCollapsed = collapsedStages.includes(stage.key);
        const stageLeads = (leadsByStage.get(stage.key) || []).sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));

        if (isCollapsed) {
          return (
            <div
              key={stage.key}
              className="w-16 bg-slate-50/80 rounded-2xl p-3 flex flex-col items-center cursor-pointer border border-slate-200/60 hover:bg-slate-100/80 transition-colors"
              onClick={() => toggleStageCollapse(stage.key)}
            >
              <div className="text-xl mb-4">{stage.icon}</div>
              <div className="[writing-mode:vertical-rl] text-slate-500 font-bold text-sm tracking-widest uppercase rotate-180 mb-4 whitespace-nowrap">
                {stage.label.replace(/^\d+\.\s*/, '')}
              </div>
              <div className="bg-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-slate-700 shadow-sm text-xs">
                {stageLeads.length}
              </div>
            </div>
          );
        }

        return (
          <div
            key={stage.key}
            className={`min-w-[300px] max-w-[300px] rounded-2xl p-3 border transition-all duration-200 flex flex-col h-[calc(100vh-360px)] ${
              dragOverStage === stage.key
                ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-300 shadow-md scale-[1.01]'
                : 'bg-slate-50/80 border-slate-200/60'
            }`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            <div className="flex justify-between items-center mb-4 px-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{stage.icon}</span>
                <h3 className="font-bold text-slate-700 text-sm">{stage.label.replace(/^\d+\.\s*/, '')}</h3>
                <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>
              <button
                onClick={() => toggleStageCollapse(stage.key)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <EyeOff className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 pb-10 space-y-0">
              {stageLeads.map(renderLeadCard)}
              {stageLeads.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm">
                  Arrastra un prospecto aquí
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ============================================================
  // EMBUDO INSTITUCIONAL DIRECTIVO (Del Main)
  // ============================================================
  const renderInstitutionalFunnel = () => {
    const totalLeads = schoolLeads.length || 1;
    return (
      <div className="space-y-6">
        {/* Embudo Gráfico Interactivo de 5 Fases */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-1">
                🏛️ Modelo de Gobernanza Escolar
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Embudo Gráfico de Conversión Institucional (5 Fases)</h3>
              <p className="text-xs text-slate-500">
                Monitoreo consolidado de familias en cada una de las 5 fases institucionales del colegio.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Plantel:</span>
              <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                {school?.name || 'IBIME Todos los Campus'}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            {institutionalPhases.map((phase, idx) => {
              const count = phase.leads.length;
              const pct = Math.round((count / totalLeads) * 100);
              return (
                <div
                  key={phase.id}
                  className={`p-4 rounded-2xl border ${phase.borderColor} ${phase.bgColor} space-y-2 hover:border-slate-400 transition-all shadow-2xs`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`w-7 h-7 rounded-xl ${phase.dot} text-white font-black text-xs flex items-center justify-center shadow-xs`}>
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-black text-slate-900 text-sm">{phase.phase}: {phase.title}</span>
                        <span className="text-[11px] text-slate-500 block">{phase.desc}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <span className="text-base font-black text-slate-900">{count} familias</span>
                        <span className="text-xs text-slate-500 block">({pct}% de distribución)</span>
                      </div>
                      <button
                        onClick={() => {
                          setDepartmentFilter(phase.id);
                          setActiveTab('directory');
                        }}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors active:scale-95"
                      >
                        <Eye size={13} />
                        Ver ({count})
                      </button>
                    </div>
                  </div>

                  <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${phase.dot} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="font-semibold text-slate-700">
                      Responsable: <span className="font-bold text-slate-900">{phase.dept}</span>
                    </span>
                    <span className="text-slate-500 font-mono">
                      📍 {phase.location}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Canales de Captación Ponderados (Del Main) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-400 block uppercase">Recomendación Familiar</span>
            <div className="text-3xl font-black text-slate-900 mt-1 font-mono">52%</div>
            <span className="text-xs text-slate-500 mt-1 block">Boca a boca de padres de familia actuales</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-400 block uppercase">Canales Digitales & Web</span>
            <div className="text-3xl font-black text-indigo-600 mt-1 font-mono">34%</div>
            <span className="text-xs text-slate-500 mt-1 block">Campañas de captación digital y web</span>
          </div>
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 text-center shadow-xs">
            <span className="text-xs font-bold text-slate-400 block uppercase">Convenios Corporativos</span>
            <div className="text-3xl font-black text-emerald-600 mt-1 font-mono">14%</div>
            <span className="text-xs text-slate-500 mt-1 block">Alianzas estratégicas con empresas e instituciones</span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // DIRECTORIO 360° DE FAMILIAS DEL PIPELINE (Del Main)
  // ============================================================
  const renderDirectory = () => {
    return (
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
        <div className="p-6 bg-gradient-to-r from-slate-50 via-purple-50/30 to-indigo-50/20 border-b border-slate-200/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 mb-1">
              Directorio Ejecutivo
            </div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ClipboardList size={20} className="text-purple-600" />
              Directorio de Familias en Pipeline ({filteredLeads.length} Registros)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Seguimiento unificado de aspirantes, fases institucionales y avance de expediente.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddLeadModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <UserPlus size={14} />
              + Registrar Aspirante
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          {filteredLeads.map(lead => {
            const leadCands = getLeadCandidates(candidates, lead.id);
            const firstCand = leadCands[0];
            const currentPhaseNum =
              lead.stage === 'registered' || lead.stage === 'contacted' ? 1 :
              lead.stage === 'tour_scheduled' ? 2 :
              lead.stage === 'evaluation' ? 3 :
              lead.stage === 'proposal_sent' || lead.stage === 'reservation' ? 4 : 5;

            const stageInfo = NEW_ENROLLMENT_STAGES.find(s => s.key === lead.stage) || { label: lead.stage, icon: '📋' };

            return (
              <div
                key={lead.id}
                className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 cursor-pointer" onClick={() => setSelectedLeadId(lead.id)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-sm font-black text-slate-900">
                      {firstCand ? formatCandidateName(firstCand) : formatTutorName(lead)}
                    </h4>
                    {firstCand && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {firstCand.target_level} {firstCand.target_grade}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 bg-purple-50 text-purple-700 border-purple-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      {stageInfo.icon} {stageInfo.label}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border ${
                      lead.priority === 'hot' ? 'bg-red-50 text-red-700 border-red-200' :
                      lead.priority === 'warm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      lead.priority === 'cold' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                      'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {PRIORITY_CONFIG[lead.priority].icon} {PRIORITY_CONFIG[lead.priority].label}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Building2 size={13} className="text-slate-400" />
                      {lead.campus_name || 'Campus Principal'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={13} className="text-slate-400" />
                      Tutor: <strong className="text-slate-700">{formatTutorName(lead)}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone size={13} className="text-slate-400" />
                      {lead.tutor_phone || 'Sin teléfono'}
                    </span>
                    <span className="text-[11px] text-purple-700 font-semibold">
                      Score: {lead.lead_score || 50}/100
                    </span>
                  </div>

                  {lead.notes && (
                    <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60 mt-1">
                      💬 {lead.notes}
                    </div>
                  )}
                </div>

                {/* 5 Dots de Etapa y Acciones */}
                <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                  <div className="flex items-center gap-1" title={`Fase ${currentPhaseNum} de 5`}>
                    {[1, 2, 3, 4, 5].map(step => (
                      <span
                        key={step}
                        className={`w-3 h-3 rounded-full transition-all ${
                          step <= currentPhaseNum
                            ? 'bg-purple-600 scale-100'
                            : 'bg-slate-200 scale-90'
                        }`}
                      />
                    ))}
                  </div>

                  {currentPhaseNum === 4 && (
                    <button
                      onClick={() => {
                        setAssignmentLead(lead);
                        setIsAssignmentModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      📜 Carta de Asignación
                    </button>
                  )}

                  {currentPhaseNum >= 4 && lead.stage !== 'enrolled' && (
                    <button
                      onClick={() => {
                        setCfdiLead(lead);
                        setIsCfdiModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                      💳 CFDI & Matricular
                    </button>
                  )}

                  <button
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Ver Ficha 360°
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ============================================================
  // DASHBOARD
  // ============================================================
  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Embudo de Conversión */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
            Embudo de Conversión
          </h3>
          <div className="space-y-3">
            {funnelMetrics.stages.map((step, idx) => (
              <div key={step.stage_key} className="relative">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{step.stage_label}</span>
                  <span className="font-bold">{step.count}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all"
                    style={{ width: `${Math.max(2, funnelMetrics.total_leads > 0 ? (step.count / funnelMetrics.total_leads) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-sm">
            <span className="text-slate-500">Conversión total: </span>
            <span className="font-bold text-emerald-600">{funnelMetrics.overall_conversion_rate}%</span>
            <span className="text-slate-400"> ({funnelMetrics.total_enrolled} de {funnelMetrics.total_leads} leads)</span>
          </div>
        </div>

        {/* Efectividad por Canal */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-emerald-600" />
            Efectividad por Canal de Captación
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-3 py-3 rounded-tl-xl">Canal</th>
                  <th className="px-3 py-3">Leads</th>
                  <th className="px-3 py-3">Inscritos</th>
                  <th className="px-3 py-3 rounded-tr-xl">Conversión</th>
                </tr>
              </thead>
              <tbody>
                {channelMetrics.map((channel) => (
                  <tr key={channel.channel_key} className="border-b border-slate-100 last:border-0">
                    <td className="px-3 py-3 font-medium text-slate-800">{channel.channel_label}</td>
                    <td className="px-3 py-3">{channel.total_leads}</td>
                    <td className="px-3 py-3 text-emerald-600 font-medium">{channel.enrolled_count}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center">
                        <span className="mr-2 w-10">{channel.conversion_rate}%</span>
                        <div className="w-16 bg-slate-100 rounded-full h-1.5">
                          <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${channel.conversion_rate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Motivos de pérdida */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 text-red-500" />
          Motivos de Declinación
        </h3>
        <div className="space-y-2">
          {(() => {
            const declinedLeads = schoolLeads.filter(l => l.outcome === 'declined' && l.lost_reason);
            const reasonCounts = new Map<string, number>();
            declinedLeads.forEach(l => {
              const count = reasonCounts.get(l.lost_reason!) || 0;
              reasonCounts.set(l.lost_reason!, count + 1);
            });
            const total = declinedLeads.length || 1;
            return Array.from(reasonCounts.entries())
              .sort((a, b) => b[1] - a[1])
              .map(([reason, count]) => {
                const reasonDef = LOST_REASONS.find(r => r.key === reason);
                return (
                  <div key={reason} className="flex items-center gap-3">
                    <span className="w-48 text-sm text-slate-600 truncate">{reasonDef?.label ?? reason}</span>
                    <div className="flex-1 bg-slate-100 rounded-full h-4">
                      <div className="bg-red-400 h-4 rounded-full flex items-center justify-end pr-2" style={{ width: `${(count / total) * 100}%` }}>
                        <span className="text-[10px] text-white font-bold">{count}</span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 w-12 text-right">{Math.round((count / total) * 100)}%</span>
                  </div>
                );
              });
          })()}
          {schoolLeads.filter(l => l.outcome === 'declined').length === 0 && (
            <p className="text-slate-400 text-sm italic">No hay leads declinados aún.</p>
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // TAREAS
  // ============================================================
  const renderTasks = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-red-50/50 rounded-2xl border border-red-100 shadow-sm p-5">
        <h3 className="text-lg font-bold text-red-800 mb-4 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          Tareas Vencidas ({overdueTasksList.length})
        </h3>
        <div className="space-y-3">
          {overdueTasksList.length === 0 ? (
            <p className="text-slate-500 text-sm italic">¡Sin tareas vencidas! 🎉</p>
          ) : (
            overdueTasksList.map(task => {
              const taskLead = leads.find(l => l.id === task.lead_id);
              return (
                <div key={task.id} className="bg-white rounded-xl p-4 border border-red-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                    <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-md font-bold">Vencida</span>
                  </div>
                  {taskLead && <p className="text-xs text-slate-500 mb-1">👤 {formatTutorName(taskLead)}</p>}
                  {task.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {task.scheduled_at?.substring(0, 10)}</span>
                    <button onClick={() => completeTask(task.id, 'current-user')} className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Completar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-blue-600" />
          Próximas Tareas ({pendingTasksList.length})
        </h3>
        <div className="space-y-3">
          {pendingTasksList.length === 0 ? (
            <p className="text-slate-500 text-sm italic">No hay tareas pendientes.</p>
          ) : (
            pendingTasksList.map(task => {
              const taskLead = leads.find(l => l.id === task.lead_id);
              return (
                <div key={task.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-slate-800 text-sm">{task.title}</h4>
                  </div>
                  {taskLead && <p className="text-xs text-slate-500 mb-1">👤 {formatTutorName(taskLead)}</p>}
                  {task.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>}
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span className="flex items-center"><Calendar className="w-3 h-3 mr-1" /> {task.scheduled_at?.substring(0, 10)}</span>
                    <button onClick={() => completeTask(task.id, 'current-user')} className="text-blue-600 hover:text-blue-800 font-medium flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Completar
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  // ============================================================
  // LEAD DETAIL DRAWER
  // ============================================================
  const renderLeadDrawer = () => {
    if (!selectedLead) return null;
    const priority = PRIORITY_CONFIG[selectedLead.priority];
    const sourceChannel = SOURCE_CHANNELS.find(c => c.key === selectedLead.source_channel);

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex justify-end"
          onClick={() => setSelectedLeadId(null)}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-[520px] bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header del drawer */}
            <div className="p-6 border-b border-slate-100 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {/* Selector de Prioridad Interactivo en Drawer */}
                    <div className="relative inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500">Prioridad:</span>
                      <select
                        value={selectedLead.priority}
                        onChange={(e) => {
                          const newPriority = e.target.value as LeadPriority;
                          store.updateLead(selectedLead.id, { priority: newPriority });
                          showToast(`Prioridad actualizada a ${PRIORITY_CONFIG[newPriority].label}`);
                        }}
                        className={`text-xs font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-all shadow-xs ${
                          selectedLead.priority === 'hot' ? 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200' :
                          selectedLead.priority === 'warm' ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200' :
                          selectedLead.priority === 'cold' ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200' :
                          'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
                        }`}
                        title="Clic para cambiar la prioridad de este prospecto"
                      >
                        <option value="hot">🔴 Caliente</option>
                        <option value="warm">🟡 Tibio</option>
                        <option value="normal">🔵 Normal</option>
                        <option value="cold">⚪ Frío</option>
                      </select>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                      {sourceChannel?.icon} {sourceChannel?.label}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 flex items-center">
                      <Star className="w-3 h-3 mr-1 fill-blue-500 text-blue-500" /> {selectedLead.lead_score}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-800">{formatTutorName(selectedLead)}</h2>
                    <button
                      onClick={() => handleOpenEditTutor(selectedLead)}
                      className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="Editar datos y apellidos del tutor/contacto"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>Parentesco: <strong className="text-slate-700 font-medium">{selectedLead.tutor_relationship}</strong></span>
                    <span>•</span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      Ap. 1: <strong className="text-slate-700 font-medium">{selectedLead.tutor_last_name_1 || '-'}</strong>
                    </span>
                    <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      Ap. 2: <strong className="text-slate-700 font-medium">{selectedLead.tutor_last_name_2 || '(Sin materno)'}</strong>
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelectedLeadId(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contacto */}
              <div className="flex flex-col gap-2 text-sm text-slate-600 mb-6">
                {selectedLead.tutor_phone && (
                  <a href={`https://wa.me/52${selectedLead.tutor_phone.replace(/\s/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-green-600 transition-colors">
                    <Phone className="w-4 h-4 mr-2" /> {selectedLead.tutor_phone} 💬
                  </a>
                )}
                {selectedLead.tutor_email && (
                  <a href={`mailto:${selectedLead.tutor_email}`} className="flex items-center hover:text-blue-600 transition-colors">
                    <Mail className="w-4 h-4 mr-2" /> {selectedLead.tutor_email}
                  </a>
                )}
              </div>

              {/* Barra de progreso de etapas */}
              <div className="mb-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-slate-700">
                    Etapa: {stages.find(s => s.key === selectedLead.stage)?.label}
                  </span>
                </div>
                <div className="flex gap-1">
                  {stages.map((s, i) => {
                    const currentIndex = stages.findIndex(st => st.key === selectedLead.stage);
                    const isPast = i < currentIndex;
                    const isCurrent = i === currentIndex;
                    return (
                      <div
                        key={s.key}
                        className={`h-2 flex-1 rounded-full transition-all ${
                          isPast ? 'bg-blue-500' : isCurrent ? 'bg-blue-400 animate-pulse' : 'bg-slate-200'
                        }`}
                        title={s.label}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex flex-col gap-2.5">
                <div className="flex gap-2">
                  <button
                    onClick={() => store.regressLeadStage(selectedLead.id)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium text-xs transition-colors flex items-center justify-center"
                    title="Retroceder a etapa anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsAddActivityModalOpen(true)}
                    className="flex-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-3 py-2 rounded-xl font-medium text-sm transition-colors flex justify-center items-center shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> Actividad
                  </button>
                  <button
                    onClick={() => advanceLeadStage(selectedLead.id)}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-2 rounded-xl font-medium text-sm transition-all shadow-md shadow-blue-500/20 flex justify-center items-center"
                  >
                    Avanzar <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setAssignmentLead(selectedLead);
                      setIsAssignmentModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 bg-teal-50 border border-teal-200 text-teal-800 hover:bg-teal-100 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Emitir carta formal de asignación con cupo escolar y vigencia de 3 días"
                  >
                    📜 Carta Asignación
                  </button>
                  <button
                    onClick={() => {
                      setCfdiLead(selectedLead);
                      setIsCfdiModalOpen(true);
                    }}
                    className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Conciliar pago, timbrar CFDI 4.0 con complemento IEDU SAT y dar de alta en Control Escolar"
                  >
                    💳 CFDI & Matricular
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setIsDeclineModalOpen(true)}
                    className="flex-1 py-1.5 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl font-medium text-xs transition-colors flex items-center justify-center cursor-pointer"
                  >
                    ❌ Marcar Declinado
                  </button>
                  {(selectedLead.stage === 'reservation' || selectedLead.stage === 'enrolled' || selectedLead.outcome === 'enrolled') && (
                    <button
                      onClick={() => handleConvertLeadToEnrolled(selectedLead)}
                      className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center cursor-pointer"
                    >
                      🎓 Expediente 360 Escolar
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido del drawer */}
            <div className="flex-1 p-6 space-y-8">
              {/* Candidatos */}
              <section>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Users className="w-5 h-5 mr-2 text-blue-600" />
                    Alumnos Candidatos ({selectedCandidates.length})
                  </h3>
                  <button
                    onClick={() => handleOpenAddCandidate(selectedLead.id)}
                    className="text-xs font-semibold px-2.5 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1 border border-blue-200"
                    title="Registrar a otro alumno (hijo / hermano) con apellidos separados"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar Alumno (Hermano/a)
                  </button>
                </div>
                <div className="space-y-3">
                  {selectedCandidates.map(candidate => (
                    <div key={candidate.id} className="bg-slate-50 rounded-xl p-4 border border-slate-200 relative group">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-800">{formatCandidateName(candidate)}</h4>
                            <button
                              onClick={() => handleOpenEditCandidate(candidate)}
                              className="text-slate-400 hover:text-blue-600 p-1 rounded hover:bg-slate-200 transition-colors"
                              title="Editar datos y apellidos del alumno"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          {/* Desglose de apellidos SEP */}
                          <div className="flex gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Ap. 1 (Paterno): <strong className="text-slate-700">{candidate.last_name_1 || '-'}</strong>
                            </span>
                            <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200">
                              Ap. 2 (Materno): <strong className="text-slate-700">{candidate.last_name_2 || '(Sin materno)'}</strong>
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 capitalize mt-1.5">{candidate.target_level} — {candidate.target_grade}</p>
                          {candidate.current_school_name && (
                            <p className="text-xs text-slate-400 mt-0.5">Procedencia: {candidate.current_school_name}</p>
                          )}
                          {candidate.curp && (
                            <p className="text-xs text-slate-400 mt-0.5 font-mono">CURP: {candidate.curp}</p>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-md font-medium ${
                          candidate.evaluation_status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                          candidate.evaluation_status === 'not_approved' ? 'bg-red-100 text-red-700' :
                          candidate.evaluation_status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                          candidate.evaluation_status === 'completed' ? 'bg-cyan-100 text-cyan-700' :
                          candidate.evaluation_status === 'waived' ? 'bg-slate-100 text-slate-500' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {candidate.evaluation_status === 'approved' ? '✅ Aprobado' :
                           candidate.evaluation_status === 'not_approved' ? '❌ No aprobado' :
                           candidate.evaluation_status === 'scheduled' ? '📅 Agendado' :
                           candidate.evaluation_status === 'completed' ? '📝 Completado' :
                           candidate.evaluation_status === 'waived' ? '⏭️ Exento' :
                           '⏳ Pendiente'}
                        </span>
                      </div>
                      {candidate.scholarship_percent > 0 && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-emerald-600 font-medium">
                          🎓 Beca: {candidate.scholarship_percent}% — {candidate.scholarship_type?.replace('_', ' ')}
                        </div>
                      )}
                      {candidate.evaluation_result && (
                        <div className="mt-2 pt-2 border-t border-slate-200 text-xs text-slate-500 italic">
                          {candidate.evaluation_result}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              {/* Expediente Digital */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Expediente Digital
                </h3>
                {selectedDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDocuments.map(doc => {
                      const docType = DOCUMENT_TYPES.find(d => d.key === doc.document_type);
                      return (
                        <div key={doc.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-slate-50 border border-slate-200">
                          <span className="text-sm text-slate-700">{docType?.label ?? doc.document_label ?? doc.document_type}</span>
                          <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                            doc.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                            doc.status === 'uploaded' ? 'bg-blue-100 text-blue-700' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {doc.status === 'verified' ? '✅ Verificado' :
                             doc.status === 'uploaded' ? '📤 Subido' :
                             doc.status === 'rejected' ? '❌ Rechazado' :
                             '⏳ Pendiente'}
                          </span>
                        </div>
                      );
                    })}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Progreso del expediente</span>
                        <span>{selectedDocuments.filter(d => d.status === 'verified').length}/{selectedDocuments.length}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${(selectedDocuments.filter(d => d.status === 'verified').length / Math.max(1, selectedDocuments.length)) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-400 italic">Sin documentos registrados aún.</p>
                )}
              </section>

              {/* Bitácora de Seguimiento */}
              <section>
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Bitácora de Seguimiento ({selectedActivities.length})
                </h3>
                <div className="relative pl-6 space-y-4">
                  <div className="absolute left-2.5 top-2 bottom-0 w-px bg-slate-200"></div>
                  {selectedActivities.map(activity => {
                    const typeConfig = ACTIVITY_TYPES.find(t => t.key === activity.activity_type);
                    return (
                      <div key={activity.id} className="relative">
                        <div className={`absolute -left-[21px] top-1 w-6 h-6 rounded-full flex items-center justify-center shadow-sm ring-4 ring-white ${
                          activity.activity_type === 'stage_change' ? 'bg-blue-100' : 'bg-slate-100'
                        }`}>
                          <span className="text-xs">{typeConfig?.icon ?? '📌'}</span>
                        </div>
                        <div className={`bg-white p-4 rounded-xl border shadow-sm ${
                          activity.activity_type === 'stage_change' ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200'
                        }`}>
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-sm text-slate-800">{activity.title}</h4>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">
                              {new Date(activity.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          {activity.description && <p className="text-sm text-slate-600 mt-1">{activity.description}</p>}
                          {activity.created_by_name && (
                            <p className="text-xs text-slate-400 mt-2">— {activity.created_by_name}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {selectedActivities.length === 0 && (
                    <p className="text-sm text-slate-400 italic ml-2">Sin actividades registradas.</p>
                  )}
                </div>
              </section>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // --- Estado de Formulario: Nuevo Prospecto ---
  const [newLeadForm, setNewLeadForm] = useState({
    tutor_first_name: '',
    tutor_last_name_1: '', // Primer Apellido (Paterno)
    tutor_last_name_2: '', // Segundo Apellido (Materno)
    tutor_phone: '',
    tutor_email: '',
    tutor_relationship: 'Padre',
    source_channel: 'website_form' as typeof SOURCE_CHANNELS[number]['key'],
    campus_id: 'montes',
    priority: 'normal' as LeadPriority,
    candidate_first_name: '',
    candidate_last_name_1: '', // Primer Apellido (Paterno)
    candidate_last_name_2: '', // Segundo Apellido (Materno)
    target_level: 'primaria' as 'maternal' | 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria',
    target_grade: '1°',
    notes: '',
  });

  // --- Estado de Formulario: Nueva Actividad ---
  const [newActivityForm, setNewActivityForm] = useState({
    activity_type: 'call' as typeof ACTIVITY_TYPES[number]['key'],
    title: '',
    description: '',
    is_task: false,
    scheduled_at: '',
  });

  // --- Estado de Declinación ---
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<string>('price');
  const [declineSchool, setDeclineSchool] = useState<string>('');

  // --- Estado de Formulario: Agregar / Editar Candidato (Alumno) ---
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [candidateForm, setCandidateForm] = useState({
    first_name: '',
    last_name_1: '', // Apellido 1 (Paterno)
    last_name_2: '', // Apellido 2 (Materno)
    target_level: 'primaria' as 'maternal' | 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria',
    target_grade: '1°',
    curp: '',
    current_school_name: '',
  });

  // --- Estado de Formulario: Editar Tutor / Contacto ---
  const [isEditTutorModalOpen, setIsEditTutorModalOpen] = useState(false);
  const [tutorForm, setTutorForm] = useState({
    tutor_first_name: '',
    tutor_last_name_1: '', // Apellido 1 (Paterno)
    tutor_last_name_2: '', // Apellido 2 (Materno)
    tutor_phone: '',
    tutor_email: '',
    tutor_relationship: 'Padre/Madre',
  });

  // Notificación de éxito
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenAddCandidate = (leadId: string) => {
    const parentLead = leads.find(l => l.id === leadId);
    setEditingCandidateId(null);
    setCandidateForm({
      first_name: '',
      last_name_1: parentLead?.tutor_last_name_1 || '',
      last_name_2: '',
      target_level: 'primaria',
      target_grade: '1°',
      curp: '',
      current_school_name: '',
    });
    setIsCandidateModalOpen(true);
  };

  const handleOpenEditCandidate = (cand: { id: string; first_name?: string; last_name_1?: string; last_name_2?: string; target_level?: any; target_grade?: string; curp?: string; current_school_name?: string }) => {
    setEditingCandidateId(cand.id);
    setCandidateForm({
      first_name: cand.first_name || '',
      last_name_1: cand.last_name_1 || '',
      last_name_2: cand.last_name_2 || '',
      target_level: cand.target_level || 'primaria',
      target_grade: cand.target_grade || '1°',
      curp: cand.curp || '',
      current_school_name: cand.current_school_name || '',
    });
    setIsCandidateModalOpen(true);
  };

  const handleSaveCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!candidateForm.first_name.trim() || !candidateForm.last_name_1.trim()) {
      alert('Por favor ingresa nombre y Apellido 1 (Paterno) del alumno.');
      return;
    }
    const combinedLastName = [candidateForm.last_name_1.trim(), candidateForm.last_name_2.trim()].filter(Boolean).join(' ');

    if (editingCandidateId) {
      store.updateCandidate(editingCandidateId, {
        first_name: candidateForm.first_name.trim(),
        last_name_1: candidateForm.last_name_1.trim(),
        last_name_2: candidateForm.last_name_2.trim() || undefined,
        last_name: combinedLastName,
        target_level: candidateForm.target_level,
        target_grade: candidateForm.target_grade,
        curp: candidateForm.curp.trim() || undefined,
        current_school_name: candidateForm.current_school_name.trim() || undefined,
      });
      showToast(`Alumno ${candidateForm.first_name.trim()} actualizado con éxito.`);
    } else if (selectedLeadId) {
      store.addCandidate({
        lead_id: selectedLeadId,
        first_name: candidateForm.first_name.trim(),
        last_name_1: candidateForm.last_name_1.trim(),
        last_name_2: candidateForm.last_name_2.trim() || undefined,
        last_name: combinedLastName,
        target_level: candidateForm.target_level,
        target_grade: candidateForm.target_grade,
        curp: candidateForm.curp.trim() || undefined,
        current_school_name: candidateForm.current_school_name.trim() || undefined,
        evaluation_status: 'pending',
        scholarship_percent: 0,
        status: 'active',
      });
      store.addActivity({
        lead_id: selectedLeadId,
        activity_type: 'note',
        title: 'Nuevo alumno registrado en expediente familiar',
        description: `Se agregó al alumno ${candidateForm.first_name.trim()} ${combinedLastName} (${candidateForm.target_level} ${candidateForm.target_grade}) con apellidos separados según estándar SEP.`,
        is_task: false,
        is_overdue: false,
        created_by_name: 'Coordinación de Admisiones',
      });
      showToast(`Alumno ${candidateForm.first_name.trim()} agregado al expediente.`);
    }
    setIsCandidateModalOpen(false);
  };

  const handleOpenEditTutor = (lead: CrmLead) => {
    setTutorForm({
      tutor_first_name: lead.tutor_first_name || '',
      tutor_last_name_1: lead.tutor_last_name_1 || '',
      tutor_last_name_2: lead.tutor_last_name_2 || '',
      tutor_phone: lead.tutor_phone || '',
      tutor_email: lead.tutor_email || '',
      tutor_relationship: lead.tutor_relationship || 'Padre/Madre',
    });
    setIsEditTutorModalOpen(true);
  };

  const handleSaveTutor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    if (!tutorForm.tutor_first_name.trim() || !tutorForm.tutor_last_name_1.trim()) {
      alert('Por favor ingresa nombre y Apellido 1 (Paterno) del tutor.');
      return;
    }
    const combinedLastName = [tutorForm.tutor_last_name_1.trim(), tutorForm.tutor_last_name_2.trim()].filter(Boolean).join(' ');

    store.updateLead(selectedLeadId, {
      tutor_first_name: tutorForm.tutor_first_name.trim(),
      tutor_last_name_1: tutorForm.tutor_last_name_1.trim(),
      tutor_last_name_2: tutorForm.tutor_last_name_2.trim() || undefined,
      tutor_last_name: combinedLastName,
      tutor_phone: tutorForm.tutor_phone.trim(),
      tutor_email: tutorForm.tutor_email.trim(),
      tutor_relationship: tutorForm.tutor_relationship,
    });

    showToast('Datos y apellidos del contacto actualizados con éxito.');
    setIsEditTutorModalOpen(false);
  };

  const handleCreateLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.tutor_first_name.trim() || !newLeadForm.tutor_last_name_1.trim()) {
      alert('Por favor ingresa nombre y primer apellido (paterno) del tutor');
      return;
    }
    if (!newLeadForm.candidate_first_name.trim() || !newLeadForm.candidate_last_name_1.trim()) {
      alert('Por favor ingresa nombre y primer apellido (paterno) del alumno');
      return;
    }

    const tutorFullName = [newLeadForm.tutor_last_name_1.trim(), newLeadForm.tutor_last_name_2.trim()].filter(Boolean).join(' ');
    const candidateFullName = [newLeadForm.candidate_last_name_1.trim(), newLeadForm.candidate_last_name_2.trim()].filter(Boolean).join(' ');

    const createdLeadId = store.createLead({
      school_id: effectiveSchoolId,
      campus_id: newLeadForm.campus_id,
      pipeline_type: activePipeline,
      stage: 'registered',
      tutor_first_name: newLeadForm.tutor_first_name.trim(),
      tutor_last_name_1: newLeadForm.tutor_last_name_1.trim(),
      tutor_last_name_2: newLeadForm.tutor_last_name_2.trim() || undefined,
      tutor_last_name: tutorFullName,
      tutor_phone: newLeadForm.tutor_phone.trim(),
      tutor_email: newLeadForm.tutor_email.trim(),
      tutor_relationship: newLeadForm.tutor_relationship,
      source_channel: newLeadForm.source_channel,
      priority: newLeadForm.priority || 'normal',
      referral_incentive_applied: false,
      outcome: null,
      target_academic_year: '2027-2028',
      notes: newLeadForm.notes.trim(),
    });

    store.addCandidate({
      lead_id: createdLeadId,
      first_name: newLeadForm.candidate_first_name.trim(),
      last_name_1: newLeadForm.candidate_last_name_1.trim(),
      last_name_2: newLeadForm.candidate_last_name_2.trim() || undefined,
      last_name: candidateFullName,
      target_level: newLeadForm.target_level,
      target_grade: newLeadForm.target_grade,
      evaluation_status: 'pending',
      scholarship_percent: 0,
      status: 'active',
    });

    // Actividad inicial
    store.addActivity({
      lead_id: createdLeadId,
      activity_type: 'note',
      title: 'Registro inicial de prospecto escolar',
      description: `Prospecto dado de alta en CRM para alumno ${newLeadForm.candidate_first_name.trim()} ${candidateFullName} (${newLeadForm.target_level} ${newLeadForm.target_grade}). Tutor: ${newLeadForm.tutor_first_name.trim()} ${tutorFullName}. Notas: ${newLeadForm.notes || 'Sin observaciones iniciales.'}`,
      is_task: false,
      is_overdue: false,
      created_by_name: 'Coordinación de Admisiones',
    });

    setIsAddLeadModalOpen(false);
    setNewLeadForm({
      tutor_first_name: '',
      tutor_last_name_1: '',
      tutor_last_name_2: '',
      tutor_phone: '',
      tutor_email: '',
      tutor_relationship: 'Padre',
      source_channel: 'website_form',
      campus_id: 'montes',
      priority: 'normal',
      candidate_first_name: '',
      candidate_last_name_1: '',
      candidate_last_name_2: '',
      target_level: 'primaria',
      target_grade: '1°',
      notes: '',
    });
    showToast('¡Prospecto familiar registrado con éxito!');
  };

  const handleCreateActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) return;
    if (!newActivityForm.title.trim()) {
      alert('Ingresa el título de la actividad');
      return;
    }

    store.addActivity({
      lead_id: selectedLeadId,
      activity_type: newActivityForm.activity_type,
      title: newActivityForm.title.trim(),
      description: newActivityForm.description.trim(),
      is_task: newActivityForm.is_task,
      scheduled_at: newActivityForm.is_task && newActivityForm.scheduled_at ? newActivityForm.scheduled_at : undefined,
      is_overdue: false,
      created_by_name: 'Asesor de Admisiones',
    });

    setIsAddActivityModalOpen(false);
    setNewActivityForm({
      activity_type: 'call',
      title: '',
      description: '',
      is_task: false,
      scheduled_at: '',
    });
    showToast('Actividad registrada en la bitácora escolar');
  };

  const handleConfirmDecline = () => {
    if (!selectedLeadId) return;
    store.declineLead(selectedLeadId, declineReason, declineSchool.trim() || undefined);
    setIsDeclineModalOpen(false);
    showToast('Prospecto marcado como Declinado.');
  };

  const handleConvertLeadToEnrolled = (lead: CrmLead) => {
    store.changeLeadStage(lead.id, 'enrolled');
    store.addActivity({
      lead_id: lead.id,
      activity_type: 'enrollment_completed',
      title: '🎓 Inscripción formalizada y expediente 360 generado',
      description: 'El alumno y tutor han sido transferidos al módulo académico de ISkool. Matrícula oficial asignada.',
      is_task: false,
      is_overdue: false,
      created_by_name: 'Dirección de Admisiones',
    });
    showToast('🎉 ¡Expediente de Alumno formalizado en ISkool con éxito!');
  };

  // ============================================================
  // MODALS
  // ============================================================
  const renderAddLeadModal = () => {
    if (!isAddLeadModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h2 className="text-xl font-bold text-slate-800">📋 Nuevo Prospecto</h2>
              <p className="text-xs text-slate-500">Estándar Escolar Oficial SEP: Apellido Paterno y Apellido Materno separados</p>
            </div>
            <button onClick={() => setIsAddLeadModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreateLeadSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* DATOS DEL TUTOR */}
              <div>
                <h3 className="font-bold text-slate-700 mb-3 border-b pb-2 flex items-center justify-between">
                  <span>👤 Datos del Tutor / Contacto Familiar</span>
                  <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">Apellidos separados</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.tutor_first_name}
                      onChange={e => setNewLeadForm({ ...newLeadForm, tutor_first_name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej. Juan Carlos"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 1 (Paterno) *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.tutor_last_name_1}
                      onChange={e => setNewLeadForm({ ...newLeadForm, tutor_last_name_1: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej. Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 2 (Materno)</label>
                    <input
                      type="text"
                      value={newLeadForm.tutor_last_name_2}
                      onChange={e => setNewLeadForm({ ...newLeadForm, tutor_last_name_2: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej. García"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={newLeadForm.tutor_phone}
                      onChange={e => setNewLeadForm({ ...newLeadForm, tutor_phone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="55 1234 5678"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                    <input
                      type="email"
                      value={newLeadForm.tutor_email}
                      onChange={e => setNewLeadForm({ ...newLeadForm, tutor_email: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="correo@ejemplo.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Parentesco</label>
                    <select
                      value={newLeadForm.tutor_relationship}
                      onChange={e => setNewLeadForm({ ...newLeadForm, tutor_relationship: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option>Padre</option><option>Madre</option><option>Tutor Legal</option><option>Abuelo(a)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Canal de Captación</label>
                    <select
                      value={newLeadForm.source_channel}
                      onChange={e => setNewLeadForm({ ...newLeadForm, source_channel: e.target.value as any })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      {SOURCE_CHANNELS.map(ch => (
                        <option key={ch.key} value={ch.key}>{ch.icon} {ch.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Prioridad Inicial</label>
                    <select
                      value={newLeadForm.priority}
                      onChange={e => setNewLeadForm({ ...newLeadForm, priority: e.target.value as LeadPriority })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-medium"
                    >
                      <option value="hot">🔴 Caliente (Alta intención de compra)</option>
                      <option value="warm">🟡 Tibio (Interesado con dudas)</option>
                      <option value="normal">🔵 Normal (Pidiendo informes)</option>
                      <option value="cold">⚪ Frío (Primer contacto)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* DATOS DEL ALUMNO */}
              <div>
                <h3 className="font-bold text-slate-700 mb-3 border-b pb-2 flex items-center justify-between">
                  <span>🎓 Datos del Alumno / Candidato</span>
                  <span className="text-[11px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">Apellidos separados</span>
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) del Alumno *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.candidate_first_name}
                      onChange={e => setNewLeadForm({ ...newLeadForm, candidate_first_name: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej. Mateo"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 1 (Paterno) *</label>
                    <input
                      type="text"
                      required
                      value={newLeadForm.candidate_last_name_1}
                      onChange={e => setNewLeadForm({ ...newLeadForm, candidate_last_name_1: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej. Pérez"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 2 (Materno)</label>
                    <input
                      type="text"
                      value={newLeadForm.candidate_last_name_2}
                      onChange={e => setNewLeadForm({ ...newLeadForm, candidate_last_name_2: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="Ej. García"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nivel</label>
                    <select
                      value={newLeadForm.target_level}
                      onChange={e => setNewLeadForm({ ...newLeadForm, target_level: e.target.value as any })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="maternal">Maternal</option>
                      <option value="preescolar">Preescolar</option>
                      <option value="primaria">Primaria</option>
                      <option value="secundaria">Secundaria</option>
                      <option value="preparatoria">Preparatoria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Grado</label>
                    <select
                      value={newLeadForm.target_grade}
                      onChange={e => setNewLeadForm({ ...newLeadForm, target_grade: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option>1°</option><option>2°</option><option>3°</option><option>4°</option><option>5°</option><option>6°</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notas u Observaciones Iniciales</label>
                <textarea
                  value={newLeadForm.notes}
                  onChange={e => setNewLeadForm({ ...newLeadForm, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Información sobre la familia, colegio de procedencia o intereses..."
                />
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddLeadModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm text-sm"
              >
                Guardar Prospecto
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const renderAddActivityModal = () => {
    if (!isAddActivityModalOpen || !selectedLeadId) return null;
    const activityOptions = ACTIVITY_TYPES.filter(t => !['stage_change', 'assignment_change', 'enrollment_completed', 'document_uploaded', 'document_verified', 'scholarship_approved'].includes(t.key));
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800">📞 Registrar Actividad</h2>
            <button onClick={() => setIsAddActivityModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleCreateActivitySubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de Actividad</label>
              <div className="grid grid-cols-4 gap-2">
                {activityOptions.slice(0, 8).map(config => (
                  <button
                    type="button"
                    key={config.key}
                    onClick={() => setNewActivityForm({ ...newActivityForm, activity_type: config.key })}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-colors ${
                      newActivityForm.activity_type === config.key
                        ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                        : 'border-slate-200 hover:border-blue-300 text-slate-600'
                    }`}
                  >
                    <span className="text-lg mb-1">{config.icon}</span>
                    <span className="text-[10px] text-center font-medium leading-tight">{config.label.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Título de la Actividad *</label>
              <input
                type="text"
                required
                value={newActivityForm.title}
                onChange={e => setNewActivityForm({ ...newActivityForm, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Ej. Llamada de confirmación de tour"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas o Conclusiones</label>
              <textarea
                value={newActivityForm.description}
                onChange={e => setNewActivityForm({ ...newActivityForm, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24 resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Detalles sobre lo acordado con el tutor..."
              />
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                id="isTaskCheck"
                checked={newActivityForm.is_task}
                onChange={e => setNewActivityForm({ ...newActivityForm, is_task: e.target.checked })}
                className="rounded text-blue-600"
              />
              <label htmlFor="isTaskCheck" className="text-sm font-medium text-slate-700">Crear tarea de seguimiento programada</label>
            </div>
            {newActivityForm.is_task && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Fecha programada</label>
                <input
                  type="date"
                  value={newActivityForm.scheduled_at}
                  onChange={e => setNewActivityForm({ ...newActivityForm, scheduled_at: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            )}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddActivityModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm"
              >
                Registrar
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  const renderDeclineModal = () => {
    if (!isDeclineModalOpen || !selectedLeadId) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              Marcar Lead como Declinado
            </h3>
            <button onClick={() => setIsDeclineModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Motivo principal</label>
              <select
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {LOST_REASONS.map(r => (
                  <option key={r.key} value={r.key}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Colegio al que se fue (opcional)</label>
              <input
                type="text"
                value={declineSchool}
                onChange={e => setDeclineSchool(e.target.value)}
                placeholder="Ej. Colegio Williams, Montessori..."
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setIsDeclineModalOpen(false)}
              className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg text-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmDecline}
              className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors text-sm shadow-sm"
            >
              Confirmar Declinación
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  // Modal: Agregar / Editar Candidato (Alumno)
  const renderCandidateModal = () => {
    if (!isCandidateModalOpen) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200"
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center">
                <span className="mr-2">{editingCandidateId ? '✏️' : '🎓'}</span>
                {editingCandidateId ? 'Editar Alumno Candidato' : 'Registrar Nuevo Alumno en Expediente'}
              </h3>
              <p className="text-xs text-slate-500">
                Norma Oficial SEP: Apellido 1 (Paterno) y Apellido 2 (Materno) en campos separados
              </p>
            </div>
            <button onClick={() => setIsCandidateModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveCandidate} className="p-6 space-y-4">
            <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-center justify-between">
              <span>📋 <strong>Estándar Escolar SEP:</strong> El primer y segundo apellido se guardan separados.</span>
              <span className="bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 rounded-full">SEP 2026</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) del Alumno *</label>
              <input
                type="text"
                required
                value={candidateForm.first_name}
                onChange={e => setCandidateForm({ ...candidateForm, first_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                placeholder="Ej. Mateo o Sofía"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 1 (Paterno) *</label>
                <input
                  type="text"
                  required
                  value={candidateForm.last_name_1}
                  onChange={e => setCandidateForm({ ...candidateForm, last_name_1: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Ej. González"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 2 (Materno)</label>
                <input
                  type="text"
                  value={candidateForm.last_name_2}
                  onChange={e => setCandidateForm({ ...candidateForm, last_name_2: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Ej. Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nivel Solicitado *</label>
                <select
                  value={candidateForm.target_level}
                  onChange={e => setCandidateForm({ ...candidateForm, target_level: e.target.value as any })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option value="maternal">Maternal</option>
                  <option value="preescolar">Preescolar</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="preparatoria">Preparatoria</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Grado *</label>
                <select
                  value={candidateForm.target_grade}
                  onChange={e => setCandidateForm({ ...candidateForm, target_grade: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option>1°</option><option>2°</option><option>3°</option><option>4°</option><option>5°</option><option>6°</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CURP (opcional)</label>
                <input
                  type="text"
                  value={candidateForm.curp}
                  onChange={e => setCandidateForm({ ...candidateForm, curp: e.target.value.toUpperCase() })}
                  maxLength={18}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                  placeholder="18 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Colegio de procedencia</label>
                <input
                  type="text"
                  value={candidateForm.current_school_name}
                  onChange={e => setCandidateForm({ ...candidateForm, current_school_name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="Ej. Colegio Montessori"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCandidateModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
              >
                {editingCandidateId ? 'Guardar Cambios' : 'Registrar Alumno'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  // Modal: Editar Contacto / Tutor Familiar
  const renderEditTutorModal = () => {
    if (!isEditTutorModalOpen || !selectedLeadId) return null;
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200"
        >
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-800 text-lg flex items-center">
                <span className="mr-2">👤</span> Editar Contacto / Tutor Familiar
              </h3>
              <p className="text-xs text-slate-500">
                Norma Oficial SEP: Apellido 1 (Paterno) y Apellido 2 (Materno) en campos separados
              </p>
            </div>
            <button onClick={() => setIsEditTutorModalOpen(false)} className="text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSaveTutor} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre(s) del Tutor *</label>
              <input
                type="text"
                required
                value={tutorForm.tutor_first_name}
                onChange={e => setTutorForm({ ...tutorForm, tutor_first_name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 1 (Paterno) *</label>
                <input
                  type="text"
                  required
                  value={tutorForm.tutor_last_name_1}
                  onChange={e => setTutorForm({ ...tutorForm, tutor_last_name_1: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Apellido 2 (Materno)</label>
                <input
                  type="text"
                  value={tutorForm.tutor_last_name_2}
                  onChange={e => setTutorForm({ ...tutorForm, tutor_last_name_2: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={tutorForm.tutor_phone}
                  onChange={e => setTutorForm({ ...tutorForm, tutor_phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={tutorForm.tutor_email}
                  onChange={e => setTutorForm({ ...tutorForm, tutor_email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Parentesco</label>
                <select
                  value={tutorForm.tutor_relationship}
                  onChange={e => setTutorForm({ ...tutorForm, tutor_relationship: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                  <option>Padre</option><option>Madre</option><option>Tutor Legal</option><option>Abuelo(a)</option><option>Familiar</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditTutorModalOpen(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-500/20"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    );
  };

  // ============================================================
  // MODAL DE CARTA DE ASIGNACIÓN ESCOLAR (Del Main)
  // ============================================================
  const renderAssignmentLetterModal = () => {
    if (!isAssignmentModalOpen || !assignmentLead) return null;
    const cands = getLeadCandidates(candidates, assignmentLead.id);
    const cand = cands[0];

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📜</span>
              <div>
                <h3 className="text-lg font-black text-slate-900">Carta Formal de Asignación Escolar</h3>
                <p className="text-xs text-slate-500">Dirección Académica & Comité de Admisiones</p>
              </div>
            </div>
            <button onClick={() => setIsAssignmentModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 font-serif">
            <div className="text-center border-b pb-2">
              <p className="font-bold text-slate-900 text-sm tracking-wide uppercase">{school?.name || 'INSTITUTO BILINGÜE IBIME'}</p>
              <p className="text-[11px] text-slate-500 font-sans">Comité Directivo de Admisiones y Asignación de Plazas</p>
            </div>

            <p className="text-slate-700 leading-relaxed font-sans">
              Por medio de la presente, se hace constar formalmente que el alumno(a) <strong className="text-slate-900">{cand ? formatCandidateName(cand) : 'Aspirante'}</strong> ha completado satisfactoriamente su proceso diagnóstico psicopedagógico y cuenta con <strong>PLAZA ESCOLAR ASIGNADA</strong> en:
            </p>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 font-sans space-y-1.5">
              <p><strong>Nivel y Grado:</strong> {cand?.target_level?.toUpperCase()} {cand?.target_grade} (Grupo A Bilingüe)</p>
              <p><strong>Sede / Plantel:</strong> {assignmentLead.campus_name || 'Campus Principal'}</p>
              <p><strong>Tutor Autorizado:</strong> {formatTutorName(assignmentLead)} ({assignmentLead.tutor_relationship})</p>
              <p><strong>Vigencia de Reserva:</strong> 3 días hábiles a partir de la emisión</p>
            </div>

            <p className="text-[11px] text-slate-500 font-sans italic">
              Nota: Para garantizar la plaza en el grupo asignado, la familia deberá liquidar la cuota de inscripción mediante transferencia SPEI o ventanilla escolar.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsAssignmentModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                changeLeadStage(assignmentLead.id, 'reservation');
                addActivity({
                  lead_id: assignmentLead.id,
                  activity_type: 'note',
                  title: 'Carta de Asignación Escolar Emitida',
                  description: `Carta formal emitida para ${cand ? formatCandidateName(cand) : 'alumno'} en ${cand?.target_level} ${cand?.target_grade}. Vigencia de pago: 3 días hábiles.`,
                  is_task: false,
                  is_overdue: false,
                });
                setIsAssignmentModalOpen(false);
                showToast(`✓ Carta de Asignación emitida para ${formatTutorName(assignmentLead)}`);
              }}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Confirmar y Emitir Carta de Asignación
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // MODAL DE FACTURACIÓN CFDI 4.0 IEDU & CONTROL ESCOLAR (Del Main)
  // ============================================================
  const renderCfdiModal = () => {
    if (!isCfdiModalOpen || !cfdiLead) return null;
    const cands = getLeadCandidates(candidates, cfdiLead.id);
    const cand = cands[0];
    const folioUuid = '4A8F92E1-6B3C-4D2A-98F1-7C3E5A128D90';

    return (
      <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <div>
                <h3 className="text-lg font-black text-slate-900">Conciliación de Pago, CFDI 4.0 IEDU SAT & Control Escolar</h3>
                <p className="text-xs text-slate-500">Caja, Tesorería & Matrícula Oficial SEP</p>
              </div>
            </div>
            <button onClick={() => setIsCfdiModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer">
              <X size={18} />
            </button>
          </div>

          <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-800 uppercase text-[11px]">Timbrado Fiscal Automatizado (SAT)</span>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">CFDI 4.0 • IEDU</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-white p-3 rounded-xl border border-emerald-200">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Receptor (Tutor)</span>
                <span className="font-bold text-slate-800 text-xs block">{formatTutorName(cfdiLead)}</span>
                <span className="text-[11px] text-slate-500 font-mono">RFC: {cfdiLead.tutor_last_name_1?.slice(0, 2)?.toUpperCase()}XX800101-ABC</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Uso CFDI: D10 - Pagos por servicios educativos</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Educando (Complemento IEDU)</span>
                <span className="font-bold text-slate-800 text-xs block">{cand ? formatCandidateName(cand) : 'Alumno'}</span>
                <span className="text-[11px] text-slate-500 font-mono">CURP: {cand?.curp || 'CURP18DIGITOSMEX'}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Nivel Escolar: {cand?.target_level?.toUpperCase()} (RVOE SEP)</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-emerald-950 text-white p-3 rounded-xl font-mono text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Concepto:</span>
                <span>Inscripción Ciclo Escolar 2026-2027</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Importe Pagado:</span>
                <span className="text-lg font-black text-emerald-400">$12,500.00 MXN</span>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 font-mono">
              <p><strong>Folio Fiscal UUID:</strong> {folioUuid}</p>
              <p className="truncate"><strong>Sello Digital SAT:</strong> fe80::1ff:fe00:3a60/64|SAT_SHA256_CERT_AUTH_OK</p>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 text-xs text-blue-900 flex items-center gap-2">
            <School size={18} className="text-blue-600 shrink-0" />
            <span>
              Al confirmar, el alumno será dado de alta formalmente en el <strong>Padrón de Control Escolar Operativo</strong> con su matrícula institucional provisional.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setIsCfdiModalOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                changeLeadStage(cfdiLead.id, 'enrolled');
                addActivity({
                  lead_id: cfdiLead.id,
                  activity_type: 'payment_received',
                  title: 'Pago Conciliado & CFDI 4.0 IEDU Timbrado',
                  description: `Pago de $12,500 MXN recibido vía SPEI. CFDI 4.0 emitido con UUID ${folioUuid}. Alta en Control Escolar completada.`,
                  is_task: false,
                  is_overdue: false,
                });
                // Puente automatizado: Registrar formalmente al alumno en Control Escolar
                try {
                  const registerStudent = useSchoolAdminStore.getState().registerStudent;
                  if (registerStudent) {
                    registerStudent({
                      first_name: cand?.first_name || cfdiLead.tutor_first_name || 'Aspirante',
                      second_name: (cand as any)?.second_name || '',
                      last_name_1: cand?.last_name_1 || cfdiLead.tutor_last_name_1 || 'Matriculado',
                      last_name_2: cand?.last_name_2 || cfdiLead.tutor_last_name_2 || '',
                      birth_date: cand?.birth_date || '2016-04-15',
                      curp: cand?.curp || '',
                      gender: (cand?.gender as any) || 'M',
                      shift: 'matutino',
                      status: 'activo',
                      level: (cand?.target_level === 'preescolar' ? 'primaria' : (cand?.target_level as any)) || 'primaria',
                      grade: cand?.target_grade || '1°',
                      school_id: cfdiLead.school_id || 'sch-ibime',
                      campus_name: cfdiLead.campus_name || 'Campus Montes',
                      tutor_name: formatTutorName(cfdiLead),
                      emergency_contact_phone: cfdiLead.tutor_phone || '55-4192-8841',
                      phone: cfdiLead.tutor_phone || '55-4192-8841',
                      email: cfdiLead.tutor_email || 'admisiones@iskool.edu.mx'
                    });
                  }
                } catch (e) {
                  console.warn('Error bridging enrolled lead to control escolar:', e);
                }

                setIsCfdiModalOpen(false);
                showToast(`🎉 ¡${cand ? formatCandidateName(cand) : formatTutorName(cfdiLead)} matriculado con éxito! Alta en Control Escolar y CFDI 4.0 generados.`);
              }}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              Timbrar CFDI 4.0 & Matricular en Control Escolar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Toast flotante
  const renderToast = () => {
    if (!toastMessage) return null;
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-slate-800 text-sm animate-bounce">
        <span>✨</span>
        <span>{toastMessage}</span>
      </div>
    );
  };

  // ============================================================
  // PANTALLA DE ACCESO RESTRINGIDO (GUARD DE ROLES)
  // ============================================================
  if (!authLoading && !hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-800 shadow-xl">
          <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-5 text-3xl">
            🔒
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Acceso Restringido al CRM</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            El módulo de CRM y Admisiones está reservado exclusivamente para los roles de <strong>Dueño</strong>, <strong>Directivo</strong> o <strong>Administración y Ventas</strong>.
          </p>
          <div className="bg-slate-50 rounded-2xl p-4 text-xs text-slate-600 mb-6 text-left space-y-1.5 border border-slate-200">
            <p><span className="text-slate-700 font-bold">Usuario activo:</span> {user?.email || 'No autenticado'}</p>
            <p><span className="text-slate-700 font-bold">Rol detectado:</span> {user?.role || 'Sin sesión'}</p>
          </div>
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-2 font-medium">Entrar con un perfil autorizado:</p>
            <button
              onClick={() => setSimulatedRole('owner')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between text-slate-800 transition-colors cursor-pointer"
            >
              <span>👑 Entrar como Dueño</span>
              <span className="text-[10px] text-slate-500">Don Alejandro Vargas</span>
            </button>
            <button
              onClick={() => setSimulatedRole('director')}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-between text-slate-800 transition-colors cursor-pointer"
            >
              <span>👔 Entrar como Directivo</span>
              <span className="text-[10px] text-slate-500">Lic. Roberto Garza</span>
            </button>
            <button
              onClick={() => setSimulatedRole('admissions_sales')}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl text-xs font-bold flex items-center justify-between text-white transition-all shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <span>💼 Entrar como Administración y Ventas</span>
              <span className="text-[10px] text-blue-200">Lic. Mariana Solís</span>
            </button>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-200">
            <Link
              href="/login"
              className="text-xs text-slate-500 hover:text-slate-800 underline transition-colors"
            >
              Ir a la pantalla de inicio de sesión general
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER PRINCIPAL
  // ============================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto">
        {renderHeader()}
        {renderStatsRow()}
        {renderFilterBar()}
        {renderTabs()}

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'pipeline' && renderPipeline()}
          {activeTab === 'institutional' && renderInstitutionalFunnel()}
          {activeTab === 'directory' && renderDirectory()}
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'tasks' && renderTasks()}
        </motion.div>
      </div>

      {renderLeadDrawer()}
      {renderAddLeadModal()}
      {renderAddActivityModal()}
      {renderDeclineModal()}
      {renderCandidateModal()}
      {renderEditTutorModal()}
      {renderAssignmentLetterModal()}
      {renderCfdiModal()}
      {renderToast()}
    </div>
  );
}
