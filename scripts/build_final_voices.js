const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg').path;

const audioDir = path.join(__dirname, '..', 'temp_video_audio');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const scenes = [
  {
    id: 1,
    duration: 12.0,
    rate: 1,
    text: "La mayoría de los sistemas escolares solo se enfocan en cobrar. Pero un gran colegio se distingue por lo que ocurre en sus aulas. Porque lo verdaderamente valioso... es lo académico."
  },
  {
    id: 2,
    duration: 12.5,
    rate: 1,
    text: "Tus docentes pierden horas valiosas en papeleo y formatos manuales. ISkool les devuelve el tiempo y la vocación con una plataforma ágil diseñada para trabajar en segundos."
  },
  {
    id: 3,
    duration: 14.5,
    rate: 1,
    text: "Bóveda Curricular oficial con más de mil quinientos contenidos de la SEP y estándar internacional Cambridge. Planeaciones analíticas completas con cronómetro, entregables y rúbricas al instante."
  },
  {
    id: 4,
    duration: 15.0,
    rate: 1,
    text: "Aprendizaje interactivo y motivante. Con nuestro Estudio de diecisiete nodos pedagógicos tus maestros crean retos gamificados, mientras los alumnos avanzan en un Camino del Héroe cien por ciento basado en mérito."
  },
  {
    id: 5,
    duration: 14.0,
    rate: 1,
    text: "Expediente 360 con alertas médicas inmediatas y seguimiento integral. Y para las familias: avisos de asistencia y calificaciones directo a su WhatsApp, con acceso en un toque y sin contraseñas."
  },
  {
    id: 6,
    duration: 11.0,
    rate: 1,
    text: "Supervisión curricular directiva en tiempo real. Y si deseas cobranza y facturación SAT, cuentas con un módulo complementario."
  },
  {
    id: 7,
    duration: 11.0,
    rate: 1,
    text: "Comprueba el poder de ISkool con una Prueba Piloto en cuarenta y ocho horas y cero riesgo. Agenda tu demostración hoy y lidera la educación."
  }
];

let psCommands = `
Add-Type -AssemblyName System.Speech
$syn = New-Object System.Speech.Synthesis.SpeechSynthesizer
$syn.SelectVoice('Microsoft Sabina Desktop')
`;

scenes.forEach(s => {
  const wavPath = path.join(audioDir, `final_voice_${s.id}.wav`).replace(/\\/g, '/');
  psCommands += `
$syn.Rate = ${s.rate}
$syn.SetOutputToWaveFile('${wavPath}')
$syn.Speak('${s.text.replace(/'/g, "''")}')
`;
});

psCommands += `
$syn.Dispose()
Write-Output "GENERATED_FINAL_VOICES"
`;

const psPath = path.join(audioDir, 'generate_final_voices.ps1');
fs.writeFileSync(psPath, psCommands, 'utf8');

execSync(`powershell -ExecutionPolicy Bypass -File "${psPath}"`, { stdio: 'inherit' });

console.log('\n🎙️ Final Voice Verification:');
let totalSlot = 0;
scenes.forEach(s => {
  totalSlot += s.duration;
  const wavPath = path.join(audioDir, `final_voice_${s.id}.wav`);
  const probe = spawnSync(ffmpeg, ['-i', wavPath]);
  const match = probe.stderr.toString().match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  if (match) {
    const dur = parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseFloat(match[3]);
    console.log(`Scene ${s.id} (Slot: ${s.duration}s) -> Voice: ${dur.toFixed(2)}s | Margin: ${(s.duration - dur).toFixed(2)}s`);
  }
});

console.log(`\nTotal Timeline Duration: ${totalSlot.toFixed(1)}s (EXACT 90.0 SECONDS)`);
