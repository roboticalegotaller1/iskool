const { chromium } = require('playwright');
const path = require('path');

async function testFromPublicLogin() {
  const brainDir = path.resolve('C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\a0fef079-e5d2-4369-b1e9-b462494c4257');
  console.log('=== TEST 3: Login desde /login público con cuenta IBIME ===');
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log(`[Console ${msg.type()}]:`, msg.text()));
  page.on('response', res => {
    if (res.status() >= 300) {
      console.log(`[HTTP ${res.status()}]: ${res.url()} -> ${res.headers()['location'] || ''}`);
    }
  });

  try {
    console.log('1. Navegando a https://iskool.mx/login...');
    await page.goto('https://iskool.mx/login', { waitUntil: 'networkidle', timeout: 20000 });
    
    console.log('2. Llenando credenciales directora.general@ibime.edu.mx / DIR2026 en login público...');
    await page.fill('#login-email', 'directora.general@ibime.edu.mx');
    await page.fill('#login-password', 'DIR2026');
    await page.click('button[type="submit"]');

    console.log('3. Esperando 1.5s...');
    await page.waitForTimeout(1500);
    console.log(`URL tras 1.5s: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_public_login_step1.png') });

    console.log('4. Esperando 2.5s...');
    await page.waitForTimeout(2500);
    console.log(`URL tras 4s: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_public_login_step2.png') });

    console.log('5. Esperando 3s más...');
    await page.waitForTimeout(3000);
    console.log(`URL tras 7s: ${page.url()}`);
    await page.screenshot({ path: path.join(brainDir, 'ibime_public_login_step3.png') });
  } catch (err) {
    console.error('Error:', err.message);
  }

  await browser.close();
}

testFromPublicLogin().catch(console.error);
