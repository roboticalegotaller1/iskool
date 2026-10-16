"use client";

import React, { useState, useMemo } from 'react';
import {
  WorkOsTask,
  WorkOsChecklistStep,
  WorkOsEvidenceDoc
} from '@/lib/services/workOs/workOsTypes';
import { WorkOsService } from '@/lib/services/workOs/workOsService';
import { EvidencePreviewModal } from './EvidencePreviewModal';
import {
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UploadCloud,
  FileText,
  Calendar,
  CalendarPlus,
  Send,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  Users,
  Paperclip,
  Trash2,
  Eye,
  Download,
  Flame,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Award
} from 'lucide-react';

interface TaskResolutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: WorkOsTask;
  tenantId: string;
  isCeoView: boolean;
  currentUserName: string;
  currentUserEmail: string;
  onTaskUpdated: (updatedTask: WorkOsTask) => void;
  onTriggerToast: (msg: string) => void;
}

export const TaskResolutionModal: React.FC<TaskResolutionModalProps> = ({
  isOpen,
  onClose,
  task,
  tenantId,
  isCeoView,
  currentUserName,
  currentUserEmail,
  onTaskUpdated,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'resolver' | 'en_proceso' | 'auditoria' | 'colaborar' | 'escalar'>(
    task.status === 'RESUELTO' ? 'auditoria' : 'en_proceso'
  );

  // Estados para Resolución (100%)
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolutionAppointmentDate, setResolutionAppointmentDate] = useState('');
  const [resolutionAppointmentNotes, setResolutionAppointmentNotes] = useState('');
  const [resolutionDocs, setResolutionDocs] = useState<{
    fileName: string;
    fileSize: number;
    fileType: 'pdf' | 'jpg' | 'jpeg' | 'doc' | 'docx';
    dataUrl?: string;
    notes?: string;
  }[]>([]);

  // Estados para En Proceso
  const [nextStepsOutline, setNextStepsOutline] = useState(
    task.nextStepsOutline || '1. Verificación documental con el padre de familia\n2. Consulta técnica en sistema escolar\n3. Emisión de dictamen resolutivo'
  );
  const [progressPercent, setProgressPercent] = useState<number>(
    task.progressPercent > 0 && task.progressPercent < 100 ? task.progressPercent : 45
  );
  const [inProgressAppointmentDate, setInProgressAppointmentDate] = useState(
    task.scheduledAppointment?.date || ''
  );
  const [inProgressAppointmentNotes, setInProgressAppointmentNotes] = useState(
    task.scheduledAppointment?.notes || ''
  );
  const [inProgressDocs, setInProgressDocs] = useState<{
    fileName: string;
    fileSize: number;
    fileType: 'pdf' | 'jpg' | 'jpeg' | 'doc' | 'docx';
    dataUrl?: string;
    notes?: string;
  }[]>([]);

  // Estado para Escalar a CEO
  const [escalationReason, setEscalationReason] = useState('');

  // Estado para Colaboración Multi-Persona
  const [newCollabName, setNewCollabName] = useState('');
  const [newCollabEmail, setNewCollabEmail] = useState('');
  const [newCollabRole, setNewCollabRole] = useState('Especialista de Apoyo');

  // Estado para previsualización de documentos adjuntos
  const [previewDoc, setPreviewDoc] = useState<WorkOsEvidenceDoc | null>(null);

  if (!isOpen) return null;

  const countdown = WorkOsService.getSlaCountdown(task);
  const progressStyle = WorkOsService.getProgressColor(
    activeTab === 'resolver' ? 100 : progressPercent
  );

  // Manejo de carga de archivos (PDF, JPG, JPEG, DOC)
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: 'resolver' | 'en_proceso'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase();
      
      let validExt: 'pdf' | 'jpg' | 'jpeg' | 'doc' | 'docx' = 'pdf';
      if (ext === 'jpg' || ext === 'jpeg') validExt = ext;
      else if (ext === 'doc' || ext === 'docx') validExt = ext;
      else validExt = 'pdf';

      const reader = new FileReader();
      reader.onload = (event) => {
        const item = {
          fileName: file.name,
          fileSize: file.size,
          fileType: validExt,
          dataUrl: event.target?.result as string,
          notes: mode === 'resolver' ? 'Evidencia de resolución de caso' : 'Avance documental de seguimiento'
        };

        if (mode === 'resolver') {
          setResolutionDocs(prev => [...prev, item]);
        } else {
          setInProgressDocs(prev => [...prev, item]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 1. Confirmar Resolución (100%)
  const handleConfirmResolution = () => {
    if (!resolutionSummary.trim() || resolutionSummary.trim().length < 10) {
      alert('Por favor redacte una explicación detallada de las acciones realizadas para concluir el caso.');
      return;
    }

    const res = WorkOsService.resolveTask(tenantId, task.id, {
      resolutionSummary,
      authorName: currentUserName || 'Responsable Asignado',
      authorEmail: currentUserEmail || task.primaryAssignee.email,
      appointmentDate: resolutionAppointmentDate || undefined,
      appointmentNotes: resolutionAppointmentNotes || undefined,
      uploadedEvidence: resolutionDocs
    });

    if (res.success && res.task) {
      onTaskUpdated(res.task);
      onTriggerToast(`✅ Caso ${task.matterCode} marcado como RESUELTO (100%) exitosamente.`);
      onClose();
    } else {
      alert(res.error || 'No se pudo resolver el caso.');
    }
  };

  // 2. Guardar Avance "EN PROCESO"
  const handleSaveInProgress = () => {
    if (!nextStepsOutline.trim()) {
      alert('Por favor especifique los siguientes pasos programados.');
      return;
    }

    const res = WorkOsService.setTaskInProgress(tenantId, task.id, {
      authorName: currentUserName || 'Responsable Asignado',
      authorEmail: currentUserEmail || task.primaryAssignee.email,
      nextStepsOutline,
      progressPercent,
      scheduledAppointmentDate: inProgressAppointmentDate || undefined,
      appointmentNotes: inProgressAppointmentNotes || undefined,
      uploadedEvidence: inProgressDocs
    });

    if (res.success && res.task) {
      onTaskUpdated(res.task);
      onTriggerToast(`🔄 Caso ${task.matterCode} actualizado a EN PROCESO (${progressPercent}%).`);
      onClose();
    } else {
      alert(res.error || 'No se pudo actualizar el avance.');
    }
  };

  // 3. Confirmar Escalamiento a CEO
  const handleConfirmEscalate = () => {
    if (!escalationReason.trim() || escalationReason.trim().length < 5) {
      alert('Por favor indique el motivo por el cual se escala este caso a Dirección General.');
      return;
    }

    const res = WorkOsService.escalateToCeo(tenantId, task.id, {
      authorName: currentUserName || task.primaryAssignee.name,
      authorEmail: currentUserEmail || task.primaryAssignee.email,
      reason: escalationReason
    });

    if (res.success && res.task) {
      onTaskUpdated(res.task);
      onTriggerToast(`🚨 Caso ${task.matterCode} escalado a Dirección General (CEO) con máxima prioridad.`);
      onClose();
    } else {
      alert(res.error || 'No se pudo escalar el caso.');
    }
  };

  // 4. Agregar Colaborador (Delegación Compartida)
  const handleAddCollaborator = () => {
    if (!newCollabName.trim() || !newCollabEmail.trim()) {
      alert('Ingrese nombre y correo del colaborador a integrar.');
      return;
    }

    const res = WorkOsService.addCollaboratorToTask(tenantId, task.id, {
      name: newCollabName.trim(),
      email: newCollabEmail.trim(),
      role: newCollabRole.trim(),
      assignedBy: isCeoView ? 'Dirección General / CEO' : currentUserName
    });

    if (res.success && res.task) {
      onTaskUpdated(res.task);
      onTriggerToast(`👥 ${newCollabName} integrado al caso para trabajo colaborativo.`);
      setNewCollabName('');
      setNewCollabEmail('');
    } else {
      alert(res.error || 'No se pudo agregar al colaborador.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* ========================================================= */}
        {/* HEADER DEL MODAL                                          */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/50">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                {task.matterCode}
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {task.sectionName}
              </span>

              {/* Distintivo de Estado Oficial */}
              {task.status === 'RESUELTO' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" /> RESUELTO (100%)
                </span>
              )}
              {task.status === 'EN_PROCESO' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950 dark:text-amber-300">
                  <Clock className="h-3 w-3" /> EN PROCESO ({task.progressPercent}%)
                </span>
              )}
              {task.status === 'NO_ATENDIDO' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950 dark:text-rose-300 animate-pulse">
                  <AlertTriangle className="h-3 w-3" /> (NO ATENDIDO)
                </span>
              )}
              {task.status === 'URGENTE' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-orange-50 text-orange-700 border border-orange-300 dark:bg-orange-950 dark:text-orange-300">
                  <Flame className="h-3 w-3" /> URGENTE
                </span>
              )}
              {task.status === 'ESCALADO_CEO' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase bg-purple-50 text-purple-700 border border-purple-300 dark:bg-purple-950 dark:text-purple-300">
                  <ShieldCheck className="h-3 w-3" /> ESCALADO A CEO
                </span>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black tracking-tight line-clamp-2">
              {task.title}
            </h2>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <span>Titular: <strong className="text-slate-800 dark:text-slate-200">{task.primaryAssignee.name}</strong></span>
              {task.collaborators && task.collaborators.length > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  <Users className="h-3 w-3" />
                  <span>Co-delegados ({task.collaborators.length}): {task.collaborators.map(c => c.name).join(', ')}</span>
                </span>
              )}
              <span className={`font-mono font-bold ${countdown.isOverdue ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'}`}>
                {countdown.remainingFormatted} (SLA: {task.slaHours}h)
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer shrink-0"
            title="Cerrar ventana"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ========================================================= */}
        {/* BARRA DE NAVEGACIÓN DE PESTAÑAS DEL EXPEDIENTE            */}
        {/* ========================================================= */}
        <div className="px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2.5 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5 py-2">
            <button
              onClick={() => setActiveTab('en_proceso')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'en_proceso'
                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🔄 En Proceso (Avance)
            </button>

            <button
              onClick={() => setActiveTab('resolver')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'resolver'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              ✅ Marcar Resuelto (100%)
            </button>

            <button
              onClick={() => setActiveTab('auditoria')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'auditoria'
                  ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              📜 Trazabilidad & Auditoría ({task.auditTrail.length})
            </button>

            <button
              onClick={() => setActiveTab('colaborar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'colaborar'
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-300 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              👥 Colaboradores ({1 + task.collaborators.length})
            </button>

            <button
              onClick={() => setActiveTab('escalar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                activeTab === 'escalar'
                  ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-300 font-black'
                  : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/30'
              }`}
            >
              🚨 Escalar a CEO
            </button>
          </div>

          {/* Indicador de barra de progreso en vivo */}
          <div className="hidden sm:flex items-center gap-2 pl-4 shrink-0">
            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300">
              Progreso: <strong className={progressStyle.textClass}>{activeTab === 'resolver' ? 100 : progressPercent}%</strong>
            </span>
            <div className="w-24 h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${progressStyle.bgClass}`}
                style={{ width: `${activeTab === 'resolver' ? 100 : progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CUERPO DEL CONTENIDO SEGÚN LA PESTAÑA ACTIVA              */}
        {/* ========================================================= */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 1: RESOLVER CASO (100% DEFINITIVO)             */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'resolver' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Banner Verde 100% */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-emerald-900 dark:text-emerald-200 text-sm">
                      Conclusión y Cierre Definitivo de Expediente (100%)
                    </h3>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                      Al confirmar la resolución, el CEO verá el caso con distintivo verde <strong className="font-mono">RESUELTO</strong>, tiempo SLA consumido y trazabilidad de minutos.
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
                  <span className="text-[10px] block text-emerald-700 dark:text-emerald-400 font-bold uppercase">Completado</span>
                </div>
              </div>

              {/* 1. Explicación obligatoria */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Explicación Detallada de las Acciones Tomadas <strong className="text-rose-500">* (Obligatorio)</strong></span>
                  <span className="text-[10px] font-normal text-slate-400">Mínimo 10 caracteres</span>
                </label>
                <textarea
                  value={resolutionSummary}
                  onChange={(e) => setResolutionSummary(e.target.value)}
                  placeholder="Describa puntualmente cómo se resolvió el asunto, acuerdos alcanzados con el tutor/alumno, folios emitidos o protocolo aplicado..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* 2. Cita o Reunión celebrada (Opcional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    Fecha de Cita o Sesión Celebrada (Si Aplica):
                  </label>
                  <input
                    type="datetime-local"
                    value={resolutionAppointmentDate}
                    onChange={(e) => setResolutionAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    Acuerdos de la Reunión:
                  </label>
                  <input
                    type="text"
                    value={resolutionAppointmentNotes}
                    onChange={(e) => setResolutionAppointmentNotes(e.target.value)}
                    placeholder="Minuta de acuerdos o personal participante..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* 3. Subir Documentos de Evidencia (PDF, JPG, JPEG, DOC) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Evidencias y Documentos Probatorios (Opcional)
                  </label>
                  <span className="text-[10px] text-slate-400">Formatos permitidos: PDF, JPG, JPEG, DOC</span>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-center cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'resolver')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <UploadCloud className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Arrastre o haga clic para adjuntar comprobantes, actas o dictámenes
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Quedarán archivados en la Bóveda Central compartida con Dirección General
                    </span>
                  </div>
                </div>

                {/* Evidencias ya aportadas en el expediente por co-delegados */}
                {task.evidenceDocs.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Documentos y Evidencias ya aportados en este caso ({task.evidenceDocs.length}):</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.evidenceDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold truncate block text-slate-800 dark:text-slate-200">{doc.fileName}</span>
                              <span className="text-[10px] text-slate-400 block">Subido por: {doc.uploadedBy}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                            title="Vista previa del documento"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Ver</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista de archivos adjuntados en resolución */}
                {resolutionDocs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {resolutionDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="h-4 w-4 text-emerald-600 shrink-0" />
                          <span className="truncate font-semibold">{doc.fileName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({Math.round(doc.fileSize / 1024)} KB)</span>
                        </div>
                        <button
                          onClick={() => setResolutionDocs(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Quitar archivo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Botón de Acción Principal */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmResolution}
                  className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-600/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Confirmar Resolución Definitiva (100%)</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 2: EN PROCESO (AVANCE, CITAS Y CHECKLIST)        */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'en_proceso' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Barra de Progreso Dinámica con Semáforo */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Porcentaje de Avance Actual: <strong className={progressStyle.textClass}>{progressPercent}%</strong>
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500">
                    {progressPercent < 30 ? '🔴 Avance Inicial (<30%)' : progressPercent <= 80 ? '🟠 Avance Intermedio (30-80%)' : '🟡 Avance Significativo (81-99%)'}
                  </span>
                </div>

                <input
                  type="range"
                  min={15}
                  max={99}
                  step={5}
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />

                <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                  <div
                    className={`h-full transition-all duration-300 ${progressStyle.bgClass}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Desglose de Pasos Siguientes */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Desglose de Pasos Restantes Programados <strong className="text-amber-500">*</strong></span>
                  <span className="text-[10px] text-slate-400">Cada línea genera un hito de seguimiento</span>
                </label>
                <textarea
                  value={nextStepsOutline}
                  onChange={(e) => setNextStepsOutline(e.target.value)}
                  placeholder="1. Entrevista con profesor titular\n2. Solicitud de dictamen a supervisión\n3. Entrega de informe final a padres..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Agendar Cita o Reunión (Incluso más allá del SLA) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-black text-slate-700 dark:text-slate-300">
                      Fecha y Hora de Cita Programada:
                    </label>
                    <span className="text-[10px] text-amber-600 font-bold">Permite agendar más allá del SLA</span>
                  </div>
                  <input
                    type="datetime-local"
                    value={inProgressAppointmentDate}
                    onChange={(e) => setInProgressAppointmentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-black text-slate-700 dark:text-slate-300 block mb-1">
                    Lugar o Enlace Virtual de Reunión:
                  </label>
                  <input
                    type="text"
                    value={inProgressAppointmentNotes}
                    onChange={(e) => setInProgressAppointmentNotes(e.target.value)}
                    placeholder="Cubículo de psicopedagogía / Sala Meet..."
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>

              {/* Subir Documentos de Avance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Documentos de Avance o Acuerdos Preliminares
                  </label>
                  <span className="text-[10px] text-slate-400">PDF, JPG, JPEG, DOC</span>
                </div>

                <div className="p-4 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-center cursor-pointer relative">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => handleFileUpload(e, 'en_proceso')}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                    <UploadCloud className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Subir archivo de avance o minuta intermedia
                    </span>
                  </div>
                </div>

                {inProgressDocs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {inProgressDocs.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="h-4 w-4 text-amber-600 shrink-0" />
                          <span className="truncate font-semibold">{doc.fileName}</span>
                        </div>
                        <button
                          onClick={() => setInProgressDocs(prev => prev.filter((_, i) => i !== idx))}
                          className="p-1 rounded-lg text-rose-500 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Evidencias ya aportadas en el expediente por co-delegados */}
                {task.evidenceDocs.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2">
                    <span className="text-xs font-black text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Documentos y Evidencias ya aportados en este caso ({task.evidenceDocs.length}):</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {task.evidenceDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-900 text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            <Paperclip className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                            <div className="min-w-0">
                              <span className="font-bold truncate block text-slate-800 dark:text-slate-200">{doc.fileName}</span>
                              <span className="text-[10px] text-slate-400 block">Subido por: {doc.uploadedBy}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0"
                            title="Vista previa del documento"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Ver</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Botón Guardar Avance */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveInProgress}
                  className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-lg shadow-amber-500/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span>Guardar Estado EN PROCESO ({progressPercent}%)</span>
                </button>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 3: TRAZABILIDAD Y AUDITORÍA INMUTABLE           */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'auditoria' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-xs sm:text-sm text-indigo-900 dark:text-indigo-200">
                    Registro Cronológico de Acciones y Minutas
                  </h3>
                  <p className="text-[11px] text-indigo-700 dark:text-indigo-300 mt-0.5">
                    Estampas de tiempo inmutables desde la apertura del correo hasta la respuesta final.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-black text-indigo-800 dark:text-indigo-300">
                    {task.auditTrail.length} Entradas
                  </span>
                </div>
              </div>

              {/* Línea de tiempo de auditoría */}
              <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {task.auditTrail.map((entry, idx) => (
                  <div key={entry.id || idx} className="relative flex items-start gap-3 pl-8">
                    <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-indigo-600 border-2 border-white dark:border-slate-900 shadow-xs" />
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 w-full text-xs space-y-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <strong className="font-black text-slate-800 dark:text-slate-100">{entry.action}</strong>
                        <span className="text-[10px] font-mono text-slate-400">
                          {new Date(entry.timestamp).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">{entry.details}</p>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Por: <strong className="text-slate-600 dark:text-slate-300">{entry.authorName}</strong> ({entry.authorEmail})
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Documentos de Evidencia Registrados */}
              {task.evidenceDocs.length > 0 && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                    Bóveda de Evidencias Adjuntas al Expediente ({task.evidenceDocs.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {task.evidenceDocs.map((doc) => (
                      <div key={doc.id} className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold truncate block text-slate-800 dark:text-slate-200">{doc.fileName}</span>
                            <span className="text-[10px] text-slate-400 block">Subido por {doc.uploadedBy}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => setPreviewDoc(doc)}
                            className="p-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer"
                            title="Vista previa del documento"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {doc.dataUrl ? (
                            <a
                              href={doc.dataUrl}
                              download={doc.fileName}
                              className="p-1.5 rounded-xl bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:text-indigo-600 transition-colors shrink-0"
                              title="Descargar documento"
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          ) : (
                            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              Archivado
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 4: COLABORADORES MULTI-PERSONA (EQUIPO)         */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'colaborar' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                <h3 className="font-black text-xs sm:text-sm text-blue-900 dark:text-blue-200 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>Delegación Compartida y Trabajo Colaborativo Estandarizado</span>
                </h3>
                <p className="text-[11px] text-blue-700 dark:text-blue-300 mt-1">
                  Cuando se asignan 2 o más personas, la barra de progreso es compartida y complementaria. Ambos miembros visualizan el trabajo del otro, comparten documentos y pueden concluir la tarea de forma unificada.
                </p>
              </div>

              {/* Lista de Miembros Asignados */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Equipo Responsable del Caso
                </h4>

                {/* Asignado Principal */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black flex items-center justify-center shrink-0">
                      {task.primaryAssignee.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="block text-slate-900 dark:text-slate-100">{task.primaryAssignee.name}</strong>
                      <span className="text-[10px] text-slate-500">{task.primaryAssignee.email} · {task.primaryAssignee.role}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-100 text-indigo-800 border border-indigo-200">
                    Responsable Titular
                  </span>
                </div>

                {/* Colaboradores Complementarios */}
                {task.collaborators.map((collab, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center shrink-0">
                        {collab.name.charAt(0)}
                      </div>
                      <div>
                        <strong className="block text-slate-900 dark:text-slate-100">{collab.name}</strong>
                        <span className="text-[10px] text-slate-500">{collab.email} · {collab.role}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Co-Responsable
                    </span>
                  </div>
                ))}
              </div>

              {/* Formulario para Integrar Nuevo Colaborador */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700 space-y-3">
                <h4 className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">
                  Incorporar Colaborador al Caso
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre del Colaborador"
                    value={newCollabName}
                    onChange={(e) => setNewCollabName(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                  <input
                    type="email"
                    placeholder="correo@ibime.edu.mx"
                    value={newCollabEmail}
                    onChange={(e) => setNewCollabEmail(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono"
                  />
                  <input
                    type="text"
                    placeholder="Rol o Especialidad"
                    value={newCollabRole}
                    onChange={(e) => setNewCollabRole(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddCollaborator}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer"
                  >
                    + Agregar al Equipo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 5: ESCALAR A DIRECCIÓN GENERAL (CEO)            */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'escalar' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-start gap-3">
                <ShieldCheck className="h-6 w-6 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-black text-purple-900 dark:text-purple-200 text-sm">
                    Escalamiento Directo a Dirección General (CEO)
                  </h3>
                  <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 leading-relaxed">
                    Esta función canaliza de inmediato el expediente al superior jerárquico máximo de la institución cuando existen factores de riesgo legal, médico crítico, reincidencia o necesidad de autorización presupuestal extraordinaria.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Motivo y Justificación del Escalamiento <strong className="text-purple-600">*</strong>
                </label>
                <textarea
                  value={escalationReason}
                  onChange={(e) => setEscalationReason(e.target.value)}
                  placeholder="Detalle por qué este caso requiere la intervención y toma de decisiones directa del CEO..."
                  rows={4}
                  className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold block mb-1">Destinatario del Escalamiento:</span>
                <span>Dirección General ISkool / CEO (Bandeja Ejecutiva de Máxima Prioridad)</span>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmEscalate}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 hover:scale-102 active:scale-98 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ArrowUpRight className="h-4 w-4" />
                  <span>Escalar a CEO</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal de Vista Previa de Evidencias */}
      {previewDoc && (
        <EvidencePreviewModal
          isOpen={Boolean(previewDoc)}
          onClose={() => setPreviewDoc(null)}
          doc={previewDoc}
          task={task}
        />
      )}
    </div>
  );
};
