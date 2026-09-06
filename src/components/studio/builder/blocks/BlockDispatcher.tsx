"use client";

import React from 'react';
import { StudioBlock } from '@/types/studioBlocks';
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

interface Props {
  block: StudioBlock;
}

export const BlockDispatcher: React.FC<Props> = ({ block }) => {
  switch (block.type) {
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
    default:
      return (
        <div className="p-4 text-xs text-slate-500 font-bold">
          Bloque didáctico listo para configurar.
        </div>
      );
  }
};
