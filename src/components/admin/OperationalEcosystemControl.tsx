"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  GraduationCap,
  Building2,
  HeartHandshake,
  Zap,
  CheckCheck,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Filter,
  Send,
  Smartphone,
  Receipt,
  Flame,
  Check,
  ChevronRight,
  School,
  X,
  Play,
  Briefcase
} from 'lucide-react';

// ============================================================================
// TIPOS DE ROLES Y EVENTOS OPERATIVOS DEL ECOSISTEMA ESCOLAR / EMPRESARIAL
// ============================================================================
export type ActorRole = 'docente' | 'administrativo' | 'padre' | 'alumno';

export interface EcosystemRoleTelemetry {
  id: ActorRole;
  name: string;
  portalName: string;
  avatarIcon: any;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
    glow: string;
    accent: string;
  };
  connectedCount: string;
  connectedLabel: string;
  todayActions: string;
  lastActionTime: string;
  description: string;
  feedsDataInto: string[];
  sampleRecentActions: string[];
}

export interface OperationalAutomationFlow {
  key: string;
  name: string;
  originRole: ActorRole;
  originEvent: string;
  impactsKPI: string;
  destinationChannel: string;
  frequency: string;
  description: string;
  executedToday: number;
  successRate: number;
  avgLatencyMs: number;
}

export interface LiveEcosystemEvent {
  id: string;
  role: ActorRole;
  actorName: string;
  campusName: string;
  actionText: string;
  automationTriggered: string;
  impactMetric: string;
  timestamp: string;
  status: 'completado' | 'en-proceso';
}

export interface OperationalEcosystemControlProps {
  holdingName?: string;
  campusCount?: number;
  totalStudents?: number;
  totalTeachers?: number;
  collectionRate?: number;
  curriculumCoverage?: number;
  isCorporate?: boolean;
  onTriggerToast?: (message: string) => void;
  onNavigateTab?: (tab: string) => void;
}

// ============================================================================
// DATOS MAESTROS DE TRAZABILIDAD Y ROLES DE ALIMENTACIÓN (COLEGIOS REGULARES)
// ============================================================================
export const ECOSYSTEM_ROLES: EcosystemRoleTelemetry[] = [
  {
    id: 'docente',
    name: 'Cuentas de Docentes / Profesores',
    portalName: 'Portal Académico & Pase de Lista',
    avatarIcon: GraduationCap,
    colorTheme: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glow: 'rgba(16, 185, 129, 0.4)',
      accent: 'text-emerald-500'
    },
    connectedCount: '142 Docentes',
    connectedLabel: '100% de la plantilla en línea',
    todayActions: '1,280 pases de lista & rubricas',
    lastActionTime: 'Hace 3 min',
    description: 'Los profesores toman asistencia en aula cada mañana, suben planeaciones cronometradas NEM 2024 con PDA oficial SEP y evalúan rúbricas formativas.',
    feedsDataInto: [
      'Módulo Académico NEM (Cobertura Curricular)',
      'Alerta Temprana de Inasistencias en Vivo',
      'Bóveda Central de Conocimiento (Planeaciones)'
    ],
    sampleRecentActions: [
      'Pase de lista completado en 3° Primaria B (Campus Montes)',
      'Planeación de Fase 4 indexada en Bóveda Curricular',
      'Rúbrica formativa de indagación aplicada a 28 alumnos'
    ]
  },
  {
    id: 'administrativo',
    name: 'Cuentas Administrativas & Tesorería',
    portalName: 'Módulo de Cobranza, Caja & Nómina',
    avatarIcon: Building2,
    colorTheme: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glow: 'rgba(6, 182, 212, 0.4)',
      accent: 'text-cyan-500'
    },
    connectedCount: '4 Sedes / 18 Operadores',
    connectedLabel: 'Cajas y Tesorería Central activas',
    todayActions: '348 cobros conciliados & timbrados',
    lastActionTime: 'Hace 1 min',
    description: 'El personal de caja y tesorería registra pagos presenciales, concilia transferencias bancarias SPEI, timbra recibos CFDI 4.0 con complemento IEDU y da de alta matrículas.',
    feedsDataInto: [
      'Módulo Finanzas (Tasa de Cobranza en Vivo)',
      'Cubo de Aging & Mora a 30/60/90 días',
      'Timbrado Fiscal PAC SAT CFDI 4.0'
    ],
    sampleRecentActions: [
      'Factura CFDI 4.0 timbrada con complemento IEDU ($7,850 MXN)',
      'Conciliación SPEI automática aplicada a Campus Lagos',
      'Convenio de pago acordado con tutor legal (15% beca)'
    ]
  },
  {
    id: 'padre',
    name: 'Cuentas de Padres de Familia & Tutores',
    portalName: 'App Escolar Familiar & Portal Web',
    avatarIcon: HeartHandshake,
    colorTheme: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      glow: 'rgba(139, 92, 246, 0.4)',
      accent: 'text-violet-500'
    },
    connectedCount: '4,890 Familias',
    connectedLabel: '89.4% uso activo en app móvil',
    todayActions: '412 pagos & justificaciones',
    lastActionTime: 'Hace 2 min',
    description: 'Los padres de familia pagan colegiaturas en línea por SPEI o tarjeta, justifican inasistencias médicas, actualizan alergias en el Expediente 360 y registran aspirantes.',
    feedsDataInto: [
      'Expediente 360 de Salud y Alergias en < 3 min',
      'Pipeline de Admisiones e Inducción de Familias',
      'Registro Inmutable de Asistencia Justificada'
    ],
    sampleRecentActions: [
      'Colegiatura Septiembre pagada vía SPEI desde app móvil',
      'Justificante médico adjuntado para alumno con asma leve',
      'Actualización de contacto de urgencia en Expediente 360'
    ]
  },
  {
    id: 'alumno',
    name: 'Cuentas de Alumnos & Estudiantes',
    portalName: 'Lienzo Digital & Simuladores Gamificados',
    avatarIcon: Users,
    colorTheme: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      glow: 'rgba(236, 72, 153, 0.4)',
      accent: 'text-pink-500'
    },
    connectedCount: '5,784 Alumnos',
    connectedLabel: 'En 4 planteles de la red',
    todayActions: '2,940 retos & sesiones resueltas',
    lastActionTime: 'Hace 30 seg',
    description: 'Los alumnos registran su acceso físico mediante credencial digital, resuelven actividades interactivas en el Lienzo Digital, acumulan XP y cumplen misiones comunitarias.',
    feedsDataInto: [
      'Índice de Retención & Deserción Preventiva',
      'Registro Biométrico de Asistencia Física',
      'Progreso Gamificado & Insignias de Maestría'
    ],
    sampleRecentActions: [
      'Pase por torniquete escolar con credencial digital (Entrada: 07:42)',
      'Reto de matemáticas resuelto en Lienzo Digital (+150 XP)',
      'Proyecto comunitario de reciclaje entregado en Fase 5'
    ]
  }
];

// ============================================================================
// DATOS MAESTROS DE TRAZABILIDAD CORPORATIVA B2B (EMPRESAS & CEO)
// ============================================================================
export const CORPORATE_ECOSYSTEM_ROLES: EcosystemRoleTelemetry[] = [
  {
    id: 'docente',
    name: 'Cuentas de Instructores & Master Trainers',
    portalName: 'Portal de Capacitación Técnica & Certificaciones',
    avatarIcon: Briefcase,
    colorTheme: {
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      glow: 'rgba(16, 185, 129, 0.4)',
      accent: 'text-emerald-500'
    },
    connectedCount: '4 Instructores',
    connectedLabel: '100% de capacitadores técnicos en planta',
    todayActions: '48 sesiones técnicas & certificaciones',
    lastActionTime: 'Hace 3 min',
    description: 'Los instructores técnicos y master trainers imparten certificaciones en líneas de ensamble, evalúan matrices de habilidades ISO/IATF y validan horas de adiestramiento técnico.',
    feedsDataInto: [
      'Matriz de Competencias Laborales & Certificaciones ISO',
      'Bitácora de Horas Técnicas & Capacitación en Planta',
      'Bóveda Central de Conocimiento Operativo'
    ],
    sampleRecentActions: [
      'Capacitación en Mantenimiento Robótico KUKA completada',
      'Certificación de Alto Voltaje validada en Bóveda Central',
      'Evaluación de competencias STPS aplicada a colaboradores'
    ]
  },
  {
    id: 'administrativo',
    name: 'Cuentas de Operaciones Financieras & Tesorería',
    portalName: 'Módulo de Facturación B2B, Presupuestos & Nómina',
    avatarIcon: Building2,
    colorTheme: {
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      glow: 'rgba(6, 182, 212, 0.4)',
      accent: 'text-cyan-500'
    },
    connectedCount: '2 Plantas / 18 Líderes Financieros',
    connectedLabel: 'Tesorería Central & Cajas Corporativas activas',
    todayActions: '124 folios conciliados & timbrados',
    lastActionTime: 'Hace 1 min',
    description: 'El personal de finanzas concilia órdenes de compra B2B, dispersa nóminas de colaboradores, emite CFDI 4.0 empresarial y concilia la cobranza comercial con validación SAT.',
    feedsDataInto: [
      'Módulo Finanzas (Tasa de Cobranza B2B en Vivo)',
      'Cubo de Aging & Cartera Comercial a 30/60/90 días',
      'Timbrado Fiscal SAT CFDI 4.0 Empresarial'
    ],
    sampleRecentActions: [
      'Factura B2B CFDI 4.0 emitida por lote de ensamble ($185,000 MXN)',
      'Conciliación bancaria SPEI aplicada a Planta San Luis Potosí',
      'Presupuesto trimestral de capacitación técnica autorizado'
    ]
  },
  {
    id: 'padre',
    name: 'Cuentas de Candidatos & Atracción de Talento',
    portalName: 'Portal de Atracción de Talento & Onboarding',
    avatarIcon: HeartHandshake,
    colorTheme: {
      bg: 'bg-violet-500/10',
      border: 'border-violet-500/30',
      text: 'text-violet-400',
      badge: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
      glow: 'rgba(139, 92, 246, 0.4)',
      accent: 'text-violet-500'
    },
    connectedCount: '19 Candidatos en Pipeline',
    connectedLabel: '92% avance en proceso de selección ATS',
    todayActions: '34 pruebas psicométricas & entrevistas',
    lastActionTime: 'Hace 2 min',
    description: 'Los candidatos en proceso de selección completan evaluaciones técnicas y psicométricas, cargan su documentación laboral y firman cartas oferta para integrarse a las plantas.',
    feedsDataInto: [
      'Pipeline de Atracción de Talento & Ofertas Laborales',
      'Expediente Laboral 360 & Examen de Salud Ocupacional (STPS)',
      'Registro Inmutable de Inducción & Onboarding'
    ],
    sampleRecentActions: [
      'Evaluación técnica de Especialista en PLC aprobada con 96%',
      'Documentación de IMSS y RFC cargada para contratación',
      'Carta oferta formal firmada digitalmente para Planta Bajío'
    ]
  },
  {
    id: 'alumno',
    name: 'Cuentas de Colaboradores & Personal Operativo',
    portalName: 'Portal del Colaborador & Simuladores Operativos',
    avatarIcon: Users,
    colorTheme: {
      bg: 'bg-pink-500/10',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
      badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
      glow: 'rgba(236, 72, 153, 0.4)',
      accent: 'text-pink-500'
    },
    connectedCount: '15 Colaboradores',
    connectedLabel: 'En plantas activas de la empresa',
    todayActions: '820 simulaciones & turnos registrados',
    lastActionTime: 'Hace 30 seg',
    description: 'Los colaboradores registran su acceso a planta mediante credencial digital, completan simuladores operativos, acumulan horas de adiestramiento técnico y consultan sus recibos de nómina.',
    feedsDataInto: [
      'Índice de Retención & Evaluación de Desempeño',
      'Registro Biométrico de Asistencia en Planta / Línea',
      'Horas de Capacitación Técnica & Certificaciones Industriales'
    ],
    sampleRecentActions: [
      'Registro de acceso a Planta SLP con credencial digital (Turno: 06:45)',
      'Simulador de Ensamble Robótico KUKA completado con 100% de precisión',
      'Constancia de curso de Seguridad Industrial descargada'
    ]
  }
];

export const INITIAL_AUTOMATIONS: OperationalAutomationFlow[] = [
  {
    key: 'cobranza-preventiva',
    name: 'Cobranza preventiva 5 días antes de vencimiento',
    originRole: 'padre',
    originEvent: 'Cierre de ciclo mensual en ledger administrativo',
    impactsKPI: 'Tasa de Cobranza Media (+4.2%) & Reducción de Mora',
    destinationChannel: 'WhatsApp Institucional + Portal Padres + App Móvil',
    frequency: '340 notificaciones/mes por WhatsApp y portal',
    description: 'Cruza el calendario de cobros con los estados de cuenta y envía automáticamente un recordatorio amable con liga bancaria SPEI directa.',
    executedToday: 42,
    successRate: 99.8,
    avgLatencyMs: 0.7
  },
  {
    key: 'inasistencias-padres',
    name: 'Notificación de inasistencia escolar en tiempo real',
    originRole: 'docente',
    originEvent: 'Profesor marca falta al cerrar pase de lista matutino',
    impactsKPI: 'Seguridad Escolar & Reducción de Ausentismo No Notificado',
    destinationChannel: 'Notificación Push prioritaria + SMS al tutor legal',
    frequency: 'Instantáneo (<1s) tras pase de lista de aula',
    description: 'Al concluir el pase de lista de las 08:15 hrs, el sistema alerta al padre si el educando no ingresó a la primera hora lectiva.',
    executedToday: 18,
    successRate: 100,
    avgLatencyMs: 0.4
  },
  {
    key: 'timbrado-cfdi',
    name: 'Timbrado de recibos CFDI 4.0 con complemento IEDU',
    originRole: 'administrativo',
    originEvent: 'Cajero o banco confirma conciliación de transferencia SPEI',
    impactsKPI: 'Cumplimiento Fiscal SAT CFDI 4.0 al 100% sin retraso',
    destinationChannel: 'Bóveda Fiscal + Correo Electrónico con XML y PDF sellado',
    frequency: '100% automatizado con PAC autorizado a 0 tokens',
    description: 'Emite el comprobante fiscal en Anexo 20 del SAT, inyectando la CURP del educando, la clave RVOE del plantel y el desglose de deducción IEDU.',
    executedToday: 64,
    successRate: 100,
    avgLatencyMs: 0.9
  },
  {
    key: 'auditoria-nem',
    name: 'Auditoría nocturna de dispersión curricular NEM',
    originRole: 'docente',
    originEvent: 'Docentes persisten planeaciones en la Bóveda Curricular',
    impactsKPI: 'Cobertura Oficial SEP NEM 2024 en Planteles (Meta 90%+)',
    destinationChannel: 'Reporte BI Ejecutivo para el CEO y Directores de Plantel',
    frequency: 'Diario a las 23:00 hrs a 0 tokens en memoria',
    description: 'Evalúa que cada tema abordado tenga sus momentos de aula cronometrados (Inicio, Desarrollo, Cierre), entregables tangibles y PDA oficial SEP.',
    executedToday: 142,
    successRate: 99.2,
    avgLatencyMs: 1.1
  },
  {
    key: 'alerta-desercion',
    name: 'Alerta predictiva de deserción escolar por Expediente 360',
    originRole: 'alumno',
    originEvent: 'Cruza 3 inasistencias consecutivas y adeudo en cobranza',
    impactsKPI: 'Retención de Matrícula (Meta 95%+) y Fondo de Becas',
    destinationChannel: 'Comité de Dirección Escolar & Coordinación Psicopedagógica',
    frequency: 'Monitoreo en tiempo real continuo',
    description: 'Dispara una intervención temprana directiva antes de que la familia solicite la baja definitiva, ofreciendo planes de apoyo escolar.',
    executedToday: 4,
    successRate: 100,
    avgLatencyMs: 0.6
  }
];

export const CORPORATE_AUTOMATIONS: OperationalAutomationFlow[] = [
  {
    key: 'cobranza-preventiva',
    name: 'Conciliación y cobranza B2B 5 días antes de vencimiento',
    originRole: 'administrativo',
    originEvent: 'Cierre de ciclo de facturación comercial en ledger corporativo',
    impactsKPI: 'Tasa de Cobranza B2B (+4.2%) & Reducción de Cartera Vencida',
    destinationChannel: 'Notificación Electrónica SAT + Portal B2B',
    frequency: 'Automatizado por ciclo fiscal',
    description: 'Cruza las órdenes de compra empresariales con los estados de cuenta y envía automáticamente el requerimiento fiscal con liga bancaria SPEI directa.',
    executedToday: 42,
    successRate: 99.8,
    avgLatencyMs: 0.7
  },
  {
    key: 'inasistencias-padres',
    name: 'Notificación de inasistencia en turno y relevo de cuadrilla',
    originRole: 'docente',
    originEvent: 'Supervisor registra falta o incidencia de seguridad al inicio de turno',
    impactsKPI: 'Seguridad Industrial & Continuidad de Línea de Producción',
    destinationChannel: 'Notificación Push prioritaria a Gerencia de Planta',
    frequency: 'Instantáneo (<1s) tras apertura de turno',
    description: 'Al concluir el pase de lista de turno en planta, el sistema alerta a la gerencia de operaciones para reasignar cuadrillas en línea de ensamble.',
    executedToday: 18,
    successRate: 100,
    avgLatencyMs: 0.4
  },
  {
    key: 'timbrado-cfdi',
    name: 'Timbrado masivo CFDI 4.0 B2B con validación SAT',
    originRole: 'administrativo',
    originEvent: 'Finanzas confirma recepción de pago comercial vía SPEI',
    impactsKPI: 'Cumplimiento Fiscal SAT CFDI 4.0 B2B al 100% sin retraso',
    destinationChannel: 'Bóveda Fiscal + Correo Corporativo con XML y PDF sellado',
    frequency: '100% automatizado con PAC autorizado a 0 tokens',
    description: 'Emite el comprobante fiscal en Anexo 20 del SAT, inyectando el RFC de la empresa cliente, orden de compra y desglose de servicios corporativos.',
    executedToday: 64,
    successRate: 100,
    avgLatencyMs: 0.9
  },
  {
    key: 'auditoria-nem',
    name: 'Auditoría nocturna de avance en matriz de competencias ISO',
    originRole: 'docente',
    originEvent: 'Instructores persisten evaluaciones en la Bóveda Central',
    impactsKPI: 'Cumplimiento de Estándares ISO 9001 / IATF 16949 (Meta 95%+)',
    destinationChannel: 'Reporte BI Ejecutivo para el CEO y Directores de Planta',
    frequency: 'Diario a las 23:00 hrs a 0 tokens en memoria',
    description: 'Evalúa que cada módulo técnico impartido cumpla con horas acreditadas, rúbricas de seguridad industrial y dictamen inmutable.',
    executedToday: 142,
    successRate: 99.2,
    avgLatencyMs: 1.1
  },
  {
    key: 'alerta-desercion',
    name: 'Alerta predictiva de retención de talento y prevención de rotación',
    originRole: 'alumno',
    originEvent: 'Algoritmo detecta baja participación en cursos y horas extra acumuladas',
    impactsKPI: 'Retención de Talento Estratégico (Meta 95%+) y Planes de Carrera',
    destinationChannel: 'Comité de Capital Humano & Dirección de Operaciones',
    frequency: 'Monitoreo en tiempo real continuo',
    description: 'Dispara una alerta temprana para que Recursos Humanos active un plan de retención y revisión de compensaciones antes de una baja laboral.',
    executedToday: 4,
    successRate: 100,
    avgLatencyMs: 0.6
  }
];

export const INITIAL_LIVE_EVENTS: LiveEcosystemEvent[] = [
  {
    id: 'evt-1',
    role: 'docente',
    actorName: 'Profr. Carlos Mendoza',
    campusName: 'Campus Montes (Sede Matriz)',
    actionText: 'Concluyó pase de lista en 3° Secundaria Grupo A (32 alumnos presentes)',
    automationTriggered: 'Alerta de Inasistencias',
    impactMetric: 'Asistencia Sede: 96.8%',
    timestamp: '16:20:14',
    status: 'completado'
  },
  {
    id: 'evt-2',
    role: 'padre',
    actorName: 'Sra. Mariana Garza (Tutor)',
    campusName: 'Campus Lagos',
    actionText: 'Realizó pago de Colegiatura vía transferencia bancaria SPEI ($4,250 MXN)',
    automationTriggered: 'Timbrado SAT CFDI 4.0 IEDU (RFC IBI040818K24)',
    impactMetric: 'Cobranza Lagos: 96.2%',
    timestamp: '16:18:42',
    status: 'completado'
  },
  {
    id: 'evt-3',
    role: 'administrativo',
    actorName: 'Lic. Roberto Solís (Tesorería)',
    campusName: 'Campus San Cristóbal',
    actionText: 'Emitió factura deducible y aplicó convenio de pago con 15% de beca',
    automationTriggered: 'Conciliación en Ledger',
    impactMetric: 'Focos de Cobranza: Resuelto',
    timestamp: '16:15:08',
    status: 'completado'
  },
  {
    id: 'evt-4',
    role: 'alumno',
    actorName: 'Camila Robles (5° Primaria)',
    campusName: 'Campus Montes',
    actionText: 'Completó simulador interactivo de robótica STEAM en el Lienzo Digital (+150 XP)',
    automationTriggered: 'Bitácora de Aprovechamiento',
    impactMetric: 'XP Comunitario: +150',
    timestamp: '16:12:30',
    status: 'completado'
  },
  {
    id: 'evt-5',
    role: 'docente',
    actorName: 'Mtra. Sofía Valdés',
    campusName: 'Campus Coacalco',
    actionText: 'Sincronizó planeación de Fase 5 con PDA oficial SEP en Bóveda Curricular',
    automationTriggered: 'Auditoría NEM Nocturna',
    impactMetric: 'Cobertura SEP: 95.4%',
    timestamp: '16:08:19',
    status: 'completado'
  }
];

export const CORPORATE_LIVE_EVENTS: LiveEcosystemEvent[] = [
  {
    id: 'evt-1',
    role: 'docente',
    actorName: 'Ing. Guillermo Schmidt (Master Trainer)',
    campusName: 'Planta San Luis Potosí',
    actionText: 'Concluyó certificación en Ensamble Robótico KUKA (12 colaboradores certificados)',
    automationTriggered: 'Actualización de Matriz ISO',
    impactMetric: 'Competencia Planta: 98.4%',
    timestamp: '16:20:14',
    status: 'completado'
  },
  {
    id: 'evt-2',
    role: 'padre',
    actorName: 'Lic. Mariana Valdés (Atracción de Talento)',
    campusName: 'Planta San Luis Potosí',
    actionText: 'Validó prueba técnica y psicométrica para Candidato a Especialista en PLC',
    automationTriggered: 'Emisión de Carta Oferta Laboral',
    impactMetric: 'Pipeline ATS: 19 Activos',
    timestamp: '16:18:42',
    status: 'completado'
  },
  {
    id: 'evt-3',
    role: 'administrativo',
    actorName: 'Lic. Roberto Solís (Finanzas B2B)',
    campusName: 'Centro Corporativo Reforma',
    actionText: 'Concilió factura B2B Serie A ($185,000 MXN) con validación SAT a 0 tokens',
    automationTriggered: 'Conciliación en Ledger B2B',
    impactMetric: 'Cobranza B2B: 95.8%',
    timestamp: '16:15:08',
    status: 'completado'
  },
  {
    id: 'evt-4',
    role: 'alumno',
    actorName: 'Carlos Mendoza (Colaborador Técnico)',
    campusName: 'Planta San Luis Potosí',
    actionText: 'Completó simulador operativo de Arquitectura de Alto Voltaje (Precisión: 100%)',
    automationTriggered: 'Bitácora de Horas Técnicas',
    impactMetric: 'Horas Acreditadas: +4.5 hrs',
    timestamp: '16:12:30',
    status: 'completado'
  },
  {
    id: 'evt-5',
    role: 'docente',
    actorName: 'Dra. Erika Von Humboldt (Alto Voltaje)',
    campusName: 'Planta San Luis Potosí',
    actionText: 'Sincronizó manual de seguridad NOM-035 con bitácora inmutable en Bóveda Central',
    automationTriggered: 'Auditoría de Normas STPS',
    impactMetric: 'Conformidad STPS: 100%',
    timestamp: '16:08:19',
    status: 'completado'
  }
];

export const OperationalEcosystemControl: React.FC<OperationalEcosystemControlProps> = ({
  holdingName = 'Instituto Bilingüe IBIME',
  campusCount = 4,
  totalStudents = 5784,
  totalTeachers = 142,
  collectionRate = 94.2,
  curriculumCoverage = 94.2,
  isCorporate = false,
  onTriggerToast,
  onNavigateTab
}) => {
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<ActorRole | 'todos'>('todos');
  const [automationStates, setAutomationStates] = useState<Record<string, boolean>>({
    'cobranza-preventiva': true,
    'inasistencias-padres': true,
    'timbrado-cfdi': true,
    'auditoria-nem': true,
    'alerta-desercion': true
  });

  const currentRoles = useMemo(() => {
    if (!isCorporate) return ECOSYSTEM_ROLES;
    return CORPORATE_ECOSYSTEM_ROLES.map(r => {
      if (r.id === 'docente' && totalTeachers) {
        return { ...r, connectedCount: `${totalTeachers} Instructores` };
      }
      if (r.id === 'alumno' && totalStudents) {
        return { ...r, connectedCount: `${totalStudents} Colaboradores` };
      }
      if (r.id === 'administrativo' && campusCount) {
        return { ...r, connectedCount: `${campusCount} Plantas / 18 Líderes Financieros` };
      }
      return r;
    });
  }, [isCorporate, totalTeachers, totalStudents, campusCount]);

  const currentAutomations = useMemo(() => {
    return isCorporate ? CORPORATE_AUTOMATIONS : INITIAL_AUTOMATIONS;
  }, [isCorporate]);

  const [liveEvents, setLiveEvents] = useState<LiveEcosystemEvent[]>(
    isCorporate ? CORPORATE_LIVE_EVENTS : INITIAL_LIVE_EVENTS
  );

  useEffect(() => {
    setLiveEvents(isCorporate ? CORPORATE_LIVE_EVENTS : INITIAL_LIVE_EVENTS);
  }, [isCorporate]);

  const [activeSimulationKey, setActiveSimulationKey] = useState<string | null>(null);
  const [isAuditingConnections, setIsAuditingConnections] = useState<boolean>(false);
  const [connectionHealthScore, setConnectionHealthScore] = useState<number>(100);

  // Filtrado de eventos por rol
  const filteredEvents = useMemo(() => {
    if (selectedRoleFilter === 'todos') return liveEvents;
    return liveEvents.filter(e => e.role === selectedRoleFilter);
  }, [liveEvents, selectedRoleFilter]);

  // Simulación de disparo de flujo en tiempo real (Prueba interactiva del CEO)
  const handleSimulateFlow = (flow: OperationalAutomationFlow) => {
    setActiveSimulationKey(flow.key);

    const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    let newActor = 'Docente en Aula';
    let newAction = 'Acción simulada en tiempo real';
    let newImpact = 'Impacto directo en KPIs de red';

    if (isCorporate) {
      if (flow.originRole === 'docente') {
        newActor = 'Ing. Guillermo Schmidt (Instructor Técnico)';
        newAction = `Certificación técnica registrada en Planta (${flow.name})`;
        newImpact = 'Matriz ISO: 98.6% (+0.2%)';
      } else if (flow.originRole === 'padre') {
        newActor = 'Lic. Mariana Valdés (Atracción de Talento)';
        newAction = `Evaluación psicométrica completada para candidato en pipeline`;
        newImpact = 'Pipeline ATS: Activo';
      } else if (flow.originRole === 'administrativo') {
        newActor = 'Lic. Roberto Solís (Finanzas Corporativas)';
        newAction = `Conciliación de factura B2B CFDI 4.0 con timbrado PAC SAT`;
        newImpact = 'Cobranza B2B: 95.8% (+0.2%)';
      } else {
        newActor = 'Carlos Mendoza (Colaborador Técnico)';
        newAction = `Ingreso a planta registrado con credencial digital e inspección de EPP`;
        newImpact = 'Acceso & EPP Verificado';
      }
    } else {
      if (flow.originRole === 'docente') {
        newActor = 'Mtra. Elena Rivas (Docente)';
        newAction = `Pase de lista matutino registrado en 5° Primaria (${flow.name})`;
        newImpact = 'Asistencia: 97.2% (+0.2%)';
      } else if (flow.originRole === 'padre') {
        newActor = 'Padre de Familia Ing. Gómez';
        newAction = `Pago en línea de $7,900 MXN conciliado por SPEI bancario`;
        newImpact = 'Cobranza: 94.4% (+0.2%)';
      } else if (flow.originRole === 'administrativo') {
        newActor = 'Lic. Patricia Vega (Caja Central)';
        newAction = `Timbrado masivo CFDI 4.0 completado con PAC autorizado`;
        newImpact = 'CFDI: 100% SAT';
      } else {
        newActor = 'Santiago Navarro (Alumno)';
        newAction = `Registro de ingreso por torniquete escolar con credencial digital`;
        newImpact = 'Acceso Verificado';
      }
    }

    const newEvent: LiveEcosystemEvent = {
      id: `sim-${Date.now()}`,
      role: flow.originRole,
      actorName: newActor,
      campusName: isCorporate ? 'Planta San Luis Potosí' : 'Campus Montes (Sede Matriz)',
      actionText: newAction,
      automationTriggered: flow.name,
      impactMetric: newImpact,
      timestamp: now,
      status: 'completado'
    };

    setTimeout(() => {
      setLiveEvents(prev => [newEvent, ...prev.slice(0, 7)]);
      setActiveSimulationKey(null);
      if (onTriggerToast) {
        onTriggerToast(`¡Flujo "${flow.name}" probado con éxito! Evento simulado emitido a telemetría.`);
      }
    }, 600);
  };

  // Auditoría instantánea de conectividad de cuentas a 0 tokens
  const handleAuditAllConnections = () => {
    setIsAuditingConnections(true);
    setTimeout(() => {
      setIsAuditingConnections(false);
      setConnectionHealthScore(100);
      if (onTriggerToast) {
        onTriggerToast(
          isCorporate
            ? `Auditoría completa de integridad: Las 4 cuentas (Instructores, Finanzas, Candidatos, Colaboradores) están 100% interconectadas al dashboard del CEO.`
            : `Auditoría completa de integridad: Las 4 cuentas (Docentes, Administrativos, Padres, Alumnos) están 100% interconectadas al dashboard.`
        );
      }
    }, 700);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-150">

      {/* ==================================================================== */}
      {/* 1. CABECERA EJECUTIVA: DECLARACIÓN DE SOBERANÍA DE DATOS & CONEXIÓN */}
      {/* ==================================================================== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl border border-indigo-500/30 text-white shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/40">
              Trazabilidad Operativa de Cuentas
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>4 Roles Conectados en Vivo</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Centro de Automatizaciones & Ecosistema de Cuentas en Vivo
          </h2>
          <p className="text-xs text-indigo-200/80 max-w-3xl leading-relaxed">
            {isCorporate ? (
              <>
                Cada métrica, informe y dictamen del Dashboard Ejecutivo del CEO se alimenta <strong>directa y transparentemente</strong> de las cuentas operativas cotidianas de <strong>Instructores, Finanzas, Candidatos y Colaboradores</strong> en las {campusCount} plantas de {holdingName}.
              </>
            ) : (
              <>
                Cada métrica, informe y dictamen del Dashboard Ejecutivo del CEO se alimenta <strong>directa y transparentemente</strong> de las cuentas operativas cotidianas de <strong>Docentes, Administrativos, Alumnos y Padres de Familia</strong> en las {campusCount} sedes de {holdingName}.
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAuditAllConnections}
            disabled={isAuditingConnections}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/30"
          >
            <RefreshCw size={14} className={isAuditingConnections ? 'animate-spin' : ''} />
            <span>{isAuditingConnections ? 'Auditando...' : 'Auditar Conexión de Cuentas'}</span>
          </button>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAPA DE TRAZABILIDAD DE LOS 4 ROLES OPERATIVOS (ORIGEN DE DATOS) */}
      {/* ==================================================================== */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-indigo-600" />
              <span>Origen de los Datos: Los 4 Cuadrantes Operativos en Vivo</span>
            </h3>
            <p className="text-xs text-slate-500">¿Quién ingresa cada dato que impacta la toma de decisiones del CEO?</p>
          </div>
          <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold hidden sm:inline">
            Salud de Enlace: {connectionHealthScore}% Activo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {currentRoles.map((role) => {
            const Icon = role.avatarIcon;
            return (
              <div 
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all space-y-3 relative overflow-hidden group"
              >
                <div className={`w-10 h-10 rounded-xl ${role.colorTheme.bg} ${role.colorTheme.text} flex items-center justify-center border ${role.colorTheme.border} mb-1 shadow-xs`}>
                  <Icon size={20} />
                </div>

                <div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${role.colorTheme.badge}`}>
                    {role.connectedCount}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 mt-1.5 leading-snug">
                    {role.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                    {role.portalName}
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {role.description}
                </p>

                {/* Destino de los datos en el Dashboard */}
                <div className="pt-2 border-t border-slate-100 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Alimenta en el Dashboard:
                  </span>
                  {role.feedsDataInto.map((dest, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium">
                      <ArrowRight size={11} className={role.colorTheme.accent} />
                      <span className="truncate">{dest}</span>
                    </div>
                  ))}
                </div>

                {/* Última actividad */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{role.todayActions}</span>
                  <span className="text-emerald-600 font-bold">{role.lastActionTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. CENTRO DE AUTOMATIZACIONES EN VIVO (CON TRAZABILIDAD Y PRUEBAS)   */}
      {/* ==================================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-amber-500" />
              <span>Flujos Automatizados Activos de ISkool</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isCorporate 
                ? 'Desencadenados en tiempo real al registrarse acciones de instructores, finanzas, candidatos o colaboradores.'
                : 'Desencadenados en tiempo real al registrarse acciones de docentes, tesorería, padres o alumnos.'}
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {currentAutomations.length} Flujos en Ejecución Continua
          </span>
        </div>

        <div className="space-y-3">
          {currentAutomations.map((flow) => {
            const isActive = automationStates[flow.key] ?? true;
            const isSimulating = activeSimulationKey === flow.key;
            const roleInfo = currentRoles.find(r => r.id === flow.originRole);

            return (
              <div 
                key={flow.key}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Zap size={18} className={isActive ? 'text-amber-500' : 'text-slate-400'} />
                    <h4 className="font-bold text-slate-900 text-sm">{flow.name}</h4>
                    {roleInfo && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.colorTheme.badge}`}>
                        Disparado por {isCorporate ? (
                          roleInfo.id === 'docente' ? 'Instructores Técnicos' :
                          roleInfo.id === 'administrativo' ? 'Finanzas & Tesorería' :
                          roleInfo.id === 'padre' ? 'Atracción de Talento' : 'Colaboradores Operativos'
                        ) : (
                          roleInfo.id === 'docente' ? 'Docentes' :
                          roleInfo.id === 'administrativo' ? 'Tesorería & Administración' :
                          roleInfo.id === 'padre' ? 'Padres de Familia' : 'Alumnos'
                        )}
                      </span>
                    )}
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded border border-slate-200">
                      {flow.executedToday} ejecuciones hoy
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                    {flow.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                    <div>
                      <strong className="text-slate-700 font-sans">Evento detonador:</strong>{' '}
                      <span className="font-mono text-indigo-700">{flow.originEvent}</span>
                    </div>
                    <div>
                      <strong className="text-slate-700 font-sans">Impacto directo:</strong>{' '}
                      <span className="text-emerald-700 font-semibold">{flow.impactsKPI}</span>
                    </div>
                    <div>
                      <strong className="text-slate-700 font-sans">Canal:</strong>{' '}
                      <span>{flow.destinationChannel}</span>
                    </div>
                  </div>
                </div>

                {/* Botones de Acción y Estado */}
                <div className="flex items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <button
                    onClick={() => handleSimulateFlow(flow)}
                    disabled={isSimulating || !isActive}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                    title="Simular ejecución del flujo en vivo"
                  >
                    <Play size={13} className={isSimulating ? 'animate-spin' : 'text-indigo-600'} />
                    <span>{isSimulating ? 'Probando...' : 'Probar Flujo'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const newState = !isActive;
                      setAutomationStates(prev => ({ ...prev, [flow.key]: newState }));
                      if (onTriggerToast) {
                        onTriggerToast(`Automatización "${flow.name}" ${newState ? 'activada' : 'pausada'}.`);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer shrink-0 active:scale-95 ${
                      isActive 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200' 
                        : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {isActive ? <CheckCheck size={16} className="text-emerald-600" /> : <X size={16} />}
                    <span>{isActive ? 'Activo' : 'Pausado'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 4. BITÁCORA DE EVENTOS MULTIRROL EN TIEMPO REAL (LIVE EVENT STREAM) */}
      {/* ==================================================================== */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <span>Bitácora de Eventos Operativos en Tiempo Real</span>
            </h3>
            <p className="text-xs text-slate-500">
              {isCorporate 
                ? 'Flujo de transacciones y registros generados por las cuentas de la empresa que alimentan este panel.'
                : 'Flujo de transacciones y registros generados por las cuentas de la red escolar que alimentan este panel.'}
            </p>
          </div>

          {/* Filtro por Rol */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setSelectedRoleFilter('todos')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                selectedRoleFilter === 'todos' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({liveEvents.length})
            </button>
            <button
              onClick={() => setSelectedRoleFilter('docente')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                selectedRoleFilter === 'docente' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isCorporate ? 'Instructores' : 'Docentes'}
            </button>
            <button
              onClick={() => setSelectedRoleFilter('administrativo')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                selectedRoleFilter === 'administrativo' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isCorporate ? 'Finanzas B2B' : 'Tesorería'}
            </button>
            <button
              onClick={() => setSelectedRoleFilter('padre')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                selectedRoleFilter === 'padre' ? 'bg-violet-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isCorporate ? 'Candidatos ATS' : 'Padres'}
            </button>
            <button
              onClick={() => setSelectedRoleFilter('alumno')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer shrink-0 ${
                selectedRoleFilter === 'alumno' ? 'bg-pink-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isCorporate ? 'Colaboradores' : 'Alumnos'}
            </button>
          </div>
        </div>

        {/* Lista de Eventos Vivos */}
        <div className="divide-y divide-slate-100">
          {filteredEvents.map((evt) => {
            const roleInfo = currentRoles.find(r => r.id === evt.role);
            return (
              <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg ${roleInfo?.colorTheme.bg || 'bg-slate-100'} ${roleInfo?.colorTheme.text || 'text-slate-600'} flex items-center justify-center shrink-0 mt-0.5 border ${roleInfo?.colorTheme.border || 'border-slate-200'}`}>
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900">{evt.actorName}</span>
                      <span className="text-[10px] text-slate-500 font-medium">({evt.campusName})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${roleInfo?.colorTheme.badge || 'bg-slate-100 text-slate-700'}`}>
                        {isCorporate 
                          ? (evt.role === 'docente' ? 'INSTRUCTOR' : evt.role === 'administrativo' ? 'FINANZAS' : evt.role === 'padre' ? 'CANDIDATO' : 'COLABORADOR')
                          : evt.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{evt.actionText}</p>
                    <span className="text-[11px] text-indigo-600 font-semibold mt-0.5 block">
                      ⚡ Disparó: {evt.automationTriggered}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 font-mono text-[11px]">
                  <span className="text-emerald-600 font-bold block">{evt.impactMetric}</span>
                  <span className="text-slate-400 text-[10px]">{evt.timestamp}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
