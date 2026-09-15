import sharp from 'sharp';

const catEarL = `
  <path d="M 305,108 C 298,92 288,72 278,54 C 274,48 274,44 280,44 C 292,50 318,68 340,90 C 352,102 358,114 360,118 C 352,121 340,121 328,120 C 316,118 308,114 305,108 Z" 
        fill="#382218" stroke="#0F172A" stroke-width="3.8" stroke-linejoin="round" />
  <path d="M 280,44 C 286,58 296,80 304,98 C 300,105 296,112 296,114 C 288,96 280,68 280,44 Z" 
        fill="#000000" opacity="0.35" />
  <path d="M 292,76 C 286,58 285,48 288,46 C 298,54 318,74 334,92 C 344,104 346,112 346,114 C 336,116 314,108 292,76 Z" 
        fill="#FB7185" stroke="#9F1239" stroke-width="1.8" />
  <path d="M 290,110 C 298,102 308,92 312,80 C 315,88 320,95 326,98 C 330,88 334,80 336,70 C 338,80 342,88 348,96 C 342,106 330,114 316,116 C 304,116 294,114 290,110 Z" 
        fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round" />
`;

const catEarR = `
  <path d="M 463,108 C 470,92 480,72 490,54 C 494,48 494,44 488,44 C 476,50 450,68 428,90 C 416,102 410,114 408,118 C 416,121 428,121 440,120 C 452,118 460,114 463,108 Z" 
        fill="#382218" stroke="#0F172A" stroke-width="3.8" stroke-linejoin="round" />
  <path d="M 488,44 C 482,58 472,80 464,98 C 468,105 472,112 472,114 C 480,96 488,68 488,44 Z" 
        fill="#000000" opacity="0.35" />
  <path d="M 476,76 C 482,58 483,48 480,46 C 470,54 450,74 434,92 C 424,104 422,112 422,114 C 432,116 454,108 476,76 Z" 
        fill="#FB7185" stroke="#9F1239" stroke-width="1.8" />
  <path d="M 478,110 C 470,102 460,92 456,80 C 453,88 448,95 442,98 C 438,88 434,80 432,70 C 430,80 426,88 420,96 C 426,106 438,114 452,116 C 464,116 474,114 478,110 Z" 
        fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round" />
`;

const svg = `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
  <g id="race_cat_ears_v3">
    ${catEarL}
    ${catEarR}
  </g>
</svg>`;

async function test() {
  const composited = await sharp('public/images/avatar/trainer_base_clean.png')
    .composite([{ input: Buffer.from(svg) }])
    .png()
    .toBuffer();
  await sharp(composited)
    .extract({ left: 200, top: 0, width: 368, height: 380 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_cat_ears_v3_male.png');

  const compositedF = await sharp('public/images/avatar/trainer_female_clean.png')
    .composite([{ input: Buffer.from(svg.replaceAll('#382218', '#3D2820')) }])
    .png()
    .toBuffer();
  await sharp(compositedF)
    .extract({ left: 200, top: 0, width: 368, height: 380 })
    .toFile('C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/test_cat_ears_v3_female.png');
  console.log('Saved v3 cat ears');
}
test();
