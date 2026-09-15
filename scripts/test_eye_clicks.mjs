import puppeteer from 'puppeteer';
import sharp from 'sharp';

async function testClicks() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/login');
  await page.evaluate(() => {
    localStorage.setItem('iskool_session_user', JSON.stringify({
      id: 'std-pa', role: 'student', email: 'lucas@iskool.edu.mx', school_id: 'sch-test-case'
    }));
  });

  await page.goto('http://localhost:3000/student/avatar', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Select Female
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const femaleBtn = buttons.find(b => b.textContent && b.textContent.includes('Femenino'));
    if (femaleBtn) femaleBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  // Click Ojos tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const eyesTab = buttons.find(b => b.textContent && b.textContent.includes('Ojos'));
    if (eyesTab) eyesTab.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const clickEyeButton = async (targetText) => {
    console.log(`Clicking eye button: ${targetText}...`);
    const found = await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.textContent && b.textContent.includes(text));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, targetText);
    console.log(`Found and clicked: ${found}`);
    await new Promise(r => setTimeout(r, 1500));
  };

  const cropAndSaveFace = async (filename) => {
    const screenBuf = await page.screenshot({ fullPage: false });
    // Crop face at { left: 740, top: 330, width: 280, height: 230 }
    await sharp(screenBuf)
      .extract({ left: 740, top: 330, width: 280, height: 230 })
      .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/${filename}`);
    console.log(`Saved ${filename}`);
  };

  // 1. Alegres y Radiantes (smiling closed arcs ^_^)
  await clickEyeButton('Alegres y Radiantes');
  await cropAndSaveFace('verified_live_alegres.png');

  // 2. Heterocromía Bicolor
  await clickEyeButton('Heterocromía Bicolor');
  await cropAndSaveFace('verified_live_heterocromia.png');

  // 3. Felinos de Cazador
  await clickEyeButton('Felinos de Cazador');
  await cropAndSaveFace('verified_live_felinos.png');

  // 4. Determinados Heroicos
  await clickEyeButton('Determinados Heroicos');
  await cropAndSaveFace('verified_live_determinados.png');

  await browser.close();
  console.log('All tests finished successfully!');
}

testClicks().catch(console.error);
