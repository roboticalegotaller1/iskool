/**
 * @file copilotStore.ts
 * @description Almacén en Memoria y Adaptador de Persistencia para el Teacher Copilot (Fase 9).
 * Gestiona sesiones, interacciones de auditoría y artefactos pedagógicos generados (draft -> approved -> published).
 */

import {
  TeacherCopilotSessionEntity,
  TeacherCopilotInteractionEntity,
  TeacherGeneratedArtifactEntity,
  ArtifactStatus,
  TeacherActionType
} from './types';
import { supabase } from '../supabaseClient';

export class TeacherCopilotStore {
  private static sessions: Map<string, TeacherCopilotSessionEntity> = new Map();
  private static interactions: Map<string, TeacherCopilotInteractionEntity> = new Map();
  private static artifacts: Map<string, TeacherGeneratedArtifactEntity> = new Map();

  static clear(): void {
    this.sessions.clear();
    this.interactions.clear();
    this.artifacts.clear();
  }

  // --- SESIONES ---
  static async saveSession(session: TeacherCopilotSessionEntity): Promise<TeacherCopilotSessionEntity> {
    this.sessions.set(session.id, { ...session, updated_at: new Date().toISOString() });

    try {
      if (supabase) {
        await supabase.from('teacher_copilot_sessions').upsert({
          id: session.id,
          teacher_id: session.teacher_id,
          school_id: session.school_id,
          course_id: session.course_id,
          group_id: session.group_id,
          unit_id: session.unit_id,
          lesson_id: session.lesson_id,
          assessment_id: session.assessment_id,
          title: session.title,
          status: session.status,
          settings: { constraints: session.constraints, preferences: session.preferences },
          metadata: session.metadata,
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Degradar silenciosamente a memoria local
    }

    return this.sessions.get(session.id)!;
  }

  static async getSession(id: string): Promise<TeacherCopilotSessionEntity | null> {
    return this.sessions.get(id) || null;
  }

  // --- INTERACCIONES Y AUDIT TRAIL ---
  static async logInteraction(interaction: TeacherCopilotInteractionEntity): Promise<TeacherCopilotInteractionEntity> {
    this.interactions.set(interaction.id, interaction);

    try {
      if (supabase) {
        await supabase.from('teacher_copilot_interactions').insert({
          id: interaction.id,
          session_id: interaction.session_id,
          teacher_id: interaction.teacher_id,
          request_text: interaction.request_text,
          intent: interaction.intent,
          resolved_context: interaction.resolved_context,
          model_used: interaction.model_used,
          prompt_version: interaction.prompt_version,
          response_payload: interaction.response_payload,
          teacher_action: interaction.teacher_action,
          teacher_feedback: interaction.teacher_feedback,
          created_at: interaction.created_at
        });
      }
    } catch {
      // Degradar silenciosamente a memoria local
    }

    return interaction;
  }

  static async getInteractionsBySession(sessionId: string): Promise<TeacherCopilotInteractionEntity[]> {
    return Array.from(this.interactions.values()).filter(i => i.session_id === sessionId);
  }

  static async updateInteractionAction(
    interactionId: string,
    action: TeacherActionType,
    feedback?: string
  ): Promise<TeacherCopilotInteractionEntity | null> {
    const item = this.interactions.get(interactionId);
    if (!item) return null;

    item.teacher_action = action;
    if (feedback) item.teacher_feedback = feedback;
    this.interactions.set(interactionId, item);
    return item;
  }

  // --- ARTEFACTOS GENERADOS (DRAFT -> APPROVED) ---
  static async saveArtifact(artifact: TeacherGeneratedArtifactEntity): Promise<TeacherGeneratedArtifactEntity> {
    this.artifacts.set(artifact.id, { ...artifact, updated_at: new Date().toISOString() });

    try {
      if (supabase) {
        await supabase.from('teacher_generated_artifacts').upsert({
          id: artifact.id,
          session_id: artifact.session_id,
          interaction_id: artifact.interaction_id,
          artifact_type: artifact.artifact_type,
          status: artifact.status,
          title: artifact.title,
          content: artifact.content,
          version: artifact.version,
          curriculum_locked: artifact.curriculum_locked,
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Degradar silenciosamente a memoria local
    }

    return this.artifacts.get(artifact.id)!;
  }

  static async getArtifact(id: string): Promise<TeacherGeneratedArtifactEntity | null> {
    return this.artifacts.get(id) || null;
  }

  static async getArtifactsBySession(sessionId: string): Promise<TeacherGeneratedArtifactEntity[]> {
    return Array.from(this.artifacts.values()).filter(a => a.session_id === sessionId);
  }

  static async updateArtifactStatus(
    artifactId: string,
    newStatus: ArtifactStatus,
    modifiedContent?: Record<string, unknown>
  ): Promise<TeacherGeneratedArtifactEntity | null> {
    const art = this.artifacts.get(artifactId);
    if (!art) return null;

    art.status = newStatus;
    if (modifiedContent) {
      art.content = modifiedContent;
      art.version = art.version + 1;
    }
    art.updated_at = new Date().toISOString();
    this.artifacts.set(artifactId, art);

    return art;
  }
}
