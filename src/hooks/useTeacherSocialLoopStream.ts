"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { TeacherMilestoneEvent } from '@/lib/teacherMilestoneBroadcaster';
import { useTeacherGamificationStore } from '@/store/useTeacherGamificationStore';

export type SSEConnectionStatus = 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'offline';

interface UseTeacherSocialLoopStreamOptions {
  teacherId?: string;
  schoolId?: string;
  enabled?: boolean;
}

/**
 * Hook para conectar el panel docente al Teacher Social Loop en tiempo real (SSE)
 * con tolerancia a fallos y auto-reconexión resiliente.
 * 
 * Características clave:
 * 1. Backoff Exponencial con Jitter: 1s, 2s, 4s, 8s... hasta un tope de 30s.
 * 2. Liveness Watchdog (Heartbeat): Monitorea eventos ping/heartbeat periódicos; si transcurren
 *    más de 45s sin actividad, detecta el corte silencioso de red y fuerza reconexión limpia.
 * 3. Detección de Estado de Red: Reconexión inmediata ante el evento 'online' del navegador.
 * 4. Consumo Cero de CPU en Espera: Usa temporizadores asíncronos sin bucles de polling.
 */
export function useTeacherSocialLoopStream({
  teacherId = 'usr-teacher-1',
  schoolId,
  enabled = true
}: UseTeacherSocialLoopStreamOptions = {}) {
  const [connectionStatus, setConnectionStatus] = useState<SSEConnectionStatus>('disconnected');
  const [latestMilestone, setLatestMilestone] = useState<TeacherMilestoneEvent | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastHeartbeatRef = useRef<number>(Date.now());
  const attemptCountRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  const clearMilestone = useCallback(() => {
    setLatestMilestone(null);
  }, []);

  /**
   * Calcula el tiempo de espera para el próximo reintento aplicando Backoff Exponencial con Jitter
   */
  const calculateBackoffDelay = useCallback((attempt: number): number => {
    const baseDelayMs = 1000; // 1 segundo
    const maxDelayMs = 30000; // 30 segundos tope
    const exponential = baseDelayMs * Math.pow(2, Math.min(attempt, 5));
    const jitter = Math.floor(Math.random() * 1000); // 0 a 1000ms aleatorio para desincronizar clientes
    return Math.min(maxDelayMs, exponential) + jitter;
  }, []);

  /**
   * Cierra la conexión SSE actual de forma limpia
   */
  const cleanupConnection = useCallback(() => {
    if (eventSourceRef.current) {
      try {
        eventSourceRef.current.close();
      } catch (_) {}
      eventSourceRef.current = null;
    }
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  /**
   * Inicializa o reintenta la conexión Server-Sent Events
   */
  const connectSSE = useCallback(() => {
    if (!isMountedRef.current || !enabled || typeof window === 'undefined') return;

    // Si el navegador está sin internet físico
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setConnectionStatus('offline');
      return;
    }

    cleanupConnection();

    setConnectionStatus(attemptCountRef.current === 0 ? 'connecting' : 'reconnecting');

    const params = new URLSearchParams();
    if (teacherId) params.append('teacherId', teacherId);
    if (schoolId) params.append('schoolId', schoolId);

    const sseUrl = `/api/realtime/teacher-milestones?${params.toString()}`;

    try {
      const eventSource = new EventSource(sseUrl);
      eventSourceRef.current = eventSource;
      lastHeartbeatRef.current = Date.now();

      // 1. Conexión establecida con éxito
      eventSource.addEventListener('connected', () => {
        if (!isMountedRef.current) return;
        setConnectionStatus('connected');
        lastHeartbeatRef.current = Date.now();
        // Resetear reintentos tras conexión establecida
        attemptCountRef.current = 0;
        setRetryCount(0);
      });

      // 2. Heartbeat (Ping) del servidor cada 25-30s
      eventSource.addEventListener('ping', () => {
        lastHeartbeatRef.current = Date.now();
        if (connectionStatus !== 'connected' && isMountedRef.current) {
          setConnectionStatus('connected');
        }
      });

      // 3. Evento de Hito Pedagógico (Milestone)
      eventSource.addEventListener('milestone', (e: MessageEvent) => {
        lastHeartbeatRef.current = Date.now();
        try {
          const milestone: TeacherMilestoneEvent = JSON.parse(e.data);
          if (isMountedRef.current) {
            setLatestMilestone(milestone);
          }

          // Actualización de estado en cliente sin consultas a BD
          const store = useTeacherGamificationStore.getState();
          const currentStats = store.stats;

          useTeacherGamificationStore.setState({
            stats: {
              ...currentStats,
              xp: (currentStats.xp || 0) + (milestone.teacherXpReward || 5),
              karma_points: (currentStats.karma_points || 0) + (milestone.teacherKarmaReward || 2),
              students_impacted: (currentStats.students_impacted || 0) + 1
            },
            activeNotification: {
              message: milestone.message,
              xpEarned: milestone.teacherXpReward,
              karmaEarned: milestone.teacherKarmaReward
            }
          });
        } catch (err) {
          console.error('[SSE Teacher Social Loop] Error procesando evento milestone:', err);
        }
      });

      // 4. Error de conexión o corte de red oscilante
      eventSource.onerror = () => {
        if (!isMountedRef.current) return;

        cleanupConnection();

        // Si estamos offline
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          setConnectionStatus('offline');
          return;
        }

        setConnectionStatus('reconnecting');
        attemptCountRef.current += 1;
        setRetryCount(attemptCountRef.current);

        const delay = calculateBackoffDelay(attemptCountRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            connectSSE();
          }
        }, delay);
      };
    } catch (err) {
      console.warn('[SSE Teacher Social Loop] Error inicializando EventSource:', err);
      setConnectionStatus('reconnecting');
    }
  }, [enabled, teacherId, schoolId, cleanupConnection, calculateBackoffDelay, connectionStatus]);

  // Manejo de montaje, Watchdog y eventos de conectividad del navegador
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      connectSSE();
    }

    // A. Liveness Watchdog: Detecta conexiones zombies si no hay eventos ni ping en 45 segundos
    watchdogIntervalRef.current = setInterval(() => {
      if (!isMountedRef.current || !enabled) return;

      const timeSinceLastHeartbeat = Date.now() - lastHeartbeatRef.current;
      if (timeSinceLastHeartbeat > 45000 && eventSourceRef.current) {
        console.warn(`[SSE Watchdog] Sin latidos en ${Math.round(timeSinceLastHeartbeat / 1000)}s. Forzando reconexión limpia...`);
        connectSSE();
      }
    }, 10000); // Chequeo ligero cada 10 segundos

    // B. Reconexión inmediata cuando la red vuelve a estar online
    const handleOnline = () => {
      console.log('[SSE Network] Red reestablecida (online). Reconectando de inmediato...');
      attemptCountRef.current = 0;
      setRetryCount(0);
      connectSSE();
    };

    const handleOffline = () => {
      console.warn('[SSE Network] Conexión a internet perdida (offline).');
      cleanupConnection();
      setConnectionStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMountedRef.current = false;
      cleanupConnection();

      if (watchdogIntervalRef.current) {
        clearInterval(watchdogIntervalRef.current);
        watchdogIntervalRef.current = null;
      }

      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      setConnectionStatus('disconnected');
    };
  }, [enabled, connectSSE, cleanupConnection]);

  return {
    isConnected: connectionStatus === 'connected',
    connectionStatus,
    latestMilestone,
    clearMilestone,
    retryCount,
    reconnect: () => {
      attemptCountRef.current = 0;
      setRetryCount(0);
      connectSSE();
    }
  };
}
