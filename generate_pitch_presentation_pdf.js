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
const imgStudio = getBase64Image('screen_studio_canvas.png');
const imgStudent = getBase64Image('screen_student_hero.png');
const imgParent = getBase64Image('screen_parent_portal.png');

console.log('Imágenes base64 cargadas:');
console.log('- Finanzas:', imgFinanzas ? 'OK' : 'FALTA');
console.log('- Expediente 360°:', imgExpediente360 ? 'OK' : 'FALTA');
console.log('- Director:', imgDirector ? 'OK' : 'FALTA');
console.log('- Docente:', imgTeacher ? 'OK' : 'FALTA');
console.log('- Estudio:', imgStudio ? 'OK' : 'FALTA');
console.log('- Alumno:', imgStudent ? 'OK' : 'FALTA');
console.log('- Padre:', imgParent ? 'OK' : 'FALTA');

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

    /* Ambient Glows */
    .glow-top-right {
      position: absolute;
      top: -120px;
      right: -120px;
      width: 550px;
      height: 550px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.09);
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
      background: rgba(14, 165, 233, 0.08);
      filter: blur(120px);
      pointer-events: none;
    }

    /* Subtle grid background */
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(15, 23, 42, 0.035) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(15, 23, 42, 0.035) 1px, transparent 1px);
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
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      color: #ffffff;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.35);
    }

    .brand-text {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #0f172a;
    }

    .brand-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #0d9488;
      margin-left: 8px;
    }

    .header-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 5px 15px;
      border-radius: 999px;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      color: #047857;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);
    }

    /* Main Body Area */
    .slide-body {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.2in 0;
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
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      color: #059669;
      font-weight: 800;
    }

    /* Typography */
    h1.hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 50px;
      font-weight: 900;
      line-height: 1.1;
      letter-spacing: -0.03em;
      color: #0f172a;
      margin: 0 0 14px 0;
    }

    h2.slide-title {
      font-family: 'Outfit', sans-serif;
      font-size: 36px;
      font-weight: 800;
      line-height: 1.18;
      letter-spacing: -0.02em;
      color: #0f172a;
      margin: 0 0 8px 0;
    }

    p.slide-subtitle {
      font-size: 15.5px;
      line-height: 1.48;
      color: #475569;
      margin: 0 0 20px 0;
      max-width: 1000px;
      font-weight: 400;
    }

    .gradient-text-emerald {
      background: linear-gradient(135deg, #059669 0%, #0d9488 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .gradient-text-gold {
      background: linear-gradient(135deg, #d97706 0%, #ea580c 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Cards & Containers */
    .card {
      background: #ffffff;
      border: 1px solid #e2e8f0;
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
      box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
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
      font-size: 12.5px;
    }

    .comp-table th {
      background: #f8fafc;
      padding: 12px 16px;
      text-align: left;
      font-family: 'Outfit', sans-serif;
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
      border-bottom: 2px solid #cbd5e1;
    }

    .comp-table td {
      padding: 11px 16px;
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
  <!-- SLIDE 1: PORTADA INSTITUCIONAL                                      -->
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
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 999px; background: #fef3c7; border: 1px solid #fde68a; color: #b45309; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 6px rgba(245, 158, 11, 0.1);">
        ★ Presentación Exclusiva para Dueños de Colegios y Directores Generales
      </div>

      <h1 class="hero-title" style="font-size: 56px;">
        El Sistema Operativo Escolar que <span class="gradient-text-emerald">Automatiza tu Gestión</span> y <span class="gradient-text-gold">Transforma el Aula</span>
      </h1>

      <p class="slide-subtitle" style="font-size: 19px; max-width: 880px; margin-bottom: 30px;">
        La suite institucional que unifica el control administrativo-financiero con la pedagogía oficial de la SEP, el estándar internacional Cambridge y gamificación inmersiva en una sola plataforma soberana.
      </p>

      <div class="grid-4" style="width: 100%; max-width: 980px;">
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Bóveda Curricular</span>
          <span class="metric-value">NEM Fases 1 a 6 + Cambridge</span>
        </div>
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Velocidad Docente</span>
          <span class="metric-value">Planeación en Segundos</span>
        </div>
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Familias Conectadas</span>
          <span class="metric-value">WhatsApp & Mensajería Instantánea</span>
        </div>
        <div class="metric-pill" style="text-align: left;">
          <span class="metric-label">Blindaje Fiscal</span>
          <span class="metric-value">SAT CFDI 4.0 Complemento IEDU</span>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Confidencial • Preparado para Consejos Directivos</div>
      <div class="slide-number">01 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 2: LA TESIS DE VALOR DIRECTIVA                                -->
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
        Gestionar la cobranza no es suficiente. <span class="gradient-text-emerald">Debes ganar la batalla del aula.</span>
      </h2>
      <p class="slide-subtitle">
        Los colegios privados pierden familias y dinero por dos frentes: el agotamiento burocrático de sus maestros y la apatía de los alumnos frente a métodos tradicionales.
      </p>

      <div class="grid-2">
        <div class="card" style="border: 1.5px solid #fecdd3; background: #fff1f2; box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.07);">
          <div style="font-size: 13.5px; font-weight: 800; color: #e11d48; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ⚠️ Lo que ofrecen los sistemas de cobranza tradicionales
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #ffe4e6; border-color: #fda4af; color: #e11d48;">✕</div>
            <div>
              <div class="feature-title" style="color: #881337;">Solo tocan la parte administrativa</div>
              <div class="feature-desc" style="color: #9f1239;">Cobran mensualidades pero dejan a los maestros solos frente a la abrumadora carga de planeaciones de la SEP.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #ffe4e6; border-color: #fda4af; color: #e11d48;">✕</div>
            <div>
              <div class="feature-title" style="color: #881337;">Cero impacto en el aula y en los alumnos</div>
              <div class="feature-desc" style="color: #9f1239;">El estudiante ni siquiera tiene una experiencia digital motivante; sigue resolviendo copias en papel aburridas.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #ffe4e6; border-color: #fda4af; color: #e11d48;">✕</div>
            <div>
              <div class="feature-title" style="color: #881337;">Contraseñas engorrosas para los padres</div>
              <div class="feature-desc" style="color: #9f1239;">Los tutores olvidan sus accesos y saturan la recepción del colegio pidiendo circulares y boletas.</div>
            </div>
          </div>
        </div>

        <div class="card" style="border: 1.5px solid #86efac; background: #f0fdf4; box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);">
          <div style="font-size: 13.5px; font-weight: 800; color: #059669; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ★ La Solución Soberana ISkool
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">✓</div>
            <div>
              <div class="feature-title" style="color: #064e3b;">Ecosistema Dual: Finanzas + Excelencia Pedagógica</div>
              <div class="feature-desc" style="color: #065f46;">Cobranza y SAT CFDI 4.0 conviven con la Bóveda Curricular SEP y Cambridge para ahorrar horas semanales a cada docente.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">✓</div>
            <div>
              <div class="feature-title" style="color: #064e3b;">Gamificación con 17 Nodos Interactivos</div>
              <div class="feature-desc" style="color: #065f46;">Escape rooms, retos cronológicos y duelos de saberes donde los alumnos estudian motivados por mérito escolar real.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">✓</div>
            <div>
              <div class="feature-title" style="color: #064e3b;">WhatsApp y Mensajería Instantánea en 1 Toque</div>
              <div class="feature-desc" style="color: #065f46;">Avisos de asistencia y calificaciones directos al celular del padre mediante mensajería instantánea segura sin contraseñas.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Diagnóstico de Valor para el Colegio</div>
      <div class="slide-number">02 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 3: EL ECOSISTEMA EN 6 PILARES (BENTO GRID)                    -->
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
      <div class="header-pill">Arquitectura Integral</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        Toda la vida de tu colegio en <span class="gradient-text-emerald">6 Pilares Comprobables</span>
      </h2>
      <p class="slide-subtitle">
        Elimina la dispersión de tener múltiples suscripciones aisladas. ISkool integra todas las áreas críticas de tu institución.
      </p>

      <div class="grid-bento">
        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">💳</div>
            <div>
              <div class="feature-title">Finanzas & SAT CFDI 4.0</div>
              <div class="feature-desc">Conciliación de colegiaturas, estados de cuenta familiares y timbrado fiscal con complemento educativo oficial (IEDU).</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box">📚</div>
            <div>
              <div class="feature-title">Bóveda Curricular & Cambridge</div>
              <div class="feature-desc">+1,500 nodos oficiales NEM 2024 (Fases 1-6) y currículo bilingüe Cambridge con planeaciones generadas en segundos.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #dcfce7; border-color: #86efac; color: #059669;">💬</div>
            <div>
              <div class="feature-title">WhatsApp & Mensajería Instantánea</div>
              <div class="feature-desc">Notificaciones inmediatas de faltas, boletas y avisos al WhatsApp de los padres, con acceso instantáneo sin contraseñas.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #e0f2fe; border-color: #bae6fd; color: #0284c7;">🧩</div>
            <div>
              <div class="feature-title">Estudio de Retos Gamificados</div>
              <div class="feature-desc">Lienzo digital con 17 nodos pedagógicos: escape rooms, duelos contra jefes, cronología y simulador en tiempo real.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">🏆</div>
            <div>
              <div class="feature-title">Camino del Héroe (Alumnos)</div>
              <div class="feature-desc">Sendero de misiones y economía de mérito con gemas y XP ganadas 100% por estudio. Cero compras con dinero real.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box" style="background: #f3e8ff; border-color: #e9d5ff; color: #7e22ce;">🏛️</div>
            <div>
              <div class="feature-title">Control Escolar 360°</div>
              <div class="feature-desc">Expediente completo del alumno: datos de filiación, salud y alergias, adeudo, asistencias y reportes formativos.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Arquitectura Soberana</div>
      <div class="slide-number">03 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 4: FINANZAS & SAT CFDI 4.0 (CON CAPTURA REAL)                -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Finanzas & Cobranza</span>
        </div>
      </div>
      <div class="header-pill">Portal de Administración • Captura en Vivo</div>
    </div>

    <div class="slide-body">
      <div class="grid-2" style="align-items: center;">
        <div>
          <h2 class="slide-title">
            Cobranza automatizada. <span class="gradient-text-emerald">Facturación SAT CFDI 4.0</span> sin errores.
          </h2>
          <p class="slide-subtitle">
            Recupera el control de tu flujo de caja escolar y elimina las tareas repetitivas de conciliación y timbrado de facturas a mano cada fin de mes.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Estados de cuenta claros por familia</div>
              <div class="feature-desc">Los padres consultan colegiaturas pagadas y pendientes desde su celular con comprobantes digitales instantáneos.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Timbrado CFDI 4.0 con Complemento IEDU</div>
              <div class="feature-desc">Cumple al 100% con los requerimientos del SAT incorporando CURP del alumno, nivel escolar y validez fiscal oficial.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Conciliación bancaria en tiempo real</div>
              <div class="feature-desc">Control inmediato de ingresos por transferencias, ventanilla o pagos en línea sin descuadres en caja.</div>
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
      <div>ISkool Académico • Soberanía Financiera Escolar</div>
      <div class="slide-number">04 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 5: TIENDA ESCOLAR & ECONOMÍA DE MÉRITO                        -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Tienda & Mérito</span>
        </div>
      </div>
      <div class="header-pill">Economía Escolar Sana</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        Centraliza tus ventas escolares y <span class="gradient-text-gold">premia el mérito académico</span>
      </h2>
      <p class="slide-subtitle">
        Una doble vertiente: canaliza la venta de uniformes y materiales oficiales, mientras impulsas una cultura escolar donde el esfuerzo académico se traduce en reconocimiento real.
      </p>

      <div class="grid-2">
        <div class="card">
          <div style="font-size: 13.5px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🛒 Tienda Escolar en Línea para Familias
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">👕</div>
            <div>
              <div class="feature-title">Venta de Uniformes y Paquetes de Libros</div>
              <div class="feature-desc">Catálogo digital con tallas, inventario y reglas de compra directa para los padres de familia desde su portal.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">🎟️</div>
            <div>
              <div class="feature-title">Eventos, Talleres y Cuotas Especiales</div>
              <div class="feature-desc">Registro y cobro de salidas escolares, actividades extracurriculares y festivales sin efectivo en las aulas.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">💳</div>
            <div>
              <div class="feature-title">Control y Auditoría de Inventarios</div>
              <div class="feature-desc">Seguimiento de existencias y reportes consolidados de ingresos adicionales para la administración del colegio.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 13.5px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🏆 Tienda Mágica de Reconocimiento al Alumno
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">🪙</div>
            <div>
              <div class="feature-title">100% Ganado por Mérito Académico</div>
              <div class="feature-desc">Las monedas y gemas escolares NO se compran con dinero real. Solo se obtienen entregando tareas y resolviendo retos.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">📜</div>
            <div>
              <div class="feature-title">Canje de Privilegios Escolares Regulados</div>
              <div class="feature-desc">Pases de biblioteca, reconocimientos de honor en asamblea y artefactos digitales autorizados por los directores.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">🛡️</div>
            <div>
              <div class="feature-title">Cero Vicios Consumistas</div>
              <div class="feature-desc">Diseñado bajo rigor pedagógico para motivar la constancia y el hábito diario de estudio sin generar desigualdades.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Cultura de Excelencia y Flujo de Ingresos</div>
      <div class="slide-number">05 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 6: CONTROL ESCOLAR & EXPEDIENTES 360° (EXPEDIENTE REAL 360°) -->
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
              <div class="feature-title">Estado de Cuenta y Filiación Familiar</div>
              <div class="feature-desc">CURP, matrícula oficial, tutor responsable, teléfonos de contacto y desglose de recibos pendientes y pagados.</div>
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
            <span>● Pantalla real de ISkool: Expediente 360° (Filiación, Salud, Asistencia y Cobranza)</span>
            <span style="color: #047857; font-weight: 800;">EXPEDIENTE 360° DEL ALUMNO</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Seguridad y Control del Alumnado</div>
      <div class="slide-number">06 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 7: COMUNICACIÓN FAMILIAR: WHATSAPP & MENSAJERÍA INSTANTÁNEA   -->
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
              <div class="feature-desc">Alterna entre hermanos matriculados en diferentes grados con calificaciones, asistencias y pagos en una sola pantalla.</div>
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
      <div class="slide-number">07 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 8: BÓVEDA CURRICULAR OFICIAL (NEM 2024 & CAMBRIDGE)           -->
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
      <div class="header-pill">Rigor Curricular</div>
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
          <div style="font-size: 13.5px; font-weight: 800; color: #047857; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🇲🇽 Nueva Escuela Mexicana (Fases 1 a 6)
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">+1,500 Nodos Curriculares Oficiales</div>
              <div class="feature-desc">Campos Formativos (Lenguajes, Saberes, Ética y De lo Humano) y Procesos de Desarrollo de Aprendizaje (PDA) textuales.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">Boleta Formativa SEP Automática</div>
              <div class="feature-desc">Ponderación oficial y descriptores formativos calculados en tiempo real sin cálculos manuales en hojas de cálculo.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">Auditoría de Zona Escolar Lista</div>
              <div class="feature-desc">Respuestas inmediatas ante supervisiones e inspecciones de zona sin tener que reunir papeles a última hora.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div style="font-size: 13.5px; font-weight: 800; color: #b45309; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            🇬🇧 Estándar Internacional Cambridge
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Ejes Bilingües English & Science</div>
              <div class="feature-desc">Marco de competencias internacionales de comprensión lectora, expresión escrita y razonamiento científico.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Evaluación por Rúbricas Analíticas</div>
              <div class="feature-desc">Escalas de logro cuantitativas y cualitativas que miden el progreso real del alumno en un segundo idioma.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">✓</div>
            <div>
              <div class="feature-title">Diferenciador en Admisiones</div>
              <div class="feature-desc">El argumento decisivo para que los padres elijan tu colegio frente a opciones tradicionales de la zona.</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Bóveda Curricular Soberana</div>
      <div class="slide-number">08 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 9: PLANEACIONES ANALÍTICAS EN SEGUNDOS (CAPTURA REAL)         -->
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
            <div class="feature-icon-box">⚡</div>
            <div>
              <div class="feature-title">3 Momentos Didácticos Oficiales</div>
              <div class="feature-desc">Inicio (activación de saberes previos), Desarrollo (indagación y práctica guiada) y Cierre (socialización y entregable tangible).</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">📊</div>
            <div>
              <div class="feature-title">Rúbrica Analítica Oficial Incorporada</div>
              <div class="feature-desc">Criterios de evaluación formativa alineados con el programa oficial de la SEP para calificar con total transparencia.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">🖨️</div>
            <div>
              <div class="feature-title">Exportación y Respaldo Institucional</div>
              <div class="feature-desc">Descarga en PDF institucional con sellos del colegio o consulta directa desde la Bóveda del docente.</div>
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
            <img src="${imgTeacher}" class="mockup-real-screen" alt="Captura Real del Portal Docente ISkool" />
          </div>
          <div class="mockup-footer-badge">
            <span>● Pantalla real de ISkool: Panel del Maestro con Bóveda Curricular SEP</span>
            <span style="color: #047857; font-weight: 800;">PLANEACIONES EN SEGUNDOS</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Productividad Docente Extrema</div>
      <div class="slide-number">09 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 10: ESTUDIO DE ACTIVIDADES GAMIFICADAS (CAPTURA REAL)         -->
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
      <div class="slide-number">10 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 11: PORTAL DEL ALUMNO (CAPTURA REAL)                          -->
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
      <div class="slide-number">11 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 12: SUPERVISIÓN DIRECTIVA 360° (CAPTURA REAL)                 -->
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
            La cabina de control para la <span class="gradient-text-emerald">Dirección Escolar 360°</span>
          </h2>
          <p class="slide-subtitle">
            Supervisa la salud académica y operativa de todo tu plantel en tiempo real sin esperar a fin de mes ni perseguir a los maestros por reportes impresos.
          </p>

          <div class="feature-item">
            <div class="feature-icon-box">📊</div>
            <div>
              <div class="feature-title">Auditoría Curricular en Tiempo Real</div>
              <div class="feature-desc">Verifica qué porcentaje de los PDAs oficiales de la SEP ha cubierto cada profesor y grupo con métricas consolidadas.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box">🚨</div>
            <div>
              <div class="feature-title">Alertas Tempranas de Ausentismo</div>
              <div class="feature-desc">Detecta a tiempo patrones de faltas reiteradas o bajas en calificaciones para intervenir antes de que se conviertan en deserción.</div>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon-box feature-icon-gold">📈</div>
            <div>
              <div class="feature-title">Toma de Decisiones Informada</div>
              <div class="feature-desc">Reportes ejecutivos listos para juntas de consejo directivo, comités de socios fundadores y reuniones estratégicas.</div>
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
            <span>● Pantalla real de ISkool: Panel Ejecutivo con Grupos, Alumnos y Estatus</span>
            <span style="color: #047857; font-weight: 800;">SUPERVISIÓN 360°</span>
          </div>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Gobierno Institucional Inteligente</div>
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
      <div class="header-pill">Retorno de Inversión</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        ¿Por qué ISkool es <span class="gradient-text-emerald">muy superior</span> a un software de cobranza tradicional?
      </h2>
      <p class="slide-subtitle">
        Las soluciones convencionales solo resuelven la caja registradora. ISkool blinda los ingresos y al mismo tiempo eleva el valor académico de tu institución.
      </p>

      <table class="comp-table">
        <thead>
          <tr>
            <th style="width: 32%;">Capacidad Institucional</th>
            <th style="width: 34%;">Plataforma Tradicional de Cobranza</th>
            <th style="width: 34%; color: #047857; background: #ecfdf5; border-bottom: 2px solid #34d399;">ISkool Académico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Alcance de la Plataforma</strong></td>
            <td><span class="badge-cross">✕</span> Solo administración financiera y cobranza</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Ecosistema 360°:</strong> Aula + Docentes + Alumnos + Familias + Finanzas</td>
          </tr>
          <tr>
            <td><strong>Currículo Oficial SEP y Cambridge</strong></td>
            <td><span class="badge-cross">✕</span> Nula. No integra el programa educativo</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Bóveda Oficial (+1,500 Nodos NEM) + Cambridge bilingüe</strong></td>
          </tr>
          <tr>
            <td><strong>Planeaciones del Docente</strong></td>
            <td><span class="badge-cross">✕</span> El maestro sigue haciendo formatos a mano</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Generación instantánea en segundos con rúbrica oficial</strong></td>
          </tr>
          <tr>
            <td><strong>Gamificación e Interactividad</strong></td>
            <td><span class="badge-cross">✕</span> Inexistente; el alumno no tiene portal</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>Estudio con 17 nodos y Camino del Héroe por mérito</strong></td>
          </tr>
          <tr>
            <td><strong>Comunicación Familiar</strong></td>
            <td><span class="badge-cross">✕</span> Contraseñas complejas que los padres olvidan</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>WhatsApp automático y Mensajería Instantánea sin contraseñas</strong></td>
          </tr>
          <tr>
            <td><strong>Facturación Electrónica Fiscal</strong></td>
            <td><span class="badge-check">✓</span> Facturación básica</td>
            <td style="background: #f0fdf4; color: #064e3b;"><span class="badge-check">✓</span> <strong>SAT CFDI 4.0 con complemento educativo oficial (IEDU)</strong></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Ventaja Competitiva Real</div>
      <div class="slide-number">13 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 14: CIERRE EJECUTIVO & PRUEBA PILOTO                          -->
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
        Comprueba el poder de ISkool con una <span class="gradient-text-emerald">Prueba Piloto en tu Colegio</span>
      </h1>

      <p class="slide-subtitle" style="font-size: 18px; max-width: 820px; margin-bottom: 28px;">
        Configuramos un grupo muestra de tu institución para que tus maestros generen planeaciones en segundos, tus padres reciban avisos por WhatsApp y tus directivos comprueben el blindaje operativo.
      </p>

      <div class="grid-3" style="width: 100%; margin-bottom: 30px; text-align: left;">
        <div class="card" style="border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
          <div class="feature-title" style="font-size: 16px;">Configuración en 48 Horas</div>
          <div class="feature-desc">Nuestro equipo técnico carga tus materias y grupos sin interrumpir las clases del colegio.</div>
        </div>

        <div class="card" style="border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          <div style="font-size: 24px; margin-bottom: 8px;">👥</div>
          <div class="feature-title" style="font-size: 16px;">Capacitación Llave en Mano</div>
          <div class="feature-desc">Talleres prácticos inmediatos para maestros, directivos y personal de control escolar.</div>
        </div>

        <div class="card" style="border: 1.5px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.05);">
          <div style="font-size: 24px; margin-bottom: 8px;">🛡️</div>
          <div class="feature-title" style="font-size: 16px;">Cero Riesgo Institucional</div>
          <div class="feature-desc">Acompañamiento dedicado permanente con soporte técnico y pedagógico prioritario.</div>
        </div>
      </div>

      <div class="gold-button" style="font-size: 16px; padding: 15px 36px; cursor: pointer;">
        📅 Agendar Prueba Piloto para tu Colegio
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
  console.log('✓ PDF con Tema Claro impactante generado exitosamente!');
  console.log('Ruta:', pdfFilePath);
  console.log('Tamaño:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
} catch (err) {
  console.error('Error al generar PDF:', err);
}
