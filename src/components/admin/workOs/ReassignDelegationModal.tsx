"use client";

import React, { useState } from 'react';
import {
  WorkOsTask,
  WorkOsSeedAccount
} from '@/lib/services/workOs/workOsTypes';
import {
  UserCheck,
  X,
  AlertTriangle,
  Clock,
  Mail,
  User,
  Building2,
  FileText,
  Forward,
  Check
} from 'lucide-react';

interface ReassignDelegationModalProps {
  task: WorkOsTask;
  seedAccounts: WorkOsSeedAccount[];
  onConfirm: (params: {
    newAssigneeName: string;
    newAssigneeEmail: string;
    newAssigneeRole: string;
    sectionKey: string;
    sectionName: string;
    slaHours: number;
    delegationNotes?: string;
  }) => void;
  onClose: () => void;
}

export const ReassignDelegationModal: React.FC<ReassignDelegationModalProps> = ({
  task,
  seedAccounts,
  onConfirm,
  onClose
}) => {
  // Inicializar con la primera semilla o la actual
  const initialSeed = seedAccounts.find(s => s.sectionKey === task.sectionKey) || seedAccounts[0];

  const [selectedSeedKey, setSelectedSeedKey] = useState<string>(initialSeed?.sectionKey || 'cobranza');
  const [assigneeName, setAssigneeName] = useState<string>(initialSeed?.delegateName || '');
  const [assigneeEmail, setAssigneeEmail] = useState<string>(initialSeed?.departmentAccount || '');
  const [slaHours, setSlaHours] = useState<number>(initialSeed?.slaHours || 24);
  const [delegationNotes, setDelegationNotes] = useState<string>(
    'Reasignación manual de caso desde Urgentes / No Atendidos hacia nueva delegación departamental para cumplimiento estricto de SLA.'
  );

  // Manejar cambio de departamento / seed
  const handleSelectSeed = (seedKey: string) => {
    setSelectedSeedKey(seedKey);
    const chosen = seedAccounts.find(s => s.sectionKey === seedKey);
    if (chosen) {
      setAssigneeName(chosen.delegateName);
      setAssigneeEmail(chosen.departmentAccount);
      setSlaHours(chosen.slaHours);
    }
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!assigneeName.trim() || !assigneeEmail.trim()) {
      alert('Por favor complete el nombre y correo del nuevo responsable asignado.');
      return;
    }

    const currentSeed = seedAccounts.find(s => s.sectionKey === selectedSeedKey);
    const sectionName = currentSeed?.sectionName || 'Coordinación Institucional';

    onConfirm({
      newAssigneeName: assigneeName.trim(),
      newAssigneeEmail: assigneeEmail.trim(),
      newAssigneeRole: sectionName,
      sectionKey: selectedSeedKey,
      sectionName,
      slaHours: Number(slaHours),
      delegationNotes: delegationNotes.trim()
    });
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* ENCABEZADO */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-amber-50/70 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black px-2 py-0.5 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  {task.matterCode}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  CASO URGENTE
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white mt-1">
                ¿A quién debe ser delegado este caso?
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Al transferir el expediente a <strong>Recién Delegados</strong>, se debe definir formalmente al nuevo responsable para iniciar el cómputo de atención.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shrink-0"
            title="Cancelar y mantener en Urgentes"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* FORMULARIO */}
        <form onSubmit={handleConfirmSubmit} className="p-5 sm:p-6 space-y-4">
          {/* Asunto a reasignar */}
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="text-slate-400 block font-bold text-[10px]">TÍTULO DEL EXPEDIENTE:</span>
            <span className="font-black text-slate-800 dark:text-slate-200 line-clamp-1">{task.title}</span>
          </div>

          {/* Selector de Departamento / Seed */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-indigo-500" />
              <span>Departamento o Coordinación de Destino:</span>
            </label>
            <select
              value={selectedSeedKey}
              onChange={(e) => handleSelectSeed(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {seedAccounts.map((seed) => (
                <option key={seed.sectionKey} value={seed.sectionKey}>
                  {seed.sectionName} ({seed.departmentAccount}) · {seed.delegateName}
                </option>
              ))}
            </select>
          </div>

          {/* Nombre y Correo del nuevo asignado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-slate-400" />
                <span>Nombre del Responsable:</span>
              </label>
              <input
                type="text"
                required
                value={assigneeName}
                onChange={(e) => setAssigneeName(e.target.value)}
                placeholder="Nombre completo del delegado"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>Correo Institucional / Notificación:</span>
              </label>
              <input
                type="email"
                required
                value={assigneeEmail}
                onChange={(e) => setAssigneeEmail(e.target.value)}
                placeholder="ejemplo@ibime.edu.mx"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Plazo SLA */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
              <span>Nuevo Plazo de Resolución Reglamentario (SLA):</span>
            </label>
            <select
              value={slaHours}
              onChange={(e) => setSlaHours(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value={12}>12 Horas (Atención Urgente / Inmediata)</option>
              <option value={24}>24 Horas (Estándar Operativo)</option>
              <option value={48}>48 Horas (Trámites y Validaciones)</option>
              <option value={72}>72 Horas (Plazo Extendido)</option>
            </select>
          </div>

          {/* Motivo de reasignación */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <span>Instrucción o Motivo de Reasignación:</span>
            </label>
            <textarea
              rows={2}
              value={delegationNotes}
              onChange={(e) => setDelegationNotes(e.target.value)}
              placeholder="Especifique el motivo de transferencia y prioridades para el nuevo delegado..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Aviso informativo de reglas */}
          <div className="p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center gap-2.5 text-[11px] text-indigo-900 dark:text-indigo-200">
            <Forward className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              Al confirmar, el porcentaje de avance se establecerá automáticamente en <strong>0%</strong> y se reiniciará el temporizador de SLA en la pantalla del delegado.
            </span>
          </div>

          {/* BOTONES */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Cancelar (Mantener en Urgentes)
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs shadow-md shadow-amber-600/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Check className="h-4 w-4" />
              <span>Confirmar Delegación y Reasignar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
