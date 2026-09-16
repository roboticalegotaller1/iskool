"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAcademicLevel, useCurrentDetailedStudent } from '@/store/useStudentStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { getStudentAvatarUrl } from '@/utils/studentAvatar';
import { 
  Flame, 
  Coins, 
  Trophy, 
  Compass, 
  BookOpen, 
  Sparkles, 
  ShoppingBag, 
  LogOut, 
  HelpCircle,
  Menu,
  X,
  Swords,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { isPlatformSuperUser } from '@/types';

export function StudentHUD() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const stats = useCurrentStudentStats();
  const activeLevel = useCurrentStudentAcademicLevel();
  const activeStudent = useCurrentDetailedStudent();

  const isSuperUser = isPlatformSuperUser(user);
  const isManagementRole = isSuperUser || user?.role === 'owner' || user?.role === 'admin' || user?.role === 'director';

  const avatarUrl = getStudentAvatarUrl(activeStudent);
  const studentName = activeStudent 
    ? `${activeStudent.first_name} ${activeStudent.last_name_1 || ''}`.trim() 
    : 'Lucas Hernández';

  // Cálculo de progreso de XP hacia el próximo nivel
  const currentLevel = stats?.level || 1;
  const currentXp = stats?.xp || 250;
  const xpForNextLevel = currentLevel * 500;
  const xpCurrentProgress = currentXp % 500;
  const xpPercentage = Math.min(Math.round((xpCurrentProgress / 500) * 100), 100);

  const navShortcuts = [
    { href: '/student', label: 'Misiones', icon: Compass, exact: true },
    { href: '/student/portfolio', label: 'Portafolio', icon: BookOpen },
    { href: '/student/avatar', label: 'Avatar & Compañero', icon: Sparkles },
    { href: '/student/shop', label: 'Tienda Mágica', icon: ShoppingBag }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-indigo-500/30 shadow-2xl shadow-indigo-950/50 transition-colors">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* LADO IZQUIERDO: HUD AVATAR & RANGO DEL JUGADOR */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          <Link href="/student/avatar" className="relative group/avatar cursor-pointer" title={`Expediente 360° · ${studentName}`}>
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-amber-500 via-indigo-500 to-teal-400 group-hover:scale-105 transition-transform shadow-md shadow-indigo-950/60">
              <div className="w-full h-full rounded-[14px] bg-slate-900 overflow-hidden flex items-center justify-center">
                <img
                  src={avatarUrl}
                  alt={studentName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/images/students/lucas.png';
                  }}
                />
              </div>
            </div>
            {/* Nivel Badge */}
            <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 border border-amber-300 shadow-xs">
              Nv.{currentLevel}
            </span>
          </Link>

          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-white truncate max-w-[130px] sm:max-w-[180px]">
                {studentName}
              </span>
              <span className="hidden sm:inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/25 border border-indigo-400/30 text-indigo-300">
                {activeLevel.fullGradeLabel}
              </span>
            </div>

            {/* Barra de Vida/XP estilo RPG en pantallas medianas */}
            <div className="hidden sm:flex items-center gap-2 mt-1">
              <div className="w-28 xl:w-36 h-2 bg-slate-800 rounded-full overflow-hidden border border-indigo-500/30">
                <div 
                  className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full transition-all duration-500 shadow-xs shadow-amber-400"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
              <span className="text-[9px] font-black text-amber-300 font-mono">
                {currentXp} XP
              </span>
            </div>
          </div>
        </div>

        {/* CENTRO: ENLACES RÁPIDOS DEL ENTORNO INMERSIVO */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navShortcuts.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border border-indigo-400/50 shadow-lg shadow-indigo-600/30 glow-indigo'
                    : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white border border-indigo-500/20 hover:border-indigo-400/40'
                }`}
              >
                <Icon className="h-4 w-4 text-teal-300" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* LADO DERECHO: ECONOMÍA DE JUEGO (COINS, RACHA, TIENDA & SALIDA) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Contador de Racha */}
          <div 
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-orange-500/30 text-orange-400 shadow-sm"
            title={`Racha de aprendizaje: ${stats?.current_streak || 1} días seguidos`}
          >
            <Flame className="h-4 w-4 fill-orange-500 text-orange-400 animate-pulse" />
            <span className="text-xs font-black font-mono">{stats?.current_streak || 1}d</span>
          </div>

          {/* Contador de Monedas de Oro */}
          <Link
            href="/student/shop"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 shadow-md shadow-amber-950/40 transition-all hover:scale-103 cursor-pointer group"
            title="Monedas Mágicas (Ir a Tienda)"
          >
            <Coins className="h-4 w-4 fill-amber-400 text-amber-300 group-hover:rotate-12 transition-transform" />
            <span className="text-xs font-black font-mono text-amber-200">{stats?.coins || 500}</span>
          </Link>

          {/* Acceso a Administración si es Directivo o Super Usuario */}
          {isManagementRole && (
            <Link
              href="/admin"
              className="hidden md:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all shadow-xs"
              title="Volver al Portal Administrativo"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              <span className="hidden xl:inline">Administración</span>
            </Link>
          )}

          {/* Guía */}
          <Link
            href="/guide?role=student"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Manual y Ayuda del Alumno"
          >
            <HelpCircle className="h-4 w-4" />
          </Link>

          {/* Logout */}
          <button
            onClick={() => logout()}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-800/40 transition-colors cursor-pointer"
            title="Cerrar sesión"
          >
            <LogOut className="h-4 w-4" />
          </button>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:bg-slate-900 border border-slate-800 transition-colors"
            aria-label="Abrir menú de juego"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil Gamer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-indigo-500/30 bg-slate-950/95 px-4 py-3 space-y-2 animate-fade-in shadow-2xl">
          <div className="p-3 rounded-2xl bg-slate-900 border border-indigo-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">Progreso de Experiencia:</span>
            <span className="text-xs font-black text-amber-400 font-mono">{currentXp} XP ({xpPercentage}%)</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {navShortcuts.map((item) => {
              const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="h-4 w-4 text-teal-300" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {isManagementRole && (
            <Link
              href="/admin"
              onClick={() => setIsMenuOpen(false)}
              className="flex items-center justify-between p-3 rounded-2xl text-xs font-bold text-indigo-300 bg-indigo-950/40 border border-indigo-500/40"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Panel de Administración</span>
              </div>
              <span>→</span>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
