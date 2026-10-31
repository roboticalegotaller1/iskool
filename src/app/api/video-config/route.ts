import { NextRequest, NextResponse } from 'next/server';
import {
  QrVideoConfigService,
  QR_VIDEO_PRESETS,
  extractYouTubeId
} from '@/lib/services/qrVideoConfigService';
import { validateApiAuth } from '@/lib/authValidator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VALID_ADMIN_KEYS = ['ISKOOL2026', 'DIR2026', 'ADMIN2026', 'iskool2026', 'dir2026'];

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
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
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
    const body = await req.json();
    const { youtubeUrl, title, subtitle, badgeText, autoplay, loop, adminKey } = body;

    // Permitir actualización con clave rápida de administración o sesión activa de directivo/administrador
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    const hasAdminSession =
      auth.authenticated &&
      auth.user &&
      ['admin', 'superadmin', 'director', 'owner', 'ceo', 'coordinator'].includes(
        (auth.user.role || '').toLowerCase()
      );
    const hasValidPin =
      typeof adminKey === 'string' && VALID_ADMIN_KEYS.includes(adminKey.trim());

    if (!hasAdminSession && !hasValidPin) {
      return NextResponse.json(
        {
          success: false,
          error: 'Clave de administración inválida. Usa la clave institucional (ej. ISKOOL2026 o DIR2026).'
        },
        { status: 403 }
      );
    }

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

