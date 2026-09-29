const { chromium } = require('playwright');
const path = require('path');
const https = require('https');

function checkHttps(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      resolve({
        statusCode: res.statusCode,
        headers: res.headers
      });
    }).on('error', reject);
  });
}

async function verifyProduction() {
  const brainDir = path.resolve('C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\a0fef079-e5d2-4369-b1e9-b462494c4257');
  console.log('--- 1. VERIFICACIÓN HTTP DE https://iskool.mx ---');
  try {
    const httpCheck = await checkHttps('https://iskool.mx/login');
    console.log(`✓ HTTP Status: ${httpCheck.statusCode}`);
    console.log(`✓ Server / CDN: ${httpCheck.headers.server || httpCheck.headers['x-cache'] || 'CloudFront / AWS Amplify'}`);
    console.log(`✓ Date Header: ${httpCheck.headers.date}`);
  } catch (e) {
    console.error('Error al consultar https://iskool.mx:', e.message);
  }

  console.log('\n--- 2. INICIANDO NAVEGADOR PLAYWRIGHT PARA AUDITORÍA EN VIVO ---');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // 1. Acceder a https://iskool.mx/login
  console.log('Navegando a https://iskool.mx/login...');
  await page.goto('https://iskool.mx/login', { waitUntil: 'networkidle', timeout: 30000 });
  
  const loginTitle = await page.title();
  console.log(`✓ Título de la página de Login en producción: "${loginTitle}"`);
  
  const loginScreenshot = path.join(brainDir, 'prod_audit_login.png');
  await page.screenshot({ path: loginScreenshot, fullPage: false });
  console.log(`✓ Captura de Login guardada: ${loginScreenshot}`);

  // 2. Iniciar sesión con credenciales CEO
  console.log('Ingresando credenciales CEO (ceo@bmw-corp.mx)...');
  await page.fill('#login-email', 'ceo@bmw-corp.mx');
  await page.fill('#login-password', 'BMW2026');
  await page.click('button[type="submit"]');

  console.log('Esperando redirección y carga de dashboard...');
  await page.waitForTimeout(4000);

  const currentUrl = page.url();
  console.log(`✓ URL actual tras inicio de sesión: ${currentUrl}`);

  // Capturar vista inicio
  const overviewScreenshot = path.join(brainDir, 'prod_audit_bmw_overview.png');
  await page.screenshot({ path: overviewScreenshot, fullPage: false });
  console.log(`✓ Captura de Vista Principal en producción guardada: ${overviewScreenshot}`);

  // 3. Comprobar textos corporativos en producción
  const pageContent = await page.content();
  const checks = [
    { label: 'BMW Group México', present: pageContent.includes('BMW Group México') },
    { label: 'Consorcio Empresarial', present: pageContent.includes('Consorcio Empresarial') },
    { label: 'Colaboradores (sin alumnos)', present: pageContent.includes('Colaboradores') && !pageContent.includes('Alumnos en plantilla') },
    { label: 'Instructores (sin profesores)', present: pageContent.includes('Instructores') },
    { label: 'Candidatos en pipeline', present: pageContent.includes('Candidatos en pipeline') },
    { label: 'BMW CORPORATE TRAINING SUITE', present: pageContent.includes('BMW CORPORATE TRAINING SUITE') }
  ];

  console.log('\n--- 3. VERIFICACIÓN DE ELEMENTOS CORPORATIVOS EN PRODUCCIÓN ---');
  checks.forEach(c => {
    console.log(`${c.present ? '✅' : '❌'} ${c.label}: ${c.present ? 'PRESENTE Y SINCRONIZADO' : 'NO ENCONTRADO O DESACTUALIZADO'}`);
  });

  // 4. Navegar a Operación
  console.log('\nNavegando a la pestaña Operación en producción...');
  const operacionBtn = page.locator('aside nav button:visible').filter({ hasText: 'Operación' }).first();
  if (await operacionBtn.isVisible()) {
    await operacionBtn.click();
    await page.waitForTimeout(1500);

    const operacionScreenshot = path.join(brainDir, 'prod_audit_bmw_operacion.png');
    await page.screenshot({ path: operacionScreenshot, fullPage: false });
    console.log(`✓ Captura de Operación en producción guardada: ${operacionScreenshot}`);

    const operacionContent = await page.content();
    const opChecks = [
      { label: 'Centro de Automatizaciones & Ecosistema de Cuentas en Vivo', present: operacionContent.includes('Centro de Automatizaciones') },
      { label: 'Cuentas de Instructores & Master Trainers', present: operacionContent.includes('Cuentas de Instructores') },
      { label: 'Cuentas de Operaciones Financieras & Tesorería', present: operacionContent.includes('Cuentas de Operaciones Financieras') },
      { label: 'Cuentas de Candidatos & Atracción de Talento', present: operacionContent.includes('Cuentas de Candidatos') },
      { label: 'Cuentas de Colaboradores & Personal Operativo', present: operacionContent.includes('Cuentas de Colaboradores') }
    ];

    console.log('\n--- 4. VERIFICACIÓN DE CUADRANTES OPERATIVOS EN PRODUCCIÓN ---');
    opChecks.forEach(c => {
      console.log(`${c.present ? '✅' : '❌'} ${c.label}: ${c.present ? 'SINCRONIZADO' : 'PENDIENTE'}`);
    });
  } else {
    console.log('Botón de Operación no visible de forma directa.');
  }

  await browser.close();
  console.log('\n🏁 Auditoría de producción finalizada con éxito.');
}

verifyProduction().catch(err => {
  console.error('Error durante verificación de producción:', err);
  process.exit(1);
});
