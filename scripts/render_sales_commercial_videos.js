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
const audioDir = path.join(rootDir, 'temp_sales_video_assets', 'audio');
const artifactDir = 'C:/Users/kami-/.gemini/antigravity/brain/fde3a4d8-54b9-4be2-95e3-e8a0eb4d4f5b';

const officialLogoPath = path.join(artifactDir, '.user_uploaded', 'media_1793685015325_34960e51.jpg');
const bumperBgPath = path.join(artifactDir, 'iskool_bumper_daylight_bg_1793686782872.jpg');
const ctaBgPath = path.join(artifactDir, 'iskool_cta_executive_bg_1793686795356.jpg');

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

  ctx.drawImage(img, dx, dy, dw, dh);

  // Surgically mask bottom-left 54x54px of the drawn image if it had a dev badge
  ctx.fillStyle = opts.darkBg ? '#0B1120' : '#F8FAFC';
  ctx.fillRect(dx, dy + dh - 52 * scale, 52 * scale, 52 * scale);

  ctx.restore();
  return { x, y, w, h, dx, dy, dw, dh };
}

// Draw Clean Vector Signaling Arrow (Flecha de Señalización Sin Ruido Visual)
function drawSignalArrow(fromX, fromY, toX, toY, label, sublabel, color = '#1D68FF', progress = 1.0, globalT = 0) {
  const p = easeOutCubic(clamp(progress));
  if (p <= 0.01) return;

  ctx.save();
  ctx.globalAlpha = p;

  // 1. Pulsing Target Ring at (toX, toY)
  const pulse = 0.5 + 0.5 * Math.sin(globalT * 7.5);
  ctx.beginPath();
  ctx.arc(toX, toY, 18 + pulse * 12, 0, Math.PI * 2);
  ctx.fillStyle = color === '#1D68FF' ? 'rgba(29, 104, 255, 0.18)' : 'rgba(16, 185, 129, 0.20)';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(toX, toY, 10, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();

  // 2. Animated Vector Shaft from (fromX, fromY) to (toX, toY)
  const curX = fromX + (toX - fromX) * p;
  const curY = fromY + (toY - fromY) * p;

  // White halo outline for 100% contrast on both light and dark UIs
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(curX, curY);
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(curX, curY);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'round';
  ctx.stroke();

  // 3. Crisp Vector Arrowhead at (curX, curY)
  const angle = Math.atan2(toY - fromY, toX - fromX);
  const headLen = 20;
  ctx.save();
  ctx.translate(curX, curY);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(4, 0);
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

  // 4. Minimalist Executive Callout Pill at (fromX, fromY)
  if (label) {
    ctx.font = '800 20px "Segoe UI", sans-serif';
    const w1 = ctx.measureText(label).width;
    ctx.font = '600 15px "Segoe UI", sans-serif';
    const w2 = sublabel ? ctx.measureText(sublabel).width : 0;
    const pillW = Math.max(w1, w2) + 44;
    const pillH = sublabel ? 64 : 44;

    // Position pill neatly behind the arrow origin
    const dirX = fromX <= toX ? -1 : 0;
    const px = dirX === -1 ? Math.max(24, fromX - pillW + 16) : Math.min(1896 - pillW, fromX - 16);
    const py = fromY <= toY ? Math.max(24, fromY - pillH - 6) : Math.min(1056 - pillH, fromY + 6);

    ctx.shadowColor = 'rgba(10, 25, 58, 0.24)';
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

    // Left accent bar
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
  roundRect(ctx, 605, 22, 540, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#1D68FF';
  ctx.font = '700 16px "Segoe UI", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(stepBadge, 605 + 270, 47);

  // Top-right subtle sales contact badge
  ctx.textAlign = 'right';
  ctx.fillStyle = '#0A193A';
  ctx.font = '800 16px "Segoe UI", sans-serif';
  ctx.fillText('contacto@iskool.mx  •  Tel. 55 1140 4767', 1856, 48);

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
  // SCENE 1: Logo Intro (0..3.5s) -> Cortinilla CEO (3.5..6.2s) -> Resumen Ejecutivo (6.2..dur)
  // =========================================================================
  if (sc.id === 'scene01') {
    if (localT < 3.5) {
      // Official iSkool® Keynote Opening
      const ep = easeOutCubic(localT / 0.8);
      ctx.drawImage(IMAGES.bumperBg, 0, 0, 1920, 1080);
      drawLogoBadge(960 - 380, 290, 760, 290, 0.88 + ep * 0.12);
      ctx.fillStyle = '#0A193A';
      ctx.font = '900 46px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('El Ecosistema Educativo Integral de Clase Mundial', 960, 675);
      ctx.fillStyle = '#1D68FF';
      ctx.font = '700 26px "Segoe UI", sans-serif';
      ctx.fillText('Dirección General  •  Docencia SEP NEM  •  Gamificación  •  Padres de Familia', 960, 730);
    } else if (localT < 6.2) {
      drawCortinilla(
        'MÓDULO EJECUTIVO 01',
        'Portal de CEO',
        'Gobernanza Escolar, Admisión 360°, Triage Cognitivo & Supervisión en Vivo',
        localT - 3.5,
        2.7
      );
    } else {
      const uiT = localT - 6.2;
      drawStudioHeaderAndFooter(
        '1. Portal de CEO',
        'Consola de Mando Corporativo & Resumen Ejecutivo',
        'Controla en tiempo real matrícula, asistencia, cobertura SEP NEM y cobranza consolidada por plantel.'
      );
      drawStudioScreen('img_02', { zoom: 1.0 + uiT * 0.004 });

      drawSignalArrow(520, 230, 360, 365, 'KPIs Globales en Tiempo Real', 'Matrícula, 95% Cobertura SEP y 94% Cobranza', '#1D68FF', (uiT - 0.3) / 0.5, globalT);
      drawSignalArrow(620, 620, 430, 560, 'Focos de Atención Directiva', 'Alertas automáticas de cobranza, reinscripción y triage', '#10B981', (uiT - 1.5) / 0.5, globalT);
      drawSignalArrow(1420, 520, 1280, 640, 'Avance Comparativo por Colegio', 'Auditoría multicampus en un solo clic', '#8B5CF6', (uiT - 2.8) / 0.5, globalT);
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
    drawStudioScreen('img_03', { zoom: 1.0 + p * 0.02 });

    // Sequential arrows showing how a student advances across the funnel
    drawSignalArrow(330, 235, 395, 370, '1. Captación & Visita al Campus', 'Registro automático desde WhatsApp y seguimiento', '#1D68FF', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(880, 235, 980, 370, '2. Diagnóstico & Carta de Asignación', 'Evaluación psicopedagógica y comité académico', '#F59E0B', (localT - 2.2) / 0.5, globalT);
    drawSignalArrow(1470, 235, 1610, 420, '3. Inscripción Pagada SEP', 'Cierre de matrícula y alta automática de expediente', '#10B981', (localT - 4.0) / 0.5, globalT);
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
    drawStudioScreen('img_04', { zoom: 1.0 + p * 0.025 });

    drawSignalArrow(720, 240, 890, 360, 'Triage Cognitivo Automático', 'De 299 correos recibidos, filtra solo 9 críticos', '#EF4444', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1480, 235, 1590, 360, '3.8 Horas Ahorradas al Día', '290 correos delegados o filtrados sin interrupciones', '#1D68FF', (localT - 2.2) / 0.5, globalT);
    drawSignalArrow(1340, 620, 1540, 515, 'Detección de Patrones & Circular 1-Clic', 'Responde masivamente a familias sin saturar dirección', '#10B981', (localT - 4.2) / 0.5, globalT);
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
    drawStudioScreen('img_05', { zoom: 1.0 + p * 0.02 });

    drawSignalArrow(480, 260, 560, 415, 'Matriz de Desempeño Docente', '98% Cobertura PDA SEP y rúbricas activas por plantel', '#1D68FF', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1190, 260, 1340, 440, 'Modo Espejo en Aula en Vivo (1:1)', 'Supervisa Inicio, Desarrollo y Cierre en tiempo real', '#10B981', (localT - 2.3) / 0.5, globalT);
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
      drawStudioScreen('img_06', { zoom: 1.0 + uiT * 0.004 });

      drawSignalArrow(370, 560, 210, 560, 'Barra Lateral Intuitiva', 'Acceso inmediato a Mi Clase, Sellos, Planeación y Ajustes', '#1D68FF', (uiT - 0.4) / 0.5, globalT);
      drawSignalArrow(880, 620, 820, 770, 'Taxonomía de Bloom en Aula', '6 niveles cognitivos y verbos rectores integrados en vivo', '#8B5CF6', (uiT - 2.0) / 0.5, globalT);
      drawSignalArrow(1340, 260, 1460, 395, 'Asistencia, Sellos por Periodo & Magic Links', 'Calendario histórico de porcentajes y sellado en 1 clic', '#10B981', (uiT - 3.8) / 0.5, globalT);
    }
  }

  // =========================================================================
  // SCENE 6: Generador Curricular SEP NEM 360° & Estudio iSkool de Bloques
  // =========================================================================
  else if (sc.id === 'scene06') {
    const splitTime = dur * 0.52;
    if (localT < splitTime) {
      drawStudioHeaderAndFooter(
        '2. Portal del Profesor',
        'Centro Maestro de Planeación SEP NEM & Generador Curricular 360°',
        'Planea clases en horarios o días diferidos y genera secuencias oficiales SEP NEM conectadas con todo el sistema.'
      );
      drawStudioScreen('img_07', { zoom: 1.0 + (localT / splitTime) * 0.02 });
      drawSignalArrow(660, 240, 820, 395, 'Agenda Multi-Clase en Horarios Diferidos', 'Prepara sesiones futuras y cárgales su planeación en 1 clic', '#1D68FF', (localT - 0.3) / 0.5, globalT);
      drawSignalArrow(1260, 510, 1420, 635, 'Generador Curricular IA 360° & Matriz Bloom', 'Sincroniza Pizarra, Libreta, Misiones y Espejo CEO', '#10B981', (localT - 1.6) / 0.5, globalT);
    } else {
      const subT = localT - splitTime;
      drawStudioHeaderAndFooter(
        '2. Portal del Profesor',
        'Estudio iSkool — Constructor Visual de Bloques Interactivos',
        'Diseña actividades interactivas, trivias y entregables digitales mediante nodos visuales listos para proyectar.'
      );
      drawStudioScreen('img_08', { darkBg: true, zoom: 1.0 + (subT / (dur - splitTime)) * 0.02 });
      drawSignalArrow(540, 320, 340, 480, 'Biblioteca de Bloques Pedagógicos', 'Arrastra actividades, retos y rúbricas al instante', '#1D68FF', (subT - 0.3) / 0.5, globalT);
      drawSignalArrow(1280, 340, 1020, 520, 'Lienzo de Nodos Interactivos', 'Publica directo al Portal del Estudiante con recompensa XP', '#10B981', (subT - 1.4) / 0.5, globalT);
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
    drawStudioScreen('img_09', { darkBg: true, zoom: 1.0 + p * 0.025 });

    drawSignalArrow(480, 280, 680, 440, 'Novela Gráfica Histórica Interactiva', 'Viñetas ilustradas que contextualizan cada época', '#F59E0B', (localT - 0.4) / 0.5, globalT);
    drawSignalArrow(1380, 640, 1140, 540, 'Voz y Diálogo Vivo en 1ª Persona', 'Respuestas con fechas, lugares y hechos históricos reales', '#1D68FF', (localT - 2.0) / 0.5, globalT);
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
        drawStudioScreen('img_10', { darkBg: true, zoom: 1.0 + (uiT / remDur) * 0.02 });
        drawSignalArrow(580, 250, 430, 390, 'Perfil de Héroe & Compañero Evolucionable', 'Avance motivacional vinculado a la asistencia y tareas', '#1D68FF', (uiT - 0.3) / 0.4, globalT);
        drawSignalArrow(1220, 540, 1340, 390, 'Barra de Rango Académico & XP', 'Recompensas desbloqueadas por desempeño real en clase', '#10B981', (uiT - 1.2) / 0.4, globalT);
      } else {
        const subT = uiT - remDur * 0.52;
        drawStudioHeaderAndFooter(
          '3. Portal del Estudiante',
          'Estudio de Personalización de Avatares por Mérito Académico',
          'Los estudiantes personalizan su avatar desbloqueando atuendos e insignias con las monedas ganadas estudiando.'
        );
        drawStudioScreen('img_11', { darkBg: true, zoom: 1.0 + subT * 0.005 });
        drawSignalArrow(540, 340, 690, 490, 'Avatar 3D Personalizable', 'Identidad estudiantil segura y motivadora', '#8B5CF6', (subT - 0.2) / 0.4, globalT);
        drawSignalArrow(1360, 360, 1210, 520, 'Tienda de Mérito Académico', 'Cero micropagos: todo se gana con estudio y tareas', '#10B981', (subT - 1.1) / 0.4, globalT);
      }
    }
  }

  // =========================================================================
  // SCENE 9: Enseñanza de Idiomas & Karaoke Fonético (Cambridge / DELF-DALF / CELTA-DELTA)
  // =========================================================================
  else if (sc.id === 'scene09') {
    const splitT = dur * 0.44;
    if (localT < splitT) {
      drawStudioHeaderAndFooter(
        '3. Portal del Estudiante',
        'Laboratorio de Idiomas — Conversación Interactiva en Vivo',
        'Práctica conversacional guiada con mentores virtuales y control de velocidad gradual de 0.6x a 1.2x.'
      );
      drawStudioScreen('img_12', { darkBg: true, zoom: 1.0 + (localT / splitT) * 0.02 });
      drawSignalArrow(520, 320, 430, 480, 'Mentora Conversacional en Vivo', 'Inmersión natural en Inglés y Francés', '#1D68FF', (localT - 0.3) / 0.5, globalT);
      drawSignalArrow(1340, 250, 1240, 155, 'Velocidad Fonética Adaptativa (0.6x - 1.2x)', 'Escucha y comprende a tu propio ritmo', '#10B981', (localT - 1.4) / 0.5, globalT);
    } else {
      const subT = localT - splitT;
      drawStudioHeaderAndFooter(
        '3. Portal del Estudiante',
        'Karaoke de Fluidez Fonética — Certificación Cambridge, DELF/DALF y CELTA/DELTA',
        'Evaluación de pronunciación palabra por palabra en Inglés (Cambridge) y Francés (DELF / DALF bajo metodología CELTA y DELTA).'
      );
      drawStudioScreen('img_13', { darkBg: true, zoom: 1.0 + (subT / (dur - splitT)) * 0.02 });
      drawSignalArrow(540, 300, 740, 415, 'Karaoke de Fluidez Fonética en Vivo', 'Retroalimentación acústica palabra por palabra al hablar', '#10B981', (subT - 0.3) / 0.5, globalT);
      drawSignalArrow(1320, 620, 1120, 500, 'Inglés Cambridge + Francés DELF / DALF', 'Alineado a estándares internacionales CELTA y DELTA', '#1D68FF', (subT - 1.6) / 0.5, globalT);
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

    // Level indicator pills at top of stage
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

    // Smooth dual-row sliding card showcase showing all 20 cards cleanly
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

      // Level Badge
      ctx.fillStyle = c.color;
      roundRect(ctx, cx + 16, cy + cardH - 48, 138, 32, 16);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 13px "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(c.level, cx + 16 + 69, cy + cardH - 27);

      // Card Title
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
        // Side-by-side showcase of img_34 (Muro de Logros) and img_35 (Bandeja de Avisos)
        drawStudioScreen('img_34', { x: 70, y: 112, w: 980, h: 845 });
        drawStudioScreen('img_35', { x: 1080, y: 112, w: 770, h: 845 });

        drawSignalArrow(380, 260, 520, 440, 'Muro de Logros y Sellos del Hijo', 'Seguimiento diario desde celular o computadora', '#1D68FF', (uiT - 0.3) / 0.4, globalT);
        drawSignalArrow(1340, 260, 1460, 430, 'Avisos y Confirmación de Enterado', 'Trazabilidad total de lectura para el colegio', '#10B981', (uiT - 1.1) / 0.4, globalT);
      } else {
        const subT = uiT - remDur * 0.48;
        drawStudioHeaderAndFooter(
          '4. Portal del Padre de Familia',
          'Estado de Cuenta Escolar, Pasarela de Pagos & Facturación Automática SAT CFDI 4.0',
          'Pago de colegiaturas en línea con tarjeta, transferencia SPEI o referencia y timbrado fiscal CFDI 4.0 al instante.'
        );
        // Side-by-side showcase of img_36 (Estado de Cuenta) and img_37 (Pasarela de Pago)
        drawStudioScreen('img_36', { x: 70, y: 112, w: 1010, h: 845 });
        drawStudioScreen('img_37', { x: 1110, y: 112, w: 740, h: 845 });

        drawSignalArrow(420, 250, 790, 390, 'Timbrado Automático SAT CFDI 4.0', 'Factura enviada al instante tras confirmar el pago', '#1D68FF', (subT - 0.2) / 0.4, globalT);
        drawSignalArrow(1350, 250, 1480, 510, 'Pasarela Multipago (Tarjeta / SPEI)', 'Conciliación bancaria automática sin carga administrativa', '#10B981', (subT - 1.0) / 0.4, globalT);
      }
    }
  }

  // =========================================================================
  // SCENE 12: Gran Cierre de Ventas & Agendamiento de Cita (contacto@iskool.mx / 5511404767)
  // =========================================================================
  else if (sc.id === 'scene12') {
    const enter = easeOutCubic(localT / 0.7);

    // Executive Closing Background
    ctx.drawImage(IMAGES.ctaBg, 0, 0, 1920, 1080);

    // Soft bright studio overlay
    const grad = ctx.createRadialGradient(960, 500, 100, 960, 540, 960);
    grad.addColorStop(0, 'rgba(255,255,255,0.92)');
    grad.addColorStop(0.7, 'rgba(248,250,252,0.82)');
    grad.addColorStop(1, 'rgba(219,234,254,0.55)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1920, 1080);

    // Main Executive Sales Container
    const cw = 1520;
    const ch = 840;
    const cx = (1920 - cw) / 2;
    const cy = (1080 - ch) / 2 + (1 - enter) * 28;

    ctx.save();
    ctx.shadowColor = 'rgba(10, 25, 58, 0.18)';
    ctx.shadowBlur = 60;
    ctx.shadowOffsetY = 20;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
    roundRect(ctx, cx, cy, cw, ch, 40);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(29, 104, 255, 0.32)';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Official iSkool® Logo Centered
    const logo = IMAGES.logo;
    if (logo) {
      const lw = 420;
      const lh = lw * (logo.height / logo.width);
      ctx.drawImage(logo, 960 - lw / 2, cy + 48, lw, lh);
    }

    // Sales Headline
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0A193A';
    ctx.font = '900 54px "Segoe UI", sans-serif';
    ctx.fillText('Lleva tu Institución Educativa al Estándar Mundial', 960, cy + 285);

    ctx.fillStyle = '#1D68FF';
    ctx.font = '700 30px "Segoe UI", sans-serif';
    ctx.fillText('Agenda hoy mismo tu Demostración Ejecutiva Personalizada', 960, cy + 340);

    // Contact Card 1: Correo Oficial (contacto@iskool.mx)
    const boxW = 640;
    const boxH = 230;
    const box1X = 960 - boxW - 30;
    const box2X = 960 + 30;
    const boxY = cy + 405;

    // Box 1
    ctx.shadowColor = 'rgba(29, 104, 255, 0.16)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#F8FAFF';
    roundRect(ctx, box1X, boxY, boxW, boxH, 28);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#1D68FF';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#1D68FF';
    roundRect(ctx, box1X + 40, boxY + 34, 280, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CORREO DE ATENCIÓN DIRECTA', box1X + 40 + 140, boxY + 60);

    ctx.fillStyle = '#0A193A';
    ctx.font = '900 46px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('contacto@iskool.mx', box1X + 40, boxY + 142);

    ctx.fillStyle = '#475569';
    ctx.font = '600 20px "Segoe UI", sans-serif';
    ctx.fillText('Solicita acceso demo y cotización institucional', box1X + 40, boxY + 188);

    // Box 2: Teléfono Directo (5511404767)
    ctx.shadowColor = 'rgba(16, 185, 129, 0.16)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#F2FDF9';
    roundRect(ctx, box2X, boxY, boxW, boxH, 28);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#10B981';
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#10B981';
    roundRect(ctx, box2X + 40, boxY + 34, 310, 40, 20);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 16px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TELÉFONO Y ATENCIÓN COMERCIAL', box2X + 40 + 155, boxY + 60);

    ctx.fillStyle = '#0A193A';
    ctx.font = '900 52px "Segoe UI", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('5511404767', box2X + 40, boxY + 145);

    ctx.fillStyle = '#047857';
    ctx.font = '700 22px "Segoe UI", sans-serif';
    ctx.fillText('Línea Directa: 55 1140 4767', box2X + 365, boxY + 143);

    ctx.fillStyle = '#475569';
    ctx.font = '600 20px "Segoe UI", sans-serif';
    ctx.fillText('Agendamiento inmediato para Directores y Colegios', box2X + 40, boxY + 188);

    // Bottom Institutional Tagline Pill
    ctx.fillStyle = '#0A193A';
    roundRect(ctx, 960 - 520, cy + 690, 1040, 74, 37);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 24px "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('iSkool®  •  El Futuro de la Educación y la Gestión Escolar, Hoy.', 960, cy + 736);

    ctx.restore();

    // Animated signaling arrows pointing to the email and phone number
    drawSignalArrow(220, 780, box1X + 80, boxY + 135, 'Escríbenos Ahora', 'contacto@iskool.mx', '#1D68FF', (localT - 1.0) / 0.5, globalT);
    drawSignalArrow(1700, 780, box2X + boxW - 80, boxY + 135, 'Llámanos o Agenda Cita', '5511404767', '#10B981', (localT - 2.0) / 0.5, globalT);
  }
};
</script>
</body>
</html>`;

  await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });
  await page.evaluate((rawAssets, manifestData) => window.initAssets(rawAssets, manifestData), assets, manifest);

  // Save 4 high-res preview frames for the Forensic Audit Report artifact
  const previewSnapshots = [
    { t: 4.8, file: path.join(artifactDir, 'preview_sales_cortinilla_ceo.jpg') },
    { t: 33.0, file: path.join(artifactDir, 'preview_sales_triage_cognitivo.jpg') },
    { t: 54.0, file: path.join(artifactDir, 'preview_sales_teacher_daylight.jpg') },
    { t: totalDuration - 3.0, file: path.join(artifactDir, 'preview_sales_cta_contacto.jpg') }
  ];
  for (const snap of previewSnapshots) {
    await page.evaluate((t) => window.renderFrameAtTime(t), snap.t);
    const b64 = await page.evaluate(() => canvas.toDataURL('image/jpeg', 0.94).split(',')[1]);
    fs.writeFileSync(snap.file, Buffer.from(b64, 'base64'));
  }
  console.log('📸 Saved 4 forensic preview snapshots to artifacts.');

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
    '-crf', '17',
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
      return canvas.toDataURL('image/jpeg', 0.92).split(',')[1];
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
    '-b:a', '192k',
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
    '-b:a', '192k',
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
