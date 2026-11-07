import { LanguageCode } from '@/store/useLanguagesStore';

export interface CeltaConceptQuestion {
  id: string;
  questionTarget: string;
  questionEs: string;
  expectedAnswer: string;
}

export interface SpanishInterferenceAlert {
  phonemeOrRule: string;
  wrongHabitEs: string;
  correctArticulationEs: string;
  exampleWords: string[];
  mirrorId: string;
}

export interface CeltaPocketGuide {
  id: string;
  language: LanguageCode;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  lessonFocus: string;
  ccqQuestions: CeltaConceptQuestion[];
  icqInstruction: string;
  spanishInterference: SpanishInterferenceAlert;
  pairWorkStarters: string[];
}

export interface ContrastivePhoneticMirror {
  id: string;
  language: LanguageCode;
  phonemeSymbol: string;
  shortLabel: string;
  title: string;
  subtitle: string;
  diagramSrc: string;
  wrongHabitTitle: string;
  wrongHabitDescription: string;
  correctPositionTitle: string;
  correctPositionDescription: string;
  targetWords: { word: string; ipa: string; translationEs: string }[];
  demoSentence: string;
  demoSentenceEs: string;
}

export interface WritingRecipeTemplate {
  id: string;
  language: LanguageCode;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  cenniBand: string;
  badgeLabel: string;
  title: string;
  promptInstructionEs: string;
  sampleStudentName: string;
  sampleDraft: string;
  positiveConnectors: string[];
  grammarSuggestions: {
    phrase: string;
    suggestionEs: string;
  }[];
  vocabularyBank: { word: string; translationEs: string }[];
  targetConnectors: { connector: string; usageEs: string }[];
  selfCheckList: string[];
}

export interface StarRubricCriterion {
  id: 'content' | 'communicative' | 'organization' | 'grammar';
  number: number;
  titleEs: string;
  subtitleEs: string;
}

export const OFFICIAL_STAR_RUBRIC_CRITERIA: StarRubricCriterion[] = [
  {
    id: 'content',
    number: 1,
    titleEs: '1. Contenido y Cumplimiento de la Tarea',
    subtitleEs: 'Relevancia, desarrollo del tema y extensión solicitada',
  },
  {
    id: 'communicative',
    number: 2,
    titleEs: '2. Logro Comunicativo y Registro',
    subtitleEs: 'Tono cortés/formal adecuado al destinatario y claridad de intención',
  },
  {
    id: 'organization',
    number: 3,
    titleEs: '3. Organización y Uso de Conectores',
    subtitleEs: 'Cohesión lógica entre oraciones y estructura en párrafos',
  },
  {
    id: 'grammar',
    number: 4,
    titleEs: '4. Precisión Gramatical y Rango Léxico',
    subtitleEs: 'Variedad de vocabulario del nivel y control de tiempos verbales',
  },
];

export const CONTRASTIVE_PHONETIC_MIRRORS: ContrastivePhoneticMirror[] = [
  {
    id: 'th_interdental',
    language: 'en',
    phonemeSymbol: '/θ/ & /ð/',
    shortLabel: '/θ/ Think & Thank you',
    title: 'Sonido Interdental /θ/: "Think, Three, Thank you"',
    subtitle: 'Contraste articulatorio directo entre la /t/ o /s/ del español y la /θ/ inglesa',
    diagramSrc: '/images/languages/phonetics/articulatory_th_interdental.webp',
    wrongHabitTitle: '❌ Hábito en Español (Incorrecto)',
    wrongHabitDescription:
      'Decir "Tank you" o "Sank you" dejando la punta de la lengua escondida detrás de los dientes superiores.',
    correctPositionTitle: '✅ Posición Correcta en Inglés (/θ/)',
    correctPositionDescription:
      'Coloca la punta de la lengua suavemente entre los dientes superiores e inferiores y sopla aire continuo: "TH-ank you", "TH-ree", "TH-ink".',
    targetWords: [
      { word: 'Thank you', ipa: '/ˈθæŋk juː/', translationEs: 'Gracias' },
      { word: 'Three', ipa: '/θriː/', translationEs: 'Tres' },
      { word: 'Think', ipa: '/θɪŋk/', translationEs: 'Pensar' },
      { word: 'Thursday', ipa: '/ˈθɜːrzdeɪ/', translationEs: 'Jueves' },
    ],
    demoSentence: 'Good morning! Welcome to our class, three students think thank you is polite.',
    demoSentenceEs: '¡Buenos días! Bienvenidos a nuestra clase, tres alumnos piensan que dar las gracias es cortés.',
  },
  {
    id: 'short_u_would',
    language: 'en',
    phonemeSymbol: '/ʊ/ & L Muda',
    shortLabel: '/wʊd/ Would & Could',
    title: 'Vocal Relajada /ʊ/ y "L" Muda: "Would, Could, Should"',
    subtitle: 'Cómo evitar pronunciar la letra "L" en verbos modales de cortesía',
    diagramSrc: '/images/languages/phonetics/articulatory_short_u_would.webp',
    wrongHabitTitle: '❌ Hábito en Español (Incorrecto)',
    wrongHabitDescription:
      'Subir la lengua al paladar para pronunciar la letra "L" ("Wuld") o proyectar los labios demasiado tensos.',
    correctPositionTitle: '✅ Posición Correcta en Inglés (/wʊd/)',
    correctPositionDescription:
      'Labios ligeramente redondeados y relajados; la lengua descansa abajo sin tocar el paladar. La "L" es 100% muda y rima con "Good".',
    targetWords: [
      { word: 'Would', ipa: '/wʊd/', translationEs: 'Quisiera / Gustaría (auxiliar)' },
      { word: 'Could', ipa: '/kʊd/', translationEs: 'Podría' },
      { word: 'Should', ipa: '/ʃʊd/', translationEs: 'Debería' },
      { word: 'Good', ipa: '/ɡʊd/', translationEs: 'Bueno' },
    ],
    demoSentence: 'Good morning! What would you like today? Could I have a hot chocolate, please?',
    demoSentenceEs: '¡Buenos días! ¿Qué le gustaría hoy? ¿Podría darme un chocolate caliente, por favor?',
  },
  {
    id: 'v_labiodental',
    language: 'en',
    phonemeSymbol: '/v/ vs /b/',
    shortLabel: '/v/ Very & Visit',
    title: 'Fricativa Labiodental /v/: "Very, Visit, Voice"',
    subtitle: 'Diferencia sonora entre la /b/ bilabial en español y la /v/ vibrante en inglés y francés',
    diagramSrc: '/images/languages/phonetics/articulatory_v_labiodental.webp',
    wrongHabitTitle: '❌ Hábito en Español (/b/ Bilabial)',
    wrongHabitDescription:
      'Juntar ambos labios como al decir "Bueno" o "Beso", haciendo que "Very" suene como "Bery".',
    correctPositionTitle: '✅ Posición Correcta Labiodental (/v/)',
    correctPositionDescription:
      'Apoya suavemente los dientes superiores sobre el labio inferior y haz vibrar las cuerdas vocales dejando salir aire: "VVV-ery".',
    targetWords: [
      { word: 'Very', ipa: '/ˈveri/', translationEs: 'Muy' },
      { word: 'Visit', ipa: '/ˈvɪzɪt/', translationEs: 'Visitar' },
      { word: 'Every', ipa: '/ˈevri/', translationEs: 'Cada / Todos' },
      { word: 'Beverage', ipa: '/ˈbevərɪdʒ/', translationEs: 'Bebida' },
    ],
    demoSentence: 'Every visitor loves this very warm vanilla beverage in the morning.',
    demoSentenceEs: 'A cada visitante le encanta esta bebida tibia de vainilla por la mañana.',
  },
  {
    id: 'fr_u_nasal',
    language: 'fr',
    phonemeSymbol: '/y/ & /ɔ̃/ FLE',
    shortLabel: '/y/ Tu, Une & Bonjour',
    title: 'Vocal Anterior Redondeada /y/ y Nasales (Francés FLE)',
    subtitle: 'Técnica articulatoria para pronunciar la "u" francesa y enlaces en cafetería',
    diagramSrc: '/images/languages/phonetics/articulatory_fr_u_nasal.webp',
    wrongHabitTitle: '❌ Hábito en Español (/u/ Posterior)',
    wrongHabitDescription:
      'Retraer la lengua hacia atrás en la garganta como en la palabra española "Uno" o pronunciar la "N" final de "Bon".',
    correctPositionTitle: '✅ Posición Correcta en Francés (/y/)',
    correctPositionDescription:
      'Redondea los labios hacia adelante como si fueras a silbar una "U", pero empuja la lengua hacia los dientes inferiores diciendo "I".',
    targetWords: [
      { word: 'Tu / Une', ipa: '/ty/ · /yn/', translationEs: 'Tú / Una' },
      { word: 'Bonjour', ipa: '/bɔ̃.ʒuʁ/', translationEs: 'Buenos días' },
      { word: 'Je voudrais', ipa: '/ʒə vu.dʁɛ/', translationEs: 'Me gustaría / Quisiera' },
      { word: 'Croissant', ipa: '/kʁwa.sɑ̃/', translationEs: 'Cuernito francés' },
    ],
    demoSentence: 'Bonjour madame! Je voudrais un croissant croustillant et une tasse de chocolat.',
    demoSentenceEs: '¡Buenos días señora! Quisiera un cuernito crujiente y una taza de chocolate.',
  },
];

export function resolveCeltaPocketGuide(
  language: LanguageCode,
  level: 'A1' | 'A2' | 'B1' | 'B2',
  lessonTitle: string,
  firstDialogueText: string
): CeltaPocketGuide {
  const lower = `${lessonTitle} ${firstDialogueText}`.toLowerCase();

  if (language === 'fr') {
    if (lower.includes('napol') || lower.includes('code') || lower.includes('curie') || level === 'B2') {
      return {
        id: 'fr-hist-b2',
        language: 'fr',
        level,
        lessonFocus: 'Inmersión Histórica en 1ª Persona & Pasado Compuesto',
        ccqQuestions: [
          {
            id: 'ccq-fr-1',
            questionTarget: 'Est-ce que le personnage parle de sa propre vie au passé ou au futur ?',
            questionEs: '¿El personaje habla de su propia vida en pasado o en futuro?',
            expectedAnswer: 'En pasado ("J\'ai réorganisé...", "J\'ai isolé...") en 1ª persona.',
          },
          {
            id: 'ccq-fr-2',
            questionTarget: 'Utilise-t-on "Vous" pour marquer le respect historique ?',
            questionEs: '¿Usamos "Vous" para dirigirnos con respeto al personaje?',
            expectedAnswer: 'Sí, registro formal académico ("Comment avez-vous...").',
          },
        ],
        icqInstruction: 'En parejas (3 min): Uno interpreta al personaje histórico en 1ª persona y el otro realiza 2 preguntas.',
        spanishInterference: {
          phonemeOrRule: 'Vocal /y/ & Liaison Francesa',
          wrongHabitEs: 'Pronunciar la "-s" o "-t" final muda como en español.',
          correctArticulationEs: 'Mantener mudas las consonantes finales salvo cuando enlazan con vocal ("les_armées").',
          exampleWords: ['Bonjour', 'Vous avez', 'République'],
          mirrorId: 'fr_u_nasal',
        },
        pairWorkStarters: [
          '"Bonjour ! Je suis... et j\'ai découvert..."',
          '"Comment avez-vous réalisé... ?"',
          '"C\'est un honneur de parler avec vous !"',
        ],
      };
    }

    return {
      id: 'fr-cafe-a1',
      language: 'fr',
      level,
      lessonFocus: 'Cortesía en Brasserie ("Je voudrais" vs "Je veux")',
      ccqQuestions: [
        {
          id: 'ccq-fr-cafe-1',
          questionTarget: '"Je voudrais" est-il poli ou trop direct au restaurant ?',
          questionEs: '¿"Je voudrais" (Quisiera) es cortés o demasiado directo en una cafetería?',
          expectedAnswer: 'Muy cortés y educado (Condicional de cortesía).',
        },
        {
          id: 'ccq-fr-cafe-2',
          questionTarget: 'Quand dit-on "S\'il vous plaît" ?',
          questionEs: '¿En qué momento de la frase agregamos "S\'il vous plaît"?',
          expectedAnswer: 'Al final de nuestra petición para mostrar respeto.',
        },
      ],
      icqInstruction: 'Trabajo en parejas (3 min): Alumno A es el mesero en París y Alumno B pide una bebida y un pan.',
      spanishInterference: {
        phonemeOrRule: 'Sonido /v/ en "Vous / Voudrais" y /y/ en "Une"',
        wrongHabitEs: 'Pronunciar "Voudrais" con "B" española ("Boudrais") o "Une" como "Una".',
        correctArticulationEs: 'Rozar dientes superiores con el labio inferior en /v/ y redondear labios diciendo "i" para /y/.',
        exampleWords: ['Je voudrais', 'S\'il vous plaît', 'Croissant'],
        mirrorId: 'fr_u_nasal',
      },
      pairWorkStarters: [
        '"Bonjour ! Que désirez-vous aujourd\'hui ?"',
        '"Je voudrais un croissant et un café, s\'il vous plaît."',
        '"Très bien ! En terrasse ou à l\'intérieur ?"',
      ],
    };
  }

  // English (ESL)
  if (lower.includes('shakespeare') || lower.includes('lovelace') || lower.includes('lincoln')) {
    return {
      id: 'en-hist-b2',
      language: 'en',
      level,
      lessonFocus: 'Narrativa Biográfica en 1ª Persona & Pasado Simple',
      ccqQuestions: [
        {
          id: 'ccq-en-hist-1',
          questionTarget: 'Did this historical event happen in the past or is it happening now?',
          questionEs: '¿Esta obra histórica ocurrió en el pasado o está pasando ahora?',
          expectedAnswer: 'En el pasado terminado (Past Simple: "I crafted", "I wrote").',
        },
        {
          id: 'ccq-en-hist-2',
          questionTarget: 'Why does the mentor speak using "I" and "My"?',
          questionEs: '¿Por qué el personaje habla usando "I" (Yo) y "My" (Mi)?',
          expectedAnswer: 'Porque relata su propia vida directamente en primera persona.',
        },
      ],
      icqInstruction: 'En parejas (3 min): Entrevista al personaje histórico usando "Where did you...?" y "How did you...?".',
      spanishInterference: {
        phonemeOrRule: 'Sonido Interdental /θ/ en "Theatre / Thought"',
        wrongHabitEs: 'Decir "Teater" con /t/ dental en lugar de /θ/ interdental.',
        correctArticulationEs: 'Colocar la punta de la lengua suavemente entre los dientes y soplar aire: "TH-eatre".',
        exampleWords: ['Theatre', 'Thought', 'Three'],
        mirrorId: 'th_interdental',
      },
      pairWorkStarters: [
        '"Where were you born and what did you create?"',
        '"I crafted my greatest works in..."',
        '"What advice would you give to students today?"',
      ],
    };
  }

  return {
    id: 'en-cafe-a1',
    language: 'en',
    level,
    lessonFocus: 'Peticiones Corteses en Cafetería ("I would like...")',
    ccqQuestions: [
      {
        id: 'ccq-en-1',
        questionTarget: 'Is "I would like" formal/polite or casual?',
        questionEs: '1. ¿"I would like" es formal/cortés o demasiado informal?',
        expectedAnswer: 'Formal y cortés (mucho más educado que decir "I want").',
      },
      {
        id: 'ccq-en-2',
        questionTarget: 'Are we ordering right now in the café or in the past?',
        questionEs: '2. ¿Estamos pidiendo ahora mismo en el café o en el pasado?',
        expectedAnswer: 'Ahora mismo (presente conversacional de cortesía).',
      },
    ],
    icqInstruction: 'En parejas (3 min): Alumno A saluda en el café; Alumno B pide su bebida usando "I would like...".',
    spanishInterference: {
      phonemeOrRule: 'Letra "L" muda en "Would" (/wʊd/) y /θ/ en "Thank you"',
      wrongHabitEs: 'Evitar pronunciar "would" con la "l" sonora ("wuld") o decir "Tank you".',
      correctArticulationEs: 'En "would" (/wʊd/) la "L" es 100% muda y rima con "good". En "Thank you" saca ligeramente la punta de la lengua.',
      exampleWords: ['Would', 'Could', 'Thank you'],
      mirrorId: 'short_u_would',
    },
    pairWorkStarters: [
      '"Good morning! What would you like today?"',
      '"I would like a hot chocolate, please."',
      '"Small or large? Here you go!"',
    ],
  };
}

export const WRITING_STUDIO_RECIPES: WritingRecipeTemplate[] = [
  {
    id: 'recipe-en-cafe',
    language: 'en',
    level: 'A2',
    cenniBand: 'A2 Key · SEP CENNI Nivel 6',
    badgeLabel: '✉️ Correo o Reseña (A1/A2)',
    title: 'Reseña de Visita a una Cafetería / Correo Formal Corto',
    promptInstructionEs:
      'Redacta un párrafo de 35 a 50 palabras describiendo tu visita a una cafetería, qué ordenaste con "I would like" y por qué recomiendas el lugar.',
    sampleStudentName: 'Sofía Ramírez Morales · 2º A',
    sampleDraft:
      'Yesterday I visited the Royal Orchard Café with my family. First of all, the hot chocolate and the blueberry muffin were delicious. Furthermore, the waiter was very friendly and polite. I would like to order there again tomorrow!',
    positiveConnectors: ['First of all', 'Furthermore'],
    grammarSuggestions: [
      {
        phrase: 'I would like to order',
        suggestionEs: '¡Excelente estructura modal cortés! Recuerda que también puedes usar "I would love to visit".',
      },
    ],
    vocabularyBank: [
      { word: 'hot chocolate', translationEs: 'chocolate caliente' },
      { word: 'waiter / waitress', translationEs: 'mesero / mesera' },
      { word: 'delicious', translationEs: 'delicioso' },
      { word: 'friendly & polite', translationEs: 'amable y cortés' },
    ],
    targetConnectors: [
      { connector: 'First of all,', usageEs: 'En primer lugar (para iniciar tu idea)' },
      { connector: 'Furthermore,', usageEs: 'Además (para sumar una cualidad positiva)' },
      { connector: 'In conclusion,', usageEs: 'En conclusión (para cerrar tu recomendación)' },
    ],
    selfCheckList: [
      'Puntuación y mayúsculas correctas al inicio de cada oración',
      'Uso de al menos 2 conectores de secuencia o adición',
      'Inclusión de la estructura cortés "I would like"',
    ],
  },
  {
    id: 'recipe-en-story',
    language: 'en',
    level: 'B1',
    cenniBand: 'B1 Preliminary · SEP CENNI Nivel 9',
    badgeLabel: '📖 Historia Corta (B1)',
    title: 'Anécdota de un Viaje o Descubrimiento Escolar',
    promptInstructionEs:
      'Escribe una historia breve (60–80 palabras) sobre un día inolvidable en la escuela o en un museo, combinando Past Simple y conectores de contraste.',
    sampleStudentName: 'Mateo Hernández · 2º A',
    sampleDraft:
      'Last Friday our class visited the Science Museum in London. First of all, we explored the astronomy hall and asked questions. Although the weather outside was rainy, we had a wonderful time learning together. In conclusion, it was an unforgettable day.',
    positiveConnectors: ['First of all', 'Although', 'In conclusion'],
    grammarSuggestions: [
      {
        phrase: 'we had a wonderful time',
        suggestionEs: 'Uso natural de colocación en pasado simple ("have a wonderful time").',
      },
    ],
    vocabularyBank: [
      { word: 'unforgettable', translationEs: 'inolvidable' },
      { word: 'science fair', translationEs: 'feria de ciencias' },
      { word: 'wonderful time', translationEs: 'momento maravilloso' },
      { word: 'discover', translationEs: 'descubrir' },
    ],
    targetConnectors: [
      { connector: 'Although', usageEs: 'Aunque (contraste de ideas)' },
      { connector: 'However,', usageEs: 'Sin embargo' },
      { connector: 'In conclusion,', usageEs: 'En conclusión' },
    ],
    selfCheckList: [
      'Verbos en pasado simple conjugados correctamente (visited, had)',
      'Al menos 1 conector de contraste (Although / However)',
      'Párrafo con introducción, desarrollo y cierre claro',
    ],
  },
  {
    id: 'recipe-en-essay',
    language: 'en',
    level: 'B2',
    cenniBand: 'B2 First · SEP CENNI Nivel 12',
    badgeLabel: '⚖️ Ensayo de Opinión (B2)',
    title: 'Carta Formal / Ensayo sobre Aprendizaje de Idiomas y Tecnología',
    promptInstructionEs:
      'Redacta un texto formal (80–110 palabras) expresando por qué practicar conversación oral todos los días transforma el futuro académico de los estudiantes.',
    sampleStudentName: 'Valentina Torres · 2º A',
    sampleDraft:
      'Dear Mr. Harrison, I am writing to express my strong interest in joining the international debate club next Friday. Furthermore, our team has prepared an interactive presentation on bilingual communication. On the other hand, we believe daily speaking practice builds confidence. I would appreciate your confirmation.',
    positiveConnectors: ['Furthermore', 'On the other hand', 'I would appreciate'],
    grammarSuggestions: [
      {
        phrase: 'express my strong interest in joining',
        suggestionEs: 'Estructura preposicional avanzada B2 ("interest in + verbo -ing") correctamente aplicada.',
      },
    ],
    vocabularyBank: [
      { word: 'express my interest', translationEs: 'expresar mi interés' },
      { word: 'interactive presentation', translationEs: 'presentación interactiva' },
      { word: 'builds confidence', translationEs: 'construye confianza' },
      { word: 'confirmation', translationEs: 'confirmación' },
    ],
    targetConnectors: [
      { connector: 'Furthermore,', usageEs: 'Además (registro formal)' },
      { connector: 'On the other hand,', usageEs: 'Por otra parte (contraste formal)' },
      { connector: 'I would appreciate', usageEs: 'Agradecería mucho (cierre cortés)' },
    ],
    selfCheckList: [
      'Saludo y despedida en registro formal (Dear Mr. ...)',
      'Uso correcto de gerundio tras preposición (in joining)',
      'Conectores argumentativos de nivel B1/B2',
    ],
  },
  {
    id: 'recipe-fr-cafe',
    language: 'fr',
    level: 'A2',
    cenniBand: 'DELF A2 · SEP CENNI Nivel 6',
    badgeLabel: '✉️ Message Brasserie (A1/A2)',
    title: 'Carte Postale / Critique d\'un Café à Paris (FLE)',
    promptInstructionEs:
      'Escribe un mensaje corto en francés (35–50 palabras) contando tu visita a una brasserie parisina y lo que pediste con "Je voudrais".',
    sampleStudentName: 'Camila Regina Villaseñor · 2º A',
    sampleDraft:
      'Hier, j\'ai visité une belle brasserie à Paris avec mes amis. D\'abord, le croissant chaud et le chocolat étaient délicieux. De plus, le serveur était très sympathique. Je voudrais revenir demain matin !',
    positiveConnectors: ['D\'abord', 'De plus'],
    grammarSuggestions: [
      {
        phrase: 'Je voudrais revenir',
        suggestionEs: 'Excelente uso del condicional de cortesía seguido de infinitivo en francés.',
      },
    ],
    vocabularyBank: [
      { word: 'le croissant chaud', translationEs: 'el cuernito caliente' },
      { word: 'délicieux', translationEs: 'delicioso' },
      { word: 'le serveur', translationEs: 'el mesero' },
      { word: 'sympathique', translationEs: 'amable / simpático' },
    ],
    targetConnectors: [
      { connector: 'D\'abord,', usageEs: 'Primero / En primer lugar' },
      { connector: 'De plus,', usageEs: 'Además' },
      { connector: 'Enfin,', usageEs: 'Finalmente' },
    ],
    selfCheckList: [
      'Acentos gráficos franceses correctos (é, è, à)',
      'Uso de conectores (D\'abord, De plus)',
      'Concordancia en plural (étaient délicieux)',
    ],
  },
];

// Palabras clave para resaltar sílaba tónica de forma visual e intuitiva en el Modo Pizarrón
const STRESS_WORD_MAP: Record<string, string> = {
  morning: 'MORN-ing',
  welcome: 'WEL-come',
  today: 'to-DAY',
  like: 'LIKE',
  order: 'OR-der',
  chocolate: 'CHOC-olate',
  cappuccino: 'cap-puc-CI-no',
  blueberry: 'BLUE-ber-ry',
  muffin: 'MUF-fin',
  please: 'PLEASE',
  excellent: 'EX-cel-lent',
  prefer: 'pre-FER',
  beverage: 'BEV-er-age',
  perfect: 'PER-fect',
  thank: 'THANK',
  bonjour: 'bon-JOUR',
  bienvenue: 'bien-ve-NUE',
  brasserie: 'bras-se-RIE',
  voudrais: 'vou-DRAIS',
  croissant: 'crois-SANT',
  plaisir: 'plai-SIR',
};

export interface StressToken {
  raw: string;
  isStressed: boolean;
  display: string;
}

export function tokenizeDialogueWithStress(sentence: string): StressToken[] {
  const words = sentence.split(/\s+/);
  return words.map((token) => {
    const clean = token.replace(/[^a-zA-ZÀ-ÿ']/g, '').toLowerCase();
    const punctuationPrefix = token.match(/^[^a-zA-ZÀ-ÿ']+/)?.[0] || '';
    const punctuationSuffix = token.match(/[^a-zA-ZÀ-ÿ']+$/)?.[0] || '';
    if (STRESS_WORD_MAP[clean]) {
      return {
        raw: token,
        isStressed: true,
        display: `${punctuationPrefix}${STRESS_WORD_MAP[clean]}${punctuationSuffix}`,
      };
    }
    return {
      raw: token,
      isStressed: false,
      display: token,
    };
  });
}

