import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';
import { signMultiTenantToken } from '@/lib/auth/multiTenantSession';
import { CurriculumFederationService } from '@/lib/curriculum/curriculumFederationService';
import { UserAuditContext, CreateOrExtendPlanInput } from '@/lib/curriculum/types';
import { getTokensForTenant } from '@/lib/branding/tenantThemeTokens';

describe('🛡️ E2E INTEGRATION TEST: Aislamiento Hermético de iSkool e IBIME', () => {

  const ibimeTeacherContext: UserAuditContext = {
    user_id: 'usr-ibime-prof-e2e',
    name: 'Prof. Gabriela Morales',
    email: 'gaby.morales@ibime.edu.mx',
    role: 'teacher',
    tenant_id: 'ibime',
    institution_cct: '09PPR1492Z'
  };

  beforeEach(() => {
    CurriculumFederationService.initialize();
  });

  describe('1. Login de Usuario IBIME e Identidad Gráfica Soberana', () => {
    it('debe acceder exclusivamente a recursos e identidad de IBIME sin mezclar con iSkool', async () => {
      // 1. Generar token legítimo de docente de IBIME
      const ibimeToken = await signMultiTenantToken({
        id: ibimeTeacherContext.user_id,
        email: ibimeTeacherContext.email,
        tenant_id: 'ibime',
        role: 'teacher',
        school_id: 'sch-ibime-central',
        first_name: 'Gabriela',
        last_name: 'Morales'
      });

      // 2. Simular petición al portal de IBIME
      const req = new NextRequest('http://ibime.localhost:3000/ibime/portal', {
        headers: {
          host: 'ibime.localhost:3000',
          cookie: `ibime_session=${ibimeToken}`
        }
      });

      const res = await middleware(req);

      // Verificaciones perimetrales
      expect(res.status).toBe(200);
      expect(res.headers.get('x-resolved-tenant-id')).toBe('ibime');
      expect(res.headers.get('x-frame-options')).toBe('DENY');

      // Verificar que los tokens gráficos correspondan a IBIME
      const tokens = getTokensForTenant('ibime');
      expect(tokens.schoolName).toBe('Instituto Bicultural IBIME');
      expect(tokens.primaryColorHex).toBe('#047857');
      expect(tokens.badgeText).toBe('IBIME Bicultural Hub');
    });
  });

  describe('2. Intento de Acceso Cruzado (Cross-Tenant Denial)', () => {
    it('debe retornar HTTP 403 Forbidden al intentar acceder a datos internos de iSkool con token de IBIME', async () => {
      // 1. Token de docente de IBIME
      const ibimeToken = await signMultiTenantToken({
        id: ibimeTeacherContext.user_id,
        email: ibimeTeacherContext.email,
        tenant_id: 'ibime',
        role: 'teacher'
      });

      // 2. Intento de invocar API interna de iSkool con header de tenant iSkool
      const req = new NextRequest('http://localhost:3000/api/v1/integration/students', {
        headers: {
          'x-tenant-id': 'iskool',
          cookie: `ibime_session=${ibimeToken}`
        }
      });

      const res = await middleware(req);

      // Debe bloquear con 403 Forbidden por violación cross-tenant
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe('CROSS_TENANT_VIOLATION');
      expect(json.userTenant).toBe('ibime');
      expect(json.targetTenant).toBe('iskool');
    });

    it('debe rechazar acceso de un token de iSkool que intente consultar APIs de IBIME', async () => {
      const iskoolToken = await signMultiTenantToken({
        id: 'usr-student-iskool',
        email: 'alumno@iskool.edu.mx',
        tenant_id: 'iskool',
        role: 'student'
      });

      const req = new NextRequest('http://localhost:3000/api/v1/ibime/kardex', {
        headers: {
          cookie: `iskool_session=${iskoolToken}`
        }
      });

      const res = await middleware(req);
      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.code).toBe('CROSS_TENANT_VIOLATION');
      expect(json.userTenant).toBe('iskool');
      expect(json.targetTenant).toBe('ibime');
    });
  });

  describe('3. Creación de Planeación en IBIME sin Alterar Catálogo Maestro', () => {
    it('debe almacenar la planeación en el namespace IBIME y mantener intacto el catálogo de iSkool Core', async () => {
      // 1. Obtener estado previo del catálogo de iSkool
      const preCheck = await CurriculumFederationService.resolvePlan('plan-nem-f4-g4-cie-001', 'iskool');
      expect(preCheck).not.toBeNull();
      const initialTitle = preCheck?.title;

      // 2. Docente de IBIME crea una adaptación sobre el plan base
      const customPlanInput: CreateOrExtendPlanInput = {
        parent_plan_id: 'plan-nem-f4-g4-cie-001',
        title: 'Water Filtration and Eco-Engineering (IBIME Sovereign Overlay)',
        subject_code: 'ciencias',
        phase: 4,
        grade: 4,
        curriculum_standard: {
          framework: 'BICULTURAL_IBIME',
          pda_code: 'PDA-CIE-F4-4TO-035',
          pda_description: 'Indaga el ciclo hidrológico con vocabulario bilingüe y ecotecnias escolares.'
        },
        didactic_intent: 'Enfoque de pensamiento crítico bilingüe CLIL.',
        sessions: [
          {
            session_number: 1,
            duration_minutes: 50,
            moments: {
              inicio: 'Inquiry starter in English: water reservoirs',
              desarrollo: 'Laboratory distillation experiment',
              cierre: 'Bilingual summary canvas'
            }
          }
        ],
        evaluation_rubric: [
          {
            criterion: 'Inquiry and CLIL mastery',
            weight_percent: 100,
            descriptors: {
              sobresaliente: 'High scientific precision',
              satisfactorio: 'Good participation',
              en_proceso: 'Developing'
            }
          }
        ],
        bicultural_adaptations: {
          language_target: 'EN',
          bilingual_scaffolding: ['evaporation', 'precipitation']
        }
      };

      const savedPlan = await CurriculumFederationService.saveOrExtendPlan(
        customPlanInput,
        ibimeTeacherContext
      );

      // Verificaciones en IBIME
      expect(savedPlan.tenant_id).toBe('ibime');
      expect(savedPlan.is_custom_overlay).toBe(true);
      expect(savedPlan.audit_trail.author_name).toBe('Prof. Gabriela Morales');
      expect(savedPlan.audit_trail.institution_cct).toBe('09PPR1492Z');
      expect(savedPlan.audit_trail.signature_sha256).toBeDefined();

      // 3. Verificación de Invarianza: El catálogo maestro central de iSkool NO fue alterado
      const postCheck = await CurriculumFederationService.resolvePlan('plan-nem-f4-g4-cie-001', 'iskool');
      expect(postCheck).not.toBeNull();
      expect(postCheck?.title).toBe(initialTitle);
      expect(postCheck?.tenant_id).toBe('iskool');
      expect(postCheck?.is_custom_overlay).toBe(false);
      expect(postCheck?.bicultural_adaptations).toBeUndefined();
    });
  });
});
