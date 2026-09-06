import { StudentStats, QuestAttempt, ShopArtifact, Quest } from '../types';

export interface AcademicPowerResult {
  basePower: number;
  questPower: number;
  artifactPower: number;
  totalBasePower: number;
  homeworkMultiplier: number;
  effectivePower: number;
  percentage: number;
  breakdown: {
    levelPower: number;
    xpPower: number;
    statPower: number;
    questPower: number;
    artifactPower: number;
    homeworkMultiplier: number;
    completedHomeworkCount: number;
    totalHomeworkCount: number;
  };
}

/**
 * Calcula dinámicamente el Poder Académico del estudiante en base a:
 * 1. Subida de Nivel, XP acumulada y atributos RPG.
 * 2. Misiones de Alta Dificultad y exámenes completados pasados.
 * 3. Artefactos e ítems comprados/equipados desde su inventario.
 * 4. Multiplicador de tareas completadas para la misión actual.
 */
export function calculateAcademicPower(
  stats: StudentStats | null | undefined,
  questAttempts: QuestAttempt[] = [],
  ownedArtifactIds: string[] = [],
  shopArtifacts: ShopArtifact[] = [],
  activeMissionQuests: Quest[] = []
): AcademicPowerResult {
  // 1. Nivel, XP y Atributos RPG
  const level = stats?.level || 1;
  const xp = stats?.xp || 0;
  const levelPower = level * 25;
  const xpPower = Math.floor(xp / 50);
  
  const strength = stats?.attribute_strength ?? 10;
  const intelligence = stats?.attribute_intelligence ?? 10;
  const defense = stats?.attribute_defense ?? 10;
  const statPower = Math.round((strength + intelligence + defense) * 0.8);

  const basePower = 100 + levelPower + xpPower + statPower;

  // 2. Misiones y Exámenes de Alta Dificultad Completados
  const completedAttempts = questAttempts.filter(a => a.is_completed || a.score >= 60);
  const questPower = completedAttempts.reduce((acc, attempt) => {
    let pts = 15;
    // Si la misión o intento es de tipo examen o con puntuación sobresaliente (>= 90%), otorga bonus de alta dificultad
    const isExamQuest = attempt.quest_id.includes('exam') || attempt.quest_id.startsWith('exam-');
    if (isExamQuest || (attempt.score && attempt.score >= 90)) {
      pts += 35;
    }
    return acc + pts;
  }, 0);

  // 3. Artefactos e Ítems del Inventario
  const ownedArtifacts = shopArtifacts.filter(a => ownedArtifactIds.includes(a.id));
  const artifactPower = ownedArtifacts.reduce((acc, art) => {
    let pts = 20 + Math.floor((art.price || 0) / 5);
    if (art.effect === 'extra_attempt' || art.effect === 'bonus_dmg' || art.effect === 'shield') {
      pts += 15;
    }
    return acc + pts;
  }, 0);

  const totalBasePower = basePower + questPower + artifactPower;

  // 4. Factor de Preparación de Tareas de la Misión Activa
  const homeworkQuests = activeMissionQuests.filter(q => q.type !== 'exam');
  let homeworkMultiplier = 1.0;
  let completedHomeworkCount = 0;
  let totalHomeworkCount = homeworkQuests.length;

  if (totalHomeworkCount > 0) {
    completedHomeworkCount = homeworkQuests.filter(q => {
      const attempts = questAttempts.filter(a => a.quest_id === q.id);
      return attempts.some(a => a.is_completed || a.score >= 60);
    }).length;

    const ratio = completedHomeworkCount / totalHomeworkCount;
    // Multiplicador del 25% base hasta 100% al completar todas las tareas
    homeworkMultiplier = Number((0.25 + (0.75 * ratio)).toFixed(2));
  }

  const effectivePower = Math.round(totalBasePower * homeworkMultiplier);

  // Porcentaje visual en escala según el nivel esperado
  const targetPowerForLevel = 100 + (level * 50);
  const percentage = Math.min(100, Math.max(10, Math.round((effectivePower / targetPowerForLevel) * 100)));

  return {
    basePower,
    questPower,
    artifactPower,
    totalBasePower,
    homeworkMultiplier,
    effectivePower,
    percentage,
    breakdown: {
      levelPower,
      xpPower,
      statPower,
      questPower,
      artifactPower,
      homeworkMultiplier,
      completedHomeworkCount,
      totalHomeworkCount
    }
  };
}
