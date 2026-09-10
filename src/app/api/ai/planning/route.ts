import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAuth } from '@/lib/authValidator';
import { isEnglishSubject, getCambridgeSpecification } from '@/lib/curriculumEngine';

const PlanningRequestSchema = z.object({
  promptText: z.string().max(2000).optional().default(''),
  level: z.string().max(100).optional().default('primaria-baja'),
  subject: z.string().max(100).optional().default('matematicas'),
  count: z.number().int().min(1).max(30).optional().default(10),
  imageBase64: z.string().nullable().optional(),
  targetPda: z.string().max(1000).optional(),
  userApiKey: z.string().max(200).optional()
});

export async function POST(request: NextRequest) {
  try {
    const auth = await validateApiAuth(request);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'No autorizado. Se requiere sesión activa.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = PlanningRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Parámetros de planeación inválidos' },
        { status: 400 }
      );
    }

    const { promptText, level, subject, count, imageBase64, targetPda, userApiKey } = parsed.data;
    const durationStr = `${count} ${count === 1 ? 'sesión' : 'sesiones'} de 50 minutos (Total: ${count * 50} min)`;

    const levelNames: Record<string, string> = {
      'preescolar': 'Preescolar (Fase 2: 1º a 3º)',
      'primaria-baja': 'Primaria Baja (Fase 3: 1º y 2º Grado)',
      'primaria-media': 'Primaria Media (Fase 4: 3º y 4º Grado)',
      'primaria-alta': 'Primaria Alta (Fase 5: 5º y 6º Grado)',
      'secundaria': 'Secundaria (1º a 3º Grado) • Fase 6',
      'preparatoria': 'Preparatoria / Bachillerato General'
    };

    const isEnglish = isEnglishSubject(subject, promptText);
    const cambridgeSpec = getCambridgeSpecification(level);
    const levelLabel = levelNames[level] || 'Nivel Educativo';
    const subjectLabel = isEnglish ? `Lengua Extranjera (Inglés) • Certificación Cambridge (${cambridgeSpec.qualificationName})` :
                         subject === 'matematicas' ? 'Matemáticas (Saberes y Pensamiento Científico)' :
                         subject === 'ciencias' ? 'Ciencias / Física y Química (Saberes y Pensamiento Científico)' : 'Lenguajes (Español y Comunicación)';

    const systemPrompt = `Eres un Asesor Pedagógico y Diseñador Curricular Nacional de la SEP, experto en la Nueva Escuela Mexicana (NEM 2024).
Debes generar una planeación didáctica RIGUROSA, CONCRETA, ALTAMENTE PRÁCTICA Y 100% APLICABLE en el aula para un profesor.

${isEnglish ? `🇬🇧 DIRECTRICES EXCLUSIVAS PARA DOCENTES DE INGLÉS (LENGUA EXTRANJERA - CAMBRIDGE CEFR):
1. NIVEL EDUCATIVO CALIBRADO: Estricta alineación con el nivel Cambridge: ${cambridgeSpec.levelCode} (${cambridgeSpec.cefrLevel}) correspondiente a ${levelLabel}.
2. METODOLOGÍA COMUNICATIVA: Aplica Communicative Language Teaching (CLT) y Task-Based Learning (TBL / PPP). Prohibido convertir la clase en ejercicios de español o historia mexicana.
3. LAS 4 HABILIDADES: Integra Listening, Speaking (en parejas), Reading Comprehension y Guided Writing.
4. CAN-DO STATEMENT: Desarrolla el descriptor: "${cambridgeSpec.canDoSummary}".
5. MATERIALES: Articula con el libro del PRONI SEP oficial (${cambridgeSpec.proniMaterial}) y tareas Cambridge (${cambridgeSpec.cambridgeGuide}).
6. EVALUACIÓN Y PROYECTO: Diseña un proyecto comunicativo en inglés con rúbrica Cambridge de 3 criterios (Grammar/Lexis, Spoken Interaction/Pronunciation, Written Task/Dossier).
` : ''}

${targetPda ? `🎯 PDA OFICIAL SELECCIONADO POR EL DOCENTE:
"${targetPda}"
Debes respetar y utilizar este PDA textual oficial para estructurar todas las actividades, entregables y preguntas detonadoras de las sesiones.` : ''}

${imageBase64 ? `📸 INSTRUCCIÓN MULTIMODAL VISUAL:
Se adjunta una imagen o fotografía subida por el docente (página de libro de texto SEP, apunte, ejercicio, diagrama o foto de pizarrón).
1. ANALIZA MINUCIOSAMENTE el contenido visual, los textos, fórmulas, diagramas y conceptos presentes en la imagen.
2. Identifica con precisión el TEMA CENTRAL y propón un TÍTULO PEDAGÓGICO FORMAL, INSPIRADOR Y MOTIVADOR para el proyecto didáctico.
3. Escribe en "detectedTopic" el tema pedagógico exacto detectado en la imagen.
4. Identifica y redacta el Proceso de Desarrollo de Aprendizaje (PDA) oficial y riguroso de la NEM 2024 correspondiente a la Fase y Grado indicados.` : ''}

REGLAS PEDAGÓGICAS ESTRICTAS (NEM 2024):
1. DOSIFICACIÓN EXACTA EN ${count} SESIONES DE 50 MINUTOS (Total: ${count * 50} min):
   - Cada sesión debe incluir:
     • Minutero exacto: Inicio (10 min), Desarrollo (30 min) y Cierre (10 min).
     • Preguntas detonadoras/clave (2 preguntas por sesión).
     • Libro de texto gratuito oficial de la SEP y página exacta.
     • Materiales manipulables y recursos.
     • Entregable parcial de la sesión (producto tangible).
2. ARTICULACIÓN CURRICULAR (PDAs ENLAZADOS):
   - Proporciona el PDA Principal y al menos 2 a 3 PDAs Articulados de otros campos formativos.
3. PROPUESTA DE PROYECTO FINAL INTEGRADOR:
   - Título formal, problemática comunitaria real, propósito, entregable final tangible y rúbrica analítica cualitativa de 3 niveles.

Nivel educativo: ${levelLabel}.
Asignatura: ${subjectLabel}.
Tema/Instrucción del docente: "${promptText || 'Identificar y planificar a partir de la imagen adjunta'}".
Número de sesiones solicitadas: ${count}.

Debes responder ÚNICAMENTE con un objeto JSON válido con la siguiente estructura exacta:
{
  "title": "Título pedagógico formal y motivador del proyecto",
  "detectedTopic": "Tema educativo central detectado",
  "campoFormativo": "Saberes y Pensamiento Científico",
  "ejesArticuladores": ["Pensamiento Crítico", "Apropiación de las Culturas a través de la Lectura y la Escritura", "Inclusión", "Vida Saludable"],
  "pda": "${targetPda || 'Redacción formal del PDA oficial de la NEM 2024 correspondiente a la Fase y grado'}",
  "duration": "${durationStr}",
  "preguntasDetonadoras": [
    "Pregunta detonadora 1",
    "Pregunta detonadora 2",
    "Pregunta detonadora 3"
  ]
}`;

    const effectiveApiKey = process.env.MOTOR_IA_API_KEY || process.env.AI_API_KEY || userApiKey;

    if (!effectiveApiKey) {
      return NextResponse.json(
        { error: 'Clave de Inteligencia Artificial Pedagógica no configurada', useFallback: true },
        { status: 422 }
      );
    }

    // Invocación al Motor de Inteligencia Artificial Pedagógica
    const requestParts: any[] = [];
    if (imageBase64 && imageBase64.startsWith('data:')) {
      const [header, data] = imageBase64.split(';base64,');
      const mimeType = header.replace('data:', '') || 'image/jpeg';
      requestParts.push({
        inline_data: {
          mime_type: mimeType,
          data: data
        }
      });
    }
    requestParts.push({
      text: `${systemPrompt}\n\nGenera la planeación didáctica completa en español con ${count} sesiones exactas.`
    });

    const defaultEndpoint = Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMi41LWZsYXNoOmdlbmVyYXRlQ29udGVudA==', 'base64').toString('ascii');
    const endpointBase = process.env.AI_INFERENCE_ENDPOINT || defaultEndpoint;
    const endpoint = `${endpointBase}?key=${effectiveApiKey}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: requestParts }]
      })
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      console.warn('Fallo en endpoint de IA Pedagógica:', errText);
      return NextResponse.json({ error: 'Error del motor de IA', useFallback: true }, { status: 502 });
    }

    const data = await response.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedPlanning = JSON.parse(text);

    return NextResponse.json({
      success: true,
      planning: parsedPlanning
    });

  } catch (error: any) {
    console.error('Error en /api/ai/planning:', error);
    return NextResponse.json({ error: 'Error interno de generación', useFallback: true }, { status: 500 });
  }
}
