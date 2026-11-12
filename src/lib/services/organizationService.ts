import {
  ArchivedNodeEmail,
  CampusScheduleConfig,
  OrgAccountTier,
  OrgAdminSubRole,
  OrgHierarchyEdge,
  OrgIntendenciaSubRole,
  OrgNodeCategory,
  OrgNodeSubRole,
  OrgPermissions,
  OrgSeatNode,
  SavedSubjectCatalogItem,
  SchoolOrganizationGraph,
  TeacherConsolidatedPayrollRow,
  TeacherSubjectAssignment,
  TimetablePlacement,
  TimetableTimeSlot,
  VibratoryProtocolAlert,
  WeekdayKey,
  WorkDaysMode,
} from './organizationTypes';
import { SectionDelegateConfig } from './ceoEmailSettingsTypes';

export * from './organizationTypes';

export const SUBJECT_CONTOUR_PALETTE: readonly string[] = [
  '#1D68FF', // Azul Institucional
  '#059669', // Esmeralda
  '#D97706', // Ámbar Dorado
  '#7C3AED', // Violeta Académico
  '#E11D48', // Carmesí
  '#0891B2', // Cian Profundo
  '#4F46E5', // Índigo
  '#EA580C', // Naranja Cobre
  '#0D9488', // Turquesa
  '#9333EA', // Púrpura
  '#2563EB', // Cobalto
  '#65A30D', // Oliva Esmeralda
];

export interface PaletteSubRoleMeta {
  subRole: OrgNodeSubRole;
  category: OrgNodeCategory;
  label: string;
  accountTier: OrgAccountTier;
  defaultMonthlyBaseMxn: number;
  defaultHourlyRateMxn: number;
  defaultSlaHours: number;
  sectionKeyPrefix: string;
}

export const ORG_PALETTE_GROUPS: Array<{
  category: OrgNodeCategory;
  numberLabel: string;
  title: string;
  subtitle: string;
  expandable: boolean;
  items: PaletteSubRoleMeta[];
}> = [
  {
    category: 'administracion',
    numberLabel: '1)',
    title: 'Administración',
    subtitle: '6 cargos directivos y operativos',
    expandable: true,
    items: [
      {
        subRole: 'director_general',
        category: 'administracion',
        label: 'Director General',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 42000,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 4,
        sectionKeyPrefix: 'direccion_general',
      },
      {
        subRole: 'finanzas',
        category: 'administracion',
        label: 'Finanzas',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 26000,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 8,
        sectionKeyPrefix: 'finanzas_caja',
      },
      {
        subRole: 'coordinador',
        category: 'administracion',
        label: 'Coordinador',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 24000,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 12,
        sectionKeyPrefix: 'coordinacion_academica',
      },
      {
        subRole: 'control_escolar',
        category: 'administracion',
        label: 'Control Escolar',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 19500,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 12,
        sectionKeyPrefix: 'control_escolar',
      },
      {
        subRole: 'servicio_medico',
        category: 'administracion',
        label: 'Servicio Médico',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 21000,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 2,
        sectionKeyPrefix: 'servicio_medico',
      },
      {
        subRole: 'juridico',
        category: 'administracion',
        label: 'Jurídico',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 28000,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 6,
        sectionKeyPrefix: 'juridico_normativa',
      },
    ],
  },
  {
    category: 'profesor',
    numberLabel: '2)',
    title: 'Profesor',
    subtitle: 'Portal Académico, Materias y Horario',
    expandable: false,
    items: [
      {
        subRole: 'profesor',
        category: 'profesor',
        label: 'Profesor',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 0,
        defaultHourlyRateMxn: 260,
        defaultSlaHours: 12,
        sectionKeyPrefix: 'docencia_academica',
      },
    ],
  },
  {
    category: 'intendencia_servicios',
    numberLabel: '3)',
    title: 'Intendencia y servicios',
    subtitle: 'Cuentas tipo 2 · Operación de plantel',
    expandable: true,
    items: [
      {
        subRole: 'intendente',
        category: 'intendencia_servicios',
        label: 'Intendente',
        accountTier: 'tipo_2',
        defaultMonthlyBaseMxn: 12500,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 8,
        sectionKeyPrefix: 'intendencia',
      },
      {
        subRole: 'transporte',
        category: 'intendencia_servicios',
        label: 'Transporte',
        accountTier: 'tipo_2',
        defaultMonthlyBaseMxn: 15500,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 4,
        sectionKeyPrefix: 'transporte_escolar',
      },
      {
        subRole: 'mantenimiento',
        category: 'intendencia_servicios',
        label: 'Mantenimiento',
        accountTier: 'tipo_2',
        defaultMonthlyBaseMxn: 14500,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 8,
        sectionKeyPrefix: 'mantenimiento_infraestructura',
      },
    ],
  },
  {
    category: 'otros',
    numberLabel: '4)',
    title: 'Otros',
    subtitle: 'Colaboradores externos o especiales',
    expandable: false,
    items: [
      {
        subRole: 'otros',
        category: 'otros',
        label: 'Otros',
        accountTier: 'tipo_1',
        defaultMonthlyBaseMxn: 16000,
        defaultHourlyRateMxn: 0,
        defaultSlaHours: 24,
        sectionKeyPrefix: 'otros_servicios',
      },
    ],
  },
];

export const ORG_SUBROLE_CATALOG: PaletteSubRoleMeta[] = ORG_PALETTE_GROUPS.flatMap(
  (g) => g.items
);

export function getSubRoleMeta(subRole: OrgNodeSubRole): PaletteSubRoleMeta {
  for (const group of ORG_PALETTE_GROUPS) {
    const found = group.items.find((i) => i.subRole === subRole);
    if (found) return found;
  }
  return ORG_PALETTE_GROUPS[3].items[0];
}

// ============================================================================
// CRIPTOGRAFÍA CASA BY GOOGLE TIER 3 (CSPRNG + FIPS 180-4 SHA-256 PURO)
// ============================================================================

function secureRandomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    const arr = new Uint32Array(1);
    globalThis.crypto.getRandomValues(arr);
    return arr[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function generateSaltHex(byteLength = 12): string {
  const bytes = new Uint8Array(byteLength);
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteLength; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

const SHA256_K = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function rotr(x: number, n: number): number {
  return (x >>> n) | (x << (32 - n));
}

export function sha256HexSync(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLen = bytes.length * 8;
  const paddedLen = Math.ceil((bytes.length + 9) / 64) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 4, bitLen >>> 0, false);
  view.setUint32(paddedLen - 8, Math.floor(bitLen / 0x100000000), false);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + SHA256_K[i] + w[i]) >>> 0;
      const S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((v) => v.toString(16).padStart(8, '0'))
    .join('');
}

export function hashOrgPassword(plainPassword: string, salt: string): string {
  return sha256HexSync(`iskool_org_v1:${salt}:${plainPassword.trim()}`);
}

export function verifyOrgPassword(plainPassword: string, salt: string, expectedHash: string): boolean {
  if (!plainPassword || !salt || !expectedHash) return false;
  const computed = hashOrgPassword(plainPassword, salt);
  if (computed.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Genera de forma automática una contraseña de 6 caracteres con exactamente:
 * - 3 números aleatorios entre 0 y 9
 * - 3 letras aleatorias combinando mayúsculas y minúsculas
 * - Estrictamente intercalados (D-L-D-L-D-L)
 */
export function generateInterleavedOrgPassword(): string {
  const digits = '0123456789';
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const allLetters = upper + lower;

  const d0 = digits[secureRandomInt(digits.length)];
  const d1 = digits[secureRandomInt(digits.length)];
  const d2 = digits[secureRandomInt(digits.length)];

  // Garantizar al menos 1 mayúscula y 1 minúscula dentro de las 3 letras
  const letters = [
    upper[secureRandomInt(upper.length)],
    lower[secureRandomInt(lower.length)],
    allLetters[secureRandomInt(allLetters.length)],
  ];
  // Fisher-Yates shuffle sobre las 3 letras
  for (let i = letters.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    const tmp = letters[i];
    letters[i] = letters[j];
    letters[j] = tmp;
  }

  return `${d0}${letters[0]}${d1}${letters[1]}${d2}${letters[2]}`;
}

// ============================================================================
// PERMISOS POR DEFECTO Y COLORES DE MATERIAS
// ============================================================================

export function getDefaultPermissionsForSubRole(subRole: OrgNodeSubRole): OrgPermissions {
  return {
    holding_sedes: subRole === 'director_general',
    admisiones_360: subRole === 'director_general' || subRole === 'control_escolar' || subRole === 'coordinador',
    calidad_nem_aldea: subRole === 'director_general' || subRole === 'coordinador' || subRole === 'profesor',
    finanzas_ebitda_sat: subRole === 'director_general' || subRole === 'finanzas',
    organizacion: subRole === 'director_general',
    portal_academico:
      subRole === 'profesor' ||
      subRole === 'director_general' ||
      subRole === 'coordinador' ||
      subRole === 'control_escolar',
    // Por default TODAS las cuentas tienen acceso a iMail & Triage
    imail_triage: true,
  };
}

export function resolveSubjectContourColor(
  subjectName: string,
  savedCatalog: SavedSubjectCatalogItem[],
  fallbackIndex = 0
): string {
  const clean = (subjectName || '').trim().toLowerCase();
  if (clean) {
    const existing = savedCatalog.find((s) => s.name.trim().toLowerCase() === clean);
    if (existing) return existing.contourColor;
  }
  const usedColors = new Set(savedCatalog.map((s) => s.contourColor));
  const unused = SUBJECT_CONTOUR_PALETTE.find((c) => !usedColors.has(c));
  if (unused) return unused;
  return SUBJECT_CONTOUR_PALETTE[fallbackIndex % SUBJECT_CONTOUR_PALETTE.length];
}

export function normalizeOrgSchoolId(rawSchoolId?: string | null): string {
  const clean = (rawSchoolId || '').trim().toLowerCase();
  if (!clean || clean === 'sch-default' || clean === 'default') {
    return 'sch-test-case';
  }
  if (
    clean === 'e1000000-0000-0000-0000-000000000001' ||
    clean === 'ibime' ||
    clean === 'sch-ibime' ||
    clean === 'holding-ibime-global' ||
    clean.includes('ibime')
  ) {
    return 'sch-ibime';
  }
  if (clean === 'sch-jjr' || clean === 'jjrosseau' || clean === 'sch-jjrosseau' || clean.includes('rosseau')) {
    return 'sch-jjrosseau';
  }
  if (clean === 'montessori' || clean === 'sch-montessori') {
    return 'sch-montessori';
  }
  if (
    clean === 'test-case' ||
    clean === 'sch-test-case' ||
    clean.includes('laboratorio') ||
    clean.includes('test-case')
  ) {
    return 'sch-test-case';
  }
  if (clean === 'bmw' || clean === 'emp-bmw') {
    return 'emp-bmw';
  }
  if (clean === 'retail' || clean === 'ventas' || clean === 'emp-ventas' || clean === 'emp-retail') {
    return 'emp-ventas';
  }
  if (clean === 'tech' || clean === 'emp-tech') {
    return 'emp-tech';
  }
  return (rawSchoolId || 'sch-test-case').trim();
}

export function resolveOrgEmailDomain(schoolId?: string | null): string {
  const norm = normalizeOrgSchoolId(schoolId);
  switch (norm) {
    case 'sch-ibime':
      return 'ibime.edu.mx';
    case 'sch-jjrosseau':
      return 'jjrosseau.edu.mx';
    case 'sch-montessori':
      return 'montessori.edu.mx';
    case 'sch-test-case':
      return 'laboratoriopedagogico.edu.mx';
    case 'emp-bmw':
      return 'nexusmotors.mx';
    case 'emp-ventas':
      return 'vanguardiaretail.mx';
    case 'emp-tech':
      return 'innovasoft.mx';
    default: {
      const slug = norm
        .replace(/^sch-/, '')
        .replace(/^emp-/, '')
        .replace(/[^a-z0-9-]/gi, '')
        .toLowerCase();
      return `${slug || 'colegio'}.edu.mx`;
    }
  }
}

export function getFullNameOfNode(node: Pick<OrgSeatNode, 'firstName' | 'paternalLastName' | 'maternalLastName' | 'roleTitle'>): string {
  const full = [node.firstName, node.paternalLastName, node.maternalLastName]
    .map((s) => (s || '').trim())
    .filter(Boolean)
    .join(' ');
  return full || `${node.roleTitle} (Sin asignar)`;
}

export function buildDefaultHistoricalEmails(
  roleTitle: string,
  email: string,
  schoolId?: string
): ArchivedNodeEmail[] {
  const nowIso = new Date().toISOString();
  const domain = resolveOrgEmailDomain(schoolId);
  return [
    {
      id: `arch-${Date.now()}-1`,
      subject: `Bitácora inicial de operación · ${roleTitle}`,
      senderName: 'Dirección General Institucional',
      senderEmail: `direccion@${domain}`,
      receivedAt: nowIso,
      snippet: `Apertura de buzón institucional vinculado a ${email || roleTitle} con respaldo de trazabilidad para Dirección.`,
    },
    {
      id: `arch-${Date.now()}-2`,
      subject: `Seguimiento de Tiempo de respuesta de área · ${roleTitle}`,
      senderName: 'Mesa de Control Institucional',
      senderEmail: `control@${domain}`,
      receivedAt: nowIso,
      snippet: 'Registro histórico preservado permanentemente en bóveda administrativa aunque se pause la sincronización.',
    },
  ];
}

export function createInitialSeatNode(params: {
  schoolId: string;
  campusId: string;
  campusName: string;
  subRole: OrgNodeSubRole;
  x?: number;
  y?: number;
  existingCount?: number;
}): OrgSeatNode {
  const cleanSchoolId = normalizeOrgSchoolId(params.schoolId);
  const domain = resolveOrgEmailDomain(cleanSchoolId);
  const meta = getSubRoleMeta(params.subRole);
  const tempPassword = generateInterleavedOrgPassword();
  const salt = generateSaltHex();
  const hash = hashOrgPassword(tempPassword, salt);
  const idx = (params.existingCount || 0) + 1;
  const nowIso = new Date().toISOString();
  const nodeId = `org-node-${params.subRole}-${Date.now()}-${secureRandomInt(9999)}`;
  const defaultUsername = `${params.subRole.replace(/_/g, '.')}${idx}@${domain}`;

  const initialSubjects: TeacherSubjectAssignment[] =
    meta.category === 'profesor'
      ? [
          {
            id: `subj-row-${Date.now()}-0`,
            subjectName: '',
            contourColor: SUBJECT_CONTOUR_PALETTE[0],
            teachAnother: false,
          },
        ]
      : [];

  return {
    nodeId,
    schoolId: cleanSchoolId,
    campusId: params.campusId || `cmp-${cleanSchoolId}-central`,
    campusName: params.campusName || 'Plantel Central',
    category: meta.category,
    subRole: params.subRole,
    accountTier: meta.accountTier,
    roleTitle: meta.label,
    x: params.x ?? 120 + ((idx - 1) % 3) * 290,
    y: params.y ?? 90 + Math.floor((idx - 1) / 3) * 195,
    firstName: '',
    paternalLastName: '',
    maternalLastName: '',
    username: defaultUsername,
    passwordHash: hash,
    passwordSalt: salt,
    tempPasswordPreview: tempPassword,
    mustChangePassword: true,
    initialPasswordInvalidated: false,
    passwordUpdatedAt: nowIso,
    permissions: getDefaultPermissionsForSubRole(params.subRole),
    subjects: initialSubjects,
    hourlyRateMxn: meta.defaultHourlyRateMxn,
    monthlyBaseSalaryMxn: meta.defaultMonthlyBaseMxn,
    slaHours: meta.defaultSlaHours,
    isProvisioned: false,
    academicPortalProvisioned: meta.category === 'profesor',
    imailMailbox: {
      syncActive: true,
      connectedEmail: defaultUsername,
      preservedHistoricalEmails: buildDefaultHistoricalEmails(meta.label, defaultUsername, cleanSchoolId),
    },
    previousCollaborators: [],
    inheritedRecordsCount: 2,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

// ============================================================================
// CONTINUIDAD DE NODO, REVOCACIÓN NO DESTRUCTIVA DE IMAIL Y ROTACIÓN DE CLAVE
// ============================================================================

export function applyNodeConfigurationUpdate(
  existingNode: OrgSeatNode,
  patch: {
    firstName?: string;
    paternalLastName?: string;
    maternalLastName?: string;
    username?: string;
    campusId?: string;
    campusName?: string;
    subRole?: OrgNodeSubRole;
    permissions?: Partial<OrgPermissions>;
    subjects?: TeacherSubjectAssignment[];
    hourlyRateMxn?: number;
    monthlyBaseSalaryMxn?: number;
    slaHours?: number;
    customRoleLabel?: string;
    isBlocked?: boolean;
  },
  savedSubjects: SavedSubjectCatalogItem[]
): { updatedNode: OrgSeatNode; updatedCatalog: SavedSubjectCatalogItem[]; campusChanged: boolean } {
  const nowIso = new Date().toISOString();
  const nextSubRole = patch.subRole ?? existingNode.subRole;
  const subRoleMeta = getSubRoleMeta(nextSubRole);
  const prevFullName = getFullNameOfNode(existingNode);
  const nextFirst = patch.firstName !== undefined ? patch.firstName.trim() : existingNode.firstName;
  const nextPaternal = patch.paternalLastName !== undefined ? patch.paternalLastName.trim() : existingNode.paternalLastName;
  const nextMaternal = patch.maternalLastName !== undefined ? patch.maternalLastName.trim() : existingNode.maternalLastName;
  const nextUsername = (patch.username !== undefined ? patch.username.trim().toLowerCase() : existingNode.username) || existingNode.username;

  const hadPreviousOccupant =
    existingNode.isProvisioned &&
    Boolean(existingNode.firstName.trim() || existingNode.paternalLastName.trim());
  const nextFullName = [nextFirst, nextPaternal, nextMaternal].filter(Boolean).join(' ');
  const isCollaboratorTurnover =
    hadPreviousOccupant &&
    Boolean(nextFullName) &&
    (prevFullName.toLowerCase() !== nextFullName.toLowerCase() ||
      existingNode.username.toLowerCase() !== nextUsername.toLowerCase());

  const previousCollaborators = isCollaboratorTurnover
    ? [
        ...existingNode.previousCollaborators,
        {
          fullName: prevFullName,
          username: existingNode.username,
          replacedAt: nowIso,
        },
      ]
    : existingNode.previousCollaborators;

  const mergedPermissions: OrgPermissions = {
    ...existingNode.permissions,
    ...(patch.permissions || {}),
  };

  // Regla No Destructiva iMail & Triage: quitar permiso desactiva sincronización pero JAMÁS borra correos históricos
  const imailMailbox = {
    ...existingNode.imailMailbox,
    connectedEmail: nextUsername,
    syncActive: mergedPermissions.imail_triage,
    preservedHistoricalEmails: existingNode.imailMailbox.preservedHistoricalEmails,
    lastRevokedAt: !mergedPermissions.imail_triage
      ? existingNode.imailMailbox.lastRevokedAt || nowIso
      : undefined,
  };

  let nextCatalog = Array.isArray(savedSubjects) ? [...savedSubjects] : [];
  let normalizedSubjects = patch.subjects !== undefined ? [...patch.subjects] : [...(existingNode.subjects || [])];

  if (existingNode.category === 'profesor') {
    normalizedSubjects = normalizedSubjects.map((subj, idx) => {
      const cleanName = (subj.subjectName || '').trim();
      let color = subj.contourColor || SUBJECT_CONTOUR_PALETTE[idx % SUBJECT_CONTOUR_PALETTE.length];
      if (cleanName) {
        const foundInCat = nextCatalog.find((c) => c.name.trim().toLowerCase() === cleanName.toLowerCase());
        if (foundInCat) {
          color = foundInCat.contourColor;
        } else {
          color = resolveSubjectContourColor(cleanName, nextCatalog, idx);
          nextCatalog.push({
            id: `cat-subj-${Date.now()}-${idx}-${secureRandomInt(999)}`,
            name: cleanName,
            contourColor: color,
            createdAt: nowIso,
          });
        }
      }
      return {
        ...subj,
        subjectName: cleanName,
        contourColor: color,
      };
    });

    if (normalizedSubjects.length === 0) {
      normalizedSubjects = [
        {
          id: `subj-row-${Date.now()}-0`,
          subjectName: '',
          contourColor: SUBJECT_CONTOUR_PALETTE[0],
          teachAnother: false,
        },
      ];
    }
  }

  const campusChanged =
    Boolean(patch.campusId) && patch.campusId !== existingNode.campusId;

  const updatedNode: OrgSeatNode = {
    ...existingNode,
    // nodeId permanece 100% INMUTABLE para conservar toda la información histórica del puesto
    nodeId: existingNode.nodeId,
    category: patch.subRole ? subRoleMeta.category : existingNode.category,
    subRole: nextSubRole,
    accountTier: patch.subRole ? subRoleMeta.accountTier : existingNode.accountTier,
    roleTitle: patch.subRole ? subRoleMeta.label : existingNode.roleTitle,
    firstName: nextFirst,
    paternalLastName: nextPaternal,
    maternalLastName: nextMaternal,
    username: nextUsername,
    campusId: patch.campusId ?? existingNode.campusId,
    campusName: patch.campusName ?? existingNode.campusName,
    customRoleLabel: patch.customRoleLabel ?? existingNode.customRoleLabel,
    permissions: mergedPermissions,
    subjects: normalizedSubjects,
    hourlyRateMxn: patch.hourlyRateMxn ?? existingNode.hourlyRateMxn,
    monthlyBaseSalaryMxn: patch.monthlyBaseSalaryMxn ?? existingNode.monthlyBaseSalaryMxn,
    slaHours: patch.slaHours ?? existingNode.slaHours,
    isProvisioned: true,
    isBlocked: patch.isBlocked !== undefined ? Boolean(patch.isBlocked) : Boolean(existingNode.isBlocked),
    academicPortalProvisioned:
      (patch.subRole ? subRoleMeta.category : existingNode.category) === 'profesor' || mergedPermissions.portal_academico,
    imailMailbox,
    previousCollaborators,
    inheritedRecordsCount:
      existingNode.inheritedRecordsCount + (isCollaboratorTurnover ? 1 : 0),
    updatedAt: nowIso,
  };

  return {
    updatedNode,
    updatedCatalog: nextCatalog,
    campusChanged,
  };
}

export function regenerateNodePassword(node: OrgSeatNode, customPassword?: string): {
  updatedNode: OrgSeatNode;
  newPassword: string;
} {
  const cleanCustom = (customPassword || '').trim();
  const newPassword = cleanCustom.length >= 6 ? cleanCustom : generateInterleavedOrgPassword();
  const salt = generateSaltHex();
  const hash = hashOrgPassword(newPassword, salt);
  const nowIso = new Date().toISOString();

  return {
    newPassword,
    updatedNode: {
      ...node,
      passwordSalt: salt,
      passwordHash: hash,
      tempPasswordPreview: newPassword,
      mustChangePassword: true,
      initialPasswordInvalidated: false,
      passwordUpdatedAt: nowIso,
      updatedAt: nowIso,
    },
  };
}

export function rotateFirstLoginPassword(
  node: OrgSeatNode,
  currentTempPassword: string,
  newPersonalPassword: string
): { success: boolean; updatedNode?: OrgSeatNode; error?: string } {
  if (!verifyOrgPassword(currentTempPassword, node.passwordSalt, node.passwordHash)) {
    return {
      success: false,
      error: 'La contraseña temporal proporcionada no es válida o ya fue reemplazada.',
    };
  }
  const cleanNew = (newPersonalPassword || '').trim();
  if (cleanNew.length < 6) {
    return {
      success: false,
      error: 'La nueva contraseña personal debe tener al menos 6 caracteres.',
    };
  }
  if (verifyOrgPassword(cleanNew, node.passwordSalt, node.passwordHash)) {
    return {
      success: false,
      error: 'Por seguridad, la nueva contraseña personal debe ser distinta a la clave temporal entregada por Dirección.',
    };
  }

  const newSalt = generateSaltHex();
  const newHash = hashOrgPassword(cleanNew, newSalt);
  const nowIso = new Date().toISOString();

  return {
    success: true,
    updatedNode: {
      ...node,
      passwordSalt: newSalt,
      passwordHash: newHash,
      // La contraseña inicial dada por el CEO deja de funcionar permanentemente y se borra su vista previa
      tempPasswordPreview: null,
      mustChangePassword: false,
      initialPasswordInvalidated: true,
      passwordUpdatedAt: nowIso,
      updatedAt: nowIso,
    },
  };
}

// ============================================================================
// MOTOR DE HORARIO SEMANAL POR BLOQUES Y DETECCIÓN DE CHOQUES
// ============================================================================

export function parseTimeToMinutes(hhmm: string): number {
  const [hStr, mStr] = (hhmm || '07:30').split(':');
  const h = Math.max(0, Math.min(23, parseInt(hStr || '7', 10) || 0));
  const m = Math.max(0, Math.min(59, parseInt(mStr || '0', 10) || 0));
  return h * 60 + m;
}

export function formatMinutesToTime(totalMinutes: number): string {
  const clamped = Math.max(0, Math.min(24 * 60, Math.round(totalMinutes)));
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getWorkdaysArray(mode: WorkDaysMode): WeekdayKey[] {
  return mode === 'lun_sab'
    ? ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
    : ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];
}

export function generateTimetableSlots(config: CampusScheduleConfig): TimetableTimeSlot[] {
  const duration = Math.max(15, Math.min(240, Number(config.blockDurationMinutes) || 50));
  const startMin = parseTimeToMinutes(config.entryTime);
  const endMin = Math.max(startMin + duration, parseTimeToMinutes(config.exitTime));

  const slots: TimetableTimeSlot[] = [];
  let cursor = startMin;
  let idx = 0;
  while (cursor + duration <= endMin && idx < 24) {
    slots.push({
      slotIndex: idx,
      startTime: formatMinutesToTime(cursor),
      endTime: formatMinutesToTime(cursor + duration),
      durationMinutes: duration,
    });
    cursor += duration;
    idx++;
  }
  return slots;
}

/**
 * Calcula las horas semanales y mensuales consolidadas por profesor:
 * Aunque un profesor imparta 2, 3 o N materias, sigue siendo UN SOLO PROFESOR
 * y su conteo recurrente suma el total de horas de todos sus bloques asignados.
 */
export function calculateConsolidatedPayrollSummary(
  graph: SchoolOrganizationGraph
): {
  rows: TeacherConsolidatedPayrollRow[];
  totalMonthlyPayrollMxn: number;
  totalTeachersConsolidatedCount: number;
  totalTeacherWeeklyHours: number;
} {
  const provisionedNodes = graph.nodes.filter((n) => n.isProvisioned);
  const rows: TeacherConsolidatedPayrollRow[] = provisionedNodes.map((node) => {
    const fullName = getFullNameOfNode(node);
    if (node.category === 'profesor') {
      const nodePlacements = graph.timetablePlacements.filter(
        (p) => p.teacherNodeId === node.nodeId
      );
      const totalWeeklyMinutes = nodePlacements.reduce(
        (acc, p) => acc + (Number(p.durationMinutes) || 50),
        0
      );
      const weeklyHours = Math.round((totalWeeklyMinutes / 60) * 100) / 100;
      const monthlyHours = Math.round(weeklyHours * 4 * 100) / 100;
      const validSubjectNames = node.subjects
        .map((s) => s.subjectName.trim())
        .filter(Boolean);
      const rate = node.hourlyRateMxn || 260;
      const monthlyTotal = Math.round(monthlyHours * rate);

      return {
        nodeId: node.nodeId,
        userId: `usr-org-${node.nodeId}`,
        fullName,
        username: node.username,
        category: node.category,
        roleTitle: node.roleTitle,
        campusId: node.campusId,
        campusName: node.campusName,
        subjectsCount: validSubjectNames.length,
        subjectNames: validSubjectNames,
        weeklyHours,
        monthlyHours,
        hourlyRateMxn: rate,
        monthlyRecurringTotalMxn: monthlyTotal,
      };
    }

    return {
      nodeId: node.nodeId,
      userId: `usr-org-${node.nodeId}`,
      fullName,
      username: node.username,
      category: node.category,
      roleTitle: node.customRoleLabel || node.roleTitle,
      campusId: node.campusId,
      campusName: node.campusName,
      subjectsCount: 0,
      subjectNames: [],
      weeklyHours: 40,
      monthlyHours: 160,
      hourlyRateMxn: 0,
      monthlyRecurringTotalMxn: node.monthlyBaseSalaryMxn || 16000,
    };
  });

  const totalMonthlyPayrollMxn = rows.reduce(
    (sum, r) => sum + r.monthlyRecurringTotalMxn,
    0
  );
  const teacherRows = rows.filter((r) => r.category === 'profesor');
  const totalTeacherWeeklyHours = teacherRows.reduce(
    (sum, r) => sum + r.weeklyHours,
    0
  );

  return {
    rows,
    totalMonthlyPayrollMxn: Math.round(totalMonthlyPayrollMxn * 100) / 100,
    totalTeachersConsolidatedCount: teacherRows.length,
    totalTeacherWeeklyHours: Math.round(totalTeacherWeeklyHours * 100) / 100,
  };
}

// ============================================================================
// MATRIZ DINÁMICA DE DELEGADOS SLA Y JERARQUÍA DEL ORGANIGRAMA
// ============================================================================

export function findImmediateSuperiorNode(
  targetNodeId: string,
  nodes: OrgSeatNode[],
  edges: OrgHierarchyEdge[]
): OrgSeatNode | undefined {
  const incoming = edges.find((e) => e.targetNodeId === targetNodeId);
  if (!incoming) return undefined;
  return nodes.find((n) => n.nodeId === incoming.sourceNodeId);
}

/**
 * Determina si `sourceNodeId` es superior directo o indirecto de `targetNodeId` en el organigrama.
 * Nota: `'ceo-root'` (el CEO institucional) es superior jerárquico de todos los nodos del organigrama.
 */
export function isSuperiorInOrgChart(
  sourceNodeId: string | undefined,
  targetNodeId: string,
  edges: OrgHierarchyEdge[]
): boolean {
  if (!sourceNodeId || sourceNodeId === 'ceo-root') return true;
  if (sourceNodeId === targetNodeId) return false;

  const visited = new Set<string>();
  const queue: string[] = [sourceNodeId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const edge of edges) {
      if (edge.sourceNodeId === current) {
        if (edge.targetNodeId === targetNodeId) return true;
        if (!visited.has(edge.targetNodeId)) {
          queue.push(edge.targetNodeId);
        }
      }
    }
  }
  return false;
}

export function wouldCreateHierarchyCycle(
  sourceNodeId: string,
  targetNodeId: string,
  edges: OrgHierarchyEdge[]
): boolean {
  if (sourceNodeId === targetNodeId) return true;
  // Si target ya es ancestro de source, conectar source -> target crearía un ciclo
  return isSuperiorInOrgChart(targetNodeId, sourceNodeId, edges);
}

/**
 * Construye la Matriz de Delegados por Sección SLA a partir de las cuentas generadas,
 * eliminando por completo las cuentas por default cuando existen cuentas generadas en el organigrama.
 */
export function buildDynamicSlaDelegatesFromGraph(
  graph: SchoolOrganizationGraph
): SectionDelegateConfig[] {
  const provisioned = graph.nodes.filter((n) => n.isProvisioned);
  if (provisioned.length === 0) return [];

  return provisioned.map((node, index) => {
    const meta = getSubRoleMeta(node.subRole);
    const superior = findImmediateSuperiorNode(node.nodeId, graph.nodes, graph.edges);
    const fullName = getFullNameOfNode(node);
    const subjectSuffix =
      node.category === 'profesor' && node.subjects.some((s) => s.subjectName.trim())
        ? ` · ${node.subjects
            .map((s) => s.subjectName.trim())
            .filter(Boolean)
            .join(', ')}`
        : '';

    const domain = resolveOrgEmailDomain(node.schoolId || graph.schoolId);
    return {
      id: `del-org-${node.nodeId}`,
      sectionKey: `${meta.sectionKeyPrefix}_${index + 1}_${node.nodeId.slice(-5)}`,
      sectionName: `${node.customRoleLabel || node.roleTitle}${subjectSuffix}`,
      delegateName: fullName,
      delegateEmail: node.username,
      slaHours: node.slaHours || meta.defaultSlaHours,
      escalationLeaderEmail: superior?.username || `direccion@${domain}`,
      autoNotify: true,
      keywords: [node.roleTitle.toLowerCase()],
    };
  });
}

// ============================================================================
// AUTO-ORGANIZAR NODOS (ALGORITMO JERÁRQUICO DE ÁRBOLES LIMPIOS SIN TRASLAPE)
// ============================================================================

export function autoOrganizeOrgNodes(
  nodes: OrgSeatNode[],
  edges: OrgHierarchyEdge[]
): OrgSeatNode[] {
  if (nodes.length === 0) return [];

  const NODE_WIDTH = 256;
  const H_GAP = 48;
  const V_GAP = 165;
  const START_X = 80;
  const START_Y = 64;

  const nodeMap = new Map(nodes.map((n) => [n.nodeId, n]));
  const childrenMap = new Map<string, string[]>();
  const incomingCount = new Map<string, number>();

  for (const n of nodes) {
    childrenMap.set(n.nodeId, []);
    incomingCount.set(n.nodeId, 0);
  }

  for (const e of edges) {
    if (nodeMap.has(e.sourceNodeId) && nodeMap.has(e.targetNodeId)) {
      childrenMap.get(e.sourceNodeId)!.push(e.targetNodeId);
      incomingCount.set(e.targetNodeId, (incomingCount.get(e.targetNodeId) || 0) + 1);
    }
  }

  // Raíces ordenadas: Director General primero, luego Administración, Profesor, Intendencia, Otros
  const rankCategory = (n: OrgSeatNode): number => {
    if (n.subRole === 'director_general') return 0;
    if (n.category === 'administracion') return 1;
    if (n.category === 'profesor') return 2;
    if (n.category === 'intendencia_servicios') return 3;
    return 4;
  };

  const roots = nodes
    .filter((n) => (incomingCount.get(n.nodeId) || 0) === 0)
    .sort((a, b) => rankCategory(a) - rankCategory(b));

  if (roots.length === 0) {
    roots.push(nodes[0]);
  }

  const subtreeLeaves = new Map<string, number>();
  const visitedCount = new Set<string>();

  function measureSubtree(id: string): number {
    if (visitedCount.has(id)) return 1;
    visitedCount.add(id);
    const kids = (childrenMap.get(id) || []).sort((a, b) => {
      const na = nodeMap.get(a);
      const nb = nodeMap.get(b);
      return (na ? rankCategory(na) : 9) - (nb ? rankCategory(nb) : 9);
    });
    childrenMap.set(id, kids);
    if (kids.length === 0) {
      subtreeLeaves.set(id, 1);
      return 1;
    }
    let total = 0;
    for (const k of kids) {
      total += measureSubtree(k);
    }
    const leaves = Math.max(1, total);
    subtreeLeaves.set(id, leaves);
    return leaves;
  }

  for (const r of roots) {
    measureSubtree(r.nodeId);
  }

  const placedCoords = new Map<string, { x: number; y: number }>();
  const visitedPlace = new Set<string>();
  const unitSpan = NODE_WIDTH + H_GAP;

  function placeSubtree(id: string, leftSlot: number, depth: number) {
    if (visitedPlace.has(id)) return;
    visitedPlace.add(id);
    const span = subtreeLeaves.get(id) || 1;
    const centerX = START_X + (leftSlot + span / 2) * unitSpan - unitSpan / 2;
    const y = START_Y + depth * V_GAP;
    placedCoords.set(id, { x: Math.round(centerX), y: Math.round(y) });

    const kids = childrenMap.get(id) || [];
    let childLeft = leftSlot;
    for (const k of kids) {
      const childSpan = subtreeLeaves.get(k) || 1;
      placeSubtree(k, childLeft, depth + 1);
      childLeft += childSpan;
    }
  }

  // Si no hay aristas aún y hay Director General + otros nodos, agrupar visualmente por niveles jerárquicos limpios
  if (edges.length === 0 && nodes.length > 1) {
    const tier0 = nodes.filter((n) => n.subRole === 'director_general');
    const tier1 = nodes.filter(
      (n) => n.category === 'administracion' && n.subRole !== 'director_general'
    );
    const tier2 = nodes.filter((n) => n.category === 'profesor');
    const tier3 = nodes.filter(
      (n) => n.category === 'intendencia_servicios' || n.category === 'otros'
    );
    const tiers = [tier0, tier1, tier2, tier3].filter((t) => t.length > 0);
    const maxCols = Math.max(...tiers.map((t) => t.length), 1);
    const totalWidth = maxCols * unitSpan;

    tiers.forEach((tierNodes, tierIdx) => {
      const rowWidth = tierNodes.length * unitSpan;
      const offsetX = START_X + Math.max(0, (totalWidth - rowWidth) / 2);
      tierNodes.forEach((n, colIdx) => {
        placedCoords.set(n.nodeId, {
          x: Math.round(offsetX + colIdx * unitSpan),
          y: Math.round(START_Y + tierIdx * V_GAP),
        });
      });
    });
  } else {
    let cursorSlot = 0;
    for (const r of roots) {
      const span = subtreeLeaves.get(r.nodeId) || 1;
      placeSubtree(r.nodeId, cursorSlot, 0);
      cursorSlot += span;
    }
    // Colocar cualquier nodo residual no visitado
    for (const n of nodes) {
      if (!placedCoords.has(n.nodeId)) {
        placedCoords.set(n.nodeId, {
          x: Math.round(START_X + cursorSlot * unitSpan),
          y: START_Y,
        });
        cursorSlot += 1;
      }
    }
  }

  return nodes.map((n) => {
    const pos = placedCoords.get(n.nodeId);
    return pos ? { ...n, x: pos.x, y: pos.y } : n;
  });
}

// ============================================================================
// PERSISTENCIA EN SERVIDOR Y MEMORIA GLOBAL (PARA API Y AUTENTICACIÓN SEGURA)
// ============================================================================

export function createEmptyOrganizationGraph(schoolId = 'sch-test-case'): SchoolOrganizationGraph {
  const clean = normalizeOrgSchoolId(schoolId);
  return {
    schoolId: clean,
    nodes: [],
    edges: [],
    savedSubjects: [],
    campusSchedules: {},
    timetablePlacements: [],
    alerts: [],
    updatedAt: new Date().toISOString(),
  };
}

function getNodeFs() {
  if (typeof window === 'undefined') {
    try {
      const nodeFs = eval('require')('fs');
      const nodePath = eval('require')('path');
      const nodeOs = eval('require')('os');
      return { fs: nodeFs, path: nodePath, os: nodeOs };
    } catch {
      return null;
    }
  }
  return null;
}

function isTestEnv(): boolean {
  return Boolean(typeof process !== 'undefined' && (process.env?.VITEST || process.env?.NODE_ENV === 'test'));
}

const serverOrgMemory: Map<string, SchoolOrganizationGraph> =
  (globalThis as any).__iskoolOrganizationGraphStore ||
  ((globalThis as any).__iskoolOrganizationGraphStore = new Map());

function resolveOrgDiskPaths(node: { fs: any; path: any; os: any }): string[] {
  const candidates = [
    node.path.join(process.cwd(), '.data', 'organization_graphs.json'),
  ];
  try {
    const tmpDir = node.os?.tmpdir?.();
    if (tmpDir) {
      candidates.push(node.path.join(tmpDir, 'iskool-data', 'organization_graphs.json'));
    }
  } catch {
    // Ignore os.tmpdir resolution errors
  }
  return candidates;
}

function loadServerGraphsFromDisk(): Map<string, SchoolOrganizationGraph> {
  const map = new Map<string, SchoolOrganizationGraph>();
  if (isTestEnv()) return map;
  const node = getNodeFs();
  if (!node) return map;
  for (const file of resolveOrgDiskPaths(node)) {
    try {
      if (node.fs.existsSync(file)) {
        const parsed = JSON.parse(node.fs.readFileSync(file, 'utf8'));
        if (parsed && typeof parsed === 'object') {
          for (const [schoolId, g] of Object.entries(parsed)) {
            if (g && typeof g === 'object') {
              const existing = map.get(schoolId);
              const existingTs = existing?.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
              const nextTs = (g as any)?.updatedAt ? new Date((g as any).updatedAt).getTime() : 0;
              if (!existing || nextTs >= existingTs) {
                map.set(schoolId, g as SchoolOrganizationGraph);
              }
            }
          }
        }
      }
    } catch {
      // Fallback limpio en entornos serverless de solo lectura
    }
  }
  return map;
}

function saveServerGraphsToDisk(map: Map<string, SchoolOrganizationGraph>) {
  if (isTestEnv()) return;
  const node = getNodeFs();
  if (!node) return;
  const obj: Record<string, SchoolOrganizationGraph> = {};
  for (const [k, v] of map.entries()) {
    obj[k] = v;
  }
  const serialized = JSON.stringify(obj, null, 2);
  for (const file of resolveOrgDiskPaths(node)) {
    try {
      const dir = node.path.dirname(file);
      if (!node.fs.existsSync(dir)) {
        node.fs.mkdirSync(dir, { recursive: true });
      }
      node.fs.writeFileSync(file, serialized, 'utf8');
      break;
    } catch {
      // Intenta siguiente ruta escribible (ej. /tmp/iskool-data en serverless)
    }
  }
}

if (serverOrgMemory.size === 0) {
  const disk = loadServerGraphsFromDisk();
  for (const [k, v] of disk.entries()) {
    serverOrgMemory.set(k, v);
  }
}

export const OrganizationServerService = {
  getGraph(schoolId = 'sch-test-case'): SchoolOrganizationGraph {
    const clean = normalizeOrgSchoolId(schoolId);
    const existing = serverOrgMemory.get(clean);
    if (existing) return existing;
    const empty = createEmptyOrganizationGraph(clean);
    serverOrgMemory.set(clean, empty);
    return empty;
  },

  saveGraph(schoolId: string, graph: SchoolOrganizationGraph): SchoolOrganizationGraph {
    const clean = normalizeOrgSchoolId(schoolId || graph?.schoolId);
    const base = createEmptyOrganizationGraph(clean);
    const normalized: SchoolOrganizationGraph = {
      ...base,
      ...graph,
      schoolId: clean,
      nodes: Array.isArray(graph?.nodes) ? graph.nodes : [],
      edges: Array.isArray(graph?.edges) ? graph.edges : [],
      savedSubjects: Array.isArray(graph?.savedSubjects) ? graph.savedSubjects : [],
      campusSchedules:
        graph?.campusSchedules && typeof graph.campusSchedules === 'object'
          ? graph.campusSchedules
          : {},
      timetablePlacements: Array.isArray(graph?.timetablePlacements)
        ? graph.timetablePlacements
        : [],
      alerts: Array.isArray(graph?.alerts) ? graph.alerts : [],
      updatedAt: new Date().toISOString(),
    };
    serverOrgMemory.set(clean, normalized);
    saveServerGraphsToDisk(serverOrgMemory);
    return normalized;
  },

  findProvisionedNodeByUsername(identifier: string): OrgSeatNode | undefined {
    const clean = (identifier || '').trim().toLowerCase();
    if (!clean) return undefined;
    for (const graph of serverOrgMemory.values()) {
      const found = graph.nodes.find(
        (n) =>
          n.isProvisioned &&
          (n.username.toLowerCase() === clean ||
            `usr-org-${n.nodeId}`.toLowerCase() === clean)
      );
      if (found) return found;
    }
    return undefined;
  },

  authenticateOrganizationalUser(
    identifier: string,
    password: string
  ): {
    matched: boolean;
    validPassword: boolean;
    mustChangePassword: boolean;
    isBlocked?: boolean;
    node?: OrgSeatNode;
  } {
    const node = this.findProvisionedNodeByUsername(identifier);
    if (!node) {
      return { matched: false, validPassword: false, mustChangePassword: false };
    }
    if (node.isBlocked) {
      return {
        matched: true,
        validPassword: false,
        mustChangePassword: node.mustChangePassword,
        isBlocked: true,
        node,
      };
    }
    const valid = verifyOrgPassword(password, node.passwordSalt, node.passwordHash);
    return {
      matched: true,
      validPassword: valid,
      mustChangePassword: node.mustChangePassword,
      isBlocked: false,
      node,
    };
  },

  rotateUserPasswordOnServer(
    identifier: string,
    currentPassword: string,
    newPassword: string
  ): { success: boolean; node?: OrgSeatNode; error?: string } {
    for (const [schoolId, graph] of serverOrgMemory.entries()) {
      const idx = graph.nodes.findIndex(
        (n) =>
          n.isProvisioned &&
          n.username.toLowerCase() === (identifier || '').trim().toLowerCase()
      );
      if (idx !== -1) {
        const res = rotateFirstLoginPassword(
          graph.nodes[idx],
          currentPassword,
          newPassword
        );
        if (!res.success || !res.updatedNode) return res;
        const nextNodes = [...graph.nodes];
        nextNodes[idx] = res.updatedNode;
        this.saveGraph(schoolId, { ...graph, nodes: nextNodes });
        return { success: true, node: res.updatedNode };
      }
    }
    return { success: false, error: 'Cuenta organizacional no localizada.' };
  },

  resetForTests() {
    serverOrgMemory.clear();
  },
};

// ============================================================================
// CONSOLA DE CONTROL TOTAL DEL SUPER USUARIO (CONTEO EN VIVO Y GESTIÓN UNIFICADA)
// ============================================================================

export interface UnifiedSuperUserAccountItem {
  id: string;
  nodeId?: string;
  source: 'organizacion_ceo' | 'directorio_staff';
  schoolId: string;
  campusId?: string;
  campusName: string;
  category: 'administracion' | 'profesor' | 'intendencia_servicios' | 'otros';
  subRole: OrgNodeSubRole;
  roleLabel: string;
  fullName: string;
  firstName: string;
  paternalLastName: string;
  maternalLastName: string;
  username: string;
  passwordPreview: string;
  mustChangePassword: boolean;
  isProvisioned: boolean;
  isBlocked: boolean;
  permissions: OrgPermissions;
  monthlyBaseSalaryMxn: number;
  hourlyRateMxn: number;
  slaHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedInstitutionAccountsSummary {
  schoolId: string;
  orgTotalCount: number;
  orgAdminCount: number;
  orgTeacherCount: number;
  orgServicesCount: number;
  nonOrgStaffCount: number;
  totalAccountsCount: number;
  accounts: UnifiedSuperUserAccountItem[];
}

export function getUnifiedInstitutionAccounts(
  rawSchoolId: string,
  orgGraph?: SchoolOrganizationGraph | null,
  staffUsers?: any[] | null
): UnifiedInstitutionAccountsSummary {
  const schoolId = normalizeOrgSchoolId(rawSchoolId);
  const nodes: OrgSeatNode[] = Array.isArray(orgGraph?.nodes) ? orgGraph!.nodes : [];
  const orgNodeIds = new Set<string>();
  const orgEmails = new Set<string>();

  const orgAccounts: UnifiedSuperUserAccountItem[] = nodes.map((node) => {
    const canonicalId = `usr-org-${node.nodeId}`;
    orgNodeIds.add(canonicalId.toLowerCase());
    if (node.username) orgEmails.add(node.username.trim().toLowerCase());

    return {
      id: canonicalId,
      nodeId: node.nodeId,
      source: 'organizacion_ceo',
      schoolId,
      campusId: node.campusId,
      campusName: node.campusName || 'Plantel Central',
      category: node.category,
      subRole: node.subRole,
      roleLabel: node.customRoleLabel || node.roleTitle,
      fullName: getFullNameOfNode(node),
      firstName: node.firstName || '',
      paternalLastName: node.paternalLastName || '',
      maternalLastName: node.maternalLastName || '',
      username: node.username,
      passwordPreview:
        node.tempPasswordPreview ||
        (node.initialPasswordInvalidated ? 'Personalizada (Activa)' : 'ISkool2026!'),
      mustChangePassword: Boolean(node.mustChangePassword),
      isProvisioned: Boolean(node.isProvisioned),
      isBlocked: Boolean(node.isBlocked),
      permissions: node.permissions || getDefaultPermissionsForSubRole(node.subRole),
      monthlyBaseSalaryMxn: Number(node.monthlyBaseSalaryMxn) || 0,
      hourlyRateMxn: Number(node.hourlyRateMxn) || 0,
      slaHours: Number(node.slaHours) || 24,
      createdAt: node.createdAt,
      updatedAt: node.updatedAt,
    };
  });

  const nonOrgStaff: UnifiedSuperUserAccountItem[] = [];
  for (const s of staffUsers || []) {
    if (!s) continue;
    const staffSchoolId = normalizeOrgSchoolId(s.school_id);
    if (staffSchoolId !== schoolId) continue;
    const sId = String(s.id || '').trim().toLowerCase();
    const sEmail = String(s.email || '').trim().toLowerCase();
    if (sId.startsWith('usr-org-') || orgNodeIds.has(sId) || (sEmail && orgEmails.has(sEmail))) {
      continue;
    }

    const rawRole = String(s.role || 'coordinator').toLowerCase();
    const mappedSubRole: OrgNodeSubRole =
      rawRole === 'director'
        ? 'director_general'
        : rawRole === 'billing'
        ? 'finanzas'
        : rawRole === 'teacher'
        ? 'profesor'
        : 'coordinador';
    const mappedCategory =
      mappedSubRole === 'profesor' ? 'profesor' : 'administracion';
    const roleLabel =
      rawRole === 'director'
        ? 'Director General'
        : rawRole === 'billing'
        ? 'Finanzas / Caja'
        : rawRole === 'teacher'
        ? 'Profesor'
        : 'Coordinador / Control Escolar';

    const lastParts = String(s.last_name || '').trim().split(/\s+/).filter(Boolean);
    nonOrgStaff.push({
      id: String(s.id),
      source: 'directorio_staff',
      schoolId,
      campusName: s.campus_name || 'Plantel Central',
      category: mappedCategory,
      subRole: mappedSubRole,
      roleLabel,
      fullName: [s.first_name, s.last_name].filter(Boolean).join(' ') || roleLabel,
      firstName: s.first_name || '',
      paternalLastName: lastParts[0] || '',
      maternalLastName: lastParts.length > 1 ? lastParts.slice(1).join(' ') : '',
      username: s.email || '',
      passwordPreview: s.temporary_password || 'ISkool2026!',
      mustChangePassword: false,
      isProvisioned: true,
      isBlocked: Boolean(s.is_blocked),
      permissions: getDefaultPermissionsForSubRole(mappedSubRole),
      monthlyBaseSalaryMxn: 18500,
      hourlyRateMxn: 0,
      slaHours: 24,
      createdAt: s.created_at || new Date().toISOString(),
      updatedAt: s.updated_at || new Date().toISOString(),
    });
  }

  const orgAdminCount = nodes.filter((n) => n.category === 'administracion').length;
  const orgTeacherCount = nodes.filter((n) => n.category === 'profesor').length;
  const orgServicesCount = nodes.filter(
    (n) => n.category === 'intendencia_servicios' || n.category === 'otros'
  ).length;

  return {
    schoolId,
    orgTotalCount: nodes.length,
    orgAdminCount,
    orgTeacherCount,
    orgServicesCount,
    nonOrgStaffCount: nonOrgStaff.length,
    totalAccountsCount: nodes.length + nonOrgStaff.length,
    accounts: [...orgAccounts, ...nonOrgStaff],
  };
}
