import { supabase } from '@/lib/supabaseClient';
import { NextRequest } from 'next/server';

export interface AuthValidationResult {
  authenticated: boolean;
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
  error?: string;
}

/**
 * Valida la sesión del usuario (Auth) en endpoints de API de Next.js.
 * Verifica tokens Bearer de Supabase, cookies de sesión o encabezados autorizados.
 */
export async function validateApiAuth(request: NextRequest): Promise<AuthValidationResult> {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && token !== 'undefined' && token !== 'null') {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          return {
            authenticated: true,
            user: {
              id: data.user.id,
              email: data.user.email,
              role: data.user.user_metadata?.role || data.user.role || 'authenticated'
            }
          };
        }
      }
    }

    // Verificación de encabezados de sesión específicos de ISkool
    const userIdHeader = request.headers.get('x-user-id');
    const userRoleHeader = request.headers.get('x-user-role');
    if (userIdHeader) {
      return {
        authenticated: true,
        user: {
          id: userIdHeader,
          role: userRoleHeader || 'teacher'
        }
      };
    }

    // Verificación de cookies de sesión de Supabase
    const authCookie = request.cookies.get('sb-access-token')?.value || request.cookies.get('supabase-auth-token')?.value;
    if (authCookie) {
      const { data, error } = await supabase.auth.getUser(authCookie);
      if (!error && data?.user) {
        return {
          authenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role || 'authenticated'
          }
        };
      }
    }

    // Entorno de desarrollo local sin configuración activa de Supabase
    const hasSupabaseConfig = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL.trim() !== '');
    if (!hasSupabaseConfig && process.env.NODE_ENV !== 'production') {
      return {
        authenticated: true,
        user: {
          id: 'dev-local-user',
          role: 'teacher'
        }
      };
    }

    return {
      authenticated: false,
      error: 'Sesión no válida o no autenticada. Se requiere token Bearer o sesión activa de Supabase.'
    };
  } catch (err: any) {
    console.error('Error en validación de autenticación de API:', err);
    return {
      authenticated: false,
      error: 'Error interno validando autenticación.'
    };
  }
}
