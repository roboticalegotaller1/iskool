"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
  Globe
} from 'lucide-react';
import { DetailedStudent, Subject, Campus, UserProfile } from '@/types';

type IbimeTab = 'sedes' | 'alumnos' | 'docentes' | 'boveda' | 'finanzas';

export default function IbimePortalPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();

  // Forzar síncronamente los atributos del DOM para el tenant IBIME
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-tenant', 'ibime');
      document.cookie = 'tenant-id=ibime; path=/; max-age=31536000; SameSite=Lax';
      localStorage.setItem('tenant-id', 'ibime');
    }
  }, []);

  // Control de Acceso: Si no hay usuario autenticado, redirigir al portal IBIME de acceso
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace('/02DJoUJSkwYQZjn');
      }
    }
  }, [user, authLoading, router]);

  // Filtros de navegación directiva
  const [activeTab, setActiveTab] = useState<IbimeTab>('sedes');
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<DetailedStudent | null>(null);

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

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#071E3D] flex flex-col items-center justify-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center animate-pulse mb-4">
          <Building2 className="w-8 h-8 text-emerald-400" />
        </div>
        <p className="font-bold text-lg text-emerald-200">Accediendo al Sistema Oficial IBIME...</p>
        <p className="text-xs text-slate-400 mt-1">Cargando credenciales y gobernanza institucional</p>
      </div>
    );
  }

  // Nombre y cargo institucional del usuario activo
  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Directivo IBIME';
  const userCampus = user.campus_name || 'Dirección General (Campus Montes Sede Matriz & CCH)';
  const isDirector = user.role === 'director' || user.role === 'admin' || user.role === 'superadmin' || user.role === 'owner';
  const isTeacher = user.role === 'teacher';
  const isCoordinator = user.role === 'coordinator';
  const isBilling = user.role === 'billing';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 flex flex-col">
      
      {/* =========================================================================
          1. HEADER INSTITUCIONAL SOBERANO DE IBIME (100% MARCA BLANCA IBIME)
          ========================================================================= */}
      <header className="sticky top-0 z-50 w-full bg-[#047857] text-white shadow-md border-b border-emerald-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Identidad Institucional Oficial */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#047857] flex items-center justify-center font-black text-xl shadow-md border border-emerald-300 shrink-0">
              IB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-white block">
                  Instituto Bilingüe IBIME
                </span>
                <span 
                  data-testid="institutional-badge" 
                  style={{ color: '#047857' }}
                  className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-[#047857] border border-emerald-300 shadow-xs"
                >
                  IBIME Bicultural Hub
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-900/80 text-emerald-200 border border-emerald-600/60">
                  CCT 09PPR1492Z
                </span>
              </div>
              <span className="text-[11px] text-emerald-100 font-medium hidden md:block">
                Red Bilingüe & Bachillerato CCH UNAM (4 Sedes: Montes, Lagos, San Cristóbal, Coacalco)
              </span>
            </div>
          </div>

          {/* Perfil del Usuario Activo & Salida */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-white flex items-center justify-end gap-1.5">
                <span>{userName}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
              </span>
              <span className="text-[10px] text-emerald-200 truncate max-w-[280px]">
                {userCampus}
              </span>
            </div>

            <div className="w-9 h-9 rounded-xl bg-emerald-800 border border-emerald-600 flex items-center justify-center font-bold text-sm text-white shadow-xs">
              {userName[0] || 'I'}
            </div>

            <button
              onClick={handleLogout}
              className="py-1.5 px-3 rounded-xl bg-emerald-900/90 hover:bg-rose-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border border-emerald-700 hover:border-rose-600 shadow-xs"
              title="Cerrar sesión institucional y volver al portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          2. BANNER DE BIENVENIDA Y RESUMEN EJECUTIVO (4 SEDES OFICIALES IBIME)
          ========================================================================= */}
      <section className="bg-gradient-to-r from-[#047857] via-[#065F46] to-[#0B2545] text-white py-6 border-b border-emerald-900 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-amber-400 text-amber-950 shadow-xs">
                  Ciclo Escolar 2025-2026
                </span>
                <span className="text-xs text-emerald-200 font-medium">
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
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-3xl">
                {isDirector && `Supervisión directiva inter-planteles de los 4 campus oficiales. Control centralizado de matrícula bilingüe, cuerpo docente STEAM, vinculación CCH UNAM y finanzas.`}
                {isTeacher && `Herramientas pedagógicas bilingües, planeaciones NEM 2024, evaluación formativa y acompañamiento a tus grupos.`}
                {isCoordinator && `Gestión de planes de estudio, horarios docentes y enlace curricular con la Dirección General de CCH UNAM.`}
                {isBilling && `Módulo de tesorería, estados de cuenta familiares, timbrado CFDI 4.0 y nómina institucional.`}
              </p>
            </div>

            {/* Selector de Campus Interactivo */}
            <div className="bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shrink-0">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-200 mb-1">
                Filtro de Sede Activa
              </label>
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="bg-emerald-950/80 text-white font-bold text-xs rounded-xl px-3 py-1.5 border border-emerald-500/50 outline-none focus:border-amber-400 cursor-pointer"
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
              <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
                <span>Planteles Oficiales</span>
                <Building2 className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">4 Sedes</p>
              <p className="text-[10px] text-emerald-200/80">Montes, Lagos, San Cristóbal, Coacalco</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
                <span>Alumnos Matriculados</span>
                <Users className="w-4 h-4 text-emerald-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">{ibimeStudents.length} Alumnos 360</p>
              <p className="text-[10px] text-emerald-200/80">Seguimiento bilingüe y becas SEP</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
                <span>Cuerpo Docente</span>
                <GraduationCap className="w-4 h-4 text-cyan-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">{ibimeTeachers.length + 2} Profesores</p>
              <p className="text-[10px] text-emerald-200/80">Docentes Bilingües STEAM y CCH</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3.5 border border-white/15">
              <div className="flex items-center justify-between text-emerald-200 text-xs font-semibold">
                <span>Acreditación Curricular</span>
                <Award className="w-4 h-4 text-amber-300" />
              </div>
              <p className="text-2xl font-black text-white mt-1">100% Vigente</p>
              <p className="text-[10px] text-emerald-200/80">CCH UNAM & Cambridge B2</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CONTENIDO PRINCIPAL: NAVEGACIÓN Y VISTAS SOBERANAS
          ========================================================================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">

        {/* Pestañas de Navegación del Sistema IBIME (Estilo Apple/iOS) */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-200/80 dark:bg-slate-900 rounded-2xl overflow-x-auto border border-slate-300/80 dark:border-slate-800 shadow-xs">
          <button
            onClick={() => setActiveTab('sedes')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'sedes'
                ? 'bg-white dark:bg-emerald-950 text-[#047857] dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800'
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
                ? 'bg-white dark:bg-emerald-950 text-[#047857] dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Control Escolar & Alumnos 360</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              {ibimeStudents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('docentes')}
            className={`py-2 px-4 rounded-xl font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
              activeTab === 'docentes'
                ? 'bg-white dark:bg-emerald-950 text-[#047857] dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800'
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
                ? 'bg-white dark:bg-emerald-950 text-[#047857] dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800'
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
                ? 'bg-white dark:bg-emerald-950 text-[#047857] dark:text-emerald-300 shadow-sm border border-emerald-200/60 dark:border-emerald-800'
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
                  <Building2 className="w-5 h-5 text-emerald-600" />
                  <span>Red de Planteles Oficiales del Instituto Bilingüe IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supervisión y gobierno de las 4 sedes operativas en el Estado de México.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
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
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />

                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-[#047857] dark:text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-200/60 dark:border-emerald-800 shrink-0">
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
                            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
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
                            <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded-md text-[10px] font-bold">
                              +{campus.grades.length - 8} grados más
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>{campus.phone}</span>
                        </span>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                          {campusStudents.length > 0 ? `${campusStudents.length} alumnos` : 'Matrícula activa'}
                        </span>
                      </div>

                      <span className="flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
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
                  <Users className="w-5 h-5 text-emerald-600" />
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
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-emerald-500"
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
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-emerald-500 shadow-xs"
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
                              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-[#047857] dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
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
                              <MapPin className="w-2.5 h-2.5 text-emerald-600" />
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
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Regular Al Día
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                {(std as any).overall_average ? `${(std as any).overall_average} Prom` : '9.6 Prom'}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {(std as any).attendance_rate ? `${(std as any).attendance_rate}% Asist.` : '98% Asist.'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => setSelectedStudentDetail(std)}
                              className="py-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-[#047857] dark:text-emerald-300 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border border-emerald-200/60 dark:border-emerald-800 inline-flex items-center gap-1"
                            >
                              <span>Expediente</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
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
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
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
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                      GM
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Prof. Gabriela Morales</h3>
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Docente Titular STEAM & Cambridge English</p>
                      <span className="text-[10px] text-slate-400">Campus Montes & Campus Lagos</span>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Certificación:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">Cambridge C1 Advanced</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Materias a cargo:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">Ciencias STEAM & Inglés</span>
                    </p>
                    <p className="flex items-center justify-between">
                      <span className="font-medium">Planeaciones NEM:</span>
                      <span className="font-bold text-emerald-600">8 Planes Validados</span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">profesora.bicultural@ibime.edu.mx</span>
                  <span className="text-emerald-600 font-bold">Activo</span>
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
                  <BookOpen className="w-5 h-5 text-emerald-600" />
                  <span>Bóveda Curricular Bilingüe Oficial de IBIME</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Asignaturas acreditadas, códigos oficiales SEP / UNAM y planeaciones didácticas con rúbricas analíticas.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 text-xs font-bold rounded-full border border-emerald-300 dark:border-emerald-800">
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
                      <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        {sub.sep_code}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug">
                      {sub.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="text-[11px] text-emerald-600 font-semibold">Planeaciones Validadas</span>
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
                  <DollarSign className="w-5 h-5 text-emerald-600" />
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
                <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">94.8%</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Cobranza oportuna inter-planteles</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Facturación CFDI 4.0</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">100% Timbrado</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Complementos educativos IEDU vigentes</p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nómina Educativa Quincenal</p>
                <p className="text-2xl font-black text-[#047857] dark:text-emerald-300 mt-1">$148,500 MXN</p>
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
                        <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                          ${rec.net_salary?.toLocaleString('es-MX')} MXN
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
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
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base">
                  {selectedStudentDetail.first_name[0]}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {selectedStudentDetail.first_name} {selectedStudentDetail.last_name_1}
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
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
                  <p className="font-bold text-emerald-600 mt-0.5">
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

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-right">
              <button
                onClick={() => setSelectedStudentDetail(null)}
                className="py-2 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
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
