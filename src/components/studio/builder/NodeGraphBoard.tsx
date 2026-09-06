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
  const maxNodeX = blocks.reduce((max, b) => Math.max(max, (b.position?.x || 0) + 500), 2400);
  const maxNodeY = blocks.reduce((max, b) => Math.max(max, (b.position?.y || 0) + 500), 1600);

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

  // Manejar inicio de arrastre de un nodo
  const handleNodeMouseDown = (e: React.MouseEvent, node: StudioBlock) => {
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('.port-handle')) {
      return;
    }
    e.stopPropagation();
    setSelectedBlockId(node.id);

    setDraggingNode({
      nodeId: node.id,
      startX: e.clientX,
      startY: e.clientY,
      initialNodeX: node.position?.x || 80,
      initialNodeY: node.position?.y || 150,
    });
  };

  // Manejar inicio de arrastre de flecha de conexión
  const handlePortMouseDown = (e: React.MouseEvent, node: StudioBlock) => {
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

  // Manejar movimiento global del cursor (para arrastre de nodos y de flechas)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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

    const handleMouseUp = (e: MouseEvent) => {
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

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
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
      {/* Contenedor con Barras de Desplazamiento Laterales e Inferiores */}
      <div 
        ref={scrollContainerRef}
        className="w-full h-[640px] sm:h-[720px] overflow-auto scroll-smooth select-none focus:outline-none"
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
                <path d="M 0 2 L 10 6 L 0 10 Z" fill="#8b5cf6" />
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
                <path d="M 0 2 L 10 6 L 0 10 Z" fill="#ec4899" />
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
                  {/* Línea gruesa invisible para facilitar el hover */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="24"
                  />

                  {/* Línea visible de la flecha con animación */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={isHovered ? '#ec4899' : '#8b5cf6'}
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
                    <circle r="11" fill="#ef4444" className="shadow-md" />
                    <text x="0" y="3.5" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">✕</text>
                  </g>
                </g>
              );
            })}

            {/* Flecha elástica en proceso de arrastre */}
            {pendingConn && (
              <path
                d={generateBezierPath(pendingConn.startX, pendingConn.startY, pendingConn.currentX, pendingConn.currentY)}
                fill="none"
                stroke="#ec4899"
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
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xl shadow-purple-500/25 animate-bounce">
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
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-purple-500 text-left space-y-1 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span className="text-base">❓</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-purple-600">+ Pregunta Didáctica</h4>
                  <p className="text-[10px] text-slate-500">Reactivo de evaluación inmediata.</p>
                </button>

                <button
                  type="button"
                  onClick={() => addBlock('text_narrative', undefined, { x: 120, y: 180 })}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-blue-500 text-left space-y-1 shadow-md hover:shadow-lg transition-all cursor-pointer group"
                >
                  <span className="text-base">📖</span>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600">+ Instrucción / Lectura</h4>
                  <p className="text-[10px] text-slate-500">Contexto pedagógico o historia.</p>
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

          {/* ================= TARJETAS DE NODOS INTERACTIVAS ================= */}
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
                }}
                onMouseDown={(e) => handleNodeMouseDown(e, block)}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  setSelectedBlockId(block.id);
                  setIsNodeConfigDrawerOpen(true);
                }}
                title="Doble clic para configurar contenido"
                className={`absolute top-0 left-0 rounded-3xl bg-white dark:bg-zinc-900 border-2 shadow-xl transition-shadow z-20 cursor-move ${
                  isSelected 
                    ? 'border-purple-600 ring-4 ring-purple-500/20 shadow-purple-500/10' 
                    : 'border-slate-200 dark:border-zinc-800 hover:border-purple-300'
                }`}
              >
                {/* PUERTO DE ENTRADA (Izquierda) */}
                <div 
                  className="absolute -left-3 top-[70px] w-6 h-6 rounded-full bg-white dark:bg-zinc-900 border-2 border-purple-500 flex items-center justify-center shadow-md cursor-crosshair group port-handle z-30"
                  title="Puerto de Entrada (Recibe conexiones de nodos previos)"
                >
                  <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:scale-150 transition-transform" />
                </div>

                {/* PUERTO DE SALIDA (Derecha - Jalar para conectar con flecha) */}
                <div 
                  onMouseDown={(e) => handlePortMouseDown(e, block)}
                  className="absolute -right-3 top-[70px] w-6 h-6 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 border-2 border-white dark:border-zinc-900 flex items-center justify-center shadow-md cursor-crosshair group port-handle hover:scale-125 transition-transform z-30"
                  title="Puerto de Salida: Haz clic y jala para conectar con el siguiente nodo"
                >
                  <div className="w-2 h-2 rounded-full bg-white animate-ping" />
                </div>

                {/* Cabecera del Nodo */}
                <div className="p-3.5 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between gap-2 bg-slate-50/80 dark:bg-zinc-850/80 rounded-t-3xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${meta.color} flex items-center justify-center text-white shrink-0 shadow-sm text-xs font-bold`}>
                      <meta.icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 block truncate">
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

                {/* Contenido / Vista Previa del Nodo */}
                <div className="p-3.5 space-y-2 text-xs">
                  {block.type === 'quiz_question' && (
                    <p className="text-[11px] text-slate-700 dark:text-zinc-300 line-clamp-2 font-medium">
                      ❓ {block.data.question}
                    </p>
                  )}

                  {block.type === 'text_narrative' && (
                    <div className="space-y-1">
                      {block.data.speakerName && (
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400">
                          <span>{block.data.speakerAvatar || '👤'}</span>
                          <span>{block.data.speakerName}</span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                        &ldquo;{block.data.content}&rdquo;
                      </p>
                    </div>
                  )}

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

                  {block.type === 'drag_drop_match' && (
                    <div className="p-2 rounded-xl bg-violet-50/70 dark:bg-violet-950/40 border border-violet-200/50 text-[11px] font-bold text-violet-700 dark:text-violet-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <Link2 className="w-3.5 h-3.5 shrink-0 text-violet-600" />
                        <span>{block.data.pairs?.length || 4} Parejas Didácticas</span>
                      </span>
                      <span className="text-[9px] bg-violet-200/80 dark:bg-violet-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Conectar
                      </span>
                    </div>
                  )}

                  {block.type === 'reward_chest' && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/50">
                      <span className="flex items-center gap-1">🎁 +{block.data.xpAmount} XP</span>
                      <span className="text-amber-600 font-mono">+{block.data.coinsAmount} 🪙</span>
                    </div>
                  )}

                  {block.type === 'boss_enemy' && (
                    <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-xl border border-rose-200/50">
                      <span className="truncate">⚔️ {block.data.bossName}</span>
                      <span className="text-[10px] bg-rose-200/80 dark:bg-rose-900/60 px-1.5 py-0.5 rounded-md shrink-0">{block.data.maxHp} HP</span>
                    </div>
                  )}

                  {block.type === 'youtube_video' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-red-600 dark:text-red-400 font-bold">
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{block.data.videoTitle || 'Video YouTube'}</span>
                    </div>
                  )}

                  {block.type === 'external_embed' && (
                    <div className="flex items-center gap-1.5 text-[11px] text-cyan-600 dark:text-cyan-400 font-bold">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{block.data.resourceTitle || 'Simulador Web'}</span>
                    </div>
                  )}

                  {block.type === 'secret_code_puzzle' && (
                    <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/50 text-[11px] font-bold text-amber-800 dark:text-amber-300 flex items-center justify-between">
                      <span className="flex items-center gap-1.5 truncate">
                        <KeyRound className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                        <span>Clave: {block.data.secretAnswer}</span>
                      </span>
                      <span className="text-[9px] bg-amber-200/80 dark:bg-amber-900/60 px-1.5 py-0.5 rounded-md shrink-0">
                        Candado
                      </span>
                    </div>
                  )}
                </div>

                {/* Barra de Acciones del Nodo */}
                <div className="px-3 pb-3 pt-1 flex items-center justify-between gap-1 text-[11px] border-t border-slate-100 dark:border-zinc-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedBlockId(block.id);
                      setIsNodeConfigDrawerOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 text-purple-700 dark:text-purple-300 font-black flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Settings2 className="w-3 h-3" />
                    <span>Configurar</span>
                  </button>

                  <div className="flex items-center gap-1">
                    {!isStart && (
                      <button
                        type="button"
                        onClick={() => setStartNodeId(block.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-emerald-600 cursor-pointer"
                        title="Marcar como Nodo de Inicio"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => duplicateBlock(block.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-purple-600 cursor-pointer"
                      title="Duplicar Nodo"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
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

      {/* Widget Flotante de Zoom (+)(-)(100%) y Auto-organizar en la esquina inferior izquierda del tablero */}
      <div className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xl">
        <button
          type="button"
          onClick={() => setZoomLevel(Math.max(0.6, zoomLevel - 0.1))}
          title="Alejar Zoom (-)"
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-slate-700 dark:text-zinc-200 font-bold transition-all cursor-pointer"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => setZoomLevel(1.0)}
          title="Restablecer Zoom al 100%"
          className="px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-[11px] font-black text-slate-800 dark:text-zinc-200 transition-all cursor-pointer min-w-[50px] text-center"
        >
          {Math.round(zoomLevel * 100)}%
        </button>

        <button
          type="button"
          onClick={() => setZoomLevel(Math.min(1.4, zoomLevel + 0.1))}
          title="Acercar Zoom (+)"
          className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 text-slate-700 dark:text-zinc-200 font-bold transition-all cursor-pointer"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-slate-200 dark:bg-zinc-700 mx-0.5" />

        <button
          type="button"
          onClick={autoLayoutNodes}
          title="Auto-organizar Nodos en el tablero"
          className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-bold transition-all cursor-pointer flex items-center gap-1 text-xs"
        >
          <Layers className="w-4 h-4" />
          <span className="hidden sm:inline font-black text-[11px]">Organizar</span>
        </button>
      </div>
    </div>
  );
};
