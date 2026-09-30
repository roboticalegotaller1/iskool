import { z } from 'zod';

/**
 * ============================================================================
 * MOTOR CRIPTOGRÁFICO DE SESIÓN Y TOKENS MULTI-TENANT (iSkool Core & IBIME)
 * Arquitectura de Seguridad Zero-Trust con Aislamiento Hermético
 * ============================================================================
 */

export type TenantId = 'iskool' | 'ibime';

export type MultiTenantRole =
  | 'superadmin'
  | 'admin'
  | 'owner'
  | 'director'
  | 'coordinator'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'billing';

export interface InstitutionBranding {
  schoolName: string;
  logoUrl?: string;
  primaryColorHex: string;
  themePreset?: string;
}

export interface InstitutionFeatureFlags {
  pedagogicalAi: boolean;
  curricularVault: boolean;
  interactiveCanvas: boolean;
  gamificationStore: boolean;
  officialKardexSep: boolean;
  financialBilling: boolean;
  [key: string]: boolean;
}

export interface InstitutionMetadata {
  branding: InstitutionBranding;
  authorized_api_keys: string[];
  feature_flags: InstitutionFeatureFlags;
}

export interface MultiTenantSessionPayload {
  id: string; // Identificador universal de usuario (UUID)
  email: string;
  tenant_id: TenantId;
  role: MultiTenantRole;
  school_id: string;
  first_name?: string;
  last_name?: string;
  institution_metadata: InstitutionMetadata;
  iss: string; // Emisor canónico: 'iskool-identity-authority'
  aud: string; // Audiencia canónica: 'iskool-ecosystem'
  iat: number; // Emitido en (timestamp UNIX segundos)
  exp: number; // Expira en (timestamp UNIX segundos)
  jti?: string; // Token ID único para prevención de replay attacks
}

// ============================================================================
// METADATOS INSTITUCIONALES POR DEFECTO (CONFIGURACIÓN HERMÉTICA)
// ============================================================================

export const DEFAULT_ISKOOL_METADATA: InstitutionMetadata = {
  branding: {
    schoolName: 'iSkool Ecosistema Educativo',
    logoUrl: '/brand/iskool_logo.webp',
    primaryColorHex: '#2563EB',
    themePreset: 'sapphire'
  },
  authorized_api_keys: [
    'isk_live_core_7f9a12c8b3e4',
    'isk_dev_studio_99182374ab10'
  ],
  feature_flags: {
    pedagogicalAi: true,
    curricularVault: true,
    interactiveCanvas: true,
    gamificationStore: true,
    officialKardexSep: false,
    financialBilling: true
  }
};

export const DEFAULT_IBIME_METADATA: InstitutionMetadata = {
  branding: {
    schoolName: 'IBIME Instituto Bicultural',
    logoUrl: '/brand/ibime_logo.webp',
    primaryColorHex: '#047857',
    themePreset: 'emerald'
  },
  authorized_api_keys: [
    'ibime_live_sis_44a98b11ce20',
    'ibime_sync_gateway_01928374fb'
  ],
  feature_flags: {
    pedagogicalAi: false,
    curricularVault: false,
    interactiveCanvas: false,
    gamificationStore: false,
    officialKardexSep: true,
    financialBilling: true
  }
};

export function getDefaultMetadataForTenant(tenantId: TenantId): InstitutionMetadata {
  return tenantId === 'ibime'
    ? JSON.parse(JSON.stringify(DEFAULT_IBIME_METADATA))
    : JSON.parse(JSON.stringify(DEFAULT_ISKOOL_METADATA));
}

// ============================================================================
// ESQUEMAS DE VALIDACIÓN ZOD (PARSEO ESTRICTO)
// ============================================================================

export const MultiTenantPayloadSchema = z.object({
  id: z.string().min(1, 'El ID de usuario es obligatorio'),
  email: z.string().email('Email institucional inválido'),
  tenant_id: z.enum(['iskool', 'ibime'], {
    message: "El tenant_id debe ser estrictamente 'iskool' o 'ibime'"
  }),
  role: z.enum([
    'superadmin',
    'admin',
    'owner',
    'director',
    'coordinator',
    'teacher',
    'student',
    'parent',
    'billing'
  ]),
  school_id: z.string().min(1, 'El school_id es obligatorio'),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  institution_metadata: z.object({
    branding: z.object({
      schoolName: z.string(),
      logoUrl: z.string().optional(),
      primaryColorHex: z.string(),
      themePreset: z.string().optional()
    }),
    authorized_api_keys: z.array(z.string()),
    feature_flags: z.record(z.string(), z.boolean())
  }),
  iss: z.string(),
  aud: z.string(),
  iat: z.number().int(),
  exp: z.number().int(),
  jti: z.string().optional()
});

// ============================================================================
// CRIPTOGRAFÍA WEB CON HMAC-SHA256 (EDGE / NODE COMPATIBLE)
// ============================================================================

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET || process.env.SUPABASE_JWT_SECRET || 'e7b4c91a02f83d6520b174ac5d893e214fa0c6791b84e3d5029a1f7c8b36d0e4';
  return secret;
}

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const bin = atob(base64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return globalThis.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Genera un token JWT multi-tenant firmado criptográficamente con HMAC-SHA256.
 * Incluye obligatoriamente tenant_id, role, school_id e institution_metadata.
 */
export async function signMultiTenantToken(
  params: {
    id: string;
    email: string;
    tenant_id: TenantId;
    role: MultiTenantRole;
    school_id?: string;
    first_name?: string;
    last_name?: string;
    institution_metadata?: Partial<InstitutionMetadata>;
  },
  expiresInSeconds: number = 7 * 24 * 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const defaultMeta = getDefaultMetadataForTenant(params.tenant_id);

  const mergedMetadata: InstitutionMetadata = {
    branding: {
      ...defaultMeta.branding,
      ...(params.institution_metadata?.branding || {})
    },
    authorized_api_keys: [
      ...defaultMeta.authorized_api_keys,
      ...(params.institution_metadata?.authorized_api_keys || [])
    ],
    feature_flags: {
      ...defaultMeta.feature_flags,
      ...(params.institution_metadata?.feature_flags || {})
    }
  };

  const payload: MultiTenantSessionPayload = {
    id: params.id,
    email: params.email,
    tenant_id: params.tenant_id,
    role: params.role,
    school_id: params.school_id || (params.tenant_id === 'ibime' ? 'sch-ibime-central' : 'sch-iskool-default'),
    first_name: params.first_name,
    last_name: params.last_name,
    institution_metadata: mergedMetadata,
    iss: 'iskool-identity-authority',
    aud: 'iskool-ecosystem',
    iat: now,
    exp: now + expiresInSeconds,
    jti: globalThis.crypto.randomUUID()
  };

  const enc = new TextEncoder();
  const payloadEncoded = toBase64Url(enc.encode(JSON.stringify(payload)));
  const key = await getCryptoKey(getSessionSecret());
  const signatureBytes = await globalThis.crypto.subtle.sign(
    'HMAC',
    key,
    enc.encode(payloadEncoded)
  );
  const signature = toBase64Url(new Uint8Array(signatureBytes));

  return `${payloadEncoded}.${signature}`;
}

/**
 * Valida la firma criptográfica, la estructura y la vigencia temporal de un token multi-tenant.
 * Si se especifica `expectedTenant`, verifica que coincida estrictamente, previniendo fuga cross-tenant.
 */
export async function verifyMultiTenantToken(
  token: string,
  options?: { expectedTenant?: TenantId; allowSuperAdminBypass?: boolean }
): Promise<MultiTenantSessionPayload | null> {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [payloadEncoded, signature] = parts;

  try {
    const enc = new TextEncoder();
    const dec = new TextDecoder();
    const key = await getCryptoKey(getSessionSecret());
    const signatureBytes = fromBase64Url(signature);

    const isValid = await globalThis.crypto.subtle.verify(
      'HMAC',
      key,
      signatureBytes as unknown as BufferSource,
      enc.encode(payloadEncoded)
    );

    if (!isValid) return null;

    const payloadJson = dec.decode(fromBase64Url(payloadEncoded));
    const rawPayload = JSON.parse(payloadJson);

    // Validación estricta con Zod
    const parsed = MultiTenantPayloadSchema.safeParse(rawPayload);
    if (!parsed.success) {
      return null;
    }

    const payload = parsed.data as unknown as MultiTenantSessionPayload;

    // Verificar vigencia temporal
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    // Aislamiento Hermético de Tenant:
    if (options?.expectedTenant) {
      const isSuperUser = payload.role === 'superadmin';
      if (payload.tenant_id !== options.expectedTenant) {
        if (!options.allowSuperAdminBypass || !isSuperUser) {
          return null; // Rechazar por violación de frontera multi-tenant
        }
      }
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Resuelve el Tenant esperado a partir de subdominio, headers o ruta.
 * Ejemplos:
 *  - ibime.iskool.mx -> 'ibime'
 *  - ibime.localhost:3000 -> 'ibime'
 *  - Header x-tenant-id: 'ibime' -> 'ibime'
 *  - Default fallback -> 'iskool'
 */
export function resolveTenantFromHostOrHeader(params: {
  host?: string | null;
  headerTenantId?: string | null;
  pathname?: string | null;
}): TenantId {
  // 1. Header explícito de pasarela/API
  if (params.headerTenantId) {
    const cleanHeader = params.headerTenantId.trim().toLowerCase();
    if (cleanHeader === 'ibime') return 'ibime';
    if (cleanHeader === 'iskool') return 'iskool';
  }

  // 2. Ruta con prefijo institucional explícito
  if (params.pathname) {
    if (params.pathname.startsWith('/ibime') || params.pathname.startsWith('/api/v1/ibime')) {
      return 'ibime';
    }
  }

  // 3. Resolución por subdominio en cabecera Host / X-Forwarded-Host
  if (params.host) {
    const cleanHost = params.host.toLowerCase().split(':')[0]; // Remover puerto si existe
    if (cleanHost.startsWith('ibime.') || cleanHost.includes('ibime')) {
      return 'ibime';
    }
  }

  return 'iskool';
}
