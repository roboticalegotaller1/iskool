import { UserProfile, UserRole } from '@/types';
import { SUPER_USERS_ISKOOL_SEED } from '@/store/seeds';

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

// Cuentas demo exclusivas del Instituto Bilingüe IBIME (Único tenant demo autorizado)
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

// Alias para garantizar compatibilidad con componentes que consuman GENERAL_DEMO_ACCOUNTS
export const GENERAL_DEMO_ACCOUNTS: DemoAccount[] = IBIME_DEMO_ACCOUNTS;

/**
 * Resuelve de forma determinista y segura si un identificador o correo corresponde
 * a una identidad oficial del catálogo demo IBIME.
 */
export function resolveCanonicalDemoUser(identifier: string): UserProfile | null {
  if (!identifier) return null;
  let emailLower = identifier.toLowerCase().trim();

  if (emailLower === 'usr-teacher-1' || emailLower.includes('israel.lopez')) {
    return {
      id: 'usr-teacher-1',
      school_id: 'sch-ibime',
      campus_name: 'Campus Montes',
      first_name: 'Profesor',
      last_name: 'Docente IBIME',
      role: 'teacher' as UserRole,
      email: 'profesor.docente@ibime.edu.mx',
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: new Date().toISOString()
    };
  }
  if (emailLower === 'std-pa' || emailLower.includes('lucas@iskool.edu.mx')) {
    return {
      id: 'std-pa',
      school_id: 'sch-ibime',
      campus_name: 'Campus Montes',
      first_name: 'Lucas',
      last_name: 'Estudiante IBIME',
      role: 'student' as UserRole,
      email: 'lucas.alumno@ibime.edu.mx',
      created_at: '2026-01-01T08:00:00.000Z',
      updated_at: new Date().toISOString()
    };
  }

  // Alias para roles directos mapeados a IBIME
  if (!emailLower.includes('@')) {
    if (emailLower === 'director' || emailLower === 'directora' || emailLower.startsWith('directora')) {
      emailLower = 'directora.general@ibime.edu.mx';
    } else if (emailLower === 'coordinacion' || emailLower.startsWith('coordinacion')) {
      emailLower = 'coordinacion.academica@ibime.edu.mx';
    } else if (emailLower === 'finanzas' || emailLower === 'cobranza' || emailLower.startsWith('finanzas') || emailLower.startsWith('cobranza')) {
      emailLower = 'finanzas@ibime.edu.mx';
    } else if (emailLower === 'dueno' || emailLower === 'owner' || emailLower.startsWith('dueno')) {
      emailLower = 'dueno@ibime.edu.mx';
    } else if (emailLower === 'profesor' || emailLower === 'profesora' || emailLower === 'docente' || emailLower === 'teacher' || emailLower.startsWith('profesor') || emailLower.startsWith('profesora')) {
      emailLower = 'alejandro.mendoza@ibime.edu.mx';
    } else if (emailLower === 'estudiante' || emailLower === 'alumno' || emailLower === 'student') {
      emailLower = 'iker.morales@ibime.edu.mx';
    } else if (emailLower === 'padre' || emailLower === 'tutor' || emailLower === 'parent') {
      emailLower = 'familia.morales@ibime.edu.mx';
    } else if (emailLower.includes('ibime')) {
      emailLower = `${emailLower}@ibime.edu.mx`;
    }
  }

  // 1. Catálogo IBIME (Única fuente de demo permitida)
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

  // 2. Super Usuarios Globales de Plataforma ISkool
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

  return null;
}
