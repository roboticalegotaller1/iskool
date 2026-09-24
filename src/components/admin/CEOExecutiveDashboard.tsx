"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  FileText,
  DollarSign,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  UserMinus,
  Network,
  BarChart3,
  Target,
  Zap,
  Clock,
  ChevronRight,
  ChevronLeft,
  Search,
  Bell,
  HelpCircle,
  Calendar,
  X,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  ArrowUpRight,
  ShieldAlert,
  Send,
  SlidersHorizontal,
  Share2,
  School,
  FileCheck2,
  MessageSquare,
  ArrowRight,
  Download,
  Filter,
  Check,
  ExternalLink,
  BookOpen,
  PieChart,
  Activity,
  Layers,
  Info,
  Cpu,
  RefreshCw,
  Sliders,
  Printer,
  Copy,
  ToggleLeft,
  ToggleRight,
  CheckCheck,
  Award,
  Gamepad2,
  Flame,
  Calculator,
  Briefcase,
  FolderLock,
  Receipt,
  HeartHandshake,
  UserPlus,
  Phone,
  MapPin,
  Eye,
  ClipboardList,
  Menu
} from 'lucide-react';
import { CampusData, OrganizationHolding, DetailedStudent, Campus, FamilyBillingRecord, Institution } from '@/types';
import { 
  useSchoolAdminStore, 
  getSchoolCampuses, 
  getSchoolStudents, 
  getSchoolTeachers, 
  getSchoolBillingRecords, 
  getSchoolAttendance,
  getSchoolPayroll
} from '@/store/useSchoolAdminStore';
import { 
  executeAnalyticQuery, 
  AnalyticReportResult, 
  EngineDataSources,
  formatMXN,
  formatPercent
} from '@/services/executiveAnalyticsEngine';
import { InstitutionalBrainStudio } from './InstitutionalBrainStudio';
import { OperationalEcosystemControl } from './OperationalEcosystemControl';
import { PhaseCurricularAuditModal } from './PhaseCurricularAuditModal';

// ==========================================
// ==========================================
// SEED OFICIAL DEL CASO REAL INSTITUTO BILINGÜE IBIME
// (Red de 4 Planteles en Ecatepec y Coacalco, 3,740 Alumnos, Licencia SaaS ISkool)
// ==========================================
export const DEFAULT_IBIME_HOLDING: OrganizationHolding = {
  id: 'org-ibime-holding',
  name: 'Instituto Bilingüe IBIME',
  slug: 'ibime',
  tagline: 'Excelencia Bilingüe y Formación Humana desde 2004 · Bachillerato UNAM CCH · 4 Planteles',
  currency: 'MXN',
  targetCollectionRate: 95,
  targetCurriculumCoverage: 90,
  targetRetentionRate: 95,
  campuses: [
    { 
      id: 'montes', 
      name: 'Campus Montes (Sede Matriz & CCH)', 
      location: 'Jardines de Morelos Secc. Montes, Ecatepec', 
      students: 1620, 
      teachers: 84, 
      collectionRate: 95, 
      admissionsInProgress: 14, 
      academicHealth: 96, 
      focalIssues: 0,
      curriculumCoverage: 96,
      retentionRate: 97
    },
    { 
      id: 'lagos', 
      name: 'Campus Lagos (Fundador 2004)', 
      location: 'Jardines de Morelos Secc. Lagos, Ecatepec', 
      students: 710, 
      teachers: 38, 
      collectionRate: 96, 
      admissionsInProgress: 8, 
      academicHealth: 95, 
      focalIssues: 0,
      curriculumCoverage: 95,
      retentionRate: 96
    },
    { 
      id: 'sancristobal', 
      name: 'Campus San Cristóbal (Ecatepec Centro)', 
      location: 'Av. Insurgentes, Lomas de Atzolco, Ecatepec', 
      students: 830, 
      teachers: 46, 
      collectionRate: 93, 
      admissionsInProgress: 9, 
      academicHealth: 93, 
      focalIssues: 1,
      curriculumCoverage: 94,
      retentionRate: 95
    },
    { 
      id: 'coacalco', 
      name: 'Campus Coacalco (Metropolitano)', 
      location: 'Col. Guadalupe Victoria, Ecatepec-Coacalco', 
      students: 580, 
      teachers: 32, 
      collectionRate: 91, 
      admissionsInProgress: 6, 
      academicHealth: 92, 
      focalIssues: 1,
      curriculumCoverage: 93,
      retentionRate: 94
    },
  ]
};

/**
 * Generador dinámico de Holding para cualquier colegio dentro de ISkool.
 * Permite que cada institución (IBIME, Rosseau, Sandbox, Montessori o colegios nuevos)
 * cuente con su propia suite ejecutiva completa (Visión CEO, Colegios, Académico, Finanzas, Bóveda, Operación).
 */
export function buildHoldingForInstitution(
  institution?: Institution | null,
  campusesList?: Campus[],
  detailedStudents?: DetailedStudent[],
  teachersList?: any[]
): OrganizationHolding {
  if (!institution) return DEFAULT_IBIME_HOLDING;

  // Caso específico IBIME
  if (institution.id === 'sch-ibime' || institution.name?.includes('IBIME')) {
    return DEFAULT_IBIME_HOLDING;
  }

  const allCampuses = campusesList || [];
  const schoolCampuses = getSchoolCampuses(allCampuses, institution.id);
  const schoolStudents = getSchoolStudents(detailedStudents || [], institution.id, schoolCampuses);
  const schoolTeachers = getSchoolTeachers(teachersList || [], institution.id, schoolCampuses);

  const mappedCampuses: CampusData[] = schoolCampuses.length > 0
    ? schoolCampuses.map((c, idx) => {
        const campStudents = (detailedStudents || []).filter(s => s.campus_id === c.id);
        const campTeachers = (teachersList || []).filter(t => t.campus_id === c.id);
        const stCount = campStudents.length || Math.max(12, Math.floor(schoolStudents.length / schoolCampuses.length)) || 350;
        const tcCount = campTeachers.length || Math.max(2, Math.floor(schoolTeachers.length / schoolCampuses.length)) || 24;

        return {
          id: c.id,
          name: c.name,
          location: c.address || `${c.name} · Sede Oficial`,
          students: stCount,
          teachers: tcCount,
          collectionRate: Math.max(88, 95 - (idx % 3)),
          admissionsInProgress: Math.floor(8 + idx * 3),
          academicHealth: Math.max(90, 96 - (idx % 2)),
          focalIssues: idx === 1 ? 1 : 0,
          curriculumCoverage: Math.min(98, 94 + (idx % 3)),
          retentionRate: Math.min(98, 96 - (idx % 2))
        };
      })
    : [
        {
          id: `${institution.id}-matriz`,
          name: `${institution.name} · Plantel Central`,
          location: institution.address || 'Sede Central',
          students: schoolStudents.length || 450,
          teachers: schoolTeachers.length || 28,
          collectionRate: 95,
          admissionsInProgress: 16,
          academicHealth: 96,
          focalIssues: 0,
          curriculumCoverage: 95,
          retentionRate: 96
        }
      ];

  return {
    id: `org-${institution.id}-holding`,
    name: institution.name,
    slug: institution.id.replace('sch-', ''),
    tagline: institution.tagline || 'Institución de formación integral y excelencia académica.',
    currency: 'MXN',
    targetCollectionRate: 95,
    targetCurriculumCoverage: 90,
    targetRetentionRate: 95,
    campuses: mappedCampuses
  };
}

// Base de conocimiento exhaustiva de la Bóveda Institucional IBIME (0 Tokens)
const INSTITUTIONAL_KNOWLEDGE_BASE = [
  {
    id: 'kb-1',
    topic: 'Protocolo de Emergencia Médica y Alergias (Alineado Expediente 360)',
    category: 'Normativa Médica & Urgencias',
    sede: 'Red IBIME / Sede Matriz Montes',
    reads: '1,420 consultas',
    keywords: ['emergencia', 'medica', 'alergia', 'medico', 'salud', 'expediente', '360', 'enfermeria', 'protocolo', 'shock', 'ambulancia', 'caida', 'ibime'],
    summary: 'Protocolo estandarizado de actuación inmediata para shock anafiláctico, caídas y notificación a padres en < 3 minutos desde el Expediente 360 del alumno en planteles IBIME.',
    answer: 'El protocolo de emergencia médica IBIME establece que el personal de enfermería y coordinación debe verificar inmediatamente el Expediente 360 del alumno en pantalla, aplicar el protocolo de estabilización primaria y emitir la alerta push al padre de familia antes de 3 minutos. Todo evento genera un folio inmutable de bitácora médico-legal con estampa de tiempo.'
  },
  {
    id: 'kb-2',
    topic: 'Matriz de Cobertura Curricular NEM 2024 y Bachillerato CCH UNAM',
    category: 'Pedagógico Oficial SEP / UNAM',
    sede: 'Campus Montes / Lagos / San Cristóbal / Coacalco',
    reads: '1,890 consultas',
    keywords: ['nem', 'curricular', 'planeacion', 'planeaciones', 'sep', 'programa', 'analitico', 'fases', 'pda', 'cch', 'unam', 'pedagogico', 'cobertura', 'rubricas', 'cambridge'],
    summary: 'Planeaciones de aula cronometradas (Inicio, Desarrollo, Cierre) alineadas al Programa Analítico SEP, Fases 2-6, Bachillerato UNAM CCH (Clave 7998) y certificaciones Cambridge English.',
    answer: 'La cobertura curricular consolidada en la Red IBIME alcanza el 95.2%. Se articulan las planeaciones estructuradas bajo la Nueva Escuela Mexicana (NEM 2024) y el modelo CCH UNAM con Procesos de Desarrollo de Aprendizaje (PDA) oficiales, rúbricas analíticas formativas, sesiones cronometradas y verificación prioritaria en la Bóveda Curricular.'
  },
  {
    id: 'kb-3',
    topic: 'Manual de Cobranza y Timbrado SAT CFDI 4.0 Complemento IEDU',
    category: 'Financiero & Fiscal SAT',
    sede: 'Tesorería Central IBIME S.C.',
    reads: '980 consultas',
    keywords: ['cobranza', 'cfdi', 'sat', 'factura', 'iedu', 'timbrado', 'fiscal', 'pagos', 'recibo', 'colegiatura', 'pac', 'deduccion', 'ibime'],
    summary: 'Procedimiento de emisión automatizada de comprobantes fiscales de colegiatura para Instituto Bilingüe IBIME S.C. (RFC IBI040818K24) con deducción IEDU y CURP del alumno.',
    answer: 'La facturación opera bajo CFDI 4.0 con timbrado PAC instantáneo a 0 tokens. El complemento IEDU incluye de forma automatizada: RFC del tutor legal, CURP validada del alumno, nivel educativo y claves CCT de los planteles IBIME (15PPR3322G, 15PJN2222K, 15PPR3657T, 15PES1023O) al conciliar la cobranza en el ledger financiero.'
  },
  {
    id: 'kb-4',
    topic: 'Protocolo de Sismo, Evacuación y Protección Civil (Zona Sísmica III Ecatepec)',
    category: 'Seguridad & Protección Civil',
    sede: 'Dirección de Protección Civil IBIME',
    reads: '1,150 consultas',
    keywords: ['sismo', 'terremoto', 'evacuacion', 'alarma', 'seguridad', 'proteccion', 'civil', 'punto', 'reunion', 'simulacro', 'brigada', 'ecatepec', 'sasmex'],
    summary: 'Directrices de evacuación inmediata ante alerta sísmica SASMEX en el Valle de México y Ecatepec: Repliegue inicial, evacuación a canchas centrales de Montes/Lagos y pase de lista biométrico en < 90 segundos.',
    answer: 'Ante activación de la alerta sísmica o sismo perceptible en los planteles de Ecatepec y Coacalco: 1) Repliegue preventivo en zonas de menor riesgo dentro del aula durante los primeros 30s. 2) Evacuación ordenada guiada por brigadistas hacia el patio central o canchas deportivas. 3) Pase de lista inmediato mediante la app de asistencia de ISkool. 4) Ningún alumno es liberado sin cotejo de credencial digital autorizada.'
  },
  {
    id: 'kb-5',
    topic: 'Protocolo de Admisiones e Inducción a Nuevas Familias IBIME 2026-2027',
    category: 'Admisiones & Matrícula',
    sede: 'Coordinación de Admisiones Red IBIME',
    reads: '820 consultas',
    keywords: ['admision', 'admisiones', 'prospecto', 'inscripcion', 'psicopedagogico', 'diagnostico', 'nuevo', 'ingreso', 'pipeline', 'ibime'],
    summary: 'Ruta de conversión de prospectos IBIME: Diagnóstico psicopedagógico, entrevista directiva en campus Montes/Lagos/San Cristóbal/Coacalco, carta de asignación y pago de inscripción online.',
    answer: 'El ciclo de admisiones IBIME consta de 4 hitos: Registro de prospecto en CRM escolar, examen diagnóstico psicopedagógico bilingüe, entrevista directiva con la familia y confirmación de pago digital de reserva de plaza con expediente 360 provisional.'
  },
  {
    id: 'kb-6',
    topic: 'Protocolo de Convivencia Escolar y Prevención del Acoso (SEP / UNAM)',
    category: 'Jurídico & Bienestar',
    sede: 'Comité de Convivencia Escolar IBIME',
    reads: '710 consultas',
    keywords: ['convivencia', 'acoso', 'bullying', 'disciplina', 'reglamento', 'mediacion', 'paz', 'derechos', 'comite', 'ibime'],
    summary: 'Directrices obligatorias de mediación, resguardo emocional y canalización ante comités de paz escolar sin revictimización con citatorio a familias en 24 horas.',
    answer: 'Cero tolerancia a cualquier forma de acoso o discriminación en todos los planteles IBIME. El protocolo activa de inmediato el Comité de Convivencia, medidas cautelares de protección para el educando, registro del incidente en bitácora protegida y citatorio formal a padres en un plazo no mayor a 24 horas hábiles.'
  }
];

// ==========================================
// ESTRUCTURA DEL PIPELINE DE ADMISIONES
// ==========================================
export interface ProspectFamily {
  id: string;
  studentName: string;
  grade: string;
  tutorName: string;
  phone: string;
  email: string;
  campusId: string;
  campusName: string;
  stage: 1 | 2 | 3 | 4 | 5;
  stageName: string;
  channel: 'Recomendación Familiar' | 'Canales Digitales & Web' | 'Convenios Corporativos' | 'Feria Escolar';
  registeredDate: string;
  notes: string;
}

export const INITIAL_PROSPECTS_DATA: ProspectFamily[] = [
  {
    id: 'prospect-seed-1',
    studentName: 'Sofía Valentina Reyes',
    grade: 'Primaria 2°',
    tutorName: 'Lic. Fernando Reyes',
    phone: '55 4192 8841',
    email: 'fernando.reyes@email.com',
    campusId: 'montes',
    campusName: 'Campus Montes (Sede Matriz & CCH)',
    stage: 4,
    stageName: '4. Carta de Asignación Emitida',
    channel: 'Recomendación Familiar',
    registeredDate: 'Hace 3 días',
    notes: 'Carta emitida con plaza reservada en 2° A Bilingüe. En espera de pago de inscripción vía SPEI.'
  },
  {
    id: 'prospect-seed-2',
    studentName: 'Mateo Emiliano Albarrán',
    grade: 'Secundaria 1°',
    tutorName: 'Mtra. Claudia Albarrán',
    phone: '55 8320 1194',
    email: 'claudia.albarran@email.com',
    campusId: 'sancristobal',
    campusName: 'Campus San Cristóbal (Ecatepec Centro)',
    stage: 3,
    stageName: '3. Examen Diagnóstico Psicopedagógico',
    channel: 'Canales Digitales & Web',
    registeredDate: 'Hace 5 días',
    notes: 'Diagnóstico psicopedagógico completado por psicología escolar. Dictamen favorable para programa Cambridge KET.'
  },
  {
    id: 'prospect-seed-3',
    studentName: 'Valentina Garza Morales',
    grade: 'Kínder 3',
    tutorName: 'Dr. Roberto Garza',
    phone: '55 3190 2481',
    email: 'roberto.garza@hospital.com',
    campusId: 'lagos',
    campusName: 'Campus Lagos (Fundador 2004)',
    stage: 5,
    stageName: '5. Inscripción y Reserva Pagada',
    channel: 'Recomendación Familiar',
    registeredDate: 'Hace 1 semana',
    notes: 'Inscripción liquidada al 100%. CFDI 4.0 con complemento IEDU emitido con RFC IBI040818K24.'
  },
  {
    id: 'prospect-seed-4',
    studentName: 'Diego Alejandro Montes',
    grade: 'Preparatoria 1° (CCH UNAM)',
    tutorName: 'Ing. Carlos Montes',
    phone: '55 9012 3456',
    email: 'carlos.montes@techcorp.mx',
    campusId: 'montes',
    campusName: 'Campus Montes (Sede Matriz & CCH)',
    stage: 2,
    stageName: '2. Tours y Visitas de Campus',
    channel: 'Convenios Corporativos',
    registeredDate: 'Hace 2 días',
    notes: 'Tour guiado por laboratorios STEAM, canchas y aulas CCH UNAM completado con el Director.'
  },
  {
    id: 'prospect-seed-5',
    studentName: 'Camila Navarro Ruiz',
    grade: 'Primaria 5°',
    tutorName: 'Dra. Andrea Ruiz',
    phone: '55 3901 1284',
    email: 'andrea.ruiz@salud.gob.mx',
    campusId: 'coacalco',
    campusName: 'Campus Coacalco (Metropolitano)',
    stage: 1,
    stageName: '1. Prospectos Registrados en CRM',
    channel: 'Canales Digitales & Web',
    registeredDate: 'Ayer',
    notes: 'Formulario web completado desde portal IBIME. Asesor de admisiones asignado para llamada de bienvenida.'
  },
  {
    id: 'prospect-seed-6',
    studentName: 'Leonardo Daniel Pineda',
    grade: 'Secundaria 3°',
    tutorName: 'Lic. Javier Pineda',
    phone: '55 8129 9033',
    email: 'javier.pineda@notaria.mx',
    campusId: 'sancristobal',
    campusName: 'Campus San Cristóbal (Ecatepec Centro)',
    stage: 4,
    stageName: '4. Carta de Asignación Emitida',
    channel: 'Feria Escolar',
    registeredDate: 'Hace 4 días',
    notes: 'Cupo asignado en Grupo 3° B Secundaria. Fecha límite de pago de reserva: 3 días hábiles.'
  },
  {
    id: 'prospect-seed-7',
    studentName: 'Renata Sofía Cordero',
    grade: 'Primaria 1°',
    tutorName: 'Arq. Patricia Cordero',
    phone: '55 2381 0092',
    email: 'patricia.cordero@estudio.mx',
    campusId: 'lagos',
    campusName: 'Campus Lagos (Fundador 2004)',
    stage: 2,
    stageName: '2. Tours y Visitas de Campus',
    channel: 'Recomendación Familiar',
    registeredDate: 'Hace 3 días',
    notes: 'Visita con directores de Lagos completada. Agendando prueba diagnóstica de admisión bilingüe.'
  },
  {
    id: 'prospect-seed-8',
    studentName: 'Emiliano Carrillo Treviño',
    grade: 'Kínder 2',
    tutorName: 'Mtro. Daniel Carrillo',
    phone: '55 4910 8273',
    email: 'daniel.carrillo@profesor.mx',
    campusId: 'coacalco',
    campusName: 'Campus Coacalco (Metropolitano)',
    stage: 3,
    stageName: '3. Examen Diagnóstico Psicopedagógico',
    channel: 'Canales Digitales & Web',
    registeredDate: 'Hace 6 días',
    notes: 'Entrevista con psicopedagoga escolar aprobada con felicitaciones de coordinación.'
  },
  {
    id: 'prospect-seed-9',
    studentName: 'Regina Domínguez Garza',
    grade: 'Preparatoria 2° (CCH UNAM)',
    tutorName: 'Lic. Mariana Garza',
    phone: '55 7712 9901',
    email: 'mariana.garza@consultores.mx',
    campusId: 'montes',
    campusName: 'Campus Montes (Sede Matriz & CCH)',
    stage: 5,
    stageName: '5. Inscripción y Reserva Pagada',
    channel: 'Convenios Corporativos',
    registeredDate: 'Hace 2 semanas',
    notes: 'Matrícula formalizada en CCH UNAM. Expediente 360 y credencial digital generados en Control Escolar.'
  },
  {
    id: 'prospect-seed-10',
    studentName: 'Bruno Alexander Ortiz',
    grade: 'Secundaria 2°',
    tutorName: 'Ing. Héctor Ortiz',
    phone: '55 7104 4455',
    email: 'hector.ortiz@aero.com',
    campusId: 'coacalco',
    campusName: 'Campus Coacalco (Metropolitano)',
    stage: 1,
    stageName: '1. Prospectos Registrados en CRM',
    channel: 'Recomendación Familiar',
    registeredDate: 'Hoy',
    notes: 'Interés por recomendación de familia activa en Primaria Coacalco. Solicitó informes de costos y programa bilingüe.'
  }
];

interface CEOExecutiveDashboardProps {
  holding?: OrganizationHolding;
  schoolId?: string;
  isSuperUser?: boolean;
  onNavigateTab?: (tabId: string) => void;
  onSwitchToOperational?: () => void;
  onBackToDirectory?: () => void;
}

export default function CEOExecutiveDashboard({
  holding: propHolding,
  schoolId,
  isSuperUser,
  onNavigateTab,
  onSwitchToOperational,
  onBackToDirectory
}: CEOExecutiveDashboardProps) {
  // ------------------------------------------
  // Conexión al Almacén Central de Datos (Live Store)
  // ------------------------------------------
  const {
    institutionsList,
    campusesList,
    detailedStudents,
    teachersList,
    billingRecords,
    attendanceList,
    groupsList,
    staffPayroll,
    activeSchoolId,
    schoolSettings
  } = useSchoolAdminStore();

  // Resolución Dinámica del Holding Escolar para la escuela seleccionada
  const holding = useMemo<OrganizationHolding>(() => {
    if (propHolding) return propHolding;
    const targetInst = institutionsList.find(i => i.id === (schoolId || activeSchoolId)) 
      || institutionsList[0];
    return buildHoldingForInstitution(targetInst, campusesList, detailedStudents, teachersList);
  }, [propHolding, schoolId, activeSchoolId, institutionsList, campusesList, detailedStudents, teachersList]);

  // Institución Activa para datos de licencia e identidad
  const currentInstitution = useMemo(() => {
    return institutionsList.find(i => i.id === (schoolId || activeSchoolId))
      || institutionsList.find(i => i.name === holding.name)
      || institutionsList.find(i => holding.slug && i.id.includes(holding.slug))
      || institutionsList[0];
  }, [institutionsList, schoolId, activeSchoolId, holding]);

  // ------------------------------------------
  // Estados de Control de Vista y Filtros
  // ------------------------------------------
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'semana' | 'mes' | 'bimestre' | 'ciclo'>('semana');
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResult, setSearchResult] = useState<Array<{ title: string; category: string; target: string }>>([]);
  
  // Vista detallada de avance por colegio (Barras vs Matriz Comparativa)
  const [isComparativeMatrixOpen, setIsComparativeMatrixOpen] = useState<boolean>(false);
  
  // Selector de Campus para Radar Curricular NEM 2024
  const [curriculumRadarCampus, setCurriculumRadarCampus] = useState<string>('consolidado');
  
  // Filtro de Actividad Reciente
  const [activityFilter, setActivityFilter] = useState<'todos' | 'academico' | 'admisiones' | 'financiero' | 'operativo'>('todos');

  // Drawer Lateral de KPI
  const [activeKPIDrawer, setActiveKPIDrawer] = useState<{
    metricKey: 'students' | 'teachers' | 'campuses' | 'admissions' | 'collection';
    title: string;
    description: string;
    targetValue: string;
    unit: string;
  } | null>(null);

  // Modales Ejecutivos de Focos de Atención
  const [activeFocalModal, setActiveFocalModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    campusAffected: string[];
    actionType: 'cobranza' | 'reinscripcion' | 'academico' | 'docentes';
  } | null>(null);

  // Modal para ver TODOS los Focos de Atención
  const [isAllFocalsOpen, setIsAllFocalsOpen] = useState<boolean>(false);

  // Modal de Configuración de Umbrales Corporativos
  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [collectionThreshold, setCollectionThreshold] = useState<number>(95);
  const [curriculumThreshold, setCurriculumThreshold] = useState<number>(90);
  const [retentionThreshold, setRetentionThreshold] = useState<number>(95);

  // Modal de Auditoría Curricular por Fase NEM 2024
  const [selectedPhaseForAudit, setSelectedPhaseForAudit] = useState<string | null>(null);

  // Cerebro Institucional y Búsqueda Semántica Local (0 Tokens)
  const [isBrainModalOpen, setIsBrainModalOpen] = useState<boolean>(false);
  const [ragQuery, setRagQuery] = useState<string>('');
  const [ragAnswer, setRagAnswer] = useState<{
    title: string;
    text: string;
    source: string;
    latencyMs: number;
    tokens: number;
    confidence: number;
    kpis?: Array<{ label: string; value: string }>;
    actionLabel?: string;
    actionType?: string;
    timestamp?: string;
  } | null>(null);
  const [isRagSearching, setIsRagSearching] = useState<boolean>(false);
  const [ragSearchVersion, setRagSearchVersion] = useState<number>(1);

  // Modal para los 4 Motores Estratégicos & Reportes BI en Vivo
  const [activeEngineModal, setActiveEngineModal] = useState<{
    id: 'cerebro' | 'reportes' | 'okrs' | 'automatizaciones';
    title: string;
    subtitle: string;
  } | null>(null);

  // Estado del generador de reportes analíticos instantáneos (0 Tokens)
  const [activeReportQuery, setActiveReportQuery] = useState<string>('Balance Financiero y Cobranza Consolidada');
  const [reportResult, setReportResult] = useState<AnalyticReportResult | null>(null);
  const [reportLatencyMs, setReportLatencyMs] = useState<number>(0.8);

  // Estado interactivo de automatizaciones
  const [automationStates, setAutomationStates] = useState<Record<string, boolean>>({
    'cobranza-preventiva': true,
    'inasistencias-padres': true,
    'timbrado-cfdi': true,
    'auditoria-nem': true,
    'alerta-desercion': true
  });

  // Modal Detalle de Auditoría de Actividad
  const [selectedAuditLog, setSelectedAuditLog] = useState<{
    title: string;
    campus: string;
    time: string;
    category: string;
    user: string;
    details: string;
  } | null>(null);
  const [isAllActivityOpen, setIsAllActivityOpen] = useState<boolean>(false);

  // Toast de retroalimentación en tiempo real
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const selectedCampusName = useMemo(() => {
    if (selectedCampusId === 'all') return 'Consolidado (5 Sedes)';
    return holding.campuses.find(c => c.id === selectedCampusId)?.name || 'Plantel Seleccionado';
  }, [selectedCampusId, holding.campuses]);

  // Motor Autónomo Watchdog (Monitoreo Continuo sin Intervención)
  const [autonomousCycle, setAutonomousCycle] = useState<number>(1);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<string>('En tiempo real');
  const [isAutonomousActive, setIsAutonomousActive] = useState<boolean>(true);

  // -----------------------------------------------------------
  // GESTIÓN DEL PIPELINE DE ADMISIONES & CAPTACIÓN (0 TOKENS)
  // -----------------------------------------------------------
  const [prospectsList, setProspectsList] = useState<ProspectFamily[]>(INITIAL_PROSPECTS_DATA);
  const [isAdmissionsPipelineOpen, setIsAdmissionsPipelineOpen] = useState<boolean>(false);
  const [isAddProspectModalOpen, setIsAddProspectModalOpen] = useState<boolean>(false);
  const [prospectSearchTerm, setProspectSearchTerm] = useState<string>('');
  const [prospectFilterStage, setProspectFilterStage] = useState<number | 'all'>('all');
  const [prospectFilterCampus, setProspectFilterCampus] = useState<string>('all');
  const [newProspectForm, setNewProspectForm] = useState({
    studentName: '',
    grade: 'Primaria 1°',
    campusId: 'cdmx',
    tutorName: '',
    phone: '',
    email: '',
    channel: 'Recomendación Familiar' as const,
    initialStage: 1 as 1 | 2 | 3 | 4 | 5,
    notes: ''
  });

  // Avanzar aspirante a la siguiente etapa del pipeline
  const handleAdvanceProspectStage = useCallback((prospectId: string) => {
    const stageNames: Record<number, string> = {
      1: '1. Prospecto Registrado en CRM',
      2: '2. Tour y Visita de Campus',
      3: '3. Examen Diagnóstico Psicopedagógico',
      4: '4. Carta de Asignación Emitida',
      5: '5. Inscripción y Reserva Pagada'
    };

    setProspectsList(prev => prev.map(p => {
      if (p.id === prospectId && p.stage < 5) {
        const nextStage = (p.stage + 1) as 1 | 2 | 3 | 4 | 5;
        triggerToast(`✓ Aspirante ${p.studentName} avanzado a: ${stageNames[nextStage]}`);
        return { ...p, stage: nextStage, stageName: stageNames[nextStage] };
      }
      return p;
    }));
  }, [triggerToast]);

  // Alta de nuevo aspirante
  const handleCreateProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspectForm.studentName.trim() || !newProspectForm.tutorName.trim()) {
      triggerToast('⚠️ Por favor completa el nombre del alumno y del tutor.');
      return;
    }
    const campusObj = holding.campuses.find(c => c.id === newProspectForm.campusId);
    const stageNames: Record<number, string> = {
      1: '1. Prospecto Registrado en CRM',
      2: '2. Tour y Visita de Campus',
      3: '3. Examen Diagnóstico Psicopedagógico',
      4: '4. Carta de Asignación Emitida',
      5: '5. Inscripción y Reserva Pagada'
    };
    const newEntry: ProspectFamily = {
      id: `prospect-manual-${Date.now()}`,
      studentName: newProspectForm.studentName,
      grade: newProspectForm.grade,
      tutorName: newProspectForm.tutorName,
      phone: newProspectForm.phone || '55 0000 0000',
      email: newProspectForm.email || 'contacto@familia.mx',
      campusId: newProspectForm.campusId,
      campusName: campusObj?.name || 'Campus Montes (Sede Matriz & CCH)',
      stage: newProspectForm.initialStage,
      stageName: stageNames[newProspectForm.initialStage],
      channel: newProspectForm.channel,
      registeredDate: 'Hoy',
      notes: newProspectForm.notes || 'Registro manual desde Suite de Dirección General'
    };

    setProspectsList(prev => [newEntry, ...prev]);
    setIsAddProspectModalOpen(false);
    setNewProspectForm({
      studentName: '',
      grade: 'Primaria 1°',
      campusId: 'montes',
      tutorName: '',
      phone: '',
      email: '',
      channel: 'Recomendación Familiar',
      initialStage: 1,
      notes: ''
    });
    triggerToast(`✓ Aspirante ${newEntry.studentName} agregado con éxito al Pipeline de ${newEntry.campusName}.`);
  };

  // Cálculo del Embudo de Conversión reactivo por sede y aspirantes
  const activeFunnelData = useMemo(() => {
    const campusBase: Record<string, [number, number, number, number, number]> = {
      all: [184, 126, 82, 54, 28],
      cdmx: [68, 48, 32, 22, 12],
      satelite: [46, 32, 21, 14, 7],
      interlomas: [28, 19, 12, 8, 4],
      queretaro: [26, 17, 11, 6, 3],
      sanluis: [16, 10, 6, 4, 2]
    };

    const base = campusBase[selectedCampusId] || campusBase['all'];

    const extraInStage = (stageNum: number) => {
      return prospectsList.filter(p => {
        const matchCampus = selectedCampusId === 'all' || p.campusId === selectedCampusId;
        return matchCampus && p.stage >= stageNum && p.id.startsWith('prospect-manual-');
      }).length;
    };

    const c1 = base[0] + extraInStage(1);
    const c2 = base[1] + extraInStage(2);
    const c3 = base[2] + extraInStage(3);
    const c4 = base[3] + extraInStage(4);
    const c5 = base[4] + extraInStage(5);

    return [
      { 
        stage: '1. Prospectos Registrados en CRM', 
        count: c1, 
        pct: 100, 
        color: 'bg-purple-600', 
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50/50',
        textColor: 'text-purple-700',
        note: 'Interés inicial en web, redes sociales y ferias escolares',
        dept: 'Admisiones & Marketing Institucional',
        systemLocation: 'Formulario Web / Landing Page o Botón "+ Registrar Aspirante"',
        stageNum: 1
      },
      { 
        stage: '2. Tours y Visitas de Campus', 
        count: c2, 
        pct: Number(((c2 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-indigo-600', 
        borderColor: 'border-indigo-200',
        bgColor: 'bg-indigo-50/50',
        textColor: 'text-indigo-700',
        note: 'Recorridos presenciales de instalaciones y plática informativa directiva',
        dept: 'Dirección de Plantel & Relaciones Públicas',
        systemLocation: 'Agenda de Visitas Guiadas / Directorio del Pipeline',
        stageNum: 2
      },
      { 
        stage: '3. Examen Diagnóstico Psicopedagógico', 
        count: c3, 
        pct: Number(((c3 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-blue-600', 
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50/50',
        textColor: 'text-blue-700',
        note: 'Evaluación de habilidades cognitivas, socioemocionales y entrevista familiar',
        dept: 'Gabinete Psicopedagógico & Orientación',
        systemLocation: 'Módulo de Psicopedagogía / Expediente de Ingreso',
        stageNum: 3
      },
      { 
        stage: '4. Carta de Asignación Emitida', 
        count: c4, 
        pct: Number(((c4 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-teal-600', 
        borderColor: 'border-teal-200',
        bgColor: 'bg-teal-50/50',
        textColor: 'text-teal-700',
        note: 'Cupo formal apartado en grado y grupo escolar con vigencia de pago (5 días)',
        dept: 'Dirección Académica & Comité de Admisiones',
        systemLocation: 'Comité de Asignación de Matrícula',
        stageNum: 4
      },
      { 
        stage: '5. Inscripción y Reserva Pagada', 
        count: c5, 
        pct: Number(((c5 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-emerald-600', 
        borderColor: 'border-emerald-200',
        bgColor: 'bg-emerald-50/50',
        textColor: 'text-emerald-700',
        note: 'Matrícula activa formal SEP, timbrado CFDI 4.0 IEDU y alta en padrón',
        dept: 'Caja, Tesorería & Control Escolar',
        systemLocation: 'Módulo de Cobranza SPEI + Padrón de Alumnos Activos',
        stageNum: 5
      },
    ];
  }, [selectedCampusId, prospectsList]);

  // -----------------------------------------------------------
  // DIFERENCIADOR ÉLITE: SIMULADOR DE ESCENARIOS "WHAT-IF"
  // (Modelado financiero holding en tiempo real a 0 tokens)
  // -----------------------------------------------------------
  const [simTuitionIncrease, setSimTuitionIncrease] = useState<number>(5); // % aumento colegiatura
  const [simDebtRecovery, setSimDebtRecovery] = useState<number>(4);      // % recuperación morosidad
  const [simRetentionBoost, setSimRetentionBoost] = useState<number>(96);   // % meta retención

  // Cálculo del Simulador en Tiempo Real
  const simResults = useMemo(() => {
    const baseAnnualBilling = 148500000; // $148.5M MXN anuales base del holding
    const tuitionGain = baseAnnualBilling * (simTuitionIncrease / 100);
    const debtGain = (baseAnnualBilling * 0.08) * (simDebtRecovery / 10);
    const retentionGain = Math.max(0, (simRetentionBoost - 92)) * 680000;
    const totalProjectedNetGain = tuitionGain + debtGain + retentionGain;
    const projectedEbitda = 41200000 + (totalProjectedNetGain * 0.82);
    const ebitdaMargin = ((projectedEbitda / (baseAnnualBilling + tuitionGain)) * 100).toFixed(1);

    return {
      tuitionGain,
      debtGain,
      retentionGain,
      totalProjectedNetGain,
      projectedEbitda,
      ebitdaMargin
    };
  }, [simTuitionIncrease, simDebtRecovery, simRetentionBoost]);

  // -----------------------------------------------------------
  // MOTOR DE CÁLCULO DE KPIS EN TIEMPO REAL (0 TOKENS)
  // -----------------------------------------------------------
  const { metrics, engineLatencyMs } = useMemo(() => {
    const t0 = performance.now();

    const baseCampuses = holding.campuses;
    const list = selectedCampusId === 'all' 
      ? baseCampuses 
      : baseCampuses.filter(c => c.id === selectedCampusId);

    const totalStudents = list.reduce((acc, c) => acc + c.students, 0);
    const totalTeachers = list.reduce((acc, c) => acc + c.teachers, 0);
    const totalAdmissions = list.reduce((acc, c) => acc + c.admissionsInProgress, 0);
    const avgCollection = Math.round(list.reduce((acc, c) => acc + c.collectionRate, 0) / (list.length || 1));
    const avgCurriculum = Math.round(list.reduce((acc, c) => acc + (c.curriculumCoverage || 92), 0) / (list.length || 1));
    const avgRetention = Math.round(list.reduce((acc, c) => acc + (c.retentionRate || 95), 0) / (list.length || 1));
    const totalCampuses = list.length;
    const totalFocalIssues = list.reduce((acc, c) => acc + c.focalIssues, 0);

    let deltas = {
      students: '↑ 3.2%',
      teachers: '↑ 2.1%',
      admissions: '↑ 15.4%',
      collectionTrend: avgCollection >= collectionThreshold ? 'En Meta' : 'Alerta'
    };

    if (timeFilter === 'mes') {
      deltas = { students: '↑ 3.0%', teachers: '↑ 2.0%', admissions: '↑ 15.0%', collectionTrend: 'En Seguimiento' };
    } else if (timeFilter === 'bimestre') {
      deltas = { students: '↑ 5.8%', teachers: '↑ 4.2%', admissions: '↑ 28.5%', collectionTrend: 'Cierre Próximo' };
    } else if (timeFilter === 'ciclo') {
      deltas = { students: '↑ 12.4%', teachers: '↑ 8.0%', admissions: '↑ 42.0%', collectionTrend: 'Ciclo 2026-2027' };
    }

    const t1 = performance.now();
    const engineLatencyMs = parseFloat((t1 - t0).toFixed(2));

    return {
      metrics: {
        totalStudents,
        totalTeachers,
        totalAdmissions,
        avgCollection,
        avgCurriculum,
        avgRetention,
        totalCampuses,
        totalFocalIssues,
        deltas,
        filteredCampuses: list
      },
      engineLatencyMs: engineLatencyMs < 0.1 ? 0.2 : engineLatencyMs
    };
  }, [selectedCampusId, timeFilter, holding.campuses, collectionThreshold, autonomousCycle]);

  // Motor Autónomo Watchdog
  useEffect(() => {
    if (!isAutonomousActive) return;
    const interval = setInterval(() => {
      setAutonomousCycle(c => c + 1);
      const now = new Date();
      setLastEvaluationTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 15000);
    return () => clearInterval(interval);
  }, [isAutonomousActive]);

  // Motor de Reportes Deterministas (0 Tokens)
  const runInstantReport = useCallback((queryTitle: string) => {
    const t0 = performance.now();
    setActiveReportQuery(queryTitle);

    const sources: EngineDataSources = {
      schoolId: activeSchoolId || 'sch-ibime-holding',
      isSuperUser: true,
      institutionsList,
      detailedStudents,
      campusesList,
      groupsList,
      attendanceList,
      billingRecords,
      staffPayroll,
      teachersList
    };

    const res = executeAnalyticQuery(queryTitle, sources);
    const t1 = performance.now();

    setReportResult(res);
    setReportLatencyMs(parseFloat((t1 - t0).toFixed(2)) || 0.8);
  }, [activeSchoolId, institutionsList, detailedStudents, campusesList, groupsList, attendanceList, billingRecords, staffPayroll, teachersList]);

  useEffect(() => {
    if (activeTab === 'reportes' || activeEngineModal?.id === 'reportes') {
      runInstantReport(activeReportQuery);
    }
  }, [activeTab, activeEngineModal, activeReportQuery, runInstantReport]);

  // -----------------------------------------------------------
  // BÚSQUEDA Y SÍNTESIS CERO-LAG EN CEREBRO INSTITUCIONAL
  // (Respuesta instantánea sin timeouts artificiales)
  // -----------------------------------------------------------
  const handleExecuteRAGQuery = useCallback((queryText: string) => {
    const cleanQuery = (queryText || '').trim();
    if (!cleanQuery) return;

    setIsRagSearching(true);
    setRagSearchVersion(v => v + 1);

    const t0 = performance.now();
    const qLower = cleanQuery
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    const qTokens = qLower.split(/\s+/).filter(w => w.length > 2);

    const isCampusSpecific = holding.campuses.find(c => 
      qLower.includes(c.name.toLowerCase().split(' ')[1] || '---') || 
      qLower.includes(c.location.toLowerCase().split(' ')[0] || '---')
    );
    const isCobranzaQuery = qTokens.some(t => ['cobranza', 'saldo', 'adeudo', 'finanzas', 'cfdi', 'sat', 'iedu', 'colegiatura', 'dinero', 'pago', 'factura'].includes(t));
    const isCurriculumQuery = qTokens.some(t => ['nem', 'planeacion', 'planeaciones', 'curricular', 'cobertura', 'sep', 'pda', 'fases', 'rubricas', 'academico'].includes(t));
    const isStudentQuery = qTokens.some(t => ['alumno', 'alumnos', 'estudiante', 'estudiantes', 'matricula', 'retencion', 'desercion', 'baja', 'bajas', 'inscripcion'].includes(t));
    const isTeacherQuery = qTokens.some(t => ['docente', 'docentes', 'maestro', 'maestros', 'profesor', 'profesores', 'plantilla', 'rotacion'].includes(t));
    const isEmergencyQuery = qTokens.some(t => ['emergencia', 'medica', 'alergia', 'sismo', 'evacuacion', 'salud', 'terremoto', 'choque', 'shock', 'enfermeria'].includes(t));

    let finalTitle = '';
    let finalText = '';
    let finalSource = '';
    let finalActionType = '';
    let finalActionLabel = '';
    let finalKpis: Array<{ label: string; value: string }> = [];
    let confidence = 98;

    if (isCampusSpecific) {
      finalTitle = `Dictamen Operativo: ${isCampusSpecific.name}`;
      finalSource = `Bóveda Curricular & Telemetría Sede • [${isCampusSpecific.location}]`;
      finalText = `La sede ${isCampusSpecific.name} registra una matrícula activa de ${isCampusSpecific.students.toLocaleString()} alumnos y una plantilla de ${isCampusSpecific.teachers} docentes (Ratio 1:${(isCampusSpecific.students / isCampusSpecific.teachers).toFixed(1)}). Su cobranza actual se sitúa en ${isCampusSpecific.collectionRate}% (Meta Corporativa: ${collectionThreshold}%). La cobertura curricular oficial de la SEP bajo el marco NEM 2024 alcanza el ${isCampusSpecific.curriculumCoverage || 93}%, con una retención escolar del ${isCampusSpecific.retentionRate || 95}%. ${isCampusSpecific.focalIssues > 0 ? `Cuenta con ${isCampusSpecific.focalIssues} foco(s) de atención prioritario(s).` : 'Operación en rango óptimo sin desviaciones críticas.'}`;
      finalKpis = [
        { label: 'Alumnos', value: isCampusSpecific.students.toLocaleString() },
        { label: 'Cobranza', value: `${isCampusSpecific.collectionRate}%` },
        { label: 'Cobertura SEP', value: `${isCampusSpecific.curriculumCoverage || 93}%` },
        { label: 'Focos Activos', value: `${isCampusSpecific.focalIssues}` }
      ];
      finalActionType = 'campus';
      finalActionLabel = `Filtrar a ${isCampusSpecific.name.split(' ')[1]}`;
    } else if (isCobranzaQuery) {
      const bestCampus = [...holding.campuses].sort((a, b) => b.collectionRate - a.collectionRate)[0];
      const lowestCampus = [...holding.campuses].sort((a, b) => a.collectionRate - b.collectionRate)[0];
      finalTitle = `Balance Financiero y Recaudación Consolidada`;
      finalSource = `Tesorería Central & Ledger SAT CFDI 4.0 IEDU`;
      finalText = `La cobranza consolidada del holding ${holding.name} se sitúa en un promedio del ${metrics.avgCollection}% frente a la meta del ${collectionThreshold}%. La sede con mejor desempeño es ${bestCampus.name} (${bestCampus.collectionRate}%), mientras que ${lowestCampus.name} (${lowestCampus.collectionRate}%) se mantiene bajo monitoreo preventivo. Todos los comprobantes se emiten bajo CFDI 4.0 con complemento de deducción IEDU conciliado automáticamente al registrar el pago en ledger bancario.`;
      finalKpis = [
        { label: 'Cobranza Media', value: `${metrics.avgCollection}%` },
        { label: 'Líder en Cobro', value: `${bestCampus.collectionRate}%` },
        { label: 'Sede en Alerta', value: `${lowestCampus.name.split(' ')[1]} (${lowestCampus.collectionRate}%)` },
        { label: 'Timbrado Fiscal', value: 'CFDI 4.0 100%' }
      ];
      finalActionType = 'cobranza';
      finalActionLabel = 'Gestionar Foco de Cobranza';
    } else if (isCurriculumQuery) {
      finalTitle = `Matriz de Cobertura Curricular y Planeaciones NEM 2024`;
      finalSource = `Bóveda Curricular Central & SEP Proyectos Comunitarios`;
      finalText = `La cobertura curricular consolidada en la Red alcanza el ${metrics.avgCurriculum}%. Se utilizan planeaciones de aula cronometradas (Inicio, Desarrollo, Cierre) estructuradas bajo la Nueva Escuela Mexicana (NEM 2024) con Procesos de Desarrollo de Aprendizaje (PDA) oficiales, rúbricas analíticas formativas y verificación directa en la Bóveda Curricular. Se mantiene supervisión preventiva en las evaluaciones formativas de Fase 6 en Secundaria.`;
      finalKpis = [
        { label: 'Cobertura Red', value: `${metrics.avgCurriculum}%` },
        { label: 'Planeaciones NEM', value: 'PDA Oficial SEP' },
        { label: 'Estructura Aula', value: 'Inicio-Des-Cierre' },
        { label: 'Bóveda Conocimiento', value: '100% Indexada' }
      ];
      finalActionType = 'academico';
      finalActionLabel = 'Supervisar Planeaciones NEM';
    } else if (isStudentQuery) {
      finalTitle = `Diagnóstico de Matrícula, Retención y Expediente 360`;
      finalSource = `Registro Escolar Consolidado & Comités de Dirección`;
      finalText = `La matrícula total auditada en la Red es de ${metrics.totalStudents.toLocaleString()} alumnos activos en ${metrics.totalCampuses} planteles. El índice de retención anual se posiciona en ${metrics.avgRetention}%. Existen ${metrics.totalAdmissions} prospectos en proceso de inscripción con diagnóstico completado. Ante solicitudes de baja, se aplica la ruta diagnóstica con acceso al fondo corporativo de becas de contingencia (15% al 35%) para mitigar la deserción escolar.`;
      finalKpis = [
        { label: 'Alumnos Totales', value: metrics.totalStudents.toLocaleString() },
        { label: 'Tasa Retención', value: `${metrics.avgRetention}%` },
        { label: 'Admisiones Pipeline', value: `${metrics.totalAdmissions}` },
        { label: 'Beca Contingencia', value: '15% - 35%' }
      ];
      finalActionType = 'alumnos';
      finalActionLabel = 'Ver Desglose de Alumnos';
    } else if (isTeacherQuery) {
      finalTitle = `Plantilla Docente y Asignaciones Titulares`;
      finalSource = `Coordinación Académica & Bóveda de Talento Humano`;
      finalText = `El cuerpo docente de ${holding.name} cuenta con ${metrics.totalTeachers.toLocaleString()} maestros titulares y especialistas activos en ${metrics.totalCampuses} sedes. La ratio media es de 1 docente por cada ${(metrics.totalStudents / metrics.totalTeachers).toFixed(1)} educandos. Se identificó una rotación preventiva de 3 bajas docentes en el último mes con protocolos de reemplazo en menos de 48 horas habilitados en la Bóveda de Talento.`;
      finalKpis = [
        { label: 'Docentes Activos', value: metrics.totalTeachers.toLocaleString() },
        { label: 'Ratio Alumno/Docente', value: `1:${(metrics.totalStudents / metrics.totalTeachers).toFixed(1)}` },
        { label: 'Bajas Recientes', value: '3 en reemplazo' },
        { label: 'Tiempo Reemplazo', value: '< 48 hrs' }
      ];
      finalActionType = 'docentes';
      finalActionLabel = 'Abrir Cartera Docente';
    } else if (isEmergencyQuery) {
      finalTitle = `Protocolos de Emergencia Médica y Protección Civil Escolar`;
      finalSource = `Normativa Médica Oficial & Protección Civil Grupo`;
      finalText = `El protocolo de emergencia médica estandarizado exige verificar de inmediato el Expediente 360 del alumno en pantalla, aplicar estabilización primaria por personal de enfermería y emitir la notificación push a los tutores legales en < 3 minutos. Ante alertas sísmicas o evacuación, el desalojo ordenado a zonas seguras se cronometra en < 90 segundos con pase de lista biométrico digital inmutable.`;
      finalKpis = [
        { label: 'Alerta a Padres', value: '< 3 minutos' },
        { label: 'Evacuación Sismo', value: '< 90 segundos' },
        { label: 'Expediente 360', value: 'Alergias y Póliza' },
        { label: 'Folio Bitácora', value: 'Inmutable' }
      ];
      finalActionType = 'emergencia';
      finalActionLabel = 'Ver Expediente de Seguridad';
    } else {
      let bestScore = -1;
      let bestMatch = INSTITUTIONAL_KNOWLEDGE_BASE[0];

      INSTITUTIONAL_KNOWLEDGE_BASE.forEach(doc => {
        let score = 0;
        const combined = `${doc.topic} ${doc.category} ${doc.summary} ${doc.keywords.join(' ')}`
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");

        qTokens.forEach(t => {
          if (combined.includes(t)) score += 12;
          if (doc.keywords.some(k => k.includes(t))) score += 18;
        });

        if (score > bestScore) {
          bestScore = score;
          bestMatch = doc;
        }
      });

      finalTitle = bestMatch.topic;
      finalSource = `${bestMatch.sede} • [${bestMatch.category}]`;
      finalText = bestMatch.answer;
      confidence = bestScore > 0 ? Math.min(99, 78 + bestScore) : 92;
      finalKpis = [
        { label: 'Bóveda Central', value: 'Indexado' },
        { label: 'Consultas Red', value: bestMatch.reads },
        { label: 'Normativa', value: bestMatch.category },
        { label: 'Vigencia', value: 'Ciclo 2026-2027' }
      ];
      finalActionType = 'academico';
      finalActionLabel = 'Supervisar Procedimiento';
    }

    const t1 = performance.now();
    const latency = parseFloat((t1 - t0).toFixed(2)) || 0.1;

    // Ejecución instantánea sin retardos artificiales
    setRagAnswer({
      title: finalTitle,
      text: finalText,
      source: finalSource,
      latencyMs: latency,
      tokens: 0,
      confidence,
      kpis: finalKpis,
      actionType: finalActionType,
      actionLabel: finalActionLabel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    });
    setIsRagSearching(false);
    triggerToast(`Bóveda Curricular: Consulta analizada en ${latency} ms a 0 tokens`);
  }, [holding.campuses, metrics, collectionThreshold, triggerToast]);

  const handleCopyAnswer = (text: string) => {
    navigator.clipboard.writeText(text);
    triggerToast("✓ Dictamen ejecutivo copiado al portapapeles");
  };

  // Manejo de teclado (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setActiveFocalModal(null);
        setActiveKPIDrawer(null);
        setIsBrainModalOpen(false);
        setActiveEngineModal(null);
        setSelectedAuditLog(null);
        setIsAllFocalsOpen(false);
        setIsThresholdModalOpen(false);
        setIsAllActivityOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Exportar reporte CSV
  const handleExportCSV = () => {
    const rows = [
      ['Plantel / Campus', 'Ubicación', 'Alumnos', 'Docentes', 'Cobranza (%)', 'Cobertura Curricular (%)', 'Retención (%)', 'Focos de Atención'],
      ...holding.campuses.map(c => [
        `"${c.name}"`,
        `"${c.location}"`,
        c.students,
        c.teachers,
        `${c.collectionRate}%`,
        `${c.curriculumCoverage || 92}%`,
        `${c.retentionRate || 95}%`,
        c.focalIssues
      ])
    ];
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Balance_Ejecutivo_${holding.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast('Reporte CSV consolidado descargado.');
  };

  // Navegación fluida con cambio instantáneo de vista y cierre de drawer móvil
  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    if (tabId === 'cerebro') {
      setIsBrainModalOpen(true);
    }
    if (onNavigateTab) onNavigateTab(tabId);
  };

  const navMenuItems = [
    { id: 'inicio', label: 'Inicio', icon: Building2, desc: 'Consolidado Holding' },
    { id: 'vision', label: 'Visión Ejecutiva', icon: TrendingUp, desc: 'EBITDA & Simulador' },
    { id: 'colegios', label: 'Colegios', icon: School, desc: 'Benchmark 5 Sedes' },
    { id: 'personas', label: 'Personas', icon: Users, desc: 'Talento & Alumno 360' },
    { id: 'academico', label: 'Académico (NEM)', icon: GraduationCap, desc: 'SEP Fases & XP' },
    { id: 'admisiones', label: 'Admisiones', icon: UserCheck, desc: 'Embudo & Conversión' },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign, desc: 'CFDI 4.0 IEDU SAT' },
    { id: 'operacion', label: 'Operación', icon: SlidersHorizontal, desc: 'Automatizaciones' },
    { id: 'reportes', label: 'Reportes BI', icon: BarChart3, desc: 'Dataframes en Vivo' },
    { id: 'cerebro', label: `Cerebro ${holding.name}`, icon: Network, desc: 'Segundo Cerebro', highlight: true },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans antialiased overflow-hidden select-none">
      
      {/* ========================================================= */}
      {/* 1. BARRA LATERAL DESKTOP (VISIBLE EN PANTALLAS GRANDES)   */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between z-20 shrink-0 select-none">
        <div>
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                i
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">iSkool</span>
              <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                CEO
              </span>
            </div>
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="p-3 space-y-1">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 cursor-pointer active:scale-98 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'text-indigo-900 bg-indigo-50/80 hover:bg-indigo-100 font-bold border border-indigo-200/60'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-slate-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar Desktop */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer active:scale-98"
              title="Volver al Directorio Institucional de Colegios"
            >
              <div className="flex items-center gap-1.5">
                <ChevronLeft size={14} className="text-indigo-600" />
                <span>Directorio Colegios</span>
              </div>
              <span className="text-[9px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Super</span>
            </button>
          )}

          {onSwitchToOperational && (
            <button
              onClick={onSwitchToOperational}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer active:scale-98"
            >
              <span>Vista Operativa</span>
              <ArrowRight size={14} />
            </button>
          )}

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-[11px] space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span>Motor Determinista</span>
              <span className="font-mono font-bold text-emerald-600">0 Tokens</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Latencia Motor</span>
              <span className="font-mono text-slate-700 font-semibold">{engineLatencyMs} ms</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Ciclo Autónomo</span>
              <span className="font-mono text-indigo-600 font-semibold">#{autonomousCycle}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500">
              <span>Aislamiento RLS</span>
              <span className="font-semibold text-slate-800 truncate max-w-[100px]">{holding.slug}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* 1.1 DRAWER MÓVIL Y TABLET (SIDEBAR DESPLEGABLE)          */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop oscurecido */}
          <div 
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />

          {/* Panel Lateral Desplegable */}
          <aside className="relative w-72 max-w-[85vw] bg-white h-full flex flex-col justify-between z-10 shadow-2xl animate-in slide-in-from-left duration-200">
            <div>
              {/* Header del Drawer Móvil */}
              <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                    i
                  </div>
                  <span className="text-xl font-bold tracking-tight text-slate-900">iSkool</span>
                  <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                    CEO
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Cerrar menú"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Lista de Navegación Móvil */}
              <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
                {navMenuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 cursor-pointer active:scale-98 ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-sm font-semibold'
                          : item.highlight
                          ? 'text-indigo-900 bg-indigo-50 font-bold border border-indigo-200/60'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={18} className={isActive ? 'text-white' : item.highlight ? 'text-indigo-600' : 'text-slate-500'} />
                        <div className="text-left">
                          <div className="leading-tight">{item.label}</div>
                          <div className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>{item.desc}</div>
                        </div>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-slate-400" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Footer del Drawer Móvil */}
            <div className="p-3 border-t border-slate-100 space-y-2 bg-slate-50/50">
              {onBackToDirectory && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onBackToDirectory();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-200/80 hover:bg-slate-300/80 border border-slate-300 transition-colors cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-1.5">
                    <ChevronLeft size={14} className="text-indigo-600" />
                    <span>Directorio de Colegios</span>
                  </div>
                  <span className="text-[9px] font-black bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">Super</span>
                </button>
              )}

              {onSwitchToOperational && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onSwitchToOperational();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-100/70 hover:bg-indigo-200/70 border border-indigo-200 transition-colors cursor-pointer active:scale-98"
                >
                  <span>Vista Operativa</span>
                  <ArrowRight size={14} />
                </button>
              )}
              <div className="flex items-center justify-between px-2 text-[11px] text-slate-500 font-mono">
                <span>Motor: 0 Tokens</span>
                <span className="text-indigo-600 font-bold">#{autonomousCycle}</span>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ÁREA PRINCIPAL (HEADER + CONSOLA MODULAR ACTIVA)       */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Ejecutivo Responsivo (Móvil, Tablet y Desktop) */}
        <header className="min-h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 z-10 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Botón Menú Hamburguesa para Móvil y Tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 cursor-pointer active:scale-95 shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} />
            </button>

            {/* Identidad del Holding */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <Building2 className="text-slate-700 shrink-0 hidden sm:block" size={18} />
              <h1 className="text-xs sm:text-base lg:text-lg font-black text-slate-900 tracking-tight truncate max-w-[120px] xs:max-w-[160px] sm:max-w-[220px] md:max-w-none">
                {holding.name}
              </h1>
              <span className="hidden md:inline-block text-[10px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200 shrink-0">
                Holding Educativo
              </span>
            </div>

            {/* Selector de Campus (Consolidado vs Sede Específica) */}
            <div className="relative shrink-0">
              <select
                value={selectedCampusId}
                onChange={(e) => {
                  setSelectedCampusId(e.target.value);
                  triggerToast(e.target.value === 'all' ? 'Mostrando datos consolidados' : `Filtrando a: ${holding.campuses.find(c => c.id === e.target.value)?.name}`);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] sm:text-xs font-semibold rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-7 py-1 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer transition-colors max-w-[130px] sm:max-w-[190px] truncate"
              >
                <option value="all">Consolidado ({holding.campuses.length} Sedes)</option>
                {holding.campuses.map(campus => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={13} className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Acciones Rápidas del Header */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Botón Volver al Directorio de Colegios (Exclusivo Super Usuario) */}
            {onBackToDirectory && (
              <button
                onClick={onBackToDirectory}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 shadow-xs transition-all cursor-pointer active:scale-95"
                title="Volver a la consola global de colegios ISkool"
              >
                <ChevronLeft size={14} className="text-indigo-600" />
                <span className="hidden sm:inline">Directorio Colegios</span>
              </button>
            )}

            {/* Buscador Rápido (Cmd+K) en Desktop, icono en Móvil */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer active:scale-95"
              title="Buscar en la red escolar (⌘K)"
            >
              <Search size={14} />
              <span className="hidden md:inline">Buscar...</span>
              <kbd className="hidden lg:inline bg-white border border-slate-300 text-[10px] font-mono px-1.5 py-0.2 rounded text-slate-400">⌘K</kbd>
            </button>

            {/* Exportar Consolidado CSV */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300/80 transition-colors cursor-pointer active:scale-95"
              title="Descargar reporte consolidado CSV"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>

            {/* Botón Explorar Cerebro */}
            <button
              onClick={() => setIsBrainModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-xs">Cerebro</span>
            </button>
          </div>
        </header>

        {/* TOAST FLOTANTE */}
        {toastMessage && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-100 max-w-[90vw]">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* CUERPO PRINCIPAL MODULAR CON TRANSICIÓN INSTANTÁNEA       */}
        {/* ========================================================= */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 space-y-4 sm:space-y-6">
          
          {/* BARRA DE MONITOREO AUTÓNOMO EN VIVO (0 TOKENS) */}
          <div className="bg-slate-900 text-white p-3 sm:px-5 sm:py-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <div className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </div>
              <div>
                <span className="font-bold text-white">Motor Autónomo de Análisis en Vivo</span>
                <span className="text-slate-400 ml-1.5 font-mono text-[11px] block sm:inline">
                  • 0 Tokens • Evaluación #{autonomousCycle} ({lastEvaluationTime}) • {metrics.totalCampuses} Sedes Auditadas
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  setAutonomousCycle(c => c + 1);
                  const now = new Date();
                  setLastEvaluationTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                  triggerToast(`Pulso ejecutado: ${metrics.totalCampuses} sedes auditadas a 0 tokens (${metrics.totalStudents.toLocaleString()} alumnos evaluados)`);
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700 active:scale-95"
              >
                <RefreshCw size={12} />
                <span>Forzar Pulso Analítico</span>
              </button>
            </div>
          </div>

          {/* TARJETA DE LICENCIA SAAS EMPRESARIAL ISKOOL • TENANT ESCOLAR */}
          <div className="bg-white p-4 rounded-2xl border border-indigo-100 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <Building2 size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentInstitution?.licensing?.licensee || currentInstitution?.name || holding.name}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {currentInstitution?.licensing?.planName || 'Licencia SaaS Enterprise Activa'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    ID: {currentInstitution?.licensing?.licenseKey || `ISK-LIC-2026-${(holding.slug || 'ENT').toUpperCase()}-${holding.campuses.length}CAMPUS`}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  <span className="font-semibold text-slate-700">Licenciatario:</span> {currentInstitution?.name || holding.name} ({holding.campuses.length} Planteles) • <span className="font-semibold text-slate-700">Software Propietario:</span> {currentInstitution?.licensing?.licensor || 'ISkool Technologies Inc.'} • <span className="text-indigo-600 font-medium">Asientos: {metrics.totalStudents.toLocaleString()} en uso de {(currentInstitution?.licensing?.contractedSeats || (metrics.totalStudents + 200)).toLocaleString()} contratados ({Math.min(100, Math.round(((metrics.totalStudents) / (currentInstitution?.licensing?.contractedSeats || (metrics.totalStudents + 200))) * 1000) / 10)}% ocupación)</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <div className="text-right hidden sm:block">
                <div className="text-[11px] font-bold text-slate-700">Vigencia Anual: 2026-2027</div>
                <div className="text-[10px] text-emerald-600 font-semibold">● Timbrado CFDI/IEDU 0 Tokens Activo</div>
              </div>
              <button
                onClick={() => triggerToast(`✓ Contrato de Licencia SaaS verificado: ${(currentInstitution?.licensing?.contractedSeats || (metrics.totalStudents + 200)).toLocaleString()} asientos autorizados para ${currentInstitution?.name || holding.name}`)}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <FileCheck2 size={14} />
                <span>Auditoría de Licencia</span>
              </button>
            </div>
          </div>

          {/* BARRA DE DIFERENCIADORES ESTRATÉGICOS ISKOOL */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3.5 rounded-2xl border border-indigo-500/30 flex flex-wrap items-center justify-between gap-3 text-xs text-white">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              <span className="font-extrabold tracking-wide uppercase text-[11px] text-amber-300">Diferenciadores Clave iSkool Élite:</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Simulador "What-If" EBITDA', tab: 'vision', color: 'bg-indigo-600/40 text-indigo-200 border-indigo-400/40 hover:bg-indigo-600/60' },
                { label: 'Alineación Oficial SEP NEM 2024', tab: 'academico', color: 'bg-emerald-600/40 text-emerald-200 border-emerald-400/40 hover:bg-emerald-600/60' },
                { label: 'Gamificación & Lienzo Digital', tab: 'academico', color: 'bg-purple-600/40 text-purple-200 border-purple-400/40 hover:bg-purple-600/60' },
                { label: 'CFDI 4.0 Complemento IEDU SAT', tab: 'finanzas', color: 'bg-amber-600/40 text-amber-200 border-amber-400/40 hover:bg-amber-600/60' },
                { label: 'Segundo Cerebro Institucional', tab: 'cerebro', color: 'bg-cyan-600/40 text-cyan-200 border-cyan-400/40 hover:bg-cyan-600/60' },
              ].map((diff, i) => (
                <button
                  key={i}
                  onClick={() => handleNavClick(diff.tab)}
                  className={`px-3 py-1.5 rounded-xl border font-bold hover:scale-103 transition-all cursor-pointer text-xs ${diff.color}`}
                >
                  {diff.label}
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================= */}
          {/* MÓDULO 1: INICIO (CONSOLIDADO MAESTRO)                  */}
          {/* ======================================================= */}
          {activeTab === 'inicio' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Consola de Mando Corporativo • Ciclo 2026-2027
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {selectedCampusId === 'all' ? 'Resumen Ejecutivo Consolidado' : holding.campuses.find(c => c.id === selectedCampusId)?.name}
                  </h2>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                  <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
                    <div className="relative">
                      <select
                        value={timeFilter}
                        onChange={(e) => setTimeFilter(e.target.value as any)}
                        className="appearance-none bg-transparent border-none text-xs font-bold text-slate-700 pl-3 pr-7 py-1.5 focus:outline-none cursor-pointer"
                      >
                        <option value="semana">📅 Esta semana</option>
                        <option value="mes">📅 Este mes</option>
                        <option value="bimestre">📅 Bimestre actual</option>
                        <option value="ciclo">📅 Ciclo 2026-2027</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    </div>
                  </div>
                  <div className="text-right text-xs italic text-slate-400 font-serif">
                    "{holding.tagline}" <span className="font-semibold not-italic text-slate-600">— {holding.name}</span>
                  </div>
                </div>
              </div>

              {/* 5 TARJETAS DE KPIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* KPI 1: Alumnos */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'students',
                    title: 'Desglose de Alumnos por Sede',
                    description: 'Matrícula activa auditada ante la Secretaría de Educación Pública y expediente 360.',
                    targetValue: `${metrics.totalStudents.toLocaleString()}`,
                    unit: 'Alumnos matriculados'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <GraduationCap size={20} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {metrics.deltas.students}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalStudents.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Alumnos</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>vs. periodo anterior</span>
                    <span className="text-teal-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 2: Docentes */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'teachers',
                    title: 'Cuerpo Docente y Asignaciones',
                    description: 'Plantilla de maestros titulares y adjuntos con ratio de 1:14.4.',
                    targetValue: `${metrics.totalTeachers.toLocaleString()}`,
                    unit: 'Docentes activos'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Users size={20} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {metrics.deltas.teachers}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalTeachers.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Docentes</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>vs. periodo anterior</span>
                    <span className="text-blue-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 3: Colegios */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'campuses',
                    title: 'Sedes y Planteles Operativos',
                    description: 'Red escolar con cobertura multirregional y sincronización de estándares de calidad.',
                    targetValue: `${metrics.totalCampuses}`,
                    unit: 'Colegios activos'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Building2 size={20} />
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      Activos
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalCampuses}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Colegios</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>3 regiones clave</span>
                    <span className="text-indigo-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 4: Admisiones */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'admissions',
                    title: 'Pipeline de Admisiones y Matrícula',
                    description: 'Prospectos con diagnóstico psicopedagógico completado y entrevistas agendadas.',
                    targetValue: `${metrics.totalAdmissions}`,
                    unit: 'Prospectos en proceso'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <FileText size={20} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {metrics.deltas.admissions}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalAdmissions}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Admisiones en proceso</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>vs. mismo periodo</span>
                    <span className="text-purple-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 5: Cobranza */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'collection',
                    title: 'Cobranza Consolidada y Eficiencia Financiera',
                    description: 'Porcentaje de recuperación de colegiaturas frente al umbral objetivo institucional.',
                    targetValue: `${metrics.avgCollection}%`,
                    unit: 'Cobranza global'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <DollarSign size={20} />
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                      metrics.avgCollection >= collectionThreshold ? 'text-emerald-600 bg-emerald-50' : 'text-amber-700 bg-amber-50'
                    }`}>
                      Meta {collectionThreshold}%
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.avgCollection}%
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">Cobranza Global</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>Ledger inmutable SAT</span>
                    <span className="text-amber-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>
              </div>

              {/* FOCOS + AVANCE + MIS ACCESOS */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Focos de Atención (5 cols) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-slate-900 text-base">Focos de atención</h2>
                        <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center">
                          4
                        </span>
                      </div>
                      <button 
                        onClick={() => setIsAllFocalsOpen(true)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        Ver todos <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div 
                        onClick={() => setActiveFocalModal({
                          isOpen: true,
                          title: 'Desviación en Meta de Cobranza',
                          description: 'Campus Coacalco (91%) y Campus San Cristóbal (93%) presentan seguimiento en pagos frente al umbral corporativo de 95%.',
                          campusAffected: ['Campus Coacalco', 'Campus San Cristóbal'],
                          actionType: 'cobranza'
                        })}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-rose-300 hover:bg-rose-50/30 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle size={17} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-rose-700 transition-colors">
                              Cobranza
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              2 planteles en seguimiento (91% y 93%)
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-rose-600 transition-all" />
                      </div>

                      <div 
                        onClick={() => setActiveFocalModal({
                          isOpen: true,
                          title: 'Campaña de Reinscripciones Pendiente',
                          description: 'Se requiere activar el recordatorio vía portal y WhatsApp institucional en Campus San Cristóbal y Campus Coacalco.',
                          campusAffected: ['Campus San Cristóbal', 'Campus Coacalco'],
                          actionType: 'reinscripcion'
                        })}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <UserCheck size={17} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                              Reinscripciones
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Iniciar campaña formal en 2 planteles
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-amber-600 transition-all" />
                      </div>

                      <div 
                        onClick={() => setActiveFocalModal({
                          isOpen: true,
                          title: 'Auditoría Curricular y Desempeño NEM',
                          description: 'Evaluaciones formativas de Secundaria en Fase 6 muestran dispersión en el campo formativo Saberes y Pensamiento Científico.',
                          campusAffected: ['Campus San Cristóbal', 'Campus Coacalco'],
                          actionType: 'academico'
                        })}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                            <BarChart3 size={17} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                              Desempeño académico
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              Revisar resultados de evaluaciones en Secundaria
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-blue-600 transition-all" />
                      </div>

                      <div 
                        onClick={() => setActiveFocalModal({
                          isOpen: true,
                          title: 'Alerta Temprana de Rotación Docente',
                          description: 'Se han procesado 2 bajas de docentes titulares de reemplazo temporal en Campus Coacalco y Campus San Cristóbal. Bóveda de reemplazo activada.',
                          campusAffected: ['Campus Coacalco', 'Campus San Cristóbal'],
                          actionType: 'docentes'
                        })}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-purple-300 hover:bg-purple-50/30 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5">
                            <UserMinus size={17} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                              Rotación docente
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              3 bajas registradas en el último mes
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-purple-600 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
                    <span>Motor de diagnóstico en tiempo real (0 Tokens)</span>
                    <span 
                      className="text-indigo-600 font-semibold cursor-pointer hover:underline" 
                      onClick={() => setIsThresholdModalOpen(true)}
                    >
                      Configurar umbrales
                    </span>
                  </div>
                </div>

                {/* Avance por Colegio (4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-bold text-slate-900 text-base">Avance por colegio</h2>
                        <span className="text-[11px] text-slate-400">Eficiencia Ponderada Holding</span>
                      </div>
                      <button 
                        onClick={() => setIsComparativeMatrixOpen(prev => !prev)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        {isComparativeMatrixOpen ? 'Ver barras' : 'Ver detalle'} <ChevronRight size={14} />
                      </button>
                    </div>

                    {!isComparativeMatrixOpen ? (
                      <div className="space-y-4">
                        {metrics.filteredCampuses.map((campus) => {
                          const isWarning = campus.collectionRate < 90;
                          const isDanger = campus.collectionRate < 85;
                          return (
                            <div 
                              key={campus.id} 
                              onClick={() => {
                                setSelectedCampusId(campus.id);
                                triggerToast(`Filtrado a ${campus.name}`);
                              }}
                              className="space-y-1.5 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                            >
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-700">{campus.name}</span>
                                <span className={isDanger ? 'text-rose-600 font-bold' : isWarning ? 'text-amber-600 font-bold' : 'text-slate-600'}>
                                  {campus.collectionRate}%
                                </span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-300 ${
                                    isDanger ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${campus.collectionRate}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="overflow-x-auto -mx-2">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 text-slate-400 font-semibold">
                              <th className="pb-2">Sede</th>
                              <th className="pb-2 text-right">Alumnos</th>
                              <th className="pb-2 text-right">Cobranza</th>
                              <th className="pb-2 text-right">Cobertura</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {metrics.filteredCampuses.map(campus => (
                              <tr 
                                key={campus.id} 
                                onClick={() => {
                                  setSelectedCampusId(campus.id);
                                  triggerToast(`Tablero enfocado en: ${campus.name}`);
                                }}
                                className="hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                <td className="py-2 font-medium text-slate-800">{campus.name.split('(')[0]}</td>
                                <td className="py-2 text-right font-mono text-slate-600">{campus.students.toLocaleString()}</td>
                                <td className="py-2 text-right font-bold text-emerald-600">{campus.collectionRate}%</td>
                                <td className="py-2 text-right font-semibold text-indigo-600">{campus.curriculumCoverage || 94}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Óptimo (&gt;90%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Alerta (&lt;90%)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /> Crítico (&lt;85%)</span>
                  </div>
                </div>

                {/* Mis Accesos & Actividad (3 cols) */}
                <div className="lg:col-span-3 space-y-6">
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <h3 className="font-bold text-slate-900 text-sm mb-4">Mis accesos</h3>
                    <div className="space-y-2.5">
                      {[
                        { id: 'cerebro', title: `Cerebro ${holding.name}`, desc: 'Todo el conocimiento de red', icon: Network, action: () => setIsBrainModalOpen(true) },
                        { id: 'reportes', title: 'Reportes ejecutivos (BI)', desc: 'Balances analíticos en tiempo real', icon: BarChart3, action: () => handleNavClick('reportes') },
                        { id: 'okrs', title: 'Plan estratégico', desc: 'Simulador y OKRs 2026-2027', icon: Target, action: () => handleNavClick('vision') },
                        { id: 'automatizaciones', title: 'Automatizaciones', desc: 'Flujos operativos inteligentes', icon: Zap, action: () => handleNavClick('operacion') },
                      ].map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={idx}
                            onClick={item.action}
                            className="w-full flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left group cursor-pointer active:scale-98"
                          >
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 group-hover:bg-slate-900 group-hover:text-white transition-colors">
                              <Icon size={16} />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                                {item.desc}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actividad reciente resumida */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-900 text-sm">Actividad reciente</h3>
                    </div>
                    <div className="space-y-3 text-xs">
                      {[
                        { title: 'Auditoría curricular completada', campus: 'Campus Montes', time: 'hace 2 hrs', icon: FileText, color: 'text-blue-500' },
                        { title: 'Prospecto nuevo en CRM', campus: 'Campus San Cristóbal', time: 'hace 4 hrs', icon: UserCheck, color: 'text-teal-500' },
                        { title: 'Cobranza preventiva 142 folios', campus: 'Red IBIME Central', time: 'hace 1 día', icon: Zap, color: 'text-purple-500' },
                      ].map((act, i) => {
                        const Icon = act.icon;
                        return (
                          <div key={i} className="flex items-start gap-2.5 p-1 rounded-lg">
                            <Icon size={14} className={`${act.color} shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-slate-800 truncate">{act.title}</div>
                              <div className="text-[11px] text-slate-400">{act.campus}</div>
                            </div>
                            <span className="text-[10px] text-slate-400 shrink-0">{act.time}</span>
                          </div>
                        );
                      })}
                    </div>
                    <button 
                      onClick={() => setIsAllActivityOpen(true)}
                      className="w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                    >
                      Ver bitácora completa <ChevronRight size={13} />
                    </button>
                  </div>
                </div>

              </div>

              {/* BANNER CEREBRO INFERIOR */}
              <div className="relative rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 text-white overflow-hidden shadow-xl border border-slate-800">
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                  <div className="w-full lg:w-1/3 flex items-center justify-center p-2">
                    <div className="relative w-72 h-44 border border-indigo-500/30 rounded-2xl bg-slate-900/70 p-4 flex flex-col justify-between backdrop-blur-xs">
                      <div className="flex justify-between items-center text-[10px] text-indigo-300 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                          RED NEURONAL VIVA
                        </span>
                        <span>{metrics.totalCampuses}/{metrics.totalCampuses} SEDES</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 my-auto text-center text-[11px] font-semibold">
                        {['Alumnos', holding.name.split(' ')[0], 'Procesos', 'Personas', 'Sedes', 'SOPs'].map((node, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setRagQuery(node);
                              handleExecuteRAGQuery(node);
                              setIsBrainModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-900 cursor-pointer transition-colors"
                          >
                            {node}
                          </div>
                        ))}
                      </div>
                      <div className="text-center text-[10px] text-slate-400">
                        +1,420 documentos y aprendizajes sincronizados
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-2/3 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                      <Network size={16} />
                      <span>Cerebro Institucional {holding.name}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      Todo el conocimiento de nuestra red, conectado y siempre vivo.
                    </h3>
                    <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                      Documentos, procesos, experiencias pedagógicas y aprendizajes de todos nuestros colegios, en un solo lugar. Propiedad intelectual exclusiva de {holding.name}.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-4">
                      <button
                        onClick={() => setIsBrainModalOpen(true)}
                        className="bg-white hover:bg-slate-100 text-slate-950 font-bold text-sm px-6 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Explorar cerebro {holding.name}</span>
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 2: VISIÓN EJECUTIVA (EBITDA & SIMULADOR WHAT-IF) */}
          {/* ======================================================= */}
          {activeTab === 'vision' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                    C-Suite Strategic Suite
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Visión Financiera Estratégica & Proyecciones Holding
                  </h2>
                  <p className="text-xs text-slate-500">Métricas de rentabilidad, margen EBITDA y simulador de decisiones de directorio en tiempo real.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  <span>Exportar Dictamen de Consejo (CSV)</span>
                </button>
              </div>

              {/* TARJETAS C-SUITE METRICS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Facturación Anual Proyectada</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">$148,500,000 MXN</div>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">↑ 8.4% vs ciclo anterior</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">EBITDA Estimado Holding</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">${(simResults.projectedEbitda / 1000000).toFixed(1)}M MXN</div>
                  <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-bold mt-1 inline-block">
                    Margen {simResults.ebitdaMargin}%
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Flujo Operativo Neto</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">$29,840,000 MXN</div>
                  <span className="text-xs text-slate-500 mt-1 block">Caja disponible para reinversión</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Valoración por Alumno Activo</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">$19,220 MXN / ciclo</div>
                  <span className="text-xs text-slate-500 mt-1 block">Ticket promedio consolidado</span>
                </div>
              </div>

              {/* DIFERENCIADOR ÉLITE: SIMULADOR DE ESCENARIOS "WHAT-IF" */}
              <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 p-7 rounded-3xl text-white shadow-xl border border-indigo-500/30 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/40 text-indigo-300 flex items-center justify-center border border-indigo-500/40">
                      <Calculator size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-white">Simulador Ejecutivo de Escenarios ("What-If" Engine)</h3>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                          0 Tokens • Tiempo Real
                        </span>
                      </div>
                      <p className="text-xs text-indigo-300">Modela el impacto de tus decisiones estratégicas sobre el flujo neto y EBITDA del holding.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSimTuitionIncrease(5);
                      setSimDebtRecovery(4);
                      setSimRetentionBoost(96);
                      triggerToast("Simulador restablecido a valores estándar de mercado.");
                    }}
                    className="text-xs text-indigo-300 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 cursor-pointer"
                  >
                    Restablecer Valores
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Slider 1: Incremento de Colegiatura */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">Ajuste de Colegiatura:</span>
                      <span className="text-sm font-black text-indigo-400 font-mono">+{simTuitionIncrease}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={15} 
                      value={simTuitionIncrease}
                      onChange={(e) => setSimTuitionIncrease(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0% (Sin aumento)</span>
                      <span>+15% (Inflación alta)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 flex justify-between">
                      <span>Impacto en facturación:</span>
                      <strong className="text-emerald-400 font-mono">+${(simResults.tuitionGain / 1000000).toFixed(2)}M MXN</strong>
                    </div>
                  </div>

                  {/* Slider 2: Mitigación de Cartera Vencida */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">Recuperación de Morosidad:</span>
                      <span className="text-sm font-black text-amber-400 font-mono">+{simDebtRecovery * 10}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={10} 
                      value={simDebtRecovery}
                      onChange={(e) => setSimDebtRecovery(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0% (Lenta)</span>
                      <span>100% (Automatizada)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 flex justify-between">
                      <span>Capital recuperado:</span>
                      <strong className="text-amber-400 font-mono">+${(simResults.debtGain / 1000000).toFixed(2)}M MXN</strong>
                    </div>
                  </div>

                  {/* Slider 3: Retención de Matrícula */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">Meta de Retención Alumnos:</span>
                      <span className="text-sm font-black text-teal-400 font-mono">{simRetentionBoost}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={90} 
                      max={99} 
                      value={simRetentionBoost}
                      onChange={(e) => setSimRetentionBoost(Number(e.target.value))}
                      className="w-full accent-teal-500 cursor-pointer" 
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>90% (Piso)</span>
                      <span>99% (Excelencia)</span>
                    </div>
                    <div className="pt-2 border-t border-slate-700/60 text-[11px] text-slate-300 flex justify-between">
                      <span>Alumnos adicionales:</span>
                      <strong className="text-teal-400 font-mono">+${(simResults.retentionGain / 1000000).toFixed(2)}M MXN</strong>
                    </div>
                  </div>
                </div>

                {/* RESULTADO NETO PROYECTADO */}
                <div className="p-4 bg-indigo-950/80 rounded-2xl border border-indigo-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                      Ganancia Neta Anual Proyectada para el Holding:
                    </span>
                    <div className="text-3xl font-black text-white font-mono mt-0.5">
                      +${(simResults.totalProjectedNetGain / 1000000).toFixed(2)}M MXN
                    </div>
                    <span className="text-xs text-indigo-200 mt-1 block">
                      Aumento estimado de margen EBITDA: de 27.7% a <strong>{simResults.ebitdaMargin}%</strong>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      triggerToast(`✓ Acuerdo de simulación generado para Consejo: Proyección de +$${(simResults.totalProjectedNetGain / 1000000).toFixed(2)}M MXN guardada.`);
                    }}
                    className="px-5 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer shrink-0 active:scale-95"
                  >
                    Generar Acuerdo de Directorio
                  </button>
                </div>
              </div>

              {/* GRÁFICO DINÁMICO DE TRAYECTORIA Y RENDIMIENTO FINANCIERO TRIMESTRAL */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Trayectoria Holding 2026-2027</div>
                    <h3 className="text-base font-black text-slate-900">Evolución de Ingresos y Margen EBITDA por Trimestre</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600 inline-block" /> Facturación (MXN)</span>
                    <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Margen EBITDA (%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { q: 'Q1 (Ago - Oct)', rev: 34.2, ebitda: 9.4, margin: '27.5%', status: 'Cerrado Auditado', color: 'bg-indigo-50/80 border-indigo-200 text-indigo-900' },
                    { q: 'Q2 (Nov - Ene)', rev: 38.5, ebitda: 10.8, margin: '28.1%', status: 'Cerrado Auditado', color: 'bg-indigo-50/80 border-indigo-200 text-indigo-900' },
                    { q: 'Q3 (Feb - Abr)', rev: 36.1, ebitda: 10.0, margin: '27.8%', status: 'En Curso', color: 'bg-emerald-50/80 border-emerald-300 text-emerald-900 ring-2 ring-emerald-400/30' },
                    { q: 'Q4 (May - Jul)', rev: 39.7, ebitda: 11.0, margin: '28.6%', status: 'Proyección Simulador', color: 'bg-purple-50/80 border-purple-200 text-purple-900' },
                  ].map((item, i) => (
                    <div key={i} className={`p-4 rounded-2xl border ${item.color} space-y-2`}>
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span>{item.q}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/90 shadow-2xs font-semibold">{item.status}</span>
                      </div>
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Ingresos:</span>
                          <span className="font-mono font-bold">${item.rev}M MXN</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">EBITDA:</span>
                          <span className="font-mono font-bold text-emerald-600">${item.ebitda}M MXN</span>
                        </div>
                        <div className="flex justify-between text-xs pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-semibold">Margen Operativo:</span>
                          <span className="font-mono font-black text-indigo-700">{item.margin}</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-200/80 rounded-full overflow-hidden mt-2">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(item.rev / 40) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* OKRS CORPORATIVOS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900">Objetivos y Resultados Clave (OKRs) Ciclo 2026-2027</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Meta 1: Cobranza Consolidada &gt;95%</span>
                      <span className="font-mono text-indigo-600">{metrics.avgCollection}% / 95%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${metrics.avgCollection}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500 block">Q1: Cumplido • Q2: En curso</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Meta 2: Cobertura NEM SEP</span>
                      <span className="font-mono text-emerald-600">{metrics.avgCurriculum}% / 100%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${metrics.avgCurriculum}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500 block">Fases 1 a 5 auditadas al 100%</span>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>Meta 3: Expansión de Planteles</span>
                      <span className="font-mono text-amber-600">5 / 7 sedes</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '71%' }} />
                    </div>
                    <span className="text-[11px] text-slate-500 block">Aperturas proyectadas en Bajío</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 3: COLEGIOS (BENCHMARKING MULTISEDE)             */}
          {/* ======================================================= */}
          {activeTab === 'colegios' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                    Red Escolar Multisede
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Control Integral de Planteles & Benchmarking
                  </h2>
                  <p className="text-xs text-slate-500">Métricas comparativas de eficiencia, ocupación de cupos y directores de sede.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  <span>Descargar Matriz Multisede CSV</span>
                </button>
              </div>

              {/* GRID DE LAS 5 SEDES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[
                  { id: 'montes', name: 'Campus Montes (Sede Matriz & CCH)', loc: 'Jardines de Morelos, Ecatepec', dir: 'Lic. Roberto González', rvoe: '15PPR3322G / UNAM 7998', cap: 1800, stu: 1620, tea: 84, col: 95, cov: 96, ret: 97, status: 'Sede Matriz' },
                  { id: 'lagos', name: 'Campus Lagos (Fundador 2004)', loc: 'Jardines de Morelos Secc. Lagos', dir: 'Mtra. Patricia Salmerón', rvoe: '15PJN2222K / 15PPR3657T', cap: 800, stu: 710, tea: 38, col: 96, cov: 95, ret: 96, status: 'Líder en Cobranza' },
                  { id: 'sancristobal', name: 'Campus San Cristóbal', loc: 'Ecatepec Centro (Insurgentes)', dir: 'Dr. Andrés Morales', rvoe: '15PPR4012S / 15PES1240K', cap: 950, stu: 830, tea: 46, col: 93, cov: 94, ret: 95, status: 'Óptimo' },
                  { id: 'coacalco', name: 'Campus Coacalco (Metropolitano)', loc: 'Guadalupe Victoria, Ecatepec-Coacalco', dir: 'Dra. Carmen Del Valle', rvoe: '15PPR5110Z / 15PES1405M', cap: 700, stu: 580, tea: 32, col: 91, cov: 93, ret: 94, status: 'Seguimiento' }
                ].map((c) => {
                  const occRate = ((c.stu / c.cap) * 100).toFixed(1);
                  return (
                    <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                          <span className="text-xs text-slate-400">{c.loc} • RVOE: {c.rvoe}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.col >= 95 ? 'bg-emerald-100 text-emerald-800' : c.col >= 90 ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        Director de Plantel: <strong className="text-slate-800 font-semibold">{c.dir}</strong>
                      </div>

                      {/* Barra de Ocupación */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Ocupación de Aulas:</span>
                          <strong className="text-slate-800 font-mono">{c.stu} / {c.cap} ({occRate}%)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${occRate}%` }} />
                        </div>
                      </div>

                      {/* Métricas clave */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">COBRANZA</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{c.col}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">SEP NEM</span>
                          <span className="text-sm font-black text-indigo-600 font-mono">{c.cov}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">RETENCIÓN</span>
                          <span className="text-sm font-black text-emerald-600 font-mono">{c.ret}%</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setSelectedCampusId(c.id);
                          triggerToast(`Tablero enfocado en: ${c.name}`);
                          setActiveTab('inicio');
                        }}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                      >
                        Enfocar Consola en este Plantel
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 4: PERSONAS (TALENTO & EXPEDIENTE 360)           */}
          {/* ======================================================= */}
          {activeTab === 'personas' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                    Comunidad Escolar & Capital Humano
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Cuerpo Docente & Expediente 360 del Alumno
                  </h2>
                  <p className="text-xs text-slate-500">Gestión de talento, titularidades de aula y auditoría holística de estudiantes.</p>
                </div>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Search size={14} />
                  <span>Buscar Alumno en Expediente 360</span>
                </button>
              </div>

              {/* TARJETAS DE PERSONAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Total de Alumnos en Red</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{metrics.totalStudents.toLocaleString()}</div>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">100% con Expediente 360</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cuerpo Docente</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">{metrics.totalTeachers} maestros</div>
                  <span className="text-xs text-slate-500 mt-1 block">Ratio 1:13.9 alumno/docente</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Titularidades Cubiertas</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">98.5%</div>
                  <span className="text-xs text-slate-500 mt-1 block">Plan de contingencia activo</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Nómina Mensual Plantilla</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">$12,450,000 MXN</div>
                  <span className="text-xs text-slate-500 mt-1 block">100% dispersión puntual</span>
                </div>
              </div>

              {/* DISTRIBUCIÓN POR NIVEL ESCOLAR */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900">Distribución de Matrícula por Nivel Escolar</h3>
                <div className="space-y-3 text-xs">
                  {[
                    { level: 'Maternal y Guardería', count: 420, pct: 5.4, color: 'bg-teal-500' },
                    { level: 'Preescolar (Fase 2)', count: 1120, pct: 14.5, color: 'bg-emerald-500' },
                    { level: 'Primaria Inferior y Superior (Fases 3, 4 y 5)', count: 3450, pct: 44.6, color: 'bg-indigo-600' },
                    { level: 'Secundaria Oficial SEP (Fase 6)', count: 1890, pct: 24.5, color: 'bg-purple-600' },
                    { level: 'Bachillerato y Preparatoria', count: 846, pct: 11.0, color: 'bg-amber-500' }
                  ].map((lvl, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{lvl.level}</span>
                        <span className="font-mono text-slate-600">{lvl.count.toLocaleString()} alumnos ({lvl.pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${lvl.color} rounded-full`} style={{ width: `${lvl.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 5: ACADÉMICO (NEM 2024 & DIFERENCIADOR GAMIFICADO)*/}
          {/* ======================================================= */}
          {activeTab === 'academico' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded inline-block">
                    Diferenciador Pedagógico Exclusivo iSkool
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Auditoría Curricular NEM 2024 & Maestría Gamificada
                  </h2>
                  <p className="text-xs text-slate-500">Alineación a Fases SEP, planeaciones cronometradas de aula y métricas de XP estudiantil.</p>
                </div>
                <button
                  onClick={() => setIsBrainModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Network size={14} />
                  <span>Consultar Bóveda Curricular</span>
                </button>
              </div>

              {/* COBERTURA POR FASES NEM 2024 */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>Mapa de Cobertura Curricular SEP por Fases (NEM 2024)</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        Interactivo · Clic para auditar
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Haz clic en cualquier fase para auditar la fórmula de cálculo del porcentaje y consultar sus funciones pedagógicas.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                    Promedio Red: {metrics.avgCurriculum}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                  {[
                    { fase: 'Fase 1', name: 'Inicial', pct: 98, status: 'Excelente' },
                    { fase: 'Fase 2', name: 'Preescolar', pct: 96, status: 'Excelente' },
                    { fase: 'Fase 3', name: '1° y 2° Primaria', pct: 95, status: 'Óptimo' },
                    { fase: 'Fase 4', name: '3° y 4° Primaria', pct: 94, status: 'Óptimo' },
                    { fase: 'Fase 5', name: '5° y 6° Primaria', pct: 93, status: 'Óptimo' },
                    { fase: 'Fase 6', name: 'Secundaria', pct: 91, status: 'Alerta Preventiva' }
                  ].map((f, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedPhaseForAudit(f.fase)}
                      className="group p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 hover:border-indigo-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-center space-y-2 cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-black text-slate-900 block group-hover:text-indigo-600 transition-colors">
                          {f.fase}
                        </span>
                        <ChevronRight size={13} className="text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                      <span className="text-[11px] text-slate-500 block truncate font-medium">{f.name}</span>
                      <div className="text-xl font-black text-indigo-600 font-mono group-hover:scale-105 transition-transform">{f.pct}%</div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                        f.pct >= 95 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {f.status}
                      </span>
                      <span className="text-[9px] text-indigo-600 font-semibold block pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Auditar Desglose →
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* DIFERENCIADOR DE GAMIFICACIÓN ISKOOL */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg border border-purple-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/40 text-purple-300 flex items-center justify-center border border-purple-500/40">
                    <Gamepad2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Métricas de Gamificación & Engagement Estudiantil</h3>
                    <p className="text-xs text-purple-200">El factor que triplica la retención de alumnos y la satisfacción de padres de familia.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">XP Total Otorgado</span>
                    <div className="text-2xl font-black text-white font-mono mt-1">1,480,250 XP</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">Por logros pedagógicos</span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">Misiones Completadas</span>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">14,820</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">En aula y Lienzo Digital</span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">Alumnos Rango Élite</span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">18.4%</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">Nivel Leyenda / Maestro</span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">Lienzos Digitales</span>
                    <div className="text-2xl font-black text-cyan-400 font-mono mt-1">8,450</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">Actividades interactivas</span>
                  </div>
                </div>

                {/* DISTRIBUCIÓN DE RANGOS ESTUDIANTILES */}
                <div className="pt-3 border-t border-purple-800/40">
                  <div className="text-xs font-bold text-purple-200 mb-2">Escalafón de Maestría y Progresión por Rango:</div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-purple-300 block">Novato (0-500 XP)</span>
                      <span className="font-mono text-white font-black text-sm">6.6%</span>
                      <span className="text-[9px] text-slate-400 block">Inducción</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-blue-300 block">Aprendiz (501-2K)</span>
                      <span className="font-mono text-white font-black text-sm">19.8%</span>
                      <span className="text-[9px] text-slate-400 block">En desarrollo</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-teal-300 block">Maestro (2K-5K)</span>
                      <span className="font-mono text-white font-black text-sm">31.0%</span>
                      <span className="text-[9px] text-slate-400 block">Autonomía</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-amber-300 block">Élite (5K-10K)</span>
                      <span className="font-mono text-white font-black text-sm">24.2%</span>
                      <span className="text-[9px] text-slate-400 block">Alto impacto</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-emerald-300 block">Leyenda (&gt;10K)</span>
                      <span className="font-mono text-white font-black text-sm">18.4%</span>
                      <span className="text-[9px] text-slate-400 block">Excelencia</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOS 4 CAMPOS FORMATIVOS OFICIALES DE LA SEP NEM 2024: RADAR DIAMANTE & DIALES DE ARCO */}
              <div className="space-y-4">
                {/* HEADER DE CONTROL DEL MÓDULO */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                        Visualización C-Suite Multidimensional
                      </span>
                      <span className="text-xs text-slate-400 font-semibold">• SEP NEM 2024</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                      Cobertura y Equilibrio por los 4 Campos Formativos Oficiales
                    </h3>
                    <p className="text-xs text-slate-500">Supervisión en tiempo real de proyectos comunitarios, horas cronometradas de aula y avance por sede.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 pl-2">Sede:</span>
                      <select
                        value={curriculumRadarCampus}
                        onChange={(e) => {
                          setCurriculumRadarCampus(e.target.value);
                          triggerToast(`Radar Curricular: Mostrando datos de ${e.target.options[e.target.selectedIndex].text}`);
                        }}
                        className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 px-2.5 py-1 focus:outline-none cursor-pointer shadow-2xs"
                      >
                        <option value="consolidado">Consolidado Red (5 Sedes)</option>
                        <option value="montes">Campus Montes (Sede Matriz & CCH)</option>
                        <option value="lagos">Campus Lagos (Fundador 2004)</option>
                        <option value="sancristobal">Campus San Cristóbal</option>
                        <option value="coacalco">Campus Coacalco</option>
                      </select>
                    </div>

                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0">
                      480 Proyectos Auditados
                    </span>
                  </div>
                </div>

                {/* COMPUTO DINÁMICO DE RADAR METRICS SEGÚN SEDE */}
                {(() => {
                  const radarValues = {
                    consolidado: { lenguajes: 96.2, saberes: 94.8, etica: 93.5, humano: 95.1, target: 90, name: 'Consolidado Red IBIME' },
                    montes: { lenguajes: 97.5, saberes: 96.2, etica: 95.0, humano: 96.0, target: 90, name: 'Campus Montes' },
                    lagos: { lenguajes: 96.8, saberes: 95.5, etica: 94.2, humano: 95.5, target: 90, name: 'Campus Lagos' },
                    sancristobal: { lenguajes: 94.5, saberes: 93.8, etica: 92.5, humano: 94.0, target: 90, name: 'Campus San Cristóbal' },
                    coacalco: { lenguajes: 93.8, saberes: 92.6, etica: 91.5, humano: 93.2, target: 90, name: 'Campus Coacalco' },
                  }[curriculumRadarCampus] || { lenguajes: 96.2, saberes: 94.8, etica: 93.5, humano: 95.1, target: 90, name: 'Consolidado Red IBIME' };

                  // Geometría del Radar SVG (cx=160, cy=160, R=110)
                  const rcx = 160;
                  const rcy = 160;
                  const maxR = 110;

                  const pTopY = Math.round(rcy - (maxR * radarValues.lenguajes) / 100);
                  const pRightX = Math.round(rcx + (maxR * radarValues.saberes) / 100);
                  const pBottomY = Math.round(rcy + (maxR * radarValues.etica) / 100);
                  const pLeftX = Math.round(rcx - (maxR * radarValues.humano) / 100);
                  const radarPolyPoints = `${rcx},${pTopY} ${pRightX},${rcy} ${rcx},${pBottomY} ${pLeftX},${rcy}`;

                  const targetPolyPoints = `${rcx},${Math.round(rcy - (maxR * 0.9))} ${Math.round(rcx + (maxR * 0.9))},${rcy} ${rcx},${Math.round(rcy + (maxR * 0.9))} ${Math.round(rcx - (maxR * 0.9))},${rcy}`;

                  const avgBalance = ((radarValues.lenguajes + radarValues.saberes + radarValues.etica + radarValues.humano) / 4).toFixed(1);

                  return (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                      
                      {/* ========================================================= */}
                      {/* COLUMNA 1 (IZQUIERDA): LENGUAJES & ÉTICA                  */}
                      {/* ========================================================= */}
                      <div className="lg:col-span-4 space-y-5">
                        
                        {/* CARD 1: LENGUAJES (Emerald / Cyan) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Lenguajes</h4>
                              </div>
                              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                Emerald / Bilingüe
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                45 mins/aula
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">142 Proyectos</span>
                            </div>
                          </div>

                          {/* Semi-Circular Arc Gauge SVG */}
                          <div className="flex justify-center -my-2">
                            <svg width="190" height="105" viewBox="0 0 190 105" className="overflow-visible">
                              <defs>
                                <linearGradient id="gradLenguajes" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                              </defs>
                              {/* Background Arc */}
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="12"
                                strokeLinecap="round"
                              />
                              {/* Foreground Arc: circumference = PI * 75 ≈ 235.6 */}
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="url(#gradLenguajes)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray="235.6"
                                strokeDashoffset={235.6 * (1 - (radarValues.lenguajes / 100))}
                                className="transition-all duration-700 ease-out"
                              />
                              {/* Central Percentage */}
                              <text x="95" y="78" textAnchor="middle" className="text-2xl font-black font-mono fill-slate-900 tracking-tight">
                                {radarValues.lenguajes}%
                              </text>
                              <text x="95" y="96" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                                Meta (90%) vs. Actual
                              </text>
                            </svg>
                          </div>

                          {/* Subdisciplinas Breakdown */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Español & Literatura</span>
                              <span className="font-mono font-bold text-slate-800">97.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '97.4%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Inglés Bilingüe (Cambridge)</span>
                              <span className="font-mono font-bold text-slate-800">95.1%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '95.1%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Expresión Artística & Cultura</span>
                              <span className="font-mono font-bold text-slate-800">96.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: '96.2%' }} />
                            </div>
                          </div>

                          {/* Sparkline & Trend */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">Tendencia semanal:</span>
                              <svg width="70" height="20" viewBox="0 0 70 20" className="overflow-visible">
                                <path d="M 0,16 Q 15,14 25,10 T 50,6 T 70,2" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                              ✓ En Meta
                            </span>
                          </div>
                        </div>

                        {/* CARD 2: ÉTICA, NATURALEZA Y SOCIEDADES (Amethyst / Purple) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Ética y Sociedades</h4>
                              </div>
                              <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                Amethyst / Historia & Cívica
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                40 mins/aula
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">114 Proyectos</span>
                            </div>
                          </div>

                          {/* Semi-Circular Arc Gauge SVG */}
                          <div className="flex justify-center -my-2">
                            <svg width="190" height="105" viewBox="0 0 190 105" className="overflow-visible">
                              <defs>
                                <linearGradient id="gradEtica" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#a855f7" />
                                  <stop offset="100%" stopColor="#7c3aed" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="12"
                                strokeLinecap="round"
                              />
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="url(#gradEtica)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray="235.6"
                                strokeDashoffset={235.6 * (1 - (radarValues.etica / 100))}
                                className="transition-all duration-700 ease-out"
                              />
                              <text x="95" y="78" textAnchor="middle" className="text-2xl font-black font-mono fill-slate-900 tracking-tight">
                                {radarValues.etica}%
                              </text>
                              <text x="95" y="96" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                                Meta (90%) vs. Actual
                              </text>
                            </svg>
                          </div>

                          {/* Subdisciplinas Breakdown */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Conciencia Histórica de México</span>
                              <span className="font-mono font-bold text-slate-800">94.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: '94.2%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Sustentabilidad Ecológica</span>
                              <span className="font-mono font-bold text-slate-800">92.1%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92.1%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Ética & Responsabilidad Social</span>
                              <span className="font-mono font-bold text-slate-800">94.1%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: '94.1%' }} />
                            </div>
                          </div>

                          {/* Sparkline & Trend */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">Tendencia semanal:</span>
                              <svg width="70" height="20" viewBox="0 0 70 20" className="overflow-visible">
                                <path d="M 0,15 Q 20,12 35,14 T 55,8 T 70,4" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">
                              ✓ En Meta
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* ========================================================= */}
                      {/* COLUMNA 2 (CENTRO): RADAR DIAMANTE MULTIDIMENSIONAL       */}
                      {/* ========================================================= */}
                      <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
                        <div className="text-center space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Balance Curricular Holístico
                          </span>
                          <h4 className="text-base font-black text-slate-900 tracking-tight">
                            Radar de Cobertura Integral
                          </h4>
                          <p className="text-xs text-slate-400">
                            {radarValues.name} • Modelo Analítico SEP NEM 2024
                          </p>
                        </div>

                        {/* Contenedor del Radar SVG */}
                        <div className="flex justify-center items-center relative my-auto py-2">
                          <svg width="300" height="300" viewBox="0 0 320 320" className="overflow-visible">
                            <defs>
                              {/* Gradiente de relleno del radar */}
                              <linearGradient id="radarDiamondGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
                                <stop offset="35%" stopColor="#3b82f6" stopOpacity="0.4" />
                                <stop offset="70%" stopColor="#a855f7" stopOpacity="0.4" />
                                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.45" />
                              </linearGradient>
                            </defs>

                            {/* Anillos concéntricos de rejilla (25%, 50%, 75%, 100%) */}
                            {[100, 75, 50, 25].map((lvl) => {
                              const r = (maxR * lvl) / 100;
                              return (
                                <polygon
                                  key={lvl}
                                  points={`${rcx},${rcy - r} ${rcx + r},${rcy} ${rcx},${rcy + r} ${rcx - r},${rcy}`}
                                  fill="none"
                                  stroke="#e2e8f0"
                                  strokeWidth="1"
                                />
                              );
                            })}

                            {/* Ejes ortogonales */}
                            <line x1={rcx} y1={rcy - maxR} x2={rcx} y2={rcy + maxR} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />
                            <line x1={rcx - maxR} y1={rcy} x2={rcx + maxR} y2={rcy} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 2" />

                            {/* Polígono de Meta Corporativa (90%) */}
                            <polygon
                              points={targetPolyPoints}
                              fill="none"
                              stroke="rgba(99, 102, 241, 0.45)"
                              strokeWidth="1.5"
                              strokeDasharray="4 4"
                            />

                            {/* Polígono de Rendimiento Real con Gradiente */}
                            <polygon
                              points={radarPolyPoints}
                              fill="url(#radarDiamondGradient)"
                              stroke="#4f46e5"
                              strokeWidth="2.5"
                              className="transition-all duration-700 ease-out"
                            />

                            {/* Puntos / Vértices iluminados con halos */}
                            <circle cx={rcx} cy={pTopY} r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                            <circle cx={pRightX} cy={rcy} r="5" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                            <circle cx={rcx} cy={pBottomY} r="5" fill="#a855f7" stroke="#ffffff" strokeWidth="2" />
                            <circle cx={pLeftX} cy={rcy} r="5" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />

                            {/* Etiquetas perimetrales con porcentajes */}
                            <text x={rcx} y="22" textAnchor="middle" className="text-[11px] font-black fill-emerald-800">
                              LENGUAJES ({radarValues.lenguajes}%)
                            </text>
                            <text x="290" y="164" textAnchor="start" className="text-[10px] font-black fill-blue-800">
                              SABERES ({radarValues.saberes}%)
                            </text>
                            <text x={rcx} y="304" textAnchor="middle" className="text-[10px] font-black fill-purple-800">
                              ÉTICA ({radarValues.etica}%)
                            </text>
                            <text x="30" y="164" textAnchor="end" className="text-[10px] font-black fill-amber-800">
                              HUMANO ({radarValues.humano}%)
                            </text>
                          </svg>
                        </div>

                        {/* Badge de Diagnóstico Global */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800">
                            <span>Índice Medio de Cobertura:</span>
                            <span className="font-mono text-indigo-700 text-sm font-black">{avgBalance}%</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            Equilibrio curricular homogéneo sin concavidades de riesgo pedagógico.
                          </span>
                        </div>
                      </div>

                      {/* ========================================================= */}
                      {/* COLUMNA 3 (DERECHA): SABERES & DE LO HUMANO               */}
                      {/* ========================================================= */}
                      <div className="lg:col-span-4 space-y-5">
                        
                        {/* CARD 3: SABERES Y PENSAMIENTO CIENTÍFICO (Sapphire / Sky) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">Saberes y Ciencias</h4>
                              </div>
                              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                Sapphire / Matemáticas & STEAM
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                52 mins/aula
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">138 Proyectos</span>
                            </div>
                          </div>

                          {/* Semi-Circular Arc Gauge SVG */}
                          <div className="flex justify-center -my-2">
                            <svg width="190" height="105" viewBox="0 0 190 105" className="overflow-visible">
                              <defs>
                                <linearGradient id="gradSaberes" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#3b82f6" />
                                  <stop offset="100%" stopColor="#0ea5e9" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="12"
                                strokeLinecap="round"
                              />
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="url(#gradSaberes)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray="235.6"
                                strokeDashoffset={235.6 * (1 - (radarValues.saberes / 100))}
                                className="transition-all duration-700 ease-out"
                              />
                              <text x="95" y="78" textAnchor="middle" className="text-2xl font-black font-mono fill-slate-900 tracking-tight">
                                {radarValues.saberes}%
                              </text>
                              <text x="95" y="96" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                                Meta (85%) vs. Actual
                              </text>
                            </svg>
                          </div>

                          {/* Subdisciplinas Breakdown */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Pensamiento Lógico-Matemático</span>
                              <span className="font-mono font-bold text-slate-800">96.0%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '96.0%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Indagación Científica & Biología</span>
                              <span className="font-mono font-bold text-slate-800">93.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-500 rounded-full" style={{ width: '93.4%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Robótica, IA & Alfabetización Digital</span>
                              <span className="font-mono font-bold text-slate-800">95.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-600 rounded-full" style={{ width: '95.2%' }} />
                            </div>
                          </div>

                          {/* Sparkline & Trend */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">Tendencia semanal:</span>
                              <svg width="70" height="20" viewBox="0 0 70 20" className="overflow-visible">
                                <path d="M 0,16 Q 15,10 30,12 T 55,6 T 70,2" fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                              ✓ En Meta
                            </span>
                          </div>
                        </div>

                        {/* CARD 4: DE LO HUMANO Y LO COMUNITARIO (Amber / Orange) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">De lo Humano</h4>
                              </div>
                              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                Amber / Socioemocional & Deporte
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                44 mins/aula
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">126 Proyectos</span>
                            </div>
                          </div>

                          {/* Semi-Circular Arc Gauge SVG */}
                          <div className="flex justify-center -my-2">
                            <svg width="190" height="105" viewBox="0 0 190 105" className="overflow-visible">
                              <defs>
                                <linearGradient id="gradHumano" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#f59e0b" />
                                  <stop offset="100%" stopColor="#f97316" />
                                </linearGradient>
                              </defs>
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="#f1f5f9"
                                strokeWidth="12"
                                strokeLinecap="round"
                              />
                              <path
                                d="M 20,95 A 75,75 0 0,1 170,95"
                                fill="none"
                                stroke="url(#gradHumano)"
                                strokeWidth="12"
                                strokeLinecap="round"
                                strokeDasharray="235.6"
                                strokeDashoffset={235.6 * (1 - (radarValues.humano / 100))}
                                className="transition-all duration-700 ease-out"
                              />
                              <text x="95" y="78" textAnchor="middle" className="text-2xl font-black font-mono fill-slate-900 tracking-tight">
                                {radarValues.humano}%
                              </text>
                              <text x="95" y="96" textAnchor="middle" className="text-[10px] font-bold fill-slate-400">
                                Meta (88%) vs. Actual
                              </text>
                            </svg>
                          </div>

                          {/* Subdisciplinas Breakdown */}
                          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Autonomía & Salud Emocional</span>
                              <span className="font-mono font-bold text-slate-800">96.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '96.4%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Convivencia & Cultura de Paz</span>
                              <span className="font-mono font-bold text-slate-800">94.5%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: '94.5%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">Desarrollo Motriz & Educación Física</span>
                              <span className="font-mono font-bold text-slate-800">94.8%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-600 rounded-full" style={{ width: '94.8%' }} />
                            </div>
                          </div>

                          {/* Sparkline & Trend */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400">Tendencia semanal:</span>
                              <svg width="70" height="20" viewBox="0 0 70 20" className="overflow-visible">
                                <path d="M 0,14 Q 20,8 35,12 T 55,5 T 70,2" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                              </svg>
                            </div>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                              ✓ En Meta
                            </span>
                          </div>
                        </div>

                      </div>

                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 6: ADMISIONES (EMBUDO Y CONVERSIÓN)             */}
          {/* ======================================================= */}
          {activeTab === 'admisiones' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                      Crecimiento & Matrícula Nueva
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      Ciclo 2026-2027
                    </span>
                    <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      0 Tokens
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                    Embudo de Admisiones & Pipeline de Captación
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Monitoreo en tiempo real del ciclo de ventas escolares consolidado para {selectedCampusName}.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setIsAddProspectModalOpen(true)}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                  >
                    <UserPlus size={16} />
                    + Registrar Aspirante al Pipeline
                  </button>

                  <button
                    onClick={() => {
                      setProspectFilterStage('all');
                      setProspectFilterCampus(selectedCampusId);
                      setIsAdmissionsPipelineOpen(true);
                    }}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                  >
                    <ClipboardList size={16} />
                    Directorio del Pipeline ({prospectsList.length} Familias)
                  </button>

                  <button
                    onClick={() => {
                      if (onSwitchToOperational) {
                        onSwitchToOperational();
                      } else {
                        triggerToast("Redirigiendo a Vista Operativa de Control Escolar...");
                      }
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    title="Saltar a la gestión operativa de alumnos y grupos en Control Escolar"
                  >
                    <School size={16} className="text-indigo-600" />
                    Control Escolar Operativo
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* ARQUITECTURA DE DATOS: ¿QUIÉN ALIMENTA Y REPORTA CADA ETAPA? */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white border border-indigo-500/20 shadow-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Layers size={12} />
                      Flujo Operativo Institucional
                    </div>
                    <h3 className="text-base font-black text-white mt-1">
                      ¿Dónde se llena esta información y quién es responsable de reportarla?
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      El embudo no se captura manualmente de manera aislada: es el resultado sincronizado de 5 departamentos escolares:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-indigo-300 bg-indigo-900/60 border border-indigo-700/50 px-3 py-1.5 rounded-xl">
                      ⚡ Sincronización Automática
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* FASE 1 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-purple-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-purple-300 uppercase">Fase 1 · Lead</span>
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">Captación & CRM</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Registro del aspirante, canal de origen y datos de contacto del tutor.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-purple-500/20 space-y-1">
                      <div className="text-[10px] text-purple-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">Admisiones & Marketing</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-purple-950/60 p-1.5 rounded border border-purple-800/40">
                        Landing Web, Ferias o botón "+ Registrar Aspirante"
                      </div>
                    </div>
                  </div>

                  {/* FASE 2 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-indigo-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-300 uppercase">Fase 2 · Visita</span>
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">Tours de Campus</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Asistencia y recorrido presencial de aulas STEAM, laboratorios y canchas.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-indigo-500/20 space-y-1">
                      <div className="text-[10px] text-indigo-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">Dirección de Campus & RRPP</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-indigo-950/60 p-1.5 rounded border border-indigo-800/40">
                        Agenda de Visitas / Directorio de Pipeline
                      </div>
                    </div>
                  </div>

                  {/* FASE 3 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-blue-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-300 uppercase">Fase 3 · Evaluación</span>
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">Diagnóstico</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Evaluación cognitiva, socioemocional y entrevista familiar de admisión.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-blue-500/20 space-y-1">
                      <div className="text-[10px] text-blue-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">Gabinete Psicopedagógico</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-blue-950/60 p-1.5 rounded border border-blue-800/40">
                        Expediente Diagnóstico Psicopedagógico
                      </div>
                    </div>
                  </div>

                  {/* FASE 4 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-teal-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-teal-300 uppercase">Fase 4 · Reserva</span>
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">Carta de Asignación</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Reserva formal de cupo en grado y grupo escolar con vigencia estipulada.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-teal-500/20 space-y-1">
                      <div className="text-[10px] text-teal-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">Dirección Académica</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-teal-950/60 p-1.5 rounded border border-teal-800/40">
                        Comité Directivo de Asignación Escolar
                      </div>
                    </div>
                  </div>

                  {/* FASE 5 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-300 uppercase">Fase 5 · Matrícula</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">Inscripción Pagada</h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        Conciliación de pago, CFDI 4.0 IEDU SAT y alta en matrícula SEP.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                      <div className="text-[10px] text-emerald-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">Caja, Tesorería & Control Escolar</div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/40">
                        Módulo Cobranza SPEI + Padrón de Alumnos
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* EMBUDO GRÁFICO INTERACTIVO */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">Embudo Gráfico de Conversión (Funnel en Vivo)</h3>
                    <p className="text-xs text-slate-500">
                      Haz clic en cualquier fase para inspeccionar las familias aspirantes en esa etapa.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Sede filtrada:</span>
                    <span className="text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {selectedCampusName}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3.5 text-xs">
                  {activeFunnelData.map((s, idx) => (
                    <div 
                      key={idx} 
                      className={`p-4 rounded-xl border ${s.borderColor} ${s.bgColor} space-y-2 hover:border-slate-400 transition-all`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg ${s.color} text-white font-black text-xs flex items-center justify-center`}>
                            {idx + 1}
                          </span>
                          <div>
                            <span className="font-black text-slate-900 text-sm">{s.stage}</span>
                            <span className="text-[11px] text-slate-500 block">{s.note}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right font-mono">
                            <span className="text-base font-black text-slate-900">{s.count} familias</span>
                            <span className="text-xs text-slate-500 block">({s.pct}% conversión)</span>
                          </div>
                          <button
                            onClick={() => {
                              setProspectFilterStage(s.stageNum);
                              setProspectFilterCampus(selectedCampusId);
                              setIsAdmissionsPipelineOpen(true);
                            }}
                            className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors active:scale-95"
                          >
                            <Eye size={13} />
                            Ver ({s.count})
                          </button>
                        </div>
                      </div>

                      <div className="w-full h-3 bg-slate-200/80 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${s.color} rounded-full transition-all duration-500`} 
                          style={{ width: `${Math.max(4, s.pct)}%` }} 
                        />
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span className="font-semibold text-slate-700">
                          Responsable: <span className="font-bold text-slate-900">{s.dept}</span>
                        </span>
                        <span className="text-slate-500 font-mono">
                          📍 {s.systemLocation}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CANALES DE CAPTACIÓN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Recomendación Familiar</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">52%</div>
                  <span className="text-xs text-slate-500 mt-1 block">Boca a boca de padres actuales</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Canales Digitales & Web</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">34%</div>
                  <span className="text-xs text-slate-500 mt-1 block">Campañas de captación digital</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">Convenios Corporativos</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">14%</div>
                  <span className="text-xs text-slate-500 mt-1 block">Alianzas con empresas locales</span>
                </div>
              </div>

              {/* VELOCIDAD DE CONVERSIÓN & VALOR DEL PIPELINE */}
              <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl text-white border border-purple-500/30 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/50 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Eficiencia Comercial & Captación Escolar</span>
                    <h3 className="text-base font-black text-white mt-0.5">Velocidad del Pipeline: 9.5 Días Promedio de Conversión</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-purple-300 block">Valor Pipeline 2026-2027:</span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">$4,180,000 MXN</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">Contacto Inicial</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5">&lt; 24 hrs</span>
                    <span className="text-[10px] text-emerald-400 block">98% efectividad</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">Tour a Diagnóstico</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5">2.1 días</span>
                    <span className="text-[10px] text-slate-400 block">Psicopedagógico</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">Dictamen a Asignación</span>
                    <span className="text-lg font-black text-white font-mono mt-0.5">1.4 días</span>
                    <span className="text-[10px] text-indigo-300 block">Comité directivo</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">Cierre y Pago</span>
                    <span className="text-lg font-black text-emerald-400 font-mono mt-0.5">2.8 días</span>
                    <span className="text-[10px] text-slate-400 block">SPEI instantáneo</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-purple-200">El ciclo promedio del mercado mexicano es de 22 días. iSkool reduce los tiempos en más del <strong>56%</strong>.</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setProspectFilterStage('all');
                        setProspectFilterCampus(selectedCampusId);
                        setIsAdmissionsPipelineOpen(true);
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                    >
                      <ClipboardList size={14} />
                      Ver Directorio de Aspirantes
                    </button>
                    <button
                      onClick={() => setIsAddProspectModalOpen(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-200 hover:text-white font-bold rounded-xl border border-purple-400/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      + Registrar Aspirante
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 7: FINANZAS (CFDI 4.0 IEDU SAT & AGING BUCKETS)   */}
          {/* ======================================================= */}
          {activeTab === 'finanzas' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded inline-block">
                    Tesorería & Fiscal SAT
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Control de Cobranza & Facturación CFDI 4.0 con Complemento IEDU
                  </h2>
                  <p className="text-xs text-slate-500">Antigüedad de saldos, deducción de colegiaturas para padres y ledger fiscal inmutable.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  <span>Descargar Balance Financiero CSV</span>
                </button>
              </div>

              {/* RECAUDACIÓN CONSOLIDADA */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Facturación Mensual Total</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">$18,420,000 MXN</div>
                  <span className="text-xs text-slate-500 mt-1 block">5 Sedes consolidadas</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cobranza Efectiva Recuperada</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">$16,946,400 MXN</div>
                  <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-1 inline-block">
                    {metrics.avgCollection}% de efectividad
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Cartera Vencida en Gestión</span>
                  <div className="text-2xl font-black text-rose-600 mt-1 font-mono">$1,473,600 MXN</div>
                  <span className="text-xs text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold mt-1 inline-block">
                    8% en proceso de cobro
                  </span>
                </div>
              </div>

              {/* ANTIGÜEDAD DE SALDOS (AGING BUCKETS) */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900">Antigüedad de Saldos de Colegiaturas (Aging Buckets)</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                    <span className="font-bold text-emerald-800 block">Al Corriente (0 días)</span>
                    <div className="text-xl font-black text-emerald-900 font-mono mt-1">$16.94M MXN</div>
                    <span className="text-[11px] text-emerald-700 mt-1 block">92.0% del total</span>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-800 block">1 a 30 Días de Mora</span>
                    <div className="text-xl font-black text-amber-900 font-mono mt-1">$957,000 MXN</div>
                    <span className="text-[11px] text-amber-700 mt-1 block">5.2% del total</span>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                    <span className="font-bold text-orange-800 block">31 a 60 Días de Mora</span>
                    <div className="text-xl font-black text-orange-900 font-mono mt-1">$386,000 MXN</div>
                    <span className="text-[11px] text-orange-700 mt-1 block">2.1% del total</span>
                  </div>
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-200">
                    <span className="font-bold text-rose-800 block">Más de 60 Días</span>
                    <div className="text-xl font-black text-rose-900 font-mono mt-1">$130,600 MXN</div>
                    <span className="text-[11px] text-rose-700 mt-1 block">0.7% del total</span>
                  </div>
                </div>
              </div>

              {/* DIFERENCIADOR FISCAL SAT IEDU */}
              <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">Diferenciador Fiscal: CFDI 4.0 con Complemento IEDU SAT</h3>
                    <p className="text-xs text-slate-300">Timbrado automatizado con deducción personal de colegiaturas para padres de familia según decreto oficial.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Preescolar</span>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">$14,200 / año</div>
                    <span className="text-[10px] text-slate-400 block">Límite deducible SAT</span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Primaria</span>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">$12,900 / año</div>
                    <span className="text-[10px] text-slate-400 block">Límite deducible SAT</span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Secundaria</span>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">$19,900 / año</div>
                    <span className="text-[10px] text-slate-400 block">Límite deducible SAT</span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Bachillerato</span>
                    <div className="text-base font-black text-amber-400 font-mono mt-0.5">$24,500 / año</div>
                    <span className="text-[10px] text-slate-400 block">Límite deducible SAT</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-300">
                    Ahorro estimado en ISR para las familias de nuestra red: <strong className="text-amber-400 font-mono">+$8,420,000 MXN anuales</strong> deducibles.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerToast("✓ Conciliación bancaria ejecutada: 142 folios cotejados con ledger SAT a 0 tokens.")}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold transition-all cursor-pointer active:scale-95"
                    >
                      Conciliar Depósitos Bancarios
                    </button>
                    <button
                      onClick={() => triggerToast("✓ Recordatorios preventivos emitidos a 48 tutores con saldo próximo a vencer.")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all cursor-pointer active:scale-95"
                    >
                      Emitir Recordatorios SPEI
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 8: OPERACIÓN & TRAZABILIDAD MULTIRROL EN VIVO     */}
          {/* ======================================================= */}
          {activeTab === 'operacion' && (
            <OperationalEcosystemControl
              holdingName={holding.name}
              campusCount={metrics.totalCampuses}
              totalStudents={metrics.totalStudents}
              totalTeachers={metrics.totalTeachers}
              collectionRate={metrics.avgCollection}
              curriculumCoverage={metrics.avgCurriculum}
              onTriggerToast={triggerToast}
              onNavigateTab={handleNavClick}
            />
          )}

          {/* ======================================================= */}
          {/* MÓDULO 9: REPORTES BI (MOTOR DETERMINISTA 0 TOKENS)     */}
          {/* ======================================================= */}
          {activeTab === 'reportes' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                    Business Intelligence Educativo (0 Tokens)
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Consola Analítica & Dataframes en Tiempo Real
                  </h2>
                  <p className="text-xs text-slate-500">Cálculo determinista en memoria con latencia &lt;1ms y exportación a CSV.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  <span>Exportar Reporte Activo CSV</span>
                </button>
              </div>

              {/* PRESETS DE REPORTES */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                {[
                  'Balance Financiero y Cobranza Consolidada',
                  'Alumnos en Riesgo de Deserción y Asistencias',
                  'Auditoría Curricular y Docentes Titulares',
                  'Directorio de Bajas y Desincorporaciones'
                ].map((q, i) => (
                  <button
                    key={i}
                    onClick={() => runInstantReport(q)}
                    className={`px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 text-xs active:scale-98 ${
                      activeReportQuery === q 
                        ? 'bg-slate-900 text-white shadow-sm' 
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* RESULTADOS DEL REPORTE */}
              {reportResult && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-base font-black text-slate-900">{reportResult.reportTitle}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{reportResult.explanation?.summary}</p>
                    </div>
                    <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 font-bold">
                      Calculado en {reportLatencyMs} ms • 0 Tokens
                    </span>
                  </div>

                  {reportResult.kpis && reportResult.kpis.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {reportResult.kpis.map(k => (
                        <div key={k.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-400 uppercase font-bold block">{k.label}</span>
                          <span className="text-base font-black text-slate-900 mt-1 block font-mono">{k.value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {reportResult.table?.rows && reportResult.table.rows.length > 0 && (
                    <div className="overflow-x-auto border border-slate-200 rounded-xl">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                          <tr>
                            {reportResult.table.columns?.slice(0, 5).map((col: any) => (
                              <th key={col.key} className="p-3">{col.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-mono text-xs">
                          {reportResult.table.rows.slice(0, 8).map((row: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              {reportResult.table.columns?.slice(0, 5).map((col: any) => (
                                <td key={col.key} className="p-3 text-slate-800">
                                  {String(row[col.key] ?? '')}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 10: CEREBRO (BÓVEDA CENTRAL & SEGUNDO CEREBRO)    */}
          {/* ======================================================= */}
          {activeTab === 'cerebro' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <InstitutionalBrainStudio
                isOpen={true}
                onClose={() => {}}
                holdingName={holding.name}
                schoolId={schoolId || activeSchoolId || currentInstitution?.id}
                initialQuery={ragQuery}
                onNavigateTab={handleNavClick}
                isEmbeddedView={true}
              />
            </div>
          )}

        </main>
      </div>

      {/* ========================================================= */}
      {/* 3. MODALES Y DRAWERS INTERACTIVOS DE ALTA VELOCIDAD       */}
      {/* ========================================================= */}
      
      {/* DRAWER LATERAL DE KPI */}
      {activeKPIDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={() => setActiveKPIDrawer(null)}
          />
          <div className="fixed inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-150">
            <div>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    Auditoría Ejecutiva (0 Tokens)
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">{activeKPIDrawer.title}</h3>
                  <p className="text-xs text-slate-500">{activeKPIDrawer.description}</p>
                </div>
                <button 
                  onClick={() => setActiveKPIDrawer(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">{activeKPIDrawer.unit}</div>
                  <div className="text-2xl font-black text-slate-900">{activeKPIDrawer.targetValue}</div>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer active:scale-95"
                >
                  <Download size={13} />
                  <span>Exportar CSV</span>
                </button>
              </div>

              <div className="p-6 space-y-3 overflow-y-auto max-h-[calc(100vh-280px)]">
                {holding.campuses.map(campus => {
                  let valueDisplay = '';
                  if (activeKPIDrawer.metricKey === 'students') valueDisplay = `${campus.students.toLocaleString()} alumnos`;
                  else if (activeKPIDrawer.metricKey === 'teachers') valueDisplay = `${campus.teachers} docentes`;
                  else if (activeKPIDrawer.metricKey === 'campuses') valueDisplay = `${campus.location} • Activo`;
                  else if (activeKPIDrawer.metricKey === 'admissions') valueDisplay = `${campus.admissionsInProgress} en proceso`;
                  else if (activeKPIDrawer.metricKey === 'collection') valueDisplay = `${campus.collectionRate}% recaudado`;

                  return (
                    <div 
                      key={campus.id} 
                      onClick={() => {
                        setSelectedCampusId(campus.id);
                        setActiveKPIDrawer(null);
                        triggerToast(`Filtrado a ${campus.name}`);
                      }}
                      className="p-3.5 bg-white rounded-xl border border-slate-200/80 flex items-center justify-between hover:border-indigo-300 hover:bg-indigo-50/20 cursor-pointer transition-colors"
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-800">{campus.name}</div>
                        <div className="text-[11px] text-slate-400">{campus.location}</div>
                      </div>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        {valueDisplay}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setActiveKPIDrawer(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Desglose
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL FOCO DE ATENCIÓN */}
      {activeFocalModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                <ShieldAlert size={20} />
                <span>Intervención Directiva Inmediata</span>
              </div>
              <button onClick={() => setActiveFocalModal(null)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <h3 className="text-lg font-bold text-slate-900">{activeFocalModal.title}</h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{activeFocalModal.description}</p>

            <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-2">Sedes involucradas:</span>
              <div className="flex flex-wrap gap-1.5">
                {activeFocalModal.campusAffected.map((c, i) => (
                  <span key={i} className="text-xs font-semibold bg-white border border-slate-200 px-2.5 py-1 rounded-md text-slate-700">
                    📍 {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  triggerToast(`Instrucción despachada a los Directores de ${activeFocalModal.campusAffected.join(', ')}`);
                  setActiveFocalModal(null);
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Send size={15} />
                <span>Instruir a Directores de Sede</span>
              </button>
              
              <button
                onClick={() => {
                  triggerToast(`Campaña automatizada 1-Clic activada para ${activeFocalModal.campusAffected.join(', ')}`);
                  setActiveFocalModal(null);
                }}
                className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Zap size={14} />
                <span>Activar Campaña 1-Clic</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MATRIZ COMPLETA DE FOCOS */}
      {isAllFocalsOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert size={20} className="text-rose-600" />
                <h3 className="text-lg font-black text-slate-900">Matriz Integral de Focos de Atención</h3>
                <span className="text-xs bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">4 Activos</span>
              </div>
              <button onClick={() => setIsAllFocalsOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Desviación en Meta de Cobranza', sedes: ['Campus Coacalco (91%)', 'Campus San Cristóbal (93%)'], desc: 'Cobranza en seguimiento respecto al umbral institucional de 95%. Se sugiere activar conciliación SPEI y recordatorio preventivo.', type: 'cobranza' as const },
                { title: 'Campaña de Reinscripciones', sedes: ['Campus San Cristóbal', 'Campus Coacalco'], desc: 'Lanzamiento de campaña formal de reserva de plaza para el ciclo 2026-2027.', type: 'reinscripcion' as const },
                { title: 'Auditoría Curricular NEM 2024 / CCH', sedes: ['Campus San Cristóbal', 'Campus Coacalco'], desc: 'Dispersión detectada en evaluaciones formativas de Fase 6 en Secundaria.', type: 'academico' as const },
                { title: 'Rotación Docente Preventiva', sedes: ['Campus Coacalco (1)', 'Campus San Cristóbal (1)'], desc: 'Bajas docentes registradas por reemplazo. Cartera de reemplazo activa en Bóveda Curricular.', type: 'docentes' as const },
              ].map((f, i) => (
                <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-800 text-sm">{f.title}</span>
                    <button 
                      onClick={() => {
                        setIsAllFocalsOpen(false);
                        setActiveFocalModal({
                          isOpen: true,
                          title: f.title,
                          description: f.desc,
                          campusAffected: f.sedes,
                          actionType: f.type
                        });
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer active:scale-95"
                    >
                      Intervenir
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">{f.desc}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {f.sedes.map((s, idx) => (
                      <span key={idx} className="text-[11px] bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-medium">
                        📍 {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={() => setIsAllFocalsOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
                Cerrar Matriz
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIGURACIÓN DE UMBRALES */}
      {isThresholdModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-100">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sliders size={18} className="text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Umbrales de Eficiencia Corporativa</h3>
              </div>
              <button onClick={() => setIsThresholdModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Meta de Cobranza Mensual</span>
                  <span className="font-mono text-indigo-600">{collectionThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min={70} 
                  max={100} 
                  value={collectionThreshold} 
                  onChange={(e) => setCollectionThreshold(Number(e.target.value))}
                  className="w-full cursor-pointer accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Meta de Cobertura Curricular SEP NEM</span>
                  <span className="font-mono text-emerald-600">{curriculumThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min={70} 
                  max={100} 
                  value={curriculumThreshold} 
                  onChange={(e) => setCurriculumThreshold(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-slate-700 mb-1">
                  <span>Meta de Retención Escolar Anual</span>
                  <span className="font-mono text-teal-600">{retentionThreshold}%</span>
                </div>
                <input 
                  type="range" 
                  min={80} 
                  max={100} 
                  value={retentionThreshold} 
                  onChange={(e) => setRetentionThreshold(Number(e.target.value))}
                  className="w-full cursor-pointer accent-teal-600"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button 
                onClick={() => {
                  triggerToast(`✓ Umbrales actualizados: Cobranza ${collectionThreshold}%, Cobertura ${curriculumThreshold}%, Retención ${retentionThreshold}%`);
                  setIsThresholdModalOpen(false);
                }}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Guardar Umbrales
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ESTUDIO DEL SEGUNDO CEREBRO INSTITUCIONAL (GRAFO NEURONAL + TERMINAL IA PEDAGÓGICA) */}
      {isBrainModalOpen && (
        <InstitutionalBrainStudio
          isOpen={isBrainModalOpen}
          onClose={() => setIsBrainModalOpen(false)}
          holdingName={holding.name}
          schoolId={schoolId || activeSchoolId || currentInstitution?.id}
          initialQuery={ragQuery}
          onNavigateTab={handleNavClick}
        />
      )}

      {/* MODAL EJECUTIVO DE AUDITORÍA CURRICULAR POR FASE NEM 2024 */}
      {selectedPhaseForAudit && (
        <PhaseCurricularAuditModal
          isOpen={Boolean(selectedPhaseForAudit)}
          onClose={() => setSelectedPhaseForAudit(null)}
          selectedFaseKey={selectedPhaseForAudit}
          onSelectFase={(faseKey) => setSelectedPhaseForAudit(faseKey)}
          holdingName={holding.name}
          schoolId={schoolId || activeSchoolId || currentInstitution?.id}
          onOpenVault={(faseQuery) => {
            setSelectedPhaseForAudit(null);
            if (faseQuery) setRagQuery(faseQuery);
            setIsBrainModalOpen(true);
          }}
          onTriggerToast={triggerToast}
        />
      )}

      {/* MODAL DETALLE DE AUDITORÍA DE ACTIVIDAD */}
      {selectedAuditLog && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-100">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                <FileCheck2 size={16} />
                <span>Expediente de Auditoría</span>
              </div>
              <button onClick={() => setSelectedAuditLog(null)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X size={18} />
              </button>
            </div>
            
            <h3 className="text-base font-bold text-slate-900">{selectedAuditLog.title}</h3>
            <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-semibold inline-block mt-1">
              📍 {selectedAuditLog.campus}
            </span>

            <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedAuditLog.details}
            </p>

            <div className="mt-4 text-[11px] text-slate-400 space-y-1 font-mono">
              <div>Operador responsable: <strong className="text-slate-700 font-sans">{selectedAuditLog.user}</strong></div>
              <div>Estampa temporal: <strong className="text-slate-700">{selectedAuditLog.time}</strong></div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar Expediente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BITÁCORA INMUTABLE COMPLETA */}
      {isAllActivityOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-100 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck2 size={20} className="text-indigo-600" />
                <h3 className="text-lg font-black text-slate-900">Bitácora Inmutable de Auditoría</h3>
              </div>
              <button onClick={() => setIsAllActivityOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              {[
                { title: 'Auditoría Curricular Bimestral Completada', campus: 'Campus Montes', time: 'Hoy 11:30 hrs', cat: 'Académico', user: 'Coordinación Secundaria CCH' },
                { title: 'Prospecto Nuevo Registrado en CRM', campus: 'Campus San Cristóbal', time: 'Hoy 09:15 hrs', cat: 'Admisiones', user: 'Admisiones San Cristóbal' },
                { title: 'Reglamento de Convivencia Actualizado SEP 2026', campus: 'Normativa General IBIME', time: 'Ayer 18:00 hrs', cat: 'Operativo', user: 'Dirección Jurídica' },
                { title: 'Conciliación Bancaria y Timbrado CFDI 4.0 (142 Folios)', campus: 'Tesorería Central IBIME', time: 'Ayer 16:20 hrs', cat: 'Financiero', user: 'Tesorería Central' },
                { title: 'Simulacro de Evacuación y Pase de Lista Digital', campus: 'Campus Lagos', time: 'Hace 2 días', cat: 'Operativo', user: 'Protección Civil Ecatepec' },
                { title: 'Campaña de Reinscripciones Despachada (640 tutores)', campus: 'Campus Coacalco', time: 'Hace 3 días', cat: 'Admisiones', user: 'Dirección de Admisiones' }
              ].map((log, i) => (
                <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800">{log.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{log.campus} • {log.user}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-semibold block">{log.cat}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{log.time}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-between items-center pt-3 border-t border-slate-100">
              <button 
                onClick={handleExportCSV}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Exportar Bitácora CSV</span>
              </button>
              <button onClick={() => setIsAllActivityOpen(false)} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer">
                Cerrar Bitácora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEARCH CMD+K */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex items-start justify-center pt-24 p-4 z-50">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in duration-100">
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <Search size={18} className="text-slate-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Escribe el nombre de un alumno, maestro, sede o proceso..."
                className="flex-1 bg-transparent border-none text-sm text-slate-900 focus:outline-none placeholder-slate-400"
              />
              <button onClick={() => setIsSearchOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto p-2">
              {searchResult.length > 0 ? (
                searchResult.map((res, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      setIsSearchOpen(false);
                      triggerToast(`Navegando a: ${res.title}`);
                    }}
                    className="p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between cursor-pointer group transition-colors"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </div>
                      <div className="text-[10px] text-slate-400">{res.category}</div>
                    </div>
                    <ChevronRight size={14} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                  </div>
                ))
              ) : searchQuery.trim() ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  No se encontraron coincidencias para "{searchQuery}".
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Busca entre más de 6,800 alumnos, 480 docentes, 5 planteles y protocolos institucionales.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Navega con <kbd className="bg-white border px-1 rounded">↑</kbd> <kbd className="bg-white border px-1 rounded">↓</kbd> y selecciona con <kbd className="bg-white border px-1 rounded">Enter</kbd></span>
              <span className="font-mono text-emerald-600 font-semibold">0 Tokens</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 1: DIRECTORIO DEL PIPELINE DE ADMISIONES          */}
      {/* ======================================================= */}
      {isAdmissionsPipelineOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    Directorio de Aspirantes en Pipeline
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal">
                      Ciclo 2026-2027
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Seguimiento detallado de familias aspirantes, etapas de conversión y avance de estatus.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddProspectModalOpen(true)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <UserPlus size={14} />
                  + Registrar Aspirante
                </button>
                <button
                  onClick={() => setIsAdmissionsPipelineOpen(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Filtros y Búsqueda */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="relative flex-1 max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={prospectSearchTerm}
                  onChange={(e) => setProspectSearchTerm(e.target.value)}
                  placeholder="Buscar aspirante, tutor o teléfono..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 text-[11px]">Sede:</span>
                <select
                  value={prospectFilterCampus}
                  onChange={(e) => setProspectFilterCampus(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todas las Sedes</option>
                  {holding.campuses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <span className="font-bold text-slate-500 text-[11px] ml-1">Etapa:</span>
                <select
                  value={prospectFilterStage}
                  onChange={(e) => setProspectFilterStage(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todas las Etapas</option>
                  <option value="1">1. Prospecto en CRM</option>
                  <option value="2">2. Tour y Visita</option>
                  <option value="3">3. Examen Diagnóstico</option>
                  <option value="4">4. Carta de Asignación</option>
                  <option value="5">5. Inscripción Pagada</option>
                </select>
              </div>
            </div>

            {/* Listado de Familias */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {prospectsList
                .filter(p => {
                  const matchSearch = prospectSearchTerm === '' ||
                    p.studentName.toLowerCase().includes(prospectSearchTerm.toLowerCase()) ||
                    p.tutorName.toLowerCase().includes(prospectSearchTerm.toLowerCase()) ||
                    p.phone.includes(prospectSearchTerm);
                  const matchCampus = prospectFilterCampus === 'all' || p.campusId === prospectFilterCampus;
                  const matchStage = prospectFilterStage === 'all' || p.stage === prospectFilterStage;
                  return matchSearch && matchCampus && matchStage;
                })
                .map((prospect) => {
                  const stageStyles = {
                    1: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-600', nextText: 'Agendar Tour de Campus →' },
                    2: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600', nextText: 'Asignar Examen Diagnóstico →' },
                    3: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600', nextText: 'Emitir Carta de Asignación →' },
                    4: { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-600', nextText: 'Confirmar Pago e Inscripción →' },
                    5: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600', nextText: '✓ Matrícula Confirmada' },
                  }[prospect.stage];

                  return (
                    <div
                      key={prospect.id}
                      className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">{prospect.studentName}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {prospect.grade}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1.5 ${stageStyles.bg}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${stageStyles.dot}`} />
                            {prospect.stageName}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Building2 size={13} className="text-slate-400" />
                            {prospect.campusName}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={13} className="text-slate-400" />
                            Tutor: <strong className="text-slate-700">{prospect.tutorName}</strong>
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone size={13} className="text-slate-400" />
                            {prospect.phone}
                          </span>
                          <span className="text-[11px] text-purple-700 font-semibold">
                            Origen: {prospect.channel}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-xl border border-slate-200/60 mt-1">
                          💬 {prospect.notes}
                        </div>
                      </div>

                      {/* Progreso del Pipeline y Botón de Acción */}
                      <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                        {/* 5 Dots de Etapa */}
                        <div className="flex items-center gap-1" title={`Etapa ${prospect.stage} de 5`}>
                          {[1, 2, 3, 4, 5].map(step => (
                            <span
                              key={step}
                              className={`w-3 h-3 rounded-full transition-all ${
                                step <= prospect.stage 
                                  ? 'bg-purple-600 scale-100' 
                                  : 'bg-slate-200 scale-90'
                              }`}
                            />
                          ))}
                        </div>

                        {prospect.stage < 5 ? (
                          <button
                            onClick={() => handleAdvanceProspectStage(prospect.id)}
                            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 whitespace-nowrap"
                          >
                            {stageStyles.nextText}
                          </button>
                        ) : (
                          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 size={14} />
                            Inscrito (Expediente 360)
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
              <span>
                Mostrando aspirantes en seguimiento escolar activo • Todas las transiciones operan a <strong>0 Tokens</strong>.
              </span>
              <button
                onClick={() => setIsAdmissionsPipelineOpen(false)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl cursor-pointer"
              >
                Cerrar Directorio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: + REGISTRAR ASPIRANTE AL PIPELINE              */}
      {/* ======================================================= */}
      {isAddProspectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white">
                  <UserPlus size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Registrar Aspirante al Pipeline de Admisiones</h3>
                  <p className="text-xs text-slate-400">Alta directa en CRM y embudo de captación escolar.</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddProspectModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateProspect} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Aspirante *</label>
                  <input
                    type="text"
                    required
                    value={newProspectForm.studentName}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, studentName: e.target.value })}
                    placeholder="ej. Santiago Morales Reyes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Grado / Nivel Solicitado *</label>
                  <select
                    value={newProspectForm.grade}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="Kínder 1">Kínder 1</option>
                    <option value="Kínder 2">Kínder 2</option>
                    <option value="Kínder 3">Kínder 3</option>
                    <option value="Primaria 1°">Primaria 1°</option>
                    <option value="Primaria 2°">Primaria 2°</option>
                    <option value="Primaria 3°">Primaria 3°</option>
                    <option value="Primaria 4°">Primaria 4°</option>
                    <option value="Primaria 5°">Primaria 5°</option>
                    <option value="Primaria 6°">Primaria 6°</option>
                    <option value="Secundaria 1°">Secundaria 1°</option>
                    <option value="Secundaria 2°">Secundaria 2°</option>
                    <option value="Secundaria 3°">Secundaria 3°</option>
                    <option value="Preparatoria 1°">Preparatoria 1°</option>
                    <option value="Preparatoria 2°">Preparatoria 2°</option>
                    <option value="Preparatoria 3°">Preparatoria 3°</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plantel / Campus Escolar *</label>
                  <select
                    value={newProspectForm.campusId}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, campusId: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    {holding.campuses.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Padre, Madre o Tutor *</label>
                  <input
                    type="text"
                    required
                    value={newProspectForm.tutorName}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, tutorName: e.target.value })}
                    placeholder="ej. Ing. Carlos Morales"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono de Contacto / WhatsApp</label>
                  <input
                    type="tel"
                    value={newProspectForm.phone}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, phone: e.target.value })}
                    placeholder="ej. 55 4192 8841"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Canal de Captación</label>
                  <select
                    value={newProspectForm.channel}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, channel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    <option value="Recomendación Familiar">Recomendación Familiar (Boca a boca)</option>
                    <option value="Canales Digitales & Web">Canales Digitales & Web / Redes</option>
                    <option value="Convenios Corporativos">Convenios Corporativos / Empresas</option>
                    <option value="Feria Escolar">Feria Escolar / Expos Educativas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Etapa Inicial del Aspirante</label>
                <select
                  value={newProspectForm.initialStage}
                  onChange={(e) => setNewProspectForm({ ...newProspectForm, initialStage: Number(e.target.value) as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                >
                  <option value="1">1. Prospecto Registrado en CRM (Primer contacto)</option>
                  <option value="2">2. Tour y Visita de Campus Agendada</option>
                  <option value="3">3. Examen Diagnóstico Psicopedagógico</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas u Observaciones del Caso</label>
                <textarea
                  rows={2}
                  value={newProspectForm.notes}
                  onChange={(e) => setNewProspectForm({ ...newProspectForm, notes: e.target.value })}
                  placeholder="ej. Familia interesada en programa de robótica y bilingüe. Tienen un hermano en 4° de primaria."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddProspectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl shadow-xs cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <UserPlus size={15} />
                  Guardar Aspirante en Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. BARRA DE NAVEGACIÓN INFERIOR PARA MÓVIL (APP NATIVA)   */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
        {[
          { id: 'inicio', label: 'Inicio', icon: Building2 },
          { id: 'vision', label: 'Visión', icon: TrendingUp },
          { id: 'academico', label: 'NEM', icon: GraduationCap },
          { id: 'admisiones', label: 'Admisiones', icon: UserCheck },
          { id: 'finanzas', label: 'Finanzas', icon: DollarSign },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleNavClick(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
                isActive 
                  ? 'text-indigo-600 font-black' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-indigo-600 scale-110' : 'text-slate-500'} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
        {/* Botón Más / Menú Completo */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer active:scale-95 ${
            isMobileMenuOpen ? 'text-indigo-600 font-black' : 'text-slate-500 hover:text-slate-800'
          }`}
          aria-label="Abrir menú completo"
        >
          <Menu size={18} className="text-slate-500" />
          <span className="text-[10px] mt-0.5 tracking-tight">Más</span>
        </button>
      </nav>

    </div>
  );
}
