import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import {
  QrVideoConfigService,
  QR_VIDEO_PRESETS,
  extractYouTubeId
} from '@/lib/services/qrVideoConfigService';
import { validateApiAuth } from '@/lib/authValidator';
import { isPlatformSuperUser } from '@/types';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function timingSafeSecretEqual(expected: string, supplied: string): boolean {
  const expectedBuf = Buffer.from(expected, 'utf8');
  const suppliedBuf = Buffer.from(supplied, 'utf8');
  if (expectedBuf.length !== suppliedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, suppliedBuf);
}

export async function GET() {
  try {
    const config = QrVideoConfigService.getConfig();
    return NextResponse.json(
      {
        success: true,
        permanentQrUrl: 'https://iskool.mx/video',
        config,
        presets: QR_VIDEO_PRESETS
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=300'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al obtener la configuración del vídeo QR.'
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Solo Super Usuario de plataforma (no demo) o clave administrativa de servidor validada en tiempo constante
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    const isDemoUser = Boolean(
      auth.authenticated &&
      auth.user &&
      isDemoSandboxContext({
        email: auth.user.email,
        schoolId: auth.user.school_id,
        userId: auth.user.id,
        tenantId: auth.user.tenant_id,
      })
    );
    const hasSuperUserSession = Boolean(
      auth.authenticated &&
      auth.user &&
      !isDemoUser &&
      isPlatformSuperUser(auth.user as any)
    );

    const serverPin = process.env.VIDEO_ADMIN_KEY?.trim() || '';
    const headerKey = (req.headers.get('x-video-admin-key') || '').trim();
    let hasValidPin = Boolean(
      serverPin.length >= 8 &&
      headerKey.length > 0 &&
      timingSafeSecretEqual(serverPin, headerKey)
    );

    if (!hasSuperUserSession && !hasValidPin && serverPin.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado. Se requiere sesión de Super Usuario o clave administrativa válida para actualizar la configuración de vídeo.'
        },
        { status: auth.authenticated ? 403 : 401 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!hasSuperUserSession && !hasValidPin) {
      const bodyPin = typeof body?.adminKey === 'string' ? body.adminKey.trim() : '';
      hasValidPin = Boolean(
        serverPin.length >= 8 &&
        bodyPin.length > 0 &&
        timingSafeSecretEqual(serverPin, bodyPin)
      );
    }

    if (!hasSuperUserSession && !hasValidPin) {
      return NextResponse.json(
        {
          success: false,
          error: 'No autorizado. Se requiere sesión de Super Usuario o clave administrativa válida para actualizar la configuración de vídeo.'
        },
        { status: auth.authenticated ? 403 : 401 }
      );
    }

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        {
          success: false,
          error: 'Cuerpo JSON inválido.'
        },
        { status: 400 }
      );
    }

    const { youtubeUrl, title, subtitle, badgeText, autoplay, loop } = body;

    const extractedId = extractYouTubeId(youtubeUrl || '');
    if (!extractedId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'El enlace de YouTube proporcionado no es válido. Pega una URL como https://www.youtube.com/watch?v=... o https://youtu.be/...'
        },
        { status: 400 }
      );
    }

    const updated = QrVideoConfigService.updateConfig({
      youtubeInput: youtubeUrl,
      youtubeId: extractedId,
      title,
      subtitle,
      badgeText,
      autoplay,
      loop
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Vídeo actualizado correctamente. La URL https://iskool.mx/video y el código QR permanecen intactos.',
        permanentQrUrl: 'https://iskool.mx/video',
        config: updated
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
        }
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Error al actualizar el vídeo del código QR.'
      },
      { status: 500 }
    );
  }
}

