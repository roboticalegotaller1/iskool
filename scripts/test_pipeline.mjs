import sharp from 'sharp';

async function testFullPipeline() {
  const { data, info } = await sharp('public/images/avatar/trainer_female_clean.png')
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = info.width, h = info.height;
  const out = Buffer.from(data);

  function inpaintEye(minX, maxX, minY, maxY) {
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const rx = (maxX - minX) / 2;
    const ry = (maxY - minY) / 2;

    for (let y = minY - 2; y <= maxY + 2; y++) {
      for (let x = minX - 2; x <= maxX + 2; x++) {
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        const distSq = dx * dx + dy * dy;

        if (distSq <= 1.25) {
          const ty = Math.max(0, Math.min(1, (y - minY) / (maxY - minY)));
          const targetR = Math.round(245 * (1 - ty) + 244 * ty);
          const targetG = Math.round(200 * (1 - ty) + 193 * ty);
          const targetB = Math.round(178 * (1 - ty) + 162 * ty);

          const idx = (y * w + x) * 4;
          if (distSq <= 0.85) {
            out[idx] = targetR;
            out[idx+1] = targetG;
            out[idx+2] = targetB;
          } else {
            const alpha = (1.25 - distSq) / 0.4;
            out[idx] = Math.round(targetR * alpha + data[idx] * (1 - alpha));
            out[idx+1] = Math.round(targetG * alpha + data[idx+1] * (1 - alpha));
            out[idx+2] = Math.round(targetB * alpha + data[idx+2] * (1 - alpha));
          }
        }
      }
    }
  }

  inpaintEye(324, 376, 188, 209);
  inpaintEye(392, 444, 188, 209);

  // SVG overlay for female eyes
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1376" viewBox="0 0 768 1376">
    <defs>
      <clipPath id="socketL">
        <path d="M 334,195 Q 353,189 371,198 Q 353,206 334,195 Z" />
      </clipPath>
      <clipPath id="socketR">
        <path d="M 397,198 Q 415,189 434,195 Q 415,206 397,198 Z" />
      </clipPath>
    </defs>

    <!-- LEFT EYE -->
    <g clip-path="url(#socketL)">
      <rect x="330" y="185" width="45" height="25" fill="#F8FAFC" />
      <path d="M 334,195 Q 353,189 371,198 L 371,193 L 334,193 Z" fill="#CBD5E1" opacity="0.45" />
      <ellipse cx="353" cy="198" rx="9.5" ry="9.5" fill="#D97706" />
      <circle cx="353" cy="200" r="5.5" fill="#FBBF24" />
      <circle cx="353" cy="198" r="3.8" fill="#78350F" />
      <circle cx="350" cy="195" r="2.2" fill="#FFFFFF" />
    </g>
    <path d="M 371,198 Q 353,189 334,195 L 326,192" fill="none" stroke="#0F172A" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 329,193 Q 326,189 324,187" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 333,191 Q 332,187 330,185" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 368,200 Q 353,206 338,197" fill="none" stroke="#0F172A" stroke-width="1.4" opacity="0.75" stroke-linecap="round" />
    <path d="M 366,185 Q 353,182 340,186" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />

    <!-- RIGHT EYE -->
    <g clip-path="url(#socketR)">
      <rect x="393" y="185" width="45" height="25" fill="#F8FAFC" />
      <path d="M 397,198 Q 415,189 434,195 L 434,193 L 397,193 Z" fill="#CBD5E1" opacity="0.45" />
      <ellipse cx="415" cy="198" rx="9.5" ry="9.5" fill="#0284C7" />
      <circle cx="415" cy="200" r="5.5" fill="#38BDF8" />
      <circle cx="415" cy="198" r="3.8" fill="#0C4A6E" />
      <circle cx="412" cy="195" r="2.2" fill="#FFFFFF" />
    </g>
    <path d="M 397,198 Q 415,189 434,195 L 442,192" fill="none" stroke="#0F172A" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 439,193 Q 442,189 444,187" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 435,191 Q 436,187 438,185" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 400,200 Q 415,206 427,197" fill="none" stroke="#0F172A" stroke-width="1.4" opacity="0.75" stroke-linecap="round" />
    <path d="M 402,185 Q 415,182 426,186" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />
  </svg>`;

  // Save clean base image test
  await sharp(out, { raw: { width: w, height: h, channels: 4 } })
    .toFile('test_clean_face_full.png');

  // Composite SVG onto clean base image
  await sharp('test_clean_face_full.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .extract({ left: 300, top: 160, width: 170, height: 90 })
    .toFile('test_heterocromia_on_clean_face.png');

  console.log('Pipeline test complete!');
}

testFullPipeline();
