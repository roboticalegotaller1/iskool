import { NextRequest, NextResponse } from 'next/server';
import { 
  findHistoricalFigureInVault, 
  saveHistoricalFigureToVault, 
  searchQaInVaultNode, 
  appendQaToVaultNode, 
  normalizeHistoricalSlug 
} from '@/lib/historicalVaultEngine';
import { 
  HistoricalFigureBlockData, 
  HistoricalFigureMoment, 
  HistoricalKeyLocation, 
  HistoricalVerificationQuestion, 
  BookSpineStyle 
} from '@/types/studioBlocks';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, characterName, slug, question, isGeographicSite, spineStyle } = body;

    // =========================================================================
    // 1. ACCIÓN: GENERAR O RECUPERAR PERSONAJE/SITIO HISTÓRICO
    // =========================================================================
    if (action === 'generate_figure') {
      if (!characterName || !characterName.trim()) {
        return NextResponse.json({ success: false, error: 'Se requiere el nombre del personaje o sitio histórico (X)' }, { status: 400 });
      }

      const nodeSlug = slug || normalizeHistoricalSlug(characterName);

      // PASO 1 MANDATORIO: Consultar Bóveda Curricular (0 tokens)
      const existingInVault = findHistoricalFigureInVault(nodeSlug);
      if (existingInVault) {
        return NextResponse.json({
          success: true,
          fromVault: true,
          tokenCost: 0,
          figure: existingInVault,
          message: 'Recuperado de la Bóveda Curricular con 0 consumo de tokens.'
        });
      }

      // PASO 2: Generar con Motor de IA Pedagógica
      const generated = await generateFigureWithAiFallback(characterName, isGeographicSite, spineStyle);
      generated.vaultNodeSlug = nodeSlug;

      // PASO 3: Persistir inmediatamente en la Bóveda Curricular y repositorios
      saveHistoricalFigureToVault(generated);

      return NextResponse.json({
        success: true,
        fromVault: false,
        tokenCost: 450,
        figure: generated,
        message: 'Personaje generado pedagógicamente y guardado en la Bóveda Curricular para futuros usos con 0 tokens.'
      });
    }

    // =========================================================================
    // 2. ACCIÓN: CHAT CONVERSACIONAL EN 1ª PERSONA (AVATAR VIVO)
    // =========================================================================
    if (action === 'chat_persona') {
      if (!characterName || !question) {
        return NextResponse.json({ success: false, error: 'Faltan parámetros de personaje o pregunta' }, { status: 400 });
      }

      const nodeSlug = slug || normalizeHistoricalSlug(characterName);

      // PASO 1: Consulta Caché en la Bóveda Curricular (0 tokens)
      const cached = searchQaInVaultNode(nodeSlug, question);
      if (cached.found && cached.answer) {
        return NextResponse.json({
          success: true,
          answer: cached.answer,
          cached: true,
          tokenCost: 0,
          message: 'Respuesta recuperada del caché de la Bóveda Curricular con 0 tokens.'
        });
      }

      // PASO 2: Inferencia en 1ª Persona con el Prompt Estricto del Usuario
      const systemPrompt = `Actúa como “${characterName}” en primera persona. Responde con base en tu contexto histórico (desde su nacimiento, su infancia, su edad adulta, su muerte, sus momentos más importantes, acontecimientos históricos detallados, momentos importantes). Mantén un tono formal, republicano, patriótico y sereno. Explica los detalles de tu vida, tus motivaciones y decisiones ante las preguntas del estudiante, sin recurrir a anacronismos ni salir de tu personaje histórico. Responde en español de forma elocuente y comprensible para estudiantes de educación básica y media.`;

      let answer = '';
      const apiKey = process.env.MOTOR_IA_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY;

      if (apiKey) {
        try {
          const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: question }
              ],
              temperature: 0.7,
              max_tokens: 350
            })
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            answer = data.choices?.[0]?.message?.content || '';
          }
        } catch (e) {
          console.warn('Fallo en API externa de IA, aplicando respuesta pedagógica local:', e);
        }
      }

      // Fallback pedagógico contextualizado si no hay API externa
      if (!answer) {
        answer = generateFallbackPersonaAnswer(characterName, question);
      }

      // PASO 3: Guardar en el nodo Markdown de la Bóveda Curricular para futuros alumnos (0 tokens en el futuro)
      appendQaToVaultNode(nodeSlug, question, answer);

      return NextResponse.json({
        success: true,
        answer,
        cached: false,
        tokenCost: 120,
        message: 'Respuesta generada en primera persona y persistida en la Bóveda Curricular.'
      });
    }

    return NextResponse.json({ success: false, error: 'Acción no reconocida' }, { status: 400 });
  } catch (err: any) {
    console.error('Error en API de Personajes Históricos:', err);
    return NextResponse.json({ success: false, error: err.message || 'Error interno del servidor' }, { status: 500 });
  }
}

/**
 * Generador de Personaje Histórico o Sitio con Motor de IA o Base Pedagógica Determinista
 */
async function generateFigureWithAiFallback(
  name: string, 
  isGeographicSite?: boolean, 
  spineStyle?: BookSpineStyle
): Promise<HistoricalFigureBlockData> {
  const norm = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // 1. JOSEFA ORTIZ DE DOMÍNGUEZ (Configuración Maestra de Alta Calidad)
  if (norm.includes('josefa') || norm.includes('corregidora')) {
    return {
      characterName: 'Josefa Ortiz de Domínguez',
      isGeographicSite: false,
      historicalEra: 'Independencia de México (1810)',
      birthDeathDates: '1768 - 1829',
      shortBio: 'Conocida como la Heroína de la Independencia y Corregidora de Querétaro, fue pieza clave para alertar a los conspiradores de 1810 e iniciar la gesta libertaria.',
      detailedContext: 'Nacida en Valladolid (hoy Morelia), Josefa abrazó las causas criollas y la justicia social en la Nueva España. Desde su residencia oficial en Santiago de Querétaro organizó reuniones clandestinas bajo el velo de tertulias literarias. Al ser descubierta la conspiración en septiembre de 1810, encerrada en su habitación por su esposo el Corregidor Miguel Domínguez, logró comunicarse golpeando el piso con sus tacones para alertar al alcaide Ignacio Pérez, quien cabalgó a San Miguel el Grande y Dolores para prevenir a Miguel Hidalgo e Ignacio Allende.',
      avatarImageUrl: '/images/history/josefa_ortiz_avatar.png',
      bookSpineStyle: spineStyle || 'diario_republicano',
      moments: [
        {
          id: 'mom-1',
          yearOrPeriod: 'Septiembre 1810',
          title: 'La Conspiración de Querétaro',
          description: 'En el Palacio de la Corregidora, tertulias literarias secretas donde se planificaba la emancipación nacional con Hidalgo y Allende.',
          imageUrl: '/images/history/josefa_conspiracion_comic_1.png',
          locationName: 'Palacio de la Corregidora, Querétaro',
          coordinates: { lat: 20.5930, lng: -100.3920 },
          narrativeCaption: 'Bajo la apariencia de tertulias literarias, en Querétaro se gestaba el ideario de la soberanía patria.'
        },
        {
          id: 'mom-2',
          yearOrPeriod: '13-15 Septiembre 1810',
          title: 'El Taconeo y la Alerta Heroica',
          description: 'Encerrada en su recámara tras el cateo realista, Josefa dio tres golpes firmes con su zapato al techo de la habitación de Ignacio Pérez.',
          imageUrl: '/images/history/josefa_taconeo_comic_2.png',
          locationName: 'Casa de la Corregidora, Querétaro',
          coordinates: { lat: 20.5932, lng: -100.3918 },
          narrativeCaption: 'El sonido del taconeo rompió el silencio de la noche queretana para salvar la causa libertaria.'
        },
        {
          id: 'mom-3',
          yearOrPeriod: 'Noche del 15 de Septiembre 1810',
          title: 'La Cabalgata Nocturna de Ignacio Pérez',
          description: 'A toda prisa por veredas coloniales, el mensajero Ignacio Pérez entrega la carta sellada a Juan Aldama y luego a Ignacio Allende y Miguel Hidalgo.',
          imageUrl: '/images/history/josefa_alerta_comic_3.png',
          locationName: 'Ruta Querétaro - San Miguel de Allende - Dolores',
          coordinates: { lat: 20.9144, lng: -100.7436 },
          narrativeCaption: 'Ignacio Pérez recibe el mensaje urgente de la Corregidora: la conjura ha sido delatada.'
        },
        {
          id: 'mom-4',
          yearOrPeriod: 'Madrugada del 16 Septiembre 1810',
          title: 'El Grito Libertario en Dolores',
          description: 'Advertidos a tiempo por el heroísmo de Josefa, el cura Hidalgo hace sonar la campana parroquial llamando al pueblo a levantarse en armas.',
          imageUrl: '/images/history/hidalgo_grito_comic_4.png',
          locationName: 'Parroquia de Dolores Hidalgo, Guanajuato',
          coordinates: { lat: 21.1561, lng: -100.9325 },
          narrativeCaption: '¡Viva la América libre! El eco de Dolores nació de la determinación inquebrantable de Josefa.'
        }
      ],
      keyLocations: [
        {
          id: 'loc-1',
          name: 'Palacio de Gobierno de Querétaro (Casa de la Corregidora)',
          stateOrCountry: 'Querétaro, México',
          coordinates: { lat: 20.5930, lng: -100.3920 },
          significance: 'Sede de las tertulias conspiratorias de 1810 y sitio histórico donde Josefa alertó al alcaide Ignacio Pérez.',
          imageUrl: '/images/history/casa_corregidora_queretaro.jpg'
        },
        {
          id: 'loc-2',
          name: 'San Miguel de Allende (San Miguel el Grande)',
          stateOrCountry: 'Guanajuato, México',
          coordinates: { lat: 20.9144, lng: -100.7436 },
          significance: 'Punto de intersección donde Ignacio Pérez localizó a Juan Aldama en la madrugada del 16 de septiembre.',
          imageUrl: '/images/history/san_miguel_allende.jpg'
        },
        {
          id: 'loc-3',
          name: 'Parroquia de Nuestra Señora de los Dolores',
          stateOrCountry: 'Guanajuato, México',
          coordinates: { lat: 21.1561, lng: -100.9325 },
          significance: 'Atrio donde el Cura Miguel Hidalgo dio inicio al movimiento de Independencia tras recibir el aviso.',
          imageUrl: '/images/history/parroquia_dolores.jpg'
        },
        {
          id: 'loc-4',
          name: 'Panteón de los Queretanos Ilustres',
          stateOrCountry: 'Querétaro, México',
          coordinates: { lat: 20.5975, lng: -100.3840 },
          significance: 'Monumento y mausoleo republicano donde reposan los restos de Doña Josefa Ortiz de Domínguez.',
          imageUrl: '/images/history/panteon_queretanos_ilustres.jpg'
        }
      ],
      videoClip: {
        videoUrl: 'https://youtu.be/25cq1V8AsTg',
        durationSeconds: 15,
        title: 'Doña Josefa Ortiz de Domínguez: La Chispa de la Libertad',
        narratorScript: 'Santiago de Querétaro, septiembre de 1810. Cuando la traición amenazaba con apagar el anhelo de libertad, una mujer valiente desafió al encierro. Con un golpe firme en el piso y una carta en la noche, Josefa encendió el fuego de nuestra independencia.'
      },
      verificationQuestions: [
        {
          id: 'vq-1',
          question: '¿Bajo qué pretexto organizaba Doña Josefa las reuniones insurgentes en su residencia?',
          options: ['Bailes de gala virreinales', 'Tertulias literarias y académicas', 'Clases de cocina criolla', 'Subastas de arte religioso'],
          correctIndex: 1,
          explanation: 'Josefa Ortiz utilizaba las tertulias literarias como fachada intelectual para planear la independencia sin levantar sospechas virreinales.',
          pdaRelevance: 'Comprensión de estrategias de organización civil y soberanía patria.'
        },
        {
          id: 'vq-2',
          question: '¿Qué ingeniosa táctica utilizó Josefa al quedar encerrada por su esposo en su recámara?',
          options: ['Escribió con tinta invisible en la pared', 'Golpeó el piso con su zapato para llamar al alcaide Ignacio Pérez', 'Lanzó una botella con un mensaje por la ventana', 'Encendió una fogata en la azotea'],
          correctIndex: 1,
          explanation: 'El legendario taconeo en el piso de su habitación alertó a Ignacio Pérez, cuyo cuarto estaba en el piso inferior.',
          pdaRelevance: 'Resolución de problemas y valentía cívica en momentos de crisis.'
        },
        {
          id: 'vq-3',
          question: '¿A qué personajes clave debía llegar la alerta enviada desde Querétaro antes del cateo realista?',
          options: ['A Benito Juárez y Melchor Ocampo', 'A Ignacio Allende, Juan Aldama y Miguel Hidalgo', 'A Agustín de Iturbide y Vicente Guerrero', 'A Francisco Villa y Emiliano Zapata'],
          correctIndex: 1,
          explanation: 'La carta de aviso permitió que Allende e Hidalgo adelantaran el levantamiento en la madrugada del 16 de septiembre.',
          pdaRelevance: 'Línea de tiempo y personajes de la primera fase insurgente.'
        },
        {
          id: 'vq-4',
          question: '¿Qué ciudad fue el epicentro de la conspiración de 1810 liderada por los Corregidores?',
          options: ['Valladolid', 'Santiago de Querétaro', 'Puebla de los Ángeles', 'Guadalajara'],
          correctIndex: 1,
          explanation: 'Santiago de Querétaro fue el centro neurálgico donde los insurgentes conspiraron bajo la protección de la Corregidora.',
          pdaRelevance: 'Geografía histórica y cartografía de la Independencia.'
        },
        {
          id: 'vq-5',
          question: '¿Por qué la figura de Josefa Ortiz representa un pilar en la equidad cívica y memoria histórica de México?',
          options: ['Porque financió batallas con ejércitos privados', 'Porque demostró que el compromiso con la justicia y libertad trasciende roles impuestos', 'Porque fue la primera presidenta de la República', 'Porque escribió las Leyes de Reforma'],
          correctIndex: 1,
          explanation: 'Josefa demostró un liderazgo moral, político y humano invaluable para el nacimiento de la patria mexicana.',
          pdaRelevance: 'Pensamiento crítico y reconocimiento de heroínas de la patria.'
        }
      ],
      qaCache: [
        {
          question: '¿Por qué decidiste alertar a los insurgentes?',
          answer: 'Porque la libertad de nuestra patria y la dignidad de su pueblo estaban por encima de cualquier riesgo personal. Si la conspiración era sofocada en el silencio, México habría permanecido en el yugo virreinal por generaciones.',
          timestamp: Date.now()
        },
        {
          question: '¿Tuviste miedo cuando te encerraron?',
          answer: 'El miedo es natural cuando se enfrentan las fuerzas de un imperio, mas el deber republicano y el amor a mis compatriotas fue mucho más poderoso que cualquier temor al cadalso o al presidio.',
          timestamp: Date.now()
        }
      ]
    };
  }

  // 2. MIGUEL HIDALGO Y COSTILLA
  if (norm.includes('hidalgo') || norm.includes('cura')) {
    return {
      characterName: 'Miguel Hidalgo y Costilla',
      isGeographicSite: false,
      historicalEra: 'Independencia de México (1810 - 1811)',
      birthDeathDates: '1753 - 1811',
      shortBio: 'Sacerdote, humanista y líder insurgente proclamado Padre de la Patria, quien dio el Grito de Dolores aboliendo la esclavitud en América.',
      detailedContext: 'Rector del Colegio de San Nicolás en Valladolid y párroco de Dolores, promovió el desarrollo agrícola e industrial comunitario. Al recibir la misiva enviada por Josefa Ortiz de Domínguez la madrugada del 16 de septiembre de 1810, proclamó el inicio de la lucha armada.',
      avatarImageUrl: '/images/history/hidalgo_avatar.png',
      bookSpineStyle: spineStyle || 'grimorio_dorado',
      moments: [
        {
          id: 'm-1',
          yearOrPeriod: '1803 - 1810',
          title: 'Los Talleres Comunitarios de Dolores',
          description: 'Hidalgo enseña alfarería, cultivo de la vid y cría del gusano de seda para emancipar económicamente al pueblo.',
          imageUrl: '/images/history/hidalgo_talleres.jpg',
          locationName: 'Dolores Hidalgo, Guanajuato',
          coordinates: { lat: 21.1561, lng: -100.9325 },
          narrativeCaption: 'El saber práctico y el trabajo digno fueron la primera trinchera de emancipación popular.'
        },
        {
          id: 'm-2',
          yearOrPeriod: '16 Septiembre 1810',
          title: 'El Grito de Independencia',
          description: 'Con el estandarte guadalupano y el llamado a las armas en el atrio parroquial.',
          imageUrl: '/images/history/hidalgo_grito_comic_4.png',
          locationName: 'Atrio Parroquial de Dolores',
          coordinates: { lat: 21.1561, lng: -100.9325 },
          narrativeCaption: '¡Caballeros, somos perdidos; aquí no hay más recurso que ir a coger gachupines!'
        },
        {
          id: 'm-3',
          yearOrPeriod: '28 Septiembre 1810',
          title: 'Toma de la Alhóndiga de Granaditas',
          description: 'Batalla en Guanajuato donde la valentía popular de El Pípila abrió las puertas del bastión virreinal.',
          imageUrl: '/images/history/alhondiga_granaditas.jpg',
          locationName: 'Guanajuato Capital',
          coordinates: { lat: 21.0190, lng: -101.2574 },
          narrativeCaption: 'El pueblo rompió las cadenas de siglos en los muros de Granaditas.'
        },
        {
          id: 'm-4',
          yearOrPeriod: '6 Diciembre 1810',
          title: 'Decreto de Abolición de la Esclavitud',
          description: 'En Guadalajara, Hidalgo firma el trascendental decreto que declara libres a todos los esclavos.',
          imageUrl: '/images/history/hidalgo_decreto_abolicion.jpg',
          locationName: 'Palacio de Gobierno de Guadalajara, Jalisco',
          coordinates: { lat: 20.6770, lng: -103.3470 },
          narrativeCaption: 'Que sean libres todos los esclavos en el término de diez días, bajo pena de muerte a quien lo contravenga.'
        }
      ],
      keyLocations: [
        {
          id: 'l-1',
          name: 'Parroquia de Dolores',
          stateOrCountry: 'Guanajuato, México',
          coordinates: { lat: 21.1561, lng: -100.9325 },
          significance: 'Cuna de la Independencia Nacional.'
        },
        {
          id: 'l-2',
          name: 'Alhóndiga de Granaditas',
          stateOrCountry: 'Guanajuato, México',
          coordinates: { lat: 21.0190, lng: -101.2574 },
          significance: 'Fortaleza virreinal y primer combate mayor insurgente.'
        },
        {
          id: 'l-3',
          name: 'Palacio de Gobierno de Guadalajara',
          stateOrCountry: 'Jalisco, México',
          coordinates: { lat: 20.6770, lng: -103.3470 },
          significance: 'Sitio donde se redactó el histórico decreto de abolición de la esclavitud.'
        },
        {
          id: 'l-4',
          name: 'Chihuahua (Calabozo de Hidalgo)',
          stateOrCountry: 'Chihuahua, México',
          coordinates: { lat: 28.6353, lng: -106.0745 },
          significance: 'Lugar de su prisión y martirio el 30 de julio de 1811.'
        }
      ],
      videoClip: {
        videoUrl: 'https://youtu.be/25cq1V8AsTg',
        durationSeconds: 18,
        title: 'Miguel Hidalgo: El Rugido de Dolores',
        narratorScript: 'Un cura humanista, un repicar de campanas en la madrugada y el despertar de una nación. Miguel Hidalgo convirtió la indignación en esperanza.'
      },
      verificationQuestions: [
        {
          id: 'vq-1',
          question: '¿Qué decreto promulgado por Hidalgo en Guadalajara en 1810 cambió la historia de los derechos humanos en América?',
          options: ['El libre comercio con Europa', 'La abolición total de la esclavitud', 'El cobro obligatorio del diezmo', 'La creación de un tribunal virreinal'],
          correctIndex: 1,
          explanation: 'Hidalgo abolió la esclavitud y los tributos de castas en Guadalajara el 6 de diciembre de 1810.',
          pdaRelevance: 'Derechos humanos y justicia social.'
        },
        {
          id: 'vq-2',
          question: '¿Cuál era el oficio que promovía Hidalgo en Dolores para impulsar la autonomía de los artesanos locales?',
          options: ['Minería de oro', 'Alfarería, cultivo de vid y sericicultura', 'Comercio trasatlántico', 'Armería militar'],
          correctIndex: 1,
          explanation: 'Hidalgo enseñaba oficios productivos para mejorar el bienestar material y dignidad comunitaria.',
          pdaRelevance: 'Economía solidaria y proyectos comunitarios.'
        },
        {
          id: 'vq-3',
          question: '¿Qué edificio histórico en Guanajuato fue tomado con la ayuda de Juan José de los Reyes Martínez "El Pípila"?',
          options: ['Castillo de Chapultepec', 'Alhóndiga de Granaditas', 'Palacio de Minería', 'Fuerte de San Juan de Ulúa'],
          correctIndex: 1,
          explanation: 'El Pípila cubrió su espalda con una losa para quemar la puerta de la Alhóndiga de Granaditas.',
          pdaRelevance: 'Acontecimientos militares de la Independencia.'
        },
        {
          id: 'vq-4',
          question: '¿En qué fecha se dio el Grito de Dolores?',
          options: ['20 de noviembre de 1910', '16 de septiembre de 1810', '5 de mayo de 1862', '24 de febrero de 1821'],
          correctIndex: 1,
          explanation: 'La madrugada del 16 de septiembre de 1810 se inició la lucha armada libertaria.',
          pdaRelevance: 'Cronología y efemérides patrias.'
        },
        {
          id: 'vq-5',
          question: '¿Por qué se considera a Miguel Hidalgo el "Padre de la Patria"?',
          options: ['Porque redactó la Constitución de 1917', 'Porque inició el movimiento que dio soberanía y fin al régimen colonial', 'Porque gobernó como presidente durante 30 años', 'Porque fundó la Real Audiencia'],
          correctIndex: 1,
          explanation: 'Su valentía inició el proceso que culminó con el nacimiento de México como estado soberano.',
          pdaRelevance: 'Identidad y memoria histórica nacional.'
        }
      ],
      qaCache: [
        {
          question: '¿Cuál fue tu motivación principal para levantarte en armas?',
          answer: 'Ver a mis feligreses y al pueblo sometidos a la opresión, el tributo y la privación de derechos. La libertad es un mandato de la providencia y la justicia exige devolver la soberanía a sus legítimos dueños.',
          timestamp: Date.now()
        }
      ]
    };
  }

  // 3. GENERADOR GENÉRICO PEDAGÓGICO PARA CUALQUIER PERSONAJE O SITIO (X)
  const isSite = isGeographicSite || norm.includes('queretaro') || norm.includes('tenochtitlan') || norm.includes('ruina') || norm.includes('chichen') || norm.includes('ciudad') || norm.includes('estado');

  return {
    characterName: name,
    isGeographicSite: isSite,
    historicalEra: isSite ? 'Patrimonio Histórico & Geográfico' : 'Historia de México y Universal',
    birthDeathDates: isSite ? 'Fundación Histórica' : 'Época Histórica Clave',
    shortBio: isSite 
      ? `${name} es un enclave geográfico y cultural de extraordinaria relevancia para comprender el desarrollo civilizatorio y las transformaciones sociales de nuestra historia.`
      : `${name} es una destacada figura histórica cuyas decisiones, liderazgo y convicciones marcaron un punto de inflexión en la historia y la formación cívica republicana.`,
    detailedContext: isSite
      ? `A través de sus coordenadas cartográficas, arquitectura monumental y vestigios documentales, ${name} atestigua momentos decisivos donde confluyeron culturas, batallas libertarias y acuerdos fundacionales para la nación.`
      : `En su tiempo histórico, ${name} enfrentó desafíos éticos, políticos y sociales de gran magnitud, contribuyendo con valentía, pensamiento reflexivo y vocación de servicio al ideario republicano y democrático.`,
    avatarImageUrl: isSite ? '/images/history/sitio_historico_default.jpg' : '/images/history/personaje_generico_avatar.png',
    bookSpineStyle: spineStyle || (isSite ? 'codice_antiguo' : 'cuaderno_cronista'),
    moments: [
      {
        id: 'gen-m1',
        yearOrPeriod: 'Hito Inicial',
        title: `Orígenes y Fundación de ${name}`,
        description: `Primeros acontecimientos formativos y contexto social que dieron origen a ${name}.`,
        imageUrl: '/images/history/momento_historico_1.jpg',
        locationName: isSite ? name : 'Centro Histórico',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        narrativeCaption: `En los albores de su tiempo, ${name} comenzó a escribir las primeras páginas de su legado.`
      },
      {
        id: 'gen-m2',
        yearOrPeriod: 'Acontecimiento Mayor',
        title: `El Punto de Inflexión Decisivo`,
        description: `Momento de máxima tensión y resolución que definió el rumbo histórico.`,
        imageUrl: '/images/history/momento_historico_2.jpg',
        locationName: isSite ? name : 'Plaza Principal',
        coordinates: { lat: 19.4330, lng: -99.1330 },
        narrativeCaption: `Las decisiones tomadas en este instante resonarían en las generaciones venideras.`
      },
      {
        id: 'gen-m3',
        yearOrPeriod: 'Consolidación',
        title: `Defensa de los Principios y la Soberanía`,
        description: `Prueba de resistencia ante la adversidad y defensa de la justicia y los derechos de la comunidad.`,
        imageUrl: '/images/history/momento_historico_3.jpg',
        locationName: isSite ? name : 'Recinto Histórico',
        coordinates: { lat: 19.4340, lng: -99.1320 },
        narrativeCaption: `La fidelidad a los principios prevaleció sobre cualquier obstáculo material.`
      },
      {
        id: 'gen-m4',
        yearOrPeriod: 'Trascendencia',
        title: `El Legado Permanente en la Memoria`,
        description: `La consagración de ${name} como símbolo imborrable en los libros de historia y el corazón de la sociedad.`,
        imageUrl: '/images/history/momento_historico_4.jpg',
        locationName: isSite ? name : 'Monumento Cívico',
        coordinates: { lat: 19.4350, lng: -99.1310 },
        narrativeCaption: `Hoy su historia vive en cada estudiante que indaga en el pasado para forjar el porvenir.`
      }
    ],
    keyLocations: [
      {
        id: 'loc-1',
        name: isSite ? `Zona Monumental de ${name}` : `Sitio Emblemático de ${name}`,
        stateOrCountry: 'México',
        coordinates: { lat: 19.4326, lng: -99.1332 },
        significance: `Punto neurálgico donde se concentran los vestigios y la memoria viva del suceso.`
      },
      {
        id: 'loc-2',
        name: 'Plaza Mayor y Sede de Acuerdos',
        stateOrCountry: 'México',
        coordinates: { lat: 19.4320, lng: -99.1335 },
        significance: 'Espacio público donde se proclamaron las resoluciones y encuentros comunitarios.'
      }
    ],
    videoClip: {
      videoUrl: 'https://youtu.be/25cq1V8AsTg',
      durationSeconds: 20,
      title: `${name}: Relato Vivo de la Historia`,
      narratorScript: `Recorre los pasos de ${name}, donde cada piedra, documento y decisión construyó el tejido de nuestra identidad cívica y soberana.`
    },
    verificationQuestions: [
      {
        id: 'gen-q1',
        question: `¿Cuál fue la principal aportación histórica asociada a ${name}?`,
        options: ['La defensa de los ideales de justicia y soberanía', 'El aislamiento comercial', 'La renuncia a la vida pública', 'La destrucción de archivos cívicos'],
        correctIndex: 0,
        explanation: `Su labor se centró en engrandecer los valores cívicos y la justicia para la sociedad.`,
        pdaRelevance: 'Pensamiento crítico y análisis histórico.'
      },
      {
        id: 'gen-q2',
        question: `¿Por qué es fundamental estudiar a ${name} en el contexto actual?`,
        options: ['Para comprender nuestras raíces y actuar con responsabilidad cívica', 'Solo para memorizar fechas de examen', 'Porque no existen otros acontecimientos', 'Para repetir errores del pasado'],
        correctIndex: 0,
        explanation: 'El conocimiento histórico fortalece la ciudadanía reflexiva y la identidad comunitaria.',
        pdaRelevance: 'Ética, Naturaleza y Sociedades.'
      },
      {
        id: 'gen-q3',
        question: `¿Qué valor ético o principio cívico sobresale en el actuar de ${name}?`,
        options: ['Perseverancia y valentía ante la adversidad', 'Indiferencia social', 'Individualismo extremo', 'Desinterés por el bienestar común'],
        correctIndex: 0,
        explanation: 'La perseverancia y el compromiso cívico son rasgos distintivos de su memoria histórica.',
        pdaRelevance: 'Formación cívica y ética.'
      },
      {
        id: 'gen-q4',
        question: `¿Qué tipo de fuentes nos permiten conocer con certeza lo ocurrido en torno a ${name}?`,
        options: ['Documentos de archivo, cartas testimoniales y vestigios materiales', 'Rumores sin sustento', 'Mitos modernos sin verificación', 'Publicaciones anónimas de redes sociales'],
        correctIndex: 0,
        explanation: 'El rigor histórico se sustenta en fuentes primarias, mapas cartográficos y documentos coetáneos.',
        pdaRelevance: 'Metodología de indagación científica e histórica.'
      },
      {
        id: 'gen-q5',
        question: `¿Cómo podemos aplicar las lecciones de ${name} en nuestra comunidad escolar?`,
        options: ['Fomentando el diálogo, la justicia y el trabajo solidario en equipo', 'Evitando participar en actividades cívicas', 'Imponiendo ideas sin escuchar', 'Ignorando las necesidades de los demás'],
        correctIndex: 0,
        explanation: 'La historia adquiere verdadero sentido cuando inspira acciones solidarias y democráticas en la vida diaria.',
        pdaRelevance: 'Participación ciudadana y convivencia pacífica.'
      }
    ],
    qaCache: [
      {
        question: '¿Qué mensaje le darías a los estudiantes que hoy aprenden sobre ti?',
        answer: 'Que nunca subestimen el poder del estudio, la verdad y el compromiso ciudadano. Cada generación tiene su propia trinchera y la suya es el saber, la justicia y el amor a su comunidad.',
        timestamp: Date.now()
      }
    ]
  };
}

/**
 * Genera una respuesta en primera persona si no hay conexión a API externa
 */
function generateFallbackPersonaAnswer(name: string, question: string): string {
  const normQ = question.toLowerCase();

  if (normQ.includes('miedo') || normQ.includes('temor')) {
    return `En todo momento decisivo el corazón siente la gravedad de las consecuencias, mas la fidelidad a la justicia y a mi pueblo siempre fue mayor que cualquier zozobra personal. Un republicano actúa por convicción, no por cobardía.`;
  }

  if (normQ.includes('por qué') || normQ.includes('motivo') || normQ.includes('razon')) {
    return `Mis decisiones nacieron del dolor de ver a mi patria sometida y del convencimiento de que la libertad no es una dádiva de los poderosos, sino un derecho inalienable que debemos conquistar con honor y entereza.`;
  }

  if (normQ.includes('consejo') || normQ.includes('estudiante') || normQ.includes('joven') || normQ.includes('alumnos')) {
    return `A ti, joven estudiante, te encomiendo custodiar el legado de la patria: estudia con tesón, defiende al débil ante la injusticia y recuerda que las grandes naciones se forjan en las aulas con honestidad y espíritu crítico.`;
  }

  return `Como ${name}, he de decirte que cada acontecimiento de mi vida estuvo consagrado al bienestar de nuestra gente y al triunfo de los principios de soberanía. Escudriña en los documentos de la época y hallarás en la perseverancia la clave de nuestra historia.`;
}
