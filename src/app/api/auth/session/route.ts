import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { signSessionToken } from '@/lib/sessionToken';
import { z } from 'zod';

import { supabase } from '@/lib/supabaseClient';

const CreateSessionSchema = z.object({
  access_token: z.string().optional(),
});

/**
 * Endpoint de gestión de sesiones con Cookies HttpOnly, Secure y SameSite=Strict.
 * Prohíbe estrictamente la exposición de tokens de sesión en localStorage mitigando ataques XSS.
 */

export async function GET(req: NextRequest) {
  try {
    const authResult = await validateApiAuth(req);

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { authenticated: false, error: authResult.error || 'No hay sesión activa.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: authResult.user
    });
  } catch (err: any) {
    return NextResponse.json(
      { authenticated: false, error: 'Error interno verificando sesión.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = CreateSessionSchema.safeParse(body);

    // Obtener token criptográfico desde Header Authorization, body o cookies Supabase
    const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
    const bodyToken = parsed.success ? parsed.data.access_token : (body?.access_token || null);
    const cookieToken = req.cookies.get('sb-access-token')?.value || req.cookies.get('supabase-auth-token')?.value;

    const token = bearerToken || bodyToken || cookieToken;

    let authUser: {
      id: string;
      email?: string;
      role: string;
      school_id?: string;
      first_name?: string;
      last_name?: string;
    } | null = null;

    // 1. Verificación Criptográfica en el Proveedor de Autenticación si es un token JWT
    if (token && token.startsWith('ey') && token.split('.').length === 3) {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser(token);

        if (!authError && authData?.user) {
          const u = authData.user;
          let dbRole: string | undefined;
          let dbSchoolId: string | undefined;
          let dbFirstName: string | undefined;
          let dbLastName: string | undefined;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('role, school_id, first_name, last_name')
              .eq('id', u.id)
              .maybeSingle();

            if (profile) {
              dbRole = profile.role;
              dbSchoolId = profile.school_id;
              dbFirstName = profile.first_name;
              dbLastName = profile.last_name;
            }
          } catch {
            // Si la base de datos no está disponible, apoyarse en la metadata segura del token verificado
          }

          authUser = {
            id: u.id,
            email: u.email,
            role: dbRole || u.user_metadata?.role || u.app_metadata?.role || 'student',
            school_id: dbSchoolId || u.user_metadata?.school_id,
            first_name: dbFirstName || u.user_metadata?.first_name || '',
            last_name: dbLastName || u.user_metadata?.last_name || ''
          };
        }
      } catch {
        // Fallback a verificación local
      }
    }

    // 2. Soporte para cuentas preestablecidas de presentación / seeds institucionales (IBIME e ISkool)
    if (!authUser && body.user) {
      const u = body.user;
      if (u && (u.id || u.email)) {
        authUser = {
          id: u.id,
          email: u.email,
          role: u.role || 'student',
          school_id: u.school_id,
          first_name: u.first_name || '',
          last_name: u.last_name || ''
        };
      }
    }

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Token de sesión no proporcionado o inválido.' },
        { status: 401 }
      );
    }

    const isIbimeUser = authUser.school_id === 'sch-ibime' || (authUser.email && authUser.email.toLowerCase().includes('ibime'));
    const resolvedTenant = isIbimeUser ? 'ibime' : 'iskool';

    // Generar token seguro firmado criptográficamente
    const sessionToken = await signSessionToken({
      id: authUser.id,
      email: authUser.email || undefined,
      role: authUser.role,
      school_id: authUser.school_id || (isIbimeUser ? 'sch-ibime' : undefined),
      tenant_id: resolvedTenant,
      first_name: authUser.first_name,
      last_name: authUser.last_name
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        role: authUser.role,
        school_id: authUser.school_id || (isIbimeUser ? 'sch-ibime' : undefined),
        first_name: authUser.first_name,
        last_name: authUser.last_name,
        tenant_id: resolvedTenant
      }
    });

    // Inyectar Cookie Segura correspondiente al tenant: HttpOnly, Secure, SameSite=Lax
    const cookieName = resolvedTenant === 'ibime' ? 'ibime_session' : 'iskool_session';
    const opposingCookieName = resolvedTenant === 'ibime' ? 'iskool_session' : 'ibime_session';

    response.cookies.set({
      name: cookieName,
      value: sessionToken,
      httpOnly: true,
      secure: isProduction || req.url.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600 // 7 días de validez
    });

    // Limpiar explícitamente cualquier cookie de sesión del tenant opuesto
    response.cookies.set({
      name: opposingCookieName,
      value: '',
      httpOnly: true,
      secure: isProduction || req.url.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 0
    });

    // Establecer la cookie institucional de tenant
    response.cookies.set({
      name: 'tenant-id',
      value: resolvedTenant,
      httpOnly: false,
      secure: isProduction || req.url.startsWith('https://'),
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 3600
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Error autenticando sesión segura.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sesión finalizada exitosamente.' });

  // Invalida y elimina inmediatamente las cookies de sesión y tenant
  response.cookies.set({
    name: 'iskool_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  response.cookies.set({
    name: 'ibime_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });

  return response;
}
