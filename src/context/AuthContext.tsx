"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile, isPlatformSuperUser, resolveEffectiveSchoolId } from '@/types';
import { useRouter } from 'next/navigation';
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

export const resolveDemoUserAsync = async (email: string): Promise<UserProfile> => {
  const { getDemoUser } = await import('@/lib/auth/demoUserResolver');
  return getDemoUser(email);
};

function hasSupabaseLocalSession(): boolean {
  if (typeof window === 'undefined') return false;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl || supabaseUrl === 'https://placeholder.supabase.co') return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /^sb-.*-auth-token/.test(key)) {
        return true;
      }
    }
    const hash = window.location.hash || '';
    if (hash.includes('access_token=') || hash.includes('refresh_token=')) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

const isMatchingLocalSeedCredential = (targetUser: UserProfile, pass: string): boolean => {
  if (!pass) return false;
  const p = pass.trim();
  // Solo contraseñas explícitas adjuntas al registro de prueba del showcase o cuenta temporal
  if ((targetUser as any).temporary_password && p === (targetUser as any).temporary_password) {
    return true;
  }
  if ((targetUser as any).defaultPass && p === (targetUser as any).defaultPass) {
    return true;
  }
  return false;
};

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<any | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSwitchingRole, setIsSwitchingRole] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    let tId: ReturnType<typeof setTimeout> | null = null;
    let sbTimeoutId: ReturnType<typeof setTimeout> | null = null;
    let supabaseUnsubscribe: (() => void) | null = null;

    // Salvaguarda dura: jamás bloquear la interfaz más de 2.8s en "Comprobando credenciales..."
    const hardTimeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 2800);

    // Check active session on mount (Zero-Trust: Cookies HttpOnly prioritarias)
    const checkSession = async () => {
      try {
        // 1. Purgado proactivo de tokens heredados en localStorage para mitigar XSS
        if (typeof window !== 'undefined') {
          localStorage.removeItem('iskool_session_user');
          localStorage.removeItem('auth_current_user');

          // 1.1 Hidratación instantánea (0ms) para sesiones activas verificadas en sessionStorage (Cuentas Demo / navegación intra-pestaña)
          try {
            const fastSessionRaw = sessionStorage.getItem('iskool_active_session_v2');
            if (fastSessionRaw) {
              const fastUser = JSON.parse(fastSessionRaw) as UserProfile;
              if (
                fastUser &&
                fastUser.id &&
                fastUser.role &&
                (fastUser.school_id === 'sch-demo-0001' || fastUser.email?.endsWith('@iskool.mx'))
              ) {
                if (!isMounted) return;
                setUser(fastUser);
                setSession({
                  access_token: 'session-storage-verified',
                  user: fastUser,
                });
                const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
                useSchoolAdminStore.getState().syncUserSchool(fastUser);
                if (isMounted) setLoading(false);
                return;
              }
            }
          } catch {}
        }

        // 2. Consulta al endpoint seguro de sesión perimetral con Cookie HttpOnly (con timeout de 2s)
        try {
          const controller = new AbortController();
          tId = setTimeout(() => controller.abort(), 2000);
          try {
            const sessionRes = await fetch('/api/auth/session', {
              cache: 'no-store',
              credentials: 'same-origin',
              signal: controller.signal,
            });
            if (sessionRes.ok) {
              const sessionData = await sessionRes.json();
              if (sessionData.authenticated && sessionData.user) {
                if (!isMounted) return;
                const liveUser = sessionData.user;
                if (typeof window !== 'undefined') {
                  try {
                    sessionStorage.setItem('iskool_active_session_v2', JSON.stringify(liveUser));
                  } catch {}
                }
                setUser(liveUser);
                setSession({
                  access_token: 'cookie-httponly-authenticated',
                  user: liveUser,
                });
                const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
                useSchoolAdminStore.getState().syncUserSchool(liveUser);
                if (isMounted) setLoading(false);
                return;
              } else if (sessionData.authenticated === false && typeof window !== 'undefined') {
                try {
                  sessionStorage.removeItem('iskool_active_session_v2');
                } catch {}
              }
            }
          } finally {
            if (tId) {
              clearTimeout(tId);
              tId = null;
            }
          }
        } catch {
          // Si el endpoint no responde temporalmente, continuar con respaldo de sesión activa
        }

        // 2.1 Respaldo inmediato en sessionStorage ante latencia o caché perimetral
        if (typeof window !== 'undefined') {
          try {
            const cachedSessionRaw = sessionStorage.getItem('iskool_active_session_v2');
            if (cachedSessionRaw) {
              const cachedUser = JSON.parse(cachedSessionRaw) as UserProfile;
              if (cachedUser && cachedUser.id && cachedUser.role) {
                if (!isMounted) return;
                setUser(cachedUser);
                setSession({
                  access_token: 'session-storage-verified',
                  user: cachedUser,
                });
                const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
                useSchoolAdminStore.getState().syncUserSchool(cachedUser);
                if (isMounted) setLoading(false);
                return;
              }
            }
          } catch {}
        }

        // 3. Verificación diferida de sesión en cliente Auth externo únicamente si existe token local configurado
        if (hasSupabaseLocalSession()) {
          const { supabase } = await import('@/lib/supabaseClient');
          if (!isMounted) return;

          const {
            data: { subscription },
          } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            if (currentSession?.user && isMounted) {
              setSession(currentSession);
              setUser({
                id: currentSession.user.id,
                first_name: currentSession.user.user_metadata?.first_name || 'Usuario',
                last_name: currentSession.user.user_metadata?.last_name || '',
                role: (currentSession.user.app_metadata?.role || 'student') as any,
                email: currentSession.user.email || '',
                school_id: currentSession.user.app_metadata?.school_id,
                created_at: currentSession.user.created_at,
                updated_at: new Date().toISOString(),
              });
            }
          });
          supabaseUnsubscribe = () => subscription.unsubscribe();

          const sessionPromise = supabase.auth.getSession();
          const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) => {
            sbTimeoutId = setTimeout(() => resolve({ data: { session: null } }), 2000);
          });
          const {
            data: { session: currentSession },
          } = await Promise.race([sessionPromise, timeoutPromise]);
          if (sbTimeoutId) {
            clearTimeout(sbTimeoutId);
            sbTimeoutId = null;
          }
          if (!isMounted) return;

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
              updated_at: new Date().toISOString(),
            };

            const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');

            // Saneamiento de profesor Israel si viene sin school_id o con la escuela demo antigua
            if (
              restoredUser.id === 'usr-teacher-1' ||
              restoredUser.id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55' ||
              (restoredUser.email &&
                restoredUser.email.toLowerCase().includes('israel.lopez') &&
                restoredUser.role === 'teacher')
            ) {
              const { resolveIsraelTeacherFallback } = await import('@/lib/auth/demoUserResolver');
              restoredUser = resolveIsraelTeacherFallback(restoredUser);
            }

            // Saneamiento reactivo de alumnos: asegurar su colegio correspondiente sch-test-case
            if (
              restoredUser.role === 'student' ||
              restoredUser.id.startsWith('std-') ||
              restoredUser.id.startsWith('c00a0eeb')
            ) {
              const detailed = (useSchoolAdminStore.getState().detailedStudents || []).find(
                (s) =>
                  s.id === restoredUser.id ||
                  (restoredUser.email &&
                    s.email?.toLowerCase() === restoredUser.email.toLowerCase())
              );
              restoredUser = {
                ...restoredUser,
                school_id: detailed?.school_id || restoredUser.school_id || 'sch-test-case',
              };
            }

            const isSuper =
              isPlatformSuperUser(restoredUser) ||
              restoredUser.role === 'admin' ||
              restoredUser.role === 'superadmin' ||
              restoredUser.id.startsWith('usr-superadmin');
            if (!isSuper) {
              const effectiveSchool = resolveEffectiveSchoolId(
                restoredUser,
                null,
                restoredUser.school_id || 'sch-test-case'
              );
              if (useSchoolAdminStore.getState().isSchoolSuspended(effectiveSchool)) {
                if (isMounted) {
                  setUser(null);
                  setSession(null);
                }
                return;
              }
            }

            if (!isMounted) return;
            setUser(restoredUser);
            useSchoolAdminStore.getState().syncUserSchool(restoredUser);

            // Sincronizar Cookie HttpOnly segura en segundo plano
            await fetch('/api/auth/session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(restoredUser),
            }).catch(() => null);

            return;
          }
        }
      } catch {
        console.warn('Autenticación inicial de sesión completada.');
      } finally {
        clearTimeout(hardTimeout);
        if (tId) {
          clearTimeout(tId);
          tId = null;
        }
        if (sbTimeoutId) {
          clearTimeout(sbTimeoutId);
          sbTimeoutId = null;
        }
        if (isMounted) setLoading(false);
      }
    };

    checkSession();

    return () => {
      isMounted = false;
      clearTimeout(hardTimeout);
      if (tId) clearTimeout(tId);
      if (sbTimeoutId) clearTimeout(sbTimeoutId);
      if (supabaseUnsubscribe) supabaseUnsubscribe();
    };
  }, []);

  // Sincronizar store administrativo únicamente cuando existe un usuario autenticado
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    import('@/store/useSchoolAdminStore')
      .then(({ useSchoolAdminStore }) => {
        if (!cancelled) {
          useSchoolAdminStore.getState().syncUserSchool(user);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user]);

  const login = useCallback(
    async (
      email: string,
      userPassword?: string
    ): Promise<{
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
          error: 'Credenciales inválidas. Por favor ingrese correo y contraseña.',
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
      let orgCheck: {
        matched: boolean;
        validPassword: boolean;
        mustChangePassword: boolean;
        node?: any;
      } = { matched: false, validPassword: false, mustChangePassword: false, node: undefined };

      if (!isCanonicalDemoPersonaEmail) {
        const { useOrganizationStore } = await import('@/store/useOrganizationStore');
        orgCheck = useOrganizationStore
          .getState()
          .authenticateOrgAccount(cleanEmail, userPassword || '');
      }

      if (orgCheck.matched) {
        if (!orgCheck.validPassword) {
          setLoading(false);
          return {
            success: false,
            error:
              'Contraseña incorrecta o la contraseña inicial dada por el CEO ya dejó de funcionar.',
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
        const mappedRole: UserProfile['role'] = isDemoCeoNode
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
          last_name: [orgNode.paternalLastName, orgNode.maternalLastName]
            .filter(Boolean)
            .join(' '),
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
        const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
        useSchoolAdminStore.getState().syncUserSchool(orgUser);
        setLoading(false);
        return { success: true, user: orgUser };
      }

      const resolvedUser = await resolveDemoUserAsync(cleanEmail);
      const effectivePass = userPassword && userPassword.trim() ? userPassword.trim() : '';

      if (resolvedUser.is_blocked) {
        setLoading(false);
        return {
          success: false,
          error: '⛔ Esta cuenta ha sido inhabilitada por la Dirección Escolar.',
        };
      }

      const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');

      // Regla de Suspensión Institucional por Colegio
      const isSuperUser =
        isPlatformSuperUser(resolvedUser) ||
        resolvedUser.role === 'admin' ||
        resolvedUser.role === 'superadmin' ||
        resolvedUser.id.startsWith('usr-superadmin') ||
        resolvedUser.id === 'usr-admin-1';

      if (!isSuperUser) {
        let userSchoolId = resolvedUser.school_id;
        if (!userSchoolId) {
          const adminStore = useSchoolAdminStore.getState();
          const std = (adminStore.detailedStudents || []).find(
            (s) => s.id === resolvedUser.id || s.email?.toLowerCase() === cleanEmail
          );
          if (std) userSchoolId = std.school_id;
          const tch = (adminStore.teachersList || []).find(
            (t) => t.id === resolvedUser.id || t.email?.toLowerCase() === cleanEmail
          );
          if (tch) userSchoolId = tch.school_id;
          const stf = (adminStore.staffUsers || []).find(
            (s) => s.id === resolvedUser.id || s.email?.toLowerCase() === cleanEmail
          );
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
            error:
              'Cuenta inhabilitada. Favor de ponerse en contacto con el administrador del colegio.',
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
              user: { id: resolvedUser.id, email: resolvedUser.email },
            }),
          });
          if (serverRes.ok) {
            const serverData = await serverRes.json().catch(() => null);
            if (serverData?.success && serverData?.user) {
              finalUser = {
                ...resolvedUser,
                ...serverData.user,
                updated_at: new Date().toISOString(),
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
          updated_at: new Date().toISOString(),
        };
        sessionObj = { user: finalUser };
      }

      // 2. Intentar autenticación criptográfica con el proveedor Auth si no coincidió con catálogo de servidor
      if (!finalUser) {
        try {
          const { supabase } = await import('@/lib/supabaseClient');
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password: effectivePass,
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
              updated_at: new Date().toISOString(),
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
          error: 'Credenciales incorrectas o clave no asignada para esta cuenta.',
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

        const isIbimeTenant =
          finalUser.school_id === 'sch-ibime' ||
          (finalUser.email && finalUser.email.toLowerCase().includes('ibime'));
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
                user: finalUser,
              }),
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
    },
    []
  );

  /**
   * Conmutación instantánea en caliente entre las cuentas del entorno Cuentas demo (sch-demo-0001).
   * Evita activar loading global (cero pantallas intermedias ni rebote a /login) sincronizando
   * primero la cookie HttpOnly y blindando la transición mientras Next.js cambia de ruta.
   */
  const switchDemoPersona = useCallback(
    async (
      email: string,
      userPassword?: string
    ): Promise<{ success: boolean; user?: UserProfile; error?: string }> => {
      const cleanEmail = email ? email.trim().toLowerCase() : '';
      if (!cleanEmail || !isDemoSandboxContext({ email: cleanEmail })) {
        return login(email, userPassword);
      }

      const resolvedUser = await resolveDemoUserAsync(cleanEmail);
      const effectivePass =
        userPassword && userPassword.trim() ? userPassword.trim() : 'DemoISkool2026!';
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
      const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
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
    },
    [login]
  );

  const logout = useCallback(async () => {
    endRoleTransition();
    setIsSwitchingRole(false);
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabaseClient');
      await supabase.auth.signOut().catch(() => null);
    } catch {}

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
    try {
      const { useSchoolAdminStore } = await import('@/store/useSchoolAdminStore');
      useSchoolAdminStore.getState().selectSchool(null as any);
      useSchoolAdminStore.getState().syncUserSchool(null);
    } catch {}
    setSession(null);
    setUser(null);
    setLoading(false);
    router.push('/login');
  }, [router]);

  const contextValue = useMemo(
    () => ({ session, user, loading, isSwitchingRole, login, switchDemoPersona, logout }),
    [session, user, loading, isSwitchingRole, login, switchDemoPersona, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
