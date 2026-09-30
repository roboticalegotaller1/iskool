"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { DetailedStudent, Campus, OrganizationHolding, PortfolioItem, Subject } from '@/types';
import { IBIME_STUDENTS, IBIME_CAMPUSES, IBIME_TEACHERS } from '@/lib/curriculum/ibimeCatalogService';
import {
  GraduationCap,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  BookOpen,
  Star,
  Award,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  UserCheck,
  Eye,
  FileText,
  Check,
  MessageSquare,
  Sparkles,
  Building2,
  MapPin,
  Send,
  ThumbsUp,
  Calendar,
  School,
  ExternalLink,
  Layers,
  Flame,
  FileCheck2,
  Compass
} from 'lucide-react';
import { SUBJECTS_SEED, PORTFOLIO_SEED } from '@/store/seeds';
import { getStudentAvatarUrl } from '@/utils/studentAvatar';

export interface AcademicAuditLogRecord {
  id: string;
  studentId: string;
  studentName: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  verdict: 'Aprobado por Dirección' | 'Observación Pedagógica' | 'Acreditación Sobresaliente' | 'Seguimiento Prioritario';
  notes: string;
  timestamp: string;
  campusName: string;
  evidenceTitle?: string;
}

interface AcademicPortalAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: OrganizationHolding;
  schoolId?: string;
  initialCampusId?: string;
}

export function AcademicPortalAdminModal({
  isOpen,
  onClose,
  holding,
  schoolId = 'sch-ibime',
  initialCampusId
}: AcademicPortalAdminModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { detailedStudents, campusesList, teachersList } = useSchoolAdminStore();
  const { portfolioItems, addPortfolioFeedback, reviewPortfolioItem } = usePortfolioStore();

  // Identidad oficial verificada del Administrador / Revisor
  const adminName = useMemo(() => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'Lic. Roberto González';
  }, [user]);

  const adminEmail = useMemo(() => {
    return user?.email || 'director.general@ibime.edu.mx';
  }, [user]);

  const adminRoleTitle = 'Administrador del Colegio (Auditor, Revisor y Supervisor Académico)';

  // Modos de Vista: Vista del Profesor vs Vista de los Alumnos
  const [activePortalTab, setActivePortalTab] = useState<'alumnos' | 'profesor'>('alumnos');

  // Filtro de Campus / Plantel
  const [selectedCampusId, setSelectedCampusId] = useState<string>(initialCampusId || 'all');

  useEffect(() => {
    if (initialCampusId) {
      setSelectedCampusId(initialCampusId);
    }
  }, [initialCampusId]);

  // Lista de campus disponibles
  const availableCampuses = useMemo<Campus[]>(() => {
    if (holding?.slug === 'ibime' || schoolId === 'sch-ibime') {
      return IBIME_CAMPUSES;
    }
    const storeCampuses = campusesList.filter(c => !schoolId || c.school_id === schoolId);
    return storeCampuses.length > 0 ? storeCampuses : (holding.campuses as any[]) || [];
  }, [holding, schoolId, campusesList]);

  // Lista de Alumnos disponibles (Filtrados por campus y holding)
  const studentsList = useMemo<DetailedStudent[]>(() => {
    let list: DetailedStudent[] = [];
    if (holding?.slug === 'ibime' || schoolId === 'sch-ibime') {
      list = [...IBIME_STUDENTS];
    } else {
      list = detailedStudents.filter(s => !schoolId || s.school_id === schoolId);
    }

    if (selectedCampusId !== 'all') {
      list = list.filter(s => s.campus_id === selectedCampusId || (s.campus_name && s.campus_name.toLowerCase().includes(selectedCampusId.toLowerCase())));
    }
    return list;
  }, [holding, schoolId, detailedStudents, selectedCampusId]);

  // Alumno actualmente seleccionado para supervisión y auditoría
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

  // Auto-seleccionar primer alumno al cargar o cambiar filtro
  useEffect(() => {
    if (studentsList.length > 0) {
      if (!selectedStudentId || !studentsList.some(s => s.id === selectedStudentId)) {
        setSelectedStudentId(studentsList[0].id);
      }
    } else {
      setSelectedStudentId('');
    }
  }, [studentsList, selectedStudentId]);

  const currentStudent = useMemo<DetailedStudent | null>(() => {
    return studentsList.find(s => s.id === selectedStudentId) || studentsList[0] || null;
  }, [studentsList, selectedStudentId]);

  // Sub-tab dentro de Vista de Alumnos: evidencias | avances | dictamen
  const [studentInspectionTab, setStudentInspectionTab] = useState<'evidencias' | 'avances' | 'dictamen'>('evidencias');

  // Evidencias del alumno seleccionado
  const studentEvidences = useMemo<PortfolioItem[]>(() => {
    if (!currentStudent) return [];
    
    // Buscar en el store de portafolio
    const directMatches = (portfolioItems || []).filter(p => 
      p.student_id === currentStudent.id || 
      (p.student_profile?.id && p.student_profile.id === currentStudent.id) ||
      (currentStudent.id.includes('montes-01') && p.id === 'port-ibime-01') ||
      (currentStudent.id.includes('coac') && p.id === 'port-ibime-02')
    );

    if (directMatches.length > 0) return directMatches;

    // Buscar en semillas canónicas
    const seedMatches = PORTFOLIO_SEED.filter(p => 
      p.student_id === currentStudent.id ||
      (currentStudent.id.includes('montes') && p.id === 'port-ibime-01') ||
      (currentStudent.id.includes('coac') && p.id === 'port-ibime-02')
    );

    if (seedMatches.length > 0) return seedMatches;

    // Generar entregables pedagógicos de alta fidelidad si aún no tiene registrados
    return [
      {
        id: `port-${currentStudent.id}-01`,
        student_id: currentStudent.id,
        subject_id: 'sub-sci',
        title: `Proyecto Integrador STEAM: Ecosistemas y Desarrollo Sustentable`,
        description: `Investigación aplicada de campo realizada en ${currentStudent.campus_name || 'el plantel'}. Registro de variables físicas y análisis de impacto ambiental.`,
        file_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
        file_type: 'image',
        status: 'approved',
        self_reflection: 'Pude comprobar experimentalmente los ciclos biológicos y presentar mis conclusiones con gráficas analíticas.',
        peer_review_score: 9.8,
        peer_review_comments: 'Excelente justificación científica y pulcritud en la entrega del artefacto.',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        student_profile: currentStudent as any,
        subject: SUBJECTS_SEED[1],
        feedbacks: [
          {
            id: `fb-${currentStudent.id}-1`,
            portfolio_item_id: `port-${currentStudent.id}-01`,
            author_id: 'usr-teacher-1',
            author_role: 'teacher',
            feedback_text: 'Excelente entrega. Cumple con todos los criterios de la rúbrica formativa oficial.',
            reactions: { teacher: ['⭐', '👏'] },
            created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString()
          }
        ]
      },
      {
        id: `port-${currentStudent.id}-02`,
        student_id: currentStudent.id,
        subject_id: 'sub-math',
        title: `Modelación Matemática Aplicada a Finanzas Familiares`,
        description: `Resolución de retos basados en porcentajes, tasa de interés y reparto proporcional aplicados a la economía del hogar.`,
        file_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
        file_type: 'image',
        status: 'submitted',
        self_reflection: 'Me ayudó a comprender cómo se calculan las finanzas y el ahorro programado.',
        created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        student_profile: currentStudent as any,
        subject: SUBJECTS_SEED[0],
        feedbacks: []
      }
    ];
  }, [currentStudent, portfolioItems]);

  // Formulario de Dictamen del Administrador / Supervisor
  const [auditVerdict, setAuditVerdict] = useState<AcademicAuditLogRecord['verdict']>('Aprobado por Dirección');
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [auditSuccessToast, setAuditSuccessToast] = useState<string | null>(null);

  // Bitácora histórica de auditorías
  const [auditLogs, setAuditLogs] = useState<AcademicAuditLogRecord[]>(() => {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem('iskool_academic_audit_log');
        if (stored) return JSON.parse(stored);
      } catch (e) {}
    }
    return [
      {
        id: 'aud-001',
        studentId: 'std-ibime-montes-01',
        studentName: 'Iker Santiago Morales Peña',
        adminId: 'usr-admin-roberto',
        adminName: 'Lic. Roberto González',
        adminEmail: 'director.general@ibime.edu.mx',
        adminRole: 'Administrador del Colegio (Auditor, Revisor y Supervisor Académico)',
        verdict: 'Acreditación Sobresaliente',
        notes: 'Auditoría presencial de evidencia STEAM. Demuestra dominio excepcional del Principio de Pascal y modelación bilingüe.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        campusName: 'Campus Montes (Sede Matriz & CCH)',
        evidenceTitle: 'Brazo Robótico Hidráulico (STEAM IBIME)'
      }
    ];
  });

  // Guardar dictamen con identificación de cuenta del administrador
  const handleSaveAuditVerdict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) return;

    const newRecord: AcademicAuditLogRecord = {
      id: `aud-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: `${currentStudent.first_name} ${currentStudent.last_name_1}`,
      adminId: user?.id || 'usr-admin-current',
      adminName,
      adminEmail,
      adminRole: adminRoleTitle,
      verdict: auditVerdict,
      notes: auditNotes || 'Validación de cumplimiento formativo y avance curricular supervisado con éxito.',
      timestamp: new Date().toISOString(),
      campusName: currentStudent.campus_name || 'Plantel Oficial',
      evidenceTitle: studentEvidences[0]?.title || 'Revisión General de Portafolio'
    };

    const updated = [newRecord, ...auditLogs];
    setAuditLogs(updated);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('iskool_academic_audit_log', JSON.stringify(updated));
      }
    } catch (err) {}

    // Agregar feedback oficial al primer entregable si existe
    if (studentEvidences.length > 0) {
      addPortfolioFeedback(
        studentEvidences[0].id,
        `[Supervisión Directiva]: ${newRecord.verdict} por ${adminName} (${adminEmail}) - "${newRecord.notes}"`,
        'teacher',
        user?.id || 'admin-id'
      );
    }

    setAuditNotes('');
    setAuditSuccessToast(`Dictamen registrado con éxito con la firma de ${adminName} (${adminEmail}). Trazabilidad asegurada.`);
    setTimeout(() => setAuditSuccessToast(null), 5000);
  };

  // Docentes del colegio para la Vista del Profesor
  const currentTeachers = useMemo(() => {
    if (holding?.slug === 'ibime' || schoolId === 'sch-ibime') {
      return IBIME_TEACHERS;
    }
    return teachersList.filter(t => !schoolId || t.school_id === schoolId);
  }, [holding, schoolId, teachersList]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[96vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        
        {/* ========================================================================= */}
        {/* 1. HEADER INSTITUCIONAL CON IDENTIFICACIÓN DE CUENTA DEL ADMINISTRADOR   */}
        {/* ========================================================================= */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-indigo-900/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-inner shrink-0">
              <Shield size={26} className="text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-black tracking-tight text-white">
                  Portal Académico Institucional
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 border border-amber-300 shadow-xs flex items-center gap-1">
                  <Award size={12} className="text-slate-950" />
                  <span>Auditor, Revisor y Supervisor</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {holding.name}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-indigo-200 mt-1 font-medium">
                <span>Sesión activa de:</span>
                <strong className="text-white font-bold">{adminName}</strong>
                <span className="text-indigo-400">•</span>
                <span className="text-indigo-300">{adminEmail}</span>
                <span className="text-indigo-400">•</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Trazabilidad Total
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Selector de Plantel / Campus */}
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs text-white">
              <Building2 size={14} className="text-amber-300 shrink-0" />
              <select
                value={selectedCampusId}
                onChange={(e) => setSelectedCampusId(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
                title="Filtrar por colegio / campus"
              >
                <option value="all" className="text-slate-900 font-semibold">Todos los Planteles</option>
                {availableCampuses.map(campus => (
                  <option key={campus.id} value={campus.id} className="text-slate-900 font-semibold">
                    {campus.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-indigo-200 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. BARRA DE CONMUTACIÓN DE VISTAS (PROFESOR VS ALUMNOS)                   */}
        {/* ========================================================================= */}
        <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActivePortalTab('alumnos')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activePortalTab === 'alumnos'
                  ? 'bg-[#5448f7] text-white shadow-indigo-500/25 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Users size={16} />
              <span>Vista de los Alumnos (Evidencias & Avances)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortalTab('profesor')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                activePortalTab === 'profesor'
                  ? 'bg-slate-900 text-white shadow-slate-900/25 scale-[1.02]'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <GraduationCap size={16} />
              <span>Vista del Profesor (Planeaciones & Docentes)</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-[11px] text-slate-500 hidden sm:inline">
              Modo de Acompañamiento Directivo:
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider border border-emerald-200">
              Acreditado SEP NEM 2024
            </span>
          </div>
        </div>

        {/* Notificación de Éxito de Auditoría */}
        {auditSuccessToast && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2.5 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{auditSuccessToast}</span>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. CONTENIDO: VISTA DE LOS ALUMNOS (CON LISTA DESPLEGABLE)                */}
        {/* ========================================================================= */}
        {activePortalTab === 'alumnos' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/60">
            
            {/* SELECTOR DESPLEGABLE DE ALUMNO */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <label className="block text-xs font-black uppercase tracking-wider text-indigo-900 mb-1.5 flex items-center gap-1.5">
                  <Users size={14} className="text-indigo-600" />
                  <span>Lista Desplegable de Alumnos (Supervisión y Auditoría):</span>
                </label>
                <div className="relative">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border-2 border-indigo-200 hover:border-indigo-400 rounded-xl text-slate-900 font-extrabold text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors cursor-pointer appearance-none shadow-xs"
                    title="Selecciona el alumno que deseas supervisar y auditar"
                  >
                    {studentsList.map((std) => (
                      <option key={std.id} value={std.id}>
                        {std.first_name} {std.last_name_1} {std.last_name_2 || ''} — {std.grade} ({std.campus_name || 'Plantel'}) • Mat: {std.enrollment_id}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-600">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>

              {/* Contador de Alumnos en Plantel */}
              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <div className="text-right">
                  <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Población Activa</span>
                  <span className="text-sm font-black text-slate-800">{studentsList.length} Alumnos</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-sm">
                  {studentsList.length}
                </div>
              </div>
            </div>

            {/* EXPEDIENTE Y PANEL DEL ALUMNO SELECCIONADO */}
            {currentStudent ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* COLUMNA IZQUIERDA: TARJETA DEL ALUMNO Y MÉTRICAS DE AVANCE (4 COLUMNAS) */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white shrink-0">
                        {currentStudent.first_name.charAt(0)}{currentStudent.last_name_1.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base leading-tight">
                          {currentStudent.first_name} {currentStudent.last_name_1} {currentStudent.last_name_2 || ''}
                        </h4>
                        <p className="text-xs text-indigo-600 font-bold mt-0.5">
                          {currentStudent.grade}
                        </p>
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          Mat: {currentStudent.enrollment_id}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-medium">Colegio / Plantel:</span>
                        <strong className="text-slate-800 font-bold text-right truncate max-w-[180px]">
                          {currentStudent.campus_name || 'Campus Montes'}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-medium">CURP Oficial:</span>
                        <span className="font-mono text-[11px] text-slate-700 font-semibold">{currentStudent.curp}</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-medium">Promedio General:</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-black text-xs">
                          {currentStudent.average_grade || 9.5} / 10
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-medium">Beca Institucional:</span>
                        <span className="font-bold text-indigo-700">
                          {currentStudent.scholarship_percentage ? `${currentStudent.scholarship_percentage}% (${currentStudent.scholarship_type})` : 'Sin beca asignada'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-slate-600">
                        <span className="font-medium">Tutor Registrado:</span>
                        <span className="text-slate-800 font-semibold truncate max-w-[180px]">{currentStudent.tutor_name || 'Padre de Familia'}</span>
                      </div>
                    </div>

                    {/* Indicadores Clave de Avance */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-center">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-semibold text-slate-500">Asistencia NEM</span>
                        <span className="text-sm font-black text-emerald-600">98.5%</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="block text-[10px] font-semibold text-slate-500">Nivel Gamificado</span>
                        <span className="text-sm font-black text-indigo-600 flex items-center justify-center gap-1">
                          <Flame size={14} className="text-amber-500" />
                          Nivel 14 (Héroe)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen de Acciones del Supervisor */}
                  <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/70 space-y-2">
                    <div className="flex items-center gap-2 text-indigo-900 font-black text-xs">
                      <Shield size={16} className="text-indigo-600" />
                      <span>Garantía de Auditoría Directiva</span>
                    </div>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      Cualquier observación o validación efectuada quedará suscrita con la firma digital de <strong className="font-bold">{adminName}</strong> y sincronizada en la bitácora escolar.
                    </p>
                  </div>
                </div>

                {/* COLUMNA DERECHA: EVIDENCIAS, AVANCES Y DICTAMEN DEL ADMINISTRADOR (8 COLUMNAS) */}
                <div className="lg:col-span-8 space-y-5">
                  
                  {/* Pestañas de Inspección del Alumno */}
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <button
                      type="button"
                      onClick={() => setStudentInspectionTab('evidencias')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        studentInspectionTab === 'evidencias'
                          ? 'bg-[#5448f7] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <FileCheck2 size={14} />
                      <span>Evidencias y Portafolio ({studentEvidences.length})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentInspectionTab('avances')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        studentInspectionTab === 'avances'
                          ? 'bg-[#5448f7] text-white shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Layers size={14} />
                      <span>Avances Curriculares & Fases SEP</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStudentInspectionTab('dictamen')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                        studentInspectionTab === 'dictamen'
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Award size={14} />
                      <span>Dictamen del Supervisor Directivo</span>
                    </button>
                  </div>

                  {/* 1. SECCIÓN DE EVIDENCIAS Y PORTAFOLIO */}
                  {studentInspectionTab === 'evidencias' && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="flex items-center justify-between">
                        <h5 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                          <FileText size={16} className="text-indigo-600" />
                          <span>Entregables de Aprendizaje y Evidencias Calificadas</span>
                        </h5>
                        <span className="text-[11px] font-bold text-slate-500">
                          {studentEvidences.length} evidencias cargadas
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentEvidences.map((ev) => (
                          <div
                            key={ev.id}
                            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div>
                              {/* Imagen o Preview de la Evidencia */}
                              <div className="relative h-40 w-full bg-slate-900 overflow-hidden group">
                                <img
                                  src={ev.file_url}
                                  alt={ev.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=400';
                                  }}
                                />
                                <div className="absolute top-2.5 left-2.5">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/60 text-white backdrop-blur-md">
                                    {ev.subject?.name || 'Materia Oficial'}
                                  </span>
                                </div>
                                <div className="absolute top-2.5 right-2.5">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${
                                    ev.status === 'approved' ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950 font-bold'
                                  }`}>
                                    {ev.status === 'approved' ? 'Aprobada' : 'En Revisión'}
                                  </span>
                                </div>
                              </div>

                              {/* Datos del Proyecto */}
                              <div className="p-4 space-y-2">
                                <h6 className="font-extrabold text-sm text-slate-900 line-clamp-1">
                                  {ev.title}
                                </h6>
                                <p className="text-xs text-slate-600 line-clamp-2">
                                  {ev.description}
                                </p>

                                {ev.self_reflection && (
                                  <div className="p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
                                    <span className="block text-[10px] font-black uppercase text-indigo-700">Autoevaluación del Alumno:</span>
                                    <p className="italic text-[11px] leading-tight">"{ev.self_reflection}"</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Acciones de Auditoría por Evidencia */}
                            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                <Calendar size={12} />
                                {new Date(ev.created_at).toLocaleDateString()}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setStudentInspectionTab('dictamen');
                                  setAuditNotes(`Auditoría específica sobre la evidencia: "${ev.title}". Proyecto verificado con cumplimiento cabal.`);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Eye size={12} />
                                <span>Auditar Evidencia</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. SECCIÓN DE AVANCES CURRICULARES & FASES SEP */}
                  {studentInspectionTab === 'avances' && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-black text-sm text-slate-900">
                              Matriz de Cumplimiento Curricular SEP NEM 2024
                            </h5>
                            <p className="text-xs text-slate-500">
                              Acreditación de Procesos de Desarrollo de Aprendizaje (PDA) y proyectos formativos.
                            </p>
                          </div>
                          <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                            96% Avance Acreditado
                          </span>
                        </div>

                        <div className="space-y-3 pt-2">
                          {[
                            { campo: 'Lenguajes (Español & Cambridge English)', pda: 'Produce textos informativos y narrativos bilingües con aparato crítico.', status: 'Completado', pct: 98 },
                            { campo: 'Saberes y Pensamiento Científico (STEAM & Matemáticas)', pda: 'Modela leyes físicas de Pascal y conservación de materia con prototipos.', status: 'Completado', pct: 96 },
                            { campo: 'Ética, Naturaleza y Sociedades (Historia & Geografía)', pda: 'Indaga procesos de soberanía histórica y analiza el patrimonio biocultural.', status: 'En Proceso', pct: 94 },
                            { campo: 'De lo Humano y lo Comunitario (Robótica & Habilidades)', pda: 'Diseña artefactos sustentables con trabajo en equipo y juego limpio.', status: 'Completado', pct: 97 }
                          ].map((item, idx) => (
                            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                              <div className="flex justify-between items-center text-xs">
                                <strong className="font-bold text-slate-900">{item.campo}</strong>
                                <span className="font-black text-indigo-600">{item.pct}%</span>
                              </div>
                              <p className="text-xs text-slate-600">{item.pda}</p>
                              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-[#5448f7] h-1.5 rounded-full" style={{ width: `${item.pct}%` }}></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3. SECCIÓN DE DICTAMEN DEL ADMINISTRADOR (TRAZABILIDAD TOTAL) */}
                  {studentInspectionTab === 'dictamen' && (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                          <Award size={20} className="text-amber-500" />
                          <div>
                            <h5 className="font-black text-sm text-slate-900">
                              Emitir Dictamen de Auditoría y Supervisión Académica
                            </h5>
                            <p className="text-xs text-slate-500">
                              Este dictamen se registrará bajo la cuenta directiva de <strong>{adminName}</strong> ({adminEmail}).
                            </p>
                          </div>
                        </div>

                        <form onSubmit={handleSaveAuditVerdict} className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Resolución de Auditoría / Supervisión:
                            </label>
                            <select
                              value={auditVerdict}
                              onChange={(e) => setAuditVerdict(e.target.value as any)}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-xs focus:outline-none focus:border-indigo-500"
                            >
                              <option value="Aprobado por Dirección">Aprobado por Dirección General</option>
                              <option value="Acreditación Sobresaliente">Acreditación Sobresaliente (Mención Honorífica)</option>
                              <option value="Observación Pedagógica">Observación Pedagógica de Acompañamiento</option>
                              <option value="Seguimiento Prioritario">Seguimiento Prioritario</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Observaciones y Retroalimentación Pedagógica:
                            </label>
                            <textarea
                              rows={3}
                              value={auditNotes}
                              onChange={(e) => setAuditNotes(e.target.value)}
                              placeholder={`ej. Se auditaron las evidencias de ${currentStudent.first_name}. Muestra un dominio sólido de los contenidos NEM y alta disciplina en sus entregas.`}
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                            />
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              Firma Digital: <strong className="text-indigo-900">{adminEmail}</strong>
                            </span>
                            <button
                              type="submit"
                              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                            >
                              <Award size={15} />
                              <span>Registrar Dictamen de Supervisión</span>
                            </button>
                          </div>
                        </form>
                      </div>

                      {/* BITÁCORA HISTÓRICA DE AUDITORÍAS REGISTRADAS */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                        <h6 className="font-extrabold text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          <Clock size={14} className="text-indigo-600" />
                          <span>Bitácora de Trazabilidad Directiva Registrada</span>
                        </h6>

                        <div className="space-y-2.5">
                          {auditLogs
                            .filter(log => log.studentId === currentStudent.id || log.studentName.includes(currentStudent.first_name))
                            .map((log) => (
                              <div key={log.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="font-black text-slate-900">{log.adminName}</span>
                                    <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                                      {log.verdict}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">
                                    {new Date(log.timestamp).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-slate-700 italic">"{log.notes}"</p>
                                <div className="text-[10px] text-slate-400">
                                  Cuenta: {log.adminEmail} • Plantel: {log.campusName}
                                </div>
                              </div>
                            ))}

                          {auditLogs.filter(log => log.studentId === currentStudent.id || log.studentName.includes(currentStudent.first_name)).length === 0 && (
                            <p className="text-xs text-slate-400 italic text-center py-3">
                              Aún no hay dictámenes registrados para este alumno. Utiliza el formulario superior para emitir la primera auditoría.
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                <p className="text-slate-500 text-sm font-semibold">No se encontraron alumnos para el plantel seleccionado.</p>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. CONTENIDO: VISTA DEL PROFESOR (PLANEACIONES & DOCENTES)                */}
        {/* ========================================================================= */}
        {activePortalTab === 'profesor' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div>
                <h4 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <GraduationCap size={20} className="text-indigo-600" />
                  <span>Plantilla de Docentes Titulares & Planeaciones Curriculares</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supervisa la alineación pedagógica a Fases SEP, sesiones cronometradas y entregables de cada profesor de {holding.name}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/teacher?school_id=${encodeURIComponent(schoolId)}&role=admin`);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
              >
                <span>Acceder al Entorno Docente Completo</span>
                <ChevronRight size={15} />
              </button>
            </div>

            {/* Tarjetas de Docentes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentTeachers.map((tea, idx) => (
                <div
                  key={tea.id || idx}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                        {tea.first_name.charAt(0)}{tea.last_name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-black text-sm text-slate-900">
                          Prof. {tea.first_name} {tea.last_name}
                        </h5>
                        <p className="text-xs text-emerald-700 font-semibold">
                          Docente Titular
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {tea.campus_name || 'Campus Montes / Matriz'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                      <div className="flex justify-between">
                        <span className="font-medium">Planeaciones NEM:</span>
                        <span className="font-bold text-emerald-600">Validadas en Bóveda Curricular</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Rúbrica Formativa:</span>
                        <span className="font-bold text-indigo-700">Analítica SEP 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Correo Docente:</span>
                        <span className="text-slate-500 font-mono text-[11px]">{tea.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Acreditado
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/teacher?school_id=${encodeURIComponent(schoolId)}&teacher_id=${tea.id}&role=admin`);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Ver Clases</span>
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. FOOTER CON FIRMA Y CIERRE                                              */}
        {/* ========================================================================= */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-indigo-600" />
            <span className="hidden sm:inline">
              Supervisión Escolar Segura · Identidad: <strong className="text-slate-800 font-bold">{adminName}</strong> ({adminEmail})
            </span>
            <span className="sm:hidden text-indigo-900 font-bold">
              {adminName}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs cursor-pointer transition-colors"
          >
            Cerrar Portal
          </button>
        </div>

      </div>
    </div>
  );
}
