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

// 12 Surgical Conversational Sales Scenes aligned with the 147.6s Visual Master Timeline (120s - 150s range)
const SCENES = [
  {
    id: 'scene01',
    title: 'Intro Oficial iSkool® (Ískul) + 5 Pilares y Beneficios Reales + Cortinilla CEO + Resumen Ejecutivo',
    startTime: 0.0,
    endTime: 22.80,
    preWait: 0.60,
    ssmlText: 'Bienvenido a Ískul: el ecosistema educativo integral que conecta en tiempo real a los cinco pilares de tu institución: Directivos, Coordinadores, Docentes, Alumnos y Tutores. Con Ískul multiplicas tu captación, automatizas la planeación pedagógica y elevas la cobranza. En el Portal de Dirección General, controla desde un solo tablero matrícula, asistencia, cobertura curricular y el desempeño de cada plantel.'
  },
  {
    id: 'scene02',
    title: 'Admisión 360° CRM Kanban — Embudo de Captación a Inscripción',
    startTime: 22.80,
    endTime: 34.40,
    preWait: 0.20,
    ssmlText: 'Con Admisión trescientos sesenta, impulsa tu crecimiento escolar. Visualiza cómo cada aspirante avanza desde su registro, visita al campus y diagnóstico psicopedagógico hasta su inscripción pagada, sin perder un solo prospecto.'
  },
  {
    id: 'scene03',
    title: 'Consola de Correo Inteligente & Triage Cognitivo CEO',
    startTime: 34.40,
    endTime: 44.40,
    preWait: 0.20,
    ssmlText: 'Nuestra Consola de Correo con Triage Cognitivo analiza cientos de mensajes diarios, filtra solo los asuntos críticos para dirección y delega el resto a tu equipo, ahorrándote casi cuatro horas cada día.'
  },
  {
    id: 'scene04',
    title: 'Supervisión Docente & Modo Espejo CEO en Tiempo Real',
    startTime: 44.40,
    endTime: 52.60,
    preWait: 0.20,
    ssmlText: 'Y con el Modo Espejo en Vivo, supervisa en tiempo real el avance de cada profesor, su cronómetro pedagógico y la sesión activa en el aula sin interrumpir la clase.'
  },
  {
    id: 'scene05',
    title: 'Cortinilla Portal del Profesor + Daylight Studio Pro en Aula',
    startTime: 52.60,
    endTime: 66.40,
    preWait: 1.10,
    ssmlText: 'En el Portal del Profesor, Ískul ofrece una interfaz clara y sin curva de aprendizaje. Desde su barra lateral, el docente guía su clase con los seis niveles de la Taxonomía de Bloom, calendario histórico de asistencia, sellado digital de libreta y avisos en un clic.'
  },
  {
    id: 'scene06',
    title: 'Generador Curricular SEP NEM 360° & Estudio iSkool de Bloques',
    startTime: 66.40,
    endTime: 78.60,
    preWait: 0.20,
    ssmlText: 'El Generador Curricular permite planear clases en horarios o días diferidos y crear secuencias oficiales de la Nueva Escuela Mexicana en segundos. Y en el Estudio Ískul, el maestro diseña actividades interactivas por bloques listas para proyectar.'
  },
  {
    id: 'scene07',
    title: 'Libro Mágico Interactivo & Personajes Históricos en 1ª Persona',
    startTime: 78.60,
    endTime: 86.90,
    preWait: 0.20,
    ssmlText: 'Además, con el Libro Mágico Interactivo, los alumnos exploran novelas gráficas e interrogan en primera persona a personajes históricos con absoluto rigor documental.'
  },
  {
    id: 'scene08',
    title: 'Cortinilla Portal del Estudiante + Misiones Épicas & Avatares',
    startTime: 86.90,
    endTime: 98.20,
    preWait: 1.10,
    ssmlText: 'En el Portal del Estudiante, cada clase y tarea se convierte en una misión épica. Los alumnos ganan puntos de experiencia, suben de rango y personalizan su avatar exclusivamente mediante su mérito académico.'
  },
  {
    id: 'scene09',
    title: 'Enseñanza de Idiomas & Karaoke Fonético (Cambridge / DELF-DALF / CELTA-DELTA)',
    startTime: 98.20,
    endTime: 110.80,
    preWait: 0.20,
    ssmlText: 'Nuestro Laboratorio de Idiomas combina conversación interactiva con velocidad gradual y karaoke de fluidez fonética palabra por palabra, preparando a tus alumnos en inglés para certificación Cambridge y en francés para DELF y DALF bajo metodología CELTA y DELTA.'
  },
  {
    id: 'scene10',
    title: 'Carrusel Dinámico de 20 Diseños de Gamificación por Nivel Académico',
    startTime: 110.80,
    endTime: 121.30,
    preWait: 0.20,
    ssmlText: 'Contamos con veinte diseños interactivos adaptados a cada etapa escolar: desde experiencias táctiles para preescolar y aventuras en primaria, hasta duelos sincronizados en secundaria y retos preuniversitarios en preparatoria.'
  },
  {
    id: 'scene11',
    title: 'Cortinilla Portal del Padre de Familia + Avisos, Estado de Cuenta y Pagos',
    startTime: 121.30,
    endTime: 133.00,
    preWait: 1.10,
    ssmlText: 'En el Portal del Padre de Familia, los tutores consultan el muro de logros de sus hijos, firman avisos escolares de enterado y liquidan colegiaturas en línea con tarjeta o transferencia y facturación fiscal automática al instante.'
  },
  {
    id: 'scene12',
    title: 'Cierre de Ventas & Agendamiento de Citas con QR Oficial (contacto@iskool.mx / 5611404767 / 5511404767)',
    startTime: 133.00,
    endTime: 148.50,
    preWait: 0.25,
    ssmlText: 'Lleva hoy tu institución educativa al estándar mundial. Escanea el código Q R en pantalla para escribirnos por WhatsApp al cincuenta y seis, once cuarenta, cuarenta y siete, sesenta y siete; llámanos al cincuenta y cinco, once cuarenta, cuarenta y siete, sesenta y siete, o escríbenos a contacto arroba iskool punto eme equis. Ískul: el futuro de la educación, hoy.'
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

    // 1. Convert to 44.1kHz stereo WAV with gentle silence trim at start/end and compact internal pause tightening (>0.24s)
    execFileSync(ffmpegPath, [
      '-y', '-i', rawMp3,
      '-af', 'silenceremove=start_periods=1:start_duration=0.04:start_threshold=-42dB:stop_periods=-1:stop_duration=0.24:stop_threshold=-42dB',
      '-ar', '44100', '-ac', '2',
      wavTrimmed
    ], { stdio: 'ignore' });

    const rawDur = getAudioDuration(wavTrimmed);
    const slotWindow = (s.endTime - s.startTime) - s.preWait - 0.20;
    // Apply dynamic commercial tempo adjustment so the recording fits its visual scene slot cleanly without clipping
    let tempoFactor = 1.0;
    if (rawDur > slotWindow && slotWindow > 2.0) {
      tempoFactor = Math.min(1.42, Number((rawDur / slotWindow).toFixed(3)));
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

  const totalDuration = 148.5;
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
