import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Voces humanas neuronales de estudio recomendadas (100% realistas, contrastadas y pedagógicas)
export const NEURAL_VOICES = [
  { id: 'es-MX-DaliaNeural', label: 'Dalia (México) · Femenina', description: 'Mentora Principal · Tono Cálido, Dulce & Pedagógico', gender: 'female' },
  { id: 'es-MX-JorgeNeural', label: 'Jorge (México) · Masculina', description: 'Profesor Mentor · Tono Maduro, Sereno & Explicativo', gender: 'male' },
  { id: 'es-ES-ElviraNeural', label: 'Elvira (España) · Femenina', description: 'Narradora de Grimorio · Acento Castellano Clásico', gender: 'female' },
  { id: 'es-ES-AlvaroNeural', label: 'Álvaro (España) · Masculina', description: 'Narrador Épico · Voz Profunda & Solemne', gender: 'male' },
  { id: 'es-CO-SalomeNeural', label: 'Salomé (Colombia) · Femenina', description: 'Educación & Guiado · Acento Neutro Suave', gender: 'female' },
  { id: 'es-AR-ElenaNeural', label: 'Elena (Argentina) · Femenina', description: 'Literatura & Ciencias · Entonación Rioplatense', gender: 'female' },
  { id: 'es-US-PalomaNeural', label: 'Paloma (Latina) · Femenina', description: 'Expresiva & Dinámica · Enfoque Moderno', gender: 'female' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'es-MX-DaliaNeural', rate = 1.0 } = body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'El texto es obligatorio' }, { status: 400 });
    }

    // Limpieza de sintaxis markdown para narración natural
    const cleanText = text
      .replace(/!\[.*?\]\(.*?\)/g, '') // Eliminar etiquetas de imágenes markdown
      .replace(/\[\[(.*?)\]\]/g, '$1') // Enlaces de bóveda
      .replace(/[*_#`~>]/g, '')        // Formateo markdown
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) {
      return NextResponse.json({ error: 'No hay texto audible tras limpieza' }, { status: 400 });
    }

    // Configurar el sintetizador neural de alta fidelidad
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3);

    // Ajuste de cadencia/prosodia pedagógica
    const ratePercent = Math.round((rate - 1.0) * 100);
    const prosodyRate = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    const { audioStream } = tts.toStream(cleanText, { rate: prosodyRate });

    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer | string) => {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      });
      audioStream.on('end', () => resolve());
      audioStream.on('error', (err: Error) => reject(err));
    });

    const audioBuffer = Buffer.concat(chunks);

    return new NextResponse(audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error: any) {
    console.error('Error en síntesis neural de voz humana:', error);
    return NextResponse.json(
      { error: 'Error al generar el audio de voz humana', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
