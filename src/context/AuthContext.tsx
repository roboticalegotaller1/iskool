"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile } from '@/types';
import { useRouter } from 'next/navigation';
import { STUDENTS_LIST_SEED, TEACHER_SEED, PARENT_SEED } from '@/store/seeds';

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
      t.email.toLowerCase() === emailLower || 
      t.id === emailLower ||
      `${t.first_name.toLowerCase()}.${t.last_name.toLowerCase()}` === emailLower.replace('@jjrosseau.edu.mx', '')
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
      last_name: 'Vargas Robles (Dueño de Empresa)',
      role: 'owner',
      email: 'dueno@jjrosseau.edu.mx',
      temporary_password: 'DUE2026',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 7. Super Usuario Demo (Coincidencia exacta)
  if (
    emailLower === 'admin' || 
    emailLower === 'admin@jjrosseau.edu.mx' || 
    emailLower === 'admin@iskool.edu.mx'
  ) {
    return {
      id: 'usr-admin-1',
      first_name: 'Admin',
      last_name: '(Super Usuario)',
      role: 'admin',
      email: 'admin@iskool.edu.mx',
      temporary_password: '008805',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // 4. Coordinación Demo (Coincidencia exacta)
  if (
    emailLower === 'beatriz.morales@iskool.edu.mx' ||
    emailLower === 'coordinacion@iskool.edu.mx' ||
    emailLower === 'coord@iskool.edu.mx'
  ) {
    return {
      id: 'usr-coord-1',
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
    emailLower === 'israel.lopez@iskool.edu.mx' ||
    emailLower === 'profesor@iskool.edu.mx'
  ) {
    return {
      ...TEACHER_SEED,
      first_name: 'Israel',
      last_name: 'López Ángeles',
      email: TEACHER_SEED.email,
      temporary_password: '008805'
    };
  }

  // 6. Tutor / Padre Demo (Coincidencia exacta)
  if (
    emailLower === PARENT_SEED.email.toLowerCase() ||
    emailLower === 'tutor@iskool.edu.mx' ||
    emailLower === 'padre@iskool.edu.mx' ||
    emailLower === 'israel.lopez@ejemplo.com'
  ) {
    return PARENT_SEED;
  }

  // 7. Alumnos Demo de semillas (Coincidencia exacta)
  const matchedSeedStudent = STUDENTS_LIST_SEED.find(s => 
    s.email.toLowerCase() === emailLower || 
    s.id.toLowerCase() === emailLower
  );
  if (matchedSeedStudent) return matchedSeedStudent;

  // 8. Fallback para nuevo alumno con correo personalizado
  const nameParts = emailLower.split('@')[0].split('.');
  const firstName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : 'Usuario';
  const lastName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : 'Escolar';

  return {
    id: `usr-custom-${Date.now()}`,
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
          const restoredUser: UserProfile = {
            id: u.id,
            first_name: u.user_metadata?.first_name || 'Usuario',
            last_name: u.user_metadata?.last_name || '',
            role: (u.user_metadata?.role || 'student') as any,
            email: u.email || '',
            school_id: u.user_metadata?.school_id,
            created_at: u.created_at,
            updated_at: new Date().toISOString()
          };
          setUser(restoredUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem('iskool_session_user', JSON.stringify(restoredUser));
          }
          return;
        }

        // Recuperación de sesión local en modo offline / fallback
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('iskool_session_user');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.id && parsed.role) {
                setUser(parsed);
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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

    if (userPassword && userPassword.trim().length > 0) {
      const isTeacherSeed = resolvedUser.role === 'teacher' && (resolvedUser.id === 'usr-teacher-1' || resolvedUser.email === TEACHER_SEED.email);
      const isAdmin = resolvedUser.role === 'admin' || resolvedUser.id === 'usr-admin-1';
      
      if (isAdmin && userPassword !== '008805' && userPassword !== 'ISkoolPassword2026!') {
        setLoading(false);
        return {
          success: false,
          error: 'Contraseña incorrecta para Administrador. Introduce la clave asignada (008805).'
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

      const finalUser: UserProfile = {
        id: userObj.id,
        first_name: userObj.user_metadata?.first_name || resolvedUser.first_name,
        last_name: userObj.user_metadata?.last_name || resolvedUser.last_name,
        role: (userObj.user_metadata?.role || resolvedUser.role) as any,
        email: userObj.email || resolvedUser.email,
        school_id: userObj.user_metadata?.school_id || resolvedUser.school_id,
        created_at: userObj.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setSession(sessionObj);
      setUser(finalUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('iskool_session_user', JSON.stringify(finalUser));
      }

      setLoading(false);
      return { success: true, user: finalUser };
    } catch (err: any) {
      console.warn("Acceso libre activado de contingencia:", err);
      setUser(resolvedUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('iskool_session_user', JSON.stringify(resolvedUser));
      }
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
    }
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
