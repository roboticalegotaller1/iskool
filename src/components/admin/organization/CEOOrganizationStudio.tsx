"use client";

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  ChevronDown,
  ChevronRight,
  GitBranch,
  Settings,
  Trash2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CalendarClock,
  DollarSign,
  ShieldCheck,
  Mail,
  Link2,
  UserCheck,
  Sparkles,
  BellRing,
  ArrowUpRight,
  Users,
  Plus,
} from 'lucide-react';
import {
  ORG_PALETTE_GROUPS,
  OrgNodeSubRole,
  getFullNameOfNode,
  normalizeOrgSchoolId,
} from '@/lib/services/organizationService';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { NodeConfigureModal } from './NodeConfigureModal';
import { SchoolTimetableBuilder } from './SchoolTimetableBuilder';

interface CampusOption {
  id: string;
  name: string;
}

interface CEOOrganizationStudioProps {
  schoolId: string;
  schoolName: string;
  campuses: CampusOption[];
  onTriggerToast?: (msg: string) => void;
  onNavigateToModule?: (moduleId: string) => void;
}

const NODE_CARD_W = 256;
const NODE_CARD_H = 136;

export function CEOOrganizationStudio({
  schoolId,
  schoolName,
  campuses,
  onTriggerToast,
  onNavigateToModule,
}: CEOOrganizationStudioProps) {
  const effectiveSchoolId = useMemo(() => normalizeOrgSchoolId(schoolId), [schoolId]);
  const graph = useOrganizationStore((s) => s.graphsBySchool[effectiveSchoolId]) ||
    useOrganizationStore.getState().getGraph(effectiveSchoolId);

  const hydrateFromServer = useOrganizationStore((s) => s.hydrateFromServer);
  const addSeatNode = useOrganizationStore((s) => s.addSeatNode);
  const moveSeatNode = useOrganizationStore((s) => s.moveSeatNode);
  const deleteSeatNode = useOrganizationStore((s) => s.deleteSeatNode);
  const connectNodes = useOrganizationStore((s) => s.connectNodes);
  const removeEdge = useOrganizationStore((s) => s.removeEdge);
  const autoOrganize = useOrganizationStore((s) => s.autoOrganize);
  const saveAndProvisionNode = useOrganizationStore((s) => s.saveAndProvisionNode);
  const recoverNodePassword = useOrganizationStore((s) => s.recoverNodePassword);
  const configureCampusSchedule = useOrganizationStore((s) => s.configureCampusSchedule);
  const setActiveTimetableCampus = useOrganizationStore((s) => s.setActiveTimetableCampus);
  const placeSubjectBlockInTimetable = useOrganizationStore((s) => s.placeSubjectBlockInTimetable);
  const removeTimetablePlacement = useOrganizationStore((s) => s.removeTimetablePlacement);
  const dispatchHierarchicalSlaAlert = useOrganizationStore((s) => s.dispatchHierarchicalSlaAlert);
  const getPayrollSummary = useOrganizationStore((s) => s.getPayrollSummary);
  const getDynamicSlaDelegates = useOrganizationStore((s) => s.getDynamicSlaDelegates);

  useEffect(() => {
    hydrateFromServer(effectiveSchoolId);
  }, [effectiveSchoolId, hydrateFromServer]);

  const normalizedCampuses = useMemo<CampusOption[]>(() => {
    if (campuses && campuses.length > 0) return campuses;
    if (effectiveSchoolId === 'sch-test-case') {
      return [
        { id: 'cmp-test-pri', name: 'Primaria Laboratorio Demo' },
        { id: 'cmp-test-sec', name: 'Secundaria Laboratorio Demo' },
        { id: 'cmp-test-prep', name: 'Preparatoria Laboratorio Demo' },
      ];
    }
    return [
      { id: `cmp-${effectiveSchoolId}-1`, name: `Plantel Central · ${schoolName}` },
    ];
  }, [campuses, effectiveSchoolId, schoolName]);

  const [activeTopTab, setActiveTopTab] = useState<'organigrama' | 'horario' | 'lazos'>('organigrama');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    administracion: true,
    intendencia_servicios: false,
  });

  const [configuringNodeId, setConfiguringNodeId] = useState<string | null>(null);
  const [forcePromptCampusId, setForcePromptCampusId] = useState<string | null>(null);

  // Estado del Lienzo Interactivo (Zoom, Pan, Drag de Nodos y Conexión Jerárquica)
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggingNodeState, setDraggingNodeState] = useState<{
    nodeId: string;
    startClientX: number;
    startClientY: number;
    originX: number;
    originY: number;
  } | null>(null);
  const [isPanningCanvas, setIsPanningCanvas] = useState<{
    startClientX: number;
    startClientY: number;
    originPanX: number;
    originPanY: number;
  } | null>(null);

  const [connectingFromNodeId, setConnectingFromNodeId] = useState<string | null>(null);
  const [pointerCanvasPos, setPointerCanvasPos] = useState<{ x: number; y: number } | null>(null);
  const [minimapCollapsed, setMinimapCollapsed] = useState(false);

  const payrollSummary = useMemo(
    () => getPayrollSummary(effectiveSchoolId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, effectiveSchoolId]
  );

  const dynamicSlaDelegates = useMemo(
    () => getDynamicSlaDelegates(effectiveSchoolId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [graph, effectiveSchoolId]
  );

  const hasCreatedSchedule =
    Object.keys(graph.campusSchedules || {}).length > 0 ||
    (graph.timetablePlacements || []).length > 0;

  // Manejo fluido de arrastre de nodos y paneo del lienzo
  useEffect(() => {
    if (!draggingNodeState && !isPanningCanvas && !connectingFromNodeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNodeState) {
        const dx = (e.clientX - draggingNodeState.startClientX) / zoom;
        const dy = (e.clientY - draggingNodeState.startClientY) / zoom;
        moveSeatNode(
          effectiveSchoolId,
          draggingNodeState.nodeId,
          Math.max(16, draggingNodeState.originX + dx),
          Math.max(16, draggingNodeState.originY + dy)
        );
      } else if (isPanningCanvas) {
        const dx = e.clientX - isPanningCanvas.startClientX;
        const dy = e.clientY - isPanningCanvas.startClientY;
        setPan({
          x: isPanningCanvas.originPanX + dx,
          y: isPanningCanvas.originPanY + dy,
        });
      } else if (connectingFromNodeId && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setPointerCanvasPos({
          x: (e.clientX - rect.left - pan.x) / zoom,
          y: (e.clientY - rect.top - pan.y) / zoom,
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingNodeState(null);
      setIsPanningCanvas(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [
    draggingNodeState,
    isPanningCanvas,
    connectingFromNodeId,
    zoom,
    pan,
    effectiveSchoolId,
    moveSeatNode,
  ]);

  const handleAddRoleBlock = (subRole: OrgNodeSubRole, dropX?: number, dropY?: number) => {
    const defaultCampus = normalizedCampuses[0];
    const created = addSeatNode({
      schoolId: effectiveSchoolId,
      campusId: defaultCampus.id,
      campusName: defaultCampus.name,
      subRole,
      x: dropX,
      y: dropY,
    });
    onTriggerToast?.(`✓ Bloque "${created.roleTitle}" añadido al lienzo. Haz clic en Configurar para asignar colaborador.`);
  };

  const handleCompleteConnection = (targetNodeId: string) => {
    if (!connectingFromNodeId) return;
    if (connectingFromNodeId === targetNodeId) {
      setConnectingFromNodeId(null);
      setPointerCanvasPos(null);
      return;
    }
    const res = connectNodes(effectiveSchoolId, connectingFromNodeId, targetNodeId);
    if (!res.success && res.error) {
      onTriggerToast?.(`⚠️ ${res.error}`);
    } else {
      onTriggerToast?.('✓ Línea jerárquica vinculada en el organigrama');
    }
    setConnectingFromNodeId(null);
    setPointerCanvasPos(null);
  };

  const handleFitCanvas = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleAutoOrganize = () => {
    autoOrganize(effectiveSchoolId);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onTriggerToast?.('✓ Organigrama auto-organizado jerárquicamente sin traslapes');
  };

  // Curva estética ortogonal suavizada (estilo Apple/Workday/Studio) entre nodo superior y subordinado
  const buildAestheticHierarchyPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string => {
    const midY = y1 + (y2 - y1) * 0.5;
    if (Math.abs(x1 - x2) < 4) {
      return `M ${x1} ${y1} L ${x2} ${y2}`;
    }
    const radius = Math.min(16, Math.abs(x2 - x1) / 2, Math.abs(midY - y1));
    if (y2 > y1 + 24) {
      const dirX = x2 > x1 ? 1 : -1;
      return [
        `M ${x1} ${y1}`,
        `L ${x1} ${midY - radius}`,
        `Q ${x1} ${midY} ${x1 + dirX * radius} ${midY}`,
        `L ${x2 - dirX * radius} ${midY}`,
        `Q ${x2} ${midY} ${x2} ${midY + radius}`,
        `L ${x2} ${y2}`,
      ].join(' ');
    }
    return `M ${x1} ${y1} C ${x1} ${y1 + 60}, ${x2} ${y2 - 60}, ${x2} ${y2}`;
  };

  const configuringNode = useMemo(
    () => graph.nodes.find((n) => n.nodeId === configuringNodeId) || null,
    [graph.nodes, configuringNodeId]
  );

  const configuringNodeWeeklyHours = useMemo(() => {
    if (!configuringNode || configuringNode.category !== 'profesor') return 0;
    const row = payrollSummary.rows.find((r) => r.nodeId === configuringNode.nodeId);
    return row?.weeklyHours || 0;
  }, [configuringNode, payrollSummary.rows]);

  // Dimensiones del mundo para el 2D Radar Minimap
  const worldBounds = useMemo(() => {
    if (graph.nodes.length === 0) {
      return { maxX: 1200, maxY: 720 };
    }
    const maxX = Math.max(1200, ...graph.nodes.map((n) => n.x + NODE_CARD_W + 120));
    const maxY = Math.max(720, ...graph.nodes.map((n) => n.y + NODE_CARD_H + 120));
    return { maxX, maxY };
  }, [graph.nodes]);

  return (
    <div data-testid="ceo-organization-studio" className="space-y-4 select-none">
      {/* Cabecera Minimalista con Pestañas Superiores Estilo Imagen 3 (Organigrama | Horario | Nómina & SLA) */}
      <div className="bg-white rounded-2xl border border-slate-200 px-5 pt-4 pb-0 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                5. Organización · {schoolName}
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                {graph.nodes.filter((n) => n.isProvisioned).length} cuentas activas ·{' '}
                ${payrollSummary.totalMonthlyPayrollMxn.toLocaleString('es-MX')} MXN/mes recurrente
              </span>
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">
              Arquitectura Organizacional, Cuentas &amp; Horario Escolar
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {activeTopTab === 'organigrama' && (
              <button
                type="button"
                data-testid="org-top-auto-organize-btn"
                onClick={handleAutoOrganize}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <GitBranch className="h-3.5 w-3.5" />
                <span>Auto-organizar Nodos</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Pestañas Superiores (Inspirada en Imagen 3 + Estética Modo Claro) */}
        <div className="flex items-center gap-1 border-t border-slate-100 pt-2 overflow-x-auto">
          <button
            type="button"
            data-testid="org-tab-organigrama"
            onClick={() => setActiveTopTab('organigrama')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTopTab === 'organigrama'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <GitBranch className="h-3.5 w-3.5" />
            <span>Constructor de Organigrama</span>
            <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] text-slate-700">
              {graph.nodes.length}
            </span>
          </button>

          {/* Pestaña Superior de Horario Escolar (Visible siempre que exista horario o profesores, o para acceso directo) */}
          <button
            type="button"
            data-testid="org-tab-horario"
            onClick={() => setActiveTopTab('horario')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTopTab === 'horario'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <CalendarClock className="h-3.5 w-3.5" />
            <span>Horario</span>
            {hasCreatedSchedule && (
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                Activo · {graph.timetablePlacements.length} bloques
              </span>
            )}
          </button>

          <button
            type="button"
            data-testid="org-tab-lazos"
            onClick={() => setActiveTopTab('lazos')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-black flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTopTab === 'lazos'
                ? 'border-blue-600 text-blue-700 bg-blue-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" />
            <span>Enlace Finanzas Recurrente &amp; Tiempo de respuesta</span>
          </button>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* PESTAÑA 1: CONSTRUCTOR DE ORGANIGRAMA (ESTILO STUDIO + 2D MINIMAP)     */}
      {/* ===================================================================== */}
      {activeTopTab === 'organigrama' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Paleta Izquierda de Agrupaciones de Bloques (1 a 4) */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Bloques Organizacionales
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Arrastra al lienzo o haz 1 clic para insertar el cargo.
                </p>
              </div>

              <div className="space-y-2">
                {ORG_PALETTE_GROUPS.map((group) => {
                  const isExpanded = Boolean(expandedGroups[group.category]);

                  if (!group.expandable) {
                    const singleItem = group.items[0];
                    return (
                      <div
                        key={group.category}
                        data-testid={`palette-block-${singleItem.subRole}`}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData('application/iskool-org-subrole', singleItem.subRole);
                        }}
                        onClick={() => handleAddRoleBlock(singleItem.subRole)}
                        className="p-3 rounded-xl bg-slate-50/80 hover:bg-blue-50/70 border border-slate-200 hover:border-blue-300 transition-all cursor-grab active:cursor-grabbing flex items-center justify-between gap-2 group"
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900">
                            {group.numberLabel} {group.title}
                          </div>
                          <div className="text-[10px] text-slate-500">{group.subtitle}</div>
                        </div>
                        <span className="h-6 w-6 rounded-lg bg-white border border-slate-200 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Plus className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={group.category}
                      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                    >
                      <button
                        type="button"
                        data-testid={`palette-group-toggle-${group.category}`}
                        onClick={() =>
                          setExpandedGroups((prev) => ({
                            ...prev,
                            [group.category]: !prev[group.category],
                          }))
                        }
                        className="w-full p-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer"
                      >
                        <div>
                          <div className="text-xs font-black text-slate-900">
                            {group.numberLabel} {group.title}
                          </div>
                          <div className="text-[10px] text-slate-500">{group.subtitle}</div>
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="p-2 space-y-1.5 bg-white border-t border-slate-100">
                          {group.items.map((item) => (
                            <div
                              key={item.subRole}
                              data-testid={`palette-block-${item.subRole}`}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData(
                                  'application/iskool-org-subrole',
                                  item.subRole
                                );
                              }}
                              onClick={() => handleAddRoleBlock(item.subRole)}
                              className="px-3 py-2 rounded-lg bg-white hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-xs font-bold text-slate-800 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing transition-all"
                            >
                              <span>• {item.label}</span>
                              <span className="text-[10px] text-blue-600 font-semibold">+ Lienzo</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Guía Ultra-Breve Cero Curva de Aprendizaje */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>Flujo Ágil en 3 Pasos</span>
              </div>
              <p>1. Arrastra o haz clic en un cargo para ponerlo en el lienzo.</p>
              <p>2. Une cargos con el botón <strong>Conectar</strong> para trazar jerarquía.</p>
              <p>3. Pulsa <strong>Configurar</strong>; al cerrar se crea la cuenta automáticamente.</p>
            </div>
          </div>

          {/* Lienzo Interactivo Modo Claro con Líneas Estéticas + 2D Radar Minimap */}
          <div
            ref={canvasRef}
            data-testid="org-interactive-canvas"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const subRole = e.dataTransfer.getData(
                'application/iskool-org-subrole'
              ) as OrgNodeSubRole;
              if (!subRole || !canvasRef.current) return;
              const rect = canvasRef.current.getBoundingClientRect();
              const dropX = Math.max(24, (e.clientX - rect.left - pan.x) / zoom - NODE_CARD_W / 2);
              const dropY = Math.max(24, (e.clientY - rect.top - pan.y) / zoom - 40);
              handleAddRoleBlock(subRole, dropX, dropY);
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                if (connectingFromNodeId) {
                  setConnectingFromNodeId(null);
                  setPointerCanvasPos(null);
                } else {
                  setIsPanningCanvas({
                    startClientX: e.clientX,
                    startClientY: e.clientY,
                    originPanX: pan.x,
                    originPanY: pan.y,
                  });
                }
              }
            }}
            style={{
              backgroundImage: 'radial-gradient(#cbd5e1 1.25px, transparent 1.25px)',
              backgroundSize: '20px 20px',
            }}
            className="lg:col-span-9 relative h-[640px] rounded-2xl bg-[#F8FAFC] border border-slate-200 shadow-inner overflow-hidden"
          >
            {/* Banner de Modo Conexión Activo */}
            {connectingFromNodeId && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg flex items-center gap-2">
                <Link2 className="h-3.5 w-3.5" />
                <span>Selecciona el bloque subordinado para trazar la línea jerárquica</span>
                <button
                  type="button"
                  onClick={() => {
                    setConnectingFromNodeId(null);
                    setPointerCanvasPos(null);
                  }}
                  className="ml-1 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-[10px] cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}

            {/* Estado Vacío Elegante */}
            {graph.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none p-6">
                <div className="max-w-md text-center bg-white/90 backdrop-blur-xs p-6 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="h-11 w-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                    <GitBranch className="h-5 w-5" />
                  </div>
                  <h4 className="text-sm font-black text-slate-900">
                    Lienzo de Organigrama Listo
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Arrastra o haz clic en <strong>1) Administración</strong>, <strong>2) Profesor</strong>,{' '}
                    <strong>3) Intendencia y servicios</strong> o <strong>4) Otros</strong> en el panel izquierdo para comenzar a diseñar la estructura de la compañía.
                  </p>
                </div>
              </div>
            )}

            {/* Capa Transformable (Zoom + Pan) */}
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: '0 0',
              }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Capa SVG de Líneas Jerárquicas Estéticas */}
              <svg
                width={worldBounds.maxX}
                height={worldBounds.maxY}
                className="absolute top-0 left-0 overflow-visible pointer-events-none"
              >
                <defs>
                  <marker
                    id="org-arrow-head"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 8 5 L 0 9 z" fill="#2563EB" />
                  </marker>
                </defs>

                {graph.edges.map((edge) => {
                  const source = graph.nodes.find((n) => n.nodeId === edge.sourceNodeId);
                  const target = graph.nodes.find((n) => n.nodeId === edge.targetNodeId);
                  if (!source || !target) return null;

                  const x1 = source.x + NODE_CARD_W / 2;
                  const y1 = source.y + NODE_CARD_H;
                  const x2 = target.x + NODE_CARD_W / 2;
                  const y2 = target.y;
                  const pathD = buildAestheticHierarchyPath(x1, y1, x2, y2);
                  const midX = (x1 + x2) / 2;
                  const midY = (y1 + y2) / 2;

                  return (
                    <g key={edge.id} className="pointer-events-auto group">
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth={2.2}
                        markerEnd="url(#org-arrow-head)"
                        className="transition-all"
                      />
                      <g
                        onClick={(e) => {
                          e.stopPropagation();
                          removeEdge(effectiveSchoolId, edge.id);
                        }}
                        className="cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <circle
                          cx={midX}
                          cy={midY}
                          r={10}
                          fill="#FFFFFF"
                          stroke="#CBD5E1"
                          strokeWidth={1.5}
                        />
                        <text
                          x={midX}
                          y={midY + 3.5}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill="#E11D48"
                        >
                          ✕
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Línea Guía en Vivo durante Conexión */}
                {connectingFromNodeId && pointerCanvasPos && (() => {
                  const src = graph.nodes.find((n) => n.nodeId === connectingFromNodeId);
                  if (!src) return null;
                  const x1 = src.x + NODE_CARD_W / 2;
                  const y1 = src.y + NODE_CARD_H;
                  const d = buildAestheticHierarchyPath(
                    x1,
                    y1,
                    pointerCanvasPos.x,
                    pointerCanvasPos.y
                  );
                  return (
                    <path
                      d={d}
                      fill="none"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  );
                })()}
              </svg>

              {/* Tarjetas de Nodos del Organigrama */}
              {graph.nodes.map((node) => {
                const occupantName =
                  node.firstName.trim() || node.paternalLastName.trim()
                    ? getFullNameOfNode(node)
                    : 'Sin colaborador asignado';
                const isConnectingSource = connectingFromNodeId === node.nodeId;
                const isEligibleTarget =
                  Boolean(connectingFromNodeId) && connectingFromNodeId !== node.nodeId;

                const categoryAccent =
                  node.category === 'administracion'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : node.category === 'profesor'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : node.category === 'intendencia_servicios'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <div
                    key={node.nodeId}
                    data-testid={`org-canvas-node-${node.subRole}`}
                    style={{
                      left: node.x,
                      top: node.y,
                      width: NODE_CARD_W,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isEligibleTarget) {
                        handleCompleteConnection(node.nodeId);
                      }
                    }}
                    className={`absolute pointer-events-auto rounded-2xl bg-white border shadow-sm transition-shadow p-3.5 flex flex-col justify-between gap-2.5 ${
                      isConnectingSource
                        ? 'border-blue-600 ring-2 ring-blue-500/30'
                        : isEligibleTarget
                        ? 'border-blue-400 hover:border-blue-600 hover:shadow-md cursor-pointer'
                        : 'border-slate-200/95 hover:border-slate-300 hover:shadow-md'
                    }`}
                  >
                    {/* Puerto Superior Receptor */}
                    <div
                      onMouseUp={(e) => {
                        e.stopPropagation();
                        if (isEligibleTarget) {
                          handleCompleteConnection(node.nodeId);
                        }
                      }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white border-2 border-blue-500 shadow-2xs"
                      title="Puerto receptor de línea jerárquica superior"
                    />

                    {/* Cabecera Arrastrable */}
                    <div
                      onMouseDown={(e) => {
                        if (connectingFromNodeId) return;
                        e.stopPropagation();
                        setDraggingNodeState({
                          nodeId: node.nodeId,
                          startClientX: e.clientX,
                          startClientY: e.clientY,
                          originX: node.x,
                          originY: node.y,
                        });
                      }}
                      className="cursor-grab active:cursor-grabbing space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-black border truncate ${categoryAccent}`}
                        >
                          {node.roleTitle}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {node.isProvisioned && (
                            <span
                              className="h-2 w-2 rounded-full bg-emerald-500"
                              title="Cuenta activa y reportada en Superusuario"
                            />
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSeatNode(effectiveSchoolId, node.nodeId);
                            }}
                            className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Eliminar bloque del lienzo"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-black text-slate-900 truncate">
                          {occupantName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 truncate">
                          {node.username}
                        </div>
                      </div>

                      {/* Chips de Materias o Estado iMail */}
                      {node.category === 'profesor' &&
                      node.subjects.some((s) => s.subjectName.trim()) ? (
                        <div className="flex flex-wrap gap-1 pt-0.5">
                          {node.subjects
                            .filter((s) => s.subjectName.trim())
                            .slice(0, 3)
                            .map((s) => (
                              <span
                                key={s.id}
                                style={{ borderColor: s.contourColor }}
                                className="px-1.5 py-0.5 rounded border text-[9px] font-bold text-slate-700 bg-slate-50 truncate max-w-[105px]"
                              >
                                {s.subjectName}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>
                            {node.permissions.imail_triage
                              ? 'iMail activo'
                              : 'Sync pausado · Archivo CEO'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Acciones del Bloque: Configurar + Conectar Línea Jerárquica */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5">
                      <button
                        type="button"
                        data-testid={`org-configure-node-btn-${node.subRole}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfiguringNodeId(node.nodeId);
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Settings className="h-3 w-3" />
                        <span>Configurar</span>
                      </button>

                      <button
                        type="button"
                        data-testid={`org-connect-from-btn-${node.subRole}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setConnectingFromNodeId((prev) =>
                            prev === node.nodeId ? null : node.nodeId
                          );
                        }}
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                          isConnectingSource
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200'
                        }`}
                        title="Trazar línea jerárquica hacia un subordinado"
                      >
                        <Link2 className="h-3 w-3" />
                        <span>Línea</span>
                      </button>
                    </div>

                    {/* Puerto Inferior Emisor */}
                    <div
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        setConnectingFromNodeId(node.nodeId);
                      }}
                      className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-blue-600 border-2 border-white shadow-2xs cursor-crosshair"
                      title="Arrastra o haz clic para conectar subordinado"
                    />
                  </div>
                );
              })}
            </div>

            {/* Barra Inferior Izquierda de Zoom & Auto-Organizar (Idéntica al Modelo de Studio Imagen 2) */}
            <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-xs rounded-xl border border-slate-200 shadow-sm px-2.5 py-1.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.1) * 10) / 10))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Alejar"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono font-bold text-slate-700 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(1.6, Math.round((z + 0.1) * 10) / 10))}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 cursor-pointer"
                title="Acercar"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <div className="h-4 w-px bg-slate-200 mx-0.5" />
              <button
                type="button"
                onClick={handleFitCanvas}
                className="px-2 py-1 rounded-lg hover:bg-slate-100 text-[11px] font-bold text-slate-700 flex items-center gap-1 cursor-pointer"
              >
                <Maximize2 className="h-3 w-3" />
                <span>Ajustar</span>
              </button>
              <button
                type="button"
                data-testid="org-toolbar-auto-organize-btn"
                onClick={handleAutoOrganize}
                className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-[11px] font-bold text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <GitBranch className="h-3 w-3" />
                <span>Organizar</span>
              </button>
            </div>

            {/* 2D RADAR MINIMAP OBLIGATORIO (Esquina Inferior Derecha - Modelo Studio Imagen 2) */}
            <div
              data-testid="org-2d-radar-minimap"
              className="absolute bottom-14 right-4 z-20 bg-white/95 backdrop-blur-xs rounded-2xl border border-slate-200 shadow-md p-2.5 w-52"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>2D RADAR MINIMAP</span>
                </span>
                <button
                  type="button"
                  onClick={() => setMinimapCollapsed((c) => !c)}
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-700 px-1 cursor-pointer"
                >
                  {minimapCollapsed ? '+' : '−'}
                </button>
              </div>

              {!minimapCollapsed && (
                <svg
                  viewBox={`0 0 ${worldBounds.maxX} ${worldBounds.maxY}`}
                  onClick={(e) => {
                    if (!canvasRef.current) return;
                    const svgRect = e.currentTarget.getBoundingClientRect();
                    const relX = (e.clientX - svgRect.left) / svgRect.width;
                    const relY = (e.clientY - svgRect.top) / svgRect.height;
                    const targetWorldX = relX * worldBounds.maxX;
                    const targetWorldY = relY * worldBounds.maxY;
                    const viewRect = canvasRef.current.getBoundingClientRect();
                    setPan({
                      x: viewRect.width / 2 - targetWorldX * zoom,
                      y: viewRect.height / 2 - targetWorldY * zoom,
                    });
                  }}
                  className="w-full h-28 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer"
                >
                  {/* Líneas en el Minimapa */}
                  {graph.edges.map((edge) => {
                    const s = graph.nodes.find((n) => n.nodeId === edge.sourceNodeId);
                    const t = graph.nodes.find((n) => n.nodeId === edge.targetNodeId);
                    if (!s || !t) return null;
                    return (
                      <line
                        key={edge.id}
                        x1={s.x + NODE_CARD_W / 2}
                        y1={s.y + NODE_CARD_H}
                        x2={t.x + NODE_CARD_W / 2}
                        y2={t.y}
                        stroke="#3B82F6"
                        strokeWidth={14}
                      />
                    );
                  })}

                  {/* Nodos en el Minimapa */}
                  {graph.nodes.map((n) => (
                    <rect
                      key={n.nodeId}
                      x={n.x}
                      y={n.y}
                      width={NODE_CARD_W}
                      height={NODE_CARD_H}
                      rx={20}
                      fill={
                        n.category === 'profesor'
                          ? '#10B981'
                          : n.category === 'administracion'
                          ? '#2563EB'
                          : '#F59E0B'
                      }
                      fillOpacity={0.85}
                    />
                  ))}

                  {/* Ventana de Visión Actual */}
                  <rect
                    x={Math.max(0, -pan.x / zoom)}
                    y={Math.max(0, -pan.y / zoom)}
                    width={920 / zoom}
                    height={620 / zoom}
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth={12}
                    strokeDasharray="28 18"
                    rx={16}
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 2: HORARIO ESCOLAR SEMANAL POR BLOQUES                        */}
      {/* ===================================================================== */}
      {activeTopTab === 'horario' && (
        <SchoolTimetableBuilder
          graph={graph}
          campuses={normalizedCampuses}
          forcePromptConditionsForCampusId={forcePromptCampusId}
          onClearForcePrompt={() => setForcePromptCampusId(null)}
          onSaveCampusConditions={(cfg) => {
            configureCampusSchedule(effectiveSchoolId, cfg);
            onTriggerToast?.(
              `✓ Horario configurado para ${cfg.campusName} (${cfg.blockDurationMinutes} min · ${
                cfg.workDays === 'lun_sab' ? 'Lunes a Sábado' : 'Lunes a Viernes'
              })`
            );
          }}
          onSelectActiveCampus={(campusId) =>
            setActiveTimetableCampus(effectiveSchoolId, campusId)
          }
          onPlaceBlock={(params) =>
            placeSubjectBlockInTimetable({
              schoolId: effectiveSchoolId,
              ...params,
            })
          }
          onRemovePlacement={(placementId) =>
            removeTimetablePlacement(effectiveSchoolId, placementId)
          }
        />
      )}

      {/* ===================================================================== */}
      {/* PESTAÑA 3: ENLACE RECURRENTE A FINANZAS + MATRIZ DINÁMICA DE SLA       */}
      {/* ===================================================================== */}
      {activeTopTab === 'lazos' && (
        <div
          data-testid="org-finance-and-sla-links-view"
          className="grid grid-cols-1 xl:grid-cols-12 gap-4"
        >
          {/* Mitad Izquierda: Nómina Recurrente Consolidada (1 Solo Profesor aunque tenga varias materias) */}
          <div className="xl:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <span>Enlace Automático con Gastos Recurrentes en Finanzas</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  El conteo de horas de cada Profesor suma todas sus materias consolidadas como un solo docente.
                </p>
              </div>
              {onNavigateToModule && (
                <button
                  type="button"
                  onClick={() => onNavigateToModule('finanzas')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Ver en 4. Finanzas</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {payrollSummary.rows.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Aún no hay cuentas configuradas en el organigrama.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
                    <tr>
                      <th className="py-2.5 px-3">Colaborador Único</th>
                      <th className="py-2.5 px-3">Cargo / Materias</th>
                      <th className="py-2.5 px-3 text-right">Horas Totales</th>
                      <th className="py-2.5 px-3 text-right">Recurrente Mensual</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {payrollSummary.rows.map((row) => (
                      <tr key={row.nodeId}>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900">{row.fullName}</div>
                          <div className="text-[10px] font-mono text-slate-500">
                            {row.username}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-700">{row.roleTitle}</span>
                          {row.subjectNames.length > 0 && (
                            <span className="block text-[10px] text-blue-600">
                              {row.subjectNames.length} materia(s): {row.subjectNames.join(', ')}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                          {row.weeklyHours}h/sem ({row.monthlyHours}h/mes)
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-emerald-700">
                          ${row.monthlyRecurringTotalMxn.toLocaleString('es-MX')} MXN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Mitad Derecha: Matriz de Delegados SLA Generada (Cuentas por Default Eliminadas) */}
          <div className="xl:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-600" />
                  <span>Matriz de Delegados por Tiempo de respuesta</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Cuentas teóricas por default eliminadas: únicamente aparecen las cuentas generadas.
                </p>
              </div>
              {onNavigateToModule && (
                <button
                  type="button"
                  onClick={() => onNavigateToModule('imail_triage')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Ir a 7. iMail</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {dynamicSlaDelegates.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                Al configurar cuentas en el organigrama, aparecerán automáticamente aquí como únicos delegados con Tiempo de respuesta.
              </div>
            ) : (
              <div className="space-y-2.5">
                {dynamicSlaDelegates.map((del) => (
                  <div
                    key={del.id || del.sectionKey}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {del.delegateName}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {del.sectionName} · <span className="font-mono">{del.delegateEmail}</span> · Tiempo de respuesta:{' '}
                        {del.slaHours}h
                      </div>
                    </div>

                    <button
                      type="button"
                      data-testid={`org-emit-sla-alert-btn-${del.delegateEmail}`}
                      onClick={() => {
                        const res = dispatchHierarchicalSlaAlert({
                          schoolId: effectiveSchoolId,
                          fromNodeId: 'ceo-root',
                          fromName: 'Dirección Ejecutiva CEO',
                          fromRoleLabel: 'Superior en Organigrama',
                          targetDelegateEmail: del.delegateEmail,
                          subject: `Seguimiento Prioritario (Tiempo de respuesta) · ${del.sectionName}`,
                          message: `Asunto delegado desde Dirección General con plazo de atención de ${del.slaHours} horas.`,
                          slaHours: del.slaHours,
                        });
                        if (res.triggered) {
                          onTriggerToast?.(
                            `📳 Alerta vibratoria emergente enviada a ${del.delegateName}`
                          );
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                      title="Delegar asunto con Tiempo de respuesta y alerta vibratoria al subordinado"
                    >
                      <BellRing className="h-3 w-3 text-amber-600" />
                      <span>Delegar Tiempo de respuesta</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal de Configuración del Nodo (Se auto-crea el usuario al cerrarlo) */}
      {configuringNode && (
        <NodeConfigureModal
          node={configuringNode}
          campuses={normalizedCampuses}
          savedSubjects={graph.savedSubjects}
          teacherWeeklyHours={configuringNodeWeeklyHours}
          onRecoverPassword={(nodeId) => {
            const res = recoverNodePassword(effectiveSchoolId, nodeId);
            if (res.newPassword) {
              onTriggerToast?.('✓ Nueva contraseña intercalada generada y asignada automáticamente');
            }
            return res;
          }}
          onCloseAndAutoProvision={(nodeId, patch, openTimetableAfterClose) => {
            const { updatedNode, campusChanged } = saveAndProvisionNode(
              effectiveSchoolId,
              nodeId,
              patch
            );
            setConfiguringNodeId(null);

            if (updatedNode) {
              const label = getFullNameOfNode(updatedNode);
              onTriggerToast?.(
                `✓ Cuenta "${label}" activa y reportada en Superusuario, Finanzas y Matriz de Tiempo de respuesta`
              );

              if (openTimetableAfterClose) {
                setActiveTimetableCampus(effectiveSchoolId, updatedNode.campusId);
                // Si cambia de sede o no tiene horario creado, preguntar condiciones necesarias
                if (campusChanged || !graph.campusSchedules[updatedNode.campusId]) {
                  setForcePromptCampusId(updatedNode.campusId);
                }
                setActiveTopTab('horario');
              } else if (
                campusChanged &&
                Object.keys(graph.campusSchedules).length > 0 &&
                updatedNode.category === 'profesor'
              ) {
                // Regla Página 4: "En el caso del horario cuando ya este creado si cambia de sede se vuelven a preguntar las condiciones necesarias para generar el horario"
                setActiveTimetableCampus(effectiveSchoolId, updatedNode.campusId);
                setForcePromptCampusId(updatedNode.campusId);
                setActiveTopTab('horario');
              }
            }
          }}
        />
      )}
    </div>
  );
}
