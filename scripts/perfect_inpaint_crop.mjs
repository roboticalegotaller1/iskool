import sharp from 'sharp';

async function testPerfectInpaint() {
  const { data, info } = await sharp('female_eyes_crop.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width, h = info.height; // 130, 55 (crop relative to 320, 175)
  const out = Buffer.from(data);

  // We want to inpaint:
  // Left eye: relX 6 to 54 (abs 326 to 374), relY 11 to 33 (abs 186 to 208)
  // Right eye: relX 74 to 126 (abs 394 to 446), relY 11 to 33 (abs 186 to 208)

  // Skin tones around eyes in female_eyes_crop.png:
  // Top brow bone (relY 9..11): around (248, 203, 182)
  // Bottom cheek (relY 33..35): around (246, 194, 166)
  // Left temple (relX 4..6): around (240, 190, 168)
  // Nose bridge (relX 56..72): around (245, 197, 172)

  // Let's sample surrounding skin for each eye:
  // Left eye center: relX = 35 (abs 355), relY = 22 (abs 197)
  // rx = 22, ry = 11
  // Right eye center: relX = 96 (abs 416), relY = 22 (abs 197)
  // rx = 23, ry = 11

  function getSkinColor(relX, relY, eye) {
    // Vertical gradient from top of socket to bottom of socket
    const ty = Math.max(0, Math.min(1, (relY - 11) / 22));
    
    // Left eye vs right eye subtle horizontal lighting
    let r, g, b;
    if (eye === 'left') {
      // Shading: slightly warmer towards the nose (right) and softer towards left
      const tx = Math.max(0, Math.min(1, (relX - 10) / 44));
      r = Math.round((247 * (1 - ty) + 245 * ty) * (1 - tx * 0.01));
      g = Math.round((202 * (1 - ty) + 192 * ty) * (1 - tx * 0.02));
      b = Math.round((180 * (1 - ty) + 164 * ty) * (1 - tx * 0.03));
    } else {
      const tx = Math.max(0, Math.min(1, (relX - 75) / 50));
      r = Math.round(247 * (1 - ty) + 245 * ty);
      g = Math.round(202 * (1 - ty) + 192 * ty);
      b = Math.round(180 * (1 - ty) + 164 * ty);
    }
    return [r, g, b];
  }

  // Left eye inpaint mask: ellipse or polygon
  for (let y = 11; y <= 33; y++) {
    for (let x = 6; x <= 55; x++) {
      // Distance to left eye center (36, 22)
      // Left eye is slightly tilted up towards outer corner (x=10, y=17)
      const cx = 35;
      const cy = 22 - (35 - x) * 0.12; // tilt
      const rx = 24;
      const ry = 10.5;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.0) {
        const idx = (y * w + x) * 4;
        const [tr, tg, tb] = getSkinColor(x, y, 'left');
        if (dist < 0.75) {
          out[idx] = tr;
          out[idx+1] = tg;
          out[idx+2] = tb;
        } else {
          // Feather blend 0.75 to 1.0
          const weight = (1.0 - dist) / 0.25;
          out[idx] = Math.round(tr * weight + out[idx] * (1 - weight));
          out[idx+1] = Math.round(tg * weight + out[idx+1] * (1 - weight));
          out[idx+2] = Math.round(tb * weight + out[idx+2] * (1 - weight));
        }
      }
    }
  }

  // Right eye inpaint mask: relX 74 to 127
  for (let y = 11; y <= 33; y++) {
    for (let x = 74; x <= 126; x++) {
      const cx = 96;
      const cy = 22 - (x - 96) * 0.12; // tilt up towards outer wing
      const rx = 25;
      const ry = 10.5;
      const dx = (x - cx) / rx;
      const dy = (y - cy) / ry;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 1.0) {
        const idx = (y * w + x) * 4;
        const [tr, tg, tb] = getSkinColor(x, y, 'right');
        if (dist < 0.75) {
          out[idx] = tr;
          out[idx+1] = tg;
          out[idx+2] = tb;
        } else {
          const weight = (1.0 - dist) / 0.25;
          out[idx] = Math.round(tr * weight + out[idx] * (1 - weight));
          out[idx+1] = Math.round(tg * weight + out[idx+1] * (1 - weight));
          out[idx+2] = Math.round(tb * weight + out[idx+2] * (1 - weight));
        }
      }
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .toFile('test_inpainted_crop.png');

  console.log('Saved test_inpainted_crop.png');
}

testPerfectInpaint();
