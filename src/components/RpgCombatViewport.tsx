"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar, useCurrentStudentAcademicPower } from '@/store/useStudentStore';
import { useGamificationStore } from '@/store/useGamificationStore';
import { AnimeAvatarSprite } from './AnimeAvatarSprite';
import { PetSvgRenderer } from './pet/PetSvgRenderer';
import { resolvePetRace } from './pet/types';
import { 
  Volume2, VolumeX, Shield, Swords, Sparkles, HelpCircle, 
  Briefcase, Zap, RotateCcw, Award, Heart, Brain, Play, RefreshCw, AlertCircle
} from 'lucide-react';
// Lista de sprites de dragones en /images/rpg/enemies/
const DRAGON_ENEMIES_SPRITES = [
  '/images/rpg/enemies/blood_dragon.png',
  '/images/rpg/enemies/crimson_dragon.png',
  '/images/rpg/enemies/emberheart_dragon.png',
  '/images/rpg/enemies/glacialserpent.png',
  '/images/rpg/enemies/luminous_dragon.png',
  '/images/rpg/enemies/moonshadow_dragon.png',
  '/images/rpg/enemies/thunderwing_drake_nosparks.png',
];

export const getDragonSpriteForQuest = (questId: string, idx: number = 0): string => {
  if (!questId) return DRAGON_ENEMIES_SPRITES[idx % DRAGON_ENEMIES_SPRITES.length];
  const charSum = questId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DRAGON_ENEMIES_SPRITES[(charSum + idx) % DRAGON_ENEMIES_SPRITES.length];
};
// Motor de Audio Avanzado sintetizado con Música de Fondo Retro y Control de Volumen Master
class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private bgMusicInterval: any = null;
  private isMusicPlaying = false;
  private masterGain: GainNode | null = null;
  private volumeLevel = 0.5; // Por defecto al 50%

  private init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        
        // Crear Nodo de Ganancia Master
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.volumeLevel, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
        
        // Generar buffer de ruido para explosiones digitales
        const bufferSize = this.ctx.sampleRate * 0.45;
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    } catch (e) {
      console.warn("Web Audio API no está soportado en este navegador.", e);
    }
  }

  public setVolume(volume: number) {
    this.volumeLevel = volume;
    this.init(); // Asegurar inicialización
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(volume, this.ctx.currentTime);
    }
  }

  public startBackgroundMusic() {
    this.init();
    if (!this.ctx || this.isMusicPlaying) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMusicPlaying = true;
    let step = 0;
    
    // Secuenciador retro chiptune loop
    const bassline = [73.42, 73.42, 87.31, 98.00, 73.42, 73.42, 110.00, 98.00]; // D2, D2, F2, G2, D2, D2, A2, G2
    const melody = [293.66, 0, 349.23, 392.00, 293.66, 440.00, 392.00, 0]; // D4, F4, G4, A4
    
    this.bgMusicInterval = setInterval(() => {
      if (!this.ctx || this.ctx.state === 'suspended') return;
      const now = this.ctx.currentTime;
      
      // Nota de Bajo (Sintetizador analógico de onda sierra con filtro de paso bajo)
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      const bassFilter = this.ctx.createBiquadFilter();
      
      bassOsc.type = 'sawtooth';
      bassOsc.frequency.value = bassline[step % bassline.length];
      
      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(350, now);
      
      bassGain.gain.setValueAtTime(0.04, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      
      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(this.masterGain || this.ctx.destination);
      
      bassOsc.start(now);
      bassOsc.stop(now + 0.24);
      
      // Melodía principal
      const melFreq = melody[step % melody.length];
      if (melFreq > 0 && step % 2 === 0) {
        const melOsc = this.ctx.createOscillator();
        const melGain = this.ctx.createGain();
        const melDelay = this.ctx.createDelay();
        const delayGain = this.ctx.createGain();

        melOsc.type = 'square';
        melOsc.frequency.value = melFreq;
        
        melGain.gain.setValueAtTime(0.012, now);
        melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        melDelay.delayTime.value = 0.15;
        delayGain.gain.value = 0.4; // Feedback
        
        melOsc.connect(melGain);
        melGain.connect(this.masterGain || this.ctx.destination);
        
        // Efecto delay retro
        melGain.connect(melDelay);
        melDelay.connect(delayGain);
        delayGain.connect(this.masterGain || this.ctx.destination);
        
        melOsc.start(now);
        melOsc.stop(now + 0.45);
      }
      
      step++;
    }, 240); // BPM ~125
  }

  public stopBackgroundMusic() {
    if (this.bgMusicInterval) {
      clearInterval(this.bgMusicInterval);
      this.bgMusicInterval = null;
    }
    this.isMusicPlaying = false;
  }

  public play(type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;

    switch (type) {
      case 'charge': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.5);
        
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.5);
        
        osc.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      }
      case 'laser': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc1.type = 'sawtooth';
        osc2.type = 'square';
        
        osc1.frequency.setValueAtTime(850, now);
        osc1.frequency.exponentialRampToValueAtTime(150, now + 0.35);
        osc2.frequency.setValueAtTime(830, now);
        osc2.frequency.exponentialRampToValueAtTime(140, now + 0.35);

        filter.type = 'lowpass';
        filter.Q.value = 5;
        filter.frequency.setValueAtTime(2500, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.36);
        osc2.stop(now + 0.36);
        break;
      }
      case 'hit': {
        const osc = this.ctx.createOscillator();
        const oscGain = this.ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(20, now + 0.4);
        
        oscGain.gain.setValueAtTime(0.3, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        
        osc.connect(oscGain);
        oscGain.connect(this.masterGain || this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.41);

        if (this.noiseBuffer) {
          const noiseSource = this.ctx.createBufferSource();
          const noiseGain = this.ctx.createGain();
          const noiseFilter = this.ctx.createBiquadFilter();

          noiseSource.buffer = this.noiseBuffer;
          
          noiseFilter.type = 'bandpass';
          noiseFilter.Q.value = 4.0;
          noiseFilter.frequency.setValueAtTime(1100, now);
          noiseFilter.frequency.exponentialRampToValueAtTime(100, now + 0.35);

          noiseGain.gain.setValueAtTime(0.25, now);
          noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          noiseSource.connect(noiseFilter);
          noiseFilter.connect(noiseGain);
          noiseGain.connect(this.masterGain || this.ctx.destination);

          noiseSource.start(now);
          noiseSource.stop(now + 0.36);
        }
        break;
      }
      case 'victory': {
        const chords = [
          [261.63, 329.63, 392.00], 
          [349.23, 440.00, 523.25], 
          [392.00, 493.88, 587.33], 
          [523.25, 659.25, 783.99, 1046.50]
        ];
        const durations = [0.15, 0.15, 0.15, 0.6];
        let time = now;
        
        chords.forEach((freqs, idx) => {
          freqs.forEach((freq) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = idx === 3 ? 'sine' : 'square';
            osc.frequency.setValueAtTime(freq, time);
            
            gain.gain.setValueAtTime(0.06, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx] - 0.02);
            
            osc.connect(gain);
            gain.connect(this.masterGain || this.ctx.destination);
            
            osc.start(time);
            osc.stop(time + durations[idx]);
          });
          time += durations[idx] * 0.9;
        });
        break;
      }
      case 'defeat': {
        const notes = [196.00, 164.81, 130.81, 98.00];
        const durations = [0.2, 0.2, 0.2, 0.5];
        let time = now;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, time);
          
          gain.gain.setValueAtTime(0.15, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx] - 0.02);
          
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          
          osc.start(time);
          osc.stop(time + durations[idx]);
          time += durations[idx] * 0.95;
        });
        break;
      }
      case 'error': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(130, now);
        osc1.frequency.linearRampToValueAtTime(110, now + 0.3);
        
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(133, now);
        osc2.frequency.linearRampToValueAtTime(113, now + 0.3);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.masterGain || this.ctx.destination);
        
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.31);
        osc2.stop(now + 0.31);
        break;
      }
      case 'powerup': {
        const notes = [523.25, 659.25, 783.99, 1046.50];
        const durations = [0.08, 0.08, 0.08, 0.3];
        let time = now;
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          gain.gain.setValueAtTime(0.12, time);
          gain.gain.exponentialRampToValueAtTime(0.001, time + durations[idx] - 0.01);
          osc.connect(gain);
          gain.connect(this.masterGain || this.ctx.destination);
          osc.start(time);
          osc.stop(time + durations[idx]);
          time += durations[idx] * 0.7;
        });
        break;
      }
    }
  }
}

const soundEngine = new RetroSoundEngine();

export function RpgCombatViewport() {
  const missions = useGamificationStore(state => state.missionsList);
  const questAttempts = useGamificationStore(state => state.questAttempts);
  const submitExam = useGamificationStore(state => state.submitExam);
  const shopArtifacts = useGamificationStore(state => state.shopArtifacts);
  const guildBoss = useGamificationStore(state => state.guildBoss);
  const triggerGuildAttack = useGamificationStore(state => state.triggerGuildAttack);
  const fetchActiveGuildBoss = useGamificationStore(state => state.fetchActiveGuildBoss);
  const subscribeToGuildChanges = useGamificationStore(state => state.subscribeToGuildChanges);

  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const allAvatars = useStudentStore(state => state.allAvatars);
  const studentInventoryMap = useStudentStore(state => state.studentInventoryMap);
  const stats = useCurrentStudentStats();
  const avatar = useCurrentStudentAvatar();

  // Obtener un compañero de clase real para el escuadrón si existe
  const allyAvatar = useMemo(() => {
    const allyKeys = Object.keys(allAvatars || {}).filter(id => id !== activeStudentId);
    return allyKeys.length > 0 ? allAvatars[allyKeys[0]] : null;
  }, [allAvatars, activeStudentId]);

  // Metadatos de mascotas elementales
  const heroPetMeta = useMemo(() => resolvePetRace(avatar?.pet_type || 'cryo_dragon'), [avatar?.pet_type]);
  const allyPetMeta = useMemo(() => resolvePetRace(allyAvatar?.pet_type || 'dragon'), [allyAvatar?.pet_type]);

  // Fases visuales de la animación de ataque
  const [attackAnimPhase, setAttackAnimPhase] = useState<'none' | 'projectile' | 'impact'>('none');
  const [attackActionType, setAttackActionType] = useState<'normal' | 'skill'>('normal');

  // Control de volumen e hilo musical
  const [volume, setVolume] = useState(0.3);
  const [prevVolume, setPrevVolume] = useState(0.3);
  useEffect(() => {
    soundEngine.setVolume(volume);
    if (volume > 0 && battlePhase === 'fight') {
      soundEngine.startBackgroundMusic();
    } else {
      soundEngine.stopBackgroundMusic();
    }
    return () => {
      soundEngine.stopBackgroundMusic();
    };
  }, [volume]);

  const playSound = (type: 'laser' | 'hit' | 'victory' | 'defeat' | 'error' | 'powerup' | 'charge') => {
    if (volume > 0) {
      soundEngine.play(type);
    }
  };

  // Misiones y filtrado
  const [selectedMissionId, setSelectedMissionId] = useState<string>('mis-fractions');
  const activeMission = missions.find(m => m.id === selectedMissionId) || missions[0];

  // Identificar tareas y el examen (boss)
  const homeworkQuests = activeMission?.quests?.filter(q => q.type !== 'exam') || [];
  
  // Si la misión tiene examen lo usamos, si no creamos uno dinámico
  const missionExamQuest = activeMission?.quests?.find(q => q.type === 'exam') || {
    id: `exam-${selectedMissionId}`,
    mission_id: selectedMissionId,
    title: `Examen de ${activeMission?.title.split(' ')[2] || 'Materia'}`,
    description: "Desafía al guardián final con todo tu conocimiento acumulado.",
    type: "exam",
    sequence_order: homeworkQuests.length + 1,
    xp_reward: 300,
    coins_reward: 50,
    content: {
      bossName: `Guardián de ${activeMission?.title.split(' ')[2] || 'Materia'}`,
      bossHp: 180,
      bossMaxDmg: 25,
      storyIntro: "¡Solo quienes hayan realizado sus tareas obtendrán el poder para vencerme!"
    }
  };

  const examContent = missionExamQuest.content as any;

  // Cálculo Dinámico de Poder Académico (Nivel/XP, Misiones, Artefactos, Tareas Misión)
  const academicPowerData = useCurrentStudentAcademicPower(activeMission?.quests || []);
  const { effectivePower, totalBasePower, percentage: battlePowerPercent, breakdown } = academicPowerData;
  const { completedHomeworkCount, totalHomeworkCount, homeworkMultiplier } = breakdown;

  // Estados de Combate JRPG
  const [battlePhase, setBattlePhase] = useState<'idle' | 'fight' | 'victory' | 'defeat'>('idle');
  const [sombraText, setSombraText] = useState('Sombra: Selecciona una misión y prepárate. Las tareas completadas recargan tus núcleos de daño contra el Jefe de Examen.');
  const [turnCount, setTurnCount] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [bossHp, setBossHp] = useState(180);
  const [bossMaxHp, setBossMaxHp] = useState(180);
  const [combatState, setCombatState] = useState<'idle' | 'player_attack' | 'boss_attack' | 'boss_hurt' | 'player_hurt' | 'victory' | 'defeat'>('idle');
  
  // Sincronización en tiempo real del jefe de gremio
  useEffect(() => {
    fetchActiveGuildBoss();
    const unsubscribe = subscribeToGuildChanges();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchActiveGuildBoss, subscribeToGuildChanges]);

  // Actualizar HP local cuando el jefe cambie en tiempo real en el store (solo en reposo para no reiniciar el combate)
  useEffect(() => {
    if (guildBoss && guildBoss.id && battlePhase === 'idle') {
      const safeBossHp = guildBoss.hp_actual > 0 ? guildBoss.hp_actual : (guildBoss.hp_max || 200);
      setBossHp(safeBossHp);
      setBossMaxHp(guildBoss.hp_max || 200);
    }
  }, [guildBoss, battlePhase]);
  
  // Retries e Inventario
  const ownedArtifactIds = studentInventoryMap[activeStudentId] || [];
  const ownedArtifacts = shopArtifacts.filter(a => ownedArtifactIds.includes(a.id));
  
  const [usedAttempts, setUsedAttempts] = useState(0);
  const totalAttemptsAllowed = 1 + ownedArtifacts.length;

  // Números flotantes y efectos
  const [damageNumber, setDamageNumber] = useState<{ amount: number; isBoss: boolean } | null>(null);
  const [activeShield, setActiveShield] = useState(false);
  const [bonusDamage, setBonusDamage] = useState(0);

  // Seleccionar misión resetea el combate
  useEffect(() => {
    handleReset();
  }, [selectedMissionId]);

  const handleReset = () => {
    setBattlePhase('idle');
    setCombatState('idle');
    setTurnCount(0);
    setPlayerHp(100);
    const targetMaxHp = (guildBoss && guildBoss.hp_max > 0) ? guildBoss.hp_max : (examContent?.bossHp || 200);
    const targetActualHp = (guildBoss && guildBoss.hp_actual > 0) ? guildBoss.hp_actual : targetMaxHp;
    setBossHp(targetActualHp);
    setBossMaxHp(targetMaxHp);
    setUsedAttempts(0);
    setActiveShield(false);
    setBonusDamage(0);
    setSombraText('Sombra: ¡El portal de examen está listo! Si tu poder académico es 0%, no podrás dañar al jefe.');
    soundEngine.stopBackgroundMusic();
  };

  const startFight = () => {
    setPlayerHp(100);
    const targetMaxHp = (guildBoss && guildBoss.hp_max > 0) ? guildBoss.hp_max : (examContent?.bossHp || 200);
    const targetActualHp = (guildBoss && guildBoss.hp_actual > 0) ? guildBoss.hp_actual : targetMaxHp;
    setBossHp(targetActualHp);
    setBossMaxHp(targetMaxHp);
    setTurnCount(1);
    setActiveShield(false);
    setBonusDamage(0);
    setBattlePhase('fight');
    setCombatState('idle');
    setSombraText(`Sombra: ¡Comienza el desafío! Turno 1. Lanza tu ataque científico.`);
    if (volume > 0) {
      soundEngine.startBackgroundMusic();
    }
  };

  // ATAQUE DEL JUGADOR (SIEMPRE DISPARA LA ANIMACIÓN CINEMÁTICA)
  const handlePlayerAttack = (actionType: 'normal' | 'skill') => {
    if (combatState !== 'idle') return;

    // Si el jefe estaba en 0 o negativo, revivirlo a full vida para que el combate continúe
    let currentTargetHp = bossHp;
    if (currentTargetHp <= 0) {
      currentTargetHp = bossMaxHp > 0 ? bossMaxHp : 200;
      setBossHp(currentTargetHp);
    }
    if (playerHp <= 0) {
      setPlayerHp(100);
    }

    setCombatState('player_attack');
    setAttackActionType(actionType);
    setAttackAnimPhase('projectile');
    playSound('charge');

    // Fase 1 -> El proyectil de energía sale del jugador y viaja hacia el jefe (550ms)
    setTimeout(() => {
      // Fase 2 -> Impacto explosivo sobre el jefe (850ms)
      setAttackAnimPhase('impact');
      playSound('laser');
      setCombatState('boss_hurt');

      // Calcular daño dinámico en función del Poder Académico Efectivo (Nivel, XP, Misiones, Artefactos, Tareas)
      const actionBase = actionType === 'skill' ? 35 : 20;
      const statBonus = actionType === 'skill' 
        ? (stats.attribute_intelligence || 10) * 1.3 
        : (stats.attribute_strength || 10) * 1.3;

      // El daño escala directamente con el Poder Académico Efectivo del alumno (mínimo 10 para siempre sentir progreso)
      const powerDamageBonus = Math.max(8, Math.round((effectivePower || 20) / 3.5));
      let finalDamage = Math.round((actionBase + statBonus + powerDamageBonus + bonusDamage) * (0.85 + Math.random() * 0.3));
      
      const newBossHp = Math.max(0, currentTargetHp - finalDamage);
      setBossHp(newBossHp);
      triggerGuildAttack(finalDamage);
      setDamageNumber({ amount: finalDamage, isBoss: true });
      
      if (battlePowerPercent === 0) {
        setSombraText(`Sombra: ⚡ ¡Golpe asestado! (${finalDamage} daño). Completa tareas académicas para activar daño crítico masivo.`);
      } else {
        setSombraText(`Sombra: ${actionType === 'skill' ? '🔮 ¡Hechizo Lógico!' : '⚔️ ¡Tajo de Energía!'} Infliges ${finalDamage} de daño al jefe.`);
      }

      // Fase 3 -> Desvanecimiento de impacto y turno del boss o victoria
      setTimeout(() => {
        setAttackAnimPhase('none');
        setDamageNumber(null);
        setBonusDamage(0); // Consumir bonus
        
        if (newBossHp <= 0) {
          handleVictory();
        } else {
          // Breve pausa para saborear el impacto antes de la represalia del jefe
          setTimeout(() => {
            triggerBossTurn();
          }, 400);
        }
      }, 850);

    }, 550);
  };

  // TURNO DEL ENEMIGO (BOSS)
  const triggerBossTurn = () => {
    setCombatState('boss_attack');
    
    setTimeout(() => {
      // Daño del boss
      const maxDmg = examContent?.bossMaxDmg || 20;
      let incomingDmg = Math.round(maxDmg * (0.7 + Math.random() * 0.6));
      
      // Mitigación por defensa y escudo
      const defenseMitigation = Math.round((stats.attribute_defense || 10) * 0.6);
      incomingDmg = Math.max(4, incomingDmg - defenseMitigation);
      
      // MECÁNICA MASCOTA FELIZ: Si felicidad > 80, cada 3 turnos se reduce el daño del boss en 15%
      const petHappiness = stats?.pet_happiness ?? 50;
      const isPetDefending = petHappiness > 80 && turnCount % 3 === 0;
      if (isPetDefending) {
        incomingDmg = Math.round(incomingDmg * 0.85);
      }
      
      if (activeShield) {
        incomingDmg = Math.round(incomingDmg * 0.4); // Reducir 60%
        setSombraText(isPetDefending
          ? `Sombra: 🛡️ ¡El Escudo de Concentración y la barrera de tu mascota redujeron el daño enormemente!`
          : "Sombra: 🛡️ ¡El Escudo de Concentración bloqueó gran parte del daño!");
      } else if (isPetDefending) {
        setSombraText(`Sombra: 🛡️ ¡${avatar?.pet_name || 'Tu mascota'} lanzó una barrera mística que redujo el daño del jefe en un 15%!`);
      }

      const newPlayerHp = Math.max(0, playerHp - incomingDmg);
      setPlayerHp(newPlayerHp);
      setDamageNumber({ amount: incomingDmg, isBoss: false });
      playSound('hit');
      setCombatState('player_hurt');

      setTimeout(() => {
        setDamageNumber(null);
        
        if (newPlayerHp <= 0) {
          handleDefeat();
        } else {
          setTurnCount(prev => prev + 1);
          setCombatState('idle');
          setSombraText(`Sombra: Turno del Gremio escolar. ¡Diseña tu siguiente movimiento!`);
        }
      }, 1000);

    }, 800);
  };

  // USAR UN ARTEFACTO EN COMBATE
  const [isUsingItem, setIsUsingItem] = useState(false);
  const handleUseItem = (artifact: any) => {
    setIsUsingItem(false);
    playSound('powerup');
    
    // Aplicar efectos según el artefacto
    if (artifact.id.includes('shield') || artifact.id.includes('cape')) {
      setActiveShield(true);
      setSombraText(`Sombra: 🛡️ Usaste "${artifact.name}". Tu defensa se eleva para el próximo ataque.`);
    } else if (artifact.id.includes('potion') || artifact.id.includes('water') || artifact.id.includes('heart')) {
      setPlayerHp(prev => Math.min(100, prev + 50));
      setSombraText(`Sombra: ❤️ Usaste "${artifact.name}". Te has curado +50 HP.`);
    } else if (artifact.id.includes('wand') || artifact.id.includes('dumbbell') || artifact.id.includes('pen')) {
      setBonusDamage(30);
      setSombraText(`Sombra: 💥 Usaste "${artifact.name}". Tu próximo ataque tendrá +30 de daño bonus.`);
    } else {
      setPlayerHp(prev => Math.min(100, prev + 25));
      setBonusDamage(15);
      setSombraText(`Sombra: ✨ Usaste "${artifact.name}". Curado +25 HP y +15 de daño bonus.`);
    }

    // Trigger turno boss inmediatamente después de usar item
    setTimeout(() => {
      triggerBossTurn();
    }, 1200);
  };

  // MANEJAR VICTORIA Y CALIFICACIÓN
  const handleVictory = async () => {
    setBattlePhase('victory');
    setCombatState('victory');
    soundEngine.stopBackgroundMusic();
    playSound('victory');

    // Calcular calificación basada en turnos
    let grade = 6;
    if (turnCount <= 3) grade = 10;
    else if (turnCount <= 5) grade = 9;
    else if (turnCount <= 7) grade = 8;
    else if (turnCount <= 9) grade = 7;
    else grade = 6;

    // Calcular recompensas
    const coinsReward = grade * 10;
    const xpReward = missionExamQuest.xp_reward || 200;

    // Enviar calificación
    await submitExam(
      missionExamQuest.id, 
      grade * 10, // Pasa score (60-100)
      {}, 
      { intelligence: 2, defense: 1 }, 
      'corona_boss'
    );

    setSombraText(`Sombra: ¡Felicidades! Derrotaste al jefe en ${turnCount} turnos. Tu calificación académica es de ${grade}/10.`);
  };

  // MANEJAR DERROTA
  const handleDefeat = () => {
    setBattlePhase('defeat');
    setCombatState('defeat');
    soundEngine.stopBackgroundMusic();
    playSound('defeat');
    setSombraText("Sombra: ¡Has caído! Tus puntos de vida llegaron a cero.");
  };

  // REINTENTO DE BATALLA (CONSUME RETRY)
  const handleRetryBattle = () => {
    if (usedAttempts < totalAttemptsAllowed - 1) {
      setUsedAttempts(prev => prev + 1);
      startFight();
      setSombraText(`Sombra: ¡Oportunidad extra activada! Oportunidad usada: ${usedAttempts + 1}/${totalAttemptsAllowed - 1}. ¡A pelear!`);
    } else {
      playSound('error');
      alert("No tienes más oportunidades. Compra artefactos en la tienda académica.");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes JRPG-float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
        @keyframes slash-hit {
          0% { transform: scale(1) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.4) rotate(45deg); opacity: 1; }
          100% { transform: scale(1) rotate(90deg); opacity: 0; }
        }
        @keyframes firefly-up {
          0% { transform: translateY(0px) scale(0.8); opacity: 0; }
          50% { opacity: 0.8; }
          100% { transform: translateY(-30px) scale(1.2); opacity: 0; }
        }
        @keyframes treeSwaySoft {
          0%, 100% { transform: rotate(0deg) skewX(0deg); }
          50% { transform: rotate(1.8deg) skewX(0.8deg); }
        }
        @keyframes treeSwayAlt {
          0%, 100% { transform: rotate(0deg) skewX(0deg); }
          50% { transform: rotate(-1.8deg) skewX(-0.8deg); }
        }
        .jrpg-idle { animation: JRPG-float 2.5s ease-in-out infinite; }
        .slash-effect { animation: slash-hit 0.3s ease-out forwards; }
        .combat-firefly { animation: firefly-up 4s ease-in-out infinite; }
        .tree-sway-1 { transform-origin: bottom center; animation: treeSwaySoft 5.5s ease-in-out infinite; }
        .tree-sway-2 { transform-origin: bottom center; animation: treeSwayAlt 6.8s ease-in-out infinite; }
        .tree-sway-3 { transform-origin: bottom center; animation: treeSwaySoft 4.8s ease-in-out infinite 1.2s; }
        .tree-sway-4 { transform-origin: bottom center; animation: treeSwayAlt 7.2s ease-in-out infinite 0.5s; }
        
        @keyframes energy-slash-travel {
          0% { transform: translate(0, 0) scale(0.6) rotate(-15deg); opacity: 0; }
          15% { opacity: 1; transform: translate(40px, -15px) scale(1) rotate(-10deg); }
          80% { opacity: 1; transform: translate(320px, -45px) scale(1.35) rotate(15deg); }
          100% { transform: translate(420px, -55px) scale(1.6) rotate(30deg); opacity: 0; }
        }
        @keyframes slash-cross-burst {
          0% { transform: scale(0.3) rotate(0deg); opacity: 0; filter: brightness(2); }
          30% { transform: scale(1.4) rotate(20deg); opacity: 1; filter: brightness(2.5); }
          70% { transform: scale(1.6) rotate(35deg); opacity: 0.9; }
          100% { transform: scale(2) rotate(50deg); opacity: 0; filter: blur(4px); }
        }
        @keyframes boss-hit-shake {
          0%, 100% { transform: translate(0, 0) scale(1); filter: brightness(1); }
          20% { transform: translate(-18px, -6px) scale(0.95); filter: brightness(2.2) drop-shadow(0 0 35px rgba(239,68,68,0.95)); }
          40% { transform: translate(14px, 6px) scale(0.97); filter: brightness(1.8); }
          60% { transform: translate(-10px, 3px) scale(0.98); }
          80% { transform: translate(6px, -2px); }
        }
        @keyframes hero-strike-lunge {
          0% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(40px, -15px) scale(1.15); filter: drop-shadow(0 0 25px #f59e0b); }
          70% { transform: translate(30px, -10px) scale(1.1); }
          100% { transform: translate(0, 0) scale(1); }
        }
        .animate-slash-travel { animation: energy-slash-travel 0.45s ease-out forwards; }
        .animate-slash-burst { animation: slash-cross-burst 0.55s ease-out forwards; }
        .animate-boss-shake { animation: boss-hit-shake 0.65s ease-out forwards; }
        .animate-hero-lunge { animation: hero-strike-lunge 0.65s ease-out forwards; }
      `}} />

      {/* Arena de Combate RPG Inmersiva */}
      <div className="relative w-full max-w-5xl mx-auto rounded-3xl bg-slate-950/95 border-2 border-indigo-500/40 shadow-2xl shadow-indigo-950/60 overflow-hidden min-h-[580px] flex flex-col justify-between p-4 sm:p-6 text-white font-sans select-none">
        
        {/* Top Header UI */}
        <div className="flex flex-wrap justify-between items-center w-full px-2 z-20 pb-3 gap-3 border-b border-slate-800/80">
          {/* Selector de Asignatura */}
          <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-indigo-500/30 shadow-md">
            <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">ASIGNATURA:</span>
            <select 
              disabled={battlePhase === 'fight'}
              value={selectedMissionId}
              onChange={(e) => setSelectedMissionId(e.target.value)}
              className="bg-transparent text-xs font-black border-none text-zinc-100 focus:outline-none cursor-pointer uppercase tracking-wider"
            >
              {missions.map(m => (
                <option key={m.id} value={m.id} className="bg-zinc-900 text-zinc-100">{m.title}</option>
              ))}
            </select>
          </div>

          {/* Poder de Batalla Dinámico HUD */}
          <div 
            className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-emerald-500/40 shadow-md group relative cursor-help"
            title={`Poder Base: ${totalBasePower} | Multiplicador Tareas: ${Math.round(homeworkMultiplier * 100)}% | Poder Efectivo: ${effectivePower}`}
          >
            <Zap className="h-4 w-4 text-emerald-400 fill-current animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black text-zinc-100 uppercase tracking-widest leading-none flex items-center gap-1.5">
                PODER ACADÉMICO: <strong className="text-emerald-400 font-extrabold">{effectivePower} PTS</strong>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">({battlePowerPercent}%)</span>
              </span>
              <span className="text-[8px] text-zinc-400 font-medium leading-tight mt-0.5">
                Nivel ({breakdown.levelPower}p) + Misiones ({breakdown.questPower}p) + Artefactos ({breakdown.artifactPower}p)
              </span>
            </div>
          </div>

          {/* Regulador de Volumen y Reset */}
          <div className="flex gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md items-center">
            <button 
              onClick={() => {
                if (volume > 0) {
                  setPrevVolume(volume);
                  setVolume(0);
                } else {
                  setVolume(prevVolume > 0 ? prevVolume : 0.3);
                }
              }}
              className="p-1 rounded bg-zinc-950 border border-slate-800 hover:bg-slate-800 transition-all cursor-pointer"
              title="Silenciar / Activar sonido"
            >
              {volume === 0 ? <VolumeX className="h-3.5 w-3.5 text-rose-500" /> : <Volume2 className="h-3.5 w-3.5 text-emerald-400" />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={volume} 
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
            />
            <button 
              onClick={handleReset}
              className="p-1 rounded bg-zinc-950 border border-slate-800 hover:bg-slate-800 text-zinc-400 hover:text-white transition-all ml-1 cursor-pointer"
              title="Reiniciar batalla"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* CAMPO DE BATALLA SIDE-VIEW (Classic JRPG con espacio ampliado) */}
        <div className="relative min-h-[360px] sm:min-h-[380px] w-full flex items-center justify-between px-4 sm:px-8 py-4 my-2 bg-gradient-to-b from-indigo-950/70 via-slate-950 to-zinc-950 border border-indigo-500/20 rounded-2xl overflow-hidden">
          
          {/* Base Background Image Layer */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <img 
              src="/images/rpg/background/Background.png" 
              alt="Forest Background Base" 
              className="w-full h-full object-cover opacity-75"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-indigo-950/30 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-b from-blue-950/30 via-transparent to-zinc-950/70" />
          </div>

          {/* Layered Animated Forest Trees Layer */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex items-end">
            <img 
              src="/images/rpg/background/Dark-Tree.png" 
              alt="Dark Tree" 
              className="tree-sway-2 absolute bottom-[2%] left-[1%] h-36 opacity-60 object-contain"
            />
            <img 
              src="/images/rpg/background/Red-Tree.png" 
              alt="Red Tree" 
              className="tree-sway-1 absolute bottom-[5%] left-[15%] h-32 opacity-65 object-contain"
            />
            <img 
              src="/images/rpg/background/Green-Tree.png" 
              alt="Green Tree" 
              className="tree-sway-3 absolute bottom-[6%] left-[32%] h-36 opacity-65 object-contain"
            />
            <img 
              src="/images/rpg/background/Golden-Tree.png" 
              alt="Golden Tree" 
              className="tree-sway-2 absolute bottom-[7%] left-[68%] h-36 opacity-65 object-contain"
            />
          </div>

          {/* Floating Firefly Particles */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            <div className="combat-firefly absolute left-[15%] top-[70%] w-1.5 h-1.5 rounded-full bg-yellow-400 blur-[0.5px]" style={{ animationDelay: '0s' }} />
            <div className="combat-firefly absolute left-[28%] top-[60%] w-1 h-1 rounded-full bg-emerald-400 blur-[0.5px]" style={{ animationDelay: '1.2s' }} />
            <div className="combat-firefly absolute left-[42%] top-[80%] w-2 h-2 rounded-full bg-yellow-300 blur-[1px]" style={{ animationDelay: '0.5s' }} />
            <div className="combat-firefly absolute left-[60%] top-[65%] w-1.5 h-1.5 rounded-full bg-yellow-400 blur-[0.5px]" style={{ animationDelay: '2s' }} />
            <div className="combat-firefly absolute left-[80%] top-[55%] w-2 h-2 rounded-full bg-yellow-300 blur-[1px]" style={{ animationDelay: '1.7s' }} />
          </div>
          
          {/* EFECTO DE DAÑO FLOTANTE */}
          {damageNumber && (
            <div 
              className="absolute top-[22%] z-50 px-4 py-2 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border-2 border-yellow-300 text-white font-black text-xl sm:text-2xl rounded-2xl shadow-[0_0_35px_rgba(239,68,68,1)] animate-floating-damage flex items-center gap-2 pointer-events-none"
              style={{ left: damageNumber.isBoss ? '65%' : '15%' }}
            >
              <span className="text-2xl animate-spin">💥</span>
              <span>-{damageNumber.amount} HP</span>
              {damageNumber.isBoss && <span className="text-yellow-300 text-xs font-black uppercase tracking-wider ml-1 bg-black/40 px-2 py-0.5 rounded-md border border-yellow-400/40">¡Impacto Crítico!</span>}
            </div>
          )}

          {/* FLASH CINEMÁTICO AL IMPACTAR */}
          {attackAnimPhase === 'impact' && (
            <div className="absolute inset-0 bg-white/25 pointer-events-none z-40 animate-pulse transition-opacity duration-300" />
          )}

          {/* SHIELD EFFECT ON PLAYER */}
          {activeShield && combatState === 'player_hurt' && (
            <div className="absolute left-[15%] top-[35%] z-40 h-24 w-24 border-4 border-cyan-400/80 rounded-full animate-pulse flex items-center justify-center">
              <Shield className="w-12 h-12 text-cyan-300" />
            </div>
          )}

          {/* LADO IZQUIERDO: ESCUADRÓN ESTUDIANTIL (HÉROE + MASCOTA + ALIADO SANTI + MASCOTA DE SANTI) */}
          <div className="flex items-end gap-3 sm:gap-6 z-20 self-end mb-2 max-w-[58%]">
            
            {/* GRUPO 1: HÉROE Y SU MASCOTA (PERFECTAMENTE ALINEADOS) */}
            <div className={`flex flex-col items-center relative transition-transform ${
              combatState === 'player_attack' ? 'translate-x-10 sm:translate-x-16 -translate-y-2 scale-105 duration-200' : 'duration-500'
            }`}>
              
              {/* DUO HÉROE Y MASCOTA EN EL MISMO PLANO HORIZONTAL Y VERTICAL */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 relative">
                
                {/* 1. HÉROE PRINCIPAL */}
                <div className="flex flex-col items-center relative jrpg-idle">
                  {/* Badge Flotante de Nombre y Rol */}
                  <div className="flex items-center gap-1 mb-1 px-2.5 py-0.5 rounded-full bg-slate-950/85 border border-amber-400/40 shadow-md backdrop-blur-sm">
                    <Sparkles className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
                    <span className="text-[8.5px] font-black uppercase text-amber-300 tracking-wider truncate max-w-[90px]">
                      {avatar?.avatar_name || 'Mi Personaje'}
                    </span>
                  </div>

                  {/* Sprite del Avatar sin recuadro ni borde, de cuerpo completo */}
                  <div className="relative h-36 w-24 sm:h-44 sm:w-28 flex items-center justify-center shrink-0">
                    <AnimeAvatarSprite
                      gender={(avatar as any)?.gender ?? 'female'}
                      rpgClass={(avatar as any)?.rpg_class ?? avatar?.outfit_style ?? 'mago'}
                      headType={(avatar as any)?.head_type ?? avatar?.eyes_style ?? 'standard'}
                      skinTone={(avatar as any)?.skin_tone ?? 'light'}
                      hairColor={avatar?.hair_color ?? 'yellow'}
                      hairStyle={avatar?.hair_style ?? 'spiky'}
                      eyesStyle={avatar?.eyes_style ?? 'determined'}
                      raceFeature={avatar?.race_feature}
                      bodyScale={(avatar as any)?.body_scale ?? 'normal'}
                      equippedShoes={avatar?.equipped_shoes || 'shoes_tan_boots'}
                      equippedBottom={avatar?.equipped_bottom || 'bottom_ripped_jeans'}
                      equippedTop={avatar?.equipped_top || 'top_dia_de_muertos'}
                      equippedOuterwear={avatar?.equipped_outerwear}
                      equippedHat={avatar?.equipped_hat || 'hat_snapback_trainer'}
                      equippedAccessory={avatar?.equipped_accessory || 'acc_red_backpack'}
                      equippedArtifacts={ownedArtifactIds}
                      showPedestal={false}
                      zoom="full"
                      animationState={
                        combatState === 'player_attack' ? 'cast' :
                        combatState === 'victory' ? 'cheer' : 'idle'
                      }
                      className="w-full h-full"
                    />
                  </div>
                  {/* Sombra base en el suelo */}
                  <div className="w-16 h-2.5 bg-black/40 rounded-full blur-[2px] -mt-1 pointer-events-none" />
                </div>

                {/* 2. COMPAÑERO ELEMENTAL VIVO (MASCOTA ALINEADA AL COSTADO DEL HÉROE) */}
                <div className="flex flex-col items-center relative jrpg-idle shrink-0">
                  {/* Halo Luminoso Trasero */}
                  <div 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none filter blur-md opacity-85 transition-all duration-300"
                    style={{
                      backgroundColor: heroPetMeta.glowColor,
                      width: '64px',
                      height: '64px',
                      boxShadow: `0 0 20px ${heroPetMeta.glowColor}`
                    }}
                  />
                  <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center filter drop-shadow-[0_0_14px_rgba(45,212,191,0.9)] animate-pet-map-float">
                    <PetSvgRenderer
                      raceId={avatar?.pet_type || 'cryo_dragon'}
                      stage={stats?.pet_stage || 'baby'}
                      actionId={combatState === 'player_attack' ? 'attack_bite' : combatState === 'victory' ? 'joy_bounce' : 'idle'}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="w-12 h-2 bg-black/40 rounded-full blur-[2px] mt-1 pointer-events-none" />
                  <span className="text-[8px] font-black uppercase text-teal-300 tracking-wider truncate max-w-[70px] bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-teal-500/30 mt-1 shadow-md z-10">
                    {avatar?.pet_name || 'Mascota'}
                  </span>
                </div>

              </div>

              {/* Barra de Vida y Maná Flotante del Jugador Centrada */}
              <div className="w-full max-w-[140px] mt-2 flex flex-col gap-1 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/80 shadow-md">
                {/* HP */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[7.5px] font-black text-zinc-200 font-mono">
                    <span className="text-emerald-400">HP</span>
                    <span>{playerHp}/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-300" style={{ width: `${playerHp}%` }} />
                  </div>
                </div>
                {/* MP */}
                <div className="flex flex-col gap-0.5">
                  <div className="flex justify-between items-center text-[7.5px] font-black text-cyan-400 font-mono">
                    <span className="text-cyan-400">MP</span>
                    <span>85/100</span>
                  </div>
                  <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '85%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* GRUPO 2: ALIADO SANTI + SU MASCOTA ACOMPAÑANTE (ALINEADOS AL COSTADO) */}
            {allyAvatar && (
              <div className="hidden sm:flex flex-col items-center">
                <div className="flex items-center gap-2.5 relative">
                  
                  {/* Avatar de Santi */}
                  <div className="flex flex-col items-center relative jrpg-idle opacity-95">
                    <div className="flex items-center gap-1 mb-1 px-2 py-0.5 rounded-full bg-slate-950/85 border border-slate-700 shadow-md backdrop-blur-sm">
                      <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wider truncate max-w-[80px]">
                        {allyAvatar.avatar_name || 'SantiAvatar'}
                      </span>
                    </div>
                    <div className="relative h-36 w-24 sm:h-44 sm:w-28 flex items-center justify-center shrink-0">
                      <AnimeAvatarSprite
                        gender={(allyAvatar as any)?.gender ?? 'male'}
                        rpgClass={(allyAvatar as any)?.rpg_class ?? allyAvatar?.outfit_style ?? 'guerrero'}
                        headType={(allyAvatar as any)?.head_type ?? 'standard'}
                        skinTone={(allyAvatar as any)?.skin_tone ?? 'light'}
                        hairColor={allyAvatar?.hair_color ?? '#4B5563'}
                        hairStyle={allyAvatar?.hair_style ?? 'spiky'}
                        eyesStyle={allyAvatar?.eyes_style ?? 'happy'}
                        raceFeature={allyAvatar?.race_feature}
                        bodyScale={(allyAvatar as any)?.body_scale ?? 'normal'}
                        equippedShoes={allyAvatar?.equipped_shoes}
                        equippedBottom={allyAvatar?.equipped_bottom}
                        equippedTop={allyAvatar?.equipped_top}
                        equippedOuterwear={allyAvatar?.equipped_outerwear}
                        equippedHat={allyAvatar?.equipped_hat}
                        equippedAccessory={allyAvatar?.equipped_accessory}
                        showPedestal={false}
                        zoom="full"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="w-16 h-2.5 bg-black/40 rounded-full blur-[2px] -mt-1 pointer-events-none" />
                  </div>

                  {/* Mascota Elemental de Santi */}
                  <div className="flex flex-col items-center relative jrpg-idle shrink-0">
                    <div 
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none filter blur-md opacity-80 transition-all duration-300"
                      style={{
                        backgroundColor: allyPetMeta?.glowColor || '#8B5CF6',
                        width: '56px',
                        height: '56px',
                        boxShadow: `0 0 16px ${allyPetMeta?.glowColor || '#8B5CF6'}`
                      }}
                    />
                    <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center filter drop-shadow-[0_0_12px_rgba(168,85,247,0.85)] animate-pet-map-float">
                      <PetSvgRenderer
                        raceId={allyAvatar?.pet_type || 'dragon'}
                        stage="baby"
                        actionId="idle"
                        className="w-full h-full"
                      />
                    </div>
                    <div className="w-10 h-2 bg-black/40 rounded-full blur-[2px] mt-1 pointer-events-none" />
                    <span className="text-[7.5px] font-black uppercase text-purple-300 tracking-wider truncate max-w-[60px] bg-slate-950/80 backdrop-blur-sm px-2 py-0.5 rounded-md border border-purple-500/30 mt-1 shadow-md z-10">
                      {allyAvatar?.pet_name || 'PetSanti'}
                    </span>
                  </div>

                </div>

                {/* HP Ally */}
                <div className="w-full max-w-[130px] mt-2 flex flex-col gap-0.5 bg-slate-950/85 backdrop-blur-md p-1.5 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center text-[7px] font-bold text-zinc-300 font-mono">
                    <span>HP</span>
                    <span>100/100</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-400 to-teal-400" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================================
              ANIMACIÓN DE ATAQUE Y EFECTOS VISUALES CINEMÁTICOS
              ========================================================================= */}
          
          {/* FASE 1: PROYECTIL / TAJO DE ENERGÍA VIAJANDO HACIA EL JEFE */}
          {attackAnimPhase === 'projectile' && (
            <div 
              className="absolute top-[34%] sm:top-[36%] z-50 pointer-events-none animate-energy-travel flex items-center"
              style={{ width: '180px', height: '60px' }}
            >
              <div className="relative flex items-center w-full h-full">
                {/* Hoja de energía radiante cortando el aire */}
                <div 
                  className={`w-36 sm:w-44 h-12 sm:h-14 rounded-full ${
                    attackActionType === 'skill'
                      ? 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-400 shadow-[0_0_35px_rgba(34,211,238,1)]'
                      : 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 shadow-[0_0_35px_rgba(245,158,11,1)]'
                  } blur-[1px] rotate-[-12deg] flex items-center justify-center`}
                >
                  <div className="w-28 sm:w-32 h-3 bg-white rounded-full blur-[0.5px]" />
                </div>
                {/* Estela y chispas cinemáticas */}
                <div className="absolute -left-8 flex gap-1.5 items-center opacity-95 animate-pulse">
                  <span className="text-3xl animate-spin">✨</span>
                  <span className="text-2xl">⚡</span>
                  <span className="text-xl">🔥</span>
                </div>
              </div>
            </div>
          )}

          {/* FASE 2: IMPACTO Y EXPLOSIÓN CRUZADA SOBRE EL JEFE DRAGÓN */}
          {attackAnimPhase === 'impact' && (
            <div 
              className="absolute top-[18%] sm:top-[20%] left-[60%] sm:left-[64%] z-50 pointer-events-none flex items-center justify-center animate-impact-burst"
              style={{ width: '260px', height: '260px' }}
            >
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Tajo Diagonal 1 */}
                <div 
                  className={`absolute w-64 sm:w-72 h-4 sm:h-5 rounded-full ${
                    attackActionType === 'skill'
                      ? 'bg-cyan-300 shadow-[0_0_40px_#22d3ee]'
                      : 'bg-amber-300 shadow-[0_0_40px_#f59e0b]'
                  } rotate-45 transform origin-center`}
                />
                {/* Tajo Diagonal 2 Cruzado */}
                <div 
                  className={`absolute w-64 sm:w-72 h-4 sm:h-5 rounded-full ${
                    attackActionType === 'skill'
                      ? 'bg-fuchsia-300 shadow-[0_0_40px_#d946ef]'
                      : 'bg-yellow-100 shadow-[0_0_40px_#fbbf24]'
                  } -rotate-45 transform origin-center`}
                />
                {/* Flash central supernoval */}
                <div className="absolute w-40 h-40 rounded-full bg-white/95 blur-xl animate-ping" />
                {/* Emoticonos y partículas de impacto */}
                <div className="absolute -top-6 -right-6 text-5xl animate-bounce">💥</div>
                <div className="absolute -bottom-4 -left-4 text-4xl animate-pulse">⚡</div>
                <div className="absolute top-2 left-0 text-4xl animate-spin">✨</div>
              </div>
            </div>
          )}

          {/* VS INDICATOR CENTRADO */}
          <div className="flex flex-col items-center justify-center z-20 select-none px-2">
            <div className="px-3 py-1.5 rounded-2xl bg-slate-950/85 border border-indigo-500/30 shadow-lg text-indigo-300 font-black text-xs font-mono tracking-widest flex items-center gap-1.5 backdrop-blur-md">
              <Swords className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>VS</span>
            </div>
          </div>

          {/* LADO DERECHO: ENEMIGOS (TAREAS Y BOSS GIGANTE) */}
          <div className="flex flex-col items-end gap-3 z-20 max-w-[48%]">
            {battlePhase !== 'fight' ? (
              // Vista de Tareas Pendientes como Monstruos
              <div className="flex flex-wrap justify-end gap-3">
                {homeworkQuests.map((quest, idx) => {
                  const status = questAttempts.some(a => a.quest_id === quest.id && (a.is_completed || a.score >= 60)) ? 'completed' : 'pending';
                  
                  return (
                    <div key={quest.id} className="flex flex-col items-center gap-1 bg-slate-900/80 p-2 sm:p-2.5 rounded-2xl border border-slate-800 shadow-md">
                      <div className="relative h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center">
                        {status === 'completed' ? (
                          // Enemigo Derrotado
                          <div className="opacity-45 text-center flex flex-col items-center">
                            <span className="text-3xl grayscale">☠️</span>
                            <span className="text-[8px] text-emerald-400 font-black uppercase tracking-wider block mt-1">Vencido</span>
                          </div>
                        ) : (
                          // Tarea Activa (Dragón)
                          <div className="jrpg-idle flex flex-col items-center relative">
                            <img 
                              src={getDragonSpriteForQuest(quest.id, idx)} 
                              alt={quest.title} 
                              className="w-24 h-24 sm:w-28 sm:h-28 object-contain filter drop-shadow-[0_4px_14px_rgba(239,68,68,0.7)]"
                            />
                            {/* HP Bar */}
                            <div className="w-16 h-1.5 bg-red-950 border border-slate-800 rounded-full mt-1 overflow-hidden">
                              <div className="h-full bg-red-500 w-full" />
                            </div>
                          </div>
                        )}
                      </div>
                      <span className="text-[8.5px] font-bold text-zinc-300 text-center truncate w-24">{quest.title}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Vista en Combate: Examen Boss Final Activo
              <div className={`flex flex-col items-center relative gap-2 duration-300 ${combatState === 'boss_attack' ? '-translate-x-12 scale-105 duration-200' : ''}`}>
                
                {/* Sprite del Jefe Final Dragón con Reacción Sísmica a los Golpes */}
                <div className={`relative ${
                  (combatState === 'boss_hurt' || attackAnimPhase === 'impact') ? 'animate-boss-hit' : 'jrpg-idle'
                }`}>
                  <img 
                    src={getDragonSpriteForQuest(selectedMissionId, 0)} 
                    alt={examContent.bossName || "Dragón Jefe Examen"} 
                    className="w-48 h-48 sm:w-60 sm:h-60 object-contain filter drop-shadow-[0_0_35px_rgba(239,68,68,0.85)]"
                  />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-500/20 border border-yellow-400/40 backdrop-blur-sm px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-lg">
                    <span className="text-xs">👑</span>
                    <span className="text-[9px] font-black text-yellow-300 uppercase tracking-widest">Jefe Boss</span>
                  </div>

                  {/* Glitch y Flash Rojo en Daño */}
                  {(combatState === 'boss_hurt' || attackAnimPhase === 'impact') && (
                    <div className="absolute inset-0 bg-red-500/40 mix-blend-color-dodge animate-ping rounded-full" />
                  )}
                </div>

                {/* HP Bar del Jefe */}
                <div className="w-40 sm:w-48 bg-zinc-950/90 p-2 rounded-xl border border-teal-900/60 shadow-lg text-center">
                  <div className="flex justify-between items-center text-[8px] font-black text-teal-300 uppercase tracking-widest mb-1">
                    <span className="truncate max-w-[90px]">{examContent?.bossName || 'EXAMEN FINAL'}</span>
                    <span>HP {bossHp}/{bossMaxHp}</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-800">
                    <div 
                      className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                      style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* CONTROLES Y DIÁLOGO DE COMBATE */}
        <div className="w-full flex flex-col justify-between pt-2 gap-3 z-20 border-t border-slate-800/80">
          
          {/* Diálogo Sombra */}
          <div className="relative bg-zinc-950/95 border border-teal-500/40 rounded-2xl p-2.5 sm:p-3 flex gap-3 items-center backdrop-blur-md shadow-lg">
            <div className="absolute -top-3 left-4 px-2.5 py-0.5 bg-teal-500 text-[8px] font-black uppercase tracking-wider text-slate-950 rounded-t-md rounded-br-md shadow-md">
              SOMBRA LOG
            </div>
            
            <div className="h-7 w-7 rounded-xl bg-teal-950/80 border border-teal-400/50 flex items-center justify-center text-xs animate-bounce shrink-0">
              💡
            </div>
            <div className="flex-1 overflow-y-auto max-h-[45px]">
              <p className="text-[10px] sm:text-xs text-zinc-200 font-medium leading-relaxed">
                {sombraText}
              </p>
            </div>
          </div>

          {/* Menú de Botones e Interacciones */}
          <div className="flex flex-wrap justify-between items-center gap-3">
            {/* Opciones en reposo */}
            {battlePhase === 'idle' && (
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={startFight}
                  className="px-6 py-2 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black tracking-widest uppercase rounded-xl transition-all shadow-lg shadow-amber-500/30 flex items-center gap-1.5 border border-amber-400/40 cursor-pointer active:scale-95"
                >
                  <Swords className="h-4 w-4" />
                  Iniciar Examen Boss ⚔️
                </button>
                <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-[10px] font-bold text-zinc-400">
                  <AlertCircle className="h-3.5 w-3.5 text-zinc-500" />
                  {completedHomeworkCount}/{totalHomeworkCount} Tareas completas
                </div>
              </div>
            )}

            {/* Opciones en Combate */}
            {battlePhase === 'fight' && (
              <div className="flex items-center gap-2 w-full justify-between flex-wrap">
                {/* Comandos del Jugador */}
                <div className="flex gap-2">
                  <button 
                    disabled={combatState !== 'idle'}
                    onClick={() => handlePlayerAttack('normal')}
                    className="px-4 py-2 bg-teal-800 hover:bg-teal-700 disabled:opacity-40 text-xs font-black rounded-xl border border-teal-500/30 tracking-wider transition-all uppercase text-white shadow cursor-pointer active:scale-95"
                  >
                    [ ⚔️ Atacar ]
                  </button>
                  <button 
                    disabled={combatState !== 'idle'}
                    onClick={() => handlePlayerAttack('skill')}
                    className="px-4 py-2 bg-indigo-800 hover:bg-indigo-700 disabled:opacity-40 text-xs font-black rounded-xl border border-indigo-500/30 tracking-wider transition-all uppercase text-white shadow cursor-pointer active:scale-95"
                  >
                    [ 🔮 Habilidad ]
                  </button>
                  <button 
                    disabled={combatState !== 'idle' || ownedArtifacts.length === 0}
                    onClick={() => setIsUsingItem(prev => !prev)}
                    className="px-4 py-2 bg-amber-800 hover:bg-amber-700 disabled:opacity-40 text-xs font-black rounded-xl border border-amber-500/30 tracking-wider transition-all uppercase text-white shadow cursor-pointer active:scale-95"
                  >
                    [ 🎒 Objetos ({ownedArtifacts.length}) ]
                  </button>
                </div>

                <div className="text-xs font-bold text-teal-400 bg-teal-950/60 px-3 py-1.5 rounded-xl border border-teal-900/40 font-mono font-black">
                  Ronda: {turnCount}
                </div>
              </div>
            )}

            {/* Pantalla de Victoria */}
            {battlePhase === 'victory' && (
              <div className="flex items-center gap-3 w-full justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  <span className="text-xs font-black text-emerald-400 uppercase">¡EXAMEN APROBADO!</span>
                </div>
                <div className="flex gap-2">
                  {usedAttempts < totalAttemptsAllowed - 1 && (
                    <button
                      onClick={handleRetryBattle}
                      className="px-4 py-1.5 bg-yellow-600 hover:bg-yellow-500 text-xs font-black uppercase text-white rounded-xl transition-all cursor-pointer"
                    >
                      Reintentar Examen (Oportunidad)
                    </button>
                  )}
                  <button 
                    onClick={handleReset}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-black uppercase text-zinc-300 rounded-xl transition-all cursor-pointer"
                  >
                    Continuar
                  </button>
                </div>
              </div>
            )}

            {/* Pantalla de Derrota */}
            {battlePhase === 'defeat' && (
              <div className="flex items-center gap-3 w-full justify-between flex-wrap">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-xs font-black text-red-500 uppercase">Derrota Académica</span>
                </div>
                <div className="flex gap-2">
                  {usedAttempts < totalAttemptsAllowed - 1 ? (
                    <button
                      onClick={handleRetryBattle}
                      className="px-4 py-1.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 text-xs font-black uppercase rounded-xl transition-all shadow-lg shadow-amber-500/30 border border-amber-400/40 cursor-pointer active:scale-95"
                    >
                      Usar Oportunidad ({usedAttempts + 1}/{totalAttemptsAllowed - 1})
                    </button>
                  ) : (
                    <div className="text-[10px] text-zinc-400 font-bold bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
                      Oportunidades agotadas. Consigue monedas y compra artefactos en la Tienda.
                    </div>
                  )}
                  <button 
                    onClick={handleReset}
                    className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-black uppercase text-zinc-300 rounded-xl transition-all cursor-pointer"
                  >
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown de Items para usar */}
        {isUsingItem && battlePhase === 'fight' && (
          <div className="absolute left-[30%] sm:left-[38%] bottom-[25%] z-50 w-72 bg-zinc-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl p-3 shadow-2xl flex flex-col gap-2 max-h-48 overflow-y-auto">
            <span className="text-[10px] font-black text-amber-400 uppercase border-b border-zinc-800 pb-1">Selecciona un artefacto:</span>
            {ownedArtifacts.map((art) => (
              <button
                key={art.id}
                onClick={() => handleUseItem(art)}
                className="flex items-center justify-between p-2 rounded-xl bg-zinc-950/80 hover:bg-zinc-800 text-left text-xs text-zinc-200 hover:text-white transition-all font-semibold cursor-pointer"
              >
                <span>{art.name}</span>
                <span className="text-[9px] text-amber-400 italic font-medium">{art.effect === 'extra_attempt' ? 'Oportunidad' : 'Efecto'}</span>
              </button>
            ))}
          </div>
        )}

        {/* Estilos e Inyección de Keyframes Cinemáticos JRPG */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes energy-travel {
            0% {
              left: 28%;
              opacity: 0;
              transform: scale(0.6) translateY(0) rotate(-15deg);
            }
            15% {
              opacity: 1;
            }
            80% {
              opacity: 1;
              transform: scale(1.15) translateY(-8px) rotate(8deg);
            }
            100% {
              left: 66%;
              opacity: 0.95;
              transform: scale(1.35) translateY(-12px) rotate(22deg);
            }
          }
          .animate-energy-travel {
            animation: energy-travel 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
          @keyframes impact-burst {
            0% {
              transform: scale(0.3);
              opacity: 1;
            }
            35% {
              transform: scale(1.3);
              opacity: 1;
            }
            100% {
              transform: scale(1.55);
              opacity: 0;
            }
          }
          .animate-impact-burst {
            animation: impact-burst 0.75s ease-out forwards;
          }
          @keyframes boss-hit-shake {
            0%, 100% { 
              transform: translateX(0) scale(1); 
              filter: brightness(1) drop-shadow(0 0 35px rgba(239,68,68,0.85)); 
            }
            15% { 
              transform: translateX(18px) rotate(4deg) scale(1.05); 
              filter: brightness(2) drop-shadow(0 0 50px rgba(255,255,255,1)); 
            }
            30% { 
              transform: translateX(-18px) rotate(-4deg); 
              filter: brightness(1.8) drop-shadow(0 0 45px rgba(239,68,68,1)); 
            }
            45% { 
              transform: translateX(12px) rotate(2deg); 
              filter: brightness(1.5); 
            }
            60% { 
              transform: translateX(-10px) rotate(-2deg); 
            }
            75% { 
              transform: translateX(6px); 
            }
          }
          .animate-boss-hit {
            animation: boss-hit-shake 0.7s ease-in-out;
          }
        `}} />

      </div>
    </div>
  );
}
