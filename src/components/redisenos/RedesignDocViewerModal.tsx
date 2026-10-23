// src/components/redisenos/RedesignDocViewerModal.tsx
"use client";

import React, { useState } from 'react';
import { X, Play, Globe, CheckCircle2, AlertTriangle, Clock, Cloud, Layers, Award } from 'lucide-react';
import { RedesignDetail } from '@/lib/redisenosSandboxData';
import { gamificationAudio } from '@/lib/redisenosAudio';

interface Props {
  redesign: RedesignDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunchTestMode: (redesignKey: string) => void;
  onOpenTeacherView: (redesignKey: string) => void;
}

export function RedesignDocViewerModal({ redesign, isOpen, onClose, onLaunchTestMode, onOpenTeacherView }: Props) {
  const [activeTab, setActiveTab] = useState<'overview' | 'screens' | 'pedagogy' | 'tech'>('overview');

  if (!isOpen || !redesign) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header con botón de prueba */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {redesign.level} · {redesign.ages}
              </span>
              <span className="text-xs text-slate-400">
                Referente: <strong className="text-slate-300">{redesign.worldBenchmark}</strong>
              </span>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-white">{redesign.title}</h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                gamificationAudio.playLevelUpSound();
                onLaunchTestMode(redesign.key);
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
            >
              <Play className="w-4 h-4 fill-white" />
              Probar en Vivo (Prueba)
            </button>

            <button
              onClick={() => {
                gamificationAudio.playClickSound();
                onClose();
              }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 py-2.5 border-b border-slate-800 bg-slate-950/40 text-xs overflow-x-auto">
          {[
            { id: 'overview', label: '1. Especificación & Concepto' },
            { id: 'screens', label: '2. Galería de Pantallas (Mockups)' },
            { id: 'pedagogy', label: '3. Integración SEP & Bóveda' },
            { id: 'tech', label: '4. Viabilidad Cloud & Desafíos' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => {
                gamificationAudio.playClickSound();
                setActiveTab(t.id as any);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-slate-800 text-purple-300 border border-purple-500/30 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400" />
                  Metáfora y Bucle de Juego
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {redesign.summary}
                </p>
                <div className="flex flex-wrap gap-2">
                  {redesign.features.map((f, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Imagen Central del Hub */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Vista Principal del Hub de Aventura
                </h4>
                <div className="rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl bg-slate-950">
                  <img src={redesign.hubImage} alt={redesign.title} className="w-full object-cover max-h-[380px]" />
                </div>
              </div>

              {/* Botón directo para ver perspectiva de los 2 profesores */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/50 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">Docentes Asignados al Colegio Montessori</span>
                  <span className="text-[11px] text-slate-400">Revisa cómo los 2 profesores evalúan y acompañan este rediseño</span>
                </div>
                <button
                  onClick={() => {
                    gamificationAudio.playClickSound();
                    onOpenTeacherView(redesign.key);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Ver Vista Docente
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PANTALLAS */}
          {activeTab === 'screens' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Pantalla de Quiz Minijuego */}
                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-400 block mb-1">
                      Minijuego de Preguntas para Subir de Nivel
                    </span>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Interacción lúdica donde el alumno responde reactivos para avanzar o activar hechizos.
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mb-2">
                      <img src={redesign.quizImage} alt="Quiz" className="w-full h-48 object-cover" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Adaptado al ritmo cognitivo de {redesign.ages}.
                  </span>
                </div>

                {/* Pantalla de Avatar / Personalizador */}
                <div className="rounded-2xl bg-slate-800/40 border border-slate-700/60 p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-bold text-purple-400 block mb-1">
                      Personalización de Avatar & Logros
                    </span>
                    <p className="text-[11px] text-slate-400 mb-3">
                      Guardarropa, álbumes o portafolios de mérito sin compras con dinero real.
                    </p>
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950 mb-2">
                      <img src={redesign.avatarImage} alt="Avatar" className="w-full h-48 object-cover" />
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Evolución del avatar ligada a la constancia académica.
                  </span>
                </div>

              </div>

              {/* Estudio Universal Preview */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60">
                <span className="text-xs font-bold text-white block mb-1">
                  Módulo Universal de Autoría Docente (Universal Challenge Studio)
                </span>
                <p className="text-[11px] text-slate-400 mb-3">
                  El profesor redacta una pregunta y el sistema la transfigura automáticamente para este rediseño.
                </p>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                  <img src="/redisenos_assets/gamification_teacher_universal_studio_1792734542445.jpg" alt="Universal Studio" className="w-full h-52 object-cover" />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PEDAGOGÍA */}
          {activeTab === 'pedagogy' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="font-bold text-white text-sm">Alineación con la Nueva Escuela Mexicana (NEM 2024)</h4>
                <p className="leading-relaxed">
                  Todos los nodos, cofres y duelos se estructuran en torno a los 4 Campos Formativos oficiales:
                  <em> Lenguajes</em>, <em>Saberes y Pensamiento Científico</em>, <em>Ética, Naturaleza y Sociedades</em>, y <em>De lo Humano y lo Comunitario</em>.
                </p>
                <p className="leading-relaxed">
                  La evaluación es de carácter formativo: el error no castiga al alumno eliminándolo del juego, sino que abre rutas de andamiaje pedagógico con pistas guiadas del Asistente Pedagógico IA.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                <h4 className="font-bold text-white text-sm">Conexión con la Bóveda Curricular</h4>
                <p className="leading-relaxed">
                  Cada reto curricular está vinculado a archivos Markdown con Frontmatter YAML y enlaces bidireccionales <code>[[...]]</code>. Los personajes históricos (Don Miguel Hidalgo, Francisco Villa, Sor Juana) se presentan siempre en <strong>rigurosa primera persona</strong> y con datos verídicos contrastados.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: VIABILIDAD & TECH */}
          {activeTab === 'tech' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-amber-400" />
                    Tiempos de Capacitación Docente
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• <strong>4 a 6 horas totales</strong> divididas en 2 talleres prácticos.</li>
                    <li>• Un profesor puede crear su primer reto gamificado en menos de <strong>3 minutos</strong>.</li>
                    <li>• Cero resistencia al cambio gracias al <em>Universal Challenge Studio</em> idéntico para todos los grados.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-2">
                  <h4 className="font-bold text-white text-sm flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-cyan-400" />
                    Integración con Google Workspace & Drive
                  </h4>
                  <ul className="space-y-1.5 text-slate-300">
                    <li>• <strong>SSO Institucional (OAuth2):</strong> Acceso con cuentas @colegio.edu.mx.</li>
                    <li>• <strong>Almacenamiento Cloud Silencioso:</strong> Evidencias comprimidas obligatoriamente (WebP &lt;300KB) directo a Google Drive.</li>
                    <li>• <strong>Google Classroom:</strong> Sincronización bidireccional de tareas y calificaciones.</li>
                  </ul>
                </div>

              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <p className="text-slate-300 text-xs leading-relaxed">
                  <strong>Aislamiento Total del Núcleo:</strong> Este rediseño opera mediante una capa visual polimórfica que no altera la base de datos de producción de ISkool. En caso de no requerirse, puede ser desactivado o eliminado en segundos sin riesgo alguno.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Colegio Montessori del Valle · Matriz de Rediseños Gamificados</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl transition-colors"
          >
            Cerrar Documento
          </button>
        </div>

      </div>
    </div>
  );
}
