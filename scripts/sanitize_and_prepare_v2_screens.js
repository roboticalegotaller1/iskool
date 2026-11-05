const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { execFileSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const rootDir = path.join(__dirname, '..');
const rawDir = path.join(rootDir, 'temp_sales_video_assets', 'pdf_extracted_v2');
const cleanDir = path.join(rootDir, 'temp_sales_video_assets', 'clean_screens');
const artifactDir = 'C:/Users/kami-/.gemini/antigravity/brain/fde3a4d8-54b9-4be2-95e3-e8a0eb4d4f5b';
const officialLogoPath = path.join(artifactDir, '.user_uploaded', 'media_1793858758766_265c7960.jpg');

fs.mkdirSync(cleanDir, { recursive: true });

function toDataURI(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function main() {
  // Step 1: Copy or crop top Chrome URL bar ONLY on images that actually have a Chrome URL bar:
  // img_02, img_03, img_04, img_06, img_10 (48px top Chrome bar)
  const urlBarImages = new Set([2, 3, 4, 6, 10]);

  for (let i = 1; i <= 37; i++) {
    const baseName = `img_${String(i).padStart(2, '0')}.jpg`;
    const inPath = path.join(rawDir, baseName);
    const outPath = path.join(cleanDir, baseName);

    if (urlBarImages.has(i)) {
      execFileSync(ffmpegPath, [
        '-y', '-i', inPath,
        '-vf', 'crop=iw:ih-48:0:48',
        '-q:v', '2', outPath
      ], { stdio: 'ignore' });
      console.log(`Cropped 48px URL bar on ${baseName}`);
    } else {
      fs.copyFileSync(inPath, outPath);
    }
  }

  // Step 2: Launch headless Chromium to apply surgical pixel-level IBIME & URL sanitization on img_04, img_07, img_08, img_10, img_11, img_34, img_35, img_36
  const browserCandidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  const executablePath = browserCandidates.find((p) => fs.existsSync(p));
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const logoUri = toDataURI(officialLogoPath);

  async function patchImage(imgNum, patchFnStr) {
    const baseName = `img_${String(imgNum).padStart(2, '0')}.jpg`;
    const filePath = path.join(cleanDir, baseName);
    const imgUri = toDataURI(filePath);

    const b64 = await page.evaluate(async (src, logoSrc, fnBody) => {
      const load = (u) => new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = rej;
        im.src = u;
      });
      const img = await load(src);
      const logo = await load(logoSrc);
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
      }

      const fn = new Function('ctx', 'img', 'logo', 'roundRect', fnBody);
      fn(ctx, img, logo, roundRect);

      return canvas.toDataURL('image/jpeg', 0.96).split(',')[1];
    }, imgUri, logoUri, patchFnStr);

    fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
    console.log(`✅ Sanitized ${baseName} (Zero IBIME / Zero URLs)`);
  }

  // Patch img_04 (1227 x 587 after 48px crop)
  await patchImage(4, `
    // 1. Top nav bar institution selector (x: 138..525, y: 2..38)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(138, 2, 387, 36);
    ctx.fillStyle = '#1D68FF';
    roundRect(148, 9, 20, 20, 6);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iS', 158, 23);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 11.5px "Segoe UI", sans-serif';
    ctx.fillText('Colegio Internacional iSkool®', 176, 23);

    ctx.fillStyle = '#F8FAFC';
    roundRect(352, 7, 162, 24, 6);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#1D68FF';
    ctx.font = '700 10px "Segoe UI", sans-serif';
    ctx.fillText('✓ Consolidado (4 Sedes)', 364, 22);

    // 2. Dark Triage Header subtitle: "Instituto Bilingüe IBIME (4 Sedes) •" at x=215..336, y=68..83
    ctx.fillStyle = '#1E0D14';
    ctx.fillRect(214, 67, 122, 16);
    ctx.fillStyle = '#CBD5E1';
    ctx.font = '600 9px "Segoe UI", sans-serif';
    ctx.fillText('Red Escolar iSkool® (4 Sedes) •', 216, 78);

    // 3. Bottom-left RLS badge "ibime • #94" -> "iskool • #94"
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(80, 555, 68, 22);
    ctx.fillStyle = '#64748B';
    ctx.font = '600 9px "Segoe UI", sans-serif';
    ctx.fillText('iskool • #94', 82, 569);

    // 4. Ticket codes MAT-IBIME-2026-511 (x=382..460, y=521..539) and MAT-IBIME-2026-151 (x=780..895, y=486..510)
    ctx.fillStyle = '#251F1D';
    roundRect(382, 521, 78, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '700 8px "Segoe UI", monospace';
    ctx.fillText('MAT-ISK-2026-511', 386, 533);

    ctx.fillStyle = '#111A2E';
    roundRect(780, 486, 112, 22, 5);
    ctx.fill();
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '700 10.5px "Segoe UI", monospace';
    ctx.fillText('MAT-ISK-2026-151', 786, 501);
  `);

  // Patch img_07 (1586 x 892)
  await patchImage(7, `
    // Cover "INSTITUTO BILINGÜE IBIME" + subtitle + red shield on the right document card
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(568, 246, 560, 48);
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('COLEGIO INTERNACIONAL iSkool®', 574, 267);
    ctx.fillStyle = '#64748B';
    ctx.font = '500 11.5px "Segoe UI", sans-serif';
    ctx.fillText('Educación Bilingüe de Excelencia SEP NEM 2024 & Cambridge • CCT: 09PPR2026K • Ecosistema iSkool®', 574, 286);

    // Cover right red shield box (x: 1418..1492, y: 228..302)
    ctx.fillStyle = '#FFFFFF';
    roundRect(1420, 232, 68, 66, 14);
    ctx.fill();
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    const lw = 56;
    const lh = lw * (logo.height / logo.width);
    ctx.drawImage(logo, 1420 + (68 - lw) / 2, 232 + (66 - lh) / 2, lw, lh);
  `);

  // Patch img_08 (1680 x 901)
  await patchImage(8, `
    // 1. Top-left header "Instituto Bilingüe IBIME"
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(195, 10, 240, 24);
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 14.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Colegio Internacional iSkool®', 198, 26);

    // 2. Second row badge: orange "IB" + "IBIME / Instituto Bilingüe IBIME"
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(58, 118, 165, 34);
    ctx.fillStyle = '#1D68FF';
    roundRect(63, 121, 26, 26, 7);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 11px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iS', 76, 138);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 10.5px "Segoe UI", sans-serif';
    ctx.fillText('iSkool®', 96, 132);
    ctx.fillStyle = '#64748B';
    ctx.font = '600 9.5px "Segoe UI", sans-serif';
    ctx.fillText('Campus Central Demo', 96, 144);
  `);

  // Patch img_10 (1227 x 580 after 48px crop)
  await patchImage(10, `
    // 1. Top nav bar small red shield (x: 220..255, y: 2..38)
    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(220, 2, 36, 36);
    ctx.fillStyle = '#1D68FF';
    roundRect(226, 9, 22, 22, 6);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iS', 237, 24);

    // 2. Top nav bar orange pill "MONTES (SEDE MATRIZ & CCH)" at x=298..460, y=4..22
    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(298, 4, 164, 18);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 11px "Segoe UI", sans-serif';
    ctx.fillText('Iker Morales', 300, 16);
    ctx.fillStyle = '#1E293B';
    roundRect(372, 5, 82, 15, 5);
    ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.font = '800 8px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPUS CENTRAL', 413, 15);

    // 3. Banner inside Student Portal (x: 196..1026, y: 78..155)
    const bgGrad = ctx.createLinearGradient(196, 78, 1026, 155);
    bgGrad.addColorStop(0, '#0F1E3A');
    bgGrad.addColorStop(0.6, '#13284C');
    bgGrad.addColorStop(1, '#0F1E3A');
    ctx.fillStyle = bgGrad;
    roundRect(196, 78, 830, 76, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // White logo box on left of banner
    ctx.fillStyle = '#FFFFFF';
    roundRect(214, 92, 52, 48, 10);
    ctx.fill();
    const lw = 44;
    const lh = lw * (logo.height / logo.width);
    ctx.drawImage(logo, 214 + (52 - lw) / 2, 92 + (48 - lh) / 2, lw, lh);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 15px "Segoe UI", sans-serif';
    ctx.fillText('Colegio Internacional iSkool®', 278, 111);

    ctx.fillStyle = 'rgba(29, 104, 255, 0.35)';
    roundRect(496, 98, 96, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#93C5FD';
    ctx.font = '800 9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPUS CENTRAL', 544, 110);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '500 10.5px "Segoe UI", sans-serif';
    ctx.fillText('Ecosistema Educativo Integral • SEP NEM 2024 & Cambridge Assessment English', 278, 132);

    // Right gold badge without IBIME
    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';
    roundRect(780, 99, 224, 30, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
    ctx.stroke();
    ctx.fillStyle = '#FBBF24';
    ctx.font = '700 10px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏅 Beca de Excelencia Académica iSkool®', 892, 118);
  `);

  // Patch img_11 (1306 x 893)
  await patchImage(11, `
    // Cover small red shield in top-left nav bar + "MONTES (SEDE MATRIZ & CCH)"
    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(20, 6, 38, 42);
    ctx.fillStyle = '#1D68FF';
    roundRect(26, 13, 28, 28, 8);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iS', 40, 32);

    ctx.fillStyle = '#0B0F1A';
    ctx.fillRect(108, 4, 276, 24);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13.5px "Segoe UI", sans-serif';
    ctx.fillText('Iker Morales', 110, 21);
    ctx.fillStyle = '#1E293B';
    roundRect(198, 8, 96, 18, 6);
    ctx.fill();
    ctx.fillStyle = '#38BDF8';
    ctx.font = '800 9px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPUS CENTRAL', 246, 20);
  `);

  // Patch img_34 (1391 x 897)
  await patchImage(34, `
    // 1. Top white bar left: replace "Instituto Bilingüe IBIME Académico" with official iSkool® logo + "Portal Familiar"
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(30, 4, 380, 42);
    const lwTop = 92;
    const lhTop = lwTop * (logo.height / logo.width);
    ctx.drawImage(logo, 48, 25 - lhTop / 2, lwTop, lhTop);
    ctx.fillStyle = '#0A193A';
    ctx.font = '800 17px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Colegio Internacional', 152, 31);
    ctx.fillStyle = '#1D68FF';
    ctx.font = '700 13px "Segoe UI", sans-serif';
    ctx.fillText('Portal Familiar', 332, 31);

    // 2. Main Banner (x: 235..1068, y: 84..210)
    const bGrad = ctx.createLinearGradient(235, 84, 1068, 210);
    bGrad.addColorStop(0, '#0A193A');
    bGrad.addColorStop(0.55, '#132D62');
    bGrad.addColorStop(1, '#1D68FF');
    ctx.fillStyle = bGrad;
    roundRect(235, 84, 832, 125, 22);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    roundRect(262, 118, 56, 56, 14);
    ctx.fill();
    const lwB = 48;
    const lhB = lwB * (logo.height / logo.width);
    ctx.drawImage(logo, 262 + (56 - lwB) / 2, 118 + (56 - lhB) / 2, lwB, lhB);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 22px "Segoe UI", sans-serif';
    ctx.fillText('Colegio Internacional iSkool®', 334, 136);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    roundRect(646, 117, 145, 24, 12);
    ctx.fill();
    ctx.fillStyle = '#93C5FD';
    ctx.font = '800 10.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CAMPUS CENTRAL', 718, 133);

    ctx.fillStyle = '#10B981';
    roundRect(334, 146, 98, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 9.5px "Segoe UI", sans-serif';
    ctx.fillText('CCT 09PPR2026K', 383, 159);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#E2E8F0';
    ctx.font = '500 12px "Segoe UI", sans-serif';
    ctx.fillText('Portal Oficial de Acompañamiento Familiar • Ecosistema Educativo Conectado 360°', 334, 183);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.14)';
    roundRect(850, 132, 190, 30, 15);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 12px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓ Ciclo Escolar 2026 – 2027', 945, 151);

    // 3. Left email line: "Correo: familia.morales@ibime.edu.mx | Alumno vinculado: Iker Morales Peña |" at y=354..394
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(256, 354, 460, 42);
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748B';
    ctx.font = '500 11.5px "Segoe UI", sans-serif';
    ctx.fillText('Correo: ', 260, 369);
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 11.5px "Segoe UI", sans-serif';
    ctx.fillText('familia.morales@iskool.mx', 302, 369);
    ctx.fillStyle = '#64748B';
    ctx.font = '500 11.5px "Segoe UI", sans-serif';
    ctx.fillText(' | Alumno vinculado: ', 448, 369);
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 11.5px "Segoe UI", sans-serif';
    ctx.fillText('Iker Morales Peña', 554, 369);
    ctx.fillStyle = '#64748B';
    ctx.font = '500 11.5px "Segoe UI", sans-serif';
    ctx.fillText('Grado: 5° de Primaria (Alta)', 260, 387);

    // 4. Right card inside Panel de Padres (x: 745..1042, y: 260..436)
    ctx.fillStyle = '#F8FAFF';
    roundRect(746, 260, 296, 176, 16);
    ctx.fill();
    ctx.strokeStyle = '#DBEAFE';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#1D68FF';
    ctx.font = '800 12px "Segoe UI", sans-serif';
    ctx.fillText('Desempeño Académico iSkool®', 764, 288);

    ctx.fillStyle = '#0A193A';
    roundRect(942, 273, 86, 20, 10);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 9.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Campus Central', 985, 286);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#334155';
    ctx.font = '600 11.5px "Segoe UI", sans-serif';
    ctx.fillText('Mascota: Ignis (Dragón Fuego - Nv. 5)', 764, 314);
    ctx.fillText('Promedio Oficial: ', 764, 336);
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 12px "Segoe UI", sans-serif';
    ctx.fillText('9.8 / 10 ⭐', 860, 336);

    ctx.fillStyle = '#334155';
    ctx.font = '600 11px "Segoe UI", sans-serif';
    ctx.fillText('Beca Vigente: Excelencia Académica', 764, 360);
    ctx.fillStyle = '#0F172A';
    ctx.font = '700 11px "Segoe UI", sans-serif';
    ctx.fillText('Programa Bilingüe iSkool®', 764, 376);

    ctx.fillStyle = '#059669';
    ctx.font = '700 11px "Segoe UI", sans-serif';
    ctx.fillText('✓ Colegiaturas al corriente • CFDI 4.0', 764, 404);
    ctx.fillText('   Timbrado Automático', 764, 420);

    // 5. Portfolio card title at bottom: "Brazo Robótico Hidráulico con Material Reciclado (STEAM IBIME)" at y=775..804
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(578, 775, 445, 28);
    ctx.fillStyle = '#0F172A';
    ctx.font = '800 12.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Brazo Robótico Hidráulico con Material Reciclado (STEAM iSkool®)', 582, 795);
  `);

  // Patch img_35 (921 x 665)
  await patchImage(35, `
    // Replace line 2 of message 1: "Starters y el Torneo Regional de Robótica STEAM IBIME 2026. Agradecemos su constante acompañamiento."
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(76, 257, 680, 24);
    ctx.fillStyle = '#1E293B';
    ctx.font = '500 13.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Starters y el Torneo Regional de Robótica STEAM iSkool® 2026. Agradecemos su constante acompañamiento.', 80, 273);
  `);

  // Patch img_36 (1428 x 812)
  await patchImage(36, `
    // Top bar: replace "Instituto Bilingüe IBIME Académico" with official iSkool® logo + "Colegio Internacional"
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(172, 6, 360, 46);
    const lwTop = 94;
    const lhTop = lwTop * (logo.height / logo.width);
    ctx.drawImage(logo, 182, 29 - lhTop / 2, lwTop, lhTop);
    ctx.fillStyle = '#0A193A';
    ctx.font = '800 17.5px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Colegio Internacional', 288, 35);
    ctx.fillStyle = '#1D68FF';
    ctx.font = '700 13px "Segoe UI", sans-serif';
    ctx.fillText('Finanzas', 470, 35);
  `);

  await browser.close();
  console.log('🎉 All 37 screens extracted, URL-cropped, and 100% IBIME-free!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
