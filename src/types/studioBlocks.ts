import { StudioActivityJSON } from '@/types';

/**
 * Tipos de bloques didácticos soportados en el Taller de Creación
 */
export type StudioBlockType = 
  // Herramientas Principales (Barra Lateral Izquierda - Acceso Rápido)
  | 'text_narrative'       // Instrucción / Fragmento narrativo / Lore
  | 'quiz_question'        // Pregunta de opción múltiple interactiva
  | 'timed_reading_block'  // Lectura cronometrada & comprensión lectora (PPM)
  | 'reward_chest'         // Recompensas: XP, Monedas de oro, Gemas, Insignias
  | 'boss_enemy'           // Encuentro de combate contra Boss / Enemigo Pixi

  // Herramientas de Lógica Matemática & Pensamiento Computacional
  | 'logic_challenge_interactive' // Reto interactivo de lógica, estados y condiciones
  | 'boolean_circuit_builder'     // Simulador de compuertas lógicas (AND, OR, NOT, XOR)
  | 'graph_network_path'          // Recorrido de grafos, rutas de Euler, flujos y BFS
  | 'turing_step_simulator'       // Autómatas finitos y cinta de máquina de Turing
  | 'constraint_scheduler'        // Satisfacción de restricciones (CSP), colas FIFO y balanceo

  // Herramientas Extendidas LMS (Menú [+])
  | 'youtube_video'        // Video educativo incrustado con marcas de tiempo
  | 'external_embed'       // Simuladores interactivos (PhET, GeoGebra, Desmos)
  | 'drag_drop_match'      // Emparejamiento interactivo (Concepto <-> Definición)
  | 'ordering_sequence'    // Ordenar secuencia cronológica o algoritmo
  | 'fill_in_blanks'       // Completar espacios en blanco / Texto mutilado
  | 'open_poll_wordcloud'  // Pregunta abierta con evaluación formativa de IA
  | 'secret_code_puzzle'   // Acertijo de escape room / Código secreto
  | 'minigame_action'      // Minijuego Arcade (Ruleta, Memorama, Ahorcado)
  | 'logic_branch'         // Ramificación condicional según desempeño
  | 'checkpoint_gate'      // Punto de control y autoevaluación / Rúbrica
  | 'badge_certificate'    // Certificado y diploma digital de maestría
  | 'audio_sfx';           // Efectos de sonido o ambientación musical

/**
 * Posición 2D del nodo en el tablero de flujos interactivo
 */
export interface FlowNodePosition {
  x: number;
  y: number;
}

/**
 * Conexión direccional (flecha) entre dos nodos
 */
export interface FlowConnection {
  id: string;
  sourceNodeId: string;
  targetNodeId: string;
  label?: string; // Para bifurcaciones: 'success' | 'failure' | 'next'
}

/**
 * Interfaz base para cualquier bloque didáctico del espacio de trabajo
 */
export interface BaseStudioBlock {
  id: string;
  type: StudioBlockType;
  title: string;
  isCollapsed?: boolean;
  badgeLabel?: string;
  connectionTargetId?: string | null;
  position?: FlowNodePosition;
  isStartNode?: boolean;
}

/**
 * 1. Bloque de Texto / Narrativa
 */
export interface TextNarrativeBlock extends BaseStudioBlock {
  type: 'text_narrative';
  data: {
    content: string;
    style: 'narrative_lore' | 'instruction' | 'dialogue';
    speakerName?: string;
    speakerAvatar?: string;
  };
}

/**
 * 2. Bloque de Pregunta de Opción Múltiple
 */
export interface QuizQuestionBlock extends BaseStudioBlock {
  type: 'quiz_question';
  data: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
    imageUrl?: string;
    timeLimitSeconds: number;
  };
}

/**
 * 3. Bloque de Recompensa
 */
export interface RewardChestBlock extends BaseStudioBlock {
  type: 'reward_chest';
  data: {
    xpAmount: number;
    coinsAmount: number;
    badgeUnlockId?: string;
    badgeName?: string;
    badgeIcon?: string;
    chestRarity: 'common' | 'rare' | 'epic' | 'legendary';
  };
}

/**
 * 4. Bloque de Boss / Enemigo de Combate
 */
export interface BossEnemyBlock extends BaseStudioBlock {
  type: 'boss_enemy';
  data: {
    bossName: string;
    spriteKey: 'blood_dragon' | 'shadow_golem' | 'cyber_brux';
    maxHp: number;
    attackPower: number;
    victoryCondition: 'defeat_boss' | 'survive_turns';
    backgroundScene: 'volcano' | 'dungeon' | 'forest' | 'temple';
  };
}

/**
 * 5. Bloque de Video de YouTube
 */
export interface YouTubeVideoBlock extends BaseStudioBlock {
  type: 'youtube_video';
  data: {
    videoUrl: string;
    videoTitle?: string;
    startAtSeconds?: number;
    endAtSeconds?: number;
    mustWatchEntirely: boolean;
  };
}

/**
 * 6. Bloque de Recurso Externo / Iframe Seguro
 */
export interface ExternalEmbedBlock extends BaseStudioBlock {
  type: 'external_embed';
  data: {
    embedUrl: string;
    resourceTitle: string;
    instructions: string;
  };
}

/**
 * 7. Bloque de Emparejamiento (Drag & Drop Match)
 */
export interface DragDropMatchBlock extends BaseStudioBlock {
  type: 'drag_drop_match';
  data: {
    instructions: string;
    pairs: { left: string; right: string }[];
    timeLimitSeconds: number;
  };
}

/**
 * 8. Bloque de Ordenar Secuencia / Cronología
 */
export interface OrderingSequenceBlock extends BaseStudioBlock {
  type: 'ordering_sequence';
  data: {
    instructions: string;
    stepsInCorrectOrder: string[];
    randomizeStart: boolean;
  };
}

/**
 * 9. Bloque de Rellenar Espacios (Fill in Blanks)
 */
export interface FillInBlanksBlock extends BaseStudioBlock {
  type: 'fill_in_blanks';
  data: {
    instructions: string;
    textWithBlanks: string; // ej. "El cura [Miguel Hidalgo] dio el grito en [1810]."
    wordBank: string[];
  };
}

/**
 * 10. Bloque de Pregunta Abierta y Reflexión
 */
export interface OpenPollWordcloudBlock extends BaseStudioBlock {
  type: 'open_poll_wordcloud';
  data: {
    prompt: string;
    minWords: number;
    aiFeedbackRubric?: string;
  };
}

/**
 * 11. Bloque de Código Secreto / Acertijo de Escape Room
 */
export interface SecretCodePuzzleBlock extends BaseStudioBlock {
  type: 'secret_code_puzzle';
  data: {
    clueText: string;
    secretAnswer: string;
    hintText?: string;
  };
}

/**
 * 12. Bloque de Minijuego Arcade
 */
export interface MinigameActionBlock extends BaseStudioBlock {
  type: 'minigame_action';
  data: {
    minigameType: 'ruleta' | 'memorama' | 'ahorcado' | 'escape_room';
    difficulty: 'easy' | 'medium' | 'hard';
    items: string[];
  };
}

/**
 * 13. Bloque de Ramificación Lógica Adaptativa
 */
export interface LogicBranchBlock extends BaseStudioBlock {
  type: 'logic_branch';
  data: {
    condition: 'score_above_percentage' | 'has_lives_left' | 'item_collected';
    thresholdValue: number;
    ifTrueNextBlockId: string | null;
    ifFalseNextBlockId: string | null;
  };
}

/**
 * 14. Bloque de Punto de Control / Checkpoint
 */
export interface CheckpointGateBlock extends BaseStudioBlock {
  type: 'checkpoint_gate';
  data: {
    checkpointTitle: string;
    reflectionPrompt: string;
    requiredScorePercent: number;
  };
}

/**
 * 15. Bloque de Certificado / Diploma Digital
 */
export interface BadgeCertificateBlock extends BaseStudioBlock {
  type: 'badge_certificate';
  data: {
    certificateTitle: string;
    recipientHonor: string;
    teacherSignatureName: string;
  };
}

/**
 * 16. Bloque de Audio / Efecto Sonoro
 */
export interface AudioSfxBlock extends BaseStudioBlock {
  type: 'audio_sfx';
  data: {
    soundType: 'victory_fanfare' | 'battle_drums' | 'mystery_ambient' | 'level_up';
    volume: number;
    autoPlay: boolean;
  };
}

/**
 * Pregunta de opción múltiple para evaluación de comprensión lectora
 */
export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/**
 * 17. Bloque de Lectura Cronometrada y Comprensión Lectora (PPM)
 */
export interface TimedReadingBlock extends BaseStudioBlock {
  type: 'timed_reading_block';
  data: {
    readingText: string;
    timeLimitSeconds: number;
    wordCount: number;
    targetWpm?: number;
    comprehensionQuestions: ComprehensionQuestion[];
  };
}

/**
 * 18. Bloque de Reto Interactivo de Lógica y Algoritmia
 */
export interface LogicChallengeInteractiveBlock extends BaseStudioBlock {
  type: 'logic_challenge_interactive';
  data: {
    storyText: string;
    problemQuestion: string;
    logicCategory: 'conditions' | 'patterns' | 'binary' | 'sorting' | 'state_machine' | 'optimization';
    educationalLevel: 'fase_3' | 'fase_4' | 'fase_5' | 'fase_6'; // Primaria Baja a Secundaria
    interactiveEngine: 'switch_rules' | 'image_pattern' | 'queue_fifo' | 'binary_counter' | 'grid_selector' | 'greedy_match';
    options?: { id: string; label: string; isCorrect: boolean; icon?: string; detail?: string }[];
    interactiveConfig?: Record<string, any>;
    pedagogicalExplanation: string; // ¿Cómo es informática / pensamiento computacional?
    classroomActivity: string;       // Continúa aprendiendo (actividad física en aula)
    hints: string[];
    timeLimitSeconds?: number;
  };
}

/**
 * 19. Bloque de Simulador de Compuertas Lógicas y Circuitos Booleanos
 */
export interface BooleanCircuitBuilderBlock extends BaseStudioBlock {
  type: 'boolean_circuit_builder';
  data: {
    circuitTitle: string;
    instructions: string;
    switchesCount: number; // e.g., 4 or 8 switches
    gates: { id: string; type: 'AND' | 'OR' | 'NOT' | 'XOR'; inputs: number[]; outputTarget: string }[];
    targetLightState: boolean;
    validCombinationsCount: number;
    solutionKey: string;
    pedagogicalExplanation: string;
    classroomActivity: string;
  };
}

/**
 * 20. Bloque de Recorrido de Grafos y Redes
 */
export interface GraphNetworkPathBlock extends BaseStudioBlock {
  type: 'graph_network_path';
  data: {
    graphType: 'bfs_propagation' | 'euler_trail' | 'shortest_path' | 'max_flow';
    storyPrompt: string;
    nodes: { id: string; label: string; x: number; y: number; isStart?: boolean; isTarget?: boolean }[];
    edges: { from: string; to: string; weight?: number; directed?: boolean }[];
    correctPath: string[];
    correctAnswer: string | number;
    pedagogicalExplanation: string;
    classroomActivity: string;
  };
}

/**
 * 21. Bloque de Autómata y Máquina de Turing en Cinta
 */
export interface TuringStepSimulatorBlock extends BaseStudioBlock {
  type: 'turing_step_simulator';
  data: {
    simulatorType: 'turing_tape' | 'grid_bot' | 'state_automaton';
    initialTape: string[];
    rules: { state: string; readSymbol: string; writeSymbol: string; move: 'L' | 'R' | 'STAY'; nextState: string }[];
    targetGoalDescription: string;
    maxSteps: number;
    options?: { id: string; label: string; isCorrect: boolean }[];
    pedagogicalExplanation: string;
    classroomActivity: string;
  };
}

/**
 * 22. Bloque de Satisfacción de Restricciones y Planificación (CSP)
 */
export interface ConstraintSchedulerBlock extends BaseStudioBlock {
  type: 'constraint_scheduler';
  data: {
    schedulerType: 'timetable_grid' | 'sjf_priority' | 'memory_shift' | 'load_balance';
    scenarioDescription: string;
    entities: { id: string; name: string; requirements: string[]; duration?: number; weight?: number }[];
    slotsOrDays: string[];
    rules: string[];
    correctAssignment: Record<string, string | string[]>;
    pedagogicalExplanation: string;
    classroomActivity: string;
  };
}

/**
 * Unión discriminada de todos los bloques didácticos (Lienzo Digital)
 */
export type StudioBlock =
  | TextNarrativeBlock
  | QuizQuestionBlock
  | TimedReadingBlock
  | RewardChestBlock
  | BossEnemyBlock
  | LogicChallengeInteractiveBlock
  | BooleanCircuitBuilderBlock
  | GraphNetworkPathBlock
  | TuringStepSimulatorBlock
  | ConstraintSchedulerBlock
  | YouTubeVideoBlock
  | ExternalEmbedBlock
  | DragDropMatchBlock
  | OrderingSequenceBlock
  | FillInBlanksBlock
  | OpenPollWordcloudBlock
  | SecretCodePuzzleBlock
  | MinigameActionBlock
  | LogicBranchBlock
  | CheckpointGateBlock
  | BadgeCertificateBlock
  | AudioSfxBlock;

/**
 * Aliases para la arquitectura Canvas / Lienzo Digital
 */
export type CanvasBlockType = StudioBlockType;
export type CanvasBlock = StudioBlock;


/**
 * Metadatos generales y pedagógicos de la actividad creada (Alineados a la NEM 2024)
 */
export interface ActivityBuilderMetadata {
  title: string;
  description: string;
  subject: string;
  subjectId?: string;
  targetAge: string;
  campoFormativo: string;
  camposFormativos?: string[];
  ejesArticuladores?: string[];
  faseNem?: 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4' | 'Fase 5' | 'Fase 6';
  pdaNem: string;
  pdas?: string[];
  taskType?: 'activity_flow' | 'portfolio_evidence' | 'boss_exam';
  xpReward?: number;
  coinsReward?: number;
  totalTimeLimit: number;
  livesCount: number;
  streakMultiplier: boolean;
}
