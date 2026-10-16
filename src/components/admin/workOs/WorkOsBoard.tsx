"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  WorkOsTask,
  WorkOsViewMode,
  WorkOsTaskStatus,
  WorkOsPriority,
  WorkOsEvidenceDoc
} from '@/lib/services/workOs/workOsTypes';
import { WorkOsService } from '@/lib/services/workOs/workOsService';
import { TaskResolutionModal } from './TaskResolutionModal';
import { SeedAccountsConfigPanel } from './SeedAccountsConfigPanel';
import { ReassignDelegationModal } from './ReassignDelegationModal';
import { EvidencePreviewModal } from './EvidencePreviewModal';
import {
  Layers,
  Table,
  Kanban,
  Calendar,
  Clock,
  Zap,
  BarChart3,
  FileText,
  Sparkles,
  Search,
  Filter,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  Users,
  Paperclip,
  Download,
  Eye,
  RefreshCw,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Info,
  SlidersHorizontal,
  Bot,
  GripVertical,
  ArrowRight,
  UserCheck,
  Check,
  Wand2,
  ShieldAlert,
  Settings,
  Copy,
  Database,
  Coins,
  History,
  BookOpen
} from 'lucide-react';

interface WorkOsBoardProps {
  tenantId: string;
  isCeo: boolean;
  currentUserEmail?: string;
  schoolDomain?: string;
  onTriggerToast: (msg: string) => void;
  onNavigateTab?: (tab: 'inbox' | 'work_os' | 'delegados' | 'laboratorio' | 'google' | 'redactar' | 'calendario' | 'directorio' | 'bitacora' | 'raw_inbox' | 'roi' | 'ajustes') => void;
}

export const WorkOsBoard: React.FC<WorkOsBoardProps> = ({
  tenantId,
  isCeo: initialIsCeo,
  currentUserEmail,
  schoolDomain = 'ibime.edu.mx',
  onTriggerToast,
  onNavigateTab
}) => {
  const [tasks, setTasks] = useState<WorkOsTask[]>([]);
  const [viewMode, setViewMode] = useState<WorkOsViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sectionFilter, setSectionFilter] = useState<string>('ALL');
  const [selectedTaskForModal, setSelectedTaskForModal] = useState<WorkOsTask | null>(null);

  // Estados para Asistente IA (Tarjetas interactivas y Ajustes en tiempo real)
  const [selectedAiFeature, setSelectedAiFeature] = useState<'drafting' | 'summaries' | 'sla_risk'>('drafting');

  // Ajustes de Redacción Inteligente
  const [draftingTone, setDraftingTone] = useState<'formal_empathetic' | 'resolutive_concise' | 'urgent_firm' | 'pedagogic_close'>('formal_empathetic');
  const [draftingAudience, setDraftingAudience] = useState<'parents' | 'students' | 'teachers' | 'authorities'>('parents');
  const [autoIncludeSignature, setAutoIncludeSignature] = useState<boolean>(true);
  const [whiteLabelShield, setWhiteLabelShield] = useState<boolean>(true);

  // Ajustes de Resúmenes Ejecutivos
  const [summaryFormat, setSummaryFormat] = useState<'bullets' | 'matrix' | 'narrative'>('bullets');
  const [summaryDepth, setSummaryDepth] = useState<'compact' | 'detailed' | 'comprehensive'>('compact');
  const [extractAgreementsDates, setExtractAgreementsDates] = useState<boolean>(true);
  const [sentimentDetection, setSentimentDetection] = useState<boolean>(true);

  // Ajustes de Predicción de Riesgo SLA
  const [slaWarningThreshold, setSlaWarningThreshold] = useState<number>(75);
  const [slaEscalateHours, setSlaEscalateHours] = useState<number>(12);
  const [autoEscalateCeo, setAutoEscalateCeo] = useState<boolean>(true);
  const [notifySeedDelegates, setNotifySeedDelegates] = useState<boolean>(true);

  // Simulador de borrador generado con Tokens Reales y Bóveda Curricular
  const [simulatedDraftSubject, setSimulatedDraftSubject] = useState('');
  const [simulatedDraftOutput, setSimulatedDraftOutput] = useState('');
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [isCheckingVault, setIsCheckingVault] = useState(false);
  const [vaultDraftMatch, setVaultDraftMatch] = useState<{
    id: string;
    folio: string;
    subject: string;
    content: string;
    tokensUsed: any;
    model: string;
    createdAt: string;
    similarityScore?: number;
  } | null>(null);
  const [lastDraftMetadata, setLastDraftMetadata] = useState<{
    fromVault: boolean;
    folio?: string;
    tokensUsed?: {
      promptTokens: number;
      candidatesTokens: number;
      totalTokens: number;
      savedTokens?: number;
      costMxn: number;
    };
    model?: string;
    createdAt?: string;
  } | null>(null);
  const [vaultDraftsList, setVaultDraftsList] = useState<any[]>([]);
  const [showVaultListModal, setShowVaultListModal] = useState(false);

  // Consulta proactiva en Bóveda Curricular ante cambios en el asunto (Vault-First / Cache-First)
  useEffect(() => {
    const q = simulatedDraftSubject.trim();
    if (!q || q.length < 3) {
      setVaultDraftMatch(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsCheckingVault(true);
        const res = await fetch(`/api/admin/workos/draft?q=${encodeURIComponent(q)}&tenantId=${encodeURIComponent(tenantId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.found && data.match) {
            setVaultDraftMatch(data.match);
          } else {
            setVaultDraftMatch(null);
          }
        }
      } catch {
        // Silencioso
      } finally {
        setIsCheckingVault(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [simulatedDraftSubject, tenantId]);

  // Cargar lista completa de borradores de la Bóveda Curricular
  const fetchVaultDrafts = async () => {
    try {
      const res = await fetch(`/api/admin/workos/draft?all=true&tenantId=${encodeURIComponent(tenantId)}`);
      if (res.ok) {
        const data = await res.json();
        setVaultDraftsList(data.drafts || []);
      }
    } catch {
      // Silencioso
    }
  };

  // Cargar configuraciones guardadas en localStorage
  useEffect(() => {
    try {
      const savedTone = localStorage.getItem(`workos_ai_tone_${tenantId}`);
      if (savedTone) setDraftingTone(savedTone as any);

      const savedAudience = localStorage.getItem(`workos_ai_audience_${tenantId}`);
      if (savedAudience) setDraftingAudience(savedAudience as any);

      const savedSig = localStorage.getItem(`workos_ai_sig_${tenantId}`);
      if (savedSig !== null) setAutoIncludeSignature(savedSig === 'true');

      const savedFmt = localStorage.getItem(`workos_ai_fmt_${tenantId}`);
      if (savedFmt) setSummaryFormat(savedFmt as any);

      const savedDepth = localStorage.getItem(`workos_ai_depth_${tenantId}`);
      if (savedDepth) setSummaryDepth(savedDepth as any);

      const savedSlaWarn = localStorage.getItem(`workos_ai_sla_warn_${tenantId}`);
      if (savedSlaWarn) setSlaWarningThreshold(parseInt(savedSlaWarn, 10));

      const savedSlaHours = localStorage.getItem(`workos_ai_sla_hours_${tenantId}`);
      if (savedSlaHours) setSlaEscalateHours(parseInt(savedSlaHours, 10));
    } catch {
      // Ignorar si el storage local está bloqueado
    }
  }, [tenantId]);

  const handleSaveDraftingSettings = () => {
    try {
      localStorage.setItem(`workos_ai_tone_${tenantId}`, draftingTone);
      localStorage.setItem(`workos_ai_audience_${tenantId}`, draftingAudience);
      localStorage.setItem(`workos_ai_sig_${tenantId}`, String(autoIncludeSignature));
      localStorage.setItem(`workos_ai_whitelabel_${tenantId}`, String(whiteLabelShield));
      onTriggerToast('Ajustes de Redacción Inteligente guardados en Bóveda Curricular.');
    } catch {
      onTriggerToast('Ajustes de Redacción guardados localmente.');
    }
  };

  const handleSaveSummarySettings = () => {
    try {
      localStorage.setItem(`workos_ai_fmt_${tenantId}`, summaryFormat);
      localStorage.setItem(`workos_ai_depth_${tenantId}`, summaryDepth);
      localStorage.setItem(`workos_ai_extract_dates_${tenantId}`, String(extractAgreementsDates));
      localStorage.setItem(`workos_ai_sentiment_${tenantId}`, String(sentimentDetection));
      onTriggerToast('Parámetros de Resúmenes Ejecutivos actualizados con éxito.');
    } catch {
      onTriggerToast('Parámetros de Resúmenes guardados localmente.');
    }
  };

  const handleSaveSlaSettings = () => {
    try {
      localStorage.setItem(`workos_ai_sla_warn_${tenantId}`, String(slaWarningThreshold));
      localStorage.setItem(`workos_ai_sla_hours_${tenantId}`, String(slaEscalateHours));
      localStorage.setItem(`workos_ai_auto_ceo_${tenantId}`, String(autoEscalateCeo));
      localStorage.setItem(`workos_ai_notify_seeds_${tenantId}`, String(notifySeedDelegates));
      onTriggerToast('Umbrales y políticas de Predicción de Riesgo SLA actualizados.');
    } catch {
      onTriggerToast('Umbrales de SLA guardados localmente.');
    }
  };

  // Carga instantánea de borrador existente desde la Bóveda Curricular (0 tokens extra)
  const handleLoadFromVault = (matchToLoad?: any) => {
    const target = matchToLoad || vaultDraftMatch;
    if (!target) return;
    setSimulatedDraftSubject(target.subject);
    setSimulatedDraftOutput(target.content);
    setLastDraftMetadata({
      fromVault: true,
      folio: target.folio,
      tokensUsed: {
        promptTokens: 0,
        candidatesTokens: 0,
        totalTokens: 0,
        savedTokens: target.tokensUsed?.totalTokens || 450,
        costMxn: 0
      },
      model: target.model || 'Bóveda Curricular',
      createdAt: target.createdAt
    });
    onTriggerToast(`Borrador [${target.folio}] recuperado de la Bóveda Curricular (0 tokens consumidos).`);
  };

  // Generación con Tokens Reales en el Motor de Inteligencia Artificial Pedagógica
  const handleGenerateDraftWithTokens = async (forceRegenerate: boolean = false) => {
    const subject = simulatedDraftSubject.trim() || 'Atención prioritaria y seguimiento de caso escolar';
    setIsGeneratingDraft(true);
    try {
      const res = await fetch('/api/admin/workos/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          tone: draftingTone,
          audience: draftingAudience,
          whiteLabelShield,
          autoIncludeSignature,
          tenantId,
          forceRegenerate
        })
      });

      if (!res.ok) {
        throw new Error(`Error en servidor (${res.status})`);
      }

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Error al generar borrador');
      }

      setSimulatedDraftOutput(data.draft.content);
      setLastDraftMetadata({
        fromVault: data.fromVault,
        folio: data.draft.folio,
        tokensUsed: data.tokensUsed,
        model: data.draft.model,
        createdAt: data.draft.createdAt
      });

      if (data.fromVault) {
        onTriggerToast('Borrador pedagógico recuperado de la Bóveda Curricular (0 tokens consumidos).');
      } else {
        const tokensCount = data.tokensUsed?.totalTokens || 0;
        const costMxn = data.tokensUsed?.costMxn || 0;
        onTriggerToast(`Borrador generado con ${tokensCount} tokens reales (~$${costMxn} MXN) y guardado en Bóveda.`);
        setVaultDraftMatch(data.draft);
      }
    } catch (err: any) {
      console.error('Error generando borrador:', err);
      onTriggerToast(`Fallo en generación: ${err.message}`);
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Alias retrocompatible
  const handleSimulateDraft = () => handleGenerateDraftWithTokens(true);

  // Conmutador de Rol (Permite al CEO simular lo que ve un delegado asignado)
  const [simulatedRole, setSimulatedRole] = useState<'ceo' | 'finanzas' | 'transporte' | 'control_escolar' | 'medico' | 'academico'>('ceo');

  // Sub-pestaña para configuración de Seeds o Bóveda
  const [showSeedConfig, setShowSeedConfig] = useState(false);

  // Estados de Drag & Drop para Tablero Kanban
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);
  const [reassigningTask, setReassigningTask] = useState<WorkOsTask | null>(null);

  // Estado para previsualización modal de evidencias de la bóveda
  const [selectedEvidenceForPreview, setSelectedEvidenceForPreview] = useState<(WorkOsEvidenceDoc & { matterCode: string; taskTitle: string; task: WorkOsTask }) | null>(null);

  // Semillas departamentales
  const seedAccounts = useMemo(() => WorkOsService.getSeedAccounts(tenantId, schoolDomain), [tenantId, schoolDomain]);

  // Carga inicial y auditoría automática de no atendidos
  useEffect(() => {
    const loaded = WorkOsService.getTasks(tenantId);
    setTasks(loaded);

    // Auditoría periódica de salud (detecta tareas inactivas o sin abrir)
    const auditRes = WorkOsService.runHealthAndNeglectAudit(tenantId);
    if (auditRes.updatedCount > 0) {
      setTasks(WorkOsService.getTasks(tenantId));
    }

    const interval = setInterval(() => {
      const res = WorkOsService.runHealthAndNeglectAudit(tenantId);
      if (res.updatedCount > 0) {
        setTasks(WorkOsService.getTasks(tenantId));
      }
    }, 60000); // Cada minuto

    return () => clearInterval(interval);
  }, [tenantId]);

  // Filtrado de tareas con garantía estricta de unicidad de claves (id)
  const filteredTasks = useMemo(() => {
    const seen = new Set<string>();
    return tasks.filter(t => {
      if (!t || !t.id || seen.has(t.id)) return false;
      seen.add(t.id);

      // Filtro por búsqueda
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        t.title.toLowerCase().includes(q) ||
        t.matterCode.toLowerCase().includes(q) ||
        t.primaryAssignee.name.toLowerCase().includes(q) ||
        t.sectionName.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q);

      // Filtro por estado
      const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;

      // Filtro por sección / seed
      const matchesSection = sectionFilter === 'ALL' || t.sectionKey === sectionFilter;

      // Filtro por rol simulado (si se simula un delegado específico)
      // Debe incluir tanto si es el responsable titular como si es co-delegado asignado
      let matchesRole = true;
      if (simulatedRole === 'finanzas') {
        matchesRole = t.sectionKey === 'cobranza' || t.primaryAssignee.name.includes('Claudia') || t.collaborators.some(c => c.name.includes('Claudia'));
      } else if (simulatedRole === 'transporte') {
        matchesRole = t.sectionKey === 'transporte' || t.primaryAssignee.name.includes('Mario') || t.collaborators.some(c => c.name.includes('Mario'));
      } else if (simulatedRole === 'control_escolar') {
        matchesRole = t.sectionKey === 'control_escolar' || t.primaryAssignee.name.includes('Rebeca') || t.collaborators.some(c => c.name.includes('Rebeca'));
      } else if (simulatedRole === 'medico') {
        matchesRole = t.sectionKey === 'servicio_medico' || t.primaryAssignee.name.includes('Andrea') || t.collaborators.some(c => c.name.includes('Andrea'));
      } else if (simulatedRole === 'academico') {
        matchesRole = t.sectionKey === 'convivencia' || t.sectionKey === 'academico' || t.primaryAssignee.name.includes('Sofía') || t.collaborators.some(c => c.name.includes('Sofía'));
      }

      return matchesSearch && matchesStatus && matchesSection && matchesRole;
    });
  }, [tasks, searchQuery, statusFilter, sectionFilter, simulatedRole]);

  // Usuario simulado exacto para estampar autoría y trazabilidad en modales y evidencias
  const simulatedUser = useMemo(() => {
    switch (simulatedRole) {
      case 'finanzas': return { name: 'C.P. Claudia Albarrán', email: 'finanzas@ibime.edu.mx' };
      case 'transporte': return { name: 'Prof. Mario Alberto Torres', email: 'transporte@ibime.edu.mx' };
      case 'control_escolar': return { name: 'Lic. Rebeca Sánchez', email: 'control.escolar@ibime.edu.mx' };
      case 'medico': return { name: 'Dra. Andrea Palacios', email: 'enfermeria@ibime.edu.mx' };
      case 'academico': return { name: 'Mtra. Sofía Villalpando', email: 'academica@ibime.edu.mx' };
      default: return { name: 'Dirección General / CEO', email: 'direccion@ibime.edu.mx' };
    }
  }, [simulatedRole]);

  // Métricas en tiempo real
  const metrics = useMemo(() => {
    return WorkOsService.getDashboardMetrics(tenantId);
  }, [tasks, tenantId]);

  // Actualizar una tarea localmente
  const handleTaskUpdated = (updated: WorkOsTask) => {
    setTasks(prev => {
      const seen = new Set<string>();
      return prev
        .map(t => t.id === updated.id ? updated : t)
        .filter(t => {
          if (!t || !t.id || seen.has(t.id)) return false;
          seen.add(t.id);
          return true;
        });
    });
  };

  // Abrir tarea y registrar apertura
  const handleOpenTask = (task: WorkOsTask) => {
    WorkOsService.markTaskOpened(tenantId, task.id, simulatedRole === 'ceo' ? 'Dirección General' : task.primaryAssignee.name);
    setSelectedTaskForModal(task);
  };

  // Drag and Drop en Tablero Kanban
  const handleDragStart = (e: React.DragEvent, task: WorkOsTask) => {
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(task.id);
  };

  const handleDragOver = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColId !== colId) {
      setDragOverColId(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    if (e.currentTarget === e.target && dragOverColId === colId) {
      setDragOverColId(null);
    }
  };

  const handleDropOnColumn = (
    e: React.DragEvent,
    targetColId: 'URGENTE' | 'PENDIENTE' | 'EN_PROCESO' | 'ESCALADO_CEO' | 'RESUELTO',
    colLabel: string
  ) => {
    e.preventDefault();
    setDragOverColId(null);

    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    setDraggedTaskId(null);

    if (!taskId) return;

    const target = tasks.find(t => t.id === taskId);
    if (!target) return;

    // Verificar si ya se encuentra en este segmento
    const colDefinition = [
      { id: 'URGENTE', matchStatus: ['URGENTE', 'NO_ATENDIDO'] },
      { id: 'PENDIENTE', matchStatus: ['PENDIENTE'] },
      { id: 'EN_PROCESO', matchStatus: ['EN_PROCESO'] },
      { id: 'ESCALADO_CEO', matchStatus: ['ESCALADO_CEO'] },
      { id: 'RESUELTO', matchStatus: ['RESUELTO'] }
    ].find(c => c.id === targetColId);

    if (colDefinition && colDefinition.matchStatus.includes(target.status)) {
      return;
    }

    // Regla obligatoria: si se pasa de Urgente o No Atendido a Recién Delegados,
    // se debe abrir el pop-up que pide a quién debe ser delegado
    if (targetColId === 'PENDIENTE' && (target.status === 'URGENTE' || target.status === 'NO_ATENDIDO')) {
      setReassigningTask(target);
      return;
    }

    // Mover expediente y actualizar porcentaje automáticamente
    const res = WorkOsService.moveTaskKanbanSegment(
      tenantId,
      taskId,
      targetColId,
      simulatedRole === 'ceo' ? 'Dirección General / CEO' : target.primaryAssignee.name,
      currentUserEmail || 'direccion@ibime.edu.mx'
    );

    if (res.success && res.task) {
      const updated = res.task;
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      onTriggerToast(`✅ Expediente ${updated.matterCode} movido a ${colLabel} · Avance ajustado al ${updated.progressPercent}%.`);
    } else if (res.requiresReassignmentModal && res.task) {
      setReassigningTask(res.task);
    }
  };

  // Confirmar reasignación desde el pop-up modal
  const handleConfirmReassign = (params: {
    newAssigneeName: string;
    newAssigneeEmail: string;
    newAssigneeRole: string;
    sectionKey: string;
    sectionName: string;
    slaHours: number;
    delegationNotes?: string;
  }) => {
    if (!reassigningTask) return;

    const res = WorkOsService.reassignTask(tenantId, reassigningTask.id, {
      ...params,
      reassignedByName: simulatedRole === 'ceo' ? 'Dirección General / CEO' : 'Coordinación',
      reassignedByEmail: currentUserEmail || 'direccion@ibime.edu.mx'
    });

    if (res.success && res.task) {
      const updated = res.task;
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
      onTriggerToast(`✅ Expediente ${updated.matterCode} reasignado a ${params.newAssigneeName} (${params.sectionName}) y transferido a Recién Delegados (0%).`);
    }

    setReassigningTask(null);
  };

  // Todas las evidencias recopiladas (Bóveda Central de Evidencias con claves únicas garantizadas)
  const allEvidenceDocs = useMemo(() => {
    const list: (WorkOsEvidenceDoc & { matterCode: string; taskTitle: string; task: WorkOsTask })[] = [];
    const seen = new Set<string>();
    for (const t of tasks) {
      for (const ev of t.evidenceDocs) {
        const uniqueKey = `${t.id}-${ev.id}`;
        if (!seen.has(uniqueKey)) {
          seen.add(uniqueKey);
          list.push({
            ...ev,
            id: uniqueKey,
            matterCode: t.matterCode,
            taskTitle: t.title,
            task: t
          });
        }
      }
    }
    return list;
  }, [tasks]);

  return (
    <div className="space-y-6">

      {/* ========================================================= */}
      {/* 1. BARRA SUPERIOR DE CONTROL WORK OS                      */}
      {/* ========================================================= */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl border border-indigo-900/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Layers className="h-5 w-5" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Work OS Institucional · Ecosistema de Trabajo Colaborativo
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/40">
              v3.2 Cloud Work OS
            </span>
          </div>
          <p className="text-xs text-indigo-200/80 max-w-2xl leading-relaxed">
            Plataforma visual para planificar, ejecutar y supervisar expedientes, tareas delegadas y acuerdos escolares con trazabilidad de minutos, SLAs en tiempo real y bóveda de evidencias.
          </p>
        </div>

        {/* Conmutador de Simulación de Rol & Accesos Rápidos */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-2xl border border-white/10 text-xs">
            <span className="text-[11px] text-indigo-200 font-bold">Vista de Operación:</span>
            <select
              value={simulatedRole}
              onChange={(e) => setSimulatedRole(e.target.value as any)}
              className="bg-slate-900 text-white rounded-xl px-2.5 py-1 text-xs font-bold border border-indigo-500/40 focus:outline-none cursor-pointer"
            >
              <option value="ceo">👑 Dirección General / CEO (Global)</option>
              <option value="finanzas">👤 C.P. Claudia Albarrán (Cobranza)</option>
              <option value="transporte">👤 Prof. Mario Torres (Transporte)</option>
              <option value="control_escolar">👤 Lic. Rebeca Sánchez (Control Escolar)</option>
              <option value="medico">👤 Dra. Andrea Palacios (Salud Escolar)</option>
              <option value="academico">👤 Mtra. Sofía Villalpando (Académica)</option>
            </select>
          </div>

          <button
            onClick={() => setShowSeedConfig(!showSeedConfig)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
              showSeedConfig
                ? 'bg-amber-400 text-amber-950 font-black'
                : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>{showSeedConfig ? 'Ver Tableros Work OS' : 'Configurar Seeds & SLAs'}</span>
          </button>
        </div>
      </div>

      {/* Si está activo el panel de configuración de seeds */}
      {showSeedConfig ? (
        <div className="animate-in fade-in duration-150">
          <SeedAccountsConfigPanel
            tenantId={tenantId}
            isCeo={simulatedRole === 'ceo' || initialIsCeo}
            onScenarioInjected={(newTask) => {
              setTasks(prev => [newTask, ...prev]);
              setShowSeedConfig(false);
              setViewMode('table');
            }}
            onTriggerToast={onTriggerToast}
          />
        </div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* 2. SELECTOR DE VISTAS (TABLA, KANBAN, GANTT, DASHBOARD...) */}
          {/* ========================================================= */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="flex flex-wrap items-center gap-1">
              {[
                { id: 'table', label: 'Tabla Visual', icon: Table },
                { id: 'kanban', label: 'Tablero Kanban', icon: Kanban },
                { id: 'gantt', label: 'Cronograma Gantt', icon: Calendar },
                { id: 'timeline', label: 'Línea de Tiempo', icon: Clock },
                { id: 'automations', label: 'Automatizaciones', icon: Zap },
                { id: 'dashboard', label: 'Métricas & Dashboard', icon: BarChart3 },
                { id: 'evidence_vault', label: `Bóveda Evidencias (${allEvidenceDocs.length})`, icon: Paperclip },
                { id: 'ai_studio', label: 'Asistente IA', icon: Sparkles }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = viewMode === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setViewMode(tab.id as WorkOsViewMode)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 shadow-xs border border-slate-200 dark:border-slate-700 font-black'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Contador de casos activos */}
            <div className="flex items-center gap-2 pr-2 text-xs font-mono text-slate-500">
              <span className="font-bold text-slate-800 dark:text-slate-200">{filteredTasks.length}</span>
              <span>expedientes</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* 3. FILTROS Y BÚSQUEDA                                     */}
          {/* ========================================================= */}
          {(viewMode === 'table' || viewMode === 'kanban' || viewMode === 'gantt' || viewMode === 'timeline') && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
                {/* Buscador */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar por código, título, responsable o palabras clave..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
                  />
                </div>

                {/* Filtro Estado */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">📋 Todos los Estados</option>
                  <option value="URGENTE">🔥 Urgentes</option>
                  <option value="NO_ATENDIDO">⚠️ No Atendidos</option>
                  <option value="EN_PROCESO">🔄 En Proceso</option>
                  <option value="PENDIENTE">⏳ Pendientes</option>
                  <option value="RESUELTO">✅ Resueltos (100%)</option>
                  <option value="ESCALADO_CEO">🚨 Escalados a CEO</option>
                </select>

                {/* Filtro Sección */}
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer shadow-2xs"
                >
                  <option value="ALL">🏢 Todas las Secciones</option>
                  <option value="cobranza">Cobranza y Finanzas</option>
                  <option value="transporte">Logística y Prefectura</option>
                  <option value="control_escolar">Control Escolar</option>
                  <option value="servicio_medico">Servicio Médico</option>
                  <option value="convivencia">Coordinación Académica</option>
                </select>
              </div>

              {/* Botón Inyectar Caso Rápido */}
              <button
                onClick={() => {
                  const scen = WorkOsService.getTestScenarios()[Math.floor(Math.random() * 25)];
                  const t = WorkOsService.injectScenario(tenantId, scen.id);
                  if (t) {
                    setTasks(WorkOsService.getTasks(tenantId));
                    onTriggerToast(`🚀 Caso de prueba inyectado: "${scen.title}"`);
                  }
                }}
                className="px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md shadow-indigo-600/30 hover:scale-102 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Inyectar Caso de Prueba</span>
              </button>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. VISTA 1: TABLA VISUAL (VISUAL BOARD TABLE)             */}
          {/* ========================================================= */}
          {viewMode === 'table' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] tracking-wider">
                      <th className="py-3.5 px-4">Expediente</th>
                      <th className="py-3.5 px-4">Asunto / Tarea</th>
                      <th className="py-3.5 px-4">Departamento</th>
                      <th className="py-3.5 px-4">Responsable(s)</th>
                      <th className="py-3.5 px-4">SLA Restante</th>
                      <th className="py-3.5 px-4">Progreso</th>
                      <th className="py-3.5 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400">
                          <p className="font-bold text-sm">No se encontraron expedientes con los filtros aplicados.</p>
                          <p className="text-xs mt-1">Haga clic en "Inyectar Caso de Prueba" para validar el sistema.</p>
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((t) => {
                        const countdown = WorkOsService.getSlaCountdown(t);
                        const pStyle = WorkOsService.getProgressColor(t.progressPercent);

                        return (
                          <tr
                            key={t.id}
                            onClick={() => handleOpenTask(t)}
                            className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group"
                          >
                            {/* Código */}
                            <td className="py-3.5 px-4 font-mono font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                              {t.matterCode}
                            </td>

                            {/* Título & Estado */}
                            <td className="py-3.5 px-4 max-w-xs sm:max-w-sm">
                              <div className="font-bold text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                {t.title}
                              </div>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                {t.status === 'RESUELTO' && (
                                  <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="h-3 w-3" /> RESUELTO
                                  </span>
                                )}
                                {t.status === 'EN_PROCESO' && (
                                  <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> EN PROCESO
                                  </span>
                                )}
                                {t.status === 'NO_ATENDIDO' && (
                                  <span className="text-[10px] font-black text-rose-600 dark:text-rose-400 flex items-center gap-1 animate-pulse">
                                    <AlertTriangle className="h-3 w-3" /> (NO ATENDIDO)
                                  </span>
                                )}
                                {t.status === 'URGENTE' && (
                                  <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                    <Flame className="h-3 w-3" /> URGENTE
                                  </span>
                                )}
                                {t.status === 'ESCALADO_CEO' && (
                                  <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                    <ShieldCheck className="h-3 w-3" /> ESCALADO A CEO
                                  </span>
                                )}
                                {t.evidenceDocs.length > 0 && (
                                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-0.5">
                                    <Paperclip className="h-2.5 w-2.5" /> {t.evidenceDocs.length}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Sección */}
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                              {t.sectionName}
                            </td>

                            {/* Responsables */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                  {t.primaryAssignee.name.charAt(0)}
                                </div>
                                <span className="font-bold text-slate-800 dark:text-slate-200">
                                  {t.primaryAssignee.name}
                                </span>
                                {t.collaborators.length > 0 && (
                                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                    +{t.collaborators.length}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* SLA Restante */}
                            <td className="py-3.5 px-4 font-mono font-bold whitespace-nowrap">
                              <span className={countdown.isOverdue ? 'text-rose-600 dark:text-rose-400 font-black' : 'text-slate-700 dark:text-slate-300'}>
                                {countdown.remainingFormatted}
                              </span>
                            </td>

                            {/* Barra de Progreso Color-Codificada */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                  <div
                                    className={`h-full ${pStyle.bgClass} transition-all`}
                                    style={{ width: `${t.progressPercent}%` }}
                                  />
                                </div>
                                <span className={`font-mono font-black ${pStyle.textClass}`}>
                                  ({t.progressPercent}%)
                                </span>
                              </div>
                            </td>

                            {/* Acciones */}
                            <td className="py-3.5 px-4 text-right whitespace-nowrap">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenTask(t);
                                }}
                                className="px-3 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold text-[11px] transition-colors"
                              >
                                Ver / Resolver
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. VISTA 2: TABLERO KANBAN DE FLUJO INTERACTIVO CON D&D   */}
          {/* ========================================================= */}
          {viewMode === 'kanban' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { id: 'URGENTE', label: '🔥 Urgentes & No Atendidos', matchStatus: ['URGENTE', 'NO_ATENDIDO'], headerBg: 'bg-rose-50 text-rose-900 border-rose-200' },
                { id: 'PENDIENTE', label: '⏳ Recién Delegados', matchStatus: ['PENDIENTE'], headerBg: 'bg-slate-100 text-slate-800 border-slate-200' },
                { id: 'EN_PROCESO', label: '🔄 En Proceso Activo', matchStatus: ['EN_PROCESO'], headerBg: 'bg-amber-50 text-amber-900 border-amber-200' },
                { id: 'ESCALADO_CEO', label: '🚨 Escalados a CEO', matchStatus: ['ESCALADO_CEO'], headerBg: 'bg-purple-50 text-purple-900 border-purple-200' },
                { id: 'RESUELTO', label: '✅ Resueltos (100%)', matchStatus: ['RESUELTO'], headerBg: 'bg-emerald-50 text-emerald-900 border-emerald-200' }
              ].map((col) => {
                const colTasks = filteredTasks.filter(t => col.matchStatus.includes(t.status));
                const isDragTarget = dragOverColId === col.id;

                return (
                  <div
                    key={col.id}
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDragLeave={(e) => handleDragLeave(e, col.id)}
                    onDrop={(e) => handleDropOnColumn(e, col.id as any, col.label)}
                    className={`flex flex-col rounded-3xl bg-slate-50/80 dark:bg-slate-900/60 border p-3 space-y-3 min-h-[520px] transition-all duration-200 ${
                      isDragTarget
                        ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-50/40 dark:bg-indigo-950/30 scale-[1.01]'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className={`p-2.5 rounded-2xl border font-black text-xs flex items-center justify-between ${col.headerBg}`}>
                      <span>{col.label}</span>
                      <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-[10px]">
                        {colTasks.length}
                      </span>
                    </div>

                    <div className="flex-1 space-y-2.5 overflow-y-auto">
                      {colTasks.length === 0 && (
                        <div className={`h-36 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors ${
                          isDragTarget
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 font-bold text-xs animate-pulse'
                            : 'border-slate-200/80 dark:border-slate-800 text-slate-400 text-xs font-medium'
                        }`}>
                          <p>{isDragTarget ? 'Soltar tarjeta aquí' : 'Sin expedientes en este segmento'}</p>
                          <p className="text-[10px] text-slate-400 mt-1">Arrastre una tarjeta aquí para cambiar estado y porcentaje.</p>
                        </div>
                      )}

                      {colTasks.map((t) => {
                        const countdown = WorkOsService.getSlaCountdown(t);
                        const pStyle = WorkOsService.getProgressColor(t.progressPercent);
                        const isBeingDragged = draggedTaskId === t.id;

                        return (
                          <div
                            key={t.id}
                            draggable={true}
                            onDragStart={(e) => handleDragStart(e, t)}
                            onDragEnd={() => {
                              setDraggedTaskId(null);
                              setDragOverColId(null);
                            }}
                            onClick={() => handleOpenTask(t)}
                            className={`p-3.5 rounded-2xl bg-white dark:bg-slate-800 border shadow-xs hover:shadow-md transition-all cursor-grab active:cursor-grabbing space-y-2 group select-none ${
                              isBeingDragged
                                ? 'opacity-40 scale-95 border-2 border-dashed border-indigo-500 bg-indigo-50/30'
                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:scale-[1.01]'
                            }`}
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <GripVertical className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 transition-colors shrink-0" />
                                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 truncate">
                                  {t.matterCode}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-slate-500 shrink-0">
                                {countdown.remainingFormatted}
                              </span>
                            </div>

                            <h4 className="font-bold text-xs line-clamp-2 text-slate-800 dark:text-slate-100 group-hover:text-indigo-600">
                              {t.title}
                            </h4>

                            {/* Barra de progreso rápida */}
                            <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-700/80 overflow-hidden">
                              <div
                                className={`h-full ${pStyle.bgClass} transition-all duration-300`}
                                style={{ width: `${t.progressPercent}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-700/60">
                              <span className="text-slate-500 truncate max-w-[120px]">
                                {t.primaryAssignee.name}
                              </span>
                              <span className={`font-mono font-black ${pStyle.textClass}`}>
                                ({t.progressPercent}%)
                              </span>
                            </div>

                            {/* Selector rápido para transferir o mover */}
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="pt-1 flex items-center justify-between gap-1 text-[10px]"
                            >
                              <span className="text-slate-400 font-semibold flex items-center gap-0.5">
                                <ArrowRight className="h-3 w-3 text-slate-400" /> Mover:
                              </span>
                              <select
                                value=""
                                onChange={(e) => {
                                  const targetSegment = e.target.value as any;
                                  if (!targetSegment) return;
                                  const colNames: Record<string, string> = {
                                    URGENTE: '🔥 Urgentes & No Atendidos',
                                    PENDIENTE: '⏳ Recién Delegados',
                                    EN_PROCESO: '🔄 En Proceso Activo',
                                    ESCALADO_CEO: '🚨 Escalados a CEO',
                                    RESUELTO: '✅ Resueltos (100%)'
                                  };
                                  if (targetSegment === 'PENDIENTE' && (t.status === 'URGENTE' || t.status === 'NO_ATENDIDO')) {
                                    setReassigningTask(t);
                                    return;
                                  }
                                  const res = WorkOsService.moveTaskKanbanSegment(
                                    tenantId,
                                    t.id,
                                    targetSegment,
                                    simulatedRole === 'ceo' ? 'Dirección General / CEO' : t.primaryAssignee.name,
                                    currentUserEmail || 'direccion@ibime.edu.mx'
                                  );
                                  if (res.success && res.task) {
                                    const updated = res.task;
                                    setTasks(prev => prev.map(item => item.id === updated.id ? updated : item));
                                    onTriggerToast(`✅ Expediente ${updated.matterCode} movido a ${colNames[targetSegment]} · Avance: ${updated.progressPercent}%.`);
                                  } else if (res.requiresReassignmentModal && res.task) {
                                    setReassigningTask(res.task);
                                  }
                                }}
                                className="px-1.5 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold border border-slate-200 dark:border-slate-600 cursor-pointer text-[10px]"
                              >
                                <option value="">Transferir a...</option>
                                <option value="URGENTE">🔥 Urgentes</option>
                                <option value="PENDIENTE">⏳ Recién Delegados</option>
                                <option value="EN_PROCESO">🔄 En Proceso (50%)</option>
                                <option value="ESCALADO_CEO">🚨 Escalar a CEO</option>
                                <option value="RESUELTO">✅ Resuelto (100%)</option>
                              </select>
                            </div>

                            {/* Botón directo de reasignación con pop-up si es caso Urgente o No Atendido */}
                            {(t.status === 'URGENTE' || t.status === 'NO_ATENDIDO') && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setReassigningTask(t);
                                }}
                                className="w-full mt-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[11px] font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                              >
                                <UserCheck className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                                <span>Reasignar a Recién Delegados</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. VISTA 3: CRONOGRAMA GANTT INTERACTIVO                  */}
          {/* ========================================================= */}
          {viewMode === 'gantt' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                    Cronograma Gantt de Plazos y Vencimientos SLA
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Proyección visual de plazos de atención y cumplimiento horario por departamento.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Resuelto
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> En Proceso
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Urgente
                </div>
              </div>

              {/* Barras de Gantt simuladas de alta fidelidad */}
              <div className="space-y-3 pt-2">
                {filteredTasks.slice(0, 10).map((t, idx) => {
                  const pStyle = WorkOsService.getProgressColor(t.progressPercent);
                  const widthPercent = Math.min(100, Math.max(25, (t.slaHours / 72) * 100));

                  return (
                    <div key={t.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-md">
                          {t.matterCode} · {t.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-500">
                          SLA: {t.slaHours}h · {t.primaryAssignee.name}
                        </span>
                      </div>
                      <div className="w-full h-6 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden relative p-1 flex items-center">
                        <div
                          className={`h-full rounded-lg ${pStyle.bgClass} flex items-center justify-between px-2 text-[10px] text-white font-black shadow-xs`}
                          style={{ width: `${widthPercent}%` }}
                        >
                          <span className="truncate">{t.sectionName}</span>
                          <span>{t.progressPercent}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. VISTA 4: LÍNEA DE TIEMPO (TIMELINE)                     */}
          {/* ========================================================= */}
          {viewMode === 'timeline' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                Flujo Cronológico de Hitos, Citas y Acuerdos
              </h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:left-4 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-2">
                {filteredTasks.map((t) => (
                  <div key={t.id} className="relative flex items-start gap-4 pl-8">
                    <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-xs" />
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">{t.matterCode}</span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(t.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-100">{t.title}</h4>
                      <p className="text-slate-600 dark:text-slate-300">{t.description}</p>
                      {t.scheduledAppointment && (
                        <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1.5 mt-2">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>Cita agendada: {t.scheduledAppointment.date} · {t.scheduledAppointment.notes}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. VISTA 5: ESTUDIO DE AUTOMATIZACIONES                   */}
          {/* ========================================================= */}
          {viewMode === 'automations' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Motor de Automatizaciones Institucionales</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Reglas inteligentes que ejecutan asignaciones, envían recordatorios y marcan casos automáticamente sin intervención manual.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WorkOsService.getAutomations(tenantId).map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <strong className="text-xs font-black text-slate-800 dark:text-slate-100">{rule.name}</strong>
                        <button
                          onClick={() => {
                            WorkOsService.toggleAutomationRule(tenantId, rule.id);
                            setTasks([...tasks]); // Forzar re-render
                            onTriggerToast(`Regla ${rule.enabled ? 'desactivada' : 'activada'}.`);
                          }}
                          className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                            rule.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        >
                          <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${
                            rule.enabled ? 'right-1' : 'left-1'
                          }`} />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {rule.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Ejecutada {rule.executionsCount} veces</span>
                      <span>Disparador: {rule.trigger}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. VISTA 6: DASHBOARD EJECUTIVO Y MÉTRICAS                */}
          {/* ========================================================= */}
          {viewMode === 'dashboard' && (
            <div className="space-y-6">
              {/* Tarjetas KPI */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Total Expedientes</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{metrics.totalTasks}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500 block">Resueltos (100%)</span>
                  <span className="text-2xl font-black text-emerald-600">{metrics.resolvedTasks}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-500 block">En Proceso</span>
                  <span className="text-2xl font-black text-amber-600">{metrics.inProgressTasks}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 block">No Atendidos</span>
                  <span className="text-2xl font-black text-rose-600">{metrics.noAtendidoTasks}</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 block">Cumplimiento SLA</span>
                  <span className="text-2xl font-black text-indigo-600">{metrics.slaComplianceRate}%</span>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-500 block">Tiempo Promedio</span>
                  <span className="text-2xl font-black text-purple-600">{metrics.avgResolutionHours}h</span>
                </div>
              </div>

              {/* Distribución por Departamento */}
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-slate-100">
                  Carga Operativa por Departamento / Cuenta Seed
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  {Object.entries(metrics.tasksPerSeed).map(([dept, count]) => (
                    <div key={dept} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                      <strong className="block text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{dept}</strong>
                      <span className="text-xl font-black text-indigo-600 mt-1 block">{count} casos</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. VISTA 7: BÓVEDA CENTRAL DE EVIDENCIAS                  */}
          {/* ========================================================= */}
          {viewMode === 'evidence_vault' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-indigo-600" />
                    <span>Bóveda Central de Evidencias y Documentos Probatorios</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Repositorio institucional compartido entre Dirección General y los delegados responsables.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-xl">
                  {allEvidenceDocs.length} Archivos Almacenados
                </span>
              </div>

              {allEvidenceDocs.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="font-bold text-sm">Aún no se han adjuntado documentos o evidencias.</p>
                  <p className="text-xs mt-1">Al marcar tareas como en proceso o resueltas, los documentos aparecerán aquí automáticamente.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {allEvidenceDocs.map((doc) => {
                    const taskStatus = doc.task?.status || 'EN_PROCESO';
                    const progress = doc.task?.progressPercent ?? (taskStatus === 'RESUELTO' ? 100 : 50);

                    return (
                      <div
                        key={doc.id}
                        onClick={() => setSelectedEvidenceForPreview(doc)}
                        className="p-4 rounded-2xl bg-slate-50 hover:bg-slate-100/90 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2.5 rounded-xl bg-indigo-100 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 transition-colors shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 block truncate">
                                {doc.matterCode}
                              </span>
                              {/* Badge Oficial de Estado del Caso */}
                              {taskStatus === 'RESUELTO' && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 shrink-0">
                                  ✓ Resuelto (100%)
                                </span>
                              )}
                              {taskStatus === 'EN_PROCESO' && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 shrink-0">
                                  ⏱ En Proceso ({progress}%)
                                </span>
                              )}
                              {taskStatus === 'URGENTE' && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 shrink-0">
                                  🔥 Urgente
                                </span>
                              )}
                              {taskStatus === 'PENDIENTE' && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 shrink-0">
                                  Recién Delegado
                                </span>
                              )}
                              {taskStatus === 'ESCALADO_CEO' && (
                                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 shrink-0">
                                  Escalado CEO
                                </span>
                              )}
                            </div>

                            <strong className="block text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                              {doc.fileName}
                            </strong>
                            <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                              {doc.taskTitle}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate mr-2">Subido por: <strong className="text-slate-600 dark:text-slate-300">{doc.uploadedBy}</strong></span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvidenceForPreview(doc);
                              }}
                              className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 font-bold text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                              title="Ver vista previa detallada del caso y documento"
                            >
                              <Eye className="h-3 w-3" />
                              <span>Vista Previa</span>
                            </button>
                            {doc.dataUrl && (
                              <a
                                href={doc.dataUrl}
                                download={doc.fileName}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                                title="Descargar evidencia"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* 11. VISTA 8: ASISTENTE DE IA PEDAGÓGICA                   */}
          {/* ========================================================= */}
          {viewMode === 'ai_studio' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      Motor de Inteligencia Artificial Pedagógica & Triage Cognitivo
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        Autónomo
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Selecciona una tarjeta para ajustar parámetros, calibrar respuestas institucionales o navegar a sus herramientas.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-medium">Bóveda Activa:</span>
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-[11px] border border-slate-200 dark:border-slate-700">
                    {tenantId.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* 3 TARJETAS PRINCIPALES INTERACTIVAS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* TARJETA 1: REDACCIÓN INTELIGENTE */}
                <div
                  id="card-ai-drafting"
                  onClick={() => setSelectedAiFeature('drafting')}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    selectedAiFeature === 'drafting'
                      ? 'bg-gradient-to-br from-indigo-50/90 via-white to-indigo-50/40 dark:from-indigo-950/50 dark:via-slate-900 dark:to-indigo-950/20 border-indigo-500 dark:border-indigo-500 shadow-md ring-2 ring-indigo-500/20 scale-[1.01]'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl transition-colors ${
                          selectedAiFeature === 'drafting'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white'
                        }`}>
                          <Wand2 className="h-4 w-4" />
                        </div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          Redacción Inteligente
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                        selectedAiFeature === 'drafting'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-700 dark:group-hover:bg-indigo-950/80 dark:group-hover:text-indigo-300'
                      }`}>
                        {selectedAiFeature === 'drafting' ? (
                          <>
                            <Check className="h-3 w-3" />
                            Ajustes Activos
                          </>
                        ) : (
                          <>
                            Configurar
                            <ChevronRight className="h-3 w-3" />
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Genera borradores institucionales con tono formal, empático y orientado a solución para padres y tutores.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-4">
                    <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                      <Sliders className="h-3 w-3" />
                      Ajustar Parámetros
                    </span>
                    <button
                      type="button"
                      id="btn-goto-redactar"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onNavigateTab) {
                          onNavigateTab('redactar');
                        } else {
                          onTriggerToast('Navegando a Redactar Comunicado...');
                        }
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-600 hover:text-white text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-all flex items-center gap-1 cursor-pointer"
                      title="Abrir Redactor Oficial de Comunicados"
                    >
                      <span>Ir a Redactor</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* TARJETA 2: RESÚMENES EJECUTIVOS */}
                <div
                  id="card-ai-summaries"
                  onClick={() => setSelectedAiFeature('summaries')}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    selectedAiFeature === 'summaries'
                      ? 'bg-gradient-to-br from-purple-50/90 via-white to-purple-50/40 dark:from-purple-950/50 dark:via-slate-900 dark:to-purple-950/20 border-purple-500 dark:border-purple-500 shadow-md ring-2 ring-purple-500/20 scale-[1.01]'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl transition-colors ${
                          selectedAiFeature === 'summaries'
                            ? 'bg-purple-600 text-white'
                            : 'bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 group-hover:bg-purple-600 group-hover:text-white'
                        }`}>
                          <FileText className="h-4 w-4" />
                        </div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          Resúmenes Ejecutivos
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                        selectedAiFeature === 'summaries'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-purple-100 group-hover:text-purple-700 dark:group-hover:bg-purple-950/80 dark:group-hover:text-purple-300'
                      }`}>
                        {selectedAiFeature === 'summaries' ? (
                          <>
                            <Check className="h-3 w-3" />
                            Ajustes Activos
                          </>
                        ) : (
                          <>
                            Configurar
                            <ChevronRight className="h-3 w-3" />
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Sintetiza cadenas largas de correos electrónicos en expedientes con puntos clave y acciones prioritarias.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-4">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                      <Sliders className="h-3 w-3" />
                      Ajustar Parámetros
                    </span>
                    <button
                      type="button"
                      id="btn-goto-table"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewMode('table');
                        onTriggerToast('Cambiando a Vista de Tabla de Expedientes...');
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-600 hover:text-white text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1 cursor-pointer"
                      title="Ver todos los expedientes sintetizados"
                    >
                      <span>Ver Expedientes</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* TARJETA 3: PREDICCIÓN DE RIESGO SLA */}
                <div
                  id="card-ai-sla-risk"
                  onClick={() => setSelectedAiFeature('sla_risk')}
                  className={`group relative p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    selectedAiFeature === 'sla_risk'
                      ? 'bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 dark:from-emerald-950/50 dark:via-slate-900 dark:to-emerald-950/20 border-emerald-500 dark:border-emerald-500 shadow-md ring-2 ring-emerald-500/20 scale-[1.01]'
                      : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl transition-colors ${
                          selectedAiFeature === 'sla_risk'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 group-hover:bg-emerald-600 group-hover:text-white'
                        }`}>
                          <ShieldAlert className="h-4 w-4" />
                        </div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                          Predicción de Riesgo SLA
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 transition-all ${
                        selectedAiFeature === 'sla_risk'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 dark:group-hover:bg-emerald-950/80 dark:group-hover:text-emerald-300'
                      }`}>
                        {selectedAiFeature === 'sla_risk' ? (
                          <>
                            <Check className="h-3 w-3" />
                            Ajustes Activos
                          </>
                        ) : (
                          <>
                            Configurar
                            <ChevronRight className="h-3 w-3" />
                          </>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      Detecta casos con probabilidad de vencimiento y sugiere reasignación anticipada de recursos.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 mt-4">
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Sliders className="h-3 w-3" />
                      Ajustar Umbrales
                    </span>
                    <button
                      type="button"
                      id="btn-goto-seeds"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowSeedConfig(true);
                      }}
                      className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all flex items-center gap-1 cursor-pointer"
                      title="Configurar Cuentas Semilla y SLAs Departamentales"
                    >
                      <span>Configurar SLAs</span>
                      <Settings className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* ========================================================= */}
              {/* PANEL DE CONFIGURACIÓN & OPERACIÓN SEGÚN TARJETA ACTIVA   */}
              {/* ========================================================= */}
              <div className="mt-4 p-5 rounded-3xl bg-slate-50/80 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 shadow-inner space-y-5">
                {/* Encabezado del Panel Activo */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">Panel de Ajustes:</span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {selectedAiFeature === 'drafting' && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                          Configuración y Parámetros de Redacción Inteligente
                        </>
                      )}
                      {selectedAiFeature === 'summaries' && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                          Configuración y Reglas de Resúmenes Ejecutivos
                        </>
                      )}
                      {selectedAiFeature === 'sla_risk' && (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                          Umbrales y Políticas de Predicción de Riesgo SLA
                        </>
                      )}
                    </h4>
                  </div>

                  {/* Selector rápido entre las 3 opciones */}
                  <div className="flex items-center bg-white dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      type="button"
                      id="pill-switch-drafting"
                      onClick={() => setSelectedAiFeature('drafting')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        selectedAiFeature === 'drafting'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Redacción
                    </button>
                    <button
                      type="button"
                      id="pill-switch-summaries"
                      onClick={() => setSelectedAiFeature('summaries')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        selectedAiFeature === 'summaries'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Resúmenes
                    </button>
                    <button
                      type="button"
                      id="pill-switch-sla"
                      onClick={() => setSelectedAiFeature('sla_risk')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer ${
                        selectedAiFeature === 'sla_risk'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Riesgo SLA
                    </button>
                  </div>
                </div>

                {/* CONTENIDO 1: REDACCIÓN INTELIGENTE */}
                {selectedAiFeature === 'drafting' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Columna Izquierda: Tono y Audiencia */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                            Tono de Respuesta Institucional
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { id: 'formal_empathetic', label: 'Formal y Empático', desc: 'Estándar institucional con calidez' },
                              { id: 'resolutive_concise', label: 'Resolutivo y Conciso', desc: 'Acciones directas y plazos' },
                              { id: 'urgent_firm', label: 'Urgente y Asertivo', desc: 'Cobranza o incidentes críticos' },
                              { id: 'pedagogic_close', label: 'Pedagógico y Cercano', desc: 'Acompañamiento a padres' }
                            ].map((tone) => (
                              <button
                                key={tone.id}
                                type="button"
                                onClick={() => setDraftingTone(tone.id as any)}
                                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                                  draftingTone === tone.id
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                                }`}
                              >
                                <div className="font-bold text-xs">{tone.label}</div>
                                <div className={`text-[10px] mt-0.5 leading-snug ${
                                  draftingTone === tone.id ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  {tone.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                            Audiencia Predeterminada
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {[
                              { id: 'parents', label: '👨‍👩‍👧 Padres y Tutores' },
                              { id: 'students', label: '🎒 Alumnos' },
                              { id: 'teachers', label: '👩‍🏫 Docentes' },
                              { id: 'authorities', label: '🏛️ Autoridades SEP' }
                            ].map((aud) => (
                              <button
                                key={aud.id}
                                type="button"
                                onClick={() => setDraftingAudience(aud.id as any)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                                  draftingAudience === aud.id
                                    ? 'bg-indigo-500 text-white border-indigo-500 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400'
                                }`}
                              >
                                {aud.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Switches de Control Institucional */}
                        <div className="space-y-2 pt-2">
                          <label className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoIncludeSignature}
                              onChange={(e) => setAutoIncludeSignature(e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Firma Institucional & Folio de Trazabilidad</span>
                              <span className="text-[11px] text-slate-500">Incluye pie oficial del colegio y código de expediente único.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={whiteLabelShield}
                              onChange={(e) => setWhiteLabelShield(e.target.checked)}
                              className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Blindaje de Marca Blanca Estricto</span>
                              <span className="text-[11px] text-slate-500">Omite marcas externas y asegura lenguaje institucional pedagógico.</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      {/* Columna Derecha: Probador / Simulador en Vivo con Tokens Reales y Bóveda */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                              Simulador en Vivo de Redacción
                            </span>
                            <div className="flex items-center gap-2">
                              {isCheckingVault && (
                                <span className="text-[10px] text-amber-500 flex items-center gap-1">
                                  <RefreshCw className="h-2.5 w-2.5 animate-spin" />
                                  Bóveda...
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  fetchVaultDrafts();
                                  setShowVaultListModal(true);
                                }}
                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 flex items-center gap-1 transition-colors cursor-pointer"
                                title="Ver todos los borradores almacenados en la Bóveda Curricular"
                              >
                                <History className="h-3 w-3" />
                                <span>Ver Bóveda</span>
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <input
                              type="text"
                              value={simulatedDraftSubject}
                              onChange={(e) => setSimulatedDraftSubject(e.target.value)}
                              placeholder="Ej. Voluntarios para festival de navidad..."
                              className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />

                            {/* Alerta Proactiva: Consulta similar en Bóveda Curricular (Vault-First) */}
                            {vaultDraftMatch && (
                              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 text-[11px]">
                                    <Database className="h-3.5 w-3.5 text-emerald-600" />
                                    Borrador similar en Bóveda Curricular
                                  </span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-800 dark:text-emerald-200 font-bold">
                                    {vaultDraftMatch.folio}
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-700 dark:text-slate-300 line-clamp-1 italic">
                                  "{vaultDraftMatch.subject}"
                                </div>
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-500/20">
                                  <button
                                    type="button"
                                    onClick={() => handleLoadFromVault()}
                                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                                  >
                                    <Zap className="h-3 w-3" />
                                    <span>Cargar de Bóveda (0 Tokens)</span>
                                  </button>
                                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    Ahorro de ~{vaultDraftMatch.tokensUsed?.totalTokens || 450} tokens
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <button
                              type="button"
                              id="btn-simulate-draft"
                              onClick={() => handleGenerateDraftWithTokens(true)}
                              disabled={isGeneratingDraft}
                              className="w-full py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                              {isGeneratingDraft ? (
                                <>
                                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                  <span>Conectando con Motor IA (Tokens Reales)...</span>
                                </>
                              ) : (
                                <>
                                  <Coins className="h-3.5 w-3.5 text-amber-300" />
                                  <span>{vaultDraftMatch ? 'Regenerar con IA (Tokens Reales)' : 'Generar con IA (Tokens Reales)'}</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Telemetría y Badge de Consumo de Tokens */}
                          {lastDraftMetadata && (
                            <div className="mt-2.5 animate-in fade-in">
                              {lastDraftMetadata.fromVault ? (
                                <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono space-y-1">
                                  <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-300 font-bold">
                                    <span className="flex items-center gap-1.5">
                                      <Zap className="h-3.5 w-3.5 text-emerald-600" />
                                      Recuperado de Bóveda Curricular
                                    </span>
                                    <span>0 Tokens Consumidos</span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                    <span>Ahorro efectivo: ~{lastDraftMetadata.tokensUsed?.savedTokens || 450} tokens</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400">{lastDraftMetadata.folio}</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs font-mono space-y-1">
                                  <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-200 font-bold">
                                    <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                                      Tokens Reales: {lastDraftMetadata.tokensUsed?.totalTokens}
                                    </span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                                      ≈ ${lastDraftMetadata.tokensUsed?.costMxn} MXN
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                    <span>In: {lastDraftMetadata.tokensUsed?.promptTokens} | Out: {lastDraftMetadata.tokensUsed?.candidatesTokens}</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-300">🏛️ Bóveda: {lastDraftMetadata.folio}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {simulatedDraftOutput && (
                            <div className="mt-3 relative">
                              <pre className="p-3 rounded-xl bg-slate-900 text-indigo-200 text-[11px] leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto border border-indigo-950">
                                {simulatedDraftOutput}
                              </pre>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(simulatedDraftOutput);
                                  onTriggerToast('Borrador copiado al portapapeles.');
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                                title="Copiar borrador"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Botones de acción del panel */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            id="btn-save-drafting"
                            onClick={handleSaveDraftingSettings}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Guardar Ajustes de Redacción</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateTab) onNavigateTab('redactar');
                                else onTriggerToast('Abriendo Redactor...');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Ir a Redactar</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateTab) onNavigateTab('ajustes');
                                else onTriggerToast('Abriendo Ajustes Ejecutivos...');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Settings className="h-3 w-3" />
                              <span>Ajustes Generales</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENIDO 2: RESÚMENES EJECUTIVOS */}
                {selectedAiFeature === 'summaries' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Opciones de Formato y Profundidad */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                            Formato de Síntesis del Expediente
                          </label>
                          <div className="space-y-2">
                            {[
                              { id: 'bullets', label: 'Viñetas Ejecutivas (3 a 5 puntos)', desc: 'Extracción directa de hechos, solicitante y estado actual.' },
                              { id: 'matrix', label: 'Matriz Causa - Impacto - Acción', desc: 'Tabla relacional con antecedentes, gravedad y siguiente responsable.' },
                              { id: 'narrative', label: 'Resumen Narrativo Ejecutivo', desc: 'Párrafo fluido orientado a lectura rápida de Dirección General.' }
                            ].map((fmt) => (
                              <button
                                key={fmt.id}
                                type="button"
                                onClick={() => setSummaryFormat(fmt.id as any)}
                                className={`w-full p-3 rounded-2xl text-left border transition-all cursor-pointer ${
                                  summaryFormat === fmt.id
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400'
                                }`}
                              >
                                <div className="font-bold text-xs">{fmt.label}</div>
                                <div className={`text-[11px] mt-0.5 ${
                                  summaryFormat === fmt.id ? 'text-purple-100' : 'text-slate-500 dark:text-slate-400'
                                }`}>
                                  {fmt.desc}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                            Nivel de Detalle del Resumen
                          </label>
                          <div className="flex gap-2">
                            {[
                              { id: 'compact', label: '⚡ Ultra-Compacto' },
                              { id: 'detailed', label: '📋 Detallado' },
                              { id: 'comprehensive', label: '📚 Historial Integral' }
                            ].map((dp) => (
                              <button
                                key={dp.id}
                                type="button"
                                onClick={() => setSummaryDepth(dp.id as any)}
                                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                  summaryDepth === dp.id
                                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-purple-400'
                                }`}
                              >
                                {dp.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Reglas de Extracción y Métricas */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Reglas de Extracción Cognitiva
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={extractAgreementsDates}
                              onChange={(e) => setExtractAgreementsDates(e.target.checked)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Detección de Fechas Límite y Compromisos</span>
                              <span className="text-[11px] text-slate-500">Extrae automáticamente plazos mencionados en el cuerpo del correo.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={sentimentDetection}
                              onChange={(e) => setSentimentDetection(e.target.checked)}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Detección de Tono de Urgencia & Frustración</span>
                              <span className="text-[11px] text-slate-500">Alerta de inmediato si un padre de familia manifiesta molestia reiterada.</span>
                            </div>
                          </label>

                          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 text-xs space-y-1">
                            <div className="font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                              <Bot className="h-4 w-4" />
                              Sincronización con la Bóveda Curricular
                            </div>
                            <p className="text-[11px] text-purple-800 dark:text-purple-300">
                              Cada síntesis generada se indexa en tiempo real con enlaces bidireccionales en el árbol institucional de expedientes.
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción del panel */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            id="btn-save-summaries"
                            onClick={handleSaveSummarySettings}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Guardar Parámetros de Síntesis</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setViewMode('table');
                                onTriggerToast('Abriendo Tabla Visual de Expedientes...');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Table className="h-3 w-3" />
                              <span>Ver Expedientes</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (onNavigateTab) onNavigateTab('delegados');
                                else onTriggerToast('Abriendo Asuntos Delegados...');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <span>Asuntos Delegados</span>
                              <ArrowRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENIDO 3: PREDICCIÓN DE RIESGO SLA */}
                {selectedAiFeature === 'sla_risk' && (
                  <div className="space-y-5 animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Umbrales de advertencia */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                            Umbral de Alerta Preventiva de SLA (% Consumido)
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {[60, 70, 75, 85].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setSlaWarningThreshold(pct)}
                                className={`py-2 px-3 rounded-xl text-center border font-mono font-bold text-xs transition-all cursor-pointer ${
                                  slaWarningThreshold === pct
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            Al transcurrir el {slaWarningThreshold}% del tiempo de SLA sin respuesta, el expediente se clasifica en amarillo preventivo.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                            Ventana Crítica de Escalamiento a CEO
                          </label>
                          <div className="flex gap-2">
                            {[
                              { hours: 6, label: '⏱️ 6 horas antes' },
                              { hours: 12, label: '⏱️ 12 horas antes' },
                              { hours: 24, label: '⏱️ 24 horas antes' }
                            ].map((w) => (
                              <button
                                key={w.hours}
                                type="button"
                                onClick={() => setSlaEscalateHours(w.hours)}
                                className={`flex-1 py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                                  slaEscalateHours === w.hours
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400'
                                }`}
                              >
                                {w.label}
                              </button>
                            ))}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5">
                            Si faltan menos de {slaEscalateHours} horas para el límite, se eleva la prioridad al radar ejecutivo de Dirección General.
                          </p>
                        </div>
                      </div>

                      {/* Switches y Automatizaciones */}
                      <div className="space-y-4 flex flex-col justify-between">
                        <div className="space-y-3">
                          <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                            Políticas Automáticas de Escalamiento
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={autoEscalateCeo}
                              onChange={(e) => setAutoEscalateCeo(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Auto-Escalamiento a Dirección General</span>
                              <span className="text-[11px] text-slate-500">Mover automáticamente a columna 'Escalado CEO' si el delegado no responde.</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={notifySeedDelegates}
                              onChange={(e) => setNotifySeedDelegates(e.target.checked)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                            />
                            <div className="text-xs">
                              <span className="font-bold text-slate-800 dark:text-slate-200 block">Notificar a Cuentas Semilla Departamentales</span>
                              <span className="text-[11px] text-slate-500">Envía alertas a Cobranza, Transporte o Control Escolar antes del vencimiento.</span>
                            </div>
                          </label>

                          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1">
                            <div className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                              <ShieldCheck className="h-4 w-4" />
                              Garantía de Cero Desatención Institucional
                            </div>
                            <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                              El sistema ejecuta una auditoría de inactividad cada 60 segundos, reclasificando casos sin abrir como 'NO ATENDIDO'.
                            </p>
                          </div>
                        </div>

                        {/* Botones de acción del panel */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                          <button
                            type="button"
                            id="btn-save-sla-settings"
                            onClick={handleSaveSlaSettings}
                            className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Guardar Umbrales de SLA</span>
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setShowSeedConfig(true)}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700 hover:bg-amber-100 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Settings className="h-3 w-3" />
                              <span>Configurar Cuentas Semilla & SLAs</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setViewMode('kanban');
                                setStatusFilter('URGENT');
                                onTriggerToast('Mostrando casos urgentes en Tablero Kanban...');
                              }}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-200 transition-all flex items-center gap-1 cursor-pointer"
                            >
                              <Kanban className="h-3 w-3" />
                              <span>Ver Urgentes en Kanban</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de Resolución, Avance, Auditoría y Escalamiento */}
      {selectedTaskForModal && (
        <TaskResolutionModal
          isOpen={Boolean(selectedTaskForModal)}
          onClose={() => setSelectedTaskForModal(null)}
          task={selectedTaskForModal}
          tenantId={tenantId}
          isCeoView={simulatedRole === 'ceo' || initialIsCeo}
          currentUserName={simulatedUser.name}
          currentUserEmail={simulatedUser.email}
          onTaskUpdated={handleTaskUpdated}
          onTriggerToast={onTriggerToast}
        />
      )}

      {/* Modal de Vista Previa de Evidencia con Información del Caso y Estado */}
      {selectedEvidenceForPreview && (
        <EvidencePreviewModal
          isOpen={Boolean(selectedEvidenceForPreview)}
          onClose={() => setSelectedEvidenceForPreview(null)}
          doc={selectedEvidenceForPreview}
          task={selectedEvidenceForPreview.task}
          onOpenFullTask={(task) => {
            setSelectedEvidenceForPreview(null);
            setSelectedTaskForModal(task);
          }}
        />
      )}

      {/* Modal de Historial de Borradores de la Bóveda Curricular */}
      {showVaultListModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Cabecera */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    Bóveda Curricular: Borradores Institucionales
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold font-mono">
                      {vaultDraftsList.length} guardados
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Borradores generados con tokens reales y persistidos en el Segundo Cerebro institucional.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVaultListModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Lista de borradores */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {vaultDraftsList.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <BookOpen className="h-8 w-8 mx-auto opacity-40 text-slate-400" />
                  <p className="text-xs">No hay borradores almacenados aún en la Bóveda Curricular.</p>
                  <p className="text-[11px] text-slate-500">
                    Genera borradores en el simulador para que queden disponibles con 0 tokens en futuras consultas.
                  </p>
                </div>
              ) : (
                vaultDraftsList.map((d: any) => (
                  <div
                    key={d.id || d.folio}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 transition-all space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-black text-xs text-slate-900 dark:text-white line-clamp-1">
                        {d.subject}
                      </span>
                      <div className="flex items-center gap-2 font-mono text-[10px]">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                          {d.folio}
                        </span>
                        <span className="text-slate-400">
                          {d.createdAt ? new Date(d.createdAt).toLocaleDateString() : 'Bóveda'}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span>Audiencia: <strong className="text-slate-700 dark:text-slate-300">{d.audienceLabel || d.audience}</strong></span>
                      <span>·</span>
                      <span>Tono: <strong className="text-slate-700 dark:text-slate-300">{d.toneLabel || d.tone}</strong></span>
                      <span>·</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400">
                        {d.tokensUsed?.totalTokens || 0} tokens reales (~${d.tokensUsed?.costMxn || '0.00'} MXN)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic bg-white dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      {d.content?.slice(0, 180)}...
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Modelo: {d.model || 'Motor IA'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          handleLoadFromVault(d);
                          setShowVaultListModal(false);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                      >
                        <Zap className="h-3 w-3" />
                        <span>Cargar al Simulador (0 Tokens)</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pie del modal */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40 text-xs text-slate-500">
              <span className="text-[11px]">
                💡 Cada borrador reutilizado ahorra 100% de tokens de inferencia.
              </span>
              <button
                type="button"
                onClick={() => setShowVaultListModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-bold transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
