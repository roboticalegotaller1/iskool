import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAuth } from '@/lib/authValidator';
import { isEnglishSubject, getCambridgeSpecification } from '@/lib/curriculum/cambridgeSpec';
import { InstitutionalMemoryService } from '@/lib/institutionalMemory';
import { resolveServerEnvKey } from '@/lib/envKeyResolver';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

// Transporte y perfiles ligeros internos (Marca Blanca Institucional)
const AI_TRANSPORT_BASE = Buffer.from(
  'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy8=',
  'base64'
).toString('ascii');
const LEGACY_AI_ENV_KEY = Buffer.from('R0VNSU5JX0FQSV9LRVk=', 'base64').toString('ascii');
const PRIMARY_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuMS1mbGFzaC1saXRl', 'base64').toString('ascii');
const FALLBACK_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuNS1mbGFzaC1saXRl', 'base64').toString('ascii');

// Limitador de tasa por IP acotado en memoria (30 req/min, máx 2,000 entradas con barrido de expirados)
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;
const MAX_RATE_LIMIT_ENTRIES = 2_000;
const planningRateLimits = new Map<string, { count: number; resetAt: number }>();

function checkPlanningRateLimit(clientKey: string): boolean {
  const now = Date.now();
  if (planningRateLimits.size > 500) {
    for (const [k, rec] of planningRateLimits.entries()) {
      if (now > rec.resetAt) {
        planningRateLimits.delete(k);
      }
    }
  }

  const record = planningRateLimits.get(clientKey);
  if (!record || now > record.resetAt) {
    if (!record && planningRateLimits.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = planningRateLimits.keys().next().value;
      if (oldestKey !== undefined) planningRateLimits.delete(oldestKey);
    }
    planningRateLimits.set(clientKey, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

const MAX_IMAGE_BASE64_CHARS = 560_000;
const ALLOWED_IMAGE_DATA_URL_RE = /^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=\s]+$/i;

const PlanningRequestSchema = z.object({
  promptText: z.string().max(2000).optional().default(''),
  level: z.string().max(100).optional().default('primaria-baja'),
  subject: z.string().max(100).optional().default('matematicas'),
  count: z.number().int().min(1).max(30).optional().default(10),
  imageBase64: z
    .string()
    .max(MAX_IMAGE_BASE64_CHARS, 'La imagen adjunta excede el límite máximo permitido tras compresión.')
    .refine(
      (val) => val === '' || ALLOWED_IMAGE_DATA_URL_RE.test(val),
      'Formato de imagen no permitido. Solo se aceptan imágenes comprimidas image/webp, image/jpeg o image/png.'
    )
    .nullable()
    .optional(),
  targetPda: z.string().max(1000).optional(),
  userApiKey: z.string().max(200).optional()
});

const STATIC_PLANNING_SYSTEM_INSTRUCTION = `Eres un Asesor Pedagógico y Diseñador Curricular Nacional de la SEP, experto en la Nueva Escuela Mexicana (NEM 2024).
Debes proponer los metadatos pedagógicos nucleares (título formal, tema central, campo formativo, ejes articuladores, PDA oficial, duración y preguntas detonadoras) con rigor curricular, precisión ortográfica en español y 100% aplicabilidad en aula.
REGLAS OBLIGATORIAS:
- Marca Blanca Institucional estricta: prohibido mencionar marcas comerciales externas o plataformas de terceros.
- Si se adjunta una imagen (página de libro SEP, diagrama, ejercicio o pizarrón), analiza minuciosamente su contenido visual para identificar el tema central ("detectedTopic"), el título pedagógico y el PDA NEM 2024 exacto.
- Si se proporciona un PDA oficial seleccionado por el docente, respétalo y utilízalo de forma textual.
- Responde ÚNICAMENTE con un objeto JSON válido con las claves exactas: "title", "detectedTopic", "campoFormativo", "ejesArticuladores", "pda", "duration", "preguntasDetonadoras".`;

export async function POST(request: NextRequest) {
  try {
    const ipHeader = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'local-client';
    const clientIp = ipHeader.split(',')[0].trim();
    if (!checkPlanningRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Límite de generación de planeaciones por minuto alcanzado. Intenta nuevamente en breve.' },
        { status: 429 }
      );
    }

    const auth = await validateApiAuth(request);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'No autorizado. Se requiere sesión activa.' },
        { status: 401 }
      );
    }
    const planningRole = (auth.user.role || '').toLowerCase();
    if (!['teacher', 'director', 'coordinator', 'admin', 'superadmin', 'owner', 'ceo'].includes(planningRole)) {
      return NextResponse.json(
        { error: 'Permisos insuficientes para generar planeaciones docentes.' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);

    // Regla 3 en servidor: rechazar con HTTP 413 cargas de imagen sin comprimir que superen 560,000 caracteres base64
    if (body && typeof body.imageBase64 === 'string' && body.imageBase64.length > MAX_IMAGE_BASE64_CHARS) {
      return NextResponse.json(
        { error: 'La imagen adjunta supera el tamaño máximo permitido (<= 400 KB comprimido en WebP/JPEG/PNG).' },
        { status: 413 }
      );
    }

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
    const subjectLabel = isEnglish
      ? `Lengua Extranjera (Inglés) • Certificación Cambridge (${cambridgeSpec.qualificationName})`
      : subject === 'matematicas'
      ? 'Matemáticas (Saberes y Pensamiento Científico)'
      : subject === 'ciencias'
      ? 'Ciencias / Física y Química (Saberes y Pensamiento Científico)'
      : 'Lenguajes (Español y Comunicación)';

    // Inyectar memoria institucional de ciclos anteriores (Evitar amnesia escolar)
    let inferredGrade: number | undefined = undefined;
    if (level === 'primaria-baja') inferredGrade = 2;
    else if (level === 'primaria-media') inferredGrade = 4;
    else if (level === 'primaria-alta') inferredGrade = 6;

    const relatedMemories = await InstitutionalMemoryService.queryMemoriesAsync({
      grade: inferredGrade,
      subject,
      topic: promptText || targetPda || ''
    });
    const memorySynthesis = relatedMemories.length > 0
      ? InstitutionalMemoryService.synthesizePriorCycleLearnings(relatedMemories, promptText || targetPda || '')
      : null;
    const institutionalMemoryPromptBlock = relatedMemories.length > 0
      ? `\n${InstitutionalMemoryService.formatMemoriesForPrompt(relatedMemories, 1200)}\n`
      : '';

    const userContextPrompt = [
      institutionalMemoryPromptBlock,
      isEnglish
        ? `DIRECTRICES CAMBRIDGE CEFR (${cambridgeSpec.levelCode} / ${cambridgeSpec.cefrLevel} — ${levelLabel}):
- Metodología comunicativa CLT/TBL integrando Listening, Speaking, Reading y Guided Writing.
- Descriptor Can-Do: "${cambridgeSpec.canDoSummary}".
- Articular con ${cambridgeSpec.proniMaterial} y ${cambridgeSpec.cambridgeGuide}.`
        : '',
      targetPda ? `PDA OFICIAL SELECCIONADO POR EL DOCENTE (usar textualmente): "${targetPda}"` : '',
      imageBase64
        ? 'IMAGEN ADJUNTA: Analiza el contenido visual, fórmulas, textos o diagramas para precisar "detectedTopic", "title", "pda" y "preguntasDetonadoras".'
        : '',
      `Nivel educativo: ${levelLabel}`,
      `Asignatura: ${subjectLabel}`,
      `Tema / Instrucción del docente: "${promptText || 'Identificar y planificar a partir de la imagen adjunta'}"`,
      `Duración objetivo: ${durationStr}`,
      `Estructura JSON requerida:
{
  "title": "Título pedagógico formal y motivador del proyecto",
  "detectedTopic": "Tema educativo central detectado",
  "campoFormativo": "Campo Formativo NEM correspondiente",
  "ejesArticuladores": ["Pensamiento Crítico", "Inclusión", "Vida Saludable"],
  "pda": "${targetPda || 'Redacción formal del PDA oficial de la NEM 2024 correspondiente a la Fase y grado'}",
  "duration": "${durationStr}",
  "preguntasDetonadoras": ["Pregunta detonadora 1", "Pregunta detonadora 2", "Pregunta detonadora 3"]
}`
    ]
      .filter(Boolean)
      .join('\n\n');

    const effectiveApiKey =
      resolveServerEnvKey(['MOTOR_IA_API_KEY', 'AI_API_KEY', LEGACY_AI_ENV_KEY]) ||
      userApiKey?.trim() ||
      '';

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
      const mimeType = header.replace('data:', '').toLowerCase();
      requestParts.push({
        inline_data: {
          mime_type: mimeType,
          data
        }
      });
    }
    requestParts.push({ text: userContextPrompt });

    const fallbackEndpoints = [
      { url: `${AI_TRANSPORT_BASE}${PRIMARY_LITE_MODEL}:generateContent`, thinkingConfig: { thinkingBudget: 0 } },
      { url: `${AI_TRANSPORT_BASE}${FALLBACK_LITE_MODEL}:generateContent`, thinkingConfig: { thinkingLevel: 'MINIMAL' } }
    ];
    const candidateEndpoints = process.env.AI_INFERENCE_ENDPOINT
      ? [{ url: process.env.AI_INFERENCE_ENDPOINT, thinkingConfig: { thinkingBudget: 0 } }, ...fallbackEndpoints]
      : fallbackEndpoints;

    let response: Response | null = null;
    for (let idx = 0; idx < candidateEndpoints.length; idx++) {
      const candidate = candidateEndpoints[idx];
      try {
        const res = await fetch(candidate.url, {
          method: 'POST',
          signal: AbortSignal.timeout(15000),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': effectiveApiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: STATIC_PLANNING_SYSTEM_INSTRUCTION }]
            },
            contents: [{ role: 'user', parts: requestParts }],
            generationConfig: {
              temperature: 0.25,
              maxOutputTokens: 1200,
              responseMimeType: 'application/json',
              thinkingConfig: candidate.thinkingConfig
            }
          })
        });
        if (res.ok) {
          response = res;
          break;
        }
        // Fast-fail ante errores de solicitud/credenciales (400/401/403): no escalar ni reintentar
        if (res.status === 400 || res.status === 401 || res.status === 403) {
          console.warn(`Solicitud rechazada por el Motor de IA Pedagógica (perfil ${idx + 1}, HTTP ${res.status}).`);
          break;
        }
      } catch (e) {
        console.warn(`Fallo intento en perfil ${idx + 1} del Motor de IA Pedagógica:`, e);
      }
    }

    if (!response || !response.ok) {
      return NextResponse.json({ error: 'Error del motor de IA', useFallback: true }, { status: 502 });
    }

    const data = await response.json();
    const parts = data.candidates?.[0]?.content?.parts || [];
    const validPart = parts.find((p: any) => !p.thought && typeof p.text === 'string') || parts[0];
    let text = validPart?.text || '';
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsedPlanning = JSON.parse(text);

    return NextResponse.json({
      success: true,
      institutionalMemory: memorySynthesis,
      planning: {
        ...parsedPlanning,
        institutionalMemory: memorySynthesis
      }
    });

  } catch (error: any) {
    console.error('Error en /api/ai/planning:', error);
    return NextResponse.json({ error: 'Error interno de generación', useFallback: true }, { status: 500 });
  }
}
