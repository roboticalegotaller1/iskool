const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const teacherUser = {
  id: 'usr-teacher-1',
  first_name: 'Prof. Israel',
  last_name: 'López Ángeles',
  role: 'teacher',
  email: 'israel.lopez@jjrosseau.edu.mx'
};

async function capture() {
  const outputDir = path.join(__dirname, '../presentation_screenshots');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1000']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1.5 });

  await page.evaluateOnNewDocument((userToInject) => {
    localStorage.setItem('iskool_session_user', JSON.stringify(userToInject));
  }, teacherUser);

  console.log('Navigating to /teacher...');
  await page.goto('http://localhost:3000/teacher', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 2000));

  // Save hub screenshot
  await page.screenshot({ path: path.join(outputDir, 'screen_teacher_hub.png') });
  console.log('Saved screen_teacher_hub.png');

  // Click on Mis Clases card
  console.log('Clicking card Mis Clases...');
  await page.evaluate(() => {
    const headings = Array.from(document.querySelectorAll('h2'));
    const target = headings.find(h => h.textContent && h.textContent.includes('Mis Clases'));
    if (target) {
      target.closest('div[class*="group"]')?.click();
    }
  });
  await new Promise(r => setTimeout(r, 2500));

  // Click on "📖 Planeación NEM"
  console.log('Clicking on Planeación NEM tab...');
  const clickedPlan = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.textContent && btn.textContent.includes('Planeación NEM'));
    if (b) {
      b.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Planeación NEM button:', clickedPlan);
  await new Promise(r => setTimeout(r, 4000));

  // Take screenshot of PlanningTab
  await page.screenshot({ path: path.join(outputDir, 'screen_teacher_planning_nem.png') });
  console.log('Saved screen_teacher_planning_nem.png');

  await browser.close();
  console.log('Done!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
