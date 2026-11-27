import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import {
  InstitutionalVisualStudioService,
  InstitutionalVisualRequest,
  VisualAspectRatio,
  VisualStudioMode,
} from '@/lib/services/institutionalVisualStudio.service';
import { sanitizeCommercialTrademarks } from '@/utils/timeZoneUtils';

export const runtime = 'nodejs';

const VALID_MODES: VisualStudioMode[] = ['comunicado', 'pase_audiencia', 'infografia_ejecutiva'];
const VALID_RATIOS: VisualAspectRatio[] = ['4:5', '16:9', '1:1', '3:4'];
const MAX_REF_IMAGE_B64_CHARS = 750_000; // ~550 KB post-compresión cliente (Regla No Negociable 3)
const MAX_AGGREGATE_B64_CHARS = 3_500_000; // Tope agregado <= 3.5 MB entre todas las referencias + imagen previa
const ALLOWED_VISUAL_MIMES = new Set(['image/webp', 'image/jpeg', 'image/png']);

// Limitador de tasa por IP acotado en memoria (15 req/min, máx 2,000 entradas con barrido de expirados)
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_RATE_LIMIT_ENTRIES = 2_000;
const visualStudioRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkVisualStudioRateLimit(clientKey: string): boolean {
  const now = Date.now();
  if (visualStudioRateLimits.size > 500) {
    for (const [k, rec] of visualStudioRateLimits.entries()) {
      if (now > rec.resetAt) {
        visualStudioRateLimits.delete(k);
      }
    }
  }
  const existing = visualStudioRateLimits.get(clientKey);
  if (!existing || now > existing.resetAt) {
    if (!existing && visualStudioRateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = visualStudioRateLimits.keys().next().value;
      if (oldestKey !== undefined) visualStudioRateLimits.delete(oldestKey);
    }
    visualStudioRateLimits.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  existing.count += 1;
  return true;
}

function extractDeclaredMime(explicitMime: unknown, dataBase64: string): string {
  const dataPrefixMatch = dataBase64.match(/^data:([^;]+);base64,/i);
  if (dataPrefixMatch && dataPrefixMatch[1]) {
    return dataPrefixMatch[1].trim().toLowerCase();
  }
  if (typeof explicitMime === 'string' && explicitMime.trim()) {
    return explicitMime.trim().toLowerCase();
  }
  return 'image/webp';
}

export async function POST(req: NextRequest) {
  try {
    const ipHeader = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'local-client';
    const clientIp = ipHeader.split(',')[0].trim();
    if (!checkVisualStudioRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Límite de generación visual por minuto alcanzado. Intente nuevamente en breve.' },
        { status: 429 }
      );
    }

    const auth = await validateApiAuth(req);
    const isTest = process.env.NODE_ENV === 'test';

    if (!auth.authenticated && !isTest) {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para acceder al Estudio Gráfico Institucional IA.' },
        { status: 401 }
      );
    }

    if (auth.authenticated && auth.user) {
      const allowedRoles = ['admin', 'superadmin', 'director', 'coordinator', 'billing', 'owner', 'ceo', 'teacher'];
      const userRole = (auth.user.role || '').toLowerCase();
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { success: false, error: 'Su perfil no cuenta con permisos para sintetizar piezas gráficas oficiales.' },
          { status: 403 }
        );
      }
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Solicitud JSON inválida para el Estudio Gráfico Institucional.' },
        { status: 400 }
      );
    }

    const mode: VisualStudioMode = VALID_MODES.includes(body?.mode) ? body.mode : 'comunicado';
    const aspectRatio: VisualAspectRatio | undefined = VALID_RATIOS.includes(body?.aspectRatio)
      ? body.aspectRatio
      : undefined;

    // Validar MIME whitelist (image/webp, image/jpeg, image/png; SVG prohibido) y tope agregado <= 3.5 MB
    let aggregateBase64Length = 0;

    let safePreviousWebpBase64: string | undefined = undefined;
    if (typeof body?.previousWebpBase64 === 'string' && body.previousWebpBase64.length > 0) {
      const prevMime = extractDeclaredMime('image/webp', body.previousWebpBase64);
      if (!ALLOWED_VISUAL_MIMES.has(prevMime)) {
        return NextResponse.json(
          { success: false, error: 'Formato de imagen previa no permitido. Solo se aceptan WebP, JPEG o PNG.' },
          { status: 400 }
        );
      }
      if (body.previousWebpBase64.length > MAX_REF_IMAGE_B64_CHARS) {
        return NextResponse.json(
          { success: false, error: 'La imagen previa supera el tamaño máximo permitido por activo.' },
          { status: 413 }
        );
      }
      aggregateBase64Length += body.previousWebpBase64.length;
      safePreviousWebpBase64 = body.previousWebpBase64;
    }

    const rawRefs = Array.isArray(body?.referenceImages) ? body.referenceImages.slice(0, 13) : [];
    const safeRefs: Array<{ mimeType: string; dataBase64: string }> = [];

    for (const r of rawRefs) {
      if (typeof r?.dataBase64 !== 'string' || r.dataBase64.length === 0) continue;

      const resolvedMime = extractDeclaredMime(r?.mimeType, r.dataBase64);
      if (!ALLOWED_VISUAL_MIMES.has(resolvedMime)) {
        return NextResponse.json(
          { success: false, error: 'Formato de imagen de referencia no permitido. Solo se aceptan WebP, JPEG o PNG (SVG prohibido).' },
          { status: 400 }
        );
      }

      if (r.dataBase64.length > MAX_REF_IMAGE_B64_CHARS) {
        return NextResponse.json(
          { success: false, error: 'Una de las imágenes de referencia excede el límite permitido tras compresión.' },
          { status: 413 }
        );
      }

      aggregateBase64Length += r.dataBase64.length;
      if (aggregateBase64Length > MAX_AGGREGATE_B64_CHARS) {
        return NextResponse.json(
          { success: false, error: 'La carga agregada de imágenes supera el límite máximo permitido de 3.5 MB.' },
          { status: 413 }
        );
      }

      safeRefs.push({
        mimeType: resolvedMime,
        dataBase64: r.dataBase64,
      });
    }

    const visualRequest: InstitutionalVisualRequest = {
      mode,
      tenantId: String(body?.tenantId || 'ibime').slice(0, 48),
      schoolName: sanitizeCommercialTrademarks(String(body?.schoolName || 'Instituto Bilingüe IBIME').slice(0, 96)),
      directorTitle: body?.directorTitle ? sanitizeCommercialTrademarks(String(body.directorTitle).slice(0, 80)) : undefined,
      campusName: body?.campusName ? sanitizeCommercialTrademarks(String(body.campusName).slice(0, 80)) : undefined,
      primaryColor: typeof body?.primaryColor === 'string' ? body.primaryColor.slice(0, 32) : undefined,
      accentColor: typeof body?.accentColor === 'string' ? body.accentColor.slice(0, 32) : undefined,
      aspectRatio,
      subject: body?.subject ? sanitizeCommercialTrademarks(String(body.subject).slice(0, 180)) : undefined,
      bodyText: body?.bodyText ? sanitizeCommercialTrademarks(String(body.bodyText).slice(0, 4000)) : undefined,
      audienceLabel: body?.audienceLabel ? sanitizeCommercialTrademarks(String(body.audienceLabel).slice(0, 96)) : undefined,
      matterCode: body?.matterCode ? String(body.matterCode).slice(0, 48) : undefined,
      attendeeName: body?.attendeeName ? sanitizeCommercialTrademarks(String(body.attendeeName).slice(0, 96)) : undefined,
      appointmentDateText: body?.appointmentDateText ? sanitizeCommercialTrademarks(String(body.appointmentDateText).slice(0, 96)) : undefined,
      normativeRef: body?.normativeRef ? sanitizeCommercialTrademarks(String(body.normativeRef).slice(0, 140)) : undefined,
      metrics: body?.metrics && typeof body.metrics === 'object'
        ? {
            totalCount: Number(body.metrics.totalCount) || 0,
            ceoCount: Number(body.metrics.ceoCount) || 0,
            delegatedCount: Number(body.metrics.delegatedCount) || 0,
            infoCount: Number(body.metrics.infoCount) || 0,
            spamCount: Number(body.metrics.spamCount) || 0,
            sepCount: Number(body.metrics.sepCount) || 0,
            primaryUrgentTitle: body.metrics.primaryUrgentTitle
              ? sanitizeCommercialTrademarks(String(body.metrics.primaryUrgentTitle).slice(0, 140))
              : undefined,
          }
        : undefined,
      refinementInstruction: body?.refinementInstruction
        ? sanitizeCommercialTrademarks(String(body.refinementInstruction).slice(0, 500))
        : undefined,
      previousInteractionId: typeof body?.previousInteractionId === 'string' ? body.previousInteractionId.slice(0, 160) : undefined,
      previousWebpBase64: safePreviousWebpBase64,
      referenceImages: safeRefs,
    };

    const previousTurnCount = Math.max(0, Math.min(50, Number(body?.previousTurnCount) || 0));
    const result = await InstitutionalVisualStudioService.synthesizeVisualAsset(visualRequest, previousTurnCount);

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    console.error('[API /api/mail/visual-studio] Error:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'No fue posible sintetizar el activo visual en este momento. Intente nuevamente.',
      },
      { status: 500 }
    );
  }
}

