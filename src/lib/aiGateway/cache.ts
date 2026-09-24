/**
 * @file cache.ts
 * @description Estrategia de Caché Multinivel para Respuestas de IA (L1 Memoria / L2 Supabase).
 * Combina:
 * 1. Nivel L1 (In-Memory LRU Cache): Resolución en <1 ms para peticiones recurrentes de la jornada escolar.
 * 2. Nivel L2 (Persistent Supabase Cache): Almacenamiento duradero en PostgreSQL (tabla ai_response_cache)
 *    con hash SHA-256 e índice único para persistir conocimiento pedagógico entre reinicios y despliegues.
 * Cero impacto destructivo; fallback gracioso a memoria si la red o Supabase no están disponibles.
 */

import crypto from 'crypto';
import { supabase } from '../supabaseClient';

export interface CachedAIResponse {
  key: string;
  output: any;
  raw_text: string;
  model: string;
  tokens_saved: number;
  cached_at: string;
  source?: 'L1_memory' | 'L2_persistent';
}

export interface CacheSetOptions {
  feature?: string;
  schoolId?: string;
  expiresInSeconds?: number;
}

/**
 * Implementación de LRU Cache en Memoria para Nivel L1.
 * O(1) lectura y escritura con desalojo automático del elemento menos recientemente usado.
 */
class InMemoryLRUCache<V> {
  private capacity: number;
  private map: Map<string, V>;

  constructor(capacity: number = 500) {
    this.capacity = capacity;
    this.map = new Map();
  }

  get(key: string): V | undefined {
    if (!this.map.has(key)) return undefined;
    // Mover al final para marcarlo como recientemente usado
    const value = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set(key: string, value: V): void {
    if (this.map.has(key)) {
      this.map.delete(key);
    } else if (this.map.size >= this.capacity) {
      // Desalojar el elemento menos recientemente usado (el primero de la iteración)
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) {
        this.map.delete(oldestKey);
      }
    }
    this.map.set(key, value);
  }

  has(key: string): boolean {
    return this.map.has(key);
  }

  delete(key: string): boolean {
    return this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }

  size(): number {
    return this.map.size;
  }
}

export class AIGatewayCache {
  // L1: Almacén LRU en memoria (Capacidad: 500 entradas frecuentes)
  private static l1Cache = new InMemoryLRUCache<CachedAIResponse>(500);

  // Métricas de telemetría de caché
  private static statsCounters = {
    l1_hits: 0,
    l2_hits: 0,
    misses: 0,
    writes: 0
  };

  /**
   * Genera una clave de caché determinista basada en el hash SHA-256 de los parámetros esenciales.
   */
  static generateKey(feature: string, prompt: string, model: string): string {
    const raw = `${feature}:::${model}:::${prompt.trim()}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  /**
   * Recupera una respuesta previamente calculada consultando primero L1 (Memoria) y luego L2 (Supabase).
   */
  static async get(key: string): Promise<CachedAIResponse | undefined> {
    // 1. Consulta L1 (In-Memory LRU Cache) - Latencia < 1ms
    const l1Hit = this.l1Cache.get(key);
    if (l1Hit) {
      this.statsCounters.l1_hits++;
      return {
        ...l1Hit,
        source: 'L1_memory'
      };
    }

    // 2. Consulta L2 (Persistent Cache en Supabase) si no está en L1
    if (supabase) {
      try {
        // Timeout de seguridad de 1200ms para evitar ralentizar la respuesta si la red está fría
        const queryPromise = supabase
          .from('ai_response_cache')
          .select('cache_key, feature, model, output, raw_text, tokens_saved, cached_at')
          .eq('cache_key', key)
          .maybeSingle();

        const timeoutPromise = new Promise<{ data: null; error: { message: string } }>((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'L2 Cache Timeout' } }), 1200)
        );

        const result: any = await Promise.race([queryPromise, timeoutPromise]);

        if (result?.data && !result?.error) {
          const row = result.data;
          const cachedItem: CachedAIResponse = {
            key: row.cache_key,
            output: row.output,
            raw_text: row.raw_text,
            model: row.model,
            tokens_saved: row.tokens_saved || 0,
            cached_at: row.cached_at || new Date().toISOString(),
            source: 'L2_persistent'
          };

          // Promover a L1 para que las lecturas subsiguientes sean < 1ms
          this.l1Cache.set(key, cachedItem);
          this.statsCounters.l2_hits++;
          return cachedItem;
        }
      } catch {
        // En caso de falla en Supabase o timeout, degradar de forma segura a miss
      }
    }

    this.statsCounters.misses++;
    return undefined;
  }

  /**
   * Versión síncrona que consulta exclusivamente L1 (para retrocompatibilidad).
   */
  static getSync(key: string): CachedAIResponse | undefined {
    const l1Hit = this.l1Cache.get(key);
    if (l1Hit) {
      this.statsCounters.l1_hits++;
      return { ...l1Hit, source: 'L1_memory' };
    }
    return undefined;
  }

  /**
   * Guarda una respuesta en caché escribiendo inmediatamente en L1 y persistiendo en L2 (Supabase).
   */
  static async set(
    key: string,
    data: Omit<CachedAIResponse, 'key' | 'cached_at' | 'source'>,
    options?: CacheSetOptions
  ): Promise<void> {
    const nowIso = new Date().toISOString();
    const entry: CachedAIResponse = {
      ...data,
      key,
      cached_at: nowIso,
      source: 'L1_memory'
    };

    // 1. Guardar de inmediato en L1 (LRU Memory)
    this.l1Cache.set(key, entry);
    this.statsCounters.writes++;

    // 2. Persistir en L2 (Supabase PostgreSQL) de forma asíncrona no bloqueante
    if (supabase) {
      try {
        await supabase.from('ai_response_cache').upsert({
          cache_key: key,
          feature: options?.feature || 'general_academic',
          school_id: options?.schoolId || null,
          model: data.model,
          output: data.output,
          raw_text: data.raw_text,
          tokens_saved: data.tokens_saved,
          cached_at: nowIso,
          updated_at: nowIso
        });
      } catch {
        // Degradar silenciosamente si la tabla aún no existe o hay desconexión
      }
    }
  }

  /**
   * Versión síncrona que guarda en L1 y dispara persistencia L2 en segundo plano.
   */
  static setSync(
    key: string,
    data: Omit<CachedAIResponse, 'key' | 'cached_at' | 'source'>,
    options?: CacheSetOptions
  ): void {
    const nowIso = new Date().toISOString();
    const entry: CachedAIResponse = {
      ...data,
      key,
      cached_at: nowIso,
      source: 'L1_memory'
    };

    this.l1Cache.set(key, entry);
    this.statsCounters.writes++;

    if (supabase) {
      supabase.from('ai_response_cache').upsert({
        cache_key: key,
        feature: options?.feature || 'general_academic',
        school_id: options?.schoolId || null,
        model: data.model,
        output: data.output,
        raw_text: data.raw_text,
        tokens_saved: data.tokens_saved,
        cached_at: nowIso,
        updated_at: nowIso
      }).then(() => {}).catch(() => {});
    }
  }

  static clear(): void {
    this.l1Cache.clear();
  }

  static size(): number {
    return this.l1Cache.size();
  }

  static getStats() {
    return {
      ...this.statsCounters,
      l1_current_size: this.l1Cache.size()
    };
  }
}
