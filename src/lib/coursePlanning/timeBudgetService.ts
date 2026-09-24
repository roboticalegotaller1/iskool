/**
 * @file timeBudgetService.ts
 * @description Servicio de cálculo y validación del presupuesto de tiempo pedagógico (Time Budget & Buffer Allocation).
 * Garantiza que el curso no exceda el tiempo lectivo disponible y reserve colchón para contingencias.
 */

import { CourseEntity, LessonEntity, TimeBudgetReport } from './types';

export class TimeBudgetService {
  /**
   * Calcula el diagnóstico completo del presupuesto de tiempo para un curso y sus lecciones.
   */
  static calculate(course: CourseEntity, lessons: LessonEntity[] = []): TimeBudgetReport {
    const totalAvailableMinutes = course.total_weeks * course.sessions_per_week * course.minutes_per_session;
    
    const instructionalPercent = course.instructional_allocation_percent || 85;
    const bufferPercent = course.buffer_allocation_percent || (100 - instructionalPercent);
    
    const targetInstructionalMinutes = Math.round(totalAvailableMinutes * (instructionalPercent / 100));
    const targetBufferMinutes = totalAvailableMinutes - targetInstructionalMinutes;
    
    // Lecciones lectivas regulares vs sesiones de buffer / repaso / contingencia
    let plannedInstructionalMinutes = 0;
    let plannedBufferMinutes = 0;
    
    for (const lesson of lessons) {
      const duration = lesson.duration_minutes || course.minutes_per_session;
      if (lesson.lesson_type === 'review' || lesson.lesson_type === 'assessment' || lesson.lesson_type === 'project') {
        plannedBufferMinutes += duration;
      } else {
        plannedInstructionalMinutes += duration;
      }
    }
    
    const totalPlannedMinutes = plannedInstructionalMinutes + plannedBufferMinutes;
    const isOverflow = totalPlannedMinutes > totalAvailableMinutes;
    const overflowMinutes = isOverflow ? totalPlannedMinutes - totalAvailableMinutes : 0;
    
    const instructionalUtilizationPercent = totalAvailableMinutes > 0
      ? Math.round((totalPlannedMinutes / totalAvailableMinutes) * 100)
      : 0;

    return {
      total_weeks: course.total_weeks,
      sessions_per_week: course.sessions_per_week,
      minutes_per_session: course.minutes_per_session,
      total_available_minutes: totalAvailableMinutes,
      target_instructional_minutes: targetInstructionalMinutes,
      planned_instructional_minutes: plannedInstructionalMinutes,
      target_buffer_minutes: targetBufferMinutes,
      planned_buffer_minutes: plannedBufferMinutes,
      total_planned_minutes: totalPlannedMinutes,
      is_overflow: isOverflow,
      overflow_minutes: overflowMinutes,
      instructional_utilization_percent: instructionalUtilizationPercent
    };
  }
}
