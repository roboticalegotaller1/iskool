/**
 * @file simulatorGamificationAdapter.ts
 * @description Adaptador modular (Bridge / Factory Pattern) para los 50 simuladores compatibles
 * y minijuegos del ecosistema ISkool.
 * Desacopla la lógica de simulación de la lógica de recompensas gamificadas de alumno y docente.
 */

import { ISimulatorCompletionEvent } from '@/types/teacherGamification';
import { useStudentStore } from '@/store/useStudentStore';
import { useTeacherGamificationStore } from '@/store/useTeacherGamificationStore';

export interface SimulatorDescriptor {
  id: string;
  name: string;
  category: 'physics' | 'math' | 'chemistry' | 'biology' | 'robotics' | 'humanities';
  xpBaseReward: number;
  coinsBaseReward: number;
  provider: string; // ej: 'PhET', 'GeoGebra', 'Desmos', 'Tinkercad', 'Wokwi'
  supportsRealtimeScore: boolean;
}

export class SimulatorGamificationAdapter {
  private static registry: Map<string, SimulatorDescriptor> = new Map();

  /**
   * Registra un simulador compatible (Permite registrar cualquiera de los 50 sin alterar la BD ni el Factory)
   */
  static registerSimulator(descriptor: SimulatorDescriptor) {
    this.registry.set(descriptor.id.toLowerCase(), descriptor);
  }

  /**
   * Obtiene la definición de un simulador o genera una por defecto si es dinámico
   */
  static getSimulator(simulatorId: string): SimulatorDescriptor {
    const key = simulatorId.toLowerCase();
    if (this.registry.has(key)) {
      return this.registry.get(key)!;
    }

    // Descriptor genérico compatible para cualquier simulador HTML5 embebido
    return {
      id: simulatorId,
      name: simulatorId.replace(/[-_]/g, ' ').toUpperCase(),
      category: 'physics',
      xpBaseReward: 100,
      coinsBaseReward: 20,
      provider: 'ISkool Laboratorio Web',
      supportsRealtimeScore: true
    };
  }

  /**
   * Procesa la finalización de cualquier actividad o simulador de forma unificada:
   * 1. Acredita XP y Monedas al Estudiante.
   * 2. Alimenta el Teacher Social Loop del Docente titular.
   */
  static async handleCompletion(event: ISimulatorCompletionEvent): Promise<{
    studentEarned: { xp: number; coins: number };
    teacherEarned: { xp: number; karma: number };
    isLevelUp: boolean;
  }> {
    const descriptor = this.getSimulator(event.simulatorId);

    // 1. Cálculo ponderado de recompensa para el alumno según su puntaje
    const performanceFactor = Math.max(0.2, event.score / 100);
    const studentXp = Math.round(descriptor.xpBaseReward * performanceFactor);
    const studentCoins = Math.round(descriptor.coinsBaseReward * performanceFactor);

    let isLevelUp = false;

    // Acreditación directa en el almacén del estudiante (RLS compliant)
    try {
      if (event.studentId) {
        useStudentStore.getState().addXpAndCoins(
          event.studentId,
          studentXp,
          studentCoins,
          (leveledUp) => {
            isLevelUp = leveledUp;
          }
        );
      }
    } catch (err) {
      console.warn('Advertencia actualizando progreso del estudiante:', err);
    }

    // 2. Acreditación automática al Teacher Social Loop
    try {
      if (event.teacherId) {
        await useTeacherGamificationStore.getState().processStudentSimulatorResult(event);
      }
    } catch (err) {
      console.warn('Advertencia alimentando Teacher Social Loop:', err);
    }

    return {
      studentEarned: { xp: studentXp, coins: studentCoins },
      teacherEarned: { xp: 5, karma: 2 },
      isLevelUp
    };
  }
}

// ============================================================================
// REGISTRO INICIAL DE SIMULADORES CLAVE DE LA GUÍA OFICIAL (50 SIMULADORES)
// ============================================================================

// 1. Física y Circuitos
SimulatorGamificationAdapter.registerSimulator({
  id: 'phet-forces-motion',
  name: 'PhET Fuerzas y Movimiento',
  category: 'physics',
  xpBaseReward: 120,
  coinsBaseReward: 25,
  provider: 'PhET Interactive Simulations (Univ. of Colorado)',
  supportsRealtimeScore: true
});

SimulatorGamificationAdapter.registerSimulator({
  id: 'falstad-circuit',
  name: 'Falstad Circuit Simulator',
  category: 'physics',
  xpBaseReward: 150,
  coinsBaseReward: 30,
  provider: 'Falstad',
  supportsRealtimeScore: true
});

// 2. Matemáticas y Geometría
SimulatorGamificationAdapter.registerSimulator({
  id: 'geogebra-calc',
  name: 'GeoGebra Clásico & 3D',
  category: 'math',
  xpBaseReward: 100,
  coinsBaseReward: 20,
  provider: 'GeoGebra',
  supportsRealtimeScore: true
});

SimulatorGamificationAdapter.registerSimulator({
  id: 'desmos-graphing',
  name: 'Desmos Calculadora Gráfica',
  category: 'math',
  xpBaseReward: 100,
  coinsBaseReward: 20,
  provider: 'Desmos',
  supportsRealtimeScore: true
});

// 3. Química y Estructuras
SimulatorGamificationAdapter.registerSimulator({
  id: 'molview-3d',
  name: 'MolView Modelador Molecular 3D',
  category: 'chemistry',
  xpBaseReward: 130,
  coinsBaseReward: 25,
  provider: 'MolView',
  supportsRealtimeScore: true
});

// 4. Robótica y Programación
SimulatorGamificationAdapter.registerSimulator({
  id: 'wokwi-esp32',
  name: 'Wokwi Simulador ESP32 & Arduino',
  category: 'robotics',
  xpBaseReward: 160,
  coinsBaseReward: 35,
  provider: 'Wokwi',
  supportsRealtimeScore: true
});

SimulatorGamificationAdapter.registerSimulator({
  id: 'tinkercad-circuits',
  name: 'Autodesk Tinkercad Circuits',
  category: 'robotics',
  xpBaseReward: 140,
  coinsBaseReward: 30,
  provider: 'Autodesk Tinkercad',
  supportsRealtimeScore: true
});
