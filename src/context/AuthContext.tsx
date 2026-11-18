"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, isPlatformSuperUser, resolveEffectiveSchoolId } from '@/types';
import { useRouter } from 'next/navigation';
import { STUDENTS_LIST_SEED, TEACHER_SEED, PARENT_SEED, SUPER_USERS_ISKOOL_SEED } from '@/store/seeds';
import { DEMO_STAFF_USERS, DEMO_TEACHERS } from '@/lib/demo/demoSchoolSeeds';

import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useOrganizationStore } from '@/store/useOrganizationStore';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';

let roleTransitionUntilMs = 0;
let roleTransitionTimeoutId: ReturnType<typeof setTimeout> | null = null;

export function isRoleTransitionInFlight(): boolean {
  return Date.now() < roleTransitionUntilMs;
}

export function beginRoleTransition(durationMs = 2500): void {
  roleTransitionUntilMs = Date.now() + durationMs;
}

export function endRoleTransition(): void {
  roleTransitionUntilMs = 0;
  if (roleTransitionTimeoutId) {
    clearTimeout(roleTransitionTimeoutId);
    roleTransitionTimeoutId = null;
  }
}

interface AuthContextType {
  session: any | null;
  user: UserProfile | null;
  loading: boolean;
  isSwitchingRole?: boolean;
  login: (email: string, userPassword?: string) => Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    mustChangePassword?: boolean;
    username?: string;
  }>;
  switchDemoPersona?: (email: string, userPassword?: string) => Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
  }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const getDemoUser = (email: string): UserProfile => {
  let emailLower = email.toLowerCase().trim();

  // Soporte para acceso directo con alias institucional (sin requerir escribir @ibime.edu.mx)
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

  // 0. Super Usuarios Globales de ISkool (Plataforma y Directorio Multi-Colegio)
  const matchedSuper = SUPER_USERS_ISKOOL_SEED.find(su => 
    su.email?.toLowerCase() === emailLower || 
    su.id === emailLower ||
    emailLower === 'admin' ||
    emailLower === 'superadmin' ||
    emailLower === 'admin@iskool.edu.mx'
  );
  if (matchedSuper) {
    return matchedSuper;
  }

  // 1. Verificar si coincide con personal administrativo registrado (Director, Coordinador, Cobranza)
  try {
    const adminStaff = useSchoolAdminStore.getState().staffUsers || [];
    const matchedStaff = adminStaff.find(s =>
      s.email.toLowerCase() === emailLower ||
      s.id === emailLower ||
      `${s.first_name.toLowerCase()}.${s.last_name.toLowerCase()}` === emailLower.replace(/@.*$/, '')
    );
    if (matchedStaff) {
      return matchedStaff;
    }

    // 2. Verificar si coincide con profesores registrados en el Super Usuario
    const adminTeachers = useSchoolAdminStore.getState().teachersList || [];
    const matchedTeacher = adminTeachers.find(t => 
      t.email?.toLowerCase() === emailLower || 
      t.id === emailLower ||
      `${t.first_name.toLowerCase()}.${t.last_name.toLowerCase()}` === emailLower.replace(/@.*$/, '') ||
      `${t.first_name.toLowerCase()}.${t.last_name.toLowerCase()}`.replace(/\s*\(.*?\)/g, '') === emailLower.replace(/@.*$/, '')
    );
    if (matchedTeacher) {
      return {
        ...matchedTeacher,
        role: 'teacher'
      };
    }

    // 3. Verificar si coincide con alumnos registrados en el Super Usuario
    const adminStudents = useSchoolAdminStore.getState().detailedStudents || [];
    const matchedStudent = adminStudents.find(s => 
      s.email?.toLowerCase() === emailLower || 
      s.id === emailLower ||
      s.curp?.toLowerCase() === emailLower ||
      s.enrollment_id?.toLowerCase() === emailLower ||
      `${s.first_name.toLowerCase()}.${s.last_name_1.toLowerCase()}` === emailLower.replace('@jjrosseau.edu.mx', '')
    );
    if (matchedStudent) {
      return {
        id: matchedStudent.id,
        first_name: matchedStudent.first_name,
        last_name: `${matchedStudent.last_name_1} ${matchedStudent.last_name_2 || ''}`.trim(),
        role: 'student',
        school_id: matchedStudent.school_id,
        email: matchedStudent.email || emailLower,
        is_blocked: matchedStudent.is_blocked || matchedStudent.status === 'suspendido',
        created_at: (matchedStudent as any).created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }
  } catch {
    // fallback si store no está montado
  }

  // ==========================================
  // RESOLUTORES OFICIALES INSTITUTO BILINGÜE IBIME
  // ==========================================
  if (
    emailLower === 'directora.general@ibime.edu.mx' ||
    emailLower === 'directora@ibime.edu.mx' ||
    emailLower === 'usr-dir-ibime-montes'
  ) {
    return {
      id: 'usr-dir-ibime-montes',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes (Sede Matriz & CCH)',
      first_name: 'Patricia',
      last_name: 'Sandoval Morales (Dirección General)',
      role: 'director',
      email: 'directora.general@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'directora.lagos@ibime.edu.mx' ||
    emailLower === 'usr-dir-ibime-lagos'
  ) {
    return {
      id: 'usr-dir-ibime-lagos',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-lagos',
      campus_name: 'Campus Lagos (Fundador 2004)',
      first_name: 'Carmen',
      last_name: 'Delgado Ríos (Dirección Lagos)',
      role: 'director',
      email: 'directora.lagos@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'coordinacion.academica@ibime.edu.mx' ||
    emailLower === 'coordinacion@ibime.edu.mx' ||
    emailLower === 'usr-coord-ibime'
  ) {
    return {
      id: 'usr-coord-ibime',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Coordinación Académica & Enlace CCH',
      first_name: 'Marco Antonio',
      last_name: 'Ruiz Peralta (Coordinación)',
      role: 'coordinator',
      email: 'coordinacion.academica@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'finanzas@ibime.edu.mx' ||
    emailLower === 'cobranza@ibime.edu.mx' ||
    emailLower === 'usr-billing-ibime'
  ) {
    return {
      id: 'usr-billing-ibime',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Tesorería & Facturación CFDI 4.0',
      first_name: 'Mariana',
      last_name: 'Rivas Corona (Cobranza)',
      role: 'billing',
      email: 'finanzas@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'dueno@ibime.edu.mx' ||
    emailLower === 'usr-owner-ibime'
  ) {
    return {
      id: 'usr-owner-ibime',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Dirección Corporativa IBIME',
      first_name: 'Don Guillermo',
      last_name: 'Valdés Montes (Consejo Directivo)',
      role: 'owner',
      email: 'dueno@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'alejandro.mendoza@ibime.edu.mx' ||
    emailLower === 'profesor.mendoza@ibime.edu.mx' ||
    emailLower === 'usr-teacher-ibime-1'
  ) {
    return {
      id: 'usr-teacher-ibime-1',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes (Sede Matriz & CCH)',
      first_name: 'Alejandro',
      last_name: 'Mendoza Peña (Docente CCH & STEAM)',
      role: 'teacher',
      email: 'alejandro.mendoza@ibime.edu.mx',
      assigned_subjects: ['Biología I-IV (Programa CCH UNAM)', 'Taller de Robótica STEAM & Mecatrónica IBIME'],
      assigned_groups: ['1º Semestre CCH UNAM Montes', '5ºA Primaria Bilingüe Montes'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'elizabeth.hernandez@ibime.edu.mx' ||
    emailLower === 'profesora.hernandez@ibime.edu.mx' ||
    emailLower === 'usr-teacher-ibime-2'
  ) {
    return {
      id: 'usr-teacher-ibime-2',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-lagos',
      campus_name: 'Campus Lagos (Fundador 2004)',
      first_name: 'Elizabeth',
      last_name: 'Hernández Ramos (Cambridge English)',
      role: 'teacher',
      email: 'elizabeth.hernandez@ibime.edu.mx',
      assigned_subjects: ['Cambridge English (Starters / Movers / Flyers)', 'Formación Humana, Liderazgo & Retórica IBIME'],
      assigned_groups: ['3ºA Primaria Lagos', 'Kínder 3 Bilingüe Lagos'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'fernando.morales@ibime.edu.mx' ||
    emailLower === 'usr-teacher-ibime-3'
  ) {
    return {
      id: 'usr-teacher-ibime-3',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-sancristobal',
      campus_name: 'Campus San Cristóbal (Ecatepec Centro)',
      first_name: 'Fernando',
      last_name: 'Morales Vaca (Matemáticas & Física)',
      role: 'teacher',
      email: 'fernando.morales@ibime.edu.mx',
      assigned_subjects: ['Matemáticas y Razonamiento Lógico', 'Física y Métodos Experimentales'],
      assigned_groups: ['2ºA Secundaria San Cristóbal', '3ºA Secundaria San Cristóbal'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'sofia.cordero@ibime.edu.mx' ||
    emailLower === 'usr-teacher-ibime-4'
  ) {
    return {
      id: 'usr-teacher-ibime-4',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-coacalco',
      campus_name: 'Campus Coacalco (Metropolitano)',
      first_name: 'Sofía',
      last_name: 'Cordero Solís (Cálculo & STEAM)',
      role: 'teacher',
      email: 'sofia.cordero@ibime.edu.mx',
      assigned_subjects: ['Taller de Robótica STEAM & Mecatrónica IBIME', 'Matemáticas y Cálculo CCH UNAM'],
      assigned_groups: ['4º Semestre CCH UNAM Coacalco', '1ºA Secundaria Coacalco'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'iker.morales@ibime.edu.mx' ||
    emailLower === 'std-ibime-montes-01'
  ) {
    return {
      id: 'std-ibime-montes-01',
      school_id: 'sch-ibime',
      first_name: 'Iker Santiago',
      last_name: 'Morales Peña',
      role: 'student',
      email: 'iker.morales@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'ximena.castillo@ibime.edu.mx' ||
    emailLower === 'std-ibime-lagos-01'
  ) {
    return {
      id: 'std-ibime-lagos-01',
      school_id: 'sch-ibime',
      first_name: 'Ximena Valentina',
      last_name: 'Castillo Ruiz',
      role: 'student',
      email: 'ximena.castillo@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'mateo.navas@ibime.edu.mx' ||
    emailLower === 'std-ibime-san-01'
  ) {
    return {
      id: 'std-ibime-san-01',
      school_id: 'sch-ibime',
      first_name: 'Mateo Emiliano',
      last_name: 'Navas Mendoza',
      role: 'student',
      email: 'mateo.navas@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'regina.albarran@ibime.edu.mx' ||
    emailLower === 'std-ibime-coac-01'
  ) {
    return {
      id: 'std-ibime-coac-01',
      school_id: 'sch-ibime',
      first_name: 'Regina Sofía',
      last_name: 'Albarrán Cruz',
      role: 'student',
      email: 'regina.albarran@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'familia.morales@ibime.edu.mx' ||
    emailLower === 'tutor.ibime@ejemplo.com' ||
    emailLower === 'usr-parent-ibime-01'
  ) {
    return {
      id: 'usr-parent-ibime-01',
      first_name: 'Familia Morales',
      last_name: 'Peña (Tutor IBIME)',
      role: 'parent',
      email: 'familia.morales@ibime.edu.mx',
      school_id: 'sch-ibime',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'familia.castillo@ibime.edu.mx' ||
    emailLower === 'usr-parent-ibime-ximena'
  ) {
    return {
      id: 'usr-parent-ibime-ximena',
      first_name: 'Familia Castillo',
      last_name: 'Ruiz (Tutor IBIME)',
      role: 'parent',
      email: 'familia.castillo@ibime.edu.mx',
      school_id: 'sch-ibime',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'familia.albarran@ibime.edu.mx' ||
    emailLower === 'usr-parent-ibime-regina'
  ) {
    return {
      id: 'usr-parent-ibime-regina',
      first_name: 'Familia Albarrán',
      last_name: 'Cruz (Tutor IBIME)',
      role: 'parent',
      email: 'familia.albarran@ibime.edu.mx',
      school_id: 'sch-ibime',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'familia.navas@ibime.edu.mx' ||
    emailLower === 'usr-parent-ibime-mateo'
  ) {
    return {
      id: 'usr-parent-ibime-mateo',
      first_name: 'Familia Navas',
      last_name: 'Corona (Tutor IBIME)',
      role: 'parent',
      email: 'familia.navas@ibime.edu.mx',
      school_id: 'sch-ibime',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // ==========================================
  // ALIAS GENÉRICOS DE ROLES MAPEADOS A IBIME
  // ==========================================
  if (
    emailLower === 'director' ||
    emailLower === 'directora' ||
    emailLower === 'director@ibime.edu.mx' ||
    emailLower === 'directora@ibime.edu.mx'
  ) {
    return {
      id: 'usr-dir-ibime-montes',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes (Sede Matriz & CCH)',
      first_name: 'Patricia',
      last_name: 'Sandoval Morales (Dirección General)',
      role: 'director',
      email: 'directora.general@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'coordinacion' ||
    emailLower === 'coordinacion@ibime.edu.mx' ||
    emailLower === 'coord@ibime.edu.mx'
  ) {
    return {
      id: 'usr-coord-ibime',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes (Sede Matriz & CCH)',
      first_name: 'Marco Antonio',
      last_name: 'Ruiz Peralta (Coordinación)',
      role: 'coordinator',
      email: 'coordinacion.academica@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'cobranza' ||
    emailLower === 'finanzas' ||
    emailLower === 'cobranza@ibime.edu.mx' ||
    emailLower === 'finanzas@ibime.edu.mx'
  ) {
    return {
      id: 'usr-billing-ibime',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Sede Corporativa IBIME',
      first_name: 'Mariana',
      last_name: 'Rivas Corona (Tesorería & Facturación)',
      role: 'billing',
      email: 'finanzas@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'dueno' ||
    emailLower === 'owner' ||
    emailLower === 'dueno@ibime.edu.mx'
  ) {
    return {
      id: 'usr-owner-ibime',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Red 4 Planteles IBIME',
      first_name: 'Don Guillermo',
      last_name: 'Valdés Montes (Dirección Corporativa)',
      role: 'owner',
      email: 'dueno@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'profesor' ||
    emailLower === 'profesora' ||
    emailLower === 'docente' ||
    emailLower === 'teacher' ||
    emailLower === 'profesor@ibime.edu.mx'
  ) {
    return {
      id: 'usr-teacher-ibime-1',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes (Sede Matriz & CCH)',
      first_name: 'Alejandro',
      last_name: 'Mendoza Peña (Docente Bilingüe)',
      role: 'teacher',
      email: 'alejandro.mendoza@ibime.edu.mx',
      assigned_subjects: ['Biología CCH UNAM', 'Robótica STEAM'],
      assigned_groups: ['5ºA Primaria', '2º Secundaria CCH'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'estudiante' ||
    emailLower === 'alumno' ||
    emailLower === 'student' ||
    emailLower === 'alumno@ibime.edu.mx'
  ) {
    return {
      id: 'std-ibime-montes-01',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes (Sede Matriz & CCH)',
      first_name: 'Iker Santiago',
      last_name: 'Morales Peña',
      role: 'student',
      email: 'iker.morales@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'tutor' ||
    emailLower === 'padre' ||
    emailLower === 'parent' ||
    emailLower === 'padre@ibime.edu.mx'
  ) {
    return {
      id: 'usr-parent-ibime-01',
      school_id: 'sch-ibime',
      campus_id: 'cmp-ibime-montes',
      campus_name: 'Campus Montes',
      first_name: 'Familia',
      last_name: 'Morales Peña (Tutor IBIME)',
      role: 'parent',
      email: 'familia.morales@ibime.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // ==========================================
  // SUPER USUARIOS GLOBALES DE PLATAFORMA ISKOOL
  // ==========================================
  const matchedSuperUser = SUPER_USERS_ISKOOL_SEED.find(su => 
    su.email.toLowerCase() === emailLower ||
    su.id.toLowerCase() === emailLower
  );
  if (matchedSuperUser) {
    return matchedSuperUser;
  }

  if (
    emailLower === 'director@iskool.edu.mx' ||
    emailLower === 'director@iskool.mx' ||
    emailLower === 'director.general@iskool.edu.mx' ||
    emailLower === 'reviewer@iskool.mx' ||
    emailLower === 'reviewer@iskool.edu.mx' ||
    emailLower === 'usr-dir-jjrosseau'
  ) {
    return {
      id: 'usr-dir-jjrosseau',
      school_id: 'sch-jjrosseau',
      campus_id: 'cmp-ros-delvalle',
      campus_name: 'Campus Del Valle (Sede Central)',
      first_name: 'Roberto',
      last_name: 'Gómez (Dirección General ISkool)',
      role: 'director',
      email: 'director@iskool.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'admin' || 
    emailLower === 'superadmin' ||
    emailLower === 'admin@iskool.edu.mx' ||
    emailLower === 'direccion@iskool.edu.mx' ||
    emailLower === 'usr-admin-1'
  ) {
    return SUPER_USERS_ISKOOL_SEED[0]; // Dirección General ISkool
  }

  if (
    emailLower === 'tecnologia' || 
    emailLower === 'tecnologia@iskool.edu.mx' ||
    emailLower === 'cto@iskool.edu.mx'
  ) {
    return SUPER_USERS_ISKOOL_SEED[1]; // Dirección de Tecnología ISkool
  }

  if (
    emailLower === 'pedagogia' || 
    emailLower === 'pedagogia@iskool.edu.mx'
  ) {
    return SUPER_USERS_ISKOOL_SEED[2]; // Dirección Pedagógica ISkool
  }

  // ==========================================
  // ENTORNOS DE DEMOSTRACIÓN GUIADA (Cuentas demo · CCT 0001)
  // ==========================================
  if (emailLower === 'demo.ceo@iskool.mx' || emailLower === 'usr-demo-ceo' || emailLower === 'demo-ceo-01') {
    return {
      id: 'usr-demo-ceo',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Presidencia & Dirección Ejecutiva (3 Planteles)',
      first_name: 'Dr. Alejandro',
      last_name: 'Villarreal Montes',
      role: 'ceo',
      email: 'demo.ceo@iskool.mx',
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  if (emailLower === 'demo.director@iskool.mx' || emailLower === 'usr-demo-director' || emailLower === 'usr-demo-dir-01') {
    return {
      id: 'usr-demo-director',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      first_name: 'Dra. Beatriz Elena',
      last_name: 'Santillán Torres',
      role: 'director',
      email: 'demo.director@iskool.mx',
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  if (emailLower === 'demo.docente@iskool.mx' || emailLower === 'usr-demo-teacher-1' || emailLower === 'usr-demo-teacher-01') {
    return {
      id: 'usr-demo-teacher-1',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      first_name: 'Prof. Alejandro',
      last_name: 'Ruiz',
      role: 'teacher',
      email: 'demo.docente@iskool.mx',
      assigned_subjects: ['Lenguajes (Español)', 'Saberes y Pensamiento Científico (Matemáticas)'],
      assigned_groups: ['5ºA'],
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  if (emailLower === 'demo.idiomas@iskool.mx' || emailLower === 'usr-demo-teacher-2' || emailLower === 'usr-demo-idiomas-01') {
    return {
      id: 'usr-demo-teacher-2',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-sec',
      campus_name: 'Campus Norte Secundaria',
      first_name: 'Profa. Claire',
      last_name: 'Dubois (Idiomas 3D)',
      role: 'teacher',
      email: 'demo.idiomas@iskool.mx',
      assigned_subjects: ['Lengua Extranjera (Inglés)', 'Francés Multilingüe'],
      assigned_groups: ['5ºA', '1ºA'],
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  if (emailLower === 'demo.familia@iskool.mx' || emailLower === 'usr-demo-parent-01') {
    return {
      id: 'usr-demo-parent-01',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      first_name: 'Laura Gómez',
      last_name: 'de Mendoza (Familia Demo)',
      role: 'parent',
      email: 'demo.familia@iskool.mx',
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  if (emailLower === 'demo.alumno@iskool.mx' || emailLower === 'demo.alumna@iskool.mx' || emailLower === 'std-demo-01') {
    return {
      id: 'std-demo-01',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      first_name: 'Valentina',
      last_name: 'Mendoza Gómez',
      role: 'student',
      email: 'demo.alumno@iskool.mx',
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  if (emailLower === 'demo.control@iskool.mx' || emailLower === 'demo.staff@iskool.mx' || emailLower === 'usr-demo-staff-1' || emailLower === 'usr-demo-billing-01') {
    return {
      id: 'usr-demo-staff-1',
      school_id: 'sch-demo-0001',
      campus_id: 'cmp-demo-pri',
      campus_name: 'Campus Central Primaria',
      first_name: 'Lic. Sofía',
      last_name: 'Reyes Aguilar',
      role: 'billing',
      email: 'demo.control@iskool.mx',
      temporary_password: 'DemoISkool2026!',
      created_at: '2026-03-10T08:00:00.000Z',
      updated_at: '2026-03-10T08:00:00.000Z'
    };
  }
  const matchedDemoStaff = DEMO_STAFF_USERS.find(
    (s) => s.email?.toLowerCase() === emailLower || s.id.toLowerCase() === emailLower
  );
  if (matchedDemoStaff) {
    return matchedDemoStaff;
  }
  const matchedDemoTeacher = DEMO_TEACHERS.find(
    (t) => t.email?.toLowerCase() === emailLower || t.id.toLowerCase() === emailLower
  );
  if (matchedDemoTeacher) {
    return { ...matchedDemoTeacher, role: 'teacher' };
  }

  // Fallback seguro: exclusivamente asignado al tenant IBIME
  const nameParts = emailLower.split('@')[0].split('.');
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Usuario';
  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'IBIME';

  return {
    id: `usr-ibime-${Date.now()}`,
    school_id: 'sch-ibime',
    campus_name: 'Campus Montes',
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    email: emailLower.includes('@') ? emailLower : `${emailLower}@ibime.edu.mx`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    // Salvaguarda dura: jamás bloquear la interfaz más de 2.8s en "Comprobando credenciales..."
    const hardTimeout = setTimeout(() => {
      setLoading(false);
    }, 2800);

    // Check active session on mount (Zero-Trust: Cookies HttpOnly prioritarias)
    const checkSession = async () => {
      try {
        // 1. Purgado proactivo de tokens heredados en localStorage para mitigar XSS
        if (typeof window !== 'undefined') {
          localStorage.removeItem('iskool_session_user');
          localStorage.removeItem('auth_current_user');
        }

        // 2. Consulta al endpoint seguro de sesión perimetral con Cookie HttpOnly (con timeout de 2s)
        try {
          const controller = new AbortController();
          const tId = setTimeout(() => controller.abort(), 2000);
          const sessionRes = await fetch('/api/auth/session', {
            cache: 'no-store',
            credentials: 'same-origin',
            signal: controller.signal
          });
          clearTimeout(tId);
          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            if (sessionData.authenticated && sessionData.user) {
              const liveUser = sessionData.user;
              setUser(liveUser);
              setSession({
                access_token: 'cookie-httponly-authenticated',
                user: liveUser
              });
              useSchoolAdminStore.getState().syncUserSchool(liveUser);
              setLoading(false);
              return;
            }
          }
        } catch (apiErr) {
          // Si el endpoint no responde temporalmente, continuar con respaldo de sesión activa
        }

        // 2.1 Respaldo inmediato en sessionStorage ante latencia o caché de CDN CloudFront
        if (typeof window !== 'undefined') {
          try {
            const cachedSessionRaw = sessionStorage.getItem('iskool_active_session_v2');
            if (cachedSessionRaw) {
              const cachedUser = JSON.parse(cachedSessionRaw) as UserProfile;
              if (cachedUser && cachedUser.id && cachedUser.role) {
                setUser(cachedUser);
                setSession({
                  access_token: 'session-storage-verified',
                  user: cachedUser
                });
                useSchoolAdminStore.getState().syncUserSchool(cachedUser);
                setLoading(false);
                return;
              }
            }
          } catch {}
        }

        // 3. Verificación de sesión en Supabase SDK (con timeout de 2s para evitar bloqueo en CDN)
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 2000)
        );
        const { data: { session: currentSession } } = await Promise.race([sessionPromise, timeoutPromise]);
        setSession(currentSession);
        if (currentSession?.user) {
          const u = currentSession.user;
          let restoredUser: UserProfile = {
            id: u.id,
            first_name: u.user_metadata?.first_name || 'Usuario',
            last_name: u.user_metadata?.last_name || '',
            role: (u.app_metadata?.role || 'student') as any,
            email: u.email || '',
            school_id: u.app_metadata?.school_id,
            created_at: u.created_at,
            updated_at: new Date().toISOString()
          };

          // Saneamiento de profesor Israel si viene sin school_id o con la escuela demo antigua
          if (restoredUser.id === 'usr-teacher-1' || restoredUser.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' || (restoredUser.email && restoredUser.email.toLowerCase().includes('israel.lopez') && restoredUser.role === 'teacher')) {
            const liveTeacher = (useSchoolAdminStore.getState().teachersList || []).find(t => t.id === 'usr-teacher-1') || TEACHER_SEED;
            restoredUser = {
              ...restoredUser,
              ...liveTeacher,
              school_id: liveTeacher.school_id || 'sch-test-case',
              campus_id: liveTeacher.campus_id || 'cmp-test-pri',
              campus_name: liveTeacher.campus_name || 'Primaria Laboratorio Demo',
              email: 'israel.lopez@sandbox.iskool.edu.mx'
            };
          }

          // Saneamiento reactivo de alumnos: asegurar su colegio correspondiente sch-test-case
          if (restoredUser.role === 'student' || restoredUser.id.startsWith('std-') || restoredUser.id.startsWith('c00a0eeb')) {
            const detailed = (useSchoolAdminStore.getState().detailedStudents || []).find(s => s.id === restoredUser.id || (restoredUser.email && s.email?.toLowerCase() === restoredUser.email.toLowerCase()));
            restoredUser = {
              ...restoredUser,
              school_id: detailed?.school_id || restoredUser.school_id || 'sch-test-case'
            };
          }

          const isSuper = isPlatformSuperUser(restoredUser) || restoredUser.role === 'admin' || restoredUser.role === 'superadmin' || restoredUser.id.startsWith('usr-superadmin');
          if (!isSuper) {
            const effectiveSchool = resolveEffectiveSchoolId(restoredUser, null, restoredUser.school_id || 'sch-test-case');
            if (useSchoolAdminStore.getState().isSchoolSuspended(effectiveSchool)) {
              setUser(null);
              setSession(null);
              return;
            }
          }

          setUser(restoredUser);
          useSchoolAdminStore.getState().syncUserSchool(restoredUser);

          // Sincronizar Cookie HttpOnly segura en segundo plano
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(restoredUser)
          }).catch(() => null);

          return;
        }
      } catch (err) {
        console.warn("Autenticación inicial de sesión completada.");
      } finally {
        clearTimeout(hardTimeout);
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state updates (preserve active seed/cookie session when Supabase SDK has no session)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (currentSession?.user) {
        setSession(currentSession);
        setUser({
          id: currentSession.user.id,
          first_name: currentSession.user.user_metadata?.first_name || 'Usuario',
          last_name: currentSession.user.user_metadata?.last_name || '',
          role: (currentSession.user.app_metadata?.role || 'student') as any,
          email: currentSession.user.email || '',
          school_id: currentSession.user.app_metadata?.school_id,
          created_at: currentSession.user.created_at,
          updated_at: new Date().toISOString()
        });
      }
    });

    // Sincronización automática reactiva de escuela según el usuario autenticado
    useSchoolAdminStore.getState().syncUserSchool(user);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sincronizar store administrativo cada vez que cambie el usuario activo
  useEffect(() => {
    useSchoolAdminStore.getState().syncUserSchool(user);
  }, [user]);

  const isMatchingLocalSeedCredential = (user: UserProfile, pass: string): boolean => {
    if (!pass) return false;
    const p = pass.trim();
    // Solo contraseñas explícitas adjuntas al registro de prueba del showcase o cuenta temporal
    if ((user as any).temporary_password && p === (user as any).temporary_password) {
      return true;
    }
    if ((user as any).defaultPass && p === (user as any).defaultPass) {
      return true;
    }
    return false;
  };

  const login = async (email: string, userPassword?: string): Promise<{
    success: boolean;
    user?: UserProfile;
    error?: string;
    mustChangePassword?: boolean;
    username?: string;
  }> => {
    // 1. Validación de entrada formal (soporte para credenciales de demostración)
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      return {
        success: false,
        error: 'Credenciales inválidas. Por favor ingrese correo y contraseña.'
      };
    }

    setLoading(true);

    const isCanonicalDemoPersonaEmail = [
      'demo.ceo@iskool.mx',
      'demo.director@iskool.mx',
      'demo.docente@iskool.mx',
      'demo.idiomas@iskool.mx',
      'demo.familia@iskool.mx',
      'demo.alumno@iskool.mx',
      'demo.alumna@iskool.mx',
      'demo.control@iskool.mx',
      'demo.staff@iskool.mx',
    ].includes(cleanEmail);

    // 1A. Verificación prioritaria para cuentas generadas en 5. Organización (con rotación de clave obligatoria)
    const orgCheck = isCanonicalDemoPersonaEmail
      ? { matched: false, validPassword: false, mustChangePassword: false, node: undefined }
      : useOrganizationStore
          .getState()
          .authenticateOrgAccount(cleanEmail, userPassword || '');
    if (orgCheck.matched) {
      if (!orgCheck.validPassword) {
        setLoading(false);
        return {
          success: false,
          error: 'Contraseña incorrecta o la contraseña inicial dada por el CEO ya dejó de funcionar.',
        };
      }
      if (orgCheck.mustChangePassword) {
        setLoading(false);
        return {
          success: false,
          mustChangePassword: true,
          username: orgCheck.node?.username || cleanEmail,
          error: 'Primer ingreso detectado: debe establecer su nueva contraseña personal.',
        };
      }

      const orgNode = orgCheck.node!;
      const isDemoCeoNode =
        orgNode.nodeId === 'demo-ceo-01' ||
        (orgNode.username || '').trim().toLowerCase() === 'demo.ceo@iskool.mx';
      const mappedRole: UserProfile['role'] =
        isDemoCeoNode
          ? 'ceo'
          : orgNode.category === 'profesor'
          ? 'teacher'
          : orgNode.subRole === 'director_general'
          ? 'director'
          : orgNode.subRole === 'finanzas'
          ? 'billing'
          : 'coordinator';
      const orgUser: UserProfile = {
        id: `usr-org-${orgNode.nodeId}`,
        email: orgNode.username,
        first_name: orgNode.firstName || orgNode.roleTitle,
        last_name: [orgNode.paternalLastName, orgNode.maternalLastName].filter(Boolean).join(' '),
        role: mappedRole,
        school_id: orgNode.schoolId || 'sch-test-case',
        campus_name: orgNode.campusName,
        is_blocked: false,
        created_at: orgNode.createdAt,
        updated_at: new Date().toISOString(),
      };
      const orgSession = {
        access_token: `org-session-${orgNode.nodeId}-${Date.now()}`,
        user: orgUser,
      };
      setSession(orgSession);
      setUser(orgUser);

      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('iskool_active_session_v2', JSON.stringify(orgUser));
        } catch {}
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: orgSession.access_token,
              password: (userPassword || '').trim(),
              user: orgUser,
            }),
          });
        } catch {}
      }
      useSchoolAdminStore.getState().syncUserSchool(orgUser);
      setLoading(false);
      return { success: true, user: orgUser };
    }

    const resolvedUser = getDemoUser(cleanEmail);
    const effectivePass = (userPassword && userPassword.trim()) ? userPassword.trim() : '';
    
    if (resolvedUser.is_blocked) {
      setLoading(false);
      return { 
        success: false, 
        error: '⛔ Esta cuenta ha sido inhabilitada por la Dirección Escolar.' 
      };
    }

    // Regla de Suspensión Institucional por Colegio
    const isSuperUser = isPlatformSuperUser(resolvedUser) || 
                        resolvedUser.role === 'admin' || 
                        resolvedUser.role === 'superadmin' || 
                        resolvedUser.id.startsWith('usr-superadmin') || 
                        resolvedUser.id === 'usr-admin-1';

    if (!isSuperUser) {
      let userSchoolId = resolvedUser.school_id;
      if (!userSchoolId) {
        const adminStore = useSchoolAdminStore.getState();
        const std = (adminStore.detailedStudents || []).find(s => s.id === resolvedUser.id || s.email?.toLowerCase() === cleanEmail);
        if (std) userSchoolId = std.school_id;
        const tch = (adminStore.teachersList || []).find(t => t.id === resolvedUser.id || t.email?.toLowerCase() === cleanEmail);
        if (tch) userSchoolId = tch.school_id;
        const stf = (adminStore.staffUsers || []).find(s => s.id === resolvedUser.id || s.email?.toLowerCase() === cleanEmail);
        if (stf) userSchoolId = stf.school_id;
      }

      const effectiveSchool = resolveEffectiveSchoolId(
        { ...resolvedUser, school_id: userSchoolId },
        null,
        userSchoolId || 'sch-jjrosseau'
      );

      if (useSchoolAdminStore.getState().isSchoolSuspended(effectiveSchool)) {
        setLoading(false);
        return {
          success: false,
          error: 'Cuenta inhabilitada. Favor de ponerse en contacto con el administrador del colegio.'
        };
      }
    }

    let finalUser: UserProfile | null = null;
    let sessionObj: any = null;
    let sessionAlreadySynced = false;

    // 1. Verificación autoritativa en servidor (/api/auth/session) para credenciales institucionales y cuentas demo
    if (typeof window !== 'undefined' && effectivePass) {
      try {
        const serverRes = await fetch('/api/auth/session', {
          method: 'POST',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: effectivePass,
            user: { id: resolvedUser.id, email: resolvedUser.email }
          })
        });
        if (serverRes.ok) {
          const serverData = await serverRes.json().catch(() => null);
          if (serverData?.success && serverData?.user) {
            finalUser = {
              ...resolvedUser,
              ...serverData.user,
              updated_at: new Date().toISOString()
            };
            sessionObj = { user: finalUser };
            sessionAlreadySynced = true;
          }
        }
      } catch {
        // Fallback a verificación secundaria
      }
    }

    if (!finalUser && isMatchingLocalSeedCredential(resolvedUser, effectivePass)) {
      finalUser = {
        ...resolvedUser,
        updated_at: new Date().toISOString()
      };
      sessionObj = { user: finalUser };
    }

    // 2. Intentar autenticación criptográfica con el proveedor Auth si no coincidió con catálogo de servidor
    if (!finalUser) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: effectivePass
        });

        if (!error && data?.user && data?.session) {
          const userObj = data.user;
          sessionObj = data.session;
          finalUser = {
            id: userObj.id,
            first_name: userObj.user_metadata?.first_name || resolvedUser.first_name,
            last_name: userObj.user_metadata?.last_name || resolvedUser.last_name,
            role: (userObj.app_metadata?.role || resolvedUser.role) as any,
            email: userObj.email || resolvedUser.email,
            school_id: userObj.app_metadata?.school_id || resolvedUser.school_id,
            created_at: userObj.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
        }
      } catch {
        // Error de red o credenciales no encontradas
      }
    }

    if (!finalUser) {
      setLoading(false);
      return {
        success: false,
        error: 'Credenciales incorrectas o clave no asignada para esta cuenta.'
      };
    }

    setSession(sessionObj);
    setUser(finalUser);
    
    // Sincronización en Cookie HttpOnly perimetral (Zero-Trust) y tenant
    if (typeof window !== 'undefined') {
      localStorage.removeItem('iskool_session_user');
      localStorage.removeItem('auth_current_user');
      try {
        sessionStorage.setItem('iskool_active_session_v2', JSON.stringify(finalUser));
      } catch {}

      const isIbimeTenant = finalUser.school_id === 'sch-ibime' || (finalUser.email && finalUser.email.toLowerCase().includes('ibime'));
      const resolvedTenant = isIbimeTenant ? 'ibime' : 'iskool';

      if (!sessionAlreadySynced) {
        try {
          await fetch('/api/auth/session', {
            method: 'POST',
            cache: 'no-store',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              access_token: sessionObj?.access_token,
              password: effectivePass,
              user: finalUser
            })
          });
        } catch {
          // No bloquear la interfaz ante latencia de red secundaria
        }
      }

      const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `tenant-id=${resolvedTenant}; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
    }
    if (isPlatformSuperUser(finalUser)) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('iskool_super_just_logged_in', 'true');
      }
      useSchoolAdminStore.getState().selectSchool(null as any);
    } else {
      useSchoolAdminStore.getState().syncUserSchool(finalUser);
    }

    setLoading(false);
    return { success: true, user: finalUser };
  };

  /**
   * Conmutación instantánea en caliente entre las cuentas del entorno Cuentas demo (sch-demo-0001).
   * Evita activar loading global (cero pantallas intermedias ni rebote a /login) sincronizando
   * primero la cookie HttpOnly y blindando la transición mientras Next.js cambia de ruta.
   */
  const switchDemoPersona = async (
    email: string,
    userPassword?: string
  ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail || !isDemoSandboxContext({ email: cleanEmail })) {
      return login(email, userPassword);
    }

    const resolvedUser = getDemoUser(cleanEmail);
    const effectivePass = userPassword && userPassword.trim() ? userPassword.trim() : 'DemoISkool2026!';
    let finalUser: UserProfile = {
      ...resolvedUser,
      school_id: resolvedUser.school_id || 'sch-demo-0001',
      updated_at: new Date().toISOString(),
    };

    beginRoleTransition(2800);
    setIsSwitchingRole(true);

    if (typeof window !== 'undefined') {
      try {
        const serverRes = await fetch('/api/auth/session', {
          method: 'POST',
          cache: 'no-store',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            password: effectivePass,
            user: { id: resolvedUser.id, email: resolvedUser.email },
          }),
        });
        if (serverRes.ok) {
          const serverData = await serverRes.json().catch(() => null);
          if (serverData?.success && serverData?.user) {
            finalUser = {
              ...resolvedUser,
              ...serverData.user,
              school_id: serverData.user.school_id || resolvedUser.school_id || 'sch-demo-0001',
              updated_at: new Date().toISOString(),
            };
          }
        }
      } catch {
        // Conservar perfil resuelto en memoria si hay latencia local
      }

      try {
        sessionStorage.setItem('iskool_active_session_v2', JSON.stringify(finalUser));
      } catch {}
      const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `tenant-id=iskool; path=/; max-age=604800; SameSite=Lax${secureAttr}`;
    }

    beginRoleTransition(2200);
    useSchoolAdminStore.getState().syncUserSchool(finalUser);
    setSession({ user: finalUser });
    setUser(finalUser);

    if (roleTransitionTimeoutId) {
      clearTimeout(roleTransitionTimeoutId);
    }
    roleTransitionTimeoutId = setTimeout(() => {
      endRoleTransition();
      setIsSwitchingRole(false);
    }, 1800);

    return { success: true, user: finalUser };
  };

  const logout = async () => {
    endRoleTransition();
    setIsSwitchingRole(false);
    setLoading(true);
    await supabase.auth.signOut().catch(() => null);
    
    // Invalida la cookie HttpOnly en el servidor
    await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('iskool_session_user');
      localStorage.removeItem('auth_current_user');
      sessionStorage.removeItem('iskool_super_just_logged_in');
      sessionStorage.removeItem('iskool_active_session_v2');
      const secureAttr = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `iskool_session=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
      document.cookie = `ibime_session=; path=/; max-age=0; SameSite=Lax${secureAttr}`;
    }
    useSchoolAdminStore.getState().selectSchool(null as any);
    useSchoolAdminStore.getState().syncUserSchool(null);
    setSession(null);
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isSwitchingRole, login, switchDemoPersona, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
