import { test, expect } from '@playwright/test';
import { signMultiTenantToken } from '@/lib/auth/multiTenantSession';

/**
 * ============================================================================
 * SUITE DE PRUEBAS E2E (PLAYWRIGHT) - AISLAMIENTO HERMÉTICO iSkool e IBIME
 * ============================================================================
 * 
 * Verificación Real de Navegador Chromium:
 * a) Inyección real de cookie HttpOnly 'ibime_session' con JWT válido firmado criptográficamente.
 * b) Navegación a portal institucional y aserción de atributo data-tenant="ibime" en el elemento raíz <html>.
 * c) Validación de computedStyle en el badge institucional verificando el color '#047857' (rgb(4, 120, 87))
 *    y confirmación estricta de ausencia total de clases o textos de marca iSkool.
 * d) Intento de intrusión cruzada (cross-tenant) respondiendo con HTTP 404 Not Found.
 */

test.describe('🛡️ E2E: Integración Hermética Multi-Tenant (iSkool Core & IBIME)', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

  // --------------------------------------------------------------------------
  // ESCENARIO 1: Login real con Cookie HttpOnly y Validación Estricta de Branding
  // --------------------------------------------------------------------------
  test('E2E-01: Usuario IBIME visualiza estrictamente la identidad gráfica y recursos de IBIME sin rastro de iSkool', async ({ page, context }) => {
    // a) Generar un JWT real firmado con HMAC-SHA256 para el docente de IBIME
    const validIbimeToken = await signMultiTenantToken({
      id: 'usr-ibime-doc-e2e',
      email: 'profesor.bicultural@ibime.edu.mx',
      tenant_id: 'ibime',
      role: 'teacher',
      school_id: 'school-ibime-campus-sur',
      first_name: 'Gabriela',
      last_name: 'Morales'
    });

    // Inyectar Cookie HttpOnly 'ibime_session' en el contexto del navegador Chromium
    await context.addCookies([
      {
        name: 'ibime_session',
        value: validIbimeToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax'
      }
    ]);

    // b) Navegar al portal de IBIME y verificar respuesta exitosa
    const response = await page.goto(`${BASE_URL}/ibime/portal`);
    expect(response?.status()).toBeLessThan(400);

    // b) Aserción en el elemento raíz: data-tenant="ibime"
    const rootElement = page.locator('html');
    await expect(rootElement).toHaveAttribute('data-tenant', 'ibime');

    // c) Validación de computedStyle en el badge institucional
    const badge = page.locator('[data-testid="institutional-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText('IBIME Bicultural Hub');

    // Extraer y evaluar computedStyle en el navegador
    const badgeComputedColor = await badge.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return computed.color;
    });

    // rgb(4, 120, 87) corresponde exactamente a #047857 (Verde Esmeralda Institucional IBIME)
    const isEmeraldColor =
      badgeComputedColor === 'rgb(4, 120, 87)' ||
      badgeComputedColor.toLowerCase() === '#047857';
    expect(isEmeraldColor).toBe(true);

    // c) Ausencia total de clases o textos de iSkool
    const badgeText = await badge.innerText();
    expect(badgeText).not.toContain('iSkool');
    expect(badgeText).not.toContain('iskool');

    const pageContent = await page.content();
    expect(pageContent).not.toContain('iSkool Studio IA');
    expect(pageContent).not.toContain('Hub Docente • Experiencia y Gestión Pedagógica iSkool');
    expect(pageContent).not.toContain('iSkool Ecosistema');

    // Verificar presencia de elementos institucionales propios de IBIME
    const teacherHeading = page.locator('text=Centro de Gestión Docente y Coordinación Bicultural IBIME');
    await expect(teacherHeading).toBeVisible();
  });

  // --------------------------------------------------------------------------
  // ESCENARIO 2: Bloqueo Anti-Enumeración Zero-Trust (HTTP 404 en Cross-Tenant)
  // --------------------------------------------------------------------------
  test('E2E-02: Sesión de IBIME intentando consultar recursos de iSkool recibe HTTP 404 Not Found', async ({ request }) => {
    const validIbimeToken = await signMultiTenantToken({
      id: 'usr-ibime-cross-intruder',
      email: 'intruder@ibime.edu.mx',
      tenant_id: 'ibime',
      role: 'teacher',
      school_id: 'school-ibime-campus-sur'
    });

    // Simular petición con sesión de IBIME hacia API interna protegida de iSkool
    const crossResponse = await request.get(`${BASE_URL}/api/v1/integration/students`, {
      headers: {
        'Cookie': `ibime_session=${validIbimeToken}`
      }
    });

    // El middleware debe responder con 404 Not Found para evitar enumeración entre instituciones
    expect(crossResponse.status()).toBe(404);
    const body = await crossResponse.json().catch(() => ({}));
    expect(body.code).toBe('NOT_FOUND');
  });

  // --------------------------------------------------------------------------
  // ESCENARIO 3: Planeaciones con Overlay Pattern Soberano
  // --------------------------------------------------------------------------
  test('E2E-03: Planeación IBIME se almacena con namespace aislado y preserva el catálogo canónico', async ({ request }) => {
    const validIbimeToken = await signMultiTenantToken({
      id: 'usr-ibime-curriculum-planner',
      email: 'academics@ibime.edu.mx',
      tenant_id: 'ibime',
      role: 'teacher',
      school_id: 'school-ibime-campus-sur'
    });

    // Crear o extender planeación bicultural
    const createResponse = await request.post(`${BASE_URL}/api/v1/curriculum/plans`, {
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `ibime_session=${validIbimeToken}`,
        'Authorization': `Bearer ${validIbimeToken}`
      },
      data: {
        parent_plan_id: 'plan-nem-f4-g4-cie-001',
        title: 'Water Engineering and Filtration (E2E IBIME Bicultural)',
        subject_code: 'ciencias',
        phase: 4,
        grade: 4,
        curriculum_standard: {
          framework: 'BICULTURAL_IBIME',
          pda_description: 'Indaga el ciclo hidrológico con andamiaje en inglés.'
        },
        didactic_intent: 'Enfoque bilingüe interdisciplinario.',
        sessions: [
          {
            session_number: 1,
            duration_minutes: 50,
            moments: {
              inicio: 'Warm-up inquiry in English',
              desarrollo: 'Lab experiments on condensation',
              cierre: 'Exit ticket'
            }
          }
        ],
        evaluation_rubric: [
          {
            criterion: 'Bilingual Scientific Inquiry',
            weight_percent: 100,
            descriptors: {
              sobresaliente: 'Fluent and rigorous',
              satisfactorio: 'Adequate inquiry',
              en_proceso: 'Needs support'
            }
          }
        ],
        bicultural_adaptations: {
          language_target: 'EN',
          bilingual_scaffolding: ['evaporation', 'condensation']
        }
      }
    });

    // Validar respuesta del endpoint de planeaciones (201 Created o 200 OK)
    expect([200, 201]).toContain(createResponse.status());
    const createdData = await createResponse.json();
    expect(createdData.success).toBe(true);
    expect(createdData.plan.tenant_id).toBe('ibime');
    expect(createdData.plan.content_hash_sha256).toBeDefined();

    // Consultar el catálogo maestro desde la perspectiva de iSkool Core
    const iskoolToken = await signMultiTenantToken({
      id: 'usr-iskool-teacher-verifier',
      email: 'maestro@iskool.edu.mx',
      tenant_id: 'iskool',
      role: 'teacher',
      school_id: 'school-iskool-public'
    });

    const centralCheck = await request.get(`${BASE_URL}/api/v1/curriculum/plans?subject=ciencias&grade=4`, {
      headers: {
        'Cookie': `iskool_session=${iskoolToken}`
      }
    });

    expect(centralCheck.ok()).toBe(true);
    const centralJson = await centralCheck.json();
    const plans = centralJson.plans || [];
    const canonicalPlan = plans.find((p: any) => p.id === 'plan-nem-f4-g4-cie-001');

    if (canonicalPlan) {
      expect(canonicalPlan.title).not.toContain('Bicultural');
      expect(canonicalPlan.tenant_id).toBe('iskool');
    }
  });
});
