"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClassroomStore } from '@/store/useClassroomStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { useAuth } from '@/context/AuthContext';
import { 
  Sparkles, 
  Flame, 
  Pin, 
  Send, 
  MessageSquare, 
  Heart, 
  Award, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  BookOpen, 
  Zap, 
  Users, 
  Smile, 
  Meh, 
  Frown, 
  ShieldAlert, 
  ChevronRight, 
  CheckCircle2, 
  FileText,
  Radio,
  Share2,
  ExternalLink
} from 'lucide-react';
import { EdictoType, EdictoPriority, SocioemotionalMood } from '@/types/classroom';

interface Props {
  onOpenLiveClass?: () => void;
  onOpenReviewSubmission?: (submissionId: string) => void;
}

export const GuildBoardView: React.FC<Props> = ({
  onOpenLiveClass,
  onOpenReviewSubmission
}) => {
  const { user } = useAuth();
  const { 
    edictosList, 
    socioemotionalList, 
    submissionsList,
    selectedGroupId, 
    setSelectedGroupId,
    addEdicto,
    deleteEdicto,
    toggleLikeEdicto,
    addCommentToEdicto,
    awardSolidarityBadge,
    recordSocioemotionalCheckin
  } = useClassroomStore();

  const groupsList = useSchoolAdminStore(state => state.groupsList);
  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);

  const [isCreatingEdicto, setIsCreatingEdicto] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<EdictoType>('announcement');
  const [newPriority, setNewPriority] = useState<EdictoPriority>('normal');
  const [newXpBonus, setNewXpBonus] = useState<number>(0);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Cálculo del Termómetro Socioemocional para hoy
  const today = new Date().toISOString().split('T')[0];
  const todayCheckins = socioemotionalList.filter(c => c.date === today);
  const totalCheckins = todayCheckins.length || 1;

  const moodCounts: Record<SocioemotionalMood, number> = {
    energized: todayCheckins.filter(c => c.mood === 'energized').length,
    motivated: todayCheckins.filter(c => c.mood === 'motivated').length,
    peaceful: todayCheckins.filter(c => c.mood === 'peaceful').length,
    tired: todayCheckins.filter(c => c.mood === 'tired').length,
    support_needed: todayCheckins.filter(c => c.mood === 'support_needed').length
  };

  const handleCreateEdictoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    addEdicto({
      teacherId: user?.id || 'usr-teacher-1',
      teacherName: (user as any)?.user_metadata?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Profesor Titular',
      groupId: selectedGroupId,
      groupName: groupsList.find(g => g.id === selectedGroupId)?.name || 'Grupo 4º A',
      title: newTitle.trim(),
      content: newContent.trim(),
      type: newType,
      priority: newPriority,
      xpBonusPercent: newXpBonus > 0 ? newXpBonus : undefined
    });

    setNewTitle('');
    setNewContent('');
    setNewType('announcement');
    setNewPriority('normal');
    setNewXpBonus(0);
    setIsCreatingEdicto(false);
  };

  const handleAddComment = (edictoId: string) => {
    const text = (commentInputs[edictoId] || '').trim();
    if (!text) return;

    addCommentToEdicto(edictoId, {
      authorId: user?.id || 'usr-teacher-1',
      authorName: (user as any)?.user_metadata?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Profesor Titular',
      authorRole: 'teacher',
      text
    });

    setCommentInputs(prev => ({ ...prev, [edictoId]: '' }));
  };

  // Filtrado de edictos del grupo
  const groupEdictos = edictosList.filter(e => e.groupId === selectedGroupId || selectedGroupId === 'all');
  const pendingSubmissions = submissionsList.filter(s => s.status === 'pending_review');

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. CABECERA DEL GREMIO & SELECTOR DE GRUPO */}
      {/* ========================================================================= */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl p-6 rounded-3xl border border-slate-200/80 dark:border-zinc-800/80 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-black border border-indigo-200/40">
            <Radio className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
            <span>Centro de Control de Clase • Tablón del Gremio</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            🏛️ Tablón de Edictos & Aula Digital
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400">
            Comunica avisos épicos, publica eventos con bonos de XP, monitorea el pulso emocional y revisa entregas de los estudiantes.
          </p>
        </div>

        {/* Acciones Rápidas: Proyector y Grupo */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={selectedGroupId}
            onChange={e => setSelectedGroupId(e.target.value)}
            className="px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold text-slate-800 dark:text-zinc-200 focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">🌐 Todos los Grupos</option>
            {groupsList.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setIsCreatingEdicto(true)}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Edicto</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. TERMÓMETRO SOCIOEMOCIONAL EN VIVO & BANNER DE ENTREGAS */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Termómetro Socioemocional */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-slate-200/80 dark:border-zinc-800/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-pink-100 dark:bg-pink-950 text-pink-600 dark:text-pink-400 flex items-center justify-center font-bold">
                <Smile className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Termómetro Socioemocional del Aula
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Pulso de energía y bienestar del grupo registrado hoy ({todayCheckins.length} respuestas)
                </p>
              </div>
            </div>

            {/* Botón rápido para simular / registrar estado */}
            <div className="flex items-center gap-1">
              {[
                { mood: 'energized' as SocioemotionalMood, icon: '🚀', label: 'Enérgico' },
                { mood: 'motivated' as SocioemotionalMood, icon: '😊', label: 'Motivado' },
                { mood: 'peaceful' as SocioemotionalMood, icon: '🧘', label: 'Tranquilo' },
                { mood: 'tired' as SocioemotionalMood, icon: '🥱', label: 'Cansado' },
                { mood: 'support_needed' as SocioemotionalMood, icon: '🆘', label: 'Ayuda' }
              ].map(({ mood, icon, label }) => (
                <button
                  key={mood}
                  type="button"
                  onClick={() => recordSocioemotionalCheckin({
                    studentId: user?.id || 'std-test',
                    studentName: (user as any)?.user_metadata?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Estudiante',
                    groupId: selectedGroupId,
                    date: today,
                    mood
                  })}
                  title={`Registrar estado: ${label}`}
                  className="p-1.5 rounded-xl bg-slate-50 dark:bg-zinc-800 hover:bg-pink-50 dark:hover:bg-pink-950/40 text-sm transition-transform hover:scale-110 cursor-pointer"
                >
                  <span>{icon}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Barras de distribución visual */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden flex shadow-inner">
              <div style={{ width: `${(moodCounts.energized / totalCheckins) * 100}%` }} className="bg-amber-400 h-full transition-all" title="Enérgicos" />
              <div style={{ width: `${(moodCounts.motivated / totalCheckins) * 100}%` }} className="bg-emerald-400 h-full transition-all" title="Motivados" />
              <div style={{ width: `${(moodCounts.peaceful / totalCheckins) * 100}%` }} className="bg-cyan-400 h-full transition-all" title="Tranquilos" />
              <div style={{ width: `${(moodCounts.tired / totalCheckins) * 100}%` }} className="bg-indigo-400 h-full transition-all" title="Cansados" />
              <div style={{ width: `${(moodCounts.support_needed / totalCheckins) * 100}%` }} className="bg-rose-500 h-full transition-all" title="Necesitan Apoyo" />
            </div>

            <div className="grid grid-cols-5 gap-2 text-center pt-1">
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                🚀 Enérgicos ({moodCounts.energized})
              </div>
              <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                😊 Motivados ({moodCounts.motivated})
              </div>
              <div className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400">
                🧘 Tranquilos ({moodCounts.peaceful})
              </div>
              <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                🥱 Cansados ({moodCounts.tired})
              </div>
              <div className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                🆘 Apoyo ({moodCounts.support_needed})
              </div>
            </div>
          </div>
        </div>

        {/* Resumen de Entregas Pendientes */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 border border-indigo-800/50 text-white shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Buzón de Portafolios
              </span>
              <span className="text-xs font-bold text-indigo-300">
                {pendingSubmissions.length} pendientes
              </span>
            </div>
            <h3 className="text-base font-black text-white mt-2">
              Evidencias por Evaluar
            </h3>
            <p className="text-xs text-indigo-200/80 font-medium">
              Alumnos han subido artefactos con autoevaluación reflexiva listos para rúbrica formativa.
            </p>
          </div>

          <div className="space-y-2">
            {pendingSubmissions.slice(0, 2).map((sub) => (
              <div
                key={sub.id}
                onClick={() => onOpenReviewSubmission && onOpenReviewSubmission(sub.id)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs flex items-center justify-between cursor-pointer transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white line-clamp-1">{sub.studentName}</div>
                  <div className="text-[10px] text-indigo-300">{sub.questTitle}</div>
                </div>
                <ChevronRight className="w-4 h-4 text-indigo-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MODAL DE CREACIÓN DE EDICTO */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {isCreatingEdicto && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-indigo-500 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" />
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Redactar Nuevo Edicto de Clase
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreatingEdicto(false)}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>

            {/* Plantillas Rápidas */}
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <span className="text-slate-400 py-1">Plantillas:</span>
              <button
                type="button"
                onClick={() => {
                  setNewTitle('🌟 ¡Evento de Doble XP de Saberes!');
                  setNewContent('Durante esta sesión, todas las actividades y participaciones otorgan +50% de XP adicional para subir de nivel tu avatar.');
                  setNewType('xp_event');
                  setNewPriority('pinned');
                  setNewXpBonus(50);
                }}
                className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                ⚡ Doble XP
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewTitle('📅 Recordatorio de Entrega de Evidencia');
                  setNewContent('Por favor recuerden subir la foto o grabación de su proyecto antes de la fecha límite para conseguir el Cofre de Puntualidad.');
                  setNewType('reminder');
                  setNewPriority('urgent');
                }}
                className="px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
              >
                ⏰ Recordatorio
              </button>
            </div>

            <form onSubmit={handleCreateEdictoSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Título del edicto..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-bold"
              />

              <textarea
                placeholder="Escribe el mensaje motivador o las instrucciones para el aula..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                rows={3}
                required
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs">
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as EdictoType)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold"
                  >
                    <option value="announcement">📢 Anuncio General</option>
                    <option value="xp_event">⚡ Evento de Bonificación XP</option>
                    <option value="challenge_quest">🏆 Misión / Desafío</option>
                    <option value="reminder">⏰ Recordatorio</option>
                    <option value="honor_shoutout">⭐ Cuadro de Honor</option>
                  </select>

                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as EdictoPriority)}
                    className="p-2 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 font-bold"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">🚨 Urgente</option>
                    <option value="pinned">📌 Fijado al inicio</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingEdicto(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs shadow-md cursor-pointer"
                  >
                    Publicar en el Tablón
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. MURO DE EDICTOS PUBLICADOS */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          <span>Edictos Publicados ({groupEdictos.length})</span>
          <span>Interacción & Apoyo Solidario</span>
        </div>

        <div className="space-y-4">
          {groupEdictos.map((edicto) => (
            <motion.div
              key={edicto.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl bg-white dark:bg-zinc-900 border transition-all shadow-sm ${
                edicto.priority === 'pinned'
                  ? 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20'
                  : edicto.priority === 'urgent'
                  ? 'border-rose-400 dark:border-rose-600'
                  : 'border-slate-200/80 dark:border-zinc-800/80'
              }`}
            >
              {/* Cabecera del Edicto */}
              <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black shadow-md">
                    {edicto.type === 'xp_event' ? <Zap className="w-5 h-5 fill-white" /> : <BookOpen className="w-5 h-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {edicto.priority === 'pinned' && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Fijado
                        </span>
                      )}
                      {edicto.xpBonusPercent && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500 fill-amber-500" /> +{edicto.xpBonusPercent}% XP
                        </span>
                      )}
                      <span className="text-[11px] text-slate-400 font-semibold">{edicto.groupName}</span>
                    </div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-0.5">
                      {edicto.title}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteEdicto(edicto.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                  title="Eliminar edicto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Contenido */}
              <div className="py-4 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
                {edicto.content}
              </div>

              {/* Botones de Me Gusta & Comentarios */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-zinc-800 text-xs">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => toggleLikeEdicto(edicto.id, user?.id || 'usr-teacher-1')}
                    className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-zinc-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-4 h-4 ${edicto.likesCount > 0 ? 'text-pink-500 fill-pink-500' : ''}`} />
                    <span>{edicto.likesCount} me gusta</span>
                  </button>

                  <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <MessageSquare className="w-4 h-4" />
                    <span>{edicto.comments.length} respuestas</span>
                  </span>
                </div>

                <span className="text-[11px] text-slate-400 font-medium">
                  Publicado por {edicto.teacherName}
                </span>
              </div>

              {/* Hilo de Comentarios & Respuestas */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 space-y-2.5">
                {edicto.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-100 dark:border-zinc-750 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-800 dark:text-zinc-200">
                          {comm.authorName}
                        </span>
                        {comm.isHelperAwarded && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-950 text-yellow-800 dark:text-yellow-300 border border-yellow-300 flex items-center gap-1">
                            <Award className="w-3 h-3 text-yellow-500" /> Compañero Solidario
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-zinc-400 font-medium">
                        {comm.text}
                      </p>
                    </div>

                    {!comm.isHelperAwarded && comm.authorRole === 'student' && (
                      <button
                        type="button"
                        onClick={() => awardSolidarityBadge(edicto.id, comm.id)}
                        className="px-2 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-950/60 border border-yellow-200 text-yellow-700 dark:text-yellow-300 text-[10px] font-black hover:bg-yellow-100 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <Award className="w-3 h-3" />
                        <span>Premiar Solidaridad</span>
                      </button>
                    )}
                  </div>
                ))}

                {/* Input para responder */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Escribe un comentario o respuesta motivadora..."
                    value={commentInputs[edicto.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [edicto.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment(edicto.id)}
                    className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddComment(edicto.id)}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
