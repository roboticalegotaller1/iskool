"use client";

import React, { useState, useMemo } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Zap,
  TrendingUp,
  ShieldCheck,
  Search,
  Plus,
  X,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Sliders,
  ExternalLink,
  ChevronRight,
  Filter,
  FileText,
  Clock,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  UserCheck,
  Key,
  FolderGit2,
  Activity,
  Cpu,
  RefreshCw,
  Eye,
  LogOut
} from 'lucide-react';
import { UserProfile, Group, DetailedStudent, Institution } from '@/types';
import { SchoolDigitalBook } from '@/types/schoolBooks';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useSchoolBooksStore } from '@/store/useSchoolBooksStore';

interface IndependentTeachersSuperUserStudioProps {
  isOpen: boolean;
  onClose: () => void;
  onImpersonateTeacher?: (teacher: UserProfile) => void;
  onTriggerToast?: (message: string) => void;
}

export const IndependentTeachersSuperUserStudio: React.FC<IndependentTeachersSuperUserStudioProps> = ({
  isOpen,
  onClose,
  onImpersonateTeacher,
  onTriggerToast
}) => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'teachers' | 'books' | 'audit'>('metrics');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSpecialty, setFilterSpecialty] = useState('all');

  // Stores
  const teachersList = useSchoolAdminStore(state => state.teachersList);
  const groupsList = useSchoolAdminStore(state => state.groupsList);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const registerTeacher = useSchoolAdminStore(state => state.registerTeacher);
  const allBooks = useSchoolBooksStore(state => state.books);

  // Filtrado de profesores independientes
  const independentTeachers = useMemo(() => {
    return teachersList.filter(t => 
      t.school_id === 'sch-profesores-independientes' || 
      t.is_independent_teacher === true ||
      t.id.startsWith('usr-indep-')
    );
  }, [teachersList]);

  // Libros aportados por profesores independientes
  const independentBooks = useMemo(() => {
    return allBooks.filter(b => 
      b.schoolId === 'sch-profesores-independientes' ||
      independentTeachers.some(t => t.id === b.subidoPor || t.email === b.subidoPor)
    );
  }, [allBooks, independentTeachers]);

  // Alumnos y grupos de profesores independientes
  const independentGroups = useMemo(() => {
    return groupsList.filter(g => 
      g.school_id === 'sch-profesores-independientes' ||
      independentTeachers.some(t => t.id === g.teacher_id)
    );
  }, [groupsList, independentTeachers]);

  const independentStudents = useMemo(() => {
    return detailedStudents.filter(s => 
      s.school_id === 'sch-profesores-independientes' ||
      independentTeachers.some(t => t.id === s.teacher_id) ||
      independentGroups.some(g => g.id === s.group_id)
    );
  }, [detailedStudents, independentTeachers, independentGroups]);

  // Métricas agregadas
  const totalTokensConsumed = useMemo(() => {
    return independentTeachers.reduce((acc, t) => acc + (t.ai_tokens_consumed || 0), 0);
  }, [independentTeachers]);

  const totalTokenQuota = useMemo(() => {
    return independentTeachers.reduce((acc, t) => acc + (t.token_quota || 100000), 0);
  }, [independentTeachers]);

  // Modal para Crear Nuevo Profesor Independiente
  const [isCreateTeacherOpen, setIsCreateTeacherOpen] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    specialty: 'Matemáticas & Ciencias Exactas',
    tokenQuota: 100000,
    password: Math.random().toString(36).substring(2, 8).toUpperCase(),
    phone: '55-1234-5678'
  });

  // Modal para Ajustar Cuota de Tokens
  const [editingQuotaTeacher, setEditingQuotaTeacher] = useState<UserProfile | null>(null);
  const [newQuotaValue, setNewQuotaValue] = useState<number>(100000);

  if (!isOpen) return null;

  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.firstName || !newTeacherForm.email) return;

    const newTeacherId = `usr-indep-${Date.now()}`;
    registerTeacher({
      first_name: newTeacherForm.firstName,
      last_name: newTeacherForm.lastName,
      email: newTeacherForm.email,
      phone: newTeacherForm.phone,
      school_id: 'sch-profesores-independientes',
      campus_id: 'cmp-indep-main',
      campus_name: 'Sede Digital de Docentes Autónomos',
      ai_tokens_consumed: 0,
      token_quota: Number(newTeacherForm.tokenQuota),
      is_independent_teacher: true,
      specialty: newTeacherForm.specialty,
      temporary_password: newTeacherForm.password,
      is_blocked: false,
      assigned_subjects: [newTeacherForm.specialty],
      assigned_groups: []
    });

    setIsCreateTeacherOpen(false);
    setNewTeacherForm({
      firstName: '',
      lastName: '',
      email: '',
      specialty: 'Matemáticas & Ciencias Exactas',
      tokenQuota: 100000,
      password: Math.random().toString(36).substring(2, 8).toUpperCase(),
      phone: '55-1234-5678'
    });

    if (onTriggerToast) {
      onTriggerToast(`✓ Cuenta creada exitosamente para Prof(a). ${newTeacherForm.firstName} ${newTeacherForm.lastName}. Cuota: ${newTeacherForm.tokenQuota.toLocaleString()} tokens.`);
    }
  };

  const handleToggleBlockTeacher = (teacher: UserProfile) => {
    const updatedStatus = !teacher.is_blocked;
    useSchoolAdminStore.setState(state => ({
      teachersList: state.teachersList.map(t => 
        t.id === teacher.id ? { ...t, is_blocked: updatedStatus } : t
      )
    }));

    if (onTriggerToast) {
      onTriggerToast(`${updatedStatus ? '🔒 Cuenta pausada' : '✓ Cuenta reactivada'} para ${teacher.first_name} ${teacher.last_name}`);
    }
  };

  const handleSaveQuota = () => {
    if (!editingQuotaTeacher) return;
    useSchoolAdminStore.setState(state => ({
      teachersList: state.teachersList.map(t => 
        t.id === editingQuotaTeacher.id ? { ...t, token_quota: newQuotaValue } : t
      )
    }));
    if (onTriggerToast) {
      onTriggerToast(`✓ Cuota de tokens actualizada a ${newQuotaValue.toLocaleString()} para ${editingQuotaTeacher.first_name} ${editingQuotaTeacher.last_name}`);
    }
    setEditingQuotaTeacher(null);
  };

  const handleImpersonate = (teacher: UserProfile) => {
    if (onImpersonateTeacher) {
      onImpersonateTeacher(teacher);
    } else {
      useSchoolAdminStore.setState({ activeSchoolId: 'sch-profesores-independientes' });
      window.location.href = `/teacher?impersonate=${teacher.id}`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-slate-900">
        
        {/* ========================================================= */}
        {/* 1. ENCABEZADO SUPER USUARIO                               */}
        {/* ========================================================= */}
        <div className="p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white border-b border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
                <GraduationCap size={28} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/60">
                    Módulo Exclusivo Super Usuario
                  </span>
                  <span className="text-[10px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-800/60">
                    Aislamiento Multi-Tenant Estricto
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  Profesores Independientes
                  <span className="text-xs font-mono font-normal text-slate-400">
                    (DOC-INDEP-2026)
                  </span>
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Supervisión global de docentes autónomos, control de cuotas de tokens, auditoría de materiales y persistencia en la Bóveda Curricular.
                </p>
              </div>
            </div>

            {/* Quick Actions Header */}
            <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
              <button
                onClick={() => setIsCreateTeacherOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <Plus size={15} />
                <span>+ Crear Cuenta Docente</span>
              </button>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar consola"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* KPI Mini Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-4 border-t border-slate-800 text-center text-xs">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Docentes Activos</span>
              <span className="text-lg font-black text-emerald-400 font-mono">{independentTeachers.length}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Grupos Registrados</span>
              <span className="text-lg font-black text-white font-mono">{independentGroups.length}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Alumnos en Seguimiento</span>
              <span className="text-lg font-black text-blue-400 font-mono">{independentStudents.length}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Libros en Bóveda</span>
              <span className="text-lg font-black text-amber-400 font-mono">{independentBooks.length}</span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tokens Consumidos</span>
              <span className="text-lg font-black text-purple-400 font-mono">{(totalTokensConsumed / 1000).toFixed(1)}k</span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. PESTAÑAS DE NAVEGACIÓN                                 */}
        {/* ========================================================= */}
        <div className="bg-slate-100/90 border-b border-slate-200 px-6 py-2 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto py-1">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'metrics'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={14} />
              <span>1. Métricas & Consumo de Tokens</span>
            </button>

            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'teachers'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>2. Directorio de Profesores ({independentTeachers.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('books')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'books'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen size={14} />
              <span>3. Bóveda Curricular & Libros Aportados ({independentBooks.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'audit'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu size={14} />
              <span>4. Bitácora de Auditoría en Vivo</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 font-medium shrink-0">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Aislamiento por Docente Garantizado</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CONTENIDO PRINCIPAL SCROLLEABLE                        */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60">

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 1: MÉTRICAS & CONSUMO DE TOKENS IA              */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'metrics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Tarjeta de Monitoreo de Tokens IA */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200">
                      <Zap size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-slate-900">
                        Monitoreo Exhaustivo de Tokens de Inteligencia Artificial Pedagógica
                      </h3>
                      <p className="text-xs text-slate-500">
                        Supervisión en tiempo real del uso de IA para planeaciones, análisis de libros y rúbricas.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200 self-start sm:self-auto">
                    {totalTokensConsumed.toLocaleString()} / {totalTokenQuota.toLocaleString()} Tokens Usados ({((totalTokensConsumed / (totalTokenQuota || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>

                {/* Barra de Progreso Global */}
                <div className="space-y-1.5">
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/80">
                    <div 
                      className="h-full bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (totalTokensConsumed / (totalTokenQuota || 1)) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>0 Tokens</span>
                    <span>50%</span>
                    <span>Tope Red: {totalTokenQuota.toLocaleString()} Tokens</span>
                  </div>
                </div>

                {/* Grid de Desglose por Docente */}
                <div className="pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-3">
                    Consumo Individual por Profesor Autónomo
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {independentTeachers.map((t) => {
                      const consumed = t.ai_tokens_consumed || 0;
                      const quota = t.token_quota || 100000;
                      const pct = Math.min(100, Math.round((consumed / quota) * 100));

                      return (
                        <div key={t.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-slate-900 truncate">{t.first_name} {t.last_name}</span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                              {pct}%
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">{t.specialty || 'Docente General'}</div>
                          
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${pct > 80 ? 'bg-amber-500' : 'bg-indigo-600'}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>

                          <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                            <span>{consumed.toLocaleString()} usad.</span>
                            <span>{quota.toLocaleString()} max</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Filosofía del Módulo y Retorno para la Bóveda */}
              <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white border border-emerald-800/40 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                  <Sparkles size={16} />
                  <span>Estrategia de Enriquecimiento Curricular (Flywheel Pedagógico)</span>
                </div>
                <h4 className="text-base font-black text-white">
                  ¿Por qué otorgamos servicio de primer nivel a Profesores Independientes?
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Los profesores autónomos nutren activamente la <strong>Bóveda Curricular</strong> de ISkool con nuevos libros de texto, materiales de lectura y planeaciones didácticas de aula alineadas a la SEP NEM 2024. A cambio, reciben herramientas de aula de nivel internacional (asistencia, calificaciones, planeación y ruleta interactiva de participación) sin acceso al motor de administración ni gastos superfluos de gamificación estudiantil.
                </p>
              </div>

            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 2: DIRECTORIO DE PROFESORES INDEPENDIENTES      */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'teachers' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Buscador y Controles */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, correo o especialidad..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCreateTeacherOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <Plus size={14} />
                    <span>Nuevo Docente</span>
                  </button>
                </div>
              </div>

              {/* Lista de Profesores */}
              <div className="grid grid-cols-1 gap-3">
                {independentTeachers
                  .filter(t => {
                    const matchSearch = searchQuery === '' ||
                      `${t.first_name} ${t.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (t.specialty || '').toLowerCase().includes(searchQuery.toLowerCase());
                    return matchSearch;
                  })
                  .map((teacher) => {
                    const teacherGroups = independentGroups.filter(g => g.teacher_id === teacher.id);
                    const teacherStudents = independentStudents.filter(s => s.teacher_id === teacher.id || teacherGroups.some(g => g.id === s.group_id));
                    const teacherBooks = independentBooks.filter(b => b.subidoPor === teacher.id || b.subidoPor === teacher.email);
                    const isBlocked = teacher.is_blocked;
                    const consumed = teacher.ai_tokens_consumed || 0;
                    const quota = teacher.token_quota || 100000;

                    return (
                      <div
                        key={teacher.id}
                        className={`p-5 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                          isBlocked 
                            ? 'bg-rose-50/40 border-rose-200' 
                            : 'bg-white border-slate-200/90 hover:border-indigo-300'
                        }`}
                      >
                        {/* Info Principal */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">
                              {teacher.first_name} {teacher.last_name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                              {teacher.specialty || 'Docente Autónomo'}
                            </span>
                            {isBlocked ? (
                              <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 font-bold text-[10px] flex items-center gap-1">
                                <Lock size={11} /> Pausado
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                                <CheckCircle2 size={11} /> Activo
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>📧 {teacher.email}</span>
                            <span>🔑 Clave: <code className="font-mono bg-slate-100 px-1 rounded text-slate-800">{teacher.temporary_password || '008805'}</code></span>
                            <span>📅 Alta: {new Date(teacher.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Estadísticas de Aula y Bóveda */}
                          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                              👥 {teacherGroups.length} Grupos Creados
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold">
                              🎒 {teacherStudents.length} Alumnos en Lista
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                              📚 {teacherBooks.length} Libros en Bóveda
                            </span>
                            <span className="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 font-semibold font-mono border border-purple-200">
                              ⚡ {consumed.toLocaleString()} / {quota.toLocaleString()} Tokens
                            </span>
                          </div>
                        </div>

                        {/* Botones de Acción para Super Usuario */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                          {/* Botón Impersonar / Entrar al Aula */}
                          <button
                            onClick={() => handleImpersonate(teacher)}
                            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                            title="Entrar al panel docente con la vista y aislamiento de este profesor"
                          >
                            <Eye size={14} />
                            <span>Entrar al Aula</span>
                          </button>

                          {/* Ajustar Cuota de Tokens */}
                          <button
                            onClick={() => {
                              setEditingQuotaTeacher(teacher);
                              setNewQuotaValue(teacher.token_quota || 100000);
                            }}
                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
                            title="Modificar cuota de tokens IA"
                          >
                            <Sliders size={13} />
                            <span>Cuota Tokens</span>
                          </button>

                          {/* Pausar / Reactivar */}
                          <button
                            onClick={() => handleToggleBlockTeacher(teacher)}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                              isBlocked
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            }`}
                            title={isBlocked ? 'Reactivar cuenta' : 'Pausar cuenta temporalmente'}
                          >
                            {isBlocked ? <Unlock size={15} /> : <Lock size={15} />}
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>

            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 3: BÓVEDA CURRICULAR & LIBROS APORTADOS         */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'books' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <BookOpen size={18} className="text-amber-600" />
                    <span>Materiales Aportados a la Bóveda Curricular Central</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Libros de texto, antologías y planeaciones didácticas subidas por docentes independientes.
                  </p>
                </div>

                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 self-start sm:self-auto">
                  {independentBooks.length} Libros Catalogados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {independentBooks.map((book) => {
                  const authorTeacher = independentTeachers.find(t => t.id === book.subidoPor || t.email === book.subidoPor);

                  return (
                    <div key={book.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 hover:border-amber-300 transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-16 rounded-xl bg-gradient-to-br ${book.portadaColor || 'from-indigo-600 to-purple-800'} text-white flex items-center justify-center font-bold text-xs shadow-sm shrink-0 text-center p-1`}>
                            📖
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {book.faseNEM} · {book.grado}
                            </span>
                            <h4 className="text-sm font-black text-slate-900 mt-1 line-clamp-1">
                              {book.titulo}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {book.materia} • {book.totalPaginas} págs
                            </p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                          En Bóveda
                        </span>
                      </div>

                      <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                        <div>
                          👤 Aportado por: <strong className="text-slate-800">{authorTeacher ? `${authorTeacher.first_name} ${authorTeacher.last_name}` : 'Docente Independiente'}</strong>
                        </div>
                        <div>
                          📅 Fecha de carga: <span className="font-mono text-[11px] text-slate-500">{new Date(book.fechaCarga).toLocaleDateString()}</span>
                        </div>
                        <div>
                          📑 Capítulos indexados a 0 tokens: <strong className="text-indigo-600 font-mono">{book.capitulos?.length || 0}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* PESTAÑA 4: BITÁCORA DE AUDITORÍA EN VIVO               */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Cpu size={18} className="text-indigo-600" />
                    <span>Registro de Telemetría e Interacciones IA en Tiempo Real</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Trazabilidad de cada consulta, planeación didáctica y archivo procesado por profesores independientes.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  ● Sistema Monitoreado
                </span>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 text-xs">
                {[
                  { teacher: 'Prof. Gabriel Montes', action: 'Generación Planeación SEP (Física 2° - Cinemática)', tokens: 1850, time: 'Hace 12 min', status: 'completado' },
                  { teacher: 'Prof. Gabriel Montes', action: 'Indexación de Libro PDF (Física Fundamental)', tokens: 3200, time: 'Hace 1 hora', status: 'completado' },
                  { teacher: 'Profa. Sofía Albarrán', action: 'Planeación SEP NEM (Español 3° - Ensayos)', tokens: 1950, time: 'Hace 2 horas', status: 'completado' },
                  { teacher: 'Prof. Carlos Mendoza', action: 'Rúbrica Analítica de Laboratorio (Biología 1°)', tokens: 950, time: 'Ayer 17:20', status: 'completado' },
                  { teacher: 'Profa. Sofía Albarrán', action: 'Carga de Antología Literaria en Bóveda', tokens: 4100, time: 'Ayer 14:10', status: 'completado' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900">{item.action}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.teacher} • <span className="font-mono text-slate-400">{item.time}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 block text-[11px]">
                        +{item.tokens.toLocaleString()} tokens
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">
                        ✓ {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ========================================================= */}
        {/* 4. FOOTER EJECUTIVO                                       */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              Red de Profesores Independientes aislada por <strong>ID de Docente</strong> con persistencia en <strong>Bóveda Curricular</strong>.
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Cerrar Consola
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* MODAL: CREAR NUEVA CUENTA DE PROFESOR INDEPENDIENTE       */}
      {/* ========================================================= */}
      {isCreateTeacherOpen && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                <Plus size={18} />
                <span>Alta de Profesor Independiente</span>
              </div>
              <button onClick={() => setIsCreateTeacherOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.firstName}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, firstName: e.target.value })}
                    placeholder="ej. Daniel"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.lastName}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, lastName: e.target.value })}
                    placeholder="ej. Treviño Castro"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico de Acceso *</label>
                <input
                  type="email"
                  required
                  value={newTeacherForm.email}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                  placeholder="ej. daniel.trevino@profesor.mx"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Especialidad / Asignatura Principal</label>
                <input
                  type="text"
                  value={newTeacherForm.specialty}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, specialty: e.target.value })}
                  placeholder="ej. Física, Matemáticas, Historia..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cuota Inicial Tokens IA</label>
                  <select
                    value={newTeacherForm.tokenQuota}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, tokenQuota: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="50000">50,000 Tokens (Básico)</option>
                    <option value="100000">100,000 Tokens (Estándar)</option>
                    <option value="250000">250,000 Tokens (Avanzado)</option>
                    <option value="500000">500,000 Tokens (Ilimitado/Plus)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Clave de Acceso Temporal</label>
                  <input
                    type="text"
                    value={newTeacherForm.password}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, password: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 font-mono font-bold border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <strong>🛡️ Regla de Acceso Exclusivo:</strong>
                <p>Esta cuenta solo tendrá acceso al módulo de profesor (`/teacher`). No podrá ver datos de administración de colegios, ni alumnos de otros profesores.</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateTeacherOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  Crear Cuenta Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AJUSTAR CUOTA DE TOKENS                            */}
      {/* ========================================================= */}
      {editingQuotaTeacher && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-100">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Zap size={16} className="text-purple-600" />
                <span>Ajustar Cuota de Tokens IA</span>
              </h4>
              <button onClick={() => setEditingQuotaTeacher(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Modifica la cuota mensual de tokens asignada a <strong>{editingQuotaTeacher.first_name} {editingQuotaTeacher.last_name}</strong>:
            </p>

            <div className="space-y-2">
              <label className="font-bold text-xs text-slate-700 block">Límite de Tokens Disponibles</label>
              <input
                type="number"
                step="10000"
                value={newQuotaValue}
                onChange={(e) => setNewQuotaValue(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingQuotaTeacher(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveQuota}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-all active:scale-95"
              >
                Guardar Cuota
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
