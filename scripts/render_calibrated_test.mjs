import sharp from 'sharp';

const left = { cx: 349, cy: 196, rx: 12, ry: 11 };
const right = { cx: 417, cy: 196, rx: 12, ry: 11 };

const leftSocket = 'M 368,199 C 364,190 357,186 349,186 C 340,186 334,190 329,195 C 334,201.5 341,205 349,205 C 357,205 364,202.5 368,199 Z';
const rightSocket = 'M 398,199 C 402,190 409,186 417,186 C 426,186 432,190 437,195 C 432,201.5 425,205 417,205 C 409,205 402,202.5 398,199 Z';

function renderIris(cx, cy, rx, ry, darkCol, midCol, glowCol) {
  return `
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${darkCol}" />
    <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="none" stroke="#090E1F" stroke-width="1.2" />
    <ellipse cx="${cx}" cy="${cy + 1.5}" rx="${rx - 1.5}" ry="${ry - 2}" fill="${midCol}" />
    <path d="M ${cx - 7},${cy + 4} Q ${cx},${cy + 8.5} ${cx + 7},${cy + 4}" fill="none" stroke="${glowCol}" stroke-width="2" opacity="0.9" stroke-linecap="round" />
    <circle cx="${cx}" cy="${cy - 0.5}" r="4.2" fill="#090E1F" />
    <circle cx="${cx - 3.8}" cy="${cy - 3.5}" r="3" fill="#FFFFFF" />
    <circle cx="${cx + 4.2}" cy="${cy + 3.5}" r="1.6" fill="#FFFFFF" opacity="0.9" />
  `;
}

const svg = `
<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="clipL"><path d="${leftSocket}" /></clipPath>
    <clipPath id="clipR"><path d="${rightSocket}" /></clipPath>
  </defs>

  <!-- LEFT EYE -->
  <g clip-path="url(#clipL)">
    <rect x="320" y="180" width="60" height="35" fill="#F8FAFC" />
    <path d="M 368,199 C 364,190 357,186 349,186 C 340,186 334,190 329,195 L 329,186 L 368,186 Z" fill="#64748B" opacity="0.32" />
    ${renderIris(left.cx, left.cy, left.rx, left.ry, '#0F172A', '#1D4ED8', '#38BDF8')}
  </g>

  <!-- Upper Eyeliner Left -->
  <path d="M 368,199 C 363,189.5 356,185.5 349,185.5 C 340,185.5 333,189.5 327,194 L 323,191.5 C 328,188.5 336,185 349,185 C 358,185 365,189 368,199 Z" fill="#0F172A" />
  <path d="M 327,194 L 322,191 L 326,188 Z" fill="#0F172A" />
  <path d="M 364,201 C 360,203.5 355,205 349,205 C 343,205 337,203.5 333,200" fill="none" stroke="#0F172A" stroke-width="1.5" opacity="0.75" stroke-linecap="round" />
  <path d="M 363,181 Q 349,177.5 336,181" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.32" stroke-linecap="round" />

  <!-- RIGHT EYE -->
  <g clip-path="url(#clipR)">
    <rect x="390" y="180" width="60" height="35" fill="#F8FAFC" />
    <path d="M 398,199 C 402,190 409,186 417,186 C 426,186 432,190 437,195 L 437,186 L 398,186 Z" fill="#64748B" opacity="0.32" />
    ${renderIris(right.cx, right.cy, right.rx, right.ry, '#0F172A', '#1D4ED8', '#38BDF8')}
  </g>

  <!-- Upper Eyeliner Right -->
  <path d="M 398,199 C 403,189.5 410,185.5 417,185.5 C 426,185.5 433,189.5 439,194 L 443,191.5 C 438,188.5 430,185 417,185 C 408,185 401,189 398,199 Z" fill="#0F172A" />
  <path d="M 439,194 L 444,191 L 440,188 Z" fill="#0F172A" />
  <path d="M 402,201 C 406,203.5 411,205 417,205 C 423,205 429,203.5 433,200" fill="none" stroke="#0F172A" stroke-width="1.5" opacity="0.75" stroke-linecap="round" />
  <path d="M 403,181 Q 417,177.5 430,181" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.32" stroke-linecap="round" />
</svg>`;

async function run() {
  const compositeBuf = await sharp('public/images/avatar/trainer_female_clean.png')
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();

  await sharp(compositeBuf)
    .extract({ left: 300, top: 165, width: 160, height: 80 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/comparison_calibrated_v6.png');

  console.log('Saved comparison_calibrated_v6.png');
}

run();
