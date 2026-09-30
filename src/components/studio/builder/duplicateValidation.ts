import { StudioBlock, FlowConnection } from '@/types/studioBlocks';

export interface DuplicateNodesConflict {
  nodeA: StudioBlock;
  nodeB: StudioBlock;
  relationship: 'connected' | 'consecutive';
  reason: string;
}

/**
 * Normaliza los datos pedagógicos de un bloque para comparación semántica pura,
 * ignorando identificadores aleatorios, posiciones visuales y fechas.
 */
function normalizeBlockPayload(block: StudioBlock): Record<string, any> {
  const data = (block.data || {}) as Record<string, any>;
  const cleanData: Record<string, any> = {};

  for (const [key, val] of Object.entries(data)) {
    if (['id', 'nodeId', 'position', 'timestamp', 'created_at', 'updated_at'].includes(key)) {
      continue;
    }
    cleanData[key] = val;
  }

  return cleanData;
}

/**
 * Determina si dos bloques contienen exactamente la misma información.
 */
export function areBlocksIdentical(blockA: StudioBlock, blockB: StudioBlock): boolean {
  if (!blockA || !blockB) return false;
  if (blockA.id === blockB.id) return false;
  if (blockA.type !== blockB.type) return false;

  const titleA = (blockA.title || '').trim().toLowerCase();
  const titleB = (blockB.title || '').trim().toLowerCase();

  const payloadA = normalizeBlockPayload(blockA);
  const payloadB = normalizeBlockPayload(blockB);

  // Comparación canónica de datos
  const strA = JSON.stringify(payloadA);
  const strB = JSON.stringify(payloadB);

  if (strA === strB) {
    return true;
  }

  // Verificaciones específicas por tipo de bloque

  // 1. Pregunta Quiz
  if (blockA.type === 'quiz_question') {
    const qA = String((blockA.data as any)?.question || '').trim().toLowerCase();
    const qB = String((blockB.data as any)?.question || '').trim().toLowerCase();
    if (qA && qB && qA === qB) {
      return true;
    }
  }

  // 2. Texto Narrativo
  if (blockA.type === 'text_narrative') {
    const textA = String((blockA.data as any)?.content || (blockA.data as any)?.text || '').trim().toLowerCase();
    const textB = String((blockB.data as any)?.content || (blockB.data as any)?.text || '').trim().toLowerCase();
    if (textA && textB && textA === textB) {
      return true;
    }
  }

  // 3. Lectura con Tiempo
  if (blockA.type === 'timed_reading_block') {
    const readA = String((blockA.data as any)?.readingText || '').trim().toLowerCase();
    const readB = String((blockB.data as any)?.readingText || '').trim().toLowerCase();
    if (readA && readB && readA === readB) {
      return true;
    }
  }

  // 4. Video de YouTube / Multimedia
  if (blockA.type === 'youtube_video') {
    const urlA = String((blockA.data as any)?.videoUrl || (blockA.data as any)?.url || '').trim().toLowerCase();
    const urlB = String((blockB.data as any)?.videoUrl || (blockB.data as any)?.url || '').trim().toLowerCase();
    if (urlA && urlB && urlA === urlB) {
      return true;
    }
  }

  // 5. Boss Enemy / Reto Gamificado
  if (blockA.type === 'boss_enemy') {
    const bossA = String((blockA.data as any)?.bossName || '').trim().toLowerCase();
    const bossB = String((blockB.data as any)?.bossName || '').trim().toLowerCase();
    if (bossA && bossB && bossA === bossB) {
      return true;
    }
  }

  // 6. Cofre de Recompensas
  if (blockA.type === 'reward_chest') {
    const rA = `${(blockA.data as any)?.xpReward || 0}_${(blockA.data as any)?.coinsReward || 0}`;
    const rB = `${(blockB.data as any)?.xpReward || 0}_${(blockB.data as any)?.coinsReward || 0}`;
    if (rA === rB && titleA === titleB) {
      return true;
    }
  }

  // Si ambos títulos son exactamente idénticos y no son genéricos
  if (titleA && titleB && titleA === titleB && titleA.length >= 4) {
    return true;
  }

  return false;
}

/**
 * Detecta si existen nodos contiguos (conectados directamente o adyacentes en la secuencia)
 * que contengan exactamente la misma información.
 */
export function detectDuplicateAdjacentNodes(
  blocks: StudioBlock[],
  connections: FlowConnection[]
): DuplicateNodesConflict[] {
  if (!blocks || blocks.length < 2) return [];

  const conflicts: DuplicateNodesConflict[] = [];
  const processedPairKeys = new Set<string>();

  // 1. Validar conexiones directas (de source a target)
  (connections || []).forEach(conn => {
    const fromId = conn.sourceNodeId;
    const toId = conn.targetNodeId;
    if (!fromId || !toId) return;

    const key = [fromId, toId].sort().join('<->');
    if (processedPairKeys.has(key)) return;
    processedPairKeys.add(key);

    const nodeA = blocks.find(b => b.id === fromId);
    const nodeB = blocks.find(b => b.id === toId);

    if (nodeA && nodeB && areBlocksIdentical(nodeA, nodeB)) {
      conflicts.push({
        nodeA,
        nodeB,
        relationship: 'connected',
        reason: `Los nodos "${nodeA.title}" y "${nodeB.title}" están enlazados directamente en el flujo y contienen información idéntica.`
      });
    }
  });

  // 2. Validar adyacencia consecutiva en la lista ordenada
  for (let i = 0; i < blocks.length - 1; i++) {
    const nodeA = blocks[i];
    const nodeB = blocks[i + 1];
    const key = [nodeA.id, nodeB.id].sort().join('<->');

    if (!processedPairKeys.has(key)) {
      processedPairKeys.add(key);
      if (areBlocksIdentical(nodeA, nodeB)) {
        conflicts.push({
          nodeA,
          nodeB,
          relationship: 'consecutive',
          reason: `Los nodos contiguos #${i + 1} ("${nodeA.title}") y #${i + 2} ("${nodeB.title}") repiten exactamente la misma información en la secuencia didáctica.`
        });
      }
    }
  }

  return conflicts;
}
