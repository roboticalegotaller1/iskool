"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  Menu,
  Mail
} from 'lucide-react';
import { CampusData, OrganizationHolding, DetailedStudent, Campus, FamilyBillingRecord, Institution, isCorporateInstitution } from '@/types';
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
import { IbimeOfficialLogo } from '@/components/brand/IbimeOfficialLogo';
import { CorporateOfficialLogo } from '@/components/brand/CorporateOfficialLogo';
import { SchoolOfficialLogo } from '@/components/brand/SchoolOfficialLogo';
import ExecutiveAnalyticsStudio from './ExecutiveAnalyticsStudio';
import ExecutiveBiCommandCenter from './ExecutiveBiCommandCenter';
import { AcademicPortalAdminModal } from './AcademicPortalAdminModal';
import { CEOEmailCommunicationsModal } from './CEOEmailCommunicationsModal';
import { useAdmissionsPipeline } from '@/hooks/useAdmissionsPipeline';
import BentoAdmissionsKanban from './BentoAdmissionsKanban';
import { useCrmStore } from '@/store/useCrmStore';
import { normalizeCampusKey } from '@/services/admissionsPipelineService';
import type { CrmStageKey } from '@/types/crm';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CrmAdmissionsStudio = dynamic(
  () => import('@/components/crm/CrmAdmissionsStudio'),
  { ssr: false, loading: () => (
    <div className="p-12 text-center text-slate-400 animate-pulse bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shadow-purple-500/20">
        📋
      </div>
      <p className="text-base font-black text-slate-800">Cargando CRM Escolar Unificado 360°…</p>
      <p className="text-xs text-slate-400">Sincronizando pipeline de admisiones y corresponsabilidad departamental...</p>
    </div>
  )}
);

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
 * Generador dinámico de Holding para cualquier institución o empresa dentro de ISkool.
 * Permite que cada organización (IBIME, Rosseau, Sandbox, Montessori o empresas B2B)
 * cuente con su propia suite ejecutiva completa (Visión CEO, Empresas & Plantas, Competencias, Finanzas, Bóveda, Operación).
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

  const isCorp = isCorporateInstitution(institution) ||
                 institution.id?.startsWith('emp-') ||
                 institution.id === 'sec-empresas-ceo' ||
                 (typeof institution.name === 'string' && /bmw|empresa|corporativ|retail|innovasoft/i.test(institution.name));

  const allCampuses = campusesList || [];
  const schoolCampuses = getSchoolCampuses(allCampuses, institution.id);
  const schoolStudents = getSchoolStudents(detailedStudents || [], institution.id, schoolCampuses);
  const schoolTeachers = getSchoolTeachers(teachersList || [], institution.id, schoolCampuses);

  const mappedCampuses: CampusData[] = schoolCampuses.length > 0
    ? schoolCampuses.map((c, idx) => {
        const campStudents = (detailedStudents || []).filter(s => s.campus_id === c.id);
        const campTeachers = (teachersList || []).filter(t => t.campus_id === c.id);
        const stCount = campStudents.length || Math.max(12, Math.floor(schoolStudents.length / schoolCampuses.length)) || (isCorp ? 180 : 350);
        const tcCount = campTeachers.length || Math.max(2, Math.floor(schoolTeachers.length / schoolCampuses.length)) || (isCorp ? 12 : 24);

        return {
          id: c.id,
          name: c.name,
          location: c.address || `${c.name} · ${isCorp ? 'Planta / Sede Corporativa' : 'Sede Oficial'}`,
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
          name: isCorp ? `${institution.name} · Sede Central & Corporativo` : `${institution.name} · Plantel Central`,
          location: institution.address || (isCorp ? 'Sede Corporativa Central' : 'Sede Central'),
          students: schoolStudents.length || (isCorp ? 280 : 450),
          teachers: schoolTeachers.length || (isCorp ? 16 : 28),
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
    slug: institution.id.replace('sch-', '').replace('emp-', ''),
    tagline: institution.tagline || (isCorp
      ? 'Consorcio corporativo de alta dirección, formación de talento y competencias laborales.'
      : 'Institución de formación integral y excelencia académica.'),
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

// Base de conocimiento corporativa para empresas B2B y sector industrial (BMW, Retail, Tech)
export const CORPORATE_KNOWLEDGE_BASE = [
  {
    id: 'corp-kb-1',
    topic: 'Protocolo de Seguridad Industrial, EPP y Salud Ocupacional (STPS NOM-030 / NOM-035)',
    category: 'Seguridad Industrial & SST',
    sede: 'Planta de Manufactura & Complejos Industriales',
    reads: '1,740 consultas',
    keywords: ['seguridad', 'industrial', 'salud', 'ocupacional', 'sst', 'stps', 'nom035', 'loto', 'planta', 'epp', 'bmw', 'linea', 'ensamble', 'evacuacion'],
    summary: 'Protocolo estandarizado de actuación en líneas operativas, procedimientos de bloqueo/etiquetado (LOTO), uso obligatorio de EPP y atención médica inmediata en planta.',
    answer: 'El protocolo corporativo de seguridad industrial y salud en el trabajo establece la verificación inmediata del expediente de salud ocupacional del colaborador, garantizando el cumplimiento de normas STPS (NOM-030 y NOM-035), protocolos de bloqueo de energía LOTO en maquinaria y atención en módulo médico de planta en < 3 minutos con bitácora inmutable.'
  },
  {
    id: 'corp-kb-2',
    topic: 'Matriz de Competencias Laborales y Certificaciones Técnicas (ISO 9001 / IATF 16949)',
    category: 'Competencias Técnicas & Certificaciones',
    sede: 'Centro de Entrenamiento Técnico & Planta SLP',
    reads: '2,310 consultas',
    keywords: ['competencias', 'certificaciones', 'tecnicas', 'iso', 'iatf', 'capacitacion', 'entrenamiento', 'habilidades', 'operativas', 'onboarding', 'linea', 'mejora', 'continua'],
    summary: 'Módulos de capacitación técnica especializada, certificación de habilidades operativas en línea y planes de desarrollo profesional continuo a 0 tokens.',
    answer: 'La cobertura en certificación de competencias laborales en el holding corporativo alcanza el 96.8%. Se articulan matrices de habilidades técnicas alineadas a estándares internacionales automotrices e industriales (ISO 9001, IATF 16949 y metodologías Lean Manufacturing) con evaluación continua y registro en la Bóveda Central de Conocimiento.'
  },
  {
    id: 'corp-kb-3',
    topic: 'Manual de Facturación B2B, Órdenes de Compra y Timbrado SAT CFDI 4.0',
    category: 'Finanzas B2B & Cumplimiento Fiscal SAT',
    sede: 'Dirección de Finanzas & Tesorería Holding',
    reads: '1,280 consultas',
    keywords: ['facturacion', 'b2b', 'cobranza', 'cfdi', 'sat', 'timbrado', 'fiscal', 'empresarial', 'orden', 'compra', 'pac', 'deduccion'],
    summary: 'Procedimiento de emisión automatizada de comprobantes fiscales empresariales, validación de complementos de pago B2B y conciliación bancaria.',
    answer: 'La facturación corporativa opera bajo el esquema CFDI 4.0 con timbrado PAC instantáneo a 0 tokens. Las cuentas por cobrar y órdenes de compra corporativas son conciliadas automáticamente en el libro mayor financiero con validación de RFC empresarial y cumplimiento fiscal estricto.'
  },
  {
    id: 'corp-kb-4',
    topic: 'Protocolo de Evacuación de Naves Industriales y Brigadas de Emergencia',
    category: 'Protección Civil & Seguridad en Planta',
    sede: 'Dirección de Seguridad Patrimonial & Planta',
    reads: '1,490 consultas',
    keywords: ['evacuacion', 'nave', 'industrial', 'proteccion', 'civil', 'simulacro', 'brigada', 'emergencia', 'seguridad', 'punto', 'reunion'],
    summary: 'Directrices de evacuación inmediata ante siniestros o contingencias en plantas de manufactura y centros corporativos con conteo biométrico de colaboradores en < 90 segundos.',
    answer: 'Ante cualquier contingencia en plantas o edificios corporativos: 1) Paro preventivo de maquinaria y líneas operativas. 2) Evacuación guiada por brigadistas hacia puntos de reunión designados. 3) Pase de lista y verificación biométrica de colaboradores activos en la app. 4) Activación de protocolos de coordinación con servicios de emergencia locales.'
  },
  {
    id: 'corp-kb-5',
    topic: 'Protocolo de Atracción de Talento, Evaluación Técnica e Inducción Corporativa',
    category: 'Capital Humano & Reclutamiento',
    sede: 'Gerencia de Recursos Humanos & Talento',
    reads: '1,050 consultas',
    keywords: ['reclutamiento', 'onboarding', 'talento', 'candidatos', 'evaluacion', 'tecnica', 'induccion', 'contratacion', 'capital', 'humano'],
    summary: 'Ruta de incorporación de nuevos colaboradores: Evaluación técnica y psicométrica laboral, entrevistas con directores de área y programa de inducción.',
    answer: 'El ciclo de incorporación corporativa consta de 4 etapas: Registro de candidatos en el ATS corporativo, evaluación técnica y psicométrica laboral, entrevistas con directores de área y formalización de oferta con expediente digital de colaborador.'
  },
  {
    id: 'corp-kb-6',
    topic: 'Código de Ética Profesional, Compliance y Normativa Laboral',
    category: 'Jurídico Corporativo & Compliance',
    sede: 'Comité de Ética y Cumplimiento',
    reads: '890 consultas',
    keywords: ['etica', 'cumplimiento', 'compliance', 'reglamento', 'interior', 'trabajo', 'derechos', 'comite', 'clima', 'laboral'],
    summary: 'Lineamientos de conducta profesional, mediación laboral, resguardo de información confidencial y canal de denuncias corporativo.',
    answer: 'Política de estricto apego al código de conducta y transparencia en todas las unidades de negocio. El comité corporativo asegura el cumplimiento del Reglamento Interior de Trabajo, resolución pacífica de controversias y protección integral al colaborador.'
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
  channel: 'Recomendación Familiar' | 'Canales Digitales & Web' | 'Convenios Corporativos' | 'Feria Escolar' | 'Bolsas de Empleo & Redes' | 'Headhunting Directo' | 'Recomendación Interna' | 'Convenios con Universidades';
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

export const INITIAL_BMW_CANDIDATES: ProspectFamily[] = [
  {
    id: 'prospect-bmw-1',
    studentName: 'Ing. Daniel Zavala Ríos',
    grade: 'Especialista en Robótica KUKA & Celdas de Soldadura',
    tutorName: 'Lic. Rodrigo Sánchez Monroy (HR VP)',
    phone: '444 812 9044',
    email: 'daniel.zavala@ingenieria.mx',
    campusId: 'cmp-bmw-slp',
    campusName: 'Planta San Luis Potosí (Manufactura y Ensamble)',
    stage: 1,
    stageName: '1. Candidato en Base de Datos',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 1 día',
    notes: 'Ingeniero Mecatrónico con 6 años de experiencia en celdas robotizadas KUKA. Disponibilidad inmediata para planta SLP.'
  },
  {
    id: 'prospect-bmw-2',
    studentName: 'Mtra. Andrea L. Pantoja Cruz',
    grade: 'Ingeniera de Ensamble Tren Motriz Eléctrico',
    tutorName: 'Dra. Erika Von Humboldt (Alto Voltaje)',
    phone: '444 980 1122',
    email: 'andrea.pantoja@evmotors.de',
    campusId: 'cmp-bmw-slp',
    campusName: 'Planta San Luis Potosí (Manufactura y Ensamble)',
    stage: 2,
    stageName: '2. Entrevista Inicial',
    channel: 'Headhunting Directo',
    registeredDate: 'Hace 2 días',
    notes: 'Entrevista técnica presencial programada en el Centro de Baterías de Planta SLP. Certificación DGUV Nivel 3.'
  },
  {
    id: 'prospect-bmw-3',
    studentName: 'Ing. Mauricio Garza Treviño',
    grade: 'Líder Técnico de Ensamble & ISO 45001',
    tutorName: 'Ing. Guillermo Schmidt (Master Trainer)',
    phone: '444 321 8899',
    email: 'mauricio.garza@autotech.mx',
    campusId: 'cmp-bmw-slp',
    campusName: 'Planta San Luis Potosí (Manufactura y Ensamble)',
    stage: 3,
    stageName: '3. Evaluación Técnica & Psicométrica',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 4 días',
    notes: 'Prueba psicométrica y simulador KUKA concluidas con 93/100. Pendiente dictamen de comité de manufactura.'
  },
  {
    id: 'prospect-bmw-4',
    studentName: 'Lic. Claudia Morales Ortiz',
    grade: 'Supervisora de Logística JIT & Cadena Automotriz',
    tutorName: 'Lic. Andrea Fuentes (HR Santa Fe)',
    phone: '55 4567 1122',
    email: 'claudia.morales@logistics.org',
    campusId: 'cmp-bmw-cdmx',
    campusName: 'Corporativo Nexus Santa Fe',
    stage: 4,
    stageName: '4. Oferta Laboral Emitida',
    channel: 'Convenios con Universidades',
    registeredDate: 'Hace 5 días',
    notes: 'Carta oferta económica emitida por $45,000 MXN brutos con prestaciones superiores. Aceptación preliminar recibida.'
  },
  {
    id: 'prospect-bmw-5',
    studentName: 'Ing. Fernando Schmidt Keller',
    grade: 'Arquitecto de Telemetría Vehicular & Baterías',
    tutorName: 'Ing. Dirk Dreher (CEO & Director)',
    phone: '444 199 4433',
    email: 'fernando.schmidt@bmw-corp.mx',
    campusId: 'cmp-bmw-slp',
    campusName: 'Planta San Luis Potosí (Manufactura y Ensamble)',
    stage: 5,
    stageName: '5. Contratación Confirmada',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 1 semana',
    notes: 'Contrato firmado al 100%. Alta patronal IMSS procesada. Entrega de credencial y kit de inducción completada.'
  },
  {
    id: 'prospect-bmw-6',
    studentName: 'Lic. Gabriel Ramos Lozano',
    grade: 'Coordinador de Postventa & Fidelización Santa Fe',
    tutorName: 'Lic. Andrea Fuentes (HR Santa Fe)',
    phone: '55 6789 9900',
    email: 'gabriel.ramos@servicios.com',
    campusId: 'cmp-bmw-cdmx',
    campusName: 'Corporativo Nexus Santa Fe',
    stage: 2,
    stageName: '2. Entrevista Inicial',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 2 días',
    notes: 'Entrevista inicial con la gerencia de postventa de Santa Fe. Evaluación de CRM y garantías automotrices.'
  }
];

export const INITIAL_VENTAS_CANDIDATES: ProspectFamily[] = [
  {
    id: 'prospect-ventas-1',
    studentName: 'Lic. Valeria Santos Orozco',
    grade: 'Gerente de Compras Omnicanal & Retail Analytics',
    tutorName: 'Lic. Bernardo Garza (VP Comercial)',
    phone: '55 1234 5678',
    email: 'valeria.santos@retail.mx',
    campusId: 'cmp-ventas-cdmx',
    campusName: 'Corporativo Insurgentes CDMX',
    stage: 1,
    stageName: '1. Candidato en Base de Datos',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 1 día',
    notes: 'Experiencia en negociación de categorías de consumo masivo con proveedores nacionales e internacionales.'
  },
  {
    id: 'prospect-ventas-2',
    studentName: 'Lic. Rodrigo E. Villarreal Sada',
    grade: 'Coordinador de Distribución y Flotas CEDIS',
    tutorName: 'Lic. Mariana Garza Sada (CEO)',
    phone: '81 8345 6789',
    email: 'rodrigo.villarreal@logistica.com',
    campusId: 'cmp-ventas-mty',
    campusName: 'CEDIS Norte Monterrey (Cadena Logística)',
    stage: 2,
    stageName: '2. Entrevista Inicial',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 2 días',
    notes: 'Visita técnica programada en CEDIS Apodaca para evaluar patios de maniobras y rutas metropolitanas.'
  },
  {
    id: 'prospect-ventas-3',
    studentName: 'Ing. Brenda Covarrubias Lara',
    grade: 'Supervisora de Operaciones WMS y Logística Inversa',
    tutorName: 'Mtro. Javier Alarcón Castillo (Logística)',
    phone: '33 3456 7890',
    email: 'brenda.covarrubias@wms.com',
    campusId: 'cmp-ventas-gdl',
    campusName: 'Hub Logístico Guadalajara',
    stage: 3,
    stageName: '3. Evaluación Técnica & Psicométrica',
    channel: 'Headhunting Directo',
    registeredDate: 'Hace 3 días',
    notes: 'Evaluación técnica de software WMS y auditoría de inventarios cíclicos con calificación de 92%.'
  },
  {
    id: 'prospect-ventas-4',
    studentName: 'Lic. Carlos Alcocer Ramos',
    grade: 'Key Account Manager Cuentas Clave Retail',
    tutorName: 'Lic. Bernardo Garza (VP Comercial)',
    phone: '55 9876 1234',
    email: 'carlos.alcocer@kam.com.mx',
    campusId: 'cmp-ventas-cdmx',
    campusName: 'Corporativo Insurgentes CDMX',
    stage: 4,
    stageName: '4. Oferta Laboral Emitida',
    channel: 'Recomendación Interna',
    registeredDate: 'Hace 4 días',
    notes: 'Propuesta de compensación fija más esquema de comisiones y bonos de cumplimiento de cuota trimestral.'
  },
  {
    id: 'prospect-ventas-5',
    studentName: 'Lic. Mónica Terán Sepúlveda',
    grade: 'Subdirectora de Experiencia del Cliente & Postventa',
    tutorName: 'Lic. Mariana Garza Sada (CEO)',
    phone: '81 9988 7766',
    email: 'monica.teran@vanguardia-retail.mx',
    campusId: 'cmp-ventas-mty',
    campusName: 'CEDIS Norte Monterrey (Cadena Logística)',
    stage: 5,
    stageName: '5. Contratación Confirmada',
    channel: 'Convenios con Universidades',
    registeredDate: 'Hace 1 semana',
    notes: 'Contratada formalmente. Expediente laboral y registro en nómina de Monterrey concluido.'
  }
];

export const INITIAL_TECH_CANDIDATES: ProspectFamily[] = [
  {
    id: 'prospect-tech-1',
    studentName: 'Ing. Sebastián Ruiz Calderón',
    grade: 'Senior DevOps & Cloud Platform Engineer',
    tutorName: 'Mtro. Alejandro Ramos (Head of Engineering)',
    phone: '55 2233 4455',
    email: 'sebastian.ruiz@devops.cloud',
    campusId: 'cmp-tech-cdmx',
    campusName: 'Innovation Center CDMX Polanco',
    stage: 1,
    stageName: '1. Candidato en Base de Datos',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 1 día',
    notes: 'Ingeniero de Plataforma con 7 años en microservicios, Terraform y orquestación multi-cloud.'
  },
  {
    id: 'prospect-tech-2',
    studentName: 'Mtra. Karla Daniela Peña Solís',
    grade: 'Staff MLOps & AI Deployment Specialist',
    tutorName: 'Dra. Sofía Mendoza Valdés (Lead AI)',
    phone: '33 9988 1122',
    email: 'karla.pena@mlops.ai',
    campusId: 'cmp-tech-gdl',
    campusName: 'Tech Hub Guadalajara (Silicon Valley MX)',
    stage: 2,
    stageName: '2. Entrevista Inicial',
    channel: 'Headhunting Directo',
    registeredDate: 'Hace 2 días',
    notes: 'Entrevista técnica profunda sobre optimización de inferencia en clusters GPU y pipelines de IA.'
  },
  {
    id: 'prospect-tech-3',
    studentName: 'Ing. Héctor V. Cárdenas Mora',
    grade: 'Fullstack Principal & Golang Microservices',
    tutorName: 'Mtro. Alejandro Ramos (Head of Engineering)',
    phone: '33 4455 6677',
    email: 'hector.cardenas@fullstack.io',
    campusId: 'cmp-tech-gdl',
    campusName: 'Tech Hub Guadalajara (Silicon Valley MX)',
    stage: 3,
    stageName: '3. Evaluación Técnica & Psicométrica',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 3 días',
    notes: 'Resolvió reto técnico de concurrencia y streaming gRPC con 96% de precisión y cero fugas.'
  },
  {
    id: 'prospect-tech-4',
    studentName: 'Ing. Diana Marcela Montes Parra',
    grade: 'Data Architect & Big Data Distributed Pipelines',
    tutorName: 'Mtro. Alejandro Ramos (Head of Engineering)',
    phone: '55 6677 8899',
    email: 'diana.montes@dataarchitect.mx',
    campusId: 'cmp-tech-cdmx',
    campusName: 'Innovation Center CDMX Polanco',
    stage: 4,
    stageName: '4. Oferta Laboral Emitida',
    channel: 'Recomendación Interna',
    registeredDate: 'Hace 5 días',
    notes: 'Carta oferta firmada. Incluye bono de contratación y esquema de trabajo híbrido en Polanco.'
  },
  {
    id: 'prospect-tech-5',
    studentName: 'Dr. Rodrigo Téllez Villegas',
    grade: 'Lead AI Scientist & Computer Vision',
    tutorName: 'Dra. Sofía Mendoza Valdés (Lead AI)',
    phone: '33 1122 3344',
    email: 'rodrigo.tellez@innovasoft.ai',
    campusId: 'cmp-tech-gdl',
    campusName: 'Tech Hub Guadalajara (Silicon Valley MX)',
    stage: 5,
    stageName: '5. Contratación Confirmada',
    channel: 'Bolsas de Empleo & Redes',
    registeredDate: 'Hace 1 semana',
    notes: 'Onboarding completado al 100%. Acceso a entornos de producción, VPN enterprise y contrato laboral registrado.'
  }
];

export const INITIAL_CORPORATE_CANDIDATES: ProspectFamily[] = INITIAL_BMW_CANDIDATES;

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
  const router = useRouter();

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
    const effectiveId = schoolId || activeSchoolId;
    if (effectiveId) {
      const match = institutionsList.find(i => i.id === effectiveId);
      if (match) {
        if (propHolding && (propHolding.id.includes(match.id) || propHolding.name === match.name)) {
          return propHolding;
        }
        return buildHoldingForInstitution(match, campusesList, detailedStudents, teachersList);
      }
    }
    if (propHolding) return propHolding;
    const targetInst = institutionsList.find(i => i.id === activeSchoolId) || institutionsList[0];
    return buildHoldingForInstitution(targetInst, campusesList, detailedStudents, teachersList);
  }, [propHolding, schoolId, activeSchoolId, institutionsList, campusesList, detailedStudents, teachersList]);

  // Institución Activa para datos de licencia e identidad
  const currentInstitution = useMemo(() => {
    const effectiveId = schoolId || activeSchoolId;
    if (effectiveId) {
      const match = institutionsList.find(i => i.id === effectiveId);
      if (match) return match;
    }
    return institutionsList.find(i => i.name === holding.name)
      || institutionsList.find(i => holding.slug && i.id.includes(holding.slug))
      || institutionsList[0];
  }, [institutionsList, schoolId, activeSchoolId, holding]);

  // Detección de Modo Corporativo B2B (Empresas / CEO)
  const isCorporate = useMemo(() => {
    return isCorporateInstitution(currentInstitution) ||
           currentInstitution?.id?.startsWith('emp-') ||
           currentInstitution?.id === 'sec-empresas-ceo' ||
           holding?.id?.includes('emp-') ||
           holding?.id?.includes('sec-empresas-ceo') ||
           (typeof holding?.name === 'string' && /bmw|empresa|corporativ|retail|innovasoft/i.test(holding.name)) ||
           schoolId?.startsWith('emp-') ||
           schoolId === 'sec-empresas-ceo';
  }, [currentInstitution, holding, schoolId]);

  // Sub-detección de empresas corporativas específicas
  const isBmw = useMemo(() => {
    if (!isCorporate) return false;
    const instId = String(currentInstitution?.id || schoolId || '').toLowerCase();
    const instName = String(currentInstitution?.name || holding?.name || '').toLowerCase();
    return instId === 'emp-bmw' || instId.includes('bmw') || instName.includes('bmw') || instName.includes('nexus');
  }, [isCorporate, currentInstitution, schoolId, holding]);

  const isRetail = useMemo(() => {
    if (!isCorporate) return false;
    const instId = String(currentInstitution?.id || schoolId || '').toLowerCase();
    const instName = String(currentInstitution?.name || holding?.name || '').toLowerCase();
    return instId === 'emp-ventas' || instId.includes('retail') || instId.includes('ventas') || instName.includes('retail') || instName.includes('vanguardia');
  }, [isCorporate, currentInstitution, schoolId, holding]);

  const isTech = useMemo(() => {
    if (!isCorporate) return false;
    const instId = String(currentInstitution?.id || schoolId || '').toLowerCase();
    const instName = String(currentInstitution?.name || holding?.name || '').toLowerCase();
    return instId === 'emp-tech' || instId.includes('tech') || instName.includes('innovasoft') || instName.includes('technology');
  }, [isCorporate, currentInstitution, schoolId, holding]);

  // Tema visual y configuración corporativa oficial para cada empresa
  const corporateTheme = useMemo(() => {
    if (!isCorporate) return null;
    if (isBmw) {
      return {
        id: 'emp-bmw',
        name: 'BMW Group México · Planta SLP',
        displayName: 'BMW Manufacturing México S.A. de C.V.',
        planName: 'BMW Corporate Training Suite',
        tagline: 'Planta de Manufactura Avanzada San Luis Potosí & Centro de Ensamble de Baterías',
        primaryColor: '#0066B1',
        primaryHover: '#004F8A',
        activeNavClass: 'bg-[#0066B1] text-white shadow-md font-semibold',
        activeHeroGrad: 'from-[#00142E] via-[#061E38] to-[#0066B1]',
        badgeBg: 'bg-sky-50 text-[#0066B1] border-sky-200',
        industryName: 'Automotriz & Manufactura Avanzada',
        accentText: 'text-sky-300'
      };
    }
    if (isRetail) {
      return {
        id: 'emp-ventas',
        name: 'Grupo Comercial Vanguardia Retail',
        displayName: 'Grupo Comercial Vanguardia Retail S.A. de C.V.',
        planName: 'Retail Supply Chain Enterprise Suite',
        tagline: 'Líder en Distribución Comercial, Retail Omnicanal y Cadena de Suministro',
        primaryColor: '#047857',
        primaryHover: '#065F46',
        activeNavClass: 'bg-[#047857] text-white shadow-md font-semibold',
        activeHeroGrad: 'from-[#022C22] via-[#064E3B] to-[#047857]',
        badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        industryName: 'Retail & Cadena de Suministro',
        accentText: 'text-emerald-300'
      };
    }
    // Default / Tech
    return {
      id: 'emp-tech',
      name: 'Innovasoft Dynamics Cloud & AI',
      displayName: 'Innovasoft Dynamics Cloud & AI Technologies',
      planName: 'Cloud & AI Enterprise Intelligence Suite',
      tagline: 'Infraestructura Cloud, Microservicios & Modelos de Inteligencia Artificial',
      primaryColor: '#4F46E5',
      primaryHover: '#4338CA',
      activeNavClass: 'bg-[#4F46E5] text-white shadow-md font-semibold',
      activeHeroGrad: 'from-[#0B0F19] via-[#1E1B4B] to-[#4F46E5]',
      badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      industryName: 'Cloud & Inteligencia Artificial Enterprise',
      accentText: 'text-cyan-300'
    };
  }, [isCorporate, isBmw, isRetail, isTech]);

  // Detección estricta de experiencia institucional IBIME
  const isIbime = useMemo(() => {
    const instId = (schoolId || currentInstitution?.id || '').toLowerCase();
    const instName = (currentInstitution?.name || holding?.name || '').toLowerCase();
    const holdingSlug = (holding?.slug || '').toLowerCase();

    // Si la institución o holding es explícitamente otra, NUNCA es IBIME
    if (instId && instId !== 'sch-ibime') return false;
    if (holdingSlug && holdingSlug !== 'ibime') return false;
    if (instName && !instName.includes('ibime')) return false;

    // Solo es IBIME si explícitamente coincide
    if (instId === 'sch-ibime' || instName.includes('ibime') || holdingSlug === 'ibime') return true;

    // Solo si estamos navegando explícitamente en la ruta /ibime y no hay otra escuela asignada
    if (typeof window !== 'undefined' && window.location.pathname.includes('/ibime') && (!instId || instId === 'sch-ibime')) {
      return true;
    }
    return false;
  }, [schoolId, holding, currentInstitution]);

  const institutionalDisplayName = useMemo(() => {
    if (corporateTheme) return corporateTheme.displayName;
    if (isIbime) return 'Instituto Bilingüe IBIME';
    return currentInstitution?.licensing?.licensee || currentInstitution?.name || holding.name;
  }, [isIbime, corporateTheme, currentInstitution, holding]);

  // ------------------------------------------
  // Estados de Control de Vista y Filtros
  // ------------------------------------------
  const [selectedCampusId, setSelectedCampusId] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<'semana' | 'mes' | 'bimestre' | 'ciclo'>('semana');
  const [activeTab, setActiveTab] = useState<string>('inicio');
  const [admissionsViewMode, setAdmissionsViewMode] = useState<'bento_kanban' | 'crm_studio'>('bento_kanban');
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
    actionType: 'cobranza' | 'reinscripcion' | 'academico' | 'docentes' | 'retencion';
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

  // Conexión reactiva con el Pipeline de Admisiones y CRM Escolar Unificado 360°
  const {
    metrics: livePipelineMetrics,
    campusesBreakdown: liveCampusesBreakdown,
    capacityTarget: liveCapacityTarget
  } = useAdmissionsPipeline({ 
    campusId: selectedCampusId,
    academicYear: '2026-2027'
  });

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

  // Modal de Acceso a Portales Académicos por Colegio y Correo Institucional
  const [isAcademicPortalModalOpen, setIsAcademicPortalModalOpen] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);

  // Estado del generador de reportes analíticos instantáneos (0 Tokens)
  const [activeReportQuery, setActiveReportQuery] = useState<string>('Estudiantes con adeudo activo por nivel y monto pendiente');
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
    if (selectedCampusId === 'all') return isCorporate ? 'Consolidado Corporativo' : 'Consolidado (5 Sedes)';
    return holding.campuses.find(c => c.id === selectedCampusId)?.name || (isCorporate ? 'Sede Seleccionada' : 'Plantel Seleccionado');
  }, [selectedCampusId, holding.campuses, isCorporate]);

  // Motor Autónomo Watchdog (Monitoreo Continuo sin Intervención)
  const [autonomousCycle, setAutonomousCycle] = useState<number>(1);
  const [lastEvaluationTime, setLastEvaluationTime] = useState<string>('En tiempo real');
  const [isAutonomousActive, setIsAutonomousActive] = useState<boolean>(true);

  // -----------------------------------------------------------
  // GESTIÓN DEL PIPELINE DE ADMISIONES & CAPTACIÓN (0 TOKENS)
  // -----------------------------------------------------------
  const [prospectsList, setProspectsList] = useState<ProspectFamily[]>(() => {
    if (!isCorporate) return INITIAL_PROSPECTS_DATA;
    if (isRetail) return INITIAL_VENTAS_CANDIDATES;
    if (isTech) return INITIAL_TECH_CANDIDATES;
    return INITIAL_BMW_CANDIDATES;
  });

  useEffect(() => {
    if (isCorporate) {
      if (isRetail) {
        setProspectsList(INITIAL_VENTAS_CANDIDATES);
      } else if (isTech) {
        setProspectsList(INITIAL_TECH_CANDIDATES);
      } else {
        setProspectsList(INITIAL_BMW_CANDIDATES);
      }
      setActiveReportQuery(prev => prev.includes('Estudiantes') ? 'Colaboradores y áreas operativas con asignación de recursos y estatus' : prev);
    } else {
      setProspectsList(INITIAL_PROSPECTS_DATA);
    }
  }, [isCorporate, isBmw, isRetail, isTech]);

  const [isAdmissionsPipelineOpen, setIsAdmissionsPipelineOpen] = useState<boolean>(false);
  const [isAddProspectModalOpen, setIsAddProspectModalOpen] = useState<boolean>(false);
  const [prospectSearchTerm, setProspectSearchTerm] = useState<string>('');
  const [prospectFilterStage, setProspectFilterStage] = useState<number | 'all'>('all');
  const [prospectFilterCampus, setProspectFilterCampus] = useState<string>('all');
  const [newProspectForm, setNewProspectForm] = useState({
    studentName: '',
    grade: isCorporate ? 'Especialista en Robótica KUKA & Celdas de Soldadura' : 'Primaria 1°',
    campusId: 'cdmx',
    tutorName: '',
    phone: '',
    email: '',
    channel: 'Recomendación Familiar' as ProspectFamily['channel'],
    initialStage: 1 as 1 | 2 | 3 | 4 | 5,
    notes: '',
    salary: '',
    department: ''
  });

  // Avanzar aspirante / candidato a la siguiente etapa del pipeline
  const handleAdvanceProspectStage = useCallback((prospectId: string) => {
    const stageNames: Record<number, string> = isCorporate ? {
      1: '1. Candidato en Base de Datos',
      2: '2. Entrevista Inicial',
      3: '3. Evaluación Técnica & Psicométrica',
      4: '4. Oferta Laboral Emitida',
      5: '5. Contratación Confirmada'
    } : {
      1: '1. Prospecto Registrado en CRM',
      2: '2. Tour y Visita de Campus',
      3: '3. Examen Diagnóstico Psicopedagógico',
      4: '4. Carta de Asignación Emitida',
      5: '5. Inscripción y Reserva Pagada'
    };

    setProspectsList(prev => prev.map(p => {
      if (p.id === prospectId && p.stage < 5) {
        const nextStage = (p.stage + 1) as 1 | 2 | 3 | 4 | 5;
        triggerToast(`✓ ${isCorporate ? 'Candidato' : 'Aspirante'} ${p.studentName} avanzado a: ${stageNames[nextStage]}`);
        return { ...p, stage: nextStage, stageName: stageNames[nextStage] };
      }
      return p;
    }));
  }, [triggerToast, isCorporate]);

  // Alta de nuevo aspirante / candidato
  const handleCreateProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProspectForm.studentName.trim() || !newProspectForm.tutorName.trim()) {
      triggerToast(isCorporate ? '⚠️ Por favor completa el nombre del candidato y del evaluador/contacto.' : '⚠️ Por favor completa el nombre del alumno y del tutor.');
      return;
    }
    const campusObj = holding.campuses.find(c => c.id === newProspectForm.campusId);
    const stageNames: Record<number, string> = isCorporate ? {
      1: '1. Candidato en Base de Datos',
      2: '2. Entrevista Inicial',
      3: '3. Evaluación Técnica & Psicométrica',
      4: '4. Oferta Laboral Emitida',
      5: '5. Contratación Confirmada'
    } : {
      1: '1. Prospecto Registrado en CRM',
      2: '2. Tour y Visita de Campus',
      3: '3. Examen Diagnóstico Psicopedagógico',
      4: '4. Carta de Asignación Emitida',
      5: '5. Inscripción y Reserva Pagada'
    };
    const defaultCampus = holding.campuses[0]?.name || (isCorporate ? 'Planta Industrial Norte (CDMX)' : 'Campus Montes (Sede Matriz & CCH)');
    const newEntry: ProspectFamily = {
      id: `prospect-manual-${Date.now()}`,
      studentName: newProspectForm.studentName,
      grade: newProspectForm.grade,
      tutorName: newProspectForm.tutorName,
      phone: newProspectForm.phone || '55 0000 0000',
      email: newProspectForm.email || (isCorporate ? 'talento@empresa.mx' : 'contacto@familia.mx'),
      campusId: newProspectForm.campusId,
      campusName: campusObj?.name || defaultCampus,
      stage: newProspectForm.initialStage,
      stageName: stageNames[newProspectForm.initialStage],
      channel: newProspectForm.channel,
      registeredDate: 'Hoy',
      notes: newProspectForm.notes || (isCorporate ? 'Registro manual desde Consola de Atracción de Talento B2B' : 'Registro manual desde Suite de Dirección General')
    };

    // Sincronización atómica con useCrmStore para el CRM y Pipeline 360°
    if (!isCorporate) {
      try {
        const studentParts = newProspectForm.studentName.trim().split(/\s+/);
        const stuFirst = studentParts[0] || 'Aspirante';
        const stuLast1 = studentParts[1] || '';
        const stuLast2 = studentParts.slice(2).join(' ') || '';

        const tutorParts = newProspectForm.tutorName.trim().split(/\s+/);
        const tutFirst = tutorParts[0] || 'Tutor';
        const tutLast1 = tutorParts[1] || '';
        const tutLast2 = tutorParts.slice(2).join(' ') || '';

        const stageKeys: Record<number, CrmStageKey> = {
          1: 'registered',
          2: 'tour_scheduled',
          3: 'evaluation',
          4: 'reservation',
          5: 'enrolled'
        };

        const targetStage = stageKeys[newProspectForm.initialStage] || 'registered';

        const gradeStr = newProspectForm.grade.toLowerCase();
        let targetLevel: 'maternal' | 'preescolar' | 'primaria' | 'secundaria' | 'preparatoria' = 'primaria';
        if (gradeStr.includes('kínder') || gradeStr.includes('preescolar')) targetLevel = 'preescolar';
        else if (gradeStr.includes('secundaria')) targetLevel = 'secundaria';
        else if (gradeStr.includes('preparatoria') || gradeStr.includes('bachillerato')) targetLevel = 'preparatoria';
        else if (gradeStr.includes('maternal')) targetLevel = 'maternal';

        const effectiveTargetSchool = isCorporate ? (corporateTheme?.id || 'emp-bmw') : (schoolId || 'sch-ibime');
        const effectivePipelineType = isCorporate ? 'corporate_recruitment' : 'new_enrollment';
        const effectiveTargetLevel = isCorporate ? 'corporativo' : targetLevel;

        const leadId = useCrmStore.getState().createLead({
          school_id: effectiveTargetSchool,
          campus_id: normalizeCampusKey(newProspectForm.campusId),
          pipeline_type: effectivePipelineType,
          stage: targetStage,
          tutor_first_name: isCorporate ? stuFirst : tutFirst,
          tutor_last_name_1: isCorporate ? stuLast1 : tutLast1,
          tutor_last_name_2: isCorporate ? stuLast2 : tutLast2,
          tutor_last_name: isCorporate ? ([stuLast1, stuLast2].filter(Boolean).join(' ') || stuFirst) : ([tutLast1, tutLast2].filter(Boolean).join(' ') || tutFirst),
          tutor_phone: newProspectForm.phone || (isCorporate ? '444 000 0000' : '55 0000 0000'),
          tutor_email: newProspectForm.email || (isCorporate ? 'candidato@talento.mx' : 'contacto@familia.mx'),
          tutor_relationship: isCorporate ? 'Candidato Titular' : 'Padre',
          source_channel: isCorporate ? (
            (newProspectForm.channel as string) === 'Recomendación Interna' ? 'internal_referral' :
            (newProspectForm.channel as string) === 'Bolsas de Empleo & Redes' ? 'job_board' :
            (newProspectForm.channel as string) === 'Headhunting Directo' ? 'headhunting' : 'linkedin'
          ) : (
            (newProspectForm.channel as string) === 'Recomendación Familiar' ? 'referral' :
            (newProspectForm.channel as string) === 'Canales Digitales & Web' ? 'website_form' :
            (newProspectForm.channel as string) === 'Convenios Corporativos' ? 'corporate_agreement' :
            (newProspectForm.channel as string) === 'Feria Escolar' ? 'school_fair' : 'website_form'
          ),
          source_detail: isCorporate ? 'Registro manual desde la Consola CEO de Reclutamiento' : 'Registro desde Cabecera de Admisiones en Vista CEO',
          priority: 'warm',
          outcome: null,
          referral_incentive_applied: false,
          target_academic_year: '2026-2027',
          notes: newProspectForm.notes || (isCorporate ? 'Registro de candidato en pipeline B2B' : 'Registro manual desde la Vista CEO de Admisiones'),
          campus_name: campusObj?.name || defaultCampus,
          proposed_salary: isCorporate ? (newProspectForm.salary || '$48,000 MXN / mes') : undefined,
          department: isCorporate ? (newProspectForm.department || 'Operaciones Industriales') : undefined,
          recruiter_name: isCorporate ? (tutFirst ? `${tutFirst} ${tutLast1}` : 'Comité de Capital Humano') : undefined,
          recruiter_title: isCorporate ? 'Dirección de Atracción de Talento' : undefined,
        });

        useCrmStore.getState().addCandidate({
          lead_id: leadId,
          first_name: stuFirst,
          last_name_1: stuLast1,
          last_name_2: stuLast2,
          last_name: [stuLast1, stuLast2].filter(Boolean).join(' ') || stuFirst,
          target_level: effectiveTargetLevel,
          target_grade: isCorporate ? 'Especialista' : newProspectForm.grade,
          position_title: isCorporate ? newProspectForm.grade : undefined,
          department: isCorporate ? (newProspectForm.department || 'Operaciones Industriales') : undefined,
          proposed_salary: isCorporate ? (newProspectForm.salary || '$48,000 MXN / mes') : undefined,
          technical_score: 90,
          evaluation_status: newProspectForm.initialStage >= 3 ? 'scheduled' : 'pending',
          scholarship_percent: 0,
          status: newProspectForm.initialStage === 5 ? 'enrolled' : 'active'
        });
      } catch (err) {
        console.error('Error syncing lead to useCrmStore:', err);
      }
    }

    setProspectsList(prev => [newEntry, ...prev]);
    setIsAddProspectModalOpen(false);
    setNewProspectForm({
      studentName: '',
      grade: isCorporate ? 'Especialista en Robótica KUKA & Celdas de Soldadura' : 'Primaria 1°',
      campusId: holding.campuses[0]?.id || 'cdmx',
      tutorName: '',
      phone: '',
      email: '',
      channel: 'Recomendación Familiar',
      initialStage: 1,
      notes: '',
      salary: '',
      department: ''
    });
    triggerToast(`✓ ${isCorporate ? 'Candidato' : 'Aspirante'} ${newEntry.studentName} agregado con éxito al Pipeline de ${newEntry.campusName}.`);
  };

  // Exportación del Directorio de Pipeline a CSV
  const handleExportPipelineCSV = () => {
    const listToExport = prospectsList.filter(p => {
      const matchSearch = prospectSearchTerm === '' ||
        p.studentName.toLowerCase().includes(prospectSearchTerm.toLowerCase()) ||
        p.tutorName.toLowerCase().includes(prospectSearchTerm.toLowerCase()) ||
        p.phone.includes(prospectSearchTerm);
      const matchCampus = prospectFilterCampus === 'all' || p.campusId === prospectFilterCampus;
      const matchStage = prospectFilterStage === 'all' || p.stage === prospectFilterStage;
      return matchSearch && matchCampus && matchStage;
    });

    const headers = ['ID Folio', 'Aspirante / Candidato', 'Grado / Puesto', 'Tutor / Evaluador', 'Teléfono', 'Email', 'Sede', 'Fase', 'Etapa', 'Canal Origen', 'Fecha Registro', 'Notas'];
    const rows = listToExport.map(p => [
      `"${p.id}"`,
      `"${p.studentName.replace(/"/g, '""')}"`,
      `"${p.grade.replace(/"/g, '""')}"`,
      `"${p.tutorName.replace(/"/g, '""')}"`,
      `"${p.phone}"`,
      `"${p.email}"`,
      `"${p.campusName}"`,
      `"Fase ${p.stage}"`,
      `"${p.stageName.replace(/"/g, '""')}"`,
      `"${p.channel}"`,
      `"${p.registeredDate}"`,
      `"${(p.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeSlug = (holding.slug || currentInstitution?.id?.replace('sch-', '') || 'colegio').toUpperCase();
    link.setAttribute('download', `${safeSlug}_Directorio_Pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`✓ Directorio exportado con éxito (${listToExport.length} registros en CSV).`);
  };

  // Cálculo del Embudo de Conversión reactivo por sede y aspirantes
  const activeFunnelData = useMemo(() => {
    const campusBase: Record<string, [number, number, number, number, number]> = {
      all: [184, 126, 82, 54, 28],
      montes: [64, 46, 30, 20, 11],
      'cmp-montes': [64, 46, 30, 20, 11],
      lagos: [48, 34, 22, 15, 8],
      'cmp-lagos': [48, 34, 22, 15, 8],
      sancristobal: [42, 28, 18, 11, 5],
      'cmp-sancristobal': [42, 28, 18, 11, 5],
      coacalco: [30, 18, 12, 8, 4],
      'cmp-coacalco': [30, 18, 12, 8, 4],
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

    const c1 = isCorporate ? (base[0] + extraInStage(1)) : (base[0] + extraInStage(1) + (livePipelineMetrics?.phases?.[0]?.candidateCount || 0));
    const c2 = isCorporate ? (base[1] + extraInStage(2)) : (base[1] + extraInStage(2) + (livePipelineMetrics?.phases?.[1]?.candidateCount || 0));
    const c3 = isCorporate ? (base[2] + extraInStage(3)) : (base[2] + extraInStage(3) + (livePipelineMetrics?.phases?.[2]?.candidateCount || 0));
    const c4 = isCorporate ? (base[3] + extraInStage(4)) : (base[3] + extraInStage(4) + (livePipelineMetrics?.phases?.[3]?.candidateCount || 0));
    const c5 = isCorporate ? (base[4] + extraInStage(5)) : (base[4] + extraInStage(5) + (livePipelineMetrics?.phases?.[4]?.candidateCount || 0));

    return [
      { 
        stage: isCorporate ? '1. Candidatos Registrados en ATS' : '1. Prospectos Registrados en CRM', 
        count: c1, 
        pct: 100, 
        color: 'bg-purple-600', 
        borderColor: 'border-purple-200',
        bgColor: 'bg-purple-50/50',
        textColor: 'text-purple-700',
        note: isCorporate ? 'Interés inicial en portal de talento, convocatorias corporativas y bolsas de trabajo' : 'Interés inicial en web, redes sociales y ferias escolares',
        dept: isCorporate ? 'Atracción de Talento & Marca Empleadora' : 'Admisiones & Marketing Institucional',
        systemLocation: isCorporate ? 'Portal de Reclutamiento / Convocatoria B2B o Botón "+ Registrar Candidato"' : 'Formulario Web / Landing Page o Botón "+ Registrar Aspirante"',
        stageNum: 1
      },
      { 
        stage: isCorporate ? '2. Entrevistas Iniciales y Evaluación Técnica' : '2. Tours y Visitas de Campus', 
        count: c2, 
        pct: Number(((c2 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-indigo-600', 
        borderColor: 'border-indigo-200',
        bgColor: 'bg-indigo-50/50',
        textColor: 'text-indigo-700',
        note: isCorporate ? 'Sesiones de evaluación de competencias, perfil cultural y entrevista con líderes técnicos' : 'Recorridos presenciales de instalaciones y plática informativa directiva',
        dept: isCorporate ? 'Gerencia de Capital Humano & Líderes de Área' : 'Dirección de Plantel & Relaciones Públicas',
        systemLocation: isCorporate ? 'Agenda de Evaluaciones Técnicas / Pipeline de Talento' : 'Agenda de Visitas Guiadas / Directorio del Pipeline',
        stageNum: 2
      },
      { 
        stage: isCorporate ? '3. Evaluación de Competencias Técnicas y Psicométricas' : '3. Examen Diagnóstico Psicopedagógico', 
        count: c3, 
        pct: Number(((c3 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-blue-600', 
        borderColor: 'border-blue-200',
        bgColor: 'bg-blue-50/50',
        textColor: 'text-blue-700',
        note: isCorporate ? 'Evaluación de habilidades operativas, certificaciones técnicas y perfil psicométrico laboral' : 'Evaluación de habilidades cognitivas, socioemocionales y entrevista familiar',
        dept: isCorporate ? 'Evaluación Técnica & Salud Ocupacional' : 'Gabinete Psicopedagógico & Orientación',
        systemLocation: isCorporate ? 'Módulo de Competencias Técnicas / Expediente de Selección' : 'Módulo de Psicopedagogía / Expediente de Ingreso',
        stageNum: 3
      },
      { 
        stage: isCorporate ? '4. Oferta Económica y Carta de Asignación Emitida' : '4. Carta de Asignación Emitida', 
        count: c4, 
        pct: Number(((c4 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-teal-600', 
        borderColor: 'border-teal-200',
        bgColor: 'bg-teal-50/50',
        textColor: 'text-teal-700',
        note: isCorporate ? 'Propuesta formal de contratación y asignación a unidad con vigencia de firma (5 días)' : 'Cupo formal apartado en grado y grupo escolar con vigencia de pago (5 días)',
        dept: isCorporate ? 'Comité de Talento & Dirección de Operaciones' : 'Dirección Académica & Comité de Admisiones',
        systemLocation: isCorporate ? 'Comité de Asignación de Plazas Laborales' : 'Comité de Asignación de Matrícula',
        stageNum: 4
      },
      { 
        stage: isCorporate ? '5. Contratación e Incorporación Formal' : '5. Inscripción y Reserva Pagada', 
        count: c5, 
        pct: Number(((c5 / (c1 || 1)) * 100).toFixed(1)), 
        color: 'bg-emerald-600', 
        borderColor: 'border-emerald-200',
        bgColor: 'bg-emerald-50/50',
        textColor: 'text-emerald-700',
        note: isCorporate ? 'Colaborador activo formal, asignación corporativa y alta en nómina' : 'Matrícula activa formal SEP, timbrado CFDI 4.0 IEDU y alta en padrón',
        dept: isCorporate ? 'Recursos Humanos, Tesorería & Nóminas' : 'Caja, Tesorería & Control Escolar',
        systemLocation: isCorporate ? 'Módulo de Facturación B2B + Padrón de Colaboradores Activos' : 'Módulo de Cobranza SPEI + Padrón de Alumnos Activos',
        stageNum: 5
      },
    ];
  }, [selectedCampusId, prospectsList, isCorporate]);

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
    const isCobranzaQuery = qTokens.some(t => ['cobranza', 'saldo', 'adeudo', 'finanzas', 'cfdi', 'sat', 'iedu', 'colegiatura', 'dinero', 'pago', 'factura', 'b2b'].includes(t));
    const isCurriculumQuery = qTokens.some(t => ['nem', 'planeacion', 'planeaciones', 'curricular', 'cobertura', 'sep', 'pda', 'fases', 'rubricas', 'academico', 'competencia', 'competencias', 'capacitacion', 'stps', 'iso'].includes(t));
    const isStudentQuery = qTokens.some(t => ['alumno', 'alumnos', 'estudiante', 'estudiantes', 'colaborador', 'colaboradores', 'talento', 'empleado', 'empleados', 'matricula', 'plantilla', 'retencion', 'desercion', 'baja', 'bajas', 'inscripcion', 'onboarding'].includes(t));
    const isTeacherQuery = qTokens.some(t => ['docente', 'docentes', 'maestro', 'maestros', 'profesor', 'profesores', 'instructor', 'instructores', 'capacitador', 'capacitadores', 'facilitador', 'plantilla', 'rotacion'].includes(t));
    const isEmergencyQuery = qTokens.some(t => ['emergencia', 'medica', 'alergia', 'sismo', 'evacuacion', 'salud', 'terremoto', 'choque', 'shock', 'enfermeria', 'seguridad', 'stps', 'iso'].includes(t));

    let finalTitle = '';
    let finalText = '';
    let finalSource = '';
    let finalActionType = '';
    let finalActionLabel = '';
    let finalKpis: Array<{ label: string; value: string }> = [];
    let confidence = 98;

    if (isCampusSpecific) {
      finalTitle = `Dictamen Operativo: ${isCampusSpecific.name}`;
      finalSource = isCorporate ? `Bóveda Corporativa & Telemetría Sede • [${isCampusSpecific.location}]` : `Bóveda Curricular & Telemetría Sede • [${isCampusSpecific.location}]`;
      finalText = isCorporate
        ? `La planta/sede ${isCampusSpecific.name} registra una plantilla activa de ${isCampusSpecific.students.toLocaleString()} colaboradores y un cuerpo de ${isCampusSpecific.teachers} instructores técnicos (Ratio 1:${(isCampusSpecific.students / (isCampusSpecific.teachers || 1)).toFixed(1)}). Su cobranza y cumplimiento presupuestal se sitúa en ${isCampusSpecific.collectionRate}% (Meta Corporativa: ${collectionThreshold}%). La cobertura de competencias laborales alcanza el ${isCampusSpecific.curriculumCoverage || 93}%, con una retención de talento del ${isCampusSpecific.retentionRate || 95}%. ${isCampusSpecific.focalIssues > 0 ? `Cuenta con ${isCampusSpecific.focalIssues} foco(s) de atención prioritario(s).` : 'Operación en rango óptimo sin desviaciones críticas.'}`
        : `La sede ${isCampusSpecific.name} registra una matrícula activa de ${isCampusSpecific.students.toLocaleString()} alumnos y una plantilla de ${isCampusSpecific.teachers} docentes (Ratio 1:${(isCampusSpecific.students / isCampusSpecific.teachers).toFixed(1)}). Su cobranza actual se sitúa en ${isCampusSpecific.collectionRate}% (Meta Corporativa: ${collectionThreshold}%). La cobertura curricular oficial de la SEP bajo el marco NEM 2024 alcanza el ${isCampusSpecific.curriculumCoverage || 93}%, con una retención escolar del ${isCampusSpecific.retentionRate || 95}%. ${isCampusSpecific.focalIssues > 0 ? `Cuenta con ${isCampusSpecific.focalIssues} foco(s) de atención prioritario(s).` : 'Operación en rango óptimo sin desviaciones críticas.'}`;
      finalKpis = [
        { label: isCorporate ? 'Colaboradores' : 'Alumnos', value: isCampusSpecific.students.toLocaleString() },
        { label: isCorporate ? 'Cobranza B2B' : 'Cobranza', value: `${isCampusSpecific.collectionRate}%` },
        { label: isCorporate ? 'Competencias' : 'Cobertura SEP', value: `${isCampusSpecific.curriculumCoverage || 93}%` },
        { label: 'Focos Activos', value: `${isCampusSpecific.focalIssues}` }
      ];
      finalActionType = 'campus';
      finalActionLabel = `Filtrar a ${isCampusSpecific.name.split(' ')[1]}`;
    } else if (isCobranzaQuery) {
      const bestCampus = [...holding.campuses].sort((a, b) => b.collectionRate - a.collectionRate)[0];
      const lowestCampus = [...holding.campuses].sort((a, b) => a.collectionRate - b.collectionRate)[0];
      finalTitle = isCorporate ? `Balance Financiero y Facturación B2B Consolidada` : `Balance Financiero y Recaudación Consolidada`;
      finalSource = isCorporate ? `Tesorería Corporativa & Facturación SAT CFDI 4.0 B2B` : `Tesorería Central & Ledger SAT CFDI 4.0 IEDU`;
      finalText = isCorporate
        ? `La cobranza consolidada del holding empresarial ${holding.name} se sitúa en un promedio del ${metrics.avgCollection}% frente a la meta del ${collectionThreshold}%. La planta con mejor desempeño es ${bestCampus.name} (${bestCampus.collectionRate}%), mientras que ${lowestCampus.name} (${lowestCampus.collectionRate}%) se mantiene bajo monitoreo preventivo. Todos los comprobantes se emiten bajo CFDI 4.0 conciliados en ledger bancario.`
        : `La cobranza consolidada del holding ${holding.name} se sitúa en un promedio del ${metrics.avgCollection}% frente a la meta del ${collectionThreshold}%. La sede con mejor desempeño es ${bestCampus.name} (${bestCampus.collectionRate}%), mientras que ${lowestCampus.name} (${lowestCampus.collectionRate}%) se mantiene bajo monitoreo preventivo. Todos los comprobantes se emiten bajo CFDI 4.0 con complemento de deducción IEDU conciliado automáticamente al registrar el pago en ledger bancario.`;
      finalKpis = [
        { label: 'Cobranza Media', value: `${metrics.avgCollection}%` },
        { label: 'Líder en Cobro', value: `${bestCampus.collectionRate}%` },
        { label: 'Sede en Alerta', value: `${lowestCampus.name.split(' ')[1]} (${lowestCampus.collectionRate}%)` },
        { label: 'Timbrado Fiscal', value: 'CFDI 4.0 100%' }
      ];
      finalActionType = 'cobranza';
      finalActionLabel = 'Gestionar Foco de Cobranza';
    } else if (isCurriculumQuery) {
      finalTitle = isCorporate ? `Matriz de Competencias Laborales y Capacitación Técnica` : `Matriz de Cobertura Curricular y Planeaciones NEM 2024`;
      finalSource = isCorporate ? `Bóveda de Procesos & Certificaciones Técnicas STPS / ISO` : `Bóveda Curricular Central & SEP Proyectos Comunitarios`;
      finalText = isCorporate
        ? `La cobertura de competencias laborales consolidada en el consorcio alcanza el ${metrics.avgCurriculum}%. Se utilizan programas de capacitación cronometrados estructurados bajo estándares industriales y normativas de seguridad, con acreditaciones modulares y verificación directa en la Bóveda de Procesos.`
        : `La cobertura curricular consolidada en la Red alcanza el ${metrics.avgCurriculum}%. Se utilizan planeaciones de aula cronometradas (Inicio, Desarrollo, Cierre) estructuradas bajo la Nueva Escuela Mexicana (NEM 2024) con Procesos de Desarrollo de Aprendizaje (PDA) oficiales, rúbricas analíticas formativas y verificación directa en la Bóveda Curricular. Se mantiene supervisión preventiva en las evaluaciones formativas de Fase 6 en Secundaria.`;
      finalKpis = isCorporate ? [
        { label: 'Cobertura B2B', value: `${metrics.avgCurriculum}%` },
        { label: 'Capacitación', value: 'Normas ISO / STPS' },
        { label: 'Estructura', value: 'Módulos Técnicos' },
        { label: 'Bóveda Conocimiento', value: '100% Indexada' }
      ] : [
        { label: 'Cobertura Red', value: `${metrics.avgCurriculum}%` },
        { label: 'Planeaciones NEM', value: 'PDA Oficial SEP' },
        { label: 'Estructura Aula', value: 'Inicio-Des-Cierre' },
        { label: 'Bóveda Conocimiento', value: '100% Indexada' }
      ];
      finalActionType = 'academico';
      finalActionLabel = isCorporate ? 'Supervisar Competencias Técnicas' : 'Supervisar Planeaciones NEM';
    } else if (isStudentQuery) {
      finalTitle = isCorporate ? `Diagnóstico de Capital Humano, Retención de Talento y Expediente 360` : `Diagnóstico de Matrícula, Retención y Expediente 360`;
      finalSource = isCorporate ? `Dirección de Capital Humano & Comités de Operaciones` : `Registro Escolar Consolidado & Comités de Dirección`;
      finalText = isCorporate
        ? `La plantilla total auditada en el Consorcio es de ${metrics.totalStudents.toLocaleString()} colaboradores activos en ${metrics.totalCampuses} empresas y sedes. El índice de retención de talento anual se posiciona en ${metrics.avgRetention}%. Existen ${metrics.totalAdmissions} candidatos en proceso de onboarding y atracción de talento con perfil completado.`
        : `La matrícula total auditada en la Red es de ${metrics.totalStudents.toLocaleString()} alumnos activos en ${metrics.totalCampuses} planteles. El índice de retención anual se posiciona en ${metrics.avgRetention}%. Existen ${metrics.totalAdmissions} prospectos en proceso de inscripción con diagnóstico completado. Ante solicitudes de baja, se aplica la ruta diagnóstica con acceso al fondo corporativo de becas de contingencia (15% al 35%) para mitigar la deserción escolar.`;
      finalKpis = isCorporate ? [
        { label: 'Colaboradores Totales', value: metrics.totalStudents.toLocaleString() },
        { label: 'Retención de Talento', value: `${metrics.avgRetention}%` },
        { label: 'Pipeline Onboarding', value: `${metrics.totalAdmissions}` },
        { label: 'Plan de Carrera', value: '100% Activo' }
      ] : [
        { label: 'Alumnos Totales', value: metrics.totalStudents.toLocaleString() },
        { label: 'Tasa Retención', value: `${metrics.avgRetention}%` },
        { label: 'Admisiones Pipeline', value: `${metrics.totalAdmissions}` },
        { label: 'Beca Contingencia', value: '15% - 35%' }
      ];
      finalActionType = 'alumnos';
      finalActionLabel = isCorporate ? 'Ver Desglose de Colaboradores' : 'Ver Desglose de Alumnos';
    } else if (isTeacherQuery) {
      finalTitle = isCorporate ? `Cuerpo de Instructores, Facilitadores y Asignaciones Técnicas` : `Plantilla Docente y Asignaciones Titulares`;
      finalSource = isCorporate ? `Dirección de Capacitación & Bóveda de Talento Técnico` : `Coordinación Académica & Bóveda de Talento Humano`;
      finalText = isCorporate
        ? `El cuerpo de instructores de ${holding.name} cuenta con ${metrics.totalTeachers.toLocaleString()} especialistas y facilitadores activos en ${metrics.totalCampuses} sedes y plantas industriales. La ratio media es de 1 instructor por cada ${(metrics.totalStudents / (metrics.totalTeachers || 1)).toFixed(1)} colaboradores. Se mantiene programa de relevo generacional y certificación técnica continua.`
        : `El cuerpo docente de ${holding.name} cuenta con ${metrics.totalTeachers.toLocaleString()} maestros titulares y especialistas activos en ${metrics.totalCampuses} sedes. La ratio media es de 1 docente por cada ${(metrics.totalStudents / metrics.totalTeachers).toFixed(1)} educandos. Se identificó una rotación preventiva de 3 bajas docentes en el último mes con protocolos de reemplazo en menos de 48 horas habilitados en la Bóveda de Talento.`;
      finalKpis = isCorporate ? [
        { label: 'Instructores Activos', value: metrics.totalTeachers.toLocaleString() },
        { label: 'Ratio Colaborador/Instructor', value: `1:${(metrics.totalStudents / (metrics.totalTeachers || 1)).toFixed(1)}` },
        { label: 'Certificaciones', value: 'Normas ISO / STPS' },
        { label: 'Tiempo Cobertura', value: '< 48 hrs' }
      ] : [
        { label: 'Docentes Activos', value: metrics.totalTeachers.toLocaleString() },
        { label: 'Ratio Alumno/Docente', value: `1:${(metrics.totalStudents / metrics.totalTeachers).toFixed(1)}` },
        { label: 'Bajas Recientes', value: '3 en reemplazo' },
        { label: 'Tiempo Reemplazo', value: '< 48 hrs' }
      ];
      finalActionType = 'docentes';
      finalActionLabel = isCorporate ? 'Abrir Cartera de Instructores' : 'Abrir Cartera Docente';
    } else if (isEmergencyQuery) {
      finalTitle = isCorporate ? `Protocolos de Seguridad Industrial, Salud Ocupacional y Protección Civil` : `Protocolos de Emergencia Médica y Protección Civil Escolar`;
      finalSource = isCorporate ? `Normativa Industrial STPS, ISO 45001 & Protección Civil` : `Normativa Médica Oficial & Protección Civil Grupo`;
      finalText = isCorporate
        ? `El protocolo de seguridad y salud en el trabajo exige verificar de inmediato el Expediente 360 del colaborador en pantalla, aplicar estabilización médica primaria por servicio médico ocupacional y notificar a supervisores de planta en < 3 minutos. Ante alertas de siniestro o evacuación industrial, el desalojo ordenado a puntos de reunión se cronometra en < 90 segundos con pase de lista biométrico digital.`
        : `El protocolo de emergencia médica estandarizado exige verificar de inmediato el Expediente 360 del alumno en pantalla, aplicar estabilización primaria por personal de enfermería y emitir la notificación push a los tutores legales en < 3 minutos. Ante alertas sísmicas o evacuación, el desalojo ordenado a zonas seguras se cronometra en < 90 segundos con pase de lista biométrico digital inmutable.`;
      finalKpis = isCorporate ? [
        { label: 'Alerta a Supervisores', value: '< 3 minutos' },
        { label: 'Evacuación Planta', value: '< 90 segundos' },
        { label: 'Expediente 360', value: 'Salud Ocupacional' },
        { label: 'Folio Incidencia', value: 'Inmutable' }
      ] : [
        { label: 'Alerta a Padres', value: '< 3 minutos' },
        { label: 'Evacuación Sismo', value: '< 90 segundos' },
        { label: 'Expediente 360', value: 'Alergias y Póliza' },
        { label: 'Folio Bitácora', value: 'Inmutable' }
      ];
      finalActionType = 'emergencia';
      finalActionLabel = isCorporate ? 'Ver Protocolo de Seguridad' : 'Ver Expediente de Seguridad';
    } else {
      const targetKB = isCorporate ? CORPORATE_KNOWLEDGE_BASE : INSTITUTIONAL_KNOWLEDGE_BASE;
      let bestScore = -1;
      let bestMatch = targetKB[0];

      targetKB.forEach(doc => {
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
        { label: 'Vigencia', value: isCorporate ? 'Ejercicio 2026-2027' : 'Ciclo 2026-2027' }
      ];
      finalActionType = isCorporate ? 'operativo' : 'academico';
      finalActionLabel = isCorporate ? 'Supervisar Operación' : 'Supervisar Procedimiento';
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
      isCorporate 
        ? ['Empresa / Planta', 'Ubicación', 'Colaboradores', 'Instructores', 'Cobranza B2B (%)', 'Competencias (%)', 'Retención Talento (%)', 'Focos de Atención']
        : ['Plantel / Campus', 'Ubicación', 'Alumnos', 'Docentes', 'Cobranza (%)', 'Cobertura Curricular (%)', 'Retención (%)', 'Focos de Atención'],
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

  // Navegación a Portales Académicos por Colegio
  const handleEnterCampusAcademicPortal = (campusId?: string, campusName?: string) => {
    try {
      if (typeof localStorage !== 'undefined') {
        if (campusId) {
          localStorage.setItem('active_campus_id', campusId);
          if (campusName) localStorage.setItem('active_campus_name', campusName);
        }
        const effSchoolId = currentInstitution?.id || schoolId || (isIbime ? 'sch-ibime' : 'sch-test-case');
        const effTenant = holding.slug || effSchoolId.replace('sch-', '');
        localStorage.setItem('active_school_id', effSchoolId);
        localStorage.setItem('tenant-id', effTenant);
      }
    } catch (e) {
      console.error('Error setting campus context:', e);
    }
    
    setIsAcademicPortalModalOpen(false);
    const effSchoolId = currentInstitution?.id || schoolId || (isIbime ? 'sch-ibime' : 'sch-test-case');
    const targetUrl = campusId && campusId !== 'all'
      ? `/teacher?school_id=${encodeURIComponent(effSchoolId)}&campus=${encodeURIComponent(campusId)}&role=admin`
      : `/teacher?school_id=${encodeURIComponent(effSchoolId)}&role=admin`;
    router.push(targetUrl);
  };

  const handleAuditCampusCurriculum = (campusId: string) => {
    setCurriculumRadarCampus(campusId);
    setActiveTab('academico');
    setIsAcademicPortalModalOpen(false);
  };

  const navMenuItems = [
    { id: 'inicio', label: 'Inicio', icon: Building2, desc: isCorporate ? 'Consolidado Consorcio' : 'Consolidado Holding' },
    { id: 'vision', label: 'Visión Ejecutiva', icon: TrendingUp, desc: 'EBITDA & Simulador' },
    { id: 'colegios', label: isCorporate ? 'Empresas & Plantas' : 'Colegios', icon: School, desc: isCorporate ? 'Benchmark Empresas' : 'Benchmark 5 Sedes' },
    { id: 'personas', label: isCorporate ? 'Capital Humano' : 'Personas', icon: Users, desc: isCorporate ? 'Colaboradores 360' : 'Talento & Alumno 360' },
    { id: 'academico', label: isCorporate ? 'Competencias Técnicas' : 'Académico (NEM)', icon: GraduationCap, desc: isCorporate ? 'Horas & Certificaciones' : 'SEP Fases & XP' },
    { id: 'admisiones', label: isCorporate ? 'Reclutamiento & Onboarding' : 'Admisiones', icon: UserCheck, desc: isCorporate ? 'Pipeline de Talento' : 'Embudo & Conversión' },
    { id: 'finanzas', label: 'Finanzas', icon: DollarSign, desc: isCorporate ? 'CFDI 4.0 Facturación B2B' : 'CFDI 4.0 IEDU SAT' },
    { id: 'operacion', label: 'Operación', icon: SlidersHorizontal, desc: 'Automatizaciones' },
    { id: 'reportes', label: 'Reportes BI', icon: BarChart3, desc: 'Estudio Analítico & BI' },
    { id: 'cerebro', label: `Cerebro ${holding.name}`, icon: Network, desc: 'Cerebro Institucional', highlight: true },
  ];

  return (
    <div className="flex h-screen bg-[#f8f9fa] text-slate-800 font-sans antialiased overflow-hidden select-none print:h-auto print:min-h-0 print:overflow-visible print:bg-white print:block">
      
      {/* ========================================================= */}
      {/* 1. BARRA LATERAL DESKTOP (VISIBLE EN PANTALLAS GRANDES)   */}
      {/* ========================================================= */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between z-20 shrink-0 select-none print:hidden no-print">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {/* Brand Logo Header */}
          <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 shrink-0">
            {corporateTheme ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1 shrink-0">
                  <CorporateOfficialLogo enterpriseId={corporateTheme.id} size={32} variant="emblem_only" />
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-black tracking-tight text-slate-900 block truncate">
                    {isBmw ? 'BMW Group SLP' : isRetail ? 'Vanguardia Retail' : 'Innovasoft AI'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500 block truncate">
                    Suite CEO B2B
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  i
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">iSkool</span>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                  CEO
                </span>
              </div>
            )}
          </div>

          {/* Menú de Navegación Principal */}
          <nav className="p-3 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
            {navMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-100 cursor-pointer active:scale-98 ${
                    isActive
                      ? (corporateTheme ? corporateTheme.activeNavClass : 'bg-slate-900 text-white shadow-sm font-semibold')
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

            {/* Botón de Acceso a Portales Académicos por Colegio y Email Institucional */}
            <div className="pt-2 px-0.5 space-y-1.5">
              {!isCorporate && holding.campuses && holding.campuses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsAcademicPortalModalOpen(true)}
                  className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#5448f7] hover:bg-[#4639ed] text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border border-indigo-400/40 group"
                  title="Acceder a los portales académicos de cada uno de los colegios"
                >
                  <span className="font-extrabold tracking-tight">Portal Académico</span>
                  <ChevronRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsEmailModalOpen(true)}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border border-blue-400/40 group"
                title="Bandeja de Correo Institucional, Triage Cognitivo y Conexión Google (15 Fases)"
              >
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-white" />
                  <span className="font-extrabold tracking-tight">Email & Triage</span>
                </div>
                <ChevronRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </nav>
        </div>

        {/* Footer Sidebar Desktop */}
        <div className="p-3 border-t border-slate-100 space-y-2 shrink-0">
          {onBackToDirectory && (
            <button
              onClick={onBackToDirectory}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer active:scale-98"
              title={isCorporate ? "Volver al Directorio Institucional de Empresas" : "Volver al Directorio Institucional de Colegios"}
            >
              <div className="flex items-center gap-1.5">
                <ChevronLeft size={14} className="text-indigo-600" />
                <span>{isCorporate ? 'Directorio Empresas' : 'Directorio Colegios'}</span>
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
                {corporateTheme ? (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-white border border-slate-200 shadow-2xs flex items-center justify-center p-1 shrink-0">
                      <CorporateOfficialLogo enterpriseId={corporateTheme.id} size={28} variant="emblem_only" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-black tracking-tight text-slate-900 block truncate">
                        {isBmw ? 'BMW Group SLP' : isRetail ? 'Vanguardia Retail' : 'Innovasoft AI'}
                      </span>
                      <span className={`text-[9px] uppercase font-extrabold tracking-wider px-1.5 py-0.2 rounded border inline-block ${corporateTheme.badgeBg}`}>
                        CEO B2B
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      i
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">iSkool</span>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                      CEO
                    </span>
                  </div>
                )}
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
                          ? (corporateTheme ? corporateTheme.activeNavClass : 'bg-slate-900 text-white shadow-sm font-semibold')
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

                {/* Botón de Acceso a Portales Académicos por Colegio y Email Institucional (Móvil) */}
                <div className="pt-2 px-0.5 space-y-1.5">
                  {!isCorporate && holding.campuses && holding.campuses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAcademicPortalModalOpen(true);
                      }}
                      className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#5448f7] hover:bg-[#4639ed] text-white font-extrabold text-sm shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border border-indigo-400/40 group"
                      title="Acceder a los portales académicos de cada uno de los colegios"
                    >
                      <span className="font-extrabold tracking-tight">Portal Académico</span>
                      <ChevronRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsEmailModalOpen(true);
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-md shadow-blue-600/30 hover:shadow-blue-600/50 hover:scale-[1.02] active:scale-98 transition-all cursor-pointer border border-blue-400/40 group"
                    title="Bandeja de Correo Institucional, Triage Cognitivo y Conexión Google (15 Fases)"
                  >
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-white" />
                      <span className="font-extrabold tracking-tight">Email & Triage</span>
                    </div>
                    <ChevronRight size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
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
                    <span>{isCorporate ? 'Directorio de Empresas' : 'Directorio de Colegios'}</span>
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
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:h-auto print:min-h-0 print:overflow-visible print:block">
        
        {/* Top Header Ejecutivo Responsivo (Móvil, Tablet y Desktop) */}
        <header className="min-h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-2 z-10 shrink-0 print:hidden no-print">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Botón Menú Hamburguesa para Móvil y Tablet */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 cursor-pointer active:scale-95 shrink-0"
              aria-label="Abrir menú de navegación"
            >
              <Menu size={20} />
            </button>

            {/* Identidad del Holding / Corporativo Oficial */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              {corporateTheme ? (
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 p-1">
                  <CorporateOfficialLogo enterpriseId={corporateTheme.id} name={corporateTheme.name} size={22} variant="emblem_only" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-2xs flex items-center justify-center shrink-0 p-0.5">
                  <SchoolOfficialLogo
                    schoolId={currentInstitution?.id || schoolId}
                    name={currentInstitution?.name || holding.name}
                    logoUrl={currentInstitution?.logoUrl}
                    themeColors={currentInstitution?.settings?.themeColors}
                    size={24}
                    variant="shield_only"
                  />
                </div>
              )}
              <h1 className="text-xs sm:text-sm lg:text-base font-black text-slate-900 tracking-tight whitespace-nowrap shrink-0">
                {corporateTheme ? corporateTheme.name : (isIbime ? 'Instituto Bilingüe IBIME' : (currentInstitution?.name || holding.name))}
              </h1>
            </div>

            {/* Selector de Campus (Consolidado vs Sede Específica) */}
            <div className="relative shrink-0">
              <select
                value={selectedCampusId}
                onChange={(e) => {
                  setSelectedCampusId(e.target.value);
                  triggerToast(e.target.value === 'all' ? (isCorporate ? 'Mostrando datos consolidados de plantas' : 'Mostrando datos consolidados') : `Filtrando a: ${holding.campuses.find(c => c.id === e.target.value)?.name}`);
                }}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] sm:text-xs font-semibold rounded-lg pl-2 sm:pl-3 pr-6 sm:pr-7 py-1 sm:py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-900 cursor-pointer transition-colors max-w-[125px] sm:max-w-[165px] truncate"
              >
                <option value="all">{isCorporate ? `Consolidado (${holding.campuses.length} Plantas)` : `Consolidado (${holding.campuses.length} Sedes)`}</option>
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
                title={isCorporate ? "Volver a la consola global de empresas ISkool" : "Volver a la consola global de colegios ISkool"}
              >
                <ChevronLeft size={14} className="text-indigo-600" />
                <span className="hidden sm:inline">{isCorporate ? 'Directorio Empresas' : 'Directorio Colegios'}</span>
              </button>
            )}

            {/* Buscador Rápido (Cmd+K) en Desktop, icono en Móvil */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 p-2 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer active:scale-95"
              title={isCorporate ? "Buscar en el consorcio empresarial (⌘K)" : "Buscar en la red escolar (⌘K)"}
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

            {/* Botón Email Institucional & Triage */}
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
              title="Bandeja de Correo Institucional, Triage Cognitivo y Conexión Google (15 Fases)"
            >
              <Mail size={14} className="text-white" />
              <span className="hidden sm:inline">Email & Triage</span>
              <span className="sm:hidden">Email</span>
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
          <div className="fixed top-20 right-4 sm:right-8 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-100 max-w-[90vw] print:hidden no-print">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* CUERPO PRINCIPAL MODULAR CON TRANSICIÓN INSTANTÁNEA       */}
        {/* ========================================================= */}
        <main className={`flex-1 overflow-y-auto ${activeTab === 'reportes' || activeTab === 'cerebro' ? 'p-2 sm:p-3 md:p-4 pb-4 space-y-2' : 'p-3 sm:p-5 lg:p-8 pb-24 lg:pb-8 space-y-4 sm:space-y-6'} print:h-auto print:overflow-visible print:p-0 print:m-0 print:space-y-0 print:block`}>
          
          {/* BARRA DE MONITOREO, LICENCIA Y DIFERENCIADORES (SOLO EN PESTAÑAS OPERATIVAS / GENERALES) */}
          {activeTab !== 'reportes' && activeTab !== 'cerebro' && (
            <>
              {/* BARRA DE MONITOREO AUTÓNOMO EN VIVO (0 TOKENS) */}
              <div className={`p-3 sm:px-5 sm:py-2.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs border text-xs print:hidden no-print ${
                corporateTheme
                  ? `bg-gradient-to-r ${corporateTheme.activeHeroGrad} text-white border-white/10`
                  : 'bg-slate-900 text-white border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </div>
                  <div>
                    <span className="font-bold text-white">
                      {isCorporate ? 'Telemetría de Planta & Auditoría B2B en Vivo' : 'Motor Autónomo de Análisis en Vivo'}
                    </span>
                    <span className="text-slate-300/80 ml-1.5 font-mono text-[11px] block sm:inline">
                      • 0 Tokens • Evaluación #{autonomousCycle} ({lastEvaluationTime}) • {metrics.totalCampuses} {isCorporate ? 'Plantas / Sedes' : 'Sedes Auditadas'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setAutonomousCycle(c => c + 1);
                      const now = new Date();
                      setLastEvaluationTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
                      triggerToast(`Pulso ejecutado: ${metrics.totalCampuses} ${isCorporate ? 'plantas y sedes' : 'sedes'} auditadas a 0 tokens (${metrics.totalStudents.toLocaleString()} ${isCorporate ? 'colaboradores' : 'alumnos'} evaluados)`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border active:scale-95 ${
                      corporateTheme
                        ? 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                        : 'bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border-slate-700'
                    }`}
                  >
                    <RefreshCw size={12} />
                    <span>Forzar Pulso Analítico</span>
                  </button>
                </div>
              </div>

              {/* TARJETA DE LICENCIA SAAS EMPRESARIAL ISKOOL • TENANT ESCOLAR / CORPORATIVO (IMAGEN 2 FIX) */}
              <div className={`p-4 rounded-2xl border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print:hidden no-print ${
                corporateTheme ? 'bg-white border-slate-200' : 'bg-white border-indigo-100'
              }`}>
                <div className="flex items-center gap-3">
                  {corporateTheme ? (
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 p-1.5">
                      <CorporateOfficialLogo enterpriseId={corporateTheme.id} name={corporateTheme.name} size={46} variant="emblem_only" />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center shrink-0 p-1">
                      <SchoolOfficialLogo
                        schoolId={currentInstitution?.id || schoolId}
                        name={currentInstitution?.name || holding.name}
                        logoUrl={currentInstitution?.logoUrl}
                        themeColors={currentInstitution?.settings?.themeColors}
                        size={46}
                        variant="shield_only"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900">
                        {corporateTheme?.displayName || (isIbime ? 'Instituto Bilingüe IBIME' : (currentInstitution?.name || holding.name))}
                      </h3>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                        corporateTheme 
                          ? corporateTheme.badgeBg
                          : (isIbime 
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : (currentInstitution?.isTestCase 
                                  ? 'bg-purple-100 text-purple-800 border-purple-300' 
                                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'))
                      }`}>
                        {corporateTheme?.planName || currentInstitution?.licensing?.planName || (isIbime ? 'Licencia Institucional Enterprise Multi-Plantel (4 Sedes)' : (currentInstitution?.isTestCase ? 'Licencia Sandbox & Testbed Multi-Plantel' : 'Licencia SaaS Enterprise Activa'))}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        ID: {currentInstitution?.licensing?.licenseKey || (isBmw ? 'ISK-LIC-2026-BMW-CORP-SLP' : isRetail ? 'ISK-LIC-2026-VANG-RETAIL' : `ISK-LIC-2026-${(holding.slug || 'ENT').toUpperCase()}-${holding.campuses.length}CAMPUS`)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="font-semibold text-slate-700">Licenciatario:</span> {corporateTheme?.name || (isIbime ? 'Instituto Bilingüe IBIME' : (currentInstitution?.name || holding.name))} ({holding.campuses.length} {isCorporate ? 'Sedes / Plantas' : 'Planteles'}) • <span className="font-semibold text-slate-700">Software Propietario:</span> {currentInstitution?.licensing?.licensor || 'ISkool Technologies Inc.'} • <span className={`${corporateTheme ? 'text-slate-700 font-medium' : 'text-indigo-600 font-medium'}`}>Asientos: {metrics.totalStudents.toLocaleString()} en uso de {(currentInstitution?.licensing?.contractedSeats || (metrics.totalStudents + (isCorporate ? 483 : 200))).toLocaleString()} contratados ({Math.min(100, Math.round(((metrics.totalStudents) / (currentInstitution?.licensing?.contractedSeats || (metrics.totalStudents + (isCorporate ? 483 : 200)))) * 1000) / 10)}% ocupación)</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-[11px] font-bold text-slate-700">Vigencia Anual: 2026-2027</div>
                    <div className="text-[10px] text-emerald-600 font-semibold">{isCorporate ? '● Facturación CFDI 4.0 B2B Activa' : '● Timbrado CFDI/IEDU 0 Tokens Activo'}</div>
                  </div>
                  <button
                    onClick={() => triggerToast(`✓ Contrato de Licencia SaaS verificado: ${(currentInstitution?.licensing?.contractedSeats || (metrics.totalStudents + (isCorporate ? 483 : 200))).toLocaleString()} asientos autorizados para ${institutionalDisplayName}`)}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <FileCheck2 size={14} />
                    <span>Auditoría de Licencia</span>
                  </button>
                </div>
              </div>

              {/* BARRA DE DIFERENCIADORES ESTRATÉGICOS ISKOOL */}
              <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 text-xs text-white print:hidden no-print ${
                corporateTheme 
                  ? `bg-gradient-to-r ${corporateTheme.activeHeroGrad} border-white/10` 
                  : 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-indigo-500/30'
              }`}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="font-extrabold tracking-wide uppercase text-[11px] text-amber-300">
                    {isCorporate ? 'Diferenciadores Clave Suite Corporativa:' : 'Diferenciadores Clave iSkool Élite:'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {(isCorporate ? [
                    { label: 'Simulador "What-If" EBITDA & OPEX', tab: 'vision', color: 'bg-white/10 text-white border-white/20 hover:bg-white/20' },
                    { label: 'Matriz de Competencias Técnicas', tab: 'academico', color: 'bg-white/10 text-white border-white/20 hover:bg-white/20' },
                    { label: 'Onboarding & Retención de Talento', tab: 'admisiones', color: 'bg-white/10 text-white border-white/20 hover:bg-white/20' },
                    { label: 'Facturación CFDI 4.0 B2B', tab: 'finanzas', color: 'bg-white/10 text-white border-white/20 hover:bg-white/20' },
                    { label: `Cerebro ${corporateTheme?.name || 'Empresarial'}`, tab: 'cerebro', color: 'bg-amber-500/20 text-amber-200 border-amber-400/40 hover:bg-amber-500/30' },
                  ] : [
                    { label: 'Simulador "What-If" EBITDA', tab: 'vision', color: 'bg-indigo-600/40 text-indigo-200 border-indigo-400/40 hover:bg-indigo-600/60' },
                    { label: 'Alineación Oficial SEP NEM 2024', tab: 'academico', color: 'bg-emerald-600/40 text-emerald-200 border-emerald-400/40 hover:bg-emerald-600/60' },
                    { label: 'Gamificación & Lienzo Digital', tab: 'academico', color: 'bg-purple-600/40 text-purple-200 border-purple-400/40 hover:bg-purple-600/60' },
                    { label: 'CFDI 4.0 Complemento IEDU SAT', tab: 'finanzas', color: 'bg-amber-600/40 text-amber-200 border-amber-400/40 hover:bg-amber-600/60' },
                    { label: 'Cerebro Institucional', tab: 'cerebro', color: 'bg-cyan-600/40 text-cyan-200 border-cyan-400/40 hover:bg-cyan-600/60' },
                  ]).map((diff, i) => (
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
            </>
          )}

          {/* ======================================================= */}
          {/* MÓDULO 1: INICIO (CONSOLIDADO MAESTRO)                  */}
          {/* ======================================================= */}
          {activeTab === 'inicio' && (
            <div className="space-y-6 animate-in fade-in duration-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {corporateTheme ? `${corporateTheme.industryName} • Ciclo Operativo 2026-2027` : 'Consola de Mando Corporativo • Ciclo 2026-2027'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                    {selectedCampusId === 'all' 
                      ? (corporateTheme ? `Resumen Ejecutivo Consolidado · ${corporateTheme.name}` : 'Resumen Ejecutivo Consolidado') 
                      : holding.campuses.find(c => c.id === selectedCampusId)?.name}
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
                    "{corporateTheme?.tagline || holding.tagline}" <span className="font-semibold not-italic text-slate-600">— {corporateTheme?.name || holding.name}</span>
                  </div>
                </div>
              </div>

              {/* 5 TARJETAS DE KPIS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {/* KPI 1: Alumnos / Colaboradores */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'students',
                    title: isCorporate ? 'Desglose de Colaboradores por Sede' : 'Desglose de Alumnos por Sede',
                    description: isCorporate 
                      ? 'Plantilla laboral auditada, certificaciones de talento y expediente 360.'
                      : 'Matrícula activa auditada ante la Secretaría de Educación Pública y expediente 360.',
                    targetValue: `${metrics.totalStudents.toLocaleString()}`,
                    unit: isCorporate ? 'Colaboradores activos' : 'Alumnos matriculados'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      {isCorporate ? <Users size={20} /> : <GraduationCap size={20} />}
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {metrics.deltas.students}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalStudents.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{isCorporate ? 'Colaboradores' : 'Alumnos'}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>vs. periodo anterior</span>
                    <span className="text-teal-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 2: Docentes / Instructores */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'teachers',
                    title: isCorporate ? 'Cuerpo de Instructores & Líderes Técnicos' : 'Cuerpo Docente y Asignaciones',
                    description: isCorporate
                      ? 'Plantilla de instructores especializados y facilitadores técnicos.'
                      : 'Plantilla de maestros titulares y adjuntos con ratio de 1:14.4.',
                    targetValue: `${metrics.totalTeachers.toLocaleString()}`,
                    unit: isCorporate ? 'Instructores activos' : 'Docentes activos'
                  })}
                  className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group active:scale-98"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Briefcase size={20} />
                    </div>
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {metrics.deltas.teachers}
                    </span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">
                    {metrics.totalTeachers.toLocaleString()}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{isCorporate ? 'Instructores' : 'Docentes'}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>vs. periodo anterior</span>
                    <span className="text-blue-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 3: Colegios / Empresas */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'campuses',
                    title: isCorporate ? 'Empresas y Plantas Operativas' : 'Sedes y Planteles Operativos',
                    description: isCorporate
                      ? 'Consorcio empresarial con cobertura multirregional y control de plantas.'
                      : 'Red escolar con cobertura multirregional y sincronización de estándares de calidad.',
                    targetValue: `${metrics.totalCampuses}`,
                    unit: isCorporate ? 'Empresas activas' : 'Colegios activos'
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
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{isCorporate ? 'Empresas' : 'Colegios'}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>3 regiones clave</span>
                    <span className="text-indigo-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 4: Admisiones / Reclutamiento */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'admissions',
                    title: isCorporate ? 'Pipeline de Reclutamiento & Onboarding' : 'Pipeline de Admisiones y Matrícula',
                    description: isCorporate
                      ? 'Candidatos en proceso de selección, inducción corporativa y contratación.'
                      : 'Prospectos con diagnóstico psicopedagógico completado y entrevistas agendadas.',
                    targetValue: `${metrics.totalAdmissions}`,
                    unit: isCorporate ? 'Candidatos en pipeline' : 'Prospectos en proceso'
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
                  <div className="text-xs font-medium text-slate-500 mt-0.5">{isCorporate ? 'Candidatos en pipeline' : 'Admisiones en proceso'}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span>vs. mismo periodo</span>
                    <span className="text-purple-600 font-bold group-hover:underline">Ver detalle →</span>
                  </div>
                </div>

                {/* KPI 5: Cobranza */}
                <div 
                  onClick={() => setActiveKPIDrawer({
                    metricKey: 'collection',
                    title: isCorporate ? 'Recuperación de Facturación B2B & Liquidez' : 'Cobranza Consolidada y Eficiencia Financiera',
                    description: isCorporate ? 'Porcentaje de recuperación de facturación B2B frente al umbral objetivo.' : 'Porcentaje de recuperación de colegiaturas frente al umbral objetivo institucional.',
                    targetValue: `${metrics.avgCollection}%`,
                    unit: isCorporate ? 'Facturación B2B' : 'Cobranza global'
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
                              {isCorporate ? 'Cobranza B2B' : 'Cobranza'}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {isCorporate ? '2 sedes en seguimiento (91% y 93%)' : '2 planteles en seguimiento (91% y 93%)'}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-0.5 group-hover:text-rose-600 transition-all" />
                      </div>

                      <div 
                        onClick={() => setActiveFocalModal({
                          isOpen: true,
                          title: isCorporate ? 'Campaña de Retención de Talento Pendiente' : 'Campaña de Reinscripciones Pendiente',
                          description: isCorporate 
                            ? 'Se requiere activar el seguimiento de evaluación y certificaciones técnicas en las sedes operativas.'
                            : 'Se requiere activar el recordatorio vía portal y WhatsApp institucional en Campus San Cristóbal y Campus Coacalco.',
                          campusAffected: isCorporate ? ['Planta Industrial Norte', 'Sede Tecnológica Santa Fe'] : ['Campus San Cristóbal', 'Campus Coacalco'],
                          actionType: isCorporate ? 'retencion' : 'reinscripcion'
                        })}
                        className="p-3.5 rounded-xl border border-slate-100 hover:border-amber-300 hover:bg-amber-50/30 transition-all cursor-pointer flex items-center justify-between group active:scale-98"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                            <UserCheck size={17} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 group-hover:text-amber-700 transition-colors">
                              {isCorporate ? 'Retención & Desempeño' : 'Reinscripciones'}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {isCorporate ? 'Iniciar evaluación formal en 2 plantas' : 'Iniciar campaña formal en 2 planteles'}
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
                          title: isCorporate ? 'Alerta Temprana de Rotación de Instructores' : 'Alerta Temprana de Rotación Docente',
                          description: isCorporate
                            ? 'Se han procesado bajas de instructores técnicos de reemplazo temporal. Cartera de talento activada.'
                            : 'Se han procesado 2 bajas de docentes titulares de reemplazo temporal en Campus Coacalco y Campus San Cristóbal. Bóveda de reemplazo activada.',
                          campusAffected: isCorporate ? ['Planta San Luis', 'Sede Corporativa'] : ['Campus Coacalco', 'Campus San Cristóbal'],
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
                              {isCorporate ? 'Rotación de instructores' : 'Rotación docente'}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5">
                              {isCorporate ? 'Bajas técnicas en proceso de reemplazo' : '3 bajas registradas en el último mes'}
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

                {/* Avance por Colegio / Empresa (4 cols) */}
                <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h2 className="font-bold text-slate-900 text-base">{isCorporate ? 'Desempeño por empresa y planta' : 'Avance por colegio'}</h2>
                        <span className="text-[11px] text-slate-400">{isCorporate ? 'Eficiencia Ponderada Consorcio' : 'Eficiencia Ponderada Holding'}</span>
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
                              <th className="pb-2 text-right">{isCorporate ? 'Colaboradores' : 'Alumnos'}</th>
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
                        {[(isCorporate ? 'Colaboradores' : 'Alumnos'), holding.name.split(' ')[0], 'Procesos', 'Personas', (isCorporate ? 'Plantas' : 'Sedes'), 'SOPs'].map((node, idx) => (
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
                      <span>{isCorporate ? `Bóveda Corporativa ${holding.name}` : `Cerebro Institucional ${holding.name}`}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-tight">
                      {isCorporate ? 'Todo el conocimiento corporativo y operativo, conectado y siempre vivo.' : 'Todo el conocimiento de nuestra red, conectado y siempre vivo.'}
                    </h3>
                    <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                      {isCorporate 
                        ? `Documentos, normativas ISO, matrices de capacitación y procesos operativos de todas nuestras plantas y empresas, en un solo lugar. Propiedad intelectual exclusiva de ${holding.name}.`
                        : `Documentos, procesos, experiencias pedagógicas y aprendizajes de todos nuestros colegios, en un solo lugar. Propiedad intelectual exclusiva de ${holding.name}.`}
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
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{isCorporate ? 'Inversión por Colaborador Activo' : 'Valoración por Alumno Activo'}</span>
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
                  {/* Slider 1: Incremento de Colegiatura / Arancel */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">{isCorporate ? 'Ajuste de Arancel B2B:' : 'Ajuste de Colegiatura:'}</span>
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

                  {/* Slider 3: Retención de Talento / Matrícula */}
                  <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-300">{isCorporate ? 'Meta de Retención de Talento:' : 'Meta de Retención Alumnos:'}</span>
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
                      <span>{isCorporate ? 'Colaboradores retenidos:' : 'Alumnos adicionales:'}</span>
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
                      <span>{isCorporate ? 'Meta 3: Expansión de Plantas & Sedes' : 'Meta 3: Expansión de Planteles'}</span>
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
                    {isCorporate ? 'Consorcio Empresarial' : 'Holding Educativo'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    {isCorporate ? 'Control Integral de Empresas, Plantas & Benchmarking' : 'Control Integral de Planteles & Benchmarking'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isCorporate 
                      ? 'Métricas comparativas de eficiencia, capacidad operativa instalada y directores de planta.'
                      : 'Métricas comparativas de eficiencia, ocupación de cupos y directores de sede.'}
                  </p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download size={14} />
                  <span>{isCorporate ? 'Descargar Matriz de Empresas CSV' : 'Descargar Matriz Multisede CSV'}</span>
                </button>
              </div>

              {/* GRID DE LAS SEDES / PLANTAS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {(isCorporate ? holding.campuses.map((c, i) => ({
                  id: c.id,
                  name: c.name,
                  loc: c.location,
                  dir: `Director de Planta #${i+1}`,
                  rvoe: `RFC: ISK-CORP-${1000 + i}`,
                  cap: Math.round(c.students * 1.2),
                  stu: c.students,
                  tea: c.teachers,
                  col: c.collectionRate,
                  cov: c.curriculumCoverage || 95,
                  ret: c.retentionRate || 96,
                  status: i === 0 ? 'Sede Central' : 'Planta Operativa'
                })) : [
                  { id: 'montes', name: 'Campus Montes (Sede Matriz & CCH)', loc: 'Jardines de Morelos, Ecatepec', dir: 'Lic. Roberto González', rvoe: '15PPR3322G / UNAM 7998', cap: 1800, stu: 1620, tea: 84, col: 95, cov: 96, ret: 97, status: 'Sede Matriz' },
                  { id: 'lagos', name: 'Campus Lagos (Fundador 2004)', loc: 'Jardines de Morelos Secc. Lagos', dir: 'Mtra. Patricia Salmerón', rvoe: '15PJN2222K / 15PPR3657T', cap: 800, stu: 710, tea: 38, col: 96, cov: 95, ret: 96, status: 'Líder en Cobranza' },
                  { id: 'sancristobal', name: 'Campus San Cristóbal', loc: 'Ecatepec Centro (Insurgentes)', dir: 'Dr. Andrés Morales', rvoe: '15PPR4012S / 15PES1240K', cap: 950, stu: 830, tea: 46, col: 93, cov: 94, ret: 95, status: 'Óptimo' },
                  { id: 'coacalco', name: 'Campus Coacalco (Metropolitano)', loc: 'Guadalupe Victoria, Ecatepec-Coacalco', dir: 'Dra. Carmen Del Valle', rvoe: '15PPR5110Z / 15PES1405M', cap: 700, stu: 580, tea: 32, col: 91, cov: 93, ret: 94, status: 'Seguimiento' }
                ]).map((c) => {
                  const occRate = ((c.stu / c.cap) * 100).toFixed(1);
                  return (
                    <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                          <span className="text-xs text-slate-400">{c.loc} • {c.rvoe}</span>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.col >= 95 ? 'bg-emerald-100 text-emerald-800' : c.col >= 90 ? 'bg-indigo-100 text-indigo-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {c.status}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500">
                        {isCorporate ? 'Director de Operaciones / Planta:' : 'Director de Plantel:'} <strong className="text-slate-800 font-semibold">{c.dir}</strong>
                      </div>

                      {/* Barra de Ocupación */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">{isCorporate ? 'Capacidad Operativa Instalada:' : 'Ocupación de Aulas:'}</span>
                          <strong className="text-slate-800 font-mono">{c.stu} / {c.cap} ({occRate}%)</strong>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-slate-900 rounded-full" style={{ width: `${occRate}%` }} />
                        </div>
                      </div>

                      {/* Métricas clave */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">{isCorporate ? 'COBRANZA B2B' : 'COBRANZA'}</span>
                          <span className="text-sm font-black text-slate-900 font-mono">{c.col}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">{isCorporate ? 'COMPETENCIAS' : 'SEP NEM'}</span>
                          <span className="text-sm font-black text-indigo-600 font-mono">{c.cov}%</span>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl">
                          <span className="text-[10px] text-slate-400 block font-bold">{isCorporate ? 'RETENCIÓN TALENTO' : 'RETENCIÓN'}</span>
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
                        {isCorporate ? 'Enfocar Consola en esta Planta' : 'Enfocar Consola en este Plantel'}
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
                    {isCorporate ? 'Capital Humano & Fuerza Laboral' : 'Comunidad Escolar & Capital Humano'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    {isCorporate ? 'Líderes de Formación & Expediente 360 del Colaborador' : 'Cuerpo Docente & Expediente 360 del Alumno'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isCorporate 
                      ? 'Gestión de talento, asignaciones técnicas y auditoría integral de colaboradores.'
                      : 'Gestión de talento, titularidades de aula y auditoría holística de estudiantes.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Search size={14} />
                  <span>{isCorporate ? 'Buscar Colaborador en Expediente 360' : 'Buscar Alumno en Expediente 360'}</span>
                </button>
              </div>

              {/* TARJETAS DE PERSONAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{isCorporate ? 'Total de Colaboradores en Red' : 'Total de Alumnos en Red'}</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{metrics.totalStudents.toLocaleString()}</div>
                  <span className="text-xs text-emerald-600 font-semibold mt-1 block">100% con Expediente 360</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{isCorporate ? 'Cuerpo de Instructores' : 'Cuerpo Docente'}</span>
                  <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">{metrics.totalTeachers} {isCorporate ? 'instructores' : 'maestros'}</div>
                  <span className="text-xs text-slate-500 mt-1 block">{isCorporate ? `Ratio 1:${(metrics.totalStudents / (metrics.totalTeachers || 1)).toFixed(1)} colaborador/instructor` : 'Ratio 1:13.9 alumno/docente'}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">{isCorporate ? 'Cursos Técnicos Cubiertos' : 'Titularidades Cubiertas'}</span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">98.5%</div>
                  <span className="text-xs text-slate-500 mt-1 block">{isCorporate ? 'Plan de cobertura técnica activo' : 'Plan de contingencia activo'}</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Nómina Mensual Plantilla</span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">$12,450,000 MXN</div>
                  <span className="text-xs text-slate-500 mt-1 block">100% dispersión puntual</span>
                </div>
              </div>

              {/* DISTRIBUCIÓN POR NIVEL O ÁREA */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h3 className="text-base font-black text-slate-900">
                  {isCorporate ? 'Distribución de Colaboradores por Área Operativa' : 'Distribución de Matrícula por Nivel Escolar'}
                </h3>
                <div className="space-y-3 text-xs">
                  {(isCorporate ? [
                    { level: 'Operaciones & Manufactura', count: Math.round(metrics.totalStudents * 0.45), pct: 45.0, color: 'bg-indigo-600' },
                    { level: 'Ingeniería & Calidad', count: Math.round(metrics.totalStudents * 0.24), pct: 24.0, color: 'bg-blue-500' },
                    { level: 'Logística & Cadena de Suministro', count: Math.round(metrics.totalStudents * 0.15), pct: 15.0, color: 'bg-emerald-500' },
                    { level: 'Tecnología e Innovación', count: Math.round(metrics.totalStudents * 0.10), pct: 10.0, color: 'bg-purple-600' },
                    { level: 'Administración & Finanzas B2B', count: Math.round(metrics.totalStudents * 0.06), pct: 6.0, color: 'bg-amber-500' }
                  ] : [
                    { level: 'Maternal y Guardería', count: 420, pct: 5.4, color: 'bg-teal-500' },
                    { level: 'Preescolar (Fase 2)', count: 1120, pct: 14.5, color: 'bg-emerald-500' },
                    { level: 'Primaria Inferior y Superior (Fases 3, 4 y 5)', count: 3450, pct: 44.6, color: 'bg-indigo-600' },
                    { level: 'Secundaria Oficial SEP (Fase 6)', count: 1890, pct: 24.5, color: 'bg-purple-600' },
                    { level: 'Bachillerato y Preparatoria', count: 846, pct: 11.0, color: 'bg-amber-500' }
                  ]).map((lvl, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-800">{lvl.level}</span>
                        <span className="font-mono text-slate-600">{lvl.count.toLocaleString()} {isCorporate ? 'colaboradores' : 'alumnos'} ({lvl.pct}%)</span>
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
                    {isCorporate ? 'Matriz de Competencias Laborales B2B' : 'Diferenciador Pedagógico Exclusivo iSkool'}
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                    {isCorporate ? 'Matriz de Competencias Laborales & Certificaciones Técnicas' : 'Auditoría Curricular NEM 2024 & Maestría Gamificada'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isCorporate 
                      ? 'Alineación a estándares técnicos, planes de formación y métricas de desempeño del colaborador.' 
                      : 'Alineación a Fases SEP, planeaciones cronometradas de aula y métricas de XP estudiantil.'}
                  </p>
                </div>
                <button
                  onClick={() => setIsBrainModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Network size={14} />
                  <span>{isCorporate ? 'Consultar Bóveda Corporativa' : 'Consultar Bóveda Curricular'}</span>
                </button>
              </div>

              {/* COBERTURA POR FASES NEM 2024 / NIVELES DE COMPETENCIA TÉCNICA */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                      <span>{isCorporate ? 'Mapa de Niveles de Competencia Técnica & Habilidades Laborales' : 'Mapa de Cobertura Curricular SEP por Fases (NEM 2024)'}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full hidden sm:inline-block">
                        Interactivo · Clic para auditar
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isCorporate 
                        ? 'Auditoría de cumplimiento de estándares operativos, certificaciones y competencias por puesto.' 
                        : 'Haz clic en cualquier fase para auditar la fórmula de cálculo del porcentaje y consultar sus funciones pedagógicas.'}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                    Promedio Red: {metrics.avgCurriculum}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 text-center text-xs">
                  {(isCorporate ? [
                    { fase: 'Nivel 1', name: 'Onboarding & Inducción', pct: 98, status: 'Excelente' },
                    { fase: 'Nivel 2', name: 'Operación Básica & SST', pct: 96, status: 'Excelente' },
                    { fase: 'Nivel 3', name: 'Especialización Técnica', pct: 95, status: 'Óptimo' },
                    { fase: 'Nivel 4', name: 'Calidad & Procesos', pct: 94, status: 'Óptimo' },
                    { fase: 'Nivel 5', name: 'Liderazgo & Supervisión', pct: 93, status: 'Óptimo' },
                    { fase: 'Nivel 6', name: 'Innovación & Dirección', pct: 91, status: 'Alerta Preventiva' }
                  ] : [
                    { fase: 'Fase 1', name: 'Inicial', pct: 98, status: 'Excelente' },
                    { fase: 'Fase 2', name: 'Preescolar', pct: 96, status: 'Excelente' },
                    { fase: 'Fase 3', name: '1° y 2° Primaria', pct: 95, status: 'Óptimo' },
                    { fase: 'Fase 4', name: '3° y 4° Primaria', pct: 94, status: 'Óptimo' },
                    { fase: 'Fase 5', name: '5° y 6° Primaria', pct: 93, status: 'Óptimo' },
                    { fase: 'Fase 6', name: 'Secundaria', pct: 91, status: 'Alerta Preventiva' }
                  ]).map((f, i) => (
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

              {/* DIFERENCIADOR DE GAMIFICACIÓN / CAPACITACIÓN B2B */}
              <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg border border-purple-500/30 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600/40 text-purple-300 flex items-center justify-center border border-purple-500/40">
                    <Gamepad2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      {isCorporate ? 'Métricas de Capacitación & Acreditación de Habilidades' : 'Métricas de Gamificación & Engagement Estudiantil'}
                    </h3>
                    <p className="text-xs text-purple-200">
                      {isCorporate 
                        ? 'El factor que incrementa la productividad laboral y el apego al plan de carrera.' 
                        : 'El factor que triplica la retención de alumnos y la satisfacción de padres de familia.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">
                      {isCorporate ? 'Horas de Capacitación' : 'XP Total Otorgado'}
                    </span>
                    <div className="text-2xl font-black text-white font-mono mt-1">
                      {isCorporate ? '14,850 hrs' : '1,480,250 XP'}
                    </div>
                    <span className="text-[11px] text-purple-300 mt-1 block">
                      {isCorporate ? 'Cursos y talleres completados' : 'Por logros pedagógicos'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">
                      {isCorporate ? 'Módulos Acreditados' : 'Misiones Completadas'}
                    </span>
                    <div className="text-2xl font-black text-amber-400 font-mono mt-1">14,820</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">
                      {isCorporate ? 'En planta y plataforma técnica' : 'En aula y Lienzo Digital'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">
                      {isCorporate ? 'Personal Altamente Calificado' : 'Alumnos Rango Élite'}
                    </span>
                    <div className="text-2xl font-black text-emerald-400 font-mono mt-1">18.4%</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">
                      {isCorporate ? 'Especialistas Senior / Maestría Técnica' : 'Nivel Leyenda / Maestro'}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-900/60 rounded-2xl border border-purple-500/30">
                    <span className="text-[10px] text-purple-300 font-bold uppercase block">
                      {isCorporate ? 'Simuladores & Prácticas' : 'Lienzos Digitales'}
                    </span>
                    <div className="text-2xl font-black text-cyan-400 font-mono mt-1">8,450</div>
                    <span className="text-[11px] text-purple-300 mt-1 block">
                      {isCorporate ? 'Evaluaciones prácticas ejecutadas' : 'Actividades interactivas'}
                    </span>
                  </div>
                </div>

                {/* DISTRIBUCIÓN DE RANGOS / ESCALAFÓN DE COMPETENCIAS */}
                <div className="pt-3 border-t border-purple-800/40">
                  <div className="text-xs font-bold text-purple-200 mb-2">
                    {isCorporate ? 'Escalafón de Habilidades Técnicas y Progresión Laboral:' : 'Escalafón de Maestría y Progresión por Rango:'}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-purple-300 block">{isCorporate ? 'Operativo Base' : 'Novato (0-500 XP)'}</span>
                      <span className="font-mono text-white font-black text-sm">6.6%</span>
                      <span className="text-[9px] text-slate-400 block">{isCorporate ? 'Inducción' : 'Inducción'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-blue-300 block">{isCorporate ? 'Técnico Junior' : 'Aprendiz (501-2K)'}</span>
                      <span className="font-mono text-white font-black text-sm">19.8%</span>
                      <span className="text-[9px] text-slate-400 block">{isCorporate ? 'En desarrollo' : 'En desarrollo'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-teal-300 block">{isCorporate ? 'Técnico Especialista' : 'Maestro (2K-5K)'}</span>
                      <span className="font-mono text-white font-black text-sm">31.0%</span>
                      <span className="text-[9px] text-slate-400 block">{isCorporate ? 'Autonomía' : 'Autonomía'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-amber-300 block">{isCorporate ? 'Líder Técnico' : 'Élite (5K-10K)'}</span>
                      <span className="font-mono text-white font-black text-sm">24.2%</span>
                      <span className="text-[9px] text-slate-400 block">{isCorporate ? 'Alto impacto' : 'Alto impacto'}</span>
                    </div>
                    <div className="p-2 rounded-xl bg-purple-900/40 border border-purple-500/20">
                      <span className="font-bold text-emerald-300 block">{isCorporate ? 'Master Trainer / Senior' : 'Leyenda (>10K)'}</span>
                      <span className="font-mono text-white font-black text-sm">18.4%</span>
                      <span className="text-[9px] text-slate-400 block">{isCorporate ? 'Excelencia' : 'Excelencia'}</span>
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
                      <span className="text-xs text-slate-400 font-semibold">• {isCorporate ? 'Estándares STPS / ISO' : 'SEP NEM 2024'}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                      {isCorporate ? 'Cobertura y Balance por los 4 Ejes de Competencia Laboral' : 'Cobertura y Equilibrio por los 4 Campos Formativos Oficiales'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isCorporate 
                        ? 'Supervisión en tiempo real de planes de formación técnica, horas hombre de capacitación y avance por planta.' 
                        : 'Supervisión en tiempo real de proyectos comunitarios, horas cronometradas de aula y avance por sede.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <span className="text-[11px] font-bold text-slate-500 pl-2">{isCorporate ? 'Planta:' : 'Sede:'}</span>
                      <select
                        value={curriculumRadarCampus}
                        onChange={(e) => {
                          setCurriculumRadarCampus(e.target.value);
                          triggerToast(`Radar Curricular: Mostrando datos de ${e.target.options[e.target.selectedIndex].text}`);
                        }}
                        className="bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 px-2.5 py-1 focus:outline-none cursor-pointer shadow-2xs"
                      >
                        <option value="consolidado">{isCorporate ? 'Consolidado Red (5 Plantas/Empresas)' : 'Consolidado Red (5 Sedes)'}</option>
                        <option value="montes">{isCorporate ? 'Planta Sede Central' : 'Campus Montes (Sede Matriz & CCH)'}</option>
                        <option value="lagos">{isCorporate ? 'Planta Bajío (Operaciones)' : 'Campus Lagos (Fundador 2004)'}</option>
                        <option value="sancristobal">{isCorporate ? 'Planta Monterrey (Norte)' : 'Campus San Cristóbal'}</option>
                        <option value="coacalco">{isCorporate ? 'Sede Corporativa CDMX' : 'Campus Coacalco'}</option>
                      </select>
                    </div>

                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 shrink-0">
                      {isCorporate ? '480 Módulos Auditados' : '480 Proyectos Auditados'}
                    </span>
                  </div>
                </div>

                {/* COMPUTO DINÁMICO DE RADAR METRICS SEGÚN SEDE */}
                {(() => {
                  const radarValues = {
                    consolidado: { lenguajes: 96.2, saberes: 94.8, etica: 93.5, humano: 95.1, target: 90, name: isCorporate ? 'Consolidado Corporativo B2B' : 'Consolidado Red IBIME' },
                    montes: { lenguajes: 97.5, saberes: 96.2, etica: 95.0, humano: 96.0, target: 90, name: isCorporate ? 'Planta Sede Central' : 'Campus Montes' },
                    lagos: { lenguajes: 96.8, saberes: 95.5, etica: 94.2, humano: 95.5, target: 90, name: isCorporate ? 'Planta Bajío' : 'Campus Lagos' },
                    sancristobal: { lenguajes: 94.5, saberes: 93.8, etica: 92.5, humano: 94.0, target: 90, name: isCorporate ? 'Planta Monterrey' : 'Campus San Cristóbal' },
                    coacalco: { lenguajes: 93.8, saberes: 92.6, etica: 91.5, humano: 93.2, target: 90, name: isCorporate ? 'Sede Corporativa CDMX' : 'Campus Coacalco' },
                  }[curriculumRadarCampus] || { lenguajes: 96.2, saberes: 94.8, etica: 93.5, humano: 95.1, target: 90, name: isCorporate ? 'Consolidado Corporativo B2B' : 'Consolidado Red IBIME' };

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
                        
                        {/* CARD 1: LENGUAJES / COMUNICACIÓN (Emerald / Cyan) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                  {isCorporate ? 'Comunicación & Liderazgo' : 'Lenguajes'}
                                </h4>
                              </div>
                              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                {isCorporate ? 'Habilidades Blandas & Idiomas' : 'Emerald / Bilingüe'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                {isCorporate ? '45 hrs/mes' : '45 mins/aula'}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">
                                {isCorporate ? '142 Módulos' : '142 Proyectos'}
                              </span>
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
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Comunicación Corporativa & Negociación' : 'Español & Literatura'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">97.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '97.4%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Inglés de Negocios & Técnico' : 'Inglés Bilingüe (Cambridge)'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">95.1%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-cyan-500 rounded-full" style={{ width: '95.1%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Cultura Organizacional & Marca' : 'Expresión Artística & Cultura'}
                              </span>
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

                        {/* CARD 2: ÉTICA / NORMATIVA & SEGURIDAD (Amethyst / Purple) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                  {isCorporate ? 'Normativa & Seguridad Industrial' : 'Ética y Sociedades'}
                                </h4>
                              </div>
                              <span className="text-[11px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                {isCorporate ? 'Compliance, STPS & ISO' : 'Amethyst / Historia & Cívica'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                {isCorporate ? '40 hrs/mes' : '40 mins/aula'}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">
                                {isCorporate ? '114 Módulos' : '114 Proyectos'}
                              </span>
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
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Seguridad e Higiene Industrial STPS' : 'Conciencia Histórica de México'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">94.2%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: '94.2%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Sustentabilidad Ambiental & ESG' : 'Sustentabilidad Ecológica'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">92.1%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '92.1%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Código de Ética & Anticorrupción' : 'Ética & Responsabilidad Social'}
                              </span>
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
                            {isCorporate ? 'Balance de Competencias' : 'Balance Curricular Holístico'}
                          </span>
                          <h4 className="text-base font-black text-slate-900 tracking-tight">
                            {isCorporate ? 'Radar de Competencias Laborales' : 'Radar de Cobertura Integral'}
                          </h4>
                          <p className="text-xs text-slate-400">
                            {isCorporate ? `${radarValues.name} • Matriz de Competencias B2B` : `${radarValues.name} • Modelo Analítico SEP NEM 2024`}
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
                              {isCorporate ? 'COMUNICACIÓN' : 'LENGUAJES'} ({radarValues.lenguajes}%)
                            </text>
                            <text x="290" y="164" textAnchor="start" className="text-[10px] font-black fill-blue-800">
                              {isCorporate ? 'TÉCNICA & DIGITAL' : 'SABERES'} ({radarValues.saberes}%)
                            </text>
                            <text x={rcx} y="304" textAnchor="middle" className="text-[10px] font-black fill-purple-800">
                              {isCorporate ? 'NORMATIVA' : 'ÉTICA'} ({radarValues.etica}%)
                            </text>
                            <text x="30" y="164" textAnchor="end" className="text-[10px] font-black fill-amber-800">
                              {isCorporate ? 'CAPITAL HUMANO' : 'HUMANO'} ({radarValues.humano}%)
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
                            {isCorporate 
                              ? 'Equilibrio formativo homogéneo sin brechas de competencia laboral.' 
                              : 'Equilibrio curricular homogéneo sin concavidades de riesgo pedagógico.'}
                          </span>
                        </div>
                      </div>

                      {/* ========================================================= */}
                      {/* COLUMNA 3 (DERECHA): SABERES & DE LO HUMANO               */}
                      {/* ========================================================= */}
                      <div className="lg:col-span-4 space-y-5">
                        
                        {/* CARD 3: SABERES / COMPETENCIA TÉCNICA (Sapphire / Sky) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                  {isCorporate ? 'Competencia Técnica & Digital' : 'Saberes y Ciencias'}
                                </h4>
                              </div>
                              <span className="text-[11px] text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                {isCorporate ? 'Operación, TI & Automatización' : 'Sapphire / Matemáticas & STEAM'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                {isCorporate ? '52 hrs/mes' : '52 mins/aula'}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">
                                {isCorporate ? '138 Módulos' : '138 Proyectos'}
                              </span>
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
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Operaciones Industriales & Mantenimiento' : 'Pensamiento Lógico-Matemático'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">96.0%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 rounded-full" style={{ width: '96.0%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Control de Calidad & Métodos de Medición' : 'Indagación Científica & Biología'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">93.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-sky-500 rounded-full" style={{ width: '93.4%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Herramientas Digitales & Automatización' : 'Robótica, IA & Alfabetización Digital'}
                              </span>
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

                        {/* CARD 4: DE LO HUMANO / DESARROLLO & BIENESTAR (Amber / Orange) */}
                        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                  {isCorporate ? 'Desarrollo Humano & Clima Laboral' : 'De lo Humano'}
                                </h4>
                              </div>
                              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md mt-1 inline-block">
                                {isCorporate ? 'Bienestar & Trabajo en Equipo' : 'Amber / Socioemocional & Deporte'}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                {isCorporate ? '44 hrs/mes' : '44 mins/aula'}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5 font-bold">
                                {isCorporate ? '126 Módulos' : '126 Proyectos'}
                              </span>
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
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Salud Ocupacional & Ergonomía' : 'Autonomía & Salud Emocional'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">96.4%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-500 rounded-full" style={{ width: '96.4%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Clima Organizacional & Resiliencia' : 'Convivencia & Cultura de Paz'}
                              </span>
                              <span className="font-mono font-bold text-slate-800">94.5%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: '94.5%' }} />
                            </div>

                            <div className="flex justify-between items-center text-[11px]">
                              <span className="text-slate-600 font-medium">
                                {isCorporate ? 'Liderazgo Efectivo & Gestión de Equipos' : 'Desarrollo Motriz & Educación Física'}
                              </span>
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
              {!isCorporate && admissionsViewMode === 'crm_studio' ? (
                <div className="space-y-4">
                  {/* BARRA DIRECTIVA DE INTEGRACIÓN CRM 360° */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 p-4 rounded-3xl text-white shadow-md border border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-xl shrink-0">
                        📋
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-black text-white tracking-wide">
                            CRM Unificado 360° • Admisiones & Captación Institucional
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                            Sede: {selectedCampusName}
                          </span>
                        </div>
                        <p className="text-xs text-purple-200/80 mt-0.5">
                          Kanban ágil, expediente familiar 1:N (apellidos SEP), WhatsApp directo, y corresponsabilidad de 5 departamentos escolares.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setAdmissionsViewMode('bento_kanban')}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                        title="Volver a la vista Bento ejecutiva con Kanban integrado"
                      >
                        <Layers size={13} />
                        Tablero Bento Directivo
                      </button>
                      <Link
                        href="/admin/crm"
                        target="_blank"
                        className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-xs active:scale-95 flex items-center gap-1.5"
                        title="Abrir CRM en pantalla completa independiente"
                      >
                        <ExternalLink size={13} />
                        Pantalla Completa
                      </Link>
                    </div>
                  </div>

                  <CrmAdmissionsStudio
                    initialCampus={selectedCampusId}
                    initialTab="institutional"
                    embeddedInDashboard={true}
                    onBackToDashboard={() => setAdmissionsViewMode('bento_kanban')}
                    onSwitchToOperational={onSwitchToOperational}
                  />
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-md">
                          {isCorporate ? 'Atracción & Headhunting' : 'Crecimiento & Matrícula Nueva'}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                          {isCorporate ? 'Ejercicio 2026-2027' : 'Ciclo 2026-2027'}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          0 Tokens
                        </span>
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1.5">
                        {isCorporate ? 'Pipeline de Atracción de Talento & Onboarding' : 'Embudo de Admisiones & Pipeline de Captación'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {isCorporate 
                          ? `Monitoreo en tiempo real del ciclo de reclutamiento y contratación consolidado para ${selectedCampusName}.`
                          : `Monitoreo en tiempo real del ciclo de ventas escolares consolidado para ${selectedCampusName}.`}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      {!isCorporate && (
                        <button
                          onClick={() => setAdmissionsViewMode('crm_studio')}
                          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                          title="Abrir estudio completo de admisiones con tareas y finanzas"
                        >
                          <Sparkles size={16} />
                          ⚡ Estudio CRM 360°
                        </button>
                      )}

                      <button
                        onClick={() => setIsAddProspectModalOpen(true)}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95"
                      >
                        <UserPlus size={16} />
                        + {isCorporate ? 'Registrar Candidato al Pipeline' : 'Registrar Aspirante al Pipeline'}
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
                    {isCorporate ? `Directorio de Candidatos (${prospectsList.length})` : `Directorio del Pipeline (${prospectsList.length} Familias)`}
                  </button>

                  <button
                    onClick={() => {
                      if (onSwitchToOperational) {
                        onSwitchToOperational();
                      } else {
                        triggerToast(isCorporate ? "Redirigiendo a Consola de Gestión de Personal..." : "Redirigiendo a Vista Operativa de Control Escolar...");
                      }
                    }}
                    className="px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                    title={isCorporate ? "Saltar a la gestión operativa de colaboradores y áreas en Consola Corporativa" : "Saltar a la gestión operativa de alumnos y grupos en Control Escolar"}
                  >
                    {isCorporate ? <Building2 size={16} className="text-indigo-600" /> : <School size={16} className="text-indigo-600" />}
                    {isCorporate ? "Consola Operativa Corporativa" : "Control Escolar Operativo"}
                    <ArrowUpRight size={14} className="text-slate-400" />
                  </button>
                </div>
              </div>

              {/* TELEMETRÍA EN VIVO DE OCUPACIÓN Y META DE ASIENTOS CONTRATADOS (IBIME 2026-2027) */}
              {!isCorporate && livePipelineMetrics && (
                <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white border border-emerald-500/30 shadow-lg space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        🎯 Meta de Matrícula 2026-2027
                      </div>
                      <h3 className="text-base font-black text-white mt-1">
                        Proyección de Ocupación: {livePipelineMetrics.capacity.currentOccupiedSeats.toLocaleString('es-MX')} / {livePipelineMetrics.capacity.totalPhysicalSeats.toLocaleString('es-MX')} Asientos
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Meta Estratégica: <strong className="text-emerald-300">{livePipelineMetrics.capacity.targetSeats.toLocaleString('es-MX')} Asientos</strong> ({livePipelineMetrics.capacity.targetProgressPercent}% alcanzado) • Sede: <strong>{livePipelineMetrics.campusName}</strong>
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Brecha a la Meta</span>
                        <span className="text-lg font-black text-amber-300 font-mono">
                          {livePipelineMetrics.capacity.seatsRemainingToTarget > 0 ? `${livePipelineMetrics.capacity.seatsRemainingToTarget} asientos` : 'Meta Lograda ✓'}
                        </span>
                      </div>
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-xl shrink-0 font-mono font-black text-emerald-300">
                        {livePipelineMetrics.capacity.occupancyPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Barra de Progreso de Ocupación */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Ocupación Física Total: {livePipelineMetrics.capacity.occupancyPercent}%</span>
                      <span>Capacidad Total: {livePipelineMetrics.capacity.totalPhysicalSeats.toLocaleString('es-MX')} asientos</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden border border-slate-700">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, livePipelineMetrics.capacity.occupancyPercent)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Reinscritos Base: {livePipelineMetrics.capacity.baseEnrolledSeats.toLocaleString('es-MX')}</span>
                      <span>Nuevo Ingreso CRM (Fase 5): +{livePipelineMetrics.capacity.newlyEnrolledFromCrm}</span>
                      <span>Meta Anual: {livePipelineMetrics.capacity.targetSeats.toLocaleString('es-MX')} (3,740 IBIME)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* ARQUITECTURA DE DATOS: ¿QUIÉN ALIMENTA Y REPORTA CADA ETAPA? */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 rounded-3xl text-white border border-indigo-500/20 shadow-lg space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      <Layers size={12} />
                      {isCorporate ? 'Flujo de Atracción y Talento' : 'Flujo Operativo Institucional'}
                    </div>
                    <h3 className="text-base font-black text-white mt-1">
                      {isCorporate ? '¿Dónde se registra esta información y qué área es responsable?' : '¿Dónde se llena esta información y quién es responsable de reportarla?'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {isCorporate 
                        ? 'El embudo no se captura manualmente: es el resultado de 5 departamentos corporativos:'
                        : 'El embudo no se captura manualmente de manera aislada: es el resultado sincronizado de 5 departamentos escolares:'}
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
                        <span className="text-[10px] font-black text-purple-300 uppercase">
                          {isCorporate ? 'Fase 1 · Vacante' : 'Fase 1 · Lead'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {isCorporate ? 'Atracción & Headhunting' : 'Captación & CRM'}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {isCorporate 
                          ? 'Postulación de candidato, canal de origen y datos de contacto profesional.'
                          : 'Registro del aspirante, canal de origen y datos de contacto del tutor.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-purple-500/20 space-y-1">
                      <div className="text-[10px] text-purple-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">
                        {isCorporate ? 'Reclutamiento & Talento' : 'Admisiones & Marketing'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-purple-950/60 p-1.5 rounded border border-purple-800/40">
                        {isCorporate ? 'Portal de Empleo, LinkedIn o botón "+ Registrar Candidato"' : 'Landing Web, Ferias o botón "+ Registrar Aspirante"'}
                      </div>
                    </div>
                  </div>

                  {/* FASE 2 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-indigo-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-300 uppercase">
                          {isCorporate ? 'Fase 2 · Entrevista' : 'Fase 2 · Visita'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {isCorporate ? 'Entrevista Inicial' : 'Tours de Campus'}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {isCorporate 
                          ? 'Filtro inicial, revisión de perfil y visita a instalaciones operativas.'
                          : 'Asistencia y recorrido presencial de aulas STEAM, laboratorios y canchas.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-indigo-500/20 space-y-1">
                      <div className="text-[10px] text-indigo-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">
                        {isCorporate ? 'Capital Humano & Operaciones' : 'Dirección de Campus & RRPP'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-indigo-950/60 p-1.5 rounded border border-indigo-800/40">
                        {isCorporate ? 'Agenda de Entrevistas / Directorio de Talento' : 'Agenda de Visitas / Directorio de Pipeline'}
                      </div>
                    </div>
                  </div>

                  {/* FASE 3 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-blue-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-blue-300 uppercase">
                          {isCorporate ? 'Fase 3 · Evaluación' : 'Fase 3 · Evaluación'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {isCorporate ? 'Pruebas Técnicas' : 'Diagnóstico'}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {isCorporate 
                          ? 'Evaluación técnica por puesto, psicometría y verificación de referencias.'
                          : 'Evaluación cognitiva, socioemocional y entrevista familiar de admisión.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-blue-500/20 space-y-1">
                      <div className="text-[10px] text-blue-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">
                        {isCorporate ? 'Líderes de Área / Especialistas' : 'Gabinete Psicopedagógico'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-blue-950/60 p-1.5 rounded border border-blue-800/40">
                        {isCorporate ? 'Expediente de Evaluación Técnica y Psicométrica' : 'Expediente Diagnóstico Psicopedagógico'}
                      </div>
                    </div>
                  </div>

                  {/* FASE 4 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-teal-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-teal-300 uppercase">
                          {isCorporate ? 'Fase 4 · Oferta' : 'Fase 4 · Reserva'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-teal-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {isCorporate ? 'Propuesta Económica' : 'Carta de Asignación'}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {isCorporate 
                          ? 'Carta oferta formal con sueldo, prestaciones y fecha de ingreso.'
                          : 'Reserva formal de cupo en grado y grupo escolar con vigencia estipulada.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-teal-500/20 space-y-1">
                      <div className="text-[10px] text-teal-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">
                        {isCorporate ? 'Dirección de Operaciones / Finanzas' : 'Dirección Académica'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-teal-950/60 p-1.5 rounded border border-teal-800/40">
                        {isCorporate ? 'Comité Directivo de Contratación' : 'Comité Directivo de Asignación Escolar'}
                      </div>
                    </div>
                  </div>

                  {/* FASE 5 */}
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-emerald-500/30 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-emerald-300 uppercase">
                          {isCorporate ? 'Fase 5 · Contratado' : 'Fase 5 · Matrícula'}
                        </span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      </div>
                      <h4 className="text-xs font-bold text-white mt-1">
                        {isCorporate ? 'Alta & Onboarding' : 'Inscripción Pagada'}
                      </h4>
                      <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                        {isCorporate 
                          ? 'Firma de contrato, alta IMSS/SAT, entrega de equipo y onboarding.'
                          : 'Conciliación de pago, CFDI 4.0 IEDU SAT y alta en matrícula SEP.'}
                      </p>
                    </div>
                    <div className="pt-2 border-t border-emerald-500/20 space-y-1">
                      <div className="text-[10px] text-emerald-300 font-semibold">¿Quién reporta?</div>
                      <div className="text-[11px] text-white font-medium">
                        {isCorporate ? 'Recursos Humanos & Nóminas' : 'Caja, Tesorería & Control Escolar'}
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold mt-1">¿Dónde se llena?</div>
                      <div className="text-[10px] text-slate-300 bg-emerald-950/60 p-1.5 rounded border border-emerald-800/40">
                        {isCorporate ? 'Módulo de Facturación B2B + Padrón de Colaboradores Activos' : 'Módulo Cobranza SPEI + Padrón de Alumnos'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLERO KANBAN DE 5 FASES CORRESPONSABLES (BENTO PIPELINE 360°) */}
              <BentoAdmissionsKanban
                selectedCampusId={selectedCampusId}
                selectedCampusName={selectedCampusName}
                isCorporate={isCorporate}
                schoolId={corporateTheme?.id || schoolId}
                corporateEnterpriseId={corporateTheme?.id}
                corporateEnterpriseName={corporateTheme?.name}
                onOpenRegisterModal={() => setIsAddProspectModalOpen(true)}
                onOpenDirectory={() => {
                  setProspectFilterStage('all');
                  setProspectFilterCampus(selectedCampusId);
                  setIsAdmissionsPipelineOpen(true);
                }}
                onTriggerToast={triggerToast}
              />

              {/* EMBUDO GRÁFICO INTERACTIVO */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      {isCorporate ? 'Embudo de Reclutamiento & Conversión (Pipeline en Vivo)' : 'Embudo Gráfico de Conversión (Funnel en Vivo)'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {isCorporate 
                        ? 'Haz clic en cualquier fase para inspeccionar los candidatos en esa etapa.'
                        : 'Haz clic en cualquier fase para inspeccionar las familias aspirantes en esa etapa.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">{isCorporate ? 'Planta filtrada:' : 'Sede filtrada:'}</span>
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
                            <span className="text-base font-black text-slate-900">{s.count} {isCorporate ? 'candidatos' : 'familias'}</span>
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

              {/* CANALES DE CAPTACIÓN / ATRACCIÓN */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">
                    {isCorporate ? 'Recomendación Interna' : 'Recomendación Familiar'}
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1 font-mono">52%</div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {isCorporate ? 'Programa de referidos por colaboradores' : 'Boca a boca de padres actuales'}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">
                    {isCorporate ? 'Bolsas de Empleo & Redes' : 'Canales Digitales & Web'}
                  </span>
                  <div className="text-2xl font-black text-indigo-600 mt-1 font-mono">34%</div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {isCorporate ? 'LinkedIn, plataformas y portal de vacantes' : 'Campañas de captación digital'}
                  </span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 text-center shadow-xs">
                  <span className="text-xs font-bold text-slate-400 block uppercase">
                    {isCorporate ? 'Convenios con Universidades' : 'Convenios Corporativos'}
                  </span>
                  <div className="text-2xl font-black text-emerald-600 mt-1 font-mono">14%</div>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {isCorporate ? 'Alianzas y semilleros técnicos' : 'Alianzas con empresas locales'}
                  </span>
                </div>
              </div>

              {/* VELOCIDAD DE CONVERSIÓN & VALOR DEL PIPELINE */}
              <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 rounded-3xl text-white border border-purple-500/30 space-y-4 shadow-lg">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/50 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">
                      {isCorporate ? 'Eficiencia de Contratación & Atracción de Talento' : 'Eficiencia Comercial & Captación Escolar'}
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">
                      {isCorporate 
                        ? 'Velocidad de Reclutamiento: 9.5 Días Promedio de Contratación' 
                        : 'Velocidad del Pipeline: 9.5 Días Promedio de Conversión'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-purple-300 block">
                      {isCorporate ? 'Inversión en Nuevas Posiciones:' : 'Valor Pipeline 2026-2027:'}
                    </span>
                    <span className="text-2xl font-black text-emerald-400 font-mono">
                      {isCorporate ? '$4,180,000 MXN' : formatMXN(livePipelineMetrics.financial.projectedPipelineValueMXN || 4180000)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">
                      {isCorporate ? 'Contacto / Filtro CV' : 'Contacto Inicial'}
                    </span>
                    <span className="text-lg font-black text-white font-mono mt-0.5">&lt; 24 hrs</span>
                    <span className="text-[10px] text-emerald-400 block">98% efectividad</span>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">
                      {isCorporate ? 'Entrevista a Prueba' : 'Tour a Diagnóstico'}
                    </span>
                    <span className="text-lg font-black text-white font-mono mt-0.5">2.1 días</span>
                    <span className="text-[10px] text-slate-400 block">
                      {isCorporate ? 'Técnica / Psicométrica' : 'Psicopedagógico'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">
                      {isCorporate ? 'Dictamen a Oferta' : 'Dictamen a Asignación'}
                    </span>
                    <span className="text-lg font-black text-white font-mono mt-0.5">1.4 días</span>
                    <span className="text-[10px] text-indigo-300 block">
                      {isCorporate ? 'Comité de contratación' : 'Comité directivo'}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/70 rounded-xl border border-purple-500/20">
                    <span className="text-[10px] text-purple-300 block">
                      {isCorporate ? 'Cierre y Contrato' : 'Cierre y Pago'}
                    </span>
                    <span className="text-lg font-black text-emerald-400 font-mono mt-0.5">2.8 días</span>
                    <span className="text-[10px] text-slate-400 block">
                      {isCorporate ? 'Alta inmediata' : 'SPEI instantáneo'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-purple-200">
                    {isCorporate 
                      ? 'El ciclo promedio de contratación técnica en la industria es de 25 días. Reducimos los tiempos en más del 60%.'
                      : 'El ciclo promedio del mercado mexicano es de 22 días. iSkool reduce los tiempos en más del 56%.'}
                  </span>
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
                      {isCorporate ? 'Ver Directorio de Candidatos' : 'Ver Directorio de Aspirantes'}
                    </button>
                    <button
                      onClick={() => setIsAddProspectModalOpen(true)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-purple-200 hover:text-white font-bold rounded-xl border border-purple-400/30 transition-all cursor-pointer whitespace-nowrap active:scale-95 flex items-center gap-1.5"
                    >
                      <UserPlus size={14} />
                      + {isCorporate ? 'Registrar Candidato' : 'Registrar Aspirante'}
                    </button>
                  </div>
                </div>
              </div>
              </div>
            )}
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
                    {isCorporate ? 'Control de Cobranza & Facturación B2B' : 'Control de Cobranza & Facturación CFDI 4.0 con Complemento IEDU'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isCorporate 
                      ? 'Antigüedad de saldos corporativos, facturación CFDI 4.0 B2B y ledger fiscal inmutable.'
                      : 'Antigüedad de saldos, deducción de colegiaturas para padres y ledger fiscal inmutable.'}
                  </p>
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
                  <span className="text-xs text-slate-500 mt-1 block">{isCorporate ? '5 Plantas / Empresas consolidadas' : '5 Sedes consolidadas'}</span>
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
                <h3 className="text-base font-black text-slate-900">
                  {isCorporate ? 'Antigüedad de Saldos Corporativos B2B (Aging Buckets)' : 'Antigüedad de Saldos de Colegiaturas (Aging Buckets)'}
                </h3>
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

              {/* DIFERENCIADOR FISCAL SAT IEDU / SERVICIOS CORPORATIVOS */}
              <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-md border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/30 text-amber-400 flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {isCorporate ? 'Diferenciador Fiscal: CFDI 4.0 para Servicios Corporativos & Capacitación Deducible' : 'Diferenciador Fiscal: CFDI 4.0 con Complemento IEDU SAT'}
                    </h3>
                    <p className="text-xs text-slate-300">
                      {isCorporate 
                        ? 'Timbrado automatizado B2B con deducibilidad fiscal al 100% como gasto de operación y capacitación empresarial.'
                        : 'Timbrado automatizado con deducción personal de colegiaturas para padres de familia según decreto oficial.'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-xs">
                  {(isCorporate ? [
                    { label: 'Capacitación Técnica', value: '100% Deducible', sub: 'Gasto operativo LISR' },
                    { label: 'Consultoría B2B', value: '100% Deducible', sub: 'Acreditamiento de IVA' },
                    { label: 'Licenciamiento TI', value: '100% Deducible', sub: 'Deducción autorizada' },
                    { label: 'Seguridad & SST', value: '100% Deducible', sub: 'Certificación STPS / ISO' }
                  ] : [
                    { label: 'Preescolar', value: '$14,200 / año', sub: 'Límite deducible SAT' },
                    { label: 'Primaria', value: '$12,900 / año', sub: 'Límite deducible SAT' },
                    { label: 'Secundaria', value: '$19,900 / año', sub: 'Límite deducible SAT' },
                    { label: 'Bachillerato', value: '$24,500 / año', sub: 'Límite deducible SAT' }
                  ]).map((item, idx) => (
                    <div key={idx} className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">{item.label}</span>
                      <div className="text-base font-black text-amber-400 font-mono mt-0.5">{item.value}</div>
                      <span className="text-[10px] text-slate-400 block">{item.sub}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-slate-300">
                    {isCorporate 
                      ? <>Deducibilidad acumulada para clientes de la red corporativa: <strong className="text-amber-400 font-mono">+$14,800,000 MXN anuales</strong> en beneficios fiscales.</>
                      : <>Ahorro estimado en ISR para las familias de nuestra red: <strong className="text-amber-400 font-mono">+$8,420,000 MXN anuales</strong> deducibles.</>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => triggerToast("✓ Conciliación bancaria ejecutada: 142 folios cotejados con ledger SAT a 0 tokens.")}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-700 font-bold transition-all cursor-pointer active:scale-95"
                    >
                      Conciliar Depósitos Bancarios
                    </button>
                    <button
                      onClick={() => triggerToast(isCorporate ? "✓ Recordatorios preventivos emitidos a cuentas corporativas con saldo próximo a vencer." : "✓ Recordatorios preventivos emitidos a 48 tutores con saldo próximo a vencer.")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold transition-all cursor-pointer active:scale-95"
                    >
                      {isCorporate ? 'Emitir Recordatorios B2B' : 'Emitir Recordatorios SPEI'}
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
              isCorporate={isCorporate}
              onTriggerToast={triggerToast}
              onNavigateTab={handleNavClick}
            />
          )}

          {/* ======================================================= */}
          {/* MÓDULO 9: REPORTES BI (ESTUDIO ANALÍTICO FORENSE 0 TOKENS) */}
          {/* ======================================================= */}
          {activeTab === 'reportes' && (
            <div className="animate-in fade-in duration-100 print:h-auto print:overflow-visible print:block print:p-0 print:m-0">
              <ExecutiveBiCommandCenter
                isEmbeddedView={true}
                schoolId={schoolId || activeSchoolId || currentInstitution?.id || (selectedCampusId !== 'all' ? selectedCampusId : undefined)}
                holdingName={holding.name}
                initialQuery={activeReportQuery || 'Estudiantes con adeudo activo por nivel y monto pendiente'}
                onBack={() => handleNavClick('overview')}
                onNavigateTab={handleNavClick}
              />
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
                  if (activeKPIDrawer.metricKey === 'students') valueDisplay = `${campus.students.toLocaleString()} ${isCorporate ? 'colaboradores' : 'alumnos'}`;
                  else if (activeKPIDrawer.metricKey === 'teachers') valueDisplay = `${campus.teachers} ${isCorporate ? 'instructores' : 'docentes'}`;
                  else if (activeKPIDrawer.metricKey === 'campuses') valueDisplay = `${campus.location} • Activo`;
                  else if (activeKPIDrawer.metricKey === 'admissions') valueDisplay = `${campus.admissionsInProgress} ${isCorporate ? 'en pipeline' : 'en proceso'}`;
                  else if (activeKPIDrawer.metricKey === 'collection') valueDisplay = `${campus.collectionRate}% ${isCorporate ? 'cobrado' : 'recaudado'}`;

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
              <span className="text-xs font-bold text-slate-500 block mb-2">{isCorporate ? 'Plantas/Empresas involucradas:' : 'Sedes involucradas:'}</span>
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
                <span>{isCorporate ? 'Instruir a Directores de Planta' : 'Instruir a Directores de Sede'}</span>
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
              {(isCorporate ? [
                { title: 'Desviación en Meta de Facturación B2B', sedes: ['Planta Monterrey (91%)', 'Planta Bajío (93%)'], desc: 'Facturación en seguimiento respecto al umbral corporativo de 95%. Se sugiere activar conciliación bancaria y recordatorio preventivo.', type: 'cobranza' as const },
                { title: 'Renovación de Contratos Anuales', sedes: ['Planta Bajío', 'Sede Central'], desc: 'Lanzamiento de campaña formal de renovación de acuerdos corporativos.', type: 'reinscripcion' as const },
                { title: 'Auditoría de Competencias Laborales & SST', sedes: ['Planta Monterrey', 'Planta Bajío'], desc: 'Dispersión detectada en evaluaciones de certificación técnica en Nivel 4.', type: 'academico' as const },
                { title: 'Rotación de Instructores Técnicos', sedes: ['Planta Bajío (1)', 'Planta Norte (1)'], desc: 'Bajas técnicas registradas por reemplazo. Cartera de reemplazo activa en Bóveda Corporativa.', type: 'docentes' as const },
              ] : [
                { title: 'Desviación en Meta de Cobranza', sedes: ['Campus Coacalco (91%)', 'Campus San Cristóbal (93%)'], desc: 'Cobranza en seguimiento respecto al umbral institucional de 95%. Se sugiere activar conciliación SPEI y recordatorio preventivo.', type: 'cobranza' as const },
                { title: 'Campaña de Reinscripciones', sedes: ['Campus San Cristóbal', 'Campus Coacalco'], desc: 'Lanzamiento de campaña formal de reserva de plaza para el ciclo 2026-2027.', type: 'reinscripcion' as const },
                { title: 'Auditoría Curricular NEM 2024 / CCH', sedes: ['Campus San Cristóbal', 'Campus Coacalco'], desc: 'Dispersión detectada en evaluaciones formativas de Fase 6 en Secundaria.', type: 'academico' as const },
                { title: 'Rotación Docente Preventiva', sedes: ['Campus Coacalco (1)', 'Campus San Cristóbal (1)'], desc: 'Bajas docentes registradas por reemplazo. Cartera de reemplazo activa en Bóveda Curricular.', type: 'docentes' as const },
              ]).map((f, i) => (
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
                  <span>{isCorporate ? 'Meta de Cumplimiento de Competencias' : 'Meta de Cobertura Curricular SEP NEM'}</span>
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
                  <span>{isCorporate ? 'Meta de Retención de Talento' : 'Meta de Retención Escolar Anual'}</span>
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
              {(isCorporate ? [
                { title: 'Auditoría de Competencias Laborales & SST Completada', campus: 'Planta Industrial Norte', time: 'Hoy 11:30 hrs', cat: 'Operativo', user: 'Supervisión de Calidad ISO' },
                { title: 'Candidato Técnico Registrado en Pipeline de Selección', campus: 'Sede Tecnológica Santa Fe', time: 'Hoy 09:15 hrs', cat: 'Talento', user: 'Atracción de Talento Santa Fe' },
                { title: 'Reglamento de Seguridad Industrial STPS y Compliance 2026', campus: 'Corporativo Central', time: 'Ayer 18:00 hrs', cat: 'Legal & SST', user: 'Dirección Jurídica' },
                { title: 'Conciliación Bancaria y Facturación B2B CFDI 4.0 (142 Folios)', campus: 'Tesorería Corporativa', time: 'Ayer 16:20 hrs', cat: 'Finanzas', user: 'Tesorería Central' },
                { title: 'Simulacro de Seguridad Industrial & Evacuación Operativa', campus: 'Planta Logística Bajío', time: 'Hace 2 días', cat: 'Seguridad', user: 'Brigada de Protección Industrial' },
                { title: 'Campaña de Retención de Talento & Renovación de Contratos B2B', campus: 'Planta Manufactura Toluca', time: 'Hace 3 días', cat: 'Talento', user: 'Dirección de Capital Humano' }
              ] : [
                { title: 'Auditoría Curricular Bimestral Completada', campus: holding.campuses[0]?.name || `${holding.name} · Sede Central`, time: 'Hoy 11:30 hrs', cat: 'Académico', user: 'Coordinación Académica' },
                { title: 'Prospecto Nuevo Registrado en CRM', campus: holding.campuses[1]?.name || holding.campuses[0]?.name || `${holding.name} · Admisiones`, time: 'Hoy 09:15 hrs', cat: 'Admisiones', user: 'Admisiones Oficial' },
                { title: 'Reglamento de Convivencia Actualizado SEP 2026', campus: isIbime ? 'Normativa General IBIME' : `Normativa General ${holding.name}`, time: 'Ayer 18:00 hrs', cat: 'Operativo', user: 'Dirección Jurídica' },
                { title: 'Conciliación Bancaria y Timbrado CFDI 4.0 (142 Folios)', campus: isIbime ? 'Tesorería Central IBIME' : `Tesorería Central ${holding.name}`, time: 'Ayer 16:20 hrs', cat: 'Financiero', user: 'Tesorería Central' },
                { title: 'Simulacro de Evacuación y Pase de Lista Digital', campus: holding.campuses[2]?.name || holding.campuses[0]?.name || `${holding.name} · Plantel 1`, time: 'Hace 2 días', cat: 'Operativo', user: 'Protección Civil' },
                { title: 'Campaña de Reinscripciones Despachada (640 tutores)', campus: holding.campuses[3]?.name || holding.campuses[0]?.name || `${holding.name} · Dirección`, time: 'Hace 3 días', cat: 'Admisiones', user: 'Dirección de Admisiones' }
              ]).map((log, i) => (
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
                placeholder={isCorporate ? "Escribe el nombre de un colaborador, instructor, sede o proceso corporativo..." : "Escribe el nombre de un alumno, maestro, sede o proceso..."}
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
                  {isCorporate 
                    ? "Busca entre más de 6,800 colaboradores, 480 instructores, 5 plantas/empresas y procesos corporativos." 
                    : "Busca entre más de 6,800 alumnos, 480 docentes, 5 planteles y protocolos institucionales."}
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
                    {isCorporate ? 'Directorio de Candidatos en Pipeline de Selección' : 'Directorio de Aspirantes en Pipeline'}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-normal">
                      {isCorporate ? 'Ejercicio 2026' : 'Ciclo 2026-2027'}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isCorporate
                      ? 'Seguimiento detallado de candidatos, etapas de selección técnica y avance de contratación.'
                      : 'Seguimiento detallado de familias aspirantes, etapas de conversión y avance de estatus.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPipelineCSV}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95 border border-slate-700"
                  title="Descargar listado del pipeline en formato CSV"
                >
                  <Download size={14} />
                  <span>Descargar CSV</span>
                </button>
                <button
                  onClick={() => setIsAddProspectModalOpen(true)}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <UserPlus size={14} />
                  + {isCorporate ? 'Registrar Candidato' : 'Registrar Aspirante'}
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
                  placeholder={isCorporate ? "Buscar candidato, contacto o teléfono..." : "Buscar aspirante, tutor o teléfono..."}
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-500 text-[11px]">{isCorporate ? 'Planta / Sede:' : 'Sede:'}</span>
                <select
                  value={prospectFilterCampus}
                  onChange={(e) => setProspectFilterCampus(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">{isCorporate ? 'Todas las Plantas / Sedes' : 'Todas las Sedes'}</option>
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
                  <option value="1">{isCorporate ? '1. Candidato en Base' : '1. Prospecto en CRM'}</option>
                  <option value="2">{isCorporate ? '2. Entrevista Inicial' : '2. Tour y Visita'}</option>
                  <option value="3">{isCorporate ? '3. Evaluación Técnica' : '3. Examen Diagnóstico'}</option>
                  <option value="4">{isCorporate ? '4. Oferta Laboral' : '4. Carta de Asignación'}</option>
                  <option value="5">{isCorporate ? '5. Contratación Confirmada' : '5. Inscripción Pagada'}</option>
                </select>
              </div>
            </div>

            {/* Listado de Familias / Candidatos */}
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
                  const stageStyles = isCorporate ? {
                    1: { bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-600', nextText: 'Agendar Entrevista Inicial →' },
                    2: { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-600', nextText: 'Asignar Evaluación Técnica →' },
                    3: { bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-600', nextText: 'Emitir Oferta Laboral →' },
                    4: { bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-600', nextText: 'Confirmar Contratación →' },
                    5: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-600', nextText: '✓ Contratado' },
                  }[prospect.stage] : {
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
                            {isCorporate ? 'Contacto / Evaluador:' : 'Tutor:'} <strong className="text-slate-700">{prospect.tutorName}</strong>
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
                            {isCorporate ? 'Contratado (Expediente 360)' : 'Inscrito (Expediente 360)'}
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
                {isCorporate
                  ? 'Mostrando candidatos en seguimiento de contratación activo • Todas las transiciones operan a'
                  : 'Mostrando aspirantes en seguimiento escolar activo • Todas las transiciones operan a'}{' '}
                <strong>0 Tokens</strong>.
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
      {/* MODAL 2: + REGISTRAR ASPIRANTE / CANDIDATO AL PIPELINE  */}
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
                  <h3 className="text-base font-black text-white">
                    {isCorporate ? 'Registrar Candidato al Pipeline de Selección' : 'Registrar Aspirante al Pipeline de Admisiones'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isCorporate ? 'Alta directa en CRM de atracción de talento y capital humano.' : 'Alta directa en CRM y embudo de captación escolar.'}
                  </p>
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
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCorporate ? 'Nombre Completo del Candidato *' : 'Nombre Completo del Aspirante *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProspectForm.studentName}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, studentName: e.target.value })}
                    placeholder={isCorporate ? "ej. Lic. Roberto Alarcón Soto" : "ej. Santiago Morales Reyes"}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCorporate ? 'Puesto / Especialidad Solicitada *' : 'Grado / Nivel Solicitado *'}
                  </label>
                  <select
                    value={newProspectForm.grade}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    {isCorporate ? (
                      isBmw ? (
                        <>
                          <option value="Especialista en Robótica KUKA & Celdas de Soldadura">Especialista en Robótica KUKA & Celdas de Soldadura</option>
                          <option value="Ingeniera de Ensamble Tren Motriz Eléctrico">Ingeniera de Ensamble Tren Motriz Eléctrico</option>
                          <option value="Especialista en Calidad & Protocolos ISO 14001">Especialista en Calidad & Protocolos ISO 14001</option>
                          <option value="Líder Técnico de Ensamble & ISO 45001">Líder Técnico de Ensamble & ISO 45001</option>
                          <option value="Supervisora de Logística JIT & Cadena Automotriz">Supervisora de Logística JIT & Cadena Automotriz</option>
                          <option value="Arquitecto de Telemetría Vehicular & Baterías">Arquitecto de Telemetría Vehicular & Baterías</option>
                          <option value="Técnico de Mantenimiento Preventivo Celdas KUKA">Técnico de Mantenimiento Preventivo Celdas KUKA</option>
                          <option value="Coordinador de Postventa & Fidelización Santa Fe">Coordinador de Postventa & Fidelización Santa Fe</option>
                        </>
                      ) : isRetail ? (
                        <>
                          <option value="Gerente de Compras Omnicanal & Retail Analytics">Gerente de Compras Omnicanal & Retail Analytics</option>
                          <option value="Coordinador de Distribución y Flotas CEDIS">Coordinador de Distribución y Flotas CEDIS</option>
                          <option value="Supervisora de Operaciones WMS y Logística Inversa">Supervisora de Operaciones WMS y Logística Inversa</option>
                          <option value="Key Account Manager Cuentas Clave Retail">Key Account Manager Cuentas Clave Retail</option>
                          <option value="Subdirectora de Experiencia del Cliente & Postventa">Subdirectora de Experiencia del Cliente & Postventa</option>
                          <option value="Supervisor de Inventarios Cíclicos & Merma">Supervisor de Inventarios Cíclicos & Merma</option>
                        </>
                      ) : (
                        <>
                          <option value="Senior DevOps & Cloud Platform Engineer">Senior DevOps & Cloud Platform Engineer</option>
                          <option value="Staff MLOps & AI Deployment Specialist">Staff MLOps & AI Deployment Specialist</option>
                          <option value="Fullstack Principal & Golang Microservices">Fullstack Principal & Golang Microservices</option>
                          <option value="Data Architect & Big Data Distributed Pipelines">Data Architect & Big Data Distributed Pipelines</option>
                          <option value="Lead AI Scientist & Computer Vision">Lead AI Scientist & Computer Vision</option>
                        </>
                      )
                    ) : (
                      <>
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
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCorporate ? 'Planta / Sede Operativa *' : 'Plantel / Campus Escolar *'}
                  </label>
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
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCorporate ? 'Contacto de Referencia o Evaluador *' : 'Nombre del Padre, Madre o Tutor *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newProspectForm.tutorName}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, tutorName: e.target.value })}
                    placeholder={isCorporate ? "ej. Lic. Mariana Valdés (RH)" : "ej. Ing. Carlos Morales"}
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
                  <label className="font-bold text-slate-700 block mb-1">
                    {isCorporate ? 'Canal de Atracción' : 'Canal de Captación'}
                  </label>
                  <select
                    value={newProspectForm.channel}
                    onChange={(e) => setNewProspectForm({ ...newProspectForm, channel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                  >
                    {isCorporate ? (
                      <>
                        <option value="Recomendación Interna">Recomendación Interna (Talento Referido)</option>
                        <option value="Bolsas de Empleo & Redes">Bolsas de Empleo & Redes Profesionales</option>
                        <option value="Convenios con Universidades">Convenios con Universidades & Centros Técnicos</option>
                        <option value="Headhunting Directo">Headhunting Directo & Ferias Industriales</option>
                      </>
                    ) : (
                      <>
                        <option value="Recomendación Familiar">Recomendación Familiar (Boca a boca)</option>
                        <option value="Canales Digitales & Web">Canales Digitales & Web / Redes</option>
                        <option value="Convenios Corporativos">Convenios Corporativos / Empresas</option>
                        <option value="Feria Escolar">Feria Escolar / Expos Educativas</option>
                      </>
                    )}
                  </select>
                </div>

                {isCorporate && (
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Sueldo Propuesto / Expectativa Salarial</label>
                    <input
                      type="text"
                      value={newProspectForm.salary}
                      onChange={(e) => setNewProspectForm({ ...newProspectForm, salary: e.target.value })}
                      placeholder="ej. $48,000 MXN / mes"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white font-mono"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isCorporate ? 'Etapa Inicial del Candidato' : 'Etapa Inicial del Aspirante'}
                </label>
                <select
                  value={newProspectForm.initialStage}
                  onChange={(e) => setNewProspectForm({ ...newProspectForm, initialStage: Number(e.target.value) as any })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-purple-500 focus:bg-white"
                >
                  {isCorporate ? (
                    <>
                      <option value="1">1. Candidato en Base de Datos (Revisión de CV)</option>
                      <option value="2">2. Entrevista Inicial Agendada</option>
                      <option value="3">3. Evaluación Técnica & Psicométrica</option>
                    </>
                  ) : (
                    <>
                      <option value="1">1. Prospecto Registrado en CRM (Primer contacto)</option>
                      <option value="2">2. Tour y Visita de Campus Agendada</option>
                      <option value="3">3. Examen Diagnóstico Psicopedagógico</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {isCorporate ? 'Notas u Observaciones de la Postulación' : 'Notas u Observaciones del Caso'}
                </label>
                <textarea
                  rows={2}
                  value={newProspectForm.notes}
                  onChange={(e) => setNewProspectForm({ ...newProspectForm, notes: e.target.value })}
                  placeholder={isCorporate ? "ej. Candidato con certificación en PLC y normas ISO. Disponible para turno matutino." : "ej. Familia interesada en programa de robótica y bilingüe. Tienen un hermano en 4° de primaria."}
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
                  {isCorporate ? 'Guardar Candidato en Pipeline' : 'Guardar Aspirante en Pipeline'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL DE PORTAL ACADÉMICO INTEGRAL PARA ADMINISTRADOR     */}
      {/* (VISTA PROFESOR, VISTA ALUMNOS CON SELECTOR Y AUDITORÍA) */}
      {/* ========================================================= */}
      {isAcademicPortalModalOpen && (
        <AcademicPortalAdminModal
          isOpen={isAcademicPortalModalOpen}
          onClose={() => setIsAcademicPortalModalOpen(false)}
          holding={holding}
          schoolId={schoolId || currentInstitution?.id || (isIbime ? 'sch-ibime' : 'sch-test-case')}
          initialCampusId={selectedCampusId}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL DE CORREO INSTITUCIONAL Y COMUNICADOS CEO           */}
      {/* ========================================================= */}
      {isEmailModalOpen && (
        <CEOEmailCommunicationsModal
          key={schoolId || currentInstitution?.id || holding?.id || 'sch-default'}
          isOpen={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          holding={holding}
          schoolId={schoolId || holding?.id || currentInstitution?.id || 'sch-ibime'}
          selectedCampusId={selectedCampusId}
          onTriggerToast={triggerToast}
        />
      )}

      {/* ========================================================= */}
      {/* 4. BARRA DE NAVEGACIÓN INFERIOR PARA MÓVIL (APP NATIVA)   */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 flex items-center justify-around lg:hidden shadow-lg">
        {[
          { id: 'inicio', label: 'Inicio', icon: Building2 },
          { id: 'vision', label: 'Visión', icon: TrendingUp },
          { id: 'academico', label: isCorporate ? 'Competencias' : 'NEM', icon: isCorporate ? Award : GraduationCap },
          { id: 'admisiones', label: isCorporate ? 'Talento' : 'Admisiones', icon: UserCheck },
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
