/**
 * MOTOR DE GENERACIÓN DEL GRAFO NEURONAL SINÁPTICO Y GALÁCTICO (ISKOOL)
 * Bóveda Central de Conocimiento • Segundo Cerebro Institucional
 *
 * Genera una topología multi-escala adaptada de forma 100% estricta y aislada
 * al colegio activo (school_id), sin mezclar información entre instituciones.
 *
 * Doble Escala Visual:
 * - Zoom In (>= 0.65x): Topología sináptica orgánica en forma de cerebro con
 *   clústeres densos, notas puente (bridge notes), anillos de centralidad y etiquetas nítidas.
 * - Zoom Out (< 0.65x): Inmensa galaxia cósmica esférica con cientos de nodos
 *   interconectados que exhiben la totalidad del ecosistema escolar.
 */

import {
  DetailedStudent,
  UserProfile,
  Group,
  Subject,
  Campus,
  FamilyBillingRecord,
  Institution,
  OrganizationHolding,
  isCorporateInstitution
} from '@/types';
import {
  getSchoolCampuses,
  getSchoolStudents,
  getSchoolTeachers,
  getSchoolGroups,
  getSchoolSubjects,
  getSchoolBillingRecords
} from '@/store/useSchoolAdminStore';
import { CAMPUSES_SEED, INSTITUTIONS_SEED } from '@/store/seeds';

// ============================================================================
// TIPOS DEL GRAFO NEURONAL INSTITUCIONAL
// ============================================================================

export type NodeCluster =
  | 'core'
  | 'pedagogico'
  | 'gobernanza'
  | 'fiscal'
  | 'medico'
  | 'crm'
  | 'docente'
  | 'gamificacion';

export type NodeTier = 'macro' | 'meso' | 'micro';

export interface BrainNode {
  id: string;
  title: string;
  subtitle: string;
  cluster: NodeCluster;
  tier: NodeTier;
  x: number; // Coordenadas relativas en plano virtual (Centro en 0, 0)
  y: number;
  radius: number;
  reads: number;
  bovedaPath: string;
  summary: string;
  keywords: string[];
  kpis?: Array<{ label: string; value: string }>;
  wikilinks: string[]; // Enlaces bidireccionales [[...]]
  actionLabel?: string;
  actionType?: 'academico' | 'cobranza' | 'personas' | 'admisiones' | 'campus' | 'salud';
  customDictamenText?: string;
  isOptimized?: boolean;
  optimizedAt?: string;
  updatedAt?: string;
  entityType?: 'institution' | 'campus' | 'pillar' | 'group' | 'teacher' | 'student' | 'planning' | 'cfdi' | 'health' | 'quest';
  entityId?: string;
}

export interface BrainEdge {
  source: string;
  target: string;
  label?: string;
  strength: number; // 1 a 3
  isBridge?: boolean; // Nota puente inter-clúster (destacada en zoom in)
}

export interface ClusterConfigItem {
  name: NodeCluster;
  color: string;
  fill: string;
  glow: string;
  border: string;
  badge: string;
  label: string;
  description: string;
  iconSymbol: string;
}

export const CLUSTER_CONFIG_MAP: Record<NodeCluster, ClusterConfigItem> = {
  core: {
    name: 'core',
    color: '#818CF8', // Indigo neón
    fill: 'rgba(99, 102, 241, 0.28)',
    glow: 'rgba(99, 102, 241, 0.85)',
    border: '#6366F1',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    label: 'Núcleo Central',
    description: 'Dirección General y Centro de Convergencia Institucional',
    iconSymbol: 'CORE'
  },
  pedagogico: {
    name: 'pedagogico',
    color: '#10B981', // Verde Esmeralda Neón
    fill: 'rgba(16, 185, 129, 0.22)',
    glow: 'rgba(16, 185, 129, 0.75)',
    border: '#10B981',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'Pedagógico & NEM 2024',
    description: 'Programa Analítico SEP, Fases 1-6, PDA y Planeaciones de Aula',
    iconSymbol: 'NEM'
  },
  gobernanza: {
    name: 'gobernanza',
    color: '#F59E0B', // Ámbar Neón
    fill: 'rgba(245, 158, 11, 0.22)',
    glow: 'rgba(245, 158, 11, 0.75)',
    border: '#F59E0B',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    label: 'Gobernanza & Sedes',
    description: 'Planteles, Claves RVOE, Infraestructura y Operación de Campus',
    iconSymbol: 'SEDES'
  },
  fiscal: {
    name: 'fiscal',
    color: '#06B6D4', // Cian Neón
    fill: 'rgba(6, 182, 212, 0.22)',
    glow: 'rgba(6, 182, 212, 0.75)',
    border: '#06B6D4',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    label: 'Tesorería & SAT Fiscal',
    description: 'CFDI 4.0, Deducción IEDU, Conciliación SPEI y Aging de Mora',
    iconSymbol: 'SAT'
  },
  medico: {
    name: 'medico',
    color: '#F43F5E', // Rosa Coral Neón
    fill: 'rgba(244, 63, 94, 0.22)',
    glow: 'rgba(244, 63, 94, 0.75)',
    border: '#F43F5E',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    label: 'Salud & Urgencias',
    description: 'Expediente 360, Alergias, Choque Anafiláctico y Evacuación',
    iconSymbol: 'SOS'
  },
  crm: {
    name: 'crm',
    color: '#A855F7', // Púrpura Neón
    fill: 'rgba(168, 85, 247, 0.22)',
    glow: 'rgba(168, 85, 247, 0.75)',
    border: '#A855F7',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    label: 'Admisiones & Matrícula',
    description: 'Pipeline de Familias, Diagnóstico y Acompañamiento Escolar',
    iconSymbol: 'CRM'
  },
  docente: {
    name: 'docente',
    color: '#3B82F6', // Azul Eléctrico
    fill: 'rgba(59, 130, 246, 0.22)',
    glow: 'rgba(59, 130, 246, 0.75)',
    border: '#3B82F6',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    label: 'Red Docente & Cuerpos',
    description: 'Claustro de Profesores, Asignaciones de Materia y Academias',
    iconSymbol: 'DOC'
  },
  gamificacion: {
    name: 'gamificacion',
    color: '#EC4899', // Fucsia Neón
    fill: 'rgba(236, 72, 153, 0.22)',
    glow: 'rgba(236, 72, 153, 0.75)',
    border: '#EC4899',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    label: 'Gamificación & Lienzo',
    description: 'Misiones Comunitarias ABP, Lienzo Digital, XP y Gremios',
    iconSymbol: 'XP'
  }
};

export const CORPORATE_CLUSTER_CONFIG_MAP: Record<NodeCluster, ClusterConfigItem> = {
  core: {
    name: 'core',
    color: '#818CF8',
    fill: 'rgba(99, 102, 241, 0.28)',
    glow: 'rgba(99, 102, 241, 0.85)',
    border: '#6366F1',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
    label: 'Núcleo Central',
    description: 'Dirección General y Centro de Convergencia Corporativa',
    iconSymbol: 'CORE'
  },
  pedagogico: {
    name: 'pedagogico',
    color: '#10B981',
    fill: 'rgba(16, 185, 129, 0.22)',
    glow: 'rgba(16, 185, 129, 0.75)',
    border: '#10B981',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    label: 'Competencias & Capacitación Técnica',
    description: 'Matriz de Competencias Laborales, Certificaciones ISO y Entrenamiento Operativo',
    iconSymbol: 'SKILLS'
  },
  gobernanza: {
    name: 'gobernanza',
    color: '#F59E0B',
    fill: 'rgba(245, 158, 11, 0.22)',
    glow: 'rgba(245, 158, 11, 0.75)',
    border: '#F59E0B',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    label: 'Plantas & Unidades Operativas',
    description: 'Centros Operativos, Naves Industriales y Complejos Corporativos',
    iconSymbol: 'PLANTAS'
  },
  fiscal: {
    name: 'fiscal',
    color: '#06B6D4',
    fill: 'rgba(6, 182, 212, 0.22)',
    glow: 'rgba(6, 182, 212, 0.75)',
    border: '#06B6D4',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    label: 'Tesorería & Facturación B2B',
    description: 'CFDI 4.0, Órdenes de Compra Empresariales, Conciliación Bancaria y Cobranza',
    iconSymbol: 'B2B'
  },
  medico: {
    name: 'medico',
    color: '#F43F5E',
    fill: 'rgba(244, 63, 94, 0.22)',
    glow: 'rgba(244, 63, 94, 0.75)',
    border: '#F43F5E',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    label: 'Seguridad Industrial & SST',
    description: 'Normativa STPS (NOM-030/035), Protocolos EPP, Prevención y Salud en Planta',
    iconSymbol: 'SST'
  },
  crm: {
    name: 'crm',
    color: '#A855F7',
    fill: 'rgba(168, 85, 247, 0.22)',
    glow: 'rgba(168, 85, 247, 0.75)',
    border: '#A855F7',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    label: 'Atracción de Talento & Onboarding',
    description: 'Pipeline de Contratación, Evaluación Técnica y Reclutamiento de Candidatos',
    iconSymbol: 'TALENTO'
  },
  docente: {
    name: 'docente',
    color: '#3B82F6',
    fill: 'rgba(59, 130, 246, 0.22)',
    glow: 'rgba(59, 130, 246, 0.75)',
    border: '#3B82F6',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    label: 'Instructores & Líderes Técnicos',
    description: 'Cuerpo de Capacitadores Especialistas, Facilitadores y Certificaciones',
    iconSymbol: 'INSTRUCTORES'
  },
  gamificacion: {
    name: 'gamificacion',
    color: '#EC4899',
    fill: 'rgba(236, 72, 153, 0.22)',
    glow: 'rgba(236, 72, 153, 0.75)',
    border: '#EC4899',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    label: 'Simuladores Operativos & Práctica',
    description: 'Módulos Interactivos de Práctica Técnica, Retos de Calidad e Insignias de Maestría',
    iconSymbol: 'SIMULADOR'
  }
};

export const getClusterConfig = (cluster: NodeCluster, isCorporate?: boolean): ClusterConfigItem => {
  if (isCorporate && CORPORATE_CLUSTER_CONFIG_MAP[cluster]) {
    return CORPORATE_CLUSTER_CONFIG_MAP[cluster];
  }
  return CLUSTER_CONFIG_MAP[cluster] || CLUSTER_CONFIG_MAP.core;
};


// ============================================================================
// CONSTRUCCIÓN DEL GRAFO AISLADO POR COLEGIO
// ============================================================================

export interface BuildGraphOptions {
  institutionsList?: Institution[];
  campusesList?: Campus[];
  detailedStudents?: DetailedStudent[];
  teachersList?: UserProfile[];
  groupsList?: Group[];
  subjectsList?: Subject[];
  billingRecords?: FamilyBillingRecord[];
  holdingName?: string;
}

export function buildSchoolInstitutionalGraph(
  schoolId: string,
  options: BuildGraphOptions = {}
): {
  nodes: BrainNode[];
  edges: BrainEdge[];
  institution: Institution;
  totalNodes: number;
  totalEdges: number;
} {
  const {
    institutionsList = INSTITUTIONS_SEED,
    campusesList = CAMPUSES_SEED,
    detailedStudents = [],
    teachersList = [],
    groupsList = [],
    subjectsList = [],
    billingRecords = [],
    holdingName
  } = options;

  // 1. Identificar la institución activa de forma estricta
  const targetInstitution = institutionsList.find(i => i.id === schoolId)
    || (holdingName ? institutionsList.find(i => i.name.toLowerCase().includes(holdingName.toLowerCase())) : null)
    || institutionsList.find(i => i.id === 'sch-ibime')
    || institutionsList[0];

  const actualSchoolId = targetInstitution.id;
  const schoolName = targetInstitution.name;
  const isCorporate = isCorporateInstitution(targetInstitution) || actualSchoolId.startsWith('emp-');

  // 2. Extraer entidades estrictamente particionadas para este colegio
  const schoolCampuses = getSchoolCampuses(campusesList, actualSchoolId);
  const schoolStudents = getSchoolStudents(detailedStudents, actualSchoolId, schoolCampuses);
  const schoolTeachers = getSchoolTeachers(teachersList, actualSchoolId, schoolCampuses);
  const schoolGroups = getSchoolGroups(groupsList, actualSchoolId, schoolCampuses);
  const schoolSubjects = getSchoolSubjects(subjectsList, actualSchoolId, schoolCampuses);
  const schoolBilling = getSchoolBillingRecords(billingRecords, actualSchoolId, schoolStudents);

  const nodes: BrainNode[] = [];
  const edges: BrainEdge[] = [];
  const nodeIds = new Set<string>();

  const addNode = (node: BrainNode) => {
    if (!nodeIds.has(node.id)) {
      nodeIds.add(node.id);
      nodes.push(node);
    }
  };

  const addEdge = (edge: BrainEdge) => {
    edges.push(edge);
  };

  // Helper para generar coordenadas polares alrededor de un centro
  const polar = (cx: number, cy: number, r: number, angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: Math.round(cx + r * Math.cos(rad)),
      y: Math.round(cy + r * Math.sin(rad))
    };
  };

  // ==========================================================================
  // TIER 1: NÚCLEO CENTRAL (CORE)
  // ==========================================================================
  const coreId = `core-${actualSchoolId}`;
  addNode({
    id: coreId,
    title: schoolName,
    subtitle: isCorporate ? 'Núcleo Directivo • Centro de Control B2B' : 'Núcleo Directivo • Segundo Cerebro Activo',
    cluster: 'core',
    tier: 'macro',
    x: 0,
    y: 0,
    radius: 46,
    reads: 9840,
    bovedaPath: `boveda://${actualSchoolId}/nucleo-directivo.md`,
    summary: isCorporate
      ? `Centro de telemetría y gobernanza de ${schoolName}. Monitorea el modelo de competencias técnicas y formación continua, finanzas B2B SAT CFDI, protocolos de seguridad industrial (SST) y operaciones en tiempo real.`
      : `Centro de telemetría y convergencia del ${schoolName}. Integra la supervisión del modelo pedagógico NEM 2024, finanzas SAT CFDI, protocolos clínicos y red de planteles en tiempo real.`,
    keywords: [schoolName.toLowerCase(), 'core', 'directivo', 'segundo cerebro', 'holding', 'telemetria', isCorporate ? 'corporativo' : 'rectoria'],
    kpis: isCorporate ? [
      { label: 'Unidades B2B', value: `${schoolCampuses.length || 1} Sedes` },
      { label: 'Colaboradores', value: `${schoolStudents.length || targetInstitution.studentsCount || 1420}` },
      { label: 'Cobranza B2B', value: '96.4%' },
      { label: 'Consumo IA', value: '0 Tokens' }
    ] : [
      { label: 'Planteles', value: `${schoolCampuses.length || 1} Sedes` },
      { label: 'Matrícula', value: `${schoolStudents.length || targetInstitution.studentsCount || 1420}` },
      { label: 'Cobranza', value: '94.6%' },
      { label: 'Consumo IA', value: '0 Tokens' }
    ],
    wikilinks: [
      `hub-pedagogico-${actualSchoolId}`,
      `hub-gobernanza-${actualSchoolId}`,
      `hub-fiscal-${actualSchoolId}`,
      `hub-medico-${actualSchoolId}`,
      `hub-crm-${actualSchoolId}`,
      `hub-docente-${actualSchoolId}`,
      `hub-gamificacion-${actualSchoolId}`
    ],
    actionLabel: isCorporate ? 'Ver Ecosistema Corporativo' : 'Ver Ecosistema Operativo',
    actionType: 'campus',
    entityType: 'institution',
    entityId: actualSchoolId
  });

  // ==========================================================================
  // TIER 1: LOS 7 PILARES ESTRATÉGICOS (MACRO HUBS)
  // Distribución circular armónica en radio 230px alrededor del CORE
  // ==========================================================================
  const pillars: Array<{
    cluster: NodeCluster;
    title: string;
    subtitle: string;
    angle: number;
    summary: string;
    keywords: string[];
    kpis: Array<{ label: string; value: string }>;
    actionLabel: string;
    actionType: BrainNode['actionType'];
  }> = [
    {
      cluster: 'pedagogico',
      title: isCorporate ? 'Competencias & Formación Técnica' : 'Pedagógico & NEM 2024',
      subtitle: isCorporate ? 'Matriz de Competencias Laborales & Certificaciones ISO' : 'Programa Analítico, Fases SEP & PDA',
      angle: 210, // Cuadrante superior izquierdo
      summary: isCorporate
        ? 'Matriz de competencias laborales, certificaciones técnicas operativas, programas de capacitación en línea de producción, normas de seguridad STPS y acreditaciones modulares.'
        : 'Directrices del Programa Analítico Nacional, articulación de las Fases 1 a 6, metodologías sociocríticas, proyectos comunitarios SEP y rúbricas analíticas formativas.',
      keywords: isCorporate
        ? ['competencias', 'certificaciones', 'tecnicas', 'capacitacion', 'stps', 'iso', 'linea de ensamble', 'habilidades']
        : ['pedagogico', 'nem', 'sep', 'programa analitico', 'fases', 'pda', 'rubricas', 'planeaciones'],
      kpis: isCorporate ? [
        { label: 'Certificación', value: '98.2%' },
        { label: 'Niveles Técnicos', value: '1 a 6' },
        { label: 'Bóveda Conocimiento', value: '703 Nodos' }
      ] : [
        { label: 'Adopción NEM', value: '96.4%' },
        { label: 'Fases Cubiertas', value: '1 a 6' },
        { label: 'Bóveda Curricular', value: '703 Nodos' }
      ],
      actionLabel: isCorporate ? 'Supervisar Competencias' : 'Supervisar Planeaciones',
      actionType: 'academico'
    },
    {
      cluster: 'gobernanza',
      title: isCorporate ? 'Gobernanza & Unidades Operativas' : 'Gobernanza & Planteles',
      subtitle: isCorporate ? `${schoolCampuses.length || 1} Plantas & Sedes Industriales` : `${schoolCampuses.length || 1} Sedes Oficiales • RVOE SEP`,
      angle: 260, // Superior
      summary: isCorporate
        ? `Estructura operativa de infraestructura y sedes de ${schoolName}. Monitoreo de naves industriales, centros de distribución y mantenimiento operativo.`
        : `Estructura operativa de infraestructura y sedes del ${schoolName}. Monitoreo de claves de centro de trabajo (CCT), acuerdos RVOE y mantenimiento de espacios educativos.`,
      keywords: isCorporate
        ? ['gobernanza', 'plantas', 'sedes', 'unidades', 'naves', 'infraestructura', 'directores']
        : ['gobernanza', 'campus', 'planteles', 'sedes', 'rvoe', 'cct', 'infraestructura', 'directores'],
      kpis: isCorporate ? [
        { label: 'Unidades Activas', value: `${schoolCampuses.length || 1}` },
        { label: 'Normatividad', value: '100% ISO' },
        { label: 'Salud Operativa', value: '98.2%' }
      ] : [
        { label: 'Sedes Activas', value: `${schoolCampuses.length || 1}` },
        { label: 'Acreditación', value: '100% RVOE' },
        { label: 'Salud Operativa', value: '97.2%' }
      ],
      actionLabel: isCorporate ? 'Administrar Unidades' : 'Administrar Planteles',
      actionType: 'campus'
    },
    {
      cluster: 'fiscal',
      title: isCorporate ? 'Tesorería & Facturación B2B' : 'Tesorería & SAT Fiscal',
      subtitle: isCorporate ? 'CFDI 4.0, Órdenes de Compra & Conciliación SPEI' : 'CFDI 4.0, IEDU & Conciliación SPEI',
      angle: 330, // Cuadrante superior derecho
      summary: isCorporate
        ? 'Control financiero automatizado bajo Anexo 20 CFDI 4.0 con facturación empresarial B2B, timbrado PAC sin latencia, conciliación SPEI y cobranza corporativa.'
        : 'Control financiero automatizado bajo Anexo 20 CFDI 4.0 con complemento de deducción IEDU, timbrado PAC sin latencia, conciliación SPEI y monitoreo de aging de cartera.',
      keywords: isCorporate
        ? ['fiscal', 'sat', 'cfdi', 'b2b', 'timbrado', 'tesoreria', 'cobranza', 'aging', 'spei']
        : ['fiscal', 'sat', 'cfdi', 'iedu', 'timbrado', 'tesoreria', 'cobranza', 'aging', 'spei'],
      kpis: isCorporate ? [
        { label: 'Cobranza B2B', value: '96.8%' },
        { label: 'Timbrado PAC', value: 'Instantáneo' },
        { label: 'Comprobantes', value: 'B2B 100%' }
      ] : [
        { label: 'Cobranza Media', value: '94.8%' },
        { label: 'Timbrado PAC', value: 'Instantáneo' },
        { label: 'Complemento', value: 'IEDU 100%' }
      ],
      actionLabel: isCorporate ? 'Auditar Finanzas B2B' : 'Auditar Finanzas SAT',
      actionType: 'cobranza'
    },
    {
      cluster: 'medico',
      title: isCorporate ? 'Seguridad Industrial & Salud Ocupacional (SST)' : 'Salud & Protección Civil',
      subtitle: isCorporate ? 'Expediente 360, Protocolos STPS y Normativa ISO' : 'Expediente 360, Alergias y Evacuación',
      angle: 150, // Cuadrante inferior izquierdo
      summary: isCorporate
        ? 'Protocolos de respuesta inmediata ante incidentes industriales, primeros auxilios en planta, simulacros de evacuación y verificación biométrica de personal.'
        : 'Protocolos de respuesta inmediata ante shock anafiláctico, caídas, simulacros sísmicos y pase de lista biométrico geocercado en contingencias escolares.',
      keywords: isCorporate
        ? ['seguridad', 'industrial', 'salud', 'ocupacional', 'sst', 'stps', 'loto', 'epp', 'expediente 360']
        : ['salud', 'medico', 'alergia', 'shock', 'enfermeria', 'sismo', 'evacuacion', 'expediente 360'],
      kpis: isCorporate ? [
        { label: 'Tiempo Respuesta', value: '< 90 s' },
        { label: 'Conteo Personal', value: 'Biométrico' },
        { label: 'Expediente SST', value: '100% Digital' }
      ] : [
        { label: 'Tiempo Alerta', value: '< 90 s' },
        { label: 'Pase de Lista', value: 'Biométrico' },
        { label: 'Fichas 360', value: '100% Digital' }
      ],
      actionLabel: isCorporate ? 'Ver Expedientes SST' : 'Ver Expedientes 360',
      actionType: 'salud'
    },
    {
      cluster: 'crm',
      title: isCorporate ? 'Atracción de Talento & Onboarding' : 'Admisiones & Matrícula CRM',
      subtitle: isCorporate ? 'Pipeline de Contratación & Perfil Técnico' : 'Pipeline 5 Fases & Diagnóstico',
      angle: 30, // Cuadrante inferior derecho
      summary: isCorporate
        ? 'Embudo de atracción de talento especializado, evaluaciones técnicas, entrevistas de liderazgo y formalización del expediente de colaborador.'
        : 'Embudo de conversión de familias aspirantes desde primer contacto, tour de experiencia por campus y prueba diagnóstica hasta formalización de expediente 360.',
      keywords: isCorporate
        ? ['talento', 'reclutamiento', 'onboarding', 'pipeline', 'candidatos', 'evaluacion tecnica', 'perfiles']
        : ['crm', 'admisiones', 'matricula', 'pipeline', 'prospectos', 'tour', 'diagnostico', 'familias'],
      kpis: isCorporate ? [
        { label: 'Candidatos en Proceso', value: '38 Activos' },
        { label: 'Efectividad', value: '82.4%' },
        { label: 'Dictamen', value: '< 24 hrs' }
      ] : [
        { label: 'Familias Proceso', value: '38 Activas' },
        { label: 'Conversión', value: '72.4%' },
        { label: 'Dictamen', value: '< 24 hrs' }
      ],
      actionLabel: isCorporate ? 'Ver Pipeline de Talento' : 'Ver Pipeline CRM',
      actionType: 'admisiones'
    },
    {
      cluster: 'docente',
      title: isCorporate ? 'Cuerpo de Instructores & Líderes Técnicos' : 'Red Docente & Claustro',
      subtitle: isCorporate ? `${schoolTeachers.length || 36} Instructores • Academias Técnicas` : `${schoolTeachers.length || 36} Docentes • Academias Colegiadas`,
      angle: 80, // Inferior central derecho
      summary: isCorporate
        ? `Cuerpo de instructores y líderes técnicos de ${schoolName}. Coordinación operativa, asignación de certificaciones, avance en programas de capacitación y evaluación de competencias.`
        : `Cuerpo de profesores del ${schoolName}. Coordinación académica, asignación de materias, avance en sesiones pedagógicas de aula y evaluación formativa.`,
      keywords: isCorporate
        ? ['instructores', 'capacitadores', 'lideres tecnicos', 'entrenamiento', 'certificaciones', 'evaluacion']
        : ['docente', 'profesores', 'claustro', 'academias', 'juntas', 'evaluacion', 'titulares'],
      kpis: isCorporate ? [
        { label: 'Instructores Titulares', value: `${schoolTeachers.length || 36} Instructores` },
        { label: 'Cumplimiento Sesiones', value: '98.5%' },
        { label: 'Certificaciones al Día', value: '96.2%' }
      ] : [
        { label: 'Plantilla Titular', value: `${schoolTeachers.length || 36} Profesores` },
        { label: 'Puntualidad Asistencia', value: '98.5%' },
        { label: 'Planeaciones al Día', value: '96.2%' }
      ],
      actionLabel: isCorporate ? 'Gestionar Instructores' : 'Gestionar Personal',
      actionType: 'personas'
    },
    {
      cluster: 'gamificacion',
      title: isCorporate ? 'Simuladores Operativos & Práctica Técnica' : 'Gamificación & Lienzo Digital',
      subtitle: isCorporate ? 'Prácticas Técnicas, Certificaciones y Retos Operativos' : 'Misiones ABP, XP y Retos Interactivos',
      angle: 105, // Inferior central izquierdo
      summary: isCorporate
        ? 'Entorno de simulación técnica e interactiva: retos de calidad operativa, insignias de especialización técnica, niveles de maestría y células de mejora continua.'
        : 'Entorno pedagógico inmersivo que vincula el aula física con el Lienzo Digital: misiones de impacto comunitario, insignias de maestría, puntos de experiencia (XP) y gremios.',
      keywords: isCorporate
        ? ['simuladores', 'entrenamiento', 'retos tecnicos', 'maestria', 'insignias', 'mejora continua']
        : ['gamificacion', 'lienzo', 'digital', 'misiones', 'abp', 'xp', 'gremios', 'insignias'],
      kpis: isCorporate ? [
        { label: 'Retos Activos', value: '54 Módulos' },
        { label: 'Participación', value: '94.2%' },
        { label: 'Simulaciones', value: '2,800/sem' }
      ] : [
        { label: 'Misiones Activas', value: '54 Retos' },
        { label: 'Participación', value: '94.2%' },
        { label: 'Sesiones Lienzo', value: '2,800/sem' }
      ],
      actionLabel: isCorporate ? 'Abrir Simuladores Operativos' : 'Abrir Lienzo Digital',
      actionType: 'academico'
    }
  ];

  const pillarNodeMap = new Map<NodeCluster, string>();

  pillars.forEach(p => {
    const hubId = `hub-${p.cluster}-${actualSchoolId}`;
    pillarNodeMap.set(p.cluster, hubId);
    const pos = polar(0, 0, 230, p.angle);

    addNode({
      id: hubId,
      title: p.title,
      subtitle: p.subtitle,
      cluster: p.cluster,
      tier: 'macro',
      x: pos.x,
      y: pos.y,
      radius: 32,
      reads: 3200 + Math.floor(Math.random() * 800),
      bovedaPath: `boveda://${actualSchoolId}/${p.cluster}/marco-general.md`,
      summary: p.summary,
      keywords: p.keywords,
      kpis: p.kpis,
      wikilinks: [coreId],
      actionLabel: p.actionLabel,
      actionType: p.actionType,
      entityType: 'pillar'
    });

    // Conexión Primaria Core <-> Pilar
    addEdge({
      source: coreId,
      target: hubId,
      label: p.title.split('&')[0].trim(),
      strength: 3
    });
  });

  // ==========================================================================
  // TIER 2: SECTORES Y PLANTELES REALES (MESO BRIDGES)
  // Radio 360-480px, ubicados en el cuadrante de su clúster temático
  // ==========================================================================

  // 1. Sedes / Campuses del Colegio (Bajo Gobernanza)
  const govHubId = pillarNodeMap.get('gobernanza')!;
  schoolCampuses.forEach((camp, idx) => {
    const campNodeId = `node-camp-${camp.id}`;
    const angle = 245 + idx * 25;
    const pos = polar(0, 0, 390, angle);

    addNode({
      id: campNodeId,
      title: camp.name,
      subtitle: isCorporate ? `${camp.address || 'Planta Operativa'} • Personal Activo` : `${camp.address || 'Sede Oficial'} • Alumnado Activo`,
      cluster: 'gobernanza',
      tier: 'meso',
      x: pos.x,
      y: pos.y,
      radius: 25,
      reads: 1800 + idx * 120,
      bovedaPath: isCorporate ? `boveda://${actualSchoolId}/plantas/${camp.id}.md` : `boveda://${actualSchoolId}/sedes/${camp.id}.md`,
      summary: isCorporate
        ? `Planta y unidad operativa ${camp.name} de ${schoolName}. Integra infraestructura técnica, líneas operativas y personal certificado.`
        : `Plantel oficial ${camp.name} del ${schoolName}. Integra infraestructura de aulas digitales, laboratorios y cuerpo colegiado acreditado.`,
      keywords: isCorporate
        ? [camp.name.toLowerCase(), 'planta', 'sede', 'complejo', actualSchoolId]
        : [camp.name.toLowerCase(), 'campus', 'sede', 'plantel', actualSchoolId],
      kpis: [
        { label: isCorporate ? 'Colaboradores Planta' : 'Matrícula Sede', value: `${schoolStudents.filter(s => s.campus_id === camp.id || s.campus_name === camp.name).length || 450} ${isCorporate ? 'Colaboradores' : 'Alumnos'}` },
        { label: isCorporate ? 'Cuerpo de Instructores' : 'Plantilla Docente', value: `${schoolTeachers.filter(t => t.campus_id === camp.id || t.campus_name === camp.name).length || 24} ${isCorporate ? 'Instructores' : 'Docentes'}` },
        { label: isCorporate ? 'Cobranza B2B' : 'Cobranza Sede', value: '95.2%' }
      ],
      wikilinks: [govHubId, coreId],
      actionLabel: `Filtrar a ${camp.name.split(' ')[0]}`,
      actionType: 'campus',
      entityType: 'campus',
      entityId: camp.id
    });

    addEdge({
      source: govHubId,
      target: campNodeId,
      label: 'Sede Activa',
      strength: 2
    });

    addEdge({
      source: coreId,
      target: campNodeId,
      label: 'Red Escolar',
      strength: 1
    });
  });

  // 2. Fases Curriculares Oficiales NEM (Bajo Pedagógico) o Niveles de Competencias Laborales (Modo Corporativo)
  const pedHubId = pillarNodeMap.get('pedagogico')!;
  const technicalLevels = isCorporate ? [
    { id: 'nivel-1-2', title: 'Nivel 1 y 2: Onboarding & Seguridad SST', subtitle: 'Inducción Operativa • Normas STPS y EPP', angle: 185 },
    { id: 'nivel-3-4', title: 'Nivel 3 y 4: Especialización Técnica & Calidad', subtitle: 'Líneas de Producción • Estándares ISO / IATF', angle: 215 },
    { id: 'nivel-5-6', title: 'Nivel 5 y 6: Liderazgo Operativo & Mejora Continua', subtitle: 'Supervisión de Planta • Lean Six Sigma & Mantenimiento', angle: 235 }
  ] : [
    { id: 'fase-2', title: 'Fase 2: Educación Preescolar', subtitle: 'Jardín de Niños • Lenguajes y Motricidad', angle: 185 },
    { id: 'fase-3-4-5', title: 'Fases 3, 4 y 5: Educación Primaria', subtitle: '1° a 6° Grado • Pensamiento Científico y Ética', angle: 215 },
    { id: 'fase-6', title: 'Fase 6: Educación Secundaria', subtitle: '1° a 3° Grado • Disciplinas Articuladas', angle: 235 }
  ];

  technicalLevels.forEach(f => {
    const fNodeId = `node-curriculo-${f.id}-${actualSchoolId}`;
    const pos = polar(0, 0, 400, f.angle);

    addNode({
      id: fNodeId,
      title: f.title,
      subtitle: f.subtitle,
      cluster: 'pedagogico',
      tier: 'meso',
      x: pos.x,
      y: pos.y,
      radius: 24,
      reads: 2100,
      bovedaPath: `boveda://${actualSchoolId}/competencias/niveles/${f.id}.md`,
      summary: isCorporate
        ? `Mapeo de competencias operativas de ${f.title} para los colaboradores de ${schoolName}. Módulos de formación técnica con inicio detonador, práctica activa en línea y evaluación de destrezas.`
        : `Mapeo curricular de ${f.title} para los estudiantes del ${schoolName}. Sesiones de aula de 50 minutos con apertura detonadora, desarrollo activo y cierre reflexivo con rúbricas SEP.`,
      keywords: isCorporate
        ? ['competencias', 'capacitacion', 'stps', 'iso', 'tecnica', 'operativo', 'certificacion']
        : ['fase', 'curricular', 'nem', 'primaria', 'secundaria', 'preescolar', 'pda'],
      kpis: isCorporate ? [
        { label: 'Competencias Indexadas', value: '420' },
        { label: 'Normativa', value: '100% ISO / STPS' },
        { label: 'Metodología', value: 'Práctica Dual / Lean' }
      ] : [
        { label: 'PDA Indexados', value: '420' },
        { label: 'Validación SEP', value: '100% Oficial' },
        { label: 'Metodología', value: 'ABP / STEAM' }
      ],
      wikilinks: [pedHubId],
      actionLabel: isCorporate ? 'Ver Competencias Técnicas' : 'Ver Avance Curricular',
      actionType: 'academico'
    });

    addEdge({
      source: pedHubId,
      target: fNodeId,
      label: isCorporate ? 'Nivel Técnico' : 'Fase SEP',
      strength: 2
    });
  });

  // 3. Nodos Fiscales y Tesorería
  const fiscHubId = pillarNodeMap.get('fiscal')!;
  const fiscalMeso = isCorporate ? [
    { id: 'sat-cfdi-40', title: 'Manual de Facturación SAT CFDI 4.0 B2B', subtitle: 'Anexo 20 & Timbrado PAC Instantáneo', angle: 310 },
    { id: 'ordenes-compra', title: 'Validación de Órdenes de Compra y Proveedores', subtitle: 'Cumplimiento SAT & Comprobantes Fiscales', angle: 340 },
    { id: 'aging-cartera', title: 'Aging de Cartera Comercial & Conciliación SPEI', subtitle: 'Estratificación 30, 60 y 90 días', angle: 360 }
  ] : [
    { id: 'sat-cfdi-40', title: 'Manual de Facturación SAT CFDI 4.0', subtitle: 'Anexo 20 & Timbrado PAC Instantáneo', angle: 310 },
    { id: 'iedu-deduccion', title: 'Complemento de Deducción IEDU', subtitle: 'Validación RENAPO de CURP Escolar', angle: 340 },
    { id: 'aging-cartera', title: 'Aging de Cartera & Conciliación SPEI', subtitle: 'Estratificación 30, 60 y 90 días', angle: 360 }
  ];

  fiscalMeso.forEach(m => {
    const mNodeId = `node-fisc-${m.id}-${actualSchoolId}`;
    const pos = polar(0, 0, 410, m.angle);

    addNode({
      id: mNodeId,
      title: m.title,
      subtitle: m.subtitle,
      cluster: 'fiscal',
      tier: 'meso',
      x: pos.x,
      y: pos.y,
      radius: 23,
      reads: 1650,
      bovedaPath: `boveda://${actualSchoolId}/finanzas/${m.id}.md`,
      summary: isCorporate
        ? `Normativa y automatización para ${m.title} en ${schoolName}. Emisión garantizada a 0 tokens y enlace directo con clientes empresariales.`
        : `Normativa y automatización para ${m.title} en el ${schoolName}. Emisión garantizada a 0 tokens y enlace directo con tutores legales.`,
      keywords: isCorporate
        ? ['sat', 'cfdi', 'b2b', 'factura', 'spei', 'mora', 'aging', 'cobranza']
        : ['sat', 'cfdi', 'iedu', 'factura', 'spei', 'mora', 'aging', 'cobranza'],
      kpis: [
        { label: 'Estatus', value: 'Vigente SAT' },
        { label: 'Latencia', value: '< 200 ms' },
        { label: 'Tokens', value: '0 Consumidos' }
      ],
      wikilinks: [fiscHubId, coreId],
      actionLabel: 'Auditar SAT',
      actionType: 'cobranza'
    });

    addEdge({
      source: fiscHubId,
      target: mNodeId,
      label: 'Directiva Fiscal',
      strength: 2
    });
  });

  // 4. Nodos de Salud y Urgencias / Seguridad Industrial SST
  const medHubId = pillarNodeMap.get('medico')!;
  const medicoMeso = isCorporate ? [
    { id: 'alergias-anafilaxia', title: 'Protocolo de Primeros Auxilios y Brigadas en Planta', subtitle: 'Atención Médica en < 90s & Reporte SST', angle: 130 },
    { id: 'sismo-evacuacion', title: 'Protocolo de Evacuación de Naves Industriales', subtitle: 'Puntos de Reunión y Verificación Biometrizada', angle: 160 }
  ] : [
    { id: 'alergias-anafilaxia', title: 'Protocolo de Choque Anafiláctico', subtitle: 'Estabilización en < 90s & Contacto Tutor', angle: 130 },
    { id: 'sismo-evacuacion', title: 'Protocolo de Evacuación y Repliegue Sísmico', subtitle: 'Zonas Seguras y Pase de Lista Digital', angle: 160 }
  ];

  medicoMeso.forEach(m => {
    const mNodeId = `node-med-${m.id}-${actualSchoolId}`;
    const pos = polar(0, 0, 400, m.angle);

    addNode({
      id: mNodeId,
      title: m.title,
      subtitle: m.subtitle,
      cluster: 'medico',
      tier: 'meso',
      x: pos.x,
      y: pos.y,
      radius: 23,
      reads: 1420,
      bovedaPath: `boveda://${actualSchoolId}/salud/${m.id}.md`,
      summary: isCorporate
        ? `Directiva obligatoria de seguridad industrial y salud en el trabajo para ${m.title} en las instalaciones de ${schoolName}.`
        : `Directiva obligatoria de protección escolar para ${m.title} en los planteles de ${schoolName}.`,
      keywords: isCorporate
        ? ['seguridad', 'industrial', 'sst', 'stps', 'evacuacion', 'salud', 'primeros auxilios']
        : ['alergia', 'shock', 'sismo', 'evacuacion', 'salud', 'enfermeria'],
      kpis: isCorporate ? [
        { label: 'Tiempo Alerta', value: '< 90 s' },
        { label: 'Bitácora SST', value: 'Inmutable' },
        { label: 'Notif. Supervisión', value: '< 3 min' }
      ] : [
        { label: 'Tiempo Alerta', value: '< 90 s' },
        { label: 'Bitácora', value: 'Inmutable' },
        { label: 'Notif. Padres', value: '< 3 min' }
      ],
      wikilinks: [medHubId],
      actionLabel: 'Ver Procedimiento',
      actionType: 'salud'
    });

    addEdge({
      source: medHubId,
      target: mNodeId,
      label: isCorporate ? 'Seguridad SST' : 'Emergencia',
      strength: 2
    });
  });

  // 5. Nodos de Gamificación & Lienzo Digital / Simuladores Operativos
  const gameHubId = pillarNodeMap.get('gamificacion')!;
  const gameMeso = isCorporate ? [
    { id: 'misiones-abp', title: 'Células de Calidad y Kaizen Industrial', subtitle: 'Proyectos de Eficiencia Operativa con Insignias', angle: 95 },
    { id: 'estudio-lienzo', title: 'Simulador Técnico Operativo en Vivo', subtitle: 'Prácticas Interactivas con Feedback Inmediato', angle: 115 }
  ] : [
    { id: 'misiones-abp', title: 'Misiones Comunitarias ABP', subtitle: 'Proyectos de Impacto Social con Insignias', angle: 95 },
    { id: 'estudio-lienzo', title: 'Lienzo Digital de Actividades en Vivo', subtitle: 'Estudio Interactivo con Feedback Inmediato', angle: 115 }
  ];

  gameMeso.forEach(m => {
    const mNodeId = `node-game-${m.id}-${actualSchoolId}`;
    const pos = polar(0, 0, 390, m.angle);

    addNode({
      id: mNodeId,
      title: m.title,
      subtitle: m.subtitle,
      cluster: 'gamificacion',
      tier: 'meso',
      x: pos.x,
      y: pos.y,
      radius: 23,
      reads: 1820,
      bovedaPath: `boveda://${actualSchoolId}/simuladores/${m.id}.md`,
      summary: isCorporate
        ? `Ambiente de simulación técnica interactiva en ${m.title} para colaboradores de ${schoolName}.`
        : `Ambiente de participación lúdica y aprendizaje activo en ${m.title} para estudiantes de ${schoolName}.`,
      keywords: isCorporate
        ? ['simulador', 'kaizen', 'operativo', 'practica', 'certificacion', 'insignias']
        : ['gamificacion', 'lienzo', 'actividades', 'misiones', 'xp', 'insignias'],
      kpis: [
        { label: 'Participación', value: '94.2%' },
        { label: 'Feedback', value: 'En Vivo' },
        { label: 'Insignias', value: 'Automáticas' }
      ],
      wikilinks: [gameHubId],
      actionLabel: isCorporate ? 'Abrir Simuladores Operativos' : 'Abrir Actividades',
      actionType: 'academico'
    });

    addEdge({
      source: gameHubId,
      target: mNodeId,
      label: isCorporate ? 'Práctica Técnica' : 'Actividad Lúdica',
      strength: 2
    });
  });

  // ==========================================================================
  // NOTAS PUENTE INTER-CLÚSTER (BRIDGE NOTES)
  // Las conexiones sinápticas que le dan la forma orgánica de cerebro (Imagen 2)
  // ==========================================================================
  const bridgeLinks = isCorporate ? [
    // Competencias <-> Simuladores (Capacitación en Simulador Técnico)
    {
      source: `node-curriculo-nivel-3-4-${actualSchoolId}`,
      target: `node-game-estudio-lienzo-${actualSchoolId}`,
      label: 'Práctica en Simulador',
      strength: 2
    },
    // Competencias <-> Kaizen (Evaluación de Proyecto de Calidad)
    {
      source: `node-curriculo-nivel-5-6-${actualSchoolId}`,
      target: `node-game-misiones-abp-${actualSchoolId}`,
      label: 'Evaluación Kaizen',
      strength: 2
    },
    // Tesorería <-> Gobernanza (Cobranza B2B por Planta)
    {
      source: `node-fisc-aging-cartera-${actualSchoolId}`,
      target: schoolCampuses[0] ? `node-camp-${schoolCampuses[0].id}` : govHubId,
      label: 'Aging por Sede',
      strength: 2
    },
    // Salud <-> CRM (Alta de salud ocupacional al incorporar colaborador)
    {
      source: `node-med-alergias-anafilaxia-${actualSchoolId}`,
      target: pillarNodeMap.get('crm')!,
      label: 'Ficha de Seguridad',
      strength: 2
    },
    // Instructores <-> Competencias (Instructores asignados a Nivel Técnico)
    {
      source: pillarNodeMap.get('docente')!,
      target: `node-curriculo-nivel-3-4-${actualSchoolId}`,
      label: 'Cuerpo de Instructores',
      strength: 2
    }
  ] : [
    // Pedagógico <-> Gamificación (Planeaciones cobran vida en el Lienzo Digital)
    {
      source: `node-curriculo-fase-3-4-5-${actualSchoolId}`,
      target: `node-game-estudio-lienzo-${actualSchoolId}`,
      label: 'Planeación en Lienzo',
      strength: 2
    },
    // Pedagógico <-> Gamificación (Rúbricas en Misiones ABP o Simuladores)
    {
      source: isCorporate ? `node-curriculo-nivel-6-${actualSchoolId}` : `node-curriculo-fase-6-${actualSchoolId}`,
      target: isCorporate ? `node-game-simulador-iso-${actualSchoolId}` : `node-game-misiones-abp-${actualSchoolId}`,
      label: isCorporate ? 'Práctica Técnica' : 'Evaluación de Reto',
      strength: 2
    },
    // Tesorería <-> Gobernanza (Cobranza por Plantel / Sede)
    {
      source: `node-fisc-aging-cartera-${actualSchoolId}`,
      target: schoolCampuses[0] ? `node-camp-${schoolCampuses[0].id}` : govHubId,
      label: 'Aging por Sede',
      strength: 2
    },
    // Salud <-> CRM (Alta médica o Salud Ocupacional)
    {
      source: isCorporate ? `node-med-seguridad-epp-${actualSchoolId}` : `node-med-alergias-anafilaxia-${actualSchoolId}`,
      target: pillarNodeMap.get('crm')!,
      label: isCorporate ? 'Alta de Salud Ocupacional' : 'Ficha de Ingreso',
      strength: 2
    },
    // Red Docente <-> Pedagógico (Docentes asignados o Instructores Técnicos)
    {
      source: pillarNodeMap.get('docente')!,
      target: isCorporate ? `node-curriculo-nivel-3-4-5-${actualSchoolId}` : `node-curriculo-fase-3-4-5-${actualSchoolId}`,
      label: isCorporate ? 'Academia Técnica' : 'Academia Docente',
      strength: 2
    }
  ];

  bridgeLinks.forEach(b => {
    addEdge({
      source: b.source,
      target: b.target,
      label: b.label,
      strength: b.strength,
      isBridge: true
    });
  });

  // ==========================================================================
  // TIER 3: LA CONSTELACIÓN GALÁCTICA DETALLADA (MICRO GALAXY)
  // Cientos de nodos reales del colegio que forman la inmensa esfera en Zoom Out
  // Radio 520 a 860px
  // ==========================================================================

  // 1. Grupos Escolares Reales de este Colegio (Tier 3 - Alumnado / Comunidad) o Cuadrillas Operativas (Modo Corporativo)
  const crmHubId = pillarNodeMap.get('crm')!;
  const displayGroups = schoolGroups.length > 0
    ? schoolGroups.slice(0, 16)
    : (isCorporate ? [
        { id: `${actualSchoolId}-c1`, name: 'Cuadrilla Ensamble Robótico KUKA', grade: 'Senior', level: 'operaciones' },
        { id: `${actualSchoolId}-c2`, name: 'Cuadrilla Alto Voltaje & Celdas EV', grade: 'Especialista', level: 'operaciones' },
        { id: `${actualSchoolId}-c3`, name: 'Equipo de Calidad y Metrología 3D', grade: 'Certificado', level: 'calidad' },
        { id: `${actualSchoolId}-c4`, name: 'Célula de Mantenimiento Predictivo', grade: 'Técnico', level: 'mantenimiento' },
        { id: `${actualSchoolId}-c5`, name: 'Brigada de Seguridad Industrial & SST', grade: 'Líder', level: 'seguridad' }
      ] : [
        { id: `${actualSchoolId}-g1a`, name: 'Grupo 1° A Primaria', grade: '1°', level: 'primaria' },
        { id: `${actualSchoolId}-g2a`, name: 'Grupo 2° A Primaria', grade: '2°', level: 'primaria' },
        { id: `${actualSchoolId}-g3a`, name: 'Grupo 3° A Primaria', grade: '3°', level: 'primaria' },
        { id: `${actualSchoolId}-g4a`, name: 'Grupo 4° A Primaria', grade: '4°', level: 'primaria' },
        { id: `${actualSchoolId}-g5a`, name: 'Grupo 5° A Primaria', grade: '5°', level: 'primaria' },
        { id: `${actualSchoolId}-g6a`, name: 'Grupo 6° A Primaria', grade: '6°', level: 'primaria' },
        { id: `${actualSchoolId}-s1a`, name: 'Grupo 1° A Secundaria', grade: '1°', level: 'secundaria' },
        { id: `${actualSchoolId}-s2a`, name: 'Grupo 2° A Secundaria', grade: '2°', level: 'secundaria' },
        { id: `${actualSchoolId}-s3a`, name: 'Grupo 3° A Secundaria', grade: '3°', level: 'secundaria' }
      ]);

  displayGroups.forEach((grp, idx) => {
    const grpId = `node-grp-${grp.id}`;
    const angle = 10 + (idx * 16);
    const r = 540 + (idx % 3) * 45;
    const pos = polar(0, 0, r, angle);

    addNode({
      id: grpId,
      title: grp.name,
      subtitle: isCorporate ? `${schoolName} • Unidad Operativa` : `${schoolName} • Aula Presencial`,
      cluster: 'crm',
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 14,
      reads: 600 + idx * 30,
      bovedaPath: `boveda://${actualSchoolId}/grupos/${grp.id}.md`,
      summary: isCorporate
        ? `Cuadrilla y equipo operativo ${grp.name}. Control de asistencia en planta, avance en competencias laborales y certificación técnica.`
        : `Aula y cohorte escolar ${grp.name}. Control de asistencia diaria, avance pedagógico y comunicación con tutores.`,
      keywords: isCorporate
        ? [grp.name.toLowerCase(), 'cuadrilla', 'equipo', 'colaboradores', actualSchoolId]
        : [grp.name.toLowerCase(), 'grupo', 'aula', 'alumnos', actualSchoolId],
      wikilinks: [crmHubId],
      actionLabel: isCorporate ? 'Ver Lista de Colaboradores' : 'Ver Lista del Grupo',
      actionType: 'personas',
      entityType: 'group',
      entityId: grp.id
    });

    addEdge({
      source: crmHubId,
      target: grpId,
      strength: 1
    });
  });

  // 2. Docentes Titulares Reales de este Colegio (Tier 3 - Red Docente) o Instructores Técnicos (Modo Corporativo)
  const docHubId = pillarNodeMap.get('docente')!;
  const displayTeachers = schoolTeachers.length > 0
    ? schoolTeachers.slice(0, 20)
    : (isCorporate ? [
        { id: `${actualSchoolId}-inst-1`, first_name: 'Dra. Erika', last_name: 'Von Humboldt', campus_name: 'Centro Técnico' },
        { id: `${actualSchoolId}-inst-2`, first_name: 'Ing. Guillermo', last_name: 'Schmidt Keller', campus_name: 'Planta SLP' },
        { id: `${actualSchoolId}-inst-3`, first_name: 'Ing. Carlos', last_name: 'Mendoza', campus_name: 'Línea de Ensamble' },
        { id: `${actualSchoolId}-inst-4`, first_name: 'Lic. Laura', last_name: 'Morales', campus_name: 'Centro Corporativo' }
      ] : [
        { id: `${actualSchoolId}-prof-1`, first_name: 'Israel', last_name: 'López Ángeles', campus_name: 'Plantel Matriz' },
        { id: `${actualSchoolId}-prof-2`, first_name: 'Ana María', last_name: 'Gómez', campus_name: 'Plantel Matriz' },
        { id: `${actualSchoolId}-prof-3`, first_name: 'Carlos', last_name: 'Mendoza', campus_name: 'Plantel Matriz' },
        { id: `${actualSchoolId}-prof-4`, first_name: 'Laura', last_name: 'Morales', campus_name: 'Plantel Matriz' },
        { id: `${actualSchoolId}-prof-5`, first_name: 'Javier', last_name: 'Reyes', campus_name: 'Plantel Matriz' }
      ]);

  displayTeachers.forEach((t, idx) => {
    const tId = `node-prof-${t.id}`;
    const angle = 65 + (idx * 14);
    const r = 550 + (idx % 3) * 50;
    const pos = polar(0, 0, r, angle);
    const fullName = `${t.first_name} ${t.last_name}`;

    addNode({
      id: tId,
      title: isCorporate ? `Instr. ${fullName}` : `Prof. ${fullName}`,
      subtitle: isCorporate ? `${t.campus_name || 'Instructor Técnico'} • ${schoolName}` : `${t.campus_name || 'Docente Titular'} • ${schoolName}`,
      cluster: 'docente',
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 13,
      reads: 840 + idx * 40,
      bovedaPath: isCorporate ? `boveda://${actualSchoolId}/instructores/${t.id}.md` : `boveda://${actualSchoolId}/docentes/${t.id}.md`,
      summary: isCorporate
        ? `Instructor técnico ${fullName} adscrito a ${schoolName}. Responsable de impartición de certificaciones, control de sesiones técnicas y evaluación de competencias en la Bóveda Central.`
        : `Docente titular ${fullName} adscrito a ${schoolName}. Responsable de impartición de materias, pase de lista y planeaciones en la Bóveda Curricular.`,
      keywords: isCorporate
        ? [fullName.toLowerCase(), 'instructor', 'capacitador', 'tecnico', actualSchoolId]
        : [fullName.toLowerCase(), 'profesor', 'docente', 'titular', actualSchoolId],
      wikilinks: [docHubId],
      actionLabel: isCorporate ? 'Ver Perfil del Instructor' : 'Ver Perfil Docente',
      actionType: 'personas',
      entityType: 'teacher',
      entityId: t.id
    });

    addEdge({
      source: docHubId,
      target: tId,
      strength: 1
    });

    // Conectar profesor con algún grupo si coincide
    if (displayGroups[idx % displayGroups.length]) {
      addEdge({
        source: tId,
        target: `node-grp-${displayGroups[idx % displayGroups.length].id}`,
        label: isCorporate ? 'Líder Operativo' : 'Titular de Grupo',
        strength: 1
      });
    }
  });

  // 3. Nodos de Planeaciones Curriculares Reales (Tier 3 - Bóveda Curricular) o Competencias Técnicas Industriales (Modo Corporativo)
  const corporateTechnicalTopics = [
    { title: 'Automatización y Programación PLC Siemens', standard: 'Norma IEC 61131-3 • Control de Línea Automatizada', level: 'Nivel 4' },
    { title: 'Seguridad en Baterías y Alto Voltaje EV', standard: 'Protocolo ISO 6469 • Aislamiento y Desconexión Segura', level: 'Nivel 4' },
    { title: 'Calibración Cinemática de Brazos Robóticos KUKA', standard: 'Norma ISO 10218 • Trayectorias de Soldadura Láser', level: 'Nivel 5' },
    { title: 'Control Estadístico de Calidad y Metrología 3D', standard: 'Estándar IATF 16949 • Tolerancias Geométricas GD&T', level: 'Nivel 5' },
    { title: 'Mantenimiento Predictivo y Análisis de Vibraciones', standard: 'Norma ISO 13373 • Detección Temprana en Motores', level: 'Nivel 5' },
    { title: 'Seguridad Industrial STPS y Bloqueo LOTO', standard: 'Norma NOM-004-STPS • Desenergización de Celdas', level: 'Nivel 6' },
    { title: 'Pintura Electroestática y Recubrimientos Automotrices', standard: 'Especificación BMW GS 90011 • Adherencia y Brillo', level: 'Nivel 6' },
    { title: 'Logística Just-in-Time y Cadena de Suministro B2B', standard: 'Metodología Kanban Lean • Abastecimiento a Línea', level: 'Nivel 6' },
    { title: 'Sistemas de Propulsión Híbrida y Motores Síncronos', standard: 'Arquitectura BMW eDrive • Eficiencia Energética', level: 'Nivel 6' },
    { title: 'Diagnóstico Electrónico por Bus CAN y Ethernet', standard: 'Protocolo OBD-II / UDS • Telemetría Vehicular', level: 'Nivel 6' },
    { title: 'Ergonomía Operativa y Prevención de Fatiga', standard: 'Norma NOM-036-STPS • Manejo de Cargas en Planta', level: 'Nivel 4' },
    { title: 'Gestión Ambiental y Cero Residuos en Planta', standard: 'Certificación ISO 14001 • Economía Circular Industrial', level: 'Nivel 5' }
  ];

  const planningTopics = isCorporate ? corporateTechnicalTopics.map(c => ({
    title: c.title,
    pda: c.standard,
    fase: c.level
  })) : [
    { title: 'Aritmancia y Operaciones Fraccionarias', pda: 'Resuelve problemas que implican sumas y restas de fracciones con diferente denominador.', fase: 'Fase 4' },
    { title: 'Ecosistemas Comunitarios y Biodiversidad', pda: 'Explica la reproducción en plantas por semillas, tallos, hojas y raíces.', fase: 'Fase 4' },
    { title: 'Narrativas Comunitarias y Reseñas Críticas', pda: 'Reconoce las características de la reseña crítica para expresar su opinión.', fase: 'Fase 5' },
    { title: 'Pensamiento Científico: Fenómenos Eléctricos', pda: 'Experimenta con circuitos eléctricos básicos y describe sus componentes.', fase: 'Fase 5' },
    { title: 'Democracia y Participación Ciudadana', pda: 'Valora la importancia de los derechos humanos en la convivencia social.', fase: 'Fase 5' },
    { title: 'Física y Leyes del Movimiento de Newton', pda: 'Identifica y describe la presencia de fuerzas en interacciones cotidianas.', fase: 'Fase 6' },
    { title: 'Química del Carbono y Reacciones Cotidianas', pda: 'Explica la formación de nuevos compuestos a través del modelo corpuscular.', fase: 'Fase 6' },
    { title: 'Lengua y Poesía de los Pueblos Originarios', pda: 'Identifica expresiones poéticas y metáforas en textos de diversas culturas.', fase: 'Fase 6' },
    { title: 'Historia de México: Revolución y Soberanía', pda: 'Analiza las causas del movimiento revolucionario y la Constitución de 1917.', fase: 'Fase 6' },
    { title: 'Álgebra y Ecuaciones Lineales de Primer Grado', pda: 'Modela y resuelve problemas planteando sistemas de ecuaciones lineales.', fase: 'Fase 6' },
    { title: 'Salud Integral y Nutrición Comunitaria', pda: 'Construye un plan de alimentación saludable fundamentado en el plato del bien comer.', fase: 'Fase 4' },
    { title: 'Tecnología y Pensamiento Algorítmico STEAM', pda: 'Diseña soluciones técnicas automatizadas para problemáticas locales.', fase: 'Fase 5' }
  ];

  planningTopics.forEach((pl, idx) => {
    const plId = `node-plan-${idx}-${actualSchoolId}`;
    const angle = 190 + (idx * 7);
    const r = 580 + (idx % 4) * 45;
    const pos = polar(0, 0, r, angle);

    addNode({
      id: plId,
      title: pl.title,
      subtitle: isCorporate ? `${pl.fase} • Módulo Técnico Certificado` : `${pl.fase} • 10 Sesiones Cronometradas`,
      cluster: 'pedagogico',
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 12,
      reads: 920 + idx * 35,
      bovedaPath: `boveda://${actualSchoolId}/competencias/${pl.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      summary: isCorporate
        ? `Módulo de competencia técnica especializada estructurado en Apertura, Práctica Operativa y Certificación. Alineado al estándar: "${pl.pda}".`
        : `Planeación didáctica oficial estructurada en Apertura (15m), Desarrollo (30m) y Cierre (15m). Articulada al PDA SEP: "${pl.pda}".`,
      keywords: isCorporate
        ? [pl.title.toLowerCase(), 'competencia', 'certificacion', 'modulo', 'planta', 'iso']
        : [pl.title.toLowerCase(), 'planeacion', 'pda', 'sesion', 'aula', 'nem'],
      kpis: isCorporate ? [
        { label: 'Estructura', value: '3 Fases' },
        { label: 'Estándar', value: 'Oficial ISO/STPS' },
        { label: 'Tokens', value: '0 Tokens' }
      ] : [
        { label: 'Estructura', value: '3 Momentos' },
        { label: 'PDA SEP', value: 'Oficial' },
        { label: 'Tokens', value: '0 Tokens' }
      ],
      wikilinks: [pedHubId],
      actionLabel: isCorporate ? 'Abrir Módulo de Competencia' : 'Abrir Planeación en Aula',
      actionType: 'academico',
      entityType: 'planning'
    });

    addEdge({
      source: pedHubId,
      target: plId,
      strength: 1
    });
  });

  // 4. Expedientes de Salud y Casos Médicos (Tier 3 - Salud 360) o Seguridad Industrial SST (Modo Corporativo)
  const corporateHealthCases = [
    { title: 'Protocolo Bloqueo de Energía LOTO en Línea', alert: 'Cero Accidentes', angle: 135 },
    { title: 'Protocolo de Contención de Derrame Químico', alert: 'Brigada Activa', angle: 145 },
    { title: 'Monitoreo de Exposición a Ruido STPS NOM-011', alert: 'Control EPP', angle: 155 },
    { title: 'Bitácora de Primeros Auxilios en Módulo de Planta', alert: 'Atención Inmediata', angle: 165 },
    { title: 'Ruta de Evacuación Nave Industrial y Punto de Reunión', alert: 'Punto Seguro B2', angle: 175 }
  ];

  const healthCases = isCorporate ? corporateHealthCases : [
    { title: 'Protocolo Alergia a Frutos Secos (Ficha 360)', alert: 'Shock Severo', angle: 135 },
    { title: 'Protocolo Asma Bronquial & Nebulización', alert: 'Inhalador Salbutamol', angle: 145 },
    { title: 'Registro de Diabetes Juvenil & Glucemia', alert: 'Control Monitoreo', angle: 155 },
    { title: 'Bitácora de Caídas y Traumatología Menor', alert: 'Cero Fracturas', angle: 165 },
    { title: 'Ruta de Evacuación Patio Central', alert: 'Punto Seguro B', angle: 175 }
  ];

  healthCases.forEach((hc, idx) => {
    const hcId = `node-health-${idx}-${actualSchoolId}`;
    const r = 560 + (idx % 2) * 50;
    const pos = polar(0, 0, r, hc.angle);

    addNode({
      id: hcId,
      title: hc.title,
      subtitle: `${hc.alert} • Protocolo Activo`,
      cluster: 'medico',
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 12,
      reads: 480 + idx * 25,
      bovedaPath: `boveda://${actualSchoolId}/salud/${hc.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      summary: isCorporate
        ? `Directiva de seguridad industrial y salud en el trabajo (SST) para colaboradores de ${schoolName}. Acceso inmediato para el servicio médico de planta y supervisores.`
        : `Directiva médica individualizada para estudiantes del ${schoolName}. Acceso en menos de 2 clics para el personal de enfermería y tutores.`,
      keywords: isCorporate
        ? ['seguridad', 'industrial', 'sst', 'loto', 'salud ocupacional', 'emergencia']
        : ['alergia', 'asma', 'salud', 'expediente', 'emergencia'],
      wikilinks: [medHubId],
      actionLabel: isCorporate ? 'Ver Protocolo SST' : 'Ver Ficha Médica',
      actionType: 'salud',
      entityType: 'health'
    });

    addEdge({
      source: medHubId,
      target: hcId,
      strength: 1
    });
  });

  // 5. Cuentas y Facturas Fiscales SAT (Tier 3 - Tesorería)
  const corporateFiscalFolios = [
    { title: 'Timbrado CFDI Serie Corp A (Capacitación B2B)', status: 'Sello Válido SAT', angle: 315 },
    { title: 'Timbrado CFDI Serie Corp B (Consultoría Técnica)', status: 'PAC Inmediato', angle: 328 },
    { title: 'Validación Fiscal de Proveedores y Contratistas', status: 'Cumplimiento SAT', angle: 345 },
    { title: 'Conciliación Bancaria SPEI Empresas B2B', status: 'Referencia Única', angle: 355 },
    { title: 'Convenio de Facturación y Crédito Comercial 60 Días', status: 'Ledger Inmutable', angle: 368 }
  ];

  const fiscalFolios = isCorporate ? corporateFiscalFolios : [
    { title: 'Timbrado CFDI Serie A (Colegiatura)', status: 'Sello Válido SAT', angle: 315 },
    { title: 'Timbrado CFDI Serie B (Transporte)', status: 'PAC Inmediato', angle: 328 },
    { title: 'Póliza de Deducción Fiscal IEDU Familias', status: 'Deducción ISR', angle: 345 },
    { title: 'Conciliación Bancaria SPEI Alumnos', status: 'Referencia Única', angle: 355 },
    { title: 'Convenio de Cartera Vencida Preventivo', status: 'Mitigación Mora', angle: 368 }
  ];

  fiscalFolios.forEach((ff, idx) => {
    const ffId = `node-cfdi-${idx}-${actualSchoolId}`;
    const r = 570 + (idx % 2) * 45;
    const pos = polar(0, 0, r, ff.angle);

    addNode({
      id: ffId,
      title: ff.title,
      subtitle: `${ff.status} • CFDI 4.0`,
      cluster: 'fiscal',
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 12,
      reads: 720 + idx * 30,
      bovedaPath: `boveda://${actualSchoolId}/finanzas/${ff.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      summary: isCorporate
        ? `Registro en ledger financiero corporativo de ${schoolName}. Conciliación B2B digital y validación PAC automatizada a 0 tokens.`
        : `Registro en ledger financiero escolar del ${schoolName}. Conciliación digital y validación PAC automatizada a 0 tokens.`,
      keywords: isCorporate
        ? ['cfdi', 'factura', 'spei', 'b2b', 'comprobante']
        : ['cfdi', 'factura', 'spei', 'deduccion', 'iedu'],
      wikilinks: [fiscHubId],
      actionLabel: 'Auditar CFDI',
      actionType: 'cobranza',
      entityType: 'cfdi'
    });

    addEdge({
      source: fiscHubId,
      target: ffId,
      strength: 1
    });
  });

  // 6. Misiones y Retos en Gamificación (Tier 3 - Gamificación) o Simuladores Operativos
  const quests = isCorporate ? [
    { title: 'Reto: Optimización Kaizen de Célula de Ensamble', xp: '+250 XP', angle: 88 },
    { title: 'Certificación: Cero Defectos en Soldadura Robótica', xp: '+400 XP', angle: 102 },
    { title: 'Reto: Diagnóstico Rápido de Falla en Bus CAN', xp: '+500 XP', angle: 118 },
    { title: 'Simulación: Paro de Emergencia y Protocolo LOTO', xp: '+300 XP', angle: 128 },
    { title: 'Célula de Especialistas en Alto Voltaje EV', xp: 'Rango Élite', angle: 140 }
  ] : [
    { title: 'Misión: Brigada Ecológica y Reciclaje Escolar', xp: '+250 XP', angle: 88 },
    { title: 'Misión: Torneo de Oratoria y Filosofía Comunitario', xp: '+400 XP', angle: 102 },
    { title: 'Misión: Feria de Ciencias y Robótica STEAM', xp: '+500 XP', angle: 118 },
    { title: 'Reto: Maratón Matemático en Lienzo Digital', xp: '+300 XP', angle: 128 },
    { title: 'Gremio de Alquimistas del Saber', xp: 'Rango Élite', angle: 140 }
  ];

  quests.forEach((q, idx) => {
    const qId = `node-quest-${idx}-${actualSchoolId}`;
    const r = 550 + (idx % 2) * 50;
    const pos = polar(0, 0, r, q.angle);

    addNode({
      id: qId,
      title: q.title,
      subtitle: isCorporate ? `${q.xp} • Práctica Técnica` : `${q.xp} • Reto Gamificado`,
      cluster: 'gamificacion',
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 12,
      reads: 640 + idx * 20,
      bovedaPath: `boveda://${actualSchoolId}/gamificacion/${q.title.toLowerCase().replace(/\s+/g, '-')}.md`,
      summary: isCorporate
        ? `Actividad de simulación técnica con impacto operativo para colaboradores de ${schoolName}. Otorgamiento de certificaciones modulares e insignias de destreza.`
        : `Actividad gamificada con impacto formativo para el alumnado del ${schoolName}. Otorgamiento automático de insignias de maestría y registro en expediente.`,
      keywords: isCorporate
        ? ['reto', 'kaizen', 'simulador', 'certificacion', 'destreza']
        : ['mision', 'xp', 'lienzo', 'gamificacion', 'gremio', 'reto'],
      wikilinks: [gameHubId],
      actionLabel: isCorporate ? 'Iniciar Práctica Técnica' : 'Iniciar Misión',
      actionType: 'academico',
      entityType: 'quest'
    });

    addEdge({
      source: gameHubId,
      target: qId,
      strength: 1
    });
  });

  // ==========================================================================
  // ANILLO CÓSMICO EXTERIOR (PERIPHERAL SATELLITES / ORPHANS)
  // Radio 720 a 880px formando la esfera de la galaxia completa (Imagen 3)
  // ==========================================================================
  const totalOuterStars = 72;
  const clustersArray: NodeCluster[] = ['pedagogico', 'gobernanza', 'fiscal', 'medico', 'crm', 'docente', 'gamificacion'];

  for (let i = 0; i < totalOuterStars; i++) {
    const starId = `star-orbit-${i}-${actualSchoolId}`;
    const angle = (i * 360) / totalOuterStars + (i % 2 === 0 ? 2.5 : -2.5);
    const r = 740 + (i % 6) * 24;
    const pos = polar(0, 0, r, angle);
    const cluster = clustersArray[i % clustersArray.length];

    addNode({
      id: starId,
      title: `Nodo Satelital Ecosistema #${i + 1}`,
      subtitle: `Registro Telemétrico • ${schoolName}`,
      cluster,
      tier: 'micro',
      x: pos.x,
      y: pos.y,
      radius: 7 + (i % 3) * 2,
      reads: 100 + i * 15,
      bovedaPath: `boveda://${actualSchoolId}/telemetria/satelite-${i + 1}.md`,
      summary: `Punto de telemetría periférica y verificación continua de normativas del ${schoolName}.`,
      keywords: ['satelite', 'orbita', 'telemetria', 'boveda', actualSchoolId],
      wikilinks: [coreId]
    });

    // Conexión anular cósmica entre estrellas contiguas (crea la silueta estelar de Imagen 3)
    if (i > 0) {
      addEdge({
        source: `star-orbit-${i - 1}-${actualSchoolId}`,
        target: starId,
        strength: 1
      });
    }

    // Cerrar el anillo estelar en el último nodo
    if (i === totalOuterStars - 1) {
      addEdge({
        source: starId,
        target: `star-orbit-0-${actualSchoolId}`,
        strength: 1
      });
    }

    // Conectar estrellas hacia los pilares temáticos más próximos
    const nearestPillarId = pillarNodeMap.get(cluster);
    if (nearestPillarId && i % 2 === 0) {
      addEdge({
        source: nearestPillarId,
        target: starId,
        strength: 1
      });
    }
  }

  return {
    nodes,
    edges,
    institution: targetInstitution,
    totalNodes: nodes.length,
    totalEdges: edges.length
  };
}
