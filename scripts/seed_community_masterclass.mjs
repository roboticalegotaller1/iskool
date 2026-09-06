import { createClient } from '@supabase/supabase-js';

const url = 'https://eudcxuxbxgtbnysjrixo.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1ZGN4dXhieGd0Ym55c2pyaXhvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwNDAyNDksImV4cCI6MjA5NjYxNjI0OX0.5HMZgwxa4v-tGNYVPJs8HVuf1j8dT1oi7jwBI0cIbAg';
const supabase = createClient(url, key);

// 1. Actividad #1: Clase Magistral Oficial (980 Votos)
const masterclassPayload = {
  id: '18101821-cafe-4000-8000-000000000001',
  teacher_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
  teacher_name: 'Prof. Israel López Ángeles',
  title: 'La Gesta Heroica de la Independencia de México (1810 - 1821)',
  template_type: 'custom_builder',
  upvotes: 980,
  created_at: new Date(Date.now() - 3600000).toISOString(),
  content_json: {
    title: 'La Gesta Heroica de la Independencia de México (1810 - 1821)',
    description: 'Clase magistral interactiva y gamificada. Recorre las 4 etapas de la lucha armada mediante diálogo inmersivo con Miguel Hidalgo, reto cronológico de etapas, emparejamiento táctico de próceres, acertijo de escape room de la conspiración, combate épico en Monte de las Cruces y el Cofre Legendario de la Patria.',
    subject: 'Historia y Formación Cívica',
    targetAge: 'Primaria Alta y Secundaria (10 - 15 años)',
    faseNem: 'Fase 5',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
    metadata: {
      title: 'La Gesta Heroica de la Independencia de México (1810 - 1821)',
      description: 'Clase magistral interactiva y gamificada. Recorre las 4 etapas de la lucha armada mediante diálogo inmersivo con Miguel Hidalgo, reto cronológico de etapas, emparejamiento táctico de próceres, acertijo de escape room de la conspiración, combate épico en Monte de las Cruces y el Cofre Legendario de la Patria.',
      subject: 'Historia y Formación Cívica',
      subjectId: 'sub-hist',
      targetAge: 'Primaria Alta y Secundaria (10 - 15 años)',
      campoFormativo: 'Ética, Naturaleza y Sociedades',
      camposFormativos: ['Ética, Naturaleza y Sociedades', 'Lenguajes'],
      ejesArticuladores: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura', 'Interculturalidad Crítica'],
      faseNem: 'Fase 5',
      pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
      pdas: [
        'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
        'Fase 5 - Lenguajes: Produce e interpreta narraciones orales, biografías ilustradas y debates sobre los héroes y heroínas de la Independencia nacional.'
      ],
      taskType: 'activity_flow',
      xpReward: 350,
      coinsReward: 60,
      totalTimeLimit: 0,
      livesCount: 3,
      streakMultiplier: true,
    },
    blocks: [
      {
        id: 'node-indep-1',
        type: 'text_narrative',
        title: '1. Madrugada de Dolores: El Llamado a la Libertad',
        isCollapsed: false,
        isStartNode: true,
        position: { x: 60, y: 150 },
        data: {
          style: 'dialogue',
          speakerName: 'Don Miguel Hidalgo y Costilla',
          speakerAvatar: '🔔',
          content: '¡Hijos míos! Doña Josefa Ortiz de Domínguez nos ha enviado aviso urgente desde Querétaro: ¡nuestra conspiración ha sido delatada! No queda un minuto por perder. He mandado repicar la campana de nuestra parroquia para convocar al pueblo. Tomemos el estandarte y marchemos juntos por la libertad, la justicia y la abolición de los tributos injustos. ¿Están listos para transformar el destino de México?'
        }
      },
      {
        id: 'node-indep-2',
        type: 'ordering_sequence',
        title: '2. Las 4 Grandes Etapas de la Independencia',
        isCollapsed: false,
        position: { x: 380, y: 150 },
        data: {
          instructions: 'Ordena cronológicamente los 4 periodos fundamentales de la gesta heroica (1810 a 1821):',
          randomizeStart: true,
          stepsInCorrectOrder: [
            '1810 - 1811: Etapa de Inicio (Grito de Dolores, toma de la Alhóndiga y primeras batallas con Miguel Hidalgo e Ignacio Allende).',
            '1811 - 1815: Etapa de Organización (Campañas militares de José María Morelos, Congreso de Chilpancingo y Sentimientos de la Nación).',
            '1815 - 1820: Etapa de Resistencia (Guerra de guerrillas en las serranías del sur con Vicente Guerrero y Francisco Xavier Mina).',
            '1821: Etapa de Consumación (El Abrazo de Acatempan, proclamación del Plan de Iguala y entrada triunfal del Ejército Trigarante).'
          ]
        }
      },
      {
        id: 'node-indep-3',
        type: 'drag_drop_match',
        title: '3. Héroes y Heroínas de la Patria',
        isCollapsed: false,
        position: { x: 700, y: 150 },
        data: {
          instructions: 'Empareja a cada protagonista histórico con su contribución trascendental a la patria:',
          timeLimitSeconds: 60,
          pairs: [
            { left: 'Miguel Hidalgo y Costilla', right: 'Padre de la Patria y Decreto de Abolición de la Esclavitud' },
            { left: 'Josefa Ortiz de Domínguez', right: 'Heroína de Querétaro que alertó a los insurgentes' },
            { left: 'José María Morelos y Pavón', right: 'Siervo de la Nación y autor de los Sentimientos de la Nación' },
            { left: 'Vicente Guerrero', right: '"La patria es primero" y consumador con el Ejército Trigarante' }
          ]
        }
      },
      {
        id: 'node-indep-4',
        type: 'secret_code_puzzle',
        title: '4. El Santo y Seña de la Conspiración Secreta',
        isCollapsed: false,
        position: { x: 1020, y: 150 },
        data: {
          clueText: 'En las tertulias secretas de Querétaro, los conjurados protegían sus mensajes con un lema supremo de 9 letras que sintetiza el derecho inalienable de todos los seres humanos a no ser sometidos ni esclavizados:',
          hintText: 'Palabra de 9 letras. Comienza con "LIBER..." y termina con D. Es el ideal sagrado de 1810.',
          secretAnswer: 'LIBERTAD'
        }
      },
      {
        id: 'node-indep-5',
        type: 'boss_enemy',
        title: '5. Batalla del Monte de las Cruces',
        isCollapsed: false,
        position: { x: 1340, y: 150 },
        data: {
          bossName: 'Comandante Realista Torcuato Trujillo ⚔️',
          maxHp: 150,
          attackPower: 20,
          spriteKey: 'shadow_golem',
          victoryCondition: 'defeat_boss',
          backgroundScene: 'temple'
        }
      },
      {
        id: 'node-indep-6',
        type: 'reward_chest',
        title: '6. Cofre de la Gloria: ¡Consumación de la Independencia!',
        isCollapsed: false,
        position: { x: 1660, y: 150 },
        data: {
          chestRarity: 'legendary',
          xpAmount: 350,
          coinsAmount: 60,
          badgeName: 'Libertador de la Patria 🔔🇲🇽',
          badgeIcon: 'Award',
          badgeUnlockId: 'badge-indep-master-2026'
        }
      }
    ],
    connections: [
      { id: 'conn-indep-1-2', sourceNodeId: 'node-indep-1', targetNodeId: 'node-indep-2', label: 'next' },
      { id: 'conn-indep-2-3', sourceNodeId: 'node-indep-2', targetNodeId: 'node-indep-3', label: 'next' },
      { id: 'conn-indep-3-4', sourceNodeId: 'node-indep-3', targetNodeId: 'node-indep-4', label: 'next' },
      { id: 'conn-indep-4-5', sourceNodeId: 'node-indep-4', targetNodeId: 'node-indep-5', label: 'next' },
      { id: 'conn-indep-5-6', sourceNodeId: 'node-indep-5', targetNodeId: 'node-indep-6', label: 'success' }
    ]
  }
};

// 2. Actividad #2: Gimnasio Cerebral - Héroes y Heroínas (920 Votos)
const cognitivePayload = {
  id: '18101821-cafe-4000-8000-000000000002',
  teacher_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
  teacher_name: 'Prof. Israel López Ángeles',
  title: 'Gimnasio Cerebral: Héroes y Heroínas de la Independencia',
  template_type: 'custom_builder',
  upvotes: 920,
  created_at: new Date().toISOString(),
  content_json: {
    title: 'Gimnasio Cerebral: Héroes y Heroínas de la Independencia',
    description: 'Entrenamiento cognitivo de alto rendimiento: comprensión lectora rápida (PPM), inferencia textual, discriminación de información y lógica histórica. Descubre las decisiones estratégicas de Leona Vicario, Miguel Hidalgo, José María Morelos y Vicente Guerrero.',
    subject: 'Historia, Formación Cívica y Lenguajes',
    targetAge: 'Primaria Alta (10 - 12 años • 5° y 6° Grado)',
    faseNem: 'Fase 5',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza críticamente los proyectos de nación e ideales de los héroes y heroínas de la Independencia, valorando el papel histórico de las mujeres insurgentes y la defensa de la justicia social.',
    metadata: {
      title: 'Gimnasio Cerebral: Héroes y Heroínas de la Independencia',
      description: 'Entrenamiento cognitivo de alto rendimiento: comprensión lectora rápida (PPM), inferencia textual, discriminación de información y lógica histórica. Descubre las decisiones estratégicas de Leona Vicario, Miguel Hidalgo, José María Morelos y Vicente Guerrero.',
      subject: 'Historia, Formación Cívica y Lenguajes',
      subjectId: 'sub-hist-lang',
      targetAge: 'Primaria Alta (10 - 12 años • 5° y 6° Grado)',
      campoFormativo: 'Ética, Naturaleza y Sociedades',
      camposFormativos: ['Ética, Naturaleza y Sociedades', 'Lenguajes'],
      ejesArticuladores: ['Pensamiento Crítico', 'Apropiación de las Culturas a través de la Lectura y la Escritura', 'Igualdad de Género'],
      faseNem: 'Fase 5',
      pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza críticamente los proyectos de nación e ideales de los héroes y heroínas de la Independencia, valorando el papel histórico de las mujeres insurgentes y la defensa de la justicia social.',
      pdas: [
        'Fase 5 - Ética, Naturaleza y Sociedades: Analiza críticamente las causas y los ideales de los próceres de la Independencia de México, valorando el papel de las mujeres insurgentes y el ideario de los Sentimientos de la Nación.',
        'Fase 5 - Lenguajes: Aplica destrezas de lectura veloz, localización de pistas textuales e interpretación crítica en textos biográficos e históricos.'
      ],
      taskType: 'activity_flow',
      xpReward: 420,
      coinsReward: 80,
      totalTimeLimit: 0,
      livesCount: 3,
      streakMultiplier: true,
    },
    blocks: [
      {
        id: 'node-prog-1',
        type: 'timed_reading_block',
        title: '1. Barrido Visual & Lectura Veloz: El Enigma de Leona Vicario',
        isCollapsed: false,
        isStartNode: true,
        position: { x: 60, y: 150 },
        data: {
          timeLimitSeconds: 65,
          targetWpm: 175,
          wordCount: 198,
          readingText: `En los albores de la lucha por la Independencia, una joven criolla de gran cultura e inteligencia revolucionó la insurgencia desde las sombras de la Ciudad de México: Leona Vicario.\n\nPerteneciente a una familia acaudalada, Leona decidió poner toda su fortuna, joyas e ingenio al servicio de la patria. Formó parte de la red clandestina conocida como "Los Guadalupes", una organización secreta de abogados, médicos y damas que operaba en la capital novohispana vigilando los movimientos de los ejércitos virreinales.\n\nDisfrazando correos entre canastas de víveres y carretas de leña, Leona enviaba a los campamentos insurgentes medicinas, ropa, pólvora y, sobre todo, tipos tipográficos metálicos para que Andrés Quintana Roo pudiera imprimir "El Ilustrador Americano", el primer periódico rebelde que difundía el pensamiento libertario.\n\nEn marzo de 1813, uno de sus mensajeros fue interceptado. Alertada del peligro, intentó huir pero fue capturada y encerrada en el Convento de Belén de las Mochas. A pesar de los duros interrogatorios de las autoridades virreinales, jamás delató a ninguno de sus compañeros. Meses después, tres insurgentes disfrazados de soldados realistas la rescataron en una audaz fuga a caballo, llevándola hasta los campamentos de José María Morelos en Oaxaca. Por su valentía moral y estratégica, fue declarada "Benemérita y Dulcísima Madre de la Patria".`,
          comprehensionQuestions: [
            {
              id: 'q-prog-1',
              question: '¿Cuál fue la aportación crucial de Leona Vicario para la difusión de los ideales insurgentes?',
              options: [
                'Financiar la imprenta secreta y enviar tipos tipográficos para el periódico rebelde',
                'Dirigir los ejércitos armados en la batalla del Monte de las Cruces',
                'Redactar el Acta de Independencia en el Palacio Virreinal',
                'Comandar una flota de barcos en el puerto de Veracruz'
              ],
              correctIndex: 0,
              explanation: 'Leona Vicario financió la compra de caracteres de imprenta para publicar "El Ilustrador Americano", el periódico que transmitía los ideales libertarios.'
            },
            {
              id: 'q-prog-2',
              question: '¿Por qué la red secreta de "Los Guadalupes" requería máxima discreción en la capital?',
              options: [
                'Porque operaban dentro de la Ciudad de México espiando al gobierno virreinal',
                'Porque no creían en la Independencia y apoyaban al Virrey',
                'Porque sólo se reunían para festividades religiosas',
                'Porque pretendían huir al extranjero con el tesoro real'
              ],
              correctIndex: 0,
              explanation: 'Los Guadalupes eran espías y simpatizantes que informaban a los insurgentes sobre tropas realistas desde el corazón del poder novohispano.'
            },
            {
              id: 'q-prog-3',
              question: '¿Qué rasgo ético fundamental distinguió a Leona Vicario durante su encierro en el convento?',
              options: [
                'Su inquebrantable lealtad al negarse a delatar a la red de conspiradores',
                'Aceptar un soborno del Virrey para obtener su libertad inmediata',
                'Renunciar por escrito a sus ideas libertarias para conservar sus bienes',
                'Escapar en la primera noche fingiendo ser una guardia'
              ],
              correctIndex: 0,
              explanation: 'Pese a la amenaza de perder sus bienes y su vida, Leona jamás reveló nombres ni rutas secretas de la insurgencia.'
            }
          ]
        }
      },
      {
        id: 'node-prog-2',
        type: 'drag_drop_match',
        title: '2. Matriz de Próceres: Conexiones Tácticas y Pensamiento Estratégico',
        isCollapsed: false,
        position: { x: 380, y: 150 },
        data: {
          instructions: 'Deduce y empareja a cada prócer histórico con la decisión crucial que transformó la lucha emancipadora:',
          timeLimitSeconds: 60,
          pairs: [
            { left: 'Don Miguel Hidalgo y Costilla', right: 'Decretó la abolición de la esclavitud en Guadalajara en 1810' },
            { left: 'Doña Josefa Ortiz de Domínguez', right: 'Alertó a Ignacio Allende en San Miguel mediante taconazos en el suelo' },
            { left: 'Don José María Morelos y Pavón', right: 'Proclamó los Sentimientos de la Nación y creó los tres poderes de gobierno' },
            { left: 'Don Vicente Guerrero', right: 'Mantuvo la guerra de resistencia con el lema sagrado "La patria es primero"' }
          ]
        }
      },
      {
        id: 'node-prog-3',
        type: 'secret_code_puzzle',
        title: '3. Deducción Criptográfica: El Manifiesto de Chilpancingo',
        isCollapsed: false,
        position: { x: 700, y: 150 },
        data: {
          clueText: 'En el Congreso de Chilpancingo de 1813, Morelos plasmó el principio supremo por el cual el poder emana directamente del pueblo y sólo en él reside el derecho a elegir su forma de gobierno sin sumisión a monarquías extranjeras:',
          hintText: 'Palabra de 9 letras. Comienza con "SOBER..." y concluye en "A". Es el concepto cumbre del artículo 5° de los Sentimientos de la Nación.',
          secretAnswer: 'SOBERANIA'
        }
      },
      {
        id: 'node-prog-4',
        type: 'ordering_sequence',
        title: '4. Jerarquización Cronológica: Las Huellas de los Próceres',
        isCollapsed: false,
        position: { x: 1020, y: 150 },
        data: {
          instructions: 'Ordena con rapidez mental los 4 acontecimientos determinantes según su secuencia cronológica exacta:',
          randomizeStart: true,
          stepsInCorrectOrder: [
            '1. Septiembre 1810: Miguel Hidalgo e Ignacio Allende inician la lucha en Dolores y abolen la esclavitud.',
            '2. Septiembre 1813: José María Morelos instala el Congreso de Chilpancingo y proclama los Sentimientos de la Nación.',
            '3. Febrero 1821: Vicente Guerrero y Agustín de Iturbide sellan la alianza en Acatempan mediante el Plan de Iguala.',
            '4. Septiembre 1821: El Ejército Trigarante entra a la Ciudad de México y se consuma la Independencia.'
          ]
        }
      },
      {
        id: 'node-prog-5',
        type: 'boss_enemy',
        title: '5. Duelo Cognitivo: El Guardián del Olvido Histórico',
        isCollapsed: false,
        position: { x: 1340, y: 150 },
        data: {
          bossName: 'Centinela del Olvido Historiográfico ⚔️',
          maxHp: 160,
          attackPower: 20,
          spriteKey: 'shadow_golem',
          victoryCondition: 'defeat_boss',
          backgroundScene: 'temple'
        }
      },
      {
        id: 'node-prog-6',
        type: 'reward_chest',
        title: '6. Cofre del Pensamiento Crítico: Medalla Siervo de la Nación',
        isCollapsed: false,
        position: { x: 1660, y: 150 },
        data: {
          chestRarity: 'legendary',
          xpAmount: 420,
          coinsAmount: 80,
          badgeName: 'Estratega del Pensamiento Crítico 🧠🇲🇽',
          badgeIcon: 'Award',
          badgeUnlockId: 'badge-heroes-cognitive-2026'
        }
      }
    ],
    connections: [
      { id: 'conn-prog-1-2', sourceNodeId: 'node-prog-1', targetNodeId: 'node-prog-2', label: 'next' },
      { id: 'conn-prog-2-3', sourceNodeId: 'node-prog-2', targetNodeId: 'node-prog-3', label: 'next' },
      { id: 'conn-prog-3-4', sourceNodeId: 'node-prog-3', targetNodeId: 'node-prog-4', label: 'next' },
      { id: 'conn-prog-4-5', sourceNodeId: 'node-prog-4', targetNodeId: 'node-prog-5', label: 'next' },
      { id: 'conn-prog-5-6', sourceNodeId: 'node-prog-5', targetNodeId: 'node-prog-6', label: 'success' }
    ]
  }
};

async function seed() {
  console.log('Insertando o actualizando ambas actividades maestras en Supabase community_activities...');
  const { data, error } = await supabase
    .from('community_activities')
    .upsert([masterclassPayload, cognitivePayload], { onConflict: 'id' })
    .select('id, title, upvotes, teacher_name');

  if (error) {
    console.error('Error al insertar en Supabase:', error);
  } else {
    console.log('✅ Actividades guardadas exitosamente en Supabase:');
    data.forEach((d, i) => console.log(`  [#${i + 1}] ${d.title} (Votos: ${d.upvotes}, Autor: ${d.teacher_name})`));
  }
}

seed();
