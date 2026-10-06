'use client';

import React, { useState, useEffect } from 'react';
import { ExecutiveInboxView, MatterItem } from '@/components/inbox/ExecutiveInboxView';
import { MatterDetailDrawer } from '@/components/inbox/MatterDetailDrawer';
import { BrandThemeProvider } from '@/context/brand-theme-context';
import { ExecutiveCatchupService, CatchupSummary } from '@/lib/services/executive-catchup.service';
import { createClient } from '@supabase/supabase-js';

const DEMO_SCHOOL_ID = '938fa492-4ddc-4f6f-80d7-1bd054af8536';

// 28 Asuntos demostrativos para Colegio Horizonte (Reducción de 297 correos a 28 asuntos clave)
const INITIAL_DEMO_MATTERS: MatterItem[] = [
  {
    id: 'mat-001',
    matter_code: 'MAT-2026-081',
    title: 'Reincidencia: situación de acoso y convivencia en 5º B',
    summary: 'La Sra. Patricia Mendoza reporta por tercera vez agresión verbal continuada en el recreo tras intervención previa de Coordinación.',
    category: 'Convivencia Escolar',
    urgency: 'CRITICA',
    destination: 'DIRECCION',
    why_shown: 'Tercera reincidencia en 14 días. Superó el umbral de resolución de Coordinación Primaria y requiere intervención directiva.',
    reincidence_count: 5,
    recommended_action: 'Citar a ambas familias y al tutor de grupo para firma de acuerdo pedagógico y protocolo de mediación escolar.',
    suggested_draft_reply: 'Estimada Sra. Mendoza: He revisado personalmente el historial del caso con Coordinación Primaria. Le solicito asistir mañana a las 8:30 hrs para una reunión en Dirección General con el equipo de psicopedagogía.',
    assigned_role: 'Dirección General',
    sla_hours: 12
  },
  {
    id: 'mat-002',
    matter_code: 'MAT-2026-082',
    title: 'Notificación Oficial Urgente de Inspección SEP - Validación Matrícula',
    summary: 'Requerimiento de firma autógrafa y validación de la estadística 911 de inicio de ciclo escolar ante Supervisión de Zona.',
    category: 'Gestión Institucional',
    urgency: 'ALTA',
    destination: 'DIRECCION',
    why_shown: 'Documento normativo de carácter vinculante emitido por la autoridad educativa con plazo perentorio.',
    reincidence_count: 1,
    recommended_action: 'Validar reporte de Control Escolar y rubricar la constancia oficial de matrícula para entrega presencial.',
    suggested_draft_reply: 'Estimado Supervisor: Confirmamos de recibido el oficio. La documentación solicitada debidamente firmada por Dirección estará disponible el día de mañana.',
    assigned_role: 'Dirección General',
    sla_hours: 24
  },
  {
    id: 'mat-003',
    matter_code: 'MAT-2026-083',
    title: 'Incidencia de demoras reiteradas en Transporte - Ruta 4',
    summary: '23 familias reportan demoras promedio de 25 minutos en la parada de Valle Real durante la última semana.',
    category: 'Logística y Transporte',
    urgency: 'ALTA',
    destination: 'DELEGAR',
    why_shown: 'Concentración anómala de reportes en la misma unidad. Se delega a Administración con supervisión pasiva.',
    reincidence_count: 23,
    recommended_action: 'Solicitar a Administración auditoría de tiempos de recorrido del concesionario de transporte escolar.',
    suggested_draft_reply: 'Estimadas familias de la Ruta 4: Administración ha iniciado la verificación de telemetría GPS con el proveedor para regularizar el servicio inmediatamente.',
    assigned_role: 'Administración',
    sla_hours: 24
  },
  {
    id: 'mat-004',
    matter_code: 'MAT-2026-084',
    title: 'Consultas masivas sobre hora de salida en Festival de Primavera',
    summary: '17 familias preguntan el horario exacto de conclusión del festival del viernes para coordinar traslados.',
    category: 'Eventos Institucionales',
    urgency: 'MEDIA',
    destination: 'RESOLVER',
    why_shown: 'Asunto de alta frecuencia resuelto con información oficial de la Bóveda Curricular.',
    reincidence_count: 17,
    recommended_action: 'Emitir circular oficial recordando que el evento concluye a las 13:00 hrs.',
    suggested_draft_reply: 'Estimada comunidad: Les informamos que las actividades del Festival de Primavera concluyen a las 13:00 hrs. El transporte escolar operará en horario habitual de salida.',
    assigned_role: 'Coordinación Primaria',
    sla_hours: 48
  }
];

// Generar los 24 asuntos restantes para sumar exactamente 28 asuntos de Dirección
for (let i = 5; i <= 28; i++) {
  INITIAL_DEMO_MATTERS.push({
    id: `mat-${i.toString().padStart(3, '0')}`,
    matter_code: `MAT-2026-${(80 + i).toString().padStart(3, '0')}`,
    title: `Asunto Ejecutivo Directivo #${i} - Gestión y Supervisión Escolar`,
    summary: `Expediente administrativo canalizado para visto bueno de Dirección con procedencia institucional verificada.`,
    category: i % 2 === 0 ? 'Gestión Institucional' : 'Asuntos Académicos',
    urgency: i <= 8 ? 'ALTA' : 'MEDIA',
    destination: 'DIRECCION',
    why_shown: 'Asunto catalogado dentro de las facultades exclusivas de Dirección por normativa interna.',
    reincidence_count: 1,
    recommended_action: 'Revisar expediente y validar resolución sugerida por el equipo de coordinación.',
    suggested_draft_reply: `Estimado solicitante: Dirección ha revisado el folio MAT-2026-${(80 + i).toString().padStart(3, '0')} y aprueba la resolución correspondiente conforme a la normativa vigente.`,
    assigned_role: 'Dirección General',
    sla_hours: 24
  });
}

function EmailPortalPageContent() {
  const [matters, setMatters] = useState<MatterItem[]>(INITIAL_DEMO_MATTERS);
  const [selectedMatter, setSelectedMatter] = useState<MatterItem | null>(null);
  const [showCatchupModal, setShowCatchupModal] = useState<boolean>(false);
  const [catchupSummary, setCatchupSummary] = useState<CatchupSummary | null>(null);
  const [isLoadingCatchup, setIsLoadingCatchup] = useState<boolean>(false);

  const patterns = [
    {
      title: '✨ Incremento anómalo de consultas sobre horario del festival',
      description: 'Se detectaron 17 correos en las últimas horas relacionados con la hora de salida del festival del viernes. Esto supera en un 400% la frecuencia habitual.'
    },
    {
      title: 'Incidencias concentradas en Transporte - Ruta 4',
      description: '23 familias reportan demoras reiteradas en la Ruta 4 durante los últimos 7 días. Se recomienda auditoría de tiempos con Administración.'
    }
  ];

  const handleOpenCatchup = async () => {
    setShowCatchupModal(true);
    setIsLoadingCatchup(true);
    try {
      const summary = await ExecutiveCatchupService.generateCatchup(DEMO_SCHOOL_ID);
      setCatchupSummary(summary);
    } catch {
      // Contingencia explicable
      setCatchupSummary({
        period_label: 'Últimas horas',
        total_received: 297,
        no_director_needed: 96,
        in_progress_other_areas: 112,
        monitored_silent: 61,
        needs_director_attention: 28,
        urgent_matters: [
          {
            id: 'mat-001',
            matter_code: 'MAT-2026-081',
            title: 'Reincidencia: situación de acoso y convivencia en 5º B',
            why_shown: 'Tercera reincidencia en 14 días. Requiere intervención directiva.',
            category: 'Convivencia Escolar'
          }
        ],
        detected_patterns: patterns,
        ai_dialogue_brief: 'Desde tu último resumen, se procesaron 297 correos recibidos. ✓ 96 fueron resueltos por procedimiento institucional. → 112 están siendo atendidos por las coordinaciones. ⏱ 61 permanecen en seguimiento silencioso. 🔴 28 requieren una decisión tuya. Además, he detectado un incremento de consultas sobre festival y retrasos en Ruta 4.'
      });
    } finally {
      setIsLoadingCatchup(false);
    }
  };

  const handleApproveReply = async (matterId: string, replyText: string) => {
    setMatters(prev => prev.map(m => m.id === matterId ? { ...m, destination: 'RESOLVER' } : m));
    setSelectedMatter(null);
  };

  const handleDelegate = async (matterId: string, role: string) => {
    setMatters(prev => prev.map(m => m.id === matterId ? { ...m, destination: 'DELEGAR', assigned_role: role } : m));
    setSelectedMatter(null);
  };

  const handleCorrect = async (matterId: string, correctedRole: string, reason: string) => {
    setMatters(prev => prev.map(m => m.id === matterId ? { ...m, destination: 'DELEGAR', assigned_role: correctedRole } : m));
    setSelectedMatter(null);
  };

  return (
    <div className="relative">
      <ExecutiveInboxView
        directorName="Angélica"
        totalReceived={297}
        matters={matters}
        patterns={patterns}
        onOpenCatchup={handleOpenCatchup}
        onSelectMatter={matter => setSelectedMatter(matter)}
      />

      <MatterDetailDrawer
        matter={selectedMatter}
        onClose={() => setSelectedMatter(null)}
        onApproveReply={handleApproveReply}
        onDelegate={handleDelegate}
        onCorrect={handleCorrect}
      />

      {/* MODAL DIALOGADO "PONTE AL DÍA CONMIGO" */}
      {showCatchupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">✨</span>
                <h3 className="text-lg font-bold text-slate-900">Ponte al día conmigo</h3>
              </div>
              <button
                onClick={() => setShowCatchupModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {isLoadingCatchup ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Consultando memoria institucional y agrupando novedades...
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100 text-sm text-indigo-950 font-medium leading-relaxed">
                    {catchupSummary?.ai_dialogue_brief || 'Desde tu último resumen, se procesaron 297 correos recibidos. Además, he detectado un incremento sobre el festival y la Ruta 4.'}
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3 border border-slate-200">
                      <span className="text-slate-500 block">Atención Protegida</span>
                      <strong className="text-slate-900 text-base">269 correos</strong> resueltos/delegados
                    </div>
                    <div className="rounded-lg bg-rose-50 p-3 border border-rose-200">
                      <span className="text-rose-600 block">Pendientes Dirección</span>
                      <strong className="text-rose-700 text-base">{catchupSummary?.needs_director_attention || 28} asuntos</strong>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-slate-500">Patrones detectados:</span>
                    <ul className="text-xs space-y-1 text-slate-700">
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                        <span>Consultas sobre horario del festival del viernes</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        <span>Demoras recurrentes reportadas en Ruta 4</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowCatchupModal(false)}
                className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Entendido, gracias
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function EmailPortalPage() {
  return (
    <BrandThemeProvider>
      <EmailPortalPageContent />
    </BrandThemeProvider>
  );
}
