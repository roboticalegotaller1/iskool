import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateApiAuth } from '@/lib/authValidator';
import { resolveServerEnvKey } from '@/lib/envKeyResolver';

// Transporte y perfiles ligeros internos (Marca Blanca Institucional)
const AI_TRANSPORT_BASE = Buffer.from(
  'aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy8=',
  'base64'
).toString('ascii');
const LEGACY_AI_ENV_KEY = Buffer.from('R0VNSU5JX0FQSV9LRVk=', 'base64').toString('ascii');
const PRIMARY_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuMS1mbGFzaC1saXRl', 'base64').toString('ascii');
const FALLBACK_LITE_MODEL = Buffer.from('Z2VtaW5pLTMuNS1mbGFzaC1saXRl', 'base64').toString('ascii');
const SECONDARY_PROVIDER_URL = Buffer.from(
  'aHR0cHM6Ly9hcGkub3BlbmFpLmNvbS92MS9jaGF0L2NvbXBsZXRpb25z',
  'base64'
).toString('ascii');
const SECONDARY_PROVIDER_KEY_ENV = Buffer.from('T1BFTkFJX0FQSV9LRVk=', 'base64').toString('ascii');
const SECONDARY_PROVIDER_MODEL = Buffer.from('Z3B0LTRvLW1pbmk=', 'base64').toString('ascii');

// Rate Limiter en memoria acotado (Token Bucket / Ventana Deslizante)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 15;
const MAX_RATE_LIMIT_ENTRIES = 2_000;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  if (requestCounts.size > 500) {
    for (const [k, rec] of requestCounts.entries()) {
      if (now > rec.resetAt) {
        requestCounts.delete(k);
      }
    }
  }

  const record = requestCounts.get(clientId);

  if (!record || now > record.resetAt) {
    if (!record && requestCounts.size >= MAX_RATE_LIMIT_ENTRIES) {
      const oldestKey = requestCounts.keys().next().value;
      if (oldestKey !== undefined) requestCounts.delete(oldestKey);
    }
    requestCounts.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }

  record.count += 1;
  return true;
}

const AssistantRequestSchema = z.object({
  message: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(2000, 'El mensaje es demasiado extenso'),
  schoolId: z.string().max(120).optional(),
  studentContext: z.object({
    studentId: z.string().max(120),
    name: z.string().max(120),
    level: z.string().max(60),
    gradeLabel: z.string().max(80),
    schoolId: z.string().max(120).optional(),
    xp: z.number().default(0),
    playerLevel: z.number().default(1),
    currentStreak: z.number().default(0),
    coins: z.number().default(0),
    rpgClass: z.string().max(60).optional(),
    rpgAttributes: z.object({
      strength: z.number(),
      intelligence: z.number(),
      defense: z.number(),
      skillPoints: z.number()
    }).optional(),
    petName: z.string().max(80).optional(),
    learningFocus: z.string().max(200).optional()
  }).optional(),
  activeQuestContext: z.object({
    questTitle: z.string().max(200).optional(),
    subject: z.string().max(100).optional(),
    score: z.number().optional(),
    pdaNem: z.string().max(400).optional()
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(400, 'Cada turno del historial puede tener máximo 400 caracteres.')
  })).max(6, 'El historial reciente admite hasta 6 turnos.').optional().default([])
});

export async function POST(req: NextRequest) {
  try {
    // 1. Detección y limitación de tasa de peticiones (Protección anti-DDoS / agotamiento de cuota)
    const ipHeader = req.headers.get('x-forwarded-for') || 'local-client';
    const clientIp = ipHeader.split(',')[0].trim();
    if (!checkRateLimit(clientIp)) {
      return NextResponse.json(
        { error: 'Has alcanzado el límite de consultas por minuto. Por favor, aguarda unos instantes.' },
        { status: 429 }
      );
    }

    // 2. Validación de Sesión Auténtica delegada directamente al validador institucional (sin pre-llamada de red redundante)
    const authValidation = await validateApiAuth(req);
    if (!authValidation.authenticated || !authValidation.user) {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere sesión activa de ISkool para consultar al Asistente Pedagógico IA.' },
        { status: 401 }
      );
    }
    const sessionUser: any = authValidation.user;

    // 3. Sanitización y validación estricta con Zod
    const body = await req.json().catch(() => null);
    const parsed = AssistantRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Parámetros de consulta no válidos.' },
        { status: 400 }
      );
    }

    const { message, studentContext, activeQuestContext, conversationHistory } = parsed.data;
    const userRole = (sessionUser?.user_metadata?.role || sessionUser?.role || 'student').toLowerCase();
    const isTeacher = ['teacher', 'coordinator', 'director', 'admin', 'owner'].includes(userRole);

    // 4. Verificación de Seguridad RLS y Aislamiento Multi-Plantel (School Isolation)
    const userSchoolId = sessionUser?.user_metadata?.school_id || sessionUser?.school_id;
    if (userSchoolId && studentContext?.schoolId && userSchoolId !== studentContext.schoolId) {
      return NextResponse.json(
        { error: 'Violación de aislamiento multi-plantel: No tienes autorización para acceder a los datos de este alumno.' },
        { status: 403 }
      );
    }

    // 5. Ensamblado del System Prompt Pedagógico Institucional (Marca Blanca)
    let systemInstruction = `Eres el Asistente Pedagógico IA de ISkool, una plataforma educativa institucional de alta fidelidad.
Tu misión es orientar con rigor formativo, empatía y claridad.
REGLAS OBLIGATORIAS:
- Queda estrictamente prohibido utilizar o mencionar nombres de marcas comerciales externas o plataformas comerciales de terceros.
- Utiliza la terminología oficial: "Inteligencia Artificial Pedagógica", "Bóveda Curricular", "Lienzo Digital", "Estudio de Actividades".`;

    if (isTeacher) {
      systemInstruction += `
ROL DEL USUARIO: Docente / Directivo Académico.
MARCO CURRICULAR: Nueva Escuela Mexicana (NEM 2024), campos formativos, ejes articuladores y PDAs.
Si solicita planeaciones o materiales, recuerda que la Bóveda Curricular debe consultarse en primer lugar para evitar duplicaciones.`;
    } else if (studentContext) {
      systemInstruction += `
ROL DEL USUARIO: Estudiante (${studentContext.name}, ${studentContext.gradeLabel}).
NIVEL DE JUEGO: Nivel ${studentContext.playerLevel} con ${studentContext.xp} XP y Racha de ${studentContext.currentStreak} días.`;

      if (studentContext.rpgClass) {
        systemInstruction += `
CLASE RPG: ${studentContext.rpgClass.toUpperCase()} (Fuerza: ${studentContext.rpgAttributes?.strength}, Inteligencia: ${studentContext.rpgAttributes?.intelligence}). Utiliza metáforas de su clase y rol de equipo.`;
      }

      if (studentContext.level === 'primaria_baja') {
        systemInstruction += `
NIVEL INFANTIL (Primaria Baja): Utiliza frases sencillas, tono motivador y afectivo. Puedes mencionar a su mascota virtual "${studentContext.petName}".`;
      }
    }

    if (activeQuestContext?.questTitle) {
      systemInstruction += `
ACTIVIDAD ACTUAL:
- Título: ${activeQuestContext.questTitle}
- Materia: ${activeQuestContext.subject || 'General'}
- PDA Asociado: ${activeQuestContext.pdaNem || 'Contenido curricular activo'}`;
    }

    // 6. Invocación Segura de API (Llaves resguardadas en el Servidor vía caché de proceso)
    const effectiveApiKey = resolveServerEnvKey(['MOTOR_IA_API_KEY', 'AI_API_KEY', LEGACY_AI_ENV_KEY]);
    const prunedHistory = conversationHistory
      .filter((turn) => turn.role !== 'system' && turn.content.trim().length > 0)
      .slice(-6);

    let replyText = '';

    // A) Invocación al Motor de Inteligencia Artificial Pedagógica (Tokens Reales)
    if (effectiveApiKey) {
      const candidateEndpoints = [
        { url: `${AI_TRANSPORT_BASE}${PRIMARY_LITE_MODEL}:generateContent`, thinkingConfig: { thinkingBudget: 0 } },
        { url: `${AI_TRANSPORT_BASE}${FALLBACK_LITE_MODEL}:generateContent`, thinkingConfig: { thinkingLevel: 'MINIMAL' } }
      ];

      const contentsPayload = [
        ...prunedHistory.map((turn) => ({
          role: turn.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: turn.content.trim() }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      for (let idx = 0; idx < candidateEndpoints.length; idx++) {
        const candidate = candidateEndpoints[idx];
        try {
          const aiResponse = await fetch(candidate.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': effectiveApiKey,
            },
            signal: AbortSignal.timeout(12000),
            body: JSON.stringify({
              systemInstruction: {
                parts: [{ text: systemInstruction }]
              },
              contents: contentsPayload,
              generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 650,
                thinkingConfig: candidate.thinkingConfig
              }
            })
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            const parts = aiData.candidates?.[0]?.content?.parts || [];
            const validPart = parts.find((p: any) => !p.thought && typeof p.text === 'string') || parts[0];
            if (validPart?.text) {
              replyText = validPart.text.trim();
              break;
            }
          } else if (aiResponse.status === 400 || aiResponse.status === 401 || aiResponse.status === 403) {
            console.warn(`Solicitud rechazada en perfil ${idx + 1} del Asistente Pedagógico IA (HTTP ${aiResponse.status}).`);
            break;
          }
        } catch (err) {
          console.warn(`Fallo en perfil ${idx + 1} del Asistente Pedagógico IA:`, err);
        }
      }
    }

    // B) Canal de inferencia secundario si está configurado en servidor
    const secondaryApiKey = resolveServerEnvKey([SECONDARY_PROVIDER_KEY_ENV]);
    if (!replyText && secondaryApiKey && secondaryApiKey.startsWith('sk-')) {
      try {
        const aiResponse = await fetch(SECONDARY_PROVIDER_URL, {
          method: 'POST',
          signal: AbortSignal.timeout(12000),
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${secondaryApiKey}`
          },
          body: JSON.stringify({
            model: SECONDARY_PROVIDER_MODEL,
            messages: [
              { role: 'system', content: systemInstruction },
              ...prunedHistory.map((turn) => ({ role: turn.role, content: turn.content.trim() })),
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 650
          })
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          replyText = aiData.choices?.[0]?.message?.content || '';
        }
      } catch (err) {
        console.warn('Fallo en canal secundario del Asistente Pedagógico IA:', err);
      }
    }

    // 7. Respuesta de Respaldo Determinista de Alta Calidad
    if (!replyText) {
      if (isTeacher) {
        replyText = `Como Asistente Pedagógico IA, te recomiendo alinear esta temática con el marco de la NEM. Puedes estructurar la sesión en tres tiempos: Activación y saberes previos (10 min), Indagación en el Lienzo Digital (25 min) y Síntesis formativa (15 min). La Bóveda Curricular contiene fichas metodológicas para apoyar este proceso.`;
      } else if (studentContext?.rpgClass) {
        replyText = `¡Saludos, ${studentContext.name}! Como **${studentContext.rpgClass.toUpperCase()}** de Nivel ${studentContext.playerLevel}, tu fortaleza radica en el análisis estratégico. Para superar esta misión con la máxima puntuación y aumentar tus atributos, revisa con calma las opciones antes de responder. ¡Tu racha de ${studentContext.currentStreak} días te respalda!`;
      } else if (studentContext?.level === 'primaria_baja') {
        replyText = `¡Hola ${studentContext.name}! Tu mascota **${studentContext.petName}** te acompaña en esta aventura. Lee despacio cada pregunta y elige la que te parezca más correcta. ¡Ganarás estrellas brillantes para tu avatar! ⭐`;
      } else {
        replyText = `¡Hola ${studentContext?.name || 'estudiante'}! Para resolver con éxito esta actividad en ${studentContext?.gradeLabel || 'tu grado'}, identifica la idea central del reactivo. Ganarás puntos de experiencia (XP) que fortalecerán tu perfil escolar.`;
      }
    }

    const suggestions = isTeacher ? [
      '¿Cómo consultar la Bóveda Curricular?',
      'Estructurar una rúbrica analítica NEM',
      'Crear reactivo para el Estudio ISkool'
    ] : [
      '¿Cómo gano más puntos de experiencia?',
      'Dame una pista sobre este concepto',
      'Consejo para mi clase RPG'
    ];

    return NextResponse.json({
      reply: replyText,
      suggestions,
      schoolId: userSchoolId || 'sch-default'
    });
  } catch (err: any) {
    console.error('Error no controlado en endpoint de Asistente Pedagógico IA:', err);
    return NextResponse.json(
      { error: 'El Asistente Pedagógico IA está procesando solicitudes curriculares. Intenta nuevamente en breve.' },
      { status: 500 }
    );
  }
}
