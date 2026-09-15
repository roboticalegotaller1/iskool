import sharp from 'sharp';
import path from 'path';

const brainDir = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const w = 768, h = 1376;

async function testInpaintStraps() {
  const maleTankBuf = await sharp(path.join(brainDir, 'male_tank_top_1789433051230.jpg')).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.from(maleTankBuf.data);

  // Left strap on male (character's right shoulder):
  // Straps run roughly x: 295..345, y: 292..328
  // Sample inner skin at x=350, outer skin at x=290, top skin at y=290
  for (let y = 290; y <= 330; y++) {
    for (let x = 295; x <= 345; x++) {
      const idx = (y * w + x) * 3;
      const r = out[idx], g = out[idx+1], b = out[idx+2];
      
      // Check if it's the green piping or gray strap fabric
      const isGreen = (r > 140 && g > 190 && b < 180);
      const isGray = (r < 120 && g < 120 && b < 120);

      if (isGreen || isGray) {
        // Bi-directional skin sampling:
        // inner sample (clavicle) at x=352
        const inIdx = (y * w + 352) * 3;
        // outer sample (deltoid) at x=288
        const outIdx = (y * w + 288) * 3;
        const tx = (x - 288) / (352 - 288);

        out[idx] = Math.round(out[outIdx] * (1 - tx) + out[inIdx] * tx);
        out[idx+1] = Math.round(out[outIdx+1] * (1 - tx) + out[inIdx+1] * tx);
        out[idx+2] = Math.round(out[outIdx+2] * (1 - tx) + out[inIdx+2] * tx);
      }
    }
  }

  // Right strap on male (character's left shoulder):
  // Straps run roughly x: 420..472, y: 292..328
  for (let y = 290; y <= 330; y++) {
    for (let x = 420; x <= 472; x++) {
      const idx = (y * w + x) * 3;
      const r = out[idx], g = out[idx+1], b = out[idx+2];

      const isGreen = (r > 140 && g > 190 && b < 180);
      const isGray = (r < 120 && g < 120 && b < 120);

      if (isGreen || isGray) {
        // inner sample (clavicle) at x=415
        const inIdx = (y * w + 415) * 3;
        // outer sample (deltoid) at x=478
        const outIdx = (y * w + 478) * 3;
        const tx = (x - 415) / (478 - 415);

        out[idx] = Math.round(out[inIdx] * (1 - tx) + out[outIdx] * tx);
        out[idx+1] = Math.round(out[inIdx+1] * (1 - tx) + out[outIdx+1] * tx);
        out[idx+2] = Math.round(out[inIdx+2] * (1 - tx) + out[outIdx+2] * tx);
      }
    }
  }

  // Remove thin necklace
  for (let y = 280; y <= 310; y++) {
    for (let x = 340; x <= 430; x++) {
      const idx = (y * w + x) * 3;
      const r = out[idx], g = out[idx+1], b = out[idx+2];
      if (r > 195 && g > 185 && b > 185) {
        const srcIdx = ((y - 4) * w + x) * 3;
        out[idx] = out[srcIdx];
        out[idx+1] = out[srcIdx+1];
        out[idx+2] = out[srcIdx+2];
      }
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 3 } })
    .extract({ left: 240, top: 220, width: 290, height: 260 })
    .png()
    .toFile('test_inpainted_male_straps_slice.png');
  console.log('Saved test_inpainted_male_straps_slice.png');
}

testInpaintStraps();
