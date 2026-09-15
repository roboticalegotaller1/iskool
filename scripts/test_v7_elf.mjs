import sharp from 'sharp';

function getCalibratedElfSvg(skinHex = '#FCE7DF') {
  return `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="elfShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="-1" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- LEFT ELF EAR (Seamlessly covers and replaces native left ear) -->
    <g filter="url(#elfShadow)">
      <path d="M 328,192 C 314,184 285,168 250,150 C 246,148 245,153 249,158 C 270,185 304,218 322,238 C 326,240 330,234 330,224 C 330,214 329,202 328,192 Z" 
            fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
      <!-- Inner Concha / Cartilage Depth Shadow -->
      <path d="M 324,196 C 310,190 286,176 264,164 C 280,182 304,206 320,226 Z" fill="#9A3412" opacity="0.25" />
      <path d="M 326,194 C 314,188 296,178 278,170" fill="none" stroke="#9A3412" stroke-width="1.8" opacity="0.4" stroke-linecap="round" />
      <!-- Golden Aristocratic Ear-Cuff Jewelry -->
      <path d="M 284,174 Q 286,182 280,188" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
      <circle cx="283" cy="181" r="2" fill="#FEF08A" />
      <polygon points="280,190 278,197 282,197" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
    </g>

    <!-- RIGHT ELF EAR (Seamlessly covers and replaces native right ear) -->
    <g filter="url(#elfShadow)">
      <path d="M 440,192 C 454,184 483,168 518,150 C 522,148 523,153 519,158 C 498,185 464,218 446,238 C 442,240 438,234 438,224 C 438,214 439,202 440,192 Z" 
            fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
      <!-- Inner Concha / Cartilage Depth Shadow -->
      <path d="M 444,196 C 458,190 482,176 504,164 C 488,182 464,206 448,226 Z" fill="#9A3412" opacity="0.25" />
      <path d="M 442,194 C 454,188 472,178 490,170" fill="none" stroke="#9A3412" stroke-width="1.8" opacity="0.4" stroke-linecap="round" />
      <!-- Golden Aristocratic Ear-Cuff Jewelry -->
      <path d="M 484,174 Q 482,182 488,188" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
      <circle cx="485" cy="181" r="2" fill="#FEF08A" />
      <polygon points="488,190 490,197 486,197" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
    </g>
  </svg>`;
}

async function run() {
  for (const g of ['male', 'female', 'neutral']) {
    const file = g === 'female' ? 'trainer_female_clean' : g === 'male' ? 'trainer_base_clean' : 'trainer_neutral_clean';
    const skinHex = g === 'female' ? '#FDE2E4' : '#FCE7DF';
    const svg = getCalibratedElfSvg(skinHex);

    const comp = await sharp(`public/images/avatar/${file}.png`)
      .composite([{ input: Buffer.from(svg) }])
      .png()
      .toBuffer();

    await sharp(comp)
      .extract({ left: 200, top: 100, width: 368, height: 280 })
      .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_elf_v7_${g}.png`);
  }
  console.log('Saved v7 elf tests');
}
run();
