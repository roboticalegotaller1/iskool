const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Helper para convertir imagen a base64
function getBase64Image(filename) {
  const filePath = path.join(__dirname, 'presentation_screenshots', filename);
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath);
    return `data:image/png;base64,${data.toString('base64')}`;
  }
  return '';
}

const imgFinanzas = getBase64Image('screen_finanzas_admin.png');
const imgExpediente360 = getBase64Image('screen_expediente_360_real.png');
const imgDirector = getBase64Image('screen_director_supervision.png');
const imgTeacher = getBase64Image('screen_teacher_planning.png');
const imgTeacherNem = getBase64Image('screen_teacher_planning_nem.png') || imgTeacher;
const imgStudio = getBase64Image('screen_studio_canvas.png');
const imgStudent = getBase64Image('screen_student_hero.png');
const imgParent = getBase64Image('screen_parent_portal.png');

console.log('Imágenes base64 cargadas:');
console.log('- Docente Planeación:', imgTeacher ? 'OK' : 'FALTA');
console.log('- Docente NEM Bóveda:', imgTeacherNem ? 'OK' : 'FALTA');
console.log('- Estudio 17 Nodos:', imgStudio ? 'OK' : 'FALTA');
console.log('- Alumno Camino Héroe:', imgStudent ? 'OK' : 'FALTA');
console.log('- Expediente 360° Real:', imgExpediente360 ? 'OK' : 'FALTA');
console.log('- Familias WhatsApp:', imgParent ? 'OK' : 'FALTA');
console.log('- Director Supervisión:', imgDirector ? 'OK' : 'FALTA');
console.log('- Finanzas Admin (Módulo Final):', imgFinanzas ? 'OK' : 'FALTA');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ISkool Académico - Presentación Ejecutiva Institucional</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap');

    @page {
      size: 16in 9in;
      margin: 0;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      margin: 0;
      padding: 0;
      font-family: 'Inter', sans-serif;
      color: #0f172a;
      background: #f8fafc;
      -webkit-font-smoothing: antialiased;
    }

    .slide {
      width: 16in;
      height: 9in;
      position: relative;
      overflow: hidden;
      padding: 0.55in 0.8in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      background: radial-gradient(circle at 50% -10%, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
    }

    /* Ambient Glows - Elegantes y suaves */
    .glow-top-right {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 550px;
      height: 550px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.08);
      filter: blur(120px);
      pointer-events: none;
    }

    .glow-bottom-left {
      position: absolute;
      bottom: -120px;
      left: -120px;
      width: 550px;
      height: 550px;
      border-radius: 50%;
      background: rgba(14, 165, 233, 0.07);
      filter: blur(120px);
      pointer-events: none;
    }

    /* Subtle grid background */
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(15, 23, 42, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      mask-image: radial-gradient(ellipse 75% 65% at 50% 50%, #000 60%, transparent 100%);
      pointer-events: none;
    }

    /* Header */
    .slide-header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.12in;
      border-bottom: 1.5px solid #e2e8f0;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
    }

    .brand-text {
      font-family: 'Outfit', sans-serif;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    .brand-tag {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      padding: 3px 8px;
      border-radius: 6px;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      margin-left: 8px;
    }

    .header-pill {
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
      font-weight: 700;
      text-transform: uppercase;
      padding: 5px 14px;
      border-radius: 999px;
      background: #ffffff;
      color: #0f172a;
      border: 1.5px solid #cbd5e1;
      box-shadow: 0 2px 5px rgba(15, 23, 42, 0.04);
    }

    /* Footer */
    .slide-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.12in;
      border-top: 1.5px solid #e2e8f0;
      font-size: 11.5px;
      color: #64748b;
      font-weight: 500;
    }

    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      font-weight: 800;
      color: #059669;
      background: #ecfdf5;
      padding: 3px 10px;
      border-radius: 6px;
      border: 1px solid #a7f3d0;
    }

    /* Typography */
    .hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 48px;
      font-weight: 900;
      line-height: 1.12;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin: 0 0 16px 0;
    }

    .slide-title {
      font-family: 'Outfit', sans-serif;
      font-size: 34px;
      font-weight: 800;
      line-height: 1.2;
      letter-spacing: -0.025em;
      color: #0f172a;
      margin: 0 0 10px 0;
    }

    .slide-subtitle {
      font-size: 15px;
      line-height: 1.55;
      color: #475569;
      margin: 0 0 22px 0;
      font-weight: 400;
    }

    .gradient-text-emerald {
      background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .gradient-text-gold {
      background: linear-gradient(135deg, #d97706 0%, #b45309 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .gradient-text-blue {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Cards */
    .card {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.03);
    }

    .gold-button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 28px;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #ffffff;
      font-weight: 800;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid #f59e0b;
      box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.35);
    }

    /* Layout Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
    }

    .grid-bento {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    /* Feature Item inside Card */
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 12px;
    }

    .feature-item:last-child {
      margin-bottom: 0;
    }

    .feature-icon-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: #059669;
      flex-shrink: 0;
    }

    .feature-icon-gold {
      background: #fef3c7;
      border: 1px solid #fde68a;
      color: #d97706;
    }

    .feature-icon-blue {
      background: #e0f2fe;
      border: 1px solid #bae6fd;
      color: #0284c7;
    }

    .feature-icon-purple {
      background: #f3e8ff;
      border: 1px solid #e9d5ff;
      color: #7e22ce;
    }

    .feature-title {
      font-size: 14.5px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .feature-desc {
      font-size: 12px;
      line-height: 1.45;
      color: #475569;
    }

    /* Metric Box */
    .metric-pill {
      background: #ffffff;
      border: 1.5px solid #e2e8f0;
      border-radius: 14px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 3px;
      box-shadow: 0 4px 12px -2px rgba(15, 23, 42, 0.05);
    }

    .metric-label {
      font-size: 9.5px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #0d9488;
      font-weight: 800;
    }

    .metric-value {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      font-family: 'Outfit', sans-serif;
    }

    /* Table styles */
    .comp-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 14px;
      overflow: hidden;
      border: 1.5px solid #cbd5e1;
      background: #ffffff;
      box-shadow: 0 10px 30px -5px rgba(15, 23, 42, 0.06);
      font-size: 12px;
    }

    .comp-table th {
      background: #f8fafc;
      padding: 11px 16px;
      text-align: left;
      font-family: 'Outfit', sans-serif;
      font-size: 12.5px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #cbd5e1;
    }

    .comp-table td {
      padding: 10px 16px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }

    .comp-table tr:last-child td {
      border-bottom: none;
    }

    .comp-table tr:hover td {
      background: #f8fafc;
    }

    .badge-check {
      display: inline-block;
      color: #059669;
      font-weight: 800;
      margin-right: 6px;
    }

    .badge-cross {
      display: inline-block;
      color: #e11d48;
      font-weight: 800;
      margin-right: 6px;
    }

    /* Mockup Frame with Real Screenshot */
    .mockup-window-real {
      background: #ffffff;
      border: 1.5px solid #cbd5e1;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.15), 0 0 1px 1px rgba(15, 23, 42, 0.05);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .mockup-header-real {
      background: #f8fafc;
      padding: 9px 14px;
      border-bottom: 1.5px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .mockup-controls {
      display: flex;
      align-items: center;
      gap: 7px;
    }

    .mockup-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .mockup-url-bar {
      font-size: 10.5px;
      color: #334155;
      font-family: 'JetBrains Mono', monospace;
      background: #ffffff;
      padding: 3px 12px;
      border-radius: 6px;
      border: 1px solid #cbd5e1;
      font-weight: 600;
      box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .mockup-img-container {
      position: relative;
      flex: 1;
      background: #f1f5f9;
      overflow: hidden;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      max-height: 410px;
    }

    .mockup-real-screen {
      width: 100%;
      height: 100%;
      max-height: 410px;
      object-fit: cover;
      object-position: top center;
      display: block;
    }

    .mockup-footer-badge {
      background: #f8fafc;
      padding: 8px 14px;
      border-top: 1.5px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10.5px;
      color: #64748b;
      font-weight: 500;
    }

    .mockup-live-indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: #059669;
      font-weight: 800;
      font-size: 11px;
      font-family: 'JetBrains Mono', monospace;
    }

    .live-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.7);
    }
  </style>
</head>
<body>

  <!-- =================================================================== -->
  <!-- SLIDE 1: PORTADA INSTITUCIONAL (FOCO EN EXCELENCIA PEDAGÓGICA)       -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="glow-bottom-left"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Académico</span>
        </div>
      </div>
      <div class="header-pill">Propuesta Institucional 2026</div>
    </div>

    <div class="slide-body" style="align-items: center; text-align: center; max-width: 1100px; margin: 0 auto;">
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 999px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 6px rgba(16, 185, 129, 0.1);">
        ★ Excelencia Pedagógica para Dueños, Directores Generales y Consejos Académicos
      </div>

      <h1 class="hero-title" style="font-size: 54px;">
        La Plataforma de <span class="gradient-text-emerald">Excelencia Académica</span> que Transforma tu Colegio
      </h1>

      <p class="slide-subtitle" style="font-size: 18.5px; max-width: 900px; margin-bottom: 28px;">
        La suite institucional soberana que unifica la Bóveda Curricular oficial SEP NEM 2024, el estándar bilingüe Cambridge y la gamificación inmersiva para elevar la calidad educativa, motivar al estudiante y respaldar al docente.
      </p>

      <div class="grid-4" style="width: 100%; max-width: 1040px;">
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Bóveda Curricular</span>
          <span class="metric-value">NEM Fases 1 a 6 + Cambridge</span>
        </div>
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Productividad Docente</span>
          <span class="metric-value">Planeación en Segundos</span>
        </div>
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Metodología Lúdica</span>
          <span class="metric-value">Estudio con 17 Nodos</span>
        </div>
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Vínculo con Familias</span>
          <span class="metric-value">WhatsApp y Mensajería Directa</span>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Confidencial • Preparado para Consejos Directivos y Académicos</div>
      <div class="slide-number">01 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 2: LA TESIS CENTRAL: LO VERDADERAMENTE VALIOSO ES LO ACADÉMICO -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Tesis de Valor</span>
        </div>
      </div>
      <div class="header-pill">El Diagnóstico Estratégico</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        La cobranza no define a una gran escuela. <span class="gradient-text-emerald">Lo verdaderamente valioso es lo académico.</span>
      </h2>
      <p class="slide-subtitle">
        Los colegios privados no ganan prestigio ni retienen familias por su caja registradora, sino por la calidad de su enseñanza, el entusiasmo de sus alumnos en el aula y el respaldo que brindan a sus maestros frente a las exigencias normativas.
      </p>

      <div class="grid-2">
        <div class="card" style="border: 1.5px solid #fecdd3; background: #fff1f2; box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.07);">
          <div style="font-size: 13px; font-weight: 800; color: #e11d48; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ⚠️ El error de los sistemas centrados solo en la cobranza
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #ffe4e6; border-color: #fda4af; color: #e11d48;">✕</div>
            <div>
              <div class="feature-title" style="color: #881337;">Tratan al colegio como comercio, no como centro educativo</div>
              <div class="feature-desc" style="color: #9f1239;">Se limitan a emitir recibos pero no tocan el corazón de la escuela: los contenidos pedagógicos, las materias y el aprendizaje.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #ffe4e6; border-color: #fda4af; color: #e11d48;">✕</div>
            <div>
              <div class="feature-title" style="color: #881337;">Ignoran el agotamiento y la rotación de los maestros</div>
              <div class="feature-desc" style="color: #9f1239;">Los docentes siguen perdiendo sus fines de semana llenando formatos manuales de la SEP sin herramientas inteligentes.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #ffe4e6; border-color: #fda4af; color: #e11d48;">✕</div>
            <div>
              <div class="feature-title" style="color: #881337;">Cero motivación para el alumno en el aula</div>
              <div class="feature-desc" style="color: #9f1239;">Los estudiantes continúan con métodos pasivos y fotocopias aburridas; no existe una experiencia digital que despierte su pasión.</div>
            </div>
          </div>
        </div>

        <div class="card" style="border: 1.5px solid #86efac; background: #f0fdf4; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);">
          <div style="font-size: 13px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ★ El Enfoque Soberano ISkool: Pedagogía en el Centro
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">✓</div>
            <div>
              <div class="feature-title" style="color: #064e3b;">Bóveda Curricular Oficial (+1,500 Nodos SEP NEM & Cambridge)</div>
              <div class="feature-desc" style="color: #065f46;">Respaldamos a la planta docente con programas de estudio oficiales listos para aplicar desde preescolar hasta preparatoria.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">✓</div>
            <div>
              <div class="feature-title" style="color: #064e3b;">Planeaciones Analíticas de Alta Calidad en Segundos</div>
              <div class="feature-desc" style="color: #065f46;">Estructuración didáctica oficial (Inicio, Desarrollo y Cierre) con rúbricas analíticas oficiales que devuelven el tiempo libre al maestro.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">✓</div>
            <div>
              <div class="feature-title" style="color: #064e3b;">El Camino del Héroe: Alumnos Entusiasmados por Estudiar</div>
              <div class="feature-desc" style="color: #065f46;">17 nodos de actividades lúdicas y economía basada 100% en mérito académico para lograr retención escolar genuina.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • La Prioridad Pedagógica Institucional</div>
      <div class="slide-number">02 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 3: ARQUITECTURA EN 6 PILARES ACADÉMICOS Y DE VIDA ESCOLAR     -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Ecosistema 360°</span>
        </div>
      </div>
      <div class="header-pill">Arquitectura Pedagógica</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        La excelencia de tu colegio en <span class="gradient-text-emerald">6 Pilares Pedagógicos y de Vida Escolar</span>
      </h2>
      <p class="slide-subtitle">
        Diseñado integralmente para nutrir la relación entre profesores, alumnos y familias bajo una misma visión académica de vanguardia.
      </p>

      <div class="grid-bento">
        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box">📚</div>
            <div>
              <div class="feature-title">1. Bóveda Curricular Oficial</div>
              <div class="feature-desc">+1,500 nodos oficiales NEM 2024 (Fases 1 a 6) con PDAs textuales y marco bilingüe Cambridge internacional.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">⚡</div>
            <div>
              <div class="feature-title">2. Planeaciones en Segundos</div>
              <div class="feature-desc">Sesiones dosificadas con los 3 momentos didácticos oficiales (Inicio, Desarrollo y Cierre) y rúbricas analíticas formativas.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-blue">🧩</div>
            <div>
              <div class="feature-title">3. Estudio con 17 Nodos</div>
              <div class="feature-desc">Lienzo pedagógico interactivo: escape rooms, duelos contra jefes de saberes, secuencias cronológicas y simulador en vivo.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">🏆</div>
            <div>
              <div class="feature-title">4. Camino del Héroe (Alumnos)</div>
              <div class="feature-desc">Sendero de misiones y economía de mérito con gemas y XP ganadas 100% por entrega de tareas y estudio. Cero compras con dinero.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-purple">🩺</div>
            <div>
              <div class="feature-title">5. Expediente 360° Real</div>
              <div class="feature-desc">Ficha médica, alergias en primer plano, bitácora psicopedagógica, filiación y asistencias auditables ante la dirección.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">💬</div>
            <div>
              <div class="feature-title">6. Conexión Familiar WhatsApp</div>
              <div class="feature-desc">Avisos automáticos de asistencias, boletas oficiales y acceso en 1 toque por mensajería instantánea segura sin contraseñas.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Arquitectura Pedagógica Integral</div>
      <div class="slide-number">03 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 4: BÓVEDA CURRICULAR NEM 2024 & CAMBRIDGE EN PROFUNDIDAD      -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Pedagogía Oficial</span>
        </div>
      </div>
      <div class="header-pill">Rigor Curricular • Fases 1 a 6</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        La mayor fortaleza académica: <span class="gradient-text-emerald">NEM 2024 Oficial + Cambridge Internacional</span>
      </h2>
      <p class="slide-subtitle">
        Tu colegio cumple con el 100% de los estándares normativos de la SEP y al mismo tiempo eleva su propuesta bilingüe con competencias globales reconocidas en todo el mundo.
      </p>

      <div class="grid-2">
        <div class="card">
          <div style="font-size: 13px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🇲🇽 Nueva Escuela Mexicana (Fases 1 a 6)
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">4 Campos Formativos & 7 Ejes Articuladores</div>
              <div class="feature-desc">Lenguajes, Saberes y Pensamiento Científico, Ética, Naturaleza y Sociedades, y De lo Humano y lo Comunitario totalmente articulados.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">+1,500 Procesos de Desarrollo de Aprendizaje (PDA)</div>
              <div class="feature-desc">Textuales de los programas sintéticos oficiales de la SEP para evitar improvisaciones o discrepancias pedagógicas.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">Carpetas Listas para Supervisión e Inspección SEP</div>
              <div class="feature-desc">Cumplimiento cabal de normatividad ante visitas de inspectores de zona escolar sin tener que armar expedientes de última hora.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🇬🇧 Estándar Internacional Cambridge
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Ejes Bilingües English & Science</div>
              <div class="feature-desc">Marco de competencias internacionales de comprensión lectora, expresión escrita y razonamiento científico estructurado.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Evaluación por Rúbricas Analíticas Oficiales</div>
              <div class="feature-desc">Escalas de logro cualitativas y formativas que miden el progreso real del alumno en un segundo idioma.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Poderoso Diferenciador en Admisiones</div>
              <div class="feature-desc">El argumento de mayor peso pedagógico para que los padres de familia elijan tu colegio frente a otras opciones locales.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Bóveda Curricular Soberana</div>
      <div class="slide-number">04 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 5: PLANEACIONES ANALÍTICAS EN SEGUNDOS (CAPTURA REAL)         -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Docentes & Bóveda</span>
        </div>
      </div>
      <div class="header-pill">Portal Docente • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            Planeaciones analíticas completas <span class="gradient-text-emerald">creadas en segundos</span>
          </h2>
          <p class="slide-subtitle">
            Termina con la rotación de maestros y el agotamiento de fin de semana. El docente selecciona el tema o PDA y la Bóveda le entrega la sesión estructurada y lista para el aula.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box">⏱️</div>
            <div>
              <div class="feature-title">3 Momentos Didácticos con Cronómetro Oficial</div>
              <div class="feature-desc">Inicio (10 min de activación), Desarrollo (30 min de práctica e indagación) y Cierre (10 min de socialización y entregable tangible).</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">📊</div>
            <div>
              <div class="feature-title">Rúbrica Analítica Formativa Integrada</div>
              <div class="feature-desc">Criterios de evaluación cualitativa con 4 niveles de desempeño (Sobresaliente, Logrado, En Proceso y Requiere Apoyo).</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">📸</div>
            <div>
              <div class="feature-title">Soporte Multimodal: Foto del Libro de Texto</div>
              <div class="feature-desc">El profesor toma foto a la página del libro de la SEP y el motor curricular extrae el tema y genera la planeación alineada al PDA.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/teacher (Bóveda Curricular)</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgTeacherNem}" class="mockup-real-screen" alt="Captura Real de Planeación Docente NEM ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Planeador Curricular NEM 2024 con Bóveda Oficial</span>
            <span style="color: #047857; font-weight: 800;">PLANEACIONES EN SEGUNDOS</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Productividad Docente Extrema</div>
      <div class="slide-number">05 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 6: ESTUDIO DE ACTIVIDADES GAMIFICADAS (17 NODOS)             -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Gamificación</span>
        </div>
      </div>
      <div class="header-pill">Estudio de Actividades • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            Lienzo de Retos con <span class="gradient-text-emerald">17 Nodos Pedagógicos Interactivos</span>
          </h2>
          <p class="slide-subtitle">
            Diseña experiencias donde los alumnos aprenden jugando. El profesor arrastra y conecta bloques didácticos con validación instantánea y simulador en vivo.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box">🔐</div>
            <div>
              <div class="feature-title">Escape Room & Enigmas Secretos</div>
              <div class="feature-desc">Pistas deductivas y teclados alfanuméricos para desbloquear la siguiente etapa del aprendizaje curricular.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">⚔️</div>
            <div>
              <div class="feature-title">Combate de Saberes contra Jefes</div>
              <div class="feature-desc">Duelos de conocimiento contra personajes históricos o científicos con barras de vida (HP) y mecánicas lúdicas.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">⚡</div>
            <div>
              <div class="feature-title">Generador Rápido de 7 Bloques</div>
              <div class="feature-desc">Estructura secuencias completas para cualquier tema en segundos: diálogo, cronología, reactivos y cofre final.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/teacher/studio (Lienzo Digital)</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgStudio}" class="mockup-real-screen" alt="Captura Real del Estudio de Gamificación ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Lienzo de Flujos Pedagógicos por Nodos</span>
            <span style="color: #0d9488; font-weight: 800;">17 NODOS INTERACTIVOS</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Innovación Lúdica en el Aula</div>
      <div class="slide-number">06 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 7: PORTAL DEL ALUMNO · EL CAMINO DEL HÉROE                   -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Portal del Alumno</span>
        </div>
      </div>
      <div class="header-pill">Camino del Héroe • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            El Camino del Héroe: <span class="gradient-text-gold">Motivación y Retención Escolar</span>
          </h2>
          <p class="slide-subtitle">
            Los alumnos dejan de ver la escuela como una obligación pesada y la viven como una aventura de autosuperación donde cada tarea entregada suma valor a su perfil.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">🗺️</div>
            <div>
              <div class="feature-title">Sendero de Misiones Curriculares</div>
              <div class="feature-desc">Cada actividad del profesor aparece en el mapa del estudiante como una misión adaptada a su madurez escolar.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">💎</div>
            <div>
              <div class="feature-title">Economía 100% Basada en Mérito Real</div>
              <div class="feature-desc">Las recompensas no se compran con dinero de los padres. El estudiante gana su progreso con constancia y disciplina.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">📁</div>
            <div>
              <div class="feature-title">Portafolio Digital de Evidencias</div>
              <div class="feature-desc">Bitácora automática de trabajos, audios y proyectos consultable por profesores y padres de familia.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/student (Portal Alumno)</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgStudent}" class="mockup-real-screen" alt="Captura Real del Portal del Alumno ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Mapa de Misiones del Estudiante & Avatar</span>
            <span style="color: #b45309; font-weight: 800;">ECONOMÍA DE MÉRITO</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Retención e Impacto en el Alumnado</div>
      <div class="slide-number">07 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 8: CONTROL ESCOLAR & EXPEDIENTE 360° REAL                     -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Control Escolar</span>
        </div>
      </div>
      <div class="header-pill">Expediente 360° Real • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            Todo el historial del alumno en un <span class="gradient-text-emerald">Expediente 360° Digital</span>
          </h2>
          <p class="slide-subtitle">
            Seguridad institucional, historial clínico, bitácora de conducta y control de asistencia auditable en segundos ante cualquier necesidad directiva o médica.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box">🩺</div>
            <div>
              <div class="feature-title">Ficha Médica y Alergias en Primer Plano</div>
              <div class="feature-desc">Acceso instantáneo para enfermería y profesores a condiciones de salud, tipo de sangre y contactos de emergencia autorizados.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">📋</div>
            <div>
              <div class="feature-title">Bitácora Conductual y Asistencias Históricas</div>
              <div class="feature-desc">Registro formal de reportes de disciplina, justificación de faltas y bitácora de seguimiento psicopedagógico.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">🔒</div>
            <div>
              <div class="feature-title">Filiación Familiar y Estatus Integral</div>
              <div class="feature-desc">CURP, matrícula oficial, tutor responsable, teléfonos de contacto e historial escolar consolidado en un solo lugar.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/admin/expediente-360</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EXPEDIENTE 360° EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgExpediente360}" class="mockup-real-screen" alt="Captura Real del Expediente 360° de Estudiante ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Expediente 360° (Filiación, Salud, Asistencia y Datos Escolares)</span>
            <span style="color: #047857; font-weight: 800;">EXPEDIENTE 360° DEL ALUMNO</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Seguridad y Control del Alumnado</div>
      <div class="slide-number">08 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 9: COMUNICACIÓN FAMILIAR: WHATSAPP & MENSAJERÍA INSTANTÁNEA   -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Familias & Tutores</span>
        </div>
      </div>
      <div class="header-pill">Portal Familiar • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            Notificaciones por <span class="gradient-text-emerald">WhatsApp</span> y <span class="gradient-text-gold">Mensajería Instantánea Segura</span>
          </h2>
          <p class="slide-subtitle">
            Elimina los pretextos de "no me llegó el aviso" o contraseñas olvidadas. Los padres entran a su expediente familiar en un solo toque mediante mensajería instantánea.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">
              📱
            </div>
            <div>
              <div class="feature-title">Avisos Directos a WhatsApp</div>
              <div class="feature-desc">Notificaciones inmediatas cuando el alumno registra una falta, se publica una boleta o hay avisos urgentes de dirección.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">
              🔑
            </div>
            <div>
              <div class="feature-title">Acceso Directo por Mensajería Instantánea</div>
              <div class="feature-desc">El tutor pulsa el enlace seguro en su teléfono y entra directo a su panel familiar sin tener que recordar ni restablecer contraseñas.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <div class="feature-title">Visión Familiar Multi-Hijo</div>
              <div class="feature-desc">Alterna entre hermanos matriculados en diferentes grados con calificaciones, asistencias y avisos en una sola pantalla.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/parent (Portal de Familias)</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgParent}" class="mockup-real-screen" alt="Captura Real del Portal Familiar ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Panel de Tutores con Asistencias y Calificaciones</span>
            <span style="color: #059669; font-weight: 800;">WHATSAPP & MENSAJERÍA INSTANTÁNEA</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Retención y Fidelización de Familias</div>
      <div class="slide-number">09 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 10: SUPERVISIÓN Y COBERTURA CURRICULAR DIRECTIVA 360°          -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Dirección General</span>
        </div>
      </div>
      <div class="header-pill">Mando Ejecutivo • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            La cabina de control para la <span class="gradient-text-emerald">Supervisión Académica Directiva</span>
          </h2>
          <p class="slide-subtitle">
            Supervisa la cobertura de los programas oficiales de la SEP y la salud de cada grupo en tiempo real sin esperar a fin de mes ni perseguir reportes impresos.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box">📊</div>
            <div>
              <div class="feature-title">Auditoría de Cobertura Curricular en Tiempo Real</div>
              <div class="feature-desc">Verifica qué porcentaje de los PDAs oficiales de la SEP ha cubierto cada profesor y grupo con métricas consolidadas.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">🚨</div>
            <div>
              <div class="feature-title">Alertas Tempranas de Ausentismo y Rezago</div>
              <div class="feature-desc">Detecta a tiempo patrones de faltas reiteradas o bajas en calificaciones para intervenir antes de que se conviertan en deserción.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">📈</div>
            <div>
              <div class="feature-title">Reportes Ejecutivos para Consejos Técnicos</div>
              <div class="feature-desc">Tableros de control listos para juntas de consejo directivo, comités de socios fundadores e informes de acreditación.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/director (Mando Ejecutivo)</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgDirector}" class="mockup-real-screen" alt="Captura Real del Tablero Directivo ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Panel Ejecutivo con Grupos, Alumnos y Estatus Curricular</span>
            <span style="color: #047857; font-weight: 800;">SUPERVISIÓN 360°</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Gobierno Institucional Inteligente</div>
      <div class="slide-number">10 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 11: CULTURA ESCOLAR DE MÉRITO Y TIENDA REGULADA               -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Vida Escolar & Mérito</span>
        </div>
      </div>
      <div class="header-pill">Cultura Institucional Sana</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        Fortalece la identidad escolar con <span class="gradient-text-gold">Reconocimiento al Esfuerzo y Orden Escolar</span>
      </h2>
      <p class="slide-subtitle">
        Premia el mérito académico de tus alumnos y canaliza las actividades y eventos del colegio sin distracciones mercantiles ni efectivo en los salones de clase.
      </p>

      <div class="grid-2">
        <div class="card">
          <div style="font-size: 13px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🏆 Reconocimientos y Privilegios por Mérito Real
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">🪙</div>
            <div>
              <div class="feature-title">100% Ganado por Mérito Académico</div>
              <div class="feature-desc">Las monedas y gemas escolares NO se compran con dinero real. Solo se obtienen entregando tareas y superando retos formativos.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">📜</div>
            <div>
              <div class="feature-title">Canje de Privilegios Escolares Regulados</div>
              <div class="feature-desc">Pases de biblioteca, reconocimientos de honor en asamblea y distinciones autorizadas por los directores.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">🛡️</div>
            <div>
              <div class="feature-title">Formación de Hábitos y Disciplina Positiva</div>
              <div class="feature-desc">Diseñado bajo rigor pedagógico para motivar la constancia diaria de estudio sin generar desigualdades económicas.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 13px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🎟️ Eventos, Talleres y Cuotas Escolares sin Efectivo
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">🚌</div>
            <div>
              <div class="feature-title">Salidas Escolares y Actividades Extracurriculares</div>
              <div class="feature-desc">Registro y cobro transparente de visitas guiadas, eventos deportivos y festivales sin dinero en mano de maestros.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">👕</div>
            <div>
              <div class="feature-title">Uniformes y Materiales Escolares Oficiales</div>
              <div class="feature-desc">Catálogo institucional con tallas y existencias para que los padres adquieran materiales con certeza y claridad.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">📑</div>
            <div>
              <div class="feature-title">Trazabilidad Total para la Administración</div>
              <div class="feature-desc">Reportes consolidados de inventarios y cuotas especiales con auditoría clara para la dirección del colegio.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Cultura de Excelencia y Organización Escolar</div>
      <div class="slide-number">11 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 12: MÓDULO ADMINISTRATIVO Y FACTURACIÓN SAT CFDI 4.0 (AL FINAL)-->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Módulo Administrativo</span>
        </div>
      </div>
      <div class="header-pill">Opcional / Integrado • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <div style="display: inline-flex; align-items: center; gap: 8px; padding: 4px 12px; border-radius: 999px; background: #f1f5f9; border: 1px solid #cbd5e1; color: #475569; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ⚙️ Módulo Administrativo Complementario
          </div>

          <h2 class="slide-title">
            Gestión Administrativa y <span class="gradient-text-emerald">Facturación SAT CFDI 4.0</span>
          </h2>
          <p class="slide-subtitle">
            Para aquellos colegios que desean consolidar también su administración en una misma plataforma: cobranza ordenada de colegiaturas, estados de cuenta claros y timbrado fiscal con complemento educativo oficial (IEDU).
          </p>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">💳</div>
            <div>
              <div class="feature-title">Cobranza y Estados de Cuenta Claros</div>
              <div class="feature-desc">Los tutores consultan mensualidades pagadas y pendientes desde su teléfono celular con conciliación bancaria directa.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">🏛️</div>
            <div>
              <div class="feature-title">Timbrado CFDI 4.0 con Complemento IEDU Oficial</div>
              <div class="feature-desc">Incorpora automáticamente la CURP del alumno, nivel escolar y validez fiscal para la deducción anual de los padres ante el SAT.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">Totalmente Opcional e Independiente</div>
              <div class="feature-desc">Si tu colegio ya cuenta con un sistema contable o de cobranza externo, ISkool opera al 100% como suite pedagógica sin requerir migración financiera.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window-real">
          <div class="mockup-header-real">
            <div class="mockup-controls">
              <div class="mockup-dot" style="background: #ef4444;"></div>
              <div class="mockup-dot" style="background: #f59e0b;"></div>
              <div class="mockup-dot" style="background: #10b981;"></div>
              <span class="mockup-url-bar">https://colegio.iskool.app/admin (Finanzas & Facturación)</span>
            </div>
            <div class="mockup-live-indicator"><span class="live-dot"></span> EN VIVO</div>
          </div>
          <div class="mockup-img-container">
            <img src="${imgFinanzas}" class="mockup-real-screen" alt="Captura Real de Finanzas ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Panel de Finanzas & Conciliación Fiscal</span>
            <span style="color: #b45309; font-weight: 800;">SAT CFDI 4.0 IEDU</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Módulo Administrativo y Facturación Fiscal Opcional</div>
      <div class="slide-number">12 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 13: MATRIZ COMPARATIVA FRENTE A PLATAFORMAS TRADICIONALES      -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Comparativa de Valor</span>
        </div>
      </div>
      <div class="header-pill">Retorno Educativo</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        ¿Por qué un sistema tradicional de cobranza <span class="gradient-text-emerald">se queda corto</span> frente a ISkool?
      </h2>
      <p class="slide-subtitle">
        Los programas tradicionales solo actúan como terminales de cobro. ISkool transforma la enseñanza, motiva a los alumnos y brinda respaldo pedagógico de principio a fin.
      </p>

      <table class="comp-table">
        <thead>
          <tr>
            <th style="width: 28%;">Capacidad Institucional</th>
            <th style="width: 36%;">Software Tradicional de Cobranza</th>
            <th style="width: 36%; color: #047857; background: #ecfdf5; border-bottom: 2px solid #34d399;">ISkool Académico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Enfoque Central</strong></td>
            <td><span class="badge-cross">✕</span> Meramente administrativo y de cobro mensual</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Pedagogía en el Centro:</strong> Aula + Docente + Alumno + Familias</td>
          </tr>
          <tr>
            <td><strong>Currículo SEP & Cambridge</strong></td>
            <td><span class="badge-cross">✕</span> Nulo. No incorpora planes de estudio oficiales</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Bóveda Oficial (+1,500 Nodos NEM) + Cambridge bilingüe</strong></td>
          </tr>
          <tr>
            <td><strong>Planeaciones del Docente</strong></td>
            <td><span class="badge-cross">✕</span> Los maestros siguen llenando formatos a mano</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Generación instantánea con 3 momentos y rúbricas oficiales</strong></td>
          </tr>
          <tr>
            <td><strong>Gamificación e Interactividad</strong></td>
            <td><span class="badge-cross">✕</span> Inexistente; el alumno no tiene experiencia digital</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Estudio con 17 nodos interactivos y Camino del Héroe por mérito</strong></td>
          </tr>
          <tr>
            <td><strong>Comunicación Familiar</strong></td>
            <td><span class="badge-cross">✕</span> Portales con contraseñas que los padres olvidan</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>WhatsApp automático y Mensajería Instantánea en 1 toque</strong></td>
          </tr>
          <tr>
            <td><strong>Administración y Facturación</strong></td>
            <td><span class="badge-check">✓</span> Cobranza básica</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>SAT CFDI 4.0 IEDU integrado como módulo complementario</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Ventaja Competitiva y Retorno Educativo</div>
      <div class="slide-number">13 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 14: CIERRE EJECUTIVO & PRUEBA PILOTO PEDAGÓGICA               -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="glow-bottom-left"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Alianza Institucional</span>
        </div>
      </div>
      <div class="header-pill">Próximo Paso</div>
    </div>

    <div class="slide-body" style="align-items: center; text-align: center; max-width: 1000px; margin: 0 auto;">
      <div class="header-pill" style="margin-bottom: 16px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857;">
        ★ Garantía de Despliegue en 48 Horas
      </div>

      <h1 class="hero-title" style="font-size: 50px;">
        Comprueba el poder de ISkool con una <span class="gradient-text-emerald">Prueba Piloto Pedagógica</span>
      </h1>

      <p class="slide-subtitle" style="font-size: 18px; max-width: 820px; margin-bottom: 28px;">
        Configuramos un grupo muestra de tu institución para que tus maestros generen planeaciones en segundos, tus alumnos vivan el Camino del Héroe y tu dirección compruebe la auditoría curricular en tiempo real.
      </p>

      <div class="grid-3" style="width: 100%; margin-bottom: 30px; text-align: left;">
        <div class="card" style="border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
          <div class="feature-title" style="font-size: 16px;">Configuración en 48 Horas</div>
          <div class="feature-desc">Carga de materias y grupos de prueba sin interrumpir las clases ni alterar los sistemas actuales del colegio.</div>
        </div>

        <div class="card" style="border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
          <div class="feature-title" style="font-size: 16px;">Acompañamiento Pedagógico</div>
          <div class="feature-desc">Talleres prácticos inmediatos para profesores en la Bóveda Curricular y manejo del estudio de retos.</div>
        </div>

        <div class="card" style="border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
          <div class="feature-title" style="font-size: 16px;">Cero Riesgo Institucional</div>
          <div class="feature-desc">Comprueba los resultados con tus propios maestros y alumnos antes de tomar cualquier decisión de adopción global.</div>
        </div>
      </div>

      <div class="gold-button" style="font-size: 16px; padding: 15px 36px; cursor: pointer;">
        📅 Agendar Prueba Piloto Pedagógica para tu Colegio
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Todos los derechos reservados © 2026</div>
      <div class="slide-number">14 / 14</div>
    </div>
  </div>

</body>
</html>`;

const htmlFilePath = path.join(__dirname, 'presentacion_ejecutiva_iskool.html');
const pdfFilePath = path.join(__dirname, 'PRESENTACION_EJECUTIVA_ISKOOL.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');
console.log('HTML con capturas reales y tema claro generado en:', htmlFilePath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExecutable = fs.existsSync(edgePath) ? edgePath : chromePath;

const command = `"${browserExecutable}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;

try {
  console.log('Generando PDF mediante:', browserExecutable);
  execSync(command);
  const stats = fs.statSync(pdfFilePath);
  console.log('✓ PDF con Prioridad Académica y Tema Claro generado exitosamente!');
  console.log('Ruta:', pdfFilePath);
  console.log('Tamaño:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
} catch (err) {
  console.error('Error al generar PDF:', err);
}
