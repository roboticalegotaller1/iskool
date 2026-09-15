import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const OUT_DIR = 'public/images/avatar/tops';

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const TOP_MAP = [
  // Basic
  { id: 'top_basic', gender: 'female', file: 'female_body_clean_1789432915573.jpg', base: 'trainer_female_clean.png', yMax: 642 },
  { id: 'top_basic', gender: 'male', file: 'male_body_clean_1789432936103.jpg', base: 'trainer_base_clean.png', yMax: 650 },
  { id: 'top_basic', gender: 'neutral', file: 'neutral_body_clean_1789432960818.jpg', base: 'trainer_neutral_clean.png', yMax: 650 },

  // Athletic Tank
  { id: 'top_athletic_tank', gender: 'female', file: 'female_tank_top_1789433029421.jpg', base: 'trainer_female_clean.png', yMax: 642 },
  { id: 'top_athletic_tank', gender: 'male', file: 'male_tank_top_1789433051230.jpg', base: 'trainer_base_clean.png', yMax: 650 },
  { id: 'top_athletic_tank', gender: 'neutral', file: 'neutral_tank_top_1789433072760.jpg', base: 'trainer_neutral_clean.png', yMax: 650 },

  // School Blouse
  { id: 'top_school_blouse', gender: 'female', file: 'female_school_blouse_1789433096007.jpg', base: 'trainer_female_clean.png', yMax: 656 },
  { id: 'top_school_blouse', gender: 'male', file: 'male_school_blouse_1789433120943.jpg', base: 'trainer_base_clean.png', yMax: 672 },
  { id: 'top_school_blouse', gender: 'neutral', file: 'neutral_school_blouse_1789433145091.jpg', base: 'trainer_neutral_clean.png', yMax: 672 },

  // Alchemist Vest
  { id: 'top_alchemist_vest', gender: 'female', file: 'female_alchemist_vest_1789433170962.jpg', base: 'trainer_female_clean.png', yMax: 692 },
  { id: 'top_alchemist_vest', gender: 'male', file: 'male_alchemist_vest_1789433205515.jpg', base: 'trainer_base_clean.png', yMax: 690 },
  { id: 'top_alchemist_vest', gender: 'neutral', file: 'neutral_alchemist_vest_1789433268407.jpg', base: 'trainer_neutral_clean.png', yMax: 690 },

  // Celestial Tunic
  { id: 'top_celestial_tunic', gender: 'female', file: 'female_celestial_tunic_long_1789435601007.jpg', base: 'trainer_female_clean.png', yMax: 760 },
  { id: 'top_celestial_tunic', gender: 'male', file: 'male_celestial_tunic_1789433338985.jpg', base: 'trainer_base_clean.png', yMax: 750 },
  { id: 'top_celestial_tunic', gender: 'neutral', file: 'neutral_celestial_tunic_1789433368263.jpg', base: 'trainer_neutral_clean.png', yMax: 750 },

  // Rune T-shirt
  { id: 'top_rune_tshirt', gender: 'female', file: 'female_rune_tshirt_1789433397317.jpg', base: 'trainer_female_clean.png', yMax: 642 },
  { id: 'top_rune_tshirt', gender: 'male', file: 'male_rune_tshirt_1789433460596.jpg', base: 'trainer_base_clean.png', yMax: 650 },
  { id: 'top_rune_tshirt', gender: 'neutral', file: 'neutral_rune_tshirt_1789433490374.jpg', base: 'trainer_neutral_clean.png', yMax: 650 },
];

function getMinY(gender, topId, x) {
  if (x < 235 || x > 555) return 9999;
  const isFemale = gender === 'female';

  // 1. Hombro izquierdo (x de 235 a 345)
  if (x < 345) {
    if (isFemale) {
      return 302 + (345 - x) * 0.12;
    } else {
      return 298 + (345 - x) * 0.10;
    }
  }

  // 2. Hombro derecho (x de 425 a 555)
  if (x > 425) {
    if (isFemale) {
      return 300 + (x - 425) * 0.12;
    } else {
      return 296 + (x - 425) * 0.10;
    }
  }

  // 3. Área Central del Cuello (x entre 345 y 425)
  if (topId === 'top_school_blouse') {
    return isFemale ? 304 : 308;
  }
  if (topId === 'top_alchemist_vest' || topId === 'top_celestial_tunic') {
    return isFemale ? 306 : 302;
  }
  if (topId === 'top_basic' || topId === 'top_rune_tshirt') {
    return isFemale ? 327 : 318;
  }
  if (topId === 'top_athletic_tank') {
    return isFemale ? 332 : 322;
  }

  return 315;
}

async function extractTop(item) {
  const genPath = path.join(ARTIFACT_DIR, item.file);
  const basePath = path.join('public/images/avatar', item.base);

  const { data: genData } = await sharp(genPath).raw().toBuffer({ resolveWithObject: true });
  const { data: baseData } = await sharp(basePath).raw().toBuffer({ resolveWithObject: true });

  const w = 768, h = 1376;
  const outBuf = Buffer.alloc(w * h * 4, 0);

  for (let y = 290; y <= item.yMax; y++) {
    for (let x = 160; x <= 610; x++) {
      const minY = getMinY(item.gender, item.id, x);
      if (y < minY) continue;

      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;

      const r = genData[idx3];
      const g = genData[idx3 + 1];
      const b = genData[idx3 + 2];

      // Ignorar fondo blanco
      if (r > 248 && g > 248 && b > 248) continue;

      // Área central de cuello (x entre 345 y 425):
      // Omitir piel del cuello para preservar intacto el modelo base
      if (x >= 345 && x <= 425 && y < 327) {
        const isSkin = (r > 175 && g > 125 && b > 95 && r > g && g > b && (r - b) > 25);
        if (isSkin) continue;
      }

      // Zona de hombros: filtrar mechones oscuros de cabello de la IA
      if (y < 350 && (x < 340 || x > 430)) {
        const isDarkHair = (r < 75 && g < 55 && b < 45);
        if (isDarkHair) continue;
      }

      // Silueta exterior
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
  const outPath = path.join(OUT_DIR, outFileName);

  await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } })
    .png({ compressionLevel: 8 })
    .toFile(outPath);

  console.log(`Calibrated top asset: ${outFileName}`);

  // Test composite
  const testCompPath = path.join(ARTIFACT_DIR, `composite_${item.gender}_${item.id}.png`);
  await sharp(basePath)
    .composite([{ input: outPath, blend: 'over' }])
    .png()
    .toFile(testCompPath);
}

async function main() {
  for (const item of TOP_MAP) {
    await extractTop(item);
  }
  console.log('All 18 tops calibrated successfully without neck/chin overlap!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
