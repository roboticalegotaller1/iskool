"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { usePortfolioStore } from '@/store/usePortfolioStore';
import { useStudentStore, useCurrentStudentAvatar, mapStudentIdToUuid, normalizeStudentId } from '@/store/useStudentStore';
import { supabase } from '@/lib/supabaseClient';
import { Header } from '@/components/Header';
import { 
  FileImage, Mic, HelpCircle, CheckCircle2, AlertCircle, Clock, 
  Heart, MessageSquare, Lock, Unlock, Sparkles, BookOpen, Trophy, 
  Star, Compass, Sparkle, Award
} from 'lucide-react';
import { FormattedDate } from '@/components/FormattedDate';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function StudentPortfolio() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Portfolio items store
  const portfolioItems = usePortfolioStore(state => state.portfolioItems);
  const fetchPortfolioItems = usePortfolioStore(state => state.fetchPortfolioItems);
  const subscribeToPortfolioChanges = usePortfolioStore(state => state.subscribeToPortfolioChanges);
  const unsubscribeFromPortfolioChanges = usePortfolioStore(state => state.unsubscribeFromPortfolioChanges);

  // Student details & avatar store
  const activeStudentId = useStudentStore(state => state.activeStudentId);
  const changeAvatar = useStudentStore(state => state.changeAvatar);
  const unlockBranchCosmetic = useStudentStore(state => state.unlockBranchCosmetic);
  const avatar = useCurrentStudentAvatar();

  // Page layout state
  const [activeTab, setActiveTab] = useState<'evidence' | 'skills'>('evidence');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Skills Tree State
  const [camposFormativos, setCamposFormativos] = useState<any[]>([]);
  const [allPdas, setAllPdas] = useState<any[]>([]);
  const [masteredPdas, setMasteredPdas] = useState<Set<string>>(new Set());
  const [loadingSkills, setLoadingSkills] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.id && user?.role === 'student') {
      fetchPortfolioItems(undefined, user.id);
      subscribeToPortfolioChanges();
      return () => {
        unsubscribeFromPortfolioChanges();
      };
    }
  }, [user?.id, user?.role, fetchPortfolioItems, subscribeToPortfolioChanges, unsubscribeFromPortfolioChanges]);

  const myPortfolioItems = useMemo(() => {
    if (!user?.id) return [];
    const uid = user.id;
    const normUid = normalizeStudentId(uid);
    const uuid = mapStudentIdToUuid(uid);
    return portfolioItems.filter(item => 
      item.student_id === uid || 
      item.student_id === normUid || 
      item.student_id === uuid ||
      normalizeStudentId(item.student_id) === normUid ||
      mapStudentIdToUuid(item.student_id) === uuid
    );
  }, [portfolioItems, user?.id]);

  // Fetch PDAs and mastered state
  const fetchSkillsData = async () => {
    try {
      const studentUuid = mapStudentIdToUuid(activeStudentId);
      
      // 1. Fetch campos formativos
      const { data: campos } = await supabase
        .from('nem_campos_formativos')
        .select('*')
        .order('name');
        
      // 2. Fetch all PDAs
      const { data: pdas } = await supabase
        .from('nem_pdas')
        .select('*')
        .order('code');
        
      // 3. Fetch all quests to link quests -> pdas
      const { data: quests } = await supabase
        .from('quests')
        .select('id, title, campo_formativo_id, pda_ids');
        
      // 4. Fetch student quest attempts
      const { data: attempts } = await supabase
        .from('quest_attempts')
        .select('*')
        .eq('student_id', studentUuid)
        .gte('score', 60); // Passing score represents mastery

      const mastered = new Set<string>();
      if (attempts && quests) {
        attempts.forEach(att => {
          const q = quests.find(quest => quest.id === att.quest_id);
          if (q && q.pda_ids) {
            (q.pda_ids as string[]).forEach((pdaId: string) => mastered.add(pdaId));
          }
        });
      }
      
      setCamposFormativos(campos || []);
      setAllPdas(pdas || []);
      setMasteredPdas(mastered);
    } catch (err) {
      console.error('Error fetching skills tree:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'skills' && user?.id) {
      setLoadingSkills(true);
      fetchSkillsData().finally(() => setLoadingSkills(false));
    }
  }, [activeTab, user?.id, activeStudentId]);

  // Check branch completions and automatically unlock cosmetics
  useEffect(() => {
    if (activeTab === 'skills' && camposFormativos.length > 0 && allPdas.length > 0) {
      camposFormativos.forEach(async (campo) => {
        const branchPdas = allPdas.filter(p => p.campo_formativo_id === campo.id);
        if (branchPdas.length > 0) {
          const allMastered = branchPdas.every(p => masteredPdas.has(p.id));
          if (allMastered) {
            let rewardId = '';
            if (campo.name.includes('Lenguajes')) rewardId = 'scribe_robe';
            else if (campo.name.includes('Saberes')) rewardId = 'scientist_goggles';
            else if (campo.name.includes('Ética')) rewardId = 'nature_spirit';
            else if (campo.name.includes('Humano')) rewardId = 'hero_tiara';
            
            if (rewardId && avatar && !(avatar.unlocked_items || []).includes(rewardId)) {
              await unlockBranchCosmetic(rewardId);
              // Show celebration toast
              setToastMessage(`🎉 ¡Felicidades! Has completado la rama "${campo.name}" y desbloqueado la recompensa cosmética: ${getRewardLabel(rewardId)}.`);
              setTimeout(() => setToastMessage(null), 8000);
            }
          }
        }
      });
    }
  }, [activeTab, camposFormativos, allPdas, masteredPdas, avatar]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
          <p className="text-sm font-medium text-zinc-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  const getRewardLabel = (rewardId: string) => {
    switch (rewardId) {
      case 'scribe_robe': return 'Túnica de Escriba 📜';
      case 'scientist_goggles': return 'Visor Científico 🥽';
      case 'nature_spirit': return 'Magia de la Naturaleza 🍃';
      case 'hero_tiara': return 'Corona del Gremio 👑';
      default: return 'Premio de Gremio';
    }
  };

  const getBranchRewardId = (campoName: string) => {
    if (campoName.includes('Lenguajes')) return 'scribe_robe';
    if (campoName.includes('Saberes')) return 'scientist_goggles';
    if (campoName.includes('Ética')) return 'nature_spirit';
    if (campoName.includes('Humano')) return 'hero_tiara';
    return '';
  };

  const handleEquipReward = async (rewardId: string) => {
    try {
      if (rewardId === 'scribe_robe') {
        await changeAvatar({ outfit_style: 'scribe_robe' });
      } else if (rewardId === 'scientist_goggles') {
        await changeAvatar({ eyes_style: 'scientist_goggles', head_type: 'scientist_goggles' });
      } else if (rewardId === 'nature_spirit') {
        await changeAvatar({ background_style: 'nature_spirit' });
      } else if (rewardId === 'hero_tiara') {
        await changeAvatar({ hair_style: 'hero_tiara' });
      }
      setToastMessage(`⚔️ ¡Equipado con éxito! Tu avatar ahora porta el accesorio: ${getRewardLabel(rewardId)}.`);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err) {
      console.error('Error equipping reward:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/40">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Aprobado
          </span>
        );
      case 'needs_revision':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/40">
            <AlertCircle className="h-3.5 w-3.5" />
            Requiere Revisión
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/40">
            <Clock className="h-3.5 w-3.5" />
            Entregado
          </span>
        );
    }
  };

  // Branch theme configuration helper
  const getBranchTheme = (name: string) => {
    if (name.includes('Lenguajes')) {
      return {
        cardBg: 'from-pink-950/20 via-purple-950/5 to-zinc-950/30 border-pink-500/20',
        badgeBg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
        activeGlow: 'bg-pink-500 shadow-lg shadow-pink-500/50 text-white border-pink-300',
        inactiveNode: 'border-zinc-800 bg-zinc-900/60 text-zinc-650',
        lineColor: 'border-pink-500/45',
        title: 'Lenguajes (Ruta del Escriba)',
        rewardName: 'Túnica de Escriba 📜'
      };
    }
    if (name.includes('Saberes')) {
      return {
        cardBg: 'from-indigo-950/20 via-blue-950/5 to-zinc-950/30 border-indigo-500/20',
        badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        activeGlow: 'bg-indigo-500 shadow-lg shadow-indigo-500/50 text-white border-indigo-300',
        inactiveNode: 'border-zinc-800 bg-zinc-900/60 text-zinc-650',
        lineColor: 'border-indigo-500/45',
        title: 'Saberes (Ruta del Alquimista)',
        rewardName: 'Visor Científico 🥽'
      };
    }
    if (name.includes('Ética')) {
      return {
        cardBg: 'from-emerald-950/20 via-teal-950/5 to-zinc-950/30 border-emerald-500/20',
        badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        activeGlow: 'bg-emerald-500 shadow-lg shadow-emerald-500/50 text-white border-emerald-300',
        inactiveNode: 'border-zinc-800 bg-zinc-900/60 text-zinc-650',
        lineColor: 'border-emerald-500/45',
        title: 'Ética (Ruta del Guardián)',
        rewardName: 'Magia de la Naturaleza 🍃'
      };
    }
    return {
      cardBg: 'from-rose-950/20 via-orange-950/5 to-zinc-950/30 border-rose-500/20',
      badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      activeGlow: 'bg-rose-500 shadow-lg shadow-rose-500/50 text-white border-rose-300',
      inactiveNode: 'border-zinc-800 bg-zinc-900/60 text-zinc-650',
      lineColor: 'border-rose-500/45',
      title: 'De lo Humano (Ruta del Campeón)',
      rewardName: 'Corona del Gremio 👑'
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 font-sans selection:bg-purple-650 selection:text-white">
      <Header />

      {/* Floating Success Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300 max-w-md bg-zinc-900 border border-purple-500/50 text-zinc-100 rounded-2xl p-4.5 shadow-2xl flex items-start gap-3.5 backdrop-blur-md">
          <Sparkles className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="flex-1">
            <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-zinc-500 hover:text-zinc-300 text-xs font-black">
            ✕
          </button>
        </div>
      )}

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Title and Description */}
        <div className="flex flex-col gap-2 mb-8">
          <h1 className="text-2xl font-black text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Trophy className="h-6 w-6 text-purple-500" />
            Portafolio y Árbol de Habilidades
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-2xl leading-relaxed">
            Monitorea tus evidencias de misiones y revisa tu avance en el Árbol de Habilidades NEM para desbloquear equipamiento legendario para tu avatar.
          </p>
        </div>

        {/* Tab Selector Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 mb-8">
          <button
            onClick={() => setActiveTab('evidence')}
            className={`pb-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'evidence'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <BookOpen className="h-4.5 w-4.5" />
            Evidencias Digitales ({myPortfolioItems.length})
          </button>
          <button
            onClick={() => setActiveTab('skills')}
            className={`pb-3 px-6 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'skills'
                ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <Compass className="h-4.5 w-4.5" />
            Árbol de Habilidades (NEM)
          </button>
        </div>

        {/* TAB 1: EVIDENCE PORTFOLIO */}
        {activeTab === 'evidence' && (
          myPortfolioItems.length === 0 ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-12 text-center flex flex-col items-center justify-center gap-4 shadow-xs">
              <HelpCircle className="h-16 w-16 text-zinc-400 animate-pulse" />
              <div>
                <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Aún no hay evidencias en tu portafolio</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  Completa retos de tipo "Entrega de Evidencia" en el tablero de misiones para subir tu primer trabajo.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              {myPortfolioItems.map((item) => {
                const isImage = item.file_type === 'image';
                
                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs flex flex-col hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                  >
                    {/* Top Status Bar */}
                    <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 uppercase tracking-wider">
                          {item.subject?.name}
                        </span>
                        <FormattedDate
                          date={item.created_at}
                          prefix="Subido el "
                          className="text-[10px] text-zinc-400 font-medium"
                        />
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 p-6">
                      {/* Left: Media File */}
                      <div className="md:col-span-2 flex flex-col gap-3">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">Archivo de Evidencia</p>
                        
                        {isImage ? (
                          <div className="relative rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 aspect-video bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
                            <img
                              src={item.file_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center gap-3 text-center">
                            <Mic className="h-8 w-8 text-blue-500 animate-pulse" />
                            <div className="w-full">
                              <p className="text-xs font-bold text-zinc-900 dark:text-white">Nota de voz grabada</p>
                              <p className="text-[9px] text-zinc-400 uppercase mt-0.5">Audio MP3</p>
                            </div>
                            <audio controls className="w-full max-w-xs mt-2" src={item.file_url} />
                          </div>
                        )}
                      </div>

                      {/* Right: Text details */}
                      <div className="md:col-span-3 flex flex-col gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-zinc-950 dark:text-white leading-snug">{item.title}</h3>
                          {item.description && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-normal">{item.description}</p>
                          )}
                        </div>

                        {/* Self Reflection */}
                        {item.self_reflection && (
                          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50">
                            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-1.5">Mi Autoevaluación</h4>
                            <p className="text-xs text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                              "{item.self_reflection}"
                            </p>
                          </div>
                        )}

                        {/* NEM Alignment */}
                        {(item.campos_formativos || item.ejes_articuladores || item.pdas) && (
                          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/50 flex flex-col gap-3">
                            <h4 className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">Alineación Estructural (NEM)</h4>
                            
                            {item.campos_formativos && item.campos_formativos.length > 0 && (
                              <div className="flex flex-col gap-1">
                                <span className="text-[9px] font-medium text-zinc-400">Campos Formativos:</span>
                                <div className="flex flex-wrap gap-1">
                                  {item.campos_formativos.map((campo, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/10">
                                      {campo}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {item.pdas && item.pdas.length > 0 && (
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[9px] font-medium text-zinc-400">PDA Alcanzado:</span>
                                <p className="text-[10.5px] font-semibold text-zinc-805 dark:text-zinc-200 leading-normal bg-white dark:bg-zinc-900 p-2 rounded-lg border border-zinc-100 dark:border-zinc-850">
                                  {item.pdas[0]}
                                </p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Teacher & Parent Comments */}
                    <div className="px-6 py-4 bg-zinc-50/50 dark:bg-zinc-950/10 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-4">
                      <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                        <MessageSquare className="h-4 w-4" />
                        Retroalimentación y Comentarios ({item.feedbacks?.length || 0})
                      </h4>

                      {item.feedbacks && item.feedbacks.length > 0 ? (
                        <div className="flex flex-col gap-3">
                          {item.feedbacks.map((fb) => {
                            const isTeacher = fb.author_role === 'teacher';
                            const isParent = fb.author_role === 'parent';
                            
                            let roleBadge = 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400';
                            if (isTeacher) roleBadge = 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/40 dark:text-yellow-400';
                            if (isParent) roleBadge = 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-450';

                            return (
                              <div
                                key={fb.id}
                                className="p-3.5 rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 flex gap-3 text-xs"
                              >
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                  isTeacher 
                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950' 
                                    : isParent
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                                      : 'bg-blue-100 text-blue-700 dark:bg-blue-950'
                                }`}>
                                  {fb.author_profile?.first_name[0]}{fb.author_profile?.last_name[0]}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center gap-4 mb-1">
                                    <div>
                                      <strong className="text-zinc-900 dark:text-white">
                                        {fb.author_profile?.first_name} {fb.author_profile?.last_name}
                                      </strong>
                                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wide uppercase ${roleBadge}`}>
                                        {isTeacher ? 'Maestro' : isParent ? 'Mamá/Papá' : 'Alumno'}
                                      </span>
                                    </div>
                                    <FormattedDate
                                      date={fb.created_at}
                                      className="text-[10px] text-zinc-400"
                                    />
                                  </div>
                                  <p className="text-zinc-700 dark:text-zinc-300 leading-normal">{fb.feedback_text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-zinc-400 italic">No hay comentarios aún. Esperando revisión del docente...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* TAB 2: SKILLS TREE (ÁRBOL DE HABILIDADES) */}
        {activeTab === 'skills' && (
          loadingSkills ? (
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-16 text-center flex flex-col items-center justify-center gap-3 shadow-xs">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-purple-500" />
              <p className="text-xs font-semibold text-zinc-500">Cargando Árbol de Habilidades...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              {camposFormativos.map((campo) => {
                const theme = getBranchTheme(campo.name);
                const branchPdas = allPdas.filter(pda => pda.campo_formativo_id === campo.id);
                const masteredCount = branchPdas.filter(pda => masteredPdas.has(pda.id)).length;
                const totalCount = branchPdas.length;
                const isComplete = totalCount > 0 && masteredCount === totalCount;
                const rewardId = getBranchRewardId(campo.name);
                const isRewardEquipped = rewardId && (
                  (rewardId === 'scribe_robe' && avatar?.outfit_style === 'scribe_robe') ||
                  (rewardId === 'scientist_goggles' && avatar?.eyes_style === 'scientist_goggles') ||
                  (rewardId === 'nature_spirit' && avatar?.background_style === 'nature_spirit') ||
                  (rewardId === 'hero_tiara' && avatar?.hair_style === 'hero_tiara')
                );

                return (
                  <div
                    key={campo.id}
                    className={`rounded-3xl border p-6 bg-gradient-to-br ${theme.cardBg} flex flex-col gap-6 shadow-md transition-all hover:scale-[1.015] duration-300 text-left`}
                  >
                    {/* Branch Header */}
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${theme.badgeBg}`}>
                          {theme.title}
                        </span>
                        <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100 mt-1">{campo.name}</h3>
                      </div>
                      
                      {/* Completion status */}
                      <span className="text-[10px] font-black bg-zinc-950/40 border border-zinc-800/80 px-2 py-1 rounded-xl text-zinc-400">
                        {masteredCount}/{totalCount} Habilidades
                      </span>
                    </div>

                    {/* Skill nodes rendering */}
                    <div className="flex flex-col gap-5 relative pl-4 border-l-2 border-dashed border-zinc-850/80">
                      {branchPdas.map((pda, idx) => {
                        const isMastered = masteredPdas.has(pda.id);
                        return (
                          <div key={pda.id} className="relative flex items-start gap-4.5 group">
                            {/* Connective point */}
                            <div
                              className={`absolute -left-[23px] top-1.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                                isMastered 
                                  ? theme.activeGlow
                                  : 'border-zinc-800 bg-zinc-950 text-zinc-500'
                              }`}
                            >
                              {isMastered ? (
                                <Star className="h-2 w-2 fill-white stroke-none" />
                              ) : (
                                <span className="text-[8px] font-black">{idx + 1}</span>
                              )}
                            </div>

                            {/* Node Card */}
                            <div
                              className={`flex-1 rounded-2xl border p-4.5 text-left transition-all ${
                                isMastered
                                  ? 'bg-zinc-950/50 border-purple-500/20 text-zinc-100'
                                  : 'bg-zinc-950/20 border-zinc-900/50 text-zinc-550'
                              }`}
                            >
                              <div className="flex justify-between items-center gap-4">
                                <span className={`text-[9.5px] font-black uppercase tracking-wider ${isMastered ? 'text-purple-400' : 'text-zinc-550'}`}>
                                  {pda.code}
                                </span>
                                
                                {isMastered ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
                                    <Sparkle className="h-3 w-3" /> Dominado
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-zinc-650 uppercase">
                                    <Lock className="h-2.5 w-2.5" /> Bloqueado
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] font-semibold leading-relaxed mt-2.5">
                                {pda.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Reward chest & equipment */}
                    <div className={`mt-2 rounded-2xl border p-4.5 flex items-center justify-between gap-4 transition-all ${
                      isComplete 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : 'bg-zinc-950/30 border-zinc-900 text-zinc-500'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center text-xl shadow-inner ${
                          isComplete ? 'bg-emerald-500/20' : 'bg-zinc-900'
                        }`}>
                          {isComplete ? '🎁' : '🔒'}
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Recompensa de Rama</p>
                          <p className={`text-xs font-black ${isComplete ? 'text-emerald-400' : 'text-zinc-500'}`}>
                            {theme.rewardName}
                          </p>
                        </div>
                      </div>

                      {isComplete ? (
                        isRewardEquipped ? (
                          <span className="px-4 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                            Equipado
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEquipReward(rewardId)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md hover:scale-[1.02]"
                          >
                            Equipar Premio
                          </button>
                        )
                      ) : (
                        <span className="text-[9.5px] font-bold text-zinc-500">
                          Domina todos los PDAs
                        </span>
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          )
        )}

      </main>
    </div>
  );
}
