'use client';

import React, { useState, useEffect } from 'react';
import { MatterItem } from './ExecutiveInboxView';

interface MatterDetailProps {
  matter: MatterItem | null;
  onClose: () => void;
  onApproveReply: (matterId: string, replyText: string) => Promise<void>;
  onDelegate: (matterId: string, role: string) => Promise<void>;
  onCorrect: (matterId: string, correctedRole: string, reason: string) => Promise<void>;
}

export const MatterDetailDrawer: React.FC<MatterDetailProps> = ({
  matter,
  onClose,
  onApproveReply,
  onDelegate,
  onCorrect,
}) => {
  if (!matter) return null;

  const [draft, setDraft] = useState<string>(matter.suggested_draft_reply || '');
  const [selectedRole, setSelectedRole] = useState<string>(matter.assigned_role || 'Coordinación Primaria');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'DRAFT' | 'EVIDENCE' | 'FEEDBACK'>('DRAFT');
  const [feedbackReason, setFeedbackReason] = useState<string>('');

  useEffect(() => {
    if (matter) {
      setDraft(matter.suggested_draft_reply || '');
      setSelectedRole(matter.assigned_role || 'Coordinación Primaria');
    }
  }, [matter]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    await onApproveReply(matter.id, draft);
    setIsSubmitting(false);
    onClose();
  };

  const handleDelegateSubmit = async () => {
    setIsSubmitting(true);
    await onDelegate(matter.id, selectedRole);
    setIsSubmitting(false);
    onClose();
  };

  const handleCorrectionSubmit = async () => {
    setIsSubmitting(true);
    await onCorrect(matter.id, selectedRole, feedbackReason);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {matter.matter_code}
              </span>
              <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                {matter.urgency}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-2">{matter.title}</h2>
            <p className="text-xs text-slate-500 mt-0.5">Categoría: {matter.category}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1">✕</button>
        </div>

        {/* TABS */}
        <div className="px-6 border-b border-slate-100 flex gap-6 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('DRAFT')}
            className={`py-3 border-b-2 transition ${activeTab === 'DRAFT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Preparar Respuesta
          </button>
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`py-3 border-b-2 transition ${activeTab === 'EVIDENCE' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Ver Evidencia ({matter.reincidence_count} correos)
          </button>
          <button
            onClick={() => setActiveTab('FEEDBACK')}
            className={`py-3 border-b-2 transition ${activeTab === 'FEEDBACK' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Enseñar a iSkool
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 flex-1 space-y-4">
          {activeTab === 'DRAFT' && (
            <div className="space-y-4">
              <div className="rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900">
                <strong>Por qué te lo muestro: </strong> {matter.why_shown}
                <div className="mt-1">
                  <strong>Recomendación iSkool: </strong> {matter.recommended_action}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Borrador de Respuesta Sugerido (Editable en todo momento)
                </label>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={8}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
                  placeholder="Escribe o edita la respuesta antes de enviar..."
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-slate-600">O delegar a área:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-lg border border-slate-300 p-2 text-xs font-medium text-slate-700"
                >
                  <option value="Coordinación Primaria">Coordinación Primaria</option>
                  <option value="Coordinación Secundaria">Coordinación Secundaria</option>
                  <option value="Administración">Administración</option>
                  <option value="Control Escolar">Control Escolar</option>
                  <option value="Dirección General">Dirección General</option>
                </select>
                <button
                  onClick={handleDelegateSubmit}
                  disabled={isSubmitting}
                  className="rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-1.5 text-xs font-bold"
                >
                  Delegar con SLA
                </button>
              </div>
            </div>
          )}

          {activeTab === 'EVIDENCE' && (
            <div className="space-y-3">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2">
                <p className="font-bold text-slate-800">Síntesis consolidada:</p>
                <p className="text-slate-600">{matter.summary}</p>
              </div>
              <div className="border border-slate-200 rounded-xl p-4">
                <span className="text-xs font-bold text-slate-500">Último correo recibido en el asunto:</span>
                <p className="text-sm font-semibold text-slate-800 mt-1">{matter.title}</p>
                <p className="text-xs text-slate-600 mt-2 font-mono whitespace-pre-wrap">{draft || matter.summary}</p>
              </div>
            </div>
          )}

          {activeTab === 'FEEDBACK' && (
            <div className="space-y-4">
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-900 leading-relaxed">
                iSkool aprende cómo dirige Angélica. Al corregir una asignación o escalamiento, registramos tu criterio para proponerte reglas de automatización en el futuro.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Responsable que debió atender este asunto
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-800"
                >
                  <option value="Coordinación Primaria">Siempre enviar a Coordinación Primaria</option>
                  <option value="Control Escolar">Siempre enviar a Control Escolar</option>
                  <option value="Administración">Siempre enviar a Administración</option>
                  <option value="Dirección General">Este tipo de asunto sí debe escalarse a Dirección</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Motivo o criterio aplicado:</label>
                <textarea
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs"
                  placeholder="Ej: En quejas de convivencia menores a 2 incidencias, Coordinación Primaria debe intervenir primero..."
                />
              </div>

              <button
                onClick={handleCorrectionSubmit}
                disabled={isSubmitting}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Guardar Criterio y Reasignar
              </button>
            </div>
          )}
        </div>

        {/* FOOTER ACCIONES */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Cerrar sin cambios
          </button>
          <div className="flex gap-2">
            <button
              onClick={handleApprove}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition"
            >
              {isSubmitting ? 'Procesando...' : '✓ Aprobar Respuesta y Resolver'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatterDetailDrawer;
