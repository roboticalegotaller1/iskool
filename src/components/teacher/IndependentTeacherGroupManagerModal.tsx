"use client";

import React, { useState } from 'react';
import {
  Users,
  Plus,
  X,
  CheckCircle2,
  Trash2,
  GraduationCap,
  Sparkles,
  HelpCircle,
  Disc,
  Clock,
  Phone,
  UserCheck
} from 'lucide-react';
import { Group, DetailedStudent, UserProfile } from '@/types';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

interface IndependentTeacherGroupManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentTeacher: UserProfile;
  onOpenRuleta?: (groupId: string) => void;
  onTriggerToast?: (message: string) => void;
}

export const IndependentTeacherGroupManagerModal: React.FC<IndependentTeacherGroupManagerModalProps> = ({
  isOpen,
  onClose,
  currentTeacher,
  onOpenRuleta,
  onTriggerToast
}) => {
  const groupsList = useSchoolAdminStore(state => state.groupsList);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const createGroup = useSchoolAdminStore(state => state.createGroup);
  const registerStudent = useSchoolAdminStore(state => state.registerStudent);

  // Filtramos exclusivamente los grupos de este profesor
  const teacherGroups = React.useMemo(() => {
    return groupsList.filter(g => 
      g.teacher_id === currentTeacher.id || 
      (g.school_id === 'sch-profesores-independientes' && g.teacher_id === currentTeacher.id)
    );
  }, [groupsList, currentTeacher.id]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>(teacherGroups[0]?.id || '');

  // Alumnos del grupo seleccionado
  const groupStudents = React.useMemo(() => {
    if (!selectedGroupId) return [];
    return detailedStudents.filter(s => s.group_id === selectedGroupId && (s.teacher_id === currentTeacher.id || !s.teacher_id));
  }, [detailedStudents, selectedGroupId, currentTeacher.id]);

  // Formulario para Crear Nuevo Grupo
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    level: 'secundaria' as 'primaria' | 'secundaria' | 'preparatoria',
    grade: '3º'
  });

  // Formulario para Agregar Alumno
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    firstName: '',
    lastName: '',
    enrollmentId: '',
    tutorName: '',
    phone: ''
  });

  if (!isOpen) return null;

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupForm.name) return;

    const created = createGroup({
      name: newGroupForm.name,
      school_id: 'sch-profesores-independientes',
      teacher_id: currentTeacher.id,
      campus_id: 'cmp-indep-main',
      campus_name: 'Sede Digital de Docentes Autónomos',
      level_grade_id: `lg-${newGroupForm.level}-${newGroupForm.grade}`,
      academic_year_id: 'ay-2025-2026'
    });

    setSelectedGroupId(created.id);
    setIsCreatingGroup(false);
    setNewGroupForm({ name: '', level: 'secundaria', grade: '3º' });

    if (onTriggerToast) {
      onTriggerToast(`✓ Grupo "${newGroupForm.name}" creado exitosamente.`);
    }
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.firstName || !selectedGroupId) return;

    const currentGroup = teacherGroups.find(g => g.id === selectedGroupId);

    registerStudent({
      first_name: newStudentForm.firstName,
      last_name_1: newStudentForm.lastName || 'Alumno',
      birth_date: '2012-05-15',
      enrollment_id: newStudentForm.enrollmentId || `IND-${Date.now().toString().slice(-4)}`,
      gender: 'M',
      shift: 'matutino',
      status: 'activo',
      photo_url: '/images/students/default.png',
      school_id: 'sch-profesores-independientes',
      teacher_id: currentTeacher.id,
      group_id: selectedGroupId,
      level: (currentGroup?.level_grade_id?.includes('pri') ? 'primaria' : currentGroup?.level_grade_id?.includes('prep') ? 'preparatoria' : 'secundaria') as any,
      grade: '3º',
      campus_name: 'Sede Digital de Docentes Autónomos',
      gamification_enabled: false, // Regla: sin sección gamificada RPG de alumno, solo ruleta/asistencia/notas
      tutor_name: newStudentForm.tutorName,
      phone: newStudentForm.phone
    });

    setIsAddingStudent(false);
    setNewStudentForm({ firstName: '', lastName: '', enrollmentId: '', tutorName: '', phone: '' });

    if (onTriggerToast) {
      onTriggerToast(`✓ Alumno ${newStudentForm.firstName} ${newStudentForm.lastName} agregado al grupo.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* Encabezado */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                  Docente Autónomo
                </span>
                <span className="text-xs text-slate-400">
                  {currentTeacher.first_name} {currentTeacher.last_name}
                </span>
              </div>
              <h3 className="text-lg font-black text-white">
                Gestor Autónomo de Grupos y Alumnos
              </h3>
              <p className="text-xs text-slate-300">
                Crea tus grupos y listas de clase con aislamiento total de datos. Disponibles para toma de lista, calificaciones y ruleta de aula.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
          
          {/* Selector de Grupo y Botón Nuevo */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1 max-w-md">
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Grupo Seleccionado:</label>
              {teacherGroups.length > 0 ? (
                <select
                  value={selectedGroupId}
                  onChange={(e) => setSelectedGroupId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-500"
                >
                  {teacherGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              ) : (
                <div className="text-xs text-slate-400 italic">No tienes grupos creados aún. ¡Crea tu primer grupo!</div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCreatingGroup(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Plus size={14} />
                <span>+ Crear Nuevo Grupo</span>
              </button>

              {selectedGroupId && onOpenRuleta && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenRuleta(selectedGroupId);
                  }}
                  className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                  title="Abrir la Ruleta Interactiva para elegir alumno en clase"
                >
                  <Disc size={14} className="animate-spin-slow" />
                  <span>🎡 Girar Ruleta de Clase</span>
                </button>
              )}
            </div>
          </div>

          {/* Formulario Crear Grupo (Desplegable) */}
          {isCreatingGroup && (
            <div className="p-4 bg-white rounded-2xl border border-emerald-300 shadow-sm space-y-3 animate-in fade-in duration-100">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <span className="font-bold text-xs text-emerald-800">Crear Nuevo Grupo de Clase</span>
                <button onClick={() => setIsCreatingGroup(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleCreateGroup} className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Grupo *</label>
                  <input
                    type="text"
                    required
                    value={newGroupForm.name}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value })}
                    placeholder="ej. 3º A Secundaria - Matemáticas"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nivel Educativo</label>
                  <select
                    value={newGroupForm.level}
                    onChange={(e) => setNewGroupForm({ ...newGroupForm, level: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="preparatoria">Preparatoria</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="font-bold text-slate-700 block mb-1">Grado</label>
                    <input
                      type="text"
                      value={newGroupForm.grade}
                      onChange={(e) => setNewGroupForm({ ...newGroupForm, grade: e.target.value })}
                      placeholder="ej. 1º, 2º, 3º..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Lista de Alumnos del Grupo */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Alumnos Inscritos en este Grupo ({groupStudents.length})</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Los alumnos están registrados para toma de lista, calificaciones y la ruleta interactiva de clase.
                </p>
              </div>

              {selectedGroupId && (
                <button
                  onClick={() => setIsAddingStudent(true)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Plus size={14} />
                  <span>+ Agregar Alumno</span>
                </button>
              )}
            </div>

            {/* Formulario Agregar Alumno */}
            {isAddingStudent && (
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-200 space-y-3 animate-in fade-in duration-100 text-xs">
                <div className="flex justify-between items-center border-b border-indigo-100 pb-2">
                  <span className="font-bold text-indigo-900">Inscribir Alumno al Grupo</span>
                  <button onClick={() => setIsAddingStudent(false)} className="text-indigo-400 hover:text-indigo-600 cursor-pointer">
                    <X size={15} />
                  </button>
                </div>

                <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre(s) *</label>
                    <input
                      type="text"
                      required
                      value={newStudentForm.firstName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, firstName: e.target.value })}
                      placeholder="ej. Mateo"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={newStudentForm.lastName}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, lastName: e.target.value })}
                      placeholder="ej. Sandoval Rivas"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Matrícula / Folio</label>
                    <input
                      type="text"
                      value={newStudentForm.enrollmentId}
                      onChange={(e) => setNewStudentForm({ ...newStudentForm, enrollmentId: e.target.value })}
                      placeholder="ej. IND-2026-01"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                    >
                      Inscribir Alumno
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tabla de Alumnos */}
            {groupStudents.length > 0 ? (
              <div className="divide-y divide-slate-100 text-xs">
                {groupStudents.map((st, i) => (
                  <div key={st.id} className="py-2.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-slate-400 font-mono text-[11px]">{i + 1}.</span>
                      <div>
                        <span className="font-bold text-slate-900 block">{st.first_name} {st.last_name_1} {st.last_name_2 || ''}</span>
                        <span className="text-[11px] text-slate-400 font-mono">{st.enrollment_id}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        ✓ Ruleta & Asistencia
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 space-y-2">
                <Users size={28} className="mx-auto text-slate-300" />
                <p>No hay alumnos en este grupo aún. Haz clic en "+ Agregar Alumno".</p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Aislamiento por profesor: Tus grupos y alumnos son estrictamente privados.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
          >
            Cerrar Gestor
          </button>
        </div>

      </div>
    </div>
  );
};
