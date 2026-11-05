"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { StudioBlock, StudioBlockType, FlowConnection, FlowNodePosition } from '@/types/studioBlocks';
import { 
  MEXICAN_INDEPENDENCE_BLOCKS, 
  MEXICAN_INDEPENDENCE_METADATA,
  HISTORICAL_FIGURES_PRESET_CATALOG
} from '@/data/mexicanIndependenceStudioFlow';
import { BLOCK_META } from './SortableBlockWrapper';
import { StudioBlockIcon } from './StudioPremiumBlockIcon';
import { attachStudioBroadcastMaster } from '@/lib/audio/studioBroadcastMaster';
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
  RotateCcw,
  Languages,
  Mic,
  ExternalLink,
  GraduationCap,
  Theater,
  ClipboardCheck,
  Volume2,
  Loader2,
  MapPin,
  CheckCircle2
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
  const router = useRouter();
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
    autoLayoutNodes,
    switchHistoricalFigureOnBlock
  } = useActivityBuilderStore();

  const boardRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Estados de arrastre de nodo y de creación de conexión
  const [draggingNode, setDraggingNode] = useState<DraggingNodeState | null>(null);
  const [pendingConn, setPendingConn] = useState<PendingConnectionState | null>(null);
  const [hoveredConnId, setHoveredConnId] = useState<string | null>(null);
  const [speakingNodeId, setSpeakingNodeId] = useState<string | null>(null);

  // Reproducir Voz Neural LatAm directamente desde cualquier tarjeta del lienzo (Respaldo Neural Continuo - 24 Voces LatAm)
  const playNodeNeuralTts = async (e: React.MouseEvent, node: StudioBlock, textToSpeak: string, voiceGender?: 'male' | 'female') => {
    e.stopPropagation();
    if (speakingNodeId === node.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setSpeakingNodeId(null);
      return;
    }

    setSpeakingNodeId(node.id);
    try {
      const resolvedGender: 'male' | 'female' =
        voiceGender || (node.data as Record<string, any>)?.voiceGender || 'female';
      const resolvedCharacterName =
        (node.data as Record<string, any>)?.characterOrSiteName ||
        (node.data as Record<string, any>)?.characterName ||
        node.title;
      const res = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak,
          language: 'es-MX',
          gender: resolvedGender,
          characterName: resolvedCharacterName,
          role: node.type === 'historical_figure_block' ? 'character' : 'tutor'
        })
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) audioRef.current.pause();
        const audio = new Audio(url);
        audioRef.current = audio;
        attachStudioBroadcastMaster(audio, {
          isMale: resolvedGender === 'male',
          role: node.type === 'historical_figure_block' ? 'character' : 'tutor'
        });
        audio.onended = () => setSpeakingNodeId(null);
        audio.onerror = () => setSpeakingNodeId(null);
        await audio.play();
        return;
      }
    } catch (_) {
      // Fallback en caso de red offline
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = 'es-MX';
      utter.onend = () => setSpeakingNodeId(null);
      utter.onerror = () => setSpeakingNodeId(null);
      window.speechSynthesis.speak(utter);
    } else {
      setSpeakingNodeId(null);
    }
  };

  // Dimensiones del nodo para cálculo de puertos
  const NODE_WIDTH = 285;
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
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('select') ||
      (e.target as HTMLElement).closest('input') ||
      (e.target as HTMLElement).closest('.port-handle')
    ) {
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
        className="w-full h-[55vh] sm:h-[66vh] min-h-[360px] sm:min-h-[480px] max-h-[850px] overflow-auto scroll-smooth select-none focus:outline-none touch-pan-x touch-pan-y overscroll-contain smooth-touch-scroll"
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
              {/* Marcador de punta de flecha normal (Esmeralda) */}
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

              {/* Marcador de punta de flecha ruta refuerzo (Ámbar) */}
              <marker
                id="flow-arrowhead-amber"
                markerWidth="12"
                markerHeight="12"
                refX="9"
                refY="6"
                orient="auto"
              >
                <path d="M 0 2 L 10 6 L 0 10 Z" fill="#f59e0b" />
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

              // Detectar si viene de una Bifurcación Condicional (logic_branch) para mostrar etiquetas de Ruta Maestría vs Ruta Refuerzo
              const siblingConns = connections.filter(c => c.sourceNodeId === sourceBlock.id);
              const siblingIdx = siblingConns.findIndex(c => c.id === conn.id);
              const isLogicSource = sourceBlock.type === 'logic_branch';
              const thresholdVal = (sourceBlock.data as Record<string, any>)?.thresholdScore || (sourceBlock.data as Record<string, any>)?.thresholdValue || 70;
              const isLowBranch = conn.condition === 'score_low' || conn.condition === 'if_false' || (isLogicSource && siblingIdx === 1);
              const isHighBranch = conn.condition === 'score_high' || conn.condition === 'if_true' || (isLogicSource && siblingIdx === 0 && siblingConns.length > 1);

              const strokeColor = isHovered
                ? '#2dd4bf'
                : isLowBranch
                  ? '#f59e0b'
                  : '#10b981';

              const markerUrl = isHovered
                ? 'url(#flow-arrowhead-active)'
                : isLowBranch
                  ? 'url(#flow-arrowhead-amber)'
                  : 'url(#flow-arrowhead)';

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
                    stroke={strokeColor}
                    strokeWidth={isHovered ? '3.5' : '2.8'}
                    strokeDasharray={isLowBranch ? '5,4' : 'none'}
                    markerEnd={markerUrl}
                    className="transition-all duration-200"
                  />

                  {/* Etiqueta de Bifurcación Real en el lienzo (Vista 1.1: >= 70% Ruta Maestría / < 70% Ruta Refuerzo) */}
                  {(isHighBranch || isLowBranch) && (
                    <g transform={`translate(${midX}, ${midY - 14})`} className="pointer-events-none">
                      <rect
                        x="-58"
                        y="-13"
                        width="116"
                        height="24"
                        rx="8"
                        fill={isLowBranch ? '#fffbeb' : '#ecfdf5'}
                        stroke={isLowBranch ? '#f59e0b' : '#10b981'}
                        strokeWidth="1.5"
                      />
                      <text
                        x="0"
                        y="-2"
                        textAnchor="middle"
                        fill={isLowBranch ? '#b45309' : '#047857'}
                        fontSize="9.5"
                        fontWeight="900"
                      >
                        {isLowBranch ? `< ${thresholdVal}%` : `≥ ${thresholdVal}%`}
                      </text>
                      <text
                        x="0"
                        y="7.5"
                        textAnchor="middle"
                        fill={isLowBranch ? '#d97706' : '#059669'}
                        fontSize="8"
                        fontWeight="800"
                      >
                        {isLowBranch ? 'Ruta Refuerzo' : 'Ruta Maestría'}
                      </text>
                    </g>
                  )}

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
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StudioBlockIcon blockType={block.type} size="sm" fallbackIcon={meta.icon} />
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
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1">
                        {block.data.speakerName && (
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 dark:text-blue-400 truncate">
                            <span>{block.data.speakerAvatar || '👤'}</span>
                            <span className="truncate">{block.data.speakerName}</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={(e) => playNodeNeuralTts(e, block, block.data.content || block.title, 'male')}
                          className="px-1.5 py-0.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-700 text-[9px] font-black flex items-center gap-1 shrink-0 cursor-pointer"
                          title="Escuchar con Voz Neural LatAm"
                        >
                          <Volume2 className="w-2.5 h-2.5" />
                          <span>{speakingNodeId === block.id ? 'Detener' : 'Voz IA'}</span>
                        </button>
                      </div>
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

                  {/* 6. Completar Espacios (Vista 1.1: Píldoras interactivas verdes + Validación) */}
                  {block.type === 'fill_in_blanks' && (
                    <div className="p-2.5 rounded-xl bg-slate-50/90 dark:bg-teal-950/40 border border-slate-200/80 dark:border-teal-800/50 text-[11px] space-y-2">
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-teal-300 line-clamp-1 block">
                        Oración interactiva con espacios:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {(block.data.wordBank || ['Querétaro', 'Ignacio Pérez', 'Dolores']).slice(0, 3).map((word: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-lg bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 font-black text-[9.5px]"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50/90 dark:bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-200/70">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Banco de {block.data.wordBank?.length || 4} palabras validado</span>
                        </span>
                        <span>✓</span>
                      </div>
                    </div>
                  )}

                  {/* 7. Pregunta Abierta con IA */}
                  {block.type === 'open_poll_wordcloud' && (
                    <div className="p-2 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/40 border border-cyan-200/50 text-[11px] space-y-1">
                      <span className="font-bold text-cyan-800 dark:text-cyan-300 line-clamp-1">
                        🤖 {block.data.prompt || 'Pregunta de reflexión formativa...'}
                      </span>
                      <span className="text-[9px] text-cyan-600 dark:text-cyan-400 block font-semibold">
                        Retroalimentación contextual + Nube en vivo
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

                  {/* 9. Combate Boss Pixi (Vista 1.1: Barra HP visual + 5 Reactivos Curriculares) */}
                  {block.type === 'boss_enemy' && (
                    <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/40 border border-rose-200/70 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10.5px] font-black text-rose-800 dark:text-rose-300 truncate">
                          ⚔️ {block.data.bossName || 'Duelo Boss Curricular'}
                        </span>
                        <span className="text-[9.5px] font-black text-rose-700 dark:text-rose-300 shrink-0">
                          {block.data.maxHp || 1200} HP
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-rose-200/80 overflow-hidden">
                        <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-rose-600 to-red-500" />
                      </div>
                      <div className="flex items-center justify-between text-[9px] font-black text-emerald-700 bg-white/90 px-2 py-0.5 rounded-lg border border-emerald-200">
                        <span>✓ Avatar & 5 Reactivos</span>
                        <span className="text-rose-600">-350 HP/acierto</span>
                      </div>
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

                  {/* 14. Bifurcación Adaptativa (Vista 1.1: Bifurcación Condicional Real) */}
                  {block.type === 'logic_branch' && (
                    <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-indigo-950/40 border border-teal-200/80 dark:border-indigo-800/50 text-[11px] font-bold text-teal-900 dark:text-indigo-200 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span>🔀 Bifurcación Condicional Real</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black border border-emerald-300">
                          ≥ {block.data.thresholdScore || 70}%
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-[8.5px] font-black">
                        <div className="px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 border border-emerald-300/70 truncate">
                          ✓ Ruta Maestría
                        </div>
                        <div className="px-1.5 py-0.5 rounded bg-amber-100/80 text-amber-800 border border-amber-300/70 truncate">
                          ↺ Ruta Refuerzo
                        </div>
                      </div>
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

                  {/* 18. Avatar Conversacional en Lenguajes */}
                  {block.type === 'languages_practice_portal' && (
                    <div className="p-2.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-bold text-violet-800 dark:text-violet-300">
                        <span className="flex items-center gap-1.5">
                          <Languages className="w-3.5 h-3.5 text-violet-600" />
                          <span>Avatar Didáctico IA</span>
                        </span>
                        <span className="text-[9px] bg-violet-200/80 dark:bg-violet-900/70 text-violet-800 dark:text-violet-200 px-1.5 py-0.5 rounded-md font-black">
                          {block.data.language === 'fr' ? '🇫🇷 Francés' : '🇺🇸 Inglés'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                        &ldquo;{block.data.targetPhrase || 'Hello students! Welcome to our interactive language session.'}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/teacher/idiomas');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-[10px] flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>Acceder al Portal de Lenguajes</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* 19. Karaoke de Fluidez Fonética */}
                  {block.type === 'languages_karaoke_block' && (
                    <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/50 border border-purple-200/70 dark:border-purple-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-bold text-purple-800 dark:text-purple-300">
                        <span className="flex items-center gap-1.5">
                          <Mic className="w-3.5 h-3.5 text-purple-600" />
                          <span>Karaoke Fonético</span>
                        </span>
                        <span className="text-[9px] bg-purple-200/80 dark:bg-purple-900/70 text-purple-800 dark:text-purple-200 px-1.5 py-0.5 rounded-md font-black">
                          {block.data.tempoWpm || 110} WPM
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-400 line-clamp-2 font-medium">
                        🎤 {block.data.targetSentence || 'The quick brown fox jumps over the lazy dog'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/teacher/idiomas');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-[10px] flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>Acceder al Centro de Idiomas</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* 20. Tutor Socrático IA */}
                  {block.type === 'languages_socratic_tutor' && (
                    <div className="p-2.5 rounded-xl bg-violet-50/80 dark:bg-violet-950/50 border border-violet-200/70 dark:border-violet-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-bold text-violet-800 dark:text-violet-300">
                        <span className="flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-violet-600" />
                          <span>Tutor Socrático IA</span>
                        </span>
                        <span className="text-[9px] bg-violet-200/80 dark:bg-violet-900/70 text-violet-800 dark:text-violet-200 px-1.5 py-0.5 rounded-md font-black">
                          {block.data.targetLevel || 'B1'} · {block.data.language === 'fr' ? '🇫🇷' : '🇬🇧'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-400 line-clamp-2 italic">
                        &ldquo;{block.data.starterPrompt || 'Discussing sustainability...'}&rdquo;
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/teacher/idiomas');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-[10px] flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>Gestionar en Centro de Idiomas</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* 21. Roleplay & Misión Inmersiva */}
                  {block.type === 'languages_roleplay_mission' && (
                    <div className="p-2.5 rounded-xl bg-fuchsia-50/80 dark:bg-fuchsia-950/50 border border-fuchsia-200/70 dark:border-fuchsia-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-bold text-fuchsia-800 dark:text-fuchsia-300">
                        <span className="flex items-center gap-1.5">
                          <Theater className="w-3.5 h-3.5 text-fuchsia-600" />
                          <span>Roleplay & Misión Real</span>
                        </span>
                        <span className="text-[9px] bg-fuchsia-200/80 dark:bg-fuchsia-900/70 text-fuchsia-800 dark:text-fuchsia-200 px-1.5 py-0.5 rounded-md font-black">
                          {block.data.language === 'fr' ? '🇫🇷 FLE' : '🇬🇧 ESL'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-400 line-clamp-2 font-medium">
                        🎭 {block.data.missionGoal || 'Misión comunicativa en contexto real'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/teacher/idiomas');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white font-black text-[10px] flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>Gestionar en Centro de Idiomas</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* 22. Rúbrica CENNI / DELF */}
                  {block.type === 'languages_evaluation_rubric' && (
                    <div className="p-2.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-200/70 dark:border-cyan-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-bold text-cyan-800 dark:text-cyan-300">
                        <span className="flex items-center gap-1.5">
                          <ClipboardCheck className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Rúbrica CENNI / DELF</span>
                        </span>
                        <span className="text-[9px] bg-cyan-200/80 dark:bg-cyan-900/70 text-cyan-800 dark:text-cyan-200 px-1.5 py-0.5 rounded-md font-black">
                          Mín. {block.data.passingScore || 70}%
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-400 line-clamp-2 font-medium">
                        📋 {block.data.framework || 'CEFR'} · Nivel {block.data.targetLevel || 'B2'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push('/teacher/idiomas');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white font-black text-[10px] flex items-center justify-center gap-1.5 shadow-sm hover:shadow transition-all cursor-pointer"
                      >
                        <span>Gestionar en Centro de Idiomas</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
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

                  {/* 28. Personaje o Sitio Histórico 3D (Vista 1.1: Tarjeta Rica con Retrato, Cita en 1ª Persona, 4 Viñetas, GPS, Voz Neural LatAm y Selector Dinámico de 22+ Personajes de la Bóveda) */}
                  {block.type === 'historical_figure_block' && (
                    <div className="space-y-2">
                      {/* Selector Rápido de Personaje o Sitio Histórico de la Bóveda Curricular (Cero dependencia de Josefa Ortiz) */}
                      <div className="flex items-center gap-1.5">
                        <select
                          value={block.data.characterName || block.data.characterOrSiteName || 'Miguel Hidalgo y Costilla'}
                          onChange={(e) => {
                            e.stopPropagation();
                            const val = e.target.value;
                            const isSite = val.toLowerCase().includes('querétaro') || val.toLowerCase().includes('alhóndiga') || val.toLowerCase().includes('chapultepec') || val.toLowerCase().includes('teotihuacán') || val.toLowerCase().includes('chichén');
                            switchHistoricalFigureOnBlock(block.id, val, isSite);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-1 rounded-lg bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700 text-[10px] font-black text-amber-950 dark:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                          title="Cambiar Personaje o Sitio Histórico al instante desde la Bóveda Curricular"
                        >
                          {HISTORICAL_FIGURES_PRESET_CATALOG.map((fig) => {
                            const fName = fig.characterName || fig.characterOrSiteName || 'Personaje Histórico';
                            return (
                              <option key={fName} value={fName}>
                                {fig.isGeographicSite ? '🗺️ ' : '🏛️ '}{fName}
                              </option>
                            );
                          })}
                          <option value="Ignacio Allende">🏛️ Ignacio Allende (1769–1811)</option>
                          <option value="Francisco I. Madero">🏛️ Francisco I. Madero (1873–1913)</option>
                          <option value="Carmen Serdán Alatriste">🏛️ Carmen Serdán Alatriste (1873–1948)</option>
                          <option value="Aquiles Serdán">🏛️ Aquiles Serdán (1877–1910)</option>
                          <option value="Guadalupe Victoria">🏛️ Guadalupe Victoria (1786–1843)</option>
                          <option value="Felipe Ángeles">🏛️ Felipe Ángeles (1868–1919)</option>
                          <option value="Belisario Domínguez">🏛️ Belisario Domínguez (1863–1913)</option>
                          <option value="Ricardo Flores Magón">🏛️ Ricardo Flores Magón (1873–1922)</option>
                          <option value="José Guadalupe Posada">🏛️ José Guadalupe Posada (1852–1913)</option>
                          <option value="Andrés Quintana Roo">🏛️ Andrés Quintana Roo (1787–1851)</option>
                          <option value="Plutarco Elías Calles">🏛️ Plutarco Elías Calles (1877–1945)</option>
                          <option value="Gustavo Díaz Ordaz">🏛️ Gustavo Díaz Ordaz (1911–1979)</option>
                        </select>
                      </div>

                      {/* Retrato Ilustrado del Personaje / Sitio */}
                      <div className="relative w-full h-28 rounded-2xl overflow-hidden border border-amber-200/80 bg-gradient-to-b from-amber-900/20 to-stone-900/80 shadow-inner">
                        <img
                          src={block.data.avatarImageUrl || '/images/history/hidalgo_avatar.png'}
                          alt={block.data.characterName || block.data.characterOrSiteName || block.title}
                          className="w-full h-full object-cover object-top"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = '/images/history/josefa_ortiz_avatar.png';
                          }}
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent px-2.5 py-1.5 flex items-center justify-between">
                          <span className="text-[9px] font-black text-amber-200 truncate">
                            {block.data.birthDeathDates || 'Bóveda Curricular SEP'}
                          </span>
                          <span className="text-[8.5px] font-bold text-white/90 bg-amber-600/80 px-1.5 py-0.5 rounded">
                            1ª Persona
                          </span>
                        </div>
                      </div>

                      {/* Fechas y Época */}
                      <div className="text-center">
                        <span className="text-[9.5px] font-black text-slate-600 dark:text-zinc-300 block truncate">
                          {block.data.historicalEra || 'Historia de México • SEP NEM'}
                        </span>
                      </div>

                      {/* Cita en Primera Persona */}
                      <p className="text-[10.5px] text-slate-700 dark:text-zinc-300 italic line-clamp-2 bg-amber-50/60 dark:bg-amber-950/30 px-2.5 py-1.5 rounded-xl border border-amber-200/60 leading-snug">
                        &ldquo;{block.data.firstPersonGreeting || block.data.introDialogue || block.data.shortBio || 'Hablo en primera persona con rigor histórico verificado...' }&rdquo;
                      </p>

                      {/* Píldoras de 4 Viñetas Cómic + Mapa GPS y Voz Neural LatAm Activa */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-100/90 dark:bg-zinc-800/80 text-[9.5px] font-bold text-slate-700 dark:text-zinc-300 border border-slate-200/80">
                          <span>📖 {block.data.moments?.length || 4} Viñetas Cómic + Mapa GPS</span>
                          <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            const cName = block.data.characterName || block.data.characterOrSiteName || 'Personaje Histórico';
                            const isFemale = /Josefa|Sor Juana|Carmen|Leona|Frida|Querétaro/i.test(cName);
                            playNodeNeuralTts(
                              e,
                              block,
                              block.data.firstPersonGreeting || block.data.introDialogue || block.data.shortBio || `Soy ${cName}.`,
                              block.data.voiceGender || (isFemale ? 'female' : 'male')
                            );
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl font-black text-[10px] flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                            speakingNodeId === block.id
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md animate-pulse'
                              : 'bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 border-emerald-300/80'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            {speakingNodeId === block.id
                              ? '🔊 Hablando en 1ª Persona...'
                              : '🔊 Voz Neural LatAm Activa'}
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 29. Examen Híbrido OMR & Variantes A/B/C/D (0 Tokens) */}
                  {block.type === 'omr_optical_exam_block' && (
                    <div className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/50 border border-rose-200/80 dark:border-rose-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-black text-rose-800 dark:text-rose-200">
                        <span>📝 {block.data.variantsCount || 4} Filas Anti-Copia</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                          0 Tokens
                        </span>
                      </div>
                      <div className="flex items-center gap-1 justify-between">
                        {['A', 'B', 'C', 'D'].slice(0, block.data.variantsCount || 4).map((v) => (
                          <span key={v} className="flex-1 text-center py-0.5 rounded bg-white dark:bg-zinc-900 border border-rose-200 text-[9.5px] font-black text-rose-700">
                            Fila {v}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[9.5px] font-bold text-slate-600 dark:text-zinc-300">
                        <span>📄 Hoja OMR + QR</span>
                        <span>📷 Escáner &lt;1s</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(block.id);
                          if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('iskool:open-omr-exam-suite', { detail: { blockId: block.id } }));
                          }
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-black text-[10px] flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <span>📝 Abrir Suite OMR &amp; Escáner</span>
                      </button>
                    </div>
                  )}

                  {/* 30. Mapa de Puntos Calientes & Oclusión Visual (0 Tokens) */}
                  {block.type === 'interactive_hotspot_canvas' && (
                    <div className="p-2.5 rounded-xl bg-cyan-50/80 dark:bg-cyan-950/50 border border-cyan-200/80 dark:border-cyan-800/60 text-[11px] space-y-2">
                      <div className="flex items-center justify-between font-black text-cyan-800 dark:text-cyan-200">
                        <span>🎯 {(block.data.hotspots || []).length} Puntos Calientes</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                          0 Tokens
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {(block.data.hotspots || []).slice(0, 3).map((pin) => (
                          <span key={pin.id} className="px-1.5 py-0.5 rounded bg-white dark:bg-zinc-900 border border-cyan-200 text-[9px] font-bold text-slate-700 dark:text-zinc-300 truncate max-w-[120px]">
                            📍 {pin.correctLabel}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 31. Apuntes Cornell & Sello QR de Libreta (0 Tokens) */}
                  {block.type === 'cornell_smart_notes' && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-black text-emerald-800 dark:text-emerald-200">
                        <span>📓 Sello Pág. {block.data.notebookPageNumber || 48}</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                          0 Tokens
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-zinc-300 font-medium line-clamp-2">
                        🔑 Conceptos: {(block.data.requiredSummaryKeywords || []).slice(0, 4).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* 32. Boleto de Salida 3-2-1 & Termómetro Aula (0 Tokens) */}
                  {block.type === 'exit_ticket_reflection' && (
                    <div className="p-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/60 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-black text-amber-800 dark:text-amber-200">
                        <span>🚦 Boleto 3-2-1 SEP</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                          0 Tokens
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1 text-center text-[9px] font-black">
                        <span className="py-0.5 rounded bg-emerald-100 text-emerald-800">🟢 Dominado</span>
                        <span className="py-0.5 rounded bg-amber-100 text-amber-800">🟡 Duda</span>
                        <span className="py-0.5 rounded bg-rose-100 text-rose-800">🔴 Apoyo</span>
                      </div>
                    </div>
                  )}

                  {/* 33. Foro de Debate & Co-Evaluación SEP (0 Tokens) */}
                  {block.type === 'socratic_debate_arena' && (
                    <div className="p-2.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/50 border border-indigo-200/80 dark:border-indigo-800/60 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-black text-indigo-800 dark:text-indigo-200">
                        <span>⚖️ Debate &amp; Pares</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                          0 Tokens
                        </span>
                      </div>
                      <p className="text-[9.5px] font-bold text-slate-600 dark:text-zinc-300 truncate">
                        🅰️ {block.data.stanceATitle} vs 🅱️ {block.data.stanceBTitle}
                      </p>
                    </div>
                  )}

                  {/* 34. Pizarra Matemática & Graficador STEM (0 Tokens) */}
                  {block.type === 'interactive_whiteboard_math' && (
                    <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 text-[11px] space-y-1.5">
                      <div className="flex items-center justify-between font-black text-blue-800 dark:text-blue-200">
                        <span>📐 Graficador STEM</span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-black">
                          0 Tokens
                        </span>
                      </div>
                      <div className="px-2 py-1 rounded bg-white dark:bg-zinc-900 border border-blue-200 font-mono text-[10px] font-black text-blue-700 text-center">
                        {block.data.formulaExpression || 'y = 2x + 3'} → ({block.data.targetCoordinate?.x ?? 2}, {block.data.targetCoordinate?.y ?? 7})
                      </div>
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

      {/* 2D Radar Minimap (Nuevo Rediseño 1 - Vista 1.1: Navegación Topológica en Vivo) */}
      {blocks.length > 0 && (
        <div className="hidden md:flex flex-col absolute bottom-4 right-4 z-30 w-44 h-28 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl border border-slate-200/90 dark:border-zinc-800 shadow-xl p-2 select-none">
          <div className="flex items-center justify-between mb-1 px-0.5">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              2D Radar Minimap
            </span>
            <span className="text-[8.5px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
              {blocks.length} Nodos
            </span>
          </div>
          <div className="relative flex-1 w-full rounded-xl bg-slate-50/90 dark:bg-zinc-950/80 border border-slate-200/70 dark:border-zinc-800 overflow-hidden">
            {(() => {
              const allX = blocks.map(b => b.position?.x || 80);
              const allY = blocks.map(b => b.position?.y || 150);
              const minX = Math.min(...allX, 40);
              const minY = Math.min(...allY, 40);
              const maxX = Math.max(...allX.map(x => x + NODE_WIDTH), minX + 900);
              const maxY = Math.max(...allY.map(y => y + 200), minY + 520);
              const spanX = Math.max(400, maxX - minX + 80);
              const spanY = Math.max(260, maxY - minY + 80);

              return (
                <>
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 160 80" preserveAspectRatio="none">
                    {connections.map((conn) => {
                      const s = blocks.find(b => b.id === conn.sourceNodeId);
                      const t = blocks.find(b => b.id === conn.targetNodeId);
                      if (!s || !t) return null;
                      const sx = (((s.position?.x || 80) + NODE_WIDTH - minX + 20) / spanX) * 160;
                      const sy = (((s.position?.y || 150) + 60 - minY + 20) / spanY) * 80;
                      const tx = (((t.position?.x || 80) - minX + 20) / spanX) * 160;
                      const ty = (((t.position?.y || 150) + 60 - minY + 20) / spanY) * 80;
                      const isAmber = conn.condition === 'score_low';
                      return (
                        <line
                          key={conn.id}
                          x1={sx}
                          y1={sy}
                          x2={tx}
                          y2={ty}
                          stroke={isAmber ? '#f59e0b' : '#10b981'}
                          strokeWidth="1.8"
                        />
                      );
                    })}
                  </svg>
                  {blocks.map((b) => {
                    const leftPct = Math.min(82, Math.max(4, (((b.position?.x || 80) - minX + 20) / spanX) * 100));
                    const topPct = Math.min(76, Math.max(6, (((b.position?.y || 150) - minY + 20) / spanY) * 100));
                    const isSel = selectedBlockId === b.id;
                    const isHist = b.type === 'historical_figure_block';
                    const isBoss = b.type === 'boss_enemy';
                    const isLogic = b.type === 'logic_branch';
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBlockId(b.id);
                          if (scrollContainerRef.current) {
                            scrollContainerRef.current.scrollTo({
                              left: Math.max(0, ((b.position?.x || 80) - 80) * zoomLevel),
                              top: Math.max(0, ((b.position?.y || 150) - 80) * zoomLevel),
                              behavior: 'smooth'
                            });
                          }
                        }}
                        style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                        title={b.title}
                        className={`absolute w-5 h-3 rounded-sm transition-transform cursor-pointer ${
                          isSel
                            ? 'ring-2 ring-emerald-500 scale-125 z-20 bg-emerald-500'
                            : isHist
                              ? 'bg-amber-500/90'
                              : isBoss
                                ? 'bg-rose-500/90'
                                : isLogic
                                  ? 'bg-teal-500/90'
                                  : 'bg-indigo-500/80'
                        }`}
                      />
                    );
                  })}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
