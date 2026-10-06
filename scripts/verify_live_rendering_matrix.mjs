import puppeteer from 'puppeteer';

(async () => {
  console.log('Starting Live Browser Verification Matrix with Blonde Hair...');
  const browser = await puppeteer.launch({ 
    headless: 'new', 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Log in
  console.log('Navigating to /login...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  await page.type('input[type="email"], input[type="text"]', 'iker.morales@ibime.edu.mx');
  await page.type('input[type="password"]', 'ISkoolPassword2026!');

  await page.evaluate(() => {
    const btn = document.querySelector('button[type="submit"]');
    if (btn) btn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1500));

  // 2. Go to /student/avatar
  console.log('Navigating to /student/avatar...');
  await page.goto('http://localhost:3000/student/avatar', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2500));

  async function takeCanvasShot(name) {
    const canvas = await page.$('canvas');
    if (canvas) {
      await canvas.screenshot({ path: name });
      console.log(`Saved screenshot: ${name}`);
    }
  }

  async function clickNavCategory(catText) {
    console.log(`Navigating to category: ${catText}...`);
    await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('div.w-24 button, div.w-28 button, button'));
      const btn = buttons.find(b => b.textContent && b.textContent.toUpperCase().includes(text.toUpperCase()));
      if (btn) btn.click();
    }, catText);
    await new Promise(r => setTimeout(r, 1000));
  }

  async function clickSubTab(subText) {
    console.log(`Clicking SubTab: ${subText}...`);
    await page.evaluate((text) => {
      const buttons = Array.from(document.querySelectorAll('div.grid button, button'));
      const btn = buttons.find(b => b.textContent && b.textContent.toUpperCase().includes(text.toUpperCase()));
      if (btn) btn.click();
    }, subText);
    await new Promise(r => setTimeout(r, 1000));
  }

  async function clickItem(itemText, filename) {
    console.log(`Selecting item: ${itemText}...`);
    await page.evaluate((text) => {
      const elements = Array.from(document.querySelectorAll('button, div[role="button"]'));
      const target = elements.find(el => el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase()));
      if (target) {
        target.click();
      }
    }, itemText);
    await new Promise(r => setTimeout(r, 1500));
    if (filename) await takeCanvasShot(filename);
  }

  // 3. SET HAIR COLOR TO BLONDE (#FBBF24 - Rubio Dorado Solar)
  await clickNavCategory('APPEARANCE');
  await clickSubTab('Color');
  await clickItem('Rubio Dorado', null);
  await new Promise(r => setTimeout(r, 1200));

  // 4. Test Melena Ondulada Suave with all tops
  await clickSubTab('Pelo');
  await clickItem('Ondulada', 'live_blonde_1_wavy_initial.png');

  await clickNavCategory('TOPS');
  await clickItem('Rúnica', 'live_blonde_2_wavy_rune.png');
  await clickItem('Atlética', 'live_blonde_3_wavy_tank.png');
  await clickItem('Escolar', 'live_blonde_4_wavy_blouse.png');
  await clickItem('Básica', 'live_blonde_5_wavy_basic.png');

  // 5. Test Dreadlocks with tops
  await clickNavCategory('APPEARANCE');
  await clickSubTab('Pelo');
  await clickItem('Dreadlocks', 'live_blonde_6_dreads_initial.png');

  await clickNavCategory('TOPS');
  await clickItem('Rúnica', 'live_blonde_7_dreads_rune.png');
  await clickItem('Atlética', 'live_blonde_8_dreads_tank.png');

  // 6. Test Melena Lisa (Straight Long) with tops
  await clickNavCategory('APPEARANCE');
  await clickSubTab('Pelo');
  await clickItem('Lisa', 'live_blonde_9_straight_initial.png');

  await clickNavCategory('TOPS');
  await clickItem('Rúnica', 'live_blonde_10_straight_rune.png');
  await clickItem('Atlética', 'live_blonde_11_straight_tank.png');

  // 7. Test Coleta Alta (Ponytail) with tops
  await clickNavCategory('APPEARANCE');
  await clickSubTab('Pelo');
  await clickItem('Coleta', 'live_blonde_12_pony_initial.png');

  await clickNavCategory('TOPS');
  await clickItem('Rúnica', 'live_blonde_13_pony_rune.png');
  await clickItem('Atlética', 'live_blonde_14_pony_tank.png');

  await browser.close();
  console.log('=== BLONDE VERIFICATION COMPLETE ===');
})();
