import { describe, it, expect } from 'vitest';
import { english40WeeksCurriculum } from '../src/components/languages/data/english40WeeksCurriculum';
import { french40WeeksCurriculum } from '../src/components/languages/data/french40WeeksCurriculum';

describe('🌍 Centro de Idiomas & Fonética Avanzada - Arquitectura Curricular de 40 Semanas (ESL & FLE)', () => {
  it('Debe contener exactamente 40 semanas continuas para Inglés (ESL) sin omisiones intermedias', () => {
    expect(english40WeeksCurriculum).toHaveLength(40);
    
    // Validar orden secuencial del 1 al 40
    english40WeeksCurriculum.forEach((week, idx) => {
      expect(week.weekNumber).toBe(idx + 1);
      expect(week.title).toBeTruthy();
      expect(week.level).toBeTruthy();
      expect(week.pda).toBeTruthy();
      expect(week.certificationTarget).toBeTruthy();
      expect(week.trimester).toBeGreaterThanOrEqual(1);
      expect(week.trimester).toBeLessThanOrEqual(3);
    });
  });

  it('Debe tener exactamente 4 lecciones por semana para Inglés (160 lecciones totales) con objetivos fonéticos', () => {
    let totalEnglishLessons = 0;
    
    english40WeeksCurriculum.forEach((week) => {
      expect(week.lessons).toHaveLength(4);
      totalEnglishLessons += week.lessons.length;
      
      week.lessons.forEach((lesson) => {
        expect(lesson.id).toBeTruthy();
        expect(lesson.title).toBeTruthy();
        expect(lesson.target.length).toBeGreaterThan(10);
        expect(lesson.translationEs).toBeTruthy();
        expect(lesson.phoneticTip).toBeTruthy();
      });
    });

    expect(totalEnglishLessons).toBe(160);
  });

  it('Debe contener exactamente 40 semanas continuas para Francés (FLE) sin omisiones intermedias', () => {
    expect(french40WeeksCurriculum).toHaveLength(40);
    
    // Validar orden secuencial del 1 al 40
    french40WeeksCurriculum.forEach((week, idx) => {
      expect(week.weekNumber).toBe(idx + 1);
      expect(week.title).toBeTruthy();
      expect(week.level).toBeTruthy();
      expect(week.pda).toBeTruthy();
      expect(week.certificationTarget).toBeTruthy();
      expect(week.trimester).toBeGreaterThanOrEqual(1);
      expect(week.trimester).toBeLessThanOrEqual(3);
    });
  });

  it('Debe tener exactamente 4 lecciones por semana para Francés (160 lecciones totales) con fonética DELF', () => {
    let totalFrenchLessons = 0;
    
    french40WeeksCurriculum.forEach((week) => {
      expect(week.lessons).toHaveLength(4);
      totalFrenchLessons += week.lessons.length;
      
      week.lessons.forEach((lesson) => {
        expect(lesson.id).toBeTruthy();
        expect(lesson.title).toBeTruthy();
        expect(lesson.target.length).toBeGreaterThan(10);
        expect(lesson.translationEs).toBeTruthy();
        expect(lesson.phoneticTip).toBeTruthy();
      });
    });

    expect(totalFrenchLessons).toBe(160);
  });

  it('Debe alinear los hitos de certificación trimestral (S13, S26, S40) a estándares internacionales', () => {
    // Trimestre 1 - Capstone A1
    expect(english40WeeksCurriculum[12].weekNumber).toBe(13);
    expect(english40WeeksCurriculum[12].certificationTarget).toContain('Cambridge');
    expect(french40WeeksCurriculum[12].weekNumber).toBe(13);
    expect(french40WeeksCurriculum[12].certificationTarget).toContain('DELF');

    // Trimestre 2 - Capstone A2
    expect(english40WeeksCurriculum[25].weekNumber).toBe(26);
    expect(english40WeeksCurriculum[25].certificationTarget).toContain('A2');
    expect(french40WeeksCurriculum[25].weekNumber).toBe(26);
    expect(french40WeeksCurriculum[25].certificationTarget).toContain('A2');

    // Trimestre 3 - Capstone Final B2
    expect(english40WeeksCurriculum[39].weekNumber).toBe(40);
    expect(english40WeeksCurriculum[39].certificationTarget).toContain('B2');
    expect(french40WeeksCurriculum[39].weekNumber).toBe(40);
    expect(french40WeeksCurriculum[39].certificationTarget).toContain('B2');
  });
});
