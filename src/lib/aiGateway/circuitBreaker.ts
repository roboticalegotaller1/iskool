/**
 * @file circuitBreaker.ts
 * @description Interruptor de Circuito de Resiliencia para Proveedores de IA (Ítem #27).
 * Previene la sobrecarga de solicitudes cuando el motor externo experimenta fallos repetidos o latencia excesiva,
 * habilitando la degradación elegante y protegiendo la disponibilidad de la plataforma.
 */

import { CircuitBreakerStatus } from './types';

export class AIGatewayCircuitBreaker {
  private static status: CircuitBreakerStatus = 'closed';
  private static failureCount = 0;
  private static lastFailureTime: number | null = null;
  private static readonly FAILURE_THRESHOLD = 3;
  private static readonly COOLDOWN_MS = 15_000; // 15 segundos

  /**
   * Determina si se puede despachar una petición al proveedor externo.
   */
  static canExecute(): { allowed: boolean; status: CircuitBreakerStatus; reason?: string } {
    const now = Date.now();

    if (this.status === 'open') {
      if (this.lastFailureTime && now - this.lastFailureTime > this.COOLDOWN_MS) {
        // Pasar a semi-abierto para probar con una llamada exploratoria
        this.status = 'half_open';
        return { allowed: true, status: 'half_open' };
      }
      return {
        allowed: false,
        status: 'open',
        reason: 'Circuit Breaker ABIERTO: El proveedor de IA ha experimentado fallas continuas. Se activa modo de degradación local.'
      };
    }

    return { allowed: true, status: this.status };
  }

  /**
   * Registra una respuesta exitosa, reseteando el circuito a estado CERRADO.
   */
  static recordSuccess(): void {
    this.failureCount = 0;
    this.status = 'closed';
    this.lastFailureTime = null;
  }

  /**
   * Registra un error en la inferencia, evaluando si debe abrirse el circuito.
   */
  static recordFailure(): void {
    this.failureCount++;
    this.lastFailureTime = Date.now();

    if (this.failureCount >= this.FAILURE_THRESHOLD || this.status === 'half_open') {
      this.status = 'open';
    }
  }

  /**
   * Fuerza el estado del interruptor (útil para pruebas unitarias de contingencia).
   */
  static forceState(status: CircuitBreakerStatus): void {
    this.status = status;
    if (status === 'open') this.lastFailureTime = Date.now();
  }

  static getStatus(): CircuitBreakerStatus {
    return this.status;
  }

  static getState(): CircuitBreakerStatus {
    return this.getStatus();
  }

  static reset(): void {
    this.status = 'closed';
    this.failureCount = 0;
    this.lastFailureTime = null;
  }
}
