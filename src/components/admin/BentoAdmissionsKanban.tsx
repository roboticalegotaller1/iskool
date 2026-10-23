"use client";

/**
 * @module BentoAdmissionsKanban
 * @description Tablero Work OS de Admisiones & Crecimiento Institucional (Pipeline 360° de 5 Fases Corresponsables).
 *   Surgicamente alineado con la arquitectura, diseño visual y experiencia de usuario del Work OS
 *   de Correo Inteligente & Triage Cognitivo CEO (V3.2 Cloud Work OS).
 *   Integra vistas múltiples (Tablero Kanban, Tabla Visual, Cronograma Gantt, Línea de Tiempo,
 *   Automatizaciones, Embudo Funnel 360°, Bóveda Documental SEP y Asistente Pedagógico IA),
 *   filtro unificado, cálculo de Lead Score / Probabilidad en barra de progreso, botón de inyección
 *   de casos de prueba en caliente, drag & drop atómico, selector rápido "Mover: Transferir a...",
 *   avance guiado y expediente familiar 360°.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Phone, Building2, CheckCircle2, ArrowRight, Clock,
  Eye, MessageCircle, ChevronDown, School, ExternalLink,
  Layers, Sparkles, Filter, X, Users, Award, Calendar, FileText,
  Briefcase, DollarSign, BadgeCheck, UserCheck, GripVertical,
  Check, Plus, RefreshCw, BarChart3, Table as TableIcon,
  ShieldCheck, TrendingUp, AlertTriangle, ArrowUpRight,
  GraduationCap, Flame, Wand2, Info, BookOpen, Zap, Paperclip,
  CheckCircle, Sliders, ChevronRight
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
  headerIcon: string;
}

// ============================================================
// 1. FASES EDUCATIVAS INSTITUCIONALES (Colegios / K-12)
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
    colorName: 'rose',
    accentBorder: 'border-rose-200 hover:border-rose-400',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700 border-rose-200',
    dotColor: 'bg-rose-600',
    glowColor: 'from-rose-50/80 to-transparent',
    headerIcon: '🔥'
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
    glowColor: 'from-indigo-50/80 to-transparent',
    headerIcon: '📍'
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
    glowColor: 'from-sky-50/80 to-transparent',
    headerIcon: '🧠'
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
    glowColor: 'from-teal-50/80 to-transparent',
    headerIcon: '📜'
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
    glowColor: 'from-emerald-50/80 to-transparent',
    headerIcon: '🎓'
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
    colorName: 'rose',
    accentBorder: 'border-rose-200 hover:border-rose-400',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700 border-rose-200',
    dotColor: 'bg-rose-600',
    glowColor: 'from-rose-50/80 to-transparent',
    headerIcon: '🔍'
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
    glowColor: 'from-indigo-50/80 to-transparent',
    headerIcon: '💼'
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
    glowColor: 'from-sky-50/80 to-transparent',
    headerIcon: '⚙️'
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
    glowColor: 'from-teal-50/80 to-transparent',
    headerIcon: '📝'
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
    glowColor: 'from-emerald-50/80 to-transparent',
    headerIcon: '🤝'
  }
];

type AdmissionsViewTab = 'kanban' | 'table' | 'gantt' | 'timeline' | 'automations' | 'funnel' | 'vault' | 'ai_assistant';

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
  const { leads, candidates, changeLeadStage, updateLead, createLead, addCandidate } = store;

  // Vista activa dentro del Work OS de Admisiones
  const [activeTab, setActiveTab] = useState<AdmissionsViewTab>('kanban');

  // Selección de fases activas según el modo (Educativo vs Corporativo B2B)
  const activePhases = useMemo(() => {
    return isCorporate ? CORPORATE_RECRUITMENT_PHASES : INSTITUTIONAL_PHASES;
  }, [isCorporate]);

  // Filtros locales dentro del tablero
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<'all' | LeadPriority>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
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

  // 1. Obtención de leads con fallback a semillas para cualquier colegio nuevo o en demostración
  const baseLeads = useMemo(() => {
    if (isCorporate) {
      const corp = leads.filter(l => l.school_id === effectiveSchoolId);
      return corp.length > 0 ? corp : leads.filter(l => l.school_id === 'emp-bmw');
    }
    const schoolMatches = leads.filter(l => l.school_id === effectiveSchoolId && !l.school_id?.startsWith('emp-'));
    return schoolMatches.length > 0 ? schoolMatches : leads.filter(l => !l.school_id?.startsWith('emp-') && l.pipeline_type !== 'corporate_recruitment');
  }, [leads, isCorporate, effectiveSchoolId]);

  // 2. Filtrado reactivo de leads por campus, prioridad, sección, fase y texto
  const filteredLeads = useMemo(() => {
    return baseLeads.filter(lead => {
      // Filtro reactivo por campus / planta
      if (normalizedSelectedCampus !== 'all') {
        const leadCampusNorm = normalizeCampusKey(lead.campus_id);
        if (leadCampusNorm !== normalizedSelectedCampus) return false;
      }

      // Filtro por fase seleccionada en dropdown
      if (stageFilter !== 'ALL') {
        const phaseNum = parseInt(stageFilter.replace('fase-', ''), 10);
        const targetPhase = activePhases.find(p => p.num === phaseNum);
        if (targetPhase && !targetPhase.stages.includes(lead.stage)) {
          return false;
        }
      }

      // Filtro por prioridad / temperatura
      if (priorityFilter !== 'all' && lead.priority !== priorityFilter) {
        return false;
      }

      // Filtro por sección / nivel educativo
      if (sectionFilter !== 'all') {
        const candList = getLeadCandidates(candidates, lead.id);
        const matchSec = candList.some(c => (c.target_level || '').toLowerCase().includes(sectionFilter.toLowerCase()));
        if (!matchSec) return false;
      }

      // Filtro por texto de búsqueda
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const personName = `${lead.tutor_first_name} ${lead.tutor_last_name || ''}`.toLowerCase();
        const phone = (lead.tutor_phone || '').toLowerCase();
        const candList = getLeadCandidates(candidates, lead.id);
        const candNames = candList.map(c => `${c.first_name} ${c.last_name_1 || ''} ${c.position_title || ''} ${c.target_level || ''} ${c.target_grade || ''}`).join(' ').toLowerCase();
        const dept = (lead.department || '').toLowerCase();
        const leadId = (lead.id || '').toLowerCase();

        if (!personName.includes(q) && !phone.includes(q) && !candNames.includes(q) && !dept.includes(q) && !leadId.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [baseLeads, candidates, normalizedSelectedCampus, stageFilter, priorityFilter, sectionFilter, searchQuery, activePhases]);

  // Agrupación de leads por las 5 fases canónicas
  const leadsByPhase = useMemo(() => {
    const map = new Map<number, CrmLead[]>();
    activePhases.forEach(p => map.set(p.num, []));

    filteredLeads.forEach(lead => {
      const phase = activePhases.find(p => p.stages.includes(lead.stage));
      if (phase) {
        const list = map.get(phase.num) || [];
        list.push(lead);
        map.set(phase.num, list);
      } else {
        // Fallback a Fase 1 si no coincide
        const list = map.get(1) || [];
        list.push(lead);
        map.set(1, list);
      }
    });

    return map;
  }, [filteredLeads, activePhases]);

  // Avance rápido de etapa
  const handleQuickAdvance = useCallback((lead: CrmLead, currentPhaseNum: number) => {
    const phaseConfig = activePhases.find(p => p.num === currentPhaseNum);
    if (!phaseConfig || !phaseConfig.nextStage) return;

    const nextStage = phaseConfig.nextStage;
    const nextPhaseConfig = activePhases.find(p => p.stages.includes(nextStage));

    changeLeadStage(lead.id, nextStage);

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

  // Mover arbitrariamente de fase
  const handleDropCustom = useCallback((leadId: string, targetPhaseNum: number) => {
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
  }, [leads, activePhases, changeLeadStage, isCorporate, onTriggerToast]);

  // Inyección de Caso de Prueba en Caliente (Exacto al Work OS)
  const handleInjectTestCase = useCallback(() => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const mockNames: Array<{ tutor: string; student: string; grade: string; phone: string; level: 'primaria' | 'secundaria' | 'preparatoria' | 'maternal' | 'preescolar' | 'corporativo' | 'especialidad' }> = [
      { tutor: 'Arq. Fernando Valenzuela', student: 'Camila Valenzuela Ríos', grade: 'Primaria 3º', phone: '55 4192 8841', level: 'primaria' },
      { tutor: 'Dra. Marcela Godínez', student: 'Santiago Godínez Castro', grade: 'Secundaria 1º', phone: '55 8320 1194', level: 'secundaria' },
      { tutor: 'Ing. Rodrigo Alcocer', student: 'Mateo Alcocer Cantú', grade: 'Secundaria 2º', phone: '55 8312 3409', level: 'secundaria' },
      { tutor: 'Lic. Claudia Nava Navarro', student: 'Regina Nava Navarrete', grade: 'Preescolar 3º', phone: '55 3301 6992', level: 'preescolar' },
      { tutor: 'Dr. Leonardo Morales', student: 'Leonardo Morales Del Río', grade: 'Secundaria 1º', phone: '55 6478 9012', level: 'secundaria' }
    ];
    const pick = mockNames[Math.floor(Math.random() * mockNames.length)];
    const [tFirst, ...tLast] = pick.tutor.split(' ');
    const [sFirst, ...sLast] = pick.student.split(' ');

    const newLeadId = createLead({
      school_id: effectiveSchoolId,
      campus_id: selectedCampusId === 'all' ? 'sch-ibime-montes' : selectedCampusId,
      campus_name: selectedCampusName || 'Campus Montes',
      pipeline_type: isCorporate ? 'corporate_recruitment' : 'new_enrollment',
      stage: 'registered',
      tutor_first_name: tFirst,
      tutor_last_name: tLast.join(' ') || tFirst,
      tutor_last_name_1: tLast[0] || tFirst,
      tutor_email: `familia.test${randomId}@ejemplo.edu.mx`,
      tutor_phone: pick.phone,
      tutor_relationship: 'Padre / Tutor',
      source_channel: 'referral',
      priority: 'hot',
      referral_incentive_applied: false,
      outcome: null,
      notes: `Aspirante inyectado para prueba en vivo #${randomId}. Interés prioritario en modelo pedagógico integral bilingüe.`,
      target_academic_year: '2026-2027'
    });

    if (newLeadId) {
      addCandidate({
        lead_id: newLeadId,
        first_name: sFirst,
        last_name: sLast.join(' ') || sFirst,
        last_name_1: sLast[0] || sFirst,
        target_level: pick.level,
        target_grade: pick.grade,
        evaluation_status: 'pending',
        scholarship_percent: 0,
        status: 'active'
      });
    }

    onTriggerToast(`✨ ¡Caso de Prueba (${pick.student}) inyectado exitosamente en Fase 1!`);
  }, [createLead, addCandidate, selectedCampusId, selectedCampusName, effectiveSchoolId, onTriggerToast]);

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
    handleDropCustom(leadId, targetPhaseNum);
  };

  return (
    <div className="space-y-4">
      {/* ========================================================= */}
      {/* 1. BARRA SUPERIOR DE CONTROL WORK OS (ESTILO IMAGEN 1)     */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Layers className="h-5 w-5 text-indigo-400" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {isCorporate
                ? 'Work OS de Reclutamiento & Headhunting Corporativo'
                : 'Work OS de Admisiones · Ecosistema de Crecimiento Institucional'}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
              v3.2 Cloud Work OS
            </span>
          </div>
          <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
            {isCorporate
              ? 'Plataforma visual para planificar, ejecutar y supervisar postulaciones, pruebas técnicas, ofertas económicas y altas patronales con trazabilidad de minutos y SLAs en tiempo real.'
              : 'Plataforma visual para captar aspirantes, coordinar visitas de campus, diagnósticos psicopedagógicos y conciliación de matrícula SEP con trazabilidad en minutos y SLAs en tiempo real.'}
          </p>
        </div>

        {/* Controles del Lado Derecho: Sede Operativa + Inyección de Caso de Prueba + Registro */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-[11px] text-indigo-200 font-bold">Vista de Operación:</span>
            <span className="bg-slate-900 text-white rounded-xl px-2.5 py-1 text-xs font-bold border border-indigo-500/40 flex items-center gap-1.5">
              🏫 {selectedCampusName || 'Dirección General / CEO (Global)'}
            </span>
          </div>

          <button
            onClick={handleInjectTestCase}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs bg-white/10 hover:bg-white/20 text-white border border-white/20 active:scale-95"
            title="Inyectar caso de prueba realista en el pipeline"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>+ Inyectar Caso de Prueba</span>
          </button>

          {onOpenRegisterModal && (
            <button
              onClick={onOpenRegisterModal}
              className="px-4 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white rounded-2xl text-xs font-black shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer border border-blue-400/40 active:scale-95"
            >
              <Plus size={14} />
              <span>{isCorporate ? 'Registrar Candidato' : 'Nuevo Aspirante'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SELECTOR DE VISTAS (PILLS WORK OS ESTILO IMAGEN 1)     */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 border border-slate-200 shadow-2xs">
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'kanban', label: 'Tablero Kanban', icon: Layers },
            { id: 'table', label: 'Tabla Visual', icon: TableIcon },
            { id: 'gantt', label: 'Cronograma Gantt', icon: Calendar },
            { id: 'timeline', label: 'Línea de Tiempo', icon: Clock },
            { id: 'automations', label: 'Automatizaciones', icon: Zap },
            { id: 'funnel', label: 'Embudo Funnel 360°', icon: TrendingUp },
            { id: 'vault', label: 'Bóveda Expedientes (SEP)', icon: ShieldCheck },
            { id: 'ai_assistant', label: 'Asistente Pedagógico IA', icon: Wand2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdmissionsViewTab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-black ring-1 ring-indigo-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-indigo-600' : 'text-slate-500'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Contador de casos activos */}
        <div className="flex items-center gap-2 pr-2 text-xs font-mono text-slate-500">
          <span className="font-black text-slate-800">{filteredLeads.length}</span>
          <span>expedientes en pipeline</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. FILTROS Y BÚSQUEDA UNIFICADA (ESTILO IMAGEN 1)          */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Buscador */}
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={isCorporate ? "Buscar por código, candidato, puesto, teléfono..." : "Buscar por código, aspirante, tutor, grado o teléfono..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro Fases / Estados */}
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
          >
            <option value="ALL">Todas las Fases</option>
            <option value="fase-1">Fase 1: {activePhases[0]?.title}</option>
            <option value="fase-2">Fase 2: {activePhases[1]?.title}</option>
            <option value="fase-3">Fase 3: {activePhases[2]?.title}</option>
            <option value="fase-4">Fase 4: {activePhases[3]?.title}</option>
            <option value="fase-5">Fase 5: {activePhases[4]?.title}</option>
          </select>

          {/* Filtro Secciones Escolares */}
          {!isCorporate && (
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las Secciones</option>
              <option value="maternal">Maternal & Lactantes</option>
              <option value="preescolar">Preescolar / Kinder</option>
              <option value="primaria">Primaria Oficial</option>
              <option value="secundaria">Secundaria Oficial</option>
              <option value="preparatoria">Preparatoria / Bachillerato</option>
            </select>
          )}

          {/* Filtro Prioridad / Temperatura */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-bold focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Temperaturas</option>
            <option value="hot">🔴 Caliente (Alta Intención)</option>
            <option value="warm">🟡 Tibio (En Seguimiento)</option>
            <option value="normal">🔵 Normal (Exploratorio)</option>
            <option value="cold">⚪ Frío (Postergado)</option>
          </select>
        </div>

        {/* Botón rápido para inyectar caso de prueba directamente en el filtro */}
        <div className="flex items-center gap-2">
          {onOpenDirectory && (
            <button
              onClick={onOpenDirectory}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <BookOpen size={13} className="text-slate-500" />
              <span>Ver Padrón Completo</span>
            </button>
          )}

          <button
            onClick={handleInjectTestCase}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-black text-xs rounded-xl border border-indigo-200 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-2xs"
          >
            <Plus size={13} className="text-indigo-600 font-black" />
            <span>Inyectar Caso de Prueba</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA                */}
      {/* ========================================================= */}

      {/* VISTA 1: TABLERO KANBAN DE 5 FASES CORRESPONSABLES */}
      {activeTab === 'kanban' && (
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
                className={`rounded-3xl border transition-all duration-200 flex flex-col min-h-[600px] max-h-[880px] overflow-hidden ${
                  isDropActive
                    ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-400/40 shadow-xl scale-[1.01]'
                    : 'bg-slate-50/70 border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* CABECERA DE LA COLUMNA WORK OS (PILL ELEGANTE ESTILO IMAGEN 1) */}
                <div className={`p-3.5 border-b border-slate-200 bg-gradient-to-b ${phase.glowColor}`}>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${phase.badgeBg} ${phase.badgeText} shadow-2xs flex items-center gap-1.5`}>
                      <span>{phase.headerIcon}</span>
                      <span>{phase.title}</span>
                    </span>
                    <span className="w-6 h-6 rounded-full bg-white border border-slate-200 text-slate-800 font-mono font-black text-xs flex items-center justify-center shadow-xs">
                      {stageLeads.length}
                    </span>
                  </div>

                  <div className="mt-1 text-[10px] text-slate-500 flex flex-col gap-0.5">
                    <span className="text-slate-700 font-bold">{phase.phaseLabel} · {phase.dept}</span>
                    <span className="text-slate-400 truncate" title={phase.location}>📍 {phase.location}</span>
                  </div>
                </div>

                {/* LISTA DE TARJETAS DE ASPIRANTES / EXPEDIENTES */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {stageLeads.map((lead) => {
                    const leadCandidates = getLeadCandidates(candidates, lead.id);
                    const firstCand = leadCandidates[0];
                    const daysInStage = calculateDaysInStage(lead);
                    const isStalled = daysInStage > 7;
                    const sourceChannel = SOURCE_CHANNELS.find(c => c.key === lead.source_channel);

                    // Formateo de Teléfono para WhatsApp
                    const rawPhone = (lead.tutor_phone || '').replace(/\D/g, '');
                    const cleanPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;
                    const waMessage = isCorporate
                      ? `Estimado(a) ${firstCand ? firstCand.first_name : lead.tutor_first_name}, te contactamos del equipo de Atracción de Talento de ${corporateEnterpriseName || 'ISkool Enterprise'} respecto a tu postulación.`
                      : `Estimada familia ${formatTutorName(lead)}, nos comunicamos de Admisiones respecto al proceso de ingreso para el ciclo 2026-2027.`;

                    // Cálculo visual del Lead Score / Probabilidad (0 - 100%)
                    const leadScore = Math.min(100, Math.max(10, (lead.lead_score || 5) * 10));

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedDetailLead(lead)}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-400 shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2.5 group select-none relative overflow-hidden text-slate-900"
                      >
                        {/* Borde lateral de temperatura / prioridad */}
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            lead.priority === 'hot' ? 'bg-red-500' :
                            lead.priority === 'warm' ? 'bg-amber-400' :
                            lead.priority === 'cold' ? 'bg-slate-300' : 'bg-blue-500'
                          }`}
                        />

                        {/* Fila 1: Grip + Folio oficial + SLA / Tiempo en etapa */}
                        <div className="flex items-center justify-between text-[10px] pl-1">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <GripVertical className="h-3.5 w-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                            <span className="font-mono font-black text-indigo-600 truncate">
                              {lead.id?.startsWith('EXP-') ? lead.id : `EXP-ADM-2026-${lead.id.slice(-4).toUpperCase()}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1 ${
                              isStalled
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              {isStalled ? <AlertTriangle size={10} /> : <Clock size={10} />}
                              {isStalled ? `Vencido >${daysInStage}d` : `${daysInStage}d`}
                            </span>

                            <div onClick={e => e.stopPropagation()}>
                              <select
                                value={lead.priority}
                                onChange={(e) => handlePriorityChange(lead.id, formatTutorName(lead), e.target.value as LeadPriority)}
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded border cursor-pointer focus:outline-none transition-all ${
                                  lead.priority === 'hot' ? 'bg-red-50 text-red-700 border-red-200' :
                                  lead.priority === 'warm' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  lead.priority === 'cold' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                                  'bg-blue-50 text-blue-700 border-blue-200'
                                }`}
                                title="Cambiar prioridad"
                              >
                                <option value="hot">🔴 Caliente</option>
                                <option value="warm">🟡 Tibio</option>
                                <option value="normal">🔵 Normal</option>
                                <option value="cold">⚪ Frío</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Fila 2: Nombre del Alumno / Aspirante en Negrita + Nivel */}
                        <div className="pl-1">
                          <h4 className="font-bold text-xs text-slate-900 group-hover:text-indigo-600 truncate">
                            {firstCand 
                              ? `${firstCand.first_name} ${firstCand.last_name_1 || ''}`
                              : (lead.tutor_last_name ? `Aspirante Fam. ${lead.tutor_last_name}` : (lead.notes?.slice(0, 24) || 'Aspirante'))}
                          </h4>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap text-[10px]">
                            <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200/80 rounded font-bold flex items-center gap-1">
                              <GraduationCap size={10} />
                              {firstCand ? `${firstCand.target_level} ${firstCand.target_grade}` : 'Grado 1º (Por Definir)'}
                            </span>
                            {lead.campus_name && (
                              <span className="text-slate-400 truncate max-w-[120px]" title={lead.campus_name}>
                                {lead.campus_name.replace('Campus ', '').split('(')[0]}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Fila 3: Barra de Progreso / Probabilidad de Cierre */}
                        <div className="pl-1 space-y-1">
                          <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/60">
                            <div
                              className={`h-full transition-all duration-300 ${
                                leadScore >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                leadScore >= 45 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                                'bg-gradient-to-r from-slate-400 to-indigo-400'
                              }`}
                              style={{ width: `${leadScore}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-400 font-semibold truncate max-w-[130px]" title={formatTutorName(lead)}>
                              👤 {formatTutorName(lead)}
                            </span>
                            <span className={`font-mono font-black ${
                              leadScore >= 75 ? 'text-emerald-700' : leadScore >= 45 ? 'text-amber-700' : 'text-slate-600'
                            }`}>
                              ({leadScore}%)
                            </span>
                          </div>
                        </div>

                        {/* Fila 4: Contacto Familiar & WhatsApp Directo */}
                        <div className="pl-1 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                          <span className="flex items-center gap-1 font-mono">
                            <Phone size={10} className="text-slate-400" />
                            {lead.tutor_phone || 'Sin tel.'}
                          </span>
                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-200 font-bold transition-colors"
                              title="Contactar vía WhatsApp Directo"
                            >
                              <MessageCircle size={10} />
                              WA
                            </a>
                          )}
                        </div>

                        {/* Fila 5: Selector Rápido "Mover: Transferir a..." (Exacto a Imagen 1) */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="pl-1 pt-1 flex items-center justify-between gap-1 text-[10px]"
                        >
                          <span className="text-slate-400 font-semibold flex items-center gap-0.5">
                            <ArrowRight className="h-3 w-3 text-slate-400" /> Mover:
                          </span>
                          <select
                            value=""
                            onChange={(e) => {
                              const targetPhaseNum = parseInt(e.target.value, 10);
                              if (targetPhaseNum) {
                                handleDropCustom(lead.id, targetPhaseNum);
                              }
                            }}
                            className="px-1.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 cursor-pointer text-[10px]"
                          >
                            <option value="">Transferir a...</option>
                            <option value="1">🔥 Fase 1 · Captación</option>
                            <option value="2">📍 Fase 2 · Visita</option>
                            <option value="3">🧠 Fase 3 · Diagnóstico</option>
                            <option value="4">📜 Fase 4 · Reserva</option>
                            <option value="5">🎓 Fase 5 · Matrícula (100%)</option>
                          </select>
                        </div>

                        {/* Fila 6: Botón de Acción Principal (Option 4 Royal Blue) */}
                        <div className="pl-1 pt-1" onClick={e => e.stopPropagation()}>
                          {phase.nextStage ? (
                            <button
                              onClick={() => handleQuickAdvance(lead, phase.num)}
                              className="w-full py-1.5 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-xs border border-blue-400/40 cursor-pointer"
                            >
                              <span>Avanzar a Fase {phase.num + 1}</span>
                              <ArrowRight size={11} />
                            </button>
                          ) : (
                            <div className="w-full py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-black text-[10px] flex items-center justify-center gap-1 shadow-2xs">
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span>{isCorporate ? '✓ Alta IMSS & Contratado' : '✓ Matrícula Pagada SEP'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Estado Vacío de la Columna (Exacto a Imagen 1) */}
                  {stageLeads.length === 0 && (
                    <div className="h-36 border-2 border-dashed border-slate-200/90 rounded-2xl flex flex-col items-center justify-center p-3 text-center text-slate-400 text-[11px] space-y-1.5 bg-white/60">
                      <span className="text-xl opacity-60">📥</span>
                      <span className="text-slate-600 font-semibold">{isCorporate ? 'Sin candidatos en este segmento' : 'Sin expedientes en este segmento'}</span>
                      <span className="text-[10px] text-slate-400">Arrastre una tarjeta aquí para cambiar estado y porcentaje.</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VISTA 2: TABLA VISUAL EJECUTIVA */}
      {activeTab === 'table' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden text-xs">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h4 className="font-black text-slate-900 text-sm">Padrón Consolidado del Pipeline de Admisiones ({filteredLeads.length} Registros)</h4>
            <span className="text-[11px] text-slate-500">Ordenado por prioridad y probabilidad de cierre</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                <tr>
                  <th className="py-2.5 px-4">Folio</th>
                  <th className="py-2.5 px-4">Aspirante / Alumno</th>
                  <th className="py-2.5 px-4">Tutor Principal</th>
                  <th className="py-2.5 px-4">Grado y Sede</th>
                  <th className="py-2.5 px-4">Fase Actual</th>
                  <th className="py-2.5 px-4">Prioridad</th>
                  <th className="py-2.5 px-4">Probabilidad</th>
                  <th className="py-2.5 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => {
                  const leadCandidates = getLeadCandidates(candidates, lead.id);
                  const firstCand = leadCandidates[0];
                  const phaseObj = activePhases.find(p => p.stages.includes(lead.stage));
                  const leadScore = Math.min(100, Math.max(10, (lead.lead_score || 5) * 10));

                  return (
                    <tr
                      key={lead.id}
                      onClick={() => setSelectedDetailLead(lead)}
                      className="hover:bg-blue-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4 font-mono font-bold text-slate-500 text-[11px]">
                        {lead.id?.startsWith('EXP-') ? lead.id : `EXP-ADM-2026-${lead.id.slice(-4).toUpperCase()}`}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">{firstCand ? formatCandidateName(firstCand) : 'Aspirante'}</td>
                      <td className="py-3 px-4 text-slate-700">{formatTutorName(lead)} ({lead.tutor_phone || 'S/N'})</td>
                      <td className="py-3 px-4 text-slate-600">{firstCand ? `${firstCand.target_level} ${firstCand.target_grade}` : 'Por definir'} • {lead.campus_name?.split('(')[0] || 'Sede'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${phaseObj?.badgeBg || 'bg-slate-100'} ${phaseObj?.badgeText || 'text-slate-700'}`}>
                          {phaseObj?.title || 'Fase'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          lead.priority === 'hot' ? 'bg-red-50 text-red-700' :
                          lead.priority === 'warm' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                        }`}>
                          {PRIORITY_CONFIG[lead.priority].label}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {leadScore}%
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDetailLead(lead);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg font-bold text-[10px] transition-all cursor-pointer"
                        >
                          Ver 360°
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 3: CRONOGRAMA GANTT INTERACTIVO */}
      {activeTab === 'gantt' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Cronograma Gantt de Plazos y Admisiones</h4>
              <p className="text-xs text-slate-500 mt-0.5">Seguimiento temporal por fase y proyección de conversión al ciclo escolar 2026-2027.</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Matrícula
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Tours
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Captación
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredLeads.slice(0, 10).map((lead) => {
              const leadCandidates = getLeadCandidates(candidates, lead.id);
              const firstCand = leadCandidates[0];
              const daysInStage = calculateDaysInStage(lead);
              const leadScore = Math.min(100, Math.max(10, (lead.lead_score || 5) * 10));

              return (
                <div key={lead.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 truncate max-w-md">
                      {firstCand ? formatCandidateName(firstCand) : formatTutorName(lead)} · {firstCand ? `${firstCand.target_level} ${firstCand.target_grade}` : 'Aspirante'}
                    </span>
                    <span className="font-mono text-[10px] text-slate-500">
                      En etapa: {daysInStage}d · Tutor: {formatTutorName(lead)}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        leadScore >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                        leadScore >= 45 ? 'bg-gradient-to-r from-indigo-500 to-blue-500' :
                        'bg-gradient-to-r from-rose-500 to-amber-500'
                      }`}
                      style={{ width: `${leadScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 4: LÍNEA DE TIEMPO */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Línea de Tiempo de Interacciones</h4>
              <p className="text-xs text-slate-500 mt-0.5">Bitácora de contactos, recorridos de campus y evaluaciones psicopedagógicas.</p>
            </div>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-xl border border-indigo-200">
              ⏱ Trazabilidad en Minutos
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {filteredLeads.slice(0, 6).map((lead, idx) => {
              const leadCandidates = getLeadCandidates(candidates, lead.id);
              const firstCand = leadCandidates[0];

              return (
                <div key={lead.id} className="flex items-start gap-3 pl-2">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center border border-indigo-300">
                      {idx + 1}
                    </div>
                    {idx < 5 && <div className="w-0.5 h-12 bg-slate-200 my-1" />}
                  </div>
                  <div className="flex-1 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs text-slate-900">{firstCand ? formatCandidateName(firstCand) : formatTutorName(lead)}</strong>
                      <span className="text-[10px] font-mono text-slate-400">Ciclo 2026-2027</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">
                      {lead.notes || 'Aspirante registrado y validado en el pipeline directivo.'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 5: AUTOMATIZACIONES */}
      {activeTab === 'automations' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-black text-slate-900 text-sm">Automatizaciones del Pipeline de Admisiones</h4>
              <p className="text-xs text-slate-500 mt-0.5">Reglas automáticas de notificación, escalamiento SLA y sincronización interdepartamental.</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 px-3 py-1 rounded-xl border border-amber-200">
              ⚡ 4 Reglas Activas
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              { title: 'Recordatorio WhatsApp Automático', desc: 'Envía mensaje 24 horas antes del recorrido de campus programado con ubicación GPS de la sede.', active: true },
              { title: 'Alerta de Estancamiento >7 días', desc: 'Notifica a la Dirección de Admisiones cuando un aspirante con alta prioridad no avanza de fase.', active: true },
              { title: 'Puente Financiero SPEI & Matrícula', desc: 'Al pasar a Fase 5, concilia automáticamente la ficha bancaria y habilita el padrón SEP.', active: true },
              { title: 'Sincronización con Expediente SEP', desc: 'Valida CURP y acta de nacimiento contra el padrón escolar de la Dirección General.', active: true }
            ].map((rule, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <strong className="text-xs text-slate-900 flex items-center gap-1.5">
                    <Zap size={14} className="text-amber-500" />
                    {rule.title}
                  </strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                    Activa
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-snug">{rule.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 6: EMBUDO FUNNEL 360° */}
      {activeTab === 'funnel' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-base font-black text-slate-900">Embudo Gráfico de Conversión & Proyección 360°</h4>
              <p className="text-xs text-slate-500">Métricas acumuladas del pipeline de admisiones para {selectedCampusName}.</p>
            </div>
            <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-xl border border-blue-200">
              Total: {filteredLeads.length} Aspirantes
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {activePhases.map((phase) => {
              const count = (leadsByPhase.get(phase.num) || []).length;
              const pct = filteredLeads.length > 0 ? Math.round((count / filteredLeads.length) * 100) : 0;

              return (
                <div key={phase.id} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center font-mono">
                        {phase.num}
                      </span>
                      <strong className="text-slate-900 text-sm">{phase.title}</strong>
                      <span className="text-xs text-slate-400">({phase.dept})</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="text-sm font-black text-slate-900">{count} expedientes</span>
                      <span className="text-xs text-slate-500 block">({pct}% del volumen total)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VISTA 7: BÓVEDA EXPEDIENTES (SEP) */}
      {activeTab === 'vault' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="text-base font-black text-slate-900">Bóveda de Expedientes Digitales & Control SEP</h4>
              <p className="text-xs text-slate-500">Checklist normativo de documentación oficial requerida para validación de matrícula.</p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-xl border border-emerald-200">
              ✓ Estándar SEP NEM 2024
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              { doc: 'Acta de Nacimiento (Certificada)', req: 'Obligatorio', desc: 'Validación en RENAPO para cotejo de identidad oficial.' },
              { doc: 'CURP Certificada Oficial', req: 'Obligatorio', desc: 'Clave única para expediente del Sistema de Información SEP.' },
              { doc: 'Cartilla de Vacunación Actualizada', req: 'Salud Escolar', desc: 'Registro médico para botiquín y seguros de accidentes escolares.' },
              { doc: 'Boleta de Grado Anterior & Carta No Adeudo', req: 'Académico', desc: 'Acreditación del ciclo escolar precedente y estatus financiero.' },
              { doc: 'Comprobante de Domicilio Vigente', req: 'Administrativo', desc: 'Validación de residencia familiar para logística de rutas.' },
              { doc: 'Dictamen Psicopedagógico de Admisión', req: 'Institucional', desc: 'Evaluación de habilidades y recomendaciones curriculares.' },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 text-xs">{item.doc}</strong>
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                    {item.req}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VISTA 8: ASISTENTE PEDAGÓGICO IA */}
      {activeTab === 'ai_assistant' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center">
                <Wand2 size={20} />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900">Asistente Pedagógico IA de Admisiones & Conversión</h4>
                <p className="text-xs text-slate-500">Sugerencias pedagógicas y guiones de contacto personalizados para aumentar la tasa de matrícula.</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-xl">
              Motor de IA Hermético (0 Tokens Comerciales)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-2">
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-600" />
                Guion de Seguimiento WhatsApp
              </span>
              <p className="text-xs text-slate-600 leading-snug">
                "Buen día Familia [Apellido], con gusto le compartimos los horarios disponibles para el recorrido guiado en [Campus] y conocer nuestras aulas Maker y laboratorio de ciencias."
              </p>
            </div>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-200/80 space-y-2">
              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-indigo-600" />
                Manejo de Objeción de Aranceles
              </span>
              <p className="text-xs text-slate-600 leading-snug">
                "Enfatizar que la colegiatura incluye seguro escolar, plataforma digital gamificada, certificación bilingüe y talleres extracurriculares sin cobros sorpresa."
              </p>
            </div>

            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-2">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-blue-600" />
                Alerta de Estancamiento SLA
              </span>
              <p className="text-xs text-slate-600 leading-snug">
                "Los aspirantes con más de 7 días en Fase 3 (Diagnóstico) tienen 3.2x más riesgo de enfriamiento. Se recomienda llamada telefónica directa de la Dirección Académica."
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. DRAWER / MODAL DE DETALLE DEL EXPEDIENTE DIGITAL 360°  */}
      {/* ========================================================= */}
      {selectedDetailLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl text-slate-900 overflow-hidden">
            {/* Header del Drawer */}
            <div className="p-6 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center text-xl font-bold font-mono">
                  {selectedDetailLead.id?.slice(0, 2).toUpperCase() || 'EX'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {selectedDetailLead.id?.startsWith('EXP-') ? selectedDetailLead.id : `EXP-ADM-2026-${selectedDetailLead.id.slice(-4).toUpperCase()}`}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
                      Pipeline Activo
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900">
                    Expediente Familiar: {formatTutorName(selectedDetailLead)}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailLead(null)}
                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Contenido del Drawer */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Información Familiar & Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Tutor Principal</span>
                  <div className="font-bold text-slate-900">{formatTutorName(selectedDetailLead)}</div>
                  <div className="text-slate-500">{selectedDetailLead.tutor_relationship || 'Padre de Familia'}</div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Contacto Directo</span>
                  <div className="font-bold text-slate-900 font-mono">{selectedDetailLead.tutor_phone || 'Sin teléfono'}</div>
                  <div className="text-slate-500 truncate">{selectedDetailLead.tutor_email || 'Sin correo registrado'}</div>
                </div>
              </div>

              {/* Lista de Hijos / Aspirantes Asociados */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Aspirantes Registrados en esta Familia
                </h4>
                <div className="space-y-2">
                  {getLeadCandidates(candidates, selectedDetailLead.id).map(cand => (
                    <div key={cand.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <GraduationCap size={16} className="text-blue-600" />
                        <div>
                          <strong className="text-xs text-slate-900">{formatCandidateName(cand)}</strong>
                          <span className="text-[11px] text-slate-500 block">Grado: {cand.target_level} {cand.target_grade}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        Ciclo 2026-2027
                      </span>
                    </div>
                  ))}
                  {getLeadCandidates(candidates, selectedDetailLead.id).length === 0 && (
                    <div className="p-3 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                      No hay candidatos específicos vinculados.
                    </div>
                  )}
                </div>
              </div>

              {/* Notas del Expediente */}
              {selectedDetailLead.notes && (
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200/60 text-xs">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase block mb-1">Notas de Admisiones</span>
                  <p className="text-slate-700 leading-relaxed">{selectedDetailLead.notes}</p>
                </div>
              )}
            </div>

            {/* Footer con Acciones */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedDetailLead(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
