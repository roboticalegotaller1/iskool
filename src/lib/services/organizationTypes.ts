export type OrgNodeCategory =
  | 'administracion'
  | 'profesor'
  | 'intendencia_servicios'
  | 'otros';

export type OrgAdminSubRole =
  | 'director_general'
  | 'finanzas'
  | 'coordinador'
  | 'control_escolar'
  | 'servicio_medico'
  | 'juridico';

export type OrgIntendenciaSubRole =
  | 'intendente'
  | 'transporte'
  | 'mantenimiento';

export type OrgNodeSubRole =
  | OrgAdminSubRole
  | 'profesor'
  | OrgIntendenciaSubRole
  | 'otros';

export type OrgAccountTier = 'tipo_1' | 'tipo_2';

export interface OrgPermissions {
  holding_sedes: boolean;
  admisiones_360: boolean;
  calidad_nem_aldea: boolean;
  finanzas_ebitda_sat: boolean;
  organizacion: boolean;
  portal_academico: boolean;
  imail_triage: boolean;
}

export interface TeacherSubjectAssignment {
  id: string;
  subjectName: string;
  contourColor: string;
  teachAnother: boolean;
}

export interface ArchivedNodeEmail {
  id: string;
  subject: string;
  senderName: string;
  senderEmail: string;
  receivedAt: string;
  snippet: string;
}

export interface NodeMailboxSyncState {
  syncActive: boolean;
  connectedEmail: string;
  preservedHistoricalEmails: ArchivedNodeEmail[];
  lastRevokedAt?: string;
}

export interface PreviousCollaboratorSnapshot {
  fullName: string;
  username: string;
  replacedAt: string;
}

export interface OrgSeatNode {
  nodeId: string;
  schoolId: string;
  campusId: string;
  campusName: string;
  category: OrgNodeCategory;
  subRole: OrgNodeSubRole;
  accountTier: OrgAccountTier;
  roleTitle: string;
  customRoleLabel?: string;

  // Coordenadas en el lienzo interactivo
  x: number;
  y: number;

  // Datos del colaborador ocupante actual (1-5)
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  username: string;

  // Seguridad de Contraseña (CASA Tier 3: Hash + Sal + Invalidación de clave inicial)
  passwordHash: string;
  passwordSalt: string;
  tempPasswordPreview: string | null; // Visible para el CEO solo mientras mustChangePassword === true
  mustChangePassword: boolean;
  initialPasswordInvalidated: boolean;
  passwordUpdatedAt: string;

  // Permisos modulares (6)
  permissions: OrgPermissions;

  // Materias ilimitadas con contorno de color (7 - Solo Profesor)
  subjects: TeacherSubjectAssignment[];

  // Compensación recurrente base (enlazada a Finanzas)
  hourlyRateMxn: number;
  monthlyBaseSalaryMxn: number;
  slaHours: number;

  // Estado de aprovisionamiento y continuidad histórica del asiento
  isProvisioned: boolean;
  isBlocked?: boolean;
  academicPortalProvisioned: boolean;
  imailMailbox: NodeMailboxSyncState;
  previousCollaborators: PreviousCollaboratorSnapshot[];
  inheritedRecordsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrgHierarchyEdge {
  id: string;
  schoolId: string;
  sourceNodeId: string; // Superior en el organigrama
  targetNodeId: string; // Subordinado directo
  createdAt: string;
}

export type WorkDaysMode = 'lun_vie' | 'lun_sab';

export interface CampusScheduleConfig {
  campusId: string;
  campusName: string;
  blockDurationMinutes: number;
  entryTime: string; // HH:mm
  exitTime: string;  // HH:mm
  workDays: WorkDaysMode;
  updatedAt: string;
}

export type WeekdayKey = 'Lunes' | 'Martes' | 'Miércoles' | 'Jueves' | 'Viernes' | 'Sábado';

export interface TimetableTimeSlot {
  slotIndex: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface TimetablePlacement {
  id: string;
  schoolId: string;
  campusId: string;
  day: WeekdayKey;
  slotIndex: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  teacherNodeId: string;
  teacherFullName: string;
  subjectId: string;
  subjectName: string;
  contourColor: string;
}

export interface SavedSubjectCatalogItem {
  id: string;
  name: string;
  contourColor: string;
  createdAt: string;
}

export type VibratoryAlertKind = 'sla_superior' | 'parent_teacher_message';

export interface VibratoryProtocolAlert {
  id: string;
  schoolId: string;
  kind: VibratoryAlertKind;
  fromName: string;
  fromRoleLabel: string;
  fromNodeId?: string; // 'ceo-root' o nodeId superior
  targetNodeId?: string;
  targetUsername?: string;
  targetFullName: string;
  subject: string;
  message: string;
  slaHours?: number;
  studentName?: string;
  parentMessageId?: string;
  createdAt: string;
  acknowledgedAt?: string;
  replyText?: string;
  repliedAt?: string;
}

export interface TeacherConsolidatedPayrollRow {
  nodeId: string;
  userId: string;
  fullName: string;
  username: string;
  category: OrgNodeCategory;
  roleTitle: string;
  campusId: string;
  campusName: string;
  subjectsCount: number;
  subjectNames: string[];
  weeklyHours: number;
  monthlyHours: number;
  hourlyRateMxn: number;
  monthlyRecurringTotalMxn: number;
}

export interface SchoolOrganizationGraph {
  schoolId: string;
  nodes: OrgSeatNode[];
  edges: OrgHierarchyEdge[];
  savedSubjects: SavedSubjectCatalogItem[];
  campusSchedules: Record<string, CampusScheduleConfig>;
  timetablePlacements: TimetablePlacement[];
  alerts: VibratoryProtocolAlert[];
  activeCampusIdForTimetable?: string;
  updatedAt: string;
}

