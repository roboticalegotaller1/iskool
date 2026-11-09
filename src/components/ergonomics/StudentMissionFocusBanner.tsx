"use client";

import React from 'react';
import Link from 'next/link';
import { Rocket, Globe, Sparkles, Trophy, Flame, Coins, Compass } from 'lucide-react';

interface StudentMissionFocusBannerProps {
  studentName: string;
  level: number;
  streakDays: number;
  coins: number;
  activeQuestTitle?: string;
  onStartActiveQuest: () => void;
  onOpenPetSanctuary: () => void;
}

export const StudentMissionFocusBanner: React.FC<StudentMissionFocusBannerProps> = ({
  studentName,
  level,
  streakDays,
  coins,
  activeQuestTitle,
  onStartActiveQuest,
  onOpenPetSanctuary,
}) => {
  return (
    <section
      data-testid="student-mission-focus-banner"
      className="mb-8 rounded-3xl border border-indigo-400/30 bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 p-5 sm:p-6 shadow-2xl text-white"
    >
      {/* Top 3-Item Quick Dock + Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onStartActiveQuest}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black text-slate-950 shadow-md"
          >
            🎯 1. Mi Misión de Hoy
          </button>
          <Link
            href="/student/idiomas"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-900/70 hover:bg-indigo-800 px-4 py-2 text-xs font-extrabold text-indigo-100 border border-indigo-400/30 transition"
          >
            <Globe className="h-3.5 w-3.5 text-cyan-300" />
            2. Idiomas & Avatar 3D
          </Link>
          <button
            type="button"
            onClick={onOpenPetSanctuary}
            className="inline-flex items-center gap-2 rounded-full bg-indigo-900/70 hover:bg-indigo-800 px-4 py-2 text-xs font-extrabold text-indigo-100 border border-indigo-400/30 transition"
          >
            🐾 3. Mi Compañero & Tienda
          </button>
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-slate-950/70 px-4 py-2 border border-white/10 text-xs font-extrabold">
          <span className="text-indigo-200">
            {studentName} • Nv.{level}
          </span>
          <span className="inline-flex items-center gap-1 text-orange-400">
            <Flame className="h-3.5 w-3.5" /> {streakDays}d
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Coins className="h-3.5 w-3.5" /> {coins}
          </span>
        </div>
      </div>

      {/* Main 2-Column Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left 8 Cols: Active Classroom Mission Card */}
        <div className="lg:col-span-8 rounded-2xl bg-white/95 text-slate-900 p-5 sm:p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-black text-emerald-800 mb-3">
              <Compass className="h-3.5 w-3.5 text-emerald-600" />
              🎯 MISIÓN ACTIVA EN TU SALÓN (Asignada por tu Profesor)
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 mb-1">
              {activeQuestTitle && !/supabase|prueba|test/i.test(activeQuestTitle)
                ? activeQuestTitle
                : 'Laboratorio de Ciencias y Conversación en Francés DELF A1'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-5">
              Completa los 3 pasos de tu misión del día para acreditar tu asistencia participativa y ganar +150 XP.
            </p>

            {/* 3-Step Visual Progress */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white font-black text-xs">
                  1
                </span>
                <span className="text-xs font-extrabold text-slate-800">Explorar Tema</span>
              </div>
              <div className="h-1 flex-1 rounded-full bg-emerald-500/40" />
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-800 font-black text-xs">
                  2
                </span>
                <span className="text-xs font-bold text-slate-600">Reto Interactivo</span>
              </div>
              <div className="h-1 flex-1 rounded-full bg-slate-200" />
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-900 border border-amber-300">
                <Trophy className="h-3.5 w-3.5 text-amber-600" /> +150 XP
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              data-testid="btn-student-start-mission-now"
              onClick={onStartActiveQuest}
              className="flex-1 min-w-[220px] inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 hover:bg-emerald-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/25 transition"
            >
              <Rocket className="h-4 w-4" />
              🚀 COMENZAR MISIÓN AHORA
            </button>
            <Link
              href="/student/idiomas"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-3.5 text-xs font-black text-indigo-900 transition"
            >
              🌐 Practicar Karaoke 3D (FR / EN)
            </Link>
          </div>
        </div>

        {/* Right 4 Cols: Motivational Companion Card */}
        <div className="lg:col-span-4 rounded-2xl bg-gradient-to-b from-indigo-900/90 to-slate-900/90 border border-indigo-400/30 p-5 flex flex-col justify-between">
          <div className="rounded-2xl bg-white text-slate-900 p-4 shadow-md relative">
            <div className="text-xs font-black text-indigo-700 mb-1 flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              ¡Hola {studentName}!
            </div>
            <p className="text-xs text-slate-700 font-semibold leading-relaxed">
              «Termina tu misión de hoy para desbloquear tu cofre de la semana y alimentar a tu compañero elemental.»
            </p>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 pt-3 border-t border-white/10">
            <div>
              <div className="text-xs font-black text-white">Compañero Elemental 60 FPS</div>
              <div className="text-[11px] text-indigo-200">Estado: ¡Listo para ayudarte!</div>
            </div>
            <button
              type="button"
              onClick={onOpenPetSanctuary}
              className="rounded-xl bg-amber-400 hover:bg-amber-300 px-3.5 py-2 text-xs font-black text-slate-950 transition shadow-sm"
            >
              🐾 Visitar Santuario
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
