import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { OrganizationServerService } from '@/lib/services/organizationService';

const RotatePasswordSchema = z.object({
  username: z.string().min(2).max(160),
  currentPassword: z.string().min(4).max(128),
  newPassword: z.string().min(8).max(128),
});

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' };

const rotationAttemptTracker = new Map<string, { count: number; resetAtMs: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rotationAttemptTracker.size > 500) {
    for (const [k, v] of rotationAttemptTracker) {
      if (v.resetAtMs <= now) rotationAttemptTracker.delete(k);
    }
  }
  const entry = rotationAttemptTracker.get(ip);
  if (!entry || entry.resetAtMs <= now) {
    rotationAttemptTracker.set(ip, { count: 1, resetAtMs: now + 60_000 });
    return true;
  }
  entry.count += 1;
  return entry.count <= 25;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = (
      req.headers.get('x-forwarded-for') ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'
    )
      .split(',')[0]
      .trim();

    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Demasiados intentos. Espere un minuto.' },
        { status: 429, headers: NO_STORE_HEADERS }
      );
    }

    const raw = await req.json().catch(() => ({}));
    const parsed = RotatePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Verifique su usuario y asegúrese de que la nueva contraseña tenga al menos 8 caracteres.',
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { username, currentPassword, newPassword } = parsed.data;
    const result = OrganizationServerService.rotateUserPasswordOnServer(
      username,
      currentPassword,
      newPassword
    );

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error || 'No se pudo actualizar la contraseña.' },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        username: result.node?.username,
        initialPasswordInvalidated: true,
      },
      { headers: NO_STORE_HEADERS }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Error al rotar contraseña inicial.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

