const puppeteer = require('puppeteer');
const path = require('path');

const teacherUser = {
  id: 'usr-teacher-1',
  first_name: 'Prof. Israel',
  last_name: 'López Ángeles',
  role: 'teacher',
  email: 'israel.lopez@jjrosseau.edu.mx'
};

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950, deviceScaleFactor: 1.5 });
  
  await page.evaluateOnNewDocument((userToInject) => {
    localStorage.setItem('iskool_session_user', JSON.stringify(userToInject));
  }, teacherUser);

  console.log('Navigating to /teacher...');
  await page.goto('http://localhost:3000/teacher', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));

  // Click card with 'Gestión Oficial'
  console.log('Clicking card Gestión Oficial...');
  await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const target = divs.find(el => el.textContent && el.textContent.includes('Gestión Oficial'));
    if (target) {
      target.click();
    }
  });
  await new Promise(r => setTimeout(r, 2000));

  // Now click on "📖 Planeación NEM"
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
  console.log('Clicked Planeación NEM:', clickedPlan);
  await new Promise(r => setTimeout(r, 3000));

  const filePath = path.join(__dirname, '../presentation_screenshots/screen_teacher_planning_nem.png');
  await page.screenshot({ path: filePath });
  console.log('Saved screen_teacher_planning_nem.png!');

  await browser.close();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
