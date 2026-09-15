import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324';
const AVATAR_DIR = 'public/images/avatar';
const w = 768, h = 1376;

async function buildCleanBases() {
  console.log('--- Building Pristine Clean Base Mannequins (Male, Female, Neutral) ---');

  // ==========================================
  // 1. MALE BASE MANNEQUIN
  // ==========================================
  console.log('1. Generating male clean base...');
  const maleTankBuf = await sharp(path.join(ARTIFACT_DIR, 'male_tank_top_1789433051230.jpg')).raw().toBuffer({ resolveWithObject: true });
  const maleBaseBuf = await sharp(path.join(AVATAR_DIR, 'trainer_base_clean.png')).raw().toBuffer({ resolveWithObject: true });
  const maleMaskBuf = await sharp(path.join(AVATAR_DIR, 'trainer_clean_skin_mask.png')).raw().toBuffer({ resolveWithObject: true });

  const maleOut = Buffer.from(maleBaseBuf.data);
  const maleMaskOut = Buffer.from(maleMaskBuf.data);

  // Replace body below chin (y >= 230 to 670) with male_tank_top
  for (let y = 230; y <= 670; y++) {
    for (let x = 150; x <= 620; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const tr = maleTankBuf.data[idx3], tg = maleTankBuf.data[idx3+1], tb = maleTankBuf.data[idx3+2];

      // Outer white background -> transparent
      if (tr > 245 && tg > 245 && tb > 245) {
        maleOut[idx4 + 3] = 0;
        maleMaskOut[idx4 + 3] = 0;
        continue;
      }

      // Preserve spiky hair tips on back of neck (y < 265, dark hair pixels)
      if (y < 265) {
        const br = maleBaseBuf.data[idx4], bg = maleBaseBuf.data[idx4+1], bb = maleBaseBuf.data[idx4+2];
        const isHair = (br < 70 && bg < 60 && bb < 60);
        if (isHair) continue;
      }

      maleOut[idx4] = tr;
      maleOut[idx4+1] = tg;
      maleOut[idx4+2] = tb;
      maleOut[idx4+3] = 255;

      // Skin mask update: neck, clavicles, deltoids, arms
      const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
      if (isSkin && (y < 326 || x < 315 || x > 455)) {
        maleMaskOut[idx4] = 255;
        maleMaskOut[idx4+1] = 255;
        maleMaskOut[idx4+2] = 255;
        maleMaskOut[idx4+3] = 255;
      } else {
        maleMaskOut[idx4] = 0;
        maleMaskOut[idx4+1] = 0;
        maleMaskOut[idx4+2] = 0;
        maleMaskOut[idx4+3] = 0;
      }
    }
  }

  // Remove thin necklace line on neck (y: 280..310, x: 340..430)
  for (let y = 280; y <= 310; y++) {
    for (let x = 340; x <= 430; x++) {
      const idx4 = (y * w + x) * 4;
      const r = maleOut[idx4], g = maleOut[idx4+1], b = maleOut[idx4+2];
      if (r > 195 && g > 185 && b > 185) {
        const srcIdx = ((y - 4) * w + x) * 4;
        maleOut[idx4] = maleOut[srcIdx];
        maleOut[idx4+1] = maleOut[srcIdx+1];
        maleOut[idx4+2] = maleOut[srcIdx+2];
        maleMaskOut[idx4] = 255;
        maleMaskOut[idx4+1] = 255;
        maleMaskOut[idx4+2] = 255;
      }
    }
  }

  await sharp(maleOut, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_base_clean.png'));
  await sharp(maleMaskOut, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_clean_skin_mask.png'));
  console.log('Saved trainer_base_clean.png and trainer_clean_skin_mask.png');

  // ==========================================
  // 2. NEUTRAL BASE MANNEQUIN
  // ==========================================
  console.log('2. Generating neutral clean base...');
  const neutralTankBuf = await sharp(path.join(ARTIFACT_DIR, 'neutral_tank_top_1789433072760.jpg')).raw().toBuffer({ resolveWithObject: true });
  const neutralBaseBuf = await sharp(path.join(AVATAR_DIR, 'trainer_neutral_clean.png')).raw().toBuffer({ resolveWithObject: true });
  const neutralMaskBuf = await sharp(path.join(AVATAR_DIR, 'trainer_neutral_skin_mask.png')).raw().toBuffer({ resolveWithObject: true });

  const neutralOut = Buffer.from(neutralBaseBuf.data);
  const neutralMaskOut = Buffer.from(neutralMaskBuf.data);

  for (let y = 230; y <= 670; y++) {
    for (let x = 150; x <= 620; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const tr = neutralTankBuf.data[idx3], tg = neutralTankBuf.data[idx3+1], tb = neutralTankBuf.data[idx3+2];

      if (tr > 245 && tg > 245 && tb > 245) {
        neutralOut[idx4 + 3] = 0;
        neutralMaskOut[idx4 + 3] = 0;
        continue;
      }

      if (y < 265) {
        const br = neutralBaseBuf.data[idx4], bg = neutralBaseBuf.data[idx4+1], bb = neutralBaseBuf.data[idx4+2];
        const isHair = (br < 110 && bg < 110 && bb < 110 && Math.abs(br - bg) < 15);
        if (isHair) continue;
      }

      neutralOut[idx4] = tr;
      neutralOut[idx4+1] = tg;
      neutralOut[idx4+2] = tb;
      neutralOut[idx4+3] = 255;

      const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
      if (isSkin && (y < 326 || x < 315 || x > 455)) {
        neutralMaskOut[idx4] = 255;
        neutralMaskOut[idx4+1] = 255;
        neutralMaskOut[idx4+2] = 255;
        neutralMaskOut[idx4+3] = 255;
      } else {
        neutralMaskOut[idx4] = 0;
        neutralMaskOut[idx4+1] = 0;
        neutralMaskOut[idx4+2] = 0;
        neutralMaskOut[idx4+3] = 0;
      }
    }
  }

  // Remove necklace line
  for (let y = 280; y <= 310; y++) {
    for (let x = 340; x <= 430; x++) {
      const idx4 = (y * w + x) * 4;
      const r = neutralOut[idx4], g = neutralOut[idx4+1], b = neutralOut[idx4+2];
      if (r > 195 && g > 185 && b > 185) {
        const srcIdx = ((y - 4) * w + x) * 4;
        neutralOut[idx4] = neutralOut[srcIdx];
        neutralOut[idx4+1] = neutralOut[srcIdx+1];
        neutralOut[idx4+2] = neutralOut[srcIdx+2];
        neutralMaskOut[idx4] = 255;
        neutralMaskOut[idx4+1] = 255;
        neutralMaskOut[idx4+2] = 255;
      }
    }
  }

  await sharp(neutralOut, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_neutral_clean.png'));
  await sharp(neutralMaskOut, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_neutral_skin_mask.png'));
  console.log('Saved trainer_neutral_clean.png and trainer_neutral_skin_mask.png');

  // ==========================================
  // 3. FEMALE BASE MANNEQUIN
  // ==========================================
  console.log('3. Generating female clean base...');
  const femTankBuf = await sharp(path.join(ARTIFACT_DIR, 'female_tank_top_1789433029421.jpg')).raw().toBuffer({ resolveWithObject: true });
  const femBodyBuf = await sharp(path.join(ARTIFACT_DIR, 'female_body_clean_1789432915573.jpg')).raw().toBuffer({ resolveWithObject: true });
  const femBaseBuf = await sharp(path.join(AVATAR_DIR, 'trainer_female_clean.png')).raw().toBuffer({ resolveWithObject: true });
  const femMaskBuf = await sharp(path.join(AVATAR_DIR, 'trainer_female_skin_mask.png')).raw().toBuffer({ resolveWithObject: true });

  const femOut = Buffer.from(femBaseBuf.data);
  const femMaskOut = Buffer.from(femMaskBuf.data);

  // Copy tank top body (torso and bare arms)
  for (let y = 230; y <= 660; y++) {
    for (let x = 150; x <= 620; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const tr = femTankBuf.data[idx3], tg = femTankBuf.data[idx3+1], tb = femTankBuf.data[idx3+2];

      if (tr > 245 && tg > 245 && tb > 245) {
        femOut[idx4 + 3] = 0;
        femMaskOut[idx4 + 3] = 0;
        continue;
      }

      // Preserve female hair on head / face (y < 260)
      if (y < 260) {
        const br = femBaseBuf.data[idx4], bg = femBaseBuf.data[idx4+1], bb = femBaseBuf.data[idx4+2];
        const isHair = (br < 90 && bg < 70 && bb < 70);
        if (isHair) continue;
      }

      femOut[idx4] = tr;
      femOut[idx4+1] = tg;
      femOut[idx4+2] = tb;
      femOut[idx4+3] = 255;

      const isSkin = (tr > 120 && tg > 70 && tb > 45 && tr > tg && tg > tb && (tr - tb) > 15);
      if (isSkin && (y < 332 || x < 305 || x > 465)) {
        femMaskOut[idx4] = 255;
        femMaskOut[idx4+1] = 255;
        femMaskOut[idx4+2] = 255;
        femMaskOut[idx4+3] = 255;
      } else {
        femMaskOut[idx4] = 0;
        femMaskOut[idx4+1] = 0;
        femMaskOut[idx4+2] = 0;
        femMaskOut[idx4+3] = 0;
      }
    }
  }

  // Restore pristine neck & clavicles from female_body_clean (x: 335..435, y: 220..326)
  for (let y = 220; y <= 326; y++) {
    for (let x = 335; x <= 435; x++) {
      const idx3 = (y * w + x) * 3;
      const idx4 = (y * w + x) * 4;
      const br = femBodyBuf.data[idx3], bg = femBodyBuf.data[idx3+1], bb = femBodyBuf.data[idx3+2];
      const isSkin = (br > 140 && bg > 90 && bb > 60 && br > bg && bg > bb);
      if (isSkin) {
        femOut[idx4] = br;
        femOut[idx4+1] = bg;
        femOut[idx4+2] = bb;
        femOut[idx4+3] = 255;
        femMaskOut[idx4] = 255;
        femMaskOut[idx4+1] = 255;
        femMaskOut[idx4+2] = 255;
        femMaskOut[idx4+3] = 255;
      }
    }
  }

  // Remove thin necklace line if any
  for (let y = 280; y <= 315; y++) {
    for (let x = 340; x <= 430; x++) {
      const idx4 = (y * w + x) * 4;
      const r = femOut[idx4], g = femOut[idx4+1], b = femOut[idx4+2];
      if (r > 195 && g > 185 && b > 185) {
        const srcIdx = ((y - 4) * w + x) * 4;
        femOut[idx4] = femOut[srcIdx];
        femOut[idx4+1] = femOut[srcIdx+1];
        femOut[idx4+2] = femOut[srcIdx+2];
      }
    }
  }

  await sharp(femOut, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_female_clean.png'));
  await sharp(femMaskOut, { raw: { width: w, height: h, channels: 4 } }).png().toFile(path.join(AVATAR_DIR, 'trainer_female_skin_mask.png'));
  console.log('Saved trainer_female_clean.png and trainer_female_skin_mask.png');

  console.log('\n--- Pristine Clean Base Mannequins Built Successfully! ---');
}

buildCleanBases().catch(console.error);
