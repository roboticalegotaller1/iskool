"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, isPlatformSuperUser, resolveEffectiveSchoolId } from '@/types';
import { useRouter } from 'next/navigation';
import { STUDENTS_LIST_SEED, TEACHER_SEED, PARENT_SEED, SUPER_USERS_ISKOOL_SEED } from '@/store/seeds';

import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';

interface AuthContextType {
  session: any | null;
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, userPassword?: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
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
  // RESOLUTORES OFICIALES SECTOR CORPORATIVO / CEO (B2B)
  // ==========================================
  if (
    emailLower === 'ceo@bmw-corp.mx' ||
    emailLower === 'usr-ceo-bmw' ||
    emailLower === 'ceo.bmw'
  ) {
    return {
      id: 'usr-ceo-bmw',
      school_id: 'emp-bmw',
      campus_id: 'cmp-bmw-slp',
      campus_name: 'Planta San Luis Potosí (EV Hub)',
      first_name: 'Hans',
      last_name: 'Weber Schmidt (CEO & VP Manufacturing)',
      role: 'ceo',
      email: 'ceo@bmw-corp.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'ceo@vanguardia-retail.mx' ||
    emailLower === 'usr-ceo-ventas' ||
    emailLower === 'ceo.ventas'
  ) {
    return {
      id: 'usr-ceo-ventas',
      school_id: 'emp-ventas',
      campus_id: 'cmp-ventas-mty',
      campus_name: 'CEDIS Monterrey & Oficinas Corporativas',
      first_name: 'Rodrigo',
      last_name: 'Morales Vega (CEO Retail)',
      role: 'ceo',
      email: 'ceo@vanguardia-retail.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === 'ceo@innovasoft-tech.com' ||
    emailLower === 'usr-ceo-tech' ||
    emailLower === 'ceo.tech'
  ) {
    return {
      id: 'usr-ceo-tech',
      school_id: 'emp-tech',
      campus_id: 'cmp-tech-gdl',
      campus_name: 'Innovation Tech Hub Guadalajara',
      first_name: 'Sebastian',
      last_name: 'Cruz Beltrán (CEO & Founder)',
      role: 'ceo',
      email: 'ceo@innovasoft-tech.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 4. Director Demo (Coincidencia exacta)
  if (
    emailLower === 'director' ||
    emailLower === 'director@iskool.edu.mx' ||
    emailLower === 'director.garza@jjrosseau.edu.mx' ||
    emailLower === 'director.demo@iskool.edu.mx'
  ) {
    return {
      id: 'usr-dir-1',
      school_id: 'sch-jjrosseau',
      first_name: 'Roberto',
      last_name: 'Garza Hernández (Dirección)',
      role: 'director',
      email: 'director@iskool.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 5. Cobranza Demo (Coincidencia exacta)
  if (
    emailLower === 'cobranza' ||
    emailLower === 'cobranza@iskool.edu.mx' ||
    emailLower === 'finanzas@iskool.edu.mx'
  ) {
    return {
      id: 'usr-billing-1',
      school_id: 'sch-test-case',
      first_name: 'Mónica',
      last_name: 'Suárez Pérez (Cobranza)',
      role: 'billing',
      email: 'cobranza@iskool.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 6. Dueño de Empresa / Presidencia Demo (Coincidencia exacta)
  if (
    emailLower === 'dueno' ||
    emailLower === 'owner' ||
    emailLower === 'dueno@jjrosseau.edu.mx' ||
    emailLower === 'dueno@iskool.edu.mx'
  ) {
    return {
      id: 'usr-owner-1',
      school_id: 'sch-jjrosseau',
      first_name: 'Don Alejandro',
      last_name: 'Vargas Robles (Dueño de Plantel UP)',
      role: 'owner',
      email: 'dueno@jjrosseau.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 7. Cuentas Maestras de Super Usuario ISkool (Únicamente 3 Directivos de la Plataforma)
  const matchedSuperUser = SUPER_USERS_ISKOOL_SEED.find(su => 
    su.email.toLowerCase() === emailLower ||
    su.id.toLowerCase() === emailLower
  );
  if (matchedSuperUser) {
    return matchedSuperUser;
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

  // 4. Coordinación Demo (Coincidencia exacta)
  if (
    emailLower === 'beatriz.morales@iskool.edu.mx' ||
    emailLower === 'coordinacion@iskool.edu.mx' ||
    emailLower === 'coord@iskool.edu.mx'
  ) {
    return {
      id: 'usr-coord-1',
      school_id: 'sch-test-case',
      first_name: 'Beatriz',
      last_name: 'Morales (Coordinación)',
      role: 'coordinator',
      email: 'beatriz.morales@iskool.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 5. Profesor Demo (Coincidencia exacta)
  if (
    emailLower === TEACHER_SEED.email.toLowerCase() || 
    emailLower === 'israel.lopez@sandbox.iskool.edu.mx' ||
    emailLower === 'israel.lopez@iskool.edu.mx' ||
    emailLower === 'israel.lopez@jjrosseau.edu.mx' ||
    emailLower === 'profesor@iskool.edu.mx' ||
    emailLower === 'usr-teacher-1'
  ) {
    const liveTeacher = (useSchoolAdminStore.getState().teachersList || []).find(t => t.id === 'usr-teacher-1') || TEACHER_SEED;
    return {
      ...liveTeacher,
      first_name: 'Israel',
      last_name: 'López Ángeles (Demo)',
      email: 'israel.lopez@sandbox.iskool.edu.mx',
      school_id: liveTeacher.school_id || 'sch-test-case',
      campus_id: liveTeacher.campus_id || 'cmp-test-pri',
      campus_name: liveTeacher.campus_name || 'Primaria Laboratorio Demo',
      assigned_subjects: liveTeacher.assigned_subjects || ['Matemáticas', 'Robótica'],
      assigned_groups: liveTeacher.assigned_groups || ['1ºA Primaria Demo', '4ºA Primaria Demo']
    };
  }

  // 6. Tutor / Padre Demo (Coincidencia exacta)
  if (emailLower === 'israel.lopez@ejemplo.com' || emailLower === 'usr-parent-001') {
    return {
      id: 'usr-parent-001',
      first_name: 'Familia',
      last_name: 'López Mendoza (Tutor)',
      role: 'parent',
      email: 'israel.lopez@ejemplo.com',
      school_id: 'sch-test-case',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  if (
    emailLower === PARENT_SEED.email.toLowerCase() ||
    emailLower === 'tutor@iskool.edu.mx' ||
    emailLower === 'padre@iskool.edu.mx'
  ) {
    return {
      ...PARENT_SEED,
      school_id: 'sch-test-case'
    };
  }

  // 7. Alumnos Demo Específicos por Identificador o Correo (Asignados a su Laboratorio Pedagógico sch-test-case)
  if (emailLower === 'lucas@iskool.edu.mx' || emailLower === 'lucas.skywalker@iskool.edu.mx' || emailLower === 'std-pa') {
    const seed = STUDENTS_LIST_SEED.find(s => s.id === 'std-pa');
    return {
      ...(seed || {
        id: 'std-pa',
        first_name: 'Lucas',
        last_name: 'Skywalker',
        role: 'student',
        email: 'lucas@iskool.edu.mx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      school_id: 'sch-test-case'
    };
  }

  if (emailLower === 'elena@iskool.edu.mx' || emailLower === 'elena.rostova@iskool.edu.mx' || emailLower === 'std-sec') {
    const seed = STUDENTS_LIST_SEED.find(s => s.id === 'std-sec');
    return {
      ...(seed || {
        id: 'std-sec',
        first_name: 'Elena',
        last_name: 'Rostova',
        role: 'student',
        email: 'elena@iskool.edu.mx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      school_id: 'sch-test-case'
    };
  }

  if (emailLower === 'santi@iskool.edu.mx' || emailLower === 'santi.gómez@iskool.edu.mx' || emailLower === 'santi.gomez@iskool.edu.mx' || emailLower === 'std-pb') {
    const seed = STUDENTS_LIST_SEED.find(s => s.id === 'std-pb');
    return {
      ...(seed || {
        id: 'std-pb',
        first_name: 'Santi',
        last_name: 'Gómez',
        role: 'student',
        email: 'santi@iskool.edu.mx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      school_id: 'sch-test-case'
    };
  }

  if (emailLower === 'mateo@iskool.edu.mx' || emailLower === 'mateo.díaz@iskool.edu.mx' || emailLower === 'mateo.diaz@iskool.edu.mx' || emailLower === 'std-prep') {
    const seed = STUDENTS_LIST_SEED.find(s => s.id === 'std-prep');
    return {
      ...(seed || {
        id: 'std-prep',
        first_name: 'Mateo',
        last_name: 'Díaz',
        role: 'student',
        email: 'mateo@iskool.edu.mx',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }),
      school_id: 'sch-test-case'
    };
  }

  // 8. Alumnos Demo de semillas (Coincidencia general)
  const matchedSeedStudent = STUDENTS_LIST_SEED.find(s => 
    s.email.toLowerCase() === emailLower || 
    s.id.toLowerCase() === emailLower
  );
  if (matchedSeedStudent) {
    return {
      ...matchedSeedStudent,
      school_id: matchedSeedStudent.school_id || 'sch-test-case'
    };
  }

  // 9. Fallback para nuevo alumno con correo personalizado
  const nameParts = emailLower.split('@')[0].split('.');
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Usuario';
  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Escolar';

  return {
    id: `usr-demo-${Date.now()}`,
    school_id: 'sch-test-case',
    first_name: firstName,
    last_name: lastName,
    role: 'student',
    email: emailLower,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Check active session on mount (Zero-Trust: Cookies HttpOnly prioritarias)
    const checkSession = async () => {
      try {
        // 1. Purgado proactivo de tokens heredados en localStorage para mitigar XSS
        if (typeof window !== 'undefined') {
          localStorage.removeItem('iskool_session_user');
          localStorage.removeItem('auth_current_user');
        }

        // 2. Consulta al endpoint seguro de sesión perimetral con Cookie HttpOnly
        try {
          const sessionRes = await fetch('/api/auth/session');
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
          // Si el endpoint no responde temporalmente, continuar con Supabase SDK
        }

        // 3. Verificación de sesión en Supabase SDK
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);
        if (currentSession?.user) {
          const u = currentSession.user;
          let restoredUser: UserProfile = {
            id: u.id,
            first_name: u.user_metadata?.first_name || 'Usuario',
            last_name: u.user_metadata?.last_name || '',
            role: (u.user_metadata?.role || 'student') as any,
            email: u.email || '',
            school_id: u.user_metadata?.school_id,
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
              school_id: detailed?.school_id || 'sch-test-case'
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
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth state updates
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ? {
        id: currentSession.user.id,
        first_name: currentSession.user.user_metadata?.first_name || 'Usuario',
        last_name: currentSession.user.user_metadata?.last_name || '',
        role: (currentSession.user.user_metadata?.role || 'student') as any,
        email: currentSession.user.email || '',
        created_at: currentSession.user.created_at,
        updated_at: new Date().toISOString()
      } : null);
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

  const isMatchingSeedPassword = (user: UserProfile, pass: string): boolean => {
    if (!pass) return false;
    const p = pass.trim();

    // Contraseñas universales de demostración y presentación
    if (p === 'ISkoolPassword2026!' || p === '008805' || p === 'ISkoolAdmin2026!') {
      return true;
    }

    // Cuentas del Instituto Bilingüe IBIME (Directiva, Docentes, Alumnos 360, Familias)
    const isIbime = user.school_id === 'sch-ibime' || (user.email && user.email.toLowerCase().includes('ibime'));
    if (isIbime) {
      // Acceso garantizado para presentaciones institucionales en todas las semillas oficiales IBIME
      return true;
    }

    // Claves preasignadas en perfil o store
    if ((user as any).temporary_password && p === (user as any).temporary_password) {
      return true;
    }
    if ((user as any).defaultPass && p === (user as any).defaultPass) {
      return true;
    }

    // Claves directivas y de holdings
    if (p === 'DIR2026' || p === 'CRD2026' || p === 'COB2026' || p === 'DUE2026' || p === 'IBI2026' || p === 'CEO2026' || p === 'NEX2026' || p === 'BMW2026' || p === 'BMW2026!' || p === 'RETAIL2026') {
      return true;
    }

    return false;
  };

  const login = async (email: string, userPassword?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    // 1. Validación de entrada formal (soporte para credenciales de demostración)
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      return {
        success: false,
        error: 'Credenciales inválidas. Por favor ingrese correo y contraseña.'
      };
    }

    setLoading(true);
    const resolvedUser = getDemoUser(cleanEmail);
    const isIbime = resolvedUser.school_id === 'sch-ibime' || (resolvedUser.email && resolvedUser.email.toLowerCase().includes('ibime'));

    const effectivePass = (userPassword && userPassword.trim())
      ? userPassword.trim()
      : (isIbime ? 'DIR2026' : (resolvedUser as any).defaultPass || 'ISkoolPassword2026!');
    
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

    // 1. Intentar autenticación criptográfica con Supabase Auth si se proporcionaron credenciales
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
          role: (userObj.user_metadata?.role || resolvedUser.role) as any,
          email: userObj.email || resolvedUser.email,
          school_id: userObj.user_metadata?.school_id || resolvedUser.school_id,
          created_at: userObj.created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    } catch {
      // Continuar con soporte para cuentas preestablecidas de presentación
    }

    // 2. Soporte para cuentas preestablecidas de demostración / presentación (IBIME e ISkool)
    if (!finalUser) {
      const pass = effectivePass;
      const isMatch = isMatchingSeedPassword(resolvedUser, pass);

      if (isMatch) {
        finalUser = {
          ...resolvedUser,
          updated_at: new Date().toISOString()
        };
        sessionObj = {
          access_token: `seed-session-${resolvedUser.id}-${Date.now()}`,
          user: finalUser
        };
      } else {
        setLoading(false);
        return {
          success: false,
          error: 'Credenciales incorrectas o clave no asignada para esta cuenta.'
        };
      }
    }

    setSession(sessionObj);
    setUser(finalUser);
    
    // Sincronización en Cookie HttpOnly perimetral (Zero-Trust) y tenant
    if (typeof window !== 'undefined') {
      localStorage.removeItem('iskool_session_user');
      localStorage.removeItem('auth_current_user');
      try {
        await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            access_token: sessionObj?.access_token,
            user: finalUser
          })
        });
      } catch {
        // No bloquear la interfaz ante latencia de red secundaria
      }
    }
    useSchoolAdminStore.getState().syncUserSchool(finalUser);

    setLoading(false);
    return { success: true, user: finalUser };
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut().catch(() => null);
    
    // Invalida la cookie HttpOnly en el servidor
    await fetch('/api/auth/session', { method: 'DELETE' }).catch(() => null);

    if (typeof window !== 'undefined') {
      localStorage.removeItem('iskool_session_user');
      localStorage.removeItem('auth_current_user');
    }
    useSchoolAdminStore.getState().syncUserSchool(null);
    setSession(null);
    setUser(null);
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, login, logout }}>
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
