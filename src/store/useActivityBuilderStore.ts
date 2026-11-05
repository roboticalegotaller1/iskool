import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  StudioBlock, 
  StudioBlockType, 
  ActivityBuilderMetadata,
  FlowNodePosition,
  FlowConnection,
  TextNarrativeBlock,
  QuizQuestionBlock,
  RewardChestBlock,
  BossEnemyBlock,
  YouTubeVideoBlock,
  ExternalEmbedBlock,
  DragDropMatchBlock,
  OrderingSequenceBlock,
  FillInBlanksBlock,
  OpenPollWordcloudBlock,
  SecretCodePuzzleBlock,
  MinigameActionBlock,
  LogicBranchBlock,
  CheckpointGateBlock,
  BadgeCertificateBlock,
  AudioSfxBlock,
  TimedReadingBlock
} from '@/types/studioBlocks';
import { StudioActivityJSON } from '@/types';
import { 
  MEXICAN_INDEPENDENCE_BLOCKS, 
  MEXICAN_INDEPENDENCE_CONNECTIONS, 
  MEXICAN_INDEPENDENCE_METADATA,
  HISTORICAL_FIGURES_PRESET_CATALOG,
  buildDynamicHistoricalFigureData
} from '@/data/mexicanIndependenceStudioFlow';

interface ActivityBuilderState {
  // Metadatos de la Actividad
  metadata: ActivityBuilderMetadata;
  
  // Lista de Bloques / Nodos en el Espacio de Trabajo
  blocks: StudioBlock[];
  selectedBlockId: string | null;
  
  // Grafo de Conexiones Visuales
  connections: FlowConnection[];
  startNodeId: string | null;
  
  // Historial para Deshacer / Rehacer (Undo / Redo)
  history: StudioBlock[][];
  historyIndex: number;
  
  // Control de UI & Arrastre
  isExtendedMenuOpen: boolean;
  isPreviewModalOpen: boolean;
  isNodeConfigDrawerOpen: boolean;
  zoomLevel: number; // 0.85 a 1.15
  draggedNewBlockType: StudioBlockType | null;
  
  // Acciones sobre Bloques / Nodos
  addBlock: (type: StudioBlockType, insertAtIndex?: number, customPos?: FlowNodePosition) => string;
  updateBlockData: (id: string, partialData: any) => void;
  updateBlockTitle: (id: string, title: string) => void;
  switchHistoricalFigureOnBlock: (id: string, characterOrSiteName: string, isGeographicSite?: boolean) => Promise<void>;
  removeBlock: (id: string) => void;
  duplicateBlock: (id: string) => void;
  reorderBlocks: (activeId: string, overId: string) => void;
  moveBlock: (id: string, direction: 'up' | 'down') => void;
  toggleCollapseBlock: (id: string) => void;
  setSelectedBlockId: (id: string | null) => void;
  updateNodePosition: (id: string, position: FlowNodePosition) => void;
  setDraggedNewBlockType: (type: StudioBlockType | null) => void;
  
  // Acciones de Grafo y Flujo
  addConnection: (sourceNodeId: string, targetNodeId: string, label?: string) => void;
  removeConnection: (connectionId: string) => void;
  setStartNodeId: (nodeId: string | null) => void;
  autoLayoutNodes: () => void;
  
  // Acciones de Metadatos
  updateMetadata: (partial: Partial<ActivityBuilderMetadata>) => void;
  
  // Historial
  undo: () => void;
  redo: () => void;
  
  // Control de UI
  setIsExtendedMenuOpen: (isOpen: boolean) => void;
  setIsPreviewModalOpen: (isOpen: boolean) => void;
  setIsNodeConfigDrawerOpen: (isOpen: boolean) => void;
  setZoomLevel: (zoom: number) => void;
  
  // Serialización y Plantillas
  loadPresetBlocks: (presetBlocks: StudioBlock[], meta?: Partial<ActivityBuilderMetadata>) => void;
  serializeToActivityJSON: () => StudioActivityJSON;
  resetWorkspace: () => void;
}

const DEFAULT_METADATA: ActivityBuilderMetadata = {
  title: 'Nueva Actividad Didáctica',
  description: 'Actividad construida con bloques interactivos para estudiantes.',
  subject: 'Matemáticas',
  subjectId: 'sub-math',
  targetAge: 'Primaria Alta (9 - 11 años)',
  campoFormativo: 'Saberes y Pensamiento Científico',
  camposFormativos: ['Saberes y Pensamiento Científico'],
  ejesArticuladores: ['Pensamiento Crítico'],
  faseNem: 'Fase 4',
  pdaNem: 'Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas que implican repartir y dividir elementos en partes iguales (fracciones).',
  pdas: ['Fase 4 - Saberes y Pensamiento Científico: Resuelve problemas que implican repartir y dividir elementos en partes iguales (fracciones).'],
  taskType: 'activity_flow',
  xpReward: 100,
  coinsReward: 15,
  totalTimeLimit: 0,
  livesCount: 3,
  streakMultiplier: true,
};

// Generador de bloques por defecto según el tipo (con espaciado magnético anti-colisión de 380px)
const createDefaultBlock = (type: StudioBlockType, index: number = 0, existingBlocks: StudioBlock[] = []): StudioBlock => {
  const id = `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const position: FlowNodePosition = {
    x: 45 + (Math.floor(index / 2) * 380),
    y: 45 + ((index % 2) * 235),
  };

  switch (type) {
    case 'text_narrative':
      return {
        id,
        type: 'text_narrative',
        title: 'Instrucción / Narrativa',
        isCollapsed: false,
        position,
        data: {
          content: '¡Bienvenidos, exploradores del saber! Lean con atención el siguiente desafío para comenzar su aventura.',
          style: 'instruction',
          speakerName: 'Profesor Guía',
        }
      } as TextNarrativeBlock;

    case 'quiz_question':
      return {
        id,
        type: 'quiz_question',
        title: 'Pregunta de Opción Múltiple',
        isCollapsed: false,
        position,
        data: {
          question: '¿Cuál es el concepto clave que aprendimos en esta sesión?',
          options: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
          correctIndex: -1, // -1 indica que el docente aún no ha asignado la opción correcta
          explanation: '',
          timeLimitSeconds: 30,
        }
      } as QuizQuestionBlock;

    case 'timed_reading_block':
      return {
        id,
        type: 'timed_reading_block',
        title: 'Lectura Cronometrada & Comprensión (PPM)',
        isCollapsed: false,
        position,
        data: {
          readingText: 'El sistema solar está compuesto por una estrella central, el Sol, y todos los cuerpos celestes que orbitan a su alrededor debido a la fuerza de gravedad. Entre ellos se encuentran ocho planetas principales, planetas enanos como Plutón, lunas, asteroides y meteoritos.',
          timeLimitSeconds: 60,
          wordCount: 42,
          targetWpm: 120,
          comprehensionQuestions: [
            {
              id: `q-${Date.now()}-1`,
              question: '¿Qué fuerza mantiene a los planetas orbitando alrededor del Sol?',
              options: ['La fuerza de gravedad', 'El magnetismo estelar', 'El viento solar', 'La inercia lunar'],
              correctIndex: 0,
              explanation: 'La atracción gravitacional del Sol mantiene los planetas en sus órbitas.'
            },
            {
              id: `q-${Date.now()}-2`,
              question: '¿Cuántos planetas principales conforman nuestro sistema solar?',
              options: ['Ocho planetas', 'Nueve planetas', 'Seis planetas', 'Doce planetas'],
              correctIndex: 0,
              explanation: 'Actualmente se catalogan ocho planetas principales tras la reclasificación de Plutón.'
            }
          ]
        }
      } as TimedReadingBlock;

    case 'reward_chest':
      return {
        id,
        type: 'reward_chest',
        title: 'Cofre de Recompensas',
        isCollapsed: false,
        position,
        data: {
          xpAmount: 150,
          coinsAmount: 30,
          badgeName: 'Maestro del Saber',
          chestRarity: 'rare',
        }
      } as RewardChestBlock;

    case 'boss_enemy':
      return {
        id,
        type: 'boss_enemy',
        title: 'Encuentro de Combate Pixi',
        isCollapsed: false,
        position,
        data: {
          bossName: 'Gólem del Olvido',
          spriteKey: 'blood_dragon',
          maxHp: 100,
          attackPower: 15,
          victoryCondition: 'defeat_boss',
          backgroundScene: 'volcano',
        }
      } as BossEnemyBlock;

    case 'youtube_video':
      return {
        id,
        type: 'youtube_video',
        title: 'Video Explicativo',
        isCollapsed: false,
        position,
        data: {
          videoUrl: 'https://www.youtube.com/watch?v=wmC0wF8WuqU&t=76s',
          videoTitle: 'Cápsula de Aprendizaje',
          startAtSeconds: 76,
          mustWatchEntirely: false,
        }
      } as YouTubeVideoBlock;

    case 'external_embed':
      return {
        id,
        type: 'external_embed',
        title: 'Simulador / Laboratorio Web',
        isCollapsed: false,
        position,
        data: {
          embedUrl: 'https://phet.colorado.edu/sims/html/forces-and-motion-basics/latest/forces-and-motion-basics_es.html',
          resourceTitle: 'PhET: Fuerzas y Movimiento',
          instructions: 'Aplica una fuerza de 100 N y observa cómo cambia el vector aceleración.',
        }
      } as ExternalEmbedBlock;

    case 'drag_drop_match':
      return {
        id,
        type: 'drag_drop_match',
        title: 'Emparejamiento / Drag & Drop',
        isCollapsed: false,
        position,
        data: {
          instructions: 'Conecta cada concepto de la izquierda con su significado correcto a la derecha:',
          pairs: [
            { left: 'Fuerza', right: 'Interacción que modifica el movimiento' },
            { left: 'Inercia', right: 'Resistencia a cambiar de estado' },
            { left: 'Masa', right: 'Cantidad de materia de un objeto' },
          ]
        }
      } as DragDropMatchBlock;

    case 'ordering_sequence':
      return {
        id,
        type: 'ordering_sequence',
        title: 'Secuencia Cronológica',
        isCollapsed: false,
        position,
        data: {
          instructions: 'Ordena cronológicamente los acontecimientos históricos:',
          stepsInCorrectOrder: [
            '1. Conspiración de Querétaro (1810)',
            '2. Grito de Dolores (16 Sept 1810)',
            '3. Toma de la Alhóndiga de Granaditas (1810)',
            '4. Batalla del Monte de las Cruces (1810)'
          ]
        }
      } as OrderingSequenceBlock;

    case 'fill_in_blanks':
      return {
        id,
        type: 'fill_in_blanks',
        title: 'Completar Espacios en Blanco',
        isCollapsed: false,
        position,
        data: {
          instructions: 'Selecciona las palabras correctas para completar el principio científico:',
          textWithBlanks: 'La [gravedad] es la fuerza que atrae a los cuerpos hacia el centro de la [Tierra].',
          wordBank: ['gravedad', 'Tierra', 'fricción', 'energía']
        }
      } as FillInBlanksBlock;

    case 'open_poll_wordcloud':
      return {
        id,
        type: 'open_poll_wordcloud',
        title: 'Pregunta Abierta con IA',
        isCollapsed: false,
        position,
        data: {
          prompt: '¿Por qué es fundamental la cooperación comunitaria en los proyectos de la Nueva Escuela Mexicana?',
          minWords: 10,
          aiFeedbackRubric: 'Evalúa la argumentación del alumno y brinda un consejo pedagógico formativo y positivo.'
        }
      } as OpenPollWordcloudBlock;

    case 'secret_code_puzzle':
      return {
        id,
        type: 'secret_code_puzzle',
        title: 'Misterio & Código Secreto',
        isCollapsed: false,
        position,
        data: {
          clueText: 'Para abrir la bóveda de la ciencia, descifra la palabra de 6 letras: F _ _ _ Z A',
          secretAnswer: 'FUERZA',
          hintText: 'Es una magnitud vectorial que medimos en Newtons (N).'
        }
      } as SecretCodePuzzleBlock;

    case 'minigame_action':
      return {
        id,
        type: 'minigame_action',
        title: 'Minijuego Arcade (Ruleta)',
        isCollapsed: false,
        position,
        data: {
          minigameType: 'ruleta',
          difficulty: 'medium',
          items: ['+50 XP de Sabiduría', 'Poción de Enfoque', 'Gema Legendaria', '+35 Monedas de Oro']
        }
      } as MinigameActionBlock;

    case 'logic_branch':
      return {
        id,
        type: 'logic_branch',
        title: 'Bifurcación Condicional',
        isCollapsed: false,
        position,
        data: {
          condition: 'score_above_percentage',
          thresholdValue: 70,
          ifTrueNextBlockId: null,
          ifFalseNextBlockId: null
        }
      } as LogicBranchBlock;

    case 'checkpoint_gate':
      return {
        id,
        type: 'checkpoint_gate',
        title: 'Punto de Control Metacognitivo',
        isCollapsed: false,
        position,
        data: {
          checkpointTitle: 'Autoevaluación de Aprendizaje',
          reflectionPrompt: '¿Qué tan seguro te sientes aplicando este concepto en problemas de la vida cotidiana?',
          requiredScorePercent: 60
        }
      } as CheckpointGateBlock;

    case 'badge_certificate':
      return {
        id,
        type: 'badge_certificate',
        title: 'Diploma de Honor Digital',
        isCollapsed: false,
        position,
        data: {
          certificateTitle: 'Diploma al Mérito Científico',
          recipientHonor: 'Gran Maestro de la Física',
          teacherSignatureName: 'Colegio Anglo Mexicano'
        }
      } as BadgeCertificateBlock;

    case 'audio_sfx':
      return {
        id,
        type: 'audio_sfx',
        title: 'Fanfarria de Victoria SFX',
        isCollapsed: false,
        position,
        data: {
          soundType: 'victory_fanfare',
          volume: 80,
          autoPlay: true
        }
      } as AudioSfxBlock;

    case 'logic_challenge_interactive':
      return {
        id,
        type: 'logic_challenge_interactive',
        title: 'Reto de Lógica: La Hora del Lunch',
        isCollapsed: false,
        position,
        data: {
          storyText: 'Lala puede llevar 4 tipos de alimento (Manzanas, Peras, Mangos, Dulces). Reglas: 1) No puede comer mango dos días seguidos. 2) Si hoy lleva dulces, mañana debe llevar manzana o pera.',
          problemQuestion: '¿Qué combinación de alimentos para los 5 días de la semana cumple rigurosamente con todas las reglas?',
          logicCategory: 'conditions',
          educationalLevel: 'fase_3',
          interactiveEngine: 'switch_rules',
          options: [
            { id: 'opt-1', label: 'Lunes: Mango, Martes: Manzana, Miércoles: Pera, Jueves: Mango, Viernes: Pera', isCorrect: true, icon: '🍎', detail: 'Cumple ambas condiciones' },
            { id: 'opt-2', label: 'Lunes: Mango, Martes: Mango, Miércoles: Dulces, Jueves: Manzana, Viernes: Pera', isCorrect: false, icon: '🥭', detail: 'Rompe la regla del mango consecutivo' },
            { id: 'opt-3', label: 'Lunes: Dulces, Martes: Mango, Miércoles: Pera, Jueves: Mango, Viernes: Dulces', isCorrect: false, icon: '🍬', detail: 'Rompe la regla del dulce seguido de fruta' }
          ],
          pedagogicalExplanation: 'Las computadoras siguen reglas llamadas "Condiciones" (IF-THEN). Al combinar múltiples condiciones, el sistema verifica todas antes de tomar una decisión válida.',
          classroomActivity: 'Juego de "Si... Entonces...": Los estudiantes ejecutan una acción física únicamente si cumplen la condición mencionada por el docente.',
          hints: ['Observa qué alimento tiene restricción de días consecutivos.', 'Revisa la regla especial que se activa tras consumir dulces.']
        }
      } as any;

    case 'boolean_circuit_builder':
      return {
        id,
        type: 'boolean_circuit_builder',
        title: 'Circuito Lógico: Prende la Luz',
        isCollapsed: false,
        position,
        data: {
          circuitTitle: 'Red de Compuertas AND y XOR',
          instructions: 'Activa la combinación correcta de interruptores para que la señal eléctrica encienda el foco final.',
          switchesCount: 8,
          gates: [
            { id: 'g1', type: 'AND', inputs: [0, 1], outputTarget: 'g4' },
            { id: 'g2', type: 'XOR', inputs: [2, 3], outputTarget: 'g5' },
            { id: 'g3', type: 'AND', inputs: [4, 5], outputTarget: 'foco' }
          ],
          targetLightState: true,
          validCombinationsCount: 16,
          solutionKey: '11010000',
          pedagogicalExplanation: 'Los procesadores utilizan compuertas AND (ambas señales activas) y XOR (solo una activa) para realizar operaciones binarias a nivel de hardware.',
          classroomActivity: 'Compuertas Humanas: Tres estudiantes actúan como entradas y compuerta lógica con tarjetas de 0 y 1 para predecir la salida.'
        }
      } as any;

    case 'graph_network_path':
      return {
        id,
        type: 'graph_network_path',
        title: 'Exploración de Redes & Grafos',
        isCollapsed: false,
        position,
        data: {
          graphType: 'bfs_propagation',
          storyPrompt: 'Un mensaje inicia en el nodo central. ¿Cuántos días o saltos de red se requieren para alcanzar todos los pueblos vecinos?',
          nodes: [
            { id: 'J', label: 'Pueblo J (Origen)', x: 50, y: 50, isStart: true },
            { id: 'E', label: 'Pueblo E', x: 35, y: 40 },
            { id: 'H', label: 'Pueblo H', x: 45, y: 30 },
            { id: 'G', label: 'Pueblo G', x: 40, y: 70 },
            { id: 'M', label: 'Pueblo M', x: 65, y: 60 },
            { id: 'Q', label: 'Pueblo Q (Destino)', x: 15, y: 20, isTarget: true }
          ],
          edges: [
            { from: 'J', to: 'E' }, { from: 'J', to: 'H' }, { from: 'J', to: 'G' }, { from: 'J', to: 'M' },
            { from: 'E', to: 'Q' }
          ],
          correctPath: ['J', 'E', 'Q'],
          correctAnswer: 4,
          pedagogicalExplanation: 'La Búsqueda en Amplitud (BFS) explora redes capa por capa, siendo la base de algoritmos de rutas, redes sociales y difusión de datos.',
          classroomActivity: 'Red Social en Pizarrón: Dibujar una red de nodos y calcular los grados de separación entre alumnos.'
        }
      } as any;

    case 'turing_step_simulator':
      return {
        id,
        type: 'turing_step_simulator',
        title: 'Simulador de Autómata & Robot Agrícola',
        isCollapsed: false,
        position,
        data: {
          simulatorType: 'turing_tape',
          initialTape: ['🌸', '🌷', '🌻', 'X', '_', '_', '_'],
          rules: [
            { state: 'q0', readSymbol: 'X', writeSymbol: '🌸', move: 'R', nextState: 'q1' },
            { state: 'q1', readSymbol: '_', writeSymbol: '🌸', move: 'L', nextState: 'q2' }
          ],
          targetGoalDescription: 'Plantar flores en efecto espejo a partir de la casilla central X siguiendo las instrucciones del cabezal.',
          maxSteps: 10,
          options: [
            { id: 'o1', label: 'Espejo simétrico de flores en el lado derecho', isCorrect: true },
            { id: 'o2', label: 'Flores alternadas sin orden simétrico', isCorrect: false },
            { id: 'o3', label: 'Cinta vacía al finalizar los ciclos', isCorrect: false }
          ],
          pedagogicalExplanation: 'Una máquina de Turing lee, escribe en cinta y se desplaza según un estado interno, modelando el funcionamiento fundamental de todo procesador.',
          classroomActivity: 'Robot de Papel: Seguir una secuencia de instrucciones con tarjetas físicas y verificar el estado final en el aula.'
        }
      } as any;

    case 'constraint_scheduler':
      return {
        id,
        type: 'constraint_scheduler',
        title: 'Planificador de Procesos & Turnos (CSP)',
        isCollapsed: false,
        position,
        data: {
          schedulerType: 'timetable_grid',
          scenarioDescription: 'Seis colaboradores deben distribuirse en 3 días de trabajo agrícola cooperativo sin que nadie trabaje más de 2 días seguidos.',
          entities: [
            { id: 'e1', name: 'Ana', requirements: ['Lunes', 'Martes', 'Sábado'], duration: 1 },
            { id: 'e2', name: 'Beto', requirements: ['Lunes', 'Martes', 'Miércoles'], duration: 1 },
            { id: 'e3', name: 'Carlos', requirements: ['Martes', 'Jueves', 'Sábado'], duration: 1 }
          ],
          slotsOrDays: ['Lunes', 'Martes', 'Sábado'],
          rules: ['Mínimo 4 personas por jornada', 'Nadie puede participar en las 3 jornadas simultáneamente'],
          correctAssignment: { 'Lunes': ['e1', 'e2'], 'Martes': ['e1', 'e2', 'e3'], 'Sábado': ['e1', 'e3'] },
          pedagogicalExplanation: 'Los problemas de Satisfacción de Restricciones (CSP) son fundamentales para la optimización de recursos, planificadores de CPU y logística.',
          classroomActivity: 'Organizador de Torneos: Asignar consolas y turnos entre estudiantes cumpliendo restricciones sin conflictos.'
        }
      } as any;

    case 'languages_practice_portal':
      return {
        id,
        type: 'languages_practice_portal',
        title: 'Avatar Conversacional en Idiomas',
        isCollapsed: false,
        position,
        data: {
          language: 'en',
          mode: 'avatar',
          targetPhrase: 'Hello students! Welcome to our interactive language session.',
          portalUrl: '/teacher/idiomas',
          pedagogicalGoal: 'Conversación interactiva y fluidez auditiva con gesticulación anatómica'
        }
      } as any;

    case 'languages_karaoke_block':
      return {
        id,
        type: 'languages_karaoke_block',
        title: 'Karaoke de Fluidez Fonética',
        isCollapsed: false,
        position,
        data: {
          language: 'en',
          tempoWpm: 110,
          targetSentence: 'The quick brown fox jumps over the lazy dog',
          portalUrl: '/teacher/idiomas',
          difficulty: 'intermedio'
        }
      } as any;

    case 'languages_socratic_tutor':
      return {
        id,
        type: 'languages_socratic_tutor',
        title: 'Tutor Socrático IA (DELF / Cambridge)',
        isCollapsed: false,
        position,
        data: {
          language: 'en',
          targetLevel: 'B1',
          cenniTargetLevel: 11,
          scenarioTitle: 'Exploración de Ecosistemas y Biodiversidad',
          pedagogicalObjective: 'Desarrollo de fluidez argumentativa y vocabulario formal con retroalimentación en tiempo real',
          starterPrompt: 'Hello! Today we are discussing sustainable development and biodiversity. What is one habit we should change?',
          correctionStrictness: 'standard',
          portalUrl: '/teacher/idiomas'
        }
      } as any;

    case 'languages_roleplay_mission':
      return {
        id,
        type: 'languages_roleplay_mission',
        title: 'Roleplay & Misión Inmersiva en Idiomas',
        isCollapsed: false,
        position,
        data: {
          language: 'fr',
          setting: 'cafe_paris',
          roleStudent: 'Cliente solicitando menú típico francés',
          rolePartner: 'Mesero parisino cordial con acento nativo',
          missionGoal: 'Ordenar un almuerzo balanceado utilizando fórmulas de cortesía y preguntas sobre alergias alimentarias',
          requiredExpressions: ['Je voudrais', 'S\'il vous plaît', 'Est-ce qu\'il y a du gluten?', 'L\'addition, s\'il vous plaît'],
          portalUrl: '/teacher/idiomas'
        }
      } as any;

    case 'languages_evaluation_rubric':
      return {
        id,
        type: 'languages_evaluation_rubric',
        title: 'Evaluación Formativa CENNI / DELF',
        isCollapsed: false,
        position,
        data: {
          language: 'en',
          framework: 'CEFR',
          targetLevel: 'B2',
          passingScore: 70,
          portalUrl: '/teacher/idiomas',
          criteria: [
            { dimension: 'oral_production', weightPercentage: 30, descriptor: 'Fluidez, articulación fonética y entonación sin pausas forzadas' },
            { dimension: 'oral_comprehension', weightPercentage: 25, descriptor: 'Captación de ideas principales e intenciones comunicativas' },
            { dimension: 'written_production', weightPercentage: 25, descriptor: 'Cohesión léxica, sintaxis variada y ortografía estandarizada' },
            { dimension: 'phonetics', weightPercentage: 20, descriptor: 'Alineación de fonemas clave y reducción de acento de interferencia' }
          ]
        }
      } as any;

    case 'historical_figure_block': {
      // Seleccionar automáticamente el siguiente personaje o sitio histórico del catálogo que aún no esté en el lienzo
      const usedNames = new Set(
        existingBlocks
          .filter((b) => b.type === 'historical_figure_block')
          .map((b: any) => (b.data?.characterName || '').toLowerCase())
      );
      const nextAvailableIdx = HISTORICAL_FIGURES_PRESET_CATALOG.findIndex(
        (fig) => !usedNames.has(fig.characterName.toLowerCase())
      );
      const catalogIndex = nextAvailableIdx >= 0 ? nextAvailableIdx : existingBlocks.filter((b) => b.type === 'historical_figure_block').length;
      const figureData = buildDynamicHistoricalFigureData(undefined, catalogIndex);

      return {
        id,
        type: 'historical_figure_block',
        title: figureData.characterName,
        isCollapsed: false,
        position,
        data: figureData
      } as any;
    }

    case 'omr_optical_exam_block':
      return {
        id,
        type: 'omr_optical_exam_block',
        title: 'Examen Híbrido OMR & Variantes A/B/C/D',
        isCollapsed: false,
        position,
        data: {
          examTitle: 'Evaluación Sumativa & Formativa SEP: La Gesta de Independencia (1810-1821)',
          deliveryMode: 'hybrid_paper_digital',
          variantsCount: 4,
          shuffleQuestions: true,
          shuffleOptions: true,
          penaltyPerError: 0.25,
          timeLimitMinutes: 30,
          allowStudentBubbleCorrection: true,
          syncToKardexAndCeo: true,
          notebookStampPage: 48,
          questions: [
            {
              id: 'omr-q1',
              type: 'single_choice',
              stem: '¿Desde qué ciudad envió Doña Josefa Ortiz de Domínguez el aviso urgente la noche del 15 de septiembre de 1810 tras descubrirse la conspiración?',
              options: [
                'Santiago de Querétaro',
                'San Miguel el Grande',
                'Valladolid (hoy Morelia)',
                'Chilpancingo de los Bravo'
              ],
              correctOptionIndex: 0,
              points: 2,
              explanation: 'Desde la Corregiduría de Querétaro envió a Ignacio Pérez a cabalgar hacia San Miguel y Dolores.'
            },
            {
              id: 'omr-q2',
              type: 'single_choice',
              stem: '¿Qué documento redactado por José María Morelos en 1813 proclamó por primera vez la abolición de la esclavitud y que la soberanía dimana del pueblo?',
              options: [
                'Sentimientos de la Nación',
                'Plan de Iguala',
                'Tratados de Córdoba',
                'Estatuto Provisional del Imperio'
              ],
              correctOptionIndex: 0,
              points: 2,
              explanation: 'Leído el 14 de septiembre de 1813 en la apertura del Congreso de Anáhuac en Chilpancingo.'
            },
            {
              id: 'omr-q3',
              type: 'single_choice',
              stem: '¿Cuál es el orden cronológico correcto de las 4 etapas del proceso de Independencia de México (1810-1821)?',
              options: [
                '1. Inicio (Hidalgo) → 2. Organización (Morelos) → 3. Resistencia (Guerrero) → 4. Consumación (1821)',
                '1. Organización → 2. Inicio → 3. Consumación → 4. Resistencia',
                '1. Resistencia → 2. Consumación → 3. Inicio → 4. Organización',
                '1. Inicio → 2. Consumación → 3. Organización → 4. Resistencia'
              ],
              correctOptionIndex: 0,
              points: 2,
              explanation: 'Las 4 etapas históricas SEP son Inicio, Organización, Resistencia y Consumación.'
            },
            {
              id: 'omr-q4',
              type: 'single_choice',
              stem: '¿En qué batalla del 30 de octubre de 1810 las fuerzas insurgentes derrotaron al ejército realista a las puertas de la Ciudad de México?',
              options: [
                'Batalla del Monte de las Cruces',
                'Batalla del Puente de Calderón',
                'Sitio de Cuautla',
                'Toma del Fuerte de San Diego'
              ],
              correctOptionIndex: 0,
              points: 2,
              explanation: 'La victoria insurgente en el Monte de las Cruces abrió el paso al Valle de México.'
            },
            {
              id: 'omr-q5',
              type: 'single_choice',
              stem: '¿Qué caudillo insurgente sostuvo la resistencia en las montañas del sur y consumó el Abrazo de Acatempan en 1821?',
              options: [
                'Vicente Guerrero Saldaña',
                'Mariano Matamoros',
                'Hermenegildo Galeana',
                'Nicolás Bravo'
              ],
              correctOptionIndex: 0,
              points: 2,
              explanation: 'Vicente Guerrero mantuvo viva la causa en el sur bajo el principio "La Patria es Primero".'
            }
          ]
        }
      } as any;

    case 'interactive_hotspot_canvas':
      return {
        id,
        type: 'interactive_hotspot_canvas',
        title: 'Mapa de Puntos Calientes & Oclusión Visual',
        isCollapsed: false,
        position,
        data: {
          diagramTitle: 'Ruta Geográfica de la Insurgencia (1810-1811)',
          diagramImageUrl: '/images/history/queretaro_1810_avatar.png',
          instructions: 'Toca cada pin numerado en el mapa cartográfico y selecciona el hito histórico correspondiente (0 Tokens):',
          hotspots: [
            {
              id: 'hs-1',
              pinNumber: 1,
              xPercent: 28,
              yPercent: 36,
              correctLabel: '1. Santiago de Querétaro (Aviso de la Corregidora)',
              distractorLabels: ['Puerto de Veracruz', 'Fuerte de Acapulco', 'Córdoba'],
              hint: 'Ciudad donde se reunía la tertulia literaria en 1810.'
            },
            {
              id: 'hs-2',
              pinNumber: 2,
              xPercent: 52,
              yPercent: 48,
              correctLabel: '2. Pueblo de Dolores (Proclama del 16 de Septiembre)',
              distractorLabels: ['Chilpancingo', 'Guadalajara', 'Chihuahua'],
              hint: 'Parroquia donde Don Miguel Hidalgo convocó al pueblo.'
            },
            {
              id: 'hs-3',
              pinNumber: 3,
              xPercent: 74,
              yPercent: 62,
              correctLabel: '3. Guanajuato (Toma de la Alhóndiga de Granaditas)',
              distractorLabels: ['Acatempan', 'Valladolid', 'Monte de las Cruces'],
              hint: 'Recinto fortificado tomado el 28 de septiembre de 1810.'
            }
          ]
        }
      } as any;

    case 'cornell_smart_notes':
      return {
        id,
        type: 'cornell_smart_notes',
        title: 'Apuntes Cornell & Sello QR de Libreta',
        isCollapsed: false,
        position,
        data: {
          topicTitle: 'Síntesis Estructurada Cornell: Causas Internas y Externas de 1810',
          notebookPageNumber: 48,
          keyCuesPrompts: [
            '¿Qué reformas borbónicas afectaron a los criollos?',
            '¿Por qué la invasión napoleónica a España en 1808 detonó las juntas?',
            '¿Qué papel jugó la desigualdad de castas?'
          ],
          guidedNotesTemplate: '1. Causas Externas: Ilustración, Independencia de las 13 Colonias e invasión de 1808.\n2. Causas Internas: Desigualdad social, monopolio de cargos y tributos.',
          requiredSummaryKeywords: ['soberanía', 'criollos', 'igualdad', 'constitución'],
          autoStampOnCompletion: true
        }
      } as any;

    case 'exit_ticket_reflection':
      return {
        id,
        type: 'exit_ticket_reflection',
        title: 'Boleto de Salida 3-2-1 & Termómetro Aula',
        isCollapsed: false,
        position,
        data: {
          closurePrompt: 'Antes de concluir la sesión, registra tu síntesis 3-2-1 y tu semáforo de dominio para el Espejo Ejecutivo:',
          requireThreeLearnings: true,
          requireTwoQuestions: true,
          requireOneApplication: true,
          expectedCoreConcepts: ['independencia', 'soberanía', 'derechos', 'justicia'],
          enableTrafficLightSelfCheck: true
        }
      } as any;

    case 'socratic_debate_arena':
      return {
        id,
        type: 'socratic_debate_arena',
        title: 'Foro de Debate & Co-Evaluación por Pares',
        isCollapsed: false,
        position,
        data: {
          centralDilemma: '¿Debía el movimiento de 1810 buscar autonomía dentro de la Corona o separación absoluta e inmediata?',
          stanceATitle: 'Postura A: Soberanía Popular e Independencia Absoluta (Morelos / Hidalgo)',
          stanceBTitle: 'Postura B: Junta Provisional Autonomista (Primo de Verdad / Talamantes)',
          primarySourceExcerpt: '“Que la soberanía dimana inmediatamente del pueblo, el que sólo quiere depositarla en sus representantes...” — Art. 5°, Sentimientos de la Nación (1813).',
          requiredEvidenceKeywords: ['soberanía', 'pueblo', 'división de poderes', 'esclavitud'],
          peerRubricCriteria: [
            'Cita al menos un hecho o documento histórico real (1808-1821)',
            'Contrasta respetuosamente la postura contraria con argumentos lógicos',
            'Vincula el dilema histórico con los derechos ciudadanos actuales'
          ]
        }
      } as any;

    case 'interactive_whiteboard_math':
      return {
        id,
        type: 'interactive_whiteboard_math',
        title: 'Pizarra Matemática & Graficador STEM',
        isCollapsed: false,
        position,
        data: {
          challengeTitle: 'Modelado Lineal y Parabólico en Plano Cartesiano (0 Tokens)',
          mathMode: 'linear_function',
          formulaExpression: 'y = 2x + 1',
          targetSlopeM: 2,
          targetInterceptB: 1,
          targetCoordinate: { x: 2, y: 5 },
          promptQuestion: 'Ajusta la pendiente (m = 2) y la ordenada al origen (b = 1) para trazar la recta y = 2x + 1 y verifica el punto (2, 5):',
          tolerance: 0.1
        }
      } as any;

    default:
      return {
        id,
        type: 'text_narrative',
        title: 'Nuevo Bloque Didáctico',
        isCollapsed: false,
        position,
        data: { content: 'Instrucción o contenido pedagógico', style: 'instruction' }
      } as TextNarrativeBlock;
  }
};

/**
 * Calcula un auto-layout topológico / por columnas libre de colisiones (paso horizontal 380px, vertical 235px)
 * preservando las ramas condicionales (Maestría >=70% y Refuerzo <70%).
 */
function computeAntiCollisionLayout(
  blocks: StudioBlock[],
  connections: FlowConnection[],
  startNodeId: string | null
): { blocks: StudioBlock[]; connections: FlowConnection[] } {
  if (blocks.length === 0) return { blocks: [], connections: [] };

  let activeConns = [...connections];
  // Si no hay ninguna conexión, crear secuencia base conectando bifurcaciones si existen
  if (activeConns.length === 0 && blocks.length > 1) {
    for (let i = 0; i < blocks.length - 1; i++) {
      activeConns.push({
        id: `conn-auto-${i}`,
        sourceNodeId: blocks[i].id,
        targetNodeId: blocks[i + 1].id,
        label: 'next',
      });
    }
  }

  // Asegurar que los bloques logic_branch tengan etiquetas claras en sus ramas salientes
  blocks.forEach((b) => {
    if (b.type === 'logic_branch') {
      const outgoing = activeConns.filter((c) => c.sourceNodeId === b.id);
      if (outgoing.length >= 2) {
        if (!outgoing[0].label || outgoing[0].label === 'next') {
          outgoing[0].label = `≥ ${b.data.thresholdScore || 70}% Ruta Maestría`;
        }
        if (!outgoing[1].label || outgoing[1].label === 'next') {
          outgoing[1].label = `< ${b.data.thresholdScore || 70}% Ruta Refuerzo`;
        }
      }
    }
  });

  // Calcular nivel de columna por BFS desde el nodo inicial
  const rootId = startNodeId && blocks.some((b) => b.id === startNodeId) ? startNodeId : blocks[0].id;
  const colMap = new Map<string, number>();
  const rowOrderInCol = new Map<number, string[]>();

  const queue: { id: string; col: number }[] = [{ id: rootId, col: 0 }];
  colMap.set(rootId, 0);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const out = activeConns.filter((c) => c.sourceNodeId === curr.id);
    out.forEach((conn) => {
      if (!colMap.has(conn.targetNodeId)) {
        const nextCol = curr.col + 1;
        colMap.set(conn.targetNodeId, nextCol);
        queue.push({ id: conn.targetNodeId, col: nextCol });
      }
    });
  }

  // Asignar columnas a nodos no alcanzados desde rootId
  let maxCol = Math.max(0, ...Array.from(colMap.values()));
  blocks.forEach((b) => {
    if (!colMap.has(b.id)) {
      const col = Math.floor(colMap.size / 2);
      colMap.set(b.id, col);
      if (col > maxCol) maxCol = col;
    }
  });

  // Agrupar por columna (máximo 2 nodos por columna para visibilidad panorámica en 16:9)
  const finalPosMap = new Map<string, FlowNodePosition>();
  blocks.forEach((b) => {
    const rawCol = colMap.get(b.id) ?? 0;
    const list = rowOrderInCol.get(rawCol) || [];
    list.push(b.id);
    rowOrderInCol.set(rawCol, list);
  });

  // Si una columna lineal tiene solo 1 nodo tras otro en cadena larga (>4 columnas), compactar en grilla de 2 filas
  const totalCols = rowOrderInCol.size;
  if (totalCols > 4 && Array.from(rowOrderInCol.values()).every((arr) => arr.length === 1)) {
    blocks.forEach((b, idx) => {
      const col = Math.floor(idx / 2);
      const row = idx % 2;
      finalPosMap.set(b.id, {
        x: 45 + col * 380,
        y: 45 + row * 235,
      });
    });
  } else {
    Array.from(rowOrderInCol.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([colIdx, nodeIds]) => {
        nodeIds.forEach((id, rowIdx) => {
          const yBase = nodeIds.length === 1 ? 110 : 40 + rowIdx * 235;
          finalPosMap.set(id, {
            x: 45 + colIdx * 380,
            y: yBase,
          });
        });
      });
  }

  const layoutedBlocks = blocks.map((b) => ({
    ...b,
    position: finalPosMap.get(b.id) || b.position || { x: 45, y: 80 },
  }));

  return { blocks: layoutedBlocks, connections: activeConns };
}

export const useActivityBuilderStore = create<ActivityBuilderState>()(
  persist(
    (set, get) => ({
      metadata: MEXICAN_INDEPENDENCE_METADATA,
      blocks: MEXICAN_INDEPENDENCE_BLOCKS,
      selectedBlockId: MEXICAN_INDEPENDENCE_BLOCKS[0].id,
      connections: MEXICAN_INDEPENDENCE_CONNECTIONS,
      startNodeId: MEXICAN_INDEPENDENCE_BLOCKS[0].id,
      history: [MEXICAN_INDEPENDENCE_BLOCKS],
      historyIndex: 0,
      isExtendedMenuOpen: false,
      isPreviewModalOpen: false,
      isNodeConfigDrawerOpen: false,
      zoomLevel: 1.0,
      draggedNewBlockType: null,

      setDraggedNewBlockType: (type: StudioBlockType | null) => set({ draggedNewBlockType: type }),

      // Añadir bloque / nodo con conexión automática al nodo previo y posicionamiento sin colisión
      addBlock: (type: StudioBlockType, insertAtIndex?: number, customPos?: FlowNodePosition) => {
        const state = get();
        const nextIndex = state.blocks.length;
        const newBlock = createDefaultBlock(type, nextIndex, state.blocks);
        
        if (customPos) {
          newBlock.position = customPos;
        } else {
          // Garantizar que la posición calculada no colisione con ningún nodo existente
          let candidateX = newBlock.position?.x || 45;
          let candidateY = newBlock.position?.y || 45;
          let attempts = 0;
          while (
            attempts < 20 &&
            state.blocks.some(
              (existing) =>
                Math.abs((existing.position?.x || 0) - candidateX) < 320 &&
                Math.abs((existing.position?.y || 0) - candidateY) < 190
            )
          ) {
            attempts++;
            candidateX = 45 + Math.floor((nextIndex + attempts) / 2) * 380;
            candidateY = 45 + ((nextIndex + attempts) % 2) * 235;
          }
          newBlock.position = { x: candidateX, y: candidateY };
        }

        // Si es el primer nodo, marcarlo como nodo de inicio
        if (state.blocks.length === 0) {
          newBlock.isStartNode = true;
        }

        let updatedBlocks: StudioBlock[];
        if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= state.blocks.length) {
          updatedBlocks = [...state.blocks];
          updatedBlocks.splice(insertAtIndex, 0, newBlock);
        } else {
          updatedBlocks = [...state.blocks, newBlock];
        }

        // Conexión automática desde el nodo anterior o el seleccionado
        const newConnections = [...state.connections];
        const previousNodeId = state.selectedBlockId || (state.blocks.length > 0 ? state.blocks[state.blocks.length - 1].id : null);
        
        if (previousNodeId && previousNodeId !== newBlock.id) {
          const alreadyConnected = newConnections.some(c => c.sourceNodeId === previousNodeId && c.targetNodeId === newBlock.id);
          if (!alreadyConnected) {
            newConnections.push({
              id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              sourceNodeId: previousNodeId,
              targetNodeId: newBlock.id,
            });
          }
        }

        const newStartId = state.startNodeId || newBlock.id;
        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(updatedBlocks);

        set({
          blocks: updatedBlocks,
          connections: newConnections,
          startNodeId: newStartId,
          selectedBlockId: newBlock.id,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });

        return newBlock.id;
      },

      updateBlockData: (id: string, partialData: any) => {
        set((state) => {
          const updatedBlocks = state.blocks.map((block) => {
            if (block.id !== id) return block;
            return {
              ...block,
              data: {
                ...block.data,
                ...partialData,
              },
            } as StudioBlock;
          });

          return { blocks: updatedBlocks };
        });
      },

      updateBlockTitle: (id: string, title: string) => {
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, title } : b)),
        }));
      },

      // Cambia al instante el personaje o sitio histórico de un bloque (desde Catálogo, Bóveda Curricular o Motor IA)
      switchHistoricalFigureOnBlock: async (id: string, characterOrSiteName: string, isGeographicSite: boolean = false) => {
        const cleanName = characterOrSiteName.trim();
        if (!cleanName) return;

        // 1. Actualización optimista inmediata con el catálogo en memoria
        const optimisticData = buildDynamicHistoricalFigureData(cleanName, 0, isGeographicSite);
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id && b.type === 'historical_figure_block'
              ? ({
                  ...b,
                  title: optimisticData.characterName,
                  data: {
                    ...b.data,
                    ...optimisticData,
                  },
                } as any)
              : b
          ),
        }));

        // 2. Consultar la Bóveda Curricular (22+ nodos completos) o generar con Motor IA Pedagógica y persistir en Bóveda
        try {
          const res = await fetch(`/api/vault/historical-figures?name=${encodeURIComponent(cleanName)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.found && json.figure) {
              set((state) => ({
                blocks: state.blocks.map((b) =>
                  b.id === id && b.type === 'historical_figure_block'
                    ? ({
                        ...b,
                        title: json.figure.characterName || cleanName,
                        data: {
                          ...b.data,
                          ...json.figure,
                          characterOrSiteName: json.figure.characterName || cleanName,
                          firstPersonGreeting:
                            json.figure.firstPersonGreeting ||
                            json.figure.shortBio ||
                            optimisticData.firstPersonGreeting,
                          isFromVault: true,
                        },
                      } as any)
                    : b
                ),
              }));
              return;
            }
          }

          // Fallback Pedagógico Vault-First: Si no existe aún en la Bóveda, generarlo en 1ª persona y persistirlo
          const genRes = await fetch('/api/ai/historical-figure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'generate_figure',
              characterName: cleanName,
              isGeographicSite,
            }),
          });
          if (genRes.ok) {
            const genJson = await genRes.json();
            if (genJson.success && genJson.figure) {
              set((state) => ({
                blocks: state.blocks.map((b) =>
                  b.id === id && b.type === 'historical_figure_block'
                    ? ({
                        ...b,
                        title: genJson.figure.characterName || cleanName,
                        data: {
                          ...b.data,
                          ...genJson.figure,
                          characterOrSiteName: genJson.figure.characterName || cleanName,
                          firstPersonGreeting:
                            genJson.figure.firstPersonGreeting ||
                            genJson.figure.shortBio ||
                            optimisticData.firstPersonGreeting,
                          isFromVault: true,
                        },
                      } as any)
                    : b
                ),
              }));
            }
          }
        } catch {
          // Mantiene los datos optimistas del catálogo
        }
      },

      updateNodePosition: (id: string, position: FlowNodePosition) => {
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, position } : b)),
        }));
      },

      removeBlock: (id: string) => {
        set((state) => {
          const updatedBlocks = state.blocks.filter((b) => b.id !== id);
          const updatedConnections = state.connections.filter(c => c.sourceNodeId !== id && c.targetNodeId !== id);
          
          let nextStartId = state.startNodeId;
          if (state.startNodeId === id) {
            nextStartId = updatedBlocks[0]?.id || null;
            if (updatedBlocks[0]) {
              updatedBlocks[0].isStartNode = true;
            }
          }

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(updatedBlocks);

          return {
            blocks: updatedBlocks,
            connections: updatedConnections,
            startNodeId: nextStartId,
            selectedBlockId: state.selectedBlockId === id ? (updatedBlocks[0]?.id || null) : state.selectedBlockId,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      duplicateBlock: (id: string) => {
        const state = get();
        const blockToDup = state.blocks.find((b) => b.id === id);
        if (!blockToDup) return;

        const newId = `blk-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const duplicatedBlock: StudioBlock = {
          ...JSON.parse(JSON.stringify(blockToDup)),
          id: newId,
          title: `${blockToDup.title} (Copia)`,
          isStartNode: false,
          position: {
            x: (blockToDup.position?.x || 100) + 360,
            y: (blockToDup.position?.y || 100) + 40,
          }
        };

        const targetIndex = state.blocks.findIndex((b) => b.id === id);
        const updatedBlocks = [...state.blocks];
        updatedBlocks.splice(targetIndex + 1, 0, duplicatedBlock);

        // Conectar automáticamente el duplicado desde el original
        const newConnections = [
          ...state.connections,
          {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sourceNodeId: id,
            targetNodeId: newId,
          }
        ];

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(updatedBlocks);

        set({
          blocks: updatedBlocks,
          connections: newConnections,
          selectedBlockId: newId,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      reorderBlocks: (activeId: string, overId: string) => {
        set((state) => {
          if (activeId === overId) return state;

          const oldIndex = state.blocks.findIndex((b) => b.id === activeId);
          const newIndex = state.blocks.findIndex((b) => b.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const updatedBlocks = [...state.blocks];
          const [movedBlock] = updatedBlocks.splice(oldIndex, 1);
          updatedBlocks.splice(newIndex, 0, movedBlock);

          const newHistory = state.history.slice(0, state.historyIndex + 1);
          newHistory.push(updatedBlocks);

          return {
            blocks: updatedBlocks,
            history: newHistory,
            historyIndex: newHistory.length - 1,
          };
        });
      },

      moveBlock: (id: string, direction: 'up' | 'down') => {
        const state = get();
        const index = state.blocks.findIndex((b) => b.id === id);
        if (index === -1) return;

        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === state.blocks.length - 1) return;

        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        const updatedBlocks = [...state.blocks];
        const [moved] = updatedBlocks.splice(index, 1);
        updatedBlocks.splice(targetIndex, 0, moved);

        const newHistory = state.history.slice(0, state.historyIndex + 1);
        newHistory.push(updatedBlocks);

        set({
          blocks: updatedBlocks,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        });
      },

      toggleCollapseBlock: (id: string) => {
        set((state) => ({
          blocks: state.blocks.map((b) =>
            b.id === id ? { ...b, isCollapsed: !b.isCollapsed } : b
          ),
        }));
      },

      setSelectedBlockId: (id: string | null) => set({ selectedBlockId: id }),

      // Acciones de Grafo y Conexión de Flechas Direccionales
      addConnection: (sourceNodeId: string, targetNodeId: string, label?: string) => {
        if (sourceNodeId === targetNodeId) return; // Evitar auto-conexiones cíclicas triviales
        set((state) => {
          // Si ya existe una conexión idéntica, ignorar
          const exists = state.connections.some(c => c.sourceNodeId === sourceNodeId && c.targetNodeId === targetNodeId);
          if (exists) return state;

          const sourceBlock = state.blocks.find((b) => b.id === sourceNodeId);
          let resolvedLabel = label;
          if (!resolvedLabel && sourceBlock?.type === 'logic_branch') {
            const existingOut = state.connections.filter((c) => c.sourceNodeId === sourceNodeId);
            const thresh = (sourceBlock as any).data?.thresholdScore || 70;
            resolvedLabel = existingOut.length === 0 ? `≥ ${thresh}% Ruta Maestría` : `< ${thresh}% Ruta Refuerzo`;
          }

          const newConn: FlowConnection = {
            id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            sourceNodeId,
            targetNodeId,
            label: resolvedLabel,
          };

          return { connections: [...state.connections, newConn] };
        });
      },

      removeConnection: (connectionId: string) => {
        set((state) => ({
          connections: state.connections.filter(c => c.id !== connectionId),
        }));
      },

      setStartNodeId: (nodeId: string | null) => {
        set((state) => ({
          startNodeId: nodeId,
          blocks: state.blocks.map(b => ({
            ...b,
            isStartNode: b.id === nodeId,
          })),
        }));
      },

      autoLayoutNodes: () => {
        set((state) => {
          const { blocks: layoutedBlocks, connections: layoutedConns } = computeAntiCollisionLayout(
            state.blocks,
            state.connections,
            state.startNodeId
          );

          return {
            blocks: layoutedBlocks,
            connections: layoutedConns,
            startNodeId: layoutedBlocks[0]?.id || null,
          };
        });
      },

      updateMetadata: (partial: Partial<ActivityBuilderMetadata>) => {
        set((state) => ({
          metadata: {
            ...state.metadata,
            ...partial,
          },
        }));
      },

      undo: () => {
        set((state) => {
          if (state.historyIndex <= 0) return state;
          const newIdx = state.historyIndex - 1;
          const prevBlocks = state.history[newIdx];
          return {
            blocks: prevBlocks,
            historyIndex: newIdx,
            selectedBlockId: prevBlocks[0]?.id || null,
          };
        });
      },

      redo: () => {
        set((state) => {
          if (state.historyIndex >= state.history.length - 1) return state;
          const newIdx = state.historyIndex + 1;
          const nextBlocks = state.history[newIdx];
          return {
            blocks: nextBlocks,
            historyIndex: newIdx,
            selectedBlockId: nextBlocks[0]?.id || null,
          };
        });
      },

      setIsExtendedMenuOpen: (isOpen: boolean) => set({ isExtendedMenuOpen: isOpen }),
      setIsPreviewModalOpen: (isOpen: boolean) => set({ isPreviewModalOpen: isOpen }),
      setIsNodeConfigDrawerOpen: (isOpen: boolean) => set({ isNodeConfigDrawerOpen: isOpen }),
      setZoomLevel: (zoom: number) => set({ zoomLevel: Math.min(1.3, Math.max(0.6, zoom)) }),

      loadPresetBlocks: (presetBlocks: StudioBlock[], meta?: Partial<ActivityBuilderMetadata>) => {
        // Asignar posiciones anti-colisión de 380px y conexiones respetando bifurcaciones
        const rawPositioned = presetBlocks.map((b, idx) => ({
          ...b,
          isStartNode: idx === 0,
          position: b.position || {
            x: 45 + Math.floor(idx / 2) * 380,
            y: 45 + (idx % 2) * 235,
          }
        }));

        const presetConnections: FlowConnection[] = [];
        for (let i = 0; i < rawPositioned.length - 1; i++) {
          presetConnections.push({
            id: `conn-preset-${i}`,
            sourceNodeId: rawPositioned[i].id,
            targetNodeId: rawPositioned[i + 1].id,
          });
        }

        const { blocks: positioned, connections: finalConns } = computeAntiCollisionLayout(
          rawPositioned,
          presetConnections,
          rawPositioned[0]?.id || null
        );

        set((state) => ({
          blocks: positioned,
          connections: finalConns,
          startNodeId: positioned[0]?.id || null,
          selectedBlockId: positioned[0]?.id || null,
          metadata: meta ? { ...state.metadata, ...meta } : state.metadata,
          history: [positioned],
          historyIndex: 0,
        }));
      },

      serializeToActivityJSON: (): StudioActivityJSON => {
        const state = get();
        const quizQuestions: any[] = [];

        state.blocks.forEach((block) => {
          if (block.type === 'quiz_question') {
            const qData = block.data;
            quizQuestions.push({
              question: qData.question,
              options: qData.options,
              correctIndex: qData.correctIndex >= 0 ? qData.correctIndex : 0,
              explanation: qData.explanation,
              imageUrl: qData.imageUrl,
            });
          } else if (block.type === 'historical_figure_block') {
            const hData = block.data;
            if (hData.verificationQuestions && hData.verificationQuestions.length > 0) {
              hData.verificationQuestions.forEach((vq) => {
                quizQuestions.push({
                  question: `🏛️ ${hData.characterName}: ${vq.question}`,
                  options: vq.options,
                  correctIndex: vq.correctIndex,
                  explanation: vq.explanation,
                });
              });
            } else {
              quizQuestions.push({
                question: `🏛️ Protagonista Histórico: ${hData.characterName} (${hData.birthDeathDates || hData.historicalEra})`,
                options: ['Explorar Libro Mágico 3D y Mapa', 'Dialogar en 1ª Persona'],
                correctIndex: 0,
                explanation: hData.shortBio,
              });
            }
          } else if (block.type === 'fill_in_blanks') {
            quizQuestions.push({
              question: `✍️ Completar Espacios: ${block.data.textWithBlanks.replace(/\[(.*?)\]/g, '_____')}`,
              options: block.data.wordBank?.length >= 2 ? block.data.wordBank : ['Verificar banco de palabras', 'Continuar'],
              correctIndex: 0,
              explanation: `Texto completo: ${block.data.textWithBlanks.replace(/\[(.*?)\]/g, '$1')}`,
            });
          } else if (block.type === 'ordering_sequence') {
            quizQuestions.push({
              question: `🔢 Ordenar Secuencia: ${block.data.instructions}`,
              options: block.data.stepsInCorrectOrder?.slice(0, 4) || ['Paso 1', 'Paso 2'],
              correctIndex: 0,
              explanation: `Orden correcto verificado (${block.data.stepsInCorrectOrder?.length || 0} etapas).`,
            });
          } else if (block.type === 'drag_drop_match') {
            quizQuestions.push({
              question: `🔗 Emparejamiento: ${block.data.instructions}`,
              options: block.data.pairs?.map((p) => `${p.left} → ${p.right}`) || ['Parejas conectadas'],
              correctIndex: 0,
              explanation: 'Parejas conceptuales vinculadas correctamente.',
            });
          } else if (block.type === 'text_narrative') {
            quizQuestions.push({
              question: `📖 ${block.title}: ${block.data.content}`,
              options: ['¡Entendido! Continuar', 'Escuchar con Voz Neural LatAm'],
              correctIndex: 0,
              explanation: block.data.content,
            });
          } else if (block.type === 'reward_chest') {
            quizQuestions.push({
              question: `🎁 ${block.title} (+${block.data.xpAmount} XP, +${block.data.coinsAmount} Monedas)`,
              options: ['¡Reclamar Recompensa! 🏆', 'Continuar la Misión'],
              correctIndex: 0,
              explanation: `Has obtenido ${block.data.xpAmount} XP para tu avatar.`,
            });
          } else if (block.type === 'boss_enemy') {
            quizQuestions.push({
              question: `⚔️ Desafío contra ${block.data.bossName}: ¡Responde para realizar un golpe crítico!`,
              options: ['¡Atacar con Sabiduría Curricular!', 'Defensa Estratégica', 'Usar Potenciador', 'Consulta de Equipo'],
              correctIndex: 0,
              explanation: `¡Golpe crítico acertado a ${block.data.bossName}!`,
            });
          } else {
            quizQuestions.push({
              question: `✨ ${block.title}`,
              options: ['Completar Bloque Interactivo', 'Explorar'],
              correctIndex: 0,
              explanation: 'Módulo interactivo completado satisfactoriamente.',
            });
          }
        });

        return {
          title: state.metadata.title,
          description: state.metadata.description,
          task_type: state.metadata.taskType || 'activity_flow',
          blocks: state.blocks,
          connections: state.connections,
          startNodeId: state.startNodeId,
          metadata: state.metadata,
          questions: quizQuestions.length > 0 ? quizQuestions : [
            {
              question: '¿Listo para comenzar?',
              options: ['Sí, empezar', 'Ver instrucciones'],
              correctIndex: 0,
            }
          ],
        };
      },

      resetWorkspace: () => {
        set({
          metadata: MEXICAN_INDEPENDENCE_METADATA,
          blocks: MEXICAN_INDEPENDENCE_BLOCKS,
          connections: MEXICAN_INDEPENDENCE_CONNECTIONS,
          startNodeId: MEXICAN_INDEPENDENCE_BLOCKS[0].id,
          selectedBlockId: MEXICAN_INDEPENDENCE_BLOCKS[0].id,
          history: [MEXICAN_INDEPENDENCE_BLOCKS],
          historyIndex: 0,
          isExtendedMenuOpen: false,
          isPreviewModalOpen: false,
          isNodeConfigDrawerOpen: false,
          zoomLevel: 1.0,
        });
      },
    }),
    {
      name: 'iskool_activity_builder_state',
      version: 3,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState || version < 3) {
          // Migrar al flujo evolucionado sin colisiones y con personajes diversificados
          return {
            metadata: MEXICAN_INDEPENDENCE_METADATA,
            blocks: MEXICAN_INDEPENDENCE_BLOCKS,
            connections: MEXICAN_INDEPENDENCE_CONNECTIONS,
            startNodeId: MEXICAN_INDEPENDENCE_BLOCKS[0].id,
            selectedBlockId: MEXICAN_INDEPENDENCE_BLOCKS[0].id,
          };
        }
        return persistedState;
      },
      partialize: (state) => ({
        metadata: state.metadata,
        blocks: state.blocks,
        connections: state.connections,
        startNodeId: state.startNodeId,
      }),
    }
  )
);
