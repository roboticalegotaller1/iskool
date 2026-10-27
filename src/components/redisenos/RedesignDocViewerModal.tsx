// src/components/redisenos/RedesignDocViewerModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  X,
  FileText,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Cloud,
  Cpu,
  GraduationCap,
  Layers,
  Globe,
  Clock,
  Award,
  BookOpen,
  Code2,
  AlertTriangle,
  ExternalLink,
  Volume2,
  VolumeX,
  TrendingUp,
  DollarSign,
  Users,
  Sliders,
  Play,
  ArrowRight,
  Search,
  Copy,
  Check
} from 'lucide-react';
import { REDESIGNS_EXECUTIVE_SPECS, RedesignExecutiveSpec } from '@/lib/redisenosComprehensiveData';
import { RedesignDetail } from '@/lib/redisenosSandboxData';
import {
  speakNaturalFemaleSpanish,
  stopNaturalFemaleVoice,
  NATURAL_FEMALE_SPANISH_VOICES,
  getPreferredFemaleVoiceId,
  setPreferredFemaleVoiceId
} from '@/lib/redisenosVoiceTTS';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface RedesignDocViewerModalProps {
  redesign?: RedesignDetail | null;
  isOpen?: boolean;
  redesignKey?: string | null;
  redesignTitle?: string;
  onClose: () => void;
  onLaunchTestMode?: (key: string) => void;
  onOpenTeacherView?: (key: string) => void;
}

export function RedesignDocViewerModal({
  redesign,
  isOpen = true,
  redesignKey,
  redesignTitle,
  onClose,
  onLaunchTestMode,
  onOpenTeacherView
}: RedesignDocViewerModalProps) {
  const router = useRouter();

  const resolvedInitialKey = redesign?.key || redesignKey || '01';
  const resolvedTitle = redesign?.title || redesignTitle || 'Expediente Ejecutivo ISkool';

  const [selectedKey, setSelectedKey] = useState<string>(resolvedInitialKey);
  const [rawContent, setRawContent] = useState<string>('');
  const [loadingRaw, setLoadingRaw] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedDoc, setCopiedDoc] = useState<boolean>(false);

  // Pestañas ejecutivas dinámicas para el CEO
  const [activeTab, setActiveTab] = useState<
    'ceo_dashboard' | 'windows_inspector' | 'iskool_ecosystem' | 'cloud_viability' | 'raw'
  >('ceo_dashboard');

  // Estado de Voz Femenina Natural
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>('es-MX-DaliaNeural');
  const [isSpeakingBriefing, setIsSpeakingBriefing] = useState<boolean>(false);

  // Estados del Simulador Interactivo de ROI para el CEO
  const [simStudents, setSimStudents] = useState<number>(450);
  const [simMonthlyTuition, setSimMonthlyTuition] = useState<number>(6800);
  const [simTeachersCount, setSimTeachersCount] = useState<number>(20);

  useEffect(() => {
    const nextKey = redesign?.key || redesignKey;
    if (nextKey) {
      setSelectedKey(nextKey);
    }
    setSelectedVoiceId(getPreferredFemaleVoiceId());
  }, [redesign, redesignKey]);

  useEffect(() => {
    if (!selectedKey || !isOpen) return;
    setLoadingRaw(true);

    fetch(`/api/redisenos-docs?id=${encodeURIComponent(selectedKey)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar el documento');
        const data = await res.json();
        setRawContent(data.content || '');
      })
      .catch(() => {
        setRawContent('Especificación técnica integrada en la vista ejecutiva.');
      })
      .finally(() => {
        setLoadingRaw(false);
      });
  }, [selectedKey, isOpen]);

  useEffect(() => {
    return () => {
      stopNaturalFemaleVoice();
    };
  }, []);

  if (!isOpen || (!redesign && !redesignKey)) return null;

  const spec: RedesignExecutiveSpec | undefined = REDESIGNS_EXECUTIVE_SPECS[selectedKey];
  const allKeys = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

  // Cálculos dinámicos del Simulador Financiero CEO
  const retentionPercentMatch = spec?.ceoExecutiveMetrics.retentionImpact.match(/\+(\d+)%/);
  const baseRetentionBoost = retentionPercentMatch ? parseInt(retentionPercentMatch[1], 10) : 38;
  const studentsRetained = Math.round(simStudents * (baseRetentionBoost / 100) * 0.18);
  const protectedAnnualTuitionMXN = studentsRetained * simMonthlyTuition * 10; // 10 meses colegiatura
  const hoursSavedPerTeacherWeek = spec?.ceoExecutiveMetrics.teacherHoursSavedPerWeek || 9.5;
  const totalAnnualTeacherHoursSaved = Math.round(simTeachersCount * hoursSavedPerTeacherWeek * 40); // 40 semanas
  const productivityValueMXN = totalAnnualTeacherHoursSaved * 320; // Valor hora docente promedio
  const totalAnnualImpactMXN = protectedAnnualTuitionMXN + productivityValueMXN + (spec?.ceoExecutiveMetrics.estimatedAnnualSavingsMXN || 450000);

  const handleLaunchLive = () => {
    stopNaturalFemaleVoice();
    gamificationAudio.playClickSound();
    onClose();

    if (spec?.liveDemoUrl) {
      router.push(spec.liveDemoUrl);
      return;
    }
    if (onLaunchTestMode) {
      onLaunchTestMode(selectedKey);
    }
  };

  const handleToggleExecutiveBriefing = () => {
    gamificationAudio.playClickSound();
    if (isSpeakingBriefing) {
      stopNaturalFemaleVoice();
      setIsSpeakingBriefing(false);
      return;
    }

    const briefingText =
      spec?.ceoExecutiveMetrics.ceoExecutiveBriefingAudio ||
      `Resumen Ejecutivo para Dirección General del caso ${spec?.title || resolvedTitle}.`;

    speakNaturalFemaleSpanish(briefingText, {
      voiceId: selectedVoiceId,
      onStart: () => setIsSpeakingBriefing(true),
      onEnd: () => setIsSpeakingBriefing(false),
      onError: () => setIsSpeakingBriefing(false)
    });
  };

  const handleVoiceChange = (newVoiceId: string) => {
    gamificationAudio.playClickSound();
    setSelectedVoiceId(newVoiceId);
    setPreferredFemaleVoiceId(newVoiceId);
    const voiceProfile = NATURAL_FEMALE_SPANISH_VOICES.find(v => v.id === newVoiceId);
    speakNaturalFemaleSpanish(
      `Voz femenina natural activada: ${voiceProfile?.name || 'Dalia'}. Lista para narrar la experiencia de ISkool en español.`,
      {
        voiceId: newVoiceId,
        onStart: () => setIsSpeakingBriefing(true),
        onEnd: () => setIsSpeakingBriefing(false)
      }
    );
  };

  const handleCopyDoc = () => {
    if (!rawContent) return;
    navigator.clipboard.writeText(rawContent);
    setCopiedDoc(true);
    setTimeout(() => setCopiedDoc(false), 2500);
  };

  const filteredRawContent = searchQuery.trim()
    ? rawContent
        .split('\n')
        .filter(line => line.toLowerCase().includes(searchQuery.toLowerCase()))
        .join('\n')
    : rawContent;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-xl p-2 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl bg-slate-900 border-2 border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

        {/* ===================================================================== */}
        {/* CABECERA EJECUTIVA DINÁMICA PARA EL CEO + SELECTOR DE CASOS 01-10 */}
        {/* ===================================================================== */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-indigo-950/90 to-slate-950 border-b border-indigo-500/30 flex flex-col gap-4">
          
          {/* Barra Superior: Selector Rápido de Caso 01 al 10 + Selector de Voz Femenina */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300 mr-1">
                Caso Activo:
              </span>
              {allKeys.map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    stopNaturalFemaleVoice();
                    setIsSpeakingBriefing(false);
                    gamificationAudio.playClickSound();
                    setSelectedKey(k);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedKey === k
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  Caso {k}
                </button>
              ))}
            </div>

            {/* Selector en Vivo de Voz Femenina Natural (Condición 13) */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-black uppercase text-emerald-300">
                Voz Femenina Natural:
              </span>
              <select
                value={selectedVoiceId}
                onChange={(e) => handleVoiceChange(e.target.value)}
                aria-label="Seleccionar voz femenina natural en español"
                className="bg-slate-950 text-white text-xs font-bold px-2 py-1 rounded-lg border border-slate-700 focus:outline-none focus:border-emerald-400"
              >
                {NATURAL_FEMALE_SPANISH_VOICES.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} — {voice.style.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Título del Caso + Botones de Briefing por Voz y Lanzamiento en Vivo */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0 p-3 shadow-inner">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Expediente Estratégico CEO · {spec?.level || 'ISkool'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 100% Propiedad Intelectual ISkool
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {spec?.ages}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1 tracking-tight">
                  {spec?.title || resolvedTitle}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  {spec?.tagline}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {/* Botón de Audio Briefing para el CEO con Voz Femenina Natural */}
              <button
                onClick={handleToggleExecutiveBriefing}
                className={`px-4 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 border shadow-lg ${
                  isSpeakingBriefing
                    ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-400 animate-pulse'
                    : 'bg-slate-900 hover:bg-slate-800 text-emerald-300 border-emerald-500/40'
                }`}
              >
                {isSpeakingBriefing ? (
                  <>
                    <VolumeX className="w-4 h-4" />
                    <span>Detener Audio CEO</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>Escuchar Resumen CEO (Voz Femenina)</span>
                  </>
                )}
              </button>

              {/* Botón Principal: Probar en Vivo */}
              <button
                onClick={handleLaunchLive}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Probar Caso {selectedKey} en Vivo</span>
              </button>

              <button
                onClick={() => {
                  stopNaturalFemaleVoice();
                  onClose();
                }}
                aria-label="Cerrar expediente ejecutivo"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Barra de 5 Pestañas Ejecutivas Dinámicas */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab('ceo_dashboard');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'ceo_dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>1. Tablero CEO & Simulador ROI</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab('windows_inspector');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'windows_inspector'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2. Inspector de Ventanas y Pantallas</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab('iskool_ecosystem');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'iskool_ecosystem'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>3. Ecosistema ISkool, Canon 1ª Persona e IP</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab('cloud_viability');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'cloud_viability'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>4. Arquitectura Cloud y Capacitación</span>
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab('raw');
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'raw'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>5. Especificación Maestra (.MD)</span>
            </button>
          </div>
        </div>

        {/* ===================================================================== */}
        {/* CUERPO PRINCIPAL DEL EXPEDIENTE EJECUTIVO */}
        {/* ===================================================================== */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-950/60">
          {!spec ? (
            <div className="p-12 text-center text-slate-400">
              Cargando inteligencia ejecutiva...
            </div>
          ) : (
            <>
              {/* =============================================================== */}
              {/* PESTAÑA 1: TABLERO ESTRATÉGICO CEO & SIMULADOR FINANCIERO ROI */}
              {/* =============================================================== */}
              {activeTab === 'ceo_dashboard' && (
                <div className="space-y-6">
                  
                  {/* 4 KPIs Estratégicos de Alto Impacto */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Impacto en Retención
                      </span>
                      <div className="text-base font-black text-white">
                        {spec.ceoExecutiveMetrics.retentionImpact}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Incremento directo en reinscripción y lealtad institucional.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-indigo-500/30 shadow-lg space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" /> Dominio Académico SEP
                      </span>
                      <div className="text-base font-black text-white">
                        {spec.ceoExecutiveMetrics.academicMasteryBoost}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Medido sobre Procesos de Desarrollo de Aprendizaje (PDA).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-amber-500/30 shadow-lg space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Ahorro Docente Semanal
                      </span>
                      <div className="text-base font-black text-white">
                        {spec.ceoExecutiveMetrics.teacherHoursSavedPerWeek} hrs / semana por profesor
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Automatización de planeación y calificación en Bóveda Curricular.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-lg space-y-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> Satisfacción Parental
                      </span>
                      <div className="text-base font-black text-white">
                        {spec.ceoExecutiveMetrics.parentSatisfactionIndex}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Evidencia tangible de aprendizaje visible para las familias.
                      </p>
                    </div>
                  </div>

                  {/* SIMULADOR FINANCIERO Y OPERATIVO INTERACTIVO PARA EL CEO */}
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border-2 border-indigo-500/40 shadow-2xl space-y-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-4">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5" /> Herramienta Interactiva de Toma de Decisiones CEO
                        </span>
                        <h3 className="text-lg font-black text-white mt-0.5">
                          Simulador Financiero de Retorno de Inversión (ROI) y Retención de Matrícula
                        </h3>
                      </div>
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-black">
                        Impacto Anual Proyectado: ${totalAnnualImpactMXN.toLocaleString()} MXN
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Controles Deslizantes (Izquierda) */}
                      <div className="lg:col-span-6 space-y-4 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-300">Matrícula de Alumnos en el Nivel:</span>
                            <span className="text-indigo-400 font-black">{simStudents} Alumnos</span>
                          </div>
                          <input
                            type="range"
                            min={100}
                            max={2000}
                            step={25}
                            value={simStudents}
                            onChange={(e) => setSimStudents(Number(e.target.value))}
                            aria-label="Matrícula de Alumnos"
                            className="w-full accent-indigo-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>100 alumnos</span>
                            <span>1,000 alumnos</span>
                            <span>2,000 alumnos</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-300">Colegiatura Mensual Promedio (MXN):</span>
                            <span className="text-emerald-400 font-black">${simMonthlyTuition.toLocaleString()} MXN</span>
                          </div>
                          <input
                            type="range"
                            min={2500}
                            max={18000}
                            step={500}
                            value={simMonthlyTuition}
                            onChange={(e) => setSimMonthlyTuition(Number(e.target.value))}
                            aria-label="Colegiatura Mensual Promedio"
                            className="w-full accent-emerald-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>$2,500 MXN</span>
                            <span>$10,000 MXN</span>
                            <span>$18,000 MXN</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-slate-300">Plantilla Docente Asignada:</span>
                            <span className="text-amber-400 font-black">{simTeachersCount} Docentes</span>
                          </div>
                          <input
                            type="range"
                            min={4}
                            max={80}
                            step={2}
                            value={simTeachersCount}
                            onChange={(e) => setSimTeachersCount(Number(e.target.value))}
                            aria-label="Plantilla Docente Asignada"
                            className="w-full accent-amber-500 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                            <span>4 docentes</span>
                            <span>40 docentes</span>
                            <span>80 docentes</span>
                          </div>
                        </div>
                      </div>

                      {/* Resultados Financieros en Tiempo Real (Derecha) */}
                      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1">
                          <span className="text-[10px] font-black uppercase text-emerald-400">
                            Colegiaturas Protegidas por Retención
                          </span>
                          <div className="text-xl font-black text-white">
                            ${protectedAnnualTuitionMXN.toLocaleString()} MXN
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            +{studentsRetained} alumnos retenidos anualmente en este nivel
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 space-y-1">
                          <span className="text-[10px] font-black uppercase text-amber-400">
                            Horas Docentes Ahorradas al Año
                          </span>
                          <div className="text-xl font-black text-white">
                            {totalAnnualTeacherHoursSaved.toLocaleString()} Horas
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            Equivalente a ${productivityValueMXN.toLocaleString()} MXN en tiempo productivo
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-950 border border-indigo-500/30 space-y-1">
                          <span className="text-[10px] font-black uppercase text-indigo-400">
                            Ahorro en Licencias Externas
                          </span>
                          <div className="text-xl font-black text-white">
                            ${spec.ceoExecutiveMetrics.estimatedAnnualSavingsMXN.toLocaleString()} MXN
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            Sustitución total de plataformas comerciales aisladas
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-emerald-950/40 border-2 border-emerald-500/50 space-y-1">
                          <span className="text-[10px] font-black uppercase text-emerald-300">
                            Beneficio Neto Institucional Anual
                          </span>
                          <div className="text-xl font-black text-emerald-300">
                            ${totalAnnualImpactMXN.toLocaleString()} MXN
                          </div>
                          <span className="text-[11px] text-emerald-200/80 block">
                            Cero cobros adicionales a padres de familia
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MATRIZ COMPARATIVA EJECUTIVA: LMS TRADICIONAL VS REDISEÑO ISKOOL */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span>Matriz Comparativa para Dirección General: LMS Tradicional vs. {spec.title}</span>
                      </h3>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-black">
                            <th className="py-3 px-4">Dimensión Estratégica</th>
                            <th className="py-3 px-4 text-rose-300">Plataforma Tradicional (Antes)</th>
                            <th className="py-3 px-4 text-emerald-300">Ecosistema Gamificado ISkool (Ahora)</th>
                            <th className="py-3 px-4 text-right text-amber-300">Impacto Medible</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {spec.ceoExecutiveMetrics.beforeAfterComparison.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-950/60 transition-colors">
                              <td className="py-3.5 px-4 font-black text-white">{row.dimension}</td>
                              <td className="py-3.5 px-4 text-slate-400">{row.traditionalLms}</td>
                              <td className="py-3.5 px-4 text-emerald-200 font-medium">{row.iskoolRedesign}</td>
                              <td className="py-3.5 px-4 text-right">
                                <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-black text-[11px] whitespace-nowrap">
                                  {row.impactMetric}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Concepto de Juego y Metáfora Pedagógica */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-indigo-400">Nivel y Etapa SEP</span>
                      <h4 className="text-sm font-black text-white">{spec.identity.educationalLevel}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Diseñado ergonómica y cognitivamente para la etapa madurativa exacta del estudiante.
                      </p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-400">Metáfora del Mundo</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{spec.identity.gameMetaphor}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-emerald-400">Mecánica Pedagógica Central</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{spec.identity.coreLevelMechanic}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* PESTAÑA 2: INSPECTOR QUIRÚRGICO DE VENTANAS Y PANTALLAS */}
              {/* =============================================================== */}
              {activeTab === 'windows_inspector' && (
                <div className="space-y-6">
                  
                  {/* Galería Visual de las 3 Pantallas Maestras */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group flex flex-col justify-between">
                      <div className="aspect-video relative overflow-hidden bg-slate-950">
                        <img
                          src={spec.hubImage}
                          alt={spec.screens.hub.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-black text-indigo-300 border border-indigo-500/30">
                          1. LIENZO MAESTRO 16:9
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-black text-white">{spec.screens.hub.title}</h4>
                        <p className="text-xs text-slate-400">{spec.screens.hub.visualStructure}</p>
                        <button
                          onClick={handleLaunchLive}
                          className="w-full py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Inspeccionar Lienzo en Vivo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group flex flex-col justify-between">
                      <div className="aspect-video relative overflow-hidden bg-slate-950">
                        <img
                          src={spec.quizImage}
                          alt={spec.screens.quiz.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-black text-emerald-300 border border-emerald-500/30">
                          2. ARENA DE EVALUACIÓN GAMIFICADA
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-black text-white">{spec.screens.quiz.title}</h4>
                        <p className="text-xs text-slate-400">{spec.screens.quiz.mechanic}</p>
                        <button
                          onClick={handleLaunchLive}
                          className="w-full py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-slate-950 border border-emerald-500/30 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Probar Desafío en Vivo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 group flex flex-col justify-between">
                      <div className="aspect-video relative overflow-hidden bg-slate-950">
                        <img
                          src={spec.avatarImage}
                          alt={spec.screens.avatar.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md bg-slate-950/85 backdrop-blur-md text-[10px] font-black text-amber-300 border border-amber-500/30">
                          3. VESTIDOR 3D Y ECONOMÍA DE MÉRITO
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        <h4 className="text-sm font-black text-white">{spec.screens.avatar.title}</h4>
                        <p className="text-xs text-slate-400">{spec.screens.avatar.economyModel}</p>
                        <button
                          onClick={handleLaunchLive}
                          className="w-full py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-slate-950 border border-amber-500/30 text-xs font-black transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Abrir Vestidor en Vivo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Catálogo Quirúrgico de Todas las Ventanas Operativas del Rediseño */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-black uppercase text-emerald-400">
                          Auditoría de Funcionalidad 100% Operativa
                        </span>
                        <h3 className="text-base font-black text-white">
                          Catálogo de Ventanas y Módulos Interactivos Desarrollados en el Caso {selectedKey}
                        </h3>
                      </div>
                      <button
                        onClick={handleLaunchLive}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Lanzar Entorno Completo</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {spec.ceoExecutiveMetrics.interactiveWindowsCatalog.map((win) => (
                        <div
                          key={win.id}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black">
                                {win.role}
                              </span>
                              <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Activo
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-white">{win.name}</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">{win.description}</p>
                          </div>

                          <button
                            onClick={handleLaunchLive}
                            className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-indigo-300 hover:text-white text-[11px] font-bold transition-colors border border-slate-800"
                          >
                            Interactuar en Vivo →
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Detalle de Flujo Docente (Estudio de Actividades) */}
                  <div className="p-5 rounded-3xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>4. {spec.screens.teacherStudio.title}</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {spec.screens.teacherStudio.flowSteps.map((step, i) => (
                        <div key={i} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 flex items-start gap-2.5">
                          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black flex items-center justify-center shrink-0">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-emerald-300 font-bold pt-1">
                      Resultado Polimórfico: {spec.screens.teacherStudio.polymorphicOutput}
                    </p>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* PESTAÑA 3: ECOSISTEMA ISKOOL, CANON 1ª PERSONA & PROPIEDAD IP */}
              {/* =============================================================== */}
              {activeTab === 'iskool_ecosystem' && (
                <div className="space-y-6">
                  
                  {/* Certificado Oficial de Propiedad Intelectual y Cero Copyright */}
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 border-2 border-emerald-500/50 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase tracking-widest">
                        Auditoría Legal y de Derechos de Autor Aprobada
                      </span>
                      <h3 className="text-lg font-black text-white">
                        {spec.ceoExecutiveMetrics.copyrightComplianceCert}
                      </h3>
                      <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                        Todos los activos visuales, mecánicas de juego, nombres de personajes, edificios, cartas y algoritmos de este rediseño han sido creados originalmente para el ecosistema institucional <strong className="text-white">ISkool</strong> bajo marca blanca estricta, libre de licencias comerciales de terceros.
                      </p>
                    </div>
                    <div className="px-4 py-3 rounded-2xl bg-slate-950 border border-emerald-500/40 text-center shrink-0">
                      <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto mb-1" />
                      <span className="text-xs font-black text-emerald-300 block">100% LIBRE DE COPYRIGHT</span>
                      <span className="text-[10px] text-slate-400">Marca Blanca Institucional</span>
                    </div>
                  </div>

                  {/* 3 Pilares de Integración Nativa con ISkool */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-indigo-400 font-black text-xs uppercase">
                        <Cpu className="w-4 h-4" /> Almacenes de Estado en Tiempo Real
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {spec.iskoolIntegration.storeConnection}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-black text-xs uppercase">
                        <BookOpen className="w-4 h-4" /> Bóveda Curricular (Vault-First)
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {spec.iskoolIntegration.vaultIntegration}
                      </p>
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
                        <Award className="w-4 h-4" /> Canon Inviolable en 1ª Persona
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {spec.iskoolIntegration.historicalAvatarsFirstPerson}
                      </p>
                    </div>
                  </div>

                  {/* Benchmarks Internacionales y Ventaja Competitiva de ISkool */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <h4 className="text-sm font-black uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      <span>Posicionamiento frente a Estándares Internacionales</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {spec.globalBenchmarks.map((bm, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-white">{bm.name}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                              {bm.origin}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{bm.description}</p>
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                            <strong className="font-black">Superioridad de ISkool:</strong> {bm.iskoolAdvantage}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* PESTAÑA 4: VIABILIDAD CLOUD, DESAFÍOS TÉCNICOS Y CAPACITACIÓN */}
              {/* =============================================================== */}
              {activeTab === 'cloud_viability' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-indigo-400">Acceso Único Institucional</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{spec.cloudViability.ssoAuth}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-emerald-400">Almacenamiento Cloud y Compresión WebP</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{spec.cloudViability.cloudStorage}</p>
                    </div>
                    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                      <span className="text-[10px] font-black uppercase text-amber-400">Sincronización con Lienzo Digital</span>
                      <p className="text-xs text-slate-200 leading-relaxed">{spec.cloudViability.classroomIntegration}</p>
                    </div>
                  </div>

                  {/* Matriz de Desafíos Técnicos Resueltos */}
                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Ingeniería Aplicada: Desafíos Técnicos y Soluciones en Producción</span>
                    </h4>
                    <div className="space-y-3">
                      {spec.technicalChallenges.map((tc, i) => (
                        <div key={i} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black text-white">{tc.challenge}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Prioridad {tc.severity}
                              </span>
                            </div>
                            <p className="text-xs text-emerald-300">
                              <strong className="text-slate-400">Solución Implementada:</strong> {tc.solution}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Capacitación y Adopción */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-black uppercase text-indigo-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Tiempo de Capacitación Docente
                      </span>
                      <p className="text-xs font-bold text-white">{spec.trainingAndAdoption.trainingHours}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-black uppercase text-emerald-400">Curva de Aprendizaje</span>
                      <p className="text-xs font-bold text-white">{spec.trainingAndAdoption.learningCurve}</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-[10px] font-black uppercase text-amber-400">Adopción Familiar</span>
                      <p className="text-xs font-bold text-white">{spec.trainingAndAdoption.parentAdoption}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* =============================================================== */}
              {/* PESTAÑA 5: DOCUMENTO MAESTRO (.MD) CON BUSCADOR EN VIVO */}
              {/* =============================================================== */}
              {activeTab === 'raw' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Filtrar líneas en la especificación técnica (ej. PDA, avatar, rúbrica)..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <button
                      onClick={handleCopyDoc}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 shrink-0"
                    >
                      {copiedDoc ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedDoc ? 'Documento Copiado' : 'Copiar Markdown'}</span>
                    </button>
                  </div>

                  {loadingRaw ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      Cargando especificación Markdown...
                    </div>
                  ) : (
                    <pre className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-[55vh] overflow-y-auto">
                      {filteredRawContent || 'No se encontraron coincidencias para el filtro actual.'}
                    </pre>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ===================================================================== */}
        {/* PIE DE MODAL EJECUTIVO */}
        {/* ===================================================================== */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              Arquitectura 100% integrada con <strong className="text-white">Bóveda Curricular</strong>, <strong className="text-white">Lienzo Digital</strong> y <strong className="text-white">Motor de Voz Femenina Natural</strong>.
            </span>
          </div>
          <div className="flex items-center gap-2">
            {onOpenTeacherView && (
              <button
                onClick={() => {
                  stopNaturalFemaleVoice();
                  onClose();
                  onOpenTeacherView(selectedKey);
                }}
                className="px-4 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Ver Plantilla Docente</span>
              </button>
            )}
            <button
              onClick={() => {
                stopNaturalFemaleVoice();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
            >
              Cerrar Vista CEO
            </button>
            <button
              onClick={handleLaunchLive}
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Caso {selectedKey} en Vivo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default RedesignDocViewerModal;

