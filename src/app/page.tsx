"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Trophy, Users, ShieldAlert, Sparkles, BookOpen, Compass, Heart, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Loader } from "@/components/Loader";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirigir al login si no hay sesión activa
        router.replace('/login');
      } else if (user.role !== 'admin') {
        // Redirigir a cada cuenta exclusivamente a su propio portal
        switch (user.role) {
          case 'student':
            router.replace('/student');
            break;
          case 'teacher':
            router.replace('/teacher');
            break;
          case 'parent':
            router.replace('/parent');
            break;
          case 'coordinator':
            router.replace('/coordinator');
            break;
          default:
            router.replace('/login');
            break;
        }
      }
    }
  }, [user, loading, router]);

  // Si está comprobando sesión o el usuario no es Super Usuario, bloquear visualización
  if (loading || !user || user.role !== 'admin') {
    return <Loader message="Verificando permisos de super usuario..." />;
  }
  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50 font-sans">
      
      {/* Navbar Simple */}
      <header className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80 sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold tracking-tight">ISkool Académico</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/promo"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-md shadow-purple-500/20 hover:scale-105 transition-all"
            >
              <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
              <span>Vídeo Promo</span>
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-zinc-100 dark:text-zinc-900 font-bold text-xs transition-all border border-zinc-700 dark:border-zinc-300 shadow-sm"
            >
              <span>Iniciar Sesión</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        
        {/* Intro */}
        <div className="text-center max-w-2xl mb-12 flex flex-col items-center gap-4">
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 px-3 py-1 rounded-full text-xs font-bold border border-blue-200/20">
            <Sparkles className="h-3.5 w-3.5" />
            La Nueva Escuela Mexicana Gamificada
          </span>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
            Módulo Académico Gamificado
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-lg mt-2">
            Una experiencia inmersiva que conecta a alumnos, maestros y padres mediante mecánicas lúdicas de aprendizaje y portafolios digitales de evidencias.
          </p>
        </div>

        {/* Portales de Acceso */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-7xl">
          
          {/* Tarjeta Estudiante */}
          <Link
            href="/student"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-blue-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 w-fit group-hover:scale-110 transition-transform">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  Portal de Alumnos
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Accede a tus misiones, personaliza tu avatar o mascota, resuelve cuestionarios interactivos y sube evidencias a tu portafolio.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400">
              Entrar como Alumno
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta Profesor */}
          <Link
            href="/teacher"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-yellow-500 hover:shadow-xl hover:shadow-yellow-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-yellow-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-yellow-50 text-yellow-600 dark:bg-yellow-950 dark:text-yellow-400 w-fit group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  Portal del Docente
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Revisa entregas de evidencias, asigna retroalimentación formativa y traduce el progreso del alumno directamente a la Boleta SEP.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-yellow-600 dark:text-yellow-500">
              Entrar como Profesor
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta Padre */}
          <Link
            href="/parent"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-rose-500 hover:shadow-xl hover:shadow-rose-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-rose-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400 w-fit group-hover:scale-110 transition-transform">
                <Heart className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Portal de Padres
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Observa el muro de logros de tu hijo(a), deja comentarios motivacionales y observa su avance en tiempo real.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              Entrar como Tutor
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta Coordinador */}
          <Link
            href="/coordinator"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-violet-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950 dark:text-violet-400 w-fit group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                  Portal del Coordinador
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Gestiona expedientes escolares (NEM), administra y genera grupos, y planifica los horarios de clases de forma ágil.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400">
              Entrar como Coordinador
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Tarjeta Super Usuario */}
          <Link
            href="/admin"
            className="group relative flex flex-col justify-between p-6 rounded-3xl border border-zinc-200/80 bg-white hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/5 transition-all dark:border-zinc-800/80 dark:bg-zinc-900/50 dark:hover:border-amber-500"
          >
            <div className="flex flex-col gap-4">
              <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400 w-fit group-hover:scale-110 transition-transform">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Portal de Super Usuario
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-normal">
                  Gestiona las escuelas (colegios), materias y configuraciones globales en una vista interactiva de alto rendimiento.
                </p>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400">
              Entrar como Administrador
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-200 dark:border-zinc-800 py-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
        © 2026 ISkool Academic. Todos los derechos reservados.
      </footer>

    </div>
  );
}
