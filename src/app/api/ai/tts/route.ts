import { NextRequest, NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Voces humanas neuronales de estudio recomendadas (100% realistas, contrastadas y pedagógicas)
export const NEURAL_VOICES = [
  // Español
  { id: 'es-MX-DaliaNeural', label: 'Dalia (México) · Femenina', description: 'Mentora Principal · Tono Cálido, Dulce & Pedagógico', gender: 'female', lang: 'es' },
  { id: 'es-MX-JorgeNeural', label: 'Jorge (México) · Masculina', description: 'Profesor Mentor · Tono Maduro, Sereno & Explicativo', gender: 'male', lang: 'es' },
  { id: 'es-ES-ElviraNeural', label: 'Elvira (España) · Femenina', description: 'Narradora de Bóveda · Acento Castellano Clásico', gender: 'female', lang: 'es' },
  { id: 'es-ES-AlvaroNeural', label: 'Álvaro (España) · Masculina', description: 'Narrador Épico · Voz Profunda & Solemne', gender: 'male', lang: 'es' },
  { id: 'es-CO-SalomeNeural', label: 'Salomé (Colombia) · Femenina', description: 'Educación & Guiado · Acento Neutro Suave', gender: 'female', lang: 'es' },
  { id: 'es-AR-ElenaNeural', label: 'Elena (Argentina) · Femenina', description: 'Literatura & Ciencias · Entonación Rioplatense', gender: 'female', lang: 'es' },
  { id: 'es-US-PalomaNeural', label: 'Paloma (Latina) · Femenina', description: 'Expresiva & Dinámica · Enfoque Moderno', gender: 'female', lang: 'es' },

  // Inglés (English - US & UK)
  { id: 'en-US-JennyNeural', label: 'Claire (EE.UU.) · Femenina', description: 'Profesora Claire · Articulación Clara, Suave & Didáctica', gender: 'female', lang: 'en' },
  { id: 'en-US-GuyNeural', label: 'Arthur (EE.UU.) · Masculina', description: 'Profesor Arthur · Voz Amigable, Precisa & Académica', gender: 'male', lang: 'en' },
  { id: 'en-GB-SoniaNeural', label: 'Lady Sonia (Reino Unido) · Femenina', description: 'Acento Británico Elegante & Fonética Clásica', gender: 'female', lang: 'en' },
  { id: 'en-GB-RyanNeural', label: 'Sir Ryan (Reino Unido) · Masculina', description: 'Profesor Ryan · Pronunciación de Oxford Distinguida', gender: 'male', lang: 'en' },

  // Francés (Français - France & Canada)
  { id: 'fr-FR-DeniseNeural', label: 'Mme. Sophie (Francia) · Femenina', description: 'Profesora Sophie · Francés Parisino Impecable', gender: 'female', lang: 'fr' },
  { id: 'fr-FR-HenriNeural', label: 'Prof. Henri (Francia) · Masculina', description: 'Profesor Henri · Fonética Clara & Explicativa', gender: 'male', lang: 'fr' },
  { id: 'fr-CA-SylvieNeural', label: 'Sylvie (Canadá) · Femenina', description: 'Acento Francés Canadiense Natural & Suave', gender: 'female', lang: 'fr' },
  { id: 'fr-CA-JeanNeural', label: 'Jean (Canadá) · Masculina', description: 'Pronunciación Quebequense Dinámica & Moderna', gender: 'male', lang: 'fr' },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = 'es-MX-DaliaNeural', rate = 1.0, pitch = 1.0 } = body;

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

    // Ajuste de cadencia y tono de prosodia pedagógica
    const ratePercent = Math.round((rate - 1.0) * 100);
    const prosodyRate = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;

    const pitchHz = Math.round((pitch - 1.0) * 100);
    const prosodyPitch = pitchHz >= 0 ? `+${pitchHz}Hz` : `${pitchHz}Hz`;

    const streamOptions: any = { rate: prosodyRate };
    if (pitchHz !== 0) {
      streamOptions.pitch = prosodyPitch;
    }

    const { audioStream } = tts.toStream(cleanText, streamOptions);

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
