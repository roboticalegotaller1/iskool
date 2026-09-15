import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle2' });
  
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const demoToggle = buttons.find(b => b.textContent && (b.textContent.includes('Ver perfiles') || b.textContent.includes('Explorar')));
    if (demoToggle) demoToggle.click();
  });

  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const lucasBtn = buttons.find(b => b.textContent && b.textContent.includes('Lucas Skywalker'));
    if (lucasBtn) lucasBtn.click();
  });

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 2000));

  console.log('Current URL:', page.url());
  await page.screenshot({ path: 'test_student_dashboard_live.png' });
  
  // Also check avatar customization modal or page
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const customBtn = buttons.find(b => b.textContent && b.textContent.includes('Personalizar Traje'));
    if (customBtn) customBtn.click();
  });

  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: 'test_student_customizer_live.png' });

  await browser.close();
  console.log('Finished capturing live pages!');
})();
