/**
 * @file simulator_bridge.js
 * @description ISkool Simulator & Canvas Game Cryptographic Bridge SDK (v3.1)
 * 
 * Biblioteca universal cliente para simuladores, lienzos digitales y juegos Pixi.js/Canvas.
 * Facilita el handshake criptográfico con Next.js y el registro de telemetría de alta precisión
 * para erradicar la manipulación por consola y ataques de replay.
 */

(function(window) {
  'use strict';

  var currentSessionToken = null;
  var sessionDifficulty = 'medium';
  var startTime = null;
  var interactionsCount = 0;
  var userActionLogs = [];
  var parentOrigin = '*'; // Se restringe al recibir el handshake
  var isCompleted = false;

  /**
   * Registrador automático de eventos de interacción física (clics, toques, pulsaciones de teclas)
   */
  function registerPhysicalInteraction(type) {
    if (isCompleted) return;
    interactionsCount++;
    var now = performance.now();
    var elapsedSeconds = startTime ? (now - startTime) / 1000 : 0;

    // Registrar últimas 50 acciones con timestamp relativo
    if (userActionLogs.length < 50) {
      userActionLogs.push({
        type: type,
        t: Math.round(elapsedSeconds * 100) / 100
      });
    }
  }

  // Capturar eventos de mouse y touch en fase de captura (sin interferir con el canvas)
  window.addEventListener('click', function() { registerPhysicalInteraction('click'); }, true);
  window.addEventListener('touchstart', function() { registerPhysicalInteraction('touch'); }, true);
  window.addEventListener('keydown', function(e) {
    // Teclas de interacción de juegos (flechas, espacio, WASD)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'KeyW', 'KeyA', 'KeyS', 'KeyD'].includes(e.code)) {
      registerPhysicalInteraction('key');
    }
  }, true);

  /**
   * Escuchador de Handshake Criptográfico desde la ventana padre de Next.js
   */
  window.addEventListener('message', function(event) {
    if (!event.data || typeof event.data !== 'object') return;

    // Handshake de inicio de sesión con token firmado
    if (event.data.type === 'INIT_GAME_SESSION') {
      currentSessionToken = event.data.sessionToken;
      sessionDifficulty = event.data.difficulty || 'medium';
      parentOrigin = event.origin || '*';
      startTime = performance.now();
      interactionsCount = 0;
      userActionLogs = [];
      isCompleted = false;

      // Confirmar recepción a la ventana padre
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({
          type: 'GAME_SESSION_ACKNOWLEDGED',
          sessionId: event.data.sessionId,
          status: 'READY'
        }, parentOrigin);
      }
    }
  });

  /**
   * API Pública del Bridge para Simuladores y Juegos Canvas / Pixi.js
   */
  window.ISkoolSimulatorBridge = {
    /**
     * Inicializa manualmente la sesión si no se usó postMessage
     */
    init: function(token, difficulty) {
      currentSessionToken = token;
      sessionDifficulty = difficulty || 'medium';
      startTime = performance.now();
      interactionsCount = 0;
      userActionLogs = [];
      isCompleted = false;
    },

    /**
     * Permite registrar interacciones específicas desde la lógica del juego (ej. colisiones, piezas ensambladas)
     */
    recordAction: function(actionName) {
      registerPhysicalInteraction(actionName || 'custom_action');
    },

    /**
     * Obtiene la telemetría actual transcurrida
     */
    getTelemetry: function() {
      var now = performance.now();
      var elapsed = startTime ? (now - startTime) / 1000 : 0;
      return {
        timeSpentSeconds: Math.round(elapsed * 10) / 10,
        interactionCount: interactionsCount,
        actions: userActionLogs.slice()
      };
    },

    /**
     * Emite la finalización segura de la actividad hacia la ventana padre de Next.js
     * Incluye el token de sesión y la telemetría para validación en el servidor.
     */
    complete: function(score, metadata) {
      if (isCompleted) {
        console.warn('[ISkool Bridge] La actividad ya fue marcada como completada para esta sesión.');
        return false;
      }

      var now = performance.now();
      var elapsedSeconds = startTime ? (now - startTime) / 1000 : 0;
      var normalizedScore = Math.min(100, Math.max(0, Number(score) || 100));

      var payload = {
        type: 'SIMULATOR_COMPLETE',
        sessionToken: currentSessionToken,
        score: normalizedScore,
        timeSpentSeconds: Math.round(elapsedSeconds * 10) / 10,
        interactionCount: Math.max(interactionsCount, 1),
        userActions: userActionLogs,
        metadata: metadata || {}
      };

      isCompleted = true;

      // Enviar a la ventana padre mediante postMessage
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(payload, parentOrigin === '*' ? '*' : parentOrigin);
        return true;
      } else {
        console.warn('[ISkool Bridge] No se detectó ventana padre de Next.js. Modo autónomo.');
        return false;
      }
    },

    /**
     * Indica si hay una sesión activa iniciada con token
     */
    hasActiveSession: function() {
      return Boolean(currentSessionToken && startTime);
    }
  };

  // Autonotificar a la ventana padre que el iframe está montado y listo para recibir handshake
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({ type: 'SIMULATOR_IFRAME_READY' }, '*');
    } catch (_) {}
  }
})(window);
