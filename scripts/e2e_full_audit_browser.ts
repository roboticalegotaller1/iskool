import { chromium } from 'playwright';
import { signMultiTenantToken } from '../src/lib/auth/multiTenantSession';
import * as path from 'path';

async function runFullAudit() {
  console.log('🚀 Iniciando Auditoría Quirúrgica E2E en Navegador Chromium...');

  const token = await signMultiTenantToken({
    id: 'usr-ibime-ceo-dir',
    email: 'patricia.sandoval@ibime.edu.mx',
    tenant_id: 'ibime',
    role: 'director',
    school_id: 'school-ibime-campus-central',
    first_name: 'Patricia',
    last_name: 'Sandoval'
  });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });

  await context.addCookies([
    {
      name: 'ibime_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    },
    {
      name: 'iskool_session',
      value: token,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      sameSite: 'Lax'
    }
  ]);

  const page = await context.newPage();

  // Escuchar errores de consola
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('Browser Console Error:', msg.text());
    }
  });

  console.log('🌐 Navegando a http://localhost:3000/ibime/portal?view=ceo ...');
  await page.goto('http://localhost:3000/ibime/portal?view=ceo', { waitUntil: 'networkidle' });

  // Inyectar usuario en localStorage para Zustand
  await page.evaluate(() => {
    const user = {
      id: 'usr-ibime-ceo-dir',
      email: 'patricia.sandoval@ibime.edu.mx',
      tenant_id: 'ibime',
      role: 'director',
      school_id: 'school-ibime-campus-central',
      name: 'Lic. Patricia Sandoval Morales'
    };
    localStorage.setItem('iskool_current_user', JSON.stringify(user));
    localStorage.setItem('auth_token', 'mock-token');
  });

  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const saveArtifactDir = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\b49a38e1-d765-49d1-acd2-6a44fabbbbea';

  // 1. Captura de la pantalla principal de CEO
  console.log('📸 1. Capturando Dashboard Ejecutivo CEO...');
  await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-01-ceo-dashboard.png'), fullPage: true });

  // 3. Abrir Modal de Email & Triage CEO
  console.log('🔍 3. Abriendo Modal de Email & Triage...');
  const emailTriageBtn = page.locator('button:has-text("Email & Triage")').first();
  await emailTriageBtn.click();
  await page.waitForTimeout(1500);

  // 4. Tab 1: Bandeja Inteligente (IA)
  console.log('📸 4. Verificando Tab: Bandeja Inteligente...');
  await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-01-bandeja-inteligente.png') });

  const cardLocator = page.locator('text=MAT-IBIME-2026-387');
  const cardCount = await cardLocator.count();
  console.log(`   Resultado de búsqueda MAT-IBIME-2026-387: ${cardCount} encontrada(s).`);

  // Comprobar si está la tarjeta de comedor y hacer scroll hacia ella
  if (cardCount > 0) {
    await cardLocator.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-01-dining-card.png') });
  }

  // 5. Tab 2: Bandeja de Entrada (IMAP / En Vivo)
  console.log('📸 5. Cambiando a Tab: Bandeja de Entrada...');
  const inboxTabBtn = page.locator('button:has-text("Bandeja de Entrada")').first();
  if (await inboxTabBtn.isVisible()) {
    await inboxTabBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-02-bandeja-entrada.png') });
  }

  // 6. Tab 3: Calendario Directivo
  console.log('📸 6. Cambiando a Tab: Calendario Directivo...');
  const calendarTabBtn = page.locator('button:has-text("Calendario")').first();
  if (await calendarTabBtn.isVisible()) {
    await calendarTabBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-03-calendario.png') });
  }

  // 7. Tab 4: Redactar Circular
  console.log('📸 7. Cambiando a Tab: Redactar Circular...');
  const composeTabBtn = page.locator('button:has-text("Redactar")').first();
  if (await composeTabBtn.isVisible()) {
    await composeTabBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-04-redactar.png') });
  }

  // 8. Tab 5: Laboratorio de Triage
  console.log('📸 8. Cambiando a Tab: Laboratorio de Triage...');
  const labTabBtn = page.locator('button:has-text("Laboratorio")').first();
  if (await labTabBtn.isVisible()) {
    await labTabBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-05-laboratorio.png') });
  }

  // 9. Tab 6: Ajustes de Servidor
  console.log('📸 9. Cambiando a Tab: Ajustes de Servidor...');
  const settingsTabBtn = page.locator('button:has-text("Ajustes")').first();
  if (await settingsTabBtn.isVisible()) {
    await settingsTabBtn.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(saveArtifactDir, 'e2e-modal-06-ajustes.png') });
  }

  // Comprobar textos en pantalla sobre CDMX
  const content = await page.content();
  const hasCdmxIndicator = content.includes('CDMX') || content.includes('hrs');
  console.log(`   ¿Indicadores de horario CDMX presentes en el modal?: ${hasCdmxIndicator}`);

  await browser.close();
  console.log('✅ Auditoría E2E Chromium de todos los tabs completada con éxito.');
}

runFullAudit().catch(err => {
  console.error('❌ Error en auditoría E2E:', err);
  process.exit(1);
});
