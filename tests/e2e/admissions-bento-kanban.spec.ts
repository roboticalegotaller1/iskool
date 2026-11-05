import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { signSessionToken } from '../../src/lib/sessionToken';

test.describe('FASE 4: Síntesis Bento UI & Pipeline Kanban en Vista CEO', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  const ARTIFACTS_DIR = path.join(process.cwd(), 'test-results', 'admissions-e2e');

  test('Verificación integral de Cabecera, Ocupación, Bento 5 Fases, Kanban y Reactividad Multi-Sede', async ({ page, context }) => {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

    // 0. Inyectar Cookie de Sesión Autenticada de Dueño/CEO
    const iskoolToken = await signSessionToken({
      id: 'usr-ceo-iskool-001',
      email: 'director@iskool.edu.mx',
      role: 'owner',
      tenant_id: 'iskool',
      school_id: 'sch-ibime',
      first_name: 'Don Alejandro',
      last_name: 'Vargas'
    });

    await context.addCookies([
      {
        name: 'iskool_session',
        value: iskoolToken,
        domain: 'localhost',
        path: '/',
        httpOnly: true,
        sameSite: 'Lax'
      }
    ]);

    // 1. Navegar a la Vista CEO
    await page.goto(`${BASE_URL}/admin/ceo`, { waitUntil: 'domcontentloaded' });
    await page.setViewportSize({ width: 1600, height: 1000 });

    // 2. Hacer clic en la pestaña "Admisiones"
    const admisionesTab = page.locator('button:has-text("Admisiones")').first();
    await expect(admisionesTab).toBeVisible({ timeout: 15000 });
    await admisionesTab.click();

    // 3. Validar Cabecera Operativa de Admisiones
    const registerBtn = page.locator('button:has-text("Registrar Aspirante al Pipeline")').first();
    const directoryBtn = page.locator('button:has-text("Directorio del Pipeline")').first();
    const controlEscolarBtn = page.locator('button:has-text("Control Escolar Operativo")').first();

    await expect(registerBtn).toBeVisible({ timeout: 10000 });
    await expect(directoryBtn).toBeVisible();
    await expect(controlEscolarBtn).toBeVisible();

    // 4. Validar Banner de Ocupación (Asientos Contratados / Capacidad)
    const occupancyText = page.locator('text=/ 3,900 Asientos').first();
    await expect(occupancyText).toBeVisible();

    // 5. Validar el Work OS de Admisiones y las 5 Etapas del Funnel en Vivo (excluyendo nodos <option> ocultos)
    const workOsHeading = page.locator('h2:has-text("Work OS de Admisiones")').first();
    await expect(workOsHeading).toBeVisible();

    await expect(page.locator('text=1. Prospectos Registrados en CRM').first()).toBeVisible();
    await expect(page.locator('text=2. Tours y Visitas de Campus').first()).toBeVisible();
    await expect(page.locator('text=3. Examen Diagnóstico Psicopedagógico').first()).toBeVisible();
    await expect(page.locator('text=4. Carta de Asignación Emitida').first()).toBeVisible();
    await expect(page.locator('text=5. Inscripción y Reserva Pagada').first()).toBeVisible();

    // 6. Validar que el Tablero Kanban / Funnel Gráfico está presente con tarjetas interactivas
    const funnelHeading = page.locator('h3:has-text("Embudo Gráfico de Conversión")').first();
    await expect(funnelHeading).toBeVisible();

    await workOsHeading.scrollIntoViewIfNeeded();
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_kanban_board.png') });

    // 7. Probar Modal de Registro de Aspirante
    await registerBtn.click();
    const modalTitle = page.locator('text=Registrar Aspirante al Pipeline de Admisiones').first();
    await expect(modalTitle).toBeVisible();

    const closeRegisterBtn = page.locator('button:has-text("Cancelar")').first();
    if (await closeRegisterBtn.isVisible()) {
      await closeRegisterBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }

    // 8. Probar Modal de Directorio de Pipeline con botón "Descargar CSV"
    await directoryBtn.click();
    const directoryTitle = page.locator('text=Directorio de Aspirantes en Pipeline').first();
    await expect(directoryTitle).toBeVisible();

    const csvBtn = page.locator('button:has-text("Descargar CSV")').first();
    await expect(csvBtn).toBeVisible();

    const closeDirBtn = page.locator('button:has-text("Cerrar Directorio")').first();
    if (await closeDirBtn.isVisible()) {
      await closeDirBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }

    // 9. Probar Reactividad del Selector Multi-Sede
    const campusSelect = page.locator('header select').first();
    await expect(campusSelect).toBeVisible();
    await campusSelect.selectOption('sancristobal');
    await expect(page.locator('text=Campus San Cristóbal').first()).toBeVisible();
  });
});
