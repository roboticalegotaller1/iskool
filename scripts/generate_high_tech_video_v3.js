const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const outputDir = path.join(__dirname, '..');
const screenshotsDir = path.join(outputDir, 'presentation_screenshots');

// Helper to convert image to base64 data URI
function getBase64Image(filename) {
  const p = path.join(screenshotsDir, filename);
  if (!fs.existsSync(p)) {
    throw new Error(`Screenshot not found: ${p}`);
  }
  const data = fs.readFileSync(p);
  return 'data:image/png;base64,' + data.toString('base64');
}

console.log('📦 Loading and encoding real ISkool screenshots to Base64...');
const imagesData = {
  teacherHub: getBase64Image('screen_teacher_hub.png'),
  studentHero: getBase64Image('screen_student_hero.png'),
  teacherPlanning: getBase64Image('screen_teacher_planning_nem.png'),
  studioCanvas: getBase64Image('screen_studio_canvas.png'),
  studentMissions: getBase64Image('screen_student_missions.png'),
  expediente360: getBase64Image('screen_expediente_360_real.png'),
  parentPortal: getBase64Image('screen_parent_portal.png'),
  directorSupervision: getBase64Image('screen_director_supervision.png'),
  finanzasAdmin: getBase64Image('screen_finanzas_admin.png')
};
console.log('✅ All 9 real ISkool screenshots encoded successfully!');

const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ISkool Ultimate High-Tech Engine V3.1 - Real Screenshots</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1920px;
      height: 1080px;
      background: #050811;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    #c {
      width: 1920px;
      height: 1080px;
      display: block;
    }
  </style>
</head>
<body>
  <canvas id="c" width="1920" height="1080"></canvas>

  <script>
    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');

    const TOTAL_SECONDS = 90.0;
    const FPS = 30;

    // Preload all real ISkool screenshot images
    const IMAGES_SRC = ${JSON.stringify(imagesData)};
    const loadedImages = {};
    let imagesReady = false;

    let loadedCount = 0;
    const imgKeys = Object.keys(IMAGES_SRC);
    imgKeys.forEach(k => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        if (loadedCount === imgKeys.length) {
          imagesReady = true;
          console.log('All real ISkool images loaded ready in Canvas!');
        }
      };
      img.src = IMAGES_SRC[k];
      loadedImages[k] = img;
    });

    // Helper: Rounded Rectangle
    function roundRect(ctx, x, y, w, h, r, fill, stroke) {
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
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    // Helper: Top Status Bar & Dark Grid Background
    function drawTechHUD(time, sceneTitle, statusTag, statusColor) {
      // Dark High-Tech Background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, 1920, 1080);

      // Background Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.35)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1920; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke();
      }
      for (let y = 0; y < 1080; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke();
      }

      // Top Status Bar
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, 1920, 56);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(0, 0, 1920, 56);

      // System Identity
      ctx.fillStyle = '#10b981';
      ctx.font = '900 15px "JetBrains Mono", monospace';
      ctx.fillText('● ISKOOL ACADÉMICO · ECOSISTEMA EDUCATIVO INTEGRAL 360°', 48, 35);

      // Center Breadcrumb
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MÓDULO: ' + sceneTitle.toUpperCase(), 760, 34);

      // Status Indicator
      ctx.fillStyle = statusColor || '#10b981';
      roundRect(ctx, 1680, 12, 190, 32, 8, true, false);
      ctx.fillStyle = '#050811';
      ctx.font = '900 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(statusTag || 'EN VIVO 1080P', 1775, 33);
      ctx.textAlign = 'left';
    }

    // Helper: Draw Fast Snappy Cursor
    function drawFastCursor(x, y, clicking, rippleR) {
      ctx.save();
      if (clicking) {
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, rippleR || 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#050811';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 15, y + 24);
      ctx.lineTo(x + 6, y + 23);
      ctx.lineTo(x + 1, y + 34);
      ctx.lineTo(x - 5, y + 31);
      ctx.lineTo(x + 0, y + 20);
      ctx.lineTo(x - 7, y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Helper: Draw Window Mockup with REAL SCREENSHOT from ISkool
    function drawRealScreenWindow(opt) {
      const { x, y, w, title, img, focusReticle, cursorTarget, micro10, phase10 } = opt;
      // Real screenshot aspect ratio is 2160 / 1350 = 1.6 (16:10)
      const h_img = Math.round(w / 1.6);
      const h_header = 46;
      const h_mask = 42; // Sleek institutional mask covering original school navbar
      const totalH = h_header + h_img;

      ctx.save();
      // Outer Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#0f172a';
      roundRect(ctx, x, y, w, totalH, 20, true, false);
      ctx.shadowBlur = 0;

      // Window Header Bar
      ctx.fillStyle = '#090e1a';
      roundRect(ctx, x, y, w, h_header, 20, true, false);
      ctx.fillRect(x, y + 24, w, h_header - 24);

      // macOS Traffic Light Dots
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x + 24, y + 23, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(x + 42, y + 23, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(x + 60, y + 23, 6, 0, Math.PI*2); ctx.fill();

      // URL bar
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "JetBrains Mono", monospace';
      ctx.fillText(title, x + 85, y + 28);

      // Window Status Badge
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, x + w - 175, y + 10, 155, 26, 6, true, false);
      ctx.fillStyle = '#10b981';
      ctx.beginPath(); ctx.arc(x + w - 158, y + 23, 4, 0, Math.PI*2); ctx.fill();
      ctx.font = '800 11px "JetBrains Mono", monospace';
      ctx.fillText('SISTEMA REAL', x + w - 146, y + 27);

      // DRAW THE AUTHENTIC ISKOOL SCREENSHOT
      if (img && img.complete) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y + h_header, w, h_img);
        ctx.clip();
        ctx.drawImage(img, x, y + h_header, w, h_img);
        ctx.restore();
      }

      // Institutional White-Label Header Overlay (Masks any unwanted school name)
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(x, y + h_header, w, h_mask);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.strokeRect(x, y + h_header, w, h_mask);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('🏫 COLEGIO MODELO DE INNOVACIÓN EDUCATIVA', x + 22, y + h_header + 26);

      ctx.fillStyle = '#10b981';
      roundRect(ctx, x + w - 165, y + h_header + 8, 145, 26, 6, true, false);
      ctx.fillStyle = '#050811';
      ctx.font = '900 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CAMPUS DIGITAL', x + w - 92, y + h_header + 25);
      ctx.textAlign = 'left';

      // Window Frame Outer Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, w, totalH, 20, false, true);

      // Focus Reticle on Screenshot Element
      if (focusReticle) {
        const rx = x + focusReticle.relX;
        const ry = y + h_header + focusReticle.relY;
        const rColor = focusReticle.color || '#10b981';
        const rgbStr = focusReticle.rgb || '16, 185, 129';
        const rRadius = 24 + (micro10 % 4) * 2;

        ctx.save();
        ctx.strokeStyle = rColor;
        ctx.lineWidth = 3;
        ctx.shadowColor = rColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.arc(rx, ry, rRadius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = rColor;
        ctx.beginPath();
        ctx.arc(rx, ry, 6, 0, Math.PI * 2);
        ctx.fill();

        // Expanding pulse ring
        const pulseR = rRadius + phase10 * 20;
        ctx.strokeStyle = \`rgba(\${rgbStr}, \${1.0 - phase10})\`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(rx, ry, pulseR, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      // Fast Animated Snappy Cursor
      if (cursorTarget) {
        const cx = x + cursorTarget.relX;
        const cy = y + h_header + cursorTarget.relY;
        drawFastCursor(cx, cy, cursorTarget.clicking, 18 + (micro10 % 6));
      }

      ctx.restore();
    }

    // Helper: Draw High-Contrast HUD Card (Right Side)
    function drawHUDCard(opt) {
      const { x, y, w, h, banner, tag, tagColor, accentColor, title, desc, targetX, targetY, microPulse } = opt;

      // Laser Pointer Line & Target Reticle
      if (targetX !== undefined && targetY !== undefined) {
        ctx.save();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        const startX = x > targetX ? x : x + w;
        const startY = y + h / 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        ctx.setLineDash([]);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        const reticleR = 18 + (microPulse ? (microPulse % 4) : 0);
        ctx.arc(targetX, targetY, reticleR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Card Body
      ctx.save();
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 24;
      ctx.fillStyle = 'rgba(12, 19, 36, 0.98)';
      roundRect(ctx, x, y, w, h, 20, true, false);
      ctx.shadowBlur = 0;

      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      roundRect(ctx, x, y, w, h, 20, false, true);

      // Banner Header
      ctx.fillStyle = accentColor;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(banner.toUpperCase(), x + 28, y + 36);

      // Pill Tag
      if (tag) {
        ctx.fillStyle = tagColor || accentColor;
        roundRect(ctx, x + w - 170, y + 18, 142, 28, 8, true, false);
        ctx.fillStyle = '#070b14';
        ctx.font = '900 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tag.toUpperCase(), x + w - 99, y + 36);
        ctx.textAlign = 'left';
      }

      // Divider
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 54);
      ctx.lineTo(x + w - 28, y + 54);
      ctx.stroke();

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title, x + 28, y + 92);

      // Description
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      const words = desc.split(' ');
      let line = '';
      let lineY = y + 128;
      const maxW = w - 56;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        if (ctx.measureText(testLine).width > maxW && n > 0) {
          ctx.fillText(line, x + 28, lineY);
          line = words[n] + ' ';
          lineY += 26;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x + 28, lineY);
      ctx.restore();
    }

    // MAIN TIMELINE RENDERING (90.0s @ 30fps)
    function renderFrameAtTime(t) {
      const frame = Math.floor(t * FPS);
      const micro10 = Math.floor(frame / 10); // Changes every 10 frames (~0.33s)
      const phase10 = (frame % 10) / 10.0;    // 0.0 to 1.0 within 10 frames

      const winX = 60, winY = 140, winW = 1180;
      // Coordinates of reticles on 1180-wide screenshot
      const reticleScale = winW / 2160;

      // ==============================================================
      // SCENE 1: 0.0s - 9.0s | GANCHO ESTRATÉGICO & SUITE ACADÉMICA
      // ==============================================================
      if (t >= 0 && t < 9.0) {
        drawTechHUD(t, 'Suite Pedagógica · Tesis Central', 'Académico > Cobro', '#10b981');

        const retX = Math.round(280 * reticleScale + 120);
        const retY = Math.round(340 * reticleScale + 160);

        // Real Teacher Hub Screenshot
        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/teacher (Bóveda Curricular & Hub Docente)',
          img: loadedImages.teacherHub,
          focusReticle: { relX: retX, relY: retY, color: '#10b981', rgb: '16, 185, 129' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 370,
          banner: 'Estrategia de Ventas Institucional',
          tag: 'Tesis de Oro', tagColor: '#f59e0b', accentColor: '#f59e0b',
          title: '¿Tu software solo cobra mensualidades?',
          desc: 'Un gran colegio no se define por su caja registradora. Lo verdaderamente valioso es lo que ocurre en el aula: excelencia docente, metodologías activas y alumnos motivados.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 545, w: 590, h: 380,
          banner: 'Ecosistema Integral 360°',
          tag: 'NEM 2024 Oficial', tagColor: '#10b981', accentColor: '#10b981',
          title: 'El Corazón Pedagógico Escolar',
          desc: 'ISkool integra en una sola plataforma: Bóveda Curricular con +1,500 contenidos SEP, planeación en 3 segundos, 17 dinámicas interactivas y expediente 360°.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 2: 9.0s - 21.0s | ¿QUÉ ES LA GAMIFICACIÓN EN ISKOOL?
      // ==============================================================
      else if (t >= 9.0 && t < 21.0) {
        drawTechHUD(t, 'Metodología · ¿Qué es la Gamificación Educativa?', 'Pedagogía Activa', '#f59e0b');

        // Real Student Hero Portal Screenshot
        const retX = Math.round(520 * reticleScale + 80);
        const retY = Math.round(410 * reticleScale + 120);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/student (Camino del Héroe del Alumno)',
          img: loadedImages.studentHero,
          focusReticle: { relX: retX, relY: retY, color: '#f59e0b', rgb: '245, 158, 11' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 380,
          banner: 'Fundamento Pedagógico Comprobado',
          tag: 'Aprender Haciendo', tagColor: '#f59e0b', accentColor: '#f59e0b',
          title: '¿Qué es Gamificación en ISkool?',
          desc: 'No es poner videojuegos distractores; es transformar los contenidos de la SEP en retos de superación, escape rooms y misiones colaborativas que elevan un 95% la atención en el aula.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 550, w: 590, h: 375,
          banner: 'Filosofía Ética Institucional',
          tag: '100% Mérito Escolar', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Cero Dinero Real · Sin Microtransacciones',
          desc: 'A diferencia de apps comerciales, en ISkool todo se gana exclusivamente con tareas cumplidas a tiempo, esfuerzo de lectura y valores cívicos. Fomenta constancia y carácter.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 3: 21.0s - 32.0s | BÓVEDA CURRICULAR Y PLANEACIÓN NEM
      // ==============================================================
      else if (t >= 21.0 && t < 32.0) {
        drawTechHUD(t, 'Bóveda Curricular & Planeación NEM 2024', 'Generación 3s', '#0284c7');

        // Real Teacher Planning NEM Screenshot
        const retX = Math.round(410 * reticleScale + 60);
        const retY = Math.round(330 * reticleScale + 120);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/teacher/planning (Generador Oficial NEM 2024)',
          img: loadedImages.teacherPlanning,
          focusReticle: { relX: retX, relY: retY, color: '#0284c7', rgb: '2, 132, 199' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 375,
          banner: 'Articulación Oficial SEP 2024',
          tag: '+1,500 Contenidos', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Bóveda Curricular Centralizada',
          desc: 'Más de 1,500 contenidos y Procesos de Desarrollo de Aprendizaje (PDA) de la SEP totalmente integrados. El docente selecciona su grado y tema oficial sin inventar ni improvisar.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 545, w: 590, h: 380,
          banner: 'Productividad Docente sin Sobrecarga',
          tag: 'En 3 Segundos', tagColor: '#0284c7', accentColor: '#0284c7',
          title: 'Momentos de Clase y Rúbricas Oficiales',
          desc: 'Sesiones analíticas cronometradas: Inicio (activación), Desarrollo (libro SEP colaborativo) y Cierre con rúbrica analítica oficial de 4 niveles lista para boleta.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 4: 32.0s - 44.0s | ESTUDIO DE 17 DINÁMICAS DE APRENDIZAJE
      // ==============================================================
      else if (t >= 32.0 && t < 44.0) {
        drawTechHUD(t, 'Estudio Interactivo · 17 Dinámicas de Juego', 'Lienzo Didáctico', '#10b981');

        // Real Studio Canvas Screenshot
        const retX = Math.round(540 * reticleScale + 120);
        const retY = Math.round(380 * reticleScale + 130);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/teacher/studio (Lienzo Digital de Retos)',
          img: loadedImages.studioCanvas,
          focusReticle: { relX: retX, relY: retY, color: '#10b981', rgb: '16, 185, 129' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 380,
          banner: 'Gamificación Pedagógica Viva',
          tag: '17 Dinámicas', tagColor: '#10b981', accentColor: '#10b981',
          title: '17 Dinámicas Didácticas Únicas',
          desc: 'Escape rooms, duelos de conocimientos contra personajes históricos, ordenamiento cronológico, lectura de palabras por minuto (PPM) y debate socrático en el aula.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 550, w: 590, h: 375,
          banner: 'Facilidad Absoluta para Profesores',
          tag: 'Cero Código', tagColor: '#0284c7', accentColor: '#0284c7',
          title: 'Crea Experiencias Lúdicas en Minutos',
          desc: 'Cualquier docente puede arrastrar las dinámicas, conectar los momentos de la clase y publicar retos interactivos para proyector o tabletas sin programar una sola línea.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 5: 44.0s - 56.0s | EL CAMINO DEL HÉROE Y MISIONES
      // ==============================================================
      else if (t >= 44.0 && t < 56.0) {
        drawTechHUD(t, 'Portal del Estudiante · El Camino del Héroe', 'Aventura Escolar', '#f59e0b');

        // Real Student Missions Screenshot
        const retX = Math.round(480 * reticleScale + 90);
        const retY = Math.round(350 * reticleScale + 120);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/student/missions (Misiones Curriculares)',
          img: loadedImages.studentMissions,
          focusReticle: { relX: retX, relY: retY, color: '#f59e0b', rgb: '245, 158, 11' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 380,
          banner: 'Compromiso y Motivación Genuina',
          tag: 'Aventura Diaria', tagColor: '#f59e0b', accentColor: '#f59e0b',
          title: 'El Ciclo Escolar como Aventura',
          desc: 'Los alumnos desbloquean rangos, completan desafíos de Matemáticas e Historia y ven cómo su esfuerzo se traduce en progreso visible, combatiendo la apatía en clases.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 550, w: 590, h: 375,
          banner: 'Evaluación Formativa Continua',
          tag: 'Retroalimentación', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Reconocimiento al Esfuerzo Diario',
          desc: 'Insignias de honor, árbol de habilidades y retroalimentación pedagógica inmediata. El alumno se convierte en el protagonista activo de su propio aprendizaje.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 6: 56.0s - 68.0s | EXPEDIENTE 360° Y SEGURIDAD MÉDICA
      // ==============================================================
      else if (t >= 56.0 && t < 68.0) {
        drawTechHUD(t, 'Expediente 360° · Seguridad Médica y Alertas', 'Alerta Crítica', '#ef4444');

        // Real Expediente 360 Screenshot
        const retX = Math.round(410 * reticleScale + 90);
        const retY = Math.round(330 * reticleScale + 120);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/admin/expediente-360 (Protocolo Clínico Escolar)',
          img: loadedImages.expediente360,
          focusReticle: { relX: retX, relY: retY, color: '#ef4444', rgb: '239, 68, 68' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 380,
          banner: 'Seguridad Escolar y Salud Preventiva',
          tag: 'Alerta Médica', tagColor: '#ef4444', accentColor: '#ef4444',
          title: 'Alertas Médicas en Primer Plano',
          desc: 'Alergias graves, padecimientos crónicos, botiquín autorizado y contactos de emergencia del tutor resaltados para profesores y enfermería ante cualquier eventualidad.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 550, w: 590, h: 375,
          banner: 'Expediente Único Digital',
          tag: 'Auditoría 360°', tagColor: '#0284c7', accentColor: '#0284c7',
          title: 'Historial Clínico y Psicopedagógico',
          desc: 'Toda la trayectoria del estudiante: bitácora de conducta, asistencias, expediente clínico y seguimiento de colegiaturas centralizados con estricta privacidad.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 7: 68.0s - 78.0s | VÍNCULO FAMILIAR Y WHATSAPP DIRECTO
      // ==============================================================
      else if (t >= 68.0 && t < 78.0) {
        drawTechHUD(t, 'Portal Familiar · Comunicación Directa por WhatsApp', 'Cero Fricción', '#10b981');

        // Real Parent Portal Screenshot
        const retX = Math.round(380 * reticleScale + 80);
        const retY = Math.round(410 * reticleScale + 120);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/parent (Portal de Familias y Evidencias)',
          img: loadedImages.parentPortal,
          focusReticle: { relX: retX, relY: retY, color: '#10b981', rgb: '16, 185, 129' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 380,
          banner: 'Fidelización de Padres de Familia',
          tag: '1 Clic WhatsApp', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Reportes Directo a su Teléfono',
          desc: 'Boletas de evaluación oficiales, tareas y avisos urgentes llegan directo a WhatsApp. Comunicación fluida que enamora a las familias sin saturar la recepción escolar.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 550, w: 590, h: 375,
          banner: 'Experiencia sin Contraseñas Olvidadas',
          tag: 'Acceso Cifrado', tagColor: '#0284c7', accentColor: '#0284c7',
          title: 'Cero Llamadas para Resetear Claves',
          desc: 'Enlaces cifrados directos al dispositivo móvil del tutor. Los padres ven boletas, portafolio de evidencias y reconocimientos al instante sin recordar usuarios complejos.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 8: 78.0s - 84.0s | SUPERVISIÓN DIRECTIVA Y GOBIERNO EN VIVO
      // ==============================================================
      else if (t >= 78.0 && t < 84.0) {
        drawTechHUD(t, 'Dirección General · Supervisión Curricular en Vivo', 'Auditoría SEP', '#0284c7');

        // Real Director Supervision Screenshot
        const retX = Math.round(590 * reticleScale + 90);
        const retY = Math.round(340 * reticleScale + 120);

        drawRealScreenWindow({
          x: winX, y: winY, w: winW,
          title: 'https://colegio.iskool.app/director (Mando Ejecutivo y Supervisión)',
          img: loadedImages.directorSupervision,
          focusReticle: { relX: retX, relY: retY, color: '#0284c7', rgb: '2, 132, 199' },
          cursorTarget: { relX: retX, relY: retY, clicking: true },
          micro10, phase10
        });

        // Institutional Card Overlay in Scene 8 to completely mask "UP Juan Jacobo Rosseau"
        const ox = winX + 70;
        const oy = winY + 46 + 76;
        ctx.save();
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, ox, oy, 340, 70, 12, true, false);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1.5;
        roundRect(ctx, ox, oy, 340, 70, 12, false, true);

        // Institutional Logo
        ctx.fillStyle = '#4f46e5';
        roundRect(ctx, ox + 8, oy + 8, 54, 54, 10, true, false);
        ctx.font = '28px sans-serif';
        ctx.fillText('🏛️', ox + 18, oy + 45);

        // Header pill
        ctx.fillStyle = '#f3e8ff';
        roundRect(ctx, ox + 72, oy + 8, 140, 18, 5, true, false);
        ctx.fillStyle = '#6b21a8';
        ctx.font = '900 9px "JetBrains Mono", monospace';
        ctx.fillText('DIRECCIÓN GENERAL', ox + 78, oy + 20);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Colegio Modelo', ox + 72, oy + 44);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Campus Digital · Primaria y Secundaria', ox + 72, oy + 61);
        ctx.restore();

        drawHUDCard({
          x: 1270, y: 140, w: 590, h: 380,
          banner: 'Gobierno Escolar en Tiempo Real',
          tag: 'Auditoría Viva', tagColor: '#0284c7', accentColor: '#0284c7',
          title: 'Control Curricular de Todos los Grupos',
          desc: 'La Dirección General audita en tiempo real el avance exacto de cada materia, docente y grupo en vivo: 98.5% cobertura curricular y 100% de maestros con planeación al día.',
          targetX: winX + retX, targetY: winY + 46 + retY, microPulse: micro10
        });

        drawHUDCard({
          x: 1270, y: 550, w: 590, h: 375,
          banner: 'Cumplimiento Oficial Inmediato',
          tag: '100% Blindado', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Listo para Inspecciones de Zona',
          desc: 'Información oficial instantánea para supervisiones de zona SEP y acreditaciones escolares. Reportes ejecutivos que demuestran el rigor institucional del colegio.',
          microPulse: micro10
        });
      }

      // ==============================================================
      // SCENE 9: 84.0s - 90.0s | GRAN CIERRE INSTITUCIONAL (CTA)
      // ==============================================================
      else if (t >= 84.0 && t <= 90.0) {
        drawTechHUD(t, 'Liderazgo Institucional', 'Prueba Piloto', '#d97706');

        ctx.save();
        ctx.fillStyle = 'rgba(12, 19, 36, 0.96)';
        roundRect(ctx, 240, 120, 1440, 820, 36, true, false);
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3;
        roundRect(ctx, 240, 120, 1440, 820, 36, false, true);

        // Header Pill
        ctx.fillStyle = '#d97706';
        roundRect(ctx, 700, 170, 520, 46, 23, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 LIDERAZGO ACADÉMICO PARA TU COLEGIO', 960, 199);

        // Main Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Eleva el Prestigio Educativo de tu Institución', 960, 280);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Comprueba la diferencia que una verdadera plataforma pedagógica genera en tu colegio.', 960, 325);

        // 3 Benefit Pillars
        const finalPillars = [
          { icon: '⚡', title: 'Despliegue en 48 Horas', desc: 'Carga inmediata de materias y grupos de prueba sin interrumpir las clases.' },
          { icon: '👩‍🏫', title: 'Acompañamiento Docente', desc: 'Talleres prácticos inmediatos para tus profesores en Bóveda Curricular y Retos.' },
          { icon: '🛡️', title: 'Prueba Piloto Cero Riesgo', desc: 'Comprueba los resultados con tus propios maestros y alumnos antes de cualquier adopción global.' }
        ];

        finalPillars.forEach((p, idx) => {
          const px = 300 + idx * 450;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          roundRect(ctx, px, 380, 420, 220, 24, true, false);
          ctx.strokeStyle = (micro10 % 3 === idx) ? '#d97706' : 'rgba(255, 255, 255, 0.12)';
          ctx.lineWidth = (micro10 % 3 === idx) ? 2.5 : 1;
          roundRect(ctx, px, 380, 420, 220, 24, false, true);

          ctx.font = '42px sans-serif';
          ctx.fillText(p.icon, px + 210, 445);

          ctx.fillStyle = '#ffffff';
          ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.title, px + 210, 495);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
          const maxW = 360;
          const words = p.desc.split(' ');
          let l = '', ly = 530;
          for (let w of words) {
            if (ctx.measureText(l + w + ' ').width > maxW) {
              ctx.fillText(l, px + 210, ly);
              l = w + ' '; ly += 24;
            } else { l += w + ' '; }
          }
          ctx.fillText(l, px + 210, ly);
        });

        // Golden Action Button
        const btnPulse = Math.sin(t * 5) * 4;
        ctx.fillStyle = '#f59e0b';
        roundRect(ctx, 580 - btnPulse, 660 - btnPulse/2, 760 + btnPulse*2, 76 + btnPulse, 20, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('📅 AGENDAR PRUEBA PILOTO PEDAGÓGICA', 960, 706);

        // Pointer
        drawFastCursor(960, 700, true, 20 + (frame % 10));

        // Subtext
        ctx.fillStyle = '#a7f3d0';
        ctx.font = '800 15px "JetBrains Mono", monospace';
        ctx.fillText('ISKOOL ACADÉMICO 2026 · EL CORAZÓN PEDAGÓGICO DE LAS GRANDES INSTITUCIONES', 960, 800);

        ctx.textAlign = 'left';
        ctx.restore();
      }

      // ==============================================================
      // SMOOTH CINEMATIC CROSSFADES AT TRANSITIONS (ZERO HARSH WIPES!)
      // ==============================================================
      const transitionPoints = [9.0, 21.0, 32.0, 44.0, 56.0, 68.0, 78.0, 84.0];
      for (const transT of transitionPoints) {
        const dt = t - transT;
        if (dt >= -0.35 && dt <= 0.35) {
          const fadeProgress = (dt + 0.35) / 0.70;
          const fadeAlpha = Math.sin(fadeProgress * Math.PI) * 0.45;
          ctx.save();
          ctx.fillStyle = \`rgba(5, 8, 17, \${fadeAlpha})\`;
          ctx.fillRect(0, 0, 1920, 1080);
          ctx.restore();
        }
      }
    }

    // MediaRecorder Live Recording
    window.startLiveRecording = async function() {
      // Wait until all real ISkool screenshots are ready
      await new Promise(resolve => {
        if (imagesReady) return resolve();
        const interval = setInterval(() => {
          if (imagesReady) {
            clearInterval(interval);
            resolve();
          }
        }, 20);
      });

      window.recordedChunks = [];
      const stream = canvas.captureStream(FPS);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 12000000 // 12 Mbps pristine quality
      });

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) window.recordedChunks.push(e.data);
      };

      recorder.start(100);
      const startTime = performance.now();

      return new Promise(resolve => {
        function tick() {
          const elapsed = (performance.now() - startTime) / 1000.0;
          renderFrameAtTime(elapsed);

          if (elapsed < TOTAL_SECONDS) {
            requestAnimationFrame(tick);
          } else {
            recorder.onstop = async () => {
              const blob = new Blob(window.recordedChunks, { type: 'video/webm' });
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result.split(',')[1]);
              reader.readAsDataURL(blob);
            };
            recorder.stop();
          }
        }
        requestAnimationFrame(tick);
      });
    };
  </script>
</body>
</html>
`;

const htmlPath = path.join(outputDir, 'high_tech_renderer_v3.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`✅ Engine V3.1 with REAL SCREENSHOTS generated: ${htmlPath}`);

async function produceVideo() {
  console.log('🚀 Launching Puppeteer to capture 90-second video with REAL ISKOOL SCREENSHOTS...');
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1920, height: 1080, deviceScaleFactor: 1 },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--autoplay-policy=no-user-gesture-required'
    ]
  });

  const page = await browser.newPage();
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });

  console.log('🎥 Recording 90 seconds in real time via MediaRecorder...');
  const base64WebM = await page.evaluate(() => window.startLiveRecording());
  await browser.close();

  const rawWebmPath = path.join(outputDir, 'high_tech_raw_v3.webm');
  fs.writeFileSync(rawWebmPath, Buffer.from(base64WebM, 'base64'));
  console.log(`✅ WebM Captured: ${rawWebmPath} (${(fs.statSync(rawWebmPath).size / (1024 * 1024)).toFixed(2)} MB)`);

  // Ensure warm acoustic soundtrack exists
  const soundtrackPath = path.join(outputDir, 'commercial_soundtrack_90s.wav');
  if (!fs.existsSync(soundtrackPath)) {
    console.log('🎵 Generating warm acoustic commercial soundtrack...');
    const soundGenScript = path.join(__dirname, 'generate_warm_commercial_soundtrack.js');
    spawnSync('node', [soundGenScript], { stdio: 'inherit' });
  }

  const finalMp4Path = path.join(outputDir, 'ISkool_Presentacion_Comercial_90s.mp4');

  console.log('\n🚀 Transcoding and multiplexing to Full HD MP4 (H.264 / AAC) with warm grand piano soundtrack...');
  const muxArgs = [
    '-y',
    '-i', rawWebmPath,
    '-i', soundtrackPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '256k',
    '-movflags', '+faststart',
    '-t', '90.0',
    finalMp4Path
  ];

  const res = spawnSync(ffmpeg, muxArgs);
  if (res.status !== 0) {
    console.error('Mux error:', res.stderr.toString());
    process.exit(1);
  }

  const stats = fs.statSync(finalMp4Path);
  console.log('\n======================================================');
  console.log('🎉 VIDEO COMERCIAL MAESTRO V3.1 CON IMÁGENES REALES DE ISKOOL GENERADO:');
  console.log(`📁 Archivo: ${finalMp4Path}`);
  console.log(`📊 Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('⏱️ Duración: EXACTAMENTE 90 SEGUNDOS (01:30)');
  console.log('🎯 Calidad: Full HD 1080p @ 30fps · Audio 256 kbps');
  console.log('🖼️ Pantallas: 100% Capturas Reales del Sistema ISkool');
  console.log('======================================================');

  if (fs.existsSync(rawWebmPath)) fs.unlinkSync(rawWebmPath);
}

produceVideo().catch(err => {
  console.error('Production error:', err);
  process.exit(1);
});
