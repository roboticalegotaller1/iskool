/**
 * @file teacherGamification.ts
 * @description Modelos de datos y contratos TypeScript para el Teacher Social Loop y el sistema de gamificación docente.
 * Conectado con ISkool_Game_Factory_Pattern.md, EsquemaGamificacion.md y MANUAL_FUNCIONES_LMS_GAMIFICADO.
 */

export type TeacherActionType =
  | 'CREATE_ACTIVITY'       // Creación de actividad/simulador en Estudio (+30 XP, +10 Coins)
  | 'PUBLISH_COMMUNITY'     // Publicación abierta en la Red Docente (+50 XP, +15 Karma)
  | 'RECEIVE_UPVOTE'        // Voto recibido de un par docente (+10 XP, +5 Karma)
  | 'GIVE_UPVOTE'           // Apoyo o voto emitido a un colega (+5 XP, +2 Karma)
  | 'ASSIGN_CLASS'          // Asignación en 1 clic a un grupo (+40 XP, +10 Coins)
  | 'STUDENT_COMPLETION'    // Alumno concluye actividad/simulador (+5 XP por alumno)
  | 'REVIEW_EVIDENCE'       // Retroalimentación a evidencia de portafolio (+20 XP, +5 Coins)
  | 'SIMULATOR_EXPLORATION'; // Docente prueba o integra un nuevo simulador (+25 XP, +10 Karma)

export type TeacherRank =
  | 'Iniciado'               // Nivel 1 - 3
  | 'Docente Innovador'      // Nivel 4 - 7
  | 'Mentor Pedagógico'      // Nivel 8 - 12
  | 'Curador Magistral'      // Nivel 13 - 19
  | 'Leyenda ISkool';        // Nivel 20+

export interface TeacherGamificationStats {
  teacher_id: string;
  xp: number;
  level: number;
  rank: TeacherRank;
  karma_points: number;       // Reputación e impacto en la comunidad docente
  pedagogical_coins: number;  // Monedas para canjear recursos didácticos
  activities_created: number;
  activities_published: number;
  activities_assigned: number;
  upvotes_received: number;
  upvotes_given: number;
  students_impacted: number;
  weekly_streak: number;      // Racha semanal de dinamización pedagógica
  last_active_at: string;
}

export interface TeacherBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon_name: string;
  category: 'innovation' | 'community' | 'pedagogy' | 'persistence';
  xp_required: number;
  is_unlocked: boolean;
  earned_at?: string;
}

export interface TeacherActionLog {
  id: string;
  teacher_id: string;
  action_type: TeacherActionType;
  xp_earned: number;
  karma_earned: number;
  coins_earned: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface TeacherSocialLoopProgress {
  hasCreatedActivityToday: boolean;
  hasPublishedToCommunity: boolean;
  hasAssignedToGroup: boolean;
  dailyUpvotesCount: number;
  studentsActiveToday: number;
  loopCompleted: boolean;
}

/**
 * Evento estandarizado de finalización para cualquier simulador de la Guía de 50 Simuladores o juego del Factory.
 */
export interface ISimulatorCompletionEvent {
  simulatorId: string; // ej: 'phet-forces-motion', 'geogebra-algebra', 'molview-3d', 'wokwi-arduino'
  templateType: string; // 'trivia' | 'memorama' | 'external_embed' | 'circuit' | etc.
  category: 'physics' | 'math' | 'chemistry' | 'biology' | 'robotics' | 'humanities' | 'custom';
  activityId: string;
  teacherId: string;
  studentId: string;
  score: number; // Porcentaje de dominio (0 - 100)
  timeSpentSeconds: number;
  metadata?: Record<string, any>;
}

/**
 * Ponderaciones oficiales del sistema de recompensas del docente (MANUAL_FUNCIONES_LMS_GAMIFICADO)
 */
export const TEACHER_ACTION_REWARDS: Record<TeacherActionType, { xp: number; karma: number; coins: number; label: string }> = {
  CREATE_ACTIVITY: {
    xp: 30,
    karma: 0,
    coins: 10,
    label: 'Diseño de Actividad en Estudio'
  },
  PUBLISH_COMMUNITY: {
    xp: 50,
    karma: 15,
    coins: 15,
    label: 'Publicación en Red Docente'
  },
  RECEIVE_UPVOTE: {
    xp: 10,
    karma: 5,
    coins: 2,
    label: 'Reconocimiento Colegiado Recibido'
  },
  GIVE_UPVOTE: {
    xp: 5,
    karma: 2,
    coins: 1,
    label: 'Voto y Retroalimentación a Par'
  },
  ASSIGN_CLASS: {
    xp: 40,
    karma: 5,
    coins: 10,
    label: 'Asignación Dinámica a Grupo'
  },
  STUDENT_COMPLETION: {
    xp: 5,
    karma: 2,
    coins: 1,
    label: 'Desafío Resuelto por Alumno'
  },
  REVIEW_EVIDENCE: {
    xp: 20,
    karma: 5,
    coins: 5,
    label: 'Evaluación Formativa de Evidencia'
  },
  SIMULATOR_EXPLORATION: {
    xp: 25,
    karma: 10,
    coins: 5,
    label: 'Integración de Simulador Científico'
  }
};
