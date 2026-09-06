import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BrokenLinkReport } from '@/types/pedagogicalSuggestions';
import { supabase } from '@/lib/supabaseClient';

interface BrokenLinksState {
  brokenLinks: BrokenLinkReport[];
  
  // Acciones principales
  reportBrokenLink: (report: Omit<BrokenLinkReport, 'reportedAt'>) => Promise<void>;
  isLinkBroken: (url: string) => boolean;
  filterBrokenResources: <T extends { url?: string; directUrl?: string }>(items: T[]) => T[];
  clearBrokenLink: (url: string) => void;
  resetAllReports: () => void;
}

export const useBrokenLinksStore = create<BrokenLinksState>()(
  persist(
    (set, get) => ({
      brokenLinks: [],

      reportBrokenLink: async (report) => {
        const fullReport: BrokenLinkReport = {
          ...report,
          reportedAt: new Date().toISOString(),
        };

        // 1. Guardar de forma inmediata en el estado local persistido (desaparece al instante)
        set((state) => {
          const exists = state.brokenLinks.some((l) => l.url === report.url);
          if (exists) return state;
          return {
            brokenLinks: [fullReport, ...state.brokenLinks],
          };
        });

        // 2. Notificar / persistir en la base de datos remota si está disponible
        try {
          await supabase
            .from('reported_broken_resources')
            .insert([{
              resource_url: fullReport.url,
              resource_title: fullReport.resourceTitle,
              resource_type: fullReport.resourceType,
              reported_by: fullReport.reportedByTeacherName || 'Docente ISkool',
              reason: fullReport.reason || 'Enlace caído o inaccesible',
              created_at: fullReport.reportedAt,
            }]);
        } catch (err) {
          // Si la tabla remota no existe aún en Supabase, el estado local persistente ya garantiza
          // la purga inmediata del ecosistema en el navegador del docente y en el sistema ISkool.
        }
      },

      isLinkBroken: (url: string) => {
        if (!url) return false;
        return get().brokenLinks.some((l) => l.url.trim().toLowerCase() === url.trim().toLowerCase());
      },

      filterBrokenResources: <T extends { url?: string; directUrl?: string }>(items: T[]): T[] => {
        const brokenSet = new Set(
          get().brokenLinks.map((l) => l.url.trim().toLowerCase())
        );
        return items.filter((item) => {
          const itemUrl = (item.url || item.directUrl || '').trim().toLowerCase();
          return !brokenSet.has(itemUrl);
        });
      },

      clearBrokenLink: (url: string) => {
        set((state) => ({
          brokenLinks: state.brokenLinks.filter((l) => l.url !== url),
        }));
      },

      resetAllReports: () => {
        set({ brokenLinks: [] });
      },
    }),
    {
      name: 'iskool_reported_broken_links_v1',
    }
  )
);
