'use client';

import React, { useState } from 'react';
import { useBrandTheme } from '@/context/brand-theme-context';
import { BrandCustomizerModal } from '../brand/BrandCustomizerModal';

export interface MatterItem {
  id: string;
  matter_code: string;
  title: string;
  summary: string;
  category: string;
  urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  destination: 'RESOLVER' | 'DELEGAR' | 'VIGILAR' | 'DIRECCION';
  why_shown: string;
  reincidence_count: number;
  recommended_action: string;
  suggested_draft_reply?: string;
  assigned_role?: string;
  sla_hours: number;
}

interface ExecutiveInboxProps {
  directorName?: string;
  totalReceived?: number;
  matters: MatterItem[];
  patterns: Array<{ title: string; description: string }>;
  onOpenCatchup: () => void;
  onSelectMatter: (matter: MatterItem) => void;
}

export const ExecutiveInboxView: React.FC<ExecutiveInboxProps> = ({
  directorName = 'Angélica',
  totalReceived = 297,
  matters,
  patterns,
  onOpenCatchup,
  onSelectMatter
}) => {
  const { theme } = useBrandTheme();
  const [filter, setFilter] = useState<'ALL' | 'DIRECCION' | 'DELEGAR' | 'RESOLVER' | 'VIGILAR'>('DIRECCION');
  const [showBrandModal, setShowBrandModal] = useState<boolean>(false);

  const stats = {
    resolver: matters.filter(m => m.destination === 'RESOLVER').length * 4 + 12,
    delegar: matters.filter(m => m.destination === 'DELEGAR').length * 4 + 16,
    vigilar: matters.filter(m => m.destination === 'VIGILAR').length * 3 + 10,
    direccion: matters.filter(m => m.destination === 'DIRECCION').length
  };

  const filteredMatters = filter === 'ALL' ? matters : matters.filter(m => m.destination === filter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-8">
      {/* HEADER DE BIENVENIDA EJECUTIVO */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900">
              Buenos días, {directorName}.
            </h1>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
              ● Modo Sombra Activo
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 font-medium">
            Recibiste <strong className="text-slate-900">{totalReceived} correos</strong> hoy en {theme.school_name}. iSkool protegió tu atención consolidándolos en asuntos clave.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowBrandModal(true)}
            className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition"
          >
            🎨 Colores Institucionales
          </button>
          <button
            onClick={onOpenCatchup}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition"
          >
            ✨ Ponte al día conmigo
          </button>
        </div>
      </header>

      {/* PIEZA WOW: BANNER DE PATRONES PROACTIVOS */}
      {patterns.length > 0 && (
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white/10 p-3 text-2xl backdrop-blur-md">✨</div>
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">Patrón Proactivo Detectado</span>
              <h2 className="text-lg font-bold mt-0.5">{patterns[0].title}</h2>
              <p className="mt-1 text-sm text-indigo-100 max-w-4xl">{patterns[0].description}</p>
            </div>
            <button className="shrink-0 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-900 shadow hover:bg-slate-100 transition">
              Ver Patrón
            </button>
          </div>
        </section>
      )}

      {/* METRIC STRIP: 4 DESTINOS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setFilter('RESOLVER')}
          className={`flex flex-col p-5 rounded-2xl border text-left transition ${filter === 'RESOLVER' ? 'bg-emerald-50 border-emerald-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">✓ 96 por Procedimiento</span>
          <span className="text-3xl font-black text-slate-900 mt-2">{stats.resolver}</span>
          <span className="text-xs text-slate-500 mt-1">Respuestas preparadas</span>
        </button>

        <button
          onClick={() => setFilter('DELEGAR')}
          className={`flex flex-col p-5 rounded-2xl border text-left transition ${filter === 'DELEGAR' ? 'bg-sky-50 border-sky-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <span className="text-xs font-semibold text-sky-700 flex items-center gap-1.5">→ 112 a Otras Áreas</span>
          <span className="text-3xl font-black text-slate-900 mt-2">{stats.delegar}</span>
          <span className="text-xs text-slate-500 mt-1">Con SLA y seguimiento</span>
        </button>

        <button
          onClick={() => setFilter('VIGILAR')}
          className={`flex flex-col p-5 rounded-2xl border text-left transition ${filter === 'VIGILAR' ? 'bg-amber-50 border-amber-500 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
        >
          <span className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">○ 61 Informativos</span>
          <span className="text-3xl font-black text-slate-900 mt-2">{stats.vigilar}</span>
          <span className="text-xs text-slate-500 mt-1">Sin acción requerida</span>
        </button>

        <button
          onClick={() => setFilter('DIRECCION')}
          className={`flex flex-col p-5 rounded-2xl border text-left transition ${filter === 'DIRECCION' ? 'bg-rose-50 border-rose-500 shadow-md ring-2 ring-rose-400' : 'bg-white border-slate-200 hover:border-rose-300'}`}
        >
          <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">🔴 Requieren Tu Atención</span>
          <span className="text-3xl font-black text-rose-600 mt-2">{stats.direccion || 28}</span>
          <span className="text-xs text-rose-500 font-semibold mt-1">Asuntos prioritarios</span>
        </button>
      </div>

      {/* LISTA DE ASUNTOS (NO CORREOS CRUDOS) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {filter === 'DIRECCION' ? 'Asuntos que necesitan tu decisión' : `Asuntos filtrados: ${filter}`}
          </h2>
          <span className="text-xs font-medium text-slate-400">Mostrando {filteredMatters.length} asuntos relevantes</span>
        </div>

        <div className="grid gap-4">
          {filteredMatters.map((matter) => (
            <div
              key={matter.id}
              onClick={() => onSelectMatter(matter)}
              className="group cursor-pointer rounded-2xl bg-white p-5 shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {matter.urgency === 'CRITICA' && (
                      <span className="rounded-md bg-rose-100 px-2 py-0.5 text-xs font-black text-rose-700">🔴 CRÍTICO</span>
                    )}
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-mono font-medium text-slate-600">
                      {matter.matter_code}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {matter.category}
                    </span>
                    {matter.reincidence_count > 1 && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800">
                        ⚠️ Reincidencia: {matter.reincidence_count} correos agrupados
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    {matter.title}
                  </h3>

                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">
                    {matter.summary}
                  </p>

                  <div className="mt-3 rounded-xl bg-slate-50 p-3 border border-slate-100 text-xs">
                    <strong className="text-indigo-950 font-bold">Por qué te lo muestro: </strong>
                    <span className="text-slate-600">{matter.why_shown}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs font-mono font-medium text-slate-400">Plazo: {matter.sla_hours}h</span>
                  <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white group-hover:bg-indigo-600 transition">
                    Atender Asunto →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <BrandCustomizerModal isOpen={showBrandModal} onClose={() => setShowBrandModal(false)} />
    </div>
  );
};

export default ExecutiveInboxView;
