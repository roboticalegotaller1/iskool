import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateGamifiedProject } from '@/services/pedagogicalProjectEngine';
import {
  findStudioMasterClassInVault,
  generateOrFetchStudioMasterClass,
  parseTopicAndGrade,
} from '@/lib/services/studioVaultEngine.service';
import { validateApiAuth } from '@/lib/authValidator';
import { isDemoSandboxContext } from '@/lib/demo/demoSandboxConfig';
import { recordEphemeralVaultItem } from '@/lib/demo/demoEphemeralVault';
import { checkRouteRateLimit, extractClientRateLimitKey } from '@/lib/security/routeRateLimit';

const StudioGenerateSchema = z.object({
  topic: z.string().trim().min(2, 'El parámetro "topic" debe tener al menos 2 caracteres').max(200, 'El tema es demasiado largo'),
  grade: z.string().trim().max(100).optional(),
  ageGroup: z.string().trim().max(100).optional().default('Fase 5'),
  faseNem: z.string().trim().max(100).optional(),
  campoFormativo: z.string().trim().max(100).optional(),
  template_type: z.string().trim().optional(),
  templateType: z.string().trim().optional(),
  gamificationStyle: z.string().trim().optional().default('rpg_adventure'),
  questionCount: z.coerce.number().int().min(1).max(20).optional().default(5),
  language: z.string().trim().optional().default('Español'),
  forceRegenerate: z.boolean().optional().default(false),
});

/**
 * SYSTEM PROMPT oficial para el Generador IA del Estudio ISkool
 */
export function getStudioSystemPrompt(language: string, isEscapeRoom: boolean = false, topic?: string): string {
  let prompt = `Actúa como Diseñador Instruccional Senior y Desarrollador de Gamificación Educativa para el Estudio ISkool (basado en la NEM 2024 de México).
Debes generar todo el contenido, preguntas y distractores estrictamente en ${language}. Mantén la estructura JSON intacta.
Queda terminantemente prohibido generar preguntas vacías, opciones genéricas o respuestas absurdas. Todo el contenido debe ser auténtico, riguroso, pedagógicamente adaptado y desafiante en el idioma ${language}.`;

  if (isEscapeRoom) {
    prompt += `\n\nREGLA CRÍTICA DE COMPRENSIÓN LECTORA (ESCAPE ROOM LÓGICO):
1. Debes generar obligatoriamente PRIMERO un texto base de lectura de exactamente 2 párrafos completos y enriquecidos sobre "${topic || 'el tema curricular'}", con detalles analíticos, datos clave y contexto sustancial.
2. Luego, TODAS las preguntas, pistas y distractores deben fundamentarse directa y rigurosamente en la información contenida en esos dos párrafos, de modo que el alumno deba realizar comprensión lectora y deducción analítica para resolver cada acertijo y abrir cada candado.`;
  }

  return prompt;
}

function getEscapeRoomReadingText(topic: string, language: string): string {
  if (language === 'Inglés B2') {
    return `In recent pedagogical studies, understanding ${topic} has proven essential for developing critical thinking and analytical competence. Through systemic inquiry, learners investigate the underlying mechanisms, chronological transformations, and socio-cultural impacts that shape ${topic} across diverse contemporary scenarios.\n\nFurthermore, mastery of this domain requires connecting theoretical frameworks with evidence-based problem solving. By examining key causal relationships and contrasting distinct perspectives, students unlock deeper analytical capabilities and decipher complex challenges related to ${topic}.`;
  }
  if (language === 'Francés A2') {
    return `L'apprentissage de ${topic} représente une étape essentielle dans le développement des compétences analytiques et de la pensée critique. À travers cette étude, nous découvrons les origines, les caractéristiques clés et les implications fondamentales qui composent ${topic} dans notre société contemporaine.\n\nDe plus, la compréhension approfondie de ces notions permet d'établir des liens clairs entre les théories et les situations concrètes. En observant attentivement les détails et les principes directeurs de ${topic}, les apprenants résolvent des énigmes complexes et surmontent chaque défi avec succès.`;
  }
  return `El estudio sistemático de ${topic} constituye un pilar fundamental para comprender los procesos históricos, científicos y sociales que modelan nuestra realidad. Al analizar sus causas primarias, su evolución conceptual y sus repercusiones directas, es posible descubrir patrones lógicos y fundamentos esenciales que explican la relevancia pedagógica de ${topic}.\n\nAsimismo, el dominio de esta temática demanda una rigurosa articulación entre la teoría y la resolución práctica de problemas. Cada enigma y desafío planteado a continuación requiere una lectura atenta de los postulados anteriores, conectando evidencias documentales con deducciones críticas para desbloquear con éxito cada uno de los candados del saber.`;
}

export async function POST(req: NextRequest) {
  try {
    // 0. Verificación estricta de Autenticación Zero-Trust y Rol Docente/Staff
    const auth = await validateApiAuth(req);
    if (!auth.authenticated || !auth.user) {
      return NextResponse.json(
        { error: auth.error || 'No autorizado. Se requiere sesión activa de ISkool para generar actividades en el Estudio.' },
        { status: 401 }
      );
    }
    const studioRole = (auth.user.role || '').toLowerCase();
    if (!['teacher', 'director', 'coordinator', 'admin', 'superadmin', 'owner', 'ceo'].includes(studioRole)) {
      return NextResponse.json(
        { error: 'Solo docentes o personal directivo pueden generar actividades en el Estudio.' },
        { status: 403 }
      );
    }

    const rateCheck = checkRouteRateLimit('studio:generate', extractClientRateLimitKey(req, auth.user.id), 20, 60_000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Límite de generaciones por minuto alcanzado. Intenta nuevamente en unos segundos.' },
        { status: 429, headers: { 'Retry-After': String(rateCheck.retryAfterSeconds) } }
      );
    }

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
      grade,
      ageGroup, 
      faseNem: inputFaseNem, 
      campoFormativo, 
      template_type,
      templateType,
      gamificationStyle: rawStyle, 
      questionCount,
      language = 'Español',
      forceRegenerate = false,
    } = parsedBody.data;

    const isEscapeRoom = template_type === 'escape_room' || templateType === 'escape_room' || rawStyle === 'escape_room';
    const gamificationStyle = isEscapeRoom ? 'escape_room' : rawStyle;
    const fase = inputFaseNem || ageGroup || 'Fase 5';
    const isDemoSandbox = isDemoSandboxContext({
      email: auth.user.email,
      schoolId: auth.user.school_id,
      userId: auth.user.id,
      tenantId: auth.user.tenant_id,
    });

    // MODO CLASE INTERACTIVA MAESTRA (Vault-First 0 Tokens + Tokens Reales + Persistencia Bóveda Curricular)
    if (!isEscapeRoom) {
      if (isDemoSandbox) {
        // Modo Cuentas Demo: lectura Vault-First permitida, 0 escrituras en disco de producción
        const cached = !forceRegenerate
          ? findStudioMasterClassInVault(topic, grade, fase, language, gamificationStyle)
          : null;
        if (cached) {
          const cachedQuestions = cached.blocks
            .filter((b) => b.type === 'quiz_question')
            .map((b: any) => ({
              question: b.data.question,
              options: b.data.options,
              correctIndex: b.data.correctIndex,
              explanation: b.data.explanation,
              timeLimitSeconds: b.data.timeLimitSeconds,
            }));
          return NextResponse.json({
            success: true,
            demoSandbox: true,
            title: cached.metadata.title,
            description: cached.metadata.description,
            language,
            template_type: template_type || templateType || 'master_class',
            metadata: cached.metadata,
            blocks: cached.blocks,
            connections: cached.connections,
            startNodeId: cached.startNodeId,
            questions: cachedQuestions,
            relatedResources: cached.relatedResources,
            teacherMonitoringRubric: cached.teacherMonitoringRubric,
            tokenTelemetry: cached.tokenTelemetry,
            vaultRelativePath: cached.vaultRelativePath,
            planeacionViewerUrl: cached.planeacionViewerUrl,
            persistedInVault: false,
            fromVault: true,
            gradeLabel: cached.gradeLabel,
            cleanTopic: cached.cleanTopic,
          });
        }

        const parsedMeta = parseTopicAndGrade(topic, grade, fase, language, gamificationStyle);
        const ts = Date.now();
        const eph = recordEphemeralVaultItem('planning', {
          actorEmail: auth.user.email,
          title: `Estudio Demo: ${parsedMeta.cleanTopic}`,
          payload: { grade: parsedMeta.gradeLabel, faseNem: parsedMeta.faseNem, language },
        });
        const demoQuestions = [
          {
            question: `¿Cuál es el concepto clave que profundizamos sobre ${parsedMeta.cleanTopic}?`,
            options: [
              `El análisis crítico y la comprensión de causas fundamentales de ${parsedMeta.cleanTopic}`,
              'La memorización mecánica sin contexto',
              'La dispersión de conceptos no relacionados',
              'El descarte de evidencias comprobadas'
            ],
            correctIndex: 0,
            explanation: `El aprendizaje significativo en ${parsedMeta.cleanTopic} requiere articular causas y efectos reales.`,
            timeLimitSeconds: 60,
          },
        ];
        const demoBlocks: any[] = [
          {
            id: `demo-class-${ts}-1`,
            type: 'text_narrative',
            title: `1. Clase Maestra Demo: ${parsedMeta.cleanTopic}`,
            badgeLabel: 'MODO CUENTAS DEMO',
            isStartNode: true,
            position: { x: 60, y: 120 },
            data: {
              content: `Sesión interactiva efímera generada en Modo Cuentas Demo sobre **${parsedMeta.cleanTopic}** (${parsedMeta.gradeLabel} · ${parsedMeta.faseNem}). Ningún archivo fue escrito en la Bóveda Curricular de producción.`,
              style: 'instruction',
              speakerName: `Guía Docente · ${parsedMeta.gradeLabel}`,
            },
          },
          {
            id: `demo-quiz-${ts}-2`,
            type: 'quiz_question',
            title: '2. Reactivo Formativo Demo',
            badgeLabel: 'PREGUNTA 1',
            position: { x: 390, y: 120 },
            data: demoQuestions[0],
          },
        ];
        const demoConnections = [
          { id: `demo-conn-${ts}-1`, sourceNodeId: demoBlocks[0].id, targetNodeId: demoBlocks[1].id, label: 'next' },
        ];
        return NextResponse.json({
          success: true,
          demoSandbox: true,
          ephemeralId: eph.id,
          title: `Clase Interactiva Demo: ${parsedMeta.cleanTopic} (${parsedMeta.gradeLabel})`,
          description: `Actividad efímera generada en sesión Demo Sandbox para ${parsedMeta.cleanTopic} sin modificar la Bóveda Curricular.`,
          language,
          template_type: template_type || templateType || 'master_class',
          metadata: {
            title: `Clase Interactiva Demo: ${parsedMeta.cleanTopic} (${parsedMeta.gradeLabel})`,
            description: `Actividad efímera generada en sesión Demo Sandbox para ${parsedMeta.cleanTopic}.`,
            subject: campoFormativo || 'Saberes y Pensamiento Científico',
            targetAge: parsedMeta.gradeLabel,
            campoFormativo: campoFormativo || 'Saberes y Pensamiento Científico',
            faseNem: parsedMeta.faseNem,
            pdaNem: `Explora y aplica los fundamentos de ${parsedMeta.cleanTopic} en ${parsedMeta.gradeLabel}.`,
            totalTimeLimit: 1800,
            livesCount: 3,
            streakMultiplier: true,
            language,
          },
          blocks: demoBlocks,
          connections: demoConnections,
          startNodeId: demoBlocks[0].id,
          questions: demoQuestions,
          relatedResources: [],
          teacherMonitoringRubric: {
            checkpoints: ['Lectura de Clase Demo', 'Reactivo Formativo'],
            alertThresholdPercent: 70,
            linkedPlanningTitle: parsedMeta.cleanTopic,
          },
          tokenTelemetry: {
            fromVault: false,
            promptTokens: 0,
            outputTokens: 0,
            thoughtsTokens: 0,
            totalTokens: 0,
            costUsd: 0,
            costMxn: 0,
            fxRateMxnPerUsd: 19.7,
            inputRateUsdPer1M: 0.25,
            outputRateUsdPer1M: 1.5,
            engineLabel: 'Modo Cuentas Demo (Sesión Efímera · 0 Escrituras en Bóveda)',
          },
          vaultRelativePath: '',
          planeacionViewerUrl: '',
          persistedInVault: false,
          fromVault: false,
          gradeLabel: parsedMeta.gradeLabel,
          cleanTopic: parsedMeta.cleanTopic,
        });
      }

      const master = await generateOrFetchStudioMasterClass({
        topic,
        grade,
        faseNem: fase,
        gamificationStyle: gamificationStyle as any,
        language,
        forceRegenerate,
      });

      const masterQuestions = master.blocks
        .filter((b) => b.type === 'quiz_question')
        .map((b: any) => ({
          question: b.data.question,
          options: b.data.options,
          correctIndex: b.data.correctIndex,
          explanation: b.data.explanation,
          timeLimitSeconds: b.data.timeLimitSeconds,
        }));

      return NextResponse.json({
        success: true,
        title: master.metadata.title,
        description: master.metadata.description,
        language,
        template_type: template_type || templateType || 'master_class',
        metadata: master.metadata,
        blocks: master.blocks,
        connections: master.connections,
        startNodeId: master.startNodeId,
        questions: masterQuestions,
        relatedResources: master.relatedResources,
        teacherMonitoringRubric: master.teacherMonitoringRubric,
        tokenTelemetry: master.tokenTelemetry,
        vaultRelativePath: master.vaultRelativePath,
        planeacionViewerUrl: master.planeacionViewerUrl,
        persistedInVault: master.persistedInVault,
        fromVault: master.tokenTelemetry.fromVault,
        gradeLabel: master.gradeLabel,
        cleanTopic: master.cleanTopic,
      });
    }

    if (isDemoSandbox) {
      const readingText = getEscapeRoomReadingText(topic, language);
      const ts = Date.now();
      const eph = recordEphemeralVaultItem('planning', {
        actorEmail: auth.user.email,
        title: `Escape Room Demo: ${topic}`,
        payload: { faseNem: fase, language, template_type: 'escape_room' },
      });
      const demoEscapeQuestions = [
        {
          question: `A partir del texto de lectura, ¿por qué el estudio de ${topic} constituye un pilar fundamental?`,
          options: [
            'Porque permite comprender causas primarias, evolución conceptual y repercusiones directas',
            'Porque promueve la memorización mecánica sin contexto',
            'Porque descarta evidencias documentales',
            'Porque evita el pensamiento crítico'
          ],
          correctIndex: 0,
          explanation: `El análisis de causas primarias y evolución conceptual fundamenta el dominio de ${topic}.`,
          timeLimitSeconds: 60,
        },
      ];
      const demoBlocks: any[] = [
        {
          id: `demo-esc-narr-${ts}-1`,
          type: 'text_narrative',
          title: `Misión Escape Room Demo: ${topic}`,
          badgeLabel: 'MODO CUENTAS DEMO',
          isStartNode: true,
          position: { x: 60, y: 120 },
          data: { content: readingText, style: 'mystery', speakerName: 'Guía del Escape Room' },
        },
        {
          id: `demo-esc-quiz-${ts}-2`,
          type: 'quiz_question',
          title: 'Candado Analítico 1',
          badgeLabel: 'CANDADO 1',
          position: { x: 390, y: 120 },
          data: demoEscapeQuestions[0],
        },
      ];
      return NextResponse.json({
        success: true,
        demoSandbox: true,
        persistedInVault: false,
        ephemeralId: eph.id,
        title: `Escape Room Demo: ${topic}`,
        description: `Aventura efímera generada en Modo Cuentas Demo sobre ${topic} (0 escrituras en Bóveda Curricular).`,
        language,
        readingText,
        template_type: 'escape_room',
        metadata: {
          title: `Escape Room Demo: ${topic}`,
          description: `Aventura efímera generada en Modo Cuentas Demo sobre ${topic}.`,
          subject: campoFormativo || 'Saberes y Pensamiento Científico',
          targetAge: grade || fase,
          campoFormativo: campoFormativo || 'Saberes y Pensamiento Científico',
          faseNem: fase,
          language,
          readingText,
        },
        blocks: demoBlocks,
        connections: [
          { id: `demo-esc-conn-${ts}-1`, sourceNodeId: demoBlocks[0].id, targetNodeId: demoBlocks[1].id, label: 'next' },
        ],
        startNodeId: demoBlocks[0].id,
        questions: demoEscapeQuestions,
      });
    }

    // Construcción e inyección del SYSTEM PROMPT dinámico
    const systemPrompt = getStudioSystemPrompt(language, isEscapeRoom, topic);

    // 2. Generación profunda mediante el Generador IA y Motor Pedagógico Gamificado de ISkool
    const generatedProject = await generateGamifiedProject({
      topic,
      faseNem: fase,
      campoFormativo,
      gamificationStyle: gamificationStyle as any,
      questionCount,
      language,
      systemPrompt
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

    // Fallbacks formativos según el idioma de generación y modalidad
    const fallbackQuestionsByLang: Record<string, any[]> = {
      'Inglés B2': isEscapeRoom ? [
        {
          question: `According to the reading text, what is essential for developing critical thinking regarding ${topic}?`,
          options: [
            `Systemic inquiry into the underlying mechanisms and impacts of ${topic}`,
            'Passive memorization of isolated dates',
            'Avoiding connection to practical applications',
            'Rejecting evidence-based problem solving'
          ],
          correctIndex: 0,
          explanation: `The text explicitly states that systemic inquiry into underlying mechanisms is essential to master ${topic}.`
        },
        {
          question: `How does the text suggest students can decipher complex challenges in ${topic}?`,
          options: [
            'By examining causal relationships and contrasting distinct perspectives',
            'By guessing random answers without analyzing the passage',
            'By skipping the theoretical framework entirely',
            'By ignoring chronological transformations'
          ],
          correctIndex: 0,
          explanation: 'Examining causal relationships and contrasting perspectives allows students to unlock deeper analytical capabilities.'
        },
        {
          question: `What is the primary role of theoretical frameworks highlighted in the second paragraph?`,
          options: [
            'Connecting principles with evidence-based problem solving',
            'Replacing empirical observation completely',
            'Creating unnecessary academic friction',
            'Restricting analytical competence'
          ],
          correctIndex: 0,
          explanation: 'Theoretical frameworks must be connected directly with evidence-based problem solving.'
        }
      ] : [
        {
          question: `What is the key core concept we delve into regarding ${topic}?`,
          options: [
            `Critical analysis and comprehension of the fundamental causes of ${topic}`,
            'Rote memorization without context',
            'Scattering of unrelated facts',
            'Dismissal of verified evidence'
          ],
          correctIndex: 0,
          explanation: `Meaningful learning in ${topic} requires connecting causes and authentic effects.`
        }
      ],
      'Francés A2': isEscapeRoom ? [
        {
          question: `Selon le texte de lecture, quel est le premier objectif de l'étude sur ${topic} ?`,
          options: [
            `Développer la pensée critique et comprendre les causes fondamentales de ${topic}`,
            'Mémoriser des définitions sans réfléchir',
            'Éviter toute analyse logique du problème',
            'Ignorer les liens avec la réalité contemporaine'
          ],
          correctIndex: 0,
          explanation: `Le texte indique que l'étude de ${topic} développe les compétences analytiques et la pensée critique.`
        },
        {
          question: `D'après le deuxième paragraphe, comment les apprenants peuvent-ils surmonter chaque défi ?`,
          options: [
            'En observant attentivement les détails et les principes directeurs',
            'En devinant au hasard sans lire le texte',
            'En éliminant les explications pédagogiques',
            'En ignorant les situations concrètes'
          ],
          correctIndex: 0,
          explanation: "L'observation attentive des détails permet de résoudre les énigmes avec succès."
        },
        {
          question: `Que permet d'établir la compréhension approfondie de ${topic} ?`,
          options: [
            'Des liens clairs entre les théories et les situations concrètes',
            'Une séparation totale avec la pratique',
            'Une mémorisation mécanique superficielle',
            'Le rejet des données vérifiées'
          ],
          correctIndex: 0,
          explanation: 'Elle permet de relier solidement les principes théoriques aux applications concrètes.'
        }
      ] : [
        {
          question: `Quel est le concept clé que nous approfondissons sur ${topic} ?`,
          options: [
            `L'analyse critique et la compréhension des causes fondamentales de ${topic}`,
            'La mémorisation mécanique sans contexte',
            'La dispersion de concepts non reliés',
            'Le rejet des faits vérifiés'
          ],
          correctIndex: 0,
          explanation: `L'apprentissage significatif de ${topic} nécessite d'articuler des causes et des effets réels.`
        }
      ],
      'Español': isEscapeRoom ? [
        {
          question: `A partir del texto de lectura, ¿por qué el estudio de ${topic} constituye un pilar fundamental?`,
          options: [
            `Porque permite comprender causas primarias, evolución conceptual y repercusiones directas`,
            'Porque promueve la memorización mecánica de fechas y nombres sin contexto',
            'Porque sustituye la necesidad de comprobar evidencias empíricas',
            'Porque descarta la articulación lógica con la realidad cotidiana'
          ],
          correctIndex: 0,
          explanation: `El primer párrafo fundamenta que analizar causas primarias y evolución conceptual explica la relevancia de ${topic}.`
        },
        {
          question: `Según el segundo párrafo, ¿qué exigencia demanda el dominio de esta temática para abrir los candados del saber?`,
          options: [
            'Una rigurosa articulación entre la teoría y la resolución práctica de problemas',
            'Avanzar rápidamente sin verificar las premisas textuales',
            'Elegir respuestas al azar sin sustento documental',
            'Omitir las deducciones críticas para ahorrar tiempo'
          ],
          correctIndex: 0,
          explanation: 'El texto señala textualmente la necesidad de articular teoría y resolución práctica mediante deducción crítica.'
        },
        {
          question: `¿Cuál es el método clave que señala la lectura para desbloquear con éxito cada enigma de ${topic}?`,
          options: [
            'Conectar evidencias documentales con deducciones críticas basadas en la lectura atenta',
            'Memorizar enunciados aislados sin relación entre sí',
            'Descartar el análisis de causas primarias',
            'Depender de la intuición inmediata sin contrastar datos'
          ],
          correctIndex: 0,
          explanation: 'La lectura atenta y el contraste de evidencias documentales con deducciones críticas son el núcleo del desbloqueo.'
        }
      ] : [
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
    };

    // Si es escape room, extraer o generar el readingText de 2 párrafos
    let readingText: string | undefined = undefined;
    if (isEscapeRoom) {
      const narrativeBlock = generatedProject.blocks.find((b: any) => b.type === 'text_narrative');
      const narrativeContent = (narrativeBlock as any)?.data?.content;
      if (narrativeContent && typeof narrativeContent === 'string' && narrativeContent.length > 80) {
        readingText = narrativeContent.includes('\n\n')
          ? narrativeContent
          : `${narrativeContent}\n\n${getEscapeRoomReadingText(topic, language).split('\n\n')[1]}`;
      } else {
        readingText = getEscapeRoomReadingText(topic, language);
      }
    }

    return NextResponse.json({
      success: true,
      title: generatedProject.metadata.title,
      description: generatedProject.metadata.description,
      language,
      readingText,
      template_type: isEscapeRoom ? 'escape_room' : (template_type || templateType || 'trivia'),
      metadata: { ...generatedProject.metadata, language, readingText },
      blocks: generatedProject.blocks,
      connections: generatedProject.connections,
      startNodeId: generatedProject.startNodeId,
      questions: questions.length > 0 ? questions : (fallbackQuestionsByLang[language] || fallbackQuestionsByLang['Español'])
    });
  } catch (error: any) {
    console.error('Error en el endpoint de generación del Estudio ISkool:', error);
    return NextResponse.json(
      { error: 'Error al generar la actividad gamificada con el motor pedagógico.' },
      { status: 500 }
    );
  }
}

