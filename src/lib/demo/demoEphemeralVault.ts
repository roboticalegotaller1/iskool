/**
 * Almacén Efímero en Memoria para Cuentas Demo (Cero Escritura en Bóveda Curricular).
 * Mantiene los cambios simulados por evaluadores únicamente en RAM durante la sesión activa.
 */

export type EphemeralVaultItemKind =
  | 'planning'
  | 'protocol'
  | 'historical_qa'
  | 'mail'
  | 'memory'
  | 'reconcile'
  | 'reassign'
  | 'curriculum_import';

export interface EphemeralVaultEntry {
  id: string;
  kind: EphemeralVaultItemKind;
  actorEmail: string;
  title: string;
  payload: Record<string, unknown>;
  createdAt: string;
  expiresAt: number;
}

const MAX_EPHEMERAL_ENTRIES = 100;
const TTL_MS = 2 * 60 * 60 * 1000;

declare global {
  // eslint-disable-next-line no-var
  var __iskoolDemoEphemeralVault: EphemeralVaultEntry[] | undefined;
}

function getBucket(): EphemeralVaultEntry[] {
  if (!globalThis.__iskoolDemoEphemeralVault) {
    globalThis.__iskoolDemoEphemeralVault = [];
  }
  const now = Date.now();
  globalThis.__iskoolDemoEphemeralVault = globalThis.__iskoolDemoEphemeralVault.filter(
    (entry) => entry.expiresAt > now
  );
  return globalThis.__iskoolDemoEphemeralVault;
}

export function recordEphemeralVaultItem(
  kind: EphemeralVaultItemKind,
  params: {
    actorEmail?: string | null;
    title?: string;
    payload?: Record<string, unknown>;
  }
): EphemeralVaultEntry {
  const bucket = getBucket();
  const entry: EphemeralVaultEntry = {
    id: `demo-eph-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    kind,
    actorEmail: (params.actorEmail || 'demo@iskool.mx').toLowerCase(),
    title: params.title || `Acción Demo (${kind})`,
    payload: params.payload || {},
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + TTL_MS,
  };
  bucket.unshift(entry);
  if (bucket.length > MAX_EPHEMERAL_ENTRIES) {
    bucket.length = MAX_EPHEMERAL_ENTRIES;
  }
  return entry;
}

export function listEphemeralVaultItems(kind?: EphemeralVaultItemKind): EphemeralVaultEntry[] {
  const bucket = getBucket();
  return kind ? bucket.filter((e) => e.kind === kind) : [...bucket];
}

export function clearEphemeralVaultItems(): void {
  globalThis.__iskoolDemoEphemeralVault = [];
}
