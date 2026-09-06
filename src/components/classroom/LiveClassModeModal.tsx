"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useClassroomStore } from '@/store/useClassroomStore';
import { useStudentStore } from '@/store/useStudentStore';
import { DETAILED_STUDENTS_SEED } from '@/store/seeds';
import { 
  X, 
  Sparkles, 
  Trophy, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Users, 
  Volume2, 
  VolumeX, 
  Zap, 
  CheckCircle2, 
  BarChart2, 
  Coins, 
  Flame, 
  Smile, 
  Award,
  Maximize2,
  Minimize2,
  Radio,
  Vote,
  Disc,
  Shuffle,
  Star,
  Check,
  Filter,
  RefreshCw,
  UserCheck,
  Bell,
  Sliders,
  Plus,
  Minus,
  AlertTriangle,
  Music,
  StopCircle,
  Edit3,
  Trash2
} from 'lucide-react';

interface Props {
  onClose: () => void;
}

interface NormalizedStudent {
  id: string;
  name: string;
  groupName: string;
  groupId: string;
  grade: string;
  level: string;
  photoUrl?: string;
  bloodType?: string;
  status: string;
}

// 5 Niveles de Sonido (del silencio al más intenso)
export type TimerSoundProfile = 'silent' | 'zen' | 'magic' | 'digital' | 'epic';

interface SoundOption {
  id: TimerSoundProfile;
  level: string;
  name: string;
  icon: string;
}

const TIMER_SOUND_OPTIONS: SoundOption[] = [
  { id: 'silent', level: 'Nivel 0', name: 'Silencio (Visual)', icon: '🔇' },
  { id: 'zen', level: 'Nivel 1', name: 'Campana Zen', icon: '🔔' },
  { id: 'magic', level: 'Nivel 2', name: 'Campanadas Mágicas', icon: '✨' },
  { id: 'digital', level: 'Nivel 3', name: 'Alarma Digital', icon: '⚡' },
  { id: 'epic', level: 'Nivel 4', name: '¡Sirena Épica!', icon: '🚨' }
];

interface TimePreset {
  label: string;
  badge: string;
  sec: number;
  icon: string;
}

const TIMER_PRESETS: TimePreset[] = [
  { label: '30 Segundos', badge: 'Flash', sec: 30, icon: '⚡' },
  { label: '1 Minuto', badge: 'Express', sec: 60, icon: '⚡' },
  { label: '3 Minutos', badge: 'Rápido', sec: 180, icon: '⏱️' },
  { label: '5 Minutos', badge: 'Dinámica', sec: 300, icon: '⏱️' },
  { label: '10 Minutos', badge: 'Equipo', sec: 600, icon: '👥' },
  { label: '15 Minutos', badge: 'Grupal', sec: 900, icon: '👥' },
  { label: '25 Minutos', badge: 'Pomodoro', sec: 1500, icon: '🎯' },
  { label: '45 Minutos', badge: 'Clase', sec: 2700, icon: '📚' }
];

export const LiveClassModeModal: React.FC<Props> = ({ onClose }) => {
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const groupsList = useSchoolAdminStore(state => state.groupsList);
  const { 
    selectedGroupId, 
    setSelectedGroupId,
    logHeroPicker, 
    activeLivePoll, 
    startLivePoll, 
    voteLivePoll, 
    closeLivePoll 
  } = useClassroomStore();

  const [activeTab, setActiveTab] = useState<'picker' | 'timer' | 'poll'>('picker');
  const [rouletteMode, setRouletteMode] = useState<'wheel' | 'cards'>('wheel');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Normalización exhaustiva de alumnos para evitar campos indefinidos
  const allNormalizedStudents: NormalizedStudent[] = useMemo(() => {
    const sourceList = (detailedStudents && detailedStudents.length > 0) 
      ? detailedStudents 
      : DETAILED_STUDENTS_SEED;

    return sourceList.map((s, idx) => {
      const gId = (s as any).group_id || (s as any).groupId || 'grp-pa-a';
      const matchedGroup = groupsList.find(g => g.id === gId);
      
      const firstName = (s as any).first_name || (s as any).name || `Estudiante`;
      const lastName = (s as any).last_name_1 || (s as any).lastName || `${idx + 1}`;
      const fullName = (s as any).name || `${firstName} ${lastName}`.trim();
      
      const groupDisplayName = matchedGroup 
        ? `${matchedGroup.grade} "${matchedGroup.name}" - ${matchedGroup.level === 'primaria' ? 'Primaria' : matchedGroup.level === 'secundaria' ? 'Secundaria' : 'Preparatoria'}`
        : ((s as any).grade ? `${(s as any).grade} - ${(s as any).level || 'Primaria'}` : 'Grupo General');

      return {
        id: s.id || `std-${idx}`,
        name: fullName,
        groupName: groupDisplayName,
        groupId: gId,
        grade: (s as any).grade || '4º',
        level: (s as any).level || 'primaria',
        photoUrl: (s as any).photo_url || (s as any).photoUrl,
        bloodType: (s as any).blood_type,
        status: (s as any).status || 'activo'
      };
    });
  }, [detailedStudents, groupsList]);

  // Alumnos del grupo seleccionado
  const [excludeAlreadyPicked, setExcludeAlreadyPicked] = useState(false);
  const [sessionPickedHistory, setSessionPickedHistory] = useState<NormalizedStudent[]>([]);

  const eligibleStudents = useMemo(() => {
    let list = allNormalizedStudents;
    if (selectedGroupId && selectedGroupId !== 'all') {
      const filtered = list.filter(s => s.groupId === selectedGroupId);
      if (filtered.length > 0) {
        list = filtered;
      }
    }
    if (excludeAlreadyPicked) {
      const pickedIds = new Set(sessionPickedHistory.map(p => p.id));
      const remaining = list.filter(s => !pickedIds.has(s.id));
      if (remaining.length > 0) {
        return remaining;
      }
    }
    return list;
  }, [allNormalizedStudents, selectedGroupId, excludeAlreadyPicked, sessionPickedHistory]);

  // === 1. ESTADOS DE LA RULETA ===
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<NormalizedStudent | null>(null);
  const [rewardGranted, setRewardGranted] = useState(false);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [previewingIndex, setPreviewingIndex] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  // Colores para la rueda SVG
  const WHEEL_COLORS = [
    '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', 
    '#ec4899', '#06b6d4', '#f97316', '#6366f1',
    '#14b8a6', '#e11d48', '#84cc16', '#a855f7'
  ];

  // === 2. ESTADOS DEL TEMPORIZADOR ===
  const [timerSeconds, setTimerSeconds] = useState(300); // 5 min
  const [initialTimerSeconds, setInitialTimerSeconds] = useState(300);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [selectedTimerSound, setSelectedTimerSound] = useState<TimerSoundProfile>('digital');
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [isCustomizingTime, setIsCustomizingTime] = useState(false);
  const [customInputMins, setCustomInputMins] = useState(5);
  const [customInputSecs, setCustomInputSecs] = useState(0);
  const [previewPlayingSound, setPreviewPlayingSound] = useState<TimerSoundProfile | null>(null);

  // Referencia para cancelar la alarma de 5 segundos
  const activeAlarmStopperRef = useRef<(() => void) | null>(null);

  // === 3. ESTADOS DEL SONDEO RELÁMPAGO ===
  const [pollQuestion, setPollQuestion] = useState('¿Cuál es la hipótesis principal de nuestro experimento de hoy?');
  const [pollOptions, setPollOptions] = useState([
    { id: 'opt-1', text: 'A) El agua se evaporará más rápido con calor directo', votes: 12 },
    { id: 'opt-2', text: 'B) La planta crecerá igual en la sombra', votes: 4 },
    { id: 'opt-3', text: 'C) El bicarbonato neutraliza el ácido', votes: 9 }
  ]);
  const [isEditingPoll, setIsEditingPoll] = useState(false);
  const [editPollQuestion, setEditPollQuestion] = useState(pollQuestion);
  const [editPollOptions, setEditPollOptions] = useState(pollOptions);

  const handleStartEditPoll = () => {
    setEditPollQuestion(pollQuestion);
    setEditPollOptions(pollOptions.map(opt => ({ ...opt })));
    setIsEditingPoll(true);
    playSfx('click');
  };

  const handleSavePoll = () => {
    if (editPollQuestion.trim()) {
      setPollQuestion(editPollQuestion.trim());
    }
    const filtered = editPollOptions.filter(o => o.text.trim().length > 0);
    if (filtered.length > 0) {
      setPollOptions(filtered);
    }
    setIsEditingPoll(false);
    playSfx('click');
  };

  const handleCancelEditPoll = () => {
    setIsEditingPoll(false);
    playSfx('click');
  };

  const handleAddPollOption = () => {
    setEditPollOptions(prev => [
      ...prev,
      { id: `opt-${Date.now()}`, text: '', votes: 0 }
    ]);
  };

  const handleClearAllPoll = () => {
    setEditPollQuestion('');
    setEditPollOptions([
      { id: `opt-${Date.now()}-1`, text: '', votes: 0 },
      { id: `opt-${Date.now()}-2`, text: '', votes: 0 }
    ]);
    playSfx('click');
  };

  const handleDeletePollOption = (id: string) => {
    if (editPollOptions.length <= 1) return;
    setEditPollOptions(prev => prev.filter(opt => opt.id !== id));
  };

  const handleResetPollVotes = () => {
    setPollOptions(prev => prev.map(opt => ({ ...opt, votes: 0 })));
    playSfx('click');
  };

  // Detener cualquier sonido de alarma activo
  const stopAlarm = () => {
    if (activeAlarmStopperRef.current) {
      activeAlarmStopperRef.current();
      activeAlarmStopperRef.current = null;
    }
    setIsAlarmPlaying(false);
    setPreviewPlayingSound(null);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  // === SINTETIZADOR WEB AUDIO NATIVO ===
  const playSfx = (type: 'spin' | 'win' | 'click' | 'reward') => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'spin') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320 + Math.random() * 260, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'win') {
        const freqs = [523.25, 659.25, 783.99, 1046.50];
        freqs.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'triangle';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.08);
          noteGain.gain.setValueAtTime(0.15, now + idx * 0.08);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9 + idx * 0.08);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(now + idx * 0.08);
          noteOsc.stop(now + 0.9 + idx * 0.08);
        });
      } else if (type === 'reward') {
        const freqs = [440, 554.37, 659.25, 880, 1108.73];
        freqs.forEach((freq, idx) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.type = 'sine';
          noteOsc.frequency.setValueAtTime(freq, now + idx * 0.06);
          noteGain.gain.setValueAtTime(0.18, now + idx * 0.06);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8 + idx * 0.06);
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.start(now + idx * 0.06);
          noteOsc.stop(now + 0.8 + idx * 0.06);
        });
      }
    } catch (e) {}
  };

  // Reproductor de Alarma de 5 Segundos (5 perfiles de sonido)
  const playTimerAlarmSound = (soundProfile: TimerSoundProfile, isPreview = false) => {
    stopAlarm();
    if (!soundEnabled || typeof window === 'undefined' || soundProfile === 'silent') {
      if (!isPreview) {
        setIsAlarmPlaying(true);
        setTimeout(() => setIsAlarmPlaying(false), 5000);
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const durationSec = isPreview ? 1.6 : 5.0;
      const now = ctx.currentTime;
      let isCanceled = false;

      if (isPreview) {
        setPreviewPlayingSound(soundProfile);
      } else {
        setIsAlarmPlaying(true);
      }

      if (soundProfile === 'zen') {
        // Nivel 1: Campana Zen Tibetana Suave
        const triggerZenChime = (offset: number) => {
          if (isCanceled) return;
          const harmonics = [528, 1056, 1584];
          harmonics.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + offset);
            const vol = idx === 0 ? 0.3 : 0.12 / idx;
            gain.gain.setValueAtTime(vol, now + offset);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 1.8);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + offset);
            osc.stop(now + offset + 1.8);
          });
        };

        triggerZenChime(0);
        if (!isPreview) {
          triggerZenChime(1.7);
          triggerZenChime(3.4);
        }

      } else if (soundProfile === 'magic') {
        // Nivel 2: Campanadas Mágicas / Fanfarria
        const melody = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        const triggerArp = (startOffset: number) => {
          if (isCanceled) return;
          melody.forEach((freq, idx) => {
            const noteT = now + startOffset + idx * 0.11;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, noteT);
            gain.gain.setValueAtTime(0.32, noteT);
            gain.gain.exponentialRampToValueAtTime(0.0001, noteT + 0.55);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(noteT);
            osc.stop(noteT + 0.55);
          });
        };

        triggerArp(0);
        if (!isPreview) {
          triggerArp(1.25);
          triggerArp(2.5);
          triggerArp(3.75);
        }

      } else if (soundProfile === 'digital') {
        // Nivel 3: Alarma Digital Enérgica
        const pulseInterval = 0.38;
        const totalPulses = Math.floor(durationSec / pulseInterval);

        for (let i = 0; i < totalPulses; i++) {
          const pulseT = now + i * pulseInterval;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(920, pulseT);
          osc.frequency.setValueAtTime(1840, pulseT + 0.08);
          gain.gain.setValueAtTime(0.38, pulseT);
          gain.gain.exponentialRampToValueAtTime(0.001, pulseT + 0.19);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(pulseT);
          osc.stop(pulseT + 0.19);
        }

      } else if (soundProfile === 'epic') {
        // Nivel 4: ¡Sirena Épica!
        const cycles = isPreview ? 2 : 6;
        for (let i = 0; i < cycles; i++) {
          const cycleT = now + i * 0.82;

          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(650, cycleT);
          osc1.frequency.linearRampToValueAtTime(1650, cycleT + 0.4);
          osc1.frequency.linearRampToValueAtTime(650, cycleT + 0.8);
          gain1.gain.setValueAtTime(0.5, cycleT);
          gain1.gain.exponentialRampToValueAtTime(0.01, cycleT + 0.8);
          osc1.connect(gain1);
          gain1.connect(ctx.destination);
          osc1.start(cycleT);
          osc1.stop(cycleT + 0.8);

          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(220, cycleT);
          osc2.frequency.linearRampToValueAtTime(480, cycleT + 0.4);
          gain2.gain.setValueAtTime(0.4, cycleT);
          gain2.gain.exponentialRampToValueAtTime(0.001, cycleT + 0.8);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start(cycleT);
          osc2.stop(cycleT + 0.8);
        }
      }

      const safeCloseContext = () => {
        if (ctx && ctx.state !== 'closed') {
          try {
            ctx.close().catch(() => {});
          } catch (e) {}
        }
      };

      const timerId = setTimeout(() => {
        setIsAlarmPlaying(false);
        setPreviewPlayingSound(null);
        safeCloseContext();
      }, durationSec * 1000);

      activeAlarmStopperRef.current = () => {
        isCanceled = true;
        clearTimeout(timerId);
        safeCloseContext();
      };

    } catch (e) {}
  };

  // Pantalla Completa Proyector
  const toggleFullscreen = () => {
    if (typeof document === 'undefined') return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Temporizador Tick
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            playTimerAlarmSound(selectedTimerSound, false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, selectedTimerSound, soundEnabled]);

  // === GIRO DE LA RULETA DEL HÉROE ===
  const handleSpinHeroPicker = () => {
    if (isSpinning || eligibleStudents.length === 0) return;
    setIsSpinning(true);
    setSelectedStudent(null);
    setRewardGranted(false);
    setShowConfetti(false);

    const totalParticipants = eligibleStudents.length;
    const targetWinnerIdx = Math.floor(Math.random() * totalParticipants);
    const chosenHero = eligibleStudents[targetWinnerIdx];

    if (rouletteMode === 'wheel') {
      const sliceAngle = 360 / Math.min(totalParticipants, 12);
      const targetSlice = targetWinnerIdx % Math.min(totalParticipants, 12);
      const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
      const targetDeg = wheelRotation + extraSpins + (360 - (targetSlice * sliceAngle + sliceAngle / 2));
      
      setWheelRotation(targetDeg);

      let tickCount = 0;
      const totalTicks = 24;
      const tickInterval = setInterval(() => {
        tickCount++;
        playSfx('spin');
        if (tickCount >= totalTicks) {
          clearInterval(tickInterval);
        }
      }, 120);

      setTimeout(() => {
        setIsSpinning(false);
        setSelectedStudent(chosenHero);
        setSessionPickedHistory(prev => [chosenHero, ...prev.filter(p => p.id !== chosenHero.id)]);
        setShowConfetti(true);
        playSfx('win');
      }, 3500);

    } else {
      let counter = 0;
      const maxSpins = 28;
      let delay = 60;

      const spinStep = () => {
        counter++;
        const randomIdx = Math.floor(Math.random() * eligibleStudents.length);
        setPreviewingIndex(randomIdx);
        setSelectedStudent(eligibleStudents[randomIdx]);
        playSfx('spin');

        if (counter < maxSpins) {
          if (counter > 16) delay += 35;
          setTimeout(spinStep, delay);
        } else {
          setIsSpinning(false);
          setSelectedStudent(chosenHero);
          setSessionPickedHistory(prev => [chosenHero, ...prev.filter(p => p.id !== chosenHero.id)]);
          setShowConfetti(true);
          playSfx('win');
        }
      };

      spinStep();
    }
  };

  // Recompensa al estudiante
  const handleGrantHeroReward = async () => {
    if (!selectedStudent || rewardGranted) return;
    setRewardGranted(true);
    playSfx('reward');

    logHeroPicker({
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      rewardGiven: {
        xp: 25,
        coins: 15,
        badgeName: 'Héroe del Día 🌟'
      }
    });

    try {
      await useStudentStore.getState().addXpAndCoins(selectedStudent.id, 25, 15);
    } catch (e) {}
  };

  // Formato mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timerProgress = initialTimerSeconds > 0 
    ? ((initialTimerSeconds - timerSeconds) / initialTimerSeconds) * 100 
    : 0;

  // Ajustes de tiempo personalizado
  const applyCustomTime = (mins: number, secs: number) => {
    const totalSecs = Math.max(5, mins * 60 + secs);
    setIsTimerRunning(false);
    stopAlarm();
    setTimerSeconds(totalSecs);
    setInitialTimerSeconds(totalSecs);
    setCustomInputMins(Math.floor(totalSecs / 60));
    setCustomInputSecs(totalSecs % 60);
    playSfx('click');
  };

  const adjustTimerOffset = (deltaSecs: number) => {
    const newTotal = Math.max(5, timerSeconds + deltaSecs);
    setTimerSeconds(newTotal);
    if (!isTimerRunning) {
      setInitialTimerSeconds(newTotal);
      setCustomInputMins(Math.floor(newTotal / 60));
      setCustomInputSecs(newTotal % 60);
    }
    playSfx('click');
  };

  // Segmentos de la rueda circular SVG
  const visibleWheelSlices = useMemo(() => {
    const count = Math.min(eligibleStudents.length, 12);
    if (count === 0) return [];
    const anglePerSlice = 360 / count;
    
    return eligibleStudents.slice(0, count).map((student, idx) => {
      const startAngle = idx * anglePerSlice;
      const endAngle = (idx + 1) * anglePerSlice;
      
      const startRad = ((startAngle - 90) * Math.PI) / 180;
      const endRad = ((endAngle - 90) * Math.PI) / 180;
      
      const radius = 180;
      const cx = 200;
      const cy = 200;
      
      const x1 = cx + radius * Math.cos(startRad);
      const y1 = cy + radius * Math.sin(startRad);
      const x2 = cx + radius * Math.cos(endRad);
      const y2 = cy + radius * Math.sin(endRad);
      
      const largeArcFlag = anglePerSlice > 180 ? 1 : 0;
      const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
      
      const midAngle = startAngle + anglePerSlice / 2;
      const textRad = ((midAngle - 90) * Math.PI) / 180;
      const textX = cx + (radius * 0.65) * Math.cos(textRad);
      const textY = cy + (radius * 0.65) * Math.sin(textRad);

      const color = WHEEL_COLORS[idx % WHEEL_COLORS.length];
      const shortName = student.name.split(' ')[0] || 'Héroe';

      return {
        pathData,
        color,
        textX,
        textY,
        midAngle,
        shortName,
        student,
        idx
      };
    });
  }, [eligibleStudents]);

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex flex-col text-white select-none overflow-y-auto animate-fade-in font-sans">
      
      {/* ========================================================================= */}
      {/* 1. BARRA SUPERIOR PROYECTABLE */}
      {/* ========================================================================= */}
      <div className="p-4 sm:px-8 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/25">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-700/80 text-amber-300 tracking-wider">
                Modo Proyector de Clase
              </span>
              <span className="text-xs text-slate-400 font-bold">
                • {eligibleStudents.length} Alumnos en Dinámica
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight">
              Centro de Dinámicas en Vivo
            </h1>
          </div>
        </div>

        {/* Pestañas de Dinámicas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-800/90 rounded-2xl border border-slate-700 shadow-inner">
          <button
            type="button"
            onClick={() => { playSfx('click'); setActiveTab('picker'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'picker' 
                ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 shadow-md scale-102' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Ruleta del Héroe</span>
          </button>
          
          <button
            type="button"
            onClick={() => { playSfx('click'); setActiveTab('timer'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'timer' 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md scale-102' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Temporizador</span>
          </button>

          <button
            type="button"
            onClick={() => { playSfx('click'); setActiveTab('poll'); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'poll' 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-102' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Vote className="w-4 h-4" />
            <span>Sondeo Relámpago</span>
          </button>
        </div>

        {/* Controles: Grupo, Audio, Fullscreen & Cerrar */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={selectedGroupId}
              onChange={(e) => {
                playSfx('click');
                setSelectedGroupId(e.target.value);
              }}
              className="px-3 py-2 bg-slate-800 border border-slate-700 hover:border-amber-500/50 rounded-xl text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              <option value="all">🌟 Todos los Alumnos ({allNormalizedStudents.length})</option>
              {groupsList.map(g => (
                <option key={g.id} value={g.id}>
                  {g.grade} "{g.name}" - {g.level === 'primaria' ? 'Primaria' : g.level === 'secundaria' ? 'Secundaria' : 'Prepa'}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title={soundEnabled ? 'Silenciar Efectos' : 'Activar Efectos'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Pantalla Completa"
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-indigo-400" /> : <Maximize2 className="w-5 h-5 text-slate-300" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Cerrar</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ÁREA PRINCIPAL PROYECTABLE */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-6xl mx-auto w-full">
        
        {/* ========================================================================= */}
        {/* CASO 1: RULETA DEL HÉROE ELEGIDO */}
        {/* ========================================================================= */}
        {activeTab === 'picker' && (
          <div className="flex flex-col items-center space-y-6 w-full max-w-4xl text-center">
            
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-black tracking-widest uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Participación Equitativa Gamificada</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                ¿Quién será el Héroe Elegido?
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Gira la ruleta mágica para seleccionar aleatoriamente al próximo participante del desafío.
              </p>
            </div>

            {/* Selector de Modo de Ruleta & Filtro Equitativo */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => { playSfx('click'); setRouletteMode('wheel'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rouletteMode === 'wheel' 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Disc className="w-3.5 h-3.5" />
                  <span>Rueda Circular</span>
                </button>
                <button
                  type="button"
                  onClick={() => { playSfx('click'); setRouletteMode('cards'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    rouletteMode === 'cards' 
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>Escáner de Cartas</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  playSfx('click');
                  setExcludeAlreadyPicked(!excludeAlreadyPicked);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  excludeAlreadyPicked 
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Excluye temporalmente a los que ya participaron en esta sesión"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Excluir ya elegidos ({sessionPickedHistory.length})</span>
              </button>
            </div>

            {/* CONTENEDOR DE LA RULETA VISUAL */}
            <div className="w-full flex flex-col items-center justify-center py-4">
              
              {/* MODO 1: RUEDA CIRCULAR SVG INTERACTIVA */}
              {rouletteMode === 'wheel' && (
                <div className="relative w-[320px] sm:w-[380px] h-[320px] sm:h-[380px] flex items-center justify-center">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />
                  <div className="absolute inset-0 rounded-full border-4 border-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] animate-pulse" />

                  <motion.svg
                    viewBox="0 0 400 400"
                    className="w-full h-full rounded-full shadow-2xl overflow-hidden"
                    animate={{ rotate: wheelRotation }}
                    transition={{
                      duration: isSpinning ? 3.5 : 0,
                      ease: [0.15, 0.9, 0.25, 1.0]
                    }}
                  >
                    <g>
                      {visibleWheelSlices.map((slice) => (
                        <g key={slice.idx}>
                          <path
                            d={slice.pathData}
                            fill={slice.color}
                            stroke="#0f172a"
                            strokeWidth="3"
                          />
                          <text
                            x={slice.textX}
                            y={slice.textY}
                            fill="#ffffff"
                            fontSize="13"
                            fontWeight="900"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${slice.midAngle + 90}, ${slice.textX}, ${slice.textY})`}
                            className="drop-shadow-md select-none font-bold"
                          >
                            {slice.shortName}
                          </text>
                        </g>
                      ))}
                    </g>
                  </motion.svg>

                  <div className="absolute z-10 w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 text-slate-950 flex flex-col items-center justify-center shadow-2xl border-4 border-slate-950 font-black">
                    <Star className="w-6 h-6 fill-slate-950" />
                    <span className="text-[9px] uppercase tracking-wider font-extrabold">ISkool</span>
                  </div>
                </div>
              )}

              {/* MODO 2: ESCÁNER / TARJETA DE HÉROE */}
              {rouletteMode === 'cards' && (
                <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/80 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10 flex flex-col items-center justify-center min-h-[260px] w-full max-w-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />

                  {selectedStudent ? (
                    <motion.div
                      key={selectedStudent.id}
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="space-y-4 text-center relative z-10"
                    >
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-yellow-400 to-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-2xl shadow-amber-500/30 text-4xl font-black">
                        ⭐
                      </div>
                      <div>
                        <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                          {selectedStudent.name}
                        </h3>
                        <p className="text-xs sm:text-sm font-bold text-amber-400 mt-1">
                          {selectedStudent.groupName}
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-3 text-slate-500 text-center">
                      <Users className="w-16 h-16 mx-auto opacity-40 animate-pulse text-amber-400" />
                      <p className="text-sm font-bold text-slate-400">
                        Presiona el botón para activar el escáner y elegir al participante al azar.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* TARJETA DEL GANADOR SELECCIONADO */}
              <AnimatePresence>
                {selectedStudent && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 border-2 border-amber-400 shadow-2xl shadow-amber-500/20 max-w-lg w-full flex flex-col items-center gap-4 text-center relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-2">
                      <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
                        ¡Héroe Seleccionado!
                      </span>
                    </div>

                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-500/30">
                      🏆
                    </div>

                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white">
                        {selectedStudent.name}
                      </h3>
                      <p className="text-xs font-bold text-amber-400 mt-0.5">
                        {selectedStudent.groupName}
                      </p>
                    </div>

                    <div className="w-full pt-1 flex flex-wrap justify-center gap-3">
                      {!rewardGranted ? (
                        <button
                          type="button"
                          onClick={handleGrantHeroReward}
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                        >
                          <Coins className="w-5 h-5 text-yellow-300" />
                          <span>Premiar Participación (+15 🪙 / +25 XP)</span>
                        </button>
                      ) : (
                        <div className="px-6 py-3 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black flex items-center gap-2 shadow-lg">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>¡Recompensa Otorgada con Éxito! (+15 Galeones / +25 XP)</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* BOTÓN PRINCIPAL */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                type="button"
                disabled={isSpinning || eligibleStudents.length === 0}
                onClick={handleSpinHeroPicker}
                className={`px-10 py-4 sm:px-14 sm:py-5 rounded-2xl font-black text-base sm:text-xl transition-all shadow-2xl flex items-center gap-3 cursor-pointer ${
                  isSpinning 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-500 hover:to-yellow-500 text-slate-950 shadow-amber-500/30 hover:scale-105 active:scale-95'
                }`}
              >
                <Sparkles className="w-6 h-6 fill-slate-950 animate-spin" />
                <span>{isSpinning ? 'Girando el Destino...' : 'Girar Ruleta del Héroe'}</span>
              </button>

              {sessionPickedHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playSfx('click');
                    setSessionPickedHistory([]);
                  }}
                  className="px-4 py-4 rounded-2xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer flex items-center gap-1.5"
                  title="Reiniciar historial de participación"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Limpiar Historial</span>
                </button>
              )}
            </div>

            {/* HISTORIAL DE PARTICIPANTES */}
            {sessionPickedHistory.length > 0 && (
              <div className="w-full max-w-2xl bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span className="uppercase tracking-wider">Historial de Héroes de la Sesión:</span>
                  <span className="text-amber-400 font-bold">{sessionPickedHistory.length} Participantes</span>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {sessionPickedHistory.map((student, idx) => (
                    <span 
                      key={student.id}
                      className="px-3 py-1 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{student.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

        {/* ========================================================================= */}
        {/* CASO 2: TEMPORIZADOR DE CONCENTRACIÓN (LISTA DE TIEMPOS Y LISTA DE SONIDOS) */}
        {/* ========================================================================= */}
        {activeTab === 'timer' && (
          <div className="flex flex-col items-center space-y-6 w-full max-w-3xl text-center">
            
            {/* Cabecera del Temporizador */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 text-xs font-black tracking-widest uppercase mb-1">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Enfoque & Misión Contrarreloj</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                Tiempo de Concentración
              </h2>
            </div>

            {/* BARRA DE ALERTA DE ALARMA EN EJECUCIÓN (5 SEGUNDOS) */}
            <AnimatePresence>
              {isAlarmPlaying && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full max-w-xl p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-slate-950 font-black flex items-center justify-between shadow-2xl shadow-rose-500/40 border-2 border-white animate-bounce"
                >
                  <div className="flex items-center gap-2.5 text-left">
                    <span className="text-2xl">🚨</span>
                    <div>
                      <p className="text-xs uppercase tracking-wider font-extrabold text-slate-950">
                        ¡Tiempo Cumplido!
                      </p>
                      <p className="text-sm font-black text-slate-950">
                        Alarma de 5 segundos • {TIMER_SOUND_OPTIONS.find(s => s.id === selectedTimerSound)?.name}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={stopAlarm}
                    className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-black text-xs flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 cursor-pointer"
                  >
                    <StopCircle className="w-4 h-4 text-rose-400" />
                    <span>Silenciar Ahora</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===================================================================== */}
            {/* DISPLAY GIGANTE DEL CRONÓMETRO CON EFECTOS NEÓN */}
            {/* ===================================================================== */}
            <div className={`p-8 sm:p-10 rounded-3xl w-full max-w-2xl transition-all duration-500 relative overflow-hidden border-2 shadow-2xl flex flex-col items-center justify-center ${
              timerSeconds === 0 
                ? 'bg-gradient-to-b from-rose-950 via-slate-900 to-slate-950 border-rose-500 shadow-rose-500/30' 
                : timerSeconds <= 10 && isTimerRunning
                ? 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-950 border-amber-400 shadow-amber-500/30 animate-pulse'
                : 'bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/70 border-indigo-700/60 shadow-indigo-500/10'
            }`}>
              
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between w-full pb-2 relative z-10 text-xs font-bold text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isTimerRunning ? 'bg-emerald-400 animate-ping' : timerSeconds === 0 ? 'bg-rose-500' : 'bg-slate-500'
                  }`} />
                  <span className="uppercase tracking-widest">
                    {isTimerRunning ? 'Misión en Curso' : timerSeconds === 0 ? 'Misión Concluida' : 'Listo para Iniciar'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-indigo-300">
                  <Bell className="w-3.5 h-3.5" />
                  <span className="font-semibold">
                    {TIMER_SOUND_OPTIONS.find(s => s.id === selectedTimerSound)?.level}: {TIMER_SOUND_OPTIONS.find(s => s.id === selectedTimerSound)?.name}
                  </span>
                </div>
              </div>

              {/* DÍGITOS GIGANTES MM:SS */}
              <div className={`text-7xl sm:text-9xl font-black tracking-tight font-mono py-2 select-none relative z-10 transition-colors ${
                timerSeconds === 0 
                  ? 'text-rose-400 drop-shadow-[0_0_35px_rgba(244,63,94,0.6)]' 
                  : timerSeconds <= 10 && isTimerRunning
                  ? 'text-amber-400 drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]'
                  : 'text-indigo-200 drop-shadow-[0_0_30px_rgba(99,102,241,0.4)]'
              }`}>
                {formatTime(timerSeconds)}
              </div>

              {/* Barra de Progreso */}
              <div className="w-full bg-slate-800/90 h-3.5 rounded-full overflow-hidden relative z-10 my-2 border border-slate-700/60">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    timerSeconds === 0
                      ? 'bg-rose-500'
                      : timerSeconds <= 10
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400'
                  }`}
                  style={{ width: `${timerProgress}%` }}
                />
              </div>

              {/* Stepper Rápido */}
              <div className="flex items-center justify-center gap-2 pt-2 relative z-10 flex-wrap">
                <button
                  type="button"
                  onClick={() => adjustTimerOffset(-60)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                  <span>1 min</span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimerOffset(-30)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Minus className="w-3 h-3" />
                  <span>30 seg</span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimerOffset(30)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>30 seg</span>
                </button>
                <button
                  type="button"
                  onClick={() => adjustTimerOffset(60)}
                  className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>1 min</span>
                </button>
              </div>

            </div>

            {/* BOTONES DE CONTROL: INICIAR, PAUSAR & REINICIAR */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
              <button
                type="button"
                onClick={() => {
                  stopAlarm();
                  setIsTimerRunning(!isTimerRunning);
                  playSfx('click');
                }}
                className={`px-10 py-4 sm:px-14 sm:py-5 rounded-2xl font-black text-base sm:text-xl transition-all shadow-2xl flex items-center gap-3 cursor-pointer ${
                  isTimerRunning
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-amber-500/30 hover:scale-105'
                    : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/30 hover:scale-105 active:scale-95'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-slate-950" />
                    <span>Pausar Tiempo</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-white" />
                    <span>{timerSeconds === 0 ? 'Reiniciar e Iniciar' : 'Iniciar Tiempo'}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  stopAlarm();
                  setIsTimerRunning(false);
                  setTimerSeconds(initialTimerSeconds);
                  playSfx('click');
                }}
                className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-sm flex items-center gap-2 cursor-pointer transition-all border border-slate-700 shadow-md"
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reiniciar</span>
              </button>
            </div>

            {/* PANEL DE TIEMPO PERSONALIZADO DESPLEGABLE */}
            <AnimatePresence>
              {isCustomizingTime && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 text-left shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-black uppercase text-purple-400 tracking-wider">
                      ⚙️ Configurar Tiempo Exacto
                    </span>
                    <span className="text-xs text-slate-400">
                      Personaliza minutos y segundos
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-4 py-1">
                    <div className="flex flex-col items-center">
                      <label className="text-xs font-bold text-slate-400 mb-1">Minutos</label>
                      <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-2xl p-1">
                        <button
                          type="button"
                          onClick={() => setCustomInputMins(prev => Math.max(0, prev - 1))}
                          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={180}
                          value={customInputMins}
                          onChange={(e) => setCustomInputMins(Math.max(0, parseInt(e.target.value) || 0))}
                          className="w-16 text-center text-xl font-black bg-transparent text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomInputMins(prev => Math.min(180, prev + 1))}
                          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <span className="text-3xl font-black text-slate-600 pt-5">:</span>

                    <div className="flex flex-col items-center">
                      <label className="text-xs font-bold text-slate-400 mb-1">Segundos</label>
                      <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-2xl p-1">
                        <button
                          type="button"
                          onClick={() => setCustomInputSecs(prev => Math.max(0, prev - 5))}
                          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min={0}
                          max={59}
                          value={customInputSecs}
                          onChange={(e) => setCustomInputSecs(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          className="w-16 text-center text-xl font-black bg-transparent text-white focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setCustomInputSecs(prev => Math.min(59, prev + 5))}
                          className="w-8 h-8 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        applyCustomTime(customInputMins, customInputSecs);
                        setIsCustomizingTime(false);
                      }}
                      className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-purple-500/25 flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                    >
                      <Check className="w-4 h-4" />
                      <span>Fijar Tiempo: {customInputMins}m {customInputSecs}s</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ===================================================================== */}
            {/* LISTAS DESPLEGABLES: TIEMPOS DE MISIÓN Y SONIDOS DE ALARMA */}
            {/* ===================================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl text-left bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
              
              {/* 1. LISTA DESPLEGABLE DE TIEMPOS */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-black uppercase text-indigo-400 tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tiempo de la Misión</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    {formatTime(timerSeconds)}
                  </span>
                </label>

                <div className="relative">
                  <select
                    value={isCustomizingTime ? 'custom' : initialTimerSeconds}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        setIsCustomizingTime(true);
                      } else {
                        setIsCustomizingTime(false);
                        const sec = parseInt(val, 10);
                        setIsTimerRunning(false);
                        stopAlarm();
                        setTimerSeconds(sec);
                        setInitialTimerSeconds(sec);
                        setCustomInputMins(Math.floor(sec / 60));
                        setCustomInputSecs(sec % 60);
                        playSfx('click');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border-2 border-indigo-500/50 hover:border-indigo-400 rounded-2xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 shadow-md cursor-pointer"
                  >
                    {TIMER_PRESETS.map(preset => (
                      <option key={preset.sec} value={preset.sec}>
                        {preset.icon} {preset.label} ({preset.badge})
                      </option>
                    ))}
                    <option value="custom">⚙️ Tiempo Personalizado (Definir Min:Seg)...</option>
                  </select>
                </div>
              </div>

              {/* 2. LISTA DESPLEGABLE DE SONIDOS DE ALARMA */}
              <div className="flex flex-col space-y-2">
                <label className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5" />
                    <span>Sonido al Finalizar</span>
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">
                    5 Segundos
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedTimerSound}
                    onChange={(e) => {
                      setSelectedTimerSound(e.target.value as TimerSoundProfile);
                      playSfx('click');
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border-2 border-amber-500/50 hover:border-amber-400 rounded-2xl text-xs font-black text-white focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-md cursor-pointer"
                  >
                    {TIMER_SOUND_OPTIONS.map(opt => (
                      <option key={opt.id} value={opt.id}>
                        {opt.icon} {opt.level}: {opt.name}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => playTimerAlarmSound(selectedTimerSound, true)}
                    className={`px-3 py-2.5 rounded-2xl text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer shrink-0 border ${
                      previewPlayingSound === selectedTimerSound
                        ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                        : 'bg-slate-800 hover:bg-amber-500 hover:text-slate-950 border-slate-700 text-amber-300'
                    }`}
                    title="Probar sonido seleccionado (1.5s)"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">Probar</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* CASO 3: SONDEO RELÁMPAGO EN PANTALLA */}
        {/* ========================================================================= */}
        {activeTab === 'poll' && (
          <div className="space-y-6 w-full max-w-2xl text-center">
            <div className="space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                Evaluación Formativa & Diagnóstico en Vivo
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                Sondeo Relámpago del Aula
              </h2>
            </div>

            <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 border border-emerald-800/60 shadow-2xl text-left space-y-4">
              
              {/* Barra superior de control del Sondeo */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
                <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">
                  {isEditingPoll ? '✏️ Modo Edición de Sondeo' : 'Pregunta Proyectada:'}
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-bold mr-1">
                    Total Votos: {pollOptions.reduce((acc, curr) => acc + curr.votes, 0)}
                  </span>

                  {!isEditingPoll ? (
                    <>
                      <button
                        type="button"
                        onClick={handleStartEditPoll}
                        className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Modificar la pregunta y las opciones"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Editar Pregunta</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleResetPollVotes}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer"
                        title="Poner en 0 todos los votos"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reiniciar</span>
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              {/* VISTA 1: MODO EDICIÓN */}
              {isEditingPoll ? (
                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-300">
                      Pregunta del Sondeo:
                    </label>
                    <button
                      type="button"
                      onClick={handleClearAllPoll}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 cursor-pointer"
                      title="Vaciar pregunta y opciones para escribir desde cero"
                    >
                      <span>🧹 Limpiar todo el formulario</span>
                    </button>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={editPollQuestion}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => setEditPollQuestion(e.target.value)}
                      placeholder="Escribe la pregunta para el aula..."
                      className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                    {editPollQuestion && (
                      <button
                        type="button"
                        onClick={() => setEditPollQuestion('')}
                        className="absolute right-3 text-slate-400 hover:text-white p-1 cursor-pointer"
                        title="Borrar pregunta"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">
                      Opciones de Respuesta:
                    </label>
                    {editPollOptions.map((opt, idx) => (
                      <div key={opt.id} className="flex items-center gap-2">
                        <div className="relative flex-1 flex items-center">
                          <input
                            type="text"
                            value={opt.text}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const updated = [...editPollOptions];
                              updated[idx].text = e.target.value;
                              setEditPollOptions(updated);
                            }}
                            placeholder={`Escribe la opción ${String.fromCharCode(65 + idx)}...`}
                            className="w-full pl-3.5 pr-8 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-emerald-400"
                          />
                          {opt.text && (
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...editPollOptions];
                                updated[idx].text = '';
                                setEditPollOptions(updated);
                              }}
                              className="absolute right-2 text-slate-400 hover:text-white p-1 cursor-pointer"
                              title="Borrar texto de esta opción"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {editPollOptions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDeletePollOption(opt.id)}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Eliminar opción"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-dashed border-emerald-500/40 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar otra opción</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={handleCancelEditPoll}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSavePoll}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Guardar y Proyectar</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* VISTA 2: MODO PROYECCIÓN EN VIVO */
                <>
                  <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                    {pollQuestion}
                  </h3>

                  <div className="space-y-3 pt-2">
                    {pollOptions.map((opt) => {
                      const total = pollOptions.reduce((acc, curr) => acc + curr.votes, 0) || 1;
                      const pct = Math.round((opt.votes / total) * 100);

                      return (
                        <div
                          key={opt.id}
                          className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
                            <span>{opt.text}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-emerald-400 font-bold">{opt.votes} ({pct}%)</span>
                              <button
                                type="button"
                                onClick={() => {
                                  playSfx('win');
                                  setPollOptions(prev => prev.map(o => o.id === opt.id ? { ...o, votes: o.votes + 1 } : o));
                                }}
                                className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-all cursor-pointer"
                              >
                                +1 Voto
                              </button>
                            </div>
                          </div>

                          <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
