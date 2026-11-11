"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { BellRing, Clock, MessageSquare, Send, CheckCircle2, X } from 'lucide-react';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { normalizeOrgSchoolId } from '@/lib/services/organizationService';
import { useAuth } from '@/context/AuthContext';

interface VibratoryProtocolAlertOverlayProps {
  schoolId?: string;
  forceTeacherMode?: boolean;
}

export function VibratoryProtocolAlertOverlay({
  schoolId = 'sch-test-case',
  forceTeacherMode = false,
}: VibratoryProtocolAlertOverlayProps) {
  const { user } = useAuth();
  const effectiveOrgSchoolId = useMemo(
    () => normalizeOrgSchoolId(user?.school_id || schoolId || 'sch-test-case'),
    [user?.school_id, schoolId]
  );
  const graph = useOrganizationStore((s) => s.graphsBySchool[effectiveOrgSchoolId]);
  const acknowledgeAlert = useOrganizationStore((s) => s.acknowledgeAlert);
  const replyToVibratoryAlert = useOrganizationStore((s) => s.replyToVibratoryAlert);

  const [replyDraft, setReplyDraft] = useState('');
  const [pulseTick, setPulseTick] = useState(0);

  // Escuchar actualizaciones en tiempo real entre pestañas (ej. CEO delega SLA o Padre envía mensaje -> Profesor recibe pop-up vibratorio)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') return;
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('iskool_org_realtime_v1');
      bc.onmessage = () => {
        useOrganizationStore.persist.rehydrate();
        setPulseTick((t) => t + 1);
      };
    } catch {
      // Ignore BroadcastChannel limitations
    }
    return () => {
      try {
        bc?.close();
      } catch {}
    };
  }, []);

  const activeAlert = useMemo(() => {
    const alerts = graph?.alerts || [];
    const pending = alerts.filter(
      (a) => !a.acknowledgedAt && normalizeOrgSchoolId(a.schoolId) === effectiveOrgSchoolId
    );
    if (pending.length === 0) return null;

    const currentEmail = (user?.email || '').trim().toLowerCase();
    const currentId = (user?.id || '').trim().toLowerCase();

    // Coincidencia directa por usuario organizacional autenticado
    const exactMatch = pending.find(
      (a) =>
        (a.targetUsername && a.targetUsername.toLowerCase() === currentEmail) ||
        (a.targetNodeId && `usr-org-${a.targetNodeId}`.toLowerCase() === currentId)
    );
    if (exactMatch) return exactMatch;

    // En Portal Docente (/teacher), mostrar mensajes entrantes de Padre de Familia o SLA docente
    if (forceTeacherMode || user?.role === 'teacher') {
      const teacherMatch = pending.find(
        (a) => a.kind === 'parent_teacher_message' || a.kind === 'sla_superior'
      );
      if (teacherMatch) return teacherMatch;
    }

    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph?.alerts, effectiveOrgSchoolId, user?.email, user?.id, user?.role, forceTeacherMode, pulseTick]);

  // Disparar vibración háptica física cuando emerge la alerta
  useEffect(() => {
    if (!activeAlert) return;
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate([200, 90, 220, 90, 260]);
      } catch {
        // Ignorar si el navegador restringe vibración sin gesto previo
      }
    }
  }, [activeAlert?.id]);

  if (!activeAlert) return null;

  const isSla = activeAlert.kind === 'sla_superior';

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyDraft.trim()) return;
    replyToVibratoryAlert(effectiveOrgSchoolId, activeAlert.id, replyDraft.trim());
    setReplyDraft('');
  };

  return (
    <div
      data-testid="vibratory-protocol-alert-popup"
      className="fixed inset-0 z-50 bg-slate-900/35 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <style>{`
        @keyframes iskoolHapticShake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-5px) rotate(-0.6deg); }
          30% { transform: translateX(5px) rotate(0.6deg); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(4px); }
          75% { transform: translateX(-2px); }
        }
      `}</style>
      <div
        style={{ animation: 'iskoolHapticShake 0.55s ease-in-out 2' }}
        className="relative bg-white rounded-2xl border-2 border-blue-500 shadow-2xl max-w-lg w-full p-6 space-y-4 text-slate-800"
      >
        {/* Anillo sutil de pulso visual vibratorio */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div
              className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 animate-pulse ${
                isSla
                  ? 'bg-amber-50 text-amber-600 border border-amber-200'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {isSla ? (
                <BellRing className="h-5 w-5" />
              ) : (
                <MessageSquare className="h-5 w-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    isSla
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {isSla
                    ? 'Alerta Vibratoria Tiempo de respuesta · Superior en Organigrama'
                    : 'Comunicación Directa · Padre de Familia'}
                </span>
                {activeAlert.slaHours && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>Tiempo de respuesta: {activeAlert.slaHours}h</span>
                  </span>
                )}
              </div>
              <h4 className="text-sm font-black text-slate-900 mt-1">
                {activeAlert.subject}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={() => acknowledgeAlert(effectiveOrgSchoolId, activeAlert.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5">
          <div className="text-xs font-bold text-slate-700">
            Remitente: <span className="text-slate-900">{activeAlert.fromName}</span>{' '}
            <span className="text-slate-500 font-normal">({activeAlert.fromRoleLabel})</span>
          </div>
          <p className="text-sm text-slate-800 leading-relaxed">{activeAlert.message}</p>
        </div>

        {/* Respuesta Fluida Inmediata */}
        <form onSubmit={handleSendReply} className="space-y-2.5">
          <label className="block text-[11px] font-bold text-slate-700">
            Respuesta directa e inmediata
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              data-testid="vibratory-alert-reply-input"
              value={replyDraft}
              onChange={(e) => setReplyDraft(e.target.value)}
              placeholder={
                isSla
                  ? 'Confirmar atención o informar avance al superior...'
                  : 'Escribe respuesta inmediata al padre de familia...'
              }
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-900 focus:outline-none focus:border-blue-600"
            />
            <button
              type="submit"
              data-testid="vibratory-alert-send-reply-btn"
              disabled={!replyDraft.trim()}
              className="px-3.5 py-2 rounded-xl bg-[#1D68FF] hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              <span>Responder</span>
            </button>
          </div>
        </form>

        <div className="flex items-center justify-end pt-1">
          <button
            type="button"
            data-testid="vibratory-alert-acknowledge-btn"
            onClick={() => acknowledgeAlert(effectiveOrgSchoolId, activeAlert.id)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span>Confirmar Recepción</span>
          </button>
        </div>
      </div>
    </div>
  );
}

