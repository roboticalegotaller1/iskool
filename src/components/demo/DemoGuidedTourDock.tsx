'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Compass,
  ChevronRight,
  Minimize2,
  Maximize2,
  ShieldCheck,
  Sparkles,
  X,
  ArrowRight,
  Activity,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useStudentStore } from '@/store/useStudentStore';
import { useDemoInteractionStore } from '@/store/useDemoInteractionStore';
import {
  DEMO_PERSONAS,
  DEMO_STORYLINE_STEPS,
  DEMO_DEFAULT_PASSWORD,
  DEMO_SCHOOL_ID,
  isDemoSandboxContext,
  type DemoAccountPersona,
} from '@/lib/demo/demoSandboxConfig';

export const DemoGuidedTourDock: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, login } = useAuth();
  const activeSchoolId = useSchoolAdminStore((s) => s.activeSchoolId);
  const selectSchool = useSchoolAdminStore((s) => s.selectSchool);
  const switchStudent = useStudentStore((s) => s.switchStudent);

  const activeTourMode = useDemoInteractionStore((s) => s.activeTourMode);
  const currentStepIndex = useDemoInteractionStore((s) => s.currentStepIndex);
  const events = useDemoInteractionStore((s) => s.events);
  const valentinaBonusXp = useDemoInteractionStore((s) => s.valentinaBonusXp);
  const lastParentSignedAt = useDemoInteractionStore((s) => s.lastParentSignedAt);
  const setTourMode = useDemoInteractionStore((s) => s.setTourMode);
  const setStepIndex = useDemoInteractionStore((s) => s.setStepIndex);

  const [isSwitching, setIsSwitching] = useState(false);

  const isDemoSession = useMemo(() => {
    return isDemoSandboxContext({
      email: user?.email,
      schoolId: user?.school_id || activeSchoolId,
      userId: user?.id,
    });
  }, [user?.email, user?.school_id, user?.id, activeSchoolId]);

  useEffect(() => {
    if (!isDemoSession || !user?.email) return;
    const emailLower = user.email.trim().toLowerCase();
    const matchedPersona = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === emailLower);
    const matchedIdx = matchedPersona
      ? DEMO_STORYLINE_STEPS.findIndex((st) => st.personaId === matchedPersona.id)
      : -1;
    if (matchedIdx >= 0 && matchedIdx !== useDemoInteractionStore.getState().currentStepIndex) {
      setStepIndex(matchedIdx);
    }
  }, [isDemoSession, user?.email, setStepIndex]);

  const activeStep = useMemo(() => {
    return DEMO_STORYLINE_STEPS[currentStepIndex] || DEMO_STORYLINE_STEPS[0];
  }, [currentStepIndex]);

  const activePersona = useMemo(() => {
    const emailLower = (user?.email || '').toLowerCase().trim();
    return (
      DEMO_PERSONAS.find((p) => p.email.toLowerCase() === emailLower) ||
      DEMO_PERSONAS.find((p) => p.id === activeStep.personaId) ||
      DEMO_PERSONAS[0]
    );
  }, [user?.email, activeStep.personaId]);

  if (!isDemoSession) {
    return null;
  }

  // No cubrir la pantalla de login ni superponerse innecesariamente si no está activo en demo
  if (pathname?.startsWith('/login')) {
    return null;
  }

  const switchToPersona = async (persona: DemoAccountPersona, stepIdx: number) => {
    if (isSwitching) return;
    setIsSwitching(true);
    try {
      setStepIndex(stepIdx);
      selectSchool(DEMO_SCHOOL_ID);
      await login(persona.email, DEMO_DEFAULT_PASSWORD);
      if (persona.linkedStudentId) {
        await switchStudent(persona.linkedStudentId);
      }
      const targetStep = DEMO_STORYLINE_STEPS.find((st) => st.personaId === persona.id);
      const targetPath = targetStep?.targetRoute || persona.defaultRoute;
      router.push(targetPath);
    } finally {
      setTimeout(() => setIsSwitching(false), 350);
    }
  };

  const handleNextStep = () => {
    const nextIdx = (currentStepIndex + 1) % DEMO_STORYLINE_STEPS.length;
    const nextStep = DEMO_STORYLINE_STEPS[nextIdx];
    const nextPersona =
      DEMO_PERSONAS.find((p) => p.id === nextStep.personaId) || DEMO_PERSONAS[nextIdx];
    if (nextPersona) {
      void switchToPersona(nextPersona, nextIdx);
    }
  };

  // Modo descartado ("Explorar libremente"): pastilla ultra-discreta en esquina inferior izquierda
  if (activeTourMode === 'dismissed') {
    return (
      <div className="fixed bottom-4 left-4 z-40 pointer-events-auto">
        <button
          type="button"
          data-testid="demo-tour-reopen-pill"
          onClick={() => setTourMode('expanded')}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/90 hover:bg-indigo-700 text-white px-3 py-1.5 text-[11px] font-bold shadow-lg border border-white/15 opacity-75 hover:opacity-100 transition-all cursor-pointer"
          title="Reabrir guía interactiva Cuentas demo"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-400" />
          <span>Guía Demo</span>
        </button>
      </div>
    );
  }

  // Modo minimizado: píldora compacta no intrusiva
  if (activeTourMode === 'minimized') {
    return (
      <div
        data-testid="demo-guided-tour-minimized"
        className="fixed bottom-4 left-4 z-40 pointer-events-auto"
      >
        <div className="flex items-center gap-2 rounded-full bg-slate-900/95 backdrop-blur-md text-white pl-3.5 pr-2 py-2 shadow-xl border border-indigo-400/30">
          <button
            type="button"
            data-testid="demo-tour-expand-btn"
            onClick={() => setTourMode('expanded')}
            className="flex items-center gap-2 text-xs font-extrabold hover:text-emerald-300 transition-colors cursor-pointer"
          >
            <Compass className="h-4 w-4 text-emerald-400" />
            <span>Guía Cuentas Demo ({activeStep.stationNumber}/{DEMO_STORYLINE_STEPS.length})</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black text-emerald-300 border border-emerald-400/30">
              <ShieldCheck className="h-3 w-3" />
              Cero Bóveda
            </span>
            <Maximize2 className="h-3.5 w-3.5 text-slate-300" />
          </button>
          <button
            type="button"
            data-testid="demo-tour-dismiss-from-min"
            onClick={() => setTourMode('dismissed')}
            className="rounded-full p-1 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Explorar libremente"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  const latestEvent = events[0];

  return (
    <aside
      data-testid="demo-guided-tour-dock"
      aria-label="Guía interactiva Cuentas demo"
      className="fixed bottom-4 left-4 z-40 w-[calc(100vw-2rem)] max-w-sm pointer-events-auto"
    >
      <div className="rounded-2xl bg-slate-950/95 backdrop-blur-xl text-white shadow-2xl border border-indigo-500/40 overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-2.5 bg-gradient-to-r from-indigo-900/80 via-slate-900 to-emerald-950/60 border-b border-white/10">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shrink-0">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-black tracking-tight text-white truncate">
                Recorrido Multi-Rol · Cuentas demo
              </div>
              <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-300">
                <ShieldCheck className="h-3 w-3 shrink-0" />
                <span>MODO DEMO · CERO ESCRITURA EN BÓVEDA</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              data-testid="demo-tour-minimize-btn"
              onClick={() => setTourMode('minimized')}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Minimizar guía"
            >
              <Minimize2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              data-testid="demo-tour-dismiss-btn"
              onClick={() => setTourMode('dismissed')}
              className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
              title="Explorar libremente"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* 6-Role Switcher Pills */}
        <div className="px-3.5 pt-2.5 pb-1.5 flex flex-wrap gap-1.5 border-b border-white/5">
          {DEMO_STORYLINE_STEPS.map((step, idx) => {
            const persona = DEMO_PERSONAS.find((p) => p.id === step.personaId);
            if (!persona) return null;
            const isCurrent = idx === currentStepIndex;
            return (
              <button
                key={step.id}
                type="button"
                disabled={isSwitching}
                data-testid={`demo-tour-role-${persona.role}`}
                onClick={() => void switchToPersona(persona, idx)}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-extrabold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-300/60'
                    : 'bg-white/5 text-slate-300 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span>{step.stationNumber}.</span>
                <span>{persona.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Active Station Micro-Guide */}
        <div className="px-3.5 py-2.5 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black text-white">{activeStep.title}</span>
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold text-indigo-200 shrink-0">
              {activePersona.name}
            </span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-300">
            {activeStep.description}
          </p>

          {/* Live Cross-Role Pulse Ticker */}
          {(latestEvent || valentinaBonusXp > 0 || lastParentSignedAt) && (
            <div
              data-testid="demo-tour-live-pulse"
              className="rounded-xl bg-emerald-950/70 border border-emerald-500/30 px-2.5 py-1.5 text-[10px] text-emerald-200 flex items-start gap-1.5"
            >
              <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <div className="font-bold truncate">
                  {latestEvent?.summary || 'Sincronización viva entre cuentas activa'}
                </div>
                <div className="text-[9px] text-emerald-300/80">
                  +{valentinaBonusXp} XP en sesión · {lastParentSignedAt ? 'Enterado firmado en vivo ✓' : 'Esperando firma familiar'}
                </div>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              data-testid="demo-tour-free-explore-btn"
              onClick={() => setTourMode('dismissed')}
              className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Explorar libremente
            </button>
            <button
              type="button"
              disabled={isSwitching}
              data-testid="demo-tour-next-btn"
              onClick={handleNextStep}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 px-3 py-1.5 text-[11px] font-black shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              {isSwitching ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Cambiando rol...</span>
                </>
              ) : (
                <>
                  <span>{activeStep.nextRoleLabel}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
