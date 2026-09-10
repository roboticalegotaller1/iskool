"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { 
  useSchoolAdminStore, 
  getSchoolCampuses, 
  getSchoolStudents, 
  getSchoolGroups, 
  getSchoolSubjects, 
  getSchoolTeachers, 
  getSchoolSchedules,
  getSchoolGovernance,
  getSchoolEmailDomain,
  resolveEffectiveSchoolId
} from '@/store/useSchoolAdminStore';
import { SUBJECTS_SEED } from '@/store/seeds';
import { Header } from '@/components/Header';
import { 
  Users, UserPlus, Calendar, Plus, Trash2, Search, Filter, 
  BookOpen, Calculator, Activity, Clock, ShieldAlert, MapPin, 
  Phone, Mail, CheckCircle2, ChevronRight, User, AlertCircle, Sparkles, X, Heart, Globe, Building2, Upload, RefreshCw, Edit3,
  Landmark, Lock
} from 'lucide-react';
import { DetailedStudent, ClassSchedule, Group, SchoolSettings, UserProfile, ROLE_HIERARCHY_LEVEL, UserRole } from '@/types';
import { getStudentAvatarUrl } from '@/utils/studentAvatar';

export default function CoordinatorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const activeSchoolId = useSchoolAdminStore(state => state.activeSchoolId);
  const effectiveSchoolId = React.useMemo(() => {
    return resolveEffectiveSchoolId(user, activeSchoolId, 'sch-jjrosseau');
  }, [user, activeSchoolId]);

  const institutionsList = useSchoolAdminStore(state => state.institutionsList);
  const schoolGovernance = useSchoolAdminStore(state => state.schoolGovernance);
  const campusesList = useSchoolAdminStore(state => state.campusesList);
  const detailedStudentsRaw = useSchoolAdminStore(state => state.detailedStudents);
  const groupsListRaw = useSchoolAdminStore(state => state.groupsList);
  const schedulesListRaw = useSchoolAdminStore(state => state.schedulesList);
  const subjectsListRaw = useSchoolAdminStore(state => state.subjectsList);
  const teachersListRaw = useSchoolAdminStore(state => state.teachersList);
  const schoolSettings = useSchoolAdminStore(state => state.schoolSettings);

  const schoolInfo = React.useMemo(() => {
    return institutionsList.find(i => i.id === effectiveSchoolId) || institutionsList[0] || {
      id: 'sch-jjrosseau',
      name: 'UP Juan Jacobo Rosseau',
      website: 'https://jjrosseau.edu.mx'
    };
  }, [institutionsList, effectiveSchoolId]);

  const schoolDomain = React.useMemo(() => {
    return getSchoolEmailDomain(schoolInfo);
  }, [schoolInfo]);

  const currentGovernance = React.useMemo(() => {
    return getSchoolGovernance(schoolGovernance, effectiveSchoolId);
  }, [schoolGovernance, effectiveSchoolId]);

  // Aislamiento Multi-Colegio Estricto: Ningún dato de otro colegio es visible para este coordinador
  const schoolCampuses = React.useMemo(() => {
    return getSchoolCampuses(campusesList, effectiveSchoolId);
  }, [campusesList, effectiveSchoolId]);

  const detailedStudents = React.useMemo(() => {
    return getSchoolStudents(detailedStudentsRaw, effectiveSchoolId, schoolCampuses);
  }, [detailedStudentsRaw, effectiveSchoolId, schoolCampuses]);

  const groupsList = React.useMemo(() => {
    return getSchoolGroups(groupsListRaw, effectiveSchoolId, schoolCampuses);
  }, [groupsListRaw, effectiveSchoolId, schoolCampuses]);

  const subjectsList = React.useMemo(() => {
    return getSchoolSubjects(subjectsListRaw, effectiveSchoolId, schoolCampuses);
  }, [subjectsListRaw, effectiveSchoolId, schoolCampuses]);

  const teachersList = React.useMemo(() => {
    return getSchoolTeachers(teachersListRaw, effectiveSchoolId, schoolCampuses);
  }, [teachersListRaw, effectiveSchoolId, schoolCampuses]);

  const schedulesList = React.useMemo(() => {
    return getSchoolSchedules(schedulesListRaw, effectiveSchoolId, groupsList);
  }, [schedulesListRaw, effectiveSchoolId, groupsList]);

  const registerStudent = useSchoolAdminStore(state => state.registerStudent);
  const generateGroupsForGrade = useSchoolAdminStore(state => state.generateGroupsForGrade);
  const assignStudentToGroup = useSchoolAdminStore(state => state.assignStudentToGroup);
  const updateStudentStatus = useSchoolAdminStore(state => state.updateStudentStatus);
  const updateStudent = useSchoolAdminStore(state => state.updateStudent);
  const addTeacherNote = useSchoolAdminStore(state => state.addTeacherNote);
  const addBehaviorReport = useSchoolAdminStore(state => state.addBehaviorReport);
  const deleteBehaviorReport = useSchoolAdminStore(state => state.deleteBehaviorReport);
  const deleteTeacherNote = useSchoolAdminStore(state => state.deleteTeacherNote);
  const parentMessages = useSchoolAdminStore(state => state.parentMessages);
  const createSchedule = useSchoolAdminStore(state => state.createSchedule);
  const deleteSchedule = useSchoolAdminStore(state => state.deleteSchedule);
  const deleteGroup = useSchoolAdminStore(state => state.deleteGroup);
  const saveSchoolSettings = useSchoolAdminStore(state => state.saveSchoolSettings);

  const createSubject = useSchoolAdminStore(state => state.createSubject);
  const deleteSubject = useSchoolAdminStore(state => state.deleteSubject);
  const registerTeacher = useSchoolAdminStore(state => state.registerTeacher);
  const updateTeacher = useSchoolAdminStore(state => state.updateTeacher);
  const deleteTeacher = useSchoolAdminStore(state => state.deleteTeacher);

  const deleteStudent = useSchoolAdminStore(state => state.deleteStudent);

  // Permiso Directivo Estricto: Solo Directivos hacia arriba (director, owner, admin, superadmin) pueden eliminar alumnos
  const canDeleteStudent = Boolean(
    user && (
      user.role === 'superadmin' ||
      user.role === 'admin' ||
      user.role === 'owner' ||
      user.role === 'director' ||
      (ROLE_HIERARCHY_LEVEL[user.role as UserRole] !== undefined && ROLE_HIERARCHY_LEVEL[user.role as UserRole] <= 3)
    )
  );

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Traslado de colegio / Solicitud familiar');
  const [deletionToast, setDeletionToast] = useState<string | null>(null);

  const handleDeleteStudentFromExpediente = () => {
    if (!selectedStudent) return;
    const studentToDelete = selectedStudent;
    const operator = {
      id: user?.id || 'usr-dir',
      name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Directivo',
      role: (user?.role as UserRole) || 'director',
      email: user?.email || 'directivo@iskool.edu.mx'
    };

    const result = deleteStudent(studentToDelete.id, {
      reason: deleteReason,
      operatorUser: operator
    });

    if (result.success) {
      setIsConfirmDeleteOpen(false);
      setSelectedStudent(null);
      setDeletionToast(`✅ Alumno ${studentToDelete.first_name} ${studentToDelete.last_name_1} eliminado del sistema. Baja auditada con fecha exacta en Super Usuario.`);
      setTimeout(() => setDeletionToast(null), 6000);
    }
  };

  const setDetailedStudents = (val: DetailedStudent[] | ((prev: DetailedStudent[]) => DetailedStudent[])) => {
    const current = useSchoolAdminStore.getState().detailedStudents;
    const next = typeof val === 'function' ? (val as Function)(current) : val;
    useSchoolAdminStore.setState({ detailedStudents: next });
  };

  const subjects = subjectsList;

  // Gestión de Pestañas
  const [activeTab, setActiveTab] = useState<'students' | 'groups' | 'schedules' | 'settings'>('students');

  // --- ESTADOS DE GESTIÓN Y EDICIÓN DE ALUMNOS ---
  const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
  const [editingStudentData, setEditingStudentData] = useState<Partial<DetailedStudent>>({});

  const [showAddNoteForm, setShowAddNoteForm] = useState(false);
  const [newTeacherNoteText, setNewTeacherNoteText] = useState('');
  const [newTeacherNoteName, setNewTeacherNoteName] = useState('Israel López');

  const [showAddReportForm, setShowAddReportForm] = useState(false);
  const [newReportDescription, setNewReportDescription] = useState('');
  const [newReportReporter, setNewReportReporter] = useState('Coordinación Académica');

  // --- ESTADOS DE GESTIÓN DE PROFESORES ---
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [teacherToDelete, setTeacherToDelete] = useState<UserProfile | null>(null);
  const [teacherFormData, setTeacherFormData] = useState({ first_name: '', last_name: '', email: '' });

  // --- ESTADOS ONBOARDING INTERACTIVO ---
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<SchoolSettings>({
    isConfigured: false,
    name: schoolSettings.name || '',
    website: schoolSettings.website || '',
    logoUrl: schoolSettings.logoUrl || '',
    cct: schoolSettings.cct || '',
    address: schoolSettings.address || '',
    phone: schoolSettings.phone || '',
    coordinators: schoolSettings.coordinators || [''],
    teachers: (teachersList && teachersList.length > 0) ? teachersList.map(t => `${t.first_name} ${t.last_name}`.trim()) : (schoolSettings.teachers || ['']),
    themeColors: schoolSettings.themeColors || {
      primary: '250 84% 54%',
      secondary: '221 83% 53%',
      accent: '142 71% 45%'
    }
  });

  // Redirección si es alumno
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'student') {
        router.push('/student');
      }
    }
  }, [user, authLoading, router]);

  // Mantener sincronizada la lista de profesores registrada en el sistema con el abordaje de onboarding
  useEffect(() => {
    if (teachersList && teachersList.length > 0) {
      const names = teachersList.map(t => `${t.first_name} ${t.last_name}`.trim()).filter(Boolean);
      setOnboardingData(prev => ({
        ...prev,
        teachers: names
      }));
    }
  }, [teachersList]);

  const [simulatedDomainName, setSimulatedDomainName] = useState('');
  const [isSimulatingColors, setIsSimulatingColors] = useState(false);
  const [showColorSuccess, setShowColorSuccess] = useState(false);

  // --- FUNCIONES AUXILIARES DE COLOR Y EXTRACTION DE LOGO ---
  const hslToHex = (hslStr: string) => {
    if (!hslStr) return '#4f46e5';
    const parts = hslStr.replace(/%/g, '').split(/\s+/).map(Number);
    if (parts.length < 3) return '#4f46e5';
    const h = parts[0] / 360;
    const s = parts[1] / 100;
    const l = parts[2] / 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      const hue2rgb = (pVal: number, qVal: number, tVal: number) => {
        let t = tVal;
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return pVal + (qVal - pVal) * 6 * t;
        if (t < 1/2) return qVal;
        if (t < 2/3) return pVal + (qVal - pVal) * (2/3 - t) * 6;
        return pVal;
      };
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    const toHex = (x: number) => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const hexToHsl = (hex: string) => {
    if (!hex || hex.length < 7) return '250 84% 54%';
    let r = parseInt(hex.slice(1, 3), 16) / 255;
    let g = parseInt(hex.slice(3, 5), 16) / 255;
    let b = parseInt(hex.slice(5, 7), 16) / 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      let d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch(max){
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const handleLogoFileUpload = (
    file: File, 
    onSuccess: (logoUrl: string, colors?: { primary: string; secondary: string; accent: string }) => void
  ) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      const img = new window.Image();
      img.src = dataUrl;
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            canvas.width = 50;
            canvas.height = 50;
            ctx.drawImage(img, 0, 0, 50, 50);
            const imgData = ctx.getImageData(0, 0, 50, 50).data;

            let totalR = 0, totalG = 0, totalB = 0, count = 0;
            for (let i = 0; i < imgData.length; i += 16) {
              const alpha = imgData[i + 3];
              if (alpha > 128) {
                totalR += imgData[i];
                totalG += imgData[i + 1];
                totalB += imgData[i + 2];
                count++;
              }
            }

            if (count > 0) {
              const r = (totalR / count) / 255;
              const g = (totalG / count) / 255;
              const b = (totalB / count) / 255;
              const max = Math.max(r, g, b), min = Math.min(r, g, b);
              let h = 0, s = 0, l = (max + min) / 2;
              if (max !== min) {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch(max) {
                  case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                  case g: h = (b - r) / d + 2; break;
                  case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
              }
              const primary = `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
              const secondary = `${(Math.round(h * 360) + 40) % 360} ${Math.max(20, Math.round(s * 100) - 20)}% ${Math.max(20, Math.round(l * 100) - 10)}%`;
              const accent = `${(Math.round(h * 360) + 160) % 360} 75% 45%`;

              onSuccess(dataUrl, { primary, secondary, accent });
              return;
            }
          }
        } catch (e) {
          console.warn("Logo color extraction exception:", e);
        }
        onSuccess(dataUrl);
      };
    };
    reader.readAsDataURL(file);
  };


  // --- FILTROS Y ESTADOS DE ALUMNOS ---
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'primaria' | 'secundaria' | 'preparatoria'>('all');
  const [groupFilter, setGroupFilter] = useState<'all' | 'assigned' | 'unassigned'>('all');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DetailedStudent | null>(null);

  // Formulario de Registro
  const [newStudentData, setNewStudentData] = useState({
    first_name: '',
    second_name: '',
    last_name_1: '',
    last_name_2: '',
    birth_date: '',
    curp: '',
    enrollment_id: '',
    gender: 'Masculino',
    shift: 'matutino' as const,
    address: '',
    phone: '',
    email: '',
    father_name: '',
    mother_name: '',
    tutor_name: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    blood_type: 'O+',
    medical_notes: '',
    academic_notes: '',
    level: 'primaria' as const,
    grade: '1º',
    previous_school: '',
  });

  // --- ESTADOS DE GRUPOS ---
  const [selectedGroupLevel, setSelectedGroupLevel] = useState<'primaria' | 'secundaria' | 'preparatoria'>('primaria');
  const [selectedGroupGrade, setSelectedGroupGrade] = useState('1º');
  const [customGroupName, setCustomGroupName] = useState('');

  // --- ESTADOS DE HORARIOS ---
  const [activeGroupId, setActiveGroupId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes'>('Lunes');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('usr-teacher-1'); // Default
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('08:00 - 09:30');

  // Lista de profesores del store
  const TEACHERS = React.useMemo(() => teachersList.map(t => ({
    id: t.id,
    name: `${t.first_name} ${t.last_name} (${t.email})`
  })), [teachersList]);

  // Horarios de tiempo disponibles
  const TIME_SLOTS = [
    '08:00 - 09:30',
    '09:30 - 11:00',
    '11:00 - 11:30 (Receso)',
    '11:30 - 13:00',
    '13:00 - 14:30'
  ];

  // Cálculo de edad dinámico
  const calculateAge = (birthDateStr: string) => {
    if (!birthDateStr) return 0;
    const birthDate = new Date(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Formateador de nombres de estudiantes (apellidos primero)
  const formatStudentName = (student: DetailedStudent | { first_name: string; last_name: string; second_name?: string; last_name_1?: string; last_name_2?: string }) => {
    if ('last_name_1' in student && student.last_name_1) {
      const ap1 = student.last_name_1;
      const ap2 = student.last_name_2 ? ` ${student.last_name_2}` : '';
      const n1 = student.first_name;
      const n2 = student.second_name ? ` ${student.second_name}` : '';
      return `${ap1}${ap2}, ${n1}${n2}`.trim();
    } else {
      const lastName = ('last_name' in student) ? student.last_name : '';
      const firstName = student.first_name || '';
      return `${lastName}, ${firstName}`.trim();
    }
  };

  // Generador de CURP simulado (Premium)
  const generateSimulatedCurp = () => {
    const fn = newStudentData.first_name.toUpperCase().slice(0, 2);
    const ap1 = newStudentData.last_name_1.toUpperCase().slice(0, 2);
    const ap2 = newStudentData.last_name_2 ? newStudentData.last_name_2.toUpperCase().slice(0, 1) : 'X';
    const dateStr = newStudentData.birth_date ? newStudentData.birth_date.replace(/-/g, '').slice(2, 8) : '250101';
    const randomHex = Math.floor(100 + Math.random() * 900);
    const gen = newStudentData.gender === 'Masculino' ? 'H' : 'M';
    const result = `${ap1}${ap2}${fn}${dateStr}${gen}DFMRN${randomHex}`;
    
    setNewStudentData(prev => ({
      ...prev,
      curp: result,
      enrollment_id: `MAT-2026-${Math.floor(100 + Math.random() * 900)}`
    }));
  };

  // Submit del registro
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentData.first_name || !newStudentData.last_name_1 || !newStudentData.birth_date) {
      alert('Favor de completar los campos obligatorios: Nombre, Primer Apellido y Fecha de Nacimiento.');
      return;
    }

    const curpVal = newStudentData.curp || `SIM-${Date.now()}`;
    const enrolVal = newStudentData.enrollment_id || `MAT-${Date.now().toString().slice(-4)}`;

    const prefix = (newStudentData.email && newStudentData.email.includes('@') 
      ? newStudentData.email.split('@')[0] 
      : `${newStudentData.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newStudentData.last_name_1.toLowerCase().replace(/[^a-z0-9]/g, '')}`).trim();
    const studentEmail = `${prefix}@${schoolDomain}`;

    registerStudent({
      ...newStudentData,
      school_id: effectiveSchoolId,
      email: studentEmail,
      curp: curpVal,
      enrollment_id: enrolVal,
      status: 'activo'
    });

    alert(`¡Alumno ${newStudentData.first_name} registrado exitosamente con correo ${studentEmail}!`);
    setIsRegisterModalOpen(false);

    // Limpiar formulario
    setNewStudentData({
      first_name: '',
      second_name: '',
      last_name_1: '',
      last_name_2: '',
      birth_date: '',
      curp: '',
      enrollment_id: '',
      gender: 'Masculino',
      shift: 'matutino',
      address: '',
      phone: '',
      email: '',
      father_name: '',
      mother_name: '',
      tutor_name: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      blood_type: 'O+',
      medical_notes: '',
      academic_notes: '',
      level: 'primaria',
      grade: '1º',
      previous_school: '',
    });
  };

  // --- ESTADOS DE ORDENAMIENTO ---
  const [sortField, setSortField] = useState<'enrollment_id' | 'name' | 'age' | 'level' | 'group' | 'status'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filtrado de alumnos memoizado para alta velocidad
  const filteredStudents = React.useMemo(() => {
    return detailedStudents.filter(s => {
      const fullName = `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || 
                            (s.curp && s.curp.toLowerCase().includes(searchQuery.toLowerCase())) ||
                            (s.enrollment_id && s.enrollment_id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesLevel = levelFilter === 'all' || s.level === levelFilter;

      let matchesGroup = true;
      if (groupFilter === 'assigned') matchesGroup = !!s.group_id;
      if (groupFilter === 'unassigned') matchesGroup = !s.group_id;

      return matchesSearch && matchesLevel && matchesGroup;
    });
  }, [detailedStudents, searchQuery, levelFilter, groupFilter]);

  // Ordenar filteredStudents dinámicamente según columna seleccionada
  const sortedStudents = React.useMemo(() => {
    return [...filteredStudents].sort((a, b) => {
      let comparison = 0;
      
      if (sortField === 'enrollment_id') {
        comparison = (a.enrollment_id || '').localeCompare(b.enrollment_id || '');
      } else if (sortField === 'name') {
        comparison = formatStudentName(a).localeCompare(formatStudentName(b));
      } else if (sortField === 'age') {
        comparison = calculateAge(a.birth_date) - calculateAge(b.birth_date);
      } else if (sortField === 'level') {
        const lvlA = `${a.level} ${a.grade}`;
        const lvlB = `${b.level} ${b.grade}`;
        comparison = lvlA.localeCompare(lvlB);
      } else if (sortField === 'group') {
        const gpA = groupsList.find(g => g.id === a.group_id)?.name || 'Sin grupo';
        const gpB = groupsList.find(g => g.id === b.group_id)?.name || 'Sin grupo';
        comparison = gpA.localeCompare(gpB);
      } else if (sortField === 'status') {
        comparison = (a.status || '').localeCompare(b.status || '');
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredStudents, sortField, sortDirection, groupsList]);

  // Manejador de clic en cabecera
  const handleSortClick = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Opciones de grados dependiendo del nivel seleccionado
  const getGradesForLevel = (lvl: 'primaria' | 'secundaria' | 'preparatoria') => {
    if (lvl === 'primaria') return ['1º', '2º', '3º', '4º', '5º', '6º'];
    if (lvl === 'secundaria') return ['1º', '2º', '3º'];
    return ['1º Semestre', '2º Semestre', '3º Semestre', '4º Semestre', '5º Semestre', '6º Semestre'];
  };

  // Filtrar grupos en pantalla por grado/nivel activo
  const activeLevelGradeKey = `${selectedGroupLevel}-${selectedGroupGrade.replace(/\s+/g, '')}`;
  const currentGroupsInGrade = groupsList.filter(g => g.level_grade_id === activeLevelGradeKey);

  // Alumnos del nivel/grado seleccionado
  const studentsInGrade = detailedStudents.filter(s => s.level === selectedGroupLevel && s.grade === selectedGroupGrade);
  const studentsUnassignedInGrade = studentsInGrade.filter(s => !s.group_id);

  // Crear grupo personalizado
  const handleCreateGroup = () => {
    if (!customGroupName.trim()) return;
    generateGroupsForGrade(selectedGroupLevel, selectedGroupGrade, [customGroupName.trim().toUpperCase()]);
    setCustomGroupName('');
    alert(`Grupo "${customGroupName.toUpperCase()}" creado.`);
  };

  // Autogenerar grupos A y B
  const handleAutoGroups = () => {
    generateGroupsForGrade(selectedGroupLevel, selectedGroupGrade, ['A', 'B']);
    alert(`Grupos A y B conformados y balanceados al 50% para ${selectedGroupGrade} de ${selectedGroupLevel}.`);
  };

  // Crear horario
  const handleAddSchedule = () => {
    if (!activeGroupId) {
      alert('Favor de seleccionar un grupo primero.');
      return;
    }
    if (!selectedSubject) {
      alert('Favor de seleccionar una asignatura.');
      return;
    }

    createSchedule({
      groupId: activeGroupId,
      subjectId: selectedSubject,
      teacherId: selectedTeacher,
      dayOfWeek: selectedDay,
      timeSlot: selectedTimeSlot
    });

    alert('Horario programado correctamente.');
  };

  // Obtener info visual del horario
  const getSubjectColor = (subjectId: string) => {
    if (subjectId === 'sub-math') return 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-950/40 dark:border-blue-800 dark:text-blue-300';
    if (subjectId === 'sub-span') return 'bg-orange-100 border-orange-300 text-orange-800 dark:bg-orange-950/40 dark:border-orange-800 dark:text-orange-300';
    if (subjectId === 'sub-sci') return 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300';
    return 'bg-violet-100 border-violet-300 text-violet-800 dark:bg-violet-950/40 dark:border-violet-800 dark:text-violet-300';
  };

  const getSubjectIcon = (subjectId: string) => {
    if (subjectId === 'sub-math') return Calculator;
    if (subjectId === 'sub-span') return BookOpen;
    return Activity;
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500" />
          <p className="text-xs font-bold text-zinc-400">Verificando credenciales de Coordinación...</p>
        </div>
      </div>
    );
  }

  const isCoordinatorOrHigher = user && ['coordinator', 'director', 'admin', 'superadmin', 'owner'].includes(user.role);

  if (!isCoordinatorOrHigher) {
    const getRedirectInfo = () => {
      switch (user?.role) {
        case 'student':
          return { label: 'Ir a mi Portal de Alumno', path: '/student' };
        case 'teacher':
          return { label: 'Ir a mi Portal Docente', path: '/teacher' };
        case 'billing':
          return { label: 'Ir a mi Portal de Cobranza', path: '/coordinator/billing' };
        case 'parent':
        case 'tutor':
          return { label: 'Ir a mi Portal Familiar', path: '/parent' };
        default:
          return { label: 'Iniciar Sesión', path: '/login' };
      }
    };

    const redirectInfo = getRedirectInfo();

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-white">Acceso Restringido</h2>
          <p className="text-xs text-zinc-400">El módulo de Coordinación y Control Escolar es de uso exclusivo para Coordinadores Académicos y Dirección de Plantel.</p>
          <button
            onClick={() => router.push(redirectInfo.path)}
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs shadow-lg shadow-violet-600/30 cursor-pointer transition-all"
          >
            {redirectInfo.label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Header />

      {/* Notificación de Baja de Alumno */}
      {deletionToast && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-400/30 animate-bounce text-xs font-black">
          <CheckCircle2 className="h-5 w-5 text-emerald-200" />
          <span>{deletionToast}</span>
        </div>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
        
        {/* Banner Coordinador */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm">
          <div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest bg-violet-50 dark:bg-violet-950/50 px-2.5 py-1 rounded-md">Panel de Control de Coordinación</span>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white mt-2">Módulo de Administración Académica</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Escuela: <strong>{schoolInfo.name}</strong> (<span className="font-mono text-violet-500">@{schoolDomain}</span>) | Administra altas, conforma grupos y define horarios.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-950 p-1 rounded-xl border border-zinc-200/45 dark:border-zinc-850 self-stretch md:self-auto">
            <button
              onClick={() => setActiveTab('students')}
              style={activeTab === 'students' ? { color: 'var(--brand-primary)' } : undefined}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'students'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Expedientes ({detailedStudents.length})
            </button>
            <button
              onClick={() => setActiveTab('groups')}
              style={activeTab === 'groups' ? { color: 'var(--brand-primary)' } : undefined}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'groups'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Conformar Grupos
            </button>
            <button
              onClick={() => setActiveTab('schedules')}
              style={activeTab === 'schedules' ? { color: 'var(--brand-primary)' } : undefined}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'schedules'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Horarios de Clases
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              style={activeTab === 'settings' ? { color: 'var(--brand-primary)' } : undefined}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-zinc-800 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400'
              }`}
            >
              Identidad de Escuela
            </button>
            {currentGovernance.allowCoordinatorBilling ? (
              <Link
                href="/coordinator/billing"
                className="px-3.5 py-2 rounded-lg text-xs font-bold transition-all bg-blue-700 hover:bg-blue-600 text-white flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Landmark className="w-3.5 h-3.5" />
                <span>Cobranza</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => alert("🔒 La función de Cobranza y Aranceles ha sido restringida para Coordinación por la Dirección del Colegio.")}
                title="Acceso restringido por la Dirección"
                className="px-3.5 py-2 rounded-lg text-xs font-bold transition-all bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 cursor-not-allowed opacity-80"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Cobranza (Bloqueado)</span>
              </button>
            )}
            <Link
              href="/coordinator/fiscal"
              className="px-3.5 py-2 rounded-lg text-xs font-bold transition-all bg-emerald-700 hover:bg-emerald-600 text-white flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Facturación SAT</span>
            </Link>
          </div>
        </div>

        {/* --- PESTAÑA 1: EXPEDIENTES Y ALTA --- */}
        {activeTab === 'students' && (
          <div className="flex flex-col gap-6">
            {/* Barra de Filtros */}
            <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 flex-col sm:flex-row gap-3 w-full">
                {/* Búsqueda */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre, CURP o matrícula..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none focus:border-brand-primary text-zinc-900 dark:text-white"
                  />
                </div>
                {/* Nivel */}
                <select
                  value={levelFilter}
                  onChange={(e: any) => setLevelFilter(e.target.value)}
                  className="p-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">Todos los Niveles</option>
                  <option value="primaria">Primaria</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="preparatoria">Preparatoria</option>
                </select>
                {/* Asignación */}
                <select
                  value={groupFilter}
                  onChange={(e: any) => setGroupFilter(e.target.value)}
                  className="p-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-brand-primary"
                >
                  <option value="all">Todos (Con y Sin Grupo)</option>
                  <option value="assigned">Con Grupo Asignado</option>
                  <option value="unassigned">Sin Grupo Asignado</option>
                </select>
              </div>

              {/* Botón de Alta */}
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                style={{ backgroundColor: 'var(--brand-primary)' }}
                className="w-full md:w-auto px-5 py-2.5 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md hover:opacity-90"
              >
                <UserPlus className="h-4.5 w-4.5" />
                Dar de Alta Alumno
              </button>
            </div>

            {/* Listado de Alumnos */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead className="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-800 font-bold text-zinc-400 uppercase tracking-wider select-none">
                    <tr>
                      <th 
                        className="p-4 px-6 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('enrollment_id')}
                      >
                        <div className="flex items-center gap-1">
                          Matrícula / CURP
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'enrollment_id' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('name')}
                      >
                        <div className="flex items-center gap-1">
                          Nombre Completo
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'name' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('age')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Edad
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'age' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('level')}
                      >
                        <div className="flex items-center gap-1">
                          Nivel / Grado
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'level' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th 
                        className="p-4 cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('group')}
                      >
                        <div className="flex items-center gap-1">
                          Grupo Asignado
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'group' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                      <th className="p-4">Contacto</th>
                      <th 
                        className="p-4 text-center cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-250 transition-colors"
                        onClick={() => handleSortClick('status')}
                      >
                        <div className="flex items-center justify-center gap-1">
                          Estado
                          <span className="text-[10px] text-violet-500 font-bold">
                            {sortField === 'status' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ' ↕'}
                          </span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-800 dark:text-zinc-200">
                    {sortedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-zinc-400">
                          <AlertCircle className="h-10 w-10 mx-auto text-zinc-300 mb-2" />
                          No se encontraron expedientes con los filtros aplicados.
                        </td>
                      </tr>
                    ) : (
                      sortedStudents.map((student, idx) => {
                        const age = calculateAge(student.birth_date);
                        const assignedGroup = groupsList.find(g => g.id === student.group_id);
                        
                        return (
                          <tr key={`${student.id}-${student.curp || idx}`} className="hover:bg-zinc-50/55 dark:hover:bg-zinc-850/40 transition-colors">
                            <td className="p-4 px-6 font-mono text-[10.5px]">
                              <span className="font-extrabold text-zinc-900 dark:text-white block">{student.enrollment_id}</span>
                              <span className="text-zinc-400 block mt-0.5">{student.curp}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="relative h-9 w-9 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-700 flex-shrink-0 shadow-sm bg-zinc-100 dark:bg-zinc-800">
                                  <img 
                                    src={getStudentAvatarUrl(student)} 
                                    alt={formatStudentName(student)} 
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80';
                                    }}
                                  />
                                </div>
                                <div>
                                  <button 
                                    onClick={() => setSelectedStudent(student)}
                                    className="font-bold text-zinc-900 dark:text-white text-sm hover:text-violet-600 dark:hover:text-violet-400 hover:underline transition-colors text-left focus:outline-none block"
                                  >
                                    {formatStudentName(student)}
                                  </button>
                                  {student.medical_notes && (
                                    <span className="inline-flex items-center gap-0.5 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-200/20 mt-0.5" title={student.medical_notes}>
                                      <ShieldAlert className="h-3 w-3" /> Médicos
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-center font-extrabold text-sm">{age} años</td>
                            <td className="p-4 capitalize">
                              <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[10px] font-bold mr-1">
                                {student.level}
                              </span>
                              <span className="font-semibold text-zinc-500">{student.grade}</span>
                            </td>
                            <td className="p-4">
                              {assignedGroup ? (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-400 font-extrabold text-[10.5px]">
                                  Grupo {assignedGroup.name}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400 text-[10px] font-bold">
                                  Sin grupo
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex flex-col text-[10.5px] text-zinc-500 leading-tight">
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3" /> {student.phone || 'S/T'}</span>
                                <span className="flex items-center gap-1 mt-0.5"><Mail className="h-3 w-3" /> {student.email || 'S/C'}</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <select
                                value={student.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value as 'activo' | 'suspendido' | 'baja';
                                  updateStudentStatus(student.id, newStatus);
                                }}
                                className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer transition-all ${
                                  student.status === 'activo'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                    : student.status === 'suspendido'
                                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                                    : 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800'
                                }`}
                              >
                                <option value="activo" className="bg-white dark:bg-zinc-900 text-emerald-600 font-bold">🟢 Activo</option>
                                <option value="suspendido" className="bg-white dark:bg-zinc-900 text-amber-600 font-bold">🟡 Suspendido</option>
                                <option value="baja" className="bg-white dark:bg-zinc-900 text-rose-600 font-bold">🔴 Baja</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- PESTAÑA 2: CONFORMAR GRUPOS --- */}
        {activeTab === 'groups' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LADO IZQUIERDO: CONFIGURADOR DE NIVEL Y GRUPOS (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Tarjeta de Grado/Nivel */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Filter className="h-4.5 w-4.5 text-violet-500" />
                  1. Grado a gestionar
                </h3>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nivel Educativo</label>
                  <select
                    value={selectedGroupLevel}
                    onChange={(e: any) => {
                      setSelectedGroupLevel(e.target.value);
                      setSelectedGroupGrade(getGradesForLevel(e.target.value)[0]);
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="primaria">Primaria</option>
                    <option value="secundaria">Secundaria</option>
                    <option value="preparatoria">Preparatoria</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Grado Escolar</label>
                  <select
                    value={selectedGroupGrade}
                    onChange={(e) => setSelectedGroupGrade(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    {getGradesForLevel(selectedGroupLevel).map(gr => (
                      <option key={gr} value={gr}>{gr}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Generador de Grupos */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Plus className="h-4.5 w-4.5 text-violet-500" />
                  2. Generar Grupos
                </h3>

                <p className="text-[10px] text-zinc-400 leading-normal">
                  Crea grupos en el grado de forma individual o utiliza el conformador automático.
                </p>

                {/* Individual */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customGroupName}
                    onChange={(e) => setCustomGroupName(e.target.value)}
                    placeholder="Letra/Nombre (ej. C)"
                    maxLength={10}
                    className="flex-1 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs text-center font-extrabold focus:outline-none focus:border-violet-500 text-zinc-900 dark:text-white"
                  />
                  <button
                    onClick={handleCreateGroup}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold"
                  >
                    Crear
                  </button>
                </div>

                {/* Automático */}
                <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                  <button
                    onClick={handleAutoGroups}
                    className="w-full py-2 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-500" />
                    Conformar A y B
                  </button>
                </div>
              </div>

            </div>

            {/* LADO DERECHO: INTERFAZ DE ASIGNACIÓN (lg:col-span-8) */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              
              {/* Alumnos Sin Grupo */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
                  <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <User className="h-4.5 w-4.5 text-red-500" />
                    Alumnos por Asignar en {selectedGroupGrade} de {selectedGroupLevel}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                    {studentsUnassignedInGrade.length} sin grupo
                  </span>
                </div>

                {/* Buscador de alumnos por asignar */}
                <div className="mb-4 relative">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-zinc-400" />
                  <input
                    type="text"
                    id="search-unassigned-input"
                    placeholder="Buscar alumno sin grupo por nombre o CURP..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-xs focus:outline-none focus:border-brand-primary text-zinc-900 dark:text-white"
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const items = document.querySelectorAll('.unassigned-student-card');
                      items.forEach((item: any) => {
                        const text = item.getAttribute('data-search-text').toLowerCase();
                        if (text.includes(val)) {
                          item.style.display = 'flex';
                        } else {
                          item.style.display = 'none';
                        }
                      });
                    }}
                  />
                </div>

                {studentsUnassignedInGrade.length === 0 ? (
                  <p className="text-xs text-zinc-400 text-center py-4">Todos los alumnos de este grado ya tienen grupo asignado.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {studentsUnassignedInGrade.map(std => (
                      <div 
                        key={std.id} 
                        data-search-text={`${std.first_name} ${std.second_name || ''} ${std.last_name_1} ${std.last_name_2 || ''} ${std.curp || ''}`}
                        className="unassigned-student-card p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-zinc-900 dark:text-white">
                            {std.first_name} {std.last_name_1}
                          </p>
                          <p className="text-[9px] text-zinc-400">{std.curp}</p>
                        </div>
                        
                        {/* Selector de Grupo */}
                        <select
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              assignStudentToGroup(std.id, e.target.value);
                              alert(`Alumno asignado.`);
                            }
                          }}
                          className="text-[10px] p-1.5 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 focus:outline-none focus:border-violet-500 font-bold"
                        >
                          <option value="" disabled>Asignar a...</option>
                          {currentGroupsInGrade.map(g => (
                            <option key={g.id} value={g.id}>Grupo {g.name}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tarjetas de Grupos Existentes */}
              <div className="flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider">Grupos del Grado</h3>
                
                {currentGroupsInGrade.length === 0 ? (
                  <div className="bg-zinc-100 dark:bg-zinc-900/40 border border-zinc-200/40 p-8 text-center text-xs text-zinc-400 rounded-3xl">
                    No hay grupos conformados en este grado aún. ¡Crea uno usando el panel de la izquierda!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {currentGroupsInGrade.map(group => {
                      const studentsInGroup = studentsInGrade.filter(s => s.group_id === group.id);
                      
                      return (
                        <div key={group.id} className="relative bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                          
                          {/* Botón de Cruz para eliminar grupo individual */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Estás seguro de que deseas eliminar el Grupo ${group.name}? Los alumnos asignados quedarán sin grupo.`)) {
                                deleteGroup(group.id);
                              }
                            }}
                            className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 cursor-pointer pointer-events-auto transition-colors"
                            title="Eliminar Grupo"
                          >
                            <X className="h-4.5 w-4.5" />
                          </button>

                          <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-2 pr-8">
                            <span className="font-extrabold text-sm text-zinc-900 dark:text-white flex items-center gap-1.5">
                              <Users className="h-4.5 w-4.5 text-violet-500" />
                              Grupo {group.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-bold">{studentsInGroup.length} alumnos</span>
                          </div>

                          {/* Listado de alumnos */}
                          <div className="flex flex-col gap-2 max-h-52 overflow-y-auto pr-1">
                            {studentsInGroup.length === 0 ? (
                              <p className="text-[10px] text-zinc-400 text-center py-2">Vacío sin alumnos.</p>
                            ) : (
                              studentsInGroup.map(std => (
                                <div key={std.id} className="flex justify-between items-center p-1.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-950 text-[10.5px]">
                                  <span className="font-bold text-zinc-800 dark:text-zinc-200">
                                    {formatStudentName(std)}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => assignStudentToGroup(std.id, '')}
                                    className="text-[9.5px] font-bold text-red-500 hover:text-red-750 hover:underline transition-colors"
                                  >
                                    Remover
                                  </button>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* --- PESTAÑA 3: HORARIOS DE CLASES --- */}
        {activeTab === 'schedules' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LADO IZQUIERDO: PROGRAMADOR DE HORAS (lg:col-span-4) */}
            <div className="lg:col-span-4 flex flex-col gap-6">
              
              {/* Programador Form */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Calendar className="h-4.5 w-4.5 text-violet-500" />
                  Programar Bloque
                </h3>

                {/* Seleccionar Grupo */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Grupo a planificar</label>
                  <select
                    value={activeGroupId}
                    onChange={(e) => setActiveGroupId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-bold"
                  >
                    <option value="" disabled>Selecciona Grupo...</option>
                    {groupsList.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.level_grade_id.split('-').join(' ')} - Grupo {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Asignatura */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Asignatura</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="" disabled>Selecciona Materia...</option>
                    {subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Profesor */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Profesor Responsable</label>
                  <select
                    value={selectedTeacher}
                    onChange={(e) => setSelectedTeacher(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    {TEACHERS.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                {/* Seleccionar Día de la Semana */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Día de la Semana</label>
                  <select
                    value={selectedDay}
                    onChange={(e: any) => setSelectedDay(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                  >
                    <option value="Lunes">Lunes</option>
                    <option value="Martes">Martes</option>
                    <option value="Miércoles">Miércoles</option>
                    <option value="Jueves">Jueves</option>
                    <option value="Viernes">Viernes</option>
                  </select>
                </div>

                {/* Seleccionar Rango Horario */}
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Horario (Time Slot)</label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                  >
                    {TIME_SLOTS.map(ts => (
                      <option key={ts} value={ts}>{ts}</option>
                    ))}
                  </select>
                </div>

                {/* Añadir */}
                <button
                  onClick={handleAddSchedule}
                  className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-violet-500/10 flex items-center justify-center gap-1.5"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Clase al Horario
                </button>
              </div>

              {/* Gestor de Materias */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <BookOpen className="h-4.5 w-4.5 text-emerald-500" />
                  Gestión de Materias
                </h3>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre de la Materia</label>
                    <input
                      type="text"
                      id="new-subject-name"
                      placeholder="Ej. Robótica, Historia"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Código SEP</label>
                    <input
                      type="text"
                      id="new-subject-code"
                      placeholder="Ej. ROB-123"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Grado/Nivel Destino</label>
                    <select
                      id="new-subject-grade"
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-bold"
                    >
                      <option value="primaria-1º">Primaria - 1º</option>
                      <option value="primaria-4º">Primaria - 4º</option>
                      <option value="secundaria-2º">Secundaria - 2º</option>
                      <option value="preparatoria-4ºSemestre">Preparatoria - 4º Semestre</option>
                    </select>
                  </div>
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById('new-subject-name') as HTMLInputElement;
                      const codeInput = document.getElementById('new-subject-code') as HTMLInputElement;
                      const gradeSelect = document.getElementById('new-subject-grade') as HTMLSelectElement;
                      if (!nameInput.value.trim()) return alert('El nombre es requerido');
                      createSubject({
                        school_id: 'sch-1',
                        name: nameInput.value.trim(),
                        sep_code: codeInput.value.trim() || undefined,
                        level_grade_id: gradeSelect.value
                      });
                      nameInput.value = '';
                      codeInput.value = '';
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Registrar Materia
                  </button>
                </div>

                <div className="mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Materias Registradas</label>
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                    {subjects.map(sub => (
                      <div key={sub.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                        <div>
                          <div className="text-xs font-black text-zinc-800 dark:text-zinc-200">{sub.name}</div>
                          <div className="text-[9px] text-zinc-400 font-mono uppercase">{sub.level_grade_id.split('-').join(' ')} {sub.sep_code ? `| ${sub.sep_code}` : ''}</div>
                        </div>
                        {sub.id.startsWith('sub-') && sub.id !== 'sub-math' && sub.id !== 'sub-span' && sub.id !== 'sub-sci' ? (
                          <button
                            onClick={() => deleteSubject(sub.id)}
                            className="text-red-500 hover:text-red-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="text-[8px] font-bold text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Fijo</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Gestor de Profesores */}
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
                <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                  <Users className="h-4.5 w-4.5 text-blue-500" />
                  Gestión de Profesores
                </h3>
                
                <div className="flex flex-col gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre</label>
                      <input
                        type="text"
                        id="new-teacher-first-name"
                        placeholder="Ej. Juan"
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Apellidos</label>
                      <input
                        type="text"
                        id="new-teacher-last-name"
                        placeholder="Ej. Pérez"
                        className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-bold"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Correo Institucional Oficial</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        id="new-teacher-email-prefix"
                        placeholder="profesor.apellido"
                        className="flex-1 text-xs p-2.5 rounded-l-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-850 dark:text-zinc-100 focus:outline-none focus:border-violet-500 font-mono"
                      />
                      <span className="bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-l-0 border-zinc-200 dark:border-zinc-800 text-xs px-2.5 py-2.5 rounded-r-xl font-mono font-bold">
                        @{schoolDomain}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const firstInput = document.getElementById('new-teacher-first-name') as HTMLInputElement;
                      const lastInput = document.getElementById('new-teacher-last-name') as HTMLInputElement;
                      const prefixInput = document.getElementById('new-teacher-email-prefix') as HTMLInputElement;
                      if (!firstInput.value.trim() || !lastInput.value.trim()) return alert('Nombre y apellidos requeridos');
                      const rawPrefix = prefixInput?.value.trim().split('@')[0] || `${firstInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}.${lastInput.value.trim().toLowerCase().replace(/[^a-z0-9]/g, '')}`;
                      const teacherEmail = `${rawPrefix}@${schoolDomain}`;
                      registerTeacher({
                        first_name: firstInput.value.trim(),
                        last_name: lastInput.value.trim(),
                        school_id: effectiveSchoolId,
                        email: teacherEmail
                      });
                      firstInput.value = '';
                      lastInput.value = '';
                      if (prefixInput) prefixInput.value = '';
                      alert(`✅ Docente registrado exitosamente con correo ${teacherEmail}`);
                    }}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="h-4 w-4" />
                    Registrar Profesor
                  </button>
                </div>

                <div className="mt-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-2">Profesores Registrados</label>
                  <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pr-1">
                    {teachersList.map(t => (
                      <div key={t.id} className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800/80">
                        <div>
                          <div className="text-xs font-black text-zinc-800 dark:text-zinc-200">{t.first_name} {t.last_name}</div>
                          <div className="text-[9px] text-zinc-400 font-mono">{t.email}</div>
                        </div>
                        <span className="text-[8px] font-bold text-blue-600 bg-blue-100/50 dark:bg-blue-950 dark:text-blue-300 px-1.5 py-0.5 rounded">Docente</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* LADO DERECHO: GRID CALENDARIO SEMANAL (lg:col-span-8) */}
            <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 rounded-3xl shadow-sm flex flex-col gap-6">
              
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-3">
                <h3 className="text-xs font-black text-zinc-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-violet-500" />
                  Calendario Semanal del Grupo
                </h3>
                
                {activeGroupId && (
                  <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                    Grupo: {groupsList.find(g => g.id === activeGroupId)?.level_grade_id.split('-').join(' ')} - {groupsList.find(g => g.id === activeGroupId)?.name}
                  </span>
                )}
              </div>

              {!activeGroupId ? (
                <div className="p-16 text-center text-xs text-zinc-400">
                  <Clock className="h-12 w-12 mx-auto text-zinc-300 mb-2" />
                  Favor de seleccionar un grupo en el panel de la izquierda para desplegar su horario semanal.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Grid de días */}
                  <div className="grid grid-cols-5 gap-3">
                    {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'].map(day => {
                      const schedulesForDay = schedulesList.filter(s => s.groupId === activeGroupId && s.dayOfWeek === day);
                      
                      return (
                        <div key={day} className="flex flex-col gap-3 min-h-[400px]">
                          <span className="w-full text-center bg-zinc-100 dark:bg-zinc-950 py-1.5 rounded-lg text-[10.5px] font-black tracking-wider text-zinc-500 uppercase border border-zinc-200/30">
                            {day}
                          </span>

                          <div className="flex flex-col gap-2 flex-1 bg-zinc-50/50 dark:bg-zinc-950/20 p-1.5 rounded-xl border border-zinc-100 dark:border-zinc-850">
                            {schedulesForDay.length === 0 ? (
                              <span className="text-[9px] text-zinc-400 text-center py-6">Sin clases</span>
                            ) : (
                              schedulesForDay.map(sch => {
                                const sub = subjects.find(s => s.id === sch.subjectId);
                                const teacher = TEACHERS.find(t => t.id === sch.teacherId);
                                const SubjectIcon = getSubjectIcon(sch.subjectId);
                                
                                return (
                                  <div
                                    key={sch.id}
                                    className={`p-2.5 rounded-xl border transition-all flex flex-col gap-2 relative group hover:scale-[1.02] ${getSubjectColor(sch.subjectId)}`}
                                  >
                                    {/* Botón eliminar */}
                                    <button
                                      onClick={() => {
                                        deleteSchedule(sch.id);
                                        alert('Clase eliminada del horario.');
                                      }}
                                      className="absolute top-1.5 right-1.5 h-4 w-4 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center text-[9px] text-red-600 opacity-0 group-hover:opacity-100 transition-opacity font-bold"
                                      title="Eliminar bloque"
                                    >
                                      ✕
                                    </button>

                                    <div className="flex items-center gap-1">
                                      <SubjectIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span className="font-extrabold text-[10px] leading-tight truncate">
                                        {sub ? sub.name : sch.subjectId}
                                      </span>
                                    </div>

                                    <div className="text-[8.5px] opacity-85 leading-tight">
                                      <div className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> {sch.timeSlot}</div>
                                      <div className="truncate mt-0.5">Prof. {teacher ? teacher.name.split(' ')[0] : 'Docente'}</div>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- PESTAÑA 4: IDENTIDAD Y CONFIGURACIÓN DE LA ESCUELA --- */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 p-6 md:p-8 rounded-3xl shadow-sm flex flex-col gap-8">
            <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Building2 className="h-5.5 w-5.5 text-brand-primary" />
                  Identidad Institucional y Configuración del Plantel
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">Gestión integral del logotipo, paleta de colores del tema, datos generales y plantilla docente.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Columna Izquierda: Datos del Plantel + Logotipo + Profesores */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                
                {/* 1. SECCIÓN LOGOTIPO INSTITUCIONAL */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex flex-col gap-3">
                  <span className="text-xs font-black uppercase text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Upload className="h-4 w-4 text-violet-600" />
                    Logotipo Oficial del Plantel
                  </span>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center p-2 overflow-hidden shadow-sm">
                      {schoolSettings.logoUrl ? (
                        <img src={schoolSettings.logoUrl} alt="Logo" className="h-full w-full object-contain" />
                      ) : (
                        <Building2 className="h-8 w-8 text-zinc-400" />
                      )}
                    </div>

                    <div className="flex flex-col gap-2 flex-1 text-center sm:text-left">
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        Sube una imagen de tu escuela (.png, .jpg, .svg). Se extraerán automáticamente los colores principales para el tema.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <label className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-md shadow-violet-500/10 flex items-center gap-1.5">
                          <Upload className="h-3.5 w-3.5" />
                          Cargar Nuevo Logotipo
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLogoFileUpload(file, (logoUrl, colors) => {
                                  saveSchoolSettings({
                                    ...schoolSettings,
                                    logoUrl,
                                    themeColors: colors || schoolSettings.themeColors
                                  });
                                  alert('¡Logotipo actualizado y colores extraídos correctamente!');
                                });
                              }
                            }}
                          />
                        </label>
                        {schoolSettings.logoUrl && (
                          <button
                            onClick={() => saveSchoolSettings({ ...schoolSettings, logoUrl: '' })}
                            className="px-3 py-2 border border-zinc-200 dark:border-zinc-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-xs font-bold"
                          >
                            Eliminar Logo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DATOS GENERALES DEL PLANTEL */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre del Plantel</label>
                    <input
                      type="text"
                      value={schoolSettings.name}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, name: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Clave de Centro de Trabajo (CCT)</label>
                    <input
                      type="text"
                      value={schoolSettings.cct}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, cct: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Teléfono Institucional</label>
                    <input
                      type="text"
                      value={schoolSettings.phone}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, phone: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Sitio Web Oficial</label>
                    <input
                      type="text"
                      value={schoolSettings.website}
                      onChange={(e) => saveSchoolSettings({ ...schoolSettings, website: e.target.value })}
                      className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Dirección del Plantel</label>
                  <input
                    type="text"
                    value={schoolSettings.address}
                    onChange={(e) => saveSchoolSettings({ ...schoolSettings, address: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                  />
                </div>

                {/* 3. GESTIÓN DE PLANTILLA DOCENTE */}
                <div className="p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div>
                      <h3 className="text-xs font-black uppercase text-zinc-800 dark:text-white flex items-center gap-1.5">
                        <Users className="h-4 w-4 text-violet-600" />
                        Plantilla Docente de la Escuela ({teachersList.length})
                      </h3>
                      <p className="text-[11px] text-zinc-400">Administra los accesos y expedientes de tus profesores.</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingTeacher(null);
                        setTeacherFormData({ first_name: '', last_name: '', email: '' });
                        setIsTeacherModalOpen(true);
                      }}
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                      className="px-3 py-1.5 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm hover:opacity-90 transition-all"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Dar de Alta Profesor
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {teachersList.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-violet-100 dark:bg-violet-950/50 text-violet-600 font-bold flex items-center justify-center text-xs">
                            {t.first_name?.[0]}{t.last_name?.[0]}
                          </div>
                          <div className="flex flex-col text-left leading-tight">
                            <span className="font-bold text-xs text-zinc-900 dark:text-white">{t.first_name} {t.last_name}</span>
                            <span className="text-[10px] text-zinc-400">{t.email}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingTeacher(t);
                              setTeacherFormData({ first_name: t.first_name || '', last_name: t.last_name || '', email: t.email || '' });
                              setIsTeacherModalOpen(true);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-violet-600 rounded-lg hover:bg-zinc-200/50 dark:hover:bg-zinc-800 text-xs"
                            title="Editar información"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setTeacherToDelete(t);
                            }}
                            className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors"
                            title="Dar de baja profesor"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Columna Derecha: REVISOR DE PALETA DE COLORES ADAPTATIVO */}
              <div className="lg:col-span-4 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-200/80 dark:border-zinc-800 flex flex-col gap-5 sticky top-20">
                <div className="border-b pb-2 flex items-center justify-between">
                  <span className="text-xs font-black text-brand-primary uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Revisor de Paleta de Colores
                  </span>
                  <span className="px-2 py-0.5 rounded bg-violet-100 dark:bg-violet-950 text-violet-600 text-[9px] font-bold">En Vivo</span>
                </div>

                <p className="text-[11px] text-zinc-400">
                  Selecciona los colores exactos mediante los selectores interactivos. Toda la plataforma adaptará su tema en tiempo real.
                </p>

                <div className="flex flex-col gap-4">
                  {/* Color Primario */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Color Primario (Botones y Títulos)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={hslToHex(schoolSettings.themeColors.primary)}
                        onChange={(e) => {
                          const hsl = hexToHsl(e.target.value);
                          saveSchoolSettings({
                            ...schoolSettings,
                            themeColors: { ...schoolSettings.themeColors, primary: hsl }
                          });
                        }}
                        className="h-9 w-9 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden"
                      />
                      <input
                        type="text"
                        value={schoolSettings.themeColors.primary}
                        onChange={(e) => saveSchoolSettings({
                          ...schoolSettings,
                          themeColors: { ...schoolSettings.themeColors, primary: e.target.value }
                        })}
                        placeholder="250 84% 54%"
                        className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Color Secundario */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Color Secundario (Fondos y Bordes)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={hslToHex(schoolSettings.themeColors.secondary)}
                        onChange={(e) => {
                          const hsl = hexToHsl(e.target.value);
                          saveSchoolSettings({
                            ...schoolSettings,
                            themeColors: { ...schoolSettings.themeColors, secondary: hsl }
                          });
                        }}
                        className="h-9 w-9 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden"
                      />
                      <input
                        type="text"
                        value={schoolSettings.themeColors.secondary}
                        onChange={(e) => saveSchoolSettings({
                          ...schoolSettings,
                          themeColors: { ...schoolSettings.themeColors, secondary: e.target.value }
                        })}
                        placeholder="221 83% 53%"
                        className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>

                  {/* Color de Acento */}
                  <div>
                    <label className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Color de Acento (Destacados y Éxito)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={hslToHex(schoolSettings.themeColors.accent)}
                        onChange={(e) => {
                          const hsl = hexToHsl(e.target.value);
                          saveSchoolSettings({
                            ...schoolSettings,
                            themeColors: { ...schoolSettings.themeColors, accent: hsl }
                          });
                        }}
                        className="h-9 w-9 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden"
                      />
                      <input
                        type="text"
                        value={schoolSettings.themeColors.accent}
                        onChange={(e) => saveSchoolSettings({
                          ...schoolSettings,
                          themeColors: { ...schoolSettings.themeColors, accent: e.target.value }
                        })}
                        placeholder="142 71% 45%"
                        className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* TARJETA DE VISTA PREVIA EN VIVO */}
                <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-3 shadow-sm mt-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Vista Previa del Tema Adaptativo</span>
                  <div className="p-3 rounded-xl text-white font-bold text-xs shadow-sm flex items-center justify-between" style={{ backgroundColor: `hsl(${schoolSettings.themeColors.primary})` }}>
                    <span>Botón Primario</span>
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="p-2.5 rounded-xl border font-semibold text-xs flex items-center justify-between" style={{ borderColor: `hsl(${schoolSettings.themeColors.secondary})`, color: `hsl(${schoolSettings.themeColors.secondary})` }}>
                    <span>Borde Secundario</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="px-3 py-1.5 rounded-lg text-white font-bold text-[10px] text-center" style={{ backgroundColor: `hsl(${schoolSettings.themeColors.accent})` }}>
                    Éxito / Acento Destacado
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-2">
                  <button
                    onClick={() => saveSchoolSettings({
                      ...schoolSettings,
                      themeColors: {
                        primary: '250 84% 54%',
                        secondary: '221 83% 53%',
                        accent: '142 71% 45%'
                      }
                    })}
                    className="w-full py-2.5 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    Restablecer Colores Predeterminados
                  </button>
                  <button
                    onClick={() => saveSchoolSettings({ ...schoolSettings, isConfigured: false })}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Volver a Ejecutar Asistente de Onboarding
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* --- PROCESO DE ONBOARDING ESCOLAR INTERACTIVO DE PANTALLA COMPLETA --- */}
      {!schoolSettings.isConfigured && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-250">
            
            {/* Header del Onboarding */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-850 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="flex items-center gap-2">
                <Building2 className="h-7 w-7 text-brand-primary" />
                <div>
                  <h1 className="text-lg font-black text-zinc-950 dark:text-white">Bienvenido a ISkool</h1>
                  <p className="text-[11px] text-zinc-400 mt-0.5">Asistente de configuración inicial del Plantel e Identidad Visual</p>
                </div>
              </div>
              
              {/* Progreso de Pasos */}
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4].map(step => (
                  <span
                    key={step}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      step === onboardingStep ? 'w-6 bg-brand-primary' : step < onboardingStep ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-850'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Contenido Dinámico del Paso */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-6">
              
              {/* PASO 1: DATOS GENERALES */}
              {onboardingStep === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 1: Información de la Escuela</h2>
                    <p className="text-xs text-zinc-400">Ingresa los datos generales para conformar tu plantel en el sistema.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Nombre de la Institución *</label>
                      <input
                        required
                        type="text"
                        value={onboardingData.name}
                        onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                        placeholder="Ej. Colegio Anglo Mexicano"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-455 uppercase block mb-1">Clave de Centro de Trabajo (CCT) *</label>
                      <input
                        required
                        type="text"
                        value={onboardingData.cct}
                        onChange={(e) => setOnboardingData({ ...onboardingData, cct: e.target.value })}
                        placeholder="Ej. 09DPR5678X"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Teléfono Institucional *</label>
                      <input
                        required
                        type="text"
                        value={onboardingData.phone}
                        onChange={(e) => setOnboardingData({ ...onboardingData, phone: e.target.value })}
                        placeholder="Ej. 555-123-4567"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Sitio Web Oficial</label>
                      <input
                        type="url"
                        value={onboardingData.website}
                        onChange={(e) => setOnboardingData({ ...onboardingData, website: e.target.value })}
                        placeholder="Ej. https://escuela.edu.mx"
                        className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Dirección Física *</label>
                    <input
                      required
                      type="text"
                      value={onboardingData.address}
                      onChange={(e) => setOnboardingData({ ...onboardingData, address: e.target.value })}
                      placeholder="Calle, Número, Colonia, Delegación"
                      className="w-full text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                    />
                  </div>
                </div>
              )}

              {/* PASO 2: LOGOTIPO Y EXTRACCIÓN INTELIGENTE */}
              {onboardingStep === 2 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 2: Análisis de Logotipo e Identidad Visual</h2>
                    <p className="text-xs text-zinc-400">Ingresa la URL del logotipo o el dominio web de la escuela para deducir de forma automatizada los colores del tema visual.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <div className="flex flex-col gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Dominio de la Escuela (Web)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={simulatedDomainName}
                            onChange={(e) => setSimulatedDomainName(e.target.value)}
                            placeholder="Ej. unam.mx o anglomexicano.edu.mx"
                            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (!simulatedDomainName) return;
                              setIsSimulatingColors(true);
                              setShowColorSuccess(false);
                              setTimeout(() => {
                                // Simular extracción de colores basada en el nombre del dominio
                                const isUnam = simulatedDomainName.toLowerCase().includes('unam');
                                const isTec = simulatedDomainName.toLowerCase().includes('tec');
                                
                                let primary = '250 84% 54%';
                                let secondary = '221 83% 53%';
                                let accent = '142 71% 45%';

                                if (isUnam) {
                                  primary = '45 95% 45%'; // Dorado UNAM
                                  secondary = '220 90% 20%'; // Azul UNAM
                                  accent = '12 80% 50%';
                                } else if (isTec) {
                                  primary = '130 80% 30%'; // Verde TEC
                                  secondary = '220 80% 35%';
                                  accent = '38 90% 50%'; // Naranja
                                } else {
                                  // Generar HSL aleatorio
                                  const randomHue = Math.floor(Math.random() * 360);
                                  primary = `${randomHue} 80% 45%`;
                                  secondary = `${(randomHue + 120) % 360} 70% 35%`;
                                  accent = `${(randomHue + 240) % 360} 90% 45%`;
                                }

                                setOnboardingData(prev => ({
                                  ...prev,
                                  themeColors: { primary, secondary, accent }
                                }));
                                setIsSimulatingColors(false);
                                setShowColorSuccess(true);
                              }, 1800);
                            }}
                            className="px-4 bg-zinc-950 text-white dark:bg-white dark:text-black rounded-xl text-xs font-bold hover:opacity-90 flex items-center gap-1.5"
                          >
                            <Globe className="h-4 w-4 text-emerald-500" />
                            Analizar
                          </button>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-zinc-200 dark:border-zinc-800 pt-3">
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Cargar Logotipo Oficial</label>
                        <label className="p-6 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center gap-2 text-center hover:bg-zinc-50 dark:hover:bg-zinc-950 transition-colors cursor-pointer block">
                          <Upload className="h-8 w-8 text-zinc-400" />
                          <div>
                            <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Sube el logotipo (.png, .jpg, .svg)</p>
                            <p className="text-[9.5px] text-zinc-400">Extraeremos el color principal de forma dinámica</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleLogoFileUpload(file, (logoUrl, colors) => {
                                  setOnboardingData(prev => ({
                                    ...prev,
                                    logoUrl,
                                    themeColors: colors || prev.themeColors
                                  }));
                                  setShowColorSuccess(true);
                                });
                              }
                            }}
                          />
                        </label>

                        {onboardingData.logoUrl && (
                          <div className="mt-3 p-3 bg-zinc-50 dark:bg-zinc-900 border rounded-xl flex items-center justify-between animate-in fade-in">
                            <div className="flex items-center gap-3">
                              <img src={onboardingData.logoUrl} alt="Logo preview" className="h-10 w-10 object-contain rounded-lg border bg-white p-1" />
                              <span className="text-xs font-bold text-emerald-600">✓ Logotipo cargado y paleta extraída</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setOnboardingData(prev => ({ ...prev, logoUrl: '' }))}
                              className="text-xs text-rose-500 hover:underline font-bold"
                            >
                              Quitar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-5 bg-zinc-50 dark:bg-zinc-955 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 flex flex-col gap-4 text-xs">
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        Identidad Sugerida
                      </span>

                      {isSimulatingColors ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                          <RefreshCw className="h-8 w-8 text-brand-primary animate-spin" />
                          <p className="text-[11px] text-zinc-400 italic">Leyendo estilos e imágenes de la página web...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-3">
                          {showColorSuccess && (
                            <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/20 text-[10.5px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30">
                              ✓ ¡Paleta de colores analizada y extraída con éxito!
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span>Color Primario (Tema Principal)</span>
                            <span className="h-6 w-16 rounded border shadow-sm" style={{ backgroundColor: `hsl(${onboardingData.themeColors.primary})` }} />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Color Secundario (Bordes/Headers)</span>
                            <span className="h-6 w-16 rounded border shadow-sm" style={{ backgroundColor: `hsl(${onboardingData.themeColors.secondary})` }} />
                          </div>
                          <div className="flex justify-between items-center">
                            <span>Color de Acento (Logros/Felicidades)</span>
                            <span className="h-6 w-16 rounded border shadow-sm" style={{ backgroundColor: `hsl(${onboardingData.themeColors.accent})` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 3: CONFIRMACIÓN Y PERSONALIZACIÓN DE TEMA */}
              {onboardingStep === 3 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 3: Personalización del Tema de Colores</h2>
                    <p className="text-xs text-zinc-400">Vista previa de la interfaz del sistema. Modifica los selectores para afinar el estilo a tu gusto antes de aplicarlo.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* Selectores */}
                    <div className="flex flex-col gap-4">
                      {/* Color Primario */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Color Principal (Primario)</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={onboardingData.themeColors.primary}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData,
                              themeColors: { ...onboardingData.themeColors, primary: e.target.value }
                            })}
                            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-mono"
                          />
                          <input
                            type="color"
                            value={hslToHex(onboardingData.themeColors.primary)}
                            onChange={(e) => {
                              const hsl = hexToHsl(e.target.value);
                              setOnboardingData({
                                ...onboardingData,
                                themeColors: { ...onboardingData.themeColors, primary: hsl }
                              });
                            }}
                            className="h-11 w-11 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden flex-shrink-0"
                          />
                        </div>
                      </div>

                      {/* Color Secundario */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-450 uppercase block mb-1">Color Secundario (Bordes/Headers)</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={onboardingData.themeColors.secondary}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData,
                              themeColors: { ...onboardingData.themeColors, secondary: e.target.value }
                            })}
                            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-mono"
                          />
                          <input
                            type="color"
                            value={hslToHex(onboardingData.themeColors.secondary)}
                            onChange={(e) => {
                              const hsl = hexToHsl(e.target.value);
                              setOnboardingData({
                                ...onboardingData,
                                themeColors: { ...onboardingData.themeColors, secondary: hsl }
                              });
                            }}
                            className="h-11 w-11 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden flex-shrink-0"
                          />
                        </div>
                      </div>

                      {/* Color de Acento */}
                      <div>
                        <label className="text-[10px] font-bold text-zinc-455 uppercase block mb-1">Color de Acento (Logros/Éxito)</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={onboardingData.themeColors.accent}
                            onChange={(e) => setOnboardingData({
                              ...onboardingData,
                              themeColors: { ...onboardingData.themeColors, accent: e.target.value }
                            })}
                            className="flex-1 text-xs p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white font-mono"
                          />
                          <input
                            type="color"
                            value={hslToHex(onboardingData.themeColors.accent)}
                            onChange={(e) => {
                              const hsl = hexToHsl(e.target.value);
                              setOnboardingData({
                                ...onboardingData,
                                themeColors: { ...onboardingData.themeColors, accent: hsl }
                              });
                            }}
                            className="h-11 w-11 rounded-xl border border-zinc-300 dark:border-zinc-700 cursor-pointer overflow-hidden flex-shrink-0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Previsualizador de Componentes */}
                    <div className="p-6 bg-zinc-50 dark:bg-zinc-955 border rounded-3xl flex flex-col gap-4">
                      <span className="text-[10px] font-black uppercase text-zinc-400">Previsualizador de Componentes</span>
                      
                      {/* Botón */}
                      <button
                        type="button"
                        className="py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all text-center"
                        style={{ backgroundColor: `hsl(${onboardingData.themeColors.primary})`, boxShadow: `0 4px 6px -1px hsl(${onboardingData.themeColors.primary} / 0.15)` }}
                      >
                        Botón de Muestra (Primario)
                      </button>

                      {/* Tarjeta */}
                      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border flex flex-col gap-2" style={{ borderColor: `hsl(${onboardingData.themeColors.secondary} / 0.3)` }}>
                        <span className="text-[10px] font-bold" style={{ color: `hsl(${onboardingData.themeColors.primary})` }}>Categoría Académica</span>
                        <p className="text-xs font-bold text-zinc-800 dark:text-zinc-200">Tarjeta Informativa del Colegio</p>
                      </div>

                      {/* Logro */}
                      <div className="p-2.5 rounded-xl border text-[10.5px] font-bold flex items-center gap-1.5" style={{ backgroundColor: `hsl(${onboardingData.themeColors.accent} / 0.05)`, borderColor: `hsl(${onboardingData.themeColors.accent} / 0.2)`, color: `hsl(${onboardingData.themeColors.accent})` }}>
                        <Sparkles className="h-4 w-4" />
                        Logro obtenido: +150 XP
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PASO 4: ALTA DE COORDINADORES Y PROFESORES */}
              {onboardingStep === 4 && (
                <div className="flex flex-col gap-4">
                  <div className="border-b pb-2">
                    <h2 className="text-sm font-black text-zinc-800 dark:text-white uppercase tracking-wider">Paso 4: Coordinadores y Plantilla Docente</h2>
                    <p className="text-xs text-zinc-400">Agrega los nombres del personal coordinador y docente que utilizará el sistema.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Coordinadores */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block">Coordinadores Iniciales</label>
                      <div className="flex flex-wrap gap-2">
                        {onboardingData.coordinators.map((c, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-150 dark:bg-zinc-800 text-xs font-semibold rounded-lg">
                            {c}
                            <button type="button" onClick={() => setOnboardingData({ ...onboardingData, coordinators: onboardingData.coordinators.filter((_, idx) => idx !== i) })} className="text-red-500 ml-1">✕</button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="onb-coord-input"
                          placeholder="Nombre del Coordinador"
                          className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('onb-coord-input') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              setOnboardingData({ ...onboardingData, coordinators: [...onboardingData.coordinators, el.value.trim()] });
                              el.value = '';
                            }
                          }}
                          className="px-4 bg-brand-primary text-white rounded-xl text-xs font-bold"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>

                    {/* Profesores */}
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] font-bold text-zinc-450 uppercase block">Docentes Iniciales</label>
                      <div className="flex flex-wrap gap-2">
                        {onboardingData.teachers.map((t, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-zinc-150 dark:bg-zinc-800 text-xs font-semibold rounded-lg">
                            {t}
                            <button
                              type="button"
                              onClick={() => {
                                const teacherName = t;
                                const match = teachersList.find(item => 
                                  `${item.first_name} ${item.last_name}`.trim().toLowerCase() === teacherName.trim().toLowerCase() ||
                                  item.first_name.trim().toLowerCase() === teacherName.trim().toLowerCase()
                                );
                                if (match) {
                                  deleteTeacher(match.id);
                                } else {
                                  setOnboardingData(prev => ({
                                    ...prev,
                                    teachers: prev.teachers.filter((_, idx) => idx !== i)
                                  }));
                                }
                              }}
                              className="text-red-500 hover:text-red-600 ml-1 font-bold cursor-pointer"
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="onb-teach-input"
                          placeholder="Nombre del Docente"
                          className="flex-1 text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const el = document.getElementById('onb-teach-input') as HTMLInputElement;
                            if (el && el.value.trim()) {
                              const trimmed = el.value.trim();
                              const parts = trimmed.split(/\s+/);
                              const firstName = parts[0] || trimmed;
                              const lastName = parts.slice(1).join(' ') || 'Docente';
                              registerTeacher({
                                first_name: firstName,
                                last_name: lastName,
                                email: `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}@iskool.edu.mx`
                              });
                              el.value = '';
                            }
                          }}
                          style={{ backgroundColor: 'var(--brand-primary)' }}
                          className="px-4 text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-md"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* Pie de Página del Onboarding */}
            <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/20 flex justify-between items-center">
              <button
                type="button"
                disabled={onboardingStep === 1}
                onClick={() => setOnboardingStep(prev => prev - 1)}
                className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 disabled:opacity-40 hover:bg-zinc-100"
              >
                Atrás
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onboardingStep < 4) {
                    setOnboardingStep(prev => prev + 1);
                  } else {
                    // Capturar valores pendientes en campos de texto antes de finalizar
                    let finalTeachers = [...onboardingData.teachers];
                    let finalCoords = [...onboardingData.coordinators];

                    const teachEl = document.getElementById('onb-teach-input') as HTMLInputElement;
                    if (teachEl && teachEl.value.trim()) {
                      finalTeachers.push(teachEl.value.trim());
                      teachEl.value = '';
                    }

                    const coordEl = document.getElementById('onb-coord-input') as HTMLInputElement;
                    if (coordEl && coordEl.value.trim()) {
                      finalCoords.push(coordEl.value.trim());
                      coordEl.value = '';
                    }

                    const finalSettings = {
                      ...onboardingData,
                      teachers: Array.from(new Set(finalTeachers.filter(Boolean))),
                      coordinators: Array.from(new Set(finalCoords.filter(Boolean))),
                      isConfigured: true
                    };

                    saveSchoolSettings(finalSettings);
                    alert(`¡Onboarding escolar finalizado!\nPlantel "${finalSettings.name || 'ISkool'}" configurado correctamente en el sistema.`);
                  }
                }}
                style={{ backgroundColor: 'var(--brand-primary)' }}
                className="px-6 py-2.5 text-white rounded-full text-xs font-bold hover:opacity-90 transition-all shadow-md"
              >
                {onboardingStep === 4 ? 'Finalizar Configuración' : 'Siguiente Paso'}
              </button>
            </div>

          </div>
        </div>
      )}


      {/* --- MODAL FORMULARIO DE ALTA DE ALUMNO --- */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800 my-8">
            
            {/* Header del Modal */}
            <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-850 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-violet-500" />
                  Expediente de Inscripción Escolar (NEM)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">Registra la información del alumno para su asignación escolar.</p>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="h-7 w-7 rounded-full bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-800 text-zinc-400 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-h-[50vh] overflow-y-auto pr-1">
                
                {/* COLUMNA 1: DATOS PERSONALES */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest border-b pb-1">1. Datos Personales</span>
                  
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Primer Nombre *</label>
                    <input
                      required
                      type="text"
                      value={newStudentData.first_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, first_name: e.target.value }))}
                      placeholder="Ej. Juan"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Segundo Nombre</label>
                    <input
                      type="text"
                      value={newStudentData.second_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, second_name: e.target.value }))}
                      placeholder="Ej. Carlos"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Primer Apellido *</label>
                    <input
                      required
                      type="text"
                      value={newStudentData.last_name_1}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, last_name_1: e.target.value }))}
                      placeholder="Ej. Pérez"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Segundo Apellido</label>
                    <input
                      type="text"
                      value={newStudentData.last_name_2}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, last_name_2: e.target.value }))}
                      placeholder="Ej. Gómez"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase block mb-0.5">Fecha Nacimiento *</label>
                    <input
                      required
                      type="date"
                      value={newStudentData.birth_date}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, birth_date: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Género</label>
                      <select
                        value={newStudentData.gender}
                        onChange={(e) => setNewStudentData(prev => ({ ...prev, gender: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="Masculino">Masculino</option>
                        <option value="Femenino">Femenino</option>
                        <option value="Otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* COLUMNA 2: ACADÉMICOS Y REGISTROS */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest border-b pb-1">2. Datos de Inscripción</span>
                  
                  <div>
                    <div className="flex justify-between items-center">
                      <label className="text-[9.5px] font-bold text-zinc-400 uppercase">CURP / Matrícula</label>
                      <button
                        type="button"
                        onClick={generateSimulatedCurp}
                        className="text-[9px] text-violet-600 dark:text-violet-400 font-extrabold hover:underline"
                      >
                        Autogenerar CURP
                      </button>
                    </div>
                    <input
                      type="text"
                      value={newStudentData.curp}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, curp: e.target.value.toUpperCase() }))}
                      placeholder="CURP de 18 caracteres"
                      maxLength={18}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={newStudentData.enrollment_id}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, enrollment_id: e.target.value.toUpperCase() }))}
                      placeholder="Matrícula Oficial"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white mt-1.5 focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Nivel Educativo *</label>
                    <select
                      value={newStudentData.level}
                      onChange={(e: any) => {
                        const lvl = e.target.value;
                        setNewStudentData(prev => ({ ...prev, level: lvl, grade: getGradesForLevel(lvl)[0] }));
                      }}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                      <option value="primaria">Primaria</option>
                      <option value="secundaria">Secundaria</option>
                      <option value="preparatoria">Preparatoria</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Grado Escolar *</label>
                    <select
                      value={newStudentData.grade}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, grade: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 focus:outline-none"
                    >
                      {getGradesForLevel(newStudentData.level).map(gr => (
                        <option key={gr} value={gr}>{gr}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Turno Escolar</label>
                    <select
                      value={newStudentData.shift}
                      onChange={(e: any) => setNewStudentData(prev => ({ ...prev, shift: e.target.value }))}
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                    >
                      <option value="matutino">Matutino</option>
                      <option value="vespertino">Vespertino</option>
                      <option value="completo">Tiempo Completo</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Escuela de Procedencia</label>
                    <input
                      type="text"
                      value={newStudentData.previous_school}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, previous_school: e.target.value }))}
                      placeholder="Nombre del plantel anterior"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                {/* COLUMNA 3: TUTORES, CONTACTO Y SALUD */}
                <div className="flex flex-col gap-3">
                  <span className="text-[10px] font-black text-violet-600 uppercase tracking-widest border-b pb-1">3. Familia, Contacto y Salud</span>
                  
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Nombre de la Madre / Padre</label>
                    <input
                      type="text"
                      value={newStudentData.mother_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, mother_name: e.target.value }))}
                      placeholder="Nombre de la Madre"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white mb-1.5 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={newStudentData.father_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, father_name: e.target.value }))}
                      placeholder="Nombre del Padre"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Contacto de Emergencia</label>
                    <input
                      type="text"
                      value={newStudentData.emergency_contact_name}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, emergency_contact_name: e.target.value }))}
                      placeholder="Nombre Completo"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white mb-1.5 focus:outline-none focus:border-violet-500"
                    />
                    <input
                      type="text"
                      value={newStudentData.emergency_contact_phone}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, emergency_contact_phone: e.target.value }))}
                      placeholder="Teléfono de Emergencia"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Tipo Sangre</label>
                      <select
                        value={newStudentData.blood_type}
                        onChange={(e) => setNewStudentData(prev => ({ ...prev, blood_type: e.target.value }))}
                        className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Alergias o Restricciones Médicas</label>
                    <textarea
                      value={newStudentData.medical_notes}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, medical_notes: e.target.value }))}
                      placeholder="Especifica alergias alimentarias o medicamentos..."
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white min-h-[50px] focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Comentarios Académicos</label>
                    <textarea
                      value={newStudentData.academic_notes}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, academic_notes: e.target.value }))}
                      placeholder="Historial cualitativo u observaciones..."
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white min-h-[50px] focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  {/* Campos de contacto */}
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Dirección de Contacto</label>
                    <input
                      type="text"
                      value={newStudentData.address}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Calle, Número y Colonia"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Teléfono Fijo / Móvil</label>
                    <input
                      type="text"
                      value={newStudentData.phone}
                      onChange={(e) => setNewStudentData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Número de 10 dígitos"
                      className="w-full text-xs p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-violet-500"
                    />
                  </div>
                  <div>
                    <label className="text-[9.5px] font-bold text-zinc-400 uppercase">Correo Institucional Oficial *</label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newStudentData.email ? newStudentData.email.split('@')[0] : ''}
                        onChange={(e) => {
                          const prefix = e.target.value.toLowerCase().replace(/[^a-z0-9.]/g, '');
                          setNewStudentData(prev => ({ ...prev, email: prefix ? `${prefix}@${schoolDomain}` : '' }));
                        }}
                        placeholder={newStudentData.first_name ? `${newStudentData.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${(newStudentData.last_name_1 || '').toLowerCase().replace(/[^a-z0-9]/g, '')}` : "nombre.apellido"}
                        className="flex-1 text-xs p-2 rounded-l-lg border border-zinc-200 dark:border-zinc-850 bg-transparent text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-violet-500"
                      />
                      <span className="bg-violet-100 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-l-0 border-zinc-200 dark:border-zinc-850 text-xs px-2.5 py-2 rounded-r-lg font-mono font-bold">
                        @{schoolDomain}
                      </span>
                    </div>
                    <span className="text-[9px] text-zinc-400 mt-0.5 block">
                      Obligatorio: Pertenece estrictamente al dominio de su colegio (@{schoolDomain}).
                    </span>
                  </div>

                </div>

              </div>

              {/* Botones del Formulario */}
              <div className="flex justify-end gap-3 border-t border-zinc-100 dark:border-zinc-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 hover:bg-zinc-50"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-full text-xs font-bold shadow-md shadow-violet-500/10 transition-all"
                >
                  Inscribir Alumno
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modal de Detalle de Alumno */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-md transition-opacity duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Cabecera del Modal */}
            <div className="relative p-6 border-b border-zinc-100 dark:border-zinc-850 flex flex-col md:flex-row items-center gap-6 bg-zinc-50/50 dark:bg-zinc-950/20">
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {canDeleteStudent && (
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 text-xs font-bold transition-all shadow-xs border border-rose-200/80 cursor-pointer"
                    title="Eliminar Alumno del Sistema (Acción Directiva)"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Eliminar Alumno</span>
                  </button>
                )}
                <button 
                  type="button"
                  onClick={() => {
                    setEditingStudentData(selectedStudent);
                    setIsEditStudentModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-955/40 dark:text-violet-300 dark:hover:bg-violet-900/50 text-xs font-bold transition-all shadow-sm border border-violet-200/50 cursor-pointer"
                  title="Editar Expediente"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Editar Expediente</span>
                </button>
                <button 
                  onClick={() => setSelectedStudent(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Foto de Perfil con borde según nivel */}
              <div className={`relative h-24 w-24 rounded-full overflow-hidden border-4 flex-shrink-0 shadow-lg ${
                selectedStudent.level === 'primaria' ? 'border-blue-400' :
                selectedStudent.level === 'secundaria' ? 'border-violet-500' : 'border-orange-500'
              }`}>
                <img 
                  src={getStudentAvatarUrl(selectedStudent)} 
                  alt={`${selectedStudent.first_name} ${selectedStudent.last_name_1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=250&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedStudent.level === 'primaria' ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400' :
                    selectedStudent.level === 'secundaria' ? 'bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400' : 
                    'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400'
                  }`}>
                    {selectedStudent.level}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-bold">
                    {selectedStudent.grade}
                  </span>
                  {selectedStudent.group_id && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 text-[10px] font-bold">
                      Grupo {groupsList.find(g => g.id === selectedStudent.group_id)?.name || ''}
                    </span>
                  )}
                  <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-bold">
                    Turno {selectedStudent.shift || 'matutino'}
                  </span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-black text-zinc-900 dark:text-white">
                  {selectedStudent.first_name} {selectedStudent.second_name || ''} {selectedStudent.last_name_1} {selectedStudent.last_name_2 || ''}
                </h2>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-zinc-500">
                  <span className="font-mono"><strong>Matrícula:</strong> {selectedStudent.enrollment_id}</span>
                  <span className="font-mono"><strong>CURP:</strong> {selectedStudent.curp}</span>
                </div>
              </div>
            </div>

            {/* Contenido (Desplazable si es necesario) */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* SECCIÓN 1: DATOS PERSONALES */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-violet-500" />
                    Datos Personales
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Fecha de Nacimiento</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.birth_date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Edad Calculada</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{calculateAge(selectedStudent.birth_date)} años</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Género</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.gender || 'Masculino'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Escuela de Procedencia</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">{selectedStudent.previous_school || 'Ninguna'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Estado en el Sistema</span>
                      <select
                        value={selectedStudent.status}
                        onChange={(e) => {
                          const newStatus = e.target.value as 'activo' | 'suspendido' | 'baja';
                          updateStudentStatus(selectedStudent.id, newStatus);
                          setSelectedStudent({ ...selectedStudent, status: newStatus });
                        }}
                        className="text-xs font-bold p-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                      >
                        <option value="activo">🟢 Activo</option>
                        <option value="suspendido">🟡 Suspendido</option>
                        <option value="baja">🔴 Baja</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECCIÓN 2: CONTACTO Y FAMILIA */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Phone className="h-4 w-4 text-violet-500" />
                    Contacto y Familiares
                  </h3>
                  
                  <div className="space-y-3 bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Dirección</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-start gap-1"><MapPin className="h-3.5 w-3.5 text-zinc-400 flex-shrink-0 mt-0.5" /> {selectedStudent.address || 'S/D'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Teléfono de Contacto</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-zinc-400" /> {selectedStudent.phone || 'S/T'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Correo Electrónico</span>
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-zinc-400" /> {selectedStudent.email || 'S/C'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block">Padres / Tutores</span>
                      <div className="mt-1 text-[11px] text-zinc-600 dark:text-zinc-300 leading-tight space-y-1">
                        {selectedStudent.mother_name && <div>• <strong>Madre:</strong> {selectedStudent.mother_name}</div>}
                        {selectedStudent.father_name && <div>• <strong>Padre:</strong> {selectedStudent.father_name}</div>}
                        {selectedStudent.tutor_name && <div>• <strong>Tutor Legal:</strong> {selectedStudent.tutor_name}</div>}
                      </div>
                    </div>
                    {(selectedStudent.emergency_contact_name || selectedStudent.emergency_contact_phone) && (
                      <div className="border-t border-zinc-200/40 dark:border-zinc-800/40 pt-2 mt-2">
                        <span className="text-[10px] font-black text-red-500 dark:text-red-400 uppercase block">Contacto de Emergencia</span>
                        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">{selectedStudent.emergency_contact_name || 'S/N'}</span>
                        <span className="text-[10.5px] text-zinc-500 block">{selectedStudent.emergency_contact_phone || 'S/T'}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* SECCIÓN 3: EXPEDIENTE MÉDICO Y ADMINISTRATIVO */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-zinc-400 uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
                    <Activity className="h-4 w-4 text-violet-500" />
                    Expediente Escolar
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pagos Pendientes */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1.5">Pagos y Adeudos</span>
                      {selectedStudent.pending_payments && selectedStudent.pending_payments.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedStudent.pending_payments.map((p, idx) => (
                            <div key={idx} className="p-2 rounded bg-amber-50 dark:bg-amber-955/10 border border-amber-200/50 text-[11px] font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                              {p}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-955/10 border border-emerald-200/50 text-[11px] font-bold text-emerald-700 dark:text-emerald-450 flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          Sin adeudos registrados.
                        </div>
                      )}
                    </div>

                    {/* Reportes de Conducta */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Reportes de Conducta</span>
                        <button
                          type="button"
                          onClick={() => setShowAddReportForm(!showAddReportForm)}
                          className="text-[9.5px] font-extrabold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Reportar
                        </button>
                      </div>

                      {showAddReportForm && (
                        <div className="p-3 bg-rose-50/60 dark:bg-rose-955/20 border border-rose-200 dark:border-rose-900 rounded-xl mb-3 space-y-2">
                          <input
                            type="text"
                            value={newReportReporter}
                            onChange={(e) => setNewReportReporter(e.target.value)}
                            placeholder="Quien reporta (Ej. Coordinación)"
                            className="w-full text-xs p-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                          />
                          <textarea
                            value={newReportDescription}
                            onChange={(e) => setNewReportDescription(e.target.value)}
                            placeholder="Descripción de la incidencia o reporte de conducta..."
                            className="w-full text-xs p-2 rounded-lg border border-rose-200 dark:border-rose-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white h-16 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddReportForm(false)}
                              className="px-2.5 py-1 text-xs text-zinc-500 hover:underline"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (newReportDescription.trim()) {
                                  const report = {
                                    date: new Date().toISOString().split('T')[0],
                                    description: newReportDescription.trim(),
                                    reporter: newReportReporter.trim() || 'Coordinación'
                                  };
                                  addBehaviorReport(selectedStudent.id, report);
                                  setSelectedStudent(prev => prev ? { ...prev, behavior_reports: [report, ...(prev.behavior_reports || [])] } : null);
                                  setNewReportDescription('');
                                  setShowAddReportForm(false);
                                }
                              }}
                              className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-sm"
                            >
                              Guardar Reporte
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedStudent.behavior_reports && selectedStudent.behavior_reports.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.behavior_reports.map((r, idx) => {
                            const matchingMsg = parentMessages.find(m => 
                              m.student_id === selectedStudent.id && 
                              (m.subject_name === 'Reporte de Conducta' || m.id.startsWith('msg-brep')) &&
                              m.parent_reply
                            );
                            const tutorReply = r.parent_reply || matchingMsg?.parent_reply;
                            const hasReplied = Boolean(tutorReply);

                            return (
                              <div key={idx} className="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-955/10 border border-rose-200/40 text-[10.5px] space-y-1.5">
                                <div className="flex justify-between items-center font-bold text-rose-700 dark:text-rose-400 text-[9.5px]">
                                  <span>Reporta: {r.reporter}</span>
                                  <div className="flex items-center gap-2">
                                    <span>{r.date}</span>
                                    {hasReplied ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm('¿Deseas eliminar este reporte de conducta del expediente? (El tutor ya ha respondido)')) {
                                            deleteBehaviorReport(selectedStudent.id, idx);
                                            setSelectedStudent(prev => prev ? { ...prev, behavior_reports: (prev.behavior_reports || []).filter((_, i) => i !== idx) } : null);
                                          }
                                        }}
                                        className="p-1 rounded text-rose-600 hover:text-red-700 hover:bg-rose-200/60 dark:hover:bg-rose-900/60 transition-all cursor-pointer"
                                        title="Eliminar del expediente (Respuesta del tutor recibida)"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    ) : (
                                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold" title="Solo se activa eliminar cuando el tutor contesta">
                                        ⏳ Pendiente
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300">{r.description}</p>
                                
                                {hasReplied ? (
                                  <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium">
                                    💬 <strong>Respuesta del Tutor:</strong> "{tutorReply}"
                                  </div>
                                ) : (
                                  <div className="mt-1 text-[9px] text-zinc-400 italic">
                                    El tutor no ha respondido este reporte todavía. Se mantendrá activo.
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">No cuenta con incidencias ni reportes disciplinarios.</p>
                      )}
                    </div>

                    {/* Notas del Profesor */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Notas de Profesores</span>
                        <button
                          type="button"
                          onClick={() => setShowAddNoteForm(!showAddNoteForm)}
                          className="text-[9.5px] font-extrabold text-violet-600 dark:text-violet-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <Plus className="h-3 w-3" /> Agregar Nota
                        </button>
                      </div>

                      {showAddNoteForm && (
                        <div className="p-3 bg-violet-50/60 dark:bg-violet-955/20 border border-violet-200 dark:border-violet-900 rounded-xl mb-3 space-y-2">
                          <input
                            type="text"
                            value={newTeacherNoteName}
                            onChange={(e) => setNewTeacherNoteName(e.target.value)}
                            placeholder="Nombre del Profesor (Ej. Israel López)"
                            className="w-full text-xs p-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white"
                          />
                          <textarea
                            value={newTeacherNoteText}
                            onChange={(e) => setNewTeacherNoteText(e.target.value)}
                            placeholder="Anotación del docente sobre el desempeño o comportamiento..."
                            className="w-full text-xs p-2 rounded-lg border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white h-16 resize-none"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAddNoteForm(false)}
                              className="px-2.5 py-1 text-xs text-zinc-500 hover:underline"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (newTeacherNoteText.trim()) {
                                  const noteObj = {
                                    date: new Date().toISOString().split('T')[0],
                                    note: newTeacherNoteText.trim(),
                                    teacher_name: newTeacherNoteName.trim() || 'Profesor'
                                  };
                                  addTeacherNote(selectedStudent.id, noteObj);
                                  setSelectedStudent(prev => prev ? { ...prev, teacher_notes: [noteObj, ...(prev.teacher_notes || [])] } : null);
                                  setNewTeacherNoteText('');
                                  setShowAddNoteForm(false);
                                }
                              }}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-bold shadow-sm"
                            >
                              Guardar Nota
                            </button>
                          </div>
                        </div>
                      )}

                      {selectedStudent.teacher_notes && selectedStudent.teacher_notes.length > 0 ? (
                        <div className="space-y-2">
                          {selectedStudent.teacher_notes.map((n, idx) => {
                            const matchingMsg = parentMessages.find(m => 
                              m.student_id === selectedStudent.id && 
                              (m.subject_name === 'Observación Docente' || m.id.startsWith('msg-tnote')) &&
                              m.parent_reply
                            );
                            const tutorReply = n.parent_reply || matchingMsg?.parent_reply;
                            const hasReplied = Boolean(tutorReply);

                            return (
                              <div key={idx} className="p-2.5 rounded-xl bg-violet-50/60 dark:bg-violet-955/10 border border-violet-200/30 text-[10.5px] space-y-1.5">
                                <div className="flex justify-between items-center font-bold text-violet-700 dark:text-violet-400 text-[9.5px]">
                                  <span>Prof. {n.teacher_name}</span>
                                  <div className="flex items-center gap-2">
                                    <span>{n.date}</span>
                                    {hasReplied ? (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (confirm('¿Deseas eliminar esta nota del docente del expediente? (El tutor ya ha respondido)')) {
                                            deleteTeacherNote(selectedStudent.id, idx);
                                            setSelectedStudent(prev => prev ? { ...prev, teacher_notes: (prev.teacher_notes || []).filter((_, i) => i !== idx) } : null);
                                          }
                                        }}
                                        className="p-1 rounded text-violet-600 hover:text-purple-800 hover:bg-violet-200/60 dark:hover:bg-violet-900/60 transition-all cursor-pointer"
                                        title="Eliminar del expediente (Respuesta del tutor recibida)"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    ) : (
                                      <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-zinc-200/70 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 font-bold" title="Solo se activa eliminar cuando el tutor contesta">
                                        ⏳ Pendiente
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 italic">"{n.note}"</p>

                                {hasReplied ? (
                                  <div className="mt-1.5 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-955/20 border border-emerald-200/60 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-medium">
                                    💬 <strong>Respuesta del Tutor:</strong> "{tutorReply}"
                                  </div>
                                ) : (
                                  <div className="mt-1 text-[9px] text-zinc-400 italic">
                                    El tutor no ha respondido esta nota todavía. Se mantendrá activa en el expediente.
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-500 italic">Sin anotaciones de maestros.</p>
                      )}
                    </div>

                    {/* Médico */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Tipo de Sangre</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 text-xs font-extrabold">{selectedStudent.blood_type || 'S/D'}</span>
                      </div>
                      
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Alergias / Restricciones Médicas</span>
                        {selectedStudent.medical_notes ? (
                          <div className="p-2.5 rounded-lg bg-red-50/80 border border-red-200/50 dark:bg-red-950/10 dark:border-red-900/30 text-red-700 dark:text-red-400 text-xs font-medium">
                            {selectedStudent.medical_notes}
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Ninguna alergia reportada</span>
                        )}
                      </div>
                    </div>

                    {/* Notas Académicas de Coordinación */}
                    <div className="bg-zinc-50/50 dark:bg-zinc-950/10 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Notas de Coordinación</span>
                      <p className="text-xs text-zinc-600 dark:text-zinc-300 italic leading-relaxed">
                        {selectedStudent.academic_notes || "Sin notas académicas registradas en este expediente."}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Pie de Modal */}
            <div className="p-4 px-6 border-t border-zinc-100 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-950/10 flex items-center justify-between gap-3">
              <div>
                {canDeleteStudent ? (
                  <button
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Trash2 className="h-4 w-4 text-rose-600" />
                    <span>Eliminar Alumno del Sistema</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-zinc-400 italic">
                    Modo solo lectura de expediente escolar
                  </span>
                )}
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-full text-xs font-bold shadow-md shadow-zinc-500/10 transition-all cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Alumno del Sistema (Acción Directiva) */}
      {isConfirmDeleteOpen && selectedStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-rose-200 dark:border-rose-900/50 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900 dark:text-white">
                  Eliminar Alumno del Sistema
                </h3>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                  Acción autorizada para Directivos y Super Usuarios
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-zinc-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-700/60 text-xs space-y-1.5">
              <p className="font-black text-slate-900 dark:text-white">
                {selectedStudent.first_name} {selectedStudent.last_name_1} {selectedStudent.last_name_2 || ''}
              </p>
              <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500 font-mono">
                <span>Matrícula: {selectedStudent.enrollment_id || 'S/N'}</span>
                <span>CURP: {selectedStudent.curp || 'S/N'}</span>
                <span>Grado: {selectedStudent.grade}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="leading-tight">
                <strong>Aviso de Trazabilidad:</strong> El retiro de este alumno quedará registrado en el módulo de <strong>Super Usuario</strong> con la <strong>fecha y hora exacta</strong> de la baja institucional.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Motivo de la baja o retiro:
              </label>
              <select
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Traslado de colegio / Solicitud familiar">Traslado de colegio / Solicitud familiar</option>
                <option value="Cambio de residencia o ciudad">Cambio de residencia o ciudad</option>
                <option value="Baja administrativa por falta de documentación">Baja administrativa por falta de documentación</option>
                <option value="Egreso escolar / Fin de ciclo">Egreso escolar / Fin de ciclo</option>
                <option value="Baja solicitada por Dirección General">Baja solicitada por Dirección General</option>
                <option value="Otro motivo justificado">Otro motivo justificado</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-full border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteStudentFromExpediente}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirmar Baja y Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL PARA DAR DE ALTA / EDITAR PROFESOR --- */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-brand-primary" />
                {editingTeacher ? 'Editar Información del Profesor' : 'Dar de Alta Nuevo Profesor'}
              </h3>
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!teacherFormData.first_name || !teacherFormData.last_name) {
                  alert('Favor de llenar los campos obligatorios.');
                  return;
                }

                if (editingTeacher) {
                  updateTeacher(editingTeacher.id, {
                    first_name: teacherFormData.first_name,
                    last_name: teacherFormData.last_name,
                    email: teacherFormData.email || `${teacherFormData.first_name.toLowerCase()}@iskool.edu.mx`
                  });
                  alert('¡Información del docente actualizada correctamente!');
                } else {
                  registerTeacher({
                    first_name: teacherFormData.first_name,
                    last_name: teacherFormData.last_name,
                    email: teacherFormData.email || `${teacherFormData.first_name.toLowerCase()}@iskool.edu.mx`
                  });
                  alert('¡Profesor registrado exitosamente!');
                }

                setIsTeacherModalOpen(false);
              }}
              className="flex flex-col gap-4 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre(s) *</label>
                <input
                  type="text"
                  required
                  value={teacherFormData.first_name}
                  onChange={(e) => setTeacherFormData(prev => ({ ...prev, first_name: e.target.value }))}
                  placeholder="Ej. Ana María"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Apellido(s) *</label>
                <input
                  type="text"
                  required
                  value={teacherFormData.last_name}
                  onChange={(e) => setTeacherFormData(prev => ({ ...prev, last_name: e.target.value }))}
                  placeholder="Ej. González Ruiz"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Correo Electrónico Institucional</label>
                <input
                  type="email"
                  value={teacherFormData.email}
                  onChange={(e) => setTeacherFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="ana.gonzalez@iskool.edu.mx"
                  className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t mt-2">
                <button
                  type="button"
                  onClick={() => setIsTeacherModalOpen(false)}
                  className="px-4 py-2 rounded-xl border text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ backgroundColor: 'var(--brand-primary)' }}
                  className="px-5 py-2 text-white rounded-xl font-bold shadow-md hover:opacity-90 transition-all"
                >
                  {editingTeacher ? 'Guardar Cambios' : 'Registrar Docente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PARA EDITAR EXPEDIENTE DE ALUMNO --- */}
      {isEditStudentModalOpen && editingStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 max-h-[90vh]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-violet-500" />
                Editar Expediente del Alumno
              </h3>
              <button
                type="button"
                onClick={() => setIsEditStudentModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!editingStudentData.id) return;
                updateStudent(editingStudentData.id, editingStudentData);
                if (selectedStudent && selectedStudent.id === editingStudentData.id) {
                  setSelectedStudent({ ...selectedStudent, ...editingStudentData } as DetailedStudent);
                }
                setIsEditStudentModalOpen(false);
              }}
              className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs"
            >
              {/* Nombres y Apellidos */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Primer Nombre *</label>
                  <input
                    type="text"
                    required
                    value={editingStudentData.first_name || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, first_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Segundo Nombre</label>
                  <input
                    type="text"
                    value={editingStudentData.second_name || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, second_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Primer Apellido *</label>
                  <input
                    type="text"
                    required
                    value={editingStudentData.last_name_1 || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, last_name_1: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Segundo Apellido</label>
                  <input
                    type="text"
                    value={editingStudentData.last_name_2 || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, last_name_2: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Datos Escolares y Fecha de Nacimiento */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    value={editingStudentData.birth_date || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, birth_date: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Género</label>
                  <select
                    value={editingStudentData.gender || 'Masculino'}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, gender: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  >
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">CURP</label>
                  <input
                    type="text"
                    value={editingStudentData.curp || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, curp: e.target.value.toUpperCase() })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white uppercase font-mono"
                  />
                </div>
              </div>

              {/* Contacto */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={editingStudentData.email || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={editingStudentData.phone || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Padres / Tutores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre de la Madre</label>
                  <input
                    type="text"
                    value={editingStudentData.mother_name || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, mother_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Nombre del Padre</label>
                  <input
                    type="text"
                    value={editingStudentData.father_name || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, father_name: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Notas Médicas y Académicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Alergias / Notas Médicas</label>
                  <textarea
                    value={editingStudentData.medical_notes || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, medical_notes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white h-16 resize-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Notas de Coordinación Académica</label>
                  <textarea
                    value={editingStudentData.academic_notes || ''}
                    onChange={(e) => setEditingStudentData({ ...editingStudentData, academic_notes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-900 dark:text-white h-16 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsEditStudentModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-500 hover:underline cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE CONFIRMACIÓN PARA DAR DE BAJA PROFESOR --- */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center animate-in zoom-in-95">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center text-xl font-bold">
              🗑️
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-900 dark:text-white">¿Dar de baja a este profesor?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                Estás a punto de dar de baja a <strong className="text-zinc-800 dark:text-zinc-200">{teacherToDelete.first_name} {teacherToDelete.last_name}</strong> ({teacherToDelete.email}). Esta acción retirará su acceso a la plataforma.
              </p>
            </div>
            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={() => setTeacherToDelete(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  deleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/20 transition-all"
              >
                Sí, Dar de Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
