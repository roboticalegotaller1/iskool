"use client";

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import CEOExecutiveDashboard, { DEFAULT_IBIME_HOLDING } from '@/components/admin/CEOExecutiveDashboard';
import { 
  IbimeCatalogService,
  IBIME_CAMPUSES,
  IBIME_STUDENTS,
  IBIME_TEACHERS,
  IBIME_SUBJECTS,
  IBIME_PAYROLL
} from '@/lib/curriculum/ibimeCatalogService';
import { 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  ShieldCheck, 
  Search, 
  MapPin, 
  Phone, 
  Mail, 
  Award, 
  Calendar, 
  LogOut, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Clock, 
  DollarSign, 
  Sparkles, 
  Filter, 
  ChevronRight,
  Compass,
  FileText,
  Lock,
  Globe,
  Heart
} from 'lucide-react';
import { DetailedStudent, Subject, Campus, UserProfile } from '@/types';
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';
import { switchCanonicalStudent } from '@/lib/auth/multiTenantSession';

type IbimeTab = 'sedes' | 'alumnos' | 'docentes' | 'boveda' | 'finanzas';

function IbimePortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const viewParam = searchParams?.get('view');
  const tabParam = searchParams?.get('tab') as IbimeTab | null;

  const { user, login, logout, loading: authLoading } = useAuth();

  // Conmutador directo a la experiencia de padres enlazando una cuenta real de tutor IBIME
  const handleGoToParentExperience = async () => {
    try {
      await switchCanonicalStudent('std-ibime-montes-01');
      if (login) {
        await login('familia.morales@ibime.edu.mx');
      }
    } catch (err) {
      console.error('Error switching to parent account:', err);
    }
    router.push('/parent');
  };

  // Estado para alternar entre Visión Ejecutiva CEO y Tablero Operativo Clásico
  const [viewMode, setViewMode] = useState<'ceo' | 'operational'>('operational');

  // Forzar síncronamente los atributos del DOM para el tenant IBIME
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-tenant', 'ibime');
      document.cookie = 'tenant-id=ibime; path=/; max-age=31536000; SameSite=Lax';
      localStorage.setItem('tenant-id', 'ibime');
    }
  }, []);

  // Validación de Control de Acceso Zero-Trust:
  // Requiere sesión activa y pertenencia a IBIME con rol directivo o administrativo.
  // Si el usuario es alumno o padre de familia, se le transfiere amablemente a su portal correspondiente.
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/ibime/login');
        return;
      }
      if (user.role === 'student') {
        router.push('/student');
        return;
      }
      if (user.role === 'parent' || user.role === 'tutor') {
        router.push('/parent');
        return;
      }
      const isIbimeStaff = user.school_id === 'sch-ibime' || 
                           user.email?.toLowerCase().includes('ibime') ||
                           user.role === 'admin' || 
                           user.role === 'superadmin' ||
                           user.role === 'teacher' ||
                           user.role === 'director' ||
                           user.role === 'coordinator' ||
                           user.role === 'billing' ||
                           user.role === 'owner';
      if (!isIbimeStaff) {
        router.push('/login?error=unauthorized_ibime');
      }
    }
  }, [user, authLoading, router]);

  // Filtros de navegación directiva
  const [activeTab, setActiveTab] = useState<IbimeTab>('sedes');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<DetailedStudent | null>(null);

  // Inicialización de la vista y tab según query params o rol oficial
  useEffect(() => {
    if (tabParam && ['sedes', 'alumnos', 'docentes', 'boveda', 'finanzas'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    if (viewParam === 'ceo') {
      setViewMode('ceo');
    } else if (viewParam === 'operational') {
      setViewMode('operational');
    } else if (user) {
      const isDirectorOrOwner = user.role === 'director' || user.role === 'owner' || user.role === 'ceo' || user.role === 'admin' || user.role === 'superadmin';
      // Por mandato directivo: Los directores y dueños de IBIME acceden directamente a Visión CEO
      if (isDirectorOrOwner) {
        setViewMode('ceo');
      }
    }
  }, [viewParam, user]);

  // 1. Sedes Oficiales de IBIME (4 Planteles)
  const ibimeCampuses = useMemo(() => {
    return IbimeCatalogService.getCampuses();
  }, []);

  // 2. Alumnos de IBIME
  const ibimeStudents = useMemo(() => {
    return IbimeCatalogService.getStudents();
  }, []);

  // 3. Docentes de IBIME
  const ibimeTeachers = useMemo(() => {
    return IbimeCatalogService.getTeachers();
  }, []);

  // 4. Asignaturas y Bóveda Curricular IBIME
  const ibimeSubjects = useMemo(() => {
    return IbimeCatalogService.getSubjects();
  }, []);

  // 5. Nómina y Finanzas IBIME
  const ibimePayroll = useMemo(() => {
    return IbimeCatalogService.getPayroll();
  }, []);

  // Alumnos filtrados por campus, nivel y búsqueda
  const filteredStudents = useMemo(() => {
    return ibimeStudents.filter(std => {
      const matchesSearch = 
        `${std.first_name} ${std.last_name_1} ${std.last_name_2 || ''}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
        (std.curp && std.curp.toLowerCase().includes(studentSearch.toLowerCase())) ||
        (std.email && std.email.toLowerCase().includes(studentSearch.toLowerCase()));

      const matchesCampus = selectedCampusId === 'all' || std.campus_id === selectedCampusId || std.campus_name?.toLowerCase().includes(selectedCampusId.replace('cmp-ibime-', ''));
      const matchesLevel = selectedLevelFilter === 'all' || std.level === selectedLevelFilter;

      return matchesSearch && matchesCampus && matchesLevel;
    });
  }, [ibimeStudents, studentSearch, selectedCampusId, selectedLevelFilter]);

  const handleLogout = async () => {
    await logout();
    if (typeof window !== 'undefined') {
      document.cookie = 'ibime_session=; path=/; max-age=0; SameSite=Lax';
      window.location.href = '/02DJoUJSkwYQZjn';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 animate-spin text-red-400" />
          <span>Verificando credenciales perimetrales IBIME...</span>
        </div>
      </div>
    );
  }

  const isIbimeStaff = Boolean(
    user && (
      user.school_id === 'sch-ibime' || 
      user.email?.toLowerCase().includes('ibime') ||
      user.role === 'admin' || 
      user.role === 'superadmin'
    )
  );

  if (!user || !isIbimeStaff) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold mb-2">403 - Acceso Denegado</h1>
        <p className="text-slate-400 max-w-md mb-6">
          Se requiere una sesión activa con rol directivo o administrativo perteneciente a la organización Instituto Bilingüe IBIME para acceder a este portal.
        </p>
        <button
          onClick={() => router.push('/ibime/login')}
          className="px-6 py-2.5 bg-[#E41B14] hover:bg-red-500 text-white rounded-lg font-medium transition cursor-pointer"
        >
          Iniciar Sesión Institucional
        </button>
      </div>
    );
  }

  const activeUser = user;
  const userName = `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim() || 'Directivo IBIME';
  const userCampus = activeUser.campus_name || 'Dirección General (Campus Montes Sede Matriz & CCH)';
  const isDirector = activeUser.role === 'director' || activeUser.role === 'admin' || activeUser.role === 'superadmin' || activeUser.role === 'owner';
  const isTeacher = activeUser.role === 'teacher';
  const isCoordinator = activeUser.role === 'coordinator';
  const isBilling = activeUser.role === 'billing';

  // Si está activo el modo Visión Ejecutiva CEO, renderizar el dashboard CEO integral de IBIME
  if (viewMode === 'ceo') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
        {/* HEADER INSTITUCIONAL SOBERANO IBIME - VISIÓN EJECUTIVA CEO */}
        <header className="sticky top-0 z-50 w-full bg-[#0F2744] text-white shadow-md border-b border-blue-900">
          <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 min-w-0 shrink">
              <div className="p-1 rounded-2xl bg-white shadow-md border border-slate-200 shrink-0 flex items-center justify-center">
                <IbimeOfficialLogo size={40} showText={false} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <span className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                    Instituto Bilingüe IBIME
                  </span>
                  <span 
                    data-testid="institutional-badge" 
                    style={{ color: '#E41B14' }}
                    className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E41B14] border border-red-300 shadow-xs whitespace-nowrap"
                  >
                    IBIME Bicultural Hub
                  </span>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-amber-950 border border-amber-300 shadow-xs font-bold whitespace-nowrap">
                    Visión Ejecutiva CEO
                  </span>
                </div>
                <span className="text-[11px] text-blue-100 font-medium hidden 2xl:block truncate">
                  Red Bilingüe & Bachillerato CCH UNAM (4 Sedes: Montes, Lagos, San Cristóbal, Coacalco)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
              <button
                onClick={async () => {
                  await switchCanonicalStudent('std-ibime-montes-01');
                  router.push('/student');
                }}
                className="h-9 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-amber-300 active:scale-98 shrink-0 leading-none"
                title="Vivenciar la experiencia inmersiva del alumno (Iker Santiago Morales - Ignis)"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Experiencia Alumno 360°</span>
                <span className="sm:hidden">Alumno</span>
              </button>

              <button
                onClick={handleGoToParentExperience}
                className="h-9 px-3 rounded-xl bg-[#17426D] hover:bg-[#1E5285] text-white font-bold text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-red-400 active:scale-98 shrink-0 leading-none"
                title="Vivenciar la experiencia de padres de familia (Familia Morales Peña)"
              >
                <Heart className="w-3.5 h-3.5 text-rose-300 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Experiencia Familia</span>
                <span className="sm:hidden">Familia</span>
              </button>

              <button
                onClick={() => setViewMode('operational')}
                className="h-9 px-3 rounded-xl bg-white text-[#E41B14] hover:bg-red-50 font-bold text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-red-200 active:scale-98 shrink-0 leading-none"
                title="Conmutar al Tablero Operativo Clásico"
              >
                <Layers className="w-4 h-4 text-[#C01D0C] shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Tablero Operativo</span>
              </button>

              <button
                onClick={handleLogout}
                className="h-9 px-3.5 rounded-xl bg-emerald-900/90 hover:bg-rose-700 text-white font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer border border-blue-800 hover:border-rose-600 shadow-xs shrink-0 leading-none"
                title="Cerrar sesión institucional y volver al portal"
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL DE VISIÓN EJECUTIVA CEO */}
        <main className="flex-1 flex flex-col">
          <CEOExecutiveDashboard
            holding={DEFAULT_IBIME_HOLDING}
            schoolId="sch-ibime"
            isSuperUser={false}
            onSwitchToOperational={() => setViewMode('operational')}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* =========================================================================
          1. HEADER INSTITUCIONAL SOBERANO DE IBIME (100% MARCA BLANCA IBIME)
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#0F2744] text-white shadow-md border-b border-blue-900">
        <div className="max-w-[1680px] w-full mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Identidad Institucional Oficial */}
          <div className="flex items-center gap-3.5 min-w-0 shrink">
            <div className="p-1 rounded-2xl bg-white shadow-md border border-red-300 shrink-0 flex items-center justify-center">
              <IbimeOfficialLogo size={40} showText={false} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <span className="text-base sm:text-lg lg:text-xl font-extrabold tracking-tight text-white whitespace-nowrap">
                  Instituto Bilingüe IBIME
                </span>
                <span 
                  data-testid="institutional-badge" 
                  style={{ color: '#E41B14' }}
                  className="hidden md:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-50 text-[#E41B14] border border-red-300 shadow-xs whitespace-nowrap"
                >
                  IBIME Bicultural Hub
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#0B1E36] text-blue-200 border border-blue-700/60 whitespace-nowrap">
                  CCT 15PPR3322G
                </span>
              </div>
              <span className="text-[11px] text-blue-100 font-medium hidden 2xl:block truncate">
                Red Bilingüe & Bachillerato CCH UNAM (4 Sedes: Montes, Lagos, San Cristóbal, Coacalco)
              </span>
            </div>
          </div>

          {/* Perfil del Usuario Activo & Salida */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 flex-nowrap">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>{userName}</span>
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
              </span>
              <span className="text-[10px] text-blue-200 truncate max-w-[240px]">
                {userCampus}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-[#17426D] border border-blue-700 flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0">
              {userName[0] || 'I'}
            </div>

            {/* Acceso directo a Experiencias Alumno y Familia */}
            <button
              onClick={async () => {
                await switchCanonicalStudent('std-ibime-montes-01');
                router.push('/student');
              }}
              className="h-9 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-amber-300 shrink-0 leading-none"
              title="Vivenciar la experiencia inmersiva del alumno (Iker Santiago Morales - Ignis)"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-900 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Experiencia Alumno 360°</span>
              <span className="sm:hidden">Alumno</span>
            </button>

            <button
              onClick={handleGoToParentExperience}
              className="h-9 px-3 rounded-xl bg-[#17426D] hover:bg-[#C01D0C] text-white font-bold text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-blue-700 shrink-0 leading-none"
              title="Vivenciar la experiencia de padres de familia (Familia Morales Peña)"
            >
              <Heart className="w-3.5 h-3.5 text-rose-300 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Experiencia Familia</span>
              <span className="sm:hidden">Familia</span>
            </button>

            {/* Acceso directo a Visión CEO para Directores y Dueños */}
            {(isDirector || activeUser.role === 'owner') && (
              <button
                onClick={() => setViewMode('ceo')}
                className="h-9 px-3 rounded-xl bg-[#0B1E36] hover:bg-[#17426D] text-blue-100 font-extrabold text-xs transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-xs border border-blue-800 shrink-0 leading-none"
                title="Abrir Visión Ejecutiva CEO"
              >
                <Layers className="w-3.5 h-3.5 text-blue-300 shrink-0" />
                <span className="hidden sm:inline whitespace-nowrap">Visión CEO</span>
              </button>
            )}

            <button
              onClick={handleLogout}
              className="h-9 px-3 rounded-xl bg-emerald-900/90 hover:bg-rose-700 text-white font-semibold text-xs transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer border border-blue-800 hover:border-rose-600 shadow-xs shrink-0 leading-none"
              title="Cerrar sesión institucional y volver al portal"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline whitespace-nowrap">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. BANNER DE BIENVENIDA Y RESUMEN EJECUTIVO (4 SEDES OFICIALES IBIME)
          ========================================================================= */}
      <section className="bg-gradient-to-r from-[#0F2744] via-[#17426D] to-[#800F0A] text-white py-6 border-b border-blue-950 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-400 text-amber-950 shadow-xs">
                  Ciclo Escolar 2025-2026
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  Incorporación CCH UNAM & Certificación Cambridge English
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {isDirector && `Panel de Dirección General & Gobernanza IBIME`}
                {isTeacher && `Centro de Gestión Docente y Coordinación Bicultural IBIME`}
                {isCoordinator && `Coordinación Académica & Control Escolar CCH`}
                {isBilling && `Tesorería, Facturación CFDI 4.0 & Cobranza`}
                {!isDirector && !isTeacher && !isCoordinator && !isBilling && `Portal Institucional de la Comunidad IBIME`}
              </h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-3xl">
                {isDirector && `Supervisión directiva inter-planteles de los 4 campus oficiales. Control centralizado de matrícula bilingüe, cuerpo docente STEAM, vinculación CCH UNAM y finanzas.`}
                {isTeacher && `Herramientas pedagógicas bilingües, planeaciones NEM 2024, evaluación formativa y acompañamiento a tus grupos.`}
                {isCoordinator && `Gestión de planes de estudio, horarios docentes y enlace curricular con la Dirección General de CCH UNAM.`}
                {isBilling && `Módulo de tesorería, estados de cuenta familiares, timbrado CFDI 4.0 y nómina institucional.`}
              </p>
            </div>

            {/* Selector de Campus Interactivo */}
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shrink-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-200 mb-1">
                Filtro de Sede Activa
              </label>
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="bg-[#0A1A2E]/80 text-white font-bold text-xs rounded-xl px-3 py-1.5 border border-red-400/50 outline-none focus:border-amber-400 cursor-pointer"
              >
                <option value="all">🌟 Todas las Sedes (Red Completa)</option>
                {ibimeCampuses.map((camp) => (
                  <option key={camp.id} value={camp.id}>
                    🏫 {camp.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tarjetas Métricas Directivas (4 KPIs Clave) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-blue-200 text-xs font-semibold">
                <span>Planteles Oficiales</span>
                <Building2 className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">4 Sedes</p>
              <p className="text-[10px] text-blue-200/80">Montes, Lagos, San Cristóbal, Coacalco</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-blue-200 text-xs font-semibold">
                <span>Alumnos Matriculados</span>
                <Users className="w-4 h-4 text-blue-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">{ibimeStudents.length} Alumnos 360</p>
              <p className="text-[10px] text-blue-200/80">Seguimiento bilingüe y becas SEP</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-blue-200 text-xs font-semibold">
                <span>Cuerpo Docente</span>
                <GraduationCap className="w-4 h-4 text-cyan-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">{ibimeTeachers.length + 2} Profesores</p>
              <p className="text-[10px] text-blue-200/80">Docentes Bilingües STEAM y CCH</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-blue-200 text-xs font-semibold">
                <span>Acreditación Curricular</span>
                <Award className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">100% Vigente</p>
              <p className="text-[10px] text-blue-200/80">CCH UNAM & Cambridge B2</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CONTENIDO PRINCIPAL: NAVEGACIÓN Y VISTAS SOBERANAS
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* Banner de Conmutación a Visión Ejecutiva CEO */}
        {(isDirector || activeUser.role === 'owner') && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md border border-indigo-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 flex items-center justify-center font-bold text-xs">
                CEO
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Tablero Operativo Clásico Activo</h4>
                <p className="text-[11px] text-indigo-200">Supervisando sedes, alumnos, docentes y nóminas. Puedes conmutar en cualquier momento a la Visión Ejecutiva CEO para Directores y Dueños.</p>
              </div>
            </div>
            <button
              onClick={() => setViewMode('ceo')}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              <span>Activar Visión Ejecutiva CEO</span>
            </button>
          </div>
        )}

        {/* Pestañas de Navegación del Sistema IBIME (Estilo Apple/iOS) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-2xl overflow-x-auto border border-slate-300/80 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setActiveTab('sedes')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'sedes'
                ? 'bg-white dark:bg-[#0A1A2E] text-[#E41B14] dark:text-blue-300 shadow-sm border border-red-200/60 dark:border-blue-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Sedes & Gobernanza (4 Planteles)</span>
          </button>

          <button
            onClick={() => setActiveTab('alumnos')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'alumnos'
                ? 'bg-white dark:bg-[#0A1A2E] text-[#E41B14] dark:text-blue-300 shadow-sm border border-red-200/60 dark:border-blue-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Control Escolar & Alumnos 360</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-red-100 dark:bg-emerald-900 text-emerald-800 dark:text-blue-200">
              {ibimeStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('docentes')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'docentes'
                ? 'bg-white dark:bg-[#0A1A2E] text-[#E41B14] dark:text-blue-300 shadow-sm border border-red-200/60 dark:border-blue-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Cuerpo Docente & CCH</span>
          </button>

          <button
            onClick={() => setActiveTab('boveda')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'boveda'
                ? 'bg-white dark:bg-[#0A1A2E] text-[#E41B14] dark:text-blue-300 shadow-sm border border-red-200/60 dark:border-blue-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Bóveda Curricular Bilingüe</span>
          </button>

          <button
            onClick={() => setActiveTab('finanzas')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'finanzas'
                ? 'bg-white dark:bg-[#0A1A2E] text-[#E41B14] dark:text-blue-300 shadow-sm border border-red-200/60 dark:border-blue-900'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Tesorería & Facturación CFDI 4.0</span>
          </button>
        </div>

        {/* ---------------------------------------------------------------------
            PESTAÑA 1: SEDES & GOBERNANZA (LOS 4 PLANTELES DE IBIME)
            --------------------------------------------------------------------- */}
        {activeTab === 'sedes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#E41B14]" />
                  <span>Red de Planteles Oficiales del Instituto Bilingüe IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supervisión y gobierno de las 4 sedes operativas en el Estado de México.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 dark:bg-[#0A1A2E]/60 text-[#C01D0C] dark:text-blue-300 border border-red-200 dark:border-blue-900">
                4 Campus Homologados
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {ibimeCampuses.map((campus) => {
                const isMontes = campus.id === 'cmp-ibime-montes';
                const isLagos = campus.id === 'cmp-ibime-lagos';
                const isSanCristobal = campus.id === 'cmp-ibime-sancristobal';
                const isCoacalco = campus.id === 'cmp-ibime-coacalco';

                const campusStudents = ibimeStudents.filter(s => s.campus_id === campus.id);

                return (
                  <div 
                    key={campus.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-bl-full pointer-events-none" />

                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-[#0A1A2E]/50 text-[#E41B14] dark:text-red-400 flex items-center justify-center font-bold text-lg border border-red-200/60 dark:border-blue-900 shrink-0">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                              {campus.name}
                            </h3>
                            {isMontes && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                Sede Matriz & CCH
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-[#E41B14] shrink-0" />
                            <span className="truncate">{campus.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Niveles Educativos Ofertados */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Niveles y Grados Ofertados:
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {campus.grades.slice(0, 8).map((grade, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-medium">
                              {grade}
                            </span>
                          ))}
                          {campus.grades.length > 8 && (
                            <span className="px-2 py-0.5 bg-red-50 dark:bg-[#0A1A2E] text-[#C01D0C] dark:text-blue-300 rounded-md text-[10px] font-bold">
                              +{campus.grades.length - 8} grados más
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#E41B14]" />
                          <span>{campus.phone}</span>
                        </span>
                        <span className="font-semibold text-[#C01D0C] dark:text-red-400">
                          {campusStudents.length > 0 ? `${campusStudents.length} alumnos` : 'Matrícula activa'}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 font-bold text-[#E41B14] dark:text-red-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Operativo</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            PESTAÑA 2: CONTROL ESCOLAR & ALUMNOS 360
            --------------------------------------------------------------------- */}
        {activeTab === 'alumnos' && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#E41B14]" />
                  <span>Matrícula y Control Escolar IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Estudiantes registrados en los 4 planteles con seguimiento formativo 360 y becas oficiales.
                </p>
              </div>

              {/* Filtros de Nivel */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedLevelFilter}
                  onChange={(e) => setSelectedLevelFilter(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-red-400"
                >
                  <option value="all">Todos los Niveles</option>
                  <option value="primaria">Primaria Bilingüe</option>
                  <option value="secundaria">Secundaria</option>
                  <option value="preparatoria">Bachillerato CCH UNAM</option>
                </select>
              </div>
            </div>

            {/* Buscador */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Buscar por nombre de alumno, CURP o correo electrónico..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-red-400 shadow-xs"
              />
            </div>

            {/* Tabla de Alumnos IBIME */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/70 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <th className="py-3 px-4">Alumno</th>
                      <th className="py-3 px-4">Sede / Campus</th>
                      <th className="py-3 px-4">Grado / Nivel</th>
                      <th className="py-3 px-4">Beca / Estatus</th>
                      <th className="py-3 px-4">Acompañamiento 360</th>
                      <th className="py-3 px-4 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredStudents.map((std) => {
                      const fullName = `${std.first_name} ${std.last_name_1} ${std.last_name_2 || ''}`.trim();
                      const hasScholarship = std.scholarship_percentage && std.scholarship_percentage > 0;

                      return (
                        <tr key={std.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-[#0A1A2E] text-[#E41B14] dark:text-red-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {std.first_name[0]}
                              </div>
                              <div>
                                <p className="font-bold text-xs text-slate-900 dark:text-white">{fullName}</p>
                                <p className="text-[10px] text-slate-400 font-normal">{std.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px]">
                              <MapPin className="w-2.5 h-2.5 text-[#E41B14]" />
                              <span>{std.campus_name || 'Campus Montes'}</span>
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                            {std.grade || 'Grado Asignado'} • {std.level?.toUpperCase()}
                          </td>
                          <td className="py-3.5 px-4">
                            {hasScholarship ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                Beca {std.scholarship_percentage}% ({std.scholarship_type || 'Excelencia'})
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-[#C01D0C] border border-red-200">
                                Regular Al Día
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#C01D0C] dark:text-red-400">
                                {(std as any).overall_average ? `${(std as any).overall_average} Prom` : '9.6 Prom'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {(std as any).attendance_rate ? `${(std as any).attendance_rate}% Asist.` : '98% Asist.'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={async () => {
                                  await switchCanonicalStudent(std.id);
                                  router.push('/student');
                                }}
                                className="py-1 px-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 rounded-lg font-black text-[11px] transition-colors cursor-pointer border border-amber-300 inline-flex items-center gap-1 shadow-xs"
                                title={`Vivenciar experiencia del alumno ${std.first_name}`}
                              >
                                <Sparkles className="w-3 h-3 text-amber-900" />
                                <span>Vivenciar</span>
                              </button>
                              <button
                                onClick={() => setSelectedStudentDetail(std)}
                                className="py-1 px-2.5 bg-red-50 hover:bg-red-100 dark:bg-[#0A1A2E]/60 dark:hover:bg-emerald-900/60 text-[#E41B14] dark:text-blue-300 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border border-red-200/60 dark:border-blue-900 inline-flex items-center gap-1"
                              >
                                <span>Expediente</span>
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            PESTAÑA 3: CUERPO DOCENTE & VINCULACIÓN CCH UNAM
            --------------------------------------------------------------------- */}
        {activeTab === 'docentes' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-[#E41B14]" />
                  <span>Cuerpo Académico Bilingüe & Docentes Titulares IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Plantilla de profesores acreditados en programas NEM 2024, Cambridge English y CCH UNAM.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Docente 1: Prof. Gabriela Morales */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#E41B14] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      GM
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Prof. Gabriela Morales</h3>
                      <p className="text-xs text-[#C01D0C] dark:text-red-400 font-semibold">Docente Titular STEAM & Cambridge English</p>
                      <span className="text-[10px] text-slate-400">Campus Montes & Campus Lagos</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Certificación:</span>
                      <span className="font-bold text-[#C01D0C] dark:text-red-400">Cambridge C1 Advanced</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Materias a cargo:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Ciencias STEAM & Inglés</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Planeaciones NEM:</span>
                      <span className="font-bold text-[#E41B14]">8 Planes Validados</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">profesora.bicultural@ibime.edu.mx</span>
                  <span className="text-[#E41B14] font-bold">Activo</span>
                </div>
              </div>

              {/* Docente 2: Prof. Carlos Mendoza */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      CM
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Prof. Carlos Mendoza</h3>
                      <p className="text-xs text-teal-700 dark:text-teal-400 font-semibold">Docente de Robótica & Ciencias Naturales</p>
                      <span className="text-[10px] text-slate-400">Campus San Cristóbal & Campus Coacalco</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Especialidad:</span>
                      <span className="font-bold text-teal-700 dark:text-teal-400">Robótica y Pensamiento Lógico</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Materias a cargo:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Robótica STEAM Inter-Campus</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Laboratorios:</span>
                      <span className="font-bold text-teal-600">4 Estaciones Activas</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">carlos.mendoza@ibime.edu.mx</span>
                  <span className="text-teal-600 font-bold">Activo</span>
                </div>
              </div>

              {/* Coordinador: Lic. Marco Antonio Ruiz Peralta */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      MR
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Lic. Marco Antonio Ruiz Peralta</h3>
                      <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold">Coordinador Académico & Enlace CCH UNAM</p>
                      <span className="text-[10px] text-slate-400">Sede Matriz Montes (Coordinación Central)</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Gestión Académica:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">Enlace DGCCH UNAM</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Grupos Coordinados:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">12 Grupos Bilingües</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Auditoría Curricular:</span>
                      <span className="font-bold text-amber-600">Comité Académico 2026</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">coordinacion.academica@ibime.edu.mx</span>
                  <span className="text-amber-600 font-bold">Activo</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            PESTAÑA 4: BÓVEDA CURRICULAR BILINGÜE (NEM, CAMBRIDGE & CCH UNAM)
            --------------------------------------------------------------------- */}
        {activeTab === 'boveda' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#E41B14]" />
                  <span>Bóveda Curricular Bilingüe Oficial de IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Asignaturas acreditadas, códigos oficiales SEP / UNAM y planeaciones didácticas con rúbricas analíticas.
                </p>
              </div>
              <span className="px-3 py-1 bg-red-50 dark:bg-[#0A1A2E] text-emerald-800 dark:text-blue-200 text-xs font-bold rounded-full border border-red-300 dark:border-blue-900">
                Overlay Bicultural Vigente
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ibimeSubjects.map((sub) => (
                <div 
                  key={sub.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sub.level_grade_id.toUpperCase()}
                      </span>
                      <span className="font-mono text-[10px] font-bold text-[#C01D0C] dark:text-red-400 bg-red-50 dark:bg-[#0A1A2E] px-2 py-0.5 rounded-md border border-red-200 dark:border-blue-900">
                        {sub.sep_code}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-[#E41B14] font-semibold">Planeaciones Validadas</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">NEM / CCH</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------------
            PESTAÑA 5: TESORERÍA, FACTURACIÓN CFDI 4.0 & COBRANZA
            --------------------------------------------------------------------- */}
        {activeTab === 'finanzas' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-[#E41B14]" />
                  <span>Tesorería, Facturación CFDI 4.0 & Cobranza IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Responsable: C.P. Mariana Rivas Corona (Jefatura de Finanzas y Cobranza).
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
                Dispersión Quincenal al Día
              </span>
            </div>

            {/* Tarjetas de Resumen Financiero */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recuperación de Colegiaturas</p>
                <p className="text-2xl font-black text-[#C01D0C] dark:text-red-400 mt-1">94.8%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Cobranza oportuna inter-planteles</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facturación CFDI 4.0</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">100% Timbrado</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Complementos educativos IEDU vigentes</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nómina Educativa Quincenal</p>
                <p className="text-2xl font-black text-[#E41B14] dark:text-blue-300 mt-1">$148,500 MXN</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Personal docente y directivo de las 4 sedes</p>
              </div>
            </div>

            {/* Listado de Nómina IBIME */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Registros de Nómina y Compensación del Personal IBIME
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold uppercase text-[10px]">
                      <th className="py-2.5 px-4">Colaborador / Puesto</th>
                      <th className="py-2.5 px-4">Sede / Campus</th>
                      <th className="py-2.5 px-4">Salario Base</th>
                      <th className="py-2.5 px-4">Neto Quincenal</th>
                      <th className="py-2.5 px-4">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {ibimePayroll.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                          <p>{rec.employee_name}</p>
                          <p className="text-[10px] text-slate-400 font-normal">{rec.position_title}</p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{rec.campus_name}</td>
                        <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          ${rec.base_salary?.toLocaleString('es-MX')} MXN
                        </td>
                        <td className="py-3 px-4 font-bold text-[#C01D0C] dark:text-red-400">
                          ${rec.net_salary?.toLocaleString('es-MX')} MXN
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-emerald-800">
                            {rec.status === 'pagado' ? 'Dispersado' : 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Modal de Detalle de Alumno */}
      {selectedStudentDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E41B14] text-white flex items-center justify-center font-bold text-base">
                  {selectedStudentDetail.first_name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {selectedStudentDetail.first_name} {selectedStudentDetail.last_name_1}
                  </h3>
                  <p className="text-xs text-[#C01D0C] dark:text-red-400 font-semibold">
                    {selectedStudentDetail.campus_name || 'Campus Montes'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Nivel & Grado</p>
                  <p className="font-bold text-slate-900 dark:text-white mt-0.5">{selectedStudentDetail.grade}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Beca Asignada</p>
                  <p className="font-bold text-[#E41B14] mt-0.5">
                    {selectedStudentDetail.scholarship_percentage ? `${selectedStudentDetail.scholarship_percentage}% (${selectedStudentDetail.scholarship_type})` : 'Ninguna'}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Correo Institucional</p>
                <p className="font-mono text-slate-800 dark:text-slate-200 mt-0.5">{selectedStudentDetail.email}</p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Seguimiento Formativo Bilingüe</p>
                <p className="text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  Alumno con desempeño destacado en proyectos científicos bilingües y participación activa en actividades de robótica STEAM.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await switchCanonicalStudent(selectedStudentDetail.id);
                    router.push('/student');
                  }}
                  className="py-2 px-3.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                  <span>Vivenciar Alumno 360°</span>
                </button>

                <button
                  onClick={async () => {
                    await switchCanonicalStudent(selectedStudentDetail.id);
                    router.push('/parent');
                  }}
                  className="py-2 px-3.5 bg-[#C01D0C] hover:bg-[#E41B14] text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-1.5 border border-blue-700"
                >
                  <Heart className="w-3.5 h-3.5 text-rose-300" />
                  <span>Vivenciar Familia</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="py-2 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function IbimePortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 animate-spin text-red-400" />
          <span>Cargando portal institucional IBIME...</span>
        </div>
      </div>
    }>
      <IbimePortalContent />
    </Suspense>
  );
}
