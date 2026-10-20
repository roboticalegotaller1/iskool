import { describe, it, expect } from 'vitest';
import {
  GOOGLE_LOGIN_SCOPES,
  GOOGLE_DIRECTOR_WORKSPACE_SCOPES,
  GOOGLE_RESTRICTED_READONLY_SCOPE,
  GoogleOAuthService
} from '@/lib/services/googleOAuthService';
import { signOAuthState, verifyOAuthState } from '@/lib/security/oauthState';
import {
  getDraftsFromVault,
  saveDraftToVault,
  WorkOsAiDraftRecord
} from '@/lib/services/workOsAiDraftVault.service';
import robots from '@/app/robots';

describe('🌐 MIGRACIÓN A APP.ISKOOL.MX Y VERIFICACIÓN DE GOOGLE AUTH', () => {
  describe('1. Separación Estricta de Scopes OAuth (Evitar Auditoría CASA Tier 2/3)', () => {
    it('el login normal debe solicitar ÚNICAMENTE openid, email y profile', () => {
      expect(GOOGLE_LOGIN_SCOPES).toEqual(['openid', 'email', 'profile']);

      const authUrl = GoogleOAuthService.getLoginAuthUrl('https://iskool.mx', 'dummy-state');
      const url = new URL(authUrl);

      const scopes = (url.searchParams.get('scope') || '').split(' ');
      expect(scopes).toContain('openid');
      expect(scopes).toContain('email');
      expect(scopes).toContain('profile');

      // Verificación crítica: NUNCA debe contener gmail ni calendar en login general
      expect(scopes).not.toContain('https://www.googleapis.com/auth/gmail.readonly');
      expect(scopes).not.toContain('https://www.googleapis.com/auth/gmail.send');
      expect(scopes).not.toContain('https://www.googleapis.com/auth/calendar.events');
    });

    it('la conexión directiva de correo debe solicitar autorización incremental (gmail.send y calendar.events)', () => {
      const connectUrl = GoogleOAuthService.getWorkspaceConnectUrl('https://iskool.mx', 'dummy-state');
      const url = new URL(connectUrl);

      const scopes = (url.searchParams.get('scope') || '').split(' ');
      expect(scopes).toContain('openid');
      expect(scopes).toContain('email');
      expect(scopes).toContain('profile');
      expect(scopes).toContain('https://www.googleapis.com/auth/gmail.send');
      expect(scopes).toContain('https://www.googleapis.com/auth/calendar.events');

      // Por defecto no debe incluir gmail.readonly para no requerir auditoría CASA
      expect(scopes).not.toContain(GOOGLE_RESTRICTED_READONLY_SCOPE);
    });

    it('debe firmar criptográficamente el state tanto en login como en connect', () => {
      const signedLoginState = signOAuthState({ flow: 'login', tenantId: 'sch-ibime', redirect: '/teacher' });
      const verifiedLogin = verifyOAuthState(signedLoginState);
      expect(verifiedLogin.valid).toBe(true);
      expect(verifiedLogin.payload?.flow).toBe('login');
      expect(verifiedLogin.payload?.tenantId).toBe('sch-ibime');
      expect(verifiedLogin.payload?.redirect).toBe('/teacher');

      const signedConnectState = signOAuthState({ flow: 'workspace_connect', tenantId: 'sch-default', email: 'director@iskool.mx' });
      const verifiedConnect = verifyOAuthState(signedConnectState);
      expect(verifiedConnect.valid).toBe(true);
      expect(verifiedConnect.payload?.flow).toBe('workspace_connect');
      expect(verifiedConnect.payload?.email).toBe('director@iskool.mx');
    });
  });

  describe('2. Directivas SEO y noindex para app.iskool.mx', () => {
    it('debe generar directivas robots.ts desindexando las rutas privadas de la aplicación', () => {
      const robotsConfig = robots();
      expect(robotsConfig).toBeDefined();
      expect(robotsConfig.rules).toBeDefined();

      const rules = Array.isArray(robotsConfig.rules) ? robotsConfig.rules : [robotsConfig.rules];
      const starRule = rules.find((r: any) => r.userAgent === '*');
      expect(starRule).toBeDefined();

      const disallowed = Array.isArray(starRule?.disallow) ? starRule?.disallow : [starRule?.disallow];
      expect(disallowed).toContain('/student');
      expect(disallowed).toContain('/teacher');
      expect(disallowed).toContain('/admin');
      expect(disallowed).toContain('/login');

      const allowed = Array.isArray(starRule?.allow) ? starRule?.allow : [starRule?.allow];
      expect(allowed).toContain('/privacidad');
      expect(allowed).toContain('/terminos');
    });
  });

  describe('3. Persistencia Serverless de workOsAiDraftVault (AWS Amplify)', () => {
    it('debe almacenar y recuperar borradores en memoria sin depender exclusivamente de disco', () => {
      const testTenant = 'e1000000-0000-0000-0000-000000000001';
      const sampleDraft: WorkOsAiDraftRecord = {
        id: `DRAFT-TEST-${Date.now()}`,
        folio: `TRZ-999${Math.floor(100 + Math.random() * 900)}`,
        subject: 'Prueba de Resguardo Serverless en Bóveda Curricular',
        normalizedSubject: 'prueba de resguardo serverless en boveda curricular',
        keywords: ['prueba', 'resguardo', 'serverless', 'boveda'],
        tone: 'formal_empathetic',
        toneLabel: 'Formal y Empático',
        audience: 'teachers',
        audienceLabel: 'Cuerpo Docente',
        whiteLabelShield: true,
        autoIncludeSignature: true,
        content: 'Contenido oficial de prueba resguardado.',
        tokensUsed: {
          promptTokens: 100,
          candidatesTokens: 150,
          totalTokens: 250,
          costUsd: 0.0001,
          costMxn: 0.002
        },
        model: 'Motor de Inteligencia Artificial Pedagógica',
        fromVault: false,
        createdAt: new Date().toISOString(),
        tenantId: testTenant
      };

      const saved = saveDraftToVault(sampleDraft);
      expect(saved).toBe(true);

      const drafts = getDraftsFromVault(testTenant);
      expect(drafts.length).toBeGreaterThan(0);
      const retrieved = drafts.find(d => d.id === sampleDraft.id || d.folio === sampleDraft.folio);
      expect(retrieved).toBeDefined();
      expect(retrieved?.subject).toBe(sampleDraft.subject);
    });
  });
});
