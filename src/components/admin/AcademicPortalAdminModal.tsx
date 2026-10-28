"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSchoolAdminStore, getSchoolStudents, getSchoolTeachers } from '@/store/useSchoolAdminStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { DetailedStudent, Campus, OrganizationHolding, PortfolioItem } from '@/types';
import { IBIME_STUDENTS, IBIME_CAMPUSES, IBIME_TEACHERS } from '@/lib/curriculum/ibimeCatalogService';
import {
  GraduationCap,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Search,
  BookOpen,
  Star,
  Award,
  Clock,
  ChevronRight,
  X,
  Eye,
  FileText,
  Sparkles,
  Building2,
  Calendar,
  ExternalLink,
  Layers,
  Flame,
  FileCheck2,
  Mail,
  Timer,
  Network,
  Gamepad2,
  PenTool
} from 'lucide-react';
import { SUBJECTS_SEED, PORTFOLIO_SEED } from '@/store/seeds';
import { formatCdmxDate } from '@/utils/timeZoneUtils';

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

export interface AcademicIMailDispatchPayload {
  recipientName: string;
  recipientEmail: string;
  subject: string;
  body: string;
  studentName?: string;
  campusName?: string;
}

interface AcademicPortalAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: OrganizationHolding;
  schoolId?: string;
  initialCampusId?: string;
  initialStudentId?: string;
  embeddedBento?: boolean;
  boardroomPrivacyMode?: boolean;
  onDispatchToIMail?: (payload: AcademicIMailDispatchPayload) => void;
}

export function AcademicPortalAdminModal({
  isOpen,
  onClose,
  holding,
  schoolId = 'sch-ibime',
  initialCampusId,
  initialStudentId,
  embeddedBento = false,
  boardroomPrivacyMode = false,
  onDispatchToIMail
}: AcademicPortalAdminModalProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { detailedStudents, campusesList, teachersList } = useSchoolAdminStore();
  const { portfolioItems, addPortfolioFeedback } = usePortfolioStore();

  // Identidad oficial verificada del Administrador / Revisor
  const adminName = useMemo(() => {
    if (user?.first_name || user?.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    return 'Lic. Patricia Sandoval Morales';
  }, [user]);

  const adminEmail = useMemo(() => {
    return user?.email || 'direccion.general@ibime.edu.mx';
  }, [user]);

  const adminRoleTitle = 'Dirección General · Auditor, Revisor y Supervisor Académico';

  // Modos de Vista: 1. Auditoría de Alumnos 360° vs 2. Supervisión Docente & Modo Espejo
  const [activePortalTab, setActivePortalTab] = useState<'alumnos' | 'profesor'>('alumnos');

  // Filtro de Campus / Plantel y Semáforo de Cohorte
  const [selectedCampusId, setSelectedCampusId] = useState<string>(initialCampusId || 'all');
  const [cohortRiskFilter, setCohortRiskFilter] = useState<'todos' | 'destacados' | 'regular' | 'seguimiento'>('todos');
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');

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
    if (storeCampuses.length > 0) return storeCampuses;
    if (holding?.campuses && (holding.campuses as any[]).length > 0) return holding.campuses as any[];
    return [{
      id: `${schoolId || 'sch-default'}-matriz`,
      name: `${holding?.name || 'Colegio'} · Plantel Central`,
      school_id: schoolId || 'sch-default',
      studentCount: 0,
      status: 'active'
    }] as any[];
  }, [holding, schoolId, campusesList]);

  // Lista base de Alumnos por campus y holding
  const baseStudentsList = useMemo<DetailedStudent[]>(() => {
    let list: DetailedStudent[] = [];
    if (holding?.slug === 'ibime' || schoolId === 'sch-ibime') {
      list = [...IBIME_STUDENTS];
    } else {
      list = getSchoolStudents(detailedStudents, schoolId, availableCampuses);
    }

    if (selectedCampusId !== 'all') {
      list = list.filter(s =>
        s.campus_id === selectedCampusId ||
        (s.campus_name && s.campus_name.toLowerCase().includes(selectedCampusId.toLowerCase()))
      );
    }
    return list;
  }, [holding, schoolId, detailedStudents, availableCampuses, selectedCampusId]);

  // Conteos de semáforo por cohorte
  const cohortCounts = useMemo(() => {
    const destacados = baseStudentsList.filter(s => (s.average_grade || 9.5) >= 9.5).length;
    const seguimiento = baseStudentsList.filter(s => (s.average_grade || 9.5) < 8.6).length;
    const regular = Math.max(0, baseStudentsList.length - destacados - seguimiento);
    return { destacados, regular, seguimiento, total: baseStudentsList.length };
  }, [baseStudentsList]);

  // Lista filtrada por semáforo y búsqueda
  const studentsList = useMemo<DetailedStudent[]>(() => {
    return baseStudentsList.filter(s => {
      const avg = s.average_grade || 9.5;
      if (cohortRiskFilter === 'destacados' && avg < 9.5) return false;
      if (cohortRiskFilter === 'seguimiento' && avg >= 8.6) return false;
      if (cohortRiskFilter === 'regular' && (avg >= 9.5 || avg < 8.6)) return false;

      if (studentSearchQuery.trim()) {
        const q = studentSearchQuery.toLowerCase();
        const fullName = `${s.first_name} ${s.last_name_1} ${s.last_name_2 || ''} ${s.enrollment_id} ${s.grade}`.toLowerCase();
        if (!fullName.includes(q)) return false;
      }
      return true;
    });
  }, [baseStudentsList, cohortRiskFilter, studentSearchQuery]);

  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');

  useEffect(() => {
    if (initialStudentId) {
      setSelectedStudentId(initialStudentId);
      setActivePortalTab('alumnos');
    }
  }, [initialStudentId]);

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

  const formatPrivacyName = (fullName: string) => {
    if (!boardroomPrivacyMode) return fullName;
    const parts = fullName.trim().split(/\s+/);
    if (parts.length <= 1) return fullName;
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  // Evidencias del alumno seleccionado
  const studentEvidences = useMemo<PortfolioItem[]>(() => {
    if (!currentStudent) return [];

    const directMatches = (portfolioItems || []).filter(p =>
      p.student_id === currentStudent.id ||
      (p.student_profile?.id && p.student_profile.id === currentStudent.id) ||
      (currentStudent.id.includes('montes-01') && p.id === 'port-ibime-01') ||
      (currentStudent.id.includes('coac') && p.id === 'port-ibime-02')
    );

    if (directMatches.length > 0) return directMatches;

    const seedMatches = PORTFOLIO_SEED.filter(p =>
      p.student_id === currentStudent.id ||
      (currentStudent.id.includes('montes') && p.id === 'port-ibime-01') ||
      (currentStudent.id.includes('coac') && p.id === 'port-ibime-02')
    );

    if (seedMatches.length > 0) return seedMatches;

    if (schoolId !== 'sch-ibime' && schoolId !== 'sch-test-case' && holding?.slug !== 'ibime' && holding?.slug !== 'test-case') {
      return [];
    }

    return [
      {
        id: `port-${currentStudent.id}-01`,
        student_id: currentStudent.id,
        subject_id: 'sub-sci',
        title: `Proyecto STEAM: Brazo Robótico Hidráulico Automatizado`,
        description: `Diseño y construcción experimental en ${currentStudent.campus_name || 'Campus Montes'} aplicando el Principio de Pascal y control de presión.`,
        file_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=600',
        file_type: 'image',
        status: 'approved',
        self_reflection: 'Aprendí a calcular presión en pascales y optimizar la fuerza de empuje en jeringas acopladas.',
        peer_review_score: 9.8,
        peer_review_comments: 'Excelente justificación científica y pulcritud en la entrega del prototipo.',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        student_profile: currentStudent as any,
        subject: SUBJECTS_SEED[1],
        feedbacks: []
      },
      {
        id: `port-${currentStudent.id}-02`,
        student_id: currentStudent.id,
        subject_id: 'sub-math',
        title: `Ensayo Bilingüe & Modelación Matemática Aplicada`,
        description: `Argumentación académica en inglés C1 combinada con proyecciones estadísticas de impacto comunitario SEP NEM.`,
        file_url: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=600',
        file_type: 'image',
        status: 'approved',
        self_reflection: 'Logré estructurar fuentes primarias en dos idiomas y representar hallazgos con funciones lineales.',
        peer_review_score: 9.7,
        created_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
        student_profile: currentStudent as any,
        subject: SUBJECTS_SEED[0],
        feedbacks: []
      }
    ];
  }, [currentStudent, portfolioItems]);

  // Formulario de Dictamen del Administrador / Supervisor
  const [auditVerdict, setAuditVerdict] = useState<AcademicAuditLogRecord['verdict']>('Acreditación Sobresaliente');
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
        adminId: 'usr-admin-patricia',
        adminName: 'Lic. Patricia Sandoval Morales',
        adminEmail: 'direccion.general@ibime.edu.mx',
        adminRole: 'Dirección General · Auditor, Revisor y Supervisor Académico',
        verdict: 'Acreditación Sobresaliente',
        notes: 'Auditoría de evidencia STEAM. Demuestra dominio sobresaliente del Principio de Pascal y modelación bilingüe.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        campusName: 'Campus Montes (Sede Matriz & CCH)',
        evidenceTitle: 'Brazo Robótico Hidráulico Automatizado'
      }
    ];
  });

  const showPortalToast = (msg: string) => {
    setAuditSuccessToast(msg);
    setTimeout(() => setAuditSuccessToast(null), 5000);
  };

  // Guardar dictamen con identificación de cuenta del administrador
  const handleSaveAuditVerdict = (e?: React.FormEvent, notifyIMail = false) => {
    if (e) e.preventDefault();
    if (!currentStudent) return;

    const fullStudentName = `${currentStudent.first_name} ${currentStudent.last_name_1} ${currentStudent.last_name_2 || ''}`.trim();
    const effectiveNotes = auditNotes.trim() || `Validación directiva de portafolio STEAM y cobertura de los 4 Campos Formativos SEP NEM 2024 (${auditVerdict}).`;

    const newRecord: AcademicAuditLogRecord = {
      id: `aud-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: fullStudentName,
      adminId: user?.id || 'usr-admin-current',
      adminName,
      adminEmail,
      adminRole: adminRoleTitle,
      verdict: auditVerdict,
      notes: effectiveNotes,
      timestamp: new Date().toISOString(),
      campusName: currentStudent.campus_name || 'Campus Montes',
      evidenceTitle: studentEvidences[0]?.title || 'Revisión General de Portafolio'
    };

    const updated = [newRecord, ...auditLogs];
    setAuditLogs(updated);

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('iskool_academic_audit_log', JSON.stringify(updated));
      }
    } catch (err) {}

    if (studentEvidences.length > 0) {
      addPortfolioFeedback(
        studentEvidences[0].id,
        `[Dictamen de Dirección General]: ${newRecord.verdict} por ${adminName} (${adminEmail}) — "${newRecord.notes}"`,
        'teacher',
        user?.id || 'admin-id'
      );
    }

    setAuditNotes('');

    if (notifyIMail && onDispatchToIMail) {
      onDispatchToIMail({
        recipientName: currentStudent.tutor_name || `Familia ${currentStudent.last_name_1}`,
        recipientEmail: `familia.${currentStudent.last_name_1.toLowerCase()}@comunidad.ibime.edu.mx`,
        subject: `Dictamen Oficial de Dirección General: ${newRecord.verdict} — ${fullStudentName}`,
        body: `Estimada Familia ${currentStudent.last_name_1}:\n\nPor medio del presente comunicado institucional, la Dirección General hace constar que el portafolio de evidencias académicas y proyectos STEAM de ${fullStudentName} (${currentStudent.grade} · ${currentStudent.campus_name || 'Campus Montes'}) ha sido auditado con el dictamen:\n\n• Resolución: ${newRecord.verdict}\n• Observación Directiva: "${effectiveNotes}"\n\nAtentamente,\n${adminName}\nDirección General · ${holding.name}`,
        studentName: fullStudentName,
        campusName: currentStudent.campus_name || 'Campus Montes'
      });
      return;
    }

    showPortalToast(`✓ Dictamen "${newRecord.verdict}" sellado en expediente inmutable por ${adminName}.`);
  };

  // Firma de Dictamen por Lote en 1-Clic (Batch Sign-Off)
  const handleBatchSignOff = () => {
    const batchTarget = studentsList.slice(0, Math.min(12, studentsList.length));
    if (batchTarget.length === 0) return;

    const batchRecords: AcademicAuditLogRecord[] = batchTarget.map((stu, idx) => ({
      id: `aud-batch-${Date.now()}-${idx}`,
      studentId: stu.id,
      studentName: `${stu.first_name} ${stu.last_name_1}`,
      adminId: user?.id || 'usr-admin-current',
      adminName,
      adminEmail,
      adminRole: adminRoleTitle,
      verdict: cohortRiskFilter === 'seguimiento' ? 'Seguimiento Prioritario' : 'Acreditación Sobresaliente',
      notes: `Firma digital en lote (1-Clic) sobre portafolios verificados de la cohorte activa (${stu.grade}).`,
      timestamp: new Date().toISOString(),
      campusName: stu.campus_name || 'Campus Montes',
      evidenceTitle: 'Auditoría Colegiada por Lote STEAM / SEP NEM'
    }));

    const updated = [...batchRecords, ...auditLogs];
    setAuditLogs(updated);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('iskool_academic_audit_log', JSON.stringify(updated));
      }
    } catch (err) {}

    showPortalToast(`✍️ Firma en Lote Ejecutada: ${batchRecords.length} portafolios sellados por ${adminName} a 0 Tokens.`);
  };

  // Docentes del colegio para la Vista 2 (Supervisión Docente & Modo Espejo)
  const currentTeachers = useMemo(() => {
    let list = (holding?.slug === 'ibime' || schoolId === 'sch-ibime')
      ? [...IBIME_TEACHERS]
      : getSchoolTeachers(teachersList, schoolId, availableCampuses);

    if (selectedCampusId !== 'all') {
      list = list.filter(t =>
        t.campus_id === selectedCampusId ||
        (t.campus_name && t.campus_name.toLowerCase().includes(selectedCampusId.toLowerCase()))
      );
    }
    return list;
  }, [holding, schoolId, teachersList, availableCampuses, selectedCampusId]);

  const [selectedMirrorTeacherId, setSelectedMirrorTeacherId] = useState<string>('');
  const [isLessonPlanViewerOpen, setIsLessonPlanViewerOpen] = useState<boolean>(false);
  const [lessonPlanSupervisorNotes, setLessonPlanSupervisorNotes] = useState<string>('');
  const [approvedTeacherPlans, setApprovedTeacherPlans] = useState<
    Record<string, { approvedAt: string; approver: string; notes: string; folio: string }>
  >({});

  useEffect(() => {
    if (currentTeachers.length > 0 && (!selectedMirrorTeacherId || !currentTeachers.some(t => t.id === selectedMirrorTeacherId))) {
      setSelectedMirrorTeacherId(currentTeachers[0].id);
    }
  }, [currentTeachers, selectedMirrorTeacherId]);

  const activeMirrorTeacher = useMemo(() => {
    return currentTeachers.find(t => t.id === selectedMirrorTeacherId) || currentTeachers[0] || null;
  }, [currentTeachers, selectedMirrorTeacherId]);

  // Datos enriquecidos deterministas para el Modo Espejo de Aula en Vivo + Planeación Didáctica Completa (Vault-First)
  const mirrorLessonTelemetry = useMemo(() => {
    if (!activeMirrorTeacher) return null;
    const seed = (activeMirrorTeacher.first_name.length + activeMirrorTeacher.last_name.length) % 3;
    const lessons = [
      {
        sessionTitle: 'Sesión 14: Hidráulica Aplicada y Principio de Pascal (50 min)',
        subject: 'Ciencias, Física y Robótica STEAM',
        campoFormativo: 'Saberes y Pensamiento Científico',
        faseGrado: 'Fase 6 · Secundaria 2° / Bachillerato CCH',
        metodologia: 'Aprendizaje Basado en Indagación (Enfoque STEAM)',
        ejesArticuladores: ['Pensamiento Crítico', 'Inclusión', 'Vida Saludable'],
        vaultPath: 'planeaciones/fase-6/ciencias-fisica/PDA-FIS-2026-04.md',
        pdaCode: '[[PDA-FIS-2026-04]]',
        pdaTitle: 'Principio de Pascal, Mecánica de Fluidos y Prototipado en Lienzo Digital',
        pdaFullText:
          'Experimenta e interpreta las interacciones de la fuerza y el movimiento relacionados con los principios de Pascal y de Arquímedes, para explicar actividades cotidianas y diseñar prototipos neumáticos o hidráulicos de impacto comunitario.',
        problematizacion:
          'En el entorno metropolitano del plantel, los estudiantes analizan cómo los sistemas de elevación y frenado hidráulico permiten multiplicar fuerzas con bajo consumo energético, diseñando un prototipo funcional con jeringas interconectadas.',
        aldeaMission: 'Prensa Hidráulica Comunitaria (+250 XP)',
        coveragePct: 98,
        timedPct: 100,
        groupAvg: 9.5,
        missionsDone: 46,
        phase1: 'Inicio (10 min): Detonador Situado y Pregunta Generadora [Completado]',
        phase1Detail: {
          tiempo: '10 minutos (Min 00 - Min 10)',
          actividadDocente:
            'Presenta un gato hidráulico real frente al grupo y plantea la pregunta detonadora: "¿Cómo puede una persona levantar un automóvil de 1,500 kg aplicando únicamente la fuerza de su mano?".',
          actividadAlumnos:
            'Formulan hipótesis iniciales en su bitácora del Lienzo Digital y registran las variables de área transversal (A1, A2) y fuerza (F1, F2).',
          recursos: 'Pizarrón interactivo, jeringas graduadas de 10 ml y 60 ml, nodo [[Concepto-Presion-Hidrostática]].'
        },
        phase2: 'Desarrollo (30 min · En Curso): Construcción en Lienzo Digital & Laboratorio',
        phase2Detail: {
          tiempo: '30 minutos (Min 10 - Min 40)',
          actividadDocente:
            'Guía a las células STEAM en la deducción experimental de P1 = P2 (F1/A1 = F2/A2), supervisando mediciones de presión en Pascales (N/m²) y el ensamblado del brazo hidráulico.',
          actividadAlumnos:
            'Construyen en equipos de 4 integrantes un elevador hidráulico a escala, miden la ventaja mecánica obtenida y grafican la relación lineal Fuerza vs. Área en el Lienzo Digital.',
          recursos: 'Kit de mangueras de látex, fluido coloreado, dinamómetro escolar, simulador interactivo en Lienzo Digital.'
        },
        phase3: 'Cierre (10 min): Rúbrica Analítica SEP NEM y Autoevaluación',
        phase3Detail: {
          tiempo: '10 minutos (Min 40 - Min 50)',
          actividadDocente:
            'Modera la demostración de carga de cada prototipo, aplica la rúbrica analítica SEP NEM en tiempo real y vincula la evidencia al Portafolio 360°.',
          actividadAlumnos:
            'Demuestran el levantamiento de una masa de 500 g con su prototipo, suben fotografía/telemetría al Portafolio 360° y desbloquean +250 XP en La Aldea.',
          recursos: 'Rúbrica Analítica Digital, Portafolio de Evidencias 360°, nodo [[MOC-Mecanica-Fluidos-NEM]].'
        },
        entregableTangible:
          'Prototipo funcional de brazo/prensa hidráulica documentado con memoria de cálculo (F1/A1 = F2/A2) y gráfica comparativa en el Lienzo Digital.',
        ajustesDUA:
          'Andamiaje visual con diagramas de vectores de color alto contraste, plantillas pre-estructuradas de despeje algebraico y roles diferenciados dentro de la célula STEAM.',
        vaultLinks: ['[[PDA-FIS-2026-04]]', '[[Principio-de-Pascal]]', '[[MOC-Saberes-Cientificos-F6]]', '[[Rubrica-STEAM-Hidraulica]]'],
        rubricaCriteria: [
          {
            criterio: '1. Comprensión y Modelación Matemática (F1/A1 = F2/A2)',
            sobresaliente: 'Deduce y despeja sin error todas las variables de presión y ventaja mecánica con unidades SI (Pa, N, m²).',
            satisfactorio: 'Aplica correctamente la fórmula del Principio de Pascal con leves omisiones en conversión de unidades.',
            basico: 'Identifica la relación cualitativa entre área y fuerza pero requiere apoyo en el despeje numérico.',
            requiereApoyo: 'Confunde presión con fuerza absoluta; requiere acompañamiento guiado paso a paso.'
          },
          {
            criterio: '2. Construcción y Funcionalidad del Prototipo Hidráulico',
            sobresaliente: 'El prototipo opera sin fugas ni burbujas de aire, logrando levantar la masa objetivo con precisión y estabilidad.',
            satisfactorio: 'El prototipo es funcional y levanta la carga, presentando mínima fricción en los émbolos.',
            basico: 'El mecanismo transmite movimiento parcial pero presenta fugas o aire atrapado en el circuito.',
            requiereApoyo: 'Prototipo incompleto; requiere reensamblaje asistido en laboratorio.'
          },
          {
            criterio: '3. Argumentación Científica y Registro en Lienzo Digital',
            sobresaliente: 'Sustenta hallazgos con vocabulario técnico bilingüe, gráficas exactas y reflexión metacognitiva profunda.',
            satisfactorio: 'Registra mediciones completas y explica verbalmente el funcionamiento del sistema hidráulico.',
            basico: 'Entrega reporte con datos parciales y conclusiones descriptivas breves.',
            requiereApoyo: 'Sin registro completo en el Lienzo Digital al cierre de la sesión.'
          }
        ]
      },
      {
        sessionTitle: 'Sesión 19: Modelación Algebraica y Estadística Inferencial (50 min)',
        subject: 'Saberes y Pensamiento Matemático CCH',
        campoFormativo: 'Saberes y Pensamiento Científico',
        faseGrado: 'Fase 6 · Secundaria 3° / Bachillerato CCH',
        metodologia: 'Aprendizaje Basado en Problemas (ABP Situado)',
        ejesArticuladores: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
        vaultPath: 'planeaciones/fase-6/matematicas/PDA-MAT-2026-08.md',
        pdaCode: '[[PDA-MAT-2026-08]]',
        pdaTitle: 'Funciones Lineales, Tasas de Variación y Simulación Financiera',
        pdaFullText:
          'Relaciona e interpreta la variación de dos cantidades a partir de su representación tabular, gráfica y algebraica (y = mx + b) para modelar fenómenos económicos, ambientales y de sustentabilidad escolar.',
        problematizacion:
          'Los alumnos proyectan el ahorro energético y presupuestal del campus mediante modelos lineales de consumo eléctrico y captación pluvial.',
        aldeaMission: 'Arquitectos del Equilibrio Cuántico (+300 XP)',
        coveragePct: 96,
        timedPct: 98,
        groupAvg: 9.3,
        missionsDone: 41,
        phase1: 'Inicio (10 min): Activación de Saberes Previos con Reto Real [Completado]',
        phase1Detail: {
          tiempo: '10 minutos (Min 00 - Min 10)',
          actividadDocente:
            'Presenta la serie histórica real de consumo energético del plantel y solicita identificar la razón de cambio (pendiente m) y la ordenada al origen (b).',
          actividadAlumnos:
            'Analizan la tabla de datos en el Lienzo Digital e identifican variables dependientes e independientes.',
          recursos: 'Dataset escolar en Lienzo Digital, nodo [[Funciones-Lineales-CCH]].'
        },
        phase2: 'Desarrollo (30 min · En Curso): Resolución Colaborativa en Lienzo Digital',
        phase2Detail: {
          tiempo: '30 minutos (Min 10 - Min 40)',
          actividadDocente:
            'Supervisa la construcción de las ecuaciones algebraicas y el trazado de rectas de tendencia, verificando la interpretación de la pendiente.',
          actividadAlumnos:
            'Modelan 3 escenarios de optimización en equipo, comparan intersecciones de equilibrio y validan sus gráficas.',
          recursos: 'Graficador interactivo del Lienzo Digital, hojas de cálculo colaborativas.'
        },
        phase3: 'Cierre (10 min): Coevaluación por Pares y Bitácora de Bóveda',
        phase3Detail: {
          tiempo: '10 minutos (Min 40 - Min 50)',
          actividadDocente:
            'Dirige la coevaluación cruzada con rúbrica analítica y certifica el envío de evidencias al Portafolio 360°.',
          actividadAlumnos:
            'Presentan su proyección óptima en 90 segundos, sellan coevaluación y acreditan +300 XP en La Aldea.',
          recursos: 'Rúbrica Analítica SEP NEM, Portafolio 360°.'
        },
        entregableTangible:
          'Modelo matemático y gráfico interactivo (y = mx + b) con dictamen de punto de equilibrio energético.',
        ajustesDUA:
          'Codificación cromática para pendiente (m) e intercepto (b), calculadoras gráficas accesibles y tutoría entre pares.',
        vaultLinks: ['[[PDA-MAT-2026-08]]', '[[Modelacion-Lineal]]', '[[MOC-Matematicas-CCH]]'],
        rubricaCriteria: [
          {
            criterio: '1. Formulación Algebraica de la Función (y = mx + b)',
            sobresaliente: 'Determina con exactitud la pendiente y ordenada al origen a partir de datos reales y explica su significado físico.',
            satisfactorio: 'Construye correctamente la ecuación lineal y calcula valores futuros sin errores mayores.',
            basico: 'Calcula la pendiente con apoyo pero presenta imprecisiones al graficar la ordenada al origen.',
            requiereApoyo: 'Requiere guía directa para traducir pares ordenados a una expresión algebraica.'
          },
          {
            criterio: '2. Representación Gráfica y Análisis de Tendencia',
            sobresaliente: 'Traza escalas precisas, identifica puntos de intersección y fundamenta decisiones con base en la gráfica.',
            satisfactorio: 'Grafica correctamente las funciones y señala el punto de equilibrio.',
            basico: 'Gráfica incompleta en rotulación de ejes o escala irregular.',
            requiereApoyo: 'No logra vincular la tabla de valores con el plano cartesiano.'
          }
        ]
      },
      {
        sessionTitle: 'Sesión 22: Argumentación Crítica Bilingüe & Debate Histórico (50 min)',
        subject: 'Lenguajes & Certificación Internacional C1',
        campoFormativo: 'Lenguajes',
        faseGrado: 'Fase 6 · Secundaria / Bachillerato Bicultural',
        metodologia: 'Aprendizaje Basado en Proyectos Comunitarios',
        ejesArticuladores: ['Interculturalidad Crítica', 'Pensamiento Crítico', 'Igualdad de Género'],
        vaultPath: 'planeaciones/fase-6/lenguajes/PDA-LEN-2026-11.md',
        pdaCode: '[[PDA-LEN-2026-11]]',
        pdaTitle: 'Producción de Ensayos Bilingües y Oratoria Forense',
        pdaFullText:
          'Recupera recursos expresivos y argumentativos en español e inglés académico (Nivel C1) para redactar textos críticos y participar en mesas de debate fundamentadas en fuentes primarias.',
        problematizacion:
          'Fortalecer la competencia argumentativa bilingüe y la verificación rigurosa de fuentes primarias frente a la desinformación digital.',
        aldeaMission: 'Crónicas de la Soberanía (+220 XP)',
        coveragePct: 97,
        timedPct: 99,
        groupAvg: 9.6,
        missionsDone: 52,
        phase1: 'Inicio (10 min): Lectura Analítica de Fuentes Primarias [Completado]',
        phase1Detail: {
          tiempo: '10 minutos (Min 00 - Min 10)',
          actividadDocente:
            'Presenta dos crónicas históricas contrastantes en español e inglés C1, guiando la identificación de tesis, tono y evidencia.',
          actividadAlumnos:
            'Subrayan premisas centrales y conectores lógicos de alto registro en el Lienzo Digital.',
          recursos: 'Antología bilingüe en Bóveda Curricular, nodo [[Oratoria-Forense-C1]].'
        },
        phase2: 'Desarrollo (30 min · En Curso): Mesa de Debate Estructurado en Aula',
        phase2Detail: {
          tiempo: '30 minutos (Min 10 - Min 40)',
          actividadDocente:
            'Modera los turnos de réplica y contrarréplica cronometrados, evaluando fluidez C1, sintaxis académica y respeto al canon documental.',
          actividadAlumnos:
            'Exponen posturas fundamentadas en equipos y redactan la síntesis conclusiva bilingüe.',
          recursos: 'Cronómetro de debate parlamentario, Lienzo Digital colaborativo.'
        },
        phase3: 'Cierre (10 min): Sello de Rúbrica Analítica y Portafolio',
        phase3Detail: {
          tiempo: '10 minutos (Min 40 - Min 50)',
          actividadDocente:
            'Retroalimenta el desempeño retórico y gramatical, sellando la rúbrica analítica individual y grupal.',
          actividadAlumnos:
            'Publican su ensayo final en el Portafolio 360° y desbloquean +220 XP en La Aldea.',
          recursos: 'Rúbrica Analítica Bilingüe C1, Portafolio 360°.'
        },
        entregableTangible:
          'Ensayo argumentativo bilingüe (350 palabras ES / 350 palabras EN C1) con aparato crítico y grabación de réplica oral.',
        ajustesDUA:
          'Glosario interactivo de conectores académicos C1, organizadores gráficos tipo Toulmin y tiempos extendidos de preparación.',
        vaultLinks: ['[[PDA-LEN-2026-11]]', '[[Argumentacion-Toulmin]]', '[[MOC-Lenguajes-Bicultural]]'],
        rubricaCriteria: [
          {
            criterio: '1. Estructura Argumentativa (Tesis, Evidencia y Garantía)',
            sobresaliente: 'Articula tesis sólida con al menos 3 fuentes primarias verificables y refutación anticipada impecable.',
            satisfactorio: 'Presenta tesis clara y argumentos respaldados por fuentes documentales pertinentes.',
            basico: 'Expone opiniones generales con escasa referencia textual a las fuentes revisadas.',
            requiereApoyo: 'Texto descriptivo sin postura argumentativa definida.'
          },
          {
            criterio: '2. Dominio Lingüístico Bilingüe (Estándar C1)',
            sobresaliente: 'Emplea estructuras sintácticas complejas y léxico especializado con fluidez y precisión idiomática.',
            satisfactorio: 'Comunica ideas con claridad y vocabulario académico apropiado al nivel.',
            basico: 'Presenta interferencias gramaticales recurrentes que no impiden la comprensión global.',
            requiereApoyo: 'Vocabulario elemental; requiere andamiaje sintáctico bilingüe.'
          }
        ]
      }
    ];
    return lessons[seed];
  }, [activeMirrorTeacher]);

  const handleApproveTeacherPlan = (teacher: typeof activeMirrorTeacher, plan: typeof mirrorLessonTelemetry, customNotes?: string) => {
    if (!teacher || !plan) return;
    const folio = `NEM-BOV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    const finalNotes =
      (customNotes ?? lessonPlanSupervisorNotes).trim() ||
      `Planeación auditada y aprobada por Dirección General. Cumple al 100% con PDA oficial SEP NEM 2024, secuencia cronometrada (Inicio/Desarrollo/Cierre) y rúbrica analítica.`;

    setApprovedTeacherPlans(prev => ({
      ...prev,
      [teacher.id]: {
        approvedAt: `Hoy, ${nowStr}`,
        approver: adminName,
        notes: finalNotes,
        folio
      }
    }));

    setLessonPlanSupervisorNotes('');
    showPortalToast(
      `✓ Planeación ${plan.pdaCode} de Prof. ${teacher.first_name} ${teacher.last_name} aprobada y sellada en Bóveda Curricular (Folio ${folio}).`
    );
  };

  if (!isOpen) return null;

  const mainContent = (
    <div
      className={
        embeddedBento
          ? 'bg-white rounded-3xl w-full border border-slate-200/90 shadow-xs overflow-hidden flex flex-col select-none'
          : 'bg-white rounded-3xl max-w-6xl xl:max-w-7xl 2xl:max-w-[1560px] w-full max-h-[96vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 select-none'
      }
    >
      {/* ========================================================================= */}
      {/* 1. SUB-HEADER BENTO CONMUTADOR + CREDENCIAL INMUTABLE DEL AUDITOR         */}
      {/* ========================================================================= */}
      <div className="px-5 py-3.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        {/* Píldoras Maestras de Vista (Alumnos 360° vs Supervisión Docente Modo Espejo) */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => setActivePortalTab('alumnos')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'alumnos'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activePortalTab === 'alumnos' ? 'bg-white' : 'bg-slate-400'}`} />
            <Users size={15} />
            <span>1. Auditoría de Alumnos 360° ({baseStudentsList.length.toLocaleString()})</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortalTab('profesor')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
              activePortalTab === 'profesor'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-white/70'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${activePortalTab === 'profesor' ? 'bg-white' : 'bg-slate-400'}`} />
            <GraduationCap size={15} />
            <span>2. Supervisión Docente & Modo Espejo ({currentTeachers.length})</span>
          </button>
        </div>

        {/* Credencial de Supervisor Directivo & Selector de Plantel */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <Shield size={14} className="text-indigo-600 shrink-0" />
            <span>Auditor Activo: <strong className="font-black text-slate-900">{adminName}</strong></span>
            <span className="text-slate-300">·</span>
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Trazabilidad Inmutable
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800">
            <Building2 size={14} className="text-indigo-600 shrink-0" />
            <select
              value={selectedCampusId}
              onChange={(e) => setSelectedCampusId(e.target.value)}
              className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer"
              title="Filtrar por plantel"
            >
              <option value="all">Plantel: Todos ({availableCampuses.length})</option>
              {availableCampuses.map(campus => (
                <option key={campus.id} value={campus.id}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>

          {!embeddedBento && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Cerrar Portal Académico"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Notificación de Éxito de Auditoría */}
      {auditSuccessToast && (
        <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-5 py-2.5 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <span>{auditSuccessToast}</span>
          </div>
          <button onClick={() => setAuditSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950 font-black">✕</button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VISTA 1: AUDITORÍA DE ALUMNOS 360°, PORTAFOLIO STEAM & DICTAMEN LOTE   */}
      {/* ========================================================================= */}
      {activePortalTab === 'alumnos' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
          {/* Barra de Semáforo por Cohorte + Buscador + Firma de Dictamen por Lote (1-Clic) */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Buscador rápido de alumno */}
              <div className="relative min-w-[210px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Buscar alumno o matrícula..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Selector desplegable directo */}
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-900 font-bold text-xs focus:outline-none cursor-pointer max-w-[290px] truncate"
                title="Seleccionar alumno del padrón"
              >
                {studentsList.map((std) => (
                  <option key={std.id} value={std.id}>
                    {formatPrivacyName(`${std.first_name} ${std.last_name_1}`)} — {std.grade} ({std.enrollment_id})
                  </option>
                ))}
              </select>

              {/* Píldoras del Semáforo Pedagógico */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setCohortRiskFilter('todos')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    cohortRiskFilter === 'todos'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Todos ({cohortCounts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setCohortRiskFilter('destacados')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    cohortRiskFilter === 'destacados'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-indigo-50/70 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                  }`}
                >
                  <Star size={12} className={cohortRiskFilter === 'destacados' ? 'text-amber-300 fill-amber-300' : 'text-amber-500 fill-amber-500'} />
                  <span>Destacados ({cohortCounts.destacados})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCohortRiskFilter('regular')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    cohortRiskFilter === 'regular'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-emerald-50/70 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Regular ({cohortCounts.regular})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCohortRiskFilter('seguimiento')}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                    cohortRiskFilter === 'seguimiento'
                      ? 'bg-amber-500 text-slate-950 border-amber-500'
                      : 'bg-amber-50/80 text-amber-900 border-amber-200 hover:bg-amber-100'
                  }`}
                >
                  <AlertTriangle size={12} className="text-amber-600" />
                  <span>En Seguimiento ({cohortCounts.seguimiento})</span>
                </button>
              </div>
            </div>

            {/* Botón Firma de Dictamen por Lote en 1-Clic */}
            <button
              type="button"
              onClick={handleBatchSignOff}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-indigo-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer active:scale-95 flex items-center gap-1.5 shrink-0"
              title="Sellar dictamen directivo para el lote filtrado en 1 clic"
            >
              <PenTool size={13} className="text-amber-300" />
              <span>Firmar Dictamen por Lote (1-Clic)</span>
            </button>
          </div>

          {/* CUADRÍCULA BENTO 12 COLUMNAS: FICHA 360° (4 COLS) + EVIDENCIAS Y DICTAMEN (8 COLS) */}
          {currentStudent ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* COLUMNA IZQUIERDA (4 COLS): FICHA INTEGRAL DEL ESTUDIANTE 360° + 4 CAMPOS FORMATIVOS SEP */}
              <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                      Ficha Integral del Estudiante 360°
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 font-bold">
                      {currentStudent.enrollment_id}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                      {currentStudent.first_name.charAt(0)}{currentStudent.last_name_1.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-black text-slate-900 text-base leading-tight truncate">
                        {formatPrivacyName(`${currentStudent.first_name} ${currentStudent.last_name_1} ${currentStudent.last_name_2 || ''}`)}
                      </h4>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        {currentStudent.grade} · {currentStudent.campus_name || 'Campus Montes'}
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        CURP: {boardroomPrivacyMode ? '••••••••••••••' : currentStudent.curp}
                      </span>
                    </div>
                  </div>

                  {/* 4 Píldoras de Métricas Clave */}
                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-500 block">Promedio General</span>
                      <span className="text-base font-black text-slate-900 font-mono">{currentStudent.average_grade || 9.8}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-500 block">Asistencia SEP</span>
                      <span className="text-base font-black text-emerald-600 font-mono">98.5%</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-500 block">Nivel La Aldea</span>
                      <span className="text-xs font-black text-indigo-700 flex items-center gap-1 mt-0.5">
                        <Flame size={13} className="text-amber-500 shrink-0" />
                        Nivel 14 (Héroe)
                      </span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-500 block">Beca Excelencia</span>
                      <span className="text-xs font-black text-slate-800 mt-0.5 block">
                        {currentStudent.scholarship_percentage ? `${currentStudent.scholarship_percentage}% Activa` : '25% Excelencia'}
                      </span>
                    </div>
                  </div>

                  {/* Avance Curricular SEP NEM 2024 (4 Campos Formativos Siempre Visibles) */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">
                        Avance Curricular SEP NEM 2024 (4 Campos)
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        PDA Oficial
                      </span>
                    </div>

                    {[
                      { label: 'Lenguajes (Bilingüe C1)', pct: 98, color: 'bg-emerald-500' },
                      { label: 'Saberes y Pensamiento Científico (STEAM)', pct: 96, color: 'bg-indigo-600' },
                      { label: 'Ética, Naturaleza y Sociedades', pct: 94, color: 'bg-sky-500' },
                      { label: 'De lo Humano y lo Comunitario', pct: 97, color: 'bg-amber-500' },
                    ].map((campo, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{campo.label}</span>
                          <span className="font-mono font-black text-slate-900">{campo.pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${campo.color} rounded-full`} style={{ width: `${campo.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* COLUMNA DERECHA (8 COLS): PORTAFOLIO DE EVIDENCIAS STEAM + CONSOLA DE DICTAMEN DIRECTIVO */}
              <div className="lg:col-span-8 space-y-4">
                {/* Tarjetas de Evidencias Tangibles Auditables */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-black text-sm text-slate-900 flex items-center gap-2">
                        <FileCheck2 size={16} className="text-indigo-600" />
                        <span>Portafolio de Evidencias Auditables & Reflexión del Alumno</span>
                      </h5>
                      <p className="text-xs text-slate-500">
                        Proyectos situados calificados con rúbrica analítica SEP NEM 2024 y coevaluación entre pares.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
                      {studentEvidences.length} Entregables Verificados
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {studentEvidences.map((ev, idx) => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 transition-all flex flex-col justify-between space-y-3"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800">
                              Evidencia #{idx + 1} · {ev.subject?.name || 'STEAM & NEM'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Calendar size={11} />
                              {formatCdmxDate(new Date(ev.created_at))}
                            </span>
                          </div>

                          <h6 className="font-black text-sm text-slate-900 leading-snug">
                            {ev.title}
                          </h6>
                          <p className="text-xs text-slate-600 leading-relaxed">
                            {ev.description}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800">
                              Calificación: <strong className="text-indigo-600 font-mono">10.0</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-800">
                              Coevaluación: <strong className="text-emerald-600 font-mono">{ev.peer_review_score || 9.8}</strong>
                            </span>
                          </div>

                          {ev.self_reflection && (
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs text-slate-700 italic">
                              "{ev.self_reflection}"
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-black text-[11px] flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            Evidencia Verificada
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setAuditNotes(`Evidencia auditada directamente por Dirección General: "${ev.title}". Cumplimiento sobresaliente de rúbrica analítica SEP NEM.`);
                              showPortalToast(`✓ Evidencia "${ev.title}" cargada en la Consola de Dictamen.`);
                            }}
                            className="px-3 py-1 rounded-lg bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold text-xs cursor-pointer transition-colors"
                          >
                            Citar en Dictamen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Consola de Dictamen del Supervisor Directivo · Trazabilidad Inmutable */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Award size={18} className="text-indigo-600" />
                      <div>
                        <h5 className="font-black text-sm text-slate-900">
                          Consola de Dictamen del Supervisor Directivo · Trazabilidad Inmutable
                        </h5>
                        <p className="text-xs text-slate-500">
                          Sella el dictamen en el expediente del alumno y despacha notificación oficial a la familia y al profesor titular.
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">
                      Firma: <strong className="text-slate-800">{adminEmail}</strong>
                    </span>
                  </div>

                  {/* Píldoras de Resolución de 1-Clic */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
                    {([
                      { id: 'Acreditación Sobresaliente', label: '🏆 Acreditación Sobresaliente' },
                      { id: 'Aprobado por Dirección', label: '✓ Aprobado por Dirección' },
                      { id: 'Observación Pedagógica', label: '📌 Observación Pedagógica' },
                      { id: 'Seguimiento Prioritario', label: '⚠️ Seguimiento Prioritario' },
                    ] as const).map((opt) => {
                      const active = auditVerdict === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setAuditVerdict(opt.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-black border text-left transition-all cursor-pointer flex items-center gap-2 ${
                            active
                              ? 'bg-indigo-50 border-indigo-600 text-indigo-950 shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${active ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                          <span className="truncate">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <textarea
                    rows={2}
                    value={auditNotes}
                    onChange={(e) => setAuditNotes(e.target.value)}
                    placeholder={`Observaciones institucionales de Dirección General para ${currentStudent.first_name} ${currentStudent.last_name_1}...`}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-indigo-500 font-medium"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => handleSaveAuditVerdict(e, false)}
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-sm transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                      >
                        <Shield size={14} />
                        <span>Emitir y Sellar Dictamen en Expediente</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleSaveAuditVerdict(e, true)}
                        className="px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-slate-800 hover:text-indigo-800 font-bold text-xs border border-slate-300 hover:border-indigo-300 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
                      >
                        <Mail size={14} className="text-indigo-600" />
                        <span>Notificar Reconocimiento a Familia y Docente vía iMail</span>
                      </button>
                    </div>

                    {auditLogs.length > 0 && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        Último sello: <strong className="text-slate-700">{auditLogs[0].verdict}</strong> ({auditLogs[0].studentName.split(' ')[0]})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-sm font-semibold">No se encontraron alumnos con los filtros seleccionados.</p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. VISTA 2: SUPERVISIÓN DOCENTE 360° & MODO ESPEJO DE AULA SIN REDIRECCIÓN */}
      {/* ========================================================================= */}
      {activePortalTab === 'profesor' && (
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
          {/* Barra Superior de Telemetría Docente Consolidada */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-600" />
                <span>100% Planeaciones Validadas en Bóveda Curricular</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-black flex items-center gap-1.5">
                <Timer size={14} className="text-indigo-600" />
                <span>96.4% Sesiones Cronometradas en Tiempo</span>
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-black flex items-center gap-1.5">
                <Gamepad2 size={14} className="text-purple-600" />
                <span>+18% Velocidad XP en La Aldea</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!embeddedBento) onClose();
                router.push(`/teacher?school_id=${encodeURIComponent(schoolId)}&role=admin`);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5"
              title="Abrir vista completa del portal de profesor en otra ruta"
            >
              <ExternalLink size={13} />
              <span>Abrir Entorno Docente Externo</span>
            </button>
          </div>

          {/* PANTALLA DIVIDIDA 12 COLUMNAS: MATRIZ DOCENTE (6 COLS) + MODO ESPEJO DE AULA EN VIVO (6 COLS) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* MITAD IZQUIERDA (6 COLS): MATRIZ DE DESEMPEÑO DOCENTE POR PLANTEL */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">
                    Matriz de Desempeño Docente por Plantel ({currentTeachers.length} Profesores)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Selecciona cualquier docente para inspeccionar su aula y planeación en vivo sin salir del tablero.
                  </p>
                </div>
              </div>

              <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                {currentTeachers.map((tea, idx) => {
                  const isSelected = activeMirrorTeacher?.id === tea.id;
                  const covPct = 98 - (idx % 3);
                  const avgGroup = (9.5 - (idx % 3) * 0.2).toFixed(1);
                  const missions = 42 + (idx % 4) * 5;
                  const approvalRecord = approvedTeacherPlans[tea.id];
                  return (
                    <div
                      key={tea.id || idx}
                      onClick={() => setSelectedMirrorTeacherId(tea.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                        isSelected
                          ? 'bg-indigo-50/50 border-2 border-indigo-600 shadow-sm'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-indigo-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl text-white flex items-center justify-center font-black text-sm shrink-0 ${
                            isSelected ? 'bg-indigo-600' : 'bg-slate-800'
                          }`}>
                            {tea.first_name.charAt(0)}{tea.last_name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h5 className="font-black text-sm text-slate-900">
                                Prof. {tea.first_name} {tea.last_name}
                              </h5>
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase">
                                  En Espejo Ahora
                                </span>
                              )}
                              {approvalRecord && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black">
                                  ✓ Aprobada ({approvalRecord.folio})
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">
                              {tea.campus_name || 'Campus Montes (Sede Matriz & CCH)'} · {tea.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[10px] text-slate-500 block font-semibold">Cobertura PDA SEP</span>
                          <span className="text-sm font-black text-emerald-600 font-mono">{covPct}%</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[10px] text-slate-500 block font-semibold">Rúbricas NEM</span>
                          <span className="text-xs font-black text-indigo-700">Activas ({missions})</span>
                        </div>
                        <div className="p-2 rounded-xl bg-white border border-slate-200/80">
                          <span className="text-[10px] text-slate-500 block font-semibold">Promedio Grupal</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{avgGroup}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMirrorTeacherId(tea.id);
                            setIsLessonPlanViewerOpen(true);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all border ${
                            approvalRecord
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-2xs'
                          }`}
                          title="Haz clic para abrir y revisar la planeación didáctica completa antes de aprobarla"
                        >
                          <FileText size={13} className={approvalRecord ? 'text-emerald-600' : 'text-amber-600'} />
                          <span className="underline decoration-dotted underline-offset-2">
                            {approvalRecord
                              ? 'Planeación Aprobada (Clic para ver)'
                              : 'Ver Planeación en Bóveda para Aprobar'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMirrorTeacherId(tea.id);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          <Eye size={13} />
                          <span>Inspeccionar en Modo Espejo</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* MITAD DERECHA (6 COLS): MODO ESPEJO DE AULA EN VIVO (ZERO-REDIRECT CLASSROOM MIRROR) */}
            <div className="lg:col-span-6 bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-lg space-y-4">
              {activeMirrorTeacher && mirrorLessonTelemetry ? (
                <>
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-black uppercase tracking-wider text-indigo-300">
                          Modo Espejo de Aula en Vivo (Sin Redirección)
                        </span>
                        {approvedTeacherPlans[activeMirrorTeacher.id] && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] font-black">
                            ✓ Planeación Sellada ({approvedTeacherPlans[activeMirrorTeacher.id].folio})
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-base text-white mt-1">
                        Prof. {activeMirrorTeacher.first_name} {activeMirrorTeacher.last_name} · {mirrorLessonTelemetry.subject}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        {mirrorLessonTelemetry.sessionTitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsLessonPlanViewerOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shrink-0 flex items-center gap-1.5 cursor-pointer shadow-sm transition-all active:scale-95"
                      title="Abrir el documento completo de la planeación didáctica del profesor"
                    >
                      <BookOpen size={14} />
                      <span>Ver Planeación Completa</span>
                    </button>
                  </div>

                  {/* Cronómetro Pedagógico de 3 Fases (Inicio / Desarrollo / Cierre) — Clic para ver desglose */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                      <span>Cronómetro Pedagógico de 3 Fases (SEP NEM 2024)</span>
                      <button
                        type="button"
                        onClick={() => setIsLessonPlanViewerOpen(true)}
                        className="font-mono text-indigo-300 hover:text-white underline decoration-dotted cursor-pointer text-[11px]"
                      >
                        Minuto 28 / 50 · Ver desglose didáctico →
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div
                        onClick={() => setIsLessonPlanViewerOpen(true)}
                        className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-bold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                        title="Haz clic para inspeccionar las actividades de Inicio en la planeación"
                      >
                        <div className="flex items-center gap-2">
                          <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                          <span>{mirrorLessonTelemetry.phase1}</span>
                        </div>
                        <span className="text-[10px] text-emerald-300/90 font-mono shrink-0">Ver detalle →</span>
                      </div>
                      <div
                        onClick={() => setIsLessonPlanViewerOpen(true)}
                        className="p-2.5 rounded-xl bg-indigo-600/40 hover:bg-indigo-600/55 border border-indigo-400 text-white font-black flex items-center justify-between gap-2 cursor-pointer transition-colors"
                        title="Haz clic para inspeccionar las actividades de Desarrollo en la planeación"
                      >
                        <div className="flex items-center gap-2">
                          <Clock size={15} className="text-amber-300 animate-spin shrink-0" />
                          <span>{mirrorLessonTelemetry.phase2}</span>
                        </div>
                        <span className="text-[10px] text-indigo-200 font-mono shrink-0">Ver detalle →</span>
                      </div>
                      <div
                        onClick={() => setIsLessonPlanViewerOpen(true)}
                        className="p-2.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 border border-slate-700 text-slate-300 font-semibold flex items-center justify-between gap-2 cursor-pointer transition-colors"
                        title="Haz clic para inspeccionar la Rúbrica Analítica y Cierre en la planeación"
                      >
                        <div className="flex items-center gap-2">
                          <Layers size={15} className="text-slate-400 shrink-0" />
                          <span>{mirrorLessonTelemetry.phase3}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">Ver rúbrica →</span>
                      </div>
                    </div>
                  </div>

                  {/* Nodo de Bóveda Curricular (100% Clicable para Inspeccionar Planeación) + Misión Activa en La Aldea */}
                  <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <Network size={14} className="text-indigo-400" />
                        <span>Sincronización con Bóveda Curricular (Vault-First)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsLessonPlanViewerOpen(true)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 border border-indigo-400/50 text-[11px] font-mono font-bold cursor-pointer transition-colors flex items-center gap-1"
                        title="Haz clic para abrir el nodo completo de la planeación en la Bóveda Curricular"
                      >
                        <FileText size={12} />
                        <span>{mirrorLessonTelemetry.pdaCode} · Abrir</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsLessonPlanViewerOpen(true)}
                      className="w-full text-left p-3.5 rounded-xl bg-slate-900/95 hover:bg-indigo-950/80 border border-indigo-500/40 hover:border-indigo-400 text-xs text-slate-200 font-medium transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      title="Haz clic para leer la planeación didáctica completa antes de aprobarla"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-black group-hover:text-amber-300 transition-colors">
                            📄 {mirrorLessonTelemetry.pdaCode} · {mirrorLessonTelemetry.pdaTitle}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          Ruta en Bóveda: <span className="font-mono text-indigo-300">{mirrorLessonTelemetry.vaultPath}</span> · Incluye PDA SEP, 3 fases cronometradas y rúbrica analítica.
                        </p>
                      </div>
                      <span className="px-3 py-1.5 rounded-xl bg-indigo-600 group-hover:bg-amber-400 group-hover:text-slate-950 text-white font-black text-[11px] shrink-0 transition-colors flex items-center gap-1">
                        <Eye size={13} />
                        <span>Leer Planeación</span>
                      </span>
                    </button>

                    <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-xs text-amber-200 font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" />
                        <span>Misión Activa en La Aldea: <strong>{mirrorLessonTelemetry.aldeaMission}</strong></span>
                      </span>
                      <span className="font-mono text-amber-300">Activa</span>
                    </div>
                  </div>

                  {/* Botonera Directiva sobre el Aula en Espejo (Revisar Planeación / Aprobar / Enviar iMail) */}
                  <div className="pt-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsLessonPlanViewerOpen(true)}
                      className="w-full py-2.5 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <FileText size={15} />
                      <span>1. Ver Planeación</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApproveTeacherPlan(activeMirrorTeacher, mirrorLessonTelemetry)}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={15} />
                      <span>
                        {approvedTeacherPlans[activeMirrorTeacher.id]
                          ? '✓ Planeación Aprobada'
                          : '2. Aprobar en Bóveda'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onDispatchToIMail) {
                          onDispatchToIMail({
                            recipientName: `Prof. ${activeMirrorTeacher.first_name} ${activeMirrorTeacher.last_name}`,
                            recipientEmail: activeMirrorTeacher.email,
                            subject: `Reconocimiento de Supervisión Directiva en Modo Espejo — ${mirrorLessonTelemetry.pdaCode}`,
                            body: `Estimado(a) Prof. ${activeMirrorTeacher.first_name} ${activeMirrorTeacher.last_name}:\n\nDurante la supervisión ejecutiva en Modo Espejo de su sesión "${mirrorLessonTelemetry.sessionTitle}", Dirección General ha verificado el cumplimiento sobresaliente de la estructura cronometrada (Inicio-Desarrollo-Cierre) y la vinculación con la misión "${mirrorLessonTelemetry.aldeaMission}".\n\n¡Felicidades por su excelencia frente a grupo!\n\nAtentamente,\n${adminName}\nDirección General · ${holding.name}`,
                            campusName: activeMirrorTeacher.campus_name || 'Campus Montes'
                          });
                        } else {
                          showPortalToast(`✉️ Reconocimiento enviado a Prof. ${activeMirrorTeacher.first_name} ${activeMirrorTeacher.last_name} (${activeMirrorTeacher.email}).`);
                        }
                      }}
                      className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-600 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Mail size={15} className="text-indigo-400" />
                      <span>3. Observación iMail</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Selecciona un docente en la columna izquierda para proyectar el Modo Espejo de Aula en Vivo.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISOR OFICIAL DE PLANEACIÓN DIDÁCTICA SEP NEM 2024 (BÓVEDA CURRICULAR)    */}
      {/* (INSPECCIÓN COMPLETA ANTES DE APROBAR LA PLANEACIÓN DEL PROFESOR)         */}
      {/* ========================================================================= */}
      {isLessonPlanViewerOpen && activeMirrorTeacher && mirrorLessonTelemetry && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Cabecera del Visor de Planeación */}
            <div className="px-6 py-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-sm">
                  <BookOpen size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-mono font-black">
                      {mirrorLessonTelemetry.pdaCode}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase">
                      Bóveda Curricular · Formato Oficial SEP NEM 2024
                    </span>
                    {approvedTeacherPlans[activeMirrorTeacher.id] ? (
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-500 text-slate-950 text-[10px] font-black">
                        ✓ APROBADA POR DIRECCIÓN ({approvedTeacherPlans[activeMirrorTeacher.id].folio})
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-md bg-amber-400 text-slate-950 text-[10px] font-black">
                        EN REVISIÓN DIRECTIVA PARA APROBACIÓN
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white mt-1">
                    {mirrorLessonTelemetry.sessionTitle}
                  </h3>
                  <p className="text-xs text-slate-300">
                    Docente Autor: <strong className="text-white">Prof. {activeMirrorTeacher.first_name} {activeMirrorTeacher.last_name}</strong> ({activeMirrorTeacher.email}) · {activeMirrorTeacher.campus_name || 'Campus Montes'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsLessonPlanViewerOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Cerrar visor de planeación"
              >
                <X size={18} />
              </button>
            </div>

            {/* Cuerpo Desplegable del Documento de Planeación */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 bg-slate-50/60 text-slate-800">
              {/* 1. Metadatos Oficiales y Frontmatter YAML de la Bóveda Curricular */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                      <Shield size={14} /> 1. Ficha Técnica Oficial (Programa Analítico SEP NEM 2024)
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">{mirrorLessonTelemetry.faseGrado}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Campo Formativo SEP</span>
                      <span className="font-black text-slate-900">{mirrorLessonTelemetry.campoFormativo}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Metodología Sociocrítica</span>
                      <span className="font-black text-indigo-700">{mirrorLessonTelemetry.metodologia}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Ejes Articuladores Vinculados</span>
                    <div className="flex flex-wrap gap-1.5">
                      {mirrorLessonTelemetry.ejesArticuladores.map((eje, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold">
                          ✦ {eje}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bloque Frontmatter YAML de la Bóveda Curricular */}
                <div className="lg:col-span-5 bg-slate-900 text-slate-200 p-4 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1.5">
                  <div className="flex items-center justify-between text-indigo-300 font-bold pb-1 border-b border-slate-800">
                    <span>📄 {mirrorLessonTelemetry.vaultPath}</span>
                    <span className="text-emerald-400">YAML Frontmatter</span>
                  </div>
                  <div className="text-slate-400">---</div>
                  <div><span className="text-indigo-300">nodo_id:</span> <span className="text-amber-300">"{mirrorLessonTelemetry.pdaCode.replace(/[\[\]]/g, '')}"</span></div>
                  <div><span className="text-indigo-300">docente:</span> "{activeMirrorTeacher.first_name} {activeMirrorTeacher.last_name}"</div>
                  <div><span className="text-indigo-300">disciplina:</span> "{mirrorLessonTelemetry.subject}"</div>
                  <div><span className="text-indigo-300">duracion_min:</span> <span className="text-emerald-300">50</span> (10 Inicio / 30 Desarrollo / 10 Cierre)</div>
                  <div><span className="text-indigo-300">mision_aldea:</span> "{mirrorLessonTelemetry.aldeaMission}"</div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {mirrorLessonTelemetry.vaultLinks.map((lnk, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                        {lnk}
                      </span>
                    ))}
                  </div>
                  <div className="text-slate-400">---</div>
                </div>
              </div>

              {/* 2. PDA Textual de la SEP y Problematización Situada */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> 2. Proceso de Desarrollo de Aprendizaje (PDA Textual Oficial SEP) & Contextualización
                </span>
                <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-900 leading-relaxed">
                  <strong className="text-emerald-900 block mb-1">PDA Oficial ({mirrorLessonTelemetry.pdaCode}):</strong>
                  “{mirrorLessonTelemetry.pdaFullText}”
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block mb-1">Problematización y Contexto Situado del Plantel:</strong>
                  {mirrorLessonTelemetry.problematizacion}
                </div>
              </div>

              {/* 3. Secuencia Didáctica Cronometrada (Inicio / Desarrollo / Cierre) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Timer size={14} /> 3. Secuencia Didáctica Cronometrada (50 Minutos — Inicio, Desarrollo y Cierre)
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold">
                    Estructura Estandarizada NEM
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {/* Fase 1: Inicio */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-black text-[10px] uppercase">
                        Fase 1 · Inicio
                      </span>
                      <span className="font-mono font-bold text-emerald-800 text-[11px]">
                        {mirrorLessonTelemetry.phase1Detail.tiempo}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Intervención Docente:</strong>
                      <p className="text-slate-700 leading-relaxed">{mirrorLessonTelemetry.phase1Detail.actividadDocente}</p>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Actividad de los Alumnos:</strong>
                      <p className="text-slate-700 leading-relaxed">{mirrorLessonTelemetry.phase1Detail.actividadAlumnos}</p>
                    </div>
                    <div className="pt-1 border-t border-emerald-200/70 text-[11px] text-emerald-900">
                      <strong>Recursos:</strong> {mirrorLessonTelemetry.phase1Detail.recursos}
                    </div>
                  </div>

                  {/* Fase 2: Desarrollo */}
                  <div className="p-4 rounded-2xl bg-indigo-50/40 border-2 border-indigo-400 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white font-black text-[10px] uppercase">
                        Fase 2 · Desarrollo (Núcleo)
                      </span>
                      <span className="font-mono font-bold text-indigo-800 text-[11px]">
                        {mirrorLessonTelemetry.phase2Detail.tiempo}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Intervención Docente:</strong>
                      <p className="text-slate-700 leading-relaxed">{mirrorLessonTelemetry.phase2Detail.actividadDocente}</p>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Actividad de los Alumnos:</strong>
                      <p className="text-slate-700 leading-relaxed">{mirrorLessonTelemetry.phase2Detail.actividadAlumnos}</p>
                    </div>
                    <div className="pt-1 border-t border-indigo-200/70 text-[11px] text-indigo-900">
                      <strong>Recursos:</strong> {mirrorLessonTelemetry.phase2Detail.recursos}
                    </div>
                  </div>

                  {/* Fase 3: Cierre */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black text-[10px] uppercase">
                        Fase 3 · Cierre & Evaluación
                      </span>
                      <span className="font-mono font-bold text-amber-900 text-[11px]">
                        {mirrorLessonTelemetry.phase3Detail.tiempo}
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Intervención Docente:</strong>
                      <p className="text-slate-700 leading-relaxed">{mirrorLessonTelemetry.phase3Detail.actividadDocente}</p>
                    </div>
                    <div>
                      <strong className="text-slate-900 block mb-0.5">Actividad de los Alumnos:</strong>
                      <p className="text-slate-700 leading-relaxed">{mirrorLessonTelemetry.phase3Detail.actividadAlumnos}</p>
                    </div>
                    <div className="pt-1 border-t border-amber-200/70 text-[11px] text-amber-950">
                      <strong>Recursos:</strong> {mirrorLessonTelemetry.phase3Detail.recursos}
                    </div>
                  </div>
                </div>

                {/* Entregable Tangible y Ajustes DUA */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <strong className="text-slate-900 block mb-1">🎯 Producto / Entregable Tangible en Portafolio 360°:</strong>
                    <p className="text-slate-700">{mirrorLessonTelemetry.entregableTangible}</p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <strong className="text-slate-900 block mb-1">♿ Ajustes Razonables y DUA (Inclusión Educativa):</strong>
                    <p className="text-slate-700">{mirrorLessonTelemetry.ajustesDUA}</p>
                  </div>
                </div>
              </div>

              {/* 4. Matriz de Rúbrica Analítica SEP NEM (4 Niveles) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Award size={14} /> 4. Rúbrica Analítica Oficial SEP NEM (4 Niveles de Desempeño)
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-700">
                        <th className="p-2.5">Criterio de Evaluación</th>
                        <th className="p-2.5 text-emerald-700">Sobresaliente (10)</th>
                        <th className="p-2.5 text-indigo-700">Satisfactorio (9 - 8)</th>
                        <th className="p-2.5 text-amber-700">Básico (7)</th>
                        <th className="p-2.5 text-rose-700">Requiere Apoyo (6)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/70">
                      {mirrorLessonTelemetry.rubricaCriteria.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="p-2.5 font-black text-slate-900 align-top w-1/5">{row.criterio}</td>
                          <td className="p-2.5 text-slate-700 align-top bg-emerald-50/20">{row.sobresaliente}</td>
                          <td className="p-2.5 text-slate-700 align-top">{row.satisfactorio}</td>
                          <td className="p-2.5 text-slate-600 align-top">{row.basico}</td>
                          <td className="p-2.5 text-slate-500 align-top">{row.requiereApoyo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pie del Visor: Observaciones de Dirección General + Botón de Aprobación Oficial */}
            <div className="px-6 py-4 bg-white border-t border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={lessonPlanSupervisorNotes}
                  onChange={(e) => setLessonPlanSupervisorNotes(e.target.value)}
                  placeholder="Añadir observación directiva o nota de retroalimentación al aprobar la planeación (opcional)..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    const feedbackText =
                      lessonPlanSupervisorNotes.trim() ||
                      `Se solicita revisar el desglose de actividades de la sesión "${mirrorLessonTelemetry.sessionTitle}" (${mirrorLessonTelemetry.pdaCode}) antes de su sello definitivo en la Bóveda Curricular.`;
                    if (onDispatchToIMail) {
                      setIsLessonPlanViewerOpen(false);
                      onDispatchToIMail({
                        recipientName: `Prof. ${activeMirrorTeacher.first_name} ${activeMirrorTeacher.last_name}`,
                        recipientEmail: activeMirrorTeacher.email,
                        subject: `Observaciones a Planeación Didáctica ${mirrorLessonTelemetry.pdaCode} — ${mirrorLessonTelemetry.subject}`,
                        body: `Estimado(a) Prof. ${activeMirrorTeacher.first_name} ${activeMirrorTeacher.last_name}:\n\nTras revisar su planeación didáctica "${mirrorLessonTelemetry.sessionTitle}" en la Bóveda Curricular, Dirección General le comparte la siguiente observación pedagógica:\n\n• "${feedbackText}"\n\nAtentamente,\n${adminName}\nDirección General · ${holding.name}`,
                        campusName: activeMirrorTeacher.campus_name || 'Campus Montes'
                      });
                    } else {
                      showPortalToast(`✉️ Observación enviada a Prof. ${activeMirrorTeacher.first_name} ${activeMirrorTeacher.last_name}.`);
                      setIsLessonPlanViewerOpen(false);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <Mail size={14} />
                  <span>Solicitar Ajuste vía iMail</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleApproveTeacherPlan(activeMirrorTeacher, mirrorLessonTelemetry);
                    setIsLessonPlanViewerOpen(false);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>✓ Aprobar y Sellar Planeación en Bóveda Curricular</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (embeddedBento) {
    return mainContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150 select-none">
      {mainContent}
    </div>
  );
}
export default AcademicPortalAdminModal;
