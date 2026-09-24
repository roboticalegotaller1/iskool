"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useWhiteLabelStore } from '@/store/useWhiteLabelStore';
import { isPlatformSuperUser } from '@/types';
import { 
  GraduationCap, 
  BookOpen, 
  Palette, 
  Globe2, 
  Star, 
  ShieldCheck, 
  LogOut, 
  HelpCircle, 
  Menu, 
  X,
  ChevronRight,
  ExternalLink,
  Languages
} from 'lucide-react';

export function TeacherNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const whiteLabelLogo = useWhiteLabelStore(state => state.logoUrl);
  const whiteLabelSchoolName = useWhiteLabelStore(state => state.schoolName);
  const schoolSettings = useSchoolAdminStore(state => state.schoolSettings);

  const isSuperUser = isPlatformSuperUser(user);
  const isManagementRole = isSuperUser || user?.role === 'owner' || user?.role === 'admin' || user?.role === 'director';

  const navLinks = [
    { href: '/teacher', label: 'Hub Docente', icon: BookOpen, exact: true },
    { href: '/teacher/studio', label: 'Estudio ISkool', icon: Palette, badge: 'IA' },
    { href: '/teacher/idiomas', label: 'Centro de Idiomas', icon: Languages, badge: 'DELF / CENNI' },
    { href: '/teacher/community', label: 'Comunidad', icon: Globe2 },
    { href: '/teacher/grades', label: 'Boleta SEP', icon: Star }
  ];

  const displayName = user ? `${user.first_name || 'Profesor(a)'} ${user.last_name || ''}`.trim() : 'Docente';
  const schoolName = whiteLabelSchoolName || schoolSettings?.name || 'Colegio Nacional Mexico';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Identidad Institucional & Marca Blanca */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/teacher" className="flex items-center gap-2.5 group">
            {whiteLabelLogo ? (
              <img
                src={whiteLabelLogo}
                alt={schoolName}
                className="h-9 w-9 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white p-0.5 shadow-2xs"
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs group-hover:bg-blue-700 transition-colors">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                {schoolName}
              </span>
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                Portal Docente <span className="text-slate-300 dark:text-slate-600">•</span> Diseño Minimalista
              </span>
            </div>
          </Link>
        </div>

        {/* Navegación Principal Horizontal (Sin menús laterales invasivos) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-2xs">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Acciones de Gestión y Perfil */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Enlace de Supervisión / Presidencia (Solo para Directivos / Administradores) */}
          {isManagementRole && (
            <Link
              href="/admin"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
              title="Ir al Panel Institucional / Presidencia"
            >
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Administración</span>
              <ChevronRight className="h-3 w-3 text-slate-400" />
            </Link>
          )}

          {/* Guía y Documentación */}
          <Link
            href="/guide?role=teacher"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Centro de Guías y Ayuda Pedagógica"
          >
            <HelpCircle className="h-4 w-4" />
          </Link>

          {/* Ficha de Usuario & Logout */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-black text-xs flex items-center justify-center shrink-0">
              {displayName.charAt(0)}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px]">
                {displayName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
                {user?.role || 'Docente'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Abrir menú docente"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 space-y-1 animate-fade-in shadow-lg">
          {navLinks.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {isManagementRole && (
            <Link
              href="/admin"
              onClick={() => setIsMobileOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <span>Panel Administrativo</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1">
            <span className="text-xs text-slate-500 font-semibold">{displayName}</span>
            <button
              onClick={() => logout()}
              className="text-xs text-rose-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
