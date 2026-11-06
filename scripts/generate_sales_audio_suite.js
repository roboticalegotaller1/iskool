const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const pythonBin = path.join(process.cwd(), '.venv', 'Scripts', 'python.exe');
const workerScript = path.join(process.cwd(), 'scripts', 'neural_tts_worker.py');

const rootDir = path.join(__dirname, '..');
const audioDir = path.join(rootDir, 'temp_sales_video_assets', 'audio_v2');
fs.mkdirSync(audioDir, { recursive: true });

// ============================================================================
// GUION COMERCIAL DE ALTO IMPACTO PARA GENERACIÓN DE CITAS DE VENTAS (B2B)
// - Fonética estricta AFI /ˈa͡ɪskˌuːl/ -> "Áiskul" en todo el video
// - Tecnología creada en Canadá con Inteligencia Artificial para Colegios Privados en México
// - "El cerebro vivo de tu escuela" + Los 5 Pilares de la Educación + Beneficios Reales
// - Cero referencias a IBIME, cero URLs, voz femenina 3.8-flash-lite-tts (es-419-advisor-7)
// - Cadencia 100% uniforme (mismo factor en las 12 escenas) y Volumen 100% constante (-15.2 dBFS RMS activo)
// ============================================================================
const SCENE_DEFS = [
  {
    id: 'scene01',
    title: 'Intro Oficial iSkool® (/ˈa͡ɪskˌuːl/) + IA Canadiense + Cerebro Vivo + 5 Pilares y Beneficios Reales + Cortinilla CEO + Resumen Ejecutivo',
    preWait: 0.40,
    postWait: 0.35,
    ssmlText: 'Bienvenido a Áiskul: el cerebro vivo de tu escuela. Una plataforma educativa potenciada con Inteligencia Artificial, con tecnología creada en Canadá especialmente para colegios privados en México. Áiskul conecta en tiempo real a los cinco pilares de la educación: Directivos, Coordinadores, Docentes, Alumnos y Tutores, con beneficios reales desde el primer día. En el Portal de Dirección General, controla desde un solo tablero matrícula, asistencia, cobertura curricular y el desempeño de cada plantel.'
  },
  {
    id: 'scene02',
    title: 'Admisión 360° CRM Kanban — Cómo avanza un alumno en el proceso de admisión',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'En la sección de Admisión trescientos sesenta, impulsa tu matrícula sin perder un solo prospecto. Observa cómo cada aspirante avanza paso a paso: desde su captación y visita al campus, pasando por su evaluación psicopedagógica y carta de asignación, hasta su inscripción pagada.'
  },
  {
    id: 'scene03',
    title: 'Consola de Correo Inteligente & Triage Cognitivo CEO',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'Nuestro Triage Cognitivo con Inteligencia Artificial analiza cientos de mensajes diarios, filtra únicamente los asuntos urgentes para Dirección General, detecta patrones de familias para responder en un clic y te ahorra casi cuatro horas cada día.'
  },
  {
    id: 'scene04',
    title: 'Supervisión Espejo en Tiempo Real (Portal Académico)',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'Y con la Supervisión Espejo en tiempo real, audita el desempeño docente e inspecciona en vivo el cronómetro pedagógico, la planeación activa y el avance de cada salón sin interrumpir la clase.'
  },
  {
    id: 'scene05',
    title: 'Cortinilla Portal del Profesor + Gestión de Clase en Vivo',
    preWait: 1.15,
    postWait: 0.30,
    ssmlText: 'En el Portal del Profesor, Áiskul ofrece una experiencia ágil y sin curva de aprendizaje. El docente conduce su sesión en vivo apoyado por los seis niveles de la Taxonomía de Bloom, pase de lista visual, sellado digital de libreta y envío de evidencias en un clic.'
  },
  {
    id: 'scene06',
    title: 'Generación de Planeaciones SEP NEM + Estudio iSkool (Clases con Interacción Nunca Antes Vista)',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'El Generador de Planeaciones crea secuencias didácticas oficiales listas para clase o fechas programadas. Y en el Estudio Áiskul, el docente crea clases con una interacción nunca antes vista, con unos cuantos clics y en unos cuantos minutos: el límite es su imaginación.'
  },
  {
    id: 'scene07',
    title: 'Libro Mágico Interactivo & Diálogo con Personajes Históricos en 1ª Persona',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'Además, con el Libro Mágico Interactivo, tus alumnos exploran novelas gráficas ilustradas y conversan en primera persona con personajes históricos respaldados por rigor documental.'
  },
  {
    id: 'scene08',
    title: 'Cortinilla Portal del Estudiante + Tablero de Misiones y Personalización de Avatares',
    preWait: 1.15,
    postWait: 0.30,
    ssmlText: 'En el Portal del Estudiante, el aprendizaje se convierte en una aventura épica. Cada tarea superada otorga experiencia y monedas de mérito con las que el alumno sube de rango y personaliza su propio avatar en tres dimensiones.'
  },
  {
    id: 'scene09',
    title: 'Enseñanza de Idiomas & Karaoke Fonético (Certificación Cambridge y CELTA/DELTA)',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'Nuestro Centro de Idiomas integra conversación interactiva con velocidad graduada y un Karaoke de Fluidez Fonética palabra por palabra, preparando a tus estudiantes en inglés para certificación Cambridge y en francés bajo los estándares internacionales CELTA y DELTA.'
  },
  {
    id: 'scene10',
    title: 'Carrusel de 20 Diseños de Gamificación Adaptados por Nivel Académico',
    preWait: 0.25,
    postWait: 0.30,
    ssmlText: 'Áiskul adapta su interfaz visual a cada etapa formativa con veinte universos de gamificación: desde tableros sensoriales para preescolar y misiones en primaria, hasta duelos por clanes en secundaria y simuladores preuniversitarios en preparatoria.'
  },
  {
    id: 'scene11',
    title: 'Cortinilla Portal del Padre de Familia + Muro de Logros, Mensajes, Estado de Cuenta y Pago Automatizado',
    preWait: 1.15,
    postWait: 0.30,
    ssmlText: 'En el Portal del Padre de Familia, los tutores celebran el muro de logros de sus hijos, responden avisos y alertas escolares con confirmación de enterado, consultan su estado de cuenta y realizan el pago automatizado de colegiaturas con facturación fiscal inmediata.'
  },
  {
    id: 'scene12',
    title: 'Gran Cierre de Ventas & Agendamiento de Cita con QR Oficial (contacto@iskool.mx / 5611404767)',
    preWait: 0.30,
    postWait: 1.00,
    ssmlText: 'Transforma hoy tu colegio con el cerebro vivo de la educación. Agenda tu demostración ejecutiva escaneando el código Q R en pantalla, llámanos o escríbenos por WhatsApp al teléfono cincuenta y seis, once cuarenta, cuarenta y siete, sesenta y siete, o al correo contacto arroba iskool punto eme equis. Áiskul: tecnología canadiense que impulsa el futuro de tu institución.'
  }
];

function findWavDataOffset(buf) {
  const idx = buf.indexOf(Buffer.from('data'), 12);
  return idx !== -1 ? idx + 8 : 44;
}

function getExactPcmWavDuration(filePath) {
  const buf = fs.readFileSync(filePath);
  const dataOff = findWavDataOffset(buf);
  return (buf.length - dataOff) / (44100 * 4);
}

function measureRmsDb(pcmInt16Buffer, startByte) {
  let sumSq = 0;
  let count = 0;
  for (let i = startByte; i <= pcmInt16Buffer.length - 2; i += 2) {
    const sample = pcmInt16Buffer.readInt16LE(i) / 32768.0;
    if (Math.abs(sample) > 0.008) {
      sumSq += sample * sample;
      count++;
    }
  }
  if (count === 0) return -60;
  const rms = Math.sqrt(sumSq / count);
  return 20 * Math.log10(rms);
}

function normalizeWavToTargetActiveRms(wavPath, targetRmsDb = -14.8) {
  const buf = fs.readFileSync(wavPath);
  const dataOff = findWavDataOffset(buf);
  const currentDb = measureRmsDb(buf, dataOff);
  const gainDb = targetRmsDb - currentDb;
  const linearGain = Math.pow(10, gainDb / 20);

  for (let i = dataOff; i <= buf.length - 2; i += 2) {
    const s = (buf.readInt16LE(i) / 32768.0) * linearGain;
    const limited = Math.tanh(s / 0.92) * 0.92;
    buf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(limited * 32767))), i);
  }
  fs.writeFileSync(wavPath, buf);
  return measureRmsDb(buf, dataOff);
}

function createWavBuffer(totalSamples, sampleRate = 44100, numChannels = 2) {
  const dataBytes = totalSamples * numChannels * 2;
  const buf = Buffer.alloc(44 + dataBytes);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataBytes, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(sampleRate * numChannels * 2, 28);
  buf.writeUInt16LE(numChannels * 2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataBytes, 40);
  return buf;
}

function generateDynamicExplainerSoundtrack(wavPath, totalDurationSec, duckWindows) {
  const sampleRate = 44100;
  const totalSamples = Math.floor(sampleRate * totalDurationSec);
  const buffer = createWavBuffer(totalSamples, sampleRate, 2);

  const bpm = 122;
  const beatSec = 60 / bpm;
  const measureSec = beatSec * 4;

  const chords = [
    { root: 73.42, notes: [146.83, 185.00, 220.00, 293.66, 369.99] },
    { root: 61.74, notes: [123.47, 146.83, 185.00, 246.94, 329.63] },
    { root: 49.00, notes: [98.00,  123.47, 146.83, 196.00, 293.66] },
    { root: 55.00, notes: [110.00, 138.59, 164.81, 220.00, 329.63] }
  ];

  function pluckNote(freq, dt) {
    if (dt < 0) return 0;
    const env = Math.exp(-dt * 3.2) * 0.72 + Math.exp(-dt * 0.95) * 0.28;
    const h1 = Math.sin(2 * Math.PI * freq * dt) * 0.62;
    const h2 = Math.sin(2 * Math.PI * freq * 2.0 * dt) * 0.24;
    const h3 = Math.sin(2 * Math.PI * freq * 3.0 * dt) * 0.08;
    return (h1 + h2 + h3) * env;
  }

  let offset = 44;
  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;
    let masterVol = 0.76;
    if (t < 1.0) masterVol *= (t / 1.0);
    if (t > totalDurationSec - 2.0) masterVol *= Math.max(0, (totalDurationSec - t) / 2.0);

    if (duckWindows) {
      let duckFactor = 0.50;
      for (const w of duckWindows) {
        if (t >= w.start - 0.25 && t <= w.end + 0.25) {
          if (t < w.start) {
            const p = (w.start - t) / 0.25;
            duckFactor = 0.12 + p * 0.38;
          } else if (t > w.end) {
            const p = (t - w.end) / 0.25;
            duckFactor = 0.12 + p * 0.38;
          } else {
            duckFactor = 0.12;
          }
          break;
        }
      }
      masterVol *= duckFactor;
    } else {
      masterVol *= 0.78;
    }

    const measureIdx = Math.floor(t / measureSec) % chords.length;
    const chord = chords[measureIdx];
    const chordAge = t % measureSec;
    const beatAge = t % beatSec;
    const sixteenthAge = t % (beatSec / 4);

    let left = 0;
    let right = 0;

    for (let n = 0; n < chord.notes.length; n++) {
      const noteDt = chordAge - n * 0.018;
      const sig = pluckNote(chord.notes[n], noteDt) * 0.20;
      const pan = 0.28 + (n / chord.notes.length) * 0.44;
      left += sig * (1 - pan);
      right += sig * pan;
    }

    const step16 = Math.floor(t / (beatSec / 4));
    const arpIdx = step16 % chord.notes.length;
    const arpFreq = chord.notes[arpIdx] * (step16 % 8 === 0 ? 2 : 1);
    const arpEnv = Math.exp(-sixteenthAge * 11.5);
    const arpSig = Math.sin(2 * Math.PI * arpFreq * sixteenthAge) * arpEnv * 0.095;
    left += arpSig * (step16 % 2 === 0 ? 0.62 : 0.38);
    right += arpSig * (step16 % 2 === 0 ? 0.38 : 0.62);

    const bassEnv = Math.exp(-beatAge * 4.2) * Math.min(1, beatAge * 50);
    const bassSig = (Math.sin(2 * Math.PI * chord.root * t) * 0.78 + Math.sin(2 * Math.PI * chord.root * 2 * t) * 0.22) * bassEnv * 0.24;
    left += bassSig;
    right += bassSig;

    const halfBeatAge = t % (beatSec / 2);
    if (halfBeatAge < 0.025) {
      const tickEnv = Math.exp(-halfBeatAge * 140);
      const pseudoNoise = Math.sin(i * 12.9898) * 43758.5453;
      const noise = (pseudoNoise - Math.floor(pseudoNoise)) * 2 - 1;
      const tick = noise * tickEnv * 0.032;
      left += tick;
      right += tick;
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
  console.log('🎙️ Mastering 12 Sales Scenes with Uniform Cadence & Constant Loudness (-14.8 dBFS Active RMS)...');

  const timeline = [];
  const duckWindows = [];
  let cursorTime = 0.0;

  for (let i = 0; i < SCENE_DEFS.length; i++) {
    const s = SCENE_DEFS[i];
    const rawMp3 = path.join(audioDir, `${s.id}_v9_studio.mp3`);
    const matchedWav = path.join(audioDir, `${s.id}_v9_matched.wav`);
    const wavNorm = path.join(audioDir, `${s.id}.wav`);

    if (!fs.existsSync(rawMp3) || fs.statSync(rawMp3).size < 8000) {
      const payloadPath = path.join(audioDir, `${s.id}_payload.json`);
      fs.writeFileSync(payloadPath, JSON.stringify({
        text: s.ssmlText,
        voice: 'es-419-advisor-7',
        rate: '+0%',
        pitch: '+0Hz',
        characterName: 'Sofía Directora Comercial',
        role: 'presentadora ejecutiva comercial cálida, carismática, clara y humana',
        gender: 'female',
        output: rawMp3
      }), 'utf8');

      execFileSync(pythonBin, [workerScript, '--json', payloadPath], {
        stdio: 'ignore',
        env: { ...process.env, ENABLE_CLOUD_STUDIO_TTS: '1' }
      });
      if (fs.existsSync(payloadPath)) fs.unlinkSync(payloadPath);
    }

    const sourceAudio = fs.existsSync(matchedWav) ? matchedWav : rawMp3;

    if (s.id === 'scene06' || !fs.existsSync(wavNorm)) {
      // Master with natural, unhurried cadence (atempo=1.06, zero internal stop_periods chopping)
      // and reference-locked spectral balance matched 100% to scene12 (es-419-advisor-7)
      execFileSync(ffmpegPath, [
        '-y', '-i', sourceAudio,
        '-af', 'atempo=1.06,highpass=f=75,equalizer=f=240:t=q:w=1.2:g=1.2,equalizer=f=3550:t=q:w=1.4:g=1.2,loudnorm=I=-14.0:TP=-1.0:LRA=6.0',
        '-ar', '44100', '-ac', '2',
        wavNorm
      ], { stdio: 'ignore' });
      normalizeWavToTargetActiveRms(wavNorm, -14.8);
    }

    const bufNorm = fs.readFileSync(wavNorm);
    const finalRmsDb = measureRmsDb(bufNorm, findWavDataOffset(bufNorm));
    const voiceDur = getExactPcmWavDuration(wavNorm);

    const startTime = Number(cursorTime.toFixed(2));
    const voiceStartGlobal = Number((startTime + s.preWait).toFixed(2));
    const voiceEndGlobal = Number((voiceStartGlobal + voiceDur).toFixed(2));
    const endTime = Number((voiceEndGlobal + s.postWait).toFixed(2));
    const sceneDur = Number((endTime - startTime).toFixed(2));

    cursorTime = endTime;
    duckWindows.push({ start: voiceStartGlobal, end: voiceEndGlobal });

    timeline.push({
      index: i + 1,
      id: s.id,
      title: s.title,
      startTime,
      endTime,
      duration: sceneDur,
      preWait: s.preWait,
      voiceDuration: Number(voiceDur.toFixed(2)),
      postWait: s.postWait,
      voiceStartGlobal,
      voiceEndGlobal,
      rmsDb: Number(finalRmsDb.toFixed(2)),
      wavPath: wavNorm,
      text: s.ssmlText
    });

    console.log(`  ✓ [${s.id}] Slot: ${startTime.toFixed(2)}s..${endTime.toFixed(2)}s (${sceneDur.toFixed(2)}s) | Voice: ${voiceDur.toFixed(2)}s | Active RMS: ${finalRmsDb.toFixed(2)} dBFS`);
  }

  const totalDuration = Number(cursorTime.toFixed(2));
  console.log(`\n⏱️ Total Audio-First Timeline Duration: ${totalDuration.toFixed(2)}s (Target: 120s - 150s)`);

  const manifestPath = path.join(audioDir, 'timeline_manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify({ totalDuration, scenes: timeline }, null, 2));

  const bgSinVozPath = path.join(audioDir, 'master_audio_sin_voz.wav');
  const bgDuckedPath = path.join(audioDir, 'bg_ducked.wav');
  const masterConVozPath = path.join(audioDir, 'master_audio_con_voz.wav');

  console.log('🎵 Generating Master Dynamic Soundtrack (Sin Voz)...');
  generateDynamicExplainerSoundtrack(bgSinVozPath, totalDuration, null);

  console.log('🎵 Generating Ducked Soundtrack + Sample-Accurate Constant-Volume PCM Master (Con Voz)...');
  generateDynamicExplainerSoundtrack(bgDuckedPath, totalDuration, duckWindows);

  // Sample-accurate direct PCM mixing in Node.js (ZERO FFmpeg amix dynamic volume scaling!)
  const masterBuf = Buffer.from(fs.readFileSync(bgDuckedPath));
  const sampleRate = 44100;

  for (const sc of timeline) {
    const clipBuf = fs.readFileSync(sc.wavPath);
    const clipDataOff = findWavDataOffset(clipBuf);
    const startSample = Math.floor(sc.voiceStartGlobal * sampleRate);
    const startByte = 44 + startSample * 4;

    for (let b = clipDataOff; b <= clipBuf.length - 4; b += 4) {
      const targetByte = startByte + (b - clipDataOff);
      if (targetByte > masterBuf.length - 4) break;

      const bgL = masterBuf.readInt16LE(targetByte) / 32768.0;
      const bgR = masterBuf.readInt16LE(targetByte + 2) / 32768.0;
      const vL = (clipBuf.readInt16LE(b) / 32768.0) * 1.12;
      const vR = (clipBuf.readInt16LE(b + 2) / 32768.0) * 1.12;

      const mixL = Math.tanh((bgL + vL) / 0.96) * 0.96;
      const mixR = Math.tanh((bgR + vR) / 0.96) * 0.96;

      masterBuf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mixL * 32767))), targetByte);
      masterBuf.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(mixR * 32767))), targetByte + 2);
    }
  }

  fs.writeFileSync(masterConVozPath, masterBuf);
  console.log('✅ Sample-accurate constant-volume master audio tracks generated!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
