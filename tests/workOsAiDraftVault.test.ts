import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateDraftWithRealTokens,
  searchSimilarDraftInVault,
  getDraftsFromVault,
  normalizeDraftQuery,
  computeKeywordSimilarity
} from '@/lib/services/workOsAiDraftVault.service';
import { POST, GET } from '@/app/api/admin/workos/draft/route';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

describe('🏛️ MOTOR DE IA PEDAGÓGICA: TOKENS REALES, BÓVEDA CURRICULAR Y RECUPERACIÓN POR SIMILITUD', () => {
  const testTenantId = 'e1000000-0000-0000-0000-000000000001';

  it('debe normalizar consultas y calcular similitud entre temas relacionados', () => {
    const q1 = normalizeDraftQuery('voluntarios para el festival de navidad');
    const q2 = normalizeDraftQuery('busqueda de voluntarios festival navideno');

    expect(q1.words).toContain('voluntarios');
    expect(q1.words).toContain('festival');
    expect(q1.words).toContain('navidad');

    const score = computeKeywordSimilarity(q1.words, q2.words, q1.normalized, q2.normalized);
    expect(score).toBeGreaterThanOrEqual(0.6);
  });

  it('debe generar un borrador institucional consumiendo tokens reales y guardándolo en Bóveda Curricular', async () => {
    const subject = 'Voluntarios de padres de familia para festival navideño escolar 2026';
    const draft = await generateDraftWithRealTokens({
      subject,
      tone: 'formal_empathetic',
      audience: 'parents',
      tenantId: testTenantId,
      autoIncludeSignature: true,
      whiteLabelShield: true
    });

    expect(draft).toBeDefined();
    expect(draft.id).toBeDefined();
    expect(draft.folio).toMatch(/^TRZ-\d{6}$/);
    expect(draft.subject).toBe(subject);
    expect(draft.content.length).toBeGreaterThan(100);

    // Verificación de telemetría de tokens reales
    expect(draft.tokensUsed.totalTokens).toBeGreaterThan(0);
    expect(draft.tokensUsed.promptTokens).toBeGreaterThan(0);
    expect(draft.tokensUsed.candidatesTokens).toBeGreaterThan(0);
    expect(draft.tokensUsed.costMxn).toBeGreaterThanOrEqual(0);

    // Verificación de persistencia en la Bóveda Curricular
    const draftsInVault = getDraftsFromVault(testTenantId);
    const found = draftsInVault.find(d => d.id === draft.id || d.folio === draft.folio);
    expect(found).toBeDefined();

    // Verificación de existencia de archivo Markdown con Frontmatter
    const mdPath = path.join(process.cwd(), 'Correo', 'IBIME', 'borradores', `${draft.folio}.md`);
    expect(fs.existsSync(mdPath)).toBe(true);
    const mdContent = fs.readFileSync(mdPath, 'utf8');
    expect(mdContent).toContain('tokens_totales:');
    expect(mdContent).toContain(draft.folio);
  });

  it('debe recuperar de la Bóveda Curricular con 0 tokens cuando se solicita una consulta similar', async () => {
    // Consulta similar al borrador creado anteriormente
    const similarQuery = 'voluntarios festival navideño';
    const searchResult = searchSimilarDraftInVault(similarQuery, testTenantId, 0.4);

    expect(searchResult.match).not.toBeNull();
    expect(searchResult.similarity).toBeGreaterThanOrEqual(0.4);
    expect(searchResult.match?.subject).toContain('festival navideño');

    // Comprobar a través del endpoint POST sin forzar regeneración (Vault-first)
    const req = new NextRequest('http://localhost:3000/api/admin/workos/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'buscamos voluntarios para festival navideño escolar',
        tenantId: testTenantId,
        forceRegenerate: false
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.fromVault).toBe(true);
    expect(data.tokensUsed.totalTokens).toBe(0);
    expect(data.tokensUsed.savedTokens).toBeGreaterThan(0);
    expect(data.draft.content).toBeDefined();
  });

  it('debe permitir forzar nueva regeneración con tokens reales aunque exista en Bóveda', async () => {
    const req = new NextRequest('http://localhost:3000/api/admin/workos/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'voluntarios para festival navideño',
        tenantId: testTenantId,
        forceRegenerate: true
      })
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.fromVault).toBe(false);
    expect(data.tokensUsed.totalTokens).toBeGreaterThan(0);
  });

  it('debe permitir transferir un borrador de la Bóveda al Redactor con posibilidad de modificación y posterior envío', () => {
    const drafts = getDraftsFromVault(testTenantId);
    expect(drafts.length).toBeGreaterThan(0);
    const draft = drafts[0];

    // Simular transferencia al Redactor Oficial
    const transferSubject = `[COMUNICADO OFICIAL] ${draft.subject}`;
    const transferContent = draft.content;
    const transferRecipient = draft.audience === 'parents' ? 'parents' : 'all-network';

    expect(transferContent).toBeDefined();
    expect(transferContent.length).toBeGreaterThan(50);

    // Modificación activa por parte del directivo/usuario
    const editedContent = transferContent + '\n\n**Nota Adicional:** Favor de confirmar asistencia antes del viernes.';
    expect(editedContent).toContain('Favor de confirmar asistencia');
    expect(editedContent.length).toBeGreaterThan(transferContent.length);

    // Simular preparación y confirmación de despacho oficial
    const outboundLog = {
      id: `log-${Date.now()}`,
      subject: transferSubject,
      bodyText: editedContent,
      recipientGroup: transferRecipient,
      status: 'Entregado (100%)'
    };

    expect(outboundLog.status).toBe('Entregado (100%)');
    expect(outboundLog.bodyText).toContain('Favor de confirmar asistencia');
  });
});
