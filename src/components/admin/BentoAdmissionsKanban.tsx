"use client";

/**
 * @module BentoAdmissionsKanban
 * @description Tablero Kanban de 5 Fases con diseño Bento oscuro de alto impacto para la Vista de CEO.
 *   Integra tanto el pipeline de Admisiones Escolares (IBIME) como el pipeline de
 *   Reclutamiento & Onboarding Corporativo B2B (BMW Group México, Vanguardia Retail, Innovasoft Tech).
 *   Soporta reactividad multi-sede, drag & drop fluido, avance atómico de etapas, contacto vía WhatsApp,
 *   y expediente digital 360°.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Phone, Building2, CheckCircle2, ArrowRight, Clock,
  Eye, MessageCircle, ChevronDown, School, ExternalLink,
  Layers, Sparkles, Filter, X, Users, Award, Calendar, FileText,
  Briefcase, DollarSign, BadgeCheck, UserCheck
} from 'lucide-react';
import { useCrmStore, getLeadCandidates } from '@/store/useCrmStore';
import type { CrmLead, CrmStageKey, LeadPriority } from '@/types/crm';
import {
  formatTutorName, formatCandidateName, calculateDaysInStage,
  PRIORITY_CONFIG, SOURCE_CHANNELS
} from '@/types/crm';
import { normalizeCampusKey, executeEnrollmentBridge } from '@/services/admissionsPipelineService';

export interface BentoAdmissionsKanbanProps {
  selectedCampusId: string;
  selectedCampusName: string;
  isCorporate?: boolean;
  schoolId?: string;
  corporateEnterpriseId?: string;
  corporateEnterpriseName?: string;
  onOpenRegisterModal?: () => void;
  onOpenDirectory?: () => void;
  onTriggerToast: (msg: string) => void;
}

// Configuración de Fase Canónica
interface PhaseConfig {
  num: number;
  id: string;
  phaseLabel: string;
  title: string;
  dept: string;
  location: string;
  stages: CrmStageKey[];
  primaryDropStage: CrmStageKey;
  nextStage: CrmStageKey | null;
  colorName: string;
  accentBorder: string;
  badgeBg: string;
  badgeText: string;
  dotColor: string;
  glowColor: string;
}

// ============================================================
// 1. FASES EDUCATIVAS INSTITUCIONALES (Colegios / IBIME)
// ============================================================
const INSTITUTIONAL_PHASES: PhaseConfig[] = [
  {
    num: 1,
    id: 'fase-lead',
    phaseLabel: 'Fase 1 · Lead',
    title: 'Captación & CRM',
    dept: 'Admisiones & Marketing',
    location: 'Landing Web / Ferias / WhatsApp',
    stages: ['registered', 'contacted', 'census'],
    primaryDropStage: 'registered',
    nextStage: 'tour_scheduled',
    colorName: 'purple',
    accentBorder: 'border-purple-200 hover:border-purple-400',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border-purple-200',
    dotColor: 'bg-purple-600',
    glowColor: 'from-purple-50/70 to-transparent'
  },
  {
    num: 2,
    id: 'fase-visita',
    phaseLabel: 'Fase 2 · Visita',
    title: 'Tours de Campus',
    dept: 'Dirección de Campus & RRPP',
    location: 'Agenda de Visitas / Recorrido',
    stages: ['tour_scheduled', 'status_review', 'intention_survey'],
    primaryDropStage: 'tour_scheduled',
    nextStage: 'evaluation',
    colorName: 'indigo',
    accentBorder: 'border-indigo-200 hover:border-indigo-400',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-600',
    glowColor: 'from-indigo-50/70 to-transparent'
  },
  {
    num: 3,
    id: 'fase-evaluacion',
    phaseLabel: 'Fase 3 · Evaluación',
    title: 'Diagnóstico',
    dept: 'Gabinete Psicopedagógico',
    location: 'Expediente Psicopedagógico',
    stages: ['evaluation'],
    primaryDropStage: 'evaluation',
    nextStage: 'reservation',
    colorName: 'blue',
    accentBorder: 'border-sky-200 hover:border-sky-400',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700 border-sky-200',
    dotColor: 'bg-sky-600',
    glowColor: 'from-sky-50/70 to-transparent'
  },
  {
    num: 4,
    id: 'fase-reserva',
    phaseLabel: 'Fase 4 · Reserva',
    title: 'Carta de Asignación',
    dept: 'Dirección Académica & Comité',
    location: 'Comité de Asignación Escolar',
    stages: ['proposal_sent', 'reservation', 'payment_pending'],
    primaryDropStage: 'reservation',
    nextStage: 'enrolled',
    colorName: 'teal',
    accentBorder: 'border-teal-200 hover:border-teal-400',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700 border-teal-200',
    dotColor: 'bg-teal-600',
    glowColor: 'from-teal-50/70 to-transparent'
  },
  {
    num: 5,
    id: 'fase-matricula',
    phaseLabel: 'Fase 5 · Matrícula',
    title: 'Inscripción Pagada',
    dept: 'Caja, Tesorería & Control Escolar',
    location: 'Módulo Cobranza SPEI + Padrón SEP',
    stages: ['enrolled', 'reenrolled', 'transferred'],
    primaryDropStage: 'enrolled',
    nextStage: null,
    colorName: 'emerald',
    accentBorder: 'border-emerald-200 hover:border-emerald-400',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-600',
    glowColor: 'from-emerald-50/70 to-transparent'
  }
];

// ============================================================
// 2. FASES CORPORATIVAS B2B (Reclutamiento & Onboarding CEO)
// ============================================================
const CORPORATE_RECRUITMENT_PHASES: PhaseConfig[] = [
  {
    num: 1,
    id: 'fase-vacante',
    phaseLabel: 'Fase 1 · Vacante',
    title: 'Atracción & Headhunting',
    dept: 'Atracción de Talento & HR',
    location: 'Portal de Empleo / LinkedIn / Bolsas Técnicas',
    stages: ['registered', 'contacted', 'census'],
    primaryDropStage: 'registered',
    nextStage: 'tour_scheduled',
    colorName: 'purple',
    accentBorder: 'border-purple-200 hover:border-purple-400',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700 border-purple-200',
    dotColor: 'bg-purple-600',
    glowColor: 'from-purple-50/70 to-transparent'
  },
  {
    num: 2,
    id: 'fase-entrevista',
    phaseLabel: 'Fase 2 · Entrevista',
    title: 'Entrevista Inicial',
    dept: 'Capital Humano & Operaciones',
    location: 'Agenda de Entrevistas / Filtro Inicial',
    stages: ['tour_scheduled', 'status_review', 'intention_survey'],
    primaryDropStage: 'tour_scheduled',
    nextStage: 'evaluation',
    colorName: 'indigo',
    accentBorder: 'border-indigo-200 hover:border-indigo-400',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700 border-indigo-200',
    dotColor: 'bg-indigo-600',
    glowColor: 'from-indigo-50/70 to-transparent'
  },
  {
    num: 3,
    id: 'fase-evaluacion-tecnica',
    phaseLabel: 'Fase 3 · Evaluación',
    title: 'Pruebas Técnicas',
    dept: 'Líderes de Área / Especialistas',
    location: 'Expediente Técnico & Psicométrico',
    stages: ['evaluation'],
    primaryDropStage: 'evaluation',
    nextStage: 'reservation',
    colorName: 'blue',
    accentBorder: 'border-sky-200 hover:border-sky-400',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-700 border-sky-200',
    dotColor: 'bg-sky-600',
    glowColor: 'from-sky-50/70 to-transparent'
  },
  {
    num: 4,
    id: 'fase-oferta-economica',
    phaseLabel: 'Fase 4 · Oferta',
    title: 'Propuesta Económica',
    dept: 'Dirección de Operaciones / Finanzas',
    location: 'Comité Directivo de Contratación',
    stages: ['proposal_sent', 'reservation', 'payment_pending'],
    primaryDropStage: 'reservation',
    nextStage: 'enrolled',
    colorName: 'teal',
    accentBorder: 'border-teal-200 hover:border-teal-400',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-700 border-teal-200',
    dotColor: 'bg-teal-600',
    glowColor: 'from-teal-50/70 to-transparent'
  },
  {
    num: 5,
    id: 'fase-alta-onboarding',
    phaseLabel: 'Fase 5 · Contratado',
    title: 'Alta Patronal & Onboarding',
    dept: 'Recursos Humanos & Nóminas',
    location: 'Módulo Facturación B2B + Padrón Activo IMSS',
    stages: ['enrolled', 'reenrolled', 'transferred'],
    primaryDropStage: 'enrolled',
    nextStage: null,
    colorName: 'emerald',
    accentBorder: 'border-emerald-200 hover:border-emerald-400',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700 border-emerald-200',
    dotColor: 'bg-emerald-600',
    glowColor: 'from-emerald-50/70 to-transparent'
  }
];

export default function BentoAdmissionsKanban({
  selectedCampusId,
  selectedCampusName,
  isCorporate = false,
  schoolId,
  corporateEnterpriseId,
  corporateEnterpriseName,
  onOpenRegisterModal,
  onOpenDirectory,
  onTriggerToast
}: BentoAdmissionsKanbanProps) {
  const store = useCrmStore();
  const { leads, candidates, changeLeadStage, updateLead } = store;

  // Selección de fases activas según el modo (Educativo vs Corporativo B2B)
  const activePhases = useMemo(() => {
    return isCorporate ? CORPORATE_RECRUITMENT_PHASES : INSTITUTIONAL_PHASES;
  }, [isCorporate]);

  // Filtros locales dentro del tablero
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | LeadPriority>('all');
  const [dragOverPhase, setDragOverPhase] = useState<number | null>(null);
  const [selectedDetailLead, setSelectedDetailLead] = useState<CrmLead | null>(null);

  // Normalización reactiva de sede seleccionada
  const normalizedSelectedCampus = useMemo(() => {
    return normalizeCampusKey(selectedCampusId);
  }, [selectedCampusId]);

  // Empresa o colegio efectivo
  const effectiveSchoolId = useMemo(() => {
    if (corporateEnterpriseId) return corporateEnterpriseId;
    if (schoolId) return schoolId;
    return isCorporate ? 'emp-bmw' : 'sch-ibime';
  }, [corporateEnterpriseId, schoolId, isCorporate]);

  // Filtrado reactivo de leads por empresa/colegio, sede, prioridad y texto
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 1. Filtro estricto por institución (Aislamiento Multi-Tenant)
      if (isCorporate) {
        // En modo corporativo, aislar por la empresa activa
        if (lead.school_id !== effectiveSchoolId) return false;
      } else {
        // En modo escolar regular, evitar mezclar candidatos de empresas B2B
        if (lead.school_id?.startsWith('emp-') || lead.pipeline_type === 'corporate_recruitment') {
          return false;
        }
        if (schoolId && lead.school_id !== schoolId) {
          return false;
        }
      }

      // 2. Filtro reactivo por campus / planta
      if (normalizedSelectedCampus !== 'all') {
        const leadCampusNorm = normalizeCampusKey(lead.campus_id);
        if (leadCampusNorm !== normalizedSelectedCampus) return false;
      }

      // 3. Filtro por prioridad
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) {
        return false;
      }

      // 4. Filtro por texto de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const personName = `${lead.tutor_first_name} ${lead.tutor_last_name || ''}`.toLowerCase();
        const phone = (lead.tutor_phone || '').toLowerCase();
        const candList = getLeadCandidates(candidates, lead.id);
        const candNames = candList.map(c => `${c.first_name} ${c.last_name_1 || ''} ${c.position_title || ''}`).join(' ').toLowerCase();
        const dept = (lead.department || '').toLowerCase();

        if (!personName.includes(q) && !phone.includes(q) && !candNames.includes(q) && !dept.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [leads, candidates, isCorporate, effectiveSchoolId, schoolId, normalizedSelectedCampus, priorityFilter, searchQuery]);

  // Agrupación de leads por las 5 fases canónicas
  const leadsByPhase = useMemo(() => {
    const map = new Map<number, CrmLead[]>();
    for (let i = 1; i <= 5; i++) {
      map.set(i, []);
    }

    filteredLeads.forEach(lead => {
      const phaseObj = activePhases.find(p => p.stages.includes(lead.stage));
      const phaseNum = phaseObj ? phaseObj.num : 1;
      const list = map.get(phaseNum) || [];
      list.push(lead);
      map.set(phaseNum, list);
    });

    // Ordenar cada lista por score descendente
    for (let i = 1; i <= 5; i++) {
      const list = map.get(i) || [];
      list.sort((a, b) => (b.lead_score || 0) - (a.lead_score || 0));
      map.set(i, list);
    }

    return map;
  }, [filteredLeads, activePhases]);

  // Avance rápido de etapa
  const handleQuickAdvance = useCallback((lead: CrmLead, currentPhaseNum: number) => {
    const phaseConfig = activePhases.find(p => p.num === currentPhaseNum);
    if (!phaseConfig || !phaseConfig.nextStage) return;

    const nextStage = phaseConfig.nextStage;
    const nextPhaseConfig = activePhases.find(p => p.stages.includes(nextStage));

    changeLeadStage(lead.id, nextStage);

    // Si avanza a Fase 5 (Matrícula / Contratado), se ejecuta el puente de inscripción y sincronización
    if (nextPhaseConfig?.num === 5) {
      executeEnrollmentBridge({ leadId: lead.id, paymentMethod: 'SPEI', cfdiRequested: true });
      if (isCorporate) {
        onTriggerToast(`💼 ¡Contratación Consolidada! ${formatTutorName(lead)} pasó a Alta Patronal & Onboarding (Nómina B2B e IMSS habilitados).`);
      } else {
        onTriggerToast(`🎓 ¡Matrícula Consolidada! ${formatTutorName(lead)} pasó a Inscripción Pagada (CFDI 4.0 & Matrícula SEP habilitada).`);
      }
    } else {
      onTriggerToast(`✓ ${formatTutorName(lead)} avanzado a "${nextPhaseConfig?.phaseLabel}: ${nextPhaseConfig?.title}".`);
    }
  }, [activePhases, changeLeadStage, isCorporate, onTriggerToast]);

  // Cambio de prioridad interactivo
  const handlePriorityChange = useCallback((leadId: string, tutorName: string, newPriority: LeadPriority) => {
    updateLead(leadId, { priority: newPriority });
    onTriggerToast(`Prioridad de ${tutorName} ajustada a ${PRIORITY_CONFIG[newPriority].label}.`);
  }, [updateLead, onTriggerToast]);

  // Drag and Drop
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('crmLeadId', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, phaseNum: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverPhase !== phaseNum) {
      setDragOverPhase(phaseNum);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverPhase(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetPhaseNum: number) => {
    e.preventDefault();
    setDragOverPhase(null);
    const leadId = e.dataTransfer.getData('crmLeadId');
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    const targetPhase = activePhases.find(p => p.num === targetPhaseNum);
    if (!targetPhase) return;

    changeLeadStage(leadId, targetPhase.primaryDropStage);

    if (targetPhaseNum === 5) {
      executeEnrollmentBridge({ leadId: lead.id, paymentMethod: 'SPEI', cfdiRequested: true });
      if (isCorporate) {
        onTriggerToast(`💼 ¡Contratación Exitosa! ${formatTutorName(lead)} ubicado en Fase 5 (Alta Patronal & Onboarding).`);
      } else {
        onTriggerToast(`🎓 ¡Matrícula Completada! ${formatTutorName(lead)} ubicado en Fase 5 (Inscripción Pagada).`);
      }
    } else {
      onTriggerToast(`✓ ${formatTutorName(lead)} movido a "${targetPhase.phaseLabel}: ${targetPhase.title}".`);
    }
  };

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE HERRAMIENTAS DEL KANBAN (MODO CLARO LUMÍNICO) */}
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 shadow-xs">
            {isCorporate ? <Briefcase size={18} /> : <Layers size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-slate-900 tracking-wide">
                {isCorporate
                  ? 'Tablero Ágil de Reclutamiento & Onboarding Corporativo'
                  : 'Tablero Kanban Ágil de 5 Fases Corresponsables'}
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full shadow-2xs">
                {filteredLeads.length} {isCorporate ? 'Candidatos en Pipeline' : 'Aspirantes en Pipeline'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isCorporate ? 'Planta / Sede activa:' : 'Sede activa:'}{' '}
              <strong className="text-purple-700">{selectedCampusName}</strong> • Arrastra las tarjetas o pulsa "Avanzar" para transiciones de fase atómicas.
            </p>
          </div>
        </div>

        {/* CONTROLES DE FILTRADO Y BÚSQUEDA RÁPIDA */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isCorporate ? "Buscar candidato, puesto o tel..." : "Buscar aspirante, tutor o tel..."}
              className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:bg-white focus:ring-2 focus:ring-purple-100 transition-all w-44 sm:w-56 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <span className="text-[10px] text-slate-500 px-1.5 font-bold uppercase">Prioridad:</span>
            {(['all', 'hot', 'warm', 'normal'] as const).map(p => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  priorityFilter === p
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                {p === 'all' ? 'Todas' : p === 'hot' ? '🔴 Caliente' : p === 'warm' ? '🟡 Tibio' : '🔵 Normal'}
              </button>
            ))}
          </div>

          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isCorporate ? '+ Registrar Candidato' : '+ Nuevo Aspirante'}</span>
            </button>
          )}
        </div>
      </div>

      {/* REJILLA DE 5 COLUMNAS KANBAN (BENTO GRID EN MODO CLARO) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5 items-start">
        {activePhases.map((phase) => {
          const stageLeads = leadsByPhase.get(phase.num) || [];
          const isDropActive = dragOverPhase === phase.num;

          return (
            <div
              key={phase.id}
              onDragOver={(e) => handleDragOver(e, phase.num)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, phase.num)}
              className={`rounded-3xl border transition-all duration-200 flex flex-col min-h-[580px] max-h-[820px] overflow-hidden ${
                isDropActive
                  ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-400/40 shadow-xl scale-[1.01]'
                  : 'bg-slate-50/70 border-slate-200/80 shadow-xs hover:border-slate-300'
              }`}
            >
              {/* CABECERA DE LA COLUMNA BENTO */}
              <div className={`p-4 border-b border-slate-200/80 bg-gradient-to-b ${phase.glowColor}`}>
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${phase.badgeBg} ${phase.badgeText} shadow-2xs`}>
                    {phase.phaseLabel}
                  </span>
                  <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-700 font-mono font-black text-xs flex items-center justify-center shadow-xs">
                    {stageLeads.length}
                  </span>
                </div>

                <h4 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${phase.dotColor}`} />
                  {phase.title}
                </h4>

                <div className="mt-1 text-[10px] text-slate-500 flex flex-col gap-0.5">
                  <span className="text-slate-700 font-semibold">{phase.dept}</span>
                  <span className="text-slate-400 truncate" title={phase.location}>📍 {phase.location}</span>
                </div>
              </div>

              {/* LISTA DE TARJETAS DE ASPIRANTES / CANDIDATOS */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {stageLeads.map((lead) => {
                  const leadCandidates = getLeadCandidates(candidates, lead.id);
                  const firstCand = leadCandidates[0];
                  const daysInStage = calculateDaysInStage(lead);
                  const isStalled = daysInStage > 7;
                  const sourceChannel = SOURCE_CHANNELS.find(c => c.key === lead.source_channel);

                  // Teléfono limpio para WhatsApp
                  const rawPhone = (lead.tutor_phone || '').replace(/\D/g, '');
                  const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
                  const waMessage = isCorporate
                    ? `Estimado(a) ${firstCand ? firstCand.first_name : lead.tutor_first_name}, te contactamos del equipo de Atracción de Talento de ${corporateEnterpriseName || 'ISkool Enterprise'} respecto a tu postulación.`
                    : `Estimada familia ${formatTutorName(lead)}, nos comunicamos del Departamento de Admisiones respecto al proceso de ingreso.`;

                  return (
                    <div
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onClick={() => setSelectedDetailLead(lead)}
                      className="bg-white rounded-2xl border border-slate-200/90 p-3.5 space-y-2.5 cursor-grab active:cursor-grabbing hover:border-purple-300 hover:shadow-md transition-all text-slate-900 group select-none relative overflow-hidden shadow-xs"
                    >
                      {/* Borde sutil lateral de prioridad */}
                      <div
                        className={`absolute left-0 top-0 bottom-0 w-1 ${
                          lead.priority === 'hot' ? 'bg-red-500' :
                          lead.priority === 'warm' ? 'bg-amber-400' :
                          lead.priority === 'cold' ? 'bg-slate-300' : 'bg-blue-500'
                        }`}
                      />

                      {/* Header de la tarjeta: Prioridad + Días en etapa */}
                      <div className="flex items-center justify-between gap-1 pl-1">
                        <div onClick={e => e.stopPropagation()}>
                          <select
                            value={lead.priority}
                            onChange={(e) => handlePriorityChange(lead.id, formatTutorName(lead), e.target.value as LeadPriority)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer focus:outline-none transition-all shadow-2xs ${
                              lead.priority === 'hot' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                              lead.priority === 'warm' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                              lead.priority === 'cold' ? 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100' :
                              'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            }`}
                            title="Cambiar prioridad"
                          >
                            <option value="hot">🔴 Caliente</option>
                            <option value="warm">🟡 Tibio</option>
                            <option value="normal">🔵 Normal</option>
                            <option value="cold">⚪ Frío</option>
                          </select>
                        </div>

                        <span
                          className={`text-[11px] font-mono flex items-center gap-1 ${
                            isStalled ? 'text-red-600 font-bold' : 'text-slate-400'
                          }`}
                          title={`Lleva ${daysInStage} días en esta etapa`}
                        >
                          <Clock size={11} />
                          {daysInStage}d
                        </span>
                      </div>

                      {/* Nombre y Puesto / Nivel */}
                      <div className="pl-1">
                        {isCorporate ? (
                          <>
                            {/* Insignia del puesto corporativo */}
                            <div className="mb-1">
                              <span className="inline-block px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black rounded-md tracking-tight truncate max-w-full">
                                {firstCand?.position_title || lead.department || 'Puesto Técnico Solicitado'}
                              </span>
                            </div>
                            <h5 className="text-xs font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                              {formatTutorName(lead)}
                            </h5>
                            <div className="flex items-center justify-between gap-1.5 mt-1">
                              <span className="text-[10px] text-slate-500 truncate max-w-[130px]" title={lead.campus_name}>
                                📍 {lead.campus_name?.replace('Planta ', '').replace('CEDIS ', '').replace('Corporativo ', '') || 'Sede'}
                              </span>
                              {(lead.proposed_salary || firstCand?.proposed_salary) && (
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-mono text-[9px] font-bold">
                                  {lead.proposed_salary || firstCand?.proposed_salary}
                                </span>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-xs font-black text-slate-900 group-hover:text-purple-600 transition-colors truncate">
                                {firstCand ? formatCandidateName(firstCand) : (lead.notes?.slice(0, 24) || 'Aspirante IBIME')}
                              </h5>
                              {leadCandidates.length > 1 && (
                                <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.2 rounded-full font-bold">
                                  +{leadCandidates.length - 1} hnos
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 border border-slate-200/60 rounded text-[10px] font-semibold">
                                {firstCand ? `${firstCand.target_level} ${firstCand.target_grade}` : 'Grado Solicitado'}
                              </span>
                              {lead.campus_name && (
                                <span className="text-[10px] text-slate-400 truncate max-w-[110px]" title={lead.campus_name}>
                                  {lead.campus_name.replace('Campus ', '').split('(')[0]}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {/* Contacto / Reclutador & WhatsApp */}
                      <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 pl-1">
                        <div className="text-slate-700 font-medium flex items-center justify-between">
                          <span className="truncate text-[10px]">
                            {isCorporate ? (
                              lead.recruiter_name ? `HR: ${lead.recruiter_name.split(' ')[0]} ${lead.recruiter_name.split(' ')[1] || ''}` : 'HR Industrial'
                            ) : (
                              formatTutorName(lead)
                            )}
                          </span>
                          {isCorporate ? (
                            <span className="text-[9px] text-cyan-600 font-mono font-bold">
                              {firstCand?.technical_score ? `Score: ${firstCand.technical_score}/100` : 'Score: Pend.'}
                            </span>
                          ) : (
                            lead.tutor_relationship && (
                              <span className="text-[9px] text-slate-400 uppercase font-semibold">{lead.tutor_relationship}</span>
                            )
                          )}
                        </div>

                        <div className="flex items-center justify-between text-slate-500 text-[10px]">
                          <span className="flex items-center gap-1">
                            <Phone size={11} className="text-slate-400" />
                            {lead.tutor_phone || 'Sin tel.'}
                          </span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold"
                              title="Contactar vía WhatsApp Directo"
                            >
                              <MessageCircle size={10} />
                              WA
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Canal de Origen y Lead Score */}
                      <div className="pt-1.5 flex items-center justify-between text-[10px] text-slate-500 pl-1">
                        <span className="text-purple-700 font-medium truncate max-w-[130px]" title={sourceChannel?.label}>
                          {sourceChannel?.icon} {sourceChannel?.label || lead.source_channel}
                        </span>
                        <span className="font-mono text-slate-700 font-bold">
                          {lead.lead_score || 5} pts
                        </span>
                      </div>

                      {/* Botón de Acción de Avance Rápido */}
                      <div className="pt-2 pl-1" onClick={e => e.stopPropagation()}>
                        {phase.nextStage ? (
                          <button
                            onClick={() => handleQuickAdvance(lead, phase.num)}
                            className="w-full py-1.5 bg-slate-100 hover:bg-purple-600 text-slate-700 hover:text-white rounded-xl font-bold text-[10px] flex items-center justify-center gap-1 transition-all active:scale-95 border border-slate-200 cursor-pointer shadow-2xs"
                          >
                            <span>Avanzar a Fase {phase.num + 1}</span>
                            <ArrowRight size={11} />
                          </button>
                        ) : (
                          <div className="w-full py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl font-black text-[10px] flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} />
                            <span>{isCorporate ? '✓ Alta IMSS & Contratado' : '✓ Matrícula Pagada'}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Estado Vacío de la Columna */}
                {stageLeads.length === 0 && (
                  <div className="h-32 border border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center p-3 text-center text-slate-400 text-[11px] space-y-1 bg-white/60">
                    <span className="text-xl opacity-60">📥</span>
                    <span className="text-slate-500">{isCorporate ? 'Sin candidatos en esta fase' : 'Sin aspirantes en esta fase'}</span>
                    <span className="text-[10px] text-slate-400">Arrastra una tarjeta aquí</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DRAWER / MODAL DE DETALLE DEL EXPEDIENTE DIGITAL (MODO CLARO) */}
      {selectedDetailLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl text-slate-900 overflow-hidden">
            {/* Header del Drawer */}
            <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center shadow-xs">
                  {isCorporate ? <Briefcase size={20} /> : <Users size={20} />}
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {isCorporate
                      ? `Expediente Profesional & Selección 360° • ${formatTutorName(selectedDetailLead)}`
                      : `Expediente Familiar 360° • ${formatTutorName(selectedDetailLead)}`}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Folio: <span className="font-mono text-purple-700 font-bold">{selectedDetailLead.id}</span> •{' '}
                    {isCorporate ? 'Planta/Sede' : 'Sede'}: {selectedDetailLead.campus_name || selectedCampusName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Información Personal o Corporativa */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  {isCorporate ? 'Datos del Candidato & Puesto de Interés' : 'Datos del Tutor Principal'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      {isCorporate ? 'Candidato:' : 'Nombre Completo:'}
                    </span>
                    <strong className="text-slate-900 text-xs">{formatTutorName(selectedDetailLead)}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">
                      {isCorporate ? 'Departamento / Área:' : 'Parentesco:'}
                    </span>
                    <strong className="text-slate-900 text-xs">
                      {selectedDetailLead.department || (isCorporate ? 'Operaciones Técnicas' : (selectedDetailLead.tutor_relationship || 'Tutor'))}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Teléfono / WhatsApp:</span>
                    <strong className="text-slate-900 text-xs">{selectedDetailLead.tutor_phone || 'Sin registrar'}</strong>
                  </div>
                </div>
              </div>

              {/* Aspirantes / Hijos Asociados o Perfil Técnico del Candidato */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  {isCorporate
                    ? 'Evaluación Técnica, Salario & Competencias'
                    : `Aspirantes Registrados (${getLeadCandidates(candidates, selectedDetailLead.id).length})`}
                </span>
                <div className="space-y-2">
                  {getLeadCandidates(candidates, selectedDetailLead.id).map(cand => (
                    <div key={cand.id} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div>
                          <strong className="text-slate-900 text-xs block">
                            {isCorporate ? (cand.position_title || formatCandidateName(cand)) : formatCandidateName(cand)}
                          </strong>
                          <span className="text-[11px] text-slate-500">
                            {isCorporate ? (
                              <>
                                Salario Propuesto: <strong className="text-emerald-600 font-mono">{cand.proposed_salary || selectedDetailLead.proposed_salary || '$45,000 MXN / mes'}</strong> • Nivel: {cand.target_grade || 'Senior'}
                              </>
                            ) : (
                              <>
                                Grado Solicitado: <strong className="text-purple-700">{cand.target_level} {cand.target_grade}</strong> • Ciclo: {selectedDetailLead.target_academic_year || '2026-2027'}
                              </>
                            )}
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-[10px] font-bold self-start sm:self-auto">
                          {isCorporate
                            ? (cand.technical_score ? `Score Técnico: ${cand.technical_score}/100` : cand.evaluation_status === 'approved' ? 'Aprobado ✓' : 'En Evaluación')
                            : (cand.evaluation_result ? `Dictamen: ${cand.evaluation_result}` : cand.evaluation_status === 'approved' ? 'Aprobado ✓' : 'En Diagnóstico')}
                        </span>
                      </div>

                      {/* Certificaciones técnicas en modo corporativo */}
                      {isCorporate && cand.certifications && cand.certifications.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                          {cand.certifications.map((cert, cidx) => (
                            <span key={cidx} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[9px] font-semibold flex items-center gap-1">
                              <BadgeCheck size={10} className="text-blue-500" />
                              {cert}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Dictamen del evaluador */}
                      {cand.evaluation_result && (
                        <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded border border-slate-200">
                          "{cand.evaluation_result}"
                        </p>
                      )}
                    </div>
                  ))}

                  {getLeadCandidates(candidates, selectedDetailLead.id).length === 0 && (
                    <div className="text-slate-400 text-[11px] italic">
                      {isCorporate ? 'Perfil técnico en proceso de carga.' : 'Aspirante en proceso de perfilado inicial.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Bitácora y Observaciones */}
              <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">
                  Notas y Bitácora del Caso
                </span>
                <p className="text-slate-700 text-xs bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  {selectedDetailLead.notes || 'Sin observaciones registradas.'}
                </p>
              </div>
            </div>

            {/* Footer con Acciones */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Prioridad actual: <strong className="text-slate-900">{PRIORITY_CONFIG[selectedDetailLead.priority].label}</strong>
              </span>
              <div className="flex items-center gap-2">
                {isCorporate && selectedDetailLead.stage !== 'enrolled' && (
                  <button
                    onClick={() => {
                      changeLeadStage(selectedDetailLead.id, 'enrolled');
                      executeEnrollmentBridge({ leadId: selectedDetailLead.id, paymentMethod: 'SPEI', cfdiRequested: true });
                      onTriggerToast(`💼 ¡Contratación Formalizada! ${formatTutorName(selectedDetailLead)} dado de alta en nómina e IMSS.`);
                      setSelectedDetailLead(null);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-xs transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserCheck size={14} />
                    <span>Contratar & Alta en Nómina</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedDetailLead(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
                >
                  Cerrar Expediente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
