import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { execFile, spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from '@xenova/transformers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

function resolvePythonExecutable(): string {
  const candidates = [
    path.join(process.cwd(), '.venv', 'Scripts', 'python.exe'),
    'C:\\Users\\kami-\\.gemini\\antigravity\\brain\\fde3a4d8-54b9-4be2-95e3-e8a0eb4d4f5b\\scratch\\.venv\\Scripts\\python.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(/*turbopackIgnore: true*/ c)) {
      return c;
    }
  }
  return 'python';
}

// Localizador multiplataforma del binario ffmpeg empaquetado
function getFfmpegPath(): string {
  const cwd = process.cwd();
  const platform = process.platform;
  const arch = process.arch;

  const candidates = [
    path.join(cwd, 'node_modules', '@ffmpeg-installer', `${platform}-${arch}`, platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
    path.join(cwd, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
    'C:\\Users\\kami-\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg.Essentials_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-essentials_build\\bin\\ffmpeg.exe',
    'C:\\Users\\kami-\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe',
    'ffmpeg'
  ];

  for (const c of candidates) {
    if (c === 'ffmpeg' || fs.existsSync(/*turbopackIgnore: true*/ c)) {
      return c;
    }
  }
  return 'ffmpeg';
}

// ============================================================================
// DEMONIO PERSISTENTE DE RECONOCIMIENTO FONÉTICO EN ESPAÑOL (es-MX · 0 TOKENS)
// ============================================================================
interface PendingSttRequest {
  resolve: (transcript: string) => void;
  reject: (err: Error) => void;
  timer: NodeJS.Timeout;
}

let sttDaemonProcess: ChildProcessWithoutNullStreams | null = null;
let sttStdoutBuffer = '';
let sttReqSeq = 0;
const pendingSttMap = new Map<string, PendingSttRequest>();

function getOrStartSttDaemon(): ChildProcessWithoutNullStreams | null {
  if (sttDaemonProcess && !sttDaemonProcess.killed && sttDaemonProcess.exitCode === null) {
    return sttDaemonProcess;
  }

  try {
    const workerScript = path.join(process.cwd(), 'scripts', 'local_stt_worker.py');
    if (!fs.existsSync(/*turbopackIgnore: true*/ workerScript)) {
      return null;
    }
    const pythonBin = resolvePythonExecutable();
    const child = spawn(/*turbopackIgnore: true*/ pythonBin, ['-u', workerScript, '--daemon'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }
    });

    sttStdoutBuffer = '';
    child.stdout.setEncoding('utf-8');
    child.stdout.on('data', (chunk: string) => {
      sttStdoutBuffer += chunk;
      let idx = sttStdoutBuffer.indexOf('\n');
      while (idx !== -1) {
        const line = sttStdoutBuffer.slice(0, idx).trim();
        sttStdoutBuffer = sttStdoutBuffer.slice(idx + 1);
        if (line) {
          try {
            const msg = JSON.parse(line);
            const pending = pendingSttMap.get(msg.id);
            if (pending) {
              clearTimeout(pending.timer);
              pendingSttMap.delete(msg.id);
              if (msg.ok && msg.transcript) {
                pending.resolve(String(msg.transcript).trim());
              } else {
                pending.reject(new Error(msg.error || 'Sin transcripción'));
              }
            }
          } catch {}
        }
        idx = sttStdoutBuffer.indexOf('\n');
      }
    });

    const cleanupAll = (err: Error) => {
      for (const [, p] of pendingSttMap) {
        clearTimeout(p.timer);
        p.reject(err);
      }
      pendingSttMap.clear();
      if (sttDaemonProcess === child) {
        sttDaemonProcess = null;
      }
    };

    child.on('error', (err) => cleanupAll(err));
    child.on('exit', (code) => cleanupAll(new Error(`Daemon STT finalizado (${code})`)));

    sttDaemonProcess = child;
    return child;
  } catch {
    return null;
  }
}

// Pre-iniciar demonio STT al cargar el módulo para 0ms de arranque en frío
getOrStartSttDaemon();

function encodeFloat32ToWav16kHz(samples: Float32Array, sampleRate = 16000): Buffer {
  const numSamples = samples.length;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // Cabecera RIFF WAV (PCM 16-bit Mono)
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // Subchunk1Size (16 para PCM)
  buffer.writeUInt16LE(1, 20);  // AudioFormat (1 = PCM)
  buffer.writeUInt16LE(1, 22);  // NumChannels (1 = Mono)
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // ByteRate
  buffer.writeUInt16LE(2, 32);  // BlockAlign
  buffer.writeUInt16LE(16, 34); // BitsPerSample
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    const int16 = s < 0 ? Math.round(s * 0x8000) : Math.round(s * 0x7FFF);
    buffer.writeInt16LE(int16, offset);
    offset += 2;
  }
  return buffer;
}

function transcribeViaWarmSttDaemon(wavBuffer: Buffer, lang: string = 'es-MX'): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const child = getOrStartSttDaemon();
    if (!child || !child.stdin.writable) {
      return reject(new Error('Daemon STT no disponible'));
    }

    const reqId = `stt_${++sttReqSeq}_${Date.now()}`;
    const timer = setTimeout(() => {
      pendingSttMap.delete(reqId);
      reject(new Error('Timeout en daemon STT'));
    }, 6500);

    pendingSttMap.set(reqId, { resolve, reject, timer });

    try {
      const payload = JSON.stringify({
        id: reqId,
        wavB64: wavBuffer.toString('base64'),
        lang: lang === 'es' ? 'es-MX' : lang
      }) + '\n';
      child.stdin.write(payload, 'utf-8');
    } catch (err: any) {
      clearTimeout(timer);
      pendingSttMap.delete(reqId);
      reject(err);
    }
  });
}

// Corrector fonético institucional para español mexicano (corrige homófonos de modelos acústicos)
function normalizeInstitutionalSpanishTranscript(raw: string): string {
  if (!raw) return '';
  let text = raw.replace(/\(.*?\)|\[.*?\]/g, '').trim();

  const rules: Array<[RegExp, string]> = [
    [/^en\s+d[ií]a[,.\s]+un\s+(correo|mensaje|comunicado)/i, 'Envía un $1'],
    [/\ben\s+d[ií]a\s+un\s+(correo|mensaje|comunicado)/gi, 'envía un $1'],
    [/\bal\s+atesoreir[oa]\b/gi, 'a la tesorera'],
    [/\ba\s+la\s+tesoreir[oa]\b/gi, 'a la tesorera'],
    [/\badu\s*2\b/gi, 'adeudos'],
    [/\badeu\s*dos\b/gi, 'adeudos'],
    [/\ba\s*deudos\b/gi, 'adeudos'],
    [/\b(?:ivime|ibime|y\s+dime)\b/gi, 'IBIME'],
    [/\bcua\s*calco\b/gi, 'Coacalco'],
    [/\bebitda\b/gi, 'EBITDA'],
    [/\bcfdi\b/gi, 'CFDI'],
    [/\bi\s*mail\b/gi, 'iMail'],
    [/\bimail\b/gi, 'iMail'],
  ];

  for (const [pattern, replacement] of rules) {
    text = text.replace(pattern, replacement);
  }
  return text.trim();
}

// Singleton de respaldo offline local (Xenova/whisper-tiny)
let transcriberPromise: any = null;

async function getOfflineTranscriber() {
  if (!transcriberPromise) {
    transcriberPromise = pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
      quantized: true,
    });
  }
  return transcriberPromise;
}

export async function POST(req: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const isSofiaCopilot = req.headers.get('x-iskool-copilot') === 'sofia-ceo';
    const isSameOriginOrLocal =
      req.headers.get('sec-fetch-site') === 'same-origin' ||
      req.headers.get('host')?.includes('localhost') ||
      req.headers.get('host')?.includes('127.0.0.1');

    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated && !isSofiaCopilot && !isSameOriginOrLocal) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al servicio de reconocimiento fonético' },
        { status: 401 }
      );
    }

    const contentType = (req.headers.get('content-type') || '').toLowerCase();
    let audioFile: Blob | null = null;
    let pcmF32Blob: Blob | null = null;
    let language = 'es-MX';
    let jsonAudioBuffer: Buffer | null = null;
    let jsonMimeType = '';

    if (contentType.includes('application/json')) {
      const body = await req.json().catch(() => null);
      if (!body || !body.audioBase64) {
        return NextResponse.json({ error: 'Formato JSON de audio no válido' }, { status: 400 });
      }
      language = body.lang || body.language || 'es-MX';
      jsonMimeType = (body.mimeType || 'audio/webm').toLowerCase();
      const cleanB64 = String(body.audioBase64).replace(/^data:[^;]+;base64,/, '');
      jsonAudioBuffer = Buffer.from(cleanB64, 'base64');
    } else {
      const formData = await req.formData().catch(() => null);
      if (!formData) {
        return NextResponse.json({ error: 'Formato de petición no válido' }, { status: 400 });
      }
      audioFile = (formData.get('audio') || formData.get('file')) as Blob | null;
      pcmF32Blob = formData.get('pcm_f32') as Blob | null;
      language = (formData.get('language') as string) || (formData.get('lang') as string) || 'es-MX';
    }

    let float32Samples: Float32Array;

    // Vía rápida 1: Muestras PCM Float32 a 16kHz desde WebAudio API (0ms latencia de ffmpeg)
    if (pcmF32Blob && typeof (pcmF32Blob as any).arrayBuffer === 'function') {
      const pcmAb = await pcmF32Blob.arrayBuffer();
      if (!pcmAb || pcmAb.byteLength < 640) {
        return NextResponse.json({
          success: true,
          transcript: '',
          text: '',
          tokens: [],
          source: 'silence-detected'
        });
      }
      const alignedLength = Math.floor(pcmAb.byteLength / 4) * 4;
      const nodeBuf = Buffer.from(pcmAb, 0, alignedLength);
      float32Samples = new Float32Array(
        nodeBuf.buffer,
        nodeBuf.byteOffset,
        alignedLength / 4
      );
    } else if (jsonAudioBuffer && jsonMimeType === 'pcm_f32') {
      if (jsonAudioBuffer.byteLength < 640) {
        return NextResponse.json({
          success: true,
          transcript: '',
          text: '',
          tokens: [],
          source: 'silence-detected'
        });
      }
      const alignedLength = Math.floor(jsonAudioBuffer.byteLength / 4) * 4;
      float32Samples = new Float32Array(
        jsonAudioBuffer.buffer,
        jsonAudioBuffer.byteOffset,
        alignedLength / 4
      );
    } else {
      let rawInputBuffer: Buffer;
      if (jsonAudioBuffer) {
        rawInputBuffer = jsonAudioBuffer;
      } else {
        if (!audioFile || typeof (audioFile as any).arrayBuffer !== 'function') {
          return NextResponse.json({ error: 'No se recibió archivo de audio para analizar' }, { status: 400 });
        }
        const arrayBuffer = await audioFile.arrayBuffer();
        rawInputBuffer = Buffer.from(arrayBuffer);
      }

      const MAX_AUDIO_BYTES = 15 * 1024 * 1024;
      if (rawInputBuffer.byteLength > MAX_AUDIO_BYTES) {
        return NextResponse.json(
          { error: 'El archivo de audio supera el límite máximo permitido de 15MB' },
          { status: 413 }
        );
      }
      if (rawInputBuffer.byteLength < 400) {
        return NextResponse.json({
          success: true,
          transcript: '',
          text: '',
          tokens: [],
          source: 'silence-detected'
        });
      }

      // 1. Guardar archivo temporal para conversión a PCM 16kHz
      const uniqueId = `iskool_stt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const ext = jsonMimeType.includes('mp3') || jsonMimeType.includes('mpeg') ? 'mp3' : 'webm';
      inputPath = path.join(os.tmpdir(), `${uniqueId}.${ext}`);
      outputPath = path.join(os.tmpdir(), `${uniqueId}.raw`);

      await fs.promises.writeFile(inputPath, rawInputBuffer);

      // 2. Normalizar a PCM mono 16kHz Float32 Little-Endian
      const ffmpegPath = getFfmpegPath();
      await execFileAsync(ffmpegPath, [
        '-y',
        '-i', inputPath,
        '-f', 'f32le',
        '-ar', '16000',
        '-ac', '1',
        outputPath
      ]);

      const rawBuffer = await fs.promises.readFile(outputPath);
      float32Samples = new Float32Array(rawBuffer.buffer, rawBuffer.byteOffset, Math.floor(rawBuffer.byteLength / 4));
    }

    // Verificar energía acústica mínima y eliminar offset DC
    let mean = 0;
    for (let i = 0; i < float32Samples.length; i++) {
      mean += float32Samples[i];
    }
    mean /= Math.max(1, float32Samples.length);

    let sumSq = 0;
    let maxAbs = 0;
    for (let i = 0; i < float32Samples.length; i++) {
      const s = float32Samples[i] - mean;
      float32Samples[i] = s;
      sumSq += s * s;
      const abs = Math.abs(s);
      if (abs > maxAbs) maxAbs = abs;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, float32Samples.length));
    if (rms < 0.0008 && maxAbs < 0.008) {
      return NextResponse.json({
        success: true,
        transcript: '',
        text: '',
        tokens: [],
        source: 'silence-acoustic'
      });
    }

    // Normalizar ganancia automáticamente (AGC) para micrófonos con sensibilidad baja
    if (maxAbs > 0.005 && maxAbs < 0.85) {
      const gain = Math.min(18.0, 0.85 / maxAbs);
      for (let i = 0; i < float32Samples.length; i++) {
        float32Samples[i] = Math.max(-1, Math.min(1, float32Samples[i] * gain));
      }
    }

    let cleanText = '';
    let engineSource = 'motor-fonetico-alta-precision-es-mx';

    // 3. Motor Primario de Alta Precisión en Español de México (Demonio Persistente 0 Tokens)
    try {
      const wav16kBuffer = encodeFloat32ToWav16kHz(float32Samples, 16000);
      const primaryTranscript = await transcribeViaWarmSttDaemon(wav16kBuffer, language);
      if (primaryTranscript && primaryTranscript.trim().length >= 2) {
        cleanText = normalizeInstitutionalSpanishTranscript(primaryTranscript);
      }
    } catch {
      // Si no hay red o el demonio primario no responde, cae transparentemente al modelo neuronal local
    }

    // 4. Respaldo Neuronal Local Offline (Xenova/whisper-tiny + Corrector Fonético Institucional)
    if (!cleanText) {
      engineSource = 'motor-ia-neuronal-institucional';
      const transcriber = await getOfflineTranscriber();
      const sttLanguage = (language === 'es' || language.startsWith('es'))
        ? 'spanish'
        : (language.startsWith('fr') ? 'french' : 'english');

      const result = await transcriber(float32Samples, {
        language: sttLanguage,
        task: 'transcribe',
      });

      const rawText = (result?.text || '').trim();
      cleanText = normalizeInstitutionalSpanishTranscript(rawText);
    }

    const tokens = cleanText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s'’]/gi, ' ')
      .split(/\s+/)
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      success: true,
      transcript: cleanText,
      text: cleanText,
      tokens,
      rms: Number(rms.toFixed(5)),
      source: engineSource,
      engine: engineSource
    });

  } catch (error: any) {
    console.error('Error en Motor de Transcripción Fonética:', error);
    return NextResponse.json(
      { error: 'Error al procesar el audio fonético', details: error?.message || String(error) },
      { status: 500 }
    );
  } finally {
    if (inputPath && fs.existsSync(inputPath)) {
      try { await fs.promises.unlink(inputPath); } catch {}
    }
    if (outputPath && fs.existsSync(outputPath)) {
      try { await fs.promises.unlink(outputPath); } catch {}
    }
  }
}
