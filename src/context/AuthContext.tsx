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

const getDemoUser = (email: string): UserProfile => {
  const emailLower = email.toLowerCase().trim();

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
      temporary_password: 'DIR2026',
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
      temporary_password: 'COB2026',
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
      temporary_password: 'DUE2026',
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
      temporary_password: '008805',
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
      temporary_password: 'ISkoolPassword2026!',
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
      school_id: 'sch-jjrosseau'
    };
  }

  // 7. Alumnos Demo Específicos por Identificador o Correo
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
      school_id: 'sch-jjrosseau'
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
      school_id: 'sch-jjrosseau'
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
      school_id: 'sch-jjrosseau'
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
      school_id: 'sch-jjrosseau'
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
      school_id: matchedSeedStudent.school_id || 'sch-jjrosseau'
    };
  }

  // 8. Fallback para nuevo alumno con correo personalizado
  const nameParts = emailLower.split('@')[0].split('.');
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Usuario';
  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Escolar';

  return {
    id: `usr-demo-${Date.now()}`,
    school_id: 'sch-jjrosseau',
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
    // Check active session on mount
    const checkSession = async () => {
      try {
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

          const isSuper = isPlatformSuperUser(restoredUser) || restoredUser.role === 'admin' || restoredUser.role === 'superadmin' || restoredUser.id.startsWith('usr-superadmin');
          if (!isSuper) {
            const effectiveSchool = resolveEffectiveSchoolId(restoredUser, null, restoredUser.school_id || 'sch-test-case');
            if (useSchoolAdminStore.getState().isSchoolSuspended(effectiveSchool)) {
              setUser(null);
              setSession(null);
              if (typeof window !== 'undefined') {
                localStorage.removeItem('iskool_session_user');
                localStorage.setItem('iskool_suspension_error', 'cuenta inhabilitada favor de ponerse en contacto con el administrador del colegio');
              }
              return;
            }
          }

          setUser(restoredUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('iskool_session_user', JSON.stringify(restoredUser));
          }
          useSchoolAdminStore.getState().syncUserSchool(restoredUser);
          return;
        }

        // Recuperación de sesión local en modo offline / fallback
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('iskool_session_user');
          if (saved) {
            try {
              let parsed = JSON.parse(saved);
              if (parsed && parsed.id && parsed.role) {
                // Saneamiento reactivo de profesor Israel si tenía guardada la escuela antigua o vacía
                if (parsed.id === 'usr-teacher-1' || parsed.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' || (parsed.email && parsed.email.toLowerCase().includes('israel.lopez') && parsed.role === 'teacher')) {
                  const liveTeacher = (useSchoolAdminStore.getState().teachersList || []).find(t => t.id === 'usr-teacher-1') || TEACHER_SEED;
                  parsed = {
                    ...parsed,
                    ...liveTeacher,
                    school_id: liveTeacher.school_id || 'sch-test-case',
                    campus_id: liveTeacher.campus_id || 'cmp-test-pri',
                    campus_name: liveTeacher.campus_name || 'Primaria Laboratorio Demo',
                    email: 'israel.lopez@sandbox.iskool.edu.mx'
                  };
                  localStorage.setItem('iskool_session_user', JSON.stringify(parsed));
                }

                const isSuper = isPlatformSuperUser(parsed) || parsed.role === 'admin' || parsed.role === 'superadmin' || parsed.id.startsWith('usr-superadmin');
                if (!isSuper) {
                  const effectiveSchool = resolveEffectiveSchoolId(parsed, null, parsed.school_id || 'sch-test-case');
                  if (useSchoolAdminStore.getState().isSchoolSuspended(effectiveSchool)) {
                    setUser(null);
                    setSession(null);
                    localStorage.removeItem('iskool_session_user');
                    localStorage.setItem('iskool_suspension_error', 'cuenta inhabilitada favor de ponerse en contacto con el administrador del colegio');
                    return;
                  }
                }

                setUser(parsed);
                useSchoolAdminStore.getState().syncUserSchool(parsed);
                setSession({
                  access_token: 'mock-token-restored-offline-session',
                  user: {
                    id: parsed.id,
                    email: parsed.email,
                    user_metadata: {
                      first_name: parsed.first_name,
                      last_name: parsed.last_name,
                      role: parsed.role,
                      school_id: parsed.school_id
                    }
                  }
                });
              }
            } catch {
              localStorage.removeItem('iskool_session_user');
            }
          }
        }
      } catch (err) {
        console.warn("Supabase auth offline fallback:", err);
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

  const login = async (email: string, userPassword?: string): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
    setLoading(true);
    const resolvedUser = getDemoUser(email);
    
    if (resolvedUser.is_blocked) {
      setLoading(false);
      return { 
        success: false, 
        error: '⛔ Esta cuenta ha sido bloqueada o cancelada por la Dirección Escolar en el Portal de Super Usuario.' 
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
        const std = (adminStore.detailedStudents || []).find(s => s.id === resolvedUser.id || s.email?.toLowerCase() === email.toLowerCase());
        if (std) userSchoolId = std.school_id;
        const tch = (adminStore.teachersList || []).find(t => t.id === resolvedUser.id || t.email?.toLowerCase() === email.toLowerCase());
        if (tch) userSchoolId = tch.school_id;
        const stf = (adminStore.staffUsers || []).find(s => s.id === resolvedUser.id || s.email?.toLowerCase() === email.toLowerCase());
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
          error: 'cuenta inhabilitada favor de ponerse en contacto con el administrador del colegio'
        };
      }
    }

    if (userPassword && userPassword.trim().length > 0) {
      const isTeacherSeed = resolvedUser.role === 'teacher' && (resolvedUser.id === 'usr-teacher-1' || resolvedUser.email === TEACHER_SEED.email);
      const isSuperUser = resolvedUser.role === 'admin' || resolvedUser.role === 'superadmin' || resolvedUser.id.startsWith('usr-superadmin') || resolvedUser.id === 'usr-admin-1';
      
      if (isSuperUser && userPassword !== '008805' && userPassword !== 'ISkoolPassword2026!') {
        setLoading(false);
        return {
          success: false,
          error: 'Contraseña incorrecta para Super Usuario ISkool. Introduce la clave asignada (008805).'
        };
      }

      if (isTeacherSeed && userPassword !== '008805' && userPassword !== 'ISkoolPassword2026!') {
        setLoading(false);
        return {
          success: false,
          error: 'Contraseña incorrecta. Introduce la clave asignada (008805).'
        };
      }

      if (resolvedUser.temporary_password && 
          userPassword !== resolvedUser.temporary_password && 
          userPassword !== 'ISkoolPassword2026!' && 
          userPassword !== '008805') {
        setLoading(false);
        return {
          success: false,
          error: `Contraseña incorrecta para ${resolvedUser.first_name}. Introduce tu clave asignada (${resolvedUser.temporary_password}).`
        };
      }
    }

    const password = userPassword || 'ISkoolPassword2026!';

    try {
      // 1. Intentar autenticación remota
      const signInResult = await supabase.auth.signInWithPassword({ email, password }).catch(() => null);
      
      let userObj: any = null;
      let sessionObj: any = null;

      if (signInResult && !signInResult.error && signInResult.data?.user) {
        userObj = signInResult.data.user;
        sessionObj = signInResult.data.session;
      } else {
        // Modo libre inmediato: Si falla o hay rate limit, entrar de forma fluida con el usuario local
        userObj = {
          id: resolvedUser.id,
          email: resolvedUser.email,
          created_at: resolvedUser.created_at,
          user_metadata: {
            first_name: resolvedUser.first_name,
            last_name: resolvedUser.last_name,
            role: resolvedUser.role
          }
        };
        sessionObj = {
          access_token: 'mock-token-free-access-session',
          user: userObj
        };
      }

      let finalUser: UserProfile = {
        id: userObj.id,
        first_name: userObj.user_metadata?.first_name || resolvedUser.first_name,
        last_name: userObj.user_metadata?.last_name || resolvedUser.last_name,
        role: (userObj.user_metadata?.role || resolvedUser.role) as any,
        email: userObj.email || resolvedUser.email,
        school_id: userObj.user_metadata?.school_id || resolvedUser.school_id,
        created_at: userObj.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (finalUser.id === 'usr-teacher-1' || finalUser.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' || (finalUser.email && finalUser.email.toLowerCase().includes('israel.lopez') && finalUser.role === 'teacher')) {
        const liveTeacher = (useSchoolAdminStore.getState().teachersList || []).find(t => t.id === 'usr-teacher-1') || TEACHER_SEED;
        finalUser = {
          ...finalUser,
          ...liveTeacher,
          school_id: liveTeacher.school_id || 'sch-test-case',
          campus_id: liveTeacher.campus_id || 'cmp-test-pri',
          campus_name: liveTeacher.campus_name || 'Primaria Laboratorio Demo',
          email: 'israel.lopez@sandbox.iskool.edu.mx'
        };
      }

      setSession(sessionObj);
      setUser(finalUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('iskool_session_user', JSON.stringify(finalUser));
      }
      useSchoolAdminStore.getState().syncUserSchool(finalUser);

      setLoading(false);
      return { success: true, user: finalUser };
    } catch (err: any) {
      console.warn("Acceso libre activado de contingencia:", err);
      setUser(resolvedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('iskool_session_user', JSON.stringify(resolvedUser));
      }
      useSchoolAdminStore.getState().syncUserSchool(resolvedUser);
      setSession({
        access_token: 'mock-token-free-access-contingency',
        user: {
          id: resolvedUser.id,
          email: resolvedUser.email,
          user_metadata: {
            first_name: resolvedUser.first_name,
            last_name: resolvedUser.last_name,
            role: resolvedUser.role
          }
        }
      });
      setLoading(false);
      return { success: true, user: resolvedUser };
    }
  };

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut().catch(() => null);
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
