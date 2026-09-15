import sharp from 'sharp';
import fs from 'fs';
import { execSync } from 'child_process';

async function blendAiFace() {
  const origBuf = execSync('git show HEAD:public/images/avatar/trainer_female_clean.png');
  const { data: origData, info: origInfo } = await sharp(origBuf).raw().toBuffer({ resolveWithObject: true });
  const w = origInfo.width, h = origInfo.height;

  // Resized AI image:
  // In gen: mouth center X = 536.5, Y = 755. Nose tip Y = 645.
  // In orig: mouth center X = 385, Y = 240.5. Nose tip Y = 227.
  // Distance nose to mouth:
  // Gen: 755 - 645 = 110.
  // Orig: 240.5 - 227 = 13.5.
  // Scale = 110 / 13.5 = 8.148
  // So width of gen image in orig coordinates should be: 1024 / 8.148 = 125.67...
  // Wait, let's also test horizontal scale:
  // Gen mouth width: 247. Orig mouth width: 40. Scale = 247 / 40 = 6.175.
  // Average scale ~ 6.5.
  // Let's test a range of scales and offsets to find the best match with the original face:
  
  // Or even simpler: we can resize female_face_no_eyes_1789420311625.jpg to match the eye sockets!
  // In gen image:
  // Left eye socket in gen: X ~ 300..450, Y ~ 380..520
  // Right eye socket in gen: X ~ 600..750, Y ~ 380..520
  
  // Let's inspect the eye socket region of female_face_no_eyes_1789420311625.jpg
  const genBuf = fs.readFileSync('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/female_face_no_eyes_1789420311625.jpg');
  
  // Let's extract just the skin texture from gen image around the eye area
  // and sample the smooth skin
  console.log('AI face blend script initialized');
}

blendAiFace();
