"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  LanguagesPracticeBlock, 
  LanguagesKaraokeBlock,
  LanguagesSocraticTutorBlock,
  LanguagesRoleplayMissionBlock,
  LanguagesEvaluationRubricBlock,
  StudioBlock
} from '@/types/studioBlocks';
import { useActivityBuilderStore } from '@/store/useActivityBuilderStore';
import { 
  Languages, 
  Mic, 
  ExternalLink, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  GraduationCap, 
  Theater, 
  ClipboardCheck,
  Plus,
  Trash2,
  BookOpen,
  Volume2
} from 'lucide-react';

interface Props {
  block: StudioBlock;
}

export const LanguagesBlockView: React.FC<Props> = ({ block }) => {
  const router = useRouter();
  const { updateBlockData, updateBlockTitle } = useActivityBuilderStore();

  const isPractice = block.type === 'languages_practice_portal';
  const isKaraoke = block.type === 'languages_karaoke_block';
  const isSocratic = block.type === 'languages_socratic_tutor';
  const isRoleplay = block.type === 'languages_roleplay_mission';
  const isRubric = block.type === 'languages_evaluation_rubric';

  const data = (block as any).data || {};
  const language = data.language || 'en';

  // Configuración del encabezado según tipo de bloque
  const getBlockHeader = () => {
    if (isKaraoke) {
      return {
        badge: 'Módulo de Fluidez Fonética',
        title: block.title,
        desc: 'Los estudiantes leen en voz alta con iluminación rítmica sincronizada. La Inteligencia Artificial Pedagógica evalúa la pronunciación fonética palabra por palabra con micrófono.',
        icon: Mic,
        iconColor: 'text-pink-300',
        bgGradient: 'from-purple-900/90 via-indigo-900/90 to-pink-900/80',
        border: 'border-purple-500/40'
      };
    }
    if (isSocratic) {
      return {
        badge: 'Tutor Socrático Adaptativo',
        title: block.title,
        desc: 'Práctica dialógica interactiva 1 a 1 adaptada al nivel MCER (A1 a C1) y SEP CENNI. El tutor formula preguntas abiertas y retroalimenta la formulación gramatical.',
        icon: GraduationCap,
        iconColor: 'text-violet-300',
        bgGradient: 'from-violet-900/90 via-purple-900/90 to-indigo-900/80',
        border: 'border-violet-500/40'
      };
    }
    if (isRoleplay) {
      return {
        badge: 'Misión Accional & Roleplay Inmersivo',
        title: block.title,
        desc: 'Simulación comunicativa en situaciones reales del mundo francófono o anglosajón. El estudiante interactúa asumiendo un rol para cumplir una meta práctica.',
        icon: Theater,
        iconColor: 'text-fuchsia-300',
        bgGradient: 'from-fuchsia-950/90 via-purple-900/90 to-indigo-950/80',
        border: 'border-fuchsia-500/40'
      };
    }
    if (isRubric) {
      return {
        badge: 'Evaluación Formativa & Rúbrica Oficial',
        title: block.title,
        desc: 'Matriz de evaluación multidimensional alineada a las normas oficiales SEP CENNI y France Éducation International (DELF/DALF).',
        icon: ClipboardCheck,
        iconColor: 'text-cyan-300',
        bgGradient: 'from-indigo-950/90 via-slate-900/90 to-cyan-950/80',
        border: 'border-cyan-500/40'
      };
    }
    return {
      badge: 'Avatar Didáctico de Conversación',
      title: block.title,
      desc: 'Un avatar pedagógico con voz neural y gesticulación anatómica interactúa en tiempo real guiando diálogos formativos adaptativos.',
      icon: Languages,
      iconColor: 'text-indigo-200',
      bgGradient: 'from-violet-900/80 via-indigo-900/80 to-purple-900/80',
      border: 'border-violet-500/40'
    };
  };

  const headerInfo = getBlockHeader();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="space-y-4 text-xs">
      {/* Banner de Presentación Tecnológica */}
      <div className={`p-4 rounded-2xl bg-gradient-to-r ${headerInfo.bgGradient} border ${headerInfo.border} text-white space-y-3 shadow-lg`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-violet-600/60 border border-violet-400/40 flex items-center justify-center text-white shadow-md">
              <HeaderIcon className={`w-5 h-5 ${headerInfo.iconColor}`} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-violet-300 tracking-wider block">
                {headerInfo.badge}
              </span>
              <h4 className="text-sm font-black text-white">
                {headerInfo.title}
              </h4>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-violet-500/30 border border-violet-400/50 text-[10px] font-black text-violet-200">
            {language === 'fr' ? '🇫🇷 Francés' : '🇬🇧 Inglés'}
          </span>
        </div>

        <p className="text-[11px] text-violet-200/90 leading-relaxed">
          {headerInfo.desc}
        </p>

        {/* Botón Maestro para Acceder al Portal */}
        <button
          type="button"
          onClick={() => router.push('/teacher/idiomas')}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-600 hover:from-violet-600 hover:via-indigo-600 hover:to-purple-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-violet-500/25 transition-all hover:scale-[1.01] cursor-pointer"
        >
          <span>Acceder al Centro de Idiomas (12 Fases)</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>

      {/* Controles del Bloque */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-850/70 border border-slate-200 dark:border-zinc-800 space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 dark:border-zinc-800">
          <span className="font-black text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-violet-500" />
            <span>Configuración Pedagógica del Nodo</span>
          </span>
          <span className="text-[10px] text-slate-400 font-semibold">Parámetros oficiales</span>
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
              <span>🇬🇧 Inglés (ESL)</span>
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
              <span>🇫🇷 Francés (FLE)</span>
              {language === 'fr' && <CheckCircle2 className="w-3.5 h-3.5 text-violet-600" />}
            </button>
          </div>
        </div>

        {/* CONTROLES PARA 1. AVATAR Y 2. KARAOKE */}
        {(isPractice || isKaraoke) && (
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">
              {isKaraoke ? 'Oración o Frase para el Karaoke' : 'Frase de Apertura del Avatar'}
            </label>
            <textarea
              value={isKaraoke ? data.targetSentence || '' : data.targetPhrase || ''}
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
        )}

        {isKaraoke && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-slate-700 dark:text-zinc-300">
                Velocidad del Apuntador Visual (WPM)
              </label>
              <span className="font-black text-violet-600 dark:text-violet-400">
                {data.tempoWpm || 110} WPM
              </span>
            </div>
            <input
              type="range"
              min={60}
              max={180}
              step={5}
              value={data.tempoWpm || 110}
              onChange={(e) => updateBlockData(block.id, { tempoWpm: Number(e.target.value) })}
              className="w-full accent-violet-600 cursor-pointer"
            />
          </div>
        )}

        {/* CONTROLES PARA 3. TUTOR SOCRÁTICO */}
        {isSocratic && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Nivel MCER Objetivo</label>
                <select
                  value={data.targetLevel || 'B1'}
                  onChange={(e) => updateBlockData(block.id, { targetLevel: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                >
                  <option value="A1">A1 - Descubrimiento</option>
                  <option value="A2">A2 - Intermedio Inicial</option>
                  <option value="B1">B1 - Umbral Independiente</option>
                  <option value="B2">B2 - Avanzado Fluido</option>
                  <option value="C1">C1 - Dominio Operativo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Rigor de Corrección</label>
                <select
                  value={data.correctionStrictness || 'standard'}
                  onChange={(e) => updateBlockData(block.id, { correctionStrictness: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                >
                  <option value="lenient">Flexible (Prioriza fluidez)</option>
                  <option value="standard">Equilibrado (Gramática y fluidez)</option>
                  <option value="rigorous">Riguroso (Estricto fonético y sintáctico)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Pregunta Socrática de Apertura</label>
              <textarea
                value={data.starterPrompt || ''}
                onChange={(e) => updateBlockData(block.id, { starterPrompt: e.target.value })}
                rows={2}
                className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                placeholder="Pregunta detonadora que invite al estudiante a justificar su postura..."
              />
            </div>
          </div>
        )}

        {/* CONTROLES PARA 4. ROLEPLAY & MISIÓN INMERSIVA */}
        {isRoleplay && (
          <div className="space-y-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Escenario Situacional</label>
              <select
                value={data.setting || 'cafe_paris'}
                onChange={(e) => updateBlockData(block.id, { setting: e.target.value })}
                className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
              >
                <option value="cafe_paris">☕ Café en Montmartre (París)</option>
                <option value="london_airport">✈️ Mostrador de Aeropuerto (Londres)</option>
                <option value="job_interview">💼 Entrevista Profesional Bilingüe</option>
                <option value="eco_summit">🌿 Cumbre Internacional de Ecología</option>
                <option value="museum_tour">🏛️ Visita Guiada al Museo del Louvre</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Rol del Alumno</label>
                <input
                  type="text"
                  value={data.roleStudent || ''}
                  onChange={(e) => updateBlockData(block.id, { roleStudent: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                  placeholder="Ej: Viajero que perdió su equipaje"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Rol del Interlocutor</label>
                <input
                  type="text"
                  value={data.rolePartner || ''}
                  onChange={(e) => updateBlockData(block.id, { rolePartner: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                  placeholder="Ej: Agente de aduanas bilingüe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Meta Accional de la Misión</label>
              <input
                type="text"
                value={data.missionGoal || ''}
                onChange={(e) => updateBlockData(block.id, { missionGoal: e.target.value })}
                className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                placeholder="Objetivo concreto que el alumno debe conseguir..."
              />
            </div>
          </div>
        )}

        {/* CONTROLES PARA 5. RÚBRICA FORMATIVA OFICIAL */}
        {isRubric && (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Marco de Certificación</label>
                <select
                  value={data.framework || 'CEFR'}
                  onChange={(e) => updateBlockData(block.id, { framework: e.target.value })}
                  className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs"
                >
                  <option value="CEFR">MCER (Marco Común Europeo)</option>
                  <option value="CENNI">SEP CENNI (Niveles 1 a 20)</option>
                  <option value="DELF_DALF">DELF / DALF (Francia)</option>
                  <option value="CAMBRIDGE">Cambridge English</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300">Puntaje Mínimo Aprobatorio</label>
                <input
                  type="number"
                  min={50}
                  max={100}
                  value={data.passingScore || 70}
                  onChange={(e) => updateBlockData(block.id, { passingScore: Number(e.target.value) })}
                  className="w-full p-2 rounded-xl bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 space-y-2">
              <span className="text-[11px] font-black text-slate-700 dark:text-zinc-300 block">
                Dimensiones Lingüísticas Ponderadas:
              </span>
              <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                <span className="p-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold">
                  🗣️ Producción Oral: 30%
                </span>
                <span className="p-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold">
                  🎧 Comprensión Auditiva: 25%
                </span>
                <span className="p-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold">
                  ✍️ Cohesión & Sintaxis: 25%
                </span>
                <span className="p-1 rounded bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 font-bold">
                  🎙️ Precisión Fonética: 20%
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
