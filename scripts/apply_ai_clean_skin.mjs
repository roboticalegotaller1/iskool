import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const femaleStyles = [
  'afro', 'bob', 'dreadlocks', 'ponytail', 'sidecut',
  'straight_long', 'twin_braids', 'wavy_long', 'wild_mane', 'witch_curls'
];

async function main() {
  console.log('Loading AI cleaned head image...');
  const aiHeadPath = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/female_head_clean_skin_1789420414762.jpg';
  const { data: aiData, info: aiInfo } = await sharp(aiHeadPath)
    .resize(290, 290)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const aiW = 290, aiH = 290;
  const headLeft = 240, headTop = 60;

  // Function to apply AI eye patch to an image buffer
  async function patchEyeSockets(targetBuf) {
    const { data: tgtData, info: tgtInfo } = await sharp(targetBuf).raw().toBuffer({ resolveWithObject: true });
    const w = tgtInfo.width, h = tgtInfo.height;
    const out = Buffer.from(tgtData);

    // Eye regions in full image coordinates (absX, absY):
    // Left eye: cx=352, cy=196. rx=22, ry=13. (lx: 330..374, ly: 183..209)
    // Right eye: cx=417, cy=196. rx=24, ry=13. (lx: 393..444, ly: 183..209)

    for (let absY = 178; absY <= 214; absY++) {
      for (let absX = 328; absX <= 446; absX++) {
        // AI image local coordinates
        const aiX = absX - headLeft;
        const aiY = absY - headTop;
        if (aiX < 0 || aiX >= aiW || aiY < 0 || aiY >= aiH) continue;

        const aiIdx = (aiY * aiW + aiX) * 3;
        const tgtIdx = (absY * w + absX) * 4;

        // Check if pixel is within left eye or right eye ellipse
        const dxL = (absX - 352) / 22.5;
        const dyL = (absY - 196.5) / 14.5;
        const distL = Math.sqrt(dxL * dxL + dyL * dyL);

        const dyRTilted = (absY - (196.5 - (absX - 417) * 0.06)) / 14.5;
        const dxR = (absX - 417) / 24.5;
        const distR = Math.sqrt(dxR * dxR + dyRTilted * dyRTilted);

        const inLeft = distL <= 1.0;
        const inRight = distR <= 1.0;

        if (!inLeft && !inRight) continue;

        const dist = inLeft ? distL : distR;

        // Check target pixel: if target pixel is hair (e.g. dark strand on left or bangs), preserve hair
        const tr = tgtData[tgtIdx], tg = tgtData[tgtIdx+1], tb = tgtData[tgtIdx+2];
        const isTargetHair = (absX <= 334 && tr < 95 && tg < 75 && tb < 75);
        if (isTargetHair) continue;

        const aiR = aiData[aiIdx];
        const aiG = aiData[aiIdx+1];
        const aiB = aiData[aiIdx+2];

        // Feather blend at outer boundary (0.8 to 1.0)
        let alpha = 1.0;
        if (dist > 0.8) {
          alpha = (1.0 - dist) / 0.2;
        }

        out[tgtIdx] = Math.round(aiR * alpha + tr * (1 - alpha));
        out[tgtIdx+1] = Math.round(aiG * alpha + tg * (1 - alpha));
        out[tgtIdx+2] = Math.round(aiB * alpha + tb * (1 - alpha));
        out[tgtIdx+3] = tgtData[tgtIdx+3]; // keep alpha
      }
    }

    return sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  }

  // 1. Base female clean model (starting from pristine Git HEAD)
  console.log('Patching base model from pristine Git HEAD...');
  const baseGitBuf = execSync('git show HEAD:public/images/avatar/trainer_female_clean.png');
  const basePatchedBuf = await patchEyeSockets(baseGitBuf);
  fs.writeFileSync('public/images/avatar/trainer_female_clean.png', basePatchedBuf);
  console.log('Saved public/images/avatar/trainer_female_clean.png');

  // 2. All 10 female hairstyles
  for (const style of femaleStyles) {
    const hairPath = `public/images/avatar/hairstyles/trainer_female_${style}.png`;
    if (fs.existsSync(hairPath)) {
      console.log(`Patching hairstyle: ${style}...`);
      const hairPatchedBuf = await patchEyeSockets(fs.readFileSync(hairPath));
      fs.writeFileSync(hairPath, hairPatchedBuf);
    }
  }

  // 3. Update trainer_female_skin_mask.png
  console.log('Updating trainer_female_skin_mask.png...');
  const skinMaskGitBuf = execSync('git show HEAD:public/images/avatar/trainer_female_skin_mask.png');
  const { data: maskData, info: maskInfo } = await sharp(skinMaskGitBuf).raw().toBuffer({ resolveWithObject: true });
  const mW = maskInfo.width, mH = maskInfo.height;
  const maskOut = Buffer.from(maskData);

  // Read base image to check where it's skin vs hair
  const { data: baseData } = await sharp(basePatchedBuf).raw().toBuffer({ resolveWithObject: true });

  for (let y = 178; y <= 214; y++) {
    for (let x = 328; x <= 446; x++) {
      const dxL = (x - 352) / 22.5;
      const dyL = (y - 196.5) / 14.5;
      const distL = Math.sqrt(dxL * dxL + dyL * dyL);

      const dyRTilted = (y - (196.5 - (x - 417) * 0.06)) / 14.5;
      const dxR = (x - 417) / 24.5;
      const distR = Math.sqrt(dxR * dxR + dyRTilted * dyRTilted);

      if (distL <= 1.0 || distR <= 1.0) {
        const idx = (y * mW + x) * 4;
        const r = baseData[idx], g = baseData[idx+1], b = baseData[idx+2];
        // If it's skin (not dark hair)
        if (r > 120 && g > 90 && b > 80) {
          maskOut[idx] = 255;
          maskOut[idx+1] = 255;
          maskOut[idx+2] = 255;
          maskOut[idx+3] = 255;
        }
      }
    }
  }

  await sharp(maskOut, { raw: { width: mW, height: mH, channels: 4 } })
    .png()
    .toFile('public/images/avatar/trainer_female_skin_mask.png');
  console.log('Saved public/images/avatar/trainer_female_skin_mask.png');

  // Verify by cropping face from base
  await sharp(basePatchedBuf)
    .extract({ left: 300, top: 165, width: 160, height: 80 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/verified_ai_clean_face.png');
  console.log('Saved verified_ai_clean_face.png');
}

main().catch(console.error);
