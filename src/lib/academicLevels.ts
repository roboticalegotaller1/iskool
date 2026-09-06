import { DetailedStudent } from '@/types';

export type AcademicLevel = 'primaria' | 'secundaria' | 'preparatoria';
export type AcademicSubLevel = 'primaria_baja' | 'primaria_alta' | 'secundaria' | 'preparatoria';
export type AgeGroup = 'infantil' | 'intermedio' | 'juvenil' | 'preuniversitario';
export type PortalTheme = 'mascotas_virtuales' | 'exploracion_aventura' | 'gremio_rpg' | 'startup_prepa';

export interface StudentAcademicLevelInfo {
  level: AcademicLevel;
  grade: string;
  subLevel: AcademicSubLevel;
  levelLabel: string;
  shortLevelLabel: string;
  fullGradeLabel: string;
  ageGroup: AgeGroup;
  ageRange: string;
  nemPhase: string;
  portalTheme: PortalTheme;
  avatarTitle: string;
  avatarSubtitle: string;
  backButtonLabel: string;
  tagLabel: string;
  rpgClassAllowed: string[];
}

/**
 * Normaliza y extrae el número de grado de un string como '1º', '2º', '4º Semestre', '1', etc.
 */
export const extractGradeNumber = (gradeStr?: string): number => {
  if (!gradeStr) return 1;
  const match = gradeStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

/**
 * Determina toda la configuración pedagógica, de diseño y edad para un estudiante en ISkool.
 */
export const getStudentAcademicLevelInfo = (
  student?: Partial<DetailedStudent> | null,
  fallbackLevel?: AcademicLevel
): StudentAcademicLevelInfo => {
  // 1. Determinar nivel base
  let level: AcademicLevel = 'primaria';
  
  const rawLevel = (student?.level || fallbackLevel || '').toLowerCase();
  if (rawLevel.includes('secundaria') || rawLevel === 'sec') {
    level = 'secundaria';
  } else if (rawLevel.includes('prepa') || rawLevel.includes('bachillerato') || rawLevel === 'prep') {
    level = 'preparatoria';
  } else {
    // Si el campus tiene el nombre del nivel
    const campusName = (student?.campus_name || '').toLowerCase();
    if (campusName.includes('secundaria')) {
      level = 'secundaria';
    } else if (campusName.includes('prepa') || campusName.includes('bachillerato')) {
      level = 'preparatoria';
    } else {
      level = 'primaria';
    }
  }

  // 2. Grado escolar
  const rawGrade = student?.grade || (level === 'preparatoria' ? '1º Semestre' : '1º');
  const gradeNum = extractGradeNumber(rawGrade);

  // 3. Subnivel y Grupo de Edad
  if (level === 'primaria') {
    if (gradeNum <= 3) {
      // Primaria Baja: 1º a 3º (6 a 8 años) - Fases 1 a 3 NEM
      return {
        level: 'primaria',
        grade: `${gradeNum}º`,
        subLevel: 'primaria_baja',
        levelLabel: 'Primaria Baja',
        shortLevelLabel: 'Primaria',
        fullGradeLabel: `${gradeNum}º de Primaria (Baja)`,
        ageGroup: 'infantil',
        ageRange: '6 - 8 años',
        nemPhase: gradeNum === 1 ? 'Fase 3 (1º Primaria)' : gradeNum === 2 ? 'Fase 3 (2º Primaria)' : 'Fase 4 (3º Primaria)',
        portalTheme: 'mascotas_virtuales',
        avatarTitle: 'Edita tu Avatar de Primaria Baja',
        avatarSubtitle: 'Crea la apariencia divertida para tu personaje y acompáñalo en tus aventuras y misiones escolares.',
        backButtonLabel: 'Volver a mis Misiones',
        tagLabel: 'Personalizador Infantil 2D',
        rpgClassAllowed: ['mago', 'curador', 'domador']
      };
    } else {
      // Primaria Alta: 4º a 6º (9 a 11 años) - Fases 4 y 5 NEM
      return {
        level: 'primaria',
        grade: `${gradeNum}º`,
        subLevel: 'primaria_alta',
        levelLabel: 'Primaria Alta',
        shortLevelLabel: 'Primaria',
        fullGradeLabel: `${gradeNum}º de Primaria (Alta)`,
        ageGroup: 'intermedio',
        ageRange: '9 - 11 años',
        nemPhase: gradeNum <= 4 ? 'Fase 4 (4º Primaria)' : 'Fase 5 (5º - 6º Primaria)',
        portalTheme: 'exploracion_aventura',
        avatarTitle: 'Edita tu Avatar de Primaria Alta',
        avatarSubtitle: 'Diseña la apariencia de tu explorador y supera grandes retos y misiones de aprendizaje.',
        backButtonLabel: 'Volver a mis Misiones',
        tagLabel: 'Personalizador Escolar 2D',
        rpgClassAllowed: ['mago', 'guerrero', 'curador', 'cazador', 'domador']
      };
    }
  }

  if (level === 'secundaria') {
    // Secundaria: 1º a 3º (12 a 14 años) - Fase 6 NEM
    const secGrade = gradeNum > 3 ? 1 : gradeNum;
    return {
      level: 'secundaria',
      grade: `${secGrade}º`,
      subLevel: 'secundaria',
      levelLabel: 'Secundaria',
      shortLevelLabel: 'Secundaria',
      fullGradeLabel: `${secGrade}º de Secundaria`,
      ageGroup: 'juvenil',
      ageRange: '12 - 14 años',
      nemPhase: `Fase 6 (${secGrade}º Secundaria)`,
      portalTheme: 'gremio_rpg',
      avatarTitle: 'Edita tu Avatar de Secundaria',
      avatarSubtitle: 'Crea la apariencia perfecta para tu héroe y lúcelo en las misiones y desafíos del gremio escolar.',
      backButtonLabel: 'Volver al Gremio',
      tagLabel: 'Personalizador 2D Anime',
      rpgClassAllowed: ['guerrero', 'mago', 'ninja', 'curador', 'domador', 'cazador', 'reptil']
    };
  }

  // Preparatoria / Bachillerato: 1º a 6º Semestre (15 a 18 años)
  const prepSem = gradeNum > 6 ? 1 : gradeNum;
  return {
    level: 'preparatoria',
    grade: `${prepSem}º Semestre`,
    subLevel: 'preparatoria',
    levelLabel: 'Preparatoria',
    shortLevelLabel: 'Preparatoria',
    fullGradeLabel: `${prepSem}º Semestre de Preparatoria`,
    ageGroup: 'preuniversitario',
    ageRange: '15 - 18 años',
    nemPhase: 'Educación Media Superior (Bachillerato)',
    portalTheme: 'startup_prepa',
    avatarTitle: 'Edita tu Avatar de Preparatoria',
    avatarSubtitle: 'Diseña tu identidad estudiantil y perfil para tus proyectos, portafolio e iniciativas académicas.',
    backButtonLabel: 'Volver al Campus',
    tagLabel: 'Identidad Estudiantil Digital',
    rpgClassAllowed: ['guerrero', 'mago', 'ninja', 'curador', 'domador', 'cazador', 'reptil']
  };
};
