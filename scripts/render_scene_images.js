const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function renderScenes() {
  const outputDir = path.join(__dirname, '..', 'temp_video_frames');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log('🚀 Launching Puppeteer to capture all 10 high-impact master scene slides...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: {
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1
    },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  const htmlPath = 'file:///' + path.join(__dirname, '..', 'video_scenes.html').replace(/\\/g, '/');

  for (let i = 1; i <= 10; i++) {
    console.log(`📸 Rendering Scene ${i} / 10...`);
    await page.goto(`${htmlPath}?scene=${i}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 450)); // Allow fonts, shadows and images to settle

    const outPng = path.join(outputDir, `scene_slide_${i}.png`);
    await page.screenshot({ path: outPng, type: 'png' });
    console.log(`✅ Saved: ${outPng}`);
  }

  await browser.close();
  console.log('🎉 All 10 master scene slides rendered successfully!');
}

renderScenes().catch(err => {
  console.error('Error rendering scenes:', err);
  process.exit(1);
});
