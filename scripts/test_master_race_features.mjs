import sharp from 'sharp';
import fs from 'fs';

export function getMasterRaceFeatureSvg(featureId, hairHex = '#EC4899', skinHex = '#FCE7DF') {
  let content = '';

  switch (featureId) {
    case 'cat_ears': // Orejas de Gato / Kitsune
      content = `
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
          <!-- Outer Ear Silhouette with curved fluffy anime edge -->
          <path d="M 334,116 C 322,102 308,76 294,40 C 290,26 288,16 292,14 C 297,14 310,26 328,48 C 344,66 354,88 358,110 C 352,115 344,117 334,116 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" />
          
          <!-- Outer Shadow Rim -->
          <path d="M 292,14 C 295,30 304,56 314,76 C 308,86 302,98 300,105 C 294,88 288,62 292,14 Z" 
                fill="#000000" opacity="0.3" />

          <!-- Inner Velvet Pink Basin -->
          <path d="M 302,76 C 296,56 296,40 298,36 C 304,42 318,60 330,80 C 338,92 342,102 342,106 C 334,109 318,104 302,76 Z" 
                fill="url(#catInnerPinkL)" stroke="#9F1239" stroke-width="1.6" />
          <path d="M 304,92 C 308,100 318,106 328,104 C 318,102 310,98 304,92 Z" 
                fill="#881337" opacity="0.6" />

          <!-- Fluffy White Fur Tufts bursting inside & at base -->
          <path d="M 300,105 C 308,98 316,90 318,80 C 321,88 326,94 330,98 C 334,88 336,82 338,74 C 340,82 342,90 344,98 C 338,106 328,112 316,114 C 308,114 302,110 300,105 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <path d="M 306,101 C 312,95 316,87 317,83 C 320,91 324,95 327,97" 
                fill="none" stroke="#FFE4E6" stroke-width="2.2" stroke-linecap="round" />

          <!-- Soft Hair Anchoring Tufts (Seamlessly blending into skull) -->
          <path d="M 322,112 Q 330,122 338,114 Q 344,124 352,112" fill="none" stroke="${hairHex}" stroke-width="4" stroke-linecap="round" />
        </g>

        <!-- RIGHT CAT EAR -->
        <g filter="url(#catEarShadow)">
          <!-- Outer Ear Silhouette with curved fluffy anime edge -->
          <path d="M 434,116 C 446,102 460,76 474,40 C 478,26 480,16 476,14 C 471,14 458,26 440,48 C 424,66 414,88 410,110 C 416,115 424,117 434,116 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" />
          
          <!-- Outer Shadow Rim -->
          <path d="M 476,14 C 473,30 464,56 454,76 C 460,86 466,98 468,105 C 474,88 480,62 476,14 Z" 
                fill="#000000" opacity="0.3" />

          <!-- Inner Velvet Pink Basin -->
          <path d="M 466,76 C 472,56 472,40 470,36 C 464,42 450,60 438,80 C 430,92 426,102 426,106 C 434,109 450,104 466,76 Z" 
                fill="url(#catInnerPinkR)" stroke="#9F1239" stroke-width="1.6" />
          <path d="M 464,92 C 460,100 450,106 440,104 C 450,102 458,98 464,92 Z" 
                fill="#881337" opacity="0.6" />

          <!-- Fluffy White Fur Tufts bursting inside & at base -->
          <path d="M 468,105 C 460,98 452,90 450,80 C 447,88 442,94 438,98 C 434,88 432,82 430,74 C 428,82 426,90 424,98 C 430,106 440,112 452,114 C 460,114 466,110 468,105 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <path d="M 462,101 C 456,95 452,87 451,83 C 448,91 444,95 441,97" 
                fill="none" stroke="#FFE4E6" stroke-width="2.2" stroke-linecap="round" />

          <!-- Soft Hair Anchoring Tufts (Seamlessly blending into skull) -->
          <path d="M 446,112 Q 438,122 430,114 Q 424,124 416,112" fill="none" stroke="${hairHex}" stroke-width="4" stroke-linecap="round" />
        </g>
      </g>`;
      break;

    case 'wolf_ears': // Lobo de las Tormentas
      content = `
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

        <!-- LEFT WOLF EAR -->
        <g filter="url(#wolfShadow)">
          <path d="M 326,118 C 315,102 300,74 282,38 C 276,22 272,8 276,6 C 281,6 300,24 322,52 C 338,70 348,94 354,116 C 346,122 336,124 326,118 Z" 
                fill="url(#wolfSlateL)" stroke="#090D1A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Dark Storm Tip -->
          <path d="M 276,6 C 284,16 296,34 304,48 C 296,40 286,26 276,6 Z" fill="#020617" />

          <!-- Inner Slate Ear Basin -->
          <path d="M 288,54 C 284,38 285,28 287,26 C 294,34 308,52 320,72 C 328,86 334,100 334,106 C 324,110 308,100 288,54 Z" 
                fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          
          <!-- Layered Jagged White Fluff -->
          <path d="M 288,104 C 298,96 312,82 316,68 C 320,80 326,88 332,94 C 334,82 338,74 342,62 C 344,74 345,86 346,96 C 338,108 324,116 308,118 C 298,118 290,112 288,104 Z" 
                fill="#F8FAFC" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />

          <!-- Silver Storm Hoops on Ear Edge -->
          <ellipse cx="279" cy="32" rx="3.5" ry="6" fill="none" stroke="#E2E8F0" stroke-width="2.6" transform="rotate(-30 279 32)" />
          <ellipse cx="284" cy="48" rx="3" ry="5" fill="none" stroke="#E2E8F0" stroke-width="2.2" transform="rotate(-30 284 48)" />
        </g>

        <!-- RIGHT WOLF EAR -->
        <g filter="url(#wolfShadow)">
          <path d="M 442,118 C 453,102 468,74 486,38 C 492,22 496,8 492,6 C 487,6 468,24 446,52 C 430,70 420,94 414,116 C 422,122 432,124 442,118 Z" 
                fill="url(#wolfSlateR)" stroke="#090D1A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Dark Storm Tip -->
          <path d="M 492,6 C 484,16 472,34 464,48 C 472,40 482,26 492,6 Z" fill="#020617" />

          <!-- Inner Slate Ear Basin -->
          <path d="M 480,54 C 484,38 483,28 481,26 C 474,34 460,52 448,72 C 440,86 434,100 434,106 C 444,110 460,100 480,54 Z" 
                fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          
          <!-- Layered Jagged White Fluff -->
          <path d="M 480,104 C 470,96 456,82 452,68 C 448,80 442,88 436,94 C 434,82 430,74 426,62 C 424,74 423,86 422,96 C 430,108 444,116 460,118 C 470,118 478,112 480,104 Z" 
                fill="#F8FAFC" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
        </g>
      </g>`;
      break;

    case 'bunny_ears': // Orejitas de Conejo Lunar (Organic anime curves with fluffy bases)
      content = `
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

        <!-- LEFT BUNNY EAR (Curving tall plush ear) -->
        <g filter="url(#bunnyShadow)">
          <!-- Outer plush white body with gentle curve -->
          <path d="M 334,116 C 326,90 315,50 310,18 C 307,-4 320,-16 335,-14 C 350,-12 360,12 362,50 C 364,88 358,110 348,118 C 342,120 338,120 334,116 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Cel Shadow Rim -->
          <path d="M 310,18 C 307,-4 320,-16 335,-14 C 326,-8 322,4 324,28 C 328,68 335,100 342,116 C 338,114 328,92 310,18 Z" 
                fill="#E2E8F0" opacity="0.65" />
          <!-- Pink Velvet Core -->
          <path d="M 332,102 C 328,78 322,42 320,15 C 318,2 324,-5 330,-4 C 338,-2 344,12 346,38 C 348,68 346,92 340,105 C 336,107 334,105 332,102 Z" 
                fill="url(#bunnyPinkCore)" stroke="#F472B6" stroke-width="1.4" />
          <!-- Base Fluffy Cotton Tufts -->
          <path d="M 326,114 C 320,118 322,124 330,123 C 335,126 344,126 348,122 C 354,124 360,120 356,114 C 350,110 332,110 326,114 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8" />
        </g>

        <!-- RIGHT BUNNY EAR (Curved with charming drooping folded tip) -->
        <g filter="url(#bunnyShadow)">
          <!-- Main Ear Body -->
          <path d="M 420,118 C 424,102 430,70 438,36 C 444,14 458,4 470,10 C 478,16 472,36 458,54 C 454,80 448,104 438,120 C 430,122 425,121 420,118 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Pink Velvet Core -->
          <path d="M 430,110 C 432,90 438,65 444,42 C 447,28 454,22 460,25 C 463,30 458,44 450,56 C 445,80 440,100 436,110 Z" 
                fill="url(#bunnyPinkCore)" stroke="#F472B6" stroke-width="1.4" />
          <!-- Cute Curved Drooping Tip Fold -->
          <path d="M 458,4 C 470,10 480,18 474,40 C 464,30 454,26 444,30 C 450,16 454,8 458,4 Z" 
                fill="#F1F5F9" stroke="#0F172A" stroke-width="2.8" stroke-linejoin="round" />
          <!-- Base Fluffy Cotton Tufts -->
          <path d="M 414,114 C 410,118 412,124 420,123 C 425,126 434,126 438,122 C 444,124 450,120 446,114 C 440,110 422,110 414,114 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8" />
        </g>
      </g>`;
      break;

    case 'dragon_horns': // Cuernos de Dragón Dorado (Magnificent curved horns sweeping back from crown)
      content = `
      <g id="race_dragon_horns">
        <defs>
          <linearGradient id="dragonGoldL" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="30%" stop-color="#B45309" />
            <stop offset="65%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#FEF08A" />
          </linearGradient>
          <linearGradient id="dragonGoldR" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#78350F" />
            <stop offset="30%" stop-color="#B45309" />
            <stop offset="65%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#FEF08A" />
          </linearGradient>
          <filter id="dragonAura" x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0" dy="2" stdDeviation="6" flood-color="#F59E0B" flood-opacity="0.6" />
          </filter>
        </defs>

        <!-- LEFT DRAGON HORN (Gracefully curving back & out) -->
        <g filter="url(#dragonAura)">
          <!-- Robust Curved Horn Body -->
          <path d="M 338,120 C 316,110 286,96 260,76 C 242,60 230,42 232,32 C 235,32 255,48 288,68 C 316,84 344,102 354,118 Z" 
                fill="url(#dragonGoldL)" stroke="#451A03" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Layered Dragon Scale Ridge Bands -->
          <path d="M 242,42 Q 254,48 266,42" fill="none" stroke="#78350F" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 260,60 Q 276,68 290,60" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <path d="M 284,78 Q 304,88 318,78" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
          <path d="M 310,98 Q 330,108 344,98" fill="none" stroke="#78350F" stroke-width="3.4" stroke-linecap="round" />
          <!-- Top Celestial Ridge Highlight -->
          <path d="M 234,34 C 248,50 280,74 322,100" fill="none" stroke="#FFFBEB" stroke-width="2.4" stroke-linecap="round" opacity="0.9" />
          <circle cx="232" cy="32" r="2.8" fill="#FFFFFF" />
        </g>

        <!-- RIGHT DRAGON HORN (Gracefully curving back & out) -->
        <g filter="url(#dragonAura)">
          <path d="M 430,120 C 452,110 482,96 508,76 C 526,60 538,42 536,32 C 533,32 513,48 480,68 C 452,84 424,102 414,118 Z" 
                fill="url(#dragonGoldR)" stroke="#451A03" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Layered Dragon Scale Ridge Bands -->
          <path d="M 526,42 Q 514,48 502,42" fill="none" stroke="#78350F" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 508,60 Q 492,68 478,60" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <path d="M 484,78 Q 464,88 450,78" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
          <path d="M 458,98 Q 438,108 424,98" fill="none" stroke="#78350F" stroke-width="3.4" stroke-linecap="round" />
          <!-- Top Celestial Ridge Highlight -->
          <path d="M 534,34 C 520,50 488,74 446,100" fill="none" stroke="#FFFBEB" stroke-width="2.4" stroke-linecap="round" opacity="0.9" />
          <circle cx="536" cy="32" r="2.8" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'demon_horns': // Cuernitos de Gárgola / Demoníacos (Obsidian basalt with glowing magma veins)
      content = `
      <g id="race_demon_horns">
        <defs>
          <filter id="demonGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#DC2626" flood-opacity="0.85" />
          </filter>
        </defs>

        <!-- LEFT OBSIDIAN HORN -->
        <g filter="url(#demonGlow)">
          <path d="M 334,122 C 316,105 304,80 300,52 C 298,32 304,15 310,12 C 314,18 320,46 332,80 C 340,100 348,114 350,122 Z" 
                fill="#18181B" stroke="#09090B" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Magma fissure vein (glowing red-hot core) -->
          <path d="M 306,25 Q 312,52 318,78 Q 326,98 334,115" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 306,25 Q 312,52 318,78 Q 326,98 334,115" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
          <path d="M 304,60 L 312,58 L 318,65" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <path d="M 312,90 L 322,86 L 328,94" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <circle cx="310" cy="12" r="2.2" fill="#FEF08A" />
        </g>

        <!-- RIGHT OBSIDIAN HORN -->
        <g filter="url(#demonGlow)">
          <path d="M 434,122 C 452,105 464,80 468,52 C 470,32 464,15 458,12 C 454,18 448,46 436,80 C 428,100 420,114 418,122 Z" 
                fill="#18181B" stroke="#09090B" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Magma fissure vein (glowing red-hot core) -->
          <path d="M 462,25 Q 456,52 450,78 Q 442,98 434,115" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 462,25 Q 456,52 450,78 Q 442,98 434,115" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
          <path d="M 464,60 L 456,58 L 450,65" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <path d="M 456,90 L 446,86 L 440,94" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <circle cx="458" cy="12" r="2.2" fill="#FEF08A" />
        </g>
      </g>`;
      break;

    case 'stag_antlers': // Astas de Ciervo Silvestre (Branching organic wood with emerald foliage)
      content = `
      <g id="race_stag_antlers">
        <defs>
          <filter id="natureAura" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#16A34A" flood-opacity="0.4" />
          </filter>
        </defs>

        <!-- LEFT ANTLER -->
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

        <!-- RIGHT ANTLER -->
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
      content = `
      <g id="race_elf_long">
        <defs>
          <filter id="elfEarShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.22" />
          </filter>
        </defs>

        <!-- LEFT ELVEN EAR (Elegantly sweeping from native ear position) -->
        <g filter="url(#elfEarShadow)">
          <path d="M 314,198 C 295,194 260,180 230,162 C 227,160 226,164 230,170 C 248,192 278,218 312,230 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 306,204 C 288,198 264,188 245,176 C 258,190 278,210 304,222 Z" fill="#9A3412" opacity="0.22" />
          <path d="M 312,202 C 298,198 275,188 256,180" fill="none" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round" opacity="0.38" />

          <!-- Golden Aristocratic Ear-Cuff Jewelry -->
          <path d="M 268,184 Q 270,192 264,198" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="266" cy="191" r="2.2" fill="#FEF08A" />
          <polygon points="264,200 262,207 266,207" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
        </g>

        <!-- RIGHT ELVEN EAR -->
        <g filter="url(#elfEarShadow)">
          <path d="M 454,198 C 473,194 508,180 538,162 C 541,160 542,164 538,170 C 520,192 490,218 456,230 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 462,204 C 480,198 504,188 523,176 C 510,190 490,210 464,222 Z" fill="#9A3412" opacity="0.22" />
          <path d="M 456,202 C 470,198 493,188 512,180" fill="none" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round" opacity="0.38" />

          <!-- Golden Aristocratic Ear-Cuff Jewelry -->
          <path d="M 500,184 Q 498,192 504,198" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="502" cy="191" r="2.2" fill="#FEF08A" />
          <polygon points="504,200 506,207 502,207" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
        </g>
      </g>`;
      break;

    case 'elf_short': // Elfo Ágil (Cortas)
      content = `
      <g id="race_elf_short">
        <g>
          <path d="M 315,198 C 300,194 274,184 255,172 C 253,170 253,174 257,180 C 270,198 295,216 314,226 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 307,202 C 292,196 276,188 266,180 C 276,192 292,206 307,218 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="270" cy="194" r="2.2" fill="#FACC15" stroke="#713F12" stroke-width="0.8" />
        </g>
        <g>
          <path d="M 453,198 C 468,194 494,184 513,172 C 515,170 515,174 511,180 C 498,198 473,216 454,226 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 461,202 C 476,196 492,188 502,180 C 492,192 476,206 461,218 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="498" cy="194" r="2.2" fill="#FACC15" stroke="#713F12" stroke-width="0.8" />
        </g>
      </g>`;
      break;

    case 'merfolk_fins': // Aletas Acuáticas de Sirena
      content = `
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

        <g filter="url(#waterGlow)">
          <path d="M 314,196 C 282,180 250,165 228,145 C 238,172 245,190 234,206 C 250,210 260,220 250,232 C 268,230 288,225 313,228 Z" 
                fill="url(#finCyanGrad)" stroke="#083344" stroke-width="2.8" stroke-linejoin="round" />
          <path d="M 313,205 Q 272,178 230,147" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 313,212 Q 276,196 236,207" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <path d="M 313,220 Q 286,222 253,233" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="232" cy="151" r="2.8" fill="#FFFFFF" opacity="0.9" />
        </g>

        <g filter="url(#waterGlow)">
          <path d="M 454,196 C 486,180 518,165 540,145 C 530,172 523,190 534,206 C 518,210 508,220 518,232 C 500,230 480,225 455,228 Z" 
                fill="url(#finCyanGrad)" stroke="#083344" stroke-width="2.8" stroke-linejoin="round" />
          <path d="M 455,205 Q 496,178 538,147" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 455,212 Q 492,196 532,207" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <path d="M 455,220 Q 482,222 515,233" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="536" cy="151" r="2.8" fill="#FFFFFF" opacity="0.9" />
        </g>
      </g>`;
      break;

    case 'fairy_wings': // Alas Minis de Hada
      content = `
      <g id="race_fairy_wings">
        <defs>
          <linearGradient id="fairyWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#A7F3D0" stop-opacity="0.85" />
            <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.75" />
            <stop offset="100%" stop-color="#C4B5FD" stop-opacity="0.65" />
          </linearGradient>
          <filter id="fairyGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#67E8F9" flood-opacity="0.85" />
          </filter>
        </defs>

        <g filter="url(#fairyGlow)">
          <path d="M 310,340 C 260,300 200,240 160,210 C 165,240 190,310 230,350 C 265,385 295,370 310,340 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 160,210 Q 230,280 305,340" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.85" />
          <path d="M 295,360 C 260,375 210,390 185,415 C 205,420 250,410 280,390 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
        </g>

        <g filter="url(#fairyGlow)">
          <path d="M 458,340 C 508,300 568,240 608,210 C 603,240 578,310 538,350 C 503,385 473,370 458,340 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 608,210 Q 538,280 463,340" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.85" />
          <path d="M 473,360 C 508,375 558,390 583,415 C 563,420 518,410 488,390 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
        </g>
      </g>`;
      break;

    case 'angel_halo': // Aureola Sagrada Flotante (Divine golden halo with white core & star glints)
      content = `
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

    case 'crystal_crown': // Corona Rúnica de Cristal (Ornate golden tiara with prismatic crystal spires)
      content = `
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
          <!-- Golden Tiara Circlet Filigree Band -->
          <path d="M -72,8 C -40,-2 40,-2 72,8" fill="none" stroke="#B45309" stroke-width="4.5" stroke-linecap="round" />
          <path d="M -70,8 C -40,-2 40,-2 70,8" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" />
          <!-- Filigree decorative curls -->
          <path d="M -48,4 Q -35,-8 -20,2" fill="none" stroke="#FDE047" stroke-width="1.8" />
          <path d="M 48,4 Q 35,-8 20,2" fill="none" stroke="#FDE047" stroke-width="1.8" />

          <!-- Center Spire Crystal (Tall majestic cyan shard) -->
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

          <!-- Central Ruby / Gem Core -->
          <circle cx="0" cy="0" r="5" fill="#E11D48" stroke="#881337" stroke-width="1.5" />
          <circle cx="-1.5" cy="-1.5" r="1.5" fill="#FFE4E6" />
        </g>
      </g>`;
      break;

    case 'rune_tattoo': // Tatuajes Rúnicos Faciales
      content = `
      <g id="race_rune_tattoo">
        <defs>
          <filter id="runeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00F0FF" flood-opacity="0.9" />
          </filter>
        </defs>

        <g filter="url(#runeGlow)">
          <!-- Left Cheek Arcane Runes -->
          <path d="M 324,228 Q 338,235 348,225 M 326,236 Q 338,242 346,234" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="352" cy="223" r="2" fill="#FFFFFF" />

          <!-- Right Cheek Arcane Runes -->
          <path d="M 444,228 Q 430,235 420,225 M 442,236 Q 430,242 422,234" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="416" cy="223" r="2" fill="#FFFFFF" />

          <!-- Forehead Third-Eye Diamond Rune -->
          <polygon points="384,152 387,159 384,166 381,159" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1" />
          <circle cx="384" cy="159" r="1.6" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'cosmic_antennae': // Antenas Cósmicas Estelares
      content = `
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
      content = '';
  }

  return `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

async function runMasterTest() {
  const traits = [
    'cat_ears', 'wolf_ears', 'bunny_ears', 'dragon_horns', 
    'demon_horns', 'stag_antlers', 'elf_long', 'elf_short', 
    'merfolk_fins', 'fairy_wings', 'angel_halo', 'crystal_crown', 
    'rune_tattoo', 'cosmic_antennae'
  ];

  const genders = [
    { key: 'male', file: 'public/images/avatar/trainer_base_clean.png', hairHex: '#382218', skinHex: '#FCE7DF' },
    { key: 'female', file: 'public/images/avatar/trainer_female_clean.png', hairHex: '#3D2820', skinHex: '#FDE2E4' },
    { key: 'neutral', file: 'public/images/avatar/trainer_neutral_clean.png', hairHex: '#CBD5E1', skinHex: '#FCE7DF' }
  ];

  for (const trait of traits) {
    for (const g of genders) {
      const svg = getMasterRaceFeatureSvg(trait, g.hairHex, g.skinHex);
      const composited = await sharp(g.file)
        .composite([{ input: Buffer.from(svg) }])
        .png()
        .toBuffer();

      await sharp(composited)
        .extract({ left: 200, top: 0, width: 368, height: 380 })
        .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/master_trait_${trait}_${g.key}.png`);
    }
  }
  console.log('Master traits test rendered!');
}

runMasterTest().catch(console.error);
