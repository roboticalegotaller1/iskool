import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\kami-\\.gemini\\antigravity-ide\\brain\\c907be6c-9aff-4820-ae93-5384ee91b324';

function getTopSvg(topId, gender, skinHex = '#FED7AA') {
  const isFemale = gender === 'female';
  const isNeutral = gender === 'neutral';

  // Torso base path adaptado anatómicamente a los 3 géneros
  const torsoPath = isFemale
    ? `M 334,272 C 308,284 270,305 252,322 C 244,355 244,400 284,442 C 290,480 300,530 286,575 L 268,642 Q 384,646 500,642 L 482,575 C 468,530 478,480 484,442 C 524,400 524,355 516,322 C 498,305 460,284 434,272 Q 384,330 334,272 Z`
    : isNeutral
    ? `M 330,268 C 304,282 264,302 244,320 C 234,355 234,400 282,445 C 286,480 292,530 282,580 L 266,644 Q 384,648 502,644 L 486,580 C 476,530 482,480 486,445 C 534,400 534,355 524,320 C 504,302 464,282 438,268 Q 384,330 330,268 Z`
    : `M 330,268 C 304,282 264,302 242,320 C 232,355 232,400 282,445 C 286,480 292,530 282,580 L 266,644 Q 384,648 502,644 L 486,580 C 476,530 482,480 486,445 C 536,400 536,355 526,320 C 504,302 464,282 438,268 Q 384,330 330,268 Z`;

  // Mangas cortas ajustadas exactamente a la curvatura exterior del brazo
  const sleeveLeftPath = isFemale
    ? `M 276,302 C 255,312 240,342 236,380 C 234,405 236,424 242,438 L 284,444 C 284,410 282,370 280,318 Z`
    : `M 276,302 C 252,312 234,342 228,382 C 226,408 228,426 234,444 L 284,448 C 284,410 282,370 280,318 Z`;

  const sleeveRightPath = isFemale
    ? `M 492,302 C 514,312 530,342 536,380 C 538,405 536,424 530,438 L 484,444 C 484,410 486,370 488,318 Z`
    : `M 492,302 C 516,312 538,342 546,382 C 548,408 546,426 540,444 L 484,448 C 484,410 486,370 488,318 Z`;

  switch (topId) {
    case 'top_basic': // Playera Básica de Algodón
      return `
        <g id="top_basic_layer">
          <defs>
            <linearGradient id="basicWhiteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="55%" stop-color="#F8FAFC" />
              <stop offset="100%" stop-color="#E2E8F0" />
            </linearGradient>
            <filter id="topShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.25" />
            </filter>
          </defs>
          <g filter="url(#topShadow)">
            <!-- Mangas cortas ceñidas -->
            <path d="${sleeveLeftPath}" fill="url(#basicWhiteGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round" />
            <path d="${sleeveRightPath}" fill="url(#basicWhiteGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round" />
            <line x1="${isFemale ? 242 : 234}" y1="${isFemale ? 438 : 444}" x2="284" y2="${isFemale ? 444 : 448}" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="5,4" />
            <line x1="${isFemale ? 530 : 540}" y1="${isFemale ? 438 : 444}" x2="484" y2="${isFemale ? 444 : 448}" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="5,4" />

            <!-- Cuerpo del torso -->
            <path d="${torsoPath}" fill="url(#basicWhiteGrad)" stroke="#1E293B" stroke-width="3.2" stroke-linejoin="round" />
            
            <!-- Sombras anatómicas de oclusión lateral -->
            <path d="M 284,445 C 286,490 292,540 282,580 L 268,642 L 285,642 L 298,580 C 304,540 298,490 296,445 Z" fill="#CBD5E1" opacity="0.6" />
            <path d="M 484,445 C 482,490 476,540 486,580 L 500,642 L 483,642 L 470,580 C 464,540 470,490 472,445 Z" fill="#CBD5E1" opacity="0.6" />
            
            <!-- Pliegues de cintura y cadera -->
            <path d="M 310,590 Q 384,606 458,590" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round" />
            <path d="M 302,618 Q 384,632 466,618" fill="none" stroke="#94A3B8" stroke-width="2" stroke-linecap="round" />
            
            ${isFemale ? `
              <!-- Pliegues y realce de busto femenino -->
              <path d="M 322,430 Q 350,452 376,432" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.65" />
              <path d="M 446,430 Q 418,452 392,432" fill="none" stroke="#94A3B8" stroke-width="2.5" stroke-linecap="round" opacity="0.65" />
            ` : `
              <!-- Definición de pectorales masculinos / atléticos -->
              <path d="M 315,410 Q 350,425 380,412" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round" opacity="0.5" />
              <path d="M 453,410 Q 418,425 388,412" fill="none" stroke="#94A3B8" stroke-width="2.2" stroke-linecap="round" opacity="0.5" />
            `}
            
            <!-- Costura y elástico de cuello redondo -->
            <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="#94A3B8" stroke-width="8.5" stroke-linecap="round" />
            <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="#F8FAFC" stroke-width="5" stroke-linecap="round" />
            <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="#334155" stroke-width="1.6" stroke-dasharray="4,3" stroke-linecap="round" />
          </g>
        </g>
      `;

    case 'top_school_blouse': // Camisa Escolar con Corbata/Lazo
      return `
        <g id="top_school_blouse_layer">
          <defs>
            <linearGradient id="blouseWhiteGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="65%" stop-color="#F8FAFC" />
              <stop offset="100%" stop-color="#E2E8F0" />
            </linearGradient>
            <linearGradient id="tieRedGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#DC2626" />
              <stop offset="50%" stop-color="#B91C1C" />
              <stop offset="100%" stop-color="#991B1B" />
            </linearGradient>
            <filter id="schoolShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.3" />
            </filter>
          </defs>
          <g filter="url(#schoolShadow)">
            <!-- Mangas cortas de camisa -->
            <path d="${sleeveLeftPath}" fill="url(#blouseWhiteGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round" />
            <path d="${sleeveRightPath}" fill="url(#blouseWhiteGrad)" stroke="#1E293B" stroke-width="3" stroke-linejoin="round" />
            <line x1="${isFemale ? 242 : 234}" y1="${isFemale ? 438 : 444}" x2="284" y2="${isFemale ? 444 : 448}" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="5,4" />
            <line x1="${isFemale ? 530 : 540}" y1="${isFemale ? 438 : 444}" x2="484" y2="${isFemale ? 444 : 448}" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="5,4" />

            <!-- Cuerpo de la camisa blanca -->
            <path d="${torsoPath}" fill="url(#blouseWhiteGrad)" stroke="#1E293B" stroke-width="3.2" stroke-linejoin="round" />
            
            <!-- Relleno interior de cuello para tapar playera negra original -->
            <polygon points="${isFemale ? 334 : 330},${isFemale ? 272 : 268} 384,335 ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="#FFFFFF" />

            <!-- Solapa central con botones de nácar -->
            <line x1="384" y1="330" x2="384" y2="642" stroke="#1E293B" stroke-width="2" />
            <circle cx="384" cy="400" r="3.2" fill="#F8FAFC" stroke="#64748B" stroke-width="1.4" />
            <circle cx="384" cy="460" r="3.2" fill="#F8FAFC" stroke="#64748B" stroke-width="1.4" />
            <circle cx="384" cy="520" r="3.2" fill="#F8FAFC" stroke="#64748B" stroke-width="1.4" />
            <circle cx="384" cy="580" r="3.2" fill="#F8FAFC" stroke="#64748B" stroke-width="1.4" />

            <!-- Bolsillo en el pecho izquierdo con insignia ISkool -->
            <path d="M 425,390 L 465,390 L 465,435 Q 445,450 425,435 Z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.8" />
            <rect x="435" y="405" width="20" height="15" rx="3" fill="#F59E0B" />
            <text x="445" y="416" fill="#1E1B4B" font-size="9" font-weight="900" text-anchor="middle" font-family="sans-serif">IS</text>
            
            <!-- Cuello camisero estructurado -->
            <polygon points="${isFemale ? 334 : 330},${isFemale ? 272 : 268} 384,338 370,332 344,275" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5" />
            <polygon points="${isFemale ? 434 : 438},${isFemale ? 272 : 268} 384,338 398,332 424,275" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.5" />

            ${isFemale ? `
              <!-- Lazo Colegial Femenino de Gala -->
              <polygon points="384,342 360,370 376,372 384,356" fill="url(#tieRedGrad)" stroke="#7F1D1D" stroke-width="2" />
              <polygon points="384,342 408,370 392,372 384,356" fill="url(#tieRedGrad)" stroke="#7F1D1D" stroke-width="2" />
              <path d="M 376,372 L 366,480 L 380,470 L 384,356" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1.8" />
              <path d="M 392,372 L 402,480 L 388,470 L 384,356" fill="#B91C1C" stroke="#7F1D1D" stroke-width="1.8" />
              <!-- Broche dorado central de la academia -->
              <circle cx="384" cy="348" r="7" fill="#F59E0B" stroke="#B45309" stroke-width="2" />
              <circle cx="384" cy="348" r="3.5" fill="#FEF08A" />
            ` : `
              <!-- Corbata Formal Clásica Windsor -->
              <polygon points="376,340 392,340 395,356 384,360 373,356" fill="#991B1B" stroke="#7F1D1D" stroke-width="2" />
              <polygon points="376,356 392,356 398,490 384,525 370,490" fill="url(#tieRedGrad)" stroke="#7F1D1D" stroke-width="2.2" />
              <!-- Alfiler / Pasador de corbata dorado -->
              <line x1="376" y1="420" x2="396" y2="420" stroke="#FACC15" stroke-width="3" stroke-linecap="round" />
            `}
          </g>
        </g>
      `;

    case 'top_athletic_tank': // Camiseta Atlética de Entrenamiento
      return `
        <g id="top_athletic_tank_layer">
          <defs>
            <linearGradient id="tankSlateGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#334155" />
              <stop offset="50%" stop-color="#1E293B" />
              <stop offset="100%" stop-color="#0F172A" />
            </linearGradient>
            <filter id="tankShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0F172A" flood-opacity="0.35" />
            </filter>
          </defs>

          <!-- 1. Cobertura de hombros/brazos con PIEL ANATÓMICA para borrar mangas negras -->
          <path d="${sleeveLeftPath}" fill="${skinHex}" stroke="#09090B" stroke-width="2.5" />
          <path d="${sleeveRightPath}" fill="${skinHex}" stroke="#09090B" stroke-width="2.5" />
          <path d="M 276,302 C 255,312 240,342 236,380" fill="none" stroke="#9A3412" stroke-width="2.2" opacity="0.3" stroke-linecap="round" />
          <path d="M 492,302 C 514,312 530,342 536,380" fill="none" stroke="#9A3412" stroke-width="2.2" opacity="0.3" stroke-linecap="round" />

          <!-- Cuello de piel para cubrir cuello negro de playera base -->
          <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,330 ${isFemale ? 434 : 438},${isFemale ? 272 : 268} L ${isFemale ? 434 : 438},300 Q 384,352 ${isFemale ? 334 : 330},300 Z" fill="${skinHex}" />

          <!-- 2. Top Deportivo Ajustado sin mangas -->
          <g filter="url(#tankShadow)">
            <path d="M 322,305 C 304,318 296,350 294,400 C 294,425 292,444 284,445 C 288,485 296,535 284,580 L 268,642 Q 384,646 500,642 L 484,580 C 472,535 480,485 484,445 C 476,444 474,425 474,400 C 472,350 464,318 446,305 Q 384,358 322,305 Z" 
                  fill="url(#tankSlateGrad)" stroke="#09090B" stroke-width="3.2" stroke-linejoin="round" />
            
            <!-- Ribete verde lima de alto rendimiento en escote y sisas -->
            <path d="M 322,305 Q 384,358 446,305" fill="none" stroke="#84CC16" stroke-width="4.5" stroke-linecap="round" />
            <path d="M 322,305 C 304,318 296,350 294,400 C 294,425 292,444 284,445" fill="none" stroke="#84CC16" stroke-width="4" stroke-linecap="round" />
            <path d="M 446,305 C 464,318 472,350 474,400 C 474,425 476,444 484,445" fill="none" stroke="#84CC16" stroke-width="4" stroke-linecap="round" />

            <!-- Paneles laterales de compresión y transpirabilidad -->
            <path d="M 284,445 C 288,490 296,540 284,580 L 268,642 L 284,642 L 296,580 C 304,540 296,490 294,445 Z" fill="#020617" opacity="0.6" />
            <path d="M 484,445 C 480,490 472,540 484,580 L 500,642 L 484,642 L 472,580 C 464,540 472,490 474,445 Z" fill="#020617" opacity="0.6" />

            <!-- Emblema atlético minimalista en el pecho -->
            <polygon points="384,380 376,394 384,390 392,394" fill="#84CC16" />
            <polygon points="384,395 378,405 384,402 390,405" fill="#22C55E" />
          </g>
        </g>
      `;

    case 'top_rune_tshirt': // Playera Rúnica del Gremio
      return `
        <g id="top_rune_tshirt_layer">
          <defs>
            <linearGradient id="runeBlackGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0F172A" />
              <stop offset="50%" stop-color="#1E1B4B" />
              <stop offset="100%" stop-color="#0B0F19" />
            </linearGradient>
            <filter id="runeChestGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#00F0FF" flood-opacity="0.85" />
            </filter>
          </defs>
          <path d="${sleeveLeftPath}" fill="url(#runeBlackGrad)" stroke="#09090B" stroke-width="3" stroke-linejoin="round" />
          <path d="${sleeveRightPath}" fill="url(#runeBlackGrad)" stroke="#09090B" stroke-width="3" stroke-linejoin="round" />
          <path d="${torsoPath}" fill="url(#runeBlackGrad)" stroke="#09090B" stroke-width="3.2" stroke-linejoin="round" />
          
          <!-- Cuello con ribete índigo -->
          <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="#4338CA" stroke-width="8" stroke-linecap="round" />
          <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="#00F0FF" stroke-width="2.5" stroke-linecap="round" />

          <!-- Gran Emblema Rúnico Místico del Gremio de ISkool -->
          <g filter="url(#runeChestGlow)" transform="translate(384, 440)">
            <circle cx="0" cy="0" r="52" fill="none" stroke="#00F0FF" stroke-width="2.2" stroke-dasharray="6,4" />
            <circle cx="0" cy="0" r="44" fill="#0F172A" stroke="#FACC15" stroke-width="2.5" />
            <polygon points="0,-36 31,18 -31,18" fill="none" stroke="#00F0FF" stroke-width="3" />
            <polygon points="0,36 31,-18 -31,-18" fill="none" stroke="#FACC15" stroke-width="2" />
            <circle cx="0" cy="0" r="14" fill="#00F0FF" opacity="0.3" />
            <circle cx="0" cy="0" r="8" fill="#FACC15" stroke="#FFFFFF" stroke-width="1.5" />
            <line x1="0" y1="-44" x2="0" y2="44" stroke="#00F0FF" stroke-width="2" />
            <line x1="-44" y1="0" x2="44" y2="0" stroke="#00F0FF" stroke-width="2" />
          </g>
        </g>
      `;

    case 'top_alchemist_vest': // Chaleco de Alquimista y Cuero
      return `
        <g id="top_alchemist_vest_layer">
          <defs>
            <linearGradient id="leatherVestGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#92400E" />
              <stop offset="40%" stop-color="#78350F" />
              <stop offset="100%" stop-color="#451A03" />
            </linearGradient>
            <linearGradient id="potionGreenGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#A7F3D0" />
              <stop offset="50%" stop-color="#10B981" />
              <stop offset="100%" stop-color="#047857" />
            </linearGradient>
            <linearGradient id="potionRedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FECDD3" />
              <stop offset="50%" stop-color="#EF4444" />
              <stop offset="100%" stop-color="#B91C1C" />
            </linearGradient>
          </defs>

          <!-- Mangas de lino crudo con dobladillo -->
          <path d="${sleeveLeftPath}" fill="#FEF3C7" stroke="#451A03" stroke-width="3" stroke-linejoin="round" />
          <path d="${sleeveRightPath}" fill="#FEF3C7" stroke="#451A03" stroke-width="3" stroke-linejoin="round" />

          <!-- Camisa interior de lino crudo -->
          <path d="${torsoPath}" fill="#FEF3C7" stroke="#451A03" stroke-width="3.2" stroke-linejoin="round" />
          <path d="M 355,274 L 384,360 L 413,274" fill="none" stroke="#78350F" stroke-width="2.5" />
          <line x1="368" y1="310" x2="400" y2="310" stroke="#78350F" stroke-width="1.8" />
          <line x1="372" y1="330" x2="396" y2="330" stroke="#78350F" stroke-width="1.8" />

          <!-- Chaleco de cuero sobre el lino -->
          <path d="M 320,305 L 350,330 L 342,470 L 326,535 L 268,642 Q 384,646 500,642 L 442,535 L 426,470 L 418,330 L 448,305 L 484,450 C 476,535 482,580 500,642 Q 384,646 268,642 C 286,580 292,535 284,450 Z" 
                fill="url(#leatherVestGrad)" stroke="#291104" stroke-width="3.8" stroke-linejoin="round" />
          
          <!-- Solapas y costuras reforzadas del chaleco -->
          <path d="M 342,330 L 342,635" stroke="#B45309" stroke-width="2.2" stroke-dasharray="6,4" />
          <path d="M 426,330 L 426,635" stroke="#B45309" stroke-width="2.2" stroke-dasharray="6,4" />

          <!-- Bandolera diagonal de cuero con hebilla -->
          <polygon points="310,330 334,320 460,570 436,580" fill="#451A03" stroke="#1C0A00" stroke-width="2.5" />
          <rect x="370" y="440" width="28" height="18" rx="3" fill="#F59E0B" stroke="#78350F" stroke-width="2" transform="rotate(32 384 449)" />

          <!-- Frascos de Pociones Alquímicas en la Bandolera -->
          <g transform="translate(355, 410) rotate(32)">
            <rect x="0" y="0" width="12" height="24" rx="6" fill="url(#potionGreenGrad)" stroke="#064E3B" stroke-width="1.6" />
            <rect x="3" y="-4" width="6" height="4" rx="1" fill="#D97706" />
            <circle cx="6" cy="12" r="2.5" fill="#FFFFFF" opacity="0.7" />
          </g>
          <g transform="translate(405, 490) rotate(32)">
            <rect x="0" y="0" width="12" height="24" rx="6" fill="url(#potionRedGrad)" stroke="#7F1D1D" stroke-width="1.6" />
            <rect x="3" y="-4" width="6" height="4" rx="1" fill="#D97706" />
            <circle cx="6" cy="12" r="2.5" fill="#FFFFFF" opacity="0.7" />
          </g>
        </g>
      `;

    case 'top_celestial_tunic': // Túnica Celestial Resplandeciente
      return `
        <g id="top_celestial_tunic_layer">
          <defs>
            <linearGradient id="celestialGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#312E81" />
              <stop offset="50%" stop-color="#1E1B4B" />
              <stop offset="100%" stop-color="#4C1D95" />
            </linearGradient>
            <linearGradient id="astralGoldGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#FEF08A" />
              <stop offset="50%" stop-color="#FACC15" />
              <stop offset="100%" stop-color="#D97706" />
            </linearGradient>
            <filter id="starGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#FACC15" flood-opacity="0.8" />
            </filter>
          </defs>
          <path d="${sleeveLeftPath}" fill="url(#celestialGrad)" stroke="#0B0F19" stroke-width="3" stroke-linejoin="round" />
          <path d="${sleeveRightPath}" fill="url(#celestialGrad)" stroke="#0B0F19" stroke-width="3" stroke-linejoin="round" />
          <path d="${torsoPath}" fill="url(#celestialGrad)" stroke="#0B0F19" stroke-width="3.2" stroke-linejoin="round" />

          <!-- Bordes dorados astrales en cuello, mangas y bajo -->
          <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="url(#astralGoldGrad)" stroke-width="9" stroke-linecap="round" />
          <path d="M ${isFemale ? 334 : 330},${isFemale ? 272 : 268} Q 384,${isFemale ? 326 : 324} ${isFemale ? 434 : 438},${isFemale ? 272 : 268}" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" />
          <path d="M 268,642 Q 384,648 500,642" fill="none" stroke="url(#astralGoldGrad)" stroke-width="9" stroke-linecap="round" />
          <path d="M ${isFemale ? 242 : 234},${isFemale ? 438 : 444} L 284,444" stroke="url(#astralGoldGrad)" stroke-width="6" stroke-linecap="round" />
          <path d="M ${isFemale ? 530 : 540},${isFemale ? 438 : 444} L 484,444" stroke="url(#astralGoldGrad)" stroke-width="6" stroke-linecap="round" />

          <!-- Constelaciones Estelares Bordadas en el Pecho -->
          <g stroke="#FDE047" stroke-width="1.8" opacity="0.85">
            <line x1="330" y1="410" x2="350" y2="385" />
            <line x1="350" y1="385" x2="384" y2="400" />
            <line x1="384" y1="400" x2="418" y2="385" />
            <line x1="418" y1="385" x2="438" y2="410" />
            <circle cx="330" cy="410" r="3.5" fill="#FFFFFF" />
            <circle cx="350" cy="385" r="3.5" fill="#FFFFFF" />
            <circle cx="384" cy="400" r="4.5" fill="#FEF08A" />
            <circle cx="418" cy="385" r="3.5" fill="#FFFFFF" />
            <circle cx="438" cy="410" r="3.5" fill="#FFFFFF" />
          </g>

          <!-- Broche Estelar Celestial de 8 Puntas -->
          <g filter="url(#starGlow)" transform="translate(384, 348)">
            <polygon points="0,-18 5,-5 18,0 5,5 0,18 -5,5 -18,0 -5,-5" fill="url(#astralGoldGrad)" stroke="#B45309" stroke-width="1.5" />
            <polygon points="0,-12 3,-3 12,0 3,3 0,12 -3,3 -12,0 -3,-3" fill="#FFFFFF" />
            <circle cx="0" cy="0" r="4.5" fill="#00F0FF" stroke="#0284C7" stroke-width="1" />
          </g>
        </g>
      `;

    case 'top_dia_de_muertos':
    default:
      return null;
  }
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 768, height: 1376 });

  const genders = ['female', 'male', 'neutral'];
  const tops = ['top_basic', 'top_school_blouse', 'top_athletic_tank', 'top_rune_tshirt', 'top_alchemist_vest', 'top_celestial_tunic'];

  for (const g of genders) {
    const baseImgFile = g === 'female' ? 'trainer_female_clean.png' : g === 'neutral' ? 'trainer_neutral_clean.png' : 'trainer_base_clean.png';
    const base64 = fs.readFileSync(path.resolve('public/images/avatar', baseImgFile)).toString('base64');
    
    for (const t of tops) {
      const svgTop = getTopSvg(t, g);
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { margin: 0; padding: 0; background: #0F172A; display: flex; align-items: center; justify-content: center; height: 100vh; overflow: hidden; }
            .container { position: relative; width: 768px; height: 1376px; }
            .base-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; }
            .top-svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <img class="base-img" src="data:image/png;base64,${base64}" />
            <svg viewBox="0 0 768 1376" class="top-svg">
              ${svgTop}
            </svg>
          </div>
        </body>
        </html>
      `;

      await page.setContent(html);
      await page.evaluate(() => new Promise(r => setTimeout(r, 60)));

      const outPath = path.join(ARTIFACTS_DIR, `test_top_${g}_${t}.png`);
      await page.screenshot({
        path: outPath,
        clip: { x: 160, y: 260, width: 448, height: 440 }
      });
      console.log(`Saved: test_top_${g}_${t}.png`);
    }
  }

  await browser.close();
  console.log('All tests rendered successfully!');
})();
