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

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();
    const mode: VisualStudioMode = VALID_MODES.includes(body?.mode) ? body.mode : 'comunicado';
    const aspectRatio: VisualAspectRatio | undefined = VALID_RATIOS.includes(body?.aspectRatio)
      ? body.aspectRatio
      : undefined;

    const rawRefs = Array.isArray(body?.referenceImages) ? body.referenceImages.slice(0, 13) : [];
    const safeRefs = rawRefs
      .filter((r: any) => typeof r?.dataBase64 === 'string' && r.dataBase64.length <= MAX_REF_IMAGE_B64_CHARS)
      .map((r: any) => ({
        mimeType: typeof r.mimeType === 'string' ? r.mimeType : 'image/webp',
        dataBase64: r.dataBase64,
      }));

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
      previousWebpBase64:
        typeof body?.previousWebpBase64 === 'string' && body.previousWebpBase64.length <= MAX_REF_IMAGE_B64_CHARS
          ? body.previousWebpBase64
          : undefined,
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

