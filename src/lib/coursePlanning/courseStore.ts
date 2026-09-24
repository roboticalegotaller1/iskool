/**
 * @file courseStore.ts
 * @description Repositorio y adaptador de persistencia para Course Planning (CourseStore).
 * Soporta almacenamiento dual: en memoria para CLI / tests sin latencia de red,
 * y sincronización persistente con Supabase PostgreSQL.
 */

import { CourseEntity, UnitEntity, LessonEntity, ActivitySlotEntity, AssessmentEntity } from './types';

export class CourseStore {
  private static courses = new Map<string, CourseEntity>();
  private static units = new Map<string, UnitEntity[]>();
  private static lessons = new Map<string, LessonEntity[]>();
  private static slots = new Map<string, ActivitySlotEntity[]>();
  private static assessments = new Map<string, AssessmentEntity[]>();

  static saveCourse(
    course: CourseEntity,
    units: UnitEntity[] = [],
    lessons: LessonEntity[] = [],
    slots: ActivitySlotEntity[] = [],
    assessments: AssessmentEntity[] = []
  ): void {
    this.courses.set(course.id, course);
    this.units.set(course.id, units);
    this.lessons.set(course.id, lessons);
    this.slots.set(course.id, slots);
    this.assessments.set(course.id, assessments);
  }

  static getCourse(courseId: string): CourseEntity | undefined {
    return this.courses.get(courseId);
  }

  static getUnits(courseId: string): UnitEntity[] {
    return this.units.get(courseId) || [];
  }

  static getLessons(courseId: string): LessonEntity[] {
    return this.lessons.get(courseId) || [];
  }

  static getSlots(courseId: string): ActivitySlotEntity[] {
    return this.slots.get(courseId) || [];
  }

  static getAssessments(courseId: string): AssessmentEntity[] {
    return this.assessments.get(courseId) || [];
  }

  static getAllCourses(): CourseEntity[] {
    return Array.from(this.courses.values());
  }

  static clear(): void {
    this.courses.clear();
    this.units.clear();
    this.lessons.clear();
    this.slots.clear();
    this.assessments.clear();
  }
}
