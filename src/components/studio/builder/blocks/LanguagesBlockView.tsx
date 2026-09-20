"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { LanguagesPracticeBlock, LanguagesKaraokeBlock } from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { 
  Languages, 
  Mic, 
  ExternalLink, 
  Sparkles, 
  Play, 
  Volume2, 
  Globe2, 
  Award, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';

interface Props {
  block: LanguagesPracticeBlock | LanguagesKaraokeBlock;
}

export const LanguagesBlockView: React.FC<Props> = ({ block }) => {
  const router = useRouter();
  const { updateBlockData, updateBlockTitle } = useActivityBuilderStore();

  const isKaraoke = block.type === 'languages_karaoke_block';
  const language = block.data.language || 'en';

  return (
    <div className="space-y-4 text-xs">
      {/* Banner de Presentación Tecnológica */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-900/80 via-indigo-900/80 to-purple-900/80 border border-violet-500/40 text-white space-y-3 shadow-lg">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-600/60 border border-violet-400/40 flex items-center justify-center text-white shadow-md">
              {isKaraoke ? <Mic className="w-5 h-5 text-pink-300" /> : <Languages className="w-5 h-5 text-indigo-200" />}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                {isKaraoke ? 'Módulo de Fluidez Fonética' : 'Avatar Didáctico de Conversación'}
              </span>
              <h4 className="text-sm font-black text-white">
                {block.title}
              </h4>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-violet-500/30 border border-violet-400/50 text-[10px] font-black text-violet-200">
            {language === 'fr' ? '🇫🇷 Francés' : '🇺🇸 Inglés'}
          </span>
        </div>

        <p className="text-[11px] text-violet-200/90 leading-relaxed">
          {isKaraoke 
            ? 'Los estudiantes leen en voz alta con iluminación rítmica sincronizada. La Inteligencia Artificial Pedagógica evalúa la pronunciación fonética palabra por palabra con micrófono.' 
            : 'Un avatar pedagógico con voz neural y gesticulación anatómica interactúa en tiempo real guiando diálogos formativos adaptativos.'
          }
        </p>

        {/* Botón Maestro para Acceder al Portal */}
        <button
          type="button"
          onClick={() => router.push('/teacher/idiomas')}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 hover:from-violet-600 hover:via-indigo-600 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-violet-500/25 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Acceder al Portal de Lenguajes & Práctica Fonética</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Controles del Bloque */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850/70 border border-slate-200 dark:border-zinc-800 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-zinc-800">
          <span className="font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-violet-500" />
            <span>Configuración del Reto Lingüístico</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Parámetros didácticos</span>
        </div>

        {/* Selector de Idioma */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
            Idioma de Práctica
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => updateBlockData(block.id, { language: 'en' })}
              className={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                language === 'en'
                  ? 'bg-violet-100 dark:bg-violet-950/80 border-violet-500 text-violet-800 dark:text-violet-200 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <span>🇺🇸 Inglés (B2)</span>
              {language === 'en' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
            </button>

            <button
              type="button"
              onClick={() => updateBlockData(block.id, { language: 'fr' })}
              className={`p-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 border transition-all cursor-pointer ${
                language === 'fr'
                  ? 'bg-violet-100 dark:bg-violet-950/80 border-violet-500 text-violet-800 dark:text-violet-200 shadow-xs'
                  : 'bg-white dark:bg-zinc-800 border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-400'
              }`}
            >
              <span>🇫🇷 Francés (A2)</span>
              {language === 'fr' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
            </button>
          </div>
        </div>

        {/* Frase / Oración Objetivo */}
        <div className="space-y-1">
          <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
            {isKaraoke ? 'Oración o Frase para el Karaoke' : 'Frase de Apertura del Avatar'}
          </label>
          <textarea
            value={
              isKaraoke 
                ? (block as LanguagesKaraokeBlock).data.targetSentence || '' 
                : (block as LanguagesPracticeBlock).data.targetPhrase || ''
            }
            onChange={(e) => {
              if (isKaraoke) {
                updateBlockData(block.id, { targetSentence: e.target.value });
              } else {
                updateBlockData(block.id, { targetPhrase: e.target.value });
              }
            }}
            rows={2}
            className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            placeholder={language === 'fr' ? 'Bonjour la classe! Aujourd\'hui nous parlons de...' : 'Hello class! Today we are practicing...'}
          />
        </div>

        {/* Parámetros Específicos de Karaoke */}
        {isKaraoke && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-slate-700 dark:text-zinc-300">
                Velocidad del Apuntador Visual (WPM)
              </label>
              <span className="font-black text-violet-600 dark:text-violet-400">
                {(block as LanguagesKaraokeBlock).data.tempoWpm || 110} WPM
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={180}
              step={5}
              value={(block as LanguagesKaraokeBlock).data.tempoWpm || 110}
              onChange={(e) => updateBlockData(block.id, { tempoWpm: Number(e.target.value) })}
              className="w-full accent-violet-600 cursor-pointer"
            />
          </div>
        )}
      </div>
    </div>
  );
};
