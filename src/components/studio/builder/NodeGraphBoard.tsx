"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { StudioBlock, StudioBlockType, FlowConnection, FlowNodePosition } from '@/types/studioBlocks';
import { 
  MEXICAN_INDEPENDENCE_BLOCKS, 
  MEXICAN_INDEPENDENCE_METADATA 
} from '@/data/mexicanIndependenceStudioFlow';
import { BLOCK_META } from './SortableBlockWrapper';
import { 
  Sparkles, 
  Settings2, 
  Trash2, 
  Copy, 
  Flag, 
  ArrowRight, 
  Plus, 
  Play, 
  X, 
  Move, 
  Layers, 
  Video, 
  Globe, 
  Swords, 
  Gift, 
  BookOpen, 
  HelpCircle, 
  Link2, 
  ListOrdered, 
  FileEdit, 
  MessageSquare, 
  KeyRound, 
  ShieldCheck, 
  Award,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw
} from 'lucide-react';

interface DraggingNodeState {
  nodeId: string;
  startX: number;
  startY: number;
  initialNodeX: number;
  initialNodeY: number;
}

interface PendingConnectionState {
  sourceNodeId: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const NodeGraphBoard: React.FC = () => {
  const {
    blocks,
    connections,
    startNodeId,
    selectedBlockId,
    zoomLevel,
    setZoomLevel,
    setSelectedBlockId,
    updateNodePosition,
    addConnection,
    removeConnection,
    setStartNodeId,
    duplicateBlock,
    removeBlock,
    setIsNodeConfigDrawerOpen,
    setIsExtendedMenuOpen,
    addBlock,
    loadPresetBlocks,
    autoLayoutNodes
  } = useActivityBuilderStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Estados de arrastre de nodo y de creación de conexión
  const [draggingNode, setDraggingNode] = useState<DraggingNodeState | null>(null);
  const [pendingConn, setPendingConn] = useState<PendingConnectionState | null>(null);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);

  // Dimensiones del nodo para cálculo de puertos
  const NODE_WIDTH = 280;
  const NODE_HEADER_HEIGHT = 44;

  // Calcular dimensiones dinámicas para las barras de desplazamiento (garantizar que ningún nodo se corte)
  const maxNodeX = blocks.reduce((max, b) => Math.max(max, (b.position?.x || 0) + 550), 2400);
  const maxNodeY = blocks.reduce((max, b) => Math.max(max, (b.position?.y || 0) + 550), 1600);

  // Obtener posición del puerto de un nodo
  const getNodePortPos = (node: StudioBlock, portType: 'input' | 'output') => {
    const posX = node.position?.x || 80;
    const posY = node.position?.y || 150;

    if (portType === 'input') {
      return { x: posX, y: posY + NODE_HEADER_HEIGHT + 30 };
    } else {
      return { x: posX + NODE_WIDTH, y: posY + NODE_HEADER_HEIGHT + 30 };
    }
  };

  // Ajustar el zoom y encuadre para que todos los nodos queden perfectamente visibles (Fit to Screen)
  const fitToScreen = () => {
    if (blocks.length === 0 || !boardRef.current || !scrollContainerRef.current) return;
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    blocks.forEach(b => {
      const x = b.position?.x || 80;
      const y = b.position?.y || 150;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + NODE_WIDTH > maxX) maxX = x + NODE_WIDTH;
      if (y + 220 > maxY) maxY = y + 220;
    });

    const padding = 60;
    const contentWidth = Math.max(300, maxX - minX + padding * 2);
    const contentHeight = Math.max(300, maxY - minY + padding * 2);

    const container = scrollContainerRef.current;
    const containerWidth = container.clientWidth || 800;
    const containerHeight = container.clientHeight || 600;

    const scaleX = containerWidth / contentWidth;
    const scaleY = containerHeight / contentHeight;
    const idealZoom = Math.min(1.1, Math.max(0.5, Math.min(scaleX, scaleY)));

    setZoomLevel(Number(idealZoom.toFixed(2)));

    // Centrar desplazamiento suave
    setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const targetScrollX = Math.max(0, (minX - padding / 2) * idealZoom);
      const targetScrollY = Math.max(0, (minY - padding / 2) * idealZoom);
      scrollContainerRef.current.scrollTo({ left: targetScrollX, top: targetScrollY, behavior: 'smooth' });
    }, 50);
  };

  // Manejar inicio de arrastre de un nodo con Pointer Events (Touch, Mouse, Stylus)
  const handleNodePointerDown = (e: React.PointerEvent, node: StudioBlock) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.port-handle')) {
      return;
    }
    // Solo responder al botón principal del ratón o toques
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    e.stopPropagation();
    setSelectedBlockId(node.id);

    // Capturar puntero en el elemento de la tarjeta si está disponible
    try {
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    } catch (_) {}

    setDraggingNode({
      nodeId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: node.position?.x || 80,
      initialNodeY: node.position?.y || 150,
    });
  };

  // Manejar inicio de arrastre de flecha de conexión (Touch + Mouse)
  const handlePortPointerDown = (e: React.PointerEvent, node: StudioBlock) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.stopPropagation();
    e.preventDefault();

    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const portPos = getNodePortPos(node, 'output');

    setPendingConn({
      sourceNodeId: node.id,
      startX: portPos.x,
      startY: portPos.y,
      currentX: (e.clientX - rect.left) / zoomLevel,
      currentY: (e.clientY - rect.top) / zoomLevel,
    });
  };

  // Manejar movimiento global de puntero (arrastre fluido sin pérdida de foco)
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (draggingNode) {
        const deltaX = (e.clientX - draggingNode.startX) / zoomLevel;
        const deltaY = (e.clientY - draggingNode.startY) / zoomLevel;

        const newX = Math.max(20, Math.round(draggingNode.initialNodeX + deltaX));
        const newY = Math.max(20, Math.round(draggingNode.initialNodeY + deltaY));

        updateNodePosition(draggingNode.nodeId, { x: newX, y: newY });
      }

      if (pendingConn && boardRef.current) {
        const rect = boardRef.current.getBoundingClientRect();
        setPendingConn(prev => prev ? {
          ...prev,
          currentX: (e.clientX - rect.left) / zoomLevel,
          currentY: (e.clientY - rect.top) / zoomLevel,
        } : null);
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (draggingNode) {
        setDraggingNode(null);
      }

      if (pendingConn) {
        // Verificar si se soltó sobre un nodo objetivo
        const targetElement = document.elementFromPoint(e.clientX, e.clientY);
        const nodeCard = targetElement?.closest('[data-node-id]');
        if (nodeCard) {
          const targetNodeId = nodeCard.getAttribute('data-node-id');
          if (targetNodeId && targetNodeId !== pendingConn.sourceNodeId) {
            addConnection(pendingConn.sourceNodeId, targetNodeId);
          }
        }
        setPendingConn(null);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingNode, pendingConn, zoomLevel, updateNodePosition, addConnection]);

  // Generar curva Bezier cúbica fluida
  const generateBezierPath = (x1: number, y1: number, x2: number, y2: number) => {
    const dx = Math.abs(x2 - x1) * 0.5;
    const cx1 = x1 + Math.max(40, dx);
    const cx2 = x2 - Math.max(40, dx);
    return `M ${x1} ${y1} C ${cx1} ${y1}, ${cx2} ${y2}, ${x2} ${y2}`;
  };

  // Cargar plantilla temática magistral de la Independencia de México (6 Nodos)
  const handleLoadIndependencePreset = () => {
    loadPresetBlocks(MEXICAN_INDEPENDENCE_BLOCKS, MEXICAN_INDEPENDENCE_METADATA);
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-slate-200/90 dark:border-zinc-800 bg-[#f8fafc] dark:bg-[#090d16] shadow-xl">
      {/* Contenedor con Barras de Desplazamiento Laterales e Inferiores (Responsive en Móvil, Tablet y PC) */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-[66vh] min-h-[480px] max-h-[850px] overflow-auto scroll-smooth select-none focus:outline-none touch-pan-x touch-pan-y"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(148, 163, 184, 0.25) 1.2px, transparent 1.2px)`,
          backgroundSize: '24px 24px',
        }}
      >
        {/* Espacio Amplio de Trabajo 2D */}
        <div 
          ref={boardRef}
          data-board-container="true"
          className="relative transform origin-top-left transition-transform duration-75"
          style={{ 
            width: `${maxNodeX}px`, 
            height: `${maxNodeY}px`,
            transform: `scale(${zoomLevel})`,
          }}
        >
          {/* Capa de Flechas SVG de Conexión */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            <defs>
              {/* Marcador de punta de flecha normal */}
              <marker
                id="flow-arrowhead"
                markerWidth="12"
                markerHeight="12"
                refX="9"
                refY="6"
                orient="auto"
              >
                <path d="M 0 2 L 10 6 L 0 10 Z" fill="#10b981" />
              </marker>

              {/* Marcador de punta de flecha resaltada */}
              <marker
                id="flow-arrowhead-active"
                markerWidth="12"
                markerHeight="12"
                refX="9"
                refY="6"
                orient="auto"
              >
                <path d="M 0 2 L 10 6 L 0 10 Z" fill="#2dd4bf" />
              </marker>
            </defs>

            {/* Flechas establecidas entre nodos */}
            {connections.map((conn) => {
              const sourceBlock = blocks.find(b => b.id === conn.sourceNodeId);
              const targetBlock = blocks.find(b => b.id === conn.targetNodeId);
              if (!sourceBlock || !targetBlock) return null;

              const startPos = getNodePortPos(sourceBlock, 'output');
              const endPos = getNodePortPos(targetBlock, 'input');
              const isHovered = hoveredConnId === conn.id;

              const pathD = generateBezierPath(startPos.x, startPos.y, endPos.x, endPos.y);
              const midX = (startPos.x + endPos.x) / 2;
              const midY = (startPos.y + endPos.y) / 2;

              return (
                <g 
                  key={conn.id} 
                  className="group cursor-pointer pointer-events-auto"
                  onMouseEnter={() => setHoveredConnId(conn.id)}
                  onMouseLeave={() => setHoveredConnId(null)}
                >
                  {/* Línea gruesa invisible para facilitar el hover y toque táctil */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="28"
                  />

                  {/* Línea visible de la flecha con animación */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#2dd4bf' : '#10b981'}
                    strokeWidth={isHovered ? '3.5' : '2.5'}
                    strokeDasharray="6,4"
                    markerEnd={isHovered ? 'url(#flow-arrowhead-active)' : 'url(#flow-arrowhead)'}
                    className="transition-all duration-200"
                  />

                  {/* Botón flotante para eliminar conexión (X) */}
                  <g 
                    transform={`translate(${midX}, ${midY})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeConnection(conn.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 cursor-pointer"
                  >
                    <circle r="12" fill="#ef4444" className="shadow-md" />
                    <text x="0" y="3.5" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">✕</text>
                  </g>
                </g>
              );
            })}

            {/* Flecha elástica en proceso de arrastre */}
            {pendingConn && (
              <path
                d={generateBezierPath(pendingConn.startX, pendingConn.startY, pendingConn.currentX, pendingConn.currentY)}
                fill="none"
                stroke="#2dd4bf"
                strokeWidth="3"
                strokeDasharray="4,4"
                markerEnd="url(#flow-arrowhead-active)"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* ================= ESTADO VACÍO ================= */}
          {blocks.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center space-y-6 animate-fade-in z-20">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-xl shadow-emerald-500/25 animate-bounce">
                <Layers className="w-8 h-8" />
              </div>

              <div className="space-y-2 max-w-md">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Constructor de Flujos Gamificados
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                  Diseña tu lección como un mapa de flujo visual. Agrega nodos interactivos, conéctalos con flechas y define rutas dinámicas para tus alumnos.
                </p>
              </div>

              {/* Acciones Rápidas de Creación */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl">
                <button
                  type="button"
                  onClick={() => addBlock('quiz_question', undefined, { x: 120, y: 180 })}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500 text-left space-y-1 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span className="text-base">❓</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500">+ Pregunta Didáctica</h4>
                  <p className="text-[10px] text-slate-500">Reactivo de evaluación inmediata.</p>
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('timed_reading_block', undefined, { x: 120, y: 180 })}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-500 text-left space-y-1 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span className="text-base">⏱️</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600">+ Lectura PPM</h4>
                  <p className="text-[10px] text-slate-500">Grimorio con cronómetro y audio.</p>
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('boss_enemy', undefined, { x: 120, y: 180 })}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-rose-500 text-left space-y-1 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span className="text-base">⚔️</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-rose-600">+ Combate Pixi</h4>
                  <p className="text-[10px] text-slate-500">Duelo RPG contra monstruo.</p>
                </button>
              </div>

              {/* Cargar Plantilla Modelo de Independencia */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLoadIndependencePreset}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 hover:scale-105 transition-all cursor-pointer"
                >
                  <span>🇲🇽 Cargar Clase Gamificada: Independencia de México (6 Nodos Épicos)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TARJETAS DE NODOS INTERACTIVAS (17 NODOS) ================= */}
          {blocks.map((block) => {
            const meta = BLOCK_META[block.type] || BLOCK_META.text_narrative;
            const isSelected = selectedBlockId === block.id;
            const isStart = (startNodeId === block.id) || (block.isStartNode === true);
            
            // Verificar si tiene conexiones salientes (si no, es nodo final)
            const outgoingCount = connections.filter(c => c.sourceNodeId === block.id).length;
            const isTerminal = outgoingCount === 0;

            const posX = block.position?.x || 80;
            const posY = block.position?.y || 150;

            return (
              <div
                key={block.id}
                data-node-id={block.id}
                style={{
                  transform: `translate(${posX}px, ${posY}px)`,
                  width: `${NODE_WIDTH}px`,
                  touchAction: 'none'
                }}
                onPointerDown={(e) => handleNodePointerDown(e, block)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedBlockId(block.id);
                  setIsNodeConfigDrawerOpen(true);
                }}
                title="Doble clic o pulsa 'Configurar' para editar"
                className={`absolute top-0 left-0 rounded-3xl bg-white dark:bg-zinc-900 border-2 shadow-xl transition-shadow z-20 cursor-move select-none ${
                  isSelected 
                    ? 'border-emerald-500 ring-4 ring-emerald-500/25 shadow-emerald-500/15' 
                    : 'border-slate-200 dark:border-zinc-800 hover:border-emerald-400/50'
                }`}
              >
                {/* PUERTO DE ENTRADA (Izquierda) */}
                <div 
                  className="absolute -left-3.5 top-[66px] w-7 h-7 rounded-full bg-white dark:bg-zinc-900 border-2 border-emerald-500 flex items-center justify-center shadow-md cursor-crosshair group port-handle z-30"
                  title="Puerto de Entrada (Recibe conexiones de nodos previos)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 group-hover:scale-150 transition-transform" />
                </div>

                {/* PUERTO DE SALIDA (Derecha - Jalar para conectar con flecha) */}
                <div 
                  onPointerDown={(e) => handlePortPointerDown(e, block)}
                  style={{ touchAction: 'none' }}
                  className="absolute -right-3.5 top-[66px] w-7 h-7 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-md cursor-crosshair group port-handle hover:scale-125 transition-transform z-30"
                  title="Puerto de Salida: Arrastra hacia otro nodo para conectarlo"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                </div>

                {/* Cabecera del Nodo */}
                <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-zinc-850/80 rounded-t-3xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${meta.color || 'from-emerald-600 to-teal-600'} flex items-center justify-center text-white shrink-0 shadow-sm text-xs font-bold`}>
                      <meta.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-teal-500 dark:text-teal-400 block truncate">
                        {meta.label}
                      </span>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                        {block.title}
                      </h4>
                    </div>
                  </div>

                  {/* Badge de Inicio / Fin */}
                  <div className="shrink-0 flex items-center gap-1">
                    {isStart ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-black text-[9px] border border-emerald-300 flex items-center gap-1">
                        <Flag className="w-2.5 h-2.5" />
                        <span>INICIO</span>
                      </span>
                    ) : isTerminal ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-bold text-[9px]">
                        FIN
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Contenido / Vista Previa Enriquecida de los 17 Nodos */}
                <div className="p-3.5 space-y-2 text-xs">
                  {/* 1. Opción Múltiple */}
                  {block.type === 'quiz_question' && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-slate-700 dark:text-zinc-300 line-clamp-2 font-medium">
                        ❓ {block.data.question || 'Pregunta de opción múltiple...'}
                      </p>
                      <span className="text-[9px] text-slate-400 block font-semibold">
                        {block.data.options?.length || 4} opciones configuradas
                      </span>
                    </div>
                  )}

                  {/* 2. Lectura Cronometrada PPM */}
                  {block.type === 'timed_reading_block' && (
                    <div className="p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 text-[11px] space-y-1">
                      <div className="flex items-center justify-between font-bold text-indigo-700 dark:text-indigo-300">
                        <span className="truncate">{block.data.chapterTitle || 'Lectura de Comprensión'}</span>
                        <span className="text-[9px] bg-indigo-200/70 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                          ⏱️ PPM
                        </span>
                      </div>
                      <div className="text-[9px] text-slate-500 dark:text-zinc-400 flex items-center justify-between">
                        <span>{block.data.wordCount || 150} palabras</span>
                        <span>{block.data.comprehensionQuestions?.length || 2} preguntas</span>
                      </div>
                    </div>
                  )}

                  {/* 3. Texto Narrativa */}
                  {block.type === 'text_narrative' && (
                    <div className="space-y-1">
                      {block.data.speakerName && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400">
                          <span>{block.data.speakerAvatar || '👤'}</span>
                          <span>{block.data.speakerName}</span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                        &ldquo;{block.data.content || 'Instrucción o narrativa pedagógica...'}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* 4. Ordenar Secuencia */}
                  {block.type === 'ordering_sequence' && (
                    <div className="p-2 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 text-[11px] font-bold text-blue-700 dark:text-blue-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <ListOrdered className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                        <span>{block.data.stepsInCorrectOrder?.length || 4} Fases Cronológicas</span>
                      </span>
                      <span className="text-[9px] bg-blue-200/80 dark:bg-blue-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Ordenar
                      </span>
                    </div>
                  )}

                  {/* 5. Emparejamiento Drag & Drop */}
                  {block.type === 'drag_drop_match' && (
                    <div className="p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/50 text-[11px] font-bold text-teal-700 dark:text-teal-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <Link2 className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                        <span>{block.data.pairs?.length || 4} Parejas Didácticas</span>
                      </span>
                      <span className="text-[9px] bg-teal-200/80 dark:bg-teal-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Conectar
                      </span>
                    </div>
                  )}

                  {/* 6. Completar Espacios */}
                  {block.type === 'fill_in_blanks' && (
                    <div className="p-2 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/50 text-[11px] space-y-1">
                      <span className="font-bold text-teal-800 dark:text-teal-300 line-clamp-1">
                        ✍️ {block.data.textWithBlanks || 'Texto con [palabras clave]...'}
                      </span>
                      <span className="text-[9px] text-teal-600 dark:text-teal-400 block">
                        Banco: {block.data.wordBank?.length || 3} opciones
                      </span>
                    </div>
                  )}

                  {/* 7. Pregunta Abierta con IA */}
                  {block.type === 'open_poll_wordcloud' && (
                    <div className="p-2 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/50 text-[11px] space-y-1">
                      <span className="font-bold text-cyan-800 dark:text-cyan-300 line-clamp-1">
                        🤖 {block.data.prompt || 'Pregunta de reflexión formativa...'}
                      </span>
                      <span className="text-[9px] text-cyan-600 dark:text-cyan-400 block font-semibold">
                        Retroalimentación cualitativa NEM
                      </span>
                    </div>
                  )}

                  {/* 8. Cofre de Recompensas */}
                  {block.type === 'reward_chest' && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/50">
                      <span className="flex items-center gap-1">🎁 +{block.data.xpAmount || 100} XP</span>
                      <span className="text-amber-600 font-mono">+{block.data.coinsAmount || 25} 🪙</span>
                    </div>
                  )}

                  {/* 9. Combate Boss Pixi */}
                  {block.type === 'boss_enemy' && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200/50">
                      <span className="truncate">⚔️ {block.data.bossName || 'Jefe de Saberes'}</span>
                      <span className="text-[10px] bg-rose-200/80 dark:bg-rose-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        {block.data.maxHp || 100} HP
                      </span>
                    </div>
                  )}

                  {/* 10. Video de YouTube */}
                  {block.type === 'youtube_video' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-bold p-1.5 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200/40">
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{block.data.videoTitle || 'Cápsula Educativa'}</span>
                    </div>
                  )}

                  {/* 11. Simulador Web / Embed */}
                  {block.type === 'external_embed' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 font-bold p-1.5 bg-cyan-50 dark:bg-cyan-950/30 rounded-xl border border-cyan-200/40">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{block.data.resourceTitle || 'Simulador PhET / GeoGebra'}</span>
                    </div>
                  )}

                  {/* 12. Código Secreto / Escape Room */}
                  {block.type === 'secret_code_puzzle' && (
                    <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/50 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <KeyRound className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Clave: {block.data.secretAnswer || 'ENIGMA'}</span>
                      </span>
                      <span className="text-[9px] bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Escape Room
                      </span>
                    </div>
                  )}

                  {/* 13. Minijuego de Acción */}
                  {block.type === 'minigame_action' && (
                    <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                      <span>🎰 {block.data.minigameType || 'Ruleta del Saber'}</span>
                      <span className="text-[9px] bg-emerald-200/80 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Arcade
                      </span>
                    </div>
                  )}

                  {/* 14. Bifurcación Adaptativa */}
                  {block.type === 'logic_branch' && (
                    <div className="p-2 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/50 text-[11px] font-bold text-indigo-800 dark:text-indigo-300 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span>🔀 Ruta Condicional</span>
                        <span className="text-[9px] bg-indigo-200/70 dark:bg-indigo-900/60 px-1.5 py-0.5 rounded-md">≥ 75%</span>
                      </div>
                      <p className="text-[9px] text-indigo-600 dark:text-indigo-400 font-normal">
                        Ruta de refuerzo vs avanzada
                      </p>
                    </div>
                  )}

                  {/* 15. Punto de Control Metacognitivo */}
                  {block.type === 'checkpoint_gate' && (
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] font-bold text-slate-800 dark:text-slate-200 space-y-0.5">
                      <span>🛡️ Autoevaluación</span>
                      <p className="text-[9px] text-slate-500 dark:text-slate-400 font-normal">
                        Semáforo de comprensión y reflexión
                      </p>
                    </div>
                  )}

                  {/* 16. Diploma y Certificado */}
                  {block.type === 'badge_certificate' && (
                    <div className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-200/60 dark:border-yellow-800/60 text-[11px] font-bold text-yellow-800 dark:text-yellow-300 flex items-center justify-between">
                      <span className="truncate">🏆 {block.data.certificateTitle || 'Diploma de Honor'}</span>
                      <span className="text-[9px] bg-yellow-200/80 dark:bg-yellow-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Certificado
                      </span>
                    </div>
                  )}

                  {/* 17. Efecto Sonoro y Fanfarria */}
                  {block.type === 'audio_sfx' && (
                    <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/40 border border-pink-200/60 text-[11px] font-bold text-pink-800 dark:text-pink-300 flex items-center justify-between">
                      <span>🎵 {block.data.soundType || 'Fanfarria de Victoria'}</span>
                      <span className="text-[9px] bg-pink-200/80 dark:bg-pink-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        SFX
                      </span>
                    </div>
                  )}

                  {/* Nodos de Lógica Matemática y Algoritmia */}
                  {(block.type === 'logic_challenge_interactive' || 
                    block.type === 'boolean_circuit_builder' || 
                    block.type === 'graph_network_path' || 
                    block.type === 'turing_step_simulator' || 
                    block.type === 'constraint_scheduler') && (
                    <div className="p-2 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/60 text-[11px] font-bold text-cyan-800 dark:text-cyan-300 space-y-0.5">
                      <span className="truncate block">🧠 {block.title || 'Reto de Algoritmia'}</span>
                      <span className="text-[9px] text-cyan-600 dark:text-cyan-400 block font-normal">
                        Pensamiento computacional
                      </span>
                    </div>
                  )}
                </div>

                {/* Barra de Acciones del Nodo */}
                <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-1 text-[11px] border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBlockId(block.id);
                      setIsNodeConfigDrawerOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Configurar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {!isStart && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStartNodeId(block.id);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 cursor-pointer"
                        title="Marcar como Nodo de Inicio"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateBlock(block.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-emerald-500 cursor-pointer"
                      title="Duplicar Nodo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeBlock(block.id);
                      }}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Eliminar Nodo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Widget Flotante de Zoom (+)(-)(Fit)(Auto-organizar) en la esquina inferior izquierda del tablero */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xl">
        <button
          type="button"
          onClick={() => setZoomLevel(Math.max(0.5, Number((zoomLevel - 0.1).toFixed(2))))}
          title="Alejar Zoom (-)"
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-zinc-200 font-bold transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setZoomLevel(1.0)}
          title="Restablecer Zoom al 100%"
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-[11px] font-black text-slate-800 dark:text-zinc-200 transition-all cursor-pointer min-w-[48px] text-center"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          type="button"
          onClick={() => setZoomLevel(Math.min(1.4, Number((zoomLevel + 0.1).toFixed(2))))}
          title="Acercar Zoom (+)"
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-zinc-200 font-bold transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

        {/* Botón Ajustar al Lienzo (Fit to Screen) */}
        <button
          type="button"
          onClick={fitToScreen}
          title="Encuadrar y ajustar todos los nodos en la pantalla"
          className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900/60 text-teal-700 dark:text-teal-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
        >
          <Maximize2 className="w-4 h-4" />
          <span className="hidden sm:inline font-black text-[11px]">Ajustar</span>
        </button>

        {/* Botón Auto-organizar Nodos */}
        <button
          type="button"
          onClick={autoLayoutNodes}
          title="Auto-organizar Nodos en el tablero"
          className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline font-black text-[11px]">Organizar</span>
        </button>
      </div>
    </div>
  );
};
