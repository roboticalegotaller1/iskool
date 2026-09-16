/**
 * @file broadcastSync.ts
 * @description Módulo de sincronización multi-pestaña en tiempo real para Zustand vía BroadcastChannel API.
 * 
 * Permite que los cambios de estado (XP ganada, avatar equipado, compras en tienda, misiones completadas)
 * se propaguen instantáneamente a todas las pestañas abiertas en el navegador del alumno o docente
 * sin requerir recargar la página (F5) y con protección total contra bucles infinitos de rebote.
 */

export interface StoreSyncMessage {
  storeName: string;
  senderTabId: string;
  timestamp: number;
  payload: Record<string, any>;
}

// Identificador único de la pestaña actual en memoria
const CURRENT_TAB_ID = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
  ? crypto.randomUUID()
  : `tab_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;

const CHANNEL_NAME = 'iskool_cross_tab_sync_channel';

// Instancia compartida del canal de comunicación entre pestañas
let syncChannel: BroadcastChannel | null = null;
const listeners = new Map<string, Set<(payload: Record<string, any>) => void>>();

/**
 * Inicializa el canal de Broadcast si se encuentra en entorno de navegador
 */
function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === 'undefined' || typeof BroadcastChannel === 'undefined') {
    return null;
  }

  if (!syncChannel) {
    try {
      syncChannel = new BroadcastChannel(CHANNEL_NAME);
      syncChannel.onmessage = (event: MessageEvent<StoreSyncMessage>) => {
        handleIncomingMessage(event.data);
      };
      syncChannel.onmessageerror = (err) => {
        console.warn('[BroadcastSync] Error en mensaje de canal:', err);
      };
    } catch (err) {
      console.warn('[BroadcastSync] BroadcastChannel no disponible en este entorno:', err);
      return null;
    }
  }

  return syncChannel;
}

/**
 * Procesa mensajes entrantes desde otras pestañas
 */
function handleIncomingMessage(message: StoreSyncMessage) {
  if (!message || typeof message !== 'object') return;

  // 1. Descartar mensajes emitidos por la misma pestaña para evitar bucles infinitos
  if (message.senderTabId === CURRENT_TAB_ID) {
    return;
  }

  // 2. Descartar mensajes con más de 10 segundos de antigüedad (anticuados)
  if (Date.now() - message.timestamp > 10000) {
    return;
  }

  // 3. Notificar a los suscriptores registrados para la store específica
  const storeListeners = listeners.get(message.storeName);
  if (storeListeners && storeListeners.size > 0) {
    storeListeners.forEach((callback) => {
      try {
        callback(message.payload);
      } catch (err) {
        console.error(`[BroadcastSync] Error actualizando store "${message.storeName}":`, err);
      }
    });
  }
}

/**
 * Emite un cambio de estado hacia todas las demás pestañas abiertas
 */
export function broadcastStoreChange(storeName: string, payload: Record<string, any>): void {
  if (typeof window === 'undefined') return;

  const channel = getBroadcastChannel();
  if (!channel) return;

  const message: StoreSyncMessage = {
    storeName,
    senderTabId: CURRENT_TAB_ID,
    timestamp: Date.now(),
    payload
  };

  try {
    channel.postMessage(message);
  } catch (err) {
    console.warn(`[BroadcastSync] Fallo al emitir cambio para "${storeName}":`, err);
  }
}

/**
 * Suscribe una store de Zustand para recibir actualizaciones desde otras pestañas
 * Retorna una función de limpieza para cancelar la suscripción.
 */
export function subscribeToStoreSync(
  storeName: string,
  onSync: (payload: Record<string, any>) => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  // Asegurar canal activo
  getBroadcastChannel();

  if (!listeners.has(storeName)) {
    listeners.set(storeName, new Set());
  }

  const storeListeners = listeners.get(storeName)!;
  storeListeners.add(onSync);

  return () => {
    storeListeners.delete(onSync);
    if (storeListeners.size === 0) {
      listeners.delete(storeName);
    }
  };
}

/**
 * Retorna el ID de la pestaña actual (útil para pruebas y telemetría)
 */
export function getCurrentTabId(): string {
  return CURRENT_TAB_ID;
}

/**
 * Helper para pruebas: restablece listeners y canal
 */
export function resetBroadcastSyncForTesting(): void {
  listeners.clear();
  if (syncChannel) {
    try {
      syncChannel.close();
    } catch (_) {}
    syncChannel = null;
  }
}
