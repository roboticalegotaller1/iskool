// src/components/redisenos/TeacherPerspectiveModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Award, CheckCircle2, UserCheck, Star, Sparkles, MessageSquare } from 'lucide-react';
import { TEACHERS_BY_REDESIGN, TeacherProfile, StudentProfile, INITIAL_STUDENTS } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  redesignKey: string;
}

export function TeacherPerspectiveModal({ isOpen, onClose, redesignKey }: Props) {
  const teachers = TEACHERS_BY_REDESIGN.filter(t => t.redesignKey === redesignKey);
  const [selectedTeacherIndex, setSelectedTeacherIndex] = useState(0);
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile>(INITIAL_STUDENTS[0]);
  const [feedbackSent, setFeedbackSent] = useState(false);

  if (!isOpen) return null;

  const currentTeacher = teachers[selectedTeacherIndex] || teachers[0];

  const handleSendKudos = () => {
    gamificationAudio.playCoinSound();
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Perspectiva Docente · Colegio Montessori del Valle
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  2 Profesores Asignados
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Visualiza cómo el educador supervisa el progreso y las soluciones de los alumnos
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              gamificationAudio.playClickSound();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selector de Profesores */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-slate-800 bg-slate-950/40">
          <span className="text-xs font-semibold text-slate-400">Profesor Activo:</span>
          {teachers.map((t, idx) => (
            <button
              key={t.id}
              onClick={() => {
                gamificationAudio.playClickSound();
                setSelectedTeacherIndex(idx);
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedTeacherIndex === idx
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-800/70 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.avatar}</span>
              <span>{t.name}</span>
              <span className="text-[10px] opacity-75">({t.subject})</span>
            </button>
          ))}
        </div>

        {/* Contenido Principal */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Card del Profesor */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-900/50 border border-indigo-700/60 flex items-center justify-center text-2xl">
                {currentTeacher.avatar}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">{currentTeacher.name}</h3>
                <p className="text-xs text-indigo-300">{currentTeacher.role} · CCT: {currentTeacher.schoolCct}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Asignatura: <strong className="text-slate-200">{currentTeacher.subject}</strong></p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                Alumnos en grupo: <strong className="text-white">{currentTeacher.activeStudentsCount}</strong>
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                Tareas evaluadas: <strong className="text-emerald-400">{currentTeacher.tasksAssignedCount}</strong>
              </div>
            </div>
          </div>

          {/* Supervisor de Alumnos en Vivo */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Alumnos en Seguimiento Bimestral
              </h4>
              <span className="text-xs text-slate-400">Haz clic en un alumno para revisar su solución y rúbrica</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
              {INITIAL_STUDENTS.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    setSelectedStudent(s);
                  }}
                  className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    selectedStudent.id === s.id
                      ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={s.avatarImage} alt={s.name} className="w-10 h-10 rounded-xl object-cover border border-slate-700" />
                  <div className="text-xs">
                    <span className="font-bold text-white block">{s.name}</span>
                    <span className="text-slate-400 text-[11px]">{s.grade}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detalle de Solución y Evaluación del Alumno Seleccionado */}
            <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-white text-sm flex items-center gap-2">
                    Expediente Académico: {selectedStudent.name}
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">
                      {selectedStudent.levelTitle}
                    </span>
                  </h5>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Precisión general: <strong className="text-emerald-400">{selectedStudent.stats.accuracyRate}%</strong> · 
                    Tareas completadas: <strong className="text-white">{selectedStudent.stats.tasksCompleted}</strong> · 
                    Racha actual: <strong className="text-amber-300">{selectedStudent.streakDays} días</strong>
                  </p>
                </div>

                <button
                  onClick={handleSendKudos}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  Otorgar Medalla Docente (+50 Monedas)
                </button>
              </div>

              {feedbackSent && (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ¡Felicitación docente y 50 monedas enviadas a {selectedStudent.name} con éxito!
                </div>
              )}

              {/* Rúbrica Analítica NEM 2024 */}
              <div className="border-t border-slate-800 pt-3">
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  Rúbrica Oficial de Evaluación Formativa (SEP NEM 2024):
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Pensamiento Crítico y Lógica</span>
                    <span className="text-emerald-400 font-bold">Nivel 4: Sobresaliente (10/10)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Autonomía y Entregas a Tiempo</span>
                    <span className="text-emerald-400 font-bold">Nivel 4: Consistente (9.8/10)</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Colaboración en Comunidad</span>
                    <span className="text-purple-300 font-bold">Nivel 3: Destacado (9.5/10)</span>
                  </div>
                </div>
              </div>

              {/* Comentarios del Profesor */}
              <div className="border-t border-slate-800 pt-3 flex items-start gap-2 text-xs text-slate-300">
                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p className="italic">
                  "El alumno muestra un dominio excepcional al resolver reactivos mediante retos gamificados. Las dinámicas de combate didáctico y resolución de problemas han incrementado su tiempo de lectura en un 40% este ciclo."
                </p>
              </div>

            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Colegio Montessori del Valle · Supervisión Pedagógica Oficial</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar Vista
          </button>
        </div>

      </div>
    </div>
  );
}
