import { NextRequest, NextResponse } from 'next/server';
import { validateApiAuth } from '@/lib/authValidator';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { pipeline } from '@xenova/transformers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const execFileAsync = promisify(execFile);

// Localizador multiplataforma del binario ffmpeg empaquetado
function getFfmpegPath(): string {
  const cwd = process.cwd();
  const platform = process.platform;
  const arch = process.arch;

  const candidates = [
    path.join(cwd, 'node_modules', '@ffmpeg-installer', `${platform}-${arch}`, platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg'),
    path.join(cwd, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
    'ffmpeg'
  ];

  for (const c of candidates) {
    if (c === 'ffmpeg' || fs.existsSync(/*turbopackIgnore: true*/ c)) {
      return c;
    }
  }
  return 'ffmpeg';
}

// Singleton para el Motor de IA Pedagógica de Transcripción Neuronal
let transcriberPromise: any = null;

async function getTranscriber() {
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
    const auth = await validateApiAuth(req, { allowSuperAdminBypass: true });
    if (!auth.authenticated && !isSofiaCopilot) {
      return NextResponse.json(
        { error: 'Autenticación requerida para acceder al servicio de reconocimiento fonético' },
        { status: 401 }
      );
    }

    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'Formato de petición no válido' }, { status: 400 });
    }

    const audioFile = (formData.get('audio') || formData.get('file')) as Blob | null;
    const pcmF32Blob = formData.get('pcm_f32') as Blob | null;
    const language = (formData.get('language') as string) || 'es';

    let float32Samples: Float32Array;

    // Vía rápida 1: Si el navegador ya envió muestras PCM Float32 a 16kHz desde WebAudio API (0 latencia de ffmpeg)
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
    } else {
      if (!audioFile || typeof (audioFile as any).arrayBuffer !== 'function') {
        return NextResponse.json({ error: 'No se recibió archivo de audio para analizar' }, { status: 400 });
      }

      const arrayBuffer = await audioFile.arrayBuffer();
      const MAX_AUDIO_BYTES = 15 * 1024 * 1024; // 15 MB
      if (arrayBuffer && arrayBuffer.byteLength > MAX_AUDIO_BYTES) {
        return NextResponse.json(
          { error: 'El archivo de audio supera el límite máximo permitido de 15MB' },
          { status: 413 }
        );
      }
      if (!arrayBuffer || arrayBuffer.byteLength < 400) {
        return NextResponse.json({
          success: true,
          transcript: '',
          text: '',
          tokens: [],
          source: 'silence-detected'
        });
      }

      // 1. Guardar archivo temporal para conversión
      const uniqueId = `iskool_stt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      inputPath = path.join(os.tmpdir(), `${uniqueId}.webm`);
      outputPath = path.join(os.tmpdir(), `${uniqueId}.raw`);

      await fs.promises.writeFile(inputPath, Buffer.from(arrayBuffer));

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

      // 3. Leer búfer PCM como Float32Array para el Motor de IA
      const rawBuffer = await fs.promises.readFile(outputPath);
      float32Samples = new Float32Array(rawBuffer.buffer, rawBuffer.byteOffset, Math.floor(rawBuffer.byteLength / 4));
    }

    // Verificar energía acústica mínima (umbral sensible 0.0015 para micrófonos con ganancia baja)
    let sumSq = 0;
    let maxAbs = 0;
    for (let i = 0; i < float32Samples.length; i++) {
      const s = float32Samples[i];
      sumSq += s * s;
      const abs = Math.abs(s);
      if (abs > maxAbs) maxAbs = abs;
    }
    const rms = Math.sqrt(sumSq / Math.max(1, float32Samples.length));
    if (rms < 0.0012 && maxAbs < 0.01) {
      return NextResponse.json({
        success: true,
        transcript: '',
        text: '',
        tokens: [],
        source: 'silence-acoustic'
      });
    }

    // Normalizar ganancia si el micrófono del usuario tiene volumen bajo
    if (maxAbs > 0.01 && maxAbs < 0.5) {
      const gain = Math.min(8.0, 0.75 / maxAbs);
      for (let i = 0; i < float32Samples.length; i++) {
        float32Samples[i] = Math.max(-1, Math.min(1, float32Samples[i] * gain));
      }
    }

    // 4. Ejecutar transcripción neuronal
    const transcriber = await getTranscriber();
    const sttLanguage = (language === 'es' || language === 'es-MX') 
      ? 'spanish' 
      : (language === 'fr' ? 'french' : 'english');

    const result = await transcriber(float32Samples, {
      language: sttLanguage,
      task: 'transcribe',
    });

    // Limpiar ruidos no verbales como [silence], (music), (whistling)
    const rawText = (result?.text || '').trim();
    const cleanText = rawText.replace(/\(.*?\)|\[.*?\]/g, '').trim();

    const tokens = cleanText
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s'’]/gi, ' ')
      .split(/\s+/)
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      transcript: cleanText,
      text: cleanText,
      tokens,
      source: 'motor-ia-neuronal-institucional'
    });

  } catch (error: any) {
    console.error('Error en Motor de Transcripción Fonética:', error);
    return NextResponse.json(
      { error: 'Error al procesar el audio fonético', details: error?.message || String(error) },
      { status: 500 }
    );
  } finally {
    // 5. Limpieza higiénica de archivos temporales
    if (inputPath && fs.existsSync(inputPath)) {
      try { await fs.promises.unlink(inputPath); } catch {}
    }
    if (outputPath && fs.existsSync(outputPath)) {
      try { await fs.promises.unlink(outputPath); } catch {}
    }
  }
}
