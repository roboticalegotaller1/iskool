import { StudioBlock, ActivityBuilderMetadata, FlowConnection } from '@/types/studioBlocks';

/**
 * Metadatos Curriculares Oficiales NEM 2024 para la Gesta de Independencia
 */
export const MEXICAN_INDEPENDENCE_METADATA: ActivityBuilderMetadata = {
  title: 'La Gesta Heroica de la Independencia de México (1810 - 1821)',
  description: 'Clase magistral interactiva y gamificada. Recorre las 4 etapas de la lucha armada mediante diálogo inmersivo con Miguel Hidalgo, reto cronológico de etapas, emparejamiento táctico de próceres, acertijo de escape room de la conspiración, combate épico en Monte de las Cruces y el Cofre Legendario de la Patria.',
  subject: 'Historia y Formación Cívica',
  subjectId: 'sub-hist',
  targetAge: 'Primaria Alta y Secundaria (10 - 15 años)',
  campoFormativo: 'Ética, Naturaleza y Sociedades',
  camposFormativos: ['Ética, Naturaleza y Sociedades', 'Lenguajes'],
  ejesArticuladores: [
    'Pensamiento Crítico',
    'Apropiación de las Culturas a través de la Lectura y la Escritura',
    'Interculturalidad Crítica'
  ],
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
};

/**
 * Los 6 Nodos Didácticos de Alto Impacto para la Demostración de Potencia de ISkool
 */
export const MEXICAN_INDEPENDENCE_BLOCKS: StudioBlock[] = [
  // Nodo 1: Diálogo Narrativo Inmersivo
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

  // Nodo 2: Secuencia Cronológica de las 4 Etapas
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

  // Nodo 3: Emparejamiento Táctico de Héroes y Heroínas
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

  // Nodo 4: Acertijo de Escape Room & Código Secreto
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

  // Nodo 5: Batalla de Jefe RPG en el Motor Pixi
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

  // Nodo 6: Cofre Legendario de Recompensas
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
];

/**
 * Conexiones Direccionales del Grafo de Aprendizaje
 */
export const MEXICAN_INDEPENDENCE_CONNECTIONS: FlowConnection[] = [
  { id: 'conn-indep-1-2', sourceNodeId: 'node-indep-1', targetNodeId: 'node-indep-2', label: 'next' },
  { id: 'conn-indep-2-3', sourceNodeId: 'node-indep-2', targetNodeId: 'node-indep-3', label: 'next' },
  { id: 'conn-indep-3-4', sourceNodeId: 'node-indep-3', targetNodeId: 'node-indep-4', label: 'next' },
  { id: 'conn-indep-4-5', sourceNodeId: 'node-indep-4', targetNodeId: 'node-indep-5', label: 'next' },
  { id: 'conn-indep-5-6', sourceNodeId: 'node-indep-5', targetNodeId: 'node-indep-6', label: 'success' },
];
