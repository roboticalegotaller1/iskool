const puppeteer = require('puppeteer');
const fs = require('fs');

async function drawGrid(imageFile, outFile) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024 });
  const imgBase64 = fs.readFileSync(imageFile).toString('base64');
  
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <body style="margin:0; background:black;">
        <canvas id="cv" width="1024" height="1024"></canvas>
      </body>
    </html>
  `);

  await page.evaluate(async (base64) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const cv = document.getElementById('cv');
        const ctx = cv.getContext('2d');
        ctx.drawImage(img, 0, 0);

        // Draw grid lines every 50px
        ctx.lineWidth = 1;
        ctx.font = 'bold 12px monospace';
        for (let x = 0; x <= 1024; x += 50) {
          ctx.strokeStyle = (x % 100 === 0) ? 'rgba(0, 255, 255, 0.7)' : 'rgba(0, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, 1024);
          ctx.stroke();
          ctx.fillStyle = 'yellow';
          ctx.fillText(x.toString(), x + 2, 20);
          ctx.fillText(x.toString(), x + 2, 1000);
        }

        for (let y = 0; y <= 1024; y += 50) {
          ctx.strokeStyle = (y % 100 === 0) ? 'rgba(255, 0, 255, 0.7)' : 'rgba(255, 0, 255, 0.3)';
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(1024, y);
          ctx.stroke();
          ctx.fillStyle = 'lime';
          ctx.fillText(y.toString(), 10, y - 2);
          ctx.fillText(y.toString(), 960, y - 2);
        }

        // Draw fine grid in central face area: x 400..600, y 300..700 every 10px
        for (let x = 400; x <= 620; x += 20) {
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
          ctx.beginPath();
          ctx.moveTo(x, 300);
          ctx.lineTo(x, 700);
          ctx.stroke();
          ctx.fillStyle = 'white';
          ctx.fillText(x.toString(), x + 1, 315);
        }
        for (let y = 300; y <= 700; y += 20) {
          ctx.strokeStyle = 'rgba(255, 255, 0, 0.4)';
          ctx.beginPath();
          ctx.moveTo(400, y);
          ctx.lineTo(620, y);
          ctx.stroke();
          ctx.fillStyle = 'white';
          ctx.fillText(y.toString(), 405, y - 2);
        }

        resolve();
      };
      img.src = 'data:image/jpeg;base64,' + base64;
    });
  }, imgBase64);

  const buffer = await page.screenshot({ type: 'jpeg', quality: 90 });
  fs.writeFileSync(outFile, buffer);
  await browser.close();
  console.log('Saved grid to ' + outFile);
}

(async () => {
  const inPath = process.argv[2] || 'public/images/languages/historical/napoleon.jpg';
  const outPath = process.argv[3] || 'public/debug_grid_output.jpg';
  await drawGrid(inPath, outPath);
})();
