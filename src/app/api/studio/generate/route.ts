import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateGamifiedProject } from '@/services/pedagogicalProjectEngine';
import { validateApiAuth } from '@/lib/authValidator';

const StudioGenerateSchema = z.object({
  topic: z.string().trim().min(2, 'El parámetro "topic" debe tener al menos 2 caracteres').max(200, 'El tema es demasiado largo'),
  ageGroup: z.string().trim().max(100).optional().default('Fase 5'),
  faseNem: z.string().trim().max(100).optional(),
  campoFormativo: z.string().trim().max(100).optional(),
  template_type: z.string().trim().optional(),
  templateType: z.string().trim().optional(),
  gamificationStyle: z.string().trim().optional().default('rpg_adventure'),
  questionCount: z.coerce.number().int().min(1).max(20).optional().default(5),
  language: z.string().trim().optional().default('Español')
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
    // 0. Verificación estricta de Autenticación Zero-Trust
    const auth = await validateApiAuth(req);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'No autorizado. Se requiere sesión activa de ISkool para generar actividades en el Estudio.' },
        { status: 401 }
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
      ageGroup, 
      faseNem: inputFaseNem, 
      campoFormativo, 
      template_type,
      templateType,
      gamificationStyle: rawStyle, 
      questionCount,
      language = 'Español'
    } = parsedBody.data;

    const isEscapeRoom = template_type === 'escape_room' || templateType === 'escape_room' || rawStyle === 'escape_room';
    const gamificationStyle = isEscapeRoom ? 'escape_room' : rawStyle;
    const fase = inputFaseNem || ageGroup || 'Fase 5';

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

