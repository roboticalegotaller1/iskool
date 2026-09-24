/**
 * @file adaptiveStore.ts
 * @description Capa de almacenamiento y persistencia del subsistema AdaptiveLearning (Fase 7).
 * Provee una interfaz unificada con soporte dual:
 * 1. En memoria (In-Memory Map) para pruebas automatizadas ultra-rápidas y offline.
 * 2. Persistencia en Supabase cuando el cliente de base de datos está disponible.
 */

import {
  StudentAcademicProfileEntity,
  StudentCompetencyEntity,
  LearningEvidenceEntity,
  MasteryState
} from './types';
import { supabase } from '../supabaseClient';

export class AdaptiveLearningStore {
  // Almacenes en memoria
  private static profiles = new Map<string, StudentAcademicProfileEntity>();
  private static competencies = new Map<string, Map<string, StudentCompetencyEntity>>();
  private static evidences = new Map<string, LearningEvidenceEntity[]>();

  /**
   * Limpia el almacén en memoria
   */
  static clear(): void {
    this.profiles.clear();
    this.competencies.clear();
    this.evidences.clear();
  }

  /**
   * Obtiene o crea el perfil académico de un estudiante
   */
  static async getProfile(studentId: string, defaultGrade: string = 'high_school_1'): Promise<StudentAcademicProfileEntity> {
    // 1. Verificar en memoria
    if (this.profiles.has(studentId)) {
      return this.profiles.get(studentId)!;
    }

    // 2. Intentar recuperar desde Supabase
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('student_academic_profiles')
          .select('*')
          .eq('student_id', studentId)
          .eq('subject', 'english')
          .maybeSingle();

        if (data && !error) {
          const profile: StudentAcademicProfileEntity = {
            id: data.id,
            student_id: data.student_id,
            school_id: data.school_id,
            subject: data.subject,
            grade: data.grade,
            overall_estimated_level: data.overall_estimated_level,
            reading: {
              level: data.reading_level,
              confidence: Number(data.reading_confidence),
              confidence_level: Number(data.reading_confidence) > 0.8 ? 'strong' : Number(data.reading_confidence) > 0.5 ? 'medium' : 'low',
              evidence_count: data.reading_evidence_count,
              status: 'on_track'
            },
            listening: {
              level: data.listening_level,
              confidence: Number(data.listening_confidence),
              confidence_level: Number(data.listening_confidence) > 0.8 ? 'strong' : Number(data.listening_confidence) > 0.5 ? 'medium' : 'low',
              evidence_count: data.listening_evidence_count,
              status: 'on_track'
            },
            speaking: {
              level: data.speaking_level,
              confidence: Number(data.speaking_confidence),
              confidence_level: Number(data.speaking_confidence) > 0.8 ? 'strong' : Number(data.speaking_confidence) > 0.5 ? 'medium' : 'low',
              evidence_count: data.speaking_evidence_count,
              status: 'on_track'
            },
            writing: {
              level: data.writing_level,
              confidence: Number(data.writing_confidence),
              confidence_level: Number(data.writing_confidence) > 0.8 ? 'strong' : Number(data.writing_confidence) > 0.5 ? 'medium' : 'low',
              evidence_count: data.writing_evidence_count,
              status: 'on_track'
            },
            grammar: {
              level: data.grammar_level,
              confidence: Number(data.grammar_confidence),
              confidence_level: Number(data.grammar_confidence) > 0.8 ? 'strong' : Number(data.grammar_confidence) > 0.5 ? 'medium' : 'low',
              evidence_count: data.grammar_evidence_count,
              status: 'on_track'
            },
            vocabulary: {
              level: data.vocabulary_level,
              confidence: Number(data.vocabulary_confidence),
              confidence_level: Number(data.vocabulary_confidence) > 0.8 ? 'strong' : Number(data.vocabulary_confidence) > 0.5 ? 'medium' : 'low',
              evidence_count: data.vocabulary_evidence_count,
              status: 'on_track'
            },
            profile_version: data.profile_version,
            metadata: data.metadata || {},
            created_at: data.created_at,
            last_updated_at: data.last_updated_at
          };
          this.profiles.set(studentId, profile);
          return profile;
        }
      } catch {
        // Fallback a inicialización
      }
    }

    // 3. Crear perfil por defecto
    const defaultProfile: StudentAcademicProfileEntity = {
      id: `prof_${studentId}`,
      student_id: studentId,
      subject: 'english',
      grade: defaultGrade,
      overall_estimated_level: 'B1',
      reading: { level: 'B1', confidence: 0.60, confidence_level: 'medium', evidence_count: 2, status: 'on_track' },
      listening: { level: 'B1', confidence: 0.60, confidence_level: 'medium', evidence_count: 2, status: 'on_track' },
      speaking: { level: 'A2', confidence: 0.50, confidence_level: 'medium', evidence_count: 2, status: 'needs_support' },
      writing: { level: 'A2', confidence: 0.50, confidence_level: 'medium', evidence_count: 1, status: 'needs_support' },
      grammar: { level: 'B1', confidence: 0.65, confidence_level: 'medium', evidence_count: 3, status: 'on_track' },
      vocabulary: { level: 'A2', confidence: 0.55, confidence_level: 'medium', evidence_count: 2, status: 'progressing' },
      profile_version: 1,
      created_at: new Date().toISOString(),
      last_updated_at: new Date().toISOString()
    };

    this.profiles.set(studentId, defaultProfile);
    return defaultProfile;
  }

  /**
   * Guarda o actualiza un perfil académico
   */
  static async saveProfile(profile: StudentAcademicProfileEntity): Promise<void> {
    this.profiles.set(profile.student_id, profile);

    if (supabase) {
      try {
        await supabase
          .from('student_academic_profiles')
          .upsert({
            student_id: profile.student_id,
            school_id: profile.school_id,
            subject: profile.subject,
            grade: profile.grade,
            overall_estimated_level: profile.overall_estimated_level,
            reading_level: profile.reading.level,
            reading_confidence: profile.reading.confidence,
            reading_evidence_count: profile.reading.evidence_count,
            listening_level: profile.listening.level,
            listening_confidence: profile.listening.confidence,
            listening_evidence_count: profile.listening.evidence_count,
            speaking_level: profile.speaking.level,
            speaking_confidence: profile.speaking.confidence,
            speaking_evidence_count: profile.speaking.evidence_count,
            writing_level: profile.writing.level,
            writing_confidence: profile.writing.confidence,
            writing_evidence_count: profile.writing.evidence_count,
            grammar_level: profile.grammar.level,
            grammar_confidence: profile.grammar.confidence,
            grammar_evidence_count: profile.grammar.evidence_count,
            vocabulary_level: profile.vocabulary.level,
            vocabulary_confidence: profile.vocabulary.confidence,
            vocabulary_evidence_count: profile.vocabulary.evidence_count,
            profile_version: profile.profile_version,
            metadata: profile.metadata || {},
            last_updated_at: new Date().toISOString()
          }, { onConflict: 'student_id, subject' });
      } catch {
        // En entorno local/offline, se mantiene en memoria
      }
    }
  }

  /**
   * Obtiene todos los perfiles académicos cargados
   */
  static async getAllProfiles(): Promise<StudentAcademicProfileEntity[]> {
    return Array.from(this.profiles.values());
  }

  /**
   * Obtiene el mapa de micro-competencias de un estudiante
   */
  static async getCompetencies(studentId: string): Promise<Map<string, StudentCompetencyEntity>> {
    if (!this.competencies.has(studentId)) {
      this.competencies.set(studentId, new Map());
    }
    return this.competencies.get(studentId)!;
  }

  /**
   * Guarda micro-competencias actualizadas
   */
  static async saveCompetencies(studentId: string, list: StudentCompetencyEntity[]): Promise<void> {
    const map = await this.getCompetencies(studentId);
    for (const c of list) {
      map.set(c.knowledge_unit_id, c);
    }
  }

  /**
   * Registra una nueva evidencia de aprendizaje
   */
  static async recordEvidence(evidence: LearningEvidenceEntity): Promise<void> {
    if (!this.evidences.has(evidence.student_id)) {
      this.evidences.set(evidence.student_id, []);
    }
    this.evidences.get(evidence.student_id)!.push(evidence);

    if (supabase) {
      try {
        await supabase
          .from('learning_evidences')
          .insert({
            student_id: evidence.student_id,
            evidence_type: evidence.evidence_type,
            skill: evidence.skill,
            knowledge_targets: evidence.knowledge_targets,
            learning_outcome: evidence.learning_outcome,
            assessment_id: evidence.assessment_id,
            difficulty: evidence.difficulty,
            score: evidence.score,
            rubric_level: evidence.rubric_level,
            attempts_count: evidence.attempts_count,
            result_metadata: evidence.result_metadata || {},
            created_at: evidence.created_at
          });
      } catch {
        // En entorno local/offline, se mantiene en memoria
      }
    }
  }

  /**
   * Obtiene la bitácora de evidencias de un estudiante
   */
  static async getEvidences(studentId: string): Promise<LearningEvidenceEntity[]> {
    return this.evidences.get(studentId) || [];
  }

  /**
   * Aplica un Teacher Override para preservar la autoridad del docente
   */
  static async setTeacherOverride(
    studentId: string,
    knowledgeUnitId: string,
    state: MasteryState,
    notes?: string,
    locked: boolean = true
  ): Promise<StudentCompetencyEntity> {
    const map = await this.getCompetencies(studentId);
    let comp = map.get(knowledgeUnitId);

    if (!comp) {
      comp = {
        id: `comp_override_${Date.now()}`,
        student_id: studentId,
        knowledge_unit_id: knowledgeUnitId,
        subject: 'english',
        domain: 'Skills',
        skill: 'speaking',
        estimated_level: 'B1',
        mastery_state: state,
        confidence: 0.95,
        confidence_level: 'strong',
        evidence_count: 1,
        source: 'teacher_confirmed',
        teacher_override: true,
        teacher_notes: notes,
        locked,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    } else {
      comp.mastery_state = state;
      comp.source = 'teacher_confirmed';
      comp.teacher_override = true;
      comp.teacher_notes = notes;
      comp.locked = locked;
      comp.confidence = 0.95;
      comp.confidence_level = 'strong';
      comp.updated_at = new Date().toISOString();
    }

    map.set(knowledgeUnitId, comp);
    return comp;
  }
}
