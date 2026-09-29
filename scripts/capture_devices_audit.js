const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runAudit() {
  const artifactsDir = 'C:\\Users\\kami-\\AppData\\Local\\Temp'; // or brain directory
  const brainDir = path.resolve('C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\a0fef079-e5d2-4369-b1e9-b462494c4257');

  console.log('Iniciando auditoría visual forense multi-dispositivo...');
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900, isMobile: false },
    { name: 'tablet', width: 820, height: 1080, isMobile: false },
    { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true }
  ];

  for (const vp of viewports) {
    console.log(`\nProbando viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
      userAgent: vp.isMobile 
        ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        : undefined
    });

    const page = await context.newPage();

    // 1. Iniciar sesión con cuenta CEO de BMW Group México
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('#login-email', 'ceo@bmw-corp.mx');
    await page.fill('#login-password', 'BMW2026');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(2000);

    // Capturar vista inicio CEO
    const overviewPath = path.join(brainDir, `audit_bmw_${vp.name}_overview.png`);
    await page.screenshot({ path: overviewPath, fullPage: false });
    console.log(`✓ Captura guardada: ${overviewPath}`);

    // Si es móvil o tablet, verificar drawer hamburguesa
    if (vp.name === 'mobile' || vp.name === 'tablet') {
      const menuBtn = page.locator('button[aria-label="Abrir menú de navegación"]');
      if (await menuBtn.isVisible()) {
        await menuBtn.click();
        await page.waitForTimeout(400);
        const drawerPath = path.join(brainDir, `audit_bmw_${vp.name}_drawer.png`);
        await page.screenshot({ path: drawerPath, fullPage: false });
        console.log(`✓ Captura menú hamburguesa: ${drawerPath}`);

        // Click en Operación dentro del drawer
        const operacionMobileBtn = page.locator('aside nav button:visible').filter({ hasText: 'Operación' }).first();
        if (await operacionMobileBtn.isVisible()) {
          await operacionMobileBtn.click();
          await page.waitForTimeout(1000);
        }
      }
    } else {
      // En desktop, click directo en Operación en sidebar
      const operacionBtn = page.locator('aside nav button:visible').filter({ hasText: 'Operación' }).first();
      if (await operacionBtn.isVisible()) {
        await operacionBtn.click();
        await page.waitForTimeout(1000);
      }
    }

    // Capturar vista de Operación (hacer scroll hacia la sección operativa si existe)
    const operacionHeader = page.locator('text=TRAZABILIDAD OPERATIVA DE CUENTAS').first();
    if (await operacionHeader.isVisible()) {
      await operacionHeader.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }
    const operacionPath = path.join(brainDir, `audit_bmw_${vp.name}_operacion.png`);
    await page.screenshot({ path: operacionPath, fullPage: false });
    console.log(`✓ Captura Operación guardada: ${operacionPath}`);

    await context.close();
  }

  await browser.close();
  console.log('\n✅ Auditoría visual multi-dispositivo completada con éxito.');
}

runAudit().catch(err => {
  console.error('Error durante auditoría visual:', err);
  process.exit(1);
});
