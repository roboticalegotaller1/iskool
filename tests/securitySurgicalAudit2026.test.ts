import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';

vi.mock('@/lib/authValidator', () => ({
  validateApiAuth: vi.fn(),
}));

describe('Auditoría Quirúrgica de Seguridad 2026 — Aislamiento Multi-Tenant, RBAC y Anti-SSRF', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('VULN-SEC-01: /api/inbox/matters bloquea a roles no directivos (403) y bloquea IDOR cross-school (403)', async () => {
    const { GET } = await import('@/app/api/inbox/matters/route');

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'stu-1', role: 'student', school_id: 'sch-a' } as any,
    });
    const resStudent = await GET(new NextRequest('http://localhost:3000/api/inbox/matters?schoolId=sch-a'));
    expect(resStudent.status).toBe(403);

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a' } as any,
    });
    const resCrossTenant = await GET(new NextRequest('http://localhost:3000/api/inbox/matters?schoolId=sch-b'));
    expect(resCrossTenant.status).toBe(403);
  });

  it('VULN-SEC-02: /api/admin/workos/draft bloquea a estudiantes (403) y bloquea consulta cross-tenant (403)', async () => {
    const { GET, POST } = await import('@/app/api/admin/workos/draft/route');

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'stu-1', role: 'student', school_id: 'sch-a' } as any,
    });
    const resStudent = await GET(new NextRequest('http://localhost:3000/api/admin/workos/draft?all=true'));
    expect(resStudent.status).toBe(403);

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a', tenant_id: 'sch-a' } as any,
    });
    const resCrossPost = await POST(
      new NextRequest('http://localhost:3000/api/admin/workos/draft', {
        method: 'POST',
        body: JSON.stringify({ subject: 'Aviso', tenantId: 'sch-b' }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(resCrossPost.status).toBe(403);
  });

  it('VULN-SEC-03 & SSRF: /api/mail/raw-inbox bloquea IDOR cross-tenant en GET/DELETE y bloquea host IMAP interno (SSRF)', async () => {
    const { GET, POST, DELETE } = await import('@/app/api/mail/raw-inbox/route');

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a' } as any,
    });
    const resGetCross = await GET(new NextRequest('http://localhost:3000/api/mail/raw-inbox?tenantId=sch-b'));
    expect(resGetCross.status).toBe(403);

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a' } as any,
    });
    const resDelCross = await DELETE(
      new NextRequest('http://localhost:3000/api/mail/raw-inbox?tenantId=sch-b&id=msg-1', { method: 'DELETE' })
    );
    expect(resDelCross.status).toBe(403);

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a', email: 'dir@school-a.mx' } as any,
    });
    const resSsrf = await POST(
      new NextRequest('http://localhost:3000/api/mail/raw-inbox', {
        method: 'POST',
        body: JSON.stringify({
          tenantId: 'sch-a',
          email: 'dir@school-a.mx',
          password: 'app-password-test',
          host: '169.254.169.254',
          port: 993,
          force: true,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
    );
    expect(resSsrf.status).toBe(403);
  });

  it('VULN-SEC-04: /api/mail/settings bloquea bypass por subcadena (substring) para directivo de otro colegio', async () => {
    const { GET } = await import('@/app/api/mail/settings/route');

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', tenant_id: 'sch-1', school_id: 'sch-1' } as any,
    });
    // 'sch-10' contiene la subcadena 'sch-1', pero es otro tenant distinto
    const resSubstring = await GET(new NextRequest('http://localhost:3000/api/mail/settings?tenantId=sch-10'));
    expect(resSubstring.status).toBe(403);
  });

  it('VULN-SEC-05: /api/integrations/google bloquea cross-school y /api/mail/inbound bloquea cross-tenant', async () => {
    const googleRoute = await import('@/app/api/integrations/google/route');
    const inboundRoute = await import('@/app/api/mail/inbound/route');

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a' } as any,
    });
    const resGoogle = await googleRoute.GET(new NextRequest('http://localhost:3000/api/integrations/google?schoolId=sch-b'));
    expect(resGoogle.status).toBe(403);

    vi.mocked(validateApiAuth).mockResolvedValueOnce({
      authenticated: true,
      user: { id: 'dir-1', role: 'director', school_id: 'sch-a' } as any,
    });
    const resInbound = await inboundRoute.GET(new NextRequest('http://localhost:3000/api/mail/inbound?tenantId=sch-b'));
    expect(resInbound.status).toBe(403);
  });
});
