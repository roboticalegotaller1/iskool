import { CanvasActivityJSON, CommunityActivity } from '@/types';
import { 
  MEXICAN_INDEPENDENCE_BLOCKS, 
  MEXICAN_INDEPENDENCE_METADATA, 
  MEXICAN_INDEPENDENCE_CONNECTIONS 
} from '@/data/mexicanIndependenceStudioFlow';
import { 
  HEROES_COGNITIVE_BLOCKS, 
  HEROES_COGNITIVE_METADATA, 
  HEROES_COGNITIVE_CONNECTIONS 
} from '@/data/heroesIndependenceCognitiveFlow';

export interface IndependenceGamePreset {
  id: string;
  templateType: string;
  title: string;
  level: 'primaria_baja' | 'primaria_alta' | 'secundaria' | 'preparatoria';
  levelLabel: string;
  targetAge: string;
  description: string;
  pdaNem: string;
  campoFormativo: string;
  badgeReward: {
    name: string;
    icon: string;
    description: string;
  };
  gamificationSettings: {
    timePerQuestion: number;
    lives: number;
    streakMultiplier: boolean;
    passScorePercentage: number;
    xpBaseReward: number;
    coinsReward: number;
  };
  content: CanvasActivityJSON;
}

/**
 * Catálogo Curado y Auditado de 40 Actividades Didácticas de "Independencia de México"
 * 2 Actividades por cada una de las 20 Plantillas Interactivas de ISkool.
 */
export const MEXICAN_INDEPENDENCE_GAMES: IndependenceGamePreset[] = [
  // ==========================================
  // 1. TRIVIA DE PREGUNTAS (QUIZ)
  // ==========================================
  {
    id: 'indep-trivia-1',
    templateType: 'trivia',
    title: 'El Grito de Dolores y los Primeros Insurgentes',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Aprende sobre la noche mágica del 15 y 16 de septiembre de 1810, el cura Miguel Hidalgo y la campana de Dolores.',
    pdaNem: 'Fase 3 - Ética, Naturaleza y Sociedades: Identifica símbolos y acontecimientos que dan sentido de pertenencia a su comunidad y país.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Campanero de Dolores', icon: '🔔', description: '¡Hiciste sonar la campana de la libertad!' },
    gamificationSettings: { timePerQuestion: 25, lives: 3, streakMultiplier: true, passScorePercentage: 70, xpBaseReward: 120, coinsReward: 25 },
    content: {
      title: 'El Grito de Dolores y los Primeros Insurgentes',
      description: 'Cuestionario interactivo sobre el inicio de la lucha por la Independencia de México.',
      questions: [
        {
          question: '¿Quién tocó la campana de la iglesia de Dolores para llamar al pueblo a levantarse en armas?',
          options: ['Don Miguel Hidalgo y Costilla', 'Benito Juárez', 'Emiliano Zapata', 'Porfirio Díaz'],
          correctIndex: 0,
          explanation: 'El cura Don Miguel Hidalgo y Costilla convocó a la población la madrugada del 16 de septiembre de 1810 en Dolores, Guanajuato.'
        },
        {
          question: '¿Qué símbolo u objeto tomó Miguel Hidalgo en Atotonilco como el primer estandarte insurgente?',
          options: ['El Estandarte de la Virgen de Guadalupe', 'La bandera tricolor actual', 'Un escudo de oro', 'Una campana dorada'],
          correctIndex: 0,
          explanation: 'En el santuario de Atotonilco, Hidalgo tomó una imagen de la Virgen de Guadalupe como símbolo de unión popular.'
        },
        {
          question: '¿En qué fecha celebramos en México el inicio de la lucha de Independencia?',
          options: ['16 de septiembre', '20 de noviembre', '5 de mayo', '25 de diciembre'],
          correctIndex: 0,
          explanation: 'Cada 16 de septiembre conmemoramos el aniversario del Grito de Dolores.'
        },
        {
          question: '¿Quién fue la valiente mujer que dio aviso secreto a los insurgentes de que la conspiración había sido descubierta?',
          options: ['Josefa Ortiz de Domínguez', 'Sor Juana Inés de la Cruz', 'Frida Kahlo', 'Adelita'],
          correctIndex: 0,
          explanation: 'Doña Josefa Ortiz de Domínguez envió un mensaje urgente a Ignacio Allende y Miguel Hidalgo informando que fueron delatados.'
        }
      ]
    }
  },
  {
    id: 'indep-trivia-2',
    templateType: 'trivia',
    title: 'Estrategia Militar y Etapas de la Independencia',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Analiza las cuatro etapas de la guerra: Iniciación, Organización, Resistencia y Consumación.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Analiza las causas y etapas del movimiento de Independencia de la Nueva España y su impacto continental.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Estratega Insurgente', icon: '⚔️', description: 'Dominio de las 4 etapas bélicas y políticas de 1810 a 1821.' },
    gamificationSettings: { timePerQuestion: 20, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 200, coinsReward: 40 },
    content: {
      title: 'Estrategia Militar y Etapas de la Independencia',
      description: 'Evaluación formativa de las etapas y tácticas de guerra de 1810 a 1821.',
      questions: [
        {
          question: '¿Quién lideró la etapa de Organización (1811-1815) y redactó los "Sentimientos de la Nación"?',
          options: ['José María Morelos y Pavón', 'Agustín de Iturbide', 'Félix María Calleja', 'Francisco Javier Mina'],
          correctIndex: 0,
          explanation: 'José María Morelos estructuró el movimiento con disciplina militar y visión legislativa republicana.'
        },
        {
          question: '¿Qué líder insurgente mantuvo la guerra de guerrillas durante la etapa de Resistencia en el sur del país?',
          options: ['Vicente Guerrero', 'Ignacio López Rayón', 'Mariano Matamoros', 'Hermenegildo Galeana'],
          correctIndex: 0,
          explanation: 'Vicente Guerrero sostuvo la resistencia en las montañas del sur bajo el lema "La patria es primero".'
        },
        {
          question: '¿Qué acontecimiento simbólico selló la alianza entre Vicente Guerrero y Agustín de Iturbide en 1821?',
          options: ['El Abrazo de Acatempan', 'La Batalla del Monte de las Cruces', 'El Sitio de Cuautla', 'La Toma de la Alhóndiga'],
          correctIndex: 0,
          explanation: 'El Abrazo de Acatempan consolidó la unión insurgente y realista para formar el Ejército Trigarante.'
        },
        {
          question: '¿Cuáles fueron las "Tres Garantías" defendidas por el Ejército Trigarante en el Plan de Iguala?',
          options: ['Religión Católica, Independencia y Unión', 'Libertad, Igualdad y Fraternidad', 'Tierra, Libertad y Justicia', 'Monarquía, Fe y Comercio'],
          correctIndex: 0,
          explanation: 'El Plan de Iguala garantizó la Religión, la Independencia de la corona española y la Unión de todos los habitantes.'
        }
      ]
    }
  },

  // ==========================================
  // 2. MEMORAMA VISUAL (GRID DE PAREJAS)
  // ==========================================
  {
    id: 'indep-memorama-1',
    templateType: 'memorama',
    title: 'Parejas de Héroes y Símbolos de la Independencia',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Encuentra las parejas que unen a cada héroe patrio con su símbolo o acción más representativa.',
    pdaNem: 'Fase 3 - Lenguajes / Ética: Relaciona personajes representativos de la historia con sus acciones y valores patrios.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Guardián de la Memoria', icon: '🧠', description: '¡Memoria fotográfica de los héroes insurgentes!' },
    gamificationSettings: { timePerQuestion: 45, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 140, coinsReward: 30 },
    content: {
      title: 'Parejas de Héroes y Símbolos de la Independencia',
      description: 'Memorama visual de personajes y símbolos patrios.',
      questions: [
        { question: 'Miguel Hidalgo', options: ['Campana de Dolores y Padre de la Patria', 'Pípila y piedra', 'Estandarte y campana', 'Lanza insurgente'], correctIndex: 0 },
        { question: 'Josefa Ortiz de Domínguez', options: ['La Corregidora que dio el aviso secreto', 'La Adelita norteña', 'La médica insurgente', 'La capitana de barco'], correctIndex: 0 },
        { question: 'El Pípila (Juan José de los Reyes)', options: ['Losa de piedra en la espalda y antorcha en la Alhóndiga', 'Campana de iglesia', 'Pluma y papel', 'Corona de oro'], correctIndex: 0 },
        { question: 'José María Morelos', options: ['El Siervo de la Nación y su paliacate', 'Espada del virrey', 'Libro de cuentos', 'Bandera pirata'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-memorama-2',
    templateType: 'memorama',
    title: 'Tratados, Batallas y Personajes Clave',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Relaciona documentos fundacionales, batallas históricas y personajes protagonistas de 1810 a 1821.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Identifica las implicaciones de los tratados y planes políticos de la Independencia.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Archivista Histórico', icon: '📜', description: 'Emparejamiento perfecto de tratados y pactos de la Independencia.' },
    gamificationSettings: { timePerQuestion: 40, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 190, coinsReward: 35 },
    content: {
      title: 'Tratados, Batallas y Personajes Clave',
      description: 'Conecta cada concepto histórico con su definición o autor correspondiente.',
      questions: [
        { question: 'Sentimientos de la Nación (1813)', options: ['Documento de Morelos que declara la abolición de la esclavitud y soberanía popular', 'Tratado de paz con España', 'Plan militar de Iturbide', 'Carta de rendición'], correctIndex: 0 },
        { question: 'Tratados de Córdoba (1821)', options: ['Firma entre Agustín de Iturbide y Juan O\'Donojú reconociendo la Independencia', 'Tratado con Estados Unidos', 'Alianza con Francia', 'Pacto secreto de Querétaro'], correctIndex: 0 },
        { question: 'Sitio de Cuautla (1812)', options: ['Resistencia militar heroica de 72 días liderada por José María Morelos', 'Batalla final de la guerra', 'Grito de Dolores', 'Toma de la capital'], correctIndex: 0 },
        { question: 'Plan de Iguala (1821)', options: ['Proclamación de las Tres Garantías y nacimiento del Ejército Trigarante', 'Decreto de expulsión', 'Manifiesto anarquista', 'Constitución de Cádiz'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 3. AHORCADO EDUCATIVO (PUZZLE)
  // ==========================================
  {
    id: 'indep-ahorcado-1',
    templateType: 'ahorcado',
    title: 'Palabras Ocultas de la Conspiración Insurgente',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Descubre las palabras y conceptos secretos antes de que se agoten tus intentos.',
    pdaNem: 'Fase 5 - Lenguajes / Ética: Reconoce palabras clave de la historia nacional deduciendo letras y significados.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Criptógrafo de Querétaro', icon: '🔤', description: 'Descubriste todas las palabras secretas de la conspiración.' },
    gamificationSettings: { timePerQuestion: 60, lives: 6, streakMultiplier: false, passScorePercentage: 70, xpBaseReward: 150, coinsReward: 30 },
    content: {
      title: 'Palabras Ocultas de la Conspiración Insurgente',
      description: 'Adivina la palabra secreta con pistas temáticas de la Independencia.',
      questions: [
        { question: 'Lugar histórico donde se organizaban las tertulias secretas disfrazadas de reuniones literarias.', options: ['QUERETARO', 'GUADALAJARA', 'MONTERREY', 'VERACRUZ'], correctIndex: 0 },
        { question: 'Pueblo de Guanajuato donde la madrugada del 16 de septiembre de 1810 se inició el movimiento insurgente.', options: ['DOLORES', 'PUEBLA', 'MORELIA', 'SALTILLO'], correctIndex: 0 },
        { question: 'Edificio de Guanajuato usado como almacén de granos y refugio de las autoridades virreinales.', options: ['ALHONDIGA', 'CATEDRAL', 'PALACIO', 'CONVENTO'], correctIndex: 0 },
        { question: 'Título de respeto con el que José María Morelos prefirió ser llamado en lugar de Generalísimo.', options: ['SIERVO', 'REY', 'EMPERADOR', 'VIRREY'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-ahorcado-2',
    templateType: 'ahorcado',
    title: 'Vocabulario Político e Ilustrado de la Emancipación',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Descifra términos ideológicos, doctrinas y principios constitucionales de la Nueva España.',
    pdaNem: 'Nivel Medio Superior - Historia de México: Analiza el pensamiento ilustrado, liberal y la soberanía popular en la emancipación novohispana.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Filósofo Constitucional', icon: '⚖️', description: 'Dominio del léxico ideológico y jurídico de 1810 a 1824.' },
    gamificationSettings: { timePerQuestion: 50, lives: 5, streakMultiplier: false, passScorePercentage: 80, xpBaseReward: 220, coinsReward: 45 },
    content: {
      title: 'Vocabulario Político e Ilustrado de la Emancipación',
      description: 'Descifra los conceptos fundamentales del pensamiento independentista.',
      questions: [
        { question: 'Principio político donde el poder dimana originariamente del pueblo.', options: ['SOBERANIA', 'MONARQUIA', 'FEUDALISMO', 'OLIGARQUIA'], correctIndex: 0 },
        { question: 'Decreto proclamado por Miguel Hidalgo en Guadalajara en diciembre de 1810.', options: ['ABOLICION', 'CONQUISTA', 'TRIBUTO', 'ENCOMIENDA'], correctIndex: 0 },
        { question: 'Movimiento intelectual europeo del siglo XVIII que fundamentó la igualdad ante la ley y la división de poderes.', options: ['ILUSTRACION', 'RENACIMIENTO', 'BARROCO', 'POSITIVISMO'], correctIndex: 0 },
        { question: 'Ciudad donde se promulgó el Decreto Constitucional para la Libertad de la América Mexicana en 1814.', options: ['APATZINGAN', 'VALLADOLID', 'CHILPANCINGO', 'ACAPULCO'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 4. FLASHCARDS ANIMADAS (ESTUDIO 3D)
  // ==========================================
  {
    id: 'indep-flashcards-1',
    templateType: 'flashcards',
    title: 'Biografías Clave de los Héroes de la Patria',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Gira las tarjetas 3D y descubre los datos fascinantes de los líderes insurgentes.',
    pdaNem: 'Fase 5 - Lenguajes / Ética: Sintetiza información biográfica relevante de personajes históricos.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Historiador en Acción', icon: '📇', description: '¡Completaste el mazo de biografías insurgentes!' },
    gamificationSettings: { timePerQuestion: 0, lives: 0, streakMultiplier: false, passScorePercentage: 80, xpBaseReward: 150, coinsReward: 30 },
    content: {
      title: 'Biografías Clave de los Héroes de la Patria',
      description: 'Tarjetas interactivas con datos biográficos y logros destacados.',
      questions: [
        { question: 'Miguel Hidalgo y Costilla (1753-1811)', options: ['Sacerdote ilustrado apodado "El Zorro", rector del Colegio de San Nicolás y primer líder de la lucha por la Independencia.', 'Militar realista', 'Virrey de la Nueva España', 'Presidente de la República'], correctIndex: 0 },
        { question: 'Ignacio Allende (1769-1811)', options: ['Capitán del regimiento de Dragones de la Reina y principal estratega militar en la primera fase insurgente.', 'Obispo de Michoacán', 'Alcalde de Guanajuato', 'Poeta novohispano'], correctIndex: 0 },
        { question: 'Leona Vicario (1789-1842)', options: ['Heroína y periodista insurgente conocida como la "Madre de la Patria", financió y comunicó al ejército libertador.', 'Esposa del virrey', 'Soldadera del siglo XX', 'Gobernadora de Puebla'], correctIndex: 0 },
        { question: 'Vicente Guerrero (1782-1831)', options: ['Líder afrodescendiente del sur que mantuvo la resistencia viva y pactó la consumación en 1821.', 'Emperador de México', 'Comandante realista', 'Diplomático español'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-flashcards-2',
    templateType: 'flashcards',
    title: 'Documentos Fundacionales de México Independiente',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Tarjetas de análisis conceptual de los documentos normativos de 1810 a 1824.',
    pdaNem: 'Nivel Medio Superior - Estructura Socioeconómica y Política: Compara los proyectos de nación reflejados en los documentos fundacionales.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Jurista de la Nación', icon: '🏛️', description: 'Maestría en documentos constitucionales de la Independencia.' },
    gamificationSettings: { timePerQuestion: 0, lives: 0, streakMultiplier: false, passScorePercentage: 80, xpBaseReward: 210, coinsReward: 40 },
    content: {
      title: 'Documentos Fundacionales de México Independiente',
      description: 'Estudio de textos constitucionales y tratados de la emancipación.',
      questions: [
        { question: 'Bando de Guadalajara (Diciembre 1810)', options: ['Decreto emitido por Hidalgo que ordenó abolir la esclavitud y el pago de tributos de castas en América.', 'Pacto con la corona', 'Reglamento militar', 'Tratado de libre comercio'], correctIndex: 0 },
        { question: 'Sentimientos de la Nación (Septiembre 1813)', options: ['23 puntos expuestos por Morelos en Chilpancingo que sientan las bases de una república libre, soberana y sin privilegios.', 'Plan monárquico', 'Bando de guerra', 'Carta diplomática a España'], correctIndex: 0 },
        { question: 'Plan de Iguala (Febrero 1821)', options: ['Proclamación política de Agustín de Iturbide que fundamentó la independencia bajo una monarquía moderada constitucional.', 'Acta de federación', 'Constitución de Apatzingán', 'Tratado de Guadalupe'], correctIndex: 0 },
        { question: 'Tratados de Córdoba (Agosto 1821)', options: ['Acuerdo suscrito en Veracruz entre Iturbide y O\'Donojú que ratifica la soberanía del Imperio Mexicano.', 'Tratado de Versalles', 'Pacto de Zanjón', 'Convenio de San Nicolás'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 5. EMPAREJAMIENTO (MATCH)
  // ==========================================
  {
    id: 'indep-match-1',
    templateType: 'match',
    title: 'Héroes Insurgentes y sus Aportaciones Históricas',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Conecta a cada personaje histórico con su aportación emblemática a la Independencia.',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Reconoce la participación de diversos sectores sociales en la lucha libertaria.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Conector Histórico', icon: '🔗', description: '¡Emparejaste a todos los héroes con sus grandes aportaciones!' },
    gamificationSettings: { timePerQuestion: 35, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 30 },
    content: {
      title: 'Héroes Insurgentes y sus Aportaciones Históricas',
      description: 'Arrastra y empareja el héroe con su hecho histórico correspondiente.',
      questions: [
        { question: 'Hermenegildo Galeana', options: ['Brazo derecho militar de Morelos en la Costa Grande de Guerrero', 'Impresor del Despertador Americano', 'Alcalde de Querétaro', 'Virrey novohispano'], correctIndex: 0 },
        { question: 'Francisco Javier Mina', options: ['Militar español de ideas liberales que vino a luchar por la independencia de México en 1817', 'Comandante de la Alhóndiga', 'Obispo de Michoacán', 'Gobernador de Cuba'], correctIndex: 0 },
        { question: 'Mariano Matamoros', options: ['Sacerdote que se convirtió en mariscal y lugarteniente de José María Morelos', 'Constructor de cañones', 'Médico militar', 'Músico insurgente'], correctIndex: 0 },
        { question: 'Andrés Quintana Roo', options: ['Abogado y periodista que presidió la Asamblea Constituyente de Apatzingán', 'Coronel de caballería', 'Virrey de la Nueva España', 'Capitán de barco'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-match-2',
    templateType: 'match',
    title: 'Tratados y Planes Políticos con sus Consecuencias',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Vincula cada plan o tratado político con su impacto en la consolidación del Estado Mexicano.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Analiza la trascendencia de los acuerdos políticos en la transición de virreinato a nación independiente.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Diplomático de la Emancipación', icon: '📜', description: 'Precisión impecable al vincular tratados y efectos jurídicos.' },
    gamificationSettings: { timePerQuestion: 30, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 200, coinsReward: 40 },
    content: {
      title: 'Tratados y Planes Políticos con sus Consecuencias',
      description: 'Conecta cada documento político con su consecuencia histórica directa.',
      questions: [
        { question: 'Constitución de Cádiz (1812)', options: ['Obligó a la monarquía española a limitar el absolutismo, motivando a criollos novohispanos a independizarse.', 'Disolvió el ejército realista', 'Proclamó a Hidalgo presidente', 'Eliminó las aduanas'], correctIndex: 0 },
        { question: 'Congreso de Anáhuac (1813)', options: ['Emitió el Acta Solemne de la Declaración de Independencia de la América Septentrional.', 'Firmó la rendición ante Calleja', 'Pactó alianza con Inglaterra', 'Aprobó el libre comercio'], correctIndex: 0 },
        { question: 'Abrazo de Acatempan (Febrero 1821)', options: ['Superó la desconfianza armada unificando tropas insurgentes y realistas.', 'Inició la invasión francesa', 'Terminó con el fusilamiento de Iturbide', 'Creó la Real Audiencia'], correctIndex: 0 },
        { question: 'Entrada del Ejército Trigarante (27 Septiembre 1821)', options: ['Consumación formal de la Independencia de México con la entrada a la Ciudad de México.', 'Inicio de la guerra con EE.UU.', 'Fundación de la UNAM', 'Llegada de Maximiliano'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 6. RULETA DE CONCEPTOS (QUIZ)
  // ==========================================
  {
    id: 'indep-ruleta-1',
    templateType: 'ruleta',
    title: 'Ruleta Mágica de la Noche del 15 de Septiembre',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Gira la ruleta y responde las preguntas de los colores patrios.',
    pdaNem: 'Fase 3 - Ética, Naturaleza y Sociedades: Conoce las fiestas cívicas tradicionales y su sentido comunitario.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Afortunado de la Patria', icon: '🎡', description: '¡Giraste la ruleta y respondiste todas las preguntas de la noche patria!' },
    gamificationSettings: { timePerQuestion: 30, lives: 3, streakMultiplier: true, passScorePercentage: 70, xpBaseReward: 130, coinsReward: 25 },
    content: {
      title: 'Ruleta Mágica de la Noche del 15 de Septiembre',
      description: 'Gira la ruleta y pon a prueba tus conocimientos patrios.',
      questions: [
        { question: 'Sector Verde: ¿Qué color de la bandera del Ejército Trigarante representaba la Independencia?', options: ['Verde', 'Blanco', 'Rojo', 'Azul'], correctIndex: 0 },
        { question: 'Sector Blanco: ¿Qué color de la bandera representaba la Fe y la Religión?', options: ['Blanco', 'Verde', 'Rojo', 'Amarillo'], correctIndex: 0 },
        { question: 'Sector Rojo: ¿Qué color de la bandera representaba la Unión de todos los mexicanos?', options: ['Rojo', 'Verde', 'Blanco', 'Morado'], correctIndex: 0 },
        { question: 'Sector Dorado: ¿Qué instrumento musical o sonoro se hace sonar en el balcón presidencial cada 15 de septiembre?', options: ['La Campana de Dolores', 'Una trompeta mágica', 'Un tambor gigante', 'Una flauta de barro'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-ruleta-2',
    templateType: 'ruleta',
    title: 'Ruleta de Debates: Monarquía vs República',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Gira la ruleta para enfrentar debates ideológicos y posturas políticas del México naciente.',
    pdaNem: 'Nivel Medio Superior - Historia de México: Analiza las confrontaciones doctrinales entre republicanos, monarquistas e imperialistas.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Tribuno Constitucional', icon: '🎙️', description: 'Dominio de los debates fundacionales del México independiente.' },
    gamificationSettings: { timePerQuestion: 25, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 210, coinsReward: 40 },
    content: {
      title: 'Ruleta de Debates: Monarquía vs República',
      description: 'Gira la ruleta y responde sobre los proyectos de nación en disputa en 1821.',
      questions: [
        { question: 'Sector Monarquía Moderada: ¿A quién se ofreció en primer término la corona de México en los Tratados de Córdoba?', options: ['Al rey Fernando VII o a un infante de la dinastía Borbón', 'A Napoleón Bonaparte', 'A Simón Bolívar', 'Al presidente de EE.UU.'], correctIndex: 0 },
        { question: 'Sector República Federal: ¿Quién fue el primer Presidente de los Estados Unidos Mexicanos bajo la Constitución de 1824?', options: ['Guadalupe Victoria (José Miguel Ramón Adaucto)', 'Agustín de Iturbide', 'Antonio López de Santa Anna', 'Lucas Alamán'], correctIndex: 0 },
        { question: 'Sector Imperio: ¿Quién se coronó como el primer Emperador del México independiente en mayo de 1822?', options: ['Agustín I (Agustín de Iturbide)', 'Maximiliano de Habsburgo', 'Félix Calleja', 'Juan O\'Donojú'], correctIndex: 0 },
        { question: 'Sector Plan de Casa Mata (1823): ¿Qué objetivo militar y político logró este pronunciamiento encabezado por Santa Anna?', options: ['La abdicación de Agustín de Iturbide y la reinstalación del Congreso para fundar la República', 'La reconquista española', 'La venta de Texas', 'La anexión a Centroamérica'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 7. CARRERA MATEMÁTICA / HISTÓRICA (CHALLENGE)
  // ==========================================
  {
    id: 'indep-carrera-1',
    templateType: 'carrera_math',
    title: 'Carrera Insurgente Contrarreloj',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Acelera tu bólido histórico respondiendo preguntas a máxima velocidad.',
    pdaNem: 'Fase 5 - Ética / Saberes: Agilidad mental y cálculo de años y fechas en acontecimientos patrios.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Piloto Insurgente', icon: '🏎️', description: '¡Velocidad supersónica respondiendo reactivos históricos!' },
    gamificationSettings: { timePerQuestion: 15, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 35 },
    content: {
      title: 'Carrera Insurgente Contrarreloj',
      description: 'Responde velozmente para ganar la carrera histórica de la Independencia.',
      questions: [
        { question: '¿Cuántos años duró la guerra de Independencia (1810 a 1821)?', options: ['11 años', '5 años', '20 años', '100 años'], correctIndex: 0 },
        { question: '¿En qué siglo inició el movimiento de Independencia de México (1810)?', options: ['Siglo XIX (19)', 'Siglo XVIII (18)', 'Siglo XX (20)', 'Siglo XVI (16)'], correctIndex: 0 },
        { question: 'Si la conspiración se descubrió en septiembre de 1810, ¿en qué mes de 1821 entró el Ejército Trigarante?', options: ['Septiembre (27 de septiembre)', 'Mayo', 'Diciembre', 'Enero'], correctIndex: 0 },
        { question: '¿Cuántos artículos principales integraron originalmente los Sentimientos de la Nación de Morelos en 1813?', options: ['23 artículos (Sentimientos)', '100 artículos', '5 artículos', '12 artículos'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-carrera-2',
    templateType: 'carrera_math',
    title: 'Maratón de Causas y Dinámicas Novohispanas',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Compite a máxima velocidad resolviendo causas internas, externas y demografía del México colonial.',
    pdaNem: 'Nivel Medio Superior - Historia: Analiza las variables socioeconómicas y demográficas de la crisis novohispana.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Velocista de la Ilustración', icon: '⚡', description: 'Velocidad mental superior en análisis histórico.' },
    gamificationSettings: { timePerQuestion: 12, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 240, coinsReward: 50 },
    content: {
      title: 'Maratón de Causas y Dinámicas Novohispanas',
      description: 'Preguntas de velocidad sobre las causas estructurales del movimiento libertario.',
      questions: [
        { question: '¿Qué invasión militar a España en 1808 provocó la abdicación de los reyes borbones y el vacío de poder?', options: ['La invasión de Napoleón Bonaparte (Francia)', 'La invasión británica', 'La guerra otomana', 'La invasión portuguesa'], correctIndex: 0 },
        { question: '¿Qué grupo social novohispano, formado por hijos de españoles nacidos en América, lideró la conspiración política?', options: ['Los Criollos', 'Los Peninsulares', 'Los Mestizos', 'Los Virreyes'], correctIndex: 0 },
        { question: '¿Qué reformas fiscales y administrativas implementadas por los reyes Borbones a finales del siglo XVIII generaron gran descontento?', options: ['Las Reformas Borbónicas', 'Las Leyes de Indias', 'Las Reformas Protestantes', 'Las Leyes de Reforma'], correctIndex: 0 },
        { question: '¿Qué documento abolió en 1810 el cobro de la alcabala a los artículos de primera necesidad para indígenas y castas?', options: ['El Decreto de Guadalajara dictado por Miguel Hidalgo', 'La Bula Papal', 'El Real Decreto de Madrid', 'El Tratado de Tordesillas'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 8. VERDADERO / FALSO EXPLOSIVO (CHALLENGE)
  // ==========================================
  {
    id: 'indep-tf-1',
    templateType: 'tf_explosivo',
    title: 'Mitos y Realidades de la Alhóndiga y el Pípila',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Decide si la afirmación es Verdadera o Falsa antes de que la dinamita explote.',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Distingue hechos históricos comprobados de mitos populares de la tradición.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Desactivador de Mitos', icon: '💣', description: '¡Desactivaste todas las bombas respondiendo con rigor histórico!' },
    gamificationSettings: { timePerQuestion: 15, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 30 },
    content: {
      title: 'Mitos y Realidades de la Alhóndiga y el Pípila',
      description: 'Elige Verdadero o Falso antes de que la mecha se consuma.',
      questions: [
        { question: 'Verdadero o Falso: Miguel Hidalgo nació en Dolores, Guanajuato.', options: ['Falso (Nació en la hacienda de San Diego de Corralejo, Pénjamo)', 'Verdadero'], correctIndex: 0 },
        { question: 'Verdadero o Falso: Doña Josefa Ortiz de Domínguez era la esposa del Corregidor de Querétaro, Miguel Domínguez.', options: ['Verdadero', 'Falso'], correctIndex: 0 },
        { question: 'Verdadero o Falso: Juan José de los Reyes "El Pípila" era un minero que se colocó una losa para protegerse de los disparos.', options: ['Verdadero', 'Falso'], correctIndex: 0 },
        { question: 'Verdadero o Falso: La campana de Dolores fue destruida durante la toma de Guanajuato.', options: ['Falso (Se conserva en el Palacio Nacional de la Ciudad de México)', 'Verdadero'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-tf-2',
    templateType: 'tf_explosivo',
    title: 'Mitos y Verdades de la Consumación de 1821',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Evalúa premisas complejas sobre los acuerdos entre insurgentes y realistas.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Analiza críticamente los intereses de los actores en la consumación de 1821.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Auditor de la Verdad', icon: '🧨', description: 'Maestría en análisis crítico sin caer en trampas históricas.' },
    gamificationSettings: { timePerQuestion: 12, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 190, coinsReward: 35 },
    content: {
      title: 'Mitos y Verdades de la Consumación de 1821',
      description: 'Verifica la veracidad de los hechos clave del Ejército Trigarante.',
      questions: [
        { question: 'Verdadero o Falso: Agustín de Iturbide siempre fue un general insurgente desde 1810.', options: ['Falso (Combatió ferozmente a los insurgentes en el bando realista antes de pactar en 1821)', 'Verdadero'], correctIndex: 0 },
        { question: 'Verdadero o Falso: Juan O\'Donojú firmó los Tratados de Córdoba en calidad de último Jefe Político Superior de la Nueva España.', options: ['Verdadero', 'Falso'], correctIndex: 0 },
        { question: 'Verdadero o Falso: España reconoció formal e inmediatamente la Independencia de México en 1821.', options: ['Falso (España desconoció los Tratados de Córdoba e intentó la reconquista hasta 1836)', 'Verdadero'], correctIndex: 0 },
        { question: 'Verdadero o Falso: Vicente Guerrero pronunció la famosa frase "Mi patria es primero" ante la oferta de indulto de su propio padre.', options: ['Verdadero', 'Falso'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 9. CONSTRUCTOR DE ORACIONES (PUZZLE)
  // ==========================================
  {
    id: 'indep-sentence-1',
    templateType: 'sentence_builder',
    title: 'Frases Inmortales de la Independencia',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Ordena los bloques de palabras para reconstruir las frases célebres de los héroes.',
    pdaNem: 'Fase 3 - Lenguajes: Estructura oraciones con coherencia semántica sobre hechos patrios.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Constructor de Libertad', icon: '🧱', description: '¡Armaste a la perfección todas las frases históricas!' },
    gamificationSettings: { timePerQuestion: 40, lives: 3, streakMultiplier: false, passScorePercentage: 75, xpBaseReward: 140, coinsReward: 25 },
    content: {
      title: 'Frases Inmortales de la Independencia',
      description: 'Ordena las palabras clave para formar la cita histórica correcta.',
      questions: [
        { question: 'Reconstruye la frase de Vicente Guerrero al rechazar el perdón realista:', options: ['La patria es primero', 'Primero es la victoria', 'La libertad es de todos', 'Viva México independiente'], correctIndex: 0 },
        { question: 'Reconstruye el título de dignidad que asumió José María Morelos:', options: ['Siervo de la Nación', 'Padre de la Patria', 'Capitán de América', 'Defensor del Pueblo'], correctIndex: 0 },
        { question: 'Reconstruye el grito de unión popular de septiembre de 1810:', options: ['Viva la América libre y mueran los malos gobiernos', 'Viva el rey de España', 'Paz para todos los reinos', 'Unidos seremos más fuertes'], correctIndex: 0 },
        { question: 'Reconstruye el lema del estandarte tricolor de 1821:', options: ['Religión Independencia y Unión', 'Libertad Igualdad Fraternidad', 'Tierra y Libertad', 'Sufragio Efectivo No Reelección'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-sentence-2',
    templateType: 'sentence_builder',
    title: 'Postulados de los Sentimientos de la Nación',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Arma las declaraciones cívicas y republicanas escritas por Morelos en 1813.',
    pdaNem: 'Fase 6 - Lenguajes / Ética: Sintetiza postulados políticos y derechos humanos en documentos históricos.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Redactor Soberano', icon: '📝', description: 'Reconstrucción exacta de los artículos de Morelos.' },
    gamificationSettings: { timePerQuestion: 35, lives: 3, streakMultiplier: false, passScorePercentage: 80, xpBaseReward: 190, coinsReward: 35 },
    content: {
      title: 'Postulados de los Sentimientos de la Nación',
      description: 'Estructura los principios del pensamiento de José María Morelos.',
      questions: [
        { question: 'Artículo 1: Que la América es libre e independiente de España y de toda otra Nación, Gobierno o Monarquía.', options: ['Que la América es libre e independiente de España', 'Que se mantenga el virreinato', 'Que paguen tributo a Francia', 'Que se divida la corona'], correctIndex: 0 },
        { question: 'Artículo 5: Que la Soberanía dimana inmediatamente del Pueblo.', options: ['Que la Soberanía dimana inmediatamente del Pueblo', 'Que el rey tiene poder absoluto', 'Que el ejército manda al pueblo', 'Que los virreyes eligen gobernantes'], correctIndex: 0 },
        { question: 'Artículo 12: Que como la buena ley es superior a todo hombre, las que dicte nuestro Congreso deben ser tales que moderen la opulencia y la indigencia.', options: ['Que la ley modere la opulencia y la indigencia', 'Que los ricos tengan más derechos', 'Que no haya leyes escritas', 'Que los jueces cobren tributos'], correctIndex: 0 },
        { question: 'Artículo 15: Que la esclavitud se proscriba para siempre, y lo mismo la distinción de castas.', options: ['Que la esclavitud se proscriba para siempre', 'Que continúen los privilegios de castas', 'Que se cobre impuesto a los esclavos', 'Que se mantengan los estamentos'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 10. ESCAPE ROOM LÓGICO (PUZZLE)
  // ==========================================
  {
    id: 'indep-escape-1',
    templateType: 'escape_room',
    title: 'Escape de la Conspiración de Querétaro: El Mensaje Secreto',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Resuelve acertijos en la casa del Corregidor y envía el mensaje secreto a tiempo a Dolores.',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Resuelve problemas de lógica basados en secuencias y decisiones históricas.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Escapista de Querétaro', icon: '🗝️', description: '¡Descifraste las 4 puertas y salvaste la conspiración insurgente!' },
    gamificationSettings: { timePerQuestion: 60, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 200, coinsReward: 40 },
    content: {
      title: 'Escape de la Conspiración de Querétaro: El Mensaje Secreto',
      description: 'Abre cada puerta resolviendo el acertijo pedagógico de la conspiración.',
      questions: [
        { question: 'Puerta 1 (La Habitación Cerrada): Doña Josefa golpeó el piso con su tacón para alertar al alcaide Ignacio Pérez. ¿Qué número de golpes clave dio según la leyenda para que supiera que era una emergencia?', options: ['3 golpes rítmicos firmes', '1 solo golpe suave', '20 golpes con la mano', 'Ninguno'], correctIndex: 0 },
        { question: 'Puerta 2 (El Jinete Veloz): Ignacio Pérez cabalgó sin descanso toda la noche. ¿Hacia qué ciudad cabalgó primero para avisar a Juan Aldama e Ignacio Allende?', options: ['San Miguel el Grande (San Miguel de Allende)', 'Ciudad de México', 'Puebla', 'Zacatecas'], correctIndex: 0 },
        { question: 'Puerta 3 (La Parroquia de Dolores): Llegaron en la madrugada del 16 de septiembre de 1810 a la casa de Hidalgo. ¿Qué famosa frase exclamó Hidalgo al saber la noticia?', options: ['"¡Caballeros, somos perdidos; aquí no hay más recurso que ir a coger gachupines!"', '"Huyamos de inmediato"', '"Esperemos a la mañana"', '"Rindámonos a la guardia"'], correctIndex: 0 },
        { question: 'Puerta 4 (El Desbloqueo Final): Para liberar a los presos de la cárcel municipal de Dolores y sumarlos al ejército, ¿qué objeto usaron?', options: ['Las llaves de la sacristía y el respaldo del pueblo armado', 'Dinamita traída de Europa', 'Una orden firmada por el Virrey', 'Un cañón de bronce'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-escape-2',
    templateType: 'escape_room',
    title: 'Descifra el Código de los Tratados de Córdoba',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Supera salas de escape analizando artículos diplomáticos entre Iturbide y Juan O\'Donojú.',
    pdaNem: 'Nivel Medio Superior - Historia: Resolución de dilemas diplomáticos y análisis de documentos de Estado.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Maestro del Escape Diplomático', icon: '🚪', description: 'Descifraste los códigos jurídicos de la independencia.' },
    gamificationSettings: { timePerQuestion: 50, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 250, coinsReward: 50 },
    content: {
      title: 'Descifra el Código de los Tratados de Córdoba',
      description: 'Resuelve los acertijos de la firma de los Tratados de Córdoba en 1821.',
      questions: [
        { question: 'Sala 1 (El Lugar de la Cita): ¿En qué estado de la República Mexicana se encuentra la villa de Córdoba donde se reunieron O\'Donojú e Iturbide el 24 de agosto de 1821?', options: ['Veracruz', 'Jalisco', 'Oaxaca', 'Michoacán'], correctIndex: 0 },
        { question: 'Sala 2 (La Cláusula Secreta): Según el artículo 3 de los Tratados, si los príncipes españoles rechazaban la corona, ¿quién designaría al emperador?', options: ['Las Cortes Imperiales de México (El Congreso mexicano)', 'El Papa en Roma', 'El Rey de Inglaterra', 'El Virrey de Perú'], correctIndex: 0 },
        { question: 'Sala 3 (La Junta Provisional): ¿Qué órgano de gobierno provisional se formó el 28 de septiembre de 1821 para redactar el Acta de Independencia del Imperio Mexicano?', options: ['La Junta Provisional Gubernativa', 'El Tribunal de la Inquisición', 'El Senado virreinal', 'El Cabildo de Guadalajara'], correctIndex: 0 },
        { question: 'Sala 4 (La Puerta del Trunfo): ¿Qué día histórico del año 1821 marchó triunfalmente el Ejército Trigarante por el Paseo Nuevo hacia la Plaza Mayor?', options: ['27 de septiembre de 1821', '16 de septiembre de 1810', '5 de febrero de 1817', '1 de enero de 1820'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 11. SIMÓN DICE EDUCATIVO (CHALLENGE)
  // ==========================================
  {
    id: 'indep-simon-1',
    templateType: 'simon_says',
    title: 'Secuencia de los Primeros Bastiones Insurgentes',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Memoriza y repite en el orden correcto los lugares por donde avanzó el cura Miguel Hidalgo.',
    pdaNem: 'Fase 3 - Saberes / Ética: Memoria espacial y secuenciación de eventos geográficos en mapas históricos.',
    campoFormativo: 'Saberes y Pensamiento Científico',
    badgeReward: { name: 'Estratega de Secuencia', icon: '🎮', description: '¡Memoria implacable de la ruta libertadora!' },
    gamificationSettings: { timePerQuestion: 20, lives: 3, streakMultiplier: true, passScorePercentage: 70, xpBaseReward: 140, coinsReward: 25 },
    content: {
      title: 'Secuencia de los Primeros Bastiones Insurgentes',
      description: 'Memoriza la ruta de Hidalgo y selecciona la opción que sigue la secuencia exacta.',
      questions: [
        { question: 'Paso 1: ¿De qué pueblo partió el ejército insurgente la madrugada del 16 de septiembre?', options: ['Dolores', 'Querétaro', 'Puebla', 'Toluca'], correctIndex: 0 },
        { question: 'Paso 2: ¿A qué santuario llegaron para tomar el estandarte de la Virgen de Guadalupe?', options: ['Atotonilco', 'Guadalupe Hidalgo', 'San Juan de los Lagos', 'Zapopan'], correctIndex: 0 },
        { question: 'Paso 3: ¿Qué importante ciudad minera fue tomada el 28 de septiembre tras el asedio a la Alhóndiga?', options: ['Guanajuato', 'Pachuca', 'Taxco', 'Zacatecas'], correctIndex: 0 },
        { question: 'Paso 4: ¿En qué cerro cercano a la Ciudad de México lograron una gran victoria militar el 30 de octubre de 1810?', options: ['Monte de las Cruces', 'Cerro de la Bufa', 'Cerro del Tepeyac', 'Cerro del Chiquihuite'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-simon-2',
    templateType: 'simon_says',
    title: 'Secuencia de Campañas Militares de José María Morelos',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Sigue la cronología estratégica de las cuatro campañas militares del Siervo de la Nación.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Identifica el despliegue geográfico y militar del movimiento insurgente en el sur.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Comandante del Sur', icon: '🧭', description: 'Secuenciación exacta de las campañas de Morelos.' },
    gamificationSettings: { timePerQuestion: 20, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 190, coinsReward: 35 },
    content: {
      title: 'Secuencia de Campañas Militares de José María Morelos',
      description: 'Elige la secuencia correcta de las victorias militares de Morelos (1810 a 1815).',
      questions: [
        { question: 'Campaña 1 (1810-1811): Morelos recibe la encomienda de Hidalgo de levantar el sur y tomar un puerto marítimo clave. ¿Qué puerto era?', options: ['Puerto de Acapulco', 'Puerto de Veracruz', 'Puerto de Tampico', 'Puerto de Manzanillo'], correctIndex: 0 },
        { question: 'Campaña 2 (1811-1812): División del ejército en tres columnas y resistencia heroica en qué ciudad cercada por Félix María Calleja:', options: ['Sitio de Cuautla', 'Sitio de Querétaro', 'Batalla de Celaya', 'Asedio de Guadalajara'], correctIndex: 0 },
        { question: 'Campaña 3 (1812-1813): Morelos toma Tehuacán, Orizaba y la estratégica capital del sur: ¿Qué ciudad colonial tomó en noviembre de 1812?', options: ['Oaxaca', 'Mérida', 'Chiapas', 'Campeche'], correctIndex: 0 },
        { question: 'Campaña 4 (1813-1815): Organización del Congreso y promulgación de la Constitución de Apatzingán antes de su captura en qué poblado?', options: ['Temalaca (Puebla)', 'Chilapa', 'Tixtla', 'Iguala'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 12. BATALLA DE RESPUESTAS (CHALLENGE)
  // ==========================================
  {
    id: 'indep-batalla-1',
    templateType: 'batalla_respuestas',
    title: 'Duelo Insurgente de Agilidad Mental',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Enfrenta preguntas veloces en un duelo de reflejos históricos.',
    pdaNem: 'Fase 5 - Saberes / Lenguajes: Agilidad en la recuperación de saberes históricos en dinámicas competitivas sanas.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Campeón del Duelo Patrio', icon: '⚔️', description: '¡Invicto en el duelo de conocimientos insurgentes!' },
    gamificationSettings: { timePerQuestion: 10, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 170, coinsReward: 30 },
    content: {
      title: 'Duelo Insurgente de Agilidad Mental',
      description: 'Responde a gran velocidad para ganar el duelo de conocimientos.',
      questions: [
        { question: '¿En qué estado actual se encuentra San Miguel de Allende y Dolores Hidalgo?', options: ['Guanajuato', 'Jalisco', 'Michoacán', 'Querétaro'], correctIndex: 0 },
        { question: '¿Quién escribió el periódico insurgente "El Despertador Americano" en Guadalajara?', options: ['Francisco Severo Maldonado', 'Lucas Alamán', 'Fray Servando Teresa de Mier', 'Carlos María de Bustamante'], correctIndex: 0 },
        { question: '¿Qué heroína insurgente arriesgó su fortuna enviando medicinas y correspondencia a las tropas de Morelos?', options: ['Leona Vicario', 'María Ignacia Rodríguez "La Güera"', 'Mariana Rodríguez del Toro', 'Gertrudis Bocanegra'], correctIndex: 0 },
        { question: '¿Qué insurgente michoacana fue fusilada en Pátzcuaro por negarse a delatar a sus compañeros de lucha?', options: ['Gertrudis Bocanegra', 'Josefa Ortiz', 'Manuela Medina', 'Rafaela López'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-batalla-2',
    templateType: 'batalla_respuestas',
    title: 'Batalla Crítica del Pensamiento Ilustrado',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Enfrentamiento de alta velocidad conceptual sobre el liberalismo y la emancipación.',
    pdaNem: 'Nivel Medio Superior - Historia de México: Argumentación y contraste de ideas filosóficas del siglo XIX.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Gladiador de las Ideas', icon: '🛡️', description: 'Victoria absoluta en el combate conceptual histórico.' },
    gamificationSettings: { timePerQuestion: 10, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 230, coinsReward: 45 },
    content: {
      title: 'Batalla Crítica del Pensamiento Ilustrado',
      description: 'Combate contrarreloj de teoría política de la Independencia.',
      questions: [
        { question: '¿Qué filósofo francés de la Ilustración propuso la doctrina de la División de Poderes (Ejecutivo, Legislativo y Judicial)?', options: ['Montesquieu', 'Rousseau', 'Voltaire', 'Diderot'], correctIndex: 0 },
        { question: '¿Qué obra de Jean-Jacques Rousseau influyó decisivamente en Morelos sobre el origen de la Soberanía Popular?', options: ['El Contrato Social', 'El Espíritu de las Leyes', 'Cándido', 'Emilio o De la educación'], correctIndex: 0 },
        { question: '¿Qué conspiración de 1809 en Michoacán precedió inmediatamente a la de Querétaro proponiendo una junta de gobierno criolla?', options: ['La Conspiración de Valladolid', 'La Conjura del Marqués del Valle', 'La Conspiración de San Blas', 'El Motín de Celaya'], correctIndex: 0 },
        { question: '¿Quién fue el fraile dominico regiomontano que promovió la independencia en Londres y acompañó a Francisco Javier Mina en su expedición?', options: ['Fray Servando Teresa de Mier', 'Fray Bartolomé de las Casas', 'Fray Toribio de Benavente', 'Fray Juan de Zumárraga'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 13. ORDENAMIENTO CRONOLÓGICO (QUIZ / TIMELINE)
  // ==========================================
  {
    id: 'indep-ordenamiento-1',
    templateType: 'ordenamiento',
    title: 'Línea del Tiempo Básica: De 1810 a 1821',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Ordena cronológicamente los acontecimientos cumbre de la Independencia de México.',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Construye líneas del tiempo ubicando hechos históricos clave en orden cronológico.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Cronista del Tiempo', icon: '⏳', description: '¡Ordenaste a la perfección los 11 años de lucha libertaria!' },
    gamificationSettings: { timePerQuestion: 45, lives: 3, streakMultiplier: false, passScorePercentage: 75, xpBaseReward: 170, coinsReward: 30 },
    content: {
      title: 'Línea del Tiempo Básica: De 1810 a 1821',
      description: 'Selecciona el orden cronológico exacto de los eventos presentados.',
      questions: [
        { question: '¿Cuál de estos eventos ocurrió PRIMERO en la historia?', options: ['Grito de Dolores (16 Septiembre 1810)', 'Sentimientos de la Nación (1813)', 'Abrazo de Acatempan (1821)', 'Entrada del Ejército Trigarante (1821)'], correctIndex: 0 },
        { question: '¿Cuál de estos eventos ocurrió SEGUNDO en la secuencia temporal?', options: ['Promulgación de los Sentimientos de la Nación por Morelos (1813)', 'Grito de Dolores (1810)', 'Tratados de Córdoba (1821)', 'Constitución Federal de 1824'], correctIndex: 0 },
        { question: '¿Cuál de estos eventos ocurrió TERCERO en la secuencia temporal?', options: ['El Abrazo de Acatempan entre Guerrero e Iturbide (Febrero 1821)', 'Grito de Dolores (1810)', 'Toma de la Alhóndiga (1810)', 'Conspiración de Querétaro (1810)'], correctIndex: 0 },
        { question: '¿Cuál de estos eventos selló la culminación de la guerra en septiembre de 1821?', options: ['Entrada triunfal del Ejército Trigarante a la Ciudad de México (27 Septiembre 1821)', 'Batalla del Monte de las Cruces (1810)', 'Muerte de Hidalgo (1811)', 'Sitio de Cuautla (1812)'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-ordenamiento-2',
    templateType: 'ordenamiento',
    title: 'Cronología Fina de las 4 Fases de la Independencia',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Ubica con precisión las cuatro etapas y sus líderes militares y legislativos.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Distingue la periodización histórica y sus cambios de rumbo político y militar.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Maestro de la Cronología', icon: '⏱️', description: 'Periodización impecable de las cuatro etapas insurgentes.' },
    gamificationSettings: { timePerQuestion: 35, lives: 3, streakMultiplier: false, passScorePercentage: 80, xpBaseReward: 210, coinsReward: 40 },
    content: {
      title: 'Cronología Fina de las 4 Fases de la Independencia',
      description: 'Identifica el orden y correspondencia de las cuatro etapas de la guerra.',
      questions: [
        { question: 'Etapa 1 (1810-1811): ¿Con qué acontecimiento finalizó trágicamente la etapa de Iniciación?', options: ['La captura y fusilamiento de Hidalgo, Allende, Aldama y Jiménez en Chihuahua (1811)', 'La firma del Plan de Iguala', 'El triunfo en Cuautla', 'La llegada de O\'Donojú'], correctIndex: 0 },
        { question: 'Etapa 2 (1811-1815): ¿Qué hito legislativo marcó la cúspide de la etapa de Organización liderada por Morelos?', options: ['El Decreto Constitucional de Apatzingán de 1814', 'El Tratado de Versalles', 'El Bando de Guadalajara', 'El Plan de San Luis'], correctIndex: 0 },
        { question: 'Etapa 3 (1815-1820): ¿Qué característica definió a la etapa de Resistencia tras la muerte de Morelos?', options: ['La guerra de guerrillas encabezada por Vicente Guerrero, Pedro Ascencio y Guadalupe Victoria', 'Grandes batallas en campo abierto de miles de hombres', 'La rendición total de los insurgentes', 'El apoyo militar de Estados Unidos'], correctIndex: 0 },
        { question: 'Etapa 4 (1821): ¿Con qué pacto político-militar comenzó la etapa de Consumación?', options: ['La proclamación del Plan de Iguala en febrero de 1821', 'La batalla de Chapultepec', 'La Constitución de 1857', 'El Tratado de Tlatelolco'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 14. CRUCIGRAMA DE SABERES (PUZZLE)
  // ==========================================
  {
    id: 'indep-crucigrama-1',
    templateType: 'crucigrama',
    title: 'Crucigrama Insurgente Infantil',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Resuelve pistas sencillas para completar las palabras cruzadas de los héroes de la patria.',
    pdaNem: 'Fase 3 - Lenguajes: Resuelve acertijos ortográficos y vocabulario histórico en cuadrículas.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Crucigramista Heroico', icon: '📝', description: '¡Completaste todas las palabras cruzadas de la Independencia!' },
    gamificationSettings: { timePerQuestion: 45, lives: 3, streakMultiplier: false, passScorePercentage: 70, xpBaseReward: 130, coinsReward: 25 },
    content: {
      title: 'Crucigrama Insurgente Infantil',
      description: 'Descubre las respuestas a las pistas del crucigrama patriótico.',
      questions: [
        { question: 'Pista 1 Horizontal: Apellido del Padre de la Patria que inició la lucha (7 letras: H-I-D-A-L-G-O)', options: ['HIDALGO', 'MORELOS', 'ALLENDE', 'GUERRERO'], correctIndex: 0 },
        { question: 'Pista 2 Vertical: Nombre de la campana que sonó en Dolores (8 letras: C-A-M-P-A-N-A)', options: ['CAMPANA', 'BANDERA', 'ESPADA', 'CORONA'], correctIndex: 0 },
        { question: 'Pista 3 Horizontal: País del que México se independizó (6 letras: E-S-P-A-Ñ-A)', options: ['ESPAÑA', 'FRANCIA', 'INGLATERRA', 'PORTUGAL'], correctIndex: 0 },
        { question: 'Pista 4 Vertical: Color de la bandera que representa la unión (4 letras: R-O-J-O)', options: ['ROJO', 'AZUL', 'VERDE', 'BLANCO'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-crucigrama-2',
    templateType: 'crucigrama',
    title: 'Crucigrama Político y Social Novohispano',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Crucigrama de términos jurídicos, castas y organismos virreinales del México insurgente.',
    pdaNem: 'Nivel Medio Superior - Historia: Reconoce la estructura institucional novohispana y su desintegración.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Erudito del Crucigrama', icon: '📰', description: 'Dominio de conceptos jurídicos y sociales novohispanos.' },
    gamificationSettings: { timePerQuestion: 40, lives: 3, streakMultiplier: false, passScorePercentage: 80, xpBaseReward: 220, coinsReward: 45 },
    content: {
      title: 'Crucigrama Político y Social Novohispano',
      description: 'Resuelve los reactivos del crucigrama de instituciones y procesos coloniales.',
      questions: [
        { question: 'Pista 1: Tribunal judicial y consultivo supremo que gobernaba en la Nueva España junto con el virrey.', options: ['REAL AUDIENCIA', 'SANTO OFICIO', 'CABILDO INDIGENA', 'CORTES DE CADIZ'], correctIndex: 0 },
        { question: 'Pista 2: Sistema de división territorial y recaudación administrativa creado por las Reformas Borbónicas.', options: ['INTENDENCIAS', 'ENCOMIENDAS', 'REPARTIMIENTOS', 'CAPITANIAS'], correctIndex: 0 },
        { question: 'Pista 3: Nombre que recibían los españoles nacidos en la península ibérica que ocupaban los puestos más altos.', options: ['PENINSULARES (Gachupines)', 'CRIOLLOS', 'MESTIZOS', 'MULATOS'], correctIndex: 0 },
        { question: 'Pista 4: Impuesto o tributo sobre las ventas mercantiles que causaba gran descontento entre los comerciantes locales.', options: ['ALCABALA', 'DIEZMO', 'QUINTO REAL', 'ESTANCO'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 15. ROMPECABEZAS GUIADO (VISUAL)
  // ==========================================
  {
    id: 'indep-rompecabezas-1',
    templateType: 'rompecabezas',
    title: 'Reconstruye el Estandarte de Atotonilco',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Responde los reactivos para desbloquear cada pieza de la pintura del estandarte insurgente.',
    pdaNem: 'Fase 3 - Lenguajes / Artes: Apreciación de imágenes patrimoniales y ensamblaje visual guiado.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Restaurador de Símbolos', icon: '🧩', description: '¡Armaste por completo la imagen del estandarte insurgente!' },
    gamificationSettings: { timePerQuestion: 30, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 140, coinsReward: 25 },
    content: {
      title: 'Reconstruye el Estandarte de Atotonilco',
      description: 'Responde cada pregunta para colocar una pieza del rompecabezas histórico.',
      questions: [
        { question: 'Pieza 1: ¿Qué imagen religiosa estaba plasmada en el lienzo que tomó Hidalgo en Atotonilco?', options: ['La Virgen de Guadalupe', 'San Miguel Arcángel', 'La Virgen de los Remedios', 'San Judas Tadeo'], correctIndex: 0 },
        { question: 'Pieza 2: ¿En qué año fue tomado este estandarte?', options: ['1810', '1910', '1521', '2010'], correctIndex: 0 },
        { question: 'Pieza 3: ¿Qué efecto causó el estandarte entre los campesinos e indígenas?', options: ['Un gran entusiasmo de fe y unión para unirse al ejército insurgente', 'Miedo y huida', 'Desinterés', 'Confusión total'], correctIndex: 0 },
        { question: 'Pieza 4: ¿En qué museo nacional se conserva actualmente este invaluable tesoro patrio?', options: ['Museo Nacional de Historia (Castillo de Chapultepec)', 'Museo de Louvre', 'Museo de Antropología', 'Museo Soumaya'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-rompecabezas-2',
    templateType: 'rompecabezas',
    title: 'Reconstruye la Entrada del Ejército Trigarante',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Reconstruye la célebre pintura de la entrada triunfal de las tropas libertadoras el 27 de septiembre de 1821.',
    pdaNem: 'Fase 6 - Lenguajes / Artes: Análisis de fuentes iconográficas de la historia nacional.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Conservador de la Memoria', icon: '🎨', description: 'Reconstrucción visual completa de la consumación de 1821.' },
    gamificationSettings: { timePerQuestion: 25, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 200, coinsReward: 40 },
    content: {
      title: 'Reconstruye la Entrada del Ejército Trigarante',
      description: 'Responde para ensamblar las secciones de la pintura histórica.',
      questions: [
        { question: 'Sección 1: ¿Quién marchaba al frente montando un caballo blanco como comandante del Ejército Trigarante?', options: ['Agustín de Iturbide', 'Vicente Guerrero', 'Antonio López de Santa Anna', 'Félix Calleja'], correctIndex: 0 },
        { question: 'Sección 2: ¿Qué división marchaba en la retaguardia honrando a los insurgentes del sur?', options: ['La división de tropas insurgentes de Vicente Guerrero', 'El regimiento de Flandes', 'La guardia de la reina', 'Los dragones de España'], correctIndex: 0 },
        { question: 'Sección 3: ¿Cuántos soldados uniformados integraban aproximadamente el Ejército Trigarante en su entrada triunfal?', options: ['Aproximadamente 16,000 soldados', '500 soldados', '100 soldados', '100,000 soldados'], correctIndex: 0 },
        { question: 'Sección 4: ¿Qué edificio principal fue adornado con arcos triunfales para recibir a los libertadores?', options: ['La Catedral Metropolitana y el Palacio Virreinal (Palacio Nacional)', 'El Palacio de Bellas Artes', 'El Monumento a la Revolución', 'El Ángel de la Independencia'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 16. DETECTIVES DE PALABRAS (PUZZLE)
  // ==========================================
  {
    id: 'indep-detectives-1',
    templateType: 'word_detective',
    title: 'Detectives de la Historia: Encuentra los Errores en el Relato',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Encuentra las afirmaciones falsas o anacronismos insertados intencionalmente en el texto.',
    pdaNem: 'Fase 5 - Lenguajes: Identifica errores de veracidad y sesgos en textos históricos informativos.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Detective Histórico', icon: '🔍', description: '¡Descubriste todas las pistas falsas y anacronismos!' },
    gamificationSettings: { timePerQuestion: 35, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 30 },
    content: {
      title: 'Detectives de la Historia: Encuentra los Errores en el Relato',
      description: 'Identifica la información incorrecta o anacrónica en cada caso.',
      questions: [
        { question: 'Caso 1: "Josefa Ortiz de Domínguez envió un mensaje por WhatsApp a Miguel Hidalgo para avisarle que la conspiración fue descubierta." ¿Cuál es el error?', options: ['El WhatsApp no existía en 1810; envió una carta escrita a través del alcaide Ignacio Pérez.', 'Josefa no estaba en Querétaro', 'Hidalgo no era el líder', 'No hubo conspiración'], correctIndex: 0 },
        { question: 'Caso 2: "En la Alhóndiga de Granaditas los insurgentes dispararon rayos láser contra las tropas realistas." ¿Cuál es el error?', options: ['No había rayos láser; usaron hondas, piedras, machetes, fusiles antiguos y antorchas.', 'La Alhóndiga está en Mérida', 'Los realistas no dispararon', 'Hidalgo no estaba en Guanajuato'], correctIndex: 0 },
        { question: 'Caso 3: "En 1813 Morelos voló en avión a Chilpancingo para inaugurar el Congreso de Anáhuac." ¿Cuál es el error?', options: ['Los aviones no existían; Morelos y sus tropas se trasladaban a caballo y a pie.', 'Morelos no estuvo en Chilpancingo', 'El Congreso fue en 1950', 'Los Sentimientos son de Juárez'], correctIndex: 0 },
        { question: 'Caso 4: "El 27 de septiembre de 1821 el Ejército Trigarante celebró la Independencia tomándose una selfie con teléfono móvil." ¿Cuál es el error?', options: ['Los teléfonos celulares son del siglo XX y XXI; en 1821 se celebraba con desfiles, campanas y proclamas impresas.', 'El ejército no era trigarante', 'No fue en septiembre', 'Iturbide no asistió'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-detectives-2',
    templateType: 'word_detective',
    title: 'Análisis Crítico de Discursos Realistas vs Insurgentes',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Detecta sesgos ideológicos, propaganda bélica y justificaciones jurídicas en fuentes primarias.',
    pdaNem: 'Nivel Medio Superior - Historia: Crítica de fuentes primarias y contraste de posturas ideológicas.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Analista de Fuentes Críticas', icon: '🧐', description: 'Rigor metodológico y detección de sesgos en fuentes históricas.' },
    gamificationSettings: { timePerQuestion: 30, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 220, coinsReward: 45 },
    content: {
      title: 'Análisis Crítico de Discursos Realistas vs Insurgentes',
      description: 'Detecta el argumento falaz o sesgo ideológico en los manifiestos de la época.',
      questions: [
        { question: 'Texto 1: "Los edictos de la Santa Inquisición de 1810 acusaban a Hidalgo de hereje y traidor." ¿Cuál era el sesgo político principal de la Inquisición en ese momento?', options: ['Utilizar la religión católica como instrumento político para deslegitimar y frenar la rebelión civil criolla.', 'Defender la ciencia moderna', 'Apoyar la libertad de culto', 'Abolir la esclavitud'], correctIndex: 0 },
        { question: 'Texto 2: Manifiestos virreinales afirmaban que "la Nueva España no requería autonomía porque gozaba de prosperidad y justicia plena." ¿Qué realidad social ocultaba ese argumento?', options: ['La profunda desigualdad económica, la discriminación hacia mestizos e indígenas y la exclusión de los criollos.', 'Que no había minas de plata', 'Que España no tenía ejército', 'Que los indígenas gobernaban'], correctIndex: 0 },
        { question: 'Texto 3: "El virrey Venegas ofrecía 10,000 pesos por la cabeza de Hidalgo, Allende y Aldama llamándolos bandoleros." ¿Qué buscaba esta táctica psicológica?', options: ['Despojar al movimiento de su carácter político y presentarlo como criminalidad común ante la opinión pública.', 'Pagar sus deudas de juego', 'Contratar soldados franceses', 'Promover el perdón'], correctIndex: 0 },
        { question: 'Texto 4: "En el periódico realista La Gaceta de México se minimizaban las victorias de Morelos." ¿Qué función tenía este medio de comunicación oficial?', options: ['Propaganda de guerra para evitar el pánico en la Ciudad de México y desalentar a nuevos simpatizantes insurgentes.', 'Publicar poesías románticas', 'Vender productos importados', 'Enseñar a leer al pueblo'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 17. SOPA DE LETRAS (PUZZLE)
  // ==========================================
  {
    id: 'indep-sopa-1',
    templateType: 'sopa_letras',
    title: 'Sopa de Saberes: Nombres de Insurgentes y Ciudades',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Encuentra las palabras escondidas en la cuadrícula mágica de la Independencia.',
    pdaNem: 'Fase 3 - Lenguajes: Localización visual y ortográfica de términos de la memoria cívica.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Rastreador de Letras', icon: '🔠', description: '¡Encontraste todos los términos patrios en la sopa de letras!' },
    gamificationSettings: { timePerQuestion: 60, lives: 3, streakMultiplier: false, passScorePercentage: 70, xpBaseReward: 130, coinsReward: 25 },
    content: {
      title: 'Sopa de Saberes: Nombres de Insurgentes y Ciudades',
      description: 'Identifica la palabra que completa la búsqueda temática.',
      questions: [
        { question: 'Palabra 1: Apellido del líder militar y patriota nacido en San Miguel el Grande (7 letras).', options: ['ALLENDE', 'HIDALGO', 'MORELOS', 'ALDAMA'], correctIndex: 0 },
        { question: 'Palabra 2: Apellido del Siervo de la Nación nacido en Valladolid (7 letras).', options: ['MORELOS', 'GUERRERO', 'ITURBIDE', 'MATAMOROS'], correctIndex: 0 },
        { question: 'Palabra 3: Ciudad natal de la conspiración de 1810 donde residía Doña Josefa Ortiz (9 letras).', options: ['QUERETARO', 'GUANAJUATO', 'ZACATECAS', 'MICHOACAN'], correctIndex: 0 },
        { question: 'Palabra 4: Estado y región del sur donde Vicente Guerrero sostuvo la lucha libertaria (8 letras).', options: ['GUERRERO', 'VERACRUZ', 'TABASCO', 'YUCATAN'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-sopa-2',
    templateType: 'sopa_letras',
    title: 'Glosario de Soberanía, Abolición y Ciudadanía',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Encuentra términos clave de derechos humanos, leyes y doctrina republicana.',
    pdaNem: 'Fase 6 - Lenguajes / Ética: Vocabulario cívico y conceptual de la transición a la soberanía nacional.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Lexicógrafo Republicano', icon: '📖', description: 'Dominio del léxico cívico de la Constitución de 1824.' },
    gamificationSettings: { timePerQuestion: 45, lives: 3, streakMultiplier: false, passScorePercentage: 75, xpBaseReward: 180, coinsReward: 35 },
    content: {
      title: 'Glosario de Soberanía, Abolición y Ciudadanía',
      description: 'Encuentra y define los conceptos cívicos de la Independencia.',
      questions: [
        { question: 'Término 1: Principio jurídico por el cual se eliminó la esclavitud y las castas en la América Mexicana.', options: ['ABOLICION', 'SEGREGACION', 'MONOPOLIO', 'INQUISICION'], correctIndex: 0 },
        { question: 'Término 2: Condición de autogobierno y libertad política respecto a potencias extranjeras.', options: ['SOBERANIA', 'VASALLAJE', 'COLONIALISMO', 'PROTECTORADO'], correctIndex: 0 },
        { question: 'Término 3: Ley suprema y fundamental que organiza los poderes de un Estado democrático.', options: ['CONSTITUCION', 'EDICTO', 'BULA', 'DECRETO'], correctIndex: 0 },
        { question: 'Término 4: Forma de gobierno donde el poder reside en representantes electos y no en monarcas hereditarios.', options: ['REPUBLICA', 'MONARQUIA', 'IMPERIO', 'TIRANIA'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 18. MAPA INTERACTIVO (VISUAL)
  // ==========================================
  {
    id: 'indep-mapa-1',
    templateType: 'mapa_interactivo',
    title: 'Ruta de Hidalgo: De Dolores a Guadalajara (1810)',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Ubica en el mapa virtual los sitios y ciudades del recorrido libertario de Miguel Hidalgo.',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Representa en mapas la trayectoria geográfica de la gesta libertaria.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Cartógrafo Insurgente', icon: '🗺️', description: '¡Localizaste con exactitud todas las ciudades de la ruta de Hidalgo!' },
    gamificationSettings: { timePerQuestion: 30, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 30 },
    content: {
      title: 'Ruta de Hidalgo: De Dolores a Guadalajara (1810)',
      description: 'Ubica el punto geográfico donde ocurrió cada acontecimiento.',
      questions: [
        { question: 'Punto 1 en el Mapa: ¿En qué ciudad del Bajío se libró la Batalla de la Alhóndiga de Granaditas?', options: ['Guanajuato (Guanajuato)', 'Toluca (Edomex)', 'Cuernavaca (Morelos)', 'Oaxaca (Oaxaca)'], correctIndex: 0 },
        { question: 'Punto 2 en el Mapa: ¿En qué ciudad del occidente mexicano abolió Hidalgo la esclavitud y fundó el periódico "El Despertador Americano"?', options: ['Guadalajara (Jalisco)', 'Monterrey (Nuevo León)', 'Mérida (Yucatán)', 'Acapulco (Guerrero)'], correctIndex: 0 },
        { question: 'Punto 3 en el Mapa: ¿En qué paso montañoso cercano a Toluca venció el ejército insurgente al realista Torcuato Trujillo?', options: ['Monte de las Cruces (Estado de México)', 'Paso de Cortés (Puebla)', 'Cumbres de Maltrata (Veracruz)', 'Cañón del Sumidero (Chiapas)'], correctIndex: 0 },
        { question: 'Punto 4 en el Mapa: ¿Cerca de qué puente en Jalisco sufrieron los insurgentes una dura derrota militar en enero de 1811?', options: ['Puente de Calderón (Zapotlanejo, Jalisco)', 'Puente de Alvarado (Veracruz)', 'Puente de Tasquillo (Hidalgo)', 'Puente de Doria'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-mapa-2',
    templateType: 'mapa_interactivo',
    title: 'Geografía Insurgente del Sur y el Sitio de Cuautla',
    level: 'secundaria',
    levelLabel: 'Secundaria (1°-3°)',
    targetAge: '12-15 años (Secundaria)',
    description: 'Mapea la estrategia del sur de Morelos, Guerrero, Galeana y los sitios militares de 1812.',
    pdaNem: 'Fase 6 - Ética, Naturaleza y Sociedades: Interpreta la geografía y orografía en el desarrollo de las campañas bélicas.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Estratega del Terreno', icon: '📍', description: 'Dominio territorial y geográfico de las campañas del sur.' },
    gamificationSettings: { timePerQuestion: 25, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 200, coinsReward: 40 },
    content: {
      title: 'Geografía Insurgente del Sur y el Sitio de Cuautla',
      description: 'Ubica los escenarios geográficos del movimiento de Morelos y Guerrero.',
      questions: [
        { question: 'Ubicación 1: ¿En qué estado actual se encuentra la heroica e histórica ciudad de Cuautla?', options: ['Morelos', 'Puebla', 'Tlaxcala', 'Hidalgo'], correctIndex: 0 },
        { question: 'Ubicación 2: ¿En qué puerto estratégico del océano Pacífico Morelos logró la rendición del Fuerte de San Diego en 1813?', options: ['Acapulco (Guerrero)', 'Mazatlán (Sinaloa)', 'Huatulco (Oaxaca)', 'San Blas (Nayarit)'], correctIndex: 0 },
        { question: 'Ubicación 3: ¿En qué serranías y montañas del actual estado de Guerrero se mantuvo invicta la guerrilla de Vicente Guerrero?', options: ['Sierra Madre del Sur', 'Sierra Tarahumara', 'Sierra de San Pedro Mártir', 'Sierra Gorda'], correctIndex: 0 },
        { question: 'Ubicación 4: ¿En qué villa de Michoacán se redactó la Constitución insurgente de 1814?', options: ['Apatzingán (Michoacán)', 'Pátzcuaro (Michoacán)', 'Uruapan (Michoacán)', 'Zamora (Michoacán)'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 19. CAZA-TESOROS (CHALLENGE)
  // ==========================================
  {
    id: 'indep-tesoro-1',
    templateType: 'treasure_hunt',
    title: 'Caza-Tesoros en el Museo de la Independencia',
    level: 'primaria_baja',
    levelLabel: 'Primaria Baja (1°-3°)',
    targetAge: '6-8 años (Primaria Baja)',
    description: 'Sigue las pistas para encontrar los tesoros históricos escondidos en las salas virreinales.',
    pdaNem: 'Fase 3 - Lenguajes / Ética: Búsqueda y descubrimiento guiado de reliquias y patrimonio cívico.',
    campoFormativo: 'Lenguajes',
    badgeReward: { name: 'Explorador del Patrimonio', icon: '🏆', description: '¡Descubriste todos los tesoros de la historia patria!' },
    gamificationSettings: { timePerQuestion: 35, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 140, coinsReward: 25 },
    content: {
      title: 'Caza-Tesoros en el Museo de la Independencia',
      description: 'Sigue las pistas para encontrar las reliquias de los héroes.',
      questions: [
        { question: 'Pista del Tesoro 1: "Fue tejida con seda y bordada con oro, tiene la imagen guadalupana y guió a los campesinos en 1810." ¿Qué tesoro es?', options: ['El Estandarte Insurgente de Atotonilco', 'La corona de Fernando VII', 'El manto del virrey', 'La capa de Napoleón'], correctIndex: 0 },
        { question: 'Pista del Tesoro 2: "Es de bronce, estuvo en el campanario de Dolores y sonó a las cinco de la mañana." ¿Qué tesoro es?', options: ['La Campana de Dolores', 'El cañón "El Niño"', 'La espada de Allende', 'El cáliz de oro'], correctIndex: 0 },
        { question: 'Pista del Tesoro 3: "Es de tela de seda con tres franjas diagonales (blanco, verde y rojo) y tres estrellas doradas." ¿Qué tesoro es?', options: ['La Bandera del Ejército Trigarante de 1821', 'El escudo azteca', 'La bandera de Morelos con el águila y puente', 'El pendón real'], correctIndex: 0 },
        { question: 'Pista del Tesoro 4: "Fue usado por José María Morelos en su cabeza para protegerse del sol y de sus intensos dolores de cabeza." ¿Qué tesoro es?', options: ['El paliacate de seda de Morelos', 'Un sombrero de plumas', 'Un casco de acero', 'Una tiara de oro'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-tesoro-2',
    templateType: 'treasure_hunt',
    title: 'Búsqueda de Evidencias de la Constitución de Cádiz y Apatzingán',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Encuentra las pistas jurídicas y cartas secretas que dieron origen al constitucionalismo mexicano.',
    pdaNem: 'Nivel Medio Superior - Historia y Derecho: Investigación documental de fuentes jurídicas históricas.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Investigador Documental', icon: '🔎', description: 'Localizaste todos los manuscritos y decretos fundacionales.' },
    gamificationSettings: { timePerQuestion: 25, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 230, coinsReward: 45 },
    content: {
      title: 'Búsqueda de Evidencias de la Constitución de Cádiz y Apatzingán',
      description: 'Sigue las pistas documentales de los archivos históricos.',
      questions: [
        { question: 'Pista 1: "Fue redactado en Apatzingán en octubre de 1814 inspirándose en la Constitución francesa de 1793 y la de Cádiz." ¿Qué documento es?', options: ['El Decreto Constitucional para la Libertad de la América Mexicana', 'El Código Civil Francés', 'Las Siete Leyes', 'La Constitución de 1857'], correctIndex: 0 },
        { question: 'Pista 2: "Manuscrito firmado en el Palacio de los Condes de San Mateo de Valparaíso el 28 de septiembre de 1821." ¿Qué acta histórica es?', options: ['El Acta de Independencia del Imperio Mexicano', 'El Tratado de Tlatelolco', 'El Plan de Ayutla', 'Las Leyes de Indias'], correctIndex: 0 },
        { question: 'Pista 3: "Periódico clandestino editado por José María Cos que se imprimía con tipos móviles de madera tallados a mano." ¿Qué publicación es?', options: ['El Ilustrador Americano', 'El Sol de México', 'El Ahuizote', 'La Jornada'], correctIndex: 0 },
        { question: 'Pista 4: "Colección de cartas y manifiestos de Fray Servando Teresa de Mier defendiendo la legitimidad del autogobierno americano." ¿En qué ciudad europea fueron publicadas?', options: ['Londres (Inglaterra)', 'París (Francia)', 'Madrid (España)', 'Roma (Italia)'], correctIndex: 0 }
      ]
    }
  },

  // ==========================================
  // 20. DESAFÍO DE CLASIFICACIÓN (PUZZLE / CATEGORÍAS)
  // ==========================================
  {
    id: 'indep-clasificacion-1',
    templateType: 'clasificacion',
    title: 'Clasifica a Insurgentes, Realistas y Símbolos Patrios',
    level: 'primaria_alta',
    levelLabel: 'Primaria Alta (4°-6°)',
    targetAge: '10-12 años (Primaria Alta)',
    description: 'Arrastra y agrupa cada elemento en su categoría correspondiente: Bando Insurgente, Bando Realista o Símbolo Cívico.',
    pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Clasifica actores y símbolos de la historia nacional según su función social e histórica.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Clasificador Magistral', icon: '🗂️', description: '¡Agrupaste a la perfección todos los bandos y símbolos patrios!' },
    gamificationSettings: { timePerQuestion: 35, lives: 3, streakMultiplier: true, passScorePercentage: 75, xpBaseReward: 160, coinsReward: 30 },
    content: {
      title: 'Clasifica a Insurgentes, Realistas y Símbolos Patrios',
      description: 'Clasifica a qué grupo o bando corresponde cada personaje o elemento.',
      questions: [
        { question: '¿A qué grupo pertenecía el cura Don Miguel Hidalgo y Costilla?', options: ['Bando Insurgente (Luchadores por la Libertad)', 'Bando Realista (Defensores de la Corona)', 'Símbolo Cívico Material', 'Gobernador Extranjero'], correctIndex: 0 },
        { question: '¿A qué grupo pertenecía el general Félix María Calleja del Rey?', options: ['Bando Realista (Defensores de la Corona)', 'Bando Insurgente (Luchadores por la Libertad)', 'Símbolo Cívico Material', 'Periodista Independiente'], correctIndex: 0 },
        { question: '¿A qué grupo pertenece la Campana de Dolores ubicada en el Palacio Nacional?', options: ['Símbolo Cívico y Reliquia Histórica', 'Bando Realista', 'Bando Insurgente', 'Documento Escrito'], correctIndex: 0 },
        { question: '¿A qué grupo pertenecía Doña Josefa Ortiz de Domínguez?', options: ['Bando Insurgente (Conspiradora Heroica)', 'Bando Realista (Virreina)', 'Símbolo Cívico Material', 'Guardia de la Corona'], correctIndex: 0 }
      ]
    }
  },
  {
    id: 'indep-clasificacion-2',
    templateType: 'clasificacion',
    title: 'Clasificación de Factores: Reformas, Ilustración y Crisis Imperial',
    level: 'preparatoria',
    levelLabel: 'Preparatoria (1°-3°)',
    targetAge: '15-18 años (Preparatoria)',
    description: 'Clasifica las causas de la Independencia en: Causas Internas, Causas Externas o Documentos Ideológicos.',
    pdaNem: 'Nivel Medio Superior - Historia: Clasificación multicausal de procesos históricos complejos.',
    campoFormativo: 'Ética, Naturaleza y Sociedades',
    badgeReward: { name: 'Taxónomo Histórico', icon: '📊', description: 'Clasificación multicausal precisa de la crisis novohispana.' },
    gamificationSettings: { timePerQuestion: 30, lives: 3, streakMultiplier: true, passScorePercentage: 80, xpBaseReward: 220, coinsReward: 45 },
    content: {
      title: 'Clasificación de Factores: Reformas, Ilustración y Crisis Imperial',
      description: 'Agrupa cada proceso histórico en su ámbito causal correspondiente.',
      questions: [
        { question: 'La expulsión de la orden de los Jesuitas en 1767 y el cobro excesivo de impuestos de la corona española:', options: ['Causa Interna (Descontento novohispano y Reformas Borbónicas)', 'Causa Externa (Conflicto europeo)', 'Documento Constitucional', 'Tratado Internacional'], correctIndex: 0 },
        { question: 'La Declaración de Independencia de las 13 Colonias de Norteamérica (1776) y la Revolución Francesa (1789):', options: ['Causa Externa (Ejemplo emancipador y pensamiento ilustrado)', 'Causa Interna (Crisis agrícola local)', 'Batalla del Bajío', 'Decreto novohispano'], correctIndex: 0 },
        { question: 'Los "Sentimientos de la Nación" redactados por José María Morelos y Pavón en 1813:', options: ['Documento Político y Proyecto de Nación Insurgente', 'Causa Externa europea', 'Tratado de rendición', 'Bando militar realista'], correctIndex: 0 },
        { question: 'La invasión napoleónica a la península ibérica y el secuestro del rey Fernando VII en 1808:', options: ['Causa Externa (Crisis de legitimidad y vacío de poder imperial)', 'Causa Interna mexicana', 'Pacto de Acatempan', 'Grito de Dolores'], correctIndex: 0 }
      ]
    }
  }
];

/**
 * Función utilitaria para transformar un preset de Independencia en una CommunityActivity lista para la Comunidad Docente.
 * Sitúa la Clase Magistral del Prof. Israel López Ángeles como la primera y principal actividad destacada.
 */
export function getIndependenceCommunityActivities(): CommunityActivity[] {
  const masterclass: CommunityActivity = {
    id: '18101821-cafe-4000-8000-000000000001',
    teacher_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
    title: 'La Gesta Heroica de la Independencia de México (1810 - 1821)',
    template_type: 'custom_builder',
    content_json: {
      title: 'La Gesta Heroica de la Independencia de México (1810 - 1821)',
      description: 'Clase magistral interactiva y gamificada. Recorre las 4 etapas de la lucha armada mediante diálogo inmersivo con Miguel Hidalgo, reto cronológico de etapas, emparejamiento táctico de próceres, acertijo de escape room de la conspiración, combate épico en Monte de las Cruces y el Cofre Legendario de la Patria.',
      subject: 'Historia y Formación Cívica',
      targetAge: 'Primaria Alta y Secundaria (10 - 15 años)',
      faseNem: 'Fase 5',
      campoFormativo: 'Ética, Naturaleza y Sociedades',
      pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza las causas y las cuatro etapas del movimiento de Independencia de la Nueva España, valorando el ideario de los Sentimientos de la Nación y los derechos de soberanía e igualdad.',
      metadata: MEXICAN_INDEPENDENCE_METADATA,
      blocks: MEXICAN_INDEPENDENCE_BLOCKS,
      connections: MEXICAN_INDEPENDENCE_CONNECTIONS,
    } as any,
    upvotes: 980,
    created_at: new Date().toISOString(),
    teacher_name: 'Prof. Israel López Ángeles',
    user_has_voted: false
  };

  const cognitiveHeroesActivity: CommunityActivity = {
    id: '18101821-cafe-4000-8000-000000000002',
    teacher_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
    title: 'Gimnasio Cerebral: Héroes y Heroínas de la Independencia',
    template_type: 'custom_builder',
    content_json: {
      title: 'Gimnasio Cerebral: Héroes y Heroínas de la Independencia',
      description: 'Entrenamiento cognitivo de alto rendimiento: comprensión lectora rápida (PPM), inferencia textual, discriminación de información y lógica histórica. Descubre las decisiones estratégicas de Leona Vicario, Miguel Hidalgo, José María Morelos y Vicente Guerrero.',
      subject: 'Historia, Formación Cívica y Lenguajes',
      targetAge: 'Primaria Alta (10 - 12 años • 5° y 6° Grado)',
      faseNem: 'Fase 5',
      campoFormativo: 'Ética, Naturaleza y Sociedades',
      pdaNem: 'Fase 5 - Ética, Naturaleza y Sociedades: Analiza críticamente los proyectos de nación e ideales de los héroes y heroínas de la Independencia, valorando el papel histórico de las mujeres insurgentes y la defensa de la justicia social.',
      metadata: HEROES_COGNITIVE_METADATA,
      blocks: HEROES_COGNITIVE_BLOCKS,
      connections: HEROES_COGNITIVE_CONNECTIONS,
    } as any,
    upvotes: 920,
    created_at: new Date(Date.now() - 1800000).toISOString(),
    teacher_name: 'Prof. Israel López Ángeles',
    user_has_voted: false
  };

  const standardGames = MEXICAN_INDEPENDENCE_GAMES.map((game, index) => ({
    id: `indep-comm-${game.id}`,
    teacher_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
    title: game.title,
    template_type: game.templateType,
    content_json: game.content,
    upvotes: 45 + ((index * 7) % 35),
    created_at: new Date(Date.now() - (index * 86400000)).toISOString(),
    teacher_name: 'Prof. Israel López Ángeles',
    user_has_voted: false
  }));

  return [masterclass, cognitiveHeroesActivity, ...standardGames];
}
