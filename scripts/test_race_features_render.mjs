import sharp from 'sharp';
import fs from 'fs';

// High-fidelity Anime Cel-Shaded Race Features

function getRaceFeatureSvg(featureId, hairHex = '#EC4899', skinHex = '#FCE7DF') {
  let content = '';

  switch (featureId) {
    case 'cat_ears': // Orejas de Gato / Kitsune
      content = `
      <g id="race_cat_ears">
        <defs>
          <!-- Soft glow & inner ear velvet gradients -->
          <linearGradient id="catInnerL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#F43F5E" />
            <stop offset="60%" stop-color="#FB7185" />
            <stop offset="100%" stop-color="#FDA4AF" />
          </linearGradient>
          <linearGradient id="catInnerR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F43F5E" />
            <stop offset="60%" stop-color="#FB7185" />
            <stop offset="100%" stop-color="#FDA4AF" />
          </linearGradient>
          <filter id="earShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#0F172A" flood-opacity="0.35" />
          </filter>
        </defs>

        <!-- LEFT CAT EAR -->
        <g filter="url(#earShadow)">
          <!-- Outer Ear Silhouette with Base Tufts (hair color matched) -->
          <path d="M 334,162 C 326,148 316,130 306,104 C 298,84 294,62 295,58 C 298,59 316,74 336,96 C 348,110 357,126 362,148 C 356,155 348,160 334,162 Z" fill="${hairHex}" stroke="#0F172A" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round" />
          
          <!-- Outer Ear Shadow Rim -->
          <path d="M 296,62 C 298,78 308,102 320,126 C 316,134 312,146 312,152 C 302,136 296,110 295,58 Z" fill="#0F172A" opacity="0.25" />

          <!-- Inner Ear Velvet Pink Basin -->
          <path d="M 304,112 C 299,86 300,72 302,70 C 308,76 322,94 336,114 C 344,126 348,138 348,142 C 340,146 322,146 304,112 Z" fill="url(#catInnerL)" stroke="#9F1239" stroke-width="1.8" />
          <path d="M 308,132 C 312,142 322,148 334,146 C 322,144 314,138 308,132 Z" fill="#881337" opacity="0.6" />

          <!-- Fluffy White Fur Tufts bursting from inside the ear -->
          <!-- Main lower tuft -->
          <path d="M 306,148 C 314,142 324,132 326,122 C 329,130 334,136 338,140 C 342,130 344,124 346,116 C 348,124 350,132 352,140 C 346,148 336,154 322,156 C 314,156 308,152 306,148 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <!-- Inner soft highlight tuft -->
          <path d="M 314,142 C 320,136 324,128 325,124 C 328,132 332,136 335,138" fill="none" stroke="#FDE2E4" stroke-width="2.5" stroke-linecap="round" />
          
          <!-- Tip accent fluff -->
          <path d="M 296,62 C 298,68 302,76 305,82 C 303,76 302,70 300,64 Z" fill="#FFFFFF" opacity="0.9" />
        </g>

        <!-- RIGHT CAT EAR -->
        <g filter="url(#earShadow)">
          <!-- Outer Ear Silhouette with Base Tufts (hair color matched) -->
          <path d="M 434,162 C 442,148 452,130 462,104 C 470,84 474,62 473,58 C 470,59 452,74 432,96 C 420,110 411,126 406,148 C 412,155 420,160 434,162 Z" fill="${hairHex}" stroke="#0F172A" stroke-width="4.2" stroke-linejoin="round" stroke-linecap="round" />
          
          <!-- Outer Ear Shadow Rim -->
          <path d="M 472,62 C 470,78 460,102 448,126 C 452,134 456,146 456,152 C 466,136 472,110 473,58 Z" fill="#0F172A" opacity="0.25" />

          <!-- Inner Ear Velvet Pink Basin -->
          <path d="M 464,112 C 469,86 468,72 466,70 C 460,76 446,94 432,114 C 424,126 420,138 420,142 C 428,146 446,146 464,112 Z" fill="url(#catInnerR)" stroke="#9F1239" stroke-width="1.8" />
          <path d="M 460,132 C 456,142 446,148 434,146 C 446,144 454,138 460,132 Z" fill="#881337" opacity="0.6" />

          <!-- Fluffy White Fur Tufts bursting from inside the ear -->
          <path d="M 462,148 C 454,142 444,132 442,122 C 439,130 434,136 430,140 C 426,130 424,124 422,116 C 420,124 418,132 416,140 C 422,148 432,154 446,156 C 454,156 460,152 462,148 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" stroke-linejoin="round" />
          <!-- Inner soft highlight tuft -->
          <path d="M 454,142 C 448,136 444,128 443,124 C 440,132 436,136 433,138" fill="none" stroke="#FDE2E4" stroke-width="2.5" stroke-linecap="round" />
          
          <!-- Tip accent fluff -->
          <path d="M 472,62 C 470,68 466,76 463,82 C 465,76 466,70 468,64 Z" fill="#FFFFFF" opacity="0.9" />
        </g>
      </g>`;
      break;

    case 'wolf_ears': // Lobo de las Tormentas
      content = `
      <g id="race_wolf_ears">
        <defs>
          <linearGradient id="wolfOuterL" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#1E293B" />
            <stop offset="40%" stop-color="#334155" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <linearGradient id="wolfOuterR" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#1E293B" />
            <stop offset="40%" stop-color="#334155" />
            <stop offset="100%" stop-color="#475569" />
          </linearGradient>
          <filter id="wolfGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#090D1A" flood-opacity="0.4" />
          </filter>
        </defs>

        <!-- LEFT WOLF EAR -->
        <g filter="url(#wolfGlow)">
          <path d="M 334,165 C 322,146 312,125 296,88 C 288,70 285,50 286,46 C 290,48 312,68 335,95 C 350,112 360,132 365,155 C 355,162 344,166 334,165 Z" fill="url(#wolfOuterL)" stroke="#090D1A" stroke-width="4.5" stroke-linejoin="round" />
          
          <!-- Dark Tip Shadow -->
          <path d="M 286,46 C 294,54 306,72 312,86 C 304,78 296,65 286,46 Z" fill="#0F172A" />

          <!-- Inner Slate Ear Basin -->
          <path d="M 298,96 C 294,76 295,64 297,62 C 304,70 318,88 332,108 C 342,122 348,136 348,145 C 336,150 318,142 298,96 Z" fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          
          <!-- Layered Jagged White Fluff -->
          <path d="M 298,146 C 308,138 322,124 326,110 C 330,122 336,130 342,136 C 344,124 348,116 352,104 C 354,116 355,128 356,138 C 348,150 334,158 318,160 C 308,160 300,154 298,146 Z" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round" />

          <!-- Silver Storm Hoops on Ear Edge -->
          <ellipse cx="290" cy="72" rx="4" ry="7" fill="none" stroke="#E2E8F0" stroke-width="3" transform="rotate(-30 290 72)" />
          <ellipse cx="290" cy="72" rx="2.5" ry="5.5" fill="none" stroke="#94A3B8" stroke-width="1.2" transform="rotate(-30 290 72)" />
          <ellipse cx="295" cy="90" rx="3.5" ry="6" fill="none" stroke="#E2E8F0" stroke-width="2.6" transform="rotate(-30 295 90)" />
        </g>

        <!-- RIGHT WOLF EAR -->
        <g filter="url(#wolfGlow)">
          <path d="M 434,165 C 446,146 456,125 472,88 C 480,70 483,50 482,46 C 478,48 456,68 433,95 C 418,112 408,132 403,155 C 413,162 424,166 434,165 Z" fill="url(#wolfOuterR)" stroke="#090D1A" stroke-width="4.5" stroke-linejoin="round" />
          
          <!-- Dark Tip Shadow -->
          <path d="M 482,46 C 474,54 462,72 456,86 C 464,78 472,65 482,46 Z" fill="#0F172A" />

          <!-- Inner Slate Ear Basin -->
          <path d="M 470,96 C 474,76 473,64 471,62 C 464,70 450,88 436,108 C 426,122 420,136 420,145 C 432,150 450,142 470,96 Z" fill="#64748B" stroke="#1E293B" stroke-width="1.8" />
          
          <!-- Layered Jagged White Fluff -->
          <path d="M 470,146 C 460,138 446,124 442,110 C 438,122 432,130 426,136 C 424,124 420,116 416,104 C 414,116 413,128 412,138 C 420,150 434,158 450,160 C 460,160 468,154 470,146 Z" fill="#F1F5F9" stroke="#0F172A" stroke-width="2.2" stroke-linejoin="round" />
        </g>
      </g>`;
      break;

    case 'bunny_ears': // Orejitas de Conejo Lunar
      content = `
      <g id="race_bunny_ears">
        <defs>
          <filter id="bunnyShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#0F172A" flood-opacity="0.3" />
          </filter>
          <linearGradient id="bunnyPink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#F472B6" />
            <stop offset="70%" stop-color="#FBCFE8" />
            <stop offset="100%" stop-color="#FDF2F8" />
          </linearGradient>
        </defs>

        <!-- LEFT BUNNY EAR (Erect & graceful) -->
        <g filter="url(#bunnyShadow)">
          <!-- Outer plush white body -->
          <path d="M 344,155 C 335,130 326,90 320,45 C 316,18 328,6 342,8 C 356,10 366,35 368,75 C 370,115 366,145 358,158 C 352,160 348,158 344,155 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4.2" stroke-linejoin="round" />
          <!-- Soft Rim Cel Shadow -->
          <path d="M 320,45 C 316,18 328,6 342,8 C 334,12 328,26 330,50 C 334,90 342,135 348,158 C 344,155 335,130 320,45 Z" fill="#E2E8F0" opacity="0.6" />
          <!-- Pink Velvet Core -->
          <path d="M 340,145 C 336,115 330,75 328,42 C 326,26 332,18 338,20 C 346,22 352,38 354,68 C 356,100 354,130 348,146 C 344,148 342,147 340,145 Z" fill="url(#bunnyPink)" stroke="#F472B6" stroke-width="1.5" />
          <!-- Base Fluff Puff -->
          <ellipse cx="350" cy="156" rx="14" ry="7" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
        </g>

        <!-- RIGHT BUNNY EAR (Playful forward tip fold) -->
        <g filter="url(#bunnyShadow)">
          <!-- Lower / middle ear body -->
          <path d="M 416,158 C 420,140 424,105 432,65 C 438,40 452,28 466,34 C 476,40 472,65 456,82 C 452,110 446,140 436,158 C 428,160 422,160 416,158 Z" fill="#FFFFFF" stroke="#0F172A" stroke-width="4.2" stroke-linejoin="round" />
          <!-- Pink Velvet Core -->
          <path d="M 426,148 C 428,125 434,95 440,68 C 444,52 452,44 458,48 C 462,54 456,70 446,84 C 442,112 436,135 432,148 Z" fill="url(#bunnyPink)" stroke="#F472B6" stroke-width="1.5" />
          <!-- Cute Curved Tip Fold (overlapping) -->
          <path d="M 452,28 C 466,34 476,40 472,65 C 464,55 452,50 442,54 C 446,40 448,32 452,28 Z" fill="#F1F5F9" stroke="#0F172A" stroke-width="3" stroke-linejoin="round" />
          <!-- Base Fluff Puff -->
          <ellipse cx="426" cy="156" rx="14" ry="7" fill="#FFFFFF" stroke="#0F172A" stroke-width="2" />
        </g>
      </g>`;
      break;

    case 'dragon_horns': // Cuernos de Dragón Dorado
      content = `
      <g id="race_dragon_horns">
        <defs>
          <linearGradient id="dragonGoldL" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stop-color="#92400E" />
            <stop offset="35%" stop-color="#D97706" />
            <stop offset="70%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#FDE047" />
          </linearGradient>
          <linearGradient id="dragonGoldR" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#92400E" />
            <stop offset="35%" stop-color="#D97706" />
            <stop offset="70%" stop-color="#F59E0B" />
            <stop offset="100%" stop-color="#FDE047" />
          </linearGradient>
          <filter id="dragonAura" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" flood-color="#F59E0B" flood-opacity="0.5" />
          </filter>
        </defs>

        <!-- LEFT DRAGON HORN (Sweeping back and outward) -->
        <g filter="url(#dragonAura)">
          <path d="M 336,160 C 315,148 290,132 270,110 C 255,92 245,68 250,56 C 256,62 278,90 310,120 C 330,138 348,150 354,162 Z" fill="url(#dragonGoldL)" stroke="#78350F" stroke-width="4.5" stroke-linejoin="round" />
          <!-- Sculpted Scale Ridges / Annuli -->
          <path d="M 262,75 Q 272,82 284,78" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <path d="M 276,96 Q 290,105 304,98" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
          <path d="M 294,118 Q 312,128 328,118" fill="none" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 314,140 Q 334,150 348,138" fill="none" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" />
          <!-- Shiny Celestial Rim Highlight -->
          <path d="M 252,58 C 265,82 295,115 330,145" fill="none" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
          <!-- Sharp Tip Sparkle -->
          <circle cx="250" cy="56" r="3" fill="#FFFFFF" />
        </g>

        <!-- RIGHT DRAGON HORN -->
        <g filter="url(#dragonAura)">
          <path d="M 432,160 C 453,148 478,132 498,110 C 513,92 523,68 518,56 C 512,62 490,90 458,120 C 438,138 420,150 414,162 Z" fill="url(#dragonGoldR)" stroke="#78350F" stroke-width="4.5" stroke-linejoin="round" />
          <!-- Sculpted Scale Ridges / Annuli -->
          <path d="M 506,75 Q 496,82 484,78" fill="none" stroke="#78350F" stroke-width="3" stroke-linecap="round" />
          <path d="M 492,96 Q 478,105 464,98" fill="none" stroke="#78350F" stroke-width="3.2" stroke-linecap="round" />
          <path d="M 474,118 Q 456,128 440,118" fill="none" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" />
          <path d="M 454,140 Q 434,150 420,138" fill="none" stroke="#78350F" stroke-width="3.5" stroke-linecap="round" />
          <!-- Shiny Celestial Rim Highlight -->
          <path d="M 516,58 C 503,82 473,115 438,145" fill="none" stroke="#FEF08A" stroke-width="2.5" stroke-linecap="round" opacity="0.9" />
          <!-- Sharp Tip Sparkle -->
          <circle cx="518" cy="56" r="3" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'demon_horns': // Cuernitos de Gárgola / Demoníacos
      content = `
      <g id="race_demon_horns">
        <defs>
          <filter id="magmaGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#DC2626" flood-opacity="0.8" />
          </filter>
        </defs>

        <!-- LEFT OBSIDIAN HORN -->
        <g filter="url(#magmaGlow)">
          <path d="M 338,165 C 318,145 304,118 300,85 C 298,62 306,42 312,38 C 316,46 322,78 335,115 C 344,138 352,155 354,165 Z" fill="#18181B" stroke="#09090B" stroke-width="4.2" stroke-linejoin="round" />
          <!-- Magma fissure vein (glowing red-hot core) -->
          <path d="M 306,55 Q 312,85 320,115 Q 330,138 338,158" fill="none" stroke="#EF4444" stroke-width="3.2" stroke-linecap="round" />
          <path d="M 306,55 Q 312,85 320,115 Q 330,138 338,158" fill="none" stroke="#FEF08A" stroke-width="1.4" stroke-linecap="round" />
          <!-- Jagged rock facet lines -->
          <path d="M 304,95 L 314,92 L 322,100" fill="none" stroke="#450A0A" stroke-width="2" />
          <path d="M 314,130 L 326,126 L 334,134" fill="none" stroke="#450A0A" stroke-width="2" />
          <!-- Glowing sharp horn apex -->
          <circle cx="312" cy="38" r="2.5" fill="#FEF08A" />
        </g>

        <!-- RIGHT OBSIDIAN HORN -->
        <g filter="url(#magmaGlow)">
          <path d="M 430,165 C 450,145 464,118 468,85 C 470,62 462,42 456,38 C 452,46 446,78 433,115 C 424,138 416,155 414,165 Z" fill="#18181B" stroke="#09090B" stroke-width="4.2" stroke-linejoin="round" />
          <!-- Magma fissure vein (glowing red-hot core) -->
          <path d="M 462,55 Q 456,85 448,115 Q 438,138 430,158" fill="none" stroke="#EF4444" stroke-width="3.2" stroke-linecap="round" />
          <path d="M 462,55 Q 456,85 448,115 Q 438,138 430,158" fill="none" stroke="#FEF08A" stroke-width="1.4" stroke-linecap="round" />
          <!-- Jagged rock facet lines -->
          <path d="M 464,95 L 454,92 L 446,100" fill="none" stroke="#450A0A" stroke-width="2" />
          <path d="M 454,130 L 442,126 L 434,134" fill="none" stroke="#450A0A" stroke-width="2" />
          <!-- Glowing sharp horn apex -->
          <circle cx="456" cy="38" r="2.5" fill="#FEF08A" />
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
          <path d="M 340,158 C 334,135 320,105 295,78 C 275,56 250,42 240,38 C 244,46 265,68 280,95 C 295,122 305,145 310,162 Z" fill="#78350F" stroke="#451A03" stroke-width="3.5" stroke-linejoin="round" />
          <!-- Crown Tines (Branch 1) -->
          <path d="M 282,90 C 276,72 264,54 252,46 C 255,54 268,76 274,96 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.5" />
          <!-- Brow Tine (Branch 2) -->
          <path d="M 322,125 C 305,115 285,112 270,115 C 282,122 304,126 316,136 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.5" />
          <!-- Leaf & Flower Spirits -->
          <circle cx="240" cy="38" r="4.5" fill="#86EFAC" stroke="#15803D" stroke-width="1.5" />
          <circle cx="252" cy="46" r="3.5" fill="#BBF7D0" />
          <path d="M 276,82 Q 268,80 266,74 Q 274,74 278,80 Z" fill="#22C55E" />
          <path d="M 290,110 Q 284,106 280,100 Q 288,102 292,108 Z" fill="#22C55E" />
        </g>

        <!-- RIGHT ANTLER -->
        <g filter="url(#natureAura)">
          <!-- Main Trunk -->
          <path d="M 428,158 C 434,135 448,105 473,78 C 493,56 518,42 528,38 C 524,46 503,68 488,95 C 473,122 463,145 458,162 Z" fill="#78350F" stroke="#451A03" stroke-width="3.5" stroke-linejoin="round" />
          <!-- Crown Tines (Branch 1) -->
          <path d="M 486,90 C 492,72 504,54 516,46 C 513,54 500,76 494,96 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.5" />
          <!-- Brow Tine (Branch 2) -->
          <path d="M 446,125 C 463,115 483,112 498,115 C 486,122 464,126 452,136 Z" fill="#854D0E" stroke="#451A03" stroke-width="2.5" />
          <!-- Leaf & Flower Spirits -->
          <circle cx="528" cy="38" r="4.5" fill="#86EFAC" stroke="#15803D" stroke-width="1.5" />
          <circle cx="516" cy="46" r="3.5" fill="#BBF7D0" />
          <path d="M 492,82 Q 500,80 502,74 Q 494,74 490,80 Z" fill="#22C55E" />
          <path d="M 478,110 Q 484,106 488,100 Q 480,102 476,108 Z" fill="#22C55E" />
        </g>
      </g>`;
      break;

    case 'elf_long': // Elfo Boreal (Largas)
      content = `
      <g id="race_elf_long">
        <defs>
          <filter id="elfEarShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.2" />
          </filter>
        </defs>

        <!-- LEFT ELVEN EAR (Elegantly sweeping pointed ear) -->
        <g filter="url(#elfEarShadow)">
          <!-- Base Ear Structure (Skin Tone matched) -->
          <path d="M 326,192 C 305,188 268,172 238,154 C 235,152 234,156 238,162 C 255,186 288,214 324,226 Z" fill="${skinHex}" stroke="#0F172A" stroke-width="3.5" stroke-linejoin="round" />
          
          <!-- Inner Concha / Cartilage Depth Shadow -->
          <path d="M 318,198 C 298,192 272,180 252,168 C 265,184 288,206 316,218 Z" fill="#9A3412" opacity="0.22" />
          <!-- Delicate Tragus / Helix fold -->
          <path d="M 324,196 C 310,192 285,182 265,172" fill="none" stroke="#9A3412" stroke-width="2" stroke-linecap="round" opacity="0.4" />

          <!-- Golden Aristocratic Ear-Cuff Jewelry -->
          <path d="M 276,176 Q 278,185 272,192" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" />
          <circle cx="274" cy="184" r="2.5" fill="#FEF08A" />
          <polygon points="272,194 270,202 274,202" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
        </g>

        <!-- RIGHT ELVEN EAR -->
        <g filter="url(#elfEarShadow)">
          <!-- Base Ear Structure (Skin Tone matched) -->
          <path d="M 442,192 C 463,188 500,172 530,154 C 533,152 534,156 530,162 C 513,186 480,214 444,226 Z" fill="${skinHex}" stroke="#0F172A" stroke-width="3.5" stroke-linejoin="round" />
          
          <!-- Inner Concha / Cartilage Depth Shadow -->
          <path d="M 450,198 C 470,192 496,180 516,168 C 503,184 480,206 452,218 Z" fill="#9A3412" opacity="0.22" />
          <!-- Delicate Tragus / Helix fold -->
          <path d="M 444,196 C 458,192 483,182 503,172" fill="none" stroke="#9A3412" stroke-width="2" stroke-linecap="round" opacity="0.4" />

          <!-- Golden Aristocratic Ear-Cuff Jewelry -->
          <path d="M 492,176 Q 490,185 496,192" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" />
          <circle cx="494" cy="184" r="2.5" fill="#FEF08A" />
          <polygon points="496,194 498,202 494,202" fill="#38BDF8" stroke="#0284C7" stroke-width="1" />
        </g>
      </g>`;
      break;

    case 'elf_short': // Elfo Ágil (Cortas)
      content = `
      <g id="race_elf_short">
        <!-- LEFT SHORT ELF EAR -->
        <g>
          <path d="M 326,194 C 310,190 282,180 262,168 C 260,166 260,170 264,176 C 278,195 304,215 325,224 Z" fill="${skinHex}" stroke="#0F172A" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 318,198 C 302,192 284,184 274,176 C 284,190 302,205 318,216 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="280" cy="192" r="2.5" fill="#FACC15" stroke="#713F12" stroke-width="1" />
        </g>

        <!-- RIGHT SHORT ELF EAR -->
        <g>
          <path d="M 442,194 C 458,190 486,180 506,168 C 508,166 508,170 504,176 C 490,195 464,215 443,224 Z" fill="${skinHex}" stroke="#0F172A" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 450,198 C 466,192 484,184 494,176 C 484,190 466,205 450,216 Z" fill="#9A3412" opacity="0.2" />
          <circle cx="488" cy="192" r="2.5" fill="#FACC15" stroke="#713F12" stroke-width="1" />
        </g>
      </g>`;
      break;

    case 'merfolk_fins': // Aletas Acuáticas de Sirena
      content = `
      <g id="race_merfolk_fins">
        <defs>
          <linearGradient id="finCyan" x1="0" y1="0" x2="1" y2="1">
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
          <path d="M 325,190 C 290,175 255,160 232,138 C 242,168 250,188 238,205 C 255,208 266,218 255,232 C 275,230 295,225 324,228 Z" fill="url(#finCyan)" stroke="#083344" stroke-width="3" stroke-linejoin="round" />
          <!-- Glowing Spine Rays -->
          <path d="M 324,205 Q 280,175 234,140" fill="none" stroke="#E0F2FE" stroke-width="2.5" stroke-linecap="round" />
          <path d="M 324,212 Q 285,195 240,206" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 324,220 Q 295,222 258,233" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <!-- Water pearls -->
          <circle cx="236" cy="144" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="242" cy="208" r="2.5" fill="#FFFFFF" opacity="0.9" />
        </g>

        <!-- RIGHT AQUATIC FIN -->
        <g filter="url(#waterGlow)">
          <path d="M 443,190 C 478,175 513,160 536,138 C 526,168 518,188 530,205 C 513,208 502,218 513,232 C 493,230 473,225 444,228 Z" fill="url(#finCyan)" stroke="#083344" stroke-width="3" stroke-linejoin="round" />
          <!-- Glowing Spine Rays -->
          <path d="M 444,205 Q 488,175 534,140" fill="none" stroke="#E0F2FE" stroke-width="2.5" stroke-linecap="round" />
          <path d="M 444,212 Q 483,195 528,206" fill="none" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round" />
          <path d="M 444,220 Q 473,222 510,233" fill="none" stroke="#E0F2FE" stroke-width="2" stroke-linecap="round" />
          <!-- Water pearls -->
          <circle cx="532" cy="144" r="3" fill="#FFFFFF" opacity="0.9" />
          <circle cx="526" cy="208" r="2.5" fill="#FFFFFF" opacity="0.9" />
        </g>
      </g>`;
      break;

    case 'fairy_wings': // Alas Minis de Hada
      content = `
      <g id="race_fairy_wings">
        <defs>
          <linearGradient id="fairyWingGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#A7F3D0" stop-opacity="0.8" />
            <stop offset="50%" stop-color="#67E8F9" stop-opacity="0.7" />
            <stop offset="100%" stop-color="#C4B5FD" stop-opacity="0.6" />
          </linearGradient>
          <filter id="fairyGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="7" flood-color="#67E8F9" flood-opacity="0.8" />
          </filter>
        </defs>

        <!-- LEFT WING PAIR (Floating behind left shoulder) -->
        <g filter="url(#fairyGlow)">
          <!-- Upper Large Wing -->
          <path d="M 310,340 C 260,300 200,240 160,210 C 165,240 190,310 230,350 C 265,385 295,370 310,340 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 160,210 Q 230,280 305,340" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.8" />
          <!-- Lower Small Wing -->
          <path d="M 295,360 C 260,375 210,390 185,415 C 205,420 250,410 280,390 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
        </g>

        <!-- RIGHT WING PAIR (Floating behind right shoulder) -->
        <g filter="url(#fairyGlow)">
          <!-- Upper Large Wing -->
          <path d="M 458,340 C 508,300 568,240 608,210 C 603,240 578,310 538,350 C 503,385 473,370 458,340 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2.5" />
          <path d="M 608,210 Q 538,280 463,340" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.8" />
          <!-- Lower Small Wing -->
          <path d="M 473,360 C 508,375 558,390 583,415 C 563,420 518,410 488,390 Z" fill="url(#fairyWingGrad)" stroke="#0284C7" stroke-width="2" />
        </g>
      </g>`;
      break;

    case 'angel_halo': // Aureola Sagrada Flotante
      content = `
      <g id="race_angel_halo" transform="translate(384, 60)">
        <defs>
          <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#FACC15" flood-opacity="0.9" />
          </filter>
        </defs>
        <!-- Outer Divine Aura -->
        <g filter="url(#haloGlow)">
          <ellipse cx="0" cy="0" rx="85" ry="22" fill="none" stroke="#FEF08A" stroke-width="8" opacity="0.4" />
          <!-- Main Golden Ring -->
          <ellipse cx="0" cy="0" rx="80" ry="20" fill="none" stroke="#FBBF24" stroke-width="6.5" />
          <!-- Brilliant White Core -->
          <ellipse cx="0" cy="0" rx="80" ry="20" fill="none" stroke="#FFFFFF" stroke-width="2.5" />
          <!-- Star sparkle glints on the ring -->
          <polygon points="-55,-12 -53,-7 -48,-5 -53,-3 -55,2 -57,-3 -62,-5 -57,-7" fill="#FFFFFF" />
          <polygon points="55,12 57,7 62,5 57,3 55,-2 53,3 48,5 53,7" fill="#FFFFFF" />
        </g>
      </g>`;
      break;

    case 'crystal_crown': // Corona Rúnica de Cristal
      content = `
      <g id="race_crystal_crown" transform="translate(384, 130)">
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
          <path d="M -65,12 C -35,5 35,5 65,12" fill="none" stroke="#FACC15" stroke-width="3" stroke-linecap="round" />
          <!-- Central Spire Crystal -->
          <polygon points="0,-48 -10,-12 0,-18 10,-12" fill="url(#crystalCentral)" stroke="#0284C7" stroke-width="2" />
          <polygon points="0,-48 0,-18 10,-12" fill="#FFFFFF" opacity="0.4" />
          
          <!-- Flanking Purple Crystals -->
          <polygon points="-26,-36 -34,-6 -26,-12 -18,-6" fill="url(#crystalPurple)" stroke="#6B21A8" stroke-width="1.8" />
          <polygon points="26,-36 18,-6 26,-12 34,-6" fill="url(#crystalPurple)" stroke="#6B21A8" stroke-width="1.8" />
          
          <!-- Outer Cyan Crystals -->
          <polygon points="-52,-20 -58,0 -52,-5 -46,0" fill="url(#crystalCentral)" stroke="#0284C7" stroke-width="1.5" />
          <polygon points="52,-20 46,0 52,-5 58,0" fill="url(#crystalCentral)" stroke="#0284C7" stroke-width="1.5" />

          <!-- Center Gem Core -->
          <circle cx="0" cy="5" r="4.5" fill="#F43F5E" stroke="#881337" stroke-width="1.5" />
        </g>
      </g>`;
      break;

    case 'rune_tattoo': // Tatuajes Rúnicos Faciales
      content = `
      <g id="race_rune_tattoo">
        <defs>
          <filter id="runeGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#00F0FF" flood-opacity="0.85" />
          </filter>
        </defs>

        <g filter="url(#runeGlow)">
          <!-- Left Cheek Runes -->
          <path d="M 324,228 Q 338,235 348,225 M 326,236 Q 338,242 346,234" fill="none" stroke="#00F0FF" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="352" cy="223" r="2.2" fill="#FFFFFF" />

          <!-- Right Cheek Runes -->
          <path d="M 444,228 Q 430,235 420,225 M 442,236 Q 430,242 422,234" fill="none" stroke="#00F0FF" stroke-width="2.4" stroke-linecap="round" />
          <circle cx="416" cy="223" r="2.2" fill="#FFFFFF" />

          <!-- Forehead Third-Eye Diamond Rune -->
          <polygon points="384,154 388,162 384,170 380,162" fill="#00F0FF" stroke="#FFFFFF" stroke-width="1.2" />
          <circle cx="384" cy="162" r="1.8" fill="#FFFFFF" />
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
          <!-- Sleek metallic base -->
          <rect x="340" y="145" width="8" height="12" rx="3" fill="#334155" stroke="#0F172A" stroke-width="1.5" />
          <!-- Curving flexible energy stem -->
          <path d="M 344,146 Q 320,110 316,70" fill="none" stroke="#06B6D4" stroke-width="4" stroke-linecap="round" />
          <path d="M 344,146 Q 320,110 316,70" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          
          <!-- Concentric Starlight Orb -->
          <circle cx="316" cy="68" r="11" fill="#00F0FF" opacity="0.35" />
          <circle cx="316" cy="68" r="8" fill="#00F0FF" stroke="#FFFFFF" stroke-width="2" />
          <circle cx="314" cy="66" r="3" fill="#FFFFFF" />
          <!-- Orbital Energy Ring -->
          <ellipse cx="316" cy="68" rx="14" ry="5" fill="none" stroke="#FEF08A" stroke-width="1.5" transform="rotate(-25 316 68)" />
        </g>

        <!-- RIGHT ANTENNA -->
        <g filter="url(#antennaGlow)">
          <!-- Sleek metallic base -->
          <rect x="420" y="145" width="8" height="12" rx="3" fill="#334155" stroke="#0F172A" stroke-width="1.5" />
          <!-- Curving flexible energy stem -->
          <path d="M 424,146 Q 448,110 452,70" fill="none" stroke="#06B6D4" stroke-width="4" stroke-linecap="round" />
          <path d="M 424,146 Q 448,110 452,70" fill="none" stroke="#E0F2FE" stroke-width="1.8" stroke-linecap="round" />
          
          <!-- Concentric Starlight Orb -->
          <circle cx="452" cy="68" r="11" fill="#00F0FF" opacity="0.35" />
          <circle cx="452" cy="68" r="8" fill="#00F0FF" stroke="#FFFFFF" stroke-width="2" />
          <circle cx="450" cy="66" r="3" fill="#FFFFFF" />
          <!-- Orbital Energy Ring -->
          <ellipse cx="452" cy="68" rx="14" ry="5" fill="none" stroke="#FEF08A" stroke-width="1.5" transform="rotate(25 452 68)" />
        </g>
      </g>`;
      break;

    default:
      content = '';
  }

  return `<svg width="768" height="1376" viewBox="0 0 768 1376" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}

async function renderGallery() {
  const traits = [
    'cat_ears', 'wolf_ears', 'bunny_ears', 'dragon_horns', 
    'demon_horns', 'stag_antlers', 'elf_long', 'elf_short', 
    'merfolk_fins', 'fairy_wings', 'angel_halo', 'crystal_crown', 
    'rune_tattoo', 'cosmic_antennae'
  ];

  // Test on Male, Female and Neutral
  const genders = [
    { key: 'female', file: 'public/images/avatar/trainer_female_clean.png', hairHex: '#EC4899', skinHex: '#FDE2E4' },
    { key: 'male', file: 'public/images/avatar/trainer_base_clean.png', hairHex: '#BE185D', skinHex: '#FCE7DF' },
    { key: 'neutral', file: 'public/images/avatar/trainer_neutral_clean.png', hairHex: '#38BDF8', skinHex: '#FCE7DF' }
  ];

  for (const trait of traits) {
    for (const g of genders) {
      const svg = getRaceFeatureSvg(trait, g.hairHex, g.skinHex);
      const composited = await sharp(g.file)
        .composite([{ input: Buffer.from(svg) }])
        .png()
        .toBuffer();

      // Crop head & shoulders
      await sharp(composited)
        .extract({ left: 200, top: 20, width: 368, height: 360 })
        .toFile(`C:/Users/kami-/.gemini/antigravity-ide/brain/c907be6c-9aff-4820-ae93-5384ee91b324/preview_trait_${trait}_${g.key}.png`);
    }
    console.log(`Rendered trait: ${trait} for all 3 genders`);
  }
}

renderGallery().catch(console.error);
