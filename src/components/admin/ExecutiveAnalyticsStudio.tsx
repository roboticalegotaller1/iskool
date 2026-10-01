"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ArrowLeft, 
  Send, 
  Mic, 
  MicOff, 
  Paperclip, 
  Download, 
  Printer, 
  Check, 
  Copy, 
  Sparkles, 
  Bot, 
  Building2, 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  User, 
  Phone, 
  Mail, 
  BookOpen, 
  ShieldCheck, 
  X, 
  ExternalLink,
  Layers,
  GraduationCap,
  BarChart3,
  PieChart,
  Users,
  FolderOpen,
  AlertTriangle,
  ChevronDown,
  ArrowDown,
  Trash2,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  LayoutGrid,
  Table as TableIcon,
  Receipt
} from 'lucide-react';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { DETAILED_STUDENTS_SEED } from '@/store/seeds';
import { 
  isPlatformSuperUser, 
  resolveEffectiveSchoolId, 
  DetailedStudent, 
  FamilyBillingRecord,
  ROLE_HIERARCHY_LEVEL,
  UserRole
} from '@/types';
import { 
  executeAnalyticQuery, 
  AnalyticReportResult, 
  formatMXN, 
  Student360Detail 
} from '@/services/executiveAnalyticsEngine';
import ExecutiveChartVisualizer, { 
  DebtorItem, 
  matchStudentToCategory, 
  matchReportRowToCategory 
} from './ExecutiveChartVisualizer';
import { 
  StrategicDimensionModal, 
  StrategicDimensionDetailConfig,
  StrategicDimensionKey 
} from './StrategicDimensionModal';
import { ExecutiveManagerialBriefingCard } from './ExecutiveManagerialBriefingCard';
import { ExecutiveBoardReportDocument } from './ExecutiveBoardReportDocument';
import { useDeviceViewport } from '@/hooks/useDeviceViewport';

interface ExecutiveAnalyticsStudioProps {
  onBack?: () => void;
  initialQuery?: string;
  isEmbeddedView?: boolean;
  schoolId?: string;
  holdingName?: string;
  onNavigateTab?: (tabId: string) => void;
}

/**
 * Renderizador de formato enriquecido sin dependencias externas:
 * Procesa **negritas**, *cursivas*, y viñetas (•, -, *) con espaciado limpio y alto contraste institucional.
 */
function renderFormattedMarkdown(content?: string | null, isDark: boolean = false, isIbime: boolean = false) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const cleanText = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : trimmed;

        // Parse **bold** and *italic*
        const parts: React.ReactNode[] = [];
        const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(cleanText)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanText.substring(lastIndex, match.index));
          }
          if (match[2]) {
            // **bold**
            parts.push(
              <strong 
                key={`${lineIdx}-${match.index}`} 
                className={`font-black ${
                  isDark 
                    ? (isIbime ? 'text-red-200 font-extrabold' : 'text-cyan-300 font-bold') 
                    : (isIbime ? 'text-red-900 font-extrabold' : 'text-indigo-900 font-bold')
                }`}
              >
                {match[2]}
              </strong>
            );
          } else if (match[3]) {
            // *italic*
            parts.push(
              <em key={`${lineIdx}-${match.index}`} className={`italic ${isDark ? 'text-slate-200' : 'text-slate-600'}`}>
                {match[3]}
              </em>
            );
          }
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < cleanText.length) {
          parts.push(cleanText.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className={`flex items-start gap-2 pl-1.5 ${isDark ? 'text-white font-medium' : 'text-slate-800'}`}>
              <span className={`${isDark ? (isIbime ? 'text-[#E41B14]' : 'text-cyan-400') : (isIbime ? 'text-[#E41B14]' : 'text-indigo-600')} font-black select-none leading-normal shrink-0 text-base`}>•</span>
              <div className="flex-1 leading-snug">{parts}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className={`leading-snug ${isDark ? 'text-white font-medium' : 'text-slate-800'}`}>
            {parts}
          </p>
        );
      })}
    </div>
  );
}

/**
 * Renderizador de texto ejecutivo para documento impreso:
 * Formato limpio de alta legibilidad en papel blanco y tipografía oscura.
 */
function renderPrintMarkdown(content?: string | null) {
  if (!content) return null;
  const lines = content.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed text-slate-800">
      {lines.map((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={lineIdx} className="h-1" />;
        }

        const isBullet = trimmed.startsWith('•') || trimmed.startsWith('- ') || trimmed.startsWith('* ');
        const cleanText = isBullet ? trimmed.replace(/^[•\-*]\s*/, '') : trimmed;

        const parts: React.ReactNode[] = [];
        const regex = /(\*\*([^*]+)\*\*|\*([^*]+)\*)/g;
        let lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = regex.exec(cleanText)) !== null) {
          if (match.index > lastIndex) {
            parts.push(cleanText.substring(lastIndex, match.index));
          }
          if (match[2]) {
            parts.push(
              <strong key={`${lineIdx}-${match.index}`} className="font-bold text-slate-950">
                {match[2]}
              </strong>
            );
          } else if (match[3]) {
            parts.push(
              <em key={`${lineIdx}-${match.index}`} className="italic text-slate-700">
                {match[3]}
              </em>
            );
          }
          lastIndex = regex.lastIndex;
        }

        if (lastIndex < cleanText.length) {
          parts.push(cleanText.substring(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2 pl-1 text-slate-800">
              <span className="text-slate-900 font-bold select-none leading-normal shrink-0">•</span>
              <div className="flex-1 leading-snug">{parts}</div>
            </div>
          );
        }

        return (
          <p key={lineIdx} className="leading-snug text-slate-800">
            {parts}
          </p>
        );
      })}
    </div>
  );
}

export default function ExecutiveAnalyticsStudio({ 
  onBack, 
  initialQuery,
  isEmbeddedView = false,
  schoolId,
  holdingName,
  onNavigateTab
}: ExecutiveAnalyticsStudioProps) {
  const { user } = useAuth();
  const viewport = useDeviceViewport();
  const {
    institutionsList,
    activeSchoolId,
    selectSchool,
    campusesList,
    detailedStudents,
    groupsList,
    teachersList,
    attendanceList,
    billingRecords,
    staffPayroll,
    subjectsList,
    parentMessages,
    schedulesList,
    reconcileSeedsWithStore,
    studentDeletionAuditLogs,
    deleteStudent
  } = useSchoolAdminStore();

  // Permiso Directivo Estricto: Solo Directivos hacia arriba (director, owner, admin, superadmin) pueden eliminar alumnos
  const canDeleteStudent = Boolean(
    user && (
      user.role === 'superadmin' ||
      user.role === 'admin' ||
      user.role === 'owner' ||
      user.role === 'director' ||
      (ROLE_HIERARCHY_LEVEL[user.role as UserRole] !== undefined && ROLE_HIERARCHY_LEVEL[user.role as UserRole] <= 3)
    )
  );

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Traslado de colegio / Solicitud familiar');
  const [deletionToast, setDeletionToast] = useState<string | null>(null);

  const handleDeleteStudentFromDrawer = () => {
    if (!selectedStudentForDrawer) return;
    const studentToDelete = selectedStudentForDrawer.student;
    const operator = {
      id: user?.id || 'usr-admin-1',
      name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || 'Directivo ISkool',
      role: (user?.role as UserRole) || 'director',
      email: user?.email || 'directivo@iskool.edu.mx'
    };

    const result = deleteStudent(studentToDelete.id, {
      reason: deleteReason,
      operatorUser: operator
    });

    if (result.success) {
      setIsConfirmDeleteOpen(false);
      setShowDrawer(false);
      setSelectedStudentForDrawer(null);
      setDeletionToast(`✅ Alumno ${studentToDelete.first_name} ${studentToDelete.last_name_1} eliminado del sistema. Baja registrada con fecha y hora exacta en Super Usuario.`);
      setTimeout(() => setDeletionToast(null), 6000);
    }
  };

  useEffect(() => {
    reconcileSeedsWithStore?.();
    if (typeof window !== 'undefined') {
      (window as any).__useSchoolAdminStore = useSchoolAdminStore;
    }
  }, [reconcileSeedsWithStore]);

  const isSuperUser = useMemo(() => isPlatformSuperUser(user), [user]);
  const effectiveSchoolId = useMemo(() => {
    return resolveEffectiveSchoolId(user, activeSchoolId, 'sch-jjrosseau');
  }, [user, activeSchoolId]);

  // Selección de colegio: para Super Usuario puede ser 'all' o un id específico; para Dueño queda bloqueado a su colegio
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState<string>(
    schoolId || (isSuperUser ? (activeSchoolId || 'sch-test-case') : effectiveSchoolId)
  );

  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  useEffect(() => {
    if (schoolId) {
      setSelectedSchoolFilter(schoolId);
    }
  }, [schoolId]);

  useEffect(() => {
    if (initialQuery) {
      handleExecuteQuery(initialQuery);
    }
  }, [initialQuery]);

  const activeInstitution = useMemo(() => {
    return institutionsList.find(inst => inst.id === selectedSchoolFilter) || institutionsList[0];
  }, [institutionsList, selectedSchoolFilter]);

  useEffect(() => {
    if (!isSuperUser && user?.school_id) {
      setSelectedSchoolFilter(user.school_id);
    }
  }, [isSuperUser, user]);

  // Pool maestro unificado de estudiantes (estado activo + semillas del sistema)
  const masterStudentsPool: DetailedStudent[] = useMemo(() => {
    const pool: DetailedStudent[] = [...(detailedStudents || [])];
    const existingIds = new Set(pool.map(s => s.id));
    for (const seed of DETAILED_STUDENTS_SEED) {
      if (!existingIds.has(seed.id)) {
        pool.push(seed);
        existingIds.add(seed.id);
      }
    }
    return pool;
  }, [detailedStudents]);

  // Estado del layout
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'charts' | 'table' | 'edition'>('preview');

  // Estado del chat conversacional
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Historial de reporte activo
  const [currentReport, setCurrentReport] = useState<AnalyticReportResult | null>(null);
  const [reportTitle, setReportTitle] = useState('Estudiantes con adeudo activo por nivel y monto pendiente');
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  // Filtros interactivos sobre la tabla del reporte
  const [tableSearch, setTableSearch] = useState('');
  const [tableStatusFilter, setTableStatusFilter] = useState('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Modo de visualización del directorio homologado de expedientes: fichas 360° vs tabla detallada
  const [directoryViewMode, setDirectoryViewMode] = useState<'cards' | 'table'>('cards');

  // Detección reactiva de identidad institucional IBIME
  const isIbime = useMemo(() => {
    const sId = selectedSchoolFilter?.toLowerCase() || '';
    const instName = (activeInstitution?.name || '').toLowerCase();
    const instId = (activeInstitution?.id || '').toLowerCase();
    const instSlug = ((activeInstitution as any)?.slug || '').toLowerCase();
    const reportSchool = (currentReport?.schoolName || '').toLowerCase();
    return sId.includes('ibime') || instName.includes('ibime') || instId.includes('ibime') || instSlug.includes('ibime') || reportSchool.includes('ibime');
  }, [selectedSchoolFilter, activeInstitution, currentReport]);

  // Indicador de si el reporte actual contiene filas de alumnos/expedientes
  const hasStudentRows = useMemo(() => {
    if (!currentReport?.table?.rows) return false;
    return currentReport.table.rows.some((r: any) => 
      r.studentId || r.enrollmentId || r.studentName || (r.recordType && String(r.recordType).includes('Alumno'))
    );
  }, [currentReport]);

  // Drawer de ficha 360° de estudiante
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student360Detail | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Modal de desglose forense para dimensiones estratégicas del radar CEO
  const [strategicDimensionConfig, setStrategicDimensionConfig] = useState<StrategicDimensionDetailConfig | null>(null);

  const handleOpenStrategicDimension = (key: StrategicDimensionKey) => {
    switch (key) {
      case 'finanzas':
        setStrategicDimensionConfig({
          key: 'finanzas',
          title: 'Auditoría Forense de Cobranza y Liquidez',
          subtitle: 'Expedientes con saldo exigible vencido y análisis de flujo de caja',
          metric: '58.2% de Cobranza',
          target: '95.0% Meta Institucional',
          status: 'critical'
        });
        break;
      case 'curriculo':
        setStrategicDimensionConfig({
          key: 'curriculo',
          title: 'Auditoría Curricular NEM y Bilingüe',
          subtitle: 'Planeaciones docentes, PDAs oficiales SEP y rúbricas en Bóveda Curricular',
          metric: '64.0% de Adopción',
          target: '100% en Bóveda Curricular',
          status: 'warning'
        });
        break;
      case 'gamificacion':
        setStrategicDimensionConfig({
          key: 'gamificacion',
          title: 'Telemetría del Ecosistema LMS & Gamificación',
          subtitle: 'Retención estudiantil, micro-retos, economía de gemas y tienda de avatares',
          metric: '-18.4% Canje en Tienda',
          target: 'Canje Activo > 45%',
          status: 'warning'
        });
        break;
      case 'operacion':
        setStrategicDimensionConfig({
          key: 'operacion',
          title: 'Continuidad Técnica, Carga Docente y Operación',
          subtitle: 'Horas administrativas fuera de aula, uptime de infraestructura y nómina docente',
          metric: '6 Docentes Activos · 99.4% Uptime',
          target: '< 20 min carga administrativa',
          status: 'optimal'
        });
        break;
    }
  };

  // Referencia para SpeechRecognition y scroll a expedientes
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const expedientesSectionRef = useRef<HTMLDivElement | null>(null);
  const initialEffectiveQuery = useMemo(() => {
    if (initialQuery && initialQuery.trim()) return initialQuery.trim();
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('iskool_active_bi_query');
      if (saved && saved.trim()) return saved.trim();
    }
    return 'Estudiantes con adeudo activo por nivel y monto pendiente';
  }, [initialQuery]);

  const lastQueryRef = useRef<string>(initialEffectiveQuery);
  const isFirstMount = useRef(true);

  // Sincronización multi-pestaña y eventos en tiempo real (Cross-Tab & Local Event Realtime Sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'iskool_school_admin_store') {
        (useSchoolAdminStore as any).persist?.rehydrate();
      }
    };
    const handleCustomStoreSync = () => {
      (useSchoolAdminStore as any).persist?.rehydrate();
    };
    const handleRemoteQuery = (e: any) => {
      if (e.detail && typeof e.detail === 'string' && e.detail.trim()) {
        handleExecuteQuery(e.detail.trim());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('iskool_store_updated', handleCustomStoreSync);
    window.addEventListener('iskool_bi_execute_query', handleRemoteQuery);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('iskool_store_updated', handleCustomStoreSync);
      window.removeEventListener('iskool_bi_execute_query', handleRemoteQuery);
    };
  }, []);

  // Reevaluación en tiempo real ante cualquier cambio en el padrón de alumnos, adeudos, notas o asistencias (0 Tokens)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (!lastQueryRef.current) return;
    const targetSchool = isSuperUser ? selectedSchoolFilter : effectiveSchoolId;
    const result = executeAnalyticQuery(lastQueryRef.current, {
      schoolId: targetSchool,
      isSuperUser,
      institutionsList,
      detailedStudents,
      campusesList,
      groupsList,
      teachersList,
      attendanceList,
      billingRecords,
      staffPayroll,
      subjectsList,
      parentMessages,
      schedulesList,
      studentDeletionAuditLogs
    });

    setCurrentReport(result);
    setReportTitle(result.reportTitle);
    if (result.studentDetail && (result.table.totalRows || 0) <= 1) {
      setSelectedStudentForDrawer(result.studentDetail);
    }
  }, [
    detailedStudents,
    billingRecords,
    attendanceList,
    teachersList,
    subjectsList,
    parentMessages,
    isSuperUser,
    selectedSchoolFilter,
    effectiveSchoolId,
    institutionsList,
    campusesList,
    groupsList,
    staffPayroll,
    schedulesList,
    studentDeletionAuditLogs
  ]);

  // Inicializar motor de reconocimiento de voz del navegador (Web Speech API)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'es-MX';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInputText(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!speechSupported) {
      alert('Tu navegador no cuenta con soporte para dictado por voz. Puedes escribir tu consulta directamente.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setInputText('');
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Error starting speech:', err);
      }
    }
  };

  const toggleSpeakBriefing = (textToSpeak?: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }
    if (isSpeakingBriefing) {
      window.speechSynthesis.cancel();
      setIsSpeakingBriefing(false);
      return;
    }
    const content = textToSpeak || currentReport?.directAnswer || currentReport?.explanation.summary;
    if (!content) return;

    window.speechSynthesis.cancel();
    const cleanText = content
      .replace(/[*#_~`\[\]]/g, '')
      .replace(/•/g, '')
      .replace(/\|/g, ' ')
      .replace(/\n+/g, '. ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-MX';
    utterance.rate = 1.05;
    utterance.pitch = 0.98;

    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(v => v.lang.startsWith('es-MX')) ||
                    voices.find(v => v.lang.startsWith('es')) || null;
    if (esVoice) utterance.voice = esVoice;

    utterance.onend = () => setIsSpeakingBriefing(false);
    utterance.onerror = () => setIsSpeakingBriefing(false);

    setIsSpeakingBriefing(true);
    window.speechSynthesis.speak(utterance);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Función ejecutora de consultas locales (Cero Tokens)
  const handleExecuteQuery = (queryToRun?: string) => {
    const query = (queryToRun || inputText).trim();
    if (!query) return;

    lastQueryRef.current = query;
    setIsProcessing(true);
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    setTimeout(() => {
      const targetSchool = isSuperUser ? selectedSchoolFilter : effectiveSchoolId;
      const result = executeAnalyticQuery(query, {
        schoolId: targetSchool,
        isSuperUser,
        institutionsList,
        detailedStudents,
        campusesList,
        groupsList,
        teachersList,
        attendanceList,
        billingRecords,
        staffPayroll,
        subjectsList,
        parentMessages,
        schedulesList,
        studentDeletionAuditLogs
      });

      setCurrentReport(result);
      setReportTitle(result.reportTitle);
      setActiveTab('preview');
      setSelectedCategoryFilter(null);
      setIsProcessing(false);
      setInputText('');

      if (result.studentDetail && (result.table.totalRows || 0) <= 1) {
        setSelectedStudentForDrawer(result.studentDetail);
        const qLower = query.toLowerCase();
        if (
          qLower.includes('detalle') || 
          qLower.includes('ficha') || 
          qLower.includes('expediente') || 
          qLower.includes('edad') ||
          qLower.includes('joven')
        ) {
          setShowDrawer(true);
        }
      }

      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, 150);
  };

  // Ejecutar consulta inicial por defecto si se especifica o iniciar con el reporte prototipo de la imagen 2
  useEffect(() => {
    const defaultQuery = initialQuery || 'Estudiantes con adeudo activo por nivel y monto pendiente';
    handleExecuteQuery(defaultQuery);
  }, [selectedSchoolFilter]);

  // Manejador de click en fila de alumno o botón Ver Detalle
  const handleRowClick = (row: any) => {
    // 0. Si es un reporte del radar estratégico del CEO o la fila tiene dimensionKey / dimension
    if (currentReport?.domain === 'STRATEGIC_CEO_RADAR' || row?.dimensionKey || row?.dimension) {
      const dKey = row?.dimensionKey || 
        (String(row?.dimension).toLowerCase().includes('finanz') || String(row?.dimension).toLowerCase().includes('cobranz') ? 'finanzas' :
         String(row?.dimension).toLowerCase().includes('curr') || String(row?.dimension).toLowerCase().includes('acad') ? 'curriculo' :
         String(row?.dimension).toLowerCase().includes('gamif') || String(row?.dimension).toLowerCase().includes('lms') ? 'gamificacion' :
         String(row?.dimension).toLowerCase().includes('docent') || String(row?.dimension).toLowerCase().includes('operac') ? 'operacion' : null);
      
      if (dKey) {
        handleOpenStrategicDimension(dKey as StrategicDimensionKey);
        return;
      }
    }

    // 1. Si el reporte es de un solo alumno (STUDENT_LOOKUP) y cuenta con studentDetail y solo hay 1 fila
    if (currentReport?.domain === 'STUDENT_LOOKUP' && currentReport?.studentDetail && (currentReport?.table?.rows?.length || 0) <= 1) {
      setSelectedStudentForDrawer(currentReport.studentDetail);
      setShowDrawer(true);
      return;
    }

    // 2. Buscar por studentId o studentName en los datos de la fila
    const targetId = row?.studentId || row?.student_id;
    const targetName = row?.studentName || row?.student_name || (row?.recordType?.includes('Alumno') || row?.recordType?.includes('Ficha') ? row?.name : undefined);

    if (targetId || targetName) {
      handleOpenStudentExpediente(targetId, targetName);
      return;
    }

    // Si la fila no contiene referencia a un estudiante (ej. es un plantel o nómina)
    const cName = row?.campusName || (row?.recordType?.includes('Plantel') ? row?.name : undefined);
    if (cName) {
      handleExecuteQuery(`alumnos matriculados en plantel ${cName}`);
    } else if (row?.name?.includes('Israel')) {
      handleExecuteQuery('tutor de diego vargas');
    }
  };

  // Selección de categoría desde la gráfica interactiva (barras, columnas, dona)
  const handleSelectChartCategory = (category: string | null) => {
    setSelectedCategoryFilter(category);
    if (category) {
      // Si estamos en el Radar Estratégico del CEO, abrir la dimensión forense al dar click en la barra
      if (currentReport?.domain === 'STRATEGIC_CEO_RADAR') {
        const catLower = category.toLowerCase();
        if (catLower.includes('finanz') || catLower.includes('cobranz')) {
          handleOpenStrategicDimension('finanzas');
          return;
        } else if (catLower.includes('curr') || catLower.includes('nem')) {
          handleOpenStrategicDimension('curriculo');
          return;
        } else if (catLower.includes('gamif') || catLower.includes('lms') || catLower.includes('retenc')) {
          handleOpenStrategicDimension('gamificacion');
          return;
        } else if (catLower.includes('operac') || catLower.includes('docent') || catLower.includes('continu')) {
          handleOpenStrategicDimension('operacion');
          return;
        }
      }

      setTimeout(() => {
        expedientesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 80);
    }
  };

  // Apertura directa de expediente 360° desde la gráfica, tabla o tarjetas
  const handleOpenStudentExpediente = (studentId?: string, studentName?: string) => {
    // 1. Si el reporte ya cuenta con studentDetail cargado (exclusivo para reportes de 1 solo alumno)
    if (currentReport?.studentDetail && (currentReport?.table?.rows?.length || 0) <= 1) {
      if (!studentId && !studentName) {
        setSelectedStudentForDrawer(currentReport.studentDetail);
        setShowDrawer(true);
        return;
      }
      const st = currentReport.studentDetail.student;
      if (
        (studentId && st?.id === studentId) ||
        (studentName && `${st?.first_name} ${st?.last_name_1}`.toLowerCase().includes(studentName.toLowerCase()))
      ) {
        setSelectedStudentForDrawer(currentReport.studentDetail);
        setShowDrawer(true);
        return;
      }
    }

    // 2. Pool maestro unificado: detailedStudents del store + DETAILED_STUDENTS_SEED
    const masterPool = masterStudentsPool;

    const targetNameClean = studentName ? studentName.trim().toLowerCase() : '';
    let studentMatch = masterPool.find(s => {
      if (studentId && s.id === studentId) return true;
      if (!targetNameClean) return false;
      const sFullName = `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.replace(/\s+/g, ' ').trim().toLowerCase();
      const sShortName = `${s.first_name} ${s.last_name_1}`.toLowerCase();
      if (sFullName === targetNameClean || targetNameClean.includes(sShortName) || sFullName.includes(targetNameClean)) {
        return true;
      }
      const sFirst = s.first_name.toLowerCase();
      const sLast1 = s.last_name_1.toLowerCase();
      if (targetNameClean.includes(sFirst) && targetNameClean.includes(sLast1)) {
        return true;
      }
      return false;
    });

    // 3. Si no se encontró en el pool maestro pero está en las filas de la tabla activa
    if (!studentMatch && currentReport?.table?.rows) {
      const matchingRow = currentReport.table.rows.find((r: any) => 
        (studentId && (r.studentId === studentId || r.student_id === studentId)) ||
        (targetNameClean && (
          (r.studentName && String(r.studentName).toLowerCase().includes(targetNameClean)) ||
          (r.name && String(r.name).toLowerCase().includes(targetNameClean))
        ))
      );

      if (matchingRow) {
        const rowName = matchingRow.studentName || matchingRow.name || studentName || 'Estudiante';
        const nameParts = String(rowName).split(' ');
        studentMatch = {
          id: matchingRow.studentId || matchingRow.student_id || studentId || `std-${Date.now()}`,
          first_name: nameParts[0] || 'Estudiante',
          second_name: nameParts.length > 2 ? nameParts[1] : '',
          last_name_1: nameParts.length > 1 ? (nameParts.length > 2 ? nameParts[2] : nameParts[1]) : '',
          last_name_2: nameParts.length > 3 ? nameParts[3] : '',
          curp: matchingRow.referenceId || matchingRow.curp || 'CURP-DOC-001',
          enrollment_id: matchingRow.enrollmentId || matchingRow.referenceId || 'MAT-2026',
          birth_date: matchingRow.birthDateStr || matchingRow.birthDate || '2014-05-18',
          gender: 'M',
          blood_type: matchingRow.bloodType || 'O+',
          medical_notes: matchingRow.medicalNotes || (matchingRow.matchedField?.includes('Alerg') ? matchingRow.matchedField : 'Sin notas clínicas reportadas'),
          academic_notes: matchingRow.academicNotes || matchingRow.matchedField || 'Estudiante con desempeño regular.',
          address: matchingRow.address || 'Domicilio familiar registrado en plantel',
          phone: matchingRow.phone || matchingRow.emergencyContactPhone || '555-987-2000',
          emergency_contact_name: matchingRow.emergencyContactName || matchingRow.tutorName || 'Tutor Registrado',
          emergency_contact_phone: matchingRow.emergencyContactPhone || matchingRow.phone || '555-987-2000',
          tutor_name: matchingRow.tutorName || matchingRow.parentContact || 'Tutor Familiar',
          scholarship_type: matchingRow.scholarshipType || 'Beca Institucional',
          scholarship_percentage: matchingRow.scholarshipPercentage || 50,
          campus_id: matchingRow.campusId || 'camp-test-1',
          campus_name: matchingRow.campusName || 'Plantel Principal',
          school_id: matchingRow.schoolId || selectedSchoolFilter || 'sch-test-case',
          level: (matchingRow.level || matchingRow.levelGrade?.split(' - ')[0] || 'primaria').toLowerCase() as any,
          grade: matchingRow.grade || matchingRow.levelGrade?.split(' - ')[1] || '1º',
          group_id: matchingRow.groupId || 'A',
          shift: matchingRow.shift || 'Matutino',
          status: 'activo'
        };
      }
    }

    if (studentMatch) {
      const studentBilling = billingRecords.filter(b => 
        b.studentId === studentMatch!.id || 
        b.studentName.toLowerCase().includes(studentMatch!.first_name.toLowerCase())
      );
      const studentAtt = attendanceList.filter(a => a.student_id === studentMatch!.id);
      const totalDebt = studentBilling.filter(b => b.status !== 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const totalPaid = studentBilling.filter(b => b.status === 'paid').reduce((sum, b) => sum + Number(b.amount), 0);
      const totalClasses = studentAtt.length || 1;
      const presentes = studentAtt.filter(a => a.status === 'presente').length;
      const faltas = studentAtt.filter(a => a.status === 'falta').length;
      const retardos = studentAtt.filter(a => a.status === 'retardo').length;
      const justificados = studentAtt.filter(a => a.status === 'justificado').length;

      setSelectedStudentForDrawer({
        student: studentMatch,
        billingRecords: studentBilling,
        totalDebt,
        totalPaid,
        attendanceStats: {
          totalClasses,
          presentes,
          faltas,
          retardos,
          justificados,
          attendanceRate: (presentes / totalClasses) * 100
        }
      });
      setShowDrawer(true);
      return;
    }

    // 4. Fallback si no hay coincidencia directa pero hay alumnos en el reporte
    if (currentReport?.table?.rows && currentReport.table.rows.length > 0) {
      const firstRow = currentReport.table.rows[0];
      if (firstRow.studentId || firstRow.studentName) {
        handleOpenStudentExpediente(firstRow.studentId, firstRow.studentName);
        return;
      }
    }

    // 5. Fallback final al primer estudiante del pool maestro
    if (masterPool.length > 0) {
      const first = masterPool[0];
      handleOpenStudentExpediente(first.id, `${first.first_name} ${first.last_name_1}`);
    }
  };

  // Lista unificada de deudores para visualizar en la parte baja de la gráfica
  // SOLO se muestra cuando la consulta o reporte activo corresponde efectivamente a adeudos y cobranza
  const reportDebtors: DebtorItem[] = useMemo(() => {
    if (!currentReport) return [];

    const isDebtDomain = currentReport.domain === 'DEBTS_BILLING';
    const titleLower = (currentReport.reportTitle || '').toLowerCase();
    const isDebtTitle = 
      titleLower.includes('adeudo') || 
      titleLower.includes('deudor') || 
      titleLower.includes('moros') || 
      titleLower.includes('colegiatura');

    // Si la consulta actual no es de cobranza / adeudos, no mostrar tarjetas de deudores al pie de la gráfica
    if (!isDebtDomain && !isDebtTitle) {
      return [];
    }

    // A. Si el reporte actual es de cobranza o contiene filas con adeudos
    if (currentReport.table?.rows && currentReport.table.rows.length > 0) {
      const rowsWithDebt = currentReport.table.rows.filter(r => {
        const hasStatus = r.status && (String(r.status).toLowerCase().includes('vencid') || String(r.status).toLowerCase().includes('pendient'));
        const hasDebtAmount = Number(r.pendingAmount || r.amount || r.debt || 0) > 0;
        return isDebtDomain || hasStatus || hasDebtAmount;
      });

      if (rowsWithDebt.length > 0) {
        return rowsWithDebt.map(r => ({
          studentId: r.studentId || r.student_id,
          studentName: r.studentName || r.student_name || r.name || 'Estudiante',
          level: r.level || r.educationalLevel,
          gradeGroup: r.gradeGroup || r.grade || r.group,
          concept: r.concept || r.description || 'Colegiatura Mensual',
          amount: Number(r.pendingAmount || r.amount || r.debt || 0),
          dueDate: r.dueDate || r.date,
          status: r.status || 'Pendiente',
          parentContact: r.parentContact || r.tutor || r.parentName
        }));
      }
    }

    // B. Fallback: Obtener deudores registrados en cobranza del colegio únicamente en consultas de cobranza
    const pendingBills = (billingRecords || []).filter(b => b.status !== 'paid');
    if (pendingBills.length > 0) {
      return pendingBills.map(b => {
        const student = detailedStudents.find(s => 
          s.id === b.studentId || 
          `${s.first_name} ${s.last_name_1}`.toLowerCase() === b.studentName.toLowerCase()
        );
        return {
          studentId: b.studentId || student?.id,
          studentName: b.studentName,
          level: student?.level || b.level || 'Primaria',
          gradeGroup: b.grade ? `${b.grade} ${b.group || ''}`.trim() : (student ? `${student.grade}` : '1º A'),
          concept: b.concept || 'Colegiatura Escolar',
          amount: Number(b.amount || 0),
          dueDate: b.dueDate,
          status: b.status === 'overdue' ? 'Vencido' : 'Pendiente',
          parentContact: b.parentName ? `${b.parentName} (${b.parentPhone || ''})` : undefined
        };
      });
    }

    return [];
  }, [currentReport, billingRecords, detailedStudents]);


  // Copiar resumen de consulta al portapapeles
  const handleCopySummary = () => {
    if (!currentReport) return;
    const textToCopy = `Reporte: ${currentReport.reportTitle}\nInstitución: ${currentReport.schoolName}\nFecha: ${currentReport.generatedAt}\nResumen: ${currentReport.explanation.summary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  // Exportar datos a CSV
  const handleExportCSV = () => {
    if (!currentReport || !currentReport.table.rows.length) return;
    const columns = currentReport.table.columns;
    const header = columns.map(c => `"${c.label}"`).join(',');
    const rows = currentReport.table.rows.map(row => {
      return columns.map(c => `"${row[c.key] ?? ''}"`).join(',');
    });
    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${currentReport.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrado reactivo de la tabla de datos
  const filteredTableRows = useMemo(() => {
    if (!currentReport) return [];
    let rows = currentReport.table.rows;

    if (selectedCategoryFilter) {
      const catFiltered = rows.filter((r: any) => matchReportRowToCategory(r, selectedCategoryFilter));
      if (catFiltered.length > 0) {
        rows = catFiltered;
      } else {
        const matchingMaster = masterStudentsPool.filter(s => matchStudentToCategory(s, selectedCategoryFilter));
        if (matchingMaster.length > 0) {
          rows = matchingMaster.map(s => ({
            id: s.id,
            studentId: s.id,
            enrollmentId: s.enrollment_id || s.id.slice(0, 8).toUpperCase(),
            studentName: `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.replace(/\s+/g, ' ').trim(),
            name: `${s.first_name} ${s.last_name_1}`,
            level: s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria',
            grade: s.grade || '1º',
            levelGrade: `${s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria'} ${s.grade || '1º'}`,
            campus: s.campus_name || 'Plantel Principal',
            campus_name: s.campus_name || 'Plantel Principal',
            tutor: s.tutor_name || s.father_name || s.mother_name || 'No registrado',
            phone: s.emergency_contact_phone || s.phone || 'No registrado',
            status: s.status || 'Activo',
            recordType: 'Expediente Alumno'
          }));
        }
      }
    }

    return rows.filter(row => {
      const matchesSearch = tableSearch === '' || Object.values(row).some(val => 
        String(val).toLowerCase().includes(tableSearch.toLowerCase())
      );
      const matchesStatus = tableStatusFilter === 'all' || 
        String(row.status || '').toLowerCase() === tableStatusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [currentReport, selectedCategoryFilter, tableSearch, tableStatusFilter, masterStudentsPool]);

  // Columnas activas adaptativas (si se muestran alumnos desde el filtro de categoría)
  const activeTableColumns = useMemo(() => {
    if (!currentReport) return [];
    const isShowingResolvedStudents = selectedCategoryFilter && filteredTableRows.length > 0 && filteredTableRows.some((r: any) => r.studentId && r.enrollmentId);
    const originalHasStudentColumns = currentReport.table.columns.some(c => c.key === 'studentName' || c.key === 'enrollmentId');

    if (isShowingResolvedStudents && !originalHasStudentColumns) {
      return [
        { key: 'enrollmentId', label: 'Matrícula' },
        { key: 'studentName', label: 'Estudiante' },
        { key: 'levelGrade', label: 'Nivel y Grado' },
        { key: 'campus', label: 'Plantel' },
        { key: 'tutor', label: 'Tutor Familiar' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'status', label: 'Estatus' }
      ];
    }

    return currentReport.table.columns;
  }, [currentReport, selectedCategoryFilter, filteredTableRows]);

  const currentInstitutionObj = institutionsList.find(i => i.id === selectedSchoolFilter) || institutionsList[0];

  // Renderizado de tabla de datos tabulares (reutilizable y homologado)
  const renderDataTable = (isCompact: boolean = false) => {
    if (!currentReport) return null;

    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
          <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input aria-label="Buscar en el reporte..."
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Buscar por estudiante, nivel, folio o concepto..."
              className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-600 font-medium">Estado:</span>
            <select aria-label="Seleccionar opción"
              value={tableStatusFilter}
              onChange={(e) => setTableStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none text-xs"
            >
              <option value="all">Todos los registros</option>
              <option value="pendiente">Pendientes</option>
              <option value="vencido">Vencidos</option>
              <option value="liquidado">Liquidados / Pagados</option>
            </select>

            <span className="text-slate-500 font-mono text-[11px]">
              Mostrando {filteredTableRows.length} de {currentReport.table.totalRows}
            </span>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        <div 
          className="overflow-x-auto overflow-y-auto custom-scrollbar"
          style={{ maxHeight: isCompact ? `${viewport.tableMaxHeight}px` : `min(${viewport.tableMaxHeight + 160}px, 68vh)` }}
        >
          <table className="w-full text-left text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100/95 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px] shadow-xs backdrop-blur-sm">
              <tr>
                {activeTableColumns.map((col) => (
                  <th 
                    key={col.key} 
                    className={`py-3 px-4 ${col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')}`}
                  >
                    {col.label}
                  </th>
                ))}
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTableRows.length === 0 ? (
                <tr>
                  <td colSpan={activeTableColumns.length + 1} className="py-8 text-center text-slate-500">
                    No se encontraron registros que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredTableRows.map((row, rowIdx) => (
                  <tr 
                    key={rowIdx} 
                    onClick={() => handleRowClick(row)}
                    className="hover:bg-slate-50 transition cursor-pointer group"
                  >
                    {activeTableColumns.map((col) => {
                      const val = row[col.key];

                      if (col.isCurrency) {
                        return (
                          <td key={col.key} className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                            {formatMXN(Number(val) || 0)}
                          </td>
                        );
                      }

                      if (col.isBadge) {
                        const statusStr = String(val).toLowerCase();
                        const isBad = statusStr.includes('vencido') || statusStr.includes('falta') || statusStr.includes('atención');
                        const isGood = statusStr.includes('liquidado') || statusStr.includes('presente') || statusStr.includes('superávit') || statusStr.includes('dispersado');
                        
                        return (
                          <td key={col.key} className="py-3 px-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isBad 
                                ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                                : (isGood 
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                                    : 'bg-amber-50 border border-amber-200 text-amber-700')
                            }`}>
                              {val}
                            </span>
                          </td>
                        );
                      }

                      return (
                        <td 
                          key={col.key} 
                          className={`py-3 px-4 ${col.align === 'center' ? 'text-center' : ''} text-slate-700 font-medium`}
                        >
                          {val ?? '-'}
                        </td>
                      );
                    })}

                    <td className="py-3 px-4 text-right">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(row);
                        }}
                        className={`text-[11px] font-bold hover:underline flex items-center gap-1 ml-auto cursor-pointer ${
                          isIbime ? 'text-[#E41B14] hover:text-[#C01D0C]' : 'text-indigo-600 hover:text-indigo-800'
                        }`}
                      >
                        <span>
                          {row.studentId || row.studentName 
                            ? 'Ver expediente' 
                            : (row.campusName || row.name ? 'Ver alumnos' : (row.netSalary ? 'Ver recibo' : 'Ver detalle'))}
                        </span>
                        <ExternalLink className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Renderizado del directorio interactivo de expedientes escolares coincidentes homologado
  const renderExpedientesGrid = () => {
    if (!currentReport || !currentReport.table?.rows || currentReport.table.rows.length === 0) return null;

    if (!hasStudentRows && !selectedCategoryFilter) return null;

    const isAllergySearch = currentReport.queryReceived.toLowerCase().includes('alerg') || (currentReport.reportTitle || '').toLowerCase().includes('alerg');

    // Filtrar por categoría seleccionada si está activa
    let displayedRows = currentReport.table.rows;
    if (selectedCategoryFilter) {
      if (hasStudentRows) {
        const filtered = currentReport.table.rows.filter((r: any) => matchReportRowToCategory(r, selectedCategoryFilter));
        if (filtered.length > 0) {
          displayedRows = filtered;
        } else {
          const matchingMaster = masterStudentsPool.filter(s => matchStudentToCategory(s, selectedCategoryFilter));
          if (matchingMaster.length > 0) {
            displayedRows = matchingMaster.map(s => ({
              studentId: s.id,
              enrollmentId: s.enrollment_id || s.id.slice(0, 8).toUpperCase(),
              studentName: `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.replace(/\s+/g, ' ').trim(),
              name: `${s.first_name} ${s.last_name_1}`,
              level: s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria',
              grade: s.grade || '1º',
              levelGrade: `${s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria'} ${s.grade || '1º'}`,
              campus: s.campus_name || 'Plantel Principal',
              campus_name: s.campus_name || 'Plantel Principal',
              tutor: s.tutor_name || s.father_name || s.mother_name || 'No registrado',
              phone: s.emergency_contact_phone || s.phone || 'No registrado',
              status: s.status || 'Activo',
              recordType: 'Expediente Alumno'
            }));
          }
        }
      } else {
        const matchingMaster = masterStudentsPool.filter(s => matchStudentToCategory(s, selectedCategoryFilter));
        if (matchingMaster.length === 0) return null;
        displayedRows = matchingMaster.map(s => ({
          studentId: s.id,
          enrollmentId: s.enrollment_id || s.id.slice(0, 8).toUpperCase(),
          studentName: `${s.first_name} ${s.second_name || ''} ${s.last_name_1} ${s.last_name_2 || ''}`.replace(/\s+/g, ' ').trim(),
          name: `${s.first_name} ${s.last_name_1}`,
          level: s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria',
          grade: s.grade || '1º',
          levelGrade: `${s.level ? (s.level.charAt(0).toUpperCase() + s.level.slice(1)) : 'Primaria'} ${s.grade || '1º'}`,
          campus: s.campus_name || 'Plantel Principal',
          campus_name: s.campus_name || 'Plantel Principal',
          tutor: s.tutor_name || s.father_name || s.mother_name || 'No registrado',
          phone: s.emergency_contact_phone || s.phone || 'No registrado',
          status: s.status || 'Activo',
          recordType: 'Expediente Alumno'
        }));
      }
    }

    return (
      <div 
        ref={expedientesSectionRef} 
        className={`rounded-2xl p-5 shadow-lg space-y-4 border ${
          isIbime 
            ? 'bg-gradient-to-br from-[#0F2744] via-[#123055] to-[#17426D] border-[#E41B14]/30 text-white' 
            : 'bg-slate-900/95 border-white/10 text-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
              isIbime 
                ? 'bg-[#E41B14]/20 border border-[#E41B14]/40 text-red-300' 
                : 'bg-indigo-500/20 border border-indigo-500/30 text-indigo-400'
            }`}>
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>Directorio Homologado de Alumnos</span>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  isIbime 
                    ? 'bg-[#E41B14]/25 text-red-200 border border-[#E41B14]/40' 
                    : 'bg-indigo-500/20 text-indigo-300'
                }`}>
                  {displayedRows.length} {displayedRows.length === 1 ? 'registro' : 'registros'}
                </span>
              </h3>
              <p className="text-xs text-slate-300">
                Vista institucional homologada. Consulta los expedientes en tarjetas o en tabla detallada.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Conmutador de Vista: Fichas 360° vs Tabla Detallada */}
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/10">
              <button
                type="button"
                onClick={() => setDirectoryViewMode('cards')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  directoryViewMode === 'cards'
                    ? (isIbime ? 'bg-[#E41B14] text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span>Fichas 360°</span>
              </button>
              <button
                type="button"
                onClick={() => setDirectoryViewMode('table')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  directoryViewMode === 'table'
                    ? (isIbime ? 'bg-[#E41B14] text-white shadow-xs' : 'bg-indigo-600 text-white shadow-xs')
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <TableIcon className="h-3.5 w-3.5" />
                <span>Tabla Detallada</span>
              </button>
            </div>

            <div className="text-xs text-slate-300 bg-white/5 px-3 py-1.5 rounded-lg font-medium self-start sm:self-auto border border-white/5 hidden md:block">
              Criterio: <span className="text-cyan-300 font-mono font-bold">{currentReport.queryReceived}</span>
            </div>
          </div>
        </div>

        {selectedCategoryFilter && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-black/40 via-white/5 to-black/40 border border-white/15 rounded-xl text-xs shadow-md">
            <div className="flex items-center gap-2 text-slate-200">
              <Filter className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>
                Filtrando directorio por gráfica: <strong className="text-cyan-300 font-bold">{selectedCategoryFilter}</strong> ({displayedRows.length} {displayedRows.length === 1 ? 'expediente' : 'expedientes'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter(null)}
              className="text-[11px] text-cyan-300 hover:text-white flex items-center gap-1 font-semibold px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 transition cursor-pointer border border-white/10"
            >
              <X className="h-3 w-3" />
              <span>Ver todos ({currentReport.table.rows.length})</span>
            </button>
          </div>
        )}

        {/* CONTENIDO SEGÚN MODO DE VISTA: FICHAS O TABLA */}
        {directoryViewMode === 'table' ? (
          <div className="pt-1">
            {renderDataTable(true)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {displayedRows.map((row: any, idx: number) => {
              const studentId = row.studentId || row.student_id;
              const studentName = row.studentName || row.name || 'Estudiante';
              const enrollmentId = row.enrollmentId || row.referenceId || row.folio || 'MAT-2026';
              const levelGrade = row.levelGrade || `${row.level || 'Primaria'} ${row.grade || '1º'}`;
              const age = row.age || 'N/D';
              const birthDate = row.birthDateStr || row.birthDate || '';
              
              // Información Financiera y de Cobranza (Homologación)
              const debtAmount = Number(row.debtAmount ?? row.amount ?? row.montoAdeudado ?? row.monto ?? 0);
              const concept = row.concept || row.concepto || '';
              const dueDate = row.dueDate || row.vencimiento || '';
              const receiptFolio = row.folio || row.receiptFolio || '';
              const hasDebtInfo = Boolean(debtAmount > 0 || concept || dueDate || receiptFolio);

              const scholarshipNotes = row.scholarshipNotes || (
                (row.scholarshipPercentage && row.scholarshipPercentage > 0)
                  ? `Beca ${String(row.scholarshipType || 'Escolar').toUpperCase()} (${row.scholarshipPercentage}%)`
                  : (row.matchedField && String(row.matchedField).toLowerCase().includes('beca') ? row.matchedField : undefined)
              );
              const scholarshipPercentage = row.scholarshipPercentage || 0;

              const rawMedical = row.medicalNotes || (
                row.matchedField && (
                  String(row.matchedField).toLowerCase().includes('alerg') || 
                  String(row.matchedField).toLowerCase().includes('condición') ||
                  String(row.matchedField).toLowerCase().includes('médic') ||
                  String(row.matchedField).toLowerCase().includes('asma') ||
                  String(row.matchedField).toLowerCase().includes('inhalador')
                )
                  ? row.matchedField 
                  : undefined
              );
              const medicalNotes = (rawMedical && !String(rawMedical).toLowerCase().includes('beca')) ? rawMedical : undefined;
              const bloodType = row.bloodType || '';
              const tutor = row.tutorName || row.tutorContact || row.parentContact || 'Tutor Familiar';
              const phone = row.emergencyContactPhone || row.phone || 'N/D';
              const campus = row.campusName || 'Plantel Principal';
              const status = row.status || 'Al Corriente';
              const isOverdue = String(status).toLowerCase().includes('adeudo') || String(status).toLowerCase().includes('vencid');

              return (
                <div 
                  key={idx}
                  onClick={() => handleOpenStudentExpediente(studentId, studentName)}
                  className={`bg-white hover:bg-slate-50 border rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden ${
                    isIbime ? 'border-slate-200 hover:border-[#E41B14]' : 'border-slate-200 hover:border-indigo-400'
                  }`}
                >
                  {/* Header de la tarjeta */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                        isIbime 
                          ? 'bg-[#0F2744]/10 border border-[#0F2744]/20 text-[#0F2744]' 
                          : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                      }`}>
                        {String(studentName).split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold text-slate-900 transition truncate ${
                          isIbime ? 'group-hover:text-[#E41B14]' : 'group-hover:text-indigo-600'
                        }`}>
                          {studentName}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                          <span className={`font-mono font-bold ${isIbime ? 'text-[#0F2744]' : 'text-indigo-600'}`}>
                            {enrollmentId}
                          </span>
                          <span>·</span>
                          <span>{levelGrade}</span>
                        </div>
                      </div>
                    </div>

                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                      isOverdue 
                        ? 'bg-rose-50 border border-rose-200 text-rose-700' 
                        : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                    }`}>
                      {status}
                    </span>
                  </div>

                  {/* Detalle Exigible / Cobro Homologado */}
                  {hasDebtInfo && (
                    <div className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                      isIbime 
                        ? 'bg-rose-50/60 border-rose-200 text-rose-950' 
                        : 'bg-amber-50/70 border-amber-200 text-amber-950'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          <span>Adeudo Exigible</span>
                        </span>
                        {debtAmount > 0 && (
                          <span className="font-mono font-black text-rose-700 text-xs">
                            {formatMXN(debtAmount)}
                          </span>
                        )}
                      </div>
                      {concept && (
                        <p className="text-[11px] font-medium leading-snug text-slate-800">
                          {concept}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                        {receiptFolio && <span>Folio: <strong className="text-slate-700">{receiptFolio}</strong></span>}
                        {dueDate && <span>Vence: <strong className="text-slate-700">{dueDate}</strong></span>}
                      </div>
                    </div>
                  )}

                  {/* Beca Institucional autorizada (> 0%) */}
                  {scholarshipNotes && (
                    <div className="p-2.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          <span>Beca Institucional Autorizada</span>
                        </span>
                        {scholarshipPercentage > 0 && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-indigo-100 border border-indigo-200 rounded text-indigo-800">
                            🏷️ {scholarshipPercentage}% DCTO
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium leading-snug text-slate-700">
                        {scholarshipNotes}
                      </p>
                    </div>
                  )}

                  {/* Ficha Médica / Alergia destacada */}
                  {(medicalNotes || isAllergySearch || (bloodType && bloodType !== 'N/D')) && (
                    <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Alergia / Ficha Médica</span>
                        </span>
                        {bloodType && bloodType !== 'N/D' && (
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 bg-rose-100 border border-rose-200 rounded text-rose-800">
                            🩸 {bloodType}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-medium leading-snug text-rose-800">
                        {medicalNotes || 'Diagnóstico clínico registrado en expediente escolar.'}
                      </p>
                    </div>
                  )}

                  {/* Filiación Familiar & Contacto de Emergencia */}
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Tutor:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[170px]">{tutor}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Emergencia:</span>
                      <span className={`font-medium font-mono ${isIbime ? 'text-[#0F2744]' : 'text-indigo-700'}`}>{phone}</span>
                    </div>
                    {age && age !== 'N/D' && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Edad:</span>
                        <span className="font-medium text-slate-800">{age} {birthDate ? `(${birthDate})` : ''}</span>
                      </div>
                    )}
                    {campus && (
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Plantel:</span>
                        <span className="font-medium text-slate-600 truncate max-w-[170px]">{campus}</span>
                      </div>
                    )}
                  </div>

                  {/* Botón de acción Abrir Expediente 360° */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenStudentExpediente(studentId, studentName);
                    }}
                    className={`w-full py-2 rounded-lg text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1 shadow-sm ${
                      isIbime 
                        ? 'bg-[#E41B14] hover:bg-[#C01D0C]' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <span>Abrir Expediente 360°</span>
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full font-sans">
      {/* 0. ESTILOS DE IMPRESIÓN OFICIAL Y COMPACTA */}
      <style>{`
        @page {
          size: letter portrait;
          margin: 10mm 12mm 10mm 12mm;
        }

        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          /* Ocultar interfaz interactiva web y componentes de pantalla */
          .screen-only-studio,
          aside,
          header,
          nav,
          button,
          [role="dialog"] {
            display: none !important;
          }

          /* Mostrar exclusivamente el documento oficial ejecutivo integral */
          #executive-report-print-container,
          #executive-board-dossier,
          .executive-board-dossier {
            display: block !important;
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #ffffff !important;
            color: #0f172a !important;
          }

          .print-avoid-break {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          thead {
            display: table-header-group !important;
          }

          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* 1. CONTENEDOR EN PANTALLA (INTERACTIVO, SPLIT-VIEW, MODO CLARO) - OCULTO AL IMPRIMIR */}
      <div 
        className={`screen-only-studio select-none print:hidden no-print transition-all duration-200 ${
          isMaximized
            ? 'fixed inset-0 z-50 flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden shadow-2xl'
            : isEmbeddedView
            ? 'flex flex-col w-full bg-slate-50 text-slate-900 font-sans rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden relative dynamic-bi-height'
            : 'flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden'
        }`}
        style={isEmbeddedView && !isMaximized ? {
          height: `min(calc(100dvh - 6rem), ${viewport.availableContentHeight}px)`,
          minHeight: '520px'
        } : undefined}
      >
        
        {/* 1. BARRA SUPERIOR EJECUTIVA */}
      <header className="h-14 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between gap-3 z-30 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => {
              if (isMaximized) {
                setIsMaximized(false);
              } else if (onBack) {
                onBack();
              } else {
                window.history.back();
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition cursor-pointer shrink-0 border border-slate-200"
            title={isMaximized ? "Restaurar vista" : (isEmbeddedView ? "Volver al resumen" : "Volver")}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden xs:inline">{isMaximized ? 'Restaurar' : (isEmbeddedView ? 'Volver al Resumen' : 'Volver')}</span>
          </button>

          {/* Toggle Asistente en Mobile */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            title={isSidebarOpen ? "Ocultar asistente" : "Abrir asistente"}
            className={`flex md:hidden items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
              isSidebarOpen 
                ? 'bg-indigo-600 text-white shadow-xs' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span className="text-[11px]">Asistente</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-200 shrink-0 hidden xs:block" />

          {/* Título dinámico del reporte */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input aria-label="Campo de texto de formulario"
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="bg-white border border-indigo-500 rounded px-2 py-0.5 text-sm font-semibold text-slate-900 focus:outline-none"
              />
            ) : (
              <h1 
                onClick={() => setIsEditingTitle(true)}
                title="Clic para editar título del reporte"
                className="text-sm md:text-base font-bold text-slate-900 truncate cursor-pointer hover:text-indigo-600 transition flex items-center gap-1.5"
              >
                {reportTitle}
              </h1>
            )}
          </div>
        </div>

        {/* Controles del lado derecho: Selector Institucional, Badge 0 Tokens y Acciones */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Aislamiento Multi-Colegio: Selector solo para Super Usuario; Badge bloqueado para Dueño de Colegio */}
          {isSuperUser ? (
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
              <Building2 className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <select aria-label="Seleccionar opción"
                value={selectedSchoolFilter}
                onChange={(e) => {
                  setSelectedSchoolFilter(e.target.value);
                  selectSchool(e.target.value);
                }}
                className="bg-transparent text-slate-800 font-medium focus:outline-none text-xs cursor-pointer"
              >
                <option value="all" className="bg-white text-amber-600 font-bold">Consolidado Global (Todos los Colegios)</option>
                {institutionsList.map(inst => (
                  <option key={inst.id} value={inst.id} className="bg-white text-slate-900">
                    {inst.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1 text-xs text-slate-700">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span className="font-semibold text-slate-900 truncate max-w-[180px]">
                {activeInstitution?.name || 'Colegio Autónomo'}
              </span>
            </div>
          )}

          {/* Botones de acción del reporte */}
          {isEmbeddedView && (
            <button
              onClick={() => setIsMaximized(!isMaximized)}
              title={isMaximized ? "Restaurar a vista integrada del dashboard" : "Maximizar pantalla completa"}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
            >
              {isMaximized ? <Minimize2 className="h-3.5 w-3.5 text-indigo-600" /> : <Maximize2 className="h-3.5 w-3.5 text-slate-500" />}
              <span className="hidden sm:inline">{isMaximized ? 'Restaurar' : 'Maximizar'}</span>
            </button>
          )}

          <button
            onClick={handleExportCSV}
            title="Exportar datos a formato CSV/Excel" aria-label="Exportar datos a formato CSV/Excel"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          <button
            onClick={() => window.print()}
            title="Imprimir reporte o guardar como PDF"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Imprimir</span>
          </button>

          <button
            onClick={handleCopySummary}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm flex items-center gap-1.5 transition cursor-pointer"
          >
            {copiedSummary ? <Check className="h-3.5 w-3.5 text-white" /> : <Copy className="h-3.5 w-3.5 text-white" />}
            <span>{copiedSummary ? 'Copiado' : 'Publicar'}</span>
          </button>
        </div>
      </header>

      {/* 2. CUERPO SPLIT-VIEW (PANEL IZQUIERDO CONVERSACIONAL + ÁREA DE REPORTE) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* BACKDROP PARA DISPOSITIVOS MÓVILES */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden absolute inset-0 bg-slate-950/40 z-20 backdrop-blur-xs transition-opacity"
          />
        )}

        {/* PANEL LATERAL IZQUIERDO: ASISTENTE CONVERSACIONAL (VOZ Y TEXTO) */}
        <aside 
          className={`shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 z-30 ${
            isSidebarOpen 
              ? 'absolute md:relative inset-y-0 left-0 w-full sm:w-[330px] md:w-[360px] lg:w-[390px] xl:w-[415px] shadow-2xl md:shadow-none' 
              : 'w-0 border-r-0 overflow-hidden'
          }`}
        >
          {/* Header del Chat */}
          <div className="h-10 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Asistente Ejecutivo</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded font-mono hidden sm:inline">
                IA Pedagógica & Analítica
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-slate-200 text-slate-500"
                title="Cerrar panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Historial de conversación */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Mensaje del usuario */}
            <div className="flex flex-col items-end">
              <div className="max-w-[90%] bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-3.5 py-2.5 shadow-sm font-medium leading-relaxed">
                {currentReport?.queryReceived || reportTitle}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 mr-1">Tú · Consulta Directiva</span>
            </div>

            {/* Respuesta explicativa estructurada del Asistente */}
            {isProcessing ? (
              <div className="flex items-center gap-2 text-slate-600 p-3 bg-slate-50 rounded-xl animate-pulse border border-slate-200">
                <div className="h-3 w-3 rounded-full bg-indigo-600 animate-ping" />
                <span className="text-xs">Consultando base de datos escolar local...</span>
              </div>
            ) : currentReport ? (
              <div className="flex flex-col items-start">
                <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-sm p-3.5 text-slate-800 space-y-3 shadow-xs">
                  <p className="font-semibold text-slate-900 text-[13px] leading-snug">
                    ¡Listo! Ya actualicé el reporte.
                  </p>

                  {/* Respuesta Directa Ejecutiva */}
                  {currentReport.directAnswer ? (
                    <div className={`p-3.5 rounded-xl text-xs leading-relaxed shadow-xs space-y-2 border ${
                      isIbime
                        ? 'bg-gradient-to-br from-[#0F2744] via-[#123157] to-[#17426D] border-[#E41B14]/40 text-white shadow-md'
                        : 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                    }`}>
                      <div className="flex items-center justify-between gap-1.5">
                        <div className={`flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider ${
                          isIbime ? 'text-red-300' : 'text-indigo-700'
                        }`}>
                          <ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${isIbime ? 'text-[#E41B14]' : 'text-indigo-600'}`} />
                          <span>Respuesta Institucional:</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleSpeakBriefing(currentReport.directAnswer)}
                          title={isSpeakingBriefing ? "Detener reproducción por voz" : "Escuchar respuesta institucional por voz"}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                            isSpeakingBriefing
                              ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                              : (isIbime 
                                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/20' 
                                  : 'bg-white hover:bg-indigo-100 text-indigo-700 border-indigo-200')
                          }`}
                        >
                          {isSpeakingBriefing ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                          <span>{isSpeakingBriefing ? 'Detener' : 'Escuchar Voz'}</span>
                        </button>
                      </div>
                      <div className={`font-normal leading-relaxed text-[11.5px] ${isIbime ? 'text-white' : 'text-slate-800'}`}>
                        {renderFormattedMarkdown(currentReport.directAnswer, isIbime, isIbime)}
                      </div>
                    </div>
                  ) : currentReport.explanation.summary ? (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed shadow-xs">
                      {renderFormattedMarkdown(currentReport.explanation.summary, false, isIbime)}
                    </div>
                  ) : null}

                  {/* Parámetros técnicos y filtros colapsables */}
                  <details className="group mt-2 border-t border-slate-200 pt-2 text-slate-600">
                    <summary className="cursor-pointer text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center justify-between py-1 transition-colors select-none">
                      <span className="flex items-center gap-1.5">
                        <Filter className="h-3 w-3 text-indigo-600" />
                        <span>Ver parámetros técnicos y filtros de la consulta</span>
                      </span>
                      <ChevronDown className="h-3.5 w-3.5 transition-transform duration-200 group-open:rotate-180" />
                    </summary>

                    <div className="pt-2 space-y-2">
                      <div className="space-y-1.5 bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                        <p className="font-bold text-indigo-700 text-[11px] uppercase tracking-wider">
                          ¿Qué incluye esta consulta?
                        </p>
                        <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                          {currentReport.explanation.fieldsIncluded.map((field, idx) => (
                            <li key={idx} className="leading-tight">
                              <span className="font-semibold text-slate-900">{field.split(':')[0]}:</span> {field.split(':')[1] || ''}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] shadow-xs">
                        <p className="font-bold text-emerald-700 uppercase tracking-wider">
                          Filtros Aplicados:
                        </p>
                        <ul className="space-y-1 text-slate-700 list-disc list-inside">
                          {currentReport.explanation.filtersApplied.map((filter, idx) => (
                            <li key={idx} className="leading-tight">{filter}</li>
                          ))}
                        </ul>
                      </div>

                      <p className="text-slate-700 leading-relaxed text-[11px]">
                        {currentReport.explanation.visualizationDescription}
                      </p>

                      <div className="pt-1 border-t border-slate-200">
                        <p className="text-slate-500 text-[11px] italic">
                          {currentReport.explanation.followUpPrompt}
                        </p>
                      </div>
                    </div>
                  </details>
                </div>
                <span className="text-[10px] text-slate-500 mt-1 ml-1">Motor de Inteligencia Analítica</span>
              </div>
            ) : null}

            {/* Sugerencias contextuales rápidas */}
            {currentReport?.suggestedQueries && (
              <div className="pt-2 space-y-1.5">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500">Sugerencias Rápidas:</p>
                <div className="flex flex-wrap gap-1.5">
                  {currentReport.suggestedQueries.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleExecuteQuery(sug)}
                      className="text-left text-[11px] px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 transition cursor-pointer shadow-xs"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Indicador de Grabación de Voz Activa */}
          {isListening && (
            <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between text-xs text-rose-700 shrink-0">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                </span>
                <span className="font-semibold">Escuchando dictado por voz...</span>
              </div>
              <span className="text-[10px] text-slate-500">Habla con claridad</span>
            </div>
          )}

          {/* Barra de Entrada (Texto y Micrófono) */}
          <div className="p-3 border-t border-slate-200 bg-white shrink-0">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:bg-white transition shadow-xs">
              <button
                type="button"
                onClick={() => handleExecuteQuery('Resumen general de control total del colegio')}
                title="Plantillas de consulta ejecutiva"
                className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                <Paperclip className="h-4 w-4" />
              </button>

              <input aria-label="Campo de texto de formulario"
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteQuery()}
                placeholder={isListening ? "Escuchando tu voz..." : "Escribe aquí tu consulta..."}
                className="flex-1 bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none py-1"
              />

              {/* Botón de Dictado por Voz */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                title={isListening ? "Detener dictado por voz" : "Dictar consulta con tu voz"}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-200'
                }`}
              >
                {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>

              {/* Botón Enviar */}
              <button aria-label="Enviar mensaje o formulario"
                type="button"
                onClick={() => handleExecuteQuery()}
                disabled={!inputText.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:hover:bg-indigo-600 text-white transition cursor-pointer shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </aside>

        {/* BOTÓN TOGGLE COLAPSO DEL PANEL LATERAL (SOLO PANTALLAS MD+) */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Ocultar panel conversacional" : "Mostrar panel conversacional"}
          className="hidden md:flex absolute top-3 z-30 items-center justify-center h-7 w-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-md transition cursor-pointer"
          style={{ 
            left: isSidebarOpen 
              ? (viewport.isCompactLaptop ? 'calc(330px - 14px)' : viewport.isLaptop ? 'calc(360px - 14px)' : 'calc(410px - 14px)') 
              : '8px' 
          }}
        >
          {isSidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>

        {/* ÁREA PRINCIPAL: ESPACIO DE TRABAJO Y VISUALIZACIÓN DEL REPORTE */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50">
          
          {/* Pestañas Superiores de la Vista (Imagen 2: Vista previa | Mi edición actual) */}
          <div className="h-10 px-6 border-b border-slate-200 flex items-center justify-between shrink-0 bg-white">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'preview'
                    ? (isIbime ? 'border-[#E41B14] text-[#E41B14] font-bold' : 'border-indigo-600 text-indigo-700 font-bold')
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Vista previa
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`py-2.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'charts'
                    ? (isIbime ? 'border-[#E41B14] text-[#E41B14] font-bold' : 'border-indigo-600 text-indigo-700 font-bold')
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className={`h-3.5 w-3.5 ${isIbime ? 'text-[#E41B14]' : 'text-indigo-600'}`} />
                <span>Vista Gráfica</span>
              </button>
              
              <button
                onClick={() => setActiveTab('table')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'table'
                    ? (isIbime ? 'border-[#E41B14] text-[#E41B14] font-bold' : 'border-indigo-600 text-indigo-700 font-bold')
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Datos Tabulares ({currentReport?.table.totalRows || 0})
              </button>

              <button
                onClick={() => setActiveTab('edition')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'edition'
                    ? (isIbime ? 'border-[#E41B14] text-[#E41B14] font-bold' : 'border-indigo-600 text-indigo-700 font-bold')
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Mi edición actual
              </button>
            </div>

            <span className="text-[11px] text-slate-500 font-medium">
              Institución: <span className="text-slate-900 font-bold">{currentReport?.schoolName || activeInstitution?.name}</span>
            </span>
          </div>

          {/* CONTENIDO DEL REPORTE */}
          <div className={`flex-1 overflow-y-auto ${viewport.classes.containerPadding} ${viewport.classes.sectionSpacing} custom-scrollbar`}>
            
            {/* Si no hay reporte cargado: Estado vacío idéntico al de la Imagen 2 */}
            {!currentReport ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 mb-4">
                  <BarChart3 className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">El reporte aparecerá aquí</h3>
                <p className="text-xs text-slate-500 max-w-sm mb-6">
                  Escribe una instrucción en el chat o usa el micrófono para ver el resultado.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  <button
                    onClick={() => handleExecuteQuery('Estudiantes con adeudo activo por nivel y monto pendiente')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs transition"
                  >
                    Estudiantes con adeudo activo
                  </button>
                  <button
                    onClick={() => handleExecuteQuery('Comparativa de ingresos y nómina mes a mes')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs transition"
                  >
                    Comparativa entre meses
                  </button>
                  <button
                    onClick={() => handleExecuteQuery('Asistencias y retardos del colegio')}
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 shadow-xs transition"
                  >
                    Control de asistencias
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Presentación Gerencial Ejecutiva de Alta Dirección para el Radar del CEO */}
                {currentReport.domain === 'STRATEGIC_CEO_RADAR' ? (
                  <ExecutiveManagerialBriefingCard 
                    report={currentReport}
                    onOpenDimension={handleOpenStrategicDimension}
                    onSpeak={toggleSpeakBriefing}
                    isSpeaking={isSpeakingBriefing}
                  />
                ) : currentReport.directAnswer ? (
                  /* Banner de Respuesta Ejecutiva Directa para otras consultas */
                  <div className={`p-5 rounded-2xl shadow-lg border ${
                    isIbime 
                      ? 'bg-gradient-to-r from-[#0F2744] via-[#17426D] to-[#0F2744] border-[#E41B14]/40 text-white' 
                      : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-900/60 text-white'
                  }`}>
                    <div className="flex items-start gap-3.5">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs ${
                        isIbime 
                          ? 'bg-[#E41B14]/20 border border-[#E41B14]/40 text-amber-300' 
                          : 'bg-indigo-500/20 border border-indigo-400/40 text-amber-300'
                      }`}>
                        <ShieldCheck className="h-5 w-5 stroke-[2.2]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">Respuesta Ejecutiva Directa</h3>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                              isIbime 
                                ? 'bg-[#E41B14]/25 text-red-200 border-[#E41B14]/40' 
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                              Inteligencia Pedagógica · 0 Tokens
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleSpeakBriefing(currentReport.directAnswer)}
                            title={isSpeakingBriefing ? "Detener reproducción por voz" : "Escuchar dictamen institucional por voz"}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-xs ${
                              isSpeakingBriefing
                                ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                            }`}
                          >
                            {isSpeakingBriefing ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
                            <span>{isSpeakingBriefing ? 'Detener Voz' : 'Escuchar Dictamen por Voz'}</span>
                          </button>
                        </div>
                        <div className="text-xs text-white mt-2.5 leading-relaxed font-medium">
                          {renderFormattedMarkdown(currentReport.directAnswer, true, isIbime)}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Banner de acceso rápido: Si hay múltiples alumnos coincidentes o si es individual */}
                {currentReport.table.totalRows > 1 && currentReport.table.rows.some((r: any) => r.studentId || r.enrollmentId || r.studentName) ? (
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl shadow-xs border ${
                    isIbime ? 'border-[#0F2744]/20' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isIbime ? 'bg-[#0F2744]/10 border border-[#0F2744]/20 text-[#0F2744]' : 'bg-cyan-50 border border-cyan-200 text-cyan-700'
                      }`}>
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Directorio de Expedientes: {currentReport.table.totalRows} Alumnos Coincidentes
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                            isIbime ? 'bg-red-50 text-[#E41B14] border-red-200' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                          }`}>
                            Catálogo Oficial
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Se localizaron {currentReport.table.totalRows} expedientes bajo el criterio solicitado. Consulta los detalles de cada uno a continuación.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        expedientesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 ${
                        isIbime ? 'bg-[#E41B14] hover:bg-[#C01D0C]' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <span>Explorar Expedientes Abajo</span>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : currentReport.studentDetail ? (
                  <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl shadow-xs border ${
                    isIbime ? 'border-[#0F2744]/30' : 'border-indigo-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                        isIbime ? 'bg-[#0F2744]/10 border border-[#0F2744]/20 text-[#0F2744]' : 'bg-indigo-50 border border-indigo-200 text-indigo-600'
                      }`}>
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Ficha Integral 360°: {currentReport.studentDetail.student.first_name} {currentReport.studentDetail.student.last_name_1}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold border ${
                            isIbime ? 'bg-red-50 border-red-200 text-[#E41B14]' : 'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          }`}>
                            {currentReport.studentDetail.student.level.toUpperCase()} · {currentReport.studentDetail.student.grade}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Haz clic para ver contactos de tutores, fecha de nacimiento, edad, asistencias y desglose de cobros.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (currentReport?.studentDetail) {
                          setSelectedStudentForDrawer(currentReport.studentDetail);
                          setShowDrawer(true);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0 ${
                        isIbime ? 'bg-[#E41B14] hover:bg-[#C01D0C]' : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <span>Abrir Expediente 360°</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}

                {/* 1. TARJETAS KPI EJECUTIVAS */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 ${viewport.classes.gridGap}`}>
                  {currentReport.kpis.map((kpi) => {
                    const isCountKpi = kpi.label.toLowerCase().includes('alumno') || kpi.label.toLowerCase().includes('estudiante') || kpi.id.includes('count');

                    return (
                      <div 
                        key={kpi.id} 
                        onClick={() => {
                          if (isCountKpi || (currentReport.table?.rows?.length || 0) > 0) {
                            if (activeTab === 'charts') setActiveTab('preview');
                            setTimeout(() => {
                              expedientesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
                            }, 50);
                          }
                        }}
                        className={`bg-white border border-slate-200 rounded-2xl ${viewport.classes.kpiCardPadding} flex flex-col justify-between shadow-xs relative overflow-hidden ${
                          isCountKpi ? 'cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition group' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-slate-500 tracking-wide uppercase">{kpi.label}</span>
                          {kpi.trend && (
                            <span className={`text-[10px] font-bold flex items-center gap-1 ${
                              kpi.trend.direction === 'up' ? 'text-emerald-600' : (kpi.trend.direction === 'down' ? 'text-rose-600' : 'text-slate-500')
                            }`}>
                              {kpi.trend.direction === 'up' ? <TrendingUp className="h-3 w-3" /> : (kpi.trend.direction === 'down' ? <TrendingDown className="h-3 w-3" /> : null)}
                              {kpi.trend.value}
                            </span>
                          )}
                        </div>
                        
                        <div className={`${viewport.classes.kpiValueText} font-black text-slate-900 tracking-tight mb-1`}>
                          {kpi.value}
                        </div>

                        {kpi.subtext && (
                          <p className="text-[11px] text-slate-500 font-medium truncate">
                            {kpi.subtext}
                          </p>
                        )}

                        {isCountKpi && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-indigo-600 group-hover:text-indigo-700 font-semibold">
                            <span>Ver todos los expedientes</span>
                            <ChevronDown className="h-3 w-3 group-hover:translate-y-0.5 transition-transform" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* VISTA PREVIA: KPIS + GRÁFICA INTERACTIVA COMPACTA + EXPEDIENTES HOMOLOGADOS */}
                {activeTab === 'preview' && (
                  <>
                    {/* Gráfica interactiva adaptativa con selector de tipos */}
                    {currentReport.chart && (
                      <ExecutiveChartVisualizer
                        chart={currentReport.chart}
                        mode="compact"
                        debtors={reportDebtors}
                        reportRows={currentReport.table?.rows}
                        allStudents={masterStudentsPool}
                        selectedCategory={selectedCategoryFilter}
                        onSelectCategory={handleSelectChartCategory}
                        onOpenExpediente={handleOpenStudentExpediente}
                        onExpandToFull={() => setActiveTab('charts')}
                        showDebtorsList={false}
                      />
                    )}

                    {/* Catálogo visual de Expedientes Coincidentes homologado con selector fichas/tabla */}
                    {renderExpedientesGrid()}

                    {/* Si no es catálogo de alumnos, desplegar tabla de datos tabulares estándar */}
                    {!hasStudentRows && renderDataTable(true)}
                  </>
                )}

                {/* VISTA GRÁFICA DEDICADA: ANÁLISIS VISUAL COMPLETO */}
                {activeTab === 'charts' && (
                  <div className="space-y-6">
                    {currentReport.chart ? (
                      <>
                        <ExecutiveChartVisualizer
                          chart={currentReport.chart}
                          mode="full"
                          debtors={reportDebtors}
                          reportRows={currentReport.table?.rows}
                          allStudents={masterStudentsPool}
                          selectedCategory={selectedCategoryFilter}
                          onSelectCategory={handleSelectChartCategory}
                          onOpenExpediente={handleOpenStudentExpediente}
                        />

                        {/* Desglose Analítico de Distribución y Concentración */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-200">
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">Desglose Analítico de Datos de la Gráfica</h4>
                              <p className="text-xs text-slate-500">Valores cuantitativos y ponderación porcentual calculados al vuelo</p>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                              <thead>
                                <tr className="border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] bg-slate-50">
                                  <th className="py-2.5 px-3">Segmento / Categoría</th>
                                  {currentReport.chart.datasets.map((ds, idx) => (
                                    <th key={idx} className="py-2.5 px-3 text-right">{ds.name}</th>
                                  ))}
                                  <th className="py-2.5 px-3 text-center">Participación</th>
                                  <th className="py-2.5 px-3">Representación Proporcional</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 font-medium">
                                {currentReport.chart.labels.map((label, idx) => {
                                  const val = currentReport.chart?.datasets[0]?.data[idx] || 0;
                                  const total = currentReport.chart?.datasets[0]?.data.reduce((a, b) => a + b, 0) || 1;
                                  const pct = Math.min(Math.max((val / total) * 100, 0), 100);

                                  return (
                                    <tr key={idx} className="hover:bg-slate-50 transition">
                                      <td className="py-3 px-3 text-slate-900 font-bold flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                        <span>{label}</span>
                                      </td>
                                      {currentReport.chart?.datasets.map((ds, dIdx) => (
                                        <td key={dIdx} className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                                          {currentReport.chart?.unit === 'currency' ? formatMXN(ds.data[idx] || 0) : ds.data[idx]}
                                        </td>
                                      ))}
                                      <td className="py-3 px-3 text-center font-mono text-indigo-600 font-bold">
                                        {pct.toFixed(1)}%
                                      </td>
                                      <td className="py-3 px-3">
                                        <div className="h-2.5 w-full max-w-[200px] bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                                          <div 
                                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 transition-all duration-500" 
                                            style={{ width: `${Math.max(pct, 3)}%` }} 
                                          />
                                        </div>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
                        No hay datos gráficos configurados para este reporte.
                      </div>
                    )}
                  </div>
                )}

                {/* VISTA TABULAR DEDICADA */}
                {activeTab === 'table' && renderDataTable(false)}

                {/* VISTA DE EDICIÓN Y PARÁMETROS DEL REPORTE */}
                {activeTab === 'edition' && (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 mb-1">Parámetros y Metadatos de la Consulta</h3>
                      <p className="text-xs text-slate-500">Ajusta los detalles descriptivos y la configuración del reporte</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">Título del Reporte:</label>
                        <input aria-label="Campo de texto de formulario"
                          type="text"
                          value={reportTitle}
                          onChange={(e) => setReportTitle(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider block">Campos Computados</span>
                          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                            {currentReport.explanation.fieldsIncluded.map((f, i) => (
                              <li key={i}>{f}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">Filtros Activos</span>
                          <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                            {currentReport.explanation.filtersApplied.map((flt, i) => (
                              <li key={i}>{flt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                    </div>
                    {/* Directorio de Expedientes Coincidentes también disponible en edición */}
                    {renderExpedientesGrid()}
                  </div>
                )}
              </>
            )}

          </div>
        </main>
      </div>

      {/* 3. DRAWER SLIDE-OVER: EXPEDIENTE 360° DE ESTUDIANTE / REGISTRO */}
      {showDrawer && selectedStudentForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col shadow-2xl p-6 overflow-y-auto">
            
            {/* Header del Drawer */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {selectedStudentForDrawer.student.first_name[0]}{selectedStudentForDrawer.student.last_name_1[0]}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {selectedStudentForDrawer.student.first_name} {selectedStudentForDrawer.student.last_name_1}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedStudentForDrawer.student.level.toUpperCase()} · {selectedStudentForDrawer.student.grade} Grupo {selectedStudentForDrawer.student.group_id || 'A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canDeleteStudent && (
                  <button 
                    type="button"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    className="p-1.5 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                    title="Eliminar Alumno del Sistema (Acción Directiva)"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Eliminar</span>
                  </button>
                )}
                <button aria-label="Cerrar" 
                  onClick={() => setShowDrawer(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Resumen Financiero y Asistencias */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Adeudo Total</span>
                <p className={`text-lg font-black ${selectedStudentForDrawer.totalDebt > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {formatMXN(selectedStudentForDrawer.totalDebt)}
                </p>
                <span className="text-[10px] text-slate-500">{selectedStudentForDrawer.billingRecords.filter(b => b.status !== 'paid').length} recibos pendientes</span>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Asistencia</span>
                <p className="text-lg font-black text-indigo-600">
                  {selectedStudentForDrawer.attendanceStats.attendanceRate.toFixed(1)}%
                </p>
                <span className="text-[10px] text-slate-500">
                  {selectedStudentForDrawer.attendanceStats.faltas} faltas / {selectedStudentForDrawer.attendanceStats.retardos} retardos
                </span>
              </div>
            </div>

            {/* Filiación y Contactos */}
            <div className="space-y-3 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider mb-2">Datos Generales y Filiación</h4>
              <div className="grid grid-cols-2 gap-2.5 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px]">Edad Calculada:</span>
                  <span className="font-bold text-emerald-700 text-xs">
                    {selectedStudentForDrawer.student.birth_date 
                      ? `${2026 - new Date(selectedStudentForDrawer.student.birth_date).getFullYear()} Años Cumplidos`
                      : '7 Años'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Fecha de Nacimiento:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedStudentForDrawer.student.birth_date 
                      ? new Date(selectedStudentForDrawer.student.birth_date).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
                      : '10 de Mayo de 2019'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CURP:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedStudentForDrawer.student.curp || 'N/D'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Matrícula:</span>
                  <span className="font-mono font-semibold text-slate-900">{selectedStudentForDrawer.student.enrollment_id || 'MAT-2026'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Plantel y Turno:</span>
                  <span className="font-semibold text-slate-900">
                    {selectedStudentForDrawer.student.campus_name || 'Plantel Principal'} ({selectedStudentForDrawer.student.shift || 'Matutino'})
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Tutor Responsable:</span>
                  <span className="font-semibold text-slate-900">{selectedStudentForDrawer.student.tutor_name || selectedStudentForDrawer.student.father_name || 'Tutor registrado'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 block text-[10px]">Teléfono de Contacto Familiar:</span>
                  <span className="font-semibold text-emerald-700 text-xs flex items-center gap-1.5">
                    <Phone className="h-3 w-3" />
                    {selectedStudentForDrawer.student.emergency_contact_phone || selectedStudentForDrawer.student.phone || '55-4160-8800'}
                  </span>
                </div>
              </div>
            </div>

            {/* Observaciones de Salud y Pedagógicas */}
            {(selectedStudentForDrawer.student.medical_notes || selectedStudentForDrawer.student.academic_notes) && (
              <div className="space-y-2.5 mb-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Ficha Médica y Pedagógica</h4>
                {selectedStudentForDrawer.student.medical_notes && (
                  <div>
                    <span className="text-amber-700 font-semibold block text-[10px]">Salud y Alergias:</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">{selectedStudentForDrawer.student.medical_notes}</p>
                  </div>
                )}
                {selectedStudentForDrawer.student.academic_notes && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-indigo-700 font-semibold block text-[10px]">Desempeño Académico:</span>
                    <p className="text-slate-700 text-[11px] mt-0.5">{selectedStudentForDrawer.student.academic_notes}</p>
                  </div>
                )}
              </div>
            )}

            {/* Recibos de Cobranza del Alumno */}
            <div className="space-y-2 mb-6 flex-1">
              <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">Estado de Cuenta</h4>
              <div className="space-y-2">
                {selectedStudentForDrawer.billingRecords.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay cargos registrados para este estudiante.</p>
                ) : (
                  selectedStudentForDrawer.billingRecords.map((b) => (
                    <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{b.concept}</p>
                        <p className="text-[11px] text-slate-500">Vencimiento: {b.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-slate-900">{formatMXN(Number(b.amount))}</p>
                        <span className={`text-[10px] font-bold uppercase ${b.status === 'paid' ? 'text-emerald-700' : 'text-rose-700'}`}>
                          {b.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Acciones del Expediente */}
            <div className="space-y-2 pt-2 border-t border-slate-200">
              {canDeleteStudent && (
                <button
                  type="button"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                >
                  <Trash2 className="h-4 w-4 text-rose-600" />
                  <span>Eliminar Alumno del Sistema</span>
                </button>
              )}
              {/* Botón de cierre */}
              <button
                onClick={() => setShowDrawer(false)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-800 border border-slate-200 transition cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmación para Eliminar Alumno del Sistema (Expediente 360) */}
      {isConfirmDeleteOpen && selectedStudentForDrawer && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-rose-200 w-full max-w-md rounded-3xl p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="h-12 w-12 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-900">
                  Eliminar Alumno del Sistema
                </h3>
                <p className="text-xs text-rose-600 font-semibold">
                  Acción autorizada para Directivos y Super Usuarios
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs space-y-1.5">
              <p className="font-black text-slate-900">
                {selectedStudentForDrawer.student.first_name} {selectedStudentForDrawer.student.last_name_1} {selectedStudentForDrawer.student.last_name_2 || ''}
              </p>
              <div className="flex flex-wrap gap-x-3 text-[11px] text-slate-500 font-mono">
                <span>Matrícula: {selectedStudentForDrawer.student.enrollment_id || 'S/N'}</span>
                <span>CURP: {selectedStudentForDrawer.student.curp || 'S/N'}</span>
                <span>Grado: {selectedStudentForDrawer.student.grade}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
              <p className="leading-tight">
                <strong>Aviso de Trazabilidad:</strong> El retiro de este alumno quedará registrado en el módulo de <strong>Super Usuario</strong> con la <strong>fecha y hora exacta</strong> de la baja institucional.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">
                Motivo de la baja o retiro:
              </label>
              <select aria-label="Seleccionar opción"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-rose-500 cursor-pointer"
              >
                <option value="Traslado de colegio / Solicitud familiar">Traslado de colegio / Solicitud familiar</option>
                <option value="Cambio de residencia o ciudad">Cambio de residencia o ciudad</option>
                <option value="Baja administrativa por falta de documentación">Baja administrativa por falta de documentación</option>
                <option value="Egreso escolar / Fin de ciclo">Egreso escolar / Fin de ciclo</option>
                <option value="Baja solicitada por Dirección General">Baja solicitada por Dirección General</option>
                <option value="Otro motivo justificado">Otro motivo justificado</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                className="px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteStudentFromDrawer}
                className="px-5 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/25 transition cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Confirmar Baja y Eliminación</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast de Baja Exitosa */}
      {deletionToast && (
        <div className="fixed bottom-6 right-6 z-60 max-w-md bg-emerald-900 text-white text-xs font-bold p-4 rounded-2xl shadow-2xl border border-emerald-700 flex items-center gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="flex-1 leading-snug">{deletionToast}</p>
          <button aria-label="Cerrar"
            onClick={() => setDeletionToast(null)}
            className="p-1 hover:bg-emerald-800 rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modal Forense para Detalles Reales de las Dimensiones Estratégicas del Radar CEO */}
      <StrategicDimensionModal 
        config={strategicDimensionConfig}
        onClose={() => setStrategicDimensionConfig(null)}
        onOpenExpediente={handleOpenStudentExpediente}
        onNavigateTab={onNavigateTab}
        schoolName={currentReport?.schoolName || activeInstitution?.name || 'Instituto Bilingüe IBIME'}
      />

      </div>

      {/* ========================================================================= */}
      {/* 2. DOCUMENTO OFICIAL EJECUTIVO INTEGRAL (SOLO VISIBLE AL IMPRIMIR) */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 2. DOSSIER EJECUTIVO OFICIAL PARA JUNTAS DIRECTIVAS (SOLO VISIBLE AL IMPRIMIR) */}
      {/* ========================================================================= */}
      {currentReport && (
        <ExecutiveBoardReportDocument 
          report={currentReport}
          institution={{
            name: isIbime ? 'INSTITUTO BILINGÜE IBIME' : (currentReport?.schoolName || activeInstitution?.name || 'Colegio ISkool México'),
            cct: isIbime ? '15PPR3322G' : (activeInstitution?.cct || '15EPR2840Z'),
            logoUrl: isIbime ? '/brand/ibime_shield.webp' : activeInstitution?.logoUrl,
            campus: (activeInstitution as any)?.campuses?.[0]?.name || activeInstitution?.name
          }}
        />
      )}

    </div>
  );
}
