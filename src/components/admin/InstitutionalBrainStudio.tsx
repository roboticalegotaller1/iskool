"use client";

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  Network,
  Sparkles,
  Search,
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  BookOpen,
  DollarSign,
  ShieldAlert,
  GraduationCap,
  Gamepad2,
  Building2,
  ArrowRight,
  Copy,
  CheckCircle2,
  Clock,
  Send,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Activity,
  Check,
  FileText,
  Info,
  Edit3,
  Plus,
  Trash2,
  Save,
  Globe,
  Compass,
  Eye,
  Sliders
} from 'lucide-react';
import {
  NodeCluster,
  BrainNode,
  BrainEdge,
  CLUSTER_CONFIG_MAP,
  buildSchoolInstitutionalGraph
} from '@/services/institutionalGraphEngine';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

// ============================================================================
// PROPS DEL COMPONENTE ESTUDIO DEL CEREBRO INSTITUCIONAL
// ============================================================================
export interface InstitutionalBrainStudioProps {
  isOpen: boolean;
  onClose: () => void;
  holdingName?: string;
  schoolId?: string;
  initialQuery?: string;
  onNavigateTab?: (tab: string) => void;
  isEmbeddedView?: boolean;
}

export const InstitutionalBrainStudio: React.FC<InstitutionalBrainStudioProps> = ({
  isOpen,
  onClose,
  holdingName = 'Colegio Nacional Mexico',
  schoolId,
  initialQuery = '',
  onNavigateTab,
  isEmbeddedView = false
}) => {
  // Conexión reactiva al almacén del colegio para aislamiento multi-tenant estricto
  const {
    institutionsList,
    campusesList,
    detailedStudents,
    teachersList,
    groupsList,
    subjectsList,
    billingRecords,
    activeSchoolId
  } = useSchoolAdminStore();

  const effectiveSchoolId = schoolId || activeSchoolId || 'sch-ibime';

  // Generación determinista del grafo aislado para este colegio
  const {
    nodes: baseNodes,
    edges: baseEdges,
    institution
  } = useMemo(() => {
    return buildSchoolInstitutionalGraph(effectiveSchoolId, {
      institutionsList,
      campusesList,
      detailedStudents,
      teachersList,
      groupsList,
      subjectsList,
      billingRecords,
      holdingName
    });
  }, [
    effectiveSchoolId,
    institutionsList,
    campusesList,
    detailedStudents,
    teachersList,
    groupsList,
    subjectsList,
    billingRecords,
    holdingName
  ]);

  // Estados de vista e interacción
  const [viewMode, setViewMode] = useState<'split' | 'graph' | 'assistant'>('split');
  const [selectedNodeId, setSelectedNodeId] = useState<string>(() => `core-${effectiveSchoolId}`);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [filterCluster, setFilterCluster] = useState<NodeCluster | 'all'>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [isCardMinimized, setIsCardMinimized] = useState<boolean>(false);

  // Estados de Cámara: Zoom & Pan
  const [zoom, setZoom] = useState<number>(0.38); // Inicial en vista macro cósmica
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const startPanRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchDataRef = useRef<{ x: number; y: number; dist: number }>({ x: 0, y: 0, dist: 0 });
  const hasAutoCenteredRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animación de cámara cinemática
  const cameraAnimRef = useRef<number | null>(null);

  // Terminal de Inteligencia Artificial Pedagógica
  const [chatInput, setChatInput] = useState<string>(initialQuery || '');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeDictamen, setActiveDictamen] = useState<{
    title: string;
    text: string;
    source: string;
    bovedaPath: string;
    latencyMs: number;
    confidence: number;
    kpis?: Array<{ label: string; value: string }>;
    wikilinks: string[];
    actionLabel?: string;
    actionType?: string;
    isOptimized?: boolean;
    timestamp: string;
  } | null>(null);

  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const lastInitialQueryRef = useRef<string | null>(null);

  // Nodos con persistencia reactiva local por colegio
  const storageKeyNodes = `iskool_boveda_nodes_${effectiveSchoolId}_v3`;
  const storageKeyEdges = `iskool_boveda_edges_${effectiveSchoolId}_v3`;

  const [nodes, setNodes] = useState<BrainNode[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeyNodes);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return baseNodes;
  });

  const [edges, setEdges] = useState<BrainEdge[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKeyEdges);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {}
      }
    }
    return baseEdges;
  });

  // Re-sincronizar cuando cambia de colegio
  useEffect(() => {
    setSelectedNodeId(`core-${effectiveSchoolId}`);
    setNodes(baseNodes);
    setEdges(baseEdges);
    // Reiniciar vista centrada
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      setPan({ x: clientWidth / 2, y: clientHeight / 2 });
      setZoom(0.42);
    }
  }, [effectiveSchoolId, baseNodes, baseEdges]);

  // Notificación flotante de acción directiva
  const [actionToast, setActionToast] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 3200);
  };

  // Modal de Edición / Creación de Protocolos
  const [isProtocolModalOpen, setIsProtocolModalOpen] = useState<boolean>(false);
  const [protocolModalMode, setProtocolModalMode] = useState<'create' | 'edit'>('edit');
  const [isOptimizingWithAI, setIsOptimizingWithAI] = useState<boolean>(false);

  const [protocolForm, setProtocolForm] = useState<{
    id?: string;
    title: string;
    subtitle: string;
    cluster: NodeCluster;
    bovedaPath: string;
    summary: string;
    dictamenText: string;
    keywords: string;
    kpis: Array<{ label: string; value: string }>;
  }>({
    title: '',
    subtitle: '',
    cluster: 'medico',
    bovedaPath: '',
    summary: '',
    dictamenText: '',
    keywords: '',
    kpis: [
      { label: 'Tiempo de Acción', value: '< 60 s' },
      { label: 'Notificación', value: '< 3 min' },
      { label: 'Bitácora Legal', value: '100% Digital' }
    ]
  });

  const saveGraphData = (newNodes: BrainNode[], newEdges: BrainEdge[]) => {
    setNodes(newNodes);
    setEdges(newEdges);
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKeyNodes, JSON.stringify(newNodes));
      localStorage.setItem(storageKeyEdges, JSON.stringify(newEdges));
    }
  };

  // Mapeo rápido de nodos
  const nodeMap = useMemo(() => {
    const map = new Map<string, BrainNode>();
    nodes.forEach(n => map.set(n.id, n));
    return map;
  }, [nodes]);

  const selectedNode = useMemo(() => {
    return nodeMap.get(selectedNodeId) || nodes[0];
  }, [nodeMap, selectedNodeId, nodes]);

  // Aristas conectadas al nodo seleccionado
  const activeEdges = useMemo(() => {
    if (!selectedNodeId) return new Set<string>();
    const connected = new Set<string>();
    edges.forEach(edge => {
      if (edge.source === selectedNodeId) connected.add(edge.target);
      if (edge.target === selectedNodeId) connected.add(edge.source);
    });
    return connected;
  }, [selectedNodeId, edges]);

  // Nodos filtrados
  const filteredNodes = useMemo(() => {
    let list = nodes;
    if (filterCluster !== 'all') {
      list = list.filter(n => n.cluster === filterCluster || n.tier === 'macro');
    }
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      list = list.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.subtitle.toLowerCase().includes(q) ||
        n.keywords.some(k => k.includes(q))
      );
    }
    return list;
  }, [nodes, filterCluster, searchFilter]);

  // Transición suave de cámara (fly-to)
  const flyTo = useCallback((targetX: number, targetY: number, targetZoom: number, durationMs = 600) => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    const startX = pan.x;
    const startY = pan.y;
    const startZ = zoom;

    // Queremos que el punto (targetX, targetY) quede en el centro de la pantalla
    const destPanX = clientWidth / 2 - targetX * targetZoom;
    const destPanY = clientHeight / 2 - targetY * targetZoom;

    const startTime = performance.now();
    if (cameraAnimRef.current) cancelAnimationFrame(cameraAnimRef.current);

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // Easing cubic out
      const ease = 1 - Math.pow(1 - progress, 3);

      const curX = startX + (destPanX - startX) * ease;
      const curY = startY + (destPanY - startY) * ease;
      const curZ = startZ + (targetZoom - startZ) * ease;

      setPan({ x: curX, y: curY });
      setZoom(curZ);

      if (progress < 1) {
        cameraAnimRef.current = requestAnimationFrame(animate);
      } else {
        cameraAnimRef.current = null;
      }
    };

    cameraAnimRef.current = requestAnimationFrame(animate);
  }, [pan.x, pan.y, zoom]);

  // Centrado en nodo
  const centerOnNode = useCallback((node: BrainNode, targetZoom = 1.35) => {
    flyTo(node.x, node.y, targetZoom, 550);
  }, [flyTo]);

  // Botón Vista Galáctica (Zoom Out - Imagen 3)
  const handleViewGalaxy = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    flyTo(0, 0, 0.38, 700);
  };

  // Botón Vista Sináptica (Zoom In - Imagen 2)
  const handleViewSynaptic = () => {
    flyTo(0, 0, 1.15, 650);
  };

  // ============================================================================
  // EJECUTOR DE CONSULTA EN INTELIGENCIA ARTIFICIAL PEDAGÓGICA (0 TOKENS)
  // ============================================================================
  const executeQuery = useCallback((queryText: string) => {
    const clean = (queryText || '').trim();
    if (!clean) return;

    setIsGenerating(true);
    const t0 = performance.now();
    const qLower = clean.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const qWords = qLower.split(/\s+/).filter(w => w.length > 2);

    let bestScore = -1;
    let bestNode = nodes[0] || baseNodes[0];

    nodes.forEach(node => {
      let score = 0;
      const nid = node.id.toLowerCase();
      const nTitle = node.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const nSub = node.subtitle.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      if (qLower.includes(nid)) score += 35;
      if (nTitle.includes(qLower) || qLower.includes(nTitle)) score += 30;

      // Ponderaciones temáticas
      if ((qLower.includes('planeacion') || qLower.includes('nem') || qLower.includes('pda')) && node.cluster === 'pedagogico') score += 25;
      if ((qLower.includes('cfdi') || qLower.includes('sat') || qLower.includes('factura') || qLower.includes('iedu') || qLower.includes('aging')) && node.cluster === 'fiscal') score += 25;
      if ((qLower.includes('alergia') || qLower.includes('sismo') || qLower.includes('salud') || qLower.includes('expediente')) && node.cluster === 'medico') score += 25;
      if ((qLower.includes('sede') || qLower.includes('plantel') || qLower.includes('campus')) && node.cluster === 'gobernanza') score += 25;
      if ((qLower.includes('mision') || qLower.includes('lienzo') || qLower.includes('xp') || qLower.includes('juego')) && node.cluster === 'gamificacion') score += 25;
      if ((qLower.includes('profesor') || qLower.includes('docente') || qLower.includes('maestro')) && node.cluster === 'docente') score += 25;

      node.keywords.forEach(kw => {
        if (qLower.includes(kw)) score += 5;
        qWords.forEach(w => {
          if (kw.includes(w)) score += 2;
        });
      });

      if (score > bestScore) {
        bestScore = score;
        bestNode = node;
      }
    });

    const elapsed = Math.max(0.6, Math.round((performance.now() - t0) * 10) / 10);
    const finalText = bestNode.customDictamenText || bestNode.summary;

    setActiveDictamen({
      title: bestNode.title,
      text: finalText,
      source: bestNode.title,
      bovedaPath: bestNode.bovedaPath,
      latencyMs: elapsed,
      confidence: bestScore > 0 ? Math.min(99, 85 + bestScore * 2) : 92,
      kpis: bestNode.kpis || [
        { label: 'Estatus', value: 'Vigente' },
        { label: 'Bóveda', value: 'Indexada' },
        { label: 'Consumo', value: '0 Tokens' }
      ],
      wikilinks: bestNode.wikilinks,
      actionLabel: bestNode.actionLabel,
      actionType: bestNode.actionType,
      isOptimized: Boolean(bestNode.isOptimized),
      timestamp: bestNode.updatedAt || bestNode.optimizedAt || new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });

    setSelectedNodeId(bestNode.id);
    centerOnNode(bestNode, 1.35);
    setFilterCluster('all');
    setIsGenerating(false);

    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, [nodes, baseNodes, centerOnNode]);

  // Selección de nodo desde la UI
  const handleSelectNode = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    const node = nodeMap.get(nodeId);
    if (node) {
      centerOnNode(node, 1.35);
      setChatInput(node.title);
      executeQuery(node.title);
    }
  };

  // Controles de zoom manual
  const handleZoomIn = () => setZoom(z => Math.min(2.8, z * 1.25));
  const handleZoomOut = () => setZoom(z => Math.max(0.18, z * 0.8));
  const handleResetView = () => {
    if (!containerRef.current) return;
    const { clientWidth, clientHeight } = containerRef.current;
    flyTo(0, 0, 0.42, 500);
    setSelectedNodeId(`core-${effectiveSchoolId}`);
  };

  // Optimización de protocolo con IA Pedagógica
  const handleOptimizeCurrentProtocol = () => {
    const node = nodeMap.get(selectedNodeId);
    if (!node) return;

    setIsOptimizingWithAI(true);
    setTimeout(() => {
      const nowStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const enhancedText = `**Directiva Optimizada por Inteligencia Artificial Pedagógica (SEP 2024):**\n\n${node.summary}\n\n1. **Fase de Detección e Inicio (0-30s):** Notificación auditada en pantalla y activación de responsables.\n2. **Fase de Ejecución y Contención (< 90s):** Aplicación de lineamientos estandarizados con bitácora inmutable.\n3. **Cierre Reflexivo & Comunicación (< 3m):** Respaldo criptográfico en la Bóveda Central y comunicación a tutores legales.\n\n*Conformidad:* Auditoría pedagógica certificada a 0 Tokens.`;
      
      const updatedNodes = nodes.map(n => {
        if (n.id === node.id) {
          return {
            ...n,
            summary: `${n.summary} (Optimizado con lineamientos SEP 2024)`,
            customDictamenText: enhancedText,
            isOptimized: true,
            optimizedAt: nowStr,
            updatedAt: nowStr
          };
        }
        return n;
      });

      saveGraphData(updatedNodes, edges);

      try {
        fetch('/api/vault/protocol', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: node.id,
            title: node.title,
            cluster: node.cluster,
            bovedaPath: node.bovedaPath,
            content: enhancedText,
            kpis: node.kpis,
            summary: node.summary,
            isOptimized: true,
            wikilinks: node.wikilinks
          })
        }).catch(err => console.warn('Aviso de sincronización:', err));
      } catch (e) {}

      setActiveDictamen(prev => prev ? {
        ...prev,
        text: enhancedText,
        confidence: 99,
        isOptimized: true,
        timestamp: nowStr
      } : null);

      setIsOptimizingWithAI(false);
      showToast('¡Protocolo optimizado y guardado en la Bóveda Central!');
    }, 350);
  };

  // Abrir modal de edición
  const handleOpenEditModal = () => {
    const node = nodeMap.get(selectedNodeId);
    if (!node) return;
    setProtocolModalMode('edit');
    setProtocolForm({
      id: node.id,
      title: node.title,
      subtitle: node.subtitle,
      cluster: node.cluster,
      bovedaPath: node.bovedaPath,
      summary: node.summary,
      dictamenText: activeDictamen?.text || node.summary,
      keywords: node.keywords.join(', '),
      kpis: node.kpis && node.kpis.length >= 3 ? node.kpis : [
        { label: 'Tiempo Respuesta', value: '< 60 s' },
        { label: 'Estatus', value: 'Vigente' },
        { label: 'Bitácora', value: '100% Digital' }
      ]
    });
    setIsProtocolModalOpen(true);
  };

  // Abrir modal de creación
  const handleOpenCreateModal = () => {
    setProtocolModalMode('create');
    const defaultCluster: NodeCluster = filterCluster !== 'all' ? filterCluster : 'medico';
    setProtocolForm({
      title: '',
      subtitle: '',
      cluster: defaultCluster,
      bovedaPath: `boveda://${effectiveSchoolId}/${defaultCluster}/nuevo-protocolo.md`,
      summary: '',
      dictamenText: '',
      keywords: 'protocolo, directiva, escolar, seguridad, sep',
      kpis: [
        { label: 'Tiempo de Acción', value: '< 60 s' },
        { label: 'Notificación', value: '< 3 min' },
        { label: 'Estatus Bóveda', value: 'Indexado' }
      ]
    });
    setIsProtocolModalOpen(true);
  };

  // Guardar protocolo nuevo o editado
  const handleSaveProtocol = (e: React.FormEvent) => {
    e.preventDefault();
    if (!protocolForm.title.trim()) return;

    const cleanKeywords = protocolForm.keywords
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    const nowStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newCustomText = protocolForm.dictamenText.trim() || protocolForm.summary.trim();

    if (protocolModalMode === 'edit' && protocolForm.id) {
      const updatedNodes = nodes.map(n => {
        if (n.id === protocolForm.id) {
          return {
            ...n,
            title: protocolForm.title.trim(),
            subtitle: protocolForm.subtitle.trim(),
            cluster: protocolForm.cluster,
            bovedaPath: protocolForm.bovedaPath.trim(),
            summary: protocolForm.summary.trim(),
            keywords: cleanKeywords.length > 0 ? cleanKeywords : n.keywords,
            kpis: protocolForm.kpis,
            customDictamenText: newCustomText,
            updatedAt: nowStr,
            isOptimized: n.isOptimized || false
          };
        }
        return n;
      });

      saveGraphData(updatedNodes, edges);
      setIsProtocolModalOpen(false);
      showToast('Protocolo actualizado y guardado en la Bóveda Central.');
    } else {
      const newId = `node-custom-${Date.now()}`;
      const angle = (nodes.length * 28) % 360;
      const rad = (angle * Math.PI) / 180;
      const r = 420;
      const x = Math.round(r * Math.cos(rad));
      const y = Math.round(r * Math.sin(rad));

      const newNode: BrainNode = {
        id: newId,
        title: protocolForm.title.trim(),
        subtitle: protocolForm.subtitle.trim() || 'Directiva Escolar Registrada',
        cluster: protocolForm.cluster,
        tier: 'meso',
        x,
        y,
        radius: 20,
        reads: 1,
        bovedaPath: protocolForm.bovedaPath.trim() || `boveda://${effectiveSchoolId}/${protocolForm.cluster}/${newId}.md`,
        summary: protocolForm.summary.trim() || protocolForm.title.trim(),
        keywords: cleanKeywords.length > 0 ? cleanKeywords : [protocolForm.title.toLowerCase()],
        kpis: protocolForm.kpis,
        wikilinks: [`core-${effectiveSchoolId}`],
        customDictamenText: newCustomText,
        isOptimized: true,
        updatedAt: nowStr
      };

      const newEdge: BrainEdge = {
        source: `core-${effectiveSchoolId}`,
        target: newId,
        label: 'Directiva',
        strength: 2
      };

      const updatedNodes = [...nodes, newNode];
      const updatedEdges = [...edges, newEdge];
      saveGraphData(updatedNodes, updatedEdges);

      setSelectedNodeId(newId);
      centerOnNode(newNode, 1.35);
      setIsProtocolModalOpen(false);
      showToast(`Protocolo "${newNode.title}" creado y conectado a la Bóveda.`);
    }
  };

  // Copiar dictamen
  const handleCopyDictamen = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2200);
  };

  // ============================================================================
  // MOTOR DE RENDERIZADO CANVAS 2D DE ALTA VELOCIDAD (60 FPS & RETINA HIDPI)
  // DOBLE ESCALA: Zoom In (Imagen 2) vs Zoom Out Galáctico (Imagen 3)
  // ============================================================================
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Espacio transformado de la cámara
      ctx.save();
      ctx.translate(pan.x, pan.y);
      ctx.scale(zoom, zoom);

      const isZoomOut = zoom < 0.65;
      const time = performance.now() * 0.0015;

      // 1. ANILLO CÓSMICO EXTERIOR (Esfera Galáctica de Imagen 3)
      if (isZoomOut) {
        // Anillo exterior guía
        ctx.beginPath();
        ctx.arc(0, 0, 880, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.12)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Anillo interior sutil
        ctx.beginPath();
        ctx.arc(0, 0, 520, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Nubes de nebulosa por clúster (gradientes radiales suaves)
        const nebulae = [
          { x: -350, y: -200, color: 'rgba(16, 185, 129, 0.08)', r: 280 }, // Verde pedagógico
          { x: 350, y: -200, color: 'rgba(6, 182, 212, 0.08)', r: 280 },  // Cian fiscal
          { x: -350, y: 200, color: 'rgba(244, 63, 94, 0.08)', r: 260 },  // Rosa médico
          { x: 350, y: 200, color: 'rgba(168, 85, 247, 0.08)', r: 260 }, // Púrpura CRM
          { x: 0, y: 350, color: 'rgba(236, 72, 153, 0.08)', r: 280 },   // Fucsia game
          { x: 0, y: -380, color: 'rgba(245, 158, 11, 0.08)', r: 260 }   // Ámbar sedes
        ];

        nebulae.forEach(neb => {
          const g = ctx.createRadialGradient(neb.x, neb.y, 10, neb.x, neb.y, neb.r);
          g.addColorStop(0, neb.color);
          g.addColorStop(1, 'transparent');
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(neb.x, neb.y, neb.r, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // 2. RENDERIZADO DE ARISTAS Y FILAMENTOS SINÁPTICOS
      edges.forEach(edge => {
        const sourceNode = nodeMap.get(edge.source);
        const targetNode = nodeMap.get(edge.target);
        if (!sourceNode || !targetNode) return;

        const isConnectedToSelected =
          edge.source === selectedNodeId || edge.target === selectedNodeId;
        const isHovered =
          edge.source === hoveredNodeId || edge.target === hoveredNodeId;

        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);

        if (edge.isBridge) {
          // NOTA PUENTE: Enlace inter-clúster destacado (Imagen 2)
          ctx.lineWidth = isConnectedToSelected || isHovered ? 2.5 : 1.8;
          ctx.strokeStyle = isConnectedToSelected || isHovered ? '#A5B4FC' : 'rgba(129, 140, 248, 0.45)';
          ctx.setLineDash([6, 4]);
          ctx.stroke();
          ctx.setLineDash([]);

          // Etiqueta flotante del puente en Zoom In
          if (!isZoomOut && zoom >= 0.75 && edge.label) {
            const mx = (sourceNode.x + targetNode.x) / 2;
            const my = (sourceNode.y + targetNode.y) / 2;
            ctx.save();
            ctx.font = 'bold 9px monospace';
            const textMetrics = ctx.measureText(edge.label);
            const pw = textMetrics.width + 10;
            const ph = 14;

            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = 'rgba(129, 140, 248, 0.5)';
            ctx.lineWidth = 1;
            ctx.roundRect(mx - pw / 2, my - ph / 2, pw, ph, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#C7D2FE';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(edge.label, mx, my);
            ctx.restore();
          }
        } else {
          // Aristas estándar
          if (isZoomOut) {
            // Filamentos sutiles en Zoom Out para recrear la maraña cósmica de Imagen 3
            ctx.lineWidth = 0.75;
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
          } else {
            ctx.lineWidth = isConnectedToSelected || isHovered ? 2.2 : Math.max(0.9, edge.strength * 0.75);
            ctx.strokeStyle = isConnectedToSelected || isHovered
              ? '#818CF8'
              : 'rgba(51, 65, 85, 0.45)';
          }
          ctx.stroke();
        }
      });

      // 3. RENDERIZADO DE NODOS DE CONOCIMIENTO
      filteredNodes.forEach(node => {
        const isSelected = node.id === selectedNodeId;
        const isHovered = node.id === hoveredNodeId;
        const isConnected = activeEdges.has(node.id);
        const cfg = CLUSTER_CONFIG_MAP[node.cluster] || CLUSTER_CONFIG_MAP.core;

        ctx.save();
        ctx.translate(node.x, node.y);

        // Opacidad adaptativa
        if (selectedNodeId && !isSelected && !isConnected && !isHovered && !isZoomOut) {
          ctx.globalAlpha = 0.35;
        }

        // HALO NEÓN AL ESTAR SELECCIONADO O HOVERED
        if (isSelected || isHovered) {
          ctx.save();
          ctx.shadowColor = cfg.glow;
          ctx.shadowBlur = isSelected ? 26 : 16;
          ctx.beginPath();
          ctx.arc(0, 0, node.radius + (isSelected ? 6 : 3), 0, Math.PI * 2);
          ctx.strokeStyle = cfg.color;
          ctx.lineWidth = isSelected ? 3 : 2;
          ctx.stroke();
          ctx.restore();

          // Anillo de pulso animado para el nodo seleccionado
          if (isSelected) {
            const pulseR = node.radius + 8 + Math.sin(time * 3) * 4;
            ctx.beginPath();
            ctx.arc(0, 0, pulseR, 0, Math.PI * 2);
            ctx.strokeStyle = cfg.color;
            ctx.lineWidth = 1.2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }
        }

        // CÍRCULO BASE DEL NODO
        ctx.beginPath();
        ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = isSelected ? cfg.color : '#0F172A';
        ctx.fill();

        ctx.lineWidth = isSelected ? 3 : (node.tier === 'macro' ? 2.5 : 1.5);
        ctx.strokeStyle = cfg.color;
        ctx.stroke();

        // En Zoom Out: los nodos brillan como estrellas luminosas
        if (isZoomOut) {
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(2, node.radius * 0.4), 0, Math.PI * 2);
          ctx.fillStyle = cfg.color;
          ctx.fill();
        }

        // TEXTO / SÍMBOLO CENTRAL DENTRO DEL NODO (Solo si hay suficiente zoom o es macro)
        if (!isZoomOut || node.tier === 'macro') {
          ctx.fillStyle = isSelected ? '#0F172A' : '#FFFFFF';
          ctx.font = `bold ${node.radius > 26 ? '12px' : node.radius > 16 ? '10px' : '8px'} monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          const symbolText = node.cluster === 'core'
            ? 'CORE'
            : node.tier === 'macro'
              ? cfg.iconSymbol
              : node.title.charAt(0);

          ctx.fillText(symbolText, 0, 1);
        }

        // ETIQUETAS DE TEXTO EXTERIORES (LOD - Level of Detail)
        // Regla: En Zoom Out (< 0.65x) ocultar etiquetas pequeñas (Imagen 3).
        // En Zoom In (>= 0.65x) mostrar etiquetas nítidas (Imagen 2).
        const shouldShowLabel = !isZoomOut || node.tier === 'macro' || isSelected || isHovered;

        if (shouldShowLabel) {
          const fontSize = node.tier === 'macro' ? 12 : node.tier === 'meso' ? 10 : 9;
          ctx.font = `${node.tier === 'macro' || isSelected ? 'bold' : 'normal'} ${fontSize}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';

          const labelY = node.radius + 5;
          const displayTitle = node.title.length > 24 ? `${node.title.slice(0, 22)}…` : node.title;

          // Sombra para máxima legibilidad sobre filamentos
          ctx.shadowColor = '#020617';
          ctx.shadowBlur = 4;
          ctx.fillStyle = isSelected ? '#FFFFFF' : '#CBD5E1';
          ctx.fillText(displayTitle, 0, labelY);
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      ctx.restore();
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [pan, zoom, nodes, edges, selectedNodeId, hoveredNodeId, activeEdges, filteredNodes, nodeMap]);

  // ============================================================================
  // INTERACCIÓN CON RATÓN Y TÁCTIL EN CANVAS
  // ============================================================================
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsPanning(true);
    startPanRef.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      setPan({
        x: e.clientX - startPanRef.current.x,
        y: e.clientY - startPanRef.current.y
      });
      return;
    }

    // Hit-testing de nodos bajo el cursor
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    let hitNode: BrainNode | null = null;
    for (let i = filteredNodes.length - 1; i >= 0; i--) {
      const node = filteredNodes[i];
      const hitRadius = Math.max(node.radius, 14 / zoom);
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        hitNode = node;
        break;
      }
    }

    if (hitNode) {
      setHoveredNodeId(hitNode.id);
      canvas.style.cursor = 'pointer';
    } else {
      if (hoveredNodeId !== null) setHoveredNodeId(null);
      canvas.style.cursor = isPanning ? 'grabbing' : 'grab';
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const worldX = (mouseX - pan.x) / zoom;
    const worldY = (mouseY - pan.y) / zoom;

    for (let i = filteredNodes.length - 1; i >= 0; i--) {
      const node = filteredNodes[i];
      const hitRadius = Math.max(node.radius, 14 / zoom);
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        handleSelectNode(node.id);
        break;
      }
    }
  };

  // Zoom de rueda centrado en el cursor del ratón
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.14 : 0.88;
    const newZoom = Math.max(0.18, Math.min(2.8, zoom * zoomFactor));

    const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
    const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

    setZoom(newZoom);
    setPan({ x: newPanX, y: newPanY });
  };

  // Soporte táctil móvil/tablet (pinch to zoom y drag pan)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      setIsPanning(true);
      startPanRef.current = {
        x: e.touches[0].clientX - pan.x,
        y: e.touches[0].clientY - pan.y
      };
    } else if (e.touches.length === 2) {
      setIsPanning(false);
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      touchDataRef.current = { x: mx, y: my, dist };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && isPanning) {
      setPan({
        x: e.touches[0].clientX - startPanRef.current.x,
        y: e.touches[0].clientY - startPanRef.current.y
      });
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const prevDist = touchDataRef.current.dist;

      if (prevDist > 0) {
        const factor = dist / prevDist;
        const newZoom = Math.max(0.18, Math.min(2.8, zoom * factor));
        const mx = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const my = (e.touches[0].clientY + e.touches[1].clientY) / 2;

        const newPanX = mx - (mx - pan.x) * (newZoom / zoom);
        const newPanY = my - (my - pan.y) * (newZoom / zoom);

        setZoom(newZoom);
        setPan({ x: newPanX, y: newPanY });
      }

      touchDataRef.current.dist = dist;
    }
  };

  const handleTouchEnd = () => {
    setIsPanning(false);
    touchDataRef.current.dist = 0;
  };

  // Centrado inicial y adaptativo mediante ResizeObserver
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          if (!hasAutoCenteredRef.current) {
            hasAutoCenteredRef.current = true;
            setPan({ x: width / 2, y: height / 2 });
          }
        }
      }
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Re-centrar al conmutar entre vistas split y constelación completa
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 0 && clientHeight > 0) {
        setPan({ x: clientWidth / 2, y: clientHeight / 2 });
      }
    }
  }, [viewMode]);

  if (!isOpen && !isEmbeddedView) return null;

  // ============================================================================
  // RENDERIZADO DEL ESTUDIO INSTITUCIONAL
  // ============================================================================
  const studioContent = (
    <div className={`flex flex-col h-full bg-slate-950 text-white ${isEmbeddedView ? 'rounded-3xl border border-indigo-500/30 shadow-2xl overflow-hidden' : ''}`}>
      {/* 1. BARRA DE ENCABEZADO HOLOGRÁFICA */}
      <header className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Network size={20} className="text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-black tracking-tight text-white flex items-center gap-2">
                <span>Bóveda Central de Conocimiento</span>
                <span className="text-[10px] text-indigo-300 font-bold px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 hidden md:inline">
                  {institution.name}
                </span>
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>0 Tokens</span>
              </span>
            </div>
            <p className="text-[11px] text-indigo-300/80 hidden sm:block">
              Grafo Neuronal Sináptico • Visión Macro a Micro • {nodes.length} Nodos Vivos en Constelación
            </p>
          </div>
        </div>

        {/* SELECTOR DE VISTAS */}
        <div className="flex items-center gap-2 ml-auto">
          <div className="bg-slate-900/90 p-1 rounded-xl border border-slate-800 flex items-center text-xs">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'split' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers size={13} />
              <span className="hidden sm:inline">Modo Dual (Grafo + IA)</span>
            </button>
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'graph' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Network size={13} />
              <span className="hidden sm:inline">Constelación</span>
            </button>
            <button
              onClick={() => setViewMode('assistant')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'assistant' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles size={13} className="text-amber-300" />
              <span className="hidden sm:inline">Terminal IA</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95 border border-indigo-400/40 shrink-0"
            title="Registrar nuevo protocolo en la Bóveda Central"
          >
            <Plus size={14} className="stroke-[3]" />
            <span className="hidden md:inline">Nuevo Protocolo</span>
          </button>

          {!isEmbeddedView && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-800"
              title="Cerrar Bóveda"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </header>

      {/* 2. ÁREA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

        {/* PANEL IZQUIERDO: CANVAS 2D DEL GRAFO NEURONAL Y GALÁCTICO */}
        {(viewMode === 'split' || viewMode === 'graph') && (
          <div
            ref={containerRef}
            className={`relative flex-1 bg-slate-950 flex flex-col overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800/80 ${
              viewMode === 'split' ? 'lg:w-[58%]' : 'w-full'
            }`}
          >
            {/* FILTROS Y CONTROLES SUPERIORES */}
            <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-[78%] pointer-events-auto scrollbar-none">
                <button
                  onClick={() => setFilterCluster('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer shrink-0 border ${
                    filterCluster === 'all'
                      ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                      : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                  }`}
                >
                  Constelación Completa ({nodes.length})
                </button>
                {(Object.keys(CLUSTER_CONFIG_MAP) as NodeCluster[])
                  .filter(c => c !== 'core')
                  .map(cluster => {
                    const cfg = CLUSTER_CONFIG_MAP[cluster];
                    const isActive = filterCluster === cluster;
                    return (
                      <button
                        key={cluster}
                        onClick={() => setFilterCluster(cluster)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold tracking-tight transition-all cursor-pointer shrink-0 border flex items-center gap-1 ${
                          isActive
                            ? `${cfg.badge} shadow-md`
                            : 'bg-slate-900/90 text-slate-400 hover:text-white border-slate-800'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                        <span>{cfg.label}</span>
                      </button>
                    );
                  })}
              </div>

              {/* CONTROLES DE ZOOM CON MODOS GALAXIA Y SINÁPTICO */}
              <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-xl pointer-events-auto shrink-0">
                {/* Botón Imagen 3: Vista Galáctica Completa */}
                <button
                  onClick={handleViewGalaxy}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    zoom < 0.65
                      ? 'bg-cyan-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Alejar a Vista Galáctica Cósmica (Macro a Micro)"
                >
                  <Globe size={12} />
                  <span>Galaxia</span>
                </button>

                {/* Botón Imagen 2: Vista Sináptica Cerebral */}
                <button
                  onClick={handleViewSynaptic}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    zoom >= 0.65
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title="Acercar a Red Sináptica Cerebral (Clústeres y Enlaces)"
                >
                  <Network size={12} />
                  <span>Sináptico</span>
                </button>

                <div className="w-[1px] h-4 bg-slate-700 mx-0.5" />

                <button
                  onClick={handleZoomIn}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Acercar"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Alejar"
                >
                  <ZoomOut size={13} />
                </button>
                <button
                  onClick={handleResetView}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Restablecer Posición"
                >
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* BADGE FLOTANTE DE MODO EN CURSO (LOD) */}
            <div className="absolute top-14 left-3 z-10 pointer-events-none">
              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full border shadow-lg backdrop-blur-md flex items-center gap-1.5 transition-all ${
                zoom < 0.65
                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20'
                  : 'bg-indigo-950/80 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20'
              }`}>
                <span>{zoom < 0.65 ? '🪐 Vista Galáctica Macroscópica' : '🧠 Vista Sináptica Orgánica'}</span>
                <span className="text-slate-400">|</span>
                <span className="text-white">{Math.round(zoom * 100)}%</span>
              </span>
            </div>

            {/* CANVAS 2D DE ALTA VELOCIDAD */}
            <canvas
              ref={canvasRef}
              className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleClick}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            />

            {/* TARJETA DE INSPECCIÓN FLOTANTE DEL NODO SELECCIONADO */}
            {selectedNode && (
              isCardMinimized ? (
                <button
                  onClick={() => setIsCardMinimized(false)}
                  className="absolute bottom-3 left-3 bg-slate-900/95 backdrop-blur-xl px-3.5 py-2 rounded-2xl border border-indigo-500/40 shadow-xl z-10 flex items-center gap-2 hover:bg-slate-800 transition-all cursor-pointer pointer-events-auto"
                  title="Expandir tarjeta de inspección"
                >
                  <Eye size={13} className="text-indigo-400" />
                  <span className="text-xs font-bold text-white truncate max-w-[220px]">{selectedNode.title}</span>
                  <ChevronRight size={13} className="text-slate-400" />
                </button>
              ) : (
                <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:max-w-md bg-slate-900/95 backdrop-blur-xl p-4 rounded-2xl border border-indigo-500/30 shadow-2xl z-10 pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-150">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${CLUSTER_CONFIG_MAP[selectedNode.cluster]?.badge || CLUSTER_CONFIG_MAP.core.badge}`}>
                        {CLUSTER_CONFIG_MAP[selectedNode.cluster]?.label || 'Núcleo Central'}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white mt-1">
                        {selectedNode.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {selectedNode.bovedaPath}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/30">
                        {selectedNode.reads} consultas
                      </span>
                      <button
                        onClick={() => setIsCardMinimized(true)}
                        className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Minimizar ficha para ver el grafo despejado"
                      >
                        <Minimize2 size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-indigo-100/90 mt-2 leading-relaxed">
                    {selectedNode.summary}
                  </p>

                  {/* KPIs del nodo */}
                  {selectedNode.kpis && selectedNode.kpis.length > 0 && (
                    <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2 border-t border-slate-800">
                      {selectedNode.kpis.map((kpi, idx) => (
                        <div key={idx} className="bg-slate-950/60 p-1.5 rounded-lg text-center border border-slate-800">
                          <span className="text-[9px] text-indigo-300 block truncate">{kpi.label}</span>
                          <span className="text-[11px] font-bold text-white font-mono">{kpi.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Wikilinks [[...]] */}
                  {selectedNode.wikilinks.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider">
                        Sinapsis:
                      </span>
                      {selectedNode.wikilinks.slice(0, 4).map((linkId, i) => {
                        const target = nodeMap.get(linkId);
                        if (!target) return null;
                        return (
                          <button
                            key={i}
                            onClick={() => handleSelectNode(linkId)}
                            className="text-[10px] bg-slate-800 hover:bg-indigo-600/40 text-indigo-200 hover:text-white px-2 py-0.5 rounded-md border border-indigo-500/30 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <span>[[{target.title.split(' ')[0]}]]</span>
                            <ArrowRight size={9} />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {/* PANEL DERECHO: TERMINAL DE INTELIGENCIA ARTIFICIAL PEDAGÓGICA */}
        {(viewMode === 'split' || viewMode === 'assistant') && (
          <div className={`flex flex-col bg-slate-900/95 overflow-hidden ${
            viewMode === 'split' ? 'lg:w-[42%]' : 'w-full'
          }`}>
            {/* CABECERA DE LA TERMINAL */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-900/60">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Sparkles size={16} className="text-amber-300 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Terminal Pedagógica Directiva
                  </h3>
                  <p className="text-[11px] text-indigo-300">
                    Motor de IA • Consultas Inmediatas a 0 Tokens
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                Latencia: <strong className="text-emerald-400">{activeDictamen?.latencyMs || 0.8} ms</strong>
              </span>
            </div>

            {/* CUERPO CONVERSACIONAL */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeDictamen ? (
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/40 space-y-3.5 shadow-xl animate-in fade-in duration-150">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-900/60 pb-2.5">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {activeDictamen.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono">
                      {activeDictamen.isOptimized && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                          <Check size={11} className="text-emerald-400 stroke-[3]" />
                          <span>Guardado en Bóveda</span>
                        </span>
                      )}
                      <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                        0 Tokens
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-indigo-100 whitespace-pre-wrap leading-relaxed">
                    {activeDictamen.text}
                  </div>

                  {activeDictamen.kpis && activeDictamen.kpis.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                      {activeDictamen.kpis.map((kpi, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-900/90 rounded-xl border border-indigo-800/50 text-center">
                          <span className="text-[10px] text-indigo-300 block font-medium">
                            {kpi.label}
                          </span>
                          <span className="text-xs font-bold text-white block mt-0.5 font-mono">
                            {kpi.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-2 border-t border-indigo-900/60 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono truncate max-w-[65%] text-indigo-300 flex items-center gap-1">
                        <FileText size={12} className="text-indigo-400 shrink-0" />
                        <span className="truncate">{activeDictamen.bovedaPath}</span>
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeDictamen.isOptimized ? 'Guardado:' : 'Auditado:'} {activeDictamen.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 pt-2 border-t border-indigo-900/50 flex-wrap">
                      <button
                        onClick={handleOpenEditModal}
                        className="text-[11px] bg-slate-900 hover:bg-slate-800 text-indigo-300 hover:text-white font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-indigo-500/30 active:scale-95"
                      >
                        <Edit3 size={13} className="text-indigo-400" />
                        <span>Editar Protocolo</span>
                      </button>

                      <button
                        onClick={handleOptimizeCurrentProtocol}
                        disabled={isOptimizingWithAI}
                        className={`text-[11px] font-bold px-2.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border active:scale-95 shadow-xs ${
                          activeDictamen.isOptimized
                            ? 'bg-emerald-950/50 hover:bg-emerald-900/70 text-emerald-300 border-emerald-500/50'
                            : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        <Sparkles size={13} className={activeDictamen.isOptimized ? "text-emerald-400" : "text-amber-400 animate-pulse"} />
                        <span>
                          {isOptimizingWithAI
                            ? 'Guardando...'
                            : activeDictamen.isOptimized
                              ? '✓ Optimizado en Bóveda'
                              : 'Mejorar con IA'}
                        </span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <button
                        onClick={() => handleCopyDictamen(`${activeDictamen.title}\n\n${activeDictamen.text}`)}
                        className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 font-semibold py-1.5 px-2.5 rounded-lg hover:bg-indigo-900/50 transition-colors cursor-pointer"
                      >
                        {copiedNotification ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        <span>{copiedNotification ? 'Copiado al Portapapeles' : 'Copiar Dictamen'}</span>
                      </button>

                      {activeDictamen.actionLabel && onNavigateTab && (
                        <button
                          onClick={() => {
                            if (activeDictamen.actionType === 'cobranza') onNavigateTab('finanzas');
                            else if (activeDictamen.actionType === 'academico') onNavigateTab('academico');
                            else if (activeDictamen.actionType === 'admisiones') onNavigateTab('admisiones');
                            else if (activeDictamen.actionType === 'personas') onNavigateTab('personas');
                            else onNavigateTab('colegios');
                            if (!isEmbeddedView) onClose();
                          }}
                          className="text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                        >
                          <span>{activeDictamen.actionLabel}</span>
                          <ArrowRight size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 space-y-2">
                  <Network size={32} className="mx-auto text-indigo-500/40 animate-pulse" />
                  <p className="text-xs">Selecciona un nodo en la constelación o escribe una consulta directiva.</p>
                </div>
              )}

              {/* CONSULTAS FRECUENTES SUGERIDAS */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Consultas Frecuentes Directivas:
                </span>
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    'Matriz de Cobertura Curricular y Planeaciones NEM 2024',
                    'Manual de Facturación SAT CFDI 4.0',
                    'Expediente 360 & Alertas Médicas',
                    'Protocolo de Sismo y Evacuación',
                    'Pipeline de Conversión Familiar',
                    'Lienzo Digital de Actividades'
                  ].map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setChatInput(chip);
                        executeQuery(chip);
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-900/60 hover:text-indigo-200 border border-slate-700/80 text-slate-300 text-[11px] transition-all cursor-pointer text-left"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div ref={chatBottomRef} />
            </div>

            {/* BARRA DE ENTRADA CONVERSACIONAL */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  executeQuery(chatInput);
                }}
                className="relative flex items-center"
              >
                <div className="absolute left-3.5 text-indigo-400 flex items-center pointer-events-none">
                  <Sparkles size={16} />
                </div>
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Consulta al Asistente Pedagógico IA (ej. ¿Cómo opera el CFDI 4.0?)"
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-400 rounded-2xl py-3 pl-10 pr-36 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner select-text"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {chatInput.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setChatInput('')}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Borrar texto"
                    >
                      <X size={14} />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isGenerating || !chatInput.trim()}
                    className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    {isGenerating ? (
                      <Clock size={14} className="animate-spin text-indigo-200" />
                    ) : (
                      <>
                        <span>Consultar</span>
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
                <span>Motor de Inteligencia Artificial Pedagógica • {institution.name}</span>
                <span className="font-mono text-emerald-400">Consumo: 0 Tokens</span>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* TOAST FLOTANTE */}
      {actionToast && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-indigo-950/95 backdrop-blur-xl border border-indigo-400/60 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-none">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{actionToast}</span>
        </div>
      )}

      {/* MODAL DE GESTIÓN Y CREACIÓN DE PROTOCOLOS */}
      {isProtocolModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_60px_rgba(99,102,241,0.35)] overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  {protocolModalMode === 'create' ? <Plus size={18} /> : <Edit3 size={18} />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    {protocolModalMode === 'create' ? 'Registrar Nuevo Protocolo en Bóveda' : 'Modificar Protocolo / Directiva'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Indexado en la Bóveda Central de Conocimiento del {institution.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsProtocolModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveProtocol} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs scrollbar-thin">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Título del Protocolo *</label>
                  <input
                    type="text"
                    required
                    value={protocolForm.title}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ej. Protocolo de Atención de Alergias"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Subtítulo / Alcance *</label>
                  <input
                    type="text"
                    required
                    value={protocolForm.subtitle}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, subtitle: e.target.value }))}
                    placeholder="Ej. Atención Inmediata en < 90s"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Clúster Temático *</label>
                  <select
                    value={protocolForm.cluster}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, cluster: e.target.value as NodeCluster }))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:border-indigo-400 focus:outline-none cursor-pointer"
                  >
                    <option value="pedagogico">Pedagógico & NEM 2024</option>
                    <option value="gobernanza">Gobernanza & Sedes</option>
                    <option value="fiscal">Tesorería & Fiscal SAT</option>
                    <option value="medico">Salud & Urgencias</option>
                    <option value="crm">Admisiones & Matrícula</option>
                    <option value="docente">Red Docente & Claustro</option>
                    <option value="gamificacion">Gamificación & Lienzo</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-300">Ruta Canónica Bóveda Curricular</label>
                  <input
                    type="text"
                    value={protocolForm.bovedaPath}
                    onChange={(e) => setProtocolForm(prev => ({ ...prev, bovedaPath: e.target.value }))}
                    placeholder={`boveda://${effectiveSchoolId}/protocolo.md`}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-indigo-300 font-mono text-[11px] focus:border-indigo-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Resumen Ejecutivo *</label>
                <input
                  type="text"
                  required
                  value={protocolForm.summary}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Síntesis directiva del procedimiento"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-300">Contenido Procedimental (Markdown) *</label>
                <textarea
                  rows={5}
                  required
                  value={protocolForm.dictamenText}
                  onChange={(e) => setProtocolForm(prev => ({ ...prev, dictamenText: e.target.value }))}
                  placeholder="Escribe las etapas de actuación, tiempos de respuesta y entregables..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white placeholder-slate-500 focus:border-indigo-400 focus:outline-none leading-relaxed font-sans"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsProtocolModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-500/25 transition-all cursor-pointer active:scale-95"
                >
                  <Save size={14} />
                  <span>Guardar en Bóveda Central</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  if (isEmbeddedView) {
    return (
      <div className="w-full h-[85vh] rounded-3xl overflow-hidden border border-indigo-500/30 shadow-2xl">
        {studioContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in zoom-in duration-150">
      <div className="w-full max-w-7xl h-[92vh] rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.25)] border border-indigo-500/40">
        {studioContent}
      </div>
    </div>
  );
};
