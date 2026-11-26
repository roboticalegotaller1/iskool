import { execFile, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { synthesizeDirectInstitutionalNeural } from './institutionalNeuralDirect';

interface SynthesizeOptions {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  characterName?: string;
  role?: string;
}

const memoryAudioCache = new Map<string, Buffer>();
const inFlightRequests = new Map<string, Promise<Buffer>>();
const MAX_CACHE_ITEMS = 300;

function writeCacheFileAtomic(targetPath: string, data: Buffer): void {
  try {
    const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(/*turbopackIgnore: true*/ tmpPath, data);
    fs.renameSync(/*turbopackIgnore: true*/ tmpPath, /*turbopackIgnore: true*/ targetPath);
  } catch { }
}

function resolvePythonExecutable(): string {
  const candidates = [
    path.join(process.cwd(), '.venv', 'Scripts', 'python.exe'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ c)) {
      return c;
    }
  }
  return 'python';
}

interface PendingDaemonRequest {
  resolve: (buf: Buffer) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

const WORKER_ENGINE_GENERATION = 'v10_pedagogical_math_fluid_96k';
let daemonProcess: ChildProcessWithoutNullStreams | null = null;
let daemonGeneration = '';
let daemonStdoutBuffer = '';
let daemonSeq = 0;
const pendingRequests = new Map<string, PendingDaemonRequest>();

function getOrStartNeuralDaemon(): ChildProcessWithoutNullStreams | null {
  if (
    daemonProcess &&
    !daemonProcess.killed &&
    daemonProcess.exitCode === null &&
    daemonGeneration === WORKER_ENGINE_GENERATION
  ) {
    return daemonProcess;
  }

  if (daemonProcess && !daemonProcess.killed) {
    try {
      daemonProcess.kill();
    } catch { }
    daemonProcess = null;
  }

  try {
    const workerScript = path.join(process.cwd(), 'scripts', 'neural_tts_worker.py');
    if (!fs.existsSync(/*turbopackIgnore: true*/ workerScript)) {
      return null;
    }
    const pythonBin = resolvePythonExecutable();
    const child = spawn(/*turbopackIgnore: true*/ pythonBin, ['-u', workerScript, '--daemon'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ENABLE_CLOUD_STUDIO_TTS: '0' }
    });
    daemonGeneration = WORKER_ENGINE_GENERATION;

    daemonStdoutBuffer = '';

    child.stdout.setEncoding('utf-8');
    child.stdout.on('data', (chunk: string) => {
      daemonStdoutBuffer += chunk;
      let newlineIdx = daemonStdoutBuffer.indexOf('\n');
      while (newlineIdx !== -1) {
        const line = daemonStdoutBuffer.slice(0, newlineIdx).trim();
        daemonStdoutBuffer = daemonStdoutBuffer.slice(newlineIdx + 1);
        if (line) {
          try {
            const msg = JSON.parse(line);
            const pending = pendingRequests.get(msg.id);
            if (pending) {
              clearTimeout(pending.timer);
              pendingRequests.delete(msg.id);
              if (msg.ok && msg.b64) {
                pending.resolve(Buffer.from(msg.b64, 'base64'));
              } else {
                pending.reject(new Error(msg.error || 'Error en worker daemon TTS'));
              }
            }
          } catch { }
        }
        newlineIdx = daemonStdoutBuffer.indexOf('\n');
      }
    });

    const cleanupAllPending = (err: Error) => {
      for (const [, p] of pendingRequests) {
        clearTimeout(p.timer);
        p.reject(err);
      }
      pendingRequests.clear();
      if (daemonProcess === child) {
        daemonProcess = null;
      }
    };

    child.on('error', (err) => cleanupAllPending(err));
    child.on('exit', (code) => cleanupAllPending(new Error(`Daemon TTS finalizado (${code})`)));

    daemonProcess = child;
    return child;
  } catch {
    return null;
  }
}

// Arranque bajo demanda: se inicia únicamente si el motor WebSocket directo requiere respaldo Python

function synthesizeViaWarmDaemon(options: Required<SynthesizeOptions>): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const child = getOrStartNeuralDaemon();
    if (!child || !child.stdin.writable) {
      return reject(new Error('Daemon TTS no disponible'));
    }

    const reqId = `req_${++daemonSeq}_${Date.now()}`;
    const timer = setTimeout(() => {
      pendingRequests.delete(reqId);
      reject(new Error('Timeout en daemon TTS'));
    }, 3800);

    pendingRequests.set(reqId, { resolve, reject, timer });

    try {
      const line = JSON.stringify({
        id: reqId,
        text: options.text,
        voice: options.voice,
        rate: options.rate,
        pitch: options.pitch,
        characterName: options.characterName,
        role: options.role
      }) + '\n';
      child.stdin.write(line, 'utf-8');
    } catch (writeErr: any) {
      clearTimeout(timer);
      pendingRequests.delete(reqId);
      reject(writeErr);
    }
  });
}

/**
 * Genera audio MP3 neural de alta fidelidad con masterización de estudio.
 */
export async function synthesizeNeuralAudio(options: SynthesizeOptions): Promise<Buffer> {
  const {
    text,
    voice = 'es-MX-DaliaNeural',
    rate = '+0%',
    pitch = '+0Hz',
    characterName = '',
    role = ''
  } = options;

  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Texto vacío para síntesis');
  }

  // Clave de caché v10 (Motor Neuronal Directo 96kbps + Fonética Matemática/Negativos + Entonación Fluida)
  const cacheKey = crypto
    .createHash('sha256')
    .update(`v10_pedagogical_math_fluid_96k::${voice}::${characterName}::${role}::${rate}::${pitch}::${cleanText}`)
    .digest('hex');

  // 1. Verificar caché en memoria
  const memoryHit = memoryAudioCache.get(cacheKey);
  if (memoryHit && memoryHit.length > 0) {
    return memoryHit;
  }

  const inflight = inFlightRequests.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const workPromise = (async (): Promise<Buffer> => {
  // 2. Verificar caché en disco
  const cacheDir = path.join(process.cwd(), '.cache', 'tts_audio');
  if (!fs.existsSync(/*turbopackIgnore: true*/ cacheDir)) {
    fs.mkdirSync(/*turbopackIgnore: true*/ cacheDir, { recursive: true });
  }
  const cachedFilePath = path.join(cacheDir, `${cacheKey}.mp3`);
  if (fs.existsSync(/*turbopackIgnore: true*/ cachedFilePath)) {
    try {
      const diskBuffer = fs.readFileSync(/*turbopackIgnore: true*/ cachedFilePath);
      if (diskBuffer.length > 0) {
        memoryAudioCache.set(cacheKey, diskBuffer);
        return diskBuffer;
      }
    } catch { }
  }

  // 3. Motor Primario Ultra-Rápido Directo en Node.js (96 kbps, IPv4 Keep-Alive, cero subprocesos, 0 Tokens)
  // Nota: synthesizeDirectInstitutionalNeural ya incluye 1 reintento interno inmediato ante 403/jitter.
  let directError: unknown = null;
  try {
    const directBuffer = await synthesizeDirectInstitutionalNeural({
      text: cleanText,
      voice,
      rate,
      pitch,
      timeoutMs: 3500
    });
    if (directBuffer && directBuffer.length > 256) {
      writeCacheFileAtomic(cachedFilePath, directBuffer);
      if (memoryAudioCache.size >= MAX_CACHE_ITEMS) {
        const firstKey = memoryAudioCache.keys().next().value;
        if (firstKey) memoryAudioCache.delete(firstKey);
      }
      memoryAudioCache.set(cacheKey, directBuffer);
      return directBuffer;
    }
  } catch (err) {
    directError = err;
  }

  // En entornos serverless sin intérprete Python local, retornar de inmediato sin colas de subprocesos
  const workerScript = path.join(process.cwd(), 'scripts', 'neural_tts_worker.py');
  if (process.env.VERCEL || !fs.existsSync(/*turbopackIgnore: true*/ workerScript)) {
    throw directError instanceof Error
      ? directError
      : new Error('Síntesis directa no disponible temporalmente');
  }

  // 4. Respaldo rápido en memoria mediante Daemon Persistente Python (acotado a 3.8s)
  let daemonAttempted = false;
  try {
    daemonAttempted = true;
    const daemonBuffer = await synthesizeViaWarmDaemon({
      text: cleanText,
      voice,
      rate,
      pitch,
      characterName,
      role
    });
    if (daemonBuffer && daemonBuffer.length > 0) {
      writeCacheFileAtomic(cachedFilePath, daemonBuffer);
      if (memoryAudioCache.size >= MAX_CACHE_ITEMS) {
        const firstKey = memoryAudioCache.keys().next().value;
        if (firstKey) memoryAudioCache.delete(firstKey);
      }
      memoryAudioCache.set(cacheKey, daemonBuffer);
      return daemonBuffer;
    }
  } catch {
    // Si el daemon ya intentó y falló por red, evitar otro arranque frío en cadena
  }

  if (daemonAttempted) {
    throw directError instanceof Error
      ? directError
      : new Error('Síntesis neural temporalmente agotada');
  }

  // 5. Respaldo por proceso CLI individual (únicamente si el daemon no pudo iniciarse)
  const tempOutputFile = path.join(os.tmpdir(), `iskool_tts_${cacheKey}_${Date.now()}.mp3`);

  // Usar archivo JSON temporal para evitar desbordamiento o problemas de escape de caracteres en CLI
  const payloadFile = path.join(os.tmpdir(), `iskool_payload_${cacheKey}_${Date.now()}.json`);
  fs.writeFileSync(
    /*turbopackIgnore: true*/ payloadFile,
    JSON.stringify({
      text: cleanText,
      voice,
      rate,
      pitch,
      characterName,
      role,
      output: tempOutputFile
    }),
    'utf-8'
  );

  const pythonBin = resolvePythonExecutable();

  return new Promise<Buffer>((resolve, reject) => {
    execFile(
      /*turbopackIgnore: true*/ pythonBin,
      [workerScript, '--json', payloadFile],
      { timeout: 6500, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ENABLE_CLOUD_STUDIO_TTS: '0' } },
      (err, _stdout, stderr) => {
        // Limpieza de payload
        try {
          if (fs.existsSync(/*turbopackIgnore: true*/ payloadFile)) fs.unlinkSync(/*turbopackIgnore: true*/ payloadFile);
        } catch { }

        if (err) {
          try {
            if (fs.existsSync(/*turbopackIgnore: true*/ tempOutputFile)) fs.unlinkSync(/*turbopackIgnore: true*/ tempOutputFile);
          } catch { }
          return reject(new Error(`Fallo en síntesis neural: ${stderr || err.message}`));
        }

        try {
          if (!fs.existsSync(/*turbopackIgnore: true*/ tempOutputFile)) {
            return reject(new Error('El archivo de audio temporal no fue generado'));
          }

          const audioBuffer = fs.readFileSync(/*turbopackIgnore: true*/ tempOutputFile);
          fs.unlinkSync(/*turbopackIgnore: true*/ tempOutputFile);

          if (audioBuffer.length === 0) {
            return reject(new Error('Audio generado con 0 bytes'));
          }

          // Guardar en caché de disco y memoria
          writeCacheFileAtomic(cachedFilePath, audioBuffer);

          if (memoryAudioCache.size >= MAX_CACHE_ITEMS) {
            const firstKey = memoryAudioCache.keys().next().value;
            if (firstKey) memoryAudioCache.delete(firstKey);
          }
          memoryAudioCache.set(cacheKey, audioBuffer);

          resolve(audioBuffer);
        } catch (readErr: any) {
          reject(new Error(`Error al leer buffer generado: ${readErr.message}`));
        }
      }
    );
  });
  })();

  inFlightRequests.set(cacheKey, workPromise);
  try {
    return await workPromise;
  } finally {
    inFlightRequests.delete(cacheKey);
  }
}
