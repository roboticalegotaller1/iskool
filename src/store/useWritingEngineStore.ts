/**
 * @module useWritingEngineStore
 * @description Store Zustand persistente para el Motor Autónomo de Evaluación y Tutoría
 * de Escritura iSkool (/teacher/idiomas/writing y /student/idiomas/studio/writing).
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WritingLanguage,
  LanguageLevel,
  TaskPrompt,
  DraftAnalysisOutput,
  FinalEvaluationOutput,
  TeacherCohortDashboardOutput
} from '@/types/writingEngine';
import { AutonomousWritingEngineService } from '@/services/writingEngineService';

interface WritingEngineState {
  // Estado Estudiante Studio
  selectedLanguage: WritingLanguage;
  selectedLevel: LanguageLevel;
  activePrompt: TaskPrompt;
  currentDraft: string;
  analysisOutput: DraftAnalysisOutput;
  latestEvaluation: FinalEvaluationOutput | null;
  studentHistory: FinalEvaluationOutput[];
  isSubmitting: boolean;
  unlockedHintLevels: Record<string, number>; // itemId -> 1, 2 o 3

  // Estado Docente Hub
  selectedCohortGroup: string;
  teacherDashboard: TeacherCohortDashboardOutput;
  allEvaluations: FinalEvaluationOutput[];

  // Acciones Estudiante
  setSelectedLanguage: (lang: WritingLanguage) => void;
  setSelectedLevel: (level: LanguageLevel) => void;
  setActivePrompt: (prompt: TaskPrompt) => void;
  generateNewPrompt: (lang?: WritingLanguage, level?: LanguageLevel, tema?: string) => void;
  updateDraft: (text: string) => void;
  unlockHintLevel: (itemId: string, level: number) => void;
  submitFinalEvaluation: () => FinalEvaluationOutput;
  resetDraft: () => void;

  // Acciones Docente
  setSelectedCohortGroup: (group: string) => void;
  refreshTeacherDashboard: () => void;
  addTeacherEvaluation: (evaluation: FinalEvaluationOutput) => void;
}

const DEFAULT_PROMPT = AutonomousWritingEngineService.crearConsigna({
  idioma: 'en',
  nivel: 'B2',
  tema: 'Impacto de la Tecnología en el Aula'
});

const INITIAL_EVALUATIONS = AutonomousWritingEngineService.obtenerEvaluacionesSemillaDemo();

export const useWritingEngineStore = create<WritingEngineState>()(
  persist(
    (set, get) => ({
      selectedLanguage: 'en',
      selectedLevel: 'B2',
      activePrompt: DEFAULT_PROMPT,
      currentDraft: '',
      analysisOutput: AutonomousWritingEngineService.analizarBorrador({
        idioma: 'en',
        nivel: 'B2',
        borrador_actual: ''
      }),
      latestEvaluation: null,
      studentHistory: INITIAL_EVALUATIONS.filter(e => e.studentId === 'std-santi'),
      isSubmitting: false,
      unlockedHintLevels: {},

      selectedCohortGroup: 'Grupo B2 Avanzado - Sede Montes (Bachillerato)',
      teacherDashboard: AutonomousWritingEngineService.generarDashboardDocente({
        grupo: 'Grupo B2 Avanzado - Sede Montes (Bachillerato)',
        evaluaciones: INITIAL_EVALUATIONS
      }),
      allEvaluations: INITIAL_EVALUATIONS,

      setSelectedLanguage: (lang) => {
        const currentLevel = get().selectedLevel;
        const newPrompt = AutonomousWritingEngineService.crearConsigna({
          idioma: lang,
          nivel: currentLevel
        });
        set({
          selectedLanguage: lang,
          activePrompt: newPrompt,
          currentDraft: '',
          latestEvaluation: null,
          analysisOutput: AutonomousWritingEngineService.analizarBorrador({
            idioma: lang,
            nivel: currentLevel,
            borrador_actual: ''
          }),
          unlockedHintLevels: {}
        });
      },

      setSelectedLevel: (level) => {
        const currentLang = get().selectedLanguage;
        const newPrompt = AutonomousWritingEngineService.crearConsigna({
          idioma: currentLang,
          nivel: level
        });
        set({
          selectedLevel: level,
          activePrompt: newPrompt,
          currentDraft: '',
          latestEvaluation: null,
          analysisOutput: AutonomousWritingEngineService.analizarBorrador({
            idioma: currentLang,
            nivel: level,
            borrador_actual: ''
          }),
          unlockedHintLevels: {}
        });
      },

      setActivePrompt: (prompt) => {
        set({
          activePrompt: prompt,
          selectedLanguage: prompt.idioma,
          selectedLevel: prompt.nivel,
          currentDraft: '',
          latestEvaluation: null,
          analysisOutput: AutonomousWritingEngineService.analizarBorrador({
            idioma: prompt.idioma,
            nivel: prompt.nivel,
            borrador_actual: ''
          }),
          unlockedHintLevels: {}
        });
      },

      generateNewPrompt: (lang, level, tema) => {
        const effectiveLang = lang || get().selectedLanguage;
        const effectiveLevel = level || get().selectedLevel;
        const newPrompt = AutonomousWritingEngineService.crearConsigna({
          idioma: effectiveLang,
          nivel: effectiveLevel,
          tema: tema
        });
        set({
          activePrompt: newPrompt,
          selectedLanguage: effectiveLang,
          selectedLevel: effectiveLevel,
          currentDraft: '',
          latestEvaluation: null,
          analysisOutput: AutonomousWritingEngineService.analizarBorrador({
            idioma: effectiveLang,
            nivel: effectiveLevel,
            borrador_actual: ''
          }),
          unlockedHintLevels: {}
        });
      },

      updateDraft: (text) => {
        const { selectedLanguage, selectedLevel, activePrompt } = get();
        const analysis = AutonomousWritingEngineService.analizarBorrador({
          idioma: selectedLanguage,
          nivel: selectedLevel,
          consigna: activePrompt.consignaOficial,
          borrador_actual: text
        });
        set({
          currentDraft: text,
          analysisOutput: analysis
        });
      },

      unlockHintLevel: (itemId, level) => {
        set(state => ({
          unlockedHintLevels: {
            ...state.unlockedHintLevels,
            [itemId]: Math.max(state.unlockedHintLevels[itemId] || 1, level)
          }
        }));
      },

      submitFinalEvaluation: () => {
        const { selectedLanguage, selectedLevel, activePrompt, currentDraft, allEvaluations, selectedCohortGroup } = get();
        set({ isSubmitting: true });

        const evaluation = AutonomousWritingEngineService.evaluarTextoFinal({
          idioma: selectedLanguage,
          nivel: selectedLevel,
          consigna: activePrompt.consignaOficial,
          texto_final: currentDraft,
          studentId: 'std-alumno-activo',
          studentName: 'Alumno en Práctica iSkool'
        });

        const updatedAll = [evaluation, ...allEvaluations];
        const updatedDashboard = AutonomousWritingEngineService.generarDashboardDocente({
          grupo: selectedCohortGroup,
          evaluaciones: updatedAll
        });

        set(state => ({
          latestEvaluation: evaluation,
          studentHistory: [evaluation, ...state.studentHistory],
          allEvaluations: updatedAll,
          teacherDashboard: updatedDashboard,
          isSubmitting: false
        }));

        return evaluation;
      },

      resetDraft: () => {
        const { selectedLanguage, selectedLevel, activePrompt } = get();
        set({
          currentDraft: '',
          latestEvaluation: null,
          unlockedHintLevels: {},
          analysisOutput: AutonomousWritingEngineService.analizarBorrador({
            idioma: selectedLanguage,
            nivel: selectedLevel,
            consigna: activePrompt.consignaOficial,
            borrador_actual: ''
          })
        });
      },

      setSelectedCohortGroup: (group) => {
        const { allEvaluations } = get();
        const updatedDashboard = AutonomousWritingEngineService.generarDashboardDocente({
          grupo: group,
          evaluaciones: allEvaluations
        });
        set({
          selectedCohortGroup: group,
          teacherDashboard: updatedDashboard
        });
      },

      refreshTeacherDashboard: () => {
        const { selectedCohortGroup, allEvaluations } = get();
        const updatedDashboard = AutonomousWritingEngineService.generarDashboardDocente({
          grupo: selectedCohortGroup,
          evaluaciones: allEvaluations
        });
        set({ teacherDashboard: updatedDashboard });
      },

      addTeacherEvaluation: (evaluation) => {
        const updatedAll = [evaluation, ...get().allEvaluations];
        const updatedDashboard = AutonomousWritingEngineService.generarDashboardDocente({
          grupo: get().selectedCohortGroup,
          evaluaciones: updatedAll
        });
        set({
          allEvaluations: updatedAll,
          teacherDashboard: updatedDashboard
        });
      }
    }),
    {
      name: 'iskool_writing_engine_store',
      partialize: (state) => ({
        selectedLanguage: state.selectedLanguage,
        selectedLevel: state.selectedLevel,
        activePrompt: state.activePrompt,
        studentHistory: state.studentHistory,
        allEvaluations: state.allEvaluations,
        selectedCohortGroup: state.selectedCohortGroup
      })
    }
  )
);
