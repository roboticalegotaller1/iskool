"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Header } from '@/components/Header';
import { Loader } from '@/components/Loader';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { generateGamifiedProject } from '@/services/pedagogicalProjectEngine';

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
  RotateCcw,
  CheckCircle2,
  Shield,
  Swords,
  KeyRound,
  ListOrdered,
  Link2,
  Trophy,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeacherStudioPage() {
  const router = useRouter();
  const { loadPresetBlocks } = useActivityBuilderStore();

  const [activeTab, setActiveTab] = useState<'builder' | 'ai_assistant'>('builder');
  const [aiTopic, setAiTopic] = useState('');
  const [faseNem, setFaseNem] = useState('Fase 5');
  const [gamificationStyle, setGamificationStyle] = useState<'rpg_adventure' | 'escape_room' | 'scientific_expedition' | 'olympic_tournament'>('rpg_adventure');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generationStep, setGenerationStep] = useState('');

  // Generador Maestro con IA y Motor Pedagógico Gamificado
  const handleGenerateWithAi = async () => {
    if (!aiTopic.trim() || isGeneratingAi) return;
    setIsGeneratingAi(true);

    try {
      setGenerationStep('Analizando contenidos curriculares y PDA oficial (NEM 2024)...');
      await new Promise(r => setTimeout(r, 400));

      setGenerationStep('Estructurando narrativa inmersiva y personaje guía de la aventura...');
      await new Promise(r => setTimeout(r, 400));

      // 1. Intentar llamar al endpoint de API o ejecutar el motor de proyectos
      let projectResult;
      try {
        const res = await fetch('/api/studio/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic: aiTopic.trim(),
            faseNem,
            gamificationStyle,
            questionCount: 5
          })
        });
        if (res.ok) {
          projectResult = await res.json();
        }
      } catch (e) {
        console.warn('API route fallback a motor local:', e);
      }

      setGenerationStep('Generando reactivos con distractores plausibles y acertijos de escape room...');
      await new Promise(r => setTimeout(r, 400));

      if (!projectResult || !projectResult.blocks || projectResult.blocks.length === 0) {
        projectResult = await generateGamifiedProject({
          topic: aiTopic.trim(),
          faseNem,
          gamificationStyle
        });
      }

      setGenerationStep('Configurando encuentro de combate RPG, jefe temático y cofre legendario...');
      await new Promise(r => setTimeout(r, 400));

      // Cargar en el estado del lienzo con posiciones y conexiones
      loadPresetBlocks(projectResult.blocks, projectResult.metadata);
      
      // Asegurar conexiones generadas
      if (projectResult.connections && projectResult.connections.length > 0) {
        useActivityBuilderStore.setState({
          connections: projectResult.connections,
          startNodeId: projectResult.startNodeId || projectResult.blocks[0]?.id || null
        });
      }

      setGenerationStep('¡Proyecto gamificado estructurado con éxito!');
      await new Promise(r => setTimeout(r, 300));

      setActiveTab('builder');
    } catch (err) {
      console.error('Error generando con IA:', err);
    } finally {
      setIsGeneratingAi(false);
      setGenerationStep('');
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

          {/* Switch de Vistas */}
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
          <div className="max-w-3xl mx-auto bg-slate-900/95 rounded-3xl border border-emerald-500/30 p-6 sm:p-10 shadow-2xl shadow-emerald-950/40 space-y-7 animate-scale-in text-center backdrop-blur-md">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-emerald-500/30">
              <Wand2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/40 text-emerald-300">
                Motor de Creación Gamificada NEM 2024
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Generador de Proyectos y Aventuras Educativas
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
                Diseña secuencias de aprendizaje profundas y altamente gamificadas. Cada proyecto incluye narrativa inmersiva, ordenamiento lógico, emparejamiento conceptual, preguntas de análisis con distractores verosímiles, enigmas de escape room, combate de saberes contra un jefe temático y cofre legendario.
              </p>
            </div>

            {/* Configuración del Proyecto */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-2">
              {/* Fase Curricular NEM */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                  Fase Curricular / Grado NEM:
                </label>
                <select
                  value={faseNem}
                  onChange={(e) => setFaseNem(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="Fase 3">Fase 3 (1º y 2º Primaria - 6 a 8 años)</option>
                  <option value="Fase 4">Fase 4 (3º y 4º Primaria - 8 a 10 años)</option>
                  <option value="Fase 5">Fase 5 (5º y 6º Primaria - 10 a 12 años)</option>
                  <option value="Fase 6">Fase 6 (Secundaria - 12 a 15 años)</option>
                </select>
              </div>

              {/* Estilo Gamificado */}
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-amber-400" />
                  Estilo y Dinámica de Juego:
                </label>
                <select
                  value={gamificationStyle}
                  onChange={(e) => setGamificationStyle(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                >
                  <option value="rpg_adventure">⚔️ Aventura RPG y Duelo de Saberes</option>
                  <option value="escape_room">🔐 Escape Room & Enigmas Secretos</option>
                  <option value="scientific_expedition">🌿 Expedición e Indagación Científica</option>
                  <option value="olympic_tournament">🏆 Torneo Olímpico de Saberes</option>
                </select>
              </div>
            </div>

            {/* Entrada del Tema */}
            <div className="space-y-3 text-left">
              <label className="text-xs font-bold text-slate-200">
                Tema de la Actividad o Aprendizaje Esperado (PDA):
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerateWithAi()}
                  placeholder="Ej. Causas de la Independencia de México, Ecosistemas, Fracciones..."
                  disabled={isGeneratingAi}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleGenerateWithAi}
                  disabled={!aiTopic.trim() || isGeneratingAi}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all border border-amber-400/50 hover:scale-[1.02] active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
                  <span>{isGeneratingAi ? 'Generando Proyecto...' : 'Generar Proyecto Gamificado'}</span>
                </button>
              </div>
            </div>

            {/* Progreso en vivo si está generando */}
            {isGeneratingAi && (
              <div className="p-4 rounded-2xl bg-slate-800/90 border border-emerald-500/40 text-left flex items-center gap-3 animate-pulse shadow-inner">
                <div className="w-6 h-6 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin shrink-0" />
                <div>
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                    Arquitecto Pedagógico IA Activo
                  </span>
                  <p className="text-xs font-medium text-slate-300">
                    {generationStep || 'Estructurando proyecto interactivo...'}
                  </p>
                </div>
              </div>
            )}

            {/* Estructura que se creará */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2.5">
                Estructura Gamificada de 7 Bloques Didácticos:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-bold text-slate-300">
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <BookOpen className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>1. Diálogo y Lore</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <ListOrdered className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>2. Secuencia Lógica</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>3. Emparejamiento</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <HelpCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>4. Reactivo Crítico</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <KeyRound className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <span>5. Código Secreto</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <Swords className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>6. Duelo contra Boss</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800">
                  <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>7. Cofre Legendario</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900/90 p-2 rounded-xl border border-slate-800 text-emerald-300 font-black">
                  <Shield className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% Interconectado</span>
                </div>
              </div>
            </div>

            {/* Ejemplos Rápidos */}
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-400">Temáticas sugeridas de alto impacto:</span>
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
                    onClick={() => setAiTopic(sug)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-800/90 hover:bg-emerald-950/40 hover:border-emerald-500/50 text-slate-200 border border-slate-700 cursor-pointer transition-colors"
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
