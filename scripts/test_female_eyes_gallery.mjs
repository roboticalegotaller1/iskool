import sharp from 'sharp';
import fs from 'fs';

// Generate SVGs for all eye styles with the calibrated anime proportions

function getEyesSvg(eyesStyle) {
  const left = { cx: 350, cy: 198, rx: 11.5, ry: 10.5 };
  const right = { cx: 416, cy: 198, rx: 11.5, ry: 10.5 };

  // Perfectly proportioned eye sockets
  const leftSocket = "M 370,198 C 366,190 358,186 350,186 C 340,186 333,190 328,194 C 333,202 341,206.5 350,206.5 C 359,206.5 366,203 370,198 Z";
  const rightSocket = "M 396,198 C 400,190 408,186 416,186 C 426,186 433,190 438,194 C 433,202 425,206.5 416,206.5 C 407,206.5 400,203 396,198 Z";

  const upperShadowLeft = `<path d="M 370,198 C 366,190 358,186 350,186 C 340,186 333,190 328,194 L 328,186 L 370,186 Z" fill="#64748B" opacity="0.32" />`;
  const upperShadowRight = `<path d="M 396,198 C 400,190 408,186 416,186 C 426,186 433,190 438,194 L 438,186 L 396,186 Z" fill="#64748B" opacity="0.32" />`;

  if (eyesStyle === 'cheerful') {
    return `
    <svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
      <!-- Cheerful blush -->
      <ellipse cx="342" cy="214" rx="12" ry="6" fill="#F43F5E" opacity="0.4" />
      <ellipse cx="424" cy="214" rx="12" ry="6" fill="#F43F5E" opacity="0.4" />
      <!-- Left curved smiling arch -->
      <path d="M 330,197 Q 350,187 370,197" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round" />
      <path d="M 328,195 Q 325,191 322,189" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
      <!-- Right curved smiling arch -->
      <path d="M 396,197 Q 416,187 436,197" fill="none" stroke="#0F172A" stroke-width="4" stroke-linecap="round" />
      <path d="M 438,195 Q 441,191 444,189" fill="none" stroke="#0F172A" stroke-width="2" stroke-linecap="round" />
    </svg>`;
  }

  // Iris color palette
  let darkCol = '#0A1128', midCol = '#1D4ED8', glowCol = '#38BDF8';
  let darkColR = '#0A1128', midColR = '#1D4ED8', glowColR = '#38BDF8';

  if (eyesStyle === 'heterochromia') {
    darkCol = '#451A03'; midCol = '#D97706'; glowCol = '#FDE047';
    darkColR = '#082F49'; midColR = '#0284C7'; glowColR = '#7DD3FC';
  } else if (eyesStyle === 'emerald') {
    darkCol = darkColR = '#064E3B'; midCol = midColR = '#059669'; glowCol = glowColR = '#6EE7B7';
  } else if (eyesStyle === 'ruby') {
    darkCol = darkColR = '#7F1D1D'; midCol = midColR = '#DC2626'; glowCol = glowColR = '#FCA5A5';
  } else if (eyesStyle === 'cat_eyes') {
    darkCol = darkColR = '#78350F'; midCol = midColR = '#D97706'; glowCol = glowColR = '#FEF08A';
  }

  const isCat = eyesStyle === 'cat_eyes';

  return `
  <svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="clipLeft">
        <path d="${leftSocket}" />
      </clipPath>
      <clipPath id="clipRight">
        <path d="${rightSocket}" />
      </clipPath>
      <linearGradient id="irisGradL" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${darkCol}" />
        <stop offset="50%" stop-color="${midCol}" />
        <stop offset="100%" stop-color="${glowCol}" />
      </linearGradient>
      <linearGradient id="irisGradR" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${darkColR}" />
        <stop offset="50%" stop-color="${midColR}" />
        <stop offset="100%" stop-color="${glowColR}" />
      </linearGradient>
    </defs>

    <!-- Left Eye -->
    <g clip-path="url(#clipLeft)">
      <rect x="${left.cx - 30}" y="${left.cy - 16}" width="60" height="34" fill="#F8FAFC" />
      ${upperShadowLeft}
      <!-- Iris with anime depth gradient -->
      <ellipse cx="${left.cx}" cy="${left.cy}" rx="${left.rx}" ry="${left.ry}" fill="url(#irisGradL)" />
      <!-- Pupil -->
      ${isCat ? `<ellipse cx="${left.cx}" cy="${left.cy}" rx="2.5" ry="${left.ry * 0.75}" fill="#09090B" />` : `<circle cx="${left.cx}" cy="${left.cy - 0.5}" r="4.2" fill="#09090B" />`}
      <!-- Lower glow rim -->
      <path d="M ${left.cx - 8},${left.cy + 5} Q ${left.cx},${left.cy + 9.5} ${left.cx + 8},${left.cy + 5}" fill="none" stroke="${glowCol}" stroke-width="2" opacity="0.85" stroke-linecap="round" />
      <!-- Specular Highlights -->
      <circle cx="${left.cx - 3.8}" cy="${left.cy - 3.5}" r="3" fill="#FFFFFF" />
      <circle cx="${left.cx + 4.2}" cy="${left.cy + 4}" r="1.6" fill="#FFFFFF" opacity="0.85" />
    </g>
    <!-- Upper Eyeliner & Tapered Wing Left -->
    <path d="M 370,198 C 365,189 358,185 350,185 C 340,185 333,189 328,193 L 325,190" fill="none" stroke="#0F172A" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Lower Eyelid Contour Left -->
    <path d="M 366,201 C 362,204.5 357,206 350,206 C 343,206 337,203.5 333,199" fill="none" stroke="#0F172A" stroke-width="1.6" opacity="0.8" stroke-linecap="round" />
    <!-- Double Eyelid Crease Left -->
    <path d="M 364,181 Q 351,178 338,182" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.3" stroke-linecap="round" />

    <!-- Right Eye -->
    <g clip-path="url(#clipRight)">
      <rect x="${right.cx - 30}" y="${right.cy - 16}" width="60" height="34" fill="#F8FAFC" />
      ${upperShadowRight}
      <!-- Iris with anime depth gradient -->
      <ellipse cx="${right.cx}" cy="${right.cy}" rx="${right.rx}" ry="${right.ry}" fill="url(#irisGradR)" />
      <!-- Pupil -->
      ${isCat ? `<ellipse cx="${right.cx}" cy="${right.cy}" rx="2.5" ry="${right.ry * 0.75}" fill="#09090B" />` : `<circle cx="${right.cx}" cy="${right.cy - 0.5}" r="4.2" fill="#09090B" />`}
      <!-- Lower glow rim -->
      <path d="M ${right.cx - 8},${right.cy + 5} Q ${right.cx},${right.cy + 9.5} ${right.cx + 8},${right.cy + 5}" fill="none" stroke="${glowColR}" stroke-width="2" opacity="0.85" stroke-linecap="round" />
      <!-- Specular Highlights -->
      <circle cx="${right.cx - 3.8}" cy="${right.cy - 3.5}" r="3" fill="#FFFFFF" />
      <circle cx="${right.cx + 4.2}" cy="${right.cy + 4}" r="1.6" fill="#FFFFFF" opacity="0.85" />
    </g>
    <!-- Upper Eyeliner & Tapered Wing Right -->
    <path d="M 396,198 C 401,189 408,185 416,185 C 426,185 433,189 438,193 L 441,190" fill="none" stroke="#0F172A" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round" />
    <!-- Lower Eyelid Contour Right -->
    <path d="M 400,201 C 404,204.5 409,206 416,206 C 423,206 429,203.5 433,199" fill="none" stroke="#0F172A" stroke-width="1.6" opacity="0.8" stroke-linecap="round" />
    <!-- Double Eyelid Crease Right -->
    <path d="M 402,181 Q 415,178 428,182" fill="none" stroke="#9A3412" stroke-width="1.2" opacity="0.3" stroke-linecap="round" />
  </svg>`;
}

async function generateGallery() {
  const styles = ['determined', 'cheerful', 'heterochromia', 'emerald', 'cat_eyes'];
  
  for (const style of styles) {
    const svgStr = getEyesSvg(style);
    const composited = await sharp('public/images/avatar/trainer_female_clean.png')
      .composite([{ input: Buffer.from(svgStr) }])
      .png()
      .toBuffer();

    await sharp(composited)
      .extract({ left: 300, top: 165, width: 160, height: 80 })
      .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/preview_style_${style}.png`);

    console.log(`Saved preview_style_${style}.png`);
  }
}

generateGallery();
