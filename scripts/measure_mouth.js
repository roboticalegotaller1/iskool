const puppeteer = require('puppeteer');
const fs = require('fs');

async function measure(imageFile) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024 });
  const imgBase64 = fs.readFileSync('public/images/languages/historical/' + imageFile).toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"/></head>
      <body style="margin:0; background:black;">
        <canvas id="cv" width="1024" height="1024"></canvas>
      </body>
    </html>
  `);

  const result = await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Scan central face box x: 400..624, y: 300..750
        // Find lips by detecting the red-chrominance peak (R - G) and lip darkness line
        const rows = [];
        for (let y = 300; y <= 750; y += 2) {
          let maxRedDiff = -999;
          let bestX = 512;
          let minLum = 999;
          let minLumX = 512;

          for (let x = 440; x <= 580; x++) {
            const d = ctx.getImageData(x, y, 1, 1).data;
            const r = d[0], g = d[1], b = d[2];
            const redDiff = r - (g + b) / 2; // Lip redness
            const lum = 0.299 * r + 0.587 * g + 0.114 * b; // Mouth fissure is usually dark

            if (redDiff > maxRedDiff) {
              maxRedDiff = redDiff;
              bestX = x;
            }
            if (lum < minLum) {
              minLum = lum;
              minLumX = x;
            }
          }
          rows.push({ y, maxRedDiff, bestX, minLum, minLumX });
        }
        resolve(rows);
      };
      img.src = 'data:image/jpeg;base64,' + base64;
    });
  }, imgBase64);

  await browser.close();
  return result;
}

(async () => {
  const file = process.argv[2] || 'napoleon.jpg';
  const rows = await measure(file);
  
  // Sort by highest redDiff or inspect peaks
  const sortedByRed = [...rows].sort((a, b) => b.maxRedDiff - a.maxRedDiff);
  console.log('Top 10 red chrominance rows for ' + file + ':');
  console.log(sortedByRed.slice(0, 10));

  // Find local darkness minima near high red diff
  const sortedByDarkness = [...rows].sort((a, b) => a.minLum - b.minLum);
  console.log('Top 10 dark fissure rows for ' + file + ':');
  console.log(sortedByDarkness.slice(0, 10));
})();
