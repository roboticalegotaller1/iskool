"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  HistoricalFigureBlock, 
  HistoricalFigureBlockData, 
  BookSpineStyle, 
  HistoricalFigureMoment, 
  HistoricalKeyLocation 
} from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { 
  Landmark, 
  Sparkles, 
  Database, 
  BookOpen, 
  MapPin, 
  Film, 
  HelpCircle, 
  ExternalLink, 
  RotateCcw, 
  Check, 
  Maximize2,
  Calendar,
  Save,
  Search,
  Trophy
} from 'lucide-react';
import { BOOK_SPINE_THEMES, MagicHistoryBookPlayer } from '@/components/history/MagicHistoryBookPlayer';

interface Props {
  block: HistoricalFigureBlock;
}

export const HistoricalFigureBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const data = block.data;

  const [inputName, setInputName] = useState(data.characterName || 'Josefa Ortiz de Domínguez');
  const [isSite, setIsSite] = useState(Boolean(data.isGeographicSite));
  const [selectedSpine, setSelectedSpine] = useState<BookSpineStyle>(data.bookSpineStyle || 'diario_republicano');
  const [isSearchingVault, setIsSearchingVault] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{ type: 'vault' | 'ai' | 'error'; message: string } | null>(
    data.isFromVault ? { type: 'vault', message: 'Nodo sincronizado desde la Bóveda Curricular (0 Tokens)' } : null
  );
  const [showBookPreviewModal, setShowBookPreviewModal] = useState(false);
  const [projectorMode, setProjectorMode] = useState(false);

  // Actualizar datos del bloque en el store
  const handleUpdateData = (patch: Partial<HistoricalFigureBlockData>) => {
    updateBlockData(block.id, patch);
  };

  // Consultar Bóveda Curricular o Generar con Motor de IA
  const handleSearchOrGenerate = async () => {
    if (!inputName.trim()) return;

    setIsSearchingVault(true);
    setFeedbackStatus(null);

    try {
      // 1. Consultar primero en la Bóveda Curricular (Cache-First)
      const vaultRes = await fetch(`/api/vault/historical-figures?name=${encodeURIComponent(inputName)}`);
      const vaultData = await vaultRes.json();

      if (vaultData.found && vaultData.figure) {
        handleUpdateData({
          ...vaultData.figure,
          characterName: inputName,
          bookSpineStyle: selectedSpine,
          isFromVault: true
        });
        setFeedbackStatus({
          type: 'vault',
          message: '¡Encontrado en Bóveda Curricular! Recuperado sin consumo de tokens (0 Tokens).'
        });
        setIsSearchingVault(false);
        return;
      }

      // 2. Si no existe, invocar generación con Motor de IA Pedagógica
      setFeedbackStatus({
        type: 'ai',
        message: 'No existe nodo previo. Generando con Motor de IA Pedagógica y guardando en Bóveda...'
      });

      const aiRes = await fetch('/api/ai/historical-figure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_figure',
          characterName: inputName,
          isGeographicSite: isSite,
          spineStyle: selectedSpine
        })
      });

      const aiData = await aiRes.json();
      if (aiData.success && aiData.figure) {
        handleUpdateData({
          ...aiData.figure,
          characterName: inputName,
          isGeographicSite: isSite,
          bookSpineStyle: selectedSpine
        });
        setFeedbackStatus({
          type: 'ai',
          message: '¡Generado con éxito! Persistido en Bóveda Curricular para futuros usos con 0 tokens.'
        });
      } else {
        setFeedbackStatus({
          type: 'error',
          message: 'Ocurrió una inconsistencia al generar. Verifica el nombre del personaje.'
        });
      }
    } catch (err: any) {
      setFeedbackStatus({
        type: 'error',
        message: `Error de conexión: ${err.message}`
      });
    } finally {
      setIsSearchingVault(false);
    }
  };

  const spineKeys: BookSpineStyle[] = [
    'codice_antiguo',
    'tomo_imperial',
    'diario_republicano',
    'grimorio_dorado',
    'cuaderno_cronista'
  ];

  return (
    <div className="space-y-6">
      {/* Cabecera del Editor Docente */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 flex items-center justify-center shadow-md font-black">
            <Landmark className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>Módulo: Personajes & Sitios Históricos 3D</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                Bóveda-First
              </span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Libro Mágico, mapa satelital funcional, novela gráfica, video cinematográfico y avatar en tiempo real.
            </p>
          </div>
        </div>

        {/* Botones de Previsualización y Modo Proyector */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setProjectorMode(false);
              setShowBookPreviewModal(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Probar Libro Mágico</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setProjectorMode(true);
              setShowBookPreviewModal(true);
            }}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
            title="Abrir en Modo Proyector de Aula (Pantalla Completa)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ================= FORMULARIO DOCENTE SIMPLIFICADO (REGLA 14) ================= */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-wide">
            Nombre del Personaje o Sitio Histórico (Variable X):
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Ej. Josefa Ortiz de Domínguez, Miguel Hidalgo, Benito Juárez o Santiago de Querétaro..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-amber-500"
            />

            <button
              type="button"
              disabled={isSearchingVault || !inputName.trim()}
              onClick={handleSearchOrGenerate}
              className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer shadow-md shrink-0"
            >
              {isSearchingVault ? <Sparkles className="w-4 h-4 animate-spin text-amber-400 dark:text-slate-950" /> : <Search className="w-4 h-4" />}
              <span>{isSearchingVault ? 'Consultando Bóveda...' : 'Buscar / Generar en Bóveda'}</span>
            </button>
          </div>

          <div className="pt-1 flex items-center gap-2">
            <input
              type="checkbox"
              id="isSiteCheck"
              checked={isSite}
              onChange={(e) => {
                setIsSite(e.target.checked);
                handleUpdateData({ isGeographicSite: e.target.checked });
              }}
              className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
            <label htmlFor="isSiteCheck" className="text-xs text-slate-600 dark:text-zinc-300 font-medium cursor-pointer">
              Es un enclave geográfico o arqueológico (mostrará vistas panorámicas y memoria del sitio).
            </label>
          </div>
        </div>

        {/* Mensaje de Estado / Bóveda */}
        {feedbackStatus && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedbackStatus.type === 'vault' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800' 
              : feedbackStatus.type === 'ai'
              ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
          }`}>
            <Database className="w-4 h-4 shrink-0" />
            <span>{feedbackStatus.message}</span>
          </div>
        )}

        {/* ================= ELECCIÓN DE LOS 5 TIPOS DE LOMOS DE LIBRO (REGLA 14) ================= */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <label className="text-xs font-black text-slate-700 dark:text-zinc-200 uppercase tracking-wide">
            Estilo de Lomo y Encuadernación del Libro Mágico (5 Diseños Disponibles):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {spineKeys.map((key) => {
              const theme = BOOK_SPINE_THEMES[key];
              const isSelected = selectedSpine === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    setSelectedSpine(key);
                    handleUpdateData({ bookSpineStyle: key });
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 relative overflow-hidden ${
                    isSelected 
                      ? 'border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/30' 
                      : 'border-slate-200 dark:border-zinc-750 bg-slate-50 dark:bg-zinc-900/60 hover:border-slate-300'
                  }`}
                >
                  <div className={`w-full h-4 rounded-full bg-gradient-to-r ${theme.spineGradient} shadow-inner`} />
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white truncate">
                      {theme.name}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {theme.badge}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ================= RESUMEN DE ELEMENTOS AUTO-CONFIGURADOS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: 4 Momentos Cómic */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-500" />
              <span>Novela Gráfica (4 Momentos)</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
              {data.moments?.length || 0} Viñetas
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Estilo cómic de época con iluminación cálida, viñetas numeradas y cajas narrativas.
          </p>
        </div>

        {/* Card 2: Hitos Cartográficos */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Mapa Satelital de Hitos</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
              {data.keyLocations?.length || 0} Pines
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Google Maps interactivo funcional con fotos, coordenadas geográficas y contexto histórico.
          </p>
        </div>

        {/* Card 3: 5 Preguntas Clave */}
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-amber-500" />
              <span>5 Preguntas Clave NEM</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {data.verificationQuestions?.length || 0} Reactivos
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            Preguntas formativas con opciones y retroalimentación pedagógica inmediata.
          </p>
        </div>
      </div>

      {/* ================= MODAL PREVIEW DEL LIBRO MÁGICO / MODO PROYECTOR ================= */}
      {showBookPreviewModal && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[99999] bg-black/90 backdrop-blur-md p-2 sm:p-6 flex flex-col justify-center items-center overflow-y-auto">
          <div className="w-full max-w-6xl my-auto">
            <MagicHistoryBookPlayer
              data={data}
              isProjectorModeInitially={projectorMode}
              onClose={() => setShowBookPreviewModal(false)}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
