import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const brainDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const outDir = 'C:/Users/kami-/.gemini/antigravity-ide/scratch/ISkool/public/images/avatar/hairstyles';

const femaleStyles = [
  { key: 'bob', file: 'female_bob_hair_1789408499258.jpg', maxY: 340, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'afro', file: 'female_afro_hair_1789410848594.jpg', maxY: 310, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'ponytail', file: 'female_ponytail_hair_1789410889479.jpg', maxY: 380, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'twin_braids', file: 'female_twin_braids_1789410935348.jpg', maxY: 470, sideOnlyFromY: 275, xMinSide: 350, xMaxSide: 420 },
  { key: 'wavy_long', file: 'female_wavy_long_1789410986589.jpg', maxY: 620, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'sidecut', file: 'female_sidecut_1789411042082.jpg', maxY: 310, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'witch_curls', file: 'female_witch_curls_1789411089561.jpg', maxY: 660, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'dreadlocks', file: 'female_dreadlocks_1789411138960.jpg', maxY: 560, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'straight_long', file: 'female_straight_long_1789411188697.jpg', maxY: 660, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
  { key: 'wild_mane', file: 'female_wild_mane_1789411233391.jpg', maxY: 560, sideOnlyFromY: 280, xMinSide: 350, xMaxSide: 420 },
];

const styleKeys = [
  'afro', 'bob', 'dreadlocks', 'ponytail', 'sidecut',
  'straight_long', 'twin_braids', 'wavy_long', 'wild_mane', 'witch_curls'
];

async function build() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 1600 });
  await page.goto('http://localhost:3000');

  // Load clean female base image for lower body compositing
  const cleanFemaleB64 = fs.readFileSync('C:/Users/kami-/.gemini/antigravity-ide/scratch/ISkool/public/images/avatar/trainer_female_clean.png').toString('base64');

  console.log('--- 1. BUILDING FEMALE HAIRSTYLES ---');
  for (const style of femaleStyles) {
    const fullPath = path.join(brainDir, style.file);
    if (!fs.existsSync(fullPath)) {
      console.error(`File missing: ${fullPath}`);
      continue;
    }

    const b64 = fs.readFileSync(fullPath).toString('base64');
    console.log(`Processing female ${style.key}...`);

    const result = await page.evaluate(async (jpgB64, cleanB64, config) => {
      async function load(dataUrl) {
        return new Promise((res) => {
          const img = new Image();
          img.onload = () => res(img);
          img.src = dataUrl;
        });
      }

      const img = await load('data:image/jpeg;base64,' + jpgB64);
      const cleanImg = await load('data:image/png;base64,' + cleanB64);

      const w = 768;
      const h = 1376;

      // Source JPG canvas
      const srcCanvas = document.createElement('canvas');
      srcCanvas.width = w;
      srcCanvas.height = h;
      const sCtx = srcCanvas.getContext('2d');
      sCtx.drawImage(img, 0, 0, w, h);
      const sData = sCtx.getImageData(0, 0, w, h).data;

      // Clean base canvas
      const cleanCanvas = document.createElement('canvas');
      cleanCanvas.width = w;
      cleanCanvas.height = h;
      const cCtx = cleanCanvas.getContext('2d');
      cCtx.drawImage(cleanImg, 0, 0, w, h);
      const cData = cCtx.getImageData(0, 0, w, h).data;

      // Flood-fill for transparency on outer background
      const visited = new Uint8Array(w * h);
      const queue = [];

      function pushPixel(x, y) {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const idx = y * w + x;
        if (visited[idx]) return;
        const pIdx = idx * 4;
        const r = sData[pIdx], g = sData[pIdx + 1], b = sData[pIdx + 2];
        if (r >= 238 && g >= 238 && b >= 238) {
          visited[idx] = 1;
          queue.push(x, y);
        }
      }

      for (let x = 0; x < w; x++) {
        pushPixel(x, 0);
        pushPixel(x, h - 1);
      }
      for (let y = 0; y < h; y++) {
        pushPixel(0, y);
        pushPixel(w - 1, y);
      }

      let qIdx = 0;
      while (qIdx < queue.length) {
        const x = queue[qIdx++];
        const y = queue[qIdx++];
        pushPixel(x + 1, y);
        pushPixel(x - 1, y);
        pushPixel(x, y + 1);
        pushPixel(x, y - 1);
      }

      // Output sprite canvas
      const outCanvas = document.createElement('canvas');
      outCanvas.width = w;
      outCanvas.height = h;
      const outCtx = outCanvas.getContext('2d');
      const outImgData = outCtx.createImageData(w, h);
      const od = outImgData.data;

      // Output mask canvas
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = w;
      maskCanvas.height = h;
      const maskCtx = maskCanvas.getContext('2d');
      const maskImgData = maskCtx.createImageData(w, h);
      const md = maskImgData.data;

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = y * w + x;
          const pIdx = idx * 4;

          const isOuterBg = visited[idx] === 1;

          // Compositing logic:
          // 1. If outer background -> completely transparent
          if (isOuterBg) {
            od[pIdx] = 0;
            od[pIdx + 1] = 0;
            od[pIdx + 2] = 0;
            od[pIdx + 3] = 0;
            continue;
          }

          const sr = sData[pIdx], sg = sData[pIdx + 1], sb = sData[pIdx + 2];

          // Soft anti-alias on edges
          let alpha = 255;
          if (sr > 240 && sg > 240 && sb > 240) {
            const maxC = Math.max(sr, sg, sb);
            alpha = Math.max(0, 255 - (maxC - 240) * 16);
          }

          // In the lower body below max hair reach, guarantee pristine clean base pixels:
          if (y > config.maxY + 20) {
            od[pIdx] = cData[pIdx];
            od[pIdx + 1] = cData[pIdx + 1];
            od[pIdx + 2] = cData[pIdx + 2];
            od[pIdx + 3] = cData[pIdx + 3];
            continue;
          }

          // Otherwise, copy from illustrated sprite
          od[pIdx] = sr;
          od[pIdx + 1] = sg;
          od[pIdx + 2] = sb;
          od[pIdx + 3] = alpha;

          // Hair mask calculation:
          // Only within hair vertical span (y: 65 to maxY)
          if (y >= 65 && y <= config.maxY && alpha > 60) {
            const isSkin = (sr > 170 && sg > 120 && sb > 95 && sr > sb + 20);
            const isWhiteEye = (sr > 200 && sg > 200 && sb > 200);

            let isHairPixel = false;

            if (y <= config.sideOnlyFromY) {
              // Above neck: not skin, not eyes
              if (!isSkin && !isWhiteEye) {
                isHairPixel = true;
              }
            } else {
              // Below neck: must be on outer flanks (outside shirt center) and dark hair tone
              if ((x < config.xMinSide || x > config.xMaxSide) && !isSkin) {
                const lum = 0.299 * sr + 0.587 * sg + 0.114 * sb;
                if (lum < 115) {
                  isHairPixel = true;
                }
              }
            }

            if (isHairPixel) {
              md[pIdx] = 255;
              md[pIdx + 1] = 255;
              md[pIdx + 2] = 255;
              md[pIdx + 3] = 255;
            }
          }
        }
      }

      outCtx.putImageData(outImgData, 0, 0);
      maskCtx.putImageData(maskImgData, 0, 0);

      return {
        pngDataUrl: outCanvas.toDataURL('image/png'),
        maskDataUrl: maskCanvas.toDataURL('image/png')
      };
    }, b64, cleanFemaleB64, style);

    const pngBase64 = result.pngDataUrl.replace(/^data:image\/png;base64,/, '');
    const maskBase64 = result.maskDataUrl.replace(/^data:image\/png;base64,/, '');

    const pngFile = path.join(outDir, `trainer_female_${style.key}.png`);
    const maskFile = path.join(outDir, `trainer_female_${style.key}_hair_mask.png`);

    const rawBuffer = Buffer.from(pngBase64, 'base64');
    const cleanedBuffer = await cleanEyesOnImageBuffer(rawBuffer);
    fs.writeFileSync(pngFile, cleanedBuffer);
    fs.writeFileSync(maskFile, Buffer.from(maskBase64, 'base64'));
    console.log(`Successfully generated and cleaned trainer_female_${style.key}.png`);
  }

async function cleanEyesOnImageBuffer(inputBuffer) {
  const { data, info } = await sharp(inputBuffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width, h = info.height;
  const out = Buffer.from(data);

  // Left eye inpaint:
  for (let absY = 180; absY <= 210; absY++) {
    for (let absX = 333; absX <= 376; absX++) {
      const idx = (absY * w + absX) * 4;

      const cx = 354;
      const cy = 195.5;
      const dx = (absX - cx) / 20;
      const dy = (absY - cy) / 14;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 1.0) {
        const ty = Math.max(0, Math.min(1, (absY - 180) / 30));
        const targetR = Math.round(247 * (1 - ty) + 244 * ty);
        const targetG = Math.round(200 * (1 - ty) + 194 * ty);
        const targetB = Math.round(172 * (1 - ty) + 164 * ty);

        if (dist <= 0.82) {
          out[idx] = targetR;
          out[idx+1] = targetG;
          out[idx+2] = targetB;
        } else {
          const alpha = (1.0 - dist) / 0.18;
          out[idx] = Math.round(targetR * alpha + data[idx] * (1 - alpha));
          out[idx+1] = Math.round(targetG * alpha + data[idx+1] * (1 - alpha));
          out[idx+2] = Math.round(targetB * alpha + data[idx+2] * (1 - alpha));
        }
      }
    }
  }

  // Right eye inpaint:
  for (let absY = 179; absY <= 210; absY++) {
    for (let absX = 394; absX <= 446; absX++) {
      const idx = (absY * w + absX) * 4;

      const cx = 416;
      const cy = 195.0;
      const cyTilted = cy - (absX - cx) * 0.08;
      const dx = (absX - cx) / 24.5;
      const dy = (absY - cyTilted) / 14;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= 1.0) {
        const ty = Math.max(0, Math.min(1, (absY - 179) / 31));
        const targetR = Math.round(247 * (1 - ty) + 244 * ty);
        const targetG = Math.round(200 * (1 - ty) + 194 * ty);
        const targetB = Math.round(172 * (1 - ty) + 164 * ty);

        if (dist <= 0.82) {
          out[idx] = targetR;
          out[idx+1] = targetG;
          out[idx+2] = targetB;
        } else {
          const alpha = (1.0 - dist) / 0.18;
          out[idx] = Math.round(targetR * alpha + data[idx] * (1 - alpha));
          out[idx+1] = Math.round(targetG * alpha + data[idx+1] * (1 - alpha));
          out[idx+2] = Math.round(targetB * alpha + data[idx+2] * (1 - alpha));
        }
      }
    }
  }

  return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
}

  console.log('\n--- 2. BUILDING NEUTRAL HAIRSTYLES ---');
  // For neutral, male hairstyle assets and masks are identical in scale and coordinates
  for (const key of styleKeys) {
    const malePng = path.join(outDir, `trainer_male_${key}.png`);
    const maleMask = path.join(outDir, `trainer_male_${key}_hair_mask.png`);

    const neutralPng = path.join(outDir, `trainer_neutral_${key}.png`);
    const neutralMask = path.join(outDir, `trainer_neutral_${key}_hair_mask.png`);

    if (fs.existsSync(malePng)) {
      fs.copyFileSync(malePng, neutralPng);
    }
    if (fs.existsSync(maleMask)) {
      fs.copyFileSync(maleMask, neutralMask);
    }
    console.log(`Successfully prepared trainer_neutral_${key}.png`);
  }

  await browser.close();
  console.log('\nAll female and neutral hairstyle assets generated and synchronized!');
}

build().catch(console.error);
