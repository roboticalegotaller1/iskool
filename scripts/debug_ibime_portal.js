const { chromium } = require('playwright');
const path = require('path');

async function debugIbime() {
  const brainDir = path.resolve('C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\a0fef079-e5d2-4369-b1e9-b462494c4257');
  console.log('=== TEST 1: Navegando directamente a https://iskool.mx/ibime/portal (Sesión Limpia) ===');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Browser Console ${msg.type()}]:`, msg.text()));
  page.on('response', res => {
    if (res.status() >= 300) {
      console.log(`[HTTP ${res.status()}]: ${res.url()} -> ${res.headers()['location'] || ''}`);
    }
  });

  try {
    console.log('1. Visitando https://iskool.mx/ibime/portal...');
    await page.goto('https://iskool.mx/ibime/portal', { waitUntil: 'domcontentloaded', timeout: 20000 });
    console.log(`URL tras DOMContentLoaded: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_debug_step1.png') });

    await page.waitForTimeout(1000);
    console.log(`URL tras 1 segundo: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_debug_step2.png') });

    await page.waitForTimeout(2000);
    console.log(`URL tras 3 segundos: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_debug_step3.png') });
  } catch (err) {
    console.error('Error en Test 1:', err.message);
  }

  console.log('\n=== TEST 2: Iniciar sesión en 02DJoUJSkwYQZjn y verificar si entra a /ibime/portal o si te saca ===');
  try {
    console.log('1. Navegando a https://iskool.mx/02DJoUJSkwYQZjn...');
    await page.goto('https://iskool.mx/02DJoUJSkwYQZjn', { waitUntil: 'networkidle', timeout: 20000 });
    console.log(`URL: ${page.url()}`);

    // Intentar login con Lic. Patricia Sandoval Morales (Directora General IBIME)
    console.log('2. Llenando credenciales directora.general@ibime.edu.mx / DIR2026...');
    await page.fill('#login-email', 'directora.general@ibime.edu.mx');
    await page.fill('#login-password', 'DIR2026');
    await page.click('button[type="submit"]');

    console.log('3. Esperando 1 segundo tras submit...');
    await page.waitForTimeout(1000);
    console.log(`URL tras 1s: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_login_step1.png') });

    console.log('4. Esperando 2 segundos más...');
    await page.waitForTimeout(2000);
    console.log(`URL tras 3s: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_login_step2.png') });

    console.log('5. Esperando 3 segundos más (ver si te saca)...');
    await page.waitForTimeout(3000);
    console.log(`URL tras 6s: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_login_step3.png') });
  } catch (err) {
    console.error('Error en Test 2:', err.message);
  }

  await browser.close();
}

debugIbime().catch(console.error);
