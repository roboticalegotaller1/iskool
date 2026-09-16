/**
 * @file teacherMilestoneBroadcaster.ts
 * @description Bus de eventos en memoria y difusor en tiempo real para el Teacher Social Loop.
 * Despacha notificaciones instantáneas hacia clientes suscritos (SSE y Supabase Realtime)
 * eliminando por completo la necesidad de polling pesado en la base de datos.
 */

export interface TeacherMilestoneEvent {
  id: string;
  timestamp: string;
  teacherId?: string;
  schoolId?: string;
  studentId: string;
  studentName: string;
  milestoneType: 'quest_completed' | 'perfect_score' | 'simulator_mastered' | 'level_up' | 'badge_unlocked';
  title: string;
  score: number;
  xpEarned: number;
  coinsEarned: number;
  teacherKarmaReward: number;
  teacherXpReward: number;
  message: string;
}

type MilestoneListener = (event: TeacherMilestoneEvent) => void;

class TeacherMilestoneBroadcaster {
  private static instance: TeacherMilestoneBroadcaster;
  private listeners: Set<MilestoneListener> = new Set();

  private constructor() {}

  public static getInstance(): TeacherMilestoneBroadcaster {
    if (!TeacherMilestoneBroadcaster.instance) {
      TeacherMilestoneBroadcaster.instance = new TeacherMilestoneBroadcaster();
    }
    return TeacherMilestoneBroadcaster.instance;
  }

  /**
   * Suscribe un cliente al flujo de hitos en tiempo real (utilizado por endpoints SSE)
   */
  public subscribe(listener: MilestoneListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emite un hito estudiantil a todos los clientes docentes conectados
   */
  public broadcast(event: Omit<TeacherMilestoneEvent, 'id' | 'timestamp'>): TeacherMilestoneEvent {
    const fullEvent: TeacherMilestoneEvent = {
      ...event,
      id: `mstone-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString()
    };

    // Notificar a todos los escuchas SSE activos
    for (const listener of this.listeners) {
      try {
        listener(fullEvent);
      } catch (err) {
        console.error('Error notificando a suscriptor de hito:', err);
      }
    }

    return fullEvent;
  }

  public getListenerCount(): number {
    return this.listeners.size;
  }
}

export const teacherMilestoneBroadcaster = TeacherMilestoneBroadcaster.getInstance();

export const broadcastTeacherMilestone = (
  event: Omit<TeacherMilestoneEvent, 'id' | 'timestamp'>
): TeacherMilestoneEvent => {
  return teacherMilestoneBroadcaster.broadcast(event);
};
