import { PetEvolutionStage } from '@/types';

/**
 * Proporción matemática estricta de tamaño de la mascota respecto al avatar:
 * - Huevo: 1/5 del tamaño del avatar (20%)
 * - Bebé: 1/4 del tamaño del avatar (25%)
 * - Niño: 1/2 del tamaño del avatar (50%)
 * - Adolescente: 2/3 del tamaño del avatar (~66.7%)
 * - Adulto / Místico: 1:1 mismo tamaño que el avatar (100%)
 */
export const getPetToAvatarScaleRatio = (stage: PetEvolutionStage | string = 'egg'): number => {
  switch (stage) {
    case 'egg':
      return 1 / 5; // 0.20 (1/5)
    case 'baby':
      return 1 / 4; // 0.25 (1/4)
    case 'child':
      return 1 / 2; // 0.50 (1/2)
    case 'teen':
      return 2 / 3; // 0.6667 (2/3)
    case 'adult':
    case 'mystic':
    default:
      return 1.0; // 1:1
  }
};

export const getPetScaleRatioDescription = (stage: PetEvolutionStage | string = 'egg'): string => {
  switch (stage) {
    case 'egg':
      return '1/5 del Avatar (Huevo)';
    case 'baby':
      return '1/4 del Avatar (Bebé)';
    case 'child':
      return '1/2 del Avatar (Niño)';
    case 'teen':
      return '2/3 del Avatar (Adolescente)';
    case 'adult':
    case 'mystic':
    default:
      return '1:1 con Avatar (Adulto)';
  }
};
