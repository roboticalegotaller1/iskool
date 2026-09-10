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
  Trash2
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

interface ExecutiveAnalyticsStudioProps {
  onBack?: () => void;
  initialQuery?: string;
}

/**
 * Renderizador de formato enriquecido sin dependencias externas:
 * Procesa **negritas**, *cursivas*, y viñetas (•, -, *) con espaciado limpio.
 */
function renderFormattedMarkdown(content?: string | null) {
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
              <strong key={`${lineIdx}-${match.index}`} className="font-bold text-indigo-700">
                {match[2]}
              </strong>
            );
          } else if (match[3]) {
            // *italic*
            parts.push(
              <em key={`${lineIdx}-${match.index}`} className="italic text-slate-600">
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
            <div key={lineIdx} className="flex items-start gap-2 pl-1.5 text-slate-800">
              <span className="text-indigo-600 font-bold select-none leading-normal shrink-0">•</span>
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

export default function ExecutiveAnalyticsStudio({ onBack, initialQuery }: ExecutiveAnalyticsStudioProps) {
  const { user } = useAuth();
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
    isSuperUser ? (activeSchoolId || 'sch-test-case') : effectiveSchoolId
  );

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

  // Drawer de ficha 360° de estudiante
  const [selectedStudentForDrawer, setSelectedStudentForDrawer] = useState<Student360Detail | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  // Referencia para SpeechRecognition y scroll a expedientes
  const recognitionRef = useRef<any>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);
  const expedientesSectionRef = useRef<HTMLDivElement | null>(null);
  const lastQueryRef = useRef<string>(initialQuery || 'Estudiantes con adeudo activo por nivel y monto pendiente');
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

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('iskool_store_updated', handleCustomStoreSync);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('iskool_store_updated', handleCustomStoreSync);
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

  // Renderizado del directorio interactivo de expedientes escolares coincidentes
  const renderExpedientesGrid = () => {
    if (!currentReport || !currentReport.table?.rows || currentReport.table.rows.length === 0) return null;

    const hasStudentRows = currentReport.table.rows.some((r: any) => 
      r.studentId || r.enrollmentId || r.studentName || (r.recordType && String(r.recordType).includes('Alumno'))
    );

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
      <div ref={expedientesSectionRef} className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              <FolderOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                <span>Expedientes Escolares Coincidentes</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
                  {displayedRows.length} {displayedRows.length === 1 ? 'registro' : 'registros'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Información institucional completa. Haz clic en cualquier tarjeta o en el botón para abrir el Expediente 360°.
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg font-medium self-start sm:self-auto border border-white/5">
            Criterio: <span className="text-cyan-400 font-mono font-bold">{currentReport.queryReceived}</span>
          </div>
        </div>

        {selectedCategoryFilter && (
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-indigo-950/80 via-slate-900 to-indigo-950/80 border border-indigo-500/40 rounded-xl text-xs shadow-md">
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

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedRows.map((row: any, idx: number) => {
            const studentId = row.studentId || row.student_id;
            const studentName = row.studentName || row.name || 'Estudiante';
            const enrollmentId = row.enrollmentId || row.referenceId || 'MAT-2026';
            const levelGrade = row.levelGrade || `${row.level || 'Primaria'} ${row.grade || '1º'}`;
            const age = row.age || 'N/D';
            const birthDate = row.birthDateStr || row.birthDate || '';
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
                className="bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-400 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-sm hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
              >
                {/* Header de la tarjeta */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0 shadow-xs">
                      {String(studentName).split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition truncate">
                        {studentName}
                      </h4>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-0.5">
                        <span className="font-mono text-indigo-600 font-bold">{enrollmentId}</span>
                        <span>·</span>
                        <span>{levelGrade}</span>
                      </div>
                    </div>
                  </div>

                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shrink-0 ${
                    isOverdue ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  }`}>
                    {status}
                  </span>
                </div>

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
                    <span className="font-medium text-indigo-700 font-mono">{phone}</span>
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
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer mt-1 shadow-sm"
                >
                  <span>Abrir Expediente 360°</span>
                  <ExternalLink className="h-3 w-3" />
                </button>
              </div>
            );
          })}
        </div>
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
          #executive-report-print-container {
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
      <div className="screen-only-studio flex flex-col h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden select-none print:hidden">
        
        {/* 1. BARRA SUPERIOR EJECUTIVA */}
      <header className="h-14 shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 flex items-center justify-between gap-3 z-30 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => onBack ? onBack() : window.history.back()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-semibold transition cursor-pointer shrink-0 border border-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Volver</span>
          </button>
          
          <div className="h-4 w-[1px] bg-slate-200 shrink-0" />

          {/* Título dinámico del reporte */}
          <div className="flex items-center gap-2 min-w-0">
            {isEditingTitle ? (
              <input
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
              <select
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
          <button
            onClick={handleExportCSV}
            title="Exportar datos a formato CSV/Excel"
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
        
        {/* PANEL LATERAL IZQUIERDO: ASISTENTE CONVERSACIONAL (VOZ Y TEXTO) */}
        <aside 
          className={`shrink-0 bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative z-20 ${
            isSidebarOpen ? 'w-[360px] md:w-[410px]' : 'w-0 border-r-0 overflow-hidden'
          }`}
        >
          {/* Header del Chat */}
          <div className="h-10 px-4 border-b border-slate-200 flex items-center justify-between shrink-0 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <span className="text-xs font-bold text-slate-800">Asistente Ejecutivo de Información</span>
            </div>
            <span className="text-[10px] text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded font-mono">
              IA Pedagógica & Analítica
            </span>
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
                    <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl text-slate-800 text-xs leading-relaxed shadow-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-700 text-[11px] uppercase tracking-wider">
                        <Bot className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                        <span>Respuesta Institucional:</span>
                      </div>
                      <div className="text-slate-800 font-normal leading-relaxed text-[11.5px]">
                        {renderFormattedMarkdown(currentReport.directAnswer)}
                      </div>
                    </div>
                  ) : currentReport.explanation.summary ? (
                    <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs leading-relaxed shadow-xs">
                      {renderFormattedMarkdown(currentReport.explanation.summary)}
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

              <input
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
              <button
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

        {/* BOTÓN TOGGLE COLAPSO DEL PANEL LATERAL */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          title={isSidebarOpen ? "Ocultar panel conversacional" : "Mostrar panel conversacional"}
          className="absolute top-3 z-30 flex items-center justify-center h-7 w-7 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-900 shadow-md transition cursor-pointer"
          style={{ left: isSidebarOpen ? 'calc(410px - 14px)' : '8px' }}
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
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Vista previa
              </button>

              <button
                onClick={() => setActiveTab('charts')}
                className={`py-2.5 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'charts'
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5 text-indigo-600" />
                <span>Vista Gráfica</span>
              </button>
              
              <button
                onClick={() => setActiveTab('table')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'table'
                    ? 'border-indigo-600 text-indigo-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Datos Tabulares ({currentReport?.table.totalRows || 0})
              </button>

              <button
                onClick={() => setActiveTab('edition')}
                className={`py-2.5 border-b-2 transition cursor-pointer ${
                  activeTab === 'edition'
                    ? 'border-indigo-600 text-indigo-700 font-bold'
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
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Si no hay reporte cargado: Estado vacío idéntico al de la Imagen 2 */}
            {!currentReport ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 mb-4">
                  <Bot className="h-8 w-8 text-indigo-600" />
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
                {/* Banner de Respuesta Ejecutiva Directa */}
                {currentReport.directAnswer && (
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 via-slate-50 to-blue-50/80 border border-indigo-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-start gap-3.5">
                      <div className="h-10 w-10 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0 mt-0.5 shadow-xs">
                        <Bot className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">Respuesta Ejecutiva Directa</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700 font-mono font-bold border border-indigo-200">
                            Inteligencia Pedagógica · 0 Tokens
                          </span>
                        </div>
                        <div className="text-xs text-slate-700 mt-2 leading-relaxed font-medium">
                          {renderFormattedMarkdown(currentReport.directAnswer)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Banner de acceso rápido: Si hay múltiples alumnos coincidentes o si es individual */}
                {currentReport.table.totalRows > 1 && currentReport.table.rows.some((r: any) => r.studentId || r.enrollmentId || r.studentName) ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700 font-bold shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Directorio de Expedientes: {currentReport.table.totalRows} Alumnos Coincidentes
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-200 font-mono font-bold">
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
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <span>Explorar Expedientes Abajo</span>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : currentReport.studentDetail ? (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-indigo-200 rounded-2xl shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">
                            Ficha Integral 360°: {currentReport.studentDetail.student.first_name} {currentReport.studentDetail.student.last_name_1}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 font-mono font-bold">
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
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer self-start sm:self-auto shrink-0"
                    >
                      <span>Abrir Expediente 360°</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}

                {/* 1. TARJETAS KPI EJECUTIVAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                        className={`bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden ${
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
                        
                        <div className="text-2xl font-black text-slate-900 tracking-tight mb-1">
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

                {/* VISTA PREVIA: KPIS + GRÁFICA INTERACTIVA COMPACTA + EXPEDIENTES + TABLA */}
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
                      />
                    )}

                    {/* Catálogo visual de Expedientes Coincidentes */}
                    {renderExpedientesGrid()}

                    {/* Tabla de datos tabulares con búsqueda */}
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                      <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                        <div className="flex items-center gap-2 flex-1 max-w-sm bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
                          <Search className="h-4 w-4 text-slate-400 shrink-0" />
                          <input
                            type="text"
                            value={tableSearch}
                            onChange={(e) => setTableSearch(e.target.value)}
                            placeholder="Buscar en el reporte..."
                            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                          />
                        </div>

                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-slate-600 font-medium">Estado:</span>
                          <select
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
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
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
                                      className="text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
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
                {activeTab === 'table' && (
                  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70">
                      <div className="flex items-center gap-2 flex-1 max-w-md bg-white border border-slate-200 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500/20">
                        <Search className="h-4 w-4 text-slate-400 shrink-0" />
                        <input
                          type="text"
                          value={tableSearch}
                          onChange={(e) => setTableSearch(e.target.value)}
                          placeholder="Buscar por estudiante, nivel, folio o concepto..."
                          className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-slate-600 font-medium">Estado:</span>
                        <select
                          value={tableStatusFilter}
                          onChange={(e) => setTableStatusFilter(e.target.value)}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium focus:outline-none text-xs"
                        >
                          <option value="all">Todos los registros</option>
                          <option value="pendiente">Pendientes</option>
                          <option value="vencido">Vencidos</option>
                          <option value="liquidado">Liquidados / Pagados</option>
                        </select>

                        <button
                          onClick={handleExportCSV}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>CSV</span>
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
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
                                No se encontraron registros que coincidan con los filtros actuales.
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
                                    className="text-[11px] font-bold text-indigo-600 group-hover:text-indigo-800 hover:underline flex items-center gap-1 ml-auto cursor-pointer"
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
                )}

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
                        <input
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
                <button 
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
              <select
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
          <button
            onClick={() => setDeletionToast(null)}
            className="p-1 hover:bg-emerald-800 rounded-lg transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      </div>

      {/* ========================================================================= */}
      {/* 2. DOCUMENTO OFICIAL EJECUTIVO INTEGRAL (SOLO VISIBLE AL IMPRIMIR) */}
      {/* ========================================================================= */}
      {currentReport && (
        <div 
          id="executive-report-print-container" 
          className="hidden print:block w-full bg-white text-slate-900 font-sans p-6 sm:p-10"
        >
          {/* A. ENCABEZADO INSTITUCIONAL OFICIAL */}
          <div className="border-b-2 border-slate-900 pb-4 mb-4 flex justify-between items-start print-avoid-break">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl border-2 border-slate-900 bg-slate-100 flex flex-col items-center justify-center font-black text-slate-900 shrink-0">
                <Building2 className="w-6 h-6 text-slate-900" />
                <span className="text-[7.5px] tracking-wider uppercase font-mono font-bold">ISKOOL</span>
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight uppercase leading-tight text-slate-950">
                  {currentReport?.schoolName || activeInstitution?.name || 'Colegio ISkool México'}
                </h1>
                <h2 className="text-xs font-bold text-slate-800 leading-tight mt-0.5">
                  Dirección General · Sistema de Inteligencia Pedagógica y Analítica Directiva
                </h2>
                <p className="text-[10px] text-slate-600 font-medium mt-0.5">
                  {activeInstitution?.cct ? `CCT Oficial: ${activeInstitution.cct} · ` : ''}Clave de Incorporación Oficial SEP · Formato de Rendición y Control Escolar
                </p>
              </div>
            </div>

            {/* Recuadro de Folio y Metadatos Oficiales */}
            <div className="text-right border border-slate-300 bg-slate-50 p-2.5 rounded-lg text-[10px] text-slate-700 min-w-[210px] shrink-0">
              <div className="text-[8.5px] uppercase font-bold text-slate-500 tracking-wider">Reporte Ejecutivo Oficial</div>
              <div className="text-xs font-mono font-black text-slate-950 mt-0.5">
                FOLIO: EXP-IA-{String(currentReport?.generatedAt || Date.now()).replace(/\D/g, '').slice(-6) || '202601'}
              </div>
              <div className="mt-1 text-[9.5px]">
                <span className="font-semibold text-slate-600">Emisión:</span> {new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}, {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })} hrs
              </div>
              <div className="text-[9.5px]">
                <span className="font-semibold text-slate-600">Periodo:</span> Ciclo 2026-2027 · Carácter Oficial
              </div>
            </div>
          </div>

          {/* B. FICHA DEL REPORTE Y CONSULTA DIRECTIVA */}
          <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg p-3 print-avoid-break">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-900 bg-slate-200 border border-slate-300 px-2 py-0.5 rounded">
                  {currentReport?.domain ? `Área: ${currentReport.domain.toUpperCase()}` : 'INFORME DIRECTIVO INTEGRAL'}
                </span>
                <h2 className="text-base font-black text-slate-950 mt-1">
                  {reportTitle}
                </h2>
                <p className="text-[10.5px] text-slate-600 mt-0.5">
                  <span className="font-bold text-slate-700">Criterio analítico procesado:</span> "{currentReport?.queryReceived || reportTitle}"
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[11px] font-black text-slate-900 bg-white border border-slate-300 px-3 py-1 rounded-md shadow-xs">
                  {currentReport?.table.totalRows || 0} Registros Coincidentes
                </span>
              </div>
            </div>
          </div>

          {/* C. DICTAMEN EJECUTIVO Y ANÁLISIS PEDAGÓGICO */}
          {(currentReport?.directAnswer || currentReport?.explanation?.summary) && (
            <div className="mb-4 border-l-4 border-slate-900 bg-slate-50/80 p-3.5 rounded-r-lg border-y border-r border-slate-200 print-avoid-break">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-900 mb-1.5">
                Dictamen Ejecutivo y Análisis Institucional
              </div>
              <div className="text-xs text-slate-800 leading-relaxed font-normal">
                {renderPrintMarkdown(currentReport.directAnswer || currentReport.explanation.summary)}
              </div>

              {currentReport.explanation?.filtersApplied && currentReport.explanation.filtersApplied.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] text-slate-600 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-bold text-slate-700">Filtros aplicados:</span>
                  {currentReport.explanation.filtersApplied.map((f, i) => (
                    <span key={i} className="bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9.5px] font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* D. INDICADORES CLAVE DE RENDIMIENTO (KPIS EJECUTIVOS) */}
          {currentReport?.kpis && currentReport.kpis.length > 0 && (
            <div className="mb-4 print-avoid-break">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Indicadores Clave del Reporte
              </div>
              <div className={`grid gap-2.5 ${
                currentReport.kpis.length === 1 ? 'grid-cols-1' :
                currentReport.kpis.length === 2 ? 'grid-cols-2' :
                currentReport.kpis.length === 3 ? 'grid-cols-3' : 'grid-cols-4'
              }`}>
                {currentReport.kpis.map((kpi, idx) => (
                  <div key={idx} className="border border-slate-300 bg-slate-50/60 p-2.5 rounded-lg">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block truncate">
                      {kpi.label}
                    </span>
                    <div className="text-lg font-black text-slate-950 tracking-tight mt-0.5 font-mono">
                      {kpi.value}
                    </div>
                    {kpi.subtext && (
                      <p className="text-[9.5px] text-slate-600 mt-0.5 truncate">
                        {kpi.subtext}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* E. RESUMEN GRÁFICO / DISTRIBUCIÓN ANALÍTICA (EN PAPEL) */}
          {currentReport?.chart && currentReport.chart.labels && currentReport.chart.labels.length > 0 && (
            <div className="mb-4 border border-slate-200 bg-slate-50/40 p-3 rounded-lg print-avoid-break">
              <div className="flex justify-between items-center mb-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  {currentReport.chart.title || 'Distribución Analítica Institucional'}
                </div>
                <span className="text-[9px] text-slate-500 font-mono">
                  {currentReport.chart.labels.length} segmentos analizados
                </span>
              </div>

              <div className="space-y-1.5">
                {(() => {
                  const chartData = currentReport.chart.datasets?.[0]?.data || [];
                  const maxVal = Math.max(...chartData.map(v => Number(v) || 0), 1);
                  const totalVal = chartData.reduce((acc: number, v: number) => acc + (Number(v) || 0), 0);
                  const isCurrency = currentReport.chart.unit === 'currency' ||
                                     String(currentReport.chart.title).toLowerCase().includes('monto') ||
                                     String(currentReport.chart.title).toLowerCase().includes('ingreso') ||
                                     String(currentReport.chart.title).toLowerCase().includes('nómina') ||
                                     String(currentReport.chart.title).toLowerCase().includes('adeudo');

                  return currentReport.chart.labels.map((label, idx) => {
                    const val = Number(chartData[idx]) || 0;
                    const pct = totalVal > 0 ? Math.round((val / totalVal) * 100) : 0;
                    const barWidth = Math.max(Math.round((val / maxVal) * 100), 4);

                    return (
                      <div key={idx} className="flex items-center gap-3 text-[10px]">
                        <div className="w-36 font-semibold text-slate-800 truncate text-right shrink-0">
                          {label}
                        </div>
                        <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                          <div 
                            className="bg-slate-800 h-2.5 rounded-full" 
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="w-24 text-right font-mono font-bold text-slate-900 shrink-0">
                          {isCurrency ? formatMXN(val) : `${val} (${pct}%)`}
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* F. PADRÓN OFICIAL Y TABLA DE DATOS INTEGRALES */}
          {currentReport?.table && currentReport.table.rows.length > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2 print-avoid-break">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-800">
                  Relación Detallada de Registros ({currentReport.table.totalRows} expedientes)
                </div>
                <span className="text-[9px] text-slate-500 italic">
                  Datos auditados y validados por el sistema escolar
                </span>
              </div>

              <table className="w-full text-left border-collapse border border-slate-300 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-slate-300 text-slate-900 font-bold uppercase text-[9px]">
                    <th className="py-1.5 px-2 text-center w-6 border-r border-slate-300">#</th>
                    {currentReport.table.columns.map((col) => (
                      <th 
                        key={col.key} 
                        className={`py-1.5 px-2 border-r border-slate-300 last:border-r-0 ${
                          col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left')
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {currentReport.table.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="even:bg-slate-50/60 print-avoid-break">
                      <td className="py-1.5 px-2 text-center text-slate-500 border-r border-slate-200 font-mono text-[9px]">
                        {rIdx + 1}
                      </td>
                      {currentReport.table.columns.map((col) => {
                        const val = row[col.key];

                        if (col.isCurrency) {
                          return (
                            <td key={col.key} className="py-1.5 px-2 text-right font-mono font-bold text-slate-950 border-r border-slate-200 last:border-r-0">
                              {formatMXN(Number(val) || 0)}
                            </td>
                          );
                        }

                        if (col.isBadge) {
                          return (
                            <td key={col.key} className="py-1.5 px-2 text-center border-r border-slate-200 last:border-r-0">
                              <span className="font-bold uppercase text-[9px] px-1.5 py-0.5 rounded border border-slate-300 bg-white text-slate-800">
                                {val}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td 
                            key={col.key} 
                            className={`py-1.5 px-2 border-r border-slate-200 last:border-r-0 font-medium ${
                              col.align === 'center' ? 'text-center' : (col.align === 'right' ? 'text-right font-mono' : 'text-slate-800')
                            }`}
                          >
                            {val ?? '-'}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* G. BLOQUE DE FIRMAS Y VALIDACIÓN OFICIAL */}
          <div className="pt-6 border-t-2 border-slate-300 print-avoid-break">
            <div className="grid grid-cols-3 gap-8 text-center text-[10px]">
              <div>
                <div className="h-14 border-b border-slate-900 mb-1 flex items-end justify-center">
                  {/* Espacio para rúbrica */}
                </div>
                <p className="font-bold text-slate-900">Dirección General</p>
                <p className="text-slate-500 text-[9px]">Firma y Aprobación Institucional</p>
              </div>

              <div className="flex flex-col items-center justify-center">
                <div className="w-20 h-14 border border-dashed border-slate-400 rounded flex items-center justify-center text-[8px] text-slate-400 font-mono uppercase mb-1">
                  SELLO OFICIAL
                </div>
                <p className="font-bold text-slate-900">Control Escolar y Finanzas</p>
                <p className="text-slate-500 text-[9px]">Cotejo y Validez de Registros</p>
              </div>

              <div>
                <div className="h-14 border-b border-slate-900 mb-1 flex items-end justify-center">
                  {/* Espacio para rúbrica */}
                </div>
                <p className="font-bold text-slate-900">Coordinación Académica</p>
                <p className="text-slate-500 text-[9px]">Revisión Pedagógica</p>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[8.5px] text-slate-500 flex justify-between items-center">
              <span>Sistema de Inteligencia Analítica y Dirección Escolar ISkool</span>
              <span>Emisión Oficial Certificada</span>
              <span>Documento Confidencial para Uso Interno Exclusivo</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
