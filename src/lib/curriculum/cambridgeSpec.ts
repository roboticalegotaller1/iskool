/**
 * Especificaciones curriculares de Lengua Extranjera (Inglés / CEFR) para ISkool.
 * Módulo ligero sin dependencias pesadas para carga rápida en cold-start.
 */

export interface CambridgeLevelSpec {
  levelCode: string; // e.g. "A2 Flyers"
  cefrLevel: string; // e.g. "A2"
  qualificationName: string; // e.g. "Cambridge English: Young Learners (YLE Flyers)"
  targetAudience: string; // e.g. "Primaria Alta (Fase 5: 5º y 6º Grado)"
  primarySkills: string[]; // ["Listening", "Speaking", "Reading", "Writing", "Grammar & Vocabulary"]
  canDoSummary: string; // "Reconoce y utiliza expresiones cotidianas..."
  proniMaterial: string; // "PRONI SEP: English Reader & Activity Book 5º/6º"
  cambridgeGuide: string; // "Cambridge English: A2 Flyers Practice Book"
  targetGrammarFocus?: string[];
}

export const CAMBRIDGE_SPECS: Record<string, CambridgeLevelSpec> = {
  'preescolar': {
    levelCode: 'Pre-A1 Starters',
    cefrLevel: 'Pre-A1',
    qualificationName: 'Cambridge English: Young Learners (YLE Starters - Early Foundations)',
    targetAudience: 'Preescolar (Fase 2: 3 a 5 años)',
    primarySkills: ['Listening', 'Speaking (Oral/Aural)', 'Phonics & Pronunciation', 'TPR (Total Physical Response)'],
    canDoSummary: 'Reconoce y reproduce saludos básicos, colores, números del 1 al 10 y objetos del entorno inmediato mediante canciones infantiles, mímica y tarjetas ilustradas (flashcards).',
    proniMaterial: 'PRONI SEP Preescolar: English Activity Kit & Nursery Audio',
    cambridgeGuide: 'Cambridge Pre-A1 Starters Wordlist & Classroom Phonics Guide'
  },
  'primaria-baja': {
    levelCode: 'Pre-A1 Starters',
    cefrLevel: 'Pre-A1',
    qualificationName: 'Cambridge English: Young Learners (YLE Starters)',
    targetAudience: 'Primaria Baja (Fase 3: 1º y 2º Grado)',
    primarySkills: ['Listening & Pointing', 'Simple Spoken Production', 'Word Recognition & Spelling', 'Short Descriptive Chants'],
    canDoSummary: 'Formula y responde preguntas básicas sobre sí mismo (nombre, edad, estado de ánimo), sigue comandos de aula y asocia grafías con sonidos fonéticos elementales.',
    proniMaterial: 'PRONI SEP: English Activity Book 1st & 2nd Grade',
    cambridgeGuide: 'Cambridge Young Learners English (YLE) Starters Handbook & Vocabulary List'
  },
  'primaria-media': {
    levelCode: 'A1 Movers',
    cefrLevel: 'A1',
    qualificationName: 'Cambridge English: Young Learners (YLE Movers)',
    targetAudience: 'Primaria Media (Fase 4: 3º y 4º Grado)',
    primarySkills: ['Listening for Detail', 'Paired Spoken Interaction', 'Reading Short Stories', 'Writing Short Sentences (20-30 words)'],
    canDoSummary: 'Comprende y participa en intercambios orales sencillos sobre rutinas diarias, gustos, habilidades (can/can\'t) y descripciones básicas de personas y animales.',
    proniMaterial: 'PRONI SEP: English Activity Book 3rd & 4th Grade',
    cambridgeGuide: 'Cambridge English: A1 Movers Examination Preparation Guide'
  },
  'primaria-alta': {
    levelCode: 'A2 Flyers',
    cefrLevel: 'A2',
    qualificationName: 'Cambridge English: Young Learners (YLE Flyers)',
    targetAudience: 'Primaria Alta (Fase 5: 5º y 6º Grado)',
    primarySkills: ['Interactive Spoken Interviews', 'Reading Comprehension', 'Descriptive Paragraph Writing (30-50 words)', 'Grammar in Context'],
    canDoSummary: 'Utiliza el verbo to be, presente simple, pasado y futuro próximo para describir personas, planes y experiencias; participa en diálogos situacionales y redacta textos estructurados con conectores.',
    proniMaterial: 'PRONI SEP: English Reader & Activity Book 5th & 6th Grade',
    cambridgeGuide: 'Cambridge English: A2 Flyers Practice Papers & Teacher Handbook'
  },
  'secundaria': {
    levelCode: 'A2 Key / B1 Preliminary',
    cefrLevel: 'A2 - B1',
    qualificationName: 'Cambridge English Qualifications: A2 Key for Schools (KET) & B1 Preliminary for Schools (PET)',
    targetAudience: 'Secundaria (Fase 6: 1º a 3º Grado)',
    primarySkills: ['Transactional Writing (Emails & Notes)', 'Listening for Specific Information', 'Collaborative Spoken Tasks', 'Reading Notices & Articles'],
    canDoSummary: 'Expresa opiniones, acuerdos y desacuerdos con fluidez funcional; comprende textos informativos auténticos y redacta correspondencia, reportes breves y entrevistas situadas.',
    proniMaterial: 'SEP Lengua Extranjera: Inglés Secundaria (Fase 6)',
    cambridgeGuide: 'Cambridge A2 Key for Schools & B1 Preliminary for Schools Handbook'
  },
  'preparatoria': {
    levelCode: 'B1+ / B2 First for Schools',
    cefrLevel: 'B2',
    qualificationName: 'Cambridge English Qualifications: B2 First for Schools (FCE)',
    targetAudience: 'Preparatoria / Bachillerato General (MCCEMS)',
    primarySkills: ['Academic Essay Writing', 'Spoken Debates & Presentations', 'Critical Reading Analysis', 'Listening to Lectures/Podcasts'],
    canDoSummary: 'Demuestra autonomía discursiva en situaciones académicas y profesionales; argumenta posturas con vocabulario idiomático, estructuras gramaticales complejas y registro formal e informal adecuado.',
    proniMaterial: 'MCCEMS Programa de Lengua Extranjera (Inglés I a IV)',
    cambridgeGuide: 'Cambridge English: B2 First for Schools Teacher Resource Pack'
  }
};

export function getCambridgeSpecification(level: string): CambridgeLevelSpec {
  return CAMBRIDGE_SPECS[level] || CAMBRIDGE_SPECS['primaria-alta'];
}

export function isEnglishSubject(subjectIdOrName: string = '', topic: string = ''): boolean {
  const cleanSub = (subjectIdOrName || '').toLowerCase();
  const cleanTopic = (topic || '').toLowerCase();
  return (
    cleanSub.includes('ingl') ||
    cleanSub.includes('english') ||
    cleanSub.includes('foreign') ||
    cleanSub.includes('extranjera') ||
    cleanSub.endsWith('-ing') ||
    /verb\b|grammar|vocabulary|speaking|listening|reading|writing|phonics|past simple|present continuous|present simple|future will|going to|cambridge|cefr|to be\b|to-be|pronoun|adjective|preposition|modal verbs|daily routine|flyers|movers|starters|ket\b|pet\b|fce\b|ielts|toefl|clil/i.test(cleanTopic)
  );
}
