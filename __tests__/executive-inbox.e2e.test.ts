import { test, expect } from '@playwright/test';
import { signMultiTenantToken } from '../src/lib/auth/multiTenantSession';

test.describe('iSkool — Bandeja Inteligente de Dirección (E2E Demo)', () => {
  test.beforeEach(async ({ page, context }) => {
    const validIbimeToken = await signMultiTenantToken({
      id: 'usr-dir-ibime-montes',
      email: 'directora.general@ibime.edu.mx',
      tenant_id: 'ibime',
      role: 'director',
      school_id: 'sch-ibime',
      first_name: 'Directora',
      last_name: 'General'
    });

    await context.addCookies([
      {
        name: 'ibime_session',
        value: validIbimeToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax'
      },
      {
        name: 'tenant-id',
        value: 'ibime',
        domain: 'localhost',
        path: '/',
        httpOnly: false,
        sameSite: 'Lax'
      }
    ]);

    await page.goto('/portal-ceo/email');
  });

  test('Debe desplegar la promesa ejecutiva: asuntos consolidados y detección de patrón en tiempo real', async ({ page }) => {
    // 1. Validar cabecera ejecutiva y volumen bruto de correos filtrado
    await expect(page.locator('h3:has-text("Consola de Correo Inteligente")')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Volumen Bruto Hoy').first()).toBeVisible();
    await expect(page.locator('text=Correos Usables').first()).toBeVisible();

    // 2. Validar contador de asuntos prioritarios de Dirección / Atención CEO
    await expect(page.locator('button:has-text("Atención CEO")').first()).toBeVisible();

    // 3. Validar detección de patrón proactivo en tiempo real
    await expect(page.locator('text=Patrón Proactivo Detectado').first()).toBeVisible();
    await expect(page.locator('text=festival').first()).toBeVisible();
  });

  test('Debe permitir abrir un asunto, revisar Expediente 360° y editar borrador oficial', async ({ page }) => {
    // Seleccionar el primer expediente prioritario de la lista
    const firstMatterCard = page.locator('text=MAT-IBIME-').first();
    await expect(firstMatterCard).toBeVisible({ timeout: 10000 });
    await firstMatterCard.click();

    // Validar panel de Expediente 360° y Borrador Oficial del Asistente Pedagógico IA
    await expect(page.locator('text=Expediente 360° en Vivo').first()).toBeVisible();
    await expect(page.locator('text=Borrador Oficial del Asistente Pedagógico IA').first()).toBeVisible();

    // Probar edición del borrador antes de despachar
    const textarea = page.locator('textarea').first();
    await textarea.fill('Estimada familia: He revisado personalmente este caso y autorizo la salida a las 13:00 hrs.');
    await expect(textarea).toHaveValue(/autorizo la salida a las 13:00 hrs/);

    // Botón de aprobación y despacho
    const approveBtn = page.locator('button:has-text("Aprobar y Despachar Respuesta")').first();
    await expect(approveBtn).toBeEnabled();
  });

  test('Debe abrir el resumen ejecutivo "Ponte al día" o Audio Digest con contexto de patrones', async ({ page }) => {
    const catchupBtn = page.locator('button:has-text("Ponte al día")').first();
    await expect(catchupBtn).toBeVisible({ timeout: 10000 });
    await catchupBtn.click();

    // Validar que el asistente o modal de resumen ejecutivo despliega contexto activo
    await expect(page.locator('text=festival').first()).toBeVisible();
  });

  test('Debe permitir alternar el tema visual institucional (Marfil / Oscuro) y abrir Ajustes', async ({ page }) => {
    const themeBtn = page.locator('button:has-text("Marfil"), button:has-text("Oscuro")').first();
    await expect(themeBtn).toBeVisible({ timeout: 10000 });
    await themeBtn.click();

    const settingsBtn = page.locator('button:has-text("Ajustes")').first();
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();
  });
});
