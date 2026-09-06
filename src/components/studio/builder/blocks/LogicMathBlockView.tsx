"use client";

import React, { useState } from 'react';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { StudioBlock } from '@/types/studioBlocks';
import { 
  Brain, 
  Sparkles, 
  Lightbulb, 
  BookOpen, 
  Cpu, 
  Binary, 
  Network, 
  Bot, 
  Boxes, 
  ToggleLeft, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  HelpCircle,
  FolderOpen
} from 'lucide-react';
import { MATHEMATICAL_LOGIC_ACTIVITIES } from '@/data/mathematicalLogicActivities';

interface Props {
  block: StudioBlock;
}

export const LogicMathBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const data = (block as any).data || {};

  const handleFieldChange = (field: string, value: any) => {
    updateBlockData(block.id, {
      ...data,
      [field]: value
    });
  };

  const handleOptionChange = (index: number, key: string, value: any) => {
    const options = [...(data.options || [])];
    options[index] = { ...options[index], [key]: value };
    handleFieldChange('options', options);
  };

  const handleSetCorrectOption = (index: number) => {
    const options = (data.options || []).map((opt: any, i: number) => ({
      ...opt,
      isCorrect: i === index
    }));
    handleFieldChange('options', options);
  };

  const handleAddOption = () => {
    const options = [...(data.options || [])];
    options.push({
      id: `opt-${Date.now()}`,
      label: `Nueva opción ${options.length + 1}`,
      isCorrect: options.length === 0,
      icon: '🔹',
      detail: 'Explicación del resultado'
    });
    handleFieldChange('options', options);
  };

  const handleRemoveOption = (index: number) => {
    const options = (data.options || []).filter((_: any, i: number) => i !== index);
    handleFieldChange('options', options);
  };

  const handleApplyPreset = (preset: typeof MATHEMATICAL_LOGIC_ACTIVITIES[0]) => {
    updateBlockData(block.id, {
      storyText: preset.problemLore,
      problemQuestion: preset.description,
      logicCategory: preset.logicType,
      educationalLevel: preset.faseNem.toLowerCase().replace(' ', '_'),
      interactiveEngine: preset.simulationConfig.engine,
      options: preset.simulationConfig.options,
      pedagogicalExplanation: preset.pedagogicalExplanation,
      classroomActivity: preset.classroomActivity,
      hints: preset.hints,
      timeLimitSeconds: preset.gamificationSettings.timeLimitSeconds
    });
    setShowPresetSelector(false);
  };

  return (
    <div className="p-4 sm:p-5 space-y-5 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm">
      {/* Cabecera del Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Binary className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-cyan-600 dark:text-cyan-400">
              Editor de Reto: Lógica Matemática & Algoritmia
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Configura retos de pensamiento computacional, simulación interactiva y dinámicas de aula.
            </p>
          </div>
        </div>

        {/* Botón de Cargar Reto Predefinido del Catálogo */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresetSelector(!showPresetSelector)}
            className="px-3 py-1.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300 text-xs font-black hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Cargar Reto Oficial ({MATHEMATICAL_LOGIC_ACTIVITIES.length})</span>
          </button>

          {/* Modal / Menú Desplegable de Catálogo de 40 Retos */}
          {showPresetSelector && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-80 overflow-y-auto bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-750 rounded-2xl shadow-2xl z-50 p-2 space-y-1">
              <div className="p-2 border-b border-slate-100 dark:border-zinc-800 text-[11px] font-black text-slate-500 dark:text-zinc-400 uppercase">
                Selecciona una plantilla del catálogo
              </div>
              {MATHEMATICAL_LOGIC_ACTIVITIES.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className="w-full p-2 rounded-xl text-left hover:bg-cyan-50 dark:hover:bg-cyan-950/40 text-xs transition-colors flex items-start gap-2 group cursor-pointer"
                >
                  <span className="text-sm shrink-0 mt-0.5">{preset.badgeReward.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800 dark:text-zinc-200 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 line-clamp-1">
                      {preset.title}
                    </div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {preset.levelLabel} • {preset.logicType}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selectores de Nivel y Motor de Simulación */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
            Nivel Educativo (NEM):
          </label>
          <select
            value={data.educationalLevel || 'fase_3'}
            onChange={(e) => handleFieldChange('educationalLevel', e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold focus:ring-2 focus:ring-cyan-500"
          >
            <option value="fase_3">Fase 3 (1º y 2º de Primaria - Exploradores)</option>
            <option value="fase_4">Fase 4 (3º y 4º de Primaria - Creadores)</option>
            <option value="fase_5">Fase 5 (5º y 6º de Primaria - Innovadores)</option>
            <option value="fase_6">Fase 6 (1º a 3º de Secundaria - Maestros)</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
            Motor de Simulación Visual:
          </label>
          <select
            value={data.interactiveEngine || 'circuit_gates'}
            onChange={(e) => handleFieldChange('interactiveEngine', e.target.value)}
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-semibold focus:ring-2 focus:ring-cyan-500"
          >
            <option value="circuit_gates">⚡ Compuertas Lógicas & Circuitos (AND/OR/NOT/XOR)</option>
            <option value="step_automaton">🤖 Cinta de Autómata & Máquina de Turing</option>
            <option value="binary_counter">💡 Contador y Pesos Binarios (1, 2, 4)</option>
            <option value="graph_explorer">🕸️ Explorador de Grafos & Búsqueda BFS</option>
            <option value="interactive_switches">🚦 Interruptores y Condiciones Lógicas</option>
            <option value="sorter_tray">🧱 Charola de Ordenamiento & Colas Deque</option>
            <option value="grid_selector">🧩 Cuadrícula de Patrones y Restricciones</option>
          </select>
        </div>
      </div>

      {/* Planteamiento y Narrativa */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
            <span>Narrativa / Contexto del Problema:</span>
          </label>
          <textarea
            value={data.storyText || ''}
            onChange={(e) => handleFieldChange('storyText', e.target.value)}
            rows={3}
            placeholder="Describe la situación, las reglas y los elementos interactivos del reto..."
            className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-cyan-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
            <span>Pregunta / Consigna Específica:</span>
          </label>
          <input
            type="text"
            value={data.problemQuestion || ''}
            onChange={(e) => handleFieldChange('problemQuestion', e.target.value)}
            placeholder="¿Cuál es la configuración correcta que cumple con todas las reglas?"
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Opciones de Respuesta / Validación */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
            Opciones de Respuesta y Retroalimentación:
          </label>
          <button
            type="button"
            onClick={handleAddOption}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Añadir Opción</span>
          </button>
        </div>

        <div className="space-y-2">
          {(data.options || []).map((opt: any, idx: number) => (
            <div
              key={opt.id || idx}
              className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center gap-2.5 ${
                opt.isCorrect 
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700' 
                  : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700'
              }`}
            >
              <button
                type="button"
                onClick={() => handleSetCorrectOption(idx)}
                className={`p-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  opt.isCorrect
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-zinc-700 text-slate-400 border-slate-300 hover:text-emerald-500'
                }`}
                title={opt.isCorrect ? 'Opción Correcta' : 'Marcar como Correcta'}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px]">{opt.isCorrect ? 'Correcta' : 'Hacer Correcta'}</span>
              </button>

              <input
                type="text"
                value={opt.label || ''}
                onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                placeholder="Texto de la opción..."
                className="flex-1 p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-cyan-500"
              />

              <input
                type="text"
                value={opt.detail || ''}
                onChange={(e) => handleOptionChange(idx, 'detail', e.target.value)}
                placeholder="Explicación formativa..."
                className="flex-1 p-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-[11px] font-medium text-slate-500 dark:text-zinc-400 focus:ring-2 focus:ring-cyan-500"
              />

              <button
                type="button"
                onClick={() => handleRemoveOption(idx)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Eliminar opción"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Desglose Pedagógico & Actividad en Aula */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800">
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            <span>¿Cómo es Informática / Pensamiento Computacional?</span>
          </label>
          <textarea
            value={data.pedagogicalExplanation || ''}
            onChange={(e) => handleFieldChange('pedagogicalExplanation', e.target.value)}
            rows={3}
            placeholder="Explica el principio de ciencias de la computación involucrado (Turing, Grafos, BFS, Binario, etc.)..."
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Continúa Aprendiendo (Dinámica en Aula sin Computadora):</span>
          </label>
          <textarea
            value={data.classroomActivity || ''}
            onChange={(e) => handleFieldChange('classroomActivity', e.target.value)}
            rows={3}
            placeholder="Actividad física o con tarjetas para que los alumnos practiquen el concepto en el aula..."
            className="w-full p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>
    </div>
  );
};
