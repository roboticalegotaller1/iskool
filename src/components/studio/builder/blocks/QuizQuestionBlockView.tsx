"use client";

import React, { useState } from 'react';
import { QuizQuestionBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon, 
  Clock, 
  HelpCircle, 
  Upload, 
  Link as LinkIcon,
  AlertTriangle 
} from 'lucide-react';

interface Props {
  block: QuizQuestionBlock;
}

export const QuizQuestionBlockView: React.FC<Props> = ({ block }) => {
  const { updateBlockData } = useActivityBuilderStore();
  const { question, options, correctIndex, explanation, imageUrl, timeLimitSeconds } = block.data;
  const [showImageInput, setShowImageInput] = useState(!!imageUrl);

  // Manejar cambio en una opción
  const handleOptionChange = (index: number, value: string) => {
    const nextOptions = [...options];
    nextOptions[index] = value;
    updateBlockData(block.id, { options: nextOptions });
  };

  // Añadir una nueva opción
  const handleAddOption = () => {
    if (options.length >= 6) return;
    const nextOptions = [...options, `Opción ${String.fromCharCode(65 + options.length)}`];
    updateBlockData(block.id, { options: nextOptions });
  };

  // Eliminar una opción
  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) return;
    const nextOptions = options.filter((_, i) => i !== index);
    let nextCorrect = correctIndex;
    if (correctIndex === index) {
      nextCorrect = -1; // Queda pendiente de asignar
    } else if (correctIndex > index) {
      nextCorrect = correctIndex - 1;
    }
    updateBlockData(block.id, { options: nextOptions, correctIndex: nextCorrect });
  };

  // Subir imagen local via FileReader
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateBlockData(block.id, { imageUrl: event.target.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Enunciado de la Pregunta */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
          <span>Pregunta / Reactivo Didáctico:</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400">Tiempo:</span>
            <select
              value={timeLimitSeconds}
              onChange={(e) => updateBlockData(block.id, { timeLimitSeconds: Number(e.target.value) })}
              className="px-2 py-0.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-750 text-slate-700 dark:text-zinc-300 focus:outline-none"
            >
              <option value={0}>Sin límite</option>
              <option value={15}>15 segundos</option>
              <option value={30}>30 segundos</option>
              <option value={45}>45 segundos</option>
              <option value={60}>60 segundos</option>
            </select>
          </div>
        </label>
        <textarea
          rows={2}
          value={question}
          onChange={(e) => updateBlockData(block.id, { question: e.target.value })}
          placeholder="Escribe la pregunta o problema a resolver..."
          className="w-full px-3.5 py-2.5 rounded-2xl text-sm font-semibold bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white placeholder:text-slate-400 resize-y"
        />
      </div>

      {/* Control de Imagen Ilustrativa */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setShowImageInput(!showImageInput)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{showImageInput ? 'Ocultar Imagen' : '+ Agregar Imagen o Gráfico'}</span>
          </button>
          {imageUrl && (
            <button
              type="button"
              onClick={() => updateBlockData(block.id, { imageUrl: undefined })}
              className="text-[11px] font-bold text-rose-500 hover:underline cursor-pointer"
            >
              Eliminar Imagen
            </button>
          )}
        </div>

        {showImageInput && (
          <div className="p-3 bg-slate-50 dark:bg-zinc-850/80 rounded-2xl border border-dashed border-slate-300 dark:border-zinc-750 space-y-2">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full relative">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={imageUrl || ''}
                  onChange={(e) => updateBlockData(block.id, { imageUrl: e.target.value })}
                  placeholder="Pega la URL de una imagen..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <label className="px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 border border-purple-200/50 hover:bg-purple-100 flex items-center gap-1.5 cursor-pointer shrink-0">
                <Upload className="w-3.5 h-3.5" />
                <span>Subir Archivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {imageUrl && (
              <div className="relative w-full max-w-xs mx-auto h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Vista previa del reactivo"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lista de Alternativas de Respuesta */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-zinc-400">
            Opciones de Respuesta (Marca la Correcta con el Check verde):
          </label>
          {(correctIndex === undefined || correctIndex === null || correctIndex < 0 || correctIndex >= options.length) && (
            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-black border border-amber-300 animate-pulse">
              ⚠️ Respuesta Pendiente
            </span>
          )}
        </div>

        {/* Alerta si el profesor no ha asignado respuesta correcta */}
        {(correctIndex === undefined || correctIndex === null || correctIndex < 0 || correctIndex >= options.length) && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-start gap-2.5 shadow-2xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black text-amber-800 dark:text-amber-300 block">
                Selección de Respuesta Correcta Requerida:
              </span>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 font-normal leading-relaxed">
                Haz clic sobre el botón de letra (<strong className="font-bold">A, B, C o D</strong>) de la opción que sea la respuesta adecuada. El sistema requiere que asignes una para poder guardar y probar la actividad.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {options.map((opt, idx) => {
            const isCorrect = idx === correctIndex;
            const letter = String.fromCharCode(65 + idx);

            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 p-2 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 shadow-sm ring-1 ring-emerald-400/30'
                    : 'bg-white dark:bg-zinc-850 border-slate-200 dark:border-zinc-750 hover:border-slate-300'
                }`}
              >
                {/* Botón Selector de Respuesta Correcta */}
                <button
                  type="button"
                  onClick={() => updateBlockData(block.id, { correctIndex: idx })}
                  title={isCorrect ? '✅ Respuesta correcta asignada' : `Haz clic para marcar opción ${letter} como la respuesta correcta`}
                  aria-label={`Marcar opción ${letter} como correcta`}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black transition-all cursor-pointer ${
                    isCorrect
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30 ring-2 ring-emerald-300 scale-105'
                      : 'bg-slate-100 dark:bg-zinc-750 text-slate-600 dark:text-zinc-300 hover:bg-emerald-100 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 dark:border-zinc-700'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : letter}
                </button>

                {/* Input del Texto de la Opción */}
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Escribe el texto de la opción ${letter}...`}
                  className="flex-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-transparent focus:outline-none text-slate-800 dark:text-zinc-100 placeholder:text-slate-400"
                />

                {/* Botón de Eliminar Opción */}
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    aria-label={`Eliminar opción ${letter}`}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Añadir Opción */}
        {options.length < 6 && (
          <button
            type="button"
            onClick={handleAddOption}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 border border-purple-200/50 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Añadir otra opción ({options.length}/6)</span>
          </button>
        )}
      </div>

      {/* Explicación / Retroalimentación Formativa */}
      <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-zinc-800">
        <label className="text-[11px] font-bold text-slate-600 dark:text-zinc-400 flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
          <span>Retroalimentación Didáctica al Responder:</span>
        </label>
        <input
          type="text"
          value={explanation || ''}
          onChange={(e) => updateBlockData(block.id, { explanation: e.target.value })}
          placeholder="Explica por qué la respuesta correcta es la adecuada para que el alumno aprenda..."
          className="w-full px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-50 dark:bg-zinc-850 border border-slate-200 dark:border-zinc-750 focus:outline-none focus:ring-2 focus:ring-purple-500 text-slate-800 dark:text-zinc-200"
        />
      </div>
    </div>
  );
};
