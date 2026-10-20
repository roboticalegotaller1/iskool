import { NextRequest, NextResponse } from 'next/server';
import {
  generateDraftWithRealTokens,
  searchSimilarDraftInVault,
  getDraftsFromVault,
  syncDraftsFromDatabase,
  WorkOsAiDraftRecord
} from '@/lib/services/workOsAiDraftVault.service';
import { EmailTriageTelemetryService } from '@/lib/services/emailTriageTelemetry.service';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/workos/draft
 * Consulta si ya existe en la Bóveda Curricular un borrador previo similar
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const tenantId = searchParams.get('tenantId') || 'e1000000-0000-0000-0000-000000000001';
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
    const body = await req.json();
    const subject = (body.subject || '').trim();
    const tenantId = body.tenantId || 'e1000000-0000-0000-0000-000000000001';
    const tone = body.tone || 'formal_empathetic';
    const audience = body.audience || 'parents';
    const whiteLabelShield = body.whiteLabelShield ?? true;
    const autoIncludeSignature = body.autoIncludeSignature ?? true;
    const forceRegenerate = body.forceRegenerate === true;

    if (!subject) {
      return NextResponse.json(
        { success: false, error: 'Se requiere un asunto o consulta para generar el borrador.' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({
      success: true,
      fromVault: false,
      draft: newDraft,
      tokensUsed: newDraft.tokensUsed,
      message: `Borrador generado con ${newDraft.tokensUsed.totalTokens} tokens reales y resguardado en la Bóveda Curricular.`
    });
  } catch (err: any) {
    console.error('Error en POST /api/admin/workos/draft:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Error al procesar borrador institucional' },
      { status: 500 }
    );
  }
}
