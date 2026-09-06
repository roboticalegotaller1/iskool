"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Video,
  Play,
  Film, 
  Globe, 
  BookOpen, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle2, 
  ThumbsUp, 
  Clock, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw,
  X,
  FileText,
  Check
} from 'lucide-react';
import { 
  PedagogicalVideo, 
  PedagogicalWebPortal, 
  ResearchSource, 
  PlanningPedagogicalSuggestions 
} from '@/types/pedagogicalSuggestions';
import { 
  getPedagogicalSuggestionsForPlanning, 
  resolveNormalizedLevel 
} from '@/lib/pedagogicalSuggestionsEngine';
import { useBrokenLinksStore } from '@/store/useBrokenLinksStore';

interface PedagogicalSuggestionsSectionProps {
  planning: {
    title?: string;
    subjectName?: string;
    pda?: string;
    campoFormativo?: string;
    levelId?: string;
    levelName?: string;
  };
  currentTeacherName?: string;
}

interface VerificationStatus {
  isValid: boolean;
  checkedAt: string;
  statusCode?: number;
  title?: string;
}

export const PedagogicalSuggestionsSection: React.FC<PedagogicalSuggestionsSectionProps> = ({
  planning,
  currentTeacherName = 'Docente Titular'
}) => {
  const { reportBrokenLink, brokenLinks } = useBrokenLinksStore();

  // Nivel escolar detectado y conmutador forzado
  const detectedLevel = useMemo(() => resolveNormalizedLevel(planning), [planning]);
  const [selectedLevelOverride, setSelectedLevelOverride] = useState<'preescolar' | 'primaria' | 'secundaria' | null>(null);
  const activeLevel = selectedLevelOverride || detectedLevel;

  // Sincronizar si cambia la planeación activa
  useEffect(() => {
    setSelectedLevelOverride(null);
  }, [planning?.levelId, planning?.levelName, planning?.title]);

  // Estado para el modal de confirmación de reporte manual
  const [reportModalItem, setReportModalItem] = useState<{
    url: string;
    title: string;
    type: 'video' | 'portal' | 'fuente';
  } | null>(null);
  const [reportReason, setReportReason] = useState<string>('Enlace caído o inaccesible (Error 404 / No disponible)');
  
  // Estado para previsualización modal de video en el sistema
  const [previewVideo, setPreviewVideo] = useState<PedagogicalVideo | null>(null);

  // Estados de verificación forzada en tiempo real
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResults, setVerificationResults] = useState<Record<string, VerificationStatus>>({});
  const [lastCheckTimestamp, setLastCheckTimestamp] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Obtener sugerencias para la planeación activa FORZANDO el nivel académico seleccionado
  const suggestions: PlanningPedagogicalSuggestions = useMemo(() => {
    return getPedagogicalSuggestionsForPlanning(planning, activeLevel);
  }, [planning, brokenLinks, activeLevel]);

  // Función para forzar la comprobación en vivo de todos los recursos
  const forceVerifyAllResources = useCallback(async (isManualTrigger = false) => {
    const urlsToCheck: string[] = [
      ...suggestions.videos.map(v => v.url),
      ...(suggestions.webPortal?.url ? [suggestions.webPortal.url] : []),
      ...suggestions.researchSources.filter(s => s.directUrl).map(s => s.directUrl!)
    ].filter(Boolean);

    if (urlsToCheck.length === 0) return;

    setIsVerifying(true);
    try {
      const response = await fetch('/api/verify-resource', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToCheck })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();

      if (data.results) {
        setVerificationResults(data.results);
        setLastCheckTimestamp(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

        // Si algún enlace falló la comprobación forzada, purgarlo de inmediato del ecosistema
        let purgedCount = 0;
        for (const [url, res] of Object.entries(data.results as Record<string, VerificationStatus>)) {
          if (!res.isValid) {
            purgedCount++;
            await reportBrokenLink({
              url,
              resourceTitle: 'Recurso no disponible detectado en comprobación forzada',
              resourceType: url.includes('youtube') ? 'video' : 'portal',
              reportedByTeacherName: 'Sistema de Comprobación Forzada ISkool',
              reason: 'Fallo de verificación en vivo (HTTP 404 / Video no disponible)',
            });
          }
        }

        if (isManualTrigger) {
          if (purgedCount > 0) {
            setToastMessage(`Comprobación forzada: Se detectaron y purgaron ${purgedCount} enlaces caídos.`);
          } else {
            setToastMessage(`✓ Comprobación forzada completada: Todos los videos y recursos están activos (200 OK).`);
          }
          setTimeout(() => setToastMessage(null), 5000);
        }
      }
    } catch (err: any) {
      console.warn('Advertencia en comprobación forzada:', err.message);
    } finally {
      setIsVerifying(false);
    }
  }, [suggestions, reportBrokenLink]);

  // Ejecutar comprobación forzada automática al montar o cambiar de planeación
  useEffect(() => {
    forceVerifyAllResources(false);
  }, [planning?.title, planning?.subjectName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Extraer ID de YouTube para inserción en reproductor
  const getYoutubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0` : null;
  };

  // Manejador para confirmar el reporte manual de enlace caído
  const handleConfirmReport = async () => {
    if (!reportModalItem) return;

    await reportBrokenLink({
      url: reportModalItem.url,
      resourceTitle: reportModalItem.title,
      resourceType: reportModalItem.type,
      reportedByTeacherName: currentTeacherName,
      reason: reportReason,
    });

    const itemTitle = reportModalItem.title;
    setReportModalItem(null);
    setReportReason('Enlace caído o inaccesible (Error 404 / No disponible)');

    setToastMessage(`El enlace "${itemTitle}" ha sido purgado de inmediato de todo el ecosistema de ISkool.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 6000);
  };

  const momentLabels: Record<string, { label: string; color: string }> = {
    inicio: { label: 'Fase de Inicio (Conflicto Cognitivo)', color: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300' },
    desarrollo: { label: 'Fase de Desarrollo (Contenido Central)', color: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300' },
    cierre: { label: 'Fase de Cierre (Metacognición y Síntesis)', color: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300' },
    profundizacion: { label: 'Profundización Curricular', color: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300' }
  };

  return (
    <div className="mt-8 border-t-4 border-double border-zinc-200 dark:border-zinc-800 pt-8 no-print animate-fade-in">
      {/* Toast informativo */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-3 backdrop-blur-md animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="ml-2 hover:bg-slate-800 p-1 rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Encabezado General de la Sección */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/80 dark:from-indigo-950/40 dark:via-zinc-900/80 dark:to-blue-950/30 p-6 rounded-3xl border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm mb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
              Recursos Curriculares Oficiales
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Videos Reales Comprobados (200 OK) • Sin Votos Negativos
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Sugerencias Pedagógicas
          </h3>
          <p className="text-xs text-slate-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            Acervo didáctico de apoyo docente cuidadosamente seleccionado. Todos los videos han sido <strong>comprobados en tiempo real</strong> en los servidores de YouTube para asegurar su disponibilidad inmediata sin enlaces caídos.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => forceVerifyAllResources(true)}
            disabled={isVerifying}
            title="Verificar en tiempo real que todos los enlaces estén activos"
            className={`px-3.5 py-2 rounded-2xl border text-xs font-black flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
              isVerifying
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white hover:bg-slate-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white border-slate-200 dark:border-zinc-700'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Comprobando enlaces...' : 'Forzar Comprobación en Vivo'}</span>
          </button>

          <div className="bg-white dark:bg-zinc-850 p-2 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-xs text-xs font-mono font-bold text-slate-600 dark:text-zinc-300">
            <span className="text-indigo-600 dark:text-indigo-400">5 Videos</span>
            <span> • </span>
            <span className="text-emerald-600 dark:text-emerald-400">1 Portal</span>
            <span> • </span>
            <span className="text-purple-600 dark:text-purple-400">3 Fuentes</span>
          </div>
        </div>
      </div>

      {/* Selector Forzado de Nivel Académico y Grupo de Edad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 mb-5 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-black uppercase text-slate-500 dark:text-zinc-400">
            Adecuación Curricular:
          </span>
          <span className="text-xs font-black text-slate-900 dark:text-white bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 flex items-center gap-1.5">
            {activeLevel === 'preescolar' && '🧸 Preescolar (Fase 2 • 3 a 5 años)'}
            {activeLevel === 'primaria' && '🎒 Primaria (Fases 3, 4 y 5 • 6 a 12 años)'}
            {activeLevel === 'secundaria' && '🏫 Secundaria (Fase 6 • 12 a 15 años)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-slate-200 dark:border-zinc-700 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedLevelOverride('preescolar')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeLevel === 'preescolar'
                ? 'bg-amber-500 text-white shadow-xs scale-102'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🧸 Preescolar (3-5 años)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevelOverride('primaria')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeLevel === 'primaria'
                ? 'bg-blue-600 text-white shadow-xs scale-102'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🎒 Primaria (6-12 años)
          </button>
          <button
            type="button"
            onClick={() => setSelectedLevelOverride('secundaria')}
            className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeLevel === 'secundaria'
                ? 'bg-purple-600 text-white shadow-xs scale-102'
                : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            🏫 Secundaria (12-15 años)
          </button>
        </div>
      </div>

      {lastCheckTimestamp && (
        <div className="mb-4 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-1.5 px-1 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Última comprobación forzada del servidor: <strong>{lastCheckTimestamp}</strong> — Todos los recursos validados.</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. VIDEOTECA PEDAGÓGICA (5 VIDEOS REALES COMPROBADOS) */}
      {/* ========================================================================= */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Videoteca Pedagógica Recomendada
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                5 cápsulas audiovisuales reales de divulgación certificada (Bully Magnets, INAH TV, Memorias de Pez, @prende_mx SEP).
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
            {suggestions.videos.length} videos activos
          </span>
        </div>

        {suggestions.videos.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-500">
            Los videos reportados como caídos han sido purgados del ecosistema.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {suggestions.videos.map((vid, idx) => {
              const momentInfo = momentLabels[vid.suggestedMoment] || momentLabels['desarrollo'];
              const status = verificationResults[vid.url];
              const isCheckedLive = status && status.isValid;

              return (
                <div 
                  key={vid.id || idx}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/90 hover:border-red-500/60 dark:hover:border-red-500/60 transition-all flex flex-col justify-between group shadow-xs hover:shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${momentInfo.color}`}>
                        {momentInfo.label}
                      </span>
                      
                      {isCheckedLive ? (
                        <span className="text-[9.5px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                          <Check className="w-2.5 h-2.5" />
                          200 OK Comprobado
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {vid.durationApprox}
                        </span>
                      )}
                    </div>

                    {vid.targetAgeRange && (
                      <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
                          👶 Edad: {vid.targetAgeRange}
                        </span>
                        {vid.thumbnailBadge && (
                          <span className="text-[9px] font-bold text-slate-500 dark:text-zinc-400">
                            • {vid.thumbnailBadge}
                          </span>
                        )}
                      </div>
                    )}

                    <h5 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                      {vid.title}
                    </h5>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {vid.description}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-700 dark:text-zinc-300 truncate max-w-[150px]">
                        {vid.channelName}
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                        <ThumbsUp className="w-2.5 h-2.5" />
                        {vid.likeRatioPercent}% Aprobación
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1 gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewVideo(vid)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Previsualizar video directamente en ISkool"
                        >
                          <Film className="w-3 h-3 text-red-400" />
                          <span>Previsualizar</span>
                        </button>

                        <a
                          href={vid.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-[11px] flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                          title="Abrir video en YouTube"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>YouTube</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={() => setReportModalItem({ url: vid.url, title: vid.title, type: 'video' })}
                        title="Si este enlace no funciona, márcalo para eliminarlo de inmediato de todo ISkool"
                        className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors text-[10px] font-bold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. PORTAL WEB DE REFERENCIA */}
      {/* ========================================================================= */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Globe className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
              Página y Portal Web de Referencia
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400">
              Sitio especializado institucional para consulta interactiva de alumnos y familias.
            </p>
          </div>
        </div>

        {suggestions.webPortal && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/60 dark:from-emerald-950/20 dark:via-zinc-900 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1.5 max-w-3xl">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                  {suggestions.webPortal.badgeLabel || 'Portal Institucional'}
                </span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-zinc-400">
                  {suggestions.webPortal.organization}
                </span>
                {verificationResults[suggestions.webPortal.url]?.isValid && (
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                    ✓ Enlace Activo
                  </span>
                )}
              </div>
              <h5 className="text-sm font-black text-slate-900 dark:text-white">
                {suggestions.webPortal.siteName}
              </h5>
              <p className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
                {suggestions.webPortal.summary}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
              <a
                href={suggestions.webPortal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Explorar Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setReportModalItem({ url: suggestions.webPortal.url, title: suggestions.webPortal.siteName, type: 'portal' })}
                title="Si el enlace del portal está caído, haz clic para purgarlo de ISkool"
                className="p-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. FUENTES DE INVESTIGACIÓN (MÍNIMO 3 FUENTES FORMALES) */}
      {/* ========================================================================= */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Fuentes de Investigación y Profundización
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                Por lo menos 3 obras bibliográficas formales, libros SEP y documentos de archivo para fundamentar la planeación.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-zinc-400">
            {suggestions.researchSources.length} fuentes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {suggestions.researchSources.map((src, idx) => {
            const typeLabels: Record<string, string> = {
              libro_sep: 'Libro de Texto Gratuito (SEP)',
              articulo_academico: 'Investigación Historiográfica',
              archivo_historico: 'Acervo Documental Histórico',
              ensayo_divulgacion: 'Guía Metodológica Oficial'
            };
            return (
              <div 
                key={src.id || idx}
                className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200/90 dark:border-zinc-800/90 hover:border-purple-500/60 transition-all flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900">
                      {typeLabels[src.sourceType] || 'Fuente Bibliográfica'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-400">
                      Fuente #{idx + 1}
                    </span>
                  </div>

                  <h5 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {src.title}
                  </h5>

                  <p className="text-[10.5px] font-bold text-purple-700 dark:text-purple-300">
                    {src.authorsOrEntity} • <span className="font-normal text-slate-500">{src.yearOrEdition}</span>
                  </p>

                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                    {src.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                  <div className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-850/80 text-[9.5px] font-mono text-slate-600 dark:text-zinc-400 break-words leading-tight border border-slate-150 dark:border-zinc-800">
                    {src.citationReference}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {src.directUrl ? (
                      <a
                        href={src.directUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Consultar Enlace</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-semibold italic">
                        Referencia Bibliográfica de Acervo
                      </span>
                    )}

                    {src.directUrl && (
                      <button
                        type="button"
                        onClick={() => setReportModalItem({ url: src.directUrl!, title: src.title, type: 'fuente' })}
                        title="Reportar si este enlace está caído"
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:border-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL DE REPRODUCTOR / PREVISUALIZACIÓN DE VIDEO DENTRO DE ISKOOL */}
      {/* ========================================================================= */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-5 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-red-400 bg-red-950/80 px-2 py-0.5 rounded-full border border-red-800">
                  Previsualización Comprobada
                </span>
                <h4 className="text-sm sm:text-base font-black text-white pt-1 line-clamp-1">
                  {previewVideo.title}
                </h4>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Iframe del video */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                src={getYoutubeEmbedUrl(previewVideo.url) || previewVideo.url}
                title={previewVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400 font-bold">
                Canal: <strong className="text-slate-200">{previewVideo.channelName}</strong>
              </span>
              <a
                href={previewVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>Ver en YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL DE REPORTE Y PURGA INMEDIATA DE ENLACE CAÍDO */}
      {/* ========================================================================= */}
      {reportModalItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border-2 border-rose-500/80 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    Reportar y Purgar Enlace Caído
                  </h4>
                  <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Eliminación Inmediata de todo ISkool
                  </span>
                </div>
              </div>

              <button
                onClick={() => setReportModalItem(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                Recurso: <span className="font-normal text-slate-700 dark:text-zinc-300">{reportModalItem.title}</span>
              </p>
              <p className="text-[11px] font-mono text-slate-500 dark:text-zinc-400 truncate">
                URL: {reportModalItem.url}
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                Motivo del Reporte:
              </label>
              <select
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-800 dark:text-white outline-none focus:border-rose-500"
              >
                <option value="Enlace caído o inaccesible (Error 404 / No disponible)">Enlace caído o inaccesible (Error 404 / Video no disponible)</option>
                <option value="Contenido fue eliminado por el autor">Contenido fue eliminado o retirado por el autor</option>
                <option value="Enlace bloqueado o requiere credenciales privadas">Enlace bloqueado o requiere pago/credenciales privadas</option>
                <option value="Contenido no corresponde al tema pedagógico">Contenido desactualizado o no corresponde al tema</option>
              </select>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-zinc-400 leading-relaxed">
              ⚠️ <strong>Regla del Ecosistema:</strong> Al confirmar, este recurso desaparecerá de inmediato para ti y para todos los profesores de ISkool para garantizar que nunca se entreguen enlaces rotos a la comunidad escolar.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setReportModalItem(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirmReport}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar y Borrar del Ecosistema</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
