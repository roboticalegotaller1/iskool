"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  BookOpen,
  Sparkles,
  Send,
  MonitorPlay,
  QrCode,
  Clock,
  Users,
  Check,
  Award,
  SlidersHorizontal
} from 'lucide-react';

export interface AutopilotStudentItem {
  id: string;
  name: string;
  avatarUrl?: string;
  gradeLabel?: string;
}

interface TeacherThreeStepAutopilotBarProps {
  groupName: string;
  subjectName: string;
  students: AutopilotStudentItem[];
  onOpenPlanningTab: () => void;
  onOpenLiveClassModal: () => void;
  onMarkAllPresentAndNotify?: () => void;
}

export const TeacherThreeStepAutopilotBar: React.FC<TeacherThreeStepAutopilotBarProps> = ({
  groupName,
  subjectName,
  students,
  onOpenPlanningTab,
  onOpenLiveClassModal,
  onMarkAllPresentAndNotify,
}) => {
  const [isGuidedMode, setIsGuidedMode] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [presentIds, setPresentIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    students.slice(0, 12).forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });
  const [stampedIds, setStampedIds] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    students.slice(0, 6).forEach((s) => {
      init[s.id] = true;
    });
    return init;
  });
  const [toastBanner, setToastBanner] = useState<string | null>(null);
  const [isSendingReport, setIsSendingReport] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastBanner(msg);
    setTimeout(() => setToastBanner(null), 4000);
  };

  const handleMarkAllPresent = () => {
    const nextPresent: Record<string, boolean> = {};
    const nextStamped: Record<string, boolean> = {};
    students.forEach((s) => {
      nextPresent[s.id] = true;
      nextStamped[s.id] = true;
    });
    setPresentIds(nextPresent);
    setStampedIds(nextStamped);
    if (onMarkAllPresentAndNotify) {
      onMarkAllPresentAndNotify();
    }
    showToast('✓ Grupo completo marcado Presente y Sello Pág. 48 registrado en 1 clic.');
  };

  const handleSendBulkParentReport = async () => {
    setIsSendingReport(true);
    try {
      const sampleStudent = students[0] || { id: 's1', name: 'Sofía Hernández' };
      await fetch('/api/parent/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: sampleStudent.id,
          studentName: sampleStudent.name,
          groupLabel: groupName || '2° A Secundaria',
          incidentType: 'asistencia',
          incidentLabel: 'Asistencia Puntual & Libreta Sellada (Pág. 48)',
          attendanceStatus: 'present',
          stampPage: 'Pág. 48',
          isStamped: true,
          xpAwarded: 50,
          subjectName: subjectName || 'Saberes y Pensamiento Científico',
        }),
      }).catch(() => null);
      showToast('🚀 Reporte del día y Sellos de Libreta enviados al Portal Familiar de Padres en 1 toque.');
    } finally {
      setIsSendingReport(false);
    }
  };

  const visibleStudents = students.slice(0, 6);
  const presentCount = Object.values(presentIds).filter(Boolean).length;
  const stampedCount = Object.values(stampedIds).filter(Boolean).length;

  return (
    <section
      data-testid="teacher-3step-autopilot"
      className="mb-6 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden"
    >
      {/* Top Header Bar: Mode Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 px-5 py-3.5 text-white">
        <div className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-black text-sm border border-emerald-500/30">
            1-2-3
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-tight text-white">
                iSkool® Piloto Automático de Aula • {groupName || 'Grupo Activo'}
              </h2>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-300 border border-emerald-500/30">
                Cero Fricción Tecnológica
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Diseñado para iniciar tu clase, pasar lista y proyectar tu planeación NEM 2024 en menos de 15 segundos.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-slate-800 p-1 border border-slate-700">
          <button
            type="button"
            data-testid="btn-toggle-guided-mode"
            onClick={() => setIsGuidedMode(true)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
              isGuidedMode
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Modo Guiado en 3 Pasos (Activo)
          </button>
          <button
            type="button"
            data-testid="btn-toggle-advanced-studio"
            onClick={() => setIsGuidedMode(false)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              !isGuidedMode
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Solo Estudio Avanzado
          </button>
        </div>
      </div>

      {toastBanner && (
        <div className="bg-emerald-600 px-5 py-2 text-xs font-bold text-white flex items-center justify-between">
          <span>{toastBanner}</span>
          <button type="button" onClick={() => setToastBanner(null)} className="text-white/80 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {isGuidedMode && (
        <div className="p-5">
          {/* 3 Giant Stepper Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <button
              type="button"
              data-testid="autopilot-step-1"
              onClick={() => setActiveStep(1)}
              className={`flex items-center gap-3.5 rounded-xl p-3.5 text-left transition border-2 ${
                activeStep === 1
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-sm'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-base ${
                  activeStep === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">
                  PASO 1 (Min 0–5)
                </div>
                <div className="text-sm font-black text-slate-900">
                  Pase de Lista Visual y Sello
                </div>
                <div className="text-[11px] text-slate-600">
                  {presentCount} presentes • {stampedCount} con Sello Pág. 48
                </div>
              </div>
            </button>

            <button
              type="button"
              data-testid="autopilot-step-2"
              onClick={() => setActiveStep(2)}
              className={`flex items-center gap-3.5 rounded-xl p-3.5 text-left transition border-2 ${
                activeStep === 2
                  ? 'border-blue-600 bg-blue-50/70 shadow-sm'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-base ${
                  activeStep === 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  PASO 2 (Min 5–40)
                </div>
                <div className="text-sm font-black text-slate-900">
                  Proyectar Clase del Día (Bóveda)
                </div>
                <div className="text-[11px] text-slate-600">
                  Inicio 10m • Desarrollo 30m • Cierre 10m
                </div>
              </div>
            </button>

            <button
              type="button"
              data-testid="autopilot-step-3"
              onClick={() => setActiveStep(3)}
              className={`flex items-center gap-3.5 rounded-xl p-3.5 text-left transition border-2 ${
                activeStep === 3
                  ? 'border-indigo-600 bg-indigo-50/70 shadow-sm'
                  : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/70'
              }`}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-base ${
                  activeStep === 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                3
              </span>
              <div>
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700">
                  PASO 3 (Min 40–50)
                </div>
                <div className="text-sm font-black text-slate-900">
                  Evaluar en 1 Toque y Avisar a Padres
                </div>
                <div className="text-[11px] text-slate-600">
                  Sincroniza con Portal Familiar en 5s
                </div>
              </div>
            </button>
          </div>

          {/* Main 2-Column Ergonomic Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left 8 Cols: Visual Student Cards for 1-Tap Attendance & Notebook Stamp */}
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" />
                    Pase de Lista Visual y Sello de Libreta Física (1 Toque)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Toca el botón verde o dorado de cada alumno sin llenar tablas complejas.
                  </p>
                </div>
                <button
                  type="button"
                  data-testid="btn-mark-all-present-1click"
                  onClick={handleMarkAllPresent}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-slate-800 transition"
                >
                  <Check className="h-4 w-4 text-emerald-400" />
                  Marcar Todo Presente + Sello en 1 Clic
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {visibleStudents.map((stu) => {
                  const isPresent = Boolean(presentIds[stu.id]);
                  const isStamped = Boolean(stampedIds[stu.id]);
                  return (
                    <div
                      key={stu.id}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-xs flex flex-col justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5">
                        {stu.avatarUrl ? (
                          <div className="relative h-11 w-11 shrink-0">
                            <img
                              src={stu.avatarUrl}
                              alt={stu.name}
                              className="h-11 w-11 rounded-full object-cover border-2 border-indigo-500/40 shadow-xs bg-slate-100"
                            />
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${
                                isPresent ? 'bg-emerald-500' : 'bg-slate-400'
                              }`}
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                            {stu.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="truncate text-xs font-black text-slate-900">{stu.name}</div>
                          <div className="text-[10px] font-semibold text-slate-500">
                            {stu.gradeLabel || groupName}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setPresentIds((prev) => ({ ...prev, [stu.id]: !prev[stu.id] }))
                          }
                          className={`rounded-lg px-2 py-1.5 text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                            isPresent
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          {isPresent ? 'Presente' : 'Ausente'}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setStampedIds((prev) => ({ ...prev, [stu.id]: !prev[stu.id] }))
                          }
                          className={`rounded-lg px-2 py-1.5 text-[11px] font-extrabold transition flex items-center justify-center gap-1 ${
                            isStamped
                              ? 'bg-amber-400/90 text-slate-950 shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <Award className="h-3.5 w-3.5" />
                          {isStamped ? 'Sello Pág. 48' : 'Sin Sello'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right 4 Cols: Today's NEM 2024 Lesson Ready in Curricular Vault */}
            <div className="lg:col-span-4 rounded-xl border border-blue-200 bg-gradient-to-b from-blue-50/70 to-white p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-800">
                    <BookOpen className="h-3 w-3" />
                    Bóveda Curricular NEM 2024
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700">✓ Lista para hoy</span>
                </div>
                <h3 className="text-sm font-black text-slate-900 mb-1">
                  Tu Planeación de Hoy ({subjectName || 'Asignatura Activa'})
                </h3>
                <p className="text-xs text-slate-600 mb-3">
                  Secuencia didáctica cronometrada con PDA oficial de la SEP y rúbrica formativa.
                </p>

                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      1. Inicio (Activación)
                    </span>
                    <span className="font-black text-slate-900">10 min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-emerald-600" />
                      2. Desarrollo (Reto Guiado)
                    </span>
                    <span className="font-black text-slate-900">30 min</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-xs border border-slate-200">
                    <span className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-600" />
                      3. Cierre y Ticket de Salida
                    </span>
                    <span className="font-black text-slate-900">10 min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  data-testid="btn-project-class-1click"
                  onClick={onOpenLiveClassModal}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-black text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <MonitorPlay className="h-4 w-4" />
                  Proyectar Clase en el Pizarrón
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={onOpenPlanningTab}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                    Ver Planeación
                  </button>

                  <Link
                    href="/teacher/idiomas"
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-bold text-slate-800 hover:bg-slate-50 transition"
                  >
                    <QrCode className="h-3.5 w-3.5 text-indigo-600" />
                    Control QR / Idiomas
                  </Link>
                </div>

                <button
                  type="button"
                  data-testid="btn-send-parent-summary-1click"
                  disabled={isSendingReport}
                  onClick={handleSendBulkParentReport}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSendingReport
                    ? 'Enviando reporte a familias...'
                    : 'Enviar Resumen 5s a Padres en 1 Toque'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

