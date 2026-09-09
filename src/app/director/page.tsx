"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Header } from '@/components/Header';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  KeyRound, 
  Copy, 
  Check, 
  Search, 
  Plus, 
  Lock, 
  Unlock, 
  RefreshCw, 
  BarChart3, 
  Activity, 
  Sparkles, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Sliders, 
  DollarSign, 
  AlertTriangle, 
  Crown, 
  SlidersHorizontal,
  Calendar,
  Layers,
  Clock,
  Eye,
  EyeOff,
  Filter,
  X,
  ExternalLink
} from 'lucide-react';
import { 
  useSchoolAdminStore, 
  getSchoolCampuses, 
  getSchoolStudents, 
  getSchoolTeachers, 
  getSchoolGroups, 
  getSchoolSubjects, 
  getSchoolBillingRecords,
  getSchoolAttendance,
  getSchoolGovernance,
  getSchoolEmailDomain,
  getDirectorLimits,
  generateRandomPassword,
  resolveEffectiveSchoolId
} from '@/store/useSchoolAdminStore';
import { DetailedStudent, Subject, Campus, Group, UserProfile, SchoolGovernanceSettings, RestrictedTopicItem, DirectorLimitsSettings } from '@/types';

type DirectorTab = 'overview' | 'governance' | 'school_control' | 'vault' | 'finances';

export default function DirectorPortalPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    institutionsList,
    activeSchoolId,
    selectSchool,
    campusesList,
    detailedStudents,
    groupsList,
    subjectsList,
    teachersList,
    billingRecords,
    attendanceList,
    staffUsers,
    schoolGovernance,
    directorLimits: directorLimitsStore,
    updateSchoolGovernance,
    addRestrictedTopic,
    removeRestrictedTopic,
    toggleUserBlock,
    changeUserPassword,
    toggleStaffBlock,
    changeStaffPassword,
    registerStudent,
    registerTeacher
  } = useSchoolAdminStore();

  // Control de Acceso: Rol Director, Dueño o Super Usuario en auditoría
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'director' && user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'owner') {
        router.push('/login');
      }
    }
  }, [user, authLoading, router]);

  // Determinar Colegio del Director:
  // Centralizado vía resolveEffectiveSchoolId para cero desincronización
  const directorSchoolId = useMemo(() => {
    return resolveEffectiveSchoolId(user, activeSchoolId, 'sch-jjrosseau');
  }, [user, activeSchoolId]);

  const schoolInfo = useMemo(() => {
    return institutionsList.find(i => i.id === directorSchoolId) || institutionsList[0] || {
      id: 'sch-jjrosseau',
      name: 'UP Juan Jacobo Rosseau',
      cct: '09PPR2026R',
      tagline: 'Institución de Excelencia Académica',
      address: 'Calzada de los Filósofos 1712, Col. Del Valle, CDMX',
      phone: '55-4160-8800',
      website: 'https://jjrosseau.edu.mx',
      campusesCount: 3,
      studentsCount: 0,
      teachersCount: 0,
      aiTokensConsumed: 0
    };
  }, [institutionsList, directorSchoolId]);

  const schoolDomain = useMemo(() => {
    return getSchoolEmailDomain(schoolInfo);
  }, [schoolInfo]);

  // Pestaña y filtros locales
  const [activeTab, setActiveTab] = useState<DirectorTab>('overview');
  const [selectedCampusFilter, setSelectedCampusFilter] = useState<string>('all');
  const [controlSubTab, setControlSubTab] = useState<'students' | 'groups' | 'teachers' | 'schedules'>('students');

  // Gobernanza actual del colegio
  const currentGovernance = useMemo(() => {
    return getSchoolGovernance(schoolGovernance, directorSchoolId);
  }, [schoolGovernance, directorSchoolId]);

  // Modal para agregar temática curricular restringida
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newRestrictedTopic, setNewRestrictedTopic] = useState({
    topicTitle: '',
    subjectName: 'Matemáticas',
    grade: 'Secundaria (1º)',
    reason: 'Requiere validación de Dirección antes de programar en clase.',
    status: 'requiere_revision' as 'bloqueado' | 'requiere_revision'
  });

  const directorLimits: DirectorLimitsSettings = useMemo(() => {
    return getDirectorLimits(directorLimitsStore, directorSchoolId);
  }, [directorLimitsStore, directorSchoolId]);

  // Modales de Creación Directiva (Alumnos y Docentes)
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentForm, setNewStudentForm] = useState({
    first_name: '',
    second_name: '',
    last_name_1: '',
    last_name_2: '',
    level: 'primaria' as 'primaria' | 'secundaria' | 'preparatoria',
    grade: '1º',
    group_id: 'grp-jar-1a',
    campus_name: '',
    curp: '',
    email: '',
    phone: '',
    tutor_name: '',
    scholarship_percentage: 0,
    scholarship_type: 'ninguna' as 'ninguna' | 'academica' | 'deportiva' | 'hermanos' | 'sep' | 'socioeconomica'
  });

  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    first_name: '',
    last_name: '',
    campus_name: '',
    email: '',
    phone: '',
    assigned_subject: 'Matemáticas'
  });

  // Filtros de búsqueda en Control Escolar
  const [searchStudent, setSearchStudent] = useState('');
  const [searchTeacher, setSearchTeacher] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Manejo de Alta de Alumno por el Director (con validación de tope de beca del Dueño)
  const handleCreateStudentDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.first_name.trim() || !newStudentForm.last_name_1.trim()) {
      alert('Por favor completa el nombre y primer apellido del alumno.');
      return;
    }

    const scholarship = Number(newStudentForm.scholarship_percentage) || 0;
    const maxScholarshipAllowed = directorLimits?.maxScholarshipDiscountPercent ?? 50;
    if (scholarship > maxScholarshipAllowed) {
      alert(`⚠️ El porcentaje de beca (${scholarship}%) excede el límite máximo autorizado por el Dueño de Empresa (${maxScholarshipAllowed}%). Ajusta el porcentaje o solicita autorización corporativa.`);
      return;
    }

    const prefix = (newStudentForm.email.trim() ? newStudentForm.email.trim().split('@')[0] : `${newStudentForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newStudentForm.last_name_1.toLowerCase().replace(/[^a-z0-9]/g, '')}`).trim();
    const studentEmail = `${prefix}@${schoolDomain}`;

    const created = registerStudent({
      first_name: newStudentForm.first_name.trim(),
      second_name: newStudentForm.second_name.trim(),
      last_name_1: newStudentForm.last_name_1.trim(),
      last_name_2: newStudentForm.last_name_2.trim(),
      school_id: directorSchoolId,
      level: newStudentForm.level,
      grade: newStudentForm.grade,
      group_id: newStudentForm.group_id,
      campus_name: newStudentForm.campus_name || schoolCampuses[0]?.name || 'Plantel Principal',
      birth_date: '2016-01-01',
      curp: newStudentForm.curp.trim() || `${newStudentForm.last_name_1.substring(0, 2).toUpperCase()}${newStudentForm.first_name.substring(0, 2).toUpperCase()}160101HDFMRN01`,
      email: studentEmail,
      phone: newStudentForm.phone || '55-4160-8800',
      tutor_name: newStudentForm.tutor_name.trim() || 'Tutor Familiar',
      scholarship_percentage: scholarship,
      scholarship_type: newStudentForm.scholarship_type,
      status: 'activo',
      temporary_password: generateRandomPassword(6)
    });

    showToast(`✅ Alumno ${created.first_name} ${created.last_name_1} matriculado exitosamente con correo @${schoolDomain}`);
    setShowAddStudentModal(false);
    setNewStudentForm({
      first_name: '',
      second_name: '',
      last_name_1: '',
      last_name_2: '',
      level: 'primaria',
      grade: '1º',
      group_id: 'grp-jar-1a',
      campus_name: '',
      curp: '',
      email: '',
      phone: '',
      tutor_name: '',
      scholarship_percentage: 0,
      scholarship_type: 'ninguna' as 'ninguna' | 'academica' | 'deportiva' | 'hermanos' | 'sep' | 'socioeconomica'
    });
  };

  // Manejo de Alta de Docente por el Director
  const handleCreateTeacherDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.first_name.trim() || !newTeacherForm.last_name.trim()) {
      alert('Por favor completa el nombre y apellido del docente.');
      return;
    }

    const prefix = (newTeacherForm.email.trim() ? newTeacherForm.email.trim().split('@')[0] : `${newTeacherForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newTeacherForm.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`).trim();
    const teacherEmail = `${prefix}@${schoolDomain}`;

    registerTeacher({
      first_name: newTeacherForm.first_name.trim(),
      last_name: newTeacherForm.last_name.trim(),
      school_id: directorSchoolId,
      campus_name: newTeacherForm.campus_name || schoolCampuses[0]?.name || 'Plantel Principal',
      email: teacherEmail,
      phone: newTeacherForm.phone.trim() || '55-4160-8800',
      assigned_subjects: [newTeacherForm.assigned_subject]
    });

    showToast(`✅ Docente ${newTeacherForm.first_name} ${newTeacherForm.last_name} registrado exitosamente con correo @${schoolDomain}`);
    setShowAddTeacherModal(false);
    setNewTeacherForm({
      first_name: '',
      last_name: '',
      campus_name: '',
      email: '',
      phone: '',
      assigned_subject: 'Matemáticas'
    });
  };

  // Datos filtrados para este colegio específico
  const schoolCampuses = useMemo(() => {
    return getSchoolCampuses(campusesList, directorSchoolId);
  }, [campusesList, directorSchoolId]);

  const schoolStudents = useMemo(() => {
    const list = getSchoolStudents(detailedStudents, directorSchoolId, schoolCampuses);
    if (selectedCampusFilter === 'all') return list;
    return list.filter(s => s.campus_name?.toLowerCase() === selectedCampusFilter.toLowerCase() || s.campus_id === selectedCampusFilter);
  }, [detailedStudents, directorSchoolId, schoolCampuses, selectedCampusFilter]);

  const schoolTeachers = useMemo(() => {
    const list = getSchoolTeachers(teachersList, directorSchoolId, schoolCampuses);
    if (selectedCampusFilter === 'all') return list;
    return list.filter(t => t.campus_name?.toLowerCase() === selectedCampusFilter.toLowerCase() || t.campus_id === selectedCampusFilter);
  }, [teachersList, directorSchoolId, schoolCampuses, selectedCampusFilter]);

  const schoolGroups = useMemo(() => {
    return getSchoolGroups(groupsList, directorSchoolId, schoolCampuses);
  }, [groupsList, directorSchoolId, schoolCampuses]);

  const schoolSubjects = useMemo(() => {
    return getSchoolSubjects(subjectsList, directorSchoolId);
  }, [subjectsList, directorSchoolId]);

  const schoolBilling = useMemo(() => {
    return getSchoolBillingRecords(billingRecords, directorSchoolId, schoolStudents);
  }, [billingRecords, directorSchoolId, schoolStudents]);

  const schoolAttendanceRecords = useMemo(() => {
    return getSchoolAttendance(attendanceList, directorSchoolId, schoolStudents);
  }, [attendanceList, directorSchoolId, schoolStudents]);

  // Métricas Financieras en tiempo real
  const totalBilled = useMemo(() => {
    return schoolBilling.reduce((acc, r) => acc + (r.amount || 0), 0);
  }, [schoolBilling]);

  const totalCollected = useMemo(() => {
    return schoolBilling.filter(r => r.status === 'paid').reduce((acc, r) => acc + (r.amount || 0), 0);
  }, [schoolBilling]);

  const totalOverdue = useMemo(() => {
    return schoolBilling.filter(r => r.status === 'overdue' || r.status === 'pending').reduce((acc, r) => acc + (r.amount || 0), 0);
  }, [schoolBilling]);

  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

  // Asistencia Institucional
  const attendancePercentage = useMemo(() => {
    if (schoolAttendanceRecords.length === 0) return 96.5;
    const presentCount = schoolAttendanceRecords.filter(a => a.status === 'presente' || a.status === 'retardo').length;
    return Math.round((presentCount / schoolAttendanceRecords.length) * 100);
  }, [schoolAttendanceRecords]);

  // Supervisión de Planeaciones Curriculares NEM (Bóveda Curricular SEP)
  const totalCurricularPlans = useMemo(() => {
    return Math.max(schoolSubjects.length * 4, 18);
  }, [schoolSubjects]);

  // Toggle de configuración de gobernanza
  const handleToggleGovernance = (key: keyof SchoolGovernanceSettings) => {
    const currentVal = currentGovernance[key];
    if (typeof currentVal === 'boolean') {
      updateSchoolGovernance(directorSchoolId, { [key]: !currentVal });
      showToast(`⚙️ Regla de gobernanza "${key}" actualizada.`);
    }
  };

  // Creación de temática restringida
  const handleAddRestrictedTopicSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRestrictedTopic.topicTitle.trim()) {
      alert('Por favor ingresa el título de la temática.');
      return;
    }

    addRestrictedTopic(directorSchoolId, {
      topicTitle: newRestrictedTopic.topicTitle.trim(),
      subjectName: newRestrictedTopic.subjectName,
      grade: newRestrictedTopic.grade,
      reason: newRestrictedTopic.reason,
      status: newRestrictedTopic.status
    });

    showToast(`🔒 Temática "${newRestrictedTopic.topicTitle}" restringida en el colegio.`);
    setShowAddTopicModal(false);
    setNewRestrictedTopic({
      topicTitle: '',
      subjectName: 'Matemáticas',
      grade: 'Secundaria (1º)',
      reason: 'Requiere validación de Dirección antes de programar en clase.',
      status: 'requiere_revision'
    });
  };

  // Filtrado de alumnos en control escolar
  const filteredStudents = useMemo(() => {
    return schoolStudents.filter(s => {
      const q = searchStudent.toLowerCase();
      const match = !q ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name_1.toLowerCase().includes(q) ||
        (s.curp && s.curp.toLowerCase().includes(q)) ||
        (s.email && s.email.toLowerCase().includes(q));
      return match;
    });
  }, [schoolStudents, searchStudent]);

  // Filtrado de profesores en control escolar
  const filteredTeachers = useMemo(() => {
    return schoolTeachers.filter(t => {
      const q = searchTeacher.toLowerCase();
      const match = !q ||
        t.first_name.toLowerCase().includes(q) ||
        t.last_name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q);
      return match;
    });
  }, [schoolTeachers, searchTeacher]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-600" />
          <p className="text-xs font-bold text-slate-500">Verificando credenciales directivas...</p>
        </div>
      </div>
    );
  }

  const isDirectorOrHigher = ['director', 'admin', 'superadmin', 'owner'].includes(user.role);

  if (!isDirectorOrHigher) {
    const getRedirectInfo = () => {
      switch (user.role) {
        case 'coordinator':
          return { label: 'Ir a mi Portal de Coordinador', path: '/coordinator' };
        case 'billing':
          return { label: 'Ir a mi Portal de Cobranza', path: '/coordinator/billing' };
        case 'teacher':
          return { label: 'Ir a mi Portal Docente', path: '/teacher' };
        case 'student':
          return { label: 'Ir a mi Portal de Alumno', path: '/student' };
        case 'parent':
        case 'tutor':
          return { label: 'Ir a mi Portal Familiar', path: '/parent' };
        default:
          return { label: 'Iniciar Sesión', path: '/login' };
      }
    };

    const redirectInfo = getRedirectInfo();

    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-4 shadow-xl">
          <div className="h-14 w-14 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200 mx-auto flex items-center justify-center">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-slate-900">Acceso Denegado</h2>
          <p className="text-xs text-slate-600">
            Esta consola está reservada exclusivamente para Directores de Plantel y Dirección General.
          </p>
          <button
            onClick={() => router.push(redirectInfo.path)}
            className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-lg shadow-purple-600/30 cursor-pointer transition-all"
          >
            {redirectInfo.label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-purple-500 selection:text-white font-sans">
      <Header />

      {/* TOAST DE NOTIFICACIÓN DIRECTIVA */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-purple-700 to-indigo-700 text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 animate-bounce">
          <ShieldCheck className="h-5 w-5 text-purple-200" />
          <span className="text-xs font-black">{toastMessage}</span>
        </div>
      )}

      {/* BANNER INSTITUCIONAL DEL COLEGIO DEL DIRECTOR */}
      <section className="bg-gradient-to-r from-purple-50/70 via-white to-indigo-50/70 border-b border-slate-200 pt-8 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-slate-800 flex items-center justify-center text-white shadow-xl shadow-purple-600/20 border border-purple-200 shrink-0">
                <Crown className="h-8 w-8 text-amber-300" />
              </div>

              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300">
                    🏛️ Dirección General de Plantel
                  </span>
                  <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    CCT: {schoolInfo.cct}
                  </span>
                  {user?.first_name && (
                    <span className="text-xs font-bold text-slate-600">
                      Director: <strong className="text-slate-900">{user.first_name} {user.last_name}</strong>
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                  {schoolInfo.name}
                </h1>
                <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                  {schoolInfo.tagline || 'Supervisión integral, gobernanza directiva y control escolar unificado de la institución.'}
                </p>
              </div>
            </div>

            {/* Selector de Campus del Plantel & Acciones Directivas */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 bg-white border border-slate-200 px-3.5 py-2 rounded-2xl shadow-xs">
                <Building2 className="h-4 w-4 text-purple-600" />
                <span className="text-xs font-bold text-slate-700">Filtrar Plantel:</span>
                <select
                  value={selectedCampusFilter}
                  onChange={(e) => setSelectedCampusFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-2.5 py-1 text-xs font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="all">🏢 Todos los Planteles ({schoolCampuses.length})</option>
                  {schoolCampuses.map(cmp => (
                    <option key={cmp.id} value={cmp.name}>{cmp.name}</option>
                  ))}
                </select>
              </div>

              <Link
                href="/coordinator/billing"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black transition-all cursor-pointer shadow-xs"
              >
                <DollarSign className="h-4 w-4 text-emerald-600" /> Cobranza & Facturación
              </Link>
            </div>
          </div>

          {/* TARJETAS KPI EJECUTIVAS EN TIEMPO REAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Matrícula Total */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Matrícula Total</span>
                <GraduationCap className="h-4 w-4 text-blue-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">{schoolStudents.length}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {schoolStudents.filter(s => !s.is_blocked && s.status === 'activo').length} activos · {schoolStudents.filter(s => s.is_blocked).length} bloqueados
                </p>
              </div>
            </div>

            {/* Plantilla Docente */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Plantilla Docente</span>
                <Users className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">{schoolTeachers.length}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {schoolTeachers.filter(t => !t.is_blocked).length} profesores activos
                </p>
              </div>
            </div>

            {/* Grupos Escolares */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Grupos Escolares</span>
                <BookOpen className="h-4 w-4 text-amber-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900">{schoolGroups.length}</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {schoolCampuses.length} planteles articulados
                </p>
              </div>
            </div>

            {/* Salud de Cobranza */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[10px] font-bold uppercase tracking-wider">Recaudación Mes</span>
                <DollarSign className="h-4 w-4" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-700">
                  ${totalCollected.toLocaleString('es-MX')}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  {collectionRate}% efectividad de cobro
                </p>
              </div>
            </div>

            {/* Asistencia Institucional */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-[10px] font-bold uppercase tracking-wider">Asistencia Global</span>
                <Activity className="h-4 w-4 text-cyan-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-cyan-700">{attendancePercentage}%</span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Semana lectiva en curso
                </p>
              </div>
            </div>

            {/* Planeación Curricular NEM */}
            <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-600">
                <span className="text-[10px] font-bold uppercase tracking-wider">Planeación Curricular NEM</span>
                <BookOpen className="h-4 w-4" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-700">
                  {totalCurricularPlans}
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Sesiones homologadas Bóveda SEP
                </p>
              </div>
            </div>
          </div>

          {/* BARRA DE NAVEGACIÓN DEL DIRECTOR */}
          <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-slate-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Resumen Ejecutivo
            </button>

            <button
              onClick={() => setActiveTab('governance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'governance'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4 text-amber-500" /> Gobernanza & Restricciones
              {currentGovernance.restrictedTopics.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 border border-amber-300">
                  {currentGovernance.restrictedTopics.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('school_control')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'school_control'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="h-4 w-4 text-blue-500" /> Control Escolar Liberado
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'vault'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Supervisión de Bóveda Curricular
            </button>

            <button
              onClick={() => setActiveTab('finances')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                activeTab === 'finances'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <DollarSign className="h-4 w-4 text-emerald-500" /> Finanzas & Cobranza
            </button>
          </nav>
        </div>
      </section>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

        {/* 1. RESUMEN EJECUTIVO */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Desglose de Matrícula por Plantel */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <h3 className="text-sm font-black text-slate-900">Distribución de Planteles</h3>
                  </div>
                  <span className="text-xs font-bold text-slate-500">{schoolCampuses.length} planteles</span>
                </div>

                <div className="space-y-3">
                  {schoolCampuses.map(cmp => {
                    const count = schoolStudents.filter(s => s.campus_name?.toLowerCase() === cmp.name.toLowerCase() || s.campus_id === cmp.id).length;
                    const pct = schoolStudents.length > 0 ? Math.round((count / schoolStudents.length) * 100) : 0;
                    return (
                      <div key={cmp.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{cmp.name}</span>
                          <span className="font-mono text-purple-700 font-bold">{count} alumnos ({pct}%)</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${pct}%` }} 
                          />
                        </div>
                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider block">
                          Nivel: {cmp.level} · {cmp.grades.length} grados
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Salud Financiera y Cartera */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <h3 className="text-sm font-black text-slate-900">Estado Financiero Institucional</h3>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">{collectionRate}% Cobrado</span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block uppercase">Recaudación Cobrada</span>
                      <span className="text-xl font-black text-emerald-700">${totalCollected.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block uppercase">Cartera por Cobrar</span>
                      <span className="text-xl font-black text-amber-700">${totalOverdue.toLocaleString('es-MX')}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block uppercase">Recibos Emitidos</span>
                      <span className="text-xl font-black text-slate-900">{schoolBilling.length} transacciones</span>
                    </div>
                    <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                      <FileText className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <Link
                  href="/coordinator/billing"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Abrir Módulo Completo de Cobranza <ChevronRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Alertas Directivas & Acciones Rápidas */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <h3 className="text-sm font-black text-slate-900">Alertas Directivas</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-600">Prioridad Alta</span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                    <Lock className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-900 block">Cuentas Suspendidas</span>
                      <p className="text-[11px] text-amber-700 mt-0.5">
                        {schoolStudents.filter(s => s.is_blocked).length} alumnos y {schoolTeachers.filter(t => t.is_blocked).length} profesores tienen su acceso bloqueado actualmente.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                    <ShieldCheck className="h-4 w-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-purple-900 block">Temáticas Restringidas</span>
                      <p className="text-[11px] text-purple-700 mt-0.5">
                        Hay {currentGovernance.restrictedTopics.length} temática(s) con restricción pedagógica activa en este colegio.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-blue-900 block">Bóveda Curricular Sincronizada</span>
                      <p className="text-[11px] text-blue-700 mt-0.5">
                        El repositorio pedagógico se encuentra al día con los lineamientos oficiales de la SEP NEM 2024.
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setActiveTab('governance')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all cursor-pointer"
                >
                  Ir al Centro de Gobernanza <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. CENTRO DE GOBERNANZA & RESTRICCIONES (FACULTAD EXCLUSIVA DEL DIRECTOR) */}
        {activeTab === 'governance' && (
          <div className="space-y-6 animate-fade-in">
            {/* Banner Informativo de Gobernanza */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-50 via-white to-indigo-50 border border-purple-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">
                    Centro de Gobernanza y Restricciones Institucionales
                  </h3>
                </div>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Como Director General de este plantel, dispones de la facultad exclusiva para regular qué módulos están disponibles para cada tipo de cuenta (Coordinadores, Docentes, Alumnos y Tutores), así como auditar o restringir temáticas curriculares específicas antes de su aplicación en el aula.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddTopicModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-102 shrink-0"
              >
                <Plus className="h-4 w-4" /> Restringir Nueva Temática Curricular
              </button>
            </div>

            {/* LÍMITES CORPORATIVOS FIJADOS POR EL DUEÑO DE EMPRESA */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-purple-50 to-slate-50 border border-blue-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4 text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                    Atribuciones Directivas Otorgadas por el Dueño de Empresa
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300 font-bold">
                  Presidencia Corporativa
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 block">Tope Beca Directa</span>
                  <span className="font-black text-amber-700 text-sm">{directorLimits?.maxScholarshipDiscountPercent ?? 50}% Máximo</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 block">Alta Coordinadores</span>
                  <span className={`font-bold text-xs ${directorLimits?.canRegisterCoordinators ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {directorLimits?.canRegisterCoordinators ? '✓ Autorizada' : '🔒 Solo Dueño'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 block">Aranceles y Cobros</span>
                  <span className={`font-bold text-xs ${directorLimits?.canModifyTuitionFees ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {directorLimits?.canModifyTuitionFees ? '✓ Autorizado' : '🔒 Fijado por Dueño'}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] text-slate-500 block">Crear Planteles</span>
                  <span className={`font-bold text-xs ${directorLimits?.canManageCampuses ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {directorLimits?.canManageCampuses ? '✓ Habilitado' : '🔒 Corporativo'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECCIÓN A: MATRIZ DE INTERRUPTORES DE MÓDULOS */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" /> Matriz de Acceso a Módulos para Cuentas del Colegio
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Los cambios tienen efecto inmediato en todas las sesiones activas de las cuentas vinculadas a este plantel.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Switch: Cobranza a Coordinadores */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Acceso a Cobranza para Coordinación</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Permite que los coordinadores vean y gestionen cobros y estados de cuenta familiares.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('allowCoordinatorBilling')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.allowCoordinatorBilling ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.allowCoordinatorBilling ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch: Bajas Definitivas para Coordinación */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Facultad de Bajas Definitivas para Coordinación</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Permite que los coordinadores eliminen o den de baja alumnos y grupos sin visto bueno directivo.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('allowCoordinatorDelete' as any)}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.allowCoordinatorDelete ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.allowCoordinatorDelete ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch: Edición Extemporánea de Boletas a Profesores */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Edición Extemporánea de Boletas</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Habilita a los profesores la modificación de calificaciones fuera del periodo ordinario.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('allowTeacherGradeEditing')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.allowTeacherGradeEditing ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.allowTeacherGradeEditing ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch: Tienda Gamificada para Alumnos */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Módulo de Tienda Mágica & Recompensas</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Activa la tienda gamificada y canje de avatares para los estudiantes de este colegio.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('allowStudentGamification')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.allowStudentGamification ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.allowStudentGamification ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch: Asistente Pedagógico IA para Profesores */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Motor de IA Pedagógica para Docentes</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Habilita la generación asistida por IA de planeaciones, rúbricas y proyectos formativos.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('allowAiAssistantTeachers')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.allowAiAssistantTeachers ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.allowAiAssistantTeachers ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch: Asistente Pedagógico IA para Alumnos */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Tutor de IA Pedagógica para Alumnos</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Permite que los alumnos reciban retroalimentación inteligente durante las misiones.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('allowAiAssistantStudents')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.allowAiAssistantStudents ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.allowAiAssistantStudents ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>

                {/* Switch: Aprobación Previa Obligatoria de Planeaciones */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Aprobación Directiva de Planeaciones</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Exige el visto bueno formal de Dirección antes de que un docente pueda aplicar una planeación.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleGovernance('requirePlanningApproval')}
                    className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                      currentGovernance.requirePlanningApproval ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                      currentGovernance.requirePlanningApproval ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* SECCIÓN B: GESTOR DE TEMÁTICAS CURRICULARES RESTRINGIDAS */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-amber-500" /> Temáticas Curriculares Restringidas o en Pausa Institucional
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Contenidos o unidades que requieren revisión directiva previa o se encuentran temporalmente bloqueadas.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
                  {currentGovernance.restrictedTopics.length} Temáticas
                </span>
              </div>

              {currentGovernance.restrictedTopics.length === 0 ? (
                <div className="p-8 text-center text-slate-600 bg-slate-50 rounded-2xl border border-slate-200">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-900">Todas las temáticas curriculares están libres para impartirse.</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">No hay restricciones curriculares activas en este plantel.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="p-3">Temática / Contenido</th>
                        <th className="p-3">Asignatura & Grado</th>
                        <th className="p-3">Motivo Pedagógico / Directivo</th>
                        <th className="p-3">Estatus de Restricción</th>
                        <th className="p-3 text-right">Liberar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {currentGovernance.restrictedTopics.map((topic) => (
                        <tr key={topic.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 font-bold text-slate-900">
                            {topic.topicTitle}
                          </td>
                          <td className="p-3 text-slate-500 font-mono">
                            {topic.subjectName || 'General'} · {topic.grade || 'Todos'}
                          </td>
                          <td className="p-3 text-slate-700 max-w-xs truncate">
                            {topic.reason || 'Restricción preventiva establecida por Dirección.'}
                          </td>
                          <td className="p-3">
                            {topic.status === 'bloqueado' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800 border border-red-300">
                                <Lock className="h-3 w-3" /> Bloqueado Total
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                                <Eye className="h-3 w-3" /> Requiere Revisión
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                removeRestrictedTopic(directorSchoolId, topic.id);
                                showToast(`🔓 Restricción eliminada para "${topic.topicTitle}".`);
                              }}
                              title="Liberar temática"
                              className="p-1.5 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 border border-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* SECCIÓN C: CONTROL DE CUENTAS DEL COLEGIO */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-600" /> Gobernanza de Cuentas del Personal Docente de su Colegio
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  El Director tiene la facultad de suspender accesos o reasignar contraseñas a los profesores de su institución.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="p-3">Docente</th>
                      <th className="p-3">Plantel / Materias</th>
                      <th className="p-3 text-center">Planeaciones</th>
                      <th className="p-3">Clave de Acceso</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3 text-right">Gobernanza Directiva</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {schoolTeachers.map((teacher) => {
                      const isBlocked = !!teacher.is_blocked;
                      const tempPass = teacher.temporary_password || '008805';
                      return (
                        <tr key={teacher.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3">
                            <span className="font-bold text-slate-900 block">{teacher.first_name} {teacher.last_name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{teacher.email}</span>
                          </td>
                          <td className="p-3 text-slate-500">
                            <span>{teacher.campus_name || 'Plantel Principal'}</span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {Math.max(1, Math.round(((teacher.ai_tokens_consumed || 15000) / 15000)))} Plan(es)
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono bg-amber-50 px-2 py-1 rounded border border-amber-200 text-amber-800 font-bold">
                              {tempPass}
                            </span>
                          </td>
                          <td className="p-3">
                            {isBlocked ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-300">
                                Suspendido
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserBlock(teacher.id, 'teacher', !isBlocked);
                                  showToast(isBlocked ? `✅ Profesor ${teacher.first_name} reactivado.` : `⛔ Profesor ${teacher.first_name} suspendido.`);
                                }}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  isBlocked ? 'bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-200' : 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                                }`}
                              >
                                {isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  const newP = changeUserPassword(teacher.id, 'teacher');
                                  showToast(`🔑 Nueva clave para ${teacher.first_name}: ${newP}`);
                                }}
                                title="Regenerar contraseña"
                                className="p-1.5 rounded-lg bg-slate-100 text-amber-700 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                <RefreshCw className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. CONTROL ESCOLAR LIBERADO (TODAS LAS FUNCIONES DE COORDINACIÓN) */}
        {activeTab === 'school_control' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header de Control Escolar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" /> Control Escolar y Coordinación del Colegio
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Acceso liberado total para la consulta y administración de alumnos, grupos y horarios del colegio.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/coordinator"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  Abrir Panel de Control Escolar Completo <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Subpestañas */}
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setControlSubTab('students')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  controlSubTab === 'students' ? 'bg-slate-900 text-white font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Alumnos ({schoolStudents.length})
              </button>
              <button
                onClick={() => setControlSubTab('groups')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  controlSubTab === 'groups' ? 'bg-slate-900 text-white font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Grupos ({schoolGroups.length})
              </button>
              <button
                onClick={() => setControlSubTab('teachers')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  controlSubTab === 'teachers' ? 'bg-slate-900 text-white font-black' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Docentes ({schoolTeachers.length})
              </button>
            </div>

            {/* Subtab Alumnos */}
            {controlSubTab === 'students' && (
              <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Buscar alumno por nombre, matrícula o CURP..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{filteredStudents.length} alumnos mostrados</span>
                    <button
                      type="button"
                      onClick={() => setShowAddStudentModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:scale-102"
                    >
                      <Plus className="h-4 w-4" /> Inscribir Nuevo Alumno
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        <th className="p-3">Alumno</th>
                        <th className="p-3">Nivel & Grado</th>
                        <th className="p-3">Plantel</th>
                        <th className="p-3">Tutor Registrado</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredStudents.slice(0, 20).map(std => {
                        const isBlocked = !!std.is_blocked || std.status === 'suspendido';
                        return (
                          <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-slate-900">
                              {std.first_name} {std.last_name_1}
                              <span className="block text-[10px] text-slate-500 font-mono">CURP: {std.curp || 'S/N'}</span>
                            </td>
                            <td className="p-3 font-mono text-purple-700 font-bold">
                              {std.grade || '1º'}
                            </td>
                            <td className="p-3 text-slate-500">
                              {std.campus_name || 'Plantel Principal'}
                            </td>
                            <td className="p-3 text-slate-700">
                              {std.tutor_name || std.father_name || 'Tutor Registrado'}
                            </td>
                            <td className="p-3">
                              {isBlocked ? (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-300">
                                  Bloqueado
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                                  Activo
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserBlock(std.id, 'student', !isBlocked);
                                  showToast(isBlocked ? `✅ Alumno ${std.first_name} desbloqueado.` : `⛔ Alumno ${std.first_name} bloqueado.`);
                                }}
                                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
                              >
                                {isBlocked ? <Unlock className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Subtab Grupos */}
            {controlSubTab === 'groups' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {schoolGroups.map(grp => {
                  const studentsInGroup = schoolStudents.filter(s => s.campus_name === grp.campus_name && s.grade === grp.grade);
                  return (
                    <div key={grp.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{grp.campus_name || 'Plantel'}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[11px] font-mono text-slate-600 font-bold">Grupo {grp.name}</span>
                      </div>
                      <h4 className="text-base font-black text-slate-900">{grp.grade} Grupo "{grp.name}"</h4>
                      <p className="text-xs text-slate-500">{studentsInGroup.length} alumnos matriculados</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Subtab Docentes */}
            {controlSubTab === 'teachers' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchTeacher}
                      onChange={(e) => setSearchTeacher(e.target.value)}
                      placeholder="Buscar docente por nombre o correo..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-500">{filteredTeachers.length} docentes registrados</span>
                    <button
                      type="button"
                      onClick={() => setShowAddTeacherModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-102"
                    >
                      <Plus className="h-4 w-4" /> Registrar Nuevo Docente
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTeachers.map(t => (
                    <div key={t.id} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center font-bold">
                          {t.first_name[0]}{t.last_name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{t.first_name} {t.last_name}</h4>
                          <span className="text-[11px] text-slate-500 font-mono">{t.email}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                        <span>{t.campus_name || 'Plantel'}</span>
                        <span className="font-semibold text-xs text-indigo-700">
                          {Math.max(1, Math.round(((t.ai_tokens_consumed || 15000) / 15000)))} Plan(es) NEM
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. SUPERVISIÓN DE BÓVEDA CURRICULAR */}
        {activeTab === 'vault' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">Bóveda Curricular & Supervisión Pedagógica NEM 2024</h3>
                    <p className="text-xs text-slate-500">Auditoría directiva de planeaciones docentes y cumplimiento de PDA oficiales</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                    ✓ Bóveda Central En Línea
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Planeaciones Registradas</span>
                  <span className="text-2xl font-black text-slate-900">48 Planeaciones</span>
                  <span className="text-[11px] text-emerald-700 font-bold block">100% conforme a la NEM</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Proyectos Formativos en Curso</span>
                  <span className="text-2xl font-black text-purple-700">12 Proyectos</span>
                  <span className="text-[11px] text-slate-500 block">Articulación comunitaria activa</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Rúbricas Analíticas</span>
                  <span className="text-2xl font-black text-cyan-700">36 Rúbricas</span>
                  <span className="text-[11px] text-slate-500 block">Entregables tangibles definidos</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Estrategia Vault-First / Cache-First:</strong>
                  Cuando un profesor de su colegio solicita una planeación, el sistema primero consulta en la Bóveda Curricular local (`planeaciones/`) si ya existe un nodo curricular adecuado. Únicamente en su ausencia se recurre al Motor de Inteligencia Artificial Pedagógica, garantizando consistencia y persistencia inmediata en formato Markdown bidireccional.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. FINANZAS & COBRANZA INSTITUCIONAL */}
        {activeTab === 'finances' && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-emerald-600" /> Resumen de Cobranza del Colegio
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Seguimiento de cuotas, aranceles escolares y estados de cuenta familiares.</p>
                </div>
                <Link
                  href="/coordinator/billing"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Abrir Panel Completo de Cobranza
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="p-3">Recibo / Folio</th>
                      <th className="p-3">Alumno / Familia</th>
                      <th className="p-3">Concepto</th>
                      <th className="p-3">Monto</th>
                      <th className="p-3">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {schoolBilling.slice(0, 15).map(rec => (
                      <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-purple-700">
                          {rec.invoiceNumber}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{rec.studentName}</span>
                          <span className="text-[10px] text-slate-500">{rec.parentName}</span>
                        </td>
                        <td className="p-3 text-slate-700">
                          {rec.concept}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-700">
                          ${(rec.amount || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="p-3">
                          {rec.status === 'paid' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border border-emerald-300">
                              Pagado
                            </span>
                          ) : rec.status === 'overdue' ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-300">
                              Vencido
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-300">
                              Pendiente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: RESTRINGIR NUEVA TEMÁTICA CURRICULAR */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                  <SlidersHorizontal className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Restringir Temática Curricular</h4>
                  <p className="text-xs text-slate-500">Establecer validación directiva o pausa pedagógica institucional</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTopicModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddRestrictedTopicSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Título o Contenido de la Temática *
                </label>
                <input
                  type="text"
                  required
                  value={newRestrictedTopic.topicTitle}
                  onChange={(e) => setNewRestrictedTopic(prev => ({ ...prev, topicTitle: e.target.value }))}
                  placeholder="Ej. Sexualidad Integral y Género, Geopolítica Contemporánea"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Materia / Asignatura
                  </label>
                  <input
                    type="text"
                    value={newRestrictedTopic.subjectName}
                    onChange={(e) => setNewRestrictedTopic(prev => ({ ...prev, subjectName: e.target.value }))}
                    placeholder="Ej. Formación Cívica y Ética"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Grado Escolar
                  </label>
                  <input
                    type="text"
                    value={newRestrictedTopic.grade}
                    onChange={(e) => setNewRestrictedTopic(prev => ({ ...prev, grade: e.target.value }))}
                    placeholder="Ej. Secundaria (2º)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Tipo de Restricción
                </label>
                <select
                  value={newRestrictedTopic.status}
                  onChange={(e) => setNewRestrictedTopic(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  <option value="requiere_revision">Requiere Revisión Directiva Previa (Supervisión)</option>
                  <option value="bloqueado">Bloqueado Total (Pausa Institucional)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Motivo Institucional o Pedagógico
                </label>
                <textarea
                  rows={3}
                  value={newRestrictedTopic.reason}
                  onChange={(e) => setNewRestrictedTopic(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Explica el criterio por el cual esta temática debe ser supervisada..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-102"
                >
                  Aplicar Restricción Institucional
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIRECTIVO: INSCRIBIR NUEVO ALUMNO */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 max-h-[90vh] overflow-y-auto text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Inscripción Directiva de Alumno</h4>
                  <p className="text-xs text-slate-500">
                    {schoolInfo.name} · Correo institucional obligatorio <span className="font-mono text-blue-600">@{schoolDomain}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Banner de Límite Corporativo de Becas */}
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-medium">
              <Crown className="h-4 w-4 shrink-0 text-amber-600" />
              <span>
                Tope máximo de beca autorizado por Presidencia: <strong>{directorLimits?.maxScholarshipDiscountPercent ?? 50}%</strong>.
              </span>
            </div>

            <form onSubmit={handleCreateStudentDirector} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primer Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.first_name}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Ej. Mateo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Segundo Nombre
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.second_name}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, second_name: e.target.value }))}
                    placeholder="Ej. Alexander"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Primer Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.last_name_1}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, last_name_1: e.target.value }))}
                    placeholder="Ej. Morales"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Segundo Apellido
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.last_name_2}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, last_name_2: e.target.value }))}
                    placeholder="Ej. Ruiz"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nivel Educativo
                  </label>
                  <select
                    value={newStudentForm.level}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, level: e.target.value as any }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="preparatoria">Preparatoria</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Grado
                  </label>
                  <select
                    value={newStudentForm.grade}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, grade: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="1º">1º Grado</option>
                    <option value="2º">2º Grado</option>
                    <option value="3º">3º Grado</option>
                    <option value="4º">4º Grado</option>
                    <option value="5º">5º Grado</option>
                    <option value="6º">6º Grado</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Plantel de Asignación
                  </label>
                  <select
                    value={newStudentForm.campus_name}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, campus_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    {schoolCampuses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    CURP del Alumno
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.curp}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, curp: e.target.value.toUpperCase() }))}
                    placeholder="Auto o 18 caracteres"
                    maxLength={18}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:outline-none focus:border-blue-500 uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nombre del Tutor / Familiar
                  </label>
                  <input
                    type="text"
                    value={newStudentForm.tutor_name}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, tutor_name: e.target.value }))}
                    placeholder="Ej. Roberto Morales Sánchez"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Beca y Financiero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Porcentaje de Beca (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={directorLimits?.maxScholarshipDiscountPercent ?? 50}
                    value={newStudentForm.scholarship_percentage}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, scholarship_percentage: Number(e.target.value) }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Máx. autorizado: {directorLimits?.maxScholarshipDiscountPercent ?? 50}%
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tipo de Beca
                  </label>
                  <select
                    value={newStudentForm.scholarship_type}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, scholarship_type: e.target.value as any }))}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 cursor-pointer"
                  >
                    <option value="ninguna">Sin Beca (Cuota Ordinaria)</option>
                    <option value="academica">Beca Académica / Excelencia</option>
                    <option value="deportiva">Beca Deportiva</option>
                    <option value="socioeconomica">Beca Socioeconómica</option>
                    <option value="convenio">Beca por Convenio Institucional</option>
                  </select>
                </div>
              </div>

              {/* Correo Estricto Institucional */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Correo Institucional Autogenerado *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newStudentForm.email}
                    onChange={(e) => setNewStudentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={newStudentForm.first_name ? `${newStudentForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newStudentForm.last_name_1.toLowerCase().replace(/[^a-z0-9]/g, '')}` : "nombre.apellido"}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-l-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-blue-500 font-mono"
                  />
                  <span className="bg-blue-50 text-blue-700 border border-l-0 border-blue-200 rounded-r-xl px-3 py-2 text-xs font-mono font-bold">
                    @{schoolDomain}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Regla de seguridad: Todo estudiante pertenece estrictamente al dominio de su colegio.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md shadow-blue-600/20 transition-all cursor-pointer hover:scale-102"
                >
                  Matricular Alumno en Plantel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DIRECTIVO: REGISTRAR NUEVO DOCENTE */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 p-6 space-y-5 text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900">Registro Directivo de Docente</h4>
                  <p className="text-xs text-slate-500">
                    {schoolInfo.name} · Correo institucional obligatorio <span className="font-mono text-purple-600">@{schoolDomain}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddTeacherModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTeacherDirector} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nombre(s) del Docente *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.first_name}
                    onChange={(e) => setNewTeacherForm(prev => ({ ...prev, first_name: e.target.value }))}
                    placeholder="Ej. Laura"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Apellidos *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.last_name}
                    onChange={(e) => setNewTeacherForm(prev => ({ ...prev, last_name: e.target.value }))}
                    placeholder="Ej. Gómez Silva"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Materia / Asignatura Principal
                  </label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.assigned_subject}
                    onChange={(e) => setNewTeacherForm(prev => ({ ...prev, assigned_subject: e.target.value }))}
                    placeholder="Ej. Matemáticas, Ciencias, Robótica"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Plantel de Adscripción
                  </label>
                  <select
                    value={newTeacherForm.campus_name}
                    onChange={(e) => setNewTeacherForm(prev => ({ ...prev, campus_name: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {schoolCampuses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={newTeacherForm.phone}
                  onChange={(e) => setNewTeacherForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Ej. 55-4160-8800"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Correo Estricto Institucional */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Correo Institucional Autogenerado *
                </label>
                <div className="flex items-center">
                  <input
                    type="text"
                    value={newTeacherForm.email}
                    onChange={(e) => setNewTeacherForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={newTeacherForm.first_name ? `${newTeacherForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newTeacherForm.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}` : "profesor.apellido"}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-l-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-purple-500 font-mono"
                  />
                  <span className="bg-purple-50 text-purple-700 border border-l-0 border-purple-200 rounded-r-xl px-3 py-2 text-xs font-mono font-bold">
                    @{schoolDomain}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Regla institucional: Los accesos al Motor de IA Pedagógica y Bóveda se autentican con este dominio.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-md shadow-purple-600/20 transition-all cursor-pointer hover:scale-102"
                >
                  Registrar y Asignar Docente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
