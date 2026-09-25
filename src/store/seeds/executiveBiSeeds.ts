/**
 * =========================================================================
 * ISKOOL EXECUTIVE BI SEEDS - DATA POOL ESTRATÉGICO PARA CEO & HOLDINGS
 * =========================================================================
 * Datos deterministas de alto impacto para la suite analítica directiva:
 * 1. Flujo de Caja Multianual & EBITDA (12 meses continuos + forecast a 90 días)
 * 2. Benchmark de Rendimiento de 4 Planteles (Holding IBIME)
 * 3. Matriz de Aging de Cartera & Riesgo Crediticio (0-30d, 31-60d, 60+d)
 * 4. Embudo de Admisiones, Conversión & Unit Economics (CAC vs LTV)
 * =========================================================================
 */

export interface MonthlyCashflowRecord {
  month: string;
  monthIndex: number;
  year: number;
  tuitionRevenues: number;
  enrollmentRevenues: number;
  extracurricularRevenues: number;
  totalRevenues: number;
  teacherPayroll: number;
  adminPayroll: number;
  facilityLeasing: number;
  operatingExpenses: number;
  totalExpenses: number;
  ebitda: number;
  ebitdaMargin: number;
  isForecast?: boolean;
}

export interface CampusBenchmarkRecord {
  campusId: string;
  campusName: string;
  shortName: string;
  slug: string;
  location: string;
  capacityTotal: number;
  currentEnrollment: number;
  occupancyRate: number;
  monthlyRevenue: number;
  revenueTarget: number;
  revenueTargetPct: number;
  enrollmentGrowthPct: number;
  studentRetentionPct: number;
  ebitdaMarginPct: number;
  averageCAC: number;
  facultyCount: number;
  studentTeacherRatio: number;
}

export interface AgingDebtorProfile {
  id: string;
  studentId: string;
  studentName: string;
  campusName: string;
  level: string;
  gradeGroup: string;
  concept: string;
  amount: number;
  dueDate: string;
  daysOverdue: number;
  agingTranche: '0-30' | '31-60' | '60+';
  tutorName: string;
  tutorPhone: string;
  tutorEmail: string;
  scholarshipPct: number;
  cfdiStatus: 'timbrado' | 'pendiente' | 'rechazado';
  uuidFiscal?: string;
  recommendedAction: string;
}

export interface FunnelStage {
  id: 'leads' | 'tours' | 'evaluations' | 'enrolled';
  name: string;
  count: number;
  passRate: number;
  color: string;
  gradient: string;
  description: string;
}

// -------------------------------------------------------------------------
// 1. FLUJO DE CAJA MULTIANUAL & EBITDA HOLDING (12 Meses + Forecast 90 días)
// -------------------------------------------------------------------------
export const HOLDING_CASHFLOW_12M_SEED: MonthlyCashflowRecord[] = [
  {
    month: 'Oct 25',
    monthIndex: 10,
    year: 2025,
    tuitionRevenues: 4120000,
    enrollmentRevenues: 180000,
    extracurricularRevenues: 240000,
    totalRevenues: 4540000,
    teacherPayroll: 2180000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 280000,
    totalExpenses: 3320000,
    ebitda: 1220000,
    ebitdaMargin: 26.87
  },
  {
    month: 'Nov 25',
    monthIndex: 11,
    year: 2025,
    tuitionRevenues: 4180000,
    enrollmentRevenues: 90000,
    extracurricularRevenues: 250000,
    totalRevenues: 4520000,
    teacherPayroll: 2180000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 290000,
    totalExpenses: 3330000,
    ebitda: 1190000,
    ebitdaMargin: 26.33
  },
  {
    month: 'Dic 25',
    monthIndex: 12,
    year: 2025,
    tuitionRevenues: 3950000,
    enrollmentRevenues: 420000,
    extracurricularRevenues: 180000,
    totalRevenues: 4550000,
    teacherPayroll: 2450000,
    adminPayroll: 540000,
    facilityLeasing: 380000,
    operatingExpenses: 310000,
    totalExpenses: 3680000,
    ebitda: 870000,
    ebitdaMargin: 19.12
  },
  {
    month: 'Ene 26',
    monthIndex: 1,
    year: 2026,
    tuitionRevenues: 4250000,
    enrollmentRevenues: 780000,
    extracurricularRevenues: 270000,
    totalRevenues: 5300000,
    teacherPayroll: 2200000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 320000,
    totalExpenses: 3380000,
    ebitda: 1920000,
    ebitdaMargin: 36.23
  },
  {
    month: 'Feb 26',
    monthIndex: 2,
    year: 2026,
    tuitionRevenues: 4280000,
    enrollmentRevenues: 120000,
    extracurricularRevenues: 280000,
    totalRevenues: 4680000,
    teacherPayroll: 2200000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 285000,
    totalExpenses: 3345000,
    ebitda: 1335000,
    ebitdaMargin: 28.53
  },
  {
    month: 'Mar 26',
    monthIndex: 3,
    year: 2026,
    tuitionRevenues: 4310000,
    enrollmentRevenues: 85000,
    extracurricularRevenues: 290000,
    totalRevenues: 4685000,
    teacherPayroll: 2210000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 290000,
    totalExpenses: 3360000,
    ebitda: 1325000,
    ebitdaMargin: 28.28
  },
  {
    month: 'Abr 26',
    monthIndex: 4,
    year: 2026,
    tuitionRevenues: 4200000,
    enrollmentRevenues: 95000,
    extracurricularRevenues: 210000,
    totalRevenues: 4505000,
    teacherPayroll: 2210000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 275000,
    totalExpenses: 3345000,
    ebitda: 1160000,
    ebitdaMargin: 25.75
  },
  {
    month: 'May 26',
    monthIndex: 5,
    year: 2026,
    tuitionRevenues: 4340000,
    enrollmentRevenues: 140000,
    extracurricularRevenues: 310000,
    totalRevenues: 4790000,
    teacherPayroll: 2220000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 300000,
    totalExpenses: 3380000,
    ebitda: 1410000,
    ebitdaMargin: 29.44
  },
  {
    month: 'Jun 26',
    monthIndex: 6,
    year: 2026,
    tuitionRevenues: 4360000,
    enrollmentRevenues: 380000,
    extracurricularRevenues: 320000,
    totalRevenues: 5060000,
    teacherPayroll: 2220000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 310000,
    totalExpenses: 3390000,
    ebitda: 1670000,
    ebitdaMargin: 33.00
  },
  {
    month: 'Jul 26',
    monthIndex: 7,
    year: 2026,
    tuitionRevenues: 3890000,
    enrollmentRevenues: 920000,
    extracurricularRevenues: 160000,
    totalRevenues: 4970000,
    teacherPayroll: 2220000,
    adminPayroll: 480000,
    facilityLeasing: 380000,
    operatingExpenses: 340000,
    totalExpenses: 3420000,
    ebitda: 1550000,
    ebitdaMargin: 31.19
  },
  {
    month: 'Ago 26',
    monthIndex: 8,
    year: 2026,
    tuitionRevenues: 4480000,
    enrollmentRevenues: 1450000,
    extracurricularRevenues: 340000,
    totalRevenues: 6270000,
    teacherPayroll: 2240000,
    adminPayroll: 510000,
    facilityLeasing: 380000,
    operatingExpenses: 460000,
    totalExpenses: 3590000,
    ebitda: 2680000,
    ebitdaMargin: 42.74
  },
  {
    month: 'Sep 26',
    monthIndex: 9,
    year: 2026,
    tuitionRevenues: 4420000,
    enrollmentRevenues: 220000,
    extracurricularRevenues: 360000,
    totalRevenues: 5000000,
    teacherPayroll: 2250000,
    adminPayroll: 510000,
    facilityLeasing: 380000,
    operatingExpenses: 320000,
    totalExpenses: 3460000,
    ebitda: 1540000,
    ebitdaMargin: 30.80
  },
  // PROYECCIONES FORECAST (90 Días Futuros)
  {
    month: 'Oct 26 (F)',
    monthIndex: 10,
    year: 2026,
    tuitionRevenues: 4490000,
    enrollmentRevenues: 160000,
    extracurricularRevenues: 370000,
    totalRevenues: 5020000,
    teacherPayroll: 2260000,
    adminPayroll: 510000,
    facilityLeasing: 385000,
    operatingExpenses: 315000,
    totalExpenses: 3470000,
    ebitda: 1550000,
    ebitdaMargin: 30.88,
    isForecast: true
  },
  {
    month: 'Nov 26 (F)',
    monthIndex: 11,
    year: 2026,
    tuitionRevenues: 4520000,
    enrollmentRevenues: 110000,
    extracurricularRevenues: 380000,
    totalRevenues: 5010000,
    teacherPayroll: 2260000,
    adminPayroll: 510000,
    facilityLeasing: 385000,
    operatingExpenses: 320000,
    totalExpenses: 3475000,
    ebitda: 1535000,
    ebitdaMargin: 30.64,
    isForecast: true
  },
  {
    month: 'Dic 26 (F)',
    monthIndex: 12,
    year: 2026,
    tuitionRevenues: 4350000,
    enrollmentRevenues: 490000,
    extracurricularRevenues: 220000,
    totalRevenues: 5060000,
    teacherPayroll: 2520000,
    adminPayroll: 560000,
    facilityLeasing: 385000,
    operatingExpenses: 330000,
    totalExpenses: 3795000,
    ebitda: 1265000,
    ebitdaMargin: 25.00,
    isForecast: true
  }
];

// -------------------------------------------------------------------------
// 2. BENCHMARK COMPARATIVO DE LOS 4 PLANTELES (HOLDING IBIME)
// -------------------------------------------------------------------------
export const CAMPUS_BENCHMARK_SEED: CampusBenchmarkRecord[] = [
  {
    campusId: 'montes',
    campusName: 'Campus Montes (Sede Matriz & CCH)',
    shortName: 'Campus Montes',
    slug: 'montes',
    location: 'Jardines de Morelos Secc. Montes, Ecatepec',
    capacityTotal: 1720,
    currentEnrollment: 1620,
    occupancyRate: 94.19,
    monthlyRevenue: 2180000,
    revenueTarget: 2200000,
    revenueTargetPct: 99.09,
    enrollmentGrowthPct: 5.8,
    studentRetentionPct: 96.4,
    ebitdaMarginPct: 32.4,
    averageCAC: 1280,
    facultyCount: 88,
    studentTeacherRatio: 18.4
  },
  {
    campusId: 'coacalco',
    campusName: 'Campus Coacalco (Primaria y Secundaria)',
    shortName: 'Campus Coacalco',
    slug: 'coacalco',
    location: 'Av. Dalias #45, Coacalco de Berriozábal',
    capacityTotal: 1100,
    currentEnrollment: 980,
    occupancyRate: 89.09,
    monthlyRevenue: 1320000,
    revenueTarget: 1400000,
    revenueTargetPct: 94.29,
    enrollmentGrowthPct: 4.2,
    studentRetentionPct: 94.8,
    ebitdaMarginPct: 28.6,
    averageCAC: 1450,
    facultyCount: 56,
    studentTeacherRatio: 17.5
  },
  {
    campusId: 'central',
    campusName: 'Campus Central Ecatepec (K-12 Completo)',
    shortName: 'Campus Central',
    slug: 'central',
    location: 'Av. Revolución 30-30, San Cristóbal Centro',
    capacityTotal: 850,
    currentEnrollment: 720,
    occupancyRate: 84.71,
    monthlyRevenue: 960000,
    revenueTarget: 1050000,
    revenueTargetPct: 91.43,
    enrollmentGrowthPct: 3.5,
    studentRetentionPct: 93.1,
    ebitdaMarginPct: 26.2,
    averageCAC: 1560,
    facultyCount: 42,
    studentTeacherRatio: 17.1
  },
  {
    campusId: 'torres',
    campusName: 'Campus Las Torres (Preescolar y Primaria)',
    shortName: 'Campus Torres',
    slug: 'torres',
    location: 'Av. Las Torres #120, Rinconada de Aragón',
    capacityTotal: 550,
    currentEnrollment: 420,
    occupancyRate: 76.36,
    monthlyRevenue: 540000,
    revenueTarget: 620000,
    revenueTargetPct: 87.10,
    enrollmentGrowthPct: 7.1,
    studentRetentionPct: 91.5,
    ebitdaMarginPct: 21.8,
    averageCAC: 1680,
    facultyCount: 29,
    studentTeacherRatio: 14.5
  }
];

// -------------------------------------------------------------------------
// 3. MATRIZ DE AGING DE CARTERA VENCIDA & REGISTROS DEUDORES
// -------------------------------------------------------------------------
export const AGING_TRANCHES_SUMMARY = {
  '0-30': {
    id: '0-30',
    label: '0 a 30 Días',
    subtitle: 'Corriente / Preventivo',
    amount: 19800,
    debtorsCount: 6,
    riskLevel: 'Bajo',
    colorHex: '#38bdf8',
    gradientClass: 'from-sky-500 to-cyan-500',
    actionText: 'Envío de recordatorio amistoso vía WhatsApp/App Padres'
  },
  '31-60': {
    id: '31-60',
    label: '31 a 60 Días',
    subtitle: 'En Gestión / Suspensión Temporal',
    amount: 14200,
    debtorsCount: 4,
    riskLevel: 'Medio',
    colorHex: '#fbbf24',
    gradientClass: 'from-amber-500 to-orange-500',
    actionText: 'Llamada directiva y bloqueo de boleta en portal'
  },
  '60+': {
    id: '60+',
    label: '60+ Días',
    subtitle: 'Cartera Crítica / Convenio Obligatorio',
    amount: 5100,
    debtorsCount: 2,
    riskLevel: 'Crítico',
    colorHex: '#f43f5e',
    gradientClass: 'from-rose-500 to-red-600',
    actionText: 'Convenio formal de pagos o rescisión de matrícula'
  }
};

export const DETAILED_AGING_DEBTORS_SEED: AgingDebtorProfile[] = [
  // 0 - 30 Días
  {
    id: 'deb-01',
    studentId: 'std-juan-p',
    studentName: 'Juan Pablo Morales',
    campusName: 'Campus Montes',
    level: 'Primaria',
    gradeGroup: '1º A',
    concept: 'Colegiatura de Septiembre 2026',
    amount: 3200,
    dueDate: '2026-09-10',
    daysOverdue: 15,
    agingTranche: '0-30',
    tutorName: 'Roberto Morales V.',
    tutorPhone: '55-4123-9988',
    tutorEmail: 'rmorales@gmail.com',
    scholarshipPct: 0,
    cfdiStatus: 'timbrado',
    uuidFiscal: 'A1B2C3D4-5678-90AB-CDEF-123456789001',
    recommendedAction: 'Enviar notificación push y enlace de pago SPEI con descuento por pronto pago.'
  },
  {
    id: 'deb-02',
    studentId: 'std-santi-gomez',
    studentName: 'Santiago Gómez Pérez',
    campusName: 'Campus Coacalco',
    level: 'Primaria',
    gradeGroup: '2º B',
    concept: 'Colegiatura de Septiembre 2026',
    amount: 3200,
    dueDate: '2026-09-10',
    daysOverdue: 15,
    agingTranche: '0-30',
    tutorName: 'Mariana Pérez Castro',
    tutorPhone: '55-8822-1133',
    tutorEmail: 'mperez@outlook.com',
    scholarshipPct: 15,
    cfdiStatus: 'timbrado',
    uuidFiscal: 'B2C3D4E5-6789-01BC-DEF0-123456789002',
    recommendedAction: 'Revisar cumplimiento de Beca Académica (15%) antes del corte de mes.'
  },
  {
    id: 'deb-03',
    studentId: 'std-camila-r',
    studentName: 'Camila Reyes Ortiz',
    campusName: 'Campus Central',
    level: 'Secundaria',
    gradeGroup: '1º A',
    concept: 'Colegiatura de Septiembre 2026 + Taller Robótica',
    amount: 3600,
    dueDate: '2026-09-10',
    daysOverdue: 15,
    agingTranche: '0-30',
    tutorName: 'Ing. Fernando Reyes',
    tutorPhone: '55-9900-2211',
    tutorEmail: 'freyes@empresa.com.mx',
    scholarshipPct: 0,
    cfdiStatus: 'timbrado',
    uuidFiscal: 'C3D4E5F6-7890-12CD-EF01-123456789003',
    recommendedAction: 'Recordar saldo pendiente de taller extracurricular.'
  },
  {
    id: 'deb-04',
    studentId: 'std-mateo-s',
    studentName: 'Mateo Sánchez Lara',
    campusName: 'Campus Montes',
    level: 'Bachillerato CCH',
    gradeGroup: '5º Semestre A',
    concept: 'Colegiatura de Septiembre 2026',
    amount: 3500,
    dueDate: '2026-09-10',
    daysOverdue: 15,
    agingTranche: '0-30',
    tutorName: 'Patricia Lara M.',
    tutorPhone: '55-7766-5544',
    tutorEmail: 'plara@yahoo.com.mx',
    scholarshipPct: 10,
    cfdiStatus: 'timbrado',
    uuidFiscal: 'D4E5F6A7-8901-23DE-F012-123456789004',
    recommendedAction: 'Enviar recordatorio directo al correo institucional del tutor.'
  },
  {
    id: 'deb-05',
    studentId: 'std-sofia-t',
    studentName: 'Sofía Torres Benítez',
    campusName: 'Campus Torres',
    level: 'Preescolar',
    gradeGroup: '3º K',
    concept: 'Colegiatura de Septiembre 2026',
    amount: 2900,
    dueDate: '2026-09-10',
    daysOverdue: 15,
    agingTranche: '0-30',
    tutorName: 'Lic. Andrés Torres',
    tutorPhone: '55-3344-5566',
    tutorEmail: 'atorres@corporativo.com',
    scholarshipPct: 0,
    cfdiStatus: 'timbrado',
    uuidFiscal: 'E5F6A7B8-9012-34EF-0123-123456789005',
    recommendedAction: 'Verificar fecha prometida de pago en quincena.'
  },
  {
    id: 'deb-06',
    studentId: 'std-lucas-v',
    studentName: 'Lucas Villalobos Díaz',
    campusName: 'Campus Coacalco',
    level: 'Primaria',
    gradeGroup: '4º A',
    concept: 'Colegiatura de Septiembre 2026',
    amount: 3400,
    dueDate: '2026-09-10',
    daysOverdue: 15,
    agingTranche: '0-30',
    tutorName: 'Dra. Elena Díaz S.',
    tutorPhone: '55-2211-9900',
    tutorEmail: 'ediaz@hospital.org.mx',
    scholarshipPct: 0,
    cfdiStatus: 'timbrado',
    uuidFiscal: 'F6A7B8C9-0123-45F0-1234-123456789006',
    recommendedAction: 'Reenviar factura electrónica CFDI 4.0 solicitada.'
  },

  // 31 - 60 Días
  {
    id: 'deb-07',
    studentId: 'std-diego-vargas',
    studentName: 'Diego Vargas Ríos',
    campusName: 'Campus Montes',
    level: 'Secundaria',
    gradeGroup: '3º A',
    concept: 'Colegiaturas de Agosto y Septiembre 2026',
    amount: 3800,
    dueDate: '2026-08-10',
    daysOverdue: 46,
    agingTranche: '31-60',
    tutorName: 'Israel Vargas López',
    tutorPhone: '55-4160-8800',
    tutorEmail: 'ivargas@constructora.com',
    scholarshipPct: 20,
    cfdiStatus: 'pendiente',
    recommendedAction: 'Citar al tutor para firma de convenio antes de suspender plataformas pedagógicas.'
  },
  {
    id: 'deb-08',
    studentId: 'std-valeria-m',
    studentName: 'Valeria Mendoza Flores',
    campusName: 'Campus Central',
    level: 'Primaria',
    gradeGroup: '5º B',
    concept: 'Colegiaturas de Agosto y Septiembre 2026',
    amount: 3500,
    dueDate: '2026-08-10',
    daysOverdue: 46,
    agingTranche: '31-60',
    tutorName: 'Gabriela Flores T.',
    tutorPhone: '55-5511-2233',
    tutorEmail: 'gflores@gmail.com',
    scholarshipPct: 0,
    cfdiStatus: 'pendiente',
    recommendedAction: 'Llamada telefónica de dirección y plan de dos pagos quincenales.'
  },
  {
    id: 'deb-09',
    studentId: 'std-rodrigo-h',
    studentName: 'Rodrigo Hernández Cruz',
    campusName: 'Campus Coacalco',
    level: 'Secundaria',
    gradeGroup: '2º C',
    concept: 'Colegiatura de Agosto 2026 + Reinscripción Pendiente',
    amount: 3700,
    dueDate: '2026-08-10',
    daysOverdue: 46,
    agingTranche: '31-60',
    tutorName: 'Carlos Hernández M.',
    tutorPhone: '55-6677-8899',
    tutorEmail: 'chernandez@comercial.com',
    scholarshipPct: 0,
    cfdiStatus: 'pendiente',
    recommendedAction: 'Establecer fecha límite improrrogable antes de entrega de evaluaciones.'
  },
  {
    id: 'deb-10',
    studentId: 'std-alondra-p',
    studentName: 'Alondra Paredes Silva',
    campusName: 'Campus Torres',
    level: 'Primaria',
    gradeGroup: '3º A',
    concept: 'Colegiaturas de Agosto y Septiembre 2026',
    amount: 3200,
    dueDate: '2026-08-10',
    daysOverdue: 46,
    agingTranche: '31-60',
    tutorName: 'Lucía Silva R.',
    tutorPhone: '55-1234-5678',
    tutorEmail: 'lsilva@servicios.mx',
    scholarshipPct: 25,
    cfdiStatus: 'pendiente',
    recommendedAction: 'Revisión socioeconómica de beca por contingencia laboral familiar.'
  },

  // 60+ Días (Cartera Crítica)
  {
    id: 'deb-11',
    studentId: 'std-elena-salazar',
    studentName: 'Elena Salazar Castro',
    campusName: 'Campus Montes',
    level: 'Secundaria',
    gradeGroup: '2º A',
    concept: 'Colegiatura de Julio y Agosto 2026 (Extemporáneo)',
    amount: 1900,
    dueDate: '2026-07-10',
    daysOverdue: 77,
    agingTranche: '60+',
    tutorName: 'Guillermo Salazar B.',
    tutorPhone: '55-9876-5432',
    tutorEmail: 'gsalazar@asesores.com',
    scholarshipPct: 50,
    cfdiStatus: 'pendiente',
    recommendedAction: 'URGENTE: Firmar pagaré por saldo remanente con beca condicionada al 50%.'
  },
  {
    id: 'deb-12',
    studentId: 'std-bruno-g',
    studentName: 'Bruno Guzmán Rivas',
    campusName: 'Campus Central',
    level: 'Bachillerato CCH',
    gradeGroup: '6º Semestre B',
    concept: 'Colegiaturas de Junio, Julio y Agosto 2026',
    amount: 3200,
    dueDate: '2026-06-10',
    daysOverdue: 107,
    agingTranche: '60+',
    tutorName: 'Mtro. Héctor Guzmán',
    tutorPhone: '55-8765-4321',
    tutorEmail: 'hguzman@abogados.com.mx',
    scholarshipPct: 0,
    cfdiStatus: 'rechazado',
    recommendedAction: 'ALERTA LEGAL: Cobranza extrajudicial o suspensión de derecho a titulación SEP.'
  }
];

// -------------------------------------------------------------------------
// 4. EMBUDO DE ADMISIONES & UNIT ECONOMICS (CAC / LTV)
// -------------------------------------------------------------------------
export const ENROLLMENT_FUNNEL_SEED: FunnelStage[] = [
  {
    id: 'leads',
    name: 'Leads / Prospectos Registrados',
    count: 450,
    passRate: 62.22,
    color: '#3b82f6',
    gradient: 'from-blue-600 to-indigo-600',
    description: 'Familias captadas mediante pauta digital, eventos comunitarios y recomendaciones.'
  },
  {
    id: 'tours',
    name: 'Recorridos en Campus / Open House',
    count: 280,
    passRate: 69.64,
    color: '#06b6d4',
    gradient: 'from-cyan-500 to-teal-500',
    description: 'Citas presenciales atendidas con directores y demostración de aulas inteligentes.'
  },
  {
    id: 'evaluations',
    name: 'Evaluaciones Diagnósticas NEM',
    count: 195,
    passRate: 83.08,
    color: '#10b981',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'Exámenes diagnósticos pedagógicos y entrevistas socio-académicas superadas.'
  },
  {
    id: 'enrolled',
    name: 'Inscripciones Formalizadas & Pagadas',
    count: 162,
    passRate: 100.0,
    color: '#22c55e',
    gradient: 'from-emerald-600 to-green-500',
    description: 'Alumnos formalmente matriculados con cuota de inscripción liquidada.'
  }
];

export const HOLDING_GROWTH_UNIT_ECONOMICS = {
  overallConversionRatePct: 36.0,
  averageCACMxn: 1420,
  projectedLTVMxn: 108000,
  ltvToCacRatio: 76.05,
  averageMonthlyTuitionMxn: 3450,
  averageEnrollmentFeeMxn: 5200,
  churnRateAnnualPct: 3.8,
  retentionRateAnnualPct: 96.2,
  referralPercentage: 42.5
};

// -------------------------------------------------------------------------
// 5. RESUMEN EJECUTIVO GLOBAL DEL HOLDING (C-LEVEL TELEMETRY)
// -------------------------------------------------------------------------
export const HOLDING_EXECUTIVE_SUMMARY_SEED = {
  holdingName: 'Instituto Bilingüe IBIME',
  holdingSlug: 'ibime',
  holdingSubtitle: 'Red de 4 Planteles de Excelencia · Bachillerato CCH UNAM',
  ebitdaMarginPct: 28.4,
  ebitdaMarginTrend: '+3.2%',
  totalRevenueMxn: 4843200,
  revenueTrend: '+8.4% vs meta',
  collectionEfficiencyPct: 94.2,
  collectionTargetPct: 95.0,
  collectionTotalCollectedMxn: 4562200,
  collectionTotalExigibleMxn: 4843200,
  totalCapacityOccupancyPct: 88.6,
  totalCapacitySeats: 4220,
  totalEnrolledStudents: 3740,
  activeFacultyStaff: 215,
  studentFacultyRatio: 17.4,
  cfdiTimbradoEfficiencyPct: 96.8,
  lastAuditTimestamp: '2026-09-25T11:15:00-06:00'
};
