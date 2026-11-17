import { createClient, SupabaseClient } from '@supabase/supabase-js';

const globalForServerDb = globalThis as unknown as {
  _iskoolServiceDbClient?: SupabaseClient;
};

/**
 * Cliente singleton de servidor con privilegios administrativos para rutas API y servicios Node.js.
 * Reutiliza la conexión en entornos Serverless para evitar saturar el pool de PostgreSQL.
 */
export function getServiceSupabaseClient(): SupabaseClient {
  if (!globalForServerDb._iskoolServiceDbClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'placeholder-key';

    globalForServerDb._iskoolServiceDbClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-application-name': 'iskool-server-core',
          'x-connection-mode': 'pooled',
        },
      },
    });
  }

  return globalForServerDb._iskoolServiceDbClient;
}
