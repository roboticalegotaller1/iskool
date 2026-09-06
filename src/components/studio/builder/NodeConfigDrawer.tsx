"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { BlockDispatcher } from './blocks/BlockDispatcher';
import { BLOCK_META } from './SortableBlockWrapper';
import { 
  X, 
  Settings2, 
  Flag, 
  ArrowRight, 
  Trash2, 
  Copy, 
  Check, 
  Link2, 
  Layers,
  AlertCircle,
  AlertTriangle 
} from 'lucide-react';

export const NodeConfigDrawer: React.FC = () => {
  const {
    blocks,
    connections,
    selectedBlockId,
    startNodeId,
    isNodeConfigDrawerOpen,
    setIsNodeConfigDrawerOpen,
    updateBlockTitle,
    setStartNodeId,
    duplicateBlock,
    removeBlock,
    addConnection,
    removeConnection
  } = useActivityBuilderStore();

  const [validationError, setValidationError] = React.useState<string | null>(null);

  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // Auto-limpiar error si el bloque pasa a ser válido
  React.useEffect(() => {
    if (!selectedBlock) {
      setValidationError(null);
      return;
    }

    if (selectedBlock.type === 'quiz_question') {
      const { correctIndex, options } = selectedBlock.data;
      if (typeof correctIndex === 'number' && correctIndex >= 0 && correctIndex < (options?.length || 0)) {
        setValidationError(null);
      }
    } else if (selectedBlock.type === 'timed_reading_block') {
      const { comprehensionQuestions } = selectedBlock.data;
      const allValid = !comprehensionQuestions || comprehensionQuestions.every(
        (q: any) => typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex < (q.options?.length || 0)
      );
      if (allValid) {
        setValidationError(null);
      }
    }
  }, [selectedBlock]);

  // Validar si el bloque cumple con los requisitos pedagógicos antes de permitir salir
  const handleAttemptClose = () => {
    if (!selectedBlock) {
      setIsNodeConfigDrawerOpen(false);
      setValidationError(null);
      return;
    }

    if (selectedBlock.type === 'quiz_question') {
      const { correctIndex, options } = selectedBlock.data;
      if (
        correctIndex === undefined ||
        correctIndex === null ||
        correctIndex < 0 ||
        correctIndex >= (options?.length || 0)
      ) {
        setValidationError('⚠️ Debes seleccionar cuál de las opciones es la respuesta correcta (haz clic sobre la opción deseada para activar el check verde) antes de guardar y salir.');
        return;
      }
    }

    if (selectedBlock.type === 'timed_reading_block') {
      const { comprehensionQuestions } = selectedBlock.data;
      if (comprehensionQuestions && comprehensionQuestions.length > 0) {
        const unassignedIdx = comprehensionQuestions.findIndex(
          (q: any) => q.correctIndex === undefined || q.correctIndex === null || q.correctIndex < 0 || q.correctIndex >= (q.options?.length || 0)
        );
        if (unassignedIdx >= 0) {
          setValidationError(`⚠️ La pregunta de comprensión #${unassignedIdx + 1} requiere que selecciones una respuesta correcta.`);
          return;
        }
      }
    }

    setValidationError(null);
    setIsNodeConfigDrawerOpen(false);
  };

  if (!isNodeConfigDrawerOpen || !selectedBlock) return null;

  const meta = BLOCK_META[selectedBlock.type] || BLOCK_META.text_narrative;
  const isStart = startNodeId === selectedBlock.id || selectedBlock.isStartNode;

  // Conexiones de este nodo
  const outgoingConnections = connections.filter(c => c.sourceNodeId === selectedBlock.id);
  const incomingConnections = connections.filter(c => c.targetNodeId === selectedBlock.id);

  // Otros nodos disponibles para conectar
  const availableTargetNodes = blocks.filter(b => b.id !== selectedBlock.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Telón de Fondo Difuminado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleAttemptClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Panel Lateral Deslizante */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="relative w-full max-w-xl bg-white dark:bg-zinc-900 h-full shadow-2xl border-l border-slate-200 dark:border-zinc-800 flex flex-col z-50"
        >
          {/* Cabecera del Panel */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-zinc-850/80">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${meta.color || 'from-purple-600 to-indigo-600'} flex items-center justify-center text-white shrink-0 shadow-md`}>
                <meta.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    {meta.label}
                  </span>
                  {isStart && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] border border-emerald-300 flex items-center gap-1">
                      <Flag className="w-2.5 h-2.5" />
                      <span>INICIO</span>
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={selectedBlock.title}
                  onChange={(e) => updateBlockTitle(selectedBlock.id, e.target.value)}
                  className="text-sm font-black text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-purple-500 focus:outline-none w-full transition-colors"
                  placeholder="Título del nodo..."
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              aria-label="Cerrar panel de configuración"
              className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-rose-500 hover:text-white text-slate-500 dark:text-zinc-400 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo del Editor del Bloque */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            {/* Editor de Contenido del Bloque */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 bg-slate-50/50 dark:bg-zinc-950/40 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Settings2 className="w-3.5 h-3.5" />
                <span>Configuración de Contenido</span>
              </h4>

              <BlockDispatcher block={selectedBlock} />
            </div>

            {/* Gestión de Rutas y Conexiones del Nodo */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 p-4 bg-white dark:bg-zinc-900 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                <span>Flujo & Conexiones del Grafo</span>
              </h4>

              {/* Conexiones Salientes */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 block">
                  Nodo Siguiente (Salida ➔):
                </label>

                {outgoingConnections.length > 0 ? (
                  <div className="space-y-1.5">
                    {outgoingConnections.map((conn) => {
                      const target = blocks.find(b => b.id === conn.targetNodeId);
                      return (
                        <div key={conn.id} className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs">
                          <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                            <ArrowRight className="w-3.5 h-3.5 text-purple-600" />
                            <span>{target?.title || 'Nodo Destino'}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => removeConnection(conn.id)}
                            className="text-rose-500 hover:text-rose-700 text-[10px] font-bold cursor-pointer"
                          >
                            Desconectar ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    ⚠️ Este nodo no tiene flecha saliente (actúa como Nodo Final del juego).
                  </p>
                )}

                {/* Selector rápido para añadir conexión */}
                {availableTargetNodes.length > 0 && (
                  <div className="pt-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addConnection(selectedBlock.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="w-full text-xs p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="" disabled>+ Conectar flecha con otro nodo...</option>
                      {availableTargetNodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          ➔ {n.title} ({n.type})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Alerta de Validación Pedagógica si falta asignar respuesta correcta */}
          {validationError && (
            <div className="mx-4 sm:mx-6 mb-2 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-400 dark:border-rose-700 text-xs font-bold text-rose-800 dark:text-rose-200 flex items-start gap-2.5 shadow-lg shadow-rose-500/10 animate-bounce">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-rose-900 dark:text-rose-100 block">
                  Acción Requerida para Salir / Guardar:
                </span>
                <p className="text-[11px] text-rose-700 dark:text-rose-300 font-normal leading-relaxed">
                  {validationError}
                </p>
              </div>
            </div>
          )}

          {/* Pie del Panel con Acciones Rápidas */}
          <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-zinc-850/80">
            <div className="flex items-center gap-1">
              {!isStart && (
                <button
                  type="button"
                  onClick={() => setStartNodeId(selectedBlock.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Marcar Inicio</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  duplicateBlock(selectedBlock.id);
                  setIsNodeConfigDrawerOpen(false);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-purple-600 cursor-pointer"
                title="Duplicar Nodo"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  removeBlock(selectedBlock.id);
                  setIsNodeConfigDrawerOpen(false);
                }}
                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 cursor-pointer"
                title="Eliminar Nodo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleAttemptClose}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md shadow-purple-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Guardar & Cerrar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
