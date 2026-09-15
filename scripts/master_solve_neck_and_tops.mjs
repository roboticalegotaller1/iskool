import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const TOPS_DIR = 'public/images/avatar/tops';
const AVATAR_DIR = 'public/images/avatar';
const HAIRSTYLES_DIR = 'public/images/avatar/hairstyles';

const w = 768, h = 1376;

// Helper: Flood-fill outer white background
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

async function run() {
  console.log('================================================================');
  console.log('MASTER SOLUTION: ZERO BLACK COLLARS / PERFECT TOPS & HAIRSTYLES');
  console.log('================================================================');

  // -------------------------------------------------------------
  // STEP 1: BUILD PRISTINE CLEAN BASE MANNEQUINS FOR ALL 3 GENDERS
  // -------------------------------------------------------------
  console.log('\n--- Step 1: Building Pristine Clean Base Mannequins ---');

  const genders = [
    { key: 'male', tankFile: 'male_tank_top_1789433051230.jpg', baseFile: 'trainer_base_clean.png', maskFile: 'trainer_clean_skin_mask.png', neckMaxY: 326 },
    { key: 'neutral', tankFile: 'neutral_tank_top_1789433072760.jpg', baseFile: 'trainer_neutral_clean.png', maskFile: 'trainer_neutral_skin_mask.png', neckMaxY: 326 },
    { key: 'female', tankFile: 'female_tank_top_1789433029421.jpg', baseFile: 'trainer_female_clean.png', maskFile: 'trainer_female_skin_mask.png', neckMaxY: 334 }
  ];

  for (const g of genders) {
    console.log(`Processing pristine ${g.key} base...`);
    const tankBuf = await sharp(path.join(ARTIFACT_DIR, g.tankFile)).raw().toBuffer({ resolveWithObject: true });
    const baseBuf = await sharp(path.join(AVATAR_DIR, g.baseFile)).raw().toBuffer({ resolveWithObject: true });
    const maskBuf = await sharp(path.join(AVATAR_DIR, g.maskFile)).raw().toBuffer({ resolveWithObject: true });

    const outBase = Buffer.from(baseBuf.data);
    const outMask = Buffer.from(maskBuf.data);

    for (let y = 230; y <= 670; y++) {
      for (let x = 150; x <= 620; x++) {
        const idx3 = (y * w + x) * 3;
        const idx4 = (y * w + x) * 4;
        const tr = tankBuf.data[idx3], tg = tankBuf.data[idx3+1], tb = tankBuf.data[idx3+2];

        // Background
        if (tr > 245 && tg > 245 && tb > 245) {
          outBase[idx4 + 3] = 0;
          outMask[idx4 + 3] = 0;
          continue;
        }

        // Head/hair preservation above neck (y < 260)
        if (y < 260) {
          const br = baseBuf.data[idx4], bg = baseBuf.data[idx4+1], bb = baseBuf.data[idx4+2];
          const isDarkHair = (br < 95 && bg < 85 && bb < 85);
          if (isDarkHair) continue;
        }

        outBase[idx4] = tr;
        outBase[idx4+1] = tg;
        outBase[idx4+2] = tb;
        outBase[idx4+3] = 255;

        // Mark bare skin in skin mask
        const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
        if (isSkin && (y < g.neckMaxY || x < 312 || x > 458)) {
          outMask[idx4] = 255;
          outMask[idx4+1] = 255;
          outMask[idx4+2] = 255;
          outMask[idx4+3] = 255;
        } else {
          outMask[idx4] = 0;
          outMask[idx4+1] = 0;
          outMask[idx4+2] = 0;
          outMask[idx4+3] = 0;
        }
      }
    }

    // For female: sample clean neck from female_body_clean to ensure zero necklace and pure throat
    if (g.key === 'female') {
      const femBodyBuf = await sharp(path.join(ARTIFACT_DIR, 'female_body_clean_1789432915573.jpg')).raw().toBuffer({ resolveWithObject: true });
      for (let y = 220; y <= 326; y++) {
        for (let x = 335; x <= 435; x++) {
          const idx3 = (y * w + x) * 3;
          const idx4 = (y * w + x) * 4;
          const br = femBodyBuf.data[idx3], bg = femBodyBuf.data[idx3+1], bb = femBodyBuf.data[idx3+2];
          const isSkin = (br > 140 && bg > 90 && bb > 60 && br > bg && bg > bb);
          if (isSkin) {
            outBase[idx4] = br;
            outBase[idx4+1] = bg;
            outBase[idx4+2] = bb;
            outMask[idx4] = 255;
            outMask[idx4+1] = 255;
            outMask[idx4+2] = 255;
            outMask[idx4+3] = 255;
          }
        }
      }
    }

    // Infill any 1px necklace remnants
    for (let y = 280; y <= 315; y++) {
      for (let x = 340; x <= 430; x++) {
        const idx4 = (y * w + x) * 4;
        const r = outBase[idx4], g = outBase[idx4+1], b = outBase[idx4+2];
        if (r > 195 && g > 185 && b > 185) {
          const srcIdx = ((y - 4) * w + x) * 4;
          outBase[idx4] = outBase[srcIdx];
          outBase[idx4+1] = outBase[srcIdx+1];
          outBase[idx4+2] = outBase[srcIdx+2];
          outMask[idx4] = 255;
          outMask[idx4+1] = 255;
          outMask[idx4+2] = 255;
        }
      }
    }

    await sharp(outBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, g.baseFile));
    await sharp(outMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, g.maskFile));
    console.log(`Saved clean ${g.baseFile} and ${g.maskFile}`);
  }

  // -------------------------------------------------------------
  // STEP 2: SYNCHRONIZE ALL 30 HAIRSTYLE SPRITES WITH CLEAN BODY
  // -------------------------------------------------------------
  console.log('\n--- Step 2: Synchronizing all 30 Hairstyle Sprites ---');

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

      if (!fs.existsSync(hairPngPath)) {
        console.warn(`Missing hairstyle: ${hairPngPath}`);
        continue;
      }

      const hairBuf = await sharp(hairPngPath).raw().toBuffer({ resolveWithObject: true });
      let hairMaskBuf = fs.existsSync(hairMaskPath)
        ? await sharp(hairMaskPath).raw().toBuffer({ resolveWithObject: true })
        : null;

      const out = Buffer.from(hairBuf.data);

      // Hairstyles with short or bound hair have NO hair below y=260:
      const isShortHair = ['afro', 'bob', 'sidecut', 'ponytail'].includes(hKey);

      for (let y = 230; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const idx = (y * w + x) * 4;

          let isHairPixel = false;
          if (!isShortHair && hairMaskBuf && y < 660) {
            isHairPixel = hairMaskBuf.data[idx] > 60;
          }

          if (!isHairPixel) {
            // Replace body mannequin with pristine clean body:
            out[idx] = cleanBaseBuf.data[idx];
            out[idx+1] = cleanBaseBuf.data[idx+1];
            out[idx+2] = cleanBaseBuf.data[idx+2];
            out[idx+3] = cleanBaseBuf.data[idx+3];

            // Ensure hair mask does not claim clean skin pixels
            if (hairMaskBuf) {
              hairMaskBuf.data[idx] = 0;
              hairMaskBuf.data[idx+1] = 0;
              hairMaskBuf.data[idx+2] = 0;
              hairMaskBuf.data[idx+3] = 0;
            }
          }
        }
      }

      await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(hairPngPath);
      if (hairMaskBuf) {
        await sharp(hairMaskBuf.data, { raw: { width: w, height: h, channels: 4 } }).png().toFile(hairMaskPath);
      }
      console.log(`Synced trainer_${g}_${hKey}.png (purged black collar/shirt)`);
    }
  }

  // -------------------------------------------------------------
  // STEP 3: EXTRACT ALL 21 MODULAR TOPS WITH AUTOMATIC CONTOUR TRACING
  // -------------------------------------------------------------
  console.log('\n--- Step 3: Extracting All 21 Modular Tops with Clean Collars & Shoulders ---');

  // 3A. Athletic Tank Tops
  console.log('Extracting Athletic Tank tops...');
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
        const r = genBuf.data[p3], g = genBuf.data[p3+1], b = genBuf.data[p3+2];

        // Transparent inside neck scoop
        if (x >= td.scoopX[0] && x <= td.scoopX[1] && y < td.scoopY) {
          const isGreenTrim = (r > 140 && g > 190 && b < 175);
          if (!isGreenTrim) continue;
        }

        // Bare arms & deltoids
        const isSkin = (r > 130 && g > 80 && b > 50 && r > g && g > b && (r - b) > 15);
        if (isSkin && (x < 312 || x > 458 || y < td.scoopY)) continue;

        outBuf[p4] = r;
        outBuf[p4+1] = g;
        outBuf[p4+2] = b;
        outBuf[p4+3] = 255;
      }
    }

    const outName = `${td.gender}_top_athletic_tank.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
    console.log(`Saved ${outName}`);
  }

  // 3B. Standard Tops: Basic, School Blouse, Celestial Tunic, Alchemist Vest, Rune T-Shirt
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

      // Automatic column collar line trace
      const collarY = new Int32Array(w);
      collarY.fill(270);

      for (let x = span[0]; x <= span[1]; x++) {
        for (let y = 240; y <= 345; y++) {
          const p3 = (y * w + x) * 3;
          const r = src[p3], gC = src[p3+1], b = src[p3+2];
          const isSkin = (r > 135 && gC > 85 && b > 55 && r > gC && gC > b && (r - b) > 15);
          if (isSkin) continue;

          // Found collar outline / cloth boundary
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

  // 3C. Día de Muertos Modular Top (extracted cleanly with zero neck artifacts)
  console.log('Extracting clean Dia de Muertos tops...');
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

        // Skip neck skin above collar
        if (x >= 340 && x <= 430 && y < collarMinY) continue;

        // Skip bare arms below short sleeves
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

  console.log('\n================================================================');
  console.log('ALL BASES, HAIRSTYLES, AND TOPS FULLY MASTERED AND SYNCHRONIZED!');
  console.log('================================================================');
}

run().catch(console.error);
