import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const TOPS_DIR = 'public/images/avatar/tops';
const AVATAR_DIR = 'public/images/avatar';
const HAIRSTYLES_DIR = 'public/images/avatar/hairstyles';

const w = 768, h = 1376;

// Flood-fill outer background to ensure no internal fabric is deleted
function getOuterBgMap(srcRgb) {
  const isBg = new Uint8Array(w * h);
  const queue = [];

  function pushQ(x, y) {
    if (x < 0 || x >= w || y < 0 || y >= h) return;
    const idx = y * w + x;
    if (isBg[idx]) return;
    const p3 = idx * 3;
    const r = srcRgb[p3], g = srcRgb[p3+1], b = srcRgb[p3+2];
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

  return isBg;
}

async function main() {
  console.log('=== EXECUTING ZERO COLLAR SOLUTION ===\n');

  // -------------------------------------------------------------
  // 1. BUILD PRISTINE NEUTRAL BASE (Cleanest canvas)
  // -------------------------------------------------------------
  console.log('1. Building pristine neutral base...');
  const neuTankBuf = await sharp(path.join(ARTIFACT_DIR, 'neutral_tank_top_1789433072760.jpg')).raw().toBuffer({ resolveWithObject: true });
  const neuBaseBuf = await sharp(path.join(AVATAR_DIR, 'trainer_neutral_clean.png')).raw().toBuffer({ resolveWithObject: true });
  const neuMaskBuf = await sharp(path.join(AVATAR_DIR, 'trainer_neutral_skin_mask.png')).raw().toBuffer({ resolveWithObject: true });

  const outNeuBase = Buffer.from(neuBaseBuf.data);
  const outNeuMask = Buffer.from(neuMaskBuf.data);

  for (let y = 230; y <= 670; y++) {
    for (let x = 150; x <= 620; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const tr = neuTankBuf.data[idx3], tg = neuTankBuf.data[idx3+1], tb = neuTankBuf.data[idx3+2];

      if (tr > 245 && tg > 245 && tb > 245) {
        outNeuBase[idx4 + 3] = 0;
        outNeuMask[idx4 + 3] = 0;
        continue;
      }

      outNeuBase[idx4] = tr;
      outNeuBase[idx4+1] = tg;
      outNeuBase[idx4+2] = tb;
      outNeuBase[idx4+3] = 255;

      const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
      if (isSkin && (y < 326 || x < 312 || x > 458)) {
        outNeuMask[idx4] = 255;
        outNeuMask[idx4+1] = 255;
        outNeuMask[idx4+2] = 255;
        outNeuMask[idx4+3] = 255;
      } else {
        outNeuMask[idx4] = 0;
        outNeuMask[idx4+1] = 0;
        outNeuMask[idx4+2] = 0;
        outNeuMask[idx4+3] = 0;
      }
    }
  }

  await sharp(outNeuBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_neutral_clean.png'));
  await sharp(outNeuMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_neutral_skin_mask.png'));
  console.log('Saved trainer_neutral_clean.png and mask.');

  // -------------------------------------------------------------
  // 2. BUILD PRISTINE MALE BASE (Clean neck sides of spiky hair)
  // -------------------------------------------------------------
  console.log('\n2. Building pristine male base...');
  const maleTankBuf = await sharp(path.join(ARTIFACT_DIR, 'male_tank_top_1789433051230.jpg')).raw().toBuffer({ resolveWithObject: true });
  const maleBaseBuf = await sharp(path.join(AVATAR_DIR, 'trainer_base_clean.png')).raw().toBuffer({ resolveWithObject: true });
  const maleMaskBuf = await sharp(path.join(AVATAR_DIR, 'trainer_clean_skin_mask.png')).raw().toBuffer({ resolveWithObject: true });

  const outMaleBase = Buffer.from(maleBaseBuf.data);
  const outMaleMask = Buffer.from(maleMaskBuf.data);

  for (let y = 230; y <= 670; y++) {
    for (let x = 150; x <= 620; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const tr = maleTankBuf.data[idx3], tg = maleTankBuf.data[idx3+1], tb = maleTankBuf.data[idx3+2];

      if (tr > 245 && tg > 245 && tb > 245) {
        outMaleBase[idx4 + 3] = 0;
        outMaleMask[idx4 + 3] = 0;
        continue;
      }

      outMaleBase[idx4] = tr;
      outMaleBase[idx4+1] = tg;
      outMaleBase[idx4+2] = tb;
      outMaleBase[idx4+3] = 255;

      const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
      if (isSkin && (y < 326 || x < 312 || x > 458)) {
        outMaleMask[idx4] = 255;
        outMaleMask[idx4+1] = 255;
        outMaleMask[idx4+2] = 255;
        outMaleMask[idx4+3] = 255;
      } else {
        outMaleMask[idx4] = 0;
        outMaleMask[idx4+1] = 0;
        outMaleMask[idx4+2] = 0;
        outMaleMask[idx4+3] = 0;
      }
    }
  }

  // Clean spiky hair remnants from male neck sides (y: 260..290, x: 320..355 & x: 425..450)
  for (let y = 260; y <= 290; y++) {
    for (let x = 320; x <= 355; x++) {
      const idx4 = (y * w + x) * 4;
      const r = outMaleBase[idx4], g = outMaleBase[idx4+1], b = outMaleBase[idx4+2];
      if (r < 70 && g < 70 && b < 70) {
        outMaleBase[idx4] = outNeuBase[idx4];
        outMaleBase[idx4+1] = outNeuBase[idx4+1];
        outMaleBase[idx4+2] = outNeuBase[idx4+2];
        outMaleMask[idx4] = 255; outMaleMask[idx4+1] = 255; outMaleMask[idx4+2] = 255; outMaleMask[idx4+3] = 255;
      }
    }
    for (let x = 425; x <= 450; x++) {
      const idx4 = (y * w + x) * 4;
      const r = outMaleBase[idx4], g = outMaleBase[idx4+1], b = outMaleBase[idx4+2];
      if (r < 70 && g < 70 && b < 70) {
        outMaleBase[idx4] = outNeuBase[idx4];
        outMaleBase[idx4+1] = outNeuBase[idx4+1];
        outMaleBase[idx4+2] = outNeuBase[idx4+2];
        outMaleMask[idx4] = 255; outMaleMask[idx4+1] = 255; outMaleMask[idx4+2] = 255; outMaleMask[idx4+3] = 255;
      }
    }
  }

  await sharp(outMaleBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_base_clean.png'));
  await sharp(outMaleMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_clean_skin_mask.png'));
  console.log('Saved trainer_base_clean.png and mask (clean neck sides).');

  // -------------------------------------------------------------
  // 3. BUILD PRISTINE FEMALE BASE (Raw uncorrupted neck + clean shoulder)
  // -------------------------------------------------------------
  console.log('\n3. Building pristine female base...');
  const femTankBuf = await sharp(path.join(ARTIFACT_DIR, 'female_tank_top_1789433029421.jpg')).raw().toBuffer({ resolveWithObject: true });
  const femBaseBuf = await sharp(path.join(AVATAR_DIR, 'trainer_female_clean.png')).raw().toBuffer({ resolveWithObject: true });
  const femMaskBuf = await sharp(path.join(AVATAR_DIR, 'trainer_female_skin_mask.png')).raw().toBuffer({ resolveWithObject: true });

  const outFemBase = Buffer.from(femBaseBuf.data);
  const outFemMask = Buffer.from(femMaskBuf.data);

  for (let y = 230; y <= 670; y++) {
    for (let x = 150; x <= 620; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const tr = femTankBuf.data[idx3], tg = femTankBuf.data[idx3+1], tb = femTankBuf.data[idx3+2];

      if (tr > 245 && tg > 245 && tb > 245) {
        outFemBase[idx4 + 3] = 0;
        outFemMask[idx4 + 3] = 0;
        continue;
      }

      outFemBase[idx4] = tr;
      outFemBase[idx4+1] = tg;
      outFemBase[idx4+2] = tb;
      outFemBase[idx4+3] = 255;

      const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
      if (isSkin && (y < 334 || x < 312 || x > 458)) {
        outFemMask[idx4] = 255;
        outFemMask[idx4+1] = 255;
        outFemMask[idx4+2] = 255;
        outFemMask[idx4+3] = 255;
      } else {
        outFemMask[idx4] = 0;
        outFemMask[idx4+1] = 0;
        outFemMask[idx4+2] = 0;
        outFemMask[idx4+3] = 0;
      }
    }
  }

  // Replace dark shirt collar on character's left shoulder (x: 415..520, y: 270..340) with clean bare skin
  for (let y = 270; y <= 340; y++) {
    for (let x = 415; x <= 520; x++) {
      const idx4 = (y * w + x) * 4;
      const r = outFemBase[idx4], g = outFemBase[idx4+1], b = outFemBase[idx4+2];
      if (r < 85 && g < 75 && b < 75) {
        outFemBase[idx4] = outNeuBase[idx4];
        outFemBase[idx4+1] = outNeuBase[idx4+1];
        outFemBase[idx4+2] = outNeuBase[idx4+2];
        outFemMask[idx4] = 255;
        outFemMask[idx4+1] = 255;
        outFemMask[idx4+2] = 255;
        outFemMask[idx4+3] = 255;
      }
    }
  }

  await sharp(outFemBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_female_clean.png'));
  await sharp(outFemMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_female_skin_mask.png'));
  console.log('Saved trainer_female_clean.png and mask (clean neck and left shoulder).');

  // -------------------------------------------------------------
  // 4. SYNCHRONIZE ALL 30 HAIRSTYLE SPRITES
  // -------------------------------------------------------------
  console.log('\n4. Synchronizing all 30 hairstyle sprites...');

  const hairstyleKeys = [
    'afro', 'bob', 'dreadlocks', 'ponytail', 'sidecut',
    'straight_long', 'twin_braids', 'wavy_long', 'wild_mane', 'witch_curls'
  ];

  for (const g of ['female', 'male', 'neutral']) {
    const baseCleanFile = g === 'male' ? 'trainer_base_clean.png' : `trainer_${g}_clean.png`;
    const cleanBaseBuf = await sharp(path.join(AVATAR_DIR, baseCleanFile)).raw().toBuffer({ resolveWithObject: true });

    for (const hKey of hairstyleKeys) {
      const hairPngPath = path.join(HAIRSTYLES_DIR, `trainer_${g}_${hKey}.png`);
      const hairMaskPath = path.join(HAIRSTYLES_DIR, `trainer_${g}_${hKey}_hair_mask.png`);

      if (!fs.existsSync(hairPngPath)) continue;

      const hairBuf = await sharp(hairPngPath).raw().toBuffer({ resolveWithObject: true });
      let hairMaskBuf = fs.existsSync(hairMaskPath)
        ? await sharp(hairMaskPath).raw().toBuffer({ resolveWithObject: true })
        : null;

      const out = Buffer.from(hairBuf.data);
      const isShortHair = ['afro', 'bob', 'sidecut', 'ponytail'].includes(hKey);

      for (let y = 230; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          let isHairPixel = false;
          // For short hairstyles, guarantee NO hair pixels on the body below neck
          if (!isShortHair && hairMaskBuf && y < 660) {
            isHairPixel = hairMaskBuf.data[idx] > 60;
          }

          if (!isHairPixel) {
            out[idx] = cleanBaseBuf.data[idx];
            out[idx+1] = cleanBaseBuf.data[idx+1];
            out[idx+2] = cleanBaseBuf.data[idx+2];
            out[idx+3] = cleanBaseBuf.data[idx+3];

            if (hairMaskBuf && y >= 250) {
              hairMaskBuf.data[idx] = 0;
              hairMaskBuf.data[idx+1] = 0;
              hairMaskBuf.data[idx+2] = 0;
              hairMaskBuf.data[idx+3] = 0;
            }
          }
        }
      }

      // Special guarantee for female sidecut, bob, afro, ponytail:
      // Replace any dark collar pixels on the shoulders with clean skin
      if (g === 'female' && isShortHair) {
        for (let y = 270; y <= 340; y++) {
          // Left shoulder (x: 415..520)
          for (let x = 415; x <= 520; x++) {
            const idx = (y * w + x) * 4;
            const r = out[idx], gC = out[idx+1], b = out[idx+2];
            if (r < 85 && gC < 75 && b < 75) {
              out[idx] = outNeuBase[idx];
              out[idx+1] = outNeuBase[idx+1];
              out[idx+2] = outNeuBase[idx+2];
            }
          }
          // Right shoulder for non-sidecut short styles
          if (hKey !== 'sidecut') {
            for (let x = 240; x <= 340; x++) {
              const idx = (y * w + x) * 4;
              const r = out[idx], gC = out[idx+1], b = out[idx+2];
              if (r < 85 && gC < 75 && b < 75) {
                out[idx] = outNeuBase[idx];
                out[idx+1] = outNeuBase[idx+1];
                out[idx+2] = outNeuBase[idx+2];
              }
            }
          }
        }
      }

      await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(hairPngPath);
      if (hairMaskBuf) {
        await sharp(hairMaskBuf.data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(hairMaskPath);
      }
      console.log(`Synced trainer_${g}_${hKey}.png`);
    }
  }

  // -------------------------------------------------------------
  // 5. EXTRACT ALL 21 MODULAR TOPS WITH CLEAN TRANSPARENT NECK HOLES
  // -------------------------------------------------------------
  console.log('\n5. Extracting clean modular tops...');

  // Athletic Tanks
  const tankDefs = [
    { gender: 'female', file: 'female_tank_top_1789433029421.jpg', scoopX: [342, 426], scoopY: 334, yMax: 642 },
    { gender: 'male', file: 'male_tank_top_1789433051230.jpg', scoopX: [348, 420], scoopY: 326, yMax: 650 },
    { gender: 'neutral', file: 'neutral_tank_top_1789433072760.jpg', scoopX: [348, 420], scoopY: 326, yMax: 650 },
  ];

  for (const td of tankDefs) {
    const genBuf = await sharp(path.join(ARTIFACT_DIR, td.file)).raw().toBuffer({ resolveWithObject: true });
    const isBg = getOuterBgMap(genBuf.data);
    const outBuf = Buffer.alloc(w * h * 4, 0);

    for (let y = 280; y <= td.yMax; y++) {
      for (let x = 160; x <= 610; x++) {
        const idx = y * w + x;
        if (isBg[idx]) continue;

        const p3 = idx * 3;
        const p4 = idx * 4;
        const r = genBuf.data[p3], gC = genBuf.data[p3+1], b = genBuf.data[p3+2];

        // Transparent inside neck scoop
        if (x >= td.scoopX[0] && x <= td.scoopX[1] && y < td.scoopY) {
          const isGreenTrim = (r > 140 && gC > 190 && b < 175);
          if (!isGreenTrim) continue;
        }

        // Bare arms & deltoids
        const isSkin = (r > 130 && gC > 80 && b > 50 && r > gC && gC > b && (r - b) > 15);
        if (isSkin && (x < 312 || x > 458 || y < td.scoopY)) continue;

        outBuf[p4] = r;
        outBuf[p4+1] = gC;
        outBuf[p4+2] = b;
        outBuf[p4+3] = 255;
      }
    }

    const outName = `${td.gender}_top_athletic_tank.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
    console.log(`Saved ${outName}`);
  }

  // Standard tops
  const standardDefs = [
    {
      id: 'top_basic',
      files: { female: 'female_body_clean_1789432915573.jpg', male: 'male_body_clean_1789432936103.jpg', neutral: 'neutral_body_clean_1789432960818.jpg' },
      yMax: { female: 642, male: 650, neutral: 650 },
      collarSpan: { female: [342, 428], male: [338, 432], neutral: [338, 432] }
    },
    {
      id: 'top_school_blouse',
      files: { female: 'female_school_blouse_1789433096007.jpg', male: 'male_school_blouse_1789433120943.jpg', neutral: 'neutral_school_blouse_1789433145091.jpg' },
      yMax: { female: 656, male: 672, neutral: 672 },
      collarSpan: { female: [340, 430], male: [336, 434], neutral: [336, 434] }
    },
    {
      id: 'top_rune_tshirt',
      files: { female: 'female_rune_tshirt_1789433397317.jpg', male: 'male_rune_tshirt_1789433460596.jpg', neutral: 'neutral_rune_tshirt_1789433490374.jpg' },
      yMax: { female: 642, male: 650, neutral: 650 },
      collarSpan: { female: [342, 428], male: [338, 432], neutral: [338, 432] }
    },
    {
      id: 'top_celestial_tunic',
      files: { female: 'female_celestial_tunic_long_1789435601007.jpg', male: 'male_celestial_tunic_1789433338985.jpg', neutral: 'neutral_celestial_tunic_1789433368263.jpg' },
      yMax: { female: 760, male: 750, neutral: 750 },
      collarSpan: { female: [340, 430], male: [336, 434], neutral: [336, 434] }
    },
    {
      id: 'top_alchemist_vest',
      files: { female: 'female_alchemist_vest_1789433170962.jpg', male: 'male_alchemist_vest_1789433205515.jpg', neutral: 'neutral_alchemist_vest_1789433268407.jpg' },
      yMax: { female: 692, male: 690, neutral: 690 },
      collarSpan: { female: [340, 430], male: [336, 434], neutral: [336, 434] }
    }
  ];

  for (const sDef of standardDefs) {
    for (const g of ['female', 'male', 'neutral']) {
      const srcFile = sDef.files[g];
      const genBuf = await sharp(path.join(ARTIFACT_DIR, srcFile)).raw().toBuffer({ resolveWithObject: true });
      const src = genBuf.data;
      const isBg = getOuterBgMap(src);
      const span = sDef.collarSpan[g];
      const yMax = sDef.yMax[g];

      const collarY = new Int32Array(w);
      collarY.fill(270);

      for (let x = span[0]; x <= span[1]; x++) {
        for (let y = 240; y <= 345; y++) {
          const p3 = (y * w + x) * 3;
          const r = src[p3], gC = src[p3+1], b = src[p3+2];
          const isSkin = (r > 135 && gC > 85 && b > 55 && r > gC && gC > b && (r - b) > 15);
          if (isSkin) continue;

          collarY[x] = y;
          break;
        }
      }

      const outBuf = Buffer.alloc(w * h * 4, 0);

      for (let y = 270; y <= yMax; y++) {
        for (let x = 160; x <= 610; x++) {
          const idx = y * w + x;
          if (isBg[idx]) continue;
          if (x >= span[0] && x <= span[1] && y < collarY[x]) continue;

          // Bare arms below short sleeves
          if (y > 450 && (sDef.id === 'top_basic' || sDef.id === 'top_school_blouse' || sDef.id === 'top_rune_tshirt')) {
            if (x > 505 || x < 265) {
              const p3 = idx * 3;
              const r = src[p3], gC = src[p3+1], b = src[p3+2];
              const isArmSkin = (r > 160 && gC > 110 && b > 80 && r > gC && gC > b);
              if (isArmSkin) continue;
            }
          }

          const p3 = idx * 3;
          const p4 = idx * 4;
          outBuf[p4] = src[p3];
          outBuf[p4+1] = src[p3+1];
          outBuf[p4+2] = src[p3+2];
          outBuf[p4+3] = 255;
        }
      }

      const outName = `${g}_${sDef.id}.png`;
      await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
      console.log(`Saved ${outName}`);
    }
  }

  // Día de Muertos Modular Top
  for (const g of ['female', 'male', 'neutral']) {
    const gitBaseBuf = execSync(`git show HEAD:public/images/avatar/trainer_${g === 'male' ? 'base' : g}_clean.png`);
    const buf = await sharp(gitBaseBuf).raw().toBuffer({ resolveWithObject: true });
    const isBg = getOuterBgMap(buf.data);
    const outBuf = Buffer.alloc(w * h * 4, 0);

    const yMax = g === 'female' ? 642 : 650;
    const collarMinY = g === 'female' ? 320 : 312;

    for (let y = 290; y <= yMax; y++) {
      for (let x = 160; x <= 610; x++) {
        const idx = y * w + x;
        if (isBg[idx]) continue;
        if (x >= 340 && x <= 430 && y < collarMinY) continue;

        if (y > 440 && (x > 505 || x < 265)) {
          const p4 = idx * 4;
          const r = buf.data[p4], gC = buf.data[p4+1], b = buf.data[p4+2];
          const isArmSkin = (r > 160 && gC > 110 && b > 80 && r > gC && gC > b);
          if (isArmSkin) continue;
        }

        const p4 = idx * 4;
        outBuf[p4] = buf.data[p4];
        outBuf[p4+1] = buf.data[p4+1];
        outBuf[p4+2] = buf.data[p4+2];
        outBuf[p4+3] = 255;
      }
    }

    const outName = `${g}_top_dia_de_muertos.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
    console.log(`Saved ${outName}`);
  }

  console.log('\n=== ALL ASSETS MASTERED! ===');
}

main().catch(console.error);
