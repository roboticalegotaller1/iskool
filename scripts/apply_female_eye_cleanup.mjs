import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const femaleStyles = [
  'afro', 'bob', 'dreadlocks', 'ponytail', 'sidecut',
  'straight_long', 'twin_braids', 'wavy_long', 'wild_mane', 'witch_curls'
];

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

async function main() {
  console.log('--- Inpainting Base Female Model ---');
  const baseCleanPath = 'public/images/avatar/trainer_female_clean.png';
  const cleanedBaseBuffer = await cleanEyesOnImageBuffer(fs.readFileSync(baseCleanPath));
  fs.writeFileSync(baseCleanPath, cleanedBaseBuffer);
  console.log(`Updated ${baseCleanPath}`);

  console.log('--- Inpainting 10 Female Hairstyles ---');
  for (const style of femaleStyles) {
    const hairPath = `public/images/avatar/hairstyles/trainer_female_${style}.png`;
    if (fs.existsSync(hairPath)) {
      const cleanedHairBuffer = await cleanEyesOnImageBuffer(fs.readFileSync(hairPath));
      fs.writeFileSync(hairPath, cleanedHairBuffer);
      console.log(`Updated ${hairPath}`);
    }
  }

  console.log('--- Updating Skin Mask for Eye Sockets ---');
  const skinMaskPath = 'public/images/avatar/trainer_female_skin_mask.png';
  if (fs.existsSync(skinMaskPath)) {
    const { data, info } = await sharp(skinMaskPath).raw().toBuffer({ resolveWithObject: true });
    const w = info.width, h = info.height;
    const maskOut = Buffer.from(data);

    // Mark eye socket areas as 100% white skin mask so palette skin tinting covers them
    for (let y = 180; y <= 210; y++) {
      for (let x = 330; x <= 450; x++) {
        // Left eye or right eye
        const inLeft = x >= 333 && x <= 376;
        const inRight = x >= 394 && x <= 446;
        if (inLeft || inRight) {
          const idx = (y * w + x) * 4;
          maskOut[idx] = 255;
          maskOut[idx+1] = 255;
          maskOut[idx+2] = 255;
          maskOut[idx+3] = 255;
        }
      }
    }
    await sharp(maskOut, { raw: { width: w, height: h, channels: 4 } })
      .png()
      .toFile(skinMaskPath);
    console.log(`Updated ${skinMaskPath}`);
  }

  console.log('Female eye cleanup completed successfully!');
}

main();
