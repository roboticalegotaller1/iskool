import { describe, it, expect } from 'vitest';
import { POST } from '../src/app/api/auth/session/route';
import { NextRequest } from 'next/server';

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/auth/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

describe('🔒 BLINDAJE QUIRÚRGICO DE SESIÓN (/api/auth/session)', () => {
  it('1. Debe permitir acceso legítimo a cuentas demo oficiales sin códigos molestos', async () => {
    const req = createMockRequest({
      user: {
        id: 'usr-teacher-1',
        email: 'israel.lopez@sandbox.iskool.edu.mx',
        role: 'teacher'
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe('teacher');
    expect(data.user.id).toBe('usr-teacher-1');
  });

  it('2. Debe permitir acceso a perfiles demo directivos de IBIME (02DJoUJSkwYQZjn)', async () => {
    const req = createMockRequest({
      user: {
        id: 'usr-dir-ibime-montes',
        email: 'directora.general@ibime.edu.mx'
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user.role).toBe('director');
    expect(data.user.school_id).toBe('sch-ibime');
    expect(data.user.tenant_id).toBe('ibime');
  });

  it('3. Debe RECHAZAR con 401 si un atacante intenta inyectar un usuario arbitrario con rol superadmin', async () => {
    const req = createMockRequest({
      user: {
        id: 'attacker-evil-id',
        email: 'hacker@malicious-site.com',
        role: 'superadmin'
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toContain('no autorizado');
  });

  it('4. Debe neutralizar intento de elevación de privilegios en cuenta demo: si un alumno intenta ponerse superadmin, se fuerza su rol student legítimo', async () => {
    const req = createMockRequest({
      user: {
        id: 'std-pa',
        email: 'lucas@iskool.edu.mx',
        role: 'superadmin' // Intento de inyección F12
      }
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    // El servidor asigna estrictamente el rol 'student' del catálogo canónico
    expect(data.user.role).toBe('student');
    expect(data.user.id).toBe('std-pa');
  });
});
