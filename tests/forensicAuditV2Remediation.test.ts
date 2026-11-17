// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { GET as getAuthSession } from '@/app/api/auth/session/route';
import { GET as getVideoConfig, POST as postVideoConfig } from '@/app/api/video-config/route';
import { getSecuritySecret } from '@/lib/security/secretManager';
import { sanitizeSafeFilename } from '@/lib/institutionalMemory/memoryService';
import {
  SIMULATORS_DIRECTORY,
  requiresExternalWindowLaunch,
} from '@/data/simulatorsDirectory';
import { getSchoolLeads } from '@/store/useCrmStore';
import { CRM_LEADS_SEED } from '@/store/seeds/crmSeeds';
import {
  HISTORICAL_FIGURES_PRESET_CATALOG,
  buildDynamicHistoricalFigureData,
} from '@/data/mexicanIndependenceStudioFlow';
import { StandardPaymentGatewayService } from '@/lib/paymentGatewayService';

const ALLOWED_FRAME_SRC_HOSTS = new Set([
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'phet.colorado.edu',
  'www.walter-fendt.de',
  'www.ophysics.com',
  'www.falstad.com',
  'www.myphysicslab.com',
  'www.physicsclassroom.com',
  'www.geogebra.org',
  'www.desmos.com',
  'graspablemath.com',
  'visualgo.net',
  'demonstrations.wolfram.com',
  'toytheater.com',
  'www.mathopenref.com',
  'embed.molview.org',
  'ptable.com',
  'chemcollective.org',
  'www.rcsb.org',
  'learn.genetics.utah.edu',
  'stellarium-web.org',
  'www.solarsystemscope.com',
  'earth.nullschool.net',
  'wokwi.com',
  'makecode.microbit.org',
  'arcade.makecode.com',
  'snap.berkeley.edu',
  'trinket.io',
  'musiclab.chromeexperiments.com',
  'www.chronas.org',
  'www.gapminder.org',
  'www.beepbox.co',
]);

describe('Remediación Forense Integral v2 (Seguridad, Canon, Multi-Tenant y Enlaces)', () => {
  it('1. Rechaza cookies/tokens forjados seed-session-* en validateApiAuth y /api/auth/session', async () => {
    const forgedReq = new NextRequest('http://localhost:3000/api/auth/session', {
      headers: {
        cookie: 'iskool_session=seed-session-superadmin-fake; ibime_session=seed-session-ceo-fake',
        authorization: 'Bearer seed-session-forged-token',
      },
    });

    const auth = await validateApiAuth(forgedReq);
    expect(auth.authenticated).toBe(false);

    const res = await getAuthSession(forgedReq);
    const data = await res.json();
    expect(data.authenticated).toBe(false);
    expect(data.user).toBeNull();
  });

  it('2. Mantiene aislamiento de dominio criptográfico en secretManager y bloquea entorno browser', () => {
    const sessionSecret = getSecuritySecret('SESSION_SECRET');
    const tokenSecret = getSecuritySecret('TOKEN_ENCRYPTION_SECRET');
    const oauthSecret = getSecuritySecret('OAUTH_SECRET');

    expect(sessionSecret.length).toBeGreaterThanOrEqual(32);
    expect(tokenSecret.length).toBeGreaterThanOrEqual(32);
    expect(oauthSecret.length).toBeGreaterThanOrEqual(32);

    expect(sessionSecret).not.toBe(tokenSecret);
    expect(sessionSecret).not.toBe(oauthSecret);
    expect(tokenSecret).not.toBe(oauthSecret);

    // Simular entorno navegador para verificar defensa CWE-321
    (globalThis as any).window = {};
    try {
      expect(() => getSecuritySecret('SESSION_SECRET')).toThrow();
    } finally {
      delete (globalThis as any).window;
    }
  });

  it('3. Sanitiza rutas contra path traversal en memoryService', () => {
    const sanitized = sanitizeSafeFilename('../../etc/passwd/../evil.md');
    expect(sanitized).not.toContain('..');
    expect(sanitized).not.toContain('/');
    expect(sanitized).not.toContain('\\');
    expect(sanitized).toMatch(/^[a-zA-Z0-9_-]+$/);
  });

  it('4. Protege /api/video-config fail-closed (401) sin exponer secretos', async () => {
    const prevKey = process.env.VIDEO_ADMIN_KEY;
    delete process.env.VIDEO_ADMIN_KEY;
    try {
      const unauthPost = new NextRequest('http://localhost:3000/api/video-config', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          youtubeUrl: 'https://www.youtube.com/watch?v=25cq1V8AsTg',
          adminKey: 'iskool2026',
        }),
      });

      const postRes = await postVideoConfig(unauthPost);
      expect(postRes.status).toBe(401);

      const getRes = await getVideoConfig();
      expect(getRes.status).toBe(200);
      const getBody = await getRes.text();
      expect(getBody).not.toContain('adminKey');
      expect(getBody).not.toContain('VIDEO_ADMIN_KEY');
    } finally {
      if (prevKey !== undefined) {
        process.env.VIDEO_ADMIN_KEY = prevKey;
      }
    }
  });

  it('5. Valida los 50 simuladores STEM con HTTPS, política frame-src/external-window y Marca Blanca', () => {
    expect(SIMULATORS_DIRECTORY.length).toBe(50);

    for (const sim of SIMULATORS_DIRECTORY) {
      expect(sim.embedUrl.startsWith('https://')).toBe(true);
      expect(`${sim.name} ${sim.organization} ${sim.description}`).not.toMatch(/\bMicrosoft\b/i);

      const host = new URL(sim.embedUrl).hostname.toLowerCase();
      const isAllowedFrameHost = ALLOWED_FRAME_SRC_HOSTS.has(host);
      const isExternalWindow =
        sim.embedMode === 'external-window' || requiresExternalWindowLaunch(sim.embedUrl);

      expect(isAllowedFrameHost || isExternalWindow).toBe(true);
    }
  });

  it('6. Garantiza aislamiento hermético en getSchoolLeads ante tenant vacío o ajeno', () => {
    expect(CRM_LEADS_SEED.length).toBeGreaterThan(0);
    const leaked = getSchoolLeads(CRM_LEADS_SEED, 'sch-empty-tenant');
    expect(leaked).toEqual([]);
  });

  it('7. Valida 1ª persona estricta y contenido propio en los 14 personajes históricos de Bóveda', () => {
    const hidalgoFirstMomentId = HISTORICAL_FIGURES_PRESET_CATALOG[0]?.moments?.[0]?.id;
    expect(hidalgoFirstMomentId).toBe('hid-m1');

    const vaultNames = [
      'Cuauhtémoc',
      'Lázaro Cárdenas del Río',
      'Ignacio Allende',
      'Francisco I. Madero',
      'Felipe Ángeles',
      'Carmen Serdán Alatriste',
      'Aquiles Serdán',
      'Belisario Domínguez',
      'Ricardo Flores Magón',
      'Guadalupe Victoria',
      'Andrés Quintana Roo',
      'José Guadalupe Posada',
      'Plutarco Elías Calles',
      'Gustavo Díaz Ordaz',
    ];

    for (const name of vaultNames) {
      const figure = buildDynamicHistoricalFigureData(name);
      expect(figure.shortBio).not.toMatch(/^Como\s+/i);
      expect(figure.moments.length).toBeGreaterThanOrEqual(2);
      expect(figure.keyLocations.length).toBeGreaterThanOrEqual(2);
      expect(figure.verificationQuestions.length).toBeGreaterThanOrEqual(2);
      expect(figure.moments[0].id).not.toBe(hidalgoFirstMomentId);
    }
  });

  it('8. Emite CLABE SPEI numérica válida de 18 dígitos con dígito verificador Banxico mod-10', async () => {
    const gw = StandardPaymentGatewayService.getInstance();
    const charge = await gw.createCharge({
      invoiceId: 'inv-test-001',
      invoiceNumber: 'FAC-TEST-001',
      amount: 4500,
      currency: 'MXN',
      concept: 'Colegiatura Mensual',
      customer: {
        id: 'cust-test-001',
        name: 'Padre Demo',
        email: 'tutor@iskool.mx',
      },
    });

    expect(charge.speiClabe).toMatch(/^\d{18}$/);
    const weights = [3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7, 1, 3, 7];
    const weightedSum = charge.speiClabe!
      .slice(0, 17)
      .split('')
      .reduce((acc, digit, idx) => acc + ((Number(digit) * weights[idx]) % 10), 0);
    const expectedCheckDigit = (10 - (weightedSum % 10)) % 10;
    expect(Number(charge.speiClabe![17])).toBe(expectedCheckDigit);
  });
});
