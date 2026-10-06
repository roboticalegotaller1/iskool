import { test, expect } from '@playwright/test';

test.describe('iSkool — Bandeja Inteligente de Dirección (E2E Demo)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/portal-ceo/email');
  });

  test('Debe desplegar la promesa ejecutiva: 28 asuntos en lugar de 297 correos', async ({ page }) => {
    // 1. Validar mensaje de bienvenida personalizado
    await expect(page.locator('h1')).toContainText('Buenos días');
    await expect(page.locator('text=297 correos')).toBeVisible();

    // 2. Validar contador de asuntos prioritarios de Dirección
    const direccionCard = page.locator('text=Requieren Tu Atención');
    await expect(direccionCard).toBeVisible();
    await expect(page.locator('text=28').first()).toBeVisible();

    // 3. Validar detección de patrón de la pieza WOW
    await expect(page.locator('text=Patrón Proactivo Detectado')).toBeVisible();
    await expect(page.locator('text=festival')).toBeVisible();
  });

  test('Debe permitir abrir un asunto, revisar "Por qué te lo muestro" y editar borrador', async ({ page }) => {
    // Abrir el primer asunto de la lista
    const firstMatterCard = page.locator('text=MAT-').first();
    await firstMatterCard.click();

    // Validar drawer de detalle
    await expect(page.locator('text=Por qué te lo muestro')).toBeVisible();
    await expect(page.locator('text=Borrador de Respuesta Sugerido')).toBeVisible();

    // Probar edición del borrador en modo sombra
    const textarea = page.locator('textarea');
    await textarea.fill('Estimada familia: He revisado personalmente este caso y autorizo la salida a las 13:00 hrs.');
    await expect(textarea).toHaveValue(/autorizo la salida a las 13:00 hrs/);

    // Botón de aprobación
    const approveBtn = page.locator('button:has-text("Aprobar Respuesta y Resolver")');
    await expect(approveBtn).toBeEnabled();
  });

  test('Debe responder en "Ponte al día conmigo" con contexto de patrones', async ({ page }) => {
    const catchupBtn = page.locator('button:has-text("Ponte al día conmigo")');
    await catchupBtn.click();

    // Validar resumen dialogado
    await expect(page.locator('text=Desde tu último resumen')).toBeVisible();
    await expect(page.locator('text=Ruta 4').or(page.locator('text=festival'))).toBeVisible();
  });

  test('Debe abrir el modal de herramientas de marca y cambiar color institucional', async ({ page }) => {
    const brandBtn = page.locator('button:has-text("Colores Institucionales")');
    await brandBtn.click();

    await expect(page.locator('text=Herramientas: Personalización de Marca')).toBeVisible();
    const applyBtn = page.locator('button:has-text("Aplicar Estilo Institucional")');
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
  });
});
