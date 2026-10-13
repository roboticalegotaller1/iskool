import { UserProfile, UserRole } from '@/types';
import {
  SUPER_USERS_ISKOOL_SEED,
  TEACHER_SEED,
  PARENT_SEED,
  STUDENTS_LIST_SEED,
  STAFF_USERS_SEED
} from '@/store/seeds';

export type DemoCategory = 'docentes' | 'estudiantes' | 'gestion';

export interface DemoAccount {
  name: string;
  role: string;
  grade: string;
  email: string;
  avatarColor: string;
  id: string;
  defaultPass?: string;
  category: DemoCategory;
  campusName?: string;
}

// Cuentas demo completas de la plataforma (Mostradas exclusivamente en Lcxad5iH8kGm3ZC)
export const GENERAL_DEMO_ACCOUNTS: DemoAccount[] = [
  // Docentes
  {
    name: "Prof. Israel López Ángeles",
    role: "teacher",
    grade: "Docente Titular (Primaria Laboratorio Demo)",
    email: "israel.lopez@sandbox.iskool.edu.mx",
    avatarColor: "bg-rose-500",
    id: "usr-teacher-1",
    defaultPass: "008805",
    category: "docentes"
  },
  {
    name: "Prof. Gabriel Montes",
    role: "teacher",
    grade: "Profesor Independiente (Física & Ciencias 3º)",
    email: "gabriel.montes@independientes.iskool.edu.mx",
    avatarColor: "bg-purple-600",
    id: "usr-indep-1",
    defaultPass: "008805",
    category: "docentes"
  },
  {
    name: "Profa. Sofía Albarrán",
    role: "teacher",
    grade: "Profesora Independiente (Historia 1º)",
    email: "sofia.albarran@independientes.iskool.edu.mx",
    avatarColor: "bg-indigo-600",
    id: "usr-indep-2",
    defaultPass: "008805",
    category: "docentes"
  },
  // Estudiantes
  {
    name: "Lucas Skywalker",
    role: "student",
    grade: "Primaria Alta (4º Grado)",
    email: "lucas@iskool.edu.mx",
    avatarColor: "bg-emerald-500",
    id: "std-pa",
    category: "estudiantes"
  },
  {
    name: "Elena Rostova",
    role: "student",
    grade: "Secundaria (2º Grado) - Gamificación",
    email: "elena@iskool.edu.mx",
    avatarColor: "bg-purple-500",
    id: "std-sec",
    category: "estudiantes"
  },
  {
    name: "Santi Gómez",
    role: "student",
    grade: "Primaria Baja (1º Grado)",
    email: "santi@iskool.edu.mx",
    avatarColor: "bg-blue-500",
    id: "std-pb",
    category: "estudiantes"
  },
  {
    name: "Mateo Díaz",
    role: "student",
    grade: "Preparatoria (4º Semestre)",
    email: "mateo@iskool.edu.mx",
    avatarColor: "bg-amber-500",
    id: "std-prep",
    category: "estudiantes"
  },
  {
    name: "Familia López Mendoza",
    role: "parent",
    grade: "Tutor / Padre de Familia",
    email: "israel.lopez@ejemplo.com",
    avatarColor: "bg-amber-600",
    id: "usr-parent-001",
    defaultPass: "ISkoolPassword2026!",
    category: "estudiantes"
  },
  // Gestión Institucional
  {
    name: "Lic. Roberto Garza",
    role: "director",
    grade: "Dirección de Plantel (Gobernanza)",
    email: "director@iskool.edu.mx",
    avatarColor: "bg-purple-600",
    id: "usr-dir-1",
    defaultPass: "DIR2026",
    category: "gestion"
  },
  {
    name: "Lic. Beatriz Morales",
    role: "coordinator",
    grade: "Coordinación y Control Escolar",
    email: "coordinacion@iskool.edu.mx",
    avatarColor: "bg-indigo-600",
    id: "usr-coord-1",
    defaultPass: "ISkoolPassword2026!",
    category: "gestion"
  },
  {
    name: "C.P. Mónica Suárez",
    role: "billing",
    grade: "Cobranza y Finanzas Escolares",
    email: "cobranza@iskool.edu.mx",
    avatarColor: "bg-emerald-600",
    id: "usr-billing-1",
    defaultPass: "COB2026",
    category: "gestion"
  },
  {
    name: "Don Alejandro Vargas",
    role: "owner",
    grade: "Dueño de Colegio (UP Juan Jacobo Rosseau - Aislado)",
    email: "dueno@jjrosseau.edu.mx",
    avatarColor: "bg-blue-600",
    id: "usr-owner-1",
    defaultPass: "DUE2026",
    category: "gestion"
  },
  // CEO Corporativo B2B
  {
    name: "Dr. Maximilian Weber (CEO)",
    role: "ceo",
    grade: "CEO & Director General (BMW Group México)",
    email: "ceo@bmw-corp.mx",
    avatarColor: "bg-blue-700",
    id: "usr-ceo-bmw",
    defaultPass: "BMW2026!",
    category: "gestion"
  }
];

// Cuentas demo exclusivas del Instituto Bilingüe IBIME (Mostradas estrictamente en 02DJoUJSkwYQZjn)
export const IBIME_DEMO_ACCOUNTS: DemoAccount[] = [
  // Gestión Institucional IBIME
  {
    name: "Lic. Patricia Sandoval Morales",
    role: "director",
    grade: "Dirección General (Campus Montes Sede Matriz & CCH)",
    email: "directora.general@ibime.edu.mx",
    avatarColor: "bg-blue-900",
    id: "usr-dir-ibime-montes",
    defaultPass: "DIR2026",
    category: "gestion",
    campusName: "Campus Montes"
  },
  {
    name: "Lic. Carmen Delgado Ríos",
    role: "director",
    grade: "Dirección de Plantel (Campus Lagos - Preescolar & Primaria)",
    email: "directora.lagos@ibime.edu.mx",
    avatarColor: "bg-indigo-900",
    id: "usr-dir-ibime-lagos",
    defaultPass: "DIR2026",
    category: "gestion",
    campusName: "Campus Lagos"
  },
  {
    name: "Lic. Marco Antonio Ruiz Peralta",
    role: "coordinator",
    grade: "Coordinación Académica & Enlace CCH UNAM",
    email: "coordinacion.academica@ibime.edu.mx",
    avatarColor: "bg-emerald-800",
    id: "usr-coord-ibime",
    defaultPass: "CRD2026",
    category: "gestion",
    campusName: "Campus Montes"
  },
  {
    name: "C.P. Mariana Rivas Corona",
    role: "billing",
    grade: "Tesorería, Facturación CFDI 4.0 & Cobranza",
    email: "finanzas@ibime.edu.mx",
    avatarColor: "bg-amber-700",
    id: "usr-billing-ibime",
    defaultPass: "COB2026",
    category: "gestion",
    campusName: "Sede Corporativa"
  },
  {
    name: "Don Guillermo Valdés Montes",
    role: "owner",
    grade: "Dirección Corporativa & Consejo Directivo IBIME",
    email: "dueno@ibime.edu.mx",
    avatarColor: "bg-slate-900",
    id: "usr-owner-ibime",
    defaultPass: "DUE2026",
    category: "gestion",
    campusName: "Red 4 Planteles"
  },
  // Docentes Bilingües IBIME
  {
    name: "Prof. Alejandro Mendoza Peña",
    role: "teacher",
    grade: "Biología CCH UNAM & Robótica STEAM (Campus Montes)",
    email: "alejandro.mendoza@ibime.edu.mx",
    avatarColor: "bg-blue-700",
    id: "usr-teacher-ibime-1",
    defaultPass: "IBI2026",
    category: "docentes",
    campusName: "Campus Montes"
  },
  {
    name: "Profa. Elizabeth Hernández Ramos",
    role: "teacher",
    grade: "Cambridge English & Formación Humana (Campus Lagos)",
    email: "elizabeth.hernandez@ibime.edu.mx",
    avatarColor: "bg-purple-700",
    id: "usr-teacher-ibime-2",
    defaultPass: "IBI2026",
    category: "docentes",
    campusName: "Campus Lagos"
  },
  {
    name: "Prof. Fernando Morales Vaca",
    role: "teacher",
    grade: "Matemáticas & Física Experimental (Campus San Cristóbal)",
    email: "fernando.morales@ibime.edu.mx",
    avatarColor: "bg-cyan-800",
    id: "usr-teacher-ibime-3",
    defaultPass: "IBI2026",
    category: "docentes",
    campusName: "Campus San Cristóbal"
  },
  {
    name: "Profa. Sofía Cordero Solís",
    role: "teacher",
    grade: "Robótica STEAM & Cálculo CCH (Campus Coacalco)",
    email: "sofia.cordero@ibime.edu.mx",
    avatarColor: "bg-rose-700",
    id: "usr-teacher-ibime-4",
    defaultPass: "IBI2026",
    category: "docentes",
    campusName: "Campus Coacalco"
  },
  // Alumnos y Familias con Perfil 360 IBIME
  {
    name: "Iker Santiago Morales Peña",
    role: "student",
    grade: "5º Primaria Bilingüe (Perfil 360 & Beca Excelencia)",
    email: "iker.morales@ibime.edu.mx",
    avatarColor: "bg-emerald-600",
    id: "std-ibime-montes-01",
    category: "estudiantes",
    campusName: "Campus Montes"
  },
  {
    name: "Ximena Valentina Castillo Ruiz",
    role: "student",
    grade: "3º Primaria Bilingüe (Proyectos Comunitarios NEM)",
    email: "ximena.castillo@ibime.edu.mx",
    avatarColor: "bg-blue-600",
    id: "std-ibime-lagos-01",
    category: "estudiantes",
    campusName: "Campus Lagos"
  },
  {
    name: "Mateo Emiliano Navas Mendoza",
    role: "student",
    grade: "2º Secundaria (Debate Bilingüe & Certificación KET)",
    email: "mateo.navas@ibime.edu.mx",
    avatarColor: "bg-amber-600",
    id: "std-ibime-san-01",
    category: "estudiantes",
    campusName: "Campus San Cristóbal"
  },
  {
    name: "Regina Sofía Albarrán Cruz",
    role: "student",
    grade: "4º Semestre Bachillerato CCH UNAM (Excelencia STEAM)",
    email: "regina.albarran@ibime.edu.mx",
    avatarColor: "bg-indigo-600",
    id: "std-ibime-coac-01",
    category: "estudiantes",
    campusName: "Campus Coacalco"
  },
  {
    name: "Familia Morales Peña",
    role: "parent",
    grade: "Tutor / Padre de Familia IBIME (Iker Morales 5ºA)",
    email: "familia.morales@ibime.edu.mx",
    avatarColor: "bg-teal-700",
    id: "usr-parent-ibime-01",
    defaultPass: "ISkoolPassword2026!",
    category: "estudiantes",
    campusName: "Campus Montes"
  }
];

/**
 * Resuelve de forma determinista y segura si un identificador o correo corresponde
 * a una identidad oficial del catálogo demo. Si es así, retorna el UserProfile con los
 * roles y permisos autorizados por el servidor (inmunes a inyecciones de cliente).
 */
export function resolveCanonicalDemoUser(identifier: string): UserProfile | null {
  if (!identifier) return null;
  let emailLower = identifier.toLowerCase().trim();

  // Alias para IBIME
  if (!emailLower.includes('@')) {
    if (
      emailLower.includes('ibime') ||
      emailLower.startsWith('directora') ||
      emailLower.startsWith('coordinacion') ||
      emailLower.startsWith('finanzas') ||
      emailLower.startsWith('dueno') ||
      emailLower.startsWith('profesor') ||
      emailLower.startsWith('profesora')
    ) {
      emailLower = `${emailLower}@ibime.edu.mx`;
    }
  }

  // 1. Catálogo IBIME
  const matchedIbime = IBIME_DEMO_ACCOUNTS.find(
    d => d.email.toLowerCase() === emailLower || d.id.toLowerCase() === emailLower
  );
  if (matchedIbime) {
    const nameParts = matchedIbime.name.split(' ');
    return {
      id: matchedIbime.id,
      school_id: 'sch-ibime',
      campus_name: matchedIbime.campusName || 'Campus Montes',
      first_name: nameParts[0] || 'Directivo',
      last_name: nameParts.slice(1).join(' ') || 'IBIME',
      role: matchedIbime.role as UserRole,
      email: matchedIbime.email,
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: new Date().toISOString()
    };
  }

  // 2. Catálogo General ISkool
  const matchedGeneral = GENERAL_DEMO_ACCOUNTS.find(
    d => d.email.toLowerCase() === emailLower || d.id.toLowerCase() === emailLower
  );
  if (matchedGeneral) {
    const nameParts = matchedGeneral.name.split(' ');
    const isIbime = matchedGeneral.email.includes('ibime');
    const schoolId = isIbime ? 'sch-ibime' : matchedGeneral.role === 'owner' ? 'sch-jjrosseau' : matchedGeneral.role === 'ceo' ? 'emp-bmw' : 'sch-test-case';
    return {
      id: matchedGeneral.id,
      school_id: schoolId,
      first_name: nameParts[0] || 'Usuario',
      last_name: nameParts.slice(1).join(' ') || 'Demo',
      role: matchedGeneral.role as UserRole,
      email: matchedGeneral.email,
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: new Date().toISOString()
    };
  }

  // 3. Super Usuarios Globales de Plataforma ISkool
  const matchedSuper = SUPER_USERS_ISKOOL_SEED.find(
    su => su.email?.toLowerCase() === emailLower || su.id.toLowerCase() === emailLower
  );
  if (matchedSuper) {
    return {
      ...matchedSuper,
      role: 'superadmin',
      updated_at: new Date().toISOString()
    };
  }

  // 4. Semillas de Alumnos de Laboratorio y Pruebas
  const matchedStudentSeed = STUDENTS_LIST_SEED.find(
    s => s.email?.toLowerCase() === emailLower || s.id.toLowerCase() === emailLower
  );
  if (matchedStudentSeed) {
    return {
      ...matchedStudentSeed,
      role: 'student',
      school_id: matchedStudentSeed.school_id || 'sch-test-case',
      updated_at: new Date().toISOString()
    };
  }

  // 5. Semilla de Docente Titular y Tutor
  if (emailLower === TEACHER_SEED.email.toLowerCase() || emailLower === TEACHER_SEED.id.toLowerCase()) {
    return {
      ...TEACHER_SEED,
      role: 'teacher',
      school_id: 'sch-test-case',
      updated_at: new Date().toISOString()
    };
  }

  if (emailLower === PARENT_SEED.email.toLowerCase() || emailLower === PARENT_SEED.id.toLowerCase()) {
    return {
      ...PARENT_SEED,
      role: 'parent',
      school_id: 'sch-test-case',
      updated_at: new Date().toISOString()
    };
  }

  // 6. Personal de Planteles (Staff Seed)
  const matchedStaff = STAFF_USERS_SEED.find(
    st => st.email?.toLowerCase() === emailLower || st.id.toLowerCase() === emailLower
  );
  if (matchedStaff) {
    return {
      ...matchedStaff,
      updated_at: new Date().toISOString()
    };
  }

  return null;
}
