import { describe, it, expect } from 'vitest';
import {
  signMultiTenantToken,
  verifyMultiTenantToken
} from '@/lib/auth/multiTenantSession';
import { middleware } from '@/middleware';
import { NextRequest } from 'next/server';

describe('🎯 Verificación de Enrutamiento y Seeds de IBIME y Portales', () => {

  describe('1. Verificación de Acceso de Directores de IBIME a su Portal y Visión CEO', () => {
    it('debe permitir a Lic. Patricia Sandoval Morales (Directora General IBIME) acceder al portal IBIME', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-dir-ibime-montes',
        email: 'directora.general@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'director',
        school_id: 'sch-ibime',
        first_name: 'Patricia',
        last_name: 'Sandoval Morales'
      });

      const req = new NextRequest('http://localhost:3000/ibime/portal?view=ceo', {
        headers: {
          cookie: `ibime_session=${token}`
        }
      });

      const res = await middleware(req);
      // El middleware debe autorizar el acceso dentro del tenant IBIME
      expect(res.status).toBe(200);
      expect(res.headers.get('x-resolved-tenant')).toBe('ibime');
    });

    it('debe permitir a Lic. Carmen Delgado Ríos (Directora Lagos IBIME) acceder al portal IBIME en Visión CEO', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-dir-ibime-lagos',
        email: 'directora.lagos@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'director',
        school_id: 'sch-ibime',
        first_name: 'Carmen',
        last_name: 'Delgado Ríos'
      });

      const req = new NextRequest('http://localhost:3000/ibime/portal?view=ceo', {
        headers: {
          cookie: `ibime_session=${token}`
        }
      });

      const res = await middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-resolved-tenant')).toBe('ibime');
    });

    it('debe bloquear con 404 a directores de IBIME si intentan entrar al módulo general administrativo de iSkool (/admin)', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-dir-ibime-montes',
        email: 'directora.general@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'director',
        school_id: 'sch-ibime'
      });

      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: `ibime_session=${token}`
        }
      });

      const res = await middleware(req);
      // Blindaje de seguridad zero-trust: no debe acceder al módulo general
      expect(res.status).toBe(404);
    });
  });

  describe('2. Verificación de Acceso de Familias y Tutores (/parent)', () => {
    it('debe permitir a Familia Morales Peña (Tutor IBIME) acceder al portal de padres (/parent)', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-parent-ibime-01',
        email: 'familia.morales@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'parent',
        school_id: 'sch-ibime',
        first_name: 'Familia Morales',
        last_name: 'Peña'
      });

      const req = new NextRequest('http://localhost:3000/parent', {
        headers: {
          cookie: `ibime_session=${token}`
        }
      });

      const res = await middleware(req);
      // /parent es ruta de comunidad compartida accesible para tutores
      expect(res.status).toBe(200);
    });

    it('debe bloquear a las familias del acceso al módulo general de administración (/admin)', async () => {
      const token = await signMultiTenantToken({
        id: 'usr-parent-ibime-01',
        email: 'familia.morales@ibime.edu.mx',
        tenant_id: 'ibime',
        role: 'parent',
        school_id: 'sch-ibime'
      });

      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: `ibime_session=${token}`
        }
      });

      const res = await middleware(req);
      expect(res.status).toBe(404);
    });
  });
});
