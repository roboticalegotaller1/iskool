import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const AVATAR_DIR = 'public/images/avatar';
const TOPS_DIR = 'public/images/avatar/tops';
const w = 768, h = 1376;

async function prepareBaseSprites() {
  console.log('=== Step 1: Base Sprites Neck, Shoulders & Arms Skin Restoration ===');

  const configs = [
    {
      gender: 'female',
      baseFile: 'trainer_female_clean.png',
      maskFile: 'trainer_female_skin_mask.png',
      tankFile: 'female_tank_top_1789433029421.jpg',
      bodyFile: 'female_body_clean_1789432915573.jpg',
      neckX: [340, 430],
      neckY: [230, 355],
    },
    {
      gender: 'male',
      baseFile: 'trainer_base_clean.png',
      maskFile: 'trainer_clean_skin_mask.png',
      tankFile: 'male_tank_top_1789433051230.jpg',
      bodyFile: 'male_body_clean_1789432936103.jpg',
      neckX: [330, 440],
      neckY: [230, 335],
    },
    {
      gender: 'neutral',
      baseFile: 'trainer_neutral_clean.png',
      maskFile: 'trainer_neutral_skin_mask.png',
      tankFile: 'neutral_tank_top_1789433072760.jpg',
      bodyFile: 'neutral_body_clean_1789432960818.jpg',
      neckX: [330, 440],
      neckY: [230, 345],
    }
  ];

  for (const c of configs) {
    const basePath = path.join(AVATAR_DIR, c.baseFile);
    const maskPath = path.join(AVATAR_DIR, c.maskFile);

    // Get pristine git base buffer
    const gitBaseBuf = execSync(`git show HEAD:public/images/avatar/${c.baseFile}`);
    const gitMaskBuf = execSync(`git show HEAD:public/images/avatar/${c.maskFile}`);

    const base = await sharp(gitBaseBuf).raw().toBuffer({ resolveWithObject: true });
    const mask = await sharp(gitMaskBuf).raw().toBuffer({ resolveWithObject: true });
    const tank = await sharp(path.join(ARTIFACT_DIR, c.tankFile)).raw().toBuffer({ resolveWithObject: true });
    const body = await sharp(path.join(ARTIFACT_DIR, c.bodyFile)).raw().toBuffer({ resolveWithObject: true });

    const outBase = Buffer.from(base.data);
    const outMask = Buffer.from(mask.data);

    // 1. Neck skin from bodyFile & tankFile (y=230 to neckY[1])
    for (let y = c.neckY[0]; y <= c.neckY[1]; y++) {
      for (let x = c.neckX[0]; x <= c.neckX[1]; x++) {
        const idx3 = (y * w + x) * 3;
        const idx4 = (y * w + x) * 4;

        // Try tank skin first, then body skin
        const tr = tank.data[idx3], tg = tank.data[idx3+1], tb = tank.data[idx3+2];
        const isTankSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);

        if (isTankSkin) {
          outBase[idx4] = tr;
          outBase[idx4+1] = tg;
          outBase[idx4+2] = tb;
          outBase[idx4+3] = 255;
          outMask[idx4] = 255;
          outMask[idx4+1] = 255;
          outMask[idx4+2] = 255;
          outMask[idx4+3] = 255;
        } else {
          const br = body.data[idx3], bg = body.data[idx3+1], bb = body.data[idx3+2];
          const isBodySkin = (br > 130 && bg > 80 && bb > 50 && br > bg && bg > bb && (br - bb) > 15);
          if (isBodySkin) {
            outBase[idx4] = br;
            outBase[idx4+1] = bg;
            outBase[idx4+2] = bb;
            outBase[idx4+3] = 255;
            outMask[idx4] = 255;
            outMask[idx4+1] = 255;
            outMask[idx4+2] = 255;
            outMask[idx4+3] = 255;
          }
        }
      }
    }

    // 2. Arms and shoulders from tankFile (y=295 to 480)
    for (let y = 295; y <= 480; y++) {
      for (let x = 160; x <= 610; x++) {
        if (x >= 310 && x <= 455 && y > c.neckY[1]) continue; // torso

        const idx3 = (y * w + x) * 3;
        const idx4 = (y * w + x) * 4;

        const tr = tank.data[idx3], tg = tank.data[idx3+1], tb = tank.data[idx3+2];
        const isTankWhiteBg = (tr > 245 && tg > 245 && tb > 245);

        // Outside arm: trim old baggy sleeve
        if (isTankWhiteBg && (x < 310 || x > 455)) {
          outBase[idx4 + 3] = 0;
          outMask[idx4 + 3] = 0;
          continue;
        }

        const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
        if (isSkin) {
          outBase[idx4] = tr;
          outBase[idx4+1] = tg;
          outBase[idx4+2] = tb;
          outBase[idx4+3] = 255;
          outMask[idx4] = 255;
          outMask[idx4+1] = 255;
          outMask[idx4+2] = 255;
          outMask[idx4+3] = 255;
        }
      }
    }

    // 3. Infill any remaining dark collar pixels in y=285..345, x=240..530
    for (let pass = 0; pass < 5; pass++) {
      for (let y = 285; y <= 345; y++) {
        for (let x = 240; x <= 530; x++) {
          const idx4 = (y * w + x) * 4;
          if (outBase[idx4 + 3] < 50) continue;

          const r = outBase[idx4], g = outBase[idx4+1], b = outBase[idx4+2];
          const isDarkCollar = (r < 75 && g < 75 && b < 75);
          if (isDarkCollar) {
            let rSum = 0, gSum = 0, bSum = 0, weightSum = 0;
            for (let dy = -6; dy <= 6; dy++) {
              for (let dx = -6; dx <= 6; dx++) {
                const ny = y + dy, nx = x + dx;
                if (ny < 230 || ny > 360 || nx < 240 || nx > 530) continue;
                const nIdx4 = (ny * w + nx) * 4;
                const nr = outBase[nIdx4], ng = outBase[nIdx4+1], nb = outBase[nIdx4+2];
                const isNeighborSkin = (nr > 130 && ng > 80 && nb > 50 && nr > ng && ng > nb);
                if (isNeighborSkin) {
                  const dist = Math.hypot(dx, dy);
                  const weight = 1 / (1 + dist);
                  rSum += nr * weight;
                  gSum += ng * weight;
                  bSum += nb * weight;
                  weightSum += weight;
                }
              }
            }

            if (weightSum > 0) {
              outBase[idx4] = Math.round(rSum / weightSum);
              outBase[idx4+1] = Math.round(gSum / weightSum);
              outBase[idx4+2] = Math.round(bSum / weightSum);
              outMask[idx4] = 255;
              outMask[idx4+1] = 255;
              outMask[idx4+2] = 255;
              outMask[idx4+3] = 255;
            }
          }
        }
      }
    }

    await sharp(outBase, { raw: { width: w, height: h, channels: 4 } }).png().toFile(basePath);
    await sharp(outMask, { raw: { width: w, height: h, channels: 4 } }).png().toFile(maskPath);
    console.log(`Cleaned ${c.gender} base sprite & skin mask successfully!`);
  }
}

async function prepareTops() {
  console.log('=== Step 2: Calibrating all 7 modular tops across 3 genders ===');

  // 1. Extract Dia de Muertos tops
  console.log('Extracting Dia de Muertos tops from git HEAD...');
  for (const g of ['female', 'male', 'neutral']) {
    const gitBaseBuf = execSync(`git show HEAD:public/images/avatar/trainer_${g === 'male' ? 'base' : g}_clean.png`);
    const buf = await sharp(gitBaseBuf).raw().toBuffer({ resolveWithObject: true });
    const outBuf = Buffer.alloc(w * h * 4, 0);

    const yEnd = g === 'female' ? 642 : 650;
    for (let y = 290; y <= yEnd; y++) {
      for (let x = 220; x <= 560; x++) {
        const idx4 = (y * w + x) * 4;
        if (buf.data[idx4 + 3] < 50) continue;

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

    const outName = `${g}_top_dia_de_muertos.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
    console.log(`Generated top: ${outName}`);
  }

  // 2. Extract Athletic Tank Tops
  console.log('Extracting Athletic Tank tops...');
  const tankDefs = [
    { gender: 'female', file: 'female_tank_top_1789433029421.jpg', scoopX: [345, 425], scoopMaxY: 356, yMax: 642 },
    { gender: 'male', file: 'male_tank_top_1789433051230.jpg', scoopX: [350, 420], scoopMaxY: 326, yMax: 650 },
    { gender: 'neutral', file: 'neutral_tank_top_1789433072760.jpg', scoopX: [350, 420], scoopMaxY: 340, yMax: 650 },
  ];

  for (const td of tankDefs) {
    const gen = await sharp(path.join(ARTIFACT_DIR, td.file)).raw().toBuffer({ resolveWithObject: true });
    const outBuf = Buffer.alloc(w * h * 4, 0);

    for (let y = 295; y <= td.yMax; y++) {
      for (let x = 160; x <= 610; x++) {
        const idx3 = (y * w + x) * 3;
        const idx4 = (y * w + x) * 4;

        const r = gen.data[idx3], g = gen.data[idx3+1], b = gen.data[idx3+2];
        if (r > 245 && g > 245 && b > 245) continue; // white bg

        // Check if inside neck scoop (above green collar band)
        if (x >= td.scoopX[0] && x <= td.scoopX[1] && y < td.scoopMaxY) {
          const isGreenPiping = (r > 150 && g > 200 && b < 170);
          if (!isGreenPiping) continue; // transparent neck skin inside scoop
        }

        // Check if bare arm / shoulder skin
        const isSkin = (r > 130 && g > 80 && b > 50 && r > g && g > b && (r - b) > 15);
        if (isSkin) {
          // If on arms or neck, make transparent
          if (x < 315 || x > 455 || y < td.scoopMaxY) continue;
        }

        outBuf[idx4] = r;
        outBuf[idx4+1] = g;
        outBuf[idx4+2] = b;
        outBuf[idx4+3] = 255;
      }
    }

    const outName = `${td.gender}_top_athletic_tank.png`;
    await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
    console.log(`Generated top: ${outName}`);
  }

  // 3. Extract other tops: Basic, School Blouse, Alchemist Vest, Celestial Tunic, Rune T-Shirt
  const standardDefs = [
    { id: 'top_basic', files: { female: 'female_body_clean_1789432915573.jpg', male: 'male_body_clean_1789432936103.jpg', neutral: 'neutral_body_clean_1789432960818.jpg' }, yMax: { female: 642, male: 650, neutral: 650 } },
    { id: 'top_school_blouse', files: { female: 'female_school_blouse_1789433096007.jpg', male: 'male_school_blouse_1789433120943.jpg', neutral: 'neutral_school_blouse_1789433145091.jpg' }, yMax: { female: 656, male: 672, neutral: 672 } },
    { id: 'top_alchemist_vest', files: { female: 'female_alchemist_vest_1789433170962.jpg', male: 'male_alchemist_vest_1789433205515.jpg', neutral: 'neutral_alchemist_vest_1789433268407.jpg' }, yMax: { female: 692, male: 690, neutral: 690 } },
    { id: 'top_celestial_tunic', files: { female: 'female_celestial_tunic_long_1789435601007.jpg', male: 'male_celestial_tunic_1789433338985.jpg', neutral: 'neutral_celestial_tunic_1789433368263.jpg' }, yMax: { female: 760, male: 750, neutral: 750 } },
    { id: 'top_rune_tshirt', files: { female: 'female_rune_tshirt_1789433397317.jpg', male: 'male_rune_tshirt_1789433460596.jpg', neutral: 'neutral_rune_tshirt_1789433490374.jpg' }, yMax: { female: 642, male: 650, neutral: 650 } },
  ];

  for (const sDef of standardDefs) {
    for (const g of ['female', 'male', 'neutral']) {
      const genFile = sDef.files[g];
      const genPath = path.join(ARTIFACT_DIR, genFile);
      const gen = await sharp(genPath).raw().toBuffer({ resolveWithObject: true });
      const outBuf = Buffer.alloc(w * h * 4, 0);

      const yMax = sDef.yMax[g];
      const neckMinX = g === 'female' ? 345 : 335;
      const neckMaxX = g === 'female' ? 425 : 435;

      for (let x = 160; x <= 610; x++) {
        let clothStartY = -1;
        for (let y = 260; y <= 350; y++) {
          const idx3 = (y * w + x) * 3;
          const r = gen.data[idx3], g = gen.data[idx3+1], b = gen.data[idx3+2];
          if (r > 245 && g > 245 && b > 245) continue; // white bg

          if (x >= neckMinX && x <= neckMaxX) {
            const isSkin = (r > 130 && g > 80 && b > 50 && r > g && g > b && (r - b) > 15);
            if (isSkin) continue; // skip neck skin above collar
          }

          clothStartY = y;
          break;
        }

        if (clothStartY !== -1) {
          for (let y = clothStartY; y <= yMax; y++) {
            const idx3 = (y * w + x) * 3;
            const idx4 = (y * w + x) * 4;
            const r = gen.data[idx3], g = gen.data[idx3+1], b = gen.data[idx3+2];
            if (r > 245 && g > 245 && b > 245) continue;

            // Infill female shoulder hair locks with clothing color
            if (g === 'female' && y < 335 && (x < 340 || x > 430)) {
              if (r < 75 && g < 55 && b < 45) {
                // If it was dark hair strand over the shirt, sample adjacent shirt
                continue;
              }
            }

            outBuf[idx4] = r;
            outBuf[idx4+1] = g;
            outBuf[idx4+2] = b;
            outBuf[idx4+3] = 255;
          }
        }
      }

      // Slightly dilate sleeve outer borders by 3px so sleeves completely cover base silhouette
      const copyBuf = Buffer.from(outBuf);
      for (let y = 330; y <= yMax; y++) {
        for (let x = 160; x <= 610; x++) {
          const idx4 = (y * w + x) * 4;
          if (copyBuf[idx4 + 3] === 0) {
            let adjR = -1, adjG = -1, adjB = -1;
            for (let dx = -3; dx <= 3; dx++) {
              const nIdx4 = (y * w + (x + dx)) * 4;
              if (nIdx4 >= 0 && copyBuf[nIdx4 + 3] === 255) {
                adjR = copyBuf[nIdx4]; adjG = copyBuf[nIdx4+1]; adjB = copyBuf[nIdx4+2];
                break;
              }
            }
            if (adjR !== -1 && (adjR > 180 || sDef.id === 'top_rune_tshirt' || sDef.id === 'top_alchemist_vest')) {
              outBuf[idx4] = adjR;
              outBuf[idx4+1] = adjG;
              outBuf[idx4+2] = adjB;
              outBuf[idx4+3] = 255;
            }
          }
        }
      }

      const outName = `${g}_${sDef.id}.png`;
      await sharp(outBuf, { raw: { width: w, height: h, channels: 4 } }).png({ compressionLevel: 8 }).toFile(path.join(TOPS_DIR, outName));
      console.log(`Generated top: ${outName}`);
    }
  }
}

async function verifyAll() {
  console.log('=== Step 3: Verification ===');
  const tops = ['top_basic', 'top_athletic_tank', 'top_school_blouse', 'top_alchemist_vest', 'top_celestial_tunic', 'top_rune_tshirt', 'top_dia_de_muertos'];
  const genders = ['female', 'male', 'neutral'];

  let totalExposed = 0;
  for (const g of genders) {
    const baseFile = `trainer_${g === 'male' ? 'base' : g}_clean.png`;
    const baseBuf = await sharp(path.join(AVATAR_DIR, baseFile)).raw().toBuffer({ resolveWithObject: true });

    for (const topId of tops) {
      const topFile = `${g}_${topId}.png`;
      const topBuf = await sharp(path.join(TOPS_DIR, topFile)).raw().toBuffer({ resolveWithObject: true });

      let exposed = 0;
      for (let y = 285; y <= 345; y++) {
        for (let x = 240; x <= 530; x++) {
          const idx4 = (y * w + x) * 4;
          if (topBuf.data[idx4 + 3] < 150) {
            const br = baseBuf.data[idx4], bg = baseBuf.data[idx4+1], bb = baseBuf.data[idx4+2], ba = baseBuf.data[idx4+3];
            if (ba > 100 && br < 75 && bg < 75 && bb < 75) {
              exposed++;
            }
          }
        }
      }

      if (exposed > 0) {
        console.warn(`WARNING: ${g} + ${topId} has ${exposed} exposed dark collar pixels!`);
        totalExposed += exposed;
      } else {
        console.log(`PASS: ${g} + ${topId} -> 0 exposed collar pixels`);
      }
    }
  }

  if (totalExposed === 0) {
    console.log('PERFECTION: ALL 21 COMBINATIONS PASSED WITH 0 EXPOSED COLLAR PIXELS!');
  }
}

async function main() {
  await prepareBaseSprites();
  await prepareTops();
  await verifyAll();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
