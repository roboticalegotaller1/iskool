import { supabase } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';
import { verifySessionToken } from '@/lib/sessionToken';

export interface AuthValidationResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    role?: string;
    school_id?: string;
    first_name?: string;
    last_name?: string;
  };
  error?: string;
}

/**
 * Validador perimetral de seguridad Zero-Trust para endpoints de API de ISkool.
 * Verifica tokens criptográficos Bearer, Cookies HttpOnly seguras ('iskool_session'),
 * y bloquea de manera estricta ataques de Header Spoofing (inyección de x-user-id no firmado).
 */
export async function validateApiAuth(request: NextRequest): Promise<AuthValidationResult> {
  try {
    // 1. Verificación de Cookie HttpOnly Segura ('iskool_session')
    const iskoolSessionCookie = request.cookies.get('iskool_session')?.value;
    if (iskoolSessionCookie) {
      const verifiedPayload = await verifySessionToken(iskoolSessionCookie);
      if (verifiedPayload) {
        return {
          authenticated: true,
          user: {
            id: verifiedPayload.id,
            email: verifiedPayload.email,
            role: verifiedPayload.role,
            school_id: verifiedPayload.school_id,
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
        // A. Intentar verificar con HMAC token propio
        const verifiedPayload = await verifySessionToken(token);
        if (verifiedPayload) {
          return {
            authenticated: true,
            user: {
              id: verifiedPayload.id,
              email: verifiedPayload.email,
              role: verifiedPayload.role,
              school_id: verifiedPayload.school_id,
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
