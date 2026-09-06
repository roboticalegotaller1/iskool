"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  ClassroomEdicto, 
  SocioemotionalCheckin, 
  LivePoll, 
  RandomHeroPickerLog, 
  StudentSubmission,
  ImportedStudentRow,
  EdictoComment
} from '@/types/classroom';

// Edictos Semilla Iniciales
const SEED_EDICTOS: ClassroomEdicto[] = [
  {
    id: 'edicto-1',
    teacherId: 'usr-teacher-1',
    teacherName: 'Prof. Roberto González',
    groupId: 'grp-4a',
    groupName: '4º A - Primaria',
    title: '⚡ ¡Gran Torneo de Lógica Matemática y Pensamiento Computacional!',
    content: 'Estimados héroes del aula: Esta semana todas las misiones de Lógica y Circuitos Booleanos otorgan un bono especial del +50% de XP y Galeones. ¡Resuelvan los desafíos del tablero y consigan el cofre del Saber!',
    type: 'xp_event',
    priority: 'pinned',
    xpBonusPercent: 50,
    coinsBonus: 35,
    linkedActivityId: 'comm-logic-11',
    linkedActivityTitle: 'Las Comidas de la Semana y sus Restricciones (Fase 4)',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    likesCount: 14,
    likedByStudentIds: ['std-1', 'std-2', 'std-3', 'std-4'],
    comments: [
      {
        id: 'comm-101',
        authorId: 'std-1',
        authorName: 'Mateo Morales',
        authorRole: 'student',
        text: '¡Profe, ya resolví el reto del robot jardinero! La pista de la cinta me ayudó mucho ⭐',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        isHelperAwarded: true
      },
      {
        id: 'comm-102',
        authorId: 'usr-teacher-1',
        authorName: 'Prof. Roberto González',
        authorRole: 'teacher',
        text: '¡Excelente Mateo! Has ganado la insignia de Compañero Solidario por apoyar en el foro.',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]
  },
  {
    id: 'edicto-2',
    teacherId: 'usr-teacher-1',
    teacherName: 'Prof. Roberto González',
    groupId: 'grp-4a',
    groupName: '4º A - Primaria',
    title: '🌿 Entrega de Maqueta: Ecosistemas y Desarrollo Sustentable',
    content: 'Recuerden que la fecha límite para subir la foto de su artefacto o la nota de voz explicando el ciclo del agua es el próximo viernes. ¡No olviden completar su autoevaluación reflexiva para reclamar el cofre de puntualidad!',
    type: 'challenge_quest',
    priority: 'urgent',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    likesCount: 9,
    likedByStudentIds: ['std-2', 'std-5'],
    comments: []
  }
];

// Registros de Termómetro Socioemocional Semilla
const SEED_CHECKINS: SocioemotionalCheckin[] = [
  { id: 'chk-1', studentId: 'std-1', studentName: 'Mateo Morales', groupId: 'grp-4a', date: new Date().toISOString().split('T')[0], mood: 'energized', note: '¡Listo para ganar XP!', createdAt: new Date().toISOString() },
  { id: 'chk-2', studentId: 'std-2', studentName: 'Sofía Reyes', groupId: 'grp-4a', date: new Date().toISOString().split('T')[0], mood: 'motivated', createdAt: new Date().toISOString() },
  { id: 'chk-3', studentId: 'std-3', studentName: 'Lucas Hernández', groupId: 'grp-4a', date: new Date().toISOString().split('T')[0], mood: 'peaceful', createdAt: new Date().toISOString() },
  { id: 'chk-4', studentId: 'std-4', studentName: 'Valentina Castro', groupId: 'grp-4a', date: new Date().toISOString().split('T')[0], mood: 'tired', note: 'Dormí tarde haciendo la tarea de dibujo', createdAt: new Date().toISOString() },
  { id: 'chk-5', studentId: 'std-5', studentName: 'Diego Navarro', groupId: 'grp-4a', date: new Date().toISOString().split('T')[0], mood: 'motivated', createdAt: new Date().toISOString() }
];

// Entregas de Estudiantes Semilla
const SEED_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-001',
    questId: 'quest-eco-1',
    questTitle: 'Prototipo de Riego por Goteo Sustentable',
    studentId: 'std-1',
    studentName: 'Mateo Morales',
    groupId: 'grp-4a',
    submittedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 48).toISOString(),
    isSubmittedOnTime: true,
    evidenceType: 'image',
    evidenceUrl: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
    evidenceText: 'Construí un sistema de riego con botellas recicladas y mangueras perforadas para regar las plantas del huerto escolar sin desperdiciar agua.',
    reflection: {
      mainChallengeFaced: 'Calibrar la velocidad del goteo para que no inundara la tierra.',
      strategyUsed: 'Ajusté la presión usando un tapón regulador con orificio pequeño.',
      satisfactionRating: 5,
      prideHighlight: 'Logré que el agua dure 3 días continuos sin evaporarse rápido.'
    },
    status: 'pending_review',
    xpAwarded: 0,
    coinsAwarded: 0
  },
  {
    id: 'sub-002',
    questId: 'quest-eco-1',
    questTitle: 'Prototipo de Riego por Goteo Sustentable',
    studentId: 'std-2',
    studentName: 'Sofía Reyes',
    groupId: 'grp-4a',
    submittedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    dueDate: new Date(Date.now() + 3600000 * 48).toISOString(),
    isSubmittedOnTime: true,
    evidenceType: 'text_document',
    evidenceText: 'Documento de investigación sobre la captación de agua de lluvia y su filtrado con arena y carbón activo.',
    reflection: {
      mainChallengeFaced: 'Comprender cómo el carbón activado retiene partículas.',
      strategyUsed: 'Leí la infografía de la Bóveda Curricular de Ciencias.',
      satisfactionRating: 4,
      prideHighlight: 'El agua filtrada quedó completamente transparente.'
    },
    status: 'reviewed',
    teacherFeedback: '¡Excelente fundamentación científica Sofía! Tu informe demuestra un dominio sobresaliente del PDA de sustentabilidad.',
    evaluatedRubricLevels: {
      technical: 'avanzado',
      reflection: 'avanzado',
      evidence: 'logrado'
    },
    xpAwarded: 120,
    coinsAwarded: 35
  }
];

interface ClassroomStore {
  edictosList: ClassroomEdicto[];
  socioemotionalList: SocioemotionalCheckin[];
  activeLivePoll: LivePoll | null;
  heroPickerLogs: RandomHeroPickerLog[];
  submissionsList: StudentSubmission[];
  selectedGroupId: string;

  // Acciones
  setSelectedGroupId: (groupId: string) => void;
  addEdicto: (edicto: Omit<ClassroomEdicto, 'id' | 'createdAt' | 'likesCount' | 'likedByStudentIds' | 'comments'>) => void;
  deleteEdicto: (id: string) => void;
  toggleLikeEdicto: (edictoId: string, studentId: string) => void;
  addCommentToEdicto: (edictoId: string, comment: Omit<EdictoComment, 'id' | 'createdAt'>) => void;
  awardSolidarityBadge: (edictoId: string, commentId: string) => void;
  
  recordSocioemotionalCheckin: (checkin: Omit<SocioemotionalCheckin, 'id' | 'createdAt'>) => void;
  
  startLivePoll: (poll: Omit<LivePoll, 'id' | 'createdAt' | 'isActive'>) => void;
  voteLivePoll: (optionId: string, studentId: string) => void;
  closeLivePoll: () => void;
  
  logHeroPicker: (log: Omit<RandomHeroPickerLog, 'id' | 'timestamp'>) => void;
  
  submitStudentWork: (submission: Omit<StudentSubmission, 'id' | 'submittedAt' | 'isSubmittedOnTime' | 'status' | 'xpAwarded' | 'coinsAwarded'>) => void;
  evaluateSubmission: (submissionId: string, rubricLevels: Record<string, string>, feedback: string, xp: number, coins: number) => void;
  
  importStudentsBatch: (rows: ImportedStudentRow[]) => number;
}

export const useClassroomStore = create<ClassroomStore>()(
  persist(
    (set, get) => ({
      edictosList: SEED_EDICTOS,
      socioemotionalList: SEED_CHECKINS,
      activeLivePoll: null,
      heroPickerLogs: [],
      submissionsList: SEED_SUBMISSIONS,
      selectedGroupId: 'all',

      setSelectedGroupId: (groupId: string) => set({ selectedGroupId: groupId }),

      addEdicto: (edictoData) => {
        const newEdicto: ClassroomEdicto = {
          ...edictoData,
          id: `edicto-${Date.now()}`,
          createdAt: new Date().toISOString(),
          likesCount: 0,
          likedByStudentIds: [],
          comments: []
        };
        set(state => ({
          edictosList: [newEdicto, ...state.edictosList]
        }));
      },

      deleteEdicto: (id: string) => {
        set(state => ({
          edictosList: state.edictosList.filter(e => e.id !== id)
        }));
      },

      toggleLikeEdicto: (edictoId: string, studentId: string) => {
        set(state => ({
          edictosList: state.edictosList.map(e => {
            if (e.id !== edictoId) return e;
            const hasLiked = e.likedByStudentIds.includes(studentId);
            const updatedIds = hasLiked
              ? e.likedByStudentIds.filter(id => id !== studentId)
              : [...e.likedByStudentIds, studentId];
            return {
              ...e,
              likedByStudentIds: updatedIds,
              likesCount: updatedIds.length
            };
          })
        }));
      },

      addCommentToEdicto: (edictoId: string, commentData) => {
        const newComment: EdictoComment = {
          ...commentData,
          id: `comm-${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        set(state => ({
          edictosList: state.edictosList.map(e => {
            if (e.id !== edictoId) return e;
            return {
              ...e,
              comments: [...e.comments, newComment]
            };
          })
        }));
      },

      awardSolidarityBadge: (edictoId: string, commentId: string) => {
        set(state => ({
          edictosList: state.edictosList.map(e => {
            if (e.id !== edictoId) return e;
            return {
              ...e,
              comments: e.comments.map(c => {
                if (c.id !== commentId) return c;
                return { ...c, isHelperAwarded: true };
              })
            };
          })
        }));
      },

      recordSocioemotionalCheckin: (checkinData) => {
        const today = new Date().toISOString().split('T')[0];
        const newCheckin: SocioemotionalCheckin = {
          ...checkinData,
          id: `chk-${Date.now()}`,
          date: today,
          createdAt: new Date().toISOString()
        };
        set(state => {
          // Reemplazar si el alumno ya marcó hoy, o añadir nuevo
          const filtered = state.socioemotionalList.filter(
            c => !(c.studentId === checkinData.studentId && c.date === today)
          );
          return {
            socioemotionalList: [newCheckin, ...filtered]
          };
        });
      },

      startLivePoll: (pollData) => {
        const newPoll: LivePoll = {
          ...pollData,
          id: `poll-${Date.now()}`,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        set({ activeLivePoll: newPoll });
      },

      voteLivePoll: (optionId: string, studentId: string) => {
        set(state => {
          if (!state.activeLivePoll) return state;
          const updatedOptions = state.activeLivePoll.options.map(opt => {
            const hasVoted = opt.voterStudentIds.includes(studentId);
            if (opt.id === optionId) {
              if (hasVoted) return opt;
              return {
                ...opt,
                votesCount: opt.votesCount + 1,
                voterStudentIds: [...opt.voterStudentIds, studentId]
              };
            } else {
              // Remover voto si estaba en otra opción
              return {
                ...opt,
                votesCount: opt.voterStudentIds.filter(id => id !== studentId).length,
                voterStudentIds: opt.voterStudentIds.filter(id => id !== studentId)
              };
            }
          });
          return {
            activeLivePoll: {
              ...state.activeLivePoll,
              options: updatedOptions
            }
          };
        });
      },

      closeLivePoll: () => {
        set(state => ({
          activeLivePoll: state.activeLivePoll ? { ...state.activeLivePoll, isActive: false } : null
        }));
      },

      logHeroPicker: (logData) => {
        const newLog: RandomHeroPickerLog = {
          ...logData,
          id: `hero-log-${Date.now()}`,
          timestamp: new Date().toISOString()
        };
        set(state => ({
          heroPickerLogs: [newLog, ...state.heroPickerLogs.slice(0, 49)]
        }));
      },

      submitStudentWork: (submissionData) => {
        const isEarly = new Date() <= new Date(submissionData.dueDate);
        const newSubmission: StudentSubmission = {
          ...submissionData,
          id: `sub-${Date.now()}`,
          submittedAt: new Date().toISOString(),
          isSubmittedOnTime: isEarly,
          status: 'pending_review',
          xpAwarded: 0,
          coinsAwarded: 0
        };
        set(state => ({
          submissionsList: [newSubmission, ...state.submissionsList]
        }));
      },

      evaluateSubmission: (submissionId: string, rubricLevels, feedback, xp, coins) => {
        set(state => ({
          submissionsList: state.submissionsList.map(s => {
            if (s.id !== submissionId) return s;
            return {
              ...s,
              status: 'reviewed',
              evaluatedRubricLevels: rubricLevels,
              teacherFeedback: feedback,
              xpAwarded: xp,
              coinsAwarded: coins
            };
          })
        }));
      },

      importStudentsBatch: (rows: ImportedStudentRow[]) => {
        return rows.length;
      }
    }),
    {
      name: 'iskool-classroom-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
