const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ISkool Académico - Presentación Ejecutiva para Dueños de Colegios</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');

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
      color: #f1f5f9;
      background: #020617;
      -webkit-font-smoothing: antialiased;
    }

    .slide {
      width: 16in;
      height: 9in;
      position: relative;
      overflow: hidden;
      padding: 0.65in 0.85in;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-after: always;
      background: radial-gradient(circle at 50% -20%, #0f172a 0%, #020617 60%, #082f49 110%);
    }

    /* Ambient Glows */
    .glow-top-right {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.12);
      filter: blur(120px);
      pointer-events: none;
    }

    .glow-bottom-left {
      position: absolute;
      bottom: -100px;
      left: -100px;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: rgba(45, 212, 191, 0.1);
      filter: blur(120px);
      pointer-events: none;
    }

    /* Subtle grid background */
    .grid-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 60px 60px;
      mask-image: radial-gradient(ellipse 70% 60% at 50% 50%, #000 60%, transparent 100%);
      pointer-events: none;
    }

    /* Header */
    .slide-header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.15in;
      border-bottom: 1px solid rgba(16, 185, 129, 0.25);
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
      background: linear-gradient(135deg, #10b981 0%, #0d9488 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: 900;
      color: #020617;
      box-shadow: 0 0 20px rgba(16, 185, 129, 0.4);
    }

    .brand-text {
      font-family: 'Outfit', sans-serif;
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #ffffff;
    }

    .brand-tag {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #2dd4bf;
      margin-left: 8px;
    }

    .header-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.35);
      color: #6ee7b7;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      font-family: 'JetBrains Mono', monospace;
    }

    /* Main Body Area */
    .slide-body {
      position: relative;
      z-index: 10;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 0.25in 0;
    }

    /* Footer */
    .slide-footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 0.15in;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 11px;
      color: #64748b;
      font-weight: 600;
    }

    .footer-highlight {
      color: #fbbf24;
      font-weight: 700;
    }

    .slide-number {
      font-family: 'JetBrains Mono', monospace;
      color: #10b981;
      font-weight: 700;
    }

    /* Typography */
    h1.hero-title {
      font-family: 'Outfit', sans-serif;
      font-size: 52px;
      font-weight: 900;
      line-height: 1.08;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0 0 16px 0;
    }

    h2.slide-title {
      font-family: 'Outfit', sans-serif;
      font-size: 40px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0 0 10px 0;
    }

    p.slide-subtitle {
      font-size: 17px;
      line-height: 1.5;
      color: #94a3b8;
      margin: 0 0 24px 0;
      max-width: 1000px;
      font-weight: 400;
    }

    .gradient-text-emerald {
      background: linear-gradient(135deg, #ffffff 30%, #34d399 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .gradient-text-gold {
      background: linear-gradient(135deg, #fef08a 0%, #f59e0b 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* Cards & Containers */
    .card {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 0 20px -5px rgba(16, 185, 129, 0.1);
    }

    .card-teal {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(45, 212, 191, 0.25);
      border-radius: 18px;
      padding: 22px;
      box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.6), 0 0 20px -5px rgba(45, 212, 191, 0.1);
    }

    .gold-button {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 12px 28px;
      border-radius: 14px;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #020617;
      font-weight: 900;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 1px solid #fbbf24;
      box-shadow: 0 0 30px rgba(245, 158, 11, 0.4);
    }

    /* Layout Grids */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 28px;
    }

    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 24px;
    }

    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 18px;
    }

    .grid-bento {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
    }

    /* Feature Item inside Card */
    .feature-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      margin-bottom: 14px;
    }

    .feature-item:last-child {
      margin-bottom: 0;
    }

    .feature-icon-box {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      color: #34d399;
      flex-shrink: 0;
    }

    .feature-icon-gold {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.35);
      color: #fbbf24;
    }

    .feature-title {
      font-size: 15px;
      font-weight: 700;
      color: #ffffff;
      margin-bottom: 3px;
    }

    .feature-desc {
      font-size: 12.5px;
      line-height: 1.45;
      color: #94a3b8;
    }

    /* Metric Box */
    .metric-pill {
      background: rgba(2, 6, 23, 0.8);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 12px;
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .metric-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #2dd4bf;
      font-weight: 700;
    }

    .metric-value {
      font-size: 16px;
      font-weight: 800;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
    }

    /* Table styles */
    .comp-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid rgba(16, 185, 129, 0.3);
      background: rgba(15, 23, 42, 0.8);
      font-size: 13px;
    }

    .comp-table th {
      background: rgba(2, 6, 23, 0.95);
      padding: 14px 18px;
      text-align: left;
      font-family: 'Outfit', sans-serif;
      font-size: 14px;
      font-weight: 800;
      color: #2dd4bf;
      border-bottom: 1px solid rgba(16, 185, 129, 0.25);
    }

    .comp-table td {
      padding: 13px 18px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      color: #cbd5e1;
    }

    .comp-table tr:last-child td {
      border-bottom: none;
    }

    .badge-check {
      display: inline-block;
      color: #10b981;
      font-weight: 800;
      margin-right: 6px;
    }

    .badge-cross {
      display: inline-block;
      color: #f43f5e;
      font-weight: 800;
      margin-right: 6px;
    }

    /* Mockup Frame */
    .mockup-window {
      background: #090d16;
      border: 1px solid rgba(45, 212, 191, 0.3);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.7), 0 0 25px rgba(45, 212, 191, 0.15);
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .mockup-header {
      background: #0f172a;
      padding: 10px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .mockup-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
    }

    .mockup-content {
      padding: 18px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .mockup-tag {
      display: inline-block;
      padding: 4px 10px;
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
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
      <div style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 999px; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35); color: #fbbf24; font-size: 12px; font-weight: 800; text-transform: uppercase; margin-bottom: 20px; font-family: 'JetBrains Mono', monospace;">
        ★ Presentación Exclusiva para Dueños de Colegios y Directores Generales
      </div>

      <h1 class="hero-title" style="font-size: 58px;">
        El Sistema Operativo Escolar que <span class="gradient-text-emerald">Automatiza tu Gestión</span> y <span class="gradient-text-gold">Transforma el Aula</span>
      </h1>

      <p class="slide-subtitle" style="font-size: 20px; max-width: 850px; margin-bottom: 35px;">
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
          <span class="metric-value">WhatsApp + Magic Link</span>
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
        <div class="card" style="border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.04);">
          <div style="font-size: 14px; font-weight: 800; color: #fb7185; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ⚠️ Lo que ofrecen los sistemas de cobranza tradicionales
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: rgba(244, 63, 94, 0.15); border-color: rgba(244, 63, 94, 0.3); color: #fb7185;">✕</div>
            <div>
              <div class="feature-title">Solo tocan la parte administrativa</div>
              <div class="feature-desc">Cobran mensualidades pero dejan a los maestros solos frente a la abrumadora carga de planeaciones de la SEP.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: rgba(244, 63, 94, 0.15); border-color: rgba(244, 63, 94, 0.3); color: #fb7185;">✕</div>
            <div>
              <div class="feature-title">Cero impacto en el aula y en los alumnos</div>
              <div class="feature-desc">El estudiante ni siquiera tiene una experiencia digital motivante; sigue resolviendo copias en papel aburridas.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box" style="background: rgba(244, 63, 94, 0.15); border-color: rgba(244, 63, 94, 0.3); color: #fb7185;">✕</div>
            <div>
              <div class="feature-title">Contraseñas engorrosas para los padres</div>
              <div class="feature-desc">Los tutores olvidan sus accesos y saturan la recepción del colegio pidiendo circulares y boletas.</div>
            </div>
          </div>
        </div>

        <div class="card" style="border-color: rgba(16, 185, 129, 0.4); background: rgba(16, 185, 129, 0.05);">
          <div style="font-size: 14px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
            ★ La Solución Soberana ISkool
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">Ecosistema Dual: Finanzas + Excelencia Pedagógica</div>
              <div class="feature-desc">Cobranza y SAT CFDI 4.0 conviven con la Bóveda Curricular SEP y Cambridge para ahorrar 14 horas semanales a cada docente.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">Gamificación con 17 Nodos Interactivos</div>
              <div class="feature-desc">Escape rooms, retos cronológicos y duelos de saberes donde los alumnos estudian motivados por mérito escolar real.</div>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon-box">✓</div>
            <div>
              <div class="feature-title">WhatsApp Automático + Magic Link en 1 Toque</div>
              <div class="feature-desc">Avisos de asistencia y calificaciones directos al celular del padre, con acceso seguro sin recordar contraseñas.</div>
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
            <div class="feature-icon-box">💬</div>
            <div>
              <div class="feature-title">WhatsApp & Magic Link</div>
              <div class="feature-desc">Notificaciones inmediatas de faltas, boletas y avisos al WhatsApp de los padres, con acceso instantáneo sin contraseñas.</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="feature-item">
            <div class="feature-icon-box">🧩</div>
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
            <div class="feature-icon-box">🏛️</div>
            <div>
              <div class="feature-title">Control Escolar 360°</div>
              <div class="feature-desc">Tablero ejecutivo para el director: avance curricular de maestros, expedientes médicos, conducta y boleta formativa SEP.</div>
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
  <!-- SLIDE 4: FINANZAS, COBRANZA & SAT CFDI 4.0                          -->
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
      <div class="header-pill">Portal de Administración</div>
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

        <div class="mockup-window">
          <div class="mockup-header">
            <div class="mockup-dot" style="background: #ef4444;"></div>
            <div class="mockup-dot" style="background: #f59e0b;"></div>
            <div class="mockup-dot" style="background: #10b981;"></div>
            <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-left: 8px;">panel_finanzas_sat_cfdi4.0.app</span>
          </div>
          <div class="mockup-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <span class="mockup-tag">SAT CFDI 4.0 • ACTIVO</span>
                <div style="font-size: 18px; font-weight: 800; color: white; margin-top: 6px;">Consolidado de Colegiaturas</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 11px; color: #2dd4bf; font-weight: 700;">CICLO ESCOLAR ACTIVO</div>
                <div style="font-size: 20px; font-weight: 900; color: #fbbf24; font-family: 'JetBrains Mono', monospace;">100% CONCILIADO</div>
              </div>
            </div>

            <div style="background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 12px; padding: 14px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
                <span style="color: #94a3b8;">Familia Morales Benítez (2 Alumnos)</span>
                <span style="color: #34d399; font-weight: 700;">Al corriente • Recibo #2026-089</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px;">
                <span style="color: #94a3b8;">Factura Timbrada SAT (IEDU)</span>
                <span style="color: #fbbf24; font-family: 'JetBrains Mono', monospace;">UUID: 8F92-41BC-00A9</span>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <div class="metric-pill" style="flex: 1;">
                <span class="metric-label">Facturas Emitidas</span>
                <span class="metric-value">Automático</span>
              </div>
              <div class="metric-pill" style="flex: 1;">
                <span class="metric-label">Auditoría Fiscal</span>
                <span class="metric-value">Sin Descuadres</span>
              </div>
            </div>
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
          <div style="font-size: 14px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
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
          <div style="font-size: 14px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
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
  <!-- SLIDE 6: CONTROL ESCOLAR & EXPEDIENTES 360°                         -->
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
      <div class="header-pill">Expedientes 360°</div>
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
              <div class="feature-title">Control de Boletas y Estatus de Matrícula</div>
              <div class="feature-desc">Configuración de visualización de boletas ligada al estatus de la cuenta escolar y auditoría de bajas por ciclo.</div>
            </div>
          </div>
        </div>

        <div class="mockup-window">
          <div class="mockup-header">
            <div class="mockup-dot" style="background: #ef4444;"></div>
            <div class="mockup-dot" style="background: #f59e0b;"></div>
            <div class="mockup-dot" style="background: #10b981;"></div>
            <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-left: 8px;">expediente_estudiante_360.app</span>
          </div>
          <div class="mockup-content">
            <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: #0f172a; border: 1.5px solid #2dd4bf; display: flex; align-items: center; justify-content: center; font-size: 22px;">
                👧
              </div>
              <div>
                <div style="font-size: 16px; font-weight: 800; color: white;">Zoe Benítez Morales</div>
                <div style="font-size: 11px; color: #94a3b8;">Secundaria 2°B • Matrícula: CMONS-0226 • Al Corriente</div>
              </div>
            </div>

            <div class="grid-2" style="gap: 10px; margin-bottom: 12px;">
              <div style="background: rgba(2, 6, 23, 0.7); padding: 10px; border-radius: 10px; border: 1px solid rgba(244, 63, 94, 0.3);">
                <span style="font-size: 10px; color: #fb7185; font-weight: 800; display: block; text-transform: uppercase;">Alergias Críticas</span>
                <span style="font-size: 12px; font-weight: 700; color: white;">Penicilina / Cacahuates</span>
              </div>
              <div style="background: rgba(2, 6, 23, 0.7); padding: 10px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.3);">
                <span style="font-size: 10px; color: #34d399; font-weight: 800; display: block; text-transform: uppercase;">Asistencia Escolar</span>
                <span style="font-size: 12px; font-weight: 700; color: white;">98% (1 Falta justificada)</span>
              </div>
            </div>

            <div style="background: rgba(2, 6, 23, 0.7); padding: 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: flex; justify-content: space-between; font-size: 11.5px; margin-bottom: 4px;">
                <span style="color: #cbd5e1;">Promedio SEP Oficial</span>
                <span style="color: #2dd4bf; font-weight: 800; font-family: 'JetBrains Mono', monospace;">9.6 / 10</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11.5px;">
                <span style="color: #cbd5e1;">Evaluación Cambridge (English)</span>
                <span style="color: #fbbf24; font-weight: 800; font-family: 'JetBrains Mono', monospace;">Nivel B1 (Distinction)</span>
              </div>
            </div>
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
  <!-- SLIDE 7: COMUNICACIÓN FAMILIAR: WHATSAPP & MAGIC LINK               -->
  <!-- =================================================================== -->
  <div class="slide">
    <div class="glow-top-right"></div>
    <div class="grid-overlay"></div>

    <div class="slide-header">
      <div class="brand-logo">
        <div class="brand-icon">🎓</div>
        <div>
          <span class="brand-text">ISkool</span>
          <span class="brand-tag">Comunicación</span>
        </div>
      </div>
      <div class="header-pill">Familias Conectadas</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        Notificaciones directas por <span class="gradient-text-emerald">WhatsApp</span> y acceso instantáneo por <span class="gradient-text-gold">Magic Link</span>
      </h2>
      <p class="slide-subtitle">
        Elimina de raíz los pretextos de "no me llegó el correo" o "se me olvidó la contraseña". Los padres reciben información oficial directamente en la aplicación que usan todo el día.
      </p>

      <div class="grid-3">
        <div class="card">
          <div class="feature-icon-box" style="background: rgba(37, 211, 102, 0.15); border-color: rgba(37, 211, 102, 0.35); color: #25d366; margin-bottom: 14px;">
            📱
          </div>
          <div class="feature-title" style="font-size: 17px; margin-bottom: 8px;">Avisos por WhatsApp</div>
          <div class="feature-desc" style="font-size: 13.5px; line-height: 1.5;">
            Notificaciones automatizadas al teléfono del tutor cuando su hijo registra una falta, se publica una nueva boleta o hay un aviso urgente de dirección.
          </div>
        </div>

        <div class="card">
          <div class="feature-icon-box feature-icon-gold" style="margin-bottom: 14px;">
            🔑
          </div>
          <div class="feature-title" style="font-size: 17px; margin-bottom: 8px;">Magic Link Criptográfico</div>
          <div class="feature-desc" style="font-size: 13.5px; line-height: 1.5;">
            El padre presiona el enlace seguro en su WhatsApp o correo y entra directamente a su sesión familiar sin teclear contraseñas ni descargar apps pesadas.
          </div>
        </div>

        <div class="card">
          <div class="feature-icon-box" style="margin-bottom: 14px;">
            👨‍👩‍👧‍👦
          </div>
          <div class="feature-title" style="font-size: 17px; margin-bottom: 8px;">Visión de Hogar Multi-Hijo</div>
          <div class="feature-desc" style="font-size: 13.5px; line-height: 1.5;">
            Los padres con más de un hijo en la escuela alternan entre hermanos en un clic, viendo el avance académico y los estados de cuenta unificados.
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
          <div style="font-size: 14px; font-weight: 800; color: #34d399; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
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
          <div style="font-size: 14px; font-weight: 800; color: #fbbf24; text-transform: uppercase; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
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
  <!-- SLIDE 9: PLANEACIONES ANALÍTICAS EN SEGUNDOS                        -->
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
      <div class="header-pill">Velocidad Pedagógica</div>
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

        <div class="mockup-window">
          <div class="mockup-header">
            <div class="mockup-dot" style="background: #ef4444;"></div>
            <div class="mockup-dot" style="background: #f59e0b;"></div>
            <div class="mockup-dot" style="background: #10b981;"></div>
            <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-left: 8px;">planeacion_analitica_nem.app</span>
          </div>
          <div class="mockup-content">
            <div style="margin-bottom: 12px;">
              <span class="mockup-tag">NEM 2024 • FASE 5 (5° PRIMARIA)</span>
              <div style="font-size: 16px; font-weight: 800; color: white; margin-top: 6px;">
                Causas y Efectos de la Independencia de México
              </div>
              <div style="font-size: 11px; color: #94a3b8;">Campo: Ética, Naturaleza y Sociedades • Duración: 3 Sesiones</div>
            </div>

            <div style="background: rgba(2, 6, 23, 0.7); padding: 12px; border-radius: 10px; border: 1px solid rgba(16, 185, 129, 0.2); margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: 800; color: #34d399; text-transform: uppercase;">1. Inicio (15 min)</div>
              <div style="font-size: 11.5px; color: #cbd5e1;">Pregunta detonadora sobre el descontento criollo y lluvia de ideas en el lienzo digital.</div>
            </div>

            <div style="background: rgba(2, 6, 23, 0.7); padding: 12px; border-radius: 10px; border: 1px solid rgba(45, 212, 191, 0.2); margin-bottom: 10px;">
              <div style="font-size: 11px; font-weight: 800; color: #2dd4bf; text-transform: uppercase;">2. Desarrollo (25 min)</div>
              <div style="font-size: 11.5px; color: #cbd5e1;">Reto interactivo de ordenamiento cronológico (1808 a 1810) y emparejamiento de causas.</div>
            </div>

            <div style="background: rgba(2, 6, 23, 0.7); padding: 12px; border-radius: 10px; border: 1px solid rgba(245, 158, 11, 0.2);">
              <div style="font-size: 11px; font-weight: 800; color: #fbbf24; text-transform: uppercase;">3. Cierre & Rúbrica (10 min)</div>
              <div style="font-size: 11.5px; color: #cbd5e1;">Conclusión grupal y rúbrica analítica formativa de 4 niveles de desempeño oficial.</div>
            </div>
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
  <!-- SLIDE 10: ESTUDIO DE ACTIVIDADES GAMIFICADAS (17 NODOS)             -->
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
      <div class="header-pill">Lienzo de Retos</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        Estudio de Actividades con <span class="gradient-text-emerald">17 Nodos Pedagógicos Interactivos</span>
      </h2>
      <p class="slide-subtitle">
        Diseña experiencias donde los alumnos aprenden jugando. El profesor arrastra y conecta bloques didácticos con validación instantánea y simulador en vivo.
      </p>

      <div class="grid-4">
        <div class="card">
          <div class="feature-icon-box" style="margin-bottom: 10px;">🔐</div>
          <div class="feature-title">Escape Room</div>
          <div class="feature-desc">Enigmas deductivos y teclados con códigos secretos para desbloquear la siguiente etapa del desafío.</div>
        </div>

        <div class="card">
          <div class="feature-icon-box feature-icon-gold" style="margin-bottom: 10px;">⚔️</div>
          <div class="feature-title">Combate contra Jefes</div>
          <div class="feature-desc">Duelos de conocimiento contra personajes históricos o científicos con barras de vida (HP) y contraataque.</div>
        </div>

        <div class="card">
          <div class="feature-icon-box" style="margin-bottom: 10px;">⏳</div>
          <div class="feature-title">Secuencia Cronológica</div>
          <div class="feature-desc">Retos táctiles donde los estudiantes arrastran eventos o etapas de procesos para ordenarlos en el tiempo.</div>
        </div>

        <div class="card">
          <div class="feature-icon-box" style="margin-bottom: 10px;">🎁</div>
          <div class="feature-title">Cofre Legendario</div>
          <div class="feature-desc">Entrega de gemas, experiencia (XP) y reconocimientos al culminar la actividad con éxito formativo.</div>
        </div>
      </div>

      <div class="card-teal" style="margin-top: 18px; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="font-size: 24px;">⚡</span>
          <div>
            <div style="font-size: 14px; font-weight: 800; color: white;">Botón de Creación Asistida Incorporado</div>
            <div style="font-size: 12px; color: #94a3b8;">El maestro ingresa el tema y el sistema ensambla la secuencia completa de 7 bloques gamificados en segundos.</div>
          </div>
        </div>
        <span class="mockup-tag">SIMULADOR EN VIVO INTEGRADO</span>
      </div>
    </div>

    <div class="slide-footer">
      <div>ISkool Académico • Innovación Lúdica en el Aula</div>
      <div class="slide-number">10 / 14</div>
    </div>
  </div>

  <!-- =================================================================== -->
  <!-- SLIDE 11: PORTAL DEL ALUMNO (CAMINO DEL HÉROE)                     -->
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
      <div class="header-pill">El Camino del Héroe</div>
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

        <div class="mockup-window">
          <div class="mockup-header">
            <div class="mockup-dot" style="background: #ef4444;"></div>
            <div class="mockup-dot" style="background: #f59e0b;"></div>
            <div class="mockup-dot" style="background: #10b981;"></div>
            <span style="font-size: 11px; color: #94a3b8; font-family: 'JetBrains Mono', monospace; margin-left: 8px;">portal_estudiante_aventura.app</span>
          </div>
          <div class="mockup-content">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div>
                <span class="mockup-tag">NIVEL 4 • EXPLORADOR ACADÉMICO</span>
                <div style="font-size: 18px; font-weight: 800; color: white; margin-top: 6px;">Misiones de la Semana</div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 16px; font-weight: 900; color: #fbbf24; font-family: 'JetBrains Mono', monospace;">1,450 XP ✦</div>
                <div style="font-size: 10px; color: #34d399; font-weight: 700;">RACHA: 12 DÍAS SEGUIDOS</div>
              </div>
            </div>

            <div style="background: rgba(2, 6, 23, 0.7); padding: 12px; border-radius: 10px; border: 1px solid rgba(45, 212, 191, 0.3); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: white;">Reto: Ecosistemas y Cadenas Tróficas</div>
                <div style="font-size: 10.5px; color: #94a3b8;">Ciencias Naturales • Entrega hoy</div>
              </div>
              <span style="background: #10b981; color: #020617; font-weight: 800; font-size: 10px; padding: 4px 8px; border-radius: 6px;">COMPLETADO</span>
            </div>

            <div style="background: rgba(2, 6, 23, 0.7); padding: 12px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08); display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-size: 12px; font-weight: 700; color: white;">Enigma: Fracciones Equivalentes</div>
                <div style="font-size: 10.5px; color: #94a3b8;">Matemáticas • Escape Room 2</div>
              </div>
              <span style="background: #f59e0b; color: #020617; font-weight: 800; font-size: 10px; padding: 4px 8px; border-radius: 6px;">EN PROGRESO</span>
            </div>
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
  <!-- SLIDE 12: SUPERVISIÓN DIRECTIVA 360° EN TIEMPO REAL                 -->
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
      <div class="header-pill">Mando Ejecutivo</div>
    </div>

    <div class="slide-body">
      <h2 class="slide-title">
        La cabina de control para la <span class="gradient-text-emerald">Dirección y Coordinación Escolar</span>
      </h2>
      <p class="slide-subtitle">
        Supervisa la salud académica y operativa de todo tu plantel en tiempo real sin esperar a fin de mes ni perseguir a los maestros por reportes impresos.
      </p>

      <div class="grid-3">
        <div class="card">
          <div class="feature-icon-box" style="margin-bottom: 12px;">📊</div>
          <div class="feature-title" style="font-size: 16px; margin-bottom: 6px;">Auditoría Curricular en Vivo</div>
          <div class="feature-desc" style="font-size: 13px; line-height: 1.5;">
            Verifica qué porcentaje de los PDAs oficiales de la SEP ha cubierto cada profesor y grupo con métricas consolidadas instantáneas.
          </div>
        </div>

        <div class="card">
          <div class="feature-icon-box" style="margin-bottom: 12px;">🚨</div>
          <div class="feature-title" style="font-size: 16px; margin-bottom: 6px;">Alertas Tempranas de Ausentismo</div>
          <div class="feature-desc" style="font-size: 13px; line-height: 1.5;">
            Detecta a tiempo patrones de faltas reiteradas o bajas en calificaciones para intervenir antes de que se conviertan en deserción.
          </div>
        </div>

        <div class="card">
          <div class="feature-icon-box feature-icon-gold" style="margin-bottom: 12px;">📈</div>
          <div class="feature-title" style="font-size: 16px; margin-bottom: 6px;">Toma de Decisiones Informada</div>
          <div class="feature-desc" style="font-size: 13px; line-height: 1.5;">
            Reportes ejecutivos listos para juntas de consejo directivo, comités de socios fundadores y reuniones de planeación estratégica.
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
            <th style="width: 34%; color: #34d399; background: rgba(16, 185, 129, 0.15);">ISkool Académico</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Alcance de la Plataforma</strong></td>
            <td><span class="badge-cross">✕</span> Solo administración financiera y cobranza</td>
            <td><span class="badge-check">✓</span> <strong>Ecosistema 360°:</strong> Aula + Docentes + Alumnos + Familias + Finanzas</td>
          </tr>
          <tr>
            <td><strong>Currículo Oficial SEP y Cambridge</strong></td>
            <td><span class="badge-cross">✕</span> Nula. No integra el programa educativo</td>
            <td><span class="badge-check">✓</span> <strong>Bóveda Oficial (+1,500 Nodos NEM) + Cambridge bilingüe</strong></td>
          </tr>
          <tr>
            <td><strong>Planeaciones del Docente</strong></td>
            <td><span class="badge-cross">✕</span> El maestro sigue haciendo formatos a mano</td>
            <td><span class="badge-check">✓</span> <strong>Generación instantánea en segundos con rúbrica oficial</strong></td>
          </tr>
          <tr>
            <td><strong>Gamificación e Interactividad</strong></td>
            <td><span class="badge-cross">✕</span> Inexistente; el alumno no tiene portal</td>
            <td><span class="badge-check">✓</span> <strong>Estudio con 17 nodos y Camino del Héroe por mérito</strong></td>
          </tr>
          <tr>
            <td><strong>Comunicación Familiar</strong></td>
            <td><span class="badge-cross">✕</span> Contraseñas complejas que los padres olvidan</td>
            <td><span class="badge-check">✓</span> <strong>WhatsApp automático + Magic Link en 1 toque sin contraseñas</strong></td>
          </tr>
          <tr>
            <td><strong>Facturación Electrónica Fiscal</strong></td>
            <td><span class="badge-check">✓</span> Facturación básica</td>
            <td><span class="badge-check">✓</span> <strong>SAT CFDI 4.0 con complemento educativo oficial (IEDU)</strong></td>
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
      <div class="header-pill" style="margin-bottom: 18px;">
        ★ Garantía de Despliegue en 48 Horas
      </div>

      <h1 class="hero-title" style="font-size: 52px;">
        Comprueba el poder de ISkool con una <span class="gradient-text-gold">Prueba Piloto en tu Colegio</span>
      </h1>

      <p class="slide-subtitle" style="font-size: 19px; max-width: 820px; margin-bottom: 30px;">
        Configuramos un grupo muestra de tu institución para que tus maestros generen planeaciones en segundos, tus padres reciban avisos por WhatsApp y tus directivos comprueben el blindaje operativo.
      </p>

      <div class="grid-3" style="width: 100%; margin-bottom: 32px; text-align: left;">
        <div class="card">
          <div style="font-size: 20px; margin-bottom: 6px;">⚡</div>
          <div class="feature-title">Configuración en 48 Horas</div>
          <div class="feature-desc">Nuestro equipo técnico carga tus materias y grupos sin interrumpir las clases del colegio.</div>
        </div>

        <div class="card">
          <div style="font-size: 20px; margin-bottom: 6px;">👥</div>
          <div class="feature-title">Capacitación Llave en Mano</div>
          <div class="feature-desc">Talleres prácticos inmediatos para maestros, directivos y personal de control escolar.</div>
        </div>

        <div class="card">
          <div style="font-size: 20px; margin-bottom: 6px;">🛡️</div>
          <div class="feature-title">Cero Riesgo Institucional</div>
          <div class="feature-desc">Acompañamiento dedicado permanente con soporte técnico y pedagógico prioritario.</div>
        </div>
      </div>

      <div class="gold-button" style="font-size: 16px; padding: 16px 36px;">
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
console.log('HTML generado exitosamente en:', htmlFilePath);

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExecutable = fs.existsSync(edgePath) ? edgePath : chromePath;

const command = `"${browserExecutable}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;

try {
  console.log('Generando PDF mediante:', browserExecutable);
  execSync(command);
  const stats = fs.statSync(pdfFilePath);
  console.log('PDF generado exitosamente!');
  console.log('Ruta:', pdfFilePath);
  console.log('Tamaño:', (stats.size / (1024 * 1024)).toFixed(2), 'MB');
} catch (err) {
  console.error('Error al generar PDF:', err);
}
