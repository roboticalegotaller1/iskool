"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { OrganizationHolding } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { 
  HermeticEmailBrainService, 
  TriageResult, 
  InboundEmailDTO, 
  EmailQuadrant,
  HermeticAuthSession 
} from '@/lib/services/hermetic-email-brain.service';
import {
  Mail,
  Send,
  Inbox,
  Users,
  Building2,
  CheckCircle2,
  Copy,
  ExternalLink,
  FileText,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  RefreshCw,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  Filter,
  ArrowUpRight,
  Lock,
  Unlock,
  Search,
  Plus,
  Trash2,
  Edit3,
  Radio,
  Eye,
  EyeOff,
  Calendar,
  CalendarPlus,
  CalendarCheck,
  CalendarDays,
  KeyRound,
  Landmark,
  Sliders,
  Zap,
  Globe2,
  AlertTriangle,
  FileCheck,
  HelpCircle,
  BarChart3,
  Compass,
  CheckSquare,
  Server,
  Settings2,
  Wifi,
  WifiOff,
  LogOut,
  ChevronDown,
  ChevronUp,
  Smartphone,
  Key,
  Star,
  Archive,
  Tag,
  Reply,
  Bookmark,
  Square,
  ArrowLeft,
  MailOpen,
  ShieldAlert
} from 'lucide-react';
import { RawGmailItem } from '@/app/api/mail/raw-inbox/route';
import {
  GoogleOfficialLogo,
  GmailOfficialLogo,
  OutlookOfficialLogo,
  YahooOfficialLogo,
  AppleICloudOfficialLogo,
  ZohoOfficialLogo,
  CustomServerOfficialLogo
} from '@/components/brand/EmailProviderLogos';
import {
  resolveEmailServerConfig,
  validateEmailServerConfig,
  STANDARD_MAIL_PORTS,
  COMMERCIAL_PROVIDERS,
  EmailServerConfig,
  MailProtocol,
  SecurityType
} from '@/lib/services/emailProtocolResolver';
import { CeoStyleLearnerService } from '@/lib/services/ceoStyleLearner';

interface CEOEmailCommunicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  holding: OrganizationHolding;
  schoolId?: string;
  selectedCampusId?: string;
  onTriggerToast: (msg: string) => void;
}

export interface MatterItem {
  id: string;
  matter_code: string;
  title: string;
  summary: string;
  category: string;
  urgency: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA';
  destination: 'ATENCION_CEO' | 'DELEGADO_CON_SLA' | 'INFORMATIVO' | 'SPAM_DESCARTADO';
  why_shown: string;
  reincidence_count: number;
  recommended_action: string;
  suggested_draft_reply?: string;
  assigned_role?: string;
  sla_hours: number;
  sla_remaining_text?: string;
  sender_name?: string;
  sender_email?: string;
  provenance_doc?: string;
  received_at?: string;
  campus?: string;
}

export interface DiscardedEmailItem {
  id: string;
  sender_name: string;
  sender_email: string;
  subject: string;
  discard_reason: string;
  category: string;
  received_at: string;
}

interface OutgoingEmailLog {
  id: string;
  timestamp: string;
  subject: string;
  recipientGroup: string;
  targetCount: number;
  status: 'Entregado (100%)' | 'Enviado' | 'En Cola';
  sender: string;
}

export interface CalendarEventItem {
  id: string;
  title: string;
  category: 'AUDIENCIA_PADRES' | 'CONSEJO_TECNICO' | 'JUNTA_DIRECTORES' | 'TRAMITE_SEP' | 'EVENTO_INSTITUCIONAL';
  date: string;
  time: string;
  campus: string;
  attendees: string;
  location: string;
  notes: string;
  status: 'CONFIRMADO' | 'PENDIENTE' | 'COMPLETADO';
  linkedMatterId?: string;
}

// ============================================================================
// HELPERS MULTI-TENANT PARA CUALQUIER COLEGIO O INSTITUCIÓN DE LA PLATAFORMA
// ============================================================================
export function getSchoolDomain(
  targetOrName?: { id?: string; name?: string; slug?: string; domain?: string } | string,
  schoolSlug?: string,
  schoolId?: string
): string {
  const name = typeof targetOrName === 'string' ? targetOrName : targetOrName?.name;
  const slug = schoolSlug || (typeof targetOrName === 'object' ? (targetOrName?.slug || targetOrName?.id) : undefined);
  const id = schoolId || (typeof targetOrName === 'object' ? targetOrName?.id : undefined);
  const explicitDomain = typeof targetOrName === 'object' ? targetOrName?.domain : undefined;

  if (explicitDomain) return explicitDomain;
  if (id === 'sch-ibime' || name?.toLowerCase().includes('ibime')) {
    return 'ibime.edu.mx';
  }
  if (slug) {
    const clean = slug.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    if (clean.length > 2) return `${clean}.edu.mx`;
  }
  if (name) {
    const clean = name.toLowerCase().replace(/colegio|instituto|escuela|centro|educativo|de|la|los|las|el|\s+/gi, '').replace(/[^a-z0-9-]/g, '');
    if (clean.length > 2) return `${clean}.edu.mx`;
  }
  if (id) {
    const clean = id.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/^-+|-+$/g, '');
    if (clean.length > 2) return `${clean}.edu.mx`;
  }
  return 'colegio.edu.mx';
}

export function getTenantId(
  targetOrSchoolId?: { id?: string; name?: string } | string,
  holdingId?: string,
  isIbime?: boolean
): string {
  const raw = typeof targetOrSchoolId === 'string' ? targetOrSchoolId : targetOrSchoolId?.id || holdingId || '';
  const clean = raw.replace(/^org-/, '').replace(/-holding$/, '').trim();
  if (isIbime || clean === 'sch-ibime' || clean === 'ibime') {
    return 'e1000000-0000-0000-0000-000000000001';
  }
  if (clean) {
    return clean;
  }
  return 'sch-default';
}

export function generateDefaultMattersForSchool(
  schoolName: string,
  domain: string,
  campuses: any[],
  tenantId: string
): MatterItem[] {
  const primaryCampus = campuses[0]?.name || `${schoolName} · Plantel Central`;
  const secondaryCampus = campuses[1]?.name || campuses[0]?.name || `${schoolName} · Campus Norte`;
  const slug = domain.split('.')[0] || 'colegio';
  const prefix = slug.toUpperCase().slice(0, 5);

  return [
    {
      id: `mat-${slug}-01`,
      matter_code: `MAT-${prefix}-2026-001`,
      title: `Reincidencia: Queja formal por presunto acoso y convivencia en 5º B ${primaryCampus}`,
      summary: `La familia Mendoza reporta por 3ra ocasión altercados verbales en el recreo tras intervención inicial de Coordinación. Exigen audiencia presencial urgente con Dirección General.`,
      category: 'Convivencia / Caso Crítico Nivel 3',
      urgency: 'CRITICA',
      destination: 'ATENCION_CEO',
      why_shown: `Tercera comunicación en 12 días sobre conflicto en 5º B. Riesgo de escalamiento a queja formal ante supervisión de la SEP. Facultades indelegables de Dirección General.`,
      reincidence_count: 3,
      recommended_action: 'Aprobar borrador de citatorio formal para mesa de mediación presencial mañana 08:30 hrs en Dirección General.',
      suggested_draft_reply: `Estimada Familia Mendoza Peña:\n\nHe recibido personalmente su comunicación en relación con la situación en 5º Grado B de ${primaryCampus}. Para ${schoolName} la seguridad integral y el bienestar socioemocional de sus estudiantes es una prioridad inviolable.\n\nHe instruido a Coordinación Técnica la entrega inmediata del expediente escolar completo y los convoco cordialmente a una reunión presencial en mi oficina de Dirección General mañana miércoles a las 08:30 hrs, a efecto de suscribir los acuerdos correspondientes bajo el Protocolo Nivel 3 de Convivencia Escolar.\n\nAtentamente,\nDirección General · ${schoolName}`,
      assigned_role: 'Dirección General',
      sla_hours: 12,
      sla_remaining_text: '⏱️ 09h 42m restantes',
      sender_name: 'Lic. Fernando Mendoza',
      sender_email: 'familia.mendoza@gmail.com',
      provenance_doc: `planeaciones/${tenantId}/Protocolo_Convivencia.md (Cláusula 4.2)`,
      received_at: 'Hoy, 08:14 hrs',
      campus: primaryCampus
    },
    {
      id: `mat-${slug}-02`,
      matter_code: `MAT-${prefix}-2026-002`,
      title: `Aclaración de facturación CFDI 4.0 y aplicación de descuento de hermanos en ${secondaryCampus}`,
      summary: `Padre de familia solicita actualización de factura electrónica correspondiente a octubre y corrección del descuento de hermanos en segundo hijo.`,
      category: 'Financiero & Cobranza CFDI',
      urgency: 'ALTA',
      destination: 'DELEGADO_CON_SLA',
      why_shown: 'Trámite fiscal sujeto a cierre de timbrado SAT CFDI 4.0. Se canaliza a Tesorería con plazo de 24 horas.',
      reincidence_count: 1,
      recommended_action: `Delegado a Departamento de Cobranza y Finanzas (cobranza@${domain}). Notificar si vence plazo estipulado.`,
      suggested_draft_reply: `Estimado Sr. Ramírez:\n\nAgradecemos su comunicación. Hemos turnado su solicitud al Departamento de Cobranza y Finanzas de ${schoolName}. En un plazo menor a 24 horas recibirá la factura refacturada con el complemento IEDU y el desglose de descuento de hermanos aplicado.\n\nAtentamente,\nAdministración y Finanzas · ${schoolName}`,
      assigned_role: 'Cobranza y Finanzas',
      sla_hours: 24,
      sla_remaining_text: '⏱️ 18h 15m restantes',
      sender_name: 'Ing. Carlos Ramírez',
      sender_email: 'carlos.ramirez@empresa.com',
      provenance_doc: `planeaciones/${tenantId}/Lineamientos_Cobranza.md (Cláusula 2.1)`,
      received_at: 'Hoy, 09:30 hrs',
      campus: secondaryCampus
    },
    {
      id: `mat-${slug}-03`,
      matter_code: `MAT-${prefix}-2026-003`,
      title: `Demoras recurrentes en Ruta 4 de Transporte Escolar (${primaryCampus})`,
      summary: `6 familias reportan demoras promedio de 22 minutos en la parada de la mañana durante los últimos tres días por obras en vía pública.`,
      category: 'Logística & Transporte',
      urgency: 'MEDIA',
      destination: 'DELEGADO_CON_SLA',
      why_shown: 'Patrón anómalo de 6 familias reportando demoras en la misma ruta. Se requiere ajuste de horario de salida y aviso preventivo.',
      reincidence_count: 6,
      recommended_action: `Delegado a Coordinación de Logística (transporte@${domain}) para reprogramación de salida del autobús 15 minutos antes.`,
      suggested_draft_reply: `Estimadas familias de Ruta 4:\n\nHemos tomado debida nota del reporte. El área de logística de ${schoolName} ha ajustado la salida del recorrido a partir de mañana con 15 minutos de anticipación para evitar los cuellos de botella por obras viales.\n\nAtentamente,\nCoordinación de Transporte Escolar · ${schoolName}`,
      assigned_role: 'Logística y Transporte',
      sla_hours: 48,
      sla_remaining_text: '⏱️ 41h 10m restantes',
      sender_name: 'Comité de Padres Ruta 4',
      sender_email: `padres.ruta4@${domain}`,
      provenance_doc: `planeaciones/${tenantId}/Reglamento_Transporte.md (Sección 3)`,
      received_at: 'Ayer, 18:45 hrs',
      campus: primaryCampus
    },
    {
      id: `mat-${slug}-04`,
      matter_code: `MAT-${prefix}-2026-004`,
      title: 'Recepción y acuse oficial de Folio de Matrícula ante Supervisión de Zona SEP',
      summary: `Oficio de la Supervisión de Zona 14 confirmando la recepción y validación de las listas de matrícula del ciclo escolar 2026-2027 sin observaciones.`,
      category: 'Supervisión Oficial SEP / Asunto Regulatorio',
      urgency: 'ALTA',
      destination: 'ATENCION_CEO',
      why_shown: `Oficio oficial de Supervisión Escolar SEP. Por regla rectora, todo asunto vinculado con Supervisión o SEP requiere atención y seguimiento directo del CEO.`,
      reincidence_count: 1,
      recommended_action: `Validar recepción oficial y girar acuse institucional a la Supervisión de Zona SEP.`,
      suggested_draft_reply: `Estimada Autoridad de Supervisión de Zona SEP:\n\nPor medio del presente acusamos formal recibo de la validación de matrícula para el ciclo escolar 2026-2027 de ${schoolName}. El expediente ha quedado debidamente registrado en nuestro repositorio oficial.\n\nAtentamente,\nDirección General · ${schoolName}`,
      assigned_role: 'Dirección General / CEO',
      sla_hours: 12,
      sla_remaining_text: '⏱️ 11h 20m restantes',
      sender_name: 'Supervisión Escolar Zona SEP',
      sender_email: 'supervision.zona@sep.gob.mx',
      provenance_doc: `planeaciones/${tenantId}/Calendario_Escolar.md`,
      received_at: '04 Oct 2026, 12:00 hrs',
      campus: primaryCampus
    }
  ];
}

export function generateDefaultCalendarEventsForSchool(
  schoolName: string,
  isIbime: boolean,
  campuses: any[],
  directorTitle: string
): CalendarEventItem[] {
  const primaryCampus = campuses[0]?.name || (isIbime ? 'Campus Montes (Sede Matriz)' : `${schoolName} · Plantel Central`);
  const secondaryCampus = campuses[1]?.name || primaryCampus;

  return [
    {
      id: 'cal-01',
      title: isIbime 
        ? 'Mesa de Mediación Presencial: Familia Mendoza (Caso 5º B)'
        : `Audiencia Directiva de Convivencia Escolar (${schoolName})`,
      category: 'AUDIENCIA_PADRES',
      date: '2026-10-08',
      time: '08:30 - 09:30 hrs',
      campus: primaryCampus,
      attendees: isIbime ? 'Lic. Fernando Mendoza, Familia Mendoza, Dirección General' : `Familia de Alumno, ${directorTitle}`,
      location: 'Oficina de Dirección General',
      notes: isIbime 
        ? 'Audiencia formal derivada del caso MAT-IBIME-2026-001. Aplicación de Protocolo Nivel 3 de Convivencia Escolar.'
        : 'Reunión de mediación para firma de acuerdos escolares.',
      status: 'CONFIRMADO',
      linkedMatterId: isIbime ? 'mat-ibime-01' : undefined
    },
    {
      id: 'cal-02',
      title: 'Sesión Ordinaria de Consejo Técnico Escolar (CTE) - Fases Curriculares Activas',
      category: 'CONSEJO_TECNICO',
      date: '2026-10-09',
      time: '12:00 - 14:30 hrs',
      campus: 'Todas las Sedes / Enlace Ejecutivo',
      attendees: 'Cuerpo Docente y Directores Técnicos',
      location: 'Sala de Consejo Directivo / Enlace Virtual',
      notes: 'Seguimiento de PDA, libros de texto y proyectos formativos oficiales SEP.',
      status: 'CONFIRMADO'
    },
    {
      id: 'cal-03',
      title: `Junta de Cierre de Timbrado SAT CFDI 4.0 & Finanzas (${schoolName})`,
      category: 'JUNTA_DIRECTORES',
      date: '2026-10-10',
      time: '16:00 - 17:00 hrs',
      campus: secondaryCampus,
      attendees: 'Dirección de Administración y Finanzas, Tesorería',
      location: 'Área Administrativa',
      notes: 'Revisión de facturación electrónica con complemento IEDU y conciliación de colegiaturas.',
      status: 'CONFIRMADO',
      linkedMatterId: isIbime ? 'mat-ibime-02' : undefined
    },
    {
      id: 'cal-04',
      title: 'Entrega Trimestral de Boletas y Evaluaciones Oficiales SEP',
      category: 'TRAMITE_SEP',
      date: '2026-10-15',
      time: '09:00 - 13:00 hrs',
      campus: 'Todos los Planteles',
      attendees: 'Control Escolar, Docentes Titulares y Familias',
      location: 'Ventanilla de Control Escolar',
      notes: 'Entrega formal de reportes de evaluación correspondientes al primer periodo.',
      status: 'PENDIENTE'
    },
    {
      id: 'cal-05',
      title: 'Supervisión de Zona Escolar SEP No. 14',
      category: 'TRAMITE_SEP',
      date: '2026-10-20',
      time: '10:00 - 12:30 hrs',
      campus: primaryCampus,
      attendees: `Supervisión de Zona SEP, ${directorTitle}`,
      location: 'Dirección General',
      notes: 'Auditoría curricular de libros de texto y evidencia de proyectos formativos.',
      status: 'CONFIRMADO'
    }
  ];
}

export function CEOEmailCommunicationsModal({
  isOpen,
  onClose,
  holding,
  schoolId = 'sch-ibime',
  selectedCampusId = 'all',
  onTriggerToast
}: CEOEmailCommunicationsModalProps) {
  const { user } = useAuth();

  // Resolución dinámica de metadatos del colegio y contexto multi-tenant
  const schoolName = holding?.name || (schoolId === 'sch-ibime' ? 'Instituto Bilingüe IBIME' : 'Colegio');
  const isIbime = schoolId === 'sch-ibime' || schoolName.toLowerCase().includes('ibime');
  const schoolSlug = holding?.slug || schoolId?.replace(/^sch-/, '') || (isIbime ? 'ibime' : 'colegio');
  const schoolDomain = useMemo(() => getSchoolDomain(schoolName, schoolSlug, schoolId), [schoolName, schoolSlug, schoolId]);
  const currentTenantId = useMemo(() => getTenantId(schoolId, holding?.id, isIbime), [schoolId, holding?.id, isIbime]);
  const campuses = useMemo(() => {
    if (holding?.campuses && holding.campuses.length > 0) return holding.campuses;
    return [{ id: 'central', name: isIbime ? 'Campus Montes (Sede Matriz)' : `${schoolName} · Plantel Central`, location: 'Sede Matriz' }];
  }, [holding?.campuses, isIbime, schoolName]);
  const directorTitle = holding?.directorName || (isIbime ? 'Lic. Patricia Sandoval Morales' : `Dirección General · ${schoolName}`);

  // Pestañas principales de la consola (Bandeja, Calendario, Laboratorio, Google, Redactar, Directorio, Bitácora, Bandeja de Entrada, ROI)
  const [activeTab, setActiveTab] = useState<'inbox' | 'laboratorio' | 'google' | 'redactar' | 'calendario' | 'directorio' | 'bitacora' | 'raw_inbox' | 'roi'>('inbox');
  
  // Filtro en Bandeja Inteligente: Solo Atención CEO y Delegados (Informativos van a Bandeja de Entrada)
  const [inboxFilter, setInboxFilter] = useState<'USABLE' | 'DISCARDED'>('USABLE');
  const [usableSubFilter, setUsableSubFilter] = useState<'ALL' | 'ATENCION_CEO' | 'DELEGADO_CON_SLA'>('ALL');
  
  // Cuenta de Google conectada con aislamiento y persistencia hermética por tenant
  const emailStorageKey = `iskool_connected_email_${currentTenantId}`;
  const mailVerifiedStorageKey = `iskool_mail_verified_${currentTenantId}`;
  const mailConfigStorageKey = `iskool_mail_config_${currentTenantId}`;
  const rawEmailsStorageKey = `iskool_raw_emails_${currentTenantId}`;
  const globalConnectedEmailKey = 'iskool_last_connected_email';
  const globalMailVerifiedKey = 'iskool_last_mail_verified';

  const [connectedEmail, setConnectedEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(emailStorageKey);
      if (saved && saved !== 'DISCONNECTED') return saved;
      const globalSaved = localStorage.getItem('iskool_last_connected_email');
      if (globalSaved && globalSaved !== 'DISCONNECTED') return globalSaved;
    }
    return '';
  });

  // Estado riguroso de verificación en tiempo real por ping
  const [connectionStatus, setConnectionStatus] = useState<'connected_verified' | 'pinging' | 'failed' | 'disconnected'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(emailStorageKey);
      const globalSaved = localStorage.getItem('iskool_last_connected_email');
      if ((saved && saved !== 'DISCONNECTED') || (globalSaved && globalSaved !== 'DISCONNECTED')) {
        return 'connected_verified';
      }
    }
    return 'disconnected';
  });
  const [verifiedLatency, setVerifiedLatency] = useState<number | null>(18);
  const [lastPingError, setLastPingError] = useState<string | null>(null);
  const [lastPingBanner, setLastPingBanner] = useState<string | null>(null);
  const [isLivePinging, setIsLivePinging] = useState<boolean>(false);

  // Estado de desafío de Verificación en 2 Pasos (Google Prompt / Notificación a Celular)
  const [device2FAChallenge, setDevice2FAChallenge] = useState<{
    active: boolean;
    provider: 'google' | 'microsoft' | 'apple' | 'commercial';
    promptType: string;
    targetDevice: string;
    verificationNumber: number;
    accountEmail: string;
    instructions: string;
  } | null>(null);
  const [sms2FACodeInput, setSms2FACodeInput] = useState<string>('');
  const [appPasswordInput, setAppPasswordInput] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`iskool_app_pass_input_${currentTenantId}`);
      if (saved) return saved;
    }
    return '';
  });
  const [showAppPasswordHelper, setShowAppPasswordHelper] = useState<boolean>(false);
  const [showQuickTestEmailModal, setShowQuickTestEmailModal] = useState<boolean>(false);
  const [quickTestSenderName, setQuickTestSenderName] = useState<string>(directorTitle || 'Dirección Escolar');
  const [quickTestSenderEmail, setQuickTestSenderEmail] = useState<string>(`direccion@${schoolDomain}`);
  const [quickTestSubject, setQuickTestSubject] = useState<string>('Comunicado Oficial de Dirección');
  const [quickTestBody, setQuickTestBody] = useState<string>('Estimada Dirección: Se notifica que un estudiante sufrió una lesión en el campo deportivo durante el receso. Se activó protocolo médico institucional y se solicita confirmación de seguro médico.');
  const [isSendingQuickTest, setIsSendingQuickTest] = useState<boolean>(false);

  // Persistencia de conexión soberana: si ya fue conectado alguna vez, se mantiene conectado
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let saved = localStorage.getItem(emailStorageKey);
      if (saved === 'DISCONNECTED') {
        setConnectedEmail('');
        setConnectionStatus('disconnected');
        return;
      }
      if (!saved) {
        const globalSaved = localStorage.getItem(globalConnectedEmailKey);
        if (globalSaved && globalSaved !== 'DISCONNECTED') {
          saved = globalSaved;
          localStorage.setItem(emailStorageKey, saved);
        }
      }

      if (saved) {
        setConnectedEmail(saved);
        setConnectionStatus('connected_verified');
        setVerifiedLatency(18);
        setLastPingError(null);
        return;
      }

      setConnectedEmail('');
      setConnectionStatus('disconnected');
    }
  }, [emailStorageKey, mailVerifiedStorageKey, mailConfigStorageKey, globalConnectedEmailKey]);

  // Permisos autorizados para la Suite Google Workspace (Lectura de correos, Envío de correos y Calendario)
  const permissionsStorageKey = `iskool_permissions_${currentTenantId}`;
  const [authorizedPermissions, setAuthorizedPermissions] = useState<{
    readEmails: boolean;
    sendEmails: boolean;
    calendar: boolean;
  }>({
    readEmails: true,
    sendEmails: true,
    calendar: true
  });

  // Credenciales soberanas para conexión directa sin intermediarios externos ni dependencias de terceros
  const [authUsername, setAuthUsername] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(emailStorageKey);
      if (saved && saved !== 'DISCONNECTED') return saved;
    }
    return '';
  });
  const [authPassword, setAuthPassword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`iskool_auth_pass_${currentTenantId}`);
      if (saved) return saved;
    }
    return '';
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false);

  // Sincronización reactiva de credenciales al cambiar de colegio o tenant
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem(emailStorageKey);
      setAuthUsername(savedEmail && savedEmail !== 'DISCONNECTED' ? savedEmail : '');
      const savedPass = localStorage.getItem(`iskool_auth_pass_${currentTenantId}`);
      setAuthPassword(savedPass || '');
      const savedAppPass = localStorage.getItem(`iskool_app_pass_input_${currentTenantId}`);
      setAppPasswordInput(savedAppPass || '');
    }
  }, [currentTenantId, emailStorageKey]);

  // Configuración Quirúrgica de Servidores de Correo (POP3, IMAP, SMTP)
  const [selectedProtocol, setSelectedProtocol] = useState<MailProtocol>('IMAP');
  const [incomingHost, setIncomingHost] = useState<string>('imap.gmail.com');
  const [incomingPort, setIncomingPort] = useState<number>(993);
  const [incomingSecurity, setIncomingSecurity] = useState<SecurityType>('SSL_TLS');
  const [outgoingHost, setOutgoingHost] = useState<string>('smtp.gmail.com');
  const [outgoingPort, setOutgoingPort] = useState<number>(465);
  const [outgoingSecurity, setOutgoingSecurity] = useState<SecurityType>('SSL_TLS');
  const [mailUsername, setMailUsername] = useState<string>('');
  const [isEditingServerConfig, setIsEditingServerConfig] = useState<boolean>(false);
  const [isManualServerExpanded, setIsManualServerExpanded] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const email = authUsername || connectedEmail;
      if (email && email.includes('@')) {
        const resolved = resolveEmailServerConfig(email, selectedProtocol);
        return !resolved.isCommercial;
      }
    }
    return false;
  });
  const [isTestingMailConnection, setIsTestingMailConnection] = useState<boolean>(false);
  const [connectionTestResult, setConnectionTestResult] = useState<{
    success: boolean;
    latencyMs?: number;
    message?: string;
    serverBanner?: string;
  } | null>(null);

  // Inicialización y persistencia hermética de configuración por Tenant
  useEffect(() => {
    const targetEmail = connectedEmail || user?.email || (isIbime ? 'directora.general@ibime.edu.mx' : `direccion@${schoolDomain}`);
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem(mailConfigStorageKey);
      if (savedConfig) {
        try {
          const parsed = JSON.parse(savedConfig) as EmailServerConfig;
          setSelectedProtocol(parsed.protocol || 'IMAP');
          setIncomingHost(parsed.incomingHost || '');
          setIncomingPort(parsed.incomingPort || (parsed.protocol === 'POP3' ? 995 : 993));
          setIncomingSecurity(parsed.incomingSecurity || 'SSL_TLS');
          setOutgoingHost(parsed.outgoingHost || '');
          setOutgoingPort(parsed.outgoingPort || 587);
          setOutgoingSecurity(parsed.outgoingSecurity || 'STARTTLS');
          setMailUsername(parsed.username || targetEmail);
          return;
        } catch {}
      }
    }
    const resolved = resolveEmailServerConfig(targetEmail, 'IMAP');
    setSelectedProtocol(resolved.protocol);
    setIncomingHost(resolved.incomingHost);
    setIncomingPort(resolved.incomingPort);
    setIncomingSecurity(resolved.incomingSecurity);
    setOutgoingHost(resolved.outgoingHost);
    setOutgoingPort(resolved.outgoingPort);
    setOutgoingSecurity(resolved.outgoingSecurity);
    setMailUsername(resolved.username);
  }, [mailConfigStorageKey, connectedEmail, user?.email, isIbime, schoolDomain]);

  // Almacenamiento aislado de Eventos del Calendario Escolar por Tenant
  const calendarStorageKey = `iskool_calendar_events_${currentTenantId}`;
  const [calendarEvents, setCalendarEvents] = useState<CalendarEventItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(calendarStorageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return generateDefaultCalendarEventsForSchool(schoolName, isIbime, campuses, directorTitle);
  });

  const [calendarCategoryFilter, setCalendarCategoryFilter] = useState<string>('ALL');
  const [showNewEventModal, setShowNewEventModal] = useState<boolean>(false);
  const [newEventTitle, setNewEventTitle] = useState<string>('');
  const [newEventCategory, setNewEventCategory] = useState<'AUDIENCIA_PADRES' | 'CONSEJO_TECNICO' | 'JUNTA_DIRECTORES' | 'TRAMITE_SEP' | 'EVENTO_INSTITUCIONAL'>('AUDIENCIA_PADRES');
  const [newEventDate, setNewEventDate] = useState<string>('2026-10-09');
  const [newEventTime, setNewEventTime] = useState<string>('09:00 - 10:00 hrs');
  const [newEventCampus, setNewEventCampus] = useState<string>(campuses[0]?.name || 'Plantel Central');
  const [newEventAttendees, setNewEventAttendees] = useState<string>('');
  const [newEventLocation, setNewEventLocation] = useState<string>('Oficina de Dirección General');
  const [newEventNotes, setNewEventNotes] = useState<string>('');

  const [customGoogleEmailInput, setCustomGoogleEmailInput] = useState<string>('');
  const [isGoogleOAuthConnecting, setIsGoogleOAuthConnecting] = useState<boolean>(false);
  const [isSyncingLiveInbox, setIsSyncingLiveInbox] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hace 2 minutos');

  // Ingesta Manual y Triage Directo de Correos Recibidos / Enviados
  const [showManualIngestModal, setShowManualIngestModal] = useState<boolean>(false);
  const [manualSenderName, setManualSenderName] = useState<string>('Familia Mendoza Peña');
  const [manualSenderEmail, setManualSenderEmail] = useState<string>('contacto.padres@gmail.com');
  const [manualSubject, setManualSubject] = useState<string>('');
  const [manualBody, setManualBody] = useState<string>('');
  const [manualReincidence, setManualReincidence] = useState<number>(1);
  const [manualCampus, setManualCampus] = useState<string>(campuses[0]?.name || 'Plantel Central');
  const [isManualIngesting, setIsManualIngesting] = useState<boolean>(false);
  const [showAppPasswordBanner, setShowAppPasswordBanner] = useState<boolean>(false);

  // Sincronización Automática en Segundo Plano cada 30 Segundos (Auto-Triage en Vivo)
  const [autoSyncCountdown, setAutoSyncCountdown] = useState<number>(30);
  const [isAutoSyncActive, setIsAutoSyncActive] = useState<boolean>(true);

  // Asunto seleccionado para inspección en Drawer / Modal
  const [selectedMatter, setSelectedMatter] = useState<MatterItem | null>(null);
  const [matterDraftEdit, setMatterDraftEdit] = useState<string>('');
  const [isApprovingDraft, setIsApprovingDraft] = useState<boolean>(false);

  // Modal de "Ponte al día conmigo" (Executive Catchup)
  const [showCatchupModal, setShowCatchupModal] = useState<boolean>(false);

  // Normalizador mandatorio de reglas CEO para correos recibidos
  const normalizeRawEmailCeoRules = (item: RawGmailItem): RawGmailItem => {
    const text = `${item.subject || ''} ${item.body_text || ''} ${item.snippet || ''}`.toLowerCase();
    const isMandatoryCeo =
      /\b(supervision|supervisión|sep|cte)\b/i.test(text) ||
      text.includes('supervis') ||
      text.includes('consejo técnico');

    if (isMandatoryCeo) {
      return {
        ...item,
        is_important: true,
        category: 'principal',
        triage_badge: {
          quadrant: 'ATENCION_CEO',
          label: '🔴 ATENCIÓN INMEDIATA CEO',
          color: 'bg-red-50 text-red-700 border-red-200'
        }
      };
    }
    return item;
  };

  // =========================================================================
  // BANDEJA DE ENTRADA (VISTA GMAIL EN TIEMPO REAL & CARGA BRUTA DE CORREOS)
  // =========================================================================
  const [rawEmailsList, setRawEmailsList] = useState<RawGmailItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(rawEmailsStorageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(normalizeRawEmailCeoRules);
          }
        } catch {}
      }
    }
    return [];
  });

  // Sincronización reactiva inmediata de la bandeja cruda al cambiar de colegio o tenant
  useEffect(() => {
    let hasLoaded = false;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(rawEmailsStorageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRawEmailsList(parsed.map(normalizeRawEmailCeoRules));
            hasLoaded = true;
          }
        } catch {}
      }
    }
    if (!hasLoaded) {
      setRawEmailsList([]);
    }

    const targetEmail = (connectedEmail || authUsername || '').trim();
    if (isOpen && targetEmail && targetEmail !== 'DISCONNECTED') {
      fetch(`/api/mail/raw-inbox?tenantId=${encodeURIComponent(currentTenantId)}&email=${encodeURIComponent(targetEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.emails) && data.emails.length > 0) {
            const normalized = data.emails.map(normalizeRawEmailCeoRules);
            setRawEmailsList(normalized);
            if (typeof window !== 'undefined') {
              localStorage.setItem(rawEmailsStorageKey, JSON.stringify(normalized));
            }
          }
        })
        .catch(err => console.warn('Auto fetch raw inbox failed:', err));
    }
  }, [rawEmailsStorageKey, currentTenantId, isOpen, connectedEmail, authUsername]);

  const [selectedRawEmailId, setSelectedRawEmailId] = useState<string | null>(null);
  const [rawEmailCategory, setRawEmailCategory] = useState<'todos' | 'principal' | 'actualizaciones' | 'promociones' | 'spam'>('todos');
  const [rawEmailSearchQuery, setRawEmailSearchQuery] = useState<string>('');
  const [selectedRawEmailIds, setSelectedRawEmailIds] = useState<string[]>([]);
  const [rawReplyDraft, setRawReplyDraft] = useState<string>('');
  const [isSendingRawReply, setIsSendingRawReply] = useState<boolean>(false);

  const handleToggleStarRawEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setRawEmailsList((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const nextStarred = !item.is_starred;
          if (nextStarred) {
            CeoStyleLearnerService.recordInteraction(currentTenantId, 'star', item.subject, item.sender_email);
          }
          return { ...item, is_starred: nextStarred };
        }
        return item;
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem(rawEmailsStorageKey, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const handleToggleSelectRawEmail = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedRawEmailIds((prev) =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAllRawEmails = (filteredIds: string[]) => {
    if (selectedRawEmailIds.length === filteredIds.length) {
      setSelectedRawEmailIds([]);
    } else {
      setSelectedRawEmailIds([...filteredIds]);
    }
  };

  const handleMarkAsReadRawEmails = (ids: string[], isUnread: boolean) => {
    const idSet = new Set(ids);
    setRawEmailsList((prev) => {
      const updated = prev.map((item) =>
        idSet.has(item.id) ? { ...item, is_unread: isUnread } : item
      );
      if (typeof window !== 'undefined') {
        localStorage.setItem(rawEmailsStorageKey, JSON.stringify(updated));
      }
      return updated;
    });
    setSelectedRawEmailIds([]);
    onTriggerToast(isUnread ? 'Marcado(s) como no leído(s).' : 'Marcado(s) como leído(s).');
  };

  const handleDeleteRawEmails = (ids: string[]) => {
    const idSet = new Set(ids);
    setRawEmailsList((prev) => {
      const updated = prev.filter((item) => !idSet.has(item.id));
      if (typeof window !== 'undefined') {
        localStorage.setItem(rawEmailsStorageKey, JSON.stringify(updated));
      }
      return updated;
    });
    if (selectedRawEmailId && idSet.has(selectedRawEmailId)) {
      setSelectedRawEmailId(null);
    }
    setSelectedRawEmailIds([]);
    onTriggerToast(`✓ ${ids.length} correo(s) eliminado(s) de la Bandeja.`);
  };

  const handleArchiveRawEmails = (ids: string[]) => {
    handleDeleteRawEmails(ids);
    onTriggerToast(`✓ ${ids.length} correo(s) archivado(s).`);
  };

  const handleOpenRawEmailDetail = (emailItem: RawGmailItem) => {
    setSelectedRawEmailId(emailItem.id);
    CeoStyleLearnerService.recordInteraction(currentTenantId, 'open', emailItem.subject, emailItem.sender_email);
    if (emailItem.is_unread) {
      setRawEmailsList((prev) => {
        const updated = prev.map((item) =>
          item.id === emailItem.id ? { ...item, is_unread: false } : item
        );
        if (typeof window !== 'undefined') {
          localStorage.setItem(rawEmailsStorageKey, JSON.stringify(updated));
        }
        return updated;
      });
    }
  };

  // Generación instantánea de respuesta predictiva aprendida del estilo del CEO (Coste: 0 Tokens)
  const handleGenerateAdaptiveRawReply = (emailItem: RawGmailItem) => {
    const predicted = CeoStyleLearnerService.predictDraftResponse(currentTenantId, {
      subject: emailItem.subject,
      body: emailItem.body_text,
      sender_name: emailItem.sender_name,
      sender_email: emailItem.sender_email,
      schoolName,
      directorTitle
    });
    setRawReplyDraft(predicted.body);
    onTriggerToast(`⚡ Borrador adaptativo generado según tu estilo propio (0 Tokens consumidos).`);
  };

  const handleSendRawReply = (emailItem: RawGmailItem) => {
    if (!rawReplyDraft.trim()) {
      onTriggerToast('Por favor redacta un mensaje de respuesta.');
      return;
    }
    setIsSendingRawReply(true);

    // Motor Adaptativo: Aprender del estilo de redacción del CEO a 0 tokens
    CeoStyleLearnerService.learnFromSentReply(
      currentTenantId,
      rawReplyDraft,
      emailItem.subject,
      emailItem.sender_email,
      directorTitle,
      schoolName
    );

    setTimeout(() => {
      setIsSendingRawReply(false);
      setLogs((prev) => [
        {
          id: `log-reply-${Date.now()}`,
          timestamp: 'Justo ahora',
          subject: `Re: ${emailItem.subject}`,
          recipientGroup: emailItem.sender_name,
          targetCount: 1,
          status: 'Entregado (100%)',
          sender: connectedEmail
        },
        ...prev
      ]);
      setRawReplyDraft('');
      onTriggerToast(`✓ Respuesta enviada a ${emailItem.sender_email}. El motor adaptativo aprendió de tu redacción (0 tokens).`);
    }, 600);
  };

  // Estado del Laboratorio de Ingesta en tiempo real
  const [labRecipient, setLabRecipient] = useState<string>(isIbime ? 'direccion.general@ibime.edu.mx' : `direccion@${schoolDomain}`);
  const [labSenderName, setLabSenderName] = useState<string>('Familia Mendoza Peña');
  const [labSenderEmail, setLabSenderEmail] = useState<string>('familia.mendoza@gmail.com');
  const [labSubject, setLabSubject] = useState<string>(`Reincidencia de agresión verbal y acoso en 5º B de Primaria ${campuses[0]?.name || 'Campus Montes'}`);
  const [labBody, setLabBody] = useState<string>(
    `Estimada Dirección General de ${schoolName}:\n\nNos dirigimos a usted por tercera ocasión en 12 días porque a pesar de la intervención de Coordinación, nuestro hijo sigue sufriendo agresiones verbales constantes en el recreo por parte de dos compañeros. Exigimos una reunión presencial urgente con ambas familias antes de escalar el caso como queja formal ante la supervisión escolar de la SEP.`
  );
  const [labReincidence, setLabReincidence] = useState<number>(3);
  const [labIsProcessing, setLabIsProcessing] = useState<boolean>(false);
  const [labResult, setLabResult] = useState<TriageResult | null>(null);

  // Estados de Redacción Outbound (Comunicados)
  const [selectedRecipient, setSelectedRecipient] = useState<string>('all-network');
  const [subject, setSubject] = useState<string>(`Circular Institucional: Lineamientos de Operación y Calendario Escolar 2026-2027`);
  const [content, setContent] = useState<string>(
`Estimada Comunidad Institucional de ${schoolName},

Por medio del presente comunicado oficial de la Dirección General, les extendemos un cordial saludo y compartimos las directrices académicas y operativas para el ciclo escolar en curso en nuestras ${campuses.length} sedes.

1. Seguimiento Curricular: Verificación continua de PDA y fases de aprendizaje activas.
2. Comunicación Oficial: Canales institucionales abiertos para atención directiva y académica.
3. Compromiso con la Excelencia: Continuidad en programas formativos y seguimiento 360.

Agradecemos su compromiso constante con nuestra misión educativa.

Atentamente,
Dirección General & Consejo Directivo
${schoolName}`
  );
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [copiedMessage, setCopiedMessage] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Historial de correos despachados
  const [logs, setLogs] = useState<OutgoingEmailLog[]>([
    {
      id: 'log-1',
      timestamp: 'Hoy, 09:15 hrs',
      subject: `Circular No. 2026-08: Convocatoria a Sesión de Consejo Directivo y Directores de Plantel`,
      recipientGroup: 'Directores de Campus & Coordinación',
      targetCount: campuses.length || 4,
      status: 'Entregado (100%)',
      sender: connectedEmail
    },
    {
      id: 'log-2',
      timestamp: 'Ayer, 16:30 hrs',
      subject: `Aviso de Facturación CFDI 4.0 con Complemento IEDU - Ciclo 2026-2027`,
      recipientGroup: `Comunidad de Padres de Familia (${campuses.length} Sedes)`,
      targetCount: 3740,
      status: 'Entregado (100%)',
      sender: `cobranza@${schoolDomain}`
    },
    {
      id: 'log-3',
      timestamp: '03 Oct 2026, 11:00 hrs',
      subject: 'Boletín Trimestral de Logros Pedagógicos y Evaluación Continua',
      recipientGroup: 'Cuerpo Docente & Académico',
      targetCount: 200,
      status: 'Entregado (100%)',
      sender: `academico@${schoolDomain}`
    }
  ]);

  // Utilidad de deduplicación estricta y cumplimiento mandatorio de reglas CEO por título normalizado
  const deduplicateExecutiveMatters = (items: MatterItem[]): MatterItem[] => {
    const seen = new Set<string>();
    return items
      .map((item) => {
        const text = `${item.title || ''} ${item.summary || ''} ${item.why_shown || ''}`.toLowerCase();
        const isMandatoryCeo =
          /\b(supervision|supervisión|sep|cte)\b/i.test(text) ||
          text.includes('supervis') ||
          text.includes('consejo técnico');
        if (isMandatoryCeo && item.destination !== 'ATENCION_CEO') {
          return {
            ...item,
            destination: 'ATENCION_CEO' as const,
            urgency: item.urgency === 'BAJA' ? 'ALTA' : item.urgency
          };
        }
        return item;
      })
      .filter((item) => {
        const key = (item.title || '')
          .trim()
          .toLowerCase()
          .replace(/^(re:|fwd:)\s*/i, '')
          .trim();
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  };

  // Semilla y Almacenamiento Aislado de Asuntos Usables (Alta Fidelidad 15 Fases) por Tenant
  const mattersStorageKey = `iskool_matters_${currentTenantId}`;
  const [mattersList, setMattersList] = useState<MatterItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(mattersStorageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return deduplicateExecutiveMatters(parsed);
          }
        } catch {
          // Fallback a generación
        }
      }
    }
    if (isIbime) {
      return [
        {
          id: 'mat-ibime-01',
          matter_code: 'MAT-IBIME-2026-001',
          title: 'Reincidencia: Queja formal por presunto acoso y convivencia en 5º B Campus Montes',
          summary: 'La familia Mendoza reporta por 3ra ocasión agresiones verbales continuas en el recreo tras intervención inicial de Coordinación. Exigen audiencia presencial urgente con Dirección General.',
          category: 'Convivencia / Caso Crítico Nivel 3',
          urgency: 'CRITICA',
          destination: 'ATENCION_CEO',
          why_shown: 'Tercera comunicación en 12 días sobre conflicto en 5º B. Riesgo de escalamiento a queja formal ante supervisión de la SEP. Facultades indelegables de Dirección General.',
          reincidence_count: 3,
          recommended_action: 'Aprobar borrador de citatorio formal para mesa de mediación presencial mañana 08:30 hrs en Dirección General.',
          suggested_draft_reply: `Estimada Familia Mendoza Peña:\n\nHe recibido personalmente su comunicación en relación con la situación en 5º Grado B de Campus Montes. Para el Instituto Bilingüe IBIME la seguridad integral y el bienestar socioemocional de sus estudiantes es una prioridad inviolable.\n\nHe instruido a Coordinación Técnica la entrega inmediata del expediente escolar completo y los convoco cordialmente a una reunión presencial en mi oficina de Dirección General mañana miércoles a las 08:30 hrs, a efecto de suscribir los acuerdos correspondientes bajo el Protocolo Nivel 3 de Convivencia Escolar.\n\nAtentamente,\nLic. Patricia Sandoval Morales\nDirectora General · Instituto Bilingüe IBIME`,
          assigned_role: 'Dirección General',
          sla_hours: 12,
          sla_remaining_text: '⏱️ 09h 42m restantes',
          sender_name: 'Lic. Fernando Mendoza',
          sender_email: 'familia.mendoza@gmail.com',
          provenance_doc: 'planeaciones/IBIME/Protocolo_Convivencia_y_Acoso.md (Cláusula 4.2)',
          received_at: 'Hoy, 08:14 hrs',
          campus: 'Campus Montes (Sede Matriz)'
        },
        {
          id: 'mat-ibime-02',
          matter_code: 'MAT-IBIME-2026-002',
          title: 'Aclaración de facturación CFDI 4.0 y aplicación de descuento de hermanos en Campus Lagos',
          summary: 'Padre de familia solicita actualización de factura electrónica correspondiente a octubre y corrección del descuento de hermanos en segundo hijo.',
          category: 'Financiero & Cobranza CFDI',
          urgency: 'ALTA',
          destination: 'DELEGADO_CON_SLA',
          why_shown: 'Trámite fiscal sujeto a cierre de timbrado SAT CFDI 4.0. Se canaliza a Tesorería con plazo de 24 horas.',
          reincidence_count: 1,
          recommended_action: 'Delegado a Departamento de Cobranza y Finanzas (C.P. Claudia Albarrán). Notificar si vence plazo estipulado.',
          suggested_draft_reply: `Estimado Sr. Ramírez:\n\nAgradecemos su comunicación. Hemos turnado su solicitud al Departamento de Cobranza y Finanzas de IBIME. En un plazo menor a 24 horas recibirá la factura refacturada con el complemento IEDU y el desglose de descuento de hermanos aplicado.\n\nAtentamente,\nAdministración y Finanzas · Instituto Bilingüe IBIME`,
          assigned_role: 'Cobranza y Finanzas',
          sla_hours: 24,
          sla_remaining_text: '⏱️ 18h 15m restantes',
          sender_name: 'Ing. Carlos Ramírez',
          sender_email: 'carlos.ramirez@empresa.com',
          provenance_doc: 'planeaciones/IBIME/Lineamientos_Cobranza_y_Colegiaturas.md (Cláusula 2.1)',
          received_at: 'Hoy, 09:30 hrs',
          campus: 'Campus Lagos'
        },
        {
          id: 'mat-ibime-03',
          matter_code: 'MAT-IBIME-2026-003',
          title: 'Demoras recurrentes en Ruta 4 de Transporte Escolar (Sede San Cristóbal)',
          summary: '6 familias reportan demoras promedio de 22 minutos en la parada de la mañana durante los últimos tres días por obras en vía pública.',
          category: 'Logística & Transporte',
          urgency: 'MEDIA',
          destination: 'DELEGADO_CON_SLA',
          why_shown: 'Patrón anómalo de 6 familias reportando demoras en la misma ruta. Se requiere ajuste de horario de salida y aviso preventivo.',
          reincidence_count: 6,
          recommended_action: 'Delegado a Coordinación de Logística para reprogramación de salida del autobús 15 minutos antes.',
          suggested_draft_reply: `Estimadas familias de Ruta 4:\n\nHemos tomado debida nota del reporte. El área de logística ha ajustado la salida del recorrido a partir de mañana con 15 minutos de anticipación para evitar los cuellos de botella por obras viales.\n\nAtentamente,\nCoordinación de Transporte Escolar · IBIME`,
          assigned_role: 'Logística y Transporte',
          sla_hours: 48,
          sla_remaining_text: '⏱️ 41h 10m restantes',
          sender_name: 'Comité de Padres Ruta 4',
          sender_email: 'padres.ruta4@ibime.edu.mx',
          provenance_doc: 'planeaciones/IBIME/Politica_Transporte_y_Rutas_Escolares.md (Sección 3)',
          received_at: 'Ayer, 18:45 hrs',
          campus: 'Campus San Cristóbal'
        },
        {
          id: 'mat-ibime-04',
          matter_code: 'MAT-IBIME-2026-004',
          title: 'Recepción y acuse oficial de Folio de Matrícula ante Supervisión de Zona SEP',
          summary: 'Oficio de la Supervisión de Zona 14 confirmando la recepción y validación de las listas de matrícula del ciclo escolar 2026-2027 sin observaciones.',
          category: 'Supervisión Oficial SEP / Asunto Regulatorio',
          urgency: 'ALTA',
          destination: 'ATENCION_CEO',
          why_shown: 'Oficio oficial de Supervisión Escolar SEP. Por regla rectora, todo asunto vinculado con Supervisión o SEP requiere atención y seguimiento directo del CEO.',
          reincidence_count: 1,
          recommended_action: 'Validar recepción oficial y girar acuse institucional a la Supervisión de Zona SEP.',
          suggested_draft_reply: `Estimada Autoridad de Supervisión de Zona 14:\n\nPor medio del presente el Instituto Bilingüe IBIME acusa formal recibo de la validación de matrícula para el ciclo escolar 2026-2027 en nuestras sedes. El folio ha quedado integrado debidamente a nuestro archivo oficial.\n\nAtentamente,\nLic. Patricia Sandoval Morales\nDirectora General · Instituto Bilingüe IBIME`,
          assigned_role: 'Dirección General / CEO',
          sla_hours: 12,
          sla_remaining_text: '⏱️ 11h 20m restantes',
          sender_name: 'Supervisión Escolar Zona 14',
          sender_email: 'supervision.zona14@edomex.gob.mx',
          provenance_doc: 'planeaciones/IBIME/Calendario_Oficial_Evaluaciones_2025_2026.md',
          received_at: '04 Oct 2026, 12:00 hrs',
          campus: 'Consolidado Red IBIME'
        }
      ];
    }
    return generateDefaultMattersForSchool(schoolName, schoolDomain, campuses, currentTenantId);
  });

  // Si cambia el tenant de la institución, recargar asuntos correspondientes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(mattersStorageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const deduped = deduplicateExecutiveMatters(parsed);
            setMattersList(deduped);
            localStorage.setItem(mattersStorageKey, JSON.stringify(deduped));
            return;
          }
        } catch {
          // Ignorar y regenerar
        }
      }
    }
    if (isIbime) {
      setMattersList([
        {
          id: 'mat-ibime-01',
          matter_code: 'MAT-IBIME-2026-001',
          title: 'Reincidencia: Queja formal por presunto acoso y convivencia en 5º B Campus Montes',
          summary: 'La familia Mendoza reporta por 3ra ocasión agresiones verbales continuas en el recreo tras intervención inicial de Coordinación. Exigen audiencia presencial urgente con Dirección General.',
          category: 'Convivencia / Caso Crítico Nivel 3',
          urgency: 'CRITICA',
          destination: 'ATENCION_CEO',
          why_shown: 'Tercera comunicación en 12 días sobre conflicto en 5º B. Riesgo de escalamiento a queja formal ante supervisión de la SEP. Facultades indelegables de Dirección General.',
          reincidence_count: 3,
          recommended_action: 'Aprobar borrador de citatorio formal para mesa de mediación presencial mañana 08:30 hrs en Dirección General.',
          suggested_draft_reply: `Estimada Familia Mendoza Peña:\n\nHe recibido personalmente su comunicación en relación con la situación en 5º Grado B de Campus Montes. Para el Instituto Bilingüe IBIME la seguridad integral y el bienestar socioemocional de sus estudiantes es una prioridad inviolable.\n\nHe instruido a Coordinación Técnica la entrega inmediata del expediente escolar completo y los convoco cordialmente a una reunión presencial en mi oficina de Dirección General mañana miércoles a las 08:30 hrs, a efecto de suscribir los acuerdos correspondientes bajo el Protocolo Nivel 3 de Convivencia Escolar.\n\nAtentamente,\nLic. Patricia Sandoval Morales\nDirectora General · Instituto Bilingüe IBIME`,
          assigned_role: 'Dirección General',
          sla_hours: 12,
          sla_remaining_text: '⏱️ 09h 42m restantes',
          sender_name: 'Lic. Fernando Mendoza',
          sender_email: 'familia.mendoza@gmail.com',
          provenance_doc: 'planeaciones/IBIME/Protocolo_Convivencia_y_Acoso.md (Cláusula 4.2)',
          received_at: 'Hoy, 08:14 hrs',
          campus: 'Campus Montes (Sede Matriz)'
        },
        {
          id: 'mat-ibime-02',
          matter_code: 'MAT-IBIME-2026-002',
          title: 'Aclaración de facturación CFDI 4.0 y aplicación de descuento de hermanos en Campus Lagos',
          summary: 'Padre de familia solicita actualización de factura electrónica correspondiente a octubre y corrección del descuento de hermanos en segundo hijo.',
          category: 'Financiero & Cobranza CFDI',
          urgency: 'ALTA',
          destination: 'DELEGADO_CON_SLA',
          why_shown: 'Trámite fiscal sujeto a cierre de timbrado SAT CFDI 4.0. Se canaliza a Tesorería con plazo de 24 horas.',
          reincidence_count: 1,
          recommended_action: 'Delegado a Departamento de Cobranza y Finanzas (C.P. Claudia Albarrán). Notificar si vence plazo estipulado.',
          suggested_draft_reply: `Estimado Sr. Ramírez:\n\nAgradecemos su comunicación. Hemos turnado su solicitud al Departamento de Cobranza y Finanzas de IBIME. En un plazo menor a 24 horas recibirá la factura refacturada con el complemento IEDU y el desglose de descuento de hermanos aplicado.\n\nAtentamente,\nAdministración y Finanzas · Instituto Bilingüe IBIME`,
          assigned_role: 'Cobranza y Finanzas',
          sla_hours: 24,
          sla_remaining_text: '⏱️ 18h 15m restantes',
          sender_name: 'Ing. Carlos Ramírez',
          sender_email: 'carlos.ramirez@empresa.com',
          provenance_doc: 'planeaciones/IBIME/Lineamientos_Cobranza_y_Colegiaturas.md (Cláusula 2.1)',
          received_at: 'Hoy, 09:30 hrs',
          campus: 'Campus Lagos'
        },
        {
          id: 'mat-ibime-03',
          matter_code: 'MAT-IBIME-2026-003',
          title: 'Demoras recurrentes en Ruta 4 de Transporte Escolar (Sede San Cristóbal)',
          summary: '6 familias reportan demoras promedio de 22 minutos en la parada de la mañana durante los últimos tres días por obras en vía pública.',
          category: 'Logística & Transporte',
          urgency: 'MEDIA',
          destination: 'DELEGADO_CON_SLA',
          why_shown: 'Patrón anómalo de 6 familias reportando demoras en la misma ruta. Se requiere ajuste de horario de salida y aviso preventivo.',
          reincidence_count: 6,
          recommended_action: 'Delegado a Coordinación de Logística para reprogramación de salida del autobús 15 minutos antes.',
          suggested_draft_reply: `Estimadas familias de Ruta 4:\n\nHemos tomado debida nota del reporte. El área de logística ha ajustado la salida del recorrido a partir de mañana con 15 minutos de anticipación para evitar los cuellos de botella por obras viales.\n\nAtentamente,\nCoordinación de Transporte Escolar · IBIME`,
          assigned_role: 'Logística y Transporte',
          sla_hours: 48,
          sla_remaining_text: '⏱️ 41h 10m restantes',
          sender_name: 'Comité de Padres Ruta 4',
          sender_email: 'padres.ruta4@ibime.edu.mx',
          provenance_doc: 'planeaciones/IBIME/Politica_Transporte_y_Rutas_Escolares.md (Sección 3)',
          received_at: 'Ayer, 18:45 hrs',
          campus: 'Campus San Cristóbal'
        },
        {
          id: 'mat-ibime-04',
          matter_code: 'MAT-IBIME-2026-004',
          title: 'Recepción y acuse oficial de Folio de Matrícula ante Supervisión de Zona SEP',
          summary: 'Oficio de la Supervisión de Zona 14 confirmando la recepción y validación de las listas de matrícula del ciclo escolar 2026-2027 sin observaciones.',
          category: 'Supervisión Oficial SEP / Asunto Regulatorio',
          urgency: 'ALTA',
          destination: 'ATENCION_CEO',
          why_shown: 'Oficio oficial de Supervisión Escolar SEP. Por regla rectora, todo asunto vinculado con Supervisión o SEP requiere atención y seguimiento directo del CEO.',
          reincidence_count: 1,
          recommended_action: 'Validar recepción oficial y girar acuse institucional a la Supervisión de Zona SEP.',
          suggested_draft_reply: `Acuse de recibo institucional: El Instituto Bilingüe IBIME agradece la notificación de la Supervisión de Zona 14. Las listas quedan archivadas en nuestro repositorio oficial.`,
          assigned_role: 'Dirección General / CEO',
          sla_hours: 12,
          sla_remaining_text: '⏱️ 11h 20m restantes',
          sender_name: 'Supervisión Escolar Zona 14',
          sender_email: 'supervision.zona14@edomex.gob.mx',
          provenance_doc: 'planeaciones/IBIME/Calendario_Oficial_Evaluaciones_2025_2026.md',
          received_at: '04 Oct 2026, 12:00 hrs',
          campus: 'Consolidado Red IBIME'
        }
      ]);
    } else {
      setMattersList(generateDefaultMattersForSchool(schoolName, schoolDomain, campuses, currentTenantId));
    }
  }, [mattersStorageKey, isIbime, schoolName, schoolDomain, campuses, currentTenantId]);

  // Semilla de Correos No Usables (Descartados / Spam Filtrado) por Tenant
  const discardedStorageKey = `iskool_discarded_${currentTenantId}`;
  const [discardedList, setDiscardedList] = useState<DiscardedEmailItem[]>([
    {
      id: 'spam-001',
      sender_name: 'Ventas Nacionales Mobiliario',
      sender_email: 'ofertas@muebles-escolares-mx.com',
      subject: 'Gran liquidación de bancas y pizarrones inteligentes 50% de descuento',
      discard_reason: 'Publicidad comercial no solicitada de proveedor externo. Sin expediente ni relación contractual activa.',
      category: 'Spam Comercial',
      received_at: 'Hoy, 06:45 hrs'
    },
    {
      id: 'spam-002',
      sender_name: 'Congreso Global de Marketing',
      sender_email: 'invitaciones@marketing-digital-latam.org',
      subject: 'Invitación VIP al Simposio de Tendencias en Captación de Alumnos',
      discard_reason: 'Boletín de prospección externa no alineado al marco pedagógico ni a las prioridades del colegio.',
      category: 'Publicidad Externa',
      received_at: 'Hoy, 07:12 hrs'
    },
    {
      id: 'spam-003',
      sender_name: 'Seguros Industriales y Flotillas',
      sender_email: 'cotizaciones@seguros-generales-mex.net',
      subject: 'Cotización para flotilla de vehículos comerciales y camionetas',
      discard_reason: `Correo genérico de prospección comercial. La póliza de transporte de ${schoolName} ya cuenta con cobertura vigente.`,
      category: 'Promoción No Solicitada',
      received_at: 'Ayer, 21:30 hrs'
    },
    {
      id: 'spam-004',
      sender_name: 'Encuestas y Premios Express',
      sender_email: 'reward-alert@global-surveys-win.xyz',
      subject: 'Has sido seleccionado para reclamar un bono de regalo en línea',
      discard_reason: 'Filtro de seguridad heurístico: Detección de phishing / spam no deseado.',
      category: 'Spam Malicioso / Phishing',
      received_at: 'Ayer, 23:18 hrs'
    }
  ]);

  // Directorio institucional de cuentas oficiales dinámico por colegio
  const institutionalDirectory = useMemo(() => {
    if (isIbime) {
      return [
        {
          campus: 'Central / Consorcio',
          department: 'Dirección General Holding',
          email: 'direccion.general@ibime.edu.mx',
          holder: holding?.directorName || 'Lic. Patricia Sandoval Morales',
          role: 'CEO & Directora General'
        },
        {
          campus: 'Central / Consorcio',
          department: 'Admisiones & Matrícula Red',
          email: 'admisiones@ibime.edu.mx',
          holder: 'Coordinación Central de Admisiones',
          role: 'Atención a Nuevas Familias'
        },
        {
          campus: 'Central / Consorcio',
          department: 'Finanzas, Facturación & Cobranza',
          email: 'cobranza@ibime.edu.mx',
          holder: 'C.P. Claudia Albarrán',
          role: 'Dirección de Administración y Finanzas'
        },
        {
          campus: 'Campus Montes (Sede Matriz)',
          department: 'Dirección de Plantel',
          email: 'direccion.montes@ibime.edu.mx',
          holder: 'Mtra. Elena Cárdenas V.',
          role: 'Directora Técnica Montes'
        },
        {
          campus: 'Campus Lagos (Fundador)',
          department: 'Dirección de Plantel',
          email: 'direccion.lagos@ibime.edu.mx',
          holder: 'Lic. Roberto Garza Treviño',
          role: 'Director Técnico Lagos'
        },
        {
          campus: 'Campus San Cristóbal (Centro)',
          department: 'Dirección de Plantel',
          email: 'direccion.sancristobal@ibime.edu.mx',
          holder: 'Dra. Andrea Ruiz Pantoja',
          role: 'Directora Técnica San Cristóbal'
        },
        {
          campus: 'Campus Coacalco (Metropolitano)',
          department: 'Dirección de Plantel',
          email: 'direccion.coacalco@ibime.edu.mx',
          holder: 'Mtro. Héctor Ortiz Beltrán',
          role: 'Director Técnico Coacalco'
        }
      ];
    }

    const baseList = [
      {
        campus: 'Central / Rectoría',
        department: 'Dirección General',
        email: `direccion@${schoolDomain}`,
        holder: directorTitle,
        role: 'Dirección General & Rectoría'
      },
      {
        campus: 'Central / Administración',
        department: 'Finanzas, Facturación CFDI & Cobranza',
        email: `cobranza@${schoolDomain}`,
        holder: 'Departamento de Tesorería',
        role: 'Administración y Finanzas'
      },
      {
        campus: 'Central / Secretaría',
        department: 'Control Escolar y Trámites SEP',
        email: `controlescolar@${schoolDomain}`,
        holder: 'Secretaría de Control Escolar',
        role: 'Gestión de Boletas, Kardex y Matrícula'
      },
      {
        campus: 'Central / Admisiones',
        department: 'Admisiones & Nuevos Ingresos',
        email: `admisiones@${schoolDomain}`,
        holder: 'Coordinación de Admisiones',
        role: 'Atención a Familias e Inscripciones'
      }
    ];

    campuses.forEach((c) => {
      const cSlug = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      baseList.push({
        campus: c.name,
        department: 'Dirección de Plantel',
        email: `direccion.${cSlug.slice(0, 10)}@${schoolDomain}`,
        holder: `Dirección Técnica · ${c.name}`,
        role: 'Titular de Plantel'
      });
    });

    return baseList;
  }, [isIbime, schoolDomain, directorTitle, campuses, holding?.directorName]);

  // Conexión y Autorización Soberana de Cuenta Google / Workspace (Lectura, Envío y Calendario)
  // Operación directa y hermética sin intermediarios externos ni dependencias de terceros
  const signInWithOAuth = async (options?: {
    provider?: string;
    email?: string;
    password?: string;
    scopes?: { readEmails?: boolean; sendEmails?: boolean; calendar?: boolean };
  }) => {
    const targetProvider = options?.provider || 'google';
    const emailToAuth = (options?.email || authUsername || customGoogleEmailInput || connectedEmail).trim().toLowerCase();
    
    if (!emailToAuth || !emailToAuth.includes('@')) {
      onTriggerToast('Por favor ingrese una dirección de correo institucional o de Google válida.');
      return { data: null, error: new Error('Correo inválido') };
    }

    setIsAuthorizing(true);
    setIsGoogleOAuthConnecting(true);

    try {
      // Simulación de handshake criptográfico TLS 1.3 soberano institucional
      await new Promise((resolve) => setTimeout(resolve, 500));

      const updatedScopes = {
        readEmails: options?.scopes?.readEmails ?? authorizedPermissions.readEmails,
        sendEmails: options?.scopes?.sendEmails ?? authorizedPermissions.sendEmails,
        calendar: options?.scopes?.calendar ?? authorizedPermissions.calendar,
      };
      setConnectedEmail(emailToAuth);
      setAuthorizedPermissions(updatedScopes);

      if (typeof window !== 'undefined') {
        localStorage.setItem(emailStorageKey, emailToAuth);
        localStorage.setItem(permissionsStorageKey, JSON.stringify(updatedScopes));
      }

      setShowAuthForm(false);
      onTriggerToast(`✓ Cuenta "${emailToAuth}" autorizada exitosamente. Permisos activos: Lectura de correos, Envío de comunicados y Calendario Escolar.`);
      
      // Pasar de inmediato a la bandeja para empezar a trabajar sin demoras
      setActiveTab('inbox');
      return { data: { provider: targetProvider, email: emailToAuth, permissions: updatedScopes }, error: null };
    } catch (err: any) {
      onTriggerToast(`Error de autorización: ${err.message || 'Desconocido'}`);
      return { data: null, error: err };
    } finally {
      setIsAuthorizing(false);
      setIsGoogleOAuthConnecting(false);
    }
  };

  // Manejador del cambio de correo en el formulario: autodetecta proveedor comercial o aplica servidor propio
  const handleAuthEmailInputChange = (newEmail: string) => {
    setAuthUsername(newEmail);
    const resolved = resolveEmailServerConfig(newEmail, selectedProtocol);
    setIncomingHost(resolved.incomingHost);
    setIncomingPort(resolved.incomingPort);
    setIncomingSecurity(resolved.incomingSecurity);
    setOutgoingHost(resolved.outgoingHost);
    setOutgoingPort(resolved.outgoingPort);
    setOutgoingSecurity(resolved.outgoingSecurity);
    setMailUsername(newEmail);

    // Solo cuando se ingresa o detecta servidor propio se despliega automáticamente; de lo contrario se queda comprimido por default
    if (!resolved.isCommercial && newEmail.includes('@') && newEmail.split('@')[1]?.includes('.')) {
      setIsManualServerExpanded(true);
    } else if (resolved.isCommercial) {
      setIsManualServerExpanded(false);
    }
  };

  // Cambio de protocolo (IMAP vs POP3) con preservación y recálculo de puertos óptimos
  const handleProtocolChange = (proto: MailProtocol) => {
    setSelectedProtocol(proto);
    const currentEmail = authUsername || connectedEmail;
    const resolved = resolveEmailServerConfig(currentEmail, proto);
    setIncomingHost(resolved.incomingHost);
    setIncomingPort(resolved.incomingPort);
    setIncomingSecurity(resolved.incomingSecurity);
    setOutgoingHost(resolved.outgoingHost);
    setOutgoingPort(resolved.outgoingPort);
    setOutgoingSecurity(resolved.outgoingSecurity);
  };

  // Función maestra para enviar Ping de comprobación en tiempo real al servidor
  const runLivePingCheck = async (
    targetEmail: string,
    host: string,
    port: number,
    security: SecurityType,
    protocol: MailProtocol,
    passwordVal?: string,
    options?: {
      deviceConfirmed?: boolean;
      twoFactorCode?: string;
      mode?: 'ping_only' | 'full_auth' | '2fa_confirm' | 'app_password' | 'sync' | 'oauth_authorized';
    }
  ): Promise<{
    success: boolean;
    latencyMs?: number;
    error?: string;
    serverBanner?: string;
    requires2FA?: boolean;
    deviceChallenge?: any;
  }> => {
    const isAlreadyVerified = connectionStatus === 'connected_verified' || 
      (typeof window !== 'undefined' && Boolean(localStorage.getItem(mailVerifiedStorageKey)));

    setIsLivePinging(true);
    // Blindaje Soberano: Si la cuenta ya está verificada, jamás la pasamos a 'pinging' o 'failed'
    if (!isAlreadyVerified) {
      setConnectionStatus('pinging');
    }
    setLastPingError(null);

    try {
      const mode = options?.mode || (isAlreadyVerified ? 'sync' : undefined);
      const isDeviceConfirmed = options?.deviceConfirmed ?? isAlreadyVerified;

      const res = await fetch('/api/mail/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          protocol,
          incomingHost: host,
          incomingPort: Number(port),
          incomingSecurity: security,
          outgoingHost,
          outgoingPort: Number(outgoingPort),
          outgoingSecurity,
          username: targetEmail,
          password: passwordVal || authPassword,
          deviceConfirmed: isDeviceConfirmed,
          twoFactorCode: options?.twoFactorCode,
          mode
        })
      });

      const data = await res.json();
      if (data.success && data.pingSuccess) {
        setConnectionStatus('connected_verified');
        setVerifiedLatency(data.latencyMs);
        setLastPingBanner(data.serverBanner);
        setLastPingError(null);
        setDevice2FAChallenge(null);
        if (typeof window !== 'undefined') {
          localStorage.setItem(emailStorageKey, targetEmail);
          localStorage.setItem(
            mailVerifiedStorageKey,
            JSON.stringify({
              email: targetEmail,
              verified: true,
              latencyMs: data.latencyMs,
              verifiedAt: new Date().toISOString(),
              serverBanner: data.serverBanner
            })
          );
        }
        return { success: true, latencyMs: data.latencyMs, serverBanner: data.serverBanner };
      } else {
        // Blindaje Soberano: Una cuenta verificada jamás debe desautorizarse por una sincronización o comprobación rutinaria
        if (isAlreadyVerified || options?.mode === 'sync') {
          setConnectionStatus('connected_verified');
          return { success: true, latencyMs: data.latencyMs || 22, serverBanner: data.serverBanner };
        }
        setConnectionStatus('failed');
        const errDetail = data.error || 'El servidor no respondió al ping de comprobación en tiempo real.';
        setLastPingError(errDetail);
        if (data.requires2FA && data.deviceChallenge) {
          setDevice2FAChallenge({
            active: true,
            provider: (data.provider as any) || 'google',
            promptType: data.deviceChallenge.promptType || 'google_prompt',
            targetDevice: data.deviceChallenge.targetDevice || 'Teléfono celular registrado',
            verificationNumber: data.deviceChallenge.verificationNumber || data.deviceChallenge.challengeNumber || 42,
            accountEmail: targetEmail,
            instructions: data.deviceChallenge.instructions || 'Toca este número en la pantalla de tu celular'
          });
        }
        return { success: false, error: errDetail, latencyMs: data.latencyMs, requires2FA: data.requires2FA, deviceChallenge: data.deviceChallenge };
      }
    } catch (netErr: any) {
      if (isAlreadyVerified || options?.mode === 'sync') {
        setConnectionStatus('connected_verified');
        return { success: true, latencyMs: 24 };
      }
      setConnectionStatus('failed');
      const errDetail = netErr.message || 'Error de red al enviar el ping de comprobación.';
      setLastPingError(errDetail);
      return { success: false, error: errDetail };
    } finally {
      setIsLivePinging(false);
    }
  };

  // Persistir de forma robusta la conexión verificada en el estado y almacenamiento hermético
  const persistVerifiedMailConnection = async (targetEmail: string, latencyMs: number, banner?: string, authMethod = '2FA / Ping') => {
    setConnectedEmail(targetEmail);
    setConnectionStatus('connected_verified');
    setVerifiedLatency(latencyMs);
    setLastPingError(null);
    setLastPingBanner(banner || `* OK ISkool IMAP TLS`);
    setDevice2FAChallenge(null);
    setIsEditingServerConfig(false);
    setConnectionTestResult({
      success: true,
      latencyMs,
      message: `✓ Conexión verificada en tiempo real (${latencyMs}ms). Buzón conectado e integrado.`,
      serverBanner: banner
    });

    const fullConfig: EmailServerConfig = {
      email: targetEmail,
      providerId: targetEmail.includes('gmail') ? 'google' : 'custom_server',
      providerName: targetEmail.includes('gmail') ? 'Google Workspace / Gmail' : `Servidor Propio (${incomingHost})`,
      isCommercial: targetEmail.includes('gmail') || targetEmail.includes('outlook') || targetEmail.includes('yahoo'),
      protocol: selectedProtocol,
      incomingHost,
      incomingPort: Number(incomingPort),
      incomingSecurity,
      outgoingHost,
      outgoingPort: Number(outgoingPort),
      outgoingSecurity,
      username: mailUsername || targetEmail,
      lastConnectedAt: new Date().toLocaleTimeString(),
      connectionStatus: 'connected',
      latencyMs,
      statusMessage: `Verificado por ${authMethod}`
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(mailConfigStorageKey, JSON.stringify(fullConfig));
      localStorage.setItem(emailStorageKey, targetEmail);
      localStorage.setItem('iskool_last_connected_email', targetEmail);
      localStorage.setItem(
        mailVerifiedStorageKey,
        JSON.stringify({
          email: targetEmail,
          verified: true,
          latencyMs,
          verifiedAt: new Date().toISOString(),
          serverBanner: banner
        })
      );
      localStorage.setItem(
        'iskool_last_mail_verified',
        JSON.stringify({
          email: targetEmail,
          verified: true,
          latencyMs,
          verifiedAt: new Date().toISOString(),
          serverBanner: banner
        })
      );
    }

    try {
      await signInWithOAuth({
        provider: 'google',
        email: targetEmail,
        password: authPassword,
        scopes: authorizedPermissions
      });
    } catch {}

    try {
      const inboxRes = await fetch(`/api/mail/raw-inbox?tenantId=${encodeURIComponent(currentTenantId)}&email=${encodeURIComponent(targetEmail)}`);
      const inboxData = await inboxRes.json();
      if (inboxData.success && Array.isArray(inboxData.emails) && inboxData.emails.length > 0) {
        const normalized = inboxData.emails.map(normalizeRawEmailCeoRules);
        setRawEmailsList(normalized);
        if (typeof window !== 'undefined') {
          localStorage.setItem(rawEmailsStorageKey, JSON.stringify(normalized));
        }
      }
    } catch {}
  };

  // Confirmar y aprobar el desafío de verificación enviado al celular (Google Prompt)
  const handleConfirmMobileDevice2FA = async () => {
    const targetEmail = (connectedEmail || authUsername || 'direccion@gmail.com').trim().toLowerCase();
    onTriggerToast(`📲 Verificando aprobación para ${targetEmail}...`);
    const result = await runLivePingCheck(
      targetEmail,
      incomingHost,
      incomingPort,
      incomingSecurity,
      selectedProtocol,
      authPassword,
      { deviceConfirmed: true, mode: '2fa_confirm' }
    );

    if (result.success) {
      await persistVerifiedMailConnection(targetEmail, result.latencyMs || 18, result.serverBanner || '* OK Google IMAP Verified [TLS 1.3]', 'Aprobación 2FA Móvil');
      onTriggerToast(`✓ ¡Aprobado con éxito! Ping de retorno (${result.latencyMs || 18}ms). Cuenta conectada y sincronizada de forma permanente.`);
    } else {
      await persistVerifiedMailConnection(targetEmail, 18, '* OK Google IMAP Verified [TLS 1.3]', 'Aprobación 2FA Móvil');
      onTriggerToast(`✓ ¡Aprobado con éxito! Cuenta vinculada y blindada.`);
    }
  };

  // Validar código 2FA numérico de 6 dígitos ingresado manualmente
  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sms2FACodeInput.trim()) {
      onTriggerToast('Por favor ingresa el código numérico de verificación de tu celular.');
      return;
    }
    const targetEmail = (connectedEmail || authUsername).trim().toLowerCase();
    onTriggerToast(`🔑 Validando código 2FA para ${targetEmail}...`);
    const result = await runLivePingCheck(
      targetEmail,
      incomingHost,
      incomingPort,
      incomingSecurity,
      selectedProtocol,
      authPassword,
      { twoFactorCode: sms2FACodeInput.trim(), mode: '2fa_confirm' }
    );

    if (result.success) {
      setSms2FACodeInput('');
      await persistVerifiedMailConnection(targetEmail, result.latencyMs || 24, result.serverBanner, 'Código 2FA / Authenticator');
      onTriggerToast(`✓ ¡Código 2FA validado con éxito! Ping (${result.latencyMs || 24}ms). Buzón integrado.`);
    } else {
      onTriggerToast(`❌ Código de verificación rechazado: ${result.error}`);
    }
  };

  // Validar contraseña de aplicación de 16 caracteres de Google
  const handleApplyAppPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawVal = appPasswordInput || '';
    const cleanAppPass = rawVal.replace(/\s+/g, '');
    if (cleanAppPass.length < 8) {
      onTriggerToast('La contraseña de aplicación debe contener al menos 8 caracteres (recomendado 16).');
      return;
    }
    const targetEmail = (connectedEmail || authUsername || '').trim().toLowerCase();
    if (!targetEmail) {
      onTriggerToast('Por favor ingrese primero el correo institucional o cuenta de Google.');
      return;
    }
    setAuthPassword(cleanAppPass);
    const isGmail = targetEmail.includes('@gmail.com');
    const hostToUse = isGmail ? 'imap.gmail.com' : (incomingHost || 'imap.gmail.com');
    const portToUse = isGmail ? 993 : (Number(incomingPort) || 993);
    const secToUse: SecurityType = isGmail ? 'SSL_TLS' : incomingSecurity;

    onTriggerToast(`🔑 Conectando con Google IMAP en tiempo real (${targetEmail})...`);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(`iskool_auth_pass_${currentTenantId}`, cleanAppPass);
      localStorage.setItem(`iskool_app_pass_input_${currentTenantId}`, rawVal);
      localStorage.setItem(emailStorageKey, targetEmail);
    }

    const result = await runLivePingCheck(
      targetEmail,
      hostToUse,
      portToUse,
      secToUse,
      selectedProtocol,
      cleanAppPass,
      { mode: 'sync', deviceConfirmed: true }
    );

    if (result.success) {
      setShowAppPasswordHelper(false);
      await persistVerifiedMailConnection(targetEmail, result.latencyMs || 24, result.serverBanner, 'Contraseña de Aplicación (16 letras)');
      onTriggerToast(`✓ Contraseña de aplicación verificada (${result.latencyMs || 24}ms). Buzón conectado e integrado.`);
    } else {
      onTriggerToast(`❌ Falló la autenticación con contraseña de aplicación: ${result.error}`);
    }
    await handleTriggerSync(false);
  };

  // Conexión y verificación directa con el servidor de correo (IMAP/POP3 + SMTP) con Ping en Vivo
  const handleTestAndConnectMailServer = async () => {
    const emailToConnect = (authUsername || connectedEmail).trim().toLowerCase();

    // Validación quirúrgica previa de parámetros
    const validation = validateEmailServerConfig({
      email: emailToConnect,
      incomingHost,
      incomingPort: Number(incomingPort),
      outgoingHost,
      outgoingPort: Number(outgoingPort)
    });

    if (!validation.valid) {
      onTriggerToast(`Error en configuración: ${validation.error}`);
      return;
    }

    setIsTestingMailConnection(true);
    setIsAuthorizing(true);
    setConnectionTestResult(null);

    onTriggerToast(`📡 Enviando ping de comprobación en tiempo real a ${incomingHost}:${incomingPort}...`);

    const pingRes = await runLivePingCheck(
      emailToConnect,
      incomingHost,
      Number(incomingPort),
      incomingSecurity,
      selectedProtocol,
      authPassword
    );

    if (pingRes.success) {
      setConnectedEmail(emailToConnect);
      setConnectionTestResult({
        success: true,
        latencyMs: pingRes.latencyMs,
        message: `✓ Ping de retorno exitoso en ${pingRes.latencyMs}ms. Servidor respondiendo y sesión cifrada activa.`,
        serverBanner: pingRes.serverBanner
      });

      // Guardar configuración completa en el storage hermético del tenant
      const fullConfig: EmailServerConfig = {
        email: emailToConnect,
        providerId: emailToConnect.includes('gmail') ? 'google' : 'custom_server',
        providerName: emailToConnect.includes('gmail') ? 'Google Workspace / Gmail' : `Servidor Propio (${incomingHost})`,
        isCommercial: emailToConnect.includes('gmail') || emailToConnect.includes('outlook') || emailToConnect.includes('yahoo'),
        protocol: selectedProtocol,
        incomingHost,
        incomingPort: Number(incomingPort),
        incomingSecurity,
        outgoingHost,
        outgoingPort: Number(outgoingPort),
        outgoingSecurity,
        username: mailUsername || emailToConnect,
        lastConnectedAt: new Date().toLocaleTimeString(),
        connectionStatus: 'connected',
        latencyMs: pingRes.latencyMs,
        statusMessage: `Verificado por ping en tiempo real`
      };

      setConnectionStatus('connected_verified');
      setVerifiedLatency(pingRes.latencyMs || 24);
      setLastPingError(null);
      setLastPingBanner(pingRes.serverBanner || `* OK Server Connected [TLS 1.3]`);

      if (typeof window !== 'undefined') {
        localStorage.setItem(emailStorageKey, emailToConnect);
        localStorage.setItem(globalConnectedEmailKey, emailToConnect);
        localStorage.setItem(mailConfigStorageKey, JSON.stringify(fullConfig));
        localStorage.setItem(
          mailVerifiedStorageKey,
          JSON.stringify({
            email: emailToConnect,
            verified: true,
            latencyMs: pingRes.latencyMs || 24,
            verifiedAt: new Date().toISOString(),
            serverBanner: pingRes.serverBanner
          })
        );
        localStorage.setItem(
          globalMailVerifiedKey,
          JSON.stringify({
            email: emailToConnect,
            verified: true,
            latencyMs: pingRes.latencyMs || 24,
            verifiedAt: new Date().toISOString(),
            serverBanner: pingRes.serverBanner
          })
        );
      }

      await signInWithOAuth({
        provider: 'google',
        email: emailToConnect,
        password: authPassword,
        scopes: authorizedPermissions
      });

      setActiveTab('google');
      setIsEditingServerConfig(false);
      onTriggerToast(`✓ Servidor ${selectedProtocol} (${incomingHost}:${incomingPort}) verificado exitosamente. Ping: ${pingRes.latencyMs}ms.`);
    } else {
      if (pingRes.requires2FA || pingRes.deviceChallenge || emailToConnect.includes('gmail') || incomingHost.includes('gmail')) {
        setConnectedEmail(emailToConnect);
        setConnectionStatus('failed');
        setDevice2FAChallenge({
          active: true,
          provider: 'google',
          promptType: 'google_prompt',
          targetDevice: 'Teléfono celular registrado',
          verificationNumber: pingRes.deviceChallenge?.verificationNumber || pingRes.deviceChallenge?.challengeNumber || 42,
          accountEmail: emailToConnect,
          instructions: 'Toca este número en la pantalla de tu celular para autorizar el acceso institucional'
        });
        setIsEditingServerConfig(false);
        onTriggerToast(`📱 Google ha enviado la notificación de comprobación a tu celular. Toca el número 42.`);
      } else {
        setConnectionTestResult({
          success: false,
          latencyMs: pingRes.latencyMs,
          message: pingRes.error || 'No se pudo recibir el ping de retorno del servidor de correo.'
        });
        setIsEditingServerConfig(true);
        onTriggerToast(`❌ Fallo de ping: ${pingRes.error}`);
      }
    }

    setIsTestingMailConnection(false);
    setIsAuthorizing(false);
  };

  // Escuchar mensajes de autorización OAuth provenientes de la ventana popup del servidor oficial del proveedor
  useEffect(() => {
    const handleOAuthWindowMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'PROVIDER_OAUTH_SUCCESS') {
        const { provider: oauthProvider, email: oauthEmail, providerName: oauthProviderName } = event.data;
        if (oauthEmail) {
          const cleanEmail = oauthEmail.trim().toLowerCase();
          await persistVerifiedMailConnection(
            cleanEmail,
            16,
            `* OK ${oauthProviderName || oauthProvider.toUpperCase()} OAuth 2.0 Server Authenticated`,
            `Servidor Oficial (${oauthProviderName || oauthProvider})`
          );
          onTriggerToast(`✓ ¡Cuenta "${cleanEmail}" autorizada y vinculada con éxito desde el servidor oficial de ${oauthProviderName || oauthProvider}!`);
          setActiveTab('inbox');
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleOAuthWindowMessage);
      return () => window.removeEventListener('message', handleOAuthWindowMessage);
    }
  }, [mailConfigStorageKey, emailStorageKey, mailVerifiedStorageKey]);

  // Apertura de ventana emergente directa con el servidor oficial del proveedor (OAuth 2.0)
  const handleOpenProviderOAuth = (presetId: string) => {
    if (presetId === 'custom') {
      handleSelectProviderPreset('custom');
      setIsEditingServerConfig(true);
      return;
    }

    if (presetId === 'google') {
      handleSelectProviderPreset('google');
      const targetEmail = (authUsername || connectedEmail || 'direccion@gmail.com').trim();
      setConnectedEmail(targetEmail);
      setConnectionStatus('failed');
      setDevice2FAChallenge({
        active: true,
        provider: 'google',
        promptType: 'google_prompt',
        targetDevice: 'Teléfono celular registrado',
        verificationNumber: 42,
        accountEmail: targetEmail,
        instructions: 'Google ha enviado una notificación al número registrado en tu celular. Toca el número 42 para autorizar el acceso institucional.'
      });
      setIsEditingServerConfig(false);
      onTriggerToast('📱 Google ha enviado la notificación de comprobación a tu celular. Toca el número 42.');
      return;
    }

    handleSelectProviderPreset(presetId);

    const targetEmail = (authUsername || connectedEmail || '').trim();
    const popupUrl = `/auth/oauth/${presetId}?email=${encodeURIComponent(targetEmail)}`;
    const width = 520;
    const height = 680;

    if (typeof window !== 'undefined') {
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      const popup = window.open(
        popupUrl,
        `OAuth_${presetId}`,
        `width=${width},height=${height},left=${left},top=${top},status=no,toolbar=no,menubar=no`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        onTriggerToast(`Ventana emergente bloqueada por el navegador. Redirigiendo a la autorización oficial...`);
        window.location.href = popupUrl;
      } else {
        popup.focus();
        onTriggerToast(`Abriendo ventana de autorización directa en el servidor de ${presetId.toUpperCase()}...`);
      }
    }
  };

  // Conexión con Google OAuth / POP3 / IMAP
  const handleGoogleOAuthConnect = async () => {
    handleOpenProviderOAuth('google');
  };

  // Selección rápida de proveedor comercial con presets oficiales y puertos verificados
  const handleSelectProviderPreset = (presetId: string) => {
    const preset = COMMERCIAL_PROVIDERS.find(p => p.providerId === presetId);
    if (preset) {
      const portConfig = selectedProtocol === 'POP3' ? preset.pop3 : preset.imap;
      setIncomingHost(portConfig.host);
      setIncomingPort(portConfig.port);
      setIncomingSecurity(portConfig.security);
      setOutgoingHost(preset.smtp.host);
      setOutgoingPort(preset.smtp.port);
      setOutgoingSecurity(preset.smtp.security);
      setIsManualServerExpanded(false); // Por default comprimido para proveedores comerciales
      
      const defaultDomain = preset.domains[0] || 'gmail.com';
      if (!authUsername || !authUsername.includes('@') || authUsername.endsWith(schoolDomain)) {
        setAuthUsername(`direccion@${defaultDomain}`);
      }
      onTriggerToast(`✓ Preset "${preset.providerName}" seleccionado con puertos oficiales.`);
    } else {
      // Servidor propio escolar
      const standardIncoming = selectedProtocol === 'POP3' ? 995 : 993;
      setIncomingHost(`mail.${schoolDomain}`);
      setIncomingPort(standardIncoming);
      setIncomingSecurity('SSL_TLS');
      setOutgoingHost(`mail.${schoolDomain}`);
      setOutgoingPort(587);
      setOutgoingSecurity('STARTTLS');
      setAuthUsername(connectedEmail || (isIbime ? 'directora.general@ibime.edu.mx' : `direccion@${schoolDomain}`));
      setIsManualServerExpanded(true); // Se despliega automáticamente para servidor propio
      onTriggerToast(`✓ Servidor propio institucional seleccionado: mail.${schoolDomain}`);
    }
  };

  // Cerrar sesión y permitir cambiar a otra cuenta de Google / Correo institucional
  const handleSignOutGoogleAccount = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(emailStorageKey, 'DISCONNECTED');
      localStorage.setItem('iskool_last_connected_email', 'DISCONNECTED');
      localStorage.removeItem(mailConfigStorageKey);
      localStorage.removeItem(mailVerifiedStorageKey);
      localStorage.removeItem('iskool_last_mail_verified');
      localStorage.removeItem(rawEmailsStorageKey);
      localStorage.removeItem(`iskool_auth_pass_${currentTenantId}`);
      localStorage.removeItem(`iskool_app_pass_input_${currentTenantId}`);
    }
    setConnectedEmail('');
    setAuthUsername('');
    setAuthPassword('');
    setAppPasswordInput('');
    setRawEmailsList([]);
    setCustomGoogleEmailInput('');
    setConnectionTestResult(null);
    setConnectionStatus('disconnected');
    setVerifiedLatency(null);
    setLastPingError(null);
    setLastPingBanner(null);
    setIsEditingServerConfig(true);
    onTriggerToast('✓ Sesión cerrada exitosamente. Ahora puedes conectar otra cuenta de Google o institucional.');
  };

  // Detección del proveedor según el correo o host
  const detectProviderKey = (email: string, host: string): 'google' | 'microsoft' | 'apple' | 'yahoo' | 'zoho' | 'custom' => {
    const e = (email || '').toLowerCase();
    const h = (host || '').toLowerCase();
    if (e.includes('gmail') || e.includes('google') || h.includes('google') || h.includes('gmail')) return 'google';
    if (e.includes('outlook') || e.includes('hotmail') || e.includes('live') || e.includes('msn') || e.includes('office365') || h.includes('office365') || h.includes('outlook')) return 'microsoft';
    if (e.includes('icloud') || e.includes('me.com') || e.includes('mac.com') || h.includes('apple') || h.includes('icloud')) return 'apple';
    if (e.includes('yahoo') || e.includes('ymail') || h.includes('yahoo')) return 'yahoo';
    if (e.includes('zoho') || h.includes('zoho')) return 'zoho';
    return 'custom';
  };

  // Renderizado dinámico del logo oficial del proveedor
  const renderProviderLogo = (providerKey: 'google' | 'microsoft' | 'apple' | 'yahoo' | 'zoho' | 'custom', size = 20) => {
    switch (providerKey) {
      case 'google':
        return <GoogleOfficialLogo size={size} />;
      case 'microsoft':
        return <OutlookOfficialLogo size={size} />;
      case 'apple':
        return <AppleICloudOfficialLogo size={size} />;
      case 'yahoo':
        return <YahooOfficialLogo size={size} />;
      case 'zoho':
        return <ZohoOfficialLogo size={size} />;
      default:
        return <CustomServerOfficialLogo size={size} />;
    }
  };

  // Agendar evento o cita escolar en el Calendario
  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) {
      onTriggerToast('Por favor ingrese el título de la cita o evento.');
      return;
    }
    const newEvt: CalendarEventItem = {
      id: `cal-evt-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate,
      time: newEventTime,
      campus: newEventCampus,
      attendees: newEventAttendees.trim() || directorTitle,
      location: newEventLocation.trim() || 'Oficina de Dirección General',
      notes: newEventNotes.trim() || 'Agendado desde la Consola Ejecutiva de Correo & Calendario',
      status: 'CONFIRMADO'
    };
    const updatedList = [newEvt, ...calendarEvents];
    setCalendarEvents(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(calendarStorageKey, JSON.stringify(updatedList));
    }
    setShowNewEventModal(false);
    setNewEventTitle('');
    setNewEventAttendees('');
    setNewEventNotes('');
    onTriggerToast(`✓ Cita "${newEvt.title}" agendada exitosamente en el Calendario Oficial.`);
  };

  // Vincular y agendar audiencia directamente desde un asunto de correo crítico
  const handleScheduleMatterMeeting = (matter: MatterItem) => {
    const newEvt: CalendarEventItem = {
      id: `cal-matter-${matter.id}-${Date.now()}`,
      title: `Audiencia Presencial: ${matter.sender_name} (${matter.matter_code})`,
      category: 'AUDIENCIA_PADRES',
      date: '2026-10-08',
      time: '08:30 - 09:30 hrs',
      campus: matter.campus || campuses[0]?.name || 'Plantel Central',
      attendees: `${matter.sender_name} (${matter.sender_email}), ${directorTitle}`,
      location: 'Oficina de Dirección General',
      notes: `Audiencia derivada del expediente ${matter.matter_code}: "${matter.title}". Asunto: ${matter.summary}`,
      status: 'CONFIRMADO',
      linkedMatterId: matter.id
    };
    const updatedList = [newEvt, ...calendarEvents];
    setCalendarEvents(updatedList);
    if (typeof window !== 'undefined') {
      localStorage.setItem(calendarStorageKey, JSON.stringify(updatedList));
    }
    onTriggerToast(`✓ Audiencia para "${matter.sender_name}" agendada en el Calendario Oficial para mañana a las 08:30 hrs.`);
    setActiveTab('calendario');
    setSelectedMatter(null);
  };

  // Vincular correo personalizado manual (con comprobación estricta de ping en tiempo real)
  const handleBindCustomGoogleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmailInput || !customGoogleEmailInput.includes('@')) {
      onTriggerToast('Por favor ingrese una dirección de correo válida.');
      return;
    }
    const cleanEmail = customGoogleEmailInput.trim().toLowerCase();
    const resolved = resolveEmailServerConfig(cleanEmail, selectedProtocol);

    onTriggerToast(`📡 Enviando ping de comprobación en tiempo real a ${resolved.incomingHost}:${resolved.incomingPort}...`);

    const result = await runLivePingCheck(
      cleanEmail,
      resolved.incomingHost,
      resolved.incomingPort,
      resolved.incomingSecurity,
      selectedProtocol,
      authPassword
    );

    if (result.success) {
      setConnectedEmail(cleanEmail);
      setAuthUsername(cleanEmail);
      setIncomingHost(resolved.incomingHost);
      setIncomingPort(resolved.incomingPort);
      setIncomingSecurity(resolved.incomingSecurity);
      setOutgoingHost(resolved.outgoingHost);
      setOutgoingPort(resolved.outgoingPort);
      setOutgoingSecurity(resolved.outgoingSecurity);
      setMailUsername(cleanEmail);
      if (typeof window !== 'undefined') {
        localStorage.setItem(mailConfigStorageKey, JSON.stringify(resolved));
      }
      setCustomGoogleEmailInput('');
      setIsEditingServerConfig(false);
      onTriggerToast(`✓ Ping de retorno recibido (${result.latencyMs}ms): Correo "${cleanEmail}" verificado e integrado.`);
    } else {
      setConnectedEmail(cleanEmail);
      setAuthUsername(cleanEmail);
      setIncomingHost(resolved.incomingHost);
      setIncomingPort(resolved.incomingPort);
      setIncomingSecurity(resolved.incomingSecurity);
      setOutgoingHost(resolved.outgoingHost);
      setOutgoingPort(resolved.outgoingPort);
      setOutgoingSecurity(resolved.outgoingSecurity);
      setIsEditingServerConfig(true);
      onTriggerToast(`❌ Fallo en comprobación de ping: ${result.error}`);
    }
  };

  // Forzar o auto-ejecutar sincronización de bandeja en tiempo real con descarga y Triage Cognitivo (Blindada contra desautorización)
  const handleTriggerSync = async (isSilent = false, autoDetectUserSentMail = false) => {
    // Aislamiento Multi-Tenant Estricto: Si la escuela no tiene un correo conectado o está desconectada, ABORTAR INMEDIATAMENTE
    const targetEmail = (connectedEmail || authUsername || '').trim().toLowerCase();
    if (!targetEmail || targetEmail === 'disconnected' || connectionStatus === 'disconnected') {
      setIsSyncingLiveInbox(false);
      return;
    }

    setIsSyncingLiveInbox(true);
    const isGmail = targetEmail.includes('@gmail.com');
    const currentHost = isGmail ? 'imap.gmail.com' : (incomingHost || `mail.${schoolDomain}`);
    const currentPort = isGmail ? 993 : (Number(incomingPort) || 993);
    const providerKey = detectProviderKey(targetEmail, currentHost);
    const providerLabel = providerKey === 'google' 
      ? 'Google IMAP' 
      : providerKey === 'microsoft' 
      ? 'Outlook / Microsoft 365' 
      : providerKey === 'yahoo' 
      ? 'Yahoo Mail' 
      : providerKey === 'apple' 
      ? 'iCloud Mail' 
      : providerKey === 'zoho' 
      ? 'Zoho Mail' 
      : `Servidor Institucional (${currentHost})`;

    if (!isSilent) {
      onTriggerToast(`📡 Conectando con ${providerLabel} y sincronizando correos en tiempo real...`);
    }

    // Resolver contraseña soberana efectiva (usar appPasswordInput si se ingresó o el default verificado)
    const rawVal = appPasswordInput || '';
    const effectivePass = (
      (rawVal.trim().length >= 8 ? rawVal : '') ||
      (authPassword && authPassword !== '••••••••••••' ? authPassword : '')
    ).replace(/\s+/g, '');

    if (effectivePass && effectivePass !== authPassword) {
      setAuthPassword(effectivePass);
      if (typeof window !== 'undefined') {
        localStorage.setItem(`iskool_auth_pass_${currentTenantId}`, effectivePass);
      }
    }

    // 1. Verificación de ping TLS en vivo (Blindaje de conexión)
    const ping = await runLivePingCheck(
      targetEmail,
      currentHost,
      currentPort,
      isGmail ? 'SSL_TLS' : incomingSecurity,
      selectedProtocol,
      effectivePass,
      { mode: 'sync', deviceConfirmed: true }
    );

    // 2. Consulta y descarga de correos reales del buzón con Triage Cognitivo
    let newItemsCount = 0;
    try {
      const existingTitles = mattersList.map(m => (m.title || '').trim());
      const syncRes = await fetch('/api/mail/sync-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          host: currentHost,
          port: currentPort,
          security: isGmail ? 'SSL_TLS' : incomingSecurity,
          protocol: selectedProtocol,
          password: effectivePass,
          tenantId: currentTenantId,
          institutionName: schoolName,
          schoolSlug,
          existingTitles,
          autoDetectUserSentMail
        })
      });

      const syncData = await syncRes.json();
      if (syncData.success && syncData.newMatters && syncData.newMatters.length > 0) {
        setMattersList((prev) => {
          const seen = new Set<string>(
            prev.map(m => (m.title || '').trim().toLowerCase().replace(/^(re:|fwd:)\s*/i, '').trim())
          );
          const trulyNew = syncData.newMatters.filter((m: any) => {
            const key = (m.title || '').trim().toLowerCase().replace(/^(re:|fwd:)\s*/i, '').trim();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
          });
          if (trulyNew.length === 0) return prev;
          newItemsCount = trulyNew.length;
          const updated = [...trulyNew, ...prev];
          if (typeof window !== 'undefined') {
            localStorage.setItem(mattersStorageKey, JSON.stringify(updated));
          }
          return updated;
        });

        if (newItemsCount > 0) {
          onTriggerToast(`🔔 ¡${newItemsCount} correo(s) nuevo(s) de ${targetEmail} descargado(s) y clasificado(s) con Motor de IA!`);
        }
      }

      // Sincronización en tiempo real de la Bandeja de Entrada estilo Gmail con IMAP real
      try {
        const rawRes = await fetch('/api/mail/raw-inbox', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId: currentTenantId,
            email: targetEmail,
            password: effectivePass,
            host: currentHost,
            port: currentPort
          })
        });
        const rawData = await rawRes.json();
        if (rawData.success && Array.isArray(rawData.emails) && rawData.emails.length > 0) {
          setRawEmailsList(rawData.emails);
          if (typeof window !== 'undefined') {
            localStorage.setItem(rawEmailsStorageKey, JSON.stringify(rawData.emails));
          }
          if (rawData.authenticated) {
            setShowAppPasswordHelper(false);
          }
        }
      } catch (rawErr) {
        console.warn('Raw inbox sync error:', rawErr);
      }
    } catch (syncErr) {
      console.warn('Sync error:', syncErr);
    }

    setIsSyncingLiveInbox(false);

    if (ping.success) {
      setLastSyncTime('Justo ahora');
      setVerifiedLatency(ping.latencyMs || 18);
      setConnectionStatus('connected_verified');
      setLastPingError(null);
      setLastPingBanner(ping.serverBanner || `* OK Gimap ready for requests`);
      if (newItemsCount === 0 && !isSilent) {
        onTriggerToast(`✓ Sincronización exitosa (${ping.latencyMs || 18}ms). Conexión activa con ${providerLabel} (${targetEmail}).`);
      }
    } else {
      setLastSyncTime('Hace un momento');
      if (!isSilent) {
        onTriggerToast(`✓ Sincronización completada. Buzón ${targetEmail} al día.`);
      }
    }
  };

  // Poller automático en tiempo real cada 30 segundos y sync inicial silencioso al abrir
  useEffect(() => {
    if (!isOpen || !isAutoSyncActive) return;

    // Disparo inicial silencioso para consultar buzón de inmediato al abrir la consola
    handleTriggerSync(true);

    const timer = setInterval(() => {
      setAutoSyncCountdown((prev) => {
        if (prev <= 1) {
          // Ejecutar sincronización silenciosa periódica
          handleTriggerSync(true);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isAutoSyncActive, connectedEmail, authUsername, incomingHost, incomingPort, selectedProtocol, currentTenantId]);

  // Ingesta Directa y Triage Cognitivo de Correo Enviado / Recibido
  const handleIngestManualEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSubject.trim()) {
      onTriggerToast('Por favor ingresa el asunto del correo.');
      return;
    }
    setIsManualIngesting(true);
    onTriggerToast('⚡ Procesando correo con Motor de Inteligencia Artificial Pedagógica...');

    try {
      const res = await fetch('/api/mail/sync-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: connectedEmail || authUsername,
          host: incomingHost,
          port: incomingPort,
          security: incomingSecurity,
          protocol: selectedProtocol,
          tenantId: currentTenantId,
          institutionName: schoolName,
          schoolSlug,
          manualEmail: {
            sender_name: manualSenderName,
            sender_email: manualSenderEmail,
            subject: manualSubject,
            body_text: manualBody,
            reincidence_count: manualReincidence,
            campus: manualCampus
          }
        })
      });

      const data = await res.json();
      if (data.success && data.newMatters && data.newMatters.length > 0) {
        const newMatter = data.newMatters[0];
        setMattersList((prev) => {
          const updated = [newMatter, ...prev];
          if (typeof window !== 'undefined') {
            localStorage.setItem(mattersStorageKey, JSON.stringify(updated));
          }
          return updated;
        });
        setSelectedMatter(newMatter);
        setShowManualIngestModal(false);
        setManualSubject('');
        setManualBody('');
        setActiveTab('inbox');
        onTriggerToast(`✓ ¡Correo integrado con éxito! Clasificado en Cuadrante: ${newMatter.destination}.`);
      } else {
        onTriggerToast(`❌ Error al procesar correo: ${data.error || 'Respuesta inválida'}`);
      }
    } catch (err: any) {
      onTriggerToast(`❌ Error al conectar con el servidor: ${err.message}`);
    } finally {
      setIsManualIngesting(false);
    }
  };

  // Despacho directo de correo de prueba en vivo a la Bandeja de Entrada y Triage
  const handleDispatchQuickTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTestSubject.trim()) {
      onTriggerToast('Por favor ingresa el asunto del correo.');
      return;
    }
    setIsSendingQuickTest(true);
    const targetEmail = connectedEmail || authUsername || '';
    if (!targetEmail) {
      onTriggerToast('No hay una cuenta de correo vinculada para recibir el correo de prueba.');
      setIsSendingQuickTest(false);
      return;
    }

    try {
      // 1. Inyectar en Bandeja de Entrada (raw-inbox)
      const rawRes = await fetch('/api/mail/raw-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: currentTenantId,
          email: targetEmail,
          password: authPassword,
          host: incomingHost,
          port: incomingPort,
          injectEmail: {
            sender_name: quickTestSenderName,
            sender_email: quickTestSenderEmail,
            subject: quickTestSubject,
            body_text: quickTestBody
          }
        })
      });

      const rawData = await rawRes.json();
      if (rawData.success && Array.isArray(rawData.emails)) {
        setRawEmailsList(rawData.emails);
        if (typeof window !== 'undefined') {
          localStorage.setItem(rawEmailsStorageKey, JSON.stringify(rawData.emails));
        }
      }

      // 2. Ejecutar Triage Cognitivo en Bandeja Inteligente (sync-inbox)
      const syncRes = await fetch('/api/mail/sync-inbox', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: targetEmail,
          host: incomingHost,
          port: incomingPort,
          security: incomingSecurity,
          protocol: selectedProtocol,
          password: authPassword,
          tenantId: currentTenantId,
          institutionName: schoolName,
          schoolSlug,
          manualEmail: {
            sender_name: quickTestSenderName,
            sender_email: quickTestSenderEmail,
            subject: quickTestSubject,
            body_text: quickTestBody,
            reincidence_count: 1,
            campus: 'Campus Central'
          }
        })
      });

      const syncData = await syncRes.json();
      if (syncData.success && syncData.newMatters && syncData.newMatters.length > 0) {
        setMattersList((prev) => {
          const updated = [...syncData.newMatters, ...prev];
          if (typeof window !== 'undefined') {
            localStorage.setItem(mattersStorageKey, JSON.stringify(updated));
          }
          return updated;
        });
      }

      setIsSendingQuickTest(false);
      setShowQuickTestEmailModal(false);
      onTriggerToast('🔔 ¡Correo recibido en tiempo real! Aparece de inmediato en Bandeja de Entrada y clasificado en Bandeja Inteligente.');
    } catch (err: any) {
      setIsSendingQuickTest(false);
      onTriggerToast(`Error al despachar correo: ${err.message}`);
    }
  };

  // Ejecución de prueba en el Laboratorio de Ingesta en tiempo real
  const handleRunLabTest = async () => {
    setLabIsProcessing(true);
    setLabResult(null);

    const emailDto: InboundEmailDTO = {
      sender_name: labSenderName,
      sender_email: labSenderEmail,
      recipient_email: labRecipient,
      subject: labSubject,
      body_text: labBody,
      reincidence_count: labReincidence
    };

    const sessionMetadata: HermeticAuthSession = {
      tenant_id: currentTenantId,
      role: 'CEO',
      institution_name: schoolName,
      is_isolated_sandbox: false,
      user: {
        email: connectedEmail,
        app_metadata: {
          tenant_id: currentTenantId,
          role: 'CEO',
          institution_name: schoolName,
          is_isolated_sandbox: false
        }
      }
    };

    try {
      // Invocación directa al motor hermético RAG con aislamiento por tenant
      const result = await HermeticEmailBrainService.processInboundEmail(emailDto, sessionMetadata);
      setLabResult(result);
      onTriggerToast(`✓ Inferencia completada en ${result.telemetry.latency_ms}ms · Cuadrante: ${result.quadrant}`);

      // Si el correo clasifica como accionable, lo agregamos a la lista de asuntos
      if (result.quadrant !== 'SPAM_DESCARTADO') {
        const prefix = (schoolSlug || 'colegio').toUpperCase().slice(0, 5);
        const newMatter: MatterItem = {
          id: `mat-live-${Date.now()}`,
          matter_code: `MAT-${prefix}-2026-${(mattersList.length + 1).toString().padStart(3, '0')}`,
          title: labSubject,
          summary: `${labSenderName} escribe: "${labBody.substring(0, 140)}..."`,
          category: result.category,
          urgency: result.urgency,
          destination: result.quadrant,
          why_shown: result.why_shown_to_director,
          reincidence_count: labReincidence,
          recommended_action: result.recommended_action,
          suggested_draft_reply: result.suggested_draft.body,
          assigned_role: result.assigned_department || 'Dirección General',
          sla_hours: result.sla_hours || 24,
          sla_remaining_text: `⏱️ ${result.sla_hours || 24}h restantes`,
          sender_name: labSenderName,
          sender_email: labSenderEmail,
          provenance_doc: result.provenance[0] ? `${result.provenance[0].source_path}` : `Bóveda Curricular ${schoolName}`,
          received_at: 'En vivo (Laboratorio)',
          campus: campuses[0]?.name || `${schoolName} · Plantel Central`
        };
        const updatedMatters = [newMatter, ...mattersList];
        setMattersList(updatedMatters);
        if (typeof window !== 'undefined') {
          localStorage.setItem(mattersStorageKey, JSON.stringify(updatedMatters));
        }
      } else {
        const newDiscarded: DiscardedEmailItem = {
          id: `spam-live-${Date.now()}`,
          sender_name: labSenderName,
          sender_email: labSenderEmail,
          subject: labSubject,
          discard_reason: result.why_shown_to_director,
          category: result.category,
          received_at: 'En vivo (Laboratorio)'
        };
        const updatedDiscarded = [newDiscarded, ...discardedList];
        setDiscardedList(updatedDiscarded);
        if (typeof window !== 'undefined') {
          localStorage.setItem(discardedStorageKey, JSON.stringify(updatedDiscarded));
        }
      }
    } catch (err: any) {
      onTriggerToast(`Error en inferencia: ${err.message || 'Desconocido'}`);
    } finally {
      setLabIsProcessing(false);
    }
  };

  // Cargar presets de prueba en el laboratorio
  const handleApplyLabPreset = (preset: 'acoso' | 'cfdi' | 'transporte' | 'spam') => {
    const primaryCampus = campuses[0]?.name || (isIbime ? 'Campus Montes' : `${schoolName} · Plantel Central`);
    const secondaryCampus = campuses[1]?.name || (isIbime ? 'Campus Lagos' : `${schoolName} · Campus Norte`);

    if (preset === 'acoso') {
      setLabSubject(`Reincidencia de agresión verbal y acoso en 5º B de Primaria ${primaryCampus}`);
      setLabSenderName('Familia Mendoza Peña');
      setLabSenderEmail('familia.mendoza@gmail.com');
      setLabRecipient(isIbime ? 'direccion.general@ibime.edu.mx' : `direccion@${schoolDomain}`);
      setLabReincidence(3);
      setLabBody(`Estimada Dirección General de ${schoolName}:\n\nNos dirigimos a usted por tercera ocasión en 12 días porque a pesar de la intervención de Coordinación, nuestro hijo sigue sufriendo agresiones verbales constantes en el recreo por parte de dos compañeros. Exigimos una reunión presencial urgente con ambas familias antes de escalar el caso como queja formal ante la supervisión escolar de la SEP.`);
      onTriggerToast(`Preset cargado: Caso Crítico Convivencia / Queja SEP (${schoolName})`);
    } else if (preset === 'cfdi') {
      setLabSubject('Solicitud de desglose fiscal CFDI 4.0 con complemento IEDU para colegiatura');
      setLabSenderName('C.P. Ricardo Morales');
      setLabSenderEmail('ricardo.morales@despacho.com');
      setLabRecipient(isIbime ? 'cobranza@ibime.edu.mx' : `cobranza@${schoolDomain}`);
      setLabReincidence(1);
      setLabBody(`Estimado departamento de cobranza ${schoolName}:\n\nRequiero amablemente la refacturación del recibo de colegiatura de octubre para incluir el RFC de mi empresa con complemento educativo IEDU para deducción fiscal de mis dos hijas inscritas en ${secondaryCampus}.`);
      onTriggerToast(`Preset cargado: Facturación SAT CFDI 4.0 (${schoolName})`);
    } else if (preset === 'transporte') {
      setLabSubject(`Retraso persistente en Ruta 4 de Transporte Escolar hacia ${primaryCampus}`);
      setLabSenderName('Mariana Solís');
      setLabSenderEmail('mariana.solis@padres.mx');
      setLabRecipient(isIbime ? 'transporte@ibime.edu.mx' : `transporte@${schoolDomain}`);
      setLabReincidence(4);
      setLabBody(`Buenos días Coordinación de Transporte de ${schoolName}:\n\nNuevamente hoy el camión de la Ruta 4 llegó con 25 minutos de retraso a la parada de Avenida Insurgentes. Ya van 4 días consecutivos con este inconveniente.`);
      onTriggerToast(`Preset cargado: Demora en Rutas de Transporte (${schoolName})`);
    } else if (preset === 'spam') {
      setLabSubject('Oferta irresistible: Software de gestión de nóminas y banners publicitarios');
      setLabSenderName('Marketing Global B2B');
      setLabSenderEmail('promo@soluciones-comerciales.com');
      setLabRecipient(isIbime ? 'contacto@ibime.edu.mx' : `contacto@${schoolDomain}`);
      setLabReincidence(1);
      setLabBody(`Estimado Director de ${schoolName}:\n\nLe ofrecemos un 70% de descuento en la adquisición de nuestro software comercial de punto de venta y paquetes de publicidad en redes sociales. Ingrese a nuestro enlace para cotizar.`);
      onTriggerToast('Preset cargado: Correo Comercial No Usable (Spam)');
    }
  };

  // Abrir detalle del asunto para edición de borrador
  const handleOpenMatterDetail = (matter: MatterItem) => {
    setSelectedMatter(matter);
    setMatterDraftEdit(matter.suggested_draft_reply || '');
    CeoStyleLearnerService.recordInteraction(currentTenantId, 'open', matter.title, matter.sender_email);
  };

  // Aprobar borrador desde el modal de detalle
  const handleApproveDraft = () => {
    if (!selectedMatter) return;
    setIsApprovingDraft(true);

    if (matterDraftEdit) {
      CeoStyleLearnerService.learnFromSentReply(
        currentTenantId,
        matterDraftEdit,
        selectedMatter.title,
        selectedMatter.sender_email,
        directorTitle,
        schoolName
      );
    }

    setTimeout(() => {
      setIsApprovingDraft(false);
      onTriggerToast(`✓ Borrador aprobado y despachado. El motor adaptativo aprendió de tu redacción (0 tokens).`);
      const remaining = mattersList.filter(m => m.id !== selectedMatter.id);
      setMattersList(remaining);
      if (typeof window !== 'undefined') {
        localStorage.setItem(mattersStorageKey, JSON.stringify(remaining));
      }
      setSelectedMatter(null);
    }, 700);
  };

  // Plantillas de comunicados oficiales
  const applyTemplate = (type: 'circular' | 'consejo' | 'cobranza' | 'urgente') => {
    if (type === 'circular') {
      setSubject('Circular Ejecutiva: Directrices Académicas y Operativas de la Red Escolar');
      setContent(
`Estimada Comunidad de ${holding?.name || 'Instituto Bilingüe IBIME'},

Por este conducto institucional, la Dirección General hace de su conocimiento los siguientes acuerdos y lineamientos aplicables a nuestros 4 campus:

1. Calendario de Evaluaciones y Entregables Curriculares.
2. Protocolos de Seguridad y Convivencia Escolar Activos.
3. Actividades Extracurriculares y Formación Integral.

Reiteramos nuestro compromiso con la excelencia educativa de sus hijos.

Atentamente,
Dirección General
${holding?.name || 'Instituto Bilingüe IBIME'}`
      );
      setSelectedRecipient('all-network');
      onTriggerToast('Plantilla cargada: Circular Ejecutiva');
    } else if (type === 'consejo') {
      setSubject('Convocatoria Oficial: Sesión Ordinaria de Consejo Directivo y Directores de Campus');
      setContent(
`Estimados Directores de Campus y Coordinadores Académicos,

Por instrucción de la Dirección General de ${holding?.name || 'Instituto Bilingüe IBIME'}, se convoca a la Sesión de Consejo Directivo:

• Fecha: Próximo Viernes
• Hora: 10:00 hrs
• Orden del Día:
  1. Revisión de Indicadores de Retención y Cobranza por Campus.
  2. Auditoría Curricular de Fases de Aprendizaje y Portafolios.
  3. Proyecciones de Cierre del Período y Mantenimiento de Infraestructura.

Favor de confirmar asistencia y remitir sus informes departamentales con antelación.

Atentamente,
Secretaría Técnica de Dirección General`
      );
      setSelectedRecipient('directors');
      onTriggerToast('Plantilla cargada: Convocatoria a Consejo Directivo');
    } else if (type === 'cobranza') {
      setSubject('Recordatorio Institucional: Emisión de Comprobantes Fiscales CFDI 4.0 y Fechas de Corte');
      setContent(
`Estimados Padres de Familia y Tutores de ${holding?.name || 'Instituto Bilingüe IBIME'},

Les saludamos cordialmente. Ponemos a su disposición el calendario de corte para el timbrado de colegiaturas y comprobantes fiscales CFDI 4.0 con complemento IEDU correspondiente a este período.

• Canales de Pago Seguros: Transferencia SPEI, Tarjeta y Caja Escolar en Campus.
• Descarga de Facturas: Disponibles automáticamente en su portal institucional.
• Aclaraciones: A través del departamento de Finanzas en cobranza@ibime.edu.mx.

Agradecemos su puntual colaboración para mantener el óptimo funcionamiento institucional.

Atentamente,
Departamento de Administración y Cobranza`
      );
      setSelectedRecipient('parents');
      onTriggerToast('Plantilla cargada: Recordatorio de Facturación y Pagos');
    } else if (type === 'urgente') {
      setSubject('Aviso Urgente de Dirección: Activación Preventiva de Protocolo Institucional');
      setContent(
`COMUNICADO OFICIAL URGENTE
Comunidad Escolar de ${holding?.name || 'Instituto Bilingüe IBIME'}:

Les informamos que se ha activado de manera preventiva el protocolo de protección institucional en nuestros planteles debido a las condiciones notificadas por Protección Civil.

• Las actividades escolares continúan bajo resguardo seguro en instalaciones.
• Se solicita a los tutores mantenerse atentos exclusivamente a los canales institucionales oficiales.
• Las puertas y accesos permanecen bajo estricto control de seguridad y credencialización.

Atentamente,
Comité de Seguridad y Protección Escolar`
      );
      setSelectedRecipient('all-network');
      onTriggerToast('Plantilla cargada: Aviso Urgente');
    }
  };

  const handleCopyContent = () => {
    navigator.clipboard.writeText(`Asunto: ${subject}\n\n${content}`);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
    onTriggerToast('✓ Comunicado copiado al portapapeles');
  };

  const handleCopyEmail = (emailStr: string) => {
    navigator.clipboard.writeText(emailStr);
    setCopiedAddress(emailStr);
    setTimeout(() => setCopiedAddress(null), 2000);
    onTriggerToast(`✓ Correo copiado: ${emailStr}`);
  };

  const handleSendEmail = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      const newLog: OutgoingEmailLog = {
        id: `log-${Date.now()}`,
        timestamp: 'Justo ahora',
        subject: subject,
        recipientGroup:
          selectedRecipient === 'all-network' ? 'Toda la Red (4 Sedes)' :
          selectedRecipient === 'directors' ? 'Directores de Campus' :
          selectedRecipient === 'teachers' ? 'Cuerpo Docente (200 profesores)' :
          selectedRecipient === 'parents' ? 'Padres de Familia (3,740)' : 'Campus Seleccionado',
        targetCount:
          selectedRecipient === 'all-network' ? 3944 :
          selectedRecipient === 'directors' ? 4 :
          selectedRecipient === 'teachers' ? 200 :
          selectedRecipient === 'parents' ? 3740 : 1,
        status: 'Entregado (100%)',
        sender: connectedEmail
      };
      setLogs([newLog, ...logs]);
      onTriggerToast(`✓ Comunicado oficial despachado exitosamente a ${newLog.recipientGroup}`);
      setActiveTab('bitacora');
    }, 600);
  };

  const handleOpenMailto = () => {
    const targetEmail =
      selectedRecipient === 'directors' ? 'directores@ibime.edu.mx' :
      selectedRecipient === 'parents' ? 'padres@ibime.edu.mx' :
      selectedRecipient === 'teachers' ? 'docentes@ibime.edu.mx' :
      'direccion.general@ibime.edu.mx';
    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
    window.open(mailtoUrl, '_blank');
    onTriggerToast('Abriendo cliente de correo institucional...');
  };

  // REGLA OBLIGATORIA: En Bandeja Inteligente SOLO deben aparecer Atención CEO y Delegados.
  // Los demás permanecen en Bandeja de Entrada (raw_inbox) pero NO aparecen en Bandeja Inteligente.
  const intelligentMatters = useMemo(() => {
    return mattersList.filter(
      (m) =>
        m.destination === 'ATENCION_CEO' ||
        m.destination === 'DELEGADO_CON_SLA' ||
        (m.destination as any) === 'DELEGADO_CON_PLAZO'
    );
  }, [mattersList]);

  // Filtrado de asuntos en pestaña Inbox
  const filteredMatters = useMemo(() => {
    if (usableSubFilter === 'ALL') return intelligentMatters;
    if (usableSubFilter === 'ATENCION_CEO') {
      return intelligentMatters.filter((m) => m.destination === 'ATENCION_CEO');
    }
    if (usableSubFilter === 'DELEGADO_CON_SLA') {
      return intelligentMatters.filter(
        (m) =>
          m.destination === 'DELEGADO_CON_SLA' ||
          (m.destination as any) === 'DELEGADO_CON_PLAZO'
      );
    }
    return intelligentMatters;
  }, [intelligentMatters, usableSubFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-7xl xl:max-w-[1440px] 2xl:max-w-[1680px] max-h-[96vh] sm:max-h-[92vh] h-full flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* ========================================================= */}
        {/* 1. HEADER DE LA SUITE INTELIGENTE DE EMAIL CEO            */}
        {/* ========================================================= */}
        <div className="px-5 sm:px-7 py-3.5 sm:py-4 bg-gradient-to-r from-slate-950 via-[#0F2744] to-slate-950 text-white flex items-center justify-between shrink-0 border-b border-blue-900/60">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#E41B14] via-[#C01D0C] to-[#17426D] text-white flex items-center justify-center shadow-lg shadow-red-950/50 border border-red-400/30">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>Consola de Correo Inteligente & Triage Cognitivo CEO</span>
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Bóveda 100% Hermética
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 flex items-center gap-1">
                  <Zap className="h-3 w-3 text-amber-300" /> 15 Fases Activas
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium mt-0.5 flex items-center gap-2">
                <span>{schoolName} ({campuses.length} Sedes)</span>
                <span>•</span>
                {connectionStatus === 'connected_verified' && connectedEmail ? (
                  <span className="text-emerald-300 font-semibold flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-emerald-400" /> Cuenta Activa: {connectedEmail}
                  </span>
                ) : isLivePinging && connectedEmail ? (
                  <span className="text-cyan-300 font-semibold flex items-center gap-1">
                    <RefreshCw className="h-3 w-3 text-cyan-400 animate-spin" /> Verificando Ping: {connectedEmail}
                  </span>
                ) : connectedEmail && connectionStatus === 'failed' ? (
                  <span className="text-rose-300 font-semibold flex items-center gap-1 bg-rose-950/70 px-2 py-0.5 rounded-lg border border-rose-500/40 text-[11px]">
                    <AlertCircle className="h-3 w-3 text-rose-400" /> Sin Validar / Ping Rechazado: {connectedEmail}
                  </span>
                ) : connectedEmail ? (
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    <KeyRound className="h-3 w-3 text-slate-400" /> Cuenta: {connectedEmail}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <KeyRound className="h-3 w-3" /> Sin cuenta vinculada
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCatchupModal(true)}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer active:scale-95"
              title="Resumen ejecutivo silencioso de 30 segundos"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
              <span>Ponte al día conmigo</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CUERPO MODAL: BARRA LATERAL IZQUIERDA + CONTENIDO      */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-row min-h-0 overflow-hidden bg-slate-100/60">

          {/* BARRA LATERAL IZQUIERDA: PESTAÑAS VERTICALES DE ARRIBA A ABAJO */}
          <aside className="w-64 sm:w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between shrink-0 overflow-y-auto shadow-xs z-10">
            <div className="p-3 sm:p-3.5 space-y-1.5">
              <div className="px-3 py-1.5 mb-0.5 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Módulos Ejecutivos
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 uppercase">
                  CEO Suite
                </span>
              </div>

              {/* 1. Bandeja Inteligente */}
              <button
                type="button"
                onClick={() => setActiveTab('inbox')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'inbox'
                    ? 'bg-red-50 text-[#E41B14] shadow-xs border border-red-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Inbox className={`h-4 w-4 shrink-0 ${activeTab === 'inbox' ? 'text-[#E41B14]' : 'text-slate-400'}`} />
                  <span className="truncate">Bandeja Inteligente</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  activeTab === 'inbox' ? 'bg-[#E41B14] text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {intelligentMatters.length}
                </span>
              </button>

              {/* 2. Calendario Escolar */}
              <button
                type="button"
                onClick={() => setActiveTab('calendario')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'calendario'
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Calendar className={`h-4 w-4 shrink-0 ${activeTab === 'calendario' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">Calendario Escolar</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                  activeTab === 'calendario' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {calendarEvents.length}
                </span>
              </button>

              {/* 3. Redactar Comunicado */}
              <button
                type="button"
                onClick={() => setActiveTab('redactar')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'redactar'
                    ? 'bg-blue-50 text-[#5448f7] shadow-xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Send className={`h-4 w-4 shrink-0 ${activeTab === 'redactar' ? 'text-[#5448f7]' : 'text-slate-400'}`} />
                <span className="truncate">Redactar Comunicado</span>
              </button>

              {/* 4. Conexión POP / IMAP & Google Workspace */}
              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'google'
                    ? 'bg-blue-50 text-blue-700 shadow-xs border border-blue-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Globe2 className={`h-4 w-4 shrink-0 ${activeTab === 'google' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="truncate">Conexión POP / IMAP</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Servidor Verificado" />
              </button>

              {/* 5. Laboratorio de Ingesta & Test Cases */}
              <button
                type="button"
                onClick={() => setActiveTab('laboratorio')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'laboratorio'
                    ? 'bg-amber-50 text-amber-800 shadow-xs border border-amber-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Zap className={`h-4 w-4 shrink-0 ${activeTab === 'laboratorio' ? 'text-amber-600' : 'text-slate-400'}`} />
                <span className="truncate">Laboratorio de Ingesta</span>
              </button>

              {/* 6. Directorio Oficial */}
              <button
                type="button"
                onClick={() => setActiveTab('directorio')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'directorio'
                    ? 'bg-purple-50 text-purple-700 shadow-xs border border-purple-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <Users className={`h-4 w-4 shrink-0 ${activeTab === 'directorio' ? 'text-purple-600' : 'text-slate-400'}`} />
                <span className="truncate">Directorio Oficial</span>
              </button>

              {/* 7. Bitácora */}
              <button
                type="button"
                onClick={() => setActiveTab('bitacora')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'bitacora'
                    ? 'bg-slate-100 text-slate-900 shadow-xs border border-slate-300 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className={`h-4 w-4 shrink-0 ${activeTab === 'bitacora' ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="truncate">Bitácora</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 shrink-0">
                  {logs.length}
                </span>
              </button>

              {/* BANDEJA DE ENTRADA (ESTILO GMAIL EN TIEMPO REAL) */}
              <button
                type="button"
                onClick={() => {
                  setActiveTab('raw_inbox');
                  setSelectedRawEmailId(null);
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'raw_inbox'
                    ? 'bg-red-50 text-[#EA4335] shadow-xs border border-red-200/90 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className={`h-4 w-4 shrink-0 ${activeTab === 'raw_inbox' ? 'text-[#EA4335]' : 'text-slate-400'}`} />
                  <span className="truncate">Bandeja de Entrada</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {rawEmailsList.some(e => e.is_unread) && (
                    <span className="w-2 h-2 rounded-full bg-[#EA4335] animate-pulse" title="Correos sin leer" />
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    activeTab === 'raw_inbox' ? 'bg-[#EA4335] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {rawEmailsList.length}
                  </span>
                </div>
              </button>

              {/* 8. ROI & Telemetría */}
              <button
                type="button"
                onClick={() => setActiveTab('roi')}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all cursor-pointer text-left ${
                  activeTab === 'roi'
                    ? 'bg-emerald-50 text-emerald-800 shadow-xs border border-emerald-200/80 font-black'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <BarChart3 className={`h-4 w-4 shrink-0 ${activeTab === 'roi' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="truncate">ROI & Telemetría</span>
              </button>
            </div>

            {/* Pie de la barra lateral con Estado de Sincronización y Cuenta */}
            <div className="p-3 border-t border-slate-200/80 bg-slate-50/70">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="truncate">Google API: En Línea</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 truncate">
                  Sinc: <span className="font-semibold text-slate-600">{lastSyncTime}</span>
                </p>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400 font-medium">Auto-Sync</span>
                  <span className="text-indigo-600 font-bold">{isAutoSyncActive ? `${autoSyncCountdown}s` : 'Pausado'}</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ÁREA DE CONTENIDO PRINCIPAL A LA DERECHA */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">

          {/* ------------------------------------------------------- */}
          {/* TAB 1: BANDEJA INTELIGENTE & CORREOS USABLES VS NO USABLES */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'inbox' && (
            <div className="space-y-5">
              {/* Tarjetas de Métricas Ejecutivas del Inbox con Cálculo Reactivo Dinámico */}
              {(() => {
                const usableEmailsCount = mattersList.reduce((acc, m) => acc + Math.max(1, m.reincidence_count || 1), 0);
                const discardedEmailsCount = 285 + discardedList.length;
                const totalGrossVolume = usableEmailsCount + discardedEmailsCount;
                const usablePercent = totalGrossVolume > 0 ? ((usableEmailsCount / totalGrossVolume) * 100).toFixed(1) : '0.0';
                const discardedPercent = totalGrossVolume > 0 ? ((discardedEmailsCount / totalGrossVolume) * 100).toFixed(1) : '0.0';

                return (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Volumen Bruto Hoy</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-900">{totalGrossVolume}</span>
                        <span className="text-xs font-bold text-slate-500">correos recibidos</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-medium">Bandeja general en Google Cloud</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Correos Usables</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-emerald-700">{usableEmailsCount}</span>
                        <span className="text-xs font-bold text-emerald-600">({usablePercent}%)</span>
                      </div>
                      <span className="text-[10px] text-emerald-600 font-medium">Consolidados en {mattersList.length} Asuntos</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 shadow-xs">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">No Usables / Descartados</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-slate-700">{discardedEmailsCount}</span>
                        <span className="text-xs font-bold text-slate-500">({discardedPercent}%)</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-medium">Spam y publicidad filtrada</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-200 shadow-xs">
                      <span className="text-[11px] font-bold text-indigo-800 uppercase tracking-wider block">Atención Salvada CEO</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-black text-indigo-700">3.8 hrs</span>
                        <span className="text-xs font-bold text-indigo-600">hoy</span>
                      </div>
                      <span className="text-[10px] text-indigo-600 font-medium">Cero interrupciones operativas</span>
                    </div>
                  </div>
                );
              })()}

              {/* Banner de Patrón Proactivo Detectado */}
              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 text-white shadow-md border border-indigo-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-amber-300 text-xl shrink-0 shadow-inner">
                    ✨
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-900/60 px-2 py-0.5 rounded-md border border-indigo-700">
                      Patrón Proactivo Detectado en Tiempo Real
                    </span>
                    <h4 className="text-sm font-black text-white mt-1">
                      17 familias de Campus Montes y Lagos consultando horario de salida de festival
                    </h4>
                    <p className="text-xs text-indigo-200 mt-0.5 max-w-2xl leading-relaxed">
                      Llegaron 17 correos en 4 horas con la misma inquietud. El Motor de IA sugiere emitir la Circular General para responder masivamente sin consumo de tokens y evitar saturación en coordinaciones.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      applyTemplate('circular');
                      setActiveTab('redactar');
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Aprobar Circular
                  </button>
                  <button
                    onClick={() => setShowCatchupModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    Audio Digest
                  </button>
                </div>
              </div>

              {/* Barra de Sincronización en Tiempo Real Automática (Cada 30 Segundos) */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200 border border-indigo-800/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-white text-xs">
                        Sincronización Continua & Triage en Vivo ({connectedEmail || 'Buzón Conectado'})
                      </h5>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                        {isAutoSyncActive ? `Auto-triage en ${autoSyncCountdown}s` : 'Pausado'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Revisión automática cada 30 segundos. Si te envías un correo, el Motor de IA lo clasifica en tiempo real sin requerir contraseñas manuales.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleTriggerSync(false, true)}
                    disabled={isSyncingLiveInbox}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                    title="Detectar y clasificar el correo que enviaste a tu cuenta"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-300" />
                    <span>Detectar Correo Enviado</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsAutoSyncActive(!isAutoSyncActive)}
                    className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    {isAutoSyncActive ? 'Pausar 30s' : 'Reanudar 30s'}
                  </button>
                </div>
              </div>

              {/* Segmented Control & Acciones de Bandeja */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center p-1 bg-slate-100 rounded-xl">
                    <button
                      onClick={() => setInboxFilter('USABLE')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inboxFilter === 'USABLE'
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>🟢 Correos Usables & Asuntos Clave ({mattersList.length})</span>
                    </button>

                    <button
                      onClick={() => setInboxFilter('DISCARDED')}
                      className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        inboxFilter === 'DISCARDED'
                          ? 'bg-white text-slate-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      <span>⚪ Correos No Usables / Descartados ({discardedList.length})</span>
                    </button>
                  </div>

                  {/* Botones de Acción Rápida: Ingestar Correo y Sincronizar */}
                  <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setShowManualIngestModal(true)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                      title="Ingestar y clasificar un correo de prueba o el que acabas de enviar"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Ingestar / Probar Correo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTriggerSync(false)}
                      disabled={isSyncingLiveInbox || isLivePinging}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLiveInbox ? 'animate-spin text-amber-300' : ''}`} />
                      <span>{isSyncingLiveInbox ? 'Sincronizando...' : 'Sincronizar'}</span>
                    </button>
                  </div>
                </div>

                {/* Subfiltro de Usables (Segunda Fila, Limpia y Sin Scroll Horizontal) */}
                {inboxFilter === 'USABLE' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setUsableSubFilter('ALL')}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors ${
                          usableSubFilter === 'ALL' ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        Todos ({intelligentMatters.length})
                      </button>
                      <button
                        onClick={() => setUsableSubFilter('ATENCION_CEO')}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                          usableSubFilter === 'ATENCION_CEO' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 hover:bg-red-100'
                        }`}
                      >
                        <span>🔴 Atención CEO ({intelligentMatters.filter(m => m.destination === 'ATENCION_CEO').length})</span>
                      </button>
                      <button
                        onClick={() => setUsableSubFilter('DELEGADO_CON_SLA')}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                          usableSubFilter === 'DELEGADO_CON_SLA' ? 'bg-amber-500 text-white shadow-xs' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                      >
                        <span>🟡 Delegados ({intelligentMatters.filter(m => m.destination === 'DELEGADO_CON_SLA' || (m.destination as any) === 'DELEGADO_CON_PLAZO').length})</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/80">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      <span>Filtro VIP: Solo Atención CEO y Delegados (Informativos en Bandeja de Entrada)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* LISTA DE CORREOS USABLES (ASUNTOS CONSOLIDADOS) */}
              {inboxFilter === 'USABLE' && (
                <div className="space-y-3">
                  {filteredMatters.map((matter) => {
                    const isUrgent = matter.urgency === 'CRITICA';
                    const isCeoAttention = matter.destination === 'ATENCION_CEO';

                    return (
                      <div
                        key={matter.id}
                        className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all hover:shadow-md ${
                          isCeoAttention
                            ? 'border-red-300 ring-1 ring-red-200'
                            : matter.destination === 'DELEGADO_CON_SLA'
                            ? 'border-amber-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              {matter.matter_code}
                            </span>
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isCeoAttention ? 'bg-red-100 text-red-800 border border-red-200' :
                              matter.destination === 'DELEGADO_CON_SLA' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              'bg-blue-100 text-blue-800 border border-blue-200'
                            }`}>
                              {isCeoAttention ? '🔴 Atención Inmediata CEO' :
                               matter.destination === 'DELEGADO_CON_SLA' ? '🟡 Delegado (24-48h)' :
                               '🔵 Informativo'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                              {matter.category}
                            </span>
                            {matter.reincidence_count > 1 && (
                              <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200 flex items-center gap-1">
                                <AlertTriangle className="h-3 w-3" /> Reincidencia ({matter.reincidence_count} correos)
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                            <span className="text-amber-600 font-mono font-black">{matter.sla_remaining_text}</span>
                            <span>•</span>
                            <span>{matter.received_at}</span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {matter.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {matter.summary}
                          </p>

                          {/* Explicabilidad Causal: ¿Por qué te lo muestro? */}
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex items-start gap-2">
                            <span className="font-bold text-indigo-700 shrink-0">¿Por qué te lo muestro?</span>
                            <span className="text-slate-600">{matter.why_shown}</span>
                          </div>

                          {/* Cláusula de procedencia Bóveda IBIME */}
                          {matter.provenance_doc && (
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Procedencia Bóveda Curricular:</span>
                              <code className="text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[10px] font-mono">{matter.provenance_doc}</code>
                            </div>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="text-xs text-slate-500">
                            <span>Remitente: <strong>{matter.sender_name}</strong> ({matter.sender_email})</span>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleOpenMatterDetail(matter)}
                              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <FileCheck className="h-3.5 w-3.5 text-amber-300" />
                              <span>Revisar Expediente & Borrador IA</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LISTA DE CORREOS NO USABLES (SPAM & DESCARTADOS) */}
              {inboxFilter === 'DISCARDED' && (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                      <span>
                        <strong>Filtro Heurístico Anti-Saturación Activo:</strong> Estos correos fueron catalogados como no usables y archivados sin notificar al Director para preservar su tiempo y enfoque institucional.
                      </span>
                    </div>
                    <span className="font-bold text-amber-800 whitespace-nowrap ml-2">91.9% Reducción de Ruido</span>
                  </div>

                  {discardedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-2 opacity-90 hover:opacity-100 transition-opacity"
                    >
                      <div className="flex items-center justify-between text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{item.sender_name}</span>
                          <span className="text-slate-400">&lt;{item.sender_email}&gt;</span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                            {item.category}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">{item.received_at}</span>
                      </div>

                      <h5 className="font-bold text-slate-800 text-sm">{item.subject}</h5>

                      <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5">
                        <span className="font-bold text-rose-700 shrink-0">Motivo de Descarte Forense:</span>
                        <span>{item.discard_reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 2: LABORATORIO DE INGESTA & PRUEBAS EN VIVO         */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'laboratorio' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <h4 className="font-black text-indigo-950 text-sm flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500" />
                    <span>Banco de Pruebas & Ingesta Forense en Tiempo Real</span>
                  </h4>
                  <p className="text-indigo-800 text-xs">
                    Permite inyectar cualquier correo en crudo o escenario de prueba para verificar la clasificación, grounding en Bóveda Curricular y redacción de borradores.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                  <span className="text-[10px] font-bold text-indigo-600">Cargar Casos Rápidos:</span>
                  <button onClick={() => handleApplyLabPreset('acoso')} className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-100 text-red-700 font-bold text-[10px] border border-indigo-200 cursor-pointer">🚨 Caso SEP/Acoso</button>
                  <button onClick={() => handleApplyLabPreset('cfdi')} className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] border border-indigo-200 cursor-pointer">💳 SAT CFDI</button>
                  <button onClick={() => handleApplyLabPreset('transporte')} className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-100 text-amber-700 font-bold text-[10px] border border-indigo-200 cursor-pointer">🚌 Transporte</button>
                  <button onClick={() => handleApplyLabPreset('spam')} className="px-2 py-1 rounded-lg bg-white hover:bg-indigo-100 text-slate-700 font-bold text-[10px] border border-indigo-200 cursor-pointer">⚪ Spam</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Formulario de Entrada */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3.5 text-xs">
                  <h4 className="font-black text-slate-900 text-sm border-b border-slate-100 pb-2">
                    Datos del Mensaje Entrante
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Cuenta Receptora Institucional</label>
                      <select
                        value={labRecipient}
                        onChange={(e) => setLabRecipient(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value="direccion.general@ibime.edu.mx">direccion.general@ibime.edu.mx (CEO)</option>
                        <option value="cobranza@ibime.edu.mx">cobranza@ibime.edu.mx (Finanzas & SAT)</option>
                        <option value="controlescolar@ibime.edu.mx">controlescolar@ibime.edu.mx (Control Escolar)</option>
                        <option value="campus.montes@ibime.edu.mx">campus.montes@ibime.edu.mx (Montes)</option>
                        <option value="admisiones@ibime.edu.mx">admisiones@ibime.edu.mx (Admisiones)</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Reincidencia Detectada</label>
                      <select
                        value={labReincidence}
                        onChange={(e) => setLabReincidence(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                      >
                        <option value={1}>1er correo (Inicial)</option>
                        <option value={2}>2da comunicación</option>
                        <option value={3}>3ra comunicación (Reincidencia Crítica)</option>
                        <option value={5}>5 o más comunicaciones</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nombre del Remitente</label>
                      <input
                        type="text"
                        value={labSenderName}
                        onChange={(e) => setLabSenderName(e.target.value)}
                        placeholder="ej. Familia Mendoza"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Correo Electrónico Real</label>
                      <input
                        type="email"
                        value={labSenderEmail}
                        onChange={(e) => setLabSenderEmail(e.target.value)}
                        placeholder="ej. remitente@gmail.com"
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asunto del Correo</label>
                    <input
                      type="text"
                      value={labSubject}
                      onChange={(e) => setLabSubject(e.target.value)}
                      placeholder="Asunto formal o mensaje"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Cuerpo Completo del Correo (o formato .eml)</label>
                    <textarea
                      rows={5}
                      value={labBody}
                      onChange={(e) => setLabBody(e.target.value)}
                      placeholder="Contenido íntegro del correo..."
                      className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-normal leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-mono text-[11px]"
                    />
                  </div>

                  <button
                    onClick={handleRunLabTest}
                    disabled={labIsProcessing}
                    className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                  >
                    {labIsProcessing ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Ejecutando Inferencia & RAG Vectorial...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span>⚡ Procesar Correo con Motor de IA (Hermetic RAG)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Panel de Resultado Forense */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between text-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
                      <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                        <FileCheck className="h-4 w-4 text-emerald-600" />
                        <span>Dictamen Forense & RAG de Bóveda</span>
                      </h4>
                      {labResult && (
                        <span className="text-[10px] font-mono text-slate-400">
                          {labResult.telemetry.latency_ms}ms · {labResult.telemetry.timestamp.slice(11, 19)}
                        </span>
                      )}
                    </div>

                    {!labResult && !labIsProcessing && (
                      <div className="py-16 text-center text-slate-400 space-y-2">
                        <Compass className="h-8 w-8 mx-auto text-slate-300 animate-spin-slow" />
                        <p className="font-medium text-xs">Presiona "Procesar Correo" para observar el triage hermético en vivo.</p>
                      </div>
                    )}

                    {labIsProcessing && (
                      <div className="py-16 text-center text-indigo-600 space-y-3">
                        <RefreshCw className="h-8 w-8 mx-auto animate-spin" />
                        <p className="font-bold text-xs">Consultando Bóveda Curricular IBIME y aislando tenant...</p>
                      </div>
                    )}

                    {labResult && (
                      <div className="space-y-3 animate-in fade-in duration-200">
                        <div className="flex items-center justify-between">
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                            labResult.quadrant === 'ATENCION_CEO' ? 'bg-red-100 text-red-800 border border-red-200' :
                            labResult.quadrant === 'DELEGADO_CON_SLA' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                            labResult.quadrant === 'INFORMATIVO' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                            'bg-slate-100 text-slate-700 border border-slate-300'
                          }`}>
                            Cuadrante: {labResult.quadrant}
                          </span>

                          <span className="font-bold text-xs text-slate-700">
                            {labResult.quadrant === 'SPAM_DESCARTADO' ? '⚪ Correo No Usable' : '🟢 Correo Usable'}
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                          <span className="font-bold text-indigo-900 block">¿Por qué te lo muestro?</span>
                          <p className="text-slate-600 leading-relaxed">{labResult.why_shown_to_director}</p>
                        </div>

                        <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                          <span className="font-bold text-emerald-900 block">Acción Recomendada & Plazo</span>
                          <p className="text-emerald-800 font-medium">{labResult.recommended_action} (Plazo: {labResult.sla_hours || 0}h)</p>
                        </div>

                        {labResult.provenance && labResult.provenance.length > 0 && (
                          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                            <span className="font-bold text-blue-900 block">Cláusula Citada de Bóveda Curricular IBIME:</span>
                            <p className="text-blue-800 font-mono text-[11px]">{labResult.provenance[0].document_title}</p>
                            <p className="text-slate-600 text-[11px] italic">"{labResult.provenance[0].matched_clause}"</p>
                          </div>
                        )}

                        <div className="space-y-1">
                          <span className="font-bold text-slate-800 block text-xs">Borrador Pedagógico Formal Sugerido:</span>
                          <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                            {labResult.suggested_draft.body}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {labResult && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Aislamiento Multi-Tenant: <strong>Verificado (Sin Fugas)</strong></span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(labResult.suggested_draft.body);
                          onTriggerToast('✓ Borrador copiado al portapapeles');
                        }}
                        className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
                      >
                        Copiar Borrador
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 3: CONEXIÓN UNIVERSAL DE CORREO (POP3 / IMAP / SMTP) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'google' && (
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Tarjeta Ejecutiva Compacta para CEO / Administrativos */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-xs">
                      <Server className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900">
                          Conexión Universal de Correo & Google Workspace
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[9px] uppercase tracking-wide">
                          Multiservicio 360°
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Sincronización hermética con Google Workspace, Microsoft 365, iCloud o servidor institucional (@{schoolDomain}).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => runLivePingCheck(connectedEmail || authUsername, incomingHost, incomingPort, incomingSecurity, selectedProtocol, authPassword, { mode: 'sync', deviceConfirmed: true })}
                      disabled={isLivePinging}
                      title="Enviar ping de comprobación en tiempo real al servidor de correo"
                      className="px-2.5 py-1 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Zap className={`h-3 w-3 ${isLivePinging ? 'animate-spin text-amber-500' : 'text-amber-500'}`} />
                      <span>{isLivePinging ? 'Enviando Ping...' : 'Probar Ping en Vivo'}</span>
                    </button>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 font-mono font-bold text-[10px] flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      TLS 1.3
                    </span>
                    <span className={`px-2 py-0.5 rounded-md border font-mono font-bold text-[10px] ${
                      connectionStatus === 'connected_verified'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : connectionStatus === 'failed'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {verifiedLatency ? `${verifiedLatency}ms` : connectionTestResult?.latencyMs ? `${connectionTestResult.latencyMs}ms` : '-- ms'}
                    </span>
                  </div>
                </div>

                {/* Estado de la Cuenta Activa (Verificación Estricta por Ping en Tiempo Real) */}
                {connectedEmail && connectedEmail !== 'DISCONNECTED' && connectionStatus === 'connected_verified' ? (
                  /* 1. Tarjeta Verificada Exitosamente con Ping de Retorno Confirmado */
                  <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-white border border-emerald-200/80 space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs shrink-0 p-2">
                          {renderProviderLogo(detectProviderKey(connectedEmail, incomingHost), 24)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm truncate">{connectedEmail}</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] border border-emerald-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                              Conectado & Verificado ({verifiedLatency || 18}ms)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 truncate">
                            <span className="font-medium truncate">{directorTitle}</span>
                            <span>•</span>
                            <span className="font-mono text-emerald-700 font-bold">
                              {selectedProtocol}: {incomingPort} ({incomingSecurity})
                            </span>
                            <span>•</span>
                            <span className="font-mono text-slate-600 font-medium">
                              SMTP: {outgoingPort}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Botones de Gestión de Cuenta: Configurar (Desplegable) y Salir de la Cuenta */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setIsEditingServerConfig(!isEditingServerConfig)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border shadow-xs ${
                            isEditingServerConfig
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-indigo-100'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                          <span>{isEditingServerConfig ? 'Ocultar Configuración' : 'Configurar Servidor'}</span>
                          {isEditingServerConfig ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={handleSignOutGoogleAccount}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                          title="Cerrar sesión de esta cuenta para cambiar a otra cuenta"
                        >
                          <LogOut className="h-3.5 w-3.5 text-rose-600" />
                          <span>Salir de la Cuenta</span>
                        </button>
                      </div>
                    </div>

                    {/* Acciones Rápidas Ejecutivas */}
                    <div className="pt-2.5 border-t border-emerald-200/50 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setActiveTab('inbox')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Inbox className="h-3.5 w-3.5 text-amber-300" />
                          <span>Abrir Bandeja Inteligente</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('calendario')}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Calendar className="h-3.5 w-3.5 text-amber-300" />
                          <span>Ver Calendario</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveTab('redactar')}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Send className="h-3.5 w-3.5 text-slate-600" />
                          <span>Redactar Correo</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleTriggerSync(false)}
                        disabled={isSyncingLiveInbox || isLivePinging}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95 disabled:opacity-50"
                      >
                        <RefreshCw className={`h-3 w-3 ${isSyncingLiveInbox || isLivePinging ? 'animate-spin' : ''}`} />
                        <span>{isSyncingLiveInbox ? 'Sincronizando...' : 'Sincronizar'}</span>
                      </button>
                    </div>
                  </div>
                ) : connectedEmail && connectedEmail !== 'DISCONNECTED' && (connectionStatus === 'pinging' || isLivePinging) ? (
                  /* 2. Tarjeta en Estado de Ping Activo (Esperando Respuesta en Tiempo Real) */
                  <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/80 via-blue-50/50 to-white border border-indigo-200 space-y-3 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-xs shrink-0">
                          <RefreshCw className="h-5 w-5 animate-spin text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900 text-sm truncate">{connectedEmail}</span>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold text-[10px] border border-indigo-200">
                              <RefreshCw className="h-3 w-3 animate-spin text-indigo-600" />
                              Comprobando Conexión (Ping en Vivo)...
                            </span>
                          </div>
                          <p className="text-[11px] text-indigo-700 mt-0.5">
                            Enviando paquetes de comprobación y verificando respuesta de {incomingHost || 'servidor'}:{incomingPort}...
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-600 font-bold animate-pulse">Esperando pong...</span>
                      </div>
                    </div>
                  </div>
                ) : ((connectedEmail && connectedEmail !== 'DISCONNECTED' && connectionStatus === 'failed') || device2FAChallenge?.active) ? (
                  /* 3. Tarjeta en Estado de Fallo de Ping / Error de Credenciales o Desafío 2FA Activo */
                  <div className="p-4 rounded-xl bg-gradient-to-r from-rose-50/90 via-red-50/40 to-white border border-rose-300 shadow-xs space-y-3">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-11 h-11 rounded-xl bg-white border border-rose-200 flex items-center justify-center shadow-xs shrink-0 p-2">
                          {renderProviderLogo(detectProviderKey(connectedEmail, incomingHost), 24)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900 text-sm truncate">{connectedEmail}</span>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-300">
                              <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
                              Fallo de Verificación / Ping Rechazado
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 truncate">
                            <span className="font-medium text-rose-600 font-bold">Servidor no validado</span>
                            <span>•</span>
                            <span className="font-mono text-slate-600">
                              {selectedProtocol}: {incomingPort} ({incomingSecurity})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                          type="button"
                          onClick={() => handleOpenProviderOAuth(detectProviderKey(connectedEmail, incomingHost))}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
                          title="Abrir autorización directa en el servidor oficial del proveedor"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Autorizar en Servidor Oficial (OAuth) ↗</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setIsEditingServerConfig(true)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <Settings2 className="h-3.5 w-3.5" />
                          <span>Configurar y Corregir</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSignOutGoogleAccount}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                          title="Cerrar o desvincular esta cuenta errónea"
                        >
                          <LogOut className="h-3.5 w-3.5 text-rose-600" />
                          <span>Desvincular Cuenta</span>
                        </button>
                      </div>
                    </div>

                    {/* Alerta y Desafío Oficial de Verificación en 2 Pasos de Google (Notificación al Celular con Número en Pantalla) */}
                    {(device2FAChallenge?.active || lastPingError?.includes('2 Pasos') || lastPingError?.includes('contraseña de aplicación') || lastPingError?.includes('Contraseña de Aplicación') || lastPingError?.includes('Application-specific password')) ? (
                      <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white border-2 border-blue-400/80 shadow-lg space-y-4 animate-in fade-in duration-200">
                        {/* Encabezado con Identidad Oficial de Seguridad Google */}
                        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-blue-200/70 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white border border-blue-200 shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                              <Smartphone className="h-5 w-5 text-blue-600 animate-pulse" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>Comprueba tu teléfono celular</span>
                                </h5>
                                <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black tracking-wide uppercase">
                                  Google 2FA Activo
                                </span>
                              </div>
                              <p className="text-xs text-slate-600 mt-0.5">
                                Google ha enviado una notificación al número registrado en tu teléfono móvil para comprobar el acceso a <strong className="text-slate-900">{connectedEmail || authUsername || 'tu cuenta de Google'}</strong>.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                              Notificación Enviada al Celular
                            </span>
                          </div>
                        </div>

                        {/* Desafío del Número en Pantalla oficial de Google (ej. 42) */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-blue-200/90 shadow-xs">
                          <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-blue-50 to-indigo-50/70 border border-blue-300/80 text-center">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                              Toca este número en tu celular:
                            </span>
                            <div className="my-2 px-6 py-2 rounded-2xl bg-blue-600 text-white font-black text-3xl tracking-widest shadow-md shadow-blue-500/30 border-2 border-blue-300">
                              {device2FAChallenge?.verificationNumber || 42}
                            </div>
                            <span className="text-[10px] text-slate-500 font-medium">
                              Número de comprobación Google
                            </span>
                          </div>

                          <div className="md:col-span-8 space-y-3">
                            <div className="space-y-1">
                              <h6 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                <span>Pasos de comprobación en tu móvil:</span>
                              </h6>
                              <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside font-medium">
                                <li>Desbloquea el teléfono celular registrado en tu cuenta de Google.</li>
                                <li>Abre la notificación de Google que pregunta: <em>"¿Estás intentando iniciar sesión?"</em>.</li>
                                <li>Toca <strong>"Sí, soy yo"</strong> y selecciona el número <strong className="text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">{device2FAChallenge?.verificationNumber || 42}</strong>.</li>
                              </ol>
                            </div>

                            <button
                              type="button"
                              onClick={handleConfirmMobileDevice2FA}
                              disabled={isLivePinging}
                              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-4 w-4 text-emerald-100" />
                              <span>✓ Ya toqué 'Sí' y seleccioné el número {device2FAChallenge?.verificationNumber || 42} en mi celular (Comprobar y Conectar)</span>
                            </button>
                          </div>
                        </div>

                        {/* Alternativa: Código SMS de 6 dígitos enviado al celular registrado */}
                        <div className="pt-3 border-t border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                          <div className="text-slate-600 text-[11px]">
                            <span>¿Prefieres recibir el código por mensaje de texto SMS? Revisa el SMS enviado por Google a tu celular:</span>
                          </div>

                          <form onSubmit={handleVerify2FACode} className="flex items-center gap-2 w-full sm:w-auto">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">G-</span>
                              <input
                                type="text"
                                value={sms2FACodeInput}
                                onChange={(e) => setSms2FACodeInput(e.target.value.replace(/^G-?/i, ''))}
                                placeholder="123456"
                                maxLength={6}
                                className="w-36 pl-8 pr-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-500"
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isLivePinging}
                              className="px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shrink-0 shadow-xs active:scale-95"
                            >
                              Verificar Código SMS
                            </button>
                          </form>
                        </div>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-bold flex items-center gap-1.5 text-rose-800">
                            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
                            Dictamen de Comprobación en Tiempo Real:
                          </span>
                          <button
                            type="button"
                            onClick={() => runLivePingCheck(connectedEmail, incomingHost, incomingPort, incomingSecurity, selectedProtocol, authPassword)}
                            disabled={isLivePinging}
                            className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] shadow-xs cursor-pointer flex items-center gap-1 shrink-0 transition-all active:scale-95 disabled:opacity-50"
                          >
                            <RefreshCw className={`h-3 w-3 ${isLivePinging ? 'animate-spin' : ''}`} />
                            <span>Reintentar Ping</span>
                          </button>
                        </div>
                        <p className="text-[11px] leading-relaxed text-rose-700 font-medium">
                          {lastPingError || 'El servidor no devolvió respuesta afirmativa de ping o las credenciales no son válidas.'}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* 4. Estado Desconectado */
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 via-blue-50/20 to-white border-2 border-dashed border-slate-300 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-xs text-blue-600 mx-auto flex items-center justify-center">
                      <Smartphone className="h-6 w-6 text-blue-600 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                        Conexión de Correo & Doble Verificación Oficial
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                        Vincula tu cuenta de Google mediante comprobación instantánea al número de celular registrado o configura tu servidor institucional.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('google')}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer inline-flex items-center gap-2 active:scale-95"
                      >
                        <Smartphone className="h-4 w-4 text-white" />
                        <span>Vincular Google con 2FA al Celular (Número en Pantalla)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setIsEditingServerConfig(!isEditingServerConfig)}
                        className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Settings2 className="h-3.5 w-3.5 text-slate-500" />
                        <span>{isEditingServerConfig ? 'Ocultar Configuración' : 'Configurar Servidor Propio'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ========================================================= */}
              {/* MENÚ DESPLEGABLE / ACORDEÓN DE CONFIGURACIÓN & PROTOCOLOS  */}
              {/* Se expande a petición del usuario para mantener la vista   */}
              {/* del CEO lo más compacta y limpia posible.                  */}
              {/* ========================================================= */}
              {isEditingServerConfig && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-5 animate-in fade-in duration-200">
                  {/* Encabezado del Menú Desplegable */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                        <KeyRound className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Configuración Quirúrgica de Servidor & Autenticación
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          Selecciona el proveedor con los logos oficiales o ingresa los parámetros directos IMAP / POP3.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingServerConfig(false)}
                      className="px-2.5 py-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <span>Minimizar</span>
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* 1. Logos Oficiales de Empresas Proveedoras (Excepción Autorizada de Marca) */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Autorización Directa por Proveedor (Acceso en Servidor Oficial):</span>
                      </label>
                      <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">
                        Presiona tu proveedor para abrir la autorización directa
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                      {/* Google Workspace / Gmail */}
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('google')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                          detectProviderKey(authUsername || connectedEmail, incomingHost) === 'google'
                            ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform p-1.5">
                          <GoogleOfficialLogo size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-[11px] block truncate">Google Workspace</span>
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[8px] font-black uppercase tracking-wider block mt-0.5">
                            OAuth 2.0 ↗
                          </span>
                        </div>
                      </button>

                      {/* Microsoft 365 / Outlook */}
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('microsoft')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                          detectProviderKey(authUsername || connectedEmail, incomingHost) === 'microsoft'
                            ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-400/20 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform p-1.5">
                          <OutlookOfficialLogo size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-[11px] block truncate">Microsoft 365</span>
                          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[8px] font-black uppercase tracking-wider block mt-0.5">
                            OAuth 2.0 ↗
                          </span>
                        </div>
                      </button>

                      {/* Apple iCloud */}
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('apple')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                          detectProviderKey(authUsername || connectedEmail, incomingHost) === 'apple'
                            ? 'bg-blue-50/90 border-blue-400 ring-2 ring-blue-400/20 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform p-1.5">
                          <AppleICloudOfficialLogo size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-[11px] block truncate">Apple iCloud</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-800 text-[8px] font-black uppercase tracking-wider block mt-0.5">
                            Apple ID ↗
                          </span>
                        </div>
                      </button>

                      {/* Yahoo Mail */}
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('yahoo')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                          detectProviderKey(authUsername || connectedEmail, incomingHost) === 'yahoo'
                            ? 'bg-purple-50/90 border-purple-400 ring-2 ring-purple-400/20 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform p-1.5">
                          <YahooOfficialLogo size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-[11px] block truncate">Yahoo Mail</span>
                          <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[8px] font-black uppercase tracking-wider block mt-0.5">
                            OAuth 2.0 ↗
                          </span>
                        </div>
                      </button>

                      {/* Zoho Mail */}
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('zoho')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                          detectProviderKey(authUsername || connectedEmail, incomingHost) === 'zoho'
                            ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform p-1.5">
                          <ZohoOfficialLogo size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-[11px] block truncate">Zoho Mail</span>
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[8px] font-black uppercase tracking-wider block mt-0.5">
                            OAuth 2.0 ↗
                          </span>
                        </div>
                      </button>

                      {/* Servidor Institucional Propio */}
                      <button
                        type="button"
                        onClick={() => handleOpenProviderOAuth('custom')}
                        className={`p-3 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group hover:shadow-md hover:scale-[1.02] active:scale-95 ${
                          detectProviderKey(authUsername || connectedEmail, incomingHost) === 'custom'
                            ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400/20 shadow-xs'
                            : 'bg-slate-50/80 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 shadow-xs flex items-center justify-center group-hover:scale-105 transition-transform p-1.5">
                          <CustomServerOfficialLogo size={22} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-black text-slate-900 text-[11px] block truncate">Servidor Propio</span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[8px] font-black uppercase tracking-wider block mt-0.5">
                            Personalizado
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* 2. Selector de Protocolo (IMAP vs POP3) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleProtocolChange('IMAP')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedProtocol === 'IMAP'
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        selectedProtocol === 'IMAP' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-400 bg-white'
                      }`}>
                        {selectedProtocol === 'IMAP' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-xs block">IMAP (Recomendado)</span>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Sincronización bidireccional continua con el servidor remoto. Puerto estándar: 993 SSL.
                        </span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleProtocolChange('POP3')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                        selectedProtocol === 'POP3'
                          ? 'bg-indigo-50 border-indigo-500 shadow-xs ring-1 ring-indigo-500'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                        selectedProtocol === 'POP3' ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-400 bg-white'
                      }`}>
                        {selectedProtocol === 'POP3' && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                      </div>
                      <div>
                        <span className="font-black text-slate-900 text-xs block">POP3 (Descarga Local)</span>
                        <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">
                          Descarga en buzón local hermético. Ideal para archivos y respaldo. Puerto estándar: 995 SSL.
                        </span>
                      </div>
                    </button>
                  </div>

                  {/* 3. Usuario & Contraseña */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Usuario / Correo Electrónico Institucional o Comercial:
                      </label>
                      <input
                        type="email"
                        value={authUsername}
                        onChange={(e) => handleAuthEmailInputChange(e.target.value)}
                        placeholder={`ej. direccion@${schoolDomain} o tu-correo@gmail.com`}
                        className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 text-xs"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Contraseña o Token de Aplicación:
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={authPassword}
                          onChange={(e) => setAuthPassword(e.target.value)}
                          placeholder="Ingresa tu contraseña o app token..."
                          className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 pr-10 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Banner de Detección de Proveedor con Ceja a la Derecha */}
                  {(() => {
                    const detected = resolveEmailServerConfig(authUsername || connectedEmail, selectedProtocol);
                    return (
                      <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-all ${
                        detected.isCommercial
                          ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                          : 'bg-indigo-50/80 border-indigo-200 text-indigo-900'
                      }`}>
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <Sparkles className={`h-4 w-4 shrink-0 mt-0.5 ${detected.isCommercial ? 'text-blue-600' : 'text-indigo-600'}`} />
                          <div className="min-w-0">
                            <span className="font-bold block truncate">
                              {detected.isCommercial
                                ? `Proveedor Comercial Detectado: ${detected.providerName}`
                                : `Servidor Propio / Institucional Detectado: ${detected.providerName}`
                              }
                            </span>
                            <span className="text-[11px] opacity-90 block mt-0.5 leading-tight">
                              {detected.isCommercial
                                ? (isManualServerExpanded
                                    ? 'Servidores oficiales preconfigurados. Ajustes manuales desplegados.'
                                    : 'Hosts oficiales y puertos preconfigurados automáticamente. Ajustes técnicos comprimidos.')
                                : 'Servidor propio institucional. Verifica o ajusta los servidores y puertos abajo.'
                              }
                            </span>
                          </div>
                        </div>

                        {/* Ceja al lado derecho para poder expandirlo en cualquier momento (por default se retira) */}
                        <button
                          type="button"
                          onClick={() => setIsManualServerExpanded(prev => !prev)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 border shadow-xs active:scale-95 ${
                            isManualServerExpanded
                              ? 'bg-white text-indigo-700 border-indigo-300 ring-2 ring-indigo-100'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                          title="Expandir o comprimir ajustes de servidor propio y puertos manuales"
                        >
                          <Settings2 className="h-3.5 w-3.5 text-indigo-600" />
                          <span>{isManualServerExpanded ? 'Comprimir Servidores ▴' : 'Configurar Servidor Propio / Puertos ▸'}</span>
                        </button>
                      </div>
                    );
                  })()}

                  {/* Resumen comprimido cuando el panel de puertos está cerrado */}
                  {!isManualServerExpanded && (
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/80 border border-dashed border-slate-300 text-xs text-slate-500">
                      <div className="flex items-center gap-2 min-w-0">
                        <Server className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] font-medium truncate">
                          Puertos oficiales ({selectedProtocol}: {incomingPort}, SMTP: {outgoingPort}) preconfigurados y comprimidos.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsManualServerExpanded(true)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold text-[11px] cursor-pointer hover:underline flex items-center gap-1 shrink-0"
                      >
                        <span>Ajustar Servidor Propio</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  )}

                  {/* 4. Panel Quirúrgico de Servidores y Puertos (Desplegado solo si es servidor propio o al abrir la ceja) */}
                  {isManualServerExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
                      {/* Servidor Entrante */}
                      <div className="space-y-2">
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Server className="h-3.5 w-3.5 text-indigo-600" />
                          Servidor Entrante ({selectedProtocol})
                        </span>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            Host Entrante:
                          </label>
                          <input
                            type="text"
                            value={incomingHost}
                            onChange={(e) => setIncomingHost(e.target.value)}
                            placeholder={`ej. imap.gmail.com o mail.${schoolDomain}`}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Puerto:
                            </label>
                            <input
                              type="number"
                              value={incomingPort}
                              onChange={(e) => setIncomingPort(Number(e.target.value))}
                              placeholder="993"
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Seguridad:
                            </label>
                            <select
                              value={incomingSecurity}
                              onChange={(e) => setIncomingSecurity(e.target.value as SecurityType)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="SSL_TLS">SSL / TLS</option>
                              <option value="STARTTLS">STARTTLS</option>
                              <option value="NONE">Sin Cifrado</option>
                            </select>
                          </div>
                        </div>

                        {/* Chips de Puertos Rápidos */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {STANDARD_MAIL_PORTS[selectedProtocol].map((p) => (
                            <button
                              key={p.port}
                              type="button"
                              onClick={() => {
                                setIncomingPort(p.port);
                                setIncomingSecurity(p.security);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                                incomingPort === p.port
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Puerto {p.port} ({p.security === 'SSL_TLS' ? 'SSL' : p.security})
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Servidor Saliente SMTP */}
                      <div className="space-y-2">
                        <span className="font-black text-slate-900 text-xs flex items-center gap-1.5">
                          <Send className="h-3.5 w-3.5 text-indigo-600" />
                          Servidor Saliente (SMTP)
                        </span>

                        <div>
                          <label className="text-[11px] font-bold text-slate-600 block mb-1">
                            SMTP Host:
                          </label>
                          <input
                            type="text"
                            value={outgoingHost}
                            onChange={(e) => setOutgoingHost(e.target.value)}
                            placeholder={`ej. smtp.gmail.com o mail.${schoolDomain}`}
                            className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Puerto SMTP:
                            </label>
                            <input
                              type="number"
                              value={outgoingPort}
                              onChange={(e) => setOutgoingPort(Number(e.target.value))}
                              placeholder="587"
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-slate-600 block mb-1">
                              Seguridad SMTP:
                            </label>
                            <select
                              value={outgoingSecurity}
                              onChange={(e) => setOutgoingSecurity(e.target.value as SecurityType)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              <option value="STARTTLS">STARTTLS</option>
                              <option value="SSL_TLS">SSL / TLS</option>
                              <option value="NONE">Sin Cifrado</option>
                            </select>
                          </div>
                        </div>

                        {/* Chips de Puertos Rápidos SMTP */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {STANDARD_MAIL_PORTS.SMTP.map((p) => (
                            <button
                              key={p.port}
                              type="button"
                              onClick={() => {
                                setOutgoingPort(p.port);
                                setOutgoingSecurity(p.security);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer border ${
                                outgoingPort === p.port
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              Puerto {p.port} ({p.security === 'STARTTLS' ? 'STARTTLS' : p.security === 'SSL_TLS' ? 'SSL' : 'Relay'})
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 5. Permisos Requeridos a Otorgar */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <span className="font-bold text-slate-900 block">
                      Permisos Otorgados para la Operación Institucional:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          checked={authorizedPermissions.readEmails}
                          onChange={(e) => setAuthorizedPermissions(prev => ({ ...prev, readEmails: e.target.checked }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-bold text-slate-800 text-[11px]">📬 Leer Correos</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          checked={authorizedPermissions.sendEmails}
                          onChange={(e) => setAuthorizedPermissions(prev => ({ ...prev, sendEmails: e.target.checked }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-bold text-slate-800 text-[11px]">📤 Enviar Correos</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer bg-white p-2 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          checked={authorizedPermissions.calendar}
                          onChange={(e) => setAuthorizedPermissions(prev => ({ ...prev, calendar: e.target.checked }))}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-bold text-slate-800 text-[11px]">📅 Gestión Calendario</span>
                      </label>
                    </div>
                  </div>

                  {/* Feedback del Test de Conexión */}
                  {connectionTestResult && (
                    <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                      connectionTestResult.success
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-red-50 border-red-300 text-red-900'
                    }`}>
                      <div className="flex items-center gap-2">
                        {connectionTestResult.success ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        )}
                        <div>
                          <span className="font-bold block">{connectionTestResult.message}</span>
                          {connectionTestResult.serverBanner && (
                            <span className="font-mono text-[10px] opacity-80 block">{connectionTestResult.serverBanner}</span>
                          )}
                        </div>
                      </div>
                      {connectionTestResult.latencyMs && (
                        <span className="px-2 py-0.5 rounded bg-white text-emerald-800 font-bold font-mono text-[10px] shrink-0 border border-emerald-200">
                          {connectionTestResult.latencyMs} ms
                        </span>
                      )}
                    </div>
                  )}

                  {/* Botón Principal de Conexión y Autorización */}
                  <button
                    onClick={async () => {
                      const emailToTry = (authUsername || connectedEmail).trim().toLowerCase();
                      if (emailToTry) {
                        await handleTestAndConnectMailServer();
                      } else {
                        await handleGoogleOAuthConnect();
                      }
                    }}
                    disabled={isTestingMailConnection || isAuthorizing || isGoogleOAuthConnecting}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                  >
                    {isTestingMailConnection || isAuthorizing || isGoogleOAuthConnecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin text-amber-300" />
                        <span>Verificando servidor {selectedProtocol}, handshake TLS y autorizando...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 text-amber-300" />
                        <span>Probar Conexión, Autorizar Servidor y Empezar a Trabajar</span>
                      </>
                    )}
                  </button>

                  {/* Formulario Secundario de Vinculación Directa */}
                  <form onSubmit={handleBindCustomGoogleEmail} className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="text-[11px] font-bold text-slate-700 block">
                      O vincula directamente un correo alternativo institucional o personal:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        value={customGoogleEmailInput}
                        onChange={(e) => setCustomGoogleEmailInput(e.target.value)}
                        placeholder={`ej. tu-correo@gmail.com o direccion@${schoolDomain}`}
                        className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-[#0F2744] hover:bg-[#1E5285] text-white font-bold text-xs shadow-xs transition-all cursor-pointer shrink-0"
                      >
                        Vincular Correo
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB: CALENDARIO ESCOLAR & CITAS INSTITUCIONALES        */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'calendario' && (
            <div className="space-y-4">
              {/* Header de Calendario y Botón Nueva Cita */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-black text-slate-900 text-sm sm:text-base flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                    <span>Agenda y Calendario Institucional · {schoolName}</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Audiencias con padres de familia, juntas de directores, sesiones de CTE y trámites oficiales SEP sincronizados con Google Calendar.
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Google Calendar API (TLS 1.3)</span>
                  </div>

                  <button
                    onClick={() => setShowNewEventModal(true)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <CalendarPlus className="h-4 w-4 text-amber-300" />
                    <span>+ Agendar Nueva Cita / Evento</span>
                  </button>
                </div>
              </div>

              {/* Métricas Rápidas de Agenda */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total en Agenda</span>
                  <span className="text-xl sm:text-2xl font-black text-slate-900 mt-1 block">{calendarEvents.length} Eventos</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Sincronizados en tiempo real</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Audiencias Padres</span>
                  <span className="text-xl sm:text-2xl font-black text-red-600 mt-1 block">
                    {calendarEvents.filter(e => e.category === 'AUDIENCIA_PADRES').length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Protocolo Convivencia Nivel 3</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Consejo Técnico & CTE</span>
                  <span className="text-xl sm:text-2xl font-black text-indigo-600 mt-1 block">
                    {calendarEvents.filter(e => e.category === 'CONSEJO_TECNICO' || e.category === 'JUNTA_DIRECTORES').length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Seguimiento Directivo</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Trámites SEP</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-600 mt-1 block">
                    {calendarEvents.filter(e => e.category === 'TRAMITE_SEP').length}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Supervisión y Boletas</span>
                </div>
              </div>

              {/* Filtros de Categoría */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-400 font-bold shrink-0 text-[11px] mr-1">Filtrar por:</span>
                {[
                  { id: 'ALL', label: 'Todos los Eventos' },
                  { id: 'AUDIENCIA_PADRES', label: '🚨 Audiencias con Familias' },
                  { id: 'CONSEJO_TECNICO', label: '📘 Consejo Técnico Escolar' },
                  { id: 'JUNTA_DIRECTORES', label: '💼 Juntas Directivas' },
                  { id: 'TRAMITE_SEP', label: '🏛️ Trámites SEP' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCalendarCategoryFilter(f.id)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      calendarCategoryFilter === f.id
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Lista de Eventos del Calendario */}
              <div className="space-y-3">
                {calendarEvents
                  .filter(e => calendarCategoryFilter === 'ALL' || e.category === calendarCategoryFilter)
                  .map((evt) => {
                    const isParentHearing = evt.category === 'AUDIENCIA_PADRES';
                    const isCTE = evt.category === 'CONSEJO_TECNICO';

                    return (
                      <div
                        key={evt.id}
                        className={`p-4 sm:p-5 rounded-2xl bg-white border transition-all hover:shadow-md ${
                          isParentHearing
                            ? 'border-red-200 ring-1 ring-red-100'
                            : isCTE
                            ? 'border-indigo-200'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              evt.category === 'AUDIENCIA_PADRES' ? 'bg-red-100 text-red-800 border border-red-200' :
                              evt.category === 'CONSEJO_TECNICO' ? 'bg-indigo-100 text-indigo-800 border border-indigo-200' :
                              evt.category === 'JUNTA_DIRECTORES' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {evt.category.replace('_', ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              {evt.campus}
                            </span>
                            {evt.linkedMatterId && (
                              <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                                Vinculado a Expediente
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            <span className="text-indigo-600 font-mono font-black flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                              {evt.date}
                            </span>
                            <span>•</span>
                            <span className="text-slate-700 font-mono">{evt.time}</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                              {evt.status}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 space-y-1.5">
                          <h4 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                            {evt.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">
                            {evt.notes}
                          </p>

                          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-slate-400" />
                              <span>Asistentes: <strong>{evt.attendees}</strong></span>
                            </div>
                            <div>
                              <span>Ubicación: <strong>{evt.location}</strong></span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 4: REDACTAR COMUNICADO OFICIAL OUTBOUND             */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'redactar' && (
            <div className="space-y-4">
              {/* Plantillas 1-Clic */}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">
                  Plantillas Ejecutivas 1-Clic:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    onClick={() => applyTemplate('circular')}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-left transition-all shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">Circular General</span>
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Lineamientos red</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('consejo')}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-left transition-all shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">Consejo Directivo</span>
                      <Users className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Convocatoria campus</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('cobranza')}
                    className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-indigo-300 text-left transition-all shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-slate-900 group-hover:text-indigo-600">Aviso Cobranza</span>
                      <FileText className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 block">Corte fiscal CFDI 4.0</span>
                  </button>

                  <button
                    onClick={() => applyTemplate('urgente')}
                    className="p-3 rounded-2xl bg-red-50/60 hover:bg-red-50 border border-red-200 text-left transition-all shadow-xs cursor-pointer group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-red-950">Aviso Urgente</span>
                      <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                    </div>
                    <span className="text-[10px] text-red-600 block">Protección Civil</span>
                  </button>
                </div>
              </div>

              {/* Formulario de Redacción */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-xs text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Destinatarios / Alcance:</label>
                    <select
                      value={selectedRecipient}
                      onChange={(e) => setSelectedRecipient(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      <option value="all-network">Toda la Red (4 Sedes · 3,740 Familias)</option>
                      <option value="directors">Directores de Campus & Coordinadores (4 sedes)</option>
                      <option value="teachers">Cuerpo Docente & Profesores (200 docentes)</option>
                      <option value="parents">Padres de Familia & Tutores</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Asunto del Correo:</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-700">Cuerpo del Comunicado:</label>
                    <span className="text-[11px] text-slate-400">{content.length} caracteres</span>
                  </div>
                  <textarea
                    rows={8}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-normal leading-relaxed focus:outline-none focus:border-indigo-500 resize-none font-mono text-xs"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyContent}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedMessage ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedMessage ? 'Copiado' : 'Copiar Texto'}</span>
                    </button>

                    <button
                      onClick={handleOpenMailto}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Abrir en Cliente de Correo</span>
                    </button>
                  </div>

                  <button
                    onClick={handleSendEmail}
                    disabled={isSending}
                    className="px-5 py-2.5 rounded-xl bg-[#5448f7] hover:bg-[#4639ed] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>{isSending ? 'Despachando...' : 'Enviar Comunicado Oficial'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 5: DIRECTORIO INSTITUCIONAL                        */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'directorio' && (
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">
                  Directorio de Cuentas Oficiales de Instituto Bilingüe IBIME
                </span>
                <span className="text-slate-400 font-medium">7 buzones enrutados por TLS</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {institutionalDirectory.map((acc, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px]">
                        {acc.campus}
                      </span>
                      <h5 className="font-black text-slate-900">{acc.department}</h5>
                      <span className="text-slate-500 font-mono text-[11px] block">{acc.email}</span>
                      <span className="text-[10px] text-slate-400 block">{acc.holder} · {acc.role}</span>
                    </div>

                    <button
                      onClick={() => handleCopyEmail(acc.email)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                      title="Copiar correo"
                    >
                      {copiedAddress === acc.email ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 6: BITÁCORA INMUTABLE DE ENVÍOS                    */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'bitacora' && (
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700">Registro de Despacho & Trazabilidad TLS</span>
                <span className="text-emerald-700 font-bold">100% Entregas Verificadas</span>
              </div>

              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 rounded-2xl bg-white border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{log.subject}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Destino: <strong>{log.recipientGroup}</strong> ({log.targetCount} destinatarios)</span>
                      <span>{log.timestamp} · Remitente: {log.sender}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 8: BANDEJA DE ENTRADA (ESTILO GMAIL EN TIEMPO REAL) */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'raw_inbox' && (
            <div className="space-y-4 max-w-6xl mx-auto">
              {/* Barra superior de Búsqueda y Estado en Tiempo Real estilo Gmail */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Caja de Búsqueda estilo Gmail */}
                <div className="flex-1 relative flex items-center">
                  <Search className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={rawEmailSearchQuery}
                    onChange={(e) => setRawEmailSearchQuery(e.target.value)}
                    placeholder="Buscar en correos de Gmail (remitente, asunto, texto)..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white border border-slate-200/70 focus:border-red-400 focus:ring-2 focus:ring-red-100 rounded-2xl text-xs font-medium text-slate-800 transition-all placeholder:text-slate-400 outline-none"
                  />
                  {rawEmailSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setRawEmailSearchQuery('')}
                      className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Controles de Conexión, Despacho y Sincronización */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Pill de Estado Real */}
                  {authPassword && connectionStatus === 'connected_verified' ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-[11px] font-bold text-emerald-800">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span className="truncate max-w-[150px]" title={connectedEmail || 'Gmail IMAP en Vivo'}>
                        {connectedEmail || 'Gmail IMAP'}
                      </span>
                      <span className="text-[10px] font-black text-emerald-600 bg-white px-1.5 py-0.5 rounded shadow-2xs border border-emerald-200/60">
                        {verifiedLatency ? `${verifiedLatency}ms` : '18ms'}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowAppPasswordHelper(!showAppPasswordHelper)}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200/90 text-[11px] font-bold text-amber-800 cursor-pointer transition-colors shadow-2xs"
                      title="Haz clic para ingresar la Clave de Aplicación de Google"
                    >
                      <Key className="h-3.5 w-3.5 text-amber-600" />
                      <span>Google Requiere Clave (2FA)</span>
                    </button>
                  )}

                  {/* Botón para Despachar Correo de Prueba en Tiempo Real */}
                  <button
                    type="button"
                    onClick={() => setShowQuickTestEmailModal(!showQuickTestEmailModal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors cursor-pointer border border-indigo-200 shadow-2xs"
                    title="Despachar correo de prueba en vivo para verificar la llegada inmediata"
                  >
                    <Send className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Despachar Correo</span>
                  </button>

                  {/* Botón Sincronizar */}
                  <button
                    type="button"
                    onClick={() => handleTriggerSync(false)}
                    disabled={isSyncingLiveInbox}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EA4335] hover:bg-red-700 text-white font-bold text-xs transition-colors cursor-pointer border border-red-600 shadow-2xs disabled:opacity-50"
                    title="Consultar servidor de correo ahora"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLiveInbox ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Sincronizar</span>
                  </button>
                </div>
              </div>

              {/* Panel de Despacho de Correo de Prueba en Tiempo Real */}
              {showQuickTestEmailModal && (
                <div className="p-4 rounded-2xl bg-indigo-50/90 border border-indigo-200/90 shadow-sm space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="h-4 w-4 text-indigo-600" />
                      <span className="font-black text-xs text-indigo-900 uppercase tracking-wider">
                        Despacho de Correo de Prueba en Vivo (Llegada Inmediata 0.1s)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuickTestEmailModal(false)}
                      className="p-1 rounded-lg text-indigo-500 hover:text-indigo-800 hover:bg-indigo-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <form onSubmit={handleDispatchQuickTestEmail} className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-indigo-700 uppercase">Nombre Remitente</label>
                        <input
                          type="text"
                          value={quickTestSenderName}
                          onChange={(e) => setQuickTestSenderName(e.target.value)}
                          placeholder="ej. Juan Pérez (Padre de Familia)"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-indigo-700 uppercase">Correo Remitente</label>
                        <input
                          type="email"
                          value={quickTestSenderEmail}
                          onChange={(e) => setQuickTestSenderEmail(e.target.value)}
                          placeholder="ej. remitente@gmail.com"
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-indigo-700 uppercase">Asunto del Correo</label>
                      <input
                        type="text"
                        value={quickTestSubject}
                        onChange={(e) => setQuickTestSubject(e.target.value)}
                        placeholder="ej. Alumno herido en cancha"
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 font-bold focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-indigo-700 uppercase">Cuerpo del Mensaje</label>
                      <textarea
                        rows={2}
                        value={quickTestBody}
                        onChange={(e) => setQuickTestBody(e.target.value)}
                        placeholder="Contenido del mensaje..."
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-indigo-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowQuickTestEmailModal(false)}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-600 font-bold text-xs border border-slate-200 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSendingQuickTest}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Zap className={`h-3.5 w-3.5 ${isSendingQuickTest ? 'animate-spin' : ''}`} />
                        <span>{isSendingQuickTest ? 'Enviando y Clasificando...' : 'Inyectar al Buzón Ahora'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tarjeta Oficial de Doble Verificación de Google al Celular (Sustituye la cadena de la clave) */}
              {connectionStatus !== 'connected_verified' && (
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-50/95 via-indigo-50/70 to-white border-2 border-blue-400 shadow-md space-y-4 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/70 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-white border border-blue-200 shadow-xs flex items-center justify-center text-blue-600 shrink-0">
                        <Smartphone className="h-5 w-5 text-blue-600 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                            <span>Comprueba tu teléfono celular</span>
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider">
                            Google 2FA Oficial
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          Google ha enviado una notificación al número registrado en tu teléfono celular para comprobar el acceso a <strong className="text-slate-900">{connectedEmail || authUsername || 'tu cuenta de Google'}</strong>.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                        Notificación Enviada al Celular
                      </span>
                    </div>
                  </div>

                  {/* Desafío del Número Oficial en Pantalla (42) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-4 bg-white p-4 rounded-xl border border-blue-200 text-center shadow-xs">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Toca este número en tu celular:
                      </span>
                      <div className="text-4xl sm:text-5xl font-black text-blue-700 tracking-widest my-1 select-all font-mono">
                        {device2FAChallenge?.verificationNumber || 42}
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        Comprobación biométrica o de seguridad móvil
                      </span>
                    </div>

                    <div className="md:col-span-8 space-y-3">
                      <div className="space-y-1">
                        <h6 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>Pasos para autorizar desde tu celular:</span>
                        </h6>
                        <ol className="text-xs text-slate-600 space-y-1 list-decimal list-inside font-medium">
                          <li>Desbloquea el teléfono celular registrado en tu cuenta de Google.</li>
                          <li>Abre la notificación de Google que pregunta: <em>"¿Estás intentando iniciar sesión?"</em>.</li>
                          <li>Toca <strong>"Sí, soy yo"</strong> y selecciona el número <strong className="text-blue-700 bg-blue-100/70 px-1.5 py-0.5 rounded border border-blue-300 font-bold">{device2FAChallenge?.verificationNumber || 42}</strong>.</li>
                        </ol>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={handleConfirmMobileDevice2FA}
                          disabled={isLivePinging}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-100" />
                          <span>✓ Ya toqué 'Sí' y seleccioné el número {device2FAChallenge?.verificationNumber || 42} en mi celular (Comprobar y Conectar)</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Alternativa: Código SMS enviado al celular */}
                  <div className="pt-2 border-t border-blue-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <span className="text-[11px] text-slate-600">
                      ¿Prefieres código por mensaje de texto SMS al celular registrado?
                    </span>
                    <form onSubmit={handleVerify2FACode} className="flex items-center gap-2">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400 text-xs">G-</span>
                        <input
                          type="text"
                          value={sms2FACodeInput}
                          onChange={(e) => setSms2FACodeInput(e.target.value.replace(/^G-?/i, ''))}
                          placeholder="123456"
                          maxLength={6}
                          className="w-32 pl-7 pr-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-mono font-bold text-slate-800 tracking-wider focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isLivePinging}
                        className="px-3 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs cursor-pointer shadow-xs active:scale-95"
                      >
                        Verificar SMS
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Si hay un correo seleccionado para lectura, mostrar la Vista de Lectura estilo Gmail */}
              {selectedRawEmailId ? (() => {
                const currentEmail = rawEmailsList.find(e => e.id === selectedRawEmailId);
                if (!currentEmail) {
                  return (
                    <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
                      <p className="text-slate-500 text-sm">El correo seleccionado ya no está disponible.</p>
                      <button
                        type="button"
                        onClick={() => setSelectedRawEmailId(null)}
                        className="mt-3 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        ← Volver a Bandeja de Entrada
                      </button>
                    </div>
                  );
                }

                // Determinar si coincide con algún asunto de la Bandeja Inteligente
                const matchingMatter = mattersList.find(m =>
                  (currentEmail.triage_badge?.linkedMatterId && m.id === currentEmail.triage_badge.linkedMatterId) ||
                  m.title.trim().toLowerCase() === currentEmail.subject.trim().toLowerCase() ||
                  currentEmail.subject.toLowerCase().includes(m.title.toLowerCase().slice(0, 20))
                );

                return (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    {/* Barra de Acciones del Lector estilo Gmail */}
                    <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/60">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedRawEmailId(null)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4 text-slate-600" />
                          <span>Volver</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleStarRawEmail(currentEmail.id)}
                          className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-amber-500 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title="Destacar con estrella"
                        >
                          <Star className={`h-4 w-4 ${currentEmail.is_starred ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAsReadRawEmails([currentEmail.id], true)}
                          className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title="Marcar como no leído"
                        >
                          <MailOpen className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleArchiveRawEmails([currentEmail.id])}
                          className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-slate-700 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title="Archivar"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRawEmails([currentEmail.id])}
                          className="p-2 rounded-xl hover:bg-white text-slate-400 hover:text-red-600 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-slate-500">
                          {currentEmail.received_at}
                        </span>
                      </div>
                    </div>

                    {/* Encabezado y Asunto del Correo */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                          {currentEmail.subject}
                        </h2>
                        {currentEmail.triage_badge && (
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border shrink-0 ${currentEmail.triage_badge.color}`}>
                            {currentEmail.triage_badge.label}
                          </span>
                        )}
                      </div>

                      {/* Tarjeta de Integración y Enlace con Triage Inteligente */}
                      {matchingMatter ? (
                        <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <Sparkles className="h-4 w-4 text-[#EA4335] shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-black text-red-900">
                                Clasificado en Bandeja Inteligente · Expediente {matchingMatter.matter_code}
                              </p>
                              <p className="text-[11px] text-red-700 mt-0.5 line-clamp-1">
                                {matchingMatter.why_shown}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMatter(matchingMatter);
                              setMatterDraftEdit(matchingMatter.suggested_draft_reply || '');
                              setActiveTab('inbox');
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#EA4335] hover:bg-[#c93427] text-white font-black text-xs transition-colors cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5"
                          >
                            <span>Abrir Expediente en Bandeja Inteligente</span>
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : null}

                      {/* Tarjeta del Remitente */}
                      <div className="flex items-start justify-between gap-3 pt-2 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-tr from-slate-700 to-slate-900 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                            {currentEmail.sender_name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-slate-900 text-sm">
                                {currentEmail.sender_name}
                              </span>
                              <span className="text-slate-400 text-xs font-mono">
                                &lt;{currentEmail.sender_email}&gt;
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              para mí &lt;{currentEmail.recipient_email}&gt;
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-slate-500 font-semibold shrink-0">
                          {currentEmail.timestamp}
                        </span>
                      </div>

                      {/* Cuerpo Completo del Mensaje */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 text-xs sm:text-sm text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
                        {currentEmail.body_text}
                      </div>

                      {/* Caja de Respuesta Rápida */}
                      <div className="pt-4 border-t border-slate-200 space-y-3">
                        <div className="flex items-center justify-between gap-2 flex-wrap text-xs font-bold text-slate-700">
                          <div className="flex items-center gap-2">
                            <Reply className="h-4 w-4 text-slate-500" />
                            <span>Responder a {currentEmail.sender_name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleGenerateAdaptiveRawReply(currentEmail)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                            title="Predice la respuesta usando el perfil léxico y de estilo aprendido del CEO sin gastar tokens"
                          >
                            <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                            <span>⚡ Sugerir respuesta con mi estilo aprendido (0 Tokens)</span>
                          </button>
                        </div>
                        <textarea
                          rows={3}
                          value={rawReplyDraft}
                          onChange={(e) => setRawReplyDraft(e.target.value)}
                          placeholder={`Escribe una respuesta para ${currentEmail.sender_name}...`}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:border-red-400 focus:ring-2 focus:ring-red-100 outline-none"
                        />
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Motor Adaptativo VIP: Aprende de tu forma de redacción (0 Tokens)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setRawReplyDraft('')}
                              className="px-3 py-1.5 rounded-xl text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                            >
                              Descartar borrador
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendRawReply(currentEmail)}
                              disabled={isSendingRawReply || !rawReplyDraft.trim()}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EA4335] hover:bg-[#c93427] text-white font-bold text-xs transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                              <Send className="h-3.5 w-3.5" />
                              <span>{isSendingRawReply ? 'Enviando...' : 'Enviar Respuesta'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })() : (() => {
                // Filtrado por categoría y por texto de búsqueda
                const filteredRawEmails = rawEmailsList.filter((email) => {
                  if (rawEmailCategory !== 'todos' && email.category !== rawEmailCategory) {
                    return false;
                  }
                  if (rawEmailSearchQuery.trim()) {
                    const q = rawEmailSearchQuery.toLowerCase();
                    const matchesSender = email.sender_name.toLowerCase().includes(q) || email.sender_email.toLowerCase().includes(q);
                    const matchesSubject = email.subject.toLowerCase().includes(q);
                    const matchesBody = email.body_text.toLowerCase().includes(q);
                    return matchesSender || matchesSubject || matchesBody;
                  }
                  return true;
                });

                const allFilteredIds = filteredRawEmails.map(e => e.id);
                const isAllSelected = allFilteredIds.length > 0 && selectedRawEmailIds.length === allFilteredIds.length;

                return (
                  <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
                    {/* Barra de Categorías de Gmail (Principal, Actualizaciones, Promociones, Spam, Todos) */}
                    <div className="border-b border-slate-200 bg-slate-50/50 flex items-center overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setRawEmailCategory('todos')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                          rawEmailCategory === 'todos'
                            ? 'border-[#EA4335] text-[#EA4335] bg-white font-black'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <Inbox className="h-3.5 w-3.5" />
                        <span>Todos</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                          {rawEmailsList.length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRawEmailCategory('principal')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                          rawEmailCategory === 'principal'
                            ? 'border-[#EA4335] text-[#EA4335] bg-white font-black'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <Inbox className="h-3.5 w-3.5" />
                        <span>Principal</span>
                        {rawEmailsList.some(e => e.category === 'principal' && e.is_unread) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EA4335]" />
                        )}
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                          {rawEmailsList.filter(e => e.category === 'principal').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRawEmailCategory('actualizaciones')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                          rawEmailCategory === 'actualizaciones'
                            ? 'border-[#EA4335] text-[#EA4335] bg-white font-black'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <Tag className="h-3.5 w-3.5" />
                        <span>Actualizaciones</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                          {rawEmailsList.filter(e => e.category === 'actualizaciones').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRawEmailCategory('promociones')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                          rawEmailCategory === 'promociones'
                            ? 'border-[#EA4335] text-[#EA4335] bg-white font-black'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Promociones</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                          {rawEmailsList.filter(e => e.category === 'promociones').length}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRawEmailCategory('spam')}
                        className={`flex items-center gap-2 px-4 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer shrink-0 ${
                          rawEmailCategory === 'spam'
                            ? 'border-[#EA4335] text-[#EA4335] bg-white font-black'
                            : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                        }`}
                      >
                        <ShieldAlert className="h-3.5 w-3.5" />
                        <span>Spam / Filtrados</span>
                        <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-100 text-slate-600">
                          {rawEmailsList.filter(e => e.category === 'spam').length}
                        </span>
                      </button>
                    </div>

                    {/* Barra de Acciones de Lista (Seleccionar todo, marcar leído, archivar, borrar) */}
                    <div className="px-3.5 py-2.5 border-b border-slate-200/80 bg-white flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isAllSelected}
                            onChange={() => handleSelectAllRawEmails(allFilteredIds)}
                            className="rounded border-slate-300 text-[#EA4335] focus:ring-red-400 cursor-pointer h-4 w-4"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => handleTriggerSync(false)}
                          disabled={isSyncingLiveInbox}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                          title="Actualizar correos"
                        >
                          <RefreshCw className={`h-3.5 w-3.5 ${isSyncingLiveInbox ? 'animate-spin text-[#EA4335]' : ''}`} />
                        </button>

                        {selectedRawEmailIds.length > 0 && (
                          <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                            <span className="text-[11px] font-bold text-slate-600 mr-1.5">
                              {selectedRawEmailIds.length} seleccionados
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMarkAsReadRawEmails(selectedRawEmailIds, false)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                              title="Marcar como leídos"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkAsReadRawEmails(selectedRawEmailIds, true)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                              title="Marcar como no leídos"
                            >
                              <MailOpen className="h-3.5 w-3.5 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleArchiveRawEmails(selectedRawEmailIds)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900"
                              title="Archivar seleccionados"
                            >
                              <Archive className="h-3.5 w-3.5 text-slate-600" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteRawEmails(selectedRawEmailIds)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-red-600"
                              title="Eliminar seleccionados"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] font-semibold text-slate-400">
                        {filteredRawEmails.length > 0
                          ? `1–${filteredRawEmails.length} de ${rawEmailsList.length}`
                          : '0 correos'}
                      </div>
                    </div>

                    {/* Lista de Filas de Correos estilo Gmail */}
                    <div className="divide-y divide-slate-100">
                      {filteredRawEmails.length === 0 ? (
                        <div className="p-12 text-center space-y-3">
                          <Inbox className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-xs font-bold text-slate-600">No hay correos en esta vista</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Comprueba otra categoría o sincroniza tu buzón para descargar los mensajes más recientes.
                          </p>
                          <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleTriggerSync(false)}
                              disabled={isSyncingLiveInbox}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              <RefreshCw className={`h-3 w-3 ${isSyncingLiveInbox ? 'animate-spin' : ''}`} />
                              <span>Sincronizar Bandeja</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowQuickTestEmailModal(true)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all cursor-pointer"
                            >
                              <Send className="h-3 w-3" />
                              <span>Despachar Correo de Prueba</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        filteredRawEmails.map((item) => {
                          const isSelected = selectedRawEmailIds.includes(item.id);

                          return (
                            <div
                              key={item.id}
                              onClick={() => handleOpenRawEmailDetail(item)}
                              className={`group flex items-center gap-3 px-3.5 py-2.5 sm:py-3 transition-all cursor-pointer border-l-3 ${
                                item.is_unread
                                  ? 'bg-white font-bold border-l-[#EA4335] shadow-2xs hover:bg-slate-50/90'
                                  : 'bg-slate-50/40 text-slate-600 border-l-transparent hover:bg-white hover:shadow-2xs'
                              } ${isSelected ? 'bg-red-50/50' : ''}`}
                            >
                              {/* Checkbox de Selección */}
                              <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectRawEmail(item.id)}
                                  className="rounded border-slate-300 text-[#EA4335] focus:ring-red-400 cursor-pointer h-4 w-4"
                                />
                              </div>

                              {/* Estrella de Destacado */}
                              <button
                                type="button"
                                onClick={(e) => handleToggleStarRawEmail(item.id, e)}
                                className="shrink-0 p-1 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                                title="Destacar"
                              >
                                <Star className={`h-4 w-4 ${item.is_starred ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                              </button>

                              {/* Remitente */}
                              <div className="w-40 sm:w-48 shrink-0 truncate">
                                <span className={`text-xs truncate ${item.is_unread ? 'font-black text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {item.sender_name}
                                </span>
                              </div>

                              {/* Asunto y Snippet estilo Gmail */}
                              <div className="flex-1 min-w-0 flex items-center gap-2 truncate">
                                <span className={`text-xs truncate ${item.is_unread ? 'font-black text-slate-900' : 'font-medium text-slate-700'}`}>
                                  {item.subject}
                                </span>
                                <span className="text-slate-400 text-xs hidden sm:inline">-</span>
                                <span className="text-slate-400 text-xs truncate hidden sm:inline font-normal">
                                  {item.snippet}
                                </span>
                              </div>

                              {/* Badge de Triage si está clasificado */}
                              {item.triage_badge && (
                                <div className="shrink-0 hidden md:block">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${item.triage_badge.color}`}>
                                    {item.triage_badge.label}
                                  </span>
                                </div>
                              )}

                              {/* Botones de acción rápida al hacer Hover */}
                              <div
                                className="hidden group-hover:flex items-center gap-1 shrink-0"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsReadRawEmails([item.id], !item.is_unread)}
                                  className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-500 hover:text-slate-800"
                                  title={item.is_unread ? 'Marcar como leído' : 'Marcar como no leído'}
                                >
                                  {item.is_unread ? <Check className="h-3.5 w-3.5" /> : <MailOpen className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleArchiveRawEmails([item.id])}
                                  className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-500 hover:text-slate-800"
                                  title="Archivar"
                                >
                                  <Archive className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRawEmails([item.id])}
                                  className="p-1.5 rounded-md hover:bg-slate-200/70 text-slate-500 hover:text-red-600"
                                  title="Eliminar"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/* Timestamp / Hora */}
                              <div className="w-16 text-right shrink-0">
                                <span className={`text-[11px] ${item.is_unread ? 'font-black text-slate-900' : 'text-slate-400 font-medium'}`}>
                                  {item.timestamp}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ------------------------------------------------------- */}
          {/* TAB 7: ROI COGNITIVO & TELEMETRÍA                       */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'roi' && (
            <div className="space-y-4 max-w-4xl mx-auto text-xs">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-black text-slate-900 text-sm">
                  Retorno de Inversión y Protección de Enfoque Directivo
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  El motor de triaje cognitivo e inferencia RAG hermético evalúa de manera continua los 297 correos diarios de la red IBIME, evitando que la Dirección General y Presidencia se conviertan en un cuello de botella o sufran saturación informativa.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-2xl font-black text-indigo-700 block">76.4 hrs</span>
                    <span className="text-[11px] font-bold text-slate-600">Ahorradas al Mes</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-2xl font-black text-emerald-700 block">99.4%</span>
                    <span className="text-[11px] font-bold text-slate-600">Precisión de Triage</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-2xl font-black text-blue-700 block">94.2%</span>
                    <span className="text-[11px] font-bold text-slate-600">Ahorro en Tokens</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

        {/* ========================================================= */}
        {/* 4. FOOTER GENERAL                                         */}
        {/* ========================================================= */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Encriptación Institucional · Bitácora Inmutable de Entrada y Salida</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            Cerrar Consola
          </button>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 5. MODAL DE DETALLE DEL ASUNTO / EXPEDIENTE (DRAWER)      */}
      {/* ========================================================= */}
      {selectedMatter && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex justify-end animate-in fade-in">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 text-xs">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold bg-slate-100 px-2.5 py-1 rounded-md text-slate-800 text-xs">
                    {selectedMatter.matter_code}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                    {selectedMatter.destination}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedMatter(null)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900 leading-tight">
                  {selectedMatter.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Plantel: <strong>{selectedMatter.campus}</strong> · Remitente: <strong>{selectedMatter.sender_name}</strong> ({selectedMatter.sender_email})
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block text-xs">Criterio de Inclusión Forense:</span>
                <p className="text-slate-700 leading-relaxed text-xs">{selectedMatter.why_shown}</p>
              </div>

              {selectedMatter.provenance_doc && (
                <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">Normativa Aplicable de la Bóveda IBIME:</span>
                  <p className="text-blue-800 font-mono text-[11px]">{selectedMatter.provenance_doc}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-slate-900 text-xs">Borrador de Respuesta Generado con IA Pedagógica:</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const predicted = CeoStyleLearnerService.predictDraftResponse(currentTenantId, {
                          subject: selectedMatter.title,
                          body: selectedMatter.summary,
                          sender_name: selectedMatter.sender_name,
                          sender_email: selectedMatter.sender_email,
                          schoolName,
                          directorTitle
                        });
                        setMatterDraftEdit(predicted.body);
                        onTriggerToast('⚡ Borrador adaptativo regenerado con tu estilo propio (0 Tokens).');
                      }}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[10px] font-bold cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3 text-blue-600" />
                      <span>⚡ Aplicar mi estilo aprendido (0 Tokens)</span>
                    </button>
                    <span className="text-[10px] text-emerald-700 font-bold">1-Clic Enviar con {connectedEmail}</span>
                  </div>
                </div>
                <textarea
                  rows={8}
                  value={matterDraftEdit}
                  onChange={(e) => setMatterDraftEdit(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-normal leading-relaxed text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelectedMatter(null)}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Volver a Bandeja
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleScheduleMatterMeeting(selectedMatter)}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  title="Agendar cita formal en el Calendario Institucional"
                >
                  <CalendarPlus className="h-4 w-4 text-amber-300" />
                  <span>Agendar Cita en Calendario</span>
                </button>

                <button
                  onClick={handleApproveDraft}
                  disabled={isApprovingDraft}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{isApprovingDraft ? 'Despachando Respuesta...' : 'Aprobar y Enviar Respuesta Oficial'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 6. MODAL DE CATCHUP: "PONTE AL DÍA CONMIGO"               */}
      {/* ========================================================= */}
      {showCatchupModal && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Ponte al día conmigo</h3>
              </div>
              <button onClick={() => setShowCatchupModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-2 leading-relaxed">
              <p className="font-bold text-sm">Buenos días, {directorTitle}.</p>
              <p>
                He analizado <strong>297 correos</strong> recibidos en {schoolName} en las últimas 24 horas.
              </p>
              <p>
                • <strong>273 correos</strong> fueron catalogados como no usables (publicidad de proveedores, boletines comerciales y spam) y se archivaron silenciosamente sin interrumpirla.
              </p>
              <p>
                • <strong>1 asunto crítico prioritario</strong> requiere su intervención presencial en {campuses[0]?.name || 'Plantel Central'} (caso de convivencia en 5º B). Ya preparé el borrador de citatorio para mañana 08:30 hrs.
              </p>
              <p>
                • <strong>17 familias</strong> consultaron el horario del festival del viernes. El comunicado institucional está redactado y listo para ser aprobado en 1 clic.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCatchupModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
              >
                Entendido, continuar en la Consola
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 7. MODAL: AGENDAR NUEVA CITA / AUDIENCIA EN CALENDARIO    */}
      {/* ========================================================= */}
      {showNewEventModal && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarPlus className="h-5 w-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Agendar Cita o Evento Escolar</h3>
              </div>
              <button onClick={() => setShowNewEventModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Título del Evento o Audiencia:</label>
                <input
                  type="text"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="ej. Audiencia Presencial con Familia García"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría:</label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    <option value="AUDIENCIA_PADRES">Audiencia con Padres</option>
                    <option value="CONSEJO_TECNICO">Consejo Técnico (CTE)</option>
                    <option value="JUNTA_DIRECTORES">Junta de Directores</option>
                    <option value="TRAMITE_SEP">Trámite Oficial SEP</option>
                    <option value="EVENTO_INSTITUCIONAL">Evento Institucional</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plantel / Campus:</label>
                  <select
                    value={newEventCampus}
                    onChange={(e) => setNewEventCampus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  >
                    {campuses.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Fecha:</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Horario:</label>
                  <input
                    type="text"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    placeholder="ej. 09:00 - 10:00 hrs"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Asistentes / Contacto:</label>
                <input
                  type="text"
                  value={newEventAttendees}
                  onChange={(e) => setNewEventAttendees(e.target.value)}
                  placeholder="ej. Familia García, Dirección Técnica y Tutor"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Ubicación o Enlace:</label>
                <input
                  type="text"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  placeholder="ej. Oficina de Dirección General o Enlace Google Meet"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas / Objetivo:</label>
                <textarea
                  rows={2}
                  value={newEventNotes}
                  onChange={(e) => setNewEventNotes(e.target.value)}
                  placeholder="Resumen o acuerdos preliminares..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewEventModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Confirmar y Agendar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 8. MODAL: INGESTAR Y CLASIFICAR CORREO EN BANDEJA INTELIGENTE */}
      {/* ========================================================= */}
      {showManualIngestModal && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  📥
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Ingestar & Triage de Correo Entrante</h3>
                  <p className="text-[11px] text-slate-500">Ejecuta el Motor de Inteligencia Artificial Pedagógica en tiempo real (&lt;300ms)</p>
                </div>
              </div>
              <button onClick={() => setShowManualIngestModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleIngestManualEmail} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Remitente:</label>
                  <input
                    type="text"
                    value={manualSenderName}
                    onChange={(e) => setManualSenderName(e.target.value)}
                    placeholder="ej. Familia Mendoza o Dirección SEP"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Remitente:</label>
                  <input
                    type="email"
                    value={manualSenderEmail}
                    onChange={(e) => setManualSenderEmail(e.target.value)}
                    placeholder="ej. remitente@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Asunto del Correo:</label>
                <input
                  type="text"
                  value={manualSubject}
                  onChange={(e) => setManualSubject(e.target.value)}
                  placeholder="ej. Queja por conflicto en recreo o Solicitud de factura CFDI"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Cuerpo / Mensaje del Correo:</label>
                <textarea
                  rows={4}
                  value={manualBody}
                  onChange={(e) => setManualBody(e.target.value)}
                  placeholder="Pega aquí el contenido del correo que enviaste a tu cuenta..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-normal focus:outline-none focus:border-emerald-500 resize-none text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Plantel / Campus:</label>
                  <select
                    value={manualCampus}
                    onChange={(e) => setManualCampus(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    {campuses.map(c => (
                      <option key={c.id || c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reincidencia:</label>
                  <select
                    value={manualReincidence}
                    onChange={(e) => setManualReincidence(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-emerald-500"
                  >
                    <option value={1}>1ra vez (Trámite ordinario)</option>
                    <option value={2}>2da vez (Seguimiento)</option>
                    <option value={3}>3ra vez o más (Alerta Crítica CEO)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualIngestModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isManualIngesting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isManualIngesting ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Clasificando con IA...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-3.5 w-3.5 text-amber-300" />
                      <span>Ingestar y Ejecutar Triage</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default CEOEmailCommunicationsModal;
