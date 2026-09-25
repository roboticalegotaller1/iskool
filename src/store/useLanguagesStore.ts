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
  
  // Reportes en tiempo real del alumno al profesor
  submitStudentReport: (report: Omit<StudentPronunciationReport, 'id' | 'timestamp'>) => void;
  markReportAsReviewed: (id: string) => void;
  clearAllReports: () => void;
  getReportsForLesson: (lessonId: string) => StudentPronunciationReport[];
}

const INITIAL_LESSONS: LanguageLesson[] = [
  {
    id: 'lesson-en-coffee',
    title: 'Ordering at a Café & Pleasantries',
    topic: 'Vida Cotidiana & Cortesía',
    language: 'en',
    level: 'A1',
    avatarGender: 'female',
    avatarName: 'Claire',
    avatarVoice: 'en-US-JennyNeural',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'd-1',
        speaker: 'avatar',
        text: 'Good morning! Welcome to the Royal Orchard Café. What would you like today?',
        translationEs: '¡Buenos días! Bienvenido al Café Royal Orchard. ¿Qué le gustaría hoy?',
        phoneticTip: 'Presta atención a "would you like" [wʊd juː laɪk]'
      },
      {
        id: 'd-2',
        speaker: 'student',
        text: 'Hello! I would like a warm cappuccino and a fresh blueberry muffin, please.',
        translationEs: '¡Hola! Me gustaría un capuchino caliente y un panqué fresco de arándanos, por favor.',
        phoneticTip: 'Articula claramente "blueberry muffin" [ˈbluːberi ˈmʌfɪn]'
      },
      {
        id: 'd-3',
        speaker: 'avatar',
        text: 'Excellent choice! Would you prefer oat milk or regular whole milk for your beverage?',
        translationEs: '¡Excelente elección! ¿Prefiere leche de avena o leche entera regular para su bebida?'
      },
      {
        id: 'd-4',
        speaker: 'student',
        text: 'Oat milk sounds perfect, thank you so much for asking!',
        translationEs: 'Leche de avena suena perfecto, ¡muchas gracias por preguntar!'
      }
    ],
    karaokePhrases: [
      {
        id: 'k-1',
        targetText: 'I would like a warm cappuccino and a fresh blueberry muffin please',
        translationEs: 'Me gustaría un capuchino caliente y un panqué fresco de arándanos por favor',
        difficulty: 'beginner',
        phoneticGuide: 'ai wʊd laɪk ə wɔːrm kæpʊˈtʃiːnoʊ ænd ə freʃ ˈbluːberi ˈmʌfɪn pliːz'
      },
      {
        id: 'k-2',
        targetText: 'Could you please recommend your most popular breakfast pastry today',
        translationEs: '¿Podría por favor recomendar su pan de desayuno más popular hoy?',
        difficulty: 'intermediate',
        phoneticGuide: 'kʊd juː pliːz rekəˈmend jɔːr moʊst ˈpɑːpjələr ˈbrekfəst ˈpeɪstri təˈdeɪ'
      },
      {
        id: 'k-3',
        targetText: 'The weather is absolutely magnificent for a morning walk in the park',
        translationEs: 'El clima es absolutamente magnífico para una caminata matutina en el parque',
        difficulty: 'advanced',
        phoneticGuide: 'ðə ˈweðər ɪz ˌæbsəˈluːtli mæɡˈnɪfɪsnt fɔːr ə ˈmɔːrnɪŋ wɔːk ɪn ðə pɑːrk'
      }
    ],
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z'
  },
  {
    id: 'lesson-fr-cafe',
    title: 'Une Conversation Douce à Paris',
    topic: 'Turismo & Saludos',
    language: 'fr',
    level: 'A1',
    avatarGender: 'female',
    avatarName: 'Sophie',
    avatarVoice: 'fr-FR-DeniseNeural',
    defaultSpeed: 0.85,
    dialogue: [
      {
        id: 'fr-d-1',
        speaker: 'avatar',
        text: 'Bonjour et bienvenue à la brasserie! Comment puis-je vous aider aujourd’hui?',
        translationEs: '¡Buenos días y bienvenido a la brasería! ¿Cómo puedo ayudarle hoy?',
        phoneticTip: 'Pronuncia "aujourd’hui" con suavidad: [o-zhoor-dwee]'
      },
      {
        id: 'fr-d-2',
        speaker: 'student',
        text: 'Bonjour madame! Je voudrais un croissant croustillant et un café au lait, s’il vous plaît.',
        translationEs: '¡Buenos días señora! Quisiera un cuernito crujiente y un café con leche, por favor.',
        phoneticTip: 'Haz la erre francesa en "croissant" [kʁwa.sɑ̃]'
      },
      {
        id: 'fr-d-3',
        speaker: 'avatar',
        text: 'Très bien, avec grand plaisir! Vous préférez vous asseoir en terrasse ou à l’intérieur?',
        translationEs: '¡Muy bien, con gran gusto! ¿Prefiere sentarse en la terraza o en el interior?'
      }
    ],
    karaokePhrases: [
      {
        id: 'fr-k-1',
        targetText: 'Je voudrais un croissant croustillant et un café au lait s’il vous plaît',
        translationEs: 'Quisiera un cuernito crujiente y un café con leche por favor',
        difficulty: 'beginner',
        phoneticGuide: 'zhuh voo-dreh uhn krwah-sahn kroos-tee-yahn eh uhn kah-feh oh leh seel voo pleh'
      },
      {
        id: 'fr-k-2',
        targetText: 'C’est un véritable plaisir de découvrir les merveilleux musées de Paris',
        translationEs: 'Es un verdadero placer descubrir los maravillosos museos de París',
        difficulty: 'intermediate',
        phoneticGuide: 'seh tuhn veh-ree-tahbl pleh-zeer duh deh-koo-vreer leh mehr-veh-yuh moo-zeh'
      }
    ],
    createdAt: '2026-09-20T10:30:00.000Z',
    updatedAt: '2026-09-20T10:30:00.000Z'
  },
  {
    id: 'lesson-en-science',
    title: 'The Wonders of Scientific Discovery',
    topic: 'Ciencias & Tecnología',
    language: 'en',
    level: 'B1',
    avatarGender: 'male',
    avatarName: 'Arthur',
    avatarVoice: 'en-US-GuyNeural',
    defaultSpeed: 0.9,
    dialogue: [
      {
        id: 'sci-1',
        speaker: 'avatar',
        text: 'Welcome explorers! Today we investigate how kinetic energy transforms into thermal equilibrium.',
        translationEs: '¡Bienvenidos exploradores! Hoy investigamos cómo la energía cinética se transforma en equilibrio térmico.'
      },
      {
        id: 'sci-2',
        speaker: 'student',
        text: 'Fascinating! Does heat always flow from higher to lower thermal agitation?',
        translationEs: '¡Fascinante! ¿El calor siempre fluye de mayor a menor agitación térmica?'
      }
    ],
    karaokePhrases: [
      {
        id: 'sci-k-1',
        targetText: 'Thermal energy transfers spontaneously from warmer objects to colder surroundings',
        translationEs: 'La energía térmica se transfiere espontáneamente de objetos más tibios a entornos más fríos',
        difficulty: 'intermediate',
        phoneticGuide: 'ˈθɜːrml ˈenərdʒi trænsˈfɜːrz spɑːnˈteɪniəsli frəm ˈwɔːrmər ˈɑːbdʒekts tuː ˈkoʊldər'
      }
    ],
    createdAt: '2026-09-20T11:00:00.000Z',
    updatedAt: '2026-09-20T11:00:00.000Z'
  },
  {
    id: 'lesson-hist-shakespeare',
    title: 'The Poetry of the Globe Theatre',
    topic: 'Literatura Clásica & Retórica',
    language: 'en',
    level: 'B2',
    avatarGender: 'male',
    avatarName: 'William Shakespeare',
    avatarVoice: 'en-GB-RyanNeural',
    avatarImage: '/images/languages/historical/shakespeare.jpg',
    historicalFigureId: 'shakespeare',
    defaultSpeed: 0.88,
    dialogue: [
      {
        id: 'shk-1',
        speaker: 'avatar',
        text: 'I am William Shakespeare. I was born in Stratford-upon-Avon, and upon the boards of the Globe Theatre in London, I crafted the tragedies of Hamlet and Macbeth.',
        translationEs: 'Soy William Shakespeare. Nací en Stratford-upon-Avon, y sobre las tablas del Teatro Globe en Londres, forjé las tragedias de Hamlet y Macbeth.',
        phoneticTip: 'Articula la métrica del verso con cadencia rítmica británica'
      },
      {
        id: 'shk-2',
        speaker: 'student',
        text: 'Where did you write your immortal sonnets and magnificent plays?',
        translationEs: '¿Dónde escribiste tus inmortales sonetos y magníficas obras?'
      },
      {
        id: 'shk-3',
        speaker: 'avatar',
        text: 'All the world is a stage, and all the men and women merely players. They have their exits and their entrances.',
        translationEs: 'El mundo entero es un escenario, y todos los hombres y mujeres meros actores. Tienen sus salidas y sus entradas.'
      }
    ],
    karaokePhrases: [
      {
        id: 'shk-k-1',
        targetText: 'All the world is a stage and all the men and women merely players',
        translationEs: 'El mundo entero es un escenario y todos los hombres y mujeres meros actores',
        difficulty: 'advanced',
        phoneticGuide: 'ɔːl ðə wɜːrld ɪz ə steɪdʒ ænd ɔːl ðə men ænd ˈwɪmɪn ˈmɪərli ˈpleɪərz'
      }
    ],
    createdAt: '2026-09-25T10:00:00.000Z',
    updatedAt: '2026-09-25T10:00:00.000Z'
  },
  {
    id: 'lesson-hist-napoleon',
    title: 'L\'Épopée et le Code Civil des Français',
    topic: 'Histoire & Éloquence Publique',
    language: 'fr',
    level: 'B2',
    avatarGender: 'male',
    avatarName: 'Napoléon Bonaparte',
    avatarVoice: 'fr-FR-HenriNeural',
    avatarImage: '/images/languages/historical/napoleon.jpg',
    historicalFigureId: 'napoleon',
    defaultSpeed: 0.88,
    dialogue: [
      {
        id: 'nap-1',
        speaker: 'avatar',
        text: 'Je suis Napoléon Bonaparte, né à Ajaccio en Corse. J\'ai réorganisé l\'administration, promulgué le Code Civil et conduit les armées de la République.',
        translationEs: 'Soy Napoleón Bonaparte, nacido en Ajaccio en Córcega. Reorganicé la administración, promulgué el Código Civil y conduje los ejércitos de la República.',
        phoneticTip: 'Éloquence martiale et liaisons soignées: [napɔleɔ̃ bɔnapaʁt]'
      },
      {
        id: 'nap-2',
        speaker: 'student',
        text: 'Comment avez-vous rédigé le Code Civil des Français?',
        translationEs: '¿Cómo redactó usted el Código Civil de los Franceses?'
      },
      {
        id: 'nap-3',
        speaker: 'avatar',
        text: 'Ma vraie gloire n\'est pas d\'avoir gagné quarante batailles. Ce que rien n\'effacera, ce qui vivra éternellement, c\'est mon Code Civil.',
        translationEs: 'Mi verdadera gloria no es haber ganado cuarenta batallas. Lo que nada borrará, lo que vivirá eternamente, es mi Código Civil.'
      }
    ],
    karaokePhrases: [
      {
        id: 'nap-k-1',
        targetText: 'Ce que rien n\'effacera et ce qui vivra éternellement c\'est mon Code Civil',
        translationEs: 'Lo que nada borrará y lo que vivirá eternamente es mi Código Civil',
        difficulty: 'advanced',
        phoneticGuide: 'sə kə ʁjɛ̃ nefasʁa e sə ki vivʁa etɛʁnɛləmɑ̃ sɛ mɔ̃ kɔd sivil'
      }
    ],
    createdAt: '2026-09-25T10:05:00.000Z',
    updatedAt: '2026-09-25T10:05:00.000Z'
  }
];

export const useLanguagesStore = create<LanguagesState>()(
  persist(
    (set, get) => ({
      lessons: INITIAL_LESSONS,
      activeLessonId: INITIAL_LESSONS[0].id,
      studentReports: [
        {
          id: 'mock-rep-1',
          studentId: 'stud-101',
          studentName: 'Mateo Hernández',
          studentAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
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
          reviewedByTeacher: false
        },
        {
          id: 'mock-rep-2',
          studentId: 'stud-102',
          studentName: 'Sofía Valenzuela',
          studentAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
          lessonId: 'lesson-en-coffee',
          lessonTitle: 'Ordering at a Café & Pleasantries',
          language: 'en',
          phraseId: 'k-1',
          targetPhrase: 'I would like a warm cappuccino and a fresh blueberry muffin please',
          spokenTranscript: 'I would like a warm cappuccino and a fresh blueberry muffin please',
          overallAccuracy: 100,
          correctWords: ['I', 'would', 'like', 'a', 'warm', 'cappuccino', 'and', 'a', 'fresh', 'blueberry', 'muffin', 'please'],
          mispronouncedWords: [],
          speedPpm: 138,
          timestamp: new Date(Date.now() - 1000 * 60 * 4).toISOString(),
          reviewedByTeacher: true
        }
      ],

      setActiveLessonId: (id: string) => set({ activeLessonId: id }),

      addLesson: (lessonData) => {
        const id = `lesson-${Date.now()}`;
        const newLesson: LanguageLesson = {
          ...lessonData,
          id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        set(state => ({
          lessons: [newLesson, ...state.lessons],
          activeLessonId: id
        }));
        return id;
      },

      updateLesson: (id: string, updates: Partial<LanguageLesson>) => {
        set(state => ({
          lessons: state.lessons.map(lesson => 
            lesson.id === id 
              ? { ...lesson, ...updates, updatedAt: new Date().toISOString() } 
              : lesson
          )
        }));
      },

      deleteLesson: (id: string) => {
        set(state => {
          const filtered = state.lessons.filter(l => l.id !== id);
          const nextActive = filtered[0]?.id || '';
          return {
            lessons: filtered,
            activeLessonId: state.activeLessonId === id ? nextActive : state.activeLessonId
          };
        });
      },

      submitStudentReport: (reportData) => {
        const id = `rep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const fullReport: StudentPronunciationReport = {
          ...reportData,
          id,
          timestamp: new Date().toISOString(),
          reviewedByTeacher: false
        };
        set(state => ({
          studentReports: [fullReport, ...state.studentReports]
        }));
      },

      markReportAsReviewed: (id: string) => {
        set(state => ({
          studentReports: state.studentReports.map(rep => 
            rep.id === id ? { ...rep, reviewedByTeacher: true } : rep
          )
        }));
      },

      clearAllReports: () => set({ studentReports: [] }),

      getReportsForLesson: (lessonId: string) => {
        return get().studentReports.filter(r => r.lessonId === lessonId);
      }
    }),
    {
      name: 'iskool-languages-storage',
      partialize: (state) => ({
        lessons: state.lessons,
        studentReports: state.studentReports,
        activeLessonId: state.activeLessonId
      })
    }
  )
);
