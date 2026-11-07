"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { LanguageCode } from '@/store/useLanguagesStore';
import {
  WRITING_STUDIO_RECIPES,
  OFFICIAL_STAR_RUBRIC_CRITERIA,
} from './hybridPedagogicalData';
import {
  Star,
  Save,
  CheckCircle2,
  Edit3,
  Volume2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

interface Props {
  language: LanguageCode;
  isLightMode: boolean;
  onPlayAudio: (text: string, customRate?: number) => void;
  onTriggerToast: (msg: string) => void;
}

export const HybridWritingStarStudio: React.FC<Props> = ({
  language,
  isLightMode,
  onPlayAudio,
  onTriggerToast,
}) => {
  const recipesForLang = useMemo(() => {
    const exact = WRITING_STUDIO_RECIPES.filter((r) => r.language === language);
    return exact.length >= 2 ? exact : WRITING_STUDIO_RECIPES;
  }, [language]);

  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipesForLang[0].id);

  useEffect(() => {
    if (language === 'fr') {
      setSelectedRecipeId('recipe-fr-cafe');
    } else {
      setSelectedRecipeId('recipe-en-cafe');
    }
  }, [language]);

  const activeRecipe = useMemo(() => {
    return (
      WRITING_STUDIO_RECIPES.find((r) => r.id === selectedRecipeId) ||
      WRITING_STUDIO_RECIPES[0]
    );
  }, [selectedRecipeId]);

  const [draftText, setDraftText] = useState<string>(activeRecipe.sampleDraft);
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
  });

  // Calificaciones de 1 a 5 estrellas por criterio oficial
  const [stars, setStars] = useState<{
    content: number;
    communicative: number;
    organization: number;
    grammar: number;
  }>({
    content: 5,
    communicative: 4,
    organization: 5,
    grammar: 4,
  });

  const [teacherFeedback, setTeacherFeedback] = useState<string>(
    '¡Excelente reseña, Sofía! Gran uso de conectores ("First of all", "Furthermore") y descripción clara. Sigue practicando tiempos verbales.'
  );

  useEffect(() => {
    setDraftText(activeRecipe.sampleDraft);
    if (activeRecipe.language === 'fr') {
      setTeacherFeedback(
        '¡Excelente redacción en francés, Camila! Muy buen uso de conectores ("D\'abord", "De plus") y del condicional de cortesía "Je voudrais".'
      );
    } else {
      setTeacherFeedback(
        `¡Excelente trabajo, ${activeRecipe.sampleStudentName.split(' ')[0]}! Gran uso de conectores y vocabulario del nivel ${activeRecipe.level}. Sigue practicando tiempos verbales.`
      );
    }
  }, [activeRecipe]);

  const totalScore = useMemo(() => {
    const sum = stars.content + stars.communicative + stars.organization + stars.grammar; // max 20
    return Math.round((sum / 20) * 100);
  }, [stars]);

  const computedBandLabel = useMemo(() => {
    if (language === 'fr') {
      if (totalScore >= 90) return `DELF ${activeRecipe.level} · SEP CENNI Nivel 6 (${totalScore}/100)`;
      if (totalScore >= 75) return `DELF A1+ · SEP CENNI Nivel 4 (${totalScore}/100)`;
      return `DELF A1 Inicial · SEP CENNI Nivel 3 (${totalScore}/100)`;
    }
    if (activeRecipe.level === 'B2') {
      return `B2 First · SEP CENNI Nivel 12 (${totalScore}/100)`;
    }
    if (activeRecipe.level === 'B1') {
      return `B1 Preliminary · SEP CENNI Nivel 9 (${totalScore}/100)`;
    }
    return `A2 Key · SEP CENNI Nivel 6 (${totalScore}/100)`;
  }, [language, activeRecipe.level, totalScore]);

  const handleInsertIntoDraft = (snippet: string) => {
    setDraftText((prev) => `${prev.trim()} ${snippet}`);
    onTriggerToast(`✓ "${snippet}" insertado en el lienzo de redacción`);
  };

  const handleSaveEvaluation = () => {
    onTriggerToast(
      `✓ Calificación (${totalScore}/100 · ${activeRecipe.cenniBand}) y retroalimentación guardadas en 1 clic`
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-in">
      {/* COLUMNA IZQUIERDA (6 cols): Taller de Redacción Guiada con Andamiaje Pedagógico */}
      <div
        className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border shadow-sm space-y-4 ${
          isLightMode
            ? 'bg-white border-slate-200/90 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Taller de Redacción Guiada con Andamiaje Pedagógico
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Elige una plantilla curricular en 1 clic: el alumno escribe con apoyo visual de vocabulario y conectores.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-extrabold">
            {activeRecipe.sampleStudentName}
          </span>
        </div>

        {/* 3 Recetas Superiores en 1 Clic */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 block">
            Recetas de Redacción en 1 Clic:
          </span>
          <div className="flex flex-wrap gap-2">
            {WRITING_STUDIO_RECIPES.map((rec) => {
              const active = rec.id === activeRecipe.id;
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => setSelectedRecipeId(rec.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border ${
                    active
                      ? 'bg-indigo-50 text-indigo-900 border-indigo-500 ring-1 ring-indigo-500 shadow-2xs'
                      : isLightMode
                        ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {rec.badgeLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Consigna Pedagógica */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
          <strong className="text-slate-900">Consigna del Día:</strong> {activeRecipe.promptInstructionEs}
        </div>

        {/* Lienzo de Escritura Interactivo (Writing Canvas) */}
        <div className="rounded-2xl border-2 border-slate-200 overflow-hidden bg-white shadow-inner">
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-black text-slate-700">
            <span className="flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Writing Canvas · Borrador del Estudiante</span>
            </span>
            <button
              type="button"
              onClick={() => onPlayAudio(draftText, 0.9)}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              <Volume2 className="w-3 h-3" />
              <span>Escuchar Texto</span>
            </button>
          </div>

          <div className="p-4 space-y-3">
            <textarea
              rows={4}
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full text-sm sm:text-base font-medium text-slate-900 leading-relaxed focus:outline-hidden resize-none"
            />

            {/* Vista Rápida de Subrayados Pedagógicos (Conectores en Verde / Estructura en Ámbar) */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[11px] font-bold text-slate-500">Detección Pedagógica:</span>
              {activeRecipe.positiveConnectors.map((conn) => (
                <span
                  key={conn}
                  className="px-2.5 py-0.5 rounded-lg bg-emerald-50 border-b-2 border-emerald-500 text-emerald-900 font-extrabold"
                >
                  ✓ Conector: &ldquo;{conn}&rdquo;
                </span>
              ))}
              {activeRecipe.grammarSuggestions.map((gs, i) => (
                <span
                  key={i}
                  title={gs.suggestionEs}
                  className="px-2.5 py-0.5 rounded-lg bg-amber-50 border-b-2 border-amber-500 text-amber-900 font-extrabold"
                >
                  💡 Estructura: &ldquo;{gs.phrase}&rdquo;
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Tarjetas Inferiores de Andamiaje Pedagógico */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* 1. Banco de Vocabulario */}
          <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-2">
            <h4 className="text-xs font-black text-slate-900">1. Banco de Vocabulario</h4>
            <div className="flex flex-wrap gap-1.5">
              {activeRecipe.vocabularyBank.map((vb) => (
                <button
                  key={vb.word}
                  type="button"
                  onClick={() => handleInsertIntoDraft(vb.word)}
                  title={`Insertar "${vb.word}" (${vb.translationEs})`}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-slate-800 text-[11px] font-bold cursor-pointer shadow-2xs transition-colors"
                >
                  {vb.word}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Conectores Meta */}
          <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200/80 space-y-2">
            <h4 className="text-xs font-black text-slate-900">2. Conectores Meta</h4>
            <div className="flex flex-wrap gap-1.5">
              {activeRecipe.targetConnectors.map((tc) => (
                <button
                  key={tc.connector}
                  type="button"
                  onClick={() => handleInsertIntoDraft(tc.connector)}
                  title={tc.usageEs}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-sky-100 border border-sky-200 text-slate-800 text-[11px] font-bold cursor-pointer shadow-2xs transition-colors"
                >
                  {tc.connector}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Checklist Autoevaluación */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-2">
            <h4 className="text-xs font-black text-slate-900">3. Checklist Autoevaluación</h4>
            <div className="space-y-1.5">
              {activeRecipe.selfCheckList.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-1.5 text-[11px] font-semibold text-slate-800 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(checkedItems[idx])}
                    onChange={() =>
                      setCheckedItems((prev) => ({ ...prev, [idx]: !prev[idx] }))
                    }
                    className="mt-0.5 accent-emerald-600 rounded cursor-pointer"
                  />
                  <span className="leading-tight">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* COLUMNA DERECHA (6 cols): Rúbrica Oficial CEFR / SEP CENNI en 1 Clic (1 a 5 Estrellas) */}
      <div
        className={`lg:col-span-6 p-5 sm:p-6 rounded-3xl border shadow-sm space-y-5 ${
          isLightMode
            ? 'bg-white border-slate-200/90 text-slate-900'
            : 'bg-slate-900 border-slate-800 text-white'
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Rúbrica Oficial CEFR / SEP CENNI en 1 Clic
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Selecciona de 1 a 5 estrellas en cada criterio oficial. El sistema calcula el nivel CENNI automáticamente.
            </p>
          </div>

          <Link
            href="/teacher/idiomas/writing"
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold flex items-center gap-1.5 border border-slate-200"
          >
            <span>Consola Avanzada</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Badge Azul Marino de Nivel Calculado Automáticamente */}
        <div className="p-3.5 rounded-2xl bg-[#0F172A] text-white flex flex-wrap items-center justify-between gap-2 shadow-md">
          <span className="text-xs font-bold text-slate-300">
            Nivel Calculado Automáticamente:
          </span>
          <span className="text-xs sm:text-sm font-black text-amber-400">
            {computedBandLabel}
          </span>
        </div>

        {/* Las 4 Filas de Criterios Oficiales con Estrellas Interactivas (⭐⭐⭐⭐⭐) */}
        <div className="space-y-3.5 divide-y divide-slate-100">
          {OFFICIAL_STAR_RUBRIC_CRITERIA.map((crit) => {
            const currentVal = stars[crit.id];
            return (
              <div
                key={crit.id}
                className="pt-3 first:pt-0 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="space-y-0.5 max-w-sm">
                  <h4 className="text-xs sm:text-sm font-black text-slate-900">
                    {crit.titleEs}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {crit.subtitleEs}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((starNum) => {
                      const filled = starNum <= currentVal;
                      return (
                        <button
                          key={starNum}
                          type="button"
                          onClick={() =>
                            setStars((prev) => ({ ...prev, [crit.id]: starNum }))
                          }
                          className="p-0.5 cursor-pointer transition-transform hover:scale-110"
                          title={`Asignar ${starNum} de 5 estrellas`}
                        >
                          <Star
                            className={`w-6 h-6 ${
                              filled
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-300 hover:text-amber-300'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <span className="text-xs font-black font-mono text-slate-700 w-10 text-right">
                    ({currentVal}/5)
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Caja de Retroalimentación Pedagógica Pre-Escrita y Editable */}
        <div className="space-y-1.5 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Retroalimentación Pedagógica para el Alumno (Editable):</span>
            </label>
            <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Lista para enviar
            </span>
          </div>
          <textarea
            rows={3}
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            className="w-full p-3.5 rounded-2xl border border-slate-200 bg-slate-50/90 text-xs sm:text-sm font-medium text-slate-800 focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        {/* Botón Esmeralda Gigante de Guardado en 1 Clic */}
        <button
          type="button"
          onClick={handleSaveEvaluation}
          className="w-full py-4 px-6 rounded-2xl bg-[#059669] hover:bg-emerald-600 text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 cursor-pointer shadow-lg transition-transform active:scale-98"
        >
          <Save className="w-5 h-5" />
          <span>Guardar Calificación y Enviar Retroalimentación en 1 Clic</span>
        </button>
      </div>
    </div>
  );
};

