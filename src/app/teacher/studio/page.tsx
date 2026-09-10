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
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100 relative selection:bg-emerald-500 selection:text-slate-950">
      {/* Atmósfera oscura inmersiva */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(30,58,138,0.25),rgba(15,23,42,0))] pointer-events-none" />
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 relative z-10">
        {/* Navegación y Selector de Modo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/teacher')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-800/90 border border-slate-700/80 text-slate-200 font-bold text-xs hover:bg-slate-750 hover:border-teal-500/50 hover:text-white transition-all shadow-sm group w-fit cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-teal-400 group-hover:-translate-x-1 transition-transform" />
            <span>Volver al Hub Docente</span>
          </button>

          {/* Selector de Pestaña: Taller de Bloques o Asistente IA */}
          <div className="flex items-center gap-1.5 bg-slate-850 p-1 rounded-2xl border border-slate-750 self-start sm:self-auto shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'builder'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm shadow-emerald-950/40 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Lienzo de Bloques</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ai_assistant')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'ai_assistant'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-sm shadow-emerald-950/40 font-black'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-amber-400" />
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
          <div className="max-w-2xl mx-auto bg-slate-900/90 rounded-3xl border border-emerald-500/30 p-6 sm:p-10 shadow-2xl shadow-emerald-950/40 space-y-6 animate-scale-in text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
              <Wand2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">
                Asistente de Creación Automática con IA
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Escribe cualquier tema curricular y la IA generará una estructura inicial de bloques (narrativa, reactivos, combate y recompensas) que podrás editar y reorganizar visualmente.
              </p>
            </div>

            <div className="space-y-3 text-left">
              <label className="text-xs font-bold text-slate-200">
                Tema de la Actividad o Aprendizaje Esperado:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAi()}
                  placeholder="Ej. El ciclo del agua, Ecosistemas de México, Fracciones..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400"
                />
                <button
                  type="button"
                  onClick={handleGenerateWithAi}
                  disabled={!aiTopic.trim() || isGeneratingAi}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all border border-amber-400/50 hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
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
                    className="px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800/90 hover:bg-emerald-950/40 hover:border-emerald-500/50 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
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
