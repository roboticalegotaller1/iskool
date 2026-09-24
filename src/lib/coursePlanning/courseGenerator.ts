/**
 * @file courseGenerator.ts
 * @description Generador Maestro de Cursos Curriculares (CoursePlanning::CourseGenerator).
 * Orquesta la creación del Course Skeleton, Unidades, Lecciones, Slots de Actividad y Blueprints de Evaluación,
 * integrando el cálculo de tiempo lectivo, balance didáctico, currículo espiral y compuertas de calidad.
 */

import {
  CourseEntity,
  UnitEntity,
  LessonEntity,
  ActivitySlotEntity,
  AssessmentEntity,
  TimeBudgetReport,
  SkillBalanceReport,
  KnowledgeTimelineReport,
  CurriculumAlignmentReport,
  CourseCoverageReport,
  CourseQualityReport
} from './types';
import { UnitPlanner } from './unitPlanner';
import { LessonPlanner } from './lessonPlanner';
import { AssessmentBlueprintService } from './assessmentBlueprintService';
import { TimeBudgetService } from './timeBudgetService';
import { SkillBalanceService } from './skillBalanceService';
import { KnowledgeTimelineService } from './knowledgeTimelineService';
import { CurriculumAlignmentService } from './curriculumAlignmentService';
import { CourseCoverageService } from './courseCoverageService';
import { CourseQualityChecker } from './courseQualityChecker';
import { CourseStore } from './courseStore';

export interface CourseGeneratorParams {
  subject?: string;
  grade: string;
  entry_cefr: string;
  target_cefr: string;
  total_weeks?: number;
  sessions_per_week?: number;
  minutes_per_session?: number;
  title?: string;
  school_stage?: string;
  academic_year?: string;
  instructional_allocation_percent?: number;
  buffer_allocation_percent?: number;
}

export interface CourseGenerationResult {
  course: CourseEntity;
  units: UnitEntity[];
  lessons: LessonEntity[];
  slots: ActivitySlotEntity[];
  assessments: AssessmentEntity[];
  timeBudget: TimeBudgetReport;
  skillBalance: SkillBalanceReport;
  knowledgeTimeline: KnowledgeTimelineReport;
  alignment: CurriculumAlignmentReport;
  coverage: CourseCoverageReport;
  quality: CourseQualityReport;
}

export class CourseGenerator {
  /**
   * Alias de compatibilidad canónico para generación de cursos curriculares.
   */
  static generateCourse(params: CourseGeneratorParams): CourseGenerationResult {
    return this.call(params);
  }

  /**
   * Genera el plan curricular completo para una asignatura y grado dados.
   */
  static call(params: CourseGeneratorParams): CourseGenerationResult {
    const totalWeeks = params.total_weeks || 40;
    const sessionsPerWeek = params.sessions_per_week || 4;
    const minutesPerSession = params.minutes_per_session || 50;
    const subject = params.subject || 'english';
    const grade = params.grade || 'high_school_1';
    const entryCefr = params.entry_cefr || 'B1';
    const targetCefr = params.target_cefr || 'B2';
    const instructionalPct = params.instructional_allocation_percent || 85;
    const bufferPct = params.buffer_allocation_percent || 15;

    const courseId = `course_${subject}_${grade}_${Date.now()}`;
    const now = new Date().toISOString();

    // 1. Instanciar Entidad Course
    const courseTitle = params.title || (
      subject === 'french'
        ? `Lycée 1ère Année Français Fondamental (B1 → B1+/B2 DELF)`
        : `High School 1st Grade Core English (B1 → B1+/B2)`
    );
    const course: CourseEntity = {
      id: courseId,
      title: courseTitle,
      subject,
      school_stage: params.school_stage || 'high_school',
      grade,
      academic_year: params.academic_year || '2025-2026',
      entry_cefr: entryCefr,
      target_cefr: targetCefr,
      total_weeks: totalWeeks,
      sessions_per_week: sessionsPerWeek,
      minutes_per_session: minutesPerSession,
      instructional_allocation_percent: instructionalPct,
      buffer_allocation_percent: bufferPct,
      status: 'draft',
      version: 1,
      metadata: {
        generated_by: 'CoursePlanning::CourseGenerator',
        source: 'iSchool Knowledge Vault (English Core)'
      },
      created_at: now,
      updated_at: now
    };

    // 2. Planificar Unidades (UnitPlanner)
    const units = UnitPlanner.planUnits(course, { numberOfUnits: 8 });

    // 3. Planificar Lecciones y Slots para cada Unidad (LessonPlanner)
    const allLessons: LessonEntity[] = [];
    const allSlots: ActivitySlotEntity[] = [];
    const allAssessments: AssessmentEntity[] = [];

    let currentWeek = 1;
    for (const unit of units) {
      // Planificar sesiones
      const { lessons, slots } = LessonPlanner.planLessonsForUnit(
        unit,
        currentWeek,
        sessionsPerWeek,
        minutesPerSession
      );
      allLessons.push(...lessons);
      allSlots.push(...slots);

      // Crear Assessment Blueprint para la unidad
      const assessment = AssessmentBlueprintService.createUnitBlueprint(unit, {
        weekScheduled: currentWeek + unit.duration_weeks - 1,
        type: unit.position === 8 ? 'summative' : 'formative'
      });
      allAssessments.push(assessment);

      currentWeek += unit.duration_weeks;
    }

    // 4. Calcular Métricas e Informes Forenses
    const timeBudget = TimeBudgetService.calculate(course, allLessons);
    const skillBalance = SkillBalanceService.analyze(allLessons, allSlots);
    const knowledgeTimeline = KnowledgeTimelineService.generateReport(course.id, allLessons);
    const alignment = CurriculumAlignmentService.analyze(course.id, units, allLessons, allAssessments);
    const coverage = CourseCoverageService.analyze(course.id, course.grade, units, allLessons);
    const quality = CourseQualityChecker.verify(course, units, allLessons, allAssessments);

    // 5. Persistir en el repositorio
    CourseStore.saveCourse(course, units, allLessons, allSlots, allAssessments);

    return {
      course,
      units,
      lessons: allLessons,
      slots: allSlots,
      assessments: allAssessments,
      timeBudget,
      skillBalance,
      knowledgeTimeline,
      alignment,
      coverage,
      quality
    };
  }
}
