const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Guía del Profesor - Creador de Actividades ISkool</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@600;700;800&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@600&display=swap');

    @page {
      size: letter;
      margin: 1.5cm 1.5cm 1.5cm 1.5cm;
    }

    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    body {
      font-family: 'Inter', sans-serif;
      font-size: 9.5pt;
      line-height: 1.5;
      color: #1e293b;
      margin: 0;
      padding: 0;
    }

    h1, h2, h3, h4 {
      font-family: 'Outfit', sans-serif;
      color: #0f172a;
      margin-top: 0;
      letter-spacing: -0.01em;
    }

    .header-box {
      border: 2px solid #7c3aed;
      border-radius: 16px;
      background: #faf5ff;
      padding: 16px 20px;
      margin-bottom: 20px;
    }

    .header-badge {
      display: inline-block;
      background: #7c3aed;
      color: white;
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 4px 12px;
      border-radius: 999px;
      margin-bottom: 8px;
    }

    .header-title {
      font-size: 20pt;
      font-weight: 800;
      color: #3b0764;
      margin: 0 0 6px 0;
    }

    .header-desc {
      font-size: 9.5pt;
      color: #581c87;
      margin: 0;
      font-weight: 500;
    }

    .section-title {
      font-size: 13pt;
      font-weight: 800;
      color: #3b0764;
      border-bottom: 2px solid #e9d5ff;
      padding-bottom: 4px;
      margin: 18px 0 10px 0;
      page-break-after: avoid;
    }

    .tool-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin-bottom: 14px;
      page-break-inside: avoid;
    }

    .tool-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #7c3aed;
      border-radius: 10px;
      padding: 10px 12px;
      page-break-inside: avoid;
    }

    .tool-title {
      font-size: 10pt;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 3px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .tool-desc {
      font-size: 8.5pt;
      color: #475569;
      margin-bottom: 6px;
    }

    .tool-example {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 8pt;
      color: #1e293b;
    }

    .tool-example strong {
      color: #6366f1;
      text-transform: uppercase;
      font-size: 7.5pt;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 8.5pt;
      page-break-inside: avoid;
    }

    th {
      background: #f1f5f9;
      color: #0f172a;
      font-weight: 700;
      text-align: left;
      padding: 6px 10px;
      border: 1px solid #cbd5e1;
    }

    td {
      padding: 6px 10px;
      border: 1px solid #e2e8f0;
      vertical-align: top;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>

  <!-- ENCABEZADO -->
  <div class="header-box">
    <span class="header-badge">ISkool • Colegio Anglo Mexicano • 2026</span>
    <h1 class="header-title">Guía Rápida para el Profesor</h1>
    <p class="header-desc">Manual concreto y práctico con las 16 herramientas didácticas del creador de actividades gamificadas.</p>
  </div>

  <!-- SECCIÓN 1: DOCK RÁPIDO -->
  <h2 class="section-title">1. Herramientas de Acceso Rápido (Barra Lateral Izquierda)</h2>
  <div class="tool-grid">
    <div class="tool-card" style="border-left-color: #8b5cf6;">
      <div class="tool-title">❓ Pregunta de Opción Múltiple</div>
      <div class="tool-desc">Reactivo interactivo con tiempo límite y explicación didáctica inmediata tras responder.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> "¿Cuánto mide la hipotenusa de catetos 3 y 4?" ➔ Correcta: <code>5 cm</code> (Pitágoras).
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #3b82f6;">
      <div class="tool-title">📖 Texto & Instrucción</div>
      <div class="tool-desc">Instrucciones docentes, fragmentos de lectura guiada o diálogos de personajes.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> "¡Hola cadetes! Lean atentamente el texto sobre gravedad antes del desafío."
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #f59e0b;">
      <div class="tool-title">🎁 Cofre de Recompensas</div>
      <div class="tool-desc">Otorga puntos XP, monedas de oro e insignias coleccionables para motivar al alumno.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Botín: <code>+150 XP</code>, <code>+30 Monedas</code> e Insignia "Científico Honorario".
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #ef4444;">
      <div class="tool-title">⚔️ Combate Pixi contra Boss</div>
      <div class="tool-desc">Duelo RPG por turnos con dragones animados, barra de vida (HP) y ataques críticos.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Jefe: "Gólem del Olvido (100 HP)" ➔ Ataques de Sabiduría y Pociones de Vida.
      </div>
    </div>
  </div>

  <!-- SECCIÓN 2: CATÁLOGO EXTENDIDO (+) -->
  <h2 class="section-title">2. Catálogo Extendido (+) — 12 Herramientas Avanzadas</h2>

  <h3 style="font-size: 10pt; font-weight: 800; color: #4f46e5; margin: 10px 0 6px 0;">⚡ Evaluaciones Interactivas</h3>
  <div class="tool-grid">
    <div class="tool-card" style="border-left-color: #8b5cf6;">
      <div class="tool-title">🔗 Emparejamiento / Drag & Drop</div>
      <div class="tool-desc">El alumno conecta conceptos de la columna izquierda con su significado a la derecha.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> <code>Fuerza</code> ↔️ "Interacción que modifica el movimiento."
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #3b82f6;">
      <div class="tool-title">🔢 Ordenar Secuencia / Cronología</div>
      <div class="tool-desc">Reordena pasos de un proceso o líneas de tiempo históricas barajadas al azar.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Ordenar: <code>1. Conspiración</code> ➔ <code>2. Grito de Dolores</code> ➔ <code>3. Granaditas</code>.
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #14b8a6;">
      <div class="tool-title">✍️ Completar Espacios (Texto Mutilado)</div>
      <div class="tool-desc">Oculta palabras clave con <code>[palabra]</code> y el sistema genera botones interactivos.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> "La <code>[gravedad]</code> atrae los cuerpos hacia el centro de la <code>[Tierra]</code>."
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #ec4899;">
      <div class="tool-title">💡 Pregunta Abierta con IA Formativa</div>
      <div class="tool-desc">El alumno redacta su reflexión y recibe retroalimentación inmediata según tu rúbrica.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> "¿Qué pasaría en el transporte si no existiera la fricción?" (Evaluado por IA).
      </div>
    </div>
  </div>

  <div class="page-break"></div>

  <h3 style="font-size: 10pt; font-weight: 800; color: #0284c7; margin: 10px 0 6px 0;">🎬 Multimedia & Laboratorios Vivos</h3>
  <div class="tool-grid">
    <div class="tool-card" style="border-left-color: #ef4444;">
      <div class="tool-title">🎥 Video Interactivo de YouTube</div>
      <div class="tool-desc">Incrusta cápsulas educativas con marcas de tiempo (ej. <code>&t=76s</code>) y pausas formativas.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Video de 3 min sobre Leyes de Newton reproduciendo desde el segundo 76.
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #06b6d4;">
      <div class="tool-title">🌐 Simulador / Laboratorio Web</div>
      <div class="tool-desc">Integra simuladores científicos interactivos (PhET, GeoGebra, Desmos) en un iframe seguro.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Simulador de Fuerzas PhET donde el alumno aplica Newtons y mide aceleración.
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #8b5cf6;">
      <div class="tool-title">🎺 Efecto de Audio / Fanfarria</div>
      <div class="tool-desc">Sonidos de victoria, fanfarrias y pistas de ambientación generadas con Web Audio.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Fanfarria triunfal al superar un reto complejo de la sesión.
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #f59e0b;">
      <div class="tool-title">🗝️ Misterio & Código Secreto</div>
      <div class="tool-desc">Candado virtual tipo Escape Room. El alumno ingresa la clave para abrir la siguiente fase.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Pista: "Magnitud que medimos en Newtons (F _ _ _ Z A)" ➔ Código: <code>FUERZA</code>.
      </div>
    </div>
  </div>

  <h3 style="font-size: 10pt; font-weight: 800; color: #15803d; margin: 10px 0 6px 0;">🎮 Gamificación, Rutas & Certificación</h3>
  <div class="tool-grid">
    <div class="tool-card" style="border-left-color: #10b981;">
      <div class="tool-title">🎲 Minijuego Arcade (Ruleta)</div>
      <div class="tool-desc">Gira la ruleta de saberes o memoramas para otorgar bonificaciones y dinamizar la clase.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Girar para ganar "+50 XP" o "Poción de Enfoque".
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #eab308;">
      <div class="tool-title">📜 Diploma de Honor Digital</div>
      <div class="tool-desc">Genera una constancia de mérito descargable con firma docente al completar la misión.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> "Diploma de Honor al Gran Maestro de la Física", firmado por el docente.
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #6366f1;">
      <div class="tool-title">🔀 Ramificación Adaptativa</div>
      <div class="tool-desc">Si el alumno acierta &ge; 70% avanza al reto avanzado; si no, a una cápsula de refuerzo.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> Bifurcación automática según el porcentaje de aciertos del alumno.
      </div>
    </div>

    <div class="tool-card" style="border-left-color: #334155;">
      <div class="tool-title">🛡️ Punto de Control Metacognitivo</div>
      <div class="tool-desc">Autoevaluación donde el estudiante califica su seguridad del tema con 5 estrellas.</div>
      <div class="tool-example">
        <strong>Ejemplo:</strong> "¿Qué tan seguro te sientes aplicando las 3 Leyes de Newton?" (1-5 estrellas).
      </div>
    </div>
  </div>

  <!-- SECCIÓN 3: ESTRUCTURA DE CLASE MODELO -->
  <h2 class="section-title">3. Ejemplo Práctico: Estructura de Clase Modelo en 7 Pasos</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 8%;">#</th>
        <th style="width: 27%;">Bloque Recomendado</th>
        <th style="width: 65%;">Contenido de la Actividad en el Aula</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>1</strong></td>
        <td>📖 <code>Texto / Narrativa</code></td>
        <td>Introducción: "Misión: Calibrando los motores gravitacionales de la nave."</td>
      </tr>
      <tr>
        <td><strong>2</strong></td>
        <td>🎥 <code>Video de YouTube</code></td>
        <td>Cápsula de 2 minutos explicando los tipos de fuerza y gravedad.</td>
      </tr>
      <tr>
        <td><strong>3</strong></td>
        <td>🌐 <code>Simulador PhET</code></td>
        <td>Laboratorio interactivo para mover masas y observar la aceleración.</td>
      </tr>
      <tr>
        <td><strong>4</strong></td>
        <td>🔗 <code>Drag & Drop</code></td>
        <td>Emparejar los 3 conceptos fundamentales vistos en el simulador.</td>
      </tr>
      <tr>
        <td><strong>5</strong></td>
        <td>🗝️ <code>Código Secreto</code></td>
        <td>Resolver el acertijo numérico para abrir la compuerta de la nave.</td>
      </tr>
      <tr>
        <td><strong>6</strong></td>
        <td>⚔️ <code>Combate con Boss</code></td>
        <td>Duelo de conocimientos contra el "Gólem del Olvido" respondiendo preguntas.</td>
      </tr>
      <tr>
        <td><strong>7</strong></td>
        <td>🎁 <code>Cofre + Diploma</code></td>
        <td>Entrega de 150 XP, monedas y el Diploma de Honor digital.</td>
      </tr>
    </tbody>
  </table>

  <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; text-align: center; font-size: 8pt; color: #64748b;">
    Colegio Anglo Mexicano • Ecosistema ISkool • Todos los derechos reservados © 2026
  </div>

</body>
</html>`;

const htmlFilePath = path.join(__dirname, 'manual_docente.html');
const pdfFilePath = path.join(__dirname, 'MANUAL_FUNCIONES_LMS_GAMIFICADO.pdf');

fs.writeFileSync(htmlFilePath, htmlContent, 'utf8');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browserExecutable = fs.existsSync(edgePath) ? edgePath : chromePath;

const command = `"${browserExecutable}" --headless --disable-gpu --run-all-compositor-stages-before-draw --print-to-pdf="${pdfFilePath}" --no-pdf-header-footer "${htmlFilePath}"`;

try {
  execSync(command);
  console.log('PDF actualizado exitosamente en:', pdfFilePath);
} catch (err) {
  console.error('Error al generar PDF:', err);
}
