import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createSafeLocalStorage } from '@/utils/safeLocalStorage';

export interface CampaignQuest {
  title: string;
  description: string;
  type: 'quiz' | 'portfolio_submission';
  xp_reward: number;
  coins_reward: number;
  pda_ids: string[];
}

export interface AnaliticoCampaign {
  id: string;
  subject_id: string;
  subject_name: string;
  level: string;
  reality_diagnosis: string;
  problematic: string;
  student_needs: string;
  campo_formativo_id: string;
  campo_formativo_name: string;
  selected_pda_ids: string[];
  quests: CampaignQuest[];
  published_at: string;
}

interface PlanningStoreState {
  campaigns: AnaliticoCampaign[];
  addCampaign: (campaign: AnaliticoCampaign) => void;
  setCampaigns: (campaigns: AnaliticoCampaign[]) => void;
}

export const usePlanningStore = create<PlanningStoreState>()(
  persist(
    (set) => ({
      campaigns: [],
      addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
      setCampaigns: (campaigns) => set({ campaigns }),
    }),
    {
      name: 'iskool_planning_store_v1',
      storage: createJSONStorage(() => createSafeLocalStorage()),
      partialize: (state) => ({ campaigns: state.campaigns }),
    }
  )
);
