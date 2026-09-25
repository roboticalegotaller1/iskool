const puppeteer = require('puppeteer');
const fs = require('fs');

const configs = {
  napoleon: {
    cx: 484,
    cy: 375,
    x1: 454,
    y1: 375,
    x2: 514,
    y2: 375,
    maxOpening: 9.5,
    cavityDarkColor: '#120304',
    cavityMidColor: '#28060a',
    cavityRimColor: '#421015',
    lowerLipRimColor: 'rgba(175, 95, 85, 0.92)',
    teethColor: '#eee7db'
  },
  shakespeare: {
    cx: 460,
    cy: 472,
    x1: 428,
    y1: 472,
    x2: 492,
    y2: 472,
    maxOpening: 10,
    cavityDarkColor: '#0e0203',
    cavityMidColor: '#240508',
    cavityRimColor: '#400e12',
    lowerLipRimColor: 'rgba(165, 80, 75, 0.92)',
    teethColor: '#ece4d6',
    mustacheCover: true
  },
  abraham_lincoln: {
    cx: 490,
    cy: 458,
    x1: 452,
    y1: 458,
    x2: 528,
    y2: 458,
    maxOpening: 10.5,
    cavityDarkColor: '#0a0203',
    cavityMidColor: '#220407',
    cavityRimColor: '#3e0c12',
    lowerLipRimColor: 'rgba(160, 85, 78, 0.90)',
    teethColor: '#eae1d2'
  },
  ada_lovelace: {
    cx: 494,
    cy: 340,
    x1: 468,
    y1: 340,
    x2: 520,
    y2: 340,
    maxOpening: 8.5,
    cavityDarkColor: '#140305',
    cavityMidColor: '#2d070c',
    cavityRimColor: '#4a1218',
    lowerLipRimColor: 'rgba(195, 90, 95, 0.92)',
    teethColor: '#f5efe6'
  },
  marie_curie: {
    cx: 490,
    cy: 440,
    x1: 456,
    y1: 440,
    x2: 524,
    y2: 440,
    maxOpening: 9.5,
    cavityDarkColor: '#100203',
    cavityMidColor: '#260509',
    cavityRimColor: '#441016',
    lowerLipRimColor: 'rgba(168, 82, 80, 0.90)',
    teethColor: '#eee5d8'
  },
  victor_hugo: {
    cx: 504,
    cy: 394,
    x1: 476,
    y1: 394,
    x2: 534,
    y2: 394,
    maxOpening: 10,
    cavityDarkColor: '#0c0203',
    cavityMidColor: '#240407',
    cavityRimColor: '#400e12',
    lowerLipRimColor: 'rgba(155, 78, 72, 0.90)',
    teethColor: '#eae1d2',
    mustacheCover: true
  },
  jeanne_darc: {
    cx: 500,
    cy: 382,
    x1: 472,
    y1: 382,
    x2: 528,
    y2: 382,
    maxOpening: 9,
    cavityDarkColor: '#120305',
    cavityMidColor: '#2a060b',
    cavityRimColor: '#461117',
    lowerLipRimColor: 'rgba(185, 90, 90, 0.92)',
    teethColor: '#f2ebe0'
  }
};

async function renderMouthTest(charKey, mouthOpenRatio = 0.65) {
  const cfg = configs[charKey];
  if (!cfg) throw new Error('Unknown char ' + charKey);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 600, height: 600 });
  const imgBase64 = fs.readFileSync('public/images/languages/historical/' + charKey + '.jpg').toString('base64');

  const effX1 = cfg.x1;
  const effX2 = cfg.x2;
  const verticalDrop = mouthOpenRatio * cfg.maxOpening;
  const teethHeight = Math.min(verticalDrop * 0.45, 4.5);

  const html = `
    <!DOCTYPE html>
    <html>
      <head><meta charset="utf-8"/></head>
      <body style="margin:0; background:#0f172a; display:flex; align-items:center; justify-content:center; height:100vh;">
        <div style="position:relative; width:450px; height:450px; border-radius:24px; overflow:hidden; border:4px solid #f59e0b;">
          <img src="data:image/jpeg;base64,${imgBase64}" style="width:100%; height:100%; object-fit:cover;" />
          <svg viewBox="0 0 1024 1024" style="position:absolute; inset:0; width:100%; height:100%;">
            <defs>
              <radialGradient id="cavity" cx="50%" cy="30%" r="65%">
                <stop offset="0%" stop-color="${cfg.cavityDarkColor}" />
                <stop offset="55%" stop-color="${cfg.cavityMidColor}" />
                <stop offset="100%" stop-color="${cfg.cavityRimColor}" />
              </radialGradient>
              <linearGradient id="teeth" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${cfg.teethColor}" stop-opacity="0.95" />
                <stop offset="70%" stop-color="#d8cdba" stop-opacity="0.85" />
                <stop offset="100%" stop-color="#908070" stop-opacity="0.1" />
              </linearGradient>
              <linearGradient id="lowerLip" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="${cfg.lowerLipRimColor}" />
                <stop offset="60%" stop-color="rgba(165, 80, 75, 0.7)" />
                <stop offset="100%" stop-color="rgba(195, 110, 105, 0.1)" />
              </linearGradient>
            </defs>

            <!-- 1. Cavidad bucal profunda -->
            <path 
              d="M ${effX1} ${cfg.y1} Q ${cfg.cx} ${cfg.cy - mouthOpenRatio * 1.5} ${effX2} ${cfg.y2} Q ${cfg.cx} ${cfg.cy + verticalDrop} ${effX1} ${cfg.y1} Z" 
              fill="url(#cavity)" 
            />

            <!-- 2. Fila superior de dientes -->
            <path 
              d="M ${cfg.cx - 18} ${cfg.cy - 1} Q ${cfg.cx} ${cfg.cy - 2} ${cfg.cx + 18} ${cfg.cy - 1.2} Q ${cfg.cx + 18} ${cfg.cy - 1 + teethHeight} Q ${cfg.cx} ${cfg.cy + teethHeight} ${cfg.cx - 18} ${cfg.cy - 1 + teethHeight} Z" 
              fill="url(#teeth)" 
            />

            <!-- 3. Sombra lingual interna -->
            <ellipse 
              cx="${cfg.cx}" 
              cy="${cfg.cy + verticalDrop * 0.72}" 
              rx="${10 + mouthOpenRatio * 3}" 
              ry="${1.5 + mouthOpenRatio * 1.2}" 
              fill="#4a1016" 
              opacity="0.88" 
            />

            <!-- 4. Labio inferior carnoso -->
            <path 
              d="M ${effX1 + 2} ${cfg.y1 + 0.5} Q ${cfg.cx} ${cfg.cy + verticalDrop} ${effX2 - 2} ${cfg.y2 + 0.5} Q ${cfg.cx} ${cfg.cy + verticalDrop + 2.8} ${effX1 + 2} ${cfg.y1 + 0.5} Z" 
              fill="url(#lowerLip)" 
              opacity="0.95" 
            />
          </svg>
        </div>
      </body>
    </html>
  `;

  await page.setContent(html);
  const outPath = 'public/test_mouth_' + charKey + '.jpg';
  const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
  fs.writeFileSync(outPath, buf);
  await browser.close();
  console.log('Saved test render to ' + outPath);
}

(async () => {
  const char = process.argv[2] || 'napoleon';
  await renderMouthTest(char, 0.7);
})();
