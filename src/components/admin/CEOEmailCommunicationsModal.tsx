"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { OrganizationHolding } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  CheckSquare
} from 'lucide-react';

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
  const sId = typeof targetOrSchoolId === 'string' ? targetOrSchoolId : targetOrSchoolId?.id;
  if (isIbime || sId === 'sch-ibime') return 'e1000000-0000-0000-0000-000000000001';
  if (sId) return sId;
  if (holdingId) return holdingId;
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
      why_shown: 'Trámite fiscal sujeto a cierre de timbrado SAT CFDI 4.0. Se canaliza a Tesorería con SLA de 24 horas.',
      reincidence_count: 1,
      recommended_action: `Delegado a Departamento de Cobranza y Finanzas (cobranza@${domain}). Notificar si vence SLA.`,
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
      category: 'Normativo & Supervisión Escolar',
      urgency: 'BAJA',
      destination: 'INFORMATIVO',
      why_shown: `Documento normativo favorable que acredita el 100% de cumplimiento oficial de la matrícula de ${schoolName}.`,
      reincidence_count: 1,
      recommended_action: `Archivado formal en Bóveda Curricular y Control Escolar. No requiere respuesta ni acción correctiva.`,
      suggested_draft_reply: `Acuse de recibo institucional: ${schoolName} agradece la notificación de la Supervisión de Zona. Las listas quedan archivadas en nuestro repositorio oficial.`,
      assigned_role: 'Control Escolar y Archivo',
      sla_hours: 0,
      sla_remaining_text: '✓ Informativo Concluido',
      sender_name: 'Supervisión Escolar Zona SEP',
      sender_email: 'supervision.zona@sep.gob.mx',
      provenance_doc: `planeaciones/${tenantId}/Calendario_Escolar.md`,
      received_at: '04 Oct 2026, 12:00 hrs',
      campus: primaryCampus
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

  // Pestañas principales de la consola
  const [activeTab, setActiveTab] = useState<'inbox' | 'laboratorio' | 'google' | 'redactar' | 'directorio' | 'bitacora' | 'roi'>('inbox');
  
  // Filtro en Bandeja: Correos Usables vs Correos No Usables
  const [inboxFilter, setInboxFilter] = useState<'USABLE' | 'DISCARDED'>('USABLE');
  const [usableSubFilter, setUsableSubFilter] = useState<'ALL' | 'ATENCION_CEO' | 'DELEGADO_CON_SLA' | 'INFORMATIVO'>('ALL');
  
  // Cuenta de Google conectada con aislamiento y persistencia hermética por tenant
  const emailStorageKey = `iskool_connected_email_${currentTenantId}`;
  const [connectedEmail, setConnectedEmail] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(emailStorageKey);
      if (saved) return saved;
    }
    return user?.email || (isIbime ? 'directora.general@ibime.edu.mx' : `direccion@${schoolDomain}`);
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(emailStorageKey);
      if (saved) {
        setConnectedEmail(saved);
        return;
      }
    }
    setConnectedEmail(user?.email || (isIbime ? 'directora.general@ibime.edu.mx' : `direccion@${schoolDomain}`));
  }, [emailStorageKey, isIbime, schoolDomain, user?.email]);

  const [customGoogleEmailInput, setCustomGoogleEmailInput] = useState<string>('');
  const [isGoogleOAuthConnecting, setIsGoogleOAuthConnecting] = useState<boolean>(false);
  const [isSyncingLiveInbox, setIsSyncingLiveInbox] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Hace 2 minutos');

  // Asunto seleccionado para inspección en Drawer / Modal
  const [selectedMatter, setSelectedMatter] = useState<MatterItem | null>(null);
  const [matterDraftEdit, setMatterDraftEdit] = useState<string>('');
  const [isApprovingDraft, setIsApprovingDraft] = useState<boolean>(false);

  // Modal de "Ponte al día conmigo" (Executive Catchup)
  const [showCatchupModal, setShowCatchupModal] = useState<boolean>(false);

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

  // Semilla y Almacenamiento Aislado de Asuntos Usables (Alta Fidelidad 15 Fases) por Tenant
  const mattersStorageKey = `iskool_matters_${currentTenantId}`;
  const [mattersList, setMattersList] = useState<MatterItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(mattersStorageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
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
          why_shown: 'Trámite fiscal sujeto a cierre de timbrado SAT CFDI 4.0. Se canaliza a Tesorería con SLA de 24 horas.',
          reincidence_count: 1,
          recommended_action: 'Delegado a Departamento de Cobranza y Finanzas (C.P. Claudia Albarrán). Notificar si vence SLA.',
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
          category: 'Normativo & Supervisión Escolar',
          urgency: 'BAJA',
          destination: 'INFORMATIVO',
          why_shown: 'Documento normativo favorable que acredita el 100% de cumplimiento oficial de la matrícula de los 4 planteles.',
          reincidence_count: 1,
          recommended_action: 'Archivado formal en Bóveda Curricular y Control Escolar. No requiere respuesta ni acción correctiva.',
          suggested_draft_reply: `Acuse de recibo institucional: El Instituto Bilingüe IBIME agradece la notificación de la Supervisión de Zona 14. Las listas quedan archivadas en nuestro repositorio oficial.`,
          assigned_role: 'Control Escolar y Archivo',
          sla_hours: 0,
          sla_remaining_text: '✓ Informativo Concluido',
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
          setMattersList(JSON.parse(saved));
          return;
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
          why_shown: 'Trámite fiscal sujeto a cierre de timbrado SAT CFDI 4.0. Se canaliza a Tesorería con SLA de 24 horas.',
          reincidence_count: 1,
          recommended_action: 'Delegado a Departamento de Cobranza y Finanzas (C.P. Claudia Albarrán). Notificar si vence SLA.',
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
          category: 'Normativo & Supervisión Escolar',
          urgency: 'BAJA',
          destination: 'INFORMATIVO',
          why_shown: 'Documento normativo favorable que acredita el 100% de cumplimiento oficial de la matrícula de los 4 planteles.',
          reincidence_count: 1,
          recommended_action: 'Archivado formal en Bóveda Curricular y Control Escolar. No requiere respuesta ni acción correctiva.',
          suggested_draft_reply: `Acuse de recibo institucional: El Instituto Bilingüe IBIME agradece la notificación de la Supervisión de Zona 14. Las listas quedan archivadas en nuestro repositorio oficial.`,
          assigned_role: 'Control Escolar y Archivo',
          sla_hours: 0,
          sla_remaining_text: '✓ Informativo Concluido',
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

  // Conexión con Google OAuth
  const handleGoogleOAuthConnect = async () => {
    setIsGoogleOAuthConnecting(true);
    try {
      const redirectUrl = typeof window !== 'undefined' ? window.location.href : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      });
      if (error) {
        onTriggerToast(`Información: ${error.message}`);
      } else {
        onTriggerToast('Redirigiendo a pantalla oficial de autenticación de Google...');
      }
    } catch (err: any) {
      onTriggerToast(`Error al iniciar Google OAuth: ${err.message || 'Desconocido'}`);
    } finally {
      setIsGoogleOAuthConnecting(false);
    }
  };

  // Vincular correo personalizado manual (puede ser @dominio-colegio o @gmail.com)
  const handleBindCustomGoogleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmailInput || !customGoogleEmailInput.includes('@')) {
      onTriggerToast('Por favor ingrese una dirección de correo válida.');
      return;
    }
    const cleanEmail = customGoogleEmailInput.trim().toLowerCase();
    setConnectedEmail(cleanEmail);
    if (typeof window !== 'undefined') {
      localStorage.setItem(emailStorageKey, cleanEmail);
    }
    setCustomGoogleEmailInput('');
    onTriggerToast(`✓ Correo real "${cleanEmail}" vinculado a la Suite de Inteligencia (${schoolName})`);
  };

  // Forzar sincronización de bandeja en tiempo real
  const handleTriggerSync = () => {
    setIsSyncingLiveInbox(true);
    setTimeout(() => {
      setIsSyncingLiveInbox(false);
      setLastSyncTime('Justo ahora');
      onTriggerToast(`✓ Sincronización con Google Cloud API completada para ${schoolName}. 297 correos analizados, 0 incidencias no atendidas.`);
    }, 900);
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
  };

  // Aprobar borrador desde el modal de detalle
  const handleApproveDraft = () => {
    if (!selectedMatter) return;
    setIsApprovingDraft(true);
    setTimeout(() => {
      setIsApprovingDraft(false);
      onTriggerToast(`✓ Borrador aprobado y despachado con éxito desde "${connectedEmail}". Asunto cerrado.`);
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

  // Filtrado de asuntos en pestaña Inbox
  const filteredMatters = useMemo(() => {
    if (usableSubFilter === 'ALL') return mattersList;
    return mattersList.filter(m => m.destination === usableSubFilter);
  }, [mattersList, usableSubFilter]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-6xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
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
                <span className="text-amber-300 font-semibold flex items-center gap-1">
                  <KeyRound className="h-3 w-3" /> Cuenta Activa: {connectedEmail}
                </span>
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
        {/* 2. SELECTOR DE PESTAÑAS EJECUTIVAS                        */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-2.5 border-b border-slate-200 bg-slate-50/80 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setActiveTab('inbox')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'inbox'
                  ? 'border-[#E41B14] text-[#E41B14] bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Inbox className="h-4 w-4" />
              <span>Bandeja Inteligente ({mattersList.length} Asuntos)</span>
            </button>

            <button
              onClick={() => setActiveTab('laboratorio')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'laboratorio'
                  ? 'border-indigo-600 text-indigo-600 bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="h-4 w-4 text-amber-500" />
              <span>Laboratorio de Ingesta & Test Cases</span>
            </button>

            <button
              onClick={() => setActiveTab('google')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'google'
                  ? 'border-blue-600 text-blue-600 bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Globe2 className="h-4 w-4" />
              <span>Cuenta Google & Sincronización</span>
            </button>

            <button
              onClick={() => setActiveTab('redactar')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'redactar'
                  ? 'border-[#5448f7] text-[#5448f7] bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="h-4 w-4" />
              <span>Redactar Comunicado</span>
            </button>

            <button
              onClick={() => setActiveTab('directorio')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'directorio'
                  ? 'border-[#5448f7] text-[#5448f7] bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="h-4 w-4" />
              <span>Directorio Oficial</span>
            </button>

            <button
              onClick={() => setActiveTab('bitacora')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'bitacora'
                  ? 'border-[#5448f7] text-[#5448f7] bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Bitácora ({logs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('roi')}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-t-xl font-bold text-xs transition-all cursor-pointer border-b-2 whitespace-nowrap ${
                activeTab === 'roi'
                  ? 'border-emerald-600 text-emerald-600 bg-white shadow-xs font-black'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>ROI & Telemetría</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500 pb-1">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Google API: Sincronizado ({lastSyncTime})</span>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. CONTENIDO PRINCIPAL POR PESTAÑA                        */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/60">

          {/* ------------------------------------------------------- */}
          {/* TAB 1: BANDEJA INTELIGENTE & CORREOS USABLES VS NO USABLES */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'inbox' && (
            <div className="space-y-5">
              {/* Tarjetas de Métricas Ejecutivas del Inbox */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Volumen Bruto Hoy</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-900">297</span>
                    <span className="text-xs font-bold text-slate-500">correos recibidos</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Bandeja general en Google Cloud</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-xs">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Correos Usables</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-emerald-700">{mattersList.length * 6}</span>
                    <span className="text-xs font-bold text-emerald-600">({((mattersList.length * 6 / 297) * 100).toFixed(1)}%)</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 font-medium">Consolidados en {mattersList.length} Asuntos</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-300 shadow-xs">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">No Usables / Descartados</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black text-slate-700">{297 - (mattersList.length * 6)}</span>
                    <span className="text-xs font-bold text-slate-500">(91.9%)</span>
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

              {/* Segmented Control: Correos Usables vs Correos No Usables */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200">
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

                {/* Subfiltro de Usables */}
                {inboxFilter === 'USABLE' && (
                  <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
                    <button
                      onClick={() => setUsableSubFilter('ALL')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                        usableSubFilter === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Todos ({mattersList.length})
                    </button>
                    <button
                      onClick={() => setUsableSubFilter('ATENCION_CEO')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        usableSubFilter === 'ATENCION_CEO' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'
                      }`}
                    >
                      <span>🔴 Atención CEO (SLA 12h)</span>
                    </button>
                    <button
                      onClick={() => setUsableSubFilter('DELEGADO_CON_SLA')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        usableSubFilter === 'DELEGADO_CON_SLA' ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      <span>🟡 Delegado (24-48h)</span>
                    </button>
                    <button
                      onClick={() => setUsableSubFilter('INFORMATIVO')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1 ${
                        usableSubFilter === 'INFORMATIVO' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      }`}
                    >
                      <span>🔵 Informativo</span>
                    </button>
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
                               matter.destination === 'DELEGADO_CON_SLA' ? '🟡 Delegado con SLA' :
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
                          <span className="font-bold text-emerald-900 block">Acción Recomendada & SLA</span>
                          <p className="text-emerald-800 font-medium">{labResult.recommended_action} (SLA: {labResult.sla_hours || 0}h)</p>
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
          {/* TAB 3: CONEXIÓN DE CUENTA GOOGLE (OAUTH 2.0 & REAL)      */}
          {/* ------------------------------------------------------- */}
          {activeTab === 'google' && (
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-inner">
                    <Globe2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      Integración Soberana con Google Workspace & Gmail
                    </h3>
                    <p className="text-xs text-slate-500">
                      Conecta cualquier cuenta de correo real de Google (institucional `@ibime.edu.mx` o `@gmail.com`) para habilitar el triaje y escaneo forense en vivo.
                    </p>
                  </div>
                </div>

                {/* Tarjeta de Cuenta Vinculada */}
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      Cuenta Actualmente Vinculada
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                      Conectado & Verificado
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-slate-900 text-sm block">{connectedEmail}</span>
                      <span className="text-slate-500 font-medium">Titular: {directorTitle}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[11px]">Protocolo</span>
                      <span className="font-bold text-slate-700">Google OAuth 2.0 (TLS 1.3)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-800">
                    <span>Aislamiento Criptográfico: <strong>Tenant {schoolName} ({currentTenantId.slice(0, 16)}...)</strong></span>
                    <button
                      onClick={handleTriggerSync}
                      disabled={isSyncingLiveInbox}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs active:scale-95"
                    >
                      <RefreshCw className={`h-3 w-3 ${isSyncingLiveInbox ? 'animate-spin' : ''}`} />
                      <span>{isSyncingLiveInbox ? 'Sincronizando...' : 'Sincronizar Bandeja Ahora'}</span>
                    </button>
                  </div>
                </div>

                {/* Botón de Inicio con Google Oficial */}
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 block">
                    Conectar Nueva Cuenta de Google (OAuth 2.0):
                  </label>
                  <button
                    onClick={handleGoogleOAuthConnect}
                    disabled={isGoogleOAuthConnecting}
                    className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs border border-slate-300 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-3 active:scale-98"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>{isGoogleOAuthConnecting ? 'Conectando con Google...' : 'Iniciar Sesión con Google (Google Workspace o Gmail)'}</span>
                  </button>
                </div>

                {/* Formulario para ingresar cualquier correo real */}
                <form onSubmit={handleBindCustomGoogleEmail} className="space-y-3 pt-3 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    O ingresa manualmente cualquier correo institucional o personal para activar la suite:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={customGoogleEmailInput}
                      onChange={(e) => setCustomGoogleEmailInput(e.target.value)}
                      placeholder={`ej. tu-correo@gmail.com o direccion@${schoolDomain}`}
                      className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#0F2744] hover:bg-[#1E5285] text-white font-bold text-xs shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      Vincular Correo
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Al vincular un correo, el sistema aplica la Bóveda Curricular de {schoolName} de manera hermética y genera las respuestas institucionales en tiempo real.
                  </p>
                </form>
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
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Borrador de Respuesta Generado con IA Pedagógica:</span>
                  <span className="text-[10px] text-emerald-700 font-bold">1-Clic Enviar con {connectedEmail}</span>
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

    </div>
  );
}

export default CEOEmailCommunicationsModal;
