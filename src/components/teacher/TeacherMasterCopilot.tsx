"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, Clock, Users, CheckCircle2, AlertCircle, BookOpen, Send, Zap, 
  Play, Pause, SkipForward, Palette, Layers, Search, Filter, ArrowRight, 
  ExternalLink, Shield, Award, Eye, Check, X, ChevronRight, Calendar, 
  Stamp, FileCheck2, Flame, RefreshCw, SlidersHorizontal, Phone, 
  MessageCircle, FileText, LayoutDashboard, Gamepad2, Share2, 
  GraduationCap, Building2, Volume2, Lock, Unlock, Printer, Heart,
  ThumbsUp, UserCheck, AlertTriangle, ArrowLeft, Copy
} from 'lucide-react';
import { DetailedStudent, PortfolioItem, Group, UserProfile } from '@/types';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { getStudentAvatarUrl } from '@/utils/studentAvatar';

export type CopilotTheme = 'carbon' | 'suizo' | 'heritage' | 'esmeralda';

interface TeacherMasterCopilotProps {
  teacher: UserProfile;
  students: DetailedStudent[];
  groups: Group[];
  portfolioItems: PortfolioItem[];
  onOpenClassicHub?: () => void;
  onOpenPlanning?: () => void;
  onOpenEmergency?: () => void;
}

export const TeacherMasterCopilot: React.FC<TeacherMasterCopilotProps> = ({
  teacher,
  students,
  groups,
  portfolioItems,
  onOpenClassicHub,
  onOpenPlanning,
  onOpenEmergency
}) => {
  const router = useRouter();

  // Función de formateo de nombre completo de estudiante oficial SEP
  const getStudentFullName = (s?: DetailedStudent | null) => {
    if (!s) return 'Estudiante';
    return `${s.first_name} ${s.last_name_1 || ''} ${s.last_name_2 || ''}`.trim();
  };

  // -------------------------------------------------------------
  // 1. TEMA Y APARIENCIA VISUAL (SETTINGS CROMÁTICOS)
  // -------------------------------------------------------------
  const [theme, setTheme] = useState<CopilotTheme>('carbon');
  const [fontSize, setFontSize] = useState<'compact' | 'standard' | 'projector'>('standard');
  const [accentColor, setAccentColor] = useState<string>('#00E5FF');

  // -------------------------------------------------------------
  // 2. NAVEGACIÓN PRINCIPAL
  // -------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'timeline' | 'stamps' | 'evidences' | 'planning' | 'classroom' | 'enlace' | 'settings'>('timeline');

  // -------------------------------------------------------------
  // 3. ESTADOS DE CLASE Y TELEMETRÍA (ORQUESTADOR DIDÁCTICO 2.0)
  // -------------------------------------------------------------
  const [selectedCampus, setSelectedCampus] = useState('Campus Montes (Sede Central & CCH)');
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id || 'g1');
  const [currentTime, setCurrentTime] = useState<string>('09:35 AM');
  
  // Reloj institucional en vivo
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }));
    };
    updateClock();
    const interval = setInterval(updateClock, 30000);
    return () => clearInterval(interval);
  }, []);

  // Control de reproducción del Timeline
  const [isTimelinePlaying, setIsTimelinePlaying] = useState<boolean>(true);
  const [timelineProgress, setTimelineProgress] = useState<number>(65);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number>(1); // 0: Asistencia, 1: Texto NEM, 2: Taller/Sellos, 3: Cierre

  const classNodes = useMemo(() => [
    { id: 'node-1', title: 'Pase de Lista con Foto', type: 'Asistencia', duration: '5 min', status: 'completed', pda: 'Asistencia & Diagnóstico' },
    { id: 'node-2', title: 'Madrugada de Dolores - Texto NEM', type: 'Lectura Crítica', duration: '15 min', status: 'active', pda: 'Fase 6: Análisis de fuentes primarias 1810' },
    { id: 'node-3', title: 'Taller & Sellos de Libreta', type: 'Práctica / Libreta', duration: '20 min', status: 'upcoming', pda: 'Fase 6: Resolución de esquemas cronológicos' },
    { id: 'node-4', title: 'Cierre & Rúbrica Formativa', type: 'Evaluación', duration: '10 min', status: 'upcoming', pda: 'Síntesis y Co-evaluación NEM' }
  ], []);

  // -------------------------------------------------------------
  // 4. CONTROL DE ASISTENCIA & SELLOS DE LIBRETA (UNIVERSAL STAMPER)
  // -------------------------------------------------------------
  const [todayStampPage, setTodayStampPage] = useState<string>('Pág. 48 - Ecuaciones Lineales');
  const [stampedMap, setStampedMap] = useState<Record<string, { stamped: boolean; page: string; time: string }>>(() => {
    const initialStamps: Record<string, { stamped: boolean; page: string; time: string }> = {};
    students.forEach((std, idx) => {
      const isAbsent = idx === 6;
      const isUnstamped = idx === 4 || idx === 8;
      initialStamps[std.id] = {
        stamped: !isAbsent && !isUnstamped,
        page: 'Pág. 48',
        time: '09:12 AM'
      };
    });
    return initialStamps;
  });

  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'late' | 'absent' | 'excused'>>(() => {
    const initialAttendance: Record<string, 'present' | 'late' | 'absent' | 'excused'> = {};
    students.forEach((std, idx) => {
      initialAttendance[std.id] = idx === 6 ? 'absent' : idx === 2 ? 'late' : 'present';
    });
    return initialAttendance;
  });

  const [onlyUnstampedFilter, setOnlyUnstampedFilter] = useState<boolean>(false);
  const [selectedStudentForDossier, setSelectedStudentForDossier] = useState<DetailedStudent | null>(null);

  // Sellar página universal a todos los presentes
  const handleStampAllPresent = () => {
    const updated = { ...stampedMap };
    students.forEach(std => {
      const status = attendanceMap[std.id] || 'present';
      if (status === 'present' || status === 'late') {
        updated[std.id] = {
          stamped: true,
          page: todayStampPage,
          time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true })
        };
      }
    });
    setStampedMap(updated);
  };

  // Conmutar sello individual
  const toggleStudentStamp = (studentId: string) => {
    setStampedMap(prev => {
      const current = prev[studentId];
      const isStamped = current?.stamped;
      return {
        ...prev,
        [studentId]: {
          stamped: !isStamped,
          page: todayStampPage,
          time: !isStamped ? new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }) : ''
        }
      };
    });
  };

  // Conmutar presencia de alumno
  const toggleAttendanceStatus = (studentId: string, status: 'present' | 'late' | 'absent' | 'excused') => {
    setAttendanceMap(prev => ({ ...prev, [studentId]: status }));
  };

  // Alumnos filtrados para sellos
  const studentsForStamps = useMemo(() => {
    if (!onlyUnstampedFilter) return students;
    return students.filter(std => !stampedMap[std.id]?.stamped);
  }, [students, onlyUnstampedFilter, stampedMap]);

  // -------------------------------------------------------------
  // 5. AUDITORÍA DE ENTREGAS Y PORTAFOLIO EN ISKOOL
  // -------------------------------------------------------------
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'pending' | 'approved' | 'needs_revision'>('all');

  const filteredEvidences = useMemo(() => {
    if (evidenceFilter === 'all') return portfolioItems;
    return portfolioItems.filter(item => item.status === evidenceFilter);
  }, [portfolioItems, evidenceFilter]);

  // -------------------------------------------------------------
  // 6. ENLACE INSTITUCIONAL & MAGIC LINKS PARA PADRES
  // -------------------------------------------------------------
  const [directionCircularConfirmed, setDirectionCircularConfirmed] = useState<boolean>(false);
  const [magicLinkModalStudent, setMagicLinkModalStudent] = useState<DetailedStudent | null>(null);
  const [modalCustomPhone, setModalCustomPhone] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [magicLinkSentToast, setMagicLinkSentToast] = useState<string | null>(null);
  const [regularizedStampsMap, setRegularizedStampsMap] = useState<Record<string, Record<string, boolean>>>({});
  const [auditLogList, setAuditLogList] = useState<Array<{ id: string; studentName: string; action: string; time: string; status: 'sent' | 'signed' }>>([
    { id: 'aud-1', studentName: 'Diego Ramírez', action: 'Reporte de Asistencia & Sello Pág. 48', time: '09:15 AM', status: 'signed' },
    { id: 'aud-2', studentName: 'Mateo Morales', action: 'Alerta de Retardo (08:08 AM) & Tarea Sellada', time: '08:20 AM', status: 'signed' },
    { id: 'aud-3', studentName: 'Sofía Hernández', action: 'Felicitación Mérito Formativo (+50 XP)', time: '09:00 AM', status: 'sent' }
  ]);

  // Helper para abrir el modal con el teléfono prellenado del alumno
  const openMagicLinkModal = (student: DetailedStudent) => {
    setMagicLinkModalStudent(student);
    setModalCustomPhone(student.phone || student.emergency_contact_phone || '55-4160-8800');
    setCopiedLink(false);
  };

  // Enviar y Disparar Magic Link Real Inmediato
  const handleSendMagicLink = (student: DetailedStudent, channel: 'whatsapp' | 'sms', targetPhone?: string) => {
    const fullName = getStudentFullName(student);
    const att = attendanceMap[student.id] || 'present';
    const attLabel = att === 'present' ? 'Presente en Aula (08:00 AM) ✓' :
                     att === 'late' ? 'Retardo Registrado (08:15 AM) ⚠' :
                     att === 'absent' ? 'Falta en Aula ✗' : 'Justificado ℹ';

    const stamp = stampedMap[student.id];
    const activePage = stamp?.page || todayStampPage;
    const isStamped = !!stamp?.stamped;
    const stampLabel = isStamped 
      ? `${activePage} (Sellada y Aprobada) ✓` 
      : `${activePage.split(' - ')[0]} (Sin Sello / Pendiente) ✗`;

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://iskool.edu.mx';
    const token = `ml_${student.id}_${Date.now().toString(36)}`;
    const magicLinkUrl = `${origin}/parent?student_id=${encodeURIComponent(student.id)}&token=${token}&auth=magic`;

    const rawPhone = (targetPhone || modalCustomPhone || student.phone || student.emergency_contact_phone || '5541608800').replace(/\D/g, '');
    const intlPhone = rawPhone.length === 10 ? `52${rawPhone}` : rawPhone;

    const dateStr = new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    if (channel === 'whatsapp') {
      const waMessage = 
`🏫 *ISkool - Reporte Escolar Institucional*
Estimado(a) tutor(a) de *${fullName}*:

Le compartimos el reporte académico y formativo de la sesión de hoy:
📅 *Fecha:* ${dateStr}
👤 *Alumno:* ${fullName} (1°A Secundaria)
📍 *Asistencia:* ${attLabel}
📖 *Libreta Física:* ${stampLabel}
📊 *Evidencias en Plataforma:* 100% Al corriente

⚡ *Firme de enterado con 1 toque en su Magic Link Seguro (sin contraseñas):*
👉 ${magicLinkUrl}

_Reporte oficial emitido desde la plataforma de control escolar ISkool._`;

      const waUrl = `https://api.whatsapp.com/send?phone=${intlPhone}&text=${encodeURIComponent(waMessage)}`;

      // Disparo real en navegador
      if (typeof window !== 'undefined') {
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(waUrl).catch(() => {});
        }
      }

      const newEntry = {
        id: `aud-${Date.now()}`,
        studentName: fullName,
        action: `Magic Link disparado por WhatsApp a (+${intlPhone}) • ${activePage.split(' - ')[0]} & Asistencia`,
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'sent' as const
      };
      setAuditLogList(prev => [newEntry, ...prev]);
      setMagicLinkSentToast(`✓ Magic Link disparado por WhatsApp Institucional a (+${intlPhone}). Abriendo chat...`);
    } else {
      const smsMessage = `ISkool: Reporte diario de ${student.first_name}. Asistencia: ${attLabel}. Libreta: ${stampLabel}. Firme aqui con 1 toque: ${magicLinkUrl}`;
      const smsUrl = `sms:${rawPhone}?body=${encodeURIComponent(smsMessage)}`;

      if (typeof window !== 'undefined') {
        window.open(smsUrl, '_blank');
        if (navigator.clipboard) {
          navigator.clipboard.writeText(smsMessage).catch(() => {});
        }
      }

      const newEntry = {
        id: `aud-${Date.now()}`,
        studentName: fullName,
        action: `Magic Link disparado por SMS Seguro a (+${rawPhone}) • ${activePage.split(' - ')[0]} & Asistencia`,
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'sent' as const
      };
      setAuditLogList(prev => [newEntry, ...prev]);
      setMagicLinkSentToast(`✓ Magic Link disparado por SMS Seguro a (+${rawPhone}).`);
    }

    setTimeout(() => setMagicLinkSentToast(null), 5000);
    setMagicLinkModalStudent(null);
  };

  // -------------------------------------------------------------
  // 7. AULA GAMIFICADA (RULETA & GREMIOS SOBRIOS)
  // -------------------------------------------------------------
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedSpotlightStudent, setSelectedSpotlightStudent] = useState<DetailedStudent | null>(students[0] || null);
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const handleSpinWheel = () => {
    if (isSpinning || students.length === 0) return;
    setIsSpinning(true);
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * students.length);
      setSelectedSpotlightStudent(students[randomIndex]);
      setIsSpinning(false);
      setTimerSeconds(30);
      setIsTimerRunning(true);
    }, 1800);
  };

  useEffect(() => {
    if (!isTimerRunning) return;
    const interval = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // -------------------------------------------------------------
  // CLASES DE TEMA (PALETAS CROMÁTICAS)
  // -------------------------------------------------------------
  const themeClasses = useMemo(() => {
    switch (theme) {
      case 'suizo':
        return {
          bg: 'bg-[#F8FAFC]',
          text: 'text-slate-900',
          subtext: 'text-slate-500',
          card: 'bg-white border-slate-200 shadow-sm',
          cardHover: 'hover:border-slate-300',
          rail: 'bg-white border-r border-slate-200',
          header: 'bg-white border-b border-slate-200',
          accent: 'text-blue-600',
          accentBg: 'bg-blue-600 text-white',
          pill: 'bg-slate-100 text-slate-800 border-slate-200'
        };
      case 'heritage':
        return {
          bg: 'bg-[#160808]',
          text: 'text-amber-50',
          subtext: 'text-amber-200/60',
          card: 'bg-[#220E0E]/90 border-red-950/80 shadow-md',
          cardHover: 'hover:border-amber-500/40',
          rail: 'bg-[#1C0A0A] border-r border-red-950',
          header: 'bg-[#1C0A0A] border-b border-red-950',
          accent: 'text-amber-400',
          accentBg: 'bg-gradient-to-r from-red-800 to-amber-700 text-white',
          pill: 'bg-red-950/80 text-amber-300 border-red-900/60'
        };
      case 'esmeralda':
        return {
          bg: 'bg-[#051C14]',
          text: 'text-emerald-50',
          subtext: 'text-emerald-200/60',
          card: 'bg-[#0A2E22]/90 border-emerald-950/80 shadow-md',
          cardHover: 'hover:border-emerald-500/40',
          rail: 'bg-[#06241A] border-r border-emerald-950',
          header: 'bg-[#06241A] border-b border-emerald-950',
          accent: 'text-emerald-400',
          accentBg: 'bg-emerald-600 text-white',
          pill: 'bg-emerald-950/80 text-emerald-300 border-emerald-900/60'
        };
      case 'carbon':
      default:
        return {
          bg: 'bg-[#070F1E]',
          text: 'text-slate-100',
          subtext: 'text-slate-400',
          card: 'bg-[#0D1829]/90 border-slate-800/80 shadow-md',
          cardHover: 'hover:border-cyan-500/40',
          rail: 'bg-[#0A1322] border-r border-slate-800',
          header: 'bg-[#0A1322] border-b border-slate-800',
          accent: 'text-cyan-400',
          accentBg: 'bg-cyan-500 text-slate-950',
          pill: 'bg-slate-900 text-cyan-300 border-slate-800'
        };
    }
  }, [theme]);

  // Total de alumnos presentes calculados
  const presentCount = useMemo(() => {
    return students.filter(s => (attendanceMap[s.id] || 'present') !== 'absent').length;
  }, [students, attendanceMap]);

  return (
    <div className={`min-h-screen w-full flex flex-col md:flex-row ${themeClasses.bg} ${themeClasses.text} transition-colors duration-200 font-sans antialiased overflow-x-hidden`}>
      
      {/* =========================================================================
          1. BARRA LATERAL ULTIMA-COMPACTA PERMANENTE (64px en Desktop)
          Siempre visible, con iconos precisos y tooltips de alta legibilidad
          ========================================================================= */}
      <aside className={`w-full md:w-16 shrink-0 ${themeClasses.rail} flex md:flex-col items-center justify-between p-2 md:py-4 z-40 shadow-sm border-b md:border-b-0`}>
        
        {/* Logo / Isotipo ISkool */}
        <div className="flex md:flex-col items-center gap-2">
          <button 
            onClick={() => setActiveTab('timeline')}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black text-base shadow-md cursor-pointer hover:scale-105 transition-transform"
            title="ISkool Copilot Docente"
          >
            iS
          </button>
        </div>

        {/* Grupo de Herramientas de Aula Centrales */}
        <nav className="flex md:flex-col items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          
          {/* 1. Dashboard Maestro (Timeline) */}
          <button
            onClick={() => setActiveTab('timeline')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'timeline' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Dashboard Maestro & Timeline de Clase"
          >
            <LayoutDashboard className="w-5 h-5" />
          </button>

          {/* 2. Control de Asistencia & Sellos de Libreta */}
          <button
            onClick={() => setActiveTab('stamps')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'stamps' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Control de Asistencia & Sellos de Libreta"
          >
            <Stamp className="w-5 h-5" />
            {Object.values(stampedMap).filter(s => !s.stamped).length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          {/* 3. Auditoría de Evidencias ISkool */}
          <button
            onClick={() => setActiveTab('evidences')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'evidences' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Auditoría de Entregas & Evidencias ISkool"
          >
            <FileCheck2 className="w-5 h-5" />
          </button>

          {/* 4. Planeación Curricular NEM & Bóveda */}
          <button
            onClick={() => setActiveTab('planning')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'planning' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Planeación Curricular SEP NEM & Bóveda"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* 5. Aula Gamificada & Ruleta */}
          <button
            onClick={() => setActiveTab('classroom')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'classroom' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Aula Gamificada, Gremios & Ruleta"
          >
            <Gamepad2 className="w-5 h-5" />
          </button>

          {/* 6. Centro de Enlace Institucional & Magic Links */}
          <button
            onClick={() => setActiveTab('enlace')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer relative ${
              activeTab === 'enlace' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Enlace Institucional & Magic Links a Padres"
          >
            <Share2 className="w-5 h-5" />
            {!directionCircularConfirmed && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-amber-400" />
            )}
          </button>

          <div className="w-6 h-px bg-slate-700/40 my-1 hidden md:block" />

          {/* PILAR 1 DE INFRAESTRUCTURA: Centro de Idiomas & Fonética */}
          <button
            onClick={() => router.push('/teacher/idiomas')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-red-400 hover:text-white hover:bg-red-600/30 transition-all cursor-pointer"
            title="Pilar 1: Centro de Idiomas & Fonética Avanzada (/teacher/idiomas)"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* PILAR 2 DE INFRAESTRUCTURA: Estudio de Bloques Studio */}
          <button
            onClick={() => router.push('/teacher/studio')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-purple-400 hover:text-white hover:bg-purple-600/30 transition-all cursor-pointer"
            title="Pilar 2: Lienzo de Bloques / Estudio ISkool (/teacher/studio)"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Red de Comunidad Docente (80+) */}
          <button
            onClick={() => router.push('/teacher/community')}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-emerald-400 hover:text-white hover:bg-emerald-600/30 transition-all cursor-pointer"
            title="Comunidad Docente (80+ Recursos y Juegos)"
          >
            <Users className="w-5 h-5" />
          </button>
        </nav>

        {/* Ajustes de Color y Paleta */}
        <div className="flex md:flex-col items-center gap-1.5">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? `${themeClasses.accentBg} shadow-md` 
                : `${themeClasses.subtext} hover:${themeClasses.text} hover:bg-slate-800/20`
            }`}
            title="Personalizar Paleta de Colores & Temas"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. ÁREA DE TRABAJO PRINCIPAL & CABECERA DE TELEMETRÍA
          ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Cabecera Superior de Telemetría Docente */}
        <header className={`w-full ${themeClasses.header} px-4 py-3 flex flex-wrap items-center justify-between gap-3 sticky top-0 z-30 shadow-xs`}>
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Identificador de Grupo Activo */}
            <div className="flex items-center gap-2">
              <span className="font-black text-sm md:text-base tracking-tight truncate">
                1°A Secundaria
              </span>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${themeClasses.pill}`}>
                Historia & Ciencias
              </span>
            </div>

            <div className="h-4 w-px bg-slate-700/40 hidden sm:block" />

            {/* Reloj Institucional y Presencia */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 opacity-70" />
                {currentTime}
              </span>
              <span className="font-bold text-emerald-500 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                {presentCount}/{students.length || 28} Presentes
              </span>
            </div>
          </div>

          {/* Accesos de Mando Rápido en Cabecera */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Indicador de Página de Libreta a Sellar Hoy */}
            <div className={`px-2.5 py-1 rounded-lg border text-xs flex items-center gap-1.5 ${themeClasses.pill}`}>
              <Stamp className="w-3.5 h-3.5 text-cyan-400" />
              <span className="opacity-70 font-medium">Sello de Hoy:</span>
              <span className="font-black text-cyan-400">{todayStampPage.split(' - ')[0]}</span>
            </div>

            {/* Acceso Rápido a los 2 Pilares */}
            <button
              onClick={() => router.push('/teacher/studio')}
              className="px-2.5 py-1 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="Lienzo de Bloques Studio"
            >
              <Palette className="w-3 h-3 text-purple-400" />
              <span className="hidden lg:inline">Lienzo Studio</span>
            </button>

            <button
              onClick={() => router.push('/teacher/idiomas')}
              className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/60 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
              title="Centro de Idiomas ESL/FLE"
            >
              <Volume2 className="w-3 h-3 text-red-400" />
              <span className="hidden lg:inline">Idiomas & Fonética</span>
            </button>

            {/* Protocolo de Emergencia Escolar (SOS) */}
            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all flex items-center gap-1 shadow-sm cursor-pointer shrink-0"
                title="Protocolo de Emergencia Escolar Inmediato"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>SOS</span>
              </button>
            )}
          </div>
        </header>

        {/* Banner Toast de Magic Link Enviado */}
        {magicLinkSentToast && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 flex items-center justify-between shadow-lg animate-fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              {magicLinkSentToast}
            </span>
            <button onClick={() => setMagicLinkSentToast(null)} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            3. VISTA 1: DASHBOARD MAESTRO (ORQUESTADOR DIDÁCTICO & TIMELINE 2.0)
            ========================================================================= */}
        {activeTab === 'timeline' && (
          <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full animate-fade-in">
            
            {/* Barra de Flujo Didáctico (Timeline de Nodos Conectado con Studio) */}
            <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-3`}>
              
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider opacity-60">
                    Secuencia Didáctica de Hoy (4 Nodos Studio)
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    En Progreso ({timelineProgress}%)
                  </span>
                </div>

                {/* Controles de Reproducción Didáctica */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsTimelinePlaying(!isTimelinePlaying)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
                    title={isTimelinePlaying ? 'Pausar Cronómetro de Clase' : 'Reanudar Clase'}
                  >
                    {isTimelinePlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>

                  <button 
                    onClick={() => {
                      setActiveNodeIndex(prev => {
                        const next = Math.min(prev + 1, classNodes.length - 1);
                        setTimelineProgress(Math.round(((next + 0.65) / classNodes.length) * 100));
                        return next;
                      });
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer"
                    title="Avanzar al Siguiente Nodo Didáctico"
                  >
                    <SkipForward className="w-3.5 h-3.5" />
                  </button>

                  <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
                    11:24 min
                  </span>
                </div>
              </div>

              {/* Nodos Interactivos del Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                {classNodes.map((node, idx) => {
                  const isActive = idx === activeNodeIndex;
                  const isCompleted = idx < activeNodeIndex;

                  return (
                    <div 
                      key={node.id}
                      onClick={() => {
                        setActiveNodeIndex(idx);
                        setTimelineProgress(Math.round(((idx + 0.65) / classNodes.length) * 100));
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left relative ${
                        isActive 
                          ? 'border-cyan-500/80 bg-cyan-950/20 shadow-md shadow-cyan-950/20' 
                          : isCompleted 
                            ? 'border-emerald-500/40 bg-emerald-950/10 opacity-80' 
                            : 'border-slate-800/70 bg-slate-900/30 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-mono font-bold opacity-60">Bloque {idx + 1}</span>
                        {isCompleted && <span className="text-emerald-400 font-bold flex items-center gap-0.5"><Check className="w-3 h-3" /> Hecho</span>}
                        {isActive && <span className="text-cyan-400 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" /> Activo</span>}
                        {!isActive && !isCompleted && <span className="opacity-40">Pendiente</span>}
                      </div>

                      <div className="font-black text-xs md:text-sm truncate">
                        {node.title}
                      </div>
                      
                      <div className="text-[10px] opacity-60 truncate mt-0.5">
                        {node.pda}
                      </div>

                      {isActive && (
                        <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                          <div className="bg-cyan-400 h-full rounded-full transition-all duration-300" style={{ width: `${timelineProgress}%` }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lienzo Activo del Nodo (75%) + Co-Pilot Dock (25%) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              
              {/* 75% Lienzo Didáctico Central */}
              <div className={`lg:col-span-3 p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className="flex items-center justify-between border-b pb-3 border-slate-800/60">
                  <div>
                    <span className="text-[10px] font-black uppercase text-cyan-400 tracking-wider">
                      Nodo en Ejecución
                    </span>
                    <h2 className="text-lg md:text-xl font-black tracking-tight">
                      Proclama de Dolores & Las Fuentes Primarias de 1810
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('stamps')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Stamp className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Ir a Sellos</span>
                    </button>
                    <button
                      onClick={() => router.push('/teacher/studio')}
                      className="px-3 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 text-purple-200 border border-purple-700/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Palette className="w-3.5 h-3.5 text-yellow-300" />
                      <span>Editar en Studio</span>
                    </button>
                  </div>
                </div>

                {/* Texto de Fuente Primaria & Pregunta Detonadora */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                    Fragmento Histórico Oficial (Lectura en Aula):
                  </span>
                  <p className="text-xs md:text-sm leading-relaxed italic opacity-90 font-serif">
                    &quot;¡Hijos míos! una nueva dispensación nos viene hoy en este día... ¿os queréis ser libres? 
                    ¿Queréis libertar vuestras tierras que hace trescientos años os despojaron los gachupines?&quot;
                  </p>
                  <div className="text-[11px] opacity-60 text-right">
                    — Gesta de Dolores, 16 de septiembre de 1810 (Archivo Histórico Nacional)
                  </div>
                </div>

                {/* Pregunta Detonadora y Participación */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Pregunta Detonadora de Reflexión Crítica:
                  </label>
                  <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/40 text-xs md:text-sm font-bold text-cyan-200">
                    ¿Qué intereses sociales y económicos movieron a campesinos y criollos a unirse a la causa de Hidalgo en el Bajío?
                  </div>
                </div>

                {/* Micro-Panel de Respuestas y Rúbrica en Vivo */}
                <div className="pt-2 flex items-center justify-between text-xs opacity-70">
                  <span>Alumno en Turno de Respuesta: <strong className="text-white">Mateo Morales (1°A)</strong></span>
                  <span className="text-emerald-400 font-bold">Rúbrica: Nivel Sobresaliente (+50 XP)</span>
                </div>
              </div>

              {/* 25% Co-Pilot Dock Derecho (Herramientas Directas de Salón) */}
              <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className="text-xs font-black uppercase tracking-wider opacity-60 border-b pb-2 border-slate-800/60">
                  Co-Pilot Dock de Aula
                </div>

                {/* Botón de Sello Rápido Universal */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold opacity-80">
                    Sellado Rápido de Cuaderno:
                  </div>
                  <button
                    onClick={handleStampAllPresent}
                    className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Stamp className="w-4 h-4" />
                    <span>Sellar {todayStampPage.split(' - ')[0] || todayStampPage} a Todos</span>
                  </button>
                  <p className="text-[10px] opacity-60 text-center">
                    Aplica sello a los {presentCount} presentes con 1 toque.
                  </p>
                </div>

                <div className="w-full h-px bg-slate-800/60" />

                {/* Ruleta de Participación en Vivo */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold opacity-80 flex items-center justify-between">
                    <span>Ruleta de Aula:</span>
                    {isTimerRunning && <span className="text-amber-400 font-mono font-bold">{timerSeconds}s</span>}
                  </div>

                  <button
                    onClick={handleSpinWheel}
                    disabled={isSpinning}
                    className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>{isSpinning ? 'Girando ruleta...' : 'Turno Aleatorio'}</span>
                  </button>

                  {selectedSpotlightStudent && (
                    <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-center">
                      <div className="text-[10px] opacity-60 uppercase font-black">Seleccionado:</div>
                      <div className="font-bold text-xs text-amber-300">
                        {getStudentFullName(selectedSpotlightStudent)}
                      </div>
                    </div>
                  )}
                </div>

                <div className="w-full h-px bg-slate-800/60" />

                {/* Disparador Directo de Magic Link */}
                <div className="space-y-2">
                  <button
                    onClick={() => setMagicLinkModalStudent(selectedSpotlightStudent || students[0])}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-emerald-400" />
                    <span>Disparar Magic Link</span>
                  </button>
                  <p className="text-[10px] opacity-60 text-center">
                    Envío instantáneo por WhatsApp / SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            4. VISTA 2: ASISTENCIA Y SELLOS DE LIBRETA (UNIVERSAL STAMPER CON FILTRO)
            ========================================================================= */}
        {activeTab === 'stamps' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
            
            {/* Barra de Mando de Sellado de Cuadernos */}
            <div className={`p-4 rounded-2xl border ${themeClasses.card} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}>
              
              <div className="space-y-1 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Stamp className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-base md:text-lg font-black tracking-tight">
                    Control de Asistencia & Auditoría de Sellos de Libreta
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs opacity-70">
                  <span>Grupo 1°A</span>
                  <span>•</span>
                  <span>{students.length} Alumnos</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">{Object.values(stampedMap).filter(s => s.stamped).length} Cuadernos Sellados Hoy</span>
                </div>
              </div>

              {/* Acciones de Sellado Masivo y Filtro de Rezago */}
              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                
                {/* Selector / Input de Página a Sellar */}
                <div className="flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-700 text-xs">
                  <span className="opacity-60 text-[11px] font-bold">Pág:</span>
                  <input
                    type="text"
                    value={todayStampPage}
                    onChange={(e) => setTodayStampPage(e.target.value)}
                    className="bg-transparent font-bold text-white text-xs outline-hidden w-40"
                    placeholder="Ej. Pág. 48"
                  />
                </div>

                {/* Botón Sellar a Todos los Presentes */}
                <button
                  onClick={handleStampAllPresent}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Stamp className="w-3.5 h-3.5" />
                  <span>Sellar a Todos los Presentes ({presentCount})</span>
                </button>

                {/* Filtro de 1 Clic: Ver Alumnos Sin Sello Hoy */}
                <button
                  onClick={() => setOnlyUnstampedFilter(!onlyUnstampedFilter)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    onlyUnstampedFilter
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-rose-950/50 text-rose-300 border border-rose-800/60 hover:bg-rose-900/60'
                  }`}
                  title="Filtra y muestra exclusivamente a los alumnos que faltan de sello"
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Ver Sin Sello Hoy ({students.filter(s => !stampedMap[s.id]?.stamped).length})</span>
                </button>
              </div>
            </div>

            {/* Layout: Cuadrícula Sobria de Alumnos (65%) + Panel de Inspección Individual (35%) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Cuadrícula de Tarjetas de Alumnos con Foto */}
              <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {studentsForStamps.map(student => {
                  const stampInfo = stampedMap[student.id];
                  const attendanceStatus = attendanceMap[student.id] || 'present';
                  const isSelected = selectedStudentForDossier?.id === student.id;

                  return (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudentForDossier(student)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left ${
                        isSelected 
                          ? 'border-cyan-500 bg-cyan-950/30 shadow-md shadow-cyan-950/20' 
                          : `${themeClasses.card} ${themeClasses.cardHover}`
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Foto con Anillo de Presencia */}
                        <div className="relative shrink-0">
                          <img
                            src={getStudentAvatarUrl(student)}
                            alt={student.first_name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-slate-700"
                          />
                          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                            attendanceStatus === 'present' ? 'bg-emerald-500' :
                            attendanceStatus === 'late' ? 'bg-amber-500' :
                            attendanceStatus === 'absent' ? 'bg-rose-500' : 'bg-blue-500'
                          }`} />
                        </div>

                        {/* Datos del Alumno */}
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-xs md:text-sm truncate">
                            {getStudentFullName(student)}
                          </div>
                          
                          {/* Selector Rápido de Presencia */}
                          <div className="flex items-center gap-1 mt-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleAttendanceStatus(student.id, 'present'); }}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer ${attendanceStatus === 'present' ? 'bg-emerald-500/30 text-emerald-400 border border-emerald-500/50' : 'opacity-40 hover:opacity-100'}`}
                            >
                              Presente
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleAttendanceStatus(student.id, 'late'); }}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer ${attendanceStatus === 'late' ? 'bg-amber-500/30 text-amber-400 border border-amber-500/50' : 'opacity-40 hover:opacity-100'}`}
                            >
                              Retardo
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); toggleAttendanceStatus(student.id, 'absent'); }}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold cursor-pointer ${attendanceStatus === 'absent' ? 'bg-rose-500/30 text-rose-400 border border-rose-500/50' : 'opacity-40 hover:opacity-100'}`}
                            >
                              Falta
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Estado del Sello de Libreta del Día */}
                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleStudentStamp(student.id); }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                            stampInfo?.stamped
                              ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-700/60'
                              : 'bg-rose-950/60 text-rose-400 border border-rose-700/60'
                          }`}
                        >
                          <Stamp className="w-3 h-3" />
                          <span>{stampInfo?.stamped ? `Sellada (${stampInfo.page}) ✓` : 'Sin Sello ✗'}</span>
                        </button>

                        <button
                          onClick={(e) => { e.stopPropagation(); openMagicLinkModal(student); }}
                          className="text-[10px] text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-0.5 cursor-pointer"
                          title="Enviar Magic Link directo al padre de familia"
                        >
                          <Zap className="w-3 h-3 fill-cyan-400" />
                          <span>Magic Link</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Panel de Inspección Individual del Alumno Seleccionado */}
              <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-4`}>
                {selectedStudentForDossier ? (
                  <>
                    <div className="flex items-center gap-3 border-b pb-3 border-slate-800/60">
                      <img
                        src={getStudentAvatarUrl(selectedStudentForDossier)}
                        alt={selectedStudentForDossier.first_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500"
                      />
                      <div>
                        <h3 className="font-black text-sm md:text-base">
                          {getStudentFullName(selectedStudentForDossier)}
                        </h3>
                        <div className="text-xs opacity-60">Expediente de Aula • 1°A Secundaria</div>
                        <div className="text-xs text-emerald-400 font-bold mt-0.5">
                          92% Entregas Globales
                        </div>
                      </div>
                    </div>

                    {/* Historial Dinámico de Sellos de Libreta por Página */}
                    {(() => {
                      const studentStamp = stampedMap[selectedStudentForDossier.id];
                      const activeTodayPage = studentStamp?.page || todayStampPage;
                      const isStampedToday = !!studentStamp?.stamped;
                      const activePageNumber = activeTodayPage.includes(' - ') ? activeTodayPage.split(' - ')[0] : activeTodayPage;
                      const activePageTopic = activeTodayPage.includes(' - ') ? activeTodayPage.split(' - ').slice(1).join(' - ') : '';

                      // Historial dinámico de clases precedentes
                      const isCurrentP48 = activePageNumber.trim().toLowerCase() === 'pág. 48';
                      
                      const pastItems = isCurrentP48 ? [
                        { id: 'h-p45', page: 'Pág. 45', topic: 'Sistema de Coordenadas', defaultStatus: 'stamped' as const, dateLabel: '19 Oct' },
                        { id: 'h-p42', page: 'Pág. 42', topic: 'Fracciones Equivalentes', defaultStatus: (selectedStudentForDossier.id.includes('2') || selectedStudentForDossier.id.includes('5')) ? ('pending' as const) : ('stamped' as const), dateLabel: '17 Oct' },
                        { id: 'h-p39', page: 'Pág. 39', topic: 'Cálculo Mental', defaultStatus: 'stamped' as const, dateLabel: '15 Oct' }
                      ] : [
                        { id: 'h-p48', page: 'Pág. 48', topic: 'Ecuaciones Lineales', defaultStatus: 'stamped' as const, dateLabel: 'Sesión anterior' },
                        { id: 'h-p45', page: 'Pág. 45', topic: 'Sistema de Coordenadas', defaultStatus: 'stamped' as const, dateLabel: '19 Oct' },
                        { id: 'h-p42', page: 'Pág. 42', topic: 'Fracciones Equivalentes', defaultStatus: (selectedStudentForDossier.id.includes('2') || selectedStudentForDossier.id.includes('5')) ? ('pending' as const) : ('stamped' as const), dateLabel: '17 Oct' }
                      ];

                      return (
                        <div className="space-y-2">
                          <div className="text-xs font-black uppercase tracking-wider opacity-60 flex items-center justify-between">
                            <span>Historial de Sellos de Libreta:</span>
                            <span className="text-[10px] text-cyan-400 font-mono">Últimas 4 clases</span>
                          </div>

                          <div className="space-y-1.5 text-xs">
                            {/* Clase de Hoy (Sello Activo Registrado Dinámicamente) */}
                            <div 
                              onClick={() => toggleStudentStamp(selectedStudentForDossier.id)}
                              className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                                isStampedToday 
                                  ? 'bg-emerald-950/40 border-emerald-700/60 hover:bg-emerald-950/60' 
                                  : 'bg-rose-950/40 border-rose-700/60 hover:bg-rose-950/60'
                              }`}
                              title="Clic para conmutar sello de hoy"
                            >
                              <div className="flex items-center gap-2">
                                <Stamp className={`w-3.5 h-3.5 ${isStampedToday ? 'text-emerald-400' : 'text-rose-400'}`} />
                                <span className="font-bold text-white">
                                  {activePageNumber} (Hoy{activePageTopic ? ` - ${activePageTopic}` : ''})
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-black ${
                                  isStampedToday ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                }`}>
                                  {isStampedToday ? `Sellada (${studentStamp?.time || '09:12 AM'}) ✓` : 'No entregó ✗'}
                                </span>
                              </div>
                            </div>

                            {/* Clases Anteriores Registradas */}
                            {pastItems.map(item => {
                              const isRegularized = regularizedStampsMap[selectedStudentForDossier.id]?.[item.id];
                              const isStamped = isRegularized !== undefined ? isRegularized : item.defaultStatus === 'stamped';

                              return (
                                <div 
                                  key={item.id}
                                  onClick={() => {
                                    if (!isStamped) {
                                      setRegularizedStampsMap(prev => ({
                                        ...prev,
                                        [selectedStudentForDossier.id]: {
                                          ...(prev[selectedStudentForDossier.id] || {}),
                                          [item.id]: true
                                        }
                                      }));
                                    }
                                  }}
                                  className={`p-2 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between transition-all ${
                                    !isStamped ? 'hover:border-amber-500/60 cursor-pointer' : ''
                                  }`}
                                  title={!isStamped ? 'Clic para regularizar sello pendiente' : ''}
                                >
                                  <span className="font-bold text-slate-300">
                                    {item.page} ({item.topic})
                                  </span>
                                  <span className={`text-[11px] font-bold ${
                                    isStamped ? 'text-emerald-400' : 'text-rose-400 hover:text-amber-300'
                                  }`}>
                                    {isStamped ? (isRegularized ? 'Regularizado ✓' : 'Sellada ✓') : 'Pendiente de regularizar ✗'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}

                    {/* Botón de Enlace Inmediato */}
                    <div className="pt-2">
                      <button
                        onClick={() => openMagicLinkModal(selectedStudentForDossier)}
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>Notificar a Padres con Magic Link</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-12 text-center text-xs opacity-60 space-y-2">
                    <Users className="w-8 h-8 mx-auto opacity-40" />
                    <p>Haz clic en cualquier tarjeta de alumno para auditar su libreta y tareas históricas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            5. VISTA 3: AUDITORÍA DE ENTREGAS Y PORTAFOLIO EN ISKOOL
            ========================================================================= */}
        {activeTab === 'evidences' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
            
            <div className={`p-4 rounded-2xl border ${themeClasses.card} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div>
                <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-cyan-400" />
                  Auditoría de Entregas & Portafolio Digital ISkool
                </h2>
                <p className="text-xs opacity-70">
                  Revisión de proyectos, retos y evidencias entregadas en la plataforma por los alumnos.
                </p>
              </div>

              {/* Filtros de Estado de Evidencias */}
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setEvidenceFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${evidenceFilter === 'all' ? 'bg-cyan-500 text-slate-950' : 'opacity-60 hover:opacity-100'}`}
                >
                  Todas ({portfolioItems.length})
                </button>
                <button
                  onClick={() => setEvidenceFilter('pending')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${evidenceFilter === 'pending' ? 'bg-amber-400 text-slate-950' : 'opacity-60 hover:opacity-100'}`}
                >
                  Por Revisar
                </button>
                <button
                  onClick={() => setEvidenceFilter('approved')}
                  className={`px-3 py-1 rounded-lg font-bold cursor-pointer ${evidenceFilter === 'approved' ? 'bg-emerald-500 text-slate-950' : 'opacity-60 hover:opacity-100'}`}
                >
                  Aprobadas
                </button>
              </div>
            </div>

            {/* Cuadrícula de Evidencias Entregadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvidences.map(item => (
                <div key={item.id} className={`p-4 rounded-2xl border ${themeClasses.card} space-y-3`}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        item.status === 'approved' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' :
                        item.status === 'needs_revision' ? 'bg-rose-950/60 text-rose-400 border-rose-800' :
                        'bg-amber-950/60 text-amber-400 border-amber-800'
                      }`}>
                        {item.status === 'approved' ? 'Aprobada ✓' : item.status === 'needs_revision' ? 'Requiere Apoyo' : 'Pendiente de Revisión'}
                      </span>
                      <h4 className="font-bold text-sm mt-1">{item.title}</h4>
                    </div>

                    <span className="text-[10px] opacity-60 font-mono">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('es-MX') : 'Reciente'}
                    </span>
                  </div>

                  <p className="text-xs opacity-75 line-clamp-2">
                    {item.description}
                  </p>

                  {/* Acciones de Revisión de Evidencia */}
                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                    <span className="text-cyan-400 font-bold text-[11px]">
                      PDA SEP NEM Asociado
                    </span>

                    <button
                      onClick={() => alert(`Evidencia "${item.title}": Calificación formativa 10/10 registrada y sincronizada con el expediente escolar del alumno.`)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                      Aprobar (+50 XP)
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            6. VISTA 4: PLANEACIÓN CURRICULAR SEP NEM & BÓVEDA
            ========================================================================= */}
        {activeTab === 'planning' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
            <div className={`p-4 rounded-2xl border ${themeClasses.card} flex flex-col md:flex-row items-start md:items-center justify-between gap-3`}>
              <div>
                <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  Planificador Curricular SEP NEM & Bóveda Curricular
                </h2>
                <p className="text-xs opacity-70">
                  Estructuración pedagógica oficial SEP en tres momentos didácticos cronometrados.
                </p>
              </div>

              {/* Botón Estelar: Cargar esta Planeación en el Timeline de Hoy */}
              <button
                onClick={() => {
                  setActiveTab('timeline');
                  alert('¡Planeación cargada con éxito! Los 4 bloques didácticos de hoy han sido actualizados en tu Timeline activo.');
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Cargar esta Planeación en el Timeline de Hoy</span>
              </button>
            </div>

            {/* Ficha Desglosada de Planeación de Sesión */}
            <div className={`p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 font-bold">
                  Fase 6 (Secundaria)
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 font-bold text-cyan-400">
                  Saberes y Pensamiento Científico
                </span>
                <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 font-bold text-amber-400">
                  Ejes: Pensamiento Crítico & Inclusión
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[11px] font-black uppercase text-cyan-400">
                    PDA Oficial de la SEP:
                  </div>
                  <div className="text-xs md:text-sm font-bold text-slate-200 mt-0.5">
                    Modela y resuelve problemas de la vida económica comunitaria mediante ecuaciones lineales y proporcionalidad directa.
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="font-black text-emerald-400">Momento 1: Inicio (15 min)</span>
                    <p className="opacity-80">Pregunta detonadora con nota de compra real para conflicto cognitivo.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="font-black text-cyan-400">Momento 2: Desarrollo (30 min)</span>
                    <p className="opacity-80">Resolución de esquemas en equipos y sellado de la página 48 de la libreta.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1">
                    <span className="font-black text-amber-400">Momento 3: Cierre (15 min)</span>
                    <p className="opacity-80">Co-evaluación formativa rápida con rúbrica oficial y asignación de XP.</p>
                  </div>
                </div>
              </div>

              {onOpenPlanning && (
                <div className="pt-2 text-right">
                  <button
                    onClick={onOpenPlanning}
                    className="text-xs text-cyan-400 hover:underline font-bold inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>Abrir generador curricular completo (PlanningTab)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            7. VISTA 5: AULA GAMIFICADA (RULETA & GREMIOS SOBRIOS)
            ========================================================================= */}
        {activeTab === 'classroom' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
            <div className={`p-4 rounded-2xl border ${themeClasses.card} flex items-center justify-between`}>
              <div>
                <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
                  <Gamepad2 className="w-5 h-5 text-amber-400" />
                  Aula Gamificada & Convivencia Escolar Activa
                </h2>
                <p className="text-xs opacity-70">
                  Dinámicas de participación aleatoria y fomento del trabajo en equipo sin saturación visual.
                </p>
              </div>

              {isTimerRunning && (
                <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono font-black text-sm">
                  Tiempo de Respuesta: {timerSeconds}s
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              
              {/* Ruleta Concéntrica Sobria (Centro) */}
              <div className={`lg:col-span-2 p-6 rounded-2xl border ${themeClasses.card} text-center space-y-4`}>
                <div className="text-xs font-black uppercase tracking-wider opacity-60">
                  Ruleta de Turno de Participación
                </div>

                {/* Gráfico de Ruleta Sobria */}
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto flex items-center justify-center">
                  <div className={`w-full h-full rounded-full border-4 border-slate-700 bg-slate-900 shadow-xl flex items-center justify-center ${isSpinning ? 'animate-spin' : ''}`}>
                    <div className="grid grid-cols-2 w-full h-full rounded-full overflow-hidden opacity-80">
                      <div className="bg-slate-800/80 border border-slate-700/50" />
                      <div className="bg-cyan-950/60 border border-slate-700/50" />
                      <div className="bg-amber-950/60 border border-slate-700/50" />
                      <div className="bg-emerald-950/60 border border-slate-700/50" />
                    </div>
                  </div>
                  {/* Aguja Mecánica */}
                  <div className="absolute top-0 w-3 h-6 bg-amber-400 rounded-b-md shadow-md z-10" />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={handleSpinWheel}
                    disabled={isSpinning}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSpinning ? 'Girando ruleta...' : 'Girar Ruleta de Aula'}
                  </button>
                  <p className="text-[11px] opacity-60">
                    Selecciona al azar a un estudiante para la pregunta detonadora.
                  </p>
                </div>

                {selectedSpotlightStudent && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-amber-500/40 max-w-sm mx-auto flex items-center gap-3 text-left">
                    <img
                      src={getStudentAvatarUrl(selectedSpotlightStudent)}
                      alt={selectedSpotlightStudent.first_name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-400"
                    />
                    <div>
                      <div className="text-[10px] text-amber-400 uppercase font-black">Turno Activo:</div>
                      <div className="font-black text-xs text-white">
                        {getStudentFullName(selectedSpotlightStudent)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Gremios del Salón & Banco de Méritos */}
              <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-4`}>
                <div className="text-xs font-black uppercase tracking-wider opacity-60 border-b pb-2 border-slate-800/60">
                  Gremios de Aula & Méritos
                </div>

                {/* Gremios */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        🦅 Gremio Quetzal
                      </span>
                      <span className="text-amber-400 font-mono font-bold">350 XP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-400 h-full rounded-full" style={{ width: '70%' }} />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold flex items-center gap-1.5">
                        🐆 Gremio Jaguar
                      </span>
                      <span className="text-cyan-400 font-mono font-bold">420 XP</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-400 h-full rounded-full" style={{ width: '84%' }} />
                    </div>
                  </div>
                </div>

                {/* Banco de Méritos */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <div className="text-[11px] font-bold opacity-80">Asignar Recompensa Rápida:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => alert('¡+50 XP asignados por Pensamiento Crítico!')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold cursor-pointer transition-all"
                    >
                      💡 +50 XP Crítica
                    </button>
                    <button
                      onClick={() => alert('¡+30 XP asignados por Colaboración Fraterna!')}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-left text-[11px] font-bold cursor-pointer transition-all"
                    >
                      🤝 +30 XP Equipo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            8. VISTA 6: CENTRO DE ENLACE INSTITUCIONAL & MAGIC LINKS A PADRES
            ========================================================================= */}
        {activeTab === 'enlace' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
            
            {/* Aviso de Dirección General con Botón de Enterado */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black uppercase text-amber-400">
                    Aviso Oficial de Dirección & Coordinación
                  </div>
                  <div className="text-sm font-bold text-white">
                    Circular 04: Entrega de Boletas SEP y Acuerdos de Consejo Técnico Escolar (CTE)
                  </div>
                  <div className="text-[11px] opacity-60">
                    Dirección General solicita registrar las evaluaciones antes del viernes a las 14:00 hrs.
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setDirectionCircularConfirmed(true);
                  alert('Acuse registrado: Dirección General ha sido informada de que confirmaste la circular.');
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                  directionCircularConfirmed
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md'
                }`}
              >
                {directionCircularConfirmed ? '✓ Confirmado de Enterado' : 'Confirmar de Enterado'}
              </button>
            </div>

            {/* Despacho Reactivo de Incidencias & Magic Links Directos */}
            <div className={`p-5 rounded-2xl border ${themeClasses.card} space-y-4`}>
              <div className="border-b pb-3 border-slate-800/60 flex items-center justify-between">
                <div>
                  <h3 className="font-black text-base md:text-lg flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-cyan-400" />
                    Despacho de Incidencias & Magic Links Directos a Padres de Familia
                  </h3>
                  <p className="text-xs opacity-70">
                    Comunicación inmediata sin WhatsApp personal, con token cifrado y firma digital del tutor.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Selector de Alumno */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase opacity-60">Seleccionar Alumno:</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs font-bold text-white outline-hidden cursor-pointer"
                    onChange={(e) => {
                      const found = students.find(s => s.id === e.target.value);
                      if (found) setSelectedStudentForDossier(found);
                    }}
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {getStudentFullName(s)} (1°A)
                      </option>
                    ))}
                  </select>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                    <div className="opacity-60 text-[10px]">Tutor Registrado:</div>
                    <div className="font-bold text-white">Jorge Ramírez (Padre de Familia)</div>
                    <div className="text-[11px] text-emerald-400">Tel: +52 55 **** 8921 (WhatsApp Verificado)</div>
                  </div>
                </div>

                {/* Categoría y Redacción */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-black uppercase opacity-60">Tipo de Incidencia / Reporte:</label>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                    <button className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/60 text-cyan-300 font-bold text-[11px] text-center cursor-pointer">
                      Conducta
                    </button>
                    <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px] text-center cursor-pointer">
                      Tarea Pendiente
                    </button>
                    <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px] text-center cursor-pointer">
                      Mérito (+50 XP)
                    </button>
                    <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-bold text-[11px] text-center cursor-pointer">
                      Citatorio
                    </button>
                  </div>

                  <div className="space-y-1 pt-1">
                    <textarea
                      rows={2}
                      defaultValue="Estimado tutor: Se informa que en la sesión de hoy se revisó la libreta (Pág. 48) y el alumno mostró un avance sobresaliente en la resolución de ecuaciones."
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-hidden"
                    />
                  </div>

                  {/* Botones de Envío Directo con Magic Links */}
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <button
                      onClick={() => handleSendMagicLink(selectedStudentForDossier || students[0], 'whatsapp')}
                      className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Disparar Magic Link por WhatsApp Institucional</span>
                    </button>

                    <button
                      onClick={() => handleSendMagicLink(selectedStudentForDossier || students[0], 'sms')}
                      className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Enviar SMS Seguro</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bitácora de Trazabilidad en Tiempo Real */}
              <div className="pt-3 border-t border-slate-800/60 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider opacity-60">
                  Bitácora de Trazabilidad (Live Audit Trail):
                </div>

                <div className="space-y-1.5 text-xs">
                  {auditLogList.map(item => (
                    <div key={item.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.status === 'signed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <span className="font-bold text-white">{item.studentName}:</span>
                        <span className="opacity-80">{item.action}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] opacity-60">{item.time}</span>
                        {item.status === 'signed' ? (
                          <span className="text-emerald-400 font-bold text-[10px] bg-emerald-950 px-2 py-0.5 rounded-md border border-emerald-800">
                            Firmado de Enterado ✓
                          </span>
                        ) : (
                          <span className="text-amber-400 font-bold text-[10px] bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                            Entregado
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            9. VISTA 7: CONFIGURACIÓN VISUAL (MOTOR DE 4 TEMAS & PALETAS)
            ========================================================================= */}
        {activeTab === 'settings' && (
          <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto w-full animate-fade-in">
            <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-1`}>
              <h2 className="text-base md:text-lg font-black tracking-tight flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                Personalización de Interfaz & Motor de Paletas Cromáticas
              </h2>
              <p className="text-xs opacity-70">
                Selecciona la paleta que mejor se adapte a tu comodidad visual y tipo de aula.
              </p>
            </div>

            {/* 4 Tarjetas de Tema con Previsualización */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              
              {/* 1. Bóveda Carbón OLED */}
              <div 
                onClick={() => setTheme('carbon')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  theme === 'carbon' ? 'border-cyan-400 bg-cyan-950/20 shadow-lg' : 'border-slate-800 bg-[#070F1E] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-full h-16 rounded-xl bg-[#0B132B] border border-cyan-500/40 p-2 mb-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400">#070F1E OLED</div>
                </div>
                <div className="font-black text-sm text-white">Bóveda Carbón OLED</div>
                <div className="text-xs text-slate-400 mt-0.5">Pizarra oscura & cian neón (cero reflejos).</div>
              </div>

              {/* 2. Editorial Suizo (Modo Claro) */}
              <div 
                onClick={() => setTheme('suizo')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  theme === 'suizo' ? 'border-blue-600 bg-blue-50 shadow-lg' : 'border-slate-300 bg-[#F8FAFC] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-full h-16 rounded-xl bg-white border border-slate-300 p-2 mb-2 flex flex-col justify-between text-slate-900">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    <span className="w-2 h-2 rounded-full bg-rose-600" />
                  </div>
                  <div className="text-[10px] font-mono text-blue-600 font-bold">#F8FAFC Claro</div>
                </div>
                <div className="font-black text-sm text-slate-900">Editorial Suizo</div>
                <div className="text-xs text-slate-600 mt-0.5">Modo claro marfil con tipografía negra nítida.</div>
              </div>

              {/* 3. IBIME Heritage */}
              <div 
                onClick={() => setTheme('heritage')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  theme === 'heritage' ? 'border-amber-400 bg-red-950/40 shadow-lg' : 'border-red-950 bg-[#160808] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-full h-16 rounded-xl bg-[#220E0E] border border-amber-500/40 p-2 mb-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                  </div>
                  <div className="text-[10px] font-mono text-amber-400">#160808 Heritage</div>
                </div>
                <div className="font-black text-sm text-amber-50">IBIME Heritage</div>
                <div className="text-xs text-amber-200/60 mt-0.5">Borgoña institucional & acentos dorados.</div>
              </div>

              {/* 4. Bosque Esmeralda */}
              <div 
                onClick={() => setTheme('esmeralda')}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left ${
                  theme === 'esmeralda' ? 'border-emerald-400 bg-emerald-950/40 shadow-lg' : 'border-emerald-950 bg-[#051C14] opacity-70 hover:opacity-100'
                }`}
              >
                <div className="w-full h-16 rounded-xl bg-[#0A2E22] border border-emerald-500/40 p-2 mb-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="w-2 h-2 rounded-full bg-teal-400" />
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">#051C14 Antifatiga</div>
                </div>
                <div className="font-black text-sm text-emerald-50">Bosque Esmeralda</div>
                <div className="text-xs text-emerald-200/60 mt-0.5">Verde calmante para jornadas de 6+ horas.</div>
              </div>
            </div>

            {/* Escala Tipográfica */}
            <div className={`p-4 rounded-2xl border ${themeClasses.card} space-y-3`}>
              <div className="text-xs font-black uppercase tracking-wider opacity-60">
                Escala Tipográfica Adaptable:
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFontSize('compact')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${fontSize === 'compact' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Compacta (Laptops 13&quot;)
                </button>
                <button
                  onClick={() => setFontSize('standard')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${fontSize === 'standard' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Estándar 100%
                </button>
                <button
                  onClick={() => setFontSize('projector')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${fontSize === 'projector' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  Classroom Projector (125%)
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* =========================================================================
          10. MODAL DE MAGIC LINK INMEDIATO (DISPARO DIRECTO A PADRES)
          ========================================================================= */}
      {magicLinkModalStudent && (() => {
        const modalAtt = attendanceMap[magicLinkModalStudent.id] || 'present';
        const modalStamp = stampedMap[magicLinkModalStudent.id];
        const isModalStamped = !!modalStamp?.stamped;
        const modalStampPage = modalStamp?.page || todayStampPage;
        const modalPageNumber = modalStampPage.includes(' - ') ? modalStampPage.split(' - ')[0] : modalStampPage;
        
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://iskool.edu.mx';
        const generatedToken = `ml_${magicLinkModalStudent.id}_${Date.now().toString(36)}`;
        const fullMagicUrl = `${origin}/parent?student_id=${encodeURIComponent(magicLinkModalStudent.id)}&token=${generatedToken}&auth=magic`;

        return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className={`w-full max-w-md p-5 rounded-2xl border ${themeClasses.card} space-y-4 shadow-2xl`}>
              
              <div className="flex items-center justify-between border-b pb-3 border-slate-800/60">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-emerald-400 fill-emerald-400" />
                  <h3 className="font-black text-sm md:text-base">
                    Disparo de Magic Link Inmediato
                  </h3>
                </div>
                <button 
                  onClick={() => setMagicLinkModalStudent(null)}
                  className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Ficha Resumen que recibirá el Tutor */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center gap-3">
                  <img
                    src={getStudentAvatarUrl(magicLinkModalStudent)}
                    alt={magicLinkModalStudent.first_name}
                    className="w-10 h-10 rounded-full object-cover border border-cyan-400"
                  />
                  <div>
                    <div className="font-black text-white text-sm">
                      {getStudentFullName(magicLinkModalStudent)}
                    </div>
                    <div className="text-[11px] opacity-60">1°A Secundaria • Reporte Diario Oficial</div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="opacity-60">Asistencia Hoy:</span>
                    <span className={`font-bold ${
                      modalAtt === 'present' ? 'text-emerald-400' :
                      modalAtt === 'late' ? 'text-amber-400' :
                      modalAtt === 'absent' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {modalAtt === 'present' ? 'Presente (08:00 AM) ✓' :
                       modalAtt === 'late' ? 'Retardo (08:15 AM) ⚠' :
                       modalAtt === 'absent' ? 'Falta en Aula ✗' : 'Justificado ℹ'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60">Libreta Física:</span>
                    <span className={`font-bold ${isModalStamped ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isModalStamped ? `${modalPageNumber} Sellada ✓` : `${modalPageNumber} Sin Sello ✗`}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="opacity-60">Evidencias ISkool:</span>
                    <span className="text-cyan-400 font-bold">100% Al corriente</span>
                  </div>
                </div>

                {/* Destinatario y Teléfono */}
                <div className="pt-2 border-t border-slate-800 space-y-1 text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Tutor registrado:</span>
                    <span className="font-bold text-white">{magicLinkModalStudent.tutor_name || `Tutor de ${magicLinkModalStudent.first_name}`}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-700/80">
                    <Phone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <input
                      type="text"
                      value={modalCustomPhone}
                      onChange={(e) => setModalCustomPhone(e.target.value)}
                      placeholder="Teléfono (ej. 55-4160-8800)"
                      className="bg-transparent font-bold text-white text-xs outline-hidden w-full"
                    />
                  </div>
                </div>

                {/* Enlace Efímero con Botón Copiar */}
                <div className="pt-2 border-t border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span>Magic Link Efímero Generado:</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(fullMagicUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2500);
                      }}
                      className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedLink ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedLink ? '¡Enlace Copiado!' : 'Copiar Enlace'}</span>
                    </button>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono text-cyan-300 truncate select-all">
                    {fullMagicUrl}
                  </div>
                </div>
              </div>

              <p className="text-[11px] opacity-70 text-center">
                El tutor recibirá el enlace directo para firmar de enterado con un solo toque desde su dispositivo móvil.
              </p>

              {/* Botones de Envío Real */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => handleSendMagicLink(magicLinkModalStudent, 'whatsapp', modalCustomPhone)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-slate-950" />
                  <span>Enviar por WhatsApp Institucional</span>
                </button>

                <button
                  onClick={() => handleSendMagicLink(magicLinkModalStudent, 'sms', modalCustomPhone)}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Enviar por SMS Seguro</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
