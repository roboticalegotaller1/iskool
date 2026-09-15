import puppeteer from 'puppeteer';
import path from 'path';

const artifactsDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';

async function verifyInBrowser() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Setting student session in localStorage...');
  await page.goto('http://localhost:3000/login');
  await page.evaluate(() => {
    const student = {
      id: 'std-pa',
      first_name: 'Lucas',
      last_name: 'Skywalker',
      role: 'student',
      email: 'lucas@iskool.edu.mx',
      school_id: 'sch-test-case',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    localStorage.setItem('iskool_session_user', JSON.stringify(student));
  });

  console.log('Navigating to avatar customizer...');
  await page.goto('http://localhost:3000/student/avatar', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // 1. Select Female gender
  console.log('Selecting female gender...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const femaleBtn = buttons.find(b => b.textContent && b.textContent.includes('Femenino'));
    if (femaleBtn) femaleBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // 2. Click Zoom Rostro
  console.log('Clicking Zoom Rostro...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const zoomBtn = buttons.find(b => b.textContent && b.textContent.includes('Rostro'));
    if (zoomBtn) zoomBtn.click();
  });
  await new Promise(r => setTimeout(r, 1200));

  // 3. Click Ojos tab
  console.log('Clicking Ojos tab...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const eyesTab = buttons.find(b => b.textContent && b.textContent.includes('Ojos'));
    if (eyesTab) eyesTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Function to click an eye card by name and take screenshot
  async function selectEyeCardAndScreenshot(name, filename) {
    console.log(`Selecting eye option: ${name}...`);
    await page.evaluate((targetName) => {
      const cards = Array.from(document.querySelectorAll('div, button'));
      const card = cards.find(c => c.textContent && c.textContent.includes(targetName));
      if (card) card.click();
    }, name);
    await new Promise(r => setTimeout(r, 1500));

    // Capture the avatar viewport
    const outPath = path.join(artifactsDir, filename);
    await page.screenshot({ path: outPath, clip: { x: 50, y: 100, width: 620, height: 680 } });
    console.log(`Saved screenshot to ${outPath}`);
  }

  // 4. Test eye styles
  await selectEyeCardAndScreenshot('Determinados', 'verify_eyes_determinados.png');
  await selectEyeCardAndScreenshot('Heterocromía', 'verify_eyes_heterochromia.png');
  await selectEyeCardAndScreenshot('Zafiro', 'verify_eyes_zafiro.png');
  await selectEyeCardAndScreenshot('Alegres', 'verify_eyes_alegres.png');
  await selectEyeCardAndScreenshot('Felinos', 'verify_eyes_felinos.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
}

verifyInBrowser().catch(console.error);
