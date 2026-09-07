"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAcademicLevel } from '../store/useStudentStore';
import { useSchoolAdminStore, applyThemeCssVariables } from '../store/useSchoolAdminStore';
import { getStudentAcademicLevelInfo } from '@/lib/academicLevels';
import { useGamificationStore } from '../store/useGamificationStore';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { Flame, Coins, Trophy, RefreshCw, GraduationCap, Users, User, ArrowRight, LogOut, HelpCircle, Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Header: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const switchStudent = useStudentStore(state => state.switchStudent);
  const stats = useCurrentStudentStats();
  const currentAcademicLevel = useCurrentStudentAcademicLevel();
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const schoolSettings = useSchoolAdminStore(state => state.schoolSettings);

  useEffect(() => {
    if (schoolSettings?.themeColors) {
      applyThemeCssVariables(schoolSettings.themeColors);
    }
  }, [schoolSettings?.themeColors]);

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);
  
  const studentsList = detailedStudents.map(ds => ({
    id: ds.id,
    first_name: ds.first_name,
    last_name: `${ds.last_name_1} ${ds.last_name_2 || ''}`.trim(),
    role: 'student' as const,
    email: ds.email || `${ds.first_name.toLowerCase()}@iskool.edu.mx`,
    created_at: ds.birth_date,
    updated_at: new Date().toISOString()
  }));

  const resetAllData = () => {
    useStudentStore.getState().resetStudentStore();
    usePortfolioStore.getState().resetPortfolioStore();
    useGamificationStore.getState().resetGamificationStore();
    useSchoolAdminStore.getState().resetSchoolAdminStore();
  };

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const getRoleFromPath = () => {
    if (pathname.startsWith('/director')) return 'director';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/student')) return 'student';
    if (pathname.startsWith('/teacher')) return 'teacher';
    if (pathname.startsWith('/parent')) return 'parent';
    if (pathname.startsWith('/coordinator')) return 'coordinator';
    return 'none';
  };

  const currentRole = getRoleFromPath();

  // Super Usuario, Dueño de Empresa y Administradores pueden alternar vistas para supervisión
  const canSwitchRoles = user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'owner';

  const getStudentLevelLabel = (id: string) => {
    const studentProfile = detailedStudents?.find(s => s.id === id);
    return getStudentAcademicLevelInfo(studentProfile).fullGradeLabel;
  };

  // Enlaces de navegación según rol activo
  const getNavLinks = () => {
    if (currentRole === 'student') {
      return [
        { href: '/student', label: 'Misiones', icon: '🗺️' },
        { href: '/student/portfolio', label: 'Mi Portafolio', icon: '📋' },
        { href: '/student/avatar', label: 'Avatar & Mascota', icon: '🐾' },
        { href: '/student/shop', label: 'Tienda Mágica', icon: '✨' },
      ];
    }
    if (currentRole === 'teacher') {
      return [
        { href: '/teacher', label: 'Planeación & Portafolio', icon: '📖' },
        { href: '/teacher/studio', label: 'Estudio Docente', icon: '🎨' },
        { href: '/teacher/community', label: 'Comunidad Docente', icon: '🌍' },
        { href: '/teacher/grades', label: 'Boleta SEP', icon: '⭐' },
      ];
    }
    if (currentRole === 'parent') {
      return [
        { href: '/parent', label: 'Muro de Logros', icon: '🏆' },
        { href: '/parent/financial', label: 'Estado de Cuenta & Pagos', icon: '💳' },
      ];
    }
    if (currentRole === 'director' || (user?.role === 'director' && pathname.startsWith('/director'))) {
      return [
        { href: '/director', label: 'Dashboard Director', icon: '🏛️' },
        { href: '/coordinator', label: 'Control Escolar', icon: '📚' },
        { href: '/coordinator/billing', label: 'Cobranza & Finanzas', icon: '💵' },
        { href: '/teacher/grades', label: 'Supervisión SEP', icon: '⭐' },
      ];
    }
    if (currentRole === 'coordinator') {
      const links = [
        { href: '/coordinator', label: 'Control Escolar', icon: '📚' },
        { href: '/coordinator/billing', label: 'Cobranza', icon: '💵' },
        { href: '/coordinator/fiscal', label: 'Facturación SAT', icon: '📑' },
      ];
      if (canSwitchRoles) {
        links.push({ href: '/admin', label: 'Panel Administrador', icon: '🏫' });
      }
      return links;
    }
    return [];
  };

  // Destino del enlace institucional: Super Usuario y Dueño van a /admin, los demás a su portal específico
  const getHomeHref = () => {
    if (canSwitchRoles) return '/admin';
    if (user?.role === 'director' || currentRole === 'director') return '/director';
    if (user?.role === 'student' || currentRole === 'student') return '/student';
    if (user?.role === 'teacher' || currentRole === 'teacher') return '/teacher';
    if (user?.role === 'parent' || currentRole === 'parent') return '/parent';
    if (user?.role === 'coordinator' || currentRole === 'coordinator') return '/coordinator';
    return '/login';
  };

  const navLinks = getNavLinks();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200/80 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8 gap-2 sm:gap-4">
        {/* Logo e Identidad Institucional (Dirige al portal específico del usuario, o a todas las opciones sólo si es Super Usuario) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Link 
            href={getHomeHref()} 
            aria-label="Página de inicio institucional"
            className="flex items-center gap-2.5 group hover:opacity-90 transition-opacity"
          >
            {schoolSettings.logoUrl ? (
              <img 
                src={schoolSettings.logoUrl} 
                alt={schoolSettings.name || "Logo Institucional"} 
                className="h-8 w-8 sm:h-9 sm:w-9 object-contain rounded-lg group-hover:scale-105 transition-transform"
              />
            ) : (
              <GraduationCap className="h-7 w-7 sm:h-8 sm:w-8 group-hover:scale-105 transition-transform" style={{ color: 'var(--brand-primary)' }} />
            )}
            <div className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-baseline gap-1.5">
              <span className="group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{schoolSettings.name || 'ISkool'}</span>
              <span className="font-semibold text-[10px] sm:text-xs text-blue-600 dark:text-blue-400">Académico</span>
            </div>
          </Link>
        </div>

        {/* Navegación de Escritorio (Desktop >= lg) */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Navegación principal">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-xs xl:text-sm font-semibold transition-all px-2.5 xl:px-3 py-1.5 rounded-xl flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/70 shadow-xs'
                    : 'text-zinc-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 hover:bg-zinc-100/60 dark:hover:bg-zinc-850'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Enlace Global a Guía & Ayuda */}
          <Link
            href={`/guide${currentRole !== 'none' ? `?role=${currentRole}` : ''}`}
            aria-label="Ir a la guía y centro de ayuda"
            className={`text-xs xl:text-sm font-semibold transition-all px-2.5 py-1.5 rounded-xl flex items-center gap-1 ${
              pathname === '/guide' 
                ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/70' 
                : 'text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-850'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Guía</span>
          </Link>
        </nav>

        {/* Stats, Switcher de Roles y Acciones de Usuario */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Stats para Estudiante */}
          {currentRole === 'student' && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-bold">
              <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/70 dark:border-blue-800/70 text-blue-700 dark:text-blue-300 font-bold" title="Nivel Académico del Alumno">
                <span>🎒</span>
                <span>{currentAcademicLevel.fullGradeLabel}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 border border-orange-200/60 text-orange-600 dark:text-orange-400" title="Racha">
                <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-500" />
                <span>{stats.current_streak}d</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 text-amber-600 dark:text-amber-400" title="Monedas">
                <Coins className="h-3.5 w-3.5 fill-amber-400 text-amber-500" />
                <span>{stats.coins}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200/60 text-purple-600 dark:text-purple-400" title="Nivel de Gamificación">
                <Trophy className="h-3.5 w-3.5 text-purple-500" />
                <span>Nv.{stats.level}</span>
              </div>
            </div>
          )}

          {/* Selector Rápido de Roles (Desktop / Tablet >= sm) */}
          {canSwitchRoles && (
            <div className="hidden sm:flex items-center gap-0.5 bg-zinc-100 dark:bg-zinc-900 p-0.5 rounded-xl border border-zinc-200/70 dark:border-zinc-800" role="group" aria-label="Cambio rápido de vista por rol">
              <Link
                href="/student"
                aria-label="Cambiar vista a Alumno"
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'student'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Alumno
              </Link>
              <Link
                href="/teacher"
                aria-label="Cambiar vista a Profesor"
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'teacher'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Profesor
              </Link>
              <Link
                href="/parent"
                aria-label="Cambiar vista a Tutor"
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'parent'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Tutor
              </Link>
              <Link
                href="/coordinator"
                aria-label="Cambiar vista a Coordinador"
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'coordinator'
                    ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
                }`}
              >
                Coord.
              </Link>
              <Link
                href="/director"
                aria-label="Cambiar vista a Director"
                className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                  currentRole === 'director'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40'
                }`}
              >
                Director
              </Link>
              {canSwitchRoles && (
                <Link
                  href="/admin"
                  aria-label="Directorio Central de Colegios"
                  className={`px-2 py-1 rounded-lg text-xs font-semibold transition-all ${
                    pathname.startsWith('/admin')
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40'
                  }`}
                >
                  Colegios
                </Link>
              )}
            </div>
          )}

          {/* Selector Compacto de Rol para Móvil (< sm) */}
          {canSwitchRoles && (
            <div className="sm:hidden flex items-center">
              <select
                value={currentRole}
                aria-label="Cambiar rol en móvil"
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === 'admin') window.location.href = '/admin';
                  else if (val !== 'none') window.location.href = `/${val}`;
                }}
                className="bg-zinc-100 dark:bg-zinc-900 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 py-1 px-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 focus:outline-none"
              >
                <option value="student">Alumno</option>
                <option value="teacher">Profesor</option>
                <option value="parent">Tutor</option>
                <option value="coordinator">Coord.</option>
                <option value="director">Director</option>
                {canSwitchRoles && <option value="admin">Colegios</option>}
              </select>
            </div>
          )}

          {/* Botón de Reiniciar Datos */}
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            aria-label="Reiniciar datos de prueba"
            title="Reiniciar Datos"
            className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          {/* Botón de Cerrar Sesión */}
          {user && (
            <button
              type="button"
              onClick={logout}
              aria-label="Cerrar sesión de usuario"
              title="Cerrar Sesión"
              className="p-1.5 sm:p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}

          {/* Botón de Menú Hamburguesa para Móvil y Tablet (< lg) */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Cerrar menú de navegación" : "Abrir menú de navegación"}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors border border-zinc-200/80 dark:border-zinc-800"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Cajón de Navegación Desplegable Móvil & Tablet (< lg) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-4 space-y-3 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400 px-1">
            <span>Módulos de ISkool</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold uppercase">
              {currentRole === 'teacher' ? 'Docente' : currentRole === 'student' ? 'Estudiante' : currentRole === 'parent' ? 'Tutor' : 'Coordinación'}
            </span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-xs'
                      : 'text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <Link
              href={`/guide${currentRole !== 'none' ? `?role=${currentRole}` : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <HelpCircle className="w-4 h-4 text-zinc-500" />
              <span>Centro de Guía & Ayuda</span>
            </Link>
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Reinicio */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl p-6 border border-zinc-200 dark:border-zinc-800">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              ⚠️ ¿Restablecer Datos Simulados?
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
              Esta acción eliminará todos los alumnos registrados, grupos conformados y horarios creados durante esta sesión de prueba, restaurando las semillas originales. ¿Deseas continuar?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 border rounded-full text-xs font-bold text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  resetAllData();
                  setIsResetConfirmOpen(false);
                  window.location.reload();
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-full text-xs font-bold shadow-md shadow-red-500/10 transition-all"
              >
                Sí, restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
