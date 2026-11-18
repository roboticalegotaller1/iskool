"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { CommunityActivity } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { 
  Rocket, 
  X, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  Award, 
  Coins, 
  BookOpen,
  ChevronRight
} from 'lucide-react';

import { useGamificationStore } from '@/store/useGamificationStore';
import { useSchoolAdminStore, getSchoolGroups } from '@/store/useSchoolAdminStore';

interface AssignToClassModalProps {
  activity: CommunityActivity | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupName: string) => void;
}

const DEFAULT_AVAILABLE_GROUPS = [
  { id: 'grp-pa-a', name: '4º Primaria - Grupo A', grade: '4º Primaria', subjectId: 'sub-math', subject: 'Matemáticas / Saberes Científicos' },
  { id: 'grp-sec-a', name: '2º Secundaria - Grupo A', grade: '2º Secundaria', subjectId: 'sub-sci', subject: 'Ciencias & Tecnología' },
  { id: 'grp-pb-a', name: '1º Primaria - Grupo A', grade: '1º Primaria', subjectId: 'sub-span', subject: 'Lenguajes & Comprensión' },
  { id: 'grp-prep-a', name: '4º Semestre - Preparatoria A', grade: '4º Prep', subjectId: 'sub-sci', subject: 'Proyectos Ecotécnicos NEM' }
];

export const AssignToClassModal: React.FC<AssignToClassModalProps> = ({
  activity,
  isOpen,
  onClose,
  onSuccess
}) => {
  const activeSchoolId = useSchoolAdminStore(state => state.activeSchoolId);
  const storeGroupsList = useSchoolAdminStore(state => state.groupsList);
  const storeCampusesList = useSchoolAdminStore(state => state.campusesList);

  const AVAILABLE_GROUPS = React.useMemo(() => {
    const schoolGroups = getSchoolGroups(storeGroupsList || [], activeSchoolId, storeCampusesList || []);
    if (schoolGroups.length === 0) return DEFAULT_AVAILABLE_GROUPS;
    return schoolGroups.map((g) => ({
      id: g.id,
      name: `${g.grade || ''} ${g.name || ''}`.trim() || 'Grupo Escolar',
      grade: g.grade || 'General',
      subjectId: 'sub-sci',
      subject: 'Currículum Institucional NEM'
    }));
  }, [storeGroupsList, storeCampusesList, activeSchoolId]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(AVAILABLE_GROUPS[0]?.id || DEFAULT_AVAILABLE_GROUPS[0].id);
  const [xpReward, setXpReward] = useState<number>(100);
  const [coinsReward, setCoinsReward] = useState<number>(25);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  const assignStudioActivity = useGamificationStore(state => state.assignStudioActivity);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (AVAILABLE_GROUPS.length > 0 && !AVAILABLE_GROUPS.some((g) => g.id === selectedGroupId)) {
      setSelectedGroupId(AVAILABLE_GROUPS[0].id);
    }
  }, [AVAILABLE_GROUPS, selectedGroupId]);

  if (!isOpen || !activity || !mounted) return null;

  const selectedGroup = AVAILABLE_GROUPS.find(g => g.id === selectedGroupId) || AVAILABLE_GROUPS[0];

  const resolveLevelGradeIdForGroup = (grp: { id: string; grade: string; name: string }): string => {
    if (grp.id === 'grp-pb-a') return 'primaria-1º';
    if (grp.id === 'grp-sec-a') return 'secundaria-2º';
    if (grp.id === 'grp-prep-a') return 'preparatoria-4ºSemestre';
    const norm = `${grp.grade || ''} ${grp.name || ''}`.toLowerCase();
    const numMatch = norm.match(/([1-6])/);
    const num = numMatch ? numMatch[1] : '4';
    if (norm.includes('sec')) return `secundaria-${Math.min(3, Number(num))}º`;
    if (norm.includes('prep') || norm.includes('bach') || norm.includes('cch') || /\b10[1-6]\b/.test(norm)) {
      return `preparatoria-${num}ºSemestre`;
    }
    return `primaria-${num}º`;
  };

  const handleAssign = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await assignStudioActivity({
        schoolId: activeSchoolId || undefined,
        groupId: selectedGroup.id,
        groupName: selectedGroup.name,
        levelGradeId: resolveLevelGradeIdForGroup(selectedGroup),
        subjectId: selectedGroup.subjectId,
        activityTitle: activity.title,
        activityDescription: activity.content_json?.description || activity.title,
        blocks: activity.content_json?.blocks || [],
        connections: activity.content_json?.connections || [],
        startNodeId: activity.content_json?.startNodeId || null,
        metadata: activity.content_json?.metadata || {},
        questions: activity.content_json?.questions || [],
        xpReward: xpReward,
        coinsReward: coinsReward,
        teacherName: activity.teacher_name
      });

      onSuccess(selectedGroup.name);
      onClose();
    } catch (err) {
      console.error('Error en asignación a la clase:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-4 pt-6 sm:pt-10 overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden my-auto sm:my-2">
        
        {/* Fondo sutil decorativo */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-36 h-36 bg-purple-500/10 rounded-full blur-2xl" />

        {/* Header del Modal */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest">
                Asignación en 1 Clic
              </span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Enviar Actividad a la Clase
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Cerrar modal de asignación"
            className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-500 dark:text-zinc-400 transition-all disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumen de la Actividad Seleccionada */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-1 relative z-10">
          <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase">Actividad de la Comunidad</span>
          <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
            {activity.title}
          </p>
          <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1">
            {activity.content_json?.questions?.length || 0} preguntas interactivas
          </p>
        </div>

        {/* Selección de Clase / Grupo Activo */}
        <div className="space-y-3 relative z-10">
          <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-500" />
            <span>Selecciona el Grupo / Aula Destino:</span>
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {AVAILABLE_GROUPS.map(group => {
              const isSelected = selectedGroupId === group.id;

              return (
                <div
                  key={group.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Seleccionar grupo ${group.name}`}
                  onClick={() => !isSubmitting && setSelectedGroupId(group.id)}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isSubmitting) {
                      e.preventDefault();
                      setSelectedGroupId(group.id);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-50/80 dark:bg-purple-950/40 border-purple-500 text-purple-900 dark:text-purple-100 shadow-sm'
                      : 'bg-white dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700/60 hover:border-purple-300 text-slate-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-black">{group.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">{group.subject}</p>
                  </div>

                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    isSelected ? 'bg-purple-600 text-white' : 'border border-slate-300 dark:border-zinc-600'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Configuración de Recompensas Gamificadas */}
        <div className="grid grid-cols-2 gap-3 pt-1 relative z-10">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-amber-500" /> Recompensa XP
            </span>
            <input aria-label="Cantidad numérica"
              type="number"
              value={xpReward}
              onChange={e => setXpReward(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full text-sm font-black bg-transparent text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
            />
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/60 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-yellow-500" /> Recompensa Monedas
            </span>
            <input aria-label="Cantidad numérica"
              type="number"
              value={coinsReward}
              onChange={e => setCoinsReward(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full text-sm font-black bg-transparent text-slate-900 dark:text-white focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        {/* Botón Masivo de Confirmación en 1 Clic */}
        <div className="pt-2 relative z-10">
          <button
            type="button"
            onClick={handleAssign}
            disabled={isSubmitting}
            aria-label="Enviar actividad a los alumnos del grupo"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-base shadow-xl shadow-purple-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Rocket className={`w-5 h-5 text-yellow-300 ${isSubmitting ? 'animate-spin' : 'animate-pulse'}`} />
            <span>{isSubmitting ? 'Asignando actividad...' : '🚀 Enviar a mis alumnos'}</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};

