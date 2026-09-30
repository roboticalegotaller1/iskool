/**
 * SEEDS DE TRAZABILIDAD Y AUDITORÍA FORENSE DE FLUJOS AUTOMATIZADOS (ISKOOL BI)
 * Contiene los registros inmutables de ejecución detallada por flujo para responder
 * con precisión quirúrgica a quiénes, cuándo, por qué y con qué impacto se ejecutaron.
 */

export interface FlowExecutionTraceRecord {
  id: string;
  flowKey: string;
  timestamp: string; // e.g. 'Hoy, 08:32:15 hrs'
  isoTime: string;
  subjectName: string;
  subjectType: 'student' | 'guardian' | 'teacher' | 'invoice' | 'curriculum' | 'collaborator';
  subjectId: string; // Matrícula / RFC / Folio
  campusId: 'montes' | 'coacalco' | 'central' | 'torres';
  campusName: string;
  levelGradeGroup: string;
  guardianName?: string;
  guardianPhone?: string;
  triggerCause: string;
  kpiImpact: string;
  actionsTaken: string[];
  channelDelivered: string;
  status: 'active' | 'in_review' | 'resolved' | 'dispatched';
  statusLabel: string;
  riskScore?: number; // 0 - 100
  financialAmount?: number;
  immutableLedgerHash: string;
  latencyMs: number;
  expedienteSummary?: string;
}

// =============================================================================
// 1. FLUJO: ALERTA PREDICTIVA DE DESERCIÓN ESCOLAR (4 EJECUCIONES HOY)
// =============================================================================
export const DROPOUT_ALERT_TRACE_SEEDS: FlowExecutionTraceRecord[] = [
  {
    id: 'TRACE-DES-001',
    flowKey: 'alerta-desercion',
    timestamp: 'Hoy, 08:32:15 hrs',
    isoTime: '2026-09-30T08:32:15',
    subjectName: 'Mateo Hernández Ruiz',
    subjectType: 'student',
    subjectId: 'ALU-2026-M401',
    campusId: 'montes',
    campusName: 'Campus Montes',
    levelGradeGroup: '2° Secundaria A',
    guardianName: 'Ing. Roberto Hernández & Lic. Marcela Ruiz',
    guardianPhone: '+52 55 4192 8831',
    triggerCause: '3 inasistencias consecutivas sin justificar (25, 26 y 29 de Sep) + Saldo vencido de colegiatura Septiembre ($4,200 MXN)',
    kpiImpact: 'Retención de Matrícula (Prevención de Deserción Escolar)',
    actionsTaken: [
      'Generación automática de Expediente 360 con cruce académico y financiero',
      'Notificación prioritaria despachada a Dirección de Plantel & Coordinación Psicopedagógica',
      'Cita de mediación presencial agendada para el 1 de Octubre a las 10:00 hrs con tutor legal',
      'Pre-aprobación en sistema de plan de beca rescate temporal (20%) para asegurar permanencia'
    ],
    channelDelivered: 'Comité de Dirección Escolar + Notificación Push Directiva + Llamada de Coordinación',
    status: 'active',
    statusLabel: 'En Intervención Activa',
    riskScore: 92,
    financialAmount: 4200,
    immutableLedgerHash: '0x7a31b409c91f4d8a11e03bf2890c2e4f8819a5cd',
    latencyMs: 0.6,
    expedienteSummary: 'Alumno con promedio histórico de 8.8. El ausentismo reciente coincide con una complicación económica temporal reportada por el tutor. Se recomienda aplicar convenio de regularización para evitar la pérdida del ciclo.'
  },
  {
    id: 'TRACE-DES-002',
    flowKey: 'alerta-desercion',
    timestamp: 'Hoy, 09:14:40 hrs',
    isoTime: '2026-09-30T09:14:40',
    subjectName: 'Sofía Castillo Mora',
    subjectType: 'student',
    subjectId: 'ALU-2026-C188',
    campusId: 'coacalco',
    campusName: 'Campus Coacalco',
    levelGradeGroup: '5° Primaria B',
    guardianName: 'Arq. Fernando Castillo & Sra. Lorena Mora',
    guardianPhone: '+52 55 8301 2294',
    triggerCause: '3 inasistencias consecutivas tras aviso preliminar de cambio de domicilio laboral + Adeudo corriente de colegiatura ($3,800 MXN)',
    kpiImpact: 'Retención de Matrícula & Fidelización Familiar en Red IBIME',
    actionsTaken: [
      'Activación de protocolo de transferencia entre planteles IBIME (Campus Coacalco -> Campus Central)',
      'Congelamiento de recargos administrativos por traslado familiar autorizado',
      'Envío de propuesta de revalidación inmediata sin costo de inscripción al tutor legal'
    ],
    channelDelivered: 'WhatsApp Institucional + Expediente Digital + Llamada de Admisiones',
    status: 'in_review',
    statusLabel: 'En Seguimiento con Tutor',
    riskScore: 84,
    financialAmount: 3800,
    immutableLedgerHash: '0x4e92a110bb571a82f091c6e11894d03e55123c71',
    latencyMs: 0.5,
    expedienteSummary: 'Familia con excelente récord de pago en ciclos anteriores. El cambio de residencia a 15 km abre la oportunidad de retenerla en Campus Central manteniendo su antigüedad.'
  },
  {
    id: 'TRACE-DES-003',
    flowKey: 'alerta-desercion',
    timestamp: 'Hoy, 10:45:12 hrs',
    isoTime: '2026-09-30T10:45:12',
    subjectName: 'Emiliano Vega Domínguez',
    subjectType: 'student',
    subjectId: 'ALU-2026-T092',
    campusId: 'torres',
    campusName: 'Campus Torres',
    levelGradeGroup: '3° Preparatoria UNAM',
    guardianName: 'Mtra. Claudia Domínguez Pineda',
    guardianPhone: '+52 55 1198 4402',
    triggerCause: 'Baja en entrega de actividades en Lienzo Digital (4 retos reprobados) + 3 ausencias en días viernes y adeudo pendiente ($4,500 MXN)',
    kpiImpact: 'Eficiencia Terminal de Bachillerato UNAM & Cobranza Líquida',
    actionsTaken: [
      'Canalización a tutoría académica extracurricular con profesor titular de Ciencias',
      'Convenio de pago acordado en 2 parcialidades quincenales sin intereses',
      'Reapertura en Lienzo Digital de actividades formativas para recuperación de puntos de evaluación'
    ],
    channelDelivered: 'Portal Alumnos + Notificación a Tutor + Comité de Becas',
    status: 'resolved',
    statusLabel: 'Convenio Acordado',
    riskScore: 78,
    financialAmount: 4500,
    immutableLedgerHash: '0x91bd3302fc80941a87b140cd55e903bc102a55e9',
    latencyMs: 0.7,
    expedienteSummary: 'Alumno del último año de preparatoria con aspiración a ingeniería UNAM. La madre firmó acuerdo de regularización financiera y el alumno inició asesorías académicas.'
  },
  {
    id: 'TRACE-DES-004',
    flowKey: 'alerta-desercion',
    timestamp: 'Hoy, 11:20:05 hrs',
    isoTime: '2026-09-30T11:20:05',
    subjectName: 'Valeria Mendoza Solís',
    subjectType: 'student',
    subjectId: 'ALU-2026-L315',
    campusId: 'central',
    campusName: 'Campus Central',
    levelGradeGroup: '1° Secundaria B',
    guardianName: 'Dr. Héctor Mendoza & Lic. Carmen Solís',
    guardianPhone: '+52 55 6712 9043',
    triggerCause: 'Inasistencia acumulada de 3 días por cuadro de salud no homologado + Bloqueo preventivo en sistema de reinscripciones',
    kpiImpact: 'Continuidad de Matrícula & Regularización Médica Escolar',
    actionsTaken: [
      'Carga y validación de certificado médico oficial en la Bóveda Escolar Digital',
      'Desbloqueo inmediato del expediente y justificación de faltas en control de asistencia',
      'Liquidación de adeudo vía transferencia SPEI conciliada en tiempo real'
    ],
    channelDelivered: 'Expediente 360 + Mesa de Ayuda Escolar + Correo Certificado',
    status: 'resolved',
    statusLabel: 'Resuelto / Regularizado',
    riskScore: 65,
    financialAmount: 4200,
    immutableLedgerHash: '0x2c09ef784d1a0984ee710bca3318b76c491901b2',
    latencyMs: 0.4,
    expedienteSummary: 'Caso cerrado satisfactoriamente. Se constató justificación médica completa. El alumno ya se encuentra en aula regular y el pago de colegiatura fue acreditado.'
  }
];

// =============================================================================
// 2. FLUJO: COBRANZA PREVENTIVA 5 DÍAS ANTES (42 EJECUCIONES HOY - EXTRACTO SEED)
// =============================================================================
export const COLLECTION_PREVENTIVE_TRACE_SEEDS: FlowExecutionTraceRecord[] = Array.from({ length: 42 }, (_, i) => {
  const campuses: Array<{ id: 'montes' | 'coacalco' | 'central' | 'torres'; name: string }> = [
    { id: 'montes', name: 'Campus Montes' },
    { id: 'coacalco', name: 'Campus Coacalco' },
    { id: 'central', name: 'Campus Central' },
    { id: 'torres', name: 'Campus Torres' }
  ];
  const campus = campuses[i % campuses.length];
  const grades = ['1° Primaria A', '3° Primaria B', '2° Secundaria A', '1° Prep CCH', '6° Primaria A', '3° Secundaria B'];
  const grade = grades[i % grades.length];
  const names = [
    'Alejandro Morales Cruz', 'Camila Ortiz Vargas', 'Diego Navarro Gómez',
    'Lucía Reyes Ramos', 'Santiago Peña Romero', 'Regina Soto Méndez',
    'Daniela Flores Lara', 'Rodrigo Silva Paredes', 'Valentina Ruiz Castro',
    'Gabriel Delgado Gil', 'Ximena Campos Ríos', 'Emilio Cruz Villanueva'
  ];
  const subjectName = `${names[i % names.length]} (${i + 1})`;
  const amount = 3800 + ((i * 150) % 2200);
  const hour = 7 + Math.floor(i / 10);
  const minute = (i * 7) % 60;
  const timeStr = `Hoy, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:22 hrs`;

  return {
    id: `TRACE-COB-${(i + 1).toString().padStart(3, '0')}`,
    flowKey: 'cobranza-preventiva',
    timestamp: timeStr,
    isoTime: `2026-09-30T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:22`,
    subjectName,
    subjectType: 'guardian',
    subjectId: `TUT-2026-${(1000 + i)}`,
    campusId: campus.id,
    campusName: campus.name,
    levelGradeGroup: grade,
    guardianName: `Tutor Legal de ${subjectName.split(' ')[0]}`,
    triggerCause: `Vencimiento de colegiatura próximo en 5 días (Fecha límite: 5 de Octubre) - Colegiatura ordinaria $${amount.toLocaleString('es-MX')} MXN`,
    kpiImpact: 'Tasa de Cobranza Media (+4.2%) & Reducción de Cartera en Mora',
    actionsTaken: [
      'Generación de liga bancaria SPEI directa con CLABE interbancaria personalizada',
      'Despacho de recordatorio preventivo amable con detalle de beca aplicada',
      'Actualización en tiempo real del saldo proyectado en el portal de padres'
    ],
    channelDelivered: 'WhatsApp Institucional + Portal Padres + Notificación Push App Móvil',
    status: (i % 4 === 0) ? 'resolved' : 'dispatched',
    statusLabel: (i % 4 === 0) ? 'Pago Conciliado SPEI' : 'Notificación Entregada',
    financialAmount: amount,
    immutableLedgerHash: `0x${(i * 987654321).toString(16).padEnd(40, 'a')}`,
    latencyMs: 0.7
  };
});

// =============================================================================
// 3. FLUJO: NOTIFICACIÓN DE INASISTENCIA ESCOLAR (18 EJECUCIONES HOY)
// =============================================================================
export const ATTENDANCE_ALERT_TRACE_SEEDS: FlowExecutionTraceRecord[] = Array.from({ length: 18 }, (_, i) => {
  const campuses: Array<{ id: 'montes' | 'coacalco' | 'central' | 'torres'; name: string }> = [
    { id: 'montes', name: 'Campus Montes' },
    { id: 'coacalco', name: 'Campus Coacalco' },
    { id: 'central', name: 'Campus Central' },
    { id: 'torres', name: 'Campus Torres' }
  ];
  const campus = campuses[i % campuses.length];
  const students = [
    'Nicolás Arroyo Fuentes', 'Paula Estrada Ríos', 'Iván Medina Lozano',
    'Constanza Cordero Gil', 'Leonardo Barajas Díaz', 'Renata Vaca Luna',
    'Sebastián Trejo Cruz', 'Mariana Solano Ponce', 'Matías Espinoza Vera'
  ];
  const subjectName = students[i % students.length];
  const min = 15 + (i * 2);
  const timeStr = `Hoy, 08:${min.toString().padStart(2, '0')}:05 hrs`;

  return {
    id: `TRACE-INA-${(i + 1).toString().padStart(3, '0')}`,
    flowKey: 'inasistencias-padres',
    timestamp: timeStr,
    isoTime: `2026-09-30T08:${min.toString().padStart(2, '0')}:05`,
    subjectName,
    subjectType: 'student',
    subjectId: `ALU-INA-${(200 + i)}`,
    campusId: campus.id,
    campusName: campus.name,
    levelGradeGroup: `${(i % 3) + 1}° Secundaria ${String.fromCharCode(65 + (i % 3))}`,
    guardianName: `Padre / Tutor de ${subjectName}`,
    triggerCause: 'Profesor titular cerró pase de lista matutino de las 08:15 hrs marcando falta a primera hora lectiva',
    kpiImpact: 'Seguridad Escolar & Reducción de Ausentismo No Notificado (<1% meta)',
    actionsTaken: [
      'Alerta Push inmediata con confirmación de lectura despachada al smartphone del tutor',
      'Envío de SMS de respaldo de alta prioridad sin costo',
      'Habilitación de botón interactivo de justificación médica inmediata en la app'
    ],
    channelDelivered: 'Notificación Push prioritaria + SMS al tutor legal',
    status: (i % 3 === 0) ? 'resolved' : 'dispatched',
    statusLabel: (i % 3 === 0) ? 'Falta Justificada por Tutor' : 'Alerta Entregada al Tutor',
    immutableLedgerHash: `0x${(i * 123456789).toString(16).padEnd(40, 'b')}`,
    latencyMs: 0.4
  };
});

// =============================================================================
// 4. FLUJO: TIMBRADO DE RECIBOS CFDI 4.0 IEDU (64 EJECUCIONES HOY - EXTRACTO)
// =============================================================================
export const CFDI_STAMPING_TRACE_SEEDS: FlowExecutionTraceRecord[] = Array.from({ length: 64 }, (_, i) => {
  const campuses: Array<{ id: 'montes' | 'coacalco' | 'central' | 'torres'; name: string }> = [
    { id: 'montes', name: 'Campus Montes' },
    { id: 'coacalco', name: 'Campus Coacalco' },
    { id: 'central', name: 'Campus Central' },
    { id: 'torres', name: 'Campus Torres' }
  ];
  const campus = campuses[i % campuses.length];
  const amount = 4500 + ((i * 210) % 3500);
  const hour = 8 + Math.floor(i / 15);
  const minute = (i * 4) % 60;
  const timeStr = `Hoy, ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:45 hrs`;

  return {
    id: `TRACE-SAT-${(i + 1).toString().padStart(3, '0')}`,
    flowKey: 'timbrado-cfdi',
    timestamp: timeStr,
    isoTime: `2026-09-30T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:45`,
    subjectName: `Folio Fiscal CFDI #${40100 + i}`,
    subjectType: 'invoice',
    subjectId: `UUID-40100-${i}`,
    campusId: campus.id,
    campusName: campus.name,
    levelGradeGroup: 'Primaria / Secundaria / Bachillerato',
    triggerCause: `Conciliación bancaria SPEI acreditada en ledger ($${amount.toLocaleString('es-MX')} MXN) con RFC y CURP validados`,
    kpiImpact: 'Cumplimiento Fiscal SAT CFDI 4.0 al 100% sin retraso & Complemento IEDU',
    actionsTaken: [
      'Generación de XML Anexo 20 con clave de producto educativo 86121500',
      'Inyección de complemento IEDU (CURP, Nivel Educativo, Clave RVOE del plantel)',
      'Sellado digital con PAC autorizado y timbrado exitoso de alta disponibilidad',
      'Depósito automático en Bóveda Fiscal y envío de XML/PDF al correo del tutor'
    ],
    channelDelivered: 'Bóveda Fiscal Inmutable + Correo Electrónico con XML y PDF sellado',
    status: 'resolved',
    statusLabel: 'Timbrado Exitoso SAT',
    financialAmount: amount,
    immutableLedgerHash: `0x${(i * 543219876).toString(16).padEnd(40, 'c')}`,
    latencyMs: 0.9
  };
});

// =============================================================================
// 5. FLUJO: AUDITORÍA NOCTURNA NEM DE PLANEACIONES (142 EJECUCIONES HOY - EXTRACTO)
// =============================================================================
export const CURRICULAR_AUDIT_TRACE_SEEDS: FlowExecutionTraceRecord[] = Array.from({ length: 142 }, (_, i) => {
  const campuses: Array<{ id: 'montes' | 'coacalco' | 'central' | 'torres'; name: string }> = [
    { id: 'montes', name: 'Campus Montes' },
    { id: 'coacalco', name: 'Campus Coacalco' },
    { id: 'central', name: 'Campus Central' },
    { id: 'torres', name: 'Campus Torres' }
  ];
  const campus = campuses[i % campuses.length];
  const teachers = [
    'Mtra. Rocío Carrillo (Fase 4)', 'Prof. Armando Morales (Fase 5)', 'Lic. Elena Garza (Fase 3)',
    'Mtro. Javier Santos (Fase 6)', 'Dra. Gabriela Ponce (Fase 5)', 'Prof. Miguel Ángel León (Fase 4)'
  ];
  const teacher = teachers[i % teachers.length];
  const phase = 3 + (i % 4);
  const timeStr = `Hoy, 0${1 + Math.floor(i / 30)}:${(i * 3) % 60}:12 hrs`;

  return {
    id: `TRACE-NEM-${(i + 1).toString().padStart(3, '0')}`,
    flowKey: 'auditoria-nem',
    timestamp: timeStr,
    isoTime: `2026-09-30T02:${(i * 3) % 60}:12`,
    subjectName: `Planeación NEM #${i + 1} (${teacher.split(' (')[0]})`,
    subjectType: 'curriculum',
    subjectId: `NEM-DOC-${(500 + i)}`,
    campusId: campus.id,
    campusName: campus.name,
    levelGradeGroup: `Fase ${phase} · Grupo ${(i % 3) + 1}`,
    triggerCause: 'Docente persistió planeación en la Bóveda Curricular con metadatos de sincronización',
    kpiImpact: 'Cobertura Oficial SEP NEM 2024 en Planteles (Meta 90%+)',
    actionsTaken: [
      'Verificación sintáctica de momentos de aula (Inicio: 10m, Desarrollo: 30m, Cierre: 10m)',
      'Validación de PDA oficial SEP y campos formativos articulados',
      'Indexación de rúbrica analítica y entregable tangible en la Bóveda Central de Conocimiento',
      'Emisión de dictamen de conformidad pedagógica 100% aprobado'
    ],
    channelDelivered: 'Reporte BI Ejecutivo para el CEO y Directores de Plantel',
    status: 'resolved',
    statusLabel: 'Auditado & Conforme',
    immutableLedgerHash: `0x${(i * 876543210).toString(16).padEnd(40, 'd')}`,
    latencyMs: 1.1
  };
});

// =============================================================================
// FUNCIÓN CONSULTIVA CENTRAL: OBTENER REGISTROS DE TRAZABILIDAD POR FLUJO
// =============================================================================
export function getTraceabilityRecordsForFlow(flowKey: string): FlowExecutionTraceRecord[] {
  switch (flowKey) {
    case 'alerta-desercion':
      return DROPOUT_ALERT_TRACE_SEEDS;
    case 'cobranza-preventiva':
      return COLLECTION_PREVENTIVE_TRACE_SEEDS;
    case 'inasistencias-padres':
      return ATTENDANCE_ALERT_TRACE_SEEDS;
    case 'timbrado-cfdi':
      return CFDI_STAMPING_TRACE_SEEDS;
    case 'auditoria-nem':
      return CURRICULAR_AUDIT_TRACE_SEEDS;
    default:
      return DROPOUT_ALERT_TRACE_SEEDS;
  }
}
