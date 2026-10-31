"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Play,
  Volume2,
  VolumeX,
  QrCode,
  Settings2,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Lock,
  Film,
  X
} from "lucide-react";
import { ISkoolOfficialLogo } from "@/components/brand/ISkoolOfficialLogo";
import { PublicFooter } from "@/components/PublicLanding";
import {
  QrVideoConfig,
  QrVideoPreset,
  QR_VIDEO_PRESETS,
  extractYouTubeId
} from "@/lib/services/qrVideoConfigService";
import initialConfig from "@/data/qrVideoConfig.json";

const PERMANENT_QR_URL = "https://iskool.mx/video";

export default function VideoQrLandingPage() {
  const [config, setConfig] = useState<QrVideoConfig>({
    youtubeUrl: initialConfig.youtubeUrl || "https://www.youtube.com/watch?v=LXb3EKWsInQ",
    youtubeId: initialConfig.youtubeId || "LXb3EKWsInQ",
    title: initialConfig.title || "Presentación Institucional ISkool",
    subtitle:
      initialConfig.subtitle ||
      "La plataforma integral para colegios privados en México. Escanea, conoce nuestra visión y descubre cómo transformamos la gestión escolar.",
    badgeText: initialConfig.badgeText || "Vídeo Oficial · Acceso QR Directo",
    ctaText: initialConfig.ctaText || "Explorar Plataforma ISkool",
    ctaUrl: initialConfig.ctaUrl || "https://iskool.mx",
    autoplay: initialConfig.autoplay ?? true,
    loop: initialConfig.loop ?? true,
    updatedAt: initialConfig.updatedAt || new Date().toISOString()
  });

  const [presets, setPresets] = useState<QrVideoPreset[]>(QR_VIDEO_PRESETS);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [copiedQrUrl, setCopiedQrUrl] = useState<boolean>(false);

  // Estados del formulario de cambio dinámico de vídeo
  const [formYoutubeUrl, setFormYoutubeUrl] = useState<string>(config.youtubeUrl);
  const [formTitle, setFormTitle] = useState<string>(config.title);
  const [formSubtitle, setFormSubtitle] = useState<string>(config.subtitle);
  const [formAdminKey, setFormAdminKey] = useState<string>("ISKOOL2026");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Cargar la configuración activa desde el servidor (sin caché para que cualquier cambio en el QR sea instantáneo)
  const fetchActiveConfig = useCallback(async () => {
    try {
      const res = await fetch(`/api/video-config?t=${Date.now()}`, {
        cache: "no-store"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && data?.config) {
        setConfig(data.config);
        setFormYoutubeUrl(data.config.youtubeUrl);
        setFormTitle(data.config.title);
        setFormSubtitle(data.config.subtitle);
      }
      if (Array.isArray(data?.presets) && data.presets.length > 0) {
        setPresets(data.presets);
      }
    } catch {
      // Usa configuración inicial de respaldo si hay intermitencia de red
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    fetchActiveConfig();

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "1" || params.get("edit") === "1") {
        setShowAdminModal(true);
      }
    }
  }, [fetchActiveConfig]);

  // Enviar comandos a la API del reproductor embebido de YouTube sin recargar el iframe
  const sendPlayerCommand = useCallback((func: string, args: unknown[] = []) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    win.postMessage(
      JSON.stringify({
        event: "command",
        func,
        args
      }),
      "*"
    );
  }, []);

  // Garantizar reproducción automática al cargar el reproductor
  const handleIframeLoad = useCallback(() => {
    sendPlayerCommand("playVideo");
    setTimeout(() => {
      sendPlayerCommand("playVideo");
    }, 350);
  }, [sendPlayerCommand]);

  // Alternar sonido con un toque sin reiniciar el vídeo
  const handleToggleAudio = useCallback(() => {
    if (isMuted) {
      sendPlayerCommand("unMute");
      sendPlayerCommand("setVolume", [100]);
      sendPlayerCommand("playVideo");
      setIsMuted(false);
    } else {
      sendPlayerCommand("mute");
      setIsMuted(true);
    }
  }, [isMuted, sendPlayerCommand]);

  const handleCopyPermanentUrl = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(PERMANENT_QR_URL);
      setCopiedQrUrl(true);
      setTimeout(() => setCopiedQrUrl(false), 2500);
    }
  };

  // Guardar y publicar un nuevo vídeo sin cambiar la URL iskool.mx/video
  const handleSaveConfig = async (
    overridePreset?: {
      youtubeUrl: string;
      title: string;
      subtitle: string;
    }
  ) => {
    setSaveFeedback(null);
    setIsSaving(true);

    const targetUrl = overridePreset ? overridePreset.youtubeUrl : formYoutubeUrl;
    const targetTitle = overridePreset ? overridePreset.title : formTitle;
    const targetSubtitle = overridePreset ? overridePreset.subtitle : formSubtitle;

    try {
      const res = await fetch("/api/video-config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          youtubeUrl: targetUrl,
          title: targetTitle,
          subtitle: targetSubtitle,
          autoplay: true,
          loop: true,
          adminKey: formAdminKey
        })
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setSaveFeedback({
          type: "error",
          message: data?.error || "No se pudo actualizar el vídeo."
        });
        return;
      }

      setConfig(data.config);
      setFormYoutubeUrl(data.config.youtubeUrl);
      setFormTitle(data.config.title);
      setFormSubtitle(data.config.subtitle);
      setIsMuted(true);
      setSaveFeedback({
        type: "success",
        message: `¡Vídeo actualizado en vivo! ID activo: ${data.config.youtubeId}. La URL permanente (${PERMANENT_QR_URL}) y tu código QR siguen siendo exactamente los mismos.`
      });
    } catch (error: any) {
      setSaveFeedback({
        type: "error",
        message: error?.message || "Error de conexión al guardar el vídeo."
      });
    } finally {
      setIsSaving(false);
    }
  };

  const detectedFormVideoId = extractYouTubeId(formYoutubeUrl);

  // URL de incrustación oficial de YouTube configurada para reproducción automática inmediata (autoplay=1 + playsinline=1 + enablejsapi=1)
  const embedSrc = `https://www.youtube.com/embed/${config.youtubeId}?autoplay=1&mute=1&playsinline=1&rel=0&modestbranding=1&enablejsapi=1&loop=${
    config.loop ? 1 : 0
  }&playlist=${config.youtubeId}`;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans selection:bg-blue-500 selection:text-white">
      {/* Barra superior institucional */}
      <header className="w-full border-b border-white/10 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <ISkoolOfficialLogo variant="emblem_only" theme="dark" size={32} />
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white group-hover:text-blue-400 transition-colors">
                ISkool
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-blue-400">
                Canal QR Institucional
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSaveFeedback(null);
                setShowAdminModal(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-slate-200 transition-all cursor-pointer"
              title="Cambiar el vídeo de YouTube manteniendo la misma URL y código QR"
            >
              <Settings2 className="h-3.5 w-3.5 text-blue-400" />
              <span>Cambiar Vídeo del QR</span>
            </button>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-blue-600 hover:bg-blue-500 px-4 py-1.5 text-xs font-bold text-white shadow-lg shadow-blue-600/25 transition-all"
            >
              <span>Iniciar sesión</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Contenido principal con reproductor automático */}
      <main className="flex-1 mx-auto w-full max-w-5xl px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Insignia de estado y título */}
        <div className="text-center max-w-3xl mx-auto mb-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3.5 py-1 text-xs font-bold text-blue-300 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>{config.badgeText}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-300 font-semibold">Autoplay Activo</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            {config.title}
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-slate-300 leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Contenedor 16:9 del Vídeo de YouTube con Reproducción Automática */}
        <div className="relative w-full max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden border border-white/15 bg-black shadow-2xl shadow-blue-950/50">
          {/* Botón flotante para activar/desactivar sonido en un toque (requerido por navegadores móviles al abrir desde QR) */}
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold shadow-xl backdrop-blur-md transition-all cursor-pointer ${
                isMuted
                  ? "bg-blue-600/95 hover:bg-blue-500 text-white ring-2 ring-white/30 animate-pulse"
                  : "bg-slate-900/85 hover:bg-slate-800 text-emerald-300 border border-emerald-500/40"
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span>Toca para activar sonido</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-emerald-400" />
                  <span>Sonido activado</span>
                </>
              )}
            </button>
          </div>

          <div className="relative w-full pt-[56.25%] bg-slate-900">
            <iframe
              key={config.youtubeId}
              ref={iframeRef}
              onLoad={handleIframeLoad}
              src={embedSrc}
              title={config.title}
              className="absolute inset-0 h-full w-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          {/* Barra inferior informativa del reproductor */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/95 border-t border-white/10 px-4 sm:px-6 py-3 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                <Play className="h-3.5 w-3.5 fill-emerald-400" />
                Reproducción automática al escanear QR
              </span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-[11px] text-slate-400">
                ID YouTube: <strong className="text-slate-200">{config.youtubeId}</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={`https://www.youtube.com/watch?v=${config.youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-2"
              >
                <span>Abrir en YouTube</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Tarjeta de Garantía de URL Permanente para Código QR + Acciones Rápidas */}
        <div className="mt-8 w-full max-w-4xl rounded-2xl border border-white/10 bg-slate-900/60 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-bold text-white">
                  Enlace Permanente de tu Código QR:
                </h2>
                <code className="rounded-md bg-slate-950 border border-blue-500/30 px-2 py-0.5 text-xs font-mono font-bold text-blue-300">
                  {PERMANENT_QR_URL}
                </code>
                <button
                  type="button"
                  onClick={handleCopyPermanentUrl}
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 hover:bg-white/15 px-2 py-0.5 text-[11px] font-semibold text-slate-200 transition-colors cursor-pointer"
                >
                  {copiedQrUrl ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-300">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copiar URL</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                Puedes imprimir tu código QR con la dirección{" "}
                <strong className="text-slate-200">{PERMANENT_QR_URL}</strong>. Cuando subas un nuevo vídeo a YouTube, solo cámbialo desde el botón{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSaveFeedback(null);
                    setShowAdminModal(true);
                  }}
                  className="text-blue-400 hover:text-blue-300 font-semibold underline cursor-pointer"
                >
                  Cambiar Vídeo del QR
                </button>{" "}
                y el QR impreso mostrará el nuevo vídeo sin cambiar de enlace.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <Link
              href={config.ctaUrl || "/"}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white text-slate-950 hover:bg-slate-100 px-4 py-2.5 text-xs font-black transition-all shrink-0"
            >
              <span>{config.ctaText || "Ir a ISkool"}</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Modal de Administración Dinámica del Vídeo QR (sin cambiar la URL iskool.mx/video) */}
      {showAdminModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-video-modal-title"
        >
          <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900 p-6 sm:p-8 text-white shadow-2xl my-8">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400">
                  <Film className="h-5 w-5" />
                </div>
                <div>
                  <h2 id="qr-video-modal-title" className="text-lg font-black text-white">
                    Cambiar Vídeo de YouTube del QR
                  </h2>
                  <p className="text-xs text-slate-400">
                    La URL pública{" "}
                    <span className="font-mono text-blue-300 font-bold">{PERMANENT_QR_URL}</span>{" "}
                    jamás se modifica.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAdminModal(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                aria-label="Cerrar panel"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sección 1: Prueba Rápida con 1 Clic para comprobar que el QR conserva la misma URL */}
            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                1. Prueba Rápida (Cambia el vídeo con 1 clic para comprobar que la URL no cambia)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {presets.map((preset) => {
                  const isCurrent = config.youtubeId === preset.youtubeId;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setFormYoutubeUrl(preset.youtubeUrl);
                        setFormTitle(preset.title);
                        setFormSubtitle(preset.subtitle);
                        handleSaveConfig({
                          youtubeUrl: preset.youtubeUrl,
                          title: preset.title,
                          subtitle: preset.subtitle
                        });
                      }}
                      className={`flex flex-col items-start text-left rounded-xl border p-3 transition-all cursor-pointer ${
                        isCurrent
                          ? "border-emerald-500/60 bg-emerald-500/10"
                          : "border-white/10 bg-slate-950/70 hover:border-blue-500/50 hover:bg-slate-950"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-1 mb-1">
                        <span className="text-[11px] font-bold text-white line-clamp-1">
                          {preset.label}
                        </span>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 shrink-0">
                            Activo
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-blue-300">
                        ID: {preset.youtubeId}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                        {preset.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sección 2: Pegar cualquier enlace de YouTube personalizado */}
            <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-400">
                2. O pega aquí el enlace de tu nuevo vídeo de YouTube cuando lo subas
              </label>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="youtube-url-input" className="text-xs font-semibold text-slate-200">
                    URL o ID del Vídeo de YouTube
                  </label>
                  {detectedFormVideoId ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ID detectado: <strong>{detectedFormVideoId}</strong>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400">
                      Ingresa un enlace válido de YouTube
                    </span>
                  )}
                </div>
                <input
                  id="youtube-url-input"
                  type="text"
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  placeholder="Ej. https://www.youtube.com/watch?v=... o https://youtu.be/..."
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="video-title-input" className="block text-xs font-semibold text-slate-200 mb-1">
                    Título en la página
                  </label>
                  <input
                    id="video-title-input"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="Título del vídeo"
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-key-input" className="block text-xs font-semibold text-slate-200 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Lock className="h-3 w-3 text-blue-400" />
                      Clave de Administración
                    </span>
                  </label>
                  <input
                    id="admin-key-input"
                    type="password"
                    value={formAdminKey}
                    onChange={(e) => setFormAdminKey(e.target.value)}
                    placeholder="Clave institucional (ISKOOL2026)"
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="video-subtitle-input" className="block text-xs font-semibold text-slate-200 mb-1">
                  Descripción / Subtítulo debajo del título
                </label>
                <textarea
                  id="video-subtitle-input"
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {saveFeedback && (
                <div
                  className={`rounded-xl border p-3 text-xs leading-relaxed ${
                    saveFeedback.type === "success"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-rose-500/40 bg-rose-500/10 text-rose-200"
                  }`}
                >
                  {saveFeedback.message}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    URL fija garantizada:{" "}
                    <strong className="text-white font-mono">{PERMANENT_QR_URL}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowAdminModal(false)}
                    className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
                  >
                    Cerrar
                  </button>
                  <button
                    type="button"
                    disabled={isSaving || !detectedFormVideoId}
                    onClick={() => handleSaveConfig()}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-5 py-2 text-xs font-black text-white shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Actualizando...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Guardar y Actualizar Vídeo del QR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pie de página legal homologado con contacto@iskool.mx */}
      <PublicFooter />
    </div>
  );
}

