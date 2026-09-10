const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const outputDir = path.join(__dirname, '..');
const screenshotsDir = path.join(outputDir, 'presentation_screenshots');

// Load screenshots as base64
const imageNames = [
  'screen_teacher_hub.png',
  'screen_teacher_planning_nem.png',
  'screen_studio_canvas.png',
  'screen_student_hero.png',
  'screen_expediente_360_real.png',
  'screen_parent_portal.png',
  'screen_director_supervision.png',
  'screen_finanzas_admin.png'
];

console.log('📦 Encoding screenshots to base64 for real-time canvas rendering...');
const base64Images = {};
imageNames.forEach(name => {
  const p = path.join(screenshotsDir, name);
  const data = fs.readFileSync(p);
  base64Images[name] = `data:image/png;base64,${data.toString('base64')}`;
});

// HTML template with Canvas rendering engine
const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ISkool High-Tech Commercial Engine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700;800&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      width: 1920px;
      height: 1080px;
      background: #070b14;
      overflow: hidden;
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
    }
    #render-canvas {
      width: 1920px;
      height: 1080px;
      display: block;
    }
  </style>
</head>
<body>
  <canvas id="render-canvas" width="1920" height="1080"></canvas>

  <script>
    const imagesData = ${JSON.stringify(base64Images)};
    const loadedImages = {};

    function loadAllImages() {
      const promises = Object.keys(imagesData).map(k => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => { loadedImages[k] = img; resolve(); };
          img.onerror = reject;
          img.src = imagesData[k];
        });
      });
      return Promise.all(promises);
    }

    const canvas = document.getElementById('render-canvas');
    const ctx = canvas.getContext('2d');

    const TOTAL_SECONDS = 90.0;
    const FPS = 30;
    const TOTAL_FRAMES = TOTAL_SECONDS * FPS; // 2700 frames

    // Timeline definitions (seconds)
    // S1: 0 - 10 (Hook)
    // S2: 10 - 20 (Hub Docente)
    // S3: 20 - 30 (Planeación NEM)
    // S4: 30 - 40 (Estudio 17 Nodos)
    // S5: 40 - 50 (Camino del Héroe)
    // S6: 50 - 60 (Expediente 360)
    // S7: 60 - 70 (WhatsApp Familiar)
    // S8: 70 - 75 (Supervisión Directiva)
    // S9: 75 - 80 (SAT CFDI 4.0)
    // S10: 80 - 90 (Cierre CTA)

    let currentFrame = 0;

    // Helper: Draw Rounded Rect
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      if (fill) ctx.fill();
      if (stroke) ctx.stroke();
    }

    // Helper: Draw High-Contrast Holographic HUD Card
    function drawHUDCard(opt) {
      const { x, y, width, height, banner, title, desc, tag, tagColor, accentColor, targetX, targetY } = opt;
      
      // Laser Leader Line to Target
      if (targetX !== undefined && targetY !== undefined) {
        ctx.save();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 2.5;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        const startX = x > targetX ? x : x + width;
        const startY = y + height / 2;
        ctx.moveTo(startX, startY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Target reticle at targetX, targetY
        ctx.setLineDash([]);
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 22, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Card Background (Ultra-dark sleek glass with glowing shadow)
      ctx.save();
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 35;
      ctx.fillStyle = 'rgba(10, 16, 30, 0.95)';
      roundRect(ctx, x, y, width, height, 22, true, false);
      ctx.shadowBlur = 0;

      // Card Border with Accent Gradient
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = 2.5;
      roundRect(ctx, x, y, width, height, 22, false, true);

      // Top Banner Header
      ctx.fillStyle = accentColor;
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText(banner.toUpperCase(), x + 28, y + 36);

      // Status Pill on top right
      if (tag) {
        ctx.fillStyle = tagColor || accentColor;
        roundRect(ctx, x + width - 150, y + 20, 122, 28, 8, true, false);
        ctx.fillStyle = '#070b14';
        ctx.font = '900 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tag.toUpperCase(), x + width - 89, y + 39);
        ctx.textAlign = 'left';
      }

      // Divider Line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 28, y + 52);
      ctx.lineTo(x + width - 28, y + 52);
      ctx.stroke();

      // Main Title
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title, x + 28, y + 90);

      // Description (Multi-line)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
      const words = desc.split(' ');
      let line = '';
      let lineY = y + 125;
      const maxW = width - 56;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && n > 0) {
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

    // Helper: Draw Tech Background Grid
    function drawTechBackground() {
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, 1920, 1080);

      // Grid
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < 1920; x += 48) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1080); ctx.stroke();
      }
      for (let y = 0; y < 1080; y += 48) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(1920, y); ctx.stroke();
      }

      // Top Status Bar
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fillRect(0, 0, 1920, 48);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeRect(0, 0, 1920, 48);

      ctx.fillStyle = '#10b981';
      ctx.font = '800 13px "JetBrains Mono", monospace';
      ctx.fillText('● SISTEMA PEDAGÓGICO ISKOOL EN VIVO', 48, 30);

      ctx.fillStyle = '#64748b';
      ctx.fillText('NEM 2024 · CAMBRIDGE FRAMEWORK · LATENCIA: 0.1s', 1420, 30);
    }

    // Helper: Draw Zoomed Interactive Window for Screenshot
    function drawSystemWindow(imgKey, cropX, cropY, cropW, cropH, winX, winY, winW, winH, title) {
      const img = loadedImages[imgKey];
      if (!img) return;

      ctx.save();
      // Outer Glow & Shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, winX, winY, winW, winH, 20, true, false);
      ctx.shadowBlur = 0;

      // Window Header Bar
      ctx.fillStyle = '#0f172a';
      roundRect(ctx, winX, winY, winW, 44, 20, true, false);
      ctx.fillRect(winX, winY + 20, winW, 24); // flatten bottom corners

      // Window Control Dots
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(winX + 24, winY + 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(winX + 42, winY + 22, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(winX + 60, winY + 22, 6, 0, Math.PI * 2); ctx.fill();

      // Window Title
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title || 'ISkool Suite Institucional', winX + 85, winY + 27);

      // Clip image to window body
      ctx.save();
      ctx.beginPath();
      ctx.rect(winX, winY + 44, winW, winH - 44);
      ctx.clip();
      ctx.drawImage(img, cropX, cropY, cropW, cropH, winX, winY + 44, winW, winH - 44);
      ctx.restore();

      // Window Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      roundRect(ctx, winX, winY, winW, winH, 20, false, true);

      ctx.restore();
    }

    // Helper: Draw Animated Mouse Pointer with Click Shockwave
    function drawAnimatedCursor(x, y, clicking, clickRadius) {
      ctx.save();
      if (clicking) {
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, clickRadius || 25, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, (clickRadius || 25) * 1.6, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Pointer Cursor Arrow
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#070b14';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 14, y + 26);
      ctx.lineTo(x + 6, y + 25);
      ctx.lineTo(x + 1, y + 36);
      ctx.lineTo(x - 5, y + 33);
      ctx.lineTo(x + 0, y + 22);
      ctx.lineTo(x - 8, y + 17);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // MAIN RENDER LOOP FRAME BY FRAME
    function renderFrameAtTime(t) {
      drawTechBackground();

      // ==========================================
      // SCENE 1: 0.0s - 10.0s (EL GANCHO DISRUPTIVO)
      // ==========================================
      if (t >= 0 && t < 10.0) {
        const localT = t;
        // Central Hero Glass Card
        ctx.save();
        ctx.shadowColor = 'rgba(16, 185, 129, 0.25)';
        ctx.shadowBlur = 60;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        roundRect(ctx, 240, 160, 1440, 760, 36, true, false);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        roundRect(ctx, 240, 160, 1440, 760, 36, false, true);

        // Header Pill
        ctx.fillStyle = '#10b981';
        roundRect(ctx, 680, 220, 560, 48, 24, true, false);
        ctx.fillStyle = '#070b14';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✨ PLATAFORMA INTEGRAL DE EXCELENCIA PEDAGÓGICA', 960, 250);

        // Big Question
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('¿Tu software escolar solo cobra mensualidades...', 960, 350);

        ctx.fillStyle = '#10b981';
        ctx.fillText('o realmente transforma lo que ocurre en el aula?', 960, 420);

        // Central Thesis Banner
        ctx.fillStyle = 'rgba(217, 119, 6, 0.15)';
        roundRect(ctx, 360, 480, 1200, 90, 20, true, false);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        roundRect(ctx, 360, 480, 1200, 90, 20, false, true);

        ctx.fillStyle = '#fef3c7';
        ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('"Un gran colegio no se define por su caja registradora.', 960, 522);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Lo verdaderamente valioso es lo académico."', 960, 555);

        // 4 Key Value Pillars
        const pillars = [
          { icon: '🏛️', title: 'Bóveda Curricular', sub: '+1,500 Nodos Oficiales SEP' },
          { icon: '⚡', title: 'Planeación en 3s', sub: 'Momentos Didácticos y Rúbricas' },
          { icon: '🎮', title: 'Gamificación Ética', sub: '17 Nodos Pedagógicos Activos' },
          { icon: '📱', title: 'WhatsApp Familiar', sub: 'Avisos en 1 Clic sin Passwords' }
        ];

        pillars.forEach((p, idx) => {
          const px = 300 + idx * 340;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          roundRect(ctx, px, 620, 310, 160, 20, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          roundRect(ctx, px, 620, 310, 160, 20, false, true);

          ctx.font = '36px sans-serif';
          ctx.fillText(p.icon, px + 155, 680);
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.title, px + 155, 725);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.sub, px + 155, 752);
        });

        ctx.textAlign = 'left';
        ctx.restore();
      }

      // ==========================================
      // SCENE 2: 10.0s - 20.0s (HUB DOCENTE · MENOS BUROCRACIA)
      // ==========================================
      else if (t >= 10.0 && t < 20.0) {
        const localT = t - 10.0;
        // Large System Window (Cropped into the 4 main cards of teacher hub)
        drawSystemWindow(
          'screen_teacher_hub.png',
          0, 100, 1920, 980,
          80, 80, 1140, 920,
          'ISkool Suite Docente · Hub Central de Aulas y Actividades'
        );

        // Animated cursor moving and clicking "Crear Actividad"
        const curX = 80 + 350 + Math.min(localT * 40, 200);
        const curY = 80 + 450;
        const isClick = localT > 3.0;
        const clickRad = (localT * 40) % 35;
        drawAnimatedCursor(curX, curY, isClick, clickRad);

        // Giant HUD Callout Card
        drawHUDCard({
          x: 1260,
          y: 120,
          width: 580,
          height: 380,
          banner: 'Paso 1 · Centralización Pedagógica',
          tag: 'En Vivo',
          tagColor: '#10b981',
          accentColor: '#10b981',
          title: 'Hub Docente a 1 Clic',
          desc: 'El maestro tiene en una sola pantalla: Aula Digital, Gestión de Clases, Creación de Actividades y Comunidad. Elimina la fatiga de buscar entre carpetas y sistemas dispersos.',
          targetX: curX,
          targetY: curY
        });

        // Impact Metric Card
        drawHUDCard({
          x: 1260,
          y: 540,
          width: 580,
          height: 340,
          banner: 'Dolencia Docente Resuelta',
          tag: '-80% Papeleo',
          tagColor: '#f59e0b',
          accentColor: '#f59e0b',
          title: 'Ahorro de +15 Horas Semanales',
          desc: 'Tus profesores recuperan sus tardes y fines de semana. Menos carga burocrática significa mayor retención de talento y mejor calidad de enseñanza para tus alumnos.'
        });
      }

      // ==========================================
      // SCENE 3: 20.0s - 30.0s (BÓVEDA CURRICULAR Y PLANEACIÓN NEM)
      // ==========================================
      else if (t >= 20.0 && t < 30.0) {
        const localT = t - 20.0;
        // Window focusing on planning table and didactic moments
        drawSystemWindow(
          'screen_teacher_planning_nem.png',
          0, 80, 1920, 1000,
          80, 80, 1140, 920,
          'Bóveda Curricular Oficial · Fases 1 a 6 SEP (NEM 2024) + Cambridge'
        );

        // Laser Scan line effect sweeping down
        const scanY = 80 + 44 + ((localT * 120) % 800);
        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.moveTo(80, scanY);
        ctx.lineTo(80 + 1140, scanY);
        ctx.stroke();
        ctx.restore();

        // Cursor clicking "Generar Planeación con IA"
        const curX = 80 + 620;
        const curY = 80 + 220;
        drawAnimatedCursor(curX, curY, localT > 2.0, (localT * 30) % 25);

        // HUD Card 1: Official Bóveda Curricular
        drawHUDCard({
          x: 1260,
          y: 100,
          width: 580,
          height: 400,
          banner: 'Articulación Oficial SEP 2024',
          tag: '+1,500 PDAs',
          tagColor: '#10b981',
          accentColor: '#10b981',
          title: 'Bóveda Curricular Oficial',
          desc: 'Más de 1,500 contenidos y Procesos de Desarrollo de Aprendizaje (PDA) de la SEP totalmente indexados. El profesor elige el tema o fotografía el libro, y el sistema estructura la sesión analítica.',
          targetX: curX,
          targetY: curY
        });

        // HUD Card 2: 3 Didactic Moments
        drawHUDCard({
          x: 1260,
          y: 530,
          width: 580,
          height: 420,
          banner: 'Automatización Pedagógica',
          tag: 'En 3 Segundos',
          tagColor: '#06b6d4',
          accentColor: '#06b6d4',
          title: 'Inicio, Desarrollo, Cierre y Rúbrica',
          desc: 'Sesiones cronometradas listas para impartir: preguntas detonadoras, trabajo colaborativo, entregables tangibles y rúbricas analíticas de 4 niveles oficiales.'
        });
      }

      // ==========================================
      // SCENE 4: 30.0s - 40.0s (ESTUDIO DE GAMIFICACIÓN · 17 NODOS)
      // ==========================================
      else if (t >= 30.0 && t < 40.0) {
        const localT = t - 30.0;
        // Window focusing on 17 node canvas
        drawSystemWindow(
          'screen_studio_canvas.png',
          0, 100, 1920, 980,
          80, 80, 1140, 920,
          'Estudio Docente de Actividades · Constructor Visual de Gamificación'
        );

        // Animated Energy Connection Line between nodes
        const n1X = 80 + 360;
        const n1Y = 80 + 720;
        const n2X = 80 + 500;
        const n2Y = 80 + 720;

        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 4;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(n1X, n1Y);
        const progress = Math.min(1, localT / 2.5);
        ctx.lineTo(n1X + (n2X - n1X) * progress, n1Y);
        ctx.stroke();

        // Energy pulses
        const pulsePos = (localT * 180) % (n2X - n1X);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(n1X + pulsePos, n1Y, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // HUD Card 1: 17 Nodos
        drawHUDCard({
          x: 1260,
          y: 110,
          width: 580,
          height: 390,
          banner: 'Gamificación Pedagógica Viva',
          tag: '17 Nodos',
          tagColor: '#06b6d4',
          accentColor: '#06b6d4',
          title: '17 Nodos Didácticos Únicos',
          desc: 'Escape rooms, quizzes cronometrados, lectura PPM, ordenar cronología, debate socrático y cofres del tesoro. Aprendizaje activo que cautiva al estudiante.',
          targetX: n2X,
          targetY: n2Y
        });

        // HUD Card 2: No Code
        drawHUDCard({
          x: 1260,
          y: 530,
          width: 580,
          height: 360,
          banner: 'Facilidad de Uso Garantizada',
          tag: 'Cero Código',
          tagColor: '#10b981',
          accentColor: '#10b981',
          title: 'Crea Videojuegos Educativos sin Programar',
          desc: 'Cualquier docente puede arrastrar nodos, personalizarlos con su materia y publicar retos interactivos en cuestión de minutos.'
        });
      }

      // ==========================================
      // SCENE 5: 40.0s - 50.0s (EL CAMINO DEL HÉROE · ALUMNOS)
      // ==========================================
      else if (t >= 40.0 && t < 50.0) {
        const localT = t - 40.0;
        drawSystemWindow(
          'screen_student_hero.png',
          0, 100, 1920, 980,
          80, 80, 1140, 920,
          'Portal del Alumno · Aventura y Motivación Escolar Basada en Mérito'
        );

        // Animated XP progress bar filling
        const targetAvatarX = 80 + 210;
        const targetAvatarY = 80 + 520;

        drawHUDCard({
          x: 1260,
          y: 110,
          width: 580,
          height: 390,
          banner: 'Compromiso Escolar Genuino',
          tag: 'Aventura',
          tagColor: '#f59e0b',
          accentColor: '#f59e0b',
          title: 'El Camino del Héroe del Alumno',
          desc: 'El estudiante vive su año escolar como una aventura: resuelve misiones, desbloquea rangos académicos y ve cómo su esfuerzo diario se traduce en logros tangibles.',
          targetX: targetAvatarX,
          targetY: targetAvatarY
        });

        drawHUDCard({
          x: 1260,
          y: 530,
          width: 580,
          height: 360,
          banner: 'Filosofía Pedagógica Ética',
          tag: 'Mérito 100%',
          tagColor: '#10b981',
          accentColor: '#10b981',
          title: 'Cero Compras con Dinero Real',
          desc: 'A diferencia de plataformas comerciales con microtransacciones, en ISkool todo se gana exclusivamente por mérito, tareas y valores escolares.'
        });
      }

      // ==========================================
      // SCENE 6: 50.0s - 60.0s (EXPEDIENTE 360° · ALERTA MÉDICA)
      // ==========================================
      else if (t >= 50.0 && t < 60.0) {
        const localT = t - 50.0;
        drawSystemWindow(
          'screen_expediente_360_real.png',
          0, 80, 1920, 1000,
          80, 80, 1140, 920,
          'Expediente 360° del Alumno · Protocolo Clínico y Ficha Médica Inmediata'
        );

        // Pulsating Red Reticle precisely over Medical Allergy section
        const allergyX = 80 + 680;
        const allergyY = 80 + 670;

        ctx.save();
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 25;
        roundRect(ctx, allergyX - 180, allergyY - 30, 370, 75, 12, false, true);

        // Emergency Flashing Tag
        ctx.fillStyle = '#ef4444';
        roundRect(ctx, allergyX - 160, allergyY - 52, 190, 24, 6, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 11px "JetBrains Mono", monospace';
        ctx.fillText('🚨 ALERTA MÉDICA ACTIVA', allergyX - 150, allergyY - 36);
        ctx.restore();

        drawHUDCard({
          x: 1260,
          y: 110,
          width: 580,
          height: 390,
          banner: 'Seguridad Escolar Total',
          tag: 'Crítico',
          tagColor: '#ef4444',
          accentColor: '#ef4444',
          title: 'Alertas Médicas en Primer Plano',
          desc: 'Alergias graves, padecimientos y contactos de emergencia resaltados para profesores y enfermería. Reacción inmediata garantizada ante cualquier incidente escolar.',
          targetX: allergyX,
          targetY: allergyY
        });

        drawHUDCard({
          x: 1260,
          y: 530,
          width: 580,
          height: 360,
          banner: 'Expediente Único Digital',
          tag: 'Auditado 360°',
          tagColor: '#06b6d4',
          accentColor: '#06b6d4',
          title: 'Historial Clínico y Psicopedagógico',
          desc: 'Toda la trayectoria del alumno: bitácoras de conducta, asistencias, historial médico y seguimiento académico centralizados con estricta privacidad.'
        });
      }

      // ==========================================
      // SCENE 7: 60.0s - 70.0s (WHATSAPP FAMILIAR DIRECTO)
      // ==========================================
      else if (t >= 60.0 && t < 70.0) {
        const localT = t - 60.0;
        drawSystemWindow(
          'screen_parent_portal.png',
          0, 80, 1920, 1000,
          80, 80, 1140, 920,
          'Portal de Familias · Vínculo Directo y Notificaciones Escolares'
        );

        // WhatsApp Simulated Notification Box (Animated Slide In)
        const waX = 80 + 360;
        const waY = 80 + 380;

        ctx.save();
        ctx.shadowColor = '#10b981';
        ctx.shadowBlur = 30;
        ctx.fillStyle = '#064e3b';
        roundRect(ctx, waX - 180, waY - 50, 420, 110, 18, true, false);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 2;
        roundRect(ctx, waX - 180, waY - 50, 420, 110, 18, false, true);

        ctx.fillStyle = '#34d399';
        ctx.font = '800 13px "JetBrains Mono", monospace';
        ctx.fillText('💬 NOTIFICACIÓN WHATSAPP ISKOOL', waX - 160, waY - 24);

        ctx.fillStyle = '#ffffff';
        ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Boleta bimestral y aviso escolar entregados.', waX - 160, waY + 6);
        ctx.fillText('Acceso instantáneo en 1 toque ✓✓', waX - 160, waY + 30);
        ctx.restore();

        drawHUDCard({
          x: 1260,
          y: 110,
          width: 580,
          height: 390,
          banner: 'Fidelización de Padres de Familia',
          tag: '1 Clic',
          tagColor: '#10b981',
          accentColor: '#10b981',
          title: 'Reportes Directo a su WhatsApp',
          desc: 'Boletas de evaluación, tareas y avisos urgentes llegan directo a la app que los padres usan todos los días. Comunicación fluida sin saturar recepción.',
          targetX: waX,
          targetY: waY
        });

        drawHUDCard({
          x: 1260,
          y: 530,
          width: 580,
          height: 360,
          banner: 'Experiencia Sin Fricción',
          tag: 'Cero Passwords',
          tagColor: '#06b6d4',
          accentColor: '#06b6d4',
          title: 'Cero Contraseñas Olvidadas',
          desc: 'Acceso seguro mediante enlaces cifrados directos al teléfono del tutor. Se terminan las llamadas diarias de padres pidiendo restablecer contraseñas.'
        });
      }

      // ==========================================
      // SCENE 8: 70.0s - 75.0s (SUPERVISIÓN DIRECTIVA EN VIVO)
      // ==========================================
      else if (t >= 70.0 && t < 75.0) {
        drawSystemWindow(
          'screen_director_supervision.png',
          0, 80, 1920, 1000,
          80, 80, 1140, 920,
          'Panel de Dirección General · Supervisión de Cobertura Curricular'
        );

        drawHUDCard({
          x: 1260,
          y: 180,
          width: 580,
          height: 420,
          banner: 'Gobierno Escolar en Tiempo Real',
          tag: 'Supervisión SEP',
          tagColor: '#06b6d4',
          accentColor: '#06b6d4',
          title: 'Control Curricular de Todos los Grupos',
          desc: 'La Dirección General conoce el avance exacto de cada materia, docente y grupo en vivo. Información lista para inspecciones de zona y acreditaciones escolares.'
        });
      }

      // ==========================================
      // SCENE 9: 75.0s - 80.0s (COBRANZA Y SAT CFDI 4.0 OPCIONAL)
      // ==========================================
      else if (t >= 75.0 && t < 80.0) {
        drawSystemWindow(
          'screen_finanzas_admin.png',
          0, 80, 1920, 1000,
          80, 80, 1140, 920,
          'Módulo Administrativo · Facturación SAT CFDI 4.0 con Complemento Educativo'
        );

        drawHUDCard({
          x: 1260,
          y: 180,
          width: 580,
          height: 420,
          banner: 'Módulo Complementario',
          tag: 'SAT Oficial',
          tagColor: '#f59e0b',
          accentColor: '#f59e0b',
          title: 'Facturación SAT CFDI 4.0 (IEDU)',
          desc: 'Timbrado fiscal automático con complemento educativo para deducibilidad de colegiaturas. Un módulo complementario y ordenado para escuelas que buscan unificar su administración.'
        });
      }

      // ==========================================
      // SCENE 10: 80.0s - 90.0s (GRAN CIERRE INSTITUCIONAL)
      // ==========================================
      else if (t >= 80.0 && t <= 90.0) {
        ctx.save();
        ctx.shadowColor = 'rgba(217, 119, 6, 0.3)';
        ctx.shadowBlur = 60;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        roundRect(ctx, 240, 140, 1440, 800, 36, true, false);
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 3;
        roundRect(ctx, 240, 140, 1440, 800, 36, false, true);

        // Header Pill
        ctx.fillStyle = '#d97706';
        roundRect(ctx, 720, 190, 480, 46, 23, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('🏆 LIDERAZGO ACADÉMICO PARA TU COLEGIO', 960, 219);

        // Main Title
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Eleva el Prestigio Educativo de tu Institución', 960, 300);

        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Comprueba la diferencia que una verdadera plataforma pedagógica genera en tu comunidad.', 960, 345);

        // 3 Benefit Pillars
        const finalPillars = [
          { icon: '⚡', title: 'Despliegue en 48 Horas', desc: 'Carga inmediata de grupos, docentes y planes de estudio sin interrupciones operativas.' },
          { icon: '👩‍🏫', title: 'Acompañamiento Docente', desc: 'Capacitación pedagógica y acompañamiento directo a tus profesores desde el primer día.' },
          { icon: '🛡️', title: 'Prueba Piloto Cero Riesgo', desc: 'Comprueba los resultados en tus aulas antes de cualquier decisión institucional.' }
        ];

        finalPillars.forEach((p, idx) => {
          const px = 300 + idx * 450;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          roundRect(ctx, px, 400, 420, 220, 24, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          roundRect(ctx, px, 400, 420, 220, 24, false, true);

          ctx.font = '40px sans-serif';
          ctx.fillText(p.icon, px + 210, 465);
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.title, px + 210, 515);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
          const words = p.desc.split(' ');
          let l = ''; let ly = 550;
          for (let w of words) {
            if (ctx.measureText(l + w).width > 360) {
              ctx.fillText(l, px + 210, ly);
              l = w + ' '; ly += 22;
            } else { l += w + ' '; }
          }
          ctx.fillText(l, px + 210, ly);
        });

        // Golden CTA Button
        ctx.fillStyle = '#d97706';
        roundRect(ctx, 680, 680, 560, 72, 20, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('🚀 Agenda tu Demostración Institucional', 960, 725);

        ctx.fillStyle = '#10b981';
        ctx.font = '800 24px "JetBrains Mono", monospace';
        ctx.fillText('www.iskool.app', 960, 800);

        ctx.textAlign = 'left';
        ctx.restore();
      }

      // ==========================================
      // HIGH-ENERGY NEON TRANSITION WIPES
      // ==========================================
      const transMoments = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 75.0, 80.0];
      for (let tm of transMoments) {
        if (t >= tm - 0.4 && t <= tm + 0.4) {
          const dt = (t - (tm - 0.4)) / 0.8; // 0 to 1
          const wipeX = dt * 2600 - 400;

          ctx.save();
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.moveTo(wipeX, 0);
          ctx.lineTo(wipeX + 240, 0);
          ctx.lineTo(wipeX - 100, 1080);
          ctx.lineTo(wipeX - 340, 1080);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(wipeX + 240, 0);
          ctx.lineTo(wipeX + 300, 0);
          ctx.lineTo(wipeX - 40, 1080);
          ctx.lineTo(wipeX - 100, 1080);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // MediaRecorder Automation
    window.startLiveRecording = async function() {
      await loadAllImages();
      console.log('Images loaded! Starting 90-second MediaRecorder...');

      window.recordedChunks = [];
      const stream = canvas.captureStream(FPS);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 8000000 // 8 Mbps high bitrate
      });

      recorder.ondataavailable = e => {
        if (e.data && e.data.size > 0) window.recordedChunks.push(e.data);
      };

      recorder.start(100);

      // Play through timeline
      const startTime = performance.now();

      return new Promise(resolve => {
        function tick() {
          const elapsed = (performance.now() - startTime) / 1000.0;
          renderFrameAtTime(elapsed);

          if (elapsed < TOTAL_SECONDS) {
            requestAnimationFrame(tick);
          } else {
            console.log('Timeline reached 90s. Finalizing WebM...');
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

const htmlFilePath = path.join(outputDir, 'high_tech_renderer.html');
fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log(`✅ High-tech interactive engine generated: ${htmlFilePath}`);

async function produceVideo() {
  console.log('🚀 Launching Puppeteer to capture 90-second high-tech live video...');
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
  const fileUrl = 'file:///' + htmlFilePath.replace(/\\/g, '/');
  await page.goto(fileUrl, { waitUntil: 'load' });

  console.log('🎥 Recording 90 seconds in real time via MediaRecorder...');
  const base64WebM = await page.evaluate(() => window.startLiveRecording());
  await browser.close();

  const rawWebmPath = path.join(outputDir, 'high_tech_raw_90s.webm');
  fs.writeFileSync(rawWebmPath, Buffer.from(base64WebM, 'base64'));
  console.log(`✅ WebM Video Captured: ${rawWebmPath} (${(fs.statSync(rawWebmPath).size / (1024 * 1024)).toFixed(2)} MB)`);

  // Ensure soundtrack exists
  const soundtrackPath = path.join(outputDir, 'commercial_soundtrack_90s.wav');
  if (!fs.existsSync(soundtrackPath)) {
    console.log('🎵 Generating commercial soundtrack...');
    const soundGenScript = path.join(__dirname, 'generate_commercial_soundtrack.js');
    spawnSync('node', [soundGenScript], { stdio: 'inherit' });
  }

  const finalMp4Path = path.join(outputDir, 'ISkool_Presentacion_Comercial_90s.mp4');

  console.log('\n🚀 Transcoding and multiplexing to Full HD MP4 (H.264 / AAC)...');
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
  console.log('🎉 VIDEO COMERCIAL DE ALTO IMPACTO ACTUALIZADO:');
  console.log(`📁 Archivo: ${finalMp4Path}`);
  console.log(`📊 Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('⏱️ Duración: EXACTAMENTE 90 SEGUNDOS (01:30)');
  console.log('🎯 Calidad: Full HD 1080p @ 30fps · Audio 256 kbps');
  console.log('======================================================');

  // Clean up raw webm
  if (fs.existsSync(rawWebmPath)) fs.unlinkSync(rawWebmPath);
}

produceVideo().catch(err => {
  console.error('Production error:', err);
  process.exit(1);
});
