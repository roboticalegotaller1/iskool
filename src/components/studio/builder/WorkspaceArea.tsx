"use client";

import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { SortableBlockWrapper } from './SortableBlockWrapper';
import { NodeGraphBoard } from './NodeGraphBoard';
import { NodeConfigDrawer } from './NodeConfigDrawer';
import { 
  Sparkles, 
  Plus, 
  Layers, 
  HelpCircle, 
  Swords, 
  BookOpen,
  GripVertical,
  ArrowRight,
  Flame,
  Gamepad2,
  Workflow,
  ListOrdered
} from 'lucide-react';

export const WorkspaceArea: React.FC = () => {
  const { 
    blocks, 
    reorderBlocks, 
    addBlock, 
    loadPresetBlocks,
    isExtendedMenuOpen,
    setIsExtendedMenuOpen,
    zoomLevel,
    autoLayoutNodes
  } = useActivityBuilderStore();

  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeBlock = blocks.find((b) => b.id === activeId);

  // Sensores optimizados con umbral de 5px para distinguir clics de arrastres en modo lista
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderBlocks(String(active.id), String(over.id));
    }
    setActiveId(null);
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <div className="w-full space-y-4">
      {/* Barra de Modo de Visualización (Flujo de Nodos vs Lista) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/90 p-1 rounded-2xl border border-slate-200 dark:border-zinc-750 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'graph'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            <span>Constructor de Flujo (Nodos)</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Vista de Lista</span>
          </button>
        </div>

        {viewMode === 'graph' && blocks.length > 1 && (
          <button
            type="button"
            onClick={autoLayoutNodes}
            className="px-3 py-1.5 rounded-xl bg-white dark:bg-zinc-850 hover:bg-purple-50 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-750 text-[11px] font-bold text-slate-700 dark:text-zinc-300 shadow-sm flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Auto-organizar Nodos</span>
          </button>
        )}
      </div>

      {/* Renderizado Condicional: Tablero de Grafo de Nodos vs Lista Vertical */}
      {viewMode === 'graph' ? (
        <NodeGraphBoard />
      ) : (
        /* VISTA DE LISTA VERTICAL TRADICIONAL */
        <div className="rounded-3xl border border-slate-200/90 dark:border-zinc-800/90 bg-white/70 dark:bg-zinc-900/70 p-4 sm:p-6 shadow-xl backdrop-blur-xs">
          {blocks.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500 font-bold">
              No hay bloques añadidos. Utiliza la barra de herramientas lateral o el botón (+) para crear reactivos.
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={blocks.map((b) => b.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {blocks.map((block, index) => (
                    <SortableBlockWrapper
                      key={block.id}
                      block={block}
                      index={index}
                      totalBlocks={blocks.length}
                    />
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeBlock ? (
                  <div className="opacity-95 rotate-1 scale-105 pointer-events-none shadow-2xl">
                    <SortableBlockWrapper
                      block={activeBlock}
                      index={0}
                      totalBlocks={blocks.length}
                      isOverlay
                    />
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      )}

      {/* Panel Lateral Deslizante de Configuración de Nodo */}
      <NodeConfigDrawer />

      {/* Botón Flotante Principal (+) en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-30">
        <button
          type="button"
          onClick={() => setIsExtendedMenuOpen(!isExtendedMenuOpen)}
          aria-label="Abrir catálogo de bloques lúdicos"
          className="px-5 py-3.5 rounded-full bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-sm shadow-2xl shadow-purple-600/40 ring-4 ring-purple-400/30 flex items-center gap-2.5 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
            <Plus className={`w-4 h-4 text-white transition-transform duration-200 ${isExtendedMenuOpen ? 'rotate-45' : ''}`} />
          </div>
          <span className="hidden sm:inline font-black tracking-wide">Añadir Bloque</span>
          <span className="font-black">(+)</span>
        </button>
      </div>
    </div>
  );
};
