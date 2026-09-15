import sharp from 'sharp';

// High-fidelity Anime Cel-Shaded Dragon Horns
const dragonHornL = `
  <defs>
    <linearGradient id="dragonGoldL" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#78350F" />
      <stop offset="25%" stop-color="#B45309" />
      <stop offset="60%" stop-color="#F59E0B" />
      <stop offset="90%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
    <filter id="dragonAura" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#F59E0B" flood-opacity="0.65" />
    </filter>
  </defs>

  <g filter="url(#dragonAura)">
    <!-- Main Sweeping Horn Body: swoops out from temple, curves back and up -->
    <path d="M 334,124 C 314,122 284,115 258,98 C 235,82 220,64 218,52 C 224,52 245,66 276,82 C 308,98 338,110 348,122 Z" 
          fill="url(#dragonGoldL)" stroke="#451A03" stroke-width="3.6" stroke-linejoin="round" />
    <!-- Segmented scale plates -->
    <path d="M 232,58 Q 242,66 254,60" fill="none" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 252,74 Q 266,84 280,76" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
    <path d="M 276,90 Q 294,102 310,92" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 304,106 Q 324,118 338,106" fill="none" stroke="#78350F" stroke-width="3.4" stroke-linecap="round" />
    <!-- Glowing Celestial Ridge -->
    <path d="M 220,53 C 232,65 264,88 316,112" fill="none" stroke="#FFFBEB" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
    <circle cx="218" cy="52" r="2.8" fill="#FFFFFF" />
  </g>
`;

const dragonHornR = `
  <defs>
    <linearGradient id="dragonGoldR" x1="1" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#78350F" />
      <stop offset="25%" stop-color="#B45309" />
      <stop offset="60%" stop-color="#F59E0B" />
      <stop offset="90%" stop-color="#FDE047" />
      <stop offset="100%" stop-color="#FFFFFF" />
    </linearGradient>
  </defs>

  <g filter="url(#dragonAura)">
    <path d="M 434,124 C 454,122 484,115 510,98 C 533,82 548,64 550,52 C 544,52 523,66 492,82 C 460,98 430,110 420,122 Z" 
          fill="url(#dragonGoldR)" stroke="#451A03" stroke-width="3.6" stroke-linejoin="round" />
    <path d="M 536,58 Q 526,66 514,60" fill="none" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 516,74 Q 502,84 488,76" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
    <path d="M 492,90 Q 474,102 458,92" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 464,106 Q 444,118 430,106" fill="none" stroke="#78350F" stroke-width="3.4" stroke-linecap="round" />
    <path d="M 548,53 C 536,65 504,88 452,112" fill="none" stroke="#FFFBEB" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
    <circle cx="550" cy="52" r="2.8" fill="#FFFFFF" />
  </g>
`;

// Demon Horns (Volcanic basalt with glowing magma veins)
const demonHornL = `
  <defs>
    <filter id="magmaGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#DC2626" flood-opacity="0.85" />
    </filter>
  </defs>
  <g filter="url(#magmaGlow)">
    <path d="M 334,124 C 322,110 312,86 310,60 C 308,40 314,24 320,20 C 324,26 328,52 338,82 C 344,102 348,116 350,124 Z" 
          fill="#18181B" stroke="#09090B" stroke-width="3.6" stroke-linejoin="round" />
    <path d="M 314,35 Q 318,60 324,84 Q 332,104 338,120" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 314,35 Q 318,60 324,84 Q 332,104 338,120" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="320" cy="20" r="2.4" fill="#FEF08A" />
  </g>
`;
const demonHornR = `
  <g filter="url(#magmaGlow)">
    <path d="M 434,124 C 446,110 456,86 458,60 C 460,40 454,24 448,20 C 444,26 440,52 430,82 C 424,102 420,116 418,124 Z" 
          fill="#18181B" stroke="#09090B" stroke-width="3.6" stroke-linejoin="round" />
    <path d="M 454,35 Q 450,60 444,84 Q 436,104 430,120" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 454,35 Q 450,60 444,84 Q 436,104 430,120" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="448" cy="20" r="2.4" fill="#FEF08A" />
  </g>
`;

const svgDragon = `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
  ${dragonHornL}
  ${dragonHornR}
</svg>`;

const svgDemon = `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
  ${demonHornL}
  ${demonHornR}
</svg>`;

async function testHorns() {
  // Dragon horns on male
  const compDragonM = await sharp('public/images/avatar/trainer_base_clean.png')
    .composite([{ input: Buffer.from(svgDragon) }])
    .png()
    .toBuffer();
  await sharp(compDragonM)
    .extract({ left: 200, top: 0, width: 368, height: 380 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_dragon_horns_v4_male.png');

  // Demon horns on male
  const compDemonM = await sharp('public/images/avatar/trainer_base_clean.png')
    .composite([{ input: Buffer.from(svgDemon) }])
    .png()
    .toBuffer();
  await sharp(compDemonM)
    .extract({ left: 200, top: 0, width: 368, height: 380 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_demon_horns_v4_male.png');

  console.log('Saved v4 horns');
}
testHorns();
