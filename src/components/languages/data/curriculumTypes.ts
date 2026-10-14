export interface CurricularLesson {
  id: string;
  title: string;
  target: string;
  translationEs: string;
  phoneticTip?: string;
}

export interface CurricularWeek {
  weekNumber: number;
  title: string;
  level: string; // e.g., 'A1 (CENNI 3)', 'B1 (CENNI 10)'
  cefr: 'A1' | 'A1+' | 'A2' | 'A2+' | 'B1' | 'B1+' | 'B2';
  trimester: 1 | 2 | 3;
  certificationTarget: string; // e.g., 'Cambridge Pre-A1 Starters / A2 Key', 'DELF Junior A1'
  pda: string;
  lessons: CurricularLesson[];
}
