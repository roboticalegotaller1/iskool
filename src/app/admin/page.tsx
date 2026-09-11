"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  UploadCloud, 
  Download, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Cpu, 
  BarChart3, 
  Activity, 
  Dumbbell, 
  Music, 
  Bot, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft,
  School,
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2,
  Trash2,
  FileText,
  FileDown,
  Palette,
  Brain,
  Globe2,
  ImageIcon,
  Calendar,
  Layers,
  ExternalLink,
  X,
  Edit3,
  DollarSign,
  Crown,
  Save,
  Sliders,
  Landmark,
  Receipt,
  Printer,
  AlertCircle,
  TrendingUp,
  CreditCard,
  ArrowUpRight
} from 'lucide-react';
import { 
  useSchoolAdminStore, 
  generateRandomPassword,
  getSchoolCampuses,
  getSchoolStudents,
  getSchoolTeachers,
  getSchoolGroups,
  getSchoolSubjects,
  getSchoolStaff,
  getSchoolEmailDomain,
  getDirectorLimits,
  getSchoolPayroll,
  getSchoolBillingRecords,
  getSchoolDeletionAuditLogs
} from '@/store/useSchoolAdminStore';
import { DetailedStudent, Subject, GroupAnnualPlan, SyllabusTopic, Campus, Group, canManageTargetRole, StaffPayrollRecord, isPlatformSuperUser, StudentDeletionAuditLog, UserRole } from '@/types';
import ExecutiveAnalyticsStudio from '@/components/admin/ExecutiveAnalyticsStudio';
import { SuperUserCompendiumStudio } from '@/components/books/SuperUserCompendiumStudio';

type AdminTab = 'overview' | 'staff' | 'teachers' | 'students' | 'campuses' | 'subjects' | 'config' | 'payroll' | 'analytics' | 'deletions' | 'books_compendium';

export default function SuperUserAdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const {
    institutionsList,
    activeSchoolId,
    selectSchool,
    createInstitution,
    updateInstitution,
    deleteInstitution,
    schoolSettings,
    campusesList,
    detailedStudents,
    groupsList,
    subjectsList,
    teachersList,
    toggleUserBlock,
    changeUserPassword,
    registerStudent,
    bulkRegisterStudents,
    registerTeacher,
    createSubject,
    deleteSubject,
    updateGroupAnnualPlan,
    updateSubjectSyllabus,
    createCampus,
    updateCampus,
    deleteCampus,
    createGroup,
    updateGroup,
    deleteGroup,
    staffUsers,
    staffPayroll: storeStaffPayroll,
    billingRecords: storeBillingRecords,
    registerStaffAccount,
    updateStaffAccount,
    deleteStaffAccount,
    toggleStaffBlock,
    changeStaffPassword,
    directorLimits,
    updateDirectorLimits,
    updatePayrollRecord,
    dispersePayrollBatch,
    adjustSalary
  } = useSchoolAdminStore();

  // Verificación estricta de Super Usuario ISkool (Nivel 1) vs Dueño de Colegio (Nivel 2)
  const isSuperUser = useMemo(() => isPlatformSuperUser(user), [user]);
  const effectiveSchoolId = useMemo(() => {
    if (isSuperUser) return activeSchoolId;
    return user?.school_id || 'sch-jjrosseau';
  }, [isSuperUser, activeSchoolId, user]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'student') {
        router.push('/student');
      } else if (user.role === 'teacher') {
        router.push('/teacher');
      } else if (!isSuperUser && user.role !== 'owner') {
        router.push('/login');
      }
    }
  }, [user, authLoading, router, isSuperUser]);

  // Sincronización y candado para dueños de colegio: nunca pueden operar fuera de su school_id
  useEffect(() => {
    if (!authLoading && user && !isSuperUser && user.school_id) {
      if (activeSchoolId !== user.school_id) {
        selectSchool(user.school_id);
      }
    }
  }, [authLoading, user, isSuperUser, activeSchoolId, selectSchool]);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [selectedLimitsSchoolId, setSelectedLimitsSchoolId] = useState<string>('sch-jjrosseau');
  
  // Modales Multi-Colegios
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [editingSchoolLogoId, setEditingSchoolLogoId] = useState<string | null>(null);
  const schoolLogoFileInputRef = useRef<HTMLInputElement | null>(null);
  const [newSchoolForm, setNewSchoolForm] = useState({
    name: '',
    tagline: '',
    cct: '',
    logoUrl: '',
    address: '',
    phone: '',
    website: '',
    coordinatorName: '',
    campusesCount: 2
  });

  // Filtros de búsqueda
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGradeFilter, setStudentGradeFilter] = useState('all');
  const [studentStatusFilter, setStudentStatusFilter] = useState('all');
  
  const [teacherSearch, setTeacherSearch] = useState('');

  // Estados de Auditoría de Bajas para Super Usuario
  const studentDeletionAuditLogs = useSchoolAdminStore(state => state.studentDeletionAuditLogs) || [];
  const deleteStudent = useSchoolAdminStore(state => state.deleteStudent);
  const [deletionSearchTerm, setDeletionSearchTerm] = useState('');
  const [studentToDeleteAdmin, setStudentToDeleteAdmin] = useState<DetailedStudent | null>(null);
  const [adminDeleteReason, setAdminDeleteReason] = useState('Baja administrativa directa por Super Usuario');

  const schoolDeletionLogs = useMemo(() => {
    return getSchoolDeletionAuditLogs(studentDeletionAuditLogs, isSuperUser ? null : effectiveSchoolId);
  }, [studentDeletionAuditLogs, isSuperUser, effectiveSchoolId]);

  const filteredDeletionLogs = useMemo(() => {
    if (!deletionSearchTerm.trim()) return schoolDeletionLogs;
    const q = deletionSearchTerm.toLowerCase();
    return schoolDeletionLogs.filter(l => 
      l.student_name.toLowerCase().includes(q) ||
      (l.curp && l.curp.toLowerCase().includes(q)) ||
      (l.enrollment_id && l.enrollment_id.toLowerCase().includes(q)) ||
      (l.reason && l.reason.toLowerCase().includes(q)) ||
      (l.deleted_by_name && l.deleted_by_name.toLowerCase().includes(q)) ||
      (l.school_name && l.school_name.toLowerCase().includes(q))
    );
  }, [schoolDeletionLogs, deletionSearchTerm]);
  
  // Modales
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [showAddWorkshopModal, setShowAddWorkshopModal] = useState(false);
  
  // Modal de Detalle del Taller Académico (Información + Temario + Multi-Grupo + Alumnos)
  const [selectedWorkshopDetail, setSelectedWorkshopDetail] = useState<Subject | null>(null);
  const [workshopDetailTab, setWorkshopDetailTab] = useState<'syllabus' | 'annual_plans' | 'students'>('syllabus');
  const [selectedGroupForPlan, setSelectedGroupForPlan] = useState<string>('grp-jar-4a');
  const [workshopStudentSearch, setWorkshopStudentSearch] = useState('');
  const [showEditAnnualPlanModal, setShowEditAnnualPlanModal] = useState(false);
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);

  // Formulario de edición de planeación anual de grupo
  const [annualPlanForm, setAnnualPlanForm] = useState({
    plan_title: '',
    project_title: '',
    pda_focus: '',
    term_1: '',
    term_2: '',
    term_3: ''
  });

  // Formulario de nuevo bloque para el temario
  const [newTopicForm, setNewTopicForm] = useState({
    block: 'Bloque 5',
    title: '',
    weeks: '4 Semanas',
    description: '',
    deliverable: ''
  });

  const [viewSyllabusModal, setViewSyllabusModal] = useState<{ isOpen: boolean; workshopName: string; syllabusUrl?: string; filename?: string }>({
    isOpen: false,
    workshopName: ''
  });

  const [showPasswordModal, setShowPasswordModal] = useState<{ isOpen: boolean; userId: string; userName: string; role: 'teacher' | 'student'; currentPassword?: string }>({
    isOpen: false,
    userId: '',
    userName: '',
    role: 'student'
  });

  // Estado para copia y toasts
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast(`Copiado: ${text}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Formulario de Alumno Individual
  const [newStudentForm, setNewStudentForm] = useState({
    first_name: '',
    second_name: '',
    last_name_1: '',
    last_name_2: '',
    campus_name: 'Primaria Jardines',
    level: 'primaria' as 'primaria' | 'secundaria' | 'preparatoria',
    grade: '1º',
    group_id: 'grp-jar-1a',
    curp: '',
    gender: 'Masculino',
    tutor_name: '',
    emergency_contact_phone: '',
    scholarship_percentage: 0,
    scholarship_type: 'academica' as 'academica' | 'deportiva' | 'hermanos' | 'sep' | 'socioeconomica'
  });

  // Formulario de Profesor
  const [newTeacherForm, setNewTeacherForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    campus_name: 'Primaria Jardines',
    assigned_subjects: 'Matemáticas, Robótica',
    assigned_groups: '1ºA Jardines'
  });

  // Estados para Personal Administrativo (Directores, Coordinadores, Cobranza)
  const [staffRoleFilter, setStaffRoleFilter] = useState<'all' | 'director' | 'coordinator' | 'billing'>('all');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [copiedStaffPasswordId, setCopiedStaffPasswordId] = useState<string | null>(null);
  const [newStaffForm, setNewStaffForm] = useState({
    first_name: '',
    last_name: '',
    role: 'director' as 'director' | 'coordinator' | 'billing',
    school_id: effectiveSchoolId || 'sch-jjrosseau',
    campus_name: '',
    email: '',
    phone: '',
    temporary_password: ''
  });

  // Estados para Finanzas & Nóminas del Personal (Portal del Dueño)
  const [payrollSearchTerm, setPayrollSearchTerm] = useState('');
  const [payrollDepartmentFilter, setPayrollDepartmentFilter] = useState('all');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState('all');
  const [selectedPayrollRecordForStub, setSelectedPayrollRecordForStub] = useState<StaffPayrollRecord | null>(null);
  const [selectedPayrollRecordForAdjust, setSelectedPayrollRecordForAdjust] = useState<StaffPayrollRecord | null>(null);
  const [adjustSalaryForm, setAdjustSalaryForm] = useState({
    base_salary: 0,
    bonuses: 0,
    deductions: 0,
    notes: ''
  });
  const [isDispersingPayroll, setIsDispersingPayroll] = useState(false);

  // Formulario de Materia Curricular Simple
  const [newSubjectForm, setNewSubjectForm] = useState({
    name: '',
    sep_code: '',
    category: 'curricular' as 'curricular' | 'optativa',
    is_elective: false,
    level_grade_id: 'all'
  });

  // Formulario Extendido para Nuevo Taller Académico / Optativa
  const [newWorkshopForm, setNewWorkshopForm] = useState({
    name: '',
    sep_code: '',
    workshop_category: 'tecnologico' as 'deportivo' | 'tecnologico' | 'artistico' | 'academico' | 'cientifico',
    campus_name: 'Todos los Planteles',
    instructor_name: 'Prof. Israel López',
    schedule: 'Martes y Jueves 16:00 - 17:30',
    description: '',
    image_url: '',
    syllabus_url: '',
    syllabus_filename: ''
  });

  // Carga Masiva: Texto o Archivo
  const [bulkTextInput, setBulkTextInput] = useState('');
  const [bulkPreviewList, setBulkPreviewList] = useState<Array<Partial<DetailedStudent>>>([]);
  const [, setIsParsingBulk] = useState(false);
  const [bulkGeneratedResults, setBulkGeneratedResults] = useState<DetailedStudent[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const workshopImageRef = useRef<HTMLInputElement | null>(null);
  const workshopSyllabusRef = useRef<HTMLInputElement | null>(null);

  // Estados para Gestión Detallada de Planteles & Grupos
  const [selectedCampusDetail, setSelectedCampusDetail] = useState<Campus | null>(null);
  const [campusDetailTab, setCampusDetailTab] = useState<'grupos' | 'alumnos' | 'profesores' | 'config'>('grupos');
  const [campusSearchStudent, setCampusSearchStudent] = useState('');

  // Estados para Creación y Edición de Planteles
  const [showAddCampusModal, setShowAddCampusModal] = useState(false);
  const [newCampusForm, setNewCampusForm] = useState({
    name: '',
    level: 'primaria' as 'primaria' | 'secundaria' | 'preparatoria',
    address: '',
    phone: '',
    grades: ['1º', '2º', '3º', '4º', '5º', '6º']
  });

  // Estado para Creación de Grupo en Plantel
  const [showAddGroupModal, setShowAddGroupModal] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState({
    name: 'B',
    grade: '1º'
  });

  // Estado para Edición de Plantel
  const [showEditCampusModal, setShowEditCampusModal] = useState(false);
  const [editingCampusForm, setEditingCampusForm] = useState({
    id: '',
    name: '',
    level: 'primaria' as 'primaria' | 'secundaria' | 'preparatoria',
    address: '',
    phone: ''
  });

  // Métrica Total de Tokens de IA Pedagógica
  const totalAITokens = useMemo(() => {
    const fromTeachers = (teachersList || []).reduce((acc, t) => acc + (t.ai_tokens_consumed || 0), 0);
    const fromInstitutions = (institutionsList || []).reduce((acc, i) => acc + (i.aiTokensConsumed || 0), 0);
    return Math.max(fromTeachers, fromInstitutions, 345350);
  }, [teachersList, institutionsList]);

  // Colegio Activo (Aislamiento Estricto: para dueños siempre es su colegio asignado)
  const currentSchool = useMemo(() => {
    return (institutionsList || []).find(i => i.id === effectiveSchoolId) || null;
  }, [institutionsList, effectiveSchoolId]);

  // Estado para Edición de Ficha Institucional en Tab Config
  const [instEditForm, setInstEditForm] = useState({
    name: '',
    cct: '',
    tagline: '',
    address: '',
    phone: '',
    website: '',
    coordinatorName: '',
    logoUrl: ''
  });

  // Sincronizar instEditForm cuando cambie el colegio activo o institutionsList
  useEffect(() => {
    if (currentSchool) {
      setInstEditForm({
        name: currentSchool.name || '',
        cct: currentSchool.cct || '',
        tagline: currentSchool.tagline || '',
        address: currentSchool.address || currentSchool.settings?.address || '',
        phone: currentSchool.phone || currentSchool.settings?.phone || '',
        website: currentSchool.website || currentSchool.settings?.website || '',
        coordinatorName: currentSchool.coordinatorName || currentSchool.settings?.coordinators?.[0] || 'Dirección General',
        logoUrl: currentSchool.logoUrl || currentSchool.settings?.logoUrl || ''
      });
    } else if (schoolSettings) {
      setInstEditForm({
        name: schoolSettings.name || 'UP Juan Jacobo Rosseau',
        cct: schoolSettings.cct || '09PPR2026R',
        tagline: 'Institución de Excelencia Académica',
        address: schoolSettings.address || '',
        phone: schoolSettings.phone || '',
        website: schoolSettings.website || '',
        coordinatorName: schoolSettings.coordinators?.[0] || 'Dirección General',
        logoUrl: schoolSettings.logoUrl || ''
      });
    }
  }, [currentSchool, schoolSettings, effectiveSchoolId]);

  // Manejo de Guardado de Ficha Institucional
  const handleSaveInstitutionalInfo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!instEditForm.name.trim() || !instEditForm.cct.trim()) {
      alert('El nombre institucional y el CCT son obligatorios.');
      return;
    }

    const schoolId = effectiveSchoolId || 'sch-jjrosseau';
    updateInstitution(schoolId, {
      name: instEditForm.name.trim(),
      cct: instEditForm.cct.trim().toUpperCase(),
      tagline: instEditForm.tagline.trim(),
      address: instEditForm.address.trim(),
      phone: instEditForm.phone.trim(),
      website: instEditForm.website.trim(),
      coordinatorName: instEditForm.coordinatorName.trim(),
      logoUrl: instEditForm.logoUrl
    });

    showToast(`✅ Ficha institucional de "${instEditForm.name}" guardada y actualizada con éxito.`);
  };

  // Manejo de Creación de Nuevo Colegio
  const handleCreateSchool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolForm.name.trim() || !newSchoolForm.cct.trim()) {
      alert('Por favor ingresa el nombre del colegio y su CCT.');
      return;
    }

    const created = createInstitution({
      name: newSchoolForm.name,
      tagline: newSchoolForm.tagline || 'Institución de Excelencia Académica',
      cct: newSchoolForm.cct.toUpperCase(),
      logoUrl: newSchoolForm.logoUrl,
      address: newSchoolForm.address || 'Ciudad de México',
      phone: newSchoolForm.phone || '55-0000-0000',
      website: newSchoolForm.website || '',
      coordinatorName: newSchoolForm.coordinatorName || 'Dirección General',
      campusesCount: Number(newSchoolForm.campusesCount) || 2
    });

    showToast(`🏛️ ¡Colegio "${created.name}" creado e inicializado con éxito!`);
    setShowAddSchoolModal(false);
    setNewSchoolForm({
      name: '',
      tagline: '',
      cct: '',
      logoUrl: '',
      address: '',
      phone: '',
      website: '',
      coordinatorName: '',
      campusesCount: 2
    });
  };

  // Manejo de Subida de Logotipo de Colegio
  const handleSchoolLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, schoolId: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const logoData = reader.result as string;
        updateInstitution(schoolId, { logoUrl: logoData });
        showToast('🎨 Logotipo escolar actualizado correctamente.');
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo de Creación de Nuevo Plantel
  const handleCreateCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampusForm.name.trim()) {
      alert('Ingresa el nombre del plantel.');
      return;
    }

    const assignedGrades = newCampusForm.level === 'primaria' 
      ? ['1º', '2º', '3º', '4º', '5º', '6º'] 
      : newCampusForm.level === 'secundaria' 
      ? ['1º', '2º', '3º'] 
      : ['1º Sem', '2º Sem', '3º Sem', '4º Sem', '5º Sem', '6º Sem'];

    createCampus({
      name: newCampusForm.name.trim(),
      level: newCampusForm.level,
      address: newCampusForm.address || 'Ciudad de México',
      phone: newCampusForm.phone || '55-4160-8800',
      grades: assignedGrades,
      school_id: effectiveSchoolId || 'sch-jjrosseau'
    });

    showToast(`🏢 ¡Plantel "${newCampusForm.name}" creado con éxito!`);
    setShowAddCampusModal(false);
    setNewCampusForm({
      name: '',
      level: 'primaria',
      address: '',
      phone: '',
      grades: ['1º', '2º', '3º', '4º', '5º', '6º']
    });
  };

  // Manejo de Creación de Grupo en Plantel
  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampusDetail) return;

    createGroup({
      name: newGroupForm.name.toUpperCase().trim(),
      grade: newGroupForm.grade,
      campus_name: selectedCampusDetail.name,
      campus_id: selectedCampusDetail.id,
      level: selectedCampusDetail.level,
      school_id: effectiveSchoolId || 'sch-jjrosseau'
    });

    showToast(`✅ Grupo "${newGroupForm.grade} ${newGroupForm.name.toUpperCase().trim()}" creado en ${selectedCampusDetail.name}`);
    setShowAddGroupModal(false);
  };

  // Manejo de Actualización de Plantel
  const handleUpdateCampus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampusForm.id) return;

    updateCampus(editingCampusForm.id, {
      name: editingCampusForm.name,
      level: editingCampusForm.level,
      address: editingCampusForm.address,
      phone: editingCampusForm.phone
    });

    if (selectedCampusDetail && selectedCampusDetail.id === editingCampusForm.id) {
      setSelectedCampusDetail({
        ...selectedCampusDetail,
        name: editingCampusForm.name,
        level: editingCampusForm.level,
        address: editingCampusForm.address,
        phone: editingCampusForm.phone
      });
    }

    showToast('✏️ Datos del plantel actualizados con éxito.');
    setShowEditCampusModal(false);
  };

  // Listas con Particionado y Aislamiento Escolar Estricto
  const schoolCampuses = useMemo(() => {
    return getSchoolCampuses(campusesList, effectiveSchoolId);
  }, [campusesList, effectiveSchoolId]);

  const schoolStudents = useMemo(() => {
    return getSchoolStudents(detailedStudents, effectiveSchoolId, schoolCampuses);
  }, [detailedStudents, effectiveSchoolId, schoolCampuses]);

  const schoolTeachers = useMemo(() => {
    return getSchoolTeachers(teachersList, effectiveSchoolId, schoolCampuses);
  }, [teachersList, effectiveSchoolId, schoolCampuses]);

  const schoolGroups = useMemo(() => {
    return getSchoolGroups(groupsList, effectiveSchoolId, schoolCampuses);
  }, [groupsList, effectiveSchoolId, schoolCampuses]);

  const schoolSubjects = useMemo(() => {
    return getSchoolSubjects(subjectsList, effectiveSchoolId, schoolCampuses);
  }, [subjectsList, effectiveSchoolId, schoolCampuses]);

  // Personal Administrativo Filtrado
  const schoolStaff = useMemo(() => {
    return getSchoolStaff(staffUsers, effectiveSchoolId);
  }, [staffUsers, effectiveSchoolId]);

  const filteredStaffList = useMemo(() => {
    return schoolStaff.filter(s => {
      const matchRole = staffRoleFilter === 'all' || s.role === staffRoleFilter;
      const q = staffSearchQuery.toLowerCase().trim();
      const matchQuery = !q ||
        s.first_name.toLowerCase().includes(q) ||
        s.last_name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        (s.campus_name && s.campus_name.toLowerCase().includes(q));
      return matchRole && matchQuery;
    });
  }, [schoolStaff, staffRoleFilter, staffSearchQuery]);

  // Nómina y Finanzas del Colegio (Supervisión del Dueño)
  const schoolPayroll = useMemo(() => {
    return getSchoolPayroll(storeStaffPayroll, effectiveSchoolId, selectedCampus);
  }, [storeStaffPayroll, effectiveSchoolId, selectedCampus]);

  const schoolBilling = useMemo(() => {
    return getSchoolBillingRecords(storeBillingRecords, effectiveSchoolId, schoolStudents);
  }, [storeBillingRecords, effectiveSchoolId, schoolStudents]);

  const filteredPayroll = useMemo(() => {
    return schoolPayroll.filter(p => {
      const matchDept = payrollDepartmentFilter === 'all' || 
        p.department === payrollDepartmentFilter || 
        (payrollDepartmentFilter === 'docentes' && p.role === 'teacher') || 
        (payrollDepartmentFilter === 'directivos' && (p.role === 'director' || p.role === 'coordinator')) ||
        (payrollDepartmentFilter === 'cobranza' && p.role === 'billing');
      const matchStatus = payrollStatusFilter === 'all' || p.status === payrollStatusFilter;
      const q = payrollSearchTerm.toLowerCase().trim();
      const matchQuery = !q ||
        p.employee_name.toLowerCase().includes(q) ||
        p.position_title.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        (p.rfc && p.rfc.toLowerCase().includes(q)) ||
        (p.curp && p.curp.toLowerCase().includes(q)) ||
        (p.receipt_folio && p.receipt_folio.toLowerCase().includes(q));
      return matchDept && matchStatus && matchQuery;
    });
  }, [schoolPayroll, payrollDepartmentFilter, payrollStatusFilter, payrollSearchTerm]);

  const payrollMetrics = useMemo(() => {
    const totalPayroll = schoolPayroll.reduce((sum, p) => sum + p.net_salary, 0);
    const paidPayroll = schoolPayroll.filter(p => p.status === 'pagado').reduce((sum, p) => sum + p.net_salary, 0);
    const pendingPayroll = schoolPayroll.filter(p => p.status !== 'pagado').reduce((sum, p) => sum + p.net_salary, 0);
    const avgSalary = schoolPayroll.length > 0 ? totalPayroll / schoolPayroll.length : 0;
    
    // Ingresos por colegiaturas recaudadas del colegio
    const totalTuitionIncome = schoolBilling.filter(b => b.status === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0);
    const pendingTuitionIncome = schoolBilling.filter(b => b.status !== 'paid').reduce((sum, b) => sum + (b.amount || 0), 0);
    
    // Margen operativo institucional neto
    const netOperatingMargin = totalTuitionIncome - totalPayroll;

    return {
      totalPayroll,
      paidPayroll,
      pendingPayroll,
      avgSalary,
      totalTuitionIncome,
      pendingTuitionIncome,
      netOperatingMargin,
      totalEmployees: schoolPayroll.length,
      pendingDispersionsCount: schoolPayroll.filter(p => p.status !== 'pagado').length
    };
  }, [schoolPayroll, schoolBilling]);

  const handleBatchDisperse = () => {
    const pending = schoolPayroll.filter(p => p.status !== 'pagado');
    if (pending.length === 0) {
      showToast('ℹ️ No hay nóminas pendientes por dispersar en este momento.');
      return;
    }
    setIsDispersingPayroll(true);
    setTimeout(() => {
      dispersePayrollBatch(pending.map(p => p.id));
      setIsDispersingPayroll(false);
      showToast(`✅ Dispersión bancaria SPEI procesada exitosamente para ${pending.length} colaboradores.`);
    }, 600);
  };

  const handleExportPayrollCSV = () => {
    const headers = [
      'Folio Recibo',
      'Colaborador',
      'Rol',
      'Departamento / Puesto',
      'Campus',
      'RFC',
      'CURP',
      'Banco',
      'Cuenta CLABE',
      'Periodo',
      'Sueldo Base',
      'Bonos / Percepciones',
      'Deducciones / Retenciones',
      'Sueldo Neto',
      'Estatus Pago',
      'Fecha Pago'
    ];
    const rows = schoolPayroll.map(p => [
      p.receipt_folio || 'PENDIENTE',
      `"${p.employee_name}"`,
      p.role,
      `"${p.position_title}"`,
      `"${p.campus_name || ''}"`,
      p.rfc || '',
      p.curp || '',
      `"${p.bank_name || ''}"`,
      p.account_clabe || '',
      `"${p.payment_period}"`,
      p.base_salary,
      p.bonuses,
      p.deductions,
      p.net_salary,
      p.status,
      p.payment_date || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Nomina_Personal_${effectiveSchoolId || 'colegio'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('📊 Reporte contable de nómina descargado en CSV.');
  };

  const handleOpenAdjustSalary = (rec: StaffPayrollRecord) => {
    setSelectedPayrollRecordForAdjust(rec);
    setAdjustSalaryForm({
      base_salary: rec.base_salary,
      bonuses: rec.bonuses,
      deductions: rec.deductions,
      notes: rec.notes || ''
    });
  };

  const handleSaveAdjustSalary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayrollRecordForAdjust) return;
    adjustSalary(
      selectedPayrollRecordForAdjust.employee_id,
      Number(adjustSalaryForm.base_salary) || 0,
      Number(adjustSalaryForm.bonuses) || 0,
      Number(adjustSalaryForm.deductions) || 0
    );
    if (adjustSalaryForm.notes !== selectedPayrollRecordForAdjust.notes) {
      updatePayrollRecord(selectedPayrollRecordForAdjust.id, { notes: adjustSalaryForm.notes });
    }
    showToast(`✏️ Compensaciones actualizadas para ${selectedPayrollRecordForAdjust.employee_name}.`);
    setSelectedPayrollRecordForAdjust(null);
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.first_name.trim() || !newStaffForm.last_name.trim()) {
      alert('Por favor introduce el nombre y apellido.');
      return;
    }

    const targetSchoolId = (!isSuperUser ? user?.school_id : (newStaffForm.school_id || effectiveSchoolId)) || 'sch-jjrosseau';
    const schoolObj = institutionsList.find(i => i.id === targetSchoolId);
    const domain = getSchoolEmailDomain(schoolObj);
    const emailPrefix = newStaffForm.email.trim() ? newStaffForm.email.trim().split('@')[0] : `${newStaffForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newStaffForm.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    const email = `${emailPrefix}@${domain}`;
    const tempPass = newStaffForm.temporary_password.trim() || generateRandomPassword(6);

    const created = registerStaffAccount({
      first_name: newStaffForm.first_name.trim(),
      last_name: newStaffForm.last_name.trim(),
      role: newStaffForm.role,
      school_id: targetSchoolId,
      campus_name: newStaffForm.campus_name.trim() || (newStaffForm.role === 'director' ? 'Dirección General' : newStaffForm.role === 'billing' ? 'Departamento de Cobranza' : 'Coordinación Escolar'),
      email,
      phone: newStaffForm.phone.trim() || '55-0000-0000',
      temporary_password: tempPass
    });

    showToast(`✅ Cuenta de ${newStaffForm.role.toUpperCase()} para ${created.first_name} ${created.last_name} registrada exitosamente.`);
    setShowAddStaffModal(false);
    setNewStaffForm({
      first_name: '',
      last_name: '',
      role: 'director',
      school_id: effectiveSchoolId || institutionsList[0]?.id || 'sch-jjrosseau',
      campus_name: '',
      email: '',
      phone: '',
      temporary_password: ''
    });
  };

  // Filtrado de Alumnos (dentro del colegio activo)
  const filteredStudents = useMemo(() => {
    return schoolStudents.filter(s => {
      const fullName = `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(studentSearch.toLowerCase()) || 
        (s.curp && s.curp.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (s.email && s.email.toLowerCase().includes(studentSearch.toLowerCase()));

      const matchesCampus = selectedCampus === 'all' || s.campus_name?.toLowerCase() === selectedCampus.toLowerCase();
      const matchesGrade = studentGradeFilter === 'all' || s.grade === studentGradeFilter;
      const matchesStatus = studentStatusFilter === 'all' || 
        (studentStatusFilter === 'blocked' ? (s.is_blocked || s.status === 'suspendido') : (!s.is_blocked && s.status === 'activo'));

      return matchesSearch && matchesCampus && matchesGrade && matchesStatus;
    });
  }, [schoolStudents, studentSearch, selectedCampus, studentGradeFilter, studentStatusFilter]);

  // Filtrado de Profesores (dentro del colegio activo)
  const filteredTeachers = useMemo(() => {
    return schoolTeachers.filter(t => {
      const fullName = `${t.first_name} ${t.last_name}`.toLowerCase();
      const matchesSearch = fullName.includes(teacherSearch.toLowerCase()) || 
        (t.email && t.email.toLowerCase().includes(teacherSearch.toLowerCase()));
      const matchesCampus = selectedCampus === 'all' || 
        t.campus_name?.toLowerCase() === selectedCampus.toLowerCase() || 
        t.campus_name === 'Todos los Planteles';

      return matchesSearch && matchesCampus;
    });
  }, [schoolTeachers, teacherSearch, selectedCampus]);

  // Manejo de Creación de Alumno Individual
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentForm.first_name || !newStudentForm.last_name_1) {
      alert('Por favor completa el nombre y primer apellido.');
      return;
    }

    const created = registerStudent({
      first_name: newStudentForm.first_name,
      second_name: newStudentForm.second_name,
      last_name_1: newStudentForm.last_name_1,
      last_name_2: newStudentForm.last_name_2,
      birth_date: '2016-01-01',
      curp: newStudentForm.curp || `${newStudentForm.last_name_1.substring(0, 2).toUpperCase()}${newStudentForm.first_name.substring(0, 2).toUpperCase()}160101HDFMRN01`,
      gender: newStudentForm.gender,
      level: newStudentForm.level,
      grade: newStudentForm.grade,
      group_id: newStudentForm.group_id,
      campus_name: newStudentForm.campus_name,
      tutor_name: newStudentForm.tutor_name,
      emergency_contact_phone: newStudentForm.emergency_contact_phone,
      scholarship_percentage: Number(newStudentForm.scholarship_percentage) || 0,
      scholarship_type: newStudentForm.scholarship_type,
      status: 'activo',
      is_blocked: false,
      temporary_password: generateRandomPassword(6)
    });

    showToast(`✅ Alumno ${created.first_name} ${created.last_name_1} registrado y dado de alta en Finanzas (Contraseña: ${created.temporary_password})`);
    setShowAddStudentModal(false);
    setNewStudentForm({
      first_name: '',
      second_name: '',
      last_name_1: '',
      last_name_2: '',
      campus_name: 'Primaria Jardines',
      level: 'primaria',
      grade: '1º',
      group_id: 'grp-jar-1a',
      curp: '',
      gender: 'Masculino',
      tutor_name: '',
      emergency_contact_phone: '',
      scholarship_percentage: 0,
      scholarship_type: 'academica'
    });
  };

  // Manejo de Creación de Profesor con Permisos Exclusivos de Docente
  const handleCreateTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.first_name.trim() || !newTeacherForm.last_name.trim()) {
      alert('Por favor completa el nombre del profesor.');
      return;
    }

    const domain = effectiveSchoolId === 'sch-test-case' 
      ? 'sandbox.iskool.edu.mx' 
      : effectiveSchoolId === 'sch-montessori' 
      ? 'montessoridelvalle.edu.mx' 
      : 'jjrosseau.edu.mx';

    const formattedEmail = newTeacherForm.email.trim() || 
      `${newTeacherForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newTeacherForm.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${domain}`;

    const campusName = newTeacherForm.campus_name || selectedCampusDetail?.name || schoolCampuses[0]?.name || 'Primaria Jardines';
    const campusObj = schoolCampuses.find(c => c.name.toLowerCase() === campusName.toLowerCase());

    const assignedSubs = newTeacherForm.assigned_subjects
      ? newTeacherForm.assigned_subjects.split(',').map(s => s.trim()).filter(Boolean)
      : ['Matemáticas', 'Robótica'];

    const assignedGrps = newTeacherForm.assigned_groups
      ? newTeacherForm.assigned_groups.split(',').map(g => g.trim()).filter(Boolean)
      : [];

    const tempPassword = generateRandomPassword(6);

    registerTeacher({
      first_name: newTeacherForm.first_name.trim(),
      last_name: newTeacherForm.last_name.trim(),
      email: formattedEmail,
      phone: newTeacherForm.phone || '55-4160-8800',
      campus_name: campusName,
      campus_id: campusObj?.id || selectedCampusDetail?.id || 'cmp-pri-jardines',
      assigned_subjects: assignedSubs,
      assigned_groups: assignedGrps,
      school_id: effectiveSchoolId || 'sch-jjrosseau',
      temporary_password: tempPassword
    });

    showToast(`👨‍🏫 ¡Profesor ${newTeacherForm.first_name} ${newTeacherForm.last_name} dado de alta con éxito! (Clave: ${tempPassword})`);
    setShowAddTeacherModal(false);
    setNewTeacherForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      campus_name: selectedCampusDetail?.name || schoolCampuses[0]?.name || 'Primaria Jardines',
      assigned_subjects: 'Matemáticas, Robótica',
      assigned_groups: '1ºA Jardines'
    });
  };

  // Manejo de Subida de Imagen del Taller
  const handleWorkshopImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewWorkshopForm(prev => ({ ...prev, image_url: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo de Subida de Temario / Programa PDF
  const handleWorkshopSyllabusUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewWorkshopForm(prev => ({
          ...prev,
          syllabus_url: reader.result as string,
          syllabus_filename: file.name
        }));
        showToast(`📄 Temario cargado: ${file.name}`);
      };
      reader.readAsDataURL(file);
    }
  };

  // Manejo de Creación de Nuevo Taller Académico
  const handleCreateWorkshop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkshopForm.name.trim()) {
      alert('Por favor ingresa el nombre del taller.');
      return;
    }

    const targetSchoolId = effectiveSchoolId === 'sch-jjrosseau' ? 'sch-jjr' : (effectiveSchoolId || 'sch-jjrosseau');
    const sepCode = newWorkshopForm.sep_code.trim() || `OPT-${newWorkshopForm.name.substring(0, 3).toUpperCase()}`;

    createSubject({
      school_id: targetSchoolId,
      level_grade_id: 'all',
      name: newWorkshopForm.name.trim(),
      sep_code: sepCode,
      category: 'optativa',
      is_elective: true,
      workshop_category: newWorkshopForm.workshop_category,
      campus_name: newWorkshopForm.campus_name,
      instructor_name: newWorkshopForm.instructor_name,
      schedule: newWorkshopForm.schedule,
      description: newWorkshopForm.description,
      image_url: newWorkshopForm.image_url,
      syllabus_url: newWorkshopForm.syllabus_url,
      syllabus_filename: newWorkshopForm.syllabus_filename,
      assigned_group_ids: ['grp-jar-4a', 'grp-jar-5a', 'grp-tor-4a', 'grp-sec-1a'],
      syllabus_topics: [
        { block: 'Bloque 1', title: 'Fundamentos e Introducción Práctica', weeks: '4 Semanas', description: 'Conceptos clave, normas de seguridad y dinámicas de integración grupal.', deliverable: 'Evaluación diagnóstica y bitácora inicial' },
        { block: 'Bloque 2', title: 'Desarrollo de Competencias y Técnicas', weeks: '6 Semanas', description: 'Metodología estructurada de ejercicios y retos individuales.', deliverable: 'Portafolio de evidencias de medio término' },
        { block: 'Bloque 3', title: 'Proyectos Colaborativos y Estrategia', weeks: '6 Semanas', description: 'Trabajo en equipo, análisis de casos y resolución de problemas.', deliverable: 'Proyecto integrador de aplicación' },
        { block: 'Bloque 4', title: 'Exhibición Escolar y Evaluación de Cierre', weeks: '4 Semanas', description: 'Presentación final y torneo de convivencia entre planteles.', deliverable: 'Demostración práctica en la Gala de Talleres' }
      ]
    });

    showToast(`🎉 ¡Taller "${newWorkshopForm.name}" agregado y publicado exitosamente!`);
    setShowAddWorkshopModal(false);
    setNewWorkshopForm({
      name: '',
      sep_code: '',
      workshop_category: 'tecnologico',
      campus_name: 'Todos los Planteles',
      instructor_name: 'Prof. Israel López',
      schedule: 'Martes y Jueves 16:00 - 17:30',
      description: '',
      image_url: '',
      syllabus_url: '',
      syllabus_filename: ''
    });
  };

  // Guardar Edición de Planeación Anual de Grupo
  const handleSaveAnnualPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopDetail) return;

    updateGroupAnnualPlan(selectedWorkshopDetail.id, selectedGroupForPlan, {
      plan_title: annualPlanForm.plan_title || `Planeación Anual - ${selectedWorkshopDetail.name}`,
      project_title: annualPlanForm.project_title,
      pda_focus: annualPlanForm.pda_focus,
      term_1: annualPlanForm.term_1,
      term_2: annualPlanForm.term_2,
      term_3: annualPlanForm.term_3
    });

    showToast(`✅ Planeación Anual actualizada para el grupo seleccionado.`);
    setShowEditAnnualPlanModal(false);

    // Actualizar referencia local en modal
    const updated = subjectsList.find(s => s.id === selectedWorkshopDetail.id);
    if (updated) setSelectedWorkshopDetail(updated);
  };

  // Agregar Nuevo Bloque al Temario del Taller
  const handleAddSyllabusTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWorkshopDetail || !newTopicForm.title.trim()) return;

    const currentTopics = selectedWorkshopDetail.syllabus_topics || [];
    const updatedTopics = [
      ...currentTopics,
      {
        block: newTopicForm.block,
        title: newTopicForm.title.trim(),
        weeks: newTopicForm.weeks,
        description: newTopicForm.description,
        deliverable: newTopicForm.deliverable
      }
    ];

    updateSubjectSyllabus(selectedWorkshopDetail.id, updatedTopics);
    showToast(`✅ Nuevo bloque "${newTopicForm.title}" agregado al temario.`);
    setShowAddTopicModal(false);
    setNewTopicForm({
      block: `Bloque ${updatedTopics.length + 1}`,
      title: '',
      weeks: '4 Semanas',
      description: '',
      deliverable: ''
    });

    const updated = subjectsList.find(s => s.id === selectedWorkshopDetail.id);
    if (updated) setSelectedWorkshopDetail(updated);
  };

  // Manejo de Creación de Materia Básica
  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectForm.name) return;

    const targetSchoolId = effectiveSchoolId === 'sch-jjrosseau' ? 'sch-jjr' : (effectiveSchoolId || 'sch-jjrosseau');

    createSubject({
      school_id: targetSchoolId,
      level_grade_id: newSubjectForm.level_grade_id,
      name: newSubjectForm.name,
      sep_code: newSubjectForm.sep_code || `CURR-${newSubjectForm.name.substring(0, 3).toUpperCase()}`,
      category: newSubjectForm.category,
      is_elective: newSubjectForm.is_elective
    });

    showToast(`✅ Materia ${newSubjectForm.name} agregada.`);
    setShowAddSubjectModal(false);
  };

  // Parseo de Texto / Pegado de Excel para Carga Masiva
  const parseBulkText = (text: string) => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    const parsed: Array<Partial<DetailedStudent>> = [];

    lines.forEach(line => {
      const parts = line.split(/[,\t;|]/).map(p => p.trim());
      if (parts.length >= 2) {
        const firstName = parts[0] || 'Alumno';
        const lastName1 = parts[1] || 'Apellido';
        const lastName2 = parts[2] && !['primaria', 'secundaria', 'jardines', 'torres', '1º', '2º', '3º', '4º', '5º', '6º'].some(k => parts[2].toLowerCase().includes(k)) 
          ? parts[2] 
          : '';
        
        let campus = 'Primaria Jardines';
        if (line.toLowerCase().includes('torres') && line.toLowerCase().includes('secundaria')) {
          campus = 'Secundaria Torres';
        } else if (line.toLowerCase().includes('torres')) {
          campus = 'Primaria Torres';
        }

        let level: 'primaria' | 'secundaria' = campus.includes('Secundaria') ? 'secundaria' : 'primaria';
        let grade = '1º';
        const gradeMatch = line.match(/([1-6])º?/);
        if (gradeMatch) {
          grade = `${gradeMatch[1]}º`;
        }

        parsed.push({
          first_name: firstName,
          last_name_1: lastName1,
          last_name_2: lastName2,
          campus_name: campus,
          level,
          grade
        });
      }
    });

    setBulkPreviewList(parsed);
  };

  // Manejo de archivo Excel / CSV
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingBulk(true);
    try {
      if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const text = await file.text();
        setBulkTextInput(text);
        parseBulkText(text);
      } else {
        try {
          const XLSX = await import('xlsx');
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const csvText = XLSX.utils.sheet_to_csv(firstSheet);
          setBulkTextInput(csvText);
          parseBulkText(csvText);
        } catch {
          const text = await file.text();
          setBulkTextInput(text);
          parseBulkText(text);
        }
      }
      showToast(`Archivo "${file.name}" cargado exitosamente.`);
    } catch {
      alert('Error al leer el archivo.');
    } finally {
      setIsParsingBulk(false);
    }
  };

  // Confirmar Carga Masiva
  const handleExecuteBulkUpload = () => {
    if (bulkPreviewList.length === 0) {
      alert('No hay alumnos para procesar. Por favor pega una lista o sube un archivo.');
      return;
    }

    const created = bulkRegisterStudents(bulkPreviewList);
    setBulkGeneratedResults(created);
    showToast(`🎉 ¡${created.length} alumnos registrados con contraseñas generadas!`);
  };

  // Exportar Sábana de Credenciales a CSV
  const exportCredentialsCSV = () => {
    const studentsToExport = bulkGeneratedResults || detailedStudents;
    const headers = 'ID,Nombre,Primer Apellido,Segundo Apellido,Plantel,Grado,Grupo,Correo Institucional,Contraseña de Acceso (6 Digitos),Estado\n';
    const rows = studentsToExport.map(s => 
      `"${s.id}","${s.first_name}","${s.last_name_1}","${s.last_name_2 || ''}","${s.campus_name || ''}","${s.grade}","${s.group_id || ''}","${s.email || ''}","${s.temporary_password || ''}","${s.is_blocked ? 'BLOQUEADO' : 'ACTIVO'}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `credenciales_up_juan_jacobo_rosseau_${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    showToast('Descargando archivo CSV de credenciales...');
  };

  // Cambio directo de contraseña
  const handleDirectPasswordChange = (newPass?: string) => {
    const updatedPass = changeUserPassword(showPasswordModal.userId, showPasswordModal.role, newPass);
    showToast(`🔑 Contraseña actualizada para ${showPasswordModal.userName}: ${updatedPass}`);
    setShowPasswordModal(prev => ({ ...prev, currentPassword: updatedPass }));
  };

  // Icon Helper for Workshop Card
  const getWorkshopIcon = (sub: Subject) => {
    if (sub.workshop_category === 'deportivo') return Dumbbell;
    if (sub.workshop_category === 'tecnologico') return Bot;
    if (sub.workshop_category === 'artistico') return Palette;
    if (sub.workshop_category === 'cientifico') return Brain;
    if (sub.workshop_category === 'academico') return Globe2;

    const name = sub.name.toLowerCase();
    if (name.includes('física') || name.includes('actividad')) return Activity;
    if (name.includes('basquetbol') || name.includes('deporte')) return Dumbbell;
    if (name.includes('música')) return Music;
    if (name.includes('robótica')) return Bot;
    if (name.includes('danza')) return Sparkles;
    return Sparkles;
  };

  // Grupos disponibles para un taller
  const availableGroupsForWorkshop = useMemo(() => {
    if (!selectedWorkshopDetail) return groupsList;
    if (selectedWorkshopDetail.campus_name && selectedWorkshopDetail.campus_name !== 'Todos los Planteles') {
      return groupsList.filter(g => g.campus_name === selectedWorkshopDetail.campus_name);
    }
    return groupsList;
  }, [groupsList, selectedWorkshopDetail]);

  // Alumnos del grupo seleccionado en el taller
  const studentsInSelectedWorkshopGroup = useMemo(() => {
    if (!selectedGroupForPlan) return [];
    const targetGroup = groupsList.find(g => g.id === selectedGroupForPlan);
    
    return detailedStudents.filter(st => {
      const matchGroup = st.group_id === selectedGroupForPlan || 
        (targetGroup && st.campus_name === targetGroup.campus_name && st.grade === targetGroup.grade);
      
      const matchSearch = workshopStudentSearch === '' || 
        `${st.first_name} ${st.last_name_1}`.toLowerCase().includes(workshopStudentSearch.toLowerCase()) ||
        (st.curp && st.curp.toLowerCase().includes(workshopStudentSearch.toLowerCase()));

      return matchGroup && matchSearch;
    });
  }, [detailedStudents, groupsList, selectedGroupForPlan, workshopStudentSearch]);

  // Planeación anual activa para el grupo seleccionado
  const activeGroupPlan: GroupAnnualPlan | null = useMemo(() => {
    if (!selectedWorkshopDetail) return null;
    const plans = selectedWorkshopDetail.group_annual_plans || {};
    if (plans[selectedGroupForPlan]) {
      return plans[selectedGroupForPlan];
    }
    
    // Default generado
    const targetGrp = groupsList.find(g => g.id === selectedGroupForPlan);
    return {
      group_id: selectedGroupForPlan,
      group_name: targetGrp?.name || 'Grupo A',
      campus_name: targetGrp?.campus_name || 'Primaria Jardines',
      grade: targetGrp?.grade || '4º',
      plan_title: `Planeación Anual de ${selectedWorkshopDetail.name} - ${targetGrp?.grade || '4º'} ${targetGrp?.name || 'A'}`,
      term_1: `Trimestre 1: Diagnóstico inicial, fundamentos de ${selectedWorkshopDetail.name} y dinámicas de integración.`,
      term_2: `Trimestre 2: Desarrollo técnico, proyectos colaborativos y aplicación práctica según programa de estudio.`,
      term_3: `Trimestre 3: Evaluación formativa continua, portafolio de evidencias y exhibición final.`,
      pda_focus: `Desarrollo de habilidades motrices, cognitivas y socioemocionales aplicadas a ${selectedWorkshopDetail.name}.`,
      project_title: `Proyecto Integrador Comunitario: ${selectedWorkshopDetail.name} en Acción`,
      updated_at: new Date().toISOString()
    };
  }, [selectedWorkshopDetail, selectedGroupForPlan, groupsList]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500" />
          <p className="text-xs font-bold text-slate-400">Verificando sesión institucional...</p>
        </div>
      </div>
    );
  }

  const isSuperOrOwner = user && (user.role === 'admin' || user.role === 'superadmin' || user.role === 'owner');

  if (!isSuperOrOwner) {
    const getRedirectInfo = () => {
      switch (user?.role) {
        case 'director':
          return { label: 'Ir a mi Portal de Director', path: '/director' };
        case 'coordinator':
          return { label: 'Ir a mi Portal de Coordinador', path: '/coordinator' };
        case 'billing':
          return { label: 'Ir a mi Portal de Finanzas & Cobranza', path: '/coordinator/billing' };
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
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-white">Acceso Denegado</h2>
          <p className="text-xs text-slate-400">
            Esta consola es exclusiva para la Dirección General y Presidencia (Dueño de Empresa / Super Usuario). No tienes permisos para gestionar la administración central ni nóminas maestras.
          </p>
          <button
            onClick={() => router.push(redirectInfo.path)}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 cursor-pointer transition-all"
          >
            {redirectInfo.label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-indigo-200" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* VISTA ESPECIAL: ESTUDIO EJECUTIVO DE CONTROL ANALÍTICO (VOZ Y TEXTO - 0 TOKENS) */}
      {activeTab === 'analytics' ? (
        <ExecutiveAnalyticsStudio onBack={() => setActiveTab('overview')} />
      ) : activeTab === 'books_compendium' ? (
        <div className="flex-1 flex flex-col min-h-screen bg-slate-50 dark:bg-zinc-950">
          <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-zinc-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('overview')}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4 text-purple-600" /> Volver al Panel
              </button>
              <div>
                <h1 className="text-base font-black text-slate-900 dark:text-white">Bóveda Curricular & Compendios de Información Verificada</h1>
                <p className="text-xs text-slate-500">Unificación de libros digitales escolares • Motor Multi-Colegio Super Usuario</p>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
            <SuperUserCompendiumStudio />
          </main>
        </div>
      ) : (!activeSchoolId && isSuperUser) ? (
        <div className="flex-1 flex flex-col">
          {/* MULTI-SCHOOL GLOBAL HEADER */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-lg font-black tracking-tight text-slate-900">Directorio Institucional de Colegios</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                    🏢 SUPER USUARIO · DIRECTIVOS ISKOOL
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Control consolidado de licencias, planteles educativos y entorno aislado de pruebas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setActiveTab('books_compendium')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 hover:scale-102 transition-all cursor-pointer shrink-0"
              >
                <Brain className="h-4 w-4" /> <span>Compendios & Libros Globales</span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black shadow-lg shadow-cyan-600/30 hover:scale-102 transition-all cursor-pointer shrink-0"
              >
                <Sparkles className="h-4 w-4" /> <span>Estudio Analítico <span className="hidden xs:inline">(Voz & Texto)</span></span>
              </button>

              <button
                onClick={() => setShowAddSchoolModal(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 hover:scale-102 transition-all cursor-pointer shrink-0"
              >
                <Plus className="h-4 w-4" /> <span><span className="hidden sm:inline">Dar de Alta</span> Nuevo Colegio</span>
              </button>

              <Link
                href="/teacher"
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all shrink-0"
              >
                <span>Portal Docente</span> <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {/* MAIN CONTAINER: DIRECTORIO DE COLEGIOS */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 sm:space-y-8">
            
            {/* PANORAMIC HERO BANNER */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-200/80 p-5 sm:p-8 shadow-xs">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-black">
                    <Sparkles className="h-3.5 w-3.5" /> Arquitectura Multi-Tenant & Entornos Aislados
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                    Red Escolar & Ecosistema de Instituciones
                  </h2>
                  <p className="text-xs md:text-sm text-slate-600 leading-relaxed">
                    Selecciona una institución para gestionar su matrícula, aranceles, plantilla docente y materias, o accede al <strong>Laboratorio Pedagógico & Test Cases</strong> para validar en tiempo real los flujos de alumnos y profesores sin comprometer datos reales.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowAddSchoolModal(true)}
                    className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-xl shadow-indigo-600/40 hover:scale-103 transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Agregar Nueva Institución
                  </button>
                  <button
                    onClick={exportCredentialsCSV}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    <Download className="h-4 w-4 text-emerald-600" /> Exportar Credenciales
                  </button>
                </div>
              </div>
            </div>

            {/* GLOBAL KPI METRICS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Colegios Registrados</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <School className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{institutionsList.length}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {institutionsList.filter(i => !i.isTestCase).length} oficiales · {institutionsList.filter(i => i.isTestCase).length} sandbox de pruebas
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Planteles Globales</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{campusesList.length}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Distribuídos en {institutionsList.length} instituciones
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Matrícula Consolidada</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black text-slate-900">{detailedStudents.length}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {detailedStudents.filter(s => !s.is_blocked).length} activos · {teachersList.length} docentes
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Tokens IA en Tiempo Real</span>
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                    <Cpu className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-3xl font-black text-purple-700">{totalAITokens.toLocaleString()}</span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ≈ ${(totalAITokens * 0.000015).toFixed(2)} MXN
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Monitoreo acumulativo continuo global
                  </p>
                </div>
              </div>
            </div>

            {/* SECCIÓN DE TARJETAS DE INSTITUCIONES */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-600" /> Directorio de Instituciones Educativas
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {institutionsList.length} Instituciones Registradas
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {institutionsList.map((inst) => {
                  const isTest = inst.isTestCase;
                  const instCampuses = getSchoolCampuses(campusesList, inst.id);
                  const instStudents = getSchoolStudents(detailedStudents, inst.id, instCampuses);
                  const instTeachers = getSchoolTeachers(teachersList, inst.id, instCampuses);
                  const instStudentsCount = instStudents.length;
                  const instTeachersCount = instTeachers.length;
                  const instCampusesCount = instCampuses.length;
                  const instTokens = inst.aiTokensConsumed || (isTest ? 48200 : (inst.id === 'sch-jjrosseau' ? 345350 : 0));

                  return (
                    <div
                      key={inst.id}
                      className={`rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs relative group ${
                        isTest
                          ? 'bg-gradient-to-b from-purple-50/40 via-white to-white border-purple-200 hover:border-purple-400 hover:shadow-md'
                          : 'bg-white border-slate-200 hover:border-indigo-400 hover:shadow-md'
                      }`}
                    >
                      {/* Top Header Card */}
                      <div className="p-6 space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          {/* Logo del Colegio con opción de cambio */}
                          <div className="relative group/logo shrink-0">
                            {inst.logoUrl ? (
                              <img
                                src={inst.logoUrl}
                                alt={inst.name}
                                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-sm"
                              />
                            ) : (
                              <div className={`h-16 w-16 rounded-2xl flex items-center justify-center shadow-sm ${
                                isTest 
                                  ? 'bg-gradient-to-br from-purple-600 to-amber-500 text-white'
                                  : 'bg-gradient-to-br from-indigo-600 to-blue-500 text-white'
                              }`}>
                                {isTest ? <Bot className="h-8 w-8" /> : <Building2 className="h-8 w-8" />}
                              </div>
                            )}

                            {/* Botón flotante para subir/cambiar logo */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingSchoolLogoId(inst.id);
                                schoolLogoFileInputRef.current?.click();
                              }}
                              title="Subir o Cambiar Logotipo Escolar"
                              className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm cursor-pointer transition-transform hover:scale-110"
                            >
                              <ImageIcon className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="flex flex-col items-end gap-1">
                            {isTest ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
                                🧪 Sandbox / Test Case
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">
                                ● Oficial Activo
                              </span>
                            )}
                            <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                              CCT: {inst.cct}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                            {inst.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                            {inst.tagline || 'Institución de formación integral y excelencia académica.'}
                          </p>
                        </div>

                        {/* Indicadores clave */}
                        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-center">
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-black text-slate-900 block">{instCampusesCount}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Planteles</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-black text-blue-600 block">{instStudentsCount}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Alumnos</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-black text-emerald-600 block">{instTeachersCount}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Docentes</span>
                          </div>
                          <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                            <span className="text-xs font-black text-purple-600 block">{(instTokens / 1000).toFixed(0)}k</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase">Tokens IA</span>
                          </div>
                        </div>

                        {/* Datos de contacto / ubicación */}
                        <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                          {inst.address && (
                            <div className="flex items-center gap-1.5 truncate">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{inst.address}</span>
                            </div>
                          )}
                          {inst.coordinatorName && (
                            <div className="flex items-center gap-1.5 truncate">
                              <Users className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{inst.coordinatorName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botones de Acción de la Tarjeta */}
                      <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                        <button
                          onClick={() => selectSchool(inst.id)}
                          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all cursor-pointer ${
                            isTest
                              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/20'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                          }`}
                        >
                          {isTest ? '🧪 Entrar a Sandbox / Pruebas' : 'Entrar al Panel Institucional'} <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* TARJETA DE ALTA RÁPIDA (+) */}
                <div
                  onClick={() => setShowAddSchoolModal(true)}
                  className="rounded-3xl border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-white hover:bg-indigo-50/20 p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-300 group min-h-[340px]"
                >
                  <div className="h-16 w-16 rounded-3xl bg-indigo-50 group-hover:bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                    <Plus className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-black text-slate-900 group-hover:text-indigo-600 transition-colors">
                      Dar de Alta Nuevo Colegio
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs">
                      Crea una nueva institución con planteles, grupos, aranceles y aislamiento de datos completo.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    + Configurar Nueva Escuela
                  </span>
                </div>
              </div>
            </div>

          </main>
        </div>
      ) : (
        /* VISTA 2: DASHBOARD DE LA INSTITUCIÓN SELECCIONADA */
        <div className="flex-1 flex flex-col">
          {/* SUPER USER HEADER DENTRO DEL COLEGIO */}
          <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-4">
              {/* Botón Volver al Directorio: Exclusivo Super Usuario ISkool */}
              {isSuperUser && (
                <button
                  onClick={() => selectSchool(null)}
                  className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 border border-slate-200 transition-all cursor-pointer hover:scale-102 shrink-0"
                >
                  <ChevronLeft className="h-4 w-4 text-indigo-600" /> <span className="hidden sm:inline">Directorio de Colegios</span>
                </button>
              )}

              <div className="flex items-center gap-3">
                {/* Logo Escolar */}
                <div className="relative group/headlogo shrink-0">
                  {currentSchool?.logoUrl ? (
                    <img
                      src={currentSchool.logoUrl}
                      alt={currentSchool.name}
                      className="h-11 w-11 rounded-2xl object-cover border border-slate-200 shadow-sm"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md text-white">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      if (currentSchool) {
                        setEditingSchoolLogoId(currentSchool.id);
                        schoolLogoFileInputRef.current?.click();
                      }
                    }}
                    title="Cambiar Logotipo del Colegio"
                    className="absolute -bottom-1 -right-1 p-1 rounded-lg bg-white text-slate-600 hover:text-slate-900 border border-slate-200 shadow-sm cursor-pointer"
                  >
                    <ImageIcon className="h-3 w-3" />
                  </button>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-lg font-black tracking-tight text-slate-900">
                      {currentSchool?.name || schoolSettings.name}
                    </h1>
                    {isSuperUser ? (
                      currentSchool?.isTestCase ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                          🧪 TEST CASE / SANDBOX
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
                          SUPER USUARIO · DIRECTIVO ISKOOL
                        </span>
                      )
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                        PRESIDENCIA INSTITUCIONAL · COLEGIO AUTÓNOMO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3 mt-0.5">
                    <span>CCT: <strong className="text-slate-800">{currentSchool?.cct || schoolSettings.cct}</strong></span>
                    <span>·</span>
                    <span>{schoolCampuses.length} Planteles Oficiales</span>
                    <span>·</span>
                    <span>{schoolStudents.length} Alumnos</span>
                    <span>·</span>
                    <span>{schoolTeachers.length} Profesores</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Selector Rápido de Colegio (SOLO SUPER USUARIOS) o Badge Institucional Aislado (DUEÑO) */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {isSuperUser ? (
                <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl text-xs shrink-0">
                  <span className="text-slate-500 font-bold">Colegio:</span>
                  <select
                    value={activeSchoolId || ''}
                    onChange={(e) => selectSchool(e.target.value === 'none' ? null : e.target.value)}
                    className="bg-transparent text-slate-900 font-black outline-none cursor-pointer"
                  >
                    {institutionsList.map(i => (
                      <option key={i.id} value={i.id} className="bg-white text-slate-900">
                        {i.name} {i.isTestCase ? '(Sandbox)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-slate-100 border border-emerald-200 px-3.5 py-1.5 rounded-xl text-xs shrink-0">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span className="text-slate-500 font-bold">Institución:</span>
                  <span className="text-slate-900 font-black">{currentSchool?.name || schoolSettings.name}</span>
                </div>
              )}

              <button
                onClick={exportCredentialsCSV}
                className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 transition-all hover:scale-102 cursor-pointer shadow-xs shrink-0"
              >
                <Download className="h-4 w-4 text-emerald-600" />
                <span><span className="hidden xs:inline">Descargar</span> Credenciales (CSV)</span>
              </button>

              <Link
                href="/teacher"
                className="flex items-center gap-1 px-3 sm:px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 shrink-0"
              >
                <span><span className="hidden xs:inline">Ir a</span> Portal Académico</span> <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </header>

          {/* NAVIGATION TABS STRIP */}
          <nav className="bg-white border-b border-slate-200 px-4 sm:px-6 py-2 flex items-center justify-between gap-3 sm:gap-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BarChart3 className="h-4 w-4" /> Panel General
              </button>

              <button
                onClick={() => setActiveTab('staff')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'staff'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="h-4 w-4 text-purple-600" /> Personal & Roles ({schoolStaff.length})
              </button>

              <button
                onClick={() => setActiveTab('campuses')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'campuses'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Building2 className="h-4 w-4" /> Planteles & Grupos
              </button>

              <button
                onClick={() => setActiveTab('teachers')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'teachers'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Users className="h-4 w-4" /> {isSuperUser ? `Profesores & Tokens IA (${schoolTeachers.length})` : `Plantilla Docente (${schoolTeachers.length})`}
              </button>

              <button
                onClick={() => setActiveTab('students')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'students'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Alumnos & Carga Rápida ({schoolStudents.length})
              </button>

              <button
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'subjects'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <BookOpen className="h-4 w-4" /> Materias & Talleres ({schoolSubjects.length})
              </button>

              <button
                onClick={() => setActiveTab('config')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'config'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Institución & Seguridad
              </button>

              <button
                onClick={() => setActiveTab('payroll')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'payroll'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <DollarSign className="h-4 w-4 text-emerald-600" /> Finanzas & Nóminas ({schoolPayroll.length})
              </button>

              <button
                onClick={() => setActiveTab('deletions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'deletions'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Trash2 className="h-4 w-4 text-rose-500" /> Registro de Bajas ({schoolDeletionLogs.length})
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 border border-indigo-200"
              >
                <Sparkles className="h-4 w-4 text-indigo-600 animate-pulse" /> Consultas & Reportes Inteligentes
              </button>

              <button
                onClick={() => setActiveTab('books_compendium')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-purple-700 hover:text-purple-900 hover:bg-purple-50 border border-purple-200"
              >
                <Brain className="h-4 w-4 text-purple-600" /> Bóveda & Compendios
              </button>
            </div>

            {/* Global Campus Selector Pill */}
            <div className="flex items-center gap-2 shrink-0 text-xs">
              <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider">Plantel:</span>
              <select
                value={selectedCampus}
                onChange={(e) => setSelectedCampus(e.target.value)}
                className="bg-slate-100 border border-slate-200 text-slate-800 px-3 py-1.5 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="all">🏢 Todos los Planteles</option>
                {schoolCampuses.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </nav>

          {/* MAIN CONTENT CONTAINER */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">

        {/* TAB 1: OVERVIEW / DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Banner de Acceso Directo al Estudio Ejecutivo de Información (Voz & Texto) */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-50/80 via-white to-indigo-50/80 border border-cyan-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-xl bg-cyan-100 border border-cyan-200 flex items-center justify-center text-cyan-700 shrink-0">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">Estudio Ejecutivo de Consultas y Reportes (Voz & Texto)</h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold font-mono">Motor Inteligente Local</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Controla todo tu colegio pidiendo por voz o texto: adeudos, finanzas, comparativas mes a mes, asistencias y fichas 360° de alumnos.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('analytics')}
                className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-2 transition cursor-pointer shrink-0 self-start md:self-auto"
              >
                <span>Abrir Estudio Analítico</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Top KPI Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Alumnos Matriculados</span>
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <GraduationCap className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{schoolStudents.length}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {schoolStudents.filter(s => !s.is_blocked && s.status === 'activo').length} activos · {schoolStudents.filter(s => s.is_blocked).length} bloqueados
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Plantilla Docente</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{schoolTeachers.length}</span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {schoolTeachers.filter(t => !t.is_blocked).length} profesores activos
                  </p>
                </div>
              </div>

              {isSuperUser ? (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Consumo de Tokens IA (Super Usuario)</span>
                    <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                      <Cpu className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-purple-700">
                        {((currentSchool?.aiTokensConsumed || (currentSchool?.isTestCase ? 48200 : (currentSchool?.id === 'sch-jjrosseau' ? 345350 : 0)))).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        ≈ ${(((currentSchool?.aiTokensConsumed || (currentSchool?.isTestCase ? 48200 : (currentSchool?.id === 'sch-jjrosseau' ? 345350 : 0)))) * 0.000015).toFixed(2)} MXN
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Equiv. comercial: <strong className="text-slate-800">${(((currentSchool?.aiTokensConsumed || (currentSchool?.isTestCase ? 48200 : (currentSchool?.id === 'sch-jjrosseau' ? 345350 : 0)))) * 0.000015).toFixed(2)} MXN</strong> ($0.80 USD/1M tokens)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-emerald-400 transition-all">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-bold uppercase tracking-wider">Cobranza de Colegiaturas</span>
                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-emerald-700">
                        ${payrollMetrics.totalTuitionIncome.toLocaleString()} <span className="text-xs font-bold text-slate-500">MXN</span>
                      </span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {payrollMetrics.totalTuitionIncome + payrollMetrics.pendingTuitionIncome > 0
                          ? Math.round((payrollMetrics.totalTuitionIncome / (payrollMetrics.totalTuitionIncome + payrollMetrics.pendingTuitionIncome)) * 100)
                          : 100}% Al Corriente
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Pendiente por recaudar: <strong className="text-amber-700">${payrollMetrics.pendingTuitionIncome.toLocaleString()} MXN</strong>
                    </p>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-indigo-400 transition-all">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Planteles Activos</span>
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <Building2 className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-slate-900">{schoolCampuses.length}</span>
                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    {schoolCampuses.map(c => c.name).join(' · ') || 'Planteles Institucionales'}
                  </p>
                </div>
              </div>
            </div>

            {/* Executive Financial & Payroll Balance Banner (Dueño de Empresa) */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-50/70 via-white to-slate-50 border border-emerald-200 shadow-xs relative overflow-hidden">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                      <Landmark className="h-3 w-3" /> Balance Operativo Institucional
                    </span>
                    <span className="text-xs text-slate-500">· Periodo Quincenal Vigente</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    Finanzas & Nómina del Personal Escolar
                  </h3>
                  <p className="text-xs text-slate-600 max-w-2xl">
                    Supervisión corporativa de recaudación por colegiaturas versus costos de nómina para directivos, coordinadores, docentes y cobranza.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setActiveTab('payroll')}
                    className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 hover:scale-102 transition-all cursor-pointer"
                  >
                    <DollarSign className="h-4 w-4" /> Ver Nómina Detallada ({schoolPayroll.length}) <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Financial Balance Summary Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-200">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" /> Ingresos por Colegiaturas
                  </span>
                  <div className="text-xl font-black text-blue-700 font-mono">
                    ${payrollMetrics.totalTuitionIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Por cobrar: ${payrollMetrics.pendingTuitionIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5 text-rose-600" /> Egresos por Nómina
                  </span>
                  <div className="text-xl font-black text-rose-700 font-mono">
                    ${payrollMetrics.totalPayroll.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Dispersado: ${payrollMetrics.paidPayroll.toLocaleString('es-MX', { minimumFractionDigits: 2 })} · {payrollMetrics.totalEmployees} colaboradores
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-600" /> Margen Operativo Neto
                  </span>
                  <div className={`text-xl font-black font-mono ${payrollMetrics.netOperatingMargin >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    ${payrollMetrics.netOperatingMargin.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-emerald-700 block font-semibold">
                    {payrollMetrics.netOperatingMargin >= 0 ? '✓ Superávit operativo saludable' : '⚠ Atención contable requerida'}
                  </span>
                </div>
              </div>
            </div>

            {/* Campus Breakdown Cards */}
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Planteles de la Unidad Pedagógica</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {schoolCampuses.map(campus => {
                  const campusStudents = schoolStudents.filter(s => s.campus_id === campus.id || s.campus_name?.toLowerCase() === campus.name.toLowerCase());
                  const campusTeachers = schoolTeachers.filter(t => t.campus_id === campus.id || t.campus_name?.toLowerCase() === campus.name.toLowerCase() || t.campus_name === 'Todos los Planteles');
                  const campusGroups = schoolGroups.filter(g => g.campus_id === campus.id || g.campus_name?.toLowerCase() === campus.name.toLowerCase());

                  return (
                    <div 
                      key={campus.id} 
                      className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col justify-between gap-4 shadow-xs hover:border-indigo-400 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                            Nivel {campus.level.toUpperCase()}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">{campus.grades.length} Grados</span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-2.5">{campus.name}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 shrink-0 text-slate-400" /> {campus.address}
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Alumnos</span>
                          <strong className="text-sm font-black text-slate-900">{campusStudents.length}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Docentes</span>
                          <strong className="text-sm font-black text-slate-900">{campusTeachers.length}</strong>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 uppercase font-bold block">Grupos</span>
                          <strong className="text-sm font-black text-slate-900">{campusGroups.length}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
              <div>
                <h4 className="text-sm font-bold text-slate-900">¿Deseas dar de alta nuevos alumnos para este ciclo?</h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Puedes registrar alumnos de forma individual o usar la herramienta de carga rápida mediante archivo Excel.
                </p>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-xs"
                >
                  <Plus className="h-4 w-4" /> Alta Individual
                </button>
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-102"
                >
                  <UploadCloud className="h-4 w-4" /> Carga Rápida (Excel / Lista)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: TEACHERS & AI TOKENS */}
        {activeTab === 'teachers' && (
          <div className="space-y-4">
            {/* Action & Filter Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 w-full sm:w-auto flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    placeholder="Buscar profesor por nombre o correo..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setShowAddTeacherModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer hover:scale-102"
                >
                  <Plus className="h-4 w-4" /> Registrar Profesor
                </button>
              </div>
            </div>

            {/* Teachers Table */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Profesor</th>
                      <th className="p-4">Plantel Asignado</th>
                      <th className="p-4">Materias & Grupos</th>
                      <th className="p-4 text-center">{isSuperUser ? 'Tokens IA Usados' : 'Planeaciones Curriculares'}</th>
                      <th className="p-4 text-center">Contraseña Acceso</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-right">{isSuperUser ? 'Acciones de Super Usuario' : 'Acciones de Control'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredTeachers.map(teacher => {
                      const isBlocked = teacher.is_blocked || false;
                      const tokens = teacher.ai_tokens_consumed || 0;

                      return (
                        <tr key={teacher.id} className={`hover:bg-white/5 transition-colors ${isBlocked ? 'bg-red-950/10 opacity-70' : ''}`}>
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">{teacher.first_name} {teacher.last_name}</div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-500" /> {teacher.email}
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-300">
                            {teacher.campus_name || 'Sin Plantel'}
                          </td>
                          <td className="p-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {(teacher.assigned_subjects || ['Matemáticas']).map((sub, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-semibold text-slate-300 border border-white/5">
                                  {sub}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-center font-mono">
                            {isSuperUser ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  {tokens.toLocaleString()} tokens
                                </span>
                                <span className="text-[10px] text-emerald-400 font-semibold">
                                  ≈ ${(tokens * 0.000015).toFixed(2)} MXN
                                </span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-0.5">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                                  {Math.max(1, Math.round((tokens || 15000) / 15000))} Plan(es)
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  Bóveda Curricular SEP
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-center font-mono">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs font-bold text-amber-400">
                              <span>{teacher.temporary_password || 'Isr9X2'}</span>
                              <button
                                onClick={() => copyToClipboard(teacher.temporary_password || 'Isr9X2', teacher.id)}
                                title="Copiar contraseña"
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {copiedId === teacher.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {isBlocked ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                                Bloqueado
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botón Cambiar Contraseña */}
                              <button
                                onClick={() => setShowPasswordModal({
                                  isOpen: true,
                                  userId: teacher.id,
                                  userName: `${teacher.first_name} ${teacher.last_name}`,
                                  role: 'teacher',
                                  currentPassword: teacher.temporary_password || 'Isr9X2'
                                })}
                                title="Cambiar Contraseña Directa"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 transition-all cursor-pointer"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>

                              {/* Botón Bloqueo Inmediato */}
                              <button
                                onClick={() => {
                                  toggleUserBlock(teacher.id, 'teacher', !isBlocked);
                                  showToast(isBlocked ? `Profesor ${teacher.first_name} desbloqueado.` : `Profesor ${teacher.first_name} bloqueado.`);
                                }}
                                title={isBlocked ? "Desbloquear Cuenta" : "Bloquear / Cancelar Cuenta"}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  isBlocked 
                                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30' 
                                    : 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30'
                                }`}
                              >
                                {isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
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

        {/* TAB 3: STUDENTS & BULK UPLOAD */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-white/10">
              <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Buscar por nombre, CURP o correo..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <select
                  value={studentGradeFilter}
                  onChange={(e) => setStudentGradeFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                >
                  <option value="all">Grado: Todos</option>
                  <option value="1º">1º de Primaria</option>
                  <option value="2º">2º de Primaria</option>
                  <option value="3º">3º de Primaria</option>
                  <option value="4º">4º de Primaria</option>
                  <option value="5º">5º de Primaria</option>
                  <option value="6º">6º de Primaria</option>
                  <option value="1º Sec">1º de Secundaria</option>
                  <option value="2º Sec">2º de Secundaria</option>
                  <option value="3º Sec">3º de Secundaria</option>
                </select>

                <select
                  value={studentStatusFilter}
                  onChange={(e) => setStudentStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 text-slate-300 px-3 py-2 rounded-xl text-xs font-bold outline-none focus:border-indigo-500"
                >
                  <option value="all">Estado: Todos</option>
                  <option value="active">Activos</option>
                  <option value="blocked">Bloqueados</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddStudentModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Alta Individual
                </button>
                <button
                  onClick={() => setShowBulkUploadModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition-all cursor-pointer hover:scale-102"
                >
                  <UploadCloud className="h-4 w-4" /> Carga Rápida (Excel)
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Estudiante</th>
                      <th className="p-4">CURP / Matrícula</th>
                      <th className="p-4">Plantel</th>
                      <th className="p-4">Grado & Grupo</th>
                      <th className="p-4 text-center">Contraseña (6 Dígitos)</th>
                      <th className="p-4 text-center">Estado</th>
                      <th className="p-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredStudents.map((student, idx) => {
                      const isBlocked = student.is_blocked || student.status === 'suspendido';
                      const tempPass = student.temporary_password || 'San7K4';

                      return (
                        <tr key={`${student.id}-${student.curp || idx}`} className={`hover:bg-white/5 transition-colors ${isBlocked ? 'bg-red-950/10 opacity-70' : ''}`}>
                          <td className="p-4">
                            <div className="font-bold text-white text-sm">
                              {student.first_name} {student.second_name || ''} {student.last_name_1} {student.last_name_2 || ''}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-500" /> {student.email}
                            </div>
                            {student.scholarship_percentage && student.scholarship_percentage > 0 ? (
                              <div className="mt-1">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-md border border-purple-500/30">
                                  <span>Beca {student.scholarship_percentage}% ({student.scholarship_type || 'Académica'})</span>
                                </span>
                              </div>
                            ) : null}
                          </td>
                          <td className="p-4 font-mono text-slate-300">
                            <div>{student.curp || 'SIN-CURP'}</div>
                            <div className="text-[10px] text-slate-500">{student.enrollment_id || student.id}</div>
                          </td>
                          <td className="p-4 font-semibold text-slate-300">
                            {student.campus_name || 'Primaria Jardines'}
                          </td>
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-white">
                              {student.grade} - {student.group_id?.toUpperCase() || '1ºA'}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950 border border-white/10 text-xs font-bold text-amber-400">
                              <span>{tempPass}</span>
                              <button
                                onClick={() => copyToClipboard(tempPass, student.id)}
                                title="Copiar contraseña"
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {copiedId === student.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            {isBlocked ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                                Bloqueado
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                Activo
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Botón Cambiar Contraseña */}
                              <button
                                onClick={() => setShowPasswordModal({
                                  isOpen: true,
                                  userId: student.id,
                                  userName: `${student.first_name} ${student.last_name_1}`,
                                  role: 'student',
                                  currentPassword: tempPass
                                })}
                                title="Cambiar Contraseña Directa"
                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 transition-all cursor-pointer"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>

                              {/* Botón Bloqueo Inmediato */}
                              <button
                                onClick={() => {
                                  toggleUserBlock(student.id, 'student', !isBlocked);
                                  showToast(isBlocked ? `Alumno ${student.first_name} desbloqueado.` : `Alumno ${student.first_name} bloqueado.`);
                                }}
                                title={isBlocked ? "Desbloquear Cuenta" : "Bloquear / Cancelar Cuenta"}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  isBlocked 
                                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30' 
                                    : 'bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30'
                                }`}
                              >
                                {isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                              </button>

                              {/* Botón Eliminar Alumno (Acción Directiva / Super Usuario) */}
                              <button
                                onClick={() => setStudentToDeleteAdmin(student)}
                                title="Dar de Baja Definitiva / Retirar de Sistema (Con Auditoría)"
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-all cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
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

        {/* TAB PERSONAL & ROLES ADMINISTRATIVOS (DIRECTOR, COORDINADOR, COBRANZA) */}
        {activeTab === 'staff' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header del Tab */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-xl">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight">
                    Cuentas de Personal Administrativo & Gobernanza
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Registro oficial de directores de colegio, coordinadores académicos y encargados de cobranza. Asigna credenciales de acceso institucional, define colegios y gestiona el estado de cada cuenta.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setNewStaffForm({
                      first_name: '',
                      last_name: '',
                      role: 'director',
                      school_id: effectiveSchoolId || institutionsList[0]?.id || 'sch-jjrosseau',
                      campus_name: 'Dirección General de Plantel',
                      email: '',
                      phone: '55-4160-8800',
                      temporary_password: generateRandomPassword(6)
                    });
                    setShowAddStaffModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-102"
                >
                  <Plus className="h-4 w-4" /> Registrar Personal Administrativo
                </button>
              </div>
            </div>

            {/* KPI Counter Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Personal</span>
                  <span className="text-2xl font-black text-white">{schoolStaff.length}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 text-slate-300">
                  <Users className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-purple-500/20 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">Directores de Plantel</span>
                  <span className="text-2xl font-black text-purple-300">
                    {schoolStaff.filter(s => s.role === 'director').length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                  <Crown className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/20 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400 block">Coordinadores</span>
                  <span className="text-2xl font-black text-blue-300">
                    {schoolStaff.filter(s => s.role === 'coordinator').length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/80 border border-emerald-500/20 shadow-md flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 block">Cobranza & Finanzas</span>
                  <span className="text-2xl font-black text-emerald-300">
                    {schoolStaff.filter(s => s.role === 'billing').length}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* PANEL DE GOBERNANZA CORPORATIVA: LÍMITES PARA DIRECTORES DE PLANTEL */}
            {(() => {
              const currentDirectorLimits = getDirectorLimits(directorLimits, selectedLimitsSchoolId);
              return (
                <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/20 shadow-xl space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5 text-purple-400" />
                        <h4 className="text-sm font-black text-white uppercase tracking-wider">
                          Gobernanza Corporativa: Límites para Directores de Plantel
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          Mando Supremo
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Como Dueño de Empresa, defines qué facultades directivas están habilitadas o restringidas para los Directores en cada colegio.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-300">Colegio a Regular:</span>
                      <select
                        value={selectedLimitsSchoolId}
                        onChange={(e) => setSelectedLimitsSchoolId(e.target.value)}
                        className="bg-slate-950 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        {institutionsList.map(inst => (
                          <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                            {inst.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Switch 1: Crear/Eliminar Planteles */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">Crear / Suprimir Planteles</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {currentDirectorLimits.canManageCampuses ? 'Habilitado para Dirección' : 'Exclusivo del Dueño'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateDirectorLimits(selectedLimitsSchoolId, {
                            canManageCampuses: !currentDirectorLimits.canManageCampuses
                          });
                          showToast(`Límites actualizados para ${selectedLimitsSchoolId}`);
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          currentDirectorLimits.canManageCampuses ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          currentDirectorLimits.canManageCampuses ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {/* Switch 2: Modificar Aranceles */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">Modificar Aranceles</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {currentDirectorLimits.canModifyTuitionFees ? 'Autorizado al Director' : 'Fijado por Presidencia'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateDirectorLimits(selectedLimitsSchoolId, {
                            canModifyTuitionFees: !currentDirectorLimits.canModifyTuitionFees
                          });
                          showToast(`Límites actualizados para ${selectedLimitsSchoolId}`);
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          currentDirectorLimits.canModifyTuitionFees ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          currentDirectorLimits.canModifyTuitionFees ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {/* Switch 3: Alta de Coordinadores */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">Alta de Coordinadores</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {currentDirectorLimits.canRegisterCoordinators ? 'Director puede registrar' : 'Solo Dueño de Empresa'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          updateDirectorLimits(selectedLimitsSchoolId, {
                            canRegisterCoordinators: !currentDirectorLimits.canRegisterCoordinators
                          });
                          showToast(`Límites actualizados para ${selectedLimitsSchoolId}`);
                        }}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          currentDirectorLimits.canRegisterCoordinators ? 'bg-purple-600' : 'bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                          currentDirectorLimits.canRegisterCoordinators ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    {/* Selector 4: Tope de Beca Directa */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-xs font-bold text-white block">Tope Beca Directiva</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Máx. beca sin autorización
                        </span>
                      </div>
                      <select
                        value={currentDirectorLimits.maxScholarshipDiscountPercent}
                        onChange={(e) => {
                          updateDirectorLimits(selectedLimitsSchoolId, {
                            maxScholarshipDiscountPercent: Number(e.target.value)
                          });
                          showToast(`Tope de beca directiva fijado en ${e.target.value}%`);
                        }}
                        className="bg-slate-900 border border-white/10 rounded-xl px-2.5 py-1 text-xs font-black text-amber-300 focus:outline-none focus:border-purple-500 cursor-pointer"
                      >
                        <option value={20}>20% Máx</option>
                        <option value={30}>30% Máx</option>
                        <option value={50}>50% Máx</option>
                        <option value={75}>75% Máx</option>
                        <option value={100}>100% Total</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Barra de Filtros & Búsqueda */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setStaffRoleFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    staffRoleFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Todos ({schoolStaff.length})
                </button>
                <button
                  onClick={() => setStaffRoleFilter('director')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    staffRoleFilter === 'director'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Crown className="h-3.5 w-3.5" /> Directores ({schoolStaff.filter(s => s.role === 'director').length})
                </button>
                <button
                  onClick={() => setStaffRoleFilter('coordinator')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    staffRoleFilter === 'coordinator'
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <BookOpen className="h-3.5 w-3.5" /> Coordinadores ({schoolStaff.filter(s => s.role === 'coordinator').length})
                </button>
                <button
                  onClick={() => setStaffRoleFilter('billing')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    staffRoleFilter === 'billing'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <DollarSign className="h-3.5 w-3.5" /> Cobranza ({schoolStaff.filter(s => s.role === 'billing').length})
                </button>
              </div>

              <div className="relative flex-1 min-w-[240px] max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, correo, campus o rol..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Listado / Tabla de Cuentas */}
            <div className="bg-slate-900 rounded-3xl border border-white/10 overflow-hidden shadow-xl">
              {filteredStaffList.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="inline-flex p-4 rounded-2xl bg-white/5 text-slate-400">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold text-white">No se encontraron cuentas de personal</h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    {staffSearchQuery ? 'No hay resultados que coincidan con tu búsqueda actual.' : 'Aún no hay personal registrado con los filtros seleccionados.'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="p-4">Personal / Identidad</th>
                        <th className="p-4">Rol & Nivel</th>
                        <th className="p-4">Colegio & Área</th>
                        <th className="p-4">Contacto Institucional</th>
                        <th className="p-4">Contraseña Temporal</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                      {filteredStaffList.map((staff) => {
                        const assignedSchool = institutionsList.find(i => i.id === staff.school_id);
                        const isDirector = staff.role === 'director';
                        const isBilling = staff.role === 'billing';
                        const isBlocked = !!staff.is_blocked;
                        const tempPass = staff.temporary_password || 'ISkool2026!';

                        return (
                          <tr key={staff.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm text-white shadow-md shrink-0 ${
                                  isDirector 
                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600 shadow-purple-500/25' 
                                    : isBilling 
                                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25'
                                    : 'bg-gradient-to-br from-blue-500 to-cyan-600 shadow-blue-500/25'
                                }`}>
                                  {staff.first_name[0]}{staff.last_name[0]}
                                </div>
                                <div>
                                  <span className="font-bold text-white block text-sm">
                                    {staff.first_name} {staff.last_name}
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-mono">
                                    ID: {staff.id}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              {isDirector ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                  <Crown className="h-3 w-3" /> Director General
                                </span>
                              ) : isBilling ? (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                  <DollarSign className="h-3 w-3" /> Cobranza / Finanzas
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/15 text-blue-300 border border-blue-500/30">
                                  <BookOpen className="h-3 w-3" /> Coordinador Escolar
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="space-y-0.5">
                                <span className="font-bold text-slate-200 block">
                                  {assignedSchool?.name || 'Dirección General / Multi-Colegio'}
                                </span>
                                <span className="text-[11px] text-slate-400 block">
                                  {staff.campus_name || 'Plantel Central'}
                                </span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="space-y-1 text-[11px]">
                                <p className="flex items-center gap-1.5 text-slate-300 font-mono">
                                  <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                  <span>{staff.email}</span>
                                </p>
                                {staff.phone && (
                                  <p className="flex items-center gap-1.5 text-slate-400 font-mono">
                                    <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                                    <span>{staff.phone}</span>
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="inline-flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-white/10">
                                <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                                <span className="font-mono font-bold text-amber-300 text-xs">
                                  {tempPass}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(tempPass);
                                    setCopiedStaffPasswordId(staff.id);
                                    setTimeout(() => setCopiedStaffPasswordId(null), 2000);
                                  }}
                                  title="Copiar contraseña"
                                  className="ml-1 p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                                >
                                  {copiedStaffPasswordId === staff.id ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newP = changeStaffPassword(staff.id);
                                    showToast(`🔑 Nueva contraseña generada para ${staff.first_name}: ${newP}`);
                                  }}
                                  title="Regenerar contraseña aleatoria"
                                  className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-amber-400 transition-colors cursor-pointer"
                                >
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="p-4">
                              {isBlocked ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                                  <Lock className="h-3 w-3" /> Bloqueado
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  <CheckCircle2 className="h-3 w-3" /> Activo
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    toggleStaffBlock(staff.id, !isBlocked);
                                    showToast(isBlocked ? `✅ Cuenta de ${staff.first_name} reactivada.` : `⛔ Cuenta de ${staff.first_name} suspendida.`);
                                  }}
                                  title={isBlocked ? "Reactivar Acceso" : "Suspender Acceso"}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    isBlocked
                                      ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'
                                      : 'bg-amber-600/20 text-amber-400 border-amber-500/30 hover:bg-amber-600/30'
                                  }`}
                                >
                                  {isBlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`¿Estás seguro de dar de baja la cuenta de ${staff.first_name} ${staff.last_name}?`)) {
                                      deleteStaffAccount(staff.id);
                                      showToast(`🗑️ Cuenta de ${staff.first_name} eliminada.`);
                                    }
                                  }}
                                  title="Eliminar Cuenta"
                                  className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 transition-all cursor-pointer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* MODAL: REGISTRAR NUEVA CUENTA ADMINISTRATIVA */}
            {showAddStaffModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
                <div className="relative w-full max-w-xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        <Plus className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="text-base font-black text-white">Alta de Personal Administrativo</h4>
                        <p className="text-xs text-slate-400">Registrar cuenta oficial con credenciales institucionales</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAddStaffModal(false)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateStaff} className="space-y-4">
                    {/* Selector de Rol */}
                    <div>
                      <label className="text-xs font-bold text-slate-300 block mb-1.5">
                        Rol Institucional a Asignar *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => setNewStaffForm(prev => ({ ...prev, role: 'director', campus_name: 'Dirección General de Plantel' }))}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            newStaffForm.role === 'director'
                              ? 'bg-purple-600/30 border-purple-500 text-purple-200 ring-2 ring-purple-500/50'
                              : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <Crown className="h-5 w-5 mx-auto mb-1 text-purple-400" />
                          <span className="text-xs font-bold block">Director</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Gobernanza Total</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewStaffForm(prev => ({ ...prev, role: 'coordinator', campus_name: 'Coordinación Académica' }))}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            newStaffForm.role === 'coordinator'
                              ? 'bg-blue-600/30 border-blue-500 text-blue-200 ring-2 ring-blue-500/50'
                              : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <BookOpen className="h-5 w-5 mx-auto mb-1 text-blue-400" />
                          <span className="text-xs font-bold block">Coordinador</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Control Escolar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setNewStaffForm(prev => ({ ...prev, role: 'billing', campus_name: 'Departamento de Cobranza' }))}
                          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                            newStaffForm.role === 'billing'
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/50'
                              : 'bg-slate-950/60 border-white/10 text-slate-400 hover:bg-white/5'
                          }`}
                        >
                          <DollarSign className="h-5 w-5 mx-auto mb-1 text-emerald-400" />
                          <span className="text-xs font-bold block">Cobranza</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Finanzas y Pagos</span>
                        </button>
                      </div>
                    </div>

                    {/* Colegio e Institución */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Colegio Asignado *
                        </label>
                        {isSuperUser ? (
                          <select
                            value={newStaffForm.school_id}
                            onChange={(e) => setNewStaffForm(prev => ({ ...prev, school_id: e.target.value }))}
                            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                          >
                            {institutionsList.map(inst => (
                              <option key={inst.id} value={inst.id} className="bg-slate-900 text-white">
                                {inst.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="w-full bg-slate-950/50 border border-emerald-500/30 rounded-xl px-3 py-2 text-xs text-slate-200 font-bold flex items-center gap-1.5">
                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{currentSchool?.name || schoolSettings.name} (Tu Institución)</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Plantel / Área Operativa
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.campus_name}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, campus_name: e.target.value }))}
                          placeholder="Ej. Dirección General, Primaria Jardines"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Nombre y Apellidos */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Nombre(s) *
                        </label>
                        <input
                          type="text"
                          required
                          value={newStaffForm.first_name}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="Ej. Roberto"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Apellidos *
                        </label>
                        <input
                          type="text"
                          required
                          value={newStaffForm.last_name}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Ej. Garza Hernández"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Correo y Teléfono */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-slate-300">
                            Correo Electrónico *
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                              @{getSchoolEmailDomain(institutionsList.find(i => i.id === (newStaffForm.school_id || effectiveSchoolId || 'sch-jjrosseau')))}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const targetSchoolId = (!isSuperUser ? user?.school_id : (newStaffForm.school_id || effectiveSchoolId)) || 'sch-jjrosseau';
                                const schoolObj = institutionsList.find(i => i.id === targetSchoolId);
                                const domain = getSchoolEmailDomain(schoolObj);
                                if (newStaffForm.first_name) {
                                  const generated = `${newStaffForm.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${newStaffForm.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${domain}`;
                                  setNewStaffForm(prev => ({ ...prev, email: generated }));
                                }
                              }}
                              className="text-[10px] text-purple-400 hover:text-purple-300 underline cursor-pointer"
                            >
                              Auto-generar
                            </button>
                          </div>
                        </div>
                        <input
                          type="email"
                          value={newStaffForm.email}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, email: e.target.value }))}
                          placeholder={`usuario@${getSchoolEmailDomain(institutionsList.find(i => i.id === (newStaffForm.school_id || effectiveSchoolId || 'sch-jjrosseau')))}`}
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-300 block mb-1">
                          Teléfono Institucional
                        </label>
                        <input
                          type="text"
                          value={newStaffForm.phone}
                          onChange={(e) => setNewStaffForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="55-4160-8800"
                          className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    {/* Contraseña Temporal */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-slate-300">
                          Contraseña Temporal de Acceso
                        </label>
                        <button
                          type="button"
                          onClick={() => setNewStaffForm(prev => ({ ...prev, temporary_password: generateRandomPassword(6) }))}
                          className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="h-3 w-3" /> Generar otra
                        </button>
                      </div>
                      <input
                        type="text"
                        value={newStaffForm.temporary_password}
                        onChange={(e) => setNewStaffForm(prev => ({ ...prev, temporary_password: e.target.value }))}
                        className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                      <button
                        type="button"
                        onClick={() => setShowAddStaffModal(false)}
                        className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black shadow-lg shadow-purple-600/30 transition-all cursor-pointer hover:scale-102"
                      >
                        Guardar Cuenta de Personal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLANTELES & GRUPOS (TARJETAS INTERACTIVAS Y GESTIÓN COMPLETA) */}
        {activeTab === 'campuses' && (
          <div className="space-y-6">
            {/* Encabezado y Barra de Acción */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-5 rounded-3xl border border-white/10 shadow-xl">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-base font-black text-white tracking-tight">Planteles & Red de Grupos Escolares</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Haz clic en cualquier tarjeta de plantel para gestionar sus grupos, grados, plantilla docente y alumnos inscritos.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => {
                    setNewCampusForm({
                      name: '',
                      level: 'primaria',
                      address: '',
                      phone: '',
                      grades: ['1º', '2º', '3º', '4º', '5º', '6º']
                    });
                    setShowAddCampusModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> + Dar de Alta Nuevo Plantel
                </button>
              </div>
            </div>

            {/* Grid de Tarjetas de Planteles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {schoolCampuses.map(campus => {
                const campusStudents = schoolStudents.filter(s => s.campus_name?.toLowerCase() === campus.name.toLowerCase());
                const campusTeachers = schoolTeachers.filter(t => t.campus_name?.toLowerCase() === campus.name.toLowerCase() || t.campus_name === 'Todos los Planteles');
                const campusGroups = schoolGroups.filter(g => g.campus_name?.toLowerCase() === campus.name.toLowerCase());

                return (
                  <div
                    key={campus.id}
                    onClick={() => {
                      setSelectedCampusDetail(campus);
                      setCampusDetailTab('grupos');
                    }}
                    className="rounded-3xl bg-slate-900 border border-white/10 hover:border-indigo-500/60 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden group cursor-pointer relative"
                  >
                    {/* Header del Plantel */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-13 w-13 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0 group-hover:scale-105 transition-transform">
                          <School className="h-7 w-7" />
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                            campus.level === 'secundaria'
                              ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                              : campus.level === 'preparatoria'
                              ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                              : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                          }`}>
                            NIVEL {campus.level.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded-md">
                            {campus.grades.length} Grados Escolares
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                          {campus.name}
                        </h4>
                        <div className="text-xs text-slate-400 space-y-1 mt-1.5">
                          <p className="flex items-center gap-1.5 truncate">
                            <MapPin className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate">{campus.address || 'Domicilio Oficial del Plantel'}</span>
                          </p>
                          {campus.phone && (
                            <p className="flex items-center gap-1.5 font-mono text-[11px]">
                              <Phone className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                              <span>{campus.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Métricas Clave del Plantel */}
                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 text-center">
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-base font-black text-blue-400 block">{campusStudents.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Alumnos</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-base font-black text-emerald-400 block">{campusTeachers.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Docentes</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-slate-950/80 border border-white/5">
                          <span className="text-base font-black text-purple-400 block">{campusGroups.length || campus.grades.length}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Grupos</span>
                        </div>
                      </div>

                      {/* Chips de Grados */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Matrícula por Grado:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {campus.grades.map(grade => {
                            const gradeCount = campusStudents.filter(s => s.grade === grade).length;
                            return (
                              <span key={grade} className="px-2 py-1 rounded-lg bg-white/5 border border-white/5 text-[11px] font-semibold text-slate-300 flex items-center gap-1">
                                <strong className="text-indigo-400">{grade}</strong>: {gradeCount} alum.
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Botón de Acción Principal en la Tarjeta */}
                    <div className="p-4 bg-slate-950/90 border-t border-white/10 flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-400 group-hover:underline flex items-center gap-1">
                        <Layers className="h-4 w-4" /> Administrar Plantel & Grupos
                      </span>
                      <div className="h-7 w-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* TARJETA + AGREGAR NUEVO PLANTEL */}
              <div
                onClick={() => {
                  setNewCampusForm({
                    name: '',
                    level: 'primaria',
                    address: '',
                    phone: '',
                    grades: ['1º', '2º', '3º', '4º', '5º', '6º']
                  });
                  setShowAddCampusModal(true);
                }}
                className="rounded-3xl border-2 border-dashed border-white/15 hover:border-indigo-500/60 bg-slate-900/30 hover:bg-indigo-950/20 p-8 flex flex-col items-center justify-center text-center space-y-4 cursor-pointer transition-all duration-300 group min-h-[320px]"
              >
                <div className="h-16 w-16 rounded-3xl bg-indigo-600/15 group-hover:bg-indigo-600/25 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Plus className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-black text-white group-hover:text-indigo-300 transition-colors">
                    + Agregar Nuevo Plantel
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Registra una nueva sede o nivel educativo con su dirección, teléfono y configuración de grados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SUBJECTS & WORKSHOPS */}
        {activeTab === 'subjects' && (
          <div className="space-y-6">
            {/* Header & Add Elective Button */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-sm font-black text-white">Catálogo Curricular & Talleres Académicos</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Gestiona las materias oficiales NEM y da de alta nuevos talleres extracurriculares con temario, planeación multi-grupo y listas de alumnos.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAddSubjectModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Materia Curricular
                </button>
                <button
                  onClick={() => setShowAddWorkshopModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/25 transition-all cursor-pointer hover:scale-102"
                >
                  <Sparkles className="h-4 w-4" /> + Agregar Nuevo Taller Académico
                </button>
              </div>
            </div>

            {/* Materias Optativas / Talleres Académicos Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-400">
                    Materias Optativas & Talleres Extracurriculares ({schoolSubjects.filter(s => s.is_elective || s.category === 'optativa').length})
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">Haz clic en cualquier taller para abrir su información, temario, planeación por grupo y alumnos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {schoolSubjects.filter(s => s.is_elective || s.category === 'optativa').map(opt => {
                  const IconComp = getWorkshopIcon(opt);

                  return (
                    <div 
                      key={opt.id} 
                      onClick={() => {
                        setSelectedWorkshopDetail(opt);
                        setWorkshopDetailTab('syllabus');
                      }}
                      className="p-4 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 shadow-lg flex flex-col justify-between gap-3 hover:border-amber-500/70 hover:scale-[1.01] transition-all group relative cursor-pointer"
                    >
                      {/* Top Bar: Icon/Image + Category Badge + Delete */}
                      <div className="flex items-start justify-between gap-2">
                        {opt.image_url ? (
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-amber-500/30 bg-slate-950 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={opt.image_url} alt={opt.name} className="h-full w-full object-cover" />
                          </div>
                        ) : (
                          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                            <IconComp className="h-5 w-5" />
                          </div>
                        )}

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-amber-300 font-bold bg-amber-500/15 px-2 py-0.5 rounded-md border border-amber-500/20 uppercase">
                            {opt.workshop_category || 'Optativa'}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`¿Eliminar el taller "${opt.name}"?`)) {
                                deleteSubject(opt.id);
                                showToast(`Taller "${opt.name}" eliminado.`);
                              }
                            }}
                            title="Eliminar Taller"
                            className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="space-y-1">
                        <h5 className="text-sm font-black text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                          <span>{opt.name}</span>
                          <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono">Clave SEP: {opt.sep_code || 'OPT-2026'}</p>
                        
                        {opt.instructor_name && (
                          <p className="text-[11px] text-slate-300 flex items-center gap-1 pt-1">
                            <Users className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>Instructor: <strong className="text-slate-200">{opt.instructor_name}</strong></span>
                          </p>
                        )}

                        {opt.campus_name && (
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                            <span>{opt.campus_name}</span>
                          </p>
                        )}

                        {opt.schedule && (
                          <p className="text-[10px] text-indigo-300 font-mono bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20 inline-block mt-1">
                            🕒 {opt.schedule}
                          </p>
                        )}
                      </div>

                      {/* Syllabus / Temario Action */}
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
                        <span className="text-[11px] font-bold text-amber-400 group-hover:underline flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" /> Ver Temario & Grupos
                        </span>

                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Activo
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Card "+ Agregar Taller" */}
                <button
                  onClick={() => setShowAddWorkshopModal(true)}
                  className="p-5 rounded-2xl bg-slate-900/40 border-2 border-dashed border-amber-500/30 hover:border-amber-500/70 hover:bg-amber-500/5 transition-all flex flex-col items-center justify-center gap-3 text-center cursor-pointer min-h-[180px] group"
                >
                  <div className="h-11 w-11 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-amber-400 block">+ Agregar Nuevo Taller</span>
                    <span className="text-[10px] text-slate-400">Subir logotipo, temario y asignación</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Curricular Subjects Table */}
            <div className="space-y-3 pt-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Materias Curriculares Oficiales NEM (Fases 3, 4, 5 y 6)
              </h4>

              <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                    <tr>
                      <th className="p-4">Nombre de la Disciplina</th>
                      <th className="p-4">Nivel / Fase</th>
                      <th className="p-4">Clave Curricular</th>
                      <th className="p-4 text-center">Tipo</th>
                      <th className="p-4 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {schoolSubjects.filter(s => !s.is_elective && s.category !== 'optativa').map(sub => (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-bold text-white text-sm">{sub.name}</td>
                        <td className="p-4 font-semibold text-slate-300 uppercase">{sub.level_grade_id}</td>
                        <td className="p-4 font-mono text-slate-400">{sub.sep_code || 'NEM-SEP'}</td>
                        <td className="p-4 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Curricular Oficial
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className="text-emerald-400 font-bold text-xs">✔ Vigente</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: INSTITUTIONAL CONFIG & SECURITY (FICHA EDITABLE Y PARÁMETROS) */}
        {activeTab === 'config' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <form onSubmit={handleSaveInstitutionalInfo} className="p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-2xl space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-400" />
                    <h3 className="text-base font-black text-white">
                      Ficha Institucional · {currentSchool?.name || schoolSettings.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modifica y personaliza los parámetros oficiales, datos de contacto, CCT y logotipo de esta institución.
                  </p>
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Guardar Cambios Institucionales
                </button>
              </div>

              {/* Logotipo y Vista Previa */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {instEditForm.logoUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={instEditForm.logoUrl} alt="Logo Institucional" className="h-full w-full object-contain p-1" />
                    ) : (
                      <School className="h-8 w-8 text-indigo-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white">Logotipo Institucional</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Se mostrará en credenciales oficiales, portal docente y reportes.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-white/10 flex items-center gap-1.5 text-xs cursor-pointer transition-all">
                    <ImageIcon className="h-4 w-4 text-indigo-400" />
                    <span>Cambiar Imagen</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setInstEditForm(prev => ({ ...prev, logoUrl: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                  {instEditForm.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setInstEditForm(prev => ({ ...prev, logoUrl: '' }))}
                      className="px-3 py-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition-all cursor-pointer"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>

              {/* Campos Editables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nombre Institucional Oficial *</label>
                  <input
                    type="text"
                    required
                    value={instEditForm.name}
                    onChange={(e) => setInstEditForm({ ...instEditForm, name: e.target.value })}
                    placeholder="Ej. Colegio Montessori del Valle"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-bold outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Clave de Centro de Trabajo (CCT / SEP) *</label>
                  <input
                    type="text"
                    required
                    value={instEditForm.cct}
                    onChange={(e) => setInstEditForm({ ...instEditForm, cct: e.target.value.toUpperCase() })}
                    placeholder="Ej. 09PPR8800M"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-amber-300 font-bold uppercase outline-none focus:border-indigo-500 transition-all shadow-inner"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Lema o Tagline Institucional</label>
                  <input
                    type="text"
                    value={instEditForm.tagline}
                    onChange={(e) => setInstEditForm({ ...instEditForm, tagline: e.target.value })}
                    placeholder="Ej. Excelencia educativa con valores y tecnología"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Director / Coordinador General</label>
                  <input
                    type="text"
                    value={instEditForm.coordinatorName}
                    onChange={(e) => setInstEditForm({ ...instEditForm, coordinatorName: e.target.value })}
                    placeholder="Ej. Dirección General"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Dirección Corporativa Principal</label>
                  <input
                    type="text"
                    value={instEditForm.address}
                    onChange={(e) => setInstEditForm({ ...instEditForm, address: e.target.value })}
                    placeholder="Ej. Av. Universidad 1200, Col. Del Valle, CDMX"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Teléfono Institucional</label>
                  <input
                    type="text"
                    value={instEditForm.phone}
                    onChange={(e) => setInstEditForm({ ...instEditForm, phone: e.target.value })}
                    placeholder="Ej. 55-0000-0000"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 font-mono text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-slate-300 font-bold block mb-1">Sitio Web Oficial</label>
                  <input
                    type="text"
                    value={instEditForm.website}
                    onChange={(e) => setInstEditForm({ ...instEditForm, website: e.target.value })}
                    placeholder="Ej. https://montessoridelvalle.edu.mx"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 cursor-pointer"
                >
                  <Save className="h-4 w-4" /> Guardar y Actualizar Ficha Institucional
                </button>
              </div>
            </form>

            <div className="p-6 rounded-2xl bg-slate-900 border border-white/10 shadow-xl space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" /> Políticas de Seguridad & Contraseñas
              </h4>
              <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                <li>Generación aleatoria de contraseñas de 6 dígitos alfanuméricos (`[A-Za-z0-9]`).</li>
                <li>Capacidad de cambio directo de contraseñas por el Super Usuario en tiempo real.</li>
                <li>Bloqueo y cancelación instantánea de credenciales para docentes y estudiantes.</li>
                <li>Los profesores registrados disponen únicamente de acceso al panel docente (`/teacher`).</li>
                <li>Sincronización en segundo plano con la base de datos central en Supabase.</li>
              </ul>
            </div>
          </div>
        )}

        {/* TAB 7: FINANZAS & NÓMINAS DEL PERSONAL (DUEÑO DE EMPRESA) */}
        {activeTab === 'payroll' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header del Módulo Financiero */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-white/10 shadow-xl">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-white tracking-tight">Finanzas & Nóminas del Personal</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Presidencia Corporativa
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control institucional de percepciones, bonos por desempeño, retenciones y dispersión de nómina por SPEI.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={handleExportPayrollCSV}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-white/10 transition-all cursor-pointer shadow-sm hover:scale-102"
                >
                  <FileDown className="h-4 w-4 text-emerald-400" /> Exportar Reporte CSV
                </button>

                <button
                  onClick={handleBatchDisperse}
                  disabled={isDispersingPayroll || payrollMetrics.pendingDispersionsCount === 0}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer ${
                    payrollMetrics.pendingDispersionsCount > 0
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 hover:scale-102'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  {isDispersingPayroll ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-white" /> Dispersando SPEI...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-white" /> Dispersar Nómina Pendiente ({payrollMetrics.pendingDispersionsCount})
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4 Tarjetas de Métricas Ejecutivas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Nómina Neta Quincenal</span>
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-rose-400 font-mono">
                    ${payrollMetrics.totalPayroll.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span>Dispersado: <strong className="text-emerald-400 font-mono">${payrollMetrics.paidPayroll.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></span>
                  </div>
                  <div className="text-[10px] text-amber-400/90 mt-0.5">
                    Por dispersar: <strong className="font-mono">${payrollMetrics.pendingPayroll.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg flex flex-col justify-between hover:border-blue-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Ingresos por Colegiaturas</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-blue-400 font-mono">
                    ${payrollMetrics.totalTuitionIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Recaudación cobrada en cuenta institucional
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Pendiente cobrar: ${payrollMetrics.pendingTuitionIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg flex flex-col justify-between hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Margen Operativo Neto</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Landmark className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-2xl font-black font-mono ${payrollMetrics.netOperatingMargin >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    ${payrollMetrics.netOperatingMargin.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Colegiaturas menos costo total de nómina
                  </p>
                  <span className="text-[10px] text-emerald-500/90 font-semibold block mt-0.5">
                    {payrollMetrics.netOperatingMargin >= 0 ? '✓ Utilidad operativa positiva' : '⚠ Revisar metas de cobranza'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/10 shadow-lg flex flex-col justify-between hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Plantilla en Nómina</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-black text-white">
                    {payrollMetrics.totalEmployees} colaboradores
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Sueldo promedio: <strong className="text-slate-200 font-mono">${payrollMetrics.avgSalary.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong>
                  </p>
                  <p className="text-[10px] text-purple-400 mt-0.5">
                    {schoolPayroll.filter(p => p.bonuses > 0).length} colaboradores con bonos pedagógicos
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de Filtros y Búsqueda */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[240px]">
                  <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={payrollSearchTerm}
                    onChange={(e) => setPayrollSearchTerm(e.target.value)}
                    placeholder="Buscar por colaborador, RFC o cargo..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
                  />
                  {payrollSearchTerm && (
                    <button
                      onClick={() => setPayrollSearchTerm('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro por Departamento */}
                <select
                  value={payrollDepartmentFilter}
                  onChange={(e) => setPayrollDepartmentFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="all">🏢 Todos los Departamentos</option>
                  <option value="directivos">🎓 Directores y Coordinadores</option>
                  <option value="docentes">👨‍🏫 Cuerpo Docente</option>
                  <option value="cobranza">💼 Cobranza y Finanzas</option>
                </select>

                {/* Filtro por Estatus */}
                <select
                  value={payrollStatusFilter}
                  onChange={(e) => setPayrollStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-slate-200 outline-none focus:border-emerald-500 transition-all cursor-pointer"
                >
                  <option value="all">⚡ Todos los Estatus</option>
                  <option value="pagado">✓ Pagado (Dispersado)</option>
                  <option value="en_dispersion">⏳ En Dispersión</option>
                  <option value="pendiente">⚠ Pendiente de Pago</option>
                </select>
              </div>

              <div className="text-xs text-slate-400">
                Mostrando <strong className="text-white">{filteredPayroll.length}</strong> de <strong className="text-white">{schoolPayroll.length}</strong> colaboradores
              </div>
            </div>

            {/* Tabla Principal de Nómina */}
            <div className="rounded-2xl bg-slate-900 border border-white/10 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-950/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Colaborador / Identidad</th>
                      <th className="p-4">Cargo / Departamento</th>
                      <th className="p-4 text-right">Sueldo Base</th>
                      <th className="p-4 text-right">Bonos / Percep.</th>
                      <th className="p-4 text-right">Deducciones</th>
                      <th className="p-4 text-right">Sueldo Neto</th>
                      <th className="p-4">Dispersión & Banco</th>
                      <th className="p-4 text-center">Estatus</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs text-slate-300">
                    {filteredPayroll.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                          No se encontraron registros de nómina con los filtros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredPayroll.map(record => (
                        <tr key={record.id} className="hover:bg-white/[0.02] transition-colors">
                          {/* Colaborador */}
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-white font-bold text-xs uppercase shrink-0">
                                {record.employee_name.substring(0, 2)}
                              </div>
                              <div>
                                <span className="font-bold text-white block text-sm">{record.employee_name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                  <span>RFC: <strong className="text-slate-300 font-mono">{record.rfc || 'No registrado'}</strong></span>
                                  <span>·</span>
                                  <span className="font-mono text-purple-300">{record.receipt_folio || 'Sin folio'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Cargo */}
                          <td className="p-4">
                            <span className="font-bold text-slate-200 block">{record.position_title}</span>
                            <span className="text-[10px] text-slate-400 block">{record.department}</span>
                            {record.campus_name && (
                              <span className="text-[10px] text-indigo-300 block">{record.campus_name}</span>
                            )}
                          </td>

                          {/* Sueldo Base */}
                          <td className="p-4 text-right font-mono font-medium text-slate-300">
                            ${(record.base_salary || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Bonos */}
                          <td className="p-4 text-right font-mono text-emerald-400 font-medium">
                            {record.bonuses > 0 ? `+$${record.bonuses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00'}
                          </td>

                          {/* Deducciones */}
                          <td className="p-4 text-right font-mono text-rose-400 font-medium">
                            {record.deductions > 0 ? `-$${record.deductions.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : '$0.00'}
                          </td>

                          {/* Sueldo Neto */}
                          <td className="p-4 text-right font-mono font-black text-emerald-300 text-sm">
                            ${(record.net_salary || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>

                          {/* Cuenta y Banco */}
                          <td className="p-4 text-xs">
                            <span className="font-bold text-slate-200 block">{record.bank_name || 'SPEI Institucional'}</span>
                            <span className="font-mono text-[10px] text-slate-400 block">
                              CLABE: {record.account_clabe ? `${record.account_clabe.substring(0, 6)}...${record.account_clabe.substring(14)}` : 'Pendiente'}
                            </span>
                            <span className="text-[10px] text-slate-500 block">{record.payment_period}</span>
                          </td>

                          {/* Estatus */}
                          <td className="p-4 text-center">
                            {record.status === 'pagado' ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="h-3 w-3" /> Pagado
                              </div>
                            ) : record.status === 'en_dispersion' ? (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                <RefreshCw className="h-3 w-3 animate-spin" /> En Dispersión
                              </div>
                            ) : (
                              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                <AlertCircle className="h-3 w-3" /> Pendiente
                              </div>
                            )}
                          </td>

                          {/* Acciones */}
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Botón Ver Recibo Formal */}
                              <button
                                onClick={() => setSelectedPayrollRecordForStub(record)}
                                title="Ver Recibo Digital de Nómina"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              >
                                <Receipt className="h-4 w-4 text-indigo-400" />
                              </button>

                              {/* Botón Ajustar Compensación */}
                              <button
                                onClick={() => handleOpenAdjustSalary(record)}
                                title="Ajustar Sueldo Base o Bonos"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4 text-amber-400" />
                              </button>

                              {/* Dispersión Unitaria */}
                              {record.status !== 'pagado' && (
                                <button
                                  onClick={() => {
                                    dispersePayrollBatch([record.id]);
                                    showToast(`✅ Dispersión SPEI procesada para ${record.employee_name}`);
                                  }}
                                  title="Dispersar Pago Ahora"
                                  className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 transition-all cursor-pointer"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB AUDITORÍA DE BAJAS Y ALUMNOS ELIMINADOS DEL SISTEMA (EXCLUSIVO SUPER USUARIO) */}
        {/* ========================================================================= */}
        {activeTab === 'deletions' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header del Tab */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 shadow-xs">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">
                      Registro Oficial de Bajas y Auditoría de Alumnos Eliminados
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-200">
                      Trazabilidad Inmutable Super Usuario
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Historial oficial de alumnos retirados del sistema con fecha y hora exacta, operador responsable y motivo de baja.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200">
                  Total Registros: {schoolDeletionLogs.length}
                </span>
              </div>
            </div>

            {/* KPI Cards de Auditoría */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Total de Bajas Registradas</span>
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-black text-rose-600 font-mono">{schoolDeletionLogs.length}</span>
                  <p className="text-xs text-slate-500 mt-1">Alumnos retirados del sistema activo</p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Última Baja en Sistema</span>
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Calendar className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs font-bold text-slate-800 block line-clamp-1">
                    {schoolDeletionLogs[0]?.deleted_at_formatted || 'Sin registros recientes'}
                  </span>
                  <span className="text-[11px] font-mono text-indigo-600 mt-1 block">
                    {schoolDeletionLogs[0]?.student_name ? `Alumno: ${schoolDeletionLogs[0].student_name}` : 'Ninguna baja registrada'}
                  </span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-xs font-bold uppercase tracking-wider">Garantía de Auditoría</span>
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-sm font-black text-emerald-700 block">100% Auditado</span>
                  <p className="text-xs text-slate-500 mt-1">
                    Cada baja almacena fecha ISO, hora oficial, operador y motivo institucional.
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de Filtro y Búsqueda */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="relative min-w-[280px] flex-1 max-w-md">
                <Search className="h-4 w-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={deletionSearchTerm}
                  onChange={(e) => setDeletionSearchTerm(e.target.value)}
                  placeholder="Buscar por alumno, matrícula, CURP, motivo u operador..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-rose-500 transition-all"
                />
              </div>

              <span className="text-xs text-slate-500">
                Mostrando <strong className="text-slate-900">{filteredDeletionLogs.length}</strong> de <strong className="text-slate-900">{schoolDeletionLogs.length}</strong> bajas registradas
              </span>
            </div>

            {/* Tabla de Registros de Bajas */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="p-4">Fecha y Hora Exacta de Baja</th>
                      <th className="p-4">Alumno Eliminado</th>
                      <th className="p-4">Matrícula & CURP</th>
                      <th className="p-4">Colegio & Grado</th>
                      <th className="p-4">Operador que dio la Baja</th>
                      <th className="p-4">Motivo de Retiro</th>
                      <th className="p-4 text-center">Estado Oficial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {filteredDeletionLogs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-400">
                          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                          <span className="font-bold text-slate-700 block">No se encontraron registros de bajas con los filtros actuales.</span>
                          <span className="text-xs text-slate-400">El sistema escolar se encuentra íntegro y sin bajas pendientes.</span>
                        </td>
                      </tr>
                    ) : (
                      filteredDeletionLogs.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <span className="font-bold text-slate-900 block text-xs">
                              {log.deleted_at_formatted}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                              {log.deleted_at}
                            </span>
                          </td>

                          <td className="p-4">
                            <span className="font-black text-slate-900 text-sm block">
                              {log.student_name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              ID: {log.student_id}
                            </span>
                          </td>

                          <td className="p-4 font-mono text-slate-600">
                            <div className="font-bold text-slate-800">{log.curp || 'SIN-CURP'}</div>
                            <div className="text-[10px] text-slate-500">{log.enrollment_id || 'Sin matrícula'}</div>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-slate-800 block">{log.school_name || currentSchool?.name}</span>
                            <span className="text-[11px] text-slate-500 block">{log.campus_name || 'Plantel'} · {log.grade}</span>
                          </td>

                          <td className="p-4">
                            <span className="font-bold text-indigo-700 block">{log.deleted_by_name}</span>
                            <span className="text-[10px] text-slate-500 block uppercase font-mono">{log.deleted_by_role} · {log.deleted_by_email}</span>
                          </td>

                          <td className="p-4 max-w-[220px]">
                            <span className="text-xs text-slate-700 italic bg-slate-50 p-2 rounded-xl border border-slate-200 block">
                              "{log.reason}"
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-rose-100 text-rose-700 border border-rose-200">
                              Baja Definitiva
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  )}

      {/* MODAL PRINCIPAL: INFORMACIÓN DEL CURSO / TALLER ACADÉMICO (TEMARIO + MULTI-GRUPO + ALUMNOS) */}
      {selectedWorkshopDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
            
            {/* Header del Curso / Taller */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-start gap-3.5">
                {selectedWorkshopDetail.image_url ? (
                  <div className="h-14 w-14 rounded-2xl overflow-hidden border border-amber-500/40 bg-slate-950 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedWorkshopDetail.image_url} alt={selectedWorkshopDetail.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                    <Sparkles className="h-7 w-7" />
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-black text-white">{selectedWorkshopDetail.name}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {selectedWorkshopDetail.workshop_category || 'TALLER OPTATIVO'}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
                      Clave: {selectedWorkshopDetail.sep_code || 'OPT-2026'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    {selectedWorkshopDetail.instructor_name && (
                      <span className="text-slate-300 font-semibold flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-500" /> Instructor: {selectedWorkshopDetail.instructor_name}
                      </span>
                    )}
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="h-3.5 w-3.5 text-slate-500" /> {selectedWorkshopDetail.campus_name || 'Todos los Planteles'}
                    </span>
                    {selectedWorkshopDetail.schedule && (
                      <>
                        <span>·</span>
                        <span className="text-indigo-300 font-mono">🕒 {selectedWorkshopDetail.schedule}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedWorkshopDetail(null)} 
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Descripción del Taller */}
            {selectedWorkshopDetail.description && (
              <div className="p-3.5 rounded-xl bg-slate-950 border border-white/10 text-xs text-slate-300 leading-relaxed">
                <strong className="text-amber-400 block mb-0.5">Objetivos y Enfoque Pedagógico:</strong>
                {selectedWorkshopDetail.description}
              </div>
            )}

            {/* Tabs del Detalle */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
              <button
                onClick={() => setWorkshopDetailTab('syllabus')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  workshopDetailTab === 'syllabus'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <FileText className="h-4 w-4" /> 1. Temario & Programa de Estudio
              </button>

              <button
                onClick={() => setWorkshopDetailTab('annual_plans')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  workshopDetailTab === 'annual_plans'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Calendar className="h-4 w-4" /> 2. Planeación Anual por Grupo (Multi-Grupo)
              </button>

              <button
                onClick={() => setWorkshopDetailTab('students')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  workshopDetailTab === 'students'
                    ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <GraduationCap className="h-4 w-4" /> 3. Alumnos Inscritos del Grupo
              </button>
            </div>

            {/* CONTENIDO TAB 1: TEMARIO Y PROGRAMA DE ESTUDIO */}
            {workshopDetailTab === 'syllabus' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-white">Estructura Modular & Temario del Taller</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Módulos cronometrados, semanas de ejecución y entregables oficiales.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedWorkshopDetail.syllabus_url && (
                      <a
                        href={selectedWorkshopDetail.syllabus_url}
                        download={selectedWorkshopDetail.syllabus_filename || `${selectedWorkshopDetail.name}_Temario.pdf`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md transition-all"
                      >
                        <FileDown className="h-4 w-4" /> Descargar Archivo ({selectedWorkshopDetail.syllabus_filename || 'PDF'})
                      </a>
                    )}
                    <button
                      onClick={() => setShowAddTopicModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-white/10 transition-all cursor-pointer"
                    >
                      <Plus className="h-4 w-4" /> + Agregar Bloque Temático
                    </button>
                  </div>
                </div>

                {/* Topics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(selectedWorkshopDetail.syllabus_topics || [
                    { block: 'Bloque 1', title: 'Fundamentos e Iniciación Práctica', weeks: '4 Semanas', description: 'Conceptos base y diagnóstico motriz/analítico de inicio.', deliverable: 'Bitácora diagnóstica' },
                    { block: 'Bloque 2', title: 'Desarrollo de Técnicas Especializadas', weeks: '6 Semanas', description: 'Ejercicios secuenciales y retos estructurados.', deliverable: 'Evaluación intermedia' },
                    { block: 'Bloque 3', title: 'Proyectos y Aplicación en Escenario Real', weeks: '6 Semanas', description: 'Diseño de estrategias y trabajo colaborativo.', deliverable: 'Proyecto grupal' },
                    { block: 'Bloque 4', title: 'Exhibición Escolar y Cierre Anual', weeks: '4 Semanas', description: 'Presentación final y torneo de convivencia escolar.', deliverable: 'Demostración práctica comunitaria' }
                  ]).map((topic: SyllabusTopic, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-950 border border-white/10 space-y-2 hover:border-amber-500/40 transition-all">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
                          {topic.block}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 font-semibold">{topic.weeks}</span>
                      </div>
                      <h5 className="text-xs font-black text-white">{topic.title}</h5>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{topic.description}</p>
                      {topic.deliverable && (
                        <div className="pt-2 border-t border-white/5 flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                          <CheckCircle2 className="h-3 w-3 shrink-0" /> Entregable: {topic.deliverable}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CONTENIDO TAB 2: PLANEACIÓN ANUAL POR GRUPO (MULTI-GRUPO) */}
            {workshopDetailTab === 'annual_plans' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-xs text-indigo-200">
                  💡 <strong>Materia Optativa Multi-Grupo:</strong> Este taller se imparte a distintos grupos en varios planteles. Selecciona un grupo para consultar o actualizar su planeación anual específica adaptada a su grado académico.
                </div>

                {/* Group Selector Strip */}
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Selecciona el Grupo Escolar:</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {availableGroupsForWorkshop.map(grp => (
                      <button
                        key={grp.id}
                        onClick={() => setSelectedGroupForPlan(grp.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                          selectedGroupForPlan === grp.id
                            ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                            : 'bg-slate-950 text-slate-300 hover:bg-white/5 border border-white/10'
                        }`}
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        <span>{grp.campus_name} · {grp.grade} {grp.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Group Annual Plan Card */}
                {activeGroupPlan && (
                  <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-4 shadow-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-white">{activeGroupPlan.plan_title}</h4>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                            Vigente 2026
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Plantel: <strong className="text-slate-300">{activeGroupPlan.campus_name}</strong> · Grado: <strong className="text-slate-300">{activeGroupPlan.grade} {activeGroupPlan.group_name}</strong>
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setAnnualPlanForm({
                            plan_title: activeGroupPlan.plan_title,
                            project_title: activeGroupPlan.project_title || '',
                            pda_focus: activeGroupPlan.pda_focus || '',
                            term_1: activeGroupPlan.term_1,
                            term_2: activeGroupPlan.term_2,
                            term_3: activeGroupPlan.term_3
                          });
                          setShowEditAnnualPlanModal(true);
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-md cursor-pointer transition-all hover:scale-102"
                      >
                        <Edit3 className="h-4 w-4" /> Editar / Recibir Planeación Anual
                      </button>
                    </div>

                    {/* PDA and Project Badges */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      {activeGroupPlan.pda_focus && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-amber-400 block">Eje Formativo / PDA Oficial:</span>
                          <p className="text-slate-200">{activeGroupPlan.pda_focus}</p>
                        </div>
                      )}
                      {activeGroupPlan.project_title && (
                        <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-1">
                          <span className="text-[10px] uppercase font-bold text-indigo-400 block">Proyecto Comunitario del Grupo:</span>
                          <p className="text-slate-200">{activeGroupPlan.project_title}</p>
                        </div>
                      )}
                    </div>

                    {/* Term 1, 2, 3 Breakdown */}
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                        <span className="text-xs font-black text-amber-400 block">📅 Trimestre 1 (Diagnóstico y Fundamentación)</span>
                        <p className="text-slate-300 leading-relaxed">{activeGroupPlan.term_1}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                        <span className="text-xs font-black text-indigo-400 block">📅 Trimestre 2 (Desarrollo y Proyectos Intermedios)</span>
                        <p className="text-slate-300 leading-relaxed">{activeGroupPlan.term_2}</p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 space-y-1">
                        <span className="text-xs font-black text-emerald-400 block">📅 Trimestre 3 (Evaluación Formativa y Cierre)</span>
                        <p className="text-slate-300 leading-relaxed">{activeGroupPlan.term_3}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CONTENIDO TAB 3: ALUMNOS INSCRITOS EN ESTE GRUPO */}
            {workshopDetailTab === 'students' && (
              <div className="space-y-4">
                {/* Group Selector for Students */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Grupo:</span>
                    {availableGroupsForWorkshop.map(grp => (
                      <button
                        key={grp.id}
                        onClick={() => setSelectedGroupForPlan(grp.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          selectedGroupForPlan === grp.id
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : 'bg-slate-950 text-slate-400 hover:bg-white/5 border border-white/10'
                        }`}
                      >
                        {grp.campus_name} · {grp.grade} {grp.name}
                      </button>
                    ))}
                  </div>

                  <div className="relative min-w-[200px]">
                    <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      value={workshopStudentSearch}
                      onChange={(e) => setWorkshopStudentSearch(e.target.value)}
                      placeholder="Buscar alumno en grupo..."
                      className="w-full bg-slate-950 border border-white/10 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* Enrolled Students Table */}
                <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-3 bg-slate-900 border-b border-white/5 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">
                      Alumnos inscritos en este taller ({studentsInSelectedWorkshopGroup.length})
                    </span>
                    <span className="text-[11px] text-slate-400">Sincronizado con base de datos de ISkool</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-white/10">
                        <tr>
                          <th className="p-3.5">Estudiante</th>
                          <th className="p-3.5">CURP</th>
                          <th className="p-3.5">Plantel & Grado</th>
                          <th className="p-3.5 text-center">Nivel / XP</th>
                          <th className="p-3.5 text-right">Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-200">
                        {studentsInSelectedWorkshopGroup.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-500 text-xs">
                              No hay alumnos registrados para este grupo específico con los filtros actuales.
                            </td>
                          </tr>
                        ) : (
                          studentsInSelectedWorkshopGroup.map(st => (
                            <tr key={st.id} className="hover:bg-white/5 transition-colors">
                              <td className="p-3.5 font-bold text-white flex items-center gap-2.5">
                                <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                  {st.first_name.charAt(0)}{st.last_name_1.charAt(0)}
                                </div>
                                <div>
                                  <div>{st.first_name} {st.second_name || ''} {st.last_name_1} {st.last_name_2 || ''}</div>
                                  <div className="text-[10px] text-slate-500 font-normal">{st.email}</div>
                                </div>
                              </td>
                              <td className="p-3.5 font-mono text-slate-400 text-[11px]">{st.curp || 'SIN-CURP'}</td>
                              <td className="p-3.5 text-slate-300 font-semibold">
                                {st.campus_name} · {st.grade}
                              </td>
                              <td className="p-3.5 text-center font-mono">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  st.level === 'primaria' 
                                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                                    : st.level === 'secundaria'
                                      ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                                      : 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                                }`}>
                                  {st.level === 'primaria' ? 'Primaria' : st.level === 'secundaria' ? 'Secundaria' : 'Preparatoria'} · {st.grade}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <span className="text-emerald-400 font-bold text-xs">✔ Inscrito</span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setSelectedWorkshopDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ALTA INDIVIDUAL DE ALUMNO */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">Alta Individual de Alumno</h3>
              <button onClick={() => setShowAddStudentModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.first_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, first_name: e.target.value })}
                    placeholder="Ej. Rodrigo"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Segundo Nombre</label>
                  <input
                    type="text"
                    value={newStudentForm.second_name}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, second_name: e.target.value })}
                    placeholder="Ej. Andrés"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Primer Apellido *</label>
                  <input
                    type="text"
                    required
                    value={newStudentForm.last_name_1}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, last_name_1: e.target.value })}
                    placeholder="Ej. Morales"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Segundo Apellido</label>
                  <input
                    type="text"
                    value={newStudentForm.last_name_2}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, last_name_2: e.target.value })}
                    placeholder="Ej. Ríos"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nivel Educativo *</label>
                  <select
                    value={newStudentForm.level}
                    onChange={(e) => {
                      const lvl = e.target.value as 'primaria' | 'secundaria' | 'preparatoria';
                      const defaultGrade = lvl === 'preparatoria' ? '1º Sem' : '1º';
                      const matchingCampus = schoolCampuses.find(c => c.level === lvl) || schoolCampuses[0];
                      setNewStudentForm({
                        ...newStudentForm,
                        level: lvl,
                        grade: defaultGrade,
                        campus_name: matchingCampus?.name || newStudentForm.campus_name
                      });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                  >
                    <option value="primaria">Primaria (1º - 6º)</option>
                    <option value="secundaria">Secundaria (1º - 3º)</option>
                    <option value="preparatoria">Preparatoria (1º - 6º Sem)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Grado Escolar *</label>
                  <select
                    value={newStudentForm.grade}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, grade: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                  >
                    {newStudentForm.level === 'primaria' && (
                      <>
                        <option value="1º">1º de Primaria (Baja)</option>
                        <option value="2º">2º de Primaria (Baja)</option>
                        <option value="3º">3º de Primaria (Baja)</option>
                        <option value="4º">4º de Primaria (Alta)</option>
                        <option value="5º">5º de Primaria (Alta)</option>
                        <option value="6º">6º de Primaria (Alta)</option>
                      </>
                    )}
                    {newStudentForm.level === 'secundaria' && (
                      <>
                        <option value="1º">1º de Secundaria</option>
                        <option value="2º">2º de Secundaria</option>
                        <option value="3º">3º de Secundaria</option>
                      </>
                    )}
                    {newStudentForm.level === 'preparatoria' && (
                      <>
                        <option value="1º Sem">1º Semestre</option>
                        <option value="2º Sem">2º Semestre</option>
                        <option value="3º Sem">3º Semestre</option>
                        <option value="4º Sem">4º Semestre</option>
                        <option value="5º Sem">5º Semestre</option>
                        <option value="6º Sem">6º Semestre</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Plantel / Sede *</label>
                  <select
                    value={newStudentForm.campus_name}
                    onChange={(e) => {
                      const selCampus = schoolCampuses.find(c => c.name === e.target.value);
                      setNewStudentForm({ 
                        ...newStudentForm, 
                        campus_name: e.target.value,
                        level: selCampus?.level || newStudentForm.level
                      });
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    {schoolCampuses.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.level.toUpperCase()})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Beca Inicial (%)</label>
                  <select
                    value={newStudentForm.scholarship_percentage}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, scholarship_percentage: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="0">0% - Sin Beca (Arancel Regular)</option>
                    <option value="10">10% - Descuento Inicial</option>
                    <option value="25">25% - Beca Hermanos / Familiar</option>
                    <option value="50">50% - Beca Académica</option>
                    <option value="75">75% - Beca Deportiva / Destacada</option>
                    <option value="100">100% - Beca Excelencia Total</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Modalidad de Beca</label>
                  <select
                    value={newStudentForm.scholarship_type}
                    onChange={(e) => setNewStudentForm({ ...newStudentForm, scholarship_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                  >
                    <option value="academica">Académica</option>
                    <option value="deportiva">Deportiva</option>
                    <option value="hermanos">Hermanos</option>
                    <option value="sep">SEP Oficial</option>
                    <option value="socioeconomica">Socioeconómica</option>
                  </select>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                ℹ️ Se generará automáticamente una <strong>contraseña de 6 caracteres</strong> y su <strong>registro contable en el Portal de Finanzas</strong> con el arancel correspondiente a su nivel.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Dar de Alta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CARGA RÁPIDA (EXCEL / CSV / PEGAR LISTA) */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <UploadCloud className="h-5 w-5 text-indigo-400" /> Carga Rápida de Alumnos (Excel / CSV)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Sube tu archivo de Excel o pega la lista de alumnos directamente.</p>
              </div>
              <button onClick={() => setShowBulkUploadModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            {/* Opciones de Carga */}
            <div className="space-y-3">
              {/* Opción 1: Archivo */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-dashed border-white/20 text-center space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv,.txt"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-md cursor-pointer transition-all"
                >
                  📁 Seleccionar Archivo Excel (.xlsx / .csv)
                </button>
                <p className="text-[11px] text-slate-500">O arrastra y suelta tu archivo aquí</p>
              </div>

              {/* Opción 2: Pegado de Texto */}
              <div>
                <label className="text-xs font-bold text-slate-400 block mb-1">O pega el texto copiado de Excel:</label>
                <textarea
                  rows={4}
                  value={bulkTextInput}
                  onChange={(e) => {
                    setBulkTextInput(e.target.value);
                    parseBulkText(e.target.value);
                  }}
                  placeholder="Ejemplo:&#10;Mateo, Ortiz, Medina, Primaria Torres, 4º&#10;Valentina, Hernández, Silva, Primaria Jardines, 1º&#10;Diego, Jiménez, Ríos, Secundaria Torres, 2º"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              {/* Vista Previa de Alumnos Detectados */}
              {bulkPreviewList.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400">✔ {bulkPreviewList.length} Alumnos detectados para importar:</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-white/10 bg-slate-950 divide-y divide-white/5 text-xs">
                    {bulkPreviewList.map((st, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-[11px]">
                        <span className="font-bold text-white">{st.first_name} {st.last_name_1} {st.last_name_2}</span>
                        <span className="text-slate-400">{st.campus_name} · {st.grade} Grado</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultados Generados con Contraseñas */}
              {bulkGeneratedResults && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400">🎉 ¡{bulkGeneratedResults.length} Alumnos importados con éxito!</span>
                    <button
                      onClick={exportCredentialsCSV}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer"
                    >
                      Descargar Credenciales (CSV)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowBulkUploadModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
              {!bulkGeneratedResults && (
                <button
                  type="button"
                  onClick={handleExecuteBulkUpload}
                  disabled={bulkPreviewList.length === 0}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white text-xs font-black shadow-lg cursor-pointer"
                >
                  Procesar e Importar {bulkPreviewList.length} Alumnos
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CAMBIO DIRECTO DE CONTRASEÑA */}
      {showPasswordModal.isOpen && (
        <div className="fixed inset-0 z-[70] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Cambiar Contraseña</h3>
                <p className="text-xs text-slate-400 mt-0.5">{showPasswordModal.userName}</p>
              </div>
              <button 
                onClick={() => setShowPasswordModal({ isOpen: false, userId: '', userName: '', role: 'student' })} 
                className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer"
              >
                ✕ Cerrar
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Contraseña Actual:</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-amber-400 font-bold flex items-center justify-between">
                  <span>{showPasswordModal.currentPassword || '---'}</span>
                  <button
                    onClick={() => copyToClipboard(showPasswordModal.currentPassword || '', 'modal-pwd')}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleDirectPasswordChange()}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-102"
                >
                  <RefreshCw className="h-4 w-4" /> Generar Nueva Contraseña Aleatoria (6 Dígitos)
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowPasswordModal({ isOpen: false, userId: '', userName: '', role: 'student' })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ALTA DE PROFESOR (ACCESO EXCLUSIVO DOCENTE) */}
      {showAddTeacherModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Registrar Nuevo Profesor</h3>
                <p className="text-xs text-slate-400">El docente tendrá acceso exclusivo al Portal Docente (/teacher).</p>
              </div>
              <button onClick={() => setShowAddTeacherModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Nombre(s) *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.first_name}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, first_name: e.target.value })}
                    placeholder="Ej. Laura"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Apellidos *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.last_name}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, last_name: e.target.value })}
                    placeholder="Ej. González"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Plantel Principal *</label>
                <select
                  value={newTeacherForm.campus_name}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, campus_name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Todos los Planteles">Todos los Planteles</option>
                  {schoolCampuses.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Materias Asignadas (separadas por coma)</label>
                <input
                  type="text"
                  value={newTeacherForm.assigned_subjects}
                  onChange={(e) => setNewTeacherForm({ ...newTeacherForm, assigned_subjects: e.target.value })}
                  placeholder="Ej. Matemáticas, Robótica"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300">
                🔒 Al dar de alta este docente, podrá ingresar con su correo y contraseña de 6 dígitos con permisos restringidos exclusivamente a la vista de profesor.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTeacherModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Registrar Profesor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: ALTA DE NUEVO TALLER ACADÉMICO / OPTATIVA */}
      {showAddWorkshopModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Alta de Nuevo Taller Académico</h3>
                  <p className="text-xs text-slate-400">Configura la información oficial, horario, temario y logotipo.</p>
                </div>
              </div>
              <button onClick={() => setShowAddWorkshopModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateWorkshop} className="space-y-3.5 text-xs">
              
              {/* Nombre y Clave SEP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-slate-300 font-bold block mb-1">Nombre del Taller Académico *</label>
                  <input
                    type="text"
                    required
                    value={newWorkshopForm.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setNewWorkshopForm(prev => ({
                        ...prev,
                        name: val,
                        sep_code: prev.sep_code || (val.length >= 3 ? `OPT-${val.substring(0, 3).toUpperCase()}` : '')
                      }));
                    }}
                    placeholder="Ej. Ajedrez Estratégico, Programación con Python..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500 font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Clave Oficial / SEP</label>
                  <input
                    type="text"
                    value={newWorkshopForm.sep_code}
                    onChange={(e) => setNewWorkshopForm({ ...newWorkshopForm, sep_code: e.target.value.toUpperCase() })}
                    placeholder="Ej. OPT-AJE"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-amber-400 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Categoría y Plantel */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Categoría del Taller *</label>
                  <select
                    value={newWorkshopForm.workshop_category}
                    onChange={(e) => setNewWorkshopForm({ ...newWorkshopForm, workshop_category: e.target.value as any })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="tecnologico">🤖 Tecnológico (Robótica, Programación, IA)</option>
                    <option value="deportivo">🏃‍♂️ Deportivo (Basquetbol, Fútbol, Atletismo)</option>
                    <option value="artistico">🎨 Artístico (Música, Danza, Pintura, Teatro)</option>
                    <option value="cientifico">🔬 Científico (Astronomía, Experimentos, Ecología)</option>
                    <option value="academico">♟️ Académico / Lógica (Ajedrez, Debate, Idiomas)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Plantel(es) donde se imparte *</label>
                  <select
                    value={newWorkshopForm.campus_name}
                    onChange={(e) => setNewWorkshopForm({ ...newWorkshopForm, campus_name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value="Todos los Planteles">🏢 Todos los Planteles</option>
                    {schoolCampuses.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Instructor y Horario */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Profesor / Instructor Responsable</label>
                  <select
                    value={newWorkshopForm.instructor_name}
                    onChange={(e) => setNewWorkshopForm({ ...newWorkshopForm, instructor_name: e.target.value })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {schoolTeachers.map(t => (
                      <option key={t.id} value={`${t.first_name} ${t.last_name}`}>
                        {t.first_name} {t.last_name} ({t.campus_name || 'General'})
                      </option>
                    ))}
                    <option value="Instructor Externo / Especialista">Instructor Externo / Especialista</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-bold block mb-1">Horario y Días</label>
                  <input
                    type="text"
                    value={newWorkshopForm.schedule}
                    onChange={(e) => setNewWorkshopForm({ ...newWorkshopForm, schedule: e.target.value })}
                    placeholder="Ej. Martes y Jueves 16:00 - 17:30"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="text-slate-300 font-bold block mb-1">Objetivos Pedagógicos y Descripción</label>
                <textarea
                  rows={2}
                  value={newWorkshopForm.description}
                  onChange={(e) => setNewWorkshopForm({ ...newWorkshopForm, description: e.target.value })}
                  placeholder="Describe las competencias que desarrollarán los alumnos en este taller..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* ARCHIVOS: Portada / Logotipo y Temario PDF */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                
                {/* 1. Subida de Imagen/Portada */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-dashed border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" /> Portada / Logotipo
                    </span>
                    {newWorkshopForm.image_url && (
                      <span className="text-[10px] text-emerald-400 font-semibold">✔ Imagen lista</span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={workshopImageRef}
                    accept="image/*"
                    onChange={handleWorkshopImageUpload}
                    className="hidden"
                  />

                  {newWorkshopForm.image_url ? (
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={newWorkshopForm.image_url} alt="Preview" className="h-10 w-10 rounded-lg object-cover border border-amber-500/30" />
                      <button
                        type="button"
                        onClick={() => setNewWorkshopForm(prev => ({ ...prev, image_url: '' }))}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => workshopImageRef.current?.click()}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition-all cursor-pointer"
                    >
                      🖼 Seleccionar Imagen (PNG/JPG)
                    </button>
                  )}
                </div>

                {/* 2. Subida de Temario / Programa PDF */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-dashed border-white/15 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-indigo-400 flex items-center gap-1.5">
                      <FileDown className="h-3.5 w-3.5" /> Temario / Programa (PDF)
                    </span>
                    {newWorkshopForm.syllabus_filename && (
                      <span className="text-[10px] text-emerald-400 font-semibold">✔ Documento listo</span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={workshopSyllabusRef}
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={handleWorkshopSyllabusUpload}
                    className="hidden"
                  />

                  {newWorkshopForm.syllabus_filename ? (
                    <div className="flex items-center justify-between gap-1 bg-white/5 p-1.5 rounded-lg">
                      <span className="text-[10px] text-slate-300 truncate max-w-[130px] font-mono">
                        {newWorkshopForm.syllabus_filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => setNewWorkshopForm(prev => ({ ...prev, syllabus_url: '', syllabus_filename: '' }))}
                        className="text-[10px] text-red-400 hover:underline cursor-pointer"
                      >
                        Quitar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => workshopSyllabusRef.current?.click()}
                      className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-white/10 transition-all cursor-pointer"
                    >
                      📄 Subir Archivo PDF / Doc
                    </button>
                  )}
                </div>

              </div>

              {/* Botones de Acción */}
              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddWorkshopModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/30 cursor-pointer transition-all hover:scale-102"
                >
                  Guardar y Publicar Taller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 6: EDITAR / RECIBIR PLANEACIÓN ANUAL DE GRUPO */}
      {showEditAnnualPlanModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white">Planeación Anual Oficial del Grupo</h3>
                <p className="text-xs text-amber-400">{selectedWorkshopDetail?.name} · Grupo {selectedGroupForPlan}</p>
              </div>
              <button onClick={() => setShowEditAnnualPlanModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleSaveAnnualPlan} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">Título de la Planeación Anual</label>
                <input
                  type="text"
                  required
                  value={annualPlanForm.plan_title}
                  onChange={(e) => setAnnualPlanForm({ ...annualPlanForm, plan_title: e.target.value })}
                  placeholder="Ej. Planeación Anual 2026 - Robótica 4º Primaria Jardines"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Eje Formativo / PDA Oficial de la SEP</label>
                <input
                  type="text"
                  value={annualPlanForm.pda_focus}
                  onChange={(e) => setAnnualPlanForm({ ...annualPlanForm, pda_focus: e.target.value })}
                  placeholder="Ej. Pensamiento analítico y resolución colaborativa..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Proyecto Comunitario Integrador</label>
                <input
                  type="text"
                  value={annualPlanForm.project_title}
                  onChange={(e) => setAnnualPlanForm({ ...annualPlanForm, project_title: e.target.value })}
                  placeholder="Ej. Eco-Robot Comunitario para el patio escolar"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Trimestre 1 (Objetivos & Actividades)</label>
                <textarea
                  rows={2}
                  value={annualPlanForm.term_1}
                  onChange={(e) => setAnnualPlanForm({ ...annualPlanForm, term_1: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Trimestre 2 (Objetivos & Actividades)</label>
                <textarea
                  rows={2}
                  value={annualPlanForm.term_2}
                  onChange={(e) => setAnnualPlanForm({ ...annualPlanForm, term_2: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Trimestre 3 (Objetivos & Actividades)</label>
                <textarea
                  rows={2}
                  value={annualPlanForm.term_3}
                  onChange={(e) => setAnnualPlanForm({ ...annualPlanForm, term_3: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditAnnualPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg cursor-pointer"
                >
                  Guardar Planeación Anual
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 7: AGREGAR BLOQUE TEMÁTICO AL TEMARIO */}
      {showAddTopicModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">Agregar Bloque al Temario</h3>
              <button onClick={() => setShowAddTopicModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleAddSyllabusTopic} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Identificador de Bloque</label>
                  <input
                    type="text"
                    required
                    value={newTopicForm.block}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, block: e.target.value })}
                    placeholder="Ej. Bloque 5"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Duración (Semanas)</label>
                  <input
                    type="text"
                    required
                    value={newTopicForm.weeks}
                    onChange={(e) => setNewTopicForm({ ...newTopicForm, weeks: e.target.value })}
                    placeholder="Ej. 4 Semanas"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Título del Módulo o Tema *</label>
                <input
                  type="text"
                  required
                  value={newTopicForm.title}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, title: e.target.value })}
                  placeholder="Ej. Aplicaciones Avanzadas y Torneo Escolar"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Descripción de Contenidos</label>
                <textarea
                  rows={2}
                  value={newTopicForm.description}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, description: e.target.value })}
                  placeholder="Temas que se impartirán en este bloque..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-2.5 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Entregable Tangible / Evaluación</label>
                <input
                  type="text"
                  value={newTopicForm.deliverable}
                  onChange={(e) => setNewTopicForm({ ...newTopicForm, deliverable: e.target.value })}
                  placeholder="Ej. Rúbrica y prototipo final"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddTopicModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg cursor-pointer"
                >
                  Guardar Bloque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 8: ALTA DE MATERIA CURRICULAR SIMPLE */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white">Agregar Materia Curricular Oficial</h3>
              <button onClick={() => setShowAddSubjectModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nombre de la Disciplina *</label>
                <input
                  type="text"
                  required
                  value={newSubjectForm.name}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, name: e.target.value })}
                  placeholder="Ej. Lengua Extranjera Inglés"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500 font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Clave Curricular</label>
                <input
                  type="text"
                  value={newSubjectForm.sep_code}
                  onChange={(e) => setNewSubjectForm({ ...newSubjectForm, sep_code: e.target.value })}
                  placeholder="Ej. NEM-ING"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddSubjectModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Guardar Materia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 9: ALTA DE NUEVO COLEGIO / INSTITUCIÓN ESCOLAR */}
      {showAddSchoolModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-indigo-400" /> Alta de Nueva Institución Escolar
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Crea la infraestructura completa, bases de datos y accesos para el nuevo colegio.</p>
              </div>
              <button onClick={() => setShowAddSchoolModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateSchool} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nombre Oficial del Colegio *</label>
                <input
                  type="text"
                  required
                  value={newSchoolForm.name}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, name: e.target.value })}
                  placeholder="Ej. Colegio Montessori del Valle"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Clave SEP / CCT *</label>
                  <input
                    type="text"
                    required
                    value={newSchoolForm.cct}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, cct: e.target.value })}
                    placeholder="Ej. 09PPR8800M"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono uppercase outline-none focus:border-indigo-500 font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Planteles Iniciales</label>
                  <select
                    value={newSchoolForm.campusesCount}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, campusesCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500 font-bold"
                  >
                    <option value="1">1 Plantel (Primaria)</option>
                    <option value="2">2 Planteles (Primaria y Secundaria)</option>
                    <option value="3">3 Planteles (Primaria, Secundaria, Preparatoria)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Lema o Tagline Institucional</label>
                <input
                  type="text"
                  value={newSchoolForm.tagline}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, tagline: e.target.value })}
                  placeholder="Ej. Formando líderes con valores y tecnología"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Director / Coordinador General</label>
                  <input
                    type="text"
                    value={newSchoolForm.coordinatorName}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, coordinatorName: e.target.value })}
                    placeholder="Ej. Dr. Fernando Morales"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-bold block mb-1">Teléfono Institucional</label>
                  <input
                    type="text"
                    value={newSchoolForm.phone}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, phone: e.target.value })}
                    placeholder="Ej. 55-1234-5678"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Dirección Principal</label>
                <input
                  type="text"
                  value={newSchoolForm.address}
                  onChange={(e) => setNewSchoolForm({ ...newSchoolForm, address: e.target.value })}
                  placeholder="Ej. Av. Universidad 1200, Col. Del Valle, CDMX"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Logotipo Institucional (URL o Subir)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSchoolForm.logoUrl}
                    onChange={(e) => setNewSchoolForm({ ...newSchoolForm, logoUrl: e.target.value })}
                    placeholder="https://... o sube una imagen"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-white/10 flex items-center gap-1 cursor-pointer">
                    <ImageIcon className="h-4 w-4" />
                    <span>Subir</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewSchoolForm(prev => ({ ...prev, logoUrl: reader.result as string }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300">
                🚀 Se crearán automáticamente los planteles iniciales, aranceles por nivel, catálogo curricular y bases de datos aisladas para esta institución.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddSchoolModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Crear Institución & Desplegar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 10: ADMINISTRACIÓN Y DETALLE COMPLETO DEL PLANTEL (CLICK EN TARJETA) */}
      {selectedCampusDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto flex flex-col">
            
            {/* Encabezado del Plantel */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 shrink-0">
                  <School className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-white">{selectedCampusDetail.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      selectedCampusDetail.level === 'secundaria'
                        ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                        : selectedCampusDetail.level === 'preparatoria'
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                        : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    }`}>
                      NIVEL {selectedCampusDetail.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" />
                      {selectedCampusDetail.address || 'Domicilio Oficial del Plantel'}
                    </span>
                    {selectedCampusDetail.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="h-3.5 w-3.5 text-slate-500" />
                        {selectedCampusDetail.phone}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingCampusForm({
                      id: selectedCampusDetail.id,
                      name: selectedCampusDetail.name,
                      level: selectedCampusDetail.level,
                      address: selectedCampusDetail.address || '',
                      phone: selectedCampusDetail.phone || ''
                    });
                    setShowEditCampusModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit3 className="h-3.5 w-3.5 text-amber-400" /> Editar Plantel
                </button>
                <button
                  onClick={() => setSelectedCampusDetail(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Pestañas de Navegación Interna del Plantel */}
            <div className="flex items-center gap-2 border-b border-white/5 pb-2">
              <button
                onClick={() => setCampusDetailTab('grupos')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  campusDetailTab === 'grupos'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Layers className="h-4 w-4" /> Grupos & Grados ({
                  schoolGroups.filter(g => g.campus_name?.toLowerCase() === selectedCampusDetail.name.toLowerCase()).length || selectedCampusDetail.grades.length
                })
              </button>

              <button
                onClick={() => setCampusDetailTab('alumnos')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  campusDetailTab === 'alumnos'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <GraduationCap className="h-4 w-4" /> Alumnos Matriculados ({
                  schoolStudents.filter(s => s.campus_name?.toLowerCase() === selectedCampusDetail.name.toLowerCase()).length
                })
              </button>

              <button
                onClick={() => setCampusDetailTab('profesores')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  campusDetailTab === 'profesores'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Users className="h-4 w-4" /> Plantilla Docente ({
                  schoolTeachers.filter(t => t.campus_name?.toLowerCase() === selectedCampusDetail.name.toLowerCase() || t.campus_name === 'Todos los Planteles').length
                })
              </button>

              <button
                onClick={() => setCampusDetailTab('config')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  campusDetailTab === 'config'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShieldCheck className="h-4 w-4" /> Configuración Sede
              </button>
            </div>

            {/* TAB CONTENIDO 1: GRUPOS & GRADOS */}
            {campusDetailTab === 'grupos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Aulas y Grupos Escolares en {selectedCampusDetail.name}
                  </span>
                  <button
                    onClick={() => {
                      setNewGroupForm({
                        name: 'B',
                        grade: selectedCampusDetail.grades[0] || '1º'
                      });
                      setShowAddGroupModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Agregar Nuevo Grupo
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                  {selectedCampusDetail.grades.map(grade => {
                    const gradeStudents = schoolStudents.filter(s => s.campus_name?.toLowerCase() === selectedCampusDetail.name.toLowerCase() && s.grade === grade);

                    return (
                      <div key={grade} className="p-4 rounded-2xl bg-slate-950 border border-white/10 hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-3 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-sm font-black text-white block">{grade} de {selectedCampusDetail.level === 'primaria' ? 'Primaria' : selectedCampusDetail.level === 'secundaria' ? 'Secundaria' : 'Preparatoria'}</span>
                            <span className="text-[11px] font-mono text-indigo-400 font-bold">Grupo "A" · Salón 10{grade.replace('º', '')}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Activo
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400 font-bold">Matrícula:</span>
                            <span className="text-white font-black">{gradeStudents.length} Alumnos</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-indigo-500 h-full rounded-full transition-all"
                              style={{ width: `${Math.min(100, (gradeStudents.length / 30) * 100)}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <button
                            onClick={() => {
                              setNewStudentForm(prev => ({
                                ...prev,
                                campus_name: selectedCampusDetail.name,
                                level: selectedCampusDetail.level as any,
                                grade: grade
                              }));
                              setShowAddStudentModal(true);
                            }}
                            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="h-3 w-3" /> Inscribir Alumno
                          </button>

                          <button
                            onClick={() => {
                              setCampusDetailTab('alumnos');
                              setCampusSearchStudent(grade);
                            }}
                            className="text-[11px] font-bold text-slate-400 hover:text-white cursor-pointer"
                          >
                            Ver Lista →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENIDO 2: ALUMNOS DEL PLANTEL */}
            {campusDetailTab === 'alumnos' && (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-white/10">
                  <div className="relative flex-1 min-w-[220px]">
                    <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={campusSearchStudent}
                      onChange={(e) => setCampusSearchStudent(e.target.value)}
                      placeholder="Buscar alumnos en este plantel por nombre, CURP o grado..."
                      className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setNewStudentForm(prev => ({
                        ...prev,
                        campus_name: selectedCampusDetail.name,
                        level: selectedCampusDetail.level as any
                      }));
                      setShowAddStudentModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Inscribir Alumno en {selectedCampusDetail.name}
                  </button>
                </div>

                <div className="bg-slate-950 border border-white/10 rounded-2xl overflow-hidden shadow-xl max-h-[350px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-white/10">
                      <tr>
                        <th className="p-3">Alumno</th>
                        <th className="p-3">Grado</th>
                        <th className="p-3">CURP / Matrícula</th>
                        <th className="p-3 text-center">Beca</th>
                        <th className="p-3 text-center">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      {schoolStudents
                        .filter(s => s.campus_name?.toLowerCase() === selectedCampusDetail.name.toLowerCase())
                        .filter(s => {
                          const fullName = `${s.first_name} ${s.last_name_1}`.toLowerCase();
                          const q = campusSearchStudent.toLowerCase();
                          return fullName.includes(q) || (s.curp && s.curp.toLowerCase().includes(q)) || (s.grade && s.grade.toLowerCase().includes(q));
                        })
                        .map(st => (
                          <tr key={st.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-3">
                              <div className="font-bold text-white">{st.first_name} {st.last_name_1} {st.last_name_2 || ''}</div>
                              <span className="text-[10px] text-slate-400">{st.email || 'Sin correo asignado'}</span>
                            </td>
                            <td className="p-3 font-bold text-indigo-400">{st.grade}</td>
                            <td className="p-3 font-mono text-[11px] text-slate-400">{st.curp || st.id}</td>
                            <td className="p-3 text-center">
                              {st.scholarship_percentage ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  {st.scholarship_percentage}% Beca
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-500">Regular</span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                                Activo
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB CONTENIDO 3: PROFESORES DEL PLANTEL */}
            {campusDetailTab === 'profesores' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    Docentes asignados a {selectedCampusDetail.name}
                  </span>
                  <button
                    onClick={() => {
                      setNewTeacherForm(prev => ({
                        ...prev,
                        campus_name: selectedCampusDetail.name
                      }));
                      setShowAddTeacherModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" /> + Asignar Nuevo Profesor
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {schoolTeachers
                    .filter(t => t.campus_name?.toLowerCase() === selectedCampusDetail.name.toLowerCase() || t.campus_name === 'Todos los Planteles')
                    .map(teacher => (
                      <div key={teacher.id} className="p-4 rounded-2xl bg-slate-950 border border-white/10 flex flex-col justify-between gap-3 shadow-lg">
                        <div className="flex items-start justify-between">
                          <div>
                            <h5 className="text-sm font-black text-white">{teacher.first_name} {teacher.last_name}</h5>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Mail className="h-3 w-3 text-slate-500" /> {teacher.email}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {teacher.campus_name || 'Plantel Asignado'}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
                          <span className="text-[11px] font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded-md">
                            Clave: {teacher.temporary_password || '008805'}
                          </span>
                          <span className="text-[10px] text-emerald-400 font-semibold">● Activo en Ciclo 2026</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB CONTENIDO 4: CONFIGURACIÓN DEL PLANTEL */}
            {campusDetailTab === 'config' && (
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-slate-950 border border-white/10 space-y-4 text-xs">
                  <h4 className="text-sm font-black text-white">Parámetros Operativos del Plantel</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Nombre del Plantel</label>
                      <input
                        type="text"
                        disabled
                        value={selectedCampusDetail.name}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 font-bold block mb-1">Nivel Educativo</label>
                      <input
                        type="text"
                        disabled
                        value={`Nivel ${selectedCampusDetail.level.toUpperCase()}`}
                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-200 uppercase font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Dirección Oficial</label>
                    <input
                      type="text"
                      disabled
                      value={selectedCampusDetail.address || 'Ciudad de México'}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-bold block mb-1">Teléfono</label>
                    <input
                      type="text"
                      disabled
                      value={selectedCampusDetail.phone || '55-4160-8800'}
                      className="w-full bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-slate-300 font-mono"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setEditingCampusForm({
                          id: selectedCampusDetail.id,
                          name: selectedCampusDetail.name,
                          level: selectedCampusDetail.level,
                          address: selectedCampusDetail.address || '',
                          phone: selectedCampusDetail.phone || ''
                        });
                        setShowEditCampusModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow cursor-pointer flex items-center gap-1.5"
                    >
                      <Edit3 className="h-4 w-4" /> Editar Datos del Plantel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 11: ALTA DE NUEVO PLANTEL */}
      {showAddCampusModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-400" /> Alta de Nuevo Plantel
              </h3>
              <button onClick={() => setShowAddCampusModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateCampus} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nombre del Plantel *</label>
                <input
                  type="text"
                  required
                  value={newCampusForm.name}
                  onChange={(e) => setNewCampusForm({ ...newCampusForm, name: e.target.value })}
                  placeholder="Ej. Primaria Campestre, Campus Sur..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Nivel Educativo *</label>
                <select
                  value={newCampusForm.level}
                  onChange={(e) => setNewCampusForm({ ...newCampusForm, level: e.target.value as any })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                >
                  <option value="primaria">Primaria (1º a 6º de Primaria)</option>
                  <option value="secundaria">Secundaria (1º a 3º de Secundaria)</option>
                  <option value="preparatoria">Preparatoria / Bachillerato (1º a 6º Semestre)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Dirección del Plantel</label>
                <input
                  type="text"
                  value={newCampusForm.address}
                  onChange={(e) => setNewCampusForm({ ...newCampusForm, address: e.target.value })}
                  placeholder="Ej. Av. De las Rosas 500, CDMX"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Teléfono</label>
                <input
                  type="text"
                  value={newCampusForm.phone}
                  onChange={(e) => setNewCampusForm({ ...newCampusForm, phone: e.target.value })}
                  placeholder="Ej. 55-4160-8800"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddCampusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Crear Plantel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 12: ALTA DE NUEVO GRUPO EN PLANTEL */}
      {showAddGroupModal && selectedCampusDetail && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Layers className="h-5 w-5 text-indigo-400" /> Crear Grupo
              </h3>
              <button onClick={() => setShowAddGroupModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 text-[11px] text-slate-300">
                Plantel: <strong className="text-white">{selectedCampusDetail.name}</strong>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Grado Escolar *</label>
                <select
                  value={newGroupForm.grade}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, grade: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-indigo-500"
                >
                  {selectedCampusDetail.grades.map(g => (
                    <option key={g} value={g}>{g} de Grado</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Letra / Identificador de Grupo *</label>
                <input
                  type="text"
                  required
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm({ ...newGroupForm, name: e.target.value.toUpperCase() })}
                  placeholder="Ej. B, C, D..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-indigo-500 uppercase"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddGroupModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black shadow-lg cursor-pointer"
                >
                  Crear Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 13: EDICIÓN DE DATOS DEL PLANTEL */}
      {showEditCampusModal && (
        <div className="fixed inset-0 z-[60] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-amber-400" /> Editar Plantel
              </h3>
              <button onClick={() => setShowEditCampusModal(false)} className="text-slate-400 hover:text-white text-xs font-bold cursor-pointer">✕ Cerrar</button>
            </div>

            <form onSubmit={handleUpdateCampus} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-bold block mb-1">Nombre del Plantel *</label>
                <input
                  type="text"
                  required
                  value={editingCampusForm.name}
                  onChange={(e) => setEditingCampusForm({ ...editingCampusForm, name: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-bold outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Dirección</label>
                <input
                  type="text"
                  value={editingCampusForm.address}
                  onChange={(e) => setEditingCampusForm({ ...editingCampusForm, address: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-bold block mb-1">Teléfono</label>
                <input
                  type="text"
                  value={editingCampusForm.phone}
                  onChange={(e) => setEditingCampusForm({ ...editingCampusForm, phone: e.target.value })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2 text-white font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowEditCampusModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECIBO DIGITAL OFICIAL DE NÓMINA INSTITUCIONAL */}
      {selectedPayrollRecordForStub && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 print:p-0">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto print:bg-white print:text-black print:border-none print:shadow-none print:max-h-none print:p-8">
            
            {/* Encabezado del Recibo */}
            <div className="flex items-start justify-between border-b border-white/10 print:border-black/20 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md print:border print:border-black">
                  <Building2 className="h-6 w-6 text-white print:text-black" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white print:text-black">
                    {currentSchool?.name || schoolSettings.name}
                  </h3>
                  <p className="text-xs text-slate-400 print:text-slate-600">
                    CCT: <strong className="text-slate-300 print:text-black font-mono">{currentSchool?.cct || schoolSettings.cct}</strong> · RFC: <strong className="text-slate-300 print:text-black font-mono">UPJ260115-R89</strong>
                  </p>
                  <p className="text-[10px] text-slate-500 print:text-slate-600">
                    Régimen de Personas Morales con Fines No Lucrativos · Comprobante Interno de Nómina
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-purple-500/20 text-purple-300 print:text-black border border-purple-500/30 print:border-black block mb-1">
                  {selectedPayrollRecordForStub.receipt_folio || 'REC-NOM-2026-0901'}
                </span>
                <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                  {selectedPayrollRecordForStub.payment_period}
                </span>
                <span className="text-[9px] text-emerald-400 print:text-emerald-700 font-bold block">
                  {selectedPayrollRecordForStub.status === 'pagado' ? '✓ DISPERSADO POR SPEI' : '⏳ PENDIENTE DE DISPERSIÓN'}
                </span>
              </div>
            </div>

            {/* Ficha del Colaborador */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-white/5 print:bg-slate-50 print:border-black/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Colaborador</span>
                <strong className="text-white print:text-black text-sm">{selectedPayrollRecordForStub.employee_name}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Puesto / Cargo</span>
                <span className="text-slate-300 print:text-black font-medium">{selectedPayrollRecordForStub.position_title}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Departamento / Campus</span>
                <span className="text-slate-300 print:text-black font-medium">{selectedPayrollRecordForStub.campus_name || selectedPayrollRecordForStub.department}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">RFC</span>
                <span className="text-slate-300 print:text-black font-mono">{selectedPayrollRecordForStub.rfc || 'No capturado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">CURP</span>
                <span className="text-slate-300 print:text-black font-mono">{selectedPayrollRecordForStub.curp || 'No capturado'}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-bold block">Institución Bancaria & CLABE</span>
                <span className="text-slate-300 print:text-black font-mono">
                  {selectedPayrollRecordForStub.bank_name || 'BBVA'} · {selectedPayrollRecordForStub.account_clabe ? selectedPayrollRecordForStub.account_clabe.substring(0, 8) + '...' : 'Pendiente'}
                </span>
              </div>
            </div>

            {/* Desglose de Percepciones y Deducciones (2 Columnas) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Percepciones */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-emerald-500/20 print:border-black/20 space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                  <span className="font-bold text-emerald-400 print:text-emerald-800 uppercase text-[11px] flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5" /> Percepciones
                  </span>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono">Importe</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-slate-300 print:text-black">
                    <span>001 - Sueldo Base Quincenal</span>
                    <span className="font-mono">${(selectedPayrollRecordForStub.base_salary || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {selectedPayrollRecordForStub.bonuses > 0 && (
                    <div className="flex items-center justify-between text-emerald-300 print:text-emerald-700">
                      <span>038 - Bonos Pedagógicos / Desempeño</span>
                      <span className="font-mono">+${selectedPayrollRecordForStub.bonuses.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between font-bold text-white print:text-black">
                  <span>Total Percepciones:</span>
                  <span className="font-mono text-emerald-400 print:text-emerald-800">
                    ${((selectedPayrollRecordForStub.base_salary || 0) + (selectedPayrollRecordForStub.bonuses || 0)).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Deducciones */}
              <div className="p-4 rounded-2xl bg-slate-950/50 border border-rose-500/20 print:border-black/20 space-y-2">
                <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                  <span className="font-bold text-rose-400 print:text-rose-800 uppercase text-[11px] flex items-center gap-1.5">
                    <CreditCard className="h-3.5 w-3.5" /> Deducciones & Retenciones
                  </span>
                  <span className="text-[10px] text-slate-400 print:text-slate-600 font-mono">Importe</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-slate-300 print:text-black">
                    <span>001 - Retención de Impuestos (ISR)</span>
                    <span className="font-mono text-rose-400 print:text-rose-700">
                      -${((selectedPayrollRecordForStub.deductions || 0) * 0.65).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300 print:text-black">
                    <span>002 - Aportación IMSS / Seguridad Social</span>
                    <span className="font-mono text-rose-400 print:text-rose-700">
                      -${((selectedPayrollRecordForStub.deductions || 0) * 0.35).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                <div className="pt-3 border-t border-white/5 flex items-center justify-between font-bold text-white print:text-black">
                  <span>Total Retenciones:</span>
                  <span className="font-mono text-rose-400 print:text-rose-800">
                    -${(selectedPayrollRecordForStub.deductions || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Sueldo Neto a Dispersar */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-emerald-950/20 to-slate-950 border border-emerald-500/30 print:bg-slate-100 print:border-black/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
                  Importe Neto a Recibir
                </span>
                <div className="text-2xl font-black text-emerald-400 print:text-emerald-900 font-mono">
                  ${(selectedPayrollRecordForStub.net_salary || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </div>
                <p className="text-[10px] text-slate-400 print:text-slate-600 mt-0.5">
                  Método de Pago: {selectedPayrollRecordForStub.payment_method || 'SPEI / Transferencia Bancaria'}
                </p>
              </div>

              {selectedPayrollRecordForStub.notes && (
                <div className="text-right sm:max-w-xs">
                  <span className="text-[10px] font-bold text-purple-300 print:text-purple-800 block">Observaciones Pedagógicas:</span>
                  <span className="text-[11px] text-slate-300 print:text-black italic">{selectedPayrollRecordForStub.notes}</span>
                </div>
              )}
            </div>

            {/* Cadena Digital & Sello Institucional */}
            <div className="p-3 rounded-xl bg-slate-950 border border-white/5 print:border-black/10 text-[9px] font-mono text-slate-400 print:text-slate-600 space-y-1">
              <div>
                <strong className="text-slate-300 print:text-black">Cadena de Certificación Digital Institucional:</strong> ||1.1|{selectedPayrollRecordForStub.receipt_folio || 'REC-NOM-2026-0901'}|{selectedPayrollRecordForStub.payment_date || new Date().toISOString()}|{selectedPayrollRecordForStub.net_salary}|UPJ260115-R89||
              </div>
              <div className="truncate">
                <strong className="text-slate-300 print:text-black">Sello Digital:</strong> aB9xK89mZ1pQ4vL72d9X8Y7w1m3k8qL0p9Z1w2e3r4t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="h-4 w-4 text-emerald-400" /> Imprimir Recibo
              </button>

              <button
                type="button"
                onClick={() => setSelectedPayrollRecordForStub(null)}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL: AJUSTAR COMPENSACIONES Y SUELDO (DUEÑO DE EMPRESA) */}
      {selectedPayrollRecordForAdjust && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Ajustar Sueldo y Bonos</h3>
                  <p className="text-xs text-slate-400">
                    Colaborador: <strong className="text-slate-200">{selectedPayrollRecordForAdjust.employee_name}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayrollRecordForAdjust(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustSalary} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Sueldo Base Quincenal ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={adjustSalaryForm.base_salary}
                  onChange={(e) => setAdjustSalaryForm({ ...adjustSalaryForm, base_salary: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Bonos Pedagógicos / Desempeño ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={adjustSalaryForm.bonuses}
                  onChange={(e) => setAdjustSalaryForm({ ...adjustSalaryForm, bonuses: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Retenciones y Deducciones de Ley ($ MXN)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={adjustSalaryForm.deductions}
                  onChange={(e) => setAdjustSalaryForm({ ...adjustSalaryForm, deductions: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-white font-mono text-sm outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">
                  Notas / Justificación del Ajuste
                </label>
                <textarea
                  rows={2}
                  value={adjustSalaryForm.notes}
                  onChange={(e) => setAdjustSalaryForm({ ...adjustSalaryForm, notes: e.target.value })}
                  placeholder="Ej: Bono otorgado por metas alcanzadas en NEM 2024..."
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-slate-200 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Cálculo en Vivo del Sueldo Neto */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Nuevo Sueldo Neto a Dispersar:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">
                    ${Math.max(0, adjustSalaryForm.base_salary + adjustSalaryForm.bonuses - adjustSalaryForm.deductions).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 text-right">
                  Base (${adjustSalaryForm.base_salary}) + Bono (${adjustSalaryForm.bonuses}) - Retención (${adjustSalaryForm.deductions})
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedPayrollRecordForAdjust(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-lg cursor-pointer transition-all hover:scale-102"
                >
                  Guardar Compensaciones
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Input oculto para cambio de logotipo de colegios existentes */}
      <input
        type="file"
        ref={schoolLogoFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (editingSchoolLogoId) {
            handleSchoolLogoUpload(e, editingSchoolLogoId);
            setEditingSchoolLogoId(null);
          }
        }}
      />

      {/* Modal de Confirmación para Eliminar Alumno en Admin / Super Usuario */}
      {studentToDeleteAdmin && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Eliminar Alumno del Sistema
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Acción autorizada de Super Usuario
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-black text-slate-900 text-sm">
                {studentToDeleteAdmin.first_name} {studentToDeleteAdmin.last_name_1} {studentToDeleteAdmin.last_name_2 || ''}
              </p>
              <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500 font-mono">
                <span>Matrícula: {studentToDeleteAdmin.enrollment_id || 'S/N'}</span>
                <span>CURP: {studentToDeleteAdmin.curp || 'S/N'}</span>
                <span>Grado: {studentToDeleteAdmin.grade}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="leading-tight">
                <strong>Registro de Auditoría:</strong> Esta baja se guardará de forma inmediata e inmutable en el historial de <strong>Super Usuario</strong> con la <strong>fecha y hora exacta</strong> del retiro.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Motivo de la baja:
              </label>
              <select
                value={adminDeleteReason}
                onChange={(e) => setAdminDeleteReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Baja administrativa directa por Super Usuario">Baja administrativa directa por Super Usuario</option>
                <option value="Traslado de colegio / Solicitud familiar">Traslado de colegio / Solicitud familiar</option>
                <option value="Cambio de residencia o ciudad">Cambio de residencia o ciudad</option>
                <option value="Egreso escolar / Fin de ciclo">Egreso escolar / Fin de ciclo</option>
                <option value="Falta de documentación oficial">Falta de documentación oficial</option>
                <option value="Otro motivo justificado">Otro motivo justificado</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStudentToDeleteAdmin(null)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = studentToDeleteAdmin;
                  const operator = {
                    id: user?.id || 'usr-super',
                    name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Super Usuario',
                    role: (user?.role as UserRole) || 'superadmin',
                    email: user?.email || 'superusuario@iskool.edu.mx'
                  };
                  deleteStudent(target.id, {
                    reason: adminDeleteReason,
                    operatorUser: operator
                  });
                  setStudentToDeleteAdmin(null);
                  showToast(`✅ Alumno ${target.first_name} ${target.last_name_1} eliminado del sistema. Registro de auditoría guardado.`);
                }}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirmar Baja y Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
