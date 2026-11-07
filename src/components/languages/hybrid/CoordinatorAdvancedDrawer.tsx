"use client";

import React, { useState } from 'react';
import { LanguageCode } from '@/store/useLanguagesStore';
import { CurricularWeek, CurricularLesson } from '@/components/languages/data/curriculumTypes';
import { BloomBktGamifiedCockpit } from '@/components/languages/BloomBktGamifiedCockpit';
import MethodologyCommandCenter from '@/components/languages/MethodologyCommandCenter';
import { LanguageAnalyticsCharts } from '@/components/languages/LanguageAnalyticsCharts';
import { Curriculum12PhasesExplorer } from '@/components/languages/Curriculum12PhasesExplorer';
import { HardwareAudioTester } from '@/components/languages/HardwareAudioTester';
import {
  X,
  BarChart3,
  Award,
  Layers,
  Activity,
  Sparkles,
  CheckCircle2,
  Download,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: LanguageCode;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  cenniLabel: string;
  phaseLabel: string;
  isLightMode: boolean;
  onLanguageChange: (lang: LanguageCode) => void;
  onLoadWeekLessonToWorkshop: (week: CurricularWeek, lesson: CurricularLesson) => void;
  onSelectLessonTemplate: (template: any) => void;
  onTriggerToast: (msg: string) => void;
}

export const CoordinatorAdvancedDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  level,
  cenniLabel,
  phaseLabel,
  isLightMode,
  onLanguageChange,
  onLoadWeekLessonToWorkshop,
  onSelectLessonTemplate,
  onTriggerToast,
}) => {
  const [activeDeepModule, setActiveDeepModule] = useState<
    'overview' | 'bloom_bkt' | 'methodology_5e' | 'analytics' | 'phases_12' | 'hardware'
  >('overview');

  if (!isOpen) return null;

  const cambridgeEquivalent =
    level === 'A1'
      ? 'A1 Movers'
      : level === 'A2'
        ? 'A2 Key (KET)'
        : level === 'B1'
          ? 'B1 Preliminary (PET)'
          : 'B2 First (FCE)';

  const delfEquivalent =
    level === 'A1'
      ? 'DELF Prim / A1'
      : level === 'A2'
        ? 'DELF A2 Scolaire'
        : level === 'B1'
          ? 'DELF B1 Junior'
          : 'DELF B2 Scolaire';

  return (
    <div className="rounded-3xl bg-[#334155] text-white border-2 border-slate-600 shadow-2xl p-5 sm:p-7 space-y-6 animate-fade-in">
      {/* Encabezado Ejecutivo del Panel de Coordinación */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Panel de Coordinación Académica y Auditoría Curricular{' '}
            <span className="text-slate-300 font-bold">(Oculto en Modo Aula)</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-900 text-slate-200 cursor-pointer border border-slate-600"
          title="Ocultar Panel de Coordinación y volver a Modo Aula"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Cinta Informativa de Curva de Aprendizaje Cero */}
      <div className="p-3.5 rounded-2xl bg-[#1E3A5F] border border-sky-400/40 text-sky-100 text-xs sm:text-sm font-bold flex items-center gap-2.5 shadow-inner">
        <span>💡</span>
        <span>
          Este panel técnico permanece oculto durante la clase para garantizar una curva de aprendizaje cero a los docentes.
        </span>
      </div>

      {/* Sub-navegador de Módulos Especializados para el Coordinador */}
      <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-slate-600">
        <button
          type="button"
          onClick={() => setActiveDeepModule('overview')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeDeepModule === 'overview'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Resumen Ejecutivo (3 Tarjetas)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeepModule('bloom_bkt')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeDeepModule === 'bloom_bkt'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          <span>Cabina Cognitiva Bloom-BKT Completa</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeepModule('methodology_5e')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeDeepModule === 'methodology_5e'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Metodología CEFR 5E</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeepModule('analytics')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeDeepModule === 'analytics'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Analítica Gráfica CEFR</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeepModule('phases_12')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeDeepModule === 'phases_12'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Explorador de 12 Fases</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDeepModule('hardware')}
          className={`px-3.5 py-2 rounded-xl text-xs font-black cursor-pointer transition-all flex items-center gap-1.5 ${
            activeDeepModule === 'hardware'
              ? 'bg-sky-500 text-slate-950 shadow-md'
              : 'bg-slate-800/80 text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Diagnóstico de Micrófono & Audio</span>
        </button>
      </div>

      {activeDeepModule === 'overview' && (
        /* LAS 3 TARJETAS EJECUTIVAS DE PANTALLA HÍBRIDA 8 */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 text-slate-900">
          {/* Tarjeta 1: Radar Hexagonal de Dominio Cognitivo & BKT */}
          <div className="p-5 rounded-2xl bg-[#E2E8F0] border border-slate-300 shadow-md flex flex-col justify-between space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Radar Hexagonal de Dominio Cognitivo & BKT
            </h3>

            {/* SVG Radar Hexagonal */}
            <div className="flex items-center justify-center py-2">
              <svg viewBox="-45 0 350 220" className="w-full max-w-[310px] h-auto">
                {/* Hexágono exterior */}
                <polygon
                  points="130,22 215,66 215,154 130,198 45,154 45,66"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1.5"
                />
                {/* Hexágono medio */}
                <polygon
                  points="130,52 188,82 188,138 130,168 72,138 72,82"
                  fill="none"
                  stroke="#94A3B8"
                  strokeWidth="1"
                />
                {/* Ejes */}
                <line x1="130" y1="22" x2="130" y2="198" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="45" y1="66" x2="215" y2="154" stroke="#CBD5E1" strokeWidth="1" />
                <line x1="215" y1="66" x2="45" y2="154" stroke="#CBD5E1" strokeWidth="1" />
                {/* Polígono de Dominio Activo */}
                <polygon
                  points="130,32 204,72 196,144 130,184 62,144 58,74"
                  fill="rgba(37, 99, 235, 0.38)"
                  stroke="#1D4ED8"
                  strokeWidth="2.5"
                />
                {/* Etiquetas */}
                <text x="130" y="14" textAnchor="middle" className="text-[11px] font-bold fill-slate-900">
                  Fonética
                </text>
                <text x="222" y="68" textAnchor="start" className="text-[11px] font-bold fill-slate-900">
                  Fluidez
                </text>
                <text x="220" y="158" textAnchor="start" className="text-[10px] font-bold fill-slate-900">
                  Rango Léxico
                </text>
                <text x="130" y="214" textAnchor="middle" className="text-[11px] font-bold fill-slate-900">
                  Gramática
                </text>
                <text x="38" y="158" textAnchor="end" className="text-[10px] font-bold fill-slate-900">
                  Comprensión
                </text>
                <text x="38" y="68" textAnchor="end" className="text-[10px] font-bold fill-slate-900">
                  Pragmática
                </text>
              </svg>
            </div>
          </div>

          {/* Tarjeta 2: Matriz de Equivalencia de las 6 Instituciones Oficiales */}
          <div className="p-5 rounded-2xl bg-[#E2E8F0] border border-slate-300 shadow-md flex flex-col justify-between space-y-4">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              Matriz de Equivalencia de las 6 Instituciones Oficiales
            </h3>

            <div className="rounded-xl overflow-hidden border border-slate-400 text-xs font-bold">
              <div className="grid grid-cols-12 bg-slate-700 text-white px-3.5 py-2.5 border-b border-slate-500">
                <span className="col-span-7">SEP CENNI</span>
                <span className="col-span-5 font-black">{cenniLabel.split('(')[0].trim()}</span>
              </div>
              <div className="grid grid-cols-12 bg-slate-600 text-white px-3.5 py-2.5 border-b border-slate-500">
                <span className="col-span-7">CEFR</span>
                <span className="col-span-5 font-black">{level}.2</span>
              </div>
              <div className="grid grid-cols-12 bg-slate-700 text-white px-3.5 py-2.5 border-b border-slate-500">
                <span className="col-span-7">Certificación Británica</span>
                <span className="col-span-5 font-black">{cambridgeEquivalent}</span>
              </div>
              <div className="grid grid-cols-12 bg-slate-600 text-white px-3.5 py-2.5 border-b border-slate-500">
                <span className="col-span-7">DELF Francés</span>
                <span className="col-span-5 font-black">{delfEquivalent}</span>
              </div>
              <div className="grid grid-cols-12 bg-slate-700 text-white px-3.5 py-2.5 border-b border-slate-500">
                <span className="col-span-7">Metodología CELTA</span>
                <span className="col-span-5 font-black">PPP + CCQ</span>
              </div>
              <div className="grid grid-cols-12 bg-slate-600 text-white px-3.5 py-2.5">
                <span className="col-span-7">NEM 2024</span>
                <span className="col-span-5 font-black">Lenguajes</span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Salud Técnica y Bóveda Curricular */}
          <div className="p-5 rounded-2xl bg-[#E2E8F0] border border-slate-300 shadow-md flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                Salud Técnica y Bóveda Curricular
              </h3>

              <div className="space-y-2.5">
                <div className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black inline-block">
                  40/40 Semanas Sincronizadas en Bóveda
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black block w-fit">
                  Motor 3D 60 FPS Activo
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black block w-fit">
                  Motor de IA Pedagógica: 42ms
                </div>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-extrabold flex items-center gap-2 w-fit">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sincronización Curricular Validada</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onTriggerToast('📊 Sábana de Auditoría Institucional exportada exitosamente')
              }
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-black text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-indigo-600" />
              <span>📊 Exportar Sábana de Auditoría Institucional</span>
            </button>
          </div>
        </div>
      )}

      {activeDeepModule === 'bloom_bkt' && (
        <div className="pt-2">
          <BloomBktGamifiedCockpit
            role="teacher"
            activeLanguage={language}
            onLanguageChange={onLanguageChange}
            onLoadWeekLessonToWorkshop={onLoadWeekLessonToWorkshop}
          />
        </div>
      )}

      {activeDeepModule === 'methodology_5e' && (
        <div className="pt-2 text-slate-900">
          <MethodologyCommandCenter
            activeLanguage={language === 'fr' ? 'fr-FR' : 'en-US'}
            currentCefrLevel={level}
            currentCenniBand={cenniLabel}
            currentPhaseLabel={phaseLabel}
            activeWeekNumber={1}
            isLightMode={isLightMode}
            compactBannerOnly={false}
            onNavigateToTool={(toolTab) => {
              if (toolTab === 'analytics') setActiveDeepModule('analytics');
              else if (toolTab === 'curriculum') setActiveDeepModule('phases_12');
              else if (toolTab === 'hardware') setActiveDeepModule('hardware');
              else onClose();
            }}
          />
        </div>
      )}

      {activeDeepModule === 'analytics' && (
        <div className="pt-2 text-slate-900">
          <LanguageAnalyticsCharts language={language} isLightMode={isLightMode} />
        </div>
      )}

      {activeDeepModule === 'phases_12' && (
        <div className="pt-2 text-slate-900">
          <Curriculum12PhasesExplorer
            language={language}
            isLightMode={isLightMode}
            onSelectLessonTemplate={onSelectLessonTemplate}
          />
        </div>
      )}

      {activeDeepModule === 'hardware' && (
        <div className="pt-2 text-slate-900">
          <HardwareAudioTester language={language} isLightMode={isLightMode} />
        </div>
      )}
    </div>
  );
};
