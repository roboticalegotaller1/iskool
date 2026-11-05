"use client";

import React from 'react';
import { StudioBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { TextNarrativeBlockView } from './TextNarrativeBlockView';
import { QuizQuestionBlockView } from './QuizQuestionBlockView';
import { RewardChestBlockView } from './RewardChestBlockView';
import { BossEnemyBlockView } from './BossEnemyBlockView';
import { YouTubeVideoBlockView } from './YouTubeVideoBlockView';
import { ExternalEmbedBlockView } from './ExternalEmbedBlockView';
import { DragDropMatchBlockView } from './DragDropMatchBlockView';
import { OrderingSequenceBlockView } from './OrderingSequenceBlockView';
import { FillInBlanksBlockView } from './FillInBlanksBlockView';
import { OpenPollWordcloudBlockView } from './OpenPollWordcloudBlockView';
import { SecretCodePuzzleBlockView } from './SecretCodePuzzleBlockView';
import { MinigameBlockView } from './MinigameBlockView';
import { LogicBranchBlockView } from './LogicBranchBlockView';
import { CheckpointGateBlockView } from './CheckpointGateBlockView';
import { BadgeCertificateBlockView } from './BadgeCertificateBlockView';
import { AudioSfxBlockView } from './AudioSfxBlockView';
import { TimedReadingBlockView } from './TimedReadingBlockView';
import { LogicMathBlockView } from './LogicMathBlockView';
import { LanguagesBlockView } from './LanguagesBlockView';
import { HistoricalFigureBlockView } from './HistoricalFigureBlockView';

interface Props {
  block: StudioBlock;
}

export const BlockDispatcher: React.FC<Props> = ({ block }) => {
  const { updateBlockData, setIsNodeConfigDrawerOpen } = useActivityBuilderStore();

  switch (block.type) {
    case 'historical_figure_block':
      return <HistoricalFigureBlockView block={block} />;
    case 'text_narrative':
      return <TextNarrativeBlockView block={block} />;
    case 'quiz_question':
      return <QuizQuestionBlockView block={block} />;
    case 'timed_reading_block':
      return <TimedReadingBlockView block={block} />;
    case 'reward_chest':
      return <RewardChestBlockView block={block} />;
    case 'boss_enemy':
      return <BossEnemyBlockView block={block} />;
    case 'languages_practice_portal':
    case 'languages_karaoke_block':
    case 'languages_socratic_tutor':
    case 'languages_roleplay_mission':
    case 'languages_evaluation_rubric':
      return <LanguagesBlockView block={block} />;
    case 'logic_challenge_interactive':
    case 'boolean_circuit_builder':
    case 'graph_network_path':
    case 'turing_step_simulator':
    case 'constraint_scheduler':
      return <LogicMathBlockView block={block} />;
    case 'youtube_video':
      return <YouTubeVideoBlockView block={block} />;
    case 'external_embed':
      return <ExternalEmbedBlockView block={block} />;
    case 'drag_drop_match':
      return <DragDropMatchBlockView block={block} />;
    case 'ordering_sequence':
      return <OrderingSequenceBlockView block={block} />;
    case 'fill_in_blanks':
      return <FillInBlanksBlockView block={block} />;
    case 'open_poll_wordcloud':
      return <OpenPollWordcloudBlockView block={block} />;
    case 'secret_code_puzzle':
      return <SecretCodePuzzleBlockView block={block} />;
    case 'minigame_action':
      return <MinigameBlockView block={block} />;
    case 'logic_branch':
      return <LogicBranchBlockView block={block} />;
    case 'checkpoint_gate':
      return <CheckpointGateBlockView block={block} />;
    case 'badge_certificate':
      return <BadgeCertificateBlockView block={block} />;
    case 'audio_sfx':
      return <AudioSfxBlockView block={block} />;
    case 'omr_optical_exam_block':
      return (
        <div className="p-4 rounded-xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-rose-800 dark:text-rose-200">
              📝 {block.data.examTitle || block.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
              0 Tokens • {block.data.variantsCount || 4} Filas (A/B/C/D)
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Título del Examen</label>
              <input
                type="text"
                value={block.data.examTitle || ''}
                onChange={(e) => updateBlockData(block.id, { examTitle: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Penalización por Error</label>
              <input
                type="number"
                step="0.25"
                value={block.data.penaltyPerError ?? 0.25}
                onChange={(e) => updateBlockData(block.id, { penaltyPerError: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 text-xs font-mono font-bold text-rose-700"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Modalidad</label>
              <select
                value={block.data.deliveryMode || 'hybrid_paper_digital'}
                onChange={(e) => updateBlockData(block.id, { deliveryMode: e.target.value as any })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-rose-200 text-xs font-bold"
              >
                <option value="hybrid_paper_digital">Híbrido (Papel OMR + Digital)</option>
                <option value="paper_omr_only">100% Papel Impreso OMR</option>
                <option value="digital_kiosk_only">100% Digital Anti-Copia</option>
              </select>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setIsNodeConfigDrawerOpen(false);
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('iskool:open-omr-exam-suite', { detail: { blockId: block.id } }));
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-700 hover:to-orange-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>📝 Abrir Suite Completa de Exámenes OMR, Hoja de Burbujas &amp; Escáner Óptico</span>
          </button>
        </div>
      );
    case 'interactive_hotspot_canvas':
      return (
        <div className="p-4 rounded-xl bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-cyan-800 dark:text-cyan-200">
              🎯 {block.data.diagramTitle || block.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700 text-[10px] font-black">
              {(block.data.hotspots || []).length} Puntos Calientes • 0 Tokens
            </span>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Instrucción para el Alumno</label>
            <input
              type="text"
              value={block.data.instructions || ''}
              onChange={(e) => updateBlockData(block.id, { instructions: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-cyan-200 text-xs font-bold"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(block.data.hotspots || []).map((pin) => (
              <span key={pin.id} className="px-2 py-1 rounded-md bg-white dark:bg-slate-900 border border-cyan-200 text-[10px] font-bold text-slate-700 dark:text-slate-200">
                📍 #{pin.pinNumber} {pin.correctLabel} ({pin.xPercent}%, {pin.yPercent}%)
              </span>
            ))}
          </div>
        </div>
      );
    case 'cornell_smart_notes':
      return (
        <div className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">
              📓 {block.data.topicTitle || block.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black">
              Pág. {block.data.notebookPageNumber || 48} • 0 Tokens
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Tema de Apuntes Cornell</label>
              <input
                type="text"
                value={block.data.topicTitle || ''}
                onChange={(e) => updateBlockData(block.id, { topicTitle: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Página de Libreta Física SEP</label>
              <input
                type="number"
                value={block.data.notebookPageNumber || 48}
                onChange={(e) => updateBlockData(block.id, { notebookPageNumber: Number(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-emerald-200 text-xs font-bold"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            Conceptos Clave Verificados (0 Tokens): <strong>{(block.data.requiredSummaryKeywords || []).join(', ')}</strong>
          </p>
        </div>
      );
    case 'exit_ticket_reflection':
      return (
        <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-800 dark:text-amber-200">
              🚦 Boleto de Salida 3-2-1 &amp; Termómetro de Aula
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">
              Semáforo Vivo • 0 Tokens
            </span>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Pregunta Rápida de Salida</label>
            <input
              type="text"
              value={block.data.closurePrompt || ''}
              onChange={(e) => updateBlockData(block.id, { closurePrompt: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200 text-xs font-bold"
            />
          </div>
        </div>
      );
    case 'socratic_debate_arena':
      return (
        <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-800 dark:text-indigo-200">
              ⚖️ {block.data.centralDilemma || block.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black">
              Co-Evaluación Pares • 0 Tokens
            </span>
          </div>
          <div>
            <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Dilema Central de Debate</label>
            <input
              type="text"
              value={block.data.centralDilemma || ''}
              onChange={(e) => updateBlockData(block.id, { centralDilemma: e.target.value })}
              className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-indigo-200 text-xs font-bold"
            />
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
            🅰️ {block.data.stanceATitle} vs 🅱️ {block.data.stanceBTitle}
          </p>
        </div>
      );
    case 'interactive_whiteboard_math':
      return (
        <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-blue-800 dark:text-blue-200">
              📐 {block.data.challengeTitle || block.title}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black font-mono">
              {block.data.formulaExpression} → ({block.data.targetCoordinate?.x ?? 2}, {block.data.targetCoordinate?.y ?? 7})
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Fórmula Algebraica</label>
              <input
                type="text"
                value={block.data.formulaExpression || 'y = 2x + 3'}
                onChange={(e) => updateBlockData(block.id, { formulaExpression: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-slate-500 block mb-1">Pregunta de Verificación</label>
              <input
                type="text"
                value={block.data.promptQuestion || ''}
                onChange={(e) => updateBlockData(block.id, { promptQuestion: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-900 border border-blue-200 text-xs font-bold"
              />
            </div>
          </div>
        </div>
      );
    default:
      return (
        <div className="p-4 text-xs text-slate-500 font-bold">
          Bloque didáctico listo para configurar.
        </div>
      );
  }
};
