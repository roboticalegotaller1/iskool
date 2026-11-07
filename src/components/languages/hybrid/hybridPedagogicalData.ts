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
  levelTag: string;
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
  // ===========================================================================
  // ESPEJOS ARTICULATORIOS EN INGLÉS (ESL · CAMBRIDGE A1–B2)
  // ===========================================================================
  {
    id: 'th_interdental',
    language: 'en',
    levelTag: 'A1–A2',
    phonemeSymbol: '/θ/ & /ð/',
    shortLabel: '/θ/ Think & Thank you (A1)',
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
      { word: 'Through', ipa: '/θruː/', translationEs: 'A través de' },
    ],
    demoSentence: 'Good morning! Welcome to our class, three students think thank you is polite.',
    demoSentenceEs: '¡Buenos días! Bienvenidos a nuestra clase, tres alumnos piensan que dar las gracias es cortés.',
  },
  {
    id: 'short_u_would',
    language: 'en',
    levelTag: 'A1–A2',
    phonemeSymbol: '/ʊ/ & L Muda',
    shortLabel: '/wʊd/ Would & Could (A2)',
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
    levelTag: 'B1–B2',
    phonemeSymbol: '/v/ vs /b/',
    shortLabel: '/v/ Very & Visit (B1/B2)',
    title: 'Fricativa Labiodental /v/: "Very, Visit, Voice"',
    subtitle: 'Diferencia sonora entre la /b/ bilabial en español y la /v/ vibrante en inglés',
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

  // ===========================================================================
  // ESPEJOS ARTICULATORIOS EN FRANCÉS (FLE · DELF A1, A2, B1, B2)
  // ===========================================================================
  {
    id: 'fr_u_nasal',
    language: 'fr',
    levelTag: 'DELF A1',
    phonemeSymbol: '/y/ & /ɔ̃/ FLE',
    shortLabel: '/y/ Tu, Une & Bonjour (A1)',
    title: 'Vocal Anterior Redondeada /y/ y Nasales (Francés DELF A1)',
    subtitle: 'Técnica articulatoria para pronunciar la "u" francesa y vocales nasales en cafetería',
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
    demoSentence: 'Bonjour madame! Je voudrais un croissant chaud et une tasse de chocolat.',
    demoSentenceEs: '¡Buenos días señora! Quisiera un croissant caliente y una taza de chocolate.',
  },
  {
    id: 'fr_v_labiodental',
    language: 'fr',
    levelTag: 'DELF A2',
    phonemeSymbol: '/v/ & /ɥ/ FLE',
    shortLabel: '/v/ Voudrais & Huit (A2)',
    title: 'Labiodental /v/ y Semivocal /ɥ/: "Vous, Voudrais, Huit heures"',
    subtitle: 'Distinción esencial entre /b/ y /v/ en francés y articulación de horarios escolares',
    diagramSrc: '/images/languages/phonetics/articulatory_v_labiodental.webp',
    wrongHabitTitle: '❌ Hábito en Español (/b/ Bilabial)',
    wrongHabitDescription:
      'Pronunciar "Vous voudrais" juntando los dos labios ("Bous boudrais") o decir "Uit" como en español.',
    correctPositionTitle: '✅ Posición Correcta en Francés (/v/ & /ɥ/)',
    correctPositionDescription:
      'Apoya los incisivos superiores sobre el labio inferior para vibrar /v/ en "Voudrais, Vitesse, Voie", y proyecta labios en "Huit" /ɥit/.',
    targetWords: [
      { word: 'Je voudrais', ipa: '/ʒə vu.dʁɛ/', translationEs: 'Quisiera' },
      { word: 'Huit heures', ipa: '/ɥi.t‿œʁ/', translationEs: 'Ocho horas / Las ocho' },
      { word: 'Grande vitesse', ipa: '/ɡʁɑ̃d vi.tɛs/', translationEs: 'Alta velocidad' },
      { word: 'Bon voyage', ipa: '/bɔ̃ vwa.jaʒ/', translationEs: 'Buen viaje' },
    ],
    demoSentence: 'Notre séance au laboratoire commence à huit heures et je voudrais réserver deux billets.',
    demoSentenceEs: 'Nuestra sesión en el laboratorio comienza a las ocho y quisiera reservar dos boletos.',
  },
  {
    id: 'fr_r_uvular',
    language: 'fr',
    levelTag: 'DELF B1',
    phonemeSymbol: '/ʁ/ & Liaison',
    shortLabel: '/ʁ/ Laboratoire & Liaison (B1)',
    title: 'Fricativa Uvular /ʁ/ y Liaison Obligatoria (Francés DELF B1)',
    subtitle: 'Cómo producir la "R" francesa suave en la garganta y enlazar palabras con vocal',
    diagramSrc: '/images/languages/phonetics/articulatory_fr_u_nasal.webp',
    wrongHabitTitle: '❌ Hábito en Español (Vibrante Alveolar)',
    wrongHabitDescription:
      'Golpear la punta de la lengua contra el paladar como en "Perro" o cortar las palabras sin enlazar la "-s" con la vocal siguiente.',
    correctPositionTitle: '✅ Posición Correcta en Francés (/ʁ/ + [z])',
    correctPositionDescription:
      'Deja la punta de la lengua pegada abajo detrás de los dientes inferiores y vibra suavemente el velo del paladar: "La-bo-ʁa-twaʁ".',
    targetWords: [
      { word: 'Laboratoire', ipa: '/la.bɔ.ʁa.twaʁ/', translationEs: 'Laboratorio' },
      { word: 'Les élèves', ipa: '/le.z‿e.lɛv/', translationEs: 'Los alumnos (con liaison)' },
      { word: 'Énergies', ipa: '/e.nɛʁ.ʒi/', translationEs: 'Energías' },
      { word: 'Radium', ipa: '/ʁa.djɔm/', translationEs: 'Radio (elemento)' },
    ],
    demoSentence: 'Bonjour les élèves! Dans mon laboratoire à Paris nous analysons les énergies durables.',
    demoSentenceEs: '¡Buenos días alumnos! En mi laboratorio en París analizamos las energías sostenibles.',
  },
  {
    id: 'fr_liaison_muettes',
    language: 'fr',
    levelTag: 'DELF B2',
    phonemeSymbol: 'Finales Muettes',
    shortLabel: 'Consonantes Mudas & B2',
    title: 'Consonantes Finales Mudas y Elocución Académica (DELF B2)',
    subtitle: 'Regla de oro "CaReFuL": qué letras finales nunca suenan en francés culto',
    diagramSrc: '/images/languages/phonetics/articulatory_short_u_would.webp',
    wrongHabitTitle: '❌ Hábito en Español (Pronunciar Todo)',
    wrongHabitDescription:
      'Pronunciar la "-s", "-t", "-d", "-p" al final de "Français", "Beaucoup", "Croissant" o "Tout".',
    correctPositionTitle: '✅ Posición Correcta en Francés (Final Muda)',
    correctPositionDescription:
      'Termina la palabra en la vocal o nasal anterior sin cerrar los labios ni tocar dientes en "-t", "-s", "-p": "Beaucoup" = /bo.ku/.',
    targetWords: [
      { word: 'Beaucoup', ipa: '/bo.ku/', translationEs: 'Mucho ("p" muda)' },
      { word: 'Français', ipa: '/fʁɑ̃.sɛ/', translationEs: 'Francés ("s" muda)' },
      { word: 'Tout à fait', ipa: '/tu.t‿a fɛ/', translationEs: 'Totalmente ("t" final muda)' },
      { word: 'Code civil', ipa: '/kɔd si.vil/', translationEs: 'Código Civil' },
    ],
    demoSentence: 'Je suis Napoléon Bonaparte et j’ai promulgué le Code civil des Français avec beaucoup de clarté.',
    demoSentenceEs: 'Soy Napoleón Bonaparte y promulgué el Código Civil de los franceses con mucha claridad.',
  },
];

export function resolveCeltaPocketGuide(
  language: LanguageCode,
  level: 'A1' | 'A2' | 'B1' | 'B2',
  lessonTitle: string,
  firstDialogueText: string
): CeltaPocketGuide {
  const lower = `${lessonTitle} ${firstDialogueText}`.toLowerCase();

  // ===========================================================================
  // GUÍAS DIDÁCTICAS FRANCÉS (FLE · ALLIANCE FRANÇAISE DELF A1, A2, B1, B2)
  // ===========================================================================
  if (language === 'fr') {
    if (
      lower.includes('napol') ||
      lower.includes('code') ||
      lower.includes('curie') ||
      lower.includes('hugo') ||
      lower.includes('jeanne') ||
      level === 'B2'
    ) {
      return {
        id: 'fr-hist-b2',
        language: 'fr',
        level,
        lessonFocus: 'Inmersión Histórica en 1ª Persona & Passé Composé (DELF B1/B2)',
        ccqQuestions: [
          {
            id: 'ccq-fr-1',
            questionTarget: 'Est-ce que le personnage parle de sa propre vie au passé ou au futur ?',
            questionEs: '1. ¿El personaje habla de su propia vida en pasado o en futuro?',
            expectedAnswer: 'En pasado ("J\'ai découvert...", "J\'ai promulgué...") en 1ª persona.',
          },
          {
            id: 'ccq-fr-2',
            questionTarget: 'Utilise-t-on "Vous" pour marquer le respect historique ?',
            questionEs: '2. ¿Usamos "Vous" para dirigirnos con respeto al personaje?',
            expectedAnswer: 'Sí, registro formal académico ("Où êtes-vous né ?").',
          },
        ],
        icqInstruction:
          'En parejas (3 min): Uno interpreta al personaje histórico en 1ª persona y el otro realiza 2 preguntas.',
        spanishInterference: {
          phonemeOrRule: 'Consonantes Finales Mudas & Liaison Francesa',
          wrongHabitEs: 'Pronunciar la "-s", "-t" o "-p" final muda como en español.',
          correctArticulationEs:
            'Mantener mudas las consonantes finales ("Français" /fʁɑ̃sɛ/) salvo cuando enlazan con vocal ("les_élèves").',
          exampleWords: ['Français', 'J\'ai découvert', 'Code civil'],
          mirrorId: 'fr_liaison_muettes',
        },
        pairWorkStarters: [
          '"Bonjour ! Je suis... et j\'ai découvert..."',
          '"Où êtes-vous né et qu\'avez-vous créé ?"',
          '"C\'est un honneur de parler avec vous !"',
        ],
      };
    }

    if (lower.includes('écologie') || lower.includes('scientifique') || lower.includes('durable') || level === 'B1') {
      return {
        id: 'fr-eco-b1',
        language: 'fr',
        level: 'B1',
        lessonFocus: 'Argumentación y Opinión en Francés ("À mon avis, il est essentiel que...")',
        ccqQuestions: [
          {
            id: 'ccq-fr-b1-1',
            questionTarget: 'Après "Il est essentiel que", utilise-t-on l\'indicatif ou le subjonctif ?',
            questionEs: '1. ¿Después de "Il est essentiel que" expresamos una certeza o una necesidad?',
            expectedAnswer: 'Una necesidad/obligación (requiere subjuntivo: "que chaque citoyen réduise").',
          },
          {
            id: 'ccq-fr-b1-2',
            questionTarget: 'Que signifie "À mon avis" au début de la phrase ?',
            questionEs: '2. ¿Para qué sirve el conector "À mon avis" al iniciar tu intervención?',
            expectedAnswer: 'Para introducir tu opinión personal de forma estructurada (DELF B1).',
          },
        ],
        icqInstruction:
          'En parejas (3 min): Alumno A plantea un reto ecológico del colegio y Alumno B propone una solución con "À mon avis...".',
        spanishInterference: {
          phonemeOrRule: 'Fricativa Uvular /ʁ/ y Liaison en Plural [z]',
          wrongHabitEs: 'Pronunciar la "R" de "Renouvelables" con vibración fuerte de lengua como en español.',
          correctArticulationEs:
            'Mantener la punta de la lengua abajo y producir una fricción suave en la garganta (/ʁ/), enlazando "les_énergies".',
          exampleWords: ['Les énergies', 'Laboratoire', 'Durable'],
          mirrorId: 'fr_r_uvular',
        },
        pairWorkStarters: [
          '"À mon avis, il est essentiel de protéger..."',
          '"Tout à fait ! Grâce à la science, nous pouvons..."',
          '"Quelle solution proposes-tu pour notre collège ?"',
        ],
      };
    }

    if (lower.includes('gare') || lower.includes('tgv') || lower.includes('voyage') || level === 'A2') {
      return {
        id: 'fr-voyage-a2',
        language: 'fr',
        level: 'A2',
        lessonFocus: 'Compra de Boletos en Estación y Orientación ("Aller-retour / Sur quel quai")',
        ccqQuestions: [
          {
            id: 'ccq-fr-a2-1',
            questionTarget: 'Un billet "aller-retour", est-ce seulement pour partir ou pour partir et revenir ?',
            questionEs: '1. ¿Un boleto "aller-retour" es solo de ida o de ida y vuelta?',
            expectedAnswer: 'De ida y vuelta (viaje redondo en tren TGV).',
          },
          {
            id: 'ccq-fr-a2-2',
            questionTarget: 'Que signifie "la voie numéro quatre" à la gare ?',
            questionEs: '2. ¿Qué significa "la voie numéro quatre" en la estación de tren?',
            expectedAnswer: 'El andén o vía número cuatro de donde sale el tren.',
          },
        ],
        icqInstruction:
          'En parejas (3 min): Alumno A está en la taquilla de Gare de Lyon y Alumno B compra 2 boletos en TGV.',
        spanishInterference: {
          phonemeOrRule: 'Sonido Labiodental /v/ en "Vitesse, Voie, Voyage"',
          wrongHabitEs: 'Pronunciar "Voyage" y "Voie" con la "B" bilabial española ("Boyage").',
          correctArticulationEs:
            'Apoyar los dientes superiores sobre el labio inferior para que vibre la /v/ francesa.',
          exampleWords: ['Bon voyage', 'Grande vitesse', 'La voie'],
          mirrorId: 'fr_v_labiodental',
        },
        pairWorkStarters: [
          '"Bonjour ! Quelle est votre destination aujourd\'hui ?"',
          '"Je voudrais deux billets aller-retour pour Lyon, s\'il vous plaît."',
          '"Le train part de la voie numéro quatre. Bon voyage !"',
        ],
      };
    }

    if (lower.includes('collège') || lower.includes('emploi du temps') || lower.includes('laboratoire')) {
      return {
        id: 'fr-college-a1',
        language: 'fr',
        level: 'A1',
        lessonFocus: 'Horarios Escolares y Materias en Francés ("À quelle heure commence... ?")',
        ccqQuestions: [
          {
            id: 'ccq-fr-col-1',
            questionTarget: 'Quand on dit "à huit heures du matin", parle-t-on d\'un horaire précis ?',
            questionEs: '1. ¿"À huit heures du matin" indica una hora exacta del horario escolar?',
            expectedAnswer: 'Sí, a las 8:00 de la mañana en punto.',
          },
          {
            id: 'ccq-fr-col-2',
            questionTarget: 'Faut-il faire la liaison dans "huit_heures" et "les_élèves" ?',
            questionEs: '2. ¿Debemos unir el sonido final en "huit_heures" y "les_élèves"?',
            expectedAnswer: 'Sí, suena [ɥit‿œʁ] y [lez‿elɛv] como una sola palabra fluida.',
          },
        ],
        icqInstruction:
          'En parejas (3 min): Pregúntense a qué hora inicia su clase favorita del colegio usando "À quelle heure... ?".',
        spanishInterference: {
          phonemeOrRule: 'Semivocal /ɥ/ en "Huit" y Liaison en "Les élèves"',
          wrongHabitEs: 'Separar "huit / heures" con pausa o pronunciar la "-s" final de "sciences".',
          correctArticulationEs:
            'Enlazar "huit_heures" [ɥit‿œʁ] y mantener muda la "-s" final de "sciences" [sjɑ̃s].',
          exampleWords: ['Huit heures', 'Les élèves', 'Sciences'],
          mirrorId: 'fr_v_labiodental',
        },
        pairWorkStarters: [
          '"Bonjour ! À quelle heure commence le laboratoire de sciences ?"',
          '"Notre séance commence à huit heures du matin."',
          '"Excellent ! J\'ai mon cahier et ma trousse."',
        ],
      };
    }

    return {
      id: 'fr-cafe-a1',
      language: 'fr',
      level,
      lessonFocus: 'Cortesía en Brasserie ("Je voudrais" vs "Je veux" · DELF A1)',
      ccqQuestions: [
        {
          id: 'ccq-fr-cafe-1',
          questionTarget: '"Je voudrais" est-il poli ou trop direct au restaurant ?',
          questionEs: '1. ¿"Je voudrais" (Quisiera) es cortés o demasiado directo en una cafetería?',
          expectedAnswer: 'Muy cortés y educado (Condicional de cortesía).',
        },
        {
          id: 'ccq-fr-cafe-2',
          questionTarget: 'Quand dit-on "S\'il vous plaît" ?',
          questionEs: '2. ¿En qué momento de la frase agregamos "S\'il vous plaît"?',
          expectedAnswer: 'Al final de nuestra petición para mostrar respeto.',
        },
      ],
      icqInstruction:
        'Trabajo en parejas (3 min): Alumno A es el mesero en París y Alumno B pide una bebida y un croissant.',
      spanishInterference: {
        phonemeOrRule: 'Sonido /v/ en "Vous / Voudrais" y /y/ en "Une"',
        wrongHabitEs: 'Pronunciar "Voudrais" con "B" española ("Boudrais") o la "-t" final de "Croissant".',
        correctArticulationEs:
          'Rozar dientes superiores con el labio inferior en /v/ y dejar muda la "-t" final en "Croissant" [kʁwasɑ̃].',
        exampleWords: ['Je voudrais', "S'il vous plaît", 'Croissant'],
        mirrorId: 'fr_u_nasal',
      },
      pairWorkStarters: [
        '"Bonjour ! Que désirez-vous aujourd\'hui ?"',
        '"Je voudrais un croissant et un chocolat, s\'il vous plaît."',
        '"Très bien ! En terrasse ou à l\'intérieur ?"',
      ],
    };
  }

  // ===========================================================================
  // GUÍAS DIDÁCTICAS INGLÉS (ESL · CAMBRIDGE A1, A2, B1, B2)
  // ===========================================================================
  if (
    lower.includes('shakespeare') ||
    lower.includes('lovelace') ||
    lower.includes('lincoln') ||
    level === 'B2'
  ) {
    return {
      id: 'en-hist-b2',
      language: 'en',
      level,
      lessonFocus: 'Narrativa Biográfica en 1ª Persona & Pasado Simple (Cambridge B1/B2)',
      ccqQuestions: [
        {
          id: 'ccq-en-hist-1',
          questionTarget: 'Did this historical event happen in the past or is it happening now?',
          questionEs: '1. ¿Esta obra histórica ocurrió en el pasado o está pasando ahora?',
          expectedAnswer: 'En el pasado terminado (Past Simple: "I crafted", "I wrote").',
        },
        {
          id: 'ccq-en-hist-2',
          questionTarget: 'Why does the mentor speak using "I" and "My"?',
          questionEs: '2. ¿Por qué el personaje habla usando "I" (Yo) y "My" (Mi)?',
          expectedAnswer: 'Porque relata su propia vida directamente en primera persona.',
        },
      ],
      icqInstruction:
        'En parejas (3 min): Entrevista al personaje histórico usando "Where were you born?" y "How did you...?".',
      spanishInterference: {
        phonemeOrRule: 'Sonido Interdental /θ/ en "Theatre / Thought"',
        wrongHabitEs: 'Decir "Teater" con /t/ dental en lugar de /θ/ interdental.',
        correctArticulationEs:
          'Colocar la punta de la lengua suavemente entre los dientes y soplar aire: "TH-eatre".',
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

  if (lower.includes('scientific') || lower.includes('kinetic') || lower.includes('energy') || level === 'B1') {
    return {
      id: 'en-science-b1',
      language: 'en',
      level: 'B1',
      lessonFocus: 'Ciencia, Sustentabilidad y Verbos Modales de Posibilidad ("Can / Through")',
      ccqQuestions: [
        {
          id: 'ccq-en-b1-1',
          questionTarget: 'Does "renewable energy" run out quickly or does it replenish naturally?',
          questionEs: '1. ¿"Renewable energy" se agota rápido o se renueva naturalmente?',
          expectedAnswer: 'Se renueva naturalmente (solar, eólica y cinética).',
        },
        {
          id: 'ccq-en-b1-2',
          questionTarget: 'What does "Through solar panels" express in the sentence?',
          questionEs: '2. ¿Qué expresa la preposición "Through" en "Through solar panels"?',
          expectedAnswer: 'El medio o instrumento mediante el cual generamos energía limpia.',
        },
      ],
      icqInstruction:
        'En parejas (3 min): Expliquen cómo una fuente de energía limpia protege nuestra ciudad.',
      spanishInterference: {
        phonemeOrRule: 'Sonido /θ/ en "Through" y /v/ en "Investigating"',
        wrongHabitEs: 'Decir "Tru" en lugar de "Through" (/θruː/) o cambiar /v/ por /b/.',
        correctArticulationEs:
          'Coloca la punta de la lengua entre los dientes para "TH-rough" y vibra el labio inferior en "in-VES-ti-ga-ting".',
        exampleWords: ['Through', 'Investigating', 'Every'],
        mirrorId: 'th_interdental',
      },
      pairWorkStarters: [
        '"Today we are investigating how solar energy..."',
        '"Can renewable energy power our school?"',
        '"Indeed! Through solar panels we protect our planet."',
      ],
    };
  }

  if (lower.includes('pancras') || lower.includes('station') || lower.includes('tickets') || level === 'A2') {
    return {
      id: 'en-travel-a2',
      language: 'en',
      level: 'A2',
      lessonFocus: 'Compra de Boletos y Direcciones en Londres ("Could I have... / Platform")',
      ccqQuestions: [
        {
          id: 'ccq-en-a2-1',
          questionTarget: 'Is a "return ticket" for one way only, or to go and come back?',
          questionEs: '1. ¿Un "return ticket" es solo de ida o de ida y vuelta?',
          expectedAnswer: 'De ida y vuelta (viaje redondo).',
        },
        {
          id: 'ccq-en-a2-2',
          questionTarget: 'Is "Could I have..." polite when speaking at the ticket office?',
          questionEs: '2. ¿"Could I have..." es una forma cortés de pedir boletos en taquilla?',
          expectedAnswer: 'Sí, es el modal estándar de cortesía en Cambridge A2 Key.',
        },
      ],
      icqInstruction:
        'En parejas (3 min): Alumno A vende boletos en Londres; Alumno B pide 2 boletos a Oxford y pregunta el andén.',
      spanishInterference: {
        phonemeOrRule: 'Letra "L" muda en "Could" (/kʊd/) y /v/ en "Seven / Leave"',
        wrongHabitEs: 'Pronunciar la "L" en "Could" ("Kuld") o confundir "fifteen" (15) con "fifty" (50).',
        correctArticulationEs:
          'En "Could" (/kʊd/) la "L" es 100% muda; en "fif-TEEN" acentúa la segunda sílaba.',
        exampleWords: ['Could', 'Platform seven', 'Fifteen'],
        mirrorId: 'short_u_would',
      },
      pairWorkStarters: [
        '"Welcome to London Station! How can I help you?"',
        '"Could I have two return tickets to Oxford, please?"',
        '"The train departs from platform seven in fifteen minutes."',
      ],
    };
  }

  if (lower.includes('schedule') || lower.includes('laboratory') || lower.includes('science lab')) {
    return {
      id: 'en-schedule-a1',
      language: 'en',
      level: 'A1',
      lessonFocus: 'Rutinas Escolares y Horarios en Presente Simple ("Starts at eight")',
      ccqQuestions: [
        {
          id: 'ccq-en-sch-1',
          questionTarget: 'Does the science lab start at 8:00 AM only today, or is it a regular schedule?',
          questionEs: '1. ¿"Starts at eight" expresa una rutina del horario escolar?',
          expectedAnswer: 'Sí, usamos Present Simple con "-s" ("starts") para horarios fijos.',
        },
        {
          id: 'ccq-en-sch-2',
          questionTarget: 'Which preposition do we use before exact clock times ("at eight")?',
          questionEs: '2. ¿Qué preposición usamos en inglés antes de una hora exacta?',
          expectedAnswer: 'Siempre usamos "AT" para horas exactas ("at eight in the morning").',
        },
      ],
      icqInstruction:
        'En parejas (3 min): Pregunta a tu compañero a qué hora inicia su clase favorita con "What time does... start?".',
      spanishInterference: {
        phonemeOrRule: 'Vocal inicial sin "E-" agregada en "School / Starts"',
        wrongHabitEs: 'Agregar una "e" al principio diciendo "Es-starts" o "Es-school".',
        correctArticulationEs:
          'Inicia directamente con el soplido de la /s/ continua: "Sss-tarts", "Sss-chool".',
        exampleWords: ['Starts', 'School', 'Science'],
        mirrorId: 'v_labiodental',
      },
      pairWorkStarters: [
        '"What time does your science lab start today?"',
        '"Our science lab starts promptly at eight in the morning."',
        '"May I borrow a dictionary and a notebook, please?"',
      ],
    };
  }

  return {
    id: 'en-cafe-a1',
    language: 'en',
    level,
    lessonFocus: 'Peticiones Corteses en Cafetería ("I would like..." · Cambridge A1)',
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
    icqInstruction:
      'En parejas (3 min): Alumno A saluda en el café; Alumno B pide su bebida usando "I would like...".',
    spanishInterference: {
      phonemeOrRule: 'Letra "L" muda en "Would" (/wʊd/) y /θ/ en "Thank you"',
      wrongHabitEs: 'Evitar pronunciar "would" con la "l" sonora ("wuld") o decir "Tank you".',
      correctArticulationEs:
        'En "would" (/wʊd/) la "L" es 100% muda y rima con "good". En "Thank you" saca ligeramente la punta de la lengua.',
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
  // ===========================================================================
  // RECETAS DE WRITING EN INGLÉS (CAMBRIDGE A1, A2, B1, B2)
  // ===========================================================================
  {
    id: 'recipe-en-a1-schedule',
    language: 'en',
    level: 'A1',
    cenniBand: 'A1 Movers · SEP CENNI Nivel 4',
    badgeLabel: '🏫 Mi Horario Escolar (A1)',
    title: 'Descripción de Mi Horario Escolar y Laboratorio de Ciencias (A1)',
    promptInstructionEs:
      'Escribe un mensaje corto (25–40 palabras) contando a qué hora empieza tu laboratorio de ciencias y qué materiales llevas en tu mochila.',
    sampleStudentName: 'Mateo Hernández · 2º A',
    sampleDraft:
      'Good morning! Every Monday, our science laboratory practice starts promptly at eight in the morning. First, I bring my notebook and safety goggles. Then, we do exciting experiments with our teacher!',
    positiveConnectors: ['First', 'Then'],
    grammarSuggestions: [
      {
        phrase: 'starts promptly at eight',
        suggestionEs: '¡Excelente uso de Present Simple con "-s" en tercera persona y preposición "at"!',
      },
    ],
    vocabularyBank: [
      { word: 'science laboratory', translationEs: 'laboratorio de ciencias' },
      { word: 'at eight in the morning', translationEs: 'a las ocho de la mañana' },
      { word: 'notebook', translationEs: 'cuaderno / bitácora' },
      { word: 'experiments', translationEs: 'experimentos' },
    ],
    targetConnectors: [
      { connector: 'First,', usageEs: 'Primero (para iniciar tu rutina)' },
      { connector: 'Then,', usageEs: 'Después / Luego' },
      { connector: 'Finally,', usageEs: 'Finalmente' },
    ],
    selfCheckList: [
      'Uso correcto de "starts" con -s para hablar de la clase',
      'Preposición "at" antes de la hora ("at eight")',
      'Al menos 2 conectores de secuencia (First, Then)',
    ],
  },
  {
    id: 'recipe-en-cafe',
    language: 'en',
    level: 'A2',
    cenniBand: 'A2 Key · SEP CENNI Nivel 6',
    badgeLabel: '✉️ Correo o Reseña (A2)',
    title: 'Reseña de Visita a una Cafetería / Correo Formal Corto (A2)',
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
    title: 'Anécdota de un Viaje o Descubrimiento Escolar (B1)',
    promptInstructionEs:
      'Escribe una historia breve (60–80 palabras) sobre un día inolvidable en la escuela o en un museo, combinando Past Simple y conectores de contraste.',
    sampleStudentName: 'Mateo Hernández · 2º A',
    sampleDraft:
      'Last Friday our class visited the Science Museum in London. First of all, we explored the renewable energy hall and asked questions. Although the weather outside was rainy, we had a wonderful time learning together. In conclusion, it was an unforgettable day.',
    positiveConnectors: ['First of all', 'Although', 'In conclusion'],
    grammarSuggestions: [
      {
        phrase: 'we had a wonderful time',
        suggestionEs: 'Uso natural de colocación en pasado simple ("have a wonderful time").',
      },
    ],
    vocabularyBank: [
      { word: 'unforgettable', translationEs: 'inolvidable' },
      { word: 'renewable energy', translationEs: 'energía renovable' },
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
    title: 'Carta Formal / Ensayo sobre Aprendizaje de Idiomas y Tecnología (B2)',
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

  // ===========================================================================
  // RECETAS DE WRITING EN FRANCÉS (ALLIANCE FRANÇAISE DELF A1, A2, B1, B2)
  // ===========================================================================
  {
    id: 'recipe-fr-a1-college',
    language: 'fr',
    level: 'A1',
    cenniBand: 'DELF A1 · SEP CENNI Nivel 4',
    badgeLabel: '🏫 Mon Collège (DELF A1)',
    title: 'Message sur Mon Emploi du Temps au Collège (DELF A1)',
    promptInstructionEs:
      'Escribe un mensaje corto en francés (25–40 palabras) describiendo a qué hora inicia tu clase de ciencias en el colegio y qué útiles llevas.',
    sampleStudentName: 'Diego Emiliano Santillán · 2º A',
    sampleDraft:
      "Bonjour ! Le lundi, notre séance au laboratoire de sciences commence à huit heures du matin. D'abord, je prépare mon cahier et ma trousse. Ensuite, nous faisons des expériences passionnantes avec le professeur Henri !",
    positiveConnectors: ["D'abord", 'Ensuite'],
    grammarSuggestions: [
      {
        phrase: 'commence à huit heures',
        suggestionEs: '¡Excelente uso del presente indicativo y de la preposición "à" para indicar la hora en francés!',
      },
    ],
    vocabularyBank: [
      { word: 'le laboratoire de sciences', translationEs: 'el laboratorio de ciencias' },
      { word: 'à huit heures du matin', translationEs: 'a las ocho de la mañana' },
      { word: 'mon cahier', translationEs: 'mi cuaderno' },
      { word: 'des expériences', translationEs: 'experimentos' },
    ],
    targetConnectors: [
      { connector: "D'abord,", usageEs: 'Primero / En primer lugar' },
      { connector: 'Ensuite,', usageEs: 'Después / Luego' },
      { connector: 'Enfin,', usageEs: 'Finalmente' },
    ],
    selfCheckList: [
      'Uso de la preposición "à" con acento grave para la hora ("à huit heures")',
      'Conectores de secuencia franceses (D\'abord, Ensuite)',
      'Concordancia correcta en plural (des expériences passionnantes)',
    ],
  },
  {
    id: 'recipe-fr-cafe',
    language: 'fr',
    level: 'A2',
    cenniBand: 'DELF A2 · SEP CENNI Nivel 6',
    badgeLabel: '✉️ Brasserie & Voyage (DELF A2)',
    title: "Carte Postale / Critique d'un Café à Paris (DELF A2)",
    promptInstructionEs:
      'Escribe un mensaje en francés (35–55 palabras) contando tu visita a una brasserie parisina o tu viaje en TGV, usando "Je voudrais" y passé composé.',
    sampleStudentName: 'Camila Regina Villaseñor · 2º A',
    sampleDraft:
      "Hier, j'ai visité une belle brasserie à Paris avec mes amis. D'abord, le croissant chaud et le chocolat étaient délicieux. De plus, le serveur était très sympathique. Je voudrais revenir demain matin !",
    positiveConnectors: ["D'abord", 'De plus'],
    grammarSuggestions: [
      {
        phrase: 'Je voudrais revenir',
        suggestionEs: 'Excelente uso del condicional de cortesía seguido de infinitivo en francés.',
      },
    ],
    vocabularyBank: [
      { word: 'le croissant chaud', translationEs: 'el croissant caliente' },
      { word: 'délicieux', translationEs: 'delicioso' },
      { word: 'le serveur', translationEs: 'el mesero' },
      { word: 'sympathique', translationEs: 'amable / simpático' },
    ],
    targetConnectors: [
      { connector: "D'abord,", usageEs: 'Primero / En primer lugar' },
      { connector: 'De plus,', usageEs: 'Además' },
      { connector: 'Enfin,', usageEs: 'Finalmente' },
    ],
    selfCheckList: [
      'Acentos gráficos franceses correctos (é, è, à)',
      'Uso de conectores (D\'abord, De plus)',
      'Concordancia en plural (étaient délicieux)',
    ],
  },
  {
    id: 'recipe-fr-b1-ecologie',
    language: 'fr',
    level: 'B1',
    cenniBand: 'DELF B1 · SEP CENNI Nivel 9',
    badgeLabel: '🌿 Essai Écologie (DELF B1)',
    title: "Essai Structuré : L'Écologie et la Science au Collège (DELF B1)",
    promptInstructionEs:
      'Redacta un texto argumentativo en francés (60–80 palabras) explicando cómo la ciencia y las energías limpias protegen el medio ambiente.',
    sampleStudentName: 'Camila Regina Villaseñor · 2º A',
    sampleDraft:
      "À mon avis, il est essentiel que notre collège développe des projets écologiques cette année. D'une part, les énergies renouvelables réduisent la pollution urbaine. En outre, les expériences au laboratoire inspirent les élèves. En conclusion, la science protège notre avenir.",
    positiveConnectors: ['À mon avis', 'En outre', 'En conclusion'],
    grammarSuggestions: [
      {
        phrase: 'il est essentiel que notre collège développe',
        suggestionEs: 'Dominio sobresaliente del subjuntivo francés en una estructura argumentativa DELF B1.',
      },
    ],
    vocabularyBank: [
      { word: 'les énergies renouvelables', translationEs: 'las energías renovables' },
      { word: 'la biodiversité', translationEs: 'la biodiversidad' },
      { word: 'un avenir durable', translationEs: 'un futuro sostenible' },
      { word: 'la recherche scientifique', translationEs: 'la investigación científica' },
    ],
    targetConnectors: [
      { connector: 'À mon avis,', usageEs: 'En mi opinión (introducir tesis)' },
      { connector: 'En outre,', usageEs: 'Además (registro intermedio-avanzado)' },
      { connector: 'En conclusion,', usageEs: 'En conclusión' },
    ],
    selfCheckList: [
      'Tesis clara introducida con "À mon avis"',
      'Uso de vocabulario científico y ecológico de nivel B1',
      'Cierre estructurado con "En conclusion"',
    ],
  },
  {
    id: 'recipe-fr-b2-argumentation',
    language: 'fr',
    level: 'B2',
    cenniBand: 'DELF B2 · SEP CENNI Nivel 12',
    badgeLabel: '⚖️ Lettre Formelle (DELF B2)',
    title: 'Lettre Formelle : Culture, Histoire & Échanges Internationaux (DELF B2)',
    promptInstructionEs:
      'Redacta una carta formal en francés (80–110 palabras) dirigida al comité académico proponiendo un encuentro internacional de ciencias y literatura francesa.',
    sampleStudentName: 'Valentina Torres · 2º A',
    sampleDraft:
      "Monsieur le Directeur, je vous écris afin de vous présenter notre projet de symposium franco-mexicain sur l'héritage scientifique de Marie Curie. Par ailleurs, cette initiative permettra aux étudiants de perfectionner leur expression orale. Toutefois, nous aurions besoin de l'auditorium principal. Je vous prie d'agréer l'expression de mes salutations distinguées.",
    positiveConnectors: ['Par ailleurs', 'Toutefois', "Je vous prie d'agréer"],
    grammarSuggestions: [
      {
        phrase: "Je vous prie d'agréer l'expression de mes salutations distinguées",
        suggestionEs: 'Fórmula protocolaria impecable del estándar oficial DELF B2 de France Éducation International.',
      },
    ],
    vocabularyBank: [
      { word: "l'héritage scientifique", translationEs: 'el legado científico' },
      { word: "l'expression orale", translationEs: 'la expresión oral' },
      { word: 'salutations distinguées', translationEs: 'saludos distinguidos' },
      { word: 'perfectionner', translationEs: 'perfeccionar' },
    ],
    targetConnectors: [
      { connector: 'Par ailleurs,', usageEs: 'Por otra parte / Asimismo (DELF B2)' },
      { connector: 'Toutefois,', usageEs: 'Sin embargo / No obstante' },
      { connector: 'Afin de', usageEs: 'Con el fin de (+ infinitivo)' },
    ],
    selfCheckList: [
      'Encabezado y fórmula de despedida formal ("Monsieur le Directeur...")',
      'Conectores lógicos de nivel B2 (Par ailleurs, Toutefois)',
      'Precisión ortográfica y acentuación francesa completa',
    ],
  },
];

// Palabras clave para resaltar sílaba tónica de forma visual e intuitiva en el Modo Pizarrón (Inglés y Francés)
const STRESS_WORD_MAP: Record<string, string> = {
  // Inglés (ESL)
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
  science: 'SCI-ence',
  laboratory: 'LAB-o-ra-to-ry',
  promptly: 'PROMPT-ly',
  station: 'STA-tion',
  journey: 'JOUR-ney',
  platform: 'PLAT-form',
  investigating: 'in-VES-ti-ga-ting',
  kinetic: 'ki-NE-tic',
  renewable: 're-NEW-a-ble',
  algorithm: 'AL-go-rithm',
  theatre: 'THE-a-tre',
  // Francés (FLE)
  bonjour: 'bon-JOUR',
  bienvenue: 'bien-ve-NUE',
  brasserie: 'bras-se-RIE',
  voudrais: 'vou-DRAIS',
  croissant: 'crois-SANT',
  plaisir: 'plai-SIR',
  magnifique: 'ma-gni-FIQUE',
  beaucoup: 'beau-COUP',
  laboratoire: 'la-bo-ra-TOIRE',
  sciences: 'SCI-ences',
  exactement: 'ex-ac-te-MENT',
  matin: 'ma-TIN',
  destination: 'des-ti-na-TION',
  vitesse: 'vi-TESSE',
  voyage: 'vo-YAGE',
  renouvelables: 're-nou-ve-LABLES',
  biodiversité: 'bio-di-ver-si-TÉ',
  durable: 'du-RABLE',
  radium: 'ra-DIUM',
  polonium: 'po-lo-NIUM',
  promulgué: 'pro-mul-GUÉ',
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
