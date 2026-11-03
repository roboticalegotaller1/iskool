const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const pythonBin = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
const workerScript = path.join(process.cwd(), 'scripts', 'neural_tts_worker.py');

const rootDir = path.join(__dirname, '..');
const audioDir = path.join(rootDir, 'temp_sales_video_assets', 'audio');
const artifactDir = 'C:/Users/kami-/.gemini/antigravity/brain/fde3a4d8-54b9-4be2-95e3-e8a0eb4d4f5b';
fs.mkdirSync(audioDir, { recursive: true });

// 12 Surgical Conversational Sales Scenes aligned with the 143.8s Visual Master Timeline
const SCENES = [
  {
    id: 'scene01',
    title: 'Intro Oficial iSkool® + Cortinilla CEO + Resumen Ejecutivo Consolidado',
    startTime: 0.0,
    endTime: 16.33,
    preWait: 2.0,
    ssmlText: 'Bienvenido a Aiskul, el ecosistema educativo que transforma la dirección, la docencia y el aprendizaje. En el Portal de Dirección General, controla en tiempo real matrícula, asistencia y el avance de cada plantel desde un solo tablero ejecutivo.'
  },
  {
    id: 'scene02',
    title: 'Admisión 360° CRM Kanban — Embudo de Captación a Inscripción',
    startTime: 16.33,
    endTime: 27.66,
    preWait: 0.25,
    ssmlText: 'Con Admisión trescientos sesenta, multiplica tu captación escolar. Sigue a cada aspirante desde el primer contacto y diagnóstico hasta su inscripción, sin perder un solo prospecto.'
  },
  {
    id: 'scene03',
    title: 'Consola de Correo Inteligente & Triage Cognitivo CEO',
    startTime: 27.66,
    endTime: 37.93,
    preWait: 0.25,
    ssmlText: 'Nuestro Triage Cognitivo de Correo filtra cientos de mensajes diarios, destaca los asuntos críticos y delega el resto a tu equipo, ahorrándote horas de gestión operativa.'
  },
  {
    id: 'scene04',
    title: 'Supervisión Docente & Modo Espejo CEO en Tiempo Real',
    startTime: 37.93,
    endTime: 46.90,
    preWait: 0.25,
    ssmlText: 'Y con el Modo Espejo Ejecutivo, supervisa en vivo qué planeación, Taxonomía de Bloom y sellos de libreta se aplican en cada salón sin interrumpir la clase.'
  },
  {
    id: 'scene05',
    title: 'Cortinilla Portal del Profesor + Daylight Studio Pro en Aula',
    startTime: 46.90,
    endTime: 61.76,
    preWait: 1.8,
    ssmlText: 'En el Portal del Profesor, Daylight Studio Pro ofrece una experiencia intuitiva. El docente guía su clase con cronómetro pedagógico, Taxonomía de Bloom, calendario de asistencia, sellado digital de libreta y avisos al instante.'
  },
  {
    id: 'scene06',
    title: 'Generador Curricular SEP NEM 360° & Estudio iSkool de Bloques',
    startTime: 61.76,
    endTime: 73.10,
    preWait: 0.25,
    ssmlText: 'El Generador Curricular crea planeaciones oficiales de la Nueva Escuela Mexicana en segundos y las sincroniza con tu agenda. Y en el Estudio Aiskul, diseña actividades interactivas por bloques.'
  },
  {
    id: 'scene07',
    title: 'Libro Mágico Interactivo & Personajes Históricos en 1ª Persona',
    startTime: 73.10,
    endTime: 80.92,
    preWait: 0.25,
    ssmlText: 'Con el Libro Mágico Interactivo, tus alumnos conversan en primera persona con personajes históricos respaldados por rigor documental.'
  },
  {
    id: 'scene08',
    title: 'Cortinilla Portal del Estudiante + Misiones Épicas & Avatares',
    startTime: 80.92,
    endTime: 93.59,
    preWait: 1.8,
    ssmlText: 'En el Portal del Estudiante, cada tarea y tema visto en clase se transforma en una misión épica. Los alumnos ganan experiencia, suben de rango y evolucionan su avatar mediante su mérito académico.'
  },
  {
    id: 'scene09',
    title: 'Enseñanza de Idiomas & Karaoke Fonético (Cambridge / DELF-DALF / CELTA-DELTA)',
    startTime: 93.59,
    endTime: 104.63,
    preWait: 0.25,
    ssmlText: 'Nuestro Laboratorio de Idiomas integra conversación viva y karaoke fonético palabra por palabra, preparando a tus alumnos para certificaciones Cambridge, DELF y DALF.'
  },
  {
    id: 'scene10',
    title: 'Carrusel Dinámico de 20 Diseños de Gamificación por Nivel Académico',
    startTime: 104.63,
    endTime: 115.75,
    preWait: 0.25,
    ssmlText: 'Más de veinte universos visuales se adaptan a cada etapa: desde preescolar y primaria hasta duelos de conocimiento en secundaria y simuladores preuniversitarios en preparatoria.'
  },
  {
    id: 'scene11',
    title: 'Cortinilla Portal del Padre de Familia + Avisos, Estado de Cuenta y Pagos',
    startTime: 115.75,
    endTime: 127.05,
    preWait: 1.8,
    ssmlText: 'En el Portal para Padres, las familias consultan logros, firman avisos escolares de enterado y pagan colegiaturas en línea con factura fiscal automática al instante.'
  },
  {
    id: 'scene12',
    title: 'Cierre de Ventas & Agendamiento de Citas (contacto@iskool.mx / 5511404767)',
    startTime: 127.05,
    endTime: 143.80,
    preWait: 0.35,
    ssmlText: 'Lleva hoy tu institución al estándar mundial. Agenda tu demostración ejecutiva en contacto arroba iskool punto eme equis, o llámanos al cincuenta y cinco, once cuarenta, cuarenta y siete, sesenta y siete. Aiskul: el futuro de la educación, hoy.'
  }
];

function getAudioDuration(filePath) {
  try {
    execFileSync(ffmpegPath, ['-i', filePath], { stdio: 'pipe' });
    return 10;
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (m) {
      return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseFloat(m[3]);
    }
    return 10;
  }
}

function generateWarmSalesSoundtrack(wavPath, totalDurationSec, duckWindows) {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  const numChannels = 2;
  const buffer = Buffer.alloc(44 + totalSamples * numChannels * 2);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + totalSamples * numChannels * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(numChannels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * numChannels * 2, 28);
  buffer.writeUInt16LE(numChannels * 2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalSamples * numChannels * 2, 40);

  const bpm = 118;
  const beatSec = 60 / bpm;
  const measureSec = beatSec * 4;

  const chords = [
    { root: 73.42, notes: [146.83, 185.00, 220.00, 277.18, 329.63] },
    { root: 69.30, notes: [138.59, 164.81, 220.00, 277.18, 329.63] },
    { root: 61.74, notes: [123.47, 146.83, 185.00, 220.00, 293.66] },
    { root: 49.00, notes: [98.00, 123.47, 146.83, 196.00, 246.94] }
  ];

  function pianoNote(freq, dt) {
    if (dt < 0) return 0;
    const env = Math.exp(-dt * 2.4) * 0.7 + Math.exp(-dt * 0.85) * 0.3;
    const h1 = Math.sin(2 * Math.PI * freq * dt) * 0.58;
    const h2 = Math.sin(2 * Math.PI * freq * 2.0 * dt) * 0.24;
    const h3 = Math.sin(2 * Math.PI * freq * 3.0 * dt) * 0.10;
    return (h1 + h2 + h3) * env;
  }

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let masterVol = 0.78;
    if (t < 1.2) masterVol *= (t / 1.2);
    if (t > totalDurationSec - 2.2) masterVol *= Math.max(0, (totalDurationSec - t) / 2.2);

    if (duckWindows) {
      let duckFactor = 0.68;
      for (const w of duckWindows) {
        if (t >= w.start - 0.28 && t <= w.end + 0.28) {
          if (t < w.start) {
            const p = (w.start - t) / 0.28;
            duckFactor = 0.16 + p * 0.52;
          } else if (t > w.end) {
            const p = (t - w.end) / 0.28;
            duckFactor = 0.16 + p * 0.52;
          } else {
            duckFactor = 0.16;
          }
          break;
        }
      }
      masterVol *= duckFactor;
    } else {
      masterVol *= 0.80;
    }

    const measureIdx = Math.floor(t / measureSec) % chords.length;
    const chord = chords[measureIdx];
    const chordAge = t % measureSec;
    const beatAge = t % beatSec;
    const eighthAge = t % (beatSec / 2);

    let left = 0;
    let right = 0;

    for (let n = 0; n < chord.notes.length; n++) {
      const noteDt = chordAge - n * 0.022;
      const sig = pianoNote(chord.notes[n], noteDt) * 0.22;
      const pan = 0.3 + (n / chord.notes.length) * 0.4;
      left += sig * (1 - pan);
      right += sig * pan;
    }

    const arpIdx = Math.floor(t / (beatSec / 2)) % chord.notes.length;
    const arpFreq = chord.notes[arpIdx] * 2;
    const arpEnv = Math.exp(-eighthAge * 7.5);
    const arpSig = Math.sin(2 * Math.PI * arpFreq * eighthAge) * arpEnv * 0.085;
    left += arpSig * 0.55;
    right += arpSig * 0.45;

    const bassEnv = Math.exp(-beatAge * 3.8) * Math.min(1, beatAge * 45);
    const bassSig = (Math.sin(2 * Math.PI * chord.root * t) * 0.75 + Math.sin(2 * Math.PI * chord.root * 2 * t) * 0.25) * bassEnv * 0.24;
    left += bassSig;
    right += bassSig;

    for (let n = 0; n < 3; n++) {
      const padFreq = chord.notes[n];
      left += Math.sin(2 * Math.PI * padFreq * t + 0.2) * 0.045;
      right += Math.sin(2 * Math.PI * (padFreq * 1.001) * t + 0.9) * 0.045;
    }

    left = Math.tanh(left * masterVol);
    right = Math.tanh(right * masterVol);

    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(left * 32767))), offset);
    buffer.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(right * 32767))), offset + 2);
    offset += 4;
  }

  fs.writeFileSync(wavPath, buffer);
}

async function main() {
  console.log('🎙️ Synthesizing 12 Conversational Human Sales Scenes (v6 Studio Generative Voice)...');
  const timeline = [];
  const duckWindows = [];

  for (let i = 0; i < SCENES.length; i++) {
    const s = SCENES[i];
    const rawMp3 = path.join(audioDir, `${s.id}_v6_raw.mp3`);
    const wavTrimmed = path.join(audioDir, `${s.id}_trimmed.wav`);
    const wavNorm = path.join(audioDir, `${s.id}.wav`);

    if (!fs.existsSync(rawMp3) || fs.statSync(rawMp3).size < 10000) {
      const payloadPath = path.join(audioDir, `${s.id}_payload.json`);
      fs.writeFileSync(payloadPath, JSON.stringify({
        text: s.ssmlText,
        voice: 'es-US-PalomaNeural',
        rate: '+2%',
        pitch: '+0Hz',
        characterName: 'Sofía Ejecutiva',
        role: 'comercial',
        output: rawMp3
      }), 'utf8');

      execFileSync(pythonBin, [workerScript, '--json', payloadPath], { stdio: 'ignore' });
      if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath);
    }

    // 1. Convert to 44.1kHz stereo WAV with gentle silence trim at start/end only (preserving internal human breaths)
    execFileSync(ffmpegPath, [
      '-y', '-i', rawMp3,
      '-af', 'silenceremove=start_periods=1:start_duration=0.05:start_threshold=-48dB,areverse,silenceremove=start_periods=1:start_duration=0.05:start_threshold=-48dB,areverse',
      '-ar', '44100', '-ac', '2',
      wavTrimmed
    ], { stdio: 'ignore' });

    const rawDur = getAudioDuration(wavTrimmed);
    const slotWindow = (s.endTime - s.startTime) - s.preWait - 0.25;
    // Apply only gentle tempo adjustment if the natural recording exceeds its visual scene slot
    let tempoFactor = 1.0;
    if (rawDur > slotWindow && slotWindow > 2.0) {
      tempoFactor = Math.min(1.18, Number((rawDur / slotWindow).toFixed(3)));
    }

    const afFilter = tempoFactor > 1.005 ? `atempo=${tempoFactor}` : 'anull';
    execFileSync(ffmpegPath, [
      '-y', '-i', wavTrimmed,
      '-af', afFilter,
      '-ar', '44100', '-ac', '2',
      wavNorm
    ], { stdio: 'ignore' });

    const voiceDur = getAudioDuration(wavNorm);
    const sceneDur = Number((s.endTime - s.startTime).toFixed(2));
    const voiceStartGlobal = Number((s.startTime + s.preWait).toFixed(2));
    const voiceEndGlobal = Number(Math.min(s.endTime - 0.1, voiceStartGlobal + voiceDur).toFixed(2));
    const postWait = Number(Math.max(0.1, s.endTime - voiceEndGlobal).toFixed(2));

    duckWindows.push({ start: voiceStartGlobal, end: voiceEndGlobal });

    timeline.push({
      index: i + 1,
      id: s.id,
      title: s.title,
      startTime: s.startTime,
      endTime: s.endTime,
      duration: sceneDur,
      preWait: s.preWait,
      voiceDuration: Number(voiceDur.toFixed(2)),
      postWait,
      voiceStartGlobal,
      voiceEndGlobal,
      wavPath: wavNorm,
      text: s.ssmlText
    });

    console.log(`  ✓ [${s.id}] Natural Voice: ${rawDur.toFixed(2)}s -> Fitted: ${voiceDur.toFixed(2)}s (tempo=${tempoFactor.toFixed(2)}x) | Slot: ${s.startTime.toFixed(2)}s..${s.endTime.toFixed(2)}s`);
  }

  const totalDuration = 143.8;
  const manifestPath = path.join(audioDir, 'timeline_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ totalDuration, scenes: timeline }, null, 2));

  const bgSinVozPath = path.join(audioDir, 'master_audio_sin_voz.wav');
  const bgDuckedPath = path.join(audioDir, 'bg_ducked.wav');
  const masterConVozPath = path.join(audioDir, 'master_audio_con_voz.wav');

  console.log('🎵 Generating Master Soundtrack (Sin Voz)...');
  generateWarmSalesSoundtrack(bgSinVozPath, totalDuration, null);

  console.log('🎵 Generating Ducked Soundtrack + Mixing Conversational Human Voiceover (Con Voz)...');
  generateWarmSalesSoundtrack(bgDuckedPath, totalDuration, duckWindows);

  const inputs = ['-i', bgDuckedPath];
  const delayFilters = [];
  const mixLabels = ['[0:a]'];

  timeline.forEach((sc, idx) => {
    inputs.push('-i', sc.wavPath);
    const delayMs = Math.round(sc.voiceStartGlobal * 1000);
    const label = `[v${idx + 1}]`;
    delayFilters.push(`[${idx + 1}:a]adelay=${delayMs}|${delayMs},volume=1.45${label}`);
    mixLabels.push(label);
  });

  const filterComplex = `${delayFilters.join(';')};${mixLabels.join('')}amix=inputs=${timeline.length + 1}:duration=first:dropout_transition=0,alimiter=limit=0.95[outa]`;

  execFileSync(ffmpegPath, [
    '-y',
    ...inputs,
    '-filter_complex', filterComplex,
    '-map', '[outa]',
    '-ar', '44100', '-ac', '2',
    masterConVozPath
  ], { stdio: 'ignore' });

  // If ISkool_Video_Comercial_Ventas_Sin_Voz.mp4 exists, remux its 1080p visual stream with the new human voiceover
  const sinVozMp4 = path.join(rootDir, 'ISkool_Video_Comercial_Ventas_Sin_Voz.mp4');
  const conVozMp4 = path.join(rootDir, 'ISkool_Video_Comercial_Ventas_Con_Voz.mp4');
  if (fs.existsSync(sinVozMp4)) {
    console.log('🎬 Remuxing 1080p Visual Stream into ISkool_Video_Comercial_Ventas_Con_Voz.mp4 with v6 Studio Human Voice...');
    execFileSync(ffmpegPath, [
      '-y',
      '-i', sinVozMp4,
      '-i', masterConVozPath,
      '-map', '0:v:0',
      '-map', '1:a:0',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-b:a', '192k',
      '-shortest',
      '-movflags', '+faststart',
      conVozMp4
    ], { stdio: 'ignore' });

    if (fs.existsSync(artifactDir)) {
      fs.copyFileSync(conVozMp4, path.join(artifactDir, 'ISkool_Video_Comercial_Ventas_Con_Voz.mp4'));
    }
    console.log('✅ Updated ISkool_Video_Comercial_Ventas_Con_Voz.mp4 with ElevenLabs-grade Human Voiceover!');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
