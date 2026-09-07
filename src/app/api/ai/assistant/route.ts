import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { validateApiAuth } from '@/lib/authValidator';

// Rate Limiter en memoria (Token Bucket / Ventana Deslizante)
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto
const MAX_REQUESTS_PER_WINDOW = 15;
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(clientId: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(clientId);

  if (!record || now > record.resetAt) {
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
  schoolId: z.string().optional(),
  studentContext: z.object({
    studentId: z.string(),
    name: z.string(),
    level: z.string(),
    gradeLabel: z.string(),
    schoolId: z.string().optional(),
    xp: z.number().default(0),
    playerLevel: z.number().default(1),
    currentStreak: z.number().default(0),
    coins: z.number().default(0),
    rpgClass: z.string().optional(),
    rpgAttributes: z.object({
      strength: z.number(),
      intelligence: z.number(),
      defense: z.number(),
      skillPoints: z.number()
    }).optional(),
    petName: z.string().optional(),
    learningFocus: z.string().optional()
  }).optional(),
  activeQuestContext: z.object({
    questTitle: z.string().optional(),
    subject: z.string().optional(),
    score: z.number().optional(),
    pdaNem: z.string().optional()
  }).optional(),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional().default([])
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

    // 2. Validación de Sesión Auténtica (Verificación estricta de Token Bearer de Supabase)
    const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
    let sessionUser: any = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7).trim();
      if (token && token !== 'undefined' && token !== 'null') {
        const { data, error } = await supabase.auth.getUser(token);
        if (!error && data?.user) {
          sessionUser = data.user;
        }
      }
    }

    // Si no hay token de Supabase en producción, recurrir al validador institucional
    if (!sessionUser) {
      const authValidation = await validateApiAuth(req);
      if (!authValidation.authenticated) {
        return NextResponse.json(
          { error: 'No autorizado. Se requiere sesión activa de ISkool para consultar al Asistente Pedagógico IA.' },
          { status: 401 }
        );
      }
      sessionUser = authValidation.user;
    }

    // 3. Sanitización y validación estricta con Zod
    const body = await req.json().catch(() => null);
    const parsed = AssistantRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Parámetros de consulta no válidos.' },
        { status: 400 }
      );
    }

    const { message, studentContext, activeQuestContext, schoolId } = parsed.data;
    const userRole = (sessionUser?.user_metadata?.role || sessionUser?.role || 'student').toLowerCase();
    const isTeacher = ['teacher', 'coordinator', 'director', 'admin', 'owner'].includes(userRole);

    // 4. Verificación de Seguridad RLS y Aislamiento Multi-Plantel (School Isolation)
    const userSchoolId = sessionUser?.user_metadata?.school_id || sessionUser?.school_id;
    if (userSchoolId && studentContext?.schoolId && userSchoolId !== studentContext.schoolId) {
      // Prevención de Fuga de Datos: No permitir consultar estudiantes de otro colegio
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

    // 6. Invocación Segura de API (Llaves resguardadas en el Servidor)
    const apiKey = process.env.MOTOR_IA_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;
    let replyText = '';

    if (apiKey) {
      try {
        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemInstruction },
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
        console.warn('Fallo en invocación a API de inferencia, aplicando generador pedagógico seguro:', err);
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
