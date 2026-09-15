import sharp from 'sharp';

async function run() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="170" height="90" viewBox="300 160 170 90">
    <defs>
      <clipPath id="socketL">
        <path d="M 373,199 C 368,191 361,187 352,187 C 343,187 335,191 328,193 C 334,201 343,206 353,206 C 362,206 369,203 373,199 Z" />
      </clipPath>
      <clipPath id="socketR">
        <path d="M 395,199 C 400,191 407,187 416,187 C 425,187 433,191 440,193 C 434,201 425,206 415,206 C 406,206 399,203 395,199 Z" />
      </clipPath>
    </defs>

    <!-- LEFT EYE -->
    <g clip-path="url(#socketL)">
      <rect x="325" y="180" width="55" height="32" fill="#F8FAFC" />
      <path d="M 373,199 C 368,191 361,187 352,187 C 343,187 335,191 328,193 L 328,187 L 373,187 Z" fill="#94A3B8" opacity="0.38" />
      <ellipse cx="353" cy="198" rx="10.5" ry="10" fill="#1E3A8A" />
      <ellipse cx="353" cy="200" rx="8.5" ry="6.5" fill="#2563EB" />
      <ellipse cx="353" cy="202" rx="6.5" ry="3.5" fill="#38BDF8" />
      <circle cx="353" cy="198" r="4" fill="#09090B" />
      <circle cx="349.5" cy="194.5" r="2.8" fill="#FFFFFF" />
      <circle cx="357.5" cy="202" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </g>
    <path d="M 373,199 C 368,191 361,187 352,187 C 342,187 334,191 326,192" fill="none" stroke="#0F172A" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 329,192 Q 326,188 323,186" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
    <path d="M 334,190 Q 332,186 330,184" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 370,201 C 365,205 359,206 353,206 C 346,206 339,203 333,198" fill="none" stroke="#0F172A" stroke-width="1.5" opacity="0.8" stroke-linecap="round" />
    <path d="M 368,183 Q 354,180 338,184" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />

    <!-- RIGHT EYE -->
    <g clip-path="url(#socketR)">
      <rect x="390" y="180" width="55" height="32" fill="#F8FAFC" />
      <path d="M 395,199 C 400,191 407,187 416,187 C 425,187 433,191 440,193 L 440,187 L 395,187 Z" fill="#94A3B8" opacity="0.38" />
      <ellipse cx="415" cy="198" rx="10.5" ry="10" fill="#1E3A8A" />
      <ellipse cx="415" cy="200" rx="8.5" ry="6.5" fill="#2563EB" />
      <ellipse cx="415" cy="202" rx="6.5" ry="3.5" fill="#38BDF8" />
      <circle cx="415" cy="198" r="4" fill="#09090B" />
      <circle cx="411.5" cy="194.5" r="2.8" fill="#FFFFFF" />
      <circle cx="419.5" cy="202" r="1.5" fill="#FFFFFF" opacity="0.9" />
    </g>
    <path d="M 395,199 C 400,191 407,187 416,187 C 426,187 434,191 442,192" fill="none" stroke="#0F172A" stroke-width="3.8" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M 439,192 Q 442,188 445,186" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
    <path d="M 434,190 Q 436,186 438,184" fill="none" stroke="#0F172A" stroke-width="1.8" stroke-linecap="round" />
    <path d="M 398,201 C 403,205 409,206 415,206 C 422,206 429,203 435,198" fill="none" stroke="#0F172A" stroke-width="1.5" opacity="0.8" stroke-linecap="round" />
    <path d="M 400,183 Q 414,180 430,184" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.35" stroke-linecap="round" />
  </svg>`;

  await sharp('rebuilt_bob_face.png')
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .toFile('test_bob_with_perfect_eyes.png');

  console.log('Saved test_bob_with_perfect_eyes.png');
}

run();
