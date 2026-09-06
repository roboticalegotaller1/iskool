"use client";

import React from 'react';
import { StudioTriviaPlayer } from '@/components/StudioTriviaPlayer';
import { StudioActivityJSON } from '@/types';

interface TriviaPlayerProps {
  activity: StudioActivityJSON;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const TriviaPlayer: React.FC<TriviaPlayerProps> = ({ activity, onClose, onComplete }) => {
  return <StudioTriviaPlayer activity={activity} onClose={onClose} onComplete={onComplete} />;
};
