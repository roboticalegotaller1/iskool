"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useStudentStore, useCurrentStudentStats, mapStudentIdToUuid, normalizeStudentId } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import { 
  X, Shield, Swords, Sparkles, Trophy, Coins, Star, Play, 
  CheckCircle2, XCircle, ChevronRight, Bold, Italic, List, Heading,
  Upload, FileImage, Mic, Timer, Heart, Award, Check
} from 'lucide-react';
import { StudioFlowPlayer } from '@/components/studio/player/StudioFlowPlayer';

// Dynamically load the PixiCombatView to avoid SSR hydration issues
const PixiCombatView = dynamic(() => import('./PixiCombatView'), { ssr: false });

// Retro Sound Chiptune Synth Player
const playChiptuneSound = (type: string) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const now = ctx.currentTime;
    
    if (type === 'charge') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.4);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    } else if (type === 'laser') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.3);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'hit') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(30, now + 0.25);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'victory') {
      const freqs = [261.63, 329.63, 392.00, 523.25];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.03, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.15);
      });
    }
  } catch (e) {
    console.warn("Chiptune sound failed:", e);
  }
};

export default function QuestCardModal() {
  // Store connection
  const activeQuest = useStudentStore(state => state.activeQuest);
  const isQuestModalOpen = useStudentStore(state => state.isQuestModalOpen);
  const closeQuestModal = useStudentStore(state => state.closeQuestModal);

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const stats = useCurrentStudentStats();

  const submitQuiz = useGamificationStore(state => state.submitQuiz);
  const submitExam = useGamificationStore(state => state.submitExam);
  const missionsList = useGamificationStore(state => state.missionsList);

  const submitPortfolioItem = usePortfolioStore(state => state.submitPortfolioItem);

  // Local state for RPG combat mechanics
  const [enemyHp, setEnemyHp] = useState(100);
  const [enemyMaxHp, setEnemyMaxHp] = useState(100);
  const [combatState, setCombatState] = useState<'intro' | 'active' | 'victory' | 'defeat'>('intro');
  const [showAnimation, setShowAnimation] = useState<'idle' | 'player_attack' | 'enemy_hurt' | 'victory'>('idle');

  // Interactive Pixi Canvas Combat State
  const [showCanvas, setShowCanvas] = useState(false);
  const [canvasCombatState, setCanvasCombatState] = useState<'idle' | 'attacking' | 'boss_hurt' | 'victory' | 'defeat'>('idle');
  const [showVictoryBanner, setShowVictoryBanner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Local state for Quizzes
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [timer, setTimer] = useState(30);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<any>(null);

  // Local state for Portfolio submission
  const [reflection, setReflection] = useState('');
  const [mockFile, setMockFile] = useState<{ type: 'image' | 'audio'; url: string; name?: string } | null>(null);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleRealFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const url = evt.target?.result as string;
      const isAudio = file.type.startsWith('audio');
      setMockFile({
        type: isAudio ? 'audio' : 'image',
        url: url,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Reset local states when activeQuest changes
  useEffect(() => {
    if (activeQuest) {
      const maxHp = activeQuest.type === 'exam' 
        ? ((activeQuest.content as import('@/types').ExamContent)?.bossHp || 180) 
        : (activeQuest.type === 'quiz' ? 80 : 120);
      setEnemyHp(maxHp);
      setEnemyMaxHp(maxHp);
      setCombatState('intro');
      setReflection('');
      setMockFile(null);
      setShowPortfolioForm(false);
      setCurrentQuestionIdx(0);
      setSelectedOptionIdx(null);
      setIsAnswerSubmitted(false);
      setCorrectCount(0);
      setTimer(30);
      setQuizAnswers({});
      setQuizResult(null);
      setShowAnimation('idle');
      setShowCanvas(false);
      setCanvasCombatState('idle');
      setShowVictoryBanner(false);
      setIsLoading(false);
    }
  }, [activeQuest]);

  // Quiz Timer countdown
  useEffect(() => {
    if (activeQuest && activeQuest.type === 'quiz' && combatState === 'active' && !isAnswerSubmitted && timer > 0 && !quizResult && !showCanvas) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0 && !isAnswerSubmitted && !quizResult && !showCanvas) {
      handleQuizAnswerSubmit(-1); // force incorrect on timeout
    }
  }, [timer, isAnswerSubmitted, combatState, activeQuest, quizResult, showCanvas]);

  if (!isQuestModalOpen || !activeQuest) return null;

  // Find the subject of the quest's mission
  const mission = missionsList.find(m => m.id === activeQuest.mission_id);
  const subjectId = mission?.subject_id || 'sub-math';
  const subjectLabel = subjectId === 'sub-math' ? 'Aritmancia' : 'Runas Antiguas';

  // --- NARRATIVE SYNOPSIS ---
  const getQuestSynopsis = () => {
    if (activeQuest.type === 'exam') {
      return `¡El Guardián Ancestral custodia el tesoro de ${subjectLabel}! Pon a prueba toda tu magia resolviendo este Grimorio de Examen. Cada hechizo fallido consumirá tu energía.`;
    }
    if (activeQuest.type === 'quiz') {
      return `Un duendecillo del bosque de ${subjectLabel} bloquea tu senda. Resuelve sus acertijos arcanos antes de que el reloj de arena se agote para debilitarlo.`;
    }
    return `Un Muro Rúnico impide tu avance en ${subjectLabel}. Para disiparlo, debes plasmar una evidencia académica física (pergamino o grabación de voz), reflexionar sobre lo aprendido e inscribirla en la piedra.`;
  };

  // --- COMBAT ANIMATION PIPELINE ---
  const triggerCombatSequence = async (onFinalize: () => Promise<void>) => {
    setShowCanvas(true);
    setCanvasCombatState('attacking');
    
    playChiptuneSound('charge');
    setTimeout(() => playChiptuneSound('laser'), 350);

    setTimeout(() => {
      setCanvasCombatState('boss_hurt');
      playChiptuneSound('hit');
      
      const hpSteps = 25;
      const stepDuration = 800 / hpSteps;
      const initialHp = enemyHp;
      let currentStep = 0;
      
      const interval = setInterval(() => {
        currentStep++;
        const newHp = Math.max(0, initialHp - Math.round((initialHp * currentStep) / hpSteps));
        setEnemyHp(newHp);
        
        if (currentStep >= hpSteps) {
          clearInterval(interval);
        }
      }, stepDuration);
    }, 1000);

    setTimeout(() => {
      setCanvasCombatState('victory');
      playChiptuneSound('victory');
      setShowVictoryBanner(true);
    }, 1800);

    setTimeout(async () => {
      setShowVictoryBanner(false);
      setIsLoading(true);
      
      try {
        await onFinalize();
      } catch (err) {
        console.error("Combat sequence database finalization error:", err);
      } finally {
        setIsLoading(false);
        setCombatState('victory');
        setShowCanvas(false);
      }
    }, 3800);
  };

  // --- ATAQUES / ACCIONES DE ENVÍO ---

  // 1. Enviar respuesta del Quiz
  const handleQuizAnswerSubmit = (optionIdx: number) => {
    if (isLoading || isAnswerSubmitted) return;
    setSelectedOptionIdx(optionIdx);
    setIsAnswerSubmitted(true);

    const questions = (activeQuest.content as any).questions || [];
    const currentQuestion = questions[currentQuestionIdx];
    const isCorrect = optionIdx === currentQuestion.correctAnswerIndex;

    setQuizAnswers(prev => ({ ...prev, [currentQuestion.id]: optionIdx }));

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
      setShowAnimation('player_attack');
      setTimeout(() => {
        setShowAnimation('enemy_hurt');
        const dmg = Math.round(enemyMaxHp / questions.length);
        setEnemyHp(prev => Math.max(0, prev - dmg));
        setTimeout(() => setShowAnimation('idle'), 800);
      }, 600);
    } else {
      setShowAnimation('idle');
    }
  };

  // Ir a la siguiente pregunta del Quiz o terminar
  const handleQuizNextQuestion = async () => {
    if (isLoading) return;
    const questions = (activeQuest.content as any).questions || [];
    
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOptionIdx(null);
      setIsAnswerSubmitted(false);
      setTimer(30);
    } else {
      const score = Math.round((correctCount / questions.length) * 100);
      const isPass = score >= 60;

      if (isPass) {
        const onFinalize = async () => {
          try {
            const submissionData = {
              student_id: activeStudentId,
              quest_id: activeQuest.id,
              reflection: `Desafío mágico resuelto (${correctCount}/${questions.length} hechizos correctos)`,
              file_url: '',
              file_type: 'document',
              score: score,
              xp_reward: activeQuest.xp_reward,
              coins_reward: activeQuest.coins_reward,
              created_at: new Date().toISOString()
            };
            const { error: subErr } = await supabase.from('submissions').insert(submissionData);
            
            if (subErr) {
              await supabase.from('portfolio_items').insert({
                student_id: activeStudentId,
                subject_id: subjectId,
                quest_id: activeQuest.id,
                title: activeQuest.title,
                description: activeQuest.description,
                file_url: '',
                file_type: 'document',
                self_reflection: `Desafío mágico resuelto (${correctCount}/${questions.length} hechizos correctos)`,
                status: 'submitted'
              });
            }

            showToast(`✨ ¡Desafío completado! Has obtenido +${activeQuest.xp_reward} XP y +${activeQuest.coins_reward} Monedas.`);
          } catch (e) {
            console.warn("Supabase database sync threw an error:", e);
            showToast('⚠️ Progreso guardado localmente con éxito.');
          }

          let result;
          if (activeQuest.type === 'exam') {
            result = await submitExam(
              activeQuest.id,
              score,
              quizAnswers,
              (activeQuest.content as any).statBoost,
              (activeQuest.content as any).customLoot
            );
          } else {
            result = await submitQuiz(activeQuest.id, score, quizAnswers);
          }
          setQuizResult(result);
        };

        await triggerCombatSequence(onFinalize);
      } else {
        setCombatState('defeat');
        showToast('❌ No has alcanzado el puntaje mínimo. ¡Reintenta el desafío!');
      }
    }
  };

  // 2. Enviar evidencia de Portafolio
  const handlePortfolioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockFile || !reflection || isLoading) return;

    const onFinalize = async () => {
      try {
        const submissionData = {
          student_id: activeStudentId,
          quest_id: activeQuest.id,
          reflection: reflection,
          file_url: mockFile.url,
          file_type: mockFile.type,
          score: 100,
          xp_reward: activeQuest.xp_reward,
          coins_reward: activeQuest.coins_reward,
          created_at: new Date().toISOString()
        };
        const { error: subErr } = await supabase.from('submissions').insert(submissionData);
        
        if (subErr) {
          await supabase.from('portfolio_items').insert({
            student_id: activeStudentId,
            subject_id: subjectId,
            quest_id: activeQuest.id,
            title: activeQuest.title,
            description: activeQuest.description,
            file_url: mockFile.url,
            file_type: mockFile.type,
            self_reflection: reflection,
            status: 'submitted'
          });
        }

        const dbStudentId = mapStudentIdToUuid(activeStudentId);
        const { data, error } = await supabase.rpc('process_reward', {
          p_student_id: dbStudentId,
          p_xp_change: activeQuest.xp_reward,
          p_coins_change: activeQuest.coins_reward
        });

        if (error) {
          console.error("Error processing portfolio reward in Supabase:", error.message);
        } else if (data) {
          useStudentStore.setState((state) => ({
            allStats: {
              ...state.allStats,
              [activeStudentId]: {
                ...state.allStats[activeStudentId],
                ...data,
                student_id: activeStudentId
              },
              [normalizeStudentId(activeStudentId)]: {
                ...state.allStats[normalizeStudentId(activeStudentId)],
                ...data,
                student_id: normalizeStudentId(activeStudentId)
              }
            }
          }));
        }

        showToast('📜 ¡Evidencia inscrita con éxito en tu Portafolio y recompensas otorgadas!');
      } catch (e) {
        console.warn("Supabase database sync threw an error:", e);
        showToast('✨ Evidencia guardada en el portafolio local.');
      }

      submitPortfolioItem(
        activeQuest.title,
        activeQuest.description,
        mockFile.url,
        mockFile.type,
        reflection,
        activeQuest.id,
        subjectId
      );
    };

    triggerCombatSequence(onFinalize);
  };

  // Subida de archivos reales y simulación de respaldo
  const simulateFileUpload = (type: 'image' | 'audio') => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
    const mockUrls = {
      image: '/files/mock_reflection.png',
      audio: '/files/mock_audio.mp3'
    };
    if (!mockFile) {
      setMockFile({
        type,
        url: mockUrls[type],
        name: type === 'image' ? 'evidencia_foto.png' : 'evidencia_lectura.mp3'
      });
    }
  };

  // Editor Markdown helpers
  const insertFormat = (format: 'bold' | 'italic' | 'list' | 'header') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);
    let replacement = '';
    if (format === 'bold') replacement = `**${selected || 'texto'}**`;
    else if (format === 'italic') replacement = `*${selected || 'texto'}*`;
    else if (format === 'list') replacement = `\n- ${selected || 'elemento'}`;
    else if (format === 'header') replacement = `\n### ${selected || 'título'}`;
    
    setReflection(text.substring(0, start) + replacement + text.substring(end));
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    }, 50);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-zinc-950/85 backdrop-blur-md transition-all duration-300">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[250] bg-purple-950/90 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/50 font-bold text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Magic Spellbook / Parchment style RPG Container */}
      <div 
        className="relative w-full max-w-2xl bg-gradient-to-b from-purple-950/90 via-stone-900/95 to-slate-950/95 border-2 border-amber-600/40 backdrop-blur-xl rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.25)] flex flex-col p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200"
        style={{
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 1px 2px rgba(255,255,255,0.08)'
        }}
      >
        {/* Floating background gradient light */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button 
          type="button"
          onClick={closeQuestModal}
          disabled={isLoading || showCanvas}
          aria-label="Cerrar ventana del desafío"
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-950 border border-amber-700/30 hover:bg-stone-900 text-amber-500 hover:text-amber-400 transition-all shadow disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Level Indicator Tag */}
        <div className="flex items-center gap-1.5 bg-amber-950/45 border border-amber-500/30 px-3 py-1 rounded-full w-max text-[9.5px] font-black uppercase text-amber-400 tracking-widest font-serif">
          <Shield className="h-3.5 w-3.5" />
          Materia: {subjectLabel}
        </div>

        {/* MAIN PANEL */}
        {combatState === 'intro' ? (
          // --- INTRO SCREEN (BOSS CARD VIEW) ---
          <div className="flex flex-col gap-6 mt-4 flex-1">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              
              {/* Enemy Portrait / Visual representation */}
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-2xl border border-amber-600/30 bg-stone-950/90 flex items-center justify-center relative shadow-inner overflow-hidden shrink-0 mx-auto ${
                showAnimation === 'enemy_hurt' ? 'animate-bounce border-red-500 bg-red-950/20' : 'animate-pulse'
              }`}>
                {activeQuest.type === 'exam' ? (
                  <span className="text-6xl select-none">👑</span>
                ) : activeQuest.type === 'quiz' ? (
                  <span className="text-6xl select-none">👾</span>
                ) : (
                  <span className="text-6xl select-none">🧱</span>
                )}
                
                {/* Floating HP Tag */}
                <div className="absolute top-2 left-2 bg-purple-950/80 border border-purple-500/50 text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-purple-300 font-serif">
                  DESAFÍO
                </div>
              </div>

              {/* Enemy Info Sheet */}
              <div className="flex-1 flex flex-col gap-3 text-left w-full">
                <div>
                  <h3 className="text-2xl font-serif text-amber-100 tracking-wide">{activeQuest.title}</h3>
                  <p className="text-xs text-stone-400 mt-1 font-medium leading-relaxed">{activeQuest.description}</p>
                </div>

                {/* HP BAR (Difficulty representation) */}
                <div className="flex flex-col gap-1 bg-stone-950/40 border border-stone-850 p-3 rounded-2xl shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-black text-amber-500 uppercase tracking-widest font-serif">
                    <span>Resistencia Mágica</span>
                    <span>{enemyHp} / {enemyMaxHp} HP</span>
                  </div>
                  <div className="h-2 w-full bg-stone-950 rounded-full overflow-hidden border border-stone-800">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-300"
                      style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Rewards Sheet */}
                <div className="flex gap-4 p-3 bg-stone-950/40 border border-stone-900 rounded-xl text-xs font-black">
                  <span className="text-[9px] text-stone-500 uppercase tracking-wider block self-center">Recompensa del Gremio:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-purple-400 flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current" />
                      +{activeQuest.xp_reward} Puntos de Casa
                    </span>
                    <span className="text-amber-500 flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 fill-current" />
                      +{activeQuest.coins_reward} Galeones
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Synopsis Narrative */}
            <div className="bg-stone-950/40 p-4 rounded-2xl border border-amber-950/40 text-left">
              <span className="text-[8.5px] font-black text-amber-500 uppercase tracking-widest block mb-1 font-serif">Relato del Hechicero</span>
              <p className="text-xs text-stone-300 italic leading-relaxed font-serif">
                "{getQuestSynopsis()}"
              </p>
            </div>

            {/* CTA to start battle */}
            <button
              type="button"
              onClick={() => setCombatState('active')}
              disabled={isLoading}
              aria-label={activeQuest.type === 'exam' ? 'Enfrentar al jefe del examen' : 'Preparar hechizo del desafío'}
              className="mt-4 w-full py-4 bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 hover:from-amber-500 hover:to-yellow-500 hover:shadow-[0_0_25px_rgba(245,158,11,0.45)] hover:scale-[1.01] active:scale-[0.98] transition-all duration-350 font-serif font-black text-xs uppercase tracking-widest text-stone-950 rounded-2xl flex items-center justify-center gap-2 border border-amber-500/30 cursor-pointer disabled:opacity-50"
            >
              <Swords className="h-4.5 w-4.5 animate-pulse" />
              {activeQuest.type === 'exam' ? 'ENFRENTAR AL JEFE' : '¡PREPARAR HECHIZO!'}
            </button>
          </div>

        ) : combatState === 'active' ? (
          // --- ACTIVE SCREEN (THE ATTACK FORM / QUIZ FIELD) ---
          <div className="flex flex-col gap-6 mt-4 flex-1">
            
            {/* HUD Status Bar in Combat */}
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-left">
                <span className="text-2xl">✨</span>
                <div>
                  <span className="text-[9px] font-black text-amber-500 uppercase tracking-wider font-serif">Combate de Hechizos</span>
                  <h4 className="text-xs font-serif text-amber-100 leading-tight">{activeQuest.title}</h4>
                </div>
              </div>

              {/* Mini HP bar */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end text-[9px] font-bold text-amber-500 font-serif">
                  <span>Resistencia {enemyHp}/{enemyMaxHp} HP</span>
                  <div className="h-1.5 w-20 bg-stone-950 border border-stone-850 rounded-full mt-0.5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-600 to-yellow-500 transition-all duration-300"
                      style={{ width: `${(enemyHp / enemyMaxHp) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Animation Canvas and Form Toggle */}
            {showCanvas ? (
              // --- GRAPHICAL COMBAT CANVAS VIEW ---
              <div className="relative w-full h-[240px] md:h-[300px] rounded-2xl overflow-hidden border border-amber-600/30 bg-stone-950 shadow-2xl">
                <PixiCombatView
                  combatState={canvasCombatState}
                  volume={1}
                  guildBoss={{
                    hp_actual: enemyHp,
                    hp_max: enemyMaxHp,
                    name: activeQuest.title,
                    xp_reward: activeQuest.xp_reward
                  }}
                  partyHp={100}
                  elenaSub={undefined}
                  playSound={playChiptuneSound}
                  onAttackFinish={() => {}}
                />
                
                {/* Victory Banner Overlay inside Canvas */}
                {showVictoryBanner && (
                  <div className="absolute inset-0 z-35 bg-stone-950/80 flex flex-col items-center justify-center animate-in fade-in duration-300">
                    <span className="text-5xl md:text-6xl font-serif text-amber-400 tracking-wider animate-bounce select-none drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]">
                      ¡VICTORIA!
                    </span>
                    <span className="text-[10px] font-bold text-stone-400 tracking-widest uppercase mt-2 font-serif">
                      Hechizo Dominado con Éxito
                    </span>
                  </div>
                )}
                
                {/* Loading database spinner overlay inside Canvas */}
                {isLoading && (
                  <div className="absolute inset-0 z-45 bg-stone-950/85 flex flex-col items-center justify-center text-amber-500 font-serif text-xs tracking-widest gap-3">
                    <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
                    <span>INSCRIBIENDO EN EL GRIMORIO DE LA ACADEMIA...</span>
                  </div>
                )}
              </div>
            ) : (
              // --- FORM AND SUBMISSION VIEWS ---
              <div className="relative w-full rounded-2xl overflow-hidden border border-stone-850 bg-stone-950/80 p-1 flex justify-center items-center">
                {showAnimation === 'player_attack' && (
                  <div className="absolute inset-0 z-10 bg-purple-500/10 mix-blend-screen flex items-center justify-center animate-ping">
                    <span className="text-4xl text-amber-400 drop-shadow-[0_0_10px_#D97706] font-serif">🔮 HECHIZO</span>
                  </div>
                )}
                {showAnimation === 'enemy_hurt' && (
                  <div className="absolute inset-0 z-10 bg-amber-500/10 mix-blend-color-dodge flex items-center justify-center animate-bounce">
                    <span className="text-4xl text-red-500 drop-shadow-[0_0_10px_#EF4444] font-serif">💥 IMPACTO</span>
                  </div>
                )}

                {/* Render Quest Types */}
                {(activeQuest.content as any)?.blocks && (activeQuest.content as any).blocks.length > 0 ? (
                  // --- STUDIO FLOW PLAYER VIEW (FULL INTERACTIVE EXPERIENCES) ---
                  <div className="w-full p-2">
                    <StudioFlowPlayer
                      blocks={(activeQuest.content as any).blocks}
                      connections={(activeQuest.content as any).connections || []}
                      startNodeId={(activeQuest.content as any).startNodeId || null}
                      metadata={(activeQuest.content as any).metadata || { title: activeQuest.title, description: activeQuest.description }}
                      onClose={closeQuestModal}
                      onComplete={async (score) => {
                        setIsLoading(true);
                        try {
                          if (score >= 60) {
                            const onFinalize = async () => {
                              const result = await submitQuiz(activeQuest.id, score, { studio_completed: score });
                              setQuizResult(result);
                              showToast(`✨ ¡Actividad completada! +${activeQuest.xp_reward} XP y +${activeQuest.coins_reward} Monedas.`);
                            };
                            await triggerCombatSequence(onFinalize);
                          } else {
                            setCombatState('defeat');
                            showToast('❌ Puntaje insuficiente. ¡Reintenta la actividad!');
                          }
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    />
                  </div>
                ) : activeQuest.type === 'quiz' || activeQuest.type === 'exam' ? (
                  // --- QUIZ GAME FIELD ---
                  <div className="w-full p-4 flex flex-col gap-4 text-left">
                    {/* Quest progress & Timer */}
                    <div className="flex justify-between items-center text-[10px] font-black text-stone-400 font-serif border-b border-stone-900 pb-2">
                      <span>PREGUNTA {currentQuestionIdx + 1} DE {((activeQuest.content as any).questions || []).length}</span>
                      <span className={`px-2 py-0.5 rounded border flex items-center gap-1 ${
                        timer <= 5 ? 'bg-red-950/60 border-red-500 text-red-405 animate-pulse' : 'bg-stone-900 border-stone-800 text-stone-300'
                      }`}>
                        <Timer className="h-3 w-3" />
                        {timer}s
                      </span>
                    </div>

                    {/* Question Title */}
                    <h3 className="text-md font-serif text-stone-200">
                      {((activeQuest.content as any).questions || [])[currentQuestionIdx]?.question}
                    </h3>

                    {/* Multiple Choice Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                      {((activeQuest.content as any).questions || [])[currentQuestionIdx]?.options.map((opt: string, idx: number) => {
                        const isCorrect = idx === ((activeQuest.content as any).questions || [])[currentQuestionIdx]?.correctAnswerIndex;
                        const isSelected = selectedOptionIdx === idx;
                        
                        let btnStyle = 'border-stone-850 bg-stone-950/40 hover:bg-stone-900/60 text-stone-300 hover:text-white';
                        
                        if (isAnswerSubmitted) {
                          if (isCorrect) {
                            btnStyle = 'border-emerald-500/80 bg-emerald-950/20 text-emerald-400';
                          } else if (isSelected) {
                            btnStyle = 'border-red-500/80 bg-red-950/20 text-red-400';
                          } else {
                            btnStyle = 'border-stone-900 opacity-40';
                          }
                        } else if (isSelected) {
                          btnStyle = 'border-amber-500/80 bg-amber-950/25 text-white';
                        }

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isAnswerSubmitted || isLoading}
                            onClick={() => handleQuizAnswerSubmit(idx)}
                            aria-label={`Opción ${String.fromCharCode(65 + idx)}: ${opt}`}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border text-left font-serif text-xs transition-all cursor-pointer disabled:cursor-not-allowed ${btnStyle}`}
                          >
                            <span className="h-5 w-5 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-[10px] font-black text-amber-500 shrink-0">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <span className="truncate">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Formative Feedback Text */}
                    {isAnswerSubmitted && (
                      <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 mt-2 animate-fade-in ${
                        selectedOptionIdx === ((activeQuest.content as any).questions || [])[currentQuestionIdx]?.correctAnswerIndex
                          ? 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400'
                          : 'border-red-500/20 bg-red-950/10 text-red-400'
                      }`}>
                        {selectedOptionIdx === ((activeQuest.content as any).questions || [])[currentQuestionIdx]?.correctAnswerIndex ? (
                          <CheckCircle2 className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-[8.5px] font-black uppercase tracking-wider text-stone-500 mb-0.5 font-serif">Bitácora del Hechicero</p>
                          <p className="text-xs leading-normal text-stone-300 font-serif italic">
                            {((activeQuest.content as any).questions || [])[currentQuestionIdx]?.explanation}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Next Question / Action */}
                    {isAnswerSubmitted && (
                      <div className="flex justify-end mt-2">
                        <button
                          type="button"
                          onClick={handleQuizNextQuestion}
                          disabled={isLoading}
                          aria-label={currentQuestionIdx < ((activeQuest.content as any).questions || []).length - 1 ? 'Ir a la siguiente pregunta' : 'Finalizar aventura y guardar'}
                          className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-serif font-black text-xs flex items-center gap-1.5 shadow cursor-pointer disabled:opacity-50"
                        >
                          {currentQuestionIdx < ((activeQuest.content as any).questions || []).length - 1 ? 'Siguiente Pregunta' : 'Finalizar Aventura'}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}

                  </div>
                ) : (
                  // --- PORTFOLIO EVIDENCE AREA ---
                  <div className="w-full p-4 flex flex-col gap-4 text-left">
                    {/* Instructions */}
                    <div className="p-3 bg-stone-950 border border-stone-900 rounded-xl">
                      <span className="text-[8.5px] font-black text-stone-500 uppercase tracking-widest block mb-1 font-serif">Instrucciones del maestro</span>
                      <p className="text-xs text-stone-300 whitespace-pre-line leading-relaxed font-semibold">
                        {(activeQuest.content as any).instructions}
                      </p>
                    </div>

                    {!showPortfolioForm ? (
                      <button
                        type="button"
                        onClick={() => setShowPortfolioForm(true)}
                        disabled={isLoading}
                        aria-label="Preparar grimorio escolar y evidencia"
                        className="w-full py-4 rounded-xl font-serif font-black text-xs text-stone-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 uppercase tracking-widest transition-all duration-200 border border-amber-300 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
                      >
                        <span>Preparar grimorio escolar</span>
                        <Shield className="h-4 w-4 fill-stone-950 text-stone-950" />
                      </button>
                    ) : (
                      <form onSubmit={handlePortfolioSubmit} className="flex flex-col gap-4">
                        {/* Markdown reflection box */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[9.5px] font-black text-stone-500 uppercase tracking-wider font-serif">Tu Respuesta (Reflexión académica)</label>
                          
                          <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-850 rounded-t-xl border-b-0">
                            <button
                              type="button"
                              onClick={() => insertFormat('bold')}
                              aria-label="Formato negrita"
                              className="p-1 rounded hover:bg-stone-905 text-stone-400 hover:text-white cursor-pointer"
                              title="Negrita"
                            >
                              <Bold className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormat('italic')}
                              aria-label="Formato cursiva"
                              className="p-1 rounded hover:bg-stone-905 text-stone-400 hover:text-white cursor-pointer"
                              title="Cursiva"
                            >
                              <Italic className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormat('list')}
                              aria-label="Formato lista con viñetas"
                              className="p-1 rounded hover:bg-stone-905 text-stone-400 hover:text-white cursor-pointer"
                              title="Lista"
                            >
                              <List className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormat('header')}
                              aria-label="Formato encabezado"
                              className="p-1 rounded hover:bg-stone-905 text-stone-400 hover:text-white cursor-pointer"
                              title="Título"
                            >
                              <Heading className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <textarea
                            ref={textareaRef}
                            value={reflection}
                            onChange={(e) => setReflection(e.target.value)}
                            required
                            disabled={isLoading}
                            placeholder="Inscribe en este pergamino qué hiciste en la actividad y tu reflexión sobre lo que aprendiste."
                            className="w-full text-xs p-3 rounded-b-xl border border-stone-850 bg-stone-950 focus:border-amber-500 focus:outline-none min-h-[90px] text-stone-100 font-serif leading-relaxed disabled:opacity-50"
                          />
                        </div>

                        {/* Mock File Uploader */}
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[9.5px] font-black text-stone-500 uppercase tracking-wider font-serif">Adjuntar Evidencia</span>
                          
                          {!mockFile ? (
                            <div className="border border-dashed border-stone-850 bg-stone-950/45 rounded-xl p-4 text-center flex flex-col items-center gap-2">
                              <Upload className="h-5 w-5 text-stone-650" />
                              <p className="text-[10px] text-stone-500 font-medium">Adjunta imágenes o grabaciones</p>
                              
                              <div className="flex gap-2 mt-1">
                                {((activeQuest.content as any).acceptedFormats || []).includes('image') && (
                                  <button
                                    type="button"
                                    onClick={() => simulateFileUpload('image')}
                                    disabled={isLoading}
                                    aria-label="Adjuntar foto o dibujo"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-850 hover:border-stone-800 text-[10px] font-black bg-stone-950 text-stone-400 font-serif cursor-pointer disabled:opacity-50"
                                  >
                                    <FileImage className="h-3.5 w-3.5 text-emerald-400" />
                                    Foto / Dibujo
                                  </button>
                                )}
                                {((activeQuest.content as any).acceptedFormats || []).includes('audio') && (
                                  <button
                                    type="button"
                                    onClick={() => simulateFileUpload('audio')}
                                    disabled={isLoading}
                                    aria-label="Grabar o adjuntar audio"
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-stone-850 hover:border-stone-800 text-[10px] font-black bg-stone-950 text-stone-400 font-serif cursor-pointer disabled:opacity-50"
                                  >
                                    <Mic className="h-3.5 w-3.5 text-purple-400" />
                                    Grabar Audio
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="border border-emerald-500/20 bg-emerald-950/15 rounded-xl p-3 flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                {mockFile.type === 'image' ? <FileImage className="h-4.5 w-4.5 text-emerald-455" /> : <Mic className="h-4.5 w-4.5 text-purple-455" />}
                                <span className="text-xs font-bold text-stone-200">
                                  {mockFile.type === 'image' ? 'evidencia_foto.png' : 'evidencia_lectura.mp3'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setMockFile(null)}
                                disabled={isLoading}
                                aria-label="Remover archivo adjunto"
                                className="text-[10px] text-red-500 hover:underline font-bold cursor-pointer disabled:opacity-50"
                              >
                                Remover
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Selector de archivos nativo oculto */}
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleRealFileChange} 
                          accept="image/*,audio/*" 
                          className="hidden" 
                        />

                        {/* Launch Attack Button con alto contraste y visibilidad */}
                        <button
                          type="submit"
                          disabled={!mockFile || !reflection || isLoading}
                          aria-label="Lanzar hechizo y guardar evidencia"
                          className={`w-full mt-3 py-3.5 font-serif font-black text-xs uppercase tracking-widest transition-all rounded-xl border ${
                            !mockFile || !reflection || isLoading
                              ? 'bg-stone-900 text-stone-300 border-stone-700 opacity-90 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 border-amber-400 shadow-lg shadow-amber-500/25 cursor-pointer'
                          }`}
                        >
                          {isLoading ? 'INSCRIBIENDO HECHIZO...' : '¡LANZAR HECHIZO!'}
                        </button>
                        {(!mockFile || !reflection) && (
                          <p className="text-[10px] text-amber-300/90 font-sans font-semibold text-center mt-1.5">
                            ⚠️ Completa tu reflexión y adjunta evidencia para habilitar el botón de envío.
                          </p>
                        )}
                      </form>
                    )}

                  </div>
                )}

              </div>
            )}
          </div>

        ) : combatState === 'victory' ? (
          // --- VICTORY SCREEN ---
          <div className="flex flex-col gap-6 items-center justify-center text-center mt-4 p-4 flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/25 blur-xl rounded-full" />
              <div className="h-16 w-16 bg-emerald-950 border border-emerald-500 text-emerald-400 rounded-full flex items-center justify-center relative z-10 animate-bounce">
                <Award className="h-8 w-8" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase font-serif">
                ¡CONTRATO CUMPLIDO!
              </span>
              <h3 className="text-2xl font-serif text-white mt-1">¡Hechizo Dominado!</h3>
              <p className="text-xs text-stone-450 max-w-sm mt-2 leading-relaxed font-serif italic">
                Tu ataque mágico ha sido súper efectivo. Tu pergamino académico ha sido inscripto en tu Portafolio del Gremio.
              </p>
            </div>

            {/* Loot summary */}
            <div className="bg-stone-950 border border-stone-900 rounded-2xl p-4 w-full max-w-xs flex flex-col gap-2">
              <span className="text-[8.5px] font-black text-stone-500 uppercase tracking-widest font-serif">BOTÍN EXTRAÍDO</span>
              <div className="flex justify-center items-center gap-4 font-black text-sm">
                <span className="text-purple-400 flex items-center gap-1 font-serif">
                  <Star className="h-4 w-4 fill-current" />
                  +{activeQuest.xp_reward} Puntos de Casa
                </span>
                <span className="text-amber-500 flex items-center gap-1 font-serif">
                  <Coins className="h-4 w-4 fill-current text-amber-500" />
                  +{activeQuest.coins_reward} Galeones
                </span>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closeQuestModal}
              disabled={isLoading}
              aria-label="Regresar al mapa de aventuras"
              className="px-6 py-2.5 bg-stone-900 hover:bg-stone-850 text-stone-200 hover:text-white rounded-xl text-xs font-serif font-bold transition-all border border-stone-800 cursor-pointer disabled:opacity-50"
            >
              Regresar al Mapa
            </button>
          </div>

        ) : (
          // --- DEFEAT SCREEN ---
          <div className="flex flex-col gap-6 items-center justify-center text-center mt-4 p-4 flex-1">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/25 blur-xl rounded-full" />
              <div className="h-16 w-16 bg-red-950 border border-red-500 text-red-550 rounded-full flex items-center justify-center relative z-10 animate-pulse">
                <XCircle className="h-8 w-8" />
              </div>
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest text-red-400 uppercase font-serif">
                MAGIA AGOTADA
              </span>
              <h3 className="text-2xl font-serif text-white mt-1">¡Hechizo Fallido!</h3>
              <p className="text-xs text-stone-450 max-w-sm mt-2 leading-relaxed font-serif italic">
                No has logrado disipar las runas del guardián. Repasa tus grimorios de estudio y reintenta conjurar el hechizo.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setCombatState('active');
                  setTimer(30);
                  setCurrentQuestionIdx(0);
                  setSelectedOptionIdx(null);
                  setIsAnswerSubmitted(false);
                  setCorrectCount(0);
                  setQuizAnswers({});
                }}
                disabled={isLoading}
                aria-label="Reintentar conjuro del desafío"
                className="px-6 py-2.5 bg-gradient-to-r from-red-750 to-rose-750 hover:from-red-650 hover:to-rose-650 text-white rounded-xl text-xs font-serif font-black transition-all cursor-pointer disabled:opacity-50"
              >
                Reintentar Conjuro
              </button>
              <button
                type="button"
                onClick={closeQuestModal}
                disabled={isLoading}
                aria-label="Salir del desafío"
                className="px-5 py-2.5 bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-white rounded-xl text-xs font-serif font-bold transition-all border border-stone-800 cursor-pointer disabled:opacity-50"
              >
                Salir
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
