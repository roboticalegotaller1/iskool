"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useClassroomStore } from '@/store/useClassroomStore';
import { useAuth } from '@/context/AuthContext';
import { 
  X, 
  Sparkles, 
  Camera, 
  Mic, 
  FileText, 
  Link2, 
  Brain, 
  Trophy, 
  Coins, 
  Star, 
  CheckCircle2, 
  Clock, 
  Gift,
  Upload
} from 'lucide-react';
import { EvidenceType } from '@/types/classroom';

interface Props {
  questId: string;
  questTitle: string;
  dueDate: string;
  groupId: string;
  onClose: () => void;
  onSubmitted?: () => void;
}

export const StudentSubmissionModal: React.FC<Props> = ({
  questId,
  questTitle,
  dueDate,
  groupId,
  onClose,
  onSubmitted
}) => {
  const { user } = useAuth();
  const { submitStudentWork } = useClassroomStore();

  const [evidenceType, setEvidenceType] = useState<EvidenceType>('image');
  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioRecorded, setAudioRecorded] = useState(false);

  // Estados de Autoevaluación Metacognitiva
  const [mainChallenge, setMainChallenge] = useState('');
  const [strategyUsed, setStrategyUsed] = useState('');
  const [prideHighlight, setPrideHighlight] = useState('');
  const [satisfactionRating, setSatisfactionRating] = useState(5);

  const isEarly = new Date() <= new Date(dueDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenceText.trim() && !evidenceUrl.trim() && !audioRecorded) return;

    submitStudentWork({
      questId,
      questTitle,
      studentId: user?.id || 'std-current',
      studentName: (user as any)?.user_metadata?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Estudiante Héroe',
      groupId,
      dueDate,
      evidenceType,
      evidenceUrl: evidenceUrl || (evidenceType === 'image' ? 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800' : undefined),
      evidenceText: evidenceText.trim(),
      audioRecordingUrl: audioRecorded ? 'audio-blob-recorded' : undefined,
      reflection: {
        mainChallengeFaced: mainChallenge.trim() || 'Comprender los conceptos iniciales',
        strategyUsed: strategyUsed.trim() || 'Repasar el material y experimentar',
        satisfactionRating,
        prideHighlight: prideHighlight.trim() || 'Haber concluido el proyecto a tiempo'
      }
    });

    if (onSubmitted) onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-in my-auto flex flex-col max-h-[90vh]">
        
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-850 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Buzón de Misión
                </span>
                {isEarly && (
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> +20 XP Bono Puntualidad
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white line-clamp-1">
                Entregar: {questTitle}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con Scroll */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* 1. Tipo de Evidencia Multimodal */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-400">
              1. Formato de tu Evidencia o Artefacto:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'image' as EvidenceType, label: '📸 Foto / Imagen', desc: 'Maqueta o cuaderno' },
                { type: 'audio' as EvidenceType, label: '🎙️ Grabación de Voz', desc: 'Explica tu razonamiento' },
                { type: 'text_document' as EvidenceType, label: '📄 Texto / Reporte', desc: 'Resumen o ensayo' },
                { type: 'link' as EvidenceType, label: '🔗 Enlace Web', desc: 'Simulador o drive' }
              ].map(item => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setEvidenceType(item.type)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    evidenceType === item.type
                      ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-400'
                      : 'bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
                  }`}
                >
                  <span className="font-bold text-xs">{item.label}</span>
                  <span className="text-[10px] text-slate-400 mt-1">{item.desc}</span>
                </button>
              ))}
            </div>

            {/* Input según formato seleccionado */}
            {evidenceType === 'image' && (
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Pega el enlace de tu imagen o foto..."
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
                />
              </div>
            )}

            {evidenceType === 'audio' && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-center space-y-3">
                <p className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                  Graba una breve explicación en voz alta de los descubrimientos de tu proyecto.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordingAudio(!isRecordingAudio);
                    if (isRecordingAudio) setAudioRecorded(true);
                  }}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 mx-auto cursor-pointer ${
                    isRecordingAudio 
                      ? 'bg-rose-600 text-white animate-pulse' 
                      : audioRecorded
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-200'
                  }`}
                >
                  <Mic className="w-4 h-4" />
                  <span>{isRecordingAudio ? 'Detener Grabación...' : audioRecorded ? '✓ Audio Grabado' : 'Iniciar Grabación de Voz'}</span>
                </button>
              </div>
            )}

            {evidenceType === 'text_document' && (
              <textarea
                rows={3}
                placeholder="Escribe el desarrollo y conclusiones de tu misión..."
                value={evidenceText}
                onChange={e => setEvidenceText(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
              />
            )}

            {evidenceType === 'link' && (
              <input
                type="url"
                placeholder="https://mi-proyecto-educativo.com"
                value={evidenceUrl}
                onChange={e => setEvidenceUrl(e.target.value)}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
              />
            )}
          </div>

          {/* 2. Autoevaluación Metacognitiva */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">
              <Brain className="w-4 h-4" />
              <span>2. Autoevaluación Reflexiva del Alumno:</span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  ¿Cuál fue el mayor reto que enfrentaste en este trabajo?
                </label>
                <input
                  type="text"
                  placeholder="Ej: Calibrar los materiales para que no se rompieran..."
                  value={mainChallenge}
                  onChange={e => setMainChallenge(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  ¿Qué estrategia o apoyo utilizaste para resolverlo?
                </label>
                <input
                  type="text"
                  placeholder="Ej: Consulté la Bóveda Curricular y le pedí consejo a mi equipo..."
                  value={strategyUsed}
                  onChange={e => setStrategyUsed(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  ¿De qué parte de tu creación te sientes más orgulloso?
                </label>
                <input
                  type="text"
                  placeholder="Ej: Logré que funcionara el mecanismo sin fallar..."
                  value={prideHighlight}
                  onChange={e => setPrideHighlight(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-zinc-300">
                  Nivel de satisfacción con tu trabajo:
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(stars => (
                    <button
                      key={stars}
                      type="button"
                      onClick={() => setSatisfactionRating(stars)}
                      className="p-1 cursor-pointer transition-transform hover:scale-125"
                    >
                      <Star className={`w-6 h-6 ${stars <= satisfactionRating ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-zinc-700'}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-400 pl-2">
                    {satisfactionRating}/5 Estrellas
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de Envío */}
          <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Entregar Misión & Reclamar Recompensas</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
