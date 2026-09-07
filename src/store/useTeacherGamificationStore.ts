/**
 * @file useTeacherGamificationStore.ts
 * @description Almacén global (Zustand) para gestionar los puntos, recompensas,
 * insignias y progreso del Teacher Social Loop en el LMS ISkool.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  TeacherGamificationStats, 
  TeacherBadge, 
  TeacherActionType, 
  TeacherActionLog, 
  TeacherSocialLoopProgress,
  ISimulatorCompletionEvent
} from '@/types/teacherGamification';
import { TeacherGamificationService } from '@/services/teacherGamificationService';

interface TeacherGamificationState {
  teacherId: string;
  stats: TeacherGamificationStats;
  badges: TeacherBadge[];
  loopProgress: TeacherSocialLoopProgress;
  recentLogs: TeacherActionLog[];
  isLoading: boolean;
  activeNotification: {
    message: string;
    xpEarned?: number;
    karmaEarned?: number;
    badgeUnlocked?: string;
  } | null;

  // Acciones
  initTeacherGamification: (teacherId: string) => Promise<void>;
  recordTeacherAction: (actionType: TeacherActionType, metadata?: Record<string, any>) => Promise<any>;
  assignActivityToGroup: (payload: {
    activityId: string;
    groupId: string;
    groupName: string;
    xpReward?: number;
    coinsReward?: number;
    isSimulator?: boolean;
    simulatorName?: string;
  }) => Promise<void>;
  upvoteCommunityActivity: (activityId: string, authorTeacherId?: string) => Promise<void>;
  processStudentSimulatorResult: (event: ISimulatorCompletionEvent) => Promise<void>;
  clearNotification: () => void;
  resetTeacherStore: () => void;
}

const INITIAL_STATS: TeacherGamificationStats = {
  teacher_id: 'usr-teacher-1',
  xp: 320,
  level: 2,
  rank: 'Iniciado',
  karma_points: 45,
  pedagogical_coins: 60,
  activities_created: 4,
  activities_published: 3,
  activities_assigned: 5,
  upvotes_received: 12,
  upvotes_given: 6,
  students_impacted: 58,
  weekly_streak: 2,
  last_active_at: new Date().toISOString()
};

const INITIAL_LOOP: TeacherSocialLoopProgress = {
  hasCreatedActivityToday: true,
  hasPublishedToCommunity: true,
  hasAssignedToGroup: true,
  dailyUpvotesCount: 2,
  studentsActiveToday: 14,
  loopCompleted: true
};

export const useTeacherGamificationStore = create<TeacherGamificationState>()(
  persist(
    (set, get) => ({
      teacherId: 'usr-teacher-1',
      stats: INITIAL_STATS,
      badges: [],
      loopProgress: INITIAL_LOOP,
      recentLogs: [],
      isLoading: false,
      activeNotification: null,

      initTeacherGamification: async (teacherId: string) => {
        set({ isLoading: true, teacherId });
        try {
          const [stats, badges] = await Promise.all([
            TeacherGamificationService.fetchTeacherStats(teacherId),
            TeacherGamificationService.fetchTeacherBadges(teacherId)
          ]);

          set({
            stats,
            badges,
            isLoading: false
          });
        } catch (err) {
          console.warn('Error inicializando estadísticas del docente:', err);
          set({ isLoading: false });
        }
      },

      recordTeacherAction: async (actionType: TeacherActionType, metadata: Record<string, any> = {}) => {
        const { teacherId, stats, badges } = get();

        // Llamada al backend Supabase
        const result = await TeacherGamificationService.recordAction(teacherId, actionType, metadata);

        // Actualizar estado local
        const updatedStats: TeacherGamificationStats = {
          ...stats,
          xp: result.newXp || (stats.xp + result.xpAdded),
          level: result.newLevel || stats.level,
          rank: (result.newRank as any) || stats.rank,
          karma_points: stats.karma_points + result.karmaAdded,
          pedagogical_coins: stats.pedagogical_coins + result.coinsAdded,
          activities_created: stats.activities_created + (actionType === 'CREATE_ACTIVITY' ? 1 : 0),
          activities_published: stats.activities_published + (actionType === 'PUBLISH_COMMUNITY' ? 1 : 0),
          activities_assigned: stats.activities_assigned + (actionType === 'ASSIGN_CLASS' ? 1 : 0),
          upvotes_received: stats.upvotes_received + (actionType === 'RECEIVE_UPVOTE' ? 1 : 0),
          upvotes_given: stats.upvotes_given + (actionType === 'GIVE_UPVOTE' ? 1 : 0),
          students_impacted: stats.students_impacted + (actionType === 'STUDENT_COMPLETION' ? 1 : 0),
          last_active_at: new Date().toISOString()
        };

        // Actualizar bitácora local
        const newLog: TeacherActionLog = {
          id: `tlog-${Date.now()}`,
          teacher_id: teacherId,
          action_type: actionType,
          xp_earned: result.xpAdded,
          karma_earned: result.karmaAdded,
          coins_earned: result.coinsAdded,
          metadata,
          created_at: new Date().toISOString()
        };

        // Si se desbloqueó una insignia
        let updatedBadges = [...badges];
        if (result.badgesAwarded && result.badgesAwarded.length > 0) {
          updatedBadges = updatedBadges.map(b => 
            result.badgesAwarded.includes(b.code) ? { ...b, is_unlocked: true, earned_at: new Date().toISOString() } : b
          );
        }

        // Determinar mensaje de retroalimentación
        let notifMsg = `+${result.xpAdded} XP Docente`;
        if (result.karmaAdded > 0) notifMsg += ` • +${result.karmaAdded} Karma`;
        if (result.leveledUp) notifMsg = `🎉 ¡Subiste al Nivel ${result.newLevel} (${result.newRank})! ${notifMsg}`;

        set(state => ({
          stats: updatedStats,
          badges: updatedBadges,
          recentLogs: [newLog, ...state.recentLogs.slice(0, 19)],
          activeNotification: {
            message: notifMsg,
            xpEarned: result.xpAdded,
            karmaEarned: result.karmaAdded,
            badgeUnlocked: result.badgesAwarded?.[0]
          }
        }));

        return result;
      },

      assignActivityToGroup: async (payload) => {
        await get().recordTeacherAction('ASSIGN_CLASS', {
          activity_id: payload.activityId,
          group_id: payload.groupId,
          group_name: payload.groupName,
          is_simulator: Boolean(payload.isSimulator),
          simulator_name: payload.simulatorName
        });

        set(state => ({
          loopProgress: {
            ...state.loopProgress,
            hasAssignedToGroup: true
          }
        }));
      },

      upvoteCommunityActivity: async (activityId: string, authorTeacherId?: string) => {
        // 1. Recompensa para quien emite el voto
        await get().recordTeacherAction('GIVE_UPVOTE', { activity_id: activityId });

        // 2. Si el autor es otro docente registrado, recompensarlo
        if (authorTeacherId && authorTeacherId !== get().teacherId) {
          TeacherGamificationService.recordAction(authorTeacherId, 'RECEIVE_UPVOTE', {
            activity_id: activityId,
            voter_id: get().teacherId
          }).catch(err => console.warn('Voto en autor diferido:', err));
        }

        set(state => ({
          loopProgress: {
            ...state.loopProgress,
            dailyUpvotesCount: state.loopProgress.dailyUpvotesCount + 1
          }
        }));
      },

      processStudentSimulatorResult: async (event: ISimulatorCompletionEvent) => {
        // Llamada desde el adaptador del Factory Pattern
        await get().recordTeacherAction('STUDENT_COMPLETION', {
          simulator_id: event.simulatorId,
          template_type: event.templateType,
          category: event.category,
          score: event.score,
          student_id: event.studentId,
          is_simulator: true
        });

        set(state => ({
          loopProgress: {
            ...state.loopProgress,
            studentsActiveToday: state.loopProgress.studentsActiveToday + 1
          }
        }));
      },

      clearNotification: () => set({ activeNotification: null }),

      resetTeacherStore: () => set({
        stats: INITIAL_STATS,
        loopProgress: INITIAL_LOOP,
        recentLogs: [],
        activeNotification: null
      })
    }),
    {
      name: 'iskool_teacher_gamification_store',
      partialize: (state) => ({
        stats: state.stats,
        loopProgress: state.loopProgress,
        badges: state.badges
      })
    }
  )
);
