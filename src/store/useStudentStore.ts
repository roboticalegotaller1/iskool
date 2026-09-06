import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import { StudentStats, StudentAvatar, StudentMessage, UserProfile, Quest } from '../types';
import { STATS_MAP_SEED, AVATAR_MAP_SEED, STUDENT_INVENTORY_SEED, STUDENT_MESSAGES_SEED, STUDENTS_LIST_SEED } from './seeds';
import { supabase } from '@/lib/supabaseClient';
import { calculateAcademicPower, AcademicPowerResult } from '@/utils/academicPower';
import { useGamificationStore } from './useGamificationStore';
import { useSchoolAdminStore } from './useSchoolAdminStore';
import { getStudentAcademicLevelInfo, StudentAcademicLevelInfo } from '@/lib/academicLevels';

let statsChannel: any = null;

interface StudentStoreState {
  activeStudentId: string;
  allStats: Record<string, StudentStats>;
  allAvatars: Record<string, StudentAvatar>;
  studentInventoryMap: Record<string, string[]>;
  studentMessages: StudentMessage[];
  isLoadingStats: boolean;
  activeQuest: Quest | null;
  isQuestModalOpen: boolean;
  
  // Actions
  openQuestModal: (quest: Quest) => void;
  closeQuestModal: () => void;
  switchStudent: (studentId: string) => Promise<void>;
  changeAvatar: (config: Partial<StudentAvatar>) => Promise<void>;
  unlockBranchCosmetic: (cosmeticId: string) => Promise<void>;
  feedPet: (studentId?: string) => Promise<void>;
  playWithPet: (studentId?: string) => Promise<void>;
  feedPetRpg: () => Promise<void>;
  trainPetRpg: () => Promise<void>;
  levelUpAttribute: (statName: 'strength' | 'intelligence' | 'defense') => Promise<void>;
  purchaseArtifact: (studentId: string, artifactId: string) => Promise<void>;
  grantArtifact: (studentId: string, artifactId: string) => Promise<void>;
  revokeArtifact: (studentId: string, artifactId: string, reason: string) => Promise<void>;
  markStudentMessageAsRead: (messageId: string) => void;
  fetchStats: (groupId?: string) => Promise<void>;
  subscribeToStudentStats: (studentId: string) => void;
  unsubscribeFromStudentStats: () => void;
  
  // Cross-store helpers
  addXpAndCoins: (studentId: string, xpEarned: number, coinsEarned: number, levelUpCallback?: (leveledUp: boolean) => void) => Promise<void>;
  updateStatsAfterExam: (
    studentId: string, 
    xpEarned: number, 
    coinsEarned: number, 
    statBoost?: { strength?: number; intelligence?: number; defense?: number },
    customLoot?: string
  ) => Promise<void>;
  initializeNewStudent: (studentId: string, firstName: string) => void;
  resetStudentStore: () => void;
}

export const useStudentStore = create<StudentStoreState>()(
  persist(
    (set, get) => ({
  activeStudentId: 'std-pa',
  allStats: STATS_MAP_SEED,
  allAvatars: AVATAR_MAP_SEED,
  studentInventoryMap: STUDENT_INVENTORY_SEED,
  studentMessages: STUDENT_MESSAGES_SEED,
  isLoadingStats: false,
  activeQuest: null,
  isQuestModalOpen: false,

  openQuestModal: (quest) => set({ activeQuest: quest, isQuestModalOpen: true }),
  closeQuestModal: () => set({ activeQuest: null, isQuestModalOpen: false }),

  switchStudent: async (studentId) => {
    set({ activeStudentId: studentId });
    const student = STUDENTS_LIST_SEED.find(s => s.id === studentId);
    const email = student?.email;
    if (email) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password: 'ISkoolPassword2026!' });
        if (error && (error.message?.includes('JWT') || error.message?.includes('future'))) {
          await supabase.auth.signOut().catch(() => {});
        }
      } catch (authErr) {
        console.warn('Silent auth fallback for switchStudent:', authErr);
      }

      // Fetch stats to sync for this specific student
      try {
        const dbStudentId = mapStudentIdToUuid(studentId);
        if (isUuid(dbStudentId)) {
          const { data: dbStat } = await supabase
            .from('student_stats')
            .select('*')
            .eq('student_id', dbStudentId)
            .maybeSingle();
          if (dbStat) {
            set((state) => ({
              allStats: {
                ...state.allStats,
                [studentId]: dbStat
              }
            }));
          }
        }
      } catch (statErr) {
        console.warn("Could not sync stats from Supabase:", statErr);
      }

      // Fetch avatar to sync for this specific student
      try {
        const dbStudentId = mapStudentIdToUuid(studentId);
        if (isUuid(dbStudentId)) {
          const { data: dbAv } = await supabase
            .from('student_avatars')
            .select('*')
            .eq('student_id', dbStudentId)
            .maybeSingle();
          if (dbAv) {
            const normalizedId = normalizeStudentId(dbAv.student_id || studentId);
            set((state) => ({
              allAvatars: {
                ...state.allAvatars,
                [studentId]: dbAv,
                [normalizedId]: dbAv
              }
            }));
          }
        }
      } catch (err) {
        console.warn('Could not sync avatar from Supabase:', err);
      }
    }
  },

  changeAvatar: async (config) => {
    const rawId = get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    
    try {
      const dbStudentId = mapStudentIdToUuid(activeId);
      const { error } = await supabase
        .from('student_avatars')
        .update(config)
        .eq('student_id', dbStudentId);
        
      if (error) {
        console.error('Error updating avatar in Supabase:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error updating avatar in Supabase:', err);
    }

    set((state) => {
      const currentAv = state.allAvatars[activeId] || state.allAvatars[rawId] || {};
      const updatedAv = {
        ...currentAv,
        ...config,
        updated_at: new Date().toISOString(),
      };
      return {
        allAvatars: {
          ...state.allAvatars,
          [activeId]: updatedAv,
          [rawId]: updatedAv,
        },
      };
    });
  },

  unlockBranchCosmetic: async (cosmeticId) => {
    const rawId = get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    
    const currentAv = get().allAvatars[activeId] || get().allAvatars[rawId];
    if (!currentAv) return;
    
    const currentUnlocked = currentAv.unlocked_items || [];
    if (currentUnlocked.includes(cosmeticId)) return;
    
    const updatedUnlocked = [...currentUnlocked, cosmeticId];
    
    try {
      const dbStudentId = mapStudentIdToUuid(activeId);
      const { error } = await supabase
        .from('student_avatars')
        .update({ unlocked_items: updatedUnlocked })
        .eq('student_id', dbStudentId);
        
      if (error) {
        console.error('Error unlocking cosmetic in Supabase:', error.message);
      }
    } catch (err) {
      console.error('Unexpected error unlocking cosmetic:', err);
    }
    
    set((state) => {
      const avatarToUpdate = state.allAvatars[activeId] || state.allAvatars[rawId] || {};
      const updatedAv = {
        ...avatarToUpdate,
        unlocked_items: updatedUnlocked,
        updated_at: new Date().toISOString(),
      };
      return {
        allAvatars: {
          ...state.allAvatars,
          [activeId]: updatedAv,
          [rawId]: updatedAv,
        },
      };
    });
  },

  feedPet: async (studentId?: string) => {
    const rawId = studentId || get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    const dbStudentId = mapStudentIdToUuid(activeId);
    const { allStats, allAvatars } = get();
    const stats = allStats[activeId] || allStats[rawId];
    if (!stats || (stats.coins || 0) < 5) {
      alert('¡No tienes suficientes monedas! Resuelve retos para ganar monedas.');
      return;
    }

    const currentAv = allAvatars[activeId] || allAvatars[rawId] || {};
    const newHunger = Math.max(0, (currentAv.pet_hunger || 50) - 20);
    const newHappiness = Math.min(100, (currentAv.pet_happiness || 50) + 5);

    try {
      if (isUuid(dbStudentId)) {
        await supabase.rpc('process_reward', {
          p_student_id: dbStudentId,
          p_coins_change: -5,
          p_xp_change: 10,
          p_happiness_change: 5
        });

        await supabase.from('student_avatars').update({
          pet_hunger: newHunger,
          pet_happiness: newHappiness,
          updated_at: new Date().toISOString()
        }).eq('student_id', dbStudentId);
      }
    } catch (e) {
      console.warn('Error en sincronización de feedPet con Supabase:', e);
    }

    const updatedStats = {
      ...stats,
      coins: Math.max(0, (stats.coins || 0) - 5),
      xp: (stats.xp || 0) + 10,
    };

    const updatedAv = {
      ...currentAv,
      pet_hunger: newHunger,
      pet_happiness: newHappiness,
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      allStats: {
        ...state.allStats,
        [activeId]: updatedStats,
        [rawId]: updatedStats,
      },
      allAvatars: {
        ...state.allAvatars,
        [activeId]: updatedAv,
        [rawId]: updatedAv,
      },
    }));
  },

  playWithPet: async (studentId?: string) => {
    const rawId = studentId || get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    const dbStudentId = mapStudentIdToUuid(activeId);
    const { allStats, allAvatars } = get();
    const stats = allStats[activeId] || allStats[rawId];
    if (!stats || (stats.coins || 0) < 2) {
      alert('¡No tienes suficientes monedas!');
      return;
    }

    const currentAv = allAvatars[activeId] || allAvatars[rawId] || {};
    const newHunger = Math.min(100, (currentAv.pet_hunger || 50) + 10);
    const newHappiness = Math.min(100, (currentAv.pet_happiness || 50) + 20);

    try {
      if (isUuid(dbStudentId)) {
        await supabase.rpc('process_reward', {
          p_student_id: dbStudentId,
          p_coins_change: -2,
          p_xp_change: 5,
          p_happiness_change: 20
        });

        await supabase.from('student_avatars').update({
          pet_hunger: newHunger,
          pet_happiness: newHappiness,
          updated_at: new Date().toISOString()
        }).eq('student_id', dbStudentId);
      }
    } catch (e) {
      console.warn('Error en sincronización de playWithPet con Supabase:', e);
    }

    const updatedStats = {
      ...stats,
      coins: Math.max(0, (stats.coins || 0) - 2),
      xp: (stats.xp || 0) + 5,
    };

    const updatedAv = {
      ...currentAv,
      pet_hunger: newHunger,
      pet_happiness: newHappiness,
      updated_at: new Date().toISOString(),
    };

    set((state) => ({
      allStats: {
        ...state.allStats,
        [activeId]: updatedStats,
        [rawId]: updatedStats,
      },
      allAvatars: {
        ...state.allAvatars,
        [activeId]: updatedAv,
        [rawId]: updatedAv,
      },
    }));
  },

  feedPetRpg: async () => {
    const rawId = get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    const currentStats = get().allStats[activeId] || get().allStats[rawId];
    if (!currentStats) return;

    if (currentStats.coins < 50) {
      alert('¡No tienes suficientes monedas! Alimentar a tu mascota cuesta 50 Coins.');
      return;
    }

    try {
      const dbStudentId = mapStudentIdToUuid(activeId);
      const { data, error } = await supabase.rpc('process_reward', {
        p_student_id: dbStudentId,
        p_coins_change: -50,
        p_happiness_change: 20
      });

      if (error) {
        console.error('Error updating pet happiness in Supabase:', error.message);
        alert('Error al alimentar a tu mascota: ' + error.message);
        return;
      }

      if (data) {
        const updatedStats = data as StudentStats;
        set((state) => ({
          allStats: {
            ...state.allStats,
            [activeId]: {
              ...state.allStats[activeId],
              ...updatedStats,
              student_id: activeId
            },
            [rawId]: {
              ...state.allStats[rawId],
              ...updatedStats,
              student_id: rawId
            }
          }
        }));
      }
    } catch (err) {
      console.error('Unexpected error updating pet happiness:', err);
    }
  },

  trainPetRpg: async () => {
    const rawId = get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    const currentStats = get().allStats[activeId] || get().allStats[rawId];
    if (!currentStats) return;

    const currentEnergy = currentStats.pet_energy ?? 100;
    if (currentEnergy < 25) {
      alert('¡Tu mascota no tiene suficiente energía! Espera a que descanse o resuelve retos para recargarla.');
      return;
    }

    try {
      const dbStudentId = mapStudentIdToUuid(activeId);
      const { data, error } = await supabase.rpc('process_reward', {
        p_student_id: dbStudentId,
        p_energy_change: -25,
        p_xp_change: 40
      });

      if (error) {
        console.error('Error updating pet training in Supabase:', error.message);
        alert('Error al entrenar a tu mascota: ' + error.message);
        return;
      }

      if (data) {
        const updatedStats = data as StudentStats;
        set((state) => ({
          allStats: {
            ...state.allStats,
            [activeId]: {
              ...state.allStats[activeId],
              ...updatedStats,
              student_id: activeId
            },
            [rawId]: {
              ...state.allStats[rawId],
              ...updatedStats,
              student_id: rawId
            }
          }
        }));
      }
    } catch (err) {
      console.error('Unexpected error updating pet training:', err);
    }
  },

  levelUpAttribute: async (statName) => {
    const rawId = get().activeStudentId;
    const activeId = normalizeStudentId(rawId);
    const dbStudentId = mapStudentIdToUuid(activeId);
    
    // 1. Intento via RPC
    try {
      const response = await supabase.rpc('level_up_attribute', {
        p_student_id: dbStudentId,
        p_attribute_name: statName
      });
      if (!response.error && response.data && response.data.success) {
        const newStatsData = response.data.new_stats;
        set((state) => {
          const currentStats = state.allStats[activeId] || state.allStats[rawId] || {};
          const updatedStats = {
            ...currentStats,
            ...newStatsData
          };
          return {
            allStats: {
              ...state.allStats,
              [activeId]: updatedStats,
              [rawId]: updatedStats
            }
          };
        });
        return;
      }
    } catch (err) {
      console.warn('RPC level_up_attribute falló, realizando actualización directa:', err);
    }

    // 2. Fallback de actualización directa en Supabase
    const currentStats = get().allStats[activeId] || get().allStats[rawId];
    if (!currentStats) return;

    const availableSkillPoints = currentStats.skill_points || 0;
    if (availableSkillPoints <= 0) {
      alert('¡No tienes puntos de habilidad disponibles!');
      return;
    }

    const newSkillPoints = availableSkillPoints - 1;
    const newStrength = (currentStats.attribute_strength ?? 10) + (statName === 'strength' ? 1 : 0);
    const newIntelligence = (currentStats.attribute_intelligence ?? 10) + (statName === 'intelligence' ? 1 : 0);
    const newDefense = (currentStats.attribute_defense ?? 10) + (statName === 'defense' ? 1 : 0);

    try {
      const { error } = await supabase
        .from('student_stats')
        .update({
          skill_points: newSkillPoints,
          attribute_strength: newStrength,
          attribute_intelligence: newIntelligence,
          attribute_defense: newDefense,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', dbStudentId);

      if (error) {
        console.error('Error al actualizar atributos en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error inesperado al actualizar atributos:', err);
    }

    set((state) => {
      const current = state.allStats[activeId] || state.allStats[rawId] || {};
      const updated = {
        ...current,
        skill_points: newSkillPoints,
        attribute_strength: newStrength,
        attribute_intelligence: newIntelligence,
        attribute_defense: newDefense,
        updated_at: new Date().toISOString()
      };
      return {
        allStats: {
          ...state.allStats,
          [activeId]: updated,
          [rawId]: updated
        }
      };
    });
  },

  purchaseArtifact: async (studentId, artifactId) => {
    const normId = normalizeStudentId(studentId);
    const dbStudentId = mapStudentIdToUuid(normId);

    try {
      if (isUuid(dbStudentId)) {
        const response = await supabase.rpc('purchase_artifact', {
          p_student_id: dbStudentId,
          p_artifact_id: artifactId
        });

        if (!response.error && response.data && response.data.success) {
          const newCoins = response.data.new_coins;
          const newInventory = response.data.inventory || [];
          const newMessage = response.data.new_message;

          set((state) => {
            const currentStats = state.allStats[normId] || state.allStats[studentId] || {};
            const updatedStats = { ...currentStats, coins: newCoins };
            return {
              allStats: {
                ...state.allStats,
                [studentId]: updatedStats,
                [normId]: updatedStats
              },
              studentInventoryMap: {
                ...state.studentInventoryMap,
                [studentId]: newInventory,
                [normId]: newInventory
              },
              studentMessages: newMessage ? [newMessage, ...state.studentMessages] : state.studentMessages
            };
          });
          alert('¡Compraste el artefacto con éxito!');
          return;
        }
      }
    } catch (err: any) {
      console.warn('RPC purchase_artifact no disponible o falló. Ejecutando lógica de respaldo:', err);
    }

    // Fallback de compra directa
    const { allStats, studentInventoryMap } = get();
    const currentStats = allStats[normId] || allStats[studentId];
    if (!currentStats) return;

    // Verificar precio y saldo
    const price = 50; // Costo estándar si no hay datos de tienda
    if ((currentStats.coins || 0) < price) {
      alert(`¡No tienes suficientes monedas! Se requieren ${price} monedas.`);
      return;
    }

    const currentInventory = studentInventoryMap[normId] || studentInventoryMap[studentId] || [];
    if (currentInventory.includes(artifactId)) {
      alert('¡Ya posees este artefacto en tu inventario!');
      return;
    }

    const updatedCoins = currentStats.coins - price;
    const updatedInventory = [...currentInventory, artifactId];

    if (isUuid(dbStudentId)) {
      try {
        await supabase
          .from('student_stats')
          .update({ coins: updatedCoins, updated_at: new Date().toISOString() })
          .eq('student_id', dbStudentId);

        await supabase
          .from('student_inventory')
          .insert({ student_id: dbStudentId, artifact_id: artifactId, acquired_at: new Date().toISOString() });
      } catch (e) {
        console.error('Error en fallback de compra de artefacto:', e);
      }
    }

    set((state) => {
      const updatedStats = { ...currentStats, coins: updatedCoins };
      return {
        allStats: {
          ...state.allStats,
          [studentId]: updatedStats,
          [normId]: updatedStats
        },
        studentInventoryMap: {
          ...state.studentInventoryMap,
          [studentId]: updatedInventory,
          [normId]: updatedInventory
        }
      };
    });
    alert('¡Compraste el artefacto con éxito!');
  },

  grantArtifact: async (studentId, artifactId) => {
    const normId = normalizeStudentId(studentId);
    const dbStudentId = mapStudentIdToUuid(normId);

    try {
      if (isUuid(dbStudentId)) {
        const response = await supabase.rpc('grant_artifact', {
          p_student_id: dbStudentId,
          p_artifact_id: artifactId
        });

        if (!response.error && response.data && response.data.success) {
          const newInventory = response.data.inventory || response.data.new_inventory || [];
          const newMessage = response.data.new_message;

          set((state) => ({
            studentInventoryMap: {
              ...state.studentInventoryMap,
              [studentId]: newInventory,
              [normId]: newInventory
            },
            studentMessages: newMessage ? [newMessage, ...state.studentMessages] : state.studentMessages
          }));
          alert('Artefacto otorgado con éxito.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('RPC grant_artifact falló o no existe. Ejecutando actualización directa:', err);
    }

    // Fallback de asignación directa
    const currentInventory = get().studentInventoryMap[normId] || get().studentInventoryMap[studentId] || [];
    const updatedInventory = Array.from(new Set([...currentInventory, artifactId]));

    if (isUuid(dbStudentId)) {
      try {
        await supabase
          .from('student_inventory')
          .insert({ student_id: dbStudentId, artifact_id: artifactId, acquired_at: new Date().toISOString() });
      } catch (e) {
        console.error('Error insertando artefacto en Supabase:', e);
      }
    }

    set((state) => ({
      studentInventoryMap: {
        ...state.studentInventoryMap,
        [studentId]: updatedInventory,
        [normId]: updatedInventory
      }
    }));
    alert('Artefacto otorgado con éxito.');
  },

  revokeArtifact: async (studentId, artifactId, reason) => {
    const normId = normalizeStudentId(studentId);
    const dbStudentId = mapStudentIdToUuid(normId);

    try {
      if (isUuid(dbStudentId)) {
        const response = await supabase.rpc('revoke_artifact', {
          p_student_id: dbStudentId,
          p_artifact_id: artifactId,
          p_reason: reason
        });

        if (!response.error && response.data && response.data.success) {
          const newInventory = response.data.inventory || response.data.new_inventory || [];
          const newMessage = response.data.new_message;

          set((state) => ({
            studentInventoryMap: {
              ...state.studentInventoryMap,
              [studentId]: newInventory,
              [normId]: newInventory
            },
            studentMessages: newMessage ? [newMessage, ...state.studentMessages] : state.studentMessages
          }));
          alert('Artefacto retirado e informe enviado al alumno.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('RPC revoke_artifact falló o no existe. Ejecutando retiro directo:', err);
    }

    // Fallback de retiro directo
    const currentInventory = get().studentInventoryMap[normId] || get().studentInventoryMap[studentId] || [];
    const updatedInventory = currentInventory.filter(id => id !== artifactId);

    if (isUuid(dbStudentId)) {
      try {
        await supabase
          .from('student_inventory')
          .delete()
          .eq('student_id', dbStudentId)
          .eq('artifact_id', artifactId);
      } catch (e) {
        console.error('Error borrando artefacto de Supabase:', e);
      }
    }

    set((state) => ({
      studentInventoryMap: {
        ...state.studentInventoryMap,
        [studentId]: updatedInventory,
        [normId]: updatedInventory
      }
    }));
    alert('Artefacto retirado e informe enviado al alumno.');
  },

  markStudentMessageAsRead: (messageId) => {
    set((state) => ({
      studentMessages: state.studentMessages.map((msg) =>
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ),
    }));
  },

  addXpAndCoins: async (studentId, xpEarned, coinsEarned, levelUpCallback) => {
    const activeId = normalizeStudentId(studentId);
    const dbStudentId = mapStudentIdToUuid(activeId);
    const { allStats } = get();
    const studentStats = allStats[activeId] || allStats[studentId];
    if (!studentStats) return;

    let currentXP = (studentStats.xp || 0) + xpEarned;
    let currentCoins = (studentStats.coins || 0) + coinsEarned;
    let level = studentStats.level || 1;
    let leveledUp = false;
    let skillPoints = studentStats.skill_points ?? 0;

    // Bucle para acumulación de niveles y asignación de +2 skill_points por cada nivel ganado a TODOS los estudiantes
    let xpRequiredForNextLevel = level * 200;
    while (currentXP >= xpRequiredForNextLevel) {
      currentXP -= xpRequiredForNextLevel;
      level += 1;
      skillPoints += 2;
      leveledUp = true;
      xpRequiredForNextLevel = level * 200;
    }

    let newStreak = studentStats.current_streak || 0;
    const todayStr = new Date().toISOString().split('T')[0];
    if (studentStats.last_active_date !== todayStr) {
      newStreak = (studentStats.current_streak || 0) + 1;
    }

    const updatedStatsPayload = {
      xp: currentXP,
      level: level,
      coins: currentCoins,
      current_streak: newStreak,
      max_streak: Math.max(newStreak, studentStats.max_streak || 0),
      last_active_date: todayStr,
      skill_points: skillPoints,
      pet_energy: Math.min(100, (studentStats.pet_energy ?? 100) + 15),
      updated_at: new Date().toISOString()
    };

    // 1. Envío asíncrono a Supabase primero
    try {
      const { error } = await supabase
        .from('student_stats')
        .update(updatedStatsPayload)
        .eq('student_id', dbStudentId);

      if (error) {
        console.error('Error al actualizar estadísticas en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error inesperado al enviar estadísticas a Supabase:', err);
    }

    // 2. Actualizar estado local en Zustand
    set((state) => {
      const current = state.allStats[activeId] || state.allStats[studentId] || {};
      const newStats = {
        ...current,
        ...updatedStatsPayload
      };
      return {
        allStats: {
          ...state.allStats,
          [activeId]: newStats,
          [studentId]: newStats
        }
      };
    });

    if (levelUpCallback) {
      levelUpCallback(leveledUp);
    }
  },

  updateStatsAfterExam: async (studentId, xpEarned, coinsEarned, statBoost, customLoot) => {
    const activeId = normalizeStudentId(studentId);
    const dbStudentId = mapStudentIdToUuid(activeId);
    const { allStats } = get();
    const studentStats = allStats[activeId] || allStats[studentId];
    if (!studentStats) return;

    let currentXP = (studentStats.xp || 0) + xpEarned;
    let currentCoins = (studentStats.coins || 0) + coinsEarned;
    let level = studentStats.level || 1;
    let skillPoints = studentStats.skill_points ?? 0;

    let xpRequiredForNextLevel = level * 200;
    while (currentXP >= xpRequiredForNextLevel) {
      currentXP -= xpRequiredForNextLevel;
      level += 1;
      skillPoints += 2;
      xpRequiredForNextLevel = level * 200;
    }

    let finalStrength = studentStats.attribute_strength ?? 10;
    let finalIntelligence = studentStats.attribute_intelligence ?? 10;
    let finalDefense = studentStats.attribute_defense ?? 10;

    if (statBoost) {
      if (statBoost.strength) finalStrength += statBoost.strength;
      if (statBoost.intelligence) finalIntelligence += statBoost.intelligence;
      if (statBoost.defense) finalDefense += statBoost.defense;
    }

    const updatedStatsPayload = {
      xp: currentXP,
      level: level,
      coins: currentCoins,
      skill_points: skillPoints,
      attribute_strength: finalStrength,
      attribute_intelligence: finalIntelligence,
      attribute_defense: finalDefense,
      pet_energy: Math.min(100, (studentStats.pet_energy ?? 100) + 15),
      updated_at: new Date().toISOString(),
    };

    // 1. Envío asíncrono a Supabase primero
    try {
      const { error } = await supabase
        .from('student_stats')
        .update(updatedStatsPayload)
        .eq('student_id', dbStudentId);

      if (error) {
        console.error('Error al actualizar estadísticas del examen en Supabase:', error.message);
      }
    } catch (err) {
      console.error('Error inesperado al enviar estadísticas del examen a Supabase:', err);
    }

    // 2. Actualizar estado local en Zustand
    set((state) => {
      const current = state.allStats[activeId] || state.allStats[studentId] || {};
      const newStats = {
        ...current,
        ...updatedStatsPayload
      };
      return {
        allStats: {
          ...state.allStats,
          [activeId]: newStats,
          [studentId]: newStats
        }
      };
    });

    if (customLoot) {
      const currentAvatar = get().allAvatars[activeId] || get().allAvatars[studentId];
      if (currentAvatar) {
        const currentUnlocked = currentAvatar.unlocked_items || [];
        const nextUnlocked = currentUnlocked.includes(customLoot) ? currentUnlocked : [...currentUnlocked, customLoot];
        
        try {
          await supabase
            .from('student_avatars')
            .update({ unlocked_items: nextUnlocked })
            .eq('student_id', dbStudentId);
        } catch (err) {
          console.error('Error al desbloquear recompensa del examen en Supabase:', err);
        }

        set((state) => {
          const avatarToUpdate = state.allAvatars[activeId] || state.allAvatars[studentId] || {};
          const updatedAv = {
            ...avatarToUpdate,
            unlocked_items: nextUnlocked,
            pet_hunger: 100,
            pet_happiness: 100,
            updated_at: new Date().toISOString(),
          };
          return {
            allAvatars: {
              ...state.allAvatars,
              [activeId]: updatedAv,
              [studentId]: updatedAv,
            },
          };
        });
      }
    }
  },

  initializeNewStudent: (studentId, firstName) => {
    set((state) => ({
      allStats: {
        ...state.allStats,
        [studentId]: {
          student_id: studentId,
          xp: 0,
          level: 1,
          coins: 0,
          current_streak: 1,
          max_streak: 1,
          updated_at: new Date().toISOString(),
        },
      },
      allAvatars: {
        ...state.allAvatars,
        [studentId]: {
          student_id: studentId,
          avatar_name: firstName,
          hair_style: 'classic',
          hair_color: '#4B5563',
          eyes_style: 'happy',
          outfit_style: 'explorer',
          outfit_color: '#3B82F6',
          background_style: 'forest',
          unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
          updated_at: new Date().toISOString(),
        },
      },
    }));
  },

  fetchStats: async (groupId?: string) => {
    set({ isLoadingStats: true });
    try {
      // The student_stats table does not have a group_id column.
      // We load all stats and filter/match them locally to avoid DB errors.
      const query = supabase.from('student_stats').select('*');
      const response = await query;
      
      if (response.error) {
        if (response.error.message?.includes('JWT') || response.error.message?.includes('future')) {
          console.warn('Clock skew or JWT issue detected in fetchStats, resetting invalid token:', response.error.message);
          supabase.auth.signOut().catch(() => {});
        }
        throw new Error(response.error.message);
      }
      
      const statsList = response.data || [];
      const statsMap = { ...get().allStats };
      statsList.forEach((stat: StudentStats) => {
        const normalizedId = normalizeStudentId(stat.student_id);
        statsMap[normalizedId] = {
          ...stat,
          student_id: normalizedId
        };
      });
      set({ allStats: statsMap });
    } catch (err: any) {
      console.warn('Utilizando estadísticas locales cacheadas (Aviso Supabase):', err.message);
    } finally {
      set({ isLoadingStats: false });
    }
  },

  subscribeToStudentStats: (studentId) => {
    if (statsChannel) return;

    const dbStudentId = mapStudentIdToUuid(studentId);
    
    statsChannel = supabase
      .channel('custom-stats-channel')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'student_stats', 
        filter: `student_id=eq.${dbStudentId}` 
      }, (payload) => {
        console.log("Realtime stats update received:", payload);
        
        const updatedStats = payload.new as StudentStats;
        const normalizedId = normalizeStudentId(updatedStats.student_id);
        
        set((state) => ({
          allStats: {
            ...state.allStats,
            [studentId]: {
              ...updatedStats,
              student_id: studentId
            },
            [normalizedId]: {
              ...updatedStats,
              student_id: normalizedId
            }
          }
        }));
      })
      .subscribe();
  },

  unsubscribeFromStudentStats: () => {
    if (statsChannel) {
      supabase.removeChannel(statsChannel);
      statsChannel = null;
    }
  },



  resetStudentStore: () => {
    set({
      activeStudentId: 'std-pa',
      allStats: STATS_MAP_SEED,
      allAvatars: AVATAR_MAP_SEED,
      studentInventoryMap: STUDENT_INVENTORY_SEED,
      studentMessages: STUDENT_MESSAGES_SEED,
      isLoadingStats: false,
    });
  },
}),
    {
      name: 'iskool_student_store',
      partialize: (state) => ({
        activeStudentId: state.activeStudentId,
        allStats: state.allStats,
        allAvatars: state.allAvatars,
        studentInventoryMap: state.studentInventoryMap,
        studentMessages: state.studentMessages,
      })
    }
  )
);

export const isUuid = (str?: string): boolean => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const mapStudentIdToUuid = (id: string): string => {
  if (isUuid(id)) return id;
  if (id === 'std-pa') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11';
  if (id === 'std-sec') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22';
  if (id === 'std-pb') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33';
  if (id === 'std-prep') return 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44';
  return id;
};

export const normalizeStudentId = (id: string): string => {
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a11') return 'std-pa';
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a22') return 'std-sec';
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a33') return 'std-pb';
  if (id === 'c00a0eeb-9c0b-4ef8-bb6d-6bb9bd380a44') return 'std-prep';
  return id;
};

// Selectores React
export const useCurrentStudentStats = () => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const stats = useStudentStore(state => state.allStats[normalizeStudentId(activeStudentId)] || state.allStats[activeStudentId]);
  
  return useMemo(() => {
    const active = stats || STATS_MAP_SEED[activeStudentId] || STATS_MAP_SEED[normalizeStudentId(activeStudentId)];
    if (active) {
      let petStage = active.pet_stage || 'egg';
      const lvl = active.level || 1;
      if (lvl >= 8) petStage = 'mystic';
      else if (lvl >= 5) petStage = 'adult';
      else if (lvl >= 3) petStage = 'baby';

      return {
        ...active,
        pet_stage: petStage,
        pet_energy: active.pet_energy ?? 100,
        pet_happiness: active.pet_happiness ?? 50
      };
    }
    return {
      student_id: activeStudentId,
      xp: 0,
      level: 1,
      coins: 0,
      current_streak: 1,
      max_streak: 1,
      pet_stage: 'egg' as const,
      pet_energy: 100,
      pet_happiness: 50,
      updated_at: ''
    };
  }, [stats, activeStudentId]);
};

export const useCurrentStudentAvatar = () => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const avatar = useStudentStore(state => state.allAvatars[normalizeStudentId(activeStudentId)] || state.allAvatars[activeStudentId]);
  
  return useMemo(() => {
    const active = avatar || AVATAR_MAP_SEED[activeStudentId] || AVATAR_MAP_SEED[normalizeStudentId(activeStudentId)];
    if (active) {
      return {
        pet_type: 'dragon' as const,
        pet_name: 'Mascota',
        pet_hunger: 50,
        pet_happiness: 50,
        pet_outfit: 'none',
        ...active
      };
    }
    return {
      student_id: activeStudentId,
      avatar_name: 'Estudiante',
      hair_style: 'classic',
      hair_color: '#4B5563',
      eyes_style: 'happy',
      outfit_style: 'explorer',
      outfit_color: '#3B82F6',
      background_style: 'forest',
      unlocked_items: ['classic', 'happy', 'explorer', 'forest'],
      pet_type: 'dragon' as const,
      pet_name: 'Mascota',
      pet_hunger: 50,
      pet_happiness: 50,
      pet_outfit: 'none',
      updated_at: ''
    };
  }, [avatar, activeStudentId]);
};

export const useCurrentStudentAcademicLevel = (): StudentAcademicLevelInfo => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  
  return useMemo(() => {
    const norm = normalizeStudentId(activeStudentId);
    const adminStudent = detailedStudents?.find(s => 
      s.id === activeStudentId || 
      s.id === norm ||
      mapStudentIdToUuid(s.id) === activeStudentId
    );
    if (adminStudent) {
      return getStudentAcademicLevelInfo(adminStudent);
    }
    const seedStudent = STUDENTS_LIST_SEED.find(s => s.id === norm || s.id === activeStudentId);
    if (seedStudent) {
      if (seedStudent.id === 'std-pb') return getStudentAcademicLevelInfo({ level: 'primaria', grade: '1º' });
      if (seedStudent.id === 'std-pa') return getStudentAcademicLevelInfo({ level: 'primaria', grade: '4º' });
      if (seedStudent.id === 'std-sec') return getStudentAcademicLevelInfo({ level: 'secundaria', grade: '2º' });
      if (seedStudent.id === 'std-prep') return getStudentAcademicLevelInfo({ level: 'preparatoria', grade: '4º Semestre' });
    }
    // Fallback pedagógico predeterminado a Primaria Baja (1º de Primaria)
    return getStudentAcademicLevelInfo({ level: 'primaria', grade: '1º' });
  }, [activeStudentId, detailedStudents]);
};

export const useCurrentStudentProfile = () => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const academicLevel = useCurrentStudentAcademicLevel();
  return useMemo(() => {
    const norm = normalizeStudentId(activeStudentId);
    try {
      const adminStudent = useSchoolAdminStore.getState().detailedStudents?.find(s => 
        s.id === activeStudentId || 
        s.id === norm ||
        mapStudentIdToUuid(s.id) === activeStudentId
      );
      if (adminStudent) {
        return {
          id: adminStudent.id,
          first_name: adminStudent.first_name,
          last_name: `${adminStudent.last_name_1} ${adminStudent.last_name_2 || ''}`.trim(),
          role: 'student' as const,
          email: adminStudent.email || `${adminStudent.first_name.toLowerCase()}@jjrosseau.edu.mx`,
          level: adminStudent.level,
          grade: adminStudent.grade,
          campus_name: adminStudent.campus_name,
          group_id: adminStudent.group_id,
          academicLevel,
          created_at: (adminStudent as any).created_at || new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
    } catch {}
    const seed = STUDENTS_LIST_SEED.find(s => s.id === norm) || STUDENTS_LIST_SEED.find(s => s.id === activeStudentId) || STUDENTS_LIST_SEED[1];
    return {
      ...seed,
      level: academicLevel.level,
      grade: academicLevel.grade,
      academicLevel
    };
  }, [activeStudentId, academicLevel]);
};

export const useCurrentStudentAcademicPower = (activeMissionQuests: Quest[] = []): AcademicPowerResult => {
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const normId = normalizeStudentId(activeStudentId);
  const stats = useCurrentStudentStats();
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);

  const ownedArtifactIds = useMemo(() => {
    return studentInventoryMap[normId] || studentInventoryMap[activeStudentId] || [];
  }, [studentInventoryMap, normId, activeStudentId]);

  const shopArtifacts = useGamificationStore(state => state.shopArtifacts);
  const questAttempts = useGamificationStore(state => state.questAttempts);

  return useMemo(() => {
    return calculateAcademicPower(stats, questAttempts, ownedArtifactIds, shopArtifacts, activeMissionQuests);
  }, [stats, questAttempts, ownedArtifactIds, shopArtifacts, activeMissionQuests]);
};
