import { create } from 'zustand';

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

export const usePlanningStore = create<PlanningStoreState>((set) => ({
  campaigns: [],
  addCampaign: (campaign) => set((state) => ({ campaigns: [...state.campaigns, campaign] })),
  setCampaigns: (campaigns) => set({ campaigns }),
}));
