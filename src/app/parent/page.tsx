"use client";

import React, { useState, useEffect } from 'react';
import { useStudentStore, useCurrentStudentStats, useCurrentStudentAvatar, useCurrentStudentProfile } from '@/store/useStudentStore';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useSchoolAdminStore } from '@/store/useSchoolAdminStore';
import { getStudentAcademicLevelInfo } from '@/lib/academicLevels';
import { PARENT_SEED } from '@/store/seeds';
import { Header } from '@/components/Header';
import { 
  Heart, MessageSquare, Send, CheckCircle2, 
  Trophy, Flame, Coins, Smile, Landmark, Award, Mic,
  Bell, Mail, Check, Clock, AlertTriangle, Lock
} from 'lucide-react';
import { FormattedDate } from '@/components/FormattedDate';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ParentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const currentStudent = useCurrentStudentProfile();
  const stats = useCurrentStudentStats();
  const avatar = useCurrentStudentAvatar();
  
  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const addPortfolioFeedback = usePortfolioStore(state => state.addPortfolioFeedback);
  const addReaction = usePortfolioStore(state => state.addReaction);
  
  const fetchStats = useStudentStore(state => state.fetchStats);
  const subscribeToStudentStats = useStudentStore(state => state.subscribeToStudentStats);
  const unsubscribeFromStudentStats = useStudentStore(state => state.unsubscribeFromStudentStats);

  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const subscribeToPortfolioChanges = usePortfolioStore(state => state.subscribeToPortfolioChanges);
  const unsubscribeFromPortfolioChanges = usePortfolioStore(state => state.unsubscribeFromPortfolioChanges);

  const parentMessages = useSchoolAdminStore(state => state.parentMessages);
  const markMessageAsRead = useSchoolAdminStore(state => state.markMessageAsRead);
  const replyToParentMessage = useSchoolAdminStore(state => state.replyToParentMessage);
  
  const currentParent = PARENT_SEED;

  const [parentComment, setParentComment] = useState<Record<string, string>>({});
  const [currentTab, setCurrentTab] = useState<'achievements' | 'messages'>('achievements');
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role === 'student') {
        router.push('/student');
      }
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (currentStudent?.id) {
      fetchStats();
      fetchPortfolioItems(undefined, currentStudent.id);
      
      subscribeToPortfolioChanges(() => {
        console.log("Parent Dashboard: portfolio update in realtime");
      });
      
      subscribeToStudentStats(currentStudent.id);
    }
    
    return () => {
      unsubscribeFromPortfolioChanges();
      unsubscribeFromStudentStats();
    };
  }, [currentStudent?.id, fetchStats, fetchPortfolioItems, subscribeToPortfolioChanges, unsubscribeFromPortfolioChanges, subscribeToStudentStats, unsubscribeFromStudentStats]);

  // Filtrar los portafolios del hijo actual
  const childItems = portfolioItems.filter(item => item.student_id === currentStudent.id);

  const detailedStudents = useSchoolAdminStore(state => state.detailedStudents);
  const adminStudent = detailedStudents?.find(s => s.id === currentStudent?.id || s.email === currentStudent?.email);
  const childLevelInfo = getStudentAcademicLevelInfo(adminStudent || (currentStudent as any));

  const getStudentLevelLabel = (_id?: string) => {
    return childLevelInfo.fullGradeLabel;
  };

  const handleCommentSubmit = (e: React.FormEvent, itemId: string) => {
    e.preventDefault();
    const comment = parentComment[itemId];
    if (!comment) return;

    addPortfolioFeedback(itemId, comment, 'parent', currentParent.id);

    // Limpiar campo
    setParentComment(prev => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const emojis = ['❤️', '👍', '👏', '🌟', '💪'];

  // --- RENDER STATS POR NIVEL (Para mostrar al Padre) ---
  const renderChildStats = () => {
    if (childLevelInfo.subLevel === 'primaria_baja') {
      return (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 text-xs">
          <h3 className="font-bold text-emerald-700 dark:text-emerald-400 mb-2">Estado de su Mascota ({avatar.pet_name || 'Compañero'})</h3>
          <div className="flex flex-col gap-1.5">
            <div>Felicidad: <strong>{avatar.pet_happiness ?? 50}%</strong></div>
            <div>Hambre: <strong>{avatar.pet_hunger ?? 50}%</strong></div>
            <div>Racha Activa: <strong>{stats.current_streak} días</strong></div>
          </div>
        </div>
      );
    }

    if (childLevelInfo.subLevel === 'secundaria') {
      return (
        <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-2xl border border-purple-100/50 dark:border-purple-900/30 text-xs">
          <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-2">Personaje de Rol ({childLevelInfo.levelLabel})</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>Clase: <strong>{stats.rpg_class?.toUpperCase() || 'MAGO'}</strong></div>
            <div>Nivel de Rol: <strong>{stats.level}</strong></div>
            <div>Fuerza: <strong>{stats.attribute_strength ?? 10}</strong></div>
            <div>Inteligencia: <strong>{stats.attribute_intelligence ?? 10}</strong></div>
          </div>
        </div>
      );
    }

    if (childLevelInfo.subLevel === 'preparatoria') {
      return (
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 text-xs">
          <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-2">Desempeño del Proyecto ({childLevelInfo.levelLabel})</h3>
          <div className="flex flex-col gap-1.5">
            <div>Calificación de Coevaluación: <strong>9.2 / 10</strong></div>
            <div>Créditos de Financiamiento: <strong>{stats.funding_credits ?? 1000} 💰</strong></div>
            <div>Nivel Académico: <strong>{childLevelInfo.fullGradeLabel}</strong></div>
          </div>
        </div>
      );
    }

    // Default (Primaria Alta: 4º a 6º)
    return (
      <div className="bg-zinc-100 dark:bg-zinc-900 p-4 rounded-2xl text-xs">
        <h3 className="font-bold mb-2">Estadísticas de Exploración ({childLevelInfo.levelLabel})</h3>
        <div className="flex flex-col gap-1.5">
          <div>Rango Escolar: <strong>Nivel {stats.level}</strong></div>
          <div>Monedas Acumuladas: <strong>{stats.coins} 🪙</strong></div>
          <div>Racha Activa: <strong>{stats.current_streak} días</strong></div>
        </div>
      </div>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500" />
          <p className="text-xs font-bold text-zinc-400">Verificando sesión familiar...</p>
        </div>
      </div>
    );
  }

  const isParentOrAdmin = user && ['parent', 'tutor', 'admin', 'superadmin', 'owner'].includes(user.role);

  if (!isParentOrAdmin) {
    const getRedirectInfo = () => {
      switch (user?.role) {
        case 'student':
          return { label: 'Ir a mi Portal de Alumno', path: '/student' };
        case 'teacher':
          return { label: 'Ir a mi Portal Docente', path: '/teacher' };
        case 'coordinator':
          return { label: 'Ir a mi Portal de Coordinador', path: '/coordinator' };
        case 'director':
          return { label: 'Ir a mi Portal de Director', path: '/director' };
        case 'billing':
          return { label: 'Ir a mi Portal de Cobranza', path: '/coordinator/billing' };
        default:
          return { label: 'Iniciar Sesión', path: '/login' };
      }
    };

    const redirectInfo = getRedirectInfo();

    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white p-6">
        <div className="max-w-md w-full p-8 rounded-3xl bg-zinc-900 border border-white/10 text-center space-y-4 shadow-2xl">
          <div className="h-14 w-14 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-lg font-black text-white">Acceso Restringido</h2>
          <p className="text-xs text-zinc-400">El portal familiar es de uso exclusivo para padres de familia y tutores autorizados.</p>
          <button
            onClick={() => router.push(redirectInfo.path)}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-lg shadow-emerald-600/30 cursor-pointer transition-all"
          >
            {redirectInfo.label}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Header />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner de Tutor */}
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 mb-8 shadow-sm flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
          <div>
            <h1 className="text-2xl font-black text-zinc-950 dark:text-white">Panel de Padres de Familia</h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Hijo(a) vinculado: <strong>{currentStudent.first_name} {currentStudent.last_name}</strong> | Grado: {getStudentLevelLabel(currentStudent.id)}
            </p>
          </div>

          {/* Atributos dinámicos del hijo */}
          <div className="w-full md:w-auto">
            {renderChildStats()}
          </div>
        </div>

        {/* Tab switcher de Padres */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-8">
          <div className="flex gap-2 bg-zinc-150 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/80 w-full sm:w-auto max-w-md">
            <button
              onClick={() => setCurrentTab('achievements')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                currentTab === 'achievements'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Trophy className="h-4 w-4" />
              Muro de Logros
            </button>
            <button
              onClick={() => setCurrentTab('messages')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 relative ${
                currentTab === 'messages'
                  ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-zinc-550 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200'
              }`}
            >
              <Bell className="h-4 w-4" />
              Mensajes y Alertas
              {parentMessages.filter(m => !m.is_read && (m.student_id === currentStudent?.id || m.parent_id === currentParent.id)).length > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-rose-500 text-white font-extrabold text-[9px] flex items-center justify-center animate-pulse border border-white">
                  {parentMessages.filter(m => !m.is_read && (m.student_id === currentStudent?.id || m.parent_id === currentParent.id)).length}
                </span>
              )}
            </button>
          </div>

          <Link
            href="/parent/financial"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-bold text-xs py-3 px-4 rounded-2xl transition-all shadow-sm"
          >
            <Landmark className="w-4 h-4 text-blue-300" />
            <span>Estado de Cuenta y Pagos</span>
          </Link>
        </div>

        {currentTab === 'achievements' && (
          <>
            {/* Visor de Actividad del Portafolio */}
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-6">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          Muro de Logros e Historial de Portafolio
        </h2>

        {childItems.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center text-xs text-zinc-400">
            Tu hijo aún no ha subido trabajos o evidencias para este ciclo escolar.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {childItems.map((item) => {
              const isImage = item.file_type === 'image';
              
              return (
                <div
                  key={item.id}
                  className="rounded-3xl border border-zinc-200/80 bg-white dark:border-zinc-800/80 dark:bg-zinc-900 overflow-hidden shadow-sm flex flex-col"
                >
                  {/* Header */}
                  <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-b border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-blue-50 text-[10px] font-extrabold text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/40 dark:border-blue-800/40">
                        {item.subject?.name}
                      </span>

                      {/* Insignia de Estado Formativo */}
                      {item.status === 'approved' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-[10px] font-extrabold text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-800/40 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Evaluado & Aprobado
                        </span>
                      ) : item.status === 'needs_revision' ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-[10px] font-extrabold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40 dark:border-rose-800/40 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" /> Requiere Ajustes
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-[10px] font-extrabold text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40 dark:border-amber-800/40 flex items-center gap-1">
                          <Clock className="h-3 w-3 animate-spin" /> Pendiente de Evaluación
                        </span>
                      )}
                    </div>

                    <FormattedDate
                      date={item.created_at}
                      prefix="Entregado el "
                      options={{ day: 'numeric', month: 'short' }}
                      className="text-[10px] text-zinc-400"
                    />
                  </div>

                  {/* Contenido */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                    {/* Media */}
                    <div className="md:col-span-2">
                      {isImage ? (
                        <img
                          src={item.file_url}
                          alt={item.title}
                          className="rounded-xl border border-zinc-200 dark:border-zinc-800 w-full aspect-video object-cover"
                        />
                      ) : (
                        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center gap-1">
                          <Mic className="h-5 w-5 text-blue-500" />
                          <audio controls className="w-full mt-1" src={item.file_url} />
                        </div>
                      )}
                    </div>

                    {/* Info y Alineación NEM */}
                    <div className="md:col-span-3 flex flex-col gap-3">
                      <div>
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white">{item.title}</h3>
                        {item.description && (
                          <p className="text-xs text-zinc-500 mt-1 leading-normal">{item.description}</p>
                        )}
                      </div>

                      {/* Etiquetas Formativas NEM */}
                      {((item.campos_formativos && item.campos_formativos.length > 0) || (item.ejes_articuladores && item.ejes_articuladores.length > 0)) && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.campos_formativos?.map((campo, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-[9.5px] font-bold text-purple-700 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40">
                              📘 Campo: {campo}
                            </span>
                          ))}
                          {item.ejes_articuladores?.map((eje, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-[9.5px] font-bold text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/40">
                              🧭 Eje: {eje}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reflexión del Alumno */}
                      {item.self_reflection && (
                        <div className="p-3 bg-indigo-50/30 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 text-xs italic text-zinc-700 dark:text-zinc-300">
                          "<strong>Autoevaluación del alumno:</strong> {item.self_reflection}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Feedback y Retroalimentación Formativa */}
                  <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-200/60 dark:border-zinc-800/60 flex flex-col gap-4">
                    <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      <MessageSquare className="h-4 w-4 text-blue-500" />
                      Retroalimentación Formativa Escolar ({item.feedbacks?.length || 0})
                    </h4>

                    {/* Comentarios e hilo de retroalimentación */}
                    {item.feedbacks && item.feedbacks.length > 0 ? (
                      <div className="flex flex-col gap-2.5">
                        {item.feedbacks.map((fb) => {
                          const isTeacher = fb.author_role === 'teacher';
                          return (
                            <div key={fb.id} className={`p-3.5 rounded-2xl border text-xs flex justify-between items-start gap-4 ${
                              isTeacher 
                                ? 'bg-blue-50/40 border-blue-200/60 dark:bg-blue-950/20 dark:border-blue-800/50'
                                : 'bg-white border-zinc-200 dark:bg-zinc-900 dark:border-zinc-800'
                            }`}>
                              <div className="flex-1">
                                <strong className={`text-xs ${isTeacher ? 'text-blue-700 dark:text-blue-400 font-black' : 'text-zinc-900 dark:text-white'}`}>
                                  {isTeacher ? '👨‍🏫 Profesor(a)' : fb.author_role === 'parent' || fb.author_role === 'tutor' ? '🏠 Tutor / Familia' : '👦 Alumno'}:
                                </strong>
                                <p className="mt-0.5 text-zinc-700 dark:text-zinc-200 leading-relaxed font-medium">"{fb.feedback_text}"</p>
                              </div>
                              <FormattedDate
                                date={fb.created_at}
                                options={{ day: 'numeric', month: 'short' }}
                                className="text-[9px] text-zinc-400 shrink-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No hay comentarios ni observaciones registradas aún para esta entrega.</p>
                    )}

                    {/* Formulario de Comentario de Padre de Familia / Tutor */}
                    <form onSubmit={(e) => handleCommentSubmit(e, item.id)} className="flex gap-3 items-end mt-2">
                      <div className="flex-1">
                        <textarea
                          rows={1}
                          value={parentComment[item.id] || ''}
                          onChange={(e) => setParentComment(prev => ({ ...prev, [item.id]: e.target.value }))}
                          placeholder="Escribe palabras de apoyo y motivación para tu hijo..."
                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white min-h-[40px] resize-none"
                        />
                      </div>

                      {/* Emojis rápidos */}
                      <div className="hidden sm:flex gap-1">
                        {emojis.map((emoji) => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => addReaction(item.id, user?.role === 'tutor' ? 'tutor' : 'parent', emoji)}
                            className="p-1.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg text-xs"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>

                      <button
                        type="submit"
                        disabled={!parentComment[item.id]}
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Comentar
                      </button>
                    </form>
                  </div>

                </div>
              );
            })}
          </div>
        )}
          </>
        )}

        {/* ----------------- SECCIÓN DE MENSAJES Y ALERTAS ----------------- */}
        {currentTab === 'messages' && (
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2 mb-2">
              <Bell className="h-5 w-5 text-amber-500 animate-pulse" />
              Bandeja de Avisos y Alertas Escolares
            </h2>

            {parentMessages.filter(m => m.student_id === currentStudent?.id || m.parent_id === currentParent.id).length === 0 ? (
              <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-16 text-center flex flex-col items-center justify-center gap-4 shadow-sm">
                <CheckCircle2 className="h-16 w-16 text-emerald-500" />
                <div>
                  <h3 className="text-base font-bold text-zinc-950 dark:text-white">¡Al corriente!</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    No tienes alertas pendientes de revisar ni avisos del tutor para {currentStudent.first_name}.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {parentMessages
                  .filter(m => m.student_id === currentStudent?.id || m.parent_id === currentParent.id)
                  .map((msg) => {
                    const isNew = !msg.is_read;
                    return (
                      <div
                        key={msg.id}
                        onClick={() => {
                          if (isNew) markMessageAsRead(msg.id);
                        }}
                        className={`rounded-3xl border transition-all p-6 flex flex-col gap-4 relative bg-white dark:bg-zinc-900 overflow-hidden ${
                          isNew 
                            ? 'border-blue-400/80 dark:border-blue-500/80 shadow-md shadow-blue-500/5'
                            : 'border-zinc-200 dark:border-zinc-800 shadow-sm'
                        }`}
                      >
                        {/* Header aviso */}
                        <div className="flex flex-wrap justify-between items-start gap-2 border-b border-zinc-100 dark:border-zinc-800/60 pb-3">
                          <div className="flex items-center gap-2.5">
                            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400">
                              <AlertTriangle className="h-4.5 w-4.5" />
                            </span>
                            <div>
                              <p className="text-xs font-bold text-zinc-900 dark:text-white leading-tight">
                                Prof(a). {msg.teacher_name}
                              </p>
                              <p className="text-[9.5px] text-zinc-400 mt-0.5">
                                Asignatura: <strong>{msg.subject_name}</strong> {msg.quest_title && ` | Tarea: "${msg.quest_title}"`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {isNew && (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white font-extrabold text-[8px] uppercase tracking-wider animate-pulse">
                                Nuevo
                              </span>
                            )}
                            <FormattedDate date={msg.sent_at} className="text-[10px] text-zinc-400" />
                          </div>
                        </div>

                        {/* Mensaje */}
                        <div>
                          <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold">
                            {msg.message}
                          </p>
                        </div>

                        {/* Conversación / Respuesta */}
                        <div className="border-t border-zinc-100 dark:border-zinc-800/80 pt-4 flex flex-col gap-4">
                          {msg.parent_reply ? (
                            <div className="p-4 bg-blue-50/40 dark:bg-zinc-950/40 rounded-2xl border border-blue-100/30 dark:border-zinc-800/85 text-xs flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <span className="font-extrabold text-blue-600 dark:text-blue-450">Tú (Tutor):</span>
                                <span className="ml-1.5 text-zinc-750 dark:text-zinc-300 leading-relaxed italic">"{msg.parent_reply}"</span>
                              </div>
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <span className="text-[9px] text-zinc-450 flex items-center gap-1 font-bold">
                                  <Check className="h-3.5 w-3.5 text-emerald-500 animate-bounce" /> Recibido
                                </span>
                                <FormattedDate date={msg.replied_at || ''} className="text-[9px] text-zinc-400" />
                              </div>
                            </div>
                          ) : (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                const text = replyTexts[msg.id];
                                if (!text) return;
                                replyToParentMessage(msg.id, text);
                                setReplyTexts(prev => ({ ...prev, [msg.id]: '' }));
                              }}
                              className="flex gap-3 items-end"
                            >
                              <div className="flex-1">
                                <textarea
                                  rows={1}
                                  value={replyTexts[msg.id] || ''}
                                  onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                  placeholder="Confirmar de enterado o responder al maestro..."
                                  className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 focus:border-blue-500 focus:outline-none text-zinc-900 dark:text-white min-h-[40px] resize-none"
                                />
                              </div>
                              <button
                                type="submit"
                                disabled={!replyTexts[msg.id]}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 flex items-center gap-1.5 transition-all shadow-sm"
                              >
                                <Send className="h-3.5 w-3.5" />
                                Responder
                              </button>
                            </form>
                          )}
                        </div>

                      </div>
                    );
                  })
                }
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
