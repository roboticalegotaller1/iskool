import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { signSessionToken } from '@/lib/sessionToken';
import { z } from 'zod';

const LoginSessionSchema = z.object({
  id: z.string().min(1, 'El ID de usuario es obligatorio'),
  email: z.string().email('Email inválido').optional().or(z.string()),
  role: z.string().min(1, 'El rol es obligatorio'),
  school_id: z.string().optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
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
    const body = await req.json().catch(() => null);
    const parsed = LoginSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Datos de sesión inválidos.' },
        { status: 400 }
      );
    }

    const { id, email, role, school_id, first_name, last_name } = parsed.data;

    // Generar token seguro firmado criptográficamente
    const sessionToken = await signSessionToken({
      id,
      email: email || undefined,
      role,
      school_id: school_id || undefined,
      first_name,
      last_name
    });

    const isProduction = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({
      success: true,
      user: { id, email, role, school_id, first_name, last_name }
    });

    // Inyectar Cookie Segura: HttpOnly, Secure (en prod o HTTPS), SameSite=Strict
    response.cookies.set({
      name: 'iskool_session',
      value: sessionToken,
      httpOnly: true,
      secure: isProduction || req.url.startsWith('https://'),
      sameSite: 'strict',
      path: '/',
      maxAge: 7 * 24 * 3600 // 7 días de validez
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Error estableciendo sesión segura.' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Sesión finalizada exitosamente.' });

  // Invalida y elimina inmediatamente la cookie HttpOnly
  response.cookies.set({
    name: 'iskool_session',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0
  });

  return response;
}
