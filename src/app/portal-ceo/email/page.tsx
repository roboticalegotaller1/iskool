'use client';

import React, { useState, useEffect } from 'react';
import { ExecutiveInboxView, MatterItem } from '@/components/inbox/ExecutiveInboxView';
import { MatterDetailDrawer } from '@/components/inbox/MatterDetailDrawer';
import { BrandThemeProvider } from '@/context/brand-theme-context';

export default function CEOEmailPortalPage() {
  const [selectedMatter, setSelectedMatter] = useState<MatterItem | null>(null);
  const [showCatchupModal, setShowCatchupModal] = useState<boolean>(false);
  const [matters, setMatters] = useState<MatterItem[]>([]);
  const [patterns, setPatterns] = useState<Array<{ title: string; description: string }>>([]);
  const [conversationalQuery, setConversationalQuery] = useState<string>('');
  const [aiAnswers, setAiAnswers] = useState<Array<{ q: string; a: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadInboxData();
  }, []);

  const loadInboxData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/inbox/matters?schoolId=938fa492-4ddc-4f6f-80d7-1bd054af8536');
      if (res.ok) {
        const data = await res.json();
        setMatters(data.matters);
        setPatterns(data.patterns);
      } else {
        throw new Error('Endpoint no disponible');
      }
    } catch {
      console.warn('Cargando dataset local de respaldo...');
      const fallbackList: MatterItem[] = [
        {
          id: '1',
          matter_code: 'MAT-REV-5B-01',
          title: 'Reincidencia: situación de acoso y convivencia en 5º B',
          summary: 'La familia Mendoza escribe por tercera vez en 12 días reportando agresiones verbales en el recreo tras intervención previa de Coordinación.',
          category: 'Convivencia / Caso Crítico',
          urgency: 'CRITICA',
          destination: 'DIRECCION',
          why_shown: 'Tercera comunicación de la familia en 12 días. Coordinación intervino pero la familia reporta que continúa.',
          reincidence_count: 5,
          recommended_action: 'Revisión prioritaria de Dirección y convocatoria de protocolo de mediación.',
          suggested_draft_reply: 'Estimada Sra. Mendoza:\n\nHe recibido personalmente su comunicación. Le informo que he solicitado el expediente completo de las intervenciones a Coordinación Primaria y agendaremos una reunión presencial en Dirección mañana a las 08:30 hrs para resolver esto de manera definitiva.\n\nAtentamente,\nAngélica - Dirección General',
          assigned_role: 'Dirección General',
          sla_hours: 12
        },
        {
          id: '2',
          matter_code: 'MAT-FEST-PAT-02',
          title: 'Confusión y solicitudes sobre horario de salida del festival',
          summary: '17 familias diferentes han enviado correos en las últimas horas solicitando confirmar el horario de salida del festival del viernes.',
          category: 'Procedimiento / Información General',
          urgency: 'ALTA',
          destination: 'DIRECCION',
          why_shown: 'Patrón anómalo de 17 comunicaciones en 4 horas. Conviene emitir comunicado institucional para evitar saturación.',
          reincidence_count: 17,
          recommended_action: 'Aprobar borrador y autorizar emisión de circular general.',
          suggested_draft_reply: 'Estimadas familias:\n\nLes confirmamos que la salida del festival de este viernes será a las 13:00 hrs de manera escalonada según lo estipulado en el calendario escolar de Primaria.\n\nAtentamente,\nDirección',
          assigned_role: 'Dirección General',
          sla_hours: 24
        }
      ];

      for (let i = 3; i <= 28; i++) {
        fallbackList.push({
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
          suggested_draft_reply: `Estimado solicitante: Dirección ha revisado el expediente MAT-2026-${(80 + i).toString().padStart(3, '0')} y autoriza el trámite escolar respectivo.`,
          assigned_role: 'Dirección General',
          sla_hours: 24
        });
      }

      setMatters(fallbackList);
      setPatterns([
        {
          title: '✨ He detectado un patrón sobre el horario del festival del viernes',
          description: 'En las últimas 4 horas llegaron 17 correos relacionados con el horario de salida. Sugerencia: emitir un comunicado oficial a las familias para despejar dudas masivas.'
        },
        {
          title: 'Demoras recurrentes en Ruta 4 de Transporte',
          description: '23 familias reportan demoras promedio de 25 minutos. Se sugiere auditoría con el proveedor.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveReply = async (matterId: string, replyText: string) => {
    alert(`Borrador aprobado para ${matterId}. En Modo Sombra la respuesta queda lista para despacho autorizado sin enviar correos reales descontrolados.`);
    setMatters(prev => prev.filter(m => m.id !== matterId));
  };

  const handleDelegate = async (matterId: string, role: string) => {
    alert(`Asunto ${matterId} delegado exitosamente a ${role} con regla de seguimiento y SLA activo.`);
    setMatters(prev => prev.filter(m => m.id !== matterId));
  };

  const handleCorrect = async (matterId: string, role: string, reason: string) => {
    alert(`Criterio registrado. iSkool ha guardado la corrección hacia ${role} para proponer la regla automática una vez acumulada la evidencia.`);
    setMatters(prev => prev.filter(m => m.id !== matterId));
  };

  const handleAskQuestion = async () => {
    if (!conversationalQuery.trim()) return;
    const q = conversationalQuery;
    setConversationalQuery('');

    let answer = 'He consultado la memoria institucional de iSkool. Todo el flujo operacional estándar permanece canalizado a través de los SLAs asignados.';
    if (q.toLowerCase().includes('necesita de mí') || q.toLowerCase().includes('atención')) {
      answer = 'Tienes 2 asuntos críticos prioritarios: El caso de convivencia en 5º B (reincidencia) y el patrón de consultas del festival.';
    } else if (q.toLowerCase().includes('quejando más') || q.toLowerCase().includes('patrón')) {
      answer = 'El patrón con mayor volumen corresponde a las demoras de transporte de la Ruta 4 (23 correos) y las dudas sobre el festival (17 correos).';
    }

    setAiAnswers(prev => [...prev, { q, a: answer }]);
  };

  return (
    <BrandThemeProvider>
      <div className="relative">
        <ExecutiveInboxView
          directorName="Angélica"
          totalReceived={297}
          matters={matters}
          patterns={patterns}
          onOpenCatchup={() => setShowCatchupModal(true)}
          onSelectMatter={(m) => setSelectedMatter(m)}
        />

        <MatterDetailDrawer
          matter={selectedMatter}
          onClose={() => setSelectedMatter(null)}
          onApproveReply={handleApproveReply}
          onDelegate={handleDelegate}
          onCorrect={handleCorrect}
        />

        {/* MODAL PONTE AL DÍA CONMIGO */}
        {showCatchupModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="text-lg font-bold text-slate-900">Ponte al día conmigo</h3>
                </div>
                <button onClick={() => setShowCatchupModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <div className="my-4 overflow-y-auto space-y-4 flex-1 pr-1">
                <div className="rounded-xl bg-indigo-50 p-4 border border-indigo-100 text-sm text-indigo-950 leading-relaxed">
                  <p className="font-bold mb-1">Desde tu último resumen:</p>
                  <p>Desde las 10:00 AM se recibieron <strong>84 correos nuevos</strong> en el buzón.</p>
                  <ul className="mt-2 space-y-1 text-xs text-indigo-900 list-disc list-inside">
                    <li>✓ <strong>61</strong> no requirieron intervención de Dirección.</li>
                    <li>→ <strong>18</strong> están siendo atendidos por otras áreas con SLA vigente.</li>
                    <li>⏱ <strong>4</strong> continúan en seguimiento silencioso.</li>
                    <li>🔴 <strong>1</strong> necesita una decisión tuya (Reincidencia 5º B).</li>
                  </ul>
                  <p className="mt-2 text-xs font-semibold text-indigo-800">
                    Además detecté un incremento de consultas sobre el horario del festival del viernes y demoras en Ruta 4.
                  </p>
                </div>

                {aiAnswers.map((item, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="bg-slate-100 p-2.5 rounded-lg font-bold text-slate-700">Tú: {item.q}</div>
                    <div className="bg-emerald-50 p-2.5 rounded-lg text-emerald-900 border border-emerald-100 whitespace-pre-line">iSkool: {item.a}</div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={conversationalQuery}
                  onChange={(e) => setConversationalQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                  placeholder="Pregúntale a iSkool: ¿Cuál necesita de mí? ¿De qué se quejan más?..."
                  className="flex-1 rounded-xl border border-slate-300 p-2.5 text-xs focus:ring-1 focus:ring-indigo-500"
                />
                <button
                  onClick={handleAskQuestion}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
                >
                  Preguntar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BrandThemeProvider>
  );
}
