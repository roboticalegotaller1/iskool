"use client";

import React, { useState } from 'react';
import { useGamificationStore } from '@/store/useGamificationStore';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar, normalizeStudentId, mapStudentIdToUuid } from '@/store/useStudentStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { Loader } from '@/components/Loader';
import { useHydration } from '@/hooks/useHydration';
import { Mission, Quest } from '@/types';
import { 
  Lock, Check, Star, Play, Swords, Trophy, Sparkles, BookOpen, 
  ArrowRight, Shield, Award, X, AlertTriangle, Compass, Heart, Zap, Footprints
} from 'lucide-react';
import Link from 'next/link';
import { ModularAnimeAvatarSprite } from './avatar/ModularAnimeAvatarSprite';
import { PetSvgRenderer } from './pet/PetSvgRenderer';
import { getPetToAvatarScaleRatio, getPetScaleRatioDescription } from '@/utils/petScaleHelper';

interface SagaMapProps {
  missions: Mission[];
  activeLevel: 'primaria' | 'secundaria' | 'preparatoria';
  activeGrade: string;
}

export default function SagaMap({ missions, activeLevel, activeGrade }: SagaMapProps) {
  const isHydrated = useHydration();
  const questAttempts = useGamificationStore(state => state.questAttempts);
  const openQuestModal = useStudentStore(state => state.openQuestModal);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Todos');

  const stats = useCurrentStudentStats();
  const avatar = useCurrentStudentAvatar();
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const normActiveStudentId = normalizeStudentId(activeStudentId);
  const dbActiveStudentUuid = mapStudentIdToUuid(activeStudentId);
  const schedulesList = useSchoolAdminStore(state => state.schedulesList);

  // Helper to determine if a quest is completed for active student
  const isQuestCompleted = (qId: string) => {
    return questAttempts.some(a => 
      a.quest_id === qId && 
      (a.student_id === activeStudentId || a.student_id === normActiveStudentId || a.student_id === dbActiveStudentUuid) &&
      (a.is_completed || a.score >= 60)
    );
  };

  // Helper to calculate coordinates of the node with collision prevention and organic pathing
  const getCoordinates = (mission: Mission, index: number, total: number) => {
    if (total <= 1) {
      return { x: 50, y: 50 };
    }
    
    // Spread X evenly from 8% to 92% across map container width
    const startX = 8;
    const endX = 92;
    const stepX = (endX - startX) / Math.max(1, total - 1);
    const x = startX + index * stepX;
    
    // Smooth wavy pattern for Y: alternates heights to create an organic, beautiful path with vertical clearance for 3x character
    const wavePattern = [60, 50, 72, 52, 66, 48, 72];
    const y = wavePattern[index % wavePattern.length];
    
    return { x, y };
  };

  const currentStudentLevel = stats?.level || 1;

  const activeStudent = detailedStudents.find(s => 
    s.id === activeStudentId || 
    s.id === normActiveStudentId || 
    s.id === dbActiveStudentUuid
  );
  const studentGroupId = activeStudent?.group_id;

  // Get subjects for this group
  const studentSubjectIds = schedulesList
    .filter(s => s.groupId === studentGroupId)
    .map(s => s.subjectId);

  const currentLevel = activeLevel || activeStudent?.level || 'primaria';
  const currentGrade = activeGrade || activeStudent?.grade || '4º';

  // Filter active missions by student's group, level/grade and subjects
  const filteredMissions = missions.filter(m => {
    if (m.is_active === false) return false;

    // 1. Coincidencia directa por grupo
    if ((m as any).group_id && (m as any).group_id === studentGroupId) return true;

    // 2. Coincidencia por nivel y grado académico
    if (m.level_grade_id) {
      if (m.level_grade_id.includes(currentLevel) || m.level_grade_id.includes(currentGrade)) return true;
      if (currentLevel === 'primaria') {
        const gradeNum = parseInt(currentGrade) || 4;
        if (gradeNum <= 3 && (m.level_grade_id === 'primaria-1º' || m.level_grade_id === 'lg-1')) return true;
        if (gradeNum > 3 && (m.level_grade_id === 'primaria-4º' || m.level_grade_id === 'lg-4')) return true;
      }
      if (currentLevel === 'secundaria' && (m.level_grade_id.includes('sec') || m.level_grade_id === 'lg-sec' || m.level_grade_id === 'secundaria-2º')) return true;
      if (currentLevel === 'preparatoria' && (m.level_grade_id.includes('prep') || m.level_grade_id === 'lg-prep' || m.level_grade_id === 'preparatoria-4ºSemestre')) return true;
    }

    // 3. Coincidencia por materia de su horario
    if (studentSubjectIds.length > 0) {
      const matchSubject = studentSubjectIds.some(subId => {
        if (subId === m.subject_id) return true;
        const subjects = useSchoolAdminStore.getState().subjectsList;
        const studentSub = subjects.find(s => s.id === subId);
        const missionSub = subjects.find(s => s.id === m.subject_id);
        if (studentSub && missionSub && studentSub.name === missionSub.name) return true;
        return false;
      }) || studentSubjectIds.includes(m.subject_id);

      if (matchSubject) return true;
    }

    // 4. Si la misión no tiene restricción de nivel/grupo específica, mostrarla por defecto en su nivel
    if (!m.level_grade_id && !(m as any).group_id) return true;

    return false;
  });

  // Fallback to all active provided missions if subject-specific filter returns empty
  const activeMissions = missions.filter(m => m.is_active !== false);
  const displayMissions = filteredMissions.length > 0 ? filteredMissions : activeMissions;

  // Sort missions to form a sequence
  const sortedMissions = [...displayMissions].sort((a, b) => a.created_at.localeCompare(b.created_at));
  
  // Assign periods dynamically
  const missionsWithPeriod = sortedMissions.map((m, idx) => {
    let period = 'Trimestre 1';
    if (m.id === 'mis-fractions' || m.title.includes('Fracciones')) {
      period = 'Trimestre 1';
    } else if (m.id === 'mis-selva' || m.title.includes('Selva') || m.title.includes('Jaguar')) {
      period = 'Trimestre 2';
    } else {
      const termNum = (idx % 2) + 2; // Alternate other missions between Trimestre 2 and 3
      period = `Trimestre ${termNum}`;
    }
    return { ...m, period };
  });

  const filteredByPeriod = selectedPeriod === 'Todos'
    ? missionsWithPeriod
    : missionsWithPeriod.filter(m => m.period === selectedPeriod);

  // Map node coordinates
  const nodes = filteredByPeriod.map((m, idx) => {
    const overallIdx = sortedMissions.findIndex(orig => orig.id === m.id);
    return {
      mission: m,
      idx: overallIdx,
      ...getCoordinates(m, idx, filteredByPeriod.length)
    };
  });

  const mapCanvasWidth = Math.max(1000, nodes.length * 180);

  // Determine status of each mission
  const getMissionStatus = (mission: Mission, index: number) => {
    const missionMinLevel = (mission as any).required_level || 
      (mission.quests && mission.quests.length > 0 
        ? Math.min(...mission.quests.map(q => q.required_level || 1)) 
        : 1);
    
    if (currentStudentLevel < missionMinLevel) {
      return 'locked';
    }

    const totalQuests = mission.quests?.length || 0;
    const completedQuests = mission.quests?.filter(q => isQuestCompleted(q.id)).length || 0;
    const isCompleted = totalQuests > 0 && completedQuests === totalQuests;

    if (isCompleted) return 'completed';

    // Find the first uncompleted mission index
    const firstUncompletedIndex = sortedMissions.findIndex(m => {
      const mQuests = m.quests || [];
      const mCompleted = mQuests.filter(q => isQuestCompleted(q.id)).length;
      return mQuests.length === 0 || mCompleted < mQuests.length;
    });

    if (index === firstUncompletedIndex || (firstUncompletedIndex === -1 && index === sortedMissions.length - 1)) {
      return 'active';
    }

    if (index < firstUncompletedIndex) {
      return 'completed';
    }

    return 'locked';
  };

  // Generate SVG path for the curve connecting nodes
  let pathD = '';
  if (nodes.length >= 2) {
    pathD = `M ${nodes[0].x} ${nodes[0].y}`;
    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      // Curve control points
      const cpX1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpY1 = prev.y;
      const cpX2 = prev.x + (curr.x - prev.x) * 0.6;
      const cpY2 = curr.y;
      pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y}`;
    }
  }

  // Determine Level Subtheme (Redesigned for Magic Academy)
  const theme = {
    containerBg: 'bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950',
    gridColor: 'rgba(255, 215, 0, 0.03)',
    pathColor: 'url(#arcane-golden-gradient)',
    pathDash: '8 6',
    nodeBorder: 'border-yellow-500/20',
    decoElements: (
      <>
        {/* Starry Sky Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent" />
        
        {/* Inline SVG Gothic Castle Silhouette */}
        <svg className="absolute bottom-0 right-4 w-72 h-36 opacity-10 pointer-events-none select-none text-teal-300 fill-current" viewBox="0 0 400 200">
          <path d="M 0,200 L 0,160 L 20,160 L 20,140 L 40,140 L 40,160 L 60,160 L 60,200 Z" />
          <path d="M 50,200 L 50,110 L 70,80 L 90,110 L 90,200 Z" />
          <path d="M 80,200 L 80,130 L 100,130 L 100,100 L 120,70 L 140,100 L 140,130 L 160,130 L 160,200 Z" />
          <path d="M 150,200 L 150,90 L 180,40 L 210,90 L 210,200 Z" />
          <path d="M 200,200 L 200,120 L 220,120 L 220,200 Z" />
          <path d="M 215,200 L 215,70 L 235,40 L 255,70 L 255,200 Z" />
          <path d="M 250,200 L 250,140 L 270,140 L 270,110 L 290,80 L 310,110 L 310,140 L 330,140 L 330,200 Z" />
          <path d="M 320,200 L 320,95 L 345,55 L 370,95 L 370,200 Z" />
          <circle cx="280" cy="50" r="24" className="text-yellow-100/30 fill-current" />
        </svg>

        {/* Floating Magic Sparks */}
        <div className="absolute top-[10%] left-[15%] text-xl animate-pulse opacity-40 select-none pointer-events-none">✨</div>
        <div className="absolute bottom-[25%] left-[25%] text-md animate-ping duration-[3000ms] opacity-25 select-none pointer-events-none">⭐</div>
        <div className="absolute top-[35%] right-[20%] text-lg animate-pulse duration-[2000ms] opacity-35 select-none pointer-events-none">🌟</div>
        <div className="absolute bottom-[10%] right-[45%] text-2xl animate-bounce duration-[4000ms] opacity-30 select-none pointer-events-none">🦉</div>
      </>
    ),
    svgDefs: (
      <linearGradient id="arcane-golden-gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#D97706" stopOpacity="0.4" />
        <stop offset="50%" stopColor="#FBBF24" stopOpacity="0.95" />
        <stop offset="100%" stopColor="#D97706" stopOpacity="0.4" />
      </linearGradient>
    )
  };

  // Find index of the currently active node within nodes
  const activeNodeIdx = nodes.findIndex(n => getMissionStatus(n.mission, n.idx) === 'active');
  const fallbackIndex = activeNodeIdx !== -1 ? activeNodeIdx : 0;

  const petStage = stats?.pet_stage || 'egg';
  const petScaleRatio = getPetToAvatarScaleRatio(petStage);
  
  // Tamaño ampliado a exactamente 3 veces el tamaño inicial (3x: 186px alto)
  const avatarMapHeight = 186;
  const avatarMapWidth = 138;
  const petMapHeight = Math.max(34, Math.round(avatarMapHeight * petScaleRatio));
  const petMapWidth = Math.round(petMapHeight * 0.95);

  const [playerNodeIndex, setPlayerNodeIndex] = useState<number>(fallbackIndex);
  const [isWalking, setIsWalking] = useState<boolean>(false);
  const [isCheering, setIsCheering] = useState<boolean>(false);
  const [facingDirection, setFacingDirection] = useState<'right' | 'left'>('right');
  const prevActiveNodeIdxRef = React.useRef<number>(activeNodeIdx);

  const walkToNode = React.useCallback((targetIndex: number, onArrival?: () => void) => {
    if (targetIndex < 0 || targetIndex >= nodes.length) return;
    if (targetIndex === playerNodeIndex) {
      if (onArrival) onArrival();
      return;
    }

    // Regla estricta de seguridad: JAMÁS caminar o posicionarse en un nodo bloqueado
    const targetStatus = getMissionStatus(nodes[targetIndex].mission, nodes[targetIndex].idx);
    if (targetStatus === 'locked') {
      console.warn('Protección de mapa: No se permite desplazarse hacia un desafío bloqueado');
      return;
    }

    const currentX = nodes[playerNodeIndex]?.x ?? 0;
    const targetX = nodes[targetIndex]?.x ?? 0;
    setFacingDirection(targetX >= currentX ? 'right' : 'left');
    setIsWalking(true);
    setPlayerNodeIndex(targetIndex);

    setTimeout(() => {
      setIsWalking(false);
      setIsCheering(true);
      setTimeout(() => {
        setIsCheering(false);
        if (onArrival) onArrival();
      }, 700);
    }, 1400);
  }, [nodes, playerNodeIndex]);

  // Sincronizar automáticamente cuando progresa la misión activa
  React.useEffect(() => {
    if (activeNodeIdx !== -1 && activeNodeIdx !== prevActiveNodeIdxRef.current) {
      walkToNode(activeNodeIdx);
      prevActiveNodeIdxRef.current = activeNodeIdx;
    }
  }, [activeNodeIdx, walkToNode]);

  // Protección permanente: si por cualquier motivo el jugador está en un nodo bloqueado, reubicarlo inmediatamente al desafío activo
  React.useEffect(() => {
    if (nodes.length > 0 && activeNodeIdx !== -1) {
      const currentNode = nodes[playerNodeIndex];
      const currentStatus = currentNode ? getMissionStatus(currentNode.mission, currentNode.idx) : 'locked';
      if (currentStatus === 'locked' || playerNodeIndex === -1) {
        setPlayerNodeIndex(activeNodeIdx);
      }
    }
  }, [activeNodeIdx, nodes, playerNodeIndex]);

  // Mantener el índice dentro de los límites al cambiar de periodo
  React.useEffect(() => {
    if (nodes.length > 0 && playerNodeIndex >= nodes.length) {
      setPlayerNodeIndex(activeNodeIdx !== -1 ? activeNodeIdx : 0);
    }
  }, [nodes.length, playerNodeIndex, activeNodeIdx]);

  // Handle clicking on a node with world map walking animation
  const handleNodeClick = (mission: Mission, status: string) => {
    const missionMinLevel = (mission as any).required_level || 
      (mission.quests && mission.quests.length > 0 
        ? Math.min(...mission.quests.map(q => q.required_level || 1)) 
        : 1);

    if (currentStudentLevel < missionMinLevel) {
      alert(`⚠️ Nivel insuficiente para desbloquear esta aventura. Requiere Nivel ${missionMinLevel}. Tu nivel actual es ${currentStudentLevel}.`);
      return;
    }

    if (status === 'locked') {
      alert("⚠️ Esta aventura aún está bloqueada. Completa las misiones previas.");
      return;
    }

    const targetIndex = nodes.findIndex(n => n.mission.id === mission.id);
    if (targetIndex !== -1 && targetIndex !== playerNodeIndex) {
      walkToNode(targetIndex, () => {
        setSelectedMission(mission);
      });
    } else {
      setSelectedMission(mission);
    }
  };

  if (!isHydrated) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Dynamic styles for map animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes magicFootsteps {
          from {
            stroke-dashoffset: 40;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        .magic-path-dash {
          stroke-dasharray: 8 6;
          animation: magicFootsteps 2.5s linear infinite;
        }
        
        @keyframes pulseGlow {
          0%, 100% {
            box-shadow: 0 0 15px rgba(255, 215, 0, 0.6), inset 0 0 5px rgba(255, 215, 0, 0.4);
            transform: scale(1) rotate(45deg);
          }
          50% {
            box-shadow: 0 0 32px rgba(255, 215, 0, 0.95), inset 0 0 12px rgba(255, 215, 0, 0.7);
            transform: scale(1.08) rotate(45deg);
          }
        }
        .arcane-active-glow {
          animation: pulseGlow 1.8s infinite ease-in-out;
        }

        @keyframes petMapHop {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-13px) rotate(8deg);
          }
        }
        .animate-pet-map-hop {
          animation: petMapHop 0.35s ease-in-out infinite;
        }

        @keyframes petMapFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        .animate-pet-map-float {
          animation: petMapFloat 2.2s ease-in-out infinite;
        }
      `}} />

      {/* Main Saga Map Panel */}
      <div className={`relative w-full rounded-[32px] overflow-hidden shadow-2xl border border-zinc-800 ${theme.containerBg} p-6 min-h-[580px]`}>
        
        {/* Continuous background grid pattern */}
        <div 
          className="absolute inset-0 z-0 opacity-40 pointer-events-none" 
          style={{
            backgroundImage: `radial-gradient(circle, ${theme.gridColor} 1px, transparent 1.5px)`,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Decorative theme-specific elements */}
        {theme.decoElements}

        {/* Legend / Info HUD */}
        <div className="absolute top-4 left-6 z-10 bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md px-4 py-2 rounded-2xl flex flex-col gap-1.5 shadow-lg select-none">
          <span className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">Progreso Arcano</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-emerald-500 border border-emerald-400 rotate-45 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[9px] font-bold text-zinc-300 ml-1">Superado</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-yellow-500 border border-yellow-400 rotate-45 animate-pulse shadow-[0_0_8px_rgba(255,215,0,0.8)]" />
              <span className="text-[9px] font-bold text-zinc-300 ml-1">Actual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 bg-zinc-850 border border-zinc-750 rotate-45" />
              <span className="text-[9px] font-bold text-zinc-300 ml-1">Bloqueado</span>
            </div>
          </div>
        </div>

        {/* Period Selector and Explorer Walk Button (Solo Casillas Desbloqueadas) */}
        <div className="absolute top-4 right-6 z-10 flex items-center gap-2 select-none">
          {/* Action to walk across map only through UNLOCKED (completed / active) nodes */}
          {(() => {
            const accessibleIndices = nodes
              .map((n, i) => ({ status: getMissionStatus(n.mission, n.idx), index: i }))
              .filter(item => item.status === 'completed' || item.status === 'active')
              .map(item => item.index);

            if (playerNodeIndex !== activeNodeIdx && activeNodeIdx !== -1) {
              return (
                <button
                  onClick={() => walkToNode(activeNodeIdx)}
                  className="bg-amber-500/25 hover:bg-amber-500/35 border border-amber-400/60 text-amber-200 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-[10px] font-black shadow-lg transition-all active:scale-95 cursor-pointer animate-pulse"
                  title="Regresar al desafío actual desbloqueado"
                >
                  <Footprints className="h-3.5 w-3.5" />
                  <span>Ir a Desafío Actual</span>
                </button>
              );
            }

            if (accessibleIndices.length > 1) {
              return (
                <button
                  onClick={() => {
                    const currentPos = accessibleIndices.indexOf(playerNodeIndex);
                    const nextIndex = accessibleIndices[(currentPos + 1) % accessibleIndices.length];
                    walkToNode(nextIndex);
                  }}
                  className="bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1.5 text-[10px] font-bold shadow-lg transition-all active:scale-95 cursor-pointer"
                  title="Pasear únicamente por misiones desbloqueadas"
                >
                  <Footprints className="h-3.5 w-3.5" />
                  <span>Pasear por Desafíos</span>
                </button>
              );
            }

            return null;
          })()}

          <div className="bg-zinc-950/70 border border-zinc-800/80 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-2 shadow-lg">
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Periodo:</span>
            <div className="flex gap-1.5">
              {['Todos', 'Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPeriod(p)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                    selectedPeriod === p
                      ? 'bg-emerald-600 text-white shadow shadow-emerald-950/50 border border-emerald-500/40 font-black'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Responsive Scrolling Map Container with ample vertical room */}
        <div className="w-full overflow-x-auto overflow-y-hidden relative h-[540px] pt-2 pb-4 mt-6 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          
          {/* Map canvas with relative positions */}
          <div style={{ width: `${mapCanvasWidth}px` }} className="h-[480px] relative mx-auto my-auto px-10">
            
            {/* SVG Connecting Path */}
            {nodes.length >= 2 && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  {theme.svgDefs}
                </defs>
                {/* Glowing Background Path */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={theme.pathColor} 
                  strokeWidth="3.5" 
                  opacity="0.15"
                />
                {/* Dashed Active Path */}
                <path 
                  d={pathD} 
                  fill="none" 
                  stroke={theme.pathColor} 
                  strokeWidth="1.8" 
                  className="magic-path-dash"
                />
              </svg>
            )}

            {/* Nodes (Missions) */}
            {nodes.map(({ mission, idx, x, y }) => {
              const status = getMissionStatus(mission, idx);
              const isCompleted = status === 'completed';
              const isActive = status === 'active';
              const isLocked = status === 'locked';

              // Visual styling per status and theme (Magic Academy themed)
              let nodeColor = 'bg-zinc-900/90 border-zinc-750 text-zinc-500';
              let ringColor = 'ring-zinc-800/10';
              let glowStyle = 'opacity-65';
              let badgeEmoji = '📜'; // Closed scroll

              if (isCompleted) {
                nodeColor = 'bg-gradient-to-br from-emerald-600 to-teal-700 border-emerald-450 text-white';
                ringColor = 'ring-emerald-500/35';
                glowStyle = 'shadow-[0_0_15px_rgba(16,185,129,0.5)]';
                badgeEmoji = '🧪'; // Potion bottle of completion
              } else if (isActive) {
                nodeColor = 'bg-gradient-to-br from-amber-500 via-yellow-450 to-yellow-600 border-yellow-350 text-slate-950 font-black';
                ringColor = 'ring-yellow-400/50';
                glowStyle = 'arcane-active-glow shadow-[0_0_22px_rgba(255,215,0,0.85)]';
                badgeEmoji = '🔮'; // Crystal ball of active quest
              }

              // Determine if title tooltip goes above or below based on Y coordinate
              const isUpperHalf = y <= 50;
              const tooltipPositionClass = isUpperHalf ? 'top-[68px]' : 'bottom-[68px]';

              return (
                <div
                  key={mission.id}
                  className="absolute z-20 w-16 h-16 flex items-center justify-center"
                  style={{ 
                    left: `${x}%`, 
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <button
                    onClick={() => handleNodeClick(mission, status)}
                    className={`w-14 h-14 rotate-45 border-2 rounded-2xl flex items-center justify-center transition-all duration-500 group ring-4 ${ringColor} ${nodeColor} ${glowStyle} ${
                      isLocked ? 'cursor-not-allowed filter grayscale' : 'hover:scale-110 hover:rotate-[225deg] cursor-pointer'
                    }`}
                    title={mission.title}
                  >
                    <div className="-rotate-45 group-hover:rotate-[-225deg] transition-all duration-500 flex items-center justify-center select-none">
                      <span className="text-xl">{badgeEmoji}</span>
                    </div>
                  </button>

                  {/* Floating Title Tooltip (Anti-Collision Pill) */}
                  <div className={`absolute ${tooltipPositionClass} left-1/2 -translate-x-1/2 min-w-[140px] max-w-[190px] text-center select-none pointer-events-none z-30 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800/80 shadow-xl shadow-black/50`}>
                    <span className={`text-[8.5px] font-black tracking-wider block uppercase truncate ${
                      isActive ? 'text-yellow-400 animate-pulse font-black' : isCompleted ? 'text-emerald-400' : 'text-zinc-500'
                    }`}>
                      {isActive && "Desafío Arcano Actual"}
                      {isCompleted && "Superado"}
                      {isLocked && "Bloqueado"}
                    </span>
                    <span className="text-[10px] font-bold text-zinc-100 block truncate mt-0.5" title={mission.title}>
                      {mission.title.replace('La Aventura de ', '').replace('Guardianes de ', '')}
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Token de Avatar y Mascota Estilo Explorador de Mapa (3x tamaño oficial) */}
            {nodes.length > 0 && (() => {
              const activeNodeSafe = activeNodeIdx !== -1 ? nodes[activeNodeIdx] : nodes[0];
              const currentNode = nodes[playerNodeIndex] && getMissionStatus(nodes[playerNodeIndex].mission, nodes[playerNodeIndex].idx) !== 'locked'
                ? nodes[playerNodeIndex]
                : activeNodeSafe;

              const playerX = currentNode?.x ?? 50;
              const playerY = currentNode?.y ?? 50;

              return (
                <div
                  className="absolute z-35 pointer-events-none transition-all duration-[1400ms] ease-in-out flex flex-col items-center select-none"
                  style={{
                    left: `${playerX}%`,
                    top: `${playerY}%`,
                    transform: 'translate(-50%, -83%)',
                  }}
                >
                  {/* Distintivo de Posición Actual con Proporción de Mascota */}
                  <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 font-black text-[11px] px-3.5 py-1 rounded-full shadow-xl shadow-amber-500/50 uppercase tracking-wider mb-2 animate-bounce border-2 border-yellow-200">
                    <span>⭐ {avatar?.avatar_name || 'Héroe'}</span>
                    <span className="text-[9.5px] opacity-90 font-black bg-amber-600/35 px-2 py-0.5 rounded-md">
                      {avatar?.pet_name || 'Mascota'} ({petStage === 'egg' ? '1/5' : petStage === 'baby' ? '1/4' : petStage === 'child' ? '1/2' : petStage === 'teen' ? '2/3' : '1:1'})
                    </span>
                  </div>

                  {/* Par Avatar + Mascota con Orientación según Dirección de Caminata */}
                  <div 
                    className="flex items-end justify-center gap-3 transition-transform duration-300"
                    style={{
                      transform: facingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
                    }}
                  >
                    {/* Sprite del Avatar con fidelidad vectorial íntegra (3x tamaño = 186px de alto) */}
                    <div 
                      style={{ width: avatarMapWidth, height: avatarMapHeight }} 
                      className="relative shrink-0 filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.65)]"
                    >
                      <ModularAnimeAvatarSprite
                        gender={(avatar as any)?.gender ?? 'female'}
                        skinTone={(avatar as any)?.skin_tone ?? 'light'}
                        hairColor={avatar?.hair_color ?? '#4B5563'}
                        hairStyle={avatar?.hair_style ?? 'spiky'}
                        eyesStyle={avatar?.eyes_style ?? 'determined'}
                        raceFeature={avatar?.race_feature || 'human'}
                        bodyScale={(avatar as any)?.body_scale ?? 'normal'}
                        equippedShoes={avatar?.equipped_shoes}
                        equippedBottom={avatar?.equipped_bottom}
                        equippedTop={avatar?.equipped_top}
                        equippedOuterwear={avatar?.equipped_outerwear}
                        equippedHat={avatar?.equipped_hat}
                        equippedAccessory={avatar?.equipped_accessory}
                        animationState={isWalking ? 'walk' : isCheering ? 'cheer' : 'idle'}
                        className="w-full h-full"
                      />
                    </div>

                    {/* Mascota Acompañante con Escala Proporcional Estricta a 3x (Huevo 1/5, Bebé 1/4, Niño 1/2, Adolescente 2/3, Adulto 1:1) */}
                    <div 
                      style={{ 
                        width: petMapWidth, 
                        height: petMapHeight,
                        marginBottom: 4
                      }} 
                      className={`relative shrink-0 filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.55)] ${
                        isWalking ? 'animate-pet-map-hop' : 'animate-pet-map-float'
                      }`}
                      title={`${avatar?.pet_name || 'Mascota'} (${getPetScaleRatioDescription(petStage)})`}
                    >
                      <PetSvgRenderer
                        raceId={avatar?.pet_type || 'cryo_dragon'}
                        stage={petStage}
                        actionId={isWalking ? 'joy_bounce' : 'idle'}
                        className="w-full h-full"
                      />
                    </div>
                  </div>

                  {/* Partículas de Pasos y Polvo en Caminata */}
                  {isWalking ? (
                    <div className="flex items-center gap-1.5 -mt-1 pointer-events-none">
                      <span className="text-[14px] animate-ping opacity-85">💨</span>
                      <span className="text-[12px] animate-spin text-amber-300">✨</span>
                      <span className="text-[14px] animate-bounce opacity-85">💨</span>
                    </div>
                  ) : (
                    /* Sombra base en el suelo */
                    <div className="w-28 h-4 bg-black/50 rounded-full blur-[3px] -mt-1 pointer-events-none" />
                  )}

                  {/* Celebración / Destello al llegar a la casilla de misión */}
                  {isCheering && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none animate-in zoom-in-50 fade-in duration-300">
                      <span className="text-2xl animate-bounce">🎉</span>
                      <span className="text-lg animate-ping text-yellow-300">⭐</span>
                      <span className="text-2xl animate-bounce">✨</span>
                    </div>
                  )}
                </div>
              );
            })()}

          </div>
        </div>

      </div>

      {/* Glassmorphism Modal Detail Dialog */}
      {selectedMission && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md transition-all duration-300">
          <div 
            className="relative w-full max-w-lg bg-zinc-900/60 border border-zinc-800 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-2xl p-6 md:p-8 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200"
            style={{
              boxShadow: '0 20px 50px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.1)'
            }}
          >
            {/* Corner Decorative Gradients */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="flex justify-between items-start">
              <div className="flex flex-col gap-1 text-left">
                <span className="text-[9px] font-black text-teal-400 tracking-widest uppercase bg-teal-950/50 border border-teal-500/25 px-2.5 py-0.5 rounded-full w-max">
                  {selectedMission.subject_id === 'sub-math' ? 'Matemáticas' : 'Español'}
                </span>
                <h3 className="text-xl font-black text-white mt-1.5">{selectedMission.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedMission(null)}
                className="p-2 rounded-full bg-zinc-950/60 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Story / Lore Block */}
            {selectedMission.story_intro && (
              <div className="bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/80">
                <span className="text-[8.5px] font-black text-zinc-500 uppercase tracking-widest block mb-1">El Relato de la Aventura</span>
                <p className="text-xs text-zinc-300 italic leading-relaxed font-medium">
                  " {selectedMission.story_intro} "
                </p>
              </div>
            )}

            {/* Quests (Tareas) List */}
            <div className="flex flex-col gap-3">
              <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider text-left block">
                Lista de Retos ({selectedMission.quests?.length || 0})
              </span>
              
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                {selectedMission.quests?.map((quest: Quest) => {
                  const completed = isQuestCompleted(quest.id);
                  const isQuiz = quest.type === 'quiz';
                  const isLocked = quest.required_level !== undefined && quest.required_level > currentStudentLevel;
                  
                  let cardStyle = '';
                  if (completed) {
                    cardStyle = 'bg-emerald-950/15 border-emerald-900/35 text-zinc-300';
                  } else if (isLocked) {
                    cardStyle = 'bg-zinc-950/10 border-zinc-900/40 text-zinc-500 cursor-not-allowed opacity-50';
                  } else {
                    cardStyle = 'bg-zinc-950/30 border-zinc-850 text-zinc-200 cursor-pointer hover:border-indigo-500/50 hover:bg-zinc-900/50';
                  }
                  
                  return (
                    <div 
                      key={quest.id} 
                      className={`flex justify-between items-center p-3 rounded-2xl border transition-all ${cardStyle}`}
                      onClick={() => {
                        if (isLocked) {
                          alert(`⚠️ Nivel insuficiente. Requiere nivel ${quest.required_level} para desbloquear este reto.`);
                          return;
                        }
                        if (!completed) {
                          openQuestModal(quest);
                          setSelectedMission(null);
                        } else {
                          alert("Aventura ya completada. ¡Buen trabajo, Héroe!");
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 text-left">
                        <div className={`p-2 rounded-xl shrink-0 ${
                          completed 
                            ? 'bg-emerald-950/40 text-emerald-400' 
                            : isLocked 
                              ? 'bg-zinc-950 border border-zinc-900 text-zinc-600' 
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-400'
                        }`}>
                          {isLocked ? <Lock className="h-4 w-4" /> : isQuiz ? <Sparkles className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold">{quest.title}</span>
                            {isLocked && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-rose-950/40 border border-rose-500/25 text-rose-400 flex items-center gap-0.5">
                                <Lock className="h-2 w-2" /> Nivel {quest.required_level}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-zinc-400 line-clamp-1">{quest.description}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* XP / Coins reward badge */}
                        <div className="flex flex-col items-end text-[9px] font-bold text-zinc-500 font-mono">
                          <span>+{quest.xp_reward} XP</span>
                          <span>+{quest.coins_reward} 🪙</span>
                        </div>
                        
                        {completed ? (
                          <div className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 animate-pulse">
                            <Check className="h-3 w-3" />
                          </div>
                        ) : isLocked ? (
                          <div className="h-5 w-5 rounded-full bg-zinc-950 border border-zinc-900 text-zinc-650 flex items-center justify-center shrink-0">
                            <Lock className="h-3 w-3" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 flex items-center justify-center shrink-0">
                            <Play className="h-2 w-2 fill-current ml-0.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4 mt-2">
              <div className="flex items-center gap-1.5 bg-zinc-950/50 px-3 py-1.5 rounded-xl border border-zinc-850 text-[10px] font-bold text-zinc-400 select-none">
                <Zap className="h-3.5 w-3.5 text-yellow-500 fill-current" />
                Misión Rejugable
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMission(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-400 hover:text-white transition-all"
                >
                  Regresar al mapa
                </button>
                <Link
                  href={`/student/missions/${selectedMission.id}`}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-amber-500/30 active:scale-95 flex items-center gap-1.5 border border-amber-400/40 cursor-pointer"
                >
                  Comenzar Aventura
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
