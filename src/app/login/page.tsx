"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
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
  CheckCircle2,
  BookOpen,
  Compass,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import { useStudentStore } from '@/store/useStudentStore';

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
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // Docentes
  {
    name: "Prof. Israel López Ángeles",
    role: "teacher",
    grade: "Docente Titular (Acceso Integral NEM)",
    email: "israel.lopez@jjrosseau.edu.mx",
    avatarColor: "bg-rose-500",
    id: "usr-teacher-1",
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
    grade: "Presidencia y Consejo Escolar",
    email: "dueno@jjrosseau.edu.mx",
    avatarColor: "bg-blue-600",
    id: "usr-owner-1",
    defaultPass: "DUE2026",
    category: "gestion"
  },
  {
    name: "Super Usuario Institucional",
    role: "admin",
    grade: "Administración Central del Sistema",
    email: "admin@iskool.edu.mx",
    avatarColor: "bg-slate-700",
    id: "usr-admin-1",
    defaultPass: "008805",
    category: "gestion"
  }
];

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('ISkoolPassword2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeDemoCategory, setActiveDemoCategory] = useState<DemoCategory>('docentes');
  const [showDemoSelector, setShowDemoSelector] = useState(false);

  const { login, loading: authLoading } = useAuth();
  const switchStudent = useStudentStore(state => state.switchStudent);
  const router = useRouter();

  const routeUserByRole = async (userProfile: any) => {
    const role = userProfile?.role || 'student';
    const studentId = userProfile?.id;

    if (role === 'student' && studentId) {
      await switchStudent(studentId);
    }

    switch (role) {
      case 'owner':
      case 'admin':
      case 'superadmin':
        router.push('/admin');
        break;
      case 'director':
        router.push('/director');
        break;
      case 'billing':
        router.push('/coordinator/billing');
        break;
      case 'coordinator':
        router.push('/coordinator');
        break;
      case 'teacher':
        router.push('/teacher');
        break;
      case 'parent':
        router.push('/parent');
        break;
      case 'student':
      default:
        router.push('/student');
        break;
    }
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
      const result = await login(email.trim(), password);
      if (result.success && result.user) {
        await routeUserByRole(result.user);
      } else {
        setErrorMsg(
          result.error || 
          'No se pudo autenticar la cuenta. Comprueba que tus datos sean correctos o prueba con un perfil de demostración.'
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err.message || 
        'Hubo un problema temporal de comunicación. Por favor verifica tu conexión y vuelve a intentar.'
      );
    } finally {
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
      const result = await login(demo.email, pass);
      if (result.success && result.user) {
        await routeUserByRole(result.user);
      } else {
        setErrorMsg(result.error || 'No fue posible acceder con este perfil de prueba.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al conectar con la sesión de prueba.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDemoAccounts = DEMO_ACCOUNTS.filter(d => d.category === activeDemoCategory);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#FAFAFA] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-500/20">
      
      {/* Columna Izquierda: Identidad Institucional & Calidad Visual Apple */}
      <div className="hidden lg:flex lg:w-5/12 xl:w-1/2 relative bg-gradient-to-br from-blue-900 via-indigo-950 to-zinc-950 flex-col justify-between p-12 xl:p-16 border-r border-zinc-200/10 dark:border-zinc-800/40 text-white overflow-hidden">
        {/* Glow de fondo sutil */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Barra superior con Logo institucional */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
            <GraduationCap className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white">
              ISkool
            </span>
            <span className="block text-[11px] text-blue-200/80 font-medium tracking-wide">
              Ecosistema Pedagógico Integral
            </span>
          </div>
        </div>

        {/* Contenido Central: Mensaje de Alto Valor */}
        <div className="max-w-md my-auto z-10 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold w-fit tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Innovación y Gamificación Curricular</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-snug">
            Educación activa, evaluación formativa y gestión sin fricción.
          </h2>

          <p className="text-zinc-300 text-sm leading-relaxed font-normal">
            Conectamos a docentes, alumnos y familias a través de actividades interactivas, planeaciones alineadas y dinámicas de logro escolar.
          </p>

          {/* Pilares Visuales Minimalistas */}
          <div className="grid grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                <BookOpen className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Bóveda Curricular Integrada</p>
                <p className="text-[11px] text-zinc-400">Contenidos y planeaciones oficiales al instante.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Lienzo Digital de Actividades</p>
                <p className="text-[11px] text-zinc-400">Juegos y dinámicas pedagógicas generadas en segundos.</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Acompañamiento y Privacidad</p>
                <p className="text-[11px] text-zinc-400">Gobernanza institucional y reportes claros para la comunidad.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de Marca */}
        <div className="text-zinc-400 text-xs z-10 flex items-center justify-between border-t border-white/10 pt-4">
          <span>© 2026 ISkool Academic.</span>
          <span className="text-[11px] text-zinc-500">Diseñado con enfoque centrado en el docente</span>
        </div>
      </div>

      {/* Columna Derecha: Formulario Limpio & Selector Segmentado */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 z-10">
        <div className="w-full max-w-md flex flex-col gap-8">
          
          {/* Header del Formulario */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5 lg:hidden mb-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">ISkool</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Bienvenido
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">
              Inicia sesión con tus credenciales institucionales para acceder a tu portal.
            </p>
          </div>

          {/* Mensaje de Error Amigable (Filosofía UX Teacher) */}
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
                  placeholder="ejemplo@iskool.edu.mx"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                  className="w-full pl-11 pr-11 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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

            {/* Botón Principal (Hero Action) */}
            <button
              type="submit"
              disabled={isSubmitting || authLoading}
              className="w-full mt-2 py-3.5 px-5 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white text-sm font-semibold rounded-2xl shadow-md shadow-blue-600/15 hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
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

          {/* Separador de Cero Fricción para Demostración */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="w-full py-2.5 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 text-xs font-medium flex items-center justify-between transition-colors group"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                <span>Explorar con Perfiles de Demostración</span>
              </span>
              <span className="text-[11px] text-zinc-400 group-hover:text-blue-500 transition-colors">
                {showDemoSelector ? 'Ocultar' : 'Ver perfiles'}
              </span>
            </button>

            {/* Contenedor Desplegable Limpio de Cuentas Demo (Apple Segmented Control) */}
            {showDemoSelector && (
              <div className="mt-4 p-4 rounded-3xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none flex flex-col gap-3 animate-fade-in">
                
                {/* Control de Segmentos (Estilo iOS) */}
                <div className="grid grid-cols-3 gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl text-[11px] font-semibold text-zinc-600 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => setActiveDemoCategory('docentes')}
                    className={`py-1.5 rounded-xl transition-all ${
                      activeDemoCategory === 'docentes' 
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
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
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                        : 'hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Alumnos
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveDemoCategory('gestion')}
                    className={`py-1.5 rounded-xl transition-all ${
                      activeDemoCategory === 'gestion' 
                        ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' 
                        : 'hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    Gestión
                  </button>
                </div>

                {/* Lista Limpia de Perfiles Segmentados */}
                <div className="flex flex-col gap-2 pt-1">
                  {filteredDemoAccounts.map((demo) => (
                    <button
                      key={demo.email}
                      type="button"
                      onClick={() => handleSelectDemo(demo)}
                      disabled={isSubmitting || authLoading}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl border border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 hover:bg-blue-50/50 dark:hover:bg-zinc-800/90 hover:border-blue-200 dark:hover:border-zinc-700 text-left transition-all duration-150 group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-xl ${demo.avatarColor} flex items-center justify-center text-white font-bold text-xs shadow-sm`}>
                          {demo.name[0]}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {demo.name}
                          </p>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500">
                            {demo.grade}
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                        Acceder
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Ayuda o Soporte Institucional */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>¿Requieres asistencia institucional? Contacta a tu plantel.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
