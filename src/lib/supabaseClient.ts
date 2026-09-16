import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Patrón Singleton con soporte para Connection Pooling en entornos Serverless y Edge de Next.js.
 * Previene la saturación del pool de conexiones de la base de datos PostgreSQL bajo alta concurrencia
 * al reutilizar la misma instancia compartida a través de globalThis.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Declaración de variable global para el caché de cliente Singleton
const globalForSupabase = globalThis as unknown as {
  _iskoolSupabaseClient?: SupabaseClient;
};

export function getSupabaseClient(): SupabaseClient {
  if (!globalForSupabase._iskoolSupabaseClient) {
    const isServer = typeof window === 'undefined';

    globalForSupabase._iskoolSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // En el servidor, desactivar persistencia local y auto-refresco para evitar retención innecesaria de sockets
        persistSession: !isServer,
        autoRefreshToken: !isServer,
        detectSessionInUrl: !isServer,
      },
      global: {
        headers: {
          'x-application-name': 'iskool-academic-core',
          'x-connection-mode': isServer ? 'pooled' : 'standard',
        },
      },
    });
  }

  return globalForSupabase._iskoolSupabaseClient;
}

// Instancia única exportada para compatibilidad directa con todo el código base
export const supabase = getSupabaseClient();
