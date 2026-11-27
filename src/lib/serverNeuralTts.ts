import { execFile, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import { synthesizeDirectInstitutionalNeural } from './institutionalNeuralDirect';

export interface SynthesizeOptions {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
  characterName?: string;
  role?: string;
}

export interface SynthesizeNeuralResult {
  buffer: Buffer;
  cacheHit: boolean;
  cacheSource: 'memory' | 'disk' | 'synth';
}

const memoryAudioCache = new Map<string, Buffer>();
const inFlightRequests = new Map<string, Promise<SynthesizeNeuralResult>>();
const MAX_CACHE_ITEMS = 300;
const MAX_DISK_CACHE_FILES = 250;
const MAX_DISK_CACHE_BYTES = 40 * 1024 * 1024; // 40 MB
const DISK_PRUNE_INTERVAL_WRITES = 10;

let resolvedCacheDir: string | null | undefined;
let diskWritesSincePrune = 0;
let isPruningDiskCache = false;

function getMemoryCacheLru(cacheKey: string): Buffer | null {
  const hit = memoryAudioCache.get(cacheKey);
  if (!hit || hit.length === 0) return null;
  // Promover a más reciente (LRU real)
  memoryAudioCache.delete(cacheKey);
  memoryAudioCache.set(cacheKey, hit);
  return hit;
}

function setMemoryCacheLru(cacheKey: string, data: Buffer): void {
  if (memoryAudioCache.has(cacheKey)) {
    memoryAudioCache.delete(cacheKey);
  } else if (memoryAudioCache.size >= MAX_CACHE_ITEMS) {
    const oldestKey = memoryAudioCache.keys().next().value;
    if (oldestKey) memoryAudioCache.delete(oldestKey);
  }
  memoryAudioCache.set(cacheKey, data);
}

function resolveWritableCacheDir(): string | null {
  if (resolvedCacheDir !== undefined) return resolvedCacheDir;

  const candidates: string[] = [];
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
    candidates.push(path.join(process.cwd(), '.cache', 'tts_audio'));
  }
  candidates.push(path.join(os.tmpdir(), 'iskool-tts-cache'));

  for (const dir of candidates) {
    try {
      if (!fs.existsSync(/*turbopackIgnore: true*/ dir)) {
        fs.mkdirSync(/*turbopackIgnore: true*/ dir, { recursive: true });
      }
      fs.accessSync(/*turbopackIgnore: true*/ dir, fs.constants.W_OK);
      resolvedCacheDir = dir;
      return dir;
    } catch {
      // Continuar al respaldo temporal (os.tmpdir) si el sistema de archivos es de solo lectura (EROFS)
    }
  }

  resolvedCacheDir = null;
  return null;
}

async function pruneDiskCacheAsync(cacheDir: string): Promise<void> {
  if (isPruningDiskCache) return;
  isPruningDiskCache = true;
  try {
    const entries = await fs.promises.readdir(/*turbopackIgnore: true*/ cacheDir);
    const now = Date.now();
    const mp3Files: Array<{ fullPath: string; size: number; mtimeMs: number }> = [];
    let totalBytes = 0;

    for (const name of entries) {
      const fullPath = path.join(cacheDir, name);
      try {
        const stat = await fs.promises.stat(/*turbopackIgnore: true*/ fullPath);
        if (!stat.isFile()) continue;
        if (name.endsWith('.tmp') && now - stat.mtimeMs > 5 * 60 * 1000) {
          await fs.promises.unlink(/*turbopackIgnore: true*/ fullPath).catch(() => {});
          continue;
        }
        if (name.endsWith('.mp3')) {
          totalBytes += stat.size;
          mp3Files.push({ fullPath, size: stat.size, mtimeMs: stat.mtimeMs });
        }
      } catch { }
    }

    if (mp3Files.length <= MAX_DISK_CACHE_FILES && totalBytes <= MAX_DISK_CACHE_BYTES) {
      return;
    }

    // Desalojar los archivos menos recientemente usados hasta quedar al 85% del tope
    mp3Files.sort((a, b) => a.mtimeMs - b.mtimeMs);
    const targetFiles = Math.floor(MAX_DISK_CACHE_FILES * 0.85);
    const targetBytes = Math.floor(MAX_DISK_CACHE_BYTES * 0.85);
    let remainingFiles = mp3Files.length;
    let remainingBytes = totalBytes;

    for (const file of mp3Files) {
      if (remainingFiles <= targetFiles && remainingBytes <= targetBytes) break;
      try {
        await fs.promises.unlink(/*turbopackIgnore: true*/ file.fullPath);
        remainingFiles--;
        remainingBytes = Math.max(0, remainingBytes - file.size);
      } catch { }
    }
  } catch {
    // Nunca propagar errores de mantenimiento en disco
  } finally {
    isPruningDiskCache = false;
  }
}

function writeCacheFileAtomic(cacheDir: string | null, cacheKey: string, data: Buffer): void {
  if (!cacheDir) return;
  const targetPath = path.join(cacheDir, `${cacheKey}.mp3`);
  const tmpPath = `${targetPath}.${process.pid}.${Date.now()}.tmp`;
  try {
    fs.writeFileSync(/*turbopackIgnore: true*/ tmpPath, data);
    fs.renameSync(/*turbopackIgnore: true*/ tmpPath, /*turbopackIgnore: true*/ targetPath);
    diskWritesSincePrune++;
    if (diskWritesSincePrune === 1 || diskWritesSincePrune >= DISK_PRUNE_INTERVAL_WRITES) {
      diskWritesSincePrune = 0;
      void pruneDiskCacheAsync(cacheDir);
    }
  } catch {
    try {
      if (fs.existsSync(/*turbopackIgnore: true*/ tmpPath)) {
        fs.unlinkSync(/*turbopackIgnore: true*/ tmpPath);
      }
    } catch { }
  }
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
 * Genera audio MP3 neural de alta fidelidad con metadatos de caché unificada (RAM LRU + disco acotado).
 */
export async function synthesizeNeuralAudioWithMeta(options: SynthesizeOptions): Promise<SynthesizeNeuralResult> {
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

  // Clave canónica v10 (Motor Neuronal Directo 96kbps + Fonética Matemática/Negativos + Entonación Fluida)
  // Sin fragmentación por metadatos que no alteran la síntesis neuronal subyacente
  const cacheKey = crypto
    .createHash('sha256')
    .update(`${WORKER_ENGINE_GENERATION}::${voice}::${rate}::${pitch}::${cleanText}`)
    .digest('hex');

  // 1. Verificar caché LRU unificada en memoria
  const memoryHit = getMemoryCacheLru(cacheKey);
  if (memoryHit) {
    return { buffer: memoryHit, cacheHit: true, cacheSource: 'memory' };
  }

  const inflight = inFlightRequests.get(cacheKey);
  if (inflight) {
    return inflight;
  }

  const workPromise = (async (): Promise<SynthesizeNeuralResult> => {
    // 2. Verificar caché en disco (con respaldo automático a os.tmpdir() para evitar EROFS en Serverless)
    const cacheDir = resolveWritableCacheDir();
    if (cacheDir) {
      const cachedFilePath = path.join(cacheDir, `${cacheKey}.mp3`);
      try {
        if (fs.existsSync(/*turbopackIgnore: true*/ cachedFilePath)) {
          const diskBuffer = fs.readFileSync(/*turbopackIgnore: true*/ cachedFilePath);
          if (diskBuffer.length > 0) {
            try {
              const now = new Date();
              fs.utimesSync(/*turbopackIgnore: true*/ cachedFilePath, now, now);
            } catch { }
            setMemoryCacheLru(cacheKey, diskBuffer);
            return { buffer: diskBuffer, cacheHit: true, cacheSource: 'disk' };
          }
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
        writeCacheFileAtomic(cacheDir, cacheKey, directBuffer);
        setMemoryCacheLru(cacheKey, directBuffer);
        return { buffer: directBuffer, cacheHit: false, cacheSource: 'synth' };
      }
    } catch (err) {
      directError = err;
    }

    // En entornos serverless sin intérprete Python local, retornar de inmediato sin colas de subprocesos
    const workerScript = path.join(process.cwd(), 'scripts', 'neural_tts_worker.py');
    let hasWorkerScript = false;
    try {
      hasWorkerScript = fs.existsSync(/*turbopackIgnore: true*/ workerScript);
    } catch { }
    if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || !hasWorkerScript) {
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
        writeCacheFileAtomic(cacheDir, cacheKey, daemonBuffer);
        setMemoryCacheLru(cacheKey, daemonBuffer);
        return { buffer: daemonBuffer, cacheHit: false, cacheSource: 'synth' };
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

    return new Promise<SynthesizeNeuralResult>((resolve, reject) => {
      execFile(
        /*turbopackIgnore: true*/ pythonBin,
        [workerScript, '--json', payloadFile],
        { timeout: 6500, env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1', ENABLE_CLOUD_STUDIO_TTS: '0' } },
        (err, _stdout, stderr) => {
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
            try { fs.unlinkSync(/*turbopackIgnore: true*/ tempOutputFile); } catch { }

            if (audioBuffer.length === 0) {
              return reject(new Error('Audio generado con 0 bytes'));
            }

            writeCacheFileAtomic(cacheDir, cacheKey, audioBuffer);
            setMemoryCacheLru(cacheKey, audioBuffer);

            resolve({ buffer: audioBuffer, cacheHit: false, cacheSource: 'synth' });
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

/**
 * Genera audio MP3 neural de alta fidelidad con masterización de estudio.
 */
export async function synthesizeNeuralAudio(options: SynthesizeOptions): Promise<Buffer> {
  const result = await synthesizeNeuralAudioWithMeta(options);
  return result.buffer;
}
