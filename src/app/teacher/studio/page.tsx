"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Loader } from '@/components/Loader';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';

const ActivityBuilderLayout = dynamic(
  () => import('@/components/studio/builder/ActivityBuilderLayout').then((mod) => mod.ActivityBuilderLayout),
  { ssr: false, loading: () => <Loader message="Iniciando Estudio Docente..." /> }
);
import { 
  Sparkles, 
  ArrowLeft, 
  Wand2, 
  Layers, 
  BookOpen, 
  Gamepad2, 
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherStudioPage() {
  const router = useRouter();
  const { loadPresetBlocks, updateMetadata, resetWorkspace } = useActivityBuilderStore();

  const [activeTab, setActiveTab] = useState<'builder' | 'ai_assistant'>('builder');
  const [aiTopic, setAiTopic] = useState('');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);

  // Generador Rápido con IA para poblar el Lienzo de Bloques
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim() || isGeneratingAi) return;
    setIsGeneratingAi(true);

    try {
      // Simulación de generación pedagógica inteligente
      await new Promise(resolve => setTimeout(resolve, 800));

      const generatedBlocks: any[] = [
        {
          id: `blk-${Date.now()}-1`,
          type: 'text_narrative',
          title: `Introducción: ${aiTopic}`,
          isCollapsed: false,
          data: {
            content: `Exploraremos los fundamentos y conceptos esenciales de ${aiTopic}. Presta mucha atención para superar los siguientes retos.`,
            style: 'instruction',
            speakerName: 'Profesor Guía',
          }
        },
        {
          id: `blk-${Date.now()}-2`,
          type: 'quiz_question',
          title: 'Reactivo Inicial de Comprensión',
          isCollapsed: false,
          data: {
            question: `¿Cuál es el principio fundamental relacionado con ${aiTopic}?`,
            options: [
              `Principio clave de ${aiTopic} (Correcta)`,
              'Concepto no relacionado',
              'Hipótesis secundaria',
              'Dato anecdótico'
            ],
            correctIndex: 0,
            explanation: `Esta respuesta explica adecuadamente la relación con ${aiTopic}.`,
            timeLimitSeconds: 30,
          }
        },
        {
          id: `blk-${Date.now()}-3`,
          type: 'quiz_question',
          title: 'Pregunta de Aplicación Práctica',
          isCollapsed: false,
          data: {
            question: `En un escenario cotidiano, ¿cómo se aplica ${aiTopic}?`,
            options: [
              'Aplicación directa y práctica verificada',
              'Solo en teoría abstracta',
              'Únicamente en laboratorios avanzados',
              'No tiene aplicación actual'
            ],
            correctIndex: 0,
            explanation: 'La aplicación práctica refuerza la comprensión en el aula.',
            timeLimitSeconds: 30,
          }
        },
        {
          id: `blk-${Date.now()}-4`,
          type: 'boss_enemy',
          title: 'Desafío Maestro: Duelo de Saberes',
          isCollapsed: false,
          data: {
            bossName: 'Guardián del Conocimiento',
            spriteKey: 'blood_dragon',
            maxHp: 100,
            attackPower: 20,
            victoryCondition: 'defeat_boss',
            backgroundScene: 'temple',
          }
        },
        {
          id: `blk-${Date.now()}-5`,
          type: 'reward_chest',
          title: 'Cofre de Logro Académico',
          isCollapsed: false,
          data: {
            xpAmount: 200,
            coinsAmount: 50,
            badgeName: `Experto en ${aiTopic}`,
            chestRarity: 'epic',
          }
        }
      ];

      loadPresetBlocks(generatedBlocks, {
        title: `Aventura Gamificada: ${aiTopic}`,
        description: `Misión interactiva con narrativa, reactivos formativos y combate de saberes sobre ${aiTopic}.`,
      });

      setActiveTab('builder');
    } catch (err) {
      console.error('Error generando con IA:', err);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-50">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navegación y Selector de Modo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/teacher')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800/80 text-slate-800 dark:text-zinc-200 font-bold text-xs hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all shadow-sm group w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Hub Docente</span>
          </button>

          {/* Selector de Pestaña: Taller de Bloques o Asistente IA */}
          <div className="flex items-center gap-1.5 bg-slate-200/80 dark:bg-zinc-900 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Lienzo de Bloques</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_assistant')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai_assistant'
                  ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-500" />
              <span>Generar con IA</span>
            </button>
          </div>
        </div>

        {/* Vista 1: Lienzo de Bloques Interactivo */}
        {activeTab === 'builder' && (
          <ActivityBuilderLayout />
        )}

        {/* Vista 2: Asistente Generativo con IA */}
        {activeTab === 'ai_assistant' && (
          <div className="max-w-2xl mx-auto bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-xl space-y-6 animate-scale-in text-center">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-purple-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-purple-500/25">
              <Wand2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                Asistente de Creación Automática con IA
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 max-w-md mx-auto">
                Escribe cualquier tema curricular y la IA generará una estructura inicial de bloques (narrativa, reactivos, combate y recompensas) que podrás editar y reorganizar visualmente.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Tema de la Actividad o Aprendizaje Esperado:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAi()}
                  placeholder="Ej. El ciclo del agua, Ecosistemas de México, Fracciones..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={handleGenerateWithAi}
                  disabled={!aiTopic.trim() || isGeneratingAi}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{isGeneratingAi ? 'Creando Bloques...' : 'Generar Flujo'}</span>
                </button>
              </div>
            </div>

            {/* Ejemplos Rápidos */}
            <div className="pt-2">
              <span className="text-[11px] font-bold text-slate-400">Sugerencias rápidas:</span>
              <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                {[
                  'Causas de la Independencia de México',
                  'Ecosistemas y Biodiversidad',
                  'Operaciones con Fracciones',
                  'La Tabla Periódica'
                ].map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => {
                      setAiTopic(sug);
                    }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-purple-50 dark:hover:bg-purple-950 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-pointer transition-colors"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
