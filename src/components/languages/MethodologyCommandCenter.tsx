"use client";

import React, { useState } from 'react';
import {
    INTERNATIONAL_BENCHMARK_AUDITS,
    CONTINUOUS_METHODOLOGY_STAGES,
    IDENTIFIABLE_LANGUAGE_SKILLS,
    CONTINUOUS_40_WEEK_BLUEPRINT,
    LANGUAGE_PROGRAM_ARCHITECTURES,
    type TargetLanguageCode,
    type ContinuousMethodologyStage,
} from './data/internationalMethodologyFramework';

interface MethodologyCommandCenterProps {
    activeLanguage: TargetLanguageCode;
    currentCefrLevel: string;
    currentCenniBand: string;
    currentPhaseLabel: string;
    activeWeekNumber?: number;
    isLightMode?: boolean;
    compactBannerOnly?: boolean;
    onNavigateToTool: (toolTab: 'hardware' | 'editor' | 'karaoke' | 'writing' | 'analytics' | 'curriculum' | 'reports' | 'methodology') => void;
    onSelectWeekFromBlueprint?: (weekNumber: number) => void;
}

export default function MethodologyCommandCenter({
    activeLanguage,
    currentCefrLevel,
    currentCenniBand,
    currentPhaseLabel,
    activeWeekNumber = 1,
    isLightMode = true,
    compactBannerOnly = false,
    onNavigateToTool,
    onSelectWeekFromBlueprint,
}: MethodologyCommandCenterProps) {
    const [activeStageIndex, setActiveStageIndex] = useState<number>(1); // default Stage 2 or 1
    const [selectedSubView, setSelectedSubView] = useState<'cycle' | 'skills' | 'audit' | 'blueprint'>('cycle');
    const [selectedSkillId, setSelectedSkillId] = useState<string>('phonetics');
    const [completedStageIds, setCompletedStageIds] = useState<string[]>(['phonetic_awakening', 'direct_immersion']);

    const isFrench = activeLanguage === 'fr-FR';
    const programArch = LANGUAGE_PROGRAM_ARCHITECTURES[activeLanguage];
    const activeStage: ContinuousMethodologyStage = CONTINUOUS_METHODOLOGY_STAGES[activeStageIndex] || CONTINUOUS_METHODOLOGY_STAGES[0];
    const activeSkill = IDENTIFIABLE_LANGUAGE_SKILLS.find(s => s.id === selectedSkillId) || IDENTIFIABLE_LANGUAGE_SKILLS[0];

    const toggleStageComplete = (stageId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setCompletedStageIds(prev =>
            prev.includes(stageId) ? prev.filter(id => id !== stageId) : [...prev, stageId]
        );
    };

    const continuousCompletionPct = Math.round((completedStageIds.length / CONTINUOUS_METHODOLOGY_STAGES.length) * 100);

    // ------------------------------------------------------------------------
    // COMPACT CONTINUOUS METHODOLOGY RIBBON (DISPLAYED ACROSS ALL TABS)
    // ------------------------------------------------------------------------
    if (compactBannerOnly) {
        return (
            <div className={`rounded-3xl p-4 sm:p-5 border transition-all shadow-sm ${
                isLightMode
                    ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-500/30 shadow-indigo-950/10'
                    : 'bg-gradient-to-r from-[#0B1120] via-[#111827] to-[#0B1120] text-white border-indigo-500/30'
            }`}>
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
                    <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                            {isFrench ? 'MODÈLE CONTINU CECR 5E · DELF/DALF' : 'MODELO CONTINUO CEFR 5E · CAMBRIDGE/CENNI'}
                        </span>
                        <h3 className="text-xs sm:text-sm font-black tracking-tight text-white">
                            {isFrench
                                ? 'Architecture Neuro-Communicative & Approche Actionnelle Intégrée'
                                : 'Arquitectura Neuro-Comunicativa & Ciclo Metodológico Continuo'}
                        </h3>
                        <span className="hidden md:inline-block text-[11px] text-indigo-200/80 font-medium">
                            ({currentCefrLevel} · {currentCenniBand} · Semana {activeWeekNumber}/40)
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/15">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
                                Progreso del Ciclo:
                            </span>
                            <span className="text-xs font-black text-emerald-400">{continuousCompletionPct}%</span>
                        </div>
                        <button
                            onClick={() => onNavigateToTool('methodology')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[11px] uppercase tracking-wider transition-all shadow-md cursor-pointer"
                        >
                            ⚡ {isFrench ? 'Ouvrir Matrice Méthodologique' : 'Ver Auditoría & Metodología CEFR'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                    {CONTINUOUS_METHODOLOGY_STAGES.map((stage, idx) => {
                        const isDone = completedStageIds.includes(stage.id);
                        return (
                            <div
                                key={stage.id}
                                onClick={() => {
                                    setActiveStageIndex(idx);
                                    onNavigateToTool(stage.primaryToolTab);
                                }}
                                className={`group relative rounded-2xl p-2.5 border transition-all cursor-pointer flex flex-col justify-between ${
                                    isDone
                                        ? 'bg-white/10 border-emerald-400/40 hover:bg-white/15'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between gap-1 mb-1">
                                    <span
                                        className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                                        style={{ backgroundColor: `${stage.colorHex}33`, color: '#e0e7ff' }}
                                    >
                                        {stage.code}
                                    </span>
                                    <span className={`text-[10px] font-black ${isDone ? 'text-emerald-400' : 'text-slate-400'}`}>
                                        {isDone ? '✓ Activo' : `${stage.weightInContinuousScore}%`}
                                    </span>
                                </div>
                                <div className="text-[11px] font-extrabold text-white leading-snug mb-1 group-hover:text-indigo-200 transition-colors">
                                    {stage.titleTarget[activeLanguage]}
                                </div>
                                <div className="flex items-center justify-between text-[9px] text-indigo-200/75 font-semibold pt-1 border-t border-white/10">
                                    <span className="truncate">{stage.primaryToolLabel}</span>
                                    <span className="text-indigo-300 font-black ml-1">→</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // ------------------------------------------------------------------------
    // FULL SURGICAL METHODOLOGY COMMAND CENTER VIEW
    // ------------------------------------------------------------------------
    return (
        <div className="space-y-6">
            {/* Hero Executive Header */}
            <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-xl relative overflow-hidden">
                <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2.5 max-w-3xl">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black uppercase tracking-widest">
                                NANO BANANA 2.1 · ARQUITECTURA METODOLÓGICA GLOBAL
                            </span>
                            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-200 text-[10px] font-black uppercase tracking-widest">
                                {currentCefrLevel} · {currentCenniBand} · {currentPhaseLabel}
                            </span>
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                            {programArch.programTitle}
                        </h2>
                        <p className="text-xs sm:text-sm text-indigo-100/85 leading-relaxed">
                            {isFrench
                                ? 'Synthèse chirurgicale des meilleures pratiques mondiales (Alliance Française / FEI DELF-DALF, Cambridge One, Berlitz Direct Method, Quick Learning Phonetic DSP et CECR Volume Complémentaire) intégrée dans un modèle continu de 40 semaines (160 séances) avec avatars historiques à 60 FPS.'
                                : 'Síntesis quirúrgica de las mejores prácticas internacionales (Cambridge One, The Anglo CELTA/DELTA, Berlitz Direct Immersion, Quick Learning Phonetic DSP y CEFR Companion Volume) integrada en un modelo continuo de 40 semanas (160 lecciones) con avatares históricos a 60 FPS.'}
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {programArch.officialStandards.map((std, i) => (
                                <span
                                    key={i}
                                    className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/10 border border-white/15 text-indigo-100"
                                >
                                    ✓ {std}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Global KPI Summary Card */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5 min-w-[270px] space-y-3">
                        <div className="text-[10px] font-black uppercase tracking-widest text-indigo-300">
                            Índice de Cohesión Metodológica
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                                <div className="text-xl font-black text-emerald-400">6 Macro</div>
                                <div className="text-[10px] text-slate-300 font-semibold">36 Micro-Habilidades CEFR</div>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                                <div className="text-xl font-black text-sky-400">60 FPS</div>
                                <div className="text-[10px] text-slate-300 font-semibold">Cinemática Labial/Mandibular</div>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                                <div className="text-xl font-black text-amber-400">40 Sem.</div>
                                <div className="text-[10px] text-slate-300 font-semibold">160 Lecciones Continuas</div>
                            </div>
                            <div className="bg-slate-900/60 p-3 rounded-xl border border-white/10">
                                <div className="text-xl font-black text-purple-400">6 Inst.</div>
                                <div className="text-[10px] text-slate-300 font-semibold">Benchmarks Auditados</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sub-Navigation Pills */}
                <div className="relative z-10 flex flex-wrap gap-2 mt-6 pt-5 border-t border-white/15">
                    {[
                        { id: 'cycle', label: isFrench ? '🔄 1. Modèle Continu en 5 Étapes (5E)' : '🔄 1. Modelo Continuo de 5 Etapas (Ciclo 5E)' },
                        { id: 'skills', label: isFrench ? '🎯 2. Compétences Identifiables (6 Macro / 36 Micro)' : '🎯 2. Habilidades Identificables (6 Macro / 36 Micro)' },
                        { id: 'audit', label: isFrench ? '🏛️ 3. Audit Chirurgical International (Cambridge, DELF, Berlitz...)' : '🏛️ 3. Auditoría Quirúrgica Internacional (Cambridge, The Anglo, Berlitz...)' },
                        { id: 'blueprint', label: isFrench ? '📅 4. Matrice Continue de 40 Semaines (160 Leçons)' : '📅 4. Matriz Continua de 40 Semanas (160 Lecciones)' },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setSelectedSubView(tab.id as 'cycle' | 'skills' | 'audit' | 'blueprint')}
                            className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                                selectedSubView === tab.id
                                    ? 'bg-white text-slate-900 shadow-lg'
                                    : 'bg-white/10 text-indigo-100 hover:bg-white/20 border border-white/10'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ================================================================
                SUB-VIEW 1: 5-STAGE CONTINUOUS METHODOLOGY CYCLE (MODELO 5E)
               ================================================================ */}
            {selectedSubView === 'cycle' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                        {CONTINUOUS_METHODOLOGY_STAGES.map((stage, idx) => {
                            const isSelected = idx === activeStageIndex;
                            const isDone = completedStageIds.includes(stage.id);
                            return (
                                <div
                                    key={stage.id}
                                    onClick={() => setActiveStageIndex(idx)}
                                    className={`rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                                        isSelected
                                            ? 'bg-indigo-950 text-white border-indigo-500 shadow-xl ring-2 ring-indigo-500/40'
                                            : isLightMode
                                            ? 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 shadow-sm'
                                            : 'bg-slate-900/90 text-slate-100 border-slate-800 hover:border-indigo-500/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span
                                                className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider text-white"
                                                style={{ backgroundColor: stage.colorHex }}
                                            >
                                                {stage.code}
                                            </span>
                                            <button
                                                onClick={(e) => toggleStageComplete(stage.id, e)}
                                                className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                                    isDone
                                                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                }`}
                                            >
                                                {isDone ? '✓ Completada' : 'Marcar'}
                                            </button>
                                        </div>
                                        <h4 className="text-sm font-black leading-snug mb-1.5">
                                            {stage.titleTarget[activeLanguage]}
                                        </h4>
                                        <p className={`text-[11px] leading-relaxed mb-3 ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                                            {stage.subtitleEs}
                                        </p>
                                    </div>
                                    <div className="pt-2.5 border-t border-slate-500/20 flex items-center justify-between text-[10px] font-bold">
                                        <span>⏱ {stage.durationMinutesPerSession} min/sesión</span>
                                        <span className="font-black text-indigo-400">Peso: {stage.weightInContinuousScore}%</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Active Stage Surgical Breakdown */}
                    <div className={`rounded-3xl p-6 border shadow-sm ${
                        isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    }`}>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-white"
                                        style={{ backgroundColor: activeStage.colorHex }}
                                    >
                                        {activeStage.code} · {activeStage.pedagogicalPillar}
                                    </span>
                                </div>
                                <h3 className="text-xl font-black">
                                    {activeStage.titleTarget[activeLanguage]}
                                </h3>
                                <p className="text-xs text-slate-500 font-semibold mt-0.5">
                                    {activeStage.titleEs} — {activeStage.subtitleEs}
                                </p>
                            </div>
                            <button
                                onClick={() => onNavigateToTool(activeStage.primaryToolTab)}
                                className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider shadow-lg transition-all cursor-pointer shrink-0"
                            >
                                🚀 Ejecutar Herramienta: {activeStage.primaryToolLabel}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-indigo-600 mb-2">
                                    🧠 Mecanismo Neuro-Cognitivo
                                </div>
                                <p className="text-xs leading-relaxed font-medium">
                                    {activeStage.neuroCognitiveMechanism}
                                </p>
                                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-1.5">
                                    {activeStage.benchmarkOrigins.map((b, i) => (
                                        <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
                                            🏛️ {b}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">
                                    🎯 Desempeño Observable del Alumno ({activeLanguage})
                                </div>
                                <ul className="space-y-2 text-xs font-medium">
                                    {activeStage.observableStudentActions[activeLanguage].map((act, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-emerald-500 font-black">✓</span>
                                            <span>{act}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className={`p-4 rounded-2xl border ${isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
                                <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">
                                    📊 KPIs & Telemetría Continua Verificable
                                </div>
                                <ul className="space-y-2 text-xs font-medium">
                                    {activeStage.measurableKpis.map((kpi, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <span className="text-amber-500 font-black">●</span>
                                            <span>{kpi}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Theoretical Framework Pillars */}
                        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
                                Fundamento Teórico-Científico del Modelo ({isFrench ? 'FLE — Français Langue Étrangère' : 'ESL — English as a Second Language'})
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {programArch.theoreticalPillars.map((pillar, idx) => (
                                    <div key={idx} className={`p-4 rounded-2xl border ${isLightMode ? 'bg-indigo-50/50 border-indigo-100' : 'bg-indigo-950/20 border-indigo-500/20'}`}>
                                        <div className="text-xs font-black text-indigo-700 dark:text-indigo-300 mb-1.5">
                                            {pillar.title}
                                        </div>
                                        <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                                            {pillar.description}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================
                SUB-VIEW 2: IDENTIFIABLE MACRO & MICRO SKILLS (6 MACRO / 36 MICRO)
               ================================================================ */}
            {selectedSubView === 'skills' && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
                        {IDENTIFIABLE_LANGUAGE_SKILLS.map(skill => {
                            const mastery = skill.defaultMasteryByCefr[currentCefrLevel] || 85;
                            const isSelected = skill.id === selectedSkillId;
                            return (
                                <div
                                    key={skill.id}
                                    onClick={() => setSelectedSkillId(skill.id)}
                                    className={`rounded-2xl p-4 border transition-all cursor-pointer ${
                                        isSelected
                                            ? 'bg-slate-900 text-white border-indigo-500 shadow-lg ring-2 ring-indigo-500/30'
                                            : isLightMode
                                            ? 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300'
                                            : 'bg-slate-900/80 text-slate-100 border-slate-800'
                                    }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span
                                            className="px-2 py-0.5 rounded text-[10px] font-black text-white"
                                            style={{ backgroundColor: skill.colorHex }}
                                        >
                                            {skill.shortCode} · {skill.cefrCompanionMode}
                                        </span>
                                        <span className="text-sm font-black" style={{ color: skill.colorHex }}>
                                            {mastery}%
                                        </span>
                                    </div>
                                    <div className="text-xs font-black leading-snug mb-2">
                                        {skill.nameTarget[activeLanguage]}
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${mastery}%`, backgroundColor: skill.colorHex }}
                                        />
                                    </div>
                                    <div className="mt-2 text-[10px] text-slate-400 font-semibold truncate">
                                        {skill.benchmarkOrigin}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Detailed Micro-Skills Matrix for Selected Macro-Skill */}
                    <div className={`rounded-3xl p-6 border shadow-sm ${
                        isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    }`}>
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-5 border-b border-slate-200 dark:border-slate-800">
                            <div>
                                <span
                                    className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white"
                                    style={{ backgroundColor: activeSkill.colorHex }}
                                >
                                    MACRO-COMPETENCIA [{activeSkill.shortCode}] · MODO CEFR: {activeSkill.cefrCompanionMode}
                                </span>
                                <h3 className="text-xl font-black mt-1.5">
                                    {activeSkill.nameTarget[activeLanguage]} ({activeSkill.nameEs})
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">{activeSkill.descriptionEs}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-[10px] font-black uppercase text-slate-400">Estándar de Referencia</div>
                                <div className="text-xs font-bold text-indigo-600">{activeSkill.benchmarkOrigin}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeSkill.microSkills.map(micro => (
                                <div
                                    key={micro.code}
                                    className={`p-4 rounded-2xl border ${
                                        isLightMode ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-black">
                                            {micro.code}
                                        </span>
                                        <span className="text-[10px] font-extrabold text-emerald-600">
                                            {micro.cefrAlignment} · {micro.cenniRange}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black mb-1">
                                        {micro.nameTarget[activeLanguage]}
                                    </h4>
                                    <p className="text-xs text-slate-500 mb-3">{micro.nameEs}</p>
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-200 dark:border-slate-700 text-[10px] font-bold">
                                        <span className="text-slate-600 dark:text-slate-300">
                                            📈 Métrica: <strong>{micro.diagnosticMetric}</strong>
                                        </span>
                                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600">
                                            🔧 {micro.verificationTool}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ================================================================
                SUB-VIEW 3: SURGICAL AUDIT OF INTERNATIONAL INSTITUTIONS
               ================================================================ */}
            {selectedSubView === 'audit' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {INTERNATIONAL_BENCHMARK_AUDITS.map(audit => (
                        <div
                            key={audit.id}
                            className={`rounded-3xl p-6 border shadow-sm flex flex-col justify-between ${
                                isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <span
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white"
                                        style={{ backgroundColor: audit.accentColor }}
                                    >
                                        {audit.countryOrigin} · {audit.globalRating}
                                    </span>
                                    <div className="flex gap-1">
                                        {audit.targetLanguages.map(lang => (
                                            <span key={lang} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-black">
                                                {lang === 'en-US' ? '🇬🇧 EN' : '🇫🇷 FR'}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-lg font-black mb-1">{audit.institution}</h3>
                                <div className="text-xs font-extrabold text-indigo-600 mb-3">
                                    Metodología Base: {audit.coreMethodologyName}
                                </div>

                                <div className="space-y-3 text-xs">
                                    <div className={`p-3 rounded-xl border ${isLightMode ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-800/40'}`}>
                                        <div className="font-black text-emerald-700 dark:text-emerald-400 text-[10px] uppercase tracking-wider mb-1">
                                            ✓ Fortalezas Auditadas (Global Best Practices)
                                        </div>
                                        <ul className="space-y-1">
                                            {audit.surgicalStrengths.map((s, i) => (
                                                <li key={i} className="leading-relaxed">• {s}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`p-3 rounded-xl border ${isLightMode ? 'bg-amber-50/60 border-amber-200' : 'bg-amber-950/20 border-amber-800/40'}`}>
                                        <div className="font-black text-amber-700 dark:text-amber-400 text-[10px] uppercase tracking-wider mb-1">
                                            ⚠ Brecha en Modelos Tradicionales
                                        </div>
                                        <ul className="space-y-1">
                                            {audit.structuralLimitations.map((l, i) => (
                                                <li key={i} className="leading-relaxed">• {l}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`p-3.5 rounded-xl border ${isLightMode ? 'bg-indigo-50 border-indigo-200' : 'bg-indigo-950/30 border-indigo-700/40'}`}>
                                        <div className="font-black text-indigo-700 dark:text-indigo-300 text-[10px] uppercase tracking-wider mb-1">
                                            🚀 Síntesis y Superación en ISkool (Nano Banana 2.1)
                                        </div>
                                        <p className="leading-relaxed font-semibold">{audit.iskoolSynthesisAndUpgrade}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-500">
                                    Módulo Integrado: <strong className="text-slate-800 dark:text-slate-200">{audit.mappedISkoolToolName}</strong>
                                </span>
                                <button
                                    onClick={() => onNavigateToTool(audit.mappedISkoolToolId as 'curriculum' | 'editor' | 'reports' | 'writing' | 'analytics')}
                                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                                >
                                    Abrir Módulo →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ================================================================
                SUB-VIEW 4: 40-WEEK / 160-LESSON CONTINUOUS PROGRESSION MATRIX
               ================================================================ */}
            {selectedSubView === 'blueprint' && (
                <div className={`rounded-3xl p-6 border shadow-sm ${
                    isLightMode ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                }`}>
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
                        <div>
                            <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                                DOSIFICACIÓN ANUAL COMPLETA · 40 SEMANAS / 160 SESIONES POR NIVEL ({currentCefrLevel})
                            </span>
                            <h3 className="text-xl font-black mt-1.5">
                                {isFrench
                                    ? 'Architecture Spirale de 40 Semaines (8 Macro-Blocs Actionnels CECR / DELF-DALF)'
                                    : 'Arquitectura en Espiral de 40 Semanas (8 Macro-Bloques CEFR / Cambridge / CENNI)'}
                            </h3>
                        </div>
                        <button
                            onClick={() => onNavigateToTool('curriculum')}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider cursor-pointer"
                        >
                            📚 Ir al Explorador de 40 Semanas →
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CONTINUOUS_40_WEEK_BLUEPRINT.map(block => {
                            const startWeek = (block.blockNumber - 1) * 5 + 1;
                            return (
                                <div
                                    key={block.blockNumber}
                                    className={`p-5 rounded-2xl border transition-all ${
                                        isLightMode
                                            ? 'bg-slate-50 border-slate-200 hover:border-indigo-400'
                                            : 'bg-slate-800/50 border-slate-700 hover:border-indigo-500'
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white text-[10px] font-black uppercase">
                                            {block.weeksRange} · {block.lessonsRange}
                                        </span>
                                        <span className="text-[10px] font-extrabold text-emerald-600">
                                            {block.cefrSubBandProgression}
                                        </span>
                                    </div>
                                    <h4 className="text-sm font-black mb-1.5">
                                        {block.blockTitle[activeLanguage]}
                                    </h4>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">
                                        🎯 <strong>Can-Do Descriptor:</strong> {block.communicativeCanDoStatement[activeLanguage]}
                                    </p>

                                    <div className="space-y-1.5 text-[11px] pt-2.5 border-t border-slate-200 dark:border-slate-700">
                                        <div>
                                            <span className="font-black text-purple-600">🎙 Fonética DSP:</span>{' '}
                                            {block.phoneticTargetFocus[activeLanguage]}
                                        </div>
                                        <div>
                                            <span className="font-black text-sky-600">📐 Morfosintaxis:</span>{' '}
                                            {block.morphosyntacticTargetFocus[activeLanguage]}
                                        </div>
                                        <div>
                                            <span className="font-black text-amber-600">🎭 Mentor 60 FPS:</span>{' '}
                                            {block.historicalMentorAssigned[activeLanguage]}
                                        </div>
                                        <div>
                                            <span className="font-black text-emerald-600">📦 Entregable Tangible:</span>{' '}
                                            {block.tangibleDeliverable[activeLanguage]}
                                        </div>
                                    </div>

                                    {onSelectWeekFromBlueprint && (
                                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                                            <button
                                                onClick={() => {
                                                    onSelectWeekFromBlueprint(startWeek);
                                                    onNavigateToTool('curriculum');
                                                }}
                                                className="text-[10px] font-black text-indigo-600 hover:underline cursor-pointer"
                                            >
                                                Cargar Semana {startWeek} en el Estudio →
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

