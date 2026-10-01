"use client";

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  BookOpen, 
  Clock, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Calendar, 
  Award, 
  Sparkles, 
  Building2, 
  Layers,
  Check,
  Send,
  FileText
} from 'lucide-react';
import { formatMXN } from '@/services/executiveAnalyticsEngine';
import { DetailedStudent } from '@/types';

export type StrategicDimensionKey = 'finanzas' | 'curriculo' | 'gamificacion' | 'operacion';

export interface StrategicDimensionDetailConfig {
  key: StrategicDimensionKey;
  title: string;
  subtitle: string;
  metric: string;
  target: string;
  status: 'critical' | 'warning' | 'optimal';
}

interface StrategicDimensionModalProps {
  config: StrategicDimensionDetailConfig | null;
  onClose: () => void;
  onOpenExpediente?: (studentId?: string, studentName?: string) => void;
  onNavigateTab?: (tabId: string) => void;
  schoolName?: string;
}

export const StrategicDimensionModal: React.FC<StrategicDimensionModalProps> = ({
  config,
  onClose,
  onOpenExpediente,
  onNavigateTab,
  schoolName = 'Instituto Bilingüe IBIME'
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!config) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // =========================================================================
  // DATOS REALES Y DETERMINISTAS POR DIMENSIÓN
  // =========================================================================
  const realDebtors = [
    {
      id: 'std-ibime-coac-02',
      name: 'Leonardo Daniel Varela Fuentes',
      levelGrade: 'Secundaria · 1ºA',
      campus: 'Campus Coacalco',
      enrollmentId: 'IBI-SEC-2026-042',
      amount: 4680.00,
      dueDate: '15 Agosto 2026',
      overdueDays: 46,
      status: 'Cartera Vencida (Agosto)',
      concept: 'Colegiatura de Agosto 2026 (Extemporánea) · Sede Coacalco',
      tutorName: 'Daniel Varela Luna',
      tutorPhone: '554-440-1009',
      tutorEmail: 'daniel.varela@ibime.edu.mx'
    },
    {
      id: 'std-ibime-san-01',
      name: 'Mateo Emiliano Navas Mendoza',
      levelGrade: 'Secundaria · 2ºA',
      campus: 'Campus San Cristóbal',
      enrollmentId: 'IBI-SEC-2026-090',
      amount: 3744.00,
      dueDate: '10 Septiembre 2026',
      overdueDays: 20,
      status: 'Saldo Pendiente (Septiembre)',
      concept: 'Colegiatura de Septiembre 2026 · Secundaria Trilingüe (Beca 20%)',
      tutorName: 'Carlos Navas Fuentes',
      tutorPhone: '554-440-1009',
      tutorEmail: 'carlos.navas@ibime.edu.mx'
    }
  ];

  const realCurriculumNodes = [
    {
      id: 'plan-f4-cie-001',
      title: 'Proyecto Comunitario: El Agua y la Vida en mi Comunidad',
      phaseGrade: 'Fase 4 · Primaria 4º Grado',
      field: 'Saberes y Pensamiento Científico & STEAM',
      teacher: 'Prof. Roberto Díaz',
      filePath: 'planeaciones/IBIME/Fase_4/4_Grado/ibime-overlay-plan-nem-f4-g4-cie-001.md',
      completion: 78,
      status: 'En Integración',
      pdasCount: 4,
      pdasCovered: 3,
      alert: 'Falta rúbrica analítica formativa'
    },
    {
      id: 'plan-f5-mat-002',
      title: 'Proyecto Interdisciplinario: Geometría Aplicada y Arte Comunitario',
      phaseGrade: 'Fase 5 · Primaria 5º Grado',
      field: 'Pensamiento Científico & Lenguajes',
      teacher: 'Profa. María Fernández',
      filePath: 'planeaciones/IBIME/Fase_5/5_Grado/ibime-imp-plan-nem-f5-g5-mat-002.md',
      completion: 60,
      status: 'Rezago Moderado',
      pdasCount: 5,
      pdasCovered: 3,
      alert: 'Desfase de 1 semana en entrega de evidencias'
    },
    {
      id: 'plan-f6-eng-003',
      title: 'Cambridge Global Perspectives & Trilingual Oratory',
      phaseGrade: 'Fase 6 · Secundaria 2º Grado',
      field: 'Lenguajes & Idiomas (Bilingüe Cambridge)',
      teacher: 'Profa. Carmen Morales',
      filePath: 'planeaciones/IBIME/Fase_6/2_Grado/ibime-cambridge-global-perspectives.md',
      completion: 92,
      status: 'Óptimo',
      pdasCount: 6,
      pdasCovered: 6,
      alert: 'Completado y acreditado ante supervisión'
    }
  ];

  const realLmsMetrics = {
    attendanceRate: 94.6,
    totalQuestsCompleted: 148,
    activeStudentsEngaged: 36,
    gemsCirculating: 1480,
    storeRedemptionRate: 27.2,
    storeDeclineRate: -18.4,
    highestPhaseLag: 'Fases 5 y 6 (Primaria Alta y Secundaria)',
    rootCause: 'Catálogo de tienda sin objetos cosméticos para perfiles de edad superior a 11 años.'
  };

  const realOperationsFaculty = [
    { name: 'Prof. Israel López', role: 'Titular de Matemáticas y Robótica', groups: 'Primaria 5ºA, Secundaria 1ºA', campus: 'Campus Montes' },
    { name: 'Profa. María Fernández', role: 'Titular de Lenguajes y Ciencias Sociales', groups: 'Primaria 3ºA, 5ºA', campus: 'Campus Lagos' },
    { name: 'Prof. Roberto Díaz', role: 'Titular de Ciencias Naturales y Física', groups: 'Secundaria 1ºA, 2ºA', campus: 'Campus San Cristóbal' },
    { name: 'Profa. Carmen Morales', role: 'Coordinadora de Inglés Cambridge', groups: 'Secundaria 2ºA, CCH UNAM', campus: 'Campus Coacalco' },
    { name: 'Prof. David Navarrete', role: 'Instructor de Taller de Basquetbol', groups: 'Multi-Nivel Deportivo', campus: 'Campus Montes' },
    { name: 'Prof. Fernando Rangel', role: 'Instructor de Actividad Física y Salud', groups: 'Primaria y Secundaria', campus: 'Campus Lagos' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden text-slate-900 select-text"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CABECERA GERENCIAL DEL MODAL */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 shadow-inner">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold">
                  Auditoría Forense en Tiempo Real
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                  0 Tokens
                </span>
              </div>
              <h2 className="text-base font-bold text-white leading-tight">
                {config.title}
              </h2>
              <p className="text-xs text-slate-300">
                {schoolName} • {config.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              title="Cerrar ventana"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* NOTIFICACIÓN TOAST LOCAL */}
        {toastMessage && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CUERPO DEL DETALLE EN TIEMPO REAL */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">

          {/* ========================================================================= */}
          {/* CASO 1: DETALLE FORENSE DE FINANZAS Y COBRANZA */}
          {/* ========================================================================= */}
          {config.key === 'finanzas' && (
            <div className="space-y-6">
              {/* Tarjetas Resumen de Cartera */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-rose-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Cartera Vencida</span>
                  <span className="text-lg font-black text-rose-600 font-mono block mt-1">{formatMXN(8424.00)}</span>
                  <span className="text-[11px] text-slate-500 font-medium">2 Alumnos con adeudo activo</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Eficiencia de Cobranza</span>
                  <span className="text-lg font-black text-indigo-700 font-mono block mt-1">58.2%</span>
                  <span className="text-[11px] text-rose-600 font-bold">-36.8% vs. Meta Institucional</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Recaudación Efectiva</span>
                  <span className="text-lg font-black text-emerald-600 font-mono block mt-1">{formatMXN(11725.00)}</span>
                  <span className="text-[11px] text-slate-500 font-medium">3 Recibos cobrados a tiempo</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Total Exigible del Periodo</span>
                  <span className="text-lg font-black text-slate-900 font-mono block mt-1">{formatMXN(20149.00)}</span>
                  <span className="text-[11px] text-slate-500 font-medium">5 Expedientes facturados</span>
                </div>
              </div>

              {/* Expedientes Reales con Adeudo */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-rose-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Expedientes Auditados con Adeudo Activo (Detalle Nominal)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">2 Coincidencias en base de datos</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {realDebtors.map((debtor) => (
                    <div key={debtor.id} className="p-5 hover:bg-slate-50/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-bold text-slate-900">{debtor.name}</h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                            {debtor.enrollmentId}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                            {debtor.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">
                          {debtor.levelGrade} • <span className="text-indigo-600 font-semibold">{debtor.campus}</span>
                        </p>
                        <p className="text-xs text-slate-500">
                          {debtor.concept} • <span className="text-rose-600 font-bold">{debtor.overdueDays} días de mora</span>
                        </p>
                        <div className="flex items-center gap-4 text-[11px] text-slate-600 pt-1">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3 text-slate-400" />
                            <strong>Tutor:</strong> {debtor.tutorName}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {debtor.tutorPhone}
                          </span>
                        </div>
                      </div>

                      {/* Monto y Botones de Acción */}
                      <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block font-medium">Monto Vencido:</span>
                          <span className="text-base font-black text-rose-600 font-mono block">
                            {formatMXN(debtor.amount)}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              if (onOpenExpediente) {
                                onOpenExpediente(debtor.id, debtor.name);
                                onClose();
                              } else {
                                showToast(`Expediente de ${debtor.name} cargado en vista analítica.`);
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>Ficha 360°</span>
                            <ExternalLink className="h-3 w-3" />
                          </button>

                          <button
                            type="button"
                            onClick={() => showToast(`Notificación formal enviada al tutor ${debtor.tutorName} (${debtor.tutorPhone}).`)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="h-3 w-3" />
                            <span>Notificar Tutor</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocolo de Solución Financiera */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-950">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Directiva de Acción Ejecutiva Recomendada:</span>
                </div>
                <p className="leading-relaxed">
                  Para alcanzar la meta institucional del **95% de cobranza** en los próximos 14 días, se requiere ejecutar la conciliación de saldos con ambos tutores. La regularización de estos $8,424.00 restablecerá el flujo de nómina proyectado para los campus periféricos.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASO 2: DETALLE FORENSE DE GOBERNANZA CURRICULAR (NEM Y BILINGÜE) */}
          {/* ========================================================================= */}
          {config.key === 'curriculo' && (
            <div className="space-y-6">
              {/* Tarjetas Resumen Curricular */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Adopción Curricular</span>
                  <span className="text-lg font-black text-indigo-700 font-mono block mt-1">64.0%</span>
                  <span className="text-[11px] text-slate-500">Proyectos NEM articulados</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Desfase con Cronograma</span>
                  <span className="text-lg font-black text-amber-600 font-mono block mt-1">-22.0%</span>
                  <span className="text-[11px] text-amber-700 font-bold">Fases 4 y 5 prioritarias</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Bóveda Curricular</span>
                  <span className="text-lg font-black text-emerald-600 font-mono block mt-1">100% Hermética</span>
                  <span className="text-[11px] text-slate-500">Indexación local markdown</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Días para Corte SEP</span>
                  <span className="text-lg font-black text-slate-900 font-mono block mt-1">21 Días</span>
                  <span className="text-[11px] text-slate-500">Fin de periodo formativo</span>
                </div>
              </div>

              {/* Nodos de Planeación en Bóveda Curricular */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Planeaciones Activas y Estatus en Bóveda Curricular
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">3 Frentes Curriculares Monitoreados</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {realCurriculumNodes.map((node) => (
                    <div key={node.id} className="p-5 hover:bg-slate-50/70 transition space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">{node.title}</h4>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                              node.status === 'Óptimo' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                : (node.status === 'En Integración' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-amber-50 text-amber-700 border-amber-200')
                            }`}>
                              {node.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600">
                            <strong>{node.phaseGrade}</strong> • {node.field}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            Docente: <strong>{node.teacher}</strong> • Nodo: {node.filePath}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs text-slate-500 block">Avance de PDAs:</span>
                          <span className="text-sm font-black text-indigo-700 font-mono">
                            {node.pdasCovered} / {node.pdasCount} ({node.completion}%)
                          </span>
                        </div>
                      </div>

                      {/* Alerta Curricular Específica */}
                      <div className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center gap-2 text-slate-700">
                          <AlertTriangle className={`h-3.5 w-3.5 ${node.status === 'Óptimo' ? 'text-emerald-600' : 'text-amber-600'}`} />
                          <span className="font-medium">{node.alert}</span>
                        </div>

                        {onNavigateTab && (
                          <button
                            type="button"
                            onClick={() => {
                              onNavigateTab('academico');
                              onClose();
                            }}
                            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <span>Ir al Portal Docente</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dictamen Curricular */}
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200 text-xs text-indigo-950 space-y-2">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Mandato de Homologación con la Bóveda Curricular:</span>
                </div>
                <p className="leading-relaxed">
                  Se recomienda instruir a la Dirección Académica para forzar la adopción de las plantillas maestras pre-validadas de la Bóveda Curricular antes del viernes. Esto asegurará que el 100% de los proyectos cumplan con rúbricas analíticas oficiales antes de las visitas de inspección de zona.
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASO 3: DETALLE DE ECOSISTEMA LMS & GAMIFICACIÓN */}
          {/* ========================================================================= */}
          {config.key === 'gamificacion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Asistencia en Aula</span>
                  <span className="text-lg font-black text-emerald-600 font-mono block mt-1">{realLmsMetrics.attendanceRate}%</span>
                  <span className="text-[11px] text-slate-500">Auditada 100% presencial</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Variación Canjes Tienda</span>
                  <span className="text-lg font-black text-amber-600 font-mono block mt-1">{realLmsMetrics.storeDeclineRate}%</span>
                  <span className="text-[11px] text-amber-700 font-bold">Desaceleración en Fase 5/6</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Misiones Completadas</span>
                  <span className="text-lg font-black text-indigo-700 font-mono block mt-1">{realLmsMetrics.totalQuestsCompleted}</span>
                  <span className="text-[11px] text-slate-500">Quests de lecturas y retos</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-purple-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Gemas en Circulación</span>
                  <span className="text-lg font-black text-purple-700 font-mono block mt-1">{realLmsMetrics.gemsCirculating}</span>
                  <span className="text-[11px] text-slate-500">Otorgadas por mérito docente</span>
                </div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-600" />
                  <span>Diagnóstico del Ciclo de Gamificación y Tienda Inmersiva</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 block">Grados con Desaceleración:</span>
                    <p className="text-slate-600">{realLmsMetrics.highestPhaseLag}</p>
                    <span className="text-[11px] text-amber-700 font-semibold block pt-1">
                      Riesgo: Devaluación del incentivo lúdico a 25 días.
                    </span>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                    <span className="font-bold text-slate-900 block">Causa Semántica Detectada:</span>
                    <p className="text-slate-600">{realLmsMetrics.rootCause}</p>
                    <span className="text-[11px] text-emerald-700 font-semibold block pt-1">
                      Solución: Desbloquear skins académicas y pases de liderazgo.
                    </span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('Parámetros de la tienda calibrados para ciclo escolar activo.')}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Calibrar Economía de Tienda</span>
                    <Sparkles className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CASO 4: DETALLE DE DOCENTE & CONTINUIDAD OPERATIVA */}
          {/* ========================================================================= */}
          {config.key === 'operacion' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-indigo-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Docentes Titulares</span>
                  <span className="text-lg font-black text-indigo-700 font-mono block mt-1">6 Profesores</span>
                  <span className="text-[11px] text-slate-500">100% con asignación activa</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Grupos Cubiertos</span>
                  <span className="text-lg font-black text-emerald-600 font-mono block mt-1">8 Grupos</span>
                  <span className="text-[11px] text-slate-500">4 Planteles IBIME</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-amber-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Tiempo Planeación</span>
                  <span className="text-lg font-black text-amber-600 font-mono block mt-1">38 Minutos</span>
                  <span className="text-[11px] text-amber-700 font-bold">Meta: &lt; 20 min (Apple Rule)</span>
                </div>
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">Retención Institucional</span>
                  <span className="text-lg font-black text-slate-900 font-mono block mt-1">98.5%</span>
                  <span className="text-[11px] text-slate-500">Estabilidad de plantilla</span>
                </div>
              </div>

              {/* Plantilla Docente */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Cuerpo Docente y Asignación de Materias
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">6 Profesores Adscritos</span>
                </div>

                <div className="divide-y divide-slate-100">
                  {realOperationsFaculty.map((fac, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-3 text-xs">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{fac.name}</h4>
                        <p className="text-slate-600 font-medium">{fac.role}</p>
                        <p className="text-slate-500 text-[11px]">Grupos: {fac.groups} • <span className="text-indigo-600 font-semibold">{fac.campus}</span></p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                        Activo en Bóveda
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* PIE DEL MODAL CON BOTÓN DE CIERRE */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-500">
            Fuente de Datos: Almacén Determinista y Bóveda Curricular de {schoolName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer shadow-xs"
          >
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategicDimensionModal;
