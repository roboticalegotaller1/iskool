/**
 * Work OS Institucional ISkool - Tipos y Modelos de Datos
 * Sistema Operativo de Trabajo Colaborativo en la Nube para Equipos Escolares
 */

export type WorkOsTaskStatus = 
  | 'PENDIENTE'
  | 'EN_PROCESO'
  | 'URGENTE'
  | 'NO_ATENDIDO'
  | 'RESUELTO'
  | 'ESCALADO_CEO';

export type WorkOsPriority = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';

export type WorkOsViewMode = 
  | 'table'
  | 'kanban'
  | 'gantt'
  | 'timeline'
  | 'automations'
  | 'dashboard'
  | 'evidence_vault'
  | 'ai_studio';

export interface WorkOsChecklistStep {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: string;
  completedBy?: string;
}

export interface WorkOsAuditEntry {
  id: string;
  timestamp: string;
  authorName: string;
  authorEmail: string;
  action: string;
  type: 'opened' | 'status_change' | 'progress_update' | 'meeting_scheduled' | 'document_uploaded' | 'escalated' | 'resolved' | 'ai_assistance';
  details: string;
  metadata?: Record<string, any>;
}

export interface WorkOsEvidenceDoc {
  id: string;
  taskId: string;
  fileName: string;
  fileSize: number;
  fileType: 'pdf' | 'jpg' | 'jpeg' | 'doc' | 'docx';
  uploadedAt: string;
  uploadedBy: string;
  dataUrl?: string; // Base64 o URL para previsualización directa
  notes?: string;
  category: 'resolucion' | 'en_proceso' | 'medica' | 'financiera' | 'legal' | 'general';
}

export interface WorkOsCollaborator {
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  assignedBy: string;
  lastActiveAt?: string;
  contributionPercent?: number;
}

export interface WorkOsTask {
  id: string;
  matterCode: string; // ej: EXP-IBIME-2026-0042
  title: string;
  description: string;
  category: string;
  sectionKey: string; // ej: cobranza, transporte, etc.
  sectionName: string;
  status: WorkOsTaskStatus;
  priority: WorkOsPriority;
  
  // Asignación simple o colaborativa (1 o múltiples personas)
  primaryAssignee: {
    name: string;
    email: string;
    role: string;
  };
  collaborators: WorkOsCollaborator[]; // Para delegación compartida (2 o más)
  
  // Fechas y SLA
  createdAt: string;
  firstOpenedAt?: string; // Registro exacto de apertura
  slaHours: number;
  slaDeadline: string; // ISO string de fecha límite
  timeSpentMinutes?: number;
  resolvedAt?: string;
  
  // Progreso interactivo (0 a 100%)
  // Colores: Rojo <30%, Naranja 30-80%, Amarillo 81-99%, Verde 100%
  progressPercent: number;
  nextStepsOutline?: string;
  checklist: WorkOsChecklistStep[];
  
  // Citas y reuniones
  scheduledAppointment?: {
    date: string;
    locationOrLink: string;
    notes?: string;
    isBeyondSla: boolean;
  };
  
  // Resolución
  resolutionSummary?: string;
  resolutionTimeMinutes?: number;
  
  // Documentos y evidencia
  evidenceDocs: WorkOsEvidenceDoc[];
  
  // Trazabilidad y auditoría cronológica
  auditTrail: WorkOsAuditEntry[];
  
  // Banderas de alerta
  isOverdue: boolean;
  isNeglected: boolean; // (NO ATENDIDO): Sin abrir o progreso < 25% tras umbral
  isEscalatedToCeo: boolean;
  escalationReason?: string;
  
  // Datos originales del remitente (correo que originó la tarea)
  sourceEmail?: {
    id: string;
    senderName: string;
    senderEmail: string;
    subject: string;
    snippet: string;
    bodyText?: string;
    receivedAt: string;
    campus?: string;
  };
  
  // Análisis de IA Pedagógica
  aiAnalysis?: {
    riskScore: number; // 0 - 100
    riskLevel: 'BAJO' | 'MODERADO' | 'ALTO' | 'CRITICO';
    summary: string;
    suggestedNextAction: string;
    draftReply?: string;
  };
}

export interface WorkOsSeedAccount {
  id: string;
  sectionKey: string;
  sectionName: string;
  departmentAccount: string; // ej: finanzas@ibime.edu.mx (Inmutable para el asignado)
  delegateName: string; // Editable por el usuario asignado o CEO
  personalEmail: string; // Correo de contacto personal del delegado
  slaHours: number; // Editable por el CEO
  keywords: string[];
  isRealAccountSwapped: boolean; // Conmutación entre simulado y cuenta real
  realAccountConfig?: {
    provider: 'gmail' | 'outlook' | 'custom_imap';
    imapHost?: string;
    smtpHost?: string;
    verified: boolean;
  };
  stats: {
    totalAssigned: number;
    resolvedOnTime: number;
    inProgress: number;
    overdue: number;
    avgResolutionHours: number;
  };
}

export interface WorkOsTestScenario {
  id: string;
  seedKey: string;
  title: string;
  description: string;
  senderName: string;
  senderEmail: string;
  urgency: WorkOsPriority;
  slaHours: number;
  sampleEvidenceFileName?: string;
  sampleEvidenceType?: 'pdf' | 'jpg' | 'jpeg' | 'doc';
  suggestedSteps: string[];
  sampleResolution: string;
}

export interface WorkOsAutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  trigger: 
    | 'TASK_CREATED'
    | 'TASK_DELEGATED'
    | 'SLA_THRESHOLD_80'
    | 'TASK_UNOPENED_6H'
    | 'PROGRESS_BELOW_25_AFTER_12H'
    | 'TASK_RESOLVED'
    | 'TASK_ESCALATED';
  action:
    | 'MARK_URGENT'
    | 'MARK_NO_ATENDIDO'
    | 'NOTIFY_CEO'
    | 'AUTO_ESCALATE_CEO'
    | 'REQUEST_UPDATE'
    | 'GENERATE_AI_SUMMARY';
  conditions?: {
    field: string;
    operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
    value: any;
  }[];
  executionsCount: number;
  lastExecutedAt?: string;
}

export interface WorkOsDashboardMetrics {
  totalTasks: number;
  resolvedTasks: number;
  inProgressTasks: number;
  urgentTasks: number;
  noAtendidoTasks: number;
  escalatedTasks: number;
  slaComplianceRate: number; // Porcentaje 0 - 100
  avgResolutionHours: number;
  tasksPerSeed: Record<string, number>;
  activeCollaboratorsCount: number;
  totalEvidenceDocs: number;
}

// ============================================================================
// 1. CUENTAS SEED POR DEFECTO (Alineadas con Imagen 1 y requerimientos)
// ============================================================================
export function getDefaultSeedAccounts(tenantId: string, schoolDomain = 'ibime.edu.mx'): WorkOsSeedAccount[] {
  return [
    {
      id: `seed-cobranza-${tenantId}`,
      sectionKey: 'cobranza',
      sectionName: 'Departamento Administrativo / Cobranza',
      departmentAccount: `finanzas@${schoolDomain}`,
      delegateName: 'C.P. Claudia Albarrán',
      personalEmail: `claudia.albarran@${schoolDomain}`,
      slaHours: 24,
      keywords: ['factura', 'cfdi', 'colegiatura', 'pago', 'recargo', 'adeudo', 'beca', 'cobranza', 'prórroga', 'sat', 'iedu'],
      isRealAccountSwapped: false,
      stats: { totalAssigned: 18, resolvedOnTime: 16, inProgress: 2, overdue: 0, avgResolutionHours: 14.5 }
    },
    {
      id: `seed-transporte-${tenantId}`,
      sectionKey: 'transporte',
      sectionName: 'Coordinación de Logística y Prefectura',
      departmentAccount: `transporte@${schoolDomain}`,
      delegateName: 'Prof. Mario Alberto Torres',
      personalEmail: `mario.torres@${schoolDomain}`,
      slaHours: 24,
      keywords: ['transporte', 'ruta 4', 'ruta', 'camión', 'chofer', 'retraso', 'parada', 'demora', 'autobús', 'disciplina', 'prefectura'],
      isRealAccountSwapped: false,
      stats: { totalAssigned: 12, resolvedOnTime: 11, inProgress: 1, overdue: 0, avgResolutionHours: 9.8 }
    },
    {
      id: `seed-control-escolar-${tenantId}`,
      sectionKey: 'control_escolar',
      sectionName: 'Secretaría / Control Escolar',
      departmentAccount: `control.escolar@${schoolDomain}`,
      delegateName: 'Lic. Rebeca Sánchez',
      personalEmail: `rebeca.sanchez@${schoolDomain}`,
      slaHours: 48,
      keywords: ['boleta', 'kardex', 'constancia', 'calificaciones', 'certificado', 'examen', 'evaluación', 'revalidación', 'sep', 'curp'],
      isRealAccountSwapped: false,
      stats: { totalAssigned: 24, resolvedOnTime: 22, inProgress: 2, overdue: 0, avgResolutionHours: 28.2 }
    },
    {
      id: `seed-servicio-medico-${tenantId}`,
      sectionKey: 'servicio_medico',
      sectionName: 'Servicio Médico y Salud Escolar',
      departmentAccount: `enfermeria@${schoolDomain}`,
      delegateName: 'Dra. Andrea Palacios',
      personalEmail: `andrea.palacios@${schoolDomain}`,
      slaHours: 12,
      keywords: ['enfermería', 'médico', 'seguro médico', 'revisión clínica', 'alergia', 'medicamento', 'urgencia', 'caída', 'golpe', 'temperatura'],
      isRealAccountSwapped: false,
      stats: { totalAssigned: 9, resolvedOnTime: 9, inProgress: 0, overdue: 0, avgResolutionHours: 4.1 }
    },
    {
      id: `seed-convivencia-${tenantId}`,
      sectionKey: 'convivencia',
      sectionName: 'Coordinación Académica',
      departmentAccount: `psicopedagogia@${schoolDomain}`,
      delegateName: 'Mtra. Sofía Villalpando',
      personalEmail: `sofia.villalpando@${schoolDomain}`,
      slaHours: 24,
      keywords: ['tutoría', 'convivencia', 'psicopedagogía', 'orientación', 'conducta', 'receso', 'tarea', 'examen', 'adecuación', 'apoyo'],
      isRealAccountSwapped: false,
      stats: { totalAssigned: 15, resolvedOnTime: 14, inProgress: 1, overdue: 0, avgResolutionHours: 18.0 }
    }
  ];
}

// ============================================================================
// 2. ESCENARIOS DE PRUEBA REALISTAS (5 POR CADA CUENTA SEED = 25 ESCENARIOS)
// ============================================================================
export const SEED_TEST_SCENARIOS: WorkOsTestScenario[] = [
  // --- SEED 1: FINANZAS / COBRANZA ---
  {
    id: 'scen-cob-01',
    seedKey: 'cobranza',
    title: 'Solicitud de CFDI 4.0 con complemento IEDU y reajuste de factura',
    description: 'Padre de familia solicita corrección de RFC y emisión de factura con deducción IEDU con CURP del alumno para deducción anual SAT.',
    senderName: 'Ing. Rodrigo Mendoza (Padre de Familia)',
    senderEmail: 'rodrigo.mendoza@mendozaconsultores.com',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'CFDI_4.0_Complemento_IEDU_Octubre_2026.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Validar constancia de situación fiscal del tutor en base de datos SAT',
      'Cotejar CURP del alumno con matrícula oficial escolar',
      'Timbrar comprobante CFDI 4.0 con complemento de colegiaturas IEDU',
      'Enviar comprobante fiscal PDF y XML al correo del contribuyente'
    ],
    sampleResolution: 'Se emitió y timbró satisfactoriamente el CFDI 4.0 con clave IEDU y folio fiscal SAT verificado. Se notificó al padre de familia con archivos adjuntos.'
  },
  {
    id: 'scen-cob-02',
    seedKey: 'cobranza',
    title: 'Convenio de prórroga para pago de reinscripción anual en 3 parcialidades',
    description: 'Familia Morales solicita esquema de apoyo temporal para liquidar reinscripción de 2 hijos debido a contingencia laboral.',
    senderName: 'Sra. Patricia Peña Morales',
    senderEmail: 'patricia.pena@familiamorales.org',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Convenio_Pagos_Parciales_Ciclo_2026.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Revisar historial de pagos de la familia durante los últimos 2 ciclos',
      'Redactar propuesta de convenio con fechas de pago quincenales sin recargos',
      'Agendar firma digital o presencial del pagaré institucional',
      'Registrar las 3 fechas programadas en el ledger financiero escolar'
    ],
    sampleResolution: 'Convenio formalizado a 3 parcialidades sin intereses. Se programó fecha de primer abono para el 30 de octubre.'
  },
  {
    id: 'scen-cob-03',
    seedKey: 'cobranza',
    title: 'Aclaración de transferencia SPEI no conciliada en portal bancario',
    description: 'Tutor realizó pago de colegiatura mediante SPEI el fin de semana y no se refleja en su estado de cuenta en línea.',
    senderName: 'Lic. Fernando Arismendi',
    senderEmail: 'fernando.arismendi@corporativolegal.mx',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Comprobante_SPEI_Banxico_CEP.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Buscar clave de rastreo SPEI en portal Banxico CEP',
      'Localizar abono en la cuenta concentradora Santander escolar',
      'Vincular pago manualmente al folio del estudiante en el sistema',
      'Generar y enviar recibo oficial de caja digital al tutor'
    ],
    sampleResolution: 'SPEI localizado y conciliado con clave CEP 20261015-0892. Estado de cuenta actualizado con saldo en ceros.'
  },
  {
    id: 'scen-cob-04',
    seedKey: 'cobranza',
    title: 'Aplicación de beca socioeconómica de contingencia y descuento por hermanos',
    description: 'Solicitud formal para aplicar el 20% de beca institucional y 10% de descuento fraterno al segundo hermano inscrito.',
    senderName: 'Profra. Gabriela Cárdenas',
    senderEmail: 'gabriela.cardenas@educacion.gob.mx',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Dictamen_Comite_Becas_IBIME.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Verificar dictamen emitido por el Comité de Becas Colegiado',
      'Actualizar cuota mensual neta en el catálogo de aranceles del alumno',
      'Emitir nuevo calendario de pagos bonificado para el ciclo vigente',
      'Notificar por correo a la madre con el desglose mensual aplicable'
    ],
    sampleResolution: 'Beca y descuento aplicados correctamente en la ficha del alumno. Cuota recalculada de $6,800 a $4,760 netos mensuales.'
  },
  {
    id: 'scen-cob-05',
    seedKey: 'cobranza',
    title: 'Condonación de recargos moratorios por falla técnica de terminal bancaria',
    description: 'La madre intentó pagar en caja escolar el último día del mes pero la terminal bancaria se encontraba sin red.',
    senderName: 'Dra. Carmen Salazar',
    senderEmail: 'carmen.salazar@hospitalangeles.com',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Ticket_Intento_Fallado_TPV.jpg',
    sampleEvidenceType: 'jpg',
    suggestedSteps: [
      'Cotejar bitácora técnica de fallas de conexión de la TPV en recepción',
      'Aplicar nota de crédito por concepto de recargos moratorios ($350 MXN)',
      'Generar link de pago en línea seguro sin penalización',
      'Confirmar liquidación exitosa y cierre de folio'
    ],
    sampleResolution: 'Recargo condonado conforme a la política de salvaguarda familiar. Pago recibido y acreditado sin mora.'
  },

  // --- SEED 2: COORDINACIÓN DE LOGÍSTICA Y PREFECTURA ---
  {
    id: 'scen-tra-01',
    seedKey: 'transporte',
    title: 'Retraso de 25 minutos en Ruta 4 matutina por cierre vial de obras',
    description: 'Alumnos de la ruta de Jardines de Morelos llegaron con retraso debido a desvío de tránsito por obras municipales.',
    senderName: 'Sra. Mónica Escobedo (Representante de Ruta 4)',
    senderEmail: 'monica.escobedo@comunidad.ibime.mx',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Reporte_Monitoreo_GPS_Ruta4.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Revisar telemetría GPS de la unidad escolar y tiempo de tránsito',
      'Notificar a prefectura para justificar retardo de 14 alumnos',
      'Reajustar horario de salida matutina 15 minutos antes temporalmente',
      'Publicar aviso push en la app de familias de la Ruta 4'
    ],
    sampleResolution: 'Retardos justificados formalmente en sistema. Se trazó ruta alterna por Av. Central para evitar la zona de obras.'
  },
  {
    id: 'scen-tra-02',
    seedKey: 'transporte',
    title: 'Solicitud de cambio de parada de transporte escolar por mudanza',
    description: 'Familia se cambió de domicilio a Sección Lagos y solicita que el alumno sea recogido en la nueva esquina a partir del lunes.',
    senderName: 'Sr. Arturo Domínguez',
    senderEmail: 'arturo.dominguez@grupoalianza.com.mx',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Solicitud_Cambio_Parada_Ruta.doc',
    sampleEvidenceType: 'doc',
    suggestedSteps: [
      'Verificar cupo disponible en la unidad de transporte de la Ruta 2',
      'Modificar la hoja de ruta del operador con la nueva coordenada geográfica',
      'Notificar al chofer y a la monitora de transporte escolar',
      'Enviar confirmación de hora de abordaje (07:12 hrs) al padre de familia'
    ],
    sampleResolution: 'Parada reasignada con éxito en Ruta 2, parada 6 (Esq. Lagos y Jacarandas). Operador notificado.'
  },
  {
    id: 'scen-tra-03',
    seedKey: 'transporte',
    title: 'Recuperación de chamarra y estuche dejados en unidad escolar',
    description: 'Madre reporta que su hija olvidó chamarra deportiva con nombre bordado y estuche de dibujo al descender de la unidad.',
    senderName: 'Sra. Elena Beltrán',
    senderEmail: 'elena.beltran@servicioscontables.mx',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Fotografia_Articulo_Recuperado.jpg',
    sampleEvidenceType: 'jpg',
    suggestedSteps: [
      'Comunicarse por radio con el operador de la unidad al terminar el circuito',
      'Inspeccionar asientos 8 y 9 de la camioneta escolar',
      'Resguardar pertenencias en la oficina de prefectura escolar',
      'Entregar artículos al alumno al inicio de la jornada siguiente'
    ],
    sampleResolution: 'Objetos recuperados y entregados en prefectura. La madre acudió a recogerlos firmando acuse de recibo.'
  },
  {
    id: 'scen-tra-04',
    seedKey: 'transporte',
    title: 'Autorización para retiro anticipado de alumno por familiar secundario',
    description: 'Padres solicitan que su tía con credencial INE recoja al alumno a las 12:30 hrs por cita médica externa.',
    senderName: 'Lic. Claudia Nava',
    senderEmail: 'claudia.nava@bufetejuridico.com.mx',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Copia_Identificacion_Oficial_Tia.jpeg',
    sampleEvidenceType: 'jpeg',
    suggestedSteps: [
      'Verificar carta poder o correo de autorización del padre titular',
      'Cotejar fotografía de la credencial oficial autorizada en portería',
      'Emitir pase de salida institucional firmado por prefectura',
      'Registrar egreso seguro en el torniquete biométrico de salida'
    ],
    sampleResolution: 'Identidad validada con INE oficial. Alumno entregado a las 12:32 hrs con firma de bitácora de seguridad.'
  },
  {
    id: 'scen-tra-05',
    seedKey: 'transporte',
    title: 'Incidente de disciplina durante el trayecto de transporte vespertino',
    description: 'Monitora de ruta reporta conducta no apropiada (lanzar bolitas de papel) entre alumnos de secundaria en asiento trasero.',
    senderName: 'Prof. Mario Alberto Torres (Prefectura)',
    senderEmail: 'transporte@ibime.edu.mx',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Acta_Hechos_Prefectura_Ruta.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Entrevistar a los alumnos involucrados en oficina de prefectura',
      'Recordar el decálogo de seguridad y convivencia en el transporte escolar',
      'Reasignar asientos en las primeras filas durante 10 días hábiles',
      'Llamar a los tutores para informar el acuerdo formativo escolar'
    ],
    sampleResolution: 'Acuerdo formativo firmado con los alumnos y enterados los padres de familia. Sin reincidencias reportadas.'
  },

  // --- SEED 3: SECRETARÍA / CONTROL ESCOLAR ---
  {
    id: 'scen-ctrl-01',
    seedKey: 'control_escolar',
    title: 'Emisión urgente de constancia de estudios con promedio para trámite de visa',
    description: 'Familia viaja en diciembre y la embajada solicita constancia con sello oficial de la escuela y promedio acumulado.',
    senderName: 'Ing. Carlos Zepeda',
    senderEmail: 'carlos.zepeda@pemex.com',
    urgency: 'ALTA',
    slaHours: 48,
    sampleEvidenceFileName: 'Constancia_Estudios_Oficial_Sello_CCT.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Generar kárdex digital actualizado con calificaciones del ciclo anterior',
      'Redactar constancia con formato oficial CCT y clave de centro de trabajo',
      'Recabar firma autógrafa de Dirección Técnica y aplicar sello troquelado',
      'Escanear en alta resolución y entregar original en ventanilla'
    ],
    sampleResolution: 'Constancia expedida en 24 horas con sello institucional y promedio de 9.4 certificado. Entregada al padre.'
  },
  {
    id: 'scen-ctrl-02',
    seedKey: 'control_escolar',
    title: 'Corrección de error tipográfico en CURP en plataforma oficial SEP',
    description: 'Se detectó que el acta de nacimiento tiene una letra distinta en la homoclave de la CURP registrada en el sistema de control escolar.',
    senderName: 'Lic. Rebeca Sánchez (Control Escolar)',
    senderEmail: 'control.escolar@ibime.edu.mx',
    urgency: 'MEDIA',
    slaHours: 48,
    sampleEvidenceFileName: 'Acta_Nacimiento_Y_CURP_Certificada.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Validar CURP certificada ante el Registro Civil y RENAPO en línea',
      'Ingresar al portal de control escolar de la supervisión de zona SEP',
      'Ingresar solicitud de rectificación de datos generales del educando',
      'Notificar a la familia la conclusión del trámite con folio oficial'
    ],
    sampleResolution: 'CURP actualizada y validada en el portal SEP sin discrepancias. Se emitió nueva boleta con datos correctos.'
  },
  {
    id: 'scen-ctrl-03',
    seedKey: 'control_escolar',
    title: 'Dictamen de revalidación y equivalencia para alumno transferido del extranjero',
    description: 'Alumno proveniente de Texas requiere equivalencia de 5º de primaria para integrarse formalmente al 6º grado de primaria.',
    senderName: 'Mtra. Lucía Villarreal',
    senderEmail: 'lucia.villarreal@escuelabilingue.edu.mx',
    urgency: 'MEDIA',
    slaHours: 48,
    sampleEvidenceFileName: 'Dictamen_Equivalencia_DGAIR_SEP.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Revisar apostille de La Haya y traducción oficial peritada de calificaciones',
      'Llenar solicitud de trámite de equivalencia ante DGAIR SEP estatal',
      'Integrar expediente académico en Bóveda Curricular de la escuela',
      'Asignar matrícula definitiva y grupo oficial 6º "B"'
    ],
    sampleResolution: 'Equivalencia aprobada por la supervisión de zona. Alumno incorporado con matrícula formal SEP 2026-P0982.'
  },
  {
    id: 'scen-ctrl-04',
    seedKey: 'control_escolar',
    title: 'Reposición de credencial escolar inteligente con chip RFID y QR',
    description: 'El alumno extravió su credencial y requiere reposición para ingreso a torniquetes y biblioteca escolar.',
    senderName: 'Sra. Beatriz Lozano',
    senderEmail: 'beatriz.lozano@proyectostecnologicos.com',
    urgency: 'BAJA',
    slaHours: 48,
    sampleEvidenceFileName: 'Credencial_Escolar_Impresa_Frente_Vuelta.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Verificar fotografía digital del alumno en el repositorio institucional',
      'Generar código QR encriptado y programar chip RFID en impresora de credenciales',
      'Vincular nuevo UID de credencial a la cuenta del alumno en ISkool',
      'Entregar credencial al alumno y dar de baja el plástico anterior'
    ],
    sampleResolution: 'Credencial reimpresa y activada en menos de 24 horas. Torniquetes de acceso responden con el nuevo UID.'
  },
  {
    id: 'scen-ctrl-05',
    seedKey: 'control_escolar',
    title: 'Duplicado de certificado de terminación de educación secundaria',
    description: 'Egresado de generación 2024 solicita duplicado de certificado oficial para trámite de ingreso a bachillerato CCH UNAM.',
    senderName: 'Lic. Javier Rivas (Egresado IBIME)',
    senderEmail: 'javier.rivas.unam@ingenieria.unam.mx',
    urgency: 'MEDIA',
    slaHours: 48,
    sampleEvidenceFileName: 'Certificado_Digital_Firma_Electronica_SEP.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Localizar folio digital del certificado en los libros de archivo histórico',
      'Gestionar reimpresión con código de verificación QR ante la Subdirección SEP',
      'Cotejar firma electrónica avanzada de la autoridad educativa estatal',
      'Enviar archivo PDF con validez oficial internacional al egresado'
    ],
    sampleResolution: 'Duplicado oficial con firma electrónica avanzada entregado al egresado. Trámite ante CCH UNAM completado.'
  },

  // --- SEED 4: SERVICIO MÉDICO Y SALUD ESCOLAR ---
  {
    id: 'scen-med-01',
    seedKey: 'servicio_medico',
    title: 'Protocolo urgente de alergia alimentaria severa a frutos secos (EpiPen)',
    description: 'Madre de alumno de nuevo ingreso informa que su hijo es anafiláctico a cacahuates y entrega autoinyector de epinefrina.',
    senderName: 'Dra. Martha Hinojosa (Pediatra y Madre de Familia)',
    senderEmail: 'martha.hinojosa@clinicaniños.com.mx',
    urgency: 'CRITICA',
    slaHours: 12,
    sampleEvidenceFileName: 'Protocolo_Alergias_Expediente_360_EpiPen.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Ingresar alerta médica crítica roja en el Expediente 360 del alumno en ISkool',
      'Resguardar EpiPen con fecha de caducidad en el botiquín de enfermería',
      'Capacitar a los maestros titulares de grupo sobre reconocimiento de síntomas',
      'Publicar aviso de salón libre de frutos secos en el aula respectiva'
    ],
    sampleResolution: 'Alerta médica activa en pantalla del profesor y enfermería. EpiPen resguardado con protocolo de respuesta en < 2 minutos.'
  },
  {
    id: 'scen-med-02',
    seedKey: 'servicio_medico',
    title: 'Atención primaria por contusión leve en rodilla en clase de deportes',
    description: 'Alumno resbaló durante partido de fútbol rápido escolar y presenta escoriación leve en rodilla derecha sin deformidad.',
    senderName: 'Prof. Gabriel Montes (Educación Física)',
    senderEmail: 'gabriel.montes@ibime.edu.mx',
    urgency: 'ALTA',
    slaHours: 12,
    sampleEvidenceFileName: 'Hoja_Atencion_Clinica_Enfermeria.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Realizar asepsia con solución antiséptica y colocar vendaje estéril',
      'Verificar arcos de movilidad y descartar compromiso articular',
      'Llamar telefónicamente a la madre para informar la atención brindada',
      'Subir folio de consulta médica a la bitácora de enfermería de ISkool'
    ],
    sampleResolution: 'Alumno atendido y estabilizado sin fiebre ni dolor. Se retiró a su aula caminando con normalidad.'
  },
  {
    id: 'scen-med-03',
    seedKey: 'servicio_medico',
    title: 'Administración de medicamento broncodilatador durante la jornada escolar',
    description: 'Padres solicitan que se apliquen 2 disparos de salbutamol a las 11:30 hrs con receta médica adjunta.',
    senderName: 'Sra. Yolanda Treviño',
    senderEmail: 'yolanda.trevino@farmaceutica.com',
    urgency: 'ALTA',
    slaHours: 12,
    sampleEvidenceFileName: 'Receta_Medica_Salbutamol_Vigente.jpeg',
    sampleEvidenceType: 'jpeg',
    suggestedSteps: [
      'Validar receta médica con cédula profesional del médico tratante',
      'Etiquetar inhalador con nombre completo, grado y dosis prescrita',
      'Registrar hora exacta de aplicación en la bitácora de medicamentos',
      'Enviar confirmación por correo y push a la madre tras la inhalación'
    ],
    sampleResolution: 'Medicamento administrado a las 11:30 hrs con técnica adecuada de espaciador. Oximetría en 98%.'
  },
  {
    id: 'scen-med-04',
    seedKey: 'servicio_medico',
    title: 'Revisión preventiva de higiene y salud bucodental comunitaria',
    description: 'Coordinación con la clínica odontológica universitaria para jornada de diagnóstico y aplicación de flúor en primaria.',
    senderName: 'Dra. Andrea Palacios (Servicio Médico)',
    senderEmail: 'enfermeria@ibime.edu.mx',
    urgency: 'MEDIA',
    slaHours: 12,
    sampleEvidenceFileName: 'Resultados_Campana_Salud_Bucal.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Solicitar cartas de consentimiento informado a los tutores legales',
      'Acondicionar el módulo de enfermería con esterilización de instrumental',
      'Emitir carnet de salud bucal individual con observaciones clínicas',
      'Canalizar 3 casos de caries a tratamiento externo preventivo'
    ],
    sampleResolution: 'Jornada completada con 280 alumnos valorados. Informes enviados a cada padre de familia con recomendaciones.'
  },
  {
    id: 'scen-med-05',
    seedKey: 'servicio_medico',
    title: 'Validación de justificante médico por cuadro respiratorio agudo',
    description: 'Alumno ausente durante 4 días presenta justificante del IMSS por faringoamigdalitis bacteriana para reprogramar exámenes.',
    senderName: 'Sr. Mauricio Guerra',
    senderEmail: 'mauricio.guerra@industriasmetalicas.com',
    urgency: 'ALTA',
    slaHours: 12,
    sampleEvidenceFileName: 'Incapacidad_Medica_Oficial_IMSS.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Verificar vigencia y cédula del médico en el justificante institucional',
      'Registrar justificación médica en el sistema de asistencias de ISkool',
      'Notificar a los 6 profesores titulares para reprogramación de exámenes',
      'Cerrar el reporte con confirmación de alta médica para el regreso a clases'
    ],
    sampleResolution: 'Faltas justificadas al 100% por causas médicas. Exámenes reprogramados para el próximo martes en aula de apoyo.'
  },

  // --- SEED 5: COORDINACIÓN ACADÉMICA / PSICOPEDAGOGÍA ---
  {
    id: 'scen-psi-01',
    seedKey: 'convivencia',
    title: 'Solicitud de adecuación curricular para alumno con TDAH diagnosticado',
    description: 'Especialista neuropediatra entrega reporte con recomendaciones de tiempo adicional en exámenes y consignas visuales.',
    senderName: 'Mtra. Sofía Villalpando (Coordinación Académica)',
    senderEmail: 'psicopedagogia@ibime.edu.mx',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Plan_Adecuacion_Curricular_TDAH_NEM.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Analizar dictamen psicopedagógico emitido por el especialista externo',
      'Elaborar el Plan Individual de Ajustes Razonables (PIAR) institucional',
      'Reunión de alineación con los maestros de Español, Matemáticas e Historia',
      'Agendar sesión de seguimiento mensual con los padres de familia'
    ],
    sampleResolution: 'PIAR implementado formalmente. Los profesores cuentan con la rúbrica adaptada y tiempos extendidos de evaluación.'
  },
  {
    id: 'scen-psi-02',
    seedKey: 'convivencia',
    title: 'Seguimiento a reporte de bajo desempeño en Álgebra y tutoría vespertina',
    description: 'Alumno de 2º de secundaria bajó su promedio de 8.5 a 6.2 en el segundo periodo; se solicita plan de rescate académico.',
    senderName: 'Profra. Margarita Solís (Titular de Matemáticas)',
    senderEmail: 'margarita.solis@ibime.edu.mx',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Compromiso_Academico_Tutoria_Matematicas.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Revisar las evaluaciones formativas y tareas no entregadas en el portal',
      'Diseñar programa de regularización de 4 semanas (Martes y Jueves 15:00 hrs)',
      'Firmar carta compromiso académica con el alumno y sus tutores',
      'Monitorear avance con exámenes de práctica semanales en el laboratorio'
    ],
    sampleResolution: 'Carta compromiso firmada. Alumno asistiendo a tutorías con avance de 7.8 en la última evaluación formativa.'
  },
  {
    id: 'scen-psi-03',
    seedKey: 'convivencia',
    title: 'Mediación formativa por desacuerdo entre pares en patio escolar',
    description: 'Dos alumnos de 6º de primaria tuvieron una discusión por el turno de uso de la cancha de básquetbol durante el receso.',
    senderName: 'Lic. Andrés Valenzuela (Prefecto de Primaria)',
    senderEmail: 'andres.valenzuela@ibime.edu.mx',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Acta_Acuerdos_Mediacion_Formativa.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Realizar círculo restaurativo de diálogo y escucha activa con los alumnos',
      'Identificar emociones y compromisos de reparación y respeto mutuo',
      'Establecer rol compartido y equitativo para el uso de la cancha deportiva',
      'Llamar a los padres para comunicar la resolución pacífica del evento'
    ],
    sampleResolution: 'Acuerdo de mediación pacífica firmado por ambos alumnos. Convivencia armoniosa restaurada en los recesos.'
  },
  {
    id: 'scen-psi-04',
    seedKey: 'convivencia',
    title: 'Detección y canalización de alumna con aptitudes sobresalientes en Ciencias',
    description: 'Docente de física detectó que la alumna resuelve problemas de nivel bachillerato y propone proyecto para feria científica.',
    senderName: 'Dr. Roberto Carvajal (Profesor de Física y Robótica)',
    senderEmail: 'roberto.carvajal@ibime.edu.mx',
    urgency: 'MEDIA',
    slaHours: 24,
    sampleEvidenceFileName: 'Propuesta_Enriquecimiento_Curricular_Talentos.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Aplicar prueba diagnóstica estandarizada de habilidades científicas',
      'Diseñar programa de enriquecimiento curricular y mentoría de proyectos',
      'Inscribir el proyecto escolar en la Olimpiada Nacional de Ciencia Juvenil',
      'Felicitar y coordinar con los padres el plan de aceleración formativa'
    ],
    sampleResolution: 'Programa de enriquecimiento curricular activo. Alumna asesorada representará a la escuela en el concurso regional.'
  },
  {
    id: 'scen-psi-05',
    seedKey: 'convivencia',
    title: 'Acompañamiento emocional y plan de acogida tras duelo familiar',
    description: 'Familia informa el fallecimiento de un abuelo muy cercano al alumno y solicita orientación pedagógica para el regreso al aula.',
    senderName: 'Sra. Lorena Quintero',
    senderEmail: 'lorena.quintero@comunidad.ibime.mx',
    urgency: 'ALTA',
    slaHours: 24,
    sampleEvidenceFileName: 'Guia_Acompanamiento_Emocional_Duelo.pdf',
    sampleEvidenceType: 'pdf',
    suggestedSteps: [
      'Brindar escucha empática a la madre y orientar pautas de contención',
      'Instruir al equipo docente sobre sensibilidad y evitar sobrecargar de tareas',
      'Ofrecer espacio de desahogo y escucha en el cubículo de psicopedagogía',
      'Mantener comunicación semanal discreta con la familia para dar seguimiento'
    ],
    sampleResolution: 'Alumno reintegrado con red de apoyo en aula. Mostró buen ánimo y se mantendrá el monitoreo respetuoso.'
  }
];

// ============================================================================
// 3. REGLAS DE AUTOMATIZACIÓN INSTITUCIONAL POR DEFECTO
// ============================================================================
export const DEFAULT_WORK_OS_AUTOMATIONS: WorkOsAutomationRule[] = [
  {
    id: 'auto-01-no-atendido',
    name: 'Alerta Automática de Caso No Atendido (6 Horas)',
    description: 'Si un correo/caso delegado permanece sin abrir durante más de 6 horas o con progreso < 25%, marcar como (NO ATENDIDO) y notificar al CEO.',
    enabled: true,
    trigger: 'TASK_UNOPENED_6H',
    action: 'MARK_NO_ATENDIDO',
    executionsCount: 4,
    lastExecutedAt: '2026-10-15T18:30:00.000Z'
  },
  {
    id: 'auto-02-sla-80',
    name: 'Advertencia de Riesgo al 80% del Plazo SLA',
    description: 'Cuando el tiempo transcurrido alcance el 80% del SLA establecido sin estar resuelto, marcar como Urgente y alertar al responsable.',
    enabled: true,
    trigger: 'SLA_THRESHOLD_80',
    action: 'MARK_URGENT',
    executionsCount: 7,
    lastExecutedAt: '2026-10-15T19:15:00.000Z'
  },
  {
    id: 'auto-03-escalar-ceo',
    name: 'Auto-Escalamiento a Dirección General',
    description: 'Si una tarea crítica no presenta avances tras superar el 100% del SLA, escalar automáticamente al CEO como superior inmediato.',
    enabled: true,
    trigger: 'PROGRESS_BELOW_25_AFTER_12H',
    action: 'AUTO_ESCALATE_CEO',
    executionsCount: 1,
    lastExecutedAt: '2026-10-14T16:00:00.000Z'
  },
  {
    id: 'auto-04-resuelto-notif',
    name: 'Cierre y Notificación de Caso Resuelto',
    description: 'Al marcarse una tarea como RESUELTO (100%), archivar la evidencia en la Bóveda Central y registrar en la bitácora ejecutiva del CEO.',
    enabled: true,
    trigger: 'TASK_RESOLVED',
    action: 'NOTIFY_CEO',
    executionsCount: 19,
    lastExecutedAt: '2026-10-15T20:00:00.000Z'
  },
  {
    id: 'auto-05-ai-triage',
    name: 'Generación de Resumen Ejecutivo y Diagnóstico IA',
    description: 'Al ingresar un caso nuevo, el Asistente Pedagógico IA sintetiza el expediente, evalúa el riesgo y sugiere los pasos de resolución.',
    enabled: true,
    trigger: 'TASK_CREATED',
    action: 'GENERATE_AI_SUMMARY',
    executionsCount: 26,
    lastExecutedAt: '2026-10-15T21:10:00.000Z'
  }
];
