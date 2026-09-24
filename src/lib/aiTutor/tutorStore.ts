/**
 * @file tutorStore.ts
 * @description Almacén de persistencia para sesiones y mensajes del AI Tutor (Fase 8).
 * Soporta almacenamiento dual: en memoria (in-memory) para tests y ejecución local,
 * y en Supabase para producción.
 */

import { TutorSessionEntity } from './types';
import { supabase } from '../supabaseClient';

export class AITutorStore {
  private static sessions = new Map<string, TutorSessionEntity>();

  static clear(): void {
    this.sessions.clear();
  }

  static async saveSession(session: TutorSessionEntity): Promise<void> {
    this.sessions.set(session.id, session);

    if (supabase) {
      try {
        await supabase
          .from('tutor_sessions')
          .upsert({
            id: session.id,
            student_id: session.student_id,
            school_id: session.school_id,
            course_id: session.course_id,
            unit_id: session.unit_id,
            lesson_id: session.lesson_id,
            session_type: session.session_type,
            status: session.status,
            tutor_mode: session.tutor_mode,
            scaffolding_level: session.scaffolding_level,
            language_policy: session.language_policy,
            primary_learning_outcome: session.primary_learning_outcome,
            knowledge_target_ids: session.knowledge_target_ids,
            conversation_state: session.conversation_state,
            evidence_id: session.evidence_id,
            started_at: session.started_at,
            completed_at: session.completed_at,
            duration_seconds: session.duration_seconds,
            updated_at: new Date().toISOString()
          });
      } catch {
        // Fallback en memoria si la base de datos está offline
      }
    }
  }

  static async getSession(sessionId: string): Promise<TutorSessionEntity | null> {
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId)!;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('tutor_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle();

        if (data && !error) {
          const session: TutorSessionEntity = {
            id: data.id,
            student_id: data.student_id,
            school_id: data.school_id,
            course_id: data.course_id,
            unit_id: data.unit_id,
            lesson_id: data.lesson_id,
            session_type: data.session_type,
            status: data.status,
            tutor_mode: data.tutor_mode,
            scaffolding_level: data.scaffolding_level,
            language_policy: data.language_policy,
            primary_learning_outcome: data.primary_learning_outcome,
            knowledge_target_ids: data.knowledge_target_ids,
            conversation_state: data.conversation_state || {},
            messages: [],
            evidence_id: data.evidence_id,
            started_at: data.started_at,
            completed_at: data.completed_at,
            duration_seconds: data.duration_seconds || 0,
            created_at: data.created_at,
            updated_at: data.updated_at
          };
          this.sessions.set(sessionId, session);
          return session;
        }
      } catch {
        // Fallback
      }
    }

    return null;
  }

  static async listSessionsByStudent(studentId: string): Promise<TutorSessionEntity[]> {
    const list: TutorSessionEntity[] = [];
    for (const sess of this.sessions.values()) {
      if (sess.student_id === studentId) {
        list.push(sess);
      }
    }
    return list;
  }
}
