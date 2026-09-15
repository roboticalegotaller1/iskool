import sharp from 'sharp';
import fs from 'fs';

const svg = `
<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Left eye socket clip -->
    <clipPath id="clipLeft">
      <path d="M 374,199 C 369,190 361,185 352,185 C 341,185 333,189 326,194 C 333,203 342,208 353,208 C 363,208 370,204 374,199 Z" />
    </clipPath>
    <!-- Right eye socket clip -->
    <clipPath id="clipRight">
      <path d="M 395,199 C 400,190 408,185 417,185 C 428,185 436,189 443,194 C 436,203 427,208 416,208 C 406,208 399,204 395,199 Z" />
    </clipPath>
  </defs>

  <!-- Left Eye -->
  <g clip-path="url(#clipLeft)">
    <rect x="315" y="180" width="70" height="35" fill="#F8FAFC" />
    <!-- Upper Sclera Shadow -->
    <path d="M 374,199 C 369,190 361,185 352,185 C 341,185 333,189 326,194 L 326,185 L 374,185 Z" fill="#94A3B8" opacity="0.35" />
    
    <!-- Outer Iris (Deep Navy / Sapphire) -->
    <ellipse cx="353" cy="197" rx="14" ry="11.5" fill="#1E3A8A" />
    <!-- Mid Iris (Vibrant Cobalt) -->
    <ellipse cx="353" cy="198.5" rx="11.5" ry="8.5" fill="#2563EB" />
    <!-- Lower Glow (Cyan/Azure arc) -->
    <ellipse cx="353" cy="201" rx="9" ry="5" fill="#38BDF8" />
    <!-- Deep Pupil -->
    <circle cx="353" cy="197" r="5" fill="#09090B" />
    <!-- Specular Highlight Primary (Top-Left) -->
    <circle cx="348.5" cy="193" r="3.5" fill="#FFFFFF" />
    <!-- Specular Highlight Secondary (Bottom-Right) -->
    <circle cx="358" cy="201.5" r="2" fill="#FFFFFF" opacity="0.9" />
  </g>
  <!-- Upper Eyeliner Left -->
  <path d="M 374,199 C 369,189 360,184 351,184 C 340,184 332,188 325,193" fill="none" stroke="#0F172A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Wing tip -->
  <path d="M 327,192 Q 323,188 320,187" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" />
  <path d="M 332,190 Q 330,186 328,184" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <!-- Lower lash line subtle -->
  <path d="M 370,202 C 365,206 358,208 353,208 C 346,208 338,205 332,200" fill="none" stroke="#0F172A" stroke-width="1.8" opacity="0.85" stroke-linecap="round" />
  <!-- Double eyelid crease -->
  <path d="M 368,180 Q 353,177 337,181" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />

  <!-- Right Eye -->
  <g clip-path="url(#clipRight)">
    <rect x="385" y="180" width="70" height="35" fill="#F8FAFC" />
    <!-- Upper Sclera Shadow -->
    <path d="M 395,199 C 400,190 408,185 417,185 C 428,185 436,189 443,194 L 443,185 L 395,185 Z" fill="#94A3B8" opacity="0.35" />

    <!-- Outer Iris (Deep Navy / Sapphire) -->
    <ellipse cx="416" cy="197" rx="14" ry="11.5" fill="#1E3A8A" />
    <!-- Mid Iris (Vibrant Cobalt) -->
    <ellipse cx="416" cy="198.5" rx="11.5" ry="8.5" fill="#2563EB" />
    <!-- Lower Glow (Cyan/Azure arc) -->
    <ellipse cx="416" cy="201" rx="9" ry="5" fill="#38BDF8" />
    <!-- Deep Pupil -->
    <circle cx="416" cy="197" r="5" fill="#09090B" />
    <!-- Specular Highlight Primary (Top-Left) -->
    <circle cx="411.5" cy="193" r="3.5" fill="#FFFFFF" />
    <!-- Specular Highlight Secondary (Bottom-Right) -->
    <circle cx="421" cy="201.5" r="2" fill="#FFFFFF" opacity="0.9" />
  </g>
  <!-- Upper Eyeliner Right -->
  <path d="M 395,199 C 400,189 409,184 418,184 C 429,184 437,188 444,193" fill="none" stroke="#0F172A" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
  <!-- Wing tip -->
  <path d="M 442,192 Q 446,188 449,187" fill="none" stroke="#0F172A" stroke-width="2.2" stroke-linecap="round" />
  <path d="M 437,190 Q 439,186 441,184" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <!-- Lower lash line subtle -->
  <path d="M 399,202 C 404,206 411,208 416,208 C 423,208 431,205 437,200" fill="none" stroke="#0F172A" stroke-width="1.8" opacity="0.85" stroke-linecap="round" />
  <!-- Double eyelid crease -->
  <path d="M 401,180 Q 416,177 432,181" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />
</svg>
`;

fs.writeFileSync('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_calibrated_overlay.svg', svg);

async function run() {
  const composited = await sharp('public/images/avatar/trainer_female_clean.png')
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();

  await sharp(composited)
    .extract({ left: 300, top: 165, width: 160, height: 80 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_calibrated_composite.png');

  console.log('Saved test_calibrated_composite.png');
}

run();
