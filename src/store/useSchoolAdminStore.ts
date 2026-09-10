import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SchoolSettings, DetailedStudent, Group, ClassSchedule, Attendance, ParentMessage, Subject, UserProfile, Campus, TuitionPricing, FamilyBillingRecord, Institution, SchoolGovernanceSettings, RestrictedTopicItem, DirectorLimitsSettings, ROLE_HIERARCHY_LEVEL, canManageTargetRole, StaffPayrollRecord, isPlatformSuperUser, resolveEffectiveSchoolId, StudentDeletionAuditLog, UserRole } from '../types';
export { resolveEffectiveSchoolId, isPlatformSuperUser } from '../types';
import { DETAILED_STUDENTS_SEED, GROUPS_SEED, SCHEDULES_SEED, ATTENDANCE_SEED, PARENT_MESSAGES_SEED, TEACHERS_LIST_SEED, SUBJECTS_SEED, CAMPUSES_SEED, TUITION_PRICINGS_SEED, BILLING_RECORDS_SEED, INSTITUTIONS_SEED, STAFF_USERS_SEED, DEFAULT_GOVERNANCE_SETTINGS, DEFAULT_DIRECTOR_LIMITS, STAFF_PAYROLL_SEED } from './seeds';
import { useStudentStore } from './useStudentStore';
import { supabase } from '@/lib/supabaseClient';

export const generateRandomPassword = (length = 6): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const getTuitionFeeForStudent = (
  level: string, 
  grade: string, 
  tuitionPricings: TuitionPricing[] = TUITION_PRICINGS_SEED
): number => {
  const lvlLower = (level || '').toLowerCase();
  const gradeNum = parseInt(grade || '1');

  if (lvlLower.includes('primaria')) {
    if (gradeNum >= 4) {
      const alta = tuitionPricings.find(p => p.level === 'primaria_alta');
      return alta?.monthly_fee || 3450.00;
    } else {
      const baja = tuitionPricings.find(p => p.level === 'primaria_baja');
      return baja?.monthly_fee || 3200.00;
    }
  }
  if (lvlLower.includes('secundaria')) {
    const sec = tuitionPricings.find(p => p.level === 'secundaria');
    return sec?.monthly_fee || 3800.00;
  }
  const prep = tuitionPricings.find(p => p.level === 'preparatoria');
  return prep?.monthly_fee || 4100.00;
};

const mapGroupIdToUuid = (id: string): string => {
  if (isUuid(id)) return id;
  if (id === 'grp-pb-a' || id === 'grp-jar-1a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e11';
  if (id === 'grp-pa-a' || id === 'grp-jar-4a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e22';
  if (id === 'grp-sec-a' || id === 'grp-sec-2a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e33';
  if (id === 'grp-prep-a' || id === 'grp-sec-3a') return 'a00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e44';
  
  let hash1 = 0;
  let hash2 = 0;
  for (let i = 0; i < id.length; i++) {
    hash1 = id.charCodeAt(i) + ((hash1 << 5) - hash1);
    hash2 = id.charCodeAt(id.length - 1 - i) + ((hash2 << 5) - hash2);
  }
  let hex = '';
  for (let i = 0; i < 4; i++) {
    hex += ('00' + ((hash1 >> (i * 8)) & 0xff).toString(16)).slice(-2);
  }
  for (let i = 0; i < 2; i++) {
    hex += ('00' + ((hash2 >> (i * 8)) & 0xff).toString(16)).slice(-2);
  }
  return 'a00a0eeb-9c0b-4ef8-bb6d-' + hex;
};

// ==========================================
// FUNCIONES DE PARTICIONADO Y AISLAMIENTO ESCOLAR (MULTI-COLEGIO)
// ==========================================

export const getSchoolCampuses = (campusesList: Campus[], schoolId: string | null): Campus[] => {
  const allCampuses = (campusesList && campusesList.length > 0) ? campusesList : CAMPUSES_SEED;
  if (!schoolId) return allCampuses;

  if (schoolId === 'sch-jjrosseau') {
    const list = allCampuses.filter(c => c.school_id === 'sch-jjrosseau' || (!c.school_id && (c.name === 'Primaria Jardines' || c.name === 'Primaria Torres' || c.name === 'Secundaria Torres')));
    if (list.length > 0) return list;
    return CAMPUSES_SEED.filter(c => c.school_id === 'sch-jjrosseau');
  }

  if (schoolId === 'sch-test-case') {
    const list = allCampuses.filter(c => c.school_id === 'sch-test-case' || c.name.toLowerCase().includes('laboratorio') || c.name.toLowerCase().includes('demo'));
    if (list.length > 0) return list;
    return CAMPUSES_SEED.filter(c => c.school_id === 'sch-test-case');
  }

  return allCampuses.filter(c => c.school_id === schoolId);
};

export const getSchoolStudents = (studentsList: DetailedStudent[], schoolId: string | null, schoolCampuses?: Campus[]): DetailedStudent[] => {
  let allStudents = (studentsList && studentsList.length > 0) ? studentsList : DETAILED_STUDENTS_SEED;

  // Reconciliación determinista: si la lista en memoria/cache tiene menos alumnos que el catálogo oficial DETAILED_STUDENTS_SEED,
  // fusionar los alumnos faltantes para garantizar que los expedientes de prueba y producción nunca queden truncados por cachés antiguos.
  if (allStudents.length < DETAILED_STUDENTS_SEED.length) {
    const existingIds = new Set(allStudents.map(s => s.id));
    const missing = DETAILED_STUDENTS_SEED.filter(s => !existingIds.has(s.id));
    allStudents = [...allStudents, ...missing];
  }

  // Sincronizar datos clínicos, becas y campos base en caso de cachés locales parciales
  const seedMap = new Map(DETAILED_STUDENTS_SEED.map(s => [s.id, s]));
  allStudents = allStudents.map(s => {
    const seed = seedMap.get(s.id);
    if (seed) {
      return {
        ...s,
        medical_notes: (!s.medical_notes || s.medical_notes.includes('Ningun') || s.medical_notes.includes('ningun'))
          ? (seed.medical_notes || s.medical_notes)
          : s.medical_notes,
        blood_type: s.blood_type || seed.blood_type,
        emergency_contact_name: s.emergency_contact_name || seed.emergency_contact_name,
        emergency_contact_phone: s.emergency_contact_phone || seed.emergency_contact_phone,
        tutor_name: s.tutor_name || seed.tutor_name,
        campus_name: seed.campus_name || s.campus_name,
        campus_id: seed.campus_id || s.campus_id,
        school_id: seed.school_id || s.school_id,
        scholarship_percentage: seed.scholarship_percentage !== undefined 
          ? seed.scholarship_percentage 
          : (s.scholarship_percentage ?? 0),
        scholarship_type: seed.scholarship_type || s.scholarship_type || 'ninguna',
        scholarship_notes: seed.scholarship_notes || s.scholarship_notes || ''
      };
    }
    const pct = s.scholarship_percentage ?? 0;
    return {
      ...s,
      scholarship_percentage: pct,
      scholarship_type: pct > 0 ? (s.scholarship_type || 'academica') : 'ninguna',
      scholarship_notes: pct > 0 ? (s.scholarship_notes || '') : ''
    };
  });

  if (!schoolId) return allStudents;

  // 1. UP Juan Jacobo Rosseau (En CEROS para inicio oficial de Prueba Beta)
  if (schoolId === 'sch-jjrosseau') {
    return allStudents.filter(s => 
      s.school_id === 'sch-jjrosseau' && 
      !s.id.includes('test') && 
      !s.id.startsWith('std-pb') && 
      !s.id.startsWith('std-pa') && 
      !s.id.startsWith('std-tor') && 
      !s.id.startsWith('std-sec') && 
      !s.id.startsWith('std-prep') &&
      !s.id.startsWith('c00a0eeb')
    );
  }

  // 2. Laboratorio Pedagógico & Test Cases (Contenedor de todos los casos de prueba, activos y muestras)
  if (schoolId === 'sch-test-case') {
    return allStudents.filter(s => s.school_id !== 'sch-montessori').map(s => {
      if (s.campus_name === 'Primaria Laboratorio Demo' || s.campus_name === 'Secundaria Laboratorio Demo' || s.campus_name === 'Preparatoria Laboratorio Demo') {
        return s;
      }
      if (s.level === 'preparatoria' || (s.grade || '').includes('Semestre')) {
        return { ...s, campus_name: 'Preparatoria Laboratorio Demo', campus_id: 'cmp-test-prep' };
      }
      if (s.level === 'secundaria') {
        return { ...s, campus_name: 'Secundaria Laboratorio Demo', campus_id: 'cmp-test-sec' };
      }
      return { ...s, campus_name: 'Primaria Laboratorio Demo', campus_id: 'cmp-test-pri' };
    });
  }

  // 3. Otros Colegios (Montessori u otros dados de alta)
  const currentCampuses = schoolCampuses && schoolCampuses.length > 0 ? schoolCampuses : [];
  return allStudents.filter(s => {
    if (s.school_id) return s.school_id === schoolId;
    if (currentCampuses.length > 0) {
      return currentCampuses.some(c => c.name.toLowerCase() === (s.campus_name || '').toLowerCase() || c.id === s.campus_id);
    }
    return false;
  });
};

export const getSchoolTeachers = (teachersList: UserProfile[], schoolId: string | null, schoolCampuses?: Campus[]): UserProfile[] => {
  const allTeachers = (teachersList && teachersList.length > 0) ? teachersList : TEACHERS_LIST_SEED;
  if (!schoolId) return allTeachers;

  // 1. UP Juan Jacobo Rosseau (En CEROS para inicio oficial de Prueba Beta)
  if (schoolId === 'sch-jjrosseau') {
    return allTeachers.filter(t => 
      t.school_id === 'sch-jjrosseau' && 
      !t.id.startsWith('usr-teacher-') &&
      !t.first_name.toLowerCase().includes('demo') &&
      !t.last_name.toLowerCase().includes('demo')
    );
  }

  // 2. Laboratorio Pedagógico & Test Cases (Todos los docentes demo y de prueba)
  if (schoolId === 'sch-test-case') {
    return allTeachers.filter(t => t.school_id !== 'sch-montessori');
  }

  const currentCampuses = schoolCampuses && schoolCampuses.length > 0 ? schoolCampuses : [];
  return allTeachers.filter(t => {
    if (t.school_id) return t.school_id === schoolId;
    if (currentCampuses.length > 0) {
      return currentCampuses.some(c => c.name.toLowerCase() === (t.campus_name || '').toLowerCase() || t.campus_name === 'Todos los Planteles');
    }
    return false;
  });
};

export const getSchoolGroups = (groupsList: Group[], schoolId: string | null, schoolCampuses?: Campus[]): Group[] => {
  const allGroups = (groupsList && groupsList.length > 0) ? groupsList : GROUPS_SEED;
  if (!schoolId) return allGroups;

  if (schoolId === 'sch-test-case') {
    return allGroups.filter(g => g.school_id === 'sch-test-case' || g.id.includes('test') || (g.campus_name || '').toLowerCase().includes('demo') || (g.campus_name || '').toLowerCase().includes('laboratorio'));
  }

  if (schoolId === 'sch-jjrosseau') {
    return allGroups.filter(g => {
      if (g.school_id && g.school_id !== 'sch-jjrosseau' && g.school_id !== 'sch-jjr') return false;
      const isTest = g.id.includes('test') || (g.campus_name || '').toLowerCase().includes('demo') || (g.campus_name || '').toLowerCase().includes('laboratorio');
      const isOther = (g.campus_name || '').toLowerCase().includes('montessori');
      return !isTest && !isOther;
    });
  }

  const currentCampuses = schoolCampuses && schoolCampuses.length > 0 ? schoolCampuses : [];
  return allGroups.filter(g => {
    if (g.school_id) return g.school_id === schoolId;
    if (currentCampuses.length > 0) {
      return currentCampuses.some(c => c.name.toLowerCase() === (g.campus_name || '').toLowerCase() || c.id === g.campus_id);
    }
    return false;
  });
};

export const getSchoolSubjects = (subjectsList: Subject[], schoolId: string | null, schoolCampuses?: Campus[]): Subject[] => {
  const allSubjects = (subjectsList && subjectsList.length > 0) ? subjectsList : SUBJECTS_SEED;
  if (!schoolId) return allSubjects;

  if (schoolId === 'sch-jjrosseau') {
    return allSubjects.filter(sub => sub.school_id === 'sch-jjrosseau');
  }

  if (schoolId === 'sch-test-case') {
    return allSubjects.filter(sub => sub.school_id !== 'sch-montessori');
  }

  const currentCampuses = schoolCampuses && schoolCampuses.length > 0 ? schoolCampuses : [];
  return allSubjects.filter(sub => {
    if (sub.school_id) return sub.school_id === schoolId || (schoolId === 'sch-jjrosseau' && sub.school_id === 'sch-jjr');
    if (currentCampuses.length > 0) {
      return currentCampuses.some(c => c.name.toLowerCase() === (sub.campus_name || '').toLowerCase() || sub.campus_name === 'Todos los Planteles');
    }
    return false;
  });
};

export const getSchoolAttendance = (attendanceList: Attendance[], schoolId: string | null, schoolStudents?: DetailedStudent[]): Attendance[] => {
  const allAttendance = (attendanceList && attendanceList.length > 0) ? attendanceList : ATTENDANCE_SEED;
  if (!schoolId) return allAttendance;

  const studentIds = new Set((schoolStudents || []).map(s => s.id));
  return allAttendance.filter(att => {
    if (att.school_id) return att.school_id === schoolId || (schoolId === 'sch-jjrosseau' && att.school_id === 'sch-jjr');
    if (studentIds.size > 0) return studentIds.has(att.student_id);
    if (schoolId === 'sch-jjrosseau') {
      return !att.student_id.includes('test') && !att.student_id.startsWith('c00a0eeb');
    }
    return true;
  });
};

export const getSchoolBillingRecords = (billingList: FamilyBillingRecord[], schoolId: string | null, schoolStudents?: DetailedStudent[]): FamilyBillingRecord[] => {
  const allRecords = (billingList && billingList.length > 0) ? billingList : BILLING_RECORDS_SEED;
  if (!schoolId) return allRecords;

  const studentIds = new Set((schoolStudents || []).map(s => s.id));
  const filtered = allRecords.filter(rec => {
    // 1. Si el estudiante pertenece a la lista de alumnos del colegio
    if (rec.studentId && studentIds.size > 0 && studentIds.has(rec.studentId)) return true;
    
    // 2. Coincidencia por ID institucional
    if (rec.school_id === schoolId || (schoolId === 'sch-jjrosseau' && (rec.school_id === 'sch-jjr' || rec.school_id === 'sch-test-case'))) {
      return true;
    }

    if (schoolId === 'sch-jjrosseau') {
      return !rec.studentId?.includes('test') && !rec.studentName.toLowerCase().includes('demo');
    }
    return true;
  });

  return filtered.length > 0 ? filtered : allRecords;
};

export const getSchoolTuitionPricings = (pricingsList: TuitionPricing[], schoolId: string | null): TuitionPricing[] => {
  const allPricings = (pricingsList && pricingsList.length > 0) ? pricingsList : TUITION_PRICINGS_SEED;
  if (!schoolId) return allPricings;

  const targetId = schoolId === 'sch-jjr' ? 'sch-jjrosseau' : schoolId;
  const filtered = allPricings.filter(p => p.school_id === targetId || (targetId === 'sch-jjrosseau' && p.school_id === 'sch-jjr'));
  if (filtered.length > 0) return filtered;

  // Fallback institucional: si la institución no cuenta con aranceles configurados aún, devolver catálogo predeterminado
  return [
    {
      id: `prc-${targetId}-pri-baja`,
      school_id: targetId,
      level: 'primaria_baja',
      name: 'Primaria Baja (1º a 3º Grado)',
      description: 'Jornada regular con materias base y talleres formativos iniciales.',
      monthly_fee: 3200.00,
      annual_inscription: 4500.00,
      materials_fee: 1200.00,
      due_day: 10
    },
    {
      id: `prc-${targetId}-pri-alta`,
      school_id: targetId,
      level: 'primaria_alta',
      name: 'Primaria Alta (4º a 6º Grado)',
      description: 'Incluye laboratorio de ciencias, robótica y talleres optativos.',
      monthly_fee: 3450.00,
      annual_inscription: 4800.00,
      materials_fee: 1400.00,
      due_day: 10
    },
    {
      id: `prc-${targetId}-sec`,
      school_id: targetId,
      level: 'secundaria',
      name: 'Secundaria (1º a 3º Grado)',
      description: 'Especialidades técnicas, laboratorio avanzado, robótica y preparación académica.',
      monthly_fee: 3800.00,
      annual_inscription: 5200.00,
      materials_fee: 1600.00,
      due_day: 10
    },
    {
      id: `prc-${targetId}-prep`,
      school_id: targetId,
      level: 'preparatoria',
      name: 'Preparatoria / Bachillerato',
      description: 'Bachillerato general con orientación propedéutica y certificaciones.',
      monthly_fee: 4100.00,
      annual_inscription: 5600.00,
      materials_fee: 1800.00,
      due_day: 10
    }
  ];
};

export const getActiveSchoolIdFromState = (state: { activeSchoolId?: string | null }): string => {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('iskool_session_user') || localStorage.getItem('auth_current_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (u && !isPlatformSuperUser(u) && u.school_id) {
          return u.school_id === 'sch-jjr' ? 'sch-jjrosseau' : u.school_id;
        }
      }
    }
  } catch (e) {}
  if (state.activeSchoolId) {
    return state.activeSchoolId === 'sch-jjr' ? 'sch-jjrosseau' : state.activeSchoolId;
  }
  return 'sch-jjrosseau';
};

export const getSchoolParentMessages = (messagesList: ParentMessage[], schoolId: string | null, schoolStudents?: DetailedStudent[]): ParentMessage[] => {
  const allMessages = (messagesList && messagesList.length > 0) ? messagesList : PARENT_MESSAGES_SEED;
  if (!schoolId) return allMessages;

  const studentIds = new Set((schoolStudents || []).map(s => s.id));
  return allMessages.filter(msg => {
    if (msg.school_id) return msg.school_id === schoolId || (schoolId === 'sch-jjrosseau' && msg.school_id === 'sch-jjr');
    if (studentIds.size > 0) return studentIds.has(msg.student_id);
    return false;
  });
};

export const getSchoolSchedules = (schedulesList: ClassSchedule[], schoolId: string | null, schoolGroups?: Group[]): ClassSchedule[] => {
  const allSchedules = (schedulesList && schedulesList.length > 0) ? schedulesList : SCHEDULES_SEED;
  if (!schoolId) return allSchedules;

  const groupIds = new Set((schoolGroups || []).map(g => g.id));
  return allSchedules.filter(sch => {
    if (sch.school_id) return sch.school_id === schoolId || (schoolId === 'sch-jjrosseau' && sch.school_id === 'sch-jjr');
    if (groupIds.size > 0) return groupIds.has(sch.groupId);
    return false;
  });
};

export const getSchoolStaff = (staffList: UserProfile[], schoolId: string | null): UserProfile[] => {
  const allStaff = (staffList && staffList.length > 0) ? staffList : STAFF_USERS_SEED;
  if (!schoolId) return allStaff;
  return allStaff.filter(u => u.school_id === schoolId || (schoolId === 'sch-jjrosseau' && u.school_id === 'sch-jjr'));
};

export const getSchoolPayroll = (
  payrollList: StaffPayrollRecord[], 
  schoolId: string | null, 
  campusName?: string
): StaffPayrollRecord[] => {
  const allPayroll = (payrollList && payrollList.length > 0) ? payrollList : STAFF_PAYROLL_SEED;
  if (!schoolId) return allPayroll;

  return allPayroll.filter(rec => {
    const matchesSchool = rec.school_id === schoolId || (schoolId === 'sch-jjrosseau' && rec.school_id === 'sch-jjr');
    if (!matchesSchool) return false;
    if (campusName && campusName !== 'all') {
      return (rec.campus_name || '').toLowerCase() === campusName.toLowerCase();
    }
    return true;
  });
};

export const getSchoolGovernance = (governanceMap: Record<string, SchoolGovernanceSettings> | undefined, schoolId: string | null): SchoolGovernanceSettings => {
  if (!schoolId || !governanceMap || !governanceMap[schoolId]) {
    return DEFAULT_GOVERNANCE_SETTINGS;
  }
  return governanceMap[schoolId];
};

export const getDirectorLimits = (limitsMap: Record<string, DirectorLimitsSettings> | undefined, schoolId: string | null): DirectorLimitsSettings => {
  if (!schoolId || !limitsMap || !limitsMap[schoolId]) {
    return DEFAULT_DIRECTOR_LIMITS;
  }
  return limitsMap[schoolId];
};

/**
 * Filtra los registros de auditoría de bajas y alumnos eliminados por colegio eficaz.
 */
export const getSchoolDeletionAuditLogs = (
  logs: StudentDeletionAuditLog[] = [], 
  schoolId?: string | null
): StudentDeletionAuditLog[] => {
  if (!schoolId) return logs || [];
  const targetId = schoolId === 'sch-jjr' ? 'sch-jjrosseau' : schoolId;
  return (logs || []).filter(l => l.school_id === targetId);
};

/**
 * Generador Estricto de Dominios de Correo por Colegio:
 * Garantiza que cualquier cuenta creada pertenezca estrictamente al dominio @(nombre-escuela.edu.mx).
 */
export const getSchoolEmailDomain = (school: { name?: string; website?: string; id?: string } | null | undefined): string => {
  if (!school) return 'colegio.edu.mx';
  
  // 1. Si la institución tiene website con .edu.mx, extraer su host oficial
  if (school.website) {
    try {
      const cleanWeb = school.website.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').trim().toLowerCase();
      if (cleanWeb.endsWith('.edu.mx')) {
        return cleanWeb;
      }
    } catch (e) {}
  }

  // 2. Mapeos específicos por ID conocido
  if (school.id === 'sch-jjrosseau' || (school.name && school.name.toLowerCase().includes('rosseau'))) {
    return 'jjrosseau.edu.mx';
  }
  if (school.id === 'sch-montessori' || (school.name && school.name.toLowerCase().includes('montessori'))) {
    return 'montessoridelvalle.edu.mx';
  }
  if (school.id === 'sch-test-case' || (school.name && school.name.toLowerCase().includes('laboratorio'))) {
    return 'laboratoriopedagogico.edu.mx';
  }

  // 3. Normalizar nombre institucional a slug .edu.mx
  if (school.name) {
    const slug = school.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]/g, '')       // Solo alfanuméricos
      .trim();
    if (slug) {
      return `${slug}.edu.mx`;
    }
  }

  return 'colegio.edu.mx';
};

interface SchoolAdminStoreState {
  institutionsList: Institution[];
  activeSchoolId: string | null; // null = Directorio General Multi-Colegios
  schoolSettings: SchoolSettings;
  campusesList: Campus[];
  detailedStudents: DetailedStudent[];
  studentDeletionAuditLogs: StudentDeletionAuditLog[];
  groupsList: Group[];
  schedulesList: ClassSchedule[];
  subjectsList: Subject[];
  teachersList: UserProfile[];
  attendanceList: Attendance[];
  parentMessages: ParentMessage[];
  tuitionPricings: TuitionPricing[];
  billingRecords: FamilyBillingRecord[];
  staffUsers: UserProfile[];
  staffPayroll: StaffPayrollRecord[];
  schoolGovernance: Record<string, SchoolGovernanceSettings>;
  directorLimits: Record<string, DirectorLimitsSettings>;
  syncError: string | null;

  // Multi-School Actions
  selectSchool: (schoolId: string | null) => void;
  syncUserSchool: (user: UserProfile | null) => void;
  createInstitution: (instData: {
    name: string;
    tagline?: string;
    cct: string;
    logoUrl?: string;
    address?: string;
    phone?: string;
    website?: string;
    coordinatorName?: string;
    campusesCount?: number;
    initialPlanteles?: Array<{ name: string; level: 'primaria' | 'secundaria' | 'preparatoria'; address?: string }>;
  }) => Institution;
  updateInstitution: (schoolId: string, data: Partial<Institution>) => void;
  deleteInstitution: (schoolId: string) => void;

  // Financial and Tuition Actions
  updateTuitionPricing: (levelId: string, data: Partial<TuitionPricing>) => void;
  assignScholarship: (studentId: string, scholarship: { percentage: number; type?: string; notes?: string }) => void;
  recordBillingPayment: (recordId: string, paymentData?: { method?: string; reference?: string; notes?: string }) => void;
  createManualBillingCharge: (charge: Omit<FamilyBillingRecord, 'id' | 'invoiceNumber'>) => FamilyBillingRecord;

  // Staff Payroll Actions (Finanzas & Nóminas del Dueño)
  updatePayrollRecord: (recordId: string, updates: Partial<StaffPayrollRecord>) => void;
  dispersePayrollBatch: (recordIds: string[]) => void;
  addPayrollRecord: (record: Omit<StaffPayrollRecord, 'id'>) => StaffPayrollRecord;
  adjustSalary: (employeeId: string, newBaseSalary: number, bonus: number, deductions: number) => void;

  // Actions
  saveSchoolSettings: (settings: SchoolSettings) => void;
  registerStudent: (studentData: Omit<DetailedStudent, 'id'>) => DetailedStudent;
  addStudent: (studentData: any) => DetailedStudent;
  bulkRegisterStudents: (studentsList: Array<Partial<DetailedStudent>>) => DetailedStudent[];
  generateGroupsForGrade: (level: 'primaria' | 'secundaria' | 'preparatoria', grade: string, groupNames: string[], campusName?: string) => void;
  assignStudentToGroup: (studentId: string, groupId: string) => void;
  createSchedule: (scheduleData: Omit<ClassSchedule, 'id'>) => void;
  deleteSchedule: (scheduleId: string) => Promise<void>;
  createGroup: (groupData: Partial<Group>) => Group;
  updateGroup: (groupId: string, data: Partial<Group>) => void;
  deleteGroup: (groupId: string) => Promise<void>;
  saveAttendanceList: (records: Omit<Attendance, 'id' | 'created_at' | 'registered_by'>[]) => void;
  sendParentMessage: (msg: Omit<ParentMessage, 'id' | 'sent_at' | 'is_read'>) => void;
  replyToParentMessage: (messageId: string, replyText: string) => void;
  markMessageAsRead: (messageId: string) => void;
  createSubject: (subjectData: Omit<Subject, 'id' | 'created_at'>) => void;
  deleteSubject: (subjectId: string) => Promise<void>;
  updateGroupAnnualPlan: (subjectId: string, groupId: string, planData: Partial<import('@/types').GroupAnnualPlan>) => void;
  updateSubjectSyllabus: (subjectId: string, topics: import('@/types').SyllabusTopic[]) => void;
  registerTeacher: (teacherData: Omit<UserProfile, 'id' | 'role' | 'created_at' | 'updated_at'>) => void;
  updateTeacher: (teacherId: string, updatedData: Partial<UserProfile>) => void;
  deleteTeacher: (teacherId: string) => void;

  // Super User Security Actions
  toggleUserBlock: (userId: string, role: 'teacher' | 'student', isBlocked: boolean) => void;
  changeUserPassword: (userId: string, role: 'teacher' | 'student', newPassword?: string) => string;
  incrementTeacherTokens: (teacherId: string, tokensUsed: number) => void;
  
  // Campus Management
  createCampus: (campus: Omit<Campus, 'id' | 'created_at'>) => void;
  updateCampus: (campusId: string, data: Partial<Campus>) => void;
  deleteCampus: (campusId: string) => void;

  updateStudentStatus: (studentId: string, status: 'activo' | 'suspendido' | 'baja') => void;
  deleteStudent: (
    studentId: string, 
    options?: { 
      reason?: string; 
      operatorUser?: { id: string; name: string; role: UserRole; email: string } 
    }
  ) => { success: boolean; auditLog?: StudentDeletionAuditLog };
  updateStudent: (studentId: string, updatedData: Partial<DetailedStudent>) => void;
  addTeacherNote: (studentId: string, note: { id?: string; date: string; note: string; teacher_name: string; parent_reply?: string; replied_at?: string }) => void;
  addBehaviorReport: (studentId: string, report: { id?: string; date: string; description: string; reporter: string; parent_reply?: string; replied_at?: string }) => void;
  deleteBehaviorReport: (studentId: string, index: number) => void;
  deleteTeacherNote: (studentId: string, index: number) => void;

  // Staff and Governance Actions
  registerStaffAccount: (data: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => UserProfile;
  updateStaffAccount: (id: string, data: Partial<UserProfile>) => void;
  deleteStaffAccount: (id: string) => void;
  toggleStaffBlock: (id: string, isBlocked: boolean) => void;
  changeStaffPassword: (id: string, newPassword?: string) => string;
  updateSchoolGovernance: (schoolId: string, settings: Partial<SchoolGovernanceSettings>) => void;
  updateDirectorLimits: (schoolId: string, limits: Partial<DirectorLimitsSettings>) => void;
  addRestrictedTopic: (schoolId: string, topic: Omit<RestrictedTopicItem, 'id' | 'restrictedAt'>) => void;
  removeRestrictedTopic: (schoolId: string, topicId: string) => void;
  
  resetSchoolAdminStore: () => void;
  reconcileSeedsWithStore: () => void;
}

export const applyThemeCssVariables = (themeColors?: { primary: string; secondary: string; accent: string }) => {
  if (typeof window === 'undefined' || typeof document === 'undefined' || !themeColors) return;
  try {
    const root = document.documentElement;
    root.style.setProperty('--color-primary-hsl', themeColors.primary);
    root.style.setProperty('--color-secondary-hsl', themeColors.secondary);
    root.style.setProperty('--color-accent-hsl', themeColors.accent);

    root.style.setProperty('--color-primary', `hsl(${themeColors.primary})`);
    root.style.setProperty('--color-secondary', `hsl(${themeColors.secondary})`);
    root.style.setProperty('--color-accent', `hsl(${themeColors.accent})`);

    root.style.setProperty('--color-brand-primary', `hsl(${themeColors.primary})`);
    root.style.setProperty('--color-brand-secondary', `hsl(${themeColors.secondary})`);
    root.style.setProperty('--color-brand-accent', `hsl(${themeColors.accent})`);

    root.style.setProperty('--brand-primary', `hsl(${themeColors.primary})`);
    root.style.setProperty('--brand-secondary', `hsl(${themeColors.secondary})`);
    root.style.setProperty('--brand-accent', `hsl(${themeColors.accent})`);
  } catch (e) {
    console.warn('Error setting theme CSS variables:', e);
  }
};

let saveSettingsTimeout: NodeJS.Timeout | null = null;

export const INITIAL_DELETION_AUDIT_LOGS_SEED: StudentDeletionAuditLog[] = [
  {
    id: 'audit-del-seed-1',
    student_id: 'std-seed-baja-1',
    student_name: 'Mateo Sandoval Rivas',
    enrollment_id: 'MAT-2026-089',
    curp: 'SARM160512HDFNR03',
    school_id: 'sch-jjrosseau',
    school_name: 'UP Juan Jacobo Rosseau',
    campus_name: 'Primaria Jardines',
    level: 'primaria',
    grade: '4º',
    deleted_at: '2026-09-02T14:32:10.000Z',
    deleted_at_formatted: 'miércoles, 2 de septiembre de 2026, 08:32:10 a. m.',
    deleted_by_id: 'usr-dir-1',
    deleted_by_name: 'Dirección Pedagógica ISkool',
    deleted_by_role: 'director',
    deleted_by_email: 'direccion@jjrosseau.edu.mx',
    reason: 'Cambio de residencia familiar a otro estado',
    previous_status: 'activo'
  }
];

export const useSchoolAdminStore = create<SchoolAdminStoreState>()(
  persist(
    (set, get) => ({
      institutionsList: INSTITUTIONS_SEED,
      activeSchoolId: null,
      schoolSettings: {
        isConfigured: true,
        name: 'UP Juan Jacobo Rosseau',
        website: 'https://jjrosseau.edu.mx',
        logoUrl: '',
        cct: '09PPR2026R',
        address: 'Calzada de los Filósofos 1712, Col. Del Valle, Ciudad de México',
        phone: '55-4160-8800',
        coordinators: ['Lic. Alejandro Valdés', 'Mtra. Patricia Mendoza'],
        teachers: ['Prof. Israel López', 'Profa. María Fernández', 'Prof. Roberto Díaz', 'Profa. Carmen Morales', 'Prof. David Navarrete', 'Profa. Elena Salazar', 'Prof. Fernando Rangel'],
        themeColors: {
          primary: '221 83% 53%',   // Azul Zafiro (Rigor, Confianza, Académico)
          secondary: '268 85% 58%', // Púrpura / Violeta Mágico (Minuto 6:25 - Magia, Exclusividad, IA)
          accent: '158 72% 40%'     // Verde Esmeralda (Crecimiento, Bienestar, Comunidad)
        }
      },
      campusesList: CAMPUSES_SEED,
      detailedStudents: DETAILED_STUDENTS_SEED,
      studentDeletionAuditLogs: INITIAL_DELETION_AUDIT_LOGS_SEED,
      groupsList: GROUPS_SEED,
      schedulesList: SCHEDULES_SEED,
      subjectsList: SUBJECTS_SEED,
      teachersList: TEACHERS_LIST_SEED,
      attendanceList: ATTENDANCE_SEED,
      parentMessages: PARENT_MESSAGES_SEED,
      tuitionPricings: TUITION_PRICINGS_SEED,
      billingRecords: BILLING_RECORDS_SEED,
      staffUsers: STAFF_USERS_SEED,
      staffPayroll: STAFF_PAYROLL_SEED,
      schoolGovernance: {
        'sch-jjrosseau': DEFAULT_GOVERNANCE_SETTINGS,
        'sch-test-case': DEFAULT_GOVERNANCE_SETTINGS,
        'sch-montessori': DEFAULT_GOVERNANCE_SETTINGS
      },
      directorLimits: {
        'sch-jjrosseau': DEFAULT_DIRECTOR_LIMITS,
        'sch-test-case': DEFAULT_DIRECTOR_LIMITS,
        'sch-montessori': DEFAULT_DIRECTOR_LIMITS
      },
      syncError: null,

      syncUserSchool: (user) => {
        if (!user) {
          set({ activeSchoolId: null });
          return;
        }

        // Si es Super Usuario, mantiene su selección manual de colegio (o null para ver el directorio)
        if (isPlatformSuperUser(user)) {
          return;
        }

        // Para cualquier usuario de colegio (dueño, director, cobranza, maestro, alumno):
        // Forzar estrictamente su school_id institucional como activeSchoolId y sincronizar schoolSettings
        const targetSchoolId = user.school_id === 'sch-jjr' ? 'sch-jjrosseau' : (user.school_id || 'sch-jjrosseau');
        set((state) => {
          const inst = (state.institutionsList || []).find(i => i.id === targetSchoolId);
          if (inst && inst.settings) {
            applyThemeCssVariables(inst.settings.themeColors);
            if (state.activeSchoolId === targetSchoolId && state.schoolSettings?.name === inst.settings.name) {
              return state;
            }
            return {
              activeSchoolId: targetSchoolId,
              schoolSettings: inst.settings
            };
          }
          if (state.activeSchoolId === targetSchoolId) return state;
          return { activeSchoolId: targetSchoolId };
        });
      },

      selectSchool: (schoolId) => {
        // Aislamiento Multi-Tenant Estricto:
        // Las cuentas de Dueño hacia abajo NUNCA pueden cambiar ni ver otros colegios ajenos a su school_id.
        try {
          if (typeof localStorage !== 'undefined') {
            const stored = localStorage.getItem('iskool_session_user') || localStorage.getItem('auth_current_user');
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && !isPlatformSuperUser(parsed) && parsed.school_id) {
                schoolId = parsed.school_id === 'sch-jjr' ? 'sch-jjrosseau' : parsed.school_id;
              }
            }
          }
        } catch (e) {}

        set((state) => {
          if (!schoolId) {
            return { activeSchoolId: null };
          }
          const targetId = schoolId === 'sch-jjr' ? 'sch-jjrosseau' : schoolId;
          const inst = (state.institutionsList || []).find(i => i.id === targetId);
          if (inst && inst.settings) {
            applyThemeCssVariables(inst.settings.themeColors);
            return {
              activeSchoolId: targetId,
              schoolSettings: inst.settings
            };
          }
          return { activeSchoolId: targetId };
        });
      },

      createInstitution: (instData) => {
        const newId = `sch-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const initialCampusesCount = instData.initialPlanteles?.length || instData.campusesCount || 2;
        
        const newInstitution: Institution = {
          id: newId,
          name: instData.name.trim(),
          tagline: instData.tagline || 'Institución Educativa Oficial',
          cct: instData.cct.trim(),
          logoUrl: instData.logoUrl || '',
          isTestCase: false,
          status: 'active',
          createdAt: new Date().toISOString(),
          address: instData.address || 'Ciudad de México',
          phone: instData.phone || '55-0000-0000',
          website: instData.website || '',
          coordinatorName: instData.coordinatorName || 'Dirección General',
          campusesCount: initialCampusesCount,
          studentsCount: 0,
          teachersCount: 1,
          aiTokensConsumed: 0,
          currency: 'MXN',
          settings: {
            isConfigured: true,
            name: instData.name.trim(),
            website: instData.website || '',
            logoUrl: instData.logoUrl || '',
            cct: instData.cct.trim(),
            address: instData.address || 'Ciudad de México',
            phone: instData.phone || '55-0000-0000',
            coordinators: [instData.coordinatorName || 'Dirección General'],
            teachers: ['Prof. Coordinador Inicial'],
            themeColors: {
              primary: '221 83% 53%',
              secondary: '268 85% 58%',
              accent: '158 72% 40%'
            }
          }
        };

        // Crear planteles iniciales para el colegio
        const generatedCampuses: Campus[] = (instData.initialPlanteles || [
          { name: `Primaria ${instData.name}`, level: 'primaria' as const, address: instData.address },
          { name: `Secundaria ${instData.name}`, level: 'secundaria' as const, address: instData.address }
        ]).map((p, idx) => ({
          id: `cmp-${newId}-${idx}`,
          school_id: newId,
          name: p.name,
          level: p.level,
          grades: p.level === 'primaria' ? ['1º', '2º', '3º', '4º', '5º', '6º'] : ['1º', '2º', '3º'],
          address: p.address || instData.address,
          phone: instData.phone,
          created_at: new Date().toISOString()
        }));

        set((state) => ({
          institutionsList: [newInstitution, ...(state.institutionsList || [])],
          campusesList: [...generatedCampuses, ...(state.campusesList || [])],
          activeSchoolId: newId,
          schoolSettings: newInstitution.settings!
        }));

        return newInstitution;
      },

      updateInstitution: (schoolId, data) => {
        set((state) => {
          const updated = (state.institutionsList || []).map(inst => {
            if (inst.id === schoolId) {
              const currentSettings = inst.settings || state.schoolSettings;
              const updatedSettings: SchoolSettings = {
                ...currentSettings,
                name: data.name !== undefined ? data.name : (currentSettings.name || inst.name),
                cct: data.cct !== undefined ? data.cct : (currentSettings.cct || inst.cct),
                address: data.address !== undefined ? data.address : (currentSettings.address || inst.address || ''),
                phone: data.phone !== undefined ? data.phone : (currentSettings.phone || inst.phone || ''),
                website: data.website !== undefined ? data.website : (currentSettings.website || inst.website || ''),
                logoUrl: data.logoUrl !== undefined ? data.logoUrl : (currentSettings.logoUrl || inst.logoUrl || ''),
                coordinators: data.coordinatorName !== undefined ? [data.coordinatorName] : (currentSettings.coordinators || ['Dirección General'])
              };

              return {
                ...inst,
                ...data,
                settings: updatedSettings
              };
            }
            return inst;
          });

          // Si es el colegio activo o no hay colegio activo seleccionado, sincronizar schoolSettings
          let updatedSettings = state.schoolSettings;
          if (!state.activeSchoolId || state.activeSchoolId === schoolId) {
            const target = updated.find(i => i.id === schoolId);
            if (target?.settings) {
              updatedSettings = target.settings;
            }
          }

          return {
            institutionsList: updated,
            schoolSettings: updatedSettings
          };
        });
      },

      deleteInstitution: (schoolId) => {
        set((state) => ({
          institutionsList: (state.institutionsList || []).filter(i => i.id !== schoolId),
          activeSchoolId: state.activeSchoolId === schoolId ? null : state.activeSchoolId
        }));
      },

      updateTuitionPricing: (levelId, data) => {
        set((state) => {
          const currentList = (state.tuitionPricings && state.tuitionPricings.length > 0)
            ? state.tuitionPricings
            : TUITION_PRICINGS_SEED;
          const matchFn = (p: TuitionPricing) =>
            p.id === levelId || (p.level === levelId && (!data.school_id || p.school_id === data.school_id));
          const exists = currentList.some(matchFn);
          if (exists) {
            const updated = currentList.map(p => matchFn(p) ? { ...p, ...data } : p);
            return { tuitionPricings: updated };
          } else {
            const newPricing: TuitionPricing = {
              id: levelId,
              school_id: data.school_id || 'sch-test-case',
              level: data.level || 'primaria_baja',
              name: data.name || 'Nivel Educativo',
              description: data.description || '',
              monthly_fee: data.monthly_fee ?? 3200,
              annual_inscription: data.annual_inscription ?? 4500,
              materials_fee: data.materials_fee ?? 1200,
              due_day: data.due_day ?? 10,
              ...data
            };
            return { tuitionPricings: [...currentList, newPricing] };
          }
        });
      },

      assignScholarship: (studentId, scholarship) => {
        set((state) => {
          const student = (state.detailedStudents || []).find(s => s.id === studentId);
          if (!student) return state;

          const updatedStudents = (state.detailedStudents || []).map(s => {
            if (s.id === studentId) {
              return {
                ...s,
                scholarship_percentage: scholarship.percentage,
                scholarship_type: (scholarship.type || 'academica') as any,
                scholarship_notes: scholarship.notes || ''
              };
            }
            return s;
          });

          // Recalcular o actualizar cargos pendientes de este alumno en billingRecords
          const updatedBilling = (state.billingRecords || []).map(rec => {
            if (rec.studentId === studentId && (rec.status === 'pending' || rec.status === 'overdue')) {
              const base = rec.baseAmount || rec.amount;
              const discount = (scholarship.percentage / 100) * base;
              const finalAmount = Math.max(0, base - discount);

              return {
                ...rec,
                baseAmount: base,
                scholarshipPercentage: scholarship.percentage,
                scholarshipType: scholarship.type || 'academica',
                discountAmount: discount,
                amount: finalAmount
              };
            }
            return rec;
          });

          return {
            detailedStudents: updatedStudents,
            billingRecords: updatedBilling
          };
        });
      },

      recordBillingPayment: (recordId, paymentData) => {
        set((state) => {
          const updatedRecords = (state.billingRecords || []).map(rec => {
            if (rec.id === recordId) {
              return {
                ...rec,
                status: 'paid' as const,
                paidAt: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
              };
            }
            return rec;
          });
          return { billingRecords: updatedRecords };
        });
      },

      createManualBillingCharge: (chargeData) => {
        const activeSchool = chargeData.school_id || getActiveSchoolIdFromState(get());
        const newRecord: FamilyBillingRecord = {
          ...chargeData,
          school_id: chargeData.school_id || activeSchool,
          id: `inv-custom-${Date.now()}`,
          invoiceNumber: `COL-2026-${Math.floor(10000 + Math.random() * 90000)}`
        };

        set((state) => ({
          billingRecords: [newRecord, ...(state.billingRecords || [])]
        }));

        return newRecord;
      },

      updatePayrollRecord: (recordId, updates) => {
        set(state => ({
          staffPayroll: (state.staffPayroll || []).map(p => {
            if (p.id === recordId) {
              const base = updates.base_salary !== undefined ? updates.base_salary : p.base_salary;
              const bon = updates.bonuses !== undefined ? updates.bonuses : p.bonuses;
              const ded = updates.deductions !== undefined ? updates.deductions : p.deductions;
              const net = base + bon - ded;
              return {
                ...p,
                ...updates,
                base_salary: base,
                bonuses: bon,
                deductions: ded,
                net_salary: net
              };
            }
            return p;
          })
        }));
      },

      dispersePayrollBatch: (recordIds) => {
        const idSet = new Set(recordIds);
        const now = new Date().toISOString();
        set(state => ({
          staffPayroll: (state.staffPayroll || []).map(p => {
            if (idSet.has(p.id)) {
              const folio = p.receipt_folio || `REC-NOM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
              return {
                ...p,
                status: 'pagado' as const,
                payment_date: now,
                receipt_folio: folio
              };
            }
            return p;
          })
        }));
      },

      addPayrollRecord: (recordData) => {
        const id = `pay-custom-${Date.now()}`;
        const net = recordData.base_salary + recordData.bonuses - recordData.deductions;
        const newRecord: StaffPayrollRecord = {
          ...recordData,
          id,
          net_salary: net
        };
        set(state => ({
          staffPayroll: [newRecord, ...(state.staffPayroll || [])]
        }));
        return newRecord;
      },

      adjustSalary: (employeeId, newBaseSalary, bonus, deductions) => {
        const net = newBaseSalary + bonus - deductions;
        set(state => ({
          staffPayroll: (state.staffPayroll || []).map(p => {
            if (p.employee_id === employeeId) {
              return {
                ...p,
                base_salary: newBaseSalary,
                bonuses: bonus,
                deductions: deductions,
                net_salary: net
              };
            }
            return p;
          })
        }));
      },

      saveSchoolSettings: (settings) => {
        applyThemeCssVariables(settings.themeColors);
        set({ schoolSettings: settings, syncError: null });

        if (saveSettingsTimeout) clearTimeout(saveSettingsTimeout);

        saveSettingsTimeout = setTimeout(async () => {
          try {
            const dbSettings = {
              name: settings.name,
              website: settings.website || '',
              logo_url: settings.logoUrl || '',
              cct: settings.cct || '',
              address: settings.address || '',
              phone: settings.phone || '',
              coordinators: settings.coordinators || [],
              teachers: settings.teachers || [],
              theme_colors: settings.themeColors,
              is_configured: settings.isConfigured
            };

            await supabase
              .from('school_settings')
              .upsert({
                id: '00000000-0000-0000-0000-000000000000',
                ...dbSettings,
                updated_at: new Date().toISOString()
              });
          } catch (err) {
            console.warn('Silent local fallback for school settings save:', err);
          }
        }, 1000);
      },

      registerStudent: (studentData) => {
        const newId = (studentData as any).id || `std-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const tempPassword = studentData.temporary_password || generateRandomPassword(6);
        const activeSchool = studentData.school_id || getActiveSchoolIdFromState(get());
        const schoolObj = (get().institutionsList || []).find(i => i.id === activeSchool);
        const schoolDomain = getSchoolEmailDomain(schoolObj);
        
        let campusName = studentData.campus_name || 'Primaria Jardines';
        if (studentData.level === 'secundaria' && !studentData.campus_name) {
          campusName = 'Secundaria Torres';
        }
        const campusObj = get().campusesList.find(c => c.name.toLowerCase() === campusName.toLowerCase());

        // Calcular costo de colegiatura según su nivel educativo
        const tuitionPricings = get().tuitionPricings || TUITION_PRICINGS_SEED;
        const baseFee = getTuitionFeeForStudent(studentData.level, studentData.grade, tuitionPricings);
        const discount = ((studentData.scholarship_percentage || 0) / 100) * baseFee;
        const finalAmount = Math.max(0, baseFee - discount);

        // Derivar correo institucional estrictamente con @(nombre-escuela.edu.mx)
        let studentEmail = studentData.email ? studentData.email.trim() : '';
        if (!studentEmail) {
          studentEmail = `${studentData.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${studentData.last_name_1.toLowerCase().replace(/[^a-z0-9]/g, '')}@${schoolDomain}`;
        } else {
          const parts = studentEmail.split('@');
          studentEmail = `${parts[0].trim()}@${schoolDomain}`;
        }

        const newStudent: DetailedStudent = {
          ...studentData,
          id: newId,
          email: studentEmail,
          school_id: activeSchool,
          campus_id: campusObj?.id || 'cmp-pri-jardines',
          campus_name: campusName,
          temporary_password: tempPassword,
          status: studentData.status || 'activo',
          is_blocked: studentData.is_blocked || false,
          photo_url: studentData.photo_url || '/images/students/default.png',
          pending_payments: ['Colegiatura de Septiembre 2026']
        };

        // Generar folio de cobro en el portal de finanzas institucional
        const newBillingRecord: FamilyBillingRecord = {
          id: `inv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          school_id: activeSchool,
          invoiceNumber: `COL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
          studentId: newId,
          parentName: newStudent.tutor_name || newStudent.father_name || newStudent.mother_name || `${newStudent.last_name_1} ${newStudent.last_name_2 || ''}`.trim() || 'Tutor Familiar',
          parentPhone: newStudent.emergency_contact_phone || newStudent.phone || '55-4160-8800',
          parentEmail: newStudent.email ? `tutor.${studentEmail}` : `tutor@${schoolDomain}`,
          studentName: `${newStudent.first_name} ${newStudent.second_name || ''} ${newStudent.last_name_1} ${newStudent.last_name_2 || ''}`.replace(/\s+/g, ' ').trim(),
          level: newStudent.level === 'primaria' ? 'Primaria' : newStudent.level === 'secundaria' ? 'Secundaria' : 'Preparatoria',
          grade: newStudent.grade,
          group: (newStudent.group_id || 'A').toUpperCase().includes('B') ? 'B' : 'A',
          concept: `Colegiatura de Septiembre 2026 - ${newStudent.level === 'primaria' ? 'Primaria' : newStudent.level === 'secundaria' ? 'Secundaria' : 'Preparatoria'} ${newStudent.grade}`,
          baseAmount: baseFee,
          scholarshipPercentage: newStudent.scholarship_percentage || 0,
          scholarshipType: newStudent.scholarship_type || 'ninguna',
          discountAmount: discount,
          amount: finalAmount,
          dueDate: '10 Septiembre 2026',
          status: 'pending',
          autoInvoice: true
        };

        set((state) => ({
          detailedStudents: [newStudent, ...(state.detailedStudents || [])],
          billingRecords: [newBillingRecord, ...(state.billingRecords || [])]
        }));

        if (typeof window !== 'undefined') {
          try {
            window.dispatchEvent(new CustomEvent('iskool_store_updated', { detail: { type: 'student_registered', student: newStudent } }));
          } catch (e) {}
        }

        try {
          const studentStore = useStudentStore.getState();
          if (studentStore && typeof studentStore.initializeNewStudent === 'function') {
            studentStore.initializeNewStudent(newId, studentData.first_name);
          }
        } catch (e) {
          console.warn('Could not initialize student stats:', e);
        }

        (async () => {
          try {
            await supabase.from('students').insert({
              id: isUuid(newId) ? newId : undefined,
              school_id: '00000000-0000-0000-0000-000000000000',
              first_name: newStudent.first_name,
              last_name: `${newStudent.last_name_1} ${newStudent.last_name_2 || ''}`.trim(),
              curp: newStudent.curp || '',
              grade: newStudent.grade,
              created_at: new Date().toISOString()
            });
          } catch (e) {}
        })();

        return newStudent;
      },

      addStudent: (studentData) => {
        return get().registerStudent(studentData);
      },

      bulkRegisterStudents: (studentsList) => {
        const activeSchool = getActiveSchoolIdFromState(get());
        const createdList: DetailedStudent[] = [];
        const createdBilling: FamilyBillingRecord[] = [];
        const tuitionPricings = get().tuitionPricings || TUITION_PRICINGS_SEED;

        studentsList.forEach((st, idx) => {
          if (!st.first_name || !st.last_name_1) return;
          const newId = st.id || `std-bulk-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`;
          const tempPassword = st.temporary_password || generateRandomPassword(6);
          
          let campusName = st.campus_name || 'Primaria Jardines';
          if (st.level === 'secundaria' && !st.campus_name) {
            campusName = 'Secundaria Torres';
          }
          const campusObj = get().campusesList.find(c => c.name.toLowerCase() === campusName.toLowerCase());

          const baseFee = getTuitionFeeForStudent(st.level || 'primaria', st.grade || '1º', tuitionPricings);
          const discount = ((st.scholarship_percentage || 0) / 100) * baseFee;
          const finalAmount = Math.max(0, baseFee - discount);

          const schoolObj = (get().institutionsList || []).find(i => i.id === (st.school_id || activeSchool));
          const schoolDomain = getSchoolEmailDomain(schoolObj);
          const prefix = (st.email ? st.email.split('@')[0] : `${st.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${st.last_name_1.toLowerCase().replace(/[^a-z0-9]/g, '')}`).trim();
          const studentEmail = `${prefix}@${schoolDomain}`;

          const newStudent: DetailedStudent = {
            id: newId,
            school_id: st.school_id || activeSchool,
            first_name: st.first_name.trim(),
            second_name: st.second_name?.trim() || '',
            last_name_1: st.last_name_1.trim(),
            last_name_2: st.last_name_2?.trim() || '',
            birth_date: st.birth_date || '2016-01-01',
            curp: st.curp || `${st.last_name_1.substring(0, 2).toUpperCase()}${st.first_name.substring(0, 2).toUpperCase()}160101HDFMRN01`,
            enrollment_id: st.enrollment_id || `MAT-2026-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            gender: st.gender || 'No especificado',
            shift: st.shift || 'matutino',
            status: 'activo',
            is_blocked: false,
            temporary_password: tempPassword,
            level: st.level || 'primaria',
            grade: st.grade || '1º',
            group_id: st.group_id || 'grp-jar-1a',
            campus_id: campusObj?.id || 'cmp-pri-jardines',
            campus_name: campusName,
            email: studentEmail,
            phone: st.phone || '55-0000-0000',
            address: st.address || 'Ciudad de México',
            photo_url: '/images/students/default.png',
            pending_payments: ['Colegiatura de Septiembre 2026'],
            behavior_reports: [],
            teacher_notes: []
          };

          createdList.push(newStudent);

          // Generar registro de cobro
          createdBilling.push({
            id: `inv-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            invoiceNumber: `COL-2026-${Math.floor(10000 + Math.random() * 90000)}`,
            studentId: newId,
            parentName: newStudent.tutor_name || newStudent.father_name || newStudent.mother_name || `${newStudent.last_name_1} ${newStudent.last_name_2 || ''}`.trim() || 'Tutor Familiar',
            parentPhone: newStudent.emergency_contact_phone || newStudent.phone || '55-4160-8800',
            parentEmail: `tutor.${studentEmail}`,
            studentName: `${newStudent.first_name} ${newStudent.second_name || ''} ${newStudent.last_name_1} ${newStudent.last_name_2 || ''}`.replace(/\s+/g, ' ').trim(),
            level: newStudent.level === 'primaria' ? 'Primaria' : newStudent.level === 'secundaria' ? 'Secundaria' : 'Preparatoria',
            grade: newStudent.grade,
            group: (newStudent.group_id || 'A').toUpperCase().includes('B') ? 'B' : 'A',
            concept: `Colegiatura de Septiembre 2026 - ${newStudent.level === 'primaria' ? 'Primaria' : newStudent.level === 'secundaria' ? 'Secundaria' : 'Preparatoria'} ${newStudent.grade}`,
            baseAmount: baseFee,
            scholarshipPercentage: newStudent.scholarship_percentage || 0,
            scholarshipType: newStudent.scholarship_type || 'ninguna',
            discountAmount: discount,
            amount: finalAmount,
            dueDate: '10 Septiembre 2026',
            status: 'pending',
            autoInvoice: true
          });

          try {
            const studentStore = useStudentStore.getState();
            if (studentStore && typeof studentStore.initializeNewStudent === 'function') {
              studentStore.initializeNewStudent(newId, newStudent.first_name);
            }
          } catch (e) {}
        });

        set((state) => ({
          detailedStudents: [...createdList, ...(state.detailedStudents || [])],
          billingRecords: [...createdBilling, ...(state.billingRecords || [])]
        }));

        return createdList;
      },

      toggleUserBlock: (userId, role, isBlocked) => {
        if (role === 'teacher') {
          set((state) => ({
            teachersList: (state.teachersList || []).map(t => 
              t.id === userId ? { ...t, is_blocked: isBlocked } : t
            )
          }));
        } else {
          set((state) => ({
            detailedStudents: (state.detailedStudents || []).map(s => 
              s.id === userId ? { ...s, is_blocked: isBlocked, status: isBlocked ? 'suspendido' : 'activo' } : s
            )
          }));
        }
      },

      changeUserPassword: (userId, role, newPassword) => {
        const passwordToSet = newPassword && newPassword.trim().length >= 4 
          ? newPassword.trim() 
          : generateRandomPassword(6);

        if (role === 'teacher') {
          set((state) => ({
            teachersList: (state.teachersList || []).map(t => 
              t.id === userId ? { ...t, temporary_password: passwordToSet } : t
            )
          }));
        } else {
          set((state) => ({
            detailedStudents: (state.detailedStudents || []).map(s => 
              s.id === userId ? { ...s, temporary_password: passwordToSet } : s
            )
          }));
        }

        return passwordToSet;
      },

      incrementTeacherTokens: (teacherId, tokensUsed) => {
        set((state) => {
          const updatedTeachers = (state.teachersList || []).map(t => 
            t.id === teacherId ? { ...t, ai_tokens_consumed: (t.ai_tokens_consumed || 0) + tokensUsed } : t
          );

          const updatedInstitutions = (state.institutionsList || []).map(inst => {
            if (state.activeSchoolId && inst.id === state.activeSchoolId) {
              return { ...inst, aiTokensConsumed: (inst.aiTokensConsumed || 0) + tokensUsed };
            }
            if (!state.activeSchoolId && !inst.isTestCase) {
              return { ...inst, aiTokensConsumed: (inst.aiTokensConsumed || 0) + tokensUsed };
            }
            return inst;
          });

          return {
            teachersList: updatedTeachers,
            institutionsList: updatedInstitutions
          };
        });
      },

      createCampus: (campusData) => {
        const activeSchool = campusData.school_id || getActiveSchoolIdFromState(get());
        const newCampus: Campus = {
          ...campusData,
          id: `cmp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          school_id: campusData.school_id || activeSchool,
          created_at: new Date().toISOString()
        };
        set((state) => ({
          campusesList: [...(state.campusesList || []), newCampus]
        }));
      },

      updateCampus: (campusId, data) => {
        set((state) => ({
          campusesList: (state.campusesList || []).map(c => 
            c.id === campusId ? { ...c, ...data } : c
          )
        }));
      },

      deleteCampus: (campusId) => {
        set((state) => ({
          campusesList: (state.campusesList || []).filter(c => c.id !== campusId)
        }));
      },

      createGroup: (groupData) => {
        const activeSchool = groupData.school_id || getActiveSchoolIdFromState(get());
        const newGroup: Group = {
          id: groupData.id || `grp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          school_id: groupData.school_id || activeSchool,
          campus_id: groupData.campus_id,
          campus_name: groupData.campus_name || 'Primaria Jardines',
          level_grade_id: groupData.level_grade_id || 'lvl-pri-1',
          academic_year_id: groupData.academic_year_id || 'ay-2025-2026',
          name: groupData.name || 'A',
          grade: groupData.grade || '1º',
          level: groupData.level || 'primaria',
          student_ids: groupData.student_ids || [],
          created_at: new Date().toISOString()
        };
        set((state) => ({
          groupsList: [...(state.groupsList || []), newGroup]
        }));
        return newGroup;
      },

      updateGroup: (groupId, data) => {
        set((state) => ({
          groupsList: (state.groupsList || []).map(g => 
            g.id === groupId ? { ...g, ...data } : g
          )
        }));
      },

  updateStudentStatus: (studentId, status) => {
    set((state) => {
      const student = (state.detailedStudents || []).find(s => s.id === studentId);
      let newAuditLogs = state.studentDeletionAuditLogs || [];

      if (status === 'baja' && student) {
        const now = new Date();
        const formattedDate = new Intl.DateTimeFormat('es-MX', {
          dateStyle: 'full',
          timeStyle: 'medium',
          timeZone: 'America/Mexico_City'
        }).format(now);
        const studentFullName = `${student.first_name} ${student.second_name ? student.second_name + ' ' : ''}${student.last_name_1} ${student.last_name_2 || ''}`.trim();
        const targetSchoolId = student.school_id || state.activeSchoolId || 'sch-jjrosseau';
        const school = (state.institutionsList || []).find(i => i.id === targetSchoolId);

        const auditLog: StudentDeletionAuditLog = {
          id: `audit-baja-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          student_id: student.id,
          student_name: studentFullName,
          enrollment_id: student.enrollment_id || '',
          curp: student.curp || '',
          school_id: targetSchoolId,
          school_name: school?.name || state.schoolSettings?.name || 'Colegio Institucional',
          campus_name: student.campus_name || '',
          level: student.level || 'primaria',
          grade: student.grade || '1º',
          deleted_at: now.toISOString(),
          deleted_at_formatted: formattedDate,
          deleted_by_id: 'usr-dir',
          deleted_by_name: 'Dirección de Plantel',
          deleted_by_role: 'director',
          deleted_by_email: 'director@iskool.edu.mx',
          reason: 'Cambio de estado a Baja en expediente escolar',
          previous_status: student.status
        };
        newAuditLogs = [auditLog, ...newAuditLogs];
      }

      return {
        detailedStudents: (state.detailedStudents || []).map(s => 
          s.id === studentId ? { ...s, status, deleted_at: status === 'baja' ? new Date().toISOString() : undefined } : s
        ),
        studentDeletionAuditLogs: newAuditLogs
      };
    });
  },

  deleteStudent: (studentId, options) => {
    const state = get();
    const student = (state.detailedStudents || []).find(s => s.id === studentId);
    if (!student) return { success: false };

    const targetSchoolId = student.school_id || getActiveSchoolIdFromState(state);
    const school = (state.institutionsList || []).find(i => i.id === targetSchoolId);
    const now = new Date();
    const formattedDate = new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'America/Mexico_City'
    }).format(now);

    const studentFullName = `${student.first_name} ${student.second_name ? student.second_name + ' ' : ''}${student.last_name_1} ${student.last_name_2 || ''}`.trim();

    const auditLog: StudentDeletionAuditLog = {
      id: `audit-del-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      student_id: student.id,
      student_name: studentFullName,
      enrollment_id: student.enrollment_id || '',
      curp: student.curp || '',
      school_id: targetSchoolId,
      school_name: school?.name || state.schoolSettings?.name || 'Colegio Institucional',
      campus_name: student.campus_name || '',
      level: student.level || 'primaria',
      grade: student.grade || '1º',
      deleted_at: now.toISOString(),
      deleted_at_formatted: formattedDate,
      deleted_by_id: options?.operatorUser?.id || 'usr-dir',
      deleted_by_name: options?.operatorUser?.name || 'Dirección de Plantel',
      deleted_by_role: options?.operatorUser?.role || 'director',
      deleted_by_email: options?.operatorUser?.email || 'director@iskool.edu.mx',
      reason: options?.reason || 'Baja definitiva y retiro de sistema desde el expediente escolar',
      previous_status: student.status
    };

    set((prevState) => ({
      detailedStudents: (prevState.detailedStudents || []).filter(s => s.id !== studentId),
      studentDeletionAuditLogs: [auditLog, ...(prevState.studentDeletionAuditLogs || [])]
    }));

    try {
      if (typeof localStorage !== 'undefined') {
        const existingLogs = JSON.parse(localStorage.getItem('iskool_deletion_audit_logs') || '[]');
        localStorage.setItem('iskool_deletion_audit_logs', JSON.stringify([auditLog, ...existingLogs]));
      }
    } catch (e) {}

    return { success: true, auditLog };
  },

  updateStudent: (studentId, updatedData) => {
    set((state) => ({
      detailedStudents: (state.detailedStudents || []).map(s => 
        s.id === studentId ? { ...s, ...updatedData } : s
      )
    }));
  },

  addTeacherNote: (studentId, note) => {
    set((state) => {
      const student = (state.detailedStudents || []).find(s => s.id === studentId);
      const studentName = student ? `${student.first_name} ${student.last_name_1}` : 'El Alumno';
      const activeSchool = student?.school_id || getActiveSchoolIdFromState(state);

      const notificationMsg: ParentMessage = {
        id: `msg-tnote-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        school_id: activeSchool,
        parent_id: 'prt-1',
        student_id: studentId,
        student_name: studentName,
        teacher_id: 'tch-1',
        teacher_name: note.teacher_name || 'Profesor',
        subject_id: 'sub-general',
        subject_name: 'Observación Docente',
        message: `📋 NOTA DE PROFESOR (${note.teacher_name}): "${note.note}"`,
        sent_at: new Date().toISOString(),
        is_read: false
      };

      return {
        detailedStudents: (state.detailedStudents || []).map(s => 
          s.id === studentId ? { ...s, teacher_notes: [note, ...(s.teacher_notes || [])] } : s
        ),
        parentMessages: [notificationMsg, ...(state.parentMessages || [])]
      };
    });
  },

  addBehaviorReport: (studentId, report) => {
    set((state) => {
      const student = (state.detailedStudents || []).find(s => s.id === studentId);
      const studentName = student ? `${student.first_name} ${student.last_name_1}` : 'El Alumno';
      const activeSchool = student?.school_id || getActiveSchoolIdFromState(state);

      const notificationMsg: ParentMessage = {
        id: `msg-brep-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        school_id: activeSchool,
        parent_id: 'prt-1',
        student_id: studentId,
        student_name: studentName,
        teacher_id: 'tch-1',
        teacher_name: report.reporter || 'Coordinación Académica',
        subject_id: 'sub-behavior',
        subject_name: 'Reporte de Conducta',
        message: `⚠️ REPORTE DE CONDUCTA (${report.reporter}): ${report.description}`,
        sent_at: new Date().toISOString(),
        is_read: false
      };

      return {
        detailedStudents: (state.detailedStudents || []).map(s => 
          s.id === studentId ? { ...s, behavior_reports: [report, ...(s.behavior_reports || [])] } : s
        ),
        parentMessages: [notificationMsg, ...(state.parentMessages || [])]
      };
    });
  },

  deleteBehaviorReport: (studentId, index) => {
    set((state) => ({
      detailedStudents: (state.detailedStudents || []).map(s => {
        if (s.id === studentId) {
          const reports = [...(s.behavior_reports || [])];
          reports.splice(index, 1);
          return { ...s, behavior_reports: reports };
        }
        return s;
      })
    }));
  },

  deleteTeacherNote: (studentId, index) => {
    set((state) => ({
      detailedStudents: (state.detailedStudents || []).map(s => {
        if (s.id === studentId) {
          const notes = [...(s.teacher_notes || [])];
          notes.splice(index, 1);
          return { ...s, teacher_notes: notes };
        }
        return s;
      })
    }));
  },

  generateGroupsForGrade: (level, grade, groupNames) => {
    set((state) => {
      const activeLevelGradeKey = `${level}-${grade.replace(/\s+/g, '')}`;
      const activeSchool = state.activeSchoolId || 'sch-jjrosseau';
      
      // Buscar grupos existentes para este nivel y grado
      const existingForGrade = state.groupsList.filter(g => 
        g.level_grade_id === activeLevelGradeKey || 
        (g.level === level && g.grade === grade)
      );

      const existingNamesMap = new Map<string, Group>();
      existingForGrade.forEach(g => existingNamesMap.set(g.name.toUpperCase(), g));

      const updatedGroupsList = [...state.groupsList];

      // 1. Asegurar que los grupos solicitados existan (ej. 'A' y 'B')
      groupNames.forEach((name, idx) => {
        const upperName = name.toUpperCase();
        if (!existingNamesMap.has(upperName)) {
          const newGrp: Group = {
            id: `grp-${level.slice(0, 3)}-${grade.replace(/[^0-9a-zA-Z]/g, '')}-${upperName.toLowerCase()}-${Date.now()}-${idx}`,
            school_id: activeSchool,
            level_grade_id: activeLevelGradeKey,
            academic_year_id: 'ay-25-26',
            name: upperName,
            level,
            grade,
            student_ids: [],
            created_at: new Date().toISOString()
          };
          updatedGroupsList.push(newGrp);
          existingNamesMap.set(upperName, newGrp);
        } else {
          // Asegurar que level_grade_id y level/grade estén actualizados
          const existingGroup = existingNamesMap.get(upperName)!;
          const gIdx = updatedGroupsList.findIndex(g => g.id === existingGroup.id);
          if (gIdx !== -1) {
            updatedGroupsList[gIdx] = {
              ...updatedGroupsList[gIdx],
              level_grade_id: activeLevelGradeKey,
              level,
              grade
            };
            existingNamesMap.set(upperName, updatedGroupsList[gIdx]);
          }
        }
      });

      // Si no es la conformación automática de A y B (ej. creación de grupo C individual)
      const isAutoAB = groupNames.length === 2 && 
        groupNames.map(n => n.toUpperCase()).includes('A') && 
        groupNames.map(n => n.toUpperCase()).includes('B');

      if (!isAutoAB) {
        return { groupsList: updatedGroupsList };
      }

      // 2. Conformación e igualación automática de Grupos A y B
      const groupA = existingNamesMap.get('A');
      const groupB = existingNamesMap.get('B');

      if (!groupA || !groupB) return { groupsList: updatedGroupsList };

      // Obtener TODOS los alumnos correspondientes a este nivel y grado
      const gradeStudents = state.detailedStudents.filter(s => {
        const studentLevel = s.level || (parseInt(s.grade || '1') <= 6 ? 'primaria' : 'secundaria');
        return studentLevel === level && (s.grade === grade || (!s.grade && grade === '1º'));
      });

      const studentIdsA: string[] = [];
      const studentIdsB: string[] = [];
      const updatedDetailedStudents = [...state.detailedStudents];

      // Distribuir alternadamente 50% / 50% entre Grupo A y Grupo B
      gradeStudents.forEach((student, index) => {
        const targetGroup = (index % 2 === 0) ? groupA : groupB;
        if (index % 2 === 0) {
          studentIdsA.push(student.id);
        } else {
          studentIdsB.push(student.id);
        }

        const sIdx = updatedDetailedStudents.findIndex(st => st.id === student.id);
        if (sIdx !== -1) {
          updatedDetailedStudents[sIdx] = {
            ...updatedDetailedStudents[sIdx],
            group_id: targetGroup.id,
            level,
            grade
          };
        }
      });

      // Actualizar listas de student_ids en los grupos A y B
      const finalGroupsList = updatedGroupsList.map(g => {
        if (g.id === groupA.id) {
          return { ...g, student_ids: studentIdsA, level_grade_id: activeLevelGradeKey, level, grade };
        }
        if (g.id === groupB.id) {
          return { ...g, student_ids: studentIdsB, level_grade_id: activeLevelGradeKey, level, grade };
        }
        // Si hay otros grupos en el mismo grado (ej. C), remover a los alumnos asignados a A o B
        if (g.level_grade_id === activeLevelGradeKey || (g.level === level && g.grade === grade)) {
          return { ...g, student_ids: (g.student_ids || []).filter((id: string) => !studentIdsA.includes(id) && !studentIdsB.includes(id)) };
        }
        return g;
      });

      return {
        groupsList: finalGroupsList,
        detailedStudents: updatedDetailedStudents
      };
    });
  },

  assignStudentToGroup: (studentId, groupId) => {
    set((state) => ({
      detailedStudents: state.detailedStudents.map(s => 
        s.id === studentId ? { ...s, group_id: groupId || undefined } : s
      ),
      groupsList: state.groupsList.map(g => {
        const studentIds = g.student_ids || [];
        const hasStudent = studentIds.includes(studentId);
        if (g.id === groupId && !hasStudent) {
          return { ...g, student_ids: [...studentIds, studentId] };
        } else if (g.id !== groupId && hasStudent) {
          return { ...g, student_ids: studentIds.filter((id: string) => id !== studentId) };
        }
        return g;
      })
    }));
  },

  createSchedule: (scheduleData) => {
    const activeSchool = scheduleData.school_id || getActiveSchoolIdFromState(get());
    const newSchedule: ClassSchedule = {
      ...scheduleData,
      school_id: scheduleData.school_id || activeSchool,
      id: `sch-${Date.now()}`
    };
    set((state) => ({
      schedulesList: [...state.schedulesList, newSchedule]
    }));
  },

  deleteSchedule: async (scheduleId) => {
    set({ syncError: null });
    try {
      set((state) => ({
        schedulesList: state.schedulesList.filter(s => s.id !== scheduleId)
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el horario';
      console.error('Error deleting schedule:', err);
      set({ syncError: errorMsg });
    }
  },

  deleteGroup: async (groupId) => {
    set({ syncError: null });
    try {
      set((state) => ({
        groupsList: state.groupsList.filter(g => g.id !== groupId),
        detailedStudents: state.detailedStudents.map(s => 
          s.group_id === groupId ? { ...s, group_id: undefined } : s
        ),
        schedulesList: state.schedulesList.filter(s => s.groupId !== groupId)
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar el grupo';
      console.error('Error deleting group:', err);
      set({ syncError: errorMsg });
    }
  },

  saveAttendanceList: (records) => {
    const timestamp = new Date().toISOString();
    const registered_by = 'usr-teacher-1';
    const activeSchool = getActiveSchoolIdFromState(get());

    set((state) => {
      const cleanPrev = state.attendanceList.filter(att => {
        const isSameGroupAndSubjectAndDate = records.some(rec => 
          rec.date === att.date && 
          rec.group_id === att.group_id && 
          rec.subject_id === att.subject_id &&
          rec.student_id === att.student_id
        );
        return !isSameGroupAndSubjectAndDate;
      });

      const newRecords: Attendance[] = records.map((rec, idx) => ({
        ...rec,
        school_id: rec.school_id || activeSchool,
        id: `att-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        registered_by,
        created_at: timestamp
      }));

      return {
        attendanceList: [...cleanPrev, ...newRecords]
      };
    });
  },

  sendParentMessage: (msgData) => {
    const activeSchool = msgData.school_id || getActiveSchoolIdFromState(get());
    const newMsg: ParentMessage = {
      ...msgData,
      school_id: msgData.school_id || activeSchool,
      id: `msg-${Date.now()}`,
      sent_at: new Date().toISOString(),
      is_read: false
    };

    set((state) => ({
      parentMessages: [newMsg, ...state.parentMessages]
    }));
  },

  replyToParentMessage: (messageId, replyText) => {
    set((state) => {
      const now = new Date().toISOString();
      const targetMsg = (state.parentMessages || []).find(m => m.id === messageId);
      
      const updatedMessages = (state.parentMessages || []).map(msg => {
        if (msg.id === messageId) {
          return {
            ...msg,
            parent_reply: replyText,
            replied_at: now,
            is_read: true
          };
        }
        return msg;
      });

      let updatedStudents = state.detailedStudents || [];
      if (targetMsg) {
        updatedStudents = updatedStudents.map(student => {
          if (student.id !== targetMsg.student_id) return student;

          const updatedReports = (student.behavior_reports || []).map(rep => {
            if (targetMsg.subject_name === 'Reporte de Conducta' || targetMsg.id.startsWith('msg-brep')) {
              return { ...rep, parent_reply: replyText, replied_at: now };
            }
            return rep;
          });

          const updatedNotes = (student.teacher_notes || []).map(nt => {
            if (targetMsg.subject_name === 'Observación Docente' || targetMsg.id.startsWith('msg-tnote')) {
              return { ...nt, parent_reply: replyText, replied_at: now };
            }
            return nt;
          });

          return {
            ...student,
            behavior_reports: updatedReports,
            teacher_notes: updatedNotes
          };
        });
      }

      return {
        parentMessages: updatedMessages,
        detailedStudents: updatedStudents
      };
    });
  },

  markMessageAsRead: (messageId) => {
    set((state) => ({
      parentMessages: state.parentMessages.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    }));
  },

  createSubject: (subjectData) => {
    const activeSchool = subjectData.school_id || getActiveSchoolIdFromState(get());
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      school_id: subjectData.school_id || activeSchool,
      created_at: new Date().toISOString()
    };
    set((state) => ({
      subjectsList: [...state.subjectsList, newSubject]
    }));
  },

  deleteSubject: async (subjectId) => {
    set({ syncError: null });
    try {
      set((state) => ({
        subjectsList: state.subjectsList.filter(s => s.id !== subjectId),
        schedulesList: state.schedulesList.filter(s => s.subjectId !== subjectId)
      }));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar la materia';
      console.error('Error deleting subject:', err);
      set({ syncError: errorMsg });
    }
  },

  updateGroupAnnualPlan: (subjectId, groupId, planData) => {
    set((state) => ({
      subjectsList: (state.subjectsList || []).map((sub) => {
        if (sub.id !== subjectId) return sub;

        const currentPlans = sub.group_annual_plans || {};
        const currentGroupPlan = currentPlans[groupId] || {
          group_id: groupId,
          group_name: groupId,
          campus_name: 'General',
          grade: '1º',
          plan_title: `Planeación Anual - ${sub.name}`,
          term_1: '',
          term_2: '',
          term_3: '',
          updated_at: new Date().toISOString()
        };

        const updatedGroupPlan = {
          ...currentGroupPlan,
          ...planData,
          updated_at: new Date().toISOString()
        };

        return {
          ...sub,
          group_annual_plans: {
            ...currentPlans,
            [groupId]: updatedGroupPlan
          }
        };
      })
    }));
  },

  updateSubjectSyllabus: (subjectId, topics) => {
    set((state) => ({
      subjectsList: (state.subjectsList || []).map((sub) => 
        sub.id === subjectId ? { ...sub, syllabus_topics: topics } : sub
      )
    }));
  },

      registerTeacher: (teacherData) => {
        const activeSchool = teacherData.school_id || getActiveSchoolIdFromState(get());
        const schoolObj = (get().institutionsList || []).find(i => i.id === activeSchool);
        const schoolDomain = getSchoolEmailDomain(schoolObj);

        let teacherEmail = teacherData.email ? teacherData.email.trim() : '';
        if (!teacherEmail) {
          teacherEmail = `${teacherData.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${teacherData.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${schoolDomain}`;
        } else {
          const parts = teacherEmail.split('@');
          teacherEmail = `${parts[0].trim()}@${schoolDomain}`;
        }

        const newTeacher: UserProfile = {
          ...teacherData,
          email: teacherEmail,
          id: `usr-teacher-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          school_id: activeSchool,
          role: 'teacher',
          ai_tokens_consumed: 0,
          is_blocked: false,
          temporary_password: teacherData.temporary_password || generateRandomPassword(6),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set((state) => ({
          teachersList: [...(state.teachersList || []), newTeacher],
          schoolSettings: {
            ...state.schoolSettings,
            teachers: Array.from(new Set([...(state.schoolSettings?.teachers || []), `${teacherData.first_name} ${teacherData.last_name}`]))
          }
        }));
      },

      updateTeacher: (teacherId, updatedData) => {
        set((state) => {
          const teachersList = state.teachersList || [];
          const target = teachersList.find(t => t.id === teacherId);
          if (!target) return state;

          const oldFullName = `${target.first_name} ${target.last_name}`;
          const newFirstName = updatedData.first_name ?? target.first_name;
          const newLastName = updatedData.last_name ?? target.last_name;
          const newFullName = `${newFirstName} ${newLastName}`;

          const updatedTeachersList = teachersList.map(t => 
            t.id === teacherId ? { ...t, ...updatedData, updated_at: new Date().toISOString() } : t
          );

          const currentTeachers = state.schoolSettings?.teachers || [];
          const updatedTeachersNames = currentTeachers.map(name => 
            name === oldFullName ? newFullName : name
          );

          return {
            teachersList: updatedTeachersList,
            schoolSettings: {
              ...state.schoolSettings,
              teachers: Array.from(new Set(updatedTeachersNames))
            }
          };
        });
      },

      deleteTeacher: (teacherId) => {
        set((state) => {
          const teachersList = state.teachersList || [];
          const target = teachersList.find(t => t.id === teacherId);
          if (!target) return state;
          const fullName = `${target.first_name} ${target.last_name}`;

          const updatedSchedulesList = (state.schedulesList || []).map(s => 
            s.teacherId === teacherId ? { ...s, teacherId: '' } : s
          );

          const currentTeachers = state.schoolSettings?.teachers || [];
          return {
            teachersList: teachersList.filter(t => t.id !== teacherId),
            schedulesList: updatedSchedulesList,
            schoolSettings: {
              ...state.schoolSettings,
              teachers: currentTeachers.filter(name => name !== fullName)
            }
          };
        });
      },

      registerStaffAccount: (data) => {
        const targetSchoolId = data.school_id || getActiveSchoolIdFromState(get());
        const targetSchool = (get().institutionsList || []).find(i => i.id === targetSchoolId);
        const schoolDomain = getSchoolEmailDomain(targetSchool);

        let staffEmail = data.email ? data.email.trim() : '';
        if (!staffEmail) {
          staffEmail = `${data.first_name.toLowerCase().replace(/[^a-z0-9]/g, '')}.${data.last_name.toLowerCase().replace(/[^a-z0-9]/g, '')}@${schoolDomain}`;
        } else {
          const parts = staffEmail.split('@');
          staffEmail = `${parts[0].trim()}@${schoolDomain}`;
        }

        const tempPassword = data.temporary_password || generateRandomPassword(6);
        const newStaff: UserProfile = {
          ...data,
          email: staffEmail,
          school_id: targetSchoolId,
          id: `usr-staff-${Date.now()}`,
          temporary_password: tempPassword,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        set(state => ({
          staffUsers: [newStaff, ...(state.staffUsers || [])]
        }));
        return newStaff;
      },

      updateStaffAccount: (id, data) => {
        set(state => ({
          staffUsers: (state.staffUsers || []).map(u => u.id === id ? { ...u, ...data, updated_at: new Date().toISOString() } : u)
        }));
      },

      deleteStaffAccount: (id) => {
        set(state => ({
          staffUsers: (state.staffUsers || []).filter(u => u.id !== id)
        }));
      },

      toggleStaffBlock: (id, isBlocked) => {
        set(state => ({
          staffUsers: (state.staffUsers || []).map(u => u.id === id ? { ...u, is_blocked: isBlocked, updated_at: new Date().toISOString() } : u)
        }));
      },

      changeStaffPassword: (id, newPassword) => {
        const pass = newPassword || generateRandomPassword(6);
        set(state => ({
          staffUsers: (state.staffUsers || []).map(u => u.id === id ? { ...u, temporary_password: pass, updated_at: new Date().toISOString() } : u)
        }));
        return pass;
      },

      updateSchoolGovernance: (schoolId, settings) => {
        set(state => {
          const current = state.schoolGovernance?.[schoolId] || DEFAULT_GOVERNANCE_SETTINGS;
          const updated = { ...current, ...settings };
          return {
            schoolGovernance: {
              ...(state.schoolGovernance || {}),
              [schoolId]: updated
            }
          };
        });
      },

      updateDirectorLimits: (schoolId, limits) => {
        set(state => {
          const current = state.directorLimits?.[schoolId] || DEFAULT_DIRECTOR_LIMITS;
          const updated = { ...current, ...limits };
          return {
            directorLimits: {
              ...(state.directorLimits || {}),
              [schoolId]: updated
            }
          };
        });
      },

      addRestrictedTopic: (schoolId, topicData) => {
        set(state => {
          const current = state.schoolGovernance?.[schoolId] || DEFAULT_GOVERNANCE_SETTINGS;
          const newTopic: RestrictedTopicItem = {
            ...topicData,
            id: `top-restr-${Date.now()}`,
            restrictedAt: new Date().toISOString()
          };
          return {
            schoolGovernance: {
              ...(state.schoolGovernance || {}),
              [schoolId]: {
                ...current,
                restrictedTopics: [newTopic, ...(current.restrictedTopics || [])]
              }
            }
          };
        });
      },

      removeRestrictedTopic: (schoolId, topicId) => {
        set(state => {
          const current = state.schoolGovernance?.[schoolId] || DEFAULT_GOVERNANCE_SETTINGS;
          return {
            schoolGovernance: {
              ...(state.schoolGovernance || {}),
              [schoolId]: {
                ...current,
                restrictedTopics: (current.restrictedTopics || []).filter(t => t.id !== topicId)
              }
            }
          };
        });
      },

      resetSchoolAdminStore: () => {
        set({
          institutionsList: INSTITUTIONS_SEED,
          activeSchoolId: null,
          schoolSettings: {
            isConfigured: true,
            name: 'UP Juan Jacobo Rosseau',
            website: 'https://jjrosseau.edu.mx',
            logoUrl: '',
            cct: '09PPR2026R',
            address: 'Calzada de los Filósofos 1712, Col. Del Valle, Ciudad de México',
            phone: '55-4160-8800',
            coordinators: ['Lic. Alejandro Valdés', 'Mtra. Patricia Mendoza'],
            teachers: ['Prof. Israel López', 'Profa. María Fernández', 'Prof. Roberto Díaz', 'Profa. Carmen Morales', 'Prof. David Navarrete', 'Profa. Elena Salazar', 'Prof. Fernando Rangel'],
            themeColors: {
              primary: '221 83% 53%',
              secondary: '268 85% 58%',
              accent: '158 72% 40%'
            }
          },
          campusesList: CAMPUSES_SEED,
          detailedStudents: DETAILED_STUDENTS_SEED,
          studentDeletionAuditLogs: INITIAL_DELETION_AUDIT_LOGS_SEED,
          groupsList: GROUPS_SEED,
          schedulesList: SCHEDULES_SEED,
          subjectsList: SUBJECTS_SEED,
          teachersList: TEACHERS_LIST_SEED,
          attendanceList: ATTENDANCE_SEED,
          parentMessages: PARENT_MESSAGES_SEED,
          tuitionPricings: TUITION_PRICINGS_SEED,
          billingRecords: BILLING_RECORDS_SEED,
          staffUsers: STAFF_USERS_SEED,
          staffPayroll: STAFF_PAYROLL_SEED,
          schoolGovernance: {
            'sch-jjrosseau': DEFAULT_GOVERNANCE_SETTINGS,
            'sch-test-case': DEFAULT_GOVERNANCE_SETTINGS,
            'sch-montessori': DEFAULT_GOVERNANCE_SETTINGS
          },
          directorLimits: {
            'sch-jjrosseau': DEFAULT_DIRECTOR_LIMITS,
            'sch-test-case': DEFAULT_DIRECTOR_LIMITS,
            'sch-montessori': DEFAULT_DIRECTOR_LIMITS
          },
          syncError: null
        });
      },

      reconcileSeedsWithStore: () => {
        set((state) => {
          const current = state.detailedStudents || [];
          const existingIds = new Set(current.map(s => s.id));
          const deletedIds = new Set((state.studentDeletionAuditLogs || []).map(l => l.student_id));
          const missing = DETAILED_STUDENTS_SEED.filter(s => !existingIds.has(s.id) && !deletedIds.has(s.id));
          if (missing.length === 0) return state;
          return {
            detailedStudents: [...current, ...missing]
          };
        });
      }
    }),
    {
      name: 'iskool_school_admin_store',
      version: 2,
      migrate: (persistedState: any) => {
        if (persistedState && Array.isArray(persistedState.detailedStudents)) {
          const existingIds = new Set(persistedState.detailedStudents.map((s: any) => s.id));
          const deletedIds = new Set((persistedState.studentDeletionAuditLogs || []).map((l: any) => l.student_id));
          const missing = DETAILED_STUDENTS_SEED.filter(s => !existingIds.has(s.id) && !deletedIds.has(s.id));
          persistedState.detailedStudents = [...persistedState.detailedStudents, ...missing];
        }
        return persistedState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.reconcileSeedsWithStore?.();
        }
      },
      partialize: (state) => ({
        institutionsList: state.institutionsList,
        activeSchoolId: state.activeSchoolId,
        schoolSettings: state.schoolSettings,
        campusesList: state.campusesList,
        detailedStudents: state.detailedStudents,
        studentDeletionAuditLogs: state.studentDeletionAuditLogs,
        groupsList: state.groupsList,
        schedulesList: state.schedulesList,
        subjectsList: state.subjectsList,
        teachersList: state.teachersList,
        tuitionPricings: state.tuitionPricings,
        billingRecords: state.billingRecords,
        staffUsers: state.staffUsers,
        staffPayroll: state.staffPayroll,
        schoolGovernance: state.schoolGovernance,
        directorLimits: state.directorLimits
      })
    }
  )
);
