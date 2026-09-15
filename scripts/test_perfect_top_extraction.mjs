import sharp from 'sharp';
import path from 'path';

const brainDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const w = 768, h = 1376;

async function extractPerfectMaleBasic() {
  const srcBuf = await sharp(path.join(brainDir, 'male_body_clean_1789432936103.jpg')).raw().toBuffer({ resolveWithObject: true });
  const src = srcBuf.data;

  // 1. Flood-fill from outer edges to find true outer background
  const isBg = new Uint8Array(w * h);
  const queue = [];

  function pushQ(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (isBg[idx]) return;
    const p3 = idx * 3;
    const r = src[p3], g = src[p3+1], b = src[p3+2];
    if (r >= 238 && g >= 238 && b >= 238) {
      isBg[idx] = 1;
      queue.push(x, y);
    }
  }

  for (let x = 0; x < w; x++) { pushQ(x, 0); pushQ(x, h - 1); }
  for (let y = 0; y < h; y++) { pushQ(0, y); pushQ(w - 1, y); }

  let qHead = 0;
  while (qHead < queue.length) {
    const cx = queue[qHead++];
    const cy = queue[qHead++];
    pushQ(cx + 1, cy);
    pushQ(cx - 1, cy);
    pushQ(cx, cy + 1);
    pushQ(cx, cy - 1);
  }

  // 2. Build top overlay
  const out = Buffer.alloc(w * h * 4, 0);

  // Collar curve for male basic cotton t-shirt:
  // Center x=384, collar top edge is at y=318.
  // Left shoulder x=340, y=305; x=260, y=298.
  // Right shoulder x=430, y=305; x=510, y=298.
  function getCollarMinY(x) {
    if (x >= 340 && x <= 430) {
      // Parabolic dip from (340, 305) down to (384, 318) and back to (430, 305)
      const dx = (x - 384) / 44;
      return 318 - (1 - dx * dx) * 13;
    } else if (x < 340) {
      // Shoulder slope to left
      return 305 - (340 - x) * 0.10;
    } else {
      // Shoulder slope to right
      return 305 - (x - 430) * 0.10;
    }
  }

  const yMax = 650; // shirt hem

  for (let y = 280; y <= yMax; y++) {
    for (let x = 160; x <= 610; x++) {
      const idx = y * w + x;
      if (isBg[idx]) continue; // true outer background

      const minY = getCollarMinY(x);
      if (y < minY) continue; // above collar / neck skin

      // Bare arms below short sleeves
      if (y > 450) {
        if (x > 505 || x < 265) {
          const p3 = idx * 3;
          const r = src[p3], g = src[p3+1], b = src[p3+2];
          const isArmSkin = (r > 160 && g > 110 && b > 80 && r > g && g > b);
          if (isArmSkin) continue;
        }
      }

      const p3 = idx * 3;
      const p4 = idx * 4;
      out[p4] = src[p3];
      out[p4+1] = src[p3+1];
      out[p4+2] = src[p3+2];
      out[p4+3] = 255;
    }
  }

  // Soft anti-aliasing on collar inner rim (minY to minY + 2)
  for (let x = 338; x <= 432; x++) {
    const minY = Math.round(getCollarMinY(x));
    const idx0 = (minY * w + x) * 4;
    const idx1 = ((minY - 1) * w + x) * 4;
    out[idx1] = out[idx0];
    out[idx1+1] = out[idx0+1];
    out[idx1+2] = out[idx0+2];
    out[idx1+3] = 140; // soft edge
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile('test_perfect_male_top_basic.png');
  console.log('Saved test_perfect_male_top_basic.png');

  // Now composite over test_male_pristine_slice.png to verify!
  const baseBuf = await sharp('test_male_pristine_slice.png').raw().toBuffer({ resolveWithObject: true });
  const topBuf = await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: 240, top: 220, width: 290, height: 260 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const compOut = Buffer.from(baseBuf.data);
  for (let cy = 0; cy < 260; cy++) {
    for (let cx = 0; cx < 290; cx++) {
      const idx = (cy * 290 + cx) * 4;
      const a = topBuf.data[idx + 3] / 255;
      if (a > 0) {
        compOut[idx] = Math.round(topBuf.data[idx] * a + compOut[idx] * (1 - a));
        compOut[idx+1] = Math.round(topBuf.data[idx+1] * a + compOut[idx+1] * (1 - a));
        compOut[idx+2] = Math.round(topBuf.data[idx+2] * a + compOut[idx+2] * (1 - a));
      }
    }
  }

  await sharp(compOut, { raw: { width: 290, height: 260, channels: 4 } })
    .png()
    .toFile('test_perfect_male_basic_composite.png');
  console.log('Saved test_perfect_male_basic_composite.png');
}

extractPerfectMaleBasic();
