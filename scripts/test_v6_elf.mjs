import sharp from 'sharp';

// Precise Anatomical Elf Ears replacing human ear shape
function getTestElfSvg(skinHex = '#FDE2E4') {
  return `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <filter id="elfShadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="-1" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.25" />
      </filter>
    </defs>

    <!-- LEFT ELF EAR (Viewer's Left: points up-backwards from temple/ear canal) -->
    <g filter="url(#elfShadow)">
      <!-- Main Ear Body -->
      <path d="M 322,210 C 314,204 290,188 268,168 C 265,165 264,170 268,175 C 285,198 308,222 324,232 Z" 
            fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
      <!-- Inner Concha / Depth -->
      <path d="M 316,212 C 304,204 286,192 276,182 C 288,198 304,216 318,224 Z" fill="#9A3412" opacity="0.22" />
      <!-- Gold Ear Cuff Jewelry -->
      <path d="M 285,188 Q 288,195 282,201" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
      <circle cx="284" cy="194" r="2" fill="#FEF08A" />
      <polygon points="282,203 280,209 284,209" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
    </g>

    <!-- RIGHT ELF EAR (Viewer's Right: covers human ear, sweeping up-backwards) -->
    <g filter="url(#elfShadow)">
      <!-- Base ear covers helix and extends pointed tip up-outwards -->
      <path d="M 444,204 C 456,198 480,184 508,164 C 512,161 513,166 509,172 C 490,196 468,222 452,234 C 445,232 442,224 442,214 Z" 
            fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
      <!-- Concha Cartilage Shadow -->
      <path d="M 450,208 C 464,200 484,188 498,178 C 486,194 468,214 454,226 Z" fill="#9A3412" opacity="0.25" />
      <path d="M 448,206 C 460,202 478,192 492,184" fill="none" stroke="#9A3412" stroke-width="1.8" opacity="0.4" stroke-linecap="round" />
      
      <!-- Gold Ear Cuff Jewelry -->
      <path d="M 488,188 Q 485,195 491,201" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
      <circle cx="489" cy="194" r="2" fill="#FEF08A" />
      <polygon points="491,203 493,209 489,209" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
    </g>
  </svg>`;
}

async function run() {
  for (const g of ['female', 'male', 'neutral']) {
    const file = g === 'female' ? 'trainer_female_clean' : g === 'male' ? 'trainer_base_clean' : 'trainer_neutral_clean';
    const skinHex = g === 'female' ? '#FDE2E4' : '#FCE7DF';
    const svg = getTestElfSvg(skinHex);

    const comp = await sharp(`public/images/avatar/${file}.png`)
      .composite([{ input: Buffer.from(svg) }])
      .png()
      .toBuffer();

    await sharp(comp)
      .extract({ left: 200, top: 100, width: 368, height: 280 })
      .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_elf_v6_${g}.png`);
  }
  console.log('Saved v6 elf tests');
}
run();
