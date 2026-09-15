import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const AVATAR_DIR = 'public/images/avatar';
const TOPS_DIR = 'public/images/avatar/tops';
const w = 768, h = 1376;

async function prepareBaseSprites() {
  console.log('=== Step 1: Base Sprites Neck & Shoulder Skin Restoration ===');
  
  const configs = [
    {
      gender: 'female',
      baseFile: 'trainer_female_clean.png',
      maskFile: 'trainer_female_skin_mask.png',
      tankFile: 'female_tank_top_1789433029421.jpg',
      yStart: 280,
      yEnd: 365,
      xStart: 235,
      xEnd: 535,
    },
    {
      gender: 'male',
      baseFile: 'trainer_base_clean.png',
      maskFile: 'trainer_clean_skin_mask.png',
      tankFile: 'male_tank_top_1789433051230.jpg',
      yStart: 280,
      yEnd: 365,
      xStart: 235,
      xEnd: 535,
    },
    {
      gender: 'neutral',
      baseFile: 'trainer_neutral_clean.png',
      maskFile: 'trainer_neutral_skin_mask.png',
      tankFile: 'neutral_tank_top_1789433072760.jpg',
      yStart: 280,
      yEnd: 365,
      xStart: 235,
      xEnd: 535,
    }
  ];

  for (const c of configs) {
    const basePath = path.join(AVATAR_DIR, c.baseFile);
    const maskPath = path.join(AVATAR_DIR, c.maskFile);
    const tankPath = path.join(ARTIFACT_DIR, c.tankFile);

    const baseBuf = await sharp(basePath).raw().toBuffer({ resolveWithObject: true });
    const maskBuf = await sharp(maskPath).raw().toBuffer({ resolveWithObject: true });
    const tankBuf = await sharp(tankPath).raw().toBuffer({ resolveWithObject: true });

    const outBase = Buffer.from(baseBuf.data);
    const outMask = Buffer.from(maskBuf.data);

    const isSkinPixel = new Uint8Array(w * h);

    // 1. Identify existing valid skin in base above y=280 (chin and upper neck)
    for (let y = 240; y < c.yStart; y++) {
      for (let x = 320; x <= 450; x++) {
        const idx4 = (y * w + x) * 4;
        if (outBase[idx4 + 3] > 100) {
          const r = outBase[idx4], g = outBase[idx4 + 1], b = outBase[idx4 + 2];
          if (r > 150 && g > 95 && b > 65 && r > g && g > b) {
            isSkinPixel[y * w + x] = 1;
          }
        }
      }
    }

    // 2. Transfer bare skin from tank top in the neck and shoulder region
    for (let y = c.yStart; y <= c.yEnd; y++) {
      for (let x = c.xStart; x <= c.xEnd; x++) {
        const idx = y * w + x;
        const idx4 = idx * 4;
        const idx3 = idx * 3;

        if (baseBuf.data[idx4 + 3] < 50) continue; // transparent background outside character silhouette

        const tr = tankBuf.data[idx3], tg = tankBuf.data[idx3 + 1], tb = tankBuf.data[idx3 + 2];
        const isTankSkin = (tr > 145 && tg > 90 && tb > 60 && tr > tg && tg > tb && (tr - tb) > 18);

        if (isTankSkin) {
          outBase[idx4] = tr;
          outBase[idx4 + 1] = tg;
          outBase[idx4 + 2] = tb;
          outMask[idx4] = 255;
          outMask[idx4 + 1] = 255;
          outMask[idx4 + 2] = 255;
          outMask[idx4 + 3] = 255;
          isSkinPixel[idx] = 1;
        }
      }
    }

    // 3. For any remaining non-skin pixels (the tank top straps or collar area) in yStart..yEnd:
    // Infill using smooth weighted bilateral skin interpolation
    for (let pass = 0; pass < 6; pass++) {
      for (let y = c.yStart; y <= c.yEnd; y++) {
        for (let x = c.xStart; x <= c.xEnd; x++) {
          const idx = y * w + x;
          const idx4 = idx * 4;
          if (baseBuf.data[idx4 + 3] < 50) continue;
          if (isSkinPixel[idx]) continue;

          let rSum = 0, gSum = 0, bSum = 0, weightSum = 0;
          const searchRadius = 12;
          for (let dy = -searchRadius; dy <= searchRadius; dy++) {
            for (let dx = -searchRadius; dx <= searchRadius; dx++) {
              const ny = y + dy, nx = x + dx;
              if (ny < 240 || ny > 380 || nx < 230 || nx > 540) continue;
              const nIdx = ny * w + nx;
              if (isSkinPixel[nIdx]) {
                const dist = Math.hypot(dx, dy);
                const weight = 1 / (1 + dist);
                const nIdx4 = nIdx * 4;
                rSum += outBase[nIdx4] * weight;
                gSum += outBase[nIdx4 + 1] * weight;
                bSum += outBase[nIdx4 + 2] * weight;
                weightSum += weight;
              }
            }
          }

          if (weightSum > 0) {
            outBase[idx4] = Math.round(rSum / weightSum);
            outBase[idx4 + 1] = Math.round(gSum / weightSum);
            outBase[idx4 + 2] = Math.round(bSum / weightSum);
            outMask[idx4] = 255;
            outMask[idx4 + 1] = 255;
            outMask[idx4 + 2] = 255;
            outMask[idx4 + 3] = 255;
            isSkinPixel[idx] = 1;
          }
        }
      }
    }

    // 4. Ensure no dark hair/collar pixels remain in y=295..350
    for (let y = 295; y <= 350; y++) {
      for (let x = 240; x <= 530; x++) {
        if (x >= 355 && x <= 415 && y < 315) continue; // preserve chin shading
        const idx4 = (y * w + x) * 4;
        const a = outBase[idx4 + 3];
        if (a < 50) continue;
        const r = outBase[idx4], g = outBase[idx4 + 1], b = outBase[idx4 + 2];
        if (r < 85 && g < 85 && b < 85) {
          // Replace with above skin
          const nIdx4 = ((y - 2) * w + x) * 4;
          outBase[idx4] = outBase[nIdx4];
          outBase[idx4 + 1] = outBase[nIdx4 + 1];
          outBase[idx4 + 2] = outBase[nIdx4 + 2];
          outMask[idx4] = 255;
          outMask[idx4 + 1] = 255;
          outMask[idx4 + 2] = 255;
          outMask[idx4 + 3] = 255;
        }
      }
    }

    await sharp(outBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(basePath);
    await sharp(outMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(maskPath);
    console.log(`Updated ${c.gender} base sprite & skin mask`);
  }
}

async function prepareTops() {
  console.log('=== Step 2: Calibrating all 7 modular tops across 3 genders ===');

  const TOP_DEFINITIONS = [
    // 1. Basic Cotton T-Shirt (White crewneck tee)
    {
      id: 'top_basic',
      female: { file: 'female_body_clean_1789432915573.jpg', yMin: 308, yMax: 642, collarBandY: 318 },
      male: { file: 'male_body_clean_1789432936103.jpg', yMin: 308, yMax: 650, collarBandY: 316 },
      neutral: { file: 'neutral_body_clean_1789432960818.jpg', yMin: 308, yMax: 650, collarBandY: 316 },
      isTank: false,
    },
    // 2. Athletic Tank (Sleeveless top with neon green piping)
    {
      id: 'top_athletic_tank',
      female: { file: 'female_tank_top_1789433029421.jpg', yMin: 310, yMax: 642, collarBandY: 350 },
      male: { file: 'male_tank_top_1789433051230.jpg', yMin: 306, yMax: 650, collarBandY: 326 },
      neutral: { file: 'neutral_tank_top_1789433072760.jpg', yMin: 306, yMax: 650, collarBandY: 340 },
      isTank: true,
    },
    // 3. School Blouse (White shirt with collar and red necktie)
    {
      id: 'top_school_blouse',
      female: { file: 'female_school_blouse_1789433096007.jpg', yMin: 295, yMax: 656, collarBandY: 304 },
      male: { file: 'male_school_blouse_1789433120943.jpg', yMin: 295, yMax: 672, collarBandY: 306 },
      neutral: { file: 'neutral_school_blouse_1789433145091.jpg', yMin: 295, yMax: 672, collarBandY: 306 },
      isTank: false,
    },
    // 4. Alchemist Vest
    {
      id: 'top_alchemist_vest',
      female: { file: 'female_alchemist_vest_1789433170962.jpg', yMin: 295, yMax: 692, collarBandY: 304 },
      male: { file: 'male_alchemist_vest_1789433205515.jpg', yMin: 295, yMax: 690, collarBandY: 302 },
      neutral: { file: 'neutral_alchemist_vest_1789433268407.jpg', yMin: 295, yMax: 690, collarBandY: 302 },
      isTank: false,
    },
    // 5. Celestial Tunic
    {
      id: 'top_celestial_tunic',
      female: { file: 'female_celestial_tunic_long_1789435601007.jpg', yMin: 295, yMax: 760, collarBandY: 304 },
      male: { file: 'male_celestial_tunic_1789433338985.jpg', yMin: 295, yMax: 750, collarBandY: 302 },
      neutral: { file: 'neutral_celestial_tunic_1789433368263.jpg', yMin: 295, yMax: 750, collarBandY: 302 },
      isTank: false,
    },
    // 6. Rune T-Shirt
    {
      id: 'top_rune_tshirt',
      female: { file: 'female_rune_tshirt_1789433397317.jpg', yMin: 308, yMax: 642, collarBandY: 318 },
      male: { file: 'male_rune_tshirt_1789433460596.jpg', yMin: 308, yMax: 650, collarBandY: 316 },
      neutral: { file: 'neutral_rune_tshirt_1789433490374.jpg', yMin: 308, yMax: 650, collarBandY: 316 },
      isTank: false,
    }
  ];

  // Extract Dia de Muertos top for all 3 genders
  console.log('Extracting Dia de Muertos tops...');
  const diaConfigs = [
    { gender: 'female', file: 'orig_female.png', yStart: 295, yEnd: 642 },
    { gender: 'male', file: 'orig_male.png', yStart: 295, yEnd: 650 },
    { gender: 'neutral', file: 'orig_neutral.png', yStart: 295, yEnd: 650 },
  ];

  for (const d of diaConfigs) {
    const srcPath = path.join(TOPS_DIR, d.file);
    const buf = await sharp(srcPath).raw().toBuffer({ resolveWithObject: true });
    const outBuf = Buffer.alloc(w * h * 4, 0);

    for (let y = d.yStart; y <= d.yEnd; y++) {
      for (let x = 225; x <= 555; x++) {
        const idx4 = (y * w + x) * 4;
        const a = buf.data[idx4 + 3];
        if (a < 50) continue;

        const r = buf.data[idx4], g = buf.data[idx4 + 1], b = buf.data[idx4 + 2];

        // Skip bare forearms below sleeves
        if (x > 505 && y > 450) {
          const isArmSkin = (r > 160 && g > 110 && b > 80 && r > g && g > b);
          if (isArmSkin) continue;
        }
        if (x < 265 && y > 430) {
          const isArmSkin = (r > 160 && g > 110 && b > 80 && r > g && g > b);
          if (isArmSkin) continue;
        }

        outBuf[idx4] = r;
        outBuf[idx4 + 1] = g;
        outBuf[idx4 + 2] = b;
        outBuf[idx4 + 3] = 255;
      }
    }

    const outName = `${d.gender}_top_dia_de_muertos.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
      .png({ compressionLevel: 8 })
      .toFile(path.join(TOPS_DIR, outName));
    console.log(`Generated top: ${outName}`);
    
    // Clean up temporary file
    if (fs.existsSync(srcPath)) fs.unlinkSync(srcPath);
  }

  for (const topDef of TOP_DEFINITIONS) {
    for (const gender of ['female', 'male', 'neutral']) {
      const gCfg = topDef[gender];
      const genPath = path.join(ARTIFACT_DIR, gCfg.file);
      const baseFile = gender === 'female' ? 'trainer_female_clean.png' : gender === 'neutral' ? 'trainer_neutral_clean.png' : 'trainer_base_clean.png';
      const basePath = path.join(AVATAR_DIR, baseFile);

      const { data: genData } = await sharp(genPath).raw().toBuffer({ resolveWithObject: true });
      const { data: baseData } = await sharp(basePath).raw().toBuffer({ resolveWithObject: true });

      const outBuf = Buffer.alloc(w * h * 4, 0);

      for (let y = gCfg.yMin; y <= gCfg.yMax; y++) {
        for (let x = 160; x <= 610; x++) {
          const idx3 = (y * w + x) * 3;
          const idx4 = (y * w + x) * 4;

          const r = genData[idx3], g = genData[idx3 + 1], b = genData[idx3 + 2];

          // Skip white background
          if (r > 248 && g > 248 && b > 248) continue;

          // If this top is athletic tank (sleeveless):
          // Bare arms and shoulders must be transparent so clean base skin shows
          if (topDef.isTank) {
            // Check if bare shoulder/arm skin
            const isTankSkin = (r > 135 && g > 85 && b > 55 && r > g && g > b && (r - b) > 18);
            if (isTankSkin) continue;

            // In neck scoop above green collar band
            if (x >= 335 && x <= 435 && y < gCfg.collarBandY) {
              continue;
            }
          } else {
            // For shirts/tunics with neck opening:
            // In center neck (x: 345..425), skip skin above the collar band
            if (x >= 345 && x <= 425 && y < gCfg.collarBandY) {
              const isNeckSkin = (r > 140 && g > 90 && b > 60 && r > g && g > b && (r - b) > 18);
              if (isNeckSkin) continue;
            }

            // Skip stray dark hair strands over shoulders above y=335
            if (y < 335 && (x < 340 || x > 430)) {
              if (r < 75 && g < 55 && b < 45) continue;
            }
          }

          // Silhouette boundary check against base body
          const inBase = baseData[idx4 + 3] > 30;
          if (!inBase) {
            let nearBase = false;
            for (let dy = -3; dy <= 3; dy++) {
              for (let dx = -3; dx <= 3; dx++) {
                const nIdx4 = ((y + dy) * w + (x + dx)) * 4;
                if (nIdx4 >= 0 && nIdx4 < baseData.length && baseData[nIdx4 + 3] > 80) {
                  nearBase = true;
                  break;
                }
              }
              if (nearBase) break;
            }
            if (!nearBase) continue;
          }

          outBuf[idx4] = r;
          outBuf[idx4 + 1] = g;
          outBuf[idx4 + 2] = b;
          outBuf[idx4 + 3] = 255;
        }
      }

      const outFileName = `${gender}_${topDef.id}.png`;
      const outPath = path.join(TOPS_DIR, outFileName);
      await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(outPath);
      console.log(`Generated top: ${outFileName}`);
    }
  }
}

async function verifyAllCombinations() {
  console.log('=== Step 3: Verifying composite rendering for zero exposed collar pixels ===');

  const tops = ['top_basic', 'top_athletic_tank', 'top_school_blouse', 'top_alchemist_vest', 'top_celestial_tunic', 'top_rune_tshirt', 'top_dia_de_muertos'];
  const genders = ['female', 'male', 'neutral'];

  let totalErrors = 0;

  for (const g of genders) {
    const baseFile = g === 'female' ? 'trainer_female_clean.png' : g === 'neutral' ? 'trainer_neutral_clean.png' : 'trainer_base_clean.png';
    const baseBuf = await sharp(path.join(AVATAR_DIR, baseFile)).raw().toBuffer({ resolveWithObject: true });

    for (const topId of tops) {
      const topFile = `${g}_${topId}.png`;
      const topPath = path.join(TOPS_DIR, topFile);
      if (!fs.existsSync(topPath)) {
        console.error(`Missing top asset: ${topFile}`);
        totalErrors++;
        continue;
      }

      const topBuf = await sharp(topPath).raw().toBuffer({ resolveWithObject: true });

      // Check neck/shoulder region y=295..345, x=250..520
      let exposedDarkCollar = 0;
      for (let y = 295; y <= 345; y++) {
        for (let x = 250; x <= 520; x++) {
          const idx4 = (y * w + x) * 4;
          const topAlpha = topBuf.data[idx4 + 3];
          if (topAlpha < 150) {
            // Uncovered by top
            const br = baseBuf.data[idx4], bg = baseBuf.data[idx4 + 1], bb = baseBuf.data[idx4 + 2], ba = baseBuf.data[idx4 + 3];
            if (ba > 100 && br < 70 && bg < 70 && bb < 70) {
              exposedDarkCollar++;
            }
          }
        }
      }

      if (exposedDarkCollar > 0) {
        console.warn(`WARNING: ${g} + ${topId} has ${exposedDarkCollar} exposed dark pixels!`);
        totalErrors++;
      } else {
        console.log(`PASS: ${g} + ${topId} -> 0 exposed collar pixels`);
      }
    }
  }

  if (totalErrors === 0) {
    console.log('ALL 21 GENDER + TOP COMBINATIONS PASSED PERFECTLY WITH ZERO EXPOSED COLLAR PIXELS!');
  } else {
    console.log(`Verification found ${totalErrors} issues.`);
  }
}

async function main() {
  await prepareBaseSprites();
  await prepareTops();
  await verifyAllCombinations();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
