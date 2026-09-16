"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { TeacherMilestoneEvent } from '@/lib/teacherMilestoneBroadcaster';
import { useTeacherGamificationStore } from '@/store/useTeacherGamificationStore';

interface UseTeacherSocialLoopStreamOptions {
  teacherId?: string;
  schoolId?: string;
  enabled?: boolean;
}

/**
 * Hook para conectar el panel docente al Teacher Social Loop en tiempo real (SSE).
 * Recibe notificaciones push cuando los alumnos completan retos o superan hitos,
 * evitando saturar la base de datos con peticiones de polling continuo.
 */
export function useTeacherSocialLoopStream({
  teacherId = 'usr-teacher-1',
  schoolId,
  enabled = true
}: UseTeacherSocialLoopStreamOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [latestMilestone, setLatestMilestone] = useState<TeacherMilestoneEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const clearMilestone = useCallback(() => {
    setLatestMilestone(null);
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const params = new URLSearchParams();
    if (teacherId) params.append('teacherId', teacherId);
    if (schoolId) params.append('schoolId', schoolId);

    const sseUrl = `/api/realtime/teacher-milestones?${params.toString()}`;
    const eventSource = new EventSource(sseUrl);
    eventSourceRef.current = eventSource;

    eventSource.addEventListener('connected', () => {
      setIsConnected(true);
    });

    eventSource.addEventListener('milestone', (e: MessageEvent) => {
      try {
        const milestone: TeacherMilestoneEvent = JSON.parse(e.data);
        setLatestMilestone(milestone);

        // Actualizar automáticamente estadísticas del Teacher Social Loop sin hacer consultas a la BD
        const store = useTeacherGamificationStore.getState();
        const currentStats = store.stats;
        
        useTeacherGamificationStore.setState({
          stats: {
            ...currentStats,
            xp: (currentStats.xp || 0) + (milestone.teacherXpReward || 5),
            karma_points: (currentStats.karma_points || 0) + (milestone.teacherKarmaReward || 2),
            students_impacted: (currentStats.students_impacted || 0) + 1
          },
          activeNotification: {
            message: milestone.message,
            xpEarned: milestone.teacherXpReward,
            karmaEarned: milestone.teacherKarmaReward
          }
        });
      } catch (err) {
        console.error('Error procesando evento SSE de hito:', err);
      }
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      eventSourceRef.current = null;
      setIsConnected(false);
    };
  }, [teacherId, schoolId, enabled]);

  return {
    isConnected,
    latestMilestone,
    clearMilestone
  };
}
