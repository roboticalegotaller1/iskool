const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const audioDir = path.join(__dirname, '..', 'temp_video_audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

const scenes = [
  {
    id: 1,
    targetDuration: 12,
    rate: 0,
    text: "La mayoría de las plataformas escolares se preocupan únicamente por la caja registradora. Pero un gran colegio no se mide por cómo cobra, sino por la excelencia de lo que ocurre dentro de sus salones. Porque lo verdaderamente valioso... es lo académico."
  },
  {
    id: 2,
    targetDuration: 13,
    rate: 0,
    text: "Tus maestros pierden fines de semana enteros batallando con formatos y planeaciones manuales. ISkool les devuelve el tiempo y la vocación pedagógica con un entorno diseñado para operar con máxima claridad y rapidez."
  },
  {
    id: 3,
    targetDuration: 15,
    rate: 0,
    text: "Acceso directo a la Bóveda Curricular oficial con más de mil quinientos contenidos y PDAs de la Secretaría de Educación Pública y estándar internacional Cambridge. El docente elige el tema o fotografía el libro de texto, y el Asistente Pedagógico estructura sesiones analíticas completas con cronómetro, entregables y rúbricas oficiales al instante."
  },
  {
    id: 4,
    targetDuration: 15,
    rate: 0,
    text: "El aprendizaje se convierte en una experiencia viva. Con nuestro Estudio de diecisiete nodos interactivos, tus profesores crean retos y salas de escape en minutos. Mientras tus alumnos recorren el Camino del Héroe: una aventura gamificada donde cada logro se gana únicamente por esfuerzo y mérito académico, sin microtransacciones monetarias."
  },
  {
    id: 5,
    targetDuration: 15,
    rate: 0,
    text: "Seguridad institucional absoluta con el Expediente 360: historial médico, alergias en primer plano y seguimiento formativo continuo. Y para los padres de familia: avisos de asistencia y calificaciones directo a su WhatsApp, con acceso en un solo toque y cero contraseñas olvidadas."
  },
  {
    id: 6,
    targetDuration: 10,
    rate: 1,
    text: "La Dirección General supervisa la cobertura de cada asignatura en tiempo real. Y si tu colegio desea consolidar su operación: cobranza ordenada y timbrado fiscal SAT con complemento educativo, integrado como módulo complementario."
  },
  {
    id: 7,
    targetDuration: 10,
    rate: 0,
    text: "Comprueba la diferencia que una verdadera plataforma pedagógica puede hacer en tu comunidad escolar. Inicia tu Prueba Piloto en cuarenta y ocho horas con acompañamiento docente garantizado. Agenda tu demostración institucional hoy mismo y lidera la educación del futuro."
  }
];

// Write powershell generator
let psCommands = `
Add-Type -AssemblyName System.Speech
$syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
$syn.SelectVoice('Microsoft Sabina Desktop')
`;

scenes.forEach(s => {
  const wavPath = path.join(audioDir, `scene_${s.id}.wav`).replace(/\\/g, '/');
  psCommands += `
$syn.Rate = ${s.rate}
$syn.SetOutputToWaveFile('${wavPath}')
$syn.Speak('${s.text.replace(/'/g, "''")}')
`;
});

psCommands += `
$syn.Dispose()
Write-Output "ALL_VOICES_GENERATED"
`;

const psPath = path.join(audioDir, 'generate.ps1');
fs.writeFileSync(psPath, psCommands, 'utf8');

console.log('🎙️ Generating Spanish voiceovers with Microsoft Sabina (es-MX)...');
execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit' });

console.log('\n📊 Voiceover Durations:');
let totalVoiceDuration = 0;
scenes.forEach(s => {
  const wavPath = path.join(audioDir, `scene_${s.id}.wav`);
  const probe = spawnSync(ffmpeg, ['-i', wavPath]);
  const out = probe.stderr.toString();
  const match = out.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    const dur = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    console.log(`Scene ${s.id} (${s.targetDuration}s slot): Voice duration = ${dur.toFixed(2)}s`);
    totalVoiceDuration += dur;
  }
});
console.log(`\nTotal voice duration: ${totalVoiceDuration.toFixed(2)}s`);
