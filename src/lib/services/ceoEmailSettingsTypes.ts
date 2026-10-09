export interface VipEmailRule {
  id: string;
  email: string;
  contactName: string;
  organization: string;
  reason: string;
  enabled: boolean;
  createdAt: string;
}

export interface SectionDelegateConfig {
  id: string;
  sectionKey: string;
  sectionName: string;
  delegateName: string;
  delegateEmail: string;
  slaHours: number;
  autoNotify: boolean;
  keywords: string[];
}

export interface OfficialTemplateConfig {
  id: string;
  category: 'General' | 'Urgente' | 'Financiero' | 'Logística' | 'Institucional' | 'Académico';
  title: string;
  description: string;
  defaultSubject: string;
  defaultBody: string;
  isCustomDefault: boolean;
  lastModifiedAt?: string;
}

export interface CeoEmailSettings {
  tenantId: string;
  vipEmails: VipEmailRule[];
  delegates: SectionDelegateConfig[];
  templates: OfficialTemplateConfig[];
  updatedAt: string;
}

export function getDefaultVipRules(tenantId: string): VipEmailRule[] {
  return [
    {
      id: `vip-sep-${tenantId}`,
      email: 'supervision.zona@edomex.gob.mx',
      contactName: 'Mtra. Carmen Morales (Supervisora Escolar)',
      organization: 'Supervisión de Zona 14 SEP',
      reason: 'Asuntos regulatorios, inspecciones oficiales y requerimientos normativos SEP',
      enabled: true,
      createdAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: `vip-presidencia-${tenantId}`,
      email: 'presidente.patronato@ibime.edu.mx',
      contactName: 'Ing. Alejandro Garza',
      organization: 'Consejo Directivo y Patronato',
      reason: 'Gobernanza institucional, acuerdos de consejo y decisiones estratégicas',
      enabled: true,
      createdAt: '2026-10-01T08:00:00.000Z'
    },
    {
      id: `vip-juridico-${tenantId}`,
      email: 'juridico.escolar@despacholegal.com',
      contactName: 'Lic. Salvador Vega',
      organization: 'Dirección Jurídica Externa',
      reason: 'Consultas legales críticas, contratos de concesión y salvaguarda escolar',
      enabled: true,
      createdAt: '2026-10-01T08:00:00.000Z'
    }
  ];
}

export function getDefaultDelegates(tenantId: string): SectionDelegateConfig[] {
  const isIbime = tenantId.includes('ibime') || tenantId === 'e1000000-0000-0000-0000-000000000001';
  const domain = isIbime ? 'ibime.edu.mx' : 'colegio.edu.mx';

  return [
    {
      id: `del-cobranza-${tenantId}`,
      sectionKey: 'cobranza',
      sectionName: 'Departamento Administrativo / Cobranza',
      delegateName: 'C.P. Claudia Albarrán',
      delegateEmail: `finanzas@${domain}`,
      slaHours: 24,
      autoNotify: true,
      keywords: ['factura', 'cfdi', 'colegiatura', 'pago', 'recargo', 'adeudo', 'beca', 'cobranza', 'prórroga']
    },
    {
      id: `del-transporte-${tenantId}`,
      sectionKey: 'transporte',
      sectionName: 'Coordinación de Logística y Prefectura',
      delegateName: 'Prof. Mario Alberto Torres',
      delegateEmail: `transporte@${domain}`,
      slaHours: 24,
      autoNotify: true,
      keywords: ['transporte', 'ruta 4', 'ruta', 'camión', 'chofer', 'retraso', 'parada', 'demora', 'autobús']
    },
    {
      id: `del-control-escolar-${tenantId}`,
      sectionKey: 'control_escolar',
      sectionName: 'Secretaría / Control Escolar',
      delegateName: 'Lic. Rebeca Sánchez',
      delegateEmail: `control.escolar@${domain}`,
      slaHours: 48,
      autoNotify: true,
      keywords: ['boleta', 'kardex', 'constancia', 'calificaciones', 'certificado', 'examen', 'evaluación', 'revalidación']
    },
    {
      id: `del-medico-${tenantId}`,
      sectionKey: 'servicio_medico',
      sectionName: 'Servicio Médico y Salud Escolar',
      delegateName: 'Dra. Andrea Palacios',
      delegateEmail: `enfermeria@${domain}`,
      slaHours: 12,
      autoNotify: true,
      keywords: ['enfermería', 'médico', 'seguro médico', 'revisión clínica', 'alergia', 'medicamento']
    },
    {
      id: `del-convivencia-${tenantId}`,
      sectionKey: 'convivencia',
      sectionName: 'Coordinación Académica',
      delegateName: 'Mtra. Sofía Villalpando',
      delegateEmail: `psicopedagogia@${domain}`,
      slaHours: 24,
      autoNotify: true,
      keywords: ['tutoría', 'convivencia', 'psicopedagogía', 'orientación', 'conducta', 'receso', 'tarea', 'examen']
    },
    {
      id: `del-rh-${tenantId}`,
      sectionKey: 'recursos_humanos',
      sectionName: 'Departamento de Recursos Humanos y Nómina',
      delegateName: 'Lic. Roberto Méndez',
      delegateEmail: `recursos.humanos@${domain}`,
      slaHours: 24,
      autoNotify: true,
      keywords: ['prima vacacional', 'prima', 'vacacional', 'vacaciones', 'nómina', 'nomina', 'recursos humanos', 'rh', 'sueldo', 'salario', 'prestaciones', 'aguinaldo', 'finiquito', 'incapacidad', 'recibo de nómina']
    }
  ];
}

export function getDefaultOfficialTemplates(tenantId: string): OfficialTemplateConfig[] {
  return [
    {
      id: 'tpl-circular',
      category: 'General',
      title: 'Circular General a Familias (Eventos y Horarios)',
      description: 'Comunicado general a la comunidad escolar para festivales, días inhábiles o ajustes de calendario.',
      defaultSubject: 'Circular Oficial: Horarios Especiales y Actividades del Mes · {COLEGIO}',
      defaultBody: `Estimada Comunidad de Familias y Tutores de {COLEGIO}:

Por medio del presente comunicado emitido por Dirección General, hacemos de su conocimiento la programación y ajustes correspondientes a nuestras próximas actividades institucionales:

1. Actividades Programadas: Enlace y horario de actividades académicas y cívicas en todos nuestros planteles.
2. Logística de Salida: Se solicita el apego puntual a los accesos y horarios designados para asegurar un flujo ordenado y seguro.
3. Canales Oficiales: Toda comunicación complementaria se canalizará a través de nuestros medios directos autorizados.

Agradecemos su permanente colaboración y compromiso con el bienestar integral de nuestros alumnos.

Atentamente,
{DIRECTOR}
Dirección General · {COLEGIO}`,
      isCustomDefault: false
    },
    {
      id: 'tpl-cte',
      category: 'Académico',
      title: 'Convocatoria a Sesión de Consejo Técnico Escolar (CTE)',
      description: 'Convocatoria oficial a directores y coordinadores para la sesión ordinaria o extraordinaria de CTE.',
      defaultSubject: 'Convocatoria Oficial: Sesión Ordinaria de Consejo Técnico Escolar · {COLEGIO}',
      defaultBody: `Estimado Equipo Directivo y Docente de {COLEGIO}:

Por medio del presente comunicado, la Dirección General convoca a la próxima sesión de Consejo Técnico Escolar (CTE), a celebrarse en las instalaciones de {PLANTEL}.

Puntos del Orden del Día:
1. Análisis de Avances Curriculares y Evaluaciones Formativas.
2. Estrategias de Acompañamiento y Nivelación Pedagógica.
3. Revisión de Protocolos de Convivencia y Bienestar Estudiantil.

Agradecemos su puntual asistencia y preparación de los insumos requeridos.

Atentamente,
{DIRECTOR}
Dirección General · {COLEGIO}`,
      isCustomDefault: false
    },
    {
      id: 'tpl-salvaguarda',
      category: 'Urgente',
      title: 'Citatorio Formal de Mediación y Salvaguarda Escolar',
      description: 'Convocatoria presencial urgente en Dirección General para atención de incidencias de convivencia.',
      defaultSubject: 'Citatorio Formal de Dirección General: Mediación Escolar en {PLANTEL}',
      defaultBody: `Estimada Familia {FAMILIA}:

En seguimiento al reporte registrado sobre la convivencia y el entorno escolar de su hijo(a) en {PLANTEL}, para la Dirección General de {COLEGIO} la seguridad física, socioemocional y el respeto recíproco constituyen una prioridad institucional indelegable.

Por este conducto, los convoco cordialmente a una reunión presencial en mi oficina de Dirección General el próximo [FECHA] a las [HORA] hrs, con el objetivo de revisar los antecedentes pedagógicos y suscribir acuerdos conjuntos en apego a nuestro Protocolo de Convivencia Escolar.

Agradezco confirmar de inmediato su recepción y puntual asistencia.

Atentamente,
{DIRECTOR}
Dirección General · {COLEGIO}`,
      isCustomDefault: false
    },
    {
      id: 'tpl-cobranza',
      category: 'Financiero',
      title: 'Notificación y Aclaración de Facturación Fiscal CFDI 4.0',
      description: 'Respuesta oficial y canalización a Finanzas para timbrado de facturas con complemento IEDU.',
      defaultSubject: 'Aclaración de Cobranza y Facturación CFDI 4.0 · {COLEGIO}',
      defaultBody: `Estimado(a) Padre / Madre de Familia:

Agradecemos su comunicación en relación con su comprobante de pago de colegiatura y solicitud fiscal.

Hemos turnado formalmente su requerimiento al Departamento de Cobranza y Finanzas con número de trámite prioritario. En un plazo no mayor a 24 horas hábiles recibirá en este mismo correo su factura electrónica CFDI 4.0 con el desglose del complemento educativo IEDU y las aplicaciones de beca o descuento de hermanos correspondientes.

Para cualquier duda complementaria de tesorería, puede responder directamente a este comunicado.

Atentamente,
Administración y Finanzas · {COLEGIO}`,
      isCustomDefault: false
    },
    {
      id: 'tpl-transporte',
      category: 'Logística',
      title: 'Aviso Preventivo de Rutas y Transporte Escolar',
      description: 'Notificación oficial ante demoras o ajustes en rutas vehiculares y paradas de autobuses.',
      defaultSubject: 'Aviso Preventivo: Ajuste Operativo en Ruta de Transporte Escolar · {COLEGIO}',
      defaultBody: `Estimadas Familias usuarias del servicio de Transporte Escolar:

Hacemos de su conocimiento que, debido a contingencias viales y adecuaciones en la ruta habitual, la Coordinación de Logística ha determinado un ajuste preventivo en los horarios de salida y paradas asignadas a partir de mañana.

El operador de ruta mantendrá supervisión constante para garantizar traslados puntuales, cómodos y bajo los más altos estándares de seguridad.

Agradecemos su comprensión y puntualidad en cada punto de encuentro.

Atentamente,
Coordinación de Logística y Transporte Escolar · {COLEGIO}`,
      isCustomDefault: false
    }
  ];
}

export function getDefaultSettings(tenantId: string): CeoEmailSettings {
  const cleanId = (tenantId || 'e1000000-0000-0000-0000-000000000001').trim();
  return {
    tenantId: cleanId,
    vipEmails: getDefaultVipRules(cleanId),
    delegates: getDefaultDelegates(cleanId),
    templates: getDefaultOfficialTemplates(cleanId),
    updatedAt: new Date().toISOString()
  };
}
