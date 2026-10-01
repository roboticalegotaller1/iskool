"use client";

import React, { useState, useMemo } from 'react';
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
import { BackButton } from '@/components/navigation/BackButton';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';

export function TeacherNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const whiteLabelLogo = useWhiteLabelStore(state => state.logoUrl);
  const whiteLabelSchoolName = useWhiteLabelStore(state => state.schoolName);
  const schoolSettings = useSchoolAdminStore(state => state.schoolSettings);

  const isSuperUser = isPlatformSuperUser(user);
  const isManagementRole = isSuperUser || user?.role === 'owner' || user?.role === 'admin' || user?.role === 'director';

  const isIbime = useMemo(() => {
    if (user?.school_id === 'sch-ibime') return true;
    if ((schoolSettings as { id?: string } | null)?.id === 'sch-ibime') return true;
    if (whiteLabelSchoolName?.toLowerCase().includes('ibime')) return true;
    if (schoolSettings?.name?.toLowerCase().includes('ibime')) return true;
    if (user?.email?.toLowerCase().includes('ibime')) return true;
    if (typeof window !== 'undefined') {
      if (document.documentElement.getAttribute('data-tenant') === 'ibime') return true;
      if (localStorage.getItem('tenant-id') === 'ibime') return true;
      if (localStorage.getItem('activeSchoolId') === 'sch-ibime') return true;
      if (window.location.pathname.includes('/ibime')) return true;
      if (window.location.hostname.includes('ibime')) return true;
    }
    return false;
  }, [user, schoolSettings, whiteLabelSchoolName]);

  const navLinks = [
    { href: '/teacher', label: 'Hub Docente', icon: BookOpen, exact: true },
    { href: '/teacher/studio', label: 'Estudio ISkool', icon: Palette, badge: 'IA' },
    { href: '/teacher/idiomas', label: 'Centro de Idiomas', icon: Languages, badge: 'DELF / CENNI' },
    { href: '/teacher/community', label: 'Comunidad', icon: Globe2 },
    { href: '/teacher/grades', label: 'Boleta SEP', icon: Star }
  ];

  const displayName = user ? `${user.first_name || 'Profesor(a)'} ${user.last_name || ''}`.trim() : 'Docente';
  const schoolName = isIbime 
    ? 'Instituto Bilingüe Ibime' 
    : (whiteLabelSchoolName || schoolSettings?.name || 'Colegio Nacional Mexico');

  return (
    <header className={`sticky top-0 z-40 transition-colors ${
      isIbime 
        ? 'bg-[#0F2744] text-white shadow-md border-b border-blue-900' 
        : 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-2xs'
    }`}>
      <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        
        {/* Identidad Institucional & Marca Blanca */}
        <div className="flex items-center gap-3 shrink-0 min-w-0">
          {pathname !== '/teacher' && (
            <BackButton 
              fallbackUrl="/teacher" 
              label="Regresar" 
              variant={isIbime ? 'header' : 'subtle'} 
              className={`h-9 px-2.5 text-xs font-bold rounded-xl inline-flex items-center gap-1 shrink-0 ${
                isIbime 
                  ? 'bg-[#17426D] hover:bg-[#1E5285] text-white border border-blue-700/80 shadow-xs' 
                  : 'py-1 px-2.5 text-[11px]'
              }`}
            />
          )}
          <Link href="/teacher" className="flex items-center gap-3 group min-w-0">
            {isIbime ? (
              <div className="p-1 rounded-2xl bg-white shadow-md border border-slate-200 shrink-0 flex items-center justify-center">
                <IbimeOfficialLogo size={40} showText={false} />
              </div>
            ) : whiteLabelLogo ? (
              <img
                src={whiteLabelLogo}
                alt={schoolName}
                className="h-10 w-10 rounded-xl object-contain border border-slate-200 dark:border-slate-800 bg-white p-0.5 shadow-2xs"
              />
            ) : (
              <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-xs group-hover:bg-blue-700 transition-colors">
                <GraduationCap className="h-5 w-5" />
              </div>
            )}
            
            <div className="flex flex-col min-w-0">
              {isIbime ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    <span className="text-base sm:text-lg font-extrabold tracking-tight text-white whitespace-nowrap">
                      {schoolName}
                    </span>
                    <span 
                      data-testid="institutional-badge" 
                      style={{ color: '#E41B14' }}
                      className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E41B14] border border-red-300 shadow-xs whitespace-nowrap"
                    >
                      Portal Docente
                    </span>
                    <span className="hidden xl:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0B1E36] text-blue-200 border border-blue-700/60 whitespace-nowrap">
                      CCT 15PPR3322G
                    </span>
                  </div>
                  <span className="text-[10.5px] text-blue-100 font-medium hidden md:block truncate">
                    Red Bilingüe & Bachillerato CCH UNAM · Gestión Pedagógica Oficial
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">
                    {schoolName}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    Portal Docente <span className="text-slate-300 dark:text-slate-600">•</span> Gestión Pedagógica
                  </span>
                </>
              )}
            </div>
          </Link>
        </div>

        {/* Navegación Principal Horizontal (Sin menús laterales invasivos) */}
        <nav className="hidden md:flex items-center gap-1.5 shrink-0 flex-nowrap">
          {navLinks.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            if (isIbime) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`h-9 px-3 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shrink-0 leading-none ${
                    isActive
                      ? 'bg-[#17426D] text-white border border-[#E41B14]/60 shadow-xs font-extrabold'
                      : 'text-blue-100 hover:text-white hover:bg-white/10 border border-transparent'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-amber-300' : 'text-blue-200'}`} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black leading-none shrink-0 ${
                      item.badge === 'IA' 
                        ? 'bg-[#E41B14] text-white shadow-xs' 
                        : 'bg-[#0B1E36] text-cyan-200 border border-blue-700 shadow-xs'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-9 px-3 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 shrink-0 leading-none ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/60 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-blue-600 text-white shadow-2xs leading-none">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Acciones de Gestión y Perfil */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
          {/* Enlace de Supervisión / Presidencia (Solo para Directivos / Administradores) */}
          {isManagementRole && (
            <Link
              href="/admin"
              className={`h-9 px-3 rounded-xl text-xs font-bold transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-98 shrink-0 leading-none ${
                isIbime
                  ? 'bg-[#17426D] hover:bg-[#1E5285] text-white border border-blue-700/80'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
              }`}
              title="Ir al Panel Institucional / Presidencia"
            >
              <ShieldCheck className={`h-4 w-4 shrink-0 ${isIbime ? 'text-[#E41B14]' : 'text-indigo-600 dark:text-indigo-400'}`} />
              <span className="whitespace-nowrap">Administración</span>
              <ChevronRight className={`h-3.5 w-3.5 shrink-0 ${isIbime ? 'text-blue-300' : 'text-slate-400'}`} />
            </Link>
          )}

          {/* Guía y Documentación */}
          <Link
            href="/guide?role=teacher"
            className={`h-9 w-9 rounded-xl inline-flex items-center justify-center transition-colors shrink-0 ${
              isIbime
                ? 'text-blue-200 hover:text-white hover:bg-white/10'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="Centro de Guías y Ayuda Pedagógica"
          >
            <HelpCircle className="h-4 w-4" />
          </Link>

          {/* Ficha de Usuario & Logout */}
          <div className={`hidden sm:flex items-center gap-2.5 pl-3 border-l shrink-0 ${
            isIbime ? 'border-blue-800/80' : 'border-slate-200 dark:border-slate-800'
          }`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-xs ${
              isIbime
                ? 'bg-[#17426D] border border-blue-600/70 text-white'
                : 'bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
            }`}>
              {displayName.charAt(0)}
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className={`text-xs font-bold truncate max-w-[140px] flex items-center gap-1.5 ${
                isIbime ? 'text-white' : 'text-slate-900 dark:text-slate-100'
              }`}>
                <span>{displayName}</span>
                {isIbime && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
              </span>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                isIbime ? 'text-amber-300' : 'text-slate-500 dark:text-slate-400'
              }`}>
                {user?.role || 'Docente'}
              </span>
            </div>
            <button
              onClick={() => logout()}
              className={`h-9 px-2.5 sm:px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 leading-none ${
                isIbime
                  ? 'bg-emerald-900/90 hover:bg-rose-700 text-white border border-blue-800 hover:border-rose-600 shadow-xs'
                  : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
              title="Cerrar sesión"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden 2xl:inline whitespace-nowrap">Cerrar Sesión</span>
            </button>
          </div>

          {/* Botón Menú Móvil */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className={`md:hidden h-9 w-9 rounded-xl inline-flex items-center justify-center transition-colors shrink-0 ${
              isIbime
                ? 'text-white hover:bg-white/10'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            aria-label="Abrir menú docente"
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {isMobileOpen && (
        <div className={`md:hidden border-t px-4 py-3 space-y-1.5 animate-fade-in shadow-lg ${
          isIbime
            ? 'bg-[#0F2744] border-blue-900 text-white'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
        }`}>
          {navLinks.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            if (isIbime) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#17426D] text-white border border-[#E41B14]/60'
                      : 'text-blue-100 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                      item.badge === 'IA' ? 'bg-[#E41B14] text-white' : 'bg-[#0B1E36] text-cyan-200 border border-blue-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            }

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
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold ${
                isIbime
                  ? 'text-white bg-[#17426D] border border-blue-700'
                  : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className={`h-4 w-4 ${isIbime ? 'text-[#E41B14]' : 'text-indigo-600'}`} />
                <span>Panel Administrativo</span>
              </div>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}

          <div className={`pt-2 border-t flex items-center justify-between px-1 ${
            isIbime ? 'border-blue-900/80 text-blue-200' : 'border-slate-100 dark:border-slate-800 text-slate-500'
          }`}>
            <span className="text-xs font-semibold">{displayName}</span>
            <button
              onClick={() => logout()}
              className="text-xs text-rose-500 hover:text-rose-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" /> Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
