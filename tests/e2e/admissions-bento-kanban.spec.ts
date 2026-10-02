import { test, expect } from '@playwright/test';
import * as path from 'path';
import { signSessionToken } from '../../src/lib/sessionToken';

test.describe('FASE 4: Síntesis Bento UI & Pipeline Kanban en Vista CEO', () => {
  const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';
  const ARTIFACTS_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/4d7cddb9-f4fa-4725-900a-d5ac7282fbb3';

  test('Verificación integral de Cabecera, Ocupación, Bento 5 Fases, Kanban y Reactividad Multi-Sede', async ({ page, context }) => {
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
    await page.goto(`${BASE_URL}/admin/ceo`, { waitUntil: 'networkidle' });
    await page.setViewportSize({ width: 1600, height: 1000 });

    // 2. Hacer clic en la pestaña "Admisiones"
    const admisionesTab = page.locator('button:has-text("Admisiones")').first();
    await expect(admisionesTab).toBeVisible({ timeout: 10000 });
    await admisionesTab.click();
    await page.waitForTimeout(1000);

    // 3. Validar Cabecera Operativa de Admisiones
    const registerBtn = page.locator('button:has-text("Registrar Aspirante al Pipeline")').first();
    const directoryBtn = page.locator('button:has-text("Directorio del Pipeline")').first();
    const controlEscolarBtn = page.locator('button:has-text("Control Escolar Operativo")').first();

    await expect(registerBtn).toBeVisible();
    await expect(directoryBtn).toBeVisible();
    await expect(controlEscolarBtn).toBeVisible();

    // 4. Validar Banner de Ocupación (3,622 / 3,900 Asientos)
    const occupancyText = page.locator('text=3,622 / 3,900 Asientos').first();
    await expect(occupancyText).toBeVisible();

    // 5. Validar las 5 Fases Departamentales Corresponsables
    await expect(page.locator('text=Fase 1 · Lead').first()).toBeVisible();
    await expect(page.locator('text=Fase 2 · Visita').first()).toBeVisible();
    await expect(page.locator('text=Fase 3 · Evaluación').first()).toBeVisible();
    await expect(page.locator('text=Fase 4 · Reserva').first()).toBeVisible();
    await expect(page.locator('text=Fase 5 · Matrícula').first()).toBeVisible();

    // 6. Validar que el Tablero Kanban Ágil de 5 Fases está presente con tarjetas interactivas
    const kanbanHeading = page.locator('text=Tablero Kanban Ágil de 5 Fases Corresponsables').first();
    await expect(kanbanHeading).toBeVisible();

    // Scroll al Tablero Kanban para captura de alta resolución
    await kanbanHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_kanban_board.png') });

    // Captura de pantalla de la vista general
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_kanban_view.png'), fullPage: false });

    // 7. Inspeccionar Expediente Familiar 360° al hacer clic en una tarjeta del Kanban
    const firstKanbanCard = page.locator('div[draggable="true"]').first();
    if (await firstKanbanCard.isVisible()) {
      await firstKanbanCard.click();
      await page.waitForTimeout(600);
      const drawerHeading = page.locator('text=Expediente Familiar 360°').first();
      await expect(drawerHeading).toBeVisible();

      // Captura del Drawer de Expediente Familiar
      await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_card_drawer.png') });

      // Cerrar Drawer
      const closeDrawerBtn = page.locator('button:has-text("Cerrar Expediente")').first();
      if (await closeDrawerBtn.isVisible()) {
        await closeDrawerBtn.click();
      } else {
        const xBtn = page.locator('button').filter({ has: page.locator('svg.lucide-x') }).first();
        if (await xBtn.isVisible()) await xBtn.click();
      }
      await page.waitForTimeout(500);
    }

    // 8. Probar Modal de Registro de Aspirante
    await registerBtn.click();
    await page.waitForTimeout(500);

    const modalTitle = page.locator('text=Registrar Aspirante al Pipeline de Admisiones').first();
    await expect(modalTitle).toBeVisible();

    // Captura del Modal de Registro
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_register_modal.png') });

    // Cerrar modal
    const closeRegisterBtn = page.locator('button:has-text("Cancelar")').first();
    await closeRegisterBtn.click();
    await page.waitForTimeout(500);

    // 9. Probar Modal de Directorio de Pipeline con botón "Descargar CSV"
    await directoryBtn.click();
    await page.waitForTimeout(500);

    const directoryTitle = page.locator('text=Directorio de Aspirantes en Pipeline').first();
    await expect(directoryTitle).toBeVisible();

    const csvBtn = page.locator('button:has-text("Descargar CSV")').first();
    await expect(csvBtn).toBeVisible();

    // Captura del Modal de Directorio
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_directory_csv_modal.png') });

    // Cerrar directorio
    const closeDirBtn = page.locator('button:has-text("Cerrar Directorio")').first();
    await closeDirBtn.click();
    await page.waitForTimeout(500);

    // 10. Probar Reactividad del Selector Multi-Sede
    // Seleccionar Campus San Cristóbal en el selector superior
    const campusSelect = page.locator('header select').first();
    await expect(campusSelect).toBeVisible();
    await campusSelect.selectOption('sancristobal');
    await page.waitForTimeout(1000);

    // Scroll hacia el Kanban para ver las tarjetas filtradas exclusivamente para San Cristóbal
    await kanbanHeading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);

    // Captura de pantalla filtrada por sede
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'bento_admissions_kanban_filtered_sancristobal.png') });
  });
});
