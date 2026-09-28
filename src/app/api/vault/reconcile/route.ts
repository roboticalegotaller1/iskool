import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { InstitutionalMemoryReconcileService } from '@/lib/institutionalMemory';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Comparación segura de tiempo constante para prevenir ataques de temporización (timing attacks).
 */
export function timingSafeTokenCheck(provided: string, expected: string): boolean {
  if (!provided || !expected || typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }
  const bufProvided = Buffer.from(provided);
  const bufExpected = Buffer.from(expected);

  if (bufProvided.length !== bufExpected.length) {
    crypto.timingSafeEqual(bufProvided, bufProvided);
    return false;
  }

  return crypto.timingSafeEqual(bufProvided, bufExpected);
}

/**
 * Valida la autenticación para la reconciliación segura de la Bóveda Curricular.
 */
function validateReconcileSecurity(request: NextRequest): { authorized: boolean; reason?: string } {
  const syncTokenHeader = request.headers.get('x-vault-sync-token') || '';
  const authHeader = request.headers.get('authorization') || '';
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';

  const configuredSecret =
    process.env.VAULT_SYNC_TOKEN ||
    process.env.RAILS_INGESTION_SECRET ||
    process.env.INTERNAL_API_SECRET ||
    process.env.CRON_SECRET;

  if (configuredSecret) {
    if (
      (syncTokenHeader && timingSafeTokenCheck(syncTokenHeader, configuredSecret)) ||
      (bearerToken && timingSafeTokenCheck(bearerToken, configuredSecret))
    ) {
      return { authorized: true };
    }
    return { authorized: false, reason: 'Token de sincronización inválido' };
  }

  // En entorno local de desarrollo sin secreto configurado
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[Reconciliador GitOps]: Sin VAULT_SYNC_TOKEN configurado; admitiendo petición en modo desarrollo local.');
    return { authorized: true };
  }

  return { authorized: false, reason: 'Sin secreto de sincronización configurado en producción' };
}

/**
 * POST /api/vault/reconcile
 * Ejecuta la reconciliación GitOps entre el manifest de Almacenamiento en la Nube y el Repositorio Central.
 */
export async function POST(request: NextRequest) {
  try {
    const security = validateReconcileSecurity(request);
    if (!security.authorized) {
      return NextResponse.json(
        { error: 'No autorizado', reason: security.reason || 'Token de sincronización inválido o ausente' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const branch = typeof body?.branch === 'string' ? body.branch : undefined;
    const dryRun = Boolean(body?.dryRun);
    const delayMs = typeof body?.delayMs === 'number' ? body.delayMs : undefined;

    const result = await InstitutionalMemoryReconcileService.reconcileGitOpsMemories({
      branch,
      dryRun,
      delayMs
    });

    return NextResponse.json(
      {
        success: result.success,
        message: result.success
          ? 'Reconciliación GitOps de Memoria Institucional completada con éxito'
          : 'Reconciliación GitOps completada con incidencias',
        telemetry: result
      },
      { status: result.success ? 200 : 207 }
    );
  } catch (error: any) {
    console.error('Error en POST /api/vault/reconcile:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al reconciliar memorias institucionales' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/vault/reconcile
 * Verificación diagnóstica o ejecución en modo simulación (dry-run)
 */
export async function GET(request: NextRequest) {
  try {
    const security = validateReconcileSecurity(request);
    if (!security.authorized) {
      return NextResponse.json(
        { error: 'No autorizado', reason: security.reason || 'Token de sincronización inválido' },
        { status: 401 }
      );
    }

    const result = await InstitutionalMemoryReconcileService.reconcileGitOpsMemories({
      dryRun: true
    });

    return NextResponse.json({
      success: true,
      mode: 'dryRun',
      telemetry: result
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error en diagnóstico de reconciliación' },
      { status: 500 }
    );
  }
}
