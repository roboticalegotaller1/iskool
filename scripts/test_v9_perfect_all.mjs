import sharp from 'sharp';
import fs from 'fs';

export function getPolishedRaceFeatures(featureId, gender = 'male', hairHex = '#382218', skinHex = '#FCE7DF') {
  let frontSvg = '';
  let backSvg = '';

  const isFemale = gender === 'female';
  const isNeutral = gender === 'neutral';

  switch (featureId) {
    case 'cat_ears': // Orejas de Gato / Kitsune
      frontSvg = `
      <g id="race_cat_ears">
        <defs>
          <linearGradient id="catInnerPinkL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E11D48" />
            <stop offset="50%" stop-color="#FB7185" />
            <stop offset="100%" stop-color="#FECDD3" />
          </linearGradient>
          <linearGradient id="catInnerPinkR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#E11D48" />
            <stop offset="50%" stop-color="#FB7185" />
            <stop offset="100%" stop-color="#FECDD3" />
          </linearGradient>
          <filter id="catEarShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#090D1A" flood-opacity="0.38" />
          </filter>
        </defs>

        <!-- LEFT CAT EAR -->
        <g filter="url(#catEarShadow)">
          <path d="M 305,108 C 298,92 288,72 278,54 C 274,48 274,44 280,44 C 292,50 318,68 340,90 C 352,102 358,114 360,118 C 352,121 340,121 328,120 C 316,118 308,114 305,108 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 280,44 C 286,58 296,80 304,98 C 300,105 296,112 296,114 C 288,96 280,68 280,44 Z" 
                fill="#000000" opacity="0.32" />
          <path d="M 292,76 C 286,58 285,48 288,46 C 298,54 318,74 334,92 C 344,104 346,112 346,114 C 336,116 314,108 292,76 Z" 
                fill="url(#catInnerPinkL)" stroke="#9F1239" stroke-width="1.8" />
          <path d="M 290,110 C 298,102 308,92 312,80 C 315,88 320,95 326,98 C 330,88 334,80 336,70 C 338,80 342,88 348,96 C 342,106 330,114 316,116 C 304,116 294,114 290,110 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M 298,105 C 306,97 312,89 313,83 C 316,91 322,95 325,97" 
                fill="none" stroke="#FFE4E6" stroke-width="2.2" stroke-linecap="round" />
        </g>

        <!-- RIGHT CAT EAR -->
        <g filter="url(#catEarShadow)">
          <path d="M 463,108 C 470,92 480,72 490,54 C 494,48 494,44 488,44 C 476,50 450,68 428,90 C 416,102 410,114 408,118 C 416,121 428,121 440,120 C 452,118 460,114 463,108 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 488,44 C 482,58 472,80 464,98 C 468,105 472,112 472,114 C 480,96 488,68 488,44 Z" 
                fill="#000000" opacity="0.32" />
          <path d="M 476,76 C 482,58 483,48 480,46 C 470,54 450,74 434,92 C 424,104 422,112 422,114 C 432,116 454,108 476,76 Z" 
                fill="url(#catInnerPinkR)" stroke="#9F1239" stroke-width="1.8" />
          <path d="M 478,110 C 470,102 460,92 456,80 C 453,88 448,95 442,98 C 438,88 434,80 432,70 C 430,80 426,88 420,96 C 426,106 438,114 452,116 C 464,116 474,114 478,110 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round" />
          <path d="M 470,105 C 462,97 456,89 455,83 C 452,91 446,95 443,97" 
                fill="none" stroke="#FFE4E6" stroke-width="2.2" stroke-linecap="round" />
        </g>
      </g>`;
      break;

    case 'wolf_ears': // Lobo de las Tormentas (Wide, jagged anime wolf ears)
      frontSvg = `
      <g id="race_wolf_ears">
        <defs>
          <linearGradient id="wolfSlateL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="45%" stop-color="#334155" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="wolfSlateR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="45%" stop-color="#334155" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <filter id="wolfShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#090D1A" flood-opacity="0.45" />
          </filter>
        </defs>

        <!-- LEFT WOLF EAR (Jagged slate fluff) -->
        <g filter="url(#wolfShadow)">
          <path d="M 308,112 C 298,96 284,72 272,48 C 268,40 268,36 274,36 C 286,42 308,60 334,84 C 348,98 356,112 358,118 C 348,122 330,122 308,112 Z" 
                fill="url(#wolfSlateL)" stroke="#090D1A" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 274,36 C 280,44 290,60 298,72 C 290,66 282,52 274,36 Z" fill="#020617" />
          <path d="M 284,68 C 280,54 282,46 284,44 C 292,52 306,70 320,88 C 328,98 332,108 332,112 C 322,114 304,104 284,68 Z" 
                fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          <path d="M 284,108 C 294,100 306,86 310,74 C 314,84 320,92 326,96 C 330,86 334,78 338,68 C 340,78 342,88 344,96 C 336,108 324,116 310,118 C 298,118 288,114 284,108 Z" 
                fill="#F8FAFC" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <!-- Silver Hoops -->
          <ellipse cx="274" cy="46" rx="3.5" ry="6" fill="none" stroke="#E2E8F0" stroke-width="2.6" transform="rotate(-30 274 46)" />
          <ellipse cx="279" cy="62" rx="3" ry="5" fill="none" stroke="#E2E8F0" stroke-width="2.2" transform="rotate(-30 279 62)" />
        </g>

        <!-- RIGHT WOLF EAR -->
        <g filter="url(#wolfShadow)">
          <path d="M 460,112 C 470,96 484,72 496,48 C 500,40 500,36 494,36 C 482,42 460,60 434,84 C 420,98 412,112 410,118 C 420,122 438,122 460,112 Z" 
                fill="url(#wolfSlateR)" stroke="#090D1A" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 494,36 C 488,44 478,60 470,72 C 478,66 486,52 494,36 Z" fill="#020617" />
          <path d="M 484,68 C 488,54 486,46 484,44 C 476,52 462,70 448,88 C 440,98 436,108 436,112 C 446,114 464,104 484,68 Z" 
                fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          <path d="M 484,108 C 474,100 462,86 458,74 C 454,84 448,92 442,96 C 438,86 434,78 430,68 C 428,78 426,88 424,96 C 432,108 444,116 458,118 C 470,118 480,114 484,108 Z" 
                fill="#F8FAFC" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
        </g>
      </g>`;
      break;

    case 'bunny_ears': // Orejitas de Conejo Lunar (Plush volumetric ears tapering into hair)
      frontSvg = `
      <g id="race_bunny_ears">
        <defs>
          <filter id="bunnyShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0F172A" flood-opacity="0.32" />
          </filter>
          <linearGradient id="bunnyPinkCore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F472B6" />
            <stop offset="65%" stop-color="#FBCFE8" />
            <stop offset="100%" stop-color="#FFF1F2" />
          </linearGradient>
        </defs>

        <!-- LEFT BUNNY EAR -->
        <g filter="url(#bunnyShadow)">
          <path d="M 330,118 C 322,92 312,50 308,18 C 305,-4 318,-16 332,-14 C 348,-12 358,12 360,50 C 362,88 356,110 348,118 C 340,122 334,122 330,118 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 308,18 C 305,-4 318,-16 332,-14 C 324,-8 320,4 322,28 C 326,68 333,100 340,116 C 334,114 326,92 308,18 Z" 
                fill="#E2E8F0" opacity="0.65" />
          <path d="M 330,102 C 326,78 320,42 318,15 C 316,2 322,-5 328,-4 C 336,-2 342,12 344,38 C 346,68 344,92 338,105 C 334,107 332,105 330,102 Z" 
                fill="url(#bunnyPinkCore)" stroke="#F472B6" stroke-width="1.4" />
        </g>

        <!-- RIGHT BUNNY EAR (Charming drooping folded tip) -->
        <g filter="url(#bunnyShadow)">
          <path d="M 420,118 C 424,102 430,70 438,36 C 444,14 458,4 470,10 C 478,16 472,36 458,54 C 454,80 448,104 438,120 C 430,122 425,121 420,118 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 430,110 C 432,90 438,65 444,42 C 447,28 454,22 460,25 C 463,30 458,44 450,56 C 445,80 440,100 436,110 Z" 
                fill="url(#bunnyPinkCore)" stroke="#F472B6" stroke-width="1.4" />
          <!-- Drooping Tip -->
          <path d="M 458,4 C 470,10 480,18 474,40 C 464,30 454,26 444,30 C 450,16 454,8 458,4 Z" 
                fill="#F1F5F9" stroke="#0F172A" stroke-width="2.6" stroke-linejoin="round" />
        </g>
      </g>`;
      break;

    case 'dragon_horns': // Cuernos de Dragón Dorado (Curving back over skull)
      frontSvg = `
      <g id="race_dragon_horns">
        <defs>
          <linearGradient id="dragonGoldL" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="25%" stop-color="#B45309" />
            <stop offset="60%" stop-color="#F59E0B" />
            <stop offset="90%" stop-color="#FDE047" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>
          <linearGradient id="dragonGoldR" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="25%" stop-color="#B45309" />
            <stop offset="60%" stop-color="#F59E0B" />
            <stop offset="90%" stop-color="#FDE047" />
            <stop offset="100%" stop-color="#FFFFFF" />
          </linearGradient>
          <filter id="dragonAura" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#F59E0B" flood-opacity="0.65" />
          </filter>
        </defs>

        <!-- LEFT DRAGON HORN -->
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

        <!-- RIGHT DRAGON HORN -->
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
      </g>`;
      break;

    case 'demon_horns': // Cuernitos de Gárgola
      frontSvg = `
      <g id="race_demon_horns">
        <defs>
          <filter id="magmaGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#DC2626" flood-opacity="0.85" />
          </filter>
        </defs>
        <g filter="url(#magmaGlow)">
          <path d="M 334,124 C 316,118 288,98 276,70 C 270,52 274,32 284,24 C 286,30 286,46 298,66 C 314,90 336,112 348,124 Z" 
                fill="#18181B" stroke="#09090B" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 284,28 Q 278,54 286,76 Q 302,100 334,122" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 284,28 Q 278,54 286,76 Q 302,100 334,122" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
          <circle cx="284" cy="24" r="2.2" fill="#FEF08A" />
        </g>
        <g filter="url(#magmaGlow)">
          <path d="M 434,124 C 452,118 480,98 492,70 C 498,52 494,32 484,24 C 482,30 482,46 470,66 C 454,90 432,112 420,124 Z" 
                fill="#18181B" stroke="#09090B" stroke-width="3.6" stroke-linejoin="round" />
          <path d="M 484,28 Q 490,54 482,76 Q 466,100 434,122" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 484,28 Q 490,54 482,76 Q 466,100 434,122" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
          <circle cx="484" cy="24" r="2.2" fill="#FEF08A" />
        </g>
      </g>`;
      break;

    case 'stag_antlers': // Astas de Ciervo Silvestre
      frontSvg = `
      <g id="race_stag_antlers">
        <defs>
          <filter id="natureAura" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#16A34A" flood-opacity="0.4" />
          </filter>
        </defs>
        <g filter="url(#natureAura)">
          <path d="M 336,118 C 330,98 316,72 292,48 C 274,30 252,18 244,15 C 248,22 266,42 280,66 C 294,90 302,108 308,122 Z" 
                fill="#78350F" stroke="#451A03" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 280,62 C 274,46 264,30 252,22 C 255,30 266,48 272,66 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <path d="M 318,92 C 304,82 286,80 274,82 C 284,88 302,92 312,100 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <circle cx="244" cy="15" r="4" fill="#86EFAC" stroke="#15803D" stroke-width="1.2" />
          <circle cx="252" cy="22" r="3" fill="#BBF7D0" />
          <path d="M 274,54 Q 266,52 264,46 Q 272,46 276,52 Z" fill="#22C55E" />
          <path d="M 288,78 Q 282,74 278,68 Q 286,70 290,76 Z" fill="#22C55E" />
        </g>
        <g filter="url(#natureAura)">
          <path d="M 432,118 C 438,98 452,72 476,48 C 494,30 516,18 524,15 C 520,22 502,42 488,66 C 474,90 466,108 460,122 Z" 
                fill="#78350F" stroke="#451A03" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 488,62 C 494,46 504,30 516,22 C 513,30 502,48 496,66 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <path d="M 450,92 C 464,82 482,80 494,82 C 484,88 466,92 456,100 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <circle cx="524" cy="15" r="4" fill="#86EFAC" stroke="#15803D" stroke-width="1.2" />
          <circle cx="516" cy="22" r="3" fill="#BBF7D0" />
          <path d="M 494,54 Q 502,52 504,46 Q 496,46 492,52 Z" fill="#22C55E" />
          <path d="M 480,78 Q 486,74 490,68 Q 482,70 478,76 Z" fill="#22C55E" />
        </g>
      </g>`;
      break;

    case 'elf_long': // Elfo Boreal (Largas)
      frontSvg = `
      <g id="race_elf_long">
        <defs>
          <filter id="elfShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-1" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.25" />
          </filter>
        </defs>
        <!-- LEFT ELF EAR -->
        <g filter="url(#elfShadow)">
          <path d="M 328,192 C 314,184 285,168 250,150 C 246,148 245,153 249,158 C 270,185 304,218 322,238 C 326,240 330,234 330,224 C 330,214 329,202 328,192 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 324,196 C 310,190 286,176 264,164 C 280,182 304,206 320,226 Z" fill="#9A3412" opacity="0.25" />
          <path d="M 326,194 C 314,188 296,178 278,170" fill="none" stroke="#9A3412" stroke-width="1.8" opacity="0.4" stroke-linecap="round" />
          <path d="M 284,174 Q 286,182 280,188" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="283" cy="181" r="2" fill="#FEF08A" />
          <polygon points="280,190 278,197 282,197" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
        </g>
        <!-- RIGHT ELF EAR -->
        <g filter="url(#elfShadow)">
          <path d="M 440,192 C 454,184 483,168 518,150 C 522,148 523,153 519,158 C 498,185 464,218 446,238 C 442,240 438,234 438,224 C 438,214 439,202 440,192 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 444,196 C 458,190 482,176 504,164 C 488,182 464,206 448,226 Z" fill="#9A3412" opacity="0.25" />
          <path d="M 442,194 C 454,188 472,178 490,170" fill="none" stroke="#9A3412" stroke-width="1.8" opacity="0.4" stroke-linecap="round" />
          <path d="M 484,174 Q 482,182 488,188" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="485" cy="181" r="2" fill="#FEF08A" />
          <polygon points="488,190 490,197 486,197" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
        </g>
      </g>`;
      break;

    case 'elf_short': // Elfo Ágil (Cortas)
      frontSvg = `
      <g id="race_elf_short">
        <defs>
          <filter id="elfShortShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="-1" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.25" />
          </filter>
        </defs>
        <!-- LEFT SHORT ELF EAR -->
        <g filter="url(#elfShortShadow)">
          <path d="M 328,194 C 316,188 290,178 268,166 C 265,164 264,169 268,174 C 284,194 308,218 324,232 C 328,234 330,228 330,220 C 330,212 329,202 328,194 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 322,198 C 310,192 292,182 278,174 C 290,188 308,206 320,222 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="282" cy="186" r="2.2" fill="#FACC15" stroke="#713F12" stroke-width="0.8" />
        </g>
        <!-- RIGHT SHORT ELF EAR -->
        <g filter="url(#elfShortShadow)">
          <path d="M 440,194 C 452,188 478,178 500,166 C 503,164 504,169 500,174 C 484,194 460,218 444,232 C 440,234 438,228 438,220 C 438,212 439,202 440,194 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 446,198 C 458,192 476,182 490,174 C 478,188 460,206 448,222 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="486" cy="186" r="2.2" fill="#FACC15" stroke="#713F12" stroke-width="0.8" />
        </g>
      </g>`;
      break;

    case 'merfolk_fins': // Aletas Acuáticas de Sirena (Fan dorsal fins angled up-backwards)
      frontSvg = `
      <g id="race_merfolk_fins">
        <defs>
          <linearGradient id="finCyanGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#06B6D4" stop-opacity="0.9" />
            <stop offset="50%" stop-color="#22D3EE" stop-opacity="0.8" />
            <stop offset="100%" stop-color="#67E8F9" stop-opacity="0.65" />
          </linearGradient>
          <filter id="waterGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#00F0FF" flood-opacity="0.75" />
          </filter>
        </defs>

        <!-- LEFT AQUATIC FIN -->
        <g filter="url(#waterGlow)">
          <path d="M 328,194 C 298,172 264,152 238,132 C 248,162 250,186 236,204 C 254,208 266,218 254,232 C 274,230 304,226 328,234 Z" 
                fill="url(#finCyanGrad)" stroke="#083344" stroke-width="2.8" stroke-linejoin="round" />
          <!-- Spines -->
          <path d="M 326,202 Q 284,168 240,134" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 326,212 Q 286,192 240,205" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <path d="M 326,222 Q 296,222 258,233" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="242" cy="138" r="2.8" fill="#FFFFFF" opacity="0.9" />
        </g>

        <!-- RIGHT AQUATIC FIN -->
        <g filter="url(#waterGlow)">
          <path d="M 440,194 C 470,172 504,152 530,132 C 520,162 518,186 532,204 C 514,208 502,218 514,232 C 494,230 464,226 440,234 Z" 
                fill="url(#finCyanGrad)" stroke="#083344" stroke-width="2.8" stroke-linejoin="round" />
          <!-- Spines -->
          <path d="M 442,202 Q 484,168 528,134" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 442,212 Q 482,192 528,205" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <path d="M 442,222 Q 472,222 510,233" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="526" cy="138" r="2.8" fill="#FFFFFF" opacity="0.9" />
        </g>
      </g>`;
      break;

    case 'fairy_wings': // Alas Minis de Hada (Floating behind character)
      backSvg = `
      <g id="race_fairy_wings_back">
        <defs>
          <linearGradient id="fairyWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#A7F3D0" stop-opacity="0.85" />
            <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#C4B5FD" stop-opacity="0.65" />
          </linearGradient>
          <filter id="fairyGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#67E8F9" flood-opacity="0.9" />
          </filter>
        </defs>

        <!-- LEFT WING PAIR -->
        <g filter="url(#fairyGlow)">
          <path d="M 330,420 C 260,340 180,260 120,230 C 130,270 160,370 220,430 C 270,480 310,460 330,420 Z" 
                fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 120,230 Q 220,330 325,420" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.85" />
          <path d="M 310,440 C 260,465 190,490 160,525 C 190,535 250,515 295,480 Z" 
                fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
          <circle cx="120" cy="230" r="3" fill="#FFFFFF" />
          <circle cx="160" cy="525" r="2.5" fill="#FFFFFF" />
        </g>

        <!-- RIGHT WING PAIR -->
        <g filter="url(#fairyGlow)">
          <path d="M 438,420 C 508,340 588,260 648,230 C 638,270 608,370 548,430 C 498,480 458,460 438,420 Z" 
                fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 648,230 Q 548,330 443,420" fill="none" stroke="#FFFFFF" stroke-width="2" opacity="0.85" />
          <path d="M 458,440 C 508,465 578,490 608,525 C 578,535 518,515 473,480 Z" 
                fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
          <circle cx="648" cy="230" r="3" fill="#FFFFFF" />
          <circle cx="608" cy="525" r="2.5" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'angel_halo': // Aureola Sagrada Flotante
      frontSvg = `
      <g id="race_angel_halo" transform="translate(384, 45)">
        <defs>
          <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#FACC15" flood-opacity="0.9" />
          </filter>
        </defs>
        <g filter="url(#haloGlow)">
          <ellipse cx="0" cy="0" rx="82" ry="20" fill="none" stroke="#FEF08A" stroke-width="8" opacity="0.4" />
          <ellipse cx="0" cy="0" rx="78" ry="18" fill="none" stroke="#FBBF24" stroke-width="6" />
          <ellipse cx="0" cy="0" rx="78" ry="18" fill="none" stroke="#FFFFFF" stroke-width="2.2" />
          <polygon points="-55,-10 -53,-5 -48,-3 -53,-1 -55,4 -57,-1 -62,-3 -57,-5" fill="#FFFFFF" />
          <polygon points="55,10 57,5 62,3 57,1 55,-4 53,1 48,3 53,5" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'crystal_crown': // Corona Rúnica de Cristal
      frontSvg = `
      <g id="race_crystal_crown" transform="translate(384, 136)">
        <defs>
          <filter id="tiaraGlow" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#38BDF8" flood-opacity="0.85" />
          </filter>
          <linearGradient id="crystalCentralGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FFFFFF" />
            <stop offset="35%" stop-color="#7DD3FC" />
            <stop offset="80%" stop-color="#0284C7" />
            <stop offset="100%" stop-color="#0369A1" />
          </linearGradient>
          <linearGradient id="crystalAmethystGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#FAF5FF" />
            <stop offset="40%" stop-color="#C084FC" />
            <stop offset="100%" stop-color="#7E22CE" />
          </linearGradient>
        </defs>

        <g filter="url(#tiaraGlow)">
          <path d="M -72,8 C -40,-2 40,-2 72,8" fill="none" stroke="#B45309" stroke-width="4.5" stroke-linecap="round" />
          <path d="M -70,8 C -40,-2 40,-2 70,8" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" />
          <path d="M -48,4 Q -35,-8 -20,2" fill="none" stroke="#FDE047" stroke-width="1.8" />
          <path d="M 48,4 Q 35,-8 20,2" fill="none" stroke="#FDE047" stroke-width="1.8" />

          <!-- Center Spire Crystal -->
          <polygon points="0,-48 -11,-12 0,-18 11,-12" fill="url(#crystalCentralGrad)" stroke="#0284C7" stroke-width="1.8" />
          <polygon points="0,-48 0,-18 11,-12" fill="#FFFFFF" opacity="0.45" />
          
          <!-- Flanking Amethyst Crystals -->
          <polygon points="-28,-36 -37,-8 -28,-14 -19,-8" fill="url(#crystalAmethystGrad)" stroke="#581C87" stroke-width="1.6" />
          <polygon points="-28,-36 -28,-14 -19,-8" fill="#FFFFFF" opacity="0.4" />

          <polygon points="28,-36 19,-8 28,-14 37,-8" fill="url(#crystalAmethystGrad)" stroke="#581C87" stroke-width="1.6" />
          <polygon points="28,-36 28,-14 37,-8" fill="#FFFFFF" opacity="0.4" />
          
          <!-- Outer Cyan Accents -->
          <polygon points="-54,-24 -60,-2 -54,-6 -48,-2" fill="url(#crystalCentralGrad)" stroke="#0284C7" stroke-width="1.4" />
          <polygon points="54,-24 48,-2 54,-6 60,-2" fill="url(#crystalCentralGrad)" stroke="#0284C7" stroke-width="1.4" />

          <!-- Central Ruby -->
          <circle cx="0" cy="0" r="5" fill="#E11D48" stroke="#881337" stroke-width="1.5" />
          <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFE4E6" />
        </g>
      </g>`;
      break;

    case 'rune_tattoo': // Tatuajes Rúnicos Faciales
      frontSvg = `
      <g id="race_rune_tattoo">
        <defs>
          <filter id="runeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00F0FF" flood-opacity="0.9" />
          </filter>
        </defs>

        <g filter="url(#runeGlow)">
          <path d="M 324,228 Q 338,235 348,225 M 326,236 Q 338,242 346,234" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="352" cy="223" r="2" fill="#FFFFFF" />

          <path d="M 444,228 Q 430,235 420,225 M 442,236 Q 430,242 422,234" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="416" cy="223" r="2" fill="#FFFFFF" />

          <polygon points="384,152 387,159 384,166 381,159" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1" />
          <circle cx="384" cy="159" r="1.6" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'cosmic_antennae': // Antenas Cósmicas Estelares
      frontSvg = `
      <g id="race_cosmic_antennae">
        <defs>
          <filter id="antennaGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#00F0FF" flood-opacity="0.9" />
          </filter>
        </defs>

        <!-- LEFT ANTENNA -->
        <g filter="url(#antennaGlow)">
          <rect x="340" y="112" width="7" height="10" rx="2.5" fill="#334155" stroke="#0F172A" stroke-width="1.4" />
          <path d="M 343,114 Q 320,80 316,40" fill="none" stroke="#06B6D4" stroke-width="3.6" stroke-linecap="round" />
          <path d="M 343,114 Q 320,80 316,40" fill="none" stroke="#E0F2FE" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="316" cy="38" r="10" fill="#00F0FF" opacity="0.35" />
          <circle cx="316" cy="38" r="7.5" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1.8" />
          <circle cx="314" cy="36" r="2.8" fill="#FFFFFF" />
          <ellipse cx="316" cy="38" rx="13" ry="4.5" fill="none" stroke="#FEF08A" stroke-width="1.4" transform="rotate(-25 316 38)" />
        </g>

        <!-- RIGHT ANTENNA -->
        <g filter="url(#antennaGlow)">
          <rect x="421" y="112" width="7" height="10" rx="2.5" fill="#334155" stroke="#0F172A" stroke-width="1.4" />
          <path d="M 425,114 Q 448,80 452,40" fill="none" stroke="#06B6D4" stroke-width="3.6" stroke-linecap="round" />
          <path d="M 425,114 Q 448,80 452,40" fill="none" stroke="#E0F2FE" stroke-width="1.6" stroke-linecap="round" />
          <circle cx="452" cy="38" r="10" fill="#00F0FF" opacity="0.35" />
          <circle cx="452" cy="38" r="7.5" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1.8" />
          <circle cx="450" cy="36" r="2.8" fill="#FFFFFF" />
          <ellipse cx="452" cy="38" rx="13" ry="4.5" fill="none" stroke="#FEF08A" stroke-width="1.4" transform="rotate(25 452 38)" />
        </g>
      </g>`;
      break;

    default:
      frontSvg = '';
      backSvg = '';
  }

  const wrapSvg = (content) => content ? `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">${content}</svg>` : null;

  return {
    frontSvg: wrapSvg(frontSvg),
    backSvg: wrapSvg(backSvg)
  };
}

async function renderV9() {
  const traits = [
    'wolf_ears', 'bunny_ears', 'merfolk_fins'
  ];

  const genders = [
    { key: 'male', file: 'public/images/avatar/trainer_base_clean.png', hairHex: '#382218', skinHex: '#FCE7DF' },
    { key: 'female', file: 'public/images/avatar/trainer_female_clean.png', hairHex: '#3D2820', skinHex: '#FDE2E4' },
    { key: 'neutral', file: 'public/images/avatar/trainer_neutral_clean.png', hairHex: '#CBD5E1', skinHex: '#FCE7DF' }
  ];

  for (const trait of traits) {
    for (const g of genders) {
      const { frontSvg } = getPolishedRaceFeatures(trait, g.key, g.hairHex, g.skinHex);
      const composited = await sharp(g.file)
        .composite([{ input: Buffer.from(frontSvg) }])
        .png()
        .toBuffer();

      await sharp(composited)
        .extract({ left: 180, top: 20, width: 408, height: 360 })
        .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/v9_${trait}_${g.key}.png`);
    }
    console.log(`Rendered v9: ${trait}`);
  }
}

renderV9().catch(console.error);
