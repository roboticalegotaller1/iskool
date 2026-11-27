import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  generateDraftWithRealTokens,
  searchSimilarDraftInVault,
  getDraftsFromVault,
  syncDraftsFromDatabase,
  WorkOsAiDraftRecord
} from '@/lib/services/workOsAiDraftVault.service';
import { EmailTriageTelemetryService } from '@/lib/services/emailTriageTelemetry.service';
import { validateApiAuth } from '@/lib/authValidator';
import { isSchoolTenantAllowed, resolveCanonicalUserSchoolKey } from '@/lib/security/tenantAccess';

export const dynamic = 'force-dynamic';

const WORKOS_EXECUTIVE_ROLES = new Set(['superadmin', 'ceo', 'owner', 'director', 'admin', 'coordinator']);

// Limitador de tasa acotado en memoria (30 req/min, máx 2,000 entradas)
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_RATE_LIMIT_ENTRIES = 2_000;
const draftRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkDraftRateLimit(clientKey: string): boolean {
  const now = Date.now();
  if (draftRateLimits.size > 500) {
    for (const [k, rec] of draftRateLimits.entries()) {
      if (now > rec.resetAt) {
        draftRateLimits.delete(k);
      }
    }
  }
  const existing = draftRateLimits.get(clientKey);
  if (!existing || now > existing.resetAt) {
    if (!existing && draftRateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = draftRateLimits.keys().next().value;
      if (oldestKey !== undefined) draftRateLimits.delete(oldestKey);
    }
    draftRateLimits.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  existing.count += 1;
  return true;
}

const WorkOsDraftPostSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(1, 'Se requiere un asunto o consulta para generar el borrador.')
    .max(300, 'El asunto excede el límite máximo permitido (300 caracteres).'),
  tenantId: z.string().max(100).optional(),
  tone: z
    .enum(['formal_empathetic', 'resolutive_concise', 'urgent_firm', 'pedagogic_close'])
    .optional()
    .default('formal_empathetic'),
  audience: z
    .enum(['parents', 'students', 'teachers', 'authorities'])
    .optional()
    .default('parents'),
  whiteLabelShield: z.boolean().optional().default(true),
  autoIncludeSignature: z.boolean().optional().default(true),
  forceRegenerate: z.boolean().optional().default(false)
});

/**
 * GET /api/admin/workos/draft
 * Consulta si ya existe en la Bóveda Curricular un borrador previo similar
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para consultar borradores institucionales.' },
        { status: 401 }
      );
    }
    const roleLower = (auth.user?.role || '').toLowerCase();
    if (auth.authenticated && !WORKOS_EXECUTIVE_ROLES.has(roleLower)) {
      return NextResponse.json(
        { success: false, error: 'Permisos directivos requeridos para consultar borradores.' },
        { status: 403 }
      );
    }

    const clientIp = (req.headers.get('x-forwarded-for') || auth.user?.id || 'local-client').split(',')[0].trim();
    if (!checkDraftRateLimit(`get:${clientIp}`)) {
      return NextResponse.json(
        { success: false, error: 'Límite de consultas de borradores por minuto excedido. Intenta en breve.' },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').slice(0, 300);
    const userTenant = resolveCanonicalUserSchoolKey(auth.user as any);
    const requestedTenant = (searchParams.get('tenantId') || userTenant || 'e1000000-0000-0000-0000-000000000001').slice(0, 100);
    if (
      auth.authenticated &&
      !isSchoolTenantAllowed(auth.user as any, requestedTenant)
    ) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: aislamiento multi-colegio activo.' },
        { status: 403 }
      );
    }
    const tenantId = requestedTenant;
    const listAll = searchParams.get('all') === 'true';

    if (listAll) {
      const all = await syncDraftsFromDatabase(tenantId);
      return NextResponse.json({
        success: true,
        total: all.length,
        drafts: all
      });
    }

    if (!q.trim()) {
      return NextResponse.json({
        success: true,
        found: false,
        match: null,
        similarity: 0,
        allMatches: []
      });
    }

    const result = searchSimilarDraftInVault(q, tenantId, 0.45);

    return NextResponse.json({
      success: true,
      found: !!result.match,
      match: result.match,
      similarity: result.similarity,
      allMatches: result.allMatches
    });
  } catch (err: any) {
    console.error('Error en GET /api/admin/workos/draft:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/workos/draft
 * Genera un borrador con tokens reales o recupera de la Bóveda Curricular si existe similitud
 */
export async function POST(req: NextRequest) {
  try {
    const auth = await validateApiAuth(req);
    if (!auth.authenticated && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'Autenticación requerida para generar borradores ejecutivos con IA.' },
        { status: 401 }
      );
    }
    const postRoleLower = (auth.user?.role || '').toLowerCase();
    if (auth.authenticated && !WORKOS_EXECUTIVE_ROLES.has(postRoleLower)) {
      return NextResponse.json(
        { success: false, error: 'Permisos directivos requeridos para generar borradores.' },
        { status: 403 }
      );
    }

    const clientIp = (req.headers.get('x-forwarded-for') || auth.user?.id || 'local-client').split(',')[0].trim();
    if (!checkDraftRateLimit(`post:${clientIp}`)) {
      return NextResponse.json(
        { success: false, error: 'Límite de generación de borradores por minuto excedido. Intenta en breve.' },
        { status: 429 }
      );
    }

    const rawBody = await req.json().catch(() => null);
    const parsed = WorkOsDraftPostSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || 'Parámetros de borrador inválidos.' },
        { status: 400 }
      );
    }

    const {
      subject,
      tenantId: bodyTenantId,
      tone,
      audience,
      whiteLabelShield,
      autoIncludeSignature,
      forceRegenerate
    } = parsed.data;

    const userTenant = resolveCanonicalUserSchoolKey(auth.user as any);
    const requestedTenant = bodyTenantId || userTenant || 'e1000000-0000-0000-0000-000000000001';
    if (
      auth.authenticated &&
      !isSchoolTenantAllowed(auth.user as any, requestedTenant)
    ) {
      return NextResponse.json(
        { success: false, error: 'Acceso denegado: aislamiento multi-colegio activo.' },
        { status: 403 }
      );
    }
    const tenantId = requestedTenant;

    // PASO 1: Consulta Prioritaria en Bóveda Curricular (Vault-First / Cache-First)
    // Solo si el usuario no solicita explícitamente forzar nueva generación con tokens reales
    if (!forceRegenerate) {
      const search = searchSimilarDraftInVault(subject, tenantId, 0.55);
      if (search.match) {
        const savedTokens = search.match.tokensUsed?.totalTokens || 420;
        EmailTriageTelemetryService.recordSavedTokens(savedTokens);

        return NextResponse.json({
          success: true,
          fromVault: true,
          draft: {
            ...search.match,
            fromVault: true
          },
          tokensUsed: {
            promptTokens: 0,
            candidatesTokens: 0,
            totalTokens: 0,
            savedTokens,
            costUsd: 0,
            costMxn: 0
          },
          message: 'Borrador pedagógico recuperado con éxito desde la Bóveda Curricular (0 tokens consumidos).'
        });
      }
    }

    // PASO 2: Generación con Tokens Reales en el Motor de Inteligencia Artificial Pedagógica
    const newDraft: WorkOsAiDraftRecord = await generateDraftWithRealTokens({
      subject,
      tone,
      audience,
      whiteLabelShield,
      autoIncludeSignature,
      tenantId,
      forceRegenerate
    });

    const isFallbackDraft = (newDraft.tokensUsed?.totalTokens || 0) === 0;

    return NextResponse.json({
      success: true,
      fromVault: false,
      draft: newDraft,
      tokensUsed: newDraft.tokensUsed,
      message: isFallbackDraft
        ? 'Borrador institucional de contingencia generado localmente (0 tokens consumidos).'
        : `Borrador generado con ${newDraft.tokensUsed.totalTokens} tokens reales y resguardado en la Bóveda Curricular.`
    });
  } catch (err: any) {
    console.error('Error en POST /api/admin/workos/draft:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error al procesar borrador institucional' },
      { status: 500 }
    );
  }
}
