import { supabase } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/sessionToken';
import { verifyMultiTenantToken } from '@/lib/auth/multiTenantSession';

export interface AuthValidationResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    role?: string;
    school_id?: string;
    tenant_id?: 'iskool' | 'ibime';
    institution_metadata?: Record<string, any>;
    first_name?: string;
    last_name?: string;
  };
  error?: string;
}

/**
 * Validador perimetral de seguridad Zero-Trust para endpoints de API de ISkool e IBIME.
 * Verifica tokens criptográficos Bearer, Cookies HttpOnly seguras ('iskool_session', 'ibime_session'),
 * y bloquea de manera estricta ataques de Header Spoofing y fugas cross-tenant.
 */
export async function validateApiAuth(
  request: NextRequest,
  options?: { expectedTenant?: 'iskool' | 'ibime'; allowSuperAdminBypass?: boolean }
): Promise<AuthValidationResult> {
  try {
    // 1. Verificación de Cookies HttpOnly Seguras ('iskool_session' o 'ibime_session')
    const iskoolSessionCookie = request.cookies.get('iskool_session')?.value;
    const ibimeSessionCookie = request.cookies.get('ibime_session')?.value;
    const sessionCookie = (options?.expectedTenant === 'ibime')
      ? (ibimeSessionCookie || iskoolSessionCookie)
      : (iskoolSessionCookie || ibimeSessionCookie);

    if (sessionCookie) {
      const verifiedMt = await verifyMultiTenantToken(sessionCookie);
      const verifiedPayload = verifiedMt || await verifySessionToken(sessionCookie);
      if (verifiedPayload) {
        // Verificación de aislamiento hermético cross-tenant
        const userTenant = verifiedPayload.tenant_id || 'iskool';
        if (options?.expectedTenant && userTenant !== options.expectedTenant) {
          const isSuperUser = verifiedPayload.role === 'superadmin' || verifiedPayload.role === 'admin';
          if (!options.allowSuperAdminBypass || !isSuperUser) {
            return {
              authenticated: false,
              error: `Acceso denegado: El token pertenece a '${userTenant}' y no tiene autorización en '${options.expectedTenant}'.`
            };
          }
        }

        return {
          authenticated: true,
          user: {
            id: verifiedPayload.id,
            email: verifiedPayload.email,
            role: verifiedPayload.role,
            school_id: verifiedPayload.school_id,
            tenant_id: userTenant,
            institution_metadata: verifiedPayload.institution_metadata,
            first_name: verifiedPayload.first_name,
            last_name: verifiedPayload.last_name
          }
        };
      }
    }

    // 2. Verificación de Token Bearer (Authorization: Bearer <token>)
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && token !== 'undefined' && token !== 'null') {
        // A. Intentar verificar con HMAC token multi-tenant o de sesión
        const verifiedMt = await verifyMultiTenantToken(token);
        const verifiedPayload = verifiedMt || await verifySessionToken(token);
        if (verifiedPayload) {
          const userTenant = verifiedPayload.tenant_id || 'iskool';
          if (options?.expectedTenant && userTenant !== options.expectedTenant) {
            const isSuperUser = verifiedPayload.role === 'superadmin' || verifiedPayload.role === 'admin';
            if (!options.allowSuperAdminBypass || !isSuperUser) {
              return {
                authenticated: false,
                error: `Acceso denegado: El token pertenece a '${userTenant}' y no tiene autorización en '${options.expectedTenant}'.`
              };
            }
          }

          return {
            authenticated: true,
            user: {
              id: verifiedPayload.id,
              email: verifiedPayload.email,
              role: verifiedPayload.role,
              school_id: verifiedPayload.school_id,
              tenant_id: userTenant,
              institution_metadata: verifiedPayload.institution_metadata,
              first_name: verifiedPayload.first_name,
              last_name: verifiedPayload.last_name
            }
          };
        }

        // B. Intentar validar con Supabase Auth
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (!error && data?.user) {
            return {
              authenticated: true,
              user: {
                id: data.user.id,
                email: data.user.email,
                role: data.user.user_metadata?.role || data.user.role || 'authenticated',
                school_id: data.user.user_metadata?.school_id
              }
            };
          }
        } catch (supabaseErr) {
          // Continuar con otros métodos
        }
      }
    }

    // 3. Verificación de cookies estándar de Supabase Auth
    const sbTokenCookie = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value;
    if (sbTokenCookie) {
      try {
        const { data, error } = await supabase.auth.getUser(sbTokenCookie);
        if (!error && data?.user) {
          return {
            authenticated: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              role: data.user.user_metadata?.role || 'authenticated',
              school_id: data.user.user_metadata?.school_id
            }
          };
        }
      } catch (sbErr) {
        // Continuar
      }
    }

    // 4. Verificación de servicio interno: Solo permitido con firma de secreto interno (Zero-Trust)
    const internalSecret = request.headers.get('x-internal-secret');
    const validInternalSecret = process.env.INTERNAL_SERVICE_SECRET;
    const userIdHeader = request.headers.get('x-user-id');
    const userRoleHeader = request.headers.get('x-user-role');
    const schoolIdHeader = request.headers.get('x-school-id');

    if (userIdHeader && internalSecret && validInternalSecret && internalSecret === validInternalSecret) {
      return {
        authenticated: true,
        user: {
          id: userIdHeader,
          role: userRoleHeader || 'teacher',
          school_id: schoolIdHeader || undefined
        }
      };
    }

    // Si se inyectó x-user-id sin el secreto interno legítimo, se rechaza y registra advertencia de seguridad
    if (userIdHeader && (!internalSecret || internalSecret !== validInternalSecret)) {
      console.warn(`[Seguridad DevSecOps] Intento de inyección de encabezado x-user-id no autorizado desde IP.`);
    }

    return {
      authenticated: false,
      error: 'Sesión no válida o no autenticada. Se requiere Cookie HttpOnly segura o Token Bearer válido.'
    };
  } catch (err: any) {
    console.error('Error en validación de autenticación perimetral:', err);
    return {
      authenticated: false,
      error: 'Error interno validando autenticación.'
    };
  }
}
