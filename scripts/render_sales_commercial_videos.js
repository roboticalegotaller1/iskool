const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { spawn, execFileSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;

const WIDTH = 1920;
const HEIGHT = 1080;
const FPS = 30;

const rootDir = path.join(__dirname, '..');
const cleanScreensDir = path.join(rootDir, 'temp_sales_video_assets', 'clean_screens');
const audioDir = path.join(rootDir, 'temp_sales_video_assets', 'audio_v2');
const artifactDir = 'C:/Users/kami-/.gemini/antigravity/brain/fde3a4d8-54b9-4be2-95e3-e8a0eb4d4f5b';

const officialLogoPath = path.join(artifactDir, '.user_uploaded', 'media_1793858758766_265c7960.jpg');
const qrWhatsappPath = path.join(artifactDir, '.user_uploaded', 'media_1793859728185_a6c5dddf.jpg');
const heroBrainBgPath = path.join(artifactDir, 'iskool_v2_hero_brain_bg_1793860464866.jpg');
const pillarsBgPath = path.join(artifactDir, 'cerebro_vivo_5_pilares_background_1793923659556.jpg');
const bumperBgPath = path.join(artifactDir, 'iskool_v2_cortinilla_bg_1793860481647.jpg');
const ctaBgPath = path.join(artifactDir, 'iskool_v2_cta_sales_bg_1793860499035.jpg');

function toDataURI(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing asset file: ${filePath}`);
  }
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
  return `data:${mime};base64,${fs.readFileSync(filePath).toString('base64')}`;
}

async function main() {
  const manifestPath = path.join(audioDir, 'timeline_manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('timeline_manifest.json not found. Run generate_sales_audio_suite.js first.');
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const totalDuration = manifest.totalDuration;
  const totalFrames = Math.ceil(totalDuration * FPS);

  console.log(`🎬 Preparing 1080p Motion Graphics Renderer (${totalDuration}s | ${totalFrames} frames @ ${FPS} FPS)...`);

  // Load all images as base64 Data URIs for instant zero-latency HTML5 Canvas rendering
  const assets = {
    logo: toDataURI(officialLogoPath),
    qrWhatsapp: toDataURI(qrWhatsappPath),
    heroBrainBg: toDataURI(heroBrainBgPath),
    pillarsBg: toDataURI(pillarsBgPath),
    bumperBg: toDataURI(bumperBgPath),
    ctaBg: toDataURI(ctaBgPath),
    screens: {}
  };

  for (let i = 1; i <= 37; i++) {
    const key = `img_${String(i).padStart(2, '0')}`;
    assets.screens[key] = toDataURI(path.join(cleanScreensDir, `${key}.jpg`));
  }

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
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--window-size=1920,1080']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: 1 });

  const htmlContent = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 1920px; height: 1080px; overflow: hidden; background: #F8FAFC; font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
  canvas { width: 1920px; height: 1080px; display: block; }
</style>
</head>
<body>
<canvas id="stage" width="1920" height="1080"></canvas>
<script>
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const IMAGES = {};
let MANIFEST = null;

window.initAssets = async function(rawAssets, manifestData) {
  MANIFEST = manifestData;
  const loadImg = (key, src) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { IMAGES[key] = img; res(); };
    img.onerror = rej;
    img.src = src;
  });
  const tasks = [
    loadImg('logo', rawAssets.logo),
    loadImg('qrWhatsapp', rawAssets.qrWhatsapp),
    loadImg('heroBrainBg', rawAssets.heroBrainBg),
    loadImg('pillarsBg', rawAssets.pillarsBg),
    loadImg('bumperBg', rawAssets.bumperBg),
    loadImg('ctaBg', rawAssets.ctaBg)
  ];
  for (const [k, src] of Object.entries(rawAssets.screens)) {
    tasks.push(loadImg(k, src));
  }
  await Promise.all(tasks);
  return true;
};

function easeOutCubic(x) { return 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3); }
function easeInOutCubic(x) {
  x = Math.max(0, Math.min(1, x));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
function clamp(v, min = 0, max = 1) { return Math.max(min, Math.min(max, v)); }

function roundRect(ctx, x, y, w, h, r) {
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

// Draw Official iSkool® Wordmark Pill
function drawLogoBadge(x, y, w, h, scale = 1) {
  ctx.save();
  ctx.translate(x + w/2, y + h/2);
  ctx.scale(scale, scale);
  ctx.shadowColor = 'rgba(10, 25, 58, 0.14)';
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, -w/2, -h/2, w, h, 20);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(29, 104, 255, 0.22)';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  const img = IMAGES.logo;
  if (img) {
    const pad = 14;
    const availW = w - pad * 2;
    const availH = h - pad * 2;
    const ratio = Math.min(availW / img.width, availH / img.height);
    const dw = img.width * ratio;
    const dh = img.height * ratio;
    ctx.drawImage(img, -dw/2, -dh/2, dw, dh);
  }
  ctx.restore();
}

// Draw Branded Section Cortinilla (Same luminous style as origin, zero URLs)
function drawCortinilla(moduleBadge, title, subtitle, localT, duration) {
  const p = clamp(localT / duration);
  const enter = easeOutCubic(localT / 0.45);
  const exit = localT > duration - 0.35 ? easeInOutCubic((duration - localT) / 0.35) : 1;
  const alpha = enter * exit;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Background image with gentle zoom
  const bg = IMAGES.bumperBg;
  const z = 1.0 + p * 0.04;
  ctx.save();
  ctx.translate(960, 540);
  ctx.scale(z, z);
  ctx.drawImage(bg, -960, -540, 1920, 1080);
  ctx.restore();

  // Soft radial light overlay
  const grad = ctx.createRadialGradient(960, 520, 80, 960, 540, 920);
  grad.addColorStop(0, 'rgba(255,255,255,0.92)');
  grad.addColorStop(0.65, 'rgba(248,250,252,0.78)');
  grad.addColorStop(1, 'rgba(226,236,255,0.45)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Center Glass Card
  const cardW = 1280;
  const cardH = 560;
  const cardX = (1920 - cardW) / 2;
  const cardY = (1080 - cardH) / 2 + (1 - enter) * 35;

  ctx.shadowColor = 'rgba(10, 25, 58, 0.14)';
  ctx.shadowBlur = 50;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  roundRect(ctx, cardX, cardY, cardW, cardH, 36);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(29, 104, 255, 0.28)';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Top Accent Stripe
  const barGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY);
  barGrad.addColorStop(0, '#0A193A');
  barGrad.addColorStop(0.5, '#1D68FF');
  barGrad.addColorStop(1, '#00C2FF');
  ctx.fillStyle = barGrad;
  roundRect(ctx, cardX + 180, cardY, cardW - 360, 8, 4);
  ctx.fill();

  // Official iSkool® Logo at top center of Cortinilla
  const logoImg = IMAGES.logo;
  if (logoImg) {
    const lw = 340;
    const lh = lw * (logoImg.height / logoImg.width);
    ctx.drawImage(logoImg, 960 - lw/2, cardY + 52, lw, lh);
  }

  // Module Pill Badge
  ctx.fillStyle = 'rgba(29, 104, 255, 0.10)';
  roundRect(ctx, 960 - 210, cardY + 215, 420, 44, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(29, 104, 255, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#1D68FF';
  ctx.font = '800 19px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(moduleBadge.toUpperCase(), 960, cardY + 244);

  // Main Section Title
  ctx.fillStyle = '#0A193A';
  ctx.font = '900 68px "Segoe UI", sans-serif';
  ctx.fillText(title, 960, cardY + 345);

  // Subtitle
  ctx.fillStyle = '#334155';
  ctx.font = '600 28px "Segoe UI", sans-serif';
  ctx.fillText(subtitle, 960, cardY + 412);

  // Animated progress underline
  const lineW = 360 * easeOutCubic(clamp((localT - 0.15) / (duration - 0.3)));
  ctx.fillStyle = '#1D68FF';
  roundRect(ctx, 960 - lineW/2, cardY + 458, lineW, 6, 3);
  ctx.fill();

  ctx.restore();
}

// Draw Clean Framed Operational Screen (Zero URLs, Zero Dev Indicator, High-Contrast Studio Frame)
function drawStudioScreen(imgKey, opts = {}) {
  const img = IMAGES[imgKey];
  if (!img) return { x: 80, y: 110, w: 1760, h: 860 };

  const x = opts.x ?? 80;
  const y = opts.y ?? 108;
  const w = opts.w ?? 1760;
  const h = opts.h ?? 855;
  const zoom = opts.zoom ?? 1.0;
  const panX = opts.panX ?? 0;
  const panY = opts.panY ?? 0;

  ctx.save();

  // Outer Drop Shadow & Studio Bezel
  ctx.shadowColor = 'rgba(10, 25, 58, 0.18)';
  ctx.shadowBlur = 42;
  ctx.shadowOffsetY = 14;
  ctx.fillStyle = '#FFFFFF';
  roundRect(ctx, x - 8, y - 8, w + 16, h + 16, 26);
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = 'rgba(29, 104, 255, 0.22)';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Clip inner screen area
  roundRect(ctx, x, y, w, h, 20);
  ctx.clip();

  // Fill background matching screen
  ctx.fillStyle = opts.darkBg ? '#0B1120' : '#FFFFFF';
  ctx.fillRect(x, y, w, h);

  // Calculate aspect-fill / fit
  const scale = Math.min(w / img.width, h / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) / 2 + panX;
  const dy = y + (h - dh) / 2 + panY;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, dx, dy, dw, dh);

  // Surgically mask bottom-left 54x54px of the drawn image if it had a dev badge
  ctx.fillStyle = opts.darkBg ? '#0B1120' : '#F8FAFC';
  ctx.fillRect(dx, dy + dh - 52 * scale, 52 * scale, 52 * scale);

  ctx.restore();
  return { x, y, w, h, dx, dy, dw, dh };
}

// Draw Clean Vector Signaling Arrow (Flecha de Señalización Quirúrgica: Pill Centrado en fromX,fromY -> Punta Exacta en toX,toY)
function drawSignalArrow(fromX, fromY, toX, toY, label, sublabel, color = '#1D68FF', progress = 1.0, globalT = 0) {
  const p = easeOutCubic(clamp(progress));
  if (p <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = p;

  // 1. Compute Callout Pill dimensions and exact bounds centered at (fromX, fromY)
  ctx.font = '800 19px "Segoe UI", sans-serif';
  const w1 = label ? ctx.measureText(label).width : 0;
  ctx.font = '600 14.5px "Segoe UI", sans-serif';
  const w2 = sublabel ? ctx.measureText(sublabel).width : 0;
  const pillW = Math.max(w1, w2) + 46;
  const pillH = sublabel ? 64 : 44;

  const px = clamp(fromX - pillW / 2, 96, 1824 - pillW);
  const py = clamp(fromY - pillH / 2, 48, 1032 - pillH);
  const cx = px + pillW / 2;
  const cy = py + pillH / 2;

  // Compute exact intersection point on the outer border of the pill box facing (toX, toY)
  const dx = toX - cx;
  const dy = toY - cy;
  const halfW = pillW / 2 + 2;
  const halfH = pillH / 2 + 2;
  const tEdge = Math.min(
    halfW / Math.max(1, Math.abs(dx)),
    halfH / Math.max(1, Math.abs(dy)),
    0.85
  );
  const startX = cx + dx * tEdge;
  const startY = cy + dy * tEdge;

  // 2. Pulsing Target Ring at exact UI coordinate (toX, toY)
  const pulse = 0.5 + 0.5 * Math.sin(globalT * 7.5);
  ctx.beginPath();
  ctx.arc(toX, toY, 18 + pulse * 11, 0, Math.PI * 2);
  ctx.fillStyle = color === '#1D68FF' ? 'rgba(29, 104, 255, 0.22)' : 'rgba(16, 185, 129, 0.24)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(toX, toY, 9.5, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();

  // 3. Animated Vector Shaft from Pill Border (startX, startY) to Target (toX, toY)
  const curX = startX + (toX - startX) * p;
  const curY = startY + (toY - startY) * p;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(curX, curY);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(curX, curY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 4. Crisp Vector Arrowhead landing squarely on (curX, curY) -> (toX, toY)
  const angle = Math.atan2(toY - startY, toX - startX);
  const headLen = 20;
  ctx.save();
  ctx.translate(curX, curY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(3, 0);
  ctx.lineTo(-headLen, -11);
  ctx.lineTo(-headLen * 0.72, 0);
  ctx.lineTo(-headLen, 11);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();

  // 5. Minimalist Executive Callout Pill Box centered at (cx, cy)
  if (label) {
    ctx.shadowColor = 'rgba(10, 25, 58, 0.26)';
    ctx.shadowBlur = 22;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#0A193A';
    roundRect(ctx, px, py, pillW, pillH, 14);
    ctx.fill();

    ctx.lineWidth = 2.5;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = color;
    roundRect(ctx, px + 8, py + 8, 6, pillH - 16, 3);
    ctx.fill();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 19px "Segoe UI", sans-serif';
    ctx.fillText(label, px + 24, py + (sublabel ? 27 : 28));

    if (sublabel) {
      ctx.fillStyle = '#93C5FD';
      ctx.font = '600 14.5px "Segoe UI", sans-serif';
      ctx.fillText(sublabel, px + 24, py + 49);
    }
  }

  ctx.restore();
}

// Draw Executive Slide: Los 5 Pilares de la Educación & Beneficios Reales de iSkool® (Before Operational Screens)
function drawFivePillarsAndBenefitsSlide(localT, duration) {
  const enter = easeOutCubic(localT / 0.45);
  const exit = localT > duration - 0.35 ? easeInOutCubic((duration - localT) / 0.35) : 1;
  ctx.save();
  ctx.globalAlpha = enter * exit;

  ctx.drawImage(IMAGES.bumperBg, 0, 0, 1920, 1080);
  const grad = ctx.createRadialGradient(960, 520, 90, 960, 540, 960);
  grad.addColorStop(0, 'rgba(255,255,255,0.94)');
  grad.addColorStop(0.7, 'rgba(248,250,252,0.86)');
  grad.addColorStop(1, 'rgba(226,236,255,0.65)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Header bar with Official iSkool® Logo
  const logo = IMAGES.logo;
  if (logo) {
    const lh = 56;
    const lw = lh * (logo.width / logo.height);
    ctx.drawImage(logo, 95, 38, lw, lh);
  }
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0A193A';
  ctx.font = '900 34px "Segoe UI", sans-serif';
  ctx.fillText('El Cerebro Vivo de tu Escuela — Potenciado con Inteligencia Artificial', 330, 68);
  ctx.fillStyle = '#1D68FF';
  ctx.font = '800 19px "Segoe UI", sans-serif';
  ctx.fillText('Tecnología Creada en Canadá para Colegios Privados en México  •  Conecta los 5 Pilares de la Educación', 330, 100);

  // Top-right Origin Badge
  ctx.save();
  ctx.fillStyle = '#0A193A';
  roundRect(ctx, 1520, 38, 305, 58, 18);
  ctx.fill();
  ctx.strokeStyle = '#1D68FF';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#60A5FA';
  ctx.font = '800 13px "Segoe UI", sans-serif';
  ctx.fillText('TECNOLOGÍA CANADIENSE • IA', 1672, 61);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 18px "Segoe UI", sans-serif';
  ctx.fillText('iSkool®', 1672, 84);
  ctx.restore();

  // Connecting line behind the 5 Pillars
  ctx.strokeStyle = 'rgba(29, 104, 255, 0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(240, 222);
  ctx.lineTo(1680, 222);
  ctx.stroke();

  const pillars = [
    { num: 'PILAR 01', name: 'Directivos', desc: 'Gobernanza & KPIs 360°', color: '#0A193A' },
    { num: 'PILAR 02', name: 'Coordinadores', desc: 'Supervisión & Espejo 1:1', color: '#1D68FF' },
    { num: 'PILAR 03', name: 'Docentes', desc: 'Planeación SEP & Aula Viva', color: '#7C3AED' },
    { num: 'PILAR 04', name: 'Alumnos', desc: 'Gamificación & Idiomas', color: '#10B981' },
    { num: 'PILAR 05', name: 'Tutores', desc: 'Logros, Avisos & Pagos SAT', color: '#F59E0B' }
  ];

  pillars.forEach((pl, i) => {
    const pw = 324;
    const ph = 148;
    const px = 95 + i * 356;
    const py = 148;
    const pop = easeOutCubic(clamp((localT - i * 0.10) / 0.45));

    ctx.save();
    ctx.translate(px + pw / 2, py + ph / 2);
    ctx.scale(0.92 + 0.08 * pop, 0.92 + 0.08 * pop);
    ctx.shadowColor = 'rgba(10, 25, 58, 0.14)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, -pw / 2, -ph / 2, pw, ph, 22);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = pl.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = pl.color;
    roundRect(ctx, -70, -ph / 2 + 16, 140, 28, 14);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(pl.num, 0, -ph / 2 + 35);

    ctx.fillStyle = '#0A193A';
    ctx.font = '900 28px "Segoe UI", sans-serif';
    ctx.fillText(pl.name, 0, 14);

    ctx.fillStyle = '#475569';
    ctx.font = '600 16px "Segoe UI", sans-serif';
    ctx.fillText(pl.desc, 0, 46);
    ctx.restore();
  });

  // Section Title for Real Institutional Benefits
  ctx.fillStyle = '#0A193A';
  ctx.font = '900 28px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BENEFICIOS REALES Y TANGIBLES EN OPERACIÓN DIARIA', 960, 355);

  const benefits = [
    {
      badge: 'CRECIMIENTO DE MATRÍCULA',
      metric: 'Admisión 360° & CRM Escolar',
      title: 'Cero Prospectos Perdidos',
      desc: 'Seguimiento puntual de cada aspirante desde registro por WhatsApp, visita al campus y diagnóstico psicopedagógico hasta inscripción pagada SEP.',
      color: '#1D68FF'
    },
    {
      badge: 'EFICIENCIA DIRECTIVA',
      metric: '3.8 Horas Ahorradas al Día',
      title: 'Triage Cognitivo & Modo Espejo',
      desc: 'Filtra cientos de correos diarios destacando solo los críticos para dirección, y supervisa cada salón en vivo sin interrumpir la clase.',
      color: '#0A193A'
    },
    {
      badge: 'EXCELENCIA DOCENTE SEP NEM',
      metric: 'Planeación 360° & Aula Viva',
      title: 'Curva de Aprendizaje Cero',
      desc: 'Genera secuencias oficiales SEP NEM en segundos con Taxonomía de Bloom, asistencia histórica, sellos digitales de libreta y bloques interactivos.',
      color: '#7C3AED'
    },
    {
      badge: 'RETENCIÓN & COBRANZA SAT 4.0',
      metric: '20 Mundos + Idiomas + CFDI 4.0',
      title: 'Motivación Estudiantil & Pagos en 1 Clic',
      desc: 'Gamificación por mérito, laboratorio fonético Cambridge y DELF/DALF, avisos con firma de enterado y pasarela de pago con factura automática.',
      color: '#10B981'
    }
  ];

  benefits.forEach((b, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const bw = 845;
    const bh = 280;
    const bx = 95 + col * 885;
    const by = 385 + row * 305;
    const bPop = easeOutCubic(clamp((localT - 0.35 - i * 0.14) / 0.5));

    ctx.save();
    ctx.globalAlpha = enter * exit * bPop;
    ctx.shadowColor = 'rgba(10, 25, 58, 0.14)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, bx, by, bw, bh, 26);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = b.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = b.color;
    roundRect(ctx, bx + 28, by + 26, 290, 34, 17);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 14px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(b.badge, bx + 28 + 145, by + 48);

    ctx.textAlign = 'right';
    ctx.fillStyle = b.color;
    ctx.font = '900 22px "Segoe UI", sans-serif';
    ctx.fillText(b.metric, bx + bw - 28, by + 50);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#0A193A';
    ctx.font = '900 32px "Segoe UI", sans-serif';
    ctx.fillText(b.title, bx + 28, by + 115);

    ctx.fillStyle = '#334155';
    ctx.font = '600 21px "Segoe UI", sans-serif';
    const words = b.desc.split(' ');
    let line = '';
    let ly = by + 165;
    for (const w of words) {
      const test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > bw - 56) {
        ctx.fillText(line, bx + 28, ly);
        line = w;
        ly += 32;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, bx + 28, ly);
    ctx.restore();
  });

  ctx.restore();
}

// Draw Didactic Central Infographic: Los 5 Pilares de la Educación sobre Fondo Nano Banana 2.1 (12.4s - 21.2s)
function drawFivePillarsCentralInfographic(slideT, duration, sceneLocalT) {
  const enter = easeOutCubic(slideT / 0.45);
  const exit = slideT > duration - 0.35 ? easeInOutCubic((duration - slideT) / 0.35) : 1;
  const masterAlpha = enter * exit;

  ctx.save();
  ctx.globalAlpha = masterAlpha;

  // 1. Background image (Crystal Brain at top center + 5 fiber-optic bases: blue, cyan, violet, green, amber)
  const bg = IMAGES.pillarsBg || IMAGES.heroBrainBg;
  const z = 1.0 + clamp(slideT / duration) * 0.025;
  ctx.save();
  ctx.translate(960, 540);
  ctx.scale(z, z);
  ctx.drawImage(bg, -960, -540, 1920, 1080);
  ctx.restore();

  // Soft top veil for maximum typography contrast without hiding the 3D crystal brain or beams
  const topGrad = ctx.createLinearGradient(0, 0, 0, 165);
  topGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
  topGrad.addColorStop(0.75, 'rgba(248, 250, 252, 0.78)');
  topGrad.addColorStop(1, 'rgba(248, 250, 252, 0.0)');
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, 1920, 165);

  // 2. Top Executive Header: Official Logo + Main Title "Los 5 Pilares de la Educación"
  const logo = IMAGES.logo;
  if (logo) {
    const lh = 56;
    const lw = lh * (logo.width / logo.height);
    ctx.drawImage(logo, 96, 34, lw, lh);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = '#0A193A';
  ctx.font = '900 46px "Segoe UI", sans-serif';
  ctx.fillText('Los 5 Pilares de la Educación', 960, 64);

  ctx.fillStyle = '#1D68FF';
  ctx.font = '800 21px "Segoe UI", sans-serif';
  ctx.fillText('Conectados en Tiempo Real con Beneficios Reales desde el Primer Día', 960, 102);

  // Top-right Origin Badge
  ctx.save();
  ctx.fillStyle = '#0A193A';
  roundRect(ctx, 1520, 32, 304, 58, 18);
  ctx.fill();
  ctx.strokeStyle = '#1D68FF';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#60A5FA';
  ctx.font = '800 13px "Segoe UI", sans-serif';
  ctx.fillText('TECNOLOGÍA CANADIENSE • IA', 1672, 55);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 18px "Segoe UI", sans-serif';
  ctx.fillText('iSkool®', 1672, 78);
  ctx.restore();

  // 3. Central Crystal Brain Label: "iSkool® — El Cerebro Vivo con IA" over the brain hub pedestal
  const brainPop = easeOutCubic(clamp((slideT - 0.15) / 0.5));
  ctx.save();
  ctx.translate(960, 456);
  ctx.scale(0.92 + 0.08 * brainPop, 0.92 + 0.08 * brainPop);

  const bw = 540;
  const bh = 66;
  ctx.shadowColor = 'rgba(10, 25, 58, 0.28)';
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = 'rgba(10, 25, 58, 0.95)';
  roundRect(ctx, -bw / 2, -bh / 2, bw, bh, 33);
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#00C2FF';
  ctx.stroke();
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.textAlign = 'center';
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 25px "Segoe UI", sans-serif';
  ctx.fillText('iSkool® — El Cerebro Vivo con IA', 0, 9);
  ctx.restore();

  // 4. The 5 Pillars aligned directly over the 5 crystal bases (left to right: azul, cian, violeta, verde, ámbar)
  // Staggered appearance synchronized to the voice (~1 pillar every 1.2s starting at 14.5s)
  const bases = [
    {
      num: 'PILAR 01',
      name: 'Directivos',
      benefit: 'Gobernanza & KPIs 360°',
      detail: 'Control multicampus en tiempo real',
      color: '#1D68FF',
      glow: 'rgba(29, 104, 255, 0.26)',
      cx: 244,
      discY: 748,
      cardY: 774,
      appearAt: 14.5
    },
    {
      num: 'PILAR 02',
      name: 'Coordinadores',
      benefit: 'Supervisión & Espejo 1:1',
      detail: 'Auditoría de aula en vivo sin interrumpir',
      color: '#0284C7',
      glow: 'rgba(2, 132, 199, 0.26)',
      cx: 574,
      discY: 814,
      cardY: 838,
      appearAt: 15.7
    },
    {
      num: 'PILAR 03',
      name: 'Docentes',
      benefit: 'Planeación SEP & Aula Viva',
      detail: 'Clases interactivas en pocos minutos',
      color: '#7C3AED',
      glow: 'rgba(124, 58, 237, 0.26)',
      cx: 960,
      discY: 842,
      cardY: 864,
      appearAt: 16.9
    },
    {
      num: 'PILAR 04',
      name: 'Alumnos',
      benefit: 'Gamificación & Idiomas',
      detail: '20 mundos, avatares y fluidez fonética',
      color: '#10B981',
      glow: 'rgba(16, 185, 129, 0.26)',
      cx: 1346,
      discY: 814,
      cardY: 838,
      appearAt: 18.1
    },
    {
      num: 'PILAR 05',
      name: 'Tutores',
      benefit: 'Logros, Avisos & Pagos SAT',
      detail: 'Cobranza y CFDI 4.0 al instante',
      color: '#D97706',
      glow: 'rgba(217, 119, 6, 0.26)',
      cx: 1676,
      discY: 748,
      cardY: 774,
      appearAt: 19.3
    }
  ];

  bases.forEach((b, idx) => {
    const baseIntro = easeOutCubic(clamp((slideT - 0.25 - idx * 0.08) / 0.45));
    const voiceActive = easeOutCubic(clamp((sceneLocalT - b.appearAt) / 0.45));
    const cardAlpha = baseIntro * (0.34 + 0.66 * voiceActive);
    if (cardAlpha <= 0.01) return;

    const pulse = 0.5 + 0.5 * Math.sin((sceneLocalT - b.appearAt) * 6.5);
    const cardW = 304;
    const cardH = 148;

    ctx.save();
    ctx.globalAlpha = masterAlpha * cardAlpha;

    // Glowing energy beacon on the crystal base center when activated by voice
    if (voiceActive > 0.05) {
      ctx.beginPath();
      ctx.arc(b.cx, b.discY - 22, (20 + pulse * 10) * voiceActive, 0, Math.PI * 2);
      ctx.fillStyle = b.glow;
      ctx.fill();
    }

    // Pillar number pill floating right above the crystal disc
    const pillW = 142;
    const pillH = 32;
    ctx.fillStyle = b.color;
    roundRect(ctx, b.cx - pillW / 2, b.discY - 40, pillW, pillH, 16);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13.5px "Segoe UI", sans-serif';
    ctx.fillText(b.num, b.cx, b.discY - 19);

    // Didactic Pillar Card anchored cleanly to the base (elevates & scales on voice cue)
    const cy = b.cardY + (1 - voiceActive) * 14;
    ctx.translate(b.cx, cy + cardH / 2);
    const sc = 0.94 + 0.06 * voiceActive;
    ctx.scale(sc, sc);

    ctx.shadowColor = 'rgba(10, 25, 58, 0.22)';
    ctx.shadowBlur = 18 + 12 * voiceActive;
    ctx.shadowOffsetY = 8 + 4 * voiceActive;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    roundRect(ctx, -cardW / 2, -cardH / 2, cardW, cardH, 22);
    ctx.fill();
    ctx.lineWidth = 2.5 + 1.0 * voiceActive;
    ctx.strokeStyle = b.color;
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Top color accent bar inside card
    ctx.fillStyle = b.color;
    roundRect(ctx, -56, -cardH / 2 + 10, 112, 5, 2.5);
    ctx.fill();

    // Pillar Name
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0A193A';
    ctx.font = '900 29px "Segoe UI", sans-serif';
    ctx.fillText(b.name, 0, -cardH / 2 + 50);

    // Primary Benefit
    ctx.fillStyle = b.color;
    ctx.font = '800 17.5px "Segoe UI", sans-serif';
    ctx.fillText(b.benefit, 0, -cardH / 2 + 84);

    // Operational Detail
    ctx.fillStyle = '#475569';
    ctx.font = '600 15px "Segoe UI", sans-serif';
    ctx.fillText(b.detail, 0, -cardH / 2 + 116);

    ctx.restore();
  });

  ctx.restore();
}

// Top Executive Header Bar & Bottom Subtitle Bar
function drawStudioHeaderAndFooter(portalName, stepBadge, captionText) {
  ctx.save();

  // Top Studio Header
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.shadowColor = 'rgba(10, 25, 58, 0.06)';
  ctx.shadowBlur = 16;
  ctx.fillRect(0, 0, 1920, 84);
  ctx.shadowBlur = 0;

  ctx.fillStyle = 'rgba(29, 104, 255, 0.15)';
  ctx.fillRect(0, 82, 1920, 2);

  // Small Official iSkool® Logo on Top Left
  const logo = IMAGES.logo;
  if (logo) {
    const lh = 46;
    const lw = lh * (logo.width / logo.height);
    ctx.drawImage(logo, 64, 19, lw, lh);
  }

  // Portal Pill
  ctx.fillStyle = '#0A193A';
  roundRect(ctx, 245, 22, 340, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 16px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(portalName.toUpperCase(), 245 + 170, 47);

  // Right Step Badge & Contact Reminder
  ctx.fillStyle = 'rgba(29, 104, 255, 0.10)';
  roundRect(ctx, 596, 22, 660, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#1D68FF';
  ctx.font = '700 15px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stepBadge, 596 + 330, 47);

  // Top-right subtle sales contact badge
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0A193A';
  ctx.font = '800 15.5px "Segoe UI", sans-serif';
  ctx.fillText('contacto@iskool.mx  •  Tel. y WhatsApp: 56 1140 4767', 1864, 48);

  // Bottom Executive Caption Bar
  if (captionText) {
    ctx.shadowColor = 'rgba(10, 25, 58, 0.18)';
    ctx.shadowBlur = 24;
    ctx.fillStyle = 'rgba(10, 25, 58, 0.94)';
    roundRect(ctx, 140, 984, 1640, 74, 20);
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(29, 104, 255, 0.45)';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 21px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(captionText, 960, 1029);
  }

  ctx.restore();
}

window.renderFrameAtTime = function(globalT) {
  // Clear stage with clean Daylight background
  const bgGrad = ctx.createLinearGradient(0, 0, 1920, 1080);
  bgGrad.addColorStop(0, '#F4F8FF');
  bgGrad.addColorStop(0.5, '#FFFFFF');
  bgGrad.addColorStop(1, '#EEF4FF');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1920, 1080);

  // Find active scene
  let sc = MANIFEST.scenes[MANIFEST.scenes.length - 1];
  for (const s of MANIFEST.scenes) {
    if (globalT >= s.startTime && globalT <= s.endTime + 0.05) {
      sc = s;
      break;
    }
  }
  const localT = Math.max(0, globalT - sc.startTime);
  const dur = sc.duration;
  const p = clamp(localT / dur);

  // =========================================================================
  // SCENE 1: Keynote Intro (0..8.5s) -> 5 Pilares & Beneficios Reales (8.5..12.4s) -> Infografía Central 5 Pilares (12.4..21.2s) -> Cortinilla CEO (21.2..23.0s) -> Resumen Ejecutivo (23.0..dur)
  // =========================================================================
  if (sc.id === 'scene01') {
    if (localT < 8.5) {
      // Official iSkool® (/ˈa͡ɪskˌuːl/) Keynote Opening: El Cerebro Vivo + IA + Tecnología Creada en Canadá
      const ep = easeOutCubic(localT / 0.8);
      ctx.drawImage(IMAGES.heroBrainBg, 0, 0, 1920, 1080);

      // Luminous center radial veil so dark navy & cobalt text pops with crystal clarity
      const rad = ctx.createRadialGradient(960, 490, 90, 960, 540, 960);
      rad.addColorStop(0, 'rgba(255,255,255,0.94)');
      rad.addColorStop(0.62, 'rgba(248,250,255,0.84)');
      rad.addColorStop(1, 'rgba(224,238,255,0.42)');
      ctx.fillStyle = rad;
      ctx.fillRect(0, 0, 1920, 1080);

      // Top Pill: Tecnología Creada en Canadá para Colegios Privados en México
      ctx.save();
      ctx.globalAlpha = ep;
      ctx.fillStyle = '#0A193A';
      roundRect(ctx, 960 - 460, 108, 920, 52, 26);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#1D68FF';
      ctx.stroke();
      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 20px "Segoe UI", sans-serif';
      ctx.fillText('TECNOLOGÍA CREADA EN CANADÁ PARA COLEGIOS PRIVADOS EN MÉXICO', 960, 141);
      ctx.restore();

      // Official iSkool® Logo Badge (Clean Keynote Presentation without Phonetic Pill)
      drawLogoBadge(960 - 380, 212, 760, 296, 0.90 + ep * 0.10);

      // Main Value Proposition Headline: El Cerebro Vivo de tu Escuela
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0A193A';
      ctx.font = '900 58px "Segoe UI", sans-serif';
      ctx.fillText('El Cerebro Vivo de tu Escuela', 960, 605);

      ctx.fillStyle = '#1D68FF';
      ctx.font = '800 32px "Segoe UI", sans-serif';
      ctx.fillText('Plataforma Educativa Integral Potenciada con Inteligencia Artificial', 960, 662);

      // 5 Pillars Bottom Ribbon
      const pNames = ['1. Directivos', '2. Coordinadores', '3. Docentes', '4. Alumnos', '5. Tutores'];
      pNames.forEach((pn, idx) => {
        const bx = 185 + idx * 315;
        const by = 720;
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = 'rgba(10, 25, 58, 0.12)';
        ctx.shadowBlur = 18;
        roundRect(ctx, bx, by, 290, 56, 28);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#1D68FF';
        ctx.stroke();
        ctx.fillStyle = '#0A193A';
        ctx.font = '800 20px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pn, bx + 145, by + 35);
      });
    } else if (localT < 12.4) {
      drawFivePillarsAndBenefitsSlide(localT - 8.5, 3.9);
    } else if (localT < 21.2) {
      drawFivePillarsCentralInfographic(localT - 12.4, 8.8, localT);
    } else if (localT < 23.0) {
      drawCortinilla(
        'MÓDULO EJECUTIVO 01',
        'Portal de CEO',
        'Gobernanza Escolar, Admisión 360°, Triage Cognitivo & Supervisión en Vivo',
        localT - 21.2,
        1.8
      );
    } else {
      const uiT = localT - 23.0;
      drawStudioHeaderAndFooter(
        '1. Portal de CEO',
        'Consola de Mando Corporativo & Resumen Ejecutivo',
        'Controla en tiempo real matrícula, asistencia, cobertura SEP NEM y cobranza consolidada por plantel.'
      );
      drawStudioScreen('img_02', { zoom: 1.0 + uiT * 0.003 });

      drawSignalArrow(540, 220, 450, 355, 'KPIs Globales en Tiempo Real', 'Matrícula, 95% Cobertura SEP y 94% Cobranza', '#1D68FF', (uiT - 0.3) / 0.5, globalT);
      drawSignalArrow(660, 660, 495, 540, 'Focos de Atención Directiva', 'Alertas automáticas de cobranza, reinscripción y triage', '#10B981', (uiT - 1.4) / 0.5, globalT);
      drawSignalArrow(1440, 480, 1260, 580, 'Avance Comparativo por Colegio', 'Auditoría multicampus en un solo clic', '#8B5CF6', (uiT - 2.6) / 0.5, globalT);
    }
  }

  // =========================================================================
  // SCENE 2: Admisión 360° CRM Kanban (Embudo de Captación a Inscripción)
  // =========================================================================
  else if (sc.id === 'scene02') {
    drawStudioHeaderAndFooter(
      '1. Portal de CEO',
      'Módulo de Admisión 360° & Embudo CRM Escolar',
      'Visualiza cómo cada aspirante avanza desde Captación, Visita al Campus y Diagnóstico hasta su Inscripción Pagada.'
    );
    drawStudioScreen('img_03', { zoom: 1.0 + p * 0.015 });

    // Sequential arrows showing how a student advances across the funnel
    drawSignalArrow(455, 220, 455, 395, '1. Captación & Visita al Campus', 'Registro automático desde WhatsApp y seguimiento', '#1D68FF', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1020, 220, 1020, 395, '2. Diagnóstico & Carta de Asignación', 'Evaluación psicopedagógica y comité académico', '#F59E0B', (localT - 2.0) / 0.5, globalT);
    drawSignalArrow(1590, 220, 1625, 395, '3. Inscripción Pagada SEP', 'Cierre de matrícula y alta automática de expediente', '#10B981', (localT - 3.6) / 0.5, globalT);
  }

  // =========================================================================
  // SCENE 3: Consola de Correo Inteligente & Triage Cognitivo CEO
  // =========================================================================
  else if (sc.id === 'scene03') {
    drawStudioHeaderAndFooter(
      '1. Portal de CEO',
      'Consola de Correo Inteligente & Triage Cognitivo',
      'El Triage Cognitivo filtra 299 correos diarios, destaca solo los 9 críticos para el CEO y ahorra 3.8 horas al día.'
    );
    drawStudioScreen('img_04', { zoom: 1.0 + p * 0.015 });

    drawSignalArrow(830, 225, 985, 350, 'Triage Cognitivo Automático', 'De 299 correos recibidos, filtra solo 9 críticos', '#EF4444', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1520, 225, 1615, 350, '3.8 Horas Ahorradas al Día', '290 correos delegados o filtrados sin interrupciones', '#1D68FF', (localT - 2.0) / 0.5, globalT);
    drawSignalArrow(1320, 610, 1595, 472, 'Detección de Patrones & Circular 1-Clic', 'Responde masivamente a familias sin saturar dirección', '#10B981', (localT - 3.6) / 0.5, globalT);
  }

  // =========================================================================
  // SCENE 4: Supervisión Docente & Modo Espejo CEO en Vivo
  // =========================================================================
  else if (sc.id === 'scene04') {
    drawStudioHeaderAndFooter(
      '1. Portal de CEO',
      'Supervisión Docente & Modo Espejo de Aula en Tiempo Real',
      'Inspecciona en vivo el avance de cada profesor, su cronómetro SEP NEM y la misión activa sin interrumpir la clase.'
    );
    drawStudioScreen('img_05', { zoom: 1.0 + p * 0.015 });

    drawSignalArrow(540, 240, 580, 395, 'Matriz de Desempeño Docente', '98% Cobertura PDA SEP y rúbricas activas por plantel', '#1D68FF', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1420, 235, 1420, 470, 'Modo Espejo en Aula en Vivo (1:1)', 'Supervisa Inicio, Desarrollo y Cierre en tiempo real', '#10B981', (localT - 2.0) / 0.5, globalT);
  }

  // =========================================================================
  // SCENE 5: Cortinilla Portal del Profesor (0..2.2s) -> Daylight Studio Pro (2.2..dur)
  // =========================================================================
  else if (sc.id === 'scene05') {
    if (localT < 2.2) {
      drawCortinilla(
        'MÓDULO DOCENTE 02',
        'Portal del Profesor',
        'iSkool Daylight Studio Pro: Curva de Aprendizaje Cero, Taxonomía de Bloom & Control de Aula',
        localT,
        2.2
      );
    } else {
      const uiT = localT - 2.2;
      drawStudioHeaderAndFooter(
        '2. Portal del Profesor',
        'iSkool Daylight Studio Pro — Mi Clase en Vivo',
        'Interfaz clara e intuitiva: barra lateral izquierda, Taxonomía de Bloom activa, calendario de asistencia y sellos de libreta.'
      );
      drawStudioScreen('img_06', { zoom: 1.0 + uiT * 0.003 });

      drawSignalArrow(540, 530, 260, 530, 'Barra Lateral Intuitiva', 'Acceso inmediato a Mi Clase, Sellos, Planeación y Ajustes', '#1D68FF', (uiT - 0.4) / 0.5, globalT);
      drawSignalArrow(890, 640, 890, 765, 'Taxonomía de Bloom en Aula', '6 niveles cognitivos y verbos rectores integrados en vivo', '#8B5CF6', (uiT - 1.8) / 0.5, globalT);
      drawSignalArrow(1420, 250, 1520, 415, 'Asistencia, Sellos por Periodo & Magic Links', 'Calendario histórico de porcentajes y sellado en 1 clic', '#10B981', (uiT - 3.4) / 0.5, globalT);
    }
  }

  // =========================================================================
  // SCENE 6: Generador Curricular SEP NEM 360° & Estudio iSkool
  // =========================================================================
  else if (sc.id === 'scene06') {
    const splitTime = dur * 0.52;
    if (localT < splitTime) {
      drawStudioHeaderAndFooter(
        '2. Portal del Profesor',
        'Centro Maestro de Planeación SEP NEM & Generador Curricular 360°',
        'Planea clases en horarios o días diferidos y genera secuencias oficiales SEP NEM conectadas con todo el sistema.'
      );
      drawStudioScreen('img_07', { zoom: 1.0 + (localT / splitTime) * 0.015 });
      drawSignalArrow(920, 835, 550, 835, 'Agenda Multi-Clase en Horarios Diferidos', 'Prepara sesiones futuras y cárgales su planeación en 1 clic', '#1D68FF', (localT - 0.3) / 0.5, globalT);
      drawSignalArrow(1295, 470, 1295, 615, 'Generador Curricular 360° & Matriz Bloom', 'Sincroniza Pizarra, Libreta, Misiones y Espejo CEO', '#10B981', (localT - 1.5) / 0.5, globalT);
    } else {
      const subT = localT - splitTime;
      drawStudioHeaderAndFooter(
        '2. Portal del Profesor',
        'Estudio iSkool — Clases con Interacción Nunca Antes Vista',
        'Crea clases interactivas de calidad con unos cuantos clics y en pocos minutos: el límite es tu imaginación.'
      );
      drawStudioScreen('img_08', { darkBg: false, zoom: 1.0 + (subT / (dur - splitTime)) * 0.012 });
      drawSignalArrow(510, 420, 235, 420, 'Unos Cuantos Clics', 'Crea clases interactivas en pocos minutos', '#1D68FF', (subT - 0.25) / 0.45, globalT);
      drawSignalArrow(885, 250, 885, 515, 'Interacción Nunca Antes Vista', 'Experiencias dinámicas de alta calidad pedagógica', '#10B981', (subT - 1.0) / 0.45, globalT);
      drawSignalArrow(1310, 680, 1590, 680, 'El Límite es tu Imaginación', 'Simulador de alumno y publicación en tiempo real', '#8B5CF6', (subT - 1.75) / 0.45, globalT);
    }
  }

  // =========================================================================
  // SCENE 7: Libro Mágico Interactivo & Personajes Históricos en 1ª Persona
  // =========================================================================
  else if (sc.id === 'scene07') {
    drawStudioHeaderAndFooter(
      '2. Portal del Profesor',
      'Libro Mágico Interactivo & Personajes Históricos en 1ª Persona',
      'Novela gráfica ilustrada y diálogo vivo en primera persona con rigor histórico verificado en la Bóveda Curricular.'
    );
    drawStudioScreen('img_09', { darkBg: true, zoom: 1.0 + p * 0.015 });

    drawSignalArrow(380, 285, 640, 375, 'Novela Gráfica Histórica Interactiva', 'Viñetas ilustradas que contextualizan cada época', '#F59E0B', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1470, 430, 1085, 495, 'Voz y Diálogo Vivo en 1ª Persona', 'Respuestas con fechas, lugares y hechos históricos reales', '#1D68FF', (localT - 1.8) / 0.5, globalT);
  }

  // =========================================================================
  // SCENE 8: Cortinilla Portal del Estudiante (0..2.2s) -> Misiones (2.2..6.5s) -> Avatares (6.5..dur)
  // =========================================================================
  else if (sc.id === 'scene08') {
    if (localT < 2.2) {
      drawCortinilla(
        'MÓDULO ESTUDIANTIL 03',
        'Portal del Estudiante',
        'Misiones Épicas, Avatares por Mérito, Idiomas Certificados & 20 Mundos Gamificados',
        localT,
        2.2
      );
    } else {
      const uiT = localT - 2.2;
      const remDur = dur - 2.2;
      if (uiT < remDur * 0.52) {
        drawStudioHeaderAndFooter(
          '3. Portal del Estudiante',
          'Tablero de Misiones Épicas & Progreso Curricular XP',
          'Cada clase y tarea del profesor se transforma en una misión épica con puntos de experiencia, rachas y medallas.'
        );
        drawStudioScreen('img_10', { darkBg: true, zoom: 1.0 + (uiT / remDur) * 0.015 });
        drawSignalArrow(290, 320, 495, 415, 'Perfil de Héroe & Compañero Evolucionable', 'Avance motivacional vinculado a la asistencia y tareas', '#1D68FF', (uiT - 0.3) / 0.4, globalT);
        drawSignalArrow(1310, 250, 1310, 395, 'Barra de Rango Académico & XP', 'Recompensas desbloqueadas por desempeño real en clase', '#10B981', (uiT - 1.1) / 0.4, globalT);
      } else {
        const subT = uiT - remDur * 0.52;
        drawStudioHeaderAndFooter(
          '3. Portal del Estudiante',
          'Estudio de Personalización de Avatares por Mérito Académico',
          'Los estudiantes personalizan su avatar desbloqueando atuendos e insignias con las monedas ganadas estudiando.'
        );
        drawStudioScreen('img_11', { darkBg: true, zoom: 1.0 + subT * 0.004 });
        drawSignalArrow(265, 420, 540, 400, 'Tienda de Mérito Académico', 'Cero micropagos: todo se gana con estudio y tareas', '#10B981', (subT - 0.2) / 0.4, globalT);
        drawSignalArrow(1555, 440, 1215, 460, 'Avatar Personalizable por Nivel', 'Identidad estudiantil segura y motivadora', '#8B5CF6', (subT - 1.0) / 0.4, globalT);
      }
    }
  }

  // =========================================================================
  // SCENE 9: Enseñanza de Idiomas & Karaoke Fonético (Cambridge / DELF-DALF / CELTA-DELTA)
  // =========================================================================
  else if (sc.id === 'scene09') {
    const splitT = dur * 0.45;
    if (localT < splitT) {
      drawStudioHeaderAndFooter(
        '3. Portal del Estudiante',
        'Laboratorio de Idiomas — Conversación Interactiva en Vivo',
        'Práctica conversacional guiada con mentores virtuales y control de velocidad gradual de 0.6x a 1.2x.'
      );
      drawStudioScreen('img_12', { darkBg: false, zoom: 1.0 + (localT / splitT) * 0.012 });
      drawSignalArrow(430, 390, 825, 420, 'Mentora Conversacional en Vivo', 'Inmersión natural en Inglés y Francés', '#1D68FF', (localT - 0.3) / 0.5, globalT);
      drawSignalArrow(1520, 560, 1135, 625, 'Velocidad Fonética Adaptativa (0.6x - 1.2x)', 'Escucha y comprende a tu propio ritmo', '#10B981', (localT - 1.3) / 0.5, globalT);
    } else {
      const subT = localT - splitT;
      drawStudioHeaderAndFooter(
        '3. Portal del Estudiante',
        'Karaoke de Fluidez Fonética — Certificación Cambridge, DELF/DALF y CELTA/DELTA',
        'Evaluación de pronunciación palabra por palabra en Inglés (Cambridge) y Francés (DELF / DALF bajo metodología CELTA y DELTA).'
      );
      drawStudioScreen('img_13', { darkBg: false, zoom: 1.0 + (subT / (dur - splitT)) * 0.012 });
      drawSignalArrow(1160, 225, 1160, 505, 'Karaoke de Fluidez Fonética en Vivo', 'Retroalimentación acústica palabra por palabra al hablar', '#10B981', (subT - 0.3) / 0.5, globalT);
      drawSignalArrow(1620, 615, 1410, 755, 'Inglés Cambridge + Francés DELF / DALF', 'Alineado a estándares internacionales CELTA y DELTA', '#1D68FF', (subT - 1.4) / 0.5, globalT);
    }
  }

  // =========================================================================
  // SCENE 10: Carrusel Dinámico de 20 Tarjetas de Gamificación por Nivel Académico (Pages 8-14)
  // =========================================================================
  else if (sc.id === 'scene10') {
    drawStudioHeaderAndFooter(
      '3. Portal del Estudiante',
      '20 Universos de Gamificación Adaptados por Nivel Académico',
      'Diseños especializados para Preescolar, Primaria, Secundaria y Preparatoria que maximizan la motivación.'
    );

    const cards = [
      { key: 'img_19', level: 'PREESCOLAR', title: 'Touch Tablet: Colores y Frutas', color: '#EC4899' },
      { key: 'img_27', level: 'PREESCOLAR', title: 'La Isla de los Juguetes Mágicos', color: '#EC4899' },
      { key: 'img_28', level: 'PREESCOLAR', title: 'El Reino de las Huellitas', color: '#EC4899' },
      { key: 'img_31', level: 'PREESCOLAR', title: '¡Crea tu Compañero Panda!', color: '#EC4899' },
      { key: 'img_20', level: 'PRIMARIA', title: 'Stargazer Adventure', color: '#10B981' },
      { key: 'img_21', level: 'PRIMARIA', title: 'Academia de Guardianes NEM', color: '#10B981' },
      { key: 'img_22', level: 'PRIMARIA', title: 'Torneo Cartas del Conocimiento', color: '#10B981' },
      { key: 'img_23', level: 'PRIMARIA', title: 'Crónicas de Exploradores', color: '#10B981' },
      { key: 'img_30', level: 'PRIMARIA', title: 'Personalizador de Héroe & Logros', color: '#10B981' },
      { key: 'img_14', level: 'SECUNDARIA', title: 'Metrópolis de Inventores', color: '#1D68FF' },
      { key: 'img_15', level: 'SECUNDARIA', title: 'Gremio Cyber-Saga Battle Pass', color: '#1D68FF' },
      { key: 'img_16', level: 'SECUNDARIA', title: 'Arena de Duelo Sincronizado', color: '#1D68FF' },
      { key: 'img_17', level: 'SECUNDARIA', title: 'Duelo de Cartas Astrales', color: '#1D68FF' },
      { key: 'img_26', level: 'SECUNDARIA', title: 'Nexus Protocol Guild', color: '#1D68FF' },
      { key: 'img_29', level: 'SECUNDARIA', title: 'Avatar Locker Cyber', color: '#1D68FF' },
      { key: 'img_32', level: 'SECUNDARIA', title: 'Boss Evaluación: Silvanus Golem', color: '#1D68FF' },
      { key: 'img_33', level: 'SECUNDARIA', title: 'Final Boss: Nexus Void Drake', color: '#1D68FF' },
      { key: 'img_18', level: 'PREPARATORIA', title: 'UniMastery Pro: Cálculo & Admisión', color: '#8B5CF6' },
      { key: 'img_24', level: 'PREPARATORIA', title: 'Apex Academy Venture Studio', color: '#8B5CF6' },
      { key: 'img_25', level: 'PREPARATORIA', title: 'Portafolio & Credenciales QR', color: '#8B5CF6' }
    ];

    const levels = [
      { name: 'PREESCOLAR (4 MUNDOS)', color: '#EC4899', active: p < 0.25 },
      { name: 'PRIMARIA (5 MUNDOS)', color: '#10B981', active: p >= 0.25 && p < 0.50 },
      { name: 'SECUNDARIA (8 MUNDOS)', color: '#1D68FF', active: p >= 0.50 && p < 0.80 },
      { name: 'PREPARATORIA (3 MUNDOS)', color: '#8B5CF6', active: p >= 0.80 }
    ];
    levels.forEach((lv, i) => {
      const lx = 140 + i * 420;
      const ly = 104;
      ctx.save();
      ctx.fillStyle = lv.active ? lv.color : '#FFFFFF';
      ctx.shadowColor = 'rgba(10,25,58,0.08)';
      ctx.shadowBlur = 12;
      roundRect(ctx, lx, ly, 390, 44, 22);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = lv.color;
      ctx.stroke();
      ctx.fillStyle = lv.active ? '#FFFFFF' : lv.color;
      ctx.font = '800 16px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(lv.name, lx + 195, ly + 28);
      ctx.restore();
    });

    const cardW = 520;
    const cardH = 340;
    const gapX = 45;
    const totalScrollW = 10 * (cardW + gapX);
    const scrollX = p * (totalScrollW - 1720);

    for (let i = 0; i < 20; i++) {
      const row = i % 2;
      const col = Math.floor(i / 2);
      const cx = 100 + col * (cardW + gapX) - scrollX + (row === 1 ? 120 : 0);
      const cy = row === 0 ? 172 : 552;

      if (cx + cardW < -50 || cx > 1970) continue;

      const c = cards[i];
      const img = IMAGES[c.key];

      ctx.save();
      ctx.shadowColor = 'rgba(10, 25, 58, 0.16)';
      ctx.shadowBlur = 26;
      ctx.shadowOffsetY = 10;
      ctx.fillStyle = '#FFFFFF';
      roundRect(ctx, cx, cy, cardW, cardH, 22);
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = c.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      if (img) {
        ctx.save();
        roundRect(ctx, cx + 8, cy + 8, cardW - 16, cardH - 68, 16);
        ctx.clip();
        ctx.drawImage(img, cx + 8, cy + 8, cardW - 16, cardH - 68);
        ctx.restore();
      }

      ctx.fillStyle = c.color;
      roundRect(ctx, cx + 16, cy + cardH - 48, 138, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.level, cx + 16 + 69, cy + cardH - 27);

      ctx.fillStyle = '#0A193A';
      ctx.font = '800 18px "Segoe UI", sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(c.title, cx + 168, cy + cardH - 26);

      ctx.restore();
    }
  }

  // =========================================================================
  // SCENE 11: Cortinilla Padres (0..2.2s) -> Muro/Avisos (2.2..6.5s) -> Estado de Cuenta/Pagos (6.5..dur)
  // =========================================================================
  else if (sc.id === 'scene11') {
    if (localT < 2.2) {
      drawCortinilla(
        'MÓDULO FAMILIAR 04',
        'Portal del Padre de Familia',
        'Muro de Logros, Avisos con Firma de Enterado, Estado de Cuenta & Facturación SAT 4.0',
        localT,
        2.2
      );
    } else {
      const uiT = localT - 2.2;
      const remDur = dur - 2.2;
      if (uiT < remDur * 0.48) {
        drawStudioHeaderAndFooter(
          '4. Portal del Padre de Familia',
          'Muro de Logros Académicos & Bandeja de Avisos Escolares',
          'Comunicación transparente: consulta de sellos de libreta, avisos urgentes y firma digital de enterado.'
        );
        drawStudioScreen('img_34', { x: 70, y: 112, w: 980, h: 845 });
        drawStudioScreen('img_35', { x: 1080, y: 112, w: 770, h: 845 });

        drawSignalArrow(360, 225, 480, 420, 'Muro de Logros y Sellos del Hijo', 'Seguimiento diario desde celular o computadora', '#1D68FF', (uiT - 0.3) / 0.4, globalT);
        drawSignalArrow(1465, 225, 1465, 395, 'Avisos y Confirmación de Enterado', 'Trazabilidad total de lectura para el colegio', '#10B981', (uiT - 1.1) / 0.4, globalT);
      } else {
        const subT = uiT - remDur * 0.48;
        drawStudioHeaderAndFooter(
          '4. Portal del Padre de Familia',
          'Estado de Cuenta Escolar, Pasarela de Pagos & Facturación Automática SAT CFDI 4.0',
          'Pago de colegiaturas en línea con tarjeta, transferencia SPEI o referencia y timbrado fiscal CFDI 4.0 al instante.'
        );
        drawStudioScreen('img_36', { x: 70, y: 112, w: 1010, h: 845 });
        drawStudioScreen('img_37', { x: 1110, y: 112, w: 740, h: 845, darkBg: true });

        drawSignalArrow(575, 225, 855, 415, 'Timbrado Automático SAT CFDI 4.0', 'Factura enviada al instante tras confirmar el pago', '#1D68FF', (subT - 0.2) / 0.4, globalT);
        drawSignalArrow(1480, 225, 1310, 395, 'Pasarela Multipago (Tarjeta / SPEI)', 'Conciliación bancaria automática sin carga administrativa', '#10B981', (subT - 1.0) / 0.4, globalT);
      }
    }
  }

  // =========================================================================
  // SCENE 12: Gran Cierre de Ventas & Agendamiento de Cita con QR Oficial (contacto@iskool.mx / 5611404767 / 5511404767)
  // =========================================================================
  else if (sc.id === 'scene12') {
    const enter = easeOutCubic(localT / 0.7);

    // Executive Closing Background
    ctx.drawImage(IMAGES.ctaBg, 0, 0, 1920, 1080);

    const grad = ctx.createRadialGradient(960, 500, 100, 960, 540, 960);
    grad.addColorStop(0, 'rgba(255,255,255,0.94)');
    grad.addColorStop(0.7, 'rgba(248,250,252,0.86)');
    grad.addColorStop(1, 'rgba(219,234,254,0.60)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Main Executive Sales Container
    const cw = 1720;
    const ch = 910;
    const cx = (1920 - cw) / 2;
    const cy = (1080 - ch) / 2 + (1 - enter) * 24;

    ctx.save();
    ctx.shadowColor = 'rgba(10, 25, 58, 0.18)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.97)';
    roundRect(ctx, cx, cy, cw, ch, 40);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(29, 104, 255, 0.32)';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Official iSkool® Logo Centered at Top
    const logo = IMAGES.logo;
    if (logo) {
      const lw = 320;
      const lh = lw * (logo.height / logo.width);
      ctx.drawImage(logo, 960 - lw / 2, cy + 20, lw, lh);
    }

    // Sales Headline
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0A193A';
    ctx.font = '900 45px "Segoe UI", sans-serif';
    ctx.fillText('Lleva tu Institución Educativa al Estándar Mundial', 960, cy + 192);

    ctx.fillStyle = '#1D68FF';
    ctx.font = '700 25px "Segoe UI", sans-serif';
    ctx.fillText('Agenda hoy mismo tu Demostración Ejecutiva Personalizada', 960, cy + 232);

    // 3-Column Executive Layout: Left (Email) | Center (Official WhatsApp QR) | Right (Phones)
    const colY = cy + 262;
    const colH = 405;

    // Column 1: Correo Oficial (contacto@iskool.mx)
    const c1X = cx + 45;
    const c1W = 525;
    ctx.shadowColor = 'rgba(29, 104, 255, 0.14)';
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#F8FAFF';
    roundRect(ctx, c1X, colY, c1W, colH, 28);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1D68FF';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1D68FF';
    roundRect(ctx, c1X + (c1W - 310) / 2, colY + 30, 310, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CORREO ELECTRÓNICO OFICIAL', c1X + c1W / 2, colY + 55);

    ctx.fillStyle = '#0A193A';
    ctx.font = '900 42px "Segoe UI", sans-serif';
    ctx.fillText('contacto@iskool.mx', c1X + c1W / 2, colY + 158);

    ctx.fillStyle = '#1D68FF';
    ctx.font = '700 20px "Segoe UI", sans-serif';
    ctx.fillText('Atención Ejecutiva para Colegios', c1X + c1W / 2, colY + 215);

    ctx.fillStyle = '#475569';
    ctx.font = '600 18px "Segoe UI", sans-serif';
    ctx.fillText('Solicita acceso demo, presentación', c1X + c1W / 2, colY + 280);
    ctx.fillText('para Consejo Directivo y cotización.', c1X + c1W / 2, colY + 308);

    // Column 2 (Centerpiece): Official WhatsApp QR Code (Imagen 3: 5611404767 & contacto@iskool.mx)
    const c2X = cx + 600;
    const c2W = 520;
    ctx.shadowColor = 'rgba(10, 25, 58, 0.20)';
    ctx.shadowBlur = 34;
    ctx.fillStyle = '#FFFFFF';
    roundRect(ctx, c2X, colY - 8, c2W, colH + 16, 32);
    ctx.fill();
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#0A193A';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#0A193A';
    roundRect(ctx, c2X + (c2W - 360) / 2, colY + 12, 360, 36, 18);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ESCANEA PARA WHATSAPP DIRECTO', c2X + c2W / 2, colY + 36);

    const qrImg = IMAGES.qrWhatsapp;
    if (qrImg) {
      const qrSize = 250;
      ctx.drawImage(qrImg, c2X + (c2W - qrSize) / 2, colY + 56, qrSize, qrSize);
    }

    ctx.fillStyle = '#0A193A';
    ctx.font = '900 24px "Segoe UI", sans-serif';
    ctx.fillText('Tel / WhatsApp: 56 1140 4767', c2X + c2W / 2, colY + 338);
    ctx.fillStyle = '#1D68FF';
    ctx.font = '800 19px "Segoe UI", sans-serif';
    ctx.fillText('contacto@iskool.mx', c2X + c2W / 2, colY + 368);

    // Column 3: Teléfono Oficial Único y Atención Comercial (56 1140 4767)
    const c3X = cx + 1150;
    const c3W = 525;
    ctx.shadowColor = 'rgba(16, 185, 129, 0.16)';
    ctx.shadowBlur = 26;
    ctx.fillStyle = '#F2FDF9';
    roundRect(ctx, c3X, colY, c3W, colH, 28);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10B981';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#10B981';
    roundRect(ctx, c3X + (c3W - 350) / 2, colY + 30, 350, 38, 19);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 15px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TELÉFONO Y ATENCIÓN COMERCIAL', c3X + c3W / 2, colY + 55);

    ctx.fillStyle = '#047857';
    ctx.font = '800 17px "Segoe UI", sans-serif';
    ctx.fillText('LÍNEA EJECUTIVA Y WHATSAPP OFICIAL:', c3X + c3W / 2, colY + 122);
    ctx.fillStyle = '#0A193A';
    ctx.font = '900 54px "Segoe UI", sans-serif';
    ctx.fillText('56 1140 4767', c3X + c3W / 2, colY + 188);

    ctx.fillStyle = '#10B981';
    ctx.font = '800 20px "Segoe UI", sans-serif';
    ctx.fillText('Atención Directa a Directores y Colegios', c3X + c3W / 2, colY + 242);

    ctx.fillStyle = '#475569';
    ctx.font = '600 18px "Segoe UI", sans-serif';
    ctx.fillText('Agendamiento inmediato de demostración', c3X + c3W / 2, colY + 292);
    ctx.fillText('en vivo por llamada o WhatsApp.', c3X + c3W / 2, colY + 320);

    // Bottom Institutional Tagline Pill
    ctx.fillStyle = '#0A193A';
    roundRect(ctx, 960 - 630, cy + 836, 1260, 52, 26);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 20px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iSkool®  •  El Cerebro Vivo con IA  •  Tecnología Creada en Canadá para Colegios en México', 960, cy + 869);

    ctx.restore();

    // Clean Signaling Arrows pointing squarely up to the 3 Contact Cards without overlapping the top logo or text
    drawSignalArrow(370, 855, c1X + c1W / 2, colY + colH - 12, 'Escríbenos Ahora', 'contacto@iskool.mx', '#1D68FF', (localT - 0.8) / 0.5, globalT);
    drawSignalArrow(960, 855, 960, colY + colH + 4, 'Escanea el Código QR', 'WhatsApp Directo: 56 1140 4767', '#0A193A', (localT - 1.5) / 0.5, globalT);
    drawSignalArrow(1550, 855, c3X + c3W / 2, colY + colH - 12, 'Llámanos o Agenda Cita', 'Tel. y WhatsApp: 56 1140 4767', '#10B981', (localT - 2.2) / 0.5, globalT);
  }
};
</script>
</body>
</html>`;

  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  await page.evaluate((rawAssets, manifestData) => window.initAssets(rawAssets, manifestData), assets, manifest);

  // Save forensic preview snapshots across ALL key scenes so every single arrow can be verified visually
  const previewSnapshots = [
    { t: 2.2, file: path.join(artifactDir, 'preview_v2_00_keynote_cerebro_vivo_ia_canada.jpg') },
    { t: 10.0, file: path.join(artifactDir, 'preview_v2_01_cinco_pilares_beneficios.jpg') },
    { t: 17.0, file: path.join(artifactDir, 'preview_v2_01a_cinco_pilares_infografia_central.jpg') },
    { t: 22.0, file: path.join(artifactDir, 'preview_v2_cortinilla_ceo.jpg') },
    { t: 27.0, file: path.join(artifactDir, 'preview_v2_01b_resumen_ejecutivo.jpg') },
    { t: 38.0, file: path.join(artifactDir, 'preview_v2_02_admision_360.jpg') },
    { t: 55.0, file: path.join(artifactDir, 'preview_v2_03_triage_cognitivo.jpg') },
    { t: 69.0, file: path.join(artifactDir, 'preview_v2_04_espejo_vivo.jpg') },
    { t: 84.0, file: path.join(artifactDir, 'preview_v2_05_teacher_daylight.jpg') },
    { t: 98.0, file: path.join(artifactDir, 'preview_v2_06a_planeacion_sep.jpg') },
    { t: 106.0, file: path.join(artifactDir, 'preview_v2_06b_estudio_bloques_omr.jpg') },
    { t: 114.0, file: path.join(artifactDir, 'preview_v2_07_libro_magico.jpg') },
    { t: 126.0, file: path.join(artifactDir, 'preview_v2_08a_estudiante_misiones.jpg') },
    { t: 133.0, file: path.join(artifactDir, 'preview_v2_08b_estudiante_avatar.jpg') },
    { t: 141.0, file: path.join(artifactDir, 'preview_v2_09a_idiomas_mentora.jpg') },
    { t: 149.0, file: path.join(artifactDir, 'preview_v2_09b_idiomas_karaoke.jpg') },
    { t: 160.0, file: path.join(artifactDir, 'preview_v2_10_gamificacion_20_mundos.jpg') },
    { t: 173.0, file: path.join(artifactDir, 'preview_v2_11a_padres_muro_avisos.jpg') },
    { t: 181.0, file: path.join(artifactDir, 'preview_v2_11b_padres_pagos_sat.jpg') },
    { t: totalDuration - 3.0, file: path.join(artifactDir, 'preview_v2_12_cta_contacto_qr.jpg') }
  ];
  for (const snap of previewSnapshots) {
    await page.evaluate((t) => window.renderFrameAtTime(t), snap.t);
    const b64 = await page.evaluate(() => canvas.toDataURL('image/jpeg', 0.94).split(',')[1]);
    fs.writeFileSync(snap.file, Buffer.from(b64, 'base64'));
  }
  console.log(`📸 Saved ${previewSnapshots.length} forensic preview snapshots to artifacts.`);

  if (process.argv.includes('--preview-only')) {
    await browser.close();
    console.log('✅ Preview-only mode completed.');
    return;
  }

  // Spawn FFmpeg to encode the master visual stream directly from piped JPEG frames
  const visualMasterMp4 = path.join(rootDir, 'temp_sales_video_assets', 'visual_master_stream.mp4');
  const ffmpegProc = spawn(ffmpegPath, [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'mjpeg',
    '-framerate', String(FPS),
    '-i', '-',
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '14',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    visualMasterMp4
  ], { stdio: ['pipe', 'ignore', 'pipe'] });

  let ffmpegErr = '';
  ffmpegProc.stderr.on('data', (d) => { ffmpegErr += d.toString(); });

  const startTimeMs = Date.now();
  for (let f = 0; f < totalFrames; f++) {
    const t = f / FPS;
    const b64 = await page.evaluate((timeSec) => {
      window.renderFrameAtTime(timeSec);
      return canvas.toDataURL('image/jpeg', 0.98).split(',')[1];
    }, t);
    const frameBuf = Buffer.from(b64, 'base64');
    const canWrite = ffmpegProc.stdin.write(frameBuf);
    if (!canWrite) {
      await new Promise((resolve) => ffmpegProc.stdin.once('drain', resolve));
    }
    if (f % 300 === 0 || f === totalFrames - 1) {
      const pct = ((f + 1) / totalFrames * 100).toFixed(1);
      const elapsed = ((Date.now() - startTimeMs) / 1000).toFixed(1);
      console.log(`  🎞️ Frame ${f + 1}/${totalFrames} (${pct}%) — ${t.toFixed(1)}s rendered [elapsed: ${elapsed}s]`);
    }
  }

  ffmpegProc.stdin.end();
  await new Promise((resolve, reject) => {
    ffmpegProc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}: ${ffmpegErr.slice(-500)}`));
    });
  });

  await browser.close();
  console.log('✅ Master 1080p Visual Stream encoded!');

  // Mux Final Deliverable 1: Con Voz Explicativa + Música Corporativa
  const outConVoz = path.join(rootDir, 'ISkool_Video_Comercial_Ventas_Con_Voz.mp4');
  const audioConVoz = path.join(audioDir, 'master_audio_con_voz.wav');
  execFileSync(ffmpegPath, [
    '-y',
    '-i', visualMasterMp4,
    '-i', audioConVoz,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-shortest',
    '-movflags', '+faststart',
    outConVoz
  ], { stdio: 'ignore' });

  // Mux Final Deliverable 2: Sin Voz (Solo Música Corporativa Dinámica)
  const outSinVoz = path.join(rootDir, 'ISkool_Video_Comercial_Ventas_Sin_Voz.mp4');
  const audioSinVoz = path.join(audioDir, 'master_audio_sin_voz.wav');
  execFileSync(ffmpegPath, [
    '-y',
    '-i', visualMasterMp4,
    '-i', audioSinVoz,
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-shortest',
    '-movflags', '+faststart',
    outSinVoz
  ], { stdio: 'ignore' });

  // Also copy both final videos to the artifact directory so they can be linked/inspected directly
  fs.copyFileSync(outConVoz, path.join(artifactDir, 'ISkool_Video_Comercial_Ventas_Con_Voz.mp4'));
  fs.copyFileSync(outSinVoz, path.join(artifactDir, 'ISkool_Video_Comercial_Ventas_Sin_Voz.mp4'));

  console.log('🎉 BOTH OFFICIAL MP4 SALES VIDEOS GENERATED SUCCESSFULLY!');
  console.log('  1.', outConVoz);
  console.log('  2.', outSinVoz);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
