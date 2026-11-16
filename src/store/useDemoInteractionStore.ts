'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import { useStudentStore } from './useStudentStore';
import { useSchoolAdminStore } from './useSchoolAdminStore';
import { DEMO_STORYLINE_STEPS } from '../lib/demo/demoSandboxConfig';

export type DemoTourMode = 'expanded' | 'minimized' | 'dismissed';

export type DemoCrossRoleEventKind =
  | 'attendance_pulse'
  | 'stamp_xp_awarded'
  | 'parent_signed'
  | 'ceo_intervention_dispatched'
  | 'tour_step_changed';

export interface DemoCrossRoleEvent {
  id: string;
  kind: DemoCrossRoleEventKind;
  actorRole: string;
  actorName: string;
  targetRole: string;
  summary: string;
  xpDelta?: number;
  createdAt: string;
}

interface DemoInteractionState {
  activeTourMode: DemoTourMode;
  currentStepIndex: number;
  events: DemoCrossRoleEvent[];
  lastAttendancePulseAt: string | null;
  lastAttendanceGroup: string | null;
  lastAttendanceCount: number;
  lastStampAndXpAt: string | null;
  lastStampSubject: string | null;
  valentinaBonusXp: number;
  lastParentSignedAt: string | null;
  parentSignedBy: string | null;
  lastCeoInterventionAt: string | null;
  lastCeoInterventionTitle: string | null;

  setTourMode: (mode: DemoTourMode) => void;
  setStepIndex: (index: number) => void;
  recordTeacherAttendancePulse: (params: {
    groupName?: string;
    count: number;
    teacherName?: string;
  }) => void;
  recordTeacherReportAndXp: (params: {
    studentId?: string;
    studentName?: string;
    xp: number;
    coins: number;
    teacherName?: string;
    groupName?: string;
    subjectName?: string;
  }) => void;
  recordParentSignature: (params: {
    studentId?: string;
    studentName?: string;
    familyName?: string;
  }) => void;
  recordCeoIntervention: (params: { title: string; campus?: string }) => void;
  resetDemoSandboxState: () => void;
}

const DEMO_SYNC_CHANNEL = 'iskool_demo_live_sync';

function broadcastDemoPulse(payload: Record<string, unknown>) {
  if (typeof window === 'undefined' || !('BroadcastChannel' in window)) return;
  try {
    const ch = new BroadcastChannel(DEMO_SYNC_CHANNEL);
    ch.postMessage({ ...payload, ts: Date.now() });
    ch.close();
  } catch {
    // Ignore broadcast restrictions in restricted headless tabs
  }
}

export const useDemoInteractionStore = create<DemoInteractionState>()(
  persist(
    (set, get) => ({
      activeTourMode: 'expanded',
      currentStepIndex: 0,
      events: [],
      lastAttendancePulseAt: null,
      lastAttendanceGroup: null,
      lastAttendanceCount: 0,
      lastStampAndXpAt: null,
      lastStampSubject: null,
      valentinaBonusXp: 0,
      lastParentSignedAt: null,
      parentSignedBy: null,
      lastCeoInterventionAt: null,
      lastCeoInterventionTitle: null,

      setTourMode: (mode) => {
        set({ activeTourMode: mode });
      },

      setStepIndex: (index) => {
        const maxStep = Math.max(0, DEMO_STORYLINE_STEPS.length - 1);
        const clamped = Math.max(0, Math.min(maxStep, index));
        set({ currentStepIndex: clamped });
      },

      recordTeacherAttendancePulse: ({ groupName, count, teacherName }) => {
        const now = new Date().toISOString();
        const actorName = teacherName || 'Profa. Sofía Elena Castellanos Ruiz';
        const groupLabel = groupName || '5ºA Primaria';
        const evt: DemoCrossRoleEvent = {
          id: `evt-att-${Date.now()}`,
          kind: 'attendance_pulse',
          actorRole: 'Docente de Aula',
          actorName,
          targetRole: 'Dirección & Familias',
          summary: `Asistencia registrada en 1 toque (${count} presentes) en ${groupLabel}.`,
          createdAt: now,
        };
        set((state) => ({
          lastAttendancePulseAt: now,
          lastAttendanceGroup: groupLabel,
          lastAttendanceCount: count,
          events: [evt, ...state.events].slice(0, 20),
        }));
        broadcastDemoPulse({ kind: 'attendance_pulse', event: evt });
      },

      recordTeacherReportAndXp: ({
        studentId = 'std-demo-01',
        studentName = 'Valentina Mendoza Gómez',
        xp,
        coins,
        teacherName = 'Profa. Sofía Elena Castellanos Ruiz',
        groupName = '5ºA Primaria',
        subjectName = 'Saberes y Pensamiento Científico',
      }) => {
        const now = new Date().toISOString();
        try {
          useStudentStore.getState().addXpAndCoins(studentId, xp, coins);
        } catch {
          // Safe fallback in isolated tests
        }

        try {
          useSchoolAdminStore.getState().sendParentMessage({
            school_id: 'sch-demo-0001',
            parent_id: 'usr-demo-parent-01',
            student_id: studentId,
            student_name: studentName,
            teacher_id: 'usr-demo-teacher-01',
            teacher_name: teacherName,
            subject_id: 'sub-demo-mat-pri',
            subject_name: subjectName,
            message: `Piloto Automático de Aula (${groupName}): Libreta sellada y +${xp} XP acreditados en vivo para ${studentName}. Listo para firma en 1 toque.`,
          });
        } catch {
          // Ignore store dispatch errors outside browser context
        }

        const evt: DemoCrossRoleEvent = {
          id: `evt-xp-${Date.now()}`,
          kind: 'stamp_xp_awarded',
          actorRole: 'Docente de Aula',
          actorName: teacherName,
          targetRole: 'Familia & Alumna',
          summary: `+${xp} XP y Sello Pág. 48 enviados en vivo a ${studentName} (${subjectName}).`,
          xpDelta: xp,
          createdAt: now,
        };

        set((state) => ({
          lastStampAndXpAt: now,
          lastStampSubject: subjectName,
          valentinaBonusXp: state.valentinaBonusXp + xp,
          events: [evt, ...state.events].slice(0, 20),
        }));
        broadcastDemoPulse({ kind: 'stamp_xp_awarded', event: evt, valentinaBonusXp: get().valentinaBonusXp });
      },

      recordParentSignature: ({
        studentId = 'std-demo-01',
        studentName = 'Valentina Mendoza Gómez',
        familyName = 'Familia Mendoza Gómez',
      }) => {
        const now = new Date().toISOString();
        const evt: DemoCrossRoleEvent = {
          id: `evt-sign-${Date.now()}`,
          kind: 'parent_signed',
          actorRole: 'Padre / Tutor',
          actorName: familyName,
          targetRole: 'Docente & Dirección',
          summary: `Enterado firmado en 1 toque por ${familyName} para ${studentName}.`,
          createdAt: now,
        };
        set((state) => ({
          lastParentSignedAt: now,
          parentSignedBy: familyName,
          events: [evt, ...state.events].slice(0, 20),
        }));
        broadcastDemoPulse({ kind: 'parent_signed', event: evt, studentId });
      },

      recordCeoIntervention: ({ title, campus }) => {
        const now = new Date().toISOString();
        const evt: DemoCrossRoleEvent = {
          id: `demo-evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind: 'ceo_intervention_dispatched',
          actorRole: 'ceo',
          actorName: 'Dr. Alejandro Villarreal Montes',
          targetRole: 'director',
          summary: campus
            ? `Resolución CEO (${title}) aplicada en ${campus} conectada con las métricas de Cuentas demo.`
            : `Resolución CEO (${title}) conectada en vivo con los 3 planteles y 650 alumnos.`,
          createdAt: now,
        };
        set((state) => ({
          lastCeoInterventionAt: now,
          lastCeoInterventionTitle: title,
          events: [evt, ...state.events].slice(0, 20),
        }));
        broadcastDemoPulse({ kind: 'ceo_intervention_dispatched', event: evt });
      },

      resetDemoSandboxState: () => {
        set({
          activeTourMode: 'expanded',
          currentStepIndex: 0,
          events: [],
          lastAttendancePulseAt: null,
          lastAttendanceGroup: null,
          lastAttendanceCount: 0,
          lastStampAndXpAt: null,
          lastStampSubject: null,
          valentinaBonusXp: 0,
          lastParentSignedAt: null,
          parentSignedBy: null,
          lastCeoInterventionAt: null,
          lastCeoInterventionTitle: null,
        });
      },
    }),
    {
      name: 'iskool_demo_live_interaction_v1',
      storage: createJSONStorage((): StateStorage => {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage;
        }
        const mem: Record<string, string> = {};
        return {
          getItem: (n) => mem[n] ?? null,
          setItem: (n, v) => {
            mem[n] = v;
          },
          removeItem: (n) => {
            delete mem[n];
          },
        };
      }),
    }
  )
);
