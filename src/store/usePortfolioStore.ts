import { create } from 'zustand';
import { PortfolioItem, FeedbackAuthorRole, PortfolioItemStatus, PortfolioFeedback, UserProfile } from '../types';
import { PORTFOLIO_SEED, SUBJECTS_SEED, TEACHER_SEED, PARENT_SEED, STUDENTS_LIST_SEED, BADGES_SEED } from './seeds';
import { useStudentStore, normalizeStudentId, mapStudentIdToUuid } from './useStudentStore';
import { useGamificationStore } from './useGamificationStore';
import { useSchoolAdminStore, getSchoolStudents } from './useSchoolAdminStore';
import { supabase } from '@/lib/supabaseClient';

const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

const ensureSubjectUuid = async (subjectId?: string): Promise<string> => {
  const defaultSub = 'b00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e11'; // "Matemáticas"
  if (!subjectId) return defaultSub;
  if (isUuid(subjectId)) {
    const { data } = await supabase.from('subjects').select('id').eq('id', subjectId).maybeSingle();
    if (data) return subjectId;
  }
  
  const name = subjectId === 'sub-math' ? 'Matemáticas' : subjectId === 'sub-sci' ? 'Ciencias Naturales' : 'Español';
  const { data } = await supabase.from('subjects').select('id').eq('name', name).maybeSingle();
  if (data) return data.id;

  return defaultSub;
};

const ensureQuestUuid = async (questId?: string): Promise<string | null> => {
  if (!questId) return null;
  if (isUuid(questId)) {
    const { data } = await supabase.from('quests').select('id').eq('id', questId).maybeSingle();
    if (data) return questId;
  }
  
  if (questId === 'q-fractions-1' || questId === 'q-fractions-2') {
    return 'e00a0eeb-9c0b-4ef8-bb6d-69bad5a8a9ca';
  }
  if (questId === 'q-selva-1' || questId === 'q-selva-2' || questId === 'q-selva-3') {
    return 'e00a0eeb-9c0b-4ef8-bb6d-44072205c41a';
  }
  
  return null;
};

const normalizeSubjectId = (id: string): string => {
  if (id === 'b00a0eeb-9c0b-4ef8-bb6d-6bb9bd380e11') return 'sub-math';
  return id;
};

const normalizeQuestId = (id?: string | null): string => {
  if (!id) return '';
  if (id === 'e00a0eeb-9c0b-4ef8-bb6d-69bad5a8a9ca') return 'q-fractions-2';
  if (id === 'e00a0eeb-9c0b-4ef8-bb6d-44072205c41a') return 'q-selva-2';
  return id;
};

const mapAuthorIdToUuid = (id: string, role: string): string => {
  if (role === 'teacher') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55';
  if (role === 'parent' || role === 'tutor') return 'd00a0eeb-9c0b-4ef8-bb6d-7bb9bd380a66';
  if (role === 'student' || role === 'peer') return mapStudentIdToUuid(id);
  if (isUuid(id)) return id;
  return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55';
};

let submissionsChannel: any = null;

interface PortfolioStoreState {
  portfolioItems: PortfolioItem[];
  isLoadingPortfolio: boolean;
  portfolioError: string | null;
  
  // Actions
  submitPortfolioItem: (
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => Promise<void>;
  
  submitPortfolioItemOnBehalf: (
    studentId: string,
    title: string,
    description: string,
    fileUrl: string,
    fileType: any,
    selfReflection: string,
    questId?: string,
    subjectId?: string
  ) => Promise<void>;
  
  addPortfolioFeedback: (itemId: string, text: string, role: FeedbackAuthorRole, authorId: string) => void;
  addReaction: (itemId: string, roleCategory: string, emoji: string) => void;
  
  reviewPortfolioItem: (
    itemId: string,
    status: PortfolioItemStatus,
    comment: string,
    xpAward?: number,
    campos_formativos?: string[],
    pdas?: string[],
    ejes_articuladores?: string[],
    xp_breakdown?: {
      scientific?: number;
      critical?: number;
      collaborative?: number;
      communication?: number;
    }
  ) => Promise<void>;
  
  linkPortfolioItemToQuest: (itemId: string, questId: string) => void;
  submitPeerReview: (itemId: string, score: number, comment: string) => void;
  fetchPortfolioItems: (groupId?: string, targetStudentId?: string) => Promise<void>;
  subscribeToPortfolioChanges: (onUpdateReceived?: (studentName?: string, questTitle?: string) => void) => void;
  unsubscribeFromPortfolioChanges: () => void;
  resetPortfolioStore: () => void;
}

export const usePortfolioStore = create<PortfolioStoreState>((set, get) => ({
  portfolioItems: PORTFOLIO_SEED,
  isLoadingPortfolio: false,
  portfolioError: null,

  submitPortfolioItem: async (title, description, fileUrl, fileType, selfReflection, questId, subjectId) => {
    const studentStore = useStudentStore.getState();
    const gamificationStore = useGamificationStore.getState();
    
    const activeStudentId = studentStore.activeStudentId;
    const currentStudent = STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];
    
    const defaultSubjectId = subjectId || 'sub-math';
    const finalSubject = SUBJECTS_SEED.find(s => s.id === defaultSubjectId) || SUBJECTS_SEED[0];
    
    const quest = gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId);

    try {
      const dbStudentId = mapStudentIdToUuid(activeStudentId);
      const dbSubjectId = await ensureSubjectUuid(defaultSubjectId);
      const dbQuestId = await ensureQuestUuid(questId);

      const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
          student_id: dbStudentId,
          subject_id: dbSubjectId,
          quest_id: dbQuestId,
          title: title,
          description: description,
          file_url: fileUrl,
          file_type: fileType,
          status: 'submitted',
          self_reflection: selfReflection
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      const newItem: PortfolioItem = {
        id: data.id,
        student_id: activeStudentId,
        subject_id: defaultSubjectId,
        quest_id: questId,
        title: title,
        description: description,
        file_url: fileUrl,
        file_type: fileType,
        status: 'submitted',
        self_reflection: selfReflection,
        campos_formativos: quest?.campos_formativos,
        ejes_articuladores: quest?.ejes_articuladores,
        pdas: quest?.pdas,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        student_profile: currentStudent,
        subject: finalSubject,
        feedbacks: []
      };

      set((state) => ({
        portfolioItems: [newItem, ...state.portfolioItems]
      }));

    } catch (err: any) {
      console.error('Error submitting portfolio item to Supabase:', err.message);
      
      // Fallback local update to keep UX working offline/on failure
      const newItem: PortfolioItem = {
        id: `port-${Date.now()}`,
        student_id: activeStudentId,
        subject_id: defaultSubjectId,
        quest_id: questId,
        title: title,
        description: description,
        file_url: fileUrl,
        file_type: fileType,
        status: 'submitted',
        self_reflection: selfReflection,
        campos_formativos: quest?.campos_formativos,
        ejes_articuladores: quest?.ejes_articuladores,
        pdas: quest?.pdas,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        student_profile: currentStudent,
        subject: finalSubject,
        feedbacks: []
      };

      set((state) => ({
        portfolioItems: [newItem, ...state.portfolioItems]
      }));
    }

    // Si es Elena (Secundaria), enlazar con la entrega del Gremio RPG automáticamente
    if (activeStudentId === 'std-sec') {
      gamificationStore.submitGuildHomework('std-sec', true);
    }

    // Recompensa de XP y monedas
    studentStore.addXpAndCoins(activeStudentId, 50, 10);

    // Medalla por subir audio
    if (fileType === 'audio' && !gamificationStore.studentBadges.some(sb => sb.badge_id === 'badge-2' && sb.student_id === activeStudentId)) {
      gamificationStore.unlockBadge(activeStudentId, 'badge-2');
    }
  },

  submitPortfolioItemOnBehalf: async (studentId, title, description, fileUrl, fileType, selfReflection, questId, subjectId) => {
    const studentStore = useStudentStore.getState();
    const gamificationStore = useGamificationStore.getState();
    const schoolAdminStore = useSchoolAdminStore.getState();

    const defaultSubjectId = subjectId || 'sub-math';
    const finalSubject = SUBJECTS_SEED.find(s => s.id === defaultSubjectId) || SUBJECTS_SEED[0];
    const quest = gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId);

    const sDetail = schoolAdminStore.detailedStudents.find(ds => ds.id === studentId);
    const targetStudentProfile: UserProfile = sDetail ? {
      id: studentId,
      first_name: sDetail.first_name,
      last_name: `${sDetail.last_name_1} ${sDetail.last_name_2 || ''}`.trim(),
      role: 'student',
      email: sDetail.email || `${sDetail.first_name.toLowerCase()}@iskool.edu.mx`,
      created_at: sDetail.birth_date,
      updated_at: new Date().toISOString()
    } : {
      id: studentId,
      first_name: 'Estudiante',
      last_name: 'Simulado',
      role: 'student',
      email: 'student@iskool.edu.mx',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    try {
      const dbStudentId = mapStudentIdToUuid(studentId);
      const dbSubjectId = await ensureSubjectUuid(defaultSubjectId);
      const dbQuestId = await ensureQuestUuid(questId);

      const { data, error } = await supabase
        .from('portfolio_items')
        .insert({
          student_id: dbStudentId,
          subject_id: dbSubjectId,
          quest_id: dbQuestId,
          title: title,
          description: description,
          file_url: fileUrl,
          file_type: fileType,
          status: 'submitted',
          self_reflection: selfReflection
        })
        .select()
        .single();

      if (error) throw new Error(error.message);

      const newItem: PortfolioItem = {
        id: data.id,
        student_id: studentId,
        subject_id: defaultSubjectId,
        quest_id: questId,
        title: title,
        description: description,
        file_url: fileUrl,
        file_type: fileType,
        status: 'submitted',
        self_reflection: selfReflection,
        campos_formativos: quest?.campos_formativos,
        ejes_articuladores: quest?.ejes_articuladores,
        pdas: quest?.pdas,
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString(),
        student_profile: targetStudentProfile,
        subject: finalSubject,
        feedbacks: []
      };

      set((state) => ({
        portfolioItems: [newItem, ...state.portfolioItems]
      }));

    } catch (err: any) {
      console.error('Error submitting portfolio item on behalf to Supabase:', err.message);
      
      // Fallback
      const newItem: PortfolioItem = {
        id: `port-${Date.now()}`,
        student_id: studentId,
        subject_id: defaultSubjectId,
        quest_id: questId,
        title: title,
        description: description,
        file_url: fileUrl,
        file_type: fileType,
        status: 'submitted',
        self_reflection: selfReflection,
        campos_formativos: quest?.campos_formativos,
        ejes_articuladores: quest?.ejes_articuladores,
        pdas: quest?.pdas,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        student_profile: targetStudentProfile,
        subject: finalSubject,
        feedbacks: []
      };

      set((state) => ({
        portfolioItems: [newItem, ...state.portfolioItems]
      }));
    }

    studentStore.addXpAndCoins(studentId, 50, 10);
  },

  addPortfolioFeedback: (itemId, text, role, authorId) => {
    const studentStore = useStudentStore.getState();
    const activeStudentId = studentStore.activeStudentId;
    const currentStudent = STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];

    let authorProfile: UserProfile = currentStudent;
    if (role === 'teacher') authorProfile = TEACHER_SEED;
    if (role === 'parent' || role === 'tutor') authorProfile = PARENT_SEED;

    const newFeedback: PortfolioFeedback = {
      id: `fb-${Date.now()}`,
      portfolio_item_id: itemId,
      author_id: authorId,
      author_role: role,
      feedback_text: text,
      reactions: {},
      created_at: new Date().toISOString(),
      author_profile: authorProfile
    };

    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            feedbacks: [...(item.feedbacks || []), newFeedback],
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));

    if (isUuid(itemId)) {
      const dbAuthorId = mapAuthorIdToUuid(authorId, role);
      const dbRole = role === 'tutor' ? 'parent' : role;
      supabase
        .from('portfolio_feedback')
        .insert({
          portfolio_item_id: itemId,
          author_id: dbAuthorId,
          author_role: dbRole,
          feedback_text: text,
          reactions: {}
        })
        .then(({ error }) => {
          if (error) console.error('Error inserting feedback to Supabase:', error.message);
        });
    }
  },

  addReaction: (itemId, roleCategory, emoji) => {
    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          const updatedFeedbacks = item.feedbacks ? [...item.feedbacks] : [];
          if (updatedFeedbacks.length > 0) {
            const firstFb = { ...updatedFeedbacks[0] };
            const currentReactions = firstFb.reactions[roleCategory] || [];
            if (!currentReactions.includes(emoji)) {
              firstFb.reactions = {
                ...firstFb.reactions,
                [roleCategory]: [...currentReactions, emoji]
              };
              updatedFeedbacks[0] = firstFb;
            }
          }
          return {
            ...item,
            feedbacks: updatedFeedbacks,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));
  },

  reviewPortfolioItem: async (itemId, status, comment, xpAward = 100, campos_formativos, pdas, ejes_articuladores, xp_breakdown) => {
    const newFeedback: PortfolioFeedback = {
      id: `fb-${Date.now()}`,
      portfolio_item_id: itemId,
      author_id: TEACHER_SEED.id,
      author_role: 'teacher',
      feedback_text: comment,
      reactions: { teacher: ['👏', '⭐'] },
      created_at: new Date().toISOString(),
      author_profile: TEACHER_SEED
    };

    let targetStudentId = '';
    let previousStatus: PortfolioItemStatus | undefined = undefined;

    const currentItems = get().portfolioItems;
    const targetItem = currentItems.find(i => i.id === itemId);
    if (targetItem) {
      targetStudentId = targetItem.student_id;
      previousStatus = targetItem.status;

      // RECHAZO BACKEND (HTTP 403 Forbidden): Rechazar actualización si la evidencia ya está en estado 'approved' (evaluado)
      if (targetItem.status === 'approved') {
        const forbiddenErr = new Error("HTTP 403 Forbidden: La evidencia ya se encuentra evaluada y su calificación ha sido bloqueada.");
        console.error(forbiddenErr.message);
        throw forbiddenErr;
      }
    }

    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            status: status,
            feedbacks: [...(item.feedbacks || []), newFeedback],
            campos_formativos,
            pdas,
            ejes_articuladores,
            xp_breakdown,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));

    // IDEMPOTENCY CHECK: Otorgar XP al estudiante ÚNICAMENTE si la entrega no estaba previamente aprobada
    if (status === 'approved' && previousStatus !== 'approved' && targetStudentId) {
      const studentStore = useStudentStore.getState();
      await studentStore.addXpAndCoins(targetStudentId, xpAward, 20);
    }

    if (isUuid(itemId)) {
      try {
        const { error: updateError } = await supabase
          .from('portfolio_items')
          .update({ status: status })
          .eq('id', itemId);

        if (updateError) {
          console.error('Error updating portfolio item status:', updateError.message);
          throw new Error(updateError.message);
        }

        const { error: feedbackError } = await supabase
          .from('portfolio_feedback')
          .insert({
            portfolio_item_id: itemId,
            author_id: 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a55',
            author_role: 'teacher',
            feedback_text: comment,
            reactions: { teacher: ['👏', '⭐'] }
          });

        if (feedbackError) {
          console.error('Error inserting feedback to Supabase:', feedbackError.message);
        }
      } catch (err: any) {
        console.error('Fallo en la persistencia de revisión:', err);
        // Rollback local state on network error to keep frontend consistent
        if (targetItem) {
          set((state) => ({
            portfolioItems: state.portfolioItems.map(i => i.id === itemId ? targetItem : i)
          }));
        }
        throw err;
      }
    }
  },

  linkPortfolioItemToQuest: (itemId, questId) => {
    const gamificationStore = useGamificationStore.getState();
    const quest = gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId);
    
    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            quest_id: questId,
            campos_formativos: quest?.campos_formativos || item.campos_formativos,
            ejes_articuladores: quest?.ejes_articuladores || item.ejes_articuladores,
            pdas: quest?.pdas || item.pdas,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));

    if (isUuid(itemId)) {
      ensureQuestUuid(questId).then(dbQuestId => {
        if (dbQuestId) {
          supabase
            .from('portfolio_items')
            .update({ quest_id: dbQuestId })
            .eq('id', itemId)
            .then(({ error }) => {
              if (error) console.error('Error linking item to quest on Supabase:', error.message);
            });
        }
      });
    }
  },

  submitPeerReview: (itemId, score, comment) => {
    const studentStore = useStudentStore.getState();
    const gamificationStore = useGamificationStore.getState();
    const activeStudentId = studentStore.activeStudentId;

    set((state) => ({
      portfolioItems: state.portfolioItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            peer_review_score: score,
            peer_review_comments: comment,
            updated_at: new Date().toISOString()
          };
        }
        return item;
      })
    }));

    // Recompensa al coevaluador
    studentStore.addXpAndCoins(activeStudentId, 100, 15);

    // Desbloquear medalla de Compañero Estelar (badge-5)
    if (!gamificationStore.studentBadges.some(sb => sb.badge_id === 'badge-5' && sb.student_id === activeStudentId)) {
      gamificationStore.unlockBadge(activeStudentId, 'badge-5');
    }

    if (isUuid(itemId)) {
      supabase
        .from('portfolio_items')
        .update({
          peer_review_score: score,
          peer_review_comments: comment
        })
        .eq('id', itemId)
        .then(({ error }) => {
          if (error) console.error('Error updating peer review on Supabase:', error.message);
        });
    }
  },

  fetchPortfolioItems: async (groupId, targetStudentId) => {
    // Si ya tenemos evidencias en memoria, revalidar en segundo plano sin bloquear la UI
    if (get().portfolioItems.length === 0) {
      set({ isLoadingPortfolio: true, portfolioError: null });
    }
    try {
      const schoolAdminStore = useSchoolAdminStore.getState();
      const activeSchoolId = schoolAdminStore.activeSchoolId;
      const schoolStudents = activeSchoolId 
        ? getSchoolStudents(schoolAdminStore.detailedStudents, activeSchoolId, schoolAdminStore.campusesList)
        : schoolAdminStore.detailedStudents;
      const allowedStudentIds = new Set(schoolStudents.map(s => s.id));
      const allowedStudentUuids = new Set(schoolStudents.map(s => mapStudentIdToUuid(s.id)));

      let query = supabase
        .from('portfolio_items')
        .select(`
          *,
          portfolio_feedback (
            *,
            profiles:author_id (
              id,
              first_name,
              last_name,
              role,
              email
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (groupId) {
        const groupStudents = schoolStudents
          .filter(s => s.group_id === groupId)
          .map(s => mapStudentIdToUuid(s.id))
          .filter(isUuid);
          
        if (groupStudents.length > 0) {
          query = query.in('student_id', groupStudents);
        } else {
          // Filtrado en memoria para alumnos y grupos creados localmente
          const localFiltered = (get().portfolioItems || []).filter(p => {
            const st = schoolStudents.find(s => s.id === p.student_id);
            return st?.group_id === groupId;
          });
          const seedForSchool = activeSchoolId === 'sch-jjrosseau' ? [] : PORTFOLIO_SEED;
          set({ portfolioItems: localFiltered.length > 0 ? localFiltered : seedForSchool, isLoadingPortfolio: false, portfolioError: null });
          return;
        }
      } else if (targetStudentId) {
        const dbStudentId = mapStudentIdToUuid(targetStudentId);
        if (isUuid(dbStudentId)) {
          query = query.eq('student_id', dbStudentId);
        } else {
          // Si el ID es local (e.g. std-1788...), filtrar del catálogo local
          const localItems = (get().portfolioItems || []).filter(p => 
            p.student_id === targetStudentId || 
            normalizeStudentId(p.student_id) === normalizeStudentId(targetStudentId)
          );
          set({ portfolioItems: localItems, isLoadingPortfolio: false, portfolioError: null });
          return;
        }
      } else if (activeSchoolId) {
        const studentUuidsArray = Array.from(allowedStudentUuids).filter(isUuid);
        if (studentUuidsArray.length > 0) {
          query = query.in('student_id', studentUuidsArray);
        }
      }

      const response = await query;
      if (response.error) throw new Error(response.error.message);

      const detailedStudents = schoolAdminStore.detailedStudents;

      const mappedItems = (response.data || []).map((dbItem: any) => {
        const studentId = normalizeStudentId(dbItem.student_id);
        const subjectId = normalizeSubjectId(dbItem.subject_id);
        const questId = normalizeQuestId(dbItem.quest_id);

        const sDetail = detailedStudents.find(s => s.id === studentId || mapStudentIdToUuid(s.id) === dbItem.student_id);
        const currentStudent: UserProfile = sDetail ? {
          id: sDetail.id,
          first_name: sDetail.first_name,
          last_name: `${sDetail.last_name_1 || ''} ${sDetail.last_name_2 || ''}`.trim() || sDetail.last_name_1 || 'Alumno',
          role: 'student' as any,
          email: sDetail.email || `${sDetail.id}@iskool.edu.mx`,
          created_at: sDetail.birth_date || new Date().toISOString(),
          updated_at: new Date().toISOString()
        } : (STUDENTS_LIST_SEED.find(s => s.id === studentId) || {
          id: studentId,
          first_name: 'Estudiante',
          last_name: 'Desconocido',
          role: 'student' as any,
          email: `${studentId}@iskool.edu.mx`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

        const finalSubject = SUBJECTS_SEED.find(s => s.id === subjectId) || SUBJECTS_SEED[0];

        const feedbacks = (dbItem.portfolio_feedback || []).map((fb: any) => {
          const authorProfile: UserProfile = fb.profiles ? {
            id: fb.profiles.id,
            first_name: fb.profiles.first_name,
            last_name: fb.profiles.last_name || '',
            role: fb.profiles.role,
            email: fb.profiles.email || '',
            created_at: fb.created_at,
            updated_at: fb.created_at
          } : {
            id: fb.author_id,
            first_name: 'Usuario',
            last_name: 'Desconocido',
            role: fb.author_role,
            email: '',
            created_at: fb.created_at,
            updated_at: fb.created_at
          };

          return {
            id: fb.id,
            portfolio_item_id: fb.portfolio_item_id,
            author_id: fb.author_id,
            author_role: fb.author_role,
            feedback_text: fb.feedback_text,
            reactions: fb.reactions || {},
            created_at: fb.created_at,
            author_profile: authorProfile
          } as PortfolioFeedback;
        });

        return {
          id: dbItem.id,
          student_id: studentId,
          subject_id: subjectId,
          quest_id: questId,
          title: dbItem.title,
          description: dbItem.description,
          file_url: dbItem.file_url,
          file_type: dbItem.file_type || 'image',
          status: dbItem.status || 'submitted',
          self_reflection: dbItem.self_reflection,
          teacher_comment: dbItem.teacher_comment,
          peer_review_score: dbItem.peer_review_score,
          peer_review_comments: dbItem.peer_review_comments,
          xp_awarded: dbItem.xp_awarded,
          campos_formativos: dbItem.campos_formativos || [],
          pdas: dbItem.pdas || [],
          ejes_articuladores: dbItem.ejes_articuladores || [],
          created_at: dbItem.created_at,
          updated_at: dbItem.updated_at,
          student: currentStudent,
          subject: finalSubject,
          feedbacks: feedbacks
        } as PortfolioItem;
      });

      // Si se consulta para un alumno específico, guardar únicamente sus evidencias (sin mezclar con otros)
      if (targetStudentId) {
        set({ portfolioItems: mappedItems, isLoadingPortfolio: false, portfolioError: null });
        return;
      }

      // Para el panel general de profesor/coordinador: aislar estrictamente por colegio
      const schoolFilteredItems = activeSchoolId
        ? mappedItems.filter((item: PortfolioItem) => allowedStudentIds.has(item.student_id) || allowedStudentUuids.has(item.student_id))
        : mappedItems;

      if (schoolFilteredItems.length === 0 && !groupId) {
        const seedForSchool = (activeSchoolId === 'sch-jjrosseau')
          ? []
          : PORTFOLIO_SEED.filter(p => allowedStudentIds.has(p.student_id) || allowedStudentUuids.has(p.student_id));
        set({ portfolioItems: seedForSchool, isLoadingPortfolio: false, portfolioError: null });
      } else {
        set({ portfolioItems: schoolFilteredItems, isLoadingPortfolio: false, portfolioError: null });
      }
    } catch (err: any) {
      console.warn('Uso de catálogo de portafolio local diferido:', err.message);
      // Mantener catálogo local activo y sin error intrusivo en UI
      set({ portfolioError: null, isLoadingPortfolio: false });
    } finally {
      set({ isLoadingPortfolio: false });
    }
  },

  subscribeToPortfolioChanges: (onUpdateReceived) => {
    if (submissionsChannel) return;
    
    submissionsChannel = supabase
      .channel('custom-portfolio-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolio_items' }, async (payload) => {
        console.log("Realtime portfolio item change received:", payload);
        
        if (payload.eventType === 'INSERT') {
          const gamificationStore = useGamificationStore.getState();
          const schoolAdminStore = useSchoolAdminStore.getState();
          
          const studentId = normalizeStudentId(payload.new.student_id);
          const subjectId = normalizeSubjectId(payload.new.subject_id);
          const questId = normalizeQuestId(payload.new.quest_id);
          
          const sDetail = schoolAdminStore.detailedStudents.find(s => s.id === studentId || mapStudentIdToUuid(s.id) === payload.new.student_id);
          const currentStudent: UserProfile = sDetail ? {
            id: sDetail.id,
            first_name: sDetail.first_name,
            last_name: `${sDetail.last_name_1 || ''} ${sDetail.last_name_2 || ''}`.trim() || sDetail.last_name_1 || 'Alumno',
            role: 'student' as any,
            email: sDetail.email || `${sDetail.id}@iskool.edu.mx`,
            created_at: sDetail.birth_date || new Date().toISOString(),
            updated_at: new Date().toISOString()
          } : (STUDENTS_LIST_SEED.find(s => s.id === studentId) || {
            id: studentId,
            first_name: 'Estudiante',
            last_name: 'Desconocido',
            role: 'student' as any,
            email: `${studentId}@iskool.edu.mx`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

          const finalSubject = SUBJECTS_SEED.find(s => s.id === subjectId) || SUBJECTS_SEED[0];

          const newItem: PortfolioItem = {
            id: payload.new.id,
            student_id: studentId,
            subject_id: subjectId,
            quest_id: questId,
            title: payload.new.title,
            description: payload.new.description,
            file_url: payload.new.file_url,
            file_type: payload.new.file_type,
            status: payload.new.status || 'submitted',
            self_reflection: payload.new.self_reflection,
            created_at: payload.new.created_at || new Date().toISOString(),
            updated_at: payload.new.updated_at || new Date().toISOString(),
            student_profile: currentStudent,
            subject: finalSubject,
            feedbacks: [],
            isNewRealtime: true
          };

          set((state) => ({
            portfolioItems: [newItem, ...state.portfolioItems.filter(i => i.id !== newItem.id)]
          }));

          const quest = questId ? gamificationStore.missionsList.flatMap(m => m.quests || []).find(q => q.id === questId) : null;
          const questTitle = payload.new.title || quest?.title || 'Desafío del Gremio';
          const studentName = `${currentStudent.first_name} ${currentStudent.last_name}`;

          if (onUpdateReceived) {
            onUpdateReceived(studentName, questTitle);
          }
        } else {
          await get().fetchPortfolioItems();
          if (onUpdateReceived) {
            onUpdateReceived();
          }
        }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'portfolio_feedback' }, async (payload) => {
        console.log("Realtime portfolio feedback received:", payload);
        
        await get().fetchPortfolioItems();
        
        if (onUpdateReceived) {
          onUpdateReceived();
        }
      })
      .subscribe();
  },

  unsubscribeFromPortfolioChanges: () => {
    if (submissionsChannel) {
      supabase.removeChannel(submissionsChannel);
      submissionsChannel = null;
    }
  },

  resetPortfolioStore: () => {
    set({
      portfolioItems: PORTFOLIO_SEED,
      isLoadingPortfolio: false,
      portfolioError: null
    });
  }
}));
