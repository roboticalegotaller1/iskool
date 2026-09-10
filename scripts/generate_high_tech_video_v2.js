const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const outputDir = path.join(__dirname, '..');

// Generate the ultimate high-tech, razor-sharp 1080p canvas engine
const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ISkool Ultimate High-Tech Engine</title>
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

    // Helper: Background Grid & Top HUD Bar
    function drawTechHUD(time, sceneTitle, statusTag, statusColor) {
      // Dark High-Tech Background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, 1920, 1080);

      // Grid
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
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
      ctx.fillText('● ISKOOL ACADÉMICO · MOTOR PEDAGÓGICO INSTITUCIONAL', 48, 35);

      // Center Breadcrumb
      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('MÓDULO: ' + sceneTitle.toUpperCase(), 780, 34);

      // Status Indicator
      ctx.fillStyle = statusColor || '#10b981';
      roundRect(ctx, 1680, 12, 190, 32, 8, true, false);
      ctx.fillStyle = '#050811';
      ctx.font = '900 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(statusTag || 'EN VIVO 1080P', 1775, 33);
      ctx.textAlign = 'left';
    }

    // Helper: Draw High-Contrast HUD Card (Right Side)
    function drawHUDCard(opt) {
      const { x, y, w, h, banner, tag, tagColor, accentColor, title, desc, targetX, targetY } = opt;

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
        ctx.arc(targetX, targetY, 20, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = accentColor;
        ctx.beginPath();
        ctx.arc(targetX, targetY, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Card Body (Opaque Dark Slate, Crisp Contrast)
      ctx.save();
      ctx.shadowColor = accentColor;
      ctx.shadowBlur = 30;
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
        roundRect(ctx, x + w - 160, y + 18, 132, 28, 8, true, false);
        ctx.fillStyle = '#070b14';
        ctx.font = '900 12px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(tag.toUpperCase(), x + w - 94, y + 36);
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

      // Description (Word wrapped)
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

    // Helper: Draw Fast Snappy Cursor
    function drawFastCursor(x, y, clicking, rippleR) {
      ctx.save();
      if (clicking) {
        ctx.strokeStyle = '#06b6d4';
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

    // Helper: Draw Simulated Modern UI Window (Native Crisp Resolution)
    function drawMockupWindow(x, y, w, h, title, icon) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.7)';
      ctx.shadowBlur = 40;
      ctx.fillStyle = '#ffffff';
      roundRect(ctx, x, y, w, h, 20, true, false);
      ctx.shadowBlur = 0;

      // Header Bar
      ctx.fillStyle = '#0f172a';
      roundRect(ctx, x, y, w, 48, 20, true, false);
      ctx.fillRect(x, y + 24, w, 24);

      // Dots
      ctx.fillStyle = '#ef4444'; ctx.beginPath(); ctx.arc(x + 24, y + 24, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#f59e0b'; ctx.beginPath(); ctx.arc(x + 42, y + 24, 6, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(x + 60, y + 24, 6, 0, Math.PI*2); ctx.fill();

      ctx.fillStyle = '#94a3b8';
      ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(title, x + 85, y + 29);

      // Border
      ctx.strokeStyle = 'rgba(255,255,255,0.15)';
      ctx.lineWidth = 2;
      roundRect(ctx, x, y, w, h, 20, false, true);
      ctx.restore();
    }

    // MAIN TIMELINE RENDERING (90.0s @ 30fps)
    function renderFrameAtTime(t) {

      // ==============================================================
      // SCENE 1: 0.0s - 10.0s | EL GANCHO DISRUPTIVO (TESIS CENTRAL)
      // ==============================================================
      if (t >= 0 && t < 10.0) {
        drawTechHUD(t, 'Introducción Estratégica', 'Tesis de Valor', '#10b981');

        ctx.save();
        ctx.fillStyle = 'rgba(12, 19, 36, 0.95)';
        roundRect(ctx, 240, 140, 1440, 800, 32, true, false);
        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 3;
        roundRect(ctx, 240, 140, 1440, 800, 32, false, true);

        // Header Badge
        ctx.fillStyle = '#10b981';
        roundRect(ctx, 680, 200, 560, 46, 23, true, false);
        ctx.fillStyle = '#050811';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('✨ PLATAFORMA INTEGRAL DE EXCELENCIA PEDAGÓGICA', 960, 229);

        // Disruptive Hook Headline
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 46px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('¿Tu software escolar solo cobra mensualidades...', 960, 320);

        ctx.fillStyle = '#10b981';
        ctx.fillText('o realmente transforma lo que ocurre en el aula?', 960, 385);

        // Golden Thesis Callout
        ctx.fillStyle = 'rgba(245, 158, 11, 0.12)';
        roundRect(ctx, 340, 440, 1240, 90, 20, true, false);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        roundRect(ctx, 340, 440, 1240, 90, 20, false, true);

        ctx.fillStyle = '#fef3c7';
        ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('"Un gran colegio no se define por su caja registradora.', 960, 482);
        ctx.fillStyle = '#f59e0b';
        ctx.fillText('Lo verdaderamente valioso es lo académico."', 960, 515);

        // 4 Value Pillars
        const pillars = [
          { icon: '🏛️', title: 'Bóveda Curricular', sub: '+1,500 Nodos SEP Oficiales' },
          { icon: '⚡', title: 'Planeación en 3s', sub: 'Momentos y Rúbricas al Instante' },
          { icon: '🎮', title: 'Gamificación Ética', sub: '17 Nodos Pedagógicos Vivos' },
          { icon: '📱', title: 'WhatsApp Familiar', sub: 'Boletas Directas sin Passwords' }
        ];

        pillars.forEach((p, idx) => {
          const px = 280 + idx * 350;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          roundRect(ctx, px, 570, 320, 170, 20, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          roundRect(ctx, px, 570, 320, 170, 20, false, true);

          ctx.font = '40px sans-serif';
          ctx.fillText(p.icon, px + 160, 630);
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.title, px + 160, 675);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.sub, px + 160, 705);
        });

        ctx.textAlign = 'left';
        ctx.restore();
      }

      // ==============================================================
      // SCENE 2: 10.0s - 20.0s | HUB DOCENTE (CENTRALIZACIÓN Y VELOCIDAD)
      // ==============================================================
      else if (t >= 10.0 && t < 20.0) {
        const lt = t - 10.0;
        drawTechHUD(t, 'Hub Docente · Gestión Centralizada', 'Cero Burocracia', '#10b981');

        // Main UI Window (Crisp Native 1080p scale)
        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'ISkool Suite Docente · Espacio Central del Profesor', '🧑‍🏫');

        // Inside Window: Real Teacher Greeting
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('¡Hola, Profesor!', winX + 60, winY + 110);
        ctx.fillStyle = '#059669';
        ctx.fillText('Israel López Ángeles', winX + 350, winY + 110);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Colegio Innovación Educativa · Selecciona un módulo para iniciar tu sesión', winX + 60, winY + 145);

        // 4 Large Interactive Cards
        const cards = [
          { title: 'Aula Digital & Gremio', sub: 'Convivencia y Ruleta del Héroe', badge: 'En Vivo', color: '#10b981', icon: '🏛️' },
          { title: 'Mis Clases & Evaluación', sub: 'Lista, Asistencias y Boleta NEM', badge: 'Gestión', color: '#2563eb', icon: '📚' },
          { title: 'Crear Actividad', sub: 'Estudio Interactivo de 17 Nodos', badge: 'Acción Rápida', color: '#059669', active: true, icon: '⚡' },
          { title: 'Comunidad Docente', sub: 'Bóveda Curricular Compartida', badge: 'Red Oficial', color: '#d97706', icon: '🌐' }
        ];

        cards.forEach((c, idx) => {
          const cx = winX + 60 + (idx % 2) * 510;
          const cy = winY + 190 + Math.floor(idx / 2) * 330;
          const cw = 480, ch = 300;

          ctx.fillStyle = c.active ? '#064e3b' : '#f8fafc';
          roundRect(ctx, cx, cy, cw, ch, 20, true, false);
          ctx.strokeStyle = c.active ? '#10b981' : '#e2e8f0';
          ctx.lineWidth = c.active ? 3 : 1.5;
          roundRect(ctx, cx, cy, cw, ch, 20, false, true);

          ctx.fillStyle = c.active ? '#ffffff' : '#0f172a';
          ctx.font = '42px sans-serif';
          ctx.fillText(c.icon, cx + 36, cy + 70);

          ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(c.title, cx + 36, cy + 130);

          ctx.fillStyle = c.active ? '#a7f3d0' : '#64748b';
          ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(c.sub, cx + 36, cy + 165);

          // Action Button inside active card
          if (c.active) {
            ctx.fillStyle = '#10b981';
            roundRect(ctx, cx + 36, cy + 210, 408, 54, 14, true, false);
            ctx.fillStyle = '#050811';
            ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Abrir Estudio de Actividades ➔', cx + 240, cy + 244);
            ctx.textAlign = 'left';
          }
        });

        // Fast Snappy Mouse Movement (Arrives in 0.4s!)
        const targetBtnX = winX + 330;
        const targetBtnY = winY + 740;
        const startMX = winX + 100, startMY = winY + 300;
        const progress = Math.min(1, lt * 2.5); // Snaps fast!
        const curMX = startMX + (targetBtnX - startMX) * progress;
        const curMY = startMY + (targetBtnY - startMY) * progress;
        const isClicking = lt > 0.4;
        drawFastCursor(curMX, curMY, isClicking, (lt * 50) % 30);

        // Giant HUD Callouts
        drawHUDCard({
          x: 1260, y: 120, w: 580, h: 380,
          banner: 'Paso 1 · Operación Docente Inmediata',
          tag: '1 Clic', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Hub Docente Centralizado',
          desc: 'El profesor accede a sus clases, dinámicas de aula y planeaciones sin perder tiempo en menús confusos ni formatos repetitivos. Todo organizado a un solo toque.',
          targetX: targetBtnX, targetY: targetBtnY
        });

        drawHUDCard({
          x: 1260, y: 540, w: 580, h: 340,
          banner: 'Dolencia Docente Resuelta',
          tag: '-80% Papeleo', tagColor: '#f59e0b', accentColor: '#f59e0b',
          title: 'Ahorro de +15 Horas Semanales',
          desc: 'Tus profesores recuperan sus tardes y fines de semana. Menos carga burocrática significa mayor retención de talento docente y mejor calidad de enseñanza.'
        });
      }

      // ==============================================================
      // SCENE 3: 20.0s - 30.0s | BÓVEDA CURRICULAR Y PLANEACIÓN NEM
      // ==============================================================
      else if (t >= 20.0 && t < 30.0) {
        const lt = t - 20.0;
        drawTechHUD(t, 'Bóveda Curricular & Planeación NEM', 'Generación 3s', '#06b6d4');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Generador Pedagógico Oficial · Fases 1 a 6 SEP 2024 + Cambridge', '🏛️');

        // Interactive Planning Generator Form
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Planeación Didáctica Oficial (NEM 2024)', winX + 60, winY + 95);

        // Subject Selector Pill
        ctx.fillStyle = '#f1f5f9';
        roundRect(ctx, winX + 60, winY + 120, 1020, 52, 12, true, false);
        ctx.fillStyle = '#0f172a';
        ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Campo Formativo: Saberes y Pensamiento Científico · Fase 4 (4° Primaria)', winX + 85, winY + 152);

        // Active Generation Button
        ctx.fillStyle = '#0284c7';
        roundRect(ctx, winX + 60, winY + 190, 500, 54, 14, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('⚡ Generar Sesión Analítica con IA', winX + 110, winY + 224);

        // Mouse click on button
        const btnX = winX + 310, btnY = winY + 217;
        drawFastCursor(btnX, btnY, lt > 0.3, (lt * 50) % 30);

        // The 3 Didactic Moments Materializing
        const moments = [
          { time: '01. INICIO (15 MIN)', title: 'Activación de Saberes Previos', text: 'Pregunta detonadora y lluvia de ideas sobre el sistema óseo y muscular en el pizarrón.', color: '#10b981', icon: '🟢' },
          { time: '02. DESARROLLO (25 MIN)', title: 'Reto Colaborativo con Libro SEP', text: 'Páginas 45-48: construcción de modelo articular con material reciclado en equipos.', color: '#0284c7', icon: '🔵' },
          { time: '03. CIERRE (10 MIN)', title: 'Entregable Tangible y Coevaluación', text: 'Presentación del modelo y evaluación mediante rúbrica analítica formativa oficial.', color: '#7c3aed', icon: '🟣' }
        ];

        moments.forEach((m, idx) => {
          const my = winY + 270 + idx * 160;
          ctx.fillStyle = '#f8fafc';
          roundRect(ctx, winX + 60, my, 1020, 140, 16, true, false);
          ctx.strokeStyle = m.color;
          ctx.lineWidth = 2.5;
          roundRect(ctx, winX + 60, my, 1020, 140, 16, false, true);

          ctx.fillStyle = m.color;
          ctx.font = '900 14px "JetBrains Mono", monospace';
          ctx.fillText(m.icon + ' ' + m.time, winX + 85, my + 36);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(m.title, winX + 85, my + 72);

          ctx.fillStyle = '#64748b';
          ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(m.text, winX + 85, my + 105);
        });

        // Rubric Badge at bottom
        ctx.fillStyle = '#fef3c7';
        roundRect(ctx, winX + 60, winY + 770, 1020, 80, 14, true, false);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;
        roundRect(ctx, winX + 60, winY + 770, 1020, 80, 14, false, true);
        ctx.fillStyle = '#b45309';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.fillText('🎯 RÚBRICA FORMATIVA DE 4 NIVELES VINCULADA', winX + 85, winY + 805);
        ctx.fillStyle = '#92400e';
        ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Sobresaliente (10), Satisfactorio (9-8), Básico (7-6) e Insuficiente (5) lista para descargar en PDF.', winX + 85, winY + 832);

        // Giant HUD Callouts
        drawHUDCard({
          x: 1260, y: 100, w: 580, h: 400,
          banner: 'Articulación Oficial SEP 2024',
          tag: '+1,500 PDAs', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Bóveda Curricular Oficial',
          desc: 'Más de 1,500 contenidos y Procesos de Desarrollo de Aprendizaje (PDA) de la SEP totalmente integrados. El profesor elige el tema o fotografía el libro, y el sistema genera la sesión analítica.',
          targetX: btnX, targetY: btnY
        });

        drawHUDCard({
          x: 1260, y: 530, w: 580, h: 420,
          banner: 'Automatización Pedagógica',
          tag: 'En 3 Segundos', tagColor: '#06b6d4', accentColor: '#06b6d4',
          title: 'Inicio, Desarrollo, Cierre y Rúbrica',
          desc: 'Sesiones cronometradas listas para impartir: preguntas detonadoras, trabajo colaborativo, entregables tangibles y rúbricas analíticas oficiales de 4 niveles listas para boleta.'
        });
      }

      // ==============================================================
      // SCENE 4: 30.0s - 40.0s | ESTUDIO DE GAMIFICACIÓN (17 NODOS)
      // ==============================================================
      else if (t >= 30.0 && t < 40.0) {
        const lt = t - 30.0;
        drawTechHUD(t, 'Estudio Interactivo · 17 Nodos Pedagógicos', 'Gamificación Viva', '#06b6d4');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Estudio Docente · Constructor Visual de Retos y Escape Rooms', '🧩');

        // Studio Title
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Lienzo de Actividades · "La Gesta Heroica de la Independencia"', winX + 60, winY + 95);

        // Node Flow Canvas (Interactive Visual Representation)
        const nodes = [
          { name: '1. Texto Narrativo', type: 'INICIO', sub: 'Lectura Histórica Comprensiva', x: winX + 80, y: winY + 220, color: '#059669', icon: '📖' },
          { name: '2. Ordenar Cronología', type: 'RETO', sub: 'Las 4 Etapas de la Independencia', x: winX + 440, y: winY + 220, color: '#0284c7', icon: '⏳' },
          { name: '3. Quiz Interactivo', type: 'EVALUACIÓN', sub: 'Trivias con Retroalimentación', x: winX + 800, y: winY + 220, color: '#7c3aed', icon: '🎯' }
        ];

        // Animated Connecting Cable
        ctx.save();
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.moveTo(winX + 280, winY + 340);
        ctx.lineTo(winX + 440, winY + 340);
        ctx.moveTo(winX + 640, winY + 340);
        ctx.lineTo(winX + 800, winY + 340);
        ctx.stroke();

        // Energy pulses traveling along cables
        const pulse1 = (lt * 200) % 160;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath(); ctx.arc(winX + 280 + pulse1, winY + 340, 8, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(winX + 640 + pulse1, winY + 340, 8, 0, Math.PI * 2); ctx.fill();
        ctx.restore();

        // Draw Nodes
        nodes.forEach(n => {
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, n.x, n.y, 250, 240, 18, true, false);
          ctx.strokeStyle = n.color; ctx.lineWidth = 3;
          roundRect(ctx, n.x, n.y, 250, 240, 18, false, true);

          ctx.fillStyle = n.color;
          roundRect(ctx, n.x + 18, n.y + 18, 90, 24, 6, true, false);
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 11px "JetBrains Mono", monospace';
          ctx.fillText(n.type, n.x + 28, n.y + 34);

          ctx.font = '36px sans-serif';
          ctx.fillText(n.icon, n.x + 24, n.y + 90);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 18px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(n.name, n.x + 24, n.y + 135);

          ctx.fillStyle = '#64748b';
          ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(n.sub, n.x + 24, n.y + 165);

          // XP Badge
          ctx.fillStyle = '#f0fdf4';
          roundRect(ctx, n.x + 20, n.y + 195, 100, 28, 8, true, false);
          ctx.fillStyle = '#166534';
          ctx.font = '800 13px "JetBrains Mono", monospace';
          ctx.fillText('⚡ +50 XP', n.x + 35, n.y + 214);
        });

        // Fast cursor clicking Node 2
        const clickNodeX = winX + 540, clickNodeY = winY + 340;
        drawFastCursor(clickNodeX, clickNodeY, lt > 0.3, (lt * 50) % 30);

        // Bottom 17 Nodes Toolbar Preview
        ctx.fillStyle = '#f8fafc';
        roundRect(ctx, winX + 60, winY + 520, 1020, 320, 20, true, false);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
        roundRect(ctx, winX + 60, winY + 520, 1020, 320, 20, false, true);

        ctx.fillStyle = '#0f172a';
        ctx.font = '800 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Biblioteca de 17 Nodos Pedagógicos (Arrastra y Suelta al Tablero)', winX + 90, winY + 560);

        const nodeTags = [
          '📖 Lectura PPM', '🎯 Quiz Formativo', '⏳ Cronología', '🧩 Emparejamiento',
          '💬 Debate Socrático', '🏆 Escape Room', '💎 Cofre de Recompensas', '📊 Votación en Vivo'
        ];
        nodeTags.forEach((tag, idx) => {
          const tx = winX + 90 + (idx % 4) * 235;
          const ty = winY + 590 + Math.floor(idx / 4) * 110;
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, tx, ty, 215, 80, 14, true, false);
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5;
          roundRect(ctx, tx, ty, 215, 80, 14, false, true);

          ctx.fillStyle = '#1e293b';
          ctx.font = '800 15px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(tag, tx + 20, ty + 46);
        });

        // HUD Cards
        drawHUDCard({
          x: 1260, y: 110, w: 580, h: 390,
          banner: 'Gamificación Pedagógica Viva',
          tag: '17 Nodos', tagColor: '#06b6d4', accentColor: '#06b6d4',
          title: '17 Nodos Didácticos Únicos',
          desc: 'Escape rooms, quizzes cronometrados, lectura PPM, ordenar cronología, debate socrático y cofres del tesoro. Aprendizaje activo que cautiva a los alumnos sin aburrirlos.',
          targetX: clickNodeX, targetY: clickNodeY
        });

        drawHUDCard({
          x: 1260, y: 530, w: 580, h: 360,
          banner: 'Facilidad de Uso Garantizada',
          tag: 'Cero Código', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Crea Videojuegos Educativos sin Programar',
          desc: 'Cualquier docente puede arrastrar nodos pedagógicos, personalizarlos con los contenidos de su clase y publicar retos interactivos en cuestión de minutos.'
        });
      }

      // ==============================================================
      // SCENE 5: 40.0s - 50.0s | EL CAMINO DEL HÉROE (PORTAL ALUMNO)
      // ==============================================================
      else if (t >= 40.0 && t < 50.0) {
        const lt = t - 40.0;
        drawTechHUD(t, 'Portal del Estudiante · El Camino del Héroe', 'Economía por Mérito', '#f59e0b');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Portal del Estudiante · Aventura de Aprendizaje Basada en Valores', '🛡️');

        // Student Greeting & Hero Avatar Section
        ctx.fillStyle = '#064e3b';
        roundRect(ctx, winX + 60, winY + 80, 1020, 360, 24, true, false);

        // Avatar Card
        ctx.fillStyle = '#0f172a';
        roundRect(ctx, winX + 100, winY + 110, 200, 290, 18, true, false);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
        roundRect(ctx, winX + 100, winY + 110, 200, 290, 18, false, true);

        ctx.font = '64px sans-serif';
        ctx.fillText('🧙‍♂️', winX + 165, winY + 200);

        ctx.fillStyle = '#ffffff';
        ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('LucasAvatar', winX + 145, winY + 250);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 14px "JetBrains Mono", monospace';
        ctx.fillText('NIVEL 4 MAESTRO', winX + 135, winY + 280);

        // Student Progress
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 36px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('¡Hola, Lucas!', winX + 340, winY + 160);

        ctx.fillStyle = '#a7f3d0';
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Has completado 8 de 10 misiones semanales de Matemáticas e Historia.', winX + 340, winY + 200);

        // XP Bar Filling
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        roundRect(ctx, winX + 340, winY + 240, 680, 36, 18, true, false);
        const xpProgress = Math.min(1, 0.4 + lt * 0.15);
        ctx.fillStyle = '#f59e0b';
        roundRect(ctx, winX + 340, winY + 240, 680 * xpProgress, 36, 18, true, false);

        ctx.fillStyle = '#050811';
        ctx.font = '900 14px "JetBrains Mono", monospace';
        ctx.fillText('PROGRESO ACADÉMICO: ' + Math.round(xpProgress * 100) + '% (750 / 750 XP)', winX + 420, winY + 264);

        // Quest Map preview below
        ctx.fillStyle = '#f8fafc';
        roundRect(ctx, winX + 60, winY + 480, 1020, 370, 20, true, false);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
        roundRect(ctx, winX + 60, winY + 480, 1020, 370, 20, false, true);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Mapa del Laberinto Académico (Misiones Curriculares)', winX + 90, winY + 525);

        const quests = [
          { title: 'Reto 1: Fracciones', xp: '+100 XP', done: true, icon: '⭐' },
          { title: 'Reto 2: Ecosistemas', xp: '+150 XP', done: true, icon: '⭐' },
          { title: 'Reto 3: Independencia', xp: '+200 XP', done: true, icon: '⭐' },
          { title: 'Reto 4: Debate Ético', xp: '+250 XP', done: false, icon: '🔒' }
        ];

        quests.forEach((q, idx) => {
          const qx = winX + 90 + idx * 240;
          ctx.fillStyle = q.done ? '#ecfdf5' : '#ffffff';
          roundRect(ctx, qx, winY + 560, 220, 250, 18, true, false);
          ctx.strokeStyle = q.done ? '#10b981' : '#cbd5e1'; ctx.lineWidth = 2;
          roundRect(ctx, qx, winY + 560, 220, 250, 18, false, true);

          ctx.font = '36px sans-serif';
          ctx.fillText(q.icon, qx + 90, winY + 630);

          ctx.fillStyle = '#0f172a';
          ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(q.title, qx + 20, winY + 685);

          ctx.fillStyle = q.done ? '#059669' : '#94a3b8';
          ctx.font = '800 14px "JetBrains Mono", monospace';
          ctx.fillText(q.done ? 'COMPLETADO' : 'BLOQUEADO', qx + 20, winY + 725);
        });

        // Pointer snapping to Avatar
        drawFastCursor(winX + 200, winY + 250, lt > 0.3, (lt * 50) % 30);

        // HUD Cards
        drawHUDCard({
          x: 1260, y: 110, w: 580, h: 390,
          banner: 'Compromiso Escolar Genuino',
          tag: 'Aventura', tagColor: '#f59e0b', accentColor: '#f59e0b',
          title: 'El Camino del Héroe del Alumno',
          desc: 'El estudiante vive su ciclo escolar como una aventura pedagógica: resuelve desafíos, desbloquea rangos y ve cómo su esfuerzo diario se traduce en progreso visible.',
          targetX: winX + 200, targetY: winY + 250
        });

        drawHUDCard({
          x: 1260, y: 530, w: 580, h: 360,
          banner: 'Filosofía Pedagógica Ética',
          tag: 'Mérito 100%', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Cero Compras con Dinero Real',
          desc: 'A diferencia de plataformas comerciales con microtransacciones, en ISkool todo se gana exclusivamente por mérito escolar, tareas cumplidas y valores del aula.'
        });
      }

      // ==============================================================
      // SCENE 6: 50.0s - 60.0s | EXPEDIENTE 360° Y SEGURIDAD MÉDICA
      // ==============================================================
      else if (t >= 50.0 && t < 60.0) {
        const lt = t - 50.0;
        drawTechHUD(t, 'Expediente 360° · Seguridad Médica y Clínica', 'Alerta Crítica', '#ef4444');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Expediente 360° Clínico-Académico · Protocolo de Seguridad Escolar', '🏥');

        // Student Header: Diego Vargas
        ctx.fillStyle = '#0f172a';
        ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Diego Vargas · 4° Primaria (Grupo A)', winX + 60, winY + 105);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Instituto Modelo de Excelencia · Matrícula MAT-2026-0891 · Tutor: Roberto Vargas', winX + 60, winY + 140);

        // HUGE, LEGIBLE, HIGH-CONTRAST MEDICAL CARD
        const medY = winY + 180;
        ctx.fillStyle = '#fef2f2';
        roundRect(ctx, winX + 60, medY, 1020, 380, 24, true, false);
        ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 3.5;
        roundRect(ctx, winX + 60, medY, 1020, 380, 24, false, true);

        // Flashing Emergency Banner
        ctx.fillStyle = '#ef4444';
        roundRect(ctx, winX + 90, medY + 30, 360, 44, 12, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.fillText('🚨 ALERTA MÉDICA CRÍTICA ACTIVA', winX + 115, medY + 58);

        // Clear Medical Details
        ctx.fillStyle = '#991b1b';
        ctx.font = '900 28px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Alergia Severa: Rinitis alérgica estacional al polen y polvo', winX + 90, medY + 120);

        ctx.fillStyle = '#7f1d1d';
        ctx.font = '700 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('• Medicación Autorizada: Antihistamínico oral bajo supervisión médica en botiquín.', winX + 90, medY + 165);
        ctx.fillText('• Protocolo Inmediato: Evitar áreas de polvo intenso y jardín en días de alta polinización.', winX + 90, medY + 200);
        ctx.fillText('• Teléfono de Emergencia Tutor: 555-987-2006 (Atención Inmediata)', winX + 90, medY + 235);

        // Emergency Action Button
        ctx.fillStyle = '#dc2626';
        roundRect(ctx, winX + 90, medY + 275, 520, 56, 14, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 17px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('📢 Notificar a Enfermería y Dirección General', winX + 120, medY + 310);

        // Target of laser line
        const medBtnX = winX + 350, medBtnY = medY + 300;
        drawFastCursor(medBtnX, medBtnY, lt > 0.3, (lt * 50) % 30);

        // Clinical / Behavioral 360 History below
        ctx.fillStyle = '#f8fafc';
        roundRect(ctx, winX + 60, winY + 590, 1020, 260, 20, true, false);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
        roundRect(ctx, winX + 60, winY + 590, 1020, 260, 20, false, true);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Historial Integral 360° (Psicopedagógico, Asistencia y Conducta)', winX + 90, winY + 635);

        const badges360 = [
          { label: 'Asistencia Escolar', val: '98.5% Regular', color: '#059669' },
          { label: 'Desempeño Académico', val: 'Sobresaliente (9.4)', color: '#0284c7' },
          { label: 'Bitácora Psicopedagógica', val: 'Excelente integración grupal', color: '#7c3aed' }
        ];

        badges360.forEach((b, idx) => {
          const bx = winX + 90 + idx * 320;
          ctx.fillStyle = '#ffffff';
          roundRect(ctx, bx, winY + 665, 300, 140, 16, true, false);
          ctx.strokeStyle = '#cbd5e1'; ctx.lineWidth = 1.5;
          roundRect(ctx, bx, winY + 665, 300, 140, 16, false, true);

          ctx.fillStyle = '#64748b';
          ctx.font = '700 14px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(b.label, bx + 24, winY + 705);

          ctx.fillStyle = b.color;
          ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(b.val, bx + 24, winY + 750);
        });

        // Giant HUD Callouts
        drawHUDCard({
          x: 1260, y: 110, w: 580, h: 390,
          banner: 'Seguridad Escolar Total',
          tag: 'Crítico', tagColor: '#ef4444', accentColor: '#ef4444',
          title: 'Alertas Médicas en Primer Plano',
          desc: 'Alergias graves, padecimientos y contactos de emergencia resaltados para profesores y enfermería. Reacción inmediata garantizada ante cualquier incidente de salud.',
          targetX: medBtnX, targetY: medBtnY
        });

        drawHUDCard({
          x: 1260, y: 530, w: 580, h: 360,
          banner: 'Expediente Único Digital',
          tag: 'Auditado 360°', tagColor: '#06b6d4', accentColor: '#06b6d4',
          title: 'Historial Clínico y Psicopedagógico',
          desc: 'Toda la trayectoria del alumno: bitácoras de conducta, asistencias, historial médico y seguimiento académico centralizados con estricta privacidad institucional.'
        });
      }

      // ==============================================================
      // SCENE 7: 60.0s - 70.0s | VÍNCULO FAMILIAR POR WHATSAPP DIRECTO
      // ==============================================================
      else if (t >= 60.0 && t < 70.0) {
        const lt = t - 60.0;
        drawTechHUD(t, 'Portal Familiar · Comunicación Directa por WhatsApp', 'Cero Fricción', '#10b981');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Portal de Familias · Boletas de Evaluación y Mensajería Escolar', '📱');

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Panel de Padres de Familia', winX + 60, winY + 105);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Alumno vinculado: Lucas Hernández Ruiz · 4° de Primaria', winX + 60, winY + 140);

        // Modern Smartphone WhatsApp Simulation Box
        const waY = winY + 180;
        ctx.fillStyle = '#064e3b';
        roundRect(ctx, winX + 60, waY, 1020, 360, 24, true, false);
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;
        roundRect(ctx, winX + 60, waY, 1020, 360, 24, false, true);

        // WhatsApp Header
        ctx.fillStyle = '#10b981';
        roundRect(ctx, winX + 100, waY + 30, 320, 42, 10, true, false);
        ctx.fillStyle = '#050811';
        ctx.font = '900 14px "JetBrains Mono", monospace';
        ctx.fillText('💬 WHATSAPP INSTITUCIONAL', winX + 125, waY + 57);

        // Message Bubble
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, winX + 100, waY + 95, 820, 160, 18, true, false);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 20px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Estimada Familia Hernández:', winX + 130, waY + 135);

        ctx.fillStyle = '#334155';
        ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Se ha publicado la Boleta de Evaluación Oficial del 1er Periodo y el portafolio de evidencias de Lucas.', winX + 130, waY + 170);

        ctx.fillStyle = '#059669';
        ctx.font = '800 17px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('👉 Toca aquí para ver sin necesidad de usuario ni contraseña  ✓✓', winX + 130, waY + 210);

        // One-Click Button
        ctx.fillStyle = '#10b981';
        roundRect(ctx, winX + 100, waY + 280, 420, 50, 12, true, false);
        ctx.fillStyle = '#050811';
        ctx.font = '900 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('⚡ Envío Automatizado en 1 Toque', winX + 150, waY + 312);

        const waBtnX = winX + 310, waBtnY = waY + 305;
        drawFastCursor(waBtnX, waBtnY, lt > 0.3, (lt * 50) % 30);

        // Student Portfolio Showcase below
        ctx.fillStyle = '#f8fafc';
        roundRect(ctx, winX + 60, winY + 580, 1020, 270, 20, true, false);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
        roundRect(ctx, winX + 60, winY + 580, 1020, 270, 20, false, true);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Muro de Logros y Portafolio de Evidencias Formativas', winX + 90, winY + 625);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Los padres ven fotos, entregables y comentarios pedagógicos del docente al instante.', winX + 90, winY + 665);

        ctx.fillStyle = '#dcfce7';
        roundRect(ctx, winX + 90, winY + 700, 360, 60, 14, true, false);
        ctx.fillStyle = '#166534';
        ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('✓ Evidencia Aprobada: "Mi Pizza de Fracciones"', winX + 110, winY + 737);

        // HUD Cards
        drawHUDCard({
          x: 1260, y: 110, w: 580, h: 390,
          banner: 'Fidelización de Padres de Familia',
          tag: '1 Clic', tagColor: '#10b981', accentColor: '#10b981',
          title: 'Reportes Directo a su WhatsApp',
          desc: 'Boletas de evaluación, tareas y avisos urgentes llegan directo a la app que los padres usan todos los días. Comunicación fluida sin saturar la recepción escolar.',
          targetX: waBtnX, targetY: waBtnY
        });

        drawHUDCard({
          x: 1260, y: 530, w: 580, h: 360,
          banner: 'Experiencia Sin Fricción',
          tag: 'Cero Passwords', tagColor: '#06b6d4', accentColor: '#06b6d4',
          title: 'Cero Contraseñas Olvidadas',
          desc: 'Acceso seguro mediante enlaces cifrados directos al teléfono del tutor. Se terminan las llamadas diarias de padres de familia pidiendo recuperar contraseñas.',
          targetX: waBtnX, targetY: waBtnY
        });
      }

      // ==============================================================
      // SCENE 8: 70.0s - 75.0s | SUPERVISIÓN DIRECTIVA (KPIs CURRICULARES)
      // ==============================================================
      else if (t >= 70.0 && t < 75.0) {
        drawTechHUD(t, 'Dirección General · Supervisión Curricular en Vivo', 'Auditoría SEP', '#06b6d4');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Panel de Supervisión Directiva · Indicadores de Cobertura Curricular', '📊');

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Dirección General · Auditoría Curricular', winX + 60, winY + 105);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Instituto Modelo de Excelencia · Monitoreo de 18 Grupos Oficiales', winX + 60, winY + 140);

        // 3 Giant Crisp KPI Dials
        const kpis = [
          { label: 'COBERTURA CURRICULAR', val: '98.5%', sub: 'Avance conforme a SEP 2024', color: '#10b981' },
          { label: 'DOCENTES CON PLANEACIÓN', val: '18 / 18', sub: '100% Sesiones al Día', color: '#0284c7' },
          { label: 'ASISTENCIA INSTITUCIONAL', val: '96.8%', sub: 'Semana Lectiva Vigente', color: '#7c3aed' }
        ];

        kpis.forEach((k, idx) => {
          const kx = winX + 60 + idx * 345;
          ctx.fillStyle = '#f8fafc';
          roundRect(ctx, kx, winY + 180, 330, 240, 20, true, false);
          ctx.strokeStyle = k.color; ctx.lineWidth = 3;
          roundRect(ctx, kx, winY + 180, 330, 240, 20, false, true);

          ctx.fillStyle = k.color;
          ctx.font = '900 14px "JetBrains Mono", monospace';
          ctx.fillText(k.label, kx + 24, winY + 225);

          ctx.fillStyle = '#0f172a';
          ctx.font = '900 48px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(k.val, kx + 24, winY + 300);

          ctx.fillStyle = '#64748b';
          ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(k.sub, kx + 24, winY + 350);
        });

        // Curricular Breakdown Table below
        ctx.fillStyle = '#ffffff';
        roundRect(ctx, winX + 60, winY + 460, 1020, 380, 20, true, false);
        ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2;
        roundRect(ctx, winX + 60, winY + 460, 1020, 380, 20, false, true);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 22px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Desglose de Cobertura por Campos Formativos', winX + 90, winY + 505);

        const subjects = [
          { name: 'Lenguajes (Español & Cambridge)', prog: '100% al Día', bar: 1.0, color: '#10b981' },
          { name: 'Saberes y Pensamiento Científico', prog: '97% al Día', bar: 0.97, color: '#0284c7' },
          { name: 'Ética, Naturaleza y Sociedades', prog: '98% al Día', bar: 0.98, color: '#f59e0b' },
          { name: 'De lo Humano y lo Comunitario', prog: '100% al Día', bar: 1.0, color: '#7c3aed' }
        ];

        subjects.forEach((s, idx) => {
          const sy = winY + 550 + idx * 65;
          ctx.fillStyle = '#1e293b';
          ctx.font = '800 16px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(s.name, winX + 90, sy + 20);

          ctx.fillStyle = '#e2e8f0';
          roundRect(ctx, winX + 460, sy, 380, 24, 12, true, false);
          ctx.fillStyle = s.color;
          roundRect(ctx, winX + 460, sy, 380 * s.bar, 24, 12, true, false);

          ctx.fillStyle = s.color;
          ctx.font = '900 15px "JetBrains Mono", monospace';
          ctx.fillText(s.prog, winX + 870, sy + 18);
        });

        drawHUDCard({
          x: 1260, y: 180, w: 580, h: 420,
          banner: 'Gobierno Escolar en Tiempo Real',
          tag: 'Supervisión SEP', tagColor: '#06b6d4', accentColor: '#06b6d4',
          title: 'Control Curricular de Todos los Grupos',
          desc: 'La Dirección General audita en tiempo real el avance exacto de cada materia, docente y grupo en vivo. Información lista para inspecciones de zona y acreditaciones escolares.'
        });
      }

      // ==============================================================
      // SCENE 9: 75.0s - 80.0s | FACTURACIÓN SAT CFDI 4.0 (IEDU)
      // ==============================================================
      else if (t >= 75.0 && t < 80.0) {
        drawTechHUD(t, 'Módulo Administrativo & Fiscal · SAT CFDI 4.0', 'Opcional', '#f59e0b');

        const winX = 80, winY = 80, winW = 1140, winH = 920;
        drawMockupWindow(winX, winY, winW, winH, 'Módulo Administrativo · Facturación Fiscal y Cobranza Institucional', '📑');

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 32px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Facturación y Timbrado SAT CFDI 4.0', winX + 60, winY + 105);

        ctx.fillStyle = '#64748b';
        ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Módulo Complementario y Opcional para Escuelas con Administración Unificada', winX + 60, winY + 140);

        // Huge Crisp Fiscal Invoice Card
        const invY = winY + 180;
        ctx.fillStyle = '#f8fafc';
        roundRect(ctx, winX + 60, invY, 1020, 600, 24, true, false);
        ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3;
        roundRect(ctx, winX + 60, invY, 1020, 600, 24, false, true);

        // Fiscal Badge
        ctx.fillStyle = '#f59e0b';
        roundRect(ctx, winX + 90, invY + 30, 420, 44, 12, true, false);
        ctx.fillStyle = '#050811';
        ctx.font = '900 15px "JetBrains Mono", monospace';
        ctx.fillText('🧾 COMPLEMENTO EDUCATIVO (IEDU) SAT', winX + 110, invY + 58);

        ctx.fillStyle = '#0f172a';
        ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Recibo de Colegiatura Timbrado con Validez Fiscal', winX + 90, invY + 120);

        // Invoice details
        const invDetails = [
          { label: 'Emisor Oficial:', val: 'Instituto Modelo de Excelencia, S.C.' },
          { label: 'Receptor / Tutor:', val: 'Roberto Vargas (CURP: VARP800512HDFR...)' },
          { label: 'Concepto Fiscal:', val: 'Colegiatura Primaria 4° Grado (Septiembre 2026)' },
          { label: 'Monto Total:', val: '$3,800.00 MXN (100% Deducible de Impuestos IEDU)' }
        ];

        invDetails.forEach((d, idx) => {
          const dy = invY + 170 + idx * 70;
          ctx.fillStyle = '#64748b';
          ctx.font = '700 16px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(d.label, winX + 90, dy);

          ctx.fillStyle = '#0f172a';
          ctx.font = '900 18px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(d.val, winX + 320, dy);
        });

        // Stamp verified
        ctx.fillStyle = '#ecfdf5';
        roundRect(ctx, winX + 90, invY + 460, 960, 80, 16, true, false);
        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;
        roundRect(ctx, winX + 90, invY + 460, 960, 80, 16, false, true);

        ctx.fillStyle = '#166534';
        ctx.font = '900 16px "JetBrains Mono", monospace';
        ctx.fillText('✅ TIMBRADO AUTOMÁTICO SAT · ARCHIVOS PDF Y XML ENVIADOS AL CORREO DEL PADRE', winX + 120, invY + 508);

        drawHUDCard({
          x: 1260, y: 180, w: 580, h: 420,
          banner: 'Módulo Complementario',
          tag: 'SAT Oficial', tagColor: '#f59e0b', accentColor: '#f59e0b',
          title: 'Facturación SAT CFDI 4.0 (IEDU)',
          desc: 'Timbrado fiscal automático con complemento educativo para deducibilidad de colegiaturas. Un módulo complementario y ordenado para escuelas que buscan unificar su administración en un solo sistema.'
        });
      }

      // ==============================================================
      // SCENE 10: 80.0s - 90.0s | GRAN CIERRE INSTITUCIONAL (CTA)
      // ==============================================================
      else if (t >= 80.0 && t <= 90.0) {
        drawTechHUD(t, 'Liderazgo Institucional', 'Prueba Piloto', '#d97706');

        ctx.save();
        ctx.fillStyle = 'rgba(12, 19, 36, 0.96)';
        roundRect(ctx, 240, 120, 1440, 820, 36, true, false);
        ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3;
        roundRect(ctx, 240, 120, 1440, 820, 36, false, true);

        // Header Pill
        ctx.fillStyle = '#d97706';
        roundRect(ctx, 720, 170, 480, 46, 23, true, false);
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
          { icon: '⚡', title: 'Despliegue en 48 Horas', desc: 'Carga inmediata de grupos, docentes y planes de estudio sin interrupciones operativas.' },
          { icon: '👩‍🏫', title: 'Acompañamiento Docente', desc: 'Capacitación pedagógica y acompañamiento directo a tus profesores desde el primer día.' },
          { icon: '🛡️', title: 'Prueba Piloto Cero Riesgo', desc: 'Comprueba los resultados en tus aulas antes de cualquier decisión institucional.' }
        ];

        finalPillars.forEach((p, idx) => {
          const px = 300 + idx * 450;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
          roundRect(ctx, px, 380, 420, 220, 24, true, false);
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
          roundRect(ctx, px, 380, 420, 220, 24, false, true);

          ctx.font = '40px sans-serif';
          ctx.fillText(p.icon, px + 210, 445);
          ctx.fillStyle = '#ffffff';
          ctx.font = '800 22px "Plus Jakarta Sans", sans-serif';
          ctx.fillText(p.title, px + 210, 495);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
          const words = p.desc.split(' ');
          let l = ''; let ly = 530;
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
        roundRect(ctx, 680, 660, 560, 72, 20, true, false);
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('🚀 Agenda tu Demostración Institucional', 960, 705);

        ctx.fillStyle = '#10b981';
        ctx.font = '800 24px "JetBrains Mono", monospace';
        ctx.fillText('www.iskool.app', 960, 780);

        ctx.textAlign = 'left';
        ctx.restore();
      }

      // ==============================================================
      // HIGH-ENERGY NEON TRANSITION WIPES
      // ==============================================================
      const transMoments = [10.0, 20.0, 30.0, 40.0, 50.0, 60.0, 70.0, 75.0, 80.0];
      for (let tm of transMoments) {
        if (t >= tm - 0.35 && t <= tm + 0.35) {
          const dt = (t - (tm - 0.35)) / 0.7; // 0 to 1
          const wipeX = dt * 2600 - 400;

          ctx.save();
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 40;
          ctx.beginPath();
          ctx.moveTo(wipeX, 0);
          ctx.lineTo(wipeX + 260, 0);
          ctx.lineTo(wipeX - 100, 1080);
          ctx.lineTo(wipeX - 360, 1080);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#10b981';
          ctx.beginPath();
          ctx.moveTo(wipeX + 260, 0);
          ctx.lineTo(wipeX + 320, 0);
          ctx.lineTo(wipeX - 40, 1080);
          ctx.lineTo(wipeX - 100, 1080);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // MediaRecorder Live Recording
    window.startLiveRecording = async function() {
      window.recordedChunks = [];
      const stream = canvas.captureStream(FPS);
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp8',
        videoBitsPerSecond: 10000000 // 10 Mbps crisp quality
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

const htmlPath = path.join(outputDir, 'high_tech_renderer_v2.html');
fs.writeFileSync(htmlPath, htmlContent, 'utf8');
console.log(`✅ Razor-sharp native engine generated: ${htmlPath}`);

async function produceVideo() {
  console.log('🚀 Launching Puppeteer to capture 90-second razor-sharp live video...');
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

  const rawWebmPath = path.join(outputDir, 'high_tech_raw_v2.webm');
  fs.writeFileSync(rawWebmPath, Buffer.from(base64WebM, 'base64'));
  console.log(`✅ WebM Captured: ${rawWebmPath} (${(fs.statSync(rawWebmPath).size / (1024 * 1024)).toFixed(2)} MB)`);

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
  console.log('🎉 VIDEO COMERCIAL MAESTRO V2 ACTUALIZADO:');
  console.log(`📁 Archivo: ${finalMp4Path}`);
  console.log(`📊 Tamaño: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
  console.log('⏱️ Duración: EXACTAMENTE 90 SEGUNDOS (01:30)');
  console.log('🎯 Calidad: Full HD 1080p @ 30fps · Audio 256 kbps');
  console.log('======================================================');

  if (fs.existsSync(rawWebmPath)) fs.unlinkSync(rawWebmPath);
}

produceVideo().catch(err => {
  console.error('Production error:', err);
  process.exit(1);
});
