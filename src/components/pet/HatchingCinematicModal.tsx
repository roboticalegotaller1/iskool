"use client";

import React, { useState, useEffect } from 'react';
import { ElementalPetRace } from '@/types';
import { PetSvgRenderer } from './PetSvgRenderer';
import { resolvePetRace, PetRaceMetadata, ELEMENTAL_PET_RACES } from './types';
import { Sparkles, Heart, Trophy, CheckCircle2, Shield } from 'lucide-react';

interface HatchingCinematicModalProps {
  isOpen: boolean;
  assignedRace?: ElementalPetRace;
  studentName?: string;
  onConfirmBond: (race: ElementalPetRace, petName: string) => void;
  onClose: () => void;
}

export const HatchingCinematicModal: React.FC<HatchingCinematicModalProps> = ({
  isOpen,
  assignedRace = 'cryo_dragon',
  studentName = 'Estudiante',
  onConfirmBond,
  onClose
}) => {
  // Fases de la cinemática: 'rumble' (temblor) -> 'crack' (grietas de luz) -> 'revealed' (nacimiento)
  const [phase, setPhase] = useState<'rumble' | 'crack' | 'revealed'>('rumble');
  const [customPetName, setCustomPetName] = useState('');
  const [chosenRace, setChosenRace] = useState<ElementalPetRace>(assignedRace);

  useEffect(() => {
    if (!isOpen) {
      setPhase('rumble');
      return;
    }

    // Elegir aleatoriamente una de las 10 razas si no viene predeterminada
    const randomRace = assignedRace || ELEMENTAL_PET_RACES[Math.floor(Math.random() * ELEMENTAL_PET_RACES.length)].id;
    setChosenRace(randomRace);
    const meta = resolvePetRace(randomRace);
    setCustomPetName(meta.name);

    // Secuencia de tiempos de la cinemática
    setPhase('rumble');
    const timer1 = setTimeout(() => {
      setPhase('crack');
    }, 1800);

    const timer2 = setTimeout(() => {
      setPhase('revealed');
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isOpen, assignedRace]);

  if (!isOpen) return null;

  const meta: PetRaceMetadata = resolvePetRace(chosenRace);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300">
      {/* Luces mágicas y estrellas de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full filter blur-3xl opacity-40 transition-all duration-1000"
          style={{ backgroundColor: meta.primaryColor }}
        />
        {/* Rayos celestiales */}
        {phase === 'crack' && (
          <div className="absolute inset-0 flex items-center justify-center animate-spin" style={{ animationDuration: '6s' }}>
            <div className="w-[800px] h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 rotate-45" />
            <div className="w-[800px] h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 -rotate-45" />
            <div className="w-[800px] h-2 bg-gradient-to-r from-transparent via-white to-transparent opacity-80 rotate-90" />
          </div>
        )}
      </div>

      <div className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center text-white overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Badge de logro inicial */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase mb-2">
          <Trophy className="h-4 w-4 text-amber-400" />
          <span>¡Primera Tarea Escolar Cumplida!</span>
        </div>

        {/* Textos y fases de la cinemática */}
        {phase === 'rumble' && (
          <div className="space-y-1 my-2">
            <h3 className="text-xl font-black text-white">
              El Huevo Rúnico vibra con fuerza...
            </h3>
            <p className="text-xs text-slate-400">
              Tu dedicación y esfuerzo en clase han despertado la magia ancestral.
            </p>
          </div>
        )}

        {phase === 'crack' && (
          <div className="space-y-1 my-2 animate-pulse">
            <h3 className="text-2xl font-black text-amber-300">
              ¡La cáscara se fractura con destellos de luz!
            </h3>
            <p className="text-xs text-slate-300">
              Haces de maná elemental emanan del interior...
            </p>
          </div>
        )}

        {phase === 'revealed' && (
          <div className="space-y-1.5 my-2 animate-in zoom-in-90 duration-500">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400 animate-spin" />
              <h3 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-200 via-white to-amber-200 bg-clip-text text-transparent">
                ¡Ha nacido tu Compañero de Vida!
              </h3>
            </div>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Se ha sellado un vínculo permanente contigo, <strong className="text-white">{studentName}</strong>.
            </p>
          </div>
        )}

        {/* AVATAR CENTRAL ANIMADO */}
        <div className="relative my-4 h-56 w-56 flex items-center justify-center">
          {phase === 'rumble' && (
            <div className="w-full h-full animate-bounce duration-200">
              <PetSvgRenderer raceId={chosenRace} stage="egg" />
            </div>
          )}

          {phase === 'crack' && (
            <div className="w-full h-full scale-110 animate-ping duration-1000">
              <PetSvgRenderer raceId={chosenRace} stage="egg" />
            </div>
          )}

          {phase === 'revealed' && (
            <div className="w-full h-full scale-110 animate-in zoom-in-75 duration-700">
              <PetSvgRenderer
                raceId={chosenRace}
                stage="baby"
                actionId="joy_bounce"
                isPetting={false}
              />
            </div>
          )}
        </div>

        {/* TARJETA DE REVELACIÓN TRAS ECLOSIÓN */}
        {phase === 'revealed' && (
          <div className="w-full bg-slate-950/70 border border-white/10 rounded-2xl p-4 text-left space-y-3 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Raza Asignada Oficial
                </span>
                <span className="text-base font-black text-white flex items-center gap-1.5">
                  <span>{meta.badgeEmoji}</span>
                  <span>{meta.title} ({meta.name})</span>
                </span>
              </div>
              <span className="px-3 py-1 rounded-xl text-xs font-black text-white" style={{ backgroundColor: meta.secondaryColor }}>
                {meta.element}
              </span>
            </div>

            <p className="text-xs text-slate-300 italic leading-relaxed">
              &quot;{meta.tagline}&quot;
            </p>

            {/* Input de Nombre personalizado de la mascota */}
            <div className="space-y-1 pt-1">
              <label className="text-[11px] font-bold text-slate-300 block">
                Nombra a tu nuevo compañero:
              </label>
              <input
                type="text"
                value={customPetName}
                onChange={(e) => setCustomPetName(e.target.value)}
                placeholder="Ej. Copito, Flamis, Axito..."
                className="w-full bg-slate-900 border border-white/20 rounded-xl px-3.5 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-400 transition"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                onConfirmBond(chosenRace, customPetName.trim() || meta.name);
                onClose();
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl shadow-amber-500/25 transition-transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Sellar Vínculo y Comenzar Travesía</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
