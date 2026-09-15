import sharp from 'sharp';
import fs from 'fs';

// Generates anatomically-anchored, cel-shaded anime fantasy features
export function getCalibratedRaceFeatureSvg(featureId, hairHex = '#EC4899', skinHex = '#FCE7DF') {
  // Derive hair shades for cel-shading
  // For SVG gradients, we can use hairHex with darkened/lightened opacities
  let content = '';

  switch (featureId) {
    case 'cat_ears': // Orejas de Gato / Kitsune
      content = `
      <g id="race_cat_ears">
        <defs>
          <linearGradient id="catInnerPinkL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E11D48" />
            <stop offset="45%" stop-color="#FB7185" />
            <stop offset="100%" stop-color="#FECDD3" />
          </linearGradient>
          <linearGradient id="catInnerPinkR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#E11D48" />
            <stop offset="45%" stop-color="#FB7185" />
            <stop offset="100%" stop-color="#FECDD3" />
          </linearGradient>
          <filter id="catEarShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" flood-color="#090D1A" flood-opacity="0.38" />
          </filter>
        </defs>

        <!-- LEFT CAT EAR (Upper Crown x: 300..348, y: 35..115) -->
        <g filter="url(#catEarShadow)">
          <!-- Back Outer Shell (matching hair) -->
          <path d="M 326,118 C 316,102 304,78 290,44 C 285,32 282,24 286,22 C 291,20 306,34 324,54 C 338,70 348,88 354,108 C 348,114 338,118 326,118 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round" />
          
          <!-- Outer Ear Cel Shadow Rim -->
          <path d="M 286,22 C 288,38 298,62 308,82 C 304,90 298,102 298,108 C 290,92 284,70 286,22 Z" 
                fill="#000000" opacity="0.28" />

          <!-- Inner Ear Velvet Pink Basin -->
          <path d="M 295,84 C 290,62 290,46 292,42 C 298,48 312,64 325,82 C 332,92 336,102 336,106 C 328,110 312,108 295,84 Z" 
                fill="url(#catInnerPinkL)" stroke="#9F1239" stroke-width="1.6" />
          <path d="M 298,98 C 302,106 312,110 322,108 C 312,107 304,103 298,98 Z" 
                fill="#881337" opacity="0.6" />

          <!-- Fluffy White Fur Tufts bursting inside & at base -->
          <path d="M 296,108 C 304,102 312,94 314,84 C 317,92 322,98 326,102 C 330,92 332,86 334,78 C 336,86 338,94 340,102 C 334,110 324,115 312,116 C 304,116 298,112 296,108 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <!-- Inner soft highlight tuft -->
          <path d="M 302,104 C 308,98 312,90 313,86 C 316,94 320,98 323,100" 
                fill="none" stroke="#FFE4E6" stroke-width="2.2" stroke-linecap="round" />

          <!-- Front Hair Anchor Lock (overlaps base so ear emerges naturally from hair) -->
          <path d="M 318,106 C 324,112 330,122 330,128 C 334,122 342,114 348,110 C 342,116 336,128 335,134 C 330,128 324,118 318,106 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="2.4" stroke-linejoin="round" />
        </g>

        <!-- RIGHT CAT EAR (Upper Crown x: 420..468, y: 35..115) -->
        <g filter="url(#catEarShadow)">
          <!-- Back Outer Shell (matching hair) -->
          <path d="M 442,118 C 452,102 464,78 478,44 C 483,32 486,24 482,22 C 477,20 462,34 444,54 C 430,70 420,88 414,108 C 420,114 430,118 442,118 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round" />
          
          <!-- Outer Ear Cel Shadow Rim -->
          <path d="M 482,22 C 480,38 470,62 460,82 C 464,90 470,102 470,108 C 478,92 484,70 482,22 Z" 
                fill="#000000" opacity="0.28" />

          <!-- Inner Ear Velvet Pink Basin -->
          <path d="M 473,84 C 478,62 478,46 476,42 C 470,48 456,64 443,82 C 436,92 432,102 432,106 C 440,110 456,108 473,84 Z" 
                fill="url(#catInnerPinkR)" stroke="#9F1239" stroke-width="1.6" />
          <path d="M 470,98 C 466,106 456,110 446,108 C 456,107 464,103 470,98 Z" 
                fill="#881337" opacity="0.6" />

          <!-- Fluffy White Fur Tufts bursting inside & at base -->
          <path d="M 472,108 C 464,102 456,94 454,84 C 451,92 446,98 442,102 C 438,92 436,86 434,78 C 432,86 430,94 428,102 C 434,110 444,115 456,116 C 464,116 470,112 472,108 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <!-- Inner soft highlight tuft -->
          <path d="M 466,104 C 460,98 456,90 455,86 C 452,94 448,98 445,100" 
                fill="none" stroke="#FFE4E6" stroke-width="2.2" stroke-linecap="round" />

          <!-- Front Hair Anchor Lock (overlaps base so ear emerges naturally from hair) -->
          <path d="M 450,106 C 444,112 438,122 438,128 C 434,122 426,114 420,110 C 426,116 432,128 433,134 C 438,128 444,118 450,106 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="2.4" stroke-linejoin="round" />
        </g>
      </g>`;
      break;

    case 'wolf_ears': // Lobo de las Tormentas
      content = `
      <g id="race_wolf_ears">
        <defs>
          <linearGradient id="wolfSlateL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="40%" stop-color="#334155" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="wolfSlateR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#0F172A" />
            <stop offset="40%" stop-color="#334155" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <filter id="wolfShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#090D1A" flood-opacity="0.45" />
          </filter>
        </defs>

        <!-- LEFT WOLF EAR (Wild, rugged, majestic at crown) -->
        <g filter="url(#wolfShadow)">
          <path d="M 324,120 C 314,104 300,75 284,42 C 278,26 274,12 277,10 C 282,10 300,28 322,55 C 336,72 346,95 352,118 C 344,124 334,126 324,120 Z" 
                fill="url(#wolfSlateL)" stroke="#090D1A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Dark Storm Tip -->
          <path d="M 277,10 C 284,18 296,36 304,50 C 296,42 288,28 277,10 Z" fill="#020617" />

          <!-- Inner Slate Ear Basin -->
          <path d="M 288,58 C 284,42 285,32 287,30 C 294,38 308,56 320,76 C 328,90 334,104 334,110 C 324,114 308,104 288,58 Z" 
                fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          
          <!-- Layered Jagged White Fluff -->
          <path d="M 288,108 C 298,100 312,86 316,72 C 320,84 326,92 332,98 C 334,86 338,78 342,66 C 344,78 345,90 346,100 C 338,112 324,120 308,122 C 298,122 290,116 288,108 Z" 
                fill="#F8FAFC" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />

          <!-- Silver Storm Hoops on Ear Edge -->
          <ellipse cx="280" cy="36" rx="3.5" ry="6" fill="none" stroke="#E2E8F0" stroke-width="2.6" transform="rotate(-30 280 36)" />
          <ellipse cx="285" cy="52" rx="3" ry="5" fill="none" stroke="#E2E8F0" stroke-width="2.2" transform="rotate(-30 285 52)" />

          <!-- Front Hair Anchor Lock -->
          <path d="M 315,108 C 322,116 328,126 328,132 C 332,126 340,118 346,112 C 340,118 334,130 333,136 C 328,130 322,120 315,108 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="2.4" stroke-linejoin="round" />
        </g>

        <!-- RIGHT WOLF EAR -->
        <g filter="url(#wolfShadow)">
          <path d="M 444,120 C 454,104 468,75 484,42 C 490,26 494,12 491,10 C 486,10 468,28 446,55 C 432,72 422,95 416,118 C 424,124 434,126 444,120 Z" 
                fill="url(#wolfSlateR)" stroke="#090D1A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Dark Storm Tip -->
          <path d="M 491,10 C 484,18 472,36 464,50 C 472,42 480,28 491,10 Z" fill="#020617" />

          <!-- Inner Slate Ear Basin -->
          <path d="M 480,58 C 484,42 483,32 481,30 C 474,38 460,56 448,76 C 440,90 434,104 434,110 C 444,114 460,104 480,58 Z" 
                fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          
          <!-- Layered Jagged White Fluff -->
          <path d="M 480,108 C 470,100 456,86 452,72 C 448,84 442,92 436,98 C 434,86 430,78 426,66 C 424,78 423,90 422,100 C 430,112 444,120 460,122 C 470,122 478,116 480,108 Z" 
                fill="#F8FAFC" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />

          <!-- Front Hair Anchor Lock -->
          <path d="M 453,108 C 446,116 440,126 440,132 C 436,126 428,118 422,112 C 428,118 434,130 435,136 C 440,130 446,120 453,108 Z" 
                fill="${hairHex}" stroke="#0F172A" stroke-width="2.4" stroke-linejoin="round" />
        </g>
      </g>`;
      break;

    case 'bunny_ears': // Orejitas de Conejo Lunar
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

        <!-- LEFT BUNNY EAR (Erect & plush) -->
        <g filter="url(#bunnyShadow)">
          <!-- Outer plush white body -->
          <path d="M 335,115 C 328,92 320,55 316,22 C 314,2 324,-8 338,-6 C 352,-4 360,18 362,55 C 364,90 358,112 350,120 C 344,122 340,120 335,115 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Soft Rim Cel Shadow -->
          <path d="M 316,22 C 314,2 324,-8 338,-6 C 330,-2 326,10 328,32 C 331,70 338,102 344,118 C 340,116 332,95 316,22 Z" 
                fill="#E2E8F0" opacity="0.65" />
          <!-- Pink Velvet Core -->
          <path d="M 334,105 C 330,80 326,45 325,18 C 324,5 329,-1 334,0 C 341,2 346,15 348,42 C 350,70 348,95 342,108 C 338,110 336,108 334,105 Z" 
                fill="url(#bunnyPinkCore)" stroke="#F472B6" stroke-width="1.4" />
          <!-- Base Fluff Puff -->
          <ellipse cx="342" cy="116" rx="13" ry="6.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8" />
        </g>

        <!-- RIGHT BUNNY EAR (Playfully folded tip) -->
        <g filter="url(#bunnyShadow)">
          <!-- Lower / middle ear body -->
          <path d="M 420,118 C 424,102 428,70 435,35 C 440,12 454,2 466,8 C 475,14 470,36 456,52 C 452,78 446,104 438,120 C 430,122 425,121 420,118 Z" 
                fill="#FFFFFF" stroke="#0F172A" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Pink Velvet Core -->
          <path d="M 430,110 C 432,90 436,65 442,42 C 445,28 452,22 457,25 C 460,30 455,44 447,56 C 443,80 438,100 435,110 Z" 
                fill="url(#bunnyPinkCore)" stroke="#F472B6" stroke-width="1.4" />
          <!-- Cute Curved Tip Fold (overlapping) -->
          <path d="M 454,2 C 466,8 475,14 470,36 C 462,28 452,24 442,28 C 447,14 450,6 454,2 Z" 
                fill="#F1F5F9" stroke="#0F172A" stroke-width="2.8" stroke-linejoin="round" />
          <!-- Base Fluff Puff -->
          <ellipse cx="430" cy="116" rx="13" ry="6.5" fill="#FFFFFF" stroke="#0F172A" stroke-width="1.8" />
        </g>
      </g>`;
      break;

    case 'dragon_horns': // Cuernos de Dragón Dorado
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
          <filter id="dragonAura" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#F59E0B" flood-opacity="0.6" />
          </filter>
        </defs>

        <!-- LEFT DRAGON HORN (Sweeping back and outward from crown x: 335, y: 110) -->
        <g filter="url(#dragonAura)">
          <path d="M 332,118 C 312,106 288,90 268,70 C 252,54 242,32 246,22 C 252,28 274,54 304,82 C 324,98 342,110 348,120 Z" 
                fill="url(#dragonGoldL)" stroke="#451A03" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Sculpted Scale Ridges / Annuli -->
          <path d="M 258,40 Q 268,46 278,42" fill="none" stroke="#78350F" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 272,60 Q 285,68 298,62" fill="none" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 290,80 Q 306,90 320,82" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <path d="M 310,100 Q 328,110 340,100" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <!-- Shiny Celestial Rim Highlight -->
          <path d="M 248,24 C 260,46 288,76 322,104" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
          <!-- Sharp Tip Sparkle -->
          <circle cx="246" cy="22" r="2.8" fill="#FFFFFF" />
        </g>

        <!-- RIGHT DRAGON HORN -->
        <g filter="url(#dragonAura)">
          <path d="M 436,118 C 456,106 480,90 500,70 C 516,54 526,32 522,22 C 516,28 494,54 464,82 C 444,98 426,110 420,120 Z" 
                fill="url(#dragonGoldR)" stroke="#451A03" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Sculpted Scale Ridges / Annuli -->
          <path d="M 510,40 Q 500,46 490,42" fill="none" stroke="#78350F" stroke-width="2.6" stroke-linecap="round" />
          <path d="M 496,60 Q 483,68 470,62" fill="none" stroke="#78350F" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 478,80 Q 462,90 448,82" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <path d="M 458,100 Q 440,110 428,100" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <!-- Shiny Celestial Rim Highlight -->
          <path d="M 520,24 C 508,46 480,76 446,104" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" opacity="0.85" />
          <!-- Sharp Tip Sparkle -->
          <circle cx="522" cy="22" r="2.8" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'demon_horns': // Cuernitos de Gárgola / Demoníacos
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
          <!-- Jagged rock facet lines -->
          <path d="M 304,60 L 312,58 L 318,65" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <path d="M 312,90 L 322,86 L 328,94" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <!-- Glowing sharp horn apex -->
          <circle cx="310" cy="12" r="2.2" fill="#FEF08A" />
        </g>

        <!-- RIGHT OBSIDIAN HORN -->
        <g filter="url(#demonGlow)">
          <path d="M 434,122 C 452,105 464,80 468,52 C 470,32 464,15 458,12 C 454,18 448,46 436,80 C 428,100 420,114 418,122 Z" 
                fill="#18181B" stroke="#09090B" stroke-width="3.8" stroke-linejoin="round" />
          <!-- Magma fissure vein (glowing red-hot core) -->
          <path d="M 462,25 Q 456,52 450,78 Q 442,98 434,115" fill="none" stroke="#EF4444" stroke-width="2.8" stroke-linecap="round" />
          <path d="M 462,25 Q 456,52 450,78 Q 442,98 434,115" fill="none" stroke="#FEF08A" stroke-width="1.2" stroke-linecap="round" />
          <!-- Jagged rock facet lines -->
          <path d="M 464,60 L 456,58 L 450,65" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <path d="M 456,90 L 446,86 L 440,94" fill="none" stroke="#450A0A" stroke-width="1.8" />
          <!-- Glowing sharp horn apex -->
          <circle cx="458" cy="12" r="2.2" fill="#FEF08A" />
        </g>
      </g>`;
      break;

    case 'stag_antlers': // Astas de Ciervo Silvestre
      content = `
      <g id="race_stag_antlers">
        <defs>
          <filter id="natureAura" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#16A34A" flood-opacity="0.4" />
          </filter>
        </defs>

        <!-- LEFT ANTLER -->
        <g filter="url(#natureAura)">
          <!-- Main Trunk -->
          <path d="M 336,118 C 330,98 316,72 292,48 C 274,30 252,18 244,15 C 248,22 266,42 280,66 C 294,90 302,108 308,122 Z" 
                fill="#78350F" stroke="#451A03" stroke-width="3.2" stroke-linejoin="round" />
          <!-- Crown Tines (Branch 1) -->
          <path d="M 280,62 C 274,46 264,30 252,22 C 255,30 266,48 272,66 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <!-- Brow Tine (Branch 2) -->
          <path d="M 318,92 C 304,82 286,80 274,82 C 284,88 302,92 312,100 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <!-- Leaf & Flower Spirits -->
          <circle cx="244" cy="15" r="4" fill="#86EFAC" stroke="#15803D" stroke-width="1.2" />
          <circle cx="252" cy="22" r="3" fill="#BBF7D0" />
          <path d="M 274,54 Q 266,52 264,46 Q 272,46 276,52 Z" fill="#22C55E" />
          <path d="M 288,78 Q 282,74 278,68 Q 286,70 290,76 Z" fill="#22C55E" />
        </g>

        <!-- RIGHT ANTLER -->
        <g filter="url(#natureAura)">
          <!-- Main Trunk -->
          <path d="M 432,118 C 438,98 452,72 476,48 C 494,30 516,18 524,15 C 520,22 502,42 488,66 C 474,90 466,108 460,122 Z" 
                fill="#78350F" stroke="#451A03" stroke-width="3.2" stroke-linejoin="round" />
          <!-- Crown Tines (Branch 1) -->
          <path d="M 488,62 C 494,46 504,30 516,22 C 513,30 502,48 496,66 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <!-- Brow Tine (Branch 2) -->
          <path d="M 450,92 C 464,82 482,80 494,82 C 484,88 466,92 456,100 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.2" />
          <!-- Leaf & Flower Spirits -->
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

        <!-- LEFT ELVEN EAR (Elegantly sweeping from native ear canal x: 310, y: 198) -->
        <g filter="url(#elfEarShadow)">
          <path d="M 314,198 C 295,194 260,180 230,162 C 227,160 226,164 230,170 C 248,192 278,218 312,230 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3.2" stroke-linejoin="round" />
          <!-- Inner Concha / Cartilage Depth Shadow -->
          <path d="M 306,204 C 288,198 264,188 245,176 C 258,190 278,210 304,222 Z" fill="#9A3412" opacity="0.22" />
          <path d="M 312,202 C 298,198 275,188 256,180" fill="none" stroke="#9A3412" stroke-width="1.8" stroke-linecap="round" opacity="0.38" />

          <!-- Golden Aristocratic Ear-Cuff Jewelry -->
          <path d="M 268,184 Q 270,192 264,198" fill="none" stroke="#FACC15" stroke-width="2.6" stroke-linecap="round" />
          <circle cx="266" cy="191" r="2.2" fill="#FEF08A" />
          <polygon points="264,200 262,207 266,207" fill="#38BDF8" stroke="#0284C7" stroke-width="0.8" />
        </g>

        <!-- RIGHT ELVEN EAR (Sweeping from native ear canal x: 454, y: 198) -->
        <g filter="url(#elfEarShadow)">
          <path d="M 454,198 C 473,194 508,180 538,162 C 541,160 542,164 538,170 C 520,192 490,218 456,230 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3.2" stroke-linejoin="round" />
          <!-- Inner Concha / Cartilage Depth Shadow -->
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
        <!-- LEFT SHORT ELF EAR -->
        <g>
          <path d="M 315,198 C 300,194 274,184 255,172 C 253,170 253,174 257,180 C 270,198 295,216 314,226 Z" 
                fill="${skinHex}" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <path d="M 307,202 C 292,196 276,188 266,180 C 276,192 292,206 307,218 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="270" cy="194" r="2.2" fill="#FACC15" stroke="#713F12" stroke-width="0.8" />
        </g>

        <!-- RIGHT SHORT ELF EAR -->
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

        <!-- LEFT AQUATIC FIN -->
        <g filter="url(#waterGlow)">
          <path d="M 314,196 C 282,180 250,165 228,145 C 238,172 245,190 234,206 C 250,210 260,220 250,232 C 268,230 288,225 313,228 Z" 
                fill="url(#finCyanGrad)" stroke="#083344" stroke-width="2.8" stroke-linejoin="round" />
          <!-- Glowing Spine Rays -->
          <path d="M 313,205 Q 272,178 230,147" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 313,212 Q 276,196 236,207" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <path d="M 313,220 Q 286,222 253,233" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          <circle cx="232" cy="151" r="2.8" fill="#FFFFFF" opacity="0.9" />
        </g>

        <!-- RIGHT AQUATIC FIN -->
        <g filter="url(#waterGlow)">
          <path d="M 454,196 C 486,180 518,165 540,145 C 530,172 523,190 534,206 C 518,210 508,220 518,232 C 500,230 480,225 455,228 Z" 
                fill="url(#finCyanGrad)" stroke="#083344" stroke-width="2.8" stroke-linejoin="round" />
          <!-- Glowing Spine Rays -->
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

        <!-- LEFT WING PAIR (Behind left shoulder) -->
        <g filter="url(#fairyGlow)">
          <path d="M 310,340 C 260,300 200,240 160,210 C 165,240 190,310 230,350 C 265,385 295,370 310,340 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 160,210 Q 230,280 305,340" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.85" />
          <path d="M 295,360 C 260,375 210,390 185,415 C 205,420 250,410 280,390 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
        </g>

        <!-- RIGHT WING PAIR (Behind right shoulder) -->
        <g filter="url(#fairyGlow)">
          <path d="M 458,340 C 508,300 568,240 608,210 C 603,240 578,310 538,350 C 503,385 473,370 458,340 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 608,210 Q 538,280 463,340" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.85" />
          <path d="M 473,360 C 508,375 558,390 583,415 C 563,420 518,410 488,390 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
        </g>
      </g>`;
      break;

    case 'angel_halo': // Aureola Sagrada Flotante
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

    case 'crystal_crown': // Corona Rúnica de Cristal
      content = `
      <g id="race_crystal_crown" transform="translate(384, 135)">
        <defs>
          <filter id="crystalGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#38BDF8" flood-opacity="0.8" />
          </filter>
          <linearGradient id="crystalCentral" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#E0F2FE" />
            <stop offset="40%" stop-color="#38BDF8" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="crystalPurple" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F3E8FF" />
            <stop offset="50%" stop-color="#C084FC" />
            <stop offset="100%" stop-color="#7E22CE" />
          </linearGradient>
        </defs>

        <g filter="url(#crystalGlow)">
          <!-- Golden Tiara Circlet Band -->
          <path d="M -62,10 C -32,3 32,3 62,10" fill="none" stroke="#FACC15" stroke-width="2.8" stroke-linecap="round" />
          <!-- Central Spire Crystal -->
          <polygon points="0,-42 -9,-10 0,-15 9,-10" fill="url(#crystalCentral)" stroke="#0284C7" stroke-width="1.8" />
          <polygon points="0,-42 0,-15 9,-10" fill="#FFFFFF" opacity="0.4" />
          
          <!-- Flanking Purple Crystals -->
          <polygon points="-24,-32 -31,-6 -24,-11 -17,-6" fill="url(#crystalPurple)" stroke="#6B21A8" stroke-width="1.6" />
          <polygon points="24,-32 17,-6 24,-11 31,-6" fill="url(#crystalPurple)" stroke="#6B21A8" stroke-width="1.6" />
          
          <!-- Outer Cyan Crystals -->
          <polygon points="-48,-18 -54,0 -48,-4 -42,0" fill="url(#crystalCentral)" stroke="#0284C7" stroke-width="1.4" />
          <polygon points="48,-18 42,0 48,-4 54,0" fill="url(#crystalCentral)" stroke="#0284C7" stroke-width="1.4" />

          <!-- Center Gem Core -->
          <circle cx="0" cy="4" r="4" fill="#F43F5E" stroke="#881337" stroke-width="1.2" />
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
          <!-- Left Cheek Runes -->
          <path d="M 324,228 Q 338,235 348,225 M 326,236 Q 338,242 346,234" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-linecap="round" />
          <circle cx="352" cy="223" r="2" fill="#FFFFFF" />

          <!-- Right Cheek Runes -->
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
          
          <!-- Concentric Starlight Orb -->
          <circle cx="316" cy="38" r="10" fill="#00F0FF" opacity="0.35" />
          <circle cx="316" cy="38" r="7.5" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1.8" />
          <circle cx="314" cy="36" r="2.8" fill="#FFFFFF" />
          <!-- Orbital Energy Ring -->
          <ellipse cx="316" cy="38" rx="13" ry="4.5" fill="none" stroke="#FEF08A" stroke-width="1.4" transform="rotate(-25 316 38)" />
        </g>

        <!-- RIGHT ANTENNA -->
        <g filter="url(#antennaGlow)">
          <rect x="421" y="112" width="7" height="10" rx="2.5" fill="#334155" stroke="#0F172A" stroke-width="1.4" />
          <path d="M 425,114 Q 448,80 452,40" fill="none" stroke="#06B6D4" stroke-width="3.6" stroke-linecap="round" />
          <path d="M 425,114 Q 448,80 452,40" fill="none" stroke="#E0F2FE" stroke-width="1.6" stroke-linecap="round" />
          
          <!-- Concentric Starlight Orb -->
          <circle cx="452" cy="38" r="10" fill="#00F0FF" opacity="0.35" />
          <circle cx="452" cy="38" r="7.5" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1.8" />
          <circle cx="450" cy="36" r="2.8" fill="#FFFFFF" />
          <!-- Orbital Energy Ring -->
          <ellipse cx="452" cy="38" rx="13" ry="4.5" fill="none" stroke="#FEF08A" stroke-width="1.4" transform="rotate(25 452 38)" />
        </g>
      </g>`;
      break;

    default:
      content = '';
  }

  return `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

async function runTest() {
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
      const svg = getCalibratedRaceFeatureSvg(trait, g.hairHex, g.skinHex);
      const composited = await sharp(g.file)
        .composite([{ input: Buffer.from(svg) }])
        .png()
        .toBuffer();

      // Crop head & shoulders
      await sharp(composited)
        .extract({ left: 200, top: 0, width: 368, height: 380 })
        .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/calib_trait_${trait}_${g.key}.png`);
    }
  }
  console.log('Calibrated gallery generated for all 14 traits on male, female, neutral!');
}

runTest().catch(console.error);
