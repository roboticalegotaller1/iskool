"use client";

import React, { useState } from 'react';
import { 
  Layers, 
  BookOpen, 
  CheckCircle2, 
  Calendar, 
  ShieldCheck, 
  Bot, 
  Sparkles, 
  GraduationCap, 
  Network, 
  BarChart3, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

interface Curriculum12PhasesExplorerProps {
  language: 'en' | 'fr';
  onSelectLessonTemplate?: (template: {
    title: string;
    topic: string;
    level: string;
    language: 'en' | 'fr';
    dialogue: any[];
    karaokePhrases: any[];
  }) => void;
}

export const Curriculum12PhasesExplorer: React.FC<Curriculum12PhasesExplorerProps> = ({ 
  language,
  onSelectLessonTemplate 
}) => {
  const [selectedPhase, setSelectedPhase] = useState<number>(6); // Por defecto Fase 6 (Planeación 40 Semanas)
  const [expandedWeek, setExpandedWeek] = useState<number | null>(1);

  // Mapeo detallado de las 12 Fases pedagógicas de ISkool
  const phases = [
    {
      id: 1,
      name: 'Fase 1: Bóveda Curricular',
      tag: 'Segundo Cerebro',
      desc: 'Base de conocimiento estructurada en Markdown y Frontmatter YAML con enlaces bidireccionales y persistencia institucional.',
      metric: language === 'fr' ? '36 Nodos FLE' : '222 Nodos ESL'
    },
    {
      id: 2,
      name: 'Fase 2: Grafo Académico Políglota',
      tag: 'Grafo Dirigido',
      desc: 'Topología de prerrequisitos sin ciclos, coherencia de dependencias y taxocodificación oficial.',
      metric: '258 Nodos Globales (0 ciclos)'
    },
    {
      id: 3,
      name: 'Fase 3: Generación Académica NEM',
      tag: 'Alineación SEP',
      desc: 'Estructuración pedagógica oficial: Inicio (10m), Desarrollo (30m), Cierre (10m) y PDA oficial de la SEP.',
      metric: '100% Calidad Aprobada'
    },
    {
      id: 4,
      name: 'Fase 4: Matriz de Certificación',
      tag: 'Equivalencia Oficial',
      desc: language === 'fr' 
        ? 'Alineación oficial France Éducation International (DELF Prim/Junior A1-B2) y SEP CENNI 1 a 20.' 
        : 'Alineación oficial Cambridge English (A1-C1) y SEP CENNI 1 a 20.',
      metric: 'CEFR A1-C1 / CENNI 1-20'
    },
    {
      id: 5,
      name: 'Fase 5: Escalamiento del Banco Curricular',
      tag: 'Cobertura Completa',
      desc: 'Cobertura total de 640 ranuras didácticas especializadas para Primaria Alta, Secundaria y Preparatoria.',
      metric: '640 Ranuras Curriculares'
    },
    {
      id: 6,
      name: 'Fase 6: Course Planning Layer (40 Semanas)',
      tag: 'Planeación Anual',
      desc: 'Distribución balanceada de 40 semanas lectivas (160 lecciones formales) con evaluaciones trimestrales.',
      metric: '160 Lecciones / 40 Semanas'
    },
    {
      id: 7,
      name: 'Fase 7: Adaptive Learning & Mastery',
      tag: 'Motor Adaptativo',
      desc: 'Diagnóstico en tiempo real, modelado de maestría BKT/IRT y sugerencias automáticas de remediación.',
      metric: 'BKT & IRT Activos'
    },
    {
      id: 8,
      name: 'Fase 8: Tutor Conversacional Socrático',
      tag: 'Diálogo Pedagógico',
      desc: 'Tutor 1 a 1 que orienta mediante preguntas detonadoras, detecta interferencias fonéticas y no da respuestas masticadas.',
      metric: '0 Tokens (Voz Local)'
    },
    {
      id: 9,
      name: 'Fase 9: Teacher Copilot (FLE & ESL)',
      tag: 'Human-in-the-Loop',
      desc: 'Asistente docente que redacta secuencias didácticas, rúbricas DELF/CENNI y sugerencias accionales en borrador.',
      metric: 'Copiloto Asistido'
    },
    {
      id: 10,
      name: 'Fase 10: Academic Analytics Engine',
      tag: 'Analítica Forense',
      desc: 'Detección de alumnos en riesgo, radares de competencias lingüísticas y distribución de cohortes.',
      metric: 'Radar & Cohortes'
    },
    {
      id: 11,
      name: 'Fase 11: Leadership Dashboard',
      tag: 'Supervisión Directiva',
      desc: 'Tablero para directores y coordinadores con KPIs institucionales de cumplimiento curricular y certificación.',
      metric: 'Gobierno Directivo'
    },
    {
      id: 12,
      name: 'Fase 12: Production Readiness & Governance',
      tag: 'Infraestructura Segura',
      desc: 'Aislamiento multi-tenant estricto, Circuit Breakers, Libro de Costos (Cost Ledger) y cumplimiento sin marcas comerciales.',
      metric: 'Marca Blanca Institucional'
    }
  ];

  // Muestra de semanas curriculares del curso de 40 semanas
  const sampleWeeks = language === 'fr' ? [
    {
      weekNumber: 1,
      title: 'Semaine 1: Premiers Contacts & Formules de Politesse',
      level: 'A1 (CENNI 3)',
      pda: 'Comunica saludos, presentaciones formales e informales y expresa su procedencia en francés.',
      lessons: [
        { id: 'fr-w1-l1', title: 'Salutations au café parisien', target: 'Bonjour, enchanté, comment allez-vous?' },
        { id: 'fr-w1-l2', title: 'Épeler son nom et nationalité', target: 'Je m\'appelle Julien et je viens du Mexique.' },
        { id: 'fr-w1-l3', title: 'Les nombres et l\'heure', target: 'Il est huit heures et demie du matin.' },
        { id: 'fr-w1-l4', title: 'Karaoke: L\'alphabet français et les liaisons', target: 'Phonétique: voyelles nasales et son [y]' }
      ]
    },
    {
      weekNumber: 2,
      title: 'Semaine 2: La Ville, Se Repérer et Transports',
      level: 'A1+ (CENNI 4)',
      pda: 'Pregunta y proporciona direcciones en la ciudad utilizando preposiciones de lugar.',
      lessons: [
        { id: 'fr-w2-l1', title: 'Dans le métro de Paris', target: 'Pourriez-vous m\'indiquer la ligne 4, s\'il vous plaît?' },
        { id: 'fr-w2-l2', title: 'Demander son chemin', target: 'Tournez à gauche après la boulangerie.' },
        { id: 'fr-w2-l3', title: 'Acheter un ticket de train', target: 'Un aller-retour pour Lyon en seconde classe.' },
        { id: 'fr-w2-l4', title: 'Karaoke: Rythme et intonation des questions', target: 'Est-ce que la gare est loin d\'ici?' }
      ]
    },
    {
      weekNumber: 15,
      title: 'Semaine 15: Écologie, Climat et Biodiversité',
      level: 'B1 (CENNI 10)',
      pda: 'Defiende su postura sobre el calentamiento global y propone iniciativas ecológicas comunitarias.',
      lessons: [
        { id: 'fr-w15-l1', title: 'Débat sur les énergies renouvelables', target: 'Il est impératif que nous réduisions nos déchets plastiques.' },
        { id: 'fr-w15-l2', title: 'Le subjonctif présent dans l\'opinion', target: 'Je doute que cette mesure soit suffisante sans recyclage.' },
        { id: 'fr-w15-l3', title: 'Protéger la forêt tropicale', target: 'La déforestation menace gravement l\'équilibre mondial.' },
        { id: 'fr-w15-l4', title: 'Karaoke: Discours argumentatif fluide', target: 'Chaque geste quotidien façonne l\'avenir de notre planète.' }
      ]
    },
    {
      weekNumber: 30,
      title: 'Semaine 30: Innovation Technologique et Intelligence Artificielle',
      level: 'B2 (CENNI 13)',
      pda: 'Analiza las implicaciones éticas y laborales de la automatización en el mundo contemporáneo.',
      lessons: [
        { id: 'fr-w30-l1', title: 'L\'éthique des algorithmes', target: 'Les retombées sociétales exigent une réglementation rigoureuse.' },
        { id: 'fr-w30-l2', title: 'Simulation d\'un colloque académique', target: 'Permettez-moi de nuancer cette affirmation catégorique.' },
        { id: 'fr-w30-l3', title: 'Rédaction d\'un essai argumenté', target: 'Loin d\'être un simple outil, la technologie redéfinit le travail.' },
        { id: 'fr-w30-l4', title: 'Karaoke: Débit oratoire rapide et liaisons savantes', target: 'L\'esprit critique demeure le rempart suprême de l\'humanité.' }
      ]
    }
  ] : [
    {
      weekNumber: 1,
      title: 'Week 1: Social Greetings & Personal Identity',
      level: 'A1 (CENNI 3)',
      pda: 'Establece contacto inicial, deletrea datos personales y expresa su ocupación en lengua inglesa.',
      lessons: [
        { id: 'en-w1-l1', title: 'Meeting classmates & introduction', target: 'Hello everyone! Glad to meet you all.' },
        { id: 'en-w1-l2', title: 'Spelling names & phone numbers', target: 'Could you please spell your last name?' },
        { id: 'en-w1-l3', title: 'Countries, nationalities and flags', target: 'I was born in Mexico and I study science.' },
        { id: 'en-w1-l4', title: 'Karaoke: The English alphabet & phonetic vowels', target: 'Practice minimal pairs: ship vs sheep' }
      ]
    },
    {
      weekNumber: 2,
      title: 'Week 2: Campus Life & Daily Routines',
      level: 'A1+ (CENNI 4)',
      pda: 'Describe su horario escolar y hábitos diarios empleando el presente simple.',
      lessons: [
        { id: 'en-w2-l1', title: 'My daily school schedule', target: 'Science lab starts at eight in the morning.' },
        { id: 'en-w2-l2', title: 'Asking for school supplies', target: 'Excuse me, may I borrow your calculator?' },
        { id: 'en-w2-l3', title: 'Frequency adverbs in conversation', target: 'I always review my notes before the quiz.' },
        { id: 'en-w2-l4', title: 'Karaoke: Third person singular -s endings', target: 'He studies, she teaches, it works smoothly' }
      ]
    },
    {
      weekNumber: 15,
      title: 'Week 15: Environmental Science & Climate Action',
      level: 'B1 (CENNI 10)',
      pda: 'Argumenta sobre soluciones al cambio climático empleando conectores de causa y consecuencia.',
      lessons: [
        { id: 'en-w15-l1', title: 'Renewable energy conference', target: 'Solar and wind power significantly reduce carbon emissions.' },
        { id: 'en-w15-l2', title: 'Cause and effect clauses', target: 'Consequently, coastal ecosystems are severely affected.' },
        { id: 'en-w15-l3', title: 'Community recycling proposal', target: 'Our school implemented a zero-waste policy.' },
        { id: 'en-w15-l4', title: 'Karaoke: Stress timing and sentence melody', target: 'Thermal energy transfers spontaneously between objects.' }
      ]
    },
    {
      weekNumber: 30,
      title: 'Week 30: AI, Ethics & Future Careers',
      level: 'B2 (CENNI 13)',
      pda: 'Sostiene un debate formal sobre el impacto laboral de la inteligencia artificial con léxico técnico.',
      lessons: [
        { id: 'en-w30-l1', title: 'The ethics of automated decision making', target: 'Transparency and fairness must guide technological governance.' },
        { id: 'en-w30-l2', title: 'Formal debate rebuttals', target: 'While I acknowledge your premise, empirical evidence suggests otherwise.' },
        { id: 'en-w30-l3', title: 'Job interview for tech roles', target: 'My background in computational thinking and critical analysis.' },
        { id: 'en-w30-l4', title: 'Karaoke: Rapid connected speech and elision', target: 'Technological disruption requires continuous adaptability.' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* Selector de las 12 Fases */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider block">
              Ecosistema Integral ISkool (12 Fases)
            </span>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>Arquitectura Curricular de 12 Fases ({language === 'fr' ? 'Francés FLE' : 'Inglés ESL'})</span>
            </h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-950 border border-indigo-700 text-xs font-black text-indigo-300">
            {language === 'fr' ? '🇫🇷 Français Langue Étrangère' : '🇬🇧 English as a Second Language'}
          </span>
        </div>

        {/* Cuadrícula de las 12 Fases */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {phases.map((phase) => {
            const isSelected = selectedPhase === phase.id;
            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhase(phase.id)}
                className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-900/80 to-purple-950/80 border-indigo-500 shadow-md shadow-indigo-500/20 scale-[1.02]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}>
                    Fase {phase.id}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                </div>

                <div>
                  <h5 className="text-[11px] font-black text-white line-clamp-1">
                    {phase.name.replace(/^Fase \d+: /, '')}
                  </h5>
                  <span className="text-[9px] text-indigo-300 block font-bold truncate">
                    {phase.metric}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle de la Fase Seleccionada */}
        {selectedPhase && (
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-700/40 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-black text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{phases[selectedPhase - 1]?.name}: {phases[selectedPhase - 1]?.tag}</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">
                {phases[selectedPhase - 1]?.metric}
              </span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              {phases[selectedPhase - 1]?.desc}
            </p>
          </div>
        )}
      </div>

      {/* Explorador de Semanas del Curso (Fase 6: Course Planning Layer) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              <span>Banco de Semanas Lectivas y Unidades Didácticas (Curso de 40 Semanas)</span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Despliega cualquier lección directamente en tu taller docente con 1 clic
            </p>
          </div>
          <span className="text-xs text-teal-400 font-mono font-bold">
            160 Lecciones Disponibles
          </span>
        </div>

        <div className="space-y-3">
          {sampleWeeks.map((week) => {
            const isExpanded = expandedWeek === week.weekNumber;

            return (
              <div
                key={week.weekNumber}
                className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden transition-all"
              >
                <div
                  onClick={() => setExpandedWeek(isExpanded ? null : week.weekNumber)}
                  className="p-4 flex items-center justify-between cursor-pointer hover:bg-slate-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-700/60 text-teal-300 font-black text-xs flex items-center justify-center">
                      S{week.weekNumber}
                    </span>
                    <div>
                      <h5 className="text-xs font-black text-white flex items-center gap-2">
                        <span>{week.title}</span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 text-[10px]">
                          {week.level}
                        </span>
                      </h5>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        PDA SEP: {week.pda}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
                      {week.lessons.length} Lecciones
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Lista de Lecciones de la Semana */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-slate-900 bg-slate-950/80 space-y-2">
                    {week.lessons.map((lesson, idx) => (
                      <div
                        key={lesson.id}
                        className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-[10px] font-black text-slate-400">
                            #{idx + 1}
                          </span>
                          <div>
                            <span className="font-bold text-white block">
                              {lesson.title}
                            </span>
                            <span className="text-[11px] text-slate-400 italic">
                              Objetivo fonético/conversacional: &ldquo;{lesson.target}&rdquo;
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectLessonTemplate?.({
                              title: lesson.title,
                              topic: week.title,
                              level: week.level.split(' ')[0],
                              language,
                              dialogue: [
                                {
                                  id: `d-${Date.now()}-1`,
                                  speaker: 'avatar',
                                  text: lesson.target,
                                  translationEs: 'Traducción de soporte para el alumno...'
                                },
                                {
                                  id: `d-${Date.now()}-2`,
                                  speaker: 'student',
                                  text: language === 'fr' 
                                    ? 'Merci professeur, je comprends parfaitement la leçon.' 
                                    : 'Thank you teacher, I understand the concept clearly.'
                                }
                              ],
                              karaokePhrases: [
                                {
                                  id: `k-${Date.now()}-1`,
                                  targetText: lesson.target,
                                  translationEs: 'Oración de fluidez en tiempo real',
                                  difficulty: 'intermediate'
                                }
                              ]
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all hover:scale-105"
                        >
                          <span>Cargar en Taller</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
