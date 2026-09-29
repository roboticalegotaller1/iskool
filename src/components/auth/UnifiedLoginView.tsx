"use client";

import React, { useState } from 'react';
import { useAuth, getDemoUser } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  GraduationCap, 
  Sparkles, 
  User, 
  Key, 
  ArrowRight, 
  Loader2, 
  Eye, 
  EyeOff, 
  AlertCircle,
  BookOpen, 
  Compass, 
  ShieldCheck, 
  HelpCircle, 
  Lock,
  Building2,
  Globe,
  Award,
  CheckCircle2
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { supabase } from '@/lib/supabaseClient';

export type LoginMode = 'public' | 'full_demo' | 'ibime_demo';

export interface UnifiedLoginViewProps {
  mode: LoginMode;
}

type DemoCategory = 'docentes' | 'estudiantes' | 'gestion';

interface DemoAccount {
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
const GENERAL_DEMO_ACCOUNTS: DemoAccount[] = [
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
  // Gestión y Comunidad
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
    name: "Familia López Mendoza",
    role: "parent",
    grade: "Tutor / Padre de Familia",
    email: "israel.lopez@ejemplo.com",
    avatarColor: "bg-amber-600",
    id: "usr-parent-001",
    defaultPass: "ISkoolPassword2026!",
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
  },
  // Directivos de ISkool (Super Usuarios Globales de Plataforma)
  {
    name: "Dirección General ISkool",
    role: "admin",
    grade: "Directivo ISkool (Super Usuario Global)",
    email: "admin@iskool.edu.mx",
    avatarColor: "bg-slate-800",
    id: "usr-superadmin-1",
    defaultPass: "008805",
    category: "gestion"
  },
  {
    name: "Dirección de Tecnología ISkool",
    role: "admin",
    grade: "Directivo ISkool (Super Usuario Infraestructura)",
    email: "tecnologia@iskool.edu.mx",
    avatarColor: "bg-cyan-700",
    id: "usr-superadmin-2",
    defaultPass: "008805",
    category: "gestion"
  },
  {
    name: "Dirección Pedagógica ISkool",
    role: "admin",
    grade: "Directivo ISkool (Super Usuario Curricular)",
    email: "pedagogia@iskool.edu.mx",
    avatarColor: "bg-emerald-700",
    id: "usr-superadmin-3",
    defaultPass: "008805",
    category: "gestion"
  }
];

// Cuentas demo exclusivas del Instituto Bilingüe IBIME (Mostradas estrictamente en 02DJoUJSkwYQZjn)
// CERO SUPERUSUARIOS DE PLATAFORMA BAJO NINGUNA CIRCUNSTANCIA
const IBIME_DEMO_ACCOUNTS: DemoAccount[] = [
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
    category: "gestion",
    campusName: "Campus Montes"
  }
];

export default function UnifiedLoginView({ mode }: UnifiedLoginViewProps) {
  const isIbimeMode = mode === 'ibime_demo';
  const isFullDemoMode = mode === 'full_demo';
  const isPublicMode = mode === 'public';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('ISkoolPassword2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemoCategory, setActiveDemoCategory] = useState<DemoCategory>(
    isIbimeMode ? 'gestion' : 'docentes'
  );
  const [showDemoSelector, setShowDemoSelector] = useState<boolean>(!isPublicMode);
  const [isSsoLoading, setIsSsoLoading] = useState(false);

  const { login, logout, loading: authLoading, user } = useAuth();
  const switchStudent = useStudentStore(state => state.switchStudent);
  const router = useRouter();
  const isSchoolSuspended = useSchoolAdminStore(state => state.isSchoolSuspended);

  // Forzar síncronamente el tenant correcto en cookies y DOM si es modo IBIME
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (isIbimeMode) {
        document.cookie = 'tenant-id=ibime; path=/; max-age=31536000; SameSite=Lax';
        localStorage.setItem('tenant-id', 'ibime');
        document.documentElement.setAttribute('data-tenant', 'ibime');
        // Si hay una sesión activa de un usuario ajeno a IBIME (ej. superadmin ISkool), cerrarla inmediatamente
        if (user && user.school_id !== 'sch-ibime') {
          logout();
        }
      } else if (isPublicMode || isFullDemoMode) {
        // En modo general se asegura tenant iSkool
        const currentCookie = document.cookie;
        if (!currentCookie.includes('tenant-id=ibime')) {
          document.cookie = 'tenant-id=iskool; path=/; max-age=31536000; SameSite=Lax';
          localStorage.setItem('tenant-id', 'iskool');
          document.documentElement.setAttribute('data-tenant', 'iskool');
        }
      }
    }
  }, [isIbimeMode, isPublicMode, isFullDemoMode, user, logout]);

  // Listener para capturar el evento SIGNED_IN de Supabase Auth
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_IN' && currentSession?.user) {
        setIsSubmitting(true);
        const userEmail = currentSession.user.email || '';
        const pool = isIbimeMode ? IBIME_DEMO_ACCOUNTS : GENERAL_DEMO_ACCOUNTS;
        const matchedDemo = pool.find(d => d.email.toLowerCase() === userEmail.toLowerCase());
        
        const userProfile = matchedDemo ? {
          id: matchedDemo.id,
          first_name: matchedDemo.name.split(' ')[0],
          last_name: matchedDemo.name.split(' ').slice(1).join(' '),
          role: matchedDemo.role as any,
          email: matchedDemo.email,
          school_id: isIbimeMode ? 'sch-ibime' : 'sch-test-case',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : {
          id: currentSession.user.id,
          first_name: currentSession.user.user_metadata?.first_name || currentSession.user.user_metadata?.given_name || (currentSession.user.user_metadata?.full_name ? currentSession.user.user_metadata.full_name.split(' ')[0] : 'Docente/Estudiante'),
          last_name: currentSession.user.user_metadata?.last_name || currentSession.user.user_metadata?.family_name || '',
          role: (currentSession.user.user_metadata?.role || (userEmail.includes('docente') || userEmail.includes('profesor') ? 'teacher' : 'student')) as any,
          email: userEmail,
          school_id: isIbimeMode ? 'sch-ibime' : 'sch-test-case',
          created_at: currentSession.user.created_at,
          updated_at: new Date().toISOString()
        };
        await routeUserByRole(userProfile);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [isIbimeMode]);

  const handleInstitutionalSSO = async () => {
    setErrorMsg('');
    setIsSsoLoading(true);
    try {
      const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });

      if (error) {
        setErrorMsg(error.message || 'Error al conectar con el proveedor de autenticación institucional.');
        setIsSsoLoading(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'No fue posible iniciar la sesión única institucional.');
      setIsSsoLoading(false);
    }
  };

  // Comprobar si hay una notificación flash de suspensión institucional
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const suspensionMsg = localStorage.getItem('iskool_suspension_error');
      if (suspensionMsg) {
        setErrorMsg(suspensionMsg);
        localStorage.removeItem('iskool_suspension_error');
      }
    }
  }, []);

  const routeUserByRole = async (userProfile: any) => {
    // 0. Si es modo IBIME o el usuario pertenece a IBIME, ENRUTAR SIEMPRE Y EXCLUSIVAMENTE AL SISTEMA IBIME
    const isIbimeUser = isIbimeMode || userProfile?.school_id === 'sch-ibime' || (userProfile?.email && userProfile.email.toLowerCase().includes('ibime'));

    if (isIbimeUser) {
      if (typeof window !== 'undefined') {
        document.cookie = 'tenant-id=ibime; path=/; max-age=31536000; SameSite=Lax';
        localStorage.setItem('tenant-id', 'ibime');
        document.documentElement.setAttribute('data-tenant', 'ibime');
      }
      router.push('/ibime/portal');
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          window.location.href = '/ibime/portal';
        }
      }, 300);
      return;
    }

    // 1. Si hay un parámetro de redirección en la URL (ej: /teacher/idiomas), priorizarlo de inmediato
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const redirectParam = searchParams.get('redirect');
      if (redirectParam && redirectParam.startsWith('/') && !redirectParam.startsWith('//')) {
        router.push(redirectParam);
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = redirectParam;
          }
        }, 500);
        return;
      }
    }

    const role = userProfile?.role || 'student';
    const studentId = userProfile?.id;

    if (role === 'student' && studentId) {
      await switchStudent(studentId);
    }

    let targetPath = '/student';
    switch (role) {
      case 'ceo':
      case 'owner':
      case 'admin':
      case 'superadmin':
        targetPath = '/admin';
        break;
      case 'director':
        targetPath = '/director';
        break;
      case 'billing':
        targetPath = '/coordinator/billing';
        break;
      case 'coordinator':
        targetPath = '/coordinator';
        break;
      case 'teacher':
        targetPath = '/teacher';
        break;
      case 'parent':
        targetPath = '/parent';
        break;
      case 'student':
      default:
        targetPath = '/student';
        break;
    }

    router.push(targetPath);
    setTimeout(() => {
      if (typeof window !== 'undefined') {
        window.location.href = targetPath;
      }
    }, 500);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Por favor escribe tu correo electrónico o clave institucional para continuar.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const loginPromise = login(email.trim(), password);
      const timeoutPromise = new Promise<{ success: boolean; user?: any; error?: string }>((resolve) =>
        setTimeout(() => {
          const fallback = getDemoUser(email.trim());
          resolve({ success: true, user: fallback });
        }, 1800)
      );

      const result = await Promise.race([loginPromise, timeoutPromise]);
      if (result.success && result.user) {
        await routeUserByRole(result.user);
      } else {
        setErrorMsg(
          result.error || 
          'No se pudo autenticar la cuenta. Comprueba que tus datos sean correctos o contacta al administrador de tu plantel.'
        );
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || 
        'Hubo un problema temporal de comunicación. Por favor verifica tu conexión y vuelve a intentar.'
      );
      setIsSubmitting(false);
    }
  };

  const handleSelectDemo = async (demo: DemoAccount) => {
    setEmail(demo.email);
    const pass = demo.defaultPass || 'ISkoolPassword2026!';
    setPassword(pass);
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const loginPromise = login(demo.email, pass);
      const timeoutPromise = new Promise<{ success: boolean; user?: any; error?: string }>((resolve) =>
        setTimeout(() => {
          const fallback = getDemoUser(demo.email);
          resolve({ success: true, user: fallback });
        }, 1800)
      );

      const result = await Promise.race([loginPromise, timeoutPromise]);
      if (result.success && result.user) {
        await routeUserByRole(result.user);
      } else {
        setErrorMsg(result.error || 'No fue posible acceder con este perfil de prueba.');
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la sesión de prueba.');
      setIsSubmitting(false);
    }
  };

  const currentAccountsPool = isIbimeMode ? IBIME_DEMO_ACCOUNTS : GENERAL_DEMO_ACCOUNTS;
  const filteredDemoAccounts = currentAccountsPool.filter(d => d.category === activeDemoCategory);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/20">
      
      {/* Columna Izquierda: Identidad Institucional & Calidad Visual */}
      <div className={`hidden lg:flex lg:w-5/12 xl:w-1/2 relative flex-col justify-between p-12 xl:p-16 border-r border-zinc-200/10 dark:border-zinc-800/40 text-white overflow-hidden ${
        isIbimeMode 
          ? 'bg-gradient-to-br from-slate-950 via-[#071E3D] to-[#043224]' 
          : 'bg-gradient-to-br from-blue-900 via-indigo-950 to-zinc-950'
      }`}>
        {/* Glow de fondo */}
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isIbimeMode ? 'bg-emerald-500/15' : 'bg-blue-500/20'
        }`} />
        <div className={`absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
          isIbimeMode ? 'bg-amber-400/15' : 'bg-purple-500/20'
        }`} />

        {/* Barra superior con Identidad */}
        <div className="flex items-center gap-3.5 z-10">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg border ${
            isIbimeMode 
              ? 'bg-emerald-600/30 border-emerald-400/30 text-emerald-300' 
              : 'bg-white/10 backdrop-blur-md border-white/20 text-blue-300 shadow-inner'
          }`}>
            {isIbimeMode ? <Building2 className="h-6 w-6" /> : <GraduationCap className="h-6 w-6" />}
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight text-white block">
              {isIbimeMode ? 'Instituto Bilingüe IBIME' : 'ISkool'}
            </span>
            <span className="block text-[11px] text-blue-200/80 font-medium tracking-wide">
              {isIbimeMode ? 'Red Bilingüe & Bachillerato CCH UNAM (4 Sedes)' : 'Ecosistema Pedagógico Integral'}
            </span>
          </div>
        </div>

        {/* Contenido Central: Mensaje de Alto Valor */}
        <div className="max-w-md my-auto z-10 flex flex-col gap-6">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-semibold w-fit tracking-wide ${
            isIbimeMode 
              ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-300' 
              : 'bg-blue-500/15 border-blue-400/25 text-blue-300'
          }`}>
            {isIbimeMode ? <Globe className="h-3.5 w-3.5" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>
              {isIbimeMode 
                ? 'Excelencia Bilingüe y Formación Humana desde 2004' 
                : 'Innovación y Gamificación Curricular'}
            </span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-snug">
            {isIbimeMode 
              ? 'Formación bilingüe, excelencia CCH y seguimiento 360.'
              : 'Educación activa, evaluación formativa y gestión sin fricción.'}
          </h2>

          <p className="text-zinc-300 text-sm leading-relaxed font-normal">
            {isIbimeMode 
              ? 'Conectamos a directivos, docentes, alumnos y tutores de los planteles Montes, Lagos, San Cristóbal y Coacalco en una plataforma unificada.'
              : 'Conectamos a docentes, alumnos y familias a través de actividades interactivas, planeaciones alineadas y dinámicas de logro escolar.'}
          </p>

          {/* Pilares Visuales */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className={`p-2 rounded-xl ${
                isIbimeMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-purple-500/20 text-purple-300'
              }`}>
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isIbimeMode ? 'Bóveda Curricular Bilingüe (NEM & Cambridge)' : 'Bóveda Curricular Integrada'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {isIbimeMode 
                    ? 'Planeaciones didácticas oficiales, PDA y rúbricas analíticas.'
                    : 'Contenidos y planeaciones oficiales al instante.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className={`p-2 rounded-xl ${
                isIbimeMode ? 'bg-amber-500/20 text-amber-300' : 'bg-blue-500/20 text-blue-300'
              }`}>
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isIbimeMode ? 'Lienzo Digital & Robótica STEAM' : 'Lienzo Digital de Actividades'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {isIbimeMode 
                    ? 'Proyectos situados, ciencia experimental y pensamiento lógico.'
                    : 'Juegos y dinámicas pedagógicas generadas en segundos.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className={`p-2 rounded-xl ${
                isIbimeMode ? 'bg-blue-500/20 text-blue-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">
                  {isIbimeMode ? 'Acompañamiento 360 y Gobernanza' : 'Acompañamiento y Privacidad'}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {isIbimeMode 
                    ? 'Métricas de retención, cobranza y radar formativo inter-planteles.'
                    : 'Gobernanza institucional y reportes claros para la comunidad.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Marca */}
        <div className="text-zinc-400 text-xs z-10 flex items-center justify-between border-t border-white/10 pt-4">
          <span>{isIbimeMode ? '© 2026 Instituto Bilingüe IBIME S.C.' : '© 2026 ISkool Academic.'}</span>
          <span className="text-[11px] text-zinc-500">
            {isIbimeMode ? 'Licencia Institucional Enterprise Multi-Plantel' : 'Diseñado con enfoque centrado en el docente'}
          </span>
        </div>
      </div>

      {/* Columna Derecha: Formulario Limpio & Perfiles de Demostración */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 z-10">
        <div className="w-full max-w-md flex flex-col gap-7">
          
          {/* Header del Formulario */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 lg:hidden mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
                isIbimeMode ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {isIbimeMode ? <Building2 className="h-5 w-5" /> : <GraduationCap className="h-5 w-5" />}
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {isIbimeMode ? 'IBIME' : 'ISkool'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                {isIbimeMode ? 'Portal IBIME' : 'Iniciar Sesión'}
              </h1>
              {isIbimeMode && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Bilingüe Oficial
                </span>
              )}
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              {isIbimeMode 
                ? 'Acceso exclusivo con credenciales institucionales para la comunidad del Instituto Bilingüe IBIME.'
                : 'Inicia sesión con tus credenciales institucionales para acceder a tu portal.'}
            </p>
          </div>

          {/* Banner de Inspección / Sesión Activa (PROHIBIDO EN MODO IBIME) */}
          {!isIbimeMode && user && (
            <div className="bg-indigo-50/90 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 p-4 rounded-2xl text-xs flex flex-col gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.first_name?.[0] || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {user.first_name} {user.last_name}
                    </p>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                      {user.role}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    Sesión activa detectada. Puedes ingresar directamente o cambiar de cuenta.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-800/40">
                <button
                  type="button"
                  onClick={() => routeUserByRole(user)}
                  className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Ir a mi portal ({user.role})</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    router.refresh();
                  }}
                  className="py-2 px-3 bg-white dark:bg-zinc-800 hover:bg-rose-50 hover:text-rose-600 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}

          {/* Mensaje de Error Amigable */}
          {errorMsg && (
            <div 
              role="alert"
              aria-live="polite"
              className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-amber-900 dark:text-amber-200 px-4 py-3.5 rounded-2xl text-xs flex items-start gap-3 transition-all animate-fade-in"
            >
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-amber-800 dark:text-amber-300">Aviso de acceso</p>
                <p className="text-amber-700/90 dark:text-amber-200/80 mt-0.5 leading-normal">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Botón Primario de Inicio de Sesión Único Institucional (SSO) */}
          <div className="flex flex-col gap-3">
            <button
              id="btn-institutional-sso"
              type="button"
              onClick={handleInstitutionalSSO}
              disabled={isSubmitting || authLoading || isSsoLoading}
              className={`w-full py-3.5 px-6 font-bold text-sm rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 active:scale-[0.99] border group ${
                isIbimeMode 
                  ? 'bg-[#0B2545] hover:bg-[#071E3D] text-white border-blue-900' 
                  : 'bg-zinc-950 dark:bg-white hover:bg-zinc-850 dark:hover:bg-zinc-100 text-white dark:text-zinc-950 border-zinc-800 dark:border-zinc-200'
              }`}
            >
              {isSsoLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Conectando con cuenta institucional...</span>
                </>
              ) : (
                <>
                  {isIbimeMode ? (
                    <Building2 className="h-5 w-5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  ) : (
                    <GraduationCap className="h-5 w-5 text-blue-400 dark:text-blue-600 group-hover:scale-110 transition-transform" />
                  )}
                  <span>
                    {isIbimeMode ? 'Acceder con Cuenta Institucional IBIME' : 'Iniciar sesión con cuenta institucional'}
                  </span>
                </>
              )}
            </button>

            {/* Separador */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
              <span className="bg-[#FAFAFA] dark:bg-zinc-950 px-3 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest absolute">
                o accede con credenciales
              </span>
            </div>
          </div>

          {/* Formulario Principal de Autenticación */}
          <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
            
            {/* Campo: Correo Institucional */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="login-email"
                className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide"
              >
                Correo Electrónico o Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder={isIbimeMode ? "ejemplo@ibime.edu.mx" : "ejemplo@iskool.edu.mx"}
                  aria-label="Correo o usuario"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-xs focus:outline-none transition-all duration-200 ${
                    isIbimeMode 
                      ? 'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600' 
                      : 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {/* Campo: Contraseña */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="login-password"
                  className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 tracking-wide"
                >
                  Contraseña
                </label>
                <span className="text-[11px] text-zinc-400 hover:text-blue-600 transition-colors cursor-pointer select-none">
                  ¿Olvidaste tu clave?
                </span>
              </div>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full pl-11 pr-11 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-xs focus:outline-none transition-all duration-200 ${
                    isIbimeMode 
                      ? 'focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600' 
                      : 'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Botón Principal */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className={`w-full mt-2 py-3.5 px-5 text-white text-sm font-bold rounded-2xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] ${
                isIbimeMode 
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' 
                  : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
              }`}
            >
              {isSubmitting || authLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verificando acceso...</span>
                </>
              ) : (
                <>
                  <span>Iniciar Sesión</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* PERFILES DE DEMOSTRACIÓN: Únicamente visibles en Lcxad5iH8kGm3ZC y 02DJoUJSkwYQZjn */}
          {!isPublicMode && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowDemoSelector(!showDemoSelector)}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors group ${
                  isIbimeMode 
                    ? 'border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100/60' 
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className={`h-3.5 w-3.5 ${isIbimeMode ? 'text-emerald-600' : 'text-blue-500'}`} />
                  <span>
                    {isIbimeMode 
                      ? 'Perfiles de Demostración IBIME (Acceso 1-Clic)' 
                      : 'Explorar con Perfiles de Demostración'}
                  </span>
                </span>
                <span className={`text-[11px] ${isIbimeMode ? 'text-emerald-700' : 'text-zinc-400 group-hover:text-blue-500'} transition-colors`}>
                  {showDemoSelector ? 'Ocultar' : 'Ver perfiles'}
                </span>
              </button>

              {/* Contenedor Desplegable */}
              {showDemoSelector && (
                <div className="mt-4 p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none flex flex-col gap-3 animate-fade-in">
                  
                  {/* Selector de Categorías (Estilo iOS) */}
                  <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                    <button
                      type="button"
                      onClick={() => setActiveDemoCategory('gestion')}
                      className={`py-1.5 rounded-xl transition-all ${
                        activeDemoCategory === 'gestion' 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' 
                          : 'hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      {isIbimeMode ? 'Directiva' : 'Gestión'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDemoCategory('docentes')}
                      className={`py-1.5 rounded-xl transition-all ${
                        activeDemoCategory === 'docentes' 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' 
                          : 'hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Docentes
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveDemoCategory('estudiantes')}
                      className={`py-1.5 rounded-xl transition-all ${
                        activeDemoCategory === 'estudiantes' 
                          ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs' 
                          : 'hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      Alumnos 360
                    </button>
                  </div>

                  {/* Lista de Perfiles */}
                  <div className="flex flex-col gap-2 pt-1 max-h-80 overflow-y-auto pr-1">
                    {filteredDemoAccounts.map((demo) => {
                      const isSuspended = isSchoolSuspended(isIbimeMode ? 'sch-ibime' : 'sch-test-case');

                      return (
                        <button
                          key={demo.email}
                          type="button"
                          onClick={() => handleSelectDemo(demo)}
                          disabled={isSubmitting || authLoading}
                          className={`w-full flex items-center justify-between p-2.5 rounded-2xl border text-left transition-all duration-150 group disabled:opacity-50 ${
                            isSuspended
                              ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-100/50'
                              : isIbimeMode
                                ? 'border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-emerald-50/50 dark:hover:bg-zinc-800/90 hover:border-emerald-300 dark:hover:border-zinc-700'
                                : 'border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-blue-50/50 dark:hover:bg-zinc-800/90 hover:border-blue-200 dark:hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`h-8 w-8 rounded-xl ${demo.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0`}>
                              {demo.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className={`text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors truncate flex items-center gap-1.5 ${
                                isIbimeMode ? 'group-hover:text-emerald-600' : 'group-hover:text-blue-600'
                              }`}>
                                {demo.name}
                              </p>
                              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate">
                                {demo.grade}
                              </p>
                              {demo.campusName && (
                                <span className="inline-block mt-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
                                  {demo.campusName}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 transition-colors ${
                            isIbimeMode 
                              ? 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 group-hover:text-emerald-700 dark:group-hover:text-emerald-300'
                              : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-300'
                          }`}>
                            Acceder
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Ayuda o Soporte Institucional */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>
              {isIbimeMode 
                ? '¿Requieres asistencia institucional? Contacta a la Dirección de tu Plantel IBIME.'
                : '¿Requieres asistencia institucional? Contacta a tu plantel.'}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
