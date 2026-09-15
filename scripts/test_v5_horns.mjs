import sharp from 'sharp';

// Demonic Horns with organic gargoyle curve
const demonHornL = `
  <defs>
    <filter id="magmaGlow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#DC2626" flood-opacity="0.85" />
    </filter>
  </defs>
  <g filter="url(#magmaGlow)">
    <!-- Base swoops out then tip curves up/in -->
    <path d="M 334,124 C 316,118 288,98 276,70 C 270,52 274,32 284,24 C 286,30 286,46 298,66 C 314,90 336,112 348,124 Z" 
          fill="#18181B" stroke="#09090B" stroke-width="3.6" stroke-linejoin="round" />
    <!-- Glowing Magma Vein -->
    <path d="M 284,28 Q 278,54 286,76 Q 302,100 334,122" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 284,28 Q 278,54 286,76 Q 302,100 334,122" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="284" cy="24" r="2.2" fill="#FEF08A" />
  </g>
`;
const demonHornR = `
  <g filter="url(#magmaGlow)">
    <path d="M 434,124 C 452,118 480,98 492,70 C 498,52 494,32 484,24 C 482,30 482,46 470,66 C 454,90 432,112 420,124 Z" 
          fill="#18181B" stroke="#09090B" stroke-width="3.6" stroke-linejoin="round" />
    <path d="M 484,28 Q 490,54 482,76 Q 466,100 434,122" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 484,28 Q 490,54 482,76 Q 466,100 434,122" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
    <circle cx="484" cy="24" r="2.2" fill="#FEF08A" />
  </g>
`;

// Dragon Horns with curved anime silhouette
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
    <path d="M 334,122 C 314,118 284,106 256,86 C 235,70 220,52 216,40 C 222,40 242,54 274,72 C 306,90 338,106 348,120 Z" 
          fill="url(#dragonGoldL)" stroke="#451A03" stroke-width="3.6" stroke-linejoin="round" />
    <path d="M 230,48 Q 240,56 252,50" fill="none" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 250,64 Q 264,74 278,66" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
    <path d="M 274,80 Q 292,92 308,82" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 302,96 Q 322,108 336,96" fill="none" stroke="#78350F" stroke-width="3.4" stroke-linecap="round" />
    <path d="M 218,41 C 230,53 262,78 316,106" fill="none" stroke="#FFFBEB" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
    <circle cx="216" cy="40" r="2.8" fill="#FFFFFF" />
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
    <path d="M 434,122 C 454,118 484,106 512,86 C 533,70 548,52 552,40 C 546,40 526,54 494,72 C 462,90 430,106 420,120 Z" 
          fill="url(#dragonGoldR)" stroke="#451A03" stroke-width="3.6" stroke-linejoin="round" />
    <path d="M 538,48 Q 528,56 516,50" fill="none" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" />
    <path d="M 518,64 Q 504,74 490,66" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
    <path d="M 494,80 Q 476,92 460,82" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
    <path d="M 466,96 Q 446,108 432,96" fill="none" stroke="#78350F" stroke-width="3.4" stroke-linecap="round" />
    <path d="M 550,41 C 538,53 506,78 452,106" fill="none" stroke="#FFFBEB" stroke-width="2.5" stroke-linecap="round" opacity="0.95" />
    <circle cx="552" cy="40" r="2.8" fill="#FFFFFF" />
  </g>
`;

async function run() {
  const svgDemon = `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
    ${demonHornL}
    ${demonHornR}
  </svg>`;
  const compDemonM = await sharp('public/images/avatar/trainer_base_clean.png')
    .composite([{ input: Buffer.from(svgDemon) }])
    .png()
    .toBuffer();
  await sharp(compDemonM)
    .extract({ left: 200, top: 0, width: 368, height: 380 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_demon_horns_v5_male.png');

  const svgDragon = `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
    ${dragonHornL}
    ${dragonHornR}
  </svg>`;
  const compDragonM = await sharp('public/images/avatar/trainer_base_clean.png')
    .composite([{ input: Buffer.from(svgDragon) }])
    .png()
    .toBuffer();
  await sharp(compDragonM)
    .extract({ left: 200, top: 0, width: 368, height: 380 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_dragon_horns_v5_male.png');

  console.log('Saved v5 horns');
}
run();
