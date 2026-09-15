import sharp from 'sharp';
import fs from 'fs';

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="130" height="55" viewBox="320 175 130 55">
  <defs>
    <!-- Pixel-perfect sockets matching native eyes -->
    <clipPath id="socketLeft">
      <path d="M 336,195 Q 354,190 371,198 Q 356,206 336,195 Z" />
    </clipPath>
    <clipPath id="socketRight">
      <path d="M 397,198 Q 415,190 431,195 Q 415,206 397,198 Z" />
    </clipPath>
  </defs>

  <!-- Skin patch covering underlying eyes -->
  <path d="M 332,194 Q 354,188 373,197 Q 356,208 332,194 Z" fill="#F4BF9F" />
  <path d="M 395,197 Q 415,188 435,194 Q 415,208 395,197 Z" fill="#F4BF9F" />

  <!-- LEFT EYE -->
  <g clip-path="url(#socketLeft)">
    <rect x="330" y="185" width="45" height="25" fill="#F8FAFC" />
    <!-- Sclera soft inner shadow -->
    <path d="M 336,195 Q 354,190 371,198 L 371,193 L 336,193 Z" fill="#CBD5E1" opacity="0.45" />
    <!-- Iris -->
    <ellipse cx="356" cy="200" rx="9.5" ry="9.5" fill="#1E3A8A" />
    <ellipse cx="356" cy="202" rx="7.8" ry="6" fill="#2563EB" />
    <ellipse cx="356" cy="204" rx="5.5" ry="3.2" fill="#38BDF8" />
    <!-- Pupil -->
    <circle cx="356" cy="200" r="3.8" fill="#09090B" />
    <!-- Specular shines -->
    <circle cx="353" cy="197" r="2.3" fill="#FFFFFF" />
    <circle cx="359" cy="203" r="1.2" fill="#FFFFFF" opacity="0.85" />
  </g>
  <!-- Upper Eyeliner & Lashes -->
  <path d="M 371,198 Q 354,190 336,195 L 328,193" fill="none" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 330,193 Q 327,189 325,187" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 334,192 Q 333,188 331,186" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <!-- Lower eyelid -->
  <path d="M 368,201 Q 356,206 339,198" fill="none" stroke="#0F172A" stroke-width="1.4" opacity="0.75" stroke-linecap="round" />
  <!-- Eyelid crease -->
  <path d="M 366,186 Q 354,183 341,187" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />

  <!-- RIGHT EYE -->
  <g clip-path="url(#socketRight)">
    <rect x="393" y="185" width="45" height="25" fill="#F8FAFC" />
    <path d="M 397,198 Q 415,190 431,195 L 431,193 L 397,193 Z" fill="#CBD5E1" opacity="0.45" />
    <!-- Iris -->
    <ellipse cx="415" cy="200" rx="9.5" ry="9.5" fill="#1E3A8A" />
    <ellipse cx="415" cy="202" rx="7.8" ry="6" fill="#2563EB" />
    <ellipse cx="415" cy="204" rx="5.5" ry="3.2" fill="#38BDF8" />
    <!-- Pupil -->
    <circle cx="415" cy="200" r="3.8" fill="#09090B" />
    <!-- Specular shines -->
    <circle cx="412" cy="197" r="2.3" fill="#FFFFFF" />
    <circle cx="418" cy="203" r="1.2" fill="#FFFFFF" opacity="0.85" />
  </g>
  <!-- Upper Eyeliner & Lashes -->
  <path d="M 397,198 Q 415,190 431,195 L 438,193" fill="none" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 436,193 Q 439,189 441,187" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 432,192 Q 433,188 434,186" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <!-- Lower eyelid -->
  <path d="M 400,201 Q 415,206 427,198" fill="none" stroke="#0F172A" stroke-width="1.4" opacity="0.75" stroke-linecap="round" />
  <!-- Eyelid crease -->
  <path d="M 402,186 Q 415,183 426,187" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />
</svg>
`;

async function run() {
  await sharp('female_eyes_crop.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile('test_composite_eyes.png');
  console.log('Composite saved successfully!');
}

run();
