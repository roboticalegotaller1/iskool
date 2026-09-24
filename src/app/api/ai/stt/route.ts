import { NextRequest, NextResponse } from 'next/server';
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
    if (c === 'ffmpeg' || fs.existsSync(c)) {
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
    const formData = await req.formData().catch(() => null);
    if (!formData) {
      return NextResponse.json({ error: 'Formato de petición no válido' }, { status: 400 });
    }

    const audioFile = formData.get('audio') as Blob | null;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile || typeof (audioFile as any).arrayBuffer !== 'function') {
      return NextResponse.json({ error: 'No se recibió archivo de audio para analizar' }, { status: 400 });
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    if (!arrayBuffer || arrayBuffer.byteLength < 600) {
      return NextResponse.json({ 
        success: true, 
        transcript: '', 
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
    const float32Samples = new Float32Array(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength / 4);

    // Si la señal es silencio acústico (amplitud RMS ultra baja < 0.008)
    let sumSq = 0;
    for (let i = 0; i < float32Samples.length; i++) {
      sumSq += float32Samples[i] * float32Samples[i];
    }
    const rms = Math.sqrt(sumSq / float32Samples.length);
    if (rms < 0.008) {
      return NextResponse.json({
        success: true,
        transcript: '',
        tokens: [],
        source: 'silence-acoustic'
      });
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
