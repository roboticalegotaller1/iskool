import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LanguageCode = 'en' | 'fr';
export type AvatarGender = 'female' | 'male';

export interface DialogueLine {
  id: string;
  speaker: 'avatar' | 'student';
  text: string;
  translationEs: string;
  phoneticTip?: string;
  audioVoice?: string;
}

export interface KaraokePhrase {
  id: string;
  targetText: string;
  translationEs: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  phoneticGuide?: string; // Guía de pronunciación simplificada
}

export interface LanguageLesson {
  id: string;
  title: string;
  topic: string;
  language: LanguageCode;
  level: 'A1' | 'A2' | 'B1' | 'B2';
  avatarGender: AvatarGender;
  avatarVoice: string;
  avatarName: string;
  avatarImage?: string;
  historicalFigureId?: string;
  defaultSpeed: number; // ej. 0.85
  dialogue: DialogueLine[];
  karaokePhrases: KaraokePhrase[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentPronunciationReport {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  lessonId: string;
  lessonTitle: string;
  language: LanguageCode;
  phraseId: string;
  targetPhrase: string;
  spokenTranscript: string;
  overallAccuracy: number; // 0 - 100
  correctWords: string[];
  mispronouncedWords: string[];
  speedPpm?: number;
  pedagogicalAdvice?: string;
  timestamp: string;
  reviewedByTeacher?: boolean;
}

interface LanguagesState {
  lessons: LanguageLesson[];
  activeLessonId: string;
  studentReports: StudentPronunciationReport[];

  // Acciones
  setActiveLessonId: (id: string) => void;
  addLesson: (lesson: Omit<LanguageLesson, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLesson: (id: string, updates: Partial<LanguageLesson>) => void;
  deleteLesson: (id: string) => void;
  deduplicateLessons: () => void;

  // Reportes en tiempo real del alumno al profesor
  submitStudentReport: (report: Omit<StudentPronunciationReport, 'id' | 'timestamp'>) => void;
  markReportAsReviewed: (id: string) => void;
  clearAllReports: () => void;
  getReportsForLesson: (lessonId: string) => StudentPronunciationReport[];
}

export const INITIAL_LESSONS: LanguageLesson[] = [
  // ===========================================================================
  // INGLÉS (ESL / CAMBRIDGE ENGLISH & SEP CENNI: NIVELES A1, A2, B1, B2)
  // ===========================================================================
  {
    id: 'lesson-en-coffee',
    title: 'Ordering at a Café & Pleasantries',
    topic: 'Vida Cotidiana & Cortesía · Cambridge A1 Movers',
    language: 'en',
    level: 'A1',
    avatarGender: 'female',
    avatarName: 'Claire',
    avatarVoice: 'en-US-JennyNeural',
    avatarImage: '/images/languages/3d/mentor_female_3d.webp',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-1',
        speaker: 'avatar',
        text: 'Good morning! Welcome to the Royal Orchard Café. What would you like today?',
        translationEs: '¡Buenos días! Bienvenido al Café Royal Orchard. ¿Qué le gustaría hoy?',
        phoneticTip: 'Presta atención a "would you like" [wʊd juː laɪk] con L muda',
      },
      {
        id: 'd-2',
        speaker: 'student',
        text: 'Hello! I would like a warm cappuccino and a fresh blueberry muffin, please.',
        translationEs: '¡Hola! Me gustaría un capuchino caliente y un panecillo fresco de arándanos, por favor.',
        phoneticTip: 'Pronuncia "blueberry" como [ˈbluːˌbɛri] y "muffin" [ˈmʌfɪn]',
      },
      {
        id: 'd-3',
        speaker: 'avatar',
        text: 'Excellent choice! Would you prefer your beverage for here or to go?',
        translationEs: '¡Excelente elección! ¿Prefiere su bebida para tomar aquí o para llevar?',
        phoneticTip: 'Entonación ascendente cortés en "for here" y descendente en "to go"',
      },
      {
        id: 'd-4',
        speaker: 'student',
        text: 'For here, please. Thank you very much for your kindness!',
        translationEs: 'Para tomar aquí, por favor. ¡Muchas gracias por su amabilidad!',
        phoneticTip: 'Coloca la lengua entre los dientes para el sonido "Th" en "Thank you" [θæŋk juː]',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-1',
        targetText: 'I would like a warm cappuccino and a fresh blueberry muffin please',
        translationEs: 'Me gustaría un capuchino caliente y un panecillo fresco de arándanos por favor',
        difficulty: 'beginner',
        phoneticGuide: 'ai wud laik a worm ca-pu-chi-no and a fresh blu-be-ri ma-fin plis',
      },
      {
        id: 'k-2',
        targetText: 'Good morning welcome to the Royal Orchard Cafe what would you like today',
        translationEs: 'Buenos días bienvenido al Café Royal Orchard qué le gustaría ordenar hoy',
        difficulty: 'beginner',
        phoneticGuide: 'gud mor-ning wel-com tu de ro-yal or-chard ca-fe wat wud yu laik tu-dei',
      },
      {
        id: 'k-3',
        targetText: 'For here please thank you very much for your wonderful kindness',
        translationEs: 'Para tomar aquí por favor muchas gracias por su maravillosa amabilidad',
        difficulty: 'intermediate',
        phoneticGuide: 'for jir plis zank yu ve-ri mach for yor wan-der-ful kaind-nes',
      },
    ],
    createdAt: '2026-03-01T10:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
  },
  {
    id: 'lesson-en-schedule',
    title: 'My Daily School Schedule & Science Lab',
    topic: 'Vida Escolar & Rutinas · Cambridge A1 Movers / CENNI 4',
    language: 'en',
    level: 'A1',
    avatarGender: 'male',
    avatarName: 'Arthur',
    avatarVoice: 'en-US-GuyNeural',
    avatarImage: '/images/languages/3d/mentor_male_3d_v2.webp',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-sch-1',
        speaker: 'avatar',
        text: 'Good morning students! What time does your science laboratory practice start today?',
        translationEs: '¡Buenos días alumnos! ¿A qué hora comienza hoy su práctica del laboratorio de ciencias?',
        phoneticTip: 'Acentúa "science" [ˈsaɪəns] y enlaza "what time" con naturalidad',
      },
      {
        id: 'd-sch-2',
        speaker: 'student',
        text: 'Our science laboratory practice starts promptly at eight in the morning.',
        translationEs: 'Nuestra práctica de laboratorio de ciencias comienza puntualmente a las ocho de la mañana.',
        phoneticTip: 'Enlace fonético continuo entre "starts at eight" [stɑːrts æt eɪt]',
      },
      {
        id: 'd-sch-3',
        speaker: 'avatar',
        text: 'Wonderful! Remember to bring your safety goggles and your laboratory notebook.',
        translationEs: '¡Maravilloso! Recuerden traer sus gafas de seguridad y su bitácora de laboratorio.',
        phoneticTip: 'Articula la /v/ labiodental en "every" y el diptongo /eɪ/ en "safety"',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-sch-1',
        targetText: 'Our science laboratory practice starts promptly at eight in the morning',
        translationEs: 'Nuestra práctica de laboratorio de ciencias comienza puntualmente a las ocho de la mañana',
        difficulty: 'beginner',
        phoneticGuide: 'aur sai-ens la-bo-ra-to-ri prak-tis starts prompt-li at eit in de mor-ning',
      },
      {
        id: 'k-sch-2',
        targetText: 'Excuse me teacher may I borrow a dictionary and an extra notebook',
        translationEs: 'Disculpe profesor podría tomar prestado un diccionario y una libreta extra',
        difficulty: 'beginner',
        phoneticGuide: 'iks-kiuz mi ti-cher mei ai bo-rou a dik-sho-ne-ri and an eks-tra nout-buk',
      },
    ],
    createdAt: '2026-03-01T10:15:00Z',
    updatedAt: '2026-03-01T10:15:00Z',
  },
  {
    id: 'lesson-en-travel-a2',
    title: 'London St. Pancras Station, Travel & Directions',
    topic: 'Viajes, Transporte & Orientación Urbana · Cambridge A2 Key (KET)',
    language: 'en',
    level: 'A2',
    avatarGender: 'female',
    avatarName: 'Claire',
    avatarVoice: 'en-US-JennyNeural',
    avatarImage: '/images/languages/3d/mentor_female_3d.webp',
    defaultSpeed: 0.88,
    dialogue: [
      {
        id: 'd-a2-en-1',
        speaker: 'avatar',
        text: 'Welcome to London St. Pancras Station! How can I help you with your journey today?',
        translationEs: '¡Bienvenido a la Estación St. Pancras de Londres! ¿Cómo puedo ayudarle con su viaje hoy?',
        phoneticTip: 'Pronuncia "journey" [ˈdʒɜːrni] con el sonido africado sonoro inicial /dʒ/',
      },
      {
        id: 'd-a2-en-2',
        speaker: 'student',
        text: 'Could I have two return tickets to Oxford, please? Which platform does the train leave from?',
        translationEs: '¿Podría darme dos boletos de ida y vuelta a Oxford, por favor? ¿De qué andén sale el tren?',
        phoneticTip: 'En "Could I have" [kʊd aɪ hæv], recuerda que la "L" de "Could" es 100% muda',
      },
      {
        id: 'd-a2-en-3',
        speaker: 'avatar',
        text: 'Certainly! The express train departs from platform seven in fifteen minutes. Walk straight ahead!',
        translationEs: '¡Por supuesto! El tren expreso sale del andén siete en quince minutos. ¡Camine todo derecho!',
        phoneticTip: 'Distingue claramente "fifteen" [ˌfɪfˈtiːn] (15) de "fifty" [ˈfɪfti] (50)',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-a2-en-1',
        targetText: 'Could I have two return tickets to Oxford please which platform does the train leave from',
        translationEs: 'Podría darme dos boletos redondos a Oxford por favor de qué andén sale el tren',
        difficulty: 'intermediate',
        phoneticGuide: 'kud ai jav tu ri-tern ti-kets tu oks-ford plis wich plat-form daz de trein liv from',
      },
      {
        id: 'k-a2-en-2',
        targetText: 'The express train departs from platform seven in fifteen minutes walk straight ahead',
        translationEs: 'El tren expreso sale del andén siete en quince minutos camine todo derecho',
        difficulty: 'intermediate',
        phoneticGuide: 'di iks-pres trein di-parts from plat-form se-ven in fif-tin mi-nits wok streit a-jed',
      },
    ],
    createdAt: '2026-03-01T11:00:00Z',
    updatedAt: '2026-03-01T11:00:00Z',
  },
  {
    id: 'lesson-en-science',
    title: 'The Wonders of Scientific Discovery & Clean Energy',
    topic: 'Ciencia, Tecnología & Sustentabilidad · Cambridge B1 Preliminary (PET)',
    language: 'en',
    level: 'B1',
    avatarGender: 'male',
    avatarName: 'Arthur',
    avatarVoice: 'en-US-GuyNeural',
    avatarImage: '/images/languages/3d/mentor_male_3d_v2.webp',
    defaultSpeed: 0.9,
    dialogue: [
      {
        id: 'd-5',
        speaker: 'avatar',
        text: 'Welcome explorers! Today we are investigating how solar and kinetic energy transform our world.',
        translationEs: '¡Bienvenidos exploradores! Hoy estamos investigando cómo la energía solar y cinética transforman nuestro mundo.',
        phoneticTip: 'Enfatiza la sílaba tónica en "in-VES-ti-ga-ting" y "ki-NE-tic"',
      },
      {
        id: 'd-6',
        speaker: 'student',
        text: 'That sounds fascinating! Can renewable energy power an entire modern city without pollution?',
        translationEs: '¡Eso suena fascinante! ¿Puede la energía renovable alimentar a toda una ciudad moderna sin contaminación?',
        phoneticTip: 'Articula claramente "renewable" [rɪˈnuːəbəl]',
      },
      {
        id: 'd-7',
        speaker: 'avatar',
        text: 'Indeed it can! Through solar panels and wind turbines, we protect our planet for future generations.',
        translationEs: '¡En efecto puede! Mediante paneles solares y turbinas eólicas, protegemos nuestro planeta para las generaciones futuras.',
        phoneticTip: 'Sonido "Th" sin voz en "Through" [θruː] sacando suavemente la lengua',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-4',
        targetText: 'Today we are investigating how kinetic energy transforms our world',
        translationEs: 'Hoy estamos investigando cómo la energía cinética transforma nuestro mundo',
        difficulty: 'intermediate',
        phoneticGuide: 'tu-dei wi ar in-ves-ti-gei-ting jau ki-ne-tik e-ner-yi trans-forms aur world',
      },
      {
        id: 'k-5',
        targetText: 'Through solar panels and wind turbines we protect our planet for future generations',
        translationEs: 'A través de paneles solares y turbinas eólicas protegemos nuestro planeta para futuras generaciones',
        difficulty: 'advanced',
        phoneticGuide: 'zru so-lar pa-nels and wind ter-bains wi pro-tekt aur pla-net for fiu-cher ye-ne-rei-shons',
      },
    ],
    createdAt: '2026-03-02T10:00:00Z',
    updatedAt: '2026-03-02T10:00:00Z',
  },
  {
    id: 'lesson-en-lovelace-b1',
    title: 'Inmersión 1ª Persona: Ada Lovelace & The Analytical Engine',
    topic: 'Historia de la Computación en 1ª Persona · Cambridge B1/B2',
    language: 'en',
    level: 'B1',
    avatarGender: 'female',
    avatarName: 'Ada Lovelace',
    avatarVoice: 'en-GB-SoniaNeural',
    avatarImage: '/images/languages/3d/ada_lovelace_3d.webp',
    historicalFigureId: 'ada_lovelace',
    defaultSpeed: 0.88,
    dialogue: [
      {
        id: 'd-ada-1',
        speaker: 'avatar',
        text: 'I am Ada Lovelace. In 1843, I wrote the very first computer algorithm for Charles Babbage and his Analytical Engine.',
        translationEs: 'Soy Ada Lovelace. En 1843, escribí el primer algoritmo computacional para Charles Babbage y su Máquina Analítica.',
        phoneticTip: 'Dicción británica clara en "algorithm" [ˈælɡərɪðəm] y "Analytical" [ˌænəˈlɪtɪkəl]',
      },
      {
        id: 'd-ada-2',
        speaker: 'student',
        text: 'How did you imagine that machines could create music and art beyond numbers?',
        translationEs: '¿Cómo imaginó usted que las máquinas podrían crear música y arte más allá de los números?',
        phoneticTip: 'Entonación interrogativa en pasado simple "How did you imagine"',
      },
      {
        id: 'd-ada-3',
        speaker: 'avatar',
        text: 'I called my method poetical science, because the Engine weaves algebraic patterns just as the Jacquard loom weaves flowers and leaves.',
        translationEs: 'Llamé a mi método ciencia poética, porque la Máquina teje patrones algebraicos tal como el telar de Jacquard teje flores y hojas.',
        phoneticTip: 'Vocal larga /iː/ en "weaves" [wiːvz] y "leaves" [liːvz]',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-ada-1',
        targetText: 'I am Ada Lovelace and in eighteen forty three I wrote the first computer algorithm',
        translationEs: 'Soy Ada Lovelace y en mil ochocientos cuarenta y tres escribí el primer algoritmo computacional',
        difficulty: 'intermediate',
        phoneticGuide: 'ai am ei-da lav-leis and in ei-tin for-ti zri ai rout de ferst kom-piu-ter al-go-ri-dem',
      },
    ],
    createdAt: '2026-03-03T09:00:00Z',
    updatedAt: '2026-03-03T09:00:00Z',
  },
  {
    id: 'lesson-en-shakespeare',
    title: 'Inmersión 1ª Persona: The Poetry of the Globe Theatre',
    topic: 'Literatura Clásica e Historia Viva · Cambridge B2 First (FCE)',
    language: 'en',
    level: 'B2',
    avatarGender: 'male',
    avatarName: 'William Shakespeare',
    avatarVoice: 'en-GB-RyanNeural',
    avatarImage: '/images/languages/3d/shakespeare_3d.webp',
    historicalFigureId: 'shakespeare',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-shak-1',
        speaker: 'avatar',
        text: 'I am William Shakespeare. I was born in Stratford-upon-Avon in 1564, and upon the wooden stage of my Globe Theatre in London, I crafted Hamlet and Macbeth.',
        translationEs: 'Soy William Shakespeare. Nací en Stratford-upon-Avon en 1564, y sobre el escenario de madera de mi Teatro Globe en Londres, forjé Hamlet y Macbeth.',
        phoneticTip: 'Dicción teatral británica; marca el ritmo del pentámetro yámbico',
      },
      {
        id: 'd-shak-2',
        speaker: 'student',
        text: 'Where were you born, and what inspired you to write Hamlet and Romeo and Juliet?',
        translationEs: '¿Dónde nació usted y qué lo inspiró a escribir Hamlet y Romeo y Julieta?',
        phoneticTip: 'Pronuncia "inspired" [ɪnˈspaɪərd] con claridad vocálica',
      },
      {
        id: 'd-shak-3',
        speaker: 'avatar',
        text: 'I looked deep into the human heart—its ambition, its love, and its mortal doubts. To be, or not to be, that was the question I gave to Prince Hamlet!',
        translationEs: 'Miré profundamente en el corazón humano: su ambición, su amor y sus dudas mortales. ¡Ser o no ser, esa fue la cuestión que di al Príncipe Hamlet!',
        phoneticTip: 'Pausa dramática tras "To be, or not to be"',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-shak-1',
        targetText: 'I am William Shakespeare and upon the stage of the Globe Theatre I crafted Hamlet',
        translationEs: 'Soy William Shakespeare y sobre el escenario del Teatro Globe forjé Hamlet',
        difficulty: 'advanced',
        phoneticGuide: 'ai am wi-liam sheiks-pir and a-pon de steich of de gloub zi-a-ter ai kraf-ted jam-let',
      },
    ],
    createdAt: '2026-03-04T10:00:00Z',
    updatedAt: '2026-03-04T10:00:00Z',
  },

  // ===========================================================================
  // FRANCÉS (FLE / ALLIANCE FRANÇAISE DELF-DALF & SEP CENNI: NIVELES A1, A2, B1, B2)
  // ===========================================================================
  {
    id: 'lesson-fr-paris',
    title: 'Une Conversation Douce à la Brasserie de Paris',
    topic: 'Culture Française, Salutations & Politesse · DELF A1 (CENNI 4)',
    language: 'fr',
    level: 'A1',
    avatarGender: 'female',
    avatarName: 'Sophie',
    avatarVoice: 'fr-FR-DeniseNeural',
    avatarImage: '/images/languages/3d/mentor_female_3d.webp',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-8',
        speaker: 'avatar',
        text: "Bonjour et bienvenue à la brasserie parisienne ! Comment puis-je vous aider aujourd'hui ?",
        translationEs: '¡Buenos días y bienvenido a la brasería parisina! ¿Cómo puedo ayudarle hoy?',
        phoneticTip: 'La "r" en francés es uvular [ʁ] y "Bonjour" lleva nasal [bɔ̃ʒuʁ]',
      },
      {
        id: 'd-9',
        speaker: 'student',
        text: "Bonjour madame ! Je voudrais un croissant chaud et un chocolat au lait, s'il vous plaît.",
        translationEs: '¡Buenos días señora! Quisiera un croissant caliente y un chocolate con leche, por favor.',
        phoneticTip: 'Recuerda no pronunciar la "t" final en "croissant" [kʁwasɑ̃] ni en "chocolat"',
      },
      {
        id: 'd-10',
        speaker: 'avatar',
        text: "Avec grand plaisir ! Désirez-vous déguster votre petit-déjeuner en terrasse au soleil ?",
        translationEs: '¡Con mucho gusto! ¿Desea disfrutar su desayuno en la terraza al sol?',
        phoneticTip: 'Redondea los labios hacia adelante diciendo "i" para la vocal /y/ en "déguster"',
      },
      {
        id: 'd-11',
        speaker: 'student',
        text: "Oui, c'est magnifique ! Merci beaucoup pour votre accueil chaleureux.",
        translationEs: '¡Sí, es magnífico! Muchas gracias por su cálida bienvenida.',
        phoneticTip: 'En "beaucoup" [boku], la "p" final es completamente muda',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-6',
        targetText: "Bonjour madame je voudrais un croissant chaud et un chocolat au lait s'il vous plaît",
        translationEs: 'Buenos días señora quisiera un croissant caliente y un chocolate con leche por favor',
        difficulty: 'beginner',
        phoneticGuide: 'bon-zhur ma-dam zhe vu-dre un krua-san sho e un sho-ko-la o le sil vu ple',
      },
      {
        id: 'k-7',
        targetText: "Bonjour et bienvenue à la brasserie comment puis-je vous aider aujourd'hui",
        translationEs: 'Buenos días y bienvenido a la brasería cómo puedo ayudarle hoy',
        difficulty: 'intermediate',
        phoneticGuide: 'bon-zhur e bian-ve-nu a la bra-se-ri ko-man pui-zhe vu ze-de o-zhur-dui',
      },
      {
        id: 'k-8',
        targetText: "Oui c'est magnifique merci beaucoup pour votre accueil chaleureux à Paris",
        translationEs: 'Sí es magnífico muchas gracias por su cálida bienvenida en París',
        difficulty: 'intermediate',
        phoneticGuide: 'wi se ma-ñi-fik mer-si bo-ku pur vo-tr a-kuei sha-le-reu a pa-ri',
      },
    ],
    createdAt: '2026-03-03T10:00:00Z',
    updatedAt: '2026-03-03T10:00:00Z',
  },
  {
    id: 'lesson-fr-college-a1',
    title: 'Mon Emploi du Temps au Collège & le Laboratoire',
    topic: 'Vie Scolaire, Horaires & Matières · DELF Prim / Junior A1+',
    language: 'fr',
    level: 'A1',
    avatarGender: 'male',
    avatarName: 'Henri',
    avatarVoice: 'fr-FR-HenriNeural',
    avatarImage: '/images/languages/3d/mentor_male_3d_v2.webp',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-fr-col-1',
        speaker: 'avatar',
        text: "Bonjour les élèves ! À quelle heure commence votre séance au laboratoire de sciences aujourd'hui ?",
        translationEs: '¡Buenos días alumnos! ¿A qué hora comienza hoy su sesión en el laboratorio de ciencias?',
        phoneticTip: 'Enlaza la "s" como [z] sonoro en "les_élèves" [lez‿elɛv]',
      },
      {
        id: 'd-fr-col-2',
        speaker: 'student',
        text: "Notre séance au laboratoire de sciences commence exactement à huit heures du matin.",
        translationEs: 'Nuestra sesión en el laboratorio de ciencias comienza exactamente a las ocho de la mañana.',
        phoneticTip: 'Pronuncia la "t" en "huit_heures" [ɥit‿œʁ] y la nasal final en "matin" [matɛ̃]',
      },
      {
        id: 'd-fr-col-3',
        speaker: 'avatar',
        text: "Excellent ! N'oubliez pas d'apporter votre cahier d'expériences et votre trousse complète.",
        translationEs: '¡Excelente! No olviden traer su cuaderno de experimentos y su estuche completo.',
        phoneticTip: 'Elisión fluida en "d\'apporter" y "d\'expériences"',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-fr-col-1',
        targetText: 'Notre séance au laboratoire de sciences commence exactement à huit heures du matin',
        translationEs: 'Nuestra sesión en el laboratorio de ciencias comienza exactamente a las ocho de la mañana',
        difficulty: 'beginner',
        phoneticGuide: 'no-tr se-ans o la-bo-ra-tuar de sians ko-mans eg-zak-te-man a uit eur du ma-tan',
      },
      {
        id: 'k-fr-col-2',
        targetText: "Dans mon sac à dos j'ai un cahier de sciences trois stylos et une règle",
        translationEs: 'En mi mochila tengo un cuaderno de ciencias tres bolígrafos y una regla',
        difficulty: 'beginner',
        phoneticGuide: 'dan mon sak a do zhe un ka-ye de sians trua sti-lo e un re-gl',
      },
    ],
    createdAt: '2026-03-03T11:00:00Z',
    updatedAt: '2026-03-03T11:00:00Z',
  },
  {
    id: 'lesson-fr-voyage-a2',
    title: 'Voyage en TGV à la Gare de Lyon & Orientation',
    topic: 'Transports, Billetterie & Tourisme en France · DELF A2 Scolaire (CENNI 6)',
    language: 'fr',
    level: 'A2',
    avatarGender: 'female',
    avatarName: 'Sophie',
    avatarVoice: 'fr-FR-DeniseNeural',
    avatarImage: '/images/languages/3d/mentor_female_3d.webp',
    defaultSpeed: 0.88,
    dialogue: [
      {
        id: 'd-fr-a2-1',
        speaker: 'avatar',
        text: 'Bienvenue à la Gare de Lyon à Paris ! Quelle est votre destination aujourd’hui ?',
        translationEs: '¡Bienvenido a la Estación de Lyon en París! ¿Cuál es su destino el día de hoy?',
        phoneticTip: 'Cuida la vocal nasal [ɛ̃] en "Bienvenue" y [ɔ̃] en "Lyon / destination"',
      },
      {
        id: 'd-fr-a2-2',
        speaker: 'student',
        text: "Je voudrais réserver deux billets aller-retour en TGV pour Lyon, s'il vous plaît. Sur quel quai part le train ?",
        translationEs: 'Quisiera reservar dos boletos de ida y vuelta en tren de alta velocidad a Lyon, por favor. ¿De qué andén sale el tren?',
        phoneticTip: 'Pronuncia "quai" como [ke] y realiza la liaison en "deux_billets" sin sonar la x',
      },
      {
        id: 'd-fr-a2-3',
        speaker: 'avatar',
        text: "Parfait ! Le train à grande vitesse part de la voie numéro quatre dans quinze minutes. Bon voyage !",
        translationEs: '¡Perfecto! El tren de alta velocidad sale de la vía número cuatro en quince minutos. ¡Buen viaje!',
        phoneticTip: 'Fricativa labiodental sonora /v/ en "vitesse", "voie" y "voyage"',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-fr-a2-1',
        targetText: "Je voudrais réserver deux billets aller-retour en train pour Lyon s'il vous plaît",
        translationEs: 'Quisiera reservar dos boletos redondos en tren para Lyon por favor',
        difficulty: 'intermediate',
        phoneticGuide: 'zhe vu-dre re-zer-ve deu bi-ye a-le re-tur an tran pur lion sil vu ple',
      },
      {
        id: 'k-fr-a2-2',
        targetText: 'Le train à grande vitesse part de la voie numéro quatre dans quinze minutes',
        translationEs: 'El tren de alta velocidad sale de la vía número cuatro en quince minutos',
        difficulty: 'intermediate',
        phoneticGuide: 'le tran a grand vi-tes par de la vua nu-me-ro ka-tr dan kanz mi-nut',
      },
    ],
    createdAt: '2026-03-03T12:00:00Z',
    updatedAt: '2026-03-03T12:00:00Z',
  },
  {
    id: 'lesson-fr-ecologie-b1',
    title: "L'Innovation Scientifique, l'Écologie & l'Avenir Durable",
    topic: 'Environnement, Sciences & Argumentation · DELF B1 Junior (CENNI 9)',
    language: 'fr',
    level: 'B1',
    avatarGender: 'male',
    avatarName: 'Henri',
    avatarVoice: 'fr-FR-HenriNeural',
    avatarImage: '/images/languages/3d/mentor_male_3d_v2.webp',
    defaultSpeed: 0.88,
    dialogue: [
      {
        id: 'd-fr-b1-1',
        speaker: 'avatar',
        text: "Bonjour à tous ! Aujourd'hui, nous analysons comment les énergies renouvelables protègent notre biodiversité.",
        translationEs: '¡Buenos días a todos! Hoy analizamos cómo las energías renovables protegen nuestra biodiversidad.',
        phoneticTip: 'Enlaza "nous_analysons" [nuz‿analizɔ̃] y "les_énergies" [lez‿enɛʁʒi]',
      },
      {
        id: 'd-fr-b1-2',
        speaker: 'student',
        text: "À mon avis, il est essentiel que chaque citoyen réduise son empreinte carbone et utilise les transports écologiques.",
        translationEs: 'En mi opinión, es esencial que cada ciudadano reduzca su huella de carbono y utilice el transporte ecológico.',
        phoneticTip: 'Uso del subjuntivo francés tras "il est essentiel que": "réduise" [ʁedɥiz]',
      },
      {
        id: 'd-fr-b1-3',
        speaker: 'avatar',
        text: "Tout à fait ! Grâce à la recherche scientifique et à la solidarité internationale, nous bâtissons un avenir durable.",
        translationEs: '¡Totalmente de acuerdo! Gracias a la investigación científica y a la solidaridad internacional, construimos un futuro sostenible.',
        phoneticTip: 'Liaison en "Tout_à fait" [tut‿a fɛ] y vocal /y/ en "durable"',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-fr-b1-1',
        targetText: 'À mon avis il est essentiel que chaque citoyen protège notre biodiversité',
        translationEs: 'En mi opinión es esencial que cada ciudadano proteja nuestra biodiversidad',
        difficulty: 'intermediate',
        phoneticGuide: 'a mon a-vi il e e-san-siel ke shak si-tua-yan pro-tezh no-tr bio-di-ver-si-te',
      },
      {
        id: 'k-fr-b1-2',
        targetText: 'Grâce à la recherche scientifique nous bâtissons ensemble un avenir durable',
        translationEs: 'Gracias a la investigación científica construimos juntos un futuro sostenible',
        difficulty: 'advanced',
        phoneticGuide: 'gras a la re-shersh sian-ti-fik nu ba-ti-son an-sanbl un a-ve-nir du-ra-bl',
      },
    ],
    createdAt: '2026-03-03T13:00:00Z',
    updatedAt: '2026-03-03T13:00:00Z',
  },
  {
    id: 'lesson-fr-curie-b1',
    title: 'Inmersión 1ª Persona: Marie Curie & la Découverte du Radium',
    topic: 'Femmes de Science à Paris en 1ª Persona · DELF B1/B2 (CENNI 10)',
    language: 'fr',
    level: 'B1',
    avatarGender: 'female',
    avatarName: 'Marie Curie',
    avatarVoice: 'fr-FR-DeniseNeural',
    avatarImage: '/images/languages/3d/marie_curie_3d.webp',
    historicalFigureId: 'marie_curie',
    defaultSpeed: 0.86,
    dialogue: [
      {
        id: 'd-curie-1',
        speaker: 'avatar',
        text: "Je suis Marie Curie. Dans mon modeste laboratoire à Paris, avec Pierre Curie, j'ai découvert deux éléments radioactifs : le polonium et le radium.",
        translationEs: 'Soy Marie Curie. En mi modesto laboratorio en París, junto a Pierre Curie, descubrí dos elementos radiactivos: el polonio y el radio.',
        phoneticTip: 'Articulación clara del passé composé en 1ª persona: "j\'ai découvert" [ʒe dekuvɛʁ]',
      },
      {
        id: 'd-curie-2',
        speaker: 'student',
        text: 'Madame Curie, quel conseil donnez-vous aux jeunes étudiants passionnés par la science ?',
        translationEs: 'Señora Curie, ¿qué consejo da usted a los jóvenes estudiantes apasionados por la ciencia?',
        phoneticTip: 'Liaison cortés en "aux_jeunes_étudiants"',
      },
      {
        id: 'd-curie-3',
        speaker: 'avatar',
        text: "Dans la vie, rien n'est à craindre, tout est à comprendre. Cultivez toujours votre curiosité scientifique !",
        translationEs: 'En la vida, nada hay que temer, todo hay que comprender. ¡Cultiven siempre su curiosidad científica!',
        phoneticTip: 'Contraste nasal entre "craindre" [kʁɛ̃dʁ] y "comprendre" [kɔ̃pʁɑ̃dʁ]',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-curie-1',
        targetText: "Je suis Marie Curie et dans mon laboratoire à Paris j'ai découvert le radium",
        translationEs: 'Soy Marie Curie y en mi laboratorio en París descubrí el radio',
        difficulty: 'intermediate',
        phoneticGuide: 'zhe sui ma-ri ku-ri e dan mon la-bo-ra-tuar a pa-ri zhe de-ku-ver le ra-diom',
      },
      {
        id: 'k-curie-2',
        targetText: "Dans la vie rien n'est à craindre tout est à comprendre par la science",
        translationEs: 'En la vida nada hay que temer todo hay que comprender mediante la ciencia',
        difficulty: 'advanced',
        phoneticGuide: 'dan la vi rian ne ta krandr tu te ta kom-prandr par la sians',
      },
    ],
    createdAt: '2026-03-03T14:00:00Z',
    updatedAt: '2026-03-03T14:00:00Z',
  },
  {
    id: 'lesson-fr-napoleon',
    title: "Inmersión 1ª Persona: L'Épopée et le Code Civil des Français",
    topic: 'Histoire de France & Droit Moderne en 1ª Persona · DELF B2 (CENNI 12)',
    language: 'fr',
    level: 'B2',
    avatarGender: 'male',
    avatarName: 'Napoléon Bonaparte',
    avatarVoice: 'fr-FR-HenriNeural',
    avatarImage: '/images/languages/3d/napoleon_3d.webp',
    historicalFigureId: 'napoleon',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-nap-1',
        speaker: 'avatar',
        text: "Je suis Napoléon Bonaparte, né à Ajaccio en Corse. J'ai réorganisé l'administration française, fondé les lycées et promulgué le Code civil.",
        translationEs: 'Soy Napoleón Bonaparte, nacido en Ajaccio en Córcega. Reorganicé la administración francesa, fundé los liceos y promulgué el Código Civil.',
        phoneticTip: 'Articulación solemne de las vocales nasales y enlaces consonánticos',
      },
      {
        id: 'd-nap-2',
        speaker: 'student',
        text: 'Où êtes-vous né et quelle a été votre réforme la plus durable pour la France ?',
        translationEs: '¿Dónde nació usted y cuál fue su reforma más duradera para Francia?',
        phoneticTip: 'Liaison obligatoria en "êtes-vous" y vocal /y/ en "durable"',
      },
      {
        id: 'd-nap-3',
        speaker: 'avatar',
        text: "Je suis né en Corse en 1769. Ma vraie gloire n'est pas d'avoir gagné quarante batailles ; ce qui vivra éternellement, c'est mon Code civil !",
        translationEs: 'Nací en Córcega en 1769. Mi verdadera gloria no es haber ganado cuarenta batallas; ¡lo que vivirá eternamente es mi Código Civil!',
        phoneticTip: 'Entonación enfática y clara en "c\'est mon Code civil"',
      },
    ],
    karaokePhrases: [
      {
        id: 'k-nap-1',
        targetText: "Je suis Napoléon Bonaparte et j'ai promulgué le Code civil des Français",
        translationEs: 'Soy Napoleón Bonaparte y promulgué el Código Civil de los franceses',
        difficulty: 'advanced',
        phoneticGuide: 'zhe sui na-po-le-on bo-na-part e zhe pro-mul-ge le kod si-vil de fran-se',
      },
    ],
    createdAt: '2026-03-04T12:00:00Z',
    updatedAt: '2026-03-04T12:00:00Z',
  },
];

/**
 * Detecta el idioma auténtico de una lección inspeccionando su título y frases,
 * para reparar automáticamente cualquier lección en localStorage cuyo campo `language`
 * haya sido mutado accidentalmente (ej. lección en inglés marcada como `fr`).
 */
export function detectTrueLanguageOfLesson(lesson: LanguageLesson): LanguageCode {
  const sample = `${lesson.title || ''} ${lesson.topic || ''} ${lesson.dialogue?.[0]?.text || ''} ${
    lesson.karaokePhrases?.[0]?.targetText || ''
  }`.toLowerCase();

  const englishSignals =
    /\b(my daily school|science lab|ordering at a|good morning|what would you like|welcome to the|royal orchard|cappuccino|blueberry muffin|shakespeare|ada lovelace|abraham lincoln|globe theatre|kinetic energy|return tickets|platform|week \d+|starts at eight in the morning|excuse me teacher)\b/i;
  const frenchSignals =
    /\b(bonjour|bienvenue|je voudrais|brasserie|croissant|s'il vous plaît|emploi du temps|collège|laboratoire de sciences|gare de lyon|aller-retour|napoléon|marie curie|victor hugo|jeanne d'arc|code civil|énergies renouvelables|semaine \d+|huit heures du matin)\b/i;

  if (englishSignals.test(sample) && !frenchSignals.test(sample)) {
    return 'en';
  }
  if (frenchSignals.test(sample) && !englishSignals.test(sample)) {
    return 'fr';
  }
  return lesson.language === 'fr' ? 'fr' : 'en';
}

/**
 * Repara lecciones contaminadas en localStorage y garantiza que los 4 niveles CEFR (A1, A2, B1, B2)
 * existan completos tanto para Inglés (en) como para Francés (fr).
 */
export function sanitizeAndEnsureCompleteCatalog(rawLessons: LanguageLesson[]): LanguageLesson[] {
  const repaired: LanguageLesson[] = [];
  const seenKeys = new Set<string>();

  for (const item of rawLessons || []) {
    if (!item || !item.title) continue;
    const trueLang = detectTrueLanguageOfLesson(item);
    const wasMutated = item.language !== trueLang;

    let fixedAvatarName = item.avatarName;
    let fixedAvatarVoice = item.avatarVoice;
    let fixedGender = item.avatarGender;

    if (wasMutated && !item.historicalFigureId) {
      if (trueLang === 'en') {
        fixedAvatarName = fixedGender === 'male' ? 'Arthur' : 'Claire';
        fixedAvatarVoice = fixedGender === 'male' ? 'en-US-GuyNeural' : 'en-US-JennyNeural';
      } else {
        fixedAvatarName = fixedGender === 'male' ? 'Henri' : 'Sophie';
        fixedAvatarVoice = fixedGender === 'male' ? 'fr-FR-HenriNeural' : 'fr-FR-DeniseNeural';
      }
    }

    // Normalizar nivel a A1 | A2 | B1 | B2
    const rawLevel = String(item.level || 'A1').toUpperCase();
    const normalizedLevel: 'A1' | 'A2' | 'B1' | 'B2' = rawLevel.startsWith('B2')
      ? 'B2'
      : rawLevel.startsWith('B1')
        ? 'B1'
        : rawLevel.startsWith('A2')
          ? 'A2'
          : 'A1';

    const cleanLesson: LanguageLesson = {
      ...item,
      language: trueLang,
      level: normalizedLevel,
      avatarName: fixedAvatarName,
      avatarVoice: fixedAvatarVoice,
    };

    const key = `${cleanLesson.language}-${cleanLesson.title.trim().toLowerCase()}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      repaired.push(cleanLesson);
    }
  }

  // Asegurar que todas las lecciones maestras oficiales (A1, A2, B1, B2 en EN y FR) estén disponibles
  for (const master of INITIAL_LESSONS) {
    const key = `${master.language}-${master.title.trim().toLowerCase()}`;
    const existingIdx = repaired.findIndex(
      (r) =>
        r.id === master.id ||
        `${r.language}-${r.title.trim().toLowerCase()}` === key
    );
    if (existingIdx === -1) {
      seenKeys.add(key);
      repaired.push(master);
    } else {
      // Si es una de las lecciones oficiales base, garantizar que tenga su idioma, nivel y avatar 3D canónicos
      repaired[existingIdx] = {
        ...repaired[existingIdx],
        language: master.language,
        level: master.level,
        avatarImage: master.avatarImage,
      };
    }
  }

  return repaired;
}

const INITIAL_REPORTS: StudentPronunciationReport[] = [
  {
    id: 'mock-rep-1',
    studentId: 'stud-101',
    studentName: 'Mateo Hernández',
    studentAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    lessonId: 'lesson-en-coffee',
    lessonTitle: 'Ordering at a Café & Pleasantries',
    language: 'en',
    phraseId: 'k-1',
    targetPhrase: 'I would like a warm cappuccino and a fresh blueberry muffin please',
    spokenTranscript: 'I would like a warm capuccino and fresh bluberi muffin please',
    overallAccuracy: 88,
    correctWords: ['I', 'would', 'like', 'a', 'warm', 'and', 'muffin', 'please'],
    mispronouncedWords: ['cappuccino', 'fresh', 'blueberry'],
    speedPpm: 124,
    timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    reviewedByTeacher: false,
  },
  {
    id: 'mock-rep-2',
    studentId: 'stud-102',
    studentName: 'Sofía Valenzuela',
    studentAvatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    lessonId: 'lesson-en-coffee',
    lessonTitle: 'Ordering at a Café & Pleasantries',
    language: 'en',
    phraseId: 'k-1',
    targetPhrase: 'I would like a warm cappuccino and a fresh blueberry muffin please',
    spokenTranscript: 'I would like a warm cappuccino and a fresh blueberry muffin please',
    overallAccuracy: 100,
    correctWords: [
      'I',
      'would',
      'like',
      'a',
      'warm',
      'cappuccino',
      'and',
      'a',
      'fresh',
      'blueberry',
      'muffin',
      'please',
    ],
    mispronouncedWords: [],
    speedPpm: 138,
    timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
    reviewedByTeacher: true,
  },
  {
    id: 'mock-rep-fr-1',
    studentId: 'stud-103',
    studentName: 'Camila Regina Villaseñor',
    studentAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    lessonId: 'lesson-fr-paris',
    lessonTitle: 'Une Conversation Douce à la Brasserie de Paris',
    language: 'fr',
    phraseId: 'k-6',
    targetPhrase:
      "Bonjour madame je voudrais un croissant chaud et un chocolat au lait s'il vous plaît",
    spokenTranscript:
      "Bonjour madame je voudrais un croissant chaud et un chocolat au lait s'il vous plaît",
    overallAccuracy: 96,
    correctWords: [
      'Bonjour',
      'madame',
      'je',
      'voudrais',
      'un',
      'croissant',
      'chaud',
      'et',
      'un',
      'chocolat',
      'au',
      'lait',
      "s'il",
      'vous',
      'plaît',
    ],
    mispronouncedWords: [],
    speedPpm: 132,
    timestamp: new Date(Date.now() - 1000 * 60 * 9).toISOString(),
    reviewedByTeacher: false,
  },
  {
    id: 'mock-rep-fr-2',
    studentId: 'stud-104',
    studentName: 'Diego Emiliano Santillán',
    studentAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    lessonId: 'lesson-fr-college-a1',
    lessonTitle: 'Mon Emploi du Temps au Collège & le Laboratoire',
    language: 'fr',
    phraseId: 'k-fr-col-1',
    targetPhrase:
      'Notre séance au laboratoire de sciences commence exactement à huit heures du matin',
    spokenTranscript:
      'Notre séance au laboratoire de sciences commence exactement à huit heures du matin',
    overallAccuracy: 84,
    correctWords: [
      'Notre',
      'séance',
      'au',
      'laboratoire',
      'de',
      'sciences',
      'commence',
      'à',
      'du',
      'matin',
    ],
    mispronouncedWords: ['exactement', 'huit', 'heures'],
    speedPpm: 118,
    timestamp: new Date(Date.now() - 1000 * 60 * 14).toISOString(),
    reviewedByTeacher: false,
  },
];

export const useLanguagesStore = create<LanguagesState>()(
  persist(
    (set, get) => ({
      lessons: INITIAL_LESSONS,
      activeLessonId: INITIAL_LESSONS[0].id,
      studentReports: INITIAL_REPORTS,

      setActiveLessonId: (id: string) => set({ activeLessonId: id }),

      addLesson: (lessonData) => {
        const normalizedTitle = lessonData.title.trim().toLowerCase();
        const existing = get().lessons.find(
          (l) =>
            l.title.trim().toLowerCase() === normalizedTitle &&
            l.language === lessonData.language
        );

        if (existing) {
          get().updateLesson(existing.id, lessonData);
          set({ activeLessonId: existing.id });
          return existing.id;
        }

        const id = `lesson-${Date.now()}`;
        const newLesson: LanguageLesson = {
          ...lessonData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          lessons: [newLesson, ...state.lessons],
          activeLessonId: id,
        }));
        return id;
      },

      updateLesson: (id: string, updates: Partial<LanguageLesson>) => {
        set((state) => ({
          lessons: state.lessons.map((lesson) =>
            lesson.id === id
              ? { ...lesson, ...updates, updatedAt: new Date().toISOString() }
              : lesson
          ),
        }));
      },

      deleteLesson: (id: string) => {
        set((state) => {
          const filtered = state.lessons.filter((l) => l.id !== id);
          const finalLessons = filtered.length > 0 ? filtered : [INITIAL_LESSONS[0]];
          const nextActive = finalLessons.some((l) => l.id === state.activeLessonId)
            ? state.activeLessonId
            : finalLessons[0].id;
          return {
            lessons: finalLessons,
            activeLessonId: nextActive,
          };
        });
      },

      deduplicateLessons: () => {
        set((state) => {
          const sanitized = sanitizeAndEnsureCompleteCatalog(state.lessons);
          const finalLessons = sanitized.length > 0 ? sanitized : INITIAL_LESSONS;
          const nextActive = finalLessons.some((l) => l.id === state.activeLessonId)
            ? state.activeLessonId
            : finalLessons[0].id;
          return {
            lessons: finalLessons,
            activeLessonId: nextActive,
          };
        });
      },

      submitStudentReport: (reportData) => {
        const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const fullReport: StudentPronunciationReport = {
          ...reportData,
          id,
          timestamp: new Date().toISOString(),
          reviewedByTeacher: false,
        };
        set((state) => ({
          studentReports: [fullReport, ...state.studentReports],
        }));
      },

      markReportAsReviewed: (id: string) => {
        set((state) => ({
          studentReports: state.studentReports.map((rep) =>
            rep.id === id ? { ...rep, reviewedByTeacher: true } : rep
          ),
        }));
      },

      clearAllReports: () => set({ studentReports: [] }),

      getReportsForLesson: (lessonId: string) => {
        return get().studentReports.filter((r) => r.lessonId === lessonId);
      },
    }),
    {
      name: 'iskool-languages-storage',
      partialize: (state) => ({
        lessons: state.lessons,
        studentReports: state.studentReports,
        activeLessonId: state.activeLessonId,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.lessons)) {
          const sanitized = sanitizeAndEnsureCompleteCatalog(state.lessons);
          state.lessons = sanitized;
          if (!sanitized.some((l) => l.id === state.activeLessonId)) {
            state.activeLessonId = sanitized[0].id;
          }
          // Asegurar que también existan reportes de ejemplo para Francés e Inglés
          if (Array.isArray(state.studentReports)) {
            for (const baseRep of INITIAL_REPORTS) {
              if (!state.studentReports.some((r) => r.id === baseRep.id)) {
                state.studentReports.push(baseRep);
              }
            }
          }
        }
      },
    }
  )
);
