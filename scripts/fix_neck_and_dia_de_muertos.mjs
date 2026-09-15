import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const TOPS_DIR = 'public/images/avatar/tops';
const AVATAR_DIR = 'public/images/avatar';

const w = 768, h = 1376;

async function run() {
  console.log('--- Step 1: Extracting Dia de Muertos modular top for all 3 genders ---');
  
  const originalBases = [
    { gender: 'female', file: 'trainer_female_clean.png', yStart: 300, yEnd: 642 },
    { gender: 'male', file: 'trainer_base_clean.png', yStart: 300, yEnd: 650 },
    { gender: 'neutral', file: 'trainer_neutral_clean.png', yStart: 300, yEnd: 650 },
  ];

  for (const item of originalBases) {
    const baseBuf = await sharp(path.join(AVATAR_DIR, item.file)).raw().toBuffer({ resolveWithObject: true });
    const outBuf = Buffer.alloc(w * h * 4, 0);

    for (let y = item.yStart; y <= item.yEnd; y++) {
      for (let x = 230; x <= 560; x++) {
        const idx4 = (y * w + x) * 4;
        const r = baseBuf.data[idx4], g = baseBuf.data[idx4+1], b = baseBuf.data[idx4+2], a = baseBuf.data[idx4+3];
        if (a < 50) continue;

        // Skip bare arms below sleeves
        if (x > 505 && y > 450) {
          const isArmSkin = (r > 160 && g > 110 && b > 80 && r > g && g > b);
          if (isArmSkin) continue;
        }
        if (x < 265 && y > 430) {
          const isArmSkin = (r > 160 && g > 110 && b > 80 && r > g && g > b);
          if (isArmSkin) continue;
        }

        outBuf[idx4] = r;
        outBuf[idx4+1] = g;
        outBuf[idx4+2] = b;
        outBuf[idx4+3] = 255;
      }
    }

    const outName = `${item.gender}_top_dia_de_muertos.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
      .png({ compressionLevel: 8 })
      .toFile(path.join(TOPS_DIR, outName));
    console.log(`Saved ${outName}`);
  }

  console.log('--- Step 2: Cleaning neck and collar on base sprites and updating skin masks ---');

  const configs = [
    {
      gender: 'female',
      baseFile: 'trainer_female_clean.png',
      maskFile: 'trainer_female_skin_mask.png',
      tankFile: 'female_tank_top_1789433029421.jpg',
      yRange: [295, 345],
      xRange: [240, 545]
    },
    {
      gender: 'male',
      baseFile: 'trainer_base_clean.png',
      maskFile: 'trainer_clean_skin_mask.png',
      tankFile: 'male_tank_top_1789433051230.jpg',
      yRange: [295, 345],
      xRange: [240, 555]
    },
    {
      gender: 'neutral',
      baseFile: 'trainer_neutral_clean.png',
      maskFile: 'trainer_neutral_skin_mask.png',
      tankFile: 'neutral_tank_top_1789433072760.jpg',
      yRange: [295, 345],
      xRange: [240, 555]
    }
  ];

  for (const c of configs) {
    const basePath = path.join(AVATAR_DIR, c.baseFile);
    const maskPath = path.join(AVATAR_DIR, c.maskFile);
    const tankPath = path.join(ARTIFACT_DIR, c.tankFile);

    const baseData = await sharp(basePath).raw().toBuffer({ resolveWithObject: true });
    const maskData = await sharp(maskPath).raw().toBuffer({ resolveWithObject: true });
    const tankData = await sharp(tankPath).raw().toBuffer({ resolveWithObject: true });

    const outBase = Buffer.from(baseData.data);
    const outMask = Buffer.from(maskData.data);

    let replaced = 0;
    for (let y = c.yRange[0]; y <= c.yRange[1]; y++) {
      for (let x = c.xRange[0]; x <= c.xRange[1]; x++) {
        const idx4 = (y * w + x) * 4;
        const idx3 = (y * w + x) * 3;

        const br = outBase[idx4], bg = outBase[idx4+1], bb = outBase[idx4+2], ba = outBase[idx4+3];
        // If it was the dark black shirt collar or black shoulder edge
        if (ba > 100 && br < 60 && bg < 60 && bb < 60) {
          const tr = tankData.data[idx3], tg = tankData.data[idx3+1], tb = tankData.data[idx3+2];
          // Check if tank has skin
          const isSkin = (tr > 140 && tg > 90 && tb > 60 && tr > tg && tg > tb && (tr - tb) > 20 && (tg - tb) > 5);
          if (isSkin) {
            outBase[idx4] = tr;
            outBase[idx4+1] = tg;
            outBase[idx4+2] = tb;

            outMask[idx4] = 255;
            outMask[idx4+1] = 255;
            outMask[idx4+2] = 255;
            outMask[idx4+3] = 255;
            replaced++;
          }
        }
      }
    }

    console.log(`Cleaned ${c.gender} base collar: ${replaced} pixels replaced with skin`);
    await sharp(outBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(basePath);
    await sharp(outMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(maskPath);
  }

  console.log('--- Step 3: Calibrating all top clothing overlays with clean solid edges ---');

  const TOP_MAP = [
    // Basic cotton tee
    { id: 'top_basic', gender: 'female', file: 'female_body_clean_1789432915573.jpg', base: 'trainer_female_clean.png', yMax: 642, collarY: 326 },
    { id: 'top_basic', gender: 'male', file: 'male_body_clean_1789432936103.jpg', base: 'trainer_base_clean.png', yMax: 650, collarY: 317 },
    { id: 'top_basic', gender: 'neutral', file: 'neutral_body_clean_1789432960818.jpg', base: 'trainer_neutral_clean.png', yMax: 650, collarY: 317 },

    // Athletic Tank
    { id: 'top_athletic_tank', gender: 'female', file: 'female_tank_top_1789433029421.jpg', base: 'trainer_female_clean.png', yMax: 642, collarY: 332 },
    { id: 'top_athletic_tank', gender: 'male', file: 'male_tank_top_1789433051230.jpg', base: 'trainer_base_clean.png', yMax: 650, collarY: 322 },
    { id: 'top_athletic_tank', gender: 'neutral', file: 'neutral_tank_top_1789433072760.jpg', base: 'trainer_neutral_clean.png', yMax: 650, collarY: 322 },

    // School Blouse
    { id: 'top_school_blouse', gender: 'female', file: 'female_school_blouse_1789433096007.jpg', base: 'trainer_female_clean.png', yMax: 656, collarY: 304 },
    { id: 'top_school_blouse', gender: 'male', file: 'male_school_blouse_1789433120943.jpg', base: 'trainer_base_clean.png', yMax: 672, collarY: 308 },
    { id: 'top_school_blouse', gender: 'neutral', file: 'neutral_school_blouse_1789433145091.jpg', base: 'trainer_neutral_clean.png', yMax: 672, collarY: 308 },

    // Alchemist Vest
    { id: 'top_alchemist_vest', gender: 'female', file: 'female_alchemist_vest_1789433170962.jpg', base: 'trainer_female_clean.png', yMax: 692, collarY: 306 },
    { id: 'top_alchemist_vest', gender: 'male', file: 'male_alchemist_vest_1789433205515.jpg', base: 'trainer_base_clean.png', yMax: 690, collarY: 302 },
    { id: 'top_alchemist_vest', gender: 'neutral', file: 'neutral_alchemist_vest_1789433268407.jpg', base: 'trainer_neutral_clean.png', yMax: 690, collarY: 302 },

    // Celestial Tunic
    { id: 'top_celestial_tunic', gender: 'female', file: 'female_celestial_tunic_long_1789435601007.jpg', base: 'trainer_female_clean.png', yMax: 760, collarY: 306 },
    { id: 'top_celestial_tunic', gender: 'male', file: 'male_celestial_tunic_1789433338985.jpg', base: 'trainer_base_clean.png', yMax: 750, collarY: 302 },
    { id: 'top_celestial_tunic', gender: 'neutral', file: 'neutral_celestial_tunic_1789433368263.jpg', base: 'trainer_neutral_clean.png', yMax: 750, collarY: 302 },

    // Rune T-shirt
    { id: 'top_rune_tshirt', gender: 'female', file: 'female_rune_tshirt_1789433397317.jpg', base: 'trainer_female_clean.png', yMax: 642, collarY: 326 },
    { id: 'top_rune_tshirt', gender: 'male', file: 'male_rune_tshirt_1789433460596.jpg', base: 'trainer_base_clean.png', yMax: 650, collarY: 317 },
    { id: 'top_rune_tshirt', gender: 'neutral', file: 'neutral_rune_tshirt_1789433490374.jpg', base: 'trainer_neutral_clean.png', yMax: 650, collarY: 317 },
  ];

  function getMinY(gender, item, x) {
    if (x < 235 || x > 555) return 9999;
    const isFemale = gender === 'female';

    // Left shoulder (x: 235 to 345)
    if (x < 345) {
      if (isFemale) {
        return 302 + (345 - x) * 0.12;
      } else {
        return 298 + (345 - x) * 0.10;
      }
    }

    // Right shoulder (x: 425 to 555)
    if (x > 425) {
      if (isFemale) {
        return 300 + (x - 425) * 0.12;
      } else {
        return 296 + (x - 425) * 0.10;
      }
    }

    // Center neck (x between 345 and 425)
    return item.collarY;
  }

  for (const item of TOP_MAP) {
    const genPath = path.join(ARTIFACT_DIR, item.file);
    const basePath = path.join(AVATAR_DIR, item.base);

    const { data: genData } = await sharp(genPath).raw().toBuffer({ resolveWithObject: true });
    const { data: baseData } = await sharp(basePath).raw().toBuffer({ resolveWithObject: true });

    const outBuf = Buffer.alloc(w * h * 4, 0);

    for (let y = 290; y <= item.yMax; y++) {
      for (let x = 160; x <= 610; x++) {
        const minY = getMinY(item.gender, item, x);
        if (y < minY) continue;

        const idx3 = (y * w + x) * 3;
        const idx4 = (y * w + x) * 4;

        const r = genData[idx3];
        const g = genData[idx3 + 1];
        const b = genData[idx3 + 2];

        // Skip plain white background
        if (r > 248 && g > 248 && b > 248) continue;

        // In center neck (x between 345 and 425):
        // If above the collar line, don't copy neck skin so base model skin shows through
        if (x >= 345 && x <= 425 && y < 327) {
          const isSkin = (r > 175 && g > 125 && b > 95 && r > g && g > b && (r - b) > 25);
          if (isSkin) continue;
        }

        // Filter out long brown hair strands hanging over the shoulders
        if (y < 350 && (x < 340 || x > 430)) {
          const isDarkHair = (r < 75 && g < 55 && b < 45);
          if (isDarkHair) continue;
        }

        // Silhouette boundary check
        const inBase = baseData[idx4 + 3] > 40;
        if (!inBase) {
          let nearBase = false;
          for (let dy = -4; dy <= 4; dy++) {
            for (let dx = -4; dx <= 4; dx++) {
              const nIdx4 = ((y + dy) * w + (x + dx)) * 4;
              if (nIdx4 >= 0 && nIdx4 < baseData.length && baseData[nIdx4 + 3] > 100) {
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

    const outFileName = `${item.gender}_${item.id}.png`;
    const outPath = path.join(TOPS_DIR, outFileName);

    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
      .png({ compressionLevel: 8 })
      .toFile(outPath);

    console.log(`Calibrated top asset: ${outFileName}`);
  }

  console.log('--- All base sprites, skin masks, and top overlays successfully synchronized! ---');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
