import sharp from 'sharp';

async function trace() {
  const { data, info } = await sharp('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/git_head_female_eyes.png').raw().toBuffer({ resolveWithObject: true });
  console.log('--- LEFT EYELID y in [186, 202] ---');
  for (let x = 320; x <= 372; x += 2) {
    let topY = null, botY = null;
    for (let y = 186; y <= 200; y++) {
      const lx = x - 300, ly = y - 165;
      const idx = (ly * info.width + lx) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r < 65 && g < 65 && b < 65) {
        if (topY === null) topY = y;
        botY = y;
      }
    }
    if (topY !== null) {
      console.log('x=' + x + ': topY=' + topY + ' botY=' + botY);
    }
  }

  console.log('--- RIGHT EYELID y in [186, 202] ---');
  for (let x = 394; x <= 450; x += 2) {
    let topY = null, botY = null;
    for (let y = 186; y <= 200; y++) {
      const lx = x - 300, ly = y - 165;
      const idx = (ly * info.width + lx) * info.channels;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r < 65 && g < 65 && b < 65) {
        if (topY === null) topY = y;
        botY = y;
      }
    }
    if (topY !== null) {
      console.log('x=' + x + ': topY=' + topY + ' botY=' + botY);
    }
  }
}

trace();
