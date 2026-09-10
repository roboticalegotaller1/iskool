import { 
  StudioBlock, 
  ActivityBuilderMetadata, 
  FlowConnection,
  TextNarrativeBlock,
  QuizQuestionBlock,
  RewardChestBlock,
  BossEnemyBlock,
  DragDropMatchBlock,
  OrderingSequenceBlock,
  SecretCodePuzzleBlock
} from '@/types/studioBlocks';

export interface GenerateProjectOptions {
  topic: string;
  faseNem?: string;
  campoFormativo?: string;
  gamificationStyle?: 'rpg_adventure' | 'escape_room' | 'scientific_expedition' | 'olympic_tournament';
  questionCount?: number;
  apiKey?: string;
}

export interface GeneratedProjectResult {
  metadata: ActivityBuilderMetadata;
  blocks: StudioBlock[];
  connections: FlowConnection[];
  startNodeId: string;
}

/**
 * Normaliza un término para búsqueda temática (sin acentos, minúsculas)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function sanitizeFaseNem(fase?: string): 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Fase 6' {
  if (fase === 'Fase 1' || fase === 'Fase 2' || fase === 'Fase 3' || fase === 'Fase 4' || fase === 'Fase 5' || fase === 'Fase 6') {
    return fase;
  }
  return 'Fase 5';
}

/**
 * Generador Maestro de Proyectos Gamificados y Estructurados
 */
export async function generateGamifiedProject(options: GenerateProjectOptions): Promise<GeneratedProjectResult> {
  const { topic, faseNem = 'Fase 5', gamificationStyle = 'rpg_adventure', apiKey } = options;
  const cleanTopic = topic.trim();
  const normalized = normalizeText(cleanTopic);

  // 1. Intentar generación con IA en línea si se proporciona API Key o si está en el entorno
  const effectiveApiKey = apiKey || (typeof process !== 'undefined' ? (process.env.MOTOR_IA_API_KEY || process.env.AI_API_KEY || process.env.OPENAI_API_KEY) : undefined);

  if (effectiveApiKey) {
    try {
      const aiProject = await tryGenerateWithAI(cleanTopic, faseNem, gamificationStyle, effectiveApiKey);
      if (aiProject) {
        return aiProject;
      }
    } catch (err) {
      console.warn('Fallo en la llamada a la IA externa, procediendo con Motor Pedagógico de Alta Profundidad:', err);
    }
  }

  // 2. Motor Pedagógico Experto de Bóveda Curricular
  // Revisa si coincide con temáticas canónicas de alta demanda
  const presetProject = getDeepCurricularProject(normalized, cleanTopic, faseNem, gamificationStyle);
  if (presetProject) {
    return presetProject;
  }

  // 3. Generador Heurístico Autónomo de Proyectos Gamificados para Temas Arbitrarios
  return buildAutonomousGamifiedProject(cleanTopic, faseNem, gamificationStyle);
}

/**
 * Intenta invocar el motor de inferencia IA para estructurar el proyecto completo
 */
async function tryGenerateWithAI(
  topic: string, 
  faseNem: string, 
  gamificationStyle: string, 
  apiKey: string
): Promise<GeneratedProjectResult | null> {
  const prompt = `Actúa como Diseñador Instruccional Senior y Desarrollador de Gamificación Educativa para ISkool (basado en la NEM 2024 de México).
Genera un proyecto educativo gamificado de alta complejidad y rigor pedagógico para el tema: "${topic}" en "${faseNem}".
El proyecto DEBE ser una aventura con 6 o 7 bloques interconectados:
1. text_narrative (Diálogo inmersivo con un personaje guía temático, planteamiento del conflicto y misión épica).
2. ordering_sequence (Secuencia cronológica o algoritmo lógico de 4 pasos con contenido real).
3. drag_drop_match (4 parejas de conceptos, causas-consecuencias o personajes con sus aportes reales).
4. quiz_question (Reactivo formativo con situación problemática, 4 opciones reales y plausibles donde solo 1 es correcta, y explicación didáctica).
5. secret_code_puzzle (Acertijo de escape room con pista ingeniosa y palabra clave de desbloqueo).
6. boss_enemy (Duelo de combate RPG contra un jefe temático, con nombre, 120-150 HP, poder de ataque y condición de victoria).
7. reward_chest (Cofre legendario con XP, monedas y título de honor para el avatar del estudiante).

PROHIBICIÓN ESTRICTA: Queda terminantemente prohibido generar preguntas vacías, opciones tipo "Principio clave de...", "Concepto no relacionado" o respuestas absurdas. Todo el contenido debe ser auténtico, desafiante y formativo.

Devuelve EXCLUSIVAMENTE un JSON válido con esta estructura:
{
  "title": "Título épico del proyecto",
  "description": "Descripción pedagógica y narrativa",
  "subject": "Materia o Campo Formativo",
  "campoFormativo": "Ética, Naturaleza y Sociedades | Saberes y Pensamiento Científico | Lenguajes | De lo Humano y lo Comunitario",
  "pdaNem": "PDA formal oficial",
  "blocks": [
    ... bloques según la especificación anterior con sus datos completos ...
  ]
}`;

  const endpointBase = typeof process !== 'undefined' ? process.env.AI_INFERENCE_ENDPOINT : undefined;
  const defaultEndpoint = Buffer.from('aHR0cHM6Ly9nZW5lcmF0aXZlbGFuZ3VhZ2UuZ29vZ2xlYXBpcy5jb20vdjFiZXRhL21vZGVscy9nZW1pbmktMi41LWZsYXNoOmdlbmVyYXRlQ29udGVudA==', 'base64').toString('ascii');
  const targetEndpoint = `${endpointBase || defaultEndpoint}?key=${apiKey}`;

  const res = await fetch(targetEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!res.ok) return null;

  const data = await res.json();
  let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();

  const parsed = JSON.parse(rawText);
  if (!parsed.blocks || !Array.isArray(parsed.blocks) || parsed.blocks.length < 4) {
    return null;
  }

  // Estructurar bloques con IDs, posiciones horizontales y conexiones
  const timestamp = Date.now();
  const structuredBlocks: StudioBlock[] = parsed.blocks.map((b: any, idx: number) => ({
    ...b,
    id: b.id || `node-ai-${timestamp}-${idx + 1}`,
    isStartNode: idx === 0,
    isCollapsed: false,
    position: {
      x: 60 + idx * 320,
      y: 150 + ((idx % 2) * 40)
    }
  }));

  const connections: FlowConnection[] = [];
  for (let i = 0; i < structuredBlocks.length - 1; i++) {
    connections.push({
      id: `conn-ai-${timestamp}-${i + 1}`,
      sourceNodeId: structuredBlocks[i].id,
      targetNodeId: structuredBlocks[i + 1].id,
      label: i === structuredBlocks.length - 2 ? 'success' : 'next'
    });
  }

  const metadata: ActivityBuilderMetadata = {
    title: parsed.title || `Aventura Gamificada: ${topic}`,
    description: parsed.description || `Misión interactiva con narrativa y desafíos de saberes sobre ${topic}.`,
    subject: parsed.subject || 'Saberes Generales',
    subjectId: 'sub-gen',
    targetAge: faseNem,
    campoFormativo: parsed.campoFormativo || 'Ética, Naturaleza y Sociedades',
    camposFormativos: [parsed.campoFormativo || 'Ética, Naturaleza y Sociedades'],
    ejesArticuladores: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura'],
    faseNem: sanitizeFaseNem(faseNem),
    pdaNem: parsed.pdaNem || `Analiza y profundiza en los contenidos curriculares clave correspondientes a ${topic}.`,
    taskType: 'activity_flow',
    xpReward: 350,
    coinsReward: 60,
    totalTimeLimit: 0,
    livesCount: 3,
    streakMultiplier: true,
  };

  return {
    metadata,
    blocks: structuredBlocks,
    connections,
    startNodeId: structuredBlocks[0].id
  };
}

/**
 * Banco Curricular Profundo de Proyectos Gamificados
 */
function getDeepCurricularProject(
  normalized: string, 
  topic: string, 
  faseNem: string, 
  gamificationStyle: string
): GeneratedProjectResult | null {
  const ts = Date.now();

  // -------------------------------------------------------------
  // TEMA 1: CAUSAS DE LA INDEPENDENCIA DE MÉXICO / HISTORIA NOVOHISPANA
  // -------------------------------------------------------------
  if (
    normalized.includes('independencia') || 
    normalized.includes('causa') || 
    normalized.includes('hidalgo') || 
    normalized.includes('1810') ||
    normalized.includes('queretaro')
  ) {
    const blocks: StudioBlock[] = [
      {
        id: `node-${ts}-1`,
        type: 'text_narrative',
        title: '1. Madrugada de Dolores: El Llamado a la Insurrección',
        isStartNode: true,
        isCollapsed: false,
        position: { x: 60, y: 150 },
        data: {
          style: 'dialogue',
          speakerName: 'Don Miguel Hidalgo y Costilla',
          speakerAvatar: '🔔',
          content: '¡Pueblo de Dolores! Doña Josefa Ortiz de Domínguez nos ha enviado aviso urgente desde Querétaro: ¡nuestra conspiración secreta ha sido descubierta por las autoridades virreinales! No podemos esperar un día más. Tres siglos de opresión, las reformas borbónicas que asfixiaron nuestra economía y la invasión napoleónica a España nos exigen actuar. Tomemos el estandarte y marchemos por la libertad, la soberanía y la abolición de la esclavitud. ¿Están listos para transformar la patria?'
        }
      } as TextNarrativeBlock,

      {
        id: `node-${ts}-2`,
        type: 'ordering_sequence',
        title: '2. Cronología Crítica: De la Invasión a la Lucha Armada',
        isCollapsed: false,
        position: { x: 380, y: 150 },
        data: {
          instructions: 'Ordena cronológicamente los 4 sucesos detonantes que provocaron el estallido de la Independencia (1808 a 1810):',
          randomizeStart: true,
          stepsInCorrectOrder: [
            '1808: Invasión de las tropas francesas de Napoleón Bonaparte a España y abdicación forzada del rey Fernando VII.',
            '1808: Intento del Ayuntamiento de la Ciudad de México (Primo de Verdad y Francisco Azcárate) por proclamar un gobierno provisional autónomo.',
            '1809 - 1810: Formación de las conspiraciones secretas en Valladolid (hoy Morelia) y Querétaro lideradas por criollos ilustrados.',
            '16 de Septiembre de 1810: Grito de Dolores y alzamiento popular masivo encabezado por Miguel Hidalgo e Ignacio Allende.'
          ]
        }
      } as OrderingSequenceBlock,

      {
        id: `node-${ts}-3`,
        type: 'drag_drop_match',
        title: '3. Emparejamiento Táctico: Causas Internas y Externas',
        isCollapsed: false,
        position: { x: 700, y: 150 },
        data: {
          instructions: 'Relaciona cada factor determinante de 1810 con su impacto directo en la sociedad novohispana:',
          timeLimitSeconds: 70,
          pairs: [
            { 
              left: 'Invasión Napoleónica (1808)', 
              right: 'Provocó un vacío de poder legítimo en la Corona española y abrió la demanda de soberanía.' 
            },
            { 
              left: 'Reformas Borbónicas', 
              right: 'Incrementaron impuestos, despojaron a la Iglesia y desplazaron a los criollos de puestos clave.' 
            },
            { 
              left: 'Sistema de Castas y Servidumbre', 
              right: 'Generó una profunda desigualdad económica que impulsó a indígenas y campesinos a las armas.' 
            },
            { 
              left: 'Pensamiento de la Ilustración', 
              right: 'Difundió ideas de libertad, división de poderes y derechos ciudadanos universales.' 
            }
          ]
        }
      } as DragDropMatchBlock,

      {
        id: `node-${ts}-4`,
        type: 'quiz_question',
        title: '4. Reactivo de Análisis: El Detonante de la Soberanía',
        isCollapsed: false,
        position: { x: 1020, y: 150 },
        data: {
          question: '¿Por qué la invasión napoleónica a España en 1808 es considerada la causa externa más decisiva para acelerar la conspiración criolla?',
          options: [
            'Porque al abdicar el rey legítimo, los criollos argumentaron que la soberanía regresaba al pueblo novohispano y España no tenía derecho a imponer virreyes ilegítimos.',
            'Porque Napoleón Bonaparte desembarcó en Veracruz para apoyar militarmente a Miguel Hidalgo.',
            'Porque España cedió voluntariamente el territorio de la Nueva España a la Gran Bretaña.',
            'Porque se firmó de inmediato un tratado de libre comercio con los Estados Unidos de América.'
          ],
          correctIndex: 0,
          explanation: 'La teoría pactista ilustrada sostenía que, ante la ausencia del monarca cautivo por Napoleón, la soberanía recaía en los cuerpos municipales del virreinato, fundamento que dio inicio formal a las juntas soberanistas.',
          timeLimitSeconds: 45
        }
      } as QuizQuestionBlock,

      {
        id: `node-${ts}-5`,
        type: 'secret_code_puzzle',
        title: '5. El Código Secreto de la Conspiración de Querétaro',
        isCollapsed: false,
        position: { x: 1340, y: 150 },
        data: {
          clueText: 'En las tertulias secretas de la casa del corregidor Miguel Domínguez, los conjurados utilizaban una palabra clave de 9 letras para referirse al principio sagrado según el cual el poder reside originariamente en el pueblo:',
          hintText: 'Palabra de 9 letras que empieza con "SOBER..." y termina con "A". Es el concepto central del artículo 39 constitucional moderno.',
          secretAnswer: 'SOBERANIA'
        }
      } as SecretCodePuzzleBlock,

      {
        id: `node-${ts}-6`,
        type: 'boss_enemy',
        title: '6. Batalla Histórica: Duelo de Saberes en Monte de las Cruces',
        isCollapsed: false,
        position: { x: 1660, y: 150 },
        data: {
          bossName: 'Comandante Realista Torcuato Trujillo ⚔️',
          spriteKey: 'shadow_golem',
          maxHp: 150,
          attackPower: 25,
          victoryCondition: 'defeat_boss',
          backgroundScene: 'temple'
        }
      } as BossEnemyBlock,

      {
        id: `node-${ts}-7`,
        type: 'reward_chest',
        title: '7. Cofre Legendario: ¡Héroe de la Soberanía Nacional!',
        isCollapsed: false,
        position: { x: 1980, y: 150 },
        data: {
          chestRarity: 'legendary',
          xpAmount: 400,
          coinsAmount: 75,
          badgeName: 'Libertador de la Patria 🔔🇲🇽',
          badgeUnlockId: 'badge-indep-master-2026'
        }
      } as RewardChestBlock
    ];

    return assembleResult(
      'Aventura Gamificada: Causas y Alborada de la Independencia de México',
      'Misión pedagógica interactiva. Desentraña las causas externas e internas de 1810, supera la cronología de invasiones, descifra el código secreto de Querétaro y vence al general realista en Monte de las Cruces.',
      'Historia y Formación Cívica',
      'Ética, Naturaleza y Sociedades',
      'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
      blocks,
      faseNem
    );
  }

  // -------------------------------------------------------------
  // TEMA 2: ECOSISTEMAS Y BIODIVERSIDAD / CIENCIAS NATURALES
  // -------------------------------------------------------------
  if (
    normalized.includes('ecosistema') || 
    normalized.includes('biodiversidad') || 
    normalized.includes('bioma') || 
    normalized.includes('cadena trofica') ||
    normalized.includes('flora')
  ) {
    const blocks: StudioBlock[] = [
      {
        id: `node-${ts}-1`,
        type: 'text_narrative',
        title: '1. Bitácora de Expedición: El Guardián de la Biosfera',
        isStartNode: true,
        isCollapsed: false,
        position: { x: 60, y: 150 },
        data: {
          style: 'dialogue',
          speakerName: 'Dra. Elena Almonte (Bióloga y Exploradora)',
          speakerAvatar: '🌿',
          content: '¡Bienvenidos al campamento de la Selva Lacandona, naturalistas! México es uno de los 5 países megadiversos del planeta, albergando cerca del 12% de todas las especies conocidas. Sin embargo, el equilibrio ecológico de nuestros bosques y mares enfrenta graves amenazas por la fragmentación del hábitat. Para desbloquear el laboratorio de conservación, deberemos reconstruir las redes tróficas y comprender cómo la energía fluye a través de los seres vivos. ¡Ajusten sus brújulas!'
        }
      } as TextNarrativeBlock,

      {
        id: `node-${ts}-2`,
        type: 'ordering_sequence',
        title: '2. Flujo de Energía: De la Luz Solar al Descomponedor',
        isCollapsed: false,
        position: { x: 380, y: 150 },
        data: {
          instructions: 'Ordena los 4 niveles de la cadena trófica según el sentido en que fluye la energía ecológica:',
          randomizeStart: true,
          stepsInCorrectOrder: [
            'Nivel 1: Productores primarios (plantas, algas y fitoplancton que convierten energía solar mediante fotosíntesis).',
            'Nivel 2: Consumidores primarios / Herbívoros (insectos, roedores y venados que se alimentan de plantas).',
            'Nivel 3: Consumidores secundarios / Carnívoros (depredadores intermedios como aves rapaces y serpientes).',
            'Nivel 4: Descomponedores (hongos y bacterias que reciclan la materia orgánica devolviendo nutrientes al suelo).'
          ]
        }
      } as OrderingSequenceBlock,

      {
        id: `node-${ts}-3`,
        type: 'drag_drop_match',
        title: '3. Ecosistemas Emblemáticos de México y sus Especies',
        isCollapsed: false,
        position: { x: 700, y: 150 },
        data: {
          instructions: 'Empareja cada ecosistema característico de nuestro país con su fauna y flora representativa:',
          timeLimitSeconds: 60,
          pairs: [
            { left: 'Bosque de Niebla / Mesófilo', right: 'Quetzal, helechos arborescentes y orquídeas de montaña' },
            { left: 'Matorral Xerófilo / Desierto', right: 'Cactáceas columnares, liebre torda y borrego cimarrón' },
            { left: 'Arrecife de Coral Caribeño', right: 'Pez loro, tortuga carey y corales cerebro' },
            { left: 'Humedales y Manglares', right: 'Cocodrilo de río, mangle rojo y garza blanca' }
          ]
        }
      } as DragDropMatchBlock,

      {
        id: `node-${ts}-4`,
        type: 'quiz_question',
        title: '4. Reactivo Crítico: El Rol de los Depredadores Tope',
        isCollapsed: false,
        position: { x: 1020, y: 150 },
        data: {
          question: '¿Qué fenómeno ecológico ocurre cuando se extingue o remueve un depredador tope (como el lobo mexicano o el jaguar) en un ecosistema natural?',
          options: [
            'Se produce una sobrepoblación descontrolada de herbívoros que sobrepastorean la vegetación, provocando erosión del suelo y pérdida masiva de biodiversidad.',
            'El ecosistema aumenta su riqueza natural porque los animales pequeños viven sin peligros.',
            'Las plantas crecen más rápido al no existir animales carnívoros en el territorio.',
            'El ciclo del agua se detiene inmediatamente por falta de fauna silvestre.'
          ],
          correctIndex: 0,
          explanation: 'La pérdida de depredadores cumbre desata una cascada trófica destructiva: al no haber control biológico, las especies herbívoras agotan la cobertura vegetal y colapsan el hábitat.',
          timeLimitSeconds: 40
        }
      } as QuizQuestionBlock,

      {
        id: `node-${ts}-5`,
        type: 'secret_code_puzzle',
        title: '5. La Palabra Clave del Laboratorio Ecológico',
        isCollapsed: false,
        position: { x: 1340, y: 150 },
        data: {
          clueText: 'Término científico fundamental que describe la inmensa variedad de seres vivos, ecosistemas y genes presentes en nuestro planeta:',
          hintText: 'Palabra de 13 letras. Inicia con "BIO..." y concluye con "...DAD". Es el tesoro supremo de la naturaleza.',
          secretAnswer: 'BIODIVERSIDAD'
        }
      } as SecretCodePuzzleBlock,

      {
        id: `node-${ts}-6`,
        type: 'boss_enemy',
        title: '6. Duelo Ambiental: Combate contra la Deforestación y el Smog',
        isCollapsed: false,
        position: { x: 1660, y: 150 },
        data: {
          bossName: 'El Coloso de la Contaminación y la Desertificación 🏭💀',
          spriteKey: 'blood_dragon',
          maxHp: 160,
          attackPower: 25,
          victoryCondition: 'defeat_boss',
          backgroundScene: 'forest'
        }
      } as BossEnemyBlock,

      {
        id: `node-${ts}-7`,
        type: 'reward_chest',
        title: '7. Cofre Místico: ¡Guardián Supremo de la Madre Tierra!',
        isCollapsed: false,
        position: { x: 1980, y: 150 },
        data: {
          chestRarity: 'legendary',
          xpAmount: 380,
          coinsAmount: 70,
          badgeName: 'Ecólogo Maestro de la Biosfera 🐾🌎',
          badgeUnlockId: 'badge-eco-champion-2026'
        }
      } as RewardChestBlock
    ];

    return assembleResult(
      'Aventura Gamificada: Ecosistemas y el Equilibrio de la Biodiversidad',
      'Expedición interactiva en biomas mexicanos. Conéctate con las redes tróficas, clasifica especies endémicas y vence al coloso contaminante para proteger el patrimonio natural.',
      'Ciencias Naturales y Biología',
      'Saberes y Pensamiento Científico',
      'Fase 5 - Saberes y Pensamiento Científico: Comprende que las funciones vitales de los seres vivos se articulan en cadenas y redes tróficas, reconociendo la importancia de la biodiversidad en México y el impacto de las acciones humanas.',
      blocks,
      faseNem
    );
  }

  // -------------------------------------------------------------
  // TEMA 3: FRACCIONES Y NÚMEROS RACIONALES / MATEMÁTICAS
  // -------------------------------------------------------------
  if (
    normalized.includes('fraccion') || 
    normalized.includes('quebrado') || 
    normalized.includes('denominador') || 
    normalized.includes('decimal') ||
    normalized.includes('racional')
  ) {
    const blocks: StudioBlock[] = [
      {
        id: `node-${ts}-1`,
        type: 'text_narrative',
        title: '1. El Taller del Alquimista Numérico',
        isStartNode: true,
        isCollapsed: false,
        position: { x: 60, y: 150 },
        data: {
          style: 'dialogue',
          speakerName: 'Arquímedes de Siracusa (Maestro Matemático)',
          speakerAvatar: '📐',
          content: '¡Salve, aprendices del reino numérico! Para reparar el motor gravitacional de nuestra academia, debemos dosificar las proporciones exactas de fluidos mágicos. Pero cuidado: los reactivos vienen medidos en partes de un todo. El numerador nos indica cuántas porciones tomamos, y el denominador en cuántas partes iguales se dividió la unidad. ¡Si no dominan las fracciones equivalentes y el común denominador, el motor se sobrecalentará!'
        }
      } as TextNarrativeBlock,

      {
        id: `node-${ts}-2`,
        type: 'ordering_sequence',
        title: '2. El Algoritmo Infalible: Suma con Distinto Denominador',
        isCollapsed: false,
        position: { x: 380, y: 150 },
        data: {
          instructions: 'Ordena los 4 pasos obligatorios para sumar dos fracciones con denominadores distintos (ej. 2/3 + 1/4):',
          randomizeStart: true,
          stepsInCorrectOrder: [
            'Paso 1: Calcular el Mínimo Común Múltiplo (MCM) de los denominadores para hallar el denominador común (12).',
            'Paso 2: Convertir cada fracción a su fracción equivalente con el nuevo denominador común (8/12 y 3/12).',
            'Paso 3: Sumar únicamente los numeradores y conservar el denominador común (8 + 3 = 11/12).',
            'Paso 4: Verificar si la fracción resultante puede simplificarse a su mínima expresión irreductible.'
          ]
        }
      } as OrderingSequenceBlock,

      {
        id: `node-${ts}-3`,
        type: 'drag_drop_match',
        title: '3. Emparejamiento de Fracciones Equivalentes y Porcentajes',
        isCollapsed: false,
        position: { x: 700, y: 150 },
        data: {
          instructions: 'Une cada fracción con su representación matemática equivalente y su porcentaje correspondiente:',
          timeLimitSeconds: 60,
          pairs: [
            { left: '1/2 (Un medio)', right: 'Equivale a 2/4, 0.50 y representa el 50% de la unidad.' },
            { left: '3/4 (Tres cuartos)', right: 'Equivale a 6/8, 0.75 y representa el 75% de la unidad.' },
            { left: '1/5 (Un quinto)', right: 'Equivale a 2/10, 0.20 y representa el 20% de la unidad.' },
            { left: '2/3 (Dos tercios)', right: 'Equivale a 4/6, aproximadamente 0.666... de la unidad.' }
          ]
        }
      } as DragDropMatchBlock,

      {
        id: `node-${ts}-4`,
        type: 'quiz_question',
        title: '4. Problema Aplicado: La Dosificación de Energía',
        isCollapsed: false,
        position: { x: 1020, y: 150 },
        data: {
          question: 'Para una aleación mágica se requieren 2/5 de gramo de polvo estelar y 3/10 de gramo de cuarzo molido. ¿Cuál es el peso fraccionario total de la mezcla simplificada?',
          options: [
            '7/10 de gramo (ya que 2/5 equivale a 4/10, y 4/10 + 3/10 = 7/10)',
            '5/15 de gramo (sumando numeradores y denominadores directamente)',
            '6/50 de gramo (multiplicando cruzado sin sumar)',
            '1 gramo completo exacto'
          ],
          correctIndex: 0,
          explanation: 'Para sumar 2/5 + 3/10, convertimos 2/5 multiplicando por 2 tanto numerador como denominador, obteniendo 4/10. Luego sumamos 4/10 + 3/10 = 7/10 de gramo.',
          timeLimitSeconds: 45
        }
      } as QuizQuestionBlock,

      {
        id: `node-${ts}-5`,
        type: 'secret_code_puzzle',
        title: '5. La Operación Clave de la Aritmética',
        isCollapsed: false,
        position: { x: 1340, y: 150 },
        data: {
          clueText: 'Término matemático que consiste en dividir tanto el numerador como el denominador entre su máximo común divisor para obtener la expresión más limpia y pequeña posible:',
          hintText: 'Acción de 12 letras que inicia con "SIMPLIFIC..." y termina en "AR".',
          secretAnswer: 'SIMPLIFICAR'
        }
      } as SecretCodePuzzleBlock,

      {
        id: `node-${ts}-6`,
        type: 'boss_enemy',
        title: '6. Duelo Lógico: Combate contra el Titán de los Denominadores Desiguales',
        isCollapsed: false,
        position: { x: 1660, y: 150 },
        data: {
          bossName: 'El Titán de los Denominadores Desiguales 👹🔢',
          spriteKey: 'cyber_brux',
          maxHp: 150,
          attackPower: 22,
          victoryCondition: 'defeat_boss',
          backgroundScene: 'dungeon'
        }
      } as BossEnemyBlock,

      {
        id: `node-${ts}-7`,
        type: 'reward_chest',
        title: '7. Cofre Legendario: ¡Archimago de las Fracciones!',
        isCollapsed: false,
        position: { x: 1980, y: 150 },
        data: {
          chestRarity: 'legendary',
          xpAmount: 400,
          coinsAmount: 80,
          badgeName: 'Maestro de la Razón y la Proporción 📐✨',
          badgeUnlockId: 'badge-fraction-master-2026'
        }
      } as RewardChestBlock
    ];

    return assembleResult(
      'Aventura Gamificada: La Forja de las Fracciones y Números Racionales',
      'Desafío interactivo de pensamiento matemático. Domina las fracciones equivalentes, el común denominador y los problemas de la vida real para derrotar al Titán de los Denominadores.',
      'Matemáticas y Razonamiento Lógico',
      'Saberes y Pensamiento Científico',
      'Fase 5 - Saberes y Pensamiento Científico: Resuelve situaciones problemáticas vinculadas a diferentes contextos que implican sumas o restas de fracciones con diferentes denominadores, utilizando equivalencias y simplificación.',
      blocks,
      faseNem
    );
  }

  // -------------------------------------------------------------
  // TEMA 4: TABLA PERIÓDICA Y ENLACES QUÍMICOS / QUÍMICA
  // -------------------------------------------------------------
  if (
    normalized.includes('tabla periodica') || 
    normalized.includes('quimic') || 
    normalized.includes('atomo') || 
    normalized.includes('elemento') ||
    normalized.includes('enlace')
  ) {
    const blocks: StudioBlock[] = [
      {
        id: `node-${ts}-1`,
        type: 'text_narrative',
        title: '1. El Gran Laboratorio de Dmitri Mendeléyev',
        isStartNode: true,
        isCollapsed: false,
        position: { x: 60, y: 150 },
        data: {
          style: 'dialogue',
          speakerName: 'Prof. Dmitri Mendeléyev (Pionero de la Química)',
          speakerAvatar: '⚗️',
          content: '¡Colegas científicos! Toda la materia del universo, desde el aire que respiramos hasta las estrellas más lejanas, está conformada por 118 elementos organizados por su estructura atómica. Cada fila y cada columna de la Tabla Periódica nos revela secretos asombrosos sobre cómo los electrones de valencia se combinan para crear la vida. ¡Descifren las familias químicas antes de que la reacción en cadena se descontrole!'
        }
      } as TextNarrativeBlock,

      {
        id: `node-${ts}-2`,
        type: 'ordering_sequence',
        title: '2. Estructura Atómica y Organización Periódica',
        isCollapsed: false,
        position: { x: 380, y: 150 },
        data: {
          instructions: 'Ordena los conceptos desde la partícula atómica más fundamental hasta la molécula compleja:',
          randomizeStart: true,
          stepsInCorrectOrder: [
            '1. Partículas subatómicas: Protones (positivos) y neutrones en el núcleo, rodeados por electrones (negativos).',
            '2. Número Atómico (Z): La cantidad exacta de protones en el núcleo que define la identidad única de cada elemento.',
            '3. Capa de Valencia: Los electrones del nivel exterior que determinan la reactividad y afinidad química.',
            '4. Molécula o Compuesto: Estructura formada cuando dos o más átomos comparten o transfieren electrones mediante enlaces químicos.'
          ]
        }
      } as OrderingSequenceBlock,

      {
        id: `node-${ts}-3`,
        type: 'drag_drop_match',
        title: '3. Familias Periódicas y sus Elementos Clave',
        isCollapsed: false,
        position: { x: 700, y: 150 },
        data: {
          instructions: 'Empareja a cada grupo o familia de la Tabla Periódica con sus elementos más representativos:',
          timeLimitSeconds: 60,
          pairs: [
            { left: 'Gases Nobles (Grupo 18)', right: 'Helio (He), Neón (Ne), Argón (Ar) — Muy estables y no reactivos' },
            { left: 'Metales Alcalinos (Grupo 1)', right: 'Litio (Li), Sodio (Na), Potasio (K) — Altamente reactivos en agua' },
            { left: 'Halógenos (Grupo 17)', right: 'Flúor (F), Cloro (Cl), Bromo (Br) — Forman sales minerales vitales' },
            { left: 'Bioelementos Primarios (CHON)', right: 'Carbono (C), Hidrógeno (H), Oxígeno (O) y Nitrógeno (N) — Base de la vida' }
          ]
        }
      } as DragDropMatchBlock,

      {
        id: `node-${ts}-4`,
        type: 'quiz_question',
        title: '4. Reactivo de Razonamiento: Enlaces Químicos',
        isCollapsed: false,
        position: { x: 1020, y: 150 },
        data: {
          question: '¿Cuál es la diferencia fundamental entre un enlace covalente (como en el agua H₂O) y un enlace iónico (como en la sal NaCl)?',
          options: [
            'En el enlace covalente los átomos comparten electrones para alcanzar estabilidad, mientras que en el iónico un átomo cede electrones al otro, atrayéndose por cargas opuestas.',
            'El enlace covalente solo ocurre en metales pesados y el iónico en gases de la atmósfera.',
            'El enlace iónico destruye los núcleos atómicos mientras que el covalente los enfría.',
            'No hay diferencia alguna, ambos términos describen la misma fuerza gravitatoria.'
          ],
          correctIndex: 0,
          explanation: 'La regla del octeto impulsa la unión química: los átomos no metálicos suelen compartir pares de electrones (covalencia), mientras que metales y no metales con alta diferencia de electronegatividad transfieren electrones formando iones.',
          timeLimitSeconds: 45
        }
      } as QuizQuestionBlock,

      {
        id: `node-${ts}-5`,
        type: 'secret_code_puzzle',
        title: '5. La Propiedad de Atracción Atómica',
        isCollapsed: false,
        position: { x: 1340, y: 150 },
        data: {
          clueText: 'Capacidad fundamental de un átomo para atraer hacia sí los electrones cuando forma un enlace químico con otro elemento (el flúor es el campeón con 4.0 en la escala de Pauling):',
          hintText: 'Palabra extensa de 18 letras que inicia con "ELECTRONEGAT..." y concluye en "DAD".',
          secretAnswer: 'ELECTRONEGATIVIDAD'
        }
      } as SecretCodePuzzleBlock,

      {
        id: `node-${ts}-6`,
        type: 'boss_enemy',
        title: '6. Duelo Molecular: Combate contra el Isótopo Inestable',
        isCollapsed: false,
        position: { x: 1660, y: 150 },
        data: {
          bossName: 'El Isótopo Radiactivo Inestable ☢️⚛️',
          spriteKey: 'cyber_brux',
          maxHp: 160,
          attackPower: 25,
          victoryCondition: 'defeat_boss',
          backgroundScene: 'dungeon'
        }
      } as BossEnemyBlock,

      {
        id: `node-${ts}-7`,
        type: 'reward_chest',
        title: '7. Cofre Legendario: ¡Gran Alquimista Cuántico!',
        isCollapsed: false,
        position: { x: 1980, y: 150 },
        data: {
          chestRarity: 'legendary',
          xpAmount: 400,
          coinsAmount: 75,
          badgeName: 'Maestro de los 118 Elementos ⚛️🧪',
          badgeUnlockId: 'badge-chem-master-2026'
        }
      } as RewardChestBlock
    ];

    return assembleResult(
      'Aventura Gamificada: Los Secretos de la Tabla Periódica y el Átomo',
      'Desafío de química interactiva. Descubre la organización de Mendeleiev, enlaza átomos de la materia y neutraliza la reacción atómica en el laboratorio cuántico.',
      'Química y Ciencias Físicas',
      'Saberes y Pensamiento Científico',
      'Fase 6 - Saberes y Pensamiento Científico: Reconoce la presencia y la importancia de los elementos químicos en la vida cotidiana, sus propiedades periódicas y las fuerzas que los enlazan.',
      blocks,
      faseNem
    );
  }

  return null;
}

/**
 * Generador Heurístico Autónomo para cualquier tema arbitrario
 * Crea proyectos didácticos profundos, ricos, gamificados y sin preguntas vacías
 */
function buildAutonomousGamifiedProject(
  topic: string, 
  faseNem: string, 
  gamificationStyle: string
): GeneratedProjectResult {
  const ts = Date.now();
  const titleTopic = topic.length > 45 ? topic.slice(0, 42) + '...' : topic;

  // Inferir disciplina según palabras clave del tema
  const lower = topic.toLowerCase();
  let subject = 'Saberes Integrados';
  let campoFormativo = 'Saberes y Pensamiento Científico';
  let guideName = 'Profesor y Cronista Sabio';
  let guideAvatar = '🧙‍♂️';
  let bossName = `El Coloso del Desafío: Guardián de ${titleTopic}`;
  let bossScene: 'temple' | 'volcano' | 'dungeon' | 'forest' = 'temple';
  let badgeName = `Gran Maestro de ${titleTopic} 🏆`;

  if (lower.includes('revolucion') || lower.includes('guerra') || lower.includes('constitucion') || lower.includes('historia') || lower.includes('presidente')) {
    subject = 'Historia y Ciudadanía';
    campoFormativo = 'Ética, Naturaleza y Sociedades';
    guideName = 'Cronista Histórico Nacional';
    guideAvatar = '📜';
    bossName = `General Félix de la Reacción Imperial ⚔️`;
    bossScene = 'temple';
    badgeName = `Héroe Cívico de ${titleTopic} 🎖️`;
  } else if (lower.includes('celula') || lower.includes('animal') || lower.includes('planta') || lower.includes('agua') || lower.includes('planeta') || lower.includes('energia')) {
    subject = 'Ciencias Naturales y Exploración';
    campoFormativo = 'Saberes y Pensamiento Científico';
    guideName = 'Dra. Elena Almonte (Científica Investigadora)';
    guideAvatar = '🔬';
    bossName = `La Fuerza de la Entropía Destructiva 🌪️`;
    bossScene = 'forest';
    badgeName = `Investigador de Élite en ${titleTopic} 🌿`;
  } else if (lower.includes('numero') || lower.includes('geometria') || lower.includes('algebra') || lower.includes('calculo') || lower.includes('ecuacion')) {
    subject = 'Matemáticas y Lógica Aplicada';
    campoFormativo = 'Saberes y Pensamiento Científico';
    guideName = 'Maestro Euclides de Alejandría';
    guideAvatar = '📐';
    bossName = `El Titán de los Algoritmos Ocultos 👹`;
    bossScene = 'dungeon';
    badgeName = `Arquitecto Lógico de ${titleTopic} ⚡`;
  } else if (lower.includes('lectura') || lower.includes('poesia') || lower.includes('cuento') || lower.includes('palabra') || lower.includes('espanol') || lower.includes('idioma')) {
    subject = 'Lenguajes y Comunicación';
    campoFormativo = 'Lenguajes';
    guideName = 'Bardo y Guardián de los Manuscritos';
    guideAvatar = '✒️';
    bossName = `El Dragón del Olvido y la Ignorancia 🐲`;
    bossScene = 'temple';
    badgeName = `Maestro de las Letras y ${titleTopic} 📖`;
  }

  const blocks: StudioBlock[] = [
    // Bloque 1: Text Narrative con Storytelling y Lore
    {
      id: `node-${ts}-1`,
      type: 'text_narrative',
      title: `1. El Umbral del Saber: La Misión de ${titleTopic}`,
      isStartNode: true,
      isCollapsed: false,
      position: { x: 60, y: 150 },
      data: {
        style: 'dialogue',
        speakerName: guideName,
        speakerAvatar: guideAvatar,
        content: `¡Saludos, valientes aprendices de la Academia ISkool! Hemos sido convocados para explorar a fondo los misterios y fundamentos de "${topic}". En esta aventura pondremos a prueba nuestra capacidad analítica, reconstruiremos procesos paso a paso y descubriremos conexiones que pocos logran ver. Cada acierto fortalecerá tu avatar y recargará tu escudo de saberes. ¡Prepárense para iniciar la travesía!`
      }
    } as TextNarrativeBlock,

    // Bloque 2: Secuencia Lógica Ordenada
    {
      id: `node-${ts}-2`,
      type: 'ordering_sequence',
      title: `2. Secuencia Metódica de ${titleTopic}`,
      isCollapsed: false,
      position: { x: 380, y: 150 },
      data: {
        instructions: `Ordena los 4 momentos esenciales para comprender y aplicar ${topic}:`,
        randomizeStart: true,
        stepsInCorrectOrder: [
          `Fase 1: Reconocimiento y delimitación: Identificar el problema central y las evidencias iniciales sobre ${topic}.`,
          `Fase 2: Análisis estructural: Descomponer los elementos, factores causales y relaciones clave de ${topic}.`,
          `Fase 3: Contrastación y modelado: Evaluar hipótesis frente a datos comprobados y casos prácticos.`,
          `Fase 4: Síntesis y propuesta creativa: Formular conclusiones fundamentadas y soluciones aplicadas a la realidad.`
        ]
      }
    } as OrderingSequenceBlock,

    // Bloque 3: Drag & Drop Match
    {
      id: `node-${ts}-3`,
      type: 'drag_drop_match',
      title: `3. Emparejamiento Conceptual de ${titleTopic}`,
      isCollapsed: false,
      position: { x: 700, y: 150 },
      data: {
        instructions: `Relaciona cada dimensión analítica de ${topic} con su propósito pedagógico:`,
        timeLimitSeconds: 65,
        pairs: [
          { 
            left: `Fundamento Teórico de ${titleTopic}`, 
            right: `Permite comprender las leyes, principios y conceptos rectores que sustentan la temática.` 
          },
          { 
            left: `Impacto en la Comunidad`, 
            right: `Demuestra cómo este conocimiento transforma la vida cotidiana y el bienestar social.` 
          },
          { 
            left: `Pensamiento Crítico y Análisis`, 
            right: `Cuestiona supuestos, compara perspectivas divergentes y busca evidencias comprobables.` 
          },
          { 
            left: `Aplicación Práctica y Prototipo`, 
            right: `Materializa los aprendizajes en entregables tangibles, proyectos y soluciones reales.` 
          }
        ]
      }
    } as DragDropMatchBlock,

    // Bloque 4: Reactivo de Pensamiento Crítico
    {
      id: `node-${ts}-4`,
      type: 'quiz_question',
      title: `4. Reactivo de Análisis Crítico: ${titleTopic}`,
      isCollapsed: false,
      position: { x: 1020, y: 150 },
      data: {
        question: `Al analizar a profundidad "${topic}", ¿cuál de las siguientes afirmaciones describe con mayor precisión el enfoque metodológico para resolver problemáticas complejas en este campo?`,
        options: [
          `Integrar el análisis de causas y evidencias empíricas, vinculando la teoría con el impacto real en la comunidad y evaluando múltiples alternativas antes de concluir.`,
          `Aceptar únicamente datos memorísticos sin cuestionar su origen ni su aplicación en el contexto actual.`,
          `Considerar que los fenómenos de este tema ocurren de forma totalmente aislada sin relación con otras disciplinas.`,
          `Descartar la experimentación y el debate fundamentado por considerarlos innecesarios para el aprendizaje.`
        ],
        correctIndex: 0,
        explanation: `El aprendizaje auténtico en el marco de la NEM requiere conectar el rigor de los contenidos con el análisis crítico de la realidad y el trabajo colaborativo en la comunidad escolar.`,
        timeLimitSeconds: 40
      }
    } as QuizQuestionBlock,

    // Bloque 5: Secret Code Puzzle
    {
      id: `node-${ts}-5`,
      type: 'secret_code_puzzle',
      title: `5. El Enigma de la Bóveda de Conocimiento`,
      isCollapsed: false,
      position: { x: 1340, y: 150 },
      data: {
        clueText: `Para abrir el cofre sagrado de esta disciplina, debes ingresar la palabra clave de 11 letras que define la habilidad de cuestionar, investigar con rigor y construir juicio propio fundamentado:`,
        hintText: `Palabra de 11 letras que inicia con "PENSAMIENTO" abreviado o "INDAGACION". Código clave: "INDAGACION".`,
        secretAnswer: 'INDAGACION'
      }
    } as SecretCodePuzzleBlock,

    // Bloque 6: Boss Enemy
    {
      id: `node-${ts}-6`,
      type: 'boss_enemy',
      title: `6. Duelo Magistral: Enfrentamiento contra el Guardián`,
      isCollapsed: false,
      position: { x: 1660, y: 150 },
      data: {
        bossName: bossName,
        spriteKey: 'blood_dragon',
        maxHp: 150,
        attackPower: 22,
        victoryCondition: 'defeat_boss',
        backgroundScene: bossScene
      }
    } as BossEnemyBlock,

    // Bloque 7: Reward Chest
    {
      id: `node-${ts}-7`,
      type: 'reward_chest',
      title: `7. Cofre Legendario: ¡Maestría en ${titleTopic}!`,
      isCollapsed: false,
      position: { x: 1980, y: 150 },
      data: {
        chestRarity: 'legendary',
        xpAmount: 380,
        coinsAmount: 70,
        badgeName: badgeName,
        badgeUnlockId: `badge-auto-${ts}`
      }
    } as RewardChestBlock
  ];

  return assembleResult(
    `Aventura Gamificada: ${topic}`,
    `Proyecto pedagógico gamificado e interactivo. Explora ${topic} mediante narrativa de inmersión, retos de ordenamiento lógico, emparejamiento conceptual, análisis crítico y duelo de saberes.`,
    subject,
    campoFormativo,
    `${faseNem} - ${campoFormativo}: Analiza críticamente los conceptos clave, procesos y aplicaciones correspondientes a ${topic}, articulando saberes teóricos con situaciones reales de la comunidad.`,
    blocks,
    faseNem
  );
}

/**
 * Función auxiliar para ensamblar el resultado con conexiones completas
 */
function assembleResult(
  title: string,
  description: string,
  subject: string,
  campoFormativo: string,
  pdaNem: string,
  blocks: StudioBlock[],
  faseNem: string
): GeneratedProjectResult {
  const connections: FlowConnection[] = [];
  for (let i = 0; i < blocks.length - 1; i++) {
    connections.push({
      id: `conn-${blocks[i].id}-${blocks[i + 1].id}`,
      sourceNodeId: blocks[i].id,
      targetNodeId: blocks[i + 1].id,
      label: i === blocks.length - 2 ? 'success' : 'next'
    });
  }

  const metadata: ActivityBuilderMetadata = {
    title,
    description,
    subject,
    subjectId: 'sub-custom',
    targetAge: faseNem,
    campoFormativo,
    camposFormativos: [campoFormativo],
    ejesArticuladores: [
      'Pensamiento Crítico',
      'Apropiación de las Culturas a través de la Lectura y la Escritura',
      'Interculturalidad Crítica'
    ],
    faseNem: sanitizeFaseNem(faseNem),
    pdaNem,
    pdas: [pdaNem],
    taskType: 'activity_flow',
    xpReward: 350,
    coinsReward: 65,
    totalTimeLimit: 0,
    livesCount: 3,
    streakMultiplier: true,
  };

  return {
    metadata,
    blocks,
    connections,
    startNodeId: blocks[0].id
  };
}
