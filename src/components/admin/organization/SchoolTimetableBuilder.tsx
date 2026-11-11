"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  AlertTriangle,
  Settings2,
  Trash2,
  Building2,
  Clock,
  GripVertical,
} from 'lucide-react';
import {
  CampusScheduleConfig,
  SchoolOrganizationGraph,
  WeekdayKey,
  WorkDaysMode,
  generateTimetableSlots,
  getFullNameOfNode,
  getWorkdaysArray,
} from '@/lib/services/organizationService';

interface CampusItem {
  id: string;
  name: string;
}

interface DraggableSubjectTeacherBlock {
  key: string;
  teacherNodeId: string;
  teacherFullName: string;
  subjectId: string;
  subjectName: string;
  contourColor: string;
  campusId: string;
}

interface SchoolTimetableBuilderProps {
  graph: SchoolOrganizationGraph;
  campuses: CampusItem[];
  forcePromptConditionsForCampusId?: string | null;
  onClearForcePrompt?: () => void;
  onSaveCampusConditions: (config: Omit<CampusScheduleConfig, 'updatedAt'>) => void;
  onSelectActiveCampus: (campusId: string) => void;
  onPlaceBlock: (params: {
    campusId: string;
    day: WeekdayKey;
    slotIndex: number;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    teacherNodeId: string;
    subjectId: string;
    subjectName: string;
    contourColor: string;
  }) => { success: boolean; conflictMessage?: string };
  onRemovePlacement: (placementId: string) => void;
}

export function SchoolTimetableBuilder({
  graph,
  campuses,
  forcePromptConditionsForCampusId,
  onClearForcePrompt,
  onSaveCampusConditions,
  onSelectActiveCampus,
  onPlaceBlock,
  onRemovePlacement,
}: SchoolTimetableBuilderProps) {
  const activeCampusId =
    graph.activeCampusIdForTimetable ||
    Object.keys(graph.campusSchedules)[0] ||
    campuses[0]?.id ||
    'cmp-test-pri';

  const currentConfig = graph.campusSchedules[activeCampusId];

  const [isPromptOpen, setIsPromptOpen] = useState<boolean>(!currentConfig);
  const [formCampusId, setFormCampusId] = useState<string>(activeCampusId);
  const [formDuration, setFormDuration] = useState<number>(
    currentConfig?.blockDurationMinutes || 50
  );
  const [formEntryTime, setFormEntryTime] = useState<string>(
    currentConfig?.entryTime || '07:30'
  );
  const [formExitTime, setFormExitTime] = useState<string>(
    currentConfig?.exitTime || '14:30'
  );
  const [formWorkDays, setFormWorkDays] = useState<WorkDaysMode>(
    currentConfig?.workDays || 'lun_vie'
  );

  const [selectedBlockForClick, setSelectedBlockForClick] =
    useState<DraggableSubjectTeacherBlock | null>(null);
  const [draggedBlock, setDraggedBlock] =
    useState<DraggableSubjectTeacherBlock | null>(null);
  const [conflictBanner, setConflictBanner] = useState<string | null>(null);

  // Si cambia de sede o es primera vez, volver a preguntar las condiciones necesarias para generar el horario
  useEffect(() => {
    if (forcePromptConditionsForCampusId) {
      const existing = graph.campusSchedules[forcePromptConditionsForCampusId];
      setFormCampusId(forcePromptConditionsForCampusId);
      setFormDuration(existing?.blockDurationMinutes || 50);
      setFormEntryTime(existing?.entryTime || '07:30');
      setFormExitTime(existing?.exitTime || '14:30');
      setFormWorkDays(existing?.workDays || 'lun_vie');
      setIsPromptOpen(true);
      onClearForcePrompt?.();
    } else if (!graph.campusSchedules[activeCampusId]) {
      setFormCampusId(activeCampusId);
      setIsPromptOpen(true);
    }
  }, [forcePromptConditionsForCampusId, activeCampusId, graph.campusSchedules, onClearForcePrompt]);

  const handleCampusSelectorChange = (nextCampusId: string) => {
    onSelectActiveCampus(nextCampusId);
    const existing = graph.campusSchedules[nextCampusId];
    setFormCampusId(nextCampusId);
    setFormDuration(existing?.blockDurationMinutes || 50);
    setFormEntryTime(existing?.entryTime || '07:30');
    setFormExitTime(existing?.exitTime || '14:30');
    setFormWorkDays(existing?.workDays || 'lun_vie');
    // Regla Página 4: "En el caso del horario cuando ya este creado si cambia de sede se vuelven a preguntar las condiciones necesarias para generar el horario"
    setIsPromptOpen(true);
  };

  const handleSubmitConditions = (e: React.FormEvent) => {
    e.preventDefault();
    const campusName =
      campuses.find((c) => c.id === formCampusId)?.name || 'Plantel Laboratorio';
    onSaveCampusConditions({
      campusId: formCampusId,
      campusName,
      blockDurationMinutes: Math.max(15, Math.min(240, Number(formDuration) || 50)),
      entryTime: formEntryTime || '07:30',
      exitTime: formExitTime || '14:30',
      workDays: formWorkDays,
    });
    setIsPromptOpen(false);
  };

  // Agrupar todos los bloques de profesores por Materia (conforme se agregan profesores al colegio aparecen agrupados por materia)
  const groupedBlocksBySubject = useMemo(() => {
    const map = new Map<
      string,
      {
        subjectName: string;
        contourColor: string;
        items: DraggableSubjectTeacherBlock[];
      }
    >();

    const teacherNodes = graph.nodes.filter(
      (n) => n.category === 'profesor' && n.isProvisioned
    );

    for (const teacher of teacherNodes) {
      const fullName = getFullNameOfNode(teacher);
      const validSubjects =
        teacher.subjects.filter((s) => s.subjectName.trim().length > 0).length > 0
          ? teacher.subjects.filter((s) => s.subjectName.trim().length > 0)
          : [
              {
                id: `${teacher.nodeId}-general`,
                subjectName: 'Materia General',
                contourColor: '#1D68FF',
                teachAnother: false,
              },
            ];

      for (const subj of validSubjects) {
        const cleanKey = subj.subjectName.trim().toLowerCase();
        if (!map.has(cleanKey)) {
          map.set(cleanKey, {
            subjectName: subj.subjectName.trim(),
            contourColor: subj.contourColor,
            items: [],
          });
        }
        map.get(cleanKey)!.items.push({
          key: `${teacher.nodeId}::${subj.id}`,
          teacherNodeId: teacher.nodeId,
          teacherFullName: fullName,
          subjectId: subj.id,
          subjectName: subj.subjectName.trim(),
          contourColor: subj.contourColor,
          campusId: teacher.campusId,
        });
      }
    }

    return Array.from(map.values());
  }, [graph.nodes]);

  const effectiveConfig: CampusScheduleConfig = currentConfig || {
    campusId: activeCampusId,
    campusName: campuses.find((c) => c.id === activeCampusId)?.name || 'Plantel Central',
    blockDurationMinutes: formDuration || 50,
    entryTime: formEntryTime || '07:30',
    exitTime: formExitTime || '14:30',
    workDays: formWorkDays,
    updatedAt: new Date().toISOString(),
  };

  const workDays = useMemo(
    () => getWorkdaysArray(effectiveConfig.workDays),
    [effectiveConfig.workDays]
  );

  const slots = useMemo(
    () => generateTimetableSlots(effectiveConfig),
    [effectiveConfig]
  );

  const campusPlacements = useMemo(
    () => graph.timetablePlacements.filter((p) => p.campusId === activeCampusId),
    [graph.timetablePlacements, activeCampusId]
  );

  const executeCellDrop = (
    block: DraggableSubjectTeacherBlock,
    day: WeekdayKey,
    slotIndex: number,
    startTime: string,
    endTime: string,
    durationMinutes: number
  ) => {
    setConflictBanner(null);
    const result = onPlaceBlock({
      campusId: activeCampusId,
      day,
      slotIndex,
      startTime,
      endTime,
      durationMinutes,
      teacherNodeId: block.teacherNodeId,
      subjectId: block.subjectId,
      subjectName: block.subjectName,
      contourColor: block.contourColor,
    });
    if (!result.success && result.conflictMessage) {
      setConflictBanner(result.conflictMessage);
    }
  };

  return (
    <div data-testid="org-school-timetable-view" className="space-y-4">
      {/* Barra Superior de Parámetros del Horario por Sede */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600" />
            <span className="text-xs font-bold text-slate-600">Plantel:</span>
            <select
              data-testid="timetable-campus-selector"
              value={activeCampusId}
              onChange={(e) => handleCampusSelectorChange(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 cursor-pointer"
            >
              {campuses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
            <Clock className="h-3.5 w-3.5 text-blue-600" />
            <span>
              Bloques de <strong>{effectiveConfig.blockDurationMinutes} min</strong>
            </span>
            <span>·</span>
            <span>
              <strong>{effectiveConfig.entryTime}</strong> a{' '}
              <strong>{effectiveConfig.exitTime}</strong>
            </span>
            <span>·</span>
            <span>
              <strong>
                {effectiveConfig.workDays === 'lun_sab'
                  ? 'Lunes - Sábado'
                  : 'Lunes - Viernes'}
              </strong>
            </span>
          </div>

          <button
            type="button"
            data-testid="timetable-reconfigure-conditions-btn"
            onClick={() => {
              setFormCampusId(activeCampusId);
              setFormDuration(effectiveConfig.blockDurationMinutes);
              setFormEntryTime(effectiveConfig.entryTime);
              setFormExitTime(effectiveConfig.exitTime);
              setFormWorkDays(effectiveConfig.workDays);
              setIsPromptOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="h-3.5 w-3.5 text-slate-500" />
            <span>Condiciones del Horario</span>
          </button>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
          <span>
            Nómina Docente Sincronizada · {campusPlacements.length} bloques activos
          </span>
        </div>
      </div>

      {conflictBanner && (
        <div
          data-testid="timetable-conflict-alert"
          className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 flex items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            <span>Choque de horario prevenido: {conflictBanner}</span>
          </span>
          <button
            type="button"
            onClick={() => setConflictBanner(null)}
            className="text-amber-700 hover:text-amber-950 px-2 py-0.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Cuerpo Principal: Izquierda Bloques Agrupados por Materia | Derecha Calendario Semanal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Panel Izquierdo: Bloques por Materia + Nombre del Profesor debajo */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 max-h-[68vh] overflow-y-auto">
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Bloques por Materia
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Arrastra un bloque al calendario o haz clic en él y luego en la hora deseada.
            </p>
          </div>

          {groupedBlocksBySubject.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Agrega y configura al menos una cuenta de <strong>Profesor</strong> con sus materias para ver sus bloques aquí.
            </div>
          ) : (
            <div className="space-y-3.5">
              {groupedBlocksBySubject.map((group) => (
                <div key={group.subjectName} className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-slate-600 uppercase tracking-wide">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: group.contourColor }}
                    />
                    <span className="truncate">{group.subjectName}</span>
                  </div>

                  <div className="space-y-2">
                    {group.items.map((block) => {
                      const isSelected = selectedBlockForClick?.key === block.key;
                      return (
                        <div
                          key={block.key}
                          data-testid={`draggable-subject-block-${block.subjectName}`}
                          draggable
                          onDragStart={(e) => {
                            setDraggedBlock(block);
                            e.dataTransfer.setData('text/plain', block.key);
                          }}
                          onDragEnd={() => setDraggedBlock(null)}
                          onClick={() =>
                            setSelectedBlockForClick((prev) =>
                              prev?.key === block.key ? null : block
                            )
                          }
                          style={{
                            borderColor: block.contourColor,
                            boxShadow: isSelected
                              ? `0 0 0 2px ${block.contourColor}`
                              : `inset 4px 0 0 0 ${block.contourColor}`,
                          }}
                          className="p-3 rounded-xl bg-white border-2 hover:bg-slate-50/80 transition-all cursor-grab active:cursor-grabbing select-none flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-black text-slate-900 truncate">
                              {block.subjectName}
                            </div>
                            <div className="text-[11px] font-medium text-slate-600 truncate mt-0.5">
                              {block.teacherFullName}
                            </div>
                          </div>
                          <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cuadrícula Semanal Dividida en Bloques */}
        <div className="lg:col-span-9 bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse text-left min-w-[620px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-3 px-2.5 text-[11px] font-black uppercase text-slate-500 w-20 border-r border-slate-200">
                    Bloque
                  </th>
                  {workDays.map((day) => (
                    <th
                      key={day}
                      className="py-3 px-3 text-xs font-black text-slate-800 text-center border-r last:border-r-0 border-slate-200"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {slots.map((slot) => (
                  <tr key={slot.slotIndex} className="hover:bg-slate-50/40">
                    <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-slate-600 bg-slate-50/60 border-r border-slate-200 whitespace-nowrap">
                      <div>{slot.startTime}</div>
                      <div className="text-[10px] text-slate-400">{slot.endTime}</div>
                    </td>
                    {workDays.map((day) => {
                      const placed = campusPlacements.find(
                        (p) => p.day === day && p.slotIndex === slot.slotIndex
                      );
                      return (
                        <td
                          key={`${day}-${slot.slotIndex}`}
                          data-testid={`timetable-cell-${day}-${slot.slotIndex}`}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            if (draggedBlock) {
                              executeCellDrop(
                                draggedBlock,
                                day,
                                slot.slotIndex,
                                slot.startTime,
                                slot.endTime,
                                slot.durationMinutes
                              );
                            }
                          }}
                          onClick={() => {
                            if (selectedBlockForClick) {
                              executeCellDrop(
                                selectedBlockForClick,
                                day,
                                slot.slotIndex,
                                slot.startTime,
                                slot.endTime,
                                slot.durationMinutes
                              );
                            }
                          }}
                          className={`p-1.5 border-r last:border-r-0 border-slate-100 align-top h-16 transition-colors ${
                            selectedBlockForClick
                              ? 'hover:bg-blue-50/50 cursor-pointer'
                              : ''
                          }`}
                        >
                          {placed ? (
                            <div
                              style={{
                                borderColor: placed.contourColor,
                                boxShadow: `inset 4px 0 0 0 ${placed.contourColor}`,
                              }}
                              className="h-full p-2 rounded-xl bg-white border-2 shadow-2xs flex items-start justify-between gap-1 group"
                            >
                              <div className="min-w-0">
                                <div className="text-[11px] font-black text-slate-900 truncate">
                                  {placed.subjectName}
                                </div>
                                <div className="text-[10px] font-medium text-slate-600 truncate">
                                  {placed.teacherFullName}
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onRemovePlacement(placed.id);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                                title="Quitar bloque"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          ) : (
                            <div className="h-full rounded-xl border border-dashed border-transparent hover:border-slate-200 flex items-center justify-center text-[10px] text-slate-300">
                              {selectedBlockForClick ? '+ Asignar' : ''}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Condiciones del Horario (Primera vez o al cambiar de sede/plantel) */}
      {isPromptOpen && (
        <div
          data-testid="campus-schedule-conditions-modal"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <form
            onSubmit={handleSubmitConditions}
            className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 text-slate-800"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  Condiciones para Generar el Horario Escolar
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configura plantel, bloques, entrada, salida y días laborales.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Plantel / Sede
                </label>
                <select
                  data-testid="conditions-campus-select"
                  value={formCampusId}
                  onChange={(e) => setFormCampusId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
                >
                  {campuses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Duración de los bloques (en minutos)
                </label>
                <input
                  type="number"
                  data-testid="conditions-duration-input"
                  min={15}
                  max={180}
                  step={5}
                  value={formDuration}
                  onChange={(e) => setFormDuration(Number(e.target.value) || 50)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Horario de entrada
                  </label>
                  <input
                    type="time"
                    data-testid="conditions-entry-input"
                    value={formEntryTime}
                    onChange={(e) => setFormEntryTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Horario de salida
                  </label>
                  <input
                    type="time"
                    data-testid="conditions-exit-input"
                    value={formExitTime}
                    onChange={(e) => setFormExitTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Días laborales
                </label>
                <select
                  data-testid="conditions-workdays-select"
                  value={formWorkDays}
                  onChange={(e) => setFormWorkDays(e.target.value as WorkDaysMode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-900"
                >
                  <option value="lun_vie">Lunes - Viernes</option>
                  <option value="lun_sab">Lunes - Sábado</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              {currentConfig && (
                <button
                  type="button"
                  onClick={() => setIsPromptOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                data-testid="conditions-generate-timetable-btn"
                className="px-4 py-2 rounded-xl bg-[#1D68FF] hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Generar Calendario por Bloques
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

