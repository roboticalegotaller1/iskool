"use client";

import React from 'react';
import { CanvasActivityJSON } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { TriviaPlayer } from '@/components/games/TriviaPlayer';
import { MemoramaPlayer } from '@/components/games/MemoramaPlayer';
import { AhorcadoPlayer } from '@/components/games/AhorcadoPlayer';
import { FlashcardsPlayer } from '@/components/games/FlashcardsPlayer';
import { GenericGameStub } from '@/components/games/GenericGameStub';
import { InteractiveUniversalGamePlayer } from '@/components/games/InteractiveUniversalGamePlayer';
import { LogicMathInteractivePlayer } from '@/components/studio/player/LogicMathInteractivePlayer';
import { StudioFlowPlayer } from '@/components/studio/player/StudioFlowPlayer';
import { LogicActivityPreset } from '@/data/mathematicalLogicActivities';

interface ISkoolActivityPlayerProps {
  activity: CanvasActivityJSON;
  templateType?: string;
  onClose?: () => void;
  onComplete?: (score: number) => void;
}

export const ISkoolActivityPlayer: React.FC<ISkoolActivityPlayerProps> = ({
  activity,
  templateType = 'trivia',
  onClose,
  onComplete
}) => {
  const renderGameComponent = () => {
    const normTemplate = templateType.toLowerCase();

    // 1. Soporte para flujos multimodales de Studio (Clase Magistral Gamificada)
    if (normTemplate === 'custom_builder' || normTemplate === 'activity_flow' || Boolean((activity as any).blocks)) {
      const blocks = (activity as any).blocks || [];
      const connections = (activity as any).connections || [];
      const meta = (activity as any).metadata || {
        title: activity.title || 'Clase Gamificada',
        description: activity.description || '',
        subject: 'Historia y Formación Cívica',
        subjectId: 'sub-hist',
        targetAge: (activity as any).targetAge || 'Primaria Alta y Secundaria (10 - 15 años)',
        campoFormativo: (activity as any).campoFormativo || 'Ética, Naturaleza y Sociedades',
        camposFormativos: ['Ética, Naturaleza y Sociedades'],
        ejesArticuladores: ['Pensamiento Crítico'],
        faseNem: (activity as any).faseNem || 'Fase 5',
        pdaNem: (activity as any).pdaNem || '',
        pdas: [],
        taskType: 'activity_flow',
        xpReward: (activity as any).xpReward || 350,
        coinsReward: (activity as any).coinsReward || 60,
        totalTimeLimit: 0,
        livesCount: 3,
        streakMultiplier: true,
      };

      return (
        <StudioFlowPlayer
          blocks={blocks}
          connections={connections}
          metadata={meta}
          onClose={onClose}
          onComplete={onComplete}
        />
      );
    }

    if (normTemplate === 'logic_math' || normTemplate === 'logica_matematica' || (activity as any).logicChallengeData) {
      const challengeData = (activity as any).logicChallengeData || {};
      const preset: LogicActivityPreset = {
        id: activity.title || 'custom-logic',
        templateType: 'logic_math',
        title: activity.title || 'Reto de Lógica Matemática',
        level: 'primaria_media',
        faseNem: (activity as any).faseNem || 'Fase 4',
        levelLabel: (activity as any).targetAge || 'Educación Básica',
        targetAge: (activity as any).targetAge || 'Nivel Escolar',
        description: activity.description || 'Resuelve el acertijo lógico analizando las reglas dadas.',
        problemLore: challengeData.problemLore || activity.description || 'Analiza el escenario y aplica pensamiento computacional.',
        pdaNem: (activity as any).pdaNem || 'Desarrolla habilidades de pensamiento lógico y algoritmia.',
        campoFormativo: (activity as any).campoFormativo || 'Saberes y Pensamiento Científico',
        badgeReward: (activity as any).badgeReward || { name: 'Pensador Algorítmico', icon: '🧠', description: '¡Reto de lógica superado!' },
        gamificationSettings: (activity as any).gamificationSettings || {
          timeLimitSeconds: 60,
          lives: 3,
          streakMultiplier: true,
          passScorePercentage: 75,
          xpBaseReward: 150,
          coinsReward: 30
        },
        logicType: challengeData.logicType || 'conditions',
        simulationConfig: challengeData.simulationConfig || {
          engine: 'circuit_gates',
          initialState: {},
          targetState: {},
          options: (activity.questions || []).map((q: any, i: number) => ({
            id: `opt-${i}`,
            label: q.question || `Opción ${i + 1}`,
            isCorrect: q.correctIndex === i,
            icon: '🔹',
            detail: q.explanation || ''
          }))
        },
        pedagogicalExplanation: challengeData.pedagogicalExplanation || 'Las computadoras procesan datos mediante reglas condicionales y algoritmos precisos.',
        classroomActivity: challengeData.classroomActivity || 'Prueba modelar este problema en el pizarrón con tus compañeros de clase.',
        hints: challengeData.hints || ['Examina las reglas paso a paso.', 'Verifica qué opciones rompen alguna restricción.']
      };

      return <LogicMathInteractivePlayer activity={preset} onClose={onClose} onComplete={onComplete} />;
    }

    switch (normTemplate) {
      case 'trivia':
        return <TriviaPlayer activity={activity} onClose={onClose} onComplete={onComplete} />;
      
      case 'memorama':
        return <MemoramaPlayer activity={activity} onClose={onClose} onComplete={onComplete} />;
      
      case 'ahorcado':
        return <AhorcadoPlayer activity={activity} onClose={onClose} onComplete={onComplete} />;
      
      case 'flashcards':
        return <FlashcardsPlayer activity={activity} onClose={onClose} onComplete={onComplete} />;

      default:
        return (
          <InteractiveUniversalGamePlayer
            activity={activity}
            templateType={templateType}
            onClose={onClose}
            onComplete={onComplete}
          />
        );
    }
  };

  return (
    <ErrorBoundary fallbackTitle="Nuestros duendes mágicos están ocupados, intenta de nuevo.">
      {renderGameComponent()}
    </ErrorBoundary>
  );
};
