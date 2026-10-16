import { execFile } from 'child_process';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';

interface SynthesizeOptions {
  text: string;
  voice?: string;
  rate?: string;
  pitch?: string;
}

const memoryAudioCache = new Map<string, Buffer>();
const MAX_CACHE_ITEMS = 250;

/**
 * Genera audio MP3 neural de alta fidelidad sin costo de tokens,
 * usando el motor calibrado con prosodia oratoria en Python edge-tts.
 */
export async function synthesizeNeuralAudio(options: SynthesizeOptions): Promise<Buffer> {
  const {
    text,
    voice = 'es-MX-DaliaNeural',
    rate = '+0%',
    pitch = '+0Hz'
  } = options;

  const cleanText = text.trim();
  if (!cleanText) {
    throw new Error('Texto vacío para síntesis');
  }

  // Clave de caché
  const cacheKey = crypto
    .createHash('sha256')
    .update(`${voice}::${rate}::${pitch}::${cleanText}`)
    .digest('hex');

  // 1. Verificar caché en memoria
  const memoryHit = memoryAudioCache.get(cacheKey);
  if (memoryHit && memoryHit.length > 0) {
    return memoryHit;
  }

  // 2. Verificar caché en disco
  const cacheDir = path.join(process.cwd(), '.cache', 'tts_audio');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const cachedFilePath = path.join(cacheDir, `${cacheKey}.mp3`);
  if (fs.existsSync(cachedFilePath)) {
    try {
      const diskBuffer = fs.readFileSync(cachedFilePath);
      if (diskBuffer.length > 0) {
        memoryAudioCache.set(cacheKey, diskBuffer);
        return diskBuffer;
      }
    } catch {}
  }

  // 3. Ejecutar síntesis mediante worker calibrado
  const tempOutputFile = path.join(os.tmpdir(), `iskool_tts_${cacheKey}_${Date.now()}.mp3`);
  const workerScript = path.join(process.cwd(), 'scripts', 'neural_tts_worker.py');

  // Usar archivo JSON temporal para evitar desbordamiento o problemas de escape de caracteres en CLI
  const payloadFile = path.join(os.tmpdir(), `iskool_payload_${cacheKey}_${Date.now()}.json`);
  fs.writeFileSync(
    payloadFile,
    JSON.stringify({
      text: cleanText,
      voice,
      rate,
      pitch,
      output: tempOutputFile
    }),
    'utf-8'
  );

  return new Promise<Buffer>((resolve, reject) => {
    execFile(
      'python',
      [workerScript, '--json', payloadFile],
      { timeout: 25000 },
      (err, _stdout, stderr) => {
        // Limpieza de payload
        try {
          if (fs.existsSync(payloadFile)) fs.unlinkSync(payloadFile);
        } catch {}

        if (err) {
          try {
            if (fs.existsSync(tempOutputFile)) fs.unlinkSync(tempOutputFile);
          } catch {}
          return reject(new Error(`Fallo en síntesis neural: ${stderr || err.message}`));
        }

        try {
          if (!fs.existsSync(tempOutputFile)) {
            return reject(new Error('El archivo de audio temporal no fue generado'));
          }

          const audioBuffer = fs.readFileSync(tempOutputFile);
          fs.unlinkSync(tempOutputFile);

          if (audioBuffer.length === 0) {
            return reject(new Error('Audio generado con 0 bytes'));
          }

          // Guardar en caché de disco y memoria
          try {
            fs.writeFileSync(cachedFilePath, audioBuffer);
          } catch {}

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
}
