import { isPlatformSuperUser } from '@/types';

export interface TenantScopedUser {
  id?: string;
  email?: string;
  role?: string;
  school_id?: string | null;
  tenant_id?: string | null;
  institution_metadata?: {
    tenant_uuid?: string | null;
    [key: string]: unknown;
  } | null;
}

/**
 * Alias canónicos permitidos exclusivamente para el plantel institucional IBIME.
 */
export const IBIME_TENANT_ALIASES = new Set([
  'sch-ibime',
  'e1000000-0000-0000-0000-000000000001',
  'ibime',
]);

const PUBLIC_WEBMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'iskool.mx',
  'iskool.edu.mx',
]);

function normalizeKey(value?: string | null): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

/**
 * Resuelve la clave canónica de plantel escolar del usuario autenticado,
 * priorizando `school_id` específico sobre `tenant_id` macro ('iskool' | 'ibime').
 * Normaliza cualquier alias institucional de IBIME hacia `'sch-ibime'`.
 */
export function resolveCanonicalUserSchoolKey(user?: TenantScopedUser | null): string {
  if (!user) return '';

  const schoolIdRaw = typeof user.school_id === 'string' ? user.school_id.trim() : '';
  const schoolIdNorm = schoolIdRaw.toLowerCase();
  if (schoolIdNorm) {
    if (IBIME_TENANT_ALIASES.has(schoolIdNorm)) return 'sch-ibime';
    return schoolIdRaw;
  }

  const tenantUuidRaw =
    typeof user.institution_metadata?.tenant_uuid === 'string'
      ? user.institution_metadata.tenant_uuid.trim()
      : '';
  const tenantUuidNorm = tenantUuidRaw.toLowerCase();
  if (tenantUuidNorm) {
    if (IBIME_TENANT_ALIASES.has(tenantUuidNorm)) return 'sch-ibime';
    return tenantUuidRaw;
  }

  const tenantIdRaw = typeof user.tenant_id === 'string' ? user.tenant_id.trim() : '';
  const tenantIdNorm = tenantIdRaw.toLowerCase();
  if (tenantIdNorm) {
    if (IBIME_TENANT_ALIASES.has(tenantIdNorm)) return 'sch-ibime';
    return tenantIdRaw;
  }

  return '';
}

/**
 * Evalúa con aislamiento estricto (Anti-BOLA / Anti-IDOR) si el usuario autenticado
 * tiene permiso para acceder o mutar recursos del `requestedTenantId` solicitado.
 */
export function isSchoolTenantAllowed(
  user: TenantScopedUser | null | undefined,
  requestedTenantId?: string | null
): boolean {
  if (isPlatformSuperUser(user as any)) return true;

  const requestedNorm = normalizeKey(requestedTenantId);
  if (!requestedNorm) return true;
  if (!user) return false;

  const userSchoolNorm = normalizeKey(user.school_id);
  const userTenantUuidNorm = normalizeKey(user.institution_metadata?.tenant_uuid);
  const userTenantNorm = normalizeKey(user.tenant_id);

  const userIsIbime =
    IBIME_TENANT_ALIASES.has(userSchoolNorm) ||
    IBIME_TENANT_ALIASES.has(userTenantUuidNorm) ||
    IBIME_TENANT_ALIASES.has(userTenantNorm);

  if (userIsIbime && IBIME_TENANT_ALIASES.has(requestedNorm)) {
    return true;
  }

  if (userSchoolNorm) {
    if (requestedNorm === userSchoolNorm) return true;
    if (userTenantUuidNorm && requestedNorm === userTenantUuidNorm) return true;
    return false;
  }

  if (userTenantUuidNorm) {
    return requestedNorm === userTenantUuidNorm;
  }

  if (userTenantNorm) {
    return requestedNorm === userTenantNorm;
  }

  return false;
}

/**
 * Verifica que una cuenta de correo objetivo pertenezca al usuario autenticado
 * o a su plantel escolar autorizado (excepto Super Usuario de plataforma).
 */
export function isMailboxAuthorizedForUser(
  user: TenantScopedUser | null | undefined,
  candidateEmail?: string | null
): boolean {
  if (isPlatformSuperUser(user as any)) return true;
  const targetClean = normalizeKey(candidateEmail);
  if (!targetClean) return true;
  if (!user) return false;

  const userEmailClean = normalizeKey(user.email);
  if (userEmailClean && targetClean === userEmailClean) {
    return true;
  }

  const userRole = normalizeKey(user.role);
  const isExecutiveRole =
    userRole === 'director' || userRole === 'ceo' || userRole === 'owner';

  const canonicalSchool = resolveCanonicalUserSchoolKey(user);
  const defaultExecutiveMailbox = normalizeKey(process.env.DEFAULT_EXECUTIVE_MAILBOX);

  if (canonicalSchool === 'sch-ibime' && isExecutiveRole) {
    if (targetClean.endsWith('@ibime.edu.mx')) return true;
    if (defaultExecutiveMailbox && targetClean === defaultExecutiveMailbox) return true;
    if (targetClean === 'roboticalegotaller1@gmail.com') return true;
  }

  if (isExecutiveRole && userEmailClean.includes('@') && targetClean.includes('@')) {
    const userDomain = userEmailClean.split('@')[1];
    const targetDomain = targetClean.split('@')[1];
    if (
      userDomain &&
      targetDomain &&
      userDomain === targetDomain &&
      !PUBLIC_WEBMAIL_DOMAINS.has(userDomain)
    ) {
      return true;
    }
  }

  return false;
}
