"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Volume2,
  VolumeX,
  CheckCircle2,
  RefreshCw,
  Copy,
  Check,
  Sparkles,
  Film,
  X,
  Mail,
  MessageCircle,
  Phone,
  Maximize2,
  RotateCcw
} from "lucide-react";
import { ISkoolOfficialLogo } from "@/components/brand/ISkoolOfficialLogo";
import {
  QrVideoConfig,
  QrVideoPreset,
  QR_VIDEO_PRESETS,
  extractYouTubeId
} from "@/lib/services/qrVideoConfigService";
import initialConfig from "@/data/qrVideoConfig.json";

const PERMANENT_QR_URL = "https://iskool.mx/video";
const OFFICIAL_EMAIL = "contacto@iskool.mx";
const WHATSAPP_NUMBER_DISPLAY = "56 1140 4767";
const WHATSAPP_DIRECT_URL =
  "https://wa.me/525611404767?text=Hola%2C%20acabo%20de%20ver%20el%20video%20oficial%20de%20iSkool%C2%AE%20y%20me%20gustar%C3%ADa%20agendar%20una%20demostraci%C3%B3n%20para%20mi%20instituci%C3%B3n.";
const DIRECT_1080P_VIDEO_ID = "WgeQVmHDNJ4";

export default function VideoQrLandingPage() {
  const [config, setConfig] = useState<QrVideoConfig>({
    youtubeUrl: initialConfig.youtubeUrl || "https://youtu.be/WgeQVmHDNJ4",
    youtubeId: initialConfig.youtubeId || "WgeQVmHDNJ4",
    title: initialConfig.title || "iSkool® — El Cerebro Vivo de tu Escuela",
    subtitle:
      initialConfig.subtitle ||
      "Plataforma educativa integral potenciada con Inteligencia Artificial y tecnología creada en Canadá para colegios privados en México.",
    badgeText:
      initialConfig.badgeText || "Presentación Ejecutiva Oficial · 1080p Full HD",
    ctaText: initialConfig.ctaText || "Agendar Demostración",
    ctaUrl: initialConfig.ctaUrl || "https://iskool.mx",
    autoplay: initialConfig.autoplay ?? true,
    loop: initialConfig.loop ?? true,
    updatedAt: initialConfig.updatedAt || new Date().toISOString()
  });

  const [presets, setPresets] = useState<QrVideoPreset[]>(QR_VIDEO_PRESETS);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [useYtAudioBridge, setUseYtAudioBridge] = useState<boolean>(true);
  const [nativeControlsReady, setNativeControlsReady] = useState<boolean>(false);
  const [iframeScale, setIframeScale] = useState<number>(0.5);
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [copiedEmail, setCopiedEmail] = useState<boolean>(false);

  // Estados del formulario de administración (accesible mediante ?admin=1)
  const [formYoutubeUrl, setFormYoutubeUrl] = useState<string>(config.youtubeUrl);
  const [formTitle, setFormTitle] = useState<string>(config.title);
  const [formSubtitle, setFormSubtitle] = useState<string>(config.subtitle);
  const [formAdminKey, setFormAdminKey] = useState<string>("ISKOOL2026");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const audioBridgeIframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerWrapperRef = useRef<HTMLDivElement | null>(null);
  const stageViewportRef = useRef<HTMLDivElement | null>(null);
  const hasUserToggledAudioRef = useRef<boolean>(false);
  const useYtAudioBridgeRef = useRef<boolean>(true);
  const ytBridgePlayingUnmutedRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);

  const isDirect1080pStream = config.youtubeId === DIRECT_1080P_VIDEO_ID;

  // Mantener el iframe de respaldo con viewport interno real de 1920x1080
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stageEl = stageViewportRef.current;
    if (!stageEl) return;

    const updateScale = () => {
      const rect = stageEl.getBoundingClientRect();
      if (rect.width > 0) {
        setIframeScale(rect.width / 1920);
      }
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(stageEl);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  // Cargar configuración activa desde el servidor
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
      // Mantiene configuración inicial WgeQVmHDNJ4 en caso de intermitencia
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

  const triggerAudioBridgeUnmuteAndPlay = useCallback(() => {
    if (!useYtAudioBridgeRef.current) return;
    const targetWin = audioBridgeIframeRef.current?.contentWindow;
    if (!targetWin) return;
    targetWin.postMessage(
      JSON.stringify({
        event: "listening",
        id: 1,
        channel: "widget"
      }),
      "*"
    );
    const sendCmd = (func: string, args: unknown[] = []) => {
      targetWin.postMessage(
        JSON.stringify({
          event: "command",
          func,
          args
        }),
        "*"
      );
    };
    sendCmd("unloadModule", ["captions"]);
    sendCmd("unloadModule", ["cc"]);
    sendCmd("unMute");
    sendCmd("setVolume", [100]);
    sendCmd("playVideo");
  }, []);

  // Arranque inmediato en 1080p nativo con audio activo desde el segundo 0:00
  // Si el navegador permite <video> con sonido directo, usa el audio nativo del MP4 1080p;
  // si el navegador bloquea el audio de primer origen en visita fría, activa al instante el puente de audio pre-autorizado (MEI) sincronizado cuadro a cuadro con el video 1080p.
  useEffect(() => {
    if (!isDirect1080pStream) return;
    const v = videoRef.current;
    if (!v) return;

    let cancelled = false;
    let fallbackPlayTimer: ReturnType<typeof setTimeout> | null = null;
    let bridgeAuditTimer: ReturnType<typeof setTimeout> | null = null;

    const startPlayback = async () => {
      try {
        v.muted = false;
        v.volume = 1.0;
        await v.play();
        if (cancelled) return;
        useYtAudioBridgeRef.current = false;
        ytBridgePlayingUnmutedRef.current = false;
        setUseYtAudioBridge(false);
        setNativeControlsReady(true);
        setIsMuted(false);
      } catch {
        if (cancelled) return;
        if (userInteractedRef.current && !hasUserToggledAudioRef.current) {
          try {
            v.muted = false;
            v.volume = 1.0;
            await v.play();
            useYtAudioBridgeRef.current = false;
            setUseYtAudioBridge(false);
            setNativeControlsReady(true);
            setIsMuted(false);
            return;
          } catch {
            // Continúa al puente
          }
        }

        // Activar puente de audio inmediato (MEI) + arranque instantáneo del video 1080p
        v.muted = true;
        useYtAudioBridgeRef.current = true;
        setUseYtAudioBridge(true);
        triggerAudioBridgeUnmuteAndPlay();
        v.play().catch(() => {});

        fallbackPlayTimer = setTimeout(() => {
          if (!cancelled && videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          }
        }, 250);

        bridgeAuditTimer = setTimeout(() => {
          if (cancelled || hasUserToggledAudioRef.current) return;
          const el = videoRef.current;
          if (!el) return;
          if (!el.muted && !el.paused) {
            setIsMuted(false);
          } else if (ytBridgePlayingUnmutedRef.current) {
            setIsMuted(false);
          } else {
            setIsMuted(true);
          }
        }, 1800);
      }
    };

    startPlayback();

    const handleBridgeMessage = (event: MessageEvent) => {
      if (!useYtAudioBridgeRef.current) return;
      if (typeof event.data !== "string") return;
      try {
        const payload = JSON.parse(event.data);
        if (payload?.event === "onReady" || payload?.event === "initialDelivery") {
          triggerAudioBridgeUnmuteAndPlay();
          return;
        }

        if (payload?.event === "onStateChange" || payload?.event === "infoDelivery") {
          const info = payload?.info;
          const state =
            typeof info === "number" ? info : info?.playerState;

          if ((state === 1 || state === 3) && !ytBridgePlayingUnmutedRef.current) {
            triggerAudioBridgeUnmuteAndPlay();
          }

          const el = videoRef.current;
          if (!el) return;

          if (typeof info === "object" && info !== null) {
            if (typeof info.currentTime === "number" && info.currentTime > 0) {
              const wasAlreadySynced = ytBridgePlayingUnmutedRef.current;
              ytBridgePlayingUnmutedRef.current = info.muted !== true;
              if (!hasUserToggledAudioRef.current && info.muted !== true) {
                setIsMuted(false);
              }
              if (el.paused) {
                el.play().catch(() => {});
              }
              const drift = Math.abs(el.currentTime - info.currentTime);
              if (!wasAlreadySynced || drift > 0.12) {
                el.currentTime = info.currentTime;
              }
            } else if (state === 1) {
              ytBridgePlayingUnmutedRef.current = true;
              if (!hasUserToggledAudioRef.current) {
                setIsMuted(false);
              }
              if (el.paused) {
                el.play().catch(() => {});
              }
            }
          }
        }
      } catch {
        // Ignorar mensajes externos
      }
    };

    const handoverToNativeUnmutedAudio = (evt: Event) => {
      userInteractedRef.current = true;
      const target = evt.target as HTMLElement | null;
      if (target?.closest?.('[data-audio-control="true"]')) {
        return;
      }

      const el = videoRef.current;
      if (!el) return;

      if (useYtAudioBridgeRef.current) {
        useYtAudioBridgeRef.current = false;
        ytBridgePlayingUnmutedRef.current = false;
        setUseYtAudioBridge(false);
        setNativeControlsReady(true);
        if (!hasUserToggledAudioRef.current) {
          el.muted = false;
          el.volume = 1.0;
          el.play().catch(() => {});
          setIsMuted(false);
        }
      } else if (!hasUserToggledAudioRef.current && el.muted) {
        el.muted = false;
        el.volume = 1.0;
        el.play().catch(() => {});
        setNativeControlsReady(true);
        setIsMuted(false);
      }
    };

    window.addEventListener("message", handleBridgeMessage);
    window.addEventListener("click", handoverToNativeUnmutedAudio, {
      capture: true,
      passive: true
    });
    window.addEventListener("mousedown", handoverToNativeUnmutedAudio, {
      capture: true,
      passive: true
    });
    window.addEventListener("pointerup", handoverToNativeUnmutedAudio, {
      capture: true,
      passive: true
    });
    window.addEventListener("keydown", handoverToNativeUnmutedAudio, {
      capture: true,
      passive: true
    });
    window.addEventListener("touchend", handoverToNativeUnmutedAudio, {
      capture: true,
      passive: true
    });

    return () => {
      cancelled = true;
      if (fallbackPlayTimer) clearTimeout(fallbackPlayTimer);
      if (bridgeAuditTimer) clearTimeout(bridgeAuditTimer);
      window.removeEventListener("message", handleBridgeMessage);
      window.removeEventListener("click", handoverToNativeUnmutedAudio, {
        capture: true
      });
      window.removeEventListener("mousedown", handoverToNativeUnmutedAudio, {
        capture: true
      });
      window.removeEventListener("pointerup", handoverToNativeUnmutedAudio, {
        capture: true
      });
      window.removeEventListener("keydown", handoverToNativeUnmutedAudio, {
        capture: true
      });
      window.removeEventListener("touchend", handoverToNativeUnmutedAudio, {
        capture: true
      });
    };
  }, [isDirect1080pStream, config.youtubeId, triggerAudioBridgeUnmuteAndPlay]);

  const handleAudioBridgeLoad = useCallback(() => {
    triggerAudioBridgeUnmuteAndPlay();
    setTimeout(triggerAudioBridgeUnmuteAndPlay, 180);
    setTimeout(triggerAudioBridgeUnmuteAndPlay, 500);
    setTimeout(triggerAudioBridgeUnmuteAndPlay, 1100);
  }, [triggerAudioBridgeUnmuteAndPlay]);

  // Enviar comandos a la API del reproductor embebido de respaldo
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

  const enforceMaxQualityAndPlay = useCallback(
    (forceUnmute = true) => {
      const win = iframeRef.current?.contentWindow;
      if (win) {
        win.postMessage(
          JSON.stringify({
            event: "listening",
            id: 1,
            channel: "widget"
          }),
          "*"
        );
      }
      sendPlayerCommand("setPlaybackQualityRange", ["hd1080", "hd1080"]);
      sendPlayerCommand("setPlaybackQuality", ["hd1080"]);
      sendPlayerCommand("unloadModule", ["captions"]);
      sendPlayerCommand("unloadModule", ["cc"]);
      sendPlayerCommand("setOption", ["captions", "track", {}]);
      sendPlayerCommand("setOption", ["cc", "track", {}]);
      if (forceUnmute && !hasUserToggledAudioRef.current) {
        sendPlayerCommand("unMute");
        sendPlayerCommand("setVolume", [100]);
        setIsMuted(false);
      }
      sendPlayerCommand("playVideo");
    },
    [sendPlayerCommand]
  );

  const handleIframeLoad = useCallback(() => {
    enforceMaxQualityAndPlay(true);
    const t1 = setTimeout(() => enforceMaxQualityAndPlay(true), 200);
    const t2 = setTimeout(() => enforceMaxQualityAndPlay(true), 600);
    const t3 = setTimeout(() => enforceMaxQualityAndPlay(true), 1200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [enforceMaxQualityAndPlay]);

  // Alternar sonido con un toque sin reiniciar el vídeo y asegurando máxima definición 1080p
  const handleToggleAudio = useCallback(() => {
    hasUserToggledAudioRef.current = true;
    userInteractedRef.current = true;
    if (isDirect1080pStream && videoRef.current) {
      const v = videoRef.current;
      const wasBridgePlayingUnmuted = ytBridgePlayingUnmutedRef.current;
      useYtAudioBridgeRef.current = false;
      ytBridgePlayingUnmutedRef.current = false;
      setUseYtAudioBridge(false);
      setNativeControlsReady(true);

      if (isMuted || (v.muted && !wasBridgePlayingUnmuted)) {
        v.muted = false;
        v.volume = 1.0;
        v.play().catch(() => {});
        setIsMuted(false);
      } else {
        v.muted = true;
        setIsMuted(true);
      }
      return;
    }

    if (isMuted) {
      sendPlayerCommand("unMute");
      sendPlayerCommand("setVolume", [100]);
      sendPlayerCommand("setPlaybackQualityRange", ["hd1080", "hd1080"]);
      sendPlayerCommand("setPlaybackQuality", ["hd1080"]);
      sendPlayerCommand("playVideo");
      setIsMuted(false);
    } else {
      sendPlayerCommand("mute");
      setIsMuted(true);
    }
  }, [isDirect1080pStream, isMuted, sendPlayerCommand]);

  const handleRestartVideo = useCallback(() => {
    hasUserToggledAudioRef.current = true;
    if (isDirect1080pStream && videoRef.current) {
      const v = videoRef.current;
      useYtAudioBridgeRef.current = false;
      setUseYtAudioBridge(false);
      setNativeControlsReady(true);
      v.currentTime = 0;
      v.muted = false;
      v.volume = 1.0;
      v.play().catch(() => {});
      setIsMuted(false);
      return;
    }

    sendPlayerCommand("seekTo", [0, true]);
    sendPlayerCommand("unMute");
    sendPlayerCommand("setVolume", [100]);
    sendPlayerCommand("setPlaybackQualityRange", ["hd1080", "hd1080"]);
    sendPlayerCommand("setPlaybackQuality", ["hd1080"]);
    sendPlayerCommand("playVideo");
    setIsMuted(false);
  }, [isDirect1080pStream, sendPlayerCommand]);

  const handleFullscreen = useCallback(() => {
    const el = videoRef.current || playerWrapperRef.current || iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  const handleCopyEmail = useCallback(() => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(OFFICIAL_EMAIL);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  }, []);

  // Guardar y publicar un nuevo vídeo desde el modal administrativo (?admin=1)
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
      setIsMuted(false);
      setSaveFeedback({
        type: "success",
        message: `¡Vídeo actualizado en vivo! ID activo: ${data.config.youtubeId}.`
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

  // URL de incrustación optimizada: reproducción inmediata con audio activo (mute=0), máxima definición (hd=1, vq=hd1080), sin subtítulos automáticos ni ruido visual
  const embedSrc = `https://www.youtube.com/embed/${config.youtubeId}?autoplay=1&mute=0&playsinline=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&hd=1&vq=hd1080&enablejsapi=1&loop=${
    config.loop ? 1 : 0
  }&playlist=${config.youtubeId}`;

  return (
    <div className="relative min-h-screen flex flex-col bg-[#040B1A] text-white font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden">
      {/* Fondo Ambiental Cinematográfico generado con Nano Banana 2.1 */}
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-45"
        style={{
          backgroundImage: "url('/brand/iskool-video-cinema-backdrop.webp')"
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-gradient-to-b from-[#040B1A]/75 via-[#061026]/65 to-[#040B1A]/95"
        aria-hidden="true"
      />

      {/* Cabecera Ejecutiva Minimalista (Cero Ruido Visual, Optimizada para Celular, Tablet, Laptop y PC) */}
      <header className="relative z-30 w-full border-b border-white/10 bg-[#040B1A]/80 backdrop-blur-xl sticky top-0">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <ISkoolOfficialLogo
              variant="horizontal"
              theme="dark"
              size={24}
              showTagline={false}
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs font-bold text-slate-100 transition-all"
            >
              <Mail className="h-3.5 w-3.5 text-blue-400" />
              <span>{OFFICIAL_EMAIL}</span>
            </a>

            <a
              href={WHATSAPP_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 px-3.5 sm:px-4 py-1.5 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition-all"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-slate-950" />
              <span>WhatsApp Directo</span>
            </a>
          </div>
        </div>
      </header>

      {/* Escenario Principal: Reproductor en Alta Definición 1080p Nativo + Tarjeta Ejecutiva de Contacto & QR WhatsApp */}
      <main className="relative z-10 flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col justify-center">
        {/* Encabezado Compacto de Presentación */}
        <div className="text-center max-w-3xl mx-auto mb-3 sm:mb-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-[11px] sm:text-xs font-bold text-blue-200 mb-2">
            <Sparkles className="h-3.5 w-3.5 text-blue-400 shrink-0" />
            <span>{config.badgeText}</span>
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
            {config.title}
          </h1>

          <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm lg:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {config.subtitle}
          </p>
        </div>

        {/* Grid Responsivo: Celular/Tablet (Apilado Fluido) | Laptop/PC (Escenario Cine 8 col + Panel Contacto QR 4 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Columna Izquierda/Central: Reproductor 16:9 1080p Full HD Directo sin Ruido Visual */}
          <div className="lg:col-span-8 flex flex-col">
            <div
              ref={playerWrapperRef}
              className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden border border-blue-400/25 bg-black shadow-[0_20px_70px_rgba(29,104,255,0.28)]"
            >
              {/* Controles Flotantes de Audio y Pantalla Completa */}
              <div
                data-audio-control="true"
                className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-30 flex items-center gap-1.5 sm:gap-2"
              >
                <button
                  type="button"
                  onClick={handleToggleAudio}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-black shadow-2xl backdrop-blur-md transition-all cursor-pointer ${
                    isMuted
                      ? "bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-white/40 animate-pulse"
                      : "bg-slate-900/85 hover:bg-slate-800 text-emerald-300 border border-emerald-400/40"
                  }`}
                >
                  {isMuted ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                      <span>Activar sonido</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400 shrink-0" />
                      <span>Sonido HD activo · 1080p</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRestartVideo}
                  className="inline-flex items-center justify-center rounded-full bg-slate-900/85 hover:bg-slate-800 border border-white/15 p-1.5 sm:p-2 text-slate-200 hover:text-white backdrop-blur-md transition-all cursor-pointer"
                  title="Reiniciar vídeo desde el inicio con sonido"
                  aria-label="Reiniciar vídeo"
                >
                  <RotateCcw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="hidden sm:inline-flex items-center justify-center rounded-full bg-slate-900/85 hover:bg-slate-800 border border-white/15 p-2 text-slate-200 hover:text-white backdrop-blur-md transition-all cursor-pointer"
                  title="Pantalla completa"
                  aria-label="Pantalla completa"
                >
                  <Maximize2 className="h-4 w-4" />
                </button>
              </div>

              {/* Escenario 16:9: Reproducción Directa 1920x1080 (1080p Full HD Nativo desde el Segundo 0:00) */}
              <div
                ref={stageViewportRef}
                className="relative w-full pt-[56.25%] bg-[#020611] overflow-hidden"
              >
                {isDirect1080pStream ? (
                  <>
                    <video
                      key={config.youtubeId}
                      ref={videoRef}
                      src={`/api/video-stream?v=${config.youtubeId}`}
                      poster="/brand/iskool-video-poster-1080p.webp"
                      playsInline
                      loop={config.loop}
                      controls={nativeControlsReady}
                      preload="auto"
                      onVolumeChange={(e) => {
                        if (useYtAudioBridgeRef.current) return;
                        const v = e.currentTarget;
                        setIsMuted(v.muted || v.volume === 0);
                      }}
                      className="absolute inset-0 z-10 h-full w-full object-contain bg-[#020611] cursor-pointer"
                    />
                    {useYtAudioBridge && (
                      <iframe
                        ref={audioBridgeIframeRef}
                        onLoad={handleAudioBridgeLoad}
                        src={embedSrc}
                        title="Motor de Audio HD Sincronizado"
                        aria-hidden="true"
                        tabIndex={-1}
                        className="pointer-events-none absolute inset-0 z-0 h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      />
                    )}
                  </>
                ) : (
                  <iframe
                    key={config.youtubeId}
                    ref={iframeRef}
                    onLoad={handleIframeLoad}
                    src={embedSrc}
                    title={config.title}
                    style={{
                      width: "1920px",
                      height: "1080px",
                      transform: `scale(${iframeScale})`,
                      transformOrigin: "0 0"
                    }}
                    className="absolute top-0 left-0 border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )}
              </div>
            </div>

            {/* Cintillo Inferior de Contacto Directo para Celular, Tablet, Laptop y PC */}
            <div className="mt-3 sm:mt-4 rounded-2xl border border-white/10 bg-[#0A1633]/85 backdrop-blur-xl px-4 py-3 sm:px-5 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <img
                  src="/brand/iskool-video-concierge-orb.webp"
                  alt=""
                  className="hidden sm:block h-10 w-10 rounded-xl object-cover border border-blue-400/30 shrink-0"
                />
                <div>
                  <p className="text-[11px] uppercase tracking-wider font-extrabold text-blue-300">
                    Atención Ejecutiva para Colegios
                  </p>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1">
                    <a
                      href={`mailto:${OFFICIAL_EMAIL}`}
                      className="text-sm sm:text-base font-black text-white hover:text-blue-300 transition-colors"
                    >
                      {OFFICIAL_EMAIL}
                    </a>
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className="inline-flex items-center gap-1 rounded-lg bg-white/10 hover:bg-white/15 px-2 py-0.5 text-[11px] font-bold text-blue-200 transition-colors cursor-pointer"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-300">Correo copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copiar correo</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 w-full sm:w-auto">
                <a
                  href={`tel:+525611404767`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-2 text-xs font-bold text-white transition-all flex-1 sm:flex-initial"
                >
                  <Phone className="h-3.5 w-3.5 text-blue-400" />
                  <span>Tel: {WHATSAPP_NUMBER_DISPLAY}</span>
                </a>
                <a
                  href={WHATSAPP_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2 text-xs font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition-all flex-1 sm:flex-initial"
                >
                  <MessageCircle className="h-3.5 w-3.5 fill-slate-950" />
                  <span>WhatsApp {WHATSAPP_NUMBER_DISPLAY}</span>
                </a>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Código QR Oficial para Contacto por WhatsApp + Correo contacto@iskool.mx */}
          <div className="lg:col-span-4 flex flex-col">
            <div className="h-full rounded-2xl sm:rounded-3xl border border-blue-400/25 bg-gradient-to-b from-[#0C1B3D]/95 to-[#061026]/95 backdrop-blur-xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-between text-center">
              <div className="w-full">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                  <MessageCircle className="h-3.5 w-3.5" />
                  Contacto Directo por WhatsApp
                </span>

                <h2 className="mt-2.5 text-lg sm:text-xl font-black text-white leading-snug">
                  Agenda tu Demostración Ejecutiva
                </h2>
                <p className="mt-1 text-xs text-slate-300">
                  Escanea el código QR con tu celular o toca para abrir WhatsApp de inmediato
                </p>
              </div>

              {/* Código QR Oficial de iSkool® (Optimizado WebP/JPG de Alta Nitidez) */}
              <a
                href={WHATSAPP_DIRECT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group my-3 sm:my-4 relative flex items-center justify-center rounded-2xl bg-white p-3 sm:p-4 shadow-[0_12px_40px_rgba(255,255,255,0.12)] ring-4 ring-blue-500/30 hover:ring-emerald-400/60 transition-all"
                title="Escanear o tocar para contactar por WhatsApp (56 1140 4767)"
              >
                <picture>
                  <source
                    srcSet="/brand/iskool-qr-whatsapp-oficial.webp"
                    type="image/webp"
                  />
                  <img
                    src="/brand/iskool-qr-whatsapp-oficial.jpg"
                    alt="Código QR Oficial de WhatsApp iSkool® — 56 1140 4767 y contacto@iskool.mx"
                    className="h-44 w-44 sm:h-48 sm:w-48 lg:h-52 lg:w-52 object-contain rounded-lg group-hover:scale-[1.02] transition-transform"
                    loading="eager"
                  />
                </picture>
              </a>

              {/* Datos Oficiales de Contacto (WhatsApp + Correo contacto@iskool.mx) */}
              <div className="w-full space-y-2.5">
                <a
                  href={WHATSAPP_DIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 px-4 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/25 transition-all"
                >
                  <MessageCircle className="h-4 w-4 fill-slate-950" />
                  <span>WhatsApp: {WHATSAPP_NUMBER_DISPLAY}</span>
                </a>

                <div className="rounded-xl border border-blue-400/30 bg-[#040B1A]/85 px-3.5 py-2.5 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Mail className="h-4 w-4 text-blue-400 shrink-0" />
                    <a
                      href={`mailto:${OFFICIAL_EMAIL}`}
                      className="text-xs sm:text-sm font-black text-white hover:text-blue-300 truncate transition-colors"
                    >
                      correo: {OFFICIAL_EMAIL}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="shrink-0 rounded-lg bg-blue-600/25 hover:bg-blue-600/40 border border-blue-400/30 px-2.5 py-1 text-[11px] font-bold text-blue-200 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Pie Minimalista Institucional sin Ruido Visual */}
      <footer className="relative z-10 w-full border-t border-white/10 bg-[#040B1A]/90 py-3 px-4 text-center text-[11px] text-slate-400">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} <strong>iSkool®</strong> — Tecnología Creada en Canadá para Colegios Privados en México.
          </span>
          <div className="flex items-center gap-4">
            <a
              href={`mailto:${OFFICIAL_EMAIL}`}
              className="text-blue-300 hover:text-white font-bold transition-colors"
            >
              {OFFICIAL_EMAIL}
            </a>
            <span>•</span>
            <a
              href={WHATSAPP_DIRECT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-300 hover:text-white font-bold transition-colors"
            >
              WhatsApp {WHATSAPP_NUMBER_DISPLAY}
            </a>
          </div>
        </div>
      </footer>

      {/* Modal Administrativo Oculto (Accesible vía ?admin=1 para actualizar el vídeo manteniendo la URL fija) */}
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
                    Configuración de Vídeo QR Institucional
                  </h2>
                  <p className="text-xs text-slate-400">
                    URL permanente:{" "}
                    <span className="font-mono text-blue-300 font-bold">{PERMANENT_QR_URL}</span>
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

            <div className="mt-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-blue-400 mb-2">
                Vídeos Preconfigurados
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
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="youtube-url-input" className="text-xs font-semibold text-slate-200">
                    URL o ID del Vídeo
                  </label>
                  {detectedFormVideoId ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      ID: <strong>{detectedFormVideoId}</strong>
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-400">Enlace inválido</span>
                  )}
                </div>
                <input
                  id="youtube-url-input"
                  type="text"
                  value={formYoutubeUrl}
                  onChange={(e) => setFormYoutubeUrl(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2.5 text-sm text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="video-title-input" className="block text-xs font-semibold text-slate-200 mb-1">
                    Título
                  </label>
                  <input
                    id="video-title-input"
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-key-input" className="block text-xs font-semibold text-slate-200 mb-1">
                    Clave de Administración
                  </label>
                  <input
                    id="admin-key-input"
                    type="password"
                    value={formAdminKey}
                    onChange={(e) => setFormAdminKey(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="video-subtitle-input" className="block text-xs font-semibold text-slate-200 mb-1">
                  Subtítulo
                </label>
                <textarea
                  id="video-subtitle-input"
                  rows={2}
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-slate-950 px-3.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none"
                />
              </div>

              {saveFeedback && (
                <div
                  className={`rounded-xl border px-4 py-3 text-xs font-medium ${
                    saveFeedback.type === "success"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                      : "border-red-500/40 bg-red-500/10 text-red-200"
                  }`}
                >
                  {saveFeedback.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 px-4 py-2 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
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
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Guardar y Publicar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
