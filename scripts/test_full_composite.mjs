import sharp from 'sharp';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="768" height="1376" viewBox="0 0 768 1376">
  <defs>
    <!-- Left and right eye socket clip paths for female avatar -->
    <clipPath id="eyeSocketLeft">
      <path d="M 335,195 Q 354,190 371,198 Q 355,206 335,195 Z" />
    </clipPath>
    <clipPath id="eyeSocketRight">
      <path d="M 397,198 Q 414,190 432,195 Q 414,206 397,198 Z" />
    </clipPath>
  </defs>

  <!-- Skin patch covering underlying eyes -->
  <path d="M 332,194 Q 354,188 373,197 Q 355,208 332,194 Z" fill="#F4BF9F" />
  <path d="M 395,197 Q 414,188 435,194 Q 414,208 395,197 Z" fill="#F4BF9F" />

  <!-- LEFT EYE -->
  <g clip-path="url(#eyeSocketLeft)">
    <rect x="330" y="185" width="45" height="25" fill="#F8FAFC" />
    <!-- Sclera soft inner shadow -->
    <path d="M 335,195 Q 354,190 371,198 L 371,193 L 335,193 Z" fill="#CBD5E1" opacity="0.45" />
    <!-- Iris -->
    <ellipse cx="355" cy="200" rx="9.5" ry="9.5" fill="#1E3A8A" />
    <ellipse cx="355" cy="202" rx="7.8" ry="6" fill="#2563EB" />
    <ellipse cx="355" cy="204" rx="5.5" ry="3.2" fill="#38BDF8" />
    <!-- Pupil -->
    <circle cx="355" cy="200" r="3.8" fill="#09090B" />
    <!-- Specular shines -->
    <circle cx="352" cy="197" r="2.3" fill="#FFFFFF" />
    <circle cx="358" cy="203" r="1.2" fill="#FFFFFF" opacity="0.85" />
  </g>
  <!-- Upper Eyeliner & Lashes -->
  <path d="M 371,198 Q 354,190 335,195 L 328,193" fill="none" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 330,193 Q 327,189 325,187" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 334,192 Q 333,188 331,186" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <!-- Lower eyelid -->
  <path d="M 368,201 Q 355,206 339,198" fill="none" stroke="#0F172A" stroke-width="1.4" opacity="0.75" stroke-linecap="round" />
  <!-- Eyelid crease -->
  <path d="M 366,186 Q 354,183 341,187" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />

  <!-- RIGHT EYE -->
  <g clip-path="url(#eyeSocketRight)">
    <rect x="393" y="185" width="45" height="25" fill="#F8FAFC" />
    <path d="M 397,198 Q 414,190 432,195 L 432,193 L 397,193 Z" fill="#CBD5E1" opacity="0.45" />
    <!-- Iris -->
    <ellipse cx="414" cy="200" rx="9.5" ry="9.5" fill="#1E3A8A" />
    <ellipse cx="414" cy="202" rx="7.8" ry="6" fill="#2563EB" />
    <ellipse cx="414" cy="204" rx="5.5" ry="3.2" fill="#38BDF8" />
    <!-- Pupil -->
    <circle cx="414" cy="200" r="3.8" fill="#09090B" />
    <!-- Specular shines -->
    <circle cx="411" cy="197" r="2.3" fill="#FFFFFF" />
    <circle cx="417" cy="203" r="1.2" fill="#FFFFFF" opacity="0.85" />
  </g>
  <!-- Upper Eyeliner & Lashes -->
  <path d="M 397,198 Q 414,190 432,195 L 438,193" fill="none" stroke="#0F172A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M 436,193 Q 439,189 441,187" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <path d="M 432,192 Q 433,188 434,186" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
  <!-- Lower eyelid -->
  <path d="M 400,201 Q 414,206 427,198" fill="none" stroke="#0F172A" stroke-width="1.4" opacity="0.75" stroke-linecap="round" />
  <!-- Eyelid crease -->
  <path d="M 402,186 Q 414,183 426,187" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />
</svg>
`;

async function testFull() {
  await sharp('public/images/avatar/trainer_female_clean.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .extract({ left: 320, top: 175, width: 130, height: 55 })
    .toFile('test_full_composite_crop.png');
  console.log('Full composite crop saved!');
}

testFull();
