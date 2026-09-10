import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateGamifiedProject } from '@/services/pedagogicalProjectEngine';
import { validateApiAuth } from '@/lib/authValidator';

const StudioGenerateSchema = z.object({
  topic: z.string().trim().min(2, 'El parámetro "topic" debe tener al menos 2 caracteres').max(200, 'El tema es demasiado largo'),
  ageGroup: z.string().trim().max(100).optional().default('Fase 5'),
  faseNem: z.string().trim().max(100).optional(),
  campoFormativo: z.string().trim().max(100).optional(),
  gamificationStyle: z.enum(['rpg_adventure', 'escape_room', 'scientific_expedition', 'olympic_tournament']).optional().default('rpg_adventure'),
  questionCount: z.coerce.number().int().min(1).max(20).optional().default(5)
});

export async function POST(req: NextRequest) {
  try {
    // 1. Sanitización y validación estricta del cuerpo de la petición con Zod
    const body = await req.json().catch(() => null);
    const parsedBody = StudioGenerateSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message || 'Parámetros de generación inválidos.' },
        { status: 400 }
      );
    }

    const { 
      topic, 
      ageGroup, 
      faseNem: inputFaseNem, 
      campoFormativo, 
      gamificationStyle, 
      questionCount 
    } = parsedBody.data;

    const fase = inputFaseNem || ageGroup || 'Fase 5';

    // 2. Generación profunda mediante el Motor Pedagógico Gamificado de ISkool
    const generatedProject = await generateGamifiedProject({
      topic,
      faseNem: fase,
      campoFormativo,
      gamificationStyle,
      questionCount
    });

    // 3. Extraer preguntas estructuradas para compatibilidad con players existentes
    const questions = generatedProject.blocks
      .filter((b) => b.type === 'quiz_question')
      .map((b: any) => ({
        question: b.data.question,
        options: b.data.options,
        correctIndex: b.data.correctIndex,
        explanation: b.data.explanation,
        timeLimitSeconds: b.data.timeLimitSeconds
      }));

    return NextResponse.json({
      success: true,
      title: generatedProject.metadata.title,
      description: generatedProject.metadata.description,
      metadata: generatedProject.metadata,
      blocks: generatedProject.blocks,
      connections: generatedProject.connections,
      startNodeId: generatedProject.startNodeId,
      questions: questions.length > 0 ? questions : [
        {
          question: `¿Cuál es el concepto clave que profundizamos sobre ${topic}?`,
          options: [
            `El análisis crítico y la comprensión de causas fundamentales de ${topic}`,
            'La memorización mecánica sin contexto',
            'La dispersión de conceptos no relacionados',
            'El descarte de evidencias comprobadas'
          ],
          correctIndex: 0,
          explanation: `El aprendizaje significativo en ${topic} requiere articular causas y efectos reales.`
        }
      ]
    });
  } catch (error: any) {
    console.error('Error en el endpoint de generación del Estudio ISkool:', error);
    return NextResponse.json(
      { error: 'Error al generar la actividad gamificada con el motor pedagógico.' },
      { status: 500 }
    );
  }
}

